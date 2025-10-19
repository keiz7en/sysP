from django.contrib import admin
from .models import Course, CourseModule, CourseEnrollment, LearningPath, GameificationProgress


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'code', 'instructor', 'credits', 'difficulty_level', 'is_active']
    list_filter = ['difficulty_level', 'is_active', 'start_date']
    search_fields = ['title', 'code', 'instructor__user__first_name', 'instructor__user__last_name']


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'content_type', 'ai_generated']
    list_filter = ['content_type', 'ai_generated']
    search_fields = ['title', 'course__title']


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrollment_date', 'status', 'progress_percentage']
    list_filter = ['status', 'enrollment_date']
    search_fields = ['student__student_id', 'course__title']
