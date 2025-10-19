from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import ChatSession, ChatMessage, KnowledgeBase, ChatbotIntent

User = get_user_model()


class ChatSessionView(APIView):
    """Chat session management"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get user's chat sessions"""
        try:
            sessions = ChatSession.objects.filter(
                user=request.user
            ).order_by('-created_at')[:10]

            sessions_data = []
            for session in sessions:
                sessions_data.append({
                    'id': str(session.id),
                    'title': session.title,
                    'context_type': session.context_type,
                    'is_active': session.is_active,
                    'created_at': session.created_at,
                    'last_activity': session.last_activity,
                    'message_count': session.messages.count()
                })

            return Response({
                'sessions': sessions_data,
                'count': len(sessions_data)
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': f'Failed to fetch chat sessions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create new chat session"""
        try:
            session = ChatSession.objects.create(
                user=request.user,
                title=request.data.get('title', 'New Chat'),
                context_type=request.data.get('context_type', 'general'),
                is_active=True
            )

            return Response({
                'session': {
                    'id': str(session.id),
                    'title': session.title,
                    'context_type': session.context_type,
                    'is_active': session.is_active,
                    'created_at': session.created_at
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': f'Failed to create chat session: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_chat_messages(request, session_id):
    """Get messages for a specific chat session"""
    try:
        session = ChatSession.objects.get(
            id=session_id,
            user=request.user
        )

        messages = ChatMessage.objects.filter(
            session=session
        ).order_by('timestamp')

        messages_data = []
        for message in messages:
            messages_data.append({
                'id': message.id,
                'message_type': message.message_type,
                'message_text': message.message_text,
                'timestamp': message.timestamp,
                'intent_detected': message.intent_detected,
                'confidence_score': float(message.confidence_score) if message.confidence_score else None,
                'was_helpful': message.was_helpful
            })

        return Response({
            'messages': messages_data,
            'session_info': {
                'id': str(session.id),
                'title': session.title,
                'is_active': session.is_active
            }
        }, status=status.HTTP_200_OK)

    except ChatSession.DoesNotExist:
        return Response({
            'error': 'Chat session not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch messages: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_message(request, session_id):
    """Send message to AI chatbot"""
    try:
        session = ChatSession.objects.get(
            id=session_id,
            user=request.user
        )

        user_message = request.data.get('message', '').strip()
        if not user_message:
            return Response({
                'error': 'Message content is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Save user message
        user_chat_message = ChatMessage.objects.create(
            session=session,
            message_type='user',
            message_text=user_message
        )

        # Simple AI response logic (can be enhanced with actual AI)
        ai_response = "Thank you for your message! I'm here to help you with your educational journey. How can I assist you today?"

        # You can add more sophisticated response logic based on the message content
        if 'gpa' in user_message.lower():
            ai_response = "I can help you understand your GPA and suggest ways to improve it. Would you like me to analyze your current academic performance?"
        elif 'course' in user_message.lower():
            ai_response = "I can provide information about courses, enrollment, and course recommendations. What specific course information do you need?"
        elif 'career' in user_message.lower():
            ai_response = "I can help with career guidance, job recommendations, and skill assessments. What career-related questions do you have?"

        # Save AI response
        ai_chat_message = ChatMessage.objects.create(
            session=session,
            message_type='assistant',
            message_text=ai_response,
            intent_detected='general_inquiry',
            confidence_score=0.85
        )

        return Response({
            'user_message': {
                'id': user_chat_message.id,
                'message_text': user_chat_message.message_text,
                'timestamp': user_chat_message.timestamp
            },
            'ai_response': {
                'id': ai_chat_message.id,
                'message_text': ai_chat_message.message_text,
                'timestamp': ai_chat_message.timestamp
            }
        }, status=status.HTTP_200_OK)

    except ChatSession.DoesNotExist:
        return Response({
            'error': 'Chat session not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to send message: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quick_help(request):
    """Get quick help suggestions"""
    try:
        user_type = request.user.user_type

        if user_type == 'student':
            suggestions = [
                "How can I improve my GPA?",
                "What courses should I take next?",
                "How do I prepare for upcoming exams?",
                "What career paths match my skills?",
                "How can I track my learning progress?"
            ]
        elif user_type == 'teacher':
            suggestions = [
                "How can I create effective assessments?",
                "What teaching strategies work best?",
                "How do I track student progress?",
                "How can I improve student engagement?",
                "What tools are available for grading?"
            ]
        else:
            suggestions = [
                "How can I get help with the system?",
                "What features are available?",
                "How do I contact support?",
                "Where can I find tutorials?",
                "How do I update my profile?"
            ]

        return Response({
            'suggestions': suggestions,
            'user_type': user_type
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'error': f'Failed to get suggestions: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
