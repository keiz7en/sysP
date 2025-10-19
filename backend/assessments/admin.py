from django.contrib import admin
from .models import Assessment, Question, StudentAssessmentAttempt, StudentAnswer, AssessmentAnalytics


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'type', 'total_marks', 'available_from', 'available_until']
    list_filter = ['type', 'ai_generated', 'available_from']
    search_fields = ['title', 'course__title']


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'assessment', 'question_type', 'marks', 'difficulty_level']
    list_filter = ['question_type', 'difficulty_level', 'ai_generated']
    search_fields = ['question_text', 'assessment__title']


@admin.register(StudentAssessmentAttempt)
class StudentAssessmentAttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'assessment', 'attempt_number', 'status', 'total_score', 'percentage']
    list_filter = ['status', 'started_at']
    search_fields = ['student__student_id', 'assessment__title']


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ['attempt', 'question', 'is_correct', 'marks_awarded', 'ai_graded']
    list_filter = ['is_correct', 'ai_graded', 'manually_reviewed']
    search_fields = ['attempt__student__student_id', 'question__question_text']
