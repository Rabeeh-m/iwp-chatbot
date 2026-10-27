import uuid
import re
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    administrator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=200)
    entity_type = models.CharField(max_length=50)
    entity_id = models.CharField(max_length=100)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['entity_type', 'entity_id']),
        ]
    
    def clean(self):
        super().clean()
        errors = {}
        if not self.action or not self.action.strip():
            errors['action'] = 'Action cannot be empty.'
        if not self.entity_type or not self.entity_type.strip():
            errors['entity_type'] = 'Entity type cannot be empty.'
        if not self.entity_id or not self.entity_id.strip():
            errors['entity_id'] = 'Entity ID cannot be empty.'
        if self.metadata is not None and not isinstance(self.metadata, dict):
            errors['metadata'] = 'Metadata must be a dictionary.'
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.action} by {self.administrator}"
