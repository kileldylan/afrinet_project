from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Package, User, Payment, Session
from .serializers import PackageSerializer, PaymentInitiationSerializer
from django.utils import timezone
from datetime import timedelta
import logging
from django.http import HttpResponse, JsonResponse
from django.conf import settings
import base64
from datetime import datetime
import requests

logger = logging.getLogger(__name__)

class PackageListView(generics.ListAPIView):
    """API endpoint that lists all available packages"""
    queryset = Package.objects.all().order_by('price')
    serializer_class = PackageSerializer

class MpesaAuthTestView(APIView):
    """Endpoint to test M-Pesa authentication"""
    def get(self, request):
        try:
            auth_url = f"{settings.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
            response = requests.get(
                auth_url,
                auth=(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
                timeout=30
            )
            
            if response.status_code == 200:
                return Response({
                    'success': True,
                    'access_token': response.json().get('access_token'),
                    'expires_in': response.json().get('expires_in')
                })
            return Response({
                'success': False,
                'status_code': response.status_code,
                'response': response.text
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Auth test error: {str(e)}")
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MpesaSTKTestView(APIView):
    """Endpoint to test STK push with hardcoded values"""
    def post(self, request):
        try:
            from mpesa.services import MpesaService
            test_data = {
                'phone_number': '254758715788',  # Use your whitelisted number
                'amount': '1',  # Test with 1 KES
                'account_reference': 'TEST',
                'transaction_desc': 'Test Payment'
            }
            response = MpesaService.initiate_stk_push(test_data)
            
            return Response(response)
            
        except Exception as e:
            logger.error(f"STK test error: {str(e)}")
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class InitiatePaymentView(APIView):
    """Handles payment initiation"""
    def post(self, request, *args, **kwargs):
        serializer = PaymentInitiationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'message': 'Validation error',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        phone_number = serializer.validated_data['phone_number']
        package_id = serializer.validated_data['package_id']
        
        try:
            package = Package.objects.get(pk=package_id)
            user, created = User.objects.get_or_create(
                phone_number=phone_number,
                defaults={'package': package}
            )
            
            if not created:
                user.package = package
                user.save()
            
            mpesa_data = {
                'phone_number': f"254{phone_number.lstrip('0')}",  # Ensure proper format
                'amount': str(int(package.price)),  # Ensure whole number
                'account_reference': f"Afrinet_WIFI_{package.id}",
                'transaction_desc': f"Afrinet_Wifi {package.duration} Package"
            }
            
            from mpesa.services import MpesaService
            stk_response = MpesaService.initiate_stk_push(mpesa_data)
            
            if stk_response.get('success'):
                Payment.objects.create(
                    user=user,
                    package=package,
                    amount=package.price,
                    transaction_id=stk_response.get('checkout_request_id'),
                    status='pending'
                )
                return Response({
                    'success': True,
                    'message': 'Payment request sent! Check your M-Pesa',
                    'checkout_request_id': stk_response.get('checkout_request_id')
                })
            return Response({
                'success': False,
                'message': stk_response.get('message', 'Payment failed'),
                'response': stk_response
            }, status=status.HTTP_400_BAD_REQUEST)
                
        except Package.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Package not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Payment error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Payment processing failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserSessionView(APIView):
    """Gets current active session for a user"""
    def get(self, request, phone_number, *args, **kwargs):
        try:
            session = Session.objects.filter(
                user_phone=phone_number,
                status='active'
            ).latest('created_at')
            return Response({
                'active': True,
                'package': session.package.package_id,
                'created_at': session.created_at,
                'endItime': session.end_time,
                'time_remaining': session.time_remaining,
                'data_used': session.data_used
            })
        except Session.DoesNotExist:
            return Response({'active': False})
        except Exception as e:
            logger.error(f"Session error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Error checking session'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AllActiveSessionsView(APIView):
    def get(self, request, *args, **kwargs):
        sessions = Session.objects.filter(status='active')
        session_data = []
        for session in sessions:
            session_data.append({
                "id": str(session.session_id),
                "user_phone": session.user_phone,
                "device_mac": session.device_mac,
                "ip_address": session.ip_address,
                "package_name": session.package.package_id if session.package else "N/A",
                "start_time": session.created_at,
                "time_remaining": session.time_remaining,
                "status": session.status,
            })
        return Response(session_data, status=status.HTTP_200_OK)

def home(request):
    return HttpResponse("Welcome to the Afrinet WiFi platform!")

def verify_config(request):
    """Endpoint to verify M-Pesa configuration"""
    return JsonResponse({
        'MPESA_BASE_URL': settings.MPESA_BASE_URL,
        'MPESA_SHORTCODE': settings.MPESA_SHORTCODE,
        'MPESA_CALLBACK_URL': settings.MPESA_CALLBACK_URL,
        'CONSUMER_KEY_EXISTS': bool(settings.MPESA_CONSUMER_KEY),
        'CONSUMER_SECRET_EXISTS': bool(settings.MPESA_CONSUMER_SECRET),
        'PASSKEY_EXISTS': bool(settings.MPESA_PASSKEY)
    })