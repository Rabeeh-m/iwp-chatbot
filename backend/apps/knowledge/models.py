import uuid
from django.db import models


class KnowledgeEntry(models.Model):
    CATEGORY_CHOICES = [
        ('service', 'Service'),
        ('faq', 'FAQ'),
        ('policy', 'Policy'),
        ('destination', 'Destination'),
        ('general', 'General'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='general')
    keywords = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'title']
        indexes = [
            models.Index(fields=['is_active', 'category']),
        ]
    
    def __str__(self):
        return self.title
