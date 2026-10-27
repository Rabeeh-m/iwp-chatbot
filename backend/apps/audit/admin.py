from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'action', 'entity_type', 'entity_id', 'administrator', 'ip_address', 'created_at']
    list_filter = ['action', 'entity_type', 'created_at']
    search_fields = ['action', 'entity_type', 'entity_id', 'ip_address']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
        except ValidationError as e:
            form.add_error(None, e)
            raise
        super().save_model(request, obj, form, change)
