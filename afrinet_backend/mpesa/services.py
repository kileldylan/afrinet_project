import base64
import requests
from datetime import datetime
from django.conf import settings
import logging
from requests.exceptions import RequestException

logger = logging.getLogger(__name__)

class MpesaService:
    @staticmethod
    def get_access_token():
        """Retrieve M-Pesa API access token with enhanced error handling"""
        try:
            auth_url = f"{settings.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
            response = requests.get(
                auth_url,
                auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
                timeout=10
            )
            response.raise_for_status()
            token = response.json().get('access_token')
            if not token:
                raise ValueError("Empty access token received")
            return token
        except RequestException as e:
            logger.error(f"Auth request failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Auth processing error: {str(e)}")
            return None

    @staticmethod
    def generate_timestamp():
        """Generate current timestamp in M-Pesa format"""
        return datetime.now().strftime('%Y%m%d%H%M%S')

    @staticmethod
    def generate_password():
        """Generate M-Pesa API password with proper encoding"""
        timestamp = MpesaService.generate_timestamp()
        return base64.b64encode(
            f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}".encode()
        ).decode()

    @staticmethod
    def initiate_stk_push(phone_number, amount, account_reference, transaction_desc):
        """
        Initiate STK push with comprehensive error handling
        Returns: {
            'success': bool,
            'checkout_request_id': str,
            'merchant_request_id': str,
            'message': str,
            'error': str (if failed)
        }
        """
        try:
            # Validate inputs
            if not all([phone_number, amount, account_reference]):
                raise ValueError("Missing required payment parameters")

            # Get access token
            access_token = MpesaService.get_access_token()
            if not access_token:
                return {
                    'success': False,
                    'error': 'Failed to authenticate with M-Pesa'
                }

            # Prepare payload
            payload = {
                "BusinessShortCode": settings.MPESA_SHORTCODE,
                "Password": MpesaService.generate_password(),
                "Timestamp": MpesaService.generate_timestamp(),
                "TransactionType": "CustomerPayBillOnline",
                "Amount": str(int(float(amount))),  # Ensure whole number
                "PartyA": phone_number,
                "PartyB": settings.MPESA_SHORTCODE,
                "PhoneNumber": phone_number,
                "CallBackURL": settings.MPESA_CALLBACK_URL,
                "AccountReference": account_reference,
                "TransactionDesc": transaction_desc
            }

            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            # Make the request
            response = requests.post(
                f"{settings.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers=headers,
                timeout=15
            )
            response_data = response.json()

            # Parse response
            if response_data.get('ResponseCode') == '0':
                return {
                    'success': True,
                    'checkout_request_id': response_data.get('CheckoutRequestID'),
                    'merchant_request_id': response_data.get('MerchantRequestID'),
                    'message': response_data.get('CustomerMessage')
                }
            else:
                return {
                    'success': False,
                    'error': response_data.get('CustomerMessage', 'STK push failed'),
                    'response': response_data
                }

        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            return {'success': False, 'error': str(e)}
        except RequestException as e:
            logger.error(f"Network error: {str(e)}")
            return {'success': False, 'error': f"Network error: {str(e)}"}
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return {'success': False, 'error': 'Internal server error'}