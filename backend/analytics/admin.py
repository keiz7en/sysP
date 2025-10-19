from django.contrib import admin
from .models import (
    LearningAnalytics, DropoutPrediction, PerformanceTrends,
    InstitutionalAnalytics, LearningEffectivenessMetrics, AdmissionOutcomeAnalysis
)


@admin.register(LearningAnalytics)
class LearningAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'date', 'engagement_level', 'average_quiz_score']
    list_filter = ['engagement_level', 'date', 'course']
    search_fields = ['student__student_id', 'student__user__first_name', 'student__user__last_name']


@admin.register(DropoutPrediction)
class DropoutPredictionAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'risk_level', 'risk_score', 'created_at']
    list_filter = ['risk_level', 'created_at']
    search_fields = ['student__student_id', 'student__user__first_name', 'student__user__last_name']


@admin.register(PerformanceTrends)
class PerformanceTrendsAdmin(admin.ModelAdmin):
    list_display = ['student', 'period_start', 'period_end', 'trend_type', 'trend_slope']
    list_filter = ['trend_type', 'period_start']
    search_fields = ['student__student_id']


@admin.register(InstitutionalAnalytics)
class InstitutionalAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['institution_name', 'analysis_date', 'total_students', 'average_gpa', 'dropout_rate']
    list_filter = ['analysis_date', 'institution_name']


@admin.register(LearningEffectivenessMetrics)
class LearningEffectivenessMetricsAdmin(admin.ModelAdmin):
    list_display = ['metric_name', 'metric_type', 'improvement_percentage', 'p_value']
    list_filter = ['metric_type', 'subject_area']
    search_fields = ['metric_name', 'subject_area']


@admin.register(AdmissionOutcomeAnalysis)
class AdmissionOutcomeAnalysisAdmin(admin.ModelAdmin):
    list_display = ['cohort_year', 'analysis_completed_at']
    list_filter = ['cohort_year']
