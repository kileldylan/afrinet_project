from rest_framework import serializers
from .models import HostspotUser, Payment, Session, Package, Voucher, MikroTikDevice
from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'phone', 'is_staff']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        min_length=8
    )
    confirmPassword = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    is_staff = serializers.BooleanField(
        write_only=True,
        default=False  # Default to False for normal users
    )
    is_superuser = serializers.BooleanField(
        write_only=True,
        default=False  # Default to False for normal users
    )

    class Meta:
        model = CustomUser
        fields = ['email', 'name', 'phone', 'password', 'confirmPassword', 'is_staff', 'is_superuser']
        extra_kwargs = {
            'password': {'write_only': True},
            'confirmPassword': {'write_only': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['confirmPassword']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        if len(attrs['password']) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters."})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirmPassword')
        is_staff = validated_data.pop('is_staff', False)
        is_superuser = validated_data.pop('is_superuser', False)
        
        user = CustomUser.objects.create_user(
            **validated_data,
            is_staff=is_staff,
            is_superuser=is_superuser
        )
        return user
    
class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['user'] = user
            else:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")
        return data
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = HostspotUser
        fields = [
            'id', 'username', 'phone', 'user_type', 
            'status', 'package', 'expiry_date', 'last_online'
        ]
    
    package = serializers.StringRelatedField()

class SessionSerializer(serializers.ModelSerializer):
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Session
        fields = '__all__'
    
    def get_time_remaining(self, obj):
        return obj.time_remaining
        
class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'package_id', 'package_name', 'price', 'duration_value', 'duration_unit', 'speed', 'popular']

class PaymentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    package = serializers.StringRelatedField()
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'phone',  # Changed from phone_number to phone
            'amount',
            'mpesa_receipt',
            'status',
            'created_at',
            'package',
            'is_checked',
            'is_finished',
            'is_successful',
            'completed_at',
            'transaction_id'
        ]

class PaymentInitiationSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=15)  # Changed from phone_number to phone
    package_id = serializers.CharField(max_length=10)

    def validate_phone(self, value):  # Changed from validate_phone_number
        value = value.strip()
        if not value.startswith(('07', '01', '+254', '254')):
            raise serializers.ValidationError("Invalid phone number format")
        return value

    def validate_package_id(self, value):
        if not Package.objects.filter(package_id=value).exists():
            raise serializers.ValidationError("Invalid package ID")
        return value

class VoucherSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Voucher
        fields = '__all__'
        read_only_fields = fields
        
    def get_is_valid(self, obj):
        return obj.is_valid()

class MikroTikDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MikroTikDevice
        fields = ['id', 'name', 'ip', 'username', 'password', 'port', 'status', 'lastUpdate']
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': False,  # Not required for updates
                'allow_blank': True  # Allow blank for updates
            },
            'status': {'read_only': True},
            'lastUpdate': {'read_only': True}
        }

    def validate(self, data):
        # Require password for new devices
        if not self.instance and not data.get('password'):
            raise serializers.ValidationError({'password': 'Password is required for new devices'})
        return data