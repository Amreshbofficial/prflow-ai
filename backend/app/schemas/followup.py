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

class FollowupResponse(FollowupBase):
    id: int
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
