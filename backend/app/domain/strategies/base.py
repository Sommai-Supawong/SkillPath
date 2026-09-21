from abc import ABC, abstractmethod

from ..entities import GapResult


class RoadmapStrategy(ABC):
    @abstractmethod
    def score(self, gap: GapResult, depth: int) -> float:
        """Return a higher score for skills that should be learned sooner."""

    def rank(self, gaps: list[GapResult], depths: dict[int, int]) -> list[GapResult]:
        return sorted(gaps, key=lambda item: (-self.score(item, depths.get(item.skill.id, 0)), item.skill.name))
