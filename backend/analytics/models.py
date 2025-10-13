from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class LearningAnalytics(models.Model):
    """Comprehensive learning analytics for students"""
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='learning_analytics')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, null=True, blank=True)
    date = models.DateField()

    # Engagement Metrics
    time_spent = models.DurationField()
    content_interactions = models.IntegerField(default=0)
    quiz_attempts = models.IntegerField(default=0)
    discussion_posts = models.IntegerField(default=0)

    # Performance Metrics
    average_quiz_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    assignment_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # AI Insights
    learning_velocity = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)  # Progress rate
    engagement_level = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ],
        default='medium'
    )

    # Behavioral Patterns
    preferred_learning_times = models.JSONField(default=list)  # Hour preferences
    content_preferences = models.JSONField(default=dict)  # Text, video, interactive preferences
    difficulty_adaptation = models.JSONField(default=dict)

    class Meta:
        db_table = 'learning_analytics'
        unique_together = ['student', 'course', 'date']


class DropoutPrediction(models.Model):
    """AI model predictions for student dropout risk"""
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='dropout_predictions')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, null=True, blank=True)

    # Risk Assessment
    risk_score = models.DecimalField(max_digits=3, decimal_places=2)  # 0-1 probability
    risk_level = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low Risk'),
            ('medium', 'Medium Risk'),
            ('high', 'High Risk'),
            ('critical', 'Critical Risk'),
        ]
    )

    # Contributing Factors
    risk_factors = models.JSONField(default=list)
    protective_factors = models.JSONField(default=list)

    # Recommendations
    intervention_recommendations = models.JSONField(default=list)
    priority_actions = models.JSONField(default=list)

    # Model Metadata
    model_version = models.CharField(max_length=20)
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dropout_predictions'


class PerformanceTrends(models.Model):
    """Long-term performance trend analysis"""
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='performance_trends')

    # Trend Data
    period_start = models.DateField()
    period_end = models.DateField()
    trend_type = models.CharField(
        max_length=20,
        choices=[
            ('improving', 'Improving'),
            ('declining', 'Declining'),
            ('stable', 'Stable'),
            ('volatile', 'Volatile'),
        ]
    )

    # Statistical Measures
    trend_slope = models.DecimalField(max_digits=5, decimal_places=4)  # Rate of change
    correlation_coefficient = models.DecimalField(max_digits=3, decimal_places=2)
    variance = models.DecimalField(max_digits=5, decimal_places=4)

    # Subject-wise Trends
    subject_trends = models.JSONField(default=dict)
    skill_trends = models.JSONField(default=dict)

    # Predictions
    projected_performance = models.JSONField(default=dict)
    confidence_intervals = models.JSONField(default=dict)

    class Meta:
        db_table = 'performance_trends'


class InstitutionalAnalytics(models.Model):
    """Institution-wide analytics and insights"""
    institution_name = models.CharField(max_length=200)
    analysis_date = models.DateField()

    # Enrollment Metrics
    total_students = models.IntegerField()
    new_enrollments = models.IntegerField()
    active_students = models.IntegerField()
    dropout_rate = models.DecimalField(max_digits=5, decimal_places=2)

    # Academic Performance
    average_gpa = models.DecimalField(max_digits=3, decimal_places=2)
    pass_rate = models.DecimalField(max_digits=5, decimal_places=2)
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2)

    # Course Analytics
    most_popular_courses = models.JSONField(default=list)
    highest_rated_courses = models.JSONField(default=list)
    courses_needing_improvement = models.JSONField(default=list)

    # Teacher Performance
    teacher_performance_summary = models.JSONField(default=dict)

    # Technology Usage
    platform_usage_stats = models.JSONField(default=dict)
    feature_adoption_rates = models.JSONField(default=dict)

    # AI Insights
    key_insights = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)

    class Meta:
        db_table = 'institutional_analytics'


class LearningEffectivenessMetrics(models.Model):
    """Metrics to measure learning effectiveness of different approaches"""
    metric_name = models.CharField(max_length=100)
    metric_type = models.CharField(
        max_length=20,
        choices=[
            ('content', 'Content Type'),
            ('methodology', 'Teaching Methodology'),
            ('technology', 'Technology Usage'),
            ('timing', 'Learning Timing'),
        ]
    )

    # Comparison Data
    approach_a = models.CharField(max_length=100)  # e.g., "Traditional Lecture"
    approach_b = models.CharField(max_length=100)  # e.g., "Interactive Video"

    # Effectiveness Scores
    approach_a_score = models.DecimalField(max_digits=5, decimal_places=2)
    approach_b_score = models.DecimalField(max_digits=5, decimal_places=2)
    improvement_percentage = models.DecimalField(max_digits=5, decimal_places=2)

    # Statistical Significance
    p_value = models.DecimalField(max_digits=5, decimal_places=4)
    sample_size = models.IntegerField()
    confidence_level = models.DecimalField(max_digits=3, decimal_places=2)

    # Context
    subject_area = models.CharField(max_length=100)
    student_demographics = models.JSONField(default=dict)
    duration_tested = models.DurationField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'learning_effectiveness_metrics'


class AdmissionOutcomeAnalysis(models.Model):
    """Analysis of admission data vs long-term student success"""
    cohort_year = models.IntegerField()

    # Admission Criteria Analysis
    admission_criteria_weights = models.JSONField(default=dict)

    # Success Predictors
    strongest_predictors = models.JSONField(default=list)
    weakest_predictors = models.JSONField(default=list)

    # Demographic Analysis
    demographic_success_rates = models.JSONField(default=dict)
    equity_metrics = models.JSONField(default=dict)

    # Long-term Outcomes
    graduation_rates = models.JSONField(default=dict)
    employment_rates = models.JSONField(default=dict)
    career_progression = models.JSONField(default=dict)

    # Recommendations
    admission_improvements = models.JSONField(default=list)
    support_program_suggestions = models.JSONField(default=list)

    analysis_completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'admission_outcome_analysis'
