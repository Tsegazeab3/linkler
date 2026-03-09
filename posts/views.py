from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import PostSerializer, TripSerializer, CommentSerializer
from .models import Post, Trip, Like, Save, Comment
from django.shortcuts import get_object_or_404

class PostCreateView(APIView):
    """
    API view for creating a new Post.
    """
    # Use MultiPartParser and FormParser to handle file uploads
    # along with other form data.
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """
        Handle POST request to create a new post.
        """
        serializer = PostSerializer(data=request.data)
        
        if serializer.is_valid():
            # Assign the current authenticated user to the post.
            # The 'user' field is read-only in the serializer, so we set it here.
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # Return validation errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostListView(generics.ListAPIView):
    queryset = Post.objects.filter(status='published')
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

class TripListCreateView(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

class LikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            like.delete()
            return Response({
                'is_liked': False,
                'likes_count': post.post_likes.count()
            }, status=status.HTTP_200_OK)
        
        return Response({
            'is_liked': True,
            'likes_count': post.post_likes.count()
        }, status=status.HTTP_201_CREATED)

class SaveToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        save, created = Save.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            save.delete()
            return Response({
                'is_saved': False,
                'saves_count': post.post_saves.count()
            }, status=status.HTTP_200_OK)
        
        return Response({
            'is_saved': True,
            'saves_count': post.post_saves.count()
        }, status=status.HTTP_201_CREATED)

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(post_id=self.kwargs['post_id'])

    def perform_create(self, serializer):
        post = get_object_or_404(Post, id=self.kwargs['post_id'])
        serializer.save(user=self.request.user, post=post)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]