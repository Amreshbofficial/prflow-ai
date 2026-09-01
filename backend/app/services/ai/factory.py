from app.core.config import settings
from app.services.ai.base import AIProvider
from app.services.ai.mock_provider import MockAIProvider
from app.services.ai.openai_provider import OpenAIProvider
from app.services.ai.anthropic_provider import AnthropicProvider

def get_ai_provider() -> AIProvider:
    if settings.DEMO_MODE:
        return MockAIProvider()
    
    if settings.ANTHROPIC_API_KEY:
        return AnthropicProvider(api_key=settings.ANTHROPIC_API_KEY)
        
    if settings.OPENAI_API_KEY:
        return OpenAIProvider(api_key=settings.OPENAI_API_KEY)
        
    # Fallback to mock if no keys are provided even if demo mode is false
    return MockAIProvider()
