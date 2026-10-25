"""Shot list for long-form #15: The Battery That Could Change Electric Cars.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

LABCOAT = {"skin": SKIN, "shirt": [0.88, 0.9, 0.93], "pants": [0.15, 0.15, 0.2], "boots": [0.04, 0.03, 0.02]}
CHEMIST = {"hair": [0.2, 0.15, 0.1], "sleeves": "long", "outfit": LABCOAT}
WHITTINGHAM = {"hair": [0.3, 0.2, 0.12], "sleeves": "long", "outfit": {**LABCOAT, "shirt": [0.55, 0.4, 0.25]}}
GOODENOUGH = {"hair": [0.75, 0.73, 0.7], "sleeves": "long", "outfit": {**LABCOAT, "shirt": [0.2, 0.25, 0.45]}}
YOSHINO = {"hair": [0.05, 0.05, 0.06], "sleeves": "long", "outfit": {**LABCOAT, "shirt": [0.85, 0.87, 0.9]}}
DRIVER = {"hair": [0.3, 0.2, 0.1], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.3, 0.45, 0.7], "pants": [0.2, 0.2, 0.3], "boots": [0.1, 0.08, 0.06]}}
LAB = {"wall": [0.55, 0.6, 0.62], "world": [0.05, 0.05, 0.055]}
DARK = {"horizon": [0.04, 0.1, 0.22], "zenith": [0.0, 0.01, 0.03]}
DESERT = {"sky": {"horizon": [0.95, 0.75, 0.55], "zenith": [0.2, 0.4, 0.8]}, "floor": [0.75, 0.6, 0.45]}
ROAD = {"sky": {"horizon": [0.85, 0.85, 0.9], "zenith": [0.25, 0.45, 0.85]}, "floor": [0.3, 0.5, 0.2]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
CELL = cam((0.9, -4.6, 1.4), (0.6, -4.2, 1.3), (0, 0, 0.55))
CELL_CLOSE = cam((0.5, -3.4, 1.1), (0.35, -3.0, 1.0), (0, 0, 0.55))
CAR = cam((3.2, -3.6, 1.6), (2.6, -3.0, 1.4), (0, 0, 0.5))
BENCH = lambda person, extra=(), pose=WORK: stage("lab", cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15)), cast=[who(person, pose=pose)],
                                                  props=[TABLE] + list(extra), env_opts=LAB)
PORTRAIT = lambda person, extra=(), texts=(): stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(person, pose=STAND)],
                                                    props=list(extra), texts=list(texts), env_opts=LAB)

# ===================================================================== HOOK
S("Inside every electric car is a box weighing around half a tonne. It's the most expensive part of the car, and it decides how far you can drive, how fast you can charge, and how long the car will last.",
  stage("studio", cam((0.8, -3.8, 2.2), (0.5, -3.2, 2.0), (0, 0, 0.2)), props=[P("battery_pack")], env_opts=DARK))
S("That box is full of lithium-ion cells, the same basic technology that's in your phone.",
  stage("studio", cam((0.25, -2.0, 0.8), (0.15, -1.8, 0.75), (0, 0, 0.3)), props=[P("phone", (-0.3, 0, 0.3), args={"glow": 0.4}), P("battery_cell", (0.3, 0, 0.1), scale=0.4)],
        env_opts=DARK), still=True)
S("But there's a new kind of battery that could make electric cars lighter, safer, faster to charge, and able to go much further. It's called the solid-state battery.",
  stage("studio", cam((0, -3.0, 1.0), (0, -2.6, 0.95), (0, 0, 0.8)), props=[P("battery_cell", (0, 0.4, 0.1), args={"solid": True})],
        texts=[T("SOLID-STATE", (0, 0, 1.45), 0.26, (0.4, 0.9, 1.0), pop=0.1)], env_opts=DARK))
S("Car makers are spending billions to build it first. To understand why, we need to go back to the very first battery.",
  stage("street", CAR, props=[P("car", args={"color": (0.15, 0.4, 0.85), "drive": [[0, -2], [1, 2]]}), P("street_lamps", (-1.6, -2, 0), args={"n": 4, "on": [0, 0.01]})]))

# ===================================================================== HISTORY
S("In eighteen hundred, the Italian scientist Alessandro Volta stacked discs of zinc and copper, separated by cloth soaked in salty water. It was the first battery, and it produced a steady electric current.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 1.05)), props=[TABLE, P("voltaic_pile", (0, -0.1, TOP))], env_opts=LAB),
  chapter="How a battery works")
S("Every battery since has worked the same way. There are two electrodes: a negative one, called the anode, and a positive one, called the cathode. Between them is an electrolyte.",
  stage("studio", CELL, props=[P("battery_cell", args={"ions": False, "charge": [0.5, 0.5]})], env_opts=DARK))
S("When you charge the battery, tiny charged atoms, called ions, are pushed through the electrolyte into the anode, where they're stored, like water pumped uphill.",
  stage("studio", CELL_CLOSE, props=[P("battery_cell", args={"charge": [0.05, 0.95]})], env_opts=DARK))
S("When you use it, the ions flow back, and the electrons they leave behind travel the long way round, through the wire, powering your phone, or your car's motor.",
  stage("studio", CELL, props=[P("battery_cell", args={"charge": [0.95, 0.05]}), P("wire", (0, 0, 1.0), scale=0.6), P("bulb", (0, 0, 1.25), scale=0.5)], env_opts=DARK))
S("For over a century, the best rechargeable battery was the lead-acid kind, invented in eighteen fifty nine and still used to start most petrol cars today. It worked, but it was enormously heavy.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 1.0)), props=[TABLE, P("battery", (0, -0.1, TOP), scale=1.6)], env_opts=LAB), still=True)
S("Early electric cars ran on these batteries. In nineteen hundred, about a third of cars in the United States were electric. But they couldn't go far, and petrol won.",
  stage("street", CAR, props=[P("car", args={"color": (0.1, 0.1, 0.1)}), P("street_lamps", (-1.6, -2, 0), args={"n": 4, "on": [0, 0.01]})]), still=True)

# ===================================================================== LITHIUM
S("The answer turned out to be lithium. It's the lightest metal in the universe, so light it floats on water, and it gives up its electrons more eagerly than almost any other element.",
  stage("studio", cam((0.3, -1.2, 0.9), (0.2, -1.0, 0.85), (0, 0, 0.8)), props=[P("molecule", (0, 0, 0.8), scale=0.6)],
        texts=[T("Li", (0, 0, 1.25), 0.3, (0.9, 0.9, 1.0), pop=0.2), T("3", (-0.2, 0, 1.45), 0.1, (0.6, 0.8, 1.0), pop=0.3)], env_opts=DARK),
  chapter="The lithium revolution")
S("In the nineteen seventies, during an oil crisis, a British chemist named Stanley Whittingham, working for the oil company Exxon, built the first rechargeable lithium battery.",
  BENCH(WHITTINGHAM, [P("glassware", (0, -0.1, TOP))]))
S("It had a big problem. Its anode was pure lithium metal, and every time it charged, the lithium grew tiny, needle-like spikes called dendrites.",
  stage("studio", CELL_CLOSE, props=[P("battery_cell", args={"ions": False, "charge": [0.5, 0.5]}), P("dendrite", (-0.3, 0, 0.1), args={"grow": [0.1, 0.9]})], env_opts=DARK))
S("When a dendrite reached the other side, the battery short-circuited, and could catch fire. Some early lithium-metal batteries were recalled after doing exactly that.",
  stage("studio", CELL_CLOSE, props=[P("battery_cell", args={"ions": False, "charge": [0.5, 0.5]}), P("dendrite", (-0.3, 0, 0.1), args={"grow": [0.0, 0.3]})],
        texts=[T("SHORT CIRCUIT", (0, 0, 1.3), 0.13, (1.0, 0.35, 0.2), pop=0.6)], env_opts=DARK))
S("In nineteen eighty, at Oxford, the American physicist John Goodenough found a far better cathode: lithium cobalt oxide. It nearly doubled the battery's voltage, to about four volts.",
  BENCH(GOODENOUGH, [P("glassware", (0, -0.1, TOP))]))
S("Then in nineteen eighty five, in Japan, the chemist Akira Yoshino replaced the dangerous lithium metal anode with carbon. The lithium ions simply slipped in between layers of carbon atoms, with no metal spikes to grow.",
  BENCH(YOSHINO, [P("glassware", (0, -0.1, TOP), args={"seed": 5})]))
S("That was the modern lithium-ion battery. In nineteen ninety one, Sony put it on sale, inside a video camera.",
  stage("studio", cam((0.3, -2.8, 1.0), (0.2, -2.5, 0.95), (0, 0, 0.55)), props=[P("battery_cell", (0, 0, 0.1), scale=0.6)],
        texts=[T("1991", (0, 0.2, 1.0), 0.3, pop=0.2)], env_opts=DARK), still=True)
S("It changed everything. Mobile phones, laptops, and eventually, cars.",
  stage("studio", cam((0.3, -1.4, 0.9), (0.2, -1.2, 0.85), (0, 0, 0.4)), props=[P("phone", (-0.5, 0, 0.3), args={"glow": 0.4}), P("laptop", (0.1, 0, 0.2), scale=0.8)],
        env_opts=DARK), still=True)
S("In twenty nineteen, Whittingham, Goodenough and Yoshino shared the Nobel Prize in Chemistry. Goodenough was ninety seven, the oldest person ever to win a Nobel Prize. He kept working into his late nineties, and died at the age of one hundred.",
  PORTRAIT(GOODENOUGH, [P("medal", (0.55, 0.0, 1.4), spin=["z", 40])], [T("NOBEL PRIZE 2019", (0.4, -0.2, 1.9), 0.075, pop=0.2)]), still=True)

# ===================================================================== EV ERA
S("In two thousand and eight, a small company called Tesla built a sports car powered by six thousand eight hundred and thirty one laptop batteries, wired together.",
  stage("studio", cam((0.8, -3.8, 2.2), (0.5, -3.2, 2.0), (0, 0, 0.2)), props=[P("battery_pack", args={"rows": 5, "cols": 11})], env_opts=DARK),
  chapter="The electric car era")
S("Since twenty ten, the price of lithium-ion batteries has fallen by about ninety percent. In twenty twenty four, more than seventeen million electric cars were sold around the world, more than one in five new cars.",
  stage("street", CAR, props=[P("car", args={"color": (0.9, 0.9, 0.92), "drive": [[0, -2], [1, 2]]}), P("charger", (-1.2, 0.4, 0))]))
S("But today's batteries are reaching their limits. A big share of a battery pack's weight is material that doesn't store energy at all: the casing, the wiring, the cooling, and the liquid electrolyte.",
  stage("studio", cam((0.8, -3.8, 2.2), (0.5, -3.2, 2.0), (0, 0, 0.2)), props=[P("battery_pack")], env_opts=DARK), still=True)
S("That liquid is also flammable. If a cell is damaged, or overheats, it can set off a chain reaction called thermal runaway, and that fire is very hard to put out.",
  stage("studio", CELL_CLOSE, props=[P("battery_cell", args={"ions": False, "charge": [0.5, 0.5]})], texts=[T("THERMAL RUNAWAY", (0, 0, 1.3), 0.13, (1.0, 0.4, 0.15), pop=0.4)],
        env_opts={"horizon": [0.4, 0.08, 0.02], "zenith": [0.02, 0.0, 0.0]}))
S("And charging is still slow. Push the ions in too quickly, and lithium starts plating onto the anode as metal, the same spiky dendrites that haunted the first lithium batteries.",
  stage("studio", CELL_CLOSE, props=[P("battery_cell", args={"charge": [0.1, 0.9]}), P("dendrite", (-0.3, 0, 0.1), args={"grow": [0.5, 0.9], "seed": 8})], env_opts=DARK))
S("So drivers worry about range, and about waiting at chargers. Engineers wanted a battery that was smaller, safer, and could fill up in minutes.",
  stage("sky", cam((0, -3.0, 1.4), (0.3, -2.6, 1.3), (0, 0, 1.0)), cast=[who(DRIVER, at=(-0.6, 0.35, 0), pose=STAND)],
        props=[P("charger", (0.5, 0.4, 0))], env_opts=ROAD), still=True)

# ===================================================================== SOLID STATE
S("The idea behind the solid-state battery is simple. Replace the liquid electrolyte with a thin layer of solid material, a special ceramic, glass, or crystal that lets lithium ions pass straight through it.",
  stage("studio", CELL, props=[P("battery_cell", args={"solid": True})], env_opts=DARK), chapter="Going solid")
S("A solid can't leak, and most of these materials don't burn. So the battery needs far less heavy protection around it.",
  stage("studio", CELL_CLOSE, props=[P("battery_cell", args={"solid": True, "ions": False})], texts=[T("NO LIQUID", (0, 0, 1.3), 0.13, (0.4, 0.9, 1.0), pop=0.3)], env_opts=DARK),
  still=True)
S("But the real prize is what a solid electrolyte might allow next. If it's strong enough to block dendrites, engineers can finally go back to Whittingham's dream: an anode made of pure lithium metal.",
  stage("studio", CELL_CLOSE, props=[P("battery_cell", args={"solid": True, "charge": [0.1, 0.9]})], env_opts=DARK))
S("Lithium metal can hold around ten times more charge than the same weight of graphite. Some designs go even further, and start with no anode at all. The lithium builds it up the first time the battery charges.",
  stage("studio", cam((0.3, -4.0, 1.3), (0.2, -3.6, 1.2), (0, 0, 0.5)), props=[P("battery_cell", (-0.75, 0, 0.1), scale=0.6), P("battery_cell", (0.75, 0, 0.1), scale=0.6, args={"solid": True})],
        texts=[T("10x", (0.75, 0, 0.95), 0.18, (0.4, 0.9, 1.0), pop=0.5)], env_opts=DARK))
S("The result could be a battery that stores perhaps fifty percent more energy in the same space. That could mean a car that goes much further, or the same range from a smaller, lighter, cheaper pack.",
  stage("sky", CAR, props=[P("car", args={"color": (0.15, 0.4, 0.85), "drive": [[0, -2.5], [1, 2.5]]})], env_opts=ROAD))
S("And because the ions don't have to dodge through a liquid, some solid-state cells could charge from ten to eighty percent in around ten minutes.",
  stage("sky", cam((0, -3.0, 1.4), (0.3, -2.6, 1.3), (0, 0, 1.0)), cast=[who(DRIVER, at=(-0.7, 0.35, 0), pose=STAND)],
        props=[P("charger", (0.5, 0.4, 0))], texts=[T("10 MIN", (0.5, 0.4, 1.9), 0.18, (0.3, 1.0, 0.5), pop=0.3)], env_opts=ROAD))

# ===================================================================== PROBLEMS
S("So why isn't every car already using one? Because building a solid-state battery turned out to be extraordinarily hard.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(CHEMIST, pose=STAND)], env_opts=LAB), still=True, chapter="Why it's so hard")
S("A liquid touches every surface it's poured onto. Two solids pressed together only touch at tiny points, like two bricks. Ions struggle to cross those gaps.",
  stage("studio", CELL_CLOSE, props=[P("battery_cell", args={"solid": True, "ions": False})], env_opts=DARK))
S("Every time a battery charges, its electrodes swell and shrink. A liquid flows to fill the space. A solid cracks.",
  stage("studio", CELL, props=[P("battery_cell", args={"solid": True, "charge": [0.1, 0.9]})], env_opts=DARK))
S("And to the surprise of many scientists, dendrites can still grow, worming through tiny cracks and the boundaries between crystals, even in hard ceramic.",
  stage("studio", CELL_CLOSE, props=[P("battery_cell", args={"solid": True, "ions": False}), P("dendrite", (-0.3, 0, 0.1), args={"grow": [0.1, 0.9], "seed": 3})], env_opts=DARK))
S("Some of the best solid electrolytes are made with sulfur. They let ions move almost as fast as a liquid, but if they meet moisture in the air, they can give off toxic hydrogen sulfide gas. So factories have to be bone dry.",
  BENCH(CHEMIST, [P("glassware", (0, -0.1, TOP), args={"seed": 7})]), still=True)
S("Making a cell in a lab is one thing. Making millions of them, cheaply, with no defects, is another.",
  stage("lab", cam((1.5, -3.6, 1.8), (1.2, -3.2, 1.7), (0.6, 0, 0.6), lens=30), props=[P("battery_pack", (0.6, 0.6, 0)), P("crates", (-1.2, 0.8, 0), args={"label": "CELLS", "n": 6})],
        env_opts=LAB), still=True)

# ===================================================================== RACE
S("Even so, the race is on. Toyota holds more solid-state battery patents than any other company, and says it plans to put them in cars by around twenty twenty seven or twenty twenty eight.",
  stage("street", CAR, props=[P("car", args={"color": (0.85, 0.15, 0.15), "drive": [[0, -2], [1, 2]]})]), chapter="The race")
S("In California, QuantumScape, backed by Volkswagen, has been building a ceramic separator thinner than a sheet of paper, with cells that start with no anode at all.",
  BENCH(CHEMIST, [P("battery_cell", (0, -0.1, TOP), scale=0.25, args={"solid": True})]))
S("In twenty twenty five, Mercedes-Benz drove a test car with solid-state cells from Stuttgart to Malmö, in Sweden, more than twelve hundred kilometres, on a single charge.",
  stage("street", CAR, props=[P("car", args={"color": (0.75, 0.77, 0.8), "drive": [[0, -2], [1, 2]]}), P("street_lamps", (-1.6, -2, 0), args={"n": 4, "on": [0, 0.01]})]))
S("In China, the car maker NIO already sells cars with semi-solid batteries, a halfway step, with some liquid still inside. In twenty twenty three, NIO's founder drove one of his cars more than a thousand kilometres on a single charge, live on the internet.",
  stage("sky", CAR, props=[P("car", args={"color": (0.9, 0.9, 0.92), "drive": [[0, -2.5], [1, 2.5]]})], env_opts=ROAD))
S("And it isn't only about range. Every lithium battery needs lithium, much of it mined in Australia, or pumped as salty water from beneath the deserts of Chile and Argentina, and left to evaporate in giant ponds for many months.",
  stage("sky", cam((0, -9, 6), (2, -8, 5.5), (0, 0, 0)), props=[P("brine_ponds")], env_opts=DESERT), still=True)
S("A lithium-metal anode uses more lithium per cell, so other researchers are racing the other way, with sodium-ion batteries, made from the same element as table salt. They store less, but they're cheap.",
  stage("studio", cam((0.3, -2.8, 1.0), (0.2, -2.5, 0.95), (0, 0, 0.55)), props=[P("battery_cell", (0, 0, 0.1), scale=0.6)],
        texts=[T("Na", (0, 0, 1.0), 0.3, (1.0, 0.8, 0.3), pop=0.2)], env_opts=DARK), still=True)
S("The likely future isn't one perfect battery, but several: cheap ones for city cars, and solid-state ones for cars, trucks, and maybe even planes, that need to go much further.",
  stage("street", CAR, props=[P("car", (-1.4, 0, 0), args={"color": (0.95, 0.75, 0.2)}), P("car", (1.4, 0, 0), args={"color": (0.15, 0.4, 0.85)}),
                              P("street_lamps", (-1.6, -2, 0), args={"n": 4, "on": [0, 0.01]})]), still=True)

# ===================================================================== CLOSE
S("Two hundred years ago, Volta's pile could barely make a spark. Today, batteries can carry a family across a continent.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 1.05)), props=[TABLE, P("voltaic_pile", (0, -0.1, TOP))], env_opts=LAB), chapter="Close")
S("The solid-state battery isn't finished yet. But if engineers crack it, the most important part of the electric car could be a thin layer of solid, thinner than a sheet of paper, that finally keeps lithium in its place.",
  stage("studio", cam((0.3, -2.7, 0.9), (0.7, -4.2, 1.3), (0, 0, 0.5), (0, 0, 0.55)), props=[P("battery_cell", args={"solid": True})], env_opts=DARK), hold=1.5)

write(HERE, {
    "slug": "15-ev-battery",
    "title": "The Battery That Could Change Electric Cars",
    "description": ("From Volta's pile to the Nobel-winning lithium-ion cell and the race to build solid-state batteries: "
                    "why a thin layer of solid could make electric cars lighter, safer and faster to charge, told in 3D animation."),
    "tags": ["solid-state battery", "lithium-ion", "electric cars", "EV battery", "John Goodenough", "QuantumScape", "Toyota", "battery technology", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.32, "sentence_silence": 0.28,
              "pronunciations": {"Whittingham": "Whit-ing-um", "Yoshino": "Yo-shee-no", "Volta": "Vol-ta", "QuantumScape": "Quantum Scape",
                                 "Malmö": "Mal-mer", "NIO": "Nee-oh", "Goodenough": "Good-enuff"}},
    "music_mood": "hopeful",
    "sources": [
        "https://www.nobelprize.org/prizes/chemistry/2019/summary/",
        "https://www.iea.org/reports/global-ev-outlook-2025",
        "https://about.bnef.com/",
        "https://www.energy.gov/eere/vehicles/",
        "https://global.toyota/en/",
        "https://www.quantumscape.com/",
        "https://group.mercedes-benz.com/",
    ],
}, S.shots)
