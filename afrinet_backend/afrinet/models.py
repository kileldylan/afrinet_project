import uuid
from django.db import models
from django.utils import timezone

class Package(models.Model):
    package_id = models.CharField(max_length=10, unique=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    duration = models.CharField(max_length=50)  # e.g., "1 Hour"
    speed = models.CharField(max_length=20)     # e.g., "10 Mbps"
    popular = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.duration} at {self.speed} - Ksh {self.price}"
    
    @property
    def duration_minutes(self):
        """Convert duration string to minutes"""
        if 'Hour' in self.duration:
            return int(self.duration.split()[0]) * 60
        elif 'Day' in self.duration:
            return int(self.duration.split()[0]) * 1440
        return 60  # default to 1 hour if format unexpected
    
class User(models.Model):
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length= 10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
class Payment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length=50, default="")
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    transaction_id = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

class Session(models.Model):
    session_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    user_phone = models.CharField(max_length=50, null=True, blank=True)
    voucher_code = models.CharField(max_length=100, null=True, blank=True)
    device_mac = models.CharField(max_length=50, null=True, blank=True)
    ip_address = models.GenericIPAddressField(default="127.0.0.1")
    created_at = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(auto_created=True, null=True, blank=True)
    duration_minutes = models.PositiveIntegerField()
    disconnected = models.BooleanField(default=False)
    data_used = models.BigIntegerField(default=0)  # in bytes
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    disconnected_at = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('disconnected', 'Disconnected'), ('expired', 'Expired')],
        default='active'
    )

    @property
    def time_remaining(self):
        remaining = (self.end_time - timezone.now()).total_seconds() / 60
        return max(0, round(remaining))
    
    def is_expired(self):
        return timezone.now() > self.end_time

    def save(self, *args, **kwargs):
        # Calculate expires_time based on duration_minutes when saving
        if not self.end_time and self.duration_minutes:
            self.end_time = self.created_at + timezone.timedelta(minutes=self.duration_minutes)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user_phone or self.device_mac} - {self.status}"
    
class Voucher(models.Model):
    code = models.CharField(max_length=100, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    payment = models.ForeignKey(Payment, related_name='vouchers', on_delete=models.CASCADE, default=None)

    def is_valid(self):
        return not self.is_used and (self.end_time is None or self.end_time > timezone.now())

    def __str__(self):
        return self.code