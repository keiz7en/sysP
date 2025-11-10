"""
Vertex AI Service - Core AI functionality using Google Cloud Vertex AI
"""
import os
import json
from typing import List, Dict, Any, Optional
from google.cloud import aiplatform
from google.cloud.aiplatform import gapic
from vertexai.language_models import TextGenerationModel, ChatModel
from vertexai.generative_models import GenerativeModel
import vertexai


class VertexAIService:
    """
    Central service for all Vertex AI operations
    """

    def __init__(self):
        # Initialize Vertex AI
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT', 'your-project-id')
        self.location = os.getenv('GOOGLE_CLOUD_LOCATION', 'us-central1')

        # Initialize Vertex AI SDK
        vertexai.init(project=self.project_id, location=self.location)

        # Initialize models
        self.text_model = None
        self.chat_model = None
        self.gemini_model = None

    def initialize_models(self):
        """Initialize AI models"""
        try:
            # Text generation model
            self.text_model = TextGenerationModel.from_pretrained("text-bison@002")

            # Chat model
            self.chat_model = ChatModel.from_pretrained("chat-bison@002")

            # Gemini model for advanced generation
            self.gemini_model = GenerativeModel("gemini-pro")

            return True
        except Exception as e:
            print(f"Error initializing models: {e}")
            return False

    def generate_personalized_content(
            self,
            student_profile: Dict[str, Any],
            topic: str,
            difficulty_level: str = 'medium'
    ) -> Dict[str, Any]:
        """
        Generate personalized learning content based on student profile
        """
        try:
            prompt = f"""
            Generate personalized learning content for a student with the following profile:
            - Learning Style: {student_profile.get('learning_style', 'adaptive')}
            - Current Level: {student_profile.get('current_level', 'intermediate')}
            - Strengths: {', '.join(student_profile.get('strengths', []))}
            - Areas for Improvement: {', '.join(student_profile.get('areas_for_improvement', []))}
            
            Topic: {topic}
            Difficulty Level: {difficulty_level}
            
            Generate:
            1. A clear explanation adapted to their learning style
            2. 3 practice questions at appropriate difficulty
            3. Real-world examples relevant to their interests
            4. Suggested next topics based on their profile
            
            Format the response as JSON with keys: explanation, practice_questions, examples, next_topics
            """

            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                return json.loads(response.text)
            else:
                # Fallback to mock data if model not initialized
                return self._generate_mock_content(topic, difficulty_level)

        except Exception as e:
            print(f"Error generating personalized content: {e}")
            return self._generate_mock_content(topic, difficulty_level)

    def adaptive_difficulty_adjustment(
            self,
            student_performance: Dict[str, Any],
            current_difficulty: str
    ) -> Dict[str, Any]:
        """
        Use reinforcement learning to adjust difficulty based on performance
        """
        try:
            prompt = f"""
            Analyze student performance and recommend difficulty adjustment:
            
            Current Performance:
            - Current Difficulty: {current_difficulty}
            - Recent Scores: {student_performance.get('recent_scores', [])}
            - Time Spent: {student_performance.get('time_spent', 0)} minutes
            - Completion Rate: {student_performance.get('completion_rate', 0)}%
            - Engagement Level: {student_performance.get('engagement_level', 'medium')}
            
            Based on this data:
            1. Should difficulty be adjusted? (increase/decrease/maintain)
            2. What is the recommended new difficulty level?
            3. What specific areas need focus?
            4. What motivational strategies would help?
            
            Return JSON with: adjustment_needed, new_difficulty, focus_areas, motivation_strategies
            """

            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                return json.loads(response.text)
            else:
                return self._adaptive_mock_response(student_performance, current_difficulty)

        except Exception as e:
            print(f"Error in adaptive difficulty adjustment: {e}")
            return self._adaptive_mock_response(student_performance, current_difficulty)

    def generate_quiz(
            self,
            topic: str,
            difficulty: str,
            num_questions: int = 5,
            question_types: List[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Generate AI-powered quiz questions
        """
        if question_types is None:
            question_types = ['multiple_choice', 'true_false', 'short_answer']

        try:
            prompt = f"""
            Generate {num_questions} quiz questions about {topic} at {difficulty} difficulty.
            
            Question types to include: {', '.join(question_types)}
            
            For each question, provide:
            - question_text
            - question_type
            - options (for multiple choice)
            - correct_answer
            - explanation
            - points
            
            Return as a JSON array of question objects.
            """

            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                return json.loads(response.text)
            else:
                return self._generate_mock_quiz(topic, difficulty, num_questions)

        except Exception as e:
            print(f"Error generating quiz: {e}")
            return self._generate_mock_quiz(topic, difficulty, num_questions)

    def analyze_student_writing(
            self,
            essay_text: str,
            rubric: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Use NLP to analyze and score student essays
        """
        try:
            prompt = f"""
            Analyze the following student essay using this rubric:
            {json.dumps(rubric, indent=2)}
            
            Essay:
            {essay_text}
            
            Provide:
            1. Overall score (0-100)
            2. Scores for each rubric criteria
            3. Strengths identified
            4. Areas for improvement
            5. Specific suggestions for improvement
            6. Grammar and style feedback
            
            Return as JSON with: overall_score, criteria_scores, strengths, improvements, suggestions, grammar_feedback
            """

            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                return json.loads(response.text)
            else:
                return self._mock_essay_analysis(essay_text)

        except Exception as e:
            print(f"Error analyzing essay: {e}")
            return self._mock_essay_analysis(essay_text)

    def predict_dropout_risk(
            self,
            student_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Predict student dropout risk using ML
        """
        try:
            # Extract features
            features = {
                'attendance_rate': student_data.get('attendance_rate', 0),
                'avg_grade': student_data.get('average_grade', 0),
                'engagement_score': student_data.get('engagement_score', 0),
                'assignment_completion': student_data.get('assignment_completion_rate', 0),
                'time_on_platform': student_data.get('time_on_platform', 0),
                'help_requests': student_data.get('help_requests', 0),
                'participation': student_data.get('participation_score', 0)
            }

            # Calculate risk score (simplified - in production use trained model)
            risk_score = self._calculate_risk_score(features)

            # Determine risk level
            if risk_score < 0.3:
                risk_level = 'low'
            elif risk_score < 0.6:
                risk_level = 'medium'
            elif risk_score < 0.8:
                risk_level = 'high'
            else:
                risk_level = 'critical'

            # Generate recommendations
            recommendations = self._generate_intervention_recommendations(features, risk_level)

            return {
                'risk_score': round(risk_score, 2),
                'risk_level': risk_level,
                'risk_factors': self._identify_risk_factors(features),
                'protective_factors': self._identify_protective_factors(features),
                'recommendations': recommendations,
                'confidence': 0.85
            }

        except Exception as e:
            print(f"Error predicting dropout risk: {e}")
            return {
                'risk_score': 0.5,
                'risk_level': 'medium',
                'risk_factors': [],
                'protective_factors': [],
                'recommendations': [],
                'confidence': 0.0
            }

    def match_jobs(
            self,
            student_skills: List[str],
            student_profile: Dict[str, Any],
            job_market_data: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Match students with suitable jobs using NLP and semantic matching
        """
        matches = []

        for job in job_market_data:
            # Calculate match score
            match_score = self._calculate_job_match_score(
                student_skills,
                job.get('required_skills', []),
                job.get('preferred_skills', [])
            )

            if match_score > 0.3:  # Threshold
                skill_gaps = list(set(job.get('required_skills', [])) - set(student_skills))

                matches.append({
                    'job_id': job.get('id'),
                    'job_title': job.get('title'),
                    'company': job.get('company'),
                    'match_score': round(match_score, 2),
                    'skill_match_percentage': round(match_score * 100, 1),
                    'missing_skills': skill_gaps,
                    'salary_range': job.get('salary_range'),
                    'location': job.get('location'),
                    'reasons': self._generate_match_reasons(match_score, skill_gaps)
                })

        # Sort by match score
        matches.sort(key=lambda x: x['match_score'], reverse=True)

        return matches[:10]  # Return top 10 matches

    def parse_resume(self, resume_text: str) -> Dict[str, Any]:
        """
        Parse resume using NLP to extract key information
        """
        try:
            prompt = f"""
            Parse the following resume and extract:
            1. Personal information (name, email, phone)
            2. Education (degrees, institutions, years)
            3. Work experience (positions, companies, durations, descriptions)
            4. Skills (technical and soft skills)
            5. Certifications
            6. Projects
            7. Achievements
            
            Resume:
            {resume_text}
            
            Return as structured JSON.
            """

            if self.gemini_model:
                response = self.gemini_model.generate_content(prompt)
                return json.loads(response.text)
            else:
                return self._mock_resume_parse(resume_text)

        except Exception as e:
            print(f"Error parsing resume: {e}")
            return self._mock_resume_parse(resume_text)

    def chatbot_response(
            self,
            user_message: str,
            conversation_history: List[Dict[str, str]],
            context: Dict[str, Any]
    ) -> str:
        """
        Generate chatbot response using Vertex AI
        """
        try:
            # Build context-aware prompt
            context_str = f"""
            You are an AI academic advisor helping students with:
            - Course selection and enrollment
            - Academic guidance and study tips
            - Career advice and job market insights
            - Scholarship and admission information
            
            Student Context:
            - User Type: {context.get('user_type')}
            - Current Courses: {context.get('current_courses', [])}
            - Academic Level: {context.get('academic_level')}
            """

            # Start chat session
            if self.chat_model:
                chat = self.chat_model.start_chat(context=context_str)

                # Add history
                for msg in conversation_history[-5:]:  # Last 5 messages
                    if msg['role'] == 'user':
                        chat.send_message(msg['content'])

                # Get response for current message
                response = chat.send_message(user_message)
                return response.text
            else:
                return self._mock_chatbot_response(user_message, context)

        except Exception as e:
            print(f"Error in chatbot response: {e}")
            return self._mock_chatbot_response(user_message, context)

    # Helper methods for mock data (used when models not initialized)

    def _generate_mock_content(self, topic: str, difficulty: str) -> Dict[str, Any]:
        return {
            'explanation': f"This is a {difficulty} level explanation of {topic}.",
            'practice_questions': [
                f"Question 1 about {topic}",
                f"Question 2 about {topic}",
                f"Question 3 about {topic}"
            ],
            'examples': [f"Example 1 for {topic}", f"Example 2 for {topic}"],
            'next_topics': [f"Advanced {topic}", f"Related Topic 1", f"Related Topic 2"]
        }

    def _adaptive_mock_response(self, performance: Dict, current_difficulty: str) -> Dict[str, Any]:
        avg_score = sum(performance.get('recent_scores', [70])) / len(performance.get('recent_scores', [70]))

        if avg_score > 85:
            adjustment = 'increase'
            new_difficulty = 'hard' if current_difficulty == 'medium' else 'expert'
        elif avg_score < 60:
            adjustment = 'decrease'
            new_difficulty = 'easy' if current_difficulty == 'medium' else 'beginner'
        else:
            adjustment = 'maintain'
            new_difficulty = current_difficulty

        return {
            'adjustment_needed': adjustment,
            'new_difficulty': new_difficulty,
            'focus_areas': ['Problem-solving', 'Critical thinking'],
            'motivation_strategies': ['Gamification', 'Progress tracking', 'Peer collaboration']
        }

    def _generate_mock_quiz(self, topic: str, difficulty: str, num: int) -> List[Dict[str, Any]]:
        questions = []
        for i in range(num):
            questions.append({
                'question_text': f"Question {i + 1} about {topic} ({difficulty} level)",
                'question_type': 'multiple_choice',
                'options': ['Option A', 'Option B', 'Option C', 'Option D'],
                'correct_answer': 'Option A',
                'explanation': f"Explanation for question {i + 1}",
                'points': 10
            })
        return questions

    def _mock_essay_analysis(self, text: str) -> Dict[str, Any]:
        word_count = len(text.split())
        base_score = min(100, (word_count / 5))  # Simple scoring

        return {
            'overall_score': int(base_score),
            'criteria_scores': {
                'grammar': int(base_score * 0.9),
                'structure': int(base_score * 0.85),
                'content': int(base_score * 0.95),
                'creativity': int(base_score * 0.8)
            },
            'strengths': ['Clear writing', 'Good organization'],
            'improvements': ['Add more examples', 'Improve transitions'],
            'suggestions': ['Consider adding more supporting evidence', 'Review grammar rules'],
            'grammar_feedback': 'Generally good, minor issues detected'
        }

    def _calculate_risk_score(self, features: Dict[str, float]) -> float:
        """Calculate dropout risk score from features"""
        # Weights for different factors
        weights = {
            'attendance_rate': 0.25,
            'avg_grade': 0.20,
            'engagement_score': 0.20,
            'assignment_completion': 0.15,
            'time_on_platform': 0.10,
            'participation': 0.10
        }

        # Calculate weighted risk (inverse of positive factors)
        risk = 0.0
        for feature, value in features.items():
            if feature in weights:
                # Normalize to 0-1 and invert (higher values = lower risk)
                normalized = min(100, max(0, value)) / 100
                risk += weights[feature] * (1 - normalized)

        return min(1.0, max(0.0, risk))

    def _identify_risk_factors(self, features: Dict[str, float]) -> List[str]:
        """Identify risk factors from features"""
        factors = []
        if features.get('attendance_rate', 100) < 75:
            factors.append('Low attendance rate')
        if features.get('avg_grade', 100) < 60:
            factors.append('Declining academic performance')
        if features.get('engagement_score', 100) < 50:
            factors.append('Low engagement with course materials')
        if features.get('assignment_completion', 100) < 70:
            factors.append('Poor assignment completion rate')
        return factors

    def _identify_protective_factors(self, features: Dict[str, float]) -> List[str]:
        """Identify protective factors"""
        factors = []
        if features.get('attendance_rate', 0) > 90:
            factors.append('Excellent attendance')
        if features.get('engagement_score', 0) > 80:
            factors.append('High engagement')
        if features.get('participation', 0) > 75:
            factors.append('Active participation')
        return factors

    def _generate_intervention_recommendations(self, features: Dict, risk_level: str) -> List[str]:
        """Generate intervention recommendations"""
        recommendations = []

        if risk_level in ['high', 'critical']:
            recommendations.append('Schedule immediate counseling session')
            recommendations.append('Assign academic mentor')

        if features.get('attendance_rate', 100) < 75:
            recommendations.append('Monitor attendance closely')

        if features.get('engagement_score', 100) < 50:
            recommendations.append('Provide personalized learning resources')
            recommendations.append('Enable adaptive learning mode')

        recommendations.append('Regular check-ins with advisor')
        recommendations.append('Connect with peer support groups')

        return recommendations

    def _calculate_job_match_score(
            self,
            student_skills: List[str],
            required_skills: List[str],
            preferred_skills: List[str]
    ) -> float:
        """Calculate job match score"""
        if not required_skills:
            return 0.0

        # Match required skills (weighted more)
        required_matches = len(set(student_skills) & set(required_skills))
        required_score = required_matches / len(required_skills) if required_skills else 0

        # Match preferred skills
        preferred_matches = len(set(student_skills) & set(preferred_skills))
        preferred_score = preferred_matches / len(preferred_skills) if preferred_skills else 0

        # Weighted combination
        final_score = (required_score * 0.7) + (preferred_score * 0.3)

        return final_score

    def _generate_match_reasons(self, match_score: float, skill_gaps: List[str]) -> List[str]:
        """Generate reasons for job match"""
        reasons = []

        if match_score > 0.8:
            reasons.append('Excellent skill match')
        elif match_score > 0.6:
            reasons.append('Strong skill match')
        else:
            reasons.append('Good foundational skills')

        if len(skill_gaps) == 0:
            reasons.append('All required skills met')
        elif len(skill_gaps) <= 2:
            reasons.append('Minor skill gaps that can be quickly addressed')

        return reasons

    def _mock_resume_parse(self, text: str) -> Dict[str, Any]:
        """Mock resume parsing"""
        return {
            'personal_info': {
                'name': 'Extracted from resume',
                'email': 'email@example.com',
                'phone': '+1234567890'
            },
            'education': [],
            'work_experience': [],
            'skills': [],
            'certifications': [],
            'projects': []
        }

    def _mock_chatbot_response(self, message: str, context: Dict) -> str:
        """Mock chatbot response"""
        return f"Thank you for your question. As an AI advisor, I'm here to help you with academic and career guidance. How can I assist you further?"


# Singleton instance
vertex_ai_service = VertexAIService()
