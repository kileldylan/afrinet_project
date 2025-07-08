from rest_framework import serializers
from .models import User, Payment, Session, Package

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'phone', 'user_type', 
            'status', 'package', 'expiry_date', 'last_online'
        ]
    
    package = serializers.StringRelatedField()

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'
        
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