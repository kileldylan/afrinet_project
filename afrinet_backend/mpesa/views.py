from datetime import timedelta
import json
from time import sleep
import uuid
import os
from venv import logger
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from afrinet.models import Payment, User, Session, Package
from .services import MpesaService
from dotenv import load_dotenv
from django.http import HttpResponse
import logging
from celery import shared_task

load_dotenv()

def normalize_phone(phone):
    phone = phone.strip()
    if phone.startswith("07"):
        return "254" + phone[1:]
    elif phone.startswith("+"):
        return phone[1:]
    return phone

@csrf_exempt
def stk_push(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            phone_number = normalize_phone(data.get("phone_number"))
            amount = data.get("amount")
            package_id = data.get("package_id")  # Optional: to specify package

            if not phone_number or not amount:
                return JsonResponse({"success": False, "message": "Missing required fields"}, status=400)

            # Find or create user
            user, created = User.objects.get_or_create(
                phone_number=phone_number,
                defaults={'created_at': timezone.now()}
            )

            # Find package based on amount or package_id
            package = None
            if package_id:
                package = Package.objects.filter(package_id=package_id).first()
            if not package:
                package = Package.objects.filter(price=amount).first()
            
            if not package:
                return JsonResponse({"success": False, "message": "No package found for the specified amount or package ID"}, status=400)

            # Update user's package if not set or different
            if user.package != package:
                user.package = package
                user.save()

            response = MpesaService.initiate_stk_push(
                phone_number,
                amount,
                data.get('account_reference', 'WIFI_PAYMENT'),
                data.get('transaction_desc', 'Wifi Package Payment')
            )

            if response["success"]:
                Payment.objects.create(
                    user=user,
                    amount=amount,
                    phone_number=phone_number,
                    mpesa_receipt=response.get('mpesa_receipt'),
                    package=package,
                    transaction_id=response.get('checkout_request_id'),
                    status='pending'
                )

            return JsonResponse(response)

        except json.JSONDecodeError:
            return JsonResponse({"success": False, "message": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)}, status=500)

    return JsonResponse({"success": False, "message": "Method not allowed"}, status=405)

@csrf_exempt
def callback(request):
    """
    Handle MPESA STK Push callback with retries and verification
    """
    max_retries = 3
    retry_delay = 2  # seconds
    
    if request.method == 'POST':
        for attempt in range(max_retries):
            try:
                # Parse the callback data
                callback_data = json.loads(request.body)
                logger.info(f"MPESA Callback Received (Attempt {attempt + 1}): {callback_data}")
                
                # Verify this is a valid MPESA callback
                if 'Body' not in callback_data or 'stkCallback' not in callback_data['Body']:
                    logger.error("Invalid callback format")
                    return HttpResponse(status=400)
                
                callback = callback_data['Body']['stkCallback']
                mpesa_receipt = callback.get('MpesaReceiptNumber')
                transaction_id = callback.get('CheckoutRequestID')
                result_code = callback.get('ResultCode')
                
                # Check if transaction exists
                try:
                    transaction = Payment.objects.get(
                        mpesa_receipt=mpesa_receipt,
                        transaction_id=transaction_id
                    )
                except Payment.DoesNotExist:
                    logger.error(f"Transaction not found: {mpesa_receipt}")
                    return HttpResponse(status=404)
                
                # Process based on result code
                if result_code == 0:
                    # Success case
                    transaction.is_finished = True
                    transaction.is_successful = True
                    transaction.save()
                    
                    # Immediately acknowledge receipt
                    logger.info(f"Successfully processed transaction {transaction_id}")
                    return HttpResponse(status=200)
                
                else:
                    # Failure case
                    transaction.is_finished = True
                    transaction.is_successful = False
                    transaction.save()
                    logger.warning(f"Failed transaction {transaction_id}: {callback.get('ResultDesc')}")
                    return HttpResponse(status=200)
            
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
                return HttpResponse(status=400)
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} failed: {str(e)}")
                if attempt < max_retries - 1:
                    sleep(retry_delay)
                continue
        
        logger.error("All retries exhausted")
        return HttpResponse(status=500)
    
    return HttpResponse(status=405)

# In your view (after saving the transaction):
@shared_task
def process_callback_async(transaction_id):
    try:
        transaction = Payment.objects.get(id=transaction_id)
        # Additional processing here
    except Exception as e:
        logger.error(f"Async processing failed: {str(e)}")
        
# In your view:
        process_callback_async.delay(transaction.id)

@csrf_exempt
def verify_session(request):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
        checkout_id = data.get('transaction_id')
        phone = normalize_phone(data.get('phone_number'))

        if not checkout_id or not phone:
            return JsonResponse({'success': False, 'message': 'Checkout ID and phone number are required'}, status=400)

        payment = Payment.objects.filter(
            transaction_id=checkout_id,
            phone_number=phone
        ).first()

        if not payment:
            return JsonResponse({'success': False, 'message': 'Payment not found'}, status=404)

        if payment.status == 'completed':
            existing_session = Session.objects.filter(voucher_code=payment.mpesa_receipt).first()
            if existing_session:
                return JsonResponse({
                    'success': True,
                    'message': 'Session already exists',
                    'session_id': str(existing_session.session_id),
                    'expires_at': existing_session.end_time.isoformat()
                })
            
            session = Session.objects.create(
                session_id=str(uuid.uuid4()),
                user=payment.user,
                user_phone=payment.user.phone_number,
                package=payment.package,
                voucher_code=payment.mpesa_receipt,
                duration_minutes=payment.package.duration_minutes,
                status='active',
                end_time=timezone.now() + timedelta(minutes=payment.package.duration_minutes)
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Session created successfully',
                'session_id': str(session.session_id),
                'expires_at': session.end_time.isoformat()
            })
        
        return JsonResponse({
            'success': False,
            'message': 'Payment still processing',
            'status': 'pending'
        })

    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)

def register_url(request):
    access_token = MpesaService.get_access_token()

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "ShortCode": os.getenv("MPESA_SHORTCODE"),
        "ResponseType": "Completed",
        "ConfirmationURL": os.getenv("MPESA_CALLBACK_URL") + "/mpesa/callback/",
        "ValidationURL": os.getenv("MPESA_CALLBACK_URL") + "/mpesa/callback/",
    }

    url = "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"
    response = requests.post(url, json=payload, headers=headers)
    return JsonResponse(response.json())