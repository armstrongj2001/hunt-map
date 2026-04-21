from django.urls import path
from .views import (
    HuntListCreateView, HuntDetailView, HuntJoinView,
    CheckpointListCreateView, CheckpointDetailView,
    TeamListCreateView, TeamJoinView,
)

# These mount at /api/hunts/
urlpatterns = [
    path('', HuntListCreateView.as_view(), name='hunt_list'),
    path('<int:pk>/', HuntDetailView.as_view(), name='hunt_detail'),
    path('join/<str:code>/', HuntJoinView.as_view(), name='hunt_join'),
    path('<int:hunt_id>/checkpoints/', CheckpointListCreateView.as_view(), name='checkpoint_list'),
    path('<int:hunt_id>/checkpoints/<int:pk>/', CheckpointDetailView.as_view(), name='checkpoint_detail'),
    path('<int:hunt_id>/teams/', TeamListCreateView.as_view(), name='team_list'),
    path('<int:hunt_id>/teams/<int:team_id>/join/', TeamJoinView.as_view(), name='team_join'),
]
