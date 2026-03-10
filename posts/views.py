from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import PostSerializer, TripSerializer, CommentSerializer
from .models import Post, Trip, Comment, Like

from rest_framework import permissions
from django.shortcuts import get_object_or_404

class LikeToggleView(APIView):
    """
    API view to toggle a 'like' on a post.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        post = get_object_or_404(Post, pk=pk)
        like_qs = Like.objects.filter(post=post, user=request.user)
        
        if like_qs.exists():
            # Already liked, so unlike it
            like_qs.delete()
            return Response({'status': 'unliked'}, status=status.HTTP_200_OK)
        else:
            # Not liked yet, so like it
            Like.objects.create(post=post, user=request.user)
            return Response({'status': 'liked'}, status=status.HTTP_201_CREATED)

class CommentCreateView(generics.CreateAPIView):
    """
    API view for creating a new Comment.
    """
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class IsAuthor(permissions.BasePermission):
    """
    Custom permission to only allow authors of a post to edit it.
    """
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

class PostDetailView(generics.RetrieveAPIView):
    """
    API view for retrieving a single Post.
    """
    queryset = Post.objects.filter(status='published')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class PostUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for updating and deleting a Post.
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated, IsAuthor]
    parser_classes = (MultiPartParser, FormParser)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

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
        serializer = PostSerializer(data=request.data, context={'request': request})
        
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

class PostDetailView(generics.RetrieveAPIView):
    queryset = Post.objects.filter(status='published')
    serializer_class = PostSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'post_id'

class TripListCreateView(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]