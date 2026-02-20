from django.urls import path
from .views import PromotionListView, PromotionDetailView

urlpatterns = [
    path('', PromotionListView.as_view(), name='promotion-list'),
    path('<int:pk>/', PromotionDetailView.as_view(), name='promotion-detail'),
]
