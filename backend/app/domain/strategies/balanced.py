from .base import RoadmapStrategy
from ..entities import GapResult


class BalancedStrategy(RoadmapStrategy):
    DIFFICULTY_WEIGHT = 0.35

    def score(self, gap: GapResult, depth: int) -> float:
        effort_penalty = gap.skill.difficulty * self.DIFFICULTY_WEIGHT
        return gap.priority_score + depth * 1.5 - effort_penalty
