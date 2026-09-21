from .base import RoadmapStrategy
from ..entities import GapResult


class FastTrackStrategy(RoadmapStrategy):
    CRITICAL_IMPORTANCE_WEIGHT = 3.0
    GAP_WEIGHT = 1.5

    def score(self, gap: GapResult, depth: int) -> float:
        return gap.importance * self.CRITICAL_IMPORTANCE_WEIGHT + gap.gap * self.GAP_WEIGHT - gap.skill.hours_per_level * 0.1
