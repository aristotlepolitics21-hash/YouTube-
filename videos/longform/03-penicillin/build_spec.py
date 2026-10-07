"""Shot list for long-form #3: How One Doctor Discovered Penicillin.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

LABCOAT = {"skin": SKIN, "shirt": [0.85, 0.87, 0.9], "pants": [0.08, 0.08, 0.1], "boots": [0.04, 0.03, 0.02]}
FLEMING = {"hair": [0.45, 0.4, 0.35], "sleeves": "long", "outfit": LABCOAT}
FLOREY = {"hair": [0.12, 0.09, 0.06], "sleeves": "long", "outfit": LABCOAT}
CHAIN = {"hair": [0.05, 0.04, 0.04], "sleeves": "long", "outfit": {**LABCOAT, "shirt": [0.8, 0.82, 0.86]}}
HEATLEY = {"hair": [0.55, 0.4, 0.2], "sleeves": "long", "outfit": LABCOAT}
NURSE = {"hair": [0.3, 0.15, 0.06], "sleeves": "long",
         "outfit": {"skin": SKIN, "shirt": [0.2, 0.35, 0.65], "pants": [0.2, 0.35, 0.65], "boots": [0.9, 0.9, 0.9]}}
SOLDIER = {"sleeves": "long", "hat": [0.2, 0.24, 0.12],
           "outfit": {"skin": SKIN, "shirt": [0.25, 0.27, 0.14], "pants": [0.25, 0.27, 0.14], "boots": [0.08, 0.06, 0.04]}}
PATIENT = {"hair": [0.2, 0.12, 0.06], "sleeves": "long",
           "outfit": {"skin": SKIN, "shirt": [0.75, 0.8, 0.9], "pants": [0.75, 0.8, 0.9], "boots": SKIN}}
LYING = {"raise_arm": {"L": -40, "R": -40}, "elbow": {"L": 5, "R": 5}, "curl": {"L": 20, "R": 20}}
CLEAN = {"wall": [0.6, 0.65, 0.62], "world": [0.06, 0.06, 0.06]}
DISH = cam((0.18, -0.42, 0.38), (0.1, -0.33, 0.3), (0.0, 0, 0.0))

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
BENCH = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))
CLOSE = lambda x=0.0, z=TOP + 0.1: cam((x + 0.35, -1.1, z + 0.35), (x + 0.2, -0.9, z + 0.3), (x, -0.1, z))
WARD = {"wall": [0.55, 0.6, 0.58], "world": [0.05, 0.05, 0.05]}

# ===================================================================== HOOK
S("A hundred years ago, a scratch from a rose bush could kill you.",
  stage("studio", cam((0.4, -1.0, 0.6), (0.25, -0.8, 0.5), (0, 0, 0.2)),
        props=[P("bacteria", (0, 0, 0.1), args={"n": 30, "area": 0.4})], env_opts={"horizon": [0.25, 0.05, 0.08]}))
S("So could a sore throat, a cut while shaving, or giving birth.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 0.8)), cast=[who(PATIENT, at=(0, -0.55, 0.74), rot=(-90, 0, 0), pose=LYING)],
        props=[P("hospital_bed", (0, 0.3, 0))], env_opts=WARD), still=True)
S("In nineteen twenty four, the sixteen year old son of the American president got a blister playing tennis at the White House. A week later, he was dead from blood poisoning.",
  stage("sky", cam((0, -3.2, 1.5), (0.3, -2.8, 1.4), (0, 0, 1.0)), cast=[who(PATIENT | {"outfit": {**PATIENT["outfit"], "shirt": [0.95, 0.95, 0.95], "pants": [0.95, 0.95, 0.95]}}, pose=STAND, scale=0.95)],
        texts=[T("1924", (0.9, 0.5, 1.6), 0.3, pop=0.2)], env_opts={"floor": [0.15, 0.45, 0.15]}), still=True)
S("Doctors had nothing that could stop a bacterial infection once it spread through the body.",
  stage("studio", cam((0.3, -1.3, 0.8), (0.2, -1.0, 0.6), (0, 0, 0.25)),
        props=[P("bacteria", (0, 0, 0.1), args={"n": 60, "area": 0.6, "drift": 0.12, "seed": 9})], env_opts={"horizon": [0.3, 0.05, 0.08]}))
S("Then, in a messy London laboratory, a scientist came back from his holiday, and noticed something odd on a dish he had forgotten to clean.",
  stage("lab", BENCH, cast=[who(FLEMING, pose=WORK)], props=[TABLE, P("petri_dish", (0, -0.1, TOP), args={"clear": [0, 0.01]}),
                                                             P("petri_dish", (-0.45, -0.1, TOP), args={"mould": False, "seed": 8}),
                                                             P("microscope", (0.5, -0.05, TOP))]), still=True)
S("That accident gave the world penicillin, the first true antibiotic. It has saved many millions of lives.",
  stage("studio", cam((0, -2.6, 1.1), (0, -2.2, 1.05), (0, 0, 1.0)),
        texts=[T("PENICILLIN", (0, 0, 1.2), 0.32, (0.3, 0.9, 0.6), pop=0.05), T("THE FIRST ANTIBIOTIC", (0, 0, 0.88), 0.11, (1, 1, 1), pop=0.3)],
        props=[P("vials", (0, 0.4, 0.45), scale=3.0)]), still=True, still_at=0.8)
S("But the story of how it got from that dish into hospitals is far stranger, and took far longer, than most people know.",
  stage("studio", cam((0.25, -0.5, 0.45), (0.15, -0.4, 0.35), (0, 0, 0.02)), props=[P("petri_dish", args={"clear": [0.1, 0.9]})]))

# ===================================================================== FLEMING
S("Alexander Fleming was born on a farm in Scotland in eighteen eighty one.",
  stage("sky", cam((0, -3.0, 1.5), (0.3, -2.6, 1.4), (0, 0, 1.0)), cast=[who(FLEMING | {"outfit": {**LABCOAT, "shirt": [0.3, 0.2, 0.12]}, "hair": [0.6, 0.35, 0.15]},
                                                                                   pose=STAND, scale=0.75)],
        texts=[T("1881", (0.9, 0.5, 1.5), 0.3, pop=0.2)]), still=True, chapter="The doctor with the messy bench")
S("He moved to London, trained as a doctor at St Mary's Hospital, and stayed there for the rest of his career, studying bacteria.",
  stage("lab", BENCH, cast=[who(FLEMING, pose=READ)], props=[TABLE, P("microscope", (0.45, -0.05, TOP)), P("books", (-0.5, -0.1, TOP))],
        env_opts=CLEAN), still=True)
S("In the First World War, he worked in battlefield hospitals in France, and watched soldiers die of infected wounds.",
  stage("lab", cam((0, -3.0, 1.6), (0.4, -2.6, 1.5), (0, 0.5, 0.8)),
        cast=[who(SOLDIER, at=(0, -0.55, 0.74), rot=(-90, 0, 0), pose=LYING), who(FLEMING, at=(-0.9, 0.2, 0), turn=-20, pose={**STAND, "head_nod": 15})],
        props=[P("hospital_bed", (0, 0.3, 0)), P("hospital_bed", (1.4, 0.6, 0))], env_opts={"wall": [0.3, 0.27, 0.2], "world": [0.03, 0.03, 0.02]}),
  still=True)
S("The antiseptics of the day often did more harm than good. They killed the body's own defences, along with the germs.",
  stage("studio", cam((0.3, -0.9, 0.5), (0.2, -0.75, 0.45), (0, 0, 0.15)),
        props=[P("bacteria", (0, 0, 0.05), args={"n": 26, "area": 0.35, "burst": 0.2, "resistant": 6}), P("glassware", (0.45, 0.3, 0), args={"n": 2})]))
S("Fleming spent years searching for something better.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(FLEMING, pose=WORK)],
        props=[TABLE, P("petri_dish", (0, -0.1, TOP), args={"mould": False}), P("microscope", (0.45, -0.05, TOP))], env_opts=CLEAN), still=True)
S("In nineteen twenty two, he discovered lysozyme, a natural germ killer found in tears and mucus. But it was too weak to stop serious infections.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("LYSOZYME", (0, 0, 1.05), 0.25, (0.5, 0.8, 1.0), pop=0.1),
                                                                         T("1922", (0, 0, 0.72), 0.12, (1, 1, 1), pop=0.3)]), still=True, still_at=0.8)
S("He was a brilliant scientist, but famously untidy. His bench was always covered in old culture plates.",
  stage("lab", cam((0.3, -1.3, 1.35), (0.15, -1.1, 1.3), (0, -0.1, 0.95)),
        props=[TABLE] + [P("petri_dish", (x, y, TOP + z), args={"mould": i == 2, "clear": [0, 0.01], "seed": i})
                         for i, (x, y, z) in enumerate([(-0.5, -0.2, 0), (-0.3, 0.05, 0), (-0.05, -0.15, 0), (0.25, 0.0, 0), (0.5, -0.2, 0),
                                                       (-0.5, -0.2, 0.03), (0.25, 0.0, 0.03)])]), still=True)

# ===================================================================== SEPTEMBER 1928
S("He even made paintings out of bacteria, using germs that grew in different colours on the dish.",
  stage("studio", DISH, props=[P("petri_dish", args={"mould": False, "colonies": 260, "seed": 21})], env_opts={"horizon": [0.2, 0.08, 0.2]}),
  still=True)
S("In the summer of nineteen twenty eight, Fleming left a stack of dishes growing Staphylococcus bacteria on his bench, and went on holiday.",
  stage("lab", BENCH, props=[TABLE] + [P("petri_dish", (0, -0.1, TOP + 0.03 * i), args={"mould": False, "seed": i}) for i in range(4)],
        texts=[T("SUMMER 1928", (0.9, 0.6, 1.6), 0.18, pop=0.2)], env_opts=CLEAN), still=True, chapter="September 1928")
S("When he came back, on the third of September, he started sorting through them.",
  stage("lab", BENCH, cast=[who(FLEMING, pose=WORK)], props=[TABLE, P("petri_dish", (0, -0.1, TOP), args={"mould": False}),
                                                             P("petri_dish", (-0.4, -0.1, TOP), args={"mould": False, "seed": 2})],
        texts=[T("3 SEPT 1928", (0.95, 0.6, 1.6), 0.16, pop=0.2)], env_opts=CLEAN), still=True)
S("One dish was contaminated with a fluffy blue-green mould.",
  stage("studio", DISH, props=[P("petri_dish", args={"clear": [0.99, 1.0]})], env_opts={"horizon": [0.05, 0.12, 0.08]}), still=True, still_at=0.5)
S("Mould on a culture plate was nothing unusual. But around this mould, the bacteria had vanished.",
  stage("studio", cam((0.12, -0.3, 0.3), (0.08, -0.22, 0.22), (0.05, 0.02, 0.0)), props=[P("petri_dish", args={"clear": [0.15, 0.85]})],
        env_opts={"horizon": [0.05, 0.12, 0.08]}))
S("Something leaking out of the mould was killing them.",
  stage("studio", cam((0.07, -0.18, 0.2), (0.07, -0.12, 0.15), (0.07, 0.04, 0.0)), props=[P("petri_dish", args={"clear": [0.0, 0.01]})],
        texts=[T("?", (0.07, 0.04, 0.12), 0.05, (0.4, 1.0, 0.6), pop=0.3, rot=[70, 0, 0])], env_opts={"horizon": [0.05, 0.12, 0.08]}))
S("The mould spores had probably drifted up from a laboratory on the floor below, where another scientist was studying fungi. And a spell of cool weather let the mould grow before the bacteria did.",
  stage("lab", cam((0.3, -1.3, 1.4), (0.2, -1.1, 1.3), (0, -0.1, 1.0)),
        props=[TABLE, P("petri_dish", (0, -0.1, TOP), args={"clear": [0, 0.01], "mould_grow": [0.2, 0.9]}),
               P("bacteria", (0, -0.1, 1.2), scale=0.4, args={"n": 18, "area": 0.6, "color": [0.4, 0.8, 0.5], "drift": 0.2})], env_opts=CLEAN))
S("Fleming is often quoted as saying: that's funny.",
  stage("lab", cam((0.5, -1.4, 1.65), (0.4, -1.2, 1.62), "cast0.head", lens=45), cast=[who(FLEMING, pose={**READ, "head_nod": 15})],
        props=[TABLE, P("petri_dish", (0, -0.05, 1.08), rot=[70, 0, 0], args={"clear": [0, 0.01]})], env_opts=CLEAN), still=True)
S("The mould was a species of Penicillium, a relative of the mould you might find on old bread. So he called the mystery substance penicillin.",
  stage("studio", cam((0.4, -0.9, 0.5), (0.3, -0.75, 0.42), (0, 0, 0.1)),
        props=[P("bread", (-0.2, 0, 0)), P("petri_dish", (0.25, 0.05, 0), args={"clear": [0, 0.01]})],
        texts=[T("PENICILLIUM", (0, 0.2, 0.42), 0.08, (0.4, 1.0, 0.6), pop=0.25)]), still=True)
S("He found it could kill many of the bacteria that cause disease, and that it seemed harmless to white blood cells.",
  stage("studio", cam((0.4, -1.0, 0.55), (0.25, -0.85, 0.48), (0, 0, 0.18)),
        props=[P("bacteria", (0, 0, 0.1), args={"n": 34, "area": 0.4, "burst": 0.25, "seed": 3})]))
S("He published his results in nineteen twenty nine.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "ON THE ANTIBACTERIAL ACTION OF CULTURES OF A PENICILLIUM", "n": 2})],
        texts=[T("1929", (0, 0.3, 0.4), 0.12, pop=0.3)]), still=True, still_at=0.7)

# ===================================================================== FORGOTTEN
S("And then, almost nothing happened.",
  stage("lab", cam((0, -1.4, 1.3), (0, -1.2, 1.25), (0, -0.1, 0.95)),
        props=[TABLE, P("petri_dish", (0, -0.1, TOP), args={"clear": [0, 0.01]}), P("candle", (0.4, 0, TOP))],
        env_opts={"wall": [0.08, 0.09, 0.09], "world": [0.01, 0.01, 0.01]}), still=True, chapter="Forgotten for a decade")
S("Penicillin was fragile. It broke down quickly, and Fleming's team could not purify it, or make more than tiny amounts.",
  stage("studio", cam((0.4, -1.0, 0.6), (0.3, -0.85, 0.5), (0, 0, 0.15)),
        props=[P("glassware", (0, 0, 0), args={"n": 5, "colors": [[1.0, 0.85, 0.2], [0.9, 0.75, 0.25], [0.8, 0.7, 0.3], [0.7, 0.65, 0.4], [0.6, 0.6, 0.5]]})]))
S("Fleming mostly used it as a tool in his lab, to sort one kind of bacteria from another.",
  stage("lab", BENCH, cast=[who(FLEMING, pose=WORK)], props=[TABLE, P("petri_dish", (-0.3, -0.1, TOP), args={"clear": [0, 0.01]}),
                                                             P("petri_dish", (0.3, -0.1, TOP), args={"mould": False, "seed": 6})], env_opts=CLEAN), still=True)
S("For about ten years, one of the most important discoveries in medical history sat on a shelf.",
  stage("lab", cam((0.0, -1.5, 1.4), (0.0, -1.3, 1.35), (0, 0.4, 1.2)),
        props=[P("table", (0, 0.4, 0), args={"w": 1.2, "d": 0.4, "h": 1.15}), P("glassware", (0, 0.4, 1.15), args={"n": 4}),
               P("books", (-0.45, 0.4, 1.15), args={"n": 4})], texts=[T("1929 → 1939", (0, 0.2, 1.7), 0.14, pop=0.2)], env_opts=CLEAN),
  still=True)

# ===================================================================== OXFORD
S("In nineteen thirty nine, at the University of Oxford, an Australian scientist named Howard Florey and a German-born chemist named Ernst Chain dug up Fleming's old paper.",
  stage("lab", cam((0, -2.8, 1.6), (0.3, -2.4, 1.5), (0, 0.3, 1.2)),
        cast=[who(FLOREY, at=(-0.45, 0.35, 0), turn=-12, pose=READ), who(CHAIN, at=(0.45, 0.35, 0), turn=12, pose=STAND)],
        props=[TABLE, P("newspapers", (0, -0.1, TOP), args={"headline": "PENICILLIUM", "n": 1})], env_opts=CLEAN), still=True,
  chapter="The Oxford team")
S("Chain, a brilliant biochemist, worked out how to extract and concentrate the drug.",
  stage("lab", BENCH, cast=[who(CHAIN, pose=WORK)], props=[TABLE, P("glassware", (0, -0.1, TOP), args={"n": 6, "seed": 3})], env_opts=CLEAN), still=True)
S("But they needed huge amounts of mould juice to make even a little penicillin. And Britain was at war.",
  stage("studio", cam((0, -2.0, 1.0), (0, -1.7, 0.9), (0, 0, 0.5)),
        props=[P("glassware", (-0.3, 0, 0), scale=2.0, args={"n": 3})],
        texts=[T("1939", (0.5, 0.2, 0.9), 0.22, (1.0, 0.3, 0.3), pop=0.2)]), still=True)
S("So their colleague Norman Heatley improvised. He grew the mould in anything he could find: bedpans, milk churns, baths, and food tins.",
  stage("lab", cam((0.3, -2.4, 1.3), (0.1, -2.0, 1.1), (0, 0, 0.3)), cast=[who(HEATLEY, at=(0, 0.8, 0), pose=STAND)],
        props=[P("vessels", (0, 0, 0))], env_opts=CLEAN))
S("He even designed special ceramic culture vessels, and the team hired young women, nicknamed the penicillin girls, to tend them.",
  stage("lab", cam((0, -2.8, 1.6), (0.4, -2.4, 1.5), (0, 0.3, 0.9)),
        cast=[who(NURSE, at=(-0.6, 0.6, 0), turn=-10, pose=WORK, scale=0.95), who(NURSE | {"hair": [0.6, 0.45, 0.2]}, at=(0.6, 0.6, 0), turn=10, pose=WORK, scale=0.95)],
        props=[P("table", (0, 0.2, 0), args={"w": 2.2}), P("vessels", (0, 0.2, TOP), scale=0.6, args={"kinds": ["bedpan"] * 5, "spacing": 0.42})],
        env_opts=CLEAN), still=True)
S("On the twenty fifth of May, nineteen forty, they ran a decisive test. Eight mice were injected with deadly streptococcus bacteria.",
  stage("studio", cam((0.3, -1.1, 0.6), (0.2, -0.95, 0.5), (0, 0, 0.12)),
        props=[P("mouse_cage", (-0.3, 0, 0)), P("mouse_cage", (0.32, 0, 0), args={"seed": 5}), P("syringe", (0.0, -0.3, 0.3), rot=[0, 30, 90], args={"push": [0.3, 0.6]})],
        texts=[T("25 MAY 1940", (0, 0.4, 0.55), 0.09, pop=0.15)]))
S("Four of them were also given penicillin. The other four were not.",
  stage("studio", cam((0, -1.1, 0.55), (0, -0.95, 0.5), (0, 0, 0.12)),
        props=[P("mouse_cage", (-0.3, 0, 0)), P("mouse_cage", (0.32, 0, 0), args={"seed": 5})],
        texts=[T("PENICILLIN", (-0.3, 0.1, 0.4), 0.05, (0.4, 1.0, 0.6), pop=0.2), T("NONE", (0.32, 0.1, 0.4), 0.05, (1.0, 0.4, 0.4), pop=0.4)]),
  still=True)
S("By the next morning, all four untreated mice were dead. All four treated mice were alive.",
  stage("studio", cam((0, -1.1, 0.55), (0, -0.9, 0.5), (0, 0, 0.12)),
        props=[P("mouse_cage", (-0.3, 0, 0)), P("mouse_cage", (0.32, 0, 0), args={"seed": 5, "alive": False})],
        texts=[T("4 ALIVE", (-0.3, 0.1, 0.4), 0.05, (0.4, 1.0, 0.6), pop=0.2), T("4 DEAD", (0.32, 0.1, 0.4), 0.05, (1.0, 0.4, 0.4), pop=0.45)]))
S("Chain reportedly danced with excitement. Florey said it looked like a miracle.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 1.1)),
        cast=[who(CHAIN, at=(-0.5, 0.3, 0), turn=-20, pose={**STAND, "raise_arm": {"L": 40, "R": 40}, "elbow": {"L": 40, "R": 40}},
                  poses=[[0.5, {"raise_arm": {"L": -5, "R": -5}}], [1.0, {"raise_arm": {"L": 45, "R": 45}}]]),
              who(FLOREY, at=(0.55, 0.4, 0), turn=20, pose=STAND)], env_opts=CLEAN))

# ===================================================================== FIRST PATIENT
S("They published the results in August nineteen forty. And they were so worried about a German invasion that they rubbed mould spores into the linings of their coats, so the work could survive.",
  stage("lab", cam((0.4, -1.9, 1.5), (0.3, -1.6, 1.45), "cast0.chest"), cast=[who(FLOREY, pose=STAND), who(HEATLEY, at=(0.7, 0.45, 0), turn=15, pose=STAND)],
        env_opts=CLEAN), still=True)
S("Next came people. In February nineteen forty one, a forty three year old policeman named Albert Alexander lay dying in an Oxford hospital.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 0.8)), cast=[who(PATIENT, at=(0, -0.55, 0.74), rot=(-90, 0, 0), pose=LYING)],
        props=[P("hospital_bed", (0, 0.3, 0))], texts=[T("FEB 1941", (1.0, 1.0, 1.5), 0.16, pop=0.2)], env_opts=WARD), still=True,
  chapter="The first patients")
S("A small scratch near his mouth, often said to be from a rose thorn, had become a raging infection that spread to his eyes, face and lungs.",
  stage("studio", cam((0.3, -1.1, 0.7), (0.2, -0.9, 0.6), (0, 0, 0.2)),
        props=[P("bacteria", (0, 0, 0.1), args={"n": 70, "area": 0.6, "drift": 0.15, "seed": 11, "color": [0.8, 0.5, 0.2]})],
        env_opts={"horizon": [0.35, 0.05, 0.05]}))
S("He was given penicillin, and within a day, he began to improve.",
  stage("lab", cam((0.6, -1.5, 1.3), (0.4, -1.2, 1.2), (0, 0.1, 0.8)),
        cast=[who(PATIENT, at=(0, -0.55, 0.74), rot=(-90, 0, 0), pose=LYING), who(NURSE, at=(0.9, 0.0, 0), turn=60, pose=WORK)],
        props=[P("hospital_bed", (0, 0.3, 0)), P("syringe", (0.55, -0.2, 1.05), rot=[0, 0, 160], args={"push": [0.2, 0.7]})], env_opts=WARD))
S("But there wasn't enough. The team even recovered penicillin from his urine to use again.",
  stage("studio", cam((0.3, -0.9, 0.5), (0.2, -0.75, 0.45), (0, 0, 0.12)),
        props=[P("vials", (0, 0, 0), args={"n": 2}), P("glassware", (0.35, 0.1, 0), args={"n": 2, "colors": [[1.0, 0.9, 0.3], [1.0, 0.85, 0.25]]})]),
  still=True)
S("After five days, the supply ran out. The infection came back, and Albert Alexander died in March.",
  stage("lab", cam((0, -2.0, 1.4), (0, -1.7, 1.35), (0, 0.3, 0.8)), props=[P("hospital_bed", (0, 0.3, 0)), P("candle", (0.7, 0.9, 0))],
        env_opts={"wall": [0.12, 0.13, 0.13], "world": [0.01, 0.01, 0.01]}), still=True)
S("It was heartbreaking. But it proved the drug worked in humans. The problem was making enough of it.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("IT WORKS", (0, 0, 1.05), 0.25, (0.4, 1.0, 0.6), pop=0.1),
                                                                         T("BUT NOT ENOUGH", (0, 0, 0.72), 0.14, (1.0, 0.5, 0.4), pop=0.45)]),
  still=True, still_at=0.8)
S("A year later, in New Haven, Connecticut, a woman named Anne Miller was dying of blood poisoning after a miscarriage. Penicillin saved her.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 0.8)),
        cast=[who(PATIENT | {"hair": [0.35, 0.2, 0.08], "outfit": {**PATIENT["outfit"], "shirt": [0.85, 0.75, 0.85], "pants": [0.85, 0.75, 0.85]}},
                  at=(0, -0.55, 0.74), rot=(-90, 0, 0), pose=LYING, scale=0.94)],
        props=[P("hospital_bed", (0, 0.3, 0))], texts=[T("MARCH 1942", (1.0, 1.0, 1.5), 0.16, pop=0.2)], env_opts=WARD), still=True)
S("Her treatment used about half of all the penicillin in the United States at the time. She lived to the age of ninety.",
  stage("studio", cam((0, -1.6, 0.9), (0, -1.4, 0.85), (0, 0, 0.5)),
        props=[P("vials", (-0.3, 0, 0.35), scale=2.0, args={"n": 2, "label": ""}), P("vials", (0.3, 0, 0.35), scale=2.0, args={"n": 2, "label": ""})],
        texts=[T("50%", (0, 0.2, 0.95), 0.2, pop=0.2)]), still=True)

# ===================================================================== MASS PRODUCTION
S("Later that year, after a terrible nightclub fire in Boston, penicillin was used to treat burn victims, and the public began to hear about the new miracle drug.",
  stage("night", cam((0, -3.0, 1.5), (0.3, -2.6, 1.4), (0, 1, 0.9)), props=[P("city", (0, 2.5, 0), args={"count": 60}), P("crates", (0, 0.2, 0), args={"n": 3})]),
  still=True)
S("To make penicillin in bulk, Florey and Heatley flew to the United States in nineteen forty one, carrying samples of the mould.",
  stage("space", cam((0, -3.6, 1.6), (0.6, -3.2, 1.2), (0, 0, 0.2)), props=[P("route", (0, 0, 0), args={"stops": ["OXFORD", "NEW YORK", "PEORIA"]})]),
  chapter="Mass production")
S("At a government lab in Peoria, Illinois, scientists grew the mould in huge tanks, fed with corn steep liquor, a cheap leftover from making corn starch.",
  stage("lab", cam((0, -4.2, 2.2), (0.6, -3.6, 2.0), (0, 0, 1.0), lens=28), props=[P("fermenter", (0, 0.5, 0))],
        env_opts={"wall": [0.3, 0.32, 0.34], "world": [0.04, 0.04, 0.045]}))
S("Yields soared. Then a lab worker named Mary Hunt brought in a mouldy cantaloupe from a local market.",
  stage("studio", cam((0.3, -0.75, 0.45), (0.2, -0.6, 0.38), (0, 0, 0.13)), props=[P("cantaloupe")], env_opts={"horizon": [0.25, 0.18, 0.05]}),
  still=True)
S("Its mould produced far more penicillin than Fleming's original strain. Most penicillin made since then comes from descendants of that melon mould.",
  stage("studio", cam((0.15, -0.4, 0.3), (0.1, -0.3, 0.25), (0.06, -0.08, 0.17)), props=[P("cantaloupe")], env_opts={"horizon": [0.25, 0.18, 0.05]}))
S("American drug companies scaled up fast. Production rose from almost nothing in early nineteen forty two to millions of doses.",
  stage("studio", cam((0, -2.2, 1.0), (0.3, -1.9, 0.9), (0, 0, 0.5)), props=[P("crates", (0, 0.3, 0))],
        texts=[T("MILLIONS OF DOSES", (0, 0, 1.25), 0.14, pop=0.4)]))
S("By the time Allied troops landed in Normandy on D-Day, in June nineteen forty four, there was enough penicillin to treat the wounded.",
  stage("sky", cam((0, -3.4, 1.6), (0.4, -3.0, 1.5), (0, 0, 0.9)),
        cast=[who(SOLDIER, at=(-0.5, 0.3, 0), turn=-10, pose=STAND), who(SOLDIER, at=(0.5, 0.5, 0), turn=10, pose=STAND)],
        props=[P("crates", (0, 1.2, 0))], texts=[T("JUNE 1944", (0, 1.5, 1.9), 0.18, pop=0.2)],
        env_opts={"sky": {"horizon": [0.7, 0.55, 0.4], "zenith": [0.25, 0.35, 0.55]}, "floor": [0.6, 0.55, 0.4]}), still=True)
S("Soldiers called it the miracle drug. Infected wounds that would once have meant amputation or death could now heal.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 0.8)),
        cast=[who(SOLDIER | {"hat": None}, at=(0, -0.55, 0.74), rot=(-90, 0, 0), pose=LYING), who(NURSE, at=(0.9, 0.2, 0), turn=40, pose=WORK)],
        props=[P("hospital_bed", (0, 0.3, 0)), P("vials", (0.6, -0.2, 0.0), scale=1.5)], env_opts=WARD), still=True)

# ===================================================================== HOW IT WORKS
S("So how does penicillin actually kill bacteria?",
  stage("studio", cam((0, -1.3, 0.6), (0, -1.1, 0.55), (0, 0, 0.3)), props=[P("bacteria", (0, 0, 0.2), args={"n": 10, "area": 0.3})],
        texts=[T("HOW DOES IT WORK?", (0, 0.4, 0.85), 0.11, pop=0.2)]), still=True, chapter="How it works")
S("Most bacteria are wrapped in a tough cell wall, which they constantly rebuild as they grow and divide.",
  stage("studio", cam((0.25, -0.5, 0.35), (0.15, -0.4, 0.3), (0, 0, 0.2)), props=[P("bacteria", (0, 0, 0.15), args={"n": 3, "area": 0.06, "drift": 0.02})]))
S("Penicillin jams the machinery that builds that wall.",
  stage("studio", cam((0, -1.6, 0.7), (0.2, -1.3, 0.6), (0, 0, 0.45)), props=[P("molecule", (0, 0, 0.45), scale=0.9)]))
S("The wall weakens, water rushes in, and the bacterium bursts, while our own cells, which have no such wall, are left alone.",
  stage("studio", cam((0.25, -0.6, 0.4), (0.18, -0.48, 0.35), (0, 0, 0.18)),
        props=[P("bacteria", (0, 0, 0.12), args={"n": 8, "area": 0.12, "burst": 0.3, "drift": 0.02})]))
S("In nineteen forty five, Dorothy Hodgkin used X-ray crystallography to reveal penicillin's structure, including its unusual four-sided ring.",
  stage("lab", cam((0.4, -1.8, 1.5), (0.3, -1.5, 1.45), (0, 0, 1.2)),
        cast=[who(NURSE | {"hair": [0.5, 0.35, 0.2], "outfit": {**LABCOAT}}, at=(-0.5, 0.35, 0), pose=STAND)],
        props=[P("molecule", (0.4, 0, 1.2), scale=0.5)], texts=[T("1945", (0.9, 0.6, 1.65), 0.2, pop=0.2)], env_opts=CLEAN))

# ===================================================================== NOBEL
S("That same year, Fleming, Florey and Chain shared the Nobel Prize in Physiology or Medicine.",
  stage("hall", cam((0, -2.8, 1.6), (0, -2.4, 1.5), (0, 0.4, 1.2)),
        cast=[who(FLEMING, at=(-0.75, 0.35, 0), turn=-10), who(FLOREY, at=(0, 0.45, 0)), who(CHAIN, at=(0.75, 0.35, 0), turn=10)],
        props=[P("medal", (0, -0.2, 1.75), spin=["z", 40])], texts=[T("NOBEL PRIZE 1945", (0, 0.2, 2.05), 0.13, pop=0.2)]),
  still=True, chapter="The prize, and a warning")
S("Norman Heatley, whose improvised bedpans made it all possible, was left out. Decades later, Oxford gave him its first honorary doctorate in medicine in its eight hundred year history.",
  stage("lab", cam((0.4, -1.9, 1.5), (0.3, -1.6, 1.45), "cast0.head"), cast=[who(HEATLEY, pose=STAND)],
        props=[P("vessels", (0.8, 0, 0), scale=0.7, args={"kinds": ["bedpan", "churn"]})], env_opts=CLEAN), still=True)
S("Fleming became world famous, and he always insisted that luck had played a big part.",
  stage("hall", cam((0, -3.0, 1.6), (0.3, -2.6, 1.5), (0, 1.0, 1.2), lens=30), cast=[who(FLEMING, at=(0, 1.4, 0), pose=PRESENT)],
        props=[P("audience", (0, 1.2, 0), rot=[0, 0, 180], args={"react": 0.6})]))
S("Fleming was knighted in nineteen forty four. When he died in nineteen fifty five, he was buried in St Paul's Cathedral in London.",
  stage("lab", cam((0, -2.0, 1.4), (0, -1.7, 1.35), (0, 0.5, 1.1)), props=[P("candle", (-0.4, 0.4, 0.9)), P("candle", (0.4, 0.4, 0.9)),
        P("table", (0, 0.4, 0), args={"w": 1.2, "d": 0.5, "h": 0.9})], texts=[T("1881 \u2013 1955", (0, 0.5, 1.3), 0.12, pop=0.2)],
        env_opts={"wall": [0.2, 0.18, 0.15], "world": [0.02, 0.02, 0.02]}), still=True)
S("And in his Nobel lecture, he gave a warning.",
  stage("hall", cam((0.4, -1.8, 1.7), (0.3, -1.5, 1.68), "cast0.head", lens=45), cast=[who(FLEMING, at=(0, 0.6, 0), pose=PRESENT)]), still=True)
S("If people took too little penicillin, or stopped too soon, bacteria could learn to resist it.",
  stage("studio", cam((0.3, -1.0, 0.55), (0.2, -0.85, 0.5), (0, 0, 0.15)),
        props=[P("bacteria", (0, 0, 0.08), args={"n": 30, "area": 0.4, "burst": 0.15, "resistant": 7, "seed": 13})]))

# ===================================================================== TODAY
S("He was right. Bacteria evolve. Each time we use an antibiotic, the few that happen to survive can multiply.",
  stage("studio", cam((0.3, -1.1, 0.6), (0.2, -0.9, 0.5), (0, 0, 0.15)),
        props=[P("bacteria", (0, 0, 0.1), args={"n": 22, "area": 0.35, "resistant": 22, "seed": 15, "drift": 0.1})],
        env_opts={"horizon": [0.35, 0.05, 0.05]}), chapter="Penicillin today")
S("Today, drug-resistant infections are one of the biggest threats to global health. In twenty nineteen, they directly caused an estimated one point two seven million deaths.",
  stage("space", cam((0, -3.4, 0.6), (0.3, -3.0, 0.5), (0, 0, 0)),
        texts=[T("1.27 MILLION", (0, -1.2, 1.25), 0.22, (1.0, 0.35, 0.35), pop=0.4)]), still=True)
S("That's why doctors ask us to take antibiotics only when we need them, and to finish the course.",
  stage("studio", cam((0.2, -0.8, 0.5), (0.15, -0.7, 0.45), (0, 0, 0.05)), props=[P("pills"), P("vials", (0.3, 0.15, 0), args={"n": 3, "label": ""})]),
  still=True)
S("Penicillin and the antibiotics that followed it changed medicine completely. They made surgery, cancer treatment and organ transplants far safer.",
  stage("lab", cam((0, -2.8, 1.8), (0.3, -2.4, 1.7), (0, 0.4, 1.0)),
        cast=[who(NURSE, at=(-0.9, 0.3, 0), turn=-20, pose=WORK), who(FLOREY | {"hair": [0.3, 0.2, 0.1]}, at=(0.9, 0.4, 0), turn=20, pose=WORK)],
        props=[P("hospital_bed", (0, 0.3, 0))], env_opts=WARD), still=True)

# ===================================================================== CLOSE
S("Penicillin also started a gold rush. Within a few years scientists found streptomycin, the first drug that could cure tuberculosis, and dozens more antibiotics followed.",
  stage("studio", cam((0.3, -1.4, 0.7), (0.2, -1.2, 0.6), (0, 0, 0.2)),
        props=[P("petri_dish", (-0.45, 0, 0), args={"clear": [0, 0.01], "seed": 2}), P("petri_dish", (0, 0.1, 0), args={"clear": [0, 0.01], "seed": 4}),
               P("petri_dish", (0.45, 0, 0), args={"clear": [0, 0.01], "seed": 6})]), still=True)
S("It all began with a dirty dish, and a scientist curious enough to look twice.",
  stage("studio", cam((0.12, -0.3, 0.3), (0.3, -0.75, 0.6), (0.05, 0.02, 0.0), (0, 0, 0.0)), props=[P("petri_dish", args={"clear": [0.0, 0.01]})],
        env_opts={"horizon": [0.05, 0.12, 0.08]}), chapter="Close")
S("As Fleming later said: one sometimes finds what one is not looking for.",
  stage("lab", cam((0.4, -1.2, 1.65), (0.6, -2.3, 1.6), "cast0.head", "cast0.chest"), cast=[who(FLEMING, pose={**READ, "head_nod": 10})],
        props=[TABLE, P("petri_dish", (0, -0.05, 1.08), rot=[70, 0, 0], args={"clear": [0, 0.01]}), P("microscope", (0.5, -0.05, TOP))],
        env_opts=CLEAN), hold=1.5)

write(HERE, {
    "slug": "03-penicillin",
    "title": "How One Doctor Discovered Penicillin",
    "description": ("A forgotten dish, a fluffy blue-green mould, and a decade-long race to turn it into a medicine. "
                    "The story of Alexander Fleming, the Oxford team and the first antibiotic, told in 3D animation."),
    "tags": ["penicillin", "Alexander Fleming", "antibiotics", "Howard Florey", "Ernst Chain", "Norman Heatley",
             "history of medicine", "antibiotic resistance", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.25, "sentence_silence": 0.28,
              "pronunciations": {"Staphylococcus": "staff-ill-oh-cock-us", "Penicillium": "pen-ih-sill-ee-um",
                                 "lysozyme": "lie-so-zime", "streptococcus": "strep-toe-cock-us", "Peoria": "pee-or-ee-a",
                                 "Hodgkin": "Hodge-kin"}},
    "music_mood": "hopeful",
    "sources": [
        "https://www.acs.org/education/whatischemistry/landmarks/flemingpenicillin.html",
        "https://www.nobelprize.org/prizes/medicine/1945/fleming/lecture/",
        "https://www.ox.ac.uk/news/2010-08-26-penicillin-pioneer-norman-heatley",
        "https://www.sciencehistory.org/education/scientific-biographies/alexander-fleming/",
        "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)02724-0/fulltext",
        "https://www.nobelprize.org/prizes/chemistry/1964/hodgkin/biographical/",
    ],
}, S.shots)
