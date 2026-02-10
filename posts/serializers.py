from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Post instances.
    """
    class Meta:
        model = Post
        fields = [
            'id',
            'user',
            'caption',
            'media_file',
            'media_type',
            'aspect_ratio',
            'status',
            'audience',
            'allow_comments',
            'created_at',
        ]
        # 'user' should be read-only because it will be set automatically
        # from the request user, not from the request body.
        read_only_fields = ['user', 'created_at', 'id']
