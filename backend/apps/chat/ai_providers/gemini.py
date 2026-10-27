import requests
from decouple import config
from .base import AIProvider


class GeminiProvider(AIProvider):
    def __init__(self):
        self.api_key = config('GEMINI_API_KEY', default='')
        self.model = config('AI_MODEL_NAME', default='gemini-3.5-flash-lite')
        self.base_url = 'https://generativelanguage.googleapis.com/v1beta/models'
    
    def is_available(self):
        return bool(self.api_key)
    
    def generate_response(self, messages, context=None, **kwargs):
        if not self.api_key:
            return None
        try:
            system_prompt = self._build_system_prompt(context)
            history = []
            for i, msg in enumerate(messages):
                role = msg.get('role', 'user')
                if role == 'assistant':
                    history.append({
                        'role': 'model',
                        'parts': [{'text': msg.get('content', '')}]
                    })
                elif role == 'user':
                    history.append({
                        'role': 'user',
                        'parts': [{'text': msg.get('content', '')}]
                    })
            
            if history and history[0]['role'] == 'user':
                history[0]['parts'][0]['text'] = f"{system_prompt}\n\n{history[0]['parts'][0]['text']}"
            elif not history:
                history = [{'role': 'user', 'parts': [{'text': system_prompt}]}]
            else:
                history.insert(0, {'role': 'user', 'parts': [{'text': system_prompt}]})
            
            payload = {
                'contents': history,
                'generationConfig': {
                    'temperature': kwargs.get('temperature', 0.2),
                    'topP': 0.7,
                    'topK': 15,
                    'maxOutputTokens': 60,
                }
            }
            
            url = f'{self.base_url}/{self.model}:generateContent?key={self.api_key}'
            response = requests.post(url, json=payload, timeout=10)
            if response.status_code == 200:
                data = response.json()
                candidates = data.get('candidates', [])
                if candidates:
                    content = candidates[0].get('content', {})
                    parts = content.get('parts', [])
                    if parts:
                        return parts[0].get('text', '').strip()
            return None
        except Exception as e:
            return None
    
    def _build_system_prompt(self, context=None):
        base_prompt = """You are wedding assistant for Indian Wedding Planners (IWP).
CRITICAL RULES:
- Max 1-2 short lines, under 30 words
- Use ALL user details already collected. NEVER ask for name/phone/location/date/guests/budget/services again.
- If user is rude/abusive/complains, stay calm, polite, professional. Acknowledge politely and redirect to wedding planning or ask how to help.
- Company: IWP (Indian Wedding Planners), founded 2013 by Anant Khandelwal. Jaipur HQ (34, Sangram Colony, C-Scheme, Jaipur-302001) with Mumbai office.
- Website: https://www.indianweddingplanners.in/
- Phone/WhatsApp: +91 94143 66666
- Email: info@indianweddingplanners.in
- Instagram: https://www.instagram.com/indianweddingplanners
- YouTube: https://www.youtube.com/channel/UCBk7pTRn39u39ZH1KNMqnJA
- Facebook: https://www.facebook.com/indianweddingplannerss/
- LinkedIn: https://www.linkedin.com/company/indian-wedding-planners
- Twitter: https://twitter.com/INDIANWEDDINGG
- ALWAYS give full working links when asked for website/socials/contact. NEVER use .co.in or fake numbers.
- Be factual, polite and concise."""
        
        if context and context.get('knowledge'):
            base_prompt += "\n\nInfo:\n"
            for item in context['knowledge']:
                base_prompt += f"- {item['title']}: {item['content'][:60]}\n"
        
        return base_prompt
    
    def get_provider_name(self):
        return f'gemini-{self.model}'
