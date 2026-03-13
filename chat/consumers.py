import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import MessageSerializer

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'chat_message')
        sender_id = self.scope['user'].id

        if message_type == 'chat_message':
            message_text = text_data_json.get('message')
            parent_id = text_data_json.get('parent_message_id')
            if not message_text:
                return

            # Save and serialize in one sync block to avoid SynchronousOnlyOperation
            message_data = await self.save_and_serialize_message(sender_id, self.conversation_id, message_text, parent_id)
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_group',
                    'message': message_data
                }
            )
        
        elif message_type == 'edit_message':
            message_id = text_data_json.get('message_id')
            new_text = text_data_json.get('message')
            if message_id and new_text:
                message_data = await self.update_and_serialize_message(message_id, new_text, sender_id)
                if message_data:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message_edited',
                            'message': message_data
                        }
                    )
        
        elif message_type == 'typing':
            is_typing = text_data_json.get('is_typing', False)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_typing',
                    'sender_id': sender_id,
                    'is_typing': is_typing
                }
            )
        
        elif message_type == 'mark_read':
            message_id = text_data_json.get('message_id')
            if message_id:
                await self.mark_message_as_read(message_id)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_read',
                        'message_id': message_id,
                        'reader_id': sender_id
                    }
                )

    # Receive message from room group
    async def chat_message_group(self, event):
        message = event['message']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': message
        }))

    async def chat_typing(self, event):
        # Send typing status to WebSocket
        if event['sender_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'sender_id': event['sender_id'],
                'is_typing': event['is_typing']
            }))

    async def chat_read(self, event):
        # Send read status to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'message_id': event['message_id'],
            'reader_id': event['reader_id']
        }))

    async def chat_message_edited(self, event):
        # Send edited message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'message_edited',
            'message': event['message']
        }))

    @database_sync_to_async
    def save_and_serialize_message(self, sender_id, conversation_id, text, parent_id=None):
        sender = User.objects.get(id=sender_id)
        conversation = Conversation.objects.get(id=conversation_id)
        
        parent_message = None
        if parent_id:
            try:
                parent_message = Message.objects.get(id=parent_id)
            except Message.DoesNotExist:
                pass

        message = Message.objects.create(
            sender=sender,
            conversation=conversation,
            text=text,
            parent_message=parent_message
        )
        conversation.save()
        
        # Serialize while still in sync context
        serializer = MessageSerializer(message)
        return serializer.data

    @database_sync_to_async
    def update_and_serialize_message(self, message_id, text, sender_id):
        try:
            message = Message.objects.get(id=message_id, sender_id=sender_id)
            message.text = text
            message.is_edited = True
            message.save()
            
            # Serialize while still in sync context
            serializer = MessageSerializer(message)
            return serializer.data
        except Message.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_message_as_read(self, message_id):
        try:
            message = Message.objects.get(id=message_id)
            message.is_read = True
            message.save()
        except Message.DoesNotExist:
            pass
