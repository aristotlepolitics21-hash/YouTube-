"""Length planning: target minutes -> narration words and scene count."""

from __future__ import annotations

import re
from dataclasses import dataclass

WORD_RE = re.compile(r"[A-Za-z][A-Za-z'’\-]*|\d[\d,.]*\d|\d")


def count_words(text: str) -> int:
    return len(WORD_RE.findall(text))


def estimate_seconds(text: str, words_per_minute: float) -> float:
    return count_words(text) * 60.0 / words_per_minute


@dataclass(frozen=True)
class LengthPlan:
    target_minutes: float
    words_min: int
    words_target: int
    words_max: int
    scenes_min: int
    scenes_target: int
    scenes_max: int

    def as_dict(self) -> dict:
        return self.__dict__.copy()


def plan_length(target_minutes: float, words_per_minute: float, min_scene: float,
                target_scene: float, max_scene: float) -> LengthPlan:
    """About 8% of runtime goes to pauses, music beats and title moments, so the
    spoken word budget is a little under minutes x wpm. The range allows +-7%."""
    seconds = target_minutes * 60
    spoken = seconds * 0.92
    words = spoken / 60 * words_per_minute
    return LengthPlan(
        target_minutes=target_minutes,
        words_min=int(words * 0.93),
        words_target=int(words),
        words_max=int(words * 1.07),
        scenes_min=int(seconds / max_scene),
        scenes_target=int(round(seconds / target_scene)),
        scenes_max=int(seconds / min_scene),
    )
