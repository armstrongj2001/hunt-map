from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """Handles new user sign-up. Password is write-only so it never comes back in responses."""
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'display_name')

    def create(self, validated_data):
        # Use create_user so Django hashes the password properly
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            display_name=validated_data.get('display_name', ''),
        )


class UserProfileSerializer(serializers.ModelSerializer):
    """Read/update the current user's profile."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'display_name', 'avatar_url', 'date_joined')
        read_only_fields = ('id', 'username', 'date_joined')
