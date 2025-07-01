from django.urls import path, include
from .views import login_user, check_user_exists, logout_user, profile, create_playlist, view_playlist, all_playlists, register_user
from .views import SongListAPIView, PlaylistListAPIView, UserProfileAPIView
from rest_framework.routers import DefaultRouter
from .views import SongViewSet, SongUploadAPIView
from django.conf import settings
from django.conf.urls.static import static


router = DefaultRouter()
router.register(r'songs', SongViewSet)

urlpatterns = [
    path('api/login/', login_user, name='login_user'),
    path('api/check-user/', check_user_exists, name='check_user_exists'),
    path('api/register/', register_user, name='register_user'),
    path('logout/', logout_user, name='logout_user'),

    path('profile/', profile, name='profile'),
    path('playlists/create/', create_playlist, name='create_playlist'),
    path('playlists/<int:pk>/', view_playlist, name='view_playlist'),
    path('playlists/', all_playlists, name='all_playlists'),

    path('api/songs/', SongListAPIView.as_view(), name='api_songs'),
    path('api/userprofiles/', UserProfileAPIView.as_view(), name='api_userprofiles'),
    path('api/song-upload/', SongUploadAPIView.as_view(), name='song_upload'),
    path('api/playlists/', PlaylistListAPIView.as_view(), name='playlist-list'),
    path('api/', include(router.urls)),

]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)