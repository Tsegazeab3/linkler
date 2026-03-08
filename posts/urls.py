from django.urls import path
from .views import PostCreateView, PostListView, PostUpdateView, TripListCreateView, CommentCreateView, PostDetailView, LikeToggleView

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('create/', PostCreateView.as_view(), name='post-create'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:pk>/edit/', PostUpdateView.as_view(), name='post-update'),
    path('<int:pk>/like/', LikeToggleView.as_view(), name='post-like'),
    path('trips/', TripListCreateView.as_view(), name='trip-list-create'),
    path('comments/', CommentCreateView.as_view(), name='comment-create'),
]
