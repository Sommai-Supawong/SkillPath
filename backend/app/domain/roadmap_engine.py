import math

from .entities import CareerSpec, GapResult, Learner, RoadmapPlan, RoadmapStep
from .gap_analyzer import GapAnalyzer
from .strategies.base import RoadmapStrategy


class DependencyCycleError(ValueError):
    pass


class RoadmapEngine:
    def __init__(self, analyzer: GapAnalyzer, strategy: RoadmapStrategy):
        self.analyzer = analyzer
        self.strategy = strategy

    def _depths(self, gaps: list[GapResult]) -> dict[int, int]:
        gap_ids = {gap.skill.id for gap in gaps}
        skills = {gap.skill.id: gap.skill for gap in gaps}
        state: dict[int, int] = {}
        depths: dict[int, int] = {}

        def visit(skill_id: int) -> int:
            if state.get(skill_id) == 1:
                raise DependencyCycleError("Skill dependency configuration contains a cycle.")
            if state.get(skill_id) == 2:
                return depths[skill_id]
            state[skill_id] = 1
            parents = [p for p in skills[skill_id].prerequisites if p in gap_ids]
            depths[skill_id] = 0 if not parents else 1 + max(visit(parent) for parent in parents)
            state[skill_id] = 2
            return depths[skill_id]

        for skill_id in gap_ids:
            visit(skill_id)
        return depths

    def resolve_dependencies(self, ranked: list[GapResult]) -> list[GapResult]:
        by_id = {gap.skill.id: gap for gap in ranked}
        rank_index = {gap.skill.id: index for index, gap in enumerate(ranked)}
        indegree = {skill_id: 0 for skill_id in by_id}
        children = {skill_id: [] for skill_id in by_id}
        for gap in ranked:
            for prerequisite_id in gap.skill.prerequisites:
                if prerequisite_id in by_id:
                    indegree[gap.skill.id] += 1
                    children[prerequisite_id].append(gap.skill.id)
        ready = sorted((sid for sid, count in indegree.items() if count == 0), key=rank_index.get)
        ordered: list[GapResult] = []
        while ready:
            skill_id = ready.pop(0)
            ordered.append(by_id[skill_id])
            for child in children[skill_id]:
                indegree[child] -= 1
                if indegree[child] == 0:
                    ready.append(child)
                    ready.sort(key=rank_index.get)
        if len(ordered) != len(ranked):
            raise DependencyCycleError("Skill dependency configuration contains a cycle.")
        return ordered

    def generate(self, learner: Learner, career: CareerSpec) -> RoadmapPlan:
        readiness, analysis = self.analyzer.analyze(learner, career)
        gaps = [item for item in analysis if item.gap > 0]
        depths = self._depths(gaps)
        ordered = self.resolve_dependencies(self.strategy.rank(gaps, depths))
        elapsed_hours = 0.0
        steps: list[RoadmapStep] = []
        for gap in ordered:
            hours = round(gap.gap * gap.skill.hours_per_level, 1)
            start_week = elapsed_hours / learner.weekly_hours
            elapsed_hours += hours
            steps.append(RoadmapStep(
                skill=gap.skill,
                current_level=gap.current_level,
                target_level=gap.required_level,
                estimated_hours=hours,
                start_week=round(start_week, 1),
                end_week=round(elapsed_hours / learner.weekly_hours, 1),
            ))
        return RoadmapPlan(readiness, round(elapsed_hours / learner.weekly_hours, 1), tuple(steps))
