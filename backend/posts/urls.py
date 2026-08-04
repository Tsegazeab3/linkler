from django.urls import path
from .views import (
    PostCreateView, PostListView, PostDetailView, PostUpdateDeleteView,
    PostBatchDeleteView, TripListCreateView, TripCategoryListView, 
    TripRegionListView, LikeToggleView, SaveToggleView, CommentListCreateView
)

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('create/', PostCreateView.as_view(), name='post-create'),
    path('batch-delete/', PostBatchDeleteView.as_view(), name='post-batch-delete'),
    path('<int:post_id>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:post_id>/edit/', PostUpdateDeleteView.as_view(), name='post-update-delete'),
    path('<int:post_id>/like/', LikeToggleView.as_view(), name='post-like'),
    path('<int:post_id>/save/', SaveToggleView.as_view(), name='post-save'),
    path('<int:post_id>/comments/', CommentListCreateView.as_view(), name='post-comments'),
    path('trips/', TripListCreateView.as_view(), name='trip-list-create'),
    path('trips/categories/', TripCategoryListView.as_view(), name='trip-categories'),
    path('trips/regions/', TripRegionListView.as_view(), name='trip-regions'),
]
