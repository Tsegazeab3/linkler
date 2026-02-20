from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.all().order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        type = request.data.get('type', 'dm')
        recipient_id = request.data.get('recipient_id')

        if type == 'dm' and recipient_id:
            # Check if DM already exists
            existing_dm = Conversation.objects.filter(
                type='dm', 
                members=request.user
            ).filter(members=recipient_id).first()
            
            if existing_dm:
                serializer = self.get_serializer(existing_dm)
                return Response(serializer.data)

        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        conversation = serializer.save()
        conversation.members.add(self.request.user)
        recipient_id = self.request.data.get('recipient_id')
        if recipient_id:
            conversation.members.add(recipient_id)

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_id')
        return Message.objects.filter(conversation_id=conversation_id, conversation__members=self.request.user)

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_id')
        conversation = Conversation.objects.get(id=conversation_id, members=self.request.user)
        serializer.save(sender=self.request.user, conversation=conversation)
        # Update conversation timestamp to float to top in list
        conversation.save() 

class MarkAsReadView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, *args, **kwargs):
        conversation_id = self.kwargs.get('conversation_id')
        Message.objects.filter(
            conversation_id=conversation_id, 
            conversation__members=request.user
        ).exclude(sender=request.user).update(is_read=True)
        return Response(status=status.HTTP_204_NO_CONTENT)
