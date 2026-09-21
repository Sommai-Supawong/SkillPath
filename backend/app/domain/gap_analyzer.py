from .entities import CareerSpec, GapResult, Learner


class GapAnalyzer:
    DEPENDENCY_BONUS_PER_DEPENDENT = 0.15
    MAX_DEPENDENCY_BONUS = 0.60

    @staticmethod
    def calculate_gap(current_level: int, required_level: int) -> int:
        if not 0 <= current_level <= 5 or not 1 <= required_level <= 5:
            raise ValueError("Current level must be 0-5 and required level must be 1-5.")
        return max(required_level - current_level, 0)

    @staticmethod
    def calculate_skill_readiness(current_level: int, required_level: int) -> float:
        if not 0 <= current_level <= 5 or not 1 <= required_level <= 5:
            raise ValueError("Current level must be 0-5 and required level must be 1-5.")
        return min(current_level / required_level, 1.0)

    def calculate_priority(self, gap: int, importance: int, dependent_count: int = 0) -> float:
        if gap < 0 or not 1 <= importance <= 5 or dependent_count < 0:
            raise ValueError("Invalid priority inputs.")
        dependency_factor = 1 + min(
            dependent_count * self.DEPENDENCY_BONUS_PER_DEPENDENT,
            self.MAX_DEPENDENCY_BONUS,
        )
        return round(gap * importance * dependency_factor, 2)

    def analyze(self, learner: Learner, career: CareerSpec) -> tuple[float, list[GapResult]]:
        dependent_counts = {req.skill.id: 0 for req in career.requirements}
        for req in career.requirements:
            for prerequisite_id in req.skill.prerequisites:
                if prerequisite_id in dependent_counts:
                    dependent_counts[prerequisite_id] += 1

        weighted_score = 0.0
        total_importance = 0
        results: list[GapResult] = []
        for req in career.requirements:
            current = learner.get_skill_level(req.skill.id)
            gap = self.calculate_gap(current, req.required_level)
            readiness = self.calculate_skill_readiness(current, req.required_level)
            weighted_score += readiness * req.importance
            total_importance += req.importance
            status = "ready" if gap == 0 else "critical" if gap >= 3 else "gap"
            results.append(GapResult(
                skill=req.skill,
                current_level=current,
                required_level=req.required_level,
                importance=req.importance,
                gap=gap,
                readiness=round(readiness * 100, 1),
                priority_score=self.calculate_priority(gap, req.importance, dependent_counts[req.skill.id]),
                status=status,
            ))
        readiness = 100.0 if not total_importance else weighted_score / total_importance * 100
        return round(min(max(readiness, 0), 100), 1), results
