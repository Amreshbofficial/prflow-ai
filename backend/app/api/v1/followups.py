from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.domain import User, Followup, Activity
from app.schemas.followup import FollowupCreate, FollowupResponse

router = APIRouter()

@router.get("", response_model=List[FollowupResponse])
def get_followups(
    db: Session = Depends(deps.get_db),
    status: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
):
    query = db.query(Followup)
    if status:
        query = query.filter(Followup.status == status)
    
    followups = query.order_by(Followup.due_at.asc()).all()
    return followups

@router.post("", response_model=FollowupResponse)
def create_followup(
    *,
    db: Session = Depends(deps.get_db),
    followup_in: FollowupCreate,
    current_user: User = Depends(deps.get_current_user),
):
    followup = Followup(**followup_in.model_dump())
    db.add(followup)
    db.commit()
    db.refresh(followup)
    
    # Log activity
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
    followup = db.query(Followup).filter(Followup.id == id).first()
    if not followup:
        raise HTTPException(status_code=404, detail="Followup not found")
        
    followup.status = "Completed"
    
    activity = Activity(
        lead_id=followup.lead_id,
        type="followup_completed",
        description="Follow-up completed"
    )
    db.add(activity)
    
    db.commit()
    db.refresh(followup)
    return followup
