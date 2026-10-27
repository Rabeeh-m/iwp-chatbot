import uuid
import hashlib
import re
from django.db import models
from django.core.exceptions import ValidationError


class ChatSession(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    public_session_id = models.CharField(max_length=64, unique=True, db_index=True)
    visitor_token_hash = models.CharField(max_length=64, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    source_url = models.URLField(max_length=500, blank=True)
    referrer_url = models.URLField(max_length=500, blank=True)
    campaign_data = models.JSONField(default=dict, blank=True)
    consent_status = models.BooleanField(default=False)
    consent_timestamp = models.DateTimeField(null=True, blank=True)
    message_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-last_activity_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
        ]
    
    def clean(self):
        super().clean()
        errors = {}
        if self.source_url and not re.match(r'^https?://', self.source_url):
            errors['source_url'] = 'Source URL must be a valid HTTP/HTTPS URL.'
        if self.referrer_url and not re.match(r'^https?://', self.referrer_url):
            errors['referrer_url'] = 'Referrer URL must be a valid HTTP/HTTPS URL.'
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Session {self.public_session_id[:8]}"


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
        ]
    
    def clean(self):
        super().clean()
        errors = {}
        if not self.content or not self.content.strip():
            errors['content'] = 'Message content cannot be empty.'
        elif len(self.content.strip()) > 10000:
            errors['content'] = 'Message content cannot exceed 10000 characters.'
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.role} message in {self.session.public_session_id[:8]}"
