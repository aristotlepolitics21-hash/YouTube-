"""Shot list for long-form #6: The Invention That Gave the World Electricity (alternating current and the grid)."""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

SUIT = {"skin": SKIN, "shirt": [0.1, 0.1, 0.12], "pants": [0.1, 0.1, 0.12], "boots": [0.04, 0.03, 0.02]}
EDISON = {"hair": [0.55, 0.52, 0.5], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.2, 0.18, 0.15], "pants": [0.2, 0.18, 0.15]}}
TESLA = {"hair": [0.04, 0.03, 0.03], "sleeves": "long", "outfit": SUIT}
WESTINGHOUSE = {"hair": [0.6, 0.6, 0.62], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.15, 0.17, 0.25], "pants": [0.15, 0.17, 0.25]}}
WORKER = {"hair": [0.3, 0.2, 0.1], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.35, 0.3, 0.25], "pants": [0.15, 0.15, 0.2], "boots": [0.06, 0.04, 0.03]}}
SKY = {"sky": {"horizon": [0.75, 0.82, 0.95], "zenith": [0.15, 0.35, 0.8], "strength": 1.0}, "floor": [0.25, 0.5, 0.15]}
WINTER = {"sky": {"horizon": [0.7, 0.75, 0.85], "zenith": [0.3, 0.4, 0.6]}, "floor": [0.85, 0.87, 0.9]}
LAB = {"wall": [0.3, 0.27, 0.22], "world": [0.03, 0.03, 0.025]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
BENCH = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))

# ===================================================================== HOOK
S("Look out of any window at night, and you'll see the result of a battle fought more than a hundred years ago.",
  stage("night", cam((0, -1.2, 1.4), (0, -7.5, 3.0), (0, 0, 1.0), (0, 4, 1.2), 50, 28), props=[P("houses", (0, 1.5, 0), args={"on": [0.1, 0.6]}),
                                                                                             P("city", (0, 6, 0), args={"on": 0.3})]))
S("It was a fight over how electricity should travel, from the power station to your home.",
  stage("sky", cam((6, -4, 2.5), (5, -2, 2.6), (0, 5, 2.5)), props=[P("pylons", args={"current": [0.1, 0.3]})], env_opts=SKY))
S("On one side was the most famous inventor in the world, Thomas Edison. On the other, a brilliant immigrant engineer named Nikola Tesla, and the businessman George Westinghouse.",
  stage("studio", cam((0, -3.2, 1.6), (0, -2.8, 1.55), (0, 0.3, 1.2)),
        cast=[who(EDISON, at=(-0.8, 0.3, 0), turn=-15), who(TESLA, at=(0.4, 0.3, 0), turn=10), who(WESTINGHOUSE, at=(1.1, 0.5, 0), turn=20)],
        texts=[T("DC", (-0.8, 0.3, 2.15), 0.25, (0.4, 0.85, 1.0), pop=0.15), T("AC", (0.75, 0.4, 2.15), 0.25, (1.0, 0.5, 0.2), pop=0.4)]), still=True)
S("The winner shaped the electrical grid that powers almost the entire world today.",
  stage("studio", cam((0, -3.0, 1.2), (0, -2.6, 1.15), (0, 0, 1.1)),
        texts=[T("THE WAR OF THE CURRENTS", (0, 0, 1.3), 0.22, pop=0.08)],
        props=[P("waveform", (0, 0.4, 0.75), args={"kind": "ac", "draw": [0.1, 0.6]})]))

# ===================================================================== EDISON & DC
S("In eighteen seventy nine, Edison's lab in Menlo Park, New Jersey, produced a practical electric light bulb that could glow for hours.",
  stage("lab", BENCH, cast=[who(EDISON, pose=WORK)], props=[TABLE, P("bulb", (0, -0.1, TOP + 0.02), args={"on": 0.3}), P("glassware", (-0.5, -0.1, TOP), args={"n": 3})],
        env_opts=LAB), chapter="Edison's light")
S("His team tested thousands of materials for the glowing filament, from cotton thread to fishing line, before settling on carbonised bamboo, which could last for well over a thousand hours.",
  stage("studio", cam((0.25, -0.75, 0.35), (0.18, -0.65, 0.32), (0, 0, 0.12)), props=[P("bulb", (0, 0, 0.02), args={"on": 0.4}), P("books", (0.4, 0.2, 0), args={"n": 4})]))
S("Edison would eventually hold more than a thousand American patents. Newspapers called him the Wizard of Menlo Park.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "THE WIZARD OF MENLO PARK", "n": 3})],
        texts=[T("1,093 PATENTS", (0, 0.3, 0.42), 0.1, pop=0.3)]), still=True, still_at=0.7)
S("But a light bulb is useless without electricity to run it. So Edison designed a whole system: generators, cables, switches, fuses and meters.",
  stage("studio", cam((0, -2.6, 1.2), (0.3, -2.2, 1.1), (0, 0, 0.5)),
        props=[P("bulb", (-0.9, 0, 0.1), args={"on": 0.05}), P("wall_switch", (-0.3, 0, 0.5), args={"flip": 0.2}), P("meter", (0.3, 0, 0.15), args={"needle": [[0, 0], [0.3, 30]]}),
               P("faraday_disk", (0.9, 0, 0), scale=0.8, args={"spin": [0, 1], "glow": [0, 1]})]), still=True)
S("On the fourth of September, eighteen eighty two, his Pearl Street power station in Manhattan switched on, lighting buildings across a few city blocks.",
  stage("night", cam((0, -5.5, 2.0), (0.6, -4.8, 1.8), (0, 2, 1.2), lens=30), props=[P("generator_hall", (0, -0.5, 0), scale=0.3), P("city", (0, 3, 0), args={"count": 70, "on": 0.3})],
        texts=[T("PEARL STREET  1882", (0, 0.5, 1.2), 0.2, pop=0.1)]))
S("Its huge steam-driven generators were nicknamed Jumbos, after a famous circus elephant. Each one weighed about twenty seven tons.",
  stage("night", cam((0, -5.5, 2.0), (0.6, -4.8, 1.8), (0, 2, 1.2), lens=30), props=[P("generator_hall", (0, -0.5, 0), scale=0.3), P("city", (0, 3, 0), args={"count": 70, "on": 0.3})],
        texts=[T("PEARL STREET  1882", (0, 0.5, 1.2), 0.2, pop=0.1)]), still=True)
S("At first, it supplied about four hundred lamps, for around eighty customers. Within two years, it was lighting more than ten thousand.",
  stage("night", cam((0, -6.5, 2.4), (0.5, -5.5, 2.2), (0, 3, 1.4), lens=30), props=[P("city", (0, 3, 0), args={"count": 110, "on": 0.15})],
        texts=[T("400 → 10,000 LAMPS", (0, 0, 2.8), 0.22, pop=0.4)]))
S("Edison's system used direct current, or DC. The electricity flows steadily in one direction, like water through a pipe.",
  stage("studio", cam((0, -2.6, 0.7), (0, -2.3, 0.65), (0, 0, 0.55)), props=[P("waveform", (0, 0, 0.55), args={"kind": "dc"})]))
S("But DC had a serious problem. Sent through long wires, much of the power was lost as heat.",
  stage("sky", cam((6, -4, 2.5), (5, -2, 2.6), (0, 5, 2.5)), props=[P("pylons", args={"n": 3})], texts=[T("HEAT", (0, 4, 4.2), 0.3, (1.0, 0.35, 0.2), pop=0.3)],
        env_opts=SKY), still=True)
S("At the low voltages Edison used, a power station could only serve customers within about a mile. A city would need a power station in nearly every neighbourhood.",
  stage("night", cam((0, -7, 4.0), (0.5, -6.4, 3.6), (0, 2, 0.5), lens=28),
        props=[P("houses", (0, 0, 0), args={"on": [0, 0.01]}), P("houses", (0, 3, 0), args={"on": [0.5, 0.51]}), P("generator_hall", (-6, 1.5, 0), scale=0.25, args={"n": 1})]),
  still=True)

# ===================================================================== TESLA
S("Nikola Tesla was born in eighteen fifty six, in what is now Croatia, to a Serbian family.",
  stage("sky", cam((0, -3.0, 1.5), (0.3, -2.6, 1.4), (0, 0, 1.0)), cast=[who(TESLA, pose=STAND, scale=0.8)],
        texts=[T("1856", (0.9, 0.5, 1.6), 0.3, pop=0.2)], env_opts={"sky": {"horizon": [1.0, 0.6, 0.3], "zenith": [0.2, 0.45, 0.85]}, "floor": [0.3, 0.45, 0.2]}), still=True,
  chapter="Tesla's idea")
S("He had a remarkable memory, and said he could design and test machines entirely in his imagination.",
  stage("lab", cam((0.5, -1.8, 1.6), (0.35, -1.5, 1.6), "cast0.head"), cast=[who(TESLA, pose=LOOK_UP)],
        props=[P("induction_motor", (0.8, 0, 1.3), scale=0.5)], env_opts={"wall": [0.08, 0.08, 0.12], "world": [0.01, 0.01, 0.02]}), still=True)
S("As a student, he became obsessed with an idea: a motor that ran on alternating current, AC, where the electricity rapidly switches direction back and forth.",
  stage("studio", cam((0, -2.6, 0.7), (0, -2.3, 0.65), (0, 0, 0.55)), props=[P("waveform", (0, 0, 0.55), args={"kind": "ac"})]))
S("In eighteen eighty four, he arrived in New York with almost nothing, and went to work for Edison.",
  stage("studio", cam((0, -2.6, 2.0), (0.4, -2.0, 1.6), (0, 0, 0.3)), props=[P("route", (0, 0, 0.05), args={"stops": ["PARIS", "NEW YORK"]})]))
S("According to Tesla, Edison promised him fifty thousand dollars if he could improve the company's dynamos. When he did, Edison told him: you don't understand our American humour.",
  stage("lab", cam((0, -2.6, 1.6), (0.2, -2.2, 1.5), (0, 0.3, 1.25)),
        cast=[who(EDISON, at=(-0.5, 0.35, 0), turn=-25, pose=PRESENT), who(TESLA, at=(0.5, 0.35, 0), turn=25, pose=STAND)],
        props=[P("faraday_disk", (0, -0.4, 0), scale=0.9, args={"spin": [0, 1], "glow": [0, 1]})],
        texts=[T("$50,000?", (0, 0.5, 2.15), 0.18, pop=0.5)], env_opts=LAB), still=True)
S("But the two men were opposites. Edison was a tireless tinkerer, who tested thousands of ideas by trial and error. Tesla was a theorist. They soon fell out, and Tesla quit.",
  stage("lab", cam((0, -2.6, 1.6), (0.2, -2.2, 1.5), (0, 0.3, 1.25)),
        cast=[who(EDISON, at=(-0.5, 0.35, 0), turn=-25, pose=PRESENT), who(TESLA, at=(0.5, 0.35, 0), turn=25, pose=STAND)], env_opts=LAB), still=True)
S("For a while, he even dug ditches to survive.",
  stage("sky", cam((0.5, -1.8, 1.4), (0.35, -1.5, 1.35), "cast0.head"), cast=[who(TESLA, pose=WORK)], env_opts={**WINTER, "floor": [0.35, 0.28, 0.2]}), still=True)
S("Then, in eighteen eighty eight, he patented his AC induction motor.",
  stage("studio", cam((0.6, -1.6, 0.8), (0.4, -1.3, 0.7), (0, 0, 0.5)), props=[P("induction_motor", args={"spin": [0.15, 1.0], "turns": 3})],
        texts=[T("1888", (-0.8, 0.3, 1.0), 0.2, pop=0.1)]))
S("That May, he demonstrated it in a famous lecture to the American Institute of Electrical Engineers.",
  stage("hall", cam((0, -4.6, 2.7), (0.3, -4.0, 2.4), (0, 1.2, 1.2), lens=30), cast=[who(TESLA, at=(0, 1.4, 0), pose=PRESENT)],
        props=[P("table", (0, 0.9, 0)), P("induction_motor", (0.3, 0.9, TOP), scale=0.4, args={"spin": [0.1, 1]}), P("audience", (0, 1.2, 0), rot=[0, 0, 180])]))
S("Instead of brushes and sparking contacts, it used coils that create a magnetic field which spins around. The rotor is simply dragged around by it.",
  stage("studio", cam((0.25, -1.2, 0.55), (0.15, -1.0, 0.5), (0, 0, 0.5)), props=[P("induction_motor", args={"spin": [0.05, 1.0], "turns": 4})]))
S("It was simple, tough and efficient. Versions of it still run most of the world's fans, pumps, factory machines and many electric cars.",
  stage("studio", cam((1.2, -2.6, 1.4), (0.8, -2.0, 1.1), (0, 0, 0.6)), props=[P("induction_motor", (-0.5, 0, 0), args={"spin": [0, 1]}), P("turbine", (1.0, 1.2, 0), scale=0.4)]))

# ===================================================================== TRANSFORMER
S("The real advantage of AC was something else: the transformer.",
  stage("studio", cam((0.6, -1.6, 0.8), (0.4, -1.3, 0.7), (0, 0, 0.35)), props=[P("transformer")]), still=True, chapter="The transformer")
S("A transformer is two coils of wire wrapped around an iron core. Thanks to Faraday's induction, the changing current in one coil creates current in the other.",
  stage("studio", cam((0.5, -1.4, 0.7), (0.3, -1.2, 0.6), (0, 0, 0.35)), props=[P("transformer", args={"glow": [0.2, 0.6]})]))
S("Give the second coil more turns, and the voltage goes up. Give it fewer, and the voltage goes down. It only works with alternating current.",
  stage("studio", cam((0.3, -1.4, 0.7), (0.1, -1.2, 0.6), (0, 0, 0.35)), props=[P("transformer", args={"glow": [0.1, 0.5]})]))
S("Here's why that matters. The power lost as heat in a wire depends on the current. Raise the voltage a hundred times, and the current falls a hundred times, for the same power.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.1, 0.95), (0, 0, 0.8)), texts=[T("VOLTAGE ×100", (0, 0, 1.15), 0.16, (1.0, 0.5, 0.3), pop=0.2),
        T("CURRENT ÷100", (0, 0, 0.82), 0.16, (0.4, 0.85, 1.0), pop=0.5)]), still=True, still_at=0.8)
S("And because heat losses depend on the current squared, the losses drop ten thousand times.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.1, 0.95), (0, 0, 0.8)), texts=[T("LOSSES ÷10,000", (0, 0, 1.0), 0.2, (0.4, 1.0, 0.6), pop=0.15)]),
  still=True, still_at=0.8)
S("So with AC, you can step the voltage up, send power hundreds of kilometres along thin wires, and step it down again near homes.",
  stage("sky", cam((8, -3, 3.0), (6, 2, 3.2), (0, 6, 2.2)), props=[P("pylons", args={"n": 5, "current": [0.05, 0.2]}), P("transformer", (0, -1.2, 0), scale=1.5),
                                                                  P("houses", (0, 19, 0), scale=0.8)], env_opts=SKY))
S("In the mid eighteen eighties, engineers in Hungary, Britain and the United States developed practical transformers. In eighteen eighty six, William Stanley lit up the main street of Great Barrington, Massachusetts, with alternating current.",
  stage("night", cam((1.6, -2.5, 1.9), (1.0, -1.5, 1.8), (0, 4, 1.6), lens=28), props=[P("street_lamps", args={"n": 7, "on": [0.15, 0.8]})],
        texts=[T("1886", (-1.5, 3, 2.5), 0.3, pop=0.1)]))

# ===================================================================== THE WAR
S("George Westinghouse, an inventor and industrialist who had made a fortune from railway air brakes, saw the future. He bought Tesla's patents, and hired him.",
  stage("lab", cam((0, -2.6, 1.6), (0.2, -2.2, 1.5), (0, 0.3, 1.25)),
        cast=[who(WESTINGHOUSE, at=(-0.45, 0.35, 0), turn=-12, pose=PRESENT), who(TESLA, at=(0.45, 0.35, 0), turn=12)],
        props=[TABLE, P("induction_motor", (0, -0.1, TOP), scale=0.3)], env_opts=LAB), still=True, chapter="The war of the currents")
S("Tesla reportedly received about sixty thousand dollars in cash and stock, plus a royalty for every horsepower of AC equipment sold.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("$60,000", (0, 0, 1.1), 0.25, (0.4, 1.0, 0.6), pop=0.1),
        T("+ ROYALTIES", (0, 0, 0.8), 0.14, (1, 1, 1), pop=0.4)]), still=True, still_at=0.8)
S("Edison had invested everything in DC. He began a campaign to convince the public that AC's high voltages were deadly.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "THE DEADLY ALTERNATING CURRENT", "n": 3})]),
  still=True, still_at=0.7)
S("His allies staged gruesome public demonstrations, killing animals with AC to frighten people.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.6)), props=[P("tesla_coil", (0, 0.3, 0), scale=0.6, args={"sparks": [0.3, 0.5, 0.7]})],
        env_opts={"horizon": [0.3, 0.05, 0.05]}))
S("And when New York State introduced the electric chair for executions, it used an AC generator, partly to tie Westinghouse's name to death.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("1890", (0, 0, 1.0), 0.3, (0.8, 0.8, 0.8), pop=0.1)],
        env_opts={"horizon": [0.06, 0.06, 0.06], "zenith": [0.0, 0.0, 0.0]}), still=True)
S("The first execution, of a man named William Kemmler in eighteen ninety, was horribly botched. Westinghouse remarked that they would have done better using an axe.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("1890", (0, 0, 1.0), 0.3, (0.8, 0.8, 0.8), pop=0.1)],
        env_opts={"horizon": [0.06, 0.06, 0.06], "zenith": [0.0, 0.0, 0.0]}), still=True)
S("But it was true that high voltage needed respect. Overhead wires in cities were a tangled, dangerous mess, and people were killed by fallen lines.",
  stage("night", cam((0, -4.5, 2.4), (0.3, -4.0, 2.2), (0, 2, 2.0)), props=[P("pylons", (0, -2, 0), args={"n": 3, "spacing": 2.5, "height": 3.0}), P("city", (0, 4, 0), args={"count": 60})]),
  still=True)

# ===================================================================== WORLD'S FAIR & NIAGARA
S("Meanwhile, AC kept proving itself. In eighteen ninety one, a mine in Telluride, Colorado, began running on AC power from a hydroelectric plant several kilometres away.",
  stage("sky", cam((4, -8, 3.0), (3, -7, 2.8), (0, 3, 1.5), lens=30), props=[P("pylons", args={"n": 4}), P("generator_hall", (0, 14, 0), scale=0.3, args={"n": 1})],
        env_opts={"sky": SKY["sky"], "floor": [0.45, 0.42, 0.38]}), still=True)
S("That same year in Germany, engineers sent three-phase AC a hundred and seventy five kilometres, from Lauffen to Frankfurt.",
  stage("studio", cam((0, -2.6, 2.0), (0.4, -2.0, 1.6), (0, 0, 0.3)), props=[P("route", (0, 0, 0.05), args={"stops": ["LAUFFEN", "FRANKFURT"]})],
        texts=[T("175 km", (0, 0.5, 0.9), 0.15, pop=0.5)]))
S("The turning point came in eighteen ninety three. Westinghouse won the contract to light the World's Columbian Exposition in Chicago, underbidding its rival, General Electric.",
  stage("night", cam((0, -9, 3.0), (0.6, -8.0, 2.8), (0, 3, 1.5), lens=28), props=[P("city", (0, 3, 0), args={"count": 90, "on": 0.2}), P("tesla_coil", (0, -2, 0), scale=0.6)],
        texts=[T("CHICAGO 1893", (0, -1, 3.2), 0.3, pop=0.15)]), chapter="The White City and Niagara Falls")
S("Visitors saw a glittering White City, lit by tens of thousands of electric lamps, all running on alternating current. Tesla's machines were among the stars of the show.",
  stage("night", cam((-3, -8, 2.0), (3, -7.5, 2.4), (0, 3, 1.5), lens=28), props=[P("street_lamps", (-3, -3, 0), rot=[0, 0, -90], args={"n": 8, "on": [0, 0.3]}),
                                                                             P("city", (0, 3, 0), args={"count": 90})]))
S("That same year, Westinghouse won the biggest prize of all: a contract to harness Niagara Falls.",
  stage("sky", cam((3, -10, 3.0), (2, -8.5, 2.6), (0, 0, 1.5), lens=30), props=[P("waterfall", args={"width": 8.0, "height": 3.5})], env_opts=SKY))
S("The falling water spun huge turbines, and Tesla-designed AC generators turned that motion into electricity.",
  stage("lab", cam((-2.0, -3.5, 1.8), (1.0, -3.2, 1.6), (0, 1, 0.8), lens=26), props=[P("generator_hall", (0, 1.0, 0), scale=0.8)],
        env_opts={"wall": [0.4, 0.38, 0.33], "world": [0.05, 0.05, 0.05]}))
S("The first three generators each produced five thousand horsepower, the most powerful in the world at the time.",
  stage("lab", cam((-2.0, -3.5, 1.8), (1.0, -3.2, 1.6), (0, 1, 0.8), lens=26), props=[P("generator_hall", (0, 1.0, 0), scale=0.8)],
        env_opts={"wall": [0.4, 0.38, 0.33], "world": [0.05, 0.05, 0.05]}), still=True)
S("On the sixteenth of November, eighteen ninety six, power from Niagara was switched on in Buffalo, about forty kilometres away.",
  stage("sky", cam((8, -3, 3.0), (6, 3, 3.2), (0, 8, 2.2)), props=[P("pylons", args={"n": 5, "current": [0.1, 0.25]}), P("houses", (0, 19, 0), scale=0.8, args={"on": [0.5, 0.9]})],
        texts=[T("NIAGARA → BUFFALO", (0, 6, 5.0), 0.3, pop=0.3)], env_opts=WINTER))
S("Streetcars ran and factories hummed on electricity generated by a waterfall, miles away. The war of the currents was effectively over. AC had won.",
  stage("night", cam((0, -6.5, 2.4), (0.5, -5.5, 2.2), (0, 3, 1.4), lens=30), props=[P("city", (0, 3, 0), args={"on": 0.1}), P("houses", (0, -0.5, 0), args={"on": [0.1, 0.5]})]))

# ===================================================================== AFTERMATH
S("Edison's company merged with others to form General Electric, which soon embraced AC too.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(EDISON, pose={**STAND, "head_nod": 12})], env_opts=LAB), still=True,
  chapter="What happened next")
S("Westinghouse's company struggled with debts. Tesla famously tore up a contract that would have paid him royalties on every AC motor sold, to help keep the firm afloat. That story is often told, though historians debate the details.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.95)), props=[TABLE, P("newspapers", (0, -0.1, TOP), args={"headline": "CONTRACT", "n": 1}),
        P("candle", (0.4, 0, TOP))], env_opts=LAB), still=True)
S("Tesla went on to experiment with radio, wireless power and giant coils that threw lightning across his lab. But he died poor and alone in a New York hotel room in nineteen forty three.",
  stage("lab", cam((1.5, -3, 1.4), (1.2, -2.6, 1.3), (0, 0, 1.0)), cast=[who(TESLA, at=(-1.2, 0.3, 0), turn=-20)],
        props=[P("tesla_coil", (0.4, 0.5, 0), args={"sparks": [0.2, 0.35, 0.5, 0.65, 0.8]})], env_opts={"wall": [0.05, 0.05, 0.08], "world": [0.01, 0.01, 0.015]}))
S("Today, the unit of magnetic field strength, the tesla, carries his name.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.0, 1.0), (0, 0, 1.0)), texts=[T("1 TESLA", (0, 0, 1.0), 0.35, pop=0.1)]), still=True, still_at=0.8)

# ===================================================================== THE GRID TODAY
S("Today, almost every power grid on Earth runs on alternating current, switching direction fifty or sixty times every second.",
  stage("space", cam((0, -3.4, 0.6), (0.3, -3.0, 0.5), (0, 0, 0)), texts=[T("50 Hz  /  60 Hz", (0, -0.6, 0.55), 0.2, (1.0, 0.6, 0.2), pop=0.3)]), still=True,
  chapter="The grid today")
S("Westinghouse's engineers picked sixty cycles a second for America. Much of the rest of the world settled on fifty. That's why some appliances don't work when you travel.",
  stage("studio", cam((0, -2.6, 0.7), (0, -2.3, 0.65), (0, 0, 0.55)), props=[P("waveform", (0, 0, 0.55), args={"kind": "ac"})],
        texts=[T("60 Hz  vs  50 Hz", (0, 0, 1.0), 0.14, pop=0.4)]))
S("Giant transformers step the voltage up to hundreds of thousands of volts for long journeys across the country, then step it down to the voltage in your sockets.",
  stage("sky", cam((8, -3, 3.0), (6, 2, 3.2), (0, 6, 2.2)), props=[P("pylons", args={"n": 5, "current": [0.05, 0.2]}), P("transformer", (0, -1.2, 0), scale=1.5)],
        env_opts=SKY))
S("In a twist Edison might have enjoyed, very long distance links now often use direct current again, at extremely high voltages, thanks to modern electronics.",
  stage("studio", cam((0, -2.6, 0.9), (0, -2.3, 0.85), (0, 0, 0.6)), props=[P("waveform", (0, 0, 0.85), args={"kind": "ac"}), P("waveform", (0, 0, 0.3), args={"kind": "dc"})]))
S("But the basic system, generators, transformers and alternating current, is the one Tesla and Westinghouse fought for.",
  stage("lab", cam((-2.0, -3.5, 1.8), (1.0, -3.2, 1.6), (0, 1, 0.8), lens=26), props=[P("generator_hall", (0, 1.0, 0), scale=0.8)],
        env_opts={"wall": [0.2, 0.22, 0.24], "world": [0.05, 0.05, 0.06]}), still=True)
S("And even now, hundreds of millions of people still live without electricity. The job that began in eighteen eighty two isn't finished.",
  stage("night", cam((0, -5.5, 1.8), (0.4, -5.0, 1.7), (0, 1, 0.8)), props=[P("houses", (0, 0, 0), args={"on": [0.95, 0.96]}), P("candle", (0.2, -0.6, 0), scale=2.0)]),
  still=True)
S("And when the grid fails, everyone notices. In August two thousand and three, a software bug and overgrown trees in Ohio set off a blackout that left about fifty five million people in the United States and Canada in the dark.",
  stage("night", cam((0, -5.5, 1.8), (0.4, -5.0, 1.7), (0, 1, 0.8)), props=[P("houses", (0, 0, 0), args={"on": [0.95, 0.96]}), P("candle", (0.2, -0.6, 0), scale=2.0)]), still=True)
S("Edison gave the world the light bulb. But it was alternating current that carried the light into every home.",
  stage("night", cam((0, -2.0, 1.4), (0, -7.5, 3.0), (0, 1.5, 1.0), (0, 4, 1.2), 40, 28), props=[P("houses", (0, 1.5, 0), args={"on": [0.1, 0.5]}),
                                                                                            P("pylons", (-5, -2, 0), args={"n": 4, "current": [0.1, 0.3]}),
                                                                                            P("city", (0, 7, 0), args={"on": 0.4})]), hold=1.5, chapter="Close")

write(HERE, {
    "slug": "06-power-grid",
    "title": "The Invention That Gave the World Electricity",
    "description": ("Edison's DC versus Tesla and Westinghouse's AC: the war of the currents, the transformer, the White City and the "
                    "Niagara Falls power plant that lit up the world, told in 3D animation."),
    "tags": ["war of the currents", "Nikola Tesla", "Thomas Edison", "George Westinghouse", "alternating current", "transformer",
             "Niagara Falls", "power grid", "history of electricity", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.32, "sentence_silence": 0.28,
              "pronunciations": {"Menlo": "Men-low", "Barrington": "Barr-ing-ton", "Columbian": "Co-lum-bee-an", "Hz": "hertz"}},
    "music_mood": "tense",
    "sources": [
        "https://www.energy.gov/articles/war-currents-ac-vs-dc-power",
        "https://www.nps.gov/edis/learn/historyculture/edison-light-bulb.htm",
        "https://www.britannica.com/biography/Nikola-Tesla",
        "https://www.ieee.org/about/history",
        "https://ethw.org/Milestones:Adams_Hydroelectric_Generating_Plant,_1895",
        "https://ethw.org/Milestones:Alternating_Current_Electrification,_1886",
    ],
}, S.shots)
