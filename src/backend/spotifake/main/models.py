from django.db import models
from django.contrib.auth.models import User

class Song(models.Model):
    title = models.CharField(max_length=100)
    artist = models.CharField(max_length=100)
    album = models.CharField(max_length=100)
    #release_date = models.DateField()
    genre = models.CharField(max_length=50)
    audio_file = models.FileField(upload_to='audio_files/')
    cover_image = models.ImageField(upload_to='cover_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return f"{self.title} by {self.artist}"
    class Meta:
        ordering = ['title']
        verbose_name = 'Song'
        verbose_name_plural = 'Songs'
    
class Playlist(models.Model):
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="playlists")
    song = models.ManyToManyField(Song, related_name="playlists")

    def __str__(self):
        return f"{self.name} - {self.user}"
      
      
     
class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    icon_image = models.ImageField(upload_to='cover_images/', blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    playlists = models.ManyToManyField(Playlist, blank=True, related_name='user_profiles')

    def __str__(self):
        return self.user.username

    class Meta:
        ordering = ['user']
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
class UserFollow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')
        ordering = ['-created_at']
        verbose_name = 'User Follow'
        verbose_name_plural = 'User Follows'

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.follower == self.following:
            raise ValidationError("Um usuário não pode seguir a si mesmo.")
