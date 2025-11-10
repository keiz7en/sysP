from django.contrib import admin
from .models import Course, CourseEnrollment, Assignment, AssignmentSubmission


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'code', 'instructor', 'credits', 'difficulty_level', 'is_active']
    list_filter = ['difficulty_level', 'is_active', 'start_date']
    search_fields = ['title', 'code', 'instructor__user__first_name', 'instructor__user__last_name']


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'enrollment_date', 'status', 'completion_percentage']
    list_filter = ['status', 'enrollment_date']
    search_fields = ['student__student_id', 'course__title']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'assignment_type', 'due_date', 'max_points', 'is_published']
    list_filter = ['assignment_type', 'is_published', 'due_date']
    search_fields = ['title', 'course__title']


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ['student', 'assignment', 'submitted_at', 'points_earned', 'is_late']
    list_filter = ['is_late', 'submitted_at', 'graded_at']
    search_fields = ['student__student_id', 'assignment__title']
