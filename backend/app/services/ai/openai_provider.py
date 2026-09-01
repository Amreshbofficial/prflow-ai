from typing import Type, TypeVar, Any
from openai import OpenAI
from app.services.ai.base import AIProvider

T = TypeVar("T")


class OpenAIProvider(AIProvider):
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)

    def generate_structured(self, system_prompt: str, user_prompt: str, response_model: Type[T]) -> T:
        """
        Generate a structured response using OpenAI, validated by Pydantic response_model.
        """
        import json

        # Add JSON schema instructions so the model returns valid JSON
        schema = response_model.model_json_schema()
        schema_str = json.dumps(schema, indent=2)

        enhanced_user_prompt = (
            f"{user_prompt}\n\n"
            f"Return your response as a valid JSON object matching this schema:\n{schema_str}"
        )

        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt + " Always return valid JSON only. No markdown, no extra text."},
                {"role": "user", "content": enhanced_user_prompt},
            ],
            temperature=0.7,
            max_tokens=800,
        )

        raw = response.choices[0].message.content
        if not raw:
            raise ValueError("OpenAI returned empty response")

        # Strip markdown code fences if present
        text = raw.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1] if "\n" in text else text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

        parsed = json.loads(text)
        return response_model.model_validate(parsed)
