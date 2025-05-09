import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from afrinet.models import Payment
from .services import MpesaService
import json
from django.utils import timezone
from afrinet.models import Payment, User, Session

@csrf_exempt
def stk_push(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            phone_number = data.get("phone_number")
            amount = data.get("amount")

            print("📩 Incoming STK push request:", data)

            if not phone_number or not amount:
                return JsonResponse(
                    {"success": False, "message": "Missing required fields"},
                    status=400
                )

            response = MpesaService.initiate_stk_push(
                phone_number,
                amount,
                data.get('account_reference', 'WIFI_PAYMENT'),
                data.get('transaction_desc', 'Wifi Package Payment')
            )

            print("📤 STK Push Response:", response)

            if response["success"]:
                user = User.objects.filter(phone_number=phone_number).first()
                if not user:
                    print("❌ User not found")
                    return JsonResponse({'success': False, 'message': 'User not found'}, status=404)

                Payment.objects.create(
                    user=user,
                    amount=amount,
                    phone_number=phone_number,
                    package=user.package,  # Ensure this exists
                    transaction_id=response.get('checkout_request_id'),
                    status='pending'
                )

            return JsonResponse(response)

        except json.JSONDecodeError:
            return JsonResponse(
                {"success": False, "message": "Invalid JSON"},
                status=400
            )
        except Exception as e:
            print("❌ Internal Server Error:", str(e))
            return JsonResponse(
                {"success": False, "message": "Internal server error"},
                status=500
            )

    return JsonResponse(
        {"success": False, "message": "Method not allowed"},
        status=405
    )

@csrf_exempt
def callback(request):
    """
    Handles M-Pesa STK Push callback
    Expected flow:
    1. Frontend initiates payment -> M-Pesa sends request to your server
    2. M-Pesa sends callback to this endpoint with payment status
    3. You update your database accordingly
    """
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)

    try:
        callback_data = json.loads(request.body)
        result = callback_data.get('Body', {}).get('stkCallback', {})
        
        # Extract critical information
        result_code = result.get('ResultCode')
        checkout_request_id = result.get('CheckoutRequestID')
        metadata = result.get('CallbackMetadata', {}).get('Item', [])
        
        # Parse metadata
        payment_data = {item.get('Name'): item.get('Value') for item in metadata}
        amount = payment_data.get('Amount')
        mpesa_receipt = payment_data.get('MpesaReceiptNumber')
        phone_number = payment_data.get('PhoneNumber', '')[3:]  # Remove 254 prefix
        
        # Find the pending payment
        payment = Payment.objects.filter(
            transaction_id=checkout_request_id,
            status='pending'
        ).first()

        if not payment:
            return JsonResponse({'status': 'error', 'message': 'Payment not found'}, status=404)

        # Update payment based on result
        if result_code == 0:  # Success
            payment.status = 'completed'
            payment.mpesa_receipt = mpesa_receipt
            payment.completed_at = timezone.now()
            
            # Create user session (if applicable)
            Session.objects.create(
                user=payment.user,
                user_phone=payment.user.phone_number,
                package=payment.package,
                duration_minutes=payment.package.duration_minutes,
                status='active'
            )
            
            message = "Payment completed successfully"
        else:  # Failure
            payment.status = 'failed'
            message = result.get('ResultDesc', 'Payment failed')

        payment.save()
        return JsonResponse({'status': 'success', 'message': message})

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)