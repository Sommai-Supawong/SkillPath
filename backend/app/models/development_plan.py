from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.core.database import Base
from app.models.entities import TimestampMixin, Career, LearnerProfile

class DevelopmentPlan(Base, TimestampMixin):
    __tablename__ = "development_plans"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    career_id: Mapped[int] = mapped_column(ForeignKey("careers.id", ondelete="CASCADE"))
    learner_profile_id: Mapped[int] = mapped_column(ForeignKey("learner_profiles.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200))
    strategy: Mapped[str] = mapped_column(String(30))
    weekly_hours: Mapped[float] = mapped_column(Float, default=8.0)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")
    target_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    initial_readiness: Mapped[float] = mapped_column(Float, default=0.0)
    current_readiness: Mapped[float] = mapped_column(Float, default=0.0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship(back_populates="plans")
    career: Mapped[Career] = relationship()
    learner_profile: Mapped[LearnerProfile] = relationship()
