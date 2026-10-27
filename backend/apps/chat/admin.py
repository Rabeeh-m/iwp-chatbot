from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import ChatSession, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ['id', 'role', 'content', 'created_at', 'metadata']
    can_delete = False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['public_session_id', 'status', 'visitor_token_hash', 'message_count', 'consent_status', 'created_at', 'last_activity_at']
    list_filter = ['status', 'consent_status', 'created_at']
    search_fields = ['public_session_id', 'visitor_token_hash', 'source_url']
    readonly_fields = ['id', 'public_session_id', 'visitor_token_hash', 'created_at', 'last_activity_at']
    ordering = ['-last_activity_at']
    date_hierarchy = 'created_at'
    inlines = [ChatMessageInline]
    
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
        except ValidationError as e:
            form.add_error(None, e)
            raise
        super().save_model(request, obj, form, change)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'role', 'created_at']
    list_filter = ['role', 'created_at']
    search_fields = ['content', 'session__public_session_id']
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
