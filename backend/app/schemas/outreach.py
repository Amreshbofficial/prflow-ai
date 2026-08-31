from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OutreachGenerate(BaseModel):
    lead_id: int
    channel: str
    goal: str
    tone: str
    key_angle: str

class OutreachResponse(BaseModel):
    id: int
    lead_id: int
    channel: str
    goal: str
    tone: str
    subject: Optional[str]
    message: str
    ai_generated: bool
    human_edited: bool
    status: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class OutreachUpdate(BaseModel):
    subject: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None
    human_edited: Optional[bool] = None
