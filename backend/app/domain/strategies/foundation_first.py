from .base import RoadmapStrategy
from ..entities import GapResult


class FoundationFirstStrategy(RoadmapStrategy):
    FOUNDATION_WEIGHT = 10.0

    def score(self, gap: GapResult, depth: int) -> float:
        return gap.priority_score - depth * self.FOUNDATION_WEIGHT
