from rest_framework import status
from rest_framework.response import Response
from .models import CourseEnrollment


class AIAccessControlMiddleware:
    """
    Middleware to enforce AI feature access control based on approval chain.
    Ensures AI content is only accessible when:
    1. Course is approved
    2. Student enrollment is approved
    3. AI features are explicitly unlocked
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    @staticmethod
    def check_ai_access(user, course_id):
        """
        Check if user has access to AI features for a specific course.
        Returns: (has_access: bool, reason: str)
        """
        from students.models import StudentProfile
        from .models import Course
        
        try:
            student = StudentProfile.objects.get(user=user)
            course = Course.objects.get(id=course_id)
            
            if not course.can_enable_ai_features():
                return False, "Course AI features are not enabled"
            
            enrollment = CourseEnrollment.objects.get(
                student=student,
                course=course
            )
            
            if not enrollment.is_ai_enabled():
                return False, "You are not approved for AI features in this course"
            
            return True, "AI access granted"
        
        except (StudentProfile.DoesNotExist, Course.DoesNotExist, CourseEnrollment.DoesNotExist):
            return False, "Invalid request"


def enforce_ai_access(view_func):
    """
    Decorator to enforce AI access control on API views.
    Use on endpoints that return AI-generated content.
    """
    def wrapper(request, *args, **kwargs):
        course_id = request.query_params.get('course_id') or request.data.get('course_id')
        
        if course_id:
            has_access, reason = AIAccessControlMiddleware.check_ai_access(request.user, course_id)
            
            if not has_access:
                return Response(
                    {'error': reason},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return view_func(request, *args, **kwargs)
    
    return wrapper


class CourseApprovalValidator:
    """
    Validates course approval chain at each step.
    """
    
    @staticmethod
    def can_teacher_create_course(teacher, subject):
        """Check if teacher is approved to create course in subject"""
        return teacher.is_approved and teacher.can_teach_subject(subject)
    
    @staticmethod
    def can_course_be_approved(course):
        """Check if course meets approval criteria"""
        return (
            course.instructor.is_approved and
            course.subject and
            course.instructor.can_teach_subject(course.subject)
        )
    
    @staticmethod
    def can_student_enroll(student, course):
        """Check if student can enroll in course"""
        return course.is_approved_and_open() and not course.is_full
    
    @staticmethod
    def unlock_ai_for_enrollment(enrollment):
        """Unlock AI features for approved enrollment"""
        if enrollment.status in ['active', 'approved']:
            enrollment.ai_features_unlocked = True
            enrollment.ai_unlock_date = __import__('django.utils.timezone', fromlist=['now']).now()
            enrollment.save()
    
    @staticmethod
    def lock_ai_for_enrollment(enrollment, reason=""):
        """Lock AI features for enrollment"""
        enrollment.ai_features_unlocked = False
        if reason:
            enrollment.rejection_reason = reason
        enrollment.save()


class ApprovalChainLogger:
    """
    Logs all approval chain events for audit purposes.
    """
    
    @staticmethod
    def log_subject_request(teacher, subject, action, by_user=None):
        """Log subject request action"""
        print(f"""
        [APPROVAL LOG] Subject Request
        - Teacher: {teacher.user.get_full_name()}
        - Subject: {subject.name}
        - Action: {action}
        - By: {by_user.get_full_name() if by_user else 'System'}
        - Timestamp: {__import__('django.utils.timezone', fromlist=['now']).now()}
        """)
    
    @staticmethod
    def log_course_approval(course, action, by_user=None):
        """Log course approval action"""
        print(f"""
        [APPROVAL LOG] Course Approval
        - Course: {course.title} ({course.code})
        - Teacher: {course.instructor.user.get_full_name()}
        - Action: {action}
        - By: {by_user.get_full_name() if by_user else 'System'}
        - Timestamp: {__import__('django.utils.timezone', fromlist=['now']).now()}
        """)
    
    @staticmethod
    def log_enrollment_approval(enrollment, action, by_user=None):
        """Log enrollment approval action"""
        print(f"""
        [APPROVAL LOG] Enrollment Approval
        - Student: {enrollment.student.user.get_full_name()}
        - Course: {enrollment.course.title}
        - Action: {action}
        - By: {by_user.get_full_name() if by_user else 'System'}
        - AI Features: {'Unlocked' if enrollment.ai_features_unlocked else 'Locked'}
        - Timestamp: {__import__('django.utils.timezone', fromlist=['now']).now()}
        """)
