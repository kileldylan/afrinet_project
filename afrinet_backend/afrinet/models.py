from django.db import models

class User(models.Model):
    phone_number = models.CharField(max_length= 10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    transaction_id = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

class Session(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    data_used = models.BigIntegerField() #stores in bytes
