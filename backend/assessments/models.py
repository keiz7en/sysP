from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Assessment(models.Model):
    """Assessment/Test/Quiz model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='assessments')
    title = models.CharField(max_length=200)
    description = models.TextField()

    # Assessment Configuration
    type = models.CharField(
        max_length=20,
        choices=[
            ('quiz', 'Quiz'),
            ('test', 'Test'),
            ('assignment', 'Assignment'),
            ('project', 'Project'),
            ('essay', 'Essay'),
        ]
    )

    total_marks = models.IntegerField()
    duration_minutes = models.IntegerField(null=True, blank=True)  # Null for unlimited time
    attempts_allowed = models.IntegerField(default=1)

    # AI Features
    ai_generated = models.BooleanField(default=False)
    adaptive_difficulty = models.BooleanField(default=False)
    auto_grading = models.BooleanField(default=True)

    # Scheduling
    available_from = models.DateTimeField()
    available_until = models.DateTimeField()

    # Settings
    randomize_questions = models.BooleanField(default=False)
    show_results_immediately = models.BooleanField(default=True)
    allow_review = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assessments'


class Question(models.Model):
    """Individual question in an assessment"""
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20,
        choices=[
            ('mcq', 'Multiple Choice'),
            ('true_false', 'True/False'),
            ('short_answer', 'Short Answer'),
            ('essay', 'Essay'),
            ('fill_blank', 'Fill in the Blank'),
            ('matching', 'Matching'),
        ]
    )

    marks = models.IntegerField()
    order = models.IntegerField()

    # Question Configuration
    options = models.JSONField(default=list)  # For MCQ, matching, etc.
    correct_answer = models.JSONField(default=dict)  # Flexible structure for different question types

    # AI Analysis
    difficulty_level = models.CharField(
        max_length=10,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ],
        default='medium'
    )
    bloom_taxonomy_level = models.CharField(
        max_length=20,
        choices=[
            ('remember', 'Remember'),
            ('understand', 'Understand'),
            ('apply', 'Apply'),
            ('analyze', 'Analyze'),
            ('evaluate', 'Evaluate'),
            ('create', 'Create'),
        ],
        blank=True
    )

    # AI-Generated Content
    ai_generated = models.BooleanField(default=False)
    source_content = models.TextField(blank=True)  # Content used to generate question

    class Meta:
        db_table = 'questions'
        unique_together = ['assessment', 'order']


class StudentAssessmentAttempt(models.Model):
    """Student's attempt at an assessment"""
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE, related_name='assessment_attempts')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='attempts')
    attempt_number = models.IntegerField()

    # Timing
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    time_taken = models.DurationField(null=True, blank=True)

    # Scoring
    total_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # Status
    status = models.CharField(
        max_length=15,
        choices=[
            ('in_progress', 'In Progress'),
            ('submitted', 'Submitted'),
            ('graded', 'Graded'),
            ('reviewed', 'Reviewed'),
        ],
        default='in_progress'
    )

    # AI Analysis
    performance_analysis = models.JSONField(default=dict)
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)

    class Meta:
        db_table = 'student_assessment_attempts'
        unique_together = ['student', 'assessment', 'attempt_number']


class StudentAnswer(models.Model):
    """Student's answer to a specific question"""
    attempt = models.ForeignKey(StudentAssessmentAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    answer = models.JSONField()  # Flexible structure for different answer types

    # Grading
    is_correct = models.BooleanField(null=True, blank=True)  # Null for ungraded
    marks_awarded = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # AI Grading for Essays/Text
    ai_graded = models.BooleanField(default=False)
    ai_feedback = models.TextField(blank=True)
    confidence_score = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)

    # Manual Review
    manually_reviewed = models.BooleanField(default=False)
    teacher_feedback = models.TextField(blank=True)

    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'student_answers'
        unique_together = ['attempt', 'question']


class AssessmentAnalytics(models.Model):
    """Analytics for assessment performance"""
    assessment = models.OneToOneField(Assessment, on_delete=models.CASCADE, related_name='analytics')

    # Statistical Data
    total_attempts = models.IntegerField(default=0)
    average_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    highest_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    lowest_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)

    # Question Analysis
    question_difficulty_analysis = models.JSONField(default=dict)
    question_discrimination_index = models.JSONField(default=dict)

    # Performance Distribution
    score_distribution = models.JSONField(default=dict)
    time_analysis = models.JSONField(default=dict)

    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assessment_analytics'
