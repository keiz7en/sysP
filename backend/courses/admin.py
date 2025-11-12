from django.contrib import admin
from .models import (
    Subject, TeacherSubjectRequest, TeacherApprovedSubject,
    Course, CourseEnrollment, CourseModule, Assignment, AssignmentSubmission
)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TeacherSubjectRequest)
class TeacherSubjectRequestAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'subject', 'status', 'request_date', 'approved_by']
    list_filter = ['status', 'request_date']
    search_fields = ['teacher__user__first_name', 'teacher__user__last_name', 'subject__name']
    readonly_fields = ['request_date', 'approved_at']
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ['teacher', 'subject']
        return self.readonly_fields


@admin.register(TeacherApprovedSubject)
class TeacherApprovedSubjectAdmin(admin.ModelAdmin):
    list_display = ['teacher', 'subject', 'approved_by', 'approved_date']
    list_filter = ['approved_date']
    search_fields = ['teacher__user__first_name', 'teacher__user__last_name', 'subject__name']
    readonly_fields = ['approved_date']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'title', 'subject', 'instructor', 'status', 'is_open_for_enrollment', 'ai_content_enabled']
    list_filter = ['status', 'is_open_for_enrollment', 'ai_content_enabled', 'difficulty_level', 'created_at']
    search_fields = ['title', 'code', 'subject__name', 'instructor__user__first_name', 'instructor__user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Course Information', {
            'fields': ('title', 'code', 'subject', 'instructor', 'description')
        }),
        ('Course Details', {
            'fields': ('credits', 'difficulty_level', 'enrollment_limit')
        }),
        ('Schedule', {
            'fields': ('start_date', 'end_date')
        }),
        ('Status & Access', {
            'fields': ('status', 'is_open_for_enrollment')
        }),
        ('AI Features', {
            'fields': ('ai_content_enabled', 'syllabus_ai_generated')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'content_type', 'ai_generated']
    list_filter = ['content_type', 'ai_generated', 'course']
    search_fields = ['title', 'course__title', 'description']


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'status', 'enrollment_date', 'approved_at', 'ai_features_unlocked']
    list_filter = ['status', 'ai_features_unlocked', 'enrollment_date', 'approved_at']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'course__title', 'course__code']
    readonly_fields = ['enrollment_date', 'created_at', 'updated_at', 'approved_at']
    fieldsets = (
        ('Enrollment Information', {
            'fields': ('student', 'course', 'enrollment_date')
        }),
        ('Approval Chain', {
            'fields': ('status', 'approved_by', 'approved_at', 'rejection_reason')
        }),
        ('AI Access Control', {
            'fields': ('ai_features_unlocked', 'ai_unlock_date')
        }),
        ('Academic Progress', {
            'fields': ('grade', 'completion_percentage', 'final_score')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


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
