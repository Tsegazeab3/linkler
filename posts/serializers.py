from rest_framework import serializers
from .models import Post, Trip, Comment, Like, Save, PostImage
from django.contrib.auth import get_user_model
from django.db.models import Sum

User = get_user_model()

class BookingShortSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    class Meta:
        from accounts.models import Booking
        model = Booking
        fields = ('id', 'user_username', 'booking_date', 'status', 'price', 'currency')

class UserShortSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile_picture', 'bio', 'is_following']

    def get_profile_picture(self, obj):
        if not obj.profile_picture:
            return None
        # Check if the stored name is already a full URL
        if str(obj.profile_picture).startswith('http'):
            return str(obj.profile_picture)
        if hasattr(obj.profile_picture, 'url'):
            return obj.profile_picture.url
        return str(obj.profile_picture)

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

class PostImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PostImage
        fields = ['id', 'image']

    def get_image(self, obj):
        if not obj.image:
            return None
        if str(obj.image).startswith('http'):
            return str(obj.image)
        if hasattr(obj.image, 'url'):
            return obj.image.url
        return str(obj.image)

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
    bookings_count = serializers.SerializerMethodField()
    total_earnings = serializers.SerializerMethodField()
    post_comments = CommentSerializer(many=True, read_only=True)
    media_file = serializers.SerializerMethodField()
    images = PostImageSerializer(many=True, read_only=True)
    bookings = BookingShortSerializer(source='generated_bookings', many=True, read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'author',
            'caption',
            'country',
            'region',
            'media_file',
            'images',
            'media_type',
            'aspect_ratio',
            'status',
            'audience',
            'allow_comments',
            'likes_count',
            'comments_count',
            'saves_count',
            'bookings_count',
            'total_earnings',
            'bookings',
            'is_liked',
            'is_saved',
            'post_comments',
            'created_at',
        ]
        read_only_fields = ['user', 'created_at', 'id']

    def get_bookings_count(self, obj):
        return obj.generated_bookings.count()

    def get_total_earnings(self, obj):
        return obj.generated_bookings.filter(status='confirmed').aggregate(Sum('price'))['price__sum'] or 0

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

    def get_media_file(self, obj):
        if not obj.media_file:
            return None
        # Check if the stored name is already a full URL
        if str(obj.media_file).startswith('http'):
            return str(obj.media_file)
        if hasattr(obj.media_file, 'url'):
            return obj.media_file.url
        return str(obj.media_file)

class TripSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(source='user', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = [
            'id',
            'user',
            'author',
            'origin',
            'destination',
            'destination_country',
            'region',
            'category',
            'start_date',
            'end_date',
            'message',
            'image',
            'created_at',
        ]
        read_only_fields = ['user', 'created_at']

    def get_image(self, obj):
        if not obj.image:
            return None
        if str(obj.image).startswith('http'):
            return str(obj.image)
        if hasattr(obj.image, 'url'):
            return obj.image.url
        return str(obj.image)
