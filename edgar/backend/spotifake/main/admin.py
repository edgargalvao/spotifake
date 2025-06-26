from django.contrib import admin
from .models import Song
from .models import Playlist 
from .models import UserProfile 
# Register your models here.

admin.site.register(Song)
admin.site.register(Playlist)
# Register the Song model with the Django admin site
