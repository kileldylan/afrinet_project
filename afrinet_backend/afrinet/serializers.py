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
        fields = ['id', 'package_id', 'price', 'duration_value', 'duration_unit', 'speed', 'popular']

class PaymentInitiationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)
    package_id = serializers.CharField(max_length=10)  # Changed to CharField to match Package.package_id

    def validate_phone_number(self, value):
        value = value.strip()
        if not value.startswith(('07', '01', '+254', '254')):
            raise serializers.ValidationError("Invalid phone number format")
        return value

    def validate_package_id(self, value):
        try:
            Package.objects.get(package_id=value)  # Validate against custom package_id field
            return value
        except Package.DoesNotExist:
            raise serializers.ValidationError("Invalid package ID")