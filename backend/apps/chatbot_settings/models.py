import uuid
from django.db import models
from django.contrib.auth.models import User


class ChatbotConfiguration(models.Model):
    configuration_key = models.CharField(max_length=100, unique=True)
    configuration_value = models.TextField()
    description = models.TextField(blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['configuration_key']
    
    def __str__(self):
        return self.configuration_key


class ScoringConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wedding_date_points = models.IntegerField(default=15)
    wedding_location_points = models.IntegerField(default=10)
    budget_points = models.IntegerField(default=20)
    services_points = models.IntegerField(default=15)
    guest_count_points = models.IntegerField(default=10)
    phone_points = models.IntegerField(default=15)
    consultation_request_points = models.IntegerField(default=10)
    
    hot_threshold = models.IntegerField(default=70)
    warm_threshold = models.IntegerField(default=40)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return "Lead Scoring Configuration"
