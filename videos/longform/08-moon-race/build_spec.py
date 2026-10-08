"""Shot list for long-form #8: The Race to the Moon.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

SUIT = {"skin": SKIN, "shirt": [0.12, 0.12, 0.15], "pants": [0.12, 0.12, 0.15], "boots": [0.04, 0.03, 0.02]}
KENNEDY = {"hair": [0.35, 0.22, 0.1], "sleeves": "long", "outfit": SUIT}
KOROLEV = {"hair": [0.1, 0.08, 0.07], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.25, 0.25, 0.22], "pants": [0.25, 0.25, 0.22]}}
GAGARIN = {"helmet": True, "sleeves": "long",
           "outfit": {"skin": SKIN, "shirt": [0.85, 0.35, 0.1], "pants": [0.85, 0.35, 0.1], "boots": [0.2, 0.15, 0.1]}}
VON_BRAUN = {"hair": [0.4, 0.3, 0.2], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.3, 0.3, 0.32], "pants": [0.3, 0.3, 0.32]}}
ASTRO = {"astronaut": True}
ENGINEER = {"hair": [0.2, 0.15, 0.1], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.92, 0.92, 0.94], "pants": [0.15, 0.15, 0.2], "boots": [0.04, 0.03, 0.02]}}
SKY = {"sky": {"horizon": [0.75, 0.82, 0.95], "zenith": [0.15, 0.35, 0.8], "strength": 1.0}, "floor": [0.3, 0.45, 0.2]}
CAPE = {"sky": {"horizon": [0.9, 0.75, 0.55], "zenith": [0.25, 0.45, 0.85], "strength": 1.0}, "floor": [0.55, 0.55, 0.5]}
OFFICE = {"wall": [0.3, 0.32, 0.36], "world": [0.03, 0.03, 0.035]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
PAD = cam((0, -20, 4.0), (0, -18, 5.0), (0, 0, 5.0), lens=30)
MOON = cam((3, -5, 1.6), (2.4, -4.4, 1.5), (0, 0, 1.0))

# ===================================================================== HOOK
S("On the twentieth of July, nineteen sixty nine, more than half a billion people around the world crowded around television sets.",
  stage("night", cam((0, -1.6, 1.0), (0, -6, 2.4), (0, 0, 0.6), (0, 3, 1.0), 40, 28), props=[P("houses", (0, 1, 0), args={"on": [0, 0.3]}),
                                                                                          P("city", (0, 6, 0), args={"on": 0.2})]))
S("They watched a fuzzy black and white picture, beamed from almost four hundred thousand kilometres away.",
  stage("space", cam((0, -3.4, 0.6), (0.3, -3.0, 0.5), (0, 0, 0.3)), texts=[T("384,000 km", (0, -0.6, 0.55), 0.2, pop=0.3)]), still=True)
S("A man in a white suit climbed down a ladder, and stepped onto the Moon.",
  stage("space", cam((1.8, -3.4, 1.0), (1.4, -2.8, 0.9), (0, 0, 1.0)), cast=[who(ASTRO, at=(0.9, -0.9, 0), turn=-40)],
        props=[P("lunar_module"), P("moon_surface")]))
S("It was the end of a race between two superpowers, that began with a beeping metal ball, just twelve years earlier.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.8, 1.15), (0, 0, 1.1)), texts=[T("THE RACE TO THE MOON", (0, 0, 1.35), 0.26, pop=0.08)],
        props=[P("sputnik", (0, 0.8, 0.55), scale=0.6)], env_opts={"horizon": [0.05, 0.03, 0.12]}))

# ===================================================================== SPUTNIK
S("After the Second World War, the United States and the Soviet Union became rivals in the Cold War.",
  stage("space", cam((0, -3.4, 0.6), (0.3, -3.0, 0.5), (0, 0, 0)), texts=[T("USA  vs  USSR", (0, -0.6, 0.55), 0.22, pop=0.2)]), still=True,
  chapter="Sputnik")
S("Both had captured German rocket technology, and rocket scientists, at the end of the war.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(VON_BRAUN, pose=PRESENT)],
        props=[P("saturn_v", (0.9, 0.4, 0.9), scale=0.08)], env_opts=OFFICE), still=True)
S("Rockets that could carry nuclear weapons across the world could also carry satellites into orbit.",
  stage("sky", cam((0, -18, 3.0), (0, -16, 4.5), (0, 0, 6.0), lens=30), props=[P("saturn_v", args={"launch": [0.2, 1.0]})], env_opts=CAPE))
S("On the fourth of October, nineteen fifty seven, the Soviet Union launched Sputnik, a polished metal ball about the size of a beach ball.",
  stage("space", cam((0, -2.6, 0.9), (0.3, -2.2, 0.8), (0, 0, 0.9)), props=[P("sputnik", (0, 0, 0.9))],
        texts=[T("4 OCTOBER 1957", (0, 0.5, 1.7), 0.15, pop=0.15)]))
S("It did nothing but beep. But anyone with a radio could hear it passing overhead, every ninety six minutes.",
  stage("space", cam((0, -5.0, 0.3), (0.3, -4.6, 0.4), (0, 0, 0.3)), props=[P("sputnik", (1.6, 0, 1.4), scale=0.25)]))
S("Its batteries died after three weeks, and in January nineteen fifty eight, it fell back and burned up in the atmosphere. But the world had changed.",
  stage("space", cam((0, -5.0, 0.3), (0.3, -4.6, 0.4), (0, 0, 0.3)), props=[P("sputnik", (1.6, 0, 1.4), scale=0.25)]), still=True)
S("Americans were shocked. If the Soviets could put a satellite over their heads, what else could they do?",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "RED MOON OVER AMERICA", "n": 3})]),
  still=True, still_at=0.7)
S("A month later, the Soviets launched a dog named Laika into orbit. The first American attempt to launch a satellite exploded on the launch pad, live on television.",
  stage("sky", cam((0, -14, 3.0), (0, -13, 3.0), (0, 0, 2.5), lens=30), props=[P("saturn_v", scale=0.5, args={"launch": [0.2, 0.3]})],
        bolts=[], env_opts={"sky": {"horizon": [0.9, 0.5, 0.3], "zenith": [0.3, 0.35, 0.6]}, "floor": [0.55, 0.55, 0.5]}))
S("The United States responded by creating NASA in nineteen fifty eight.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("NASA  1958", (0, 0, 1.0), 0.3, (0.3, 0.6, 1.0), pop=0.1)]), still=True, still_at=0.8)

# ===================================================================== GAGARIN
S("In nineteen fifty nine, NASA picked its first seven astronauts, all military test pilots. The press called them the Mercury Seven.",
  stage("sky", cam((0, -3.6, 1.6), (0.3, -3.2, 1.5), (0, 0.3, 1.1)), cast=[who(ASTRO, at=((i - 3) * 0.55, 0.2 + (i % 2) * 0.3, 0), scale=0.95) for i in range(7)],
        env_opts=CAPE), still=True)
S("Then came an even bigger shock. On the twelfth of April, nineteen sixty one, a twenty seven year old Soviet pilot named Yuri Gagarin became the first human in space.",
  stage("space", cam((0.4, -1.8, 1.6), (0.3, -1.5, 1.55), "cast0.head"), cast=[who(GAGARIN, pose=STAND)],
        texts=[T("12 APRIL 1961", (0.9, 0.5, 2.0), 0.14, pop=0.2)]), still=True, chapter="The first human in space")
S("His capsule, Vostok One, circled the Earth once in a hundred and eight minutes. He became the most famous person on the planet.",
  stage("space", cam((0, -5.2, 0.8), (0.4, -4.6, 0.6), (0, 0, 0.3)), props=[P("command_module", (1.4, -1.0, 1.0), scale=0.25, spin=["z", 90])],
        texts=[T("108 MINUTES", (0, -1.2, 1.6), 0.2, pop=0.4)]))
S("As his rocket lifted off, Gagarin shouted a single word: poyekhali. Let's go.",
  stage("space", cam((0, -5.2, 0.8), (0.4, -4.6, 0.6), (0, 0, 0.3)), props=[P("command_module", (1.4, -1.0, 1.0), scale=0.25, spin=["z", 90])],
        texts=[T("108 MINUTES", (0, -1.2, 1.6), 0.2, pop=0.4)]), still=True)
S("Behind the Soviet successes was a brilliant engineer whose name was kept secret: Sergei Korolev, known only as the Chief Designer.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(KOROLEV, pose=STAND)], env_opts={"wall": [0.2, 0.15, 0.12], "world": [0.02, 0.015, 0.01]}),
  still=True)
S("Weeks later, Alan Shepard became the first American in space, on a fifteen minute flight that didn't even reach orbit.",
  stage("sky", cam((0, -14, 3.0), (0, -13, 4.0), (0, 0, 4.0), lens=30), props=[P("saturn_v", scale=0.45, args={"launch": [0.15, 1.0]})], env_opts=CAPE))

# ===================================================================== KENNEDY
S("In February nineteen sixty two, John Glenn became the first American to orbit the Earth. Before he flew, he asked for one person to double check the computer's numbers: the NASA mathematician Katherine Johnson.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"),
        cast=[who({"hair": [0.08, 0.06, 0.05], "sleeves": "long", "outfit": {"skin": [0.45, 0.3, 0.22], "shirt": [0.25, 0.3, 0.55], "pants": [0.25, 0.3, 0.55], "boots": [0.1, 0.05, 0.04]}}, pose=WORK)],
        props=[TABLE, P("books", (0.45, -0.1, TOP), args={"n": 4}), P("trajectory", (0, 0.4, 1.4), scale=0.2)], env_opts=OFFICE), still=True)
S("President John F. Kennedy needed something bold. Something the Soviets could not easily win.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(KENNEDY, pose=STAND)], env_opts=OFFICE), still=True,
  chapter="We choose to go to the Moon")
S("In May nineteen sixty one, he asked Congress to commit America to landing a man on the Moon, and returning him safely to the Earth, before the decade was out.",
  stage("hall", cam((0, -4.6, 2.7), (0.3, -4.0, 2.4), (0, 1.2, 1.2), lens=30), cast=[who(KENNEDY, at=(0, 1.4, 0), pose=PRESENT)],
        props=[P("table", (0, 0.9, 0)), P("audience", (0, 1.2, 0), rot=[0, 0, 180], args={"react": 0.8})]))
S("At the time, America had a total of fifteen minutes of human spaceflight experience.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("15 MINUTES", (0, 0, 1.0), 0.3, pop=0.1)]), still=True, still_at=0.8)
S("A year later, in a speech in Texas, he explained why. We choose to go to the Moon, he said, not because it is easy, but because it is hard.",
  stage("sky", cam((0, -3.0, 1.6), (0.2, -2.6, 1.55), "cast0.head"), cast=[who(KENNEDY, pose=PRESENT)],
        props=[P("figures", (0, -1.4, 0), args={"n": 9, "spacing": 0.4})], env_opts=SKY))
S("The Apollo programme became one of the biggest engineering projects in history. At its peak, around four hundred thousand people worked on it.",
  stage("lab", cam((0, -4.5, 2.5), (0.3, -4.0, 2.3), (0, 1.5, 1.2), lens=28), props=[P("mission_control")], env_opts=OFFICE), still=True)

# ===================================================================== BUILDING THE ROCKET
S("NASA flew ten crewed Gemini missions to practise everything a Moon trip would need: long flights, spacewalks, and finding and docking with another spacecraft in orbit.",
  stage("space", cam((1.5, -4, 1.4), (1.0, -3.4, 1.2), (0, 0, 0.8)), props=[P("command_module", (-0.6, 0, 0.8), scale=0.6, rot=[0, 90, 0]),
        P("command_module", (0.9, 0.3, 0.8), scale=0.6, rot=[0, -90, 0], anim=[[0, {"at": [2.0, 0.3, 0.8]}], [1, {"at": [0.9, 0.3, 0.8]}]])]))
S("On Gemini Eight, a stuck thruster sent Neil Armstrong's spacecraft tumbling, once every second. He calmly regained control. NASA remembered.",
  stage("space", cam((1.5, -3, 1.3), (1.2, -2.6, 1.2), (0, 0, 0.8)), props=[P("command_module", (0, 0, 0.8), scale=0.7, spin=["y", 1440])]))
S("The plan they chose, championed by an engineer named John Houbolt, was clever: leave the main ship in orbit around the Moon, and send down only a small, light lander.",
  stage("space", cam((0, -5.5, 1.5), (0.4, -5.0, 1.3), (0, 0, 0.3)), props=[P("command_module", (-0.8, 0, 1.4), scale=0.3), P("lunar_module", (0.8, 0, -0.3), scale=0.3),
        P("moon_surface", (0, 0, -0.5), args={"craters": 20})]), still=True)
S("To get there, NASA needed the most powerful rocket ever built. It was designed by a team led by Wernher von Braun, a former Nazi rocket engineer brought to America after the war.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(VON_BRAUN, pose=PRESENT)], env_opts=OFFICE), still=True,
  chapter="Saturn V")
S("The Saturn Five stood a hundred and ten metres tall, taller than the Statue of Liberty, and weighed nearly three thousand tonnes when fully fuelled.",
  stage("sky", PAD, props=[P("saturn_v"), P("launch_tower")], texts=[T("110 m", (-3, 0, 9.0), 0.8, pop=0.3)], env_opts=CAPE), still=True)
S("Its five first stage engines burned about thirteen tonnes of fuel and oxygen every second.",
  stage("sky", cam((3, -6, 0.6), (2.6, -5.4, 0.8), (0, 0, 0.6), lens=30), props=[P("saturn_v", args={"launch": [0.1, 2.0]})], env_opts=CAPE))
S("Thirteen Saturn Fives were launched, and not one was ever lost.",
  stage("sky", cam((3, -6, 0.6), (2.6, -5.4, 0.8), (0, 0, 0.6), lens=30), props=[P("saturn_v", args={"launch": [0.1, 2.0]})], env_opts=CAPE), still=True)
S("Inside the tiny command module, three astronauts would ride with less room than the inside of a small car.",
  stage("space", cam((1.5, -3, 1.3), (1.2, -2.6, 1.2), (0, 0, 0.8)), props=[P("command_module", (0, 0, 0.8))]), still=True)
S("And the computer that guided them had less memory than a modern greetings card that plays a tune.",
  stage("studio", cam((0.25, -0.75, 0.35), (0.18, -0.65, 0.32), (0, 0, 0.03)), props=[P("microchip", args={"glow": [0.1, 0.4]})],
        texts=[T("4 KB OF MEMORY", (0, 0.25, 0.25), 0.07, pop=0.3)]))

# ===================================================================== TRAGEDY
S("The Soviets kept scoring firsts: the first woman in space, Valentina Tereshkova, and the first spacewalk, by Alexei Leonov.",
  stage("space", cam((1.6, -3.2, 1.4), (1.2, -2.8, 1.3), (0, 0, 1.0)), cast=[who(ASTRO, at=(0, 0, 0.6), rot=(0, 30, 20), pose={"raise_arm": {"L": 40, "R": 10}})],
        props=[P("command_module", (1.2, 1.2, 1.4), scale=0.8)]), chapter="Setbacks")
S("Then, in January nineteen sixty seven, disaster. During a launch rehearsal, fire swept through the Apollo One capsule. Astronauts Gus Grissom, Ed White and Roger Chaffee were killed.",
  stage("sky", cam((0, -14, 4.0), (0, -13, 4.2), (0, 0, 5.0), lens=30), props=[P("saturn_v", scale=0.6), P("launch_tower", scale=0.6)],
        env_opts={"sky": {"horizon": [0.35, 0.33, 0.35], "zenith": [0.1, 0.1, 0.15]}, "floor": [0.4, 0.4, 0.38]}), still=True)
S("NASA redesigned the capsule from top to bottom. The programme went on.",
  stage("lab", cam((1.5, -3, 1.6), (1.2, -2.6, 1.5), (0, 0, 1.0)), cast=[who(ENGINEER, at=(-1.0, 0.2, 0), turn=-30, pose=WORK)],
        props=[P("command_module", (0, 0, 1.4))], env_opts=OFFICE), still=True)
S("The Soviet Moon programme struggled. Korolev had died during surgery in nineteen sixty six, and their giant N1 rocket exploded on every one of its four launches.",
  stage("sky", cam((0, -14, 3.0), (0, -13, 3.0), (0, 0, 2.5), lens=30), props=[P("saturn_v", scale=0.5, args={"launch": [0.2, 0.45]})],
        bolts=[{"from": [0.5, 0, 6], "to": [0, 0, 2.5], "at": 0.5, "seed": 3, "width": 0.05}],
        env_opts={"sky": {"horizon": [0.9, 0.5, 0.3], "zenith": [0.3, 0.35, 0.6]}, "floor": [0.45, 0.45, 0.4]}))

# ===================================================================== APOLLO 8
S("In December nineteen sixty eight, Apollo Eight carried three astronauts all the way to the Moon, and around it, ten times.",
  stage("space", cam((0, -6, 1.0), (1, -5.4, 0.8), (0, 0, 0.5)), props=[P("command_module", (1.5, -1.5, 1.0), scale=0.3)],
        texts=[T("APOLLO 8", (0, -1.2, 1.6), 0.2, pop=0.2)]), chapter="Apollo 8")
S("On Christmas Eve, as their spacecraft came around from the far side, they saw the Earth rising over the lunar horizon, and grabbed a camera.",
  stage("space", cam((0, -6, 0.6), (0, -6, 1.2), (0, 6, 0.5), lens=35), props=[P("moon_surface", (0, -2, -0.5), args={"craters": 30})]))
S("That photograph, Earthrise, showed our whole world as a small, fragile blue marble in the darkness.",
  stage("space", cam((0, -3.4, 0.6), (0.2, -3.0, 0.5), (0, 0, 0.1)), props=[P("moon_surface", (0, -3, -1.1), args={"craters": 20})]), still=True)

# ===================================================================== APOLLO 11
S("In May nineteen sixty nine, Apollo Ten flew a full dress rehearsal, taking the lunar module to within about fifteen kilometres of the Moon's surface. Everything was ready.",
  stage("space", cam((2.5, -4, 3.0), (2, -3.4, 2.6), (0, 0, 1.5)), props=[P("lunar_module", (0, 0, 2.5)), P("moon_surface")]))
S("On the sixteenth of July, nineteen sixty nine, Neil Armstrong, Buzz Aldrin and Michael Collins launched on Apollo Eleven.",
  stage("sky", PAD, props=[P("saturn_v", args={"launch": [0.15, 1.0]}), P("launch_tower")], env_opts=CAPE), chapter="Apollo 11")
S("Around a million people gathered near Cape Kennedy to watch the launch.",
  stage("sky", cam((0, -30, 2.0), (0, -28, 3.0), (0, 0, 5.0), lens=35), props=[P("saturn_v", args={"launch": [0.3, 1.0]}), P("figures", (0, -24, 0), args={"n": 12, "spacing": 0.5})],
        env_opts=CAPE))
S("Four days later, Armstrong and Aldrin climbed into the lunar module, named Eagle, and began their descent. Collins stayed behind in orbit.",
  stage("space", cam((2.5, -4, 3.0), (2, -3.4, 2.4), (0, 0, 1.5)), props=[P("lunar_module", args={"land": [0, 1.5]}), P("moon_surface")]))
S("Each time Collins passed behind the Moon, he lost all radio contact with Earth for about forty eight minutes. No human had ever been so far from everyone else.",
  stage("space", cam((2.5, -4, 3.0), (2, -3.4, 2.4), (0, 0, 1.5)), props=[P("lunar_module", args={"land": [0, 1.5]}), P("moon_surface")]), still=True)
S("On the way down, the guidance computer flashed alarms they had never seen before, codes twelve oh two and twelve oh one. It was overloaded. Mission control decided to carry on.",
  stage("lab", cam((0, -4.5, 2.5), (0.3, -4.0, 2.3), (0, 1.5, 1.2), lens=28), props=[P("mission_control")],
        texts=[T("1202", (0, 3.4, 2.6), 0.6, (1.0, 0.3, 0.3), pop=0.2)], env_opts=OFFICE))
S("Then Armstrong saw that the computer was steering them into a crater full of boulders. He took manual control, and flew on, searching for a safe spot.",
  stage("space", cam((2.5, -4, 3.0), (1.5, -3.0, 2.2), (0, 0, 1.0)), props=[P("lunar_module", args={"land": [0, 0.9]}), P("moon_surface", args={"craters": 70})]))
S("They touched down with less than a minute of fuel left to spare. Houston, Armstrong radioed, Tranquility Base here. The Eagle has landed.",
  stage("space", MOON, props=[P("lunar_module", args={"land": [0, 0.5]}), P("moon_surface")]))
S("Six and a half hours later, Armstrong stepped onto the surface. That's one small step for man, he said, one giant leap for mankind.",
  stage("space", cam((1.8, -3.4, 1.0), (1.2, -2.6, 0.9), (0.9, -0.9, 0.6)), cast=[who(ASTRO, at=(0.9, -0.9, 0), turn=-40)],
        props=[P("lunar_module"), P("moon_surface", args={"footprints": True})]))
S("Aldrin joined him. They planted a flag, collected rocks, and set up experiments, some of which are still being used today.",
  stage("space", cam((3, -5, 1.6), (2.4, -4.2, 1.5), (0.5, 0, 0.8)), cast=[who(ASTRO, at=(-1.0, -0.6, 0), turn=-20), who(ASTRO, at=(0.9, 0.0, 0), turn=-60)],
        props=[P("lunar_module", (-0.5, 1.2, 0)), P("moon_surface", args={"flag": True, "footprints": True})]), still=True)
S("They spent about two and a half hours outside, and gathered more than twenty kilogrammes of Moon rock. They left behind a plaque that reads: we came in peace for all mankind.",
  stage("space", cam((0.4, -1.4, 1.0), (0.3, -1.2, 0.9), (0, 0, 0.7)), props=[P("lunar_module"), P("moon_surface")],
        texts=[T("WE CAME IN PEACE FOR ALL MANKIND", (0, -0.75, 0.75), 0.04, (1, 1, 1), pop=0.3)]), still=True)
S("When Eagle blasted off to rejoin Collins, the exhaust knocked over the flag they had planted.",
  stage("space", cam((0.4, -1.4, 1.0), (0.3, -1.2, 0.9), (0, 0, 0.7)), props=[P("lunar_module"), P("moon_surface")],
        texts=[T("WE CAME IN PEACE FOR ALL MANKIND", (0, -0.75, 0.75), 0.04, (1, 1, 1), pop=0.3)]), still=True)
S("On the twenty fourth of July, the crew splashed down in the Pacific Ocean. Just in case they had brought back Moon germs, they were kept in quarantine for three weeks.",
  stage("sky", cam((2, -5, 1.2), (1.5, -4.4, 1.1), (0, 0, 0.5)), props=[P("command_module", (0, 0, 0.3), rot=[180, 0, 0])],
        env_opts={"sky": SKY["sky"], "floor": [0.05, 0.25, 0.45]}), still=True)
S("Back on Earth, people wept and cheered in the streets.",
  stage("night", cam((0, -5.5, 1.8), (0.4, -5.0, 1.7), (0, 1, 0.8)), props=[P("houses", args={"on": [0, 0.1]}), P("figures", (0, -1.5, 0), args={"n": 9, "spacing": 0.45})]),
  still=True)

# ===================================================================== LEGACY
S("Between nineteen sixty nine and nineteen seventy two, twelve men walked on the Moon. Since then, no one has gone back.",
  stage("space", MOON, cast=[who(ASTRO, at=(-1.0, -0.6, 0), turn=-20)], props=[P("moon_surface", args={"flag": True, "footprints": True})],
        texts=[T("12", (0, 2, 2.0), 0.6, pop=0.2)]), still=True, chapter="Legacy")
S("In nineteen seventy, an explosion crippled Apollo Thirteen on its way to the Moon. With mission control's help, the crew used the lunar module as a lifeboat, and made it home.",
  stage("space", cam((1.5, -4, 1.4), (1.0, -3.4, 1.2), (0, 0, 0.8)), props=[P("command_module", (0, 0, 0.8), scale=0.7), P("lunar_module", (0, 1.6, 0.0), scale=0.4)],
        bolts=[{"from": [0.6, 0, 0.6], "to": [1.4, -0.3, 0.9], "at": 0.2, "seed": 4, "width": 0.01}]), still=True)
S("The last astronaut to walk on the Moon, Gene Cernan, left in December nineteen seventy two. The Apollo programme had cost around twenty five billion dollars at the time.",
  stage("space", MOON, cast=[who(ASTRO, at=(1.2, -0.6, 0), turn=-40)], props=[P("lunar_module"), P("moon_surface", args={"flag": True, "footprints": True})]), still=True)
S("The race left behind more than footprints. It pushed forward computers, materials, weather satellites and medicine, and inspired a generation to become scientists and engineers.",
  stage("studio", cam((0, -2.6, 1.2), (0.3, -2.2, 1.1), (0, 0, 0.5)),
        props=[P("microchip", (-0.9, 0, 0.05), scale=0.8), P("sputnik", (-0.1, 0.2, 0.6), scale=0.4), P("laptop", (0.8, 0, 0))]), still=True)
S("And it gave us that picture of Earthrise: a reminder that we all share one small planet.",
  stage("space", cam((0, -6, 0.6), (0, -7, 1.6), (0, 6, 0.5), (0, 0, 0.3), 35, 28), props=[P("moon_surface", (0, -2, -0.5), args={"craters": 30})]),
  hold=1.5, chapter="Close")

write(HERE, {
    "slug": "08-moon-race",
    "title": "The Race to the Moon",
    "description": ("From a beeping metal ball called Sputnik to the Eagle landing on the Sea of Tranquility: the Cold War race "
                    "that took humans to the Moon, told in 3D animation."),
    "tags": ["space race", "Apollo 11", "moon landing", "Sputnik", "Yuri Gagarin", "Saturn V", "Neil Armstrong", "NASA", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.32, "sentence_silence": 0.28,
              "pronunciations": {"poyekhali": "pa-yeh-ha-lee", "Gagarin": "Gah-gar-in", "Korolev": "Kor-oh-lyov", "Tereshkova": "Teh-resh-kova", "Leonov": "Lay-oh-nov",
                                 "Vostok": "Voss-tok", "Wernher": "Vair-ner", "N1": "N one", "Laika": "Lie-ka"}},
    "music_mood": "epic",
    "sources": [
        "https://www.nasa.gov/history/apollo-11-mission-overview/",
        "https://history.nasa.gov/sputnik/",
        "https://www.jfklibrary.org/learn/about-jfk/historic-speeches/address-at-rice-university-on-the-nations-space-effort",
        "https://www.nasa.gov/history/the-apollo-guidance-computer/",
        "https://www.esa.int/About_Us/ESA_history/50_years_of_humans_in_space/Yuri_Gagarin",
        "https://www.nasa.gov/image-article/apollo-8-earthrise/",
    ],
}, S.shots)
