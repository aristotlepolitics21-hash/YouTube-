"""Stage 4 - production prompts for image/video generation models.

Every prompt inherits the project's style bible (one paragraph that fixes the
look of the whole film) and adds period guards so historical scenes don't pick
up modern objects. Negative prompts cover the usual generation failures.
"""

from __future__ import annotations

import re

from ..schemas import Scene

NEGATIVE = (
    "readable text, captions, signage with letters, logos, watermarks, distorted faces, "
    "extra fingers, extra limbs, duplicated people, warped architecture, cartoon, illustration, "
    "oversaturated colours, low resolution"
)

CAMERA_WORDS = {
    "push_in": "slow push-in", "pull_out": "slow pull-back", "pan_left": "slow pan left",
    "pan_right": "slow pan right", "tilt_up": "slow tilt up", "tilt_down": "slow tilt down",
    "static": "locked-off static shot", "drone_forward": "slow aerial drone push forward",
}


def period_year(period: str) -> int | None:
    m = re.search(r"(1[5-9]\d\d|20\d\d)", period or "")
    return int(m.group(1)) if m else None


def period_guard(period: str) -> str:
    year = period_year(period)
    if year is None:
        return ""
    decade = f"{year // 10 * 10}s"
    guard = f"historically accurate {decade} clothing, hairstyles, vehicles, technology and architecture"
    if year < 1990:
        guard += "; no smartphones, no flat screens, no modern cars, no modern glass towers"
    if year < 1950:
        guard += "; period-correct photographic look"
    return guard


def build_prompt(scene: Scene, style_bible: str) -> dict:
    v = scene.visual
    parts = [v.description]
    if v.location:
        parts.append(f"Location: {v.location}")
    if v.period:
        parts.append(f"Time period: {v.period}")
    if v.characters:
        parts.append(f"People: {v.characters}, realistic human proportions")
    if v.environment:
        parts.append(f"Environment: {v.environment}")
    parts.append(f"Lighting: {v.lighting or 'natural cinematic lighting'}")
    if v.mood:
        parts.append(f"Mood: {v.mood}")
    guard = period_guard(v.period)
    if guard:
        parts.append(guard)
    parts.append(f"Camera: {CAMERA_WORDS.get(v.camera, v.camera)}, 16:9, documentary realism, 35mm film look")
    if style_bible:
        parts.append(f"Film style: {style_bible}")
    return {"prompt": ". ".join(p.rstrip(".") for p in parts) + ".", "negative_prompt": NEGATIVE}
