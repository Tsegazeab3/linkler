from django.urls import path
from .views import ProfileUpdateView, GuideListView, FollowUserView, UnfollowUserView, UserDetailView, UserSearchView

urlpatterns = [
    path('profile/', ProfileUpdateView.as_view(), name='profile-update'),
    path('guides/', GuideListView.as_view(), name='guide-list'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('<int:user_id>/', UserDetailView.as_view(), name='user-detail'),
    path('<int:user_id>/follow/', FollowUserView.as_view(), name='follow-user'),
    path('<int:user_id>/unfollow/', UnfollowUserView.as_view(), name='unfollow-user'),
]
