from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ResourceOut(ORMModel):
    id: int
    skill_id: int
    title: str
    url: str
    resource_type: str
    difficulty: int
    estimated_hours: float


class PrerequisiteOut(ORMModel):
    skill_id: int
    skill_name: str
    minimum_level: int


class SkillOut(ORMModel):
    id: int
    name: str
    description: str
    category: str
    skill_type: str
    icon_key: str | None = None
    icon_kind: Literal["simple-icons", "lucide"] | None = None
    difficulty: int
    hours_per_level: float
    prerequisites: list[PrerequisiteOut] = Field(default_factory=list)


class RequirementOut(BaseModel):
    skill: SkillOut
    required_level: int
    importance: int


class CareerSummary(ORMModel):
    id: int
    title: str
    description: str
    category: str
    required_skill_count: int = 0
    top_skills: list[SkillOut] = Field(default_factory=list)


class CareerDetail(CareerSummary):
    requirements: list[RequirementOut]


class ProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    weekly_hours: float = Field(gt=0, le=80)
    target_career_id: int | None = None


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    weekly_hours: float | None = Field(default=None, gt=0, le=80)
    target_career_id: int | None = None


class AssessmentInput(BaseModel):
    skill_id: int
    current_level: int = Field(ge=0, le=5)


class AssessmentBatch(BaseModel):
    assessments: list[AssessmentInput] = Field(min_length=1)


class AssessmentOut(ORMModel):
    skill_id: int
    current_level: int
    updated_at: datetime


class ProfileOut(ORMModel):
    id: int
    name: str
    weekly_hours: float
    target_career_id: int | None
    assessments: list[AssessmentOut]
    created_at: datetime
    updated_at: datetime


class SkillAnalysis(BaseModel):
    skill_id: int
    skill: str
    skill_type: str
    icon_key: str | None = None
    icon_kind: Literal["simple-icons", "lucide"] | None = None
    current_level: int
    required_level: int
    gap: int
    importance: int
    readiness: float
    priority_score: float
    status: str


class AnalysisOut(BaseModel):
    profile_id: int
    career_id: int
    career: str
    readiness: float
    skills: list[SkillAnalysis]


StrategyName = Literal["balanced", "fast_track", "foundation_first"]


class RoadmapGenerate(BaseModel):
    profile_id: int
    career_id: int
    strategy: StrategyName = "balanced"


class RoadmapItemOut(ORMModel):
    id: int
    skill_id: int
    skill: str
    skill_type: str
    icon_key: str | None = None
    icon_kind: Literal["simple-icons", "lucide"] | None = None
    position: int
    current_level: int
    target_level: int
    estimated_hours: float
    start_week: float
    end_week: float
    status: str
    resources: list[ResourceOut] = Field(default_factory=list)


class RoadmapOut(BaseModel):
    id: int
    profile_id: int
    career_id: int
    career: str
    strategy: str
    weekly_hours: float
    readiness_before: float
    estimated_weeks: float
    created_at: datetime
    items: list[RoadmapItemOut]


class RoadmapItemUpdate(BaseModel):
    status: Literal["not_started", "in_progress", "completed"] | None = None
    current_level: int | None = Field(default=None, ge=0, le=5)


class HealthOut(BaseModel):
    status: str
