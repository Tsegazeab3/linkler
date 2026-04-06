from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import CustomUser, Follow, Experience, PasswordResetToken
from .serializers import (
    UserSerializer, ExperienceSerializer, 
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)

from rest_framework.parsers import MultiPartParser, FormParser

class ExperienceListCreateView(generics.ListCreateAPIView):
    """
    View to list and create experiences.
    """
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProfileUpdateView(generics.RetrieveUpdateAPIView):
    """
    View to update the user's profile.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

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
        
        queryset = CustomUser.objects.filter(account_type=account_type)
        
        if search_query:
            queryset = queryset.filter(
                Q(username__icontains=search_query) |
                Q(bio__icontains=search_query) |
                Q(city__icontains=search_query) |
                Q(country__icontains=search_query)
            )
            
        if category:
            # Assuming 'category' might be a field we want to filter on in the future
            # For now, let's just filter by nationality if it matches for demo
            queryset = queryset.filter(nationality__icontains=category)
            
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
    queryset = CustomUser.objects.all()
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
                Q(username__icontains=query) | 
                Q(email__icontains=query) |
                Q(bio__icontains=query)
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
        
        print(f"DEBUG: Password reset requested for email: '{email}'")
        
        # Use __iexact for case-insensitive matching
        user = CustomUser.objects.filter(email__iexact=email).first()
        
        if not user:
            print(f"DEBUG: No user found with email: '{email}'")
        else:
            print(f"DEBUG: User found: {user.username}. Generating token...")
            token = secrets.token_urlsafe(32)
            hashed_token = hashlib.sha256(token.encode()).hexdigest()
            expires_at = timezone.now() + timedelta(minutes=30)
            
            PasswordResetToken.objects.create(
                user=user,
                hashed_token=hashed_token,
                expires_at=expires_at
            )
            
            # Simulate email sending
            reset_link = f"http://localhost:5173/reset-password?token={token}"
            print("\n" + "="*50)
            print(f"LOCAL EMAIL SIMULATION")
            print(f"To: {email}")
            print(f"Subject: Password Reset Request")
            print(f"Body: Click the link to reset your password: {reset_link}")
            print("="*50 + "\n")
            
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
