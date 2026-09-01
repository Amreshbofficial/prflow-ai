from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from app.api import deps
from app.models.domain import User, Lead, OutreachMessage, FollowUp, Activity

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    now = datetime.now(timezone.utc)
    user_leads = db.query(Lead).filter(Lead.owner_id == current_user.id)
    user_lead_ids_q = user_leads.with_entities(Lead.id).subquery()

    total_leads = user_leads.count()
    week_ago = now - timedelta(days=7)
    new_this_week = user_leads.filter(Lead.created_at >= week_ago).count()

    outreach_sent = (
        db.query(OutreachMessage)
        .join(Lead, OutreachMessage.lead_id == Lead.id)
        .filter(Lead.owner_id == current_user.id, OutreachMessage.status == "Sent")
        .count()
    )
    followups_due = (
        db.query(FollowUp)
        .join(Lead, FollowUp.lead_id == Lead.id)
        .filter(Lead.owner_id == current_user.id, FollowUp.status == "Pending")
        .count()
    )
    ai_generated_msgs = (
        db.query(OutreachMessage)
        .join(Lead, OutreachMessage.lead_id == Lead.id)
        .filter(Lead.owner_id == current_user.id, OutreachMessage.ai_generated == True)
        .count()
    )

    # Outreach volume by day (last 7 days)
    today = now.date()
    days = [(today - timedelta(days=i)) for i in range(6, -1, -1)]

    user_outreach = (
        db.query(OutreachMessage)
        .join(Lead, OutreachMessage.lead_id == Lead.id)
        .filter(Lead.owner_id == current_user.id)
        .all()
    )

    chart_data = []
    for d in days:
        day_sent = sum(1 for msg in user_outreach if msg.created_at and msg.created_at.date() == d and msg.status == 'Sent')
        day_draft = sum(1 for msg in user_outreach if msg.created_at and msg.created_at.date() == d and msg.status != 'Sent')
        chart_data.append({
            "name": d.strftime("%a"),
            "sent": day_sent,
            "drafts": day_draft
        })

    # Recent activities for this user's leads
    recent_activities = (
        db.query(Activity)
        .join(Lead, Activity.lead_id == Lead.id)
        .filter(Lead.owner_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .limit(10)
        .all()
    )

    # Pipeline distribution
    status_counts = (
        db.query(Lead.status, func.count(Lead.id))
        .filter(Lead.owner_id == current_user.id)
        .group_by(Lead.status)
        .all()
    )
    pipeline_distribution = [{"name": s[0] or "Unknown", "value": s[1]} for s in status_counts]

    # Response rate: replied / total contacted
    contacted = user_leads.filter(Lead.status.in_(["Contacted", "Replied", "Meeting", "Converted"])).count()
    replied = user_leads.filter(Lead.status.in_(["Replied", "Meeting", "Converted"])).count()
    response_rate = round((replied / contacted * 100), 1) if contacted > 0 else 0.0

    # Follow-ups overdue
    followups_overdue = (
        db.query(FollowUp)
        .join(Lead, FollowUp.lead_id == Lead.id)
        .filter(
            Lead.owner_id == current_user.id,
            FollowUp.status == "Pending",
            FollowUp.due_at < now
        )
        .count()
    )

    return {
        "total_leads": total_leads,
        "new_this_week": new_this_week,
        "outreach_sent": outreach_sent,
        "followups_due": followups_due,
        "ai_generated_messages": ai_generated_msgs,
        "response_rate": response_rate,
        "followups_overdue": followups_overdue,
        "chart_data": chart_data,
        "pipeline_distribution": pipeline_distribution,
        "recent_activities": [
            {
                "id": a.id,
                "type": a.type,
                "description": a.description,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "lead_id": a.lead_id
            } for a in recent_activities
        ]
    }
