import uuid
from django.db import models
from django.contrib.auth.models import User
from apps.chat.models import ChatSession


class Lead(models.Model):
    QUALIFICATION_CHOICES = [
        ('hot', 'Hot Lead'),
        ('warm', 'Warm Lead'),
        ('cold', 'Cold Lead'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contact_pending', 'Contact Pending'),
        ('contacted', 'Contacted'),
        ('consultation_scheduled', 'Consultation Scheduled'),
        ('proposal_sent', 'Proposal Sent'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(ChatSession, on_delete=models.CASCADE, related_name='lead')
    full_name = models.CharField(max_length=200, blank=True)
    phone_number = models.CharField(max_length=30, blank=True, db_index=True)
    email = models.EmailField(blank=True)
    wedding_location = models.CharField(max_length=200, blank=True)
    wedding_date = models.CharField(max_length=100, blank=True)
    wedding_type = models.CharField(max_length=100, blank=True)
    guest_count = models.CharField(max_length=50, blank=True)
    budget_min = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    budget_range_text = models.CharField(max_length=100, blank=True)
    required_services = models.JSONField(default=list, blank=True)
    additional_requirements = models.TextField(blank=True)
    partner_name = models.CharField(max_length=200, blank=True)
    venue_preference = models.CharField(max_length=200, blank=True)
    preferred_language = models.CharField(max_length=50, blank=True)
    
    lead_score = models.IntegerField(default=0)
    qualification_level = models.CharField(max_length=20, choices=QUALIFICATION_CHOICES, default='cold')
    lead_status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='new')
    
    callback_requested = models.BooleanField(default=False)
    consultation_requested = models.BooleanField(default=False)
    contact_details_collected = models.BooleanField(default=False)
    
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads')
    follow_up_at = models.DateTimeField(null=True, blank=True)
    lost_reason = models.TextField(blank=True)
    consultation_outcome = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_interaction_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-lead_score']),
            models.Index(fields=['qualification_level']),
            models.Index(fields=['lead_status']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"Lead {self.full_name or 'Anonymous'} - {self.qualification_level}"


class ConversationSummary(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generating', 'Generating'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(ChatSession, on_delete=models.CASCADE, related_name='summary')
    summary_text = models.TextField(blank=True)
    recommended_next_action = models.TextField(blank=True)
    visitor_name = models.CharField(max_length=200, blank=True)
    wedding_location = models.CharField(max_length=200, blank=True)
    wedding_date = models.CharField(max_length=100, blank=True)
    estimated_budget = models.CharField(max_length=100, blank=True)
    expected_guest_count = models.CharField(max_length=50, blank=True)
    required_services = models.JSONField(default=list, blank=True)
    important_preferences = models.TextField(blank=True)
    questions_concerns = models.TextField(blank=True)
    level_of_interest = models.CharField(max_length=50, blank=True)
    callback_or_consultation_requested = models.BooleanField(default=False)
    
    generation_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    generated_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    error_message = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Summary for {self.session.public_session_id[:8]}"


class AdminNote(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note by {self.author}"


class LeadScoreEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='score_events')
    scoring_factor = models.CharField(max_length=100)
    points_awarded = models.IntegerField()
    explanation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.scoring_factor}: +{self.points_awarded}"
