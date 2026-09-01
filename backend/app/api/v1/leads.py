from typing import List, Optional
import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func as sa_func

from app.api import deps
from app.models.domain import Lead, User, Activity
from app.schemas.lead import (
    LeadCreate, LeadUpdate, LeadResponse,
    LeadListResponse, LeadDetailResponse,
)
from app.schemas.ai import ResearchSummary
from app.services.ai.service import AIServiceRunner

router = APIRouter()


@router.get("", response_model=LeadListResponse)
def get_leads(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
):
    query = db.query(Lead).filter(Lead.owner_id == current_user.id)
    if status:
        query = query.filter(Lead.status == status)

    total = query.count()
    leads = query.order_by(Lead.created_at.desc()).offset(skip).limit(limit).all()
    return {"items": leads, "total": total}


@router.post("/import")
async def import_leads(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    text = content.decode('utf-8')
    reader = csv.DictReader(io.StringIO(text))

    imported_count = 0
    for row in reader:
        company_name = row.get("Company Name") or row.get("company_name") or row.get("Company")
        contact_name = row.get("Contact Name") or row.get("contact_name") or row.get("Contact")

        if not company_name or not contact_name:
            continue

        contact_email = row.get("Email") or row.get("email") or row.get("Contact Email")
        website = row.get("Website") or row.get("website")
        industry = row.get("Industry") or row.get("industry")
        job_title = row.get("Job Title") or row.get("job_title") or row.get("Title")

        lead = Lead(
            owner_id=current_user.id,
            company_name=company_name,
            contact_name=contact_name,
            contact_email=contact_email,
            website=website,
            industry=industry,
            job_title=job_title,
            status="New",
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)

        activity = Activity(
            lead_id=lead.id,
            type="created",
            description="Lead imported via CSV",
        )
        db.add(activity)
        imported_count += 1

    db.commit()
    return {"success": True, "count": imported_count}


@router.post("", response_model=LeadResponse)
def create_lead(
    *,
    db: Session = Depends(deps.get_db),
    lead_in: LeadCreate,
    current_user: User = Depends(deps.get_current_user),
):
    lead = Lead(**lead_in.model_dump(), owner_id=current_user.id)
    db.add(lead)
    db.commit()
    db.refresh(lead)

    activity = Activity(
        lead_id=lead.id,
        type="created",
        description="Lead created manually",
    )
    db.add(activity)
    db.commit()

    return lead


@router.get("/{id}", response_model=LeadDetailResponse)
def get_lead(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    lead = (
        db.query(Lead)
        .options(
            joinedload(Lead.activities),
            joinedload(Lead.outreach_messages),
        )
        .filter(Lead.id == id, Lead.owner_id == current_user.id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.activities.sort(key=lambda x: x.created_at or "", reverse=True)
    lead.outreach_messages.sort(key=lambda x: x.created_at or "", reverse=True)
    return lead


@router.patch("/{id}", response_model=LeadResponse)
def update_lead(
    id: int,
    lead_in: LeadUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == id, Lead.owner_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = lead_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)

    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{id}")
def delete_lead(
    id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == id, Lead.owner_id == current_user.id).first()
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
    lead = db.query(Lead).filter(Lead.id == id, Lead.owner_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    ai_runner = AIServiceRunner(db, owner_id=current_user.id)

    try:
        result = ai_runner.generate_lead_research(lead)

        # Persist research data to the lead
        lead.research_data = result.model_dump()

        # Log activity
        activity = Activity(
            lead_id=lead.id,
            type="research",
            description="AI Research Generated",
        )
        db.add(activity)

        # Update lead status if it was New
        if lead.status == "New":
            lead.status = "Researching"

        db.commit()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
