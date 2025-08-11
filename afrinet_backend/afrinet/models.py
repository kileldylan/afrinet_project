import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

#CUstom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=60, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

class Package(models.Model):
    package_id = models.CharField(max_length=20, unique=True)
    package_name = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    duration_value = models.IntegerField(default=1)
    duration_unit = models.CharField(
        max_length=20,
        choices=[('min', 'Minutes'), ('hour', 'Hours'), ('day', 'Days')],
        default='min'
    )
    speed = models.CharField(max_length=20)
    popular = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.duration_value} {self.duration_unit} at {self.speed} - Ksh {self.price}"

    @property
    def duration_minutes(self):
        if self.duration_unit == 'hour':
            return self.duration_value * 60
        elif self.duration_unit == 'day':
            return self.duration_value * 1440
        return self.duration_value

class HostspotUser(models.Model):
    USER_TYPES = (
        ('hotspot', 'Hotspot'),
        ('pppoe', 'PPPoE'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('expired', 'Expired'),
    )
    
    username = models.CharField(max_length=100, unique=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPES, default="")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    package = models.ForeignKey('Package', on_delete=models.SET_NULL, null=True)
    expiry_date = models.DateTimeField(null=True, blank=True)
    last_online = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(HostspotUser, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100, unique=True)
    mpesa_receipt = models.CharField(max_length=100, null=True, blank=True, unique=True)
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_successful = models.BooleanField(default=False)
    is_finished = models.BooleanField(default=False)
    is_checked = models.BooleanField(default=False)


    def __str__(self):
        return f"{self.phone} - {self.amount} - {self.status}"
    
class Session(models.Model):
    session_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(HostspotUser, on_delete=models.CASCADE, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)  # stored separately for unauthenticated sessions
    voucher_code = models.CharField(max_length=100, null=True, blank=True)
    device_mac = models.CharField(max_length=50, null=True, blank=True)
    ip_address = models.GenericIPAddressField(default="127.0.0.1")
    created_at = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(auto_created=True, null=True, blank=True)
    duration_minutes = models.PositiveIntegerField()
    disconnected = models.BooleanField(default=False)
    data_used = models.BigIntegerField(default=0)  # bytes
    package = models.ForeignKey(Package, on_delete=models.SET_NULL, null=True, blank=True)
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    disconnected_at = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('disconnected', 'Disconnected'),
            ('expired', 'Expired')
        ],
        default='active'
    )

    @property
    def time_remaining(self):
        if self.end_time:
            remaining = (self.end_time - timezone.now()).total_seconds() / 60
            return max(0, round(remaining))
        return 0

    def is_expired(self):
        return timezone.now() > self.end_time if self.end_time else False

    def save(self, *args, **kwargs):
        if not self.end_time and self.duration_minutes:
            self.end_time = self.created_at + timezone.timedelta(minutes=self.duration_minutes)

        if not self.pk and not self.created_at:
            self.created_at = timezone.now()

        if self.end_time and timezone.now() > self.end_time:
            self.status = 'expired'
            self.is_active = False
            if not self.disconnected_at:
                self.disconnected_at = timezone.now()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.phone or self.device_mac} - {self.status}"
    
class Voucher(models.Model):
    code = models.CharField(max_length=100, unique=True)
    phone = models.CharField(max_length=50, default="")
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    payment = models.ForeignKey(Payment, related_name='vouchers', on_delete=models.CASCADE, default=None)
    quantity = models.PositiveIntegerField(default=1)
    
    def is_valid(self):
        return not self.is_used and (self.end_time is None or self.end_time > timezone.now())

    def __str__(self):
        return self.code
    
class MikroTikDevice(models.Model):
    name = models.CharField(max_length=100)
    ip = models.CharField(max_length=15)
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=100)  # Store encrypted
    port = models.CharField(max_length=5, default='8728')
    status = models.CharField(max_length=10, choices=[('Online', 'Online'), ('Offline', 'Offline')], default='Offline')
    lastUpdate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.ip})"