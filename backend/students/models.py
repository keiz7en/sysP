from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class StudentProfile(models.Model):
    """Extended profile for students"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=20, unique=True)
    grade_level = models.CharField(max_length=20, blank=True)
    enrollment_date = models.DateField(auto_now_add=True)
    guardian_name = models.CharField(max_length=100, blank=True)
    guardian_phone = models.CharField(max_length=15, blank=True)
    guardian_email = models.EmailField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=15, blank=True)
    medical_info = models.TextField(blank=True)

    # Academic Information
    current_gpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.00)
    total_credits = models.IntegerField(default=0)
    academic_status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('probation', 'Academic Probation'),
            ('suspended', 'Suspended'),
            ('graduated', 'Graduated'),
        ],
        default='active'
    )

    # AI Learning Preferences
    learning_style = models.CharField(
        max_length=20,
        choices=[
            ('visual', 'Visual'),
            ('auditory', 'Auditory'),
            ('kinesthetic', 'Kinesthetic'),
            ('reading', 'Reading/Writing'),
        ],
        blank=True
    )
    preferred_difficulty = models.CharField(
        max_length=20,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
            ('adaptive', 'Adaptive'),
        ],
        default='adaptive'
    )

    class Meta:
        db_table = 'student_profiles'


class AcademicRecord(models.Model):
    """Student academic performance record"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='academic_records')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    semester = models.CharField(max_length=20)
    year = models.IntegerField()
    grade = models.CharField(max_length=5)
    credits = models.IntegerField()
    gpa_points = models.DecimalField(max_digits=4, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academic_records'
        unique_together = ['student', 'course', 'semester', 'year']


class AttendanceRecord(models.Model):
    """Student attendance tracking"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attendance_records')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(
        max_length=10,
        choices=[
            ('present', 'Present'),
            ('absent', 'Absent'),
            ('late', 'Late'),
            ('excused', 'Excused'),
        ]
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance_records'
        unique_together = ['student', 'course', 'date']


class LearningProgress(models.Model):
    """AI-tracked learning progress"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='learning_progress')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    topic = models.CharField(max_length=200)
    mastery_level = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # 0-100%
    time_spent = models.DurationField()
    last_interaction = models.DateTimeField(auto_now=True)
    difficulty_adjustments = models.JSONField(default=list)
    performance_trends = models.JSONField(default=list)

    class Meta:
        db_table = 'learning_progress'
        unique_together = ['student', 'course', 'topic']


class StudentBehaviorMetrics(models.Model):
    """AI-analyzed student behavior and engagement metrics"""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='behavior_metrics')
    date = models.DateField()
    engagement_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    participation_level = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ]
    )
    quiz_attempts = models.IntegerField(default=0)
    average_response_time = models.DurationField(null=True, blank=True)
    help_requests = models.IntegerField(default=0)
    collaborative_activities = models.IntegerField(default=0)

    class Meta:
        db_table = 'student_behavior_metrics'
        unique_together = ['student', 'date']
