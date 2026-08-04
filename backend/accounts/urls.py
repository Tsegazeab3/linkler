from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfileUpdateView, GuideListView, FollowUserView, 
    UnfollowUserView, FollowersListView, FollowingListView, UserDetailView, UserSearchView,
    PasswordResetRequestView, PasswordResetConfirmView,
    ExperienceListCreateView, ExperienceCategoryListView,
    ExperienceRegionListView, GuideCountryListView, ExperienceDetailView,
    ExperienceReviewViewSet, ProviderReviewViewSet,
    BookingViewSet, GuideDashboardStatsView, GuideAvailabilityView,
    TravelerOnboardingView, VerificationDocumentUploadView, NotificationViewSet
)

router = DefaultRouter()
router.register('experience-reviews', ExperienceReviewViewSet)
router.register('provider-reviews', ProviderReviewViewSet)
router.register('bookings', BookingViewSet)
router.register('notifications', NotificationViewSet)

urlpatterns = [
    path('availability-manage/<str:username>/', GuideAvailabilityView.as_view(), name='guide-availability'),
    path('availability-manage/<str:username>', GuideAvailabilityView.as_view(), name='guide-availability-no-slash'),
    path('', include(router.urls)),
    path('profile/', ProfileUpdateView.as_view(), name='profile-update'),
    path('guides/', GuideListView.as_view(), name='guide-list'),
    path('guides/countries/', GuideCountryListView.as_view(), name='guide-country-list'),
    path('experiences/', ExperienceListCreateView.as_view(), name='experience-list'),
    path('experiences/<int:pk>/', ExperienceDetailView.as_view(), name='experience-detail'),
    path('experiences/categories/', ExperienceCategoryListView.as_view(), name='experience-category-list'),
    path('experiences/regions/', ExperienceRegionListView.as_view(), name='experience-region-list'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('onboarding/', TravelerOnboardingView.as_view(), name='traveler-onboarding'),
    path('verification/upload/', VerificationDocumentUploadView.as_view(), name='guide-verification-upload'),
    path('dashboard/stats/', GuideDashboardStatsView.as_view(), name='guide-dashboard-stats'),
    path('<str:username>/', UserDetailView.as_view(), name='user-detail'),
    path('<str:username>/follow/', FollowUserView.as_view(), name='follow-user'),
    path('<str:username>/unfollow/', UnfollowUserView.as_view(), name='unfollow-user'),
    path('<str:username>/followers/', FollowersListView.as_view(), name='user-followers'),
    path('<str:username>/following/', FollowingListView.as_view(), name='user-following'),
]

