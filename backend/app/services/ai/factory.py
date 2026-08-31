from app.core.config import settings
from app.services.ai.base import AIProvider
from app.services.ai.mock_provider import MockAIProvider

# In a full implementation, you would import OpenAIProvider and AnthropicProvider here.
# For MVP, we'll only implement MockAIProvider fully, and mock the others as placeholders if needed,
# but the architecture supports adding them cleanly.

def get_ai_provider() -> AIProvider:
    if settings.DEMO_MODE:
        return MockAIProvider()
    
    # Placeholder for real implementations:
    # if settings.OPENAI_API_KEY:
    #     return OpenAIProvider(api_key=settings.OPENAI_API_KEY)
    # elif settings.ANTHROPIC_API_KEY:
    #     return AnthropicProvider(api_key=settings.ANTHROPIC_API_KEY)
        
    # Fallback to mock if no keys are provided even if demo mode is false
    return MockAIProvider()
