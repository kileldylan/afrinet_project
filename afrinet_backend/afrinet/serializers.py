from rest_framework import serializers
from .models import User, Payment, Session, Package

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
    
class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'package_id', 'price', 'duration', 'speed', 'popular']
        
class PaymentInitiationSerializer(serializers.Serializer):
    phone_number = serializers.CharField(
        required=True,
        min_length=9,
        max_length=12,
        help_text="Phone number with or without country code (e.g., 712345678 or 254712345678)"
    )
    package_id = serializers.IntegerField(
        required=True,
        min_value=1,
        help_text="ID of the selected package"
    )
    
    def validate_phone_number(self, value):
        """Validate and normalize Kenyan phone number format"""
        # Remove any non-digit characters
        value = ''.join(filter(str.isdigit, value))
        
        # Convert to international format if in local format
        if value.startswith('0'):
            value = '254' + value[1:]
        elif len(value) == 9 and value[0] in ('7', '1'):
            value = '254' + value
            
        # Final validation
        if not value.startswith('254'):
            raise serializers.ValidationError("Phone number must be Kenyan (+254)")
        if len(value) != 12:
            raise serializers.ValidationError("Invalid phone number length")
        if not value[3:].isdigit():
            raise serializers.ValidationError("Invalid phone number format")
            
        return value