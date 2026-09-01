from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Any
from datetime import datetime

class LeadBase(BaseModel):
    company_name: str
    website: Optional[str] = None
    contact_name: str
    contact_email: Optional[str] = None
    job_title: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    company_size: Optional[str] = None
    linkedin_url: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "New"

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    company_name: Optional[str] = None
    website: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    job_title: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    company_size: Optional[str] = None
    linkedin_url: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class LeadResponse(LeadBase):
    id: int
    research_data: Optional[Any] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LeadListResponse(BaseModel):
    items: List[LeadResponse]
    total: int

from app.schemas.outreach import OutreachResponse

class ActivityResponse(BaseModel):
    id: int
    type: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class LeadDetailResponse(LeadResponse):
    activities: List[ActivityResponse] = []
    outreach_messages: List[OutreachResponse] = []
