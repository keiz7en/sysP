from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Course(models.Model):
    """Course information"""
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField()
    instructor = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='courses')
    credits = models.IntegerField()
    duration_weeks = models.IntegerField()
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ]
    )

    # Course Status
    is_active = models.BooleanField(default=True)
    enrollment_limit = models.IntegerField(default=50)
    start_date = models.DateField()
    end_date = models.DateField()

    # AI-Enhanced Features
    learning_objectives = models.JSONField(default=list)
    prerequisites = models.JSONField(default=list)
    recommended_skills = models.JSONField(default=list)
    adaptive_content = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'


class CourseModule(models.Model):
    """Course modules/chapters"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.IntegerField()
    estimated_duration = models.DurationField()

    # AI Content Generation
    content_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Text'),
            ('video', 'Video'),
            ('interactive', 'Interactive'),
            ('quiz', 'Quiz'),
            ('assignment', 'Assignment'),
        ]
    )
    content_data = models.JSONField(default=dict)
    ai_generated = models.BooleanField(default=False)

    class Meta:
        db_table = 'course_modules'
        unique_together = ['course', 'order']


class CourseEnrollment(models.Model):
    """Student course enrollment"""
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrolled_students')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # AI Personalization
    personalized_path = models.JSONField(default=list)
    adaptive_settings = models.JSONField(default=dict)

    status = models.CharField(
        max_length=15,
        choices=[
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('dropped', 'Dropped'),
            ('suspended', 'Suspended'),
        ],
        default='active'
    )

    class Meta:
        db_table = 'course_enrollments'
        unique_together = ['student', 'course']


class LearningPath(models.Model):
    """AI-generated personalized learning paths"""
    enrollment = models.OneToOneField(CourseEnrollment, on_delete=models.CASCADE, related_name='learning_path')
    path_data = models.JSONField(default=list)  # Sequence of modules with personalization
    difficulty_adjustments = models.JSONField(default=dict)
    estimated_completion_time = models.DurationField()
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'learning_paths'


class GameificationProgress(models.Model):
    """Gamification elements for student engagement"""
    enrollment = models.OneToOneField(CourseEnrollment, on_delete=models.CASCADE, related_name='gamification')
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    badges = models.JSONField(default=list)
    achievements = models.JSONField(default=list)
    streak_days = models.IntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'gamification_progress'
