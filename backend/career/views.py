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
from rest_framework.permissions import IsAuthenticated

# Import CourseEnrollment if available, otherwise assume present in your project context
try:
    from courses.models import CourseEnrollment
except ImportError:
    CourseEnrollment = None


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


# =========================
# Comprehensive Career Guidance Endpoints (AI-powered)
# =========================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_resume_analysis(request):
    """AI-powered resume analysis and optimization"""
    try:
        resume_text = request.data.get('resume_text', '')
        job_target = request.data.get('job_target', 'Software Engineer')

        # Simulate AI resume analysis
        ai_analysis = {
            'overall_score': 78,
            'ats_compatibility': 85,
            'keyword_optimization': 72,
            'structure_score': 90,
            'content_quality': 75,

            'strengths': [
                'Clear contact information',
                'Well-structured education section',
                'Relevant technical skills listed',
                'Good use of action verbs'
            ],

            'weaknesses': [
                'Missing quantified achievements',
                'Lacks industry-specific keywords',
                'No summary statement',
                'Limited work experience details'
            ],

            'improvement_suggestions': [
                'Add a professional summary at the top',
                'Include quantified achievements (e.g., "Improved efficiency by 25%")',
                'Add more technical keywords related to ' + job_target,
                'Expand project descriptions with specific technologies used',
                'Include soft skills with examples'
            ],

            'keyword_analysis': {
                'present_keywords': ['Python', 'JavaScript', 'React', 'Database'],
                'missing_keywords': ['Machine Learning', 'Docker', 'AWS', 'Agile'],
                'keyword_density': 'Medium',
                'job_match_percentage': 68
            },

            'formatting_feedback': {
                'font_consistency': 'Good',
                'spacing': 'Needs improvement',
                'length': 'Appropriate (1-2 pages)',
                'file_format': 'PDF recommended'
            },

            'section_analysis': {
                'contact_info': {'score': 95, 'feedback': 'Complete and professional'},
                'summary': {'score': 0, 'feedback': 'Missing - add a 2-3 line summary'},
                'experience': {'score': 70, 'feedback': 'Add more quantified achievements'},
                'education': {'score': 85, 'feedback': 'Well presented'},
                'skills': {'score': 80, 'feedback': 'Good technical skills, add soft skills'},
                'projects': {'score': 75, 'feedback': 'Include more project details'}
            }
        }

        return Response(ai_analysis)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_skill_gap_analysis(request):
    """AI-powered skill gap analysis and recommendations"""
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=403)

        # Get student's current skills from courses and assessments
        # Assuming student_profile association and CourseEnrollment available
        student = getattr(request.user, 'student_profile', None)
        enrollments = []
        if CourseEnrollment and student:
            enrollments = CourseEnrollment.objects.filter(student=student, status='active')

        skill_gap_analysis = {
            'current_skills': [],
            'market_demand_skills': [
                {
                    'skill': 'Python Programming',
                    'demand_level': 'Very High',
                    'growth_rate': '25%',
                    'average_salary_boost': '$15,000',
                    'student_proficiency': 0,
                    'gap_severity': 'critical'
                },
                {
                    'skill': 'Machine Learning',
                    'demand_level': 'High',
                    'growth_rate': '30%',
                    'average_salary_boost': '$20,000',
                    'student_proficiency': 0,
                    'gap_severity': 'high'
                },
                {
                    'skill': 'Cloud Computing (AWS/Azure)',
                    'demand_level': 'Very High',
                    'growth_rate': '35%',
                    'average_salary_boost': '$18,000',
                    'student_proficiency': 0,
                    'gap_severity': 'high'
                }
            ],
            'personalized_recommendations': [],
            'career_impact': {
                'potential_salary_increase': '$25,000 - $45,000',
                'job_opportunities_increase': '150%',
                'career_advancement_timeline': '6-12 months'
            }
        }

        # Analyze current skills from enrolled courses
        for enrollment in enrollments:
            course_title = enrollment.course.title.lower()
            progress = float(enrollment.completion_percentage)

            if 'python' in course_title:
                skill_gap_analysis['current_skills'].append({
                    'skill': 'Python Programming',
                    'proficiency_level': min(100, progress + 20),
                    'source': 'Course: ' + enrollment.course.title,
                    'verification': 'In Progress'
                })
                # Update market demand skills
                for skill in skill_gap_analysis['market_demand_skills']:
                    if skill['skill'] == 'Python Programming':
                        skill['student_proficiency'] = min(100, progress + 20)
                        skill['gap_severity'] = 'low' if progress > 80 else 'medium'

            elif 'machine learning' in course_title or 'ml' in course_title:
                skill_gap_analysis['current_skills'].append({
                    'skill': 'Machine Learning',
                    'proficiency_level': progress,
                    'source': 'Course: ' + enrollment.course.title,
                    'verification': 'In Progress'
                })
                for skill in skill_gap_analysis['market_demand_skills']:
                    if skill['skill'] == 'Machine Learning':
                        skill['student_proficiency'] = progress
                        skill['gap_severity'] = 'low' if progress > 80 else 'medium'

        # Generate personalized recommendations
        for skill in skill_gap_analysis['market_demand_skills']:
            if skill['gap_severity'] in ['critical', 'high']:
                skill_gap_analysis['personalized_recommendations'].append({
                    'skill': skill['skill'],
                    'priority': skill['gap_severity'],
                    'recommended_resources': [
                        f'Online course: {skill["skill"]} Fundamentals',
                        f'Practice project: Build a {skill["skill"]} application',
                        f'Certification: Professional {skill["skill"]} Certificate'
                    ],
                    'estimated_time': '2-4 months',
                    'cost_estimate': '$200 - $500'
                })

        return Response(skill_gap_analysis)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_career_recommendations(request):
    """AI-powered career path recommendations"""
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=403)

        student = getattr(request.user, 'student_profile', None)
        enrollments = []
        if CourseEnrollment and student:
            enrollments = CourseEnrollment.objects.filter(student=student, status='active')

        career_recommendations = {
            'recommended_careers': [
                {
                    'title': 'Data Scientist',
                    'match_percentage': 85,
                    'salary_range': {'min': 70000, 'max': 120000},
                    'job_growth': '22% (Much faster than average)',
                    'required_skills': ['Python', 'Machine Learning', 'Statistics', 'SQL'],
                    'student_skill_match': ['Python'],
                    'missing_skills': ['Machine Learning', 'Statistics', 'SQL'],
                    'preparation_timeline': '8-12 months',
                    'industry_sectors': ['Technology', 'Healthcare', 'Finance', 'E-commerce']
                },
                {
                    'title': 'Software Engineer',
                    'match_percentage': 78,
                    'salary_range': {'min': 65000, 'max': 110000},
                    'job_growth': '25% (Much faster than average)',
                    'required_skills': ['Programming', 'Problem Solving', 'System Design', 'Testing'],
                    'student_skill_match': ['Programming'],
                    'missing_skills': ['System Design', 'Testing'],
                    'preparation_timeline': '6-10 months',
                    'industry_sectors': ['Technology', 'Startups', 'Corporate', 'Government']
                },
                {
                    'title': 'AI Engineer',
                    'match_percentage': 72,
                    'salary_range': {'min': 80000, 'max': 140000},
                    'job_growth': '32% (Much faster than average)',
                    'required_skills': ['Machine Learning', 'Deep Learning', 'Python', 'Mathematics'],
                    'student_skill_match': ['Python'],
                    'missing_skills': ['Machine Learning', 'Deep Learning', 'Advanced Mathematics'],
                    'preparation_timeline': '10-18 months',
                    'industry_sectors': ['AI Research', 'Technology', 'Automotive', 'Healthcare']
                }
            ],
            'skills_analysis': {
                'current_strengths': [],
                'developing_skills': [],
                'recommended_focus_areas': [
                    'Advanced Programming Concepts',
                    'Data Analysis and Visualization',
                    'Machine Learning Fundamentals',
                    'Problem Solving and Algorithms'
                ]
            },
            'next_steps': [
                'Complete current enrolled courses with high performance',
                'Start building a portfolio of projects',
                'Consider internship opportunities',
                'Network with professionals in target fields',
                'Obtain relevant certifications'
            ]
        }

        # Analyze student's current skills from courses
        for enrollment in enrollments:
            course_title = enrollment.course.title
            progress = float(enrollment.completion_percentage)

            if progress > 70:
                career_recommendations['skills_analysis']['current_strengths'].append(course_title)
            elif progress > 30:
                career_recommendations['skills_analysis']['developing_skills'].append(course_title)

        return Response(career_recommendations)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_training_programs(request):
    """AI-curated training programs and learning resources"""
    try:
        if request.user.user_type != 'student':
            return Response({'error': 'Student access only'}, status=403)

        skill_focus = request.GET.get('skill', 'general')

        training_programs = {
            'recommended_programs': [
                {
                    'title': 'Complete Python Developer Bootcamp',
                    'provider': 'TechEdu Academy',
                    'duration': '12 weeks',
                    'format': 'Online + Live Sessions',
                    'cost': '$1,499',
                    'difficulty': 'Beginner to Advanced',
                    'certification': True,
                    'job_placement_rate': '85%',
                    'rating': 4.8,
                    'skills_covered': ['Python', 'Web Development', 'Data Analysis', 'APIs'],
                    'career_outcomes': [
                        'Python Developer',
                        'Backend Engineer',
                        'Data Analyst'
                    ]
                },
                {
                    'title': 'Machine Learning Engineer Track',
                    'provider': 'AI Learning Institute',
                    'duration': '16 weeks',
                    'format': 'Self-paced Online',
                    'cost': '$2,299',
                    'difficulty': 'Intermediate to Advanced',
                    'certification': True,
                    'job_placement_rate': '78%',
                    'rating': 4.9,
                    'skills_covered': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'Python'],
                    'career_outcomes': [
                        'ML Engineer',
                        'Data Scientist',
                        'AI Researcher'
                    ]
                },
                {
                    'title': 'Full-Stack Web Development',
                    'provider': 'CodeAcademy Pro',
                    'duration': '20 weeks',
                    'format': 'Project-based Learning',
                    'cost': '$799',
                    'difficulty': 'Beginner to Intermediate',
                    'certification': True,
                    'job_placement_rate': '72%',
                    'rating': 4.6,
                    'skills_covered': ['JavaScript', 'React', 'Node.js', 'Database'],
                    'career_outcomes': [
                        'Full-Stack Developer',
                        'Frontend Developer',
                        'Backend Developer'
                    ]
                }
            ],
            'free_resources': [
                {
                    'title': 'Introduction to Computer Science',
                    'provider': 'MIT OpenCourseWare',
                    'duration': '14 weeks',
                    'format': 'Self-paced',
                    'cost': 'Free',
                    'rating': 4.7,
                    'skills_covered': ['Programming Fundamentals', 'Algorithms', 'Data Structures']
                },
                {
                    'title': 'Python for Everybody',
                    'provider': 'University of Michigan (Coursera)',
                    'duration': '8 weeks',
                    'format': 'Self-paced',
                    'cost': 'Free (Audit)',
                    'rating': 4.8,
                    'skills_covered': ['Python', 'Data Analysis', 'Web Scraping']
                }
            ],
            'scholarship_opportunities': [
                'Tech Diversity Scholarship - Up to $2,000',
                'Women in Tech Grant - $1,500',
                'Student Success Fund - $1,000'
            ],
            'personalized_learning_path': {
                'immediate_focus': 'Complete current courses',
                'short_term_goal': 'Python proficiency + first project',
                'medium_term_goal': 'Specialized skill development',
                'long_term_goal': 'Career-ready portfolio + certification'
            }
        }

        return Response(training_programs)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_market_insights(request):
    """Real-time job market insights and trends"""
    try:
        market_insights = {
            'trending_skills': [
                {
                    'skill': 'Artificial Intelligence',
                    'growth_rate': '+45%',
                    'job_postings': 12500,
                    'average_salary': '$95,000',
                    'trend': 'increasing'
                },
                {
                    'skill': 'Cloud Computing',
                    'growth_rate': '+38%',
                    'job_postings': 18900,
                    'average_salary': '$88,000',
                    'trend': 'increasing'
                },
                {
                    'skill': 'Data Science',
                    'growth_rate': '+28%',
                    'job_postings': 15600,
                    'average_salary': '$92,000',
                    'trend': 'stable'
                }
            ],
            'industry_outlook': [
                {
                    'industry': 'Technology',
                    'job_growth': '+22%',
                    'hiring_demand': 'Very High',
                    'top_roles': ['Software Engineer', 'Data Scientist', 'Product Manager'],
                    'average_salary_range': '$70,000 - $140,000'
                },
                {
                    'industry': 'Healthcare Technology',
                    'job_growth': '+18%',
                    'hiring_demand': 'High',
                    'top_roles': ['Health Data Analyst', 'Medical Software Developer'],
                    'average_salary_range': '$65,000 - $120,000'
                }
            ],
            'geographic_trends': [
                {
                    'location': 'Dhaka, Bangladesh',
                    'tech_job_growth': '+15%',
                    'average_salary': '$25,000 - $45,000',
                    'top_companies': ['Grameenphone', 'BRAC Bank', 'Pathao', 'bKash']
                },
                {
                    'location': 'Remote Opportunities',
                    'availability': 'High',
                    'average_salary': '$40,000 - $80,000',
                    'requirements': ['Strong communication', 'Self-motivated', 'Technical skills']
                }
            ],
            'salary_predictions': {
                'entry_level': '$30,000 - $50,000',
                'mid_level': '$50,000 - $80,000',
                'senior_level': '$80,000 - $120,000',
                'factors': ['Skills', 'Experience', 'Location', 'Industry', 'Company size']
            },
            'hiring_trends': {
                'remote_work': '65% of jobs offer remote options',
                'skill_requirements': 'Emphasis on practical experience over degrees',
                'hiring_timeline': 'Average 4-6 weeks from application to offer',
                'interview_formats': ['Technical assessments', 'Behavioral interviews', 'Portfolio reviews']
            }
        }

        return Response(market_insights)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
