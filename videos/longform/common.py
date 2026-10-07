"""Shared helpers for long-form shot lists (see 02-electricity/build_spec.py for a full example)."""

import json
from pathlib import Path

# ------------------------------------------------------------------ cast
SKIN = [0.72, 0.52, 0.42]
FARADAY = {"hair": [0.25, 0.13, 0.06], "sleeves": "long",
           "outfit": {"skin": SKIN, "shirt": [0.06, 0.07, 0.14], "pants": [0.07, 0.06, 0.06], "boots": [0.04, 0.03, 0.02]}}
YOUNG = {"hair": [0.3, 0.16, 0.07], "sleeves": "long",
         "outfit": {"skin": SKIN, "shirt": [0.16, 0.24, 0.1], "pants": [0.12, 0.09, 0.06], "boots": [0.06, 0.04, 0.02]}}
DAVY = {"hair": [0.1, 0.07, 0.05], "sleeves": "long",
        "outfit": {"skin": SKIN, "shirt": [0.4, 0.05, 0.08], "pants": [0.1, 0.08, 0.08], "boots": [0.04, 0.03, 0.02]}}
ORSTED = {"hair": [0.65, 0.62, 0.58], "sleeves": "long",
          "outfit": {"skin": SKIN, "shirt": [0.08, 0.25, 0.15], "pants": [0.1, 0.1, 0.1], "boots": [0.04, 0.03, 0.02]}}
FRANKLIN = {"hair": [0.7, 0.68, 0.65], "sleeves": "long",
            "outfit": {"skin": SKIN, "shirt": [0.18, 0.09, 0.04], "pants": [0.15, 0.08, 0.04], "boots": [0.05, 0.04, 0.03]}}
MAXWELL = {"hair": [0.05, 0.04, 0.04], "sleeves": "long",
           "outfit": {"skin": SKIN, "shirt": [0.1, 0.1, 0.12], "pants": [0.08, 0.08, 0.09], "boots": [0.04, 0.03, 0.02]}}

STAND = {"raise_arm": {"L": -22, "R": -22}, "arm_inward": {"L": -6, "R": -6}, "elbow": {"L": 15, "R": 15},
         "curl": {"L": 25, "R": 25}}
WORK = {"raise_arm": {"L": -32, "R": -32}, "arm_forward": {"L": 28, "R": 28}, "arm_inward": {"L": 18, "R": 18},
        "elbow": {"L": 70, "R": 70}, "twist": {"L": 60, "R": 60}, "curl": {"L": 30, "R": 30}, "head_nod": 18}
PRESENT = {"raise_arm": {"L": -22, "R": 5}, "arm_forward": {"L": 0, "R": 35}, "elbow": {"L": 15, "R": 35},
           "arm_inward": {"L": -6, "R": 0}, "curl": {"L": 25, "R": 5}, "twist": {"R": 40}}
READ = {"raise_arm": {"L": -35, "R": -35}, "arm_forward": {"L": 35, "R": 35}, "arm_inward": {"L": 30, "R": 30},
        "elbow": {"L": 95, "R": 95}, "twist": {"L": 80, "R": 80}, "curl": {"L": 20, "R": 20}, "head_nod": 22}
LOOK_UP = {**STAND, "head_nod": -15}


def who(base, at=(0, 0.35, 0), turn=0, pose=STAND, pose_to=None, **kw):
    d = {**base, "at": list(at), "turn": turn, "pose": pose}
    if pose_to:
        d["pose_to"] = pose_to
    d.update(kw)
    return d


def P(prop, at=(0, 0, 0), **kw):
    d = {"prop": prop, "at": list(at)}
    d.update(kw)
    return d


def T(text, at, size=0.3, color=(1.0, 0.85, 0.3), **kw):
    return {"text": text, "at": list(at), "size": size, "color": list(color), **kw}


def cam(frm, to=None, target=(0, 0, 1.0), target_to=None, lens=35, lens_to=None):
    c = {"from": list(frm), "to": list(to or frm), "target": target if isinstance(target, str) else list(target), "lens": lens}
    if target_to is not None:
        c["target_to"] = target_to if isinstance(target_to, str) else list(target_to)
    if lens_to:
        c["lens_to"] = lens_to
    return c


def stage(env, camera, cast=(), props=(), texts=(), **kw):
    return {"type": "stage", "env": env, "cast": list(cast), "props": list(props), "texts": list(texts),
            "camera": camera, **kw}


TABLE = P("table", (0, -0.1, 0))
TOP = 0.875
BENCH_CAM = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))
CLOSE = lambda x=0.0, z=TOP + 0.1: cam((x + 0.35, -1.1, z + 0.35), (x + 0.2, -0.9, z + 0.3), (x, -0.1, z))



class ShotList:
    def __init__(self):
        self.shots = []

    def __call__(self, line, visual, still=False, chapter=None, **kw):
        s = {"id": f"s{len(self.shots) + 1:03d}", "line": line, "visual": visual}
        if still:
            s["still"] = True
        if chapter:
            s["chapter"] = chapter
        s.update(kw)
        self.shots.append(s)


LONG_DEFAULTS = {
    "format": "long",
    "render": {"width": 960, "height": 540, "samples": 8, "fps": 12},
    "still_render": {"width": 1920, "height": 1080, "samples": 16},
    "output_fps": 24,
    "gap_seconds": 0.5,
    "chapter_gap_seconds": 0.9,
    "burn_captions": False,
}


def write(here, spec, shots):
    spec = {**LONG_DEFAULTS, **spec, "shots": shots}
    (Path(here) / "short.json").write_text(json.dumps(spec, indent=1, ensure_ascii=False))
    words = sum(len(s["line"].split()) for s in shots)
    print(f"{len(shots)} shots, {words} words, {sum(1 for s in shots if s.get('still'))} stills")
