from rest_framework import serializers
from .models import Conversation, Message, JoinRequest
from accounts.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    parent_message_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_username', 'text', 'attachment', 'is_read', 'parent_message', 'parent_message_details', 'is_edited', 'created_at', 'updated_at']
        read_only_fields = ['sender', 'conversation', 'created_at', 'updated_at']

    def get_parent_message_details(self, obj):
        if obj.parent_message:
            return {
                'id': obj.parent_message.id,
                'text': obj.parent_message.text,
                'sender_username': obj.parent_message.sender.username,
            }
        return None

class ConversationSerializer(serializers.ModelSerializer):
    members_details = UserSerializer(source='members', many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    current_user_id = serializers.SerializerMethodField()
    current_user_username = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'type', 'privacy', 'invite_code', 'name', 'avatar', 
            'members', 'members_details', 'last_message', 'unread_count', 
            'created_at', 'updated_at', 'current_user_id', 'current_user_username'
        ]
        extra_kwargs = {
            'members': {'required': False},
            'name': {'required': False},
        }

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.type == 'dm':
            user = self.context.get('request').user
            if user.is_authenticated:
                other_member = instance.members.exclude(id=user.id).first()
                ret['name'] = other_member.username if other_member else "Unknown"
        return ret

    def get_current_user_id(self, obj):
        user = self.context.get('request').user
        return user.id if user.is_authenticated else None

    def get_current_user_username(self, obj):
        user = self.context.get('request').user
        return user.username if user.is_authenticated else None

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

class JoinRequestSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    conversation_name = serializers.ReadOnlyField(source='conversation.name')
    
    class Meta:
        model = JoinRequest
        fields = ['id', 'conversation', 'conversation_name', 'user', 'user_details', 'status', 'created_at']
        read_only_fields = ['user', 'status', 'created_at']
