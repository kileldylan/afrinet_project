from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from django.contrib.auth import get_user_model
from django.http import HttpResponse
import os
from .views import (
    ActiveUserDetail,
    ActiveUserList,
    ActiveUserStats,
    DisconnectActiveUser,
    PackageListCreateView,
    InitiatePaymentView,
    UserLoginAPIView,
    UserLogoutAPIView,
    UserSessionView,
    MpesaAuthTestView,
    MpesaSTKTestView,
    AllActiveSessionsView,
    UserListAPIView,
    PaymentListView,
    ValidateVoucher,
    VoucherDetail,
    VoucherListCreate,
    create_hotspot_user,
    generate_mikrotik_voucher,
    sync_mikrotik,
    mikrotik_configure,
    mikrotik_device_list,
    test_mikrotik_connection,
    GenerateVouchersView
)

def create_superuser_view(request):
    if os.environ.get('CREATE_SUPERUSER') == 'True':
        User = get_user_model()
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                email=os.environ['ADMIN_EMAIL'],
                password=os.environ['ADMIN_PASSWORD']
            )
            return HttpResponse("Superuser created successfully")
    return HttpResponse("Superuser already exists or creation disabled")


urlpatterns = [
    path('create-superuser/', create_superuser_view),
    path('auth/login/', UserLoginAPIView.as_view(), name='login'),
    path('auth/logout/', UserLogoutAPIView.as_view(), name='logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token-verify'),
    path('packages/', PackageListCreateView.as_view(), name='package-list'),
    path('payments/', PaymentListView.as_view(), name='payment-list'),
    path('users/', UserListAPIView.as_view(), name='users'),
    path('initiate-payment/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('sessions/', AllActiveSessionsView.as_view(), name='all_active_sessions'),
    path('sessions/<str:phone_number>/', UserSessionView.as_view(), name='user-session'),
    path('mpesa/stk-test/', MpesaSTKTestView.as_view(), name='test_stk_push'),
    path('mpesa/auth-test/', MpesaAuthTestView.as_view(), name='mpesa-auth-test'),
    path('active-users/', ActiveUserList.as_view(), name='active-user-list'),
    path('active-users/<uuid:session_id>/', ActiveUserDetail.as_view(), name='active-user-detail'),
    path('active-users/<uuid:session_id>/disconnect/', DisconnectActiveUser.as_view(), name='disconnect-user'),
    path('active-users/stats/', ActiveUserStats.as_view(), name='active-user-stats'),
    
    # Vouchers
    path('vouchers/', VoucherListCreate.as_view(), name='voucher-list-create'),
    path('vouchers/<str:code>/', VoucherDetail.as_view(), name='voucher-detail'),
    path('vouchers/validate/', ValidateVoucher.as_view(), name='validate-voucher'),
    path('vouchers/generate/', GenerateVouchersView.as_view(), name='generate-voucher'),
        
    # MikroTik
    path('mikrotik/sync/', sync_mikrotik, name='sync-mikrotik'),
    path('mikrotik/create-user/', create_hotspot_user, name='create-hotspot-user'),
    path('mikrotik/generate-voucher/', generate_mikrotik_voucher, name='generate-mikrotik-voucher'),
    
    # New endpoints
    path('mikrotik/devices/', mikrotik_device_list, name='mikrotik-device-list'),
    path('mikrotik/configure/', mikrotik_configure, name='mikrotik-configure'),
    path('mikrotik/test-connection/<int:device_id>/', test_mikrotik_connection, name='test-mikrotik-connection'),
]