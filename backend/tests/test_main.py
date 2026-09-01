"""
Test suite for PRFlow AI backend.

Uses SQLite in-memory for isolation — no live database required.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.session import Base, get_db
from app.main import app
from app.models.domain import User
from app.core.security import get_password_hash

# SQLite in-memory test database
TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def seeded_user(client):
    """Register a test user and return the token."""
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpassword123",
        },
    )
    assert response.status_code == 201

    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpassword123"},
    )
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


# ─── Health ──────────────────────────────────────────────────────────────

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


# ─── Auth ────────────────────────────────────────────────────────────────

def test_register_and_login(client):
    # Register
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "New User",
            "email": "new@example.com",
            "password": "password1234",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new@example.com"
    assert data["name"] == "New User"
    assert "password" not in data

    # Login
    login = client.post(
        "/api/v1/auth/login",
        data={"username": "new@example.com", "password": "password1234"},
    )
    assert login.status_code == 200
    assert "access_token" in login.json()


def test_duplicate_email_registration(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "User", "email": "dup@example.com", "password": "password1234"},
    )
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "User 2", "email": "dup@example.com", "password": "password1234"},
    )
    assert response.status_code == 409


def test_wrong_password_login(client):
    client.post(
        "/api/v1/auth/register",
        json={"name": "User", "email": "wrong@example.com", "password": "password1234"},
    )
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@example.com", "password": "badpassword"},
    )
    assert response.status_code == 401


# ─── Leads ───────────────────────────────────────────────────────────────

def test_leads_crud(client, seeded_user):
    headers = {"Authorization": f"Bearer {seeded_user}"}

    # Create
    create_resp = client.post(
        "/api/v1/leads",
        json={
            "company_name": "Acme Corp",
            "contact_name": "Jane Doe",
            "contact_email": "jane@acme.com",
            "industry": "Technology",
        },
        headers=headers,
    )
    assert create_resp.status_code == 200
    lead_id = create_resp.json()["id"]

    # List
    list_resp = client.get("/api/v1/leads", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] == 1

    # Get
    get_resp = client.get(f"/api/v1/leads/{lead_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["company_name"] == "Acme Corp"

    # Update
    update_resp = client.patch(
        f"/api/v1/leads/{lead_id}",
        json={"company_name": "Acme Industries"},
        headers=headers,
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["company_name"] == "Acme Industries"

    # Delete
    delete_resp = client.delete(f"/api/v1/leads/{lead_id}", headers=headers)
    assert delete_resp.status_code == 200

    # Verify deleted
    list_resp = client.get("/api/v1/leads", headers=headers)
    assert list_resp.json()["total"] == 0


def test_leads_data_isolation(client, seeded_user):
    """One user cannot see another user's leads."""
    headers = {"Authorization": f"Bearer {seeded_user}"}

    # Create a lead
    create_resp = client.post(
        "/api/v1/leads",
        json={"company_name": "Secret Corp", "contact_name": "Hidden"},
        headers=headers,
    )
    lead_id = create_resp.json()["id"]

    # Register second user
    client.post(
        "/api/v1/auth/register",
        json={"name": "Other", "email": "other@example.com", "password": "password1234"},
    )
    login2 = client.post(
        "/api/v1/auth/login",
        data={"username": "other@example.com", "password": "password1234"},
    )
    headers2 = {"Authorization": f"Bearer {login2.json()['access_token']}"}

    # Second user should NOT see first user's lead
    list_resp = client.get("/api/v1/leads", headers=headers2)
    assert list_resp.json()["total"] == 0

    # Second user should NOT be able to access first user's lead by ID
    get_resp = client.get(f"/api/v1/leads/{lead_id}", headers=headers2)
    assert get_resp.status_code == 404


# ─── Follow-ups ──────────────────────────────────────────────────────────

def test_followups_crud(client, seeded_user):
    headers = {"Authorization": f"Bearer {seeded_user}"}

    # Create lead first
    lead_resp = client.post(
        "/api/v1/leads",
        json={"company_name": "TestCo", "contact_name": "Bob"},
        headers=headers,
    )
    lead_id = lead_resp.json()["id"]

    # Create follow-up
    fu_resp = client.post(
        "/api/v1/followups",
        json={"lead_id": lead_id, "due_at": "2026-12-01T09:00:00", "note": "Follow up on intro"},
        headers=headers,
    )
    assert fu_resp.status_code == 200
    fu_id = fu_resp.json()["id"]
    assert fu_resp.json()["status"] == "Pending"

    # List
    list_resp = client.get("/api/v1/followups", headers=headers)
    assert len(list_resp.json()) == 1

    # Complete
    complete_resp = client.patch(f"/api/v1/followups/{fu_id}/complete", headers=headers)
    assert complete_resp.status_code == 200
    assert complete_resp.json()["status"] == "Completed"

    # Snooze (create another)
    fu2_resp = client.post(
        "/api/v1/followups",
        json={"lead_id": lead_id, "due_at": "2026-12-01T09:00:00", "note": "Snooze test"},
        headers=headers,
    )
    fu2_id = fu2_resp.json()["id"]

    snooze_resp = client.patch(
        f"/api/v1/followups/{fu2_id}/snooze",
        json={"new_due_at": "2026-12-15T09:00:00"},
        headers=headers,
    )
    assert snooze_resp.status_code == 200
    assert snooze_resp.json()["due_at"].startswith("2026-12-15")

    # Delete
    del_resp = client.delete(f"/api/v1/followups/{fu2_id}", headers=headers)
    assert del_resp.status_code == 200


# ─── Analytics ───────────────────────────────────────────────────────────

def test_analytics_returns_data(client, seeded_user):
    headers = {"Authorization": f"Bearer {seeded_user}"}

    resp = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_leads" in data
    assert "outreach_sent" in data
    assert "response_rate" in data
    assert "chart_data" in data
    assert "pipeline_distribution" in data
    assert data["total_leads"] == 0  # empty database


# ─── User Profile ────────────────────────────────────────────────────────

def test_user_profile_update(client, seeded_user):
    headers = {"Authorization": f"Bearer {seeded_user}"}

    # Get profile
    me = client.get("/api/v1/users/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["name"] == "Test User"

    # Update profile
    update = client.patch(
        "/api/v1/users/me",
        json={"name": "Updated Name", "role": "Director"},
        headers=headers,
    )
    assert update.status_code == 200
    assert update.json()["name"] == "Updated Name"

    # Change password
    pwd_resp = client.post(
        "/api/v1/users/me/change-password",
        json={"current_password": "testpassword123", "new_password": "newpassword123"},
        headers=headers,
    )
    assert pwd_resp.status_code == 200

    # Old password should fail
    login_old = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpassword123"},
    )
    assert login_old.status_code == 401

    # New password should work
    login_new = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "newpassword123"},
    )
    assert login_new.status_code == 200


# ─── Outreach ────────────────────────────────────────────────────────────

def test_outreach_generate(client, seeded_user):
    headers = {"Authorization": f"Bearer {seeded_user}"}

    # Create lead
    lead_resp = client.post(
        "/api/v1/leads",
        json={"company_name": "AI Corp", "contact_name": "Eve", "contact_email": "eve@ai.com"},
        headers=headers,
    )
    lead_id = lead_resp.json()["id"]

    # Generate outreach (mock AI provider since DEMO_MODE=true by default)
    gen_resp = client.post(
        "/api/v1/outreach/generate",
        json={
            "lead_id": lead_id,
            "channel": "Email",
            "goal": "Introductory Call",
            "tone": "Professional & Direct",
            "key_angle": "Recent product launch",
        },
        headers=headers,
    )
    assert gen_resp.status_code == 200
    assert gen_resp.json()["ai_generated"] is True
    assert gen_resp.json()["status"] == "Draft"

    # List outreach
    list_resp = client.get("/api/v1/outreach", headers=headers)
    assert len(list_resp.json()) == 1
