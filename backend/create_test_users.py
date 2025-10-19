#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'education_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from students.models import StudentProfile
from teachers.models import TeacherProfile
from courses.models import Course, CourseEnrollment
from assessments.models import Assessment, Question, StudentAssessmentAttempt, StudentAnswer
from career.models import Resume, JobMatching, ResumeProfile, SkillAssessment
from datetime import datetime, timedelta
from django.utils import timezone
import random

User = get_user_model()


def create_test_users():
    """Create comprehensive test data for all user types and features"""

    print("🚀 Creating comprehensive test data...")

    # Clear ALL existing data properly
    print("🗑️ Clearing existing data...")
    StudentAssessmentAttempt.objects.all().delete()
    Assessment.objects.all().delete()
    CourseEnrollment.objects.all().delete()
    Course.objects.all().delete()
    JobMatching.objects.all().delete()
    Resume.objects.all().delete()
    ResumeProfile.objects.all().delete()
    SkillAssessment.objects.all().delete()
    StudentProfile.objects.all().delete()
    TeacherProfile.objects.all().delete()
    User.objects.all().delete()
    print("✅ Database cleared")

    # Create Admin
    admin_user = User.objects.create_user(
        username='admin',
        email='admin@eduai.com',
        password='admin123',
        first_name='System',
        last_name='Administrator',
        user_type='admin'
    )
    print("✅ Created Admin user: admin / admin123")

    # Create Teachers
    teachers_data = [
        {'username': 'dr.smith', 'first_name': 'John', 'last_name': 'Smith', 'email': 'john.smith@eduai.com',
         'specialization': 'Computer Science'},
        {'username': 'prof.johnson', 'first_name': 'Sarah', 'last_name': 'Johnson', 'email': 'sarah.johnson@eduai.com',
         'specialization': 'Mathematics'},
        {'username': 'dr.williams', 'first_name': 'Michael', 'last_name': 'Williams',
         'email': 'michael.williams@eduai.com', 'specialization': 'Physics'},
    ]

    teachers = []
    for teacher_data in teachers_data:
        teacher_user = User.objects.create_user(
            username=teacher_data['username'],
            email=teacher_data['email'],
            password='teacher123',
            first_name=teacher_data['first_name'],
            last_name=teacher_data['last_name'],
            user_type='teacher',
            approval_status='approved'
        )

        teacher_profile, created = TeacherProfile.objects.get_or_create(
            user=teacher_user,
            defaults={
                'employee_id': f'EMP{random.randint(1000, 9999)}',
                'department': teacher_data['specialization'],
                'specialization': [teacher_data['specialization']],
                'qualifications': ['PhD'],
                'experience_years': random.randint(5, 20),
                'is_approved': True,
                'approved_by': admin_user,
                'teaching_rating': round(random.uniform(4.0, 5.0), 2),
                'student_satisfaction': round(random.uniform(4.0, 5.0), 2),
                'course_completion_rate': round(random.uniform(85.0, 95.0), 2),
                'teaching_style': random.choice(['interactive', 'collaborative', 'adaptive']),
                'preferred_tools': ['Whiteboard', 'Projector', 'AI Tools']
            }
        )
        teachers.append(teacher_user)
        print(f"✅ Created Teacher: {teacher_data['username']} / teacher123")

    # Create Courses
    courses_data = [
        {
            'code': 'CS401',
            'name': 'Introduction to Artificial Intelligence',
            'description': 'Comprehensive introduction to AI concepts, algorithms, and applications.',
            'teacher': teachers[0],
            'credits': 3
        },
        {
            'code': 'MATH301',
            'name': 'Advanced Statistics and Data Analysis',
            'description': 'Statistical methods and data analysis techniques for modern applications.',
            'teacher': teachers[1],
            'credits': 4
        },
        {
            'code': 'PHYS201',
            'name': 'Quantum Physics Fundamentals',
            'description': 'Introduction to quantum mechanics and its applications.',
            'teacher': teachers[2],
            'credits': 3
        },
        {
            'code': 'CS501',
            'name': 'Machine Learning Applications',
            'description': 'Practical applications of machine learning in various domains.',
            'teacher': teachers[0],
            'credits': 4
        }
    ]

    courses = []
    for course_data in courses_data:
        course = Course.objects.create(
            title=course_data['name'],
            code=course_data['code'],
            description=course_data['description'],
            instructor=course_data['teacher'].teacher_profile,
            credits=course_data['credits'],
            duration_weeks=16,
            difficulty_level='intermediate',
            is_active=True,
            enrollment_limit=50,
            start_date=timezone.now().date() - timedelta(days=30),
            end_date=timezone.now().date() + timedelta(days=90),
            learning_objectives=['Understand core concepts', 'Apply practical skills', 'Develop critical thinking'],
            prerequisites=[],
            recommended_skills=['Basic computer literacy'],
            adaptive_content=True
        )
        courses.append(course)
        print(f"✅ Created Course: {course_data['code']} - {course_data['name']}")

    # Create Students
    students_data = [
        {'username': 'alice.cooper', 'first_name': 'Alice', 'last_name': 'Cooper',
         'email': 'alice.cooper@student.eduai.com'},
        {'username': 'bob.wilson', 'first_name': 'Bob', 'last_name': 'Wilson', 'email': 'bob.wilson@student.eduai.com'},
        {'username': 'carol.davis', 'first_name': 'Carol', 'last_name': 'Davis',
         'email': 'carol.davis@student.eduai.com'},
        {'username': 'david.brown', 'first_name': 'David', 'last_name': 'Brown',
         'email': 'david.brown@student.eduai.com'},
        {'username': 'emma.jones', 'first_name': 'Emma', 'last_name': 'Jones', 'email': 'emma.jones@student.eduai.com'},
    ]

    students = []
    for student_data in students_data:
        student_user = User.objects.create_user(
            username=student_data['username'],
            email=student_data['email'],
            password='student123',
            first_name=student_data['first_name'],
            last_name=student_data['last_name'],
            user_type='student',
            approval_status='approved'
        )

        student_profile, created = StudentProfile.objects.get_or_create(
            user=student_user,
            defaults={
                'student_id': f'STU{random.randint(10000, 99999)}',
                'grade_level': f'Year {random.randint(1, 4)}',
                'guardian_name': f'{student_data["first_name"]} Parent',
                'guardian_phone': f'+880{random.randint(1000000000, 9999999999)}',
                'guardian_email': f'parent.{student_data["username"]}@email.com',
                'emergency_contact': f'{student_data["first_name"]} Emergency',
                'emergency_phone': f'+880{random.randint(1000000000, 9999999999)}',
                'current_gpa': round(random.uniform(3.0, 4.0), 2),
                'total_credits': random.randint(60, 120),
                'academic_status': 'active',
                'learning_style': random.choice(['visual', 'auditory', 'kinesthetic', 'reading']),
                'preferred_difficulty': 'adaptive'
            }
        )
        students.append(student_user)
        print(f"✅ Created Student: {student_data['username']} / student123")

    # Enroll students in courses
    enrollments = [
        (students[0], courses[1]),  # Alice -> Advanced Statistics
        (students[0], courses[3]),  # Alice -> Machine Learning
        (students[0], courses[2]),  # Alice -> Quantum Physics
        (students[1], courses[3]),  # Bob -> Machine Learning
        (students[1], courses[0]),  # Bob -> AI Introduction
        (students[2], courses[1]),  # Carol -> Advanced Statistics
        (students[2], courses[3]),  # Carol -> Machine Learning
        (students[2], courses[2]),  # Carol -> Quantum Physics
        (students[3], courses[2]),  # David -> Quantum Physics
        (students[3], courses[0]),  # David -> AI Introduction
        (students[4], courses[0]),  # Emma -> AI Introduction
        (students[4], courses[3]),  # Emma -> Machine Learning
        (students[4], courses[1]),  # Emma -> Advanced Statistics
    ]

    for student, course in enrollments:
        CourseEnrollment.objects.create(
            student=student.student_profile,
            course=course,
            enrollment_date=timezone.now() - timedelta(days=random.randint(1, 30)),
            status='active'
        )
        print(f"📚 Enrolled {student.first_name} in {course.title}")

    # Create Assessments
    for course in courses:
        # Create Quiz
        assessment = Assessment.objects.create(
            course=course,
            title=f"{course.title} - Unit 1 Quiz",
            description=f"Assessment covering fundamental concepts of {course.title}",
            type='quiz',
            total_marks=100,
            duration_minutes=60,
            attempts_allowed=2,
            ai_generated=True,
            adaptive_difficulty=True,
            auto_grading=True,
            available_from=timezone.now() - timedelta(days=7),
            available_until=timezone.now() + timedelta(days=30),
            randomize_questions=True,
            show_results_immediately=True,
            allow_review=True
        )

        # Create Questions for the assessment
        questions_data = [
            {
                'text': f'What are the main principles of {course.title}?',
                'type': 'mcq',
                'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                'correct': {'answer': 0, 'explanation': 'Option A is correct because...'},
                'marks': 20
            },
            {
                'text': f'Explain the practical applications of {course.title} in modern technology.',
                'type': 'essay',
                'options': [],
                'correct': {'keywords': ['technology', 'application', 'modern'], 'min_words': 100},
                'marks': 30
            },
            {
                'text': f'True or False: {course.title} is essential for future career development.',
                'type': 'true_false',
                'options': ['True', 'False'],
                'correct': {'answer': 0, 'explanation': 'True, because it provides foundational knowledge.'},
                'marks': 25
            },
            {
                'text': f'Fill in the blank: The most important concept in {course.title} is ______.',
                'type': 'fill_blank',
                'options': [],
                'correct': {'answer': 'understanding', 'alternatives': ['knowledge', 'learning']},
                'marks': 25
            }
        ]

        for i, q_data in enumerate(questions_data):
            Question.objects.create(
                assessment=assessment,
                question_text=q_data['text'],
                question_type=q_data['type'],
                marks=q_data['marks'],
                order=i + 1,
                options=q_data['options'],
                correct_answer=q_data['correct'],
                difficulty_level=random.choice(['easy', 'medium', 'hard']),
                bloom_taxonomy_level=random.choice(['remember', 'understand', 'apply', 'analyze']),
                ai_generated=True
            )

        print(f"📝 Created Assessment: {assessment.title}")

    # Create Student Assessment Attempts
    for student in students:
        enrolled_courses = CourseEnrollment.objects.filter(student=student.student_profile)
        for enrollment in enrolled_courses:
            course_assessments = Assessment.objects.filter(course=enrollment.course)
            for assessment in course_assessments:
                attempt = StudentAssessmentAttempt.objects.create(
                    student=student.student_profile,
                    assessment=assessment,
                    attempt_number=1,
                    submitted_at=timezone.now() - timedelta(days=random.randint(1, 5)),
                    time_taken=timedelta(minutes=random.randint(30, 60)),
                    total_score=round(random.uniform(70, 95), 2),
                    percentage=round(random.uniform(70, 95), 2),
                    status='graded',
                    performance_analysis={
                        'strong_areas': ['Problem Solving', 'Theoretical Knowledge'],
                        'weak_areas': ['Practical Application'],
                        'time_management': 'Good',
                        'difficulty_level': 'Appropriate'
                    },
                    strengths=['Quick learner', 'Good analytical skills'],
                    weaknesses=['Needs more practice'],
                    recommendations=['Focus on practical exercises', 'Review theory concepts']
                )

                # Create answers for each question
                questions = assessment.questions.all()
                for question in questions:
                    is_correct = random.choice([True, False])
                    marks = question.marks if is_correct else question.marks * 0.5

                    StudentAnswer.objects.create(
                        attempt=attempt,
                        question=question,
                        answer={'student_answer': 'Sample answer',
                                'selected_option': 0 if question.question_type == 'mcq' else None},
                        is_correct=is_correct,
                        marks_awarded=marks,
                        ai_graded=True,
                        ai_feedback='Good understanding shown' if is_correct else 'Needs improvement',
                        confidence_score=random.uniform(0.7, 0.95)
                    )

    # Create Career Profiles and Job Matching Data
    for student in students:
        # Create Resume Profile
        resume_profile = ResumeProfile.objects.create(
            user=student,
            skills=['Python', 'Machine Learning', 'Data Analysis', 'Problem Solving'],
            experience_years=random.randint(0, 3),
            education_level='Bachelor',
            preferred_job_types=['Software Engineer', 'Data Scientist', 'AI Engineer'],
            location_preference='Dhaka, Bangladesh',
            salary_expectation=random.randint(30000, 80000),
            work_experience=[
                {
                    'company': 'Tech Corp',
                    'position': 'Intern',
                    'duration': '3 months',
                    'description': 'Worked on data analysis projects'
                }
            ],
            achievements=['Dean\'s List', 'Programming Contest Winner'],
            certifications=['Python Certification', 'Machine Learning Certificate']
        )

        # Create Skill Assessment
        SkillAssessment.objects.create(
            user=student,
            technical_skills={
                'Programming': random.randint(7, 10),
                'Data Analysis': random.randint(6, 9),
                'Machine Learning': random.randint(5, 8),
                'Communication': random.randint(7, 10)
            },
            soft_skills={
                'Leadership': random.randint(6, 9),
                'Teamwork': random.randint(7, 10),
                'Problem Solving': random.randint(8, 10),
                'Time Management': random.randint(7, 9)
            },
            overall_score=random.randint(75, 95),
            assessment_date=timezone.now() - timedelta(days=random.randint(1, 30)),
            strengths=['Quick learner', 'Analytical thinking'],
            areas_for_improvement=['Leadership skills', 'Public speaking'],
            career_recommendations=['Software Engineer', 'Data Scientist', 'AI Researcher']
        )

        # Create Resume
        Resume.objects.create(
            student=student.student_profile,
            title=f'{student.first_name}\'s Resume',
            content={
                'personal_info': {
                    'name': f'{student.first_name} {student.last_name}',
                    'email': student.email,
                    'phone': student.phone_number or f'+880{random.randint(1000000000, 9999999999)}',
                    'address': student.address or f'{random.randint(1, 100)} Main Street, City'
                },
                'education': {
                    'degree': 'Bachelor of Computer Science',
                    'university': 'EduAI University',
                    'gpa': str(student.student_profile.current_gpa),
                    'graduation_year': '2024'
                },
                'skills': resume_profile.skills,
                'experience': resume_profile.work_experience,
                'achievements': resume_profile.achievements
            },
            generated_at=timezone.now() - timedelta(days=random.randint(1, 10)),
            ai_score=random.randint(75, 95),
            suggestions=[
                'Add more technical projects',
                'Include leadership experiences',
                'Improve action verbs in descriptions'
            ],
            version=1.0
        )

    # Create Job Matching Data
    job_data = [
        {
            'title': 'Junior Software Engineer',
            'company': 'TechCorp Bangladesh',
            'requirements': ['Python', 'Problem Solving', 'Team Collaboration'],
            'salary_range': [40000, 60000],
            'location': 'Dhaka'
        },
        {
            'title': 'Data Analyst',
            'company': 'DataViz Solutions',
            'requirements': ['Data Analysis', 'Python', 'Machine Learning'],
            'salary_range': [35000, 55000],
            'location': 'Dhaka'
        },
        {
            'title': 'AI Research Assistant',
            'company': 'AI Research Lab',
            'requirements': ['Machine Learning', 'Python', 'Research Skills'],
            'salary_range': [45000, 70000],
            'location': 'Dhaka'
        }
    ]

    for job in job_data:
        for student in students[:3]:  # Match jobs with first 3 students
            JobMatching.objects.create(
                student=student.student_profile,
                job_title=job['title'],
                company=job['company'],
                match_score=random.randint(75, 95),
                requirements_met=job['requirements'][:2],  # Met requirements
                missing_skills=job['requirements'][2:] or ['Advanced Communication'],  # Missing skills
                salary_range={'min': job['salary_range'][0], 'max': job['salary_range'][1]},
                location=job['location'],
                job_description=f"Exciting opportunity to work as {job['title']} at {job['company']}",
                application_deadline=timezone.now() + timedelta(days=30),
                matched_at=timezone.now() - timedelta(days=random.randint(1, 5))
            )

    print("\n🎉 COMPLETE TEST DATA CREATED SUCCESSFULLY!")
    print("\n📋 LOGIN CREDENTIALS:")
    print("=" * 50)
    print("👨‍💼 ADMIN:")
    print("   Username: admin")
    print("   Password: admin123")
    print("\n👨‍🏫 TEACHERS:")
    print("   Username: dr.smith     | Password: teacher123")
    print("   Username: prof.johnson | Password: teacher123")
    print("   Username: dr.williams  | Password: teacher123")
    print("\n🎓 STUDENTS:")
    print("   Username: alice.cooper | Password: student123")
    print("   Username: bob.wilson   | Password: student123")
    print("   Username: carol.davis  | Password: student123")
    print("   Username: david.brown  | Password: student123")
    print("   Username: emma.jones   | Password: student123")
    print("=" * 50)
    print("\n✅ All users are PRE-APPROVED and ready to login!")
    print("✅ Complete course enrollments created")
    print("✅ Real assessment data with AI grading")
    print("✅ Career profiles and job matching")
    print("✅ Academic records and performance analytics")

if __name__ == '__main__':
    create_test_users()
