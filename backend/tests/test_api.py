import os

os.environ["DATABASE_URL"] = "sqlite:///./test_skillpath.db"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from app.core.database import Base, SessionLocal, engine
from app.main import app
from app.models import Career, CareerSkillRequirement, Skill, SkillPrerequisite
from app.seed import seed


@pytest.fixture(scope="module")
def client():
    Base.metadata.drop_all(bind=engine)
    seed()
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)


def test_complete_adaptive_flow(client):
    careers = client.get("/api/careers")
    assert careers.status_code == 200 and len(careers.json()) == 15
    frontend = next(item for item in careers.json() if item["title"] == "Frontend Developer")
    detail = client.get(f"/api/careers/{frontend['id']}").json()
    assert len(detail["requirements"]) >= 7

    profile_response = client.post("/api/profiles", json={"name": "Demo Learner", "weekly_hours": 8, "target_career_id": frontend["id"]})
    assert profile_response.status_code == 201
    profile_id = profile_response.json()["id"]
    assessments = [{"skill_id": req["skill"]["id"], "current_level": 1} for req in detail["requirements"]]
    assert client.post(f"/api/profiles/{profile_id}/assessments", json={"assessments": assessments}).status_code == 200

    analysis_before = client.get(f"/api/profiles/{profile_id}/analysis").json()
    roadmap_response = client.post("/api/roadmaps/generate", json={"profile_id": profile_id, "career_id": frontend["id"], "strategy": "balanced"})
    assert roadmap_response.status_code == 201
    roadmap = roadmap_response.json()
    names = [item["skill"] for item in roadmap["items"]]
    assert names.index("JavaScript") < names.index("React") < names.index("Next.js")

    javascript = next(item for item in roadmap["items"] if item["skill"] == "JavaScript")
    update = client.patch(f"/api/roadmap-items/{javascript['id']}", json={"current_level": javascript["target_level"], "status": "completed"})
    assert update.status_code == 200
    recalculated = client.post(f"/api/roadmaps/{roadmap['id']}/recalculate")
    assert recalculated.status_code == 200
    analysis_after = client.get(f"/api/profiles/{profile_id}/analysis").json()
    assert analysis_after["readiness"] > analysis_before["readiness"]
    assert "JavaScript" not in [item["skill"] for item in recalculated.json()["items"]]

    alternative = client.post("/api/roadmaps/generate", json={"profile_id": profile_id, "career_id": frontend["id"], "strategy": "foundation_first"})
    assert alternative.status_code == 201


def test_errors_are_human_readable(client):
    assert client.get("/api/careers/99999").json()["detail"] == "Career not found."
    response = client.post("/api/profiles", json={"name": "", "weekly_hours": 0})
    assert response.status_code == 422


EXPECTED_CAREERS = {
    "Full Stack Developer", "Software Engineer", "DevOps Engineer", "QA Automation Engineer",
    "AI Engineer", "Machine Learning Engineer", "Generative AI Engineer", "Data Scientist",
    "Data Engineer", "Cloud Engineer",
}


@pytest.mark.parametrize(("career_title", "expected_skills"), [
    ("Full Stack Developer", {"HTML", "CSS", "JavaScript", "React", "FastAPI", "SQL", "Docker"}),
    ("Software Engineer", {"Object-Oriented Programming", "Algorithms", "Testing", "System Design"}),
    ("DevOps Engineer", {"Docker", "CI/CD", "Cloud Fundamentals", "Kubernetes", "Terraform"}),
    ("QA Automation Engineer", {"Software Testing Fundamentals", "API Testing", "Playwright", "Selenium"}),
    ("AI Engineer", {"Machine Learning", "Deep Learning", "MLOps Fundamentals"}),
    ("Machine Learning Engineer", {"Statistics", "Machine Learning", "Model Evaluation"}),
    ("Generative AI Engineer", {"Large Language Models", "Embeddings", "Vector Databases", "Retrieval-Augmented Generation"}),
    ("Data Scientist", {"Python", "SQL", "Statistics", "Machine Learning"}),
    ("Data Engineer", {"SQL", "ETL", "Data Warehouse", "Apache Spark", "Apache Airflow"}),
    ("Cloud Engineer", {"Networking Fundamentals", "Cloud Fundamentals", "Identity and Access Management", "Terraform", "Monitoring & Observability"}),
])
def test_expanded_career_requirements(client, career_title, expected_skills):
    careers = client.get("/api/careers").json()
    assert EXPECTED_CAREERS <= {career["title"] for career in careers}
    selected = next(career for career in careers if career["title"] == career_title)
    detail = client.get(f"/api/careers/{selected['id']}").json()
    assert expected_skills <= {requirement["skill"]["name"] for requirement in detail["requirements"]}


def test_seed_integrity_and_idempotency(client):
    seed()
    with SessionLocal() as db:
        assert db.scalar(select(func.count(Career.id))) == 15
        assert db.scalar(select(func.count(func.distinct(Career.title)))) == 15
        assert db.scalar(select(func.count(Skill.id))) == db.scalar(select(func.count(func.distinct(Skill.name))))
        assert db.scalar(select(func.count(CareerSkillRequirement.id))) == db.scalar(select(func.count()).select_from(
            select(CareerSkillRequirement.career_id, CareerSkillRequirement.skill_id).distinct().subquery()
        ))
        assert db.scalar(select(func.count(SkillPrerequisite.id))) == db.scalar(select(func.count()).select_from(
            select(SkillPrerequisite.skill_id, SkillPrerequisite.prerequisite_skill_id).distinct().subquery()
        ))


@pytest.mark.parametrize("career_title", [
    "Full Stack Developer", "AI Engineer", "Machine Learning Engineer", "Generative AI Engineer",
    "Data Scientist", "Data Engineer", "DevOps Engineer", "Cloud Engineer",
])
def test_gap_analysis_and_roadmap_are_generic(client, career_title):
    career = next(item for item in client.get("/api/careers").json() if item["title"] == career_title)
    detail = client.get(f"/api/careers/{career['id']}").json()
    profile = client.post("/api/profiles", json={"name": "Dataset Check", "weekly_hours": 10, "target_career_id": career["id"]}).json()
    assessments = [{"skill_id": req["skill"]["id"], "current_level": 0} for req in detail["requirements"]]
    assert client.post(f"/api/profiles/{profile['id']}/assessments", json={"assessments": assessments}).status_code == 200
    assert client.get(f"/api/profiles/{profile['id']}/analysis").status_code == 200
    roadmap = client.post("/api/roadmaps/generate", json={"profile_id": profile["id"], "career_id": career["id"], "strategy": "balanced"})
    assert roadmap.status_code == 201 and roadmap.json()["items"]


def test_representative_prerequisite_ordering(client):
    cases = {
        "Full Stack Developer": [("JavaScript", "React"), ("React", "Next.js")],
        "Generative AI Engineer": [("Transformers", "Large Language Models"), ("Embeddings", "Vector Databases"), ("Vector Databases", "Retrieval-Augmented Generation")],
        "Data Engineer": [("SQL", "Data Modeling"), ("ETL", "Data Warehouse"), ("ETL", "Apache Airflow")],
        "Cloud Engineer": [("Cloud Fundamentals", "AWS"), ("Infrastructure as Code", "Terraform")],
    }
    for career_title, pairs in cases.items():
        career = next(item for item in client.get("/api/careers").json() if item["title"] == career_title)
        detail = client.get(f"/api/careers/{career['id']}").json()
        profile = client.post("/api/profiles", json={"name": "Ordering Check", "weekly_hours": 10, "target_career_id": career["id"]}).json()
        client.post(f"/api/profiles/{profile['id']}/assessments", json={"assessments": [
            {"skill_id": req["skill"]["id"], "current_level": 0} for req in detail["requirements"]
        ]})
        items = client.post("/api/roadmaps/generate", json={"profile_id": profile["id"], "career_id": career["id"], "strategy": "balanced"}).json()["items"]
        positions = {item["skill"]: item["position"] for item in items}
        for prerequisite, dependent in pairs:
            assert positions[prerequisite] < positions[dependent]
