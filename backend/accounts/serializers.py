from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import CustomUser, Experience, ExperienceImage, ExperienceReview, ProviderReview, Booking, TravelerProfile, VerificationDocument, Notification, GuideAvailability

class TravelerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelerProfile
        fields = '__all__'
        read_only_fields = ('user',)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class VerificationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDocument
        fields = '__all__'
        read_only_fields = ('user', 'uploaded_at')

class GuideAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = GuideAvailability
        fields = ('id', 'date', 'is_available', 'reason')
        read_only_fields = ('id',)

class ExperienceReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    user_profile_picture = serializers.ImageField(source='user.profile_picture', read_only=True)

    class Meta:
        model = ExperienceReview
        fields = ('id', 'experience', 'user', 'user_username', 'user_profile_picture', 'rating', 'comment', 'created_at')
        read_only_fields = ('user',)

class ProviderReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    user_profile_picture = serializers.ImageField(source='user.profile_picture', read_only=True)

    class Meta:
        model = ProviderReview
        fields = ('id', 'provider', 'user', 'user_username', 'user_profile_picture', 'rating', 'comment', 'created_at')
        read_only_fields = ('user',)

class ExperienceImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ExperienceImage
        fields = ('id', 'image')

    def get_image(self, obj):
        if not obj.image:
            return None
        image_str = str(obj.image)
        if image_str.startswith('http://') or image_str.startswith('https://'):
            return image_str
        if hasattr(obj.image, 'url'):
            return obj.image.url
        return image_str

class ExperienceSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    images = ExperienceImageSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()
    total_earnings = serializers.SerializerMethodField()
    user_booking = serializers.SerializerMethodField()

    class Meta:
        model = Experience
        fields = (
            'id', 'user', 'user_username', 'listing_type', 'title', 'description', 
            'price', 'currency', 'location', 'country', 'region', 
            'duration', 'images', 'category', 'rating', 'review_count', 
            'bookings_count', 'total_earnings', 'user_booking', 'created_at'
        )
        read_only_fields = ('user',)

    def get_user_booking(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            booking = obj.bookings.filter(user=request.user).first()
            if booking:
                return {
                    'id': booking.id,
                    'status': booking.status,
                    'date': booking.booking_date
                }
        return None

    def get_bookings_count(self, obj):
        return obj.bookings.count()

    def get_total_earnings(self, obj):
        from django.db.models import Sum
        return obj.bookings.filter(status='confirmed').aggregate(Sum('price'))['price__sum'] or 0

    def get_rating(self, obj):
        from django.db.models import Avg
        avg = obj.reviews.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0

    def get_review_count(self, obj):
        return obj.reviews.count()

    def create(self, validated_data):
        images_data = self.context['request'].FILES.getlist('images')
        experience = Experience.objects.create(**validated_data)
        for image_data in images_data:
            ExperienceImage.objects.create(experience=experience, image=image_data)
        return experience

class UserSerializer(serializers.ModelSerializer):
    is_following = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    posts = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    unread_notifications_count = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'age', 'nationality', 'phone_no', 
            'city', 'country', 'facebook', 'instagram', 'git_hub', 
            'linkedin', 'whatsapp', 'telegram', 'account_type', 'bio', 
            'profile_picture', 'is_following', 'followers_count', 
            'following_count', 'posts_count', 'posts', 'rating', 'review_count',
            'opt_out_discovery', 'show_followers_list',
            'onboarding_completed', 'verification_status',
            'is_profile_complete', 'missing_fields', 'unread_notifications_count'
        )
        read_only_fields = ('email', 'account_type', 'verification_status', 'is_profile_complete', 'missing_fields', 'unread_notifications_count')

    def get_unread_notifications_count(self, obj):
        return obj.notifications.filter(is_read=False).count()
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(follower=request.user).exists()
        return False

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_posts_count(self, obj):
        return obj.posts.count()

    def get_posts(self, obj):
        from posts.serializers import PostSerializer
        posts = obj.posts.all()[:12] # Limit to latest 12
        return PostSerializer(posts, many=True, context=self.context).data

    def get_rating(self, obj):
        from django.db.models import Avg
        if obj.account_type == 'guide':
            avg = obj.provider_reviews.aggregate(Avg('rating'))['rating__avg']
            return round(avg, 1) if avg else 0.0
        return 0.0

    def get_review_count(self, obj):
        if obj.account_type == 'guide':
            return obj.provider_reviews.count()
        return 0

    def get_profile_picture(self, obj):
        if not obj.profile_picture:
            return None
        if str(obj.profile_picture).startswith('http'):
            return str(obj.profile_picture)
        if hasattr(obj.profile_picture, 'url'):
            return obj.profile_picture.url
        return str(obj.profile_picture)


class CustomRegisterSerializer(RegisterSerializer):
    account_type = serializers.ChoiceField(choices=CustomUser.ACCOUNT_TYPE_CHOICES, default='traveller')

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['account_type'] = self.validated_data.get('account_type', 'traveller')
        return data

    def save(self, request):
        user = super().save(request)
        user.account_type = self.validated_data.get('account_type', 'traveller')
        user.save()
        return user


from dj_rest_auth.serializers import LoginSerializer

class CustomLoginSerializer(LoginSerializer):
    pass

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

class BookingSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    provider_details = UserSerializer(source='provider', read_only=True)
    experience_details = ExperienceSerializer(source='experience', read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id', 'user', 'user_details', 
            'provider', 'provider_details', 
            'experience', 'experience_details', 
            'source_post', 'booking_date', 'status', 
            'price', 'currency', 'created_at', 'updated_at'
        )
        read_only_fields = ('user', 'created_at', 'updated_at')

