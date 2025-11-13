from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError

User = get_user_model()


class Subject(models.Model):
    """Subject categories that teachers can teach"""
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=50,
        choices=[
            ('mathematics', 'Mathematics'),
            ('science', 'Science'),
            ('physics', 'Physics'),
            ('chemistry', 'Chemistry'),
            ('biology', 'Biology'),
            ('computer_science', 'Computer Science'),
            ('ai_ml', 'AI & Machine Learning'),
            ('languages', 'Languages'),
            ('social_studies', 'Social Studies'),
            ('arts', 'Arts'),
            ('commerce', 'Commerce'),
            ('other', 'Other'),
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subjects'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class TeacherSubjectRequest(models.Model):
    """Tracks teacher requests to teach specific subjects"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    teacher = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='subject_requests')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_requests')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    request_date = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_subject_requests')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    class Meta:
        db_table = 'teacher_subject_requests'
        unique_together = ['teacher', 'subject']
        ordering = ['-request_date']

    def __str__(self):
        return f"{self.teacher.user.username} - {self.subject.name} ({self.status})"


class TeacherApprovedSubject(models.Model):
    """Tracks approved subjects for teachers (after admin approval)"""
    teacher = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='approved_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_approvals')
    approved_date = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='subject_approvals')
    
    class Meta:
        db_table = 'teacher_approved_subjects'
        unique_together = ['teacher', 'subject']

    def __str__(self):
        return f"{self.teacher.user.username} -> {self.subject.name}"


class Course(models.Model):
    """Course model linking teachers and students"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]
    
    title = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='courses')
    instructor = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='courses')
    credits = models.IntegerField(default=3)
    enrollment_limit = models.IntegerField(default=30)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='intermediate'
    )

    # Status and approval chain
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_open_for_enrollment = models.BooleanField(default=False)
    
    # Course schedule
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    # AI Content tracking
    ai_content_enabled = models.BooleanField(default=False)
    syllabus_ai_generated = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['title']
        indexes = [
            models.Index(fields=['instructor', 'status']),
            models.Index(fields=['subject', 'status']),
        ]

    def __str__(self):
        return f'{self.code} - {self.title}'

    @property
    def enrolled_count(self):
        return self.enrollments.filter(status='active').count()

    @property
    def is_full(self):
        # No enrollment limit - always allow enrollment
        return False
    
    def is_approved_and_open(self):
        """Check if course is approved/active and open for enrollment"""
        return self.status in ['approved', 'active'] and self.is_open_for_enrollment
    
    def can_enable_ai_features(self):
        """Check if AI features should be enabled for this course"""
        return self.status == 'approved' and self.ai_content_enabled


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
    """Student enrollment in courses with approval chain"""
    ENROLLMENT_STATUS_CHOICES = [
        ('pending', 'Pending Teacher Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('suspended', 'Suspended'),
    ]
    
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=ENROLLMENT_STATUS_CHOICES, default='pending')
    
    # Approval tracking
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_enrollments')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # AI Access Control
    ai_features_unlocked = models.BooleanField(default=False)
    ai_unlock_date = models.DateTimeField(null=True, blank=True)

    # Academic tracking
    grade = models.CharField(max_length=5, blank=True)
    completion_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    final_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'course_enrollments'
        unique_together = ['student', 'course']
        ordering = ['-enrollment_date']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['course', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.user.username} - {self.course.code}"
    
    def is_ai_enabled(self):
        """Check if AI features should be enabled for this enrollment"""
        return (
            self.status in ['active', 'approved'] and
            self.ai_features_unlocked and
            self.course.can_enable_ai_features()
        )
    
    def approve_enrollment(self, approved_by_user):
        """Approve enrollment and unlock AI features"""
        from django.utils import timezone
        self.status = 'active'
        self.approved_by = approved_by_user
        self.approved_at = timezone.now()
        self.ai_features_unlocked = True
        self.ai_unlock_date = timezone.now()
        self.save()
    
    def reject_enrollment(self, reason=''):
        """Reject enrollment"""
        self.status = 'rejected'
        self.rejection_reason = reason
        self.ai_features_unlocked = False
        self.save()
    
    def lock_ai_features(self):
        """Lock AI features if conditions are not met"""
        self.ai_features_unlocked = False
        self.save()
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
