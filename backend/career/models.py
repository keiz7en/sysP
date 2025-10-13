from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class SkillCategory(models.Model):
    """Categories for organizing skills"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent_category = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'skill_categories'
        verbose_name_plural = 'Skill Categories'


class Skill(models.Model):
    """Skills that can be acquired or required"""
    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills')
    description = models.TextField(blank=True)
    is_technical = models.BooleanField(default=True)
    market_demand = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('critical', 'Critical'),
        ],
        default='medium'
    )

    class Meta:
        db_table = 'skills'


class StudentSkillProfile(models.Model):
    """Student's skill assessment and tracking"""
    student = models.OneToOneField('students.StudentProfile', on_delete=models.CASCADE, related_name='skill_profile')
    skills = models.ManyToManyField(Skill, through='StudentSkillLevel')

    # AI Analysis
    skill_gaps = models.JSONField(default=list)
    recommended_skills = models.JSONField(default=list)
    career_recommendations = models.JSONField(default=list)

    last_assessed = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_skill_profiles'


class StudentSkillLevel(models.Model):
    """Student's proficiency level in specific skills"""
    student_profile = models.ForeignKey(StudentSkillProfile, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)

    proficiency_level = models.CharField(
        max_length=15,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert'),
        ]
    )

    # AI Assessment
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)  # 0-1
    verified = models.BooleanField(default=False)  # Through assessments/certifications

    # Progress Tracking
    acquisition_date = models.DateTimeField(auto_now_add=True)
    last_practiced = models.DateTimeField(null=True, blank=True)
    practice_hours = models.IntegerField(default=0)

    class Meta:
        db_table = 'student_skill_levels'
        unique_together = ['student_profile', 'skill']


class JobMarketData(models.Model):
    """Job market information and trends"""
    job_title = models.CharField(max_length=200)
    industry = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True)

    # Requirements
    required_skills = models.ManyToManyField(Skill, related_name='required_for_jobs')
    preferred_skills = models.ManyToManyField(Skill, related_name='preferred_for_jobs')
    experience_level = models.CharField(
        max_length=15,
        choices=[
            ('entry', 'Entry Level'),
            ('junior', 'Junior'),
            ('mid', 'Mid Level'),
            ('senior', 'Senior'),
            ('lead', 'Lead/Manager'),
        ]
    )

    # Market Data
    average_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    job_demand = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
            ('critical', 'Critical'),
        ],
        default='medium'
    )

    # AI Analysis
    growth_projection = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Percentage
    automation_risk = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ],
        default='low'
    )

    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'job_market_data'


class Resume(models.Model):
    """Student resume management"""
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='resumes')
    title = models.CharField(max_length=200)

    # Personal Information
    objective = models.TextField(blank=True)
    summary = models.TextField(blank=True)

    # Experience & Education stored as JSON for flexibility
    experience = models.JSONField(default=list)
    education = models.JSONField(default=list)
    projects = models.JSONField(default=list)
    certifications = models.JSONField(default=list)

    # AI Enhancement
    ai_optimized = models.BooleanField(default=False)
    optimization_suggestions = models.JSONField(default=list)
    ats_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)  # ATS compatibility score

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'resumes'


class JobRecommendation(models.Model):
    """AI-generated job recommendations for students"""
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='job_recommendations')
    job_data = models.ForeignKey(JobMarketData, on_delete=models.CASCADE)

    # Matching Analysis
    skill_match_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    experience_match = models.BooleanField()
    location_preference_match = models.BooleanField(default=True)

    # AI Scoring
    recommendation_score = models.DecimalField(max_digits=3, decimal_places=2)  # 0-1
    confidence_level = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ]
    )

    # Recommendation Details
    reasons = models.JSONField(default=list)  # Why this job is recommended
    skill_gaps = models.JSONField(default=list)  # Skills needed to improve match
    preparation_suggestions = models.JSONField(default=list)

    # Status
    is_viewed = models.BooleanField(default=False)
    is_applied = models.BooleanField(default=False)
    is_bookmarked = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'job_recommendations'
        unique_together = ['student', 'job_data']


class TrainingProgram(models.Model):
    """Training programs to address skill gaps"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    provider = models.CharField(max_length=100)

    # Program Details
    target_skills = models.ManyToManyField(Skill, related_name='training_programs')
    duration_hours = models.IntegerField()
    difficulty_level = models.CharField(
        max_length=15,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ]
    )

    # Cost and Availability
    cost = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    is_free = models.BooleanField(default=False)
    is_online = models.BooleanField(default=True)
    certification_offered = models.BooleanField(default=False)

    # Quality Metrics
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'training_programs'
