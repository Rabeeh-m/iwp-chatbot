import uuid
import re
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class ChatbotConfiguration(models.Model):
    configuration_key = models.CharField(max_length=100, unique=True)
    configuration_value = models.TextField()
    description = models.TextField(blank=True)
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['configuration_key']
    
    def clean(self):
        super().clean()
        errors = {}
        if not self.configuration_key or not self.configuration_key.strip():
            errors['configuration_key'] = 'Configuration key cannot be empty.'
        elif not re.match(r'^[A-Za-z0-9_.-]+$', self.configuration_key):
            errors['configuration_key'] = 'Key can only contain letters, numbers, underscores, dots, and hyphens.'
        if not self.configuration_value or not self.configuration_value.strip():
            errors['configuration_value'] = 'Configuration value cannot be empty.'
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
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
    
    def clean(self):
        super().clean()
        errors = {}
        for field in ['wedding_date_points', 'wedding_location_points', 'budget_points', 
                      'services_points', 'guest_count_points', 'phone_points', 
                      'consultation_request_points']:
            val = getattr(self, field)
            if val is None or val < 0 or val > 100:
                errors[field] = 'Points must be between 0 and 100.'
        if self.hot_threshold is not None and (self.hot_threshold < 0 or self.hot_threshold > 100):
            errors['hot_threshold'] = 'Threshold must be between 0 and 100.'
        if self.warm_threshold is not None and (self.warm_threshold < 0 or self.warm_threshold > 100):
            errors['warm_threshold'] = 'Threshold must be between 0 and 100.'
        if self.hot_threshold is not None and self.warm_threshold is not None:
            if self.hot_threshold <= self.warm_threshold:
                errors['hot_threshold'] = 'Hot threshold must be greater than warm threshold.'
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return "Lead Scoring Configuration"
