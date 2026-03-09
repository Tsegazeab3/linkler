from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q
from .models import CustomUser, Follow
from .serializers import UserSerializer

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
    View to list all guides.
    """
    queryset = CustomUser.objects.filter(account_type='guide')
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class FollowUserView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user_to_follow_id = kwargs.get('user_id')
        user_to_follow = CustomUser.objects.get(id=user_to_follow_id)
        if user_to_follow == request.user:
            return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)
        
        follow, created = Follow.objects.get_or_create(follower=request.user, following=user_to_follow)
        if not created:
            return Response({"detail": "Already following."}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"detail": f"Now following {user_to_follow.username}"}, status=status.HTTP_201_CREATED)

class UnfollowUserView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        user_to_unfollow_id = kwargs.get('user_id')
        Follow.objects.filter(follower=request.user, following_id=user_to_unfollow_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserDetailView(generics.RetrieveAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'

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