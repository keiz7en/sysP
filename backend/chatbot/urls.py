from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'chatbot'

router = DefaultRouter()
router.register(r'sessions', views.ChatSessionViewSet)
router.register(r'knowledge-base', views.KnowledgeBaseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', views.ChatView.as_view(), name='chat'),
    path('intents/', views.ChatbotIntentView.as_view(), name='intents'),
    path('analytics/', views.ChatbotAnalyticsView.as_view(), name='analytics'),
]
