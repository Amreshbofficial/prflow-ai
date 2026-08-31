from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models.domain import User, Lead, OutreachMessage, Followup

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    total_leads = db.query(Lead).count()
    # Mocking new this week since we don't have a robust date filter for MVP
    new_this_week = db.query(Lead).filter(Lead.status == "New").count() 
    
    outreach_sent = db.query(OutreachMessage).filter(OutreachMessage.status == "Sent").count()
    followups_due = db.query(Followup).filter(Followup.status == "Pending").count()
    
    # AI usage stats
    ai_generated_msgs = db.query(OutreachMessage).filter(OutreachMessage.ai_generated == True).count()
    
    return {
        "total_leads": total_leads,
        "new_this_week": new_this_week,
        "outreach_sent": outreach_sent,
        "followups_due": followups_due,
        "ai_generated_messages": ai_generated_msgs
    }
