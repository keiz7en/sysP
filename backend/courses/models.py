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


class TeacherRating(models.Model):
    """Student ratings and reviews for teachers after course completion"""
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='teacher_ratings')
    teacher = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='ratings_received')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='teacher_ratings')
    enrollment = models.OneToOneField(CourseEnrollment, on_delete=models.CASCADE, related_name='teacher_rating')

    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)], help_text="Rating from 1 to 5")
    feedback = models.TextField(blank=True, help_text="Optional feedback from student")

    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Visibility control
    is_visible_to_teacher = models.BooleanField(default=True)
    is_visible_to_admin = models.BooleanField(default=True)

    class Meta:
        db_table = 'teacher_ratings'
        unique_together = ['student', 'teacher', 'course']
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['teacher', 'rating']),
            models.Index(fields=['course']),
        ]

    def __str__(self):
        return f"{self.student.user.get_full_name()} rated {self.teacher.user.get_full_name()} - {self.rating}/5"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update teacher's average rating
        self.teacher.update_average_rating()


class Grade(models.Model):
    """Final grade record for completed courses"""
    enrollment = models.OneToOneField(CourseEnrollment, on_delete=models.CASCADE, related_name='final_grade')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grades')
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='grades')
    teacher = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='grades_assigned')

    # Grade components
    final_score = models.DecimalField(max_digits=5, decimal_places=2, help_text="Final percentage score")
    letter_grade = models.CharField(max_length=5, help_text="A, B, C, D, F, etc.")
    grade_points = models.DecimalField(max_digits=3, decimal_places=2, help_text="GPA points (4.0 scale)")

    # Breakdown
    assignments_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    quizzes_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    exams_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    projects_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    participation_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Remarks and publishing
    remarks = models.TextField(blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'grades'
        unique_together = ['enrollment', 'course', 'student']
        ordering = ['-published_at']
        indexes = [
            models.Index(fields=['student', 'is_published']),
            models.Index(fields=['teacher', 'course']),
        ]

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.course.code} - {self.letter_grade}"

    def calculate_letter_grade(self):
        """Calculate letter grade from final score"""
        score = float(self.final_score)
        if score >= 93:
            return 'A'
        elif score >= 90:
            return 'A-'
        elif score >= 87:
            return 'B+'
        elif score >= 83:
            return 'B'
        elif score >= 80:
            return 'B-'
        elif score >= 77:
            return 'C+'
        elif score >= 73:
            return 'C'
        elif score >= 70:
            return 'C-'
        elif score >= 60:
            return 'D'
        else:
            return 'F'

    def calculate_grade_points(self):
        """Calculate GPA points from letter grade"""
        grade_map = {
            'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D': 1.0, 'F': 0.0
        }
        return grade_map.get(self.letter_grade, 0.0)

    def publish_grade(self):
        """Publish grade to student and trigger notifications"""
        from django.utils import timezone
        self.is_published = True
        self.published_at = timezone.now()
        self.save()

        # Update enrollment final score
        self.enrollment.final_score = self.final_score
        self.enrollment.grade = self.letter_grade
        self.enrollment.status = 'completed'
        self.enrollment.completion_percentage = 100
        self.enrollment.save()

        # TODO: Trigger notification to student and admin


class Notification(models.Model):
    """Real-time notification system for all users"""
    NOTIFICATION_TYPES = [
        ('enrollment_approved', 'Enrollment Approved'),
        ('enrollment_rejected', 'Enrollment Rejected'),
        ('submission_graded', 'Submission Graded'),
        ('grade_published', 'Grade Published'),
        ('certificate_ready', 'Certificate Ready'),
        ('ai_feedback_ready', 'AI Feedback Ready'),
        ('course_update', 'Course Update'),
        ('system_alert', 'System Alert'),
        ('teacher_message', 'Teacher Message'),
        ('assignment_due', 'Assignment Due'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()

    # Optional link to related object
    related_model = models.CharField(max_length=50, blank=True)
    related_id = models.UUIDField(null=True, blank=True)

    # Metadata
    metadata = models.JSONField(default=dict, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.read_at = timezone.now()
        self.save()


class ActivityLog(models.Model):
    """System-wide activity logging for audit and compliance"""
    ACTION_TYPES = [
        ('enrollment_request', 'Enrollment Request'),
        ('enrollment_approval', 'Enrollment Approval'),
        ('enrollment_rejection', 'Enrollment Rejection'),
        ('grade_submission', 'Grade Submission'),
        ('grade_update', 'Grade Update'),
        ('grade_publish', 'Grade Publish'),
        ('feedback_generation', 'Feedback Generation'),
        ('certificate_generation', 'Certificate Generation'),
        ('course_creation', 'Course Creation'),
        ('course_update', 'Course Update'),
        ('user_login', 'User Login'),
        ('user_logout', 'User Logout'),
        ('ai_access', 'AI Feature Access'),
        ('rating_submission', 'Rating Submission'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='activity_logs')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    description = models.TextField()

    # Link to affected model
    target_model = models.CharField(max_length=50, blank=True)
    target_id = models.UUIDField(null=True, blank=True)

    # Additional context
    metadata = models.JSONField(default=dict, blank=True)

    # IP and device tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action_type', 'timestamp']),
            models.Index(fields=['target_model', 'target_id']),
        ]

    def __str__(self):
        return f"{self.user.username if self.user else 'System'} - {self.action_type} at {self.timestamp}"


class Certificate(models.Model):
    """Course completion certificates"""
    enrollment = models.OneToOneField(CourseEnrollment, on_delete=models.CASCADE, related_name='certificate')
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    teacher = models.ForeignKey('teachers.TeacherProfile', on_delete=models.CASCADE, related_name='certificates_issued')

    # Certificate details
    certificate_id = models.CharField(max_length=50, unique=True, editable=False)
    issue_date = models.DateField(auto_now_add=True)

    # Academic info
    final_grade = models.CharField(max_length=5)
    grade_points = models.DecimalField(max_digits=3, decimal_places=2)

    # Certificate file
    certificate_pdf = models.FileField(upload_to='certificates/', blank=True, null=True)

    # Verification
    verification_code = models.CharField(max_length=100, unique=True, editable=False)
    is_verified = models.BooleanField(default=True)

    # Metadata
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'certificates'
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['student', 'issue_date']),
            models.Index(fields=['certificate_id']),
            models.Index(fields=['verification_code']),
        ]

    def __str__(self):
        return f"Certificate {self.certificate_id} - {self.student.user.get_full_name()}"

    def save(self, *args, **kwargs):
        if not self.certificate_id:
            import uuid
            from datetime import datetime
            self.certificate_id = f"CERT-{datetime.now().year}-{uuid.uuid4().hex[:8].upper()}"
        if not self.verification_code:
            import hashlib
            import uuid
            raw = f"{self.certificate_id}-{uuid.uuid4()}"
            self.verification_code = hashlib.sha256(raw.encode()).hexdigest()[:16].upper()
        super().save(*args, **kwargs)


class StudentFeedback(models.Model):
    """AI-generated personalized feedback for students"""
    submission = models.OneToOneField(AssignmentSubmission, on_delete=models.CASCADE, related_name='ai_feedback',
                                      null=True, blank=True)
    enrollment = models.ForeignKey(CourseEnrollment, on_delete=models.CASCADE, related_name='feedbacks', null=True,
                                   blank=True)
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='feedbacks')

    # Feedback content
    feedback_text = models.TextField()
    strengths = models.JSONField(default=list, blank=True)
    weaknesses = models.JSONField(default=list, blank=True)
    recommendations = models.JSONField(default=list, blank=True)

    # Predictions
    predicted_next_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    risk_level = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low Risk'),
            ('medium', 'Medium Risk'),
            ('high', 'High Risk'),
        ],
        default='low'
    )

    # Remedial suggestions
    suggested_modules = models.JSONField(default=list, blank=True)
    estimated_improvement_time = models.DurationField(null=True, blank=True)

    # AI metadata
    ai_model_version = models.CharField(max_length=50, default='gemini-pro')
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.85)

    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_feedbacks'
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['student', 'generated_at']),
            models.Index(fields=['enrollment']),
        ]

    def __str__(self):
        return f"Feedback for {self.student.user.get_full_name()} - {self.generated_at.date()}"
