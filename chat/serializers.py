from rest_framework import serializers
from .models import Conversation, Message
from accounts.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_username', 'text', 'is_read', 'created_at']
        read_only_fields = ['sender', 'conversation', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    members_details = UserSerializer(source='members', many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    current_user_id = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'type', 'name', 'avatar', 'members', 'members_details', 'last_message', 'unread_count', 'created_at', 'updated_at', 'current_user_id']
        extra_kwargs = {
            'members': {'required': False},
            'name': {'required': False},
        }

    def get_name(self, obj):
        if obj.type == 'dm':
            user = self.context.get('request').user
            other_member = obj.members.exclude(id=user.id).first()
            return other_member.username if other_member else "Unknown"
        return obj.name

    def get_current_user_id(self, obj):
        user = self.context.get('request').user
        return user.id if user.is_authenticated else None

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            return obj.messages.exclude(sender=user).filter(is_read=False).count()
        return 0
