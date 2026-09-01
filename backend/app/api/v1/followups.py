from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from app.api import deps
from app.models.domain import User, FollowUp, Lead, Activity
from app.schemas.followup import FollowupCreate, FollowupResponse

router = APIRouter()


class FollowupSnooze(BaseModel):
    new_due_at: datetime


@router.get("", response_model=List[FollowupResponse])
def get_followups(
    db: Session = Depends(deps.get_db),
    status: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
):
    query = (
        db.query(FollowUp)
        .options(joinedload(FollowUp.lead))
        .join(Lead, FollowUp.lead_id == Lead.id)
        .filter(Lead.owner_id == current_user.id)
    )
    if status:
        query = query.filter(FollowUp.status == status)
    
    followups = query.order_by(FollowUp.due_at.asc()).all()
    return followups

@router.post("", response_model=FollowupResponse)
def create_followup(
    *,
    db: Session = Depends(deps.get_db),
    followup_in: FollowupCreate,
    current_user: User = Depends(deps.get_current_user),
):
    # Verify the lead belongs to the user
    lead = db.query(Lead).filter(Lead.id == followup_in.lead_id, Lead.owner_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    followup = FollowUp(**followup_in.model_dump(), owner_id=current_user.id)
    db.add(followup)
    db.commit()
    db.refresh(followup)
    
    activity = Activity(
        lead_id=followup.lead_id,
        type="followup_scheduled",
        description=f"Follow-up scheduled for {followup.due_at.strftime('%Y-%m-%d')}"
    )
    db.add(activity)
    db.commit()
    
    return followup

@router.patch("/{id}/complete", response_model=FollowupResponse)
def complete_followup(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    followup = (
        db.query(FollowUp)
        .join(Lead, FollowUp.lead_id == Lead.id)
        .filter(FollowUp.id == id, Lead.owner_id == current_user.id)
        .first()
    )
    if not followup:
        raise HTTPException(status_code=404, detail="Followup not found")
        
    followup.status = "Completed"
    followup.completed_at = datetime.now(timezone.utc)
    
    activity = Activity(
        lead_id=followup.lead_id,
        type="followup_completed",
        description="Follow-up completed"
    )
    db.add(activity)
    
    db.commit()
    db.refresh(followup)
    return followup


@router.patch("/{id}/snooze", response_model=FollowupResponse)
def snooze_followup(
    id: int,
    body: FollowupSnooze,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Reschedule a follow-up to a new date."""
    followup = (
        db.query(FollowUp)
        .join(Lead, FollowUp.lead_id == Lead.id)
        .filter(FollowUp.id == id, Lead.owner_id == current_user.id)
        .first()
    )
    if not followup:
        raise HTTPException(status_code=404, detail="Followup not found")

    if followup.status == "Completed":
        raise HTTPException(status_code=400, detail="Cannot snooze a completed follow-up")

    old_date = followup.due_at.strftime('%Y-%m-%d') if followup.due_at else "unknown"
    followup.due_at = body.new_due_at
    followup.status = "Pending"

    activity = Activity(
        lead_id=followup.lead_id,
        type="followup_rescheduled",
        description=f"Follow-up rescheduled from {old_date} to {body.new_due_at.strftime('%Y-%m-%d')}"
    )
    db.add(activity)
    db.commit()
    db.refresh(followup)
    return followup


@router.delete("/{id}")
def delete_followup(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    followup = (
        db.query(FollowUp)
        .join(Lead, FollowUp.lead_id == Lead.id)
        .filter(FollowUp.id == id, Lead.owner_id == current_user.id)
        .first()
    )
    if not followup:
        raise HTTPException(status_code=404, detail="Followup not found")

    db.delete(followup)
    db.commit()
    return {"success": True}
