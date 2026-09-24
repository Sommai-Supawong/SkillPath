from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class DevelopmentPlanBase(BaseModel):
    name: Optional[str] = None
    career_id: int
    strategy: str = "balanced"
    weekly_hours: float = 8.0
    status: str = "ACTIVE"
    target_date: Optional[datetime] = None

class DevelopmentPlanCreate(DevelopmentPlanBase):
    learner_profile_id: Optional[int] = None

class DevelopmentPlanUpdate(BaseModel):
    name: Optional[str] = None
    strategy: Optional[str] = None
    weekly_hours: Optional[float] = None
    status: Optional[str] = None

class DevelopmentPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    career_id: int
    learner_profile_id: int
    strategy: str
    weekly_hours: float
    status: str
    target_date: Optional[datetime] = None
    initial_readiness: float
    current_readiness: float
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
