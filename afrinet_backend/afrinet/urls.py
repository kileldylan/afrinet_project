from django.urls import path
from .views import (
    PackageListCreateView,
    InitiatePaymentView,
    UserSessionView,
    MpesaAuthTestView,
    MpesaSTKTestView,
    verify_config,
    AllActiveSessionsView,
    UserListAPIView,
    PaymentListView
)

urlpatterns = [
    path('packages/', PackageListCreateView.as_view(), name='package-list'),
    path('payments/', PaymentListView.as_view(), name='payment-list'),
    path('users/', UserListAPIView.as_view(), name='users'),
    path('initiate-payment/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('sessions/', AllActiveSessionsView.as_view(), name='all_active_sessions'),
    path('sessions/<str:phone_number>/', UserSessionView.as_view(), name='user-session'),
    path('mpesa/stk-test/', MpesaSTKTestView.as_view(), name='test_stk_push'),
    path('mpesa/auth-test/', MpesaAuthTestView.as_view(), name='mpesa-auth-test'),
    path('verify-config/', verify_config, name='verify_config'),
]