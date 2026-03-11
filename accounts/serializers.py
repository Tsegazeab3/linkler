from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import CustomUser, Experience, ExperienceImage

class ExperienceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceImage
        fields = ('id', 'image')

class ExperienceSerializer(serializers.ModelSerializer):
    user_username = serializers.ReadOnlyField(source='user.username')
    images = ExperienceImageSerializer(many=True, read_only=True)

    class Meta:
        model = Experience
        fields = (
            'id', 'user', 'user_username', 'title', 'description', 
            'price', 'currency', 'location', 'duration', 'images', 
            'category', 'created_at'
        )
        read_only_fields = ('user',)

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

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'age', 'nationality', 'phone_no', 
            'city', 'country', 'facebook', 'instagram', 'git_hub',
            'linkedin', 'whatsapp', 'telegram', 'account_type', 'bio', 
            'profile_picture', 'is_following', 'followers_count', 
            'following_count', 'posts_count', 'posts'
        )
        read_only_fields = ('email', 'account_type')

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

    def validate(self, attrs):
        print(f"DEBUG: Backend received registration attempt: {attrs}")
        return super().validate(attrs)


from dj_rest_auth.serializers import LoginSerializer

class CustomLoginSerializer(LoginSerializer):
    def validate(self, attrs):
        print(f"DEBUG: Backend received login attempt: {attrs}")
        return super().validate(attrs)
