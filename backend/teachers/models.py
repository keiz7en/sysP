from django.db import models
from users.models import User


class TeacherProfile(models.Model):
    """Extended profile for teachers"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    specialization = models.JSONField(default=list)  # List of subjects/skills
    qualifications = models.JSONField(default=list)  # Educational qualifications
    experience_years = models.IntegerField(default=0)
    hire_date = models.DateField()

    # Performance Metrics
    teaching_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    student_satisfaction = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    course_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # AI Analysis Fields
    teaching_style = models.CharField(
        max_length=20,
        choices=[
            ('traditional', 'Traditional'),
            ('interactive', 'Interactive'),
            ('collaborative', 'Collaborative'),
            ('adaptive', 'Adaptive'),
        ],
        default='traditional'
    )
    preferred_tools = models.JSONField(default=list)

    class Meta:
        db_table = 'teacher_profiles'


class TeachingSchedule(models.Model):
    """Teacher's teaching schedule"""
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name='schedules')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE)
    day_of_week = models.CharField(
        max_length=10,
        choices=[
            ('monday', 'Monday'),
            ('tuesday', 'Tuesday'),
            ('wednesday', 'Wednesday'),
            ('thursday', 'Thursday'),
            ('friday', 'Friday'),
            ('saturday', 'Saturday'),
            ('sunday', 'Sunday'),
        ]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    classroom = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'teaching_schedules'


class TeacherPerformanceMetrics(models.Model):
    """AI-analyzed teacher performance metrics"""
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name='performance_metrics')
    date = models.DateField()
    engagement_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    content_delivery_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    student_interaction_frequency = models.IntegerField(default=0)
    feedback_response_time = models.DurationField(null=True, blank=True)
    innovative_teaching_methods = models.IntegerField(default=0)

    class Meta:
        db_table = 'teacher_performance_metrics'
        unique_together = ['teacher', 'date']
