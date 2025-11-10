from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile


class UserSerializer(serializers.ModelSerializer):
    """User serializer for API responses"""
    # Add computed fields for related profiles
    employee_id = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()
    teaching_rating = serializers.SerializerMethodField()
    is_teacher_approved = serializers.SerializerMethodField()

    student_id = serializers.SerializerMethodField()
    current_gpa = serializers.SerializerMethodField()
    academic_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone_number', 'date_of_birth', 'address',
            'is_verified', 'created_at', 'updated_at', 'approval_status',
            # Teacher fields
            'employee_id', 'department', 'teaching_rating', 'is_teacher_approved',
            # Student fields  
            'student_id', 'current_gpa', 'academic_status'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_employee_id(self, obj):
        """Get teacher employee ID"""
        if obj.user_type == 'teacher' and hasattr(obj, 'teacher_profile'):
            return obj.teacher_profile.employee_id
        return None

    def get_department(self, obj):
        """Get teacher department"""
        if obj.user_type == 'teacher' and hasattr(obj, 'teacher_profile'):
            return obj.teacher_profile.department
        return None

    def get_teaching_rating(self, obj):
        """Get teacher rating"""
        if obj.user_type == 'teacher' and hasattr(obj, 'teacher_profile'):
            return float(obj.teacher_profile.teaching_rating)
        return None

    def get_is_teacher_approved(self, obj):
        """Get teacher approval status from profile"""
        if obj.user_type == 'teacher' and hasattr(obj, 'teacher_profile'):
            return obj.teacher_profile.is_approved
        return None

    def get_student_id(self, obj):
        """Get student ID"""
        if obj.user_type == 'student' and hasattr(obj, 'student_profile'):
            return obj.student_profile.student_id
        return None

    def get_current_gpa(self, obj):
        """Get student GPA"""
        if obj.user_type == 'student' and hasattr(obj, 'student_profile'):
            return float(obj.student_profile.current_gpa)
        return None

    def get_academic_status(self, obj):
        """Get student academic status"""
        if obj.user_type == 'student' and hasattr(obj, 'student_profile'):
            return obj.student_profile.academic_status
        return None


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
