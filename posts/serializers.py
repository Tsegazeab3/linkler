from rest_framework import serializers
from .models import Post, Trip
from django.contrib.auth import get_user_model

User = get_user_model()

class UserShortSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile_picture', 'bio', 'is_following']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(follower=request.user).exists()
        return False

class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Post instances.
    """
    author = UserShortSerializer(source='user', read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'author',
            'caption',
            'media_file',
            'media_type',
            'aspect_ratio',
            'text_alignment',
            'status',
            'audience',
            'allow_comments',
            'likes_count',
            'comments_count',
            'saves_count',
            'created_at',
        ]
        # 'user' should be read-only because it will be set automatically
        # from the request user, not from the request body.
        read_only_fields = ['user', 'created_at', 'id', 'likes_count', 'comments_count', 'saves_count']

class TripSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(source='user', read_only=True)

    class Meta:
        model = Trip
        fields = [
            'id',
            'user',
            'author',
            'origin',
            'destination',
            'start_date',
            'end_date',
            'message',
            'created_at',
        ]
        read_only_fields = ['user', 'created_at']
