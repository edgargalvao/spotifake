from rest_framework import serializers
from .models import Song, Playlist, UserProfile, UserFollow
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
class PlaylistFeedSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    nome = serializers.CharField(source='name')
    usuario = serializers.CharField(source='user.username')
    musicas = SongSerializer(source='song', many=True, read_only=True)
    
    # Campos extras para o feed
    total_musicas = serializers.SerializerMethodField()
    imagem_capa_playlist = serializers.SerializerMethodField()
    perfil_usuario = serializers.SerializerMethodField()
    
    class Meta:
        model = Playlist
        fields = (
            'id',
            'nome', 
            'usuario',
            'musicas',
            'total_musicas',
            'imagem_capa_playlist',
            'perfil_usuario'
        )
    
    def get_total_musicas(self, obj):
        return obj.song.count()
    
    def get_imagem_capa_playlist(self, obj):
        # Pega a imagem de capa da primeira música que tiver
        primeira_musica_com_capa = obj.song.filter(cover_image__isnull=False).first()
        if primeira_musica_com_capa and primeira_musica_com_capa.cover_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primeira_musica_com_capa.cover_image.url)
        return None
    
    def get_perfil_usuario(self, obj):
        try:
            user_profile = obj.user.userprofile
            return {
                'nome': user_profile.name,
                'imagem_perfil': self.context['request'].build_absolute_uri(user_profile.icon_image.url) if user_profile.icon_image else None
            }
        except AttributeError:
            return {
                'nome': obj.user.username,
                'imagem_perfil': None
            }

# Serializer para UserFollow
class UserFollowSerializer(serializers.ModelSerializer):
    follower_username = serializers.CharField(source='follower.username', read_only=True)
    following_username = serializers.CharField(source='following.username', read_only=True)
    
    class Meta:
        model = UserFollow
        fields = ('id', 'follower', 'following', 'follower_username', 'following_username', 'created_at')
        read_only_fields = ('id', 'created_at')

# Serializer para listar usuários que podem ser seguidos
class UserListSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField()
    profile_name = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'profile_name', 'profile_image', 'is_following')
    
    def get_profile_name(self, obj):
        try:
            return obj.userprofile.name
        except AttributeError:
            return obj.username
    
    def get_profile_image(self, obj):
        try:
            if obj.userprofile.icon_image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.userprofile.icon_image.url)
        except AttributeError:
            pass
        return None
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return UserFollow.objects.filter(
                follower=request.user,
                following=obj
            ).exists()
        return False
