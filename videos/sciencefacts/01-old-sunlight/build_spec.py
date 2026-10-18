"""Science-fact Short #1: Your Sunlight Is Older Than Civilization.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common_short import P, ShotList, T, cam, stage, who, write  # noqa: E402

SPACE = {}
GAZER = {"hair": [0.25, 0.15, 0.08], "sleeves": "long",
         "outfit": {"skin": [0.62, 0.45, 0.35], "shirt": [0.9, 0.55, 0.15], "pants": [0.15, 0.2, 0.35], "boots": [0.1, 0.08, 0.06]}}
GOLD = (1.0, 0.85, 0.3)
SUN = cam((0, -4.6, 0.3), (0, -3.6, 0.2), (0, 0, -0.55))
WALK = cam((0.4, -3.9, 0.5), (0.2, -3.1, 0.35), (0, 0, -0.5))

S = ShotList()
S("The sunlight hitting your face right now is older than human civilisation.",
  stage("space", SUN, props=[P("sun_ball")], texts=[T("OLDER THAN CIVILISATION", (0, -1.2, 1.25), 0.16, GOLD, pop=0.25)]))
S("Not the trip here. That part only takes about eight minutes.",
  stage("space", cam((1.6, -4.2, 0.6), (1.2, -3.6, 0.5), (0.6, 0, -0.4)),
        props=[P("sun_ball", (-2.6, 6, 0.6), scale=1.4), P("earth_globe", (0.7, 0, 0), scale=0.7)],
        texts=[T("8 MINUTES", (0.4, -1.0, 1.35), 0.2, GOLD, pop=0.3)]))
S("Light crosses a hundred and fifty million kilometres of empty space in eight minutes and twenty seconds.",
  stage("space", cam((0, -3.2, 0.4), (0.3, -2.8, 0.3), (0, 0, -0.5)), props=[P("earth_globe", scale=0.9)],
        texts=[T("150,000,000 km", (0, -1.0, 1.25), 0.17, GOLD, pop=0.2)]))
S("The slow part happens inside the Sun.",
  stage("space", WALK, props=[P("random_walk", args={"draw": [0.9, 0.95]})]), still=True, still_at=0.5)
S("Its energy is made in the core, by nuclear fusion.",
  stage("studio", cam((0, -2.6, 0.75), (0.2, -2.2, 0.7), (0, 0, 0.35)), props=[P("fusion_reaction", (0, 0, 0.75), args={"hit": 0.5})],
        texts=[T("FUSION", (0, -0.3, 1.45), 0.2, (1.0, 0.6, 0.3), pop=0.2)], env_opts={"horizon": [0.25, 0.08, 0.02], "zenith": [0.02, 0.0, 0.0]}))
S("But the inside of the Sun is so dense that light can't travel in a straight line.",
  stage("space", WALK, props=[P("random_walk", args={"draw": [0.05, 0.95]})]))
S("It's absorbed and given off again and again, zigzagging in random directions.",
  stage("space", cam((0.2, -2.0, 0.3), (0.1, -1.6, 0.2), (0, 0, -0.3)), props=[P("random_walk", args={"draw": [0.0, 0.9], "seed": 3})]))
S("Scientists estimate that energy takes tens of thousands of years, maybe more than a hundred thousand, to reach the surface.",
  stage("space", SUN, props=[P("sun_ball")], texts=[T("10,000s OF YEARS", (0, -1.2, 1.25), 0.2, GOLD, pop=0.3)]))
S("So the energy in today's sunshine set out before the first farms, cities or writing.",
  stage("sky", cam((0.9, -2.6, 1.0), (0.6, -2.2, 1.1), (0, 0, 1.3)), cast=[who(GAZER, at=(0, 0, 0), turn=-15, pose={"head_nod": -25})],
        env_opts={"sky": {"horizon": [1.0, 0.7, 0.35], "zenith": [0.15, 0.4, 0.9]}}))
S("Eight minutes to reach you. Tens of thousands of years to get out.",
  stage("space", cam((0.4, -5.2, 0.4), (0, -4.6, 0.3), (0, 0, -0.5)), props=[P("random_walk", args={"draw": [0.0, 0.6], "seed": 11})],
        texts=[T("8 MIN", (-0.5, -1.4, 1.45), 0.18, GOLD, pop=0.15), T("10,000s YRS", (0.5, -1.4, 1.2), 0.15, (1.0, 0.55, 0.25), pop=0.55)]))

write(HERE, {
    "slug": "old-sunlight",
    "title": "Your Sunlight Is Older Than Civilisation",
    "description": "The light on your skin took 8 minutes to get here. Getting out of the Sun took tens of thousands of years. #shorts #science #space #sun",
    "music_mood": "wonder",
    "tags": ["science facts", "sun", "sunlight", "space", "physics", "shorts"],
    "sources": ["https://svs.gsfc.nasa.gov/11084",
                "https://www.iflscience.com/the-sunlight-that-is-reaching-us-now-is-thousands-of-years-old-if-not-a-lot-older-but-took-under-9-minutes-to-travel-to-earth-83564",
                "https://www.universetoday.com/articles/how-long-does-it-take-sunlight-to-reach-the-earth"],
}, S.shots)
