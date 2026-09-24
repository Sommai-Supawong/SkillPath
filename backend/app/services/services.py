from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.domain import CareerSpec, GapAnalyzer, Learner, Requirement, RoadmapEngine, SkillSpec
from app.domain.strategies import STRATEGIES
from app.models import LearnerProfile, Roadmap, RoadmapItem, SkillAssessment
from app.repositories import CareerRepository, ProfileRepository, RoadmapRepository, SkillRepository
from app.schemas.api import (
    AnalysisOut, CareerDetail, CareerSummary, PrerequisiteOut, ProfileCreate, ProfileOut,
    ProfileUpdate, RequirementOut, ResourceOut, RoadmapItemOut, RoadmapOut, SkillAnalysis, SkillOut,
)


def not_found(label: str) -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, f"{label} not found.")


def skill_out(skill) -> SkillOut:
    return SkillOut(
        id=skill.id, name=skill.name, description=skill.description, category=skill.category,
        skill_type=skill.skill_type, icon_key=skill.icon_key, icon_kind=skill.icon_kind,
        difficulty=skill.difficulty, hours_per_level=skill.hours_per_level,
        prerequisites=[PrerequisiteOut(skill_id=p.prerequisite_skill_id, skill_name=p.prerequisite_skill.name, minimum_level=p.minimum_level) for p in skill.prerequisites],
    )


def career_detail(career) -> CareerDetail:
    return CareerDetail(
        id=career.id, title=career.title, description=career.description, category=career.category,
        required_skill_count=len(career.requirements),
        requirements=[RequirementOut(skill=skill_out(r.skill), required_level=r.required_level, importance=r.importance) for r in career.requirements],
    )


def to_domain(profile, career):
    requirement_skill_ids = {r.skill_id for r in career.requirements}
    skill_specs = {}
    for requirement in career.requirements:
        skill = requirement.skill
        skill_specs[skill.id] = SkillSpec(
            id=skill.id, name=skill.name, difficulty=skill.difficulty,
            hours_per_level=skill.hours_per_level,
            prerequisites=tuple(p.prerequisite_skill_id for p in skill.prerequisites if p.prerequisite_skill_id in requirement_skill_ids),
        )
    career_spec = CareerSpec(career.id, career.title, tuple(
        Requirement(skill_specs[r.skill_id], r.required_level, r.importance) for r in career.requirements
    ))
    learner = Learner(profile.id, profile.name, profile.weekly_hours, {a.skill_id: a.current_level for a in profile.assessments})
    return learner, career_spec


class CareerService:
    def __init__(self, db: Session): self.repo = CareerRepository(db)
    def list(self):
        return [CareerSummary(
            id=c.id, title=c.title, description=c.description, category=c.category,
            required_skill_count=len(c.requirements),
            top_skills=[skill_out(r.skill) for r in c.requirements[:5]],
        ) for c in self.repo.list()]
    def get(self, career_id: int):
        career = self.repo.get(career_id)
        if not career: raise not_found("Career")
        return career_detail(career)


class SkillService:
    def __init__(self, db: Session): self.repo = SkillRepository(db)
    def list(self): return [skill_out(s) for s in self.repo.list()]
    def resources(self, skill_id: int):
        skill = self.repo.get(skill_id)
        if not skill: raise not_found("Skill")
        return [ResourceOut.model_validate(resource) for resource in skill.resources]


class ProfileService:
    def __init__(self, db: Session):
        self.db = db; self.repo = ProfileRepository(db); self.careers = CareerRepository(db); self.skills = SkillRepository(db)

    def create(self, payload: ProfileCreate):
        if payload.target_career_id and not self.careers.get(payload.target_career_id): raise not_found("Career")
        return ProfileOut.model_validate(self.repo.save(LearnerProfile(**payload.model_dump())))

    def get_model(self, profile_id: int):
        profile = self.repo.get(profile_id)
        if not profile: raise not_found("Profile")
        return profile

    def get(self, profile_id: int): return ProfileOut.model_validate(self.get_model(profile_id))

    def update(self, profile_id: int, payload: ProfileUpdate):
        profile = self.get_model(profile_id)
        data = payload.model_dump(exclude_unset=True)
        if "target_career_id" in data and data["target_career_id"] and not self.careers.get(data["target_career_id"]): raise not_found("Career")
        for key, value in data.items(): setattr(profile, key, value)
        return ProfileOut.model_validate(self.repo.save(profile))

    def save_assessments(self, profile_id: int, assessments):
        profile = self.get_model(profile_id)
        if len({item.skill_id for item in assessments}) != len(assessments):
            raise HTTPException(422, "Each skill may appear only once in an assessment request.")
        existing = {item.skill_id: item for item in profile.assessments}
        for item in assessments:
            if not self.skills.get(item.skill_id): raise not_found(f"Skill {item.skill_id}")
            if item.skill_id in existing: existing[item.skill_id].current_level = item.current_level
            else: profile.assessments.append(SkillAssessment(skill_id=item.skill_id, current_level=item.current_level))
        self.repo.save(profile)
        return self.get(profile_id)


class AnalysisService:
    def __init__(self, db: Session): self.profiles = ProfileService(db); self.careers = CareerRepository(db)
    def analyze(self, profile_id: int, career_id: int | None = None):
        profile = self.profiles.get_model(profile_id)
        selected_id = career_id or profile.target_career_id
        if not selected_id: raise HTTPException(400, "Please select a target career first.")
        career = self.careers.get(selected_id)
        if not career: raise not_found("Career")
        learner, career_spec = to_domain(profile, career)
        readiness, gaps = GapAnalyzer().analyze(learner, career_spec)
        return AnalysisOut(profile_id=profile.id, career_id=career.id, career=career.title, readiness=readiness, skills=[
            SkillAnalysis(skill_id=g.skill.id, skill=g.skill.name, skill_type=next(r.skill.skill_type for r in career.requirements if r.skill_id == g.skill.id),
                          icon_key=next(r.skill.icon_key for r in career.requirements if r.skill_id == g.skill.id),
                          icon_kind=next(r.skill.icon_kind for r in career.requirements if r.skill_id == g.skill.id),
                          current_level=g.current_level, required_level=g.required_level,
                          gap=g.gap, importance=g.importance, readiness=g.readiness, priority_score=g.priority_score, status=g.status)
            for g in sorted(gaps, key=lambda item: -item.priority_score)
        ])


def roadmap_out(roadmap) -> RoadmapOut:
    return RoadmapOut(
        id=roadmap.id, profile_id=roadmap.profile_id, career_id=roadmap.career_id, career=roadmap.career.title,
        strategy=roadmap.strategy, weekly_hours=roadmap.profile.weekly_hours, readiness_before=roadmap.readiness_before,
        estimated_weeks=roadmap.estimated_weeks, created_at=roadmap.created_at,
        items=[RoadmapItemOut(
            id=item.id, skill_id=item.skill_id, skill=item.skill.name, position=item.position,
            skill_type=item.skill.skill_type, icon_key=item.skill.icon_key, icon_kind=item.skill.icon_kind,
            current_level=item.current_level, target_level=item.target_level, estimated_hours=item.estimated_hours,
            start_week=item.start_week, end_week=item.end_week, status=item.status,
            resources=[ResourceOut.model_validate(r) for r in item.skill.resources],
        ) for item in roadmap.items],
    )


class RoadmapService:
    def __init__(self, db: Session):
        self.db = db; self.repo = RoadmapRepository(db); self.profiles = ProfileService(db); self.careers = CareerRepository(db)

    def generate(self, profile_id: int, career_id: int, strategy_name: str, existing: Roadmap | None = None):
        profile = self.profiles.get_model(profile_id); career = self.careers.get(career_id)
        if not career: raise not_found("Career")
        if not profile.assessments: raise HTTPException(400, "Please complete your skill assessment first.")
        learner, career_spec = to_domain(profile, career)
        strategy_cls = STRATEGIES.get(strategy_name)
        if not strategy_cls: raise HTTPException(422, "Unknown roadmap strategy.")
        plan = RoadmapEngine(GapAnalyzer(), strategy_cls()).generate(learner, career_spec)
        previous_status = {item.skill_id: item.status for item in existing.items} if existing else {}
        roadmap = existing or Roadmap(profile_id=profile_id, career_id=career_id, strategy=strategy_name, readiness_before=plan.readiness)
        roadmap.strategy = strategy_name; roadmap.readiness_before = plan.readiness; roadmap.estimated_weeks = plan.estimated_weeks
        if existing: existing.items.clear(); self.db.flush()
        roadmap.items = [RoadmapItem(
            skill_id=step.skill.id, position=index, current_level=step.current_level, target_level=step.target_level,
            estimated_hours=step.estimated_hours, start_week=step.start_week, end_week=step.end_week,
            status=previous_status.get(step.skill.id, "not_started"),
        ) for index, step in enumerate(plan.steps, 1)]
        return roadmap_out(self.repo.save(roadmap))

    def get_model(self, roadmap_id: int):
        roadmap = self.repo.get(roadmap_id)
        if not roadmap: raise not_found("Roadmap")
        return roadmap

    def get(self, roadmap_id: int): return roadmap_out(self.get_model(roadmap_id))

    def update_item(self, item_id: int, status_value: str | None, current_level: int | None):
        item = self.db.get(RoadmapItem, item_id)
        if not item: raise not_found("Roadmap item")
        if status_value is not None: item.status = status_value
        if current_level is not None:
            profile = self.profiles.get_model(item.roadmap.profile_id)
            existing = next((a for a in profile.assessments if a.skill_id == item.skill_id), None)
            if existing: existing.current_level = current_level
            else: profile.assessments.append(SkillAssessment(skill_id=item.skill_id, current_level=current_level))
            item.current_level = current_level
            if current_level >= item.target_level: item.status = "completed"
        self.db.commit()
        return self.get(item.roadmap_id)

    def recalculate(self, roadmap_id: int):
        roadmap = self.get_model(roadmap_id)
        return self.generate(roadmap.profile_id, roadmap.career_id, roadmap.strategy, roadmap)
