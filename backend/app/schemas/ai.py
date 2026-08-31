from pydantic import BaseModel, Field
from typing import List

class ResearchSummary(BaseModel):
    company_summary: str = Field(..., description="A brief summary of the company")
    relevant_pr_angles: List[str] = Field(..., description="List of relevant PR angles for this company")
    personalization_opportunities: List[str] = Field(..., description="Opportunities to personalize outreach")
    suggested_talking_points: List[str] = Field(..., description="Suggested talking points for the pitch")

class OutreachDraft(BaseModel):
    subject: str = Field(..., description="Subject line for the outreach message")
    message: str = Field(..., description="The body of the personalized outreach message")
    personalization_points: List[str] = Field(..., description="List of personalization points used in the message")
