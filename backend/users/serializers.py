from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile


class UserSerializer(serializers.ModelSerializer):
    """User serializer for API responses"""

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone_number', 'date_of_birth', 'address',
            'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer"""
    class Meta:
        model = UserProfile
        fields = [
            'bio', 'skills', 'interests', 'social_links',
            'preferred_language', 'timezone'
        ]


class LoginSerializer(serializers.Serializer):
    """Login serializer for authentication"""
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128, write_only=True)
    user_type = serializers.ChoiceField(
        choices=[
            ('student', 'Student'),
            ('teacher', 'Teacher'),
            ('admin', 'Admin'),
        ]
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        user_type = attrs.get('user_type')

        if username and password:
            user = authenticate(username=username, password=password)

            if not user:
                raise serializers.ValidationError('Invalid credentials')

            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')

            if user.user_type != user_type:
                raise serializers.ValidationError(f'This account is not registered as {user_type}')

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Username and password are required')


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information"""
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'date_of_birth', 'address'
        ]

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value


class RegisterSerializer(serializers.ModelSerializer):
    """Registration serializer"""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(
        choices=[
            ('student', 'Student'),
            ('teacher', 'Teacher'),
        ]
    )

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'first_name', 'last_name', 'user_type', 'phone_number',
            'date_of_birth', 'address'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user
