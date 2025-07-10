import random
import string
from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from .mikrotik_utils import test_connection_to_device
from .mikrotik import MikroTik
from .models import Package, User, Payment, Session, Voucher, MikroTikDevice
from .serializers import PaymentSerializer, PackageSerializer, PaymentInitiationSerializer, MikroTikDeviceSerializer,UserSerializer, SessionSerializer, VoucherSerializer
from django.utils import timezone
from datetime import timedelta
import logging
from django.http import HttpResponse, JsonResponse
from django.conf import settings
import base64
from datetime import datetime
import requests
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from rest_framework.decorators import api_view
logger = logging.getLogger(__name__)

# views.py
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Package
from .serializers import PackageSerializer

class PackageListCreateView(generics.ListCreateAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PaymentListView(generics.ListAPIView):
    serializer_class = PaymentSerializer

    def get_queryset(self):
        queryset = Payment.objects.all().select_related('user', 'package')
        
        # Filter by checked status if provided
        checked = self.request.query_params.get('checked')
        if checked is not None:
            queryset = queryset.filter(is_checked=checked.lower() == 'true')
            
        return queryset.order_by('-created_at')
    
class UserListAPIView(generics.ListCreateAPIView):  # Changed from ListAPIView to ListCreateAPIView
    serializer_class = UserSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'phone']

    def get_queryset(self):
        queryset = User.objects.all()
        user_filter = self.request.query_params.get('filter', None)
        
        if user_filter == 'hotspot':
            queryset = queryset.filter(user_type='hotspot')
        elif user_filter == 'pppoe':
            queryset = queryset.filter(user_type='pppoe')
        elif user_filter == 'paused':
            queryset = queryset.filter(status='paused')
            
        return queryset.order_by('-created_at')

class ActiveUserList(generics.ListAPIView):
    queryset = Session.objects.filter(is_active=True, status='active')
    serializer_class = SessionSerializer

class ActiveUserDetail(generics.RetrieveAPIView):
    queryset = Session.objects.filter(is_active=True)
    serializer_class = SessionSerializer
    lookup_field = 'session_id'

class DisconnectActiveUser(generics.UpdateAPIView):
    queryset = Session.objects.filter(is_active=True)
    serializer_class = SessionSerializer
    lookup_field = 'session_id'
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.disconnected = True
        instance.is_active = False
        instance.status = 'disconnected'
        instance.disconnected_at = timezone.now()
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class ActiveUserStats(generics.GenericAPIView):
    def get(self, request):
        active_count = Session.objects.filter(is_active=True).count()
        total_data = sum(s.data_used for s in Session.objects.filter(is_active=True))
        return Response({
            'active_users': active_count,
            'total_data_used': total_data,
            'average_session_length': Session.objects.filter(is_active=True).aggregate(Avg('duration_minutes'))['duration_minutes__avg']
        })
    
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
                'phone': '254758715788',
                'amount': '1',
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
        
        phone = serializer.validated_data['phone']
        package_id = serializer.validated_data['package_id']
        
        try:
            logger.info(f"Received payment request: phone={phone}, package_id={package_id}")
            package = Package.objects.get(package_id=package_id)  # Use custom package_id field
            logger.info(f"Selected package: id={package.id}, package_id={package.package_id}, price={package.price}")
            
            user, created = User.objects.get_or_create(
                phonr=phone,
                defaults={'package': package}
            )
            
            if not created:
                user.package = package
                user.save()
            
            mpesa_data = {
                'phone': f"254{phone.lstrip('0')}",
                'amount': str(int(package.price)),
                'account_reference': f"Afrinet_WIFI{package.package_id}",  # Use package_id for clarity
                'transaction_desc': f"Afrinet_Wifi {package.duration_value} {package.duration_unit} Package"
            }
            
            logger.info(f"Sending M-Pesa request: {mpesa_data}")
            from mpesa.services import MpesaService
            stk_response = MpesaService.initiate_stk_push(mpesa_data)
            
            if stk_response.get('success'):
                payment = Payment.objects.create(
                    user=user,
                    package=package,
                    amount=package.price,
                    phone=phone,  # Store raw phone number
                    transaction_id=stk_response.get('checkout_request_id'),
                    status='pending'
                )
                logger.info(f"Payment created: id={payment.id}, package_id={package.package_id}, amount={payment.amount}")
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
            logger.error(f"Package not found: package_id={package_id}")
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
    def get(self, request, phone, *args, **kwargs):
        try:
            session = Session.objects.filter(
                phone=phone,
                status='active'
            ).latest('created_at')
            return Response({
                'active': True,
                'package': session.package.package_id,
                'created_at': session.created_at,
                'end_time': session.end_time,  # Fixed typo: 'endItime' to 'end_time'
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
                "phone": session.phone,
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

def generate_voucher_code(length=8):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

class VoucherListCreate(generics.ListCreateAPIView):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    
    def create(self, request, *args, **kwargs):
        package_id = request.data.get('package_id')
        phone = request.data.get('phone', '')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            package = Package.objects.get(pk=package_id)
        except Package.DoesNotExist:
            return Response({'error': 'Package not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create a dummy payment for voucher generation
        payment = Payment.objects.create(
            phone=phone,
            amount=package.price * quantity,
            transaction_id=f"VOUCHER-{timezone.now().timestamp()}",
            package=package,
            status='completed',
            is_successful=True,
            is_finished=True
        )
        
        vouchers = []
        for _ in range(quantity):
            code = generate_voucher_code()
            end_time = timezone.now() + timedelta(minutes=package.duration_minutes)
            voucher = Voucher.objects.create(
                code=code,
                phone=phone,
                payment=payment,
                end_time=end_time
            )
            vouchers.append(voucher)
        
        serializer = self.get_serializer(vouchers, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class VoucherDetail(generics.RetrieveAPIView):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    lookup_field = 'code'

class ValidateVoucher(generics.GenericAPIView):
    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        try:
            voucher = Voucher.objects.get(code=code)
            if voucher.is_used:
                return Response({'valid': False, 'message': 'Voucher already used'})
            if voucher.end_time and voucher.end_time < timezone.now():
                return Response({'valid': False, 'message': 'Voucher expired'})
            return Response({
                'valid': True,
                'package': voucher.payment.package.package_id if voucher.payment and voucher.payment.package else None,
                'duration_minutes': voucher.payment.package.duration_minutes if voucher.payment and voucher.payment.package else None
            })
        except Voucher.DoesNotExist:
            return Response({'valid': False, 'message': 'Invalid voucher code'})
        
@api_view(['POST'])
def sync_mikrotik(request):
    mikrotik = MikroTik()
    count = mikrotik.sync_active_users()
    return Response({'synced_users': count})

@api_view(['POST'])
def create_hotspot_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    profile = request.data.get('profile', 'default')
    
    mikrotik = MikroTik()
    success = mikrotik.create_hotspot_user(username, password, profile)
    
    if success:
        return Response({'status': 'success'})
    return Response({'status': 'failed'}, status=400)

@api_view(['POST'])
def generate_mikrotik_voucher(request):
    package_id = request.data.get('package_id')
    quantity = int(request.data.get('quantity', 1))
    
    try:
        package = Package.objects.get(pk=package_id)
    except Package.DoesNotExist:
        return Response({'error': 'Package not found'}, status=400)
    
    # Generate uptime limit string for MikroTik
    if package.duration_unit == 'min':
        uptime = f"{package.duration_value}m"
    elif package.duration_unit == 'hour':
        uptime = f"{package.duration_value}h"
    else:  # day
        uptime = f"{package.duration_value}d"
    
    mikrotik = MikroTik()
    vouchers = []
    
    for _ in range(quantity):
        code = generate_voucher_code()
        mikrotik.generate_voucher(code, uptime=uptime)
        
        # Create voucher in database
        voucher = Voucher.objects.create(
            code=code,
            end_time=timezone.now() + timedelta(minutes=package.duration_minutes),
            payment=None  # Can associate with payment later
        )
        vouchers.append({'code': code})
    
    return Response({'vouchers': vouchers})

@api_view(['GET'])
def mikrotik_device_list(request):
    devices = MikroTikDevice.objects.all()
    serializer = MikroTikDeviceSerializer(devices, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def mikrotik_configure(request):
    serializer = MikroTikDeviceSerializer(data=request.data)
    if serializer.is_valid():
        # Check if updating existing device
        if 'id' in request.data:
            device = MikroTikDevice.objects.get(pk=request.data['id'])
            serializer = MikroTikDeviceSerializer(device, data=request.data)
        
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def test_mikrotik_connection(request, device_id):
    try:
        device = MikroTikDevice.objects.get(pk=device_id)
        # Your connection testing logic here
        is_connected = test_connection_to_device(device)
        return Response({
            'success': is_connected,
            'message': 'Connection successful' if is_connected else 'Connection failed',
            'status': 'Online' if is_connected else 'Offline'
        })
    except MikroTikDevice.DoesNotExist:
        return Response({'error': 'Device not found'}, status=404)