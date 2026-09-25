from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Optional
from app.models.development_plan import DevelopmentPlan
from app.models.entities import LearnerProfile, Career, SkillAssessment, utcnow
from app.schemas.development_plan import DevelopmentPlanCreate, DevelopmentPlanUpdate
from app.services.services import AnalysisService
from app.repositories.plan_repository import DevelopmentPlanRepository

class PlanService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = DevelopmentPlanRepository(db)

    def create_plan(self, user_id: int, payload: DevelopmentPlanCreate) -> DevelopmentPlan:
        career = self.db.get(Career, payload.career_id)
        if not career:
            raise HTTPException(status_code=404, detail="Career not found")

        profile = None
        if payload.learner_profile_id:
            profile = self.db.get(LearnerProfile, payload.learner_profile_id)
            existing_owner = self.db.query(DevelopmentPlan.user_id).filter(
                DevelopmentPlan.learner_profile_id == payload.learner_profile_id
            ).first()
            if existing_owner and existing_owner[0] != user_id:
                raise HTTPException(status_code=404, detail="Profile not found")
        
        if not profile:
            profile = LearnerProfile(
                name=payload.name or career.title,
                target_career_id=career.id,
                weekly_hours=payload.weekly_hours or 8.0,
            )
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)

        # Initialize default assessments (level 0) if profile has none yet
        if not profile.assessments and career.requirements:
            for r in career.requirements:
                self.db.add(SkillAssessment(
                    profile_id=profile.id,
                    skill_id=r.skill_id,
                    current_level=0
                ))
            self.db.commit()
            self.db.refresh(profile)

        analysis_service = AnalysisService(self.db)
        analysis = analysis_service.analyze(profile.id, career.id)

        plan = DevelopmentPlan(
            user_id=user_id,
            career_id=career.id,
            learner_profile_id=profile.id,
            name=payload.name or career.title,
            strategy=payload.strategy or "balanced",
            weekly_hours=payload.weekly_hours or 8.0,
            initial_readiness=analysis.readiness,
            current_readiness=analysis.readiness,
            status="COMPLETED" if analysis.readiness >= 100 else "ACTIVE",
            completed_at=utcnow() if analysis.readiness >= 100 else None,
        )
        return self.repo.create(plan)

    def get_user_plans(self, user_id: int) -> List[DevelopmentPlan]:
        return self.repo.get_by_user_id(user_id)

    def get_plan(self, user_id: int, plan_id: int) -> DevelopmentPlan:
        plan = self.repo.get_by_id(plan_id)
        if not plan or plan.user_id != user_id:
            raise HTTPException(status_code=404, detail="Plan not found")

        # Self-heal linked profile assessments if empty
        if plan.learner_profile and not plan.learner_profile.assessments:
            career = plan.career or self.db.get(Career, plan.career_id)
            if career and career.requirements:
                for r in career.requirements:
                    self.db.add(SkillAssessment(
                        profile_id=plan.learner_profile.id,
                        skill_id=r.skill_id,
                        current_level=0
                    ))
                self.db.commit()
                self.db.refresh(plan.learner_profile)

        return plan

    def update_plan(self, user_id: int, plan_id: int, payload: DevelopmentPlanUpdate) -> DevelopmentPlan:
        plan = self.get_plan(user_id, plan_id)

        if payload.name is not None and payload.name.strip():
            plan.name = payload.name.strip()
        if payload.strategy is not None:
            plan.strategy = payload.strategy
        if payload.weekly_hours is not None:
            plan.weekly_hours = max(1.0, float(payload.weekly_hours))
            if plan.learner_profile:
                plan.learner_profile.weekly_hours = plan.weekly_hours
        if payload.status is not None:
            new_status = payload.status.upper()
            if new_status in ["ACTIVE", "COMPLETED", "ARCHIVED"]:
                plan.status = new_status
                if new_status == "COMPLETED" and not plan.completed_at:
                    plan.completed_at = utcnow()
                elif new_status != "COMPLETED":
                    plan.completed_at = None

        return self.repo.update(plan)

    def delete_plan(self, user_id: int, plan_id: int) -> None:
        plan = self.get_plan(user_id, plan_id)
        self.repo.delete(plan)

    def update_progress(self, user_id: int, plan_id: int) -> DevelopmentPlan:
        plan = self.get_plan(user_id, plan_id)
        analysis_service = AnalysisService(self.db)
        analysis = analysis_service.analyze(plan.learner_profile_id, plan.career_id)

        plan.current_readiness = analysis.readiness
        if plan.current_readiness >= 100 and plan.status != "COMPLETED":
            plan.status = "COMPLETED"
            plan.completed_at = utcnow()

        return self.repo.update(plan)
