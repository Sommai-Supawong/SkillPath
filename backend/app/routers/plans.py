from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.schemas.development_plan import DevelopmentPlanCreate, DevelopmentPlanResponse, DevelopmentPlanUpdate
from app.auth.dependencies import get_current_user
from app.services.plan_service import PlanService

router = APIRouter(prefix="/plans", tags=["plans"])

@router.post("", response_model=DevelopmentPlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    payload: DevelopmentPlanCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PlanService(db)
    return service.create_plan(user.id, payload)

@router.get("", response_model=List[DevelopmentPlanResponse])
def get_plans(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PlanService(db)
    return service.get_user_plans(user.id)

@router.get("/{plan_id}", response_model=DevelopmentPlanResponse)
def get_plan(
    plan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PlanService(db)
    return service.get_plan(user.id, plan_id)

@router.put("/{plan_id}", response_model=DevelopmentPlanResponse)
def update_plan(
    plan_id: int,
    payload: DevelopmentPlanUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PlanService(db)
    return service.update_plan(user.id, plan_id, payload)

@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PlanService(db)
    service.delete_plan(user.id, plan_id)

@router.post("/{plan_id}/progress", response_model=DevelopmentPlanResponse)
def update_plan_progress(
    plan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PlanService(db)
    return service.update_progress(user.id, plan_id)
