from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.conf import settings
from django.utils import timezone


class User(AbstractUser):
    """Custom User model with additional fields"""
    USER_TYPES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
        ('parent', 'Parent'),
    )

    APPROVAL_STATUS = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user_type = models.CharField(max_length=10, choices=USER_TYPES, default='student')
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
        blank=True
    )
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)

    # Approval system
    approval_status = models.CharField(max_length=10, choices=APPROVAL_STATUS, default='approved')
    approved_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='approved_users')
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'


class UserProfile(models.Model):
    """Extended user profile information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    skills = models.JSONField(default=list, blank=True)
    interests = models.JSONField(default=list, blank=True)
    social_links = models.JSONField(default=dict, blank=True)
    preferred_language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='UTC')

    class Meta:
        db_table = 'user_profiles'


class TeacherApproval(models.Model):
    """Teacher approval requests tracking"""
    teacher = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_approval')
    qualifications = models.JSONField(default=list)  # List of qualifications/certificates
    experience_documents = models.JSONField(default=list)  # Document URLs
    department_preference = models.CharField(max_length=100, blank=True)
    specialization = models.JSONField(default=list)
    reason_for_joining = models.TextField(blank=True)

    # Admin review
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='reviewed_approvals')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'teacher_approvals'


class SystemSettings(models.Model):
    """System-wide configuration settings stored in database"""
    # User Management
    auto_approve_students = models.BooleanField(default=False)
    auto_approve_teachers = models.BooleanField(default=False)
    allow_public_registration = models.BooleanField(default=True)

    # Security
    require_email_verification = models.BooleanField(default=True)
    max_login_attempts = models.IntegerField(default=3)
    session_timeout = models.IntegerField(default=1440)  # minutes

    # Maintenance
    maintenance_mode = models.BooleanField(default=False)
    backup_frequency = models.CharField(
        max_length=20,
        choices=[
            ('hourly', 'Hourly'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
        ],
        default='daily'
    )

    # Notifications
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    in_app_notifications = models.BooleanField(default=True)

    # Metadata
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'system_settings'
        verbose_name = 'System Settings'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f"System Settings (Updated: {self.updated_at})"

    @classmethod
    def get_settings(cls):
        """Get or create system settings singleton"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings


class AccessibilityProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                related_name='accessibility_profile')
    settings = models.JSONField(default=dict, blank=True)
    last_updated = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"AccessibilityProfile for {self.user.username}"
