from sqlalchemy.orm import Session
from app.models.development_plan import DevelopmentPlan
from typing import List, Optional

class DevelopmentPlanRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, plan: DevelopmentPlan) -> DevelopmentPlan:
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def get_by_id(self, plan_id: int) -> Optional[DevelopmentPlan]:
        return self.db.query(DevelopmentPlan).filter(DevelopmentPlan.id == plan_id).first()

    def get_by_user_id(self, user_id: int) -> List[DevelopmentPlan]:
        return self.db.query(DevelopmentPlan).filter(DevelopmentPlan.user_id == user_id).all()

    def update(self, plan: DevelopmentPlan) -> DevelopmentPlan:
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def delete(self, plan: DevelopmentPlan) -> None:
        self.db.delete(plan)
        self.db.commit()
