#!/usr/bin/env python
"""Seed the database with realistic demo data for PRFlow AI."""
import os
import sys
from datetime import datetime, timedelta, timezone

# Ensure we're using SQLite for local dev
os.environ.setdefault("DATABASE_URL", "sqlite:///./app/prflow_dev.db")
os.environ.setdefault("DEMO_MODE", "true")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import Base, engine, SessionLocal
from app.models.domain import User, Lead, OutreachMessage, FollowUp, Activity, AIRun
from app.core.security import get_password_hash


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # ── Demo User ──────────────────────────────────────────────
    demo_user = User(
        name="Sarah Chen",
        email="demo@prflow.ai",
        password_hash=get_password_hash("password123"),
        role="Senior Consultant",
        default_tone="Professional & Direct",
        default_channel="Email",
        email_notifications=True,
        followup_reminders=True,
        weekly_digest=False,
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # ── Leads ──────────────────────────────────────────────────
    leads_data = [
        {
            "company_name": "TechNova AI",
            "website": "https://technova.ai",
            "contact_name": "James Rodriguez",
            "contact_email": "james@technova.ai",
            "job_title": "VP of Marketing",
            "industry": "Artificial Intelligence",
            "location": "San Francisco, CA",
            "company_size": "51-200",
            "linkedin_url": "https://linkedin.com/in/jamesrodriguez",
            "description": "AI-powered analytics platform helping enterprises make data-driven decisions. Series B startup with $45M in funding.",
            "status": "Researching",
            "research_data": {
                "company_summary": "TechNova AI is a Series B AI analytics company with $45M funding, serving enterprise clients.",
                "relevant_pr_angles": [
                    "AI democratization for non-technical teams",
                    "Series B funding milestone",
                    "Enterprise AI adoption trends"
                ],
                "personalization_opportunities": [
                    "James recently spoke at AI Summit about data democratization",
                    "Company expanded into EU market this quarter"
                ],
                "suggested_talking_points": [
                    "How PR can amplify their EU expansion story",
                    "Thought leadership positioning for James as AI evangelist"
                ]
            },
        },
        {
            "company_name": "Vertex Robotics",
            "website": "https://vertexrobotics.com",
            "contact_name": "Dr. Aisha Patel",
            "contact_email": "aisha@vertexrobotics.com",
            "job_title": "Chief Technology Officer",
            "industry": "Robotics",
            "location": "Austin, TX",
            "company_size": "201-500",
            "linkedin_url": "https://linkedin.com/in/aishapatel",
            "description": "Industrial robotics company specializing in warehouse automation. Named to Fast Company's Most Innovative Companies list.",
            "status": "New",
        },
        {
            "company_name": "CloudMesh",
            "website": "https://cloudmesh.io",
            "contact_name": "Marcus Thompson",
            "contact_email": "marcus@cloudmesh.io",
            "job_title": "Head of Communications",
            "industry": "Cloud Infrastructure",
            "location": "Seattle, WA",
            "company_size": "51-200",
            "linkedin_url": "https://linkedin.com/in/marcusthompson",
            "description": "Multi-cloud management platform simplifying infrastructure for DevOps teams. 10,000+ customers globally.",
            "status": "Contacted",
        },
        {
            "company_name": "FinEdge Capital",
            "website": "https://finedge.capital",
            "contact_name": "Rachel Kim",
            "contact_email": "rachel@finedge.capital",
            "job_title": "Managing Director",
            "industry": "Fintech",
            "location": "New York, NY",
            "company_size": "11-50",
            "linkedin_url": "https://linkedin.com/in/rachelkim",
            "description": "Quantitative trading firm leveraging machine learning for alternative data analysis. Managing $2B AUM.",
            "status": "New",
        },
        {
            "company_name": "GreenLoop",
            "website": "https://greenloop.eco",
            "contact_name": "Elena Vasquez",
            "contact_email": "elena@greenloop.eco",
            "job_title": "Co-Founder & CEO",
            "industry": "CleanTech",
            "location": "Portland, OR",
            "company_size": "11-50",
            "linkedin_url": "https://linkedin.com/in/elenavasquez",
            "description": "Circular economy platform connecting manufacturers with recycled material suppliers. Winner of MIT Climate Prize.",
            "status": "New",
        },
        {
            "company_name": "MedAI Systems",
            "website": "https://medaisystems.com",
            "contact_name": "Dr. Michael Chen",
            "contact_email": "michael@medaisystems.com",
            "job_title": "Chief Medical Officer",
            "industry": "HealthTech",
            "location": "Boston, MA",
            "company_size": "201-500",
            "linkedin_url": "https://linkedin.com/in/michaelchen-md",
            "description": "AI diagnostic imaging platform approved by FDA. Deployed in 200+ hospitals across North America.",
            "status": "Researching",
        },
    ]

    now = datetime.now(timezone.utc)
    leads = []
    for i, data in enumerate(leads_data):
        lead = Lead(owner_id=demo_user.id, **data)
        db.add(lead)
        db.commit()
        db.refresh(lead)
        leads.append(lead)

        # Create creation activity
        activity = Activity(
            lead_id=lead.id,
            type="created",
            description=f"Lead created {'manually' if i > 0 else 'from referral'}",
        )
        db.add(activity)

        # Add research activity for leads that are in Researching status
        if lead.status == "Researching":
            activity = Activity(
                lead_id=lead.id,
                type="research",
                description="AI Research Generated",
            )
            db.add(activity)

    db.commit()

    # ── Outreach Messages ──────────────────────────────────────
    outreach_data = [
        {
            "lead": leads[0],  # TechNova AI - Contacted
            "channel": "Email",
            "goal": "Introductory Call",
            "tone": "Professional & Direct",
            "subject": "Partnership Opportunity - PR for TechNova AI's EU Expansion",
            "message": "Hi James,\n\nI noticed TechNova AI recently expanded into the EU market — congratulations on that milestone. At PRFlow Communications, we specialize in helping Series B tech companies build their narrative in new markets.\n\nWe've helped companies like DataWeave and NeuralPath amplify their expansion stories through thought leadership, media relations, and executive visibility programs.\n\nWould you be open to a 15-minute call to discuss how we might support TechNova's EU communications strategy?\n\nBest regards,\nSarah Chen",
            "ai_generated": True,
            "human_edited": True,
            "status": "Sent",
        },
        {
            "lead": leads[2],  # CloudMesh
            "channel": "Email",
            "goal": "Media Feature Pitch",
            "tone": "Warm & Personable",
            "subject": "CloudMesh + PRFlow: Amplifying Your DevOps Story",
            "message": "Hi Marcus,\n\nCloudMesh's approach to multi-cloud management is exactly the kind of story that resonates with tech journalists right now. With 10,000+ customers and growing, there's a strong narrative around how you're simplifying cloud complexity.\n\nI'd love to explore how PRFlow could help position CloudMesh in key infrastructure publications.\n\nLet me know if you have time for a quick conversation.\n\nBest,\nSarah",
            "ai_generated": True,
            "human_edited": False,
            "status": "Sent",
        },
        {
            "lead": leads[0],  # TechNova AI - another draft
            "channel": "LinkedIn",
            "goal": "Thought Leadership Placement",
            "tone": "Professional & Direct",
            "subject": "Thought Leadership: James Rodriguez on AI Democratization",
            "message": "James,\n\nYour recent talk at AI Summit on data democratization was compelling. We're working with several AI leaders to place bylined articles in publications like TechCrunch and VentureBeat.\n\nGiven your perspective on making AI accessible to non-technical teams, I think there's a strong story here. Would you be interested in exploring a thought leadership program?",
            "ai_generated": True,
            "human_edited": True,
            "status": "Draft",
        },
    ]

    outreach_messages = []
    for data in outreach_data:
        lead = data.pop("lead")
        msg = OutreachMessage(lead_id=lead.id, **data)
        db.add(msg)
        db.commit()
        db.refresh(msg)
        outreach_messages.append(msg)

    # ── Follow-ups ─────────────────────────────────────────────
    followup_data = [
        {
            "lead": leads[0],
            "due_at": now + timedelta(days=1),
            "note": "Follow up on EU expansion PR proposal. James said he'd review by Friday.",
            "status": "Pending",
        },
        {
            "lead": leads[1],
            "due_at": now + timedelta(days=3),
            "note": "Initial outreach to Dr. Patel about robotics PR coverage.",
            "status": "Pending",
        },
        {
            "lead": leads[2],
            "due_at": now - timedelta(days=1),
            "note": "Marcus hasn't responded to the media pitch email. Try LinkedIn.",
            "status": "Pending",
        },
        {
            "lead": leads[3],
            "due_at": now + timedelta(days=5),
            "note": "Schedule introductory call with Rachel Kim about fintech PR.",
            "status": "Pending",
        },
        {
            "lead": leads[4],
            "due_at": now - timedelta(days=3),
            "note": "Send Elena the CleanTech media kit and case studies.",
            "status": "Completed",
            "completed_at": now - timedelta(days=2),
        },
        {
            "lead": leads[5],
            "due_at": now + timedelta(days=7),
            "note": "Prepare healthcare PR proposal for MedAI Systems.",
            "status": "Pending",
        },
    ]

    for data in followup_data:
        lead = data.pop("lead")
        completed_at = data.pop("completed_at", None)
        fu = FollowUp(lead_id=lead.id, owner_id=demo_user.id, **data)
        if completed_at:
            fu.completed_at = completed_at
        db.add(fu)
    db.commit()

    # ── AI Runs ────────────────────────────────────────────────
    ai_run = AIRun(
        owner_id=demo_user.id,
        provider="MockAIProvider",
        model="mock-v1",
        task_type="lead_research",
        prompt_version="v1",
        input_data={"company": "TechNova AI", "industry": "AI"},
        output_data=leads[0].research_data,
        validation_status="success",
        status="completed",
        latency_ms=150,
    )
    db.add(ai_run)
    db.commit()

    db.close()
    print("[OK] Database seeded successfully!")
    print("   User: demo@prflow.ai / password123")
    print("   Leads: %d" % len(leads_data))
    print("   Outreach: %d" % len(outreach_data))
    print("   Follow-ups: %d" % len(followup_data))


if __name__ == "__main__":
    seed()
