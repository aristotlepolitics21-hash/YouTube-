"""Science-fact Short #5: The 10-to-1 Bacteria Myth.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common_short import STAND, P, ShotList, T, cam, stage, who, write  # noqa: E402

GOLD = (1.0, 0.85, 0.3)
GREEN = (0.55, 0.95, 0.4)
LABENV = {"horizon": [0.04, 0.16, 0.12], "zenith": [0.0, 0.02, 0.02]}
BUGS = cam((0, -2.7, 1.0), (0.15, -2.4, 0.98), (0, 0, 0.8))
SCIENTIST = {"hair": [0.1, 0.08, 0.06], "sleeves": "long",
             "outfit": {"skin": [0.6, 0.42, 0.32], "shirt": [0.9, 0.92, 0.95], "pants": [0.2, 0.2, 0.25], "boots": [0.1, 0.08, 0.06]}}

S = ShotList()
S("You've probably heard that bacteria in your body outnumber your own cells ten to one.",
  stage("studio", BUGS, props=[P("bacteria", (0, 0, 0.9), args={"n": 40, "area": 0.8})], texts=[T("10 : 1 ?", (0, -0.6, 1.38), 0.2, GREEN, pop=0.4)], env_opts=LABENV))
S("It's one of the most repeated facts in biology. And it's wrong.",
  stage("studio", BUGS, props=[P("bacteria", (0, 0, 0.9), args={"n": 40, "area": 0.8, "seed": 2})], texts=[T("WRONG", (0, -0.6, 1.38), 0.2, (1.0, 0.35, 0.3), pop=0.55)], env_opts=LABENV))
S("That ratio came from a rough estimate back in the nineteen seventies.",
  stage("lab", cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15)), cast=[who(SCIENTIST, pose={**STAND, "curl": {"L": 40, "R": 40}})],
        props=[P("table", (0, -0.1, 0)), P("microscope", (0.3, -0.2, 0.875))], env_opts={"wall": [0.55, 0.6, 0.62]}), still=True)
S("In twenty sixteen, scientists in Israel recounted, using far better data.",
  stage("studio", cam((0.1, -0.95, 1.4), (0.05, -0.8, 1.33), (0, 0, 0.8)), props=[P("petri_dish", (0, 0, 0.9), args={"mould": False})], env_opts=LABENV))
S("A typical adult has about thirty trillion human cells, and about thirty-eight trillion bacteria.",
  stage("studio", cam((0, -3.3, 1.0), (0.15, -3.0, 0.98), (0, 0, 0.8)),
        props=[P("blood_cells", (-0.5, 0, 0.9), scale=0.55), P("bacteria", (0.5, 0, 0.9), args={"n": 30, "area": 0.35})],
        texts=[T("30 TRILLION HUMAN", (0, -0.6, 1.62), 0.1, (1.0, 0.45, 0.4), pop=0.3), T("38 TRILLION BACTERIA", (0, -0.6, 1.47), 0.1, GREEN, pop=0.65)], env_opts=LABENV))
S("That's not ten to one. It's roughly one to one.",
  stage("studio", BUGS, props=[P("blood_cells", (-0.4, 0, 0.9), scale=0.5), P("bacteria", (0.4, 0, 0.9), args={"n": 24, "area": 0.35})],
        texts=[T("1 : 1", (0, -0.6, 1.38), 0.24, GOLD, pop=0.35)], env_opts=LABENV))
S("Most of those bacteria live in your large intestine. And most of your own cells are red blood cells.",
  stage("studio", cam((0.3, -3.4, 1.05), (0.1, -3.1, 1.0), (0, 0, 0.85)), props=[P("blood_cells", (0, 0, 0.9), args={"n": 14})], env_opts=LABENV))
S("The ratio even shifts every time you go to the toilet. Afterwards, your human cells may briefly win.",
  stage("lab", cam((0.6, -2.2, 1.5), (0.4, -1.9, 1.45), (0, 0, 1.1)), cast=[who(SCIENTIST, pose={**STAND, "head_nod": 10})], env_opts={"wall": [0.55, 0.6, 0.62]}))
S("So you're not mostly bacteria. It's about an even split.",
  stage("studio", cam((0, -1.9, 1.0), (0, -3.0, 1.05), (0, 0, 0.85), (0, 0, 0.82)), props=[P("bacteria", (0, 0, 0.9), args={"n": 40, "area": 0.8, "seed": 9})], env_opts=LABENV))

write(HERE, {
    "slug": "bacteria-myth",
    "title": "You're Not 90% Bacteria",
    "description": "The famous 10-to-1 bacteria ratio is a myth. A 2016 recount found it's closer to 1 to 1. #shorts #science #biology #microbiome",
    "music_mood": "wonder",
    "tags": ["science facts", "bacteria", "microbiome", "human body", "biology", "shorts"],
    "sources": ["https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.1002533",
                "https://pmc.ncbi.nlm.nih.gov/articles/PMC4991899/",
                "https://wis-wander.weizmann.ac.il/life-sciences/germs-humans-and-numbers"],
}, S.shots)
