"""
Real-Time Notification Service
Handles all system notifications with WebSocket support and database persistence
"""
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
import logging

from courses.models import Notification

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """Central service for creating and sending notifications"""

    @staticmethod
    @transaction.atomic
    def create_notification(user, notification_type, title, message, metadata=None):
        """Create and send notification"""
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            metadata=metadata or {}
        )

        # Send via WebSocket
        NotificationService._send_websocket(user.id, notification)

        return notification

    @staticmethod
    def _send_websocket(user_id, notification):
        """Send notification via WebSocket"""
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                notification_dict = {
                    'id': notification.id,
                    'type': notification.notification_type,
                    'title': notification.title,
                    'message': notification.message,
                    'is_read': notification.is_read,
                    'created_at': notification.created_at.isoformat(),
                    'metadata': notification.metadata
                }
                async_to_sync(channel_layer.group_send)(
                    f'user_{user_id}',
                    {
                        'type': 'notification_message',
                        'notification': notification_dict
                    }
                )
        except Exception as e:
            logger.warning(f"WebSocket error: {e}")

    # Specific notification methods

    @staticmethod
    def notify_enrollment_pending(teacher_user, student_name, course_title, enrollment_id):
        """Notify teacher of pending enrollment"""
        return NotificationService.create_notification(
            user=teacher_user,
            notification_type='enrollment_pending',
            title='New Enrollment Request',
            message=f'{student_name} has requested enrollment in {course_title}',
            metadata={'enrollment_id': enrollment_id, 'course': course_title}
        )

    @staticmethod
    def notify_enrollment_approved(student_user, course_title, enrollment_id):
        """Notify student of approved enrollment"""
        return NotificationService.create_notification(
            user=student_user,
            notification_type='enrollment_approved',
            title='Enrollment Approved!',
            message=f'Your enrollment in {course_title} has been approved. AI features are now unlocked!',
            metadata={'enrollment_id': enrollment_id, 'course': course_title}
        )

    @staticmethod
    def notify_enrollment_rejected(student_user, course_title, reason):
        """Notify student of rejected enrollment"""
        return NotificationService.create_notification(
            user=student_user,
            notification_type='enrollment_rejected',
            title='Enrollment Rejected',
            message=f'Your enrollment request for {course_title} was not approved. Reason: {reason}',
            metadata={'course': course_title, 'reason': reason}
        )

    @staticmethod
    def notify_submission_received(teacher_user, student_name, assignment_title, submission_id):
        """Notify teacher of new submission"""
        return NotificationService.create_notification(
            user=teacher_user,
            notification_type='submission_received',
            title='New Assignment Submission',
            message=f'{student_name} submitted {assignment_title}',
            metadata={'submission_id': submission_id, 'assignment': assignment_title}
        )

    @staticmethod
    def notify_submission_graded(student_user, assignment_title, marks, feedback):
        """Notify student submission is graded"""
        return NotificationService.create_notification(
            user=student_user,
            notification_type='submission_graded',
            title='Assignment Graded',
            message=f'Your submission for {assignment_title} has been graded. Score: {marks}',
            metadata={'assignment': assignment_title, 'marks': marks, 'feedback': feedback}
        )

    @staticmethod
    def notify_grade_published(student_user, course_title, final_score, letter_grade):
        """Notify student final grade published"""
        return NotificationService.create_notification(
            user=student_user,
            notification_type='grade_published',
            title='Final Grade Published',
            message=f'Your final grade for {course_title} is now available: {letter_grade} ({final_score}%)',
            metadata={'course': course_title, 'score': final_score, 'grade': letter_grade}
        )

    @staticmethod
    def notify_new_assignment(student_user, course_title, assignment_title, due_date):
        """Notify student of new assignment"""
        return NotificationService.create_notification(
            user=student_user,
            notification_type='new_assignment',
            title='New Assignment Posted',
            message=f'New assignment in {course_title}: {assignment_title}. Due: {due_date}',
            metadata={'course': course_title, 'assignment': assignment_title, 'due_date': str(due_date)}
        )

    @staticmethod
    def notify_course_completed(student_user, course_title, enrollment_id):
        """Notify student course completed"""
        return NotificationService.create_notification(
            user=student_user,
            notification_type='course_completed',
            title='Course Completed!',
            message=f'Congratulations! You have completed {course_title}',
            metadata={'course': course_title, 'enrollment_id': enrollment_id}
        )

    @staticmethod
    def notify_certificate_ready(student_user, course_title, certificate_id):
        """Notify student certificate is ready"""
        return NotificationService.create_notification(
            user=student_user,
            notification_type='certificate_ready',
            title='Certificate Ready',
            message=f'Your certificate for {course_title} is ready to download!',
            metadata={'course': course_title, 'certificate_id': certificate_id}
        )

    @staticmethod
    def notify_teacher_rated(teacher_user, student_name, rating, course_title):
        """Notify teacher of new rating"""
        return NotificationService.create_notification(
            user=teacher_user,
            notification_type='teacher_rated',
            title='New Rating Received',
            message=f'You received a {rating}-star rating for {course_title}',
            metadata={'rating': rating, 'course': course_title}
        )

    @staticmethod
    def notify_ai_feedback_ready(student_user, assignment_title, feedback_id):
        """Notify student AI feedback is ready"""
        return NotificationService.create_notification(
            user=student_user,
            notification_type='ai_feedback_ready',
            title='AI Feedback Available',
            message=f'AI-generated feedback for {assignment_title} is now available',
            metadata={'assignment': assignment_title, 'feedback_id': feedback_id}
        )

    @staticmethod
    def notify_career_recommendation(student_user, job_count):
        """Notify student of career recommendations"""
        return NotificationService.create_notification(
            user=student_user,
            notification_type='career_recommendation',
            title='New Career Recommendations',
            message=f'{job_count} new career opportunities matched to your profile',
            metadata={'job_count': job_count}
        )

    @staticmethod
    def get_user_notifications(user, unread_only=False, limit=50):
        """Get user's notifications"""
        queryset = Notification.objects.filter(user=user)
        if unread_only:
            queryset = queryset.filter(is_read=False)
        return queryset[:limit]

    @staticmethod
    def mark_all_read(user):
        """Mark all user notifications as read"""
        return Notification.objects.filter(user=user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )

    @staticmethod
    def get_unread_count(user):
        """Get count of unread notifications"""
        return Notification.objects.filter(user=user, is_read=False).count()

    @staticmethod
    def notify_grade_published_from_object(user_id, grade):
        """Wrapper method that accepts grade object"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
            return NotificationService.notify_grade_published(
                student_user=user,
                course_title=grade.course.title,
                final_score=float(grade.final_score),
                letter_grade=grade.letter_grade
            )
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return None

    @staticmethod
    def notify_teacher_rated_from_object(user_id, rating):
        """Wrapper method that accepts rating object"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
            return NotificationService.notify_teacher_rated(
                teacher_user=user,
                student_name=rating.student.user.get_full_name(),
                rating=rating.rating,
                course_title=rating.course.title
            )
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return None
