from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
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
    lead = db.query(Lead).filter(Lead.id == outreach_in.lead_id, Lead.owner_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    ai_runner = AIServiceRunner(db, owner_id=current_user.id)
    
    try:
        draft = ai_runner.generate_outreach(
            lead=lead,
            goal=outreach_in.goal,
            tone=outreach_in.tone,
            channel=outreach_in.channel,
            key_angle=outreach_in.key_angle
        )
        
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

@router.get("", response_model=List[OutreachResponse])
def get_all_outreach(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    messages = (
        db.query(OutreachMessage)
        .join(Lead, OutreachMessage.lead_id == Lead.id)
        .filter(Lead.owner_id == current_user.id)
        .order_by(OutreachMessage.created_at.desc())
        .all()
    )
    return messages

@router.get("/{id}", response_model=OutreachResponse)
def get_outreach(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    message = (
        db.query(OutreachMessage)
        .join(Lead, OutreachMessage.lead_id == Lead.id)
        .filter(OutreachMessage.id == id, Lead.owner_id == current_user.id)
        .first()
    )
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    return message

@router.patch("/{id}", response_model=OutreachResponse)
def update_outreach(
    id: int,
    outreach_in: OutreachUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    message = (
        db.query(OutreachMessage)
        .join(Lead, OutreachMessage.lead_id == Lead.id)
        .filter(OutreachMessage.id == id, Lead.owner_id == current_user.id)
        .first()
    )
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
        
    update_data = outreach_in.model_dump(exclude_unset=True)
    
    if ('subject' in update_data or 'message' in update_data) and 'human_edited' not in update_data:
        message.human_edited = True
        
    for field, value in update_data.items():
        setattr(message, field, value)
        
    if message.status == "Sent":
        activity = Activity(
            lead_id=message.lead_id,
            type="outreach_sent",
            description=f"Sent {message.channel} outreach"
        )
        db.add(activity)
        
        lead = db.query(Lead).filter(Lead.id == message.lead_id, Lead.owner_id == current_user.id).first()
        if lead and lead.status in ["New", "Researching"]:
            lead.status = "Contacted"
            db.add(lead)
            
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message


@router.post("/{id}/send")
def send_outreach_email(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Send an outreach email via Resend. Transitions status: Draft->Sending->Sent/Failed."""
    message = (
        db.query(OutreachMessage)
        .join(Lead, OutreachMessage.lead_id == Lead.id)
        .filter(OutreachMessage.id == id, Lead.owner_id == current_user.id)
        .first()
    )
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message.status not in ("Draft", "Failed"):
        raise HTTPException(status_code=400, detail=f"Cannot send outreach in '{message.status}' status")

    if not message.lead.contact_email:
        raise HTTPException(status_code=400, detail="No recipient email address available")

    recipient_email = message.lead.contact_email  # type: ignore
    if not message.subject or not message.subject.strip():
        raise HTTPException(status_code=400, detail="Subject line is required")
    if not message.message or not message.message.strip():
        raise HTTPException(status_code=400, detail="Message body is required")

    # Set to Sending
    message.status = "Sending"
    db.commit()

    try:
        from app.services.email import send_email
        send_email(
            to=recipient_email,
            subject=message.subject,
            body=message.message,
        )
        message.status = "Sent"
        message.updated_at = None  # will be auto-set
        db.commit()
        db.refresh(message)

        # Update lead status
        lead = db.query(Lead).filter(Lead.id == message.lead_id, Lead.owner_id == current_user.id).first()
        if lead and lead.status in ["New", "Researching"]:
            lead.status = "Contacted"
            db.commit()

        activity = Activity(
            lead_id=message.lead_id,
            type="outreach_sent",
            description=f"Sent {message.channel} outreach to {recipient_email}"
        )
        db.add(activity)
        db.commit()

        return {"success": True, "status": "Sent"}

    except Exception as e:
        message.status = "Failed"
        db.commit()
        activity = Activity(
            lead_id=message.lead_id,
            type="outreach_failed",
            description=f"Failed to send outreach: {str(e)[:200]}"
        )
        db.add(activity)
        db.commit()
        raise HTTPException(status_code=502, detail=f"Email sending failed: {str(e)}")
