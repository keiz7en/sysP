from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import (
    JobMarketData, JobRecommendation, StudentSkillProfile,
    Resume, TrainingProgram
)

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def career_recommendations(request):
    """Get career recommendations for user"""
    try:
        if request.user.user_type != 'student':
            return Response({
                'error': 'This endpoint is only accessible to students'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from students.models import StudentProfile
            student_profile = StudentProfile.objects.get(user=request.user)

            recommendations = JobRecommendation.objects.filter(
                student=student_profile
            ).select_related('job_data').order_by('-recommendation_score')[:10]

            recommendations_data = []
            for rec in recommendations:
                job = rec.job_data
                recommendations_data.append({
                    'job_title': job.job_title,
                    'industry': job.industry,
                    'location': job.location,
                    'experience_level': job.experience_level,
                    'average_salary': float(job.average_salary) if job.average_salary else None,
                    'job_demand': job.job_demand,
                    'match_percentage': float(rec.skill_match_percentage),
                    'recommendation_score': float(rec.recommendation_score),
                    'confidence_level': rec.confidence_level,
                    'reasons': rec.reasons,
                    'skill_gaps': rec.skill_gaps
                })

            return Response({
                'recommendations': recommendations_data,
                'count': len(recommendations_data)
            }, status=status.HTTP_200_OK)

        except StudentProfile.DoesNotExist:
            return Response({
                'error': 'Student profile not found'
            }, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch recommendations: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def job_market_data(request):
    """Get current job market data"""
    try:
        # Get recent job market data
        market_data = JobMarketData.objects.order_by('-last_updated')[:20]

        market_info = []
        for data in market_data:
            market_info.append({
                'job_title': data.job_title,
                'industry': data.industry,
                'location': data.location,
                'experience_level': data.experience_level,
                'job_demand': data.job_demand,
                'average_salary': float(data.average_salary) if data.average_salary else None,
                'growth_projection': float(data.growth_projection),
                'automation_risk': data.automation_risk,
                'last_updated': data.last_updated
            })

        return Response({
            'market_data': market_info,
            'count': len(market_info)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch market data: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SkillAssessmentView(APIView):
    """Skill assessment for students"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get student's skill profile"""
        if request.user.user_type != 'student':
            return Response({
                'error': 'This endpoint is only accessible to students'
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            from students.models import StudentProfile
            student_profile = StudentProfile.objects.get(user=request.user)

            try:
                skill_profile = StudentSkillProfile.objects.get(student=student_profile)

                profile_data = {
                    'skill_gaps': skill_profile.skill_gaps,
                    'recommended_skills': skill_profile.recommended_skills,
                    'career_recommendations': skill_profile.career_recommendations,
                    'last_assessed': skill_profile.last_assessed
                }

                return Response(profile_data, status=status.HTTP_200_OK)

            except StudentSkillProfile.DoesNotExist:
                return Response({
                    'message': 'No skill assessment completed yet',
                    'skill_gaps': [],
                    'recommended_skills': [],
                    'career_recommendations': []
                }, status=status.HTTP_200_OK)

        except StudentProfile.DoesNotExist:
            return Response({
                'error': 'Student profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'Failed to fetch skill assessment: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create new skill assessment"""
        # Placeholder for skill assessment creation
        return Response({
            'message': 'Skill assessment creation not implemented yet'
        }, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def training_programs(request):
    """Get recommended training programs"""
    try:
        programs = TrainingProgram.objects.filter(is_active=True).order_by('-rating')[:20]

        programs_data = []
        for program in programs:
            programs_data.append({
                'id': program.id,
                'title': program.title,
                'description': program.description,
                'provider': program.provider,
                'duration_hours': program.duration_hours,
                'difficulty_level': program.difficulty_level,
                'cost': float(program.cost) if program.cost else None,
                'is_free': program.is_free,
                'is_online': program.is_online,
                'certification_offered': program.certification_offered,
                'rating': float(program.rating),
                'completion_rate': float(program.completion_rate),
                'url': program.url
            })

        return Response({
            'programs': programs_data,
            'count': len(programs_data)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to fetch training programs: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
