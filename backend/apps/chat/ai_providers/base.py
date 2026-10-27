from abc import ABC, abstractmethod


class AIProvider(ABC):
    @abstractmethod
    def generate_response(self, messages, context=None, **kwargs):
        pass
    
    @abstractmethod
    def is_available(self):
        pass
    
    @abstractmethod
    def get_provider_name(self):
        pass
