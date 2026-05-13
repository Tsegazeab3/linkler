from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import CustomUser, Follow, Experience, PasswordResetToken, ExperienceReview, ProviderReview, Booking, TravelerProfile, VerificationDocument, Notification, GuideAvailability, Report, BlockedUser
from .serializers import (
    UserSerializer, ExperienceSerializer, 
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ExperienceReviewSerializer, ProviderReviewSerializer,
    BookingSerializer, TravelerProfileSerializer, VerificationDocumentSerializer, NotificationSerializer, GuideAvailabilitySerializer, ReportSerializer, BlockedUserSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

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
        # Handle update if user already reviewed this experience
        experience_id = request.data.get('experience')
        user = request.user
        
        existing = ExperienceReview.objects.filter(experience_id=experience_id, user=user).first()
        if existing:
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
        # Handle update if user already reviewed this provider
        provider_id = request.data.get('provider')
        user = request.user
        
        existing = ProviderReview.objects.filter(provider_id=provider_id, user=user).first()
        if existing:
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework.parsers import MultiPartParser, FormParser

class ExperienceListCreateView(generics.ListCreateAPIView):
    """
    View to list and create experiences.
    """
    serializer_class = ExperienceSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        queryset = Experience.objects.prefetch_related('images', 'reviews', 'bookings').all()
        my_services = self.request.query_params.get('my_services') == 'true'
        
        if my_services and self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)

        category = self.request.query_params.get('category', '')
        region = self.request.query_params.get('region', '')
        country = self.request.query_params.get('country', '')
        search = self.request.query_params.get('search', '')
        user_filter = self.request.query_params.get('user', '')
        listing_type = self.request.query_params.get('listing_type', '')

        if user_filter:
            queryset = queryset.filter(user__username=user_filter)
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)
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

class ExperienceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View to retrieve, update or delete an experience.
    """
    queryset = Experience.objects.prefetch_related('images', 'reviews', 'bookings').all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        # Only owners can update or delete
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return self.queryset.filter(user=self.request.user)
        return self.queryset

    def perform_update(self, serializer):
        experience = serializer.save()

        # Format expected: ['id:12', 'file:0', 'id:15', 'file:1']
        image_order = self.request.data.getlist('image_order')
        new_files = self.request.FILES.getlist('images')

        if image_order:
            kept_ids = []
            from .models import ExperienceImage
            for idx, item in enumerate(image_order):
                if item.startswith('id:'):
                    try:
                        img_id = int(item.split(':')[1])
                        ExperienceImage.objects.filter(id=img_id, experience=experience).update(order=idx)
                        kept_ids.append(img_id)
                    except (ValueError, IndexError):
                        continue
                elif item.startswith('file:'):
                    try:
                        file_idx = int(item.split(':')[1])
                        if file_idx < len(new_files):
                            ExperienceImage.objects.create(experience=experience, image=new_files[file_idx], order=idx)
                    except (ValueError, IndexError):
                        continue

            experience.images.exclude(id__in=kept_ids).delete()
        elif 'images' in self.request.FILES:
            experience.images.all().delete()
            from .models import ExperienceImage
            for idx, img in enumerate(new_files):
                ExperienceImage.objects.create(experience=experience, image=img, order=idx)


class GuideCountryListView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request):
        account_type = self.request.query_params.get('type', 'guide')
        countries = CustomUser.objects.filter(account_type=account_type).values_list('country', flat=True).distinct()
        countries = [c for c in countries if c]
        return Response(sorted(countries))

class GuideAvailabilityView(generics.GenericAPIView):
    serializer_class = GuideAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, username):
        provider = generics.get_object_or_404(CustomUser, username=username)
        
        # Manual availability (Blackouts)
        availability = GuideAvailability.objects.filter(user=provider)
        avail_serializer = self.get_serializer(availability, many=True)
        
        # Automated booked dates
        booked_dates = Booking.objects.filter(
            provider=provider,
            status__in=['confirmed', 'pending']
        ).values_list('booking_date', flat=True)

        return Response({
            "manual_availability": avail_serializer.data,
            "booked_dates": [d.strftime('%Y-%m-%d') for d in booked_dates]
        })

    def post(self, request, username):
        # Implementation of upsert logic
        date = request.data.get('date')
        is_available = request.data.get('is_available', False)
        reason = request.data.get('reason', '')
        
        availability, created = GuideAvailability.objects.update_or_create(
            user=request.user,
            date=date,
            defaults={'is_available': is_available, 'reason': reason}
        )
        
        serializer = self.get_serializer(availability)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

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
        user_to_follow = generics.get_object_or_404(CustomUser, username=username)

        if user_to_follow == request.user:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        follow, created = Follow.objects.get_or_create(follower=request.user, following=user_to_follow)

        if not created:
            return Response({"detail": "Already following."}, status=status.HTTP_200_OK)

        return Response({"detail": f"Now following {user_to_follow.username}"}, status=status.HTTP_201_CREATED)
class UnfollowUserView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        username = kwargs.get('username')
        Follow.objects.filter(follower=request.user, following__username=username).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class FollowersListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = generics.get_object_or_404(CustomUser, username=username)
        
        # Privacy Check: If the user hides their list, only they can see it
        if not user.show_followers_list and user != self.request.user:
            return CustomUser.objects.none()
            
        follower_ids = Follow.objects.filter(following=user).values_list('follower_id', flat=True)
        return CustomUser.objects.filter(id__in=follower_ids)

class FollowingListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs.get('username')
        user = generics.get_object_or_404(CustomUser, username=username)
        
        # Privacy Check
        if not user.show_followers_list and user != self.request.user:
            return CustomUser.objects.none()
            
        following_ids = Follow.objects.filter(follower=user).values_list('following_id', flat=True)
        return CustomUser.objects.filter(id__in=following_ids)

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

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset.select_related('user', 'provider', 'experience', 'source_post')
        if user.account_type in ['guide', 'service']:
            return qs.filter(provider=user)
        return qs.filter(user=user)

    def perform_create(self, serializer):
        booking = serializer.save(user=self.request.user)
        # Notify provider
        Notification.objects.create(
            user=booking.provider,
            type='booking_request',
            title='New Booking Request!',
            message=f'{booking.user.username} requested a booking for {booking.booking_date}.',
            link='/app/dashboard'
        )

    def perform_update(self, serializer):
        booking = serializer.save()
        # Notify traveler of status change
        if booking.status in ['confirmed', 'cancelled']:
            Notification.objects.create(
                user=booking.user,
                type=f'booking_{booking.status}',
                title=f'Booking {booking.status.capitalize()}',
                message=f'Your booking for {booking.booking_date} with {booking.provider.username} has been {booking.status}.',
                link='/app/bookings'
            )

class GuideDashboardStatsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.account_type not in ['guide', 'service']:
            return Response({"detail": "Not a provider."}, status=status.HTTP_403_FORBIDDEN)
        
        bookings = Booking.objects.filter(provider=user, status='confirmed')
        total_bookings = bookings.count()
        from django.db.models import Sum
        total_earnings = bookings.aggregate(Sum('price'))['price__sum'] or 0.00
        
        return Response({
            "total_bookings": total_bookings,
            "total_earnings": total_earnings,
            "currency": "USD" # Could be dynamic
        })

class TravelerOnboardingView(generics.UpdateAPIView, generics.CreateAPIView):
    serializer_class = TravelerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = TravelerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        self._mark_complete()

    def perform_update(self, serializer):
        serializer.save()
        self._mark_complete()

    def _mark_complete(self):
        user = self.request.user
        user.onboarding_completed = True
        user.save()

    def post(self, request, *args, **kwargs):
        # Handle POST as an update if profile already exists
        if TravelerProfile.objects.filter(user=request.user).exists():
            return self.update(request, *args, **kwargs)
        return self.create(request, *args, **kwargs)

class VerificationDocumentUploadView(generics.CreateAPIView):
    serializer_class = VerificationDocumentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # Note: verification_status remains 'pending' until an admin reviews

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

class BlockedUserViewSet(viewsets.ModelViewSet):
    queryset = BlockedUser.objects.all()
    serializer_class = BlockedUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(blocker=self.request.user)

    def perform_create(self, serializer):
        serializer.save(blocker=self.request.user)
