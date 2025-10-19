from rest_framework import serializers
from .models import Assessment, Question, StudentAssessmentAttempt, StudentAnswer, AssessmentAnalytics


class AssessmentSerializer(serializers.ModelSerializer):
    """Serializer for assessments"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = '__all__'

    def get_question_count(self, obj):
        return obj.questions.count()


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for questions"""
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)

    class Meta:
        model = Question
        fields = '__all__'


class StudentAssessmentAttemptSerializer(serializers.ModelSerializer):
    """Serializer for student assessment attempts"""
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)

    class Meta:
        model = StudentAssessmentAttempt
        fields = '__all__'


class StudentAnswerSerializer(serializers.ModelSerializer):
    """Serializer for student answers"""
    question_text = serializers.CharField(source='question.question_text', read_only=True)

    class Meta:
        model = StudentAnswer
        fields = '__all__'


class AssessmentAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for assessment analytics"""
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)

    class Meta:
        model = AssessmentAnalytics
        fields = '__all__'
