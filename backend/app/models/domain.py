from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="consultant")
    default_tone = Column(String(100), default="Professional & Direct")
    default_channel = Column(String(50), default="Email")
    email_notifications = Column(Boolean, default=True)
    followup_reminders = Column(Boolean, default=True)
    weekly_digest = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    leads = relationship("Lead", back_populates="owner")

class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    company_name = Column(String(255), nullable=False)
    website = Column(String(255))
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255))
    job_title = Column(String(255))
    industry = Column(String(255))
    location = Column(String(255))
    company_size = Column(String(50))
    linkedin_url = Column(String(255))
    description = Column(Text)
    research_data = Column(JSON, nullable=True)  # Persisted AI research results
    status = Column(String(50), default="New")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="leads")
    outreach_messages = relationship("OutreachMessage", back_populates="lead", cascade="all, delete-orphan")
    followups = relationship("FollowUp", back_populates="lead", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")

class OutreachMessage(Base):
    __tablename__ = "outreach_messages"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    channel = Column(String(50))
    goal = Column(String(100))
    tone = Column(String(50))
    subject = Column(String(255))
    message = Column(Text)
    ai_generated = Column(Boolean, default=False)
    human_edited = Column(Boolean, default=False)
    status = Column(String(50), default="Draft")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    lead = relationship("Lead", back_populates="outreach_messages")
    followups = relationship("FollowUp", back_populates="outreach")

class FollowUp(Base):
    __tablename__ = "followups"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    outreach_id = Column(Integer, ForeignKey("outreach_messages.id"))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    due_at = Column(DateTime(timezone=True))
    note = Column(Text)
    status = Column(String(50), default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))

    lead = relationship("Lead", back_populates="followups")
    outreach = relationship("OutreachMessage", back_populates="followups")

class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    type = Column(String(50))
    description = Column(String(255))
    meta_data = Column("metadata", JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    lead = relationship("Lead", back_populates="activities")

class AIRun(Base):
    __tablename__ = "ai_runs"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Link AI runs to users
    provider = Column(String(50))
    model = Column(String(100))
    task_type = Column(String(50))
    prompt_version = Column(String(50))
    input_data = Column(JSON)
    output_data = Column(JSON)
    validation_status = Column(String(50))
    status = Column(String(50))
    latency_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
