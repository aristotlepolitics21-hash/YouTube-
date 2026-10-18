"""Shared helpers for the 45-second science-fact Shorts (vertical 1080x1920, rendered natively at full size).

Reuses the long-form stage helpers; only the defaults differ: full-resolution 24 fps renders, the Kokoro voice,
quieter music and burned-in captions."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "longform"))
from common import P, ShotList, T, cam, stage, who  # noqa: E402,F401
import json  # noqa: E402

SHORT_DEFAULTS = {
    "format": "short",
    "render": {"width": 1080, "height": 1920, "samples": 16, "fps": 24},
    "still_render": {"width": 1080, "height": 1920, "samples": 24},
    "output_fps": 24,
    "voice": {"engine": "kokoro", "kokoro_voice": "am_michael", "speed": 1.0},
    "music_gain": 0.18,
    "whisper_model": "small.en",
    "gap_seconds": 0.15,
    "lead_seconds": 0.3,
    "burn_captions": True,
}


def write(here, spec, shots):
    spec = {**SHORT_DEFAULTS, **spec, "shots": shots}
    (Path(here) / "short.json").write_text(json.dumps(spec, indent=1, ensure_ascii=False))
    words = sum(len(s["line"].split()) for s in shots)
    print(f"{len(shots)} shots, {words} words, {sum(1 for s in shots if s.get('still'))} stills")
