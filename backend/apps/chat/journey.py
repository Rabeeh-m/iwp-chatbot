from apps.leads.models import Lead
import re


class LeadJourney:
    @staticmethod
    def get_next_question(session):
        try:
            lead = Lead.objects.get(session=session)
        except Lead.DoesNotExist:
            return "What's your full name?"
        
        name = str(lead.full_name or '').strip()
        if not name or name.lower() in ['hi', 'hello', 'hey', 'namaste', '']:
            return "What's your full name?"
        if not lead.phone_number:
            return f"Thanks {name}! What's your phone number?"
        if not lead.wedding_location:
            return "Which location are you planning your wedding in (City/State)?"
        if not lead.wedding_date:
            return "What's your preferred wedding date (DD/MM/YYYY or month/year)?"
        if not lead.guest_count:
            return "How many guests are you expecting?"
        if not lead.budget_range_text and not lead.budget_min:
            return "What's your approximate budget (e.g., ₹20-30 lakhs)?"
        if not lead.required_services or len(lead.required_services) == 0:
            return "Which services do you need? (Venue, Decor, Catering, Photography, Planning, etc.)"
        return None
    
    @staticmethod
    def is_valid_name(name):
        name = str(name).strip()
        if len(name) < 2:
            return False
        nl = name.lower()
        if nl in ['hi', 'hello', 'hey', 'namaste', 'india', 'kerala', 'kannur', 'trivandrum', 'kochi', 'alleppey', 'gujarat', 'rajasthan', 'goa', 'mumbai', 'delhi', 'complaint', 'stupid', 'dumb', 'useless', 'bad', 'worst']:
            return False
        if any(x in nl for x in ['dumb', 'stupid', 'idiot', 'useless', 'worst', 'hate']):
            return False
        if any(c.isdigit() for c in name):
            return False
        if re.match(r'^[\+\d\s\-\(\)]+$', name):
            return False
        if ',' in name:
            return False
        if len(name.split()) > 4:
            return False
        vowels = set('aeiou')
        if len(name.replace(' ', '')) > 3:
            if not any(c.lower() in vowels for c in name.replace(' ', '')):
                return False
        if re.match(r'^[^aeiouAEIOU\s]{4,}$', name.replace(' ', '')):
            return False
        return True
    
    @staticmethod
    def is_phone(msg):
        cleaned = re.sub(r'[^0-9]', '', msg)
        return len(cleaned) == 10 and cleaned[0] in '6789'
    
    @staticmethod
    def process_answer(session, message):
        try:
            lead = Lead.objects.get(session=session)
        except Lead.DoesNotExist:
            return False
        
        msg = str(message).strip()
        msg_lower = msg.lower()
        
        # Handle complaints/abuse
        if any(x in msg_lower for x in ['complaint', 'dumb', 'stupid', 'idiot', 'useless', 'worst', 'hate you']):
            if not lead.full_name or lead.full_name.strip().lower() in ['hi', 'hello', 'hey', 'namaste']:
                if LeadJourney.is_valid_name(msg):
                    lead.full_name = msg.title()
                    lead.save()
                    return False
            # Don't treat as name, just acknowledge
            return False
        
        name = str(lead.full_name or '').strip().lower()
        if not name or name in ['hi', 'hello', 'hey', 'namaste']:
            if msg_lower in ['hi', 'hello', 'hey', 'namaste']:
                if not lead.full_name:
                    lead.full_name = msg_lower.title()
                lead.save()
                return False
            if LeadJourney.is_valid_name(msg) and not LeadJourney.is_phone(msg):
                lead.full_name = msg.title()
                lead.save()
                return True
            return False
        
        if not lead.phone_number:
            if LeadJourney.is_phone(msg):
                from apps.leads.utils import PhoneValidator
                normalized = PhoneValidator.normalize_phone(msg)
                if normalized:
                    lead.phone_number = normalized
                    lead.contact_details_collected = True
                    lead.save()
                    return True
            return False
        
        if not lead.wedding_location:
            # Don't accept if it looks like date/budget/question
            if re.search(r'\d{4}|\d{1,2}/\d{1,2}|lakh|crore|budget|guest', msg_lower):
                return False
            if '?' in msg:
                return False
            lead.wedding_location = msg.title()
            lead.save()
            return True
        
        if not lead.wedding_date:
            if '?' in msg or msg_lower in ['hi', 'hello']:
                return False
            lead.wedding_date = msg
            lead.save()
            return True
        
        if not lead.guest_count:
            nums = re.findall(r'\d+', msg)
            if nums and len(msg) < 20:  # simple number
                lead.guest_count = nums[0]
                lead.save()
                return True
            return False
        
        if not lead.budget_range_text and not lead.budget_min:
            if '?' in msg:
                return False
            lead.budget_range_text = msg
            lead.save()
            return True
        
        if not lead.required_services or len(lead.required_services) == 0:
            if msg_lower in ['hi', 'hello', 'hey'] or '?' in msg:
                return False
            if msg_lower == 'everything' or 'all' in msg_lower:
                lead.required_services = ['Venue', 'Decor', 'Catering', 'Photography', 'Planning', 'Entertainment']
            else:
                services = [s.strip().title() for s in re.split(r'[,\n]', msg) if s.strip()]
                lead.required_services = services
            lead.save()
            return True
        return False
    
    @staticmethod
    def is_journey_complete(session):
        try:
            lead = Lead.objects.get(session=session)
            name = str(lead.full_name or '').strip().lower()
            return bool(
                name and name not in ['hi', 'hello', 'hey', 'namaste'] and
                lead.phone_number and 
                lead.wedding_location and 
                lead.wedding_date and 
                lead.guest_count and 
                (lead.budget_range_text or lead.budget_min) and 
                lead.required_services and len(lead.required_services) > 0
            )
        except:
            return False
