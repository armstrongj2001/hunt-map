from django.urls import path
from .views import UserProfileView

# These mount at /api/users/
urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user_profile'),
]
