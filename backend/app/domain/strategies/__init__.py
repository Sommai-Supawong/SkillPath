from .balanced import BalancedStrategy
from .base import RoadmapStrategy
from .fast_track import FastTrackStrategy
from .foundation_first import FoundationFirstStrategy

STRATEGIES = {
    "balanced": BalancedStrategy,
    "fast_track": FastTrackStrategy,
    "foundation_first": FoundationFirstStrategy,
}

__all__ = ["RoadmapStrategy", "BalancedStrategy", "FastTrackStrategy", "FoundationFirstStrategy", "STRATEGIES"]
