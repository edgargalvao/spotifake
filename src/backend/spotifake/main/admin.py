from django.contrib import admin
from .models import Song
from .models import Playlist 
from .models import UserProfile 
from .models import UserFollow

# Register your models here.
admin.site.register(Song)
admin.site.register(Playlist)
admin.site.register(UserProfile)
admin.site.register(UserFollow)
