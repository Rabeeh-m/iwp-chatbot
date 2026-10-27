from .ai_providers import OllamaProvider, FallbackProvider, GeminiProvider


class AIService:
    def __init__(self):
        self.providers = []
        # Try Gemini first (as per user request)
        gemini = GeminiProvider()
        if gemini.is_available():
            self.providers.append(gemini)
        # Try Ollama
        ollama = OllamaProvider()
        if ollama.is_available():
            self.providers.append(ollama)
        # Always have fallback
        self.providers.append(FallbackProvider())
    
    def get_provider(self):
        for provider in self.providers:
            if provider.is_available():
                return provider
        return self.providers[-1] if self.providers else FallbackProvider()
    
    def generate_response(self, messages, context=None, **kwargs):
        provider = self.get_provider()
        try:
            response = provider.generate_response(messages, context, **kwargs)
            if response:
                return response, provider.get_provider_name()
            # Try next provider
            for p in self.providers:
                if p != provider and p.is_available():
                    response = p.generate_response(messages, context, **kwargs)
                    if response:
                        return response, p.get_provider_name()
            return "I'm having trouble responding right now. Please try again or contact us directly.", 'error'
        except Exception as e:
            return "I'm having trouble responding right now. Please try again or contact us directly.", 'error'
    
    def generate_summary(self, conversation_data):
        provider = self.get_provider()
        messages = [
            {'role': 'system', 'content': 'Generate a concise summary of this wedding planning conversation. Include: visitor name, location, date, budget, guest count, services needed, preferences, questions, interest level, callback requested, recommended next action.'},
            {'role': 'user', 'content': str(conversation_data)}
        ]
        try:
            response = provider.generate_response(messages)
            if response:
                return response
        except:
            pass
        # Fallback summary
        return self._generate_fallback_summary(conversation_data)
    
    def _generate_fallback_summary(self, data):
        summary_parts = []
        if data.get('name'):
            summary_parts.append(f"Visitor: {data['name']}")
        if data.get('location'):
            summary_parts.append(f"Wedding Location: {data['location']}")
        if data.get('date'):
            summary_parts.append(f"Wedding Date: {data['date']}")
        if data.get('budget'):
            summary_parts.append(f"Budget: {data['budget']}")
        if data.get('guest_count'):
            summary_parts.append(f"Guests: {data['guest_count']}")
        if data.get('services'):
            summary_parts.append(f"Services: {', '.join(data['services'])}")
        if data.get('phone'):
            summary_parts.append(f"Contact: {data['phone']} (provided)")
        if data.get('callback_requested'):
            summary_parts.append("Callback/Consultation requested")
        summary_parts.append(f"Messages exchanged: {data.get('message_count', 0)}")
        summary_parts.append("Recommended next action: Follow up with lead as per priority")
        return '\n'.join(summary_parts)
