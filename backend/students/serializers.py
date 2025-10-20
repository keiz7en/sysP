from rest_framework import serializers
from .models import StudentProfile, AcademicRecord, AttendanceRecord, LearningProgress, StudentBehaviorMetrics


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for student profiles"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = StudentProfile
        fields = '__all__'
        read_only_fields = ('student_id', 'enrollment_date')

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email,
            'user_type': obj.user.user_type,
            'approval_status': obj.user.approval_status
        }


class AcademicRecordSerializer(serializers.ModelSerializer):
    """Serializer for academic records"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)

    class Meta:
        model = AcademicRecord
        fields = '__all__'


class AttendanceRecordSerializer(serializers.ModelSerializer):
    """Serializer for attendance records"""
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'


class LearningProgressSerializer(serializers.ModelSerializer):
    """Serializer for learning progress"""
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = LearningProgress
        fields = '__all__'


class StudentBehaviorMetricsSerializer(serializers.ModelSerializer):
    """Serializer for student behavior metrics"""

    class Meta:
        model = StudentBehaviorMetrics
        fields = '__all__'
