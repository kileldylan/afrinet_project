import json
import uuid
import os
import logging
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db import DatabaseError
from datetime import timedelta
import requests
from dotenv import load_dotenv
from afrinet.models import Payment, User, Session, Package
from .services import MpesaService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def normalize_phone(phone):
    """Normalize phone number to 254xxxxxxxxx format."""
    phone = phone.strip()
    if phone.startswith("07"):
        return "254" + phone[1:]
    elif phone.startswith("+"):
        return phone[1:]
    elif phone.startswith("254"):
        return phone
    elif phone.startswith("0"):
        return "254" + phone[1:]
    return "254" + phone

@csrf_exempt
def stk_push(request):
    """Initiate M-Pesa STK Push payment."""
    if request.method != "POST":
        logger.error("Non-POST request to stk_push endpoint")
        return JsonResponse({"success": False, "message": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
        logger.info(f"stk_push request: {json.dumps(data, indent=2)}")
        phone_number = normalize_phone(data.get("phone_number"))
        amount = data.get("amount")
        account_reference = data.get("account_reference", "WIFI_PAYMENT")
        transaction_desc = data.get("transaction_desc", "Wifi Package Payment")
        package_id = data.get("package_id")  # Optional

        if not phone_number or not amount:
            logger.error("Missing phone_number or amount in stk_push request")
            return JsonResponse({"success": False, "message": "Missing required fields"}, status=400)

        # Find or create user
        user, created = User.objects.get_or_create(
            phone_number=phone_number,
            defaults={'created_at': timezone.now()}
        )
        logger.info(f"User {'created' if created else 'retrieved'}: {phone_number}")

        # Find package
        package = None
        if package_id:
            package = Package.objects.filter(package_id=package_id).first()
        if not package:
            package = Package.objects.filter(price=amount).first()

        if not package:
            logger.error(f"No package found for amount {amount} or package_id {package_id}")
            return JsonResponse({"success": False, "message": "No package found for the specified amount or package ID"}, status=400)

        # Update user's package
        if user.package != package:
            user.package = package
            user.save()
            logger.info(f"Updated user package to {package.package_id}")

        # Initiate STK Push
        response = MpesaService.initiate_stk_push(
            phone_number=phone_number,
            amount=amount,
            account_reference=account_reference,
            transaction_desc=transaction_desc
        )
        logger.info(f"MpesaService.initiate_stk_push response: {json.dumps(response, indent=2)}")

        if response.get("success"):
            # Create Payment object with pending status
            payment = Payment.objects.create(
                user=user,
                amount=amount,
                phone_number=phone_number,
                package=package,
                transaction_id=response.get("checkout_request_id"),
                status="pending",
                is_finished=False,
                is_successful=False,
                created_at=timezone.now()
            )
            logger.info(f"Payment created: transaction_id={payment.transaction_id}")
            return JsonResponse({
                "success": True,
                "checkout_request_id": payment.transaction_id,
                "message": "STK Push initiated successfully"
            })
        else:
            logger.error(f"STK Push failed: {response.get('message')}")
            return JsonResponse(response, status=400)

    except json.JSONDecodeError:
        logger.error("Invalid JSON in stk_push request")
        return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.exception(f"Error in stk_push: {str(e)}")
        return JsonResponse({"success": False, "message": str(e)}, status=500)

@csrf_exempt
def callback(request):
    """Handle M-Pesa STK Push callback and create session."""
    if request.method != "POST":
        logger.error("Non-POST request to callback endpoint")
        return HttpResponse(status=405)

    try:
        callback_data = json.loads(request.body)
        logger.info(f"Callback received: {json.dumps(callback_data, indent=2)}")

        # Try both stkCallback and stk_callback keys
        callback = callback_data.get("Body", {}).get("stkCallback", None)
        if callback is None:
            callback = callback_data.get("Body", {}).get("stk_callback", {})
            logger.warning("Using 'stk_callback' key instead of 'stkCallback' in callback payload")

        if not callback:
            logger.error("Invalid callback: missing stkCallback or stk_callback in Body")
            return HttpResponse(status=400)

        result_code = callback.get("ResultCode")
        transaction_id = callback.get("CheckoutRequestID")
        result_desc = callback.get("ResultDesc")

        if not transaction_id:
            logger.error("Invalid callback: missing CheckoutRequestID")
            return HttpResponse(status=400)

        # Extract metadata if payment was successful
        mpesa_receipt = None
        phone_number = None
        amount = None
        if result_code == 0 and "CallbackMetadata" in callback:
            metadata_items = callback["CallbackMetadata"]["Item"]
            metadata = {item["Name"]: item.get("Value") for item in metadata_items}
            mpesa_receipt = metadata.get("MpesaReceiptNumber")
            phone_number = str(metadata.get("PhoneNumber"))
            amount = metadata.get("Amount")
            logger.info(f"Callback metadata: receipt={mpesa_receipt}, phone={phone_number}, amount={amount}")

        # Find Payment
        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for transaction_id={transaction_id}")
            return HttpResponse(status=404)

        # Skip if payment is already finished
        if payment.is_finished:
            logger.info(f"Payment already processed: transaction_id={transaction_id}, status={payment.status}")
            return HttpResponse(status=200)

        # Update Payment
        payment.is_finished = True
        payment.is_successful = (result_code == 0)
        payment.status = "completed" if result_code == 0 else "failed"
        payment.completed_at = timezone.now()
        if result_code == 0 and mpesa_receipt:
            payment.mpesa_receipt = mpesa_receipt
            payment.phone_number = normalize_phone(phone_number or payment.phone_number)
        payment.save()
        logger.info(f"Payment updated: transaction_id={transaction_id}, status={payment.status}")

        # Create Session for successful payment
        if result_code == 0:
            try:
                # Check for existing session
                existing_session = Session.objects.filter(payment=payment).first()
                if existing_session:
                    logger.info(f"Session already exists: session_id={existing_session.session_id}")
                    return HttpResponse(status=200)

                # Validate package
                if not payment.package:
                    logger.error(f"No package associated with payment: transaction_id={transaction_id}")
                    return HttpResponse(status=500)

                # Create new session
                session = Session.objects.create(
                    session_id=uuid.uuid4(),
                    user=payment.user,
                    package=payment.package,
                    payment=payment,
                    phone_number=payment.phone_number,
                    voucher_code=mpesa_receipt,
                    created_at=timezone.now(),
                    end_time=timezone.now() + timedelta(minutes=payment.package.duration_minutes),
                    duration_minutes=payment.package.duration_minutes,
                    status="active"
                )
                logger.info(f"Session created: session_id={session.session_id}, end_time={session.end_time}")
            except DatabaseError as e:
                logger.exception(f"Failed to create session for transaction_id={transaction_id}: {str(e)}")
                return HttpResponse(status=500)
        else:
            logger.warning(f"Payment failed: transaction_id={transaction_id}, result_desc={result_desc}")

        return HttpResponse(status=200)

    except json.JSONDecodeError:
        logger.error("Invalid JSON in callback request")
        return HttpResponse(status=400)
    except Exception as e:
        logger.exception(f"Error in callback: {str(e)}")
        return HttpResponse(status=500)

@csrf_exempt
def verify_session(request):
    """Verify payment and return or create session, with fallback query."""
    if request.method != "POST":
        logger.error("Non-POST request to verify_session endpoint")
        return JsonResponse({"success": False, "message": "POST method required"}, status=405)

    try:
        data = json.loads(request.body)
        logger.info(f"verify_session request: {json.dumps(data, indent=2)}")
        checkout_id = data.get("transaction_id")
        phone_number = normalize_phone(data.get("phone_number"))

        if not checkout_id or not phone_number:
            logger.error("Missing transaction_id or phone_number in verify_session request")
            return JsonResponse({"success": False, "message": "Checkout ID and phone number are required"}, status=400)

        # Find Payment
        payment = Payment.objects.filter(
            transaction_id=checkout_id,
            phone_number=phone_number
        ).first()

        if not payment:
            logger.error(f"Payment not found: transaction_id={checkout_id}, phone_number={phone_number}")
            return JsonResponse({"success": False, "message": "Payment not found"}, status=404)

        # Fallback: Query M-Pesa if payment is pending and older than 30 seconds
        if payment.status == "pending" and not payment.is_finished and (timezone.now() - payment.created_at).total_seconds() > 30:
            logger.info(f"Payment pending for >30s, querying M-Pesa: transaction_id={checkout_id}")
            try:
                query_response = MpesaService.query_transaction(checkout_id)
                logger.info(f"M-Pesa query response: {json.dumps(query_response, indent=2)}")
                if query_response.get("success") and query_response.get("ResultCode") == 0:
                    payment.status = "completed"
                    payment.is_successful = True
                    payment.is_finished = True
                    payment.completed_at = timezone.now()
                    payment.mpesa_receipt = query_response.get("MpesaReceiptNumber")
                    payment.phone_number = normalize_phone(query_response.get("PhoneNumber", payment.phone_number))
                    payment.save()
                    logger.info(f"Payment updated via query: transaction_id={checkout_id}, status=completed")
                elif query_response.get("ResultCode") != 0:
                    payment.status = "failed"
                    payment.is_finished = True
                    payment.is_successful = False
                    payment.completed_at = timezone.now()
                    payment.save()
                    logger.info(f"Payment marked failed via query: transaction_id={checkout_id}")
            except Exception as e:
                logger.exception(f"Failed to query M-Pesa for transaction_id={checkout_id}: {str(e)}")

        # Handle completed payment
        if payment.status == "completed" and payment.is_successful:
            # Check for existing session
            session = Session.objects.filter(payment=payment).first()
            if session:
                logger.info(f"Session found: session_id={session.session_id}")
                return JsonResponse({
                    "success": True,
                    "message": "Session already exists",
                    "session_id": str(session.session_id),
                    "end_time": session.end_time.isoformat()
                })

            # Validate package
            if not payment.package:
                logger.error(f"No package associated with payment: transaction_id={checkout_id}")
                return JsonResponse({"success": False, "message": "No package associated with payment"}, status=500)

            # Create new session
            try:
                session = Session.objects.create(
                    session_id=uuid.uuid4(),
                    user=payment.user,
                    package=payment.package,
                    payment=payment,
                    phone_number=payment.phone_number,
                    voucher_code=payment.mpesa_receipt,
                    created_at=timezone.now(),
                    end_time=timezone.now() + timedelta(minutes=payment.package.duration_minutes),
                    duration_minutes=payment.package.duration_minutes,
                    status="active"
                )
                logger.info(f"Session created in verify_session: session_id={session.session_id}")
                return JsonResponse({
                    "success": True,
                    "message": "Session created successfully",
                    "session_id": str(session.session_id),
                    "end_time": session.end_time.isoformat()
                })
            except DatabaseError as e:
                logger.exception(f"Failed to create session in verify_session: {str(e)}")
                return JsonResponse({"success": False, "message": "Failed to create session"}, status=500)

        logger.info(f"Payment not completed: transaction_id={checkout_id}, status={payment.status}")
        return JsonResponse({
            "success": False,
            "message": "Payment still processing",
            "status": payment.status
        })

    except json.JSONDecodeError:
        logger.error("Invalid JSON in verify_session request")
        return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.exception(f"Error in verify_session: {str(e)}")
        return JsonResponse({"success": False, "message": str(e)}, status=500)

@csrf_exempt
def register_url(request):
    """Register M-Pesa callback URLs."""
    try:
        access_token = MpesaService.get_access_token()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        payload = {
            "ShortCode": os.getenv("MPESA_SHORTCODE"),
            "ResponseType": "Completed",
            "ConfirmationURL": os.getenv("MPESA_CALLBACK_URL") + "/mpesa/callback/",
            "ValidationURL": os.getenv("MPESA_CALLBACK_URL") + "/mpesa/callback/"
        }
        url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
        response = requests.post(url, json=payload, headers=headers)
        logger.info(f"Register URL response: {json.dumps(response.json(), indent=2)}")
        return JsonResponse(response.json())
    except Exception as e:
        logger.exception(f"Error in register_url: {str(e)}")
        return JsonResponse({"success": False, "message": str(e)}, status=500)