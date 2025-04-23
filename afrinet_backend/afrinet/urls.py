from django.urls import path, include
from .views import UserViewSet, PaymentViewSet, SessionViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'sessions', SessionViewSet)

urlpatterns = [
    path('', include(router.urls))
]
