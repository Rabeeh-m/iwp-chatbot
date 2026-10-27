from django.contrib import admin
from django.core.exceptions import ValidationError
from .models import Lead, ConversationSummary, AdminNote, LeadScoreEvent


class AdminNoteInline(admin.TabularInline):
    model = AdminNote
    extra = 1
    readonly_fields = ['author', 'created_at', 'updated_at']


class LeadScoreEventInline(admin.TabularInline):
    model = LeadScoreEvent
    extra = 0
    readonly_fields = ['scoring_factor', 'points_awarded', 'explanation', 'created_at']
    can_delete = False


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'phone_number', 'email', 'qualification_level', 'lead_status', 'lead_score', 'assigned_to', 'created_at']
    list_filter = ['qualification_level', 'lead_status', 'callback_requested', 'consultation_requested', 'created_at']
    search_fields = ['full_name', 'phone_number', 'email', 'wedding_location', 'partner_name']
    readonly_fields = ['id', 'lead_score', 'created_at', 'updated_at', 'last_interaction_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    inlines = [AdminNoteInline, LeadScoreEventInline]
    fieldsets = (
        ('Session', {
            'fields': ('session',)
        }),
        ('Contact Information', {
            'fields': ('full_name', 'partner_name', 'phone_number', 'email', 'preferred_language')
        }),
        ('Wedding Details', {
            'fields': ('wedding_type', 'wedding_date', 'wedding_location', 'venue_preference', 'guest_count')
        }),
        ('Budget & Services', {
            'fields': ('budget_min', 'budget_max', 'budget_range_text', 'required_services', 'additional_requirements')
        }),
        ('Lead Management', {
            'fields': ('lead_score', 'qualification_level', 'lead_status', 'assigned_to', 'follow_up_at')
        }),
        ('Flags', {
            'fields': ('callback_requested', 'consultation_requested', 'contact_details_collected')
        }),
        ('Notes', {
            'fields': ('lost_reason', 'consultation_outcome')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_interaction_at')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
        except ValidationError as e:
            form.add_error(None, e)
            raise
        super().save_model(request, obj, form, change)


@admin.register(ConversationSummary)
class ConversationSummaryAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'visitor_name', 'generation_status', 'updated_at']
    list_filter = ['generation_status', 'updated_at']
    search_fields = ['visitor_name', 'summary_text', 'session__public_session_id']
    readonly_fields = ['id', 'generated_at', 'updated_at']
    ordering = ['-updated_at']
    
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
        except ValidationError as e:
            form.add_error(None, e)
            raise
        super().save_model(request, obj, form, change)


@admin.register(AdminNote)
class AdminNoteAdmin(admin.ModelAdmin):
    list_display = ['id', 'lead', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['note', 'lead__full_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
        except ValidationError as e:
            form.add_error(None, e)
            raise
        super().save_model(request, obj, form, change)


@admin.register(LeadScoreEvent)
class LeadScoreEventAdmin(admin.ModelAdmin):
    list_display = ['id', 'lead', 'scoring_factor', 'points_awarded', 'created_at']
    list_filter = ['scoring_factor', 'created_at']
    search_fields = ['explanation', 'lead__full_name']
    readonly_fields = ['id', 'created_at']
    ordering = ['-created_at']
    
    def save_model(self, request, obj, form, change):
        try:
            obj.full_clean()
        except ValidationError as e:
            form.add_error(None, e)
            raise
        super().save_model(request, obj, form, change)
