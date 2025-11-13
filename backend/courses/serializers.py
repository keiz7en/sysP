from rest_framework import serializers
from .models import (
    Subject, TeacherSubjectRequest, TeacherApprovedSubject,
    Course, CourseModule, CourseEnrollment, LearningPath, GameificationProgress
)


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description', 'category', 'created_at']
        read_only_fields = ['created_at']


class TeacherSubjectRequestSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    teacher_email = serializers.CharField(source='teacher.user.email', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = TeacherSubjectRequest
        fields = [
            'id', 'teacher', 'teacher_name', 'teacher_email', 'subject', 'subject_name', 'subject_code',
            'status', 'request_date', 'approved_by', 'approved_by_name', 'approved_at', 'rejection_reason'
        ]
        read_only_fields = ['request_date', 'approved_at', 'approved_by']


class TeacherApprovedSubjectSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True)
    
    class Meta:
        model = TeacherApprovedSubject
        fields = [
            'id', 'teacher', 'teacher_name', 'subject', 'subject_name', 'subject_code',
            'approved_date', 'approved_by', 'approved_by_name'
        ]
        read_only_fields = ['approved_date']


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for courses"""
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    instructor_name = serializers.CharField(source='instructor.user.get_full_name', read_only=True)
    instructor_email = serializers.CharField(source='instructor.user.email', read_only=True)
    enrollment_count = serializers.IntegerField(source='enrolled_count', read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    is_approved_and_open = serializers.SerializerMethodField()
    can_enable_ai = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'code', 'description', 'subject', 'subject_name', 'subject_code',
            'instructor', 'instructor_name', 'instructor_email', 'credits', 'enrollment_limit',
            'difficulty_level', 'status', 'is_open_for_enrollment', 'ai_content_enabled',
            'syllabus_ai_generated', 'start_date', 'end_date', 'enrollment_count', 'is_full',
            'is_approved_and_open', 'can_enable_ai', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'enrollment_count', 'is_full']
    
    def get_is_approved_and_open(self, obj):
        return obj.is_approved_and_open()
    
    def get_can_enable_ai(self, obj):
        return obj.can_enable_ai_features()


class CourseEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for course enrollments"""
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    student_email = serializers.CharField(source='student.user.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.get_full_name', read_only=True, allow_null=True)
    is_ai_enabled = serializers.SerializerMethodField()

    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'student', 'student_name', 'student_email', 'course', 'course_title', 'course_code',
            'enrollment_date', 'status', 'approved_by', 'approved_by_name', 'approved_at',
            'rejection_reason', 'ai_features_unlocked', 'ai_unlock_date', 'is_ai_enabled',
            'grade', 'completion_percentage', 'final_score', 'created_at', 'updated_at'
        ]
        read_only_fields = ['enrollment_date', 'approved_at', 'ai_unlock_date', 'created_at', 'updated_at']
    
    def get_is_ai_enabled(self, obj):
        return obj.is_ai_enabled()


class CourseDetailSerializer(CourseSerializer):
    """Detailed course view with enrollment information"""
    enrollments = serializers.SerializerMethodField()
    pending_enrollments_count = serializers.SerializerMethodField()

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['enrollments', 'pending_enrollments_count']

    def get_enrollments(self, obj):
        enrollments = obj.enrollments.all()
        return CourseEnrollmentSerializer(enrollments, many=True).data

    def get_pending_enrollments_count(self, obj):
        return obj.enrollments.filter(status='pending').count()


class CourseModuleSerializer(serializers.ModelSerializer):
    """Serializer for course modules"""
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = CourseModule
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
