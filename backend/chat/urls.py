from django.urls import path
from .views import (
    ConversationListCreateView, ConversationDetailView, MessageListView, MarkAsReadView,
    GroupSearchView, JoinRequestView, JoinByInviteView
)

urlpatterns = [
    path('conversations/', ConversationListCreateView.as_view(), name='conversation-list-create'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('conversations/<int:conversation_id>/read/', MarkAsReadView.as_view(), name='mark-as-read'),
    path('groups/search/', GroupSearchView.as_view(), name='group-search'),
    path('groups/join-request/', JoinRequestView.as_view(), name='join-request'),
    path('groups/join-invite/', JoinByInviteView.as_view(), name='join-invite'),
]
