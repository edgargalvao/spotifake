from django.urls import path, include
from .views import login_user, check_user_exists, logout_user, profile, create_playlist, view_playlist, all_playlists, register_user
from .views import SongListAPIView, PlaylistListAPIView, UserProfileAPIView, UserListAPIView
from rest_framework.routers import DefaultRouter
from .views import SongViewSet, SongUploadAPIView, PlaylistFeedView, delete_playlist, create_playlist_api, update_playlist
from .views import follow_user, unfollow_user, FollowingPlaylistsView
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
    path('api/feed/playlists/<int:user_id>/', PlaylistFeedView.as_view(), name='playlist-feed'),
    path('api/playlists/<int:pk>/delete/', delete_playlist, name='delete-playlist'),
    path('api/playlists/create/', create_playlist_api, name='create-playlist-api'),
    path('api/playlists/<int:pk>/update/', update_playlist, name='update_playlist'),

    # URLs para funcionalidade de seguir
    path('api/users/', UserListAPIView.as_view(), name='user-list'),
    path('api/follow/', follow_user, name='follow-user'),
    path('api/unfollow/', unfollow_user, name='unfollow-user'),
    path('api/following/playlists/<int:user_id>/', FollowingPlaylistsView.as_view(), name='following-playlists'),

    path('api/', include(router.urls)),

]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)