from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import CustomUser, Follow, Experience, PasswordResetToken, ExperienceReview, ProviderReview
from .serializers import (
    UserSerializer, ExperienceSerializer, 
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ExperienceReviewSerializer, ProviderReviewSerializer
)

class ExperienceReviewViewSet(viewsets.ModelViewSet):
    queryset = ExperienceReview.objects.all()
    serializer_class = ExperienceReviewSerializer

    def get_queryset(self):
        experience_id = self.request.query_params.get('experience_id') or self.request.query_params.get('experience')
        if experience_id:
            return self.queryset.filter(experience_id=experience_id)
        return self.queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        experience_id = request.data.get('experience')
        user = request.user
        
        # Handle update if already exists
        existing = ExperienceReview.objects.filter(experience_id=experience_id, user=user).first()
        if existing:
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        experience_id = self.request.data.get('experience')
        serializer.save(user=self.request.user, experience_id=experience_id)

class ProviderReviewViewSet(viewsets.ModelViewSet):
    queryset = ProviderReview.objects.all()
    serializer_class = ProviderReviewSerializer

    def get_queryset(self):
        provider_id = self.request.query_params.get('provider_id') or self.request.query_params.get('provider')
        if provider_id:
            return self.queryset.filter(provider_id=provider_id)
        return self.queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        provider_id = request.data.get('provider')
        user = request.user
        
        # Handle update if already exists
        existing = ProviderReview.objects.filter(provider_id=provider_id, user=user).first()
        if existing:
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        provider_id = self.request.data.get('provider')
        serializer.save(user=self.request.user, provider_id=provider_id)

from rest_framework.parsers import MultiPartParser, FormParser

class ExperienceListCreateView(generics.ListCreateAPIView):
    """
    View to list and create experiences.
    """
    serializer_class = ExperienceSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        queryset = Experience.objects.all()
        category = self.request.query_params.get('category', '')
        region = self.request.query_params.get('region', '')
        country = self.request.query_params.get('country', '')
        search = self.request.query_params.get('search', '')
        user_filter = self.request.query_params.get('user', '')

        if user_filter:
            queryset = queryset.filter(user__username=user_filter)
        if category:
            queryset = queryset.filter(category=category)
        if region:
            queryset = queryset.filter(region=region)
        if country:
            queryset = queryset.filter(country__icontains=country)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search) |
                Q(country__icontains=search)
            )
        return queryset

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExperienceCategoryListView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request):
        categories = [cat[0] for cat in Experience.EXPERIENCE_CATEGORIES]
        return Response(categories)

class ExperienceRegionListView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request):
        regions = [reg[0] for reg in Experience.REGION_CHOICES]
        return Response(regions)

class GuideCountryListView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request):
        account_type = self.request.query_params.get('type', 'guide')
        countries = CustomUser.objects.filter(account_type=account_type).values_list('country', flat=True).distinct()
        countries = [c for c in countries if c]
        return Response(sorted(countries))

class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    """
    View to update the user's profile.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return CustomUser.objects.prefetch_related(
            'posts', 'posts__images', 'posts__post_comments', 'posts__post_likes', 'posts__post_saves'
        ).get(id=self.request.user.id)

class GuideListView(generics.ListAPIView):
    """
    View to list all guides and services with filtering.
    """
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        account_type = self.request.query_params.get('type', 'guide')
        search_query = self.request.query_params.get('search', '')
        category = self.request.query_params.get('category', '')
        country = self.request.query_params.get('country', '')
        region = self.request.query_params.get('region', '')
        
        queryset = CustomUser.objects.filter(account_type=account_type, opt_out_discovery=False)
        
        if search_query:
            queryset = queryset.filter(
                Q(username__icontains=search_query) |
                Q(bio__icontains=search_query) |
                Q(city__icontains=search_query) |
                Q(country__icontains=search_query)
            )
            
        if category:
            # First try country, then nationality
            queryset = queryset.filter(Q(country__icontains=category) | Q(nationality__icontains=category))

        if country:
            queryset = queryset.filter(country__icontains=country)
            
        if region:
            # We don't have a region field on User yet, but we could add one or filter city
            queryset = queryset.filter(city__icontains=region)
            
        return queryset

class FollowUserView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        username = kwargs.get('username')
        user_to_follow = CustomUser.objects.get(username=username)
        if user_to_follow == request.user:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)
        
        follow, created = Follow.objects.get_or_create(follower=request.user, following=user_to_follow)
        if not created:
            return Response({"detail": "Already following."}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"detail": f"Now following {user_to_follow.username}"}, status=status.HTTP_201_CREATED)

class UnfollowUserView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        username = kwargs.get('username')
        Follow.objects.filter(follower=request.user, following__username=username).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserDetailView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all().prefetch_related(
        'posts', 'posts__images', 'posts__post_comments', 'posts__post_likes', 'posts__post_saves'
    )
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    lookup_field = 'username'
    lookup_url_kwarg = 'username'

class UserSearchView(generics.ListAPIView):
    """
    View to search users by username, email, or bio.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return CustomUser.objects.filter(
                (Q(username__icontains=query) | 
                 Q(email__icontains=query) |
                 Q(bio__icontains=query)),
                opt_out_discovery=False
            ).order_by('username')[:20]
        return CustomUser.objects.none()

import secrets
import hashlib
from datetime import timedelta
from django.utils import timezone

class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        
        # Use __iexact for case-insensitive matching
        user = CustomUser.objects.filter(email__iexact=email).first()
        
        if user:
            token = secrets.token_urlsafe(32)
            hashed_token = hashlib.sha256(token.encode()).hexdigest()
            expires_at = timezone.now() + timedelta(minutes=30)
            
            PasswordResetToken.objects.create(
                user=user,
                hashed_token=hashed_token,
                expires_at=expires_at
            )
            
            # In a real app, send email here
            # reset_link = f"http://localhost:5173/reset-password?token={token}"
            
        return Response(
            {"detail": "If an account exists with this email, you will receive a reset link shortly."},
            status=status.HTTP_200_OK
        )

class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        hashed_token = hashlib.sha256(token.encode()).hexdigest()
        reset_token = PasswordResetToken.objects.filter(hashed_token=hashed_token).first()
        
        if not reset_token or not reset_token.is_valid():
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        # Invalidate the token
        reset_token.is_used = True
        reset_token.save()
        
        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK
        )
