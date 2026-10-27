import uuid
import re
from django.db import models
from django.core.exceptions import ValidationError


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
    
    def clean(self):
        super().clean()
        errors = {}
        if not self.title or not self.title.strip():
            errors['title'] = 'Title cannot be empty.'
        elif len(self.title.strip()) < 3:
            errors['title'] = 'Title must be at least 3 characters.'
        if not self.content or not self.content.strip():
            errors['content'] = 'Content cannot be empty.'
        elif len(self.content.strip()) < 10:
            errors['content'] = 'Content must be at least 10 characters.'
        if self.keywords is not None:
            if not isinstance(self.keywords, list):
                errors['keywords'] = 'Keywords must be a list.'
            else:
                for k in self.keywords:
                    if not isinstance(k, str):
                        errors['keywords'] = 'All keywords must be strings.'
                        break
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
