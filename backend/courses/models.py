from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Course(models.Model):
    """Course model linking teachers and students"""
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    instructor = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='courses')
    credits = models.IntegerField(default=3)
    enrollment_limit = models.IntegerField(default=30)
    is_active = models.BooleanField(default=True)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='intermediate'
    )

    # Course schedule
    start_date = models.DateField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['title']

    def __str__(self):
        return f'{self.code} - {self.title}'

    @property
    def enrolled_count(self):
        return self.enrollments.filter(status='active').count()

    @property
    def is_full(self):
        return self.enrolled_count >= self.enrollment_limit


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
    """Student enrollment in courses"""
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('suspended', 'Suspended'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Academic tracking
    grade = models.CharField(max_length=5, blank=True)  # A+, A, B+, etc.
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    final_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'course_enrollments'
        unique_together = ['student', 'course']
        ordering = ['-enrollment_date']

    def __str__(self):
        return f'{self.student.user.get_full_name()} - {self.course.title}'


class Assignment(models.Model):
    """Assignments for courses"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    ASSIGNMENT_TYPES = [
        ('homework', 'Homework'),
        ('quiz', 'Quiz'),
        ('exam', 'Exam'),
        ('project', 'Project'),
        ('lab', 'Lab Assignment'),
        ('essay', 'Essay'),
    ]
    assignment_type = models.CharField(max_length=20, choices=ASSIGNMENT_TYPES, default='homework')

    max_points = models.DecimalField(max_digits=6, decimal_places=2, default=100.00)
    due_date = models.DateTimeField()
    is_published = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assignments'
        ordering = ['due_date']

    def __str__(self):
        return f'{self.course.code} - {self.title}'


class AssignmentSubmission(models.Model):
    """Student submissions for assignments"""
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='submissions')

    submission_text = models.TextField(blank=True)
    file_upload = models.FileField(upload_to='assignments/', blank=True, null=True)

    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late = models.BooleanField(default=False)

    # Grading
    points_earned = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    graded_by = models.ForeignKey('teachers.TeacherProfile', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'assignment_submissions'
        unique_together = ['assignment', 'student']
        ordering = ['-submitted_at']

    def __str__(self):
        return f'{self.student.user.get_full_name()} - {self.assignment.title}'

    @property
    def percentage_score(self):
        if self.points_earned and self.assignment.max_points:
            return (self.points_earned / self.assignment.max_points) * 100
        return 0


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
