from rest_framework import serializers
from .models import User, Payment, Session, Package, Voucher, MikroTikDevice

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
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
    
    def get_is_valid(self, obj):
        return obj.is_valid()

class MikroTikDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MikroTikDevice
        fields = ['id', 'name', 'ip', 'username', 'port', 'status', 'lastUpdate']
        extra_kwargs = {
            'password': {'write_only': True},
            'status': {'read_only': True},
            'lastUpdate': {'read_only': True}
        }