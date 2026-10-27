from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import KnowledgeEntry


@admin.register(KnowledgeEntry)
class KnowledgeEntryAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'is_active', 'created_at', 'updated_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['title', 'content', 'keywords']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['category', 'title']
    date_hierarchy = 'created_at'
    
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
        except ValidationError as e:
            form.add_error(None, e)
            raise
        super().save_model(request, obj, form, change)
