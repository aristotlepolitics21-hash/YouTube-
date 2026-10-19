"""Science-fact Short #3: Two Metres of DNA in Every Cell.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common_short import STAND, P, ShotList, T, cam, stage, who, write  # noqa: E402

GOLD = (1.0, 0.85, 0.3)
LAB = {"horizon": [0.05, 0.12, 0.25], "zenith": [0.0, 0.01, 0.04]}
PERSON = {"hair": [0.15, 0.1, 0.06], "sleeves": "long",
          "outfit": {"skin": [0.55, 0.38, 0.28], "shirt": [0.2, 0.45, 0.75], "pants": [0.2, 0.2, 0.25], "boots": [0.1, 0.08, 0.06]}}
HELIX = cam((0.6, -3.0, 1.1), (0.3, -2.7, 1.0), (0, 0, 0.6))

S = ShotList()
S("Inside almost every one of your cells is about two metres of DNA.",
  stage("studio", HELIX, props=[P("dna_helix", (0, 0, 0.9))], texts=[T("2 METRES", (0, -1.0, 1.32), 0.15, GOLD, pop=0.4)], env_opts=LAB))
S("Stretched out, the DNA from a single cell would be taller than you.",
  stage("studio", cam((0, -4.4, 1.3), (0.3, -4.1, 1.25), (0, 0, 0.9)), cast=[who(PERSON, at=(-0.45, 0, 0), turn=10)],
        props=[P("dna_helix", (0.45, 0, 1.05), scale=0.85, rot=[0, 90, 0], args={"spin": 40})], env_opts=LAB))
S("Yet it fits inside a nucleus just a few thousandths of a millimetre across.",
  stage("studio", cam((0, -3.4, 1.0), (0.2, -3.0, 0.95), (0, 0, 0.55)), props=[P("cell", (0, 0, 1.0), scale=0.8, args={"pulse": True})], env_opts=LAB))
S("It's wound around tiny protein spools, then coiled, and coiled again, like a phone cord twisted on itself.",
  stage("studio", cam((0.4, -2.0, 1.0), (0.2, -1.7, 0.95), (0, 0, 0.6)), props=[P("dna_helix", (0, 0, 0.9), args={"turns": 6, "spin": 120})], env_opts=LAB))
S("And it comes split into forty-six pieces, called chromosomes.",
  stage("studio", cam((0, -2.6, 1.0), (0.2, -2.3, 0.95), (0, 0, 0.6)), props=[P("chromosome", (0, 0, 1.0))],
        texts=[T("46", (0, -0.8, 1.3), 0.24, GOLD, pop=0.35)], env_opts=LAB))
S("Line up the DNA from all your cells, and it would stretch billions of kilometres, farther than Neptune.",
  stage("space", cam((0, -4.2, 0.3), (0, -3.8, 0.25), (0, 0, -0.5)),
        props=[P("planet", args={"colors": [[0.2, 0.35, 0.85], [0.3, 0.5, 0.95], [0.15, 0.25, 0.7]], "spin": 30, "marker": False, "glow": [0.4, 0.6, 1.0]})],
        texts=[T("BILLIONS OF km", (0, -2.0, 0.6), 0.12, GOLD, pop=0.5)]))
S("And every time one of your cells divides, all of it unpacks, copies itself, and packs back up.",
  stage("studio", cam((0, -3.4, 1.0), (0.2, -3.0, 0.95), (0, 0, 0.55)), props=[P("cell", (-0.5, 0, 1.0), scale=0.55, args={"pulse": True}), P("cell", (0.5, 0, 1.0), scale=0.55)], env_opts=LAB))
S("Two metres of instructions, folded into a speck too small to see.",
  stage("studio", cam((0.3, -1.8, 1.0), (0.6, -3.6, 1.2), (0, 0, 0.8), (0, 0, 0.75)), props=[P("dna_helix", (0, 0, 0.9), args={"spin": 50})], env_opts=LAB))

write(HERE, {
    "slug": "dna-length",
    "title": "There Are 2 Metres of DNA in Your Cells",
    "description": "Unwind the DNA in one of your cells and it's about 2 metres long. Here's how it fits. #shorts #science #biology #dna",
    "music_mood": "wonder",
    "tags": ["science facts", "dna", "biology", "cells", "human body", "shorts"],
    "sources": ["https://archive.imascientist.org.uk/genetics21-zone/question/how-long-is-dna/index.html",
                "https://www.mun.ca/biology/scarr/Homework_2.html",
                "https://pmc.ncbi.nlm.nih.gov/articles/PMC4991899/"],
}, S.shots)
