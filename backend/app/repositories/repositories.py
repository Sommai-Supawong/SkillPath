from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models import Career, CareerSkillRequirement, LearnerProfile, Roadmap, RoadmapItem, Skill, SkillAssessment, SkillPrerequisite


class CareerRepository:
    def __init__(self, db: Session): self.db = db

    def list(self) -> list[Career]:
        return list(self.db.scalars(select(Career).options(
            selectinload(Career.requirements).selectinload(CareerSkillRequirement.skill)
        ).order_by(Career.title)))

    def get(self, career_id: int) -> Career | None:
        return self.db.scalar(select(Career).where(Career.id == career_id).options(
            selectinload(Career.requirements).selectinload(CareerSkillRequirement.skill).selectinload(Skill.prerequisites).selectinload(SkillPrerequisite.prerequisite_skill)
        ))


class SkillRepository:
    def __init__(self, db: Session): self.db = db

    def list(self) -> list[Skill]:
        return list(self.db.scalars(select(Skill).options(
            selectinload(Skill.prerequisites).selectinload(SkillPrerequisite.prerequisite_skill)
        ).order_by(Skill.category, Skill.name)))

    def get(self, skill_id: int) -> Skill | None:
        return self.db.scalar(select(Skill).where(Skill.id == skill_id).options(
            selectinload(Skill.prerequisites).selectinload(SkillPrerequisite.prerequisite_skill),
            selectinload(Skill.resources),
        ))


class ProfileRepository:
    def __init__(self, db: Session): self.db = db

    def get(self, profile_id: int) -> LearnerProfile | None:
        return self.db.scalar(select(LearnerProfile).where(LearnerProfile.id == profile_id).options(
            selectinload(LearnerProfile.assessments).selectinload(SkillAssessment.skill),
            selectinload(LearnerProfile.target_career),
        ))

    def save(self, profile: LearnerProfile) -> LearnerProfile:
        self.db.add(profile); self.db.commit(); self.db.refresh(profile); return profile


class RoadmapRepository:
    def __init__(self, db: Session): self.db = db

    def get(self, roadmap_id: int) -> Roadmap | None:
        return self.db.scalar(select(Roadmap).where(Roadmap.id == roadmap_id).options(
            selectinload(Roadmap.profile), selectinload(Roadmap.career),
            selectinload(Roadmap.items).selectinload(RoadmapItem.skill).selectinload(Skill.resources),
        ))

    def save(self, roadmap: Roadmap) -> Roadmap:
        self.db.add(roadmap); self.db.commit(); self.db.refresh(roadmap); return self.get(roadmap.id)
