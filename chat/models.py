from django.db import models
from django.conf import settings

class Conversation(models.Model):
    CONVERSATION_TYPES = (
        ('dm', 'Direct Message'),
        ('group', 'Group Chat'),
    )
    
    type = models.CharField(max_length=10, choices=CONVERSATION_TYPES, default='dm')
    name = models.CharField(max_length=255, blank=True, null=True, help_text="Required for group chats")
    avatar = models.ImageField(upload_to='chat_avatars/', blank=True, null=True)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.type == 'dm':
            return f"DM between {', '.join([u.username for u in self.members.all()[:2]])}"
        return self.name or f"Group {self.id}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    text = models.TextField(blank=True) # Making text optional if they just send an attachment
    attachment = models.FileField(upload_to='chat_attachments/', blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"From {self.sender.username} in {self.conversation}"
