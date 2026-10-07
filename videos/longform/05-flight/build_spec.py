"""Shot list for long-form #5: How Humans Learned to Fly.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

SUIT = {"skin": SKIN, "shirt": [0.12, 0.12, 0.14], "pants": [0.12, 0.12, 0.14], "boots": [0.04, 0.03, 0.02]}
WILBUR = {"hair": [0.25, 0.2, 0.15], "sleeves": "long", "outfit": SUIT}
ORVILLE = {"hair": [0.35, 0.22, 0.12], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.2, 0.17, 0.14], "pants": [0.2, 0.17, 0.14]}}
WORKER = {"hair": [0.3, 0.2, 0.1], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.3, 0.35, 0.45], "pants": [0.15, 0.15, 0.2], "boots": [0.06, 0.04, 0.03]}}
LILIENTHAL = {"hair": [0.4, 0.35, 0.3], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.3, 0.28, 0.24], "pants": [0.3, 0.28, 0.24]}}
SKY = {"sky": {"horizon": [0.75, 0.82, 0.95], "zenith": [0.15, 0.35, 0.8], "strength": 1.0}, "floor": [0.25, 0.5, 0.15]}
BEACH = {"sky": {"horizon": [0.7, 0.75, 0.85], "zenith": [0.2, 0.35, 0.7], "strength": 1.0}, "floor": [0.8, 0.68, 0.45]}
SHOP = {"wall": [0.35, 0.25, 0.18], "world": [0.04, 0.03, 0.02]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
BENCH = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))

# ===================================================================== HOOK
S("For as long as there have been people, we have watched birds and wondered what it would be like to fly.",
  stage("sky", cam((0, -5.0, 1.6), (0, -4.4, 2.0), (0, 0, 2.2)), cast=[who(WORKER, pose=LOOK_UP, scale=0.9)],
        props=[P("birds", (0, 2, 3.0), args={"n": 8, "area": 3.0})], env_opts=SKY))
S("Ancient myths are full of flying people. Icarus, in Greek legend, made wings of feathers and wax, and fell when the sun melted them.",
  stage("sky", cam((0, -6.0, 3.0), (0.4, -5.4, 3.2), (0, 0, 3.4)),
        props=[P("glider", (0, 2, 3.5), anim=[[0, {"at": [0, 2, 4.0]}], [1, {"at": [0.6, 2, 2.2], "rot": [-25, 0, 20]}]])],
        env_opts={"sky": {"horizon": [1.0, 0.7, 0.3], "zenith": [0.3, 0.45, 0.85]}, "floor": [0.1, 0.3, 0.5]}))
S("Around fifteen hundred, Leonardo da Vinci filled notebooks with designs for flying machines with flapping wings. None of them could ever have flown.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.95)), props=[TABLE, P("notebook", (0, -0.1, TOP)), P("candle", (0.4, 0, TOP)),
        P("glider", (0, 0.1, 1.1), scale=0.08)], env_opts=SHOP), still=True)
S("Then, on a cold, windy morning in December nineteen oh three, two brothers who ran a bicycle shop did it for real.",
  stage("sky", cam((4.5, -5.5, 2.0), (3.8, -4.8, 1.8), (0, 0, 1.1)), props=[P("wright_flyer"), P("dunes")], env_opts=BEACH), still=True)
S("Their flight lasted twelve seconds. Sixty six years later, humans walked on the Moon.",
  stage("space", cam((0, -3.0, 0.6), (0.3, -2.6, 0.55), (0, 0, 0.3)), texts=[T("12 SECONDS → THE MOON", (0, -1.2, 1.25), 0.14, pop=0.3)]))
S("This is how humans learned to fly.",
  stage("sky", cam((0, -9, 3.0), (0, -8, 3.2), (0, 0, 3.0)), props=[P("airliner", (0, 3, 3.2), anim=[[0, {"at": [-6, 3, 3.0]}], [1, {"at": [6, 3, 3.6]}]], rot=[0, 0, -90])],
        texts=[T("HOW HUMANS LEARNED TO FLY", (0, 0, 2.0), 0.28, pop=0.15)], env_opts=SKY))

# ===================================================================== BALLOONS & GLIDERS
S("The first humans to leave the ground did it in a bag of hot air.",
  stage("sky", cam((0, -9.0, 2.0), (0, -8.0, 3.0), (0, 0, 2.5)), props=[P("balloon", (0, 0, 0), args={"rise": [0.2, 1.0, 3.0]})],
        env_opts=SKY), chapter="Before the Wright brothers")
S("In Paris, in November seventeen eighty three, a balloon built by the Montgolfier brothers carried two men over the rooftops for about twenty five minutes.",
  stage("sky", cam((0, -10, 4.0), (1.0, -9, 4.6), (0, 0, 4.2)), props=[P("balloon", (0, 0, 2.5), args={"rise": [0.0, 1.0, 1.5]}), P("city", (0, 8, 0), scale=0.4)],
        texts=[T("PARIS 1783", (-2.2, 0, 4.5), 0.25, pop=0.2)], env_opts=SKY), still=True)
S("But balloons drift wherever the wind takes them. To truly fly, you need a wing.",
  stage("sky", cam((0, -9.0, 4.0), (0, -8.5, 4.2), (0, 0, 4.0)), props=[P("balloon", (0, 0, 2.5), anim=[[0, {"at": [-1.5, 0, 2.5]}], [1, {"at": [1.5, 0, 2.9]}]])],
        env_opts=SKY))
S("In seventeen ninety nine, an English baronet named George Cayley sketched the basic layout of a modern aeroplane: a fixed wing for lift, a tail for balance, and something separate to push it forward.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.95)), props=[TABLE, P("notebook", (0, -0.1, TOP)), P("candle", (0.4, 0, TOP)),
        P("airliner", (0, 0.1, 1.15), scale=0.12, rot=[0, 0, 200])], env_opts=SHOP), still=True)
S("Fifty years later, one of his gliders carried a frightened passenger across a valley in Yorkshire. By some accounts, it was his coachman.",
  stage("sky", cam((3.0, -5.0, 3.0), (2.4, -4.4, 2.8), (0, 0, 2.2)), props=[P("glider", (0, 0, 2.2), anim=[[0, {"at": [-2, 0, 2.6]}], [1, {"at": [2, 0, 1.8]}]])],
        env_opts=SKY))
S("In Germany in the eighteen nineties, an engineer named Otto Lilienthal made around two thousand flights in gliders he built himself, running down a hill and launching into the wind.",
  stage("sky", cam((3.2, -5.0, 2.2), (2.6, -4.2, 2.4), (0, 0, 1.8)),
        props=[P("glider", (0, 0, 1.4), anim=[[0, {"at": [-2.5, 1, 1.2]}], [1, {"at": [2.5, -0.5, 2.4]}]]), P("dunes", (0, 0, 0), args={"n": 6})],
        env_opts=SKY))
S("Newspapers around the world printed photographs of the flying man.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "THE FLYING MAN", "n": 3})]), still=True, still_at=0.7)
S("In eighteen ninety six, a gust stalled his glider, and he fell. He died the next day.",
  stage("sky", cam((2.0, -5.0, 2.0), (1.6, -4.4, 1.8), (0, 0, 1.6)),
        props=[P("glider", (0, 0, 2.2), anim=[[0, {"at": [-1, 0, 2.6]}], [0.4, {"at": [0, 0, 2.8], "rot": [25, 0, 0]}], [1, {"at": [0.6, 0, 0.6], "rot": [-50, 15, 0]}]])],
        env_opts={"sky": {"horizon": [0.5, 0.5, 0.55], "zenith": [0.2, 0.22, 0.3]}, "floor": [0.2, 0.35, 0.15]}))
S("Far away, in Dayton, Ohio, two brothers read the news, and decided to take up where he left off.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 1.2)),
        cast=[who(WILBUR, at=(-0.4, 0.35, 0), turn=-10, pose=READ), who(ORVILLE, at=(0.45, 0.35, 0), turn=10, pose=STAND)],
        props=[P("bicycle", (1.4, 0.8, 0), rot=[0, 0, 90])], env_opts=SHOP), still=True)

# ===================================================================== THE WRIGHTS
S("Neither Wilbur nor Orville Wright ever received a high school diploma. They built printing presses, then opened a shop selling and repairing bicycles.",
  stage("lab", BENCH, cast=[who(ORVILLE, pose=WORK)], props=[TABLE, P("bicycle", (0, -0.1, TOP), scale=0.6, rot=[0, 0, 90], args={"spin": 3})],
        env_opts=SHOP), chapter="The bicycle mechanics")
S("Bicycles taught them something important: a machine can be unstable, as long as the rider can control it.",
  stage("sky", cam((2.2, -3.0, 1.2), (1.6, -2.4, 1.1), (0, 0, 0.6)), props=[P("bicycle", anim=[[0, {"at": [0, -1.5, 0]}], [1, {"at": [0, 1.5, 0]}]], args={"spin": 4})],
        env_opts=SKY))
S("Their sister Katharine, a teacher, helped run the family home and the business while they experimented, and became one of their strongest supporters.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 1.2)),
        cast=[who(WILBUR, at=(-0.6, 0.35, 0), turn=-12), who({"hair": [0.25, 0.15, 0.08], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.3, 0.12, 0.2], "pants": [0.3, 0.12, 0.2], "boots": [0.1, 0.05, 0.04]}},
                                                         at=(0, 0.45, 0), scale=0.94), who(ORVILLE, at=(0.6, 0.35, 0), turn=12)], env_opts=SHOP), still=True)
S("Everyone else was trying to build aircraft that were stable on their own. The Wrights thought the real problem was control.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("LIFT", (-0.7, 0, 1.0), 0.14, (0.6, 0.6, 0.6), pop=0.1),
        T("POWER", (0, 0, 1.0), 0.14, (0.6, 0.6, 0.6), pop=0.2), T("CONTROL", (0.75, 0, 1.0), 0.18, (1.0, 0.85, 0.3), pop=0.4)]), still=True, still_at=0.8)
S("Wilbur watched buzzards twisting the tips of their wings to turn and balance.",
  stage("sky", cam((0, -3.0, 2.6), (0.3, -2.6, 2.7), (0, 0, 2.8)), props=[P("birds", (0, 0, 2.7), args={"n": 3, "area": 1.0})], env_opts=SKY))
S("Then, idly twisting a long, empty cardboard box in the shop, he realised a whole wing could be twisted in the same way. They called it wing warping.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 1.05)),
        props=[TABLE, P("books", (0, -0.1, 1.0), rot=[0, 0, 90], args={"n": 1}, anim=[[0, {"rot": [0, 0, 90]}], [0.5, {"rot": [15, 0, 90]}], [1, {"rot": [-15, 0, 90]}]])],
        texts=[T("WING WARPING", (0, 0.2, 1.3), 0.06, pop=0.5)], env_opts=SHOP))

# ===================================================================== KITTY HAWK
S("For testing, they needed steady winds and soft sand to land on. The weather bureau suggested a remote beach called Kitty Hawk, in North Carolina.",
  stage("sky", cam((0, -10, 3.0), (2, -9, 2.6), (0, 4, 0.5), lens=28), props=[P("dunes", args={"n": 14})], env_opts=BEACH), still=True,
  chapter="Kitty Hawk")
S("Their gliders of nineteen hundred and nineteen oh one flew, but they produced far less lift than the published tables predicted.",
  stage("sky", cam((3.0, -4.6, 1.6), (2.4, -4.0, 1.6), (0, 0, 1.2)),
        props=[P("wright_flyer", (0, 0, 0.2), args={"props_spin": False}, anim=[[0, {"at": [-1.5, 0, 0.2]}], [1, {"at": [1.5, 0, 0.0]}]]), P("dunes")],
        env_opts=BEACH))
S("Wilbur was so discouraged he said that men would not fly in a thousand years.",
  stage("sky", cam((0.5, -1.8, 1.6), (0.35, -1.5, 1.55), "cast0.head"), cast=[who(WILBUR, pose={**STAND, "head_nod": 18})], env_opts=BEACH), still=True)
S("Back home, they built their own wind tunnel, a wooden box with a fan at one end.",
  stage("studio", cam((1.0, -1.8, 1.0), (0.7, -1.4, 0.8), (0, 0, 0.2)), props=[P("wind_tunnel")]), chapter="The wind tunnel")
S("Inside, they tested around two hundred small model wings, carefully measuring the lift each one made.",
  stage("studio", cam((0.25, -0.5, 0.45), (0.18, -0.4, 0.38), (0, -0.1, 0.22)), props=[P("wind_tunnel")]))
S("They discovered that the numbers everyone had relied on were wrong. Now they had their own data, the best in the world.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.95)), props=[TABLE, P("notebook", (0, -0.1, TOP)), P("notebook", (0.25, -0.05, TOP), rot=[0, 0, 15])],
        texts=[T("200 WINGS", (0, 0.2, 1.25), 0.07, pop=0.3)], env_opts=SHOP), still=True)
S("A wing works by meeting the air at a slight angle. Air flowing over the curved top is pulled downward behind it, and the wing is pushed up. That push is lift.",
  stage("studio", cam((-3.0, 0.0, 0.95), (-2.6, 0.3, 0.9), (0, 0, 0.8)), props=[P("airfoil_flow", (0, 0, 0.8))]))
S("In nineteen oh two, their new glider added a movable rudder. Now they could control it on all three axes: pitch, roll and yaw.",
  stage("sky", cam((3.0, -4.6, 1.6), (2.4, -4.0, 1.6), (0, 0, 1.2)),
        props=[P("wright_flyer", (0, 0, 0.6), args={"props_spin": False}, anim=[[0, {"rot": [0, 0, 0]}], [0.33, {"rot": [8, 0, 0]}], [0.66, {"rot": [0, 12, 0]}], [1, {"rot": [0, 0, 15]}]])],
        texts=[T("PITCH  •  ROLL  •  YAW", (0, 1.5, 2.6), 0.2, pop=0.3)], env_opts=BEACH))
S("They made hundreds of glides. That system of three-axis control is still how every aeroplane is flown today.",
  stage("sky", cam((0, -9, 3.0), (0.4, -8.4, 3.0), (0, 0, 3.0)), props=[P("airliner", (0, 3, 3.2), rot=[0, 0, -90], anim=[[0, {"at": [-5, 3, 3.0]}], [1, {"at": [5, 3, 3.4], "rot": [0, -10, -90]}]])],
        env_opts=SKY))

# ===================================================================== POWER
S("They spent months at Kitty Hawk each year, living in a wooden shed, battling storms and swarms of mosquitoes.",
  stage("sky", cam((0, -5.5, 1.8), (0.4, -5.0, 1.7), (0, 0, 1.0)), props=[P("dunes"), P("table", (1.5, 1.0, 0), args={"w": 2.5, "d": 1.6, "h": 1.8, "color": [0.45, 0.32, 0.2]})],
        env_opts=BEACH), still=True)
S("Next, they needed an engine. No company could build one light enough, so their mechanic, Charlie Taylor, built one in about six weeks, with an aluminium block.",
  stage("lab", BENCH, cast=[who(WORKER, pose=WORK)], props=[TABLE, P("graphite_pile", (0, -0.1, TOP), scale=0.1)], texts=[T("12 HORSEPOWER", (0.9, 0.6, 1.6), 0.12, pop=0.3)],
        env_opts=SHOP), still=True, chapter="An engine and propellers")
S("And they realised a propeller is just a wing that spins. Nobody had worked out how to design one properly, so they did it themselves.",
  stage("studio", cam((0.6, -1.4, 0.9), (0.4, -1.2, 0.85), (0, 0, 0.6)), props=[P("wright_flyer", (0, 0, -0.6), scale=0.7)]))

# ===================================================================== DECEMBER 17
S("Meanwhile, the famous scientist Samuel Langley had fifty thousand dollars from the United States Army to build a flying machine. On the eighth of December, nineteen oh three, it plunged straight into the Potomac River.",
  stage("sky", cam((0, -8, 2.0), (0.4, -7.4, 1.9), (0, 0, 1.4)),
        props=[P("glider", (0, 0, 2.5), scale=1.2, anim=[[0, {"at": [-2, 0, 3.0]}], [1, {"at": [0.5, 0, 0.2], "rot": [-60, 0, 0]}]])],
        env_opts={"sky": SKY["sky"], "floor": [0.1, 0.3, 0.5]}), still=True, still_at=0.5)
S("The Wright brothers spent about a thousand dollars of their own money.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("$50,000", (-0.6, 0, 1.0), 0.18, (1.0, 0.4, 0.4), pop=0.1),
        T("$1,000", (0.6, 0, 1.0), 0.18, (0.4, 1.0, 0.6), pop=0.4)]), still=True, still_at=0.8)
S("On the fourteenth of December, nineteen oh three, the brothers tossed a coin to decide who would go first. Wilbur won, but he stalled the machine on takeoff.",
  stage("sky", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 1.2)),
        cast=[who(WILBUR, at=(-0.4, 0.35, 0), turn=-10, pose=PRESENT), who(ORVILLE, at=(0.45, 0.35, 0), turn=10, pose=STAND)], env_opts=BEACH), still=True,
  chapter="December 17, 1903")
S("Three days later, on the seventeenth of December, it was Orville's turn. The wind was blowing at more than twenty miles an hour.",
  stage("sky", cam((4.5, -5.5, 2.0), (3.8, -4.8, 1.8), (0, 0, 1.1)), props=[P("wright_flyer"), P("dunes")],
        texts=[T("17 DECEMBER 1903", (0, 2, 2.6), 0.25, pop=0.2)], env_opts=BEACH))
S("At ten thirty five in the morning, the Flyer ran along a wooden rail, lifted into the air, and stayed there.",
  stage("sky", cam((5.0, -3.0, 1.4), (4.0, -1.0, 1.6), (0, 0, 1.2), (0, -4, 1.6)),
        props=[P("wright_flyer", anim=[[0, {"at": [0, 4, -0.6]}], [0.4, {"at": [0, 0, -0.6]}], [1, {"at": [0, -8, 0.4]}]]), P("dunes")], env_opts=BEACH))
S("It flew for twelve seconds and covered thirty seven metres, a shorter distance than the wingspan of a modern jumbo jet.",
  stage("sky", cam((0, -14, 2.5), (0, -13, 2.5), (0, 0, 1.0), lens=28), props=[P("wright_flyer", (0, 0, -0.6), rot=[0, 0, 90]), P("airliner", (0, 5, 1.0), scale=5.5)],
        texts=[T("37 m", (0, 0, 2.2), 0.4, pop=0.3)], env_opts=BEACH), still=True)
S("Wilbur ran alongside. A local lifeguard named John Daniels, who had never used a camera before, took one of the most famous photographs ever made.",
  stage("sky", cam((-3.5, -3.5, 1.4), (-3.0, -3.0, 1.4), (0, 0, 1.2)),
        cast=[who(WILBUR, at=(1.0, -1.2, 0), turn=-60, pose=STAND), who(WORKER, at=(-1.8, -1.6, 0), turn=-50, pose=WORK)],
        props=[P("wright_flyer", (0, 0, -0.2), rot=[0, 0, 90])], env_opts=BEACH), still=True)
S("They flew three more times that day. The last flight, by Wilbur, lasted fifty nine seconds and covered over two hundred and fifty metres.",
  stage("sky", cam((4.5, -6.0, 2.2), (3.2, -5.0, 2.4), (0, 0, 1.6)),
        props=[P("wright_flyer", anim=[[0, {"at": [-6, 2, -0.2]}], [1, {"at": [6, -2, 0.2]}]], rot=[0, 0, -70]), P("dunes")],
        texts=[T("59 SECONDS", (0, 3, 3.0), 0.25, pop=0.4)], env_opts=BEACH))

# ===================================================================== DOUBT & TRIUMPH
S("Orville sent a telegram to their father: Success. Four flights Thursday morning. Inform press. Home Christmas.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "SUCCESS FOUR FLIGHTS THURSDAY MORNING", "n": 1})]),
  still=True, still_at=0.7)
S("Almost nobody believed them. Newspapers ignored the story, and many experts called them liars.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "FLYING OR LYING?", "n": 3})]),
  still=True, still_at=0.7, chapter="Nobody believed them")
S("Back in Ohio, they kept improving their machine in a cow pasture called Huffman Prairie. By nineteen oh five, they could stay up for thirty nine minutes, circling over the fields.",
  stage("sky", cam((0, -9, 2.4), (0.5, -8.4, 2.4), (0, 0, 1.8)), props=[P("wright_flyer", (0, 2, 1.4), rot=[0, -15, -60])],
        texts=[T("39 MINUTES", (0, 0, 3.0), 0.25, pop=0.3)], env_opts=SKY), still=True)
S("Then, in nineteen oh eight, Wilbur flew in public at a racecourse near Le Mans, in France. He banked, circled and landed exactly where he chose.",
  stage("sky", cam((0, -9, 2.0), (0.5, -8, 2.4), (0, 0, 2.2)),
        props=[P("wright_flyer", (0, 0, 1.2), anim=[[0, {"at": [-4, 2, 1.2], "rot": [0, -20, -40]}], [1, {"at": [4, 0, 1.8], "rot": [0, 20, 40]}]]),
               P("figures", (0, -2.5, 0), args={"n": 9, "spacing": 0.45})], env_opts=SKY))
S("The crowds were stunned. One French aviator said: we are beaten. We do not exist.",
  stage("hall", cam((0, -4.6, 2.7), (0.4, -4.0, 2.4), (0, 1.0, 1.0), lens=30), props=[P("audience", (0, 1.0, 0), rot=[0, 0, 180], args={"react": 0.3})]))
S("Flying was still dangerous. That September, Orville crashed during a demonstration for the US Army. His passenger, Lieutenant Thomas Selfridge, became the first person to die in a powered aeroplane crash.",
  stage("sky", cam((0, -6, 1.6), (0.3, -5.6, 1.5), (0, 0, 0.6)), props=[P("wright_flyer", (0, 0, -0.4), rot=[-20, 25, 15], args={"props_spin": False})],
        env_opts={"sky": {"horizon": [0.5, 0.5, 0.55], "zenith": [0.2, 0.22, 0.3]}, "floor": [0.2, 0.35, 0.15]}), still=True)
S("But the Army bought a Wright Flyer the following year, and the brothers became famous around the world.",
  stage("hall", cam((0, -2.8, 1.6), (0, -2.4, 1.5), (0, 0.4, 1.2)), cast=[who(WILBUR, at=(-0.4, 0.4, 0), turn=-10, pose=PRESENT), who(ORVILLE, at=(0.45, 0.4, 0), turn=10)],
        props=[P("medal", (0, -0.1, 1.7), spin=["z", 40])]), still=True)
S("After that, aviation exploded. In nineteen oh nine, Louis Blériot flew across the English Channel.",
  stage("sky", cam((0, -9, 2.0), (0.5, -8, 2.0), (0, 0, 1.6)),
        props=[P("wright_flyer", (0, 0, 1.6), scale=0.7, anim=[[0, {"at": [-5, 0, 1.6]}], [1, {"at": [5, 0, 1.8]}]], rot=[0, 0, -90])],
        texts=[T("1909", (0, 2, 3.0), 0.3, pop=0.2)], env_opts={"sky": SKY["sky"], "floor": [0.1, 0.3, 0.5]}), chapter="From Kitty Hawk to the Moon")
S("In nineteen twenty seven, Charles Lindbergh flew alone, nonstop, from New York to Paris.",
  stage("studio", cam((0, -2.6, 2.0), (0.4, -2.0, 1.6), (0, 0, 0.3)), props=[P("route", (0, 0, 0.05), args={"stops": ["NEW YORK", "PARIS"]})]))
S("Twenty years after that, Chuck Yeager flew faster than the speed of sound.",
  stage("sky", cam((0, -9, 3.0), (0, -8.5, 3.0), (0, 0, 3.0)),
        props=[P("airliner", (0, 3, 3.2), scale=0.5, rot=[0, 0, -90], anim=[[0, {"at": [-12, 3, 3.0]}], [1, {"at": [12, 3, 3.6]}]])],
        texts=[T("MACH 1", (0, 0, 1.6), 0.3, pop=0.3)], env_opts={"sky": {"horizon": [0.6, 0.7, 0.9], "zenith": [0.02, 0.08, 0.35]}, "floor": [0.6, 0.5, 0.35]}))
S("In the late nineteen thirties, Frank Whittle in Britain and Hans von Ohain in Germany each invented the jet engine. The first jet aircraft flew in August nineteen thirty nine.",
  stage("studio", cam((0.5, -1.6, 0.8), (0.3, -1.3, 0.7), (0, 0, 0.5)), props=[P("airliner", (0, 0, 0.5), scale=0.35, rot=[0, 0, 40])],
        texts=[T("THE JET ENGINE", (0, 0.5, 0.95), 0.12, pop=0.2)]), still=True)
S("And in July nineteen sixty nine, Neil Armstrong landed on the Moon. In his kit, he carried a piece of fabric from the wing of the nineteen oh three Wright Flyer.",
  stage("space", cam((0, -3.0, 0.6), (0.3, -2.6, 0.55), (0, 0, 0.3)), texts=[T("1903 → 1969", (0, -1.2, 1.25), 0.2, pop=0.3)]), still=True)
S("In nineteen fifty two, the de Havilland Comet began the first jet airliner service. And in nineteen seventy, the Boeing seven four seven made long distance flying affordable for millions.",
  stage("sky", cam((0, -9, 3.0), (0.4, -8.4, 3.0), (0, 0, 3.0)), props=[P("airliner", (0, 3, 3.2), rot=[0, 0, -90], scale=1.2)], env_opts=SKY), still=True)
S("Today, around a hundred thousand commercial flights take off every day.",
  stage("sky", cam((0, -9, 3.0), (0.4, -8.4, 3.0), (0, 0, 3.0)),
        props=[P("airliner", (x, 6 + abs(x), 3 + 0.3 * i), scale=0.5, rot=[0, 0, -90], anim=[[0, {"at": [x - 3, 6 + abs(x), 3 + 0.3 * i]}], [1, {"at": [x + 3, 6 + abs(x), 3.2 + 0.3 * i]}]])
               for i, x in enumerate((-4, -1.5, 1, 3.5))], env_opts=SKY))
S("The original nineteen oh three Flyer spent twenty years on display in London, after a dispute with the Smithsonian. Since nineteen forty eight, it has hung in Washington, D.C., in what is now the National Air and Space Museum.",
  stage("hall", cam((0, -6, 2.2), (0.5, -5.4, 2.4), (0, 0, 2.6), lens=30), props=[P("wright_flyer", (0, 0, 1.2), rot=[0, 0, 30])]), still=True)
S("It all began with two brothers from a bicycle shop, who refused to give up, and treated flying not as a dream, but as an engineering problem.",
  stage("sky", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 1.2)),
        cast=[who(WILBUR, at=(-0.4, 0.35, 0), turn=-10), who(ORVILLE, at=(0.45, 0.35, 0), turn=10)],
        props=[P("wright_flyer", (0, 4, 0), scale=0.8, rot=[0, 0, 30])], env_opts=BEACH), still=True, chapter="Close")
S("Twelve seconds over a beach. And the whole sky opened up.",
  stage("sky", cam((4.5, -5.5, 1.4), (6.0, -9.0, 3.0), (0, 0, 1.2), (0, -3, 2.5)),
        props=[P("wright_flyer", anim=[[0, {"at": [0, 3, -0.4]}], [1, {"at": [0, -6, 1.5]}]]), P("dunes"), P("birds", (0, -2, 3), args={"n": 5})],
        env_opts=BEACH), hold=1.5)

write(HERE, {
    "slug": "05-flight",
    "title": "How Humans Learned to Fly",
    "description": ("From hot-air balloons and Lilienthal's gliders to the Wright brothers' wind tunnel and the 12 seconds at Kitty Hawk "
                    "that changed the world, told in 3D animation."),
    "tags": ["Wright brothers", "first flight", "Kitty Hawk", "history of aviation", "how planes fly", "lift", "Otto Lilienthal",
             "Montgolfier", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.25, "sentence_silence": 0.28,
              "pronunciations": {"Lilienthal": "Lil-ee-en-tahl", "Montgolfier": "Mont-gol-fee-ay", "Cayley": "Kay-lee",
                                 "Blériot": "Blair-ee-oh", "Le Mans": "Luh Mon", "aluminium": "al-you-min-ee-um"}},
    "music_mood": "hopeful",
    "sources": [
        "https://airandspace.si.edu/exhibitions/wright-brothers/online/",
        "https://www.nps.gov/wrbr/learn/historyculture/thefirstflight.htm",
        "https://www.loc.gov/collections/wilbur-and-orville-wright-papers/",
        "https://airandspace.si.edu/collection-objects/1903-wright-flyer/nasm_A19610048000",
        "https://www.britannica.com/biography/Otto-Lilienthal",
        "https://www.nasa.gov/history/50-years-ago-apollo-11-flew-a-piece-of-the-wright-flyer/",
    ],
}, S.shots)
