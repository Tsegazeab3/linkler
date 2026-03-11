from django.urls import path
from .views import ConversationListCreateView, MessageListView, MarkAsReadView

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list-create'),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('conversations/<int:conversation_id>/read/', MarkAsReadView.as_view(), name='mark-as-read'),
]
