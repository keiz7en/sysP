"""
Gemini AI Service - Using Google AI Studio API
Simple and powerful AI integration
"""
import os
import json
from typing import List, Dict, Any
import google.generativeai as genai
from django.conf import settings

# Configure Gemini API - Use Django settings first, then fallback to environment
GEMINI_API_KEY = getattr(settings, 'GEMINI_API_KEY',
                         os.getenv('GEMINI_API_KEY', 'AIzaSyCKBlajRvVA_NTteVg6Cls49CxYDmfKknc'))

try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    AI_AVAILABLE = True
    print(f"✅ Gemini AI initialized successfully with API key: {GEMINI_API_KEY[:20]}...")
except Exception as e:
    model = None
    AI_AVAILABLE = False
    print(f"⚠️ Gemini AI not available: {e}")


class GeminiAIService:
    """
    Simple Gemini AI Service for education platform
    """

    def __init__(self):
        self.model = model
        self.available = AI_AVAILABLE

    def generate_personalized_content(self, topic: str, difficulty: str, learning_style: str) -> Dict[str, Any]:
        """Generate personalized learning content"""
        if not self.available:
            return self._mock_content(topic, difficulty)

        try:
            prompt = f"""
            You are an expert educational AI. Create personalized learning content for:
            
            Topic: {topic}
            Difficulty Level: {difficulty}
            Learning Style: {learning_style}
            
            Provide a JSON response with:
            1. "explanation": A clear, {learning_style}-friendly explanation (2-3 paragraphs)
            2. "practice_questions": Array of 3 practice questions
            3. "examples": Array of 2 real-world examples
            4. "next_topics": Array of 3 recommended next topics
            
            Format as valid JSON only, no markdown.
            """

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean up markdown if present
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())
            result['ai_powered'] = True
            result['model'] = 'Gemini Pro'
            return result

        except Exception as e:
            print(f"Gemini error: {e}")
            return self._mock_content(topic, difficulty)

    def generate_quiz(self, topic: str, difficulty: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        """Generate AI-powered quiz questions"""
        if not self.available:
            return self._mock_quiz(topic, num_questions)

        try:
            prompt = f"""
            Create {num_questions} quiz questions about {topic} at {difficulty} level.
            
            Provide a JSON array where each question has:
            - "question_text": The question
            - "options": Array of 4 options (A, B, C, D)
            - "correct_answer": The correct option letter
            - "explanation": Why this answer is correct
            
            Make questions educational and engaging. Format as valid JSON only.
            """

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean markdown
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            questions = json.loads(result_text.strip())

            # Add metadata
            for i, q in enumerate(questions):
                q['question_id'] = i + 1
                q['points'] = 10
                q['ai_generated'] = True

            return questions

        except Exception as e:
            print(f"Gemini quiz error: {e}")
            return self._mock_quiz(topic, num_questions)

    def grade_essay(self, essay_text: str, rubric: Dict[str, int]) -> Dict[str, Any]:
        """Grade essay using AI"""
        if not self.available:
            return self._mock_grading(essay_text)

        try:
            rubric_str = "\n".join([f"- {k}: {v} points" for k, v in rubric.items()])

            prompt = f"""
            Grade this student essay using the rubric below.
            
            Rubric:
            {rubric_str}
            Total: {sum(rubric.values())} points
            
            Essay:
            {essay_text}
            
            Provide JSON with:
            - "overall_score": Total score (0-{sum(rubric.values())})
            - "criteria_scores": Object with score for each rubric item
            - "strengths": Array of 2-3 strengths
            - "improvements": Array of 2-3 areas to improve
            - "feedback": Detailed constructive feedback (1 paragraph)
            
            Be fair, constructive, and encouraging. Format as valid JSON only.
            """

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean markdown
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())
            result['ai_graded'] = True
            result['model'] = 'Gemini Pro'
            return result

        except Exception as e:
            print(f"Gemini grading error: {e}")
            return self._mock_grading(essay_text)

    def analyze_student_performance(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze student performance and predict risks"""
        if not self.available:
            return self._mock_analysis(student_data)

        try:
            prompt = f"""
            Analyze this student's academic performance and provide insights:
            
            Data:
            - Average Grade: {student_data.get('avg_grade', 0)}%
            - Attendance: {student_data.get('attendance', 0)}%
            - Engagement: {student_data.get('engagement', 0)}%
            - Assignment Completion: {student_data.get('completion', 0)}%
            
            Provide JSON with:
            - "risk_level": "low", "medium", or "high"
            - "risk_score": 0-100 (higher = more risk)
            - "strengths": Array of 2-3 strengths
            - "concerns": Array of 2-3 concerns
            - "recommendations": Array of 3-4 actionable recommendations
            - "trend": "improving", "stable", or "declining"
            
            Be supportive and constructive. Format as valid JSON only.
            """

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean markdown
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())
            result['ai_analyzed'] = True
            result['model'] = 'Gemini Pro'
            return result

        except Exception as e:
            print(f"Gemini analysis error: {e}")
            return self._mock_analysis(student_data)

    def career_guidance(self, student_skills: List[str], interests: str) -> Dict[str, Any]:
        """Provide AI-powered career guidance"""
        if not self.available:
            return self._mock_career(student_skills)

        try:
            skills_str = ", ".join(student_skills)

            prompt = f"""
            Provide career guidance for a student with:
            
            Skills: {skills_str}
            Interests: {interests}
            
            Provide JSON with:
            - "recommended_careers": Array of 3-4 career suggestions, each with:
              - "title": Job title
              - "match_score": 0-100
              - "why": Brief explanation
              - "salary_range": Estimated range
            - "skill_gaps": Array of 2-3 skills to develop
            - "learning_path": Array of 3-4 suggested courses/certifications
            - "market_outlook": Brief market analysis (1 paragraph)
            
            Be realistic and encouraging. Format as valid JSON only.
            """

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean markdown
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())
            result['ai_powered'] = True
            result['model'] = 'Gemini Pro'
            return result

        except Exception as e:
            print(f"Gemini career error: {e}")
            return self._mock_career(student_skills)

    def chat_response(self, message: str, context: str = "") -> str:
        """Generate chatbot response"""
        if not self.available:
            return "I'm here to help! I'm an AI learning assistant. You can ask me about:\n• Programming and coding (like Python 'Hello World')\n• Study strategies and plans\n• Career guidance and job prospects\n• Course recommendations\n• Homework help and concept explanations\n\nWhat would you like to know?"

        try:
            system_context = """
            You are an intelligent AI learning assistant for students. Your role is to:
            
            1. **Academic Support**: Help with homework, explain concepts clearly, provide examples
            2. **Programming Help**: Explain code, debug issues, teach programming concepts step-by-step
            3. **Study Planning**: Create personalized study plans, suggest learning strategies
            4. **Career Guidance**: Advise on career paths, skill development, job prospects
            5. **Course Selection**: Recommend courses based on goals and interests
            6. **Motivation**: Encourage and motivate students in their learning journey
            
            Guidelines:
            - Be friendly, helpful, and encouraging
            - Explain concepts clearly with examples when needed
            - For coding questions, provide code examples with explanations
            - For study plans, be specific with actionable steps
            - For career questions, provide realistic, helpful advice
            - Keep responses concise but informative (2-4 paragraphs)
            - Use bullet points for lists and steps
            - Always be supportive and positive
            
            Remember: You're helping students learn and grow!
            """

            full_prompt = f"{system_context}\n\nContext: {context}\n\nStudent Question: {message}\n\nYour Response:"

            response = self.model.generate_content(full_prompt)
            return response.text.strip()

        except Exception as e:
            print(f"Gemini chat error: {e}")
            return "I'm here to help with your education journey! I can assist with:\n• Programming and coding questions\n• Study strategies and planning\n• Career advice and guidance\n• Course recommendations\n• Homework and concept explanations\n\nWhat would you like to know?"

    def generate_learning_paths(self, student_profile, enrollments) -> list:
        """Generate AI-powered personalized learning paths for student courses"""
        if not self.available:
            return self._mock_learning_paths(student_profile, enrollments)

        try:
            # Prepare course data for AI
            courses_info = []
            for enrollment in enrollments:
                courses_info.append({
                    'title': enrollment.course.title,
                    'progress': float(enrollment.progress_percentage),
                    'credits': enrollment.course.credits
                })

            courses_str = "\n".join([f"- {c['title']}: {c['progress']}% complete" for c in courses_info])

            prompt = f"""
            Create personalized learning paths for a student with the following profile:
            
            Learning Style: {student_profile.learning_style or 'adaptive'}
            Preferred Difficulty: {student_profile.preferred_difficulty or 'intermediate'}
            Current GPA: {float(student_profile.current_gpa)}
            
            Enrolled Courses:
            {courses_str}
            
            For EACH course, provide a JSON object with:
            - "ai_recommendations": Array of 3 specific, actionable study tips based on their progress
            - "strengths": Array of 2 positive aspects about their learning approach
            - "areas_for_improvement": Array of 2 specific areas to work on
            
            Make recommendations:
            - Personalized to their learning style ({student_profile.learning_style or 'adaptive'})
            - Specific to their current progress level
            - Encouraging but realistic
            - Actionable and clear
            
            Return a JSON array with one object per course in the same order as listed above.
            Format as valid JSON only, no markdown.
            """

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean markdown
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            ai_recommendations_list = json.loads(result_text.strip())

            # Build learning paths with AI recommendations
            learning_paths = []
            for idx, enrollment in enumerate(enrollments):
                course = enrollment.course
                progress = float(enrollment.progress_percentage)

                # Get AI recommendations for this course
                ai_data = ai_recommendations_list[idx] if idx < len(ai_recommendations_list) else {}

                # Determine difficulty level
                difficulty_map = {
                    'beginner': 'Beginner',
                    'intermediate': 'Intermediate',
                    'advanced': 'Advanced',
                    'expert': 'Expert'
                }
                difficulty = difficulty_map.get(
                    getattr(course, 'difficulty_level', 'intermediate').lower(),
                    'Intermediate'
                )

                # Generate next milestone based on progress
                if progress < 25:
                    next_milestone = f"Complete foundational modules of {course.title}"
                elif progress < 50:
                    next_milestone = f"Finish mid-course projects in {course.title}"
                elif progress < 75:
                    next_milestone = f"Prepare for final assessments in {course.title}"
                else:
                    next_milestone = f"Complete {course.title} successfully"

                learning_path = {
                    'id': idx + 1,
                    'course_title': course.title,
                    'current_module': f"Module {int(progress / 25) + 1}: {course.title} Content",
                    'progress_percentage': progress,
                    'difficulty_level': difficulty,
                    'learning_style': student_profile.learning_style or 'adaptive',
                    'estimated_completion': course.end_date.strftime('%B %Y') if hasattr(course,
                                                                                         'end_date') and course.end_date else '4 months',
                    'next_milestone': next_milestone,
                    'ai_recommendations': ai_data.get('ai_recommendations', [
                        'Focus on consistent study habits',
                        'Review materials regularly',
                        'Seek help when needed'
                    ]),
                    'strengths': ai_data.get('strengths', [
                        'Good progress pace',
                        'Consistent engagement'
                    ]),
                    'areas_for_improvement': ai_data.get('areas_for_improvement', [
                        'Time management',
                        'Advanced concepts'
                    ])
                }
                learning_paths.append(learning_path)

            return learning_paths

        except Exception as e:
            print(f"Gemini learning paths error: {e}")
            return self._mock_learning_paths(student_profile, enrollments)

    def _mock_learning_paths(self, student_profile, enrollments) -> list:
        """Fallback learning paths when AI is not available"""
        learning_paths = []
        for idx, enrollment in enumerate(enrollments):
            course = enrollment.course
            progress = float(enrollment.progress_percentage)

            # Determine difficulty level
            difficulty_map = {
                'beginner': 'Beginner',
                'intermediate': 'Intermediate',
                'advanced': 'Advanced',
                'expert': 'Expert'
            }
            difficulty = difficulty_map.get(
                getattr(course, 'difficulty_level', 'intermediate').lower(),
                'Intermediate'
            )

            # Generate next milestone based on progress
            if progress < 25:
                next_milestone = f"Complete foundational modules of {course.title}"
            elif progress < 50:
                next_milestone = f"Finish mid-course projects in {course.title}"
            elif progress < 75:
                next_milestone = f"Prepare for final assessments in {course.title}"
            else:
                next_milestone = f"Complete {course.title} successfully"

            learning_path = {
                'id': idx + 1,
                'course_title': course.title,
                'current_module': f"Module {int(progress / 25) + 1}: {course.title} Content",
                'progress_percentage': progress,
                'difficulty_level': difficulty,
                'learning_style': student_profile.learning_style or 'adaptive',
                'estimated_completion': course.end_date.strftime('%B %Y') if hasattr(course,
                                                                                     'end_date') and course.end_date else '4 months',
                'next_milestone': next_milestone,
                'ai_recommendations': [
                    'Focus on understanding fundamental concepts',
                    'Practice regularly with exercises',
                    'Review previous materials when needed'
                ],
                'strengths': [
                    'Consistent study habits',
                    'Good progress pace' if progress > 50 else 'Building foundation'
                ],
                'areas_for_improvement': [
                    'Time management' if progress < 30 else 'Advanced concepts',
                    'Practical application' if progress < 60 else 'Exam preparation'
                ]
            }
            learning_paths.append(learning_path)

        return learning_paths

    def generate_ai_assessment(self, topic: str, difficulty: str, num_questions: int, assessment_type: str) -> Dict[
        str, Any]:
        """Generate AI-powered assessment with questions"""
        if not self.available:
            return self._mock_assessment(topic, num_questions, assessment_type)

        try:
            prompt = f"""
            Create a {assessment_type} assessment about {topic} at {difficulty} difficulty level.
            
            Generate {num_questions} questions with the following structure:
            - "question": The question text
            - "options": Array of 4 options (for multiple choice) or empty array for essay questions
            - "correct_answer": The correct option or key points (for essay)
            - "explanation": Detailed explanation of the correct answer
            - "points": Points for this question (10 for MCQ, 20 for essay)
            - "type": "multiple_choice" or "essay" or "short_answer"
            
            Make questions:
            - Relevant to {topic}
            - At {difficulty} difficulty level
            - Educational and clear
            - Progressively challenging
            
            Return JSON object with:
            - "assessment_title": Title for the assessment
            - "total_duration": Recommended time in minutes
            - "questions": Array of question objects
            - "passing_score": Minimum percentage to pass
            
            Format as valid JSON only, no markdown.
            """

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean markdown
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())
            result['ai_generated'] = True
            result['model'] = 'Gemini 2.5 Flash'
            return result

        except Exception as e:
            print(f"Gemini assessment generation error: {e}")
            return self._mock_assessment(topic, num_questions, assessment_type)

    def analyze_learning_insights(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate AI-powered learning insights and recommendations"""
        if not self.available:
            return self._mock_learning_insights(student_data)

        try:
            courses_str = "\n".join([f"- {c['title']}: {c['score']}%" for c in student_data.get('courses', [])])

            prompt = f"""
            Analyze this student's learning data and provide comprehensive insights:
            
            Student Profile:
            - Learning Style: {student_data.get('learning_style', 'adaptive')}
            - Current GPA: {student_data.get('gpa', 0)}
            - Study Hours/Month: {student_data.get('study_hours', 0)}
            - Average Session: {student_data.get('avg_session', 0)} minutes
            
            Course Performance:
            {courses_str}
            
            Provide a JSON response with:
            - "performance_analysis": Object with:
              - "overall_trend": "improving", "stable", or "declining"
              - "strongest_areas": Array of 2-3 areas
              - "areas_needing_attention": Array of 2-3 areas
              - "grade_prediction": Predicted GPA for next semester
            
            - "learning_patterns": Object with:
              - "optimal_study_time": Best time of day (inferred from data)
              - "attention_span": Optimal study session duration
              - "learning_efficiency": Percentage (0-100)
              - "retention_rate": Percentage (0-100)
            
            - "ai_recommendations": Array of 4-5 specific, actionable recommendations with:
              - "title": Short title
              - "description": Detailed explanation
              - "priority": "high", "medium", or "low"
              - "impact": Expected impact description
            
            - "study_optimization": Object with:
              - "suggested_schedule": Brief schedule suggestion
              - "focus_areas": Array of topics to focus on
              - "time_allocation": Suggestions for time management
            
            Make recommendations specific, actionable, and personalized.
            Format as valid JSON only, no markdown.
            """

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Clean markdown
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.startswith('```'):
                result_text = result_text[3:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]

            result = json.loads(result_text.strip())
            result['ai_powered'] = True
            result['model'] = 'Gemini 2.5 Flash'
            return result

        except Exception as e:
            print(f"Gemini learning insights error: {e}")
            return self._mock_learning_insights(student_data)

    def _mock_assessment(self, topic: str, num_questions: int, assessment_type: str) -> Dict[str, Any]:
        """Fallback assessment when AI is not available"""
        questions = []
        for i in range(num_questions):
            questions.append({
                'question': f"Question {i + 1}: What is an important concept in {topic}?",
                'options': ['Option A', 'Option B', 'Option C', 'Option D'] if assessment_type != 'essay' else [],
                'correct_answer': 'A',
                'explanation': f"This is the correct answer because it demonstrates understanding of {topic}.",
                'points': 10 if assessment_type != 'essay' else 20,
                'type': 'multiple_choice' if assessment_type != 'essay' else 'essay'
            })

        return {
            'assessment_title': f"{topic} {assessment_type.title()}",
            'total_duration': num_questions * 2,
            'questions': questions,
            'passing_score': 60,
            'ai_generated': False,
            'model': 'Mock (Configure Gemini API)'
        }

    def _mock_learning_insights(self, student_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback learning insights when AI is not available"""
        gpa = student_data.get('gpa', 3.0)

        return {
            'performance_analysis': {
                'overall_trend': 'improving' if gpa > 2.5 else 'stable',
                'strongest_areas': ['Problem Solving', 'Consistent Study Habits'],
                'areas_needing_attention': ['Time Management', 'Advanced Topics'],
                'grade_prediction': min(4.0, gpa + 0.2)
            },
            'learning_patterns': {
                'optimal_study_time': '10:00 AM - 12:00 PM',
                'attention_span': '45-50 minutes',
                'learning_efficiency': 85,
                'retention_rate': 80
            },
            'ai_recommendations': [
                {
                    'title': 'Optimize Study Schedule',
                    'description': 'Schedule challenging subjects during peak concentration hours',
                    'priority': 'high',
                    'impact': 'Could improve performance by 15%'
                },
                {
                    'title': 'Take Regular Breaks',
                    'description': 'Use 45-minute study blocks with 10-minute breaks',
                    'priority': 'medium',
                    'impact': 'Improves retention and reduces fatigue'
                },
                {
                    'title': 'Active Recall Practice',
                    'description': 'Use flashcards and self-testing for better retention',
                    'priority': 'high',
                    'impact': 'Significantly improves long-term memory'
                }
            ],
            'study_optimization': {
                'suggested_schedule': 'Morning sessions for complex topics, evening for review',
                'focus_areas': ['Advanced concepts', 'Practice problems'],
                'time_allocation': 'Spend 40% on weak areas, 30% on practice, 30% on review'
            },
            'ai_powered': False,
            'model': 'Mock (Configure Gemini API)'
        }

    # Mock fallback methods

    def _mock_content(self, topic: str, difficulty: str) -> Dict[str, Any]:
        return {
            'explanation': f"This is {difficulty}-level content about {topic}. Understanding this topic requires attention to key concepts and practical application.",
            'practice_questions': [
                f"What are the fundamental principles of {topic}?",
                f"How would you apply {topic} in a real-world scenario?",
                f"What challenges might arise when working with {topic}?"
            ],
            'examples': [
                f"Example 1: Practical application of {topic} in industry",
                f"Example 2: Case study demonstrating {topic} concepts"
            ],
            'next_topics': [f"Advanced {topic}", "Related Concepts", "Practical Projects"],
            'ai_powered': False,
            'model': 'Mock (Configure Gemini API)'
        }

    def _mock_quiz(self, topic: str, num: int) -> List[Dict[str, Any]]:
        questions = []
        for i in range(num):
            questions.append({
                'question_id': i + 1,
                'question_text': f"Question {i + 1}: What is an important concept in {topic}?",
                'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                'correct_answer': 'A',
                'explanation': f"Option A correctly describes a key aspect of {topic}.",
                'points': 10,
                'ai_generated': False
            })
        return questions

    def _mock_grading(self, text: str) -> Dict[str, Any]:
        word_count = len(text.split())
        score = min(100, (word_count / 5))

        return {
            'overall_score': int(score),
            'criteria_scores': {'content': int(score * 0.4), 'grammar': int(score * 0.3),
                                'structure': int(score * 0.3)},
            'strengths': ['Clear writing', 'Good organization'],
            'improvements': ['Add more examples', 'Expand on key points'],
            'feedback': 'Good effort! Focus on developing your arguments with specific examples.',
            'ai_graded': False,
            'model': 'Mock (Configure Gemini API)'
        }

    def _mock_analysis(self, data: Dict) -> Dict[str, Any]:
        avg_grade = data.get('avg_grade', 70)
        risk = 'low' if avg_grade > 75 else 'medium' if avg_grade > 60 else 'high'

        return {
            'risk_level': risk,
            'risk_score': 100 - avg_grade,
            'strengths': ['Consistent effort', 'Good participation'],
            'concerns': ['Grade improvement needed'] if avg_grade < 70 else [],
            'recommendations': ['Focus on weak areas', 'Seek tutoring support', 'Improve study habits'],
            'trend': 'stable',
            'ai_analyzed': False,
            'model': 'Mock (Configure Gemini API)'
        }

    def _mock_career(self, skills: List[str]) -> Dict[str, Any]:
        return {
            'recommended_careers': [
                {'title': 'Software Developer', 'match_score': 85, 'why': 'Strong technical skills',
                 'salary_range': '$60k-$120k'},
                {'title': 'Data Analyst', 'match_score': 75, 'why': 'Analytical abilities',
                 'salary_range': '$55k-$100k'}
            ],
            'skill_gaps': ['Advanced programming', 'Project management'],
            'learning_path': ['Complete CS fundamentals', 'Build portfolio projects', 'Get certified'],
            'market_outlook': 'Strong demand for tech professionals continues to grow.',
            'ai_powered': False,
            'model': 'Mock (Configure Gemini API)'
        }


# Global service instance
gemini_service = GeminiAIService()
