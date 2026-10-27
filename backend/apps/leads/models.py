import uuid
import re
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from apps.chat.models import ChatSession
from apps.leads.utils import PhoneValidator


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
    
    def clean(self):
        super().clean()
        errors = {}
        
        if self.full_name:
            name = self.full_name.strip()
            if len(name) < 2:
                errors['full_name'] = 'Full name must be at least 2 characters.'
            elif not re.match(r"^[A-Za-z\s.'-]+$", name):
                errors['full_name'] = 'Full name can only contain letters, spaces, apostrophes, periods, and hyphens.'
            elif any(char.isdigit() for char in name):
                errors['full_name'] = 'Full name should not contain numbers.'
        
        if self.phone_number:
            phone = self.phone_number.strip()
            valid_in, _ = PhoneValidator.validate_indian_phone(phone)
            valid_intl, _ = PhoneValidator.validate_international_phone(phone)
            if not (valid_in or valid_intl):
                errors['phone_number'] = 'Enter a valid phone number (Indian 10-digit or international with +).'
        
        if self.email:
            from django.core.validators import validate_email
            try:
                validate_email(self.email)
            except ValidationError:
                errors['email'] = 'Enter a valid email address.'
        
        if self.wedding_location:
            loc = self.wedding_location.strip()
            if len(loc) < 2:
                errors['wedding_location'] = 'Wedding location must be at least 2 characters.'
            elif re.search(r'\d', loc) and not re.search(r'[A-Za-z]', loc):
                errors['wedding_location'] = 'Enter a valid location name.'
        
        if self.wedding_date:
            date_str = self.wedding_date.strip().lower()
            if re.search(r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|\d{4}|\d{1,2}/\d{1,2})\b', date_str) is None and len(date_str) < 3:
                errors['wedding_date'] = 'Enter a valid wedding date or timeframe.'
        
        if self.guest_count:
            gc = str(self.guest_count).strip()
            nums = re.findall(r'\d+', gc)
            if not nums:
                errors['guest_count'] = 'Guest count must contain a valid number.'
            else:
                try:
                    g = int(nums[0])
                    if g < 1 or g > 10000:
                        errors['guest_count'] = 'Guest count must be between 1 and 10000.'
                except ValueError:
                    errors['guest_count'] = 'Enter a valid guest count.'
        
        if self.budget_min is not None and self.budget_max is not None:
            if self.budget_min < 0 or self.budget_max < 0:
                errors['budget_min'] = 'Budget values cannot be negative.'
            elif self.budget_min > self.budget_max:
                errors['budget_min'] = 'Minimum budget cannot be greater than maximum budget.'
        
        if self.budget_min is not None and self.budget_min < 0:
            errors['budget_min'] = 'Budget cannot be negative.'
        if self.budget_max is not None and self.budget_max < 0:
            errors['budget_max'] = 'Budget cannot be negative.'
        
        if self.budget_range_text:
            br = self.budget_range_text.strip().lower()
            if not re.search(r'\d', br) and len(br) < 3:
                errors['budget_range_text'] = 'Enter a valid budget range (e.g., ₹20-30 lakhs).'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
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
    
    def clean(self):
        super().clean()
        errors = {}
        if self.required_services is not None and not isinstance(self.required_services, list):
            errors['required_services'] = 'Required services must be a list.'
        if self.generation_status == 'completed' and not self.summary_text.strip():
            errors['summary_text'] = 'Summary text required when generation is completed.'
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
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
    
    def clean(self):
        super().clean()
        errors = {}
        if not self.note or not self.note.strip():
            errors['note'] = 'Note cannot be empty.'
        elif len(self.note.strip()) < 3:
            errors['note'] = 'Note must be at least 3 characters.'
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
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
    
    def clean(self):
        super().clean()
        errors = {}
        if not self.scoring_factor or not self.scoring_factor.strip():
            errors['scoring_factor'] = 'Scoring factor cannot be empty.'
        if self.points_awarded is None:
            errors['points_awarded'] = 'Points awarded is required.'
        elif self.points_awarded < 0 or self.points_awarded > 100:
            errors['points_awarded'] = 'Points awarded must be between 0 and 100.'
        if not self.explanation or not self.explanation.strip():
            errors['explanation'] = 'Explanation cannot be empty.'
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.scoring_factor}: +{self.points_awarded}"
