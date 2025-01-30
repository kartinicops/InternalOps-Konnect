from rest_framework import serializers
from .models import Users
class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ["user_id", "user_first_name", "user_last_name", "email", "password"]
    
    def update(self, instance, validated_data):
        # Check if the password is being updated
        password = validated_data.get('password', None)
        if password:
            # Use set_password to hash the password
            instance.set_password(password)
            validated_data.pop('password', None)  # Remove password to prevent overwriting

        # Update the rest of the fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance