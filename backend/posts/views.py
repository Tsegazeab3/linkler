from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import PostSerializer, TripSerializer, CommentSerializer
from .models import Post, Trip, Like, Save, Comment, PostImage
from django.shortcuts import get_object_or_404
from django.db import models
from django.db.models import Q

class PostCreateView(APIView):
    """
    API view for creating a new Post.
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = PostSerializer(data=request.data)
        
        if serializer.is_valid():
            post = serializer.save(user=request.user)
            
            images = request.FILES.getlist('images')
            for img in images:
                PostImage.objects.create(post=post, image=img)
            
            post = Post.objects.prefetch_related('images', 'post_comments', 'post_likes', 'post_saves').get(id=post.id)
            return Response(PostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        my_posts = self.request.query_params.get('my_posts') == 'true'
        
        qs = Post.objects.prefetch_related(
            'images', 'post_comments', 'post_likes', 'post_saves', 
            'generated_bookings', 'generated_bookings__user'
        )
        
        if my_posts and user.is_authenticated:
            return qs.filter(user=user)
            
        # Standard Feed Logic
        if user.is_authenticated:
            qs = qs.filter(
                Q(audience='public') |
                Q(user=user) |
                Q(audience='followers', user__followers__follower=user) |
                Q(audience='friends', user__followers__follower=user, user__following__following=user)
            )
        else:
            qs = qs.filter(audience='public')

        # Additional filtering
        country = self.request.query_params.get('country', '')
        region = self.request.query_params.get('region', '')
        category = self.request.query_params.get('category', '')
        search = self.request.query_params.get('search', '')

        if country:
            qs = qs.filter(country__icontains=country)
        if region:
            qs = qs.filter(region=region)
        if category:
            qs = qs.filter(caption__icontains=category)
        if search:
            qs = qs.filter(
                Q(caption__icontains=search) |
                Q(country__icontains=search) |
                Q(region__icontains=search) |
                Q(user__username__icontains=search)
            )

        return qs.filter(status='published').distinct()

class PostDetailView(generics.RetrieveAPIView):
    serializer_class = PostSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = 'post_id'

    def get_queryset(self):
        user = self.request.user
        qs = Post.objects.prefetch_related(
            'images', 'post_comments', 'post_likes', 'post_saves',
            'generated_bookings', 'generated_bookings__user'
        )
        
        if user.is_authenticated:
            return qs.filter(
                Q(audience='public') |
                Q(user=user) |
                Q(audience='followers', user__followers__follower=user) |
                Q(audience='friends', user__followers__follower=user, user__following__following=user)
            ).distinct()
        return qs.filter(audience='public', status='published')

class PostUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'post_id'
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return Post.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        post = serializer.save()
        
        # Get the desired order from request data
        # Format expected: ['id:12', 'file:0', 'id:15', 'file:1']
        image_order = self.request.data.getlist('image_order')
        new_files = self.request.FILES.getlist('images')
        
        if image_order:
            # 1. Identify which existing images to keep and update their order
            kept_ids = []
            for idx, item in enumerate(image_order):
                if item.startswith('id:'):
                    try:
                        img_id = int(item.split(':')[1])
                        PostImage.objects.filter(id=img_id, post=post).update(order=idx)
                        kept_ids.append(img_id)
                    except (ValueError, IndexError):
                        continue
                elif item.startswith('file:'):
                    try:
                        file_idx = int(item.split(':')[1])
                        if file_idx < len(new_files):
                            PostImage.objects.create(post=post, image=new_files[file_idx], order=idx)
                    except (ValueError, IndexError):
                        continue
            
            # 2. Delete existing images that were NOT in the image_order list
            post.images.exclude(id__in=kept_ids).delete()
        elif 'images' in self.request.FILES:
            # Fallback to old behavior if no image_order provided: replace all
            post.images.all().delete()
            for idx, img in enumerate(new_files):
                PostImage.objects.create(post=post, image=img, order=idx)

class PostBatchDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        post_ids = request.data.get('post_ids', [])
        if not isinstance(post_ids, list):
            return Response({"detail": "post_ids must be a list."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Only delete posts owned by the user
        deleted_count, _ = Post.objects.filter(id__in=post_ids, user=request.user).delete()
        
        return Response({
            "detail": f"Successfully deleted {deleted_count} posts.",
            "deleted_count": deleted_count
        }, status=status.HTTP_200_OK)

class TripListCreateView(generics.ListCreateAPIView):
    serializer_class = TripSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = Trip.objects.all().select_related('user')
        
        country = self.request.query_params.get('destination_country', '')
        origin = self.request.query_params.get('origin', '')
        destination = self.request.query_params.get('destination', '')
        category = self.request.query_params.get('category', '')
        search = self.request.query_params.get('search', '')
        username = self.request.query_params.get('user', '')

        if username:
            qs = qs.filter(user__username=username)
        if country:
            qs = qs.filter(destination_country__icontains=country)
        if origin:
            qs = qs.filter(origin__icontains=origin)
        if destination:
            qs = qs.filter(destination__icontains=destination)
        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(
                Q(message__icontains=search) |
                Q(origin__icontains=search) |
                Q(destination__icontains=search) |
                Q(user__username__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TripCategoryListView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response([cat[0] for cat in Trip.TRIP_CATEGORIES])

class TripRegionListView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response([reg[0] for reg in Trip.REGION_CHOICES])

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Comment.objects.filter(post_id=post_id)

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        post = get_object_or_404(Post, id=post_id)
        serializer.save(user=self.request.user, post=post)

class LikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            like.delete()
            is_liked = False
        else:
            is_liked = True
            
        return Response({
            'is_liked': is_liked,
            'likes_count': post.post_likes.count()
        })

class SaveToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        save, created = Save.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            save.delete()
            is_saved = False
        else:
            is_saved = True
            
        return Response({
            'is_saved': is_saved,
            'saves_count': post.post_saves.count()
        })
