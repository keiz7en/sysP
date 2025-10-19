from django.contrib import admin
from .models import (
    ChatSession, ChatMessage, KnowledgeBase, ChatbotIntent,
    UserInteractionPattern, ChatbotAnalytics
)


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'context_type', 'is_active', 'created_at', 'last_activity']
    list_filter = ['context_type', 'personality_mode', 'is_active', 'created_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'title']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['session', 'message_type', 'intent_detected', 'confidence_score', 'timestamp']
    list_filter = ['message_type', 'intent_detected', 'timestamp']
    search_fields = ['message_text', 'session__user__username']


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ['category', 'subcategory', 'source_type', 'usage_count', 'success_rate', 'is_active']
    list_filter = ['category', 'source_type', 'is_active', 'last_updated']
    search_fields = ['question', 'answer', 'keywords']


@admin.register(ChatbotIntent)
class ChatbotIntentAdmin(admin.ModelAdmin):
    list_display = ['name', 'triggers_action', 'recognition_accuracy', 'usage_frequency', 'is_active']
    list_filter = ['triggers_action', 'requires_context', 'is_active']
    search_fields = ['name', 'description']


@admin.register(UserInteractionPattern)
class UserInteractionPatternAdmin(admin.ModelAdmin):
    list_display = ['user', 'total_sessions', 'total_messages', 'query_resolution_rate', 'satisfaction_score']
    search_fields = ['user__username', 'user__first_name', 'user__last_name']


@admin.register(ChatbotAnalytics)
class ChatbotAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_sessions', 'unique_users', 'intent_recognition_accuracy', 'response_satisfaction_rate']
    list_filter = ['date']
