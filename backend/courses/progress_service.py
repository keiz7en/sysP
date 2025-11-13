"""
Progress tracking and grading service
Handles all student progress, assignment grading, and course completion logic
"""
from django.db import transaction
from django.utils import timezone
from django.db.models import Avg, Count, Q, Sum
from decimal import Decimal
from .models import (
    CourseEnrollment, Assignment, AssignmentSubmission,
    Grade, TeacherRating, Course
)


class ProgressTrackingService:
    """Service for tracking and calculating student progress"""

    @staticmethod
    def calculate_enrollment_progress(enrollment_id):
        """
        Calculate overall progress for an enrollment based on completed tasks
        Returns: updated completion_percentage
        """
        try:
            enrollment = CourseEnrollment.objects.select_related('course').get(id=enrollment_id)
            course = enrollment.course

            # Get all assignments for the course
            total_assignments = Assignment.objects.filter(
                course=course,
                is_published=True
            ).count()

            if total_assignments == 0:
                return 0

            # Get completed/graded submissions
            graded_submissions = AssignmentSubmission.objects.filter(
                assignment__course=course,
                student=enrollment.student,
                points_earned__isnull=False
            ).count()

            progress = (graded_submissions / total_assignments) * 100

            # Update enrollment
            enrollment.completion_percentage = Decimal(str(progress))
            enrollment.save(update_fields=['completion_percentage', 'updated_at'])

            return progress

        except CourseEnrollment.DoesNotExist:
            return 0

    @staticmethod
    def update_progress_on_submission_grade(submission_id):
        """Update progress when a submission is graded"""
        try:
            submission = AssignmentSubmission.objects.select_related(
                'student',
                'assignment__course'
            ).get(id=submission_id)

            # Find the enrollment
            enrollment = CourseEnrollment.objects.filter(
                student=submission.student,
                course=submission.assignment.course
            ).first()

            if enrollment:
                ProgressTrackingService.calculate_enrollment_progress(enrollment.id)

                # Check if course is complete
                if enrollment.completion_percentage >= 100:
                    ProgressTrackingService.trigger_course_completion(enrollment.id)

        except AssignmentSubmission.DoesNotExist:
            pass

    @staticmethod
    @transaction.atomic
    def trigger_course_completion(enrollment_id):
        """
        Trigger course completion workflow:
        1. Calculate final grade
        2. Publish grade
        3. Mark enrollment as completed
        4. Enable teacher rating
        """
        try:
            enrollment = CourseEnrollment.objects.select_related(
                'course',
                'student',
                'course__instructor'
            ).get(id=enrollment_id)

            # Check if already completed
            if enrollment.status == 'completed':
                return

            # Calculate final grade
            grade_data = GradingService.calculate_final_grade(enrollment)

            # Create or update Grade record
            grade, created = Grade.objects.update_or_create(
                enrollment=enrollment,
                course=enrollment.course,
                student=enrollment.student,
                defaults={
                    'teacher': enrollment.course.instructor,
                    'final_score': grade_data['final_score'],
                    'letter_grade': grade_data['letter_grade'],
                    'grade_points': grade_data['grade_points'],
                    'assignments_score': grade_data['assignments_score'],
                    'quizzes_score': grade_data['quizzes_score'],
                    'exams_score': grade_data['exams_score'],
                    'projects_score': grade_data['projects_score'],
                }
            )

            # Publish the grade
            grade.publish_grade()

            print(f"Course completion triggered for enrollment {enrollment_id}")

        except CourseEnrollment.DoesNotExist:
            pass


class GradingService:
    """Service for grading assignments and calculating final grades"""

    @staticmethod
    @transaction.atomic
    def grade_submission(submission_id, points_earned, feedback, graded_by_teacher):
        """
        Grade a student submission
        Args:
            submission_id: ID of the submission
            points_earned: Points awarded (0 to max_points)
            feedback: Text feedback from teacher
            graded_by_teacher: TeacherProfile instance
        """
        try:
            submission = AssignmentSubmission.objects.select_related(
                'assignment',
                'student'
            ).get(id=submission_id)

            # Update submission
            submission.points_earned = Decimal(str(points_earned))
            submission.feedback = feedback
            submission.graded_at = timezone.now()
            submission.graded_by = graded_by_teacher
            submission.save()

            # Update progress
            ProgressTrackingService.update_progress_on_submission_grade(submission_id)

            return submission

        except AssignmentSubmission.DoesNotExist:
            raise ValueError(f"Submission {submission_id} not found")

    @staticmethod
    def calculate_final_grade(enrollment):
        """
        Calculate final grade for an enrollment based on all submissions
        Returns dict with grade breakdown
        """
        course = enrollment.course
        student = enrollment.student

        # Get all submissions
        submissions = AssignmentSubmission.objects.filter(
            assignment__course=course,
            student=student,
            points_earned__isnull=False
        ).select_related('assignment')

        # Calculate scores by type
        assignments_total = Decimal('0')
        assignments_earned = Decimal('0')
        quizzes_total = Decimal('0')
        quizzes_earned = Decimal('0')
        exams_total = Decimal('0')
        exams_earned = Decimal('0')
        projects_total = Decimal('0')
        projects_earned = Decimal('0')

        for sub in submissions:
            if sub.assignment.assignment_type == 'homework':
                assignments_total += sub.assignment.max_points
                assignments_earned += sub.points_earned
            elif sub.assignment.assignment_type == 'quiz':
                quizzes_total += sub.assignment.max_points
                quizzes_earned += sub.points_earned
            elif sub.assignment.assignment_type == 'exam':
                exams_total += sub.assignment.max_points
                exams_earned += sub.points_earned
            elif sub.assignment.assignment_type == 'project':
                projects_total += sub.assignment.max_points
                projects_earned += sub.points_earned

        # Calculate percentages
        assignments_score = (assignments_earned / assignments_total * 100) if assignments_total > 0 else Decimal('0')
        quizzes_score = (quizzes_earned / quizzes_total * 100) if quizzes_total > 0 else Decimal('0')
        exams_score = (exams_earned / exams_total * 100) if exams_total > 0 else Decimal('0')
        projects_score = (projects_earned / projects_total * 100) if projects_total > 0 else Decimal('0')

        # Weighted average (adjust weights as needed)
        final_score = (
                assignments_score * Decimal('0.30') +
                quizzes_score * Decimal('0.20') +
                exams_score * Decimal('0.30') +
                projects_score * Decimal('0.20')
        )

        # Calculate letter grade and GPA
        letter_grade = GradingService._score_to_letter_grade(float(final_score))
        grade_points = GradingService._letter_to_gpa(letter_grade)

        return {
            'final_score': final_score,
            'letter_grade': letter_grade,
            'grade_points': Decimal(str(grade_points)),
            'assignments_score': assignments_score,
            'quizzes_score': quizzes_score,
            'exams_score': exams_score,
            'projects_score': projects_score,
        }

    @staticmethod
    def _score_to_letter_grade(score):
        """Convert numeric score to letter grade"""
        if score >= 93:
            return 'A'
        elif score >= 90:
            return 'A-'
        elif score >= 87:
            return 'B+'
        elif score >= 83:
            return 'B'
        elif score >= 80:
            return 'B-'
        elif score >= 77:
            return 'C+'
        elif score >= 73:
            return 'C'
        elif score >= 70:
            return 'C-'
        elif score >= 60:
            return 'D'
        else:
            return 'F'

    @staticmethod
    def _letter_to_gpa(letter_grade):
        """Convert letter grade to GPA points"""
        grade_map = {
            'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D': 1.0, 'F': 0.0
        }
        return grade_map.get(letter_grade, 0.0)


class TeacherRatingService:
    """Service for managing teacher ratings"""

    @staticmethod
    @transaction.atomic
    def submit_rating(enrollment_id, rating, feedback=''):
        """
        Submit a rating for a teacher after course completion
        Args:
            enrollment_id: CourseEnrollment ID
            rating: Integer 1-5
            feedback: Optional text feedback
        """
        try:
            enrollment = CourseEnrollment.objects.select_related(
                'course',
                'student',
                'course__instructor'
            ).get(id=enrollment_id)

            # Verify enrollment is completed
            if enrollment.status != 'completed':
                raise ValueError("Cannot rate teacher before course completion")

            # Create or update rating
            teacher_rating, created = TeacherRating.objects.update_or_create(
                student=enrollment.student,
                teacher=enrollment.course.instructor,
                course=enrollment.course,
                enrollment=enrollment,
                defaults={
                    'rating': rating,
                    'feedback': feedback
                }
            )

            # Update teacher's average rating
            enrollment.course.instructor.update_average_rating(rating)

            return teacher_rating

        except CourseEnrollment.DoesNotExist:
            raise ValueError(f"Enrollment {enrollment_id} not found")

    @staticmethod
    def get_teacher_average_rating(teacher_id):
        """Get average rating for a teacher"""
        from teachers.models import TeacherProfile
        try:
            teacher = TeacherProfile.objects.get(id=teacher_id)
            return {
                'average_rating': float(teacher.average_rating),
                'total_ratings': teacher.total_ratings
            }
        except TeacherProfile.DoesNotExist:
            return {'average_rating': 0.0, 'total_ratings': 0}


class EnrollmentService:
    """Service for managing enrollments and approvals"""

    @staticmethod
    @transaction.atomic
    def approve_enrollment(enrollment_id, approved_by_user):
        """Approve a pending enrollment"""
        try:
            enrollment = CourseEnrollment.objects.select_related('course').get(id=enrollment_id)

            if enrollment.status != 'pending':
                raise ValueError(f"Enrollment is not in pending status: {enrollment.status}")

            # Approve and unlock AI features
            enrollment.approve_enrollment(approved_by_user)

            return enrollment

        except CourseEnrollment.DoesNotExist:
            raise ValueError(f"Enrollment {enrollment_id} not found")

    @staticmethod
    @transaction.atomic
    def reject_enrollment(enrollment_id, reason=''):
        """Reject a pending enrollment"""
        try:
            enrollment = CourseEnrollment.objects.get(id=enrollment_id)
            enrollment.reject_enrollment(reason)
            return enrollment
        except CourseEnrollment.DoesNotExist:
            raise ValueError(f"Enrollment {enrollment_id} not found")
