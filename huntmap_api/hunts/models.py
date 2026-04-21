import uuid
from django.db import models
from django.conf import settings


class Hunt(models.Model):
    GAME_MODE_CHOICES = [
        ('competitive', 'Competitive'),
        ('freeplay', 'Free Play'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hunts')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    theme = models.CharField(max_length=100, blank=True)
    game_mode = models.CharField(max_length=20, choices=GAME_MODE_CHOICES, default='freeplay')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    # join_code is a short unique code players use to join the hunt
    join_code = models.CharField(max_length=10, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-generate a join code if this is a new hunt
        if not self.join_code:
            self.join_code = uuid.uuid4().hex[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Checkpoint(models.Model):
    hunt = models.ForeignKey(Hunt, on_delete=models.CASCADE, related_name='checkpoints')
    order = models.PositiveIntegerField(default=0)
    latitude = models.FloatField()
    longitude = models.FloatField()
    clue_text = models.TextField(blank=True)
    hint_text = models.TextField(blank=True)
    # qr_data is a unique UUID embedded in the QR code at this physical location
    qr_data = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    photo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.hunt.title} — Checkpoint {self.order}"


class Team(models.Model):
    hunt = models.ForeignKey(Hunt, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=100)
    score = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.hunt.title})"


class TeamMembership(models.Model):
    ROLE_CHOICES = [
        ('leader', 'Leader'),
        ('member', 'Member'),
    ]
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('team', 'user')


class CompletionRecord(models.Model):
    METHOD_CHOICES = [
        ('gps', 'GPS'),
        ('qr', 'QR Code'),
    ]
    checkpoint = models.ForeignKey(Checkpoint, on_delete=models.CASCADE, related_name='completions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    completed_at = models.DateTimeField(auto_now_add=True)
    hints_used = models.PositiveIntegerField(default=0)


class HuntStory(models.Model):
    hunt = models.OneToOneField(Hunt, on_delete=models.CASCADE, related_name='story')
    narrative_text = models.TextField()
    ai_generated = models.BooleanField(default=False)
    edited = models.BooleanField(default=False)

    def __str__(self):
        return f"Story for {self.hunt.title}"
