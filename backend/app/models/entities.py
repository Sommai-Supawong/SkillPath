from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class Skill(Base, TimestampMixin):
    __tablename__ = "skills"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(80), index=True)
    difficulty: Mapped[int] = mapped_column(Integer, default=3)
    hours_per_level: Mapped[float] = mapped_column(Float, default=6.0)
    resources: Mapped[list[LearningResource]] = relationship(back_populates="skill", cascade="all, delete-orphan")
    prerequisites: Mapped[list[SkillPrerequisite]] = relationship(
        foreign_keys="SkillPrerequisite.skill_id", back_populates="skill", cascade="all, delete-orphan"
    )

    def estimate_learning_hours(self, current_level: int, target_level: int) -> float:
        if not 0 <= current_level <= 5 or not 0 <= target_level <= 5:
            raise ValueError("Skill levels must be between 0 and 5.")
        return round(max(target_level - current_level, 0) * self.hours_per_level, 1)


class Career(Base, TimestampMixin):
    __tablename__ = "careers"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(80))
    requirements: Mapped[list[CareerSkillRequirement]] = relationship(
        back_populates="career", cascade="all, delete-orphan", order_by="CareerSkillRequirement.importance.desc()"
    )


class CareerSkillRequirement(Base):
    __tablename__ = "career_skill_requirements"
    __table_args__ = (UniqueConstraint("career_id", "skill_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    career_id: Mapped[int] = mapped_column(ForeignKey("careers.id", ondelete="CASCADE"))
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
    required_level: Mapped[int] = mapped_column(Integer)
    importance: Mapped[int] = mapped_column(Integer)
    career: Mapped[Career] = relationship(back_populates="requirements")
    skill: Mapped[Skill] = relationship()


class SkillPrerequisite(Base):
    __tablename__ = "skill_prerequisites"
    __table_args__ = (UniqueConstraint("skill_id", "prerequisite_skill_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
    prerequisite_skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
    minimum_level: Mapped[int] = mapped_column(Integer, default=3)
    skill: Mapped[Skill] = relationship(foreign_keys=[skill_id], back_populates="prerequisites")
    prerequisite_skill: Mapped[Skill] = relationship(foreign_keys=[prerequisite_skill_id])


class LearnerProfile(Base, TimestampMixin):
    __tablename__ = "learner_profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    weekly_hours: Mapped[float] = mapped_column(Float, default=8.0)
    target_career_id: Mapped[int | None] = mapped_column(ForeignKey("careers.id"), nullable=True)
    target_career: Mapped[Career | None] = relationship()
    assessments: Mapped[list[SkillAssessment]] = relationship(back_populates="profile", cascade="all, delete-orphan")
    roadmaps: Mapped[list[Roadmap]] = relationship(back_populates="profile", cascade="all, delete-orphan")

    def get_skill_level(self, skill_id: int) -> int:
        assessment = next((item for item in self.assessments if item.skill_id == skill_id), None)
        return assessment.current_level if assessment else 0


class SkillAssessment(Base):
    __tablename__ = "skill_assessments"
    __table_args__ = (UniqueConstraint("profile_id", "skill_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("learner_profiles.id", ondelete="CASCADE"))
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
    current_level: Mapped[int] = mapped_column(Integer)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    profile: Mapped[LearnerProfile] = relationship(back_populates="assessments")
    skill: Mapped[Skill] = relationship()


class LearningResource(Base):
    __tablename__ = "learning_resources"
    id: Mapped[int] = mapped_column(primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(180))
    url: Mapped[str] = mapped_column(String(500))
    resource_type: Mapped[str] = mapped_column(String(40))
    difficulty: Mapped[int] = mapped_column(Integer, default=2)
    estimated_hours: Mapped[float] = mapped_column(Float, default=2)
    skill: Mapped[Skill] = relationship(back_populates="resources")


class Roadmap(Base, TimestampMixin):
    __tablename__ = "roadmaps"
    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("learner_profiles.id", ondelete="CASCADE"))
    career_id: Mapped[int] = mapped_column(ForeignKey("careers.id"))
    strategy: Mapped[str] = mapped_column(String(30))
    readiness_before: Mapped[float] = mapped_column(Float)
    estimated_weeks: Mapped[float] = mapped_column(Float, default=0)
    profile: Mapped[LearnerProfile] = relationship(back_populates="roadmaps")
    career: Mapped[Career] = relationship()
    items: Mapped[list[RoadmapItem]] = relationship(
        back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapItem.position"
    )


class RoadmapItem(Base):
    __tablename__ = "roadmap_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    roadmap_id: Mapped[int] = mapped_column(ForeignKey("roadmaps.id", ondelete="CASCADE"))
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"))
    position: Mapped[int] = mapped_column(Integer)
    current_level: Mapped[int] = mapped_column(Integer)
    target_level: Mapped[int] = mapped_column(Integer)
    estimated_hours: Mapped[float] = mapped_column(Float)
    start_week: Mapped[float] = mapped_column(Float)
    end_week: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(30), default="not_started")
    roadmap: Mapped[Roadmap] = relationship(back_populates="items")
    skill: Mapped[Skill] = relationship()
