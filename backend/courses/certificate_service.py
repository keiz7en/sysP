"""
Certificate Generation Service
Automatically generates PDF certificates for course completion
"""
from django.db import transaction
from django.utils import timezone
from django.core.files.base import ContentFile
import logging
from io import BytesIO

from courses.models import (
    Certificate, CourseEnrollment, Grade,
    Notification, ActivityLog
)

logger = logging.getLogger(__name__)


class CertificateService:
    """Service for generating course completion certificates"""

    @transaction.atomic
    def generate_certificate(self, enrollment_id):
        """
        Generate a certificate for completed course enrollment
        
        Args:
            enrollment_id: ID of CourseEnrollment
            
        Returns:
            Certificate instance
        """
        try:
            enrollment = CourseEnrollment.objects.select_related(
                'student__user',
                'course__instructor__user',
                'course__subject'
            ).get(id=enrollment_id)

            # Validate completion requirements
            if not self._is_eligible_for_certificate(enrollment):
                logger.warning(f"Enrollment {enrollment_id} not eligible for certificate")
                return None

            # Get final grade
            try:
                grade = Grade.objects.get(enrollment=enrollment)
            except Grade.DoesNotExist:
                logger.error(f"No grade found for enrollment {enrollment_id}")
                return None

            # Check if certificate already exists
            if hasattr(enrollment, 'certificate'):
                logger.info(f"Certificate already exists for enrollment {enrollment_id}")
                return enrollment.certificate

            # Create certificate record
            certificate = Certificate.objects.create(
                enrollment=enrollment,
                student=enrollment.student,
                course=enrollment.course,
                teacher=enrollment.course.instructor,
                final_grade=grade.letter_grade,
                grade_points=grade.grade_points,
                metadata={
                    'completion_date': str(timezone.now().date()),
                    'course_title': enrollment.course.title,
                    'course_code': enrollment.course.code,
                    'credits': enrollment.course.credits,
                    'student_name': enrollment.student.user.get_full_name(),
                    'instructor_name': enrollment.course.instructor.user.get_full_name()
                }
            )

            # Generate PDF
            pdf_content = self._generate_certificate_pdf(certificate)
            if pdf_content:
                certificate.certificate_pdf.save(
                    f'certificate_{certificate.certificate_id}.pdf',
                    ContentFile(pdf_content),
                    save=True
                )

            # Create notification
            Notification.objects.create(
                user=enrollment.student.user,
                notification_type='certificate_ready',
                title='Certificate Ready!',
                message=f'Your certificate for "{enrollment.course.title}" is ready for download.',
                related_model='Certificate',
                related_id=certificate.id,
                metadata={
                    'certificate_id': certificate.certificate_id,
                    'verification_code': certificate.verification_code
                }
            )

            # Log activity
            ActivityLog.objects.create(
                user=None,  # System-generated
                action_type='certificate_generation',
                description=f'Certificate generated for {enrollment.student.user.get_full_name()} - {enrollment.course.code}',
                target_model='Certificate',
                target_id=certificate.id,
                metadata={
                    'enrollment_id': str(enrollment.id),
                    'certificate_id': certificate.certificate_id,
                    'grade': grade.letter_grade
                }
            )

            logger.info(f"Generated certificate {certificate.certificate_id}")
            return certificate

        except CourseEnrollment.DoesNotExist:
            logger.error(f"Enrollment {enrollment_id} not found")
            return None
        except Exception as e:
            logger.error(f"Error generating certificate: {str(e)}")
            return None

    def _is_eligible_for_certificate(self, enrollment):
        """Check if student is eligible for certificate"""
        return (
                enrollment.status == 'completed' and
                enrollment.completion_percentage >= 100 and
                enrollment.final_score is not None and
                hasattr(enrollment, 'final_grade') and
                enrollment.final_grade.is_published
        )

    def _generate_certificate_pdf(self, certificate):
        """Generate PDF content for certificate"""
        try:
            from reportlab.lib.pagesizes import letter, A4
            from reportlab.lib.units import inch
            from reportlab.pdfgen import canvas
            from reportlab.lib import colors
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.platypus import Paragraph

            buffer = BytesIO()

            # Create PDF canvas
            c = canvas.Canvas(buffer, pagesize=A4)
            width, height = A4

            # Certificate design
            # Border
            c.setStrokeColor(colors.HexColor('#1976d2'))
            c.setLineWidth(4)
            c.rect(30, 30, width - 60, height - 60, fill=0)

            # Inner border
            c.setStrokeColor(colors.HexColor('#64b5f6'))
            c.setLineWidth(2)
            c.rect(40, 40, width - 80, height - 80, fill=0)

            # Title
            c.setFont("Helvetica-Bold", 36)
            c.setFillColor(colors.HexColor('#1976d2'))
            c.drawCentredString(width / 2, height - 100, "CERTIFICATE")

            c.setFont("Helvetica", 20)
            c.setFillColor(colors.HexColor('#424242'))
            c.drawCentredString(width / 2, height - 130, "OF COMPLETION")

            # Decorative line
            c.setStrokeColor(colors.HexColor('#1976d2'))
            c.setLineWidth(2)
            c.line(150, height - 150, width - 150, height - 150)

            # Body text
            y_position = height - 200

            c.setFont("Helvetica", 14)
            c.setFillColor(colors.black)
            c.drawCentredString(width / 2, y_position, "This is to certify that")

            y_position -= 40
            c.setFont("Helvetica-Bold", 24)
            c.setFillColor(colors.HexColor('#1976d2'))
            c.drawCentredString(width / 2, y_position, certificate.student.user.get_full_name())

            # Underline name
            c.setStrokeColor(colors.HexColor('#1976d2'))
            c.setLineWidth(1)
            name_width = c.stringWidth(certificate.student.user.get_full_name(), "Helvetica-Bold", 24)
            c.line(width / 2 - name_width / 2, y_position - 5, width / 2 + name_width / 2, y_position - 5)

            y_position -= 50
            c.setFont("Helvetica", 14)
            c.setFillColor(colors.black)
            c.drawCentredString(width / 2, y_position, "has successfully completed the course")

            y_position -= 35
            c.setFont("Helvetica-Bold", 18)
            c.setFillColor(colors.HexColor('#424242'))
            c.drawCentredString(width / 2, y_position, certificate.course.title)

            y_position -= 30
            c.setFont("Helvetica", 12)
            c.setFillColor(colors.HexColor('#666666'))
            c.drawCentredString(width / 2, y_position, f"Course Code: {certificate.course.code}")

            y_position -= 50
            c.setFont("Helvetica", 14)
            c.setFillColor(colors.black)

            # Grade and date in columns
            left_col_x = width / 3
            right_col_x = 2 * width / 3

            c.drawCentredString(left_col_x, y_position, f"Grade: {certificate.final_grade}")
            c.drawCentredString(right_col_x, y_position, f"GPA: {certificate.grade_points}")

            y_position -= 30
            c.setFont("Helvetica", 12)
            c.drawCentredString(left_col_x, y_position, f"Credits: {certificate.course.credits}")
            c.drawCentredString(right_col_x, y_position, f"Date: {certificate.issue_date.strftime('%B %d, %Y')}")

            # Signatures
            y_position = 180

            # Instructor signature
            c.setFont("Helvetica-Bold", 12)
            c.setFillColor(colors.black)
            c.line(80, y_position, 250, y_position)
            c.drawCentredString(165, y_position - 20, certificate.teacher.user.get_full_name())
            c.setFont("Helvetica", 10)
            c.setFillColor(colors.HexColor('#666666'))
            c.drawCentredString(165, y_position - 35, "Course Instructor")

            # Admin signature placeholder
            c.setFont("Helvetica-Bold", 12)
            c.setFillColor(colors.black)
            c.line(width - 250, y_position, width - 80, y_position)
            c.drawCentredString(width - 165, y_position - 20, "Academic Director")
            c.setFont("Helvetica", 10)
            c.setFillColor(colors.HexColor('#666666'))
            c.drawCentredString(width - 165, y_position - 35, "EduAI Platform")

            # Footer - Certificate ID and verification
            c.setFont("Helvetica", 8)
            c.setFillColor(colors.HexColor('#999999'))
            c.drawCentredString(width / 2, 60, f"Certificate ID: {certificate.certificate_id}")
            c.drawCentredString(width / 2, 48, f"Verification Code: {certificate.verification_code}")
            c.drawCentredString(width / 2, 36, "This certificate can be verified at www.eduai.com/verify")

            # Save PDF
            c.save()

            pdf_content = buffer.getvalue()
            buffer.close()

            return pdf_content

        except ImportError:
            logger.warning("reportlab not installed - certificate PDF generation skipped")
            return None
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            return None

    def verify_certificate(self, certificate_id=None, verification_code=None):
        """Verify certificate authenticity"""
        try:
            if certificate_id:
                certificate = Certificate.objects.get(certificate_id=certificate_id)
            elif verification_code:
                certificate = Certificate.objects.get(verification_code=verification_code)
            else:
                return None

            if not certificate.is_verified:
                return None

            return {
                'valid': True,
                'student_name': certificate.student.user.get_full_name(),
                'course_title': certificate.course.title,
                'course_code': certificate.course.code,
                'final_grade': certificate.final_grade,
                'issue_date': str(certificate.issue_date),
                'instructor': certificate.teacher.user.get_full_name()
            }

        except Certificate.DoesNotExist:
            return {'valid': False, 'message': 'Certificate not found'}
        except Exception as e:
            logger.error(f"Error verifying certificate: {str(e)}")
            return {'valid': False, 'message': 'Verification error'}
