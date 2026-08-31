import os
import sys

# Add the backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal, engine, Base
from app.models.domain import User, Lead, Activity
from app.core.security import get_password_hash

def seed_db():
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if demo user exists
    demo_email = "demo@prflow.ai"
    user = db.query(User).filter(User.email == demo_email).first()
    
    if not user:
        print("Creating demo user...")
        demo_user = User(
            name="Amresh Demo",
            email=demo_email,
            password_hash=get_password_hash("password123"),
            role="consultant"
        )
        db.add(demo_user)
        db.commit()
    else:
        print("Demo user already exists.")

    # Check for leads
    if db.query(Lead).count() == 0:
        print("Creating demo leads...")
        leads_data = [
            {"company_name": "TechNova AI", "contact_name": "Sarah Wilson", "contact_email": "sarah@technova.ai", "industry": "AI Infrastructure", "status": "New"},
            {"company_name": "Vertex Robotics", "contact_name": "David Chen", "contact_email": "david@vertex.io", "industry": "Robotics", "status": "Contacted"},
            {"company_name": "CloudMesh", "contact_name": "Emily Rivera", "contact_email": "emily@cloudmesh.com", "industry": "Cloud Infrastructure", "status": "Researching"},
            {"company_name": "FinEdge", "contact_name": "Michael Patel", "contact_email": "michael@finedge.dev", "industry": "FinTech", "status": "Replied"},
        ]
        
        for lead_info in leads_data:
            lead = Lead(**lead_info)
            db.add(lead)
            db.commit()
            
            # Add an activity
            activity = Activity(
                lead_id=lead.id,
                type="created",
                description="Lead added to the system",
            )
            db.add(activity)
        db.commit()
    else:
        print("Leads already exist. Skipping seed.")

    db.close()
    print("Database seeding completed.")

if __name__ == "__main__":
    seed_db()
