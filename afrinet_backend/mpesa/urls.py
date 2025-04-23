from django.urls import path
from . import views

urlpatterns = [
    path('stk-push/', views.stk_push, name='stk_push'),
    path('callback/', views.callback, name='callback'),
]
