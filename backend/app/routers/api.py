from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.api import (
    AnalysisOut, AssessmentBatch, CareerDetail, CareerSummary, ProfileCreate, ProfileOut,
    ProfileUpdate, ResourceOut, RoadmapGenerate, RoadmapGraphOut, RoadmapItemUpdate, RoadmapOut, SkillOut,
)
from app.services.services import AnalysisService, CareerService, ProfileService, RoadmapService, SkillService

router = APIRouter()


@router.get("/careers", response_model=list[CareerSummary])
def list_careers(db: Session = Depends(get_db)):
    return CareerService(db).list()


@router.get("/careers/{career_id}", response_model=CareerDetail)
def get_career(career_id: int, db: Session = Depends(get_db)):
    return CareerService(db).get(career_id)


@router.get("/skills", response_model=list[SkillOut])
def list_skills(db: Session = Depends(get_db)):
    return SkillService(db).list()


@router.get("/skills/{skill_id}/resources", response_model=list[ResourceOut])
def skill_resources(skill_id: int, db: Session = Depends(get_db)):
    return SkillService(db).resources(skill_id)


@router.post("/profiles", response_model=ProfileOut, status_code=201)
def create_profile(payload: ProfileCreate, db: Session = Depends(get_db)):
    return ProfileService(db).create(payload)


@router.get("/profiles/{profile_id}", response_model=ProfileOut)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    return ProfileService(db).get(profile_id)


@router.put("/profiles/{profile_id}", response_model=ProfileOut)
def update_profile(profile_id: int, payload: ProfileUpdate, db: Session = Depends(get_db)):
    return ProfileService(db).update(profile_id, payload)


@router.post("/profiles/{profile_id}/assessments", response_model=ProfileOut)
def submit_assessments(profile_id: int, payload: AssessmentBatch, db: Session = Depends(get_db)):
    return ProfileService(db).save_assessments(profile_id, payload.assessments)


@router.get("/profiles/{profile_id}/analysis", response_model=AnalysisOut)
def analyze_profile(profile_id: int, career_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    return AnalysisService(db).analyze(profile_id, career_id)


@router.post("/roadmaps/generate", response_model=RoadmapOut, status_code=201)
def generate_roadmap(payload: RoadmapGenerate, db: Session = Depends(get_db)):
    return RoadmapService(db).generate(payload.profile_id, payload.career_id, payload.strategy)


@router.get("/roadmaps/{roadmap_id}", response_model=RoadmapOut)
def get_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    return RoadmapService(db).get(roadmap_id)


@router.get("/roadmaps/{roadmap_id}/graph", response_model=RoadmapGraphOut)
def get_roadmap_graph(roadmap_id: int, db: Session = Depends(get_db)):
    return RoadmapService(db).graph(roadmap_id)


@router.patch("/roadmap-items/{item_id}", response_model=RoadmapOut)
def update_roadmap_item(item_id: int, payload: RoadmapItemUpdate, db: Session = Depends(get_db)):
    return RoadmapService(db).update_item(item_id, payload.status, payload.current_level)


@router.post("/roadmaps/{roadmap_id}/recalculate", response_model=RoadmapOut)
def recalculate_roadmap(roadmap_id: int, db: Session = Depends(get_db)):
    return RoadmapService(db).recalculate(roadmap_id)
