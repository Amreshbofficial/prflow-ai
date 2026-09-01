import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.domain import Base, Lead, OutreachMessage, FollowUp, Activity
from app.db.session import engine, SessionLocal

def seed_real_data():
    db = SessionLocal()
    try:
        # Clear existing data
        print("Clearing existing data...")
        db.query(Activity).delete()
        db.query(FollowUp).delete()
        db.query(OutreachMessage).delete()
        db.query(Lead).delete()
        db.commit()

        print("Seeding new real-world data...")
        
        # 1. Create realistic Leads
        leads_data = [
            {
                "company_name": "Stripe",
                "website": "https://stripe.com",
                "contact_name": "Patrick Collison",
                "contact_email": "patrick@stripe.com",
                "job_title": "CEO",
                "industry": "FinTech",
                "location": "San Francisco, CA",
                "company_size": "1000-5000",
                "linkedin_url": "https://linkedin.com/in/patrickcollison",
                "description": "Financial infrastructure platform for the internet.",
                "status": "Contacted"
            },
            {
                "company_name": "Vercel",
                "website": "https://vercel.com",
                "contact_name": "Guillermo Rauch",
                "contact_email": "guillermo@vercel.com",
                "job_title": "Founder & CEO",
                "industry": "Cloud Computing",
                "location": "Remote",
                "company_size": "100-500",
                "linkedin_url": "https://linkedin.com/in/guillermorauch",
                "description": "Frontend cloud platform for seamless deployment.",
                "status": "Replied"
            },
            {
                "company_name": "Linear",
                "website": "https://linear.app",
                "contact_name": "Karri Saarinen",
                "contact_email": "karri@linear.app",
                "job_title": "CEO",
                "industry": "SaaS",
                "location": "San Francisco, CA",
                "company_size": "50-100",
                "linkedin_url": "https://linkedin.com/in/karrisaarinen",
                "description": "Issue tracking for modern software teams.",
                "status": "Meeting"
            },
            {
                "company_name": "Supabase",
                "website": "https://supabase.com",
                "contact_name": "Paul Copplestone",
                "contact_email": "paul@supabase.com",
                "job_title": "CEO",
                "industry": "Database / Open Source",
                "location": "Singapore",
                "company_size": "50-200",
                "linkedin_url": "https://linkedin.com/in/paulcopplestone",
                "description": "Open source Firebase alternative.",
                "status": "New"
            },
            {
                "company_name": "Anthropic",
                "website": "https://anthropic.com",
                "contact_name": "Daniela Amodei",
                "contact_email": "daniela@anthropic.com",
                "job_title": "President",
                "industry": "Artificial Intelligence",
                "location": "San Francisco, CA",
                "company_size": "100-500",
                "linkedin_url": "https://linkedin.com/in/danielaamodei",
                "description": "AI safety and research company.",
                "status": "Contacted"
            }
        ]
        
        db_leads = []
        for lead_dict in leads_data:
            lead = Lead(**lead_dict)
            db.add(lead)
            db_leads.append(lead)
            
        db.commit()
        for lead in db_leads:
            db.refresh(lead)

        now = datetime.now()

        # 2. Add Activities for Leads
        for i, lead in enumerate(db_leads):
            db.add(Activity(
                lead_id=lead.id,
                type="lead_added",
                description=f"Added {lead.company_name} to pipeline",
                created_at=now - timedelta(days=10 - i)
            ))

        # 3. Add Outreach Messages
        # Stripe
        msg_stripe = OutreachMessage(
            lead_id=db_leads[0].id,
            channel="Email",
            goal="Introduction",
            tone="Professional",
            subject="Streamlining internal developer workflows at Stripe",
            message="Hi Patrick,\n\nI saw your recent post about Stripe's developer experience focus. We've built a platform that reduces CI/CD times by 40% for large monorepos, and I'd love to show you how we could support Stripe's engineering team.\n\nAre you open to a quick chat next week?\n\nBest,\nAmresh",
            ai_generated=True,
            status="Sent",
            created_at=now - timedelta(days=5)
        )
        db.add(msg_stripe)
        
        # Vercel
        msg_vercel = OutreachMessage(
            lead_id=db_leads[1].id,
            channel="LinkedIn",
            goal="Partnership",
            tone="Casual",
            subject="Partnership discussion",
            message="Hey Guillermo, love what Vercel is doing with Next.js 14! We just launched a native integration and it's flying. Would love to get your eyes on it and explore a co-marketing push.",
            ai_generated=True,
            status="Sent",
            created_at=now - timedelta(days=3)
        )
        db.add(msg_vercel)

        # Linear
        msg_linear = OutreachMessage(
            lead_id=db_leads[2].id,
            channel="Email",
            goal="Meeting Request",
            tone="Direct",
            subject="Enterprise deployment feature",
            message="Hi Karri,\n\nLinear's speed is unmatched. I'm reaching out because we're looking for an issue tracker that handles our custom enterprise deployment stages, and Linear looks like a perfect fit. Do you have 15 mins to discuss an Enterprise plan?\n\nThanks,\nAmresh",
            ai_generated=False,
            status="Sent",
            created_at=now - timedelta(days=7)
        )
        db.add(msg_linear)

        db.commit()
        db.refresh(msg_stripe)
        db.refresh(msg_vercel)
        db.refresh(msg_linear)

        # 4. Add Followups
        db.add(FollowUp(
            lead_id=db_leads[0].id, # Stripe
            outreach_id=msg_stripe.id,
            due_at=now + timedelta(days=2),
            note="Follow up if Patrick doesn't reply to the first intro email.",
            status="Pending"
        ))
        
        db.add(FollowUp(
            lead_id=db_leads[2].id, # Linear
            outreach_id=msg_linear.id,
            due_at=now - timedelta(days=1), # Overdue
            note="Send calendar invite for the enterprise plan discussion.",
            status="Pending"
        ))

        db.add(FollowUp(
            lead_id=db_leads[1].id, # Vercel
            outreach_id=msg_vercel.id,
            due_at=now - timedelta(days=2),
            completed_at=now - timedelta(days=1),
            note="Followed up on LinkedIn message.",
            status="Completed"
        ))

        # 5. Add Activities for Outreach/Followups
        db.add(Activity(
            lead_id=db_leads[0].id,
            type="email_sent",
            description="Sent introduction email to Patrick Collison",
            created_at=now - timedelta(days=5)
        ))
        db.add(Activity(
            lead_id=db_leads[1].id,
            type="reply_received",
            description="Guillermo replied to the LinkedIn message",
            created_at=now - timedelta(days=2)
        ))
        db.add(Activity(
            lead_id=db_leads[2].id,
            type="meeting_booked",
            description="Booked an Enterprise discovery call with Karri",
            created_at=now - timedelta(days=1)
        ))

        db.commit()
        print("Database successfully seeded with realistic SaaS data!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_real_data()
