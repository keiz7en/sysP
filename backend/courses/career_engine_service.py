"""
Career Recommendation Engine
Maps course skills to job profiles and generates recommendations
"""
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
import logging

from courses.models import (
    CourseEnrollment, Grade, Certificate,
    Notification, ActivityLog
)
from career.models import (
    Skill, StudentSkillProfile, StudentSkillLevel,
    JobMarketData, JobRecommendation, TrainingProgram
)
from ai_services.gemini_service import GeminiAIService

logger = logging.getLogger(__name__)


class CareerRecommendationEngine:
    """Service for career recommendation and skill mapping"""

    def __init__(self):
        self.gemini = GeminiAIService()

    @transaction.atomic
    def generate_recommendations_after_completion(self, enrollment_id):
        """
        Generate career recommendations after course completion
        
        Args:
            enrollment_id: ID of completed CourseEnrollment
            
        Returns:
            List of JobRecommendation instances
        """
        try:
            enrollment = CourseEnrollment.objects.select_related(
                'student__user',
                'course__subject',
                'course__instructor'
            ).get(id=enrollment_id)

            if enrollment.status != 'completed':
                logger.warning(f"Enrollment {enrollment_id} not completed")
                return []

            # Get or create skill profile
            skill_profile, created = StudentSkillProfile.objects.get_or_create(
                student=enrollment.student
            )

            # Update skills based on course completion
            self._update_student_skills(enrollment, skill_profile)

            # Get student's complete skill set
            student_skills = self._get_student_skills(skill_profile)

            # Find matching jobs
            recommendations = self._match_jobs(enrollment.student, student_skills, skill_profile)

            # Create notifications
            if recommendations:
                Notification.objects.create(
                    user=enrollment.student.user,
                    notification_type='system_alert',
                    title='Career Recommendations Available',
                    message=f'Based on completing "{enrollment.course.title}", we found {len(recommendations)} matching career opportunities!',
                    related_model='CourseEnrollment',
                    related_id=enrollment.id,
                    metadata={'recommendation_count': len(recommendations)}
                )

            # Log activity
            ActivityLog.objects.create(
                user=None,  # System-generated
                action_type='ai_access',
                description=f'Career recommendations generated for {enrollment.student.user.get_full_name()}',
                target_model='JobRecommendation',
                target_id=None,
                metadata={
                    'enrollment_id': str(enrollment.id),
                    'recommendations_count': len(recommendations)
                }
            )

            logger.info(f"Generated {len(recommendations)} career recommendations for enrollment {enrollment_id}")
            return recommendations

        except CourseEnrollment.DoesNotExist:
            logger.error(f"Enrollment {enrollment_id} not found")
            return []
        except Exception as e:
            logger.error(f"Error generating career recommendations: {str(e)}")
            return []

    def _update_student_skills(self, enrollment, skill_profile):
        """Update student skills based on completed course"""
        # Get grade to determine proficiency level
        try:
            grade = Grade.objects.get(enrollment=enrollment)
            final_score = float(grade.final_score)
        except Grade.DoesNotExist:
            final_score = float(enrollment.final_score) if enrollment.final_score else 70

        # Determine proficiency level based on grade
        if final_score >= 90:
            proficiency = 'expert'
        elif final_score >= 80:
            proficiency = 'advanced'
        elif final_score >= 70:
            proficiency = 'intermediate'
        else:
            proficiency = 'beginner'

        # Map course to skills
        course_skills = self._map_course_to_skills(enrollment.course)

        # Update or create skill levels
        for skill_name, confidence in course_skills.items():
            try:
                skill, _ = Skill.objects.get_or_create(
                    name=skill_name,
                    defaults={
                        'category_id': 1,  # Default category
                        'is_technical': True,
                        'market_demand': 'medium'
                    }
                )

                StudentSkillLevel.objects.update_or_create(
                    student_profile=skill_profile,
                    skill=skill,
                    defaults={
                        'proficiency_level': proficiency,
                        'confidence_score': Decimal(str(confidence)),
                        'verified': True,
                        'last_practiced': timezone.now()
                    }
                )
            except Exception as e:
                logger.warning(f"Could not add skill {skill_name}: {str(e)}")
                continue

    def _map_course_to_skills(self, course):
        """Map course subject to relevant skills"""
        skill_mapping = {
            'ai_ml': {
                'Machine Learning': 0.90,
                'Deep Learning': 0.85,
                'Neural Networks': 0.85,
                'Python Programming': 0.90,
                'Data Analysis': 0.85,
                'AI Model Development': 0.80
            },
            'computer_science': {
                'Programming': 0.90,
                'Data Structures': 0.85,
                'Algorithms': 0.85,
                'Software Development': 0.80,
                'Problem Solving': 0.85
            },
            'mathematics': {
                'Mathematical Analysis': 0.90,
                'Statistics': 0.85,
                'Calculus': 0.85,
                'Linear Algebra': 0.80,
                'Problem Solving': 0.85
            },
            'physics': {
                'Physics': 0.90,
                'Scientific Method': 0.85,
                'Mathematical Modeling': 0.80,
                'Critical Thinking': 0.85
            },
            'chemistry': {
                'Chemistry': 0.90,
                'Laboratory Skills': 0.85,
                'Scientific Analysis': 0.85,
                'Research Methods': 0.80
            },
            'biology': {
                'Biology': 0.90,
                'Life Sciences': 0.85,
                'Research Methods': 0.85,
                'Scientific Writing': 0.80
            },
            'languages': {
                'Language Proficiency': 0.90,
                'Communication Skills': 0.85,
                'Writing': 0.85,
                'Cultural Understanding': 0.80
            },
        }

        category = course.subject.category if hasattr(course, 'subject') else 'other'
        return skill_mapping.get(category, {'General Skills': 0.75})

    def _get_student_skills(self, skill_profile):
        """Get all student skills with proficiency levels"""
        skill_levels = StudentSkillLevel.objects.filter(
            student_profile=skill_profile
        ).select_related('skill')

        skills_data = {}
        for level in skill_levels:
            skills_data[level.skill.name] = {
                'proficiency': level.proficiency_level,
                'confidence': float(level.confidence_score),
                'verified': level.verified
            }

        return skills_data

    def _match_jobs(self, student, student_skills, skill_profile):
        """Match student skills to job market data"""
        if not student_skills:
            return []

        # Get all available jobs
        jobs = JobMarketData.objects.prefetch_related('required_skills', 'preferred_skills').all()

        recommendations = []

        for job in jobs:
            # Calculate skill match
            required_skills = list(job.required_skills.values_list('name', flat=True))
            preferred_skills = list(job.preferred_skills.values_list('name', flat=True))

            # Calculate match percentage
            required_match_count = sum(1 for skill in required_skills if skill in student_skills)
            preferred_match_count = sum(1 for skill in preferred_skills if skill in student_skills)

            total_required = len(required_skills) if required_skills else 1
            total_preferred = len(preferred_skills) if preferred_skills else 0

            required_match_pct = (required_match_count / total_required) * 100
            preferred_match_pct = (preferred_match_count / total_preferred * 100) if total_preferred > 0 else 0

            # Overall match (70% required, 30% preferred)
            overall_match = (required_match_pct * 0.7) + (preferred_match_pct * 0.3)

            # Only recommend if at least 40% match
            if overall_match < 40:
                continue

            # Determine confidence level
            if overall_match >= 80:
                confidence = 'high'
                score = 0.9
            elif overall_match >= 60:
                confidence = 'medium'
                score = 0.7
            else:
                confidence = 'low'
                score = 0.5

            # Identify skill gaps
            skill_gaps = [skill for skill in required_skills if skill not in student_skills]

            # Generate reasons
            reasons = []
            if required_match_pct >= 80:
                reasons.append(f"Strong match ({required_match_pct:.0f}%) with required skills")
            if preferred_match_pct >= 50:
                reasons.append(f"Good match ({preferred_match_pct:.0f}%) with preferred skills")
            if job.job_demand in ['high', 'critical']:
                reasons.append(f"High market demand ({job.job_demand})")
            if job.growth_projection > 10:
                reasons.append(f"Strong growth projection ({job.growth_projection}%)")

            # Create or update recommendation
            recommendation, created = JobRecommendation.objects.update_or_create(
                student=student,
                job_data=job,
                defaults={
                    'skill_match_percentage': Decimal(str(overall_match)),
                    'experience_match': job.experience_level in ['entry', 'junior'],
                    'recommendation_score': Decimal(str(score)),
                    'confidence_level': confidence,
                    'reasons': reasons,
                    'skill_gaps': skill_gaps,
                    'preparation_suggestions': self._generate_preparation_suggestions(skill_gaps)
                }
            )

            recommendations.append(recommendation)

        # Update skill profile with recommendations
        skill_profile.career_recommendations = [
            {
                'job_title': rec.job_data.job_title,
                'match_score': float(rec.skill_match_percentage),
                'confidence': rec.confidence_level
            }
            for rec in recommendations[:10]  # Top 10
        ]
        skill_profile.save()

        return recommendations

    def _generate_preparation_suggestions(self, skill_gaps):
        """Generate suggestions for addressing skill gaps"""
        if not skill_gaps:
            return ["You're ready to apply! Consider customizing your resume for this role."]

        suggestions = []

        if len(skill_gaps) <= 2:
            suggestions.append("Consider taking a short course or certification in the missing skills.")
        else:
            suggestions.append("Focus on building foundational skills through online courses or bootcamps.")

        suggestions.append("Highlight transferable skills in your application.")
        suggestions.append("Build projects that demonstrate the required skills.")

        # Find relevant training programs
        try:
            for skill_name in skill_gaps[:3]:  # Top 3 missing skills
                try:
                    skill = Skill.objects.get(name=skill_name)
                    programs = TrainingProgram.objects.filter(
                        target_skills=skill,
                        is_active=True
                    ).order_by('-rating')[:1]

                    for program in programs:
                        suggestions.append(f"Recommended: {program.title} ({program.provider})")
                except Skill.DoesNotExist:
                    continue
        except Exception as e:
            logger.warning(f"Could not fetch training programs: {str(e)}")

        return suggestions

    def get_career_insights(self, student_id):
        """Get comprehensive career insights for a student"""
        try:
            from students.models import StudentProfile
            student = StudentProfile.objects.select_related('user').get(id=student_id)

            # Get completed courses
            completed_enrollments = CourseEnrollment.objects.filter(
                student=student,
                status='completed'
            ).select_related('course', 'course__subject')

            # Get skill profile
            try:
                skill_profile = StudentSkillProfile.objects.get(student=student)
                student_skills = self._get_student_skills(skill_profile)
            except StudentSkillProfile.DoesNotExist:
                student_skills = {}

            # Get recommendations
            recommendations = JobRecommendation.objects.filter(
                student=student
            ).select_related('job_data').order_by('-recommendation_score')[:5]

            return {
                'completed_courses': completed_enrollments.count(),
                'total_skills': len(student_skills),
                'verified_skills': sum(1 for s in student_skills.values() if s['verified']),
                'job_recommendations': len(recommendations),
                'top_recommendations': [
                    {
                        'title': rec.job_data.job_title,
                        'industry': rec.job_data.industry,
                        'match_percentage': float(rec.skill_match_percentage),
                        'confidence': rec.confidence_level,
                        'salary_range': float(rec.job_data.average_salary) if rec.job_data.average_salary else None
                    }
                    for rec in recommendations
                ],
                'skill_gaps': skill_profile.skill_gaps if hasattr(skill_profile, 'skill_gaps') else [],
                'career_recommendations': skill_profile.career_recommendations if hasattr(skill_profile,
                                                                                          'career_recommendations') else []
            }

        except Exception as e:
            logger.error(f"Error getting career insights: {str(e)}")
            return {}
