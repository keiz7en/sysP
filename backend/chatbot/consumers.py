import json
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ChatSession, ChatMessage
from .ai_engine import AIEngine


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs'].get('session_id')
        self.user = self.scope['user']

        if isinstance(self.user, AnonymousUser):
            await self.close()
            return

        # Create or get chat session
        if not self.session_id:
            self.chat_session = await self.create_chat_session()
            self.session_id = str(self.chat_session.id)
        else:
            self.chat_session = await self.get_chat_session(self.session_id)
            if not self.chat_session:
                await self.close()
                return

        self.room_group_name = f'chat_{self.session_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Send session info
        await self.send(text_data=json.dumps({
            'type': 'session_info',
            'session_id': self.session_id,
            'message': 'Connected to AI Assistant'
        }))

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'message')

            if message_type == 'message':
                await self.handle_message(text_data_json)
            elif message_type == 'feedback':
                await self.handle_feedback(text_data_json)

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))

    async def handle_message(self, data):
        message_text = data.get('message', '').strip()
        if not message_text:
            return

        # Save user message
        user_message = await self.save_message(
            message_text=message_text,
            message_type='user'
        )

        # Send user message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_text,
                'message_type': 'user',
                'timestamp': user_message.timestamp.isoformat()
            }
        )

        # Generate AI response
        await self.generate_ai_response(message_text)

    async def generate_ai_response(self, user_message):
        try:
            # Initialize AI engine
            ai_engine = AIEngine()

            # Get chat history for context
            chat_history = await self.get_chat_history()

            # Generate response
            ai_response = await ai_engine.generate_response(
                user_message=user_message,
                chat_history=chat_history,
                user=self.user,
                session=self.chat_session
            )

            # Save AI response
            ai_message = await self.save_message(
                message_text=ai_response['response'],
                message_type='assistant',
                intent_detected=ai_response.get('intent'),
                confidence_score=ai_response.get('confidence'),
                entities_extracted=ai_response.get('entities', {}),
                response_sources=ai_response.get('sources', []),
                processing_time_ms=ai_response.get('processing_time')
            )

            # Send AI response to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': ai_response['response'],
                    'message_type': 'assistant',
                    'timestamp': ai_message.timestamp.isoformat(),
                    'sources': ai_response.get('sources', []),
                    'suggestions': ai_response.get('suggestions', [])
                }
            )

        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Sorry, I encountered an error. Please try again.'
            }))

    async def handle_feedback(self, data):
        message_id = data.get('message_id')
        was_helpful = data.get('was_helpful')
        rating = data.get('rating')

        if message_id:
            await self.update_message_feedback(message_id, was_helpful, rating)

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'message_type': event['message_type'],
            'timestamp': event['timestamp'],
            'sources': event.get('sources', []),
            'suggestions': event.get('suggestions', [])
        }))

    @database_sync_to_async
    def create_chat_session(self):
        return ChatSession.objects.create(
            user=self.user,
            title=f"Chat Session {uuid.uuid4().hex[:8]}"
        )

    @database_sync_to_async
    def get_chat_session(self, session_id):
        try:
            return ChatSession.objects.get(
                id=session_id,
                user=self.user
            )
        except ChatSession.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, message_text, message_type, **kwargs):
        return ChatMessage.objects.create(
            session=self.chat_session,
            message_text=message_text,
            message_type=message_type,
            **kwargs
        )

    @database_sync_to_async
    def get_chat_history(self, limit=10):
        messages = ChatMessage.objects.filter(
            session=self.chat_session
        ).order_by('-timestamp')[:limit]

        return [
            {
                'message': msg.message_text,
                'type': msg.message_type,
                'timestamp': msg.timestamp.isoformat()
            }
            for msg in reversed(messages)
        ]

    @database_sync_to_async
    def update_message_feedback(self, message_id, was_helpful, rating):
        try:
            message = ChatMessage.objects.get(
                id=message_id,
                session=self.chat_session
            )
            if was_helpful is not None:
                message.was_helpful = was_helpful
            if rating is not None:
                message.user_rating = rating
            message.save()
        except ChatMessage.DoesNotExist:
            pass
