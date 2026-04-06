from django.urls import path
from .views import (
    ProfileUpdateView, GuideListView, FollowUserView, UnfollowUserView, 
    UserDetailView, UserSearchView, ExperienceListCreateView,
    PasswordResetRequestView, PasswordResetConfirmView
)

urlpatterns = [
    path('profile/', ProfileUpdateView.as_view(), name='profile-update'),
    path('guides/', GuideListView.as_view(), name='guide-list'),
    path('experiences/', ExperienceListCreateView.as_view(), name='experience-list'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('<str:username>/', UserDetailView.as_view(), name='user-detail'),
    path('<str:username>/follow/', FollowUserView.as_view(), name='follow-user'),
    path('<str:username>/unfollow/', UnfollowUserView.as_view(), name='unfollow-user'),
]
