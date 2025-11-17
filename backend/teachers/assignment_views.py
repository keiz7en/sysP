from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Avg, Count
from datetime import datetime
import json

# Import AI service for generation
try:
    from ai_services.gemini_service import gemini_service
except ImportError:
    gemini_service = None

from courses.models import Course, Assignment, AssignmentSubmission
from teachers.models import TeacherProfile
from students.models import StudentProfile


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def teacher_assignments(request):
    """
    GET: List all assignments for teacher's courses
    POST: Create new assignment
    """
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
    except TeacherProfile.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Get all assignments from teacher's courses
        teacher_courses = Course.objects.filter(instructor=teacher_profile)
        assignments = Assignment.objects.filter(course__in=teacher_courses).select_related('course')

        assignments_data = []
        for assignment in assignments:
            # Get submission stats
            submissions = AssignmentSubmission.objects.filter(assignment=assignment)
            submissions_count = submissions.count()
            avg_score = submissions.filter(points_earned__isnull=False).aggregate(
                avg=Avg('points_earned')
            )['avg'] or 0

            assignments_data.append({
                'id': assignment.id,
                'title': assignment.title,
                'description': assignment.description,
                'course_title': assignment.course.title,
                'course_id': assignment.course.id,
                'due_date': assignment.due_date.isoformat(),
                'max_points': float(assignment.max_points),
                'assignment_type': assignment.assignment_type,
                'status': 'published' if assignment.is_published else 'draft',
                'created_date': assignment.created_at.isoformat(),
                'submissions_count': submissions_count,
                'avg_score': round(float(avg_score), 1) if avg_score else 0
            })

        return Response({
            'assignments': assignments_data,
            'total_assignments': len(assignments_data)
        }, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        # Create new assignment
        data = request.data

        # Validate required fields
        required_fields = ['title', 'course_id', 'due_date', 'max_points']
        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'Missing required field: {field}'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Get course and verify ownership
        try:
            course = Course.objects.get(id=data['course_id'], instructor=teacher_profile)
        except Course.DoesNotExist:
            return Response({
                'error': 'Course not found or you do not have permission'
            }, status=status.HTTP_404_NOT_FOUND)

        # Create assignment
        assignment = Assignment.objects.create(
            course=course,
            title=data['title'],
            description=data.get('description', ''),
            assignment_type=data.get('assignment_type', 'homework'),
            max_points=data['max_points'],
            due_date=data['due_date'],
            is_published=data.get('is_published', True)
        )

        return Response({
            'success': True,
            'message': 'Assignment created successfully',
            'assignment': {
                'id': assignment.id,
                'title': assignment.title,
                'course_title': course.title
            }
        }, status=status.HTTP_201_CREATED)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def assignment_detail(request, assignment_id):
    """
    PUT: Update assignment
    DELETE: Delete assignment
    """
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
        assignment = Assignment.objects.get(id=assignment_id, course__instructor=teacher_profile)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        # Update assignment
        data = request.data
        assignment.title = data.get('title', assignment.title)
        assignment.description = data.get('description', assignment.description)
        assignment.assignment_type = data.get('assignment_type', assignment.assignment_type)
        assignment.max_points = data.get('max_points', assignment.max_points)
        assignment.due_date = data.get('due_date', assignment.due_date)
        assignment.is_published = data.get('is_published', assignment.is_published)
        assignment.save()

        return Response({
            'success': True,
            'message': 'Assignment updated successfully'
        }, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        assignment.delete()
        return Response({
            'success': True,
            'message': 'Assignment deleted successfully'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_ai_assignment(request):
    """
    Generate assignment using AI (Gemini)
    Only for enrolled course topics
    """
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
    except TeacherProfile.DoesNotExist:
        return Response({'error': 'Teacher profile not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get parameters
    course_id = request.data.get('course_id')
    topic = request.data.get('topic')
    assignment_type = request.data.get('assignment_type', 'homework')
    difficulty = request.data.get('difficulty', 'intermediate')
    num_questions = request.data.get('num_questions', 5)

    # Validate course
    try:
        course = Course.objects.get(id=course_id, instructor=teacher_profile)
    except Course.DoesNotExist:
        return Response({
            'error': 'Course not found or you do not have permission'
        }, status=status.HTTP_404_NOT_FOUND)

    # Generate using AI if available
    if gemini_service and gemini_service.available:
        try:
            ai_content = gemini_service.generate_assignment(
                course_title=course.title,
                topic=topic,
                assignment_type=assignment_type,
                difficulty=difficulty,
                num_questions=num_questions
            )
            ai_content['ai_generated'] = True
            ai_content['model'] = 'Gemini 1.5 Flash'
            return Response(ai_content, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"AI generation error: {e}")

    # Fallback mock data
    return Response({
        'title': f'{topic} - {assignment_type.title()}',
        'description': f'This assignment covers {topic} concepts from {course.title}',
        'questions': [
            {
                'question_number': i + 1,
                'question_text': f'Explain the concept of {topic} and its applications.',
                'points': 10,
                'type': 'essay' if assignment_type == 'essay' else 'short_answer'
            } for i in range(min(num_questions, 5))
        ],
        'max_points': num_questions * 10,
        'estimated_time': num_questions * 10,
        'difficulty': difficulty,
        'ai_generated': False,
        'model': 'Fallback (Gemini not configured)'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def assignment_submissions(request, assignment_id):
    """Get all submissions for an assignment"""
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
        assignment = Assignment.objects.get(id=assignment_id, course__instructor=teacher_profile)
    except Assignment.DoesNotExist:
        return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get all submissions
    submissions = AssignmentSubmission.objects.filter(
        assignment=assignment
    ).select_related('student__user')

    submissions_data = []
    for submission in submissions:
        submissions_data.append({
            'id': submission.id,
            'student_name': submission.student.user.get_full_name(),
            'student_id': submission.student.student_id,
            'submission_text': submission.submission_text,
            'submitted_at': submission.submitted_at.isoformat(),
            'is_late': submission.is_late,
            'points_earned': float(submission.points_earned) if submission.points_earned else None,
            'feedback': submission.feedback,
            'graded_at': submission.graded_at.isoformat() if submission.graded_at else None,
            'graded_by': submission.graded_by.user.get_full_name() if submission.graded_by else None,
            'percentage_score': submission.percentage_score if submission.points_earned else 0
        })

    return Response({
        'assignment': {
            'id': assignment.id,
            'title': assignment.title,
            'max_points': float(assignment.max_points),
            'due_date': assignment.due_date.isoformat()
        },
        'submissions': submissions_data,
        'total_submissions': len(submissions_data),
        'graded_count': len([s for s in submissions_data if s['points_earned'] is not None]),
        'pending_count': len([s for s in submissions_data if s['points_earned'] is None])
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def grade_submission(request, submission_id):
    """
    Grade a submission with AI detection for humanization
    """
    if request.user.user_type != 'teacher':
        return Response({'error': 'Teacher access only'}, status=status.HTTP_403_FORBIDDEN)

    try:
        teacher_profile = TeacherProfile.objects.get(user=request.user)
        submission = AssignmentSubmission.objects.get(
            id=submission_id,
            assignment__course__instructor=teacher_profile
        )
    except AssignmentSubmission.DoesNotExist:
        return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get grading data
    points_earned = request.data.get('points_earned')
    feedback = request.data.get('feedback', '')

    if points_earned is None:
        return Response({'error': 'points_earned is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Check for AI-generated content (humanization detection)
    ai_detection_result = detect_ai_content(submission.submission_text)

    # Update submission
    submission.points_earned = points_earned
    submission.feedback = feedback
    submission.graded_at = timezone.now()
    submission.graded_by = teacher_profile
    submission.save()

    return Response({
        'success': True,
        'message': 'Submission graded successfully',
        'submission': {
            'id': submission.id,
            'points_earned': float(points_earned),
            'max_points': float(submission.assignment.max_points),
            'percentage': submission.percentage_score,
            'feedback': feedback
        },
        'ai_detection': ai_detection_result
    }, status=status.HTTP_200_OK)


def detect_ai_content(text):
    """
    Detect if content is AI-generated or humanized
    Uses pattern analysis and linguistic markers
    """
    if not text or len(text) < 50:
        return {
            'is_ai_generated': False,
            'confidence': 0,
            'reason': 'Text too short to analyze'
        }

    # Simple heuristics (in production, use more sophisticated NLP)
    ai_indicators = 0
    total_checks = 5

    # Check 1: Overly formal language
    formal_words = ['furthermore', 'moreover', 'consequently', 'henceforth', 'thereby']
    formal_count = sum(1 for word in formal_words if word in text.lower())
    if formal_count >= 2:
        ai_indicators += 1

    # Check 2: Perfect grammar (no common typos)
    common_typos = ['teh', 'recieve', 'occured', 'seperate', 'definately']
    has_typos = any(typo in text.lower() for typo in common_typos)
    if not has_typos and len(text) > 200:
        ai_indicators += 0.5

    # Check 3: Repetitive sentence structure
    sentences = text.split('.')
    if len(sentences) > 3:
        avg_length = sum(len(s.split()) for s in sentences) / len(sentences)
        std_dev = sum((len(s.split()) - avg_length) ** 2 for s in sentences) / len(sentences)
        if std_dev < 5:  # Very consistent sentence length
            ai_indicators += 1

    # Check 4: Lack of contractions
    contractions = ["don't", "can't", "won't", "it's", "i'm", "you're"]
    has_contractions = any(contraction in text.lower() for contraction in contractions)
    if not has_contractions and len(text) > 150:
        ai_indicators += 1

    # Check 5: Generic phrasing
    generic_phrases = ['it is important to note', 'in conclusion', 'to summarize', 'as previously mentioned']
    generic_count = sum(1 for phrase in generic_phrases if phrase in text.lower())
    if generic_count >= 2:
        ai_indicators += 1

    confidence = (ai_indicators / total_checks) * 100
    is_ai_generated = confidence >= 60

    return {
        'is_ai_generated': is_ai_generated,
        'confidence': round(confidence, 1),
        'indicators_found': int(ai_indicators),
        'total_checks': total_checks,
        'warning': 'High likelihood of AI-generated content' if is_ai_generated else 'Content appears to be human-written',
        'recommendation': 'Review submission manually' if is_ai_generated else 'No concerns detected'
    }
