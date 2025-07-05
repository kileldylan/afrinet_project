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
    """Safely normalize phone number to 254xxxxxxxxx format."""
    if not phone:
        raise ValueError("Phone number cannot be empty")
    
    phone = str(phone).strip()
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
        logger.info(f"STK push request received: {data}")
        
        # Standardized phone handling - accepts both but prefers 'phone'
        raw_phone = data.get("phone") or data.get("phone_number")
        if not raw_phone:
            return JsonResponse({"success": False, "message": "Phone number is required"}, status=400)
        
        try:
            phone = normalize_phone(raw_phone)
        except ValueError as e:
            return JsonResponse({"success": False, "message": str(e)}, status=400)

        amount = data.get("amount")
        package_id = data.get("package_id")

        if not amount:
            return JsonResponse({"success": False, "message": "Amount is required"}, status=400)

        # Find or create user using standardized phone field
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={
                'created_at': timezone.now(),
                'username': f"user{phone[-4:]}",  # Temporary username
                'user_type': 'hotspot'
            }
        )

        # Find package
        package = None
        if package_id:
            package = Package.objects.filter(package_id=package_id).first()
        if not package:
            package = Package.objects.filter(price=amount).first()

        if not package:
            return JsonResponse({"success": False, "message": "No matching package found"}, status=400)

        # Update user package if changed
        if user.package != package:
            user.package = package
            user.save()

        # Initiate STK Push - using service's expected parameter name
        response = MpesaService.initiate_stk_push(
            phone_number=phone,  # Service expects phone_number
            amount=amount,
            account_reference=f"AFRNET{package.package_id}",
            transaction_desc=f"AfriNet {package.package_id} Package"
        )

        if response.get("success"):
            # Create payment using model's phone field
            payment = Payment.objects.create(
                user=user,
                phone=phone,  # Model field
                amount=amount,
                package=package,
                transaction_id=response.get("checkout_request_id"),
                status="pending"
            )
            return JsonResponse({
                "success": True,
                "checkout_request_id": payment.transaction_id,
                "message": "Payment initiated successfully"
            })
        return JsonResponse(response, status=400)

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
    except Exception as e:
        logger.exception(f"STK push error: {str(e)}")
        return JsonResponse({"success": False, "message": "Internal server error"}, status=500)

@csrf_exempt
def callback(request):
    """Handle M-Pesa STK Push callback."""
    if request.method != "POST":
        return HttpResponse(status=405)

    try:
        callback_data = json.loads(request.body)
        logger.info(f"Callback received: {callback_data}")

        # Extract callback data
        callback = (callback_data.get("Body", {}).get("stkCallback") or 
                   callback_data.get("Body", {}).get("stk_callback"))
        
        if not callback:
            return HttpResponse(status=400)

        result_code = callback.get("ResultCode")
        transaction_id = callback.get("CheckoutRequestID")

        if not transaction_id:
            return HttpResponse(status=400)

        # Process payment
        try:
            payment = Payment.objects.get(transaction_id=transaction_id)
        except Payment.DoesNotExist:
            return HttpResponse(status=404)

        if payment.is_finished:
            return HttpResponse(status=200)

        # Update payment status
        payment.is_finished = True
        payment.is_successful = result_code == 0
        payment.status = "completed" if result_code == 0 else "failed"
        payment.completed_at = timezone.now()

        # Handle successful payment
        if result_code == 0 and "CallbackMetadata" in callback:
            metadata = {item["Name"]: item["Value"] 
                       for item in callback["CallbackMetadata"]["Item"]}
            
            payment.mpesa_receipt = metadata.get("MpesaReceiptNumber")
            if metadata.get("PhoneNumber"):
                payment.phone = normalize_phone(metadata["PhoneNumber"])
            payment.save()

            # Create user with D-prefixed username
            last_d_user = User.objects.filter(username__startswith='D').order_by('-username').first()
            new_number = int(last_d_user.username[1:]) + 1 if last_d_user else 1
            
            user, _ = User.objects.update_or_create(
                phone=payment.phone,
                defaults={
                    'username': f"D{new_number}",
                    'package': payment.package,
                    'status': 'active'
                }
            )

            # Create session if doesn't exist
            if not Session.objects.filter(payment=payment).exists():
                Session.objects.create(
                    user=user,
                    phone=payment.phone,
                    package=payment.package,
                    payment=payment,
                    duration_minutes=payment.package.duration_minutes,
                    end_time=timezone.now() + timedelta(minutes=payment.package.duration_minutes),
                    voucher_code=payment.mpesa_receipt
                )

        return HttpResponse(status=200)

    except Exception as e:
        logger.exception(f"Callback error: {str(e)}")
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
        phone = normalize_phone(data.get("phone"))

        if not checkout_id or not phone:
            logger.error("Missing transaction_id or phone in verify_session request")
            return JsonResponse({"success": False, "message": "Checkout ID and phone number are required"}, status=400)

        # Find Payment
        payment = Payment.objects.filter(
            transaction_id=checkout_id,
            phone=phone
        ).first()

        if not payment:
            logger.error(f"Payment not found: transaction_id={checkout_id}, phone={phone}")
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
                    payment.phone = normalize_phone(query_response.get("PhoneNumber", payment.phone))
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
                    phone=payment.phone,
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