"""Shot list for long-form #4: The Man Who Harnessed Nuclear Energy (Enrico Fermi).  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

SUIT = {"skin": SKIN, "shirt": [0.22, 0.22, 0.25], "pants": [0.2, 0.2, 0.23], "boots": [0.04, 0.03, 0.02]}
FERMI = {"hair": [0.08, 0.06, 0.05], "sleeves": "long", "outfit": SUIT}
YOUNG_FERMI = {"hair": [0.08, 0.06, 0.05], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.3, 0.25, 0.2], "pants": [0.25, 0.2, 0.15]}}
LAURA = {"hair": [0.25, 0.15, 0.08], "sleeves": "long",
         "outfit": {"skin": SKIN, "shirt": [0.45, 0.12, 0.2], "pants": [0.45, 0.12, 0.2], "boots": [0.1, 0.05, 0.04]}}
COLLEAGUE = {"hair": [0.35, 0.25, 0.15], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.3, 0.27, 0.22], "pants": [0.25, 0.23, 0.2]}}
COMPTON = {"hair": [0.5, 0.45, 0.4], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.15, 0.17, 0.25]}}
LABCOAT = {"skin": SKIN, "shirt": [0.85, 0.87, 0.9], "pants": [0.2, 0.2, 0.23], "boots": [0.04, 0.03, 0.02]}
COURT = {"wall": [0.45, 0.42, 0.38], "world": [0.03, 0.03, 0.03], "window_x": -6}
WINTER = {"sky": {"horizon": [0.55, 0.6, 0.7], "zenith": [0.25, 0.3, 0.45], "strength": 0.9}, "floor": [0.85, 0.87, 0.9]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
BENCH = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))
PILE_CAM = cam((2.6, -4.2, 2.0), (2.0, -3.4, 1.8), (0, 0, 0.8), lens=30)

# ===================================================================== HOOK
S("On a freezing afternoon in December nineteen forty two, a group of scientists stood on a balcony inside an old squash court in Chicago.",
  stage("lab", PILE_CAM, cast=[who(FERMI, at=(1.9, -1.0, 0), turn=-40, pose={**STAND, "head_nod": 10}),
                               who(COLLEAGUE, at=(2.5, -0.6, 0), turn=-50, pose=STAND)],
        props=[P("graphite_pile")], env_opts=COURT), still=True)
S("In front of them was a strange, dark mound, built from about forty five thousand blocks of graphite and tonnes of uranium.",
  stage("lab", cam((0.5, -3.6, 1.3), (1.4, -3.0, 1.5), (0, 0, 0.8), lens=30), props=[P("graphite_pile")], env_opts=COURT))
S("If their calculations were wrong, it might run out of control. If they were right, it would be the first time humans had ever released the power locked inside the atom, on purpose.",
  stage("studio", cam((0, -3.0, 0.8), (0, -2.6, 0.7), (0, 0, 0.5)), props=[P("chain_reaction", (-1.2, 0, 0.5), args={"generations": 4})],
        env_opts={"horizon": [0.25, 0.1, 0.03]}))
S("The man in charge was an Italian physicist named Enrico Fermi. This is how he harnessed nuclear energy.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.8, 1.15), (0, 0, 1.1)),
        texts=[T("ENRICO FERMI", (0, 0, 1.45), 0.28, pop=0.08), T("THE MAN WHO HARNESSED NUCLEAR ENERGY", (0, 0, 1.12), 0.1, (0.4, 0.85, 1.0), pop=0.25)],
        props=[P("fission", (0, 0.5, 0.6), scale=0.6)]))

# ===================================================================== ROME
S("Fermi was born in Rome in nineteen oh one. As a boy, he taught himself physics from old textbooks he bought at a market.",
  stage("sky", cam((0, -3.0, 1.5), (0.3, -2.6, 1.4), (0, 0, 1.0)), cast=[who(YOUNG_FERMI, pose=READ, scale=0.8)],
        props=[P("books", (0.8, 0.2, 0), args={"n": 7})], texts=[T("ROME 1901", (0.9, 0.5, 1.6), 0.2, pop=0.2)],
        env_opts={"sky": {"horizon": [1.0, 0.6, 0.3], "zenith": [0.2, 0.45, 0.85]}, "floor": [0.75, 0.6, 0.4]}), still=True,
  chapter="A prodigy from Rome")
S("When he applied to university at seventeen, his entrance essay on the physics of vibrating strings was so advanced that the examiner said it was worthy of a doctorate.",
  stage("lab", cam((0.4, -1.4, 1.3), (0.25, -1.1, 1.25), (0, -0.1, 0.95)),
        props=[TABLE, P("notebook", (0, -0.1, TOP)), P("candle", (0.4, 0.0, TOP)), P("em_wave", (0, 0.2, 1.25), scale=0.25)],
        env_opts={"wall": [0.3, 0.25, 0.18]}), still=True)
S("By twenty five, he was a professor in Rome, leading a group of brilliant young physicists nicknamed the Via Panisperna boys, after the street where their lab stood.",
  stage("lab", cam((0, -2.8, 1.6), (0.3, -2.4, 1.5), (0, 0.3, 1.1)),
        cast=[who(FERMI, at=(0, 0.45, 0), pose=PRESENT), who(COLLEAGUE, at=(-0.9, 0.2, 0), turn=-20), who(COLLEAGUE | {"hair": [0.1, 0.08, 0.06]}, at=(0.9, 0.2, 0), turn=20)],
        env_opts={"wall": [0.5, 0.42, 0.3]}), still=True)
S("His students nicknamed him the Pope, because on questions of physics, he never seemed to be wrong.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(FERMI, pose=PRESENT)], env_opts={"wall": [0.5, 0.42, 0.3]}), still=True)
S("In nineteen thirty three, he wrote a theory of radioactive beta decay that introduced a new force of nature, the weak force. The journal Nature rejected it, saying it was too remote from physical reality.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "REJECTED", "n": 2})],
        texts=[T("THE WEAK FORCE", (0, 0.3, 0.45), 0.08, (0.4, 0.85, 1.0), pop=0.2)]), still=True, still_at=0.7)
S("The atom has a tiny, dense centre called the nucleus, made of protons and neutrons.",
  stage("studio", cam((0.3, -1.4, 0.7), (0.15, -1.1, 0.6), (0, 0, 0.5)), props=[P("fission", (0, 0, 0.5), args={"hit": 2, "split": 3, "products": False})]),
  still=True, still_at=0.1, chapter="Slow neutrons")
S("In nineteen thirty two, the English physicist James Chadwick had discovered the neutron.",
  stage("studio", cam((0, -1.5, 0.7), (0, -1.3, 0.65), (0, 0, 0.5)), props=[P("fission", (0, 0, 0.5), args={"hit": 0.7, "split": 3, "products": False})],
        texts=[T("NEUTRON  1932", (0, 0.3, 0.9), 0.1, pop=0.15)]))
S("In nineteen thirty four, Fermi's team started firing neutrons at every element they could find, to see what would happen.",
  stage("lab", BENCH, cast=[who(FERMI, pose=WORK)], props=[TABLE, P("geiger", (0.3, -0.1, TOP), args={"clicks": [[0, -30], [0.5, 10], [0.6, -20], [0.8, 25]]}),
                                                            P("glassware", (-0.4, -0.1, TOP), args={"n": 3})], env_opts={"wall": [0.5, 0.42, 0.3]}))
S("Neutrons have no electric charge, so they can slip right into a nucleus, and make it unstable.",
  stage("studio", cam((0.4, -2.4, 0.8), (0.2, -2.0, 0.7), (-0.3, 0, 0.5)), props=[P("fission", (0, 0, 0.5), args={"hit": 0.6, "split": 3, "products": False})]))
S("Then they noticed something strange. The results changed depending on what the table was made of.",
  stage("lab", cam((0.4, -1.3, 1.3), (0.25, -1.1, 1.25), (0, -0.1, 0.95)),
        props=[TABLE, P("geiger", (-0.2, -0.1, TOP), args={"clicks": [[0, -20], [0.3, 20], [0.6, -25]]}), P("glassware", (0.3, -0.1, TOP), args={"n": 1})],
        env_opts={"wall": [0.5, 0.42, 0.3]}))
S("Experiments on a wooden table gave far stronger effects than on a marble one.",
  stage("studio", cam((0, -1.5, 0.7), (0, -1.3, 0.65), (0, 0, 0.3)),
        props=[P("table", (-0.45, 0, 0), args={"w": 0.7, "d": 0.5, "h": 0.4}), P("table", (0.45, 0, 0), args={"w": 0.7, "d": 0.5, "h": 0.4, "color": [0.85, 0.85, 0.82]}),
               P("geiger", (-0.45, 0, 0.4), args={"clicks": [[0, -40], [0.3, 40], [0.5, -40], [0.7, 40]]}), P("geiger", (0.45, 0, 0.4))],
        texts=[T("WOOD", (-0.45, 0, 0.75), 0.08, pop=0.1), T("MARBLE", (0.45, 0, 0.75), 0.08, (1, 1, 1), pop=0.2)]))
S("Fermi had a hunch. He put a block of paraffin wax between the neutrons and the target, and the radioactivity shot up, a hundred times stronger.",
  stage("studio", cam((0.3, -1.2, 0.6), (0.2, -1.0, 0.55), (0, 0, 0.2)),
        props=[P("geiger", (0.4, 0, 0), args={"clicks": [[0, -30], [0.4, -30], [0.45, 50], [0.55, 45], [0.65, 50]]})],
        texts=[T("×100", (0, 0.2, 0.55), 0.15, (1.0, 0.5, 0.2), pop=0.5)]))
S("The hydrogen in the wax, and in the wooden table, slowed the neutrons down. And slow neutrons were far better at being captured by nuclei.",
  stage("studio", cam((0.4, -2.4, 0.8), (0.2, -2.0, 0.7), (-0.3, 0, 0.5)), props=[P("fission", (0, 0, 0.5), args={"hit": 0.9, "split": 3, "products": False})]))
S("This discovery of slow neutrons would turn out to be the key to the nuclear reactor.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("SLOW NEUTRONS", (0, 0, 1.0), 0.2, (0.4, 0.85, 1.0), pop=0.15)],
        props=[P("graphite_pile", (1.4, 1.2, 0), scale=0.35)]), still=True, still_at=0.8)

# ===================================================================== ESCAPE
S("But Italy was changing. Mussolini's government passed racial laws in nineteen thirty eight, aimed at Jewish people. Fermi's wife, Laura, was Jewish.",
  stage("lab", cam((0, -2.6, 1.6), (0.2, -2.2, 1.5), (0, 0.3, 1.25)),
        cast=[who(FERMI, at=(-0.35, 0.35, 0), turn=-10), who(LAURA, at=(0.35, 0.35, 0), turn=10, scale=0.94)],
        texts=[T("1938", (0.95, 0.9, 1.7), 0.25, (1.0, 0.35, 0.35), pop=0.2)], env_opts={"wall": [0.15, 0.12, 0.1], "world": [0.015, 0.015, 0.015]}),
  still=True, chapter="Escape")
S("That November, Fermi learned he had won the Nobel Prize in Physics.",
  stage("hall", cam((0, -2.4, 1.6), (0, -2.0, 1.55), (0, 0.4, 1.3)), cast=[who(FERMI, at=(0, 0.6, 0), pose=PRESENT)],
        props=[P("medal", (0.55, 0.0, 1.4), spin=["z", 40])], texts=[T("NOBEL PRIZE 1938", (0, 0.9, 2.0), 0.14, pop=0.2)]), still=True)
S("He used the trip to Stockholm as an escape. After collecting the prize, the family never went home. They sailed straight on to New York.",
  stage("studio", cam((0, -2.6, 2.0), (0.4, -2.0, 1.6), (0, 0, 0.3)), props=[P("route", (0, 0, 0.05), args={"stops": ["ROME", "STOCKHOLM", "NEW YORK"]})]))
S("Just weeks later, news arrived from Germany. Otto Hahn and Fritz Strassmann had found that uranium, hit by neutrons, could split in two.",
  stage("studio", cam((0, -3.0, 0.8), (0, -2.6, 0.7), (0, 0, 0.5)), props=[P("fission", (0, 0, 0.5), args={"hit": 0.3, "split": 0.45})]),
  chapter="Splitting the atom")
S("Lise Meitner and Otto Frisch explained it, and named it fission.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("FISSION", (0, 0, 1.0), 0.3, (1.0, 0.6, 0.2), pop=0.1)],
        props=[P("fission", (0, 0.6, 0.3), scale=0.5, args={"hit": 0.05, "split": 0.2})]), still=True, still_at=0.85)
S("Fermi's team had probably split uranium atoms back in Rome, four years earlier, without realising it.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(FERMI, pose={**STAND, "head_nod": 15})],
        env_opts={"wall": [0.5, 0.42, 0.3]}), still=True)
S("When a uranium nucleus splits, it releases a burst of energy, and two or three new neutrons.",
  stage("studio", cam((0, -2.8, 0.8), (0, -2.4, 0.7), (0, 0, 0.5)), props=[P("fission", (0, 0, 0.5), args={"hit": 0.2, "split": 0.35, "neutrons": 3})]))
S("Fermi and others saw what that meant. If those neutrons split more atoms, which freed more neutrons, you could get a chain reaction.",
  stage("studio", cam((0.6, -3.6, 1.2), (0.4, -3.2, 1.0), (0.3, 0, 0.6)), props=[P("chain_reaction", (-1.2, 0, 0.6), args={"generations": 4, "start": 0.05, "span": 0.85})]))
S("Controlled, it could power cities. Uncontrolled, it could become a bomb.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.1, 0.95), (0, 0, 0.8)),
        texts=[T("CONTROLLED", (-0.6, 0, 1.0), 0.14, (0.4, 1.0, 0.6), pop=0.1), T("UNCONTROLLED", (0.6, 0, 1.0), 0.14, (1.0, 0.35, 0.3), pop=0.45)]),
  still=True, still_at=0.8)

# ===================================================================== CHICAGO PILE-1
S("The Hungarian physicist Leo Szilard had dreamed up the idea of a chain reaction years before. In nineteen thirty nine, he persuaded Albert Einstein to sign a letter warning President Roosevelt.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.95)), props=[TABLE, P("newspapers", (0, -0.1, TOP), args={"headline": "AUGUST 2, 1939", "n": 1}),
        P("candle", (0.4, 0, TOP))], env_opts={"wall": [0.3, 0.32, 0.34]}), still=True)
S("The Second World War had begun. Scientists feared that Nazi Germany might build an atomic bomb first.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("1939", (0, 0, 1.0), 0.35, (1.0, 0.3, 0.3), pop=0.1)],
        env_opts={"horizon": [0.2, 0.03, 0.03]}), still=True, chapter="Chicago Pile-1")
S("The United States launched a secret project, and Fermi was asked to prove that a chain reaction was even possible.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 1.1)),
        cast=[who(FERMI, at=(-0.45, 0.35, 0), turn=-12, pose=PRESENT), who(COMPTON, at=(0.45, 0.35, 0), turn=12, pose=STAND)],
        props=[TABLE, P("notebook", (0, -0.1, TOP))], env_opts={"wall": [0.3, 0.32, 0.34]}), still=True)
S("His team built a reactor in a squash court under the stands of Stagg Field, the University of Chicago's abandoned football stadium.",
  stage("sky", cam((0, -7.0, 2.0), (0.5, -6.0, 2.4), (0, 2, 2.5), lens=28), props=[P("stadium", (0, 2, 0))], env_opts=WINTER))
S("They called it a pile, because that's exactly what it was: a pile of graphite bricks, layer after layer, with lumps of uranium tucked inside.",
  stage("lab", cam((1.8, -3.0, 1.2), (1.2, -2.4, 1.5), (0, 0, 0.9), lens=30), props=[P("graphite_pile")], env_opts=COURT))
S("The graphite did the same job as Fermi's paraffin wax. It slowed the neutrons down, so they would split more uranium.",
  stage("studio", cam((0.6, -3.6, 1.2), (0.4, -3.2, 1.0), (0.3, 0, 0.6)),
        props=[P("chain_reaction", (-1.2, 0, 0.6), args={"generations": 3, "start": 0.1, "span": 0.8}), P("graphite_pile", (0.3, 2.5, 0), scale=0.6)]))
S("Running through the pile were control rods coated with cadmium, a metal that soaks up neutrons. Pull them out, and the reaction grows. Push them in, and it dies.",
  stage("lab", cam((1.2, -2.6, 1.4), (0.8, -2.2, 1.3), (0, -1.2, 0.8)), props=[P("graphite_pile", args={"rods": [[0.1, 0], [0.5, 0.8], [0.8, 0.0]]})],
        env_opts=COURT))
S("There was no radiation shield, and no cooling system. Their safety plan included a rod on a rope that one man could cut with an axe, and three young physicists standing on top with buckets of cadmium solution.",
  stage("lab", cam((2.2, -3.4, 2.6), (1.8, -2.9, 2.4), (0, 0, 1.4), lens=30),
        cast=[who(COLLEAGUE, at=(-0.4, 0.2, 1.54), pose=STAND, scale=0.9), who(COLLEAGUE | {"hair": [0.6, 0.4, 0.2]}, at=(0.3, -0.1, 1.54), pose=STAND, scale=0.9)],
        props=[P("graphite_pile"), P("vessels", (0, 0.4, 1.54), scale=0.4, args={"kinds": ["churn", "churn"]})], env_opts=COURT), still=True)
S("They were nicknamed the suicide squad.",
  stage("lab", cam((0.8, -1.8, 2.3), (0.6, -1.5, 2.25), "cast0.head", lens=40),
        cast=[who(COLLEAGUE, at=(-0.4, 0.2, 1.54), pose=STAND, scale=0.9), who(COLLEAGUE | {"hair": [0.6, 0.4, 0.2]}, at=(0.3, -0.1, 1.54), pose=STAND, scale=0.9)],
        props=[P("graphite_pile")], env_opts=COURT), still=True)

# ===================================================================== DECEMBER 2, 1942
S("On the morning of the second of December, nineteen forty two, Fermi ordered the control rods to be pulled out, step by step.",
  stage("lab", cam((1.2, -2.6, 1.4), (0.8, -2.2, 1.3), (0, -1.2, 0.8)),
        props=[P("graphite_pile", args={"rods": [[0.1, 0], [0.3, 0.2], [0.5, 0.2], [0.6, 0.4], [0.8, 0.4], [0.9, 0.6]]})],
        texts=[T("2 DECEMBER 1942", (-0.8, 1.2, 2.0), 0.14, pop=0.15)], env_opts=COURT), chapter="December 2, 1942")
S("After each step, he checked the neutron counters, and calculated with his pocket slide rule exactly what should happen next.",
  stage("studio", cam((0.25, -0.75, 0.35), (0.18, -0.65, 0.32), (0, 0, 0.03)),
        props=[P("slide_rule", (0, 0, 0.01), args={"slide": [[0, 0], [0.3, 0.06], [0.6, -0.04], [0.9, 0.08]]}), P("geiger", (0.35, 0.15, 0))]))
S("The counters clicked faster and faster. Then, at about half past three in the afternoon, Fermi closed his slide rule and smiled.",
  stage("lab", cam((0.4, -1.3, 1.65), (0.3, -1.1, 1.62), "cast0.head", lens=45), cast=[who(FERMI, pose={**STAND, "head_nod": 5})],
        props=[P("geiger", (0.5, -0.5, 1.0), args={"clicks": [[0, -40], [0.2, 0], [0.3, -30], [0.4, 20], [0.5, -10], [0.6, 40], [0.7, 30], [0.8, 45]]})],
        env_opts=COURT))
S("The reaction is self-sustaining, he announced. For the first time, a nuclear chain reaction was running under human control.",
  stage("lab", PILE_CAM, cast=[who(FERMI, at=(1.9, -1.0, 0), turn=-40, pose=PRESENT)],
        props=[P("graphite_pile", args={"glow": [[0, 0], [0.3, 0], [0.6, 1.2]]})], env_opts=COURT))
S("It ran for about four and a half minutes, producing about half a watt, less than a small torch bulb. Then Fermi ordered the rods back in.",
  stage("studio", cam((0, -1.4, 0.6), (0, -1.2, 0.55), (0, 0, 0.25)), props=[P("bulb", (0, 0, 0.12), args={"on": 0.2, "strength": 4})],
        texts=[T("0.5 WATTS", (0, 0.3, 0.55), 0.12, pop=0.3)]))
S("The pile was later taken apart and rebuilt outside the city, in the forest that became Argonne National Laboratory.",
  stage("sky", cam((0, -4.5, 1.8), (0.5, -3.8, 1.6), (0, 0, 0.8), lens=30), props=[P("graphite_pile", scale=0.8)], env_opts=WINTER), still=True)
S("Someone produced a bottle of Italian Chianti wine. They drank from paper cups, and signed the bottle's straw wrapper.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0.1, -0.1, 0.98)), props=[TABLE, P("bottle", (0, -0.1, TOP))], env_opts=COURT),
  still=True)
S("The project's leader, Arthur Compton, phoned Washington in code. The Italian navigator has landed in the new world, he said. How were the natives? Very friendly.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(COMPTON, pose={**STAND, "raise_arm": {"R": 30}, "arm_forward": {"R": 40},
                                                                                         "elbow": {"R": 140}, "twist": {"R": 60}})],
        env_opts={"wall": [0.3, 0.32, 0.34]}), still=True)

# ===================================================================== THE BOMB
S("Fermi's reactor opened the door to the Manhattan Project, and in nineteen forty five, to the atomic bombs that destroyed Hiroshima and Nagasaki.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.1, 0.95), (0, 0, 0.8)), texts=[T("1945", (0, 0, 1.0), 0.35, (0.8, 0.8, 0.8), pop=0.1)],
        env_opts={"horizon": [0.06, 0.06, 0.06], "zenith": [0.0, 0.0, 0.0]}), still=True, chapter="Power and its price")
S("Fermi worked on the bomb at Los Alamos. Like many of the scientists, he lived with the consequences for the rest of his life. After the war, he opposed building the even more powerful hydrogen bomb.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(FERMI, pose={**STAND, "head_nod": 18})],
        env_opts={"wall": [0.08, 0.09, 0.1], "world": [0.01, 0.01, 0.01]}), still=True)

# ===================================================================== PEACEFUL POWER
S("At the first test explosion, in the New Mexico desert, Fermi dropped scraps of paper as the blast wave passed, and from how far they flew, estimated its power. He was not far off.",
  stage("sky", cam((0.5, -2.0, 1.6), (0.3, -1.7, 1.55), "cast0.head"), cast=[who(FERMI, pose={**STAND, "raise_arm": {"R": 30}, "arm_forward": {"R": 60}, "elbow": {"R": 20}})],
        env_opts={"sky": {"horizon": [0.9, 0.55, 0.3], "zenith": [0.2, 0.3, 0.6]}, "floor": [0.6, 0.45, 0.3]}), still=True)
S("But the same principle could also be used to make electricity.",
  stage("studio", cam((0, -1.4, 0.6), (0, -1.2, 0.55), (0, 0, 0.25)), props=[P("bulb", (0, 0, 0.12), args={"on": 0.3})]),
  chapter="Atoms for power")
S("In a nuclear power station, the heat from fission boils water into steam. The steam spins a turbine, and the turbine spins a generator.",
  stage("studio", cam((0.5, -2.4, 1.4), (0.3, -2.0, 1.2), (0, 0, 0.5)),
        props=[P("reactor_core", (-0.8, 0, 0), scale=0.5, args={"rods_out": [0.05, 0.3]}), P("generator_hall", (0.9, 0.5, 0), scale=0.35, args={"n": 1})],
        texts=[T("HEAT → STEAM → TURBINE → ELECTRICITY", (0, 0.5, 1.2), 0.08, pop=0.3)]))
S("In December nineteen fifty one, an experimental reactor in Idaho, called E B R one, lit four light bulbs. It was the first electricity ever made from nuclear energy.",
  stage("studio", cam((0, -1.6, 0.7), (0, -1.4, 0.65), (0, 0, 0.3)),
        props=[P("bulb", (x, 0, 0.12), args={"on": 0.2 + 0.1 * i}) for i, x in enumerate((-0.45, -0.15, 0.15, 0.45))],
        texts=[T("1951", (0, 0.3, 0.65), 0.14, pop=0.15)]))
S("In nineteen fifty four, a small plant at Obninsk in the Soviet Union became the first to feed nuclear power into an electricity grid. Britain and the United States soon followed.",
  stage("sky", cam((0, -6.0, 2.0), (0.5, -5.2, 1.9), (0, 2, 1.5), lens=30), props=[P("cooling_towers", (0, 2.5, 0))]), still=True)
S("Today, around four hundred nuclear reactors produce roughly a tenth of the world's electricity, without burning any fuel or releasing carbon dioxide as they run.",
  stage("sky", cam((-2, -7.0, 2.4), (2, -6.4, 2.2), (0, 2, 1.5), lens=28), props=[P("cooling_towers", (0, 2.5, 0), args={"n": 3}), P("city", (0, 8, 0), scale=0.6)]))
S("Nuclear power has its problems: the radioactive waste must be stored safely for thousands of years, and accidents like Chernobyl and Fukushima showed the price of getting it wrong.",
  stage("studio", cam((0.3, -1.2, 0.6), (0.2, -1.0, 0.55), (0, 0, 0.2)),
        props=[P("vessels", (0, 0, 0), args={"kinds": ["churn", "churn", "churn"], "spacing": 0.35}), P("geiger", (0.6, -0.1, 0), args={"clicks": [[0, -40], [0.4, 30], [0.6, -20], [0.8, 40]]})],
        env_opts={"horizon": [0.25, 0.2, 0.02]}))
S("But it remains one of the largest sources of low-carbon electricity on Earth.",
  stage("lab", cam((0.6, -2.0, 1.6), (0.4, -1.6, 1.4), (0, 0, 0.4)), props=[P("reactor_core", args={"rods_out": [0.1, 0.6]})],
        env_opts={"wall": [0.2, 0.25, 0.3], "world": [0.02, 0.02, 0.03]}))

# ===================================================================== LEGACY
S("Fermi died of cancer in nineteen fifty four, at just fifty three years old.",
  stage("lab", cam((0, -1.2, 1.2), (0, -1.0, 1.15), (0, -0.1, 0.95)), props=[TABLE, P("candle", (0, -0.1, TOP)), P("slide_rule", (0.3, -0.1, TOP + 0.01))],
        texts=[T("1901 – 1954", (0, 0.4, 1.12), 0.1, pop=0.2)], env_opts={"wall": [0.05, 0.06, 0.07], "world": [0.01, 0.01, 0.015]}),
  still=True, chapter="Legacy")
S("Element number one hundred, fermium, is named after him. So is Fermilab, one of America's great particle physics laboratories, and a whole family of particles, the fermions.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("Fm", (0, 0, 1.1), 0.4, pop=0.1), T("100", (-0.3, 0, 1.4), 0.1, (1, 1, 1), pop=0.2)]),
  still=True, still_at=0.8)
S("He was famous for estimating anything, quickly, from a few simple facts. Physicists still call these Fermi problems.",
  stage("lab", BENCH, cast=[who(FERMI, pose=PRESENT)], props=[TABLE, P("slide_rule", (0.1, -0.1, TOP + 0.01))], env_opts={"wall": [0.3, 0.32, 0.34]}), still=True)
S("And over lunch one day in nineteen fifty, talking about aliens, he asked a question that scientists still argue about: so where is everybody?",
  stage("space", cam((0, -3.0, 0.4), (0, -2.6, 0.5), (0, 0, 0.8)), texts=[T("WHERE IS EVERYBODY?", (0, 0, 0.8), 0.15, (0.6, 0.9, 1.0), pop=0.4)]))
S("From a squash court under a football stadium, Enrico Fermi showed that the energy inside the atom could be released, and controlled.",
  stage("lab", cam((0.5, -3.6, 1.3), (2.4, -4.4, 2.0), (0, 0, 0.8), lens=30), props=[P("graphite_pile", args={"glow": [[0, 0.3], [1, 1.0]]})], env_opts=COURT),
  chapter="Close")
S("For better and for worse, we have been living in his nuclear age ever since.",
  stage("night", cam((0, -2.0, 1.4), (0, -7.5, 3.0), (0, 2, 1.4), (0, 4, 1.2), 40, 28),
        props=[P("cooling_towers", (0, 3, 0)), P("city", (0, 6, 0), scale=0.7, args={"on": 0.3})]), hold=1.5)

write(HERE, {
    "slug": "04-nuclear",
    "title": "The Man Who Harnessed Nuclear Energy",
    "description": ("In a squash court under a Chicago football stadium, Enrico Fermi's team built the world's first nuclear reactor. "
                    "From slow neutrons in Rome to Chicago Pile-1 and today's power stations, told in 3D animation."),
    "tags": ["Enrico Fermi", "nuclear energy", "Chicago Pile-1", "nuclear reactor", "chain reaction", "fission",
             "Manhattan Project", "history of science", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.25, "sentence_silence": 0.28,
              "pronunciations": {"Fermi": "Fair-mee", "Panisperna": "Pah-nee-spair-na", "Obninsk": "Ob-ninsk", "Strassmann": "Strahs-man",
                                 "Meitner": "Mite-ner", "Chianti": "Kee-an-tee", "fermium": "fair-mee-um", "Fermilab": "Fair-mee-lab",
                                 "fermions": "fair-mee-ons", "E B R one": "E B R one"}},
    "music_mood": "tense",
    "sources": [
        "https://www.nobelprize.org/prizes/physics/1938/fermi/biographical/",
        "https://www.energy.gov/articles/fermi-and-first-nuclear-reactor",
        "https://www.anl.gov/article/the-first-reactor",
        "https://www.osti.gov/opennet/manhattan-project-history/Events/1942/chicago_pile.htm",
        "https://www.iaea.org/newscenter/news/what-is-nuclear-energy-the-science-of-nuclear-power",
        "https://inl.gov/experimental-breeder-reactor-i/",
    ],
}, S.shots)
