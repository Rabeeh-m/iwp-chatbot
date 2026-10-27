import requests
from decouple import config
from .base import AIProvider


class OllamaProvider(AIProvider):
    def __init__(self):
        self.base_url = config('OLLAMA_BASE_URL', default='http://localhost:11434')
        self.model = config('OLLAMA_MODEL', default='llama3.2')
    
    def is_available(self):
        try:
            response = requests.get(f'{self.base_url}/api/tags', timeout=3)
            return response.status_code == 200
        except:
            return False
    
    def generate_response(self, messages, context=None, **kwargs):
        try:
            system_prompt = self._build_system_prompt(context)
            full_messages = [{'role': 'system', 'content': system_prompt}] + messages
            
            response = requests.post(
                f'{self.base_url}/api/chat',
                json={
                    'model': self.model,
                    'messages': full_messages,
                    'stream': False,
                    'options': {
                        'temperature': kwargs.get('temperature', 0.7),
                    }
                },
                timeout=30
            )
            if response.status_code == 200:
                data = response.json()
                return data.get('message', {}).get('content', '')
            return None
        except Exception as e:
            return None
    
    def _build_system_prompt(self, context=None):
        base_prompt = """You are a helpful AI wedding planning assistant for Indian Wedding Planners (IWP), a luxury destination wedding planning company based in Jaipur and Mumbai, India.

Your role:
- Greet visitors warmly and explain how you can help
- Answer questions about wedding planning services using only verified information
- Ask relevant follow-up questions to understand wedding needs
- Collect lead information naturally (name, phone, location, date, budget, services)
- Qualify leads based on their needs
- Be helpful, professional, and knowledgeable about Indian weddings and destination weddings
- Never invent prices, availability, or specific vendor details
- If you don't know something, say so and offer to connect them with a human
- Keep responses concise and conversational

Focus on: destination weddings in India and abroad, venue selection, wedding planning services, NRI/international couples."""
        
        if context and context.get('knowledge'):
            base_prompt += "\n\nVerified Information:\n"
            for item in context['knowledge']:
                base_prompt += f"- {item['title']}: {item['content'][:200]}\n"
        
        return base_prompt
    
    def get_provider_name(self):
        return f'ollama-{self.model}'
