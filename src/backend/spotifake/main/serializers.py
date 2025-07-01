from rest_framework import serializers
from .models import Song, Playlist, UserProfile
from django.contrib.auth.models import User

# 1.1. Serializer para Song (Música)
class SongSerializer(serializers.ModelSerializer):
    # aqui mapeamos cada campo do modelo para um nome em português
    id = serializers.IntegerField(read_only=True)                 # mantém o id
    titulo = serializers.CharField(source='title')                # title → titulo
    artista = serializers.CharField(source='artist')              # artist → artista
    album = serializers.CharField()                            # remove source redundante
    genero = serializers.CharField(source='genre')                # genre → genero
    arquivo_audio = serializers.FileField(source='audio_file')    # audio_file → arquivo_audio
    imagem_capa = serializers.ImageField(source='cover_image', required=False, allow_null=True)    # cover_image → imagem_capa
    criado_em = serializers.DateTimeField(source='created_at', required=False)    # created_at → criado_em

    class Meta:
        model = Song
        # Os campos que vão aparecer no JSON, nesta ordem:
        fields = (
            'id',
            'titulo',
            'artista',
            'album',
            'genero',
            'arquivo_audio',
            'imagem_capa',
            'criado_em',
        )


# 1.2. Serializer para Playlist
class PlaylistSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    nome = serializers.CharField(source='name')                  # name → nome
    usuario = serializers.CharField(source='user.username')      # user → usuário (apenas o username)
    # Para os relacionamentos many-to-many de músicas, usamos SongSerializer aninhado:
    musicas = SongSerializer(source='song', many=True, read_only=True)  # song → musicas

    class Meta:
        model = Playlist
        fields = (
            'id',
            'nome',
            'usuario',
            'musicas',
        )


# 1.3. Serializer para UserProfile
class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    usuario = serializers.CharField(source='user.username')       # user → usuário
    # Aninhamos as playlists desse usuário, usando PlaylistSerializer:
    playlists = PlaylistSerializer(many=True, read_only=True)     # playlists permanece playlists

    class Meta:
        model = UserProfile
        fields = (
            'id',
            'usuario',
            'playlists',
        )
