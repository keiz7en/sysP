from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import TeacherSubjectRequest, TeacherApprovedSubject, CourseEnrollment, Course
import json


@receiver(post_save, sender=TeacherSubjectRequest)
def notify_subject_request_status(sender, instance, created, **kwargs):
    """Send notification when subject request status changes"""
    if created:
        return
    
    teacher_email = instance.teacher.user.email
    subject_name = instance.subject.name
    
    if instance.status == 'approved':
        subject = f"Subject Request Approved: {subject_name}"
        message = f"""
        Dear {instance.teacher.user.first_name},
        
        Your request to teach "{subject_name}" has been approved by the admin.
        You can now create courses in this subject.
        
        Best regards,
        Admin Team
        """
    elif instance.status == 'rejected':
        subject = f"Subject Request Rejected: {subject_name}"
        message = f"""
        Dear {instance.teacher.user.first_name},
        
        Unfortunately, your request to teach "{subject_name}" has been rejected.
        Reason: {instance.rejection_reason}
        
        You can submit a new request after addressing the concerns.
        
        Best regards,
        Admin Team
        """
    else:
        return
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [teacher_email],
            fail_silently=True,
        )
    except Exception as e:
        print(f"Error sending email: {e}")


@receiver(post_save, sender=CourseEnrollment)
def notify_enrollment_status(sender, instance, created, **kwargs):
    """Send notification when enrollment status changes"""
    if created:
        student_email = instance.student.user.email
        course_name = instance.course.title
        subject = f"Enrollment Request Received: {course_name}"
        message = f"""
        Dear {instance.student.user.first_name},
        
        Your enrollment request for "{course_name}" has been received.
        The course instructor will review your request soon.
        
        Best regards,
        Academic Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [student_email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Error sending email: {e}")
    else:
        student_email = instance.student.user.email
        course_name = instance.course.title
        
        if instance.status == 'active' and instance.ai_features_unlocked:
            subject = f"Enrollment Approved: {course_name}"
            message = f"""
            Dear {instance.student.user.first_name},
            
            Congratulations! Your enrollment request for "{course_name}" has been approved.
            
            You now have access to:
            - Course materials and syllabus
            - AI-generated quizzes and assignments
            - Learning analytics and insights
            - Discussion forums
            
            Best regards,
            Academic Team
            """
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [student_email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Error sending email: {e}")
        
        elif instance.status == 'rejected':
            subject = f"Enrollment Request Rejected: {course_name}"
            message = f"""
            Dear {instance.student.user.first_name},
            
            Your enrollment request for "{course_name}" has been reviewed and rejected.
            
            Reason: {instance.rejection_reason}
            
            Please contact the course instructor if you have any questions.
            
            Best regards,
            Academic Team
            """
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [student_email],
                    fail_silently=True,
                )
            except Exception as e:
                print(f"Error sending email: {e}")


@receiver(post_save, sender=Course)
def notify_course_approval(sender, instance, created, **kwargs):
    """Send notification when course is approved"""
    if not created and instance.status == 'approved' and instance.ai_content_enabled:
        teacher_email = instance.instructor.user.email
        subject = f"Course Approved with AI Features: {instance.title}"
        message = f"""
        Dear {instance.instructor.user.first_name},
        
        Your course "{instance.title}" ({instance.code}) has been approved by the admin.
        
        AI Features are now enabled for this course:
        - AI-powered quiz generation
        - Automated assignment creation
        - Intelligent assessment system
        - Student learning analytics
        
        You can now open enrollment for students.
        
        Best regards,
        Admin Team
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [teacher_email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Error sending email: {e}")
