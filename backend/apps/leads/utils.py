import re


class PhoneValidator:
    @staticmethod
    def validate_indian_phone(phone):
        # Remove spaces, dashes, parentheses
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        # Remove +91 or 91 prefix
        if cleaned.startswith('+91'):
            cleaned = cleaned[3:]
        elif cleaned.startswith('91') and len(cleaned) == 12:
            cleaned = cleaned[2:]
        # Indian mobile starts with 6,7,8,9 and has 10 digits
        if re.match(r'^[6-9]\d{9}$', cleaned):
            return True, cleaned
        return False, cleaned
    
    @staticmethod
    def validate_international_phone(phone):
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        # Basic international validation - starts with + and has 7-15 digits
        if re.match(r'^\+\d{7,15}$', cleaned):
            return True, cleaned
        return False, cleaned
    
    @staticmethod
    def normalize_phone(phone, default_country='IN'):
        cleaned = re.sub(r'[\s\-\(\)]', '', phone)
        if default_country == 'IN':
            valid, normalized = PhoneValidator.validate_indian_phone(phone)
            if valid:
                return f'+91{normalized}'
        valid_intl, normalized_intl = PhoneValidator.validate_international_phone(phone)
        if valid_intl:
            return normalized_intl
        # Try to be flexible
        if cleaned.startswith('+'):
            return cleaned
        if len(cleaned) == 10 and re.match(r'^[6-9]', cleaned):
            return f'+91{cleaned}'
        return cleaned


class LeadScoringEngine:
    MAX_SCORE = 100

    # Weights are designed to total exactly 100 so factor points in the
    # breakdown always add up to the lead score with no arbitrary truncation.
    DEFAULT_WEIGHTS = {
        'wedding_date': 15,
        'wedding_location': 10,
        'budget': 20,
        'services': 15,
        'guest_count': 10,
        'phone': 15,
        'consultation_request': 10,
        'full_name': 5,
    }
    
    DEFAULT_THRESHOLDS = {
        'hot': 70,
        'warm': 40,
    }
    
    def __init__(self, weights=None, thresholds=None):
        self.weights = self._normalize_weights(weights or self.DEFAULT_WEIGHTS)
        self.thresholds = thresholds or self.DEFAULT_THRESHOLDS

    def _normalize_weights(self, weights):
        """Clamp weights so their maximum possible total is 100.

        If an admin configures weights that sum above 100, they are scaled
        proportionally so each factor keeps its relative importance while the
        total stays within the maximum score.
        """
        cleaned = {k: max(0, int(v)) for k, v in weights.items()}
        total = sum(cleaned.values())
        if total <= self.MAX_SCORE:
            return cleaned

        factor = self.MAX_SCORE / total
        scaled = {k: int(round(v * factor)) for k, v in cleaned.items()}
        drift = self.MAX_SCORE - sum(scaled.values())
        if drift:
            largest = max(scaled, key=scaled.get)
            scaled[largest] += drift
        return scaled

    def calculate_score(self, lead_data):
        score = 0
        factors = {}

        def add_factor(name, points, reason):
            nonlocal score
            points = max(0, min(int(points), self.MAX_SCORE - score))
            if points <= 0:
                return
            score += points
            factors[name] = {'points': points, 'reason': reason}

        def weight(name):
            return self.weights.get(name, 0)

        if lead_data.get('full_name'):
            add_factor('full_name', weight('full_name'), 'Full name provided')

        if lead_data.get('wedding_date'):
            add_factor('wedding_date', weight('wedding_date'), 'Wedding date/timeframe provided')

        if lead_data.get('wedding_location'):
            add_factor('wedding_location', weight('wedding_location'), 'Wedding location provided')

        if lead_data.get('budget_min') or lead_data.get('budget_max') or lead_data.get('budget_range_text'):
            add_factor('budget', weight('budget'), 'Budget information provided')

        if lead_data.get('required_services') and len(lead_data.get('required_services', [])) > 0:
            add_factor('services', weight('services'), 'Required services identified')

        if lead_data.get('guest_count'):
            guest_weight = weight('guest_count')
            try:
                gc = str(lead_data.get('guest_count')).replace(',', '').strip()
                if gc.isdigit():
                    g = int(gc)
                    if g >= 100:
                        points = guest_weight
                    elif g >= 50:
                        points = max(1, round(guest_weight * 0.8))
                    else:
                        points = max(1, round(guest_weight * 0.5))
                else:
                    points = guest_weight
            except Exception:
                points = guest_weight
            add_factor('guest_count', points, 'Guest count provided')

        if lead_data.get('phone_number'):
            phone = str(lead_data['phone_number'])
            valid, _ = PhoneValidator.validate_indian_phone(phone)
            valid_intl, _ = PhoneValidator.validate_international_phone(phone)
            if valid or valid_intl:
                add_factor('phone', weight('phone'), 'Valid contact number provided')

        if lead_data.get('consultation_requested') or lead_data.get('callback_requested'):
            add_factor('consultation_request', weight('consultation_request'), 'Explicit request for consultation/callback')

        score = min(score, self.MAX_SCORE)
        qualification = self.get_qualification_level(score)
        return score, qualification, factors
    
    def get_qualification_level(self, score):
        if score >= self.thresholds['hot']:
            return 'hot'
        elif score >= self.thresholds['warm']:
            return 'warm'
        return 'cold'
