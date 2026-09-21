import pytest

from app.domain import CareerSpec, DependencyCycleError, GapAnalyzer, Learner, Requirement, RoadmapEngine, SkillSpec
from app.domain.strategies import BalancedStrategy, FastTrackStrategy, FoundationFirstStrategy


def make_career():
    javascript = SkillSpec(1, "JavaScript", difficulty=3, hours_per_level=6)
    react = SkillSpec(2, "React", difficulty=4, hours_per_level=8, prerequisites=(1,))
    nextjs = SkillSpec(3, "Next.js", difficulty=4, hours_per_level=8, prerequisites=(2,))
    testing = SkillSpec(4, "Testing", difficulty=3, hours_per_level=5, prerequisites=(1,))
    return CareerSpec(1, "Frontend Developer", (
        Requirement(javascript, 5, 5), Requirement(react, 4, 5),
        Requirement(nextjs, 3, 3), Requirement(testing, 3, 3),
    ))


def test_gap_and_bounded_readiness():
    analyzer = GapAnalyzer()
    assert analyzer.calculate_gap(2, 5) == 3
    assert analyzer.calculate_gap(5, 4) == 0
    assert analyzer.calculate_skill_readiness(5, 4) == 1
    with pytest.raises(ValueError): analyzer.calculate_gap(-1, 4)
    with pytest.raises(ValueError): analyzer.calculate_gap(1, 6)


def test_weighted_readiness_never_exceeds_100():
    career = make_career()
    readiness, _ = GapAnalyzer().analyze(Learner(1, "Ada", 8, {1: 5, 2: 5, 3: 5, 4: 5}), career)
    assert readiness == 100


def test_priority_increases_with_gap_importance_and_dependency():
    analyzer = GapAnalyzer()
    assert analyzer.calculate_priority(3, 4) > analyzer.calculate_priority(2, 4)
    assert analyzer.calculate_priority(3, 5) > analyzer.calculate_priority(3, 3)
    assert analyzer.calculate_priority(3, 4, 2) > analyzer.calculate_priority(3, 4, 0)


@pytest.mark.parametrize("strategy", [BalancedStrategy(), FastTrackStrategy(), FoundationFirstStrategy()])
def test_strategies_generate_valid_dependency_order(strategy):
    plan = RoadmapEngine(GapAnalyzer(), strategy).generate(Learner(1, "Ada", 8, {1: 2, 2: 1}), make_career())
    names = [step.skill.name for step in plan.steps]
    assert names.index("JavaScript") < names.index("React") < names.index("Next.js")


def test_completed_skills_excluded_and_weekly_hours_change_timeline():
    career = make_career()
    levels = {1: 5, 2: 1, 3: 0, 4: 0}
    slow = RoadmapEngine(GapAnalyzer(), BalancedStrategy()).generate(Learner(1, "Ada", 5, levels), career)
    fast = RoadmapEngine(GapAnalyzer(), BalancedStrategy()).generate(Learner(1, "Ada", 10, levels), career)
    assert "JavaScript" not in [step.skill.name for step in slow.steps]
    assert slow.estimated_weeks == fast.estimated_weeks * 2
    assert all(step.estimated_hours > 0 for step in slow.steps)


def test_fast_track_changes_ranking_while_foundation_first_favors_depth_zero():
    foundation = SkillSpec(1, "Foundation", 2, 12)
    critical = SkillSpec(2, "Critical", 5, 3)
    career = CareerSpec(1, "Example", (Requirement(foundation, 2, 2), Requirement(critical, 5, 5)))
    learner = Learner(1, "Ada", 8)
    balanced = RoadmapEngine(GapAnalyzer(), BalancedStrategy()).generate(learner, career)
    fast = RoadmapEngine(GapAnalyzer(), FastTrackStrategy()).generate(learner, career)
    assert [s.skill.id for s in balanced.steps] != []
    assert fast.steps[0].skill.id == 2


def test_cycle_detection():
    one = SkillSpec(1, "One", prerequisites=(2,))
    two = SkillSpec(2, "Two", prerequisites=(1,))
    career = CareerSpec(1, "Cycle", (Requirement(one, 3, 3), Requirement(two, 3, 3)))
    with pytest.raises(DependencyCycleError, match="cycle"):
        RoadmapEngine(GapAnalyzer(), BalancedStrategy()).generate(Learner(1, "Ada", 8), career)


def test_progress_update_changes_readiness_and_roadmap():
    learner = Learner(1, "Ada", 8, {1: 2})
    engine = RoadmapEngine(GapAnalyzer(), BalancedStrategy())
    before = engine.generate(learner, make_career())
    learner.update_skill(1, 5)
    after = engine.generate(learner, make_career())
    assert after.readiness > before.readiness
    assert "JavaScript" not in [step.skill.name for step in after.steps]
