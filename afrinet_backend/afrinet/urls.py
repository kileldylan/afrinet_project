from django.urls import path, include
from .views import UserViewSet, PaymentViewSet, active_sessions
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('sessions/', active_sessions, name='active_sessions'),
]
