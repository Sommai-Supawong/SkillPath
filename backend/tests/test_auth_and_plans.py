import os
os.environ["TESTING"] = "1"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import pytest

from app.main import app as fastapi_app
from app.core.database import Base, get_db
from app.models.user import User
from app.models.development_plan import DevelopmentPlan
from app.models.entities import Career, Skill, CareerSkillRequirement, LearnerProfile
from sqlalchemy.pool import StaticPool

engine = create_engine(
    os.environ["DATABASE_URL"], 
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

client = TestClient(fastapi_app)

@pytest.fixture(scope="module", autouse=True)
def setup_data():
    fastapi_app.dependency_overrides[get_db] = override_get_db
    db = TestingSessionLocal()
    from app.models.entities import Career, Skill, CareerSkillRequirement, LearnerProfile
    
    # Create some skills
    s1 = Skill(name="HTML", category="Frontend", hours_per_level=5)
    s2 = Skill(name="JS", category="Frontend", hours_per_level=10)
    db.add_all([s1, s2])
    db.commit()
    
    # Create a career
    c = Career(title="Test Career", description="Test", category="Test")
    db.add(c)
    db.commit()
    
    req1 = CareerSkillRequirement(career_id=c.id, skill_id=s1.id, required_level=4, importance=3)
    req2 = CareerSkillRequirement(career_id=c.id, skill_id=s2.id, required_level=5, importance=5)
    db.add_all([req1, req2])
    db.commit()
    
    yield
    db.close()
    fastapi_app.dependency_overrides.pop(get_db, None)

def test_auth_no_token():
    response = client.get("/api/users/me")
    assert response.status_code in [401, 403] # HTTPBearer returns 403 if no token

def test_auth_invalid_token():
    response = client.get("/api/users/me", headers={"Authorization": "Bearer invalid-token"})
    assert response.status_code == 401

def test_auth_valid_token_auto_creates_user():
    response = client.get("/api/users/me", headers={"Authorization": "Bearer mock-valid-token-user1"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "user1@example.com"
    assert "id" in data

def test_plan_creation_and_ownership():
    # User 1 creates a profile
    prof_response = client.post("/api/profiles", json={"name": "User 1 Profile", "target_career_id": 1, "weekly_hours": 10})
    profile_id = prof_response.json()["id"]
    
    # User 1 creates a plan
    plan_response = client.post(
        "/api/plans", 
        json={"name": "My Plan", "career_id": 1, "learner_profile_id": profile_id, "strategy": "balanced", "weekly_hours": 10},
        headers={"Authorization": "Bearer mock-valid-token-user1"}
    )
    assert plan_response.status_code == 201
    plan_id = plan_response.json()["id"]
    
    # User 1 gets plan
    get_response = client.get(f"/api/plans/{plan_id}", headers={"Authorization": "Bearer mock-valid-token-user1"})
    assert get_response.status_code == 200
    assert get_response.json()["name"] == "My Plan"
    
    # User 2 cannot get plan
    get_response_user2 = client.get(f"/api/plans/{plan_id}", headers={"Authorization": "Bearer mock-valid-token-user2"})
    assert get_response_user2.status_code == 404

def test_progress_update_and_completion():
    # Fetch User 1 plan
    plans_res = client.get("/api/plans", headers={"Authorization": "Bearer mock-valid-token-user1"})
    plan = plans_res.json()[0]
    plan_id = plan["id"]
    profile_id = plan["learner_profile_id"]
    
    # Update progress (Simulate meeting requirements)
    # HTML -> 4, JS -> 5
    client.post(f"/api/profiles/{profile_id}/assessments", json={"assessments": [{"skill_id": 1, "current_level": 4}, {"skill_id": 2, "current_level": 5}]})
    
    # Recalculate plan progress
    prog_res = client.post(f"/api/plans/{plan_id}/progress", headers={"Authorization": "Bearer mock-valid-token-user1"})
    assert prog_res.status_code == 200
    data = prog_res.json()
    
    assert data["current_readiness"] >= 100
    assert data["status"] == "COMPLETED"
    assert data["completed_at"] is not None

def test_plan_crud_operations():
    # 1. Create plan without learner_profile_id (auto-create profile)
    res_create = client.post(
        "/api/plans",
        json={"name": "Auto Profile Plan", "career_id": 1, "strategy": "fast_track", "weekly_hours": 12},
        headers={"Authorization": "Bearer mock-valid-token-user1"}
    )
    assert res_create.status_code == 201
    created_plan = res_create.json()
    assert created_plan["name"] == "Auto Profile Plan"
    assert created_plan["strategy"] == "fast_track"
    assert created_plan["weekly_hours"] == 12.0
    assert created_plan["learner_profile_id"] is not None
    plan_id = created_plan["id"]

    # 2. Update plan (PUT /plans/{id})
    res_update = client.put(
        f"/api/plans/{plan_id}",
        json={"name": "Renamed Plan", "strategy": "foundation_first", "weekly_hours": 15, "status": "ARCHIVED"},
        headers={"Authorization": "Bearer mock-valid-token-user1"}
    )
    assert res_update.status_code == 200
    updated_plan = res_update.json()
    assert updated_plan["name"] == "Renamed Plan"
    assert updated_plan["strategy"] == "foundation_first"
    assert updated_plan["weekly_hours"] == 15.0
    assert updated_plan["status"] == "ARCHIVED"

    # 3. Read updated plan (GET /plans/{id})
    res_get = client.get(f"/api/plans/{plan_id}", headers={"Authorization": "Bearer mock-valid-token-user1"})
    assert res_get.status_code == 200
    assert res_get.json()["name"] == "Renamed Plan"

    # 4. Delete plan (DELETE /plans/{id})
    res_delete = client.delete(f"/api/plans/{plan_id}", headers={"Authorization": "Bearer mock-valid-token-user1"})
    assert res_delete.status_code == 204

    # 5. Verify plan is gone (404)
    res_verify = client.get(f"/api/plans/{plan_id}", headers={"Authorization": "Bearer mock-valid-token-user1"})
    assert res_verify.status_code == 404
