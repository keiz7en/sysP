from django.contrib import admin
from .models import (
    SkillCategory, Skill, StudentSkillProfile, StudentSkillLevel,
    JobMarketData, Resume, JobRecommendation, TrainingProgram
)


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent_category']
    search_fields = ['name', 'description']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_technical', 'market_demand']
    list_filter = ['is_technical', 'market_demand', 'category']
    search_fields = ['name', 'description']


@admin.register(StudentSkillProfile)
class StudentSkillProfileAdmin(admin.ModelAdmin):
    list_display = ['student', 'last_assessed']
    search_fields = ['student__student_id', 'student__user__first_name', 'student__user__last_name']


@admin.register(JobMarketData)
class JobMarketDataAdmin(admin.ModelAdmin):
    list_display = ['job_title', 'industry', 'job_demand', 'average_salary', 'last_updated']
    list_filter = ['industry', 'job_demand', 'experience_level', 'automation_risk']
    search_fields = ['job_title', 'industry', 'location']


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ['student', 'title', 'ai_optimized', 'ats_score', 'is_active', 'updated_at']
    list_filter = ['ai_optimized', 'is_active', 'created_at']
    search_fields = ['student__student_id', 'title']


@admin.register(JobRecommendation)
class JobRecommendationAdmin(admin.ModelAdmin):
    list_display = ['student', 'job_data', 'recommendation_score', 'confidence_level', 'is_applied']
    list_filter = ['confidence_level', 'is_applied', 'is_bookmarked', 'created_at']
    search_fields = ['student__student_id', 'job_data__job_title']


@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = ['title', 'provider', 'duration_hours', 'is_free', 'rating', 'is_active']
    list_filter = ['difficulty_level', 'is_free', 'is_online', 'certification_offered', 'is_active']
    search_fields = ['title', 'provider', 'description']
