from rest_framework import serializers
from .models import Course, CourseModule, CourseEnrollment, LearningPath, GameificationProgress


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for courses"""
    instructor_name = serializers.CharField(source='instructor.user.get_full_name', read_only=True)
    enrollment_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_enrollment_count(self, obj):
        return CourseEnrollment.objects.filter(course=obj, status='active').count()


class CourseModuleSerializer(serializers.ModelSerializer):
    """Serializer for course modules"""
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = CourseModule
        fields = '__all__'


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for course enrollments"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)

    class Meta:
        model = CourseEnrollment
        fields = '__all__'


class LearningPathSerializer(serializers.ModelSerializer):
    """Serializer for learning paths"""

    class Meta:
        model = LearningPath
        fields = '__all__'


class GameificationProgressSerializer(serializers.ModelSerializer):
    """Serializer for gamification progress"""

    class Meta:
        model = GameificationProgress
        fields = '__all__'
