import base64
import requests
from datetime import datetime
import os
from dotenv import load_dotenv
load_dotenv() 

SHORTCODE= os.getenv("SHORTCODE")
PASSKEY= os.getenv("PASSKEY")
CONSUMER_KEY= os.getenv("CONSUMER_KEY")
CONSUMER_SECRET= os.getenv("CONSUMER_SECRET")
BASE_URL= os.getenv("BASE_URL")
CALLBACK_URL= os.getenv("CALLBACK_URL")

def get_access_token():
    url = f"{BASE_URL}/oauth/v1/generate?grant_type=client_credentials"

    print("\n🔐 Requesting Access Token from:", url)
    print("📦 Using Consumer Key:", CONSUMER_KEY)
    print("📦 Using Consumer Secret:", CONSUMER_SECRET)

    response = requests.get(url, auth=(CONSUMER_KEY, CONSUMER_SECRET))
    print("🌐 Access Token Response Status:", response.status_code)
    print("📜 Raw Response Text:", response.text)

    if response.status_code != 200:
        print(f"❌ Error: HTTP {response.status_code}")
        if response.status_code == 400:
            print("⚠️ Bad Request - Likely invalid credentials")
        return None

    try:
        json_response = response.json()
        access_token = json_response.get("access_token")
        if not access_token:
            print("❌ No access token in response:", json_response)
            return None
        print("✅ Access Token:", access_token)
        return access_token
    except Exception as e:
        print("❌ Error decoding access token JSON:", str(e))
        return None

def lipa_na_mpesa_online(phone_number, amount):
    access_token = get_access_token()
    if not access_token:
        return {"error": "Access token retrieval failed"}

    access_token = access_token.strip()
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = base64.b64encode(f"{SHORTCODE}{PASSKEY}{timestamp}".encode()).decode()
    stk_push_url = f"{BASE_URL}/mpesa/stkpush/v1/processrequest"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": "AfrinetWifi",
        "TransactionDesc": "Afrinet Payment"
    }

    print("\n📤 Sending STK Push...")
    print("📦 Payload:", payload)
    print("🔗 URL:", stk_push_url)

    response = requests.post(stk_push_url, json=payload, headers=headers)
    print("📥 STK Push Response Status:", response.status_code)
    print("📥 STK Push Response:", response.text)

    try:
        return response.json()
    except Exception as e:
        print("❌ Failed to decode STK Push JSON:", str(e))
        return {"error": "Failed to decode STK Push response"}
