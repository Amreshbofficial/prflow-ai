from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.domain import User, Lead, OutreachMessage, Activity
from app.schemas.outreach import OutreachGenerate, OutreachResponse, OutreachUpdate
from app.services.ai.service import AIServiceRunner

router = APIRouter()

@router.post("/generate", response_model=OutreachResponse)
def generate_outreach(
    *,
    db: Session = Depends(deps.get_db),
    outreach_in: OutreachGenerate,
    current_user: User = Depends(deps.get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == outreach_in.lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    ai_runner = AIServiceRunner(db)
    
    try:
        draft = ai_runner.generate_outreach(
            lead=lead,
            goal=outreach_in.goal,
            tone=outreach_in.tone,
            channel=outreach_in.channel,
            key_angle=outreach_in.key_angle
        )
        
        # Save the AI generated message
        message = OutreachMessage(
            lead_id=lead.id,
            channel=outreach_in.channel,
            goal=outreach_in.goal,
            tone=outreach_in.tone,
            subject=draft.subject,
            message=draft.message,
            ai_generated=True,
            human_edited=False,
            status="Draft"
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        
        activity = Activity(
            lead_id=lead.id,
            type="outreach_generated",
            description=f"AI generated a draft {outreach_in.channel} outreach"
        )
        db.add(activity)
        db.commit()
        
        return message
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{id}", response_model=OutreachResponse)
def update_outreach(
    id: int,
    outreach_in: OutreachUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    message = db.query(OutreachMessage).filter(OutreachMessage.id == id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
        
    update_data = outreach_in.model_dump(exclude_unset=True)
    
    # If content changed and not explicitly set, mark as human edited
    if ('subject' in update_data or 'message' in update_data) and 'human_edited' not in update_data:
        message.human_edited = True
        
    for field, value in update_data.items():
        setattr(message, field, value)
        
    if message.status == "Sent":
        # Log activity when sent
        activity = Activity(
            lead_id=message.lead_id,
            type="outreach_sent",
            description=f"Sent {message.channel} outreach"
        )
        db.add(activity)
        
        # Update lead status
        lead = db.query(Lead).filter(Lead.id == message.lead_id).first()
        if lead and lead.status in ["New", "Researching"]:
            lead.status = "Contacted"
            db.add(lead)
            
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message
