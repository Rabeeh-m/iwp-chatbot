import uuid
from django.db import models
from django.contrib.auth.models import User


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
    
    def __str__(self):
        return f"{self.action} by {self.administrator}"
