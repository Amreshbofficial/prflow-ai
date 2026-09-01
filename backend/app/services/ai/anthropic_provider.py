from typing import Type, TypeVar
from anthropic import Anthropic
from app.services.ai.base import AIProvider

T = TypeVar("T")


class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str):
        self.client = Anthropic(api_key=api_key)

    def generate_structured(self, system_prompt: str, user_prompt: str, response_model: Type[T]) -> T:
        """
        Generate a structured response using Anthropic, validated by Pydantic response_model.
        """
        import json

        schema = response_model.model_json_schema()
        schema_str = json.dumps(schema, indent=2)

        enhanced_user_prompt = (
            f"{user_prompt}\n\n"
            f"Return your response as a valid JSON object matching this schema:\n{schema_str}"
        )

        response = self.client.messages.create(
            model="claude-3-5-sonnet-20240620",
            system=system_prompt + " Always return valid JSON only. No markdown, no extra text.",
            messages=[{"role": "user", "content": enhanced_user_prompt}],
            temperature=0.7,
            max_tokens=800,
        )

        raw = response.content[0].text
        if not raw:
            raise ValueError("Anthropic returned empty response")

        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        parsed = json.loads(text)
        return response_model.model_validate(parsed)
