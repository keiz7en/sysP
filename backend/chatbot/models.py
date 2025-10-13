from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class ChatSession(models.Model):
    """Chat session between user and AI assistant"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')

    # Session Metadata
    title = models.CharField(max_length=200, blank=True)  # Auto-generated or user-defined
    context_type = models.CharField(
        max_length=20,
        choices=[
            ('general', 'General Inquiry'),
            ('course', 'Course Help'),
            ('career', 'Career Guidance'),
            ('technical', 'Technical Support'),
            ('admission', 'Admission Guidance'),
            ('academic', 'Academic Support'),
        ],
        default='general'
    )

    # AI Configuration
    ai_model_version = models.CharField(max_length=20, default='1.0')
    personality_mode = models.CharField(
        max_length=15,
        choices=[
            ('friendly', 'Friendly'),
            ('professional', 'Professional'),
            ('encouraging', 'Encouraging'),
            ('tutor', 'Tutor Mode'),
        ],
        default='friendly'
    )

    # Session State
    is_active = models.BooleanField(default=True)
    language = models.CharField(max_length=10, default='en')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'chat_sessions'


class ChatMessage(models.Model):
    """Individual messages in a chat session"""
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')

    # Message Content
    message_text = models.TextField()
    message_type = models.CharField(
        max_length=10,
        choices=[
            ('user', 'User Message'),
            ('assistant', 'AI Assistant'),
            ('system', 'System Message'),
        ]
    )

    # AI Processing
    intent_detected = models.CharField(max_length=50, blank=True)
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    entities_extracted = models.JSONField(default=dict)

    # Response Generation (for assistant messages)
    response_sources = models.JSONField(default=list)  # Knowledge sources used
    generated_by_model = models.CharField(max_length=20, blank=True)
    processing_time_ms = models.IntegerField(null=True, blank=True)

    # User Feedback
    was_helpful = models.BooleanField(null=True, blank=True)
    user_rating = models.IntegerField(null=True, blank=True)  # 1-5 stars

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['timestamp']


class KnowledgeBase(models.Model):
    """Knowledge base for chatbot responses"""
    category = models.CharField(max_length=50)
    subcategory = models.CharField(max_length=50, blank=True)

    # Content
    question = models.TextField()
    answer = models.TextField()
    keywords = models.JSONField(default=list)

    # Metadata
    source_type = models.CharField(
        max_length=20,
        choices=[
            ('manual', 'Manually Created'),
            ('scraped', 'Web Scraped'),
            ('document', 'Document Extracted'),
            ('faq', 'FAQ Import'),
            ('ai_generated', 'AI Generated'),
        ]
    )

    # Quality Metrics
    usage_count = models.IntegerField(default=0)
    success_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    last_updated = models.DateTimeField(auto_now=True)

    # Content Relations
    related_courses = models.ManyToManyField('courses.Course', blank=True)
    related_topics = models.JSONField(default=list)

    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'knowledge_base'


class ChatbotIntent(models.Model):
    """Defined intents for natural language understanding"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField()

    # Training Data
    training_phrases = models.JSONField(default=list)
    parameters = models.JSONField(default=list)  # Expected entities/parameters

    # Response Configuration
    response_templates = models.JSONField(default=list)
    requires_context = models.BooleanField(default=False)
    context_dependencies = models.JSONField(default=list)

    # Actions
    triggers_action = models.BooleanField(default=False)
    action_function = models.CharField(max_length=100, blank=True)

    # Performance
    recognition_accuracy = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    usage_frequency = models.IntegerField(default=0)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chatbot_intents'


class UserInteractionPattern(models.Model):
    """Analysis of user interaction patterns with chatbot"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interaction_patterns')

    # Usage Statistics
    total_sessions = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    average_session_duration = models.DurationField(null=True, blank=True)

    # Interaction Preferences
    preferred_topics = models.JSONField(default=list)
    common_questions = models.JSONField(default=list)
    interaction_times = models.JSONField(default=dict)  # Hour preferences

    # Success Metrics
    query_resolution_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    satisfaction_score = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)

    # Behavioral Insights
    help_seeking_behavior = models.CharField(
        max_length=15,
        choices=[
            ('proactive', 'Proactive'),
            ('reactive', 'Reactive'),
            ('exploratory', 'Exploratory'),
        ],
        blank=True
    )

    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_interaction_patterns'


class ChatbotAnalytics(models.Model):
    """Analytics for chatbot performance and usage"""
    date = models.DateField()

    # Usage Metrics
    total_sessions = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    unique_users = models.IntegerField(default=0)

    # Performance Metrics
    intent_recognition_accuracy = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    response_satisfaction_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    query_resolution_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # Content Analysis
    top_intents = models.JSONField(default=list)
    failed_queries = models.JSONField(default=list)
    knowledge_gaps = models.JSONField(default=list)

    # User Behavior
    user_engagement_metrics = models.JSONField(default=dict)
    session_duration_stats = models.JSONField(default=dict)

    # Improvement Suggestions
    improvement_areas = models.JSONField(default=list)
    content_suggestions = models.JSONField(default=list)

    class Meta:
        db_table = 'chatbot_analytics'
        unique_together = ['date']
