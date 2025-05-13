from django.urls import path
from . import views

urlpatterns = [
    path('stk-push/', views.stk_push, name='stk_push'),
    path('callback/', views.callback, name='callback'),
    path('verify-session/', views.verify_session, name='verification'),
    path('register-url/', views.register_url, name='register_url'),
]
