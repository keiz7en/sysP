from django.contrib import admin
from .models import StudentProfile, AcademicRecord, AttendanceRecord, LearningProgress, StudentBehaviorMetrics


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'user', 'grade_level', 'current_gpa', 'academic_status']
    list_filter = ['grade_level', 'academic_status', 'learning_style']
    search_fields = ['student_id', 'user__first_name', 'user__last_name', 'user__email']
    readonly_fields = ['student_id', 'enrollment_date']


@admin.register(AcademicRecord)
class AcademicRecordAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'semester', 'year', 'grade', 'gpa_points']
    list_filter = ['semester', 'year', 'grade']
    search_fields = ['student__student_id', 'course__title', 'course__code']


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'date', 'status']
    list_filter = ['status', 'date', 'course']
    search_fields = ['student__student_id', 'course__title']


@admin.register(LearningProgress)
class LearningProgressAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'topic', 'mastery_level', 'last_interaction']
    list_filter = ['course', 'last_interaction']
    search_fields = ['student__student_id', 'topic']


@admin.register(StudentBehaviorMetrics)
class StudentBehaviorMetricsAdmin(admin.ModelAdmin):
    list_display = ['student', 'date', 'engagement_score', 'participation_level']
    list_filter = ['participation_level', 'date']
    search_fields = ['student__student_id']
