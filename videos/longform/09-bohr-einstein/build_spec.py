"""Shot list for long-form #9: The Scientist Who Challenged Einstein (Niels Bohr).  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

SUIT = {"skin": SKIN, "shirt": [0.14, 0.14, 0.17], "pants": [0.14, 0.14, 0.17], "boots": [0.04, 0.03, 0.02]}
BOHR = {"hair": [0.3, 0.22, 0.15], "sleeves": "long", "outfit": SUIT}
EINSTEIN = {"hair": [0.8, 0.8, 0.8], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.3, 0.27, 0.22], "pants": [0.25, 0.22, 0.2]}}
HEISENBERG = {"hair": [0.6, 0.45, 0.25], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.2, 0.25, 0.3]}}
SCIENTIST = {"hair": [0.2, 0.15, 0.1], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.25, 0.22, 0.2]}}
STUDY = {"wall": [0.3, 0.25, 0.2], "world": [0.03, 0.025, 0.02]}
HALL = {"wall": [0.45, 0.42, 0.38], "world": [0.04, 0.04, 0.035]}
DEEP = {"horizon": [0.06, 0.03, 0.15], "zenith": [0.0, 0.0, 0.02]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
TWO = cam((0, -2.6, 1.6), (0.2, -2.2, 1.5), (0, 0.3, 1.25))

# ===================================================================== HOOK
S("Albert Einstein is the most famous scientist who ever lived. But for thirty years, one man kept telling him he was wrong.",
  stage("lab", TWO, cast=[who(EINSTEIN, at=(-0.5, 0.35, 0), turn=-20, pose=PRESENT), who(BOHR, at=(0.5, 0.35, 0), turn=20, pose=PRESENT)], env_opts=STUDY), still=True)
S("Their argument was about the deepest question in physics: is the universe, at its smallest scale, certain? Or is it ruled by chance?",
  stage("studio", cam((0, -2.6, 0.9), (0.2, -2.3, 0.85), (0, 0, 0.4)), props=[P("dice", args={"roll": [0.1, 0.5]}), P("bohr_atom", (0, 0.6, 0.6), scale=0.8)],
        env_opts=DEEP))
S("Einstein famously said: God does not play dice. His rival's reply? Stop telling God what to do.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("“GOD DOES NOT PLAY DICE”", (0, 0, 1.15), 0.13, pop=0.1),
        T("“STOP TELLING GOD WHAT TO DO”", (0, 0, 0.8), 0.11, (0.5, 0.85, 1.0), pop=0.55)], env_opts=DEEP), still=True, still_at=0.85)
S("The man who challenged Einstein was the Danish physicist Niels Bohr. And in the end, experiments proved Bohr right.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.8, 1.15), (0, 0, 1.1)), texts=[T("NIELS BOHR", (0, 0, 1.45), 0.28, pop=0.08),
        T("THE SCIENTIST WHO CHALLENGED EINSTEIN", (0, 0, 1.12), 0.1, (0.5, 0.85, 1.0), pop=0.25)], props=[P("bohr_atom", (0, 0.6, 0.5), scale=0.7)], env_opts=DEEP))

# ===================================================================== BOHR'S ATOM
S("Bohr was born in Copenhagen in eighteen eighty five, into a family of scholars. He was also a talented football goalkeeper. His brother Harald played for Denmark at the Olympics.",
  stage("sky", cam((0, -3.0, 1.5), (0.3, -2.6, 1.4), (0, 0, 1.0)), cast=[who(BOHR, pose=STAND, scale=0.85)], props=[P("bulb", (0.7, 0, 0.0), scale=1.5, args={"on": 2})],
        texts=[T("COPENHAGEN 1885", (0.45, 0.5, 1.75), 0.15, pop=0.2)], env_opts={"sky": {"horizon": [0.8, 0.85, 0.95], "zenith": [0.2, 0.4, 0.8]}, "floor": [0.2, 0.5, 0.2]}),
  still=True, chapter="Bohr's atom")
S("In the early nineteen hundreds, nobody understood atoms. Experiments showed a tiny, heavy nucleus with electrons around it, but by the known laws of physics, the electrons should spiral inwards and crash in a fraction of a second.",
  stage("studio", cam((0, -2.2, 0.9), (0, -1.9, 0.8), (0, 0, 0.6)), props=[P("bohr_atom", (0, 0, 0.6), args={"orbits": 1})]))
S("In nineteen thirteen, Bohr proposed a bold fix. Electrons could only travel in certain fixed orbits, like rungs on a ladder.",
  stage("studio", cam((0, -2.2, 0.9), (0.2, -1.9, 0.8), (0, 0, 0.6)), props=[P("bohr_atom", (0, 0, 0.6), args={"orbits": 4})], texts=[T("1913", (1.0, 0.4, 1.2), 0.2, pop=0.2)]))
S("When an electron jumped down from a higher orbit to a lower one, it gave out a flash of light of one exact colour.",
  stage("studio", cam((0.3, -1.9, 0.8), (0.2, -1.6, 0.75), (0.2, 0, 0.6)), props=[P("bohr_atom", (0, 0, 0.6), args={"jump": [0.35, 2, 0]})]))
S("It explained the strange bar-code of colours that hydrogen gives off when it glows. Bohr won the Nobel Prize in nineteen twenty two.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)),
        props=[P("bulb", (x, 0, 0.6), args={"on": 0.1 + 0.15 * i, "color": c, "strength": 15})
                                                                                      for i, (x, c) in enumerate(((-0.6, (1.0, 0.1, 0.1)), (-0.1, (0.2, 0.8, 1.0)), (0.35, (0.3, 0.3, 1.0)), (0.7, (0.6, 0.2, 1.0))))],
        texts=[T("NOBEL 1922", (0, 0, 1.25), 0.15, pop=0.6)]))
S("But Bohr's model was only a start. In the nineteen twenties, a group of young physicists, many of them working at Bohr's institute in Copenhagen, built a whole new theory: quantum mechanics.",
  stage("lab", cam((0, -3.0, 1.7), (0.3, -2.6, 1.6), (0, 0.3, 1.1)),
        cast=[who(BOHR, at=(-0.9, 0.35, 0), turn=-15, pose=PRESENT), who(HEISENBERG, at=(0, 0.45, 0), pose=STAND), who(SCIENTIST, at=(0.9, 0.35, 0), turn=15, pose=READ)],
        props=[P("blackboard", (0, 1.5, 0), args={"lines": ["Δx Δp ≥ ħ/2", "iħ ∂ψ/∂t = Hψ"]})], env_opts=STUDY), still=True,
  chapter="A strange new theory")

# ===================================================================== QUANTUM WEIRDNESS
S("Bohr and Einstein first met in Berlin in nineteen twenty, and liked each other at once. Einstein wrote that not often in life had a person given him such joy just by being there.",
  stage("lab", TWO, cast=[who(EINSTEIN, at=(-0.5, 0.35, 0), turn=-25, pose=PRESENT), who(BOHR, at=(0.5, 0.35, 0), turn=25, pose=PRESENT)],
        texts=[T("BERLIN 1920", (0, 0.9, 2.0), 0.15, pop=0.2)], env_opts=STUDY), still=True)
S("Years later, on a visit to Copenhagen, they got so absorbed arguing on a tram that they missed their stop, rode back, and missed it again.",
  stage("street", cam((2.5, -3.0, 2.0), (2.0, -2.4, 1.8), (0, 1, 1.0), lens=30), cast=[who(EINSTEIN, at=(-0.35, 0.5, 0), turn=-30, pose=PRESENT), who(BOHR, at=(0.35, 0.5, 0), turn=30, pose=PRESENT)],
        props=[P("street_lamps", (-1.5, -1, 0), args={"n": 4, "on": [0, 0.01]})]), still=True)
S("Quantum mechanics made astonishingly accurate predictions. But it described the world in a deeply strange way.",
  stage("studio", cam((-1.6, -2.2, 1.3), (-1.2, -1.9, 1.1), (0.2, 0, 0.4)), props=[P("double_slit", args={"build": [0.05, 0.9]})], env_opts=DEEP))
S("Fire single particles, like electrons, at a wall with two slits, and they land one by one on the screen behind, like tiny bullets.",
  stage("studio", cam((-1.6, -2.2, 1.3), (-1.2, -1.9, 1.1), (0.2, 0, 0.4)), props=[P("double_slit", args={"build": [0.1, 0.4]})], env_opts=DEEP))
S("But as more arrive, they build up a pattern of stripes, the kind of pattern only waves make, as if each particle went through both slits at once.",
  stage("studio", cam((0.4, -1.0, 0.5), (0.5, -0.8, 0.45), (1.2, 0, 0.4)), props=[P("double_slit", args={"build": [0.0, 0.95], "particles": False})], env_opts=DEEP))
S("According to quantum mechanics, before you look, a particle doesn't have one definite position. It has only probabilities. Measurement forces a result, and which result is down to pure chance.",
  stage("studio", cam((0, -1.5, 0.6), (0, -1.3, 0.55), (0, 0, 0.3)), props=[P("dice", args={"n": 3, "roll": [0.1, 0.6]})], env_opts=DEEP))
S("Werner Heisenberg showed that you can't even know a particle's exact position and its exact speed at the same time. This is the uncertainty principle.",
  stage("lab", cam((0, -3.0, 1.5), (0, -2.6, 1.5), (0, 1.5, 1.6)), props=[P("blackboard", (0, 1.5, 0), args={"lines": ["Δx · Δp ≥ ħ / 2"], "at": 0.2})],
        env_opts=STUDY), still=True)
S("Bohr embraced all of this. Einstein, who had helped to start quantum physics, could not accept it.",
  stage("lab", TWO, cast=[who(BOHR, at=(-0.5, 0.35, 0), turn=-20, pose=PRESENT), who(EINSTEIN, at=(0.5, 0.35, 0), turn=20, pose={**STAND, "head_nod": 8})], env_opts=STUDY),
  still=True)
S("In nineteen oh five, Einstein had shown that light comes in little packets of energy, which we now call photons. That's what won him his own Nobel Prize.",
  stage("studio", cam((0.3, -1.9, 0.8), (0.2, -1.6, 0.75), (0.2, 0, 0.6)), props=[P("bohr_atom", (0, 0, 0.6), args={"jump": [0.2, 1, 0], "orbits": 2})],
        texts=[T("E = hν", (0.9, 0.3, 1.0), 0.15, pop=0.4)], env_opts=DEEP))
S("But a universe run on chance? Einstein believed there must be a deeper reality underneath, where everything had a definite cause.",
  stage("lab", cam((0.5, -1.8, 1.6), (0.35, -1.5, 1.6), "cast0.head"), cast=[who(EINSTEIN, pose=LOOK_UP)], env_opts=STUDY), still=True)
S("In a letter in nineteen twenty six, he wrote that he was convinced God does not throw dice.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.95)), props=[TABLE, P("notebook", (0, -0.1, TOP)), P("candle", (0.4, 0, TOP)),
        P("dice", (-0.35, -0.1, TOP), args={"roll": [0.0, 0.01]})], env_opts=STUDY), still=True)

# ===================================================================== SOLVAY
S("He wasn't alone. Erwin Schr\u00f6dinger, who had written quantum mechanics' most famous equation, imagined a cat in a box that, according to the theory, would be both alive and dead until someone looked.",
  stage("studio", cam((0.4, -1.4, 0.7), (0.3, -1.2, 0.65), (0, 0, 0.3)), props=[P("photon_box", (0, 0, -0.65), scale=0.7, args={"open_at": 2}), P("dice", (0.5, -0.2, 0), args={"n": 1})],
        texts=[T("ALIVE + DEAD?", (0, 0.3, 0.9), 0.12, pop=0.3)], env_opts=DEEP), still=True)
S("The showdown came in October nineteen twenty seven, at the Solvay Conference in Brussels.",
  stage("hall", cam((0, -4.0, 1.8), (0.2, -3.6, 1.7), (0, 0.6, 1.1)),
        cast=[who(EINSTEIN, at=(-0.6, 0.3, 0)), who(BOHR, at=(0.6, 0.3, 0)), who(HEISENBERG, at=(0, 0.9, 0)), who(SCIENTIST, at=(-1.3, 0.8, 0)), who(SCIENTIST | {"hair": [0.5, 0.45, 0.4]}, at=(1.3, 0.8, 0))],
        texts=[T("SOLVAY 1927", (0, 1.6, 2.4), 0.2, pop=0.2)], env_opts=HALL), still=True, chapter="The Solvay showdown")
S("It was perhaps the most famous gathering in the history of science. Seventeen of the twenty nine people in the official photograph won a Nobel Prize, including Marie Curie, who won two.",
  stage("hall", cam((0, -4.8, 1.8), (0.2, -4.4, 1.7), (0, 0.8, 1.0), lens=30),
        cast=[who(SCIENTIST | {"hair": [0.15 + 0.1 * (i % 4), 0.12, 0.1]}, at=((i % 6 - 2.5) * 0.6, 0.3 + (i // 6) * 0.7, (i // 6) * 0.3), scale=0.95) for i in range(12)],
        env_opts=HALL), still=True)
S("The official topic was electrons and photons. The real topic, everyone knew, was whether quantum mechanics told the whole truth about nature.",
  stage("hall", cam((0, -4.8, 1.8), (0.2, -4.4, 1.7), (0, 0.8, 1.0), lens=30),
        cast=[who(SCIENTIST | {"hair": [0.15 + 0.1 * (i % 4), 0.12, 0.1]}, at=((i % 6 - 2.5) * 0.6, 0.3 + (i // 6) * 0.7, (i // 6) * 0.3), scale=0.95) for i in range(12)],
        env_opts=HALL), still=True)
S("Each morning at breakfast, Einstein would present a clever thought experiment designed to break quantum mechanics.",
  stage("lab", TWO, cast=[who(EINSTEIN, at=(-0.5, 0.35, 0), turn=-20, pose=PRESENT), who(BOHR, at=(0.5, 0.35, 0), turn=20, pose=READ)],
        props=[TABLE, P("bottle", (0.3, -0.1, TOP), args={"label": ""})], env_opts=HALL))
S("Bohr would worry about it all day. And by dinner, he usually had an answer.",
  stage("lab", cam((0.5, -1.8, 1.6), (0.35, -1.5, 1.6), "cast0.head"), cast=[who(BOHR, pose={**STAND, "head_nod": 15})],
        props=[P("blackboard", (0, 1.5, 0), args={"lines": ["?"]})], env_opts=HALL))
S("Einstein came back in nineteen thirty with his cleverest challenge: a box full of light, hanging from a spring scale, with a clock inside that opens a shutter to let out a single photon.",
  stage("studio", cam((1.2, -2.6, 1.3), (1.0, -2.2, 1.2), (0.3, 0, 1.0)), props=[P("photon_box", args={"open_at": 0.6})], env_opts=DEEP), chapter="Einstein's light box")
S("By weighing the box before and after, he argued, you could know both the exact energy of the photon and the exact time it left. That would break Heisenberg's uncertainty principle.",
  stage("studio", cam((0.8, -1.6, 1.1), (0.6, -1.4, 1.05), (0, 0, 1.0)), props=[P("photon_box", args={"open_at": 0.3})], env_opts=DEEP))
S("Bohr was shaken. A colleague said he looked like a man in shock.",
  stage("hall", cam((0.5, -1.8, 1.6), (0.35, -1.5, 1.6), "cast0.head"), cast=[who(BOHR, pose={**STAND, "head_nod": 20})], env_opts=HALL), still=True)
S("But after a sleepless night, he found the flaw, using Einstein's own theory of general relativity. When the box moves in gravity, its clock runs at a slightly different rate. The uncertainty was restored.",
  stage("studio", cam((1.2, -2.6, 1.3), (1.0, -2.2, 1.2), (0.3, 0, 1.0)), props=[P("photon_box", args={"open_at": 0.2})],
        env_opts=DEEP))

# ===================================================================== EPR
S("Einstein changed tactics. In nineteen thirty five, with Boris Podolsky and Nathan Rosen, he published a paper arguing that quantum mechanics must be incomplete.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "CAN QUANTUM-MECHANICAL DESCRIPTION OF PHYSICAL REALITY BE CONSIDERED COMPLETE?", "n": 2})]),
  still=True, still_at=0.7, chapter="Spooky action at a distance")
S("The theory predicts that two particles can become entangled. Separate them, even by vast distances, and measuring one instantly affects what you will find when you measure the other.",
  stage("studio", cam((0, -3.0, 0.8), (0, -2.6, 0.75), (0, 0, 0.5)), props=[P("entangled", (0, 0, 0.5), args={"apart": [0.1, 0.5], "measure": 0.75})], env_opts=DEEP))
S("Einstein thought that was absurd. He later called it spooky action at a distance. Surely, he said, the particles must have carried hidden instructions all along.",
  stage("lab", cam((0.5, -1.8, 1.6), (0.35, -1.5, 1.6), "cast0.head"), cast=[who(EINSTEIN, pose=PRESENT)], env_opts=STUDY), still=True)
S("Bohr replied that it makes no sense to talk about properties that haven't been measured. For the rest of their lives, neither man convinced the other.",
  stage("lab", TWO, cast=[who(EINSTEIN, at=(-0.5, 0.35, 0), turn=-20, pose=STAND), who(BOHR, at=(0.5, 0.35, 0), turn=20, pose=PRESENT)], env_opts=STUDY), still=True)
S("Einstein spent his last years searching for a deeper theory that would make chance disappear. He died in nineteen fifty five, without finding it.",
  stage("lab", TWO, cast=[who(EINSTEIN, at=(-0.5, 0.35, 0), turn=-20, pose=STAND), who(BOHR, at=(0.5, 0.35, 0), turn=20, pose=PRESENT)], env_opts=STUDY), still=True)
S("Yet they remained deep friends. And when Bohr died in nineteen sixty two, the last drawing on his blackboard was a sketch of Einstein's light box.",
  stage("lab", cam((0.2, -1.4, 1.5), (0.1, -1.2, 1.45), (0, 1.4, 1.35)), props=[P("blackboard", (0, 1.5, 0), args={"lines": [""]}), P("photon_box", (0, 1.4, 1.2), scale=0.8)],
        env_opts={"wall": [0.08, 0.08, 0.09], "world": [0.01, 0.01, 0.01]}), still=True)

# ===================================================================== WAR
S("During the Second World War, Bohr, whose mother was Jewish, fled Nazi-occupied Denmark by fishing boat to Sweden in nineteen forty three.",
  stage("night", cam((0, -5.5, 1.4), (0.4, -5.0, 1.3), (0, 0, 0.6)), props=[P("route", (0, 0, 0.05), scale=0.8, args={"stops": ["COPENHAGEN", "SWEDEN"]})]),
  still=True, chapter="Escape")
S("He was then flown to Britain lying in the empty bomb bay of a fast Mosquito aircraft. His oxygen mask didn't fit his large head, and he passed out on the way.",
  stage("night", cam((0, -5.5, 3.0), (0.3, -5.0, 3.1), (0, 3, 3.2)), props=[P("airliner", (0, 3, 3.2), scale=0.9, rot=[0, 0, -90], anim=[[0, {"at": [-5, 3, 3.0]}], [1, {"at": [5, 3, 3.4]}]])]))

# ===================================================================== VERDICT
S("Earlier, when the Nazis invaded Denmark in nineteen forty, a chemist at Bohr's institute, George de Hevesy, dissolved two colleagues' gold Nobel medals in acid to hide them. After the war, the gold was recovered and the medals recast.",
  stage("studio", cam((0.25, -0.75, 0.35), (0.18, -0.65, 0.32), (0, 0, 0.1)), props=[P("glassware", (0, 0.05, 0), args={"n": 1, "colors": [[0.9, 0.75, 0.2]]}), P("medal", (0.25, 0, 0.12), scale=0.8)]),
  still=True)
S("Bohr went on to Los Alamos, under the false name Nicholas Baker, as an adviser on the atomic bomb. He urged Churchill and Roosevelt to share atomic secrets with the world, to avoid an arms race. Churchill wanted him watched.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(BOHR, pose=PRESENT)], env_opts={"wall": [0.3, 0.32, 0.36], "world": [0.03, 0.03, 0.035]}),
  still=True)
S("For decades, the Bohr-Einstein debate seemed like philosophy. Nobody could see how to test it.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("BOHR  ?  EINSTEIN", (0, 0, 1.0), 0.22, pop=0.1)], env_opts=DEEP), still=True, still_at=0.8,
  chapter="The verdict")
S("Then, in nineteen sixty four, the Northern Irish physicist John Bell found a way. He showed that hidden instructions and quantum mechanics predict measurably different results.",
  stage("lab", cam((0, -3.0, 1.5), (0, -2.6, 1.5), (0, 1.5, 1.6)), props=[P("blackboard", (0, 1.5, 0), args={"lines": ["|S| ≤ 2", "QUANTUM: 2√2"], "at": 0.2})],
        env_opts=STUDY), still=True)
S("Bell worked at the particle physics lab CERN, near Geneva. He did this work on the side, almost as a hobby, and it became one of the most important results in physics.",
  stage("lab", cam((0, -3.0, 1.5), (0, -2.6, 1.5), (0, 1.5, 1.6)), props=[P("blackboard", (0, 1.5, 0), args={"lines": ["|S| ≤ 2", "QUANTUM: 2√2"], "at": 0.2})],
        env_opts=STUDY), still=True)
S("Experiments by John Clauser in the nineteen seventies, and Alain Aspect in the nineteen eighties, tested Bell's idea with entangled particles of light.",
  stage("studio", cam((0, -3.0, 0.8), (0.3, -2.6, 0.75), (0, 0, 0.5)), props=[P("entangled", (0, 0, 0.5), args={"apart": [0.05, 0.4], "measure": 0.6})], env_opts=DEEP))
S("Again and again, quantum mechanics won. The universe really is as strange as Bohr said.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("QUANTUM MECHANICS WINS", (0, 0, 1.0), 0.16, (0.4, 1.0, 0.6), pop=0.2)], env_opts=DEEP),
  still=True, still_at=0.8)
S("In twenty twenty two, Aspect, Clauser and Anton Zeilinger shared the Nobel Prize in Physics for this work.",
  stage("hall", cam((0, -2.8, 1.6), (0, -2.4, 1.5), (0, 0.4, 1.2)),
        cast=[who(SCIENTIST, at=(-0.75, 0.35, 0), turn=-10), who(SCIENTIST | {"hair": [0.7, 0.7, 0.7]}, at=(0, 0.45, 0)), who(SCIENTIST | {"hair": [0.4, 0.35, 0.3]}, at=(0.75, 0.35, 0), turn=10)],
        props=[P("medal", (0, -0.2, 1.75), spin=["z", 40])], texts=[T("NOBEL 2022", (0, 0.2, 2.05), 0.13, pop=0.2)]), still=True)
S("Today, entanglement is no longer just an argument. It's the basis of quantum computers and ultra-secure quantum communication.",
  stage("studio", cam((0.3, -0.7, 0.45), (0.2, -0.55, 0.38), (0, 0, 0.03)), props=[P("microchip", args={"glow": [0.1, 0.5]}), P("entangled", (0, 0.4, 0.3), scale=0.3)],
        env_opts=DEEP))

# ===================================================================== CLOSE
S("In twenty seventeen, a Chinese satellite called Micius sent entangled particles of light to two ground stations more than twelve hundred kilometres apart. They stayed linked, just as Bohr's quantum mechanics predicted.",
  stage("studio", cam((0.3, -0.7, 0.45), (0.2, -0.55, 0.38), (0, 0, 0.03)), props=[P("microchip", args={"glow": [0.1, 0.5]}), P("entangled", (0, 0.4, 0.3), scale=0.3)],
        env_opts=DEEP), still=True)
S("When Denmark gave Bohr its highest honour, he designed his own coat of arms, with the Chinese yin-yang symbol and a Latin motto: opposites are complementary.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("CONTRARIA SUNT COMPLEMENTA", (0, 0, 1.0), 0.12, pop=0.15)],
        props=[P("medal", (0, 0.3, 0.55), scale=2.0)], env_opts=DEEP), still=True, still_at=0.8)
S("Element number one hundred and seven, bohrium, is named after him. And the institute he founded in Copenhagen still carries his name.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("Bh", (0, 0, 1.1), 0.4, pop=0.1), T("107", (-0.3, 0, 1.4), 0.1, (1, 1, 1), pop=0.2)]),
  still=True, still_at=0.8)
S("Einstein lost the argument. But by pushing so hard, he forced quantum mechanics to explain itself, and revealed its strangest feature.",
  stage("lab", cam((0.5, -1.8, 1.6), (0.35, -1.5, 1.6), "cast0.head"), cast=[who(EINSTEIN, pose={**STAND, "head_nod": 10})], env_opts=STUDY), still=True,
  chapter="Close")
S("Sometimes, the greatest gift a scientist can give is a really good objection.",
  stage("lab", cam((0, -2.0, 1.6), (0.3, -3.4, 2.0), (0, 0.3, 1.25), (0, 0.6, 1.2)),
        cast=[who(EINSTEIN, at=(-0.5, 0.35, 0), turn=-20, pose=PRESENT), who(BOHR, at=(0.5, 0.35, 0), turn=20, pose=PRESENT)],
        props=[P("bohr_atom", (0, 1.2, 2.1), scale=0.5)], env_opts=STUDY), hold=1.5)

write(HERE, {
    "slug": "09-bohr-einstein",
    "title": "The Scientist Who Challenged Einstein",
    "description": ("God does not play dice, said Einstein. Stop telling God what to do, said Niels Bohr. The 30-year debate over "
                    "quantum mechanics, and the experiments that finally settled it, told in 3D animation."),
    "tags": ["Niels Bohr", "Albert Einstein", "quantum mechanics", "Bohr-Einstein debates", "entanglement", "Bell's theorem",
             "Solvay conference", "physics history", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.32, "sentence_silence": 0.28,
              "pronunciations": {"Micius": "Mish-us", "CERN": "Sern", "Bohr": "Boar", "Heisenberg": "High-zen-berg", "Solvay": "Sol-vay", "Podolsky": "Po-dol-skee",
                                 "Aspect": "As-pay", "Clauser": "Clow-zer", "Zeilinger": "Tsy-ling-er"}},
    "music_mood": "reflective",
    "sources": [
        "https://www.nobelprize.org/prizes/physics/1922/bohr/biographical/",
        "https://plato.stanford.edu/entries/qt-epr/",
        "https://www.nobelprize.org/prizes/physics/2022/press-release/",
        "https://www.aip.org/history-programs/niels-bohr-library",
        "https://www.solvayinstitutes.be/html/solvayconference.html",
        "https://www.britannica.com/biography/Niels-Bohr",
    ],
}, S.shots)
