from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    path('sessions/', views.ChatSessionView.as_view(), name='chat-sessions'),
    path('sessions/<str:session_id>/messages/', views.get_chat_messages, name='chat-messages'),
    path('sessions/<str:session_id>/send/', views.send_message, name='send-message'),
    path('quick-help/', views.quick_help, name='quick-help'),
]
