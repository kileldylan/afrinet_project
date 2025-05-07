from django.shortcuts import render
from .models import User, Payment, Session
from .serializers import UserSerializer, PaymentSerializer, SessionSerializer
from rest_framework import viewsets
from django.views.decorators.http import require_GET
from django.http import JsonResponse
from django.utils import timezone

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer

@require_GET
def active_sessions(request):
    active = Session.objects.filter(
        status='active',
        end_time__gt=timezone.now()
    ).select_related('user', 'package')

    return JsonResponse({
        'sessions': [{
            'user': s.user_phone,
            'package': s.package_name,
            'start_time': s.start_time,
            'end_time': s.end_time,
            'remaining_minutes': s.time_remaining
        } for s in active]
    })