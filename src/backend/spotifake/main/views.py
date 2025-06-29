from django.shortcuts import render, get_object_or_404, redirect
from .models import Playlist, Song, UserProfile
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from random import choice
from rest_framework import generics, permissions,viewsets
from .serializers import UserProfileSerializer, SongSerializer, PlaylistSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Song, UserProfile
from .serializers import SongSerializer
import json
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# API Views para React consumir
class SongListAPIView(generics.ListAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

class PlaylistListAPIView(generics.ListAPIView):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

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