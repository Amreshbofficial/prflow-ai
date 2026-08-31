from typing import Type, TypeVar
from pydantic import BaseModel
from app.services.ai.base import AIProvider
from app.schemas.ai import ResearchSummary, OutreachDraft

T = TypeVar("T", bound=BaseModel)

class MockAIProvider(AIProvider):
    def generate_structured(self, system_prompt: str, user_prompt: str, response_model: Type[T]) -> T:
        """
        Deterministic but dynamic mock generation based on the input prompt.
        """
        company_name = "Unknown Company"
        contact_name = "Unknown Contact"
        
        # Try to extract details from the user prompt generically
        for line in user_prompt.split('\n'):
            if "Company:" in line:
                company_name = line.split("Company:")[1].strip()
            if "Contact:" in line:
                contact_name = line.split("Contact:")[1].strip()
                
        if response_model == ResearchSummary:
            return response_model(
                company_summary=f"{company_name} is an innovative company focused on delivering value in its industry.",
                relevant_pr_angles=[
                    f"{company_name}'s recent technological advancements.",
                    f"Leadership insights from executives at {company_name}.",
                    "Industry trends and how they adapt."
                ],
                personalization_opportunities=[
                    f"Mention their recent product update.",
                    f"Reference a recent article about {company_name}."
                ],
                suggested_talking_points=[
                    "How our solution aligns with your goals.",
                    "Potential synergies in the market."
                ]
            )
            
        if response_model == OutreachDraft:
            return response_model(
                subject=f"Exploring synergies with {company_name}",
                message=f"Hi {contact_name},\n\nI was impressed by the recent work at {company_name}. "
                        "I'd love to connect and discuss how we might collaborate on upcoming PR initiatives.\n\n"
                        "Best regards,\nAmresh",
                personalization_points=[
                    f"Addressed to {contact_name}",
                    f"Mentioned {company_name}"
                ]
            )
            
        raise ValueError("Unsupported response model for mock provider")
