from django.db import models
from users.models import User


class TeacherProfile(models.Model):
    """Extended profile for teachers with subject management"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.CharField(max_length=100)
    specialization = models.JSONField(default=list)
    qualifications = models.JSONField(default=list)
    experience_years = models.IntegerField(default=0)
    hire_date = models.DateField(auto_now_add=True)

    # Approval system
    is_approved = models.BooleanField(default=False)
    approval_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_teachers')
    approved_at = models.DateTimeField(null=True, blank=True)

    # Performance Metrics
    teaching_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00,
                                         help_text="Average rating from students")
    total_ratings = models.IntegerField(default=0, help_text="Total number of ratings received")
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
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.employee_id})"
    
    def get_approved_subjects(self):
        """Get all approved subjects for this teacher"""
        return self.approved_subjects.all()
    
    def get_pending_subject_requests(self):
        """Get pending subject requests"""
        return self.subject_requests.filter(status='pending')
    
    def can_teach_subject(self, subject):
        """Check if teacher is approved to teach a specific subject"""
        return self.approved_subjects.filter(subject=subject).exists()
    
    def can_create_course_in_subject(self, subject):
        """Check if teacher can create a course in a specific subject"""
        return self.is_approved and self.can_teach_subject(subject)

    def update_average_rating(self, new_rating):
        """Update average rating based on new rating"""
        self.total_ratings += 1
        self.average_rating = ((self.average_rating * (self.total_ratings - 1)) + new_rating) / self.total_ratings
        self.save()


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
