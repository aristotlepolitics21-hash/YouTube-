"""Science-fact Short #4: You Have a Hole in Your Vision.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common_short import STAND, P, ShotList, T, cam, stage, who, write  # noqa: E402

GOLD = (1.0, 0.85, 0.3)
DARK = {"horizon": [0.08, 0.05, 0.18], "zenith": [0.01, 0.0, 0.03]}
EYE = cam((0, -2.4, 0.95), (0.2, -2.1, 0.92), (0, 0, 0.6))
VIEWER = {"hair": [0.3, 0.18, 0.08], "sleeves": "long",
          "outfit": {"skin": [0.62, 0.45, 0.35], "shirt": [0.75, 0.2, 0.25], "pants": [0.15, 0.18, 0.3], "boots": [0.1, 0.08, 0.06]}}

S = ShotList()
S("Right now, there's a hole in your vision, and you can't see it.",
  stage("studio", EYE, props=[P("eye", (0, 0, 0.95), args={"look": [[0, [0, -10]], [1, [8, 10]]]})], env_opts=DARK))
S("At the back of each eye, the optic nerve exits through one small patch of the retina.",
  stage("studio", cam((1.8, 0.6, 1.1), (1.6, 0.9, 1.05), (0, 0.3, 0.7)), props=[P("eye", (0, 0, 0.95)), P("neuron", (0.1, 0.9, 0.95), scale=0.5, rot=[0, 0, 90], args={"fire": [0.2, 0.8]})], env_opts=DARK))
S("That patch has no light sensors at all. Light landing there is never detected.",
  stage("studio", EYE, props=[P("eye", (0, 0, 0.95))], texts=[T("NO SENSORS", (0, -1.0, 1.55), 0.13, (1.0, 0.45, 0.4), pop=0.35)], env_opts=DARK))
S("It's called the blind spot, and every human eye has one.",
  stage("studio", cam((0, -3.0, 1.0), (0.2, -2.7, 0.95), (0, 0, 0.6)), props=[P("eye", (-0.55, 0, 0.95), scale=0.8), P("eye", (0.55, 0, 0.95), scale=0.8)],
        texts=[T("BLIND SPOT", (0, -0.8, 1.6), 0.16, GOLD, pop=0.3)], env_opts=DARK))
S("So why don't you notice a gap? With both eyes open, each eye fills in what the other one misses.",
  stage("lab", cam((0.4, -1.8, 1.6), (0.3, -1.5, 1.58), (0, 0, 1.45)), cast=[who(VIEWER, at=(0, 0.35, 0))],
        env_opts={"wall": [0.5, 0.55, 0.6]}))
S("And even with one eye shut, your brain doesn't show you a hole.",
  stage("lab", cam((0.6, -1.6, 1.62), (0.4, -1.4, 1.6), (0, 0, 1.5)), cast=[who(VIEWER, at=(0, 0.35, 0), pose={**STAND, "head_nod": 5})],
        env_opts={"wall": [0.5, 0.55, 0.6]}))
S("Try it. Close your left eye and stare straight ahead with your right.",
  stage("lab", cam((0, -1.5, 1.6), (0, -1.3, 1.58), (0, 0.35, 1.5)), cast=[who(VIEWER, at=(0, 0.35, 0))], env_opts={"wall": [0.5, 0.55, 0.6]}))
S("Hold a fingertip in front of you, and slowly move it to the right. At one point, the tip vanishes.",
  stage("lab", cam((-0.6, -1.4, 1.65), (-0.5, -1.2, 1.62), (0.2, 0.35, 1.45)), cast=[who(VIEWER, at=(0, 0.35, 0), pose={**STAND, "raise_arm": {"L": -22, "R": 10}, "arm_forward": {"L": 0, "R": 75}, "elbow": {"L": 15, "R": 10}, "arm_inward": {"L": -6, "R": 10}, "curl": {"L": 25, "R": 0}}, pose_to={"arm_inward": {"L": -6, "R": -40}})],
        env_opts={"wall": [0.5, 0.55, 0.6]}))
S("That's your blind spot. It's been there all along.",
  stage("studio", cam((0, -1.6, 0.95), (0, -3.0, 1.0), (0, 0, 0.9), (0, 0, 0.85)), props=[P("eye", (0, 0, 0.95))], env_opts=DARK))

write(HERE, {
    "slug": "blind-spot",
    "title": "You Have a Hole in Your Vision",
    "description": "Every human eye has a blind spot where the optic nerve leaves the retina. Here's how to find yours. #shorts #science #eyes #brain",
    "music_mood": "wonder",
    "tags": ["science facts", "blind spot", "eyes", "vision", "brain", "shorts"],
    "sources": ["https://www.britannica.com/science/blind-spot",
                "https://www.scientificamerican.com/article/mind-the-gap-2008-05/",
                "https://michaelbach.de/ot/cog-blindSpot/"],
}, S.shots)
