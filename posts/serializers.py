from rest_framework import serializers
from .models import Post, Trip, Comment, Like, Save
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

class CommentSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(source='user', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Post instances.
    """
    author = UserShortSerializer(source='user', read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    saves_count = serializers.SerializerMethodField()
    post_comments = CommentSerializer(many=True, read_only=True)
    
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
            'status',
            'audience',
            'allow_comments',
            'likes_count',
            'comments_count',
            'saves_count',
            'is_liked',
            'is_saved',
            'post_comments',
            'created_at',
        ]
        # 'user' should be read-only because it will be set automatically
        # from the request user, not from the request body.
        read_only_fields = ['user', 'created_at', 'id']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Save.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_likes_count(self, obj):
        return obj.post_likes.count()

    def get_comments_count(self, obj):
        return obj.post_comments.count()

    def get_saves_count(self, obj):
        return obj.post_saves.count()

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
