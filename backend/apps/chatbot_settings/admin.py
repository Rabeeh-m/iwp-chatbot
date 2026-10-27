from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import ChatbotConfiguration, ScoringConfig


@admin.register(ChatbotConfiguration)
class ChatbotConfigurationAdmin(admin.ModelAdmin):
    list_display = ['configuration_key', 'description', 'updated_by', 'updated_at']
    search_fields = ['configuration_key', 'description']
    readonly_fields = ['updated_at']
    ordering = ['configuration_key']
    
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
        except ValidationError as e:
            form.add_error(None, e)
            raise
        super().save_model(request, obj, form, change)


@admin.register(ScoringConfig)
class ScoringConfigAdmin(admin.ModelAdmin):
    list_display = ['id', 'hot_threshold', 'warm_threshold', 'updated_at']
    readonly_fields = ['id', 'updated_at']
    
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
        except ValidationError as e:
            form.add_error(None, e)
            raise
        super().save_model(request, obj, form, change)
