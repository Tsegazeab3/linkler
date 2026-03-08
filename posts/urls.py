from django.urls import path
from .views import PostCreateView, PostListView, PostUpdateView, TripListCreateView

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('create/', PostCreateView.as_view(), name='post-create'),
    path('<int:pk>/', PostUpdateView.as_view(), name='post-update'),
    path('trips/', TripListCreateView.as_view(), name='trip-list-create'),
]
