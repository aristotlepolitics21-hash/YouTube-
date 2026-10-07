"""Shot list for long-form #7: How the First Computer Changed the World (ENIAC).  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

SUIT = {"skin": SKIN, "shirt": [0.15, 0.15, 0.18], "pants": [0.15, 0.15, 0.18], "boots": [0.04, 0.03, 0.02]}
ECKERT = {"hair": [0.1, 0.07, 0.05], "sleeves": "long", "outfit": SUIT}
MAUCHLY = {"hair": [0.3, 0.22, 0.15], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.25, 0.22, 0.18], "pants": [0.25, 0.22, 0.18]}}
BABBAGE = {"hair": [0.55, 0.5, 0.45], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.12, 0.1, 0.1]}}
LOVELACE = {"hair": [0.1, 0.06, 0.04], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.25, 0.1, 0.3], "pants": [0.25, 0.1, 0.3], "boots": [0.1, 0.05, 0.05]}}
PROGRAMMERS = [
    {"hair": [0.3, 0.18, 0.08], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.2, 0.35, 0.6], "pants": [0.2, 0.35, 0.6], "boots": [0.1, 0.05, 0.04]}},
    {"hair": [0.08, 0.06, 0.05], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.6, 0.2, 0.25], "pants": [0.6, 0.2, 0.25], "boots": [0.1, 0.05, 0.04]}},
    {"hair": [0.6, 0.45, 0.2], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.25, 0.5, 0.3], "pants": [0.25, 0.5, 0.3], "boots": [0.1, 0.05, 0.04]}},
]
TURING = {"hair": [0.15, 0.1, 0.06], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.3, 0.28, 0.25], "pants": [0.2, 0.2, 0.22]}}
ROOM = {"wall": [0.35, 0.37, 0.36], "world": [0.03, 0.03, 0.03]}
DARK = {"horizon": [0.02, 0.1, 0.06], "zenith": [0.0, 0.01, 0.01]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
BENCH = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))
ENIAC_CAM = cam((0.6, -2.0, 1.6), (0.3, -1.6, 1.5), (-0.6, 1.2, 1.2), lens=26)

# ===================================================================== HOOK
S("The phone in your pocket can do billions of calculations every second.",
  stage("studio", cam((0, -0.6, 0.25), (0, -0.5, 0.22), (0, 0, 0.1)), props=[P("phone", (0, 0, 0.1), rot=[-70, 0, 0], args={"glow": 0.1})]))
S("Eighty years ago, a machine that could do just five thousand calculations a second filled an entire room, weighed thirty tonnes, and drew a hundred and fifty kilowatts of power.",
  stage("lab", ENIAC_CAM, props=[P("eniac")], env_opts=ROOM))
S("It was called ENIAC, and it was one of the first general-purpose electronic computers.",
  stage("lab", cam((0, -1.4, 1.5), (0.2, -1.2, 1.45), (-0.3, 2.4, 1.3), lens=30), props=[P("eniac")], texts=[T("ENIAC", (0.2, 0.6, 2.3), 0.3, pop=0.1)],
        env_opts=ROOM))
S("This is the story of how it was built, the women who programmed it, and how it changed the world.",
  stage("studio", cam((0, -3.0, 1.2), (0, -2.6, 1.15), (0, 0, 1.1)), texts=[T("THE FIRST COMPUTER", (0, 0, 1.3), 0.25, pop=0.08)],
        props=[P("binary_rain", (0, 1.0, 0.3))], env_opts=DARK))

# ===================================================================== BEFORE
S("For centuries, a computer wasn't a machine at all. It was a job title: a person who did calculations by hand.",
  stage("lab", cam((0, -3.0, 1.7), (0.3, -2.6, 1.6), (0, 0.3, 1.0)),
        cast=[who(PROGRAMMERS[i % 3], at=(x, 0.35, 0), pose=WORK, scale=0.95) for i, x in enumerate((-1.1, 0, 1.1))],
        props=[P("table", (0, -0.1, 0), args={"w": 3.2}), P("books", (-1.1, -0.1, TOP), args={"n": 3}), P("books", (1.1, -0.1, TOP), args={"n": 2, "seed": 5})],
        env_opts=ROOM), still=True, chapter="Before electronic computers")
S("In the eighteen twenties, the English mathematician Charles Babbage designed a mechanical calculator called the Difference Engine, made of thousands of brass gears.",
  stage("lab", cam((0.6, -1.8, 1.3), (0.4, -1.5, 1.2), (0, 0, 0.9)), cast=[who(BABBAGE, at=(-0.8, 0.4, 0), turn=-20)],
        props=[P("table", (0, 0, 0), args={"w": 1.4, "h": 0.5}), P("difference_engine", (0, 0, 0.5))], env_opts={"wall": [0.3, 0.2, 0.15], "world": [0.03, 0.02, 0.02]}), still=True)
S("Later, he designed a far more ambitious Analytical Engine, which could be programmed with punched cards. Ada Lovelace wrote what's often called the first computer program for it. But it was never built.",
  stage("lab", cam((0, -2.6, 1.6), (0.2, -2.2, 1.5), (0, 0.3, 1.25)),
        cast=[who(BABBAGE, at=(-0.45, 0.35, 0), turn=-12), who(LOVELACE, at=(0.45, 0.35, 0), turn=12, pose=READ, scale=0.94)],
        props=[TABLE, P("punch_cards", (0, -0.1, TOP))], env_opts={"wall": [0.3, 0.2, 0.15], "world": [0.03, 0.02, 0.02]}), still=True)
S("A century later, war created an urgent need for calculation.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("1939 – 1945", (0, 0, 1.0), 0.3, (1.0, 0.35, 0.3), pop=0.1)],
        env_opts={"horizon": [0.2, 0.03, 0.03]}), still=True)
S("In Britain, codebreakers at Bletchley Park built Colossus, an electronic machine that helped crack German codes. It was kept secret for decades.",
  stage("lab", cam((0.6, -2.0, 1.6), (0.3, -1.6, 1.5), (-0.6, 1.2, 1.2), lens=26), props=[P("eniac", args={"panels": 4, "seed": 9})],
        texts=[T("COLOSSUS 1944", (0.5, 0.8, 2.2), 0.15, pop=0.2)], env_opts={"wall": [0.25, 0.27, 0.22], "world": [0.03, 0.03, 0.03]}), still=True)
S("In Germany, Konrad Zuse had already built the Z3 in nineteen forty one, a programmable machine that used thousands of clicking telephone relays.",
  stage("lab", cam((0.6, -2.0, 1.6), (0.3, -1.6, 1.5), (-0.6, 1.2, 1.2), lens=26), props=[P("eniac", args={"panels": 3, "seed": 11, "blink": False})],
        texts=[T("Z3  1941", (0.5, 0.8, 2.2), 0.15, pop=0.2)], env_opts={"wall": [0.3, 0.28, 0.25], "world": [0.03, 0.03, 0.03]}), still=True)
S("And in Iowa, John Atanasoff and Clifford Berry built an electronic calculator for solving equations. Who built the first computer depends on exactly how you define one.",
  stage("lab", BENCH, cast=[who(ECKERT | {"hair": [0.4, 0.3, 0.2]}, pose=WORK)], props=[TABLE, P("vacuum_tube", (0, -0.1, TOP), scale=1.5)], env_opts=ROOM), still=True)
S("In America, the army had a different problem: artillery.",
  stage("sky", cam((0, -5, 1.2), (0.3, -4.6, 1.2), (0, 0, 0.8)), props=[P("trajectory", args={"draw": [0.1, 0.9]})],
        env_opts={"sky": {"horizon": [0.7, 0.6, 0.5], "zenith": [0.25, 0.3, 0.45]}, "floor": [0.35, 0.33, 0.22]}), chapter="The firing tables")
S("To aim a big gun, soldiers needed firing tables: books of numbers telling them the angle to use for every distance, wind and temperature.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("books", args={"n": 4}), P("newspapers", (0.45, 0, 0), args={"headline": "FIRING TABLE 155mm", "n": 1})]),
  still=True)
S("Each trajectory took a human computer, with a desk calculator, about a day or more to work out. A single table needed thousands of them.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(PROGRAMMERS[0], pose=WORK)],
        props=[TABLE, P("books", (0.45, -0.1, TOP), args={"n": 8})], env_opts=ROOM), still=True)
S("At the University of Pennsylvania, dozens of women worked on these calculations. They couldn't keep up.",
  stage("lab", cam((0, -3.4, 1.9), (0.3, -3.0, 1.8), (0, 0.3, 1.0)),
        cast=[who(PROGRAMMERS[i % 3], at=(x, y, 0), pose=WORK, scale=0.95) for i, (x, y) in enumerate(((-1.2, 0.35), (0, 0.35), (1.2, 0.35), (-0.6, 1.6), (0.6, 1.6)))],
        props=[P("table", (0, -0.1, 0), args={"w": 3.2}), P("table", (0, 1.15, 0), args={"w": 2.2})], env_opts=ROOM), still=True)

# ===================================================================== BUILDING ENIAC
S("A physicist named John Mauchly had an idea: build a calculator that used electronic vacuum tubes instead of moving parts.",
  stage("lab", BENCH, cast=[who(MAUCHLY, pose=PRESENT)], props=[TABLE, P("vacuum_tube", (0.1, -0.1, TOP), scale=2.0)], env_opts=ROOM), still=True,
  chapter="Building ENIAC")
S("The project was based at the university's Moore School of Electrical Engineering, under the code name Project PX. It eventually cost about half a million dollars.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("PROJECT PX", (0, 0, 1.1), 0.25, pop=0.1), T("$487,000", (0, 0, 0.78), 0.14, (1, 1, 1), pop=0.4)]),
  still=True, still_at=0.8)
S("A vacuum tube is like a light bulb that can act as a switch, turning a current on and off thousands of times a second, with nothing moving at all.",
  stage("studio", cam((0.2, -0.6, 0.25), (0.14, -0.5, 0.22), (0, 0, 0.1)), props=[P("vacuum_tube", args={"on": 0.2, "flicker": True})]))
S("With a brilliant young engineer, J. Presper Eckert, Mauchly convinced the army to pay for it in nineteen forty three.",
  stage("lab", cam((0, -2.6, 1.6), (0.2, -2.2, 1.5), (0, 0.3, 1.25)),
        cast=[who(MAUCHLY, at=(-0.45, 0.35, 0), turn=-12, pose=PRESENT), who(ECKERT, at=(0.45, 0.35, 0), turn=12)],
        props=[TABLE, P("notebook", (0, -0.1, TOP))], texts=[T("1943", (0.95, 0.9, 1.7), 0.25, pop=0.2)], env_opts=ROOM), still=True)
S("Experts warned that it would never work. With so many tubes, they said, one would burn out every few seconds.",
  stage("studio", cam((0.4, -1.2, 0.5), (0.3, -1.0, 0.45), (0, 0, 0.12)),
        props=[P("vacuum_tube", (x, y, 0), args={"on": 0.05, "flicker": i % 3 == 0}) for i, (x, y) in enumerate([(x * 0.14, y * 0.14) for x in range(-3, 4) for y in range(0, 3)])]))
S("Eckert solved it by running the tubes well below their limits, and choosing them carefully. Failures fell to about one tube every two days.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("1 FAILURE / 2 DAYS", (0, 0, 1.0), 0.16, (0.4, 1.0, 0.6), pop=0.2)],
        props=[P("vacuum_tube", (0, 0.4, 0.2), scale=3.0)]), still=True, still_at=0.8)
S("The finished machine had almost eighteen thousand vacuum tubes, seventy thousand resistors, and around five million hand-soldered joints.",
  stage("lab", cam((-0.8, -1.4, 1.4), (-0.6, -1.0, 1.4), (-1.6, 1.2, 1.3), lens=28), props=[P("eniac")],
        texts=[T("17,468 TUBES", (0.2, 1.0, 2.1), 0.15, pop=0.3)], env_opts=ROOM))
S("Surprisingly, it didn't count in binary. ENIAC worked in ordinary decimal numbers, using rings of ten tubes to store each digit.",
  stage("studio", cam((0.4, -1.2, 0.5), (0.3, -1.0, 0.45), (0, 0, 0.12)),
        props=[P("vacuum_tube", (0.12 * k - 0.54, 0, 0), args={"on": 0.05 if k == 7 else 2}) for k in range(10)], texts=[T("7", (0, 0.2, 0.45), 0.2, pop=0.2)]))
S("Its panels, arranged in a giant U, stretched about thirty metres, and the whole machine weighed thirty tonnes.",
  stage("lab", cam((2.0, -3.0, 3.0), (1.6, -2.4, 3.2), (-0.3, 1.2, 1.0), lens=24), props=[P("eniac", args={"panels": 12})], env_opts=ROOM), still=True)

# ===================================================================== THE PROGRAMMERS
S("Six women were chosen from the human computers to program it: Kay McNulty, Betty Jennings, Betty Snyder, Marlyn Wescoff, Frances Bilas, and Ruth Lichterman.",
  stage("lab", cam((0, -3.4, 1.7), (0.3, -3.0, 1.6), (0, 0.3, 1.1)),
        cast=[who(PROGRAMMERS[i % 3], at=((i - 2.5) * 0.62, 0.35 + (i % 2) * 0.25, 0), pose=STAND, scale=0.95) for i in range(6)], env_opts=ROOM), still=True,
  chapter="The ENIAC six")
S("There were no programming languages, no keyboards, and no manuals. They were given the machine's wiring diagrams, and told to work it out.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.95)), props=[TABLE, P("newspapers", (0, -0.1, TOP), args={"headline": "BLOCK DIAGRAMS", "n": 3})],
        env_opts=ROOM), still=True)
S("Programming ENIAC meant physically rewiring it: plugging hundreds of cables and setting thousands of switches by hand. A new program could take days to set up.",
  stage("lab", cam((-0.7, -0.6, 1.4), (-0.75, -0.2, 1.35), (-1.6, 1.0, 1.1), lens=32),
        cast=[who(PROGRAMMERS[1], at=(-1.1, 0.9, 0), turn=-90, pose={**WORK, "head_nod": 0})], props=[P("eniac")], env_opts=ROOM))
S("They also invented techniques that programmers still use, like breaking a problem into sub-routines, and hunting down bugs by stepping through the machine.",
  stage("lab", cam((0, -2.6, 1.6), (0.2, -2.2, 1.5), (0, 0.3, 1.25)),
        cast=[who(PROGRAMMERS[0], at=(-0.45, 0.35, 0), turn=-12, pose=WORK), who(PROGRAMMERS[2], at=(0.45, 0.35, 0), turn=12, pose=READ)],
        props=[TABLE, P("punch_cards", (0, -0.1, TOP))], env_opts=ROOM), still=True)

# ===================================================================== FEBRUARY 1946
S("Over at Harvard, the programmer Grace Hopper later taped a real moth into a logbook after it jammed a computer: the first actual case of bug being found.",
  stage("studio", cam((0.2, -0.8, 0.5), (0.12, -0.65, 0.45), (0, 0, 0.05)), props=[P("notebook"), P("birds", (0.02, 0, 0.06), scale=0.15, args={"n": 1, "area": 0.01})]),
  still=True)
S("ENIAC was finished too late for the war. But on the fifteenth of February, nineteen forty six, it was unveiled to the press.",
  stage("lab", ENIAC_CAM, props=[P("eniac")], texts=[T("15 FEBRUARY 1946", (0.2, 0.6, 2.4), 0.15, pop=0.15)], env_opts=ROOM), chapter="February 1946")
S("For the demonstration, it calculated the path of a shell that takes thirty seconds to reach its target, in just twenty seconds. Faster than the shell itself could fly.",
  stage("sky", cam((0, -5, 1.2), (0.3, -4.6, 1.2), (0, 0, 0.8)), props=[P("trajectory", args={"draw": [0.05, 0.6]})],
        texts=[T("20 s  <  30 s", (0, 0, 2.2), 0.25, pop=0.65)], env_opts={"sky": {"horizon": [0.7, 0.6, 0.5], "zenith": [0.25, 0.3, 0.45]}, "floor": [0.35, 0.33, 0.22]}))
S("The engineers had fitted ping-pong balls cut in half over the indicator lights, so the blinking would look more dramatic for the cameras.",
  stage("lab", cam((-0.9, -0.3, 1.9), (-0.95, 0.0, 1.9), (-1.6, 0.5, 2.0), lens=40), props=[P("eniac")], env_opts=ROOM))
S("Newspapers called it a giant electronic brain. Yet at the celebration dinner afterwards, the six programmers were not invited.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "GIANT ELECTRONIC BRAIN", "n": 3})]),
  still=True, still_at=0.7)
S("Their contribution was overlooked for half a century, until historians and a new generation of programmers brought their story back to light.",
  stage("lab", cam((0, -3.4, 1.7), (0.3, -3.0, 1.6), (0, 0.3, 1.1)),
        cast=[who(PROGRAMMERS[i % 3], at=((i - 2.5) * 0.62, 0.35 + (i % 2) * 0.25, 0), pose=STAND, scale=0.95) for i in range(6)],
        props=[P("bulb", (0, -0.6, 2.3), args={"on": 0.3, "strength": 15})], env_opts={"wall": [0.12, 0.13, 0.13], "world": [0.01, 0.01, 0.01]}))

# ===================================================================== STORED PROGRAM
S("ENIAC had a big weakness. Its program lived in its wiring, so changing the task meant rebuilding the machine.",
  stage("lab", cam((-0.7, -0.6, 1.4), (-0.75, -0.2, 1.35), (-1.6, 1.0, 1.1), lens=32), props=[P("eniac")], env_opts=ROOM), still=True,
  chapter="The stored program")
S("The team, joined by the mathematician John von Neumann, came up with a better design: store the program in the computer's memory, just like data.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.1, 0.95), (0, 0, 0.8)), texts=[T("PROGRAM  =  DATA", (0, 0, 1.0), 0.2, (0.4, 0.85, 1.0), pop=0.2)],
        props=[P("binary_rain", (0, 0.8, 0.0))], env_opts=DARK), still=True, still_at=0.8)
S("Alan Turing in Britain had imagined such a universal machine back in nineteen thirty six. In nineteen forty eight, a small machine in Manchester, nicknamed the Baby, ran the first stored program.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(TURING, pose=PRESENT)],
        props=[P("eniac", (1.5, 1.0, 0), scale=0.6, args={"panels": 3})], texts=[T("1948", (0.9, 0.6, 1.7), 0.2, pop=0.3)], env_opts=ROOM), still=True)
S("Almost every computer since has been built on that idea.",
  stage("studio", cam((0, -1.6, 0.6), (0.2, -1.3, 0.55), (0, 0, 0.2)), props=[P("laptop", args={"glow": 0.2}), P("phone", (0.4, 0, 0.08), rot=[-70, 0, 0])]))

# ===================================================================== SHRINKING
S("Eckert and Mauchly started their own company, and built UNIVAC, one of the first computers sold to businesses. In nineteen fifty two, it correctly predicted Eisenhower's landslide in the US election, live on television.",
  stage("lab", cam((0.6, -2.0, 1.6), (0.3, -1.6, 1.5), (-0.6, 1.2, 1.2), lens=26), props=[P("eniac", args={"panels": 6, "seed": 21})],
        texts=[T("UNIVAC  1952", (0.5, 0.8, 2.2), 0.15, pop=0.2)], env_opts={"wall": [0.4, 0.42, 0.45], "world": [0.04, 0.04, 0.05]}), still=True)
S("Betty Holberton, one of the original six, went on to help develop early programming languages, including COBOL, which still runs many banking systems today.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(PROGRAMMERS[2], pose=PRESENT)], env_opts=ROOM), still=True)
S("Next, the machines began to shrink. In nineteen forty seven, scientists at Bell Labs invented the transistor, a tiny solid switch that could replace the fragile vacuum tube.",
  stage("studio", cam((0.25, -0.8, 0.35), (0.2, -0.7, 0.3), (0.1, 0, 0.06)), props=[P("vacuum_tube", (-0.05, 0, 0)), P("transistor", (0.2, 0, 0))],
        texts=[T("1947", (0.1, 0.2, 0.3), 0.08, pop=0.3)]), chapter="Smaller and smaller")
S("In the late nineteen fifties, Jack Kilby and Robert Noyce worked out how to put many transistors onto a single chip of silicon: the integrated circuit.",
  stage("studio", cam((0.3, -0.7, 0.45), (0.2, -0.55, 0.38), (0, 0, 0.03)), props=[P("microchip", args={"glow": [0.2, 0.6]})]))
S("In nineteen sixty five, Gordon Moore predicted that the number of transistors on a chip would keep doubling roughly every year or two. For decades, he was right.",
  stage("studio", cam((0, -2.6, 1.2), (0, -2.3, 1.1), (0, 0, 0.7)),
        props=[P("microchip", (x, 0, 0), scale=0.4 + 0.25 * i, pop=0.1 + 0.15 * i) for i, x in enumerate((-1.2, -0.6, 0.1, 0.95))],
        texts=[T("MOORE'S LAW", (0, 0, 1.5), 0.2, pop=0.05)]))
S("In nineteen seventy one, Intel squeezed an entire computer processor onto one chip, the four zero zero four, with about two thousand three hundred transistors.",
  stage("studio", cam((0.3, -0.7, 0.45), (0.2, -0.55, 0.38), (0, 0, 0.03)), props=[P("microchip", args={"glow": [0.1, 0.4]})],
        texts=[T("4004", (0, 0.3, 0.3), 0.1, pop=0.3)]))
S("By the late nineteen seventies, computers had shrunk enough to sit on a desk at home.",
  stage("lab", BENCH, cast=[who(PROGRAMMERS[0] | {"outfit": {**PROGRAMMERS[0]["outfit"], "shirt": [0.8, 0.5, 0.1], "pants": [0.2, 0.25, 0.5]}}, pose=WORK)],
        props=[TABLE, P("laptop", (0, -0.15, TOP), args={"glow": 0.2})], env_opts={"wall": [0.5, 0.4, 0.3]}), still=True)
S("A modern smartphone chip holds billions of transistors, each smaller than most viruses.",
  stage("studio", cam((0.15, -0.35, 0.25), (0.08, -0.25, 0.18), (0, 0, 0.03)), props=[P("microchip", args={"glow": [0, 0.3]})],
        texts=[T("BILLIONS", (0, 0.25, 0.2), 0.08, pop=0.4)]))

# ===================================================================== LEGACY
S("ENIAC itself went on to calculate weather forecasts, the design of nuclear weapons, and the behaviour of wind tunnels and cosmic rays.",
  stage("lab", ENIAC_CAM, props=[P("eniac")], env_opts=ROOM), still=True, chapter="Legacy")
S("And in nineteen seventy three, a court ruled that ENIAC's patent was invalid, partly because Atanasoff had got there first with key ideas.",
  stage("hall", cam((0, -2.4, 1.6), (0, -2.0, 1.55), (0, 0.4, 1.3)), props=[P("table", (0, 0.6, 0), args={"w": 2.0}), P("newspapers", (0, 0.6, TOP), args={"headline": "PATENT INVALID", "n": 2})],
        texts=[T("1973", (0, 1.0, 1.9), 0.2, pop=0.2)]), still=True)
S("It was switched off for the last time in October nineteen fifty five. Parts of it survive in museums today.",
  stage("lab", cam((0.6, -2.0, 1.6), (0.3, -1.6, 1.5), (-0.6, 1.2, 1.2), lens=26), props=[P("eniac", args={"blink": False})],
        env_opts={"wall": [0.1, 0.11, 0.11], "world": [0.01, 0.01, 0.01]}), still=True)
S("In about eighty years, we went from a thirty tonne machine that filled a room, to computers in our pockets millions of times more powerful.",
  stage("studio", cam((0, -1.6, 0.6), (0.2, -1.3, 0.55), (0, 0, 0.2)), props=[P("phone", (0, 0, 0.1), rot=[-70, 0, 0], args={"glow": 0.1}), P("eniac", (-1.0, 2.0, 0), scale=0.35)]))
S("Every app, every search, every video you watch, traces its family tree back to a room full of glowing tubes, and six women with a wiring diagram.",
  stage("lab", cam((0, -1.4, 1.5), (0.2, -3.0, 1.8), (-0.3, 2.4, 1.3), (0, 1.5, 1.2), 30, 26),
        cast=[who(PROGRAMMERS[i % 3], at=((i - 2.5) * 0.5, -0.2, 0), pose=STAND, scale=0.95) for i in range(6)], props=[P("eniac")], env_opts=ROOM),
  chapter="Close", hold=1.5)

write(HERE, {
    "slug": "07-first-computer",
    "title": "How the First Computer Changed the World",
    "description": ("ENIAC filled a room, weighed thirty tonnes and was programmed by six women with a wiring diagram. "
                    "From Babbage and Colossus to the transistor and your phone, told in 3D animation."),
    "tags": ["ENIAC", "first computer", "history of computing", "ENIAC six", "vacuum tube", "transistor", "Alan Turing",
             "Moore's law", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.32, "sentence_silence": 0.28,
              "pronunciations": {"ENIAC": "Ee-nee-ack", "Mauchly": "Mawk-lee", "Presper": "Pres-per", "McNulty": "Mac-Nul-tee",
                                 "Wescoff": "Wes-coff", "Bilas": "Bee-las", "Lichterman": "Lick-ter-man", "Bletchley": "Bletch-lee",
                                 "Neumann": "Noy-man", "Kilby": "Kil-bee"}},
    "music_mood": "hopeful",
    "sources": [
        "https://www.britannica.com/technology/ENIAC",
        "https://www.seas.upenn.edu/about/history-heritage/eniac/",
        "https://eniacprogrammers.org/",
        "https://www.computerhistory.org/revolution/birth-of-the-computer/4/78",
        "https://www.tnmoc.org/colossus",
        "https://www.manchester.ac.uk/discover/history-heritage/history/firsts/baby-computer/",
    ],
}, S.shots)
