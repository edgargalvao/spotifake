from django.urls import path, include
from .views import login_user, check_user_exists, logout_user, profile, create_playlist, view_playlist, all_playlists
from .views import SongListAPIView, PlaylistListAPIView, UserProfileAPIView
from rest_framework.routers import DefaultRouter
from .views import SongViewSet

router = DefaultRouter()
router.register(r'songs', SongViewSet)

urlpatterns = [
    path('api/login/', login_user, name='login_user'),
    path('api/check-user/', check_user_exists, name='check_user_exists'),
    path('logout/', logout_user, name='logout_user'),

    path('profile/', profile, name='profile'),
    path('playlists/create/', create_playlist, name='create_playlist'),
    path('playlists/<int:pk>/', view_playlist, name='view_playlist'),
    path('playlists/', all_playlists, name='all_playlists'),

    path('api/songs/', SongListAPIView.as_view(), name='api_songs'),
    path('api/playlists/', PlaylistListAPIView.as_view(), name='api_playlists'),
    path('api/userprofiles/', UserProfileAPIView.as_view(), name='api_userprofiles'),
    path('api/', include(router.urls)),
]
