"""
AI Feedback Service
Generates personalized feedback, performance predictions, and recommendations
"""
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import logging

from courses.models import (
    AssignmentSubmission, StudentFeedback, CourseEnrollment,
    Assignment, Notification, ActivityLog
)
from ai_services.gemini_service import GeminiAIService

logger = logging.getLogger(__name__)


class AIFeedbackService:
    """Service for generating AI-powered feedback and analytics"""

    def __init__(self):
        self.gemini = GeminiAIService()

    @transaction.atomic
    def generate_submission_feedback(self, submission_id):
        """
        Generate comprehensive AI feedback for a submission
        
        Args:
            submission_id: ID of the AssignmentSubmission
            
        Returns:
            StudentFeedback instance
        """
        try:
            submission = AssignmentSubmission.objects.select_related(
                'assignment__course',
                'student__user',
                'graded_by__user'
            ).get(id=submission_id)

            if not submission.graded_by:
                logger.warning(f"Submission {submission_id} not yet graded")
                return None

            # Get student's historical performance
            enrollment = CourseEnrollment.objects.get(
                student=submission.student,
                course=submission.assignment.course
            )

            # Gather context for AI
            context = self._build_feedback_context(submission, enrollment)

            # Generate AI feedback
            feedback_data = self._generate_ai_analysis(context, submission)

            # Create or update feedback record
            feedback, created = StudentFeedback.objects.update_or_create(
                submission=submission,
                student=submission.student,
                defaults={
                    'enrollment': enrollment,
                    'feedback_text': feedback_data['feedback_text'],
                    'strengths': feedback_data['strengths'],
                    'weaknesses': feedback_data['weaknesses'],
                    'recommendations': feedback_data['recommendations'],
                    'predicted_next_score': feedback_data['predicted_score'],
                    'risk_level': feedback_data['risk_level'],
                    'suggested_modules': feedback_data['suggested_modules'],
                    'ai_model_version': 'gemini-pro',
                    'confidence_score': Decimal(str(feedback_data['confidence']))
                }
            )

            # Create notification for student
            Notification.objects.create(
                user=submission.student.user,
                notification_type='ai_feedback_ready',
                title='AI Feedback Available',
                message=f'Personalized AI feedback is ready for "{submission.assignment.title}"',
                related_model='StudentFeedback',
                related_id=feedback.id,
                metadata={'submission_id': str(submission.id)}
            )

            # Log activity
            ActivityLog.objects.create(
                user=None,  # System-generated
                action_type='feedback_generation',
                description=f'AI feedback generated for {submission.student.user.get_full_name()}',
                target_model='StudentFeedback',
                target_id=feedback.id,
                metadata={
                    'submission_id': str(submission.id),
                    'risk_level': feedback_data['risk_level']
                }
            )

            logger.info(f"Generated AI feedback for submission {submission_id}")
            return feedback

        except AssignmentSubmission.DoesNotExist:
            logger.error(f"Submission {submission_id} not found")
            return None
        except Exception as e:
            logger.error(f"Error generating AI feedback: {str(e)}")
            return None

    def _build_feedback_context(self, submission, enrollment):
        """Build context for AI feedback generation"""
        # Get all submissions for this student in the course
        all_submissions = AssignmentSubmission.objects.filter(
            student=submission.student,
            assignment__course=enrollment.course
        ).select_related('assignment').order_by('submitted_at')

        # Calculate average performance
        graded_submissions = [s for s in all_submissions if s.points_earned is not None]
        avg_score = 0
        if graded_submissions:
            total = sum(s.percentage_score for s in graded_submissions)
            avg_score = total / len(graded_submissions)

        # Get assignment type distribution
        assignment_types = {}
        for s in graded_submissions:
            atype = s.assignment.assignment_type
            if atype not in assignment_types:
                assignment_types[atype] = []
            assignment_types[atype].append(s.percentage_score)

        # Calculate type averages
        type_averages = {
            atype: sum(scores) / len(scores)
            for atype, scores in assignment_types.items()
        }

        return {
            'submission': {
                'title': submission.assignment.title,
                'type': submission.assignment.assignment_type,
                'score': float(submission.percentage_score) if submission.points_earned else 0,
                'max_points': float(submission.assignment.max_points),
                'points_earned': float(submission.points_earned) if submission.points_earned else 0,
                'is_late': submission.is_late,
                'teacher_feedback': submission.feedback
            },
            'student_history': {
                'total_submissions': len(all_submissions),
                'graded_submissions': len(graded_submissions),
                'average_score': avg_score,
                'type_averages': type_averages,
                'completion_percentage': float(enrollment.completion_percentage)
            },
            'course_info': {
                'title': enrollment.course.title,
                'difficulty_level': enrollment.course.difficulty_level
            }
        }

    def _generate_ai_analysis(self, context, submission):
        """Use AI to generate comprehensive feedback"""
        prompt = f"""
You are an expert educational AI assistant. Analyze this student's performance and provide comprehensive feedback.

CURRENT SUBMISSION:
- Assignment: {context['submission']['title']}
- Type: {context['submission']['type']}
- Score: {context['submission']['score']:.2f}%
- Teacher's Feedback: {context['submission']['teacher_feedback'] or 'No feedback provided'}

STUDENT'S HISTORICAL PERFORMANCE:
- Total Submissions: {context['student_history']['total_submissions']}
- Average Score: {context['student_history']['average_score']:.2f}%
- Course Completion: {context['student_history']['completion_percentage']}%
- Performance by Type: {context['student_history']['type_averages']}

Please provide:
1. A comprehensive feedback paragraph (3-4 sentences)
2. List 2-3 key strengths
3. List 2-3 areas for improvement
4. Provide 3-4 specific, actionable recommendations
5. Predict their likely next assignment score
6. Assess risk level (low/medium/high) based on trends
7. Suggest 2-3 remedial modules or topics to focus on

Respond in JSON format:
{{
    "feedback_text": "...",
    "strengths": ["...", "..."],
    "weaknesses": ["...", "..."],
    "recommendations": ["...", "..."],
    "predicted_next_score": 85.5,
    "risk_level": "low",
    "suggested_modules": ["...", "..."],
    "confidence": 0.85
}}
"""

        try:
            # Use Gemini AI to generate feedback
            response = self.gemini.generate_content(
                prompt=prompt,
                temperature=0.7,
                max_tokens=1000
            )

            # Parse JSON response
            import json
            feedback_json = json.loads(response)

            # Validate and return
            return {
                'feedback_text': feedback_json.get('feedback_text', 'Feedback generated successfully.'),
                'strengths': feedback_json.get('strengths', []),
                'weaknesses': feedback_json.get('weaknesses', []),
                'recommendations': feedback_json.get('recommendations', []),
                'predicted_score': Decimal(
                    str(feedback_json.get('predicted_next_score', context['submission']['score']))),
                'risk_level': feedback_json.get('risk_level', 'low'),
                'suggested_modules': feedback_json.get('suggested_modules', []),
                'confidence': feedback_json.get('confidence', 0.85)
            }

        except Exception as e:
            logger.error(f"Error calling AI service: {str(e)}")
            # Fallback to rule-based feedback
            return self._generate_rule_based_feedback(context, submission)

    def _generate_rule_based_feedback(self, context, submission):
        """Fallback rule-based feedback if AI fails"""
        score = context['submission']['score']
        avg_score = context['student_history']['average_score']

        # Determine performance trend
        if score >= 90:
            feedback_text = "Excellent work! You demonstrate strong understanding of the material."
            risk_level = 'low'
        elif score >= 80:
            feedback_text = "Good performance! Continue practicing to strengthen your skills."
            risk_level = 'low'
        elif score >= 70:
            feedback_text = "Satisfactory work. Focus on addressing the areas identified for improvement."
            risk_level = 'medium'
        else:
            feedback_text = "Additional support may be needed. Please review the suggested materials and consider reaching out for help."
            risk_level = 'high'

        # Trend analysis
        if score > avg_score + 10:
            feedback_text += " Your performance is improving significantly!"
        elif score < avg_score - 10:
            feedback_text += " Your performance has declined. Let's work on getting back on track."

        strengths = []
        weaknesses = []

        if score >= 80:
            strengths.append("Strong grasp of key concepts")
        if submission.is_late == False:
            strengths.append("Timely submission")

        if score < 70:
            weaknesses.append("Need more practice with core concepts")
        if submission.is_late:
            weaknesses.append("Late submission - work on time management")

        recommendations = [
            "Review course materials regularly",
            "Practice similar problems to reinforce understanding",
            "Attend office hours if you need clarification"
        ]

        if score < 70:
            recommendations.append("Consider forming a study group")

        return {
            'feedback_text': feedback_text,
            'strengths': strengths if strengths else ["Completion of assignment"],
            'weaknesses': weaknesses if weaknesses else ["Continue practicing"],
            'recommendations': recommendations,
            'predicted_score': Decimal(str(max(score, avg_score))),
            'risk_level': risk_level,
            'suggested_modules': [context['course_info']['title'] + " - Review Session"],
            'confidence': 0.75
        }

    def generate_enrollment_feedback(self, enrollment_id):
        """Generate overall course performance feedback"""
        try:
            enrollment = CourseEnrollment.objects.select_related(
                'student__user',
                'course'
            ).get(id=enrollment_id)

            # Get all graded submissions
            submissions = AssignmentSubmission.objects.filter(
                student=enrollment.student,
                assignment__course=enrollment.course,
                points_earned__isnull=False
            ).select_related('assignment')

            if not submissions.exists():
                return None

            # Calculate overall performance
            scores = [s.percentage_score for s in submissions]
            avg_score = sum(scores) / len(scores)

            # Identify trends
            recent_scores = scores[-5:] if len(scores) >= 5 else scores
            recent_avg = sum(recent_scores) / len(recent_scores)

            trend = "improving" if recent_avg > avg_score else "declining" if recent_avg < avg_score else "steady"

            feedback_text = f"Your overall performance in this course is {avg_score:.2f}%. "
            feedback_text += f"Your recent trend is {trend}. "

            # Create feedback
            feedback = StudentFeedback.objects.create(
                enrollment=enrollment,
                student=enrollment.student,
                feedback_text=feedback_text,
                predicted_next_score=Decimal(str(recent_avg)),
                risk_level='low' if avg_score >= 70 else 'medium' if avg_score >= 60 else 'high'
            )

            return feedback

        except Exception as e:
            logger.error(f"Error generating enrollment feedback: {str(e)}")
            return None
