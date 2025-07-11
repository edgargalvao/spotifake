from django.shortcuts import render, redirect
from .models import Playlist, Song, UserProfile, UserFollow
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from random import choice
from rest_framework import generics, permissions,viewsets
from .serializers import UserProfileSerializer, SongSerializer, PlaylistSerializer, UserListSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Prefetch, Q
from .serializers import PlaylistFeedSerializer
from django.views.decorators.http import require_http_methods


# API Views para React consumir
class SongListAPIView(generics.ListAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class UserProfileAPIView(generics.ListAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]

# Logout simples (usado no backend tradicional)
def logout_user(request):
    logout(request)
    return render(request, 'main/login_user.html', {'message': 'You have been logged out.'})

@login_required
def profile(request):
    user = request.user
    return render(request, 'main/profile.html', {'user': user})

def create_playlist(request):
    if request.method == "POST":
        name_playlist = request.POST.get("name-playlist")
        if request.user.is_authenticated:
            Playlist.objects.create(name=name_playlist, user=request.user)
            return redirect("index")
        else:
            return redirect('index')
    return render(request, 'main/create_playlist.html')

def view_playlist(request, pk):
    if request.user.is_authenticated:
        playlist = Playlist.objects.get(id=pk, user=request.user)
        play_song_id = request.GET.get('play', None)
        shuffle = request.GET.get('shuffle', 'false') == 'true'
        play_song = None
        next_song = None

        playlist_list = list(playlist.song.all())

        if play_song_id:
            play_song = Song.objects.get(id=play_song_id)

        if shuffle and playlist_list:
            possible_songs = [s for s in playlist_list if s != play_song]
            if possible_songs:
                next_song = choice(possible_songs)
        else:
            if play_song in playlist_list:
                current_index = playlist_list.index(play_song)
                loop_playlist = (current_index + 1) % len(playlist_list)
                next_song = playlist_list[loop_playlist]

        return render(request, 'main/view_playlist.html', {
            "playlist": playlist,
            "next_song": next_song,
            "play_song": play_song,
            "shuffle": shuffle
        })
    else:
        return redirect('index')

def all_playlists(request):
    if request.user.is_authenticated:
        playlists = Playlist.objects.filter(user=request.user)
        return render(request, 'main/all_playlists.html', {"playlists": playlists})
    else:
        return redirect('index')

# API para o React verificar se o usuário existe (POST)
@csrf_exempt
def check_user_exists(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        exists = User.objects.filter(username=username).exists()
        return JsonResponse({'exists': exists})
    return JsonResponse({'error': 'Método não permitido.'}, status=405)

# API para login via React (POST)
@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                # Modificação: Retorne os dados do usuário
                return JsonResponse({
                    'message': 'Login bem-sucedido.',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                        # Adicione outros campos se necessário
                    }
                }, status=200)
            else:
                return JsonResponse({'error': 'Usuário ou senha inválidos.'}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'JSON inválido.'}, status=400)
    
    return JsonResponse({'error': 'Método não permitido.'}, status=405)
@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        try:
            if request.content_type == 'application/json':
                data = json.loads(request.body)
                username = data.get('username')
                email = data.get('email')
                password = data.get('password')
                name = data.get('name')
                icon_image = None  # Não suporta upload de arquivo via JSON
            else:
                username = request.POST.get('username')
                email = request.POST.get('email')
                password = request.POST.get('password')
                name = request.POST.get('name')
                icon_image = request.FILES.get('icon_image')

            if not all([username, email, password, name]):
                return JsonResponse({'error': 'Todos os campos obrigatórios.'}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()

            user_profile = UserProfile(user=user, name=name)
            if icon_image:
                user_profile.icon_image = icon_image
            user_profile.save()

            return JsonResponse({'message': 'Usuário registrado com sucesso.'}, status=201)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método não permitido.'}, status=405)

class SongViewSet(viewsets.ModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class SongUploadAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, format=None):
        print('POST DATA:', request.data)
        serializer = SongSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print('ERRORS:', serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlaylistListAPIView(generics.ListAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.request.GET.get('userId', None)
        print(f"DEBUG: Received userId: {user_id}")  # Print simples para debug
        
        if user_id is not None:
            try:
                # Verifica se o usuário existe
                user = User.objects.get(id=user_id)
                print(f"DEBUG: User found: {user.username}")
                
                # Busca as playlists do usuário com prefetch para otimizar
                playlists = Playlist.objects.filter(user__id=user_id).prefetch_related('song')
                print(f"DEBUG: Found {playlists.count()} playlists for user {user_id}")
                
                # Debug: mostra as playlists encontradas
                for playlist in playlists:
                    print(f"DEBUG: Playlist: {playlist.name} - Songs: {playlist.song.count()}")
                
                return playlists
            except User.DoesNotExist:
                print(f"ERROR: User with id {user_id} does not exist")
                return Playlist.objects.none()
            except Exception as e:
                print(f"ERROR: Error in get_queryset: {str(e)}")
                return Playlist.objects.none()
        
        print("DEBUG: No userId provided")
        return Playlist.objects.none()

    def get(self, request, *args, **kwargs):
        user_id = request.GET.get('userId', None)
        
        if not user_id:
            return JsonResponse({
                'error': 'userId é obrigatório',
                'message': 'Forneça o parâmetro userId na URL'
            }, status=400)
        
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            
            return JsonResponse({
                'success': True,
                'count': len(serializer.data),
                'userId': user_id,
                'playlists': serializer.data
            }, safe=False)
            
        except Exception as e:
            return JsonResponse({
                'error': str(e),
                'success': False
            }, status=500)

class PlaylistFeedView(generics.ListAPIView):
    serializer_class = PlaylistFeedSerializer
    
    def get_queryset(self):
        # Pega o userId da URL
        user_id = self.kwargs.get('user_id')
        
        # Pega todas as playlists exceto as do usuário especificado
        return Playlist.objects.filter(
            ~Q(user_id=user_id)
        ).prefetch_related(
            Prefetch('song', queryset=Song.objects.all()),
            'user__userprofile'
        ).select_related('user').order_by('-id')

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_playlist(request, pk):  # <-- Aqui muda para 'pk'
    try:
        playlist = Playlist.objects.get(id=pk)
        playlist.delete()
        return JsonResponse({'success': True, 'message': 'Playlist excluída com sucesso.'}, status=200)
    except Playlist.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Playlist não encontrada.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_playlist(request, pk):
    try:
        data = json.loads(request.body)
        name = data.get('name')
        user_id = data.get('user_id')
        song_ids = data.get('song_ids', [])

        if not name or not user_id:
            return JsonResponse({'success': False, 'error': 'Nome e usuário são obrigatórios.'}, status=400)

        playlist = Playlist.objects.get(id=pk)
        user = User.objects.get(id=user_id)

        playlist.name = name
        playlist.user = user
        playlist.save()

        playlist.song.set(Song.objects.filter(id__in=song_ids))

        return JsonResponse({'success': True, 'message': 'Playlist atualizada com sucesso.'})
    except Playlist.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Playlist não encontrada.'}, status=404)
    except User.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Usuário não encontrado.'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
@csrf_exempt
def create_playlist_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    
    try:
        data = json.loads(request.body)

        name = data.get('name')         # campo correto: name
        user_id = data.get('user_id')   # campo correto: user
        song_ids = data.get('song_ids', [])  # campo correto: song (lista de IDs)

        if not name:
            return JsonResponse({'success': False, 'error': 'Nome da playlist é obrigatório.'}, status=400)
        if not user_id:
            return JsonResponse({'success': False, 'error': 'ID do usuário é obrigatório.'}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Usuário não encontrado.'}, status=404)

        # Criação da playlist
        playlist = Playlist.objects.create(name=name, user=user)
        playlist.song.set(Song.objects.filter(id__in=song_ids))
        playlist.save()

        return JsonResponse({'success': True, 'playlist_id': playlist.id})
    
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

# API Views para funcionalidade de seguir usuários
class UserListAPIView(generics.ListAPIView):
    serializer_class = UserListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        current_user_id = self.request.GET.get('current_user_id')
        if current_user_id:
            # Exclui o próprio usuário da lista
            return User.objects.exclude(id=current_user_id).select_related('userprofile')
        return User.objects.all().select_related('userprofile')

@csrf_exempt
def follow_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        follower_id = data.get('follower_id')
        following_id = data.get('following_id')

        if not follower_id or not following_id:
            return JsonResponse({'error': 'IDs de usuários são obrigatórios'}, status=400)

        if follower_id == following_id:
            return JsonResponse({'error': 'Usuário não pode seguir a si mesmo'}, status=400)

        try:
            follower = User.objects.get(id=follower_id)
            following = User.objects.get(id=following_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado'}, status=404)

        # Verifica se já está seguindo
        if UserFollow.objects.filter(follower=follower, following=following).exists():
            return JsonResponse({'error': 'Usuário já está sendo seguido'}, status=400)

        # Cria o relacionamento
        UserFollow.objects.create(follower=follower, following=following)
        
        return JsonResponse({'success': True, 'message': 'Usuário seguido com sucesso'})
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def unfollow_user(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    
    try:
        data = json.loads(request.body)
        follower_id = data.get('follower_id')
        following_id = data.get('following_id')

        if not follower_id or not following_id:
            return JsonResponse({'error': 'IDs de usuários são obrigatórios'}, status=400)

        try:
            follower = User.objects.get(id=follower_id)
            following = User.objects.get(id=following_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado'}, status=404)

        # Remove o relacionamento
        follow_relation = UserFollow.objects.filter(follower=follower, following=following).first()
        if follow_relation:
            follow_relation.delete()
            return JsonResponse({'success': True, 'message': 'Usuário deixou de ser seguido'})
        else:
            return JsonResponse({'error': 'Usuário não estava sendo seguido'}, status=400)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

class FollowingPlaylistsView(generics.ListAPIView):
    serializer_class = PlaylistFeedSerializer
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        
        # Pega os IDs dos usuários que o user_id segue
        following_ids = UserFollow.objects.filter(
            follower_id=user_id
        ).values_list('following_id', flat=True)
        
        # Pega as playlists desses usuários seguidos
        return Playlist.objects.filter(
            user_id__in=following_ids
        ).prefetch_related(
            Prefetch('song', queryset=Song.objects.all()),
            'user__userprofile'
        ).select_related('user').order_by('-id')