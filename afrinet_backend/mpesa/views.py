import base64
import requests
from datetime import datetime
from django.http import JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import os
import json
from .utils import lipa_na_mpesa_online

@csrf_exempt
def stk_push(request):
    if request.method == "POST":
        data = json.loads(request.body)
        phone_number = data.get("phone_number")
        amount = data.get("amount", 1)  # Default KES 1

        if not phone_number:
            return JsonResponse({"error": "Phone number is required"}, status=400)

        response = lipa_na_mpesa_online(phone_number, amount)
        return JsonResponse(response)

    return JsonResponse({"error": "Invalid method"}, status=405)

@csrf_exempt
def callback(request):
    data = json.loads(request.body)
    print("Callback data: ", json.dumps(data, indent=2))
    # You can store this in the database
    return JsonResponse({"message": "Callback received successfully"})