import base64
import requests
import json
from datetime import datetime
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from afrinet.models import Package, User, Payment  # import your models from afrinet
from .utils import lipa_na_mpesa_online


@csrf_exempt
def stk_push(request):
    if request.method == "POST":
        data = json.loads(request.body)
        phone_number = data.get("phone_number")
        selected_offer = data.get("selectedOffer", {})

        # Extract fields
        price = selected_offer.get("price")
        duration = selected_offer.get("duration")
        speed = selected_offer.get("speed")
        popular = selected_offer.get("popular", False)

        # Validate required fields
        if not phone_number or not price or not duration or not speed:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Try to find a matching Package
        try:
            package = Package.objects.get(
                price=price,
                duration=duration,
                speed=speed,
                popular=popular
            )
        except Package.DoesNotExist:
            return JsonResponse({"error": "Selected package does not exist"}, status=404)

        # Get or create the user
        user, created = User.objects.get_or_create(phone_number=phone_number)
        user.package = package
        user.save()

        # Initiate STK Push
        response = lipa_na_mpesa_online(phone_number, price)

        # Return response + package info
        response.update({
            "package": {
                "price": price,
                "duration": duration,
                "speed": speed,
                "popular": popular
            },
            "phone_number": phone_number,
            "success": True,
            "message": "STK push sent successfully"
        })

        return JsonResponse(response)

    return JsonResponse({"error": "Invalid method"}, status=405)


@csrf_exempt
def callback(request):
    data = json.loads(request.body)
    print("Callback data: ", json.dumps(data, indent=2))

    body = data.get("Body", {}).get("stkCallback", {})
    metadata = body.get("CallbackMetadata", {}).get("Item", [])
    result_code = body.get("ResultCode")
    transaction_id = body.get("CheckoutRequestID")

    amount = None
    phone_number = None

    for item in metadata:
        if item.get("Name") == "Amount":
            amount = item.get("Value")
        if item.get("Name") == "PhoneNumber":
            phone_number = str(item.get("Value"))[-9:]  # Get last 9 digits

    if result_code == 0 and phone_number:
        phone_number = f"07{phone_number[-8:]}"  # Normalize to Safaricom format if needed
        user = User.objects.filter(phone_number=phone_number).first()

        if user:
            Payment.objects.create(
                user=user,
                package=user.package,
                amount=amount,
                transaction_id=transaction_id,
                status="Success",
                created_at=now()
            )
        else:
            print("User not found for phone number", phone_number)

    return JsonResponse({"message": "Callback received and processed"})
