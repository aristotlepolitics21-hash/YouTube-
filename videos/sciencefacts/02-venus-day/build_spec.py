"""Science-fact Short #2: A Day on Venus Is Longer Than Its Year.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common_short import STAND, P, ShotList, T, cam, stage, who, write  # noqa: E402

GOLD = (1.0, 0.85, 0.3)
HAZE = (1.0, 0.8, 0.45)
VC = [[1.0, 0.88, 0.55], [0.85, 0.5, 0.18], [1.0, 0.95, 0.78], [0.75, 0.45, 0.2]]
VENUS = cam((0, -4.2, 0.3), (0, -3.8, 0.25), (0, 0, -0.5))
TOP = cam((0, -4.8, 4.4), (0.3, -4.4, 4.1), (0, 0, -0.7))
WANDERER = {"hair": [0.2, 0.12, 0.08], "sleeves": "long",
            "outfit": {"skin": [0.6, 0.42, 0.32], "shirt": [0.25, 0.45, 0.7], "pants": [0.08, 0.08, 0.1], "boots": [0.15, 0.12, 0.1]}}

S = ShotList()
S("On Venus, a single day lasts longer than a whole year.",
  stage("space", VENUS, props=[P("planet", args={"colors": VC, "spin": 25, "glow": HAZE})]))
S("Venus circles the Sun once every two hundred and twenty-five Earth days.",
  stage("space", TOP, props=[P("orbit", args={"travel": [0.0, 0.85]})],
        texts=[T("YEAR: 225 DAYS", (0, 2.0, 0.9), 0.32, GOLD, pop=0.35)]))
S("But turning once on its axis takes two hundred and forty-three.",
  stage("space", cam((0.5, -4.4, 0.5), (0.3, -4.0, 0.4), (0, 0, -0.5)), props=[P("planet", args={"colors": VC, "spin": 12, "glow": HAZE})],
        texts=[T("SPIN: 243 DAYS", (0, -2.0, 0.6), 0.12, (1.0, 0.55, 0.25), pop=0.4)]))
S("So it finishes a lap of the Sun before it has spun around even once.",
  stage("space", TOP, props=[P("orbit", args={"travel": [0.3, 1.0], "color": [0.95, 0.75, 0.4]})]))
S("And it spins backwards, the opposite way to almost every other planet.",
  stage("space", cam((0, -3.6, 1.6), (0, -3.4, 1.5), (0, 0, -0.3)), props=[P("planet", args={"colors": VC, "spin": -90, "glow": HAZE})]))
S("Stand on Venus, and the Sun would rise in the west and set in the east.",
  stage("sky", cam((1.3, -3.0, 0.9), (1.0, -2.6, 0.95), (-0.2, 2.0, 1.75)), cast=[who(WANDERER, at=(0.25, 0, 0), turn=160, pose={**STAND, "head_nod": -12})],
        props=[P("sun_ball", (1.0, 7, 2.6), scale=0.7)],
        env_opts={"sky": {"horizon": [1.0, 0.65, 0.25], "zenith": [0.55, 0.4, 0.15]}, "floor": [0.45, 0.32, 0.18]}))
S("Nobody is sure why. A giant impact may have flipped it, or the Sun's pull on its thick atmosphere may have slowed it.",
  stage("space", cam((0.8, -4.6, 0.6), (0.5, -4.2, 0.4), (0, 0, -0.5)), props=[P("planet", args={"colors": VC, "spin": -20, "glow": HAZE})]))
S("Spinning backwards does shorten sunrise to sunrise, to about a hundred and seventeen days.",
  stage("space", VENUS, props=[P("planet", args={"colors": VC, "spin": -25, "glow": HAZE})],
        texts=[T("SUNRISE TO SUNRISE: 117 DAYS", (0, -2.0, 0.48), 0.075, GOLD, pop=0.45)]))
S("Still, one spin that takes longer than a whole orbit. Venus really is the odd one out.",
  stage("space", cam((0, -5.2, 0.4), (0, -4.6, 0.3), (0, 0, -0.5)), props=[P("planet", args={"colors": VC, "spin": -15, "glow": HAZE})]))

write(HERE, {
    "slug": "venus-day",
    "title": "A Day on Venus Is Longer Than Its Year",
    "description": "Venus takes 243 Earth days to spin once, but only 225 to orbit the Sun. And it spins backwards. #shorts #science #space #venus",
    "music_mood": "wonder",
    "tags": ["science facts", "venus", "planets", "space", "astronomy", "shorts"],
    "sources": ["https://science.nasa.gov/venus/venus-facts/",
                "https://bira-iasb.be/en/encyclopedia/venus-backwards-rotation-and-orbital-period",
                "https://www.universetoday.com/articles/rotation-of-venus"],
}, S.shots)
