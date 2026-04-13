from django.urls import path
from .views import (
    ProfileUpdateView, GuideListView, GuideCountryListView, 
    FollowUserView, UnfollowUserView, 
    UserDetailView, UserSearchView, ExperienceListCreateView,
    ExperienceCategoryListView, ExperienceRegionListView,
    PasswordResetRequestView, PasswordResetConfirmView
)

urlpatterns = [
    path('profile/', ProfileUpdateView.as_view(), name='profile-update'),
    path('guides/', GuideListView.as_view(), name='guide-list'),
    path('guides/countries/', GuideCountryListView.as_view(), name='guide-countries'),
    path('experiences/', ExperienceListCreateView.as_view(), name='experience-list'),
    path('experiences/categories/', ExperienceCategoryListView.as_view(), name='experience-categories'),
    path('experiences/regions/', ExperienceRegionListView.as_view(), name='experience-regions'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('<str:username>/', UserDetailView.as_view(), name='user-detail'),
    path('<str:username>/follow/', FollowUserView.as_view(), name='follow-user'),
    path('<str:username>/unfollow/', UnfollowUserView.as_view(), name='unfollow-user'),
]
