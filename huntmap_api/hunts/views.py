from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Hunt, Checkpoint, Team, TeamMembership
from .serializers import HuntSerializer, CheckpointSerializer, TeamSerializer, TeamMembershipSerializer


class IsCreatorOrReadOnly(permissions.BasePermission):
    """Allow anyone to read a hunt, but only the creator can edit/delete it."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        hunt = obj if isinstance(obj, Hunt) else obj.hunt
        return hunt.creator == request.user


# --- Hunt Views ---

class HuntListCreateView(generics.ListCreateAPIView):
    """GET /api/hunts/ — list hunts. POST /api/hunts/ — create a hunt."""
    serializer_class = HuntSerializer

    def get_queryset(self):
        queryset = Hunt.objects.all()
        # Optional filter: ?mine=true shows only the current user's hunts
        if self.request.query_params.get('mine'):
            queryset = queryset.filter(creator=self.request.user)
        else:
            queryset = queryset.filter(status='published')
        return queryset

    def perform_create(self, serializer):
        # Automatically set the creator to whoever is logged in
        serializer.save(creator=self.request.user)


class HuntDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/hunts/{id}/"""
    queryset = Hunt.objects.all()
    serializer_class = HuntSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreatorOrReadOnly]


class HuntJoinView(APIView):
    """GET /api/hunts/join/{code}/ — look up a hunt by its join code."""
    def get(self, request, code):
        hunt = get_object_or_404(Hunt, join_code=code.upper(), status='published')
        serializer = HuntSerializer(hunt)
        return Response(serializer.data)


# --- Checkpoint Views ---

class CheckpointListCreateView(generics.ListCreateAPIView):
    """GET /api/hunts/{hunt_id}/checkpoints/ and POST to add one."""
    serializer_class = CheckpointSerializer

    def get_queryset(self):
        return Checkpoint.objects.filter(hunt_id=self.kwargs['hunt_id'])

    def perform_create(self, serializer):
        hunt = get_object_or_404(Hunt, pk=self.kwargs['hunt_id'], creator=self.request.user)
        serializer.save(hunt=hunt)


class CheckpointDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/hunts/{hunt_id}/checkpoints/{pk}/"""
    serializer_class = CheckpointSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreatorOrReadOnly]

    def get_queryset(self):
        return Checkpoint.objects.filter(hunt_id=self.kwargs['hunt_id'])


# --- Team Views ---

class TeamListCreateView(generics.ListCreateAPIView):
    """GET /api/hunts/{hunt_id}/teams/ and POST to create a team."""
    serializer_class = TeamSerializer

    def get_queryset(self):
        return Team.objects.filter(hunt_id=self.kwargs['hunt_id'])

    def perform_create(self, serializer):
        hunt = get_object_or_404(Hunt, pk=self.kwargs['hunt_id'])
        team = serializer.save(hunt=hunt)
        # Auto-join the creator as team leader
        TeamMembership.objects.create(team=team, user=self.request.user, role='leader')


class TeamJoinView(APIView):
    """POST /api/hunts/{hunt_id}/teams/{team_id}/join/ — join an existing team."""
    def post(self, request, hunt_id, team_id):
        team = get_object_or_404(Team, pk=team_id, hunt_id=hunt_id)
        membership, created = TeamMembership.objects.get_or_create(
            team=team, user=request.user,
            defaults={'role': 'member'}
        )
        if not created:
            return Response({'detail': 'You are already on this team.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(TeamMembershipSerializer(membership).data, status=status.HTTP_201_CREATED)
