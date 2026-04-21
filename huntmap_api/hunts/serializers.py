from rest_framework import serializers
from .models import Hunt, Checkpoint, Team, TeamMembership


class CheckpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checkpoint
        fields = ('id', 'order', 'latitude', 'longitude', 'clue_text', 'hint_text', 'qr_data', 'photo_url', 'created_at')
        read_only_fields = ('id', 'qr_data', 'created_at')


class HuntSerializer(serializers.ModelSerializer):
    # Show the creator's username, but don't let it be set via the API
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    checkpoint_count = serializers.IntegerField(source='checkpoints.count', read_only=True)

    class Meta:
        model = Hunt
        fields = (
            'id', 'title', 'description', 'theme', 'game_mode', 'status',
            'join_code', 'creator_username', 'checkpoint_count', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'join_code', 'creator_username', 'created_at', 'updated_at')


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'name', 'score', 'started_at', 'completed_at')
        read_only_fields = ('id', 'score')


class TeamMembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TeamMembership
        fields = ('id', 'username', 'role', 'joined_at')
        read_only_fields = ('id', 'joined_at')
