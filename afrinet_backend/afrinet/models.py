from django.db import models

class Package(models.Model):
    package_id = models.CharField(max_length=10, unique=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    duration = models.CharField(max_length=50)  # e.g., "1 Hour"
    speed = models.CharField(max_length=20)     # e.g., "10 Mbps"
    popular = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.duration} at {self.speed} - Ksh {self.price}"

class User(models.Model):
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length= 10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    transaction_id = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

class Session(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    data_used = models.BigIntegerField() #stores in bytes
