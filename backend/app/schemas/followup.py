from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FollowupBase(BaseModel):
    lead_id: int
    outreach_id: Optional[int] = None
    due_at: datetime
    note: Optional[str] = None
    status: Optional[str] = "Pending"

class FollowupCreate(FollowupBase):
    pass

class FollowupLeadInfo(BaseModel):
    id: int
    company_name: str
    contact_name: str
    
    class Config:
        from_attributes = True

class FollowupResponse(FollowupBase):
    id: int
    created_at: datetime
    completed_at: Optional[datetime]
    lead: Optional[FollowupLeadInfo] = None

    class Config:
        from_attributes = True
