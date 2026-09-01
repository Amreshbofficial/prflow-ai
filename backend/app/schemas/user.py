from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    default_tone: Optional[str] = None
    default_channel: Optional[str] = None
    email_notifications: Optional[bool] = None
    followup_reminders: Optional[bool] = None
    weekly_digest: Optional[bool] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserResponse(UserBase):
    id: int
    role: str
    default_tone: Optional[str] = "Professional & Direct"
    default_channel: Optional[str] = "Email"
    email_notifications: Optional[bool] = True
    followup_reminders: Optional[bool] = True
    weekly_digest: Optional[bool] = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
