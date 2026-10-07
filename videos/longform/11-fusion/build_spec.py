"""Shot list for long-form #11: The Secret Behind Nuclear Fusion.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

SUIT = {"skin": SKIN, "shirt": [0.14, 0.14, 0.17], "pants": [0.14, 0.14, 0.17], "boots": [0.04, 0.03, 0.02]}
EDDINGTON = {"hair": [0.35, 0.3, 0.25], "sleeves": "long", "outfit": SUIT}
BETHE = {"hair": [0.3, 0.25, 0.2], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.3, 0.27, 0.22], "pants": [0.25, 0.23, 0.2]}}
SAKHAROV = {"hair": [0.25, 0.2, 0.15], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.2, 0.22, 0.2]}}
ENGINEER = {"hair": [0.2, 0.15, 0.1], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.9, 0.9, 0.92], "pants": [0.2, 0.25, 0.4], "boots": [0.06, 0.05, 0.04]}}
HALL = {"wall": [0.32, 0.35, 0.4], "world": [0.03, 0.03, 0.04]}
COSMOS = {"horizon": [0.1, 0.03, 0.12], "zenith": [0.0, 0.0, 0.02]}

S = ShotList()
TOK = cam((2.8, -3.8, 2.6), (2.2, -3.2, 2.2), (0, 0, 0.9), lens=30)
REACT = cam((0, -2.8, 0.8), (0.2, -2.4, 0.75), (0, 0, 0.6))

# ===================================================================== HOOK
S("Every second, the Sun turns about six hundred million tonnes of hydrogen into helium.",
  stage("space", cam((0, -6, 0.5), (0.4, -5.2, 0.4), (0, 0, 0.5)), props=[P("sun_ball", (0, 0, 0.5), scale=1.6)]))
S("In the process, around four million tonnes of matter simply disappears, turned into pure energy. That energy is sunlight, and it powers almost all life on Earth.",
  stage("space", cam((0, -4.5, 0.5), (0.3, -4.0, 0.45), (0, 0, 0.5)), props=[P("sun_ball", (0, 0, 0.5), scale=1.2)],
        texts=[T("4,000,000 TONNES / SECOND", (0, -1.6, 2.1), 0.15, pop=0.3)]))
S("For seventy years, scientists have been trying to build a small star here on Earth.",
  stage("lab", TOK, props=[P("tokamak", args={"plasma": [0.2, 0.7]})], env_opts=HALL))
S("If they succeed, it could give us almost limitless clean energy, from fuel found in seawater. This is the secret behind nuclear fusion, and why it's so hard.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.8, 1.15), (0, 0, 1.1)), texts=[T("NUCLEAR FUSION", (0, 0, 1.4), 0.32, (1.0, 0.45, 0.85), pop=0.08),
        T("THE SECRET OF THE STARS", (0, 0, 1.05), 0.11, (1, 1, 1), pop=0.3)], props=[P("fusion_reaction", (0, 0.6, 0.45), scale=0.5, args={"hit": 0.6})], env_opts=COSMOS))

# ===================================================================== WHAT POWERS THE SUN
S("For most of history, nobody knew what made the Sun shine. If it were a giant lump of burning coal, it would have burned out in a few thousand years.",
  stage("space", cam((0, -5, 0.5), (0.4, -4.4, 0.4), (0, 0, 0.5)), props=[P("sun_ball", (0, 0, 0.5), scale=1.3)]), still=True, chapter="What powers the Sun?")
S("The first clue came from Einstein's famous equation: E equals m c squared. A tiny amount of mass can be turned into an enormous amount of energy.",
  stage("lab", cam((0, -3.0, 1.5), (0, -2.6, 1.5), (0, 1.5, 1.6)), props=[P("blackboard", (0, 1.5, 0), args={"lines": ["E = mc²"], "at": 0.15})],
        env_opts={"wall": [0.3, 0.25, 0.2], "world": [0.03, 0.025, 0.02]}), still=True)
S("In nineteen twenty, the British astronomer Arthur Eddington noticed that a helium atom weighs slightly less than the four hydrogen atoms it could be built from.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(EDDINGTON, pose=READ)],
        env_opts={"wall": [0.3, 0.25, 0.2], "world": [0.03, 0.025, 0.02]}), still=True)
S("He suggested that stars shine by fusing hydrogen into helium, and turning that missing mass into energy.",
  stage("studio", REACT, props=[P("fusion_reaction", (0, 0, 0.6), args={"hit": 0.5})], env_opts=COSMOS))
S("In nineteen thirty nine, Hans Bethe worked out the exact nuclear reactions that power the stars. He later won the Nobel Prize for it.",
  stage("lab", cam((0, -3.0, 1.5), (0, -2.6, 1.5), (0, 1.5, 1.6)), cast=[who(BETHE, at=(0.9, 0.6, 0), turn=20, pose=PRESENT)],
        props=[P("blackboard", (-0.3, 1.5, 0), args={"lines": ["p + p → d", "d + p → ³He", "³He + ³He → ⁴He"], "at": 0.1})],
        env_opts={"wall": [0.3, 0.25, 0.2], "world": [0.03, 0.025, 0.02]}), still=True)

# ===================================================================== WHY IT'S HARD
S("So why is fusion so hard? Because atomic nuclei hate each other.",
  stage("studio", REACT, props=[P("fusion_reaction", (0, 0, 0.6), args={"hit": 2})], env_opts=COSMOS), chapter="Why is fusion so hard?")
S("Every nucleus carries a positive electric charge. As two nuclei get close, they push each other away, harder and harder.",
  stage("studio", REACT, props=[P("fusion_reaction", (0, 0, 0.6), args={"hit": 2})],
        texts=[T("+                 +", (0, 0, 0.9), 0.2, (1.0, 0.3, 0.3), pop=0.2)], env_opts=COSMOS))
S("Only if they collide fast enough, can they get close enough for the strong nuclear force to grab hold and fuse them.",
  stage("studio", REACT, props=[P("fusion_reaction", (0, 0, 0.6), args={"hit": 0.55})], env_opts=COSMOS))
S("Speed means heat. In the Sun's core, the temperature is about fifteen million degrees, and the crushing weight of the Sun squeezes nuclei together.",
  stage("studio", cam((0.6, -4, 1.3), (0.4, -3.6, 1.2), (0.6, 0, 1.1)), props=[P("thermometer", args={"top_label": "15,000,000 °C"}), P("sun_ball", (1.4, 1, 1.2), scale=0.6)],
        env_opts=COSMOS))
S("On Earth, we can't recreate that pressure. So we need to go much hotter: about a hundred and fifty million degrees, ten times hotter than the centre of the Sun.",
  stage("studio", cam((0.6, -4, 1.3), (0.4, -3.6, 1.2), (0.6, 0, 1.1)), props=[P("thermometer", args={"top_label": "150,000,000 °C"}), P("sun_ball", (1.4, 1, 1.2), scale=0.6)],
        env_opts=COSMOS))
S("At that temperature, matter becomes plasma: a glowing soup of bare nuclei and electrons. And no material container could hold it. It would vaporise the walls.",
  stage("lab", cam((1.6, -2.4, 1.6), (1.2, -2.0, 1.4), (0, 0, 0.9)), props=[P("tokamak", args={"plasma": [0.0, 0.3]})], env_opts=HALL))
S("The best fuel is two heavy forms of hydrogen: deuterium, which can be extracted from ordinary seawater, and tritium, which can be made from lithium.",
  stage("studio", REACT, props=[P("fusion_reaction", (0, 0, 0.6), args={"hit": 0.7})], texts=[T("DEUTERIUM", (-0.9, 0, 1.0), 0.09, pop=0.1), T("TRITIUM", (0.9, 0, 1.0), 0.09, pop=0.2)],
        env_opts=COSMOS))
S("When they fuse, they make helium, and a fast neutron carrying most of the energy.",
  stage("studio", REACT, props=[P("fusion_reaction", (0, 0, 0.6), args={"hit": 0.3})], env_opts=COSMOS))

# ===================================================================== THE TOKAMAK
S("The answer to holding plasma came from the Soviet Union. In the early nineteen fifties, physicists Igor Tamm and Andrei Sakharov proposed trapping it with magnetic fields.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(SAKHAROV, pose=PRESENT)], env_opts={"wall": [0.25, 0.2, 0.18], "world": [0.02, 0.02, 0.015]}),
  still=True, chapter="The magnetic bottle")
S("Charged particles spiral around magnetic field lines. Bend those lines into a ring, and the plasma can circle forever without touching the walls.",
  stage("lab", cam((0, -3.4, 3.0), (0.4, -3.0, 2.8), (0, 0, 0.9), lens=30), props=[P("tokamak", args={"plasma": [0.1, 0.4], "cutaway": False})], env_opts=HALL))
S("The design was called a tokamak, a Russian acronym for a toroidal chamber with magnetic coils: a doughnut-shaped magnetic bottle.",
  stage("lab", TOK, props=[P("tokamak", args={"plasma": [0.1, 0.5]})], texts=[T("TOKAMAK", (0, 1.5, 2.6), 0.25, pop=0.3)], env_opts=HALL))
S("In nineteen sixty eight, a Soviet tokamak called T-three reached around ten million degrees. Western scientists were sceptical, so a British team flew to Moscow with lasers to measure it. The Soviets were right.",
  stage("lab", TOK, props=[P("tokamak", args={"plasma": [0.0, 0.2]}), P("laser_target", (2.2, 0, 1.6), scale=0.3, args={"fire": 0.5, "beams": 6})],
        texts=[T("T-3  1968", (-1.5, 1.0, 2.4), 0.2, pop=0.2)], env_opts=HALL))
S("Soon, tokamaks were being built all over the world.",
  stage("lab", cam((0, -6.0, 3.0), (0.6, -5.4, 2.8), (0, 2, 0.8), lens=26), props=[P("tokamak", (-2.6, 2, 0), scale=0.6), P("tokamak", (0, 3, 0), scale=0.6),
        P("tokamak", (2.6, 2, 0), scale=0.6)], env_opts=HALL), still=True)

# ===================================================================== RECORDS
S("The biggest was JET, the Joint European Torus, in England. In nineteen ninety seven, it produced sixteen megawatts of fusion power.",
  stage("lab", TOK, props=[P("tokamak", args={"plasma": [0.1, 0.4]})], texts=[T("JET  1997  16 MW", (0, 1.5, 2.6), 0.2, pop=0.3)], env_opts=HALL),
  chapter="Chasing break-even")
S("But that took more power to run than it produced. The holy grail is to get more energy out of the fuel than you put in to heat it.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.1, 0.95), (0, 0, 0.8)), texts=[T("ENERGY OUT  >  ENERGY IN", (0, 0, 1.0), 0.15, (0.4, 1.0, 0.6), pop=0.2)], env_opts=COSMOS),
  still=True, still_at=0.8)
S("In twenty twenty three, in its final experiments before closing, JET set a world record: sixty nine megajoules of energy in five seconds, from a fraction of a milligramme of fuel.",
  stage("lab", TOK, props=[P("tokamak", args={"plasma": [0.05, 0.3]})], texts=[T("69 MJ", (0, 1.5, 2.6), 0.4, pop=0.4)], env_opts=HALL))
S("There's another way to do fusion. Instead of holding plasma steady, you can crush a tiny pellet of fuel so fast that it fuses before it can fly apart.",
  stage("studio", cam((1.5, -3.0, 1.6), (1.2, -2.6, 1.4), (0, 0, 1.0)), props=[P("laser_target", (0, 0, 1.0), args={"fire": 0.6})], env_opts=COSMOS))
S("At the National Ignition Facility in California, a hundred and ninety two giant lasers fire at a capsule the size of a peppercorn.",
  stage("studio", cam((2.5, -4.0, 2.4), (2.0, -3.4, 2.0), (0, 0, 1.0)), props=[P("laser_target", (0, 0, 1.0), args={"beams": 96, "fire": 0.5})], env_opts=COSMOS))
S("On the fifth of December, twenty twenty two, for the first time, the fusion reactions released more energy than the laser light delivered to the target: three point one five megajoules out, from two point oh five in.",
  stage("studio", cam((0.6, -1.4, 1.2), (0.4, -1.1, 1.1), (0, 0, 1.0)), props=[P("laser_target", (0, 0, 1.0), args={"fire": 0.35})],
        texts=[T("3.15 MJ OUT  /  2.05 MJ IN", (0, 0.5, 1.55), 0.12, pop=0.5)], env_opts=COSMOS))
S("It was a historic milestone called ignition. The lasers themselves still used far more electricity than the fusion produced. But it proved the physics works, and the team has since beaten that result.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("IGNITION", (0, 0, 1.05), 0.3, (1.0, 0.8, 0.3), pop=0.15)], env_opts=COSMOS),
  still=True, still_at=0.8)

# ===================================================================== ITER & FUTURE
S("Now, thirty five countries are building the biggest tokamak ever, ITER, in the south of France.",
  stage("lab", cam((0, -9, 4.0), (1.0, -8, 3.6), (0, 0, 1.2), lens=26), cast=[who(ENGINEER, at=(2.4, -2.0, 0), turn=-30)], props=[P("tokamak", scale=1.8)], env_opts=HALL),
  chapter="Building a star")
S("Its magnets will be cooled to minus two hundred and sixty nine degrees, just a few degrees above absolute zero, while the plasma inside reaches a hundred and fifty million. Some of the coldest and hottest places in the solar system, a few metres apart.",
  stage("lab", TOK, props=[P("tokamak", args={"plasma": [0.1, 0.5]})], texts=[T("−269 °C", (-1.8, 0, 2.2), 0.2, (0.4, 0.8, 1.0), pop=0.2),
        T("150,000,000 °C", (1.4, 0, 2.2), 0.18, (1.0, 0.45, 0.85), pop=0.45)], env_opts=HALL))
S("ITER is designed to produce ten times more fusion power than it uses to heat its plasma. It has faced long delays, and full operations are now planned for the late twenty thirties.",
  stage("lab", cam((0, -9, 4.0), (0.6, -8.4, 3.8), (0, 0, 1.2), lens=26), props=[P("tokamak", scale=1.8, args={"plasma": [0.2, 0.8]})],
        texts=[T("Q = 10", (0, 2, 4.6), 0.4, pop=0.3)], env_opts=HALL))
S("Meanwhile, dozens of private companies are racing to build smaller, cheaper reactors, using powerful new superconducting magnets and clever designs.",
  stage("lab", cam((0, -6.0, 3.0), (0.6, -5.4, 2.8), (0, 2, 0.8), lens=26),
        props=[P("tokamak", (-2.2, 2, 0), scale=0.45), P("tokamak", (0, 3, 0), scale=0.45, args={"cutaway": False}), P("laser_target", (2.4, 2, 1.0), scale=0.4, args={"fire": 0.5})],
        env_opts=HALL))

# ===================================================================== WHY IT MATTERS
S("Why does it matter so much? Because fusion fuel is incredibly concentrated.",
  stage("studio", cam((0, -2.0, 0.6), (0, -1.8, 0.55), (0, 0, 0.2)), props=[P("vials", args={"n": 1, "label": "D + T"})], env_opts=COSMOS), still=True,
  chapter="Why it matters")
S("Fusion reactions release millions of times more energy per kilogramme than burning coal, oil or gas. A pineapple-sized amount of fuel could match thousands of tonnes of coal.",
  stage("studio", cam((0, -2.6, 1.2), (0, -2.3, 1.1), (0, 0, 0.6)), props=[P("cantaloupe", (-0.6, 0, 0), scale=1.5, args={"mould": False}),
        P("crates", (0.8, 0.5, 0), scale=0.8, args={"label": "COAL", "n": 6})], env_opts=COSMOS), still=True)
S("It produces no carbon dioxide. And unlike today's nuclear power, it can't melt down. If anything goes wrong, the plasma simply cools and the reaction stops.",
  stage("lab", TOK, props=[P("tokamak", args={"plasma": [0.0, 0.01]})], env_opts=HALL))
S("It does create some radioactivity, as neutrons hit the reactor walls, but far less long-lived waste than fission.",
  stage("studio", cam((0.3, -1.2, 0.6), (0.2, -1.0, 0.55), (0, 0, 0.2)), props=[P("geiger", args={"clicks": [[0, -40], [0.4, -20], [0.8, -30]]})], env_opts=COSMOS),
  still=True)
S("Scientists like to joke that fusion power is always thirty years away. But the experiments of the last few years have brought it closer than ever before.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.1, 0.95), (0, 0, 0.8)), texts=[T("ALWAYS 30 YEARS AWAY?", (0, 0, 1.0), 0.16, pop=0.2)], env_opts=COSMOS), still=True, still_at=0.8)

# ===================================================================== CLOSE
S("For billions of years, fusion has lit up the universe. Every atom of carbon in your body, and the oxygen you breathe, was forged by fusion inside ancient stars.",
  stage("space", cam((0, -6, 0.5), (0.3, -5.4, 0.6), (0, 0, 0.5)), props=[P("sun_ball", (0, 0, 0.5), scale=1.2)]), chapter="Close")
S("Now, we're trying to light that same fire here on Earth.",
  stage("lab", cam((0.6, -1.4, 1.2), (3.2, -4.4, 2.6), (0, 0, 0.9), (0, 0, 0.9), 28, 30), props=[P("tokamak", args={"plasma": [0.0, 0.4]})], env_opts=HALL), hold=1.5)

write(HERE, {
    "slug": "11-fusion",
    "title": "The Secret Behind Nuclear Fusion",
    "description": ("How the Sun shines, why fusion needs temperatures ten times hotter than its core, and how tokamaks, lasers and ITER "
                    "are trying to build a star on Earth, told in 3D animation."),
    "tags": ["nuclear fusion", "tokamak", "ITER", "National Ignition Facility", "JET", "plasma", "clean energy", "physics", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.25, "sentence_silence": 0.28,
              "pronunciations": {"Eddington": "Edd-ing-ton", "Bethe": "Bay-tuh", "Tamm": "Tahm", "Sakharov": "Sah-ka-rov",
                                 "tokamak": "toe-ka-mak", "ITER": "Eater", "JET": "Jet", "megajoules": "mega-jools", "T-three": "T three"}},
    "music_mood": "epic",
    "sources": [
        "https://www.iter.org/mach",
        "https://lasers.llnl.gov/science/achieving-fusion-ignition",
        "https://euro-fusion.org/eurofusion-news/european-researchers-achieve-fusion-energy-record/",
        "https://www.nobelprize.org/prizes/physics/1967/bethe/facts/",
        "https://www.iaea.org/fusion-energy",
        "https://www.energy.gov/science/doe-explainsnuclear-fusion-reactions",
    ],
}, S.shots)
