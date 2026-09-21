from dataclasses import dataclass, field


def validate_level(level: int) -> None:
    if not isinstance(level, int) or not 0 <= level <= 5:
        raise ValueError("Skill level must be an integer between 0 and 5.")


@dataclass(frozen=True)
class SkillSpec:
    id: int
    name: str
    difficulty: int = 3
    hours_per_level: float = 6.0
    prerequisites: tuple[int, ...] = ()

    def __post_init__(self):
        if not 1 <= self.difficulty <= 5 or self.hours_per_level <= 0:
            raise ValueError("Difficulty must be 1-5 and hours per level must be positive.")


@dataclass(frozen=True)
class Requirement:
    skill: SkillSpec
    required_level: int
    importance: int

    def __post_init__(self):
        validate_level(self.required_level)
        if self.required_level == 0 or not 1 <= self.importance <= 5:
            raise ValueError("Required level and importance must be between 1 and 5.")


@dataclass(frozen=True)
class CareerSpec:
    id: int
    title: str
    requirements: tuple[Requirement, ...]


@dataclass
class Learner:
    id: int
    name: str
    weekly_hours: float
    levels: dict[int, int] = field(default_factory=dict)

    def __post_init__(self):
        if not 0 < self.weekly_hours <= 80:
            raise ValueError("Weekly hours must be greater than 0 and at most 80.")
        for level in self.levels.values():
            validate_level(level)

    def update_skill(self, skill_id: int, level: int) -> None:
        validate_level(level)
        self.levels[skill_id] = level

    def get_skill_level(self, skill_id: int) -> int:
        return self.levels.get(skill_id, 0)


@dataclass(frozen=True)
class GapResult:
    skill: SkillSpec
    current_level: int
    required_level: int
    importance: int
    gap: int
    readiness: float
    priority_score: float
    status: str


@dataclass(frozen=True)
class RoadmapStep:
    skill: SkillSpec
    current_level: int
    target_level: int
    estimated_hours: float
    start_week: float
    end_week: float
    status: str = "not_started"


@dataclass(frozen=True)
class RoadmapPlan:
    readiness: float
    estimated_weeks: float
    steps: tuple[RoadmapStep, ...]
