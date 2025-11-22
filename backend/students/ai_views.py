"""
AI-Powered Student Views - Using Gemini AI Service
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

# Import AI services
import sys
import os

# Add parent directory to path to import ai_services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from ai_services.gemini_service import gemini_service
except ImportError:
    gemini_service = None
    print("Warning: Gemini AI service not available")

from .models import StudentProfile, LearningProgress
from courses.models import CourseEnrollment
from assessments.models import StudentAssessmentAttempt
from django.db.models import Avg


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_personalized_content(request):
    """
    Generate AI-powered personalized learning content
    Uses Gemini AI for intelligent content generation
    """
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        student_profile = StudentProfile.objects.get(user=request.user)

        # Get request parameters
        topic = request.data.get('topic', 'Introduction to Programming')
        difficulty_level = request.data.get('difficulty', 'medium')
        course_id = request.data.get('course_id')

        # Build student profile for AI
        student_ai_profile = {
            'learning_style': student_profile.learning_style or 'adaptive',
            'current_level': difficulty_level,
            'strengths': ['Problem solving', 'Logical thinking'],
            'areas_for_improvement': ['Time management', 'Advanced concepts']
        }

        # Get actual GPA to adjust difficulty
        if student_profile.current_gpa:
            gpa = float(student_profile.current_gpa)
            if gpa >= 3.5:
                student_ai_profile['current_level'] = 'advanced'
            elif gpa < 2.5:
                student_ai_profile['current_level'] = 'beginner'

        # Call Gemini AI service
        if gemini_service and gemini_service.available:
            try:
                ai_content = gemini_service.generate_personalized_content(
                    student_profile=student_ai_profile,
                    topic=topic,
                    difficulty_level=difficulty_level
                )

                return Response({
                    'status': 'success',
                    'content': ai_content,
                    'generated_by': 'Gemini AI',
                    'student_profile': {
                        'learning_style': student_ai_profile['learning_style'],
                        'difficulty_level': difficulty_level
                    }
                })
            except Exception as e:
                print(f"Gemini AI error: {e}")

        # Fallback mock data if AI not available
        mock_content = {
            'explanation': f"Personalized explanation for {topic} at {difficulty_level} level, adapted for {student_ai_profile['learning_style']} learners.",
            'practice_questions': [
                f"Question 1: Apply {topic} concepts to solve...",
                f"Question 2: Analyze how {topic} works in...",
                f"Question 3: Create a solution using {topic}..."
            ],
            'examples': [
                f"Real-world example 1 for {topic}",
                f"Practical application of {topic}"
            ],
            'next_topics': [f"Advanced {topic}", "Related Concepts", "Practical Projects"]
        }

        return Response({
            'status': 'success',
            'content': mock_content,
            'generated_by': 'Mock AI (Gemini AI not configured)',
            'note': 'Configure Gemini AI for real AI-generated content'
        })

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_ai_quiz(request):
    """
    Generate AI-powered quiz questions
    Uses Gemini AI for intelligent question generation
    """
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        # Get parameters
        topic = request.data.get('topic', 'Programming Fundamentals')
        difficulty = request.data.get('difficulty', 'medium')
        num_questions = int(request.data.get('num_questions', 5))
        question_types = request.data.get('question_types', ['multiple_choice', 'short_answer'])

        # Call Gemini AI service
        if gemini_service and gemini_service.available:
            try:
                ai_quiz = gemini_service.generate_quiz(
                    topic=topic,
                    difficulty=difficulty,
                    num_questions=num_questions,
                    question_types=question_types
                )

                return Response({
                    'status': 'success',
                    'quiz': {
                        'title': f"{topic} - AI Generated Quiz",
                        'questions': ai_quiz,
                        'total_questions': len(ai_quiz),
                        'difficulty': difficulty,
                        'generated_by': 'Gemini AI'
                    }
                })
            except Exception as e:
                print(f"Gemini AI error: {e}")

        # Fallback mock quiz
        mock_questions = []
        for i in range(num_questions):
            mock_questions.append({
                'question_id': i + 1,
                'question_text': f"AI-Generated Question {i + 1}: {topic}",
                'question_type': 'multiple_choice',
                'options': [
                    f"Option A - Correct answer for {topic}",
                    f"Option B - Plausible distractor",
                    f"Option C - Common misconception",
                    f"Option D - Another option"
                ],
                'correct_answer': 'Option A',
                'explanation': f"Detailed explanation for question {i + 1}",
                'points': 10,
                'difficulty': difficulty
            })

        return Response({
            'status': 'success',
            'quiz': {
                'title': f"{topic} - Quiz",
                'questions': mock_questions,
                'total_questions': len(mock_questions),
                'difficulty': difficulty,
                'generated_by': 'Mock AI (Configure Gemini AI for real generation)'
            }
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adaptive_difficulty_adjustment(request):
    """
    AI-powered adaptive difficulty adjustment based on performance
    Uses Gemini AI for intelligent recommendations
    """
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        student_profile = StudentProfile.objects.get(user=request.user)
        course_id = request.data.get('course_id')
        current_difficulty = request.data.get('current_difficulty', 'medium')

        # Get student performance data
        enrollments = CourseEnrollment.objects.filter(
            student=student_profile,
            status='active'
        )

        # Calculate recent scores
        recent_attempts = StudentAssessmentAttempt.objects.filter(
            student=student_profile,
            status='graded'
        ).order_by('-submitted_at')[:10]

        recent_scores = [float(attempt.percentage) for attempt in recent_attempts if attempt.percentage]

        # Build performance data
        student_performance = {
            'recent_scores': recent_scores if recent_scores else [70],
            'time_spent': 120,  # minutes
            'completion_rate': enrollments.aggregate(avg=Avg('completion_percentage'))['avg'] or 0,
            'engagement_level': 'high' if len(recent_scores) > 5 else 'medium'
        }

        # Call Gemini AI service
        if gemini_service and gemini_service.available:
            try:
                adjustment = gemini_service.adaptive_difficulty_adjustment(
                    student_performance=student_performance,
                    current_difficulty=current_difficulty
                )

                return Response({
                    'status': 'success',
                    'adjustment': adjustment,
                    'current_performance': {
                        'average_score': sum(recent_scores) / len(recent_scores) if recent_scores else 0,
                        'trend': 'improving' if len(recent_scores) > 1 and recent_scores[0] > recent_scores[
                            -1] else 'stable'
                    },
                    'generated_by': 'Gemini AI'
                })
            except Exception as e:
                print(f"Gemini AI error: {e}")

        # Fallback logic
        avg_score = sum(recent_scores) / len(recent_scores) if recent_scores else 70

        if avg_score > 85:
            new_difficulty = 'hard'
            adjustment = 'increase'
        elif avg_score < 60:
            new_difficulty = 'easy'
            adjustment = 'decrease'
        else:
            new_difficulty = current_difficulty
            adjustment = 'maintain'

        return Response({
            'status': 'success',
            'adjustment': {
                'adjustment_needed': adjustment,
                'new_difficulty': new_difficulty,
                'focus_areas': ['Core concepts', 'Practice problems'],
                'motivation_strategies': ['Set achievable goals', 'Track progress']
            },
            'current_performance': {
                'average_score': avg_score,
                'total_attempts': len(recent_scores)
            },
            'generated_by': 'Rule-based AI (Configure Gemini AI for advanced ML)'
        })

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_dropout_risk(request):
    """
    AI-powered dropout risk prediction
    Uses Gemini AI ML models
    """
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=status.HTTP_403_FORBIDDEN)

        student_profile = StudentProfile.objects.get(user=request.user)

        # Gather student data for prediction
        enrollments = CourseEnrollment.objects.filter(
            student=student_profile,
            status='active'
        )

        # Calculate metrics
        avg_progress = enrollments.aggregate(avg=Avg('completion_percentage'))['avg'] or 0
        total_courses = enrollments.count()

        # Get attendance (if tracked)
        attendance_rate = 85.0  # Default, should come from actual attendance records

        # Get assessment performance
        attempts = StudentAssessmentAttempt.objects.filter(
            student=student_profile,
            status='graded'
        )
        avg_grade = attempts.aggregate(avg=Avg('percentage'))['avg'] or 0

        # Build student data for AI
        student_data = {
            'avg_grade': float(avg_grade) if avg_grade else 70,
            'attendance': attendance_rate,
            'engagement': float(avg_progress),
            'completion': 75.0
        }

        # Call Gemini AI service
        if gemini_service and gemini_service.available:
            try:
                prediction = gemini_service.analyze_student_performance(student_data)

                return Response({
                    'status': 'success',
                    'prediction': prediction,
                    'generated_by': 'Gemini AI',
                    'data_quality': 'high' if total_courses > 2 else 'limited'
                })
            except Exception as e:
                print(f"Gemini AI error: {e}")

        # Fallback prediction
        risk_score = 0.3 if avg_grade > 70 and avg_progress > 50 else 0.6
        risk_level = 'low' if risk_score < 0.4 else 'medium'

        return Response({
            'status': 'success',
            'prediction': {
                'risk_score': risk_score,
                'risk_level': risk_level,
                'risk_factors': ['Low engagement'] if avg_progress < 50 else [],
                'protective_factors': ['Good grades'] if avg_grade > 70 else [],
                'recommendations': [
                    'Continue current study pattern' if risk_level == 'low' else 'Seek academic support',
                    'Join study groups',
                    'Meet with advisor'
                ],
                'confidence': 0.75
            },
            'generated_by': 'Statistical Model (Configure Gemini API for real AI)',
            'student_metrics': student_data
        })

    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
