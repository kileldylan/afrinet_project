from datetime import timedelta
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from afrinet.models import Payment
from .services import MpesaService
import json
from django.utils import timezone
from afrinet.models import Payment, User, Session, Voucher, Package
import uuid
from rest_framework.response import Response

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
                    package=user.package,
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
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST allowed'}, status=405)

    try:
        print("📞 Callback endpoint hit.")
        raw_body = request.body.decode()
        print("📝 Raw body received:", raw_body)

        callback_data = json.loads(raw_body)
        print("✅ JSON parsed successfully.")

        result = callback_data.get('Body', {}).get('stkCallback', {})
        print("📊 Callback Result:", result)

        result_code = result.get('ResultCode')
        checkout_request_id = result.get('CheckoutRequestID')
        metadata = result.get('CallbackMetadata', {}).get('Item', [])

        parsed_metadata = {item.get('Name'): item.get('Value') for item in metadata}
        print("🔍 Parsed Metadata:", parsed_metadata)

        amount = parsed_metadata.get('Amount')
        mpesa_receipt = parsed_metadata.get('MpesaReceiptNumber')
        phone_number = str(parsed_metadata.get('PhoneNumber', ''))[3:]  # Remove 254 prefix if needed

        print(f"📱 Phone number parsed: {phone_number}")
        print(f"💰 Amount: {amount}, 📄 MpesaReceipt: {mpesa_receipt}")

        payment = Payment.objects.filter(
            transaction_id=checkout_request_id,
            status='pending'
        ).first()

        if not payment:
            print("❌ Payment record not found for CheckoutRequestID:", checkout_request_id)
            return JsonResponse({'status': 'error', 'message': 'Payment not found'}, status=404)

        if result_code == 0:  # Success
            payment.status = 'completed'
            payment.mpesa_receipt = mpesa_receipt
            payment.completed_at = timezone.now()
            payment.save()

            print("✅ Payment marked as completed.")

            # Extract voucher code from M-Pesa message (this is the key change)
            # The voucher code typically comes in the transaction metadata
            # Adjust this based on where Safaricom puts it in your callback
            voucher_code = parsed_metadata.get('VoucherCode') or mpesa_receipt
            
            if not voucher_code:
                print("⚠️ No voucher code found in callback")
                voucher_code = "NO_VOUCHER_" + mpesa_receipt[:6]
            else:
                voucher_code = voucher_code.upper()  # Ensure uppercase

            # Create voucher record
            voucher = Voucher.objects.create(
                code=voucher_code,
                payment=payment,
                expires_at=timezone.now() + timedelta(days=30)  # 30-day validity
            )

            # Create session
            Session.objects.create(
                user=payment.user,
                user_phone=payment.user.phone_number,
                package=payment.package,
                voucher=voucher.code,
                duration_minutes=payment.package.duration_minutes,
                status='active',
                expires_at=timezone.now() + timedelta(minutes=payment.package.duration_minutes)
            )

            print(f"📶 Session created with voucher: {voucher_code}")
            message = "Payment completed successfully"

        else:
            payment.status = 'failed'
            payment.save()
            print("❌ Payment failed with ResultCode:", result_code)
            message = result.get('ResultDesc', 'Payment failed')

        return JsonResponse({'status': 'success', 'message': message})

    except json.JSONDecodeError:
        print("❌ JSON Decode Error in callback.")
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        print("❌ Exception in callback:", str(e))
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
def verify_voucher(request):
    if request.method != 'POST':
        return JsonResponse(
            {"success": False, "message": "Only POST method allowed"},
            status=405
        )

    try:
        # Parse and normalize data
        data = json.loads(request.body)
        phone_number = data.get('phone_number', '').strip()
        voucher_code = data.get('voucher', '').strip().upper()  # Force uppercase
        package_id = data.get('package_id')

        print(f"🔍 Verification attempt - Phone: {phone_number}, Voucher: {voucher_code}")

        if not all([phone_number, voucher_code, package_id]):
            return JsonResponse({
                "success": False,
                "message": "Phone number, voucher code and package ID are required"
            }, status=400)

        # Get voucher (exact case-sensitive match since M-Pesa codes are case-sensitive)
        try:
            voucher = Voucher.objects.get(code=voucher_code)
        except Voucher.DoesNotExist:
            print(f"❌ Voucher not found: {voucher_code}")
            return JsonResponse({
                "success": False,
                "message": "Invalid voucher code"
            }, status=400)

        # Validate voucher
        if voucher.is_used:
            print(f"⚠️ Voucher already used: {voucher_code}")
            return JsonResponse({
                "success": False,
                "message": "Voucher has already been used"
            }, status=400)
            
        if voucher.expires_at and voucher.expires_at < timezone.now():
            print(f"⌛ Voucher expired: {voucher_code} (Expired on {voucher.expires_at})")
            return JsonResponse({
                "success": False,
                "message": "Voucher has expired"
            }, status=400)

        # Verify voucher belongs to this user
        if voucher.payment.phone_number != phone_number:
            print(f"📱 Phone mismatch: {voucher.payment.phone_number} vs {phone_number}")
            return JsonResponse({
                "success": False,
                "message": "Voucher not associated with this phone number"
            }, status=400)

        # Get package
        try:
            package = Package.objects.get(id=package_id)
        except Package.DoesNotExist:
            return JsonResponse({
                "success": False,
                "message": "Invalid package"
            }, status=404)

        # Create new session
        session = Session.objects.create(
            session_id=str(uuid.uuid4()),
            user_phone=phone_number,
            package=package,
            voucher=voucher.code,
            duration_minutes=package.duration_minutes,
            expires_at=timezone.now() + timedelta(minutes=package.duration_minutes),
            status='active'
        )

        # Mark voucher as used
        voucher.is_used = True
        voucher.used_at = timezone.now()
        voucher.save()

        print(f"✅ Voucher verified: {voucher_code}")
        return JsonResponse({
            "success": True,
            "message": "Voucher verified successfully! WiFi session started",
            "session_id": str(session.session_id),
            "expires_at": session.expires_at.isoformat(),
            "voucher_code": voucher.code
        })

    except json.JSONDecodeError:
        return JsonResponse({
            "success": False,
            "message": "Invalid JSON format"
        }, status=400)
    except Exception as e:
        print(f"🔥 Verification error: {str(e)}")
        return JsonResponse({
            "success": False,
            "message": f"Error verifying voucher: {str(e)}"
        }, status=500)