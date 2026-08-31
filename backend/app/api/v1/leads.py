from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app.models.domain import Lead, User, Activity
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadListResponse

router = APIRouter()

@router.get("", response_model=LeadListResponse)
def get_leads(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
):
    query = db.query(Lead)
    if status:
        query = query.filter(Lead.status == status)
        
    total = query.count()
    leads = query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    
    return {"items": leads, "total": total}

@router.post("", response_model=LeadResponse)
def create_lead(
    *,
    db: Session = Depends(deps.get_db),
    lead_in: LeadCreate,
    current_user: User = Depends(deps.get_current_user),
):
    lead = Lead(**lead_in.model_dump())
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    activity = Activity(
        lead_id=lead.id,
        type="created",
        description="Lead created manually"
    )
    db.add(activity)
    db.commit()
    
    return lead

@router.get("/{id}", response_model=LeadResponse)
def get_lead(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.patch("/{id}", response_model=LeadResponse)
def update_lead(
    id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    update_data = lead_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
        
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead

from app.schemas.ai import ResearchSummary
from app.services.ai.service import AIServiceRunner

@router.delete("/{id}")
def delete_lead(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    db.delete(lead)
    db.commit()
    return {"success": True}

@router.post("/{id}/research", response_model=ResearchSummary)
def generate_lead_research(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    ai_runner = AIServiceRunner(db)
    
    try:
        result = ai_runner.generate_lead_research(lead)
        
        # Log activity
        activity = Activity(
            lead_id=lead.id,
            type="research",
            description="AI Research Generated"
        )
        db.add(activity)
        
        # Update lead status if it was New
        if lead.status == "New":
            lead.status = "Researching"
            
        db.commit()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
