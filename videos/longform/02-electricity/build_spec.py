"""Builds short.json (the shot list) for long-form #2: The Scientist Who Discovered Electricity.

  python build_spec.py && python -m shorts3d.make_short short.json [--preview]

Each shot = one or two narration sentences + a 3D 'stage' (or space/character) visual.
'still': True renders one 1080p frame with a slow camera push; otherwise the shot is animated
at 12 fps and motion-interpolated to 24 fps."""

import json
from pathlib import Path

HERE = Path(__file__).parent

# ------------------------------------------------------------------ cast
SKIN = [0.72, 0.52, 0.42]
FARADAY = {"hair": [0.25, 0.13, 0.06], "sleeves": "long",
           "outfit": {"skin": SKIN, "shirt": [0.06, 0.07, 0.14], "pants": [0.07, 0.06, 0.06], "boots": [0.04, 0.03, 0.02]}}
YOUNG = {"hair": [0.3, 0.16, 0.07], "sleeves": "long",
         "outfit": {"skin": SKIN, "shirt": [0.55, 0.42, 0.25], "pants": [0.2, 0.15, 0.1], "boots": [0.1, 0.06, 0.03]}}
DAVY = {"hair": [0.1, 0.07, 0.05], "sleeves": "long",
        "outfit": {"skin": SKIN, "shirt": [0.4, 0.05, 0.08], "pants": [0.1, 0.08, 0.08], "boots": [0.04, 0.03, 0.02]}}
ORSTED = {"hair": [0.65, 0.62, 0.58], "sleeves": "long",
          "outfit": {"skin": SKIN, "shirt": [0.08, 0.25, 0.15], "pants": [0.1, 0.1, 0.1], "boots": [0.04, 0.03, 0.02]}}
FRANKLIN = {"hair": [0.7, 0.68, 0.65], "sleeves": "long",
            "outfit": {"skin": SKIN, "shirt": [0.35, 0.2, 0.08], "pants": [0.3, 0.18, 0.08], "boots": [0.05, 0.04, 0.03]}}
MAXWELL = {"hair": [0.05, 0.04, 0.04], "sleeves": "long",
           "outfit": {"skin": SKIN, "shirt": [0.1, 0.1, 0.12], "pants": [0.08, 0.08, 0.09], "boots": [0.04, 0.03, 0.02]}}

STAND = {"raise_arm": {"L": -22, "R": -22}, "arm_inward": {"L": -6, "R": -6}, "elbow": {"L": 15, "R": 15},
         "curl": {"L": 25, "R": 25}}
WORK = {"raise_arm": {"L": -32, "R": -32}, "arm_forward": {"L": 28, "R": 28}, "arm_inward": {"L": 18, "R": 18},
        "elbow": {"L": 70, "R": 70}, "twist": {"L": 60, "R": 60}, "curl": {"L": 30, "R": 30}, "head_nod": 18}
PRESENT = {"raise_arm": {"L": -22, "R": 5}, "arm_forward": {"L": 0, "R": 35}, "elbow": {"L": 15, "R": 35},
           "arm_inward": {"L": -6, "R": 0}, "curl": {"L": 25, "R": 5}, "twist": {"R": 40}}
READ = {"raise_arm": {"L": -35, "R": -35}, "arm_forward": {"L": 35, "R": 35}, "arm_inward": {"L": 30, "R": 30},
        "elbow": {"L": 95, "R": 95}, "twist": {"L": 80, "R": 80}, "curl": {"L": 20, "R": 20}, "head_nod": 22}
LOOK_UP = {**STAND, "head_nod": -15}


def who(base, at=(0, 0.35, 0), turn=0, pose=STAND, pose_to=None, **kw):
    d = {**base, "at": list(at), "turn": turn, "pose": pose}
    if pose_to:
        d["pose_to"] = pose_to
    d.update(kw)
    return d


def P(prop, at=(0, 0, 0), **kw):
    d = {"prop": prop, "at": list(at)}
    d.update(kw)
    return d


def T(text, at, size=0.3, color=(1.0, 0.85, 0.3), **kw):
    return {"text": text, "at": list(at), "size": size, "color": list(color), **kw}


def cam(frm, to=None, target=(0, 0, 1.0), target_to=None, lens=35, lens_to=None):
    c = {"from": list(frm), "to": list(to or frm), "target": target if isinstance(target, str) else list(target), "lens": lens}
    if target_to is not None:
        c["target_to"] = target_to if isinstance(target_to, str) else list(target_to)
    if lens_to:
        c["lens_to"] = lens_to
    return c


def stage(env, camera, cast=(), props=(), texts=(), **kw):
    return {"type": "stage", "env": env, "cast": list(cast), "props": list(props), "texts": list(texts),
            "camera": camera, **kw}


TABLE = P("table", (0, -0.1, 0))
TOP = 0.875
BENCH_CAM = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))
CLOSE = lambda x=0.0, z=TOP + 0.1: cam((x + 0.35, -1.1, z + 0.35), (x + 0.2, -0.9, z + 0.3), (x, -0.1, z))

shots = []


def S(line, visual, still=False, chapter=None, **kw):
    s = {"id": f"s{len(shots) + 1:03d}", "line": line, "visual": visual}
    if still:
        s["still"] = True
    if chapter:
        s["chapter"] = chapter
    s.update(kw)
    shots.append(s)


# ===================================================================== 1. HOOK
S("Every light you have ever switched on, every phone you have ever charged, every train, fridge and hospital machine, depends on one simple trick.",
  stage("night", cam((0, -1.2, 1.4), (0, -7.5, 3.0), (0, 0, 1.4), (0, 3, 1.2), 50, 28),
        props=[P("bulb", (0, 0, 1.3), args={"on": 0.0}), P("city", (0, 2.5, 0), args={"on": 0.35})]))
S("It's a trick so simple you could do it with a magnet and a coil of wire.",
  stage("studio", cam((0.5, -1.0, 0.5), (0.3, -0.8, 0.45), (0, 0, 0.15)),
        props=[P("coil", (0, 0, 0.12), args={"glow": [[0, 0], [0.45, 0], [0.5, 5], [0.7, 0]]}),
               P("bar_magnet", (0.6, 0, 0.12), anim=[[0.2, {"at": [0.6, 0, 0.12]}], [0.5, {"at": [0.05, 0, 0.12]}]], args={"length": 0.26}),
               P("meter", (-0.45, 0.2, 0.14), args={"needle": [[0, 0], [0.45, 0], [0.52, 40], [0.7, 0]]})]))
S("Without it there would be no electric light, no internet, and almost none of modern medicine.",
  stage("night", cam((0, -6.5, 2.4), (0.5, -5.5, 2.2), (0, 3, 1.4), lens=30), props=[P("city", (0, 3, 0)), P("radio_tower", (2.5, 1.5, 0))]),
  still=True)
S("And it was found by a poor bookbinder's boy who left school at thirteen, and never learned advanced mathematics.",
  stage("lab", cam((0.7, -2.0, 1.5), (0.5, -1.7, 1.45), "cast0.head"),
        cast=[who(YOUNG, pose=READ, scale=0.92)],
        props=[TABLE, P("books", (-0.5, -0.1, TOP)), P("books", (0.55, -0.15, TOP), args={"seed": 3}),
               P("candle", (0.25, -0.25, TOP)), P("notebook", (0, -0.05, 1.05), rot=[60, 0, 0])]), still=True)
S("His name was Michael Faraday. And this is how he turned electricity from a party trick into the power that runs the world.",
  stage("studio", cam((0, -3.4, 1.2), (0, -2.8, 1.15), (0, 0, 1.1), lens=35),
        texts=[T("MICHAEL FARADAY", (0, 0, 1.45), 0.28, pop=0.08), T("THE SCIENTIST WHO DISCOVERED ELECTRICITY", (0, 0, 1.05), 0.11,
                                                                          (0.4, 0.85, 1.0), pop=0.25)],
        props=[P("dipole_lines", (0, 0.4, 1.2), rot=[0, 0, 0], args={"draw": [0.05, 0.6], "scale": 1.6}),
               P("bar_magnet", (0, 0.4, 1.2), args={"length": 0.3})],
        env_opts={"focus": [0, 0, 1.2]}))

# ======================================================== 2. A SPARK NOBODY UNDERSTOOD
S("People had seen electricity for thousands of years.",
  stage("storm", cam((0, -4.5, 1.5), (0, -3.8, 1.7), (0, 2, 2.5)), bolts=[{"from": [0.5, 6, 9], "to": [0, 6, 0], "at": 0.35, "seed": 4},
                                                                        {"from": [-3, 8, 9], "to": [-2.5, 8, 0], "at": 0.7, "seed": 5}],
        props=[]), chapter="A spark nobody understood")
S("Around six hundred B.C., Greek thinkers noticed that rubbed amber could pick up feathers and bits of dust.",
  stage("studio", cam((0.4, -0.9, 0.5), (0.25, -0.75, 0.42), (0, 0, 0.12)), props=[P("amber", args={"lift": [0.3, 0.75]})],
        env_opts={"horizon": [0.25, 0.12, 0.03]}))
S("The Greek word for amber was elektron.",
  stage("studio", cam((0, -2.6, 1.0), (0, -2.2, 1.0), (0, 0, 1.0)),
        texts=[T("ἤλεκτρον", (0, 0, 1.25), 0.3, (1.0, 0.6, 0.1), pop=0.05),
               T("ELEKTRON  =  AMBER", (0, 0, 0.8), 0.16, (1, 1, 1), pop=0.35)],
        props=[P("amber", (0.0, 0.3, 0.0), scale=1.6)]), still=True, still_at=0.8)
S("In sixteen hundred, the English physician William Gilbert borrowed it to coin a new Latin word, electricus.",
  stage("lab", cam((0.5, -1.8, 1.45), (0.35, -1.5, 1.4), (0, 0, 1.05)),
        cast=[who(DAVY | {"hair": [0.45, 0.42, 0.4]}, pose=READ)],
        props=[TABLE, P("books", (-0.5, -0.1, TOP), args={"n": 8, "seed": 7}), P("candle", (0.5, -0.2, TOP))],
        texts=[T("ELECTRICUS", (0, -0.3, 1.75), 0.16, pop=0.3)]), still=True, still_at=0.8)
S("In seventeen fifty two, Benjamin Franklin flew a kite into a storm, and showed that lightning was electricity too.",
  stage("storm", cam((1.6, -3.2, 1.6), (1.2, -2.8, 2.0), (0.3, 0, 1.8)),
        cast=[who(FRANKLIN, at=(0, 0, 0), turn=20, pose={**STAND, "raise_arm": {"R": 20, "L": -22}, "arm_forward": {"R": 50},
                                                         "elbow": {"R": 30}, "head_nod": -20})],
        props=[P("kite", (0.0, 0.6, 1.5), args={"spark": 0.55})], rain=True))
S("Franklin went on to invent the lightning rod, a simple metal spike that gives lightning a safe path into the ground.",
  stage("storm", cam((2.2, -4.2, 2.4), (1.8, -3.6, 2.6), (0, 0, 2.2), lens=30),
        props=[P("wire", (0, 0, 1.6), rot=[0, 90, 0], args={"length": 3.2, "color": [0.75, 0.75, 0.8]})],
        bolts=[{"from": [0.6, 1.5, 10], "to": [0, 0, 3.2], "at": 0.45, "seed": 12}]))
S("Then in eighteen hundred, Alessandro Volta stacked discs of zinc and copper, separated by cloth soaked in salt water.",
  stage("studio", cam((0.5, -1.1, 0.55), (0.35, -0.9, 0.45), (0, 0, 0.17)), props=[P("voltaic_pile", args={"build": [0.05, 0.8], "glow": [0.92, 1]})]))
S("It was the first battery: a steady flow of electric current.",
  stage("studio", cam((0.35, -0.85, 0.45), (0.6, -1.1, 0.6), (0.1, 0, 0.18)),
        props=[P("voltaic_pile", args={"build": [0.0, 0.01], "glow": [0.1, 1]}), P("bulb", (0.3, 0, 0.12), args={"on": 0.15})]))
S("It was so important that the unit of electrical pressure, the volt, is named after him.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 1.0), (0, 0, 0.9)), texts=[T("1.5 VOLTS", (0, 0, 1.05), 0.3, pop=0.1)],
        props=[P("battery", (0, 0.4, 0.3), scale=2.0)]), still=True, still_at=0.8)
S("But it was weak, expensive, and nobody really understood what it was.",
  stage("studio", cam((0, -1.6, 0.9), (0, -1.3, 0.8), (0, 0, 0.6)),
        texts=[T("?", (0, 0, 0.75), 0.5, (0.4, 0.85, 1.0), pop=0.15)], props=[P("voltaic_pile", (-0.5, 0, 0), args={"build": [0, 0.01], "glow": [0.1, 1]})]),
  still=True, still_at=0.7)
S("Electricity was a curiosity for lecture halls. A show, not a power source.",
  stage("hall", cam((0, -4.6, 2.7), (0.4, -4.0, 2.4), (0, 1.0, 1.0), lens=30),
        props=[P("audience", (0, 1.0, 0), rot=[0, 0, 180], args={"react": 0.5}), P("table", (0, 0.9, 0)),
               P("voltaic_pile", (-0.3, 0.9, TOP), args={"build": [0, 0.01], "glow": [0.1, 1]}),
               P("glassware", (0.3, 0.9, TOP))],
        bolts=[{"from": [-0.25, 0.9, 1.2], "to": [0.3, 0.9, 1.2], "at": 0.48, "seed": 9, "width": 0.006}]))

# ======================================================== 3. THE BOOKBINDER'S APPRENTICE
S("Michael Faraday was born in seventeen ninety one, near London, the son of a blacksmith.",
  stage("lab", cam((0, -2.8, 1.4), (0, -2.3, 1.3), (0, 0, 1.0)), cast=[who(YOUNG, pose=STAND, scale=0.8)],
        texts=[T("1791", (-0.9, 0.5, 1.8), 0.35, pop=0.15)], env_opts={"wall": [0.18, 0.16, 0.15]}),
  still=True, chapter="The bookbinder's apprentice")
S("His family was poor. At times he had a single loaf of bread to last him a week.",
  stage("lab", CLOSE(0, TOP + 0.05), props=[TABLE, P("bread", (0, -0.1, TOP)), P("candle", (0.35, 0.05, TOP))],
        texts=[T("1 LOAF  /  1 WEEK", (0, 0.2, 1.25), 0.07, pop=0.3)], env_opts={"wall": [0.18, 0.16, 0.15]}), still=True, still_at=0.8)
S("At fourteen, he became an apprentice to a bookbinder.",
  stage("lab", BENCH_CAM, cast=[who(YOUNG, pose=WORK)],
        props=[TABLE, P("books", (-0.45, -0.1, TOP), args={"n": 9, "seed": 11}), P("books", (0.45, -0.1, TOP), args={"n": 7})]), still=True)
S("And instead of just binding the books, he read them.",
  stage("lab", cam((0.4, -1.4, 1.6), (0.25, -1.1, 1.5), "cast0.head"), cast=[who(YOUNG, pose=READ)],
        props=[TABLE, P("notebook", (0, 0.0, 1.06), rot=[65, 0, 0]), P("books", (0.5, -0.1, TOP), args={"n": 10})]), still=True)
S("His master, George Riebau, encouraged him, and even let him use the shop for experiments.",
  stage("lab", cam((0, -2.4, 1.45), (0.2, -2.0, 1.4), (0, 0.2, 1.2)),
        cast=[who(YOUNG, at=(-0.4, 0.35, 0), turn=-15, pose=WORK), who(ORSTED | {"hair": [0.5, 0.48, 0.45]}, at=(0.55, 0.45, 0), turn=20, pose=STAND)],
        props=[TABLE, P("books", (-0.4, -0.1, TOP), args={"n": 6})]), still=True)
S("At night he went to lectures at a small club called the City Philosophical Society, where he learned chemistry, and how to explain science to an audience.",
  stage("hall", cam((0.3, -2.9, 1.5), (0.2, -2.5, 1.45), (0, 1.0, 1.1), lens=32),
        cast=[who(YOUNG, at=(0, 1.4, 0), pose=PRESENT)], props=[P("table", (0, 0.9, 0)), P("glassware", (0.3, 0.9, TOP), args={"n": 3}),
                                                               P("figures", (0, -0.6, 0), args={"n": 6, "seed": 4})]), still=True)
S("One of them was an encyclopedia, with a long article on electricity.",
  stage("lab", CLOSE(0, TOP), props=[TABLE, P("books", (-0.2, -0.1, TOP), args={"n": 3, "seed": 2}), P("candle", (0.35, -0.05, TOP))],
        texts=[T("ELECTRICITY", (0, -0.12, TOP + 0.2), 0.07, (0.4, 0.85, 1.0), pop=0.3)]), still=True, still_at=0.8)
S("He built his own simple electrical machines from scraps, in the back of the shop.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.25, -0.85, 1.2), (0, -0.1, 0.95)),
        props=[TABLE, P("glassware", (-0.3, -0.1, TOP), args={"n": 2}), P("wire", (0.15, -0.15, TOP + 0.02), args={"length": 0.4, "glow": [[0, 0], [0.4, 0], [0.45, 4], [0.6, 0], [0.75, 4]]}),
               P("battery", (0.45, -0.05, TOP))]))
S("In eighteen twelve, a customer gave him tickets to hear the most famous chemist in Britain, Sir Humphry Davy, at the Royal Institution.",
  stage("hall", cam((0, -4.6, 2.7), (0.3, -4.0, 2.4), (0, 1.2, 1.2), lens=30),
        cast=[who(DAVY, at=(0, 1.4, 0), pose=PRESENT)],
        props=[P("table", (0, 0.9, 0)), P("glassware", (0.3, 0.9, TOP)), P("audience", (0, 1.2, 0), rot=[0, 0, 180])],
        texts=[T("1812", (-1.2, 2.5, 2.2), 0.3, pop=0.1)]))
S("Davy was a celebrity. Using huge batteries, he had discovered new elements, including sodium and potassium.",
  stage("studio", cam((0, -2.2, 1.1), (0.3, -1.9, 1.0), (0, 0, 0.8)),
        texts=[T("Na", (-0.45, 0, 1.0), 0.4, (1.0, 0.85, 0.2), pop=0.15), T("K", (0.45, 0, 1.0), 0.4, (0.7, 0.45, 1.0), pop=0.35)],
        props=[P("voltaic_pile", (-1.0, 0.5, 0), scale=2.5, args={"build": [0, 0.01], "glow": [0.05, 1]})]), still=True, still_at=0.7)
S("Crowds were so big that the street outside the Royal Institution is said to have become London's first one-way street.",
  stage("street", cam((2.5, -3.0, 2.2), (2.0, -2.4, 2.0), (0, 2, 1.0), lens=28),
        props=[P("street_lamps", (-1.2, 0, 0), args={"n": 5, "on": [0, 0.01]}), P("figures", (0.4, 1.0, 0), args={"n": 9, "spacing": 0.3, "seed": 8}),
               P("figures", (0.6, 2.2, 0), args={"n": 8, "spacing": 0.32, "seed": 9})]), still=True)
S("Faraday took careful notes, rewrote them neatly, and bound them into a book.",
  stage("lab", CLOSE(0, TOP), props=[TABLE, P("notebook", (0, -0.1, TOP), anim=[[0.0, {"rot": [0, 0, -30]}], [0.6, {"rot": [0, 0, 0]}]]),
                                      P("candle", (0.35, 0.05, TOP)), P("books", (-0.4, 0.0, TOP), args={"n": 2})]))
S("Then he sent it to Davy, and asked him for a job.",
  stage("lab", cam((0.0, -1.6, 1.5), (0.0, -1.3, 1.4), (0, 0.1, 1.2)), cast=[who(DAVY, at=(0, 0.45, 0), pose=WORK)],
        props=[TABLE, P("notebook", (0.6, -0.1, TOP), anim=[[0.1, {"at": [0.9, -0.1, TOP]}], [0.6, {"at": [0.0, -0.1, TOP]}]])]))
S("Davy had recently been hurt in a laboratory explosion that damaged his eyesight, and for a short time, Faraday helped him as a secretary.",
  stage("lab", cam((0.0, -2.2, 1.5), (0.2, -1.9, 1.45), (0, 0.2, 1.2)),
        cast=[who(DAVY, at=(0.5, 0.45, 0), turn=10, pose=STAND), who(YOUNG, at=(-0.45, 0.35, 0), turn=-10, pose=READ)],
        props=[TABLE, P("notebook", (-0.45, 0.0, 1.06), rot=[65, 0, 0])]), still=True)
S("A few months later, one of Davy's lab assistants was sacked after a fight. And Davy hired Faraday to wash bottles.",
  stage("lab", BENCH_CAM, cast=[who(FARADAY, pose=WORK)], props=[TABLE, P("glassware", (0, -0.1, TOP), args={"n": 6, "seed": 5})],
        texts=[T("1813", (-0.9, 0.6, 1.9), 0.3, pop=0.4)]), still=True)

# ======================================================== 4. OUTGROWING THE MASTER
S("Faraday worked his way up. He travelled across Europe with Davy, sometimes treated like a servant, but meeting the greatest scientists of the age.",
  stage("studio", cam((0, -2.6, 2.0), (0.4, -2.0, 1.6), (0, 0, 0.3)), props=[P("route", (0, 0, 0.05))]),
  chapter="The assistant who outgrew his master")
S("In Paris they met Andr\u00e9-Marie Amp\u00e8re. In Italy, Faraday met Alessandro Volta himself.",
  stage("studio", cam((0.6, -2.0, 1.3), (0.2, -1.6, 1.0), (0.4, -0.3, 0.3)), props=[P("route", (0, 0, 0.05), args={"draw": [0, 0.01]}),
        P("voltaic_pile", (0.9, -0.55, 0.05), scale=0.8, args={"build": [0, 0.01], "glow": [0.1, 1]})]), still=True)
S("In Florence, they used a giant magnifying glass to focus sunlight on a diamond, and burned it, proving that diamond is made of carbon.",
  stage("sky", cam((0.35, -0.9, 0.6), (0.25, -0.75, 0.5), (0, 0, 0.25)),
        props=[P("glassware", (0, 0.2, 0), args={"n": 1}), P("bulb", (0, -0.02, 0.22), scale=0.4, args={"on": 0.4, "color": [1.0, 0.95, 0.85], "strength": 40})],
        env_opts={"sky": {"horizon": [1.0, 0.6, 0.25], "zenith": [0.15, 0.4, 0.9]}}))
S("Then, in eighteen twenty, the Danish scientist Hans Christian Oersted noticed something strange.",
  stage("lab", cam((0.6, -1.9, 1.5), (0.4, -1.6, 1.45), "cast0.head"), cast=[who(ORSTED, pose=WORK)],
        props=[TABLE, P("compass", (0, -0.1, TOP)), P("battery", (0.4, -0.05, TOP))],
        texts=[T("1820", (-0.9, 0.6, 1.9), 0.3, pop=0.15)]), still=True)
S("A wire carrying electric current made a nearby compass needle swing.",
  stage("studio", cam((0.25, -0.55, 0.45), (0.15, -0.45, 0.4), (0, 0, 0.05)),
        props=[P("compass", (0, 0, 0), args={"needle": [[0, 0], [0.35, 0], [0.45, 75], [0.5, 62], [0.55, 70]]}),
               P("wire", (0, 0, 0.09), rot=[0, 0, 0], args={"length": 0.6, "glow": [[0, 0], [0.33, 0], [0.36, 5]]})]))
S("Electricity could create magnetism. The scientific world went wild.",
  stage("studio", cam((0.3, -1.1, 0.9), (0.15, -0.9, 0.8), (0, 0, 0.1)), props=[P("newspapers", (0, 0, 0))]), still=True, still_at=0.7)
S("In eighteen twenty one, Faraday built a small device: a wire dangling into a cup of mercury, beside an upright magnet.",
  stage("studio", cam((0.35, -0.85, 0.55), (0.25, -0.7, 0.45), (0, 0, 0.18)), props=[P("mercury_motor", args={"start": 0.9})]),
  still=True, still_at=0.5)
S("When current flowed, the wire spun round and round the magnet.",
  stage("studio", cam((0.3, -0.6, 0.35), (0.25, -0.55, 0.3), (0, 0, 0.15)), props=[P("mercury_motor", args={"start": 0.05, "turns": 3})]))
S("Electricity had been turned into continuous motion. It was the ancestor of every electric motor.",
  stage("studio", cam((1.2, -2.6, 1.4), (0.8, -2.0, 1.1), (0, 0, 0.8)),
        props=[P("mercury_motor", (-0.6, 0, 0.5), scale=1.4, args={"start": 0.0, "turns": 2}), P("turbine", (0.7, 1.0, 0), scale=0.45)]))
S("He was so excited that he danced around the laboratory table with his brother-in-law.",
  stage("lab", cam((0, -2.6, 1.6), (0.4, -2.2, 1.5), (0, 0.2, 1.1)),
        cast=[who(FARADAY, at=(-0.5, 0.3, 0), turn=-20, pose={**STAND, "raise_arm": {"L": 40, "R": 40}, "elbow": {"L": 40, "R": 40}},
                  poses=[[0.5, {"raise_arm": {"L": -10, "R": -10}}], [1.0, {"raise_arm": {"L": 45, "R": 45}}]],
                  walk=[[0, [-0.5, 0.3, 0]], [1, [-0.2, 0.6, 0]]]),
              who(YOUNG | {"hair": [0.1, 0.07, 0.05]}, at=(0.55, 0.4, 0), turn=25, pose={**STAND, "raise_arm": {"L": 30, "R": 30}},
                  walk=[[0, [0.55, 0.4, 0]], [1, [0.3, 0.1, 0]]])],
        props=[P("table", (0, 0.4, 0), args={"w": 0.9}), P("mercury_motor", (0, 0.4, TOP), args={"start": 0, "turns": 2})]))
S("That same year he married Sarah Barnard. They were together for forty six years.",
  stage("lab", cam((0, -2.4, 1.45), (0, -2.0, 1.4), (0, 0.3, 1.25)),
        cast=[who(FARADAY, at=(-0.3, 0.35, 0), turn=-12, pose=STAND),
              who(YOUNG | {"hair": [0.45, 0.25, 0.1], "outfit": {**YOUNG["outfit"], "shirt": [0.5, 0.2, 0.35], "pants": [0.5, 0.2, 0.35]}},
                  at=(0.3, 0.35, 0), turn=12, pose=STAND, scale=0.94)],
        texts=[T("1821", (0, 1.0, 2.0), 0.3, pop=0.2)]), still=True)
S("But instead of praise, Faraday faced suspicion. Some, including Davy, felt he had used another scientist's ideas without giving credit.",
  stage("lab", cam((0.0, -1.6, 1.45), (0.0, -1.3, 1.4), "cast0.head"), cast=[who(FARADAY, pose={**STAND, "head_nod": 20})],
        props=[P("candle", (0.4, -0.3, 0.0), scale=1.0)], env_opts={"wall": [0.05, 0.06, 0.07], "world": [0.01, 0.01, 0.015]}),
  still=True)
S("It hurt him deeply.",
  stage("lab", cam((0.6, -1.0, 1.65), (0.5, -0.9, 1.62), "cast0.head", lens=50), cast=[who(FARADAY, pose={**STAND, "head_nod": 25})],
        env_opts={"wall": [0.05, 0.06, 0.07], "world": [0.01, 0.01, 0.015]}), still=True)

# ======================================================== 5. TEN YEARS OF FAILURE
S("Faraday became convinced of something.",
  stage("lab", cam((0.5, -1.5, 1.6), (0.35, -1.2, 1.6), "cast0.head"), cast=[who(FARADAY, pose=LOOK_UP)]), still=True,
  chapter="Ten years of failure")
S("If electricity could make magnetism, then surely magnetism could make electricity.",
  stage("studio", cam((0, -2.2, 0.9), (0, -1.9, 0.9), (0, 0, 0.9)),
        texts=[T("ELECTRICITY  →  MAGNETISM", (0, 0, 1.15), 0.12, (0.4, 0.85, 1.0), pop=0.05),
               T("MAGNETISM  →  ELECTRICITY ?", (0, 0, 0.75), 0.12, (1.0, 0.45, 0.2), pop=0.45)]), still=True, still_at=0.75)
S("For years he tried. He put magnets next to wires. Nothing.",
  stage("studio", cam((0.4, -0.9, 0.5), (0.3, -0.8, 0.45), (0, 0, 0.1)),
        props=[P("bar_magnet", (0.0, -0.1, 0.04), args={"length": 0.22}), P("wire", (0, 0.05, 0.02), args={"length": 0.5}),
               P("meter", (-0.4, 0.2, 0.14), args={"needle": [[0, 0]]})]), still=True)
S("He wound wires around magnets. Nothing.",
  stage("studio", cam((0.4, -0.9, 0.5), (0.3, -0.8, 0.45), (0, 0, 0.1)),
        props=[P("coil", (0, 0, 0.1)), P("bar_magnet", (0, 0, 0.1), args={"length": 0.32, "width": 0.05}),
               P("meter", (-0.45, 0.2, 0.14), args={"needle": [[0, 0]]})]), still=True)
S("Between other work, he liquefied chlorine gas and discovered a new chemical called benzene. But the magnet problem would not go away.",
  stage("lab", BENCH_CAM, cast=[who(FARADAY, pose=WORK)], props=[TABLE, P("glassware", (0, -0.1, TOP), args={"n": 5, "seed": 9})],
        texts=[T("C₆H₆", (0.9, 0.3, 1.8), 0.22, (0.4, 1.0, 0.6), pop=0.5)]), still=True)

# ======================================================== 6. AUGUST 29, 1831
S("In eighteen twenty four, he was elected to the Royal Society, reportedly against Davy's wishes. A year later, he was running the Royal Institution's laboratory.",
  stage("hall", cam((0.3, -2.4, 1.6), (0.2, -2.0, 1.55), "cast0.head"), cast=[who(FARADAY, at=(0, 0.6, 0), pose=STAND)],
        props=[P("medal", (0.45, 0.2, 1.3), spin=["z", 30])], texts=[T("1824", (-0.9, 1.2, 2.0), 0.3, pop=0.2)]), still=True)
S("Then, on the twenty ninth of August, eighteen thirty one, he took an iron ring, and wrapped two separate coils of wire around it.",
  stage("studio", cam((0.5, -0.9, 0.75), (0.3, -0.75, 0.55), (0, 0, 0.05)), props=[P("iron_ring", (0, 0, 0.05))],
        texts=[T("29 AUGUST 1831", (0, 0.6, 0.6), 0.12, pop=0.1)]), chapter="August 29, 1831")
S("One coil was connected to a battery. The other was connected to a needle that could detect current.",
  stage("studio", cam((0, -1.3, 1.0), (0, -1.1, 0.85), (0, 0.1, 0.1)),
        props=[P("iron_ring", (0, 0, 0.05)), P("battery", (-0.55, 0.0, 0)), P("meter", (0.6, 0.1, 0.14), args={"label": "CURRENT"})]),
  still=True)
S("When he connected the battery, the needle jumped... and then fell back to zero.",
  stage("studio", cam((0.2, -1.2, 0.7), (0.1, -1.0, 0.6), (0.25, 0.1, 0.12)),
        props=[P("iron_ring", (0, 0, 0.05), args={"pulse": [0.3]}), P("battery", (-0.55, 0.0, 0)),
               P("meter", (0.6, 0.1, 0.14), args={"needle": [[0, 0], [0.3, 0], [0.34, 35], [0.5, 0]]})]))
S("When he disconnected it, the needle jumped the other way.",
  stage("studio", cam((0.5, -0.8, 0.4), (0.45, -0.7, 0.35), (0.6, 0.1, 0.18)),
        props=[P("iron_ring", (0, 0, 0.05), args={"pulse": [0.35]}), P("meter", (0.6, 0.1, 0.14), args={"needle": [[0, 0], [0.35, 0], [0.39, -35], [0.6, 0]]})]))
S("The current only appeared when the magnetism was changing.",
  stage("studio", cam((0, -1.0, 0.9), (0, -0.8, 0.75), (0, 0, 0.05)),
        props=[P("iron_ring", (0, 0, 0.05), args={"pulse": [0.15, 0.45, 0.75]})],
        texts=[T("CHANGE  =  CURRENT", (0, 0.5, 0.5), 0.1, (0.4, 0.85, 1.0), pop=0.3)]))
S("Weeks later, he pushed a bar magnet into a coil of wire. The needle moved.",
  stage("studio", cam((0.45, -0.9, 0.45), (0.3, -0.8, 0.4), (0, 0, 0.12)),
        props=[P("coil", (0, 0, 0.12), args={"glow": [[0, 0], [0.35, 0], [0.42, 6], [0.6, 0]]}),
               P("bar_magnet", (0.6, 0, 0.12), anim=[[0.15, {"at": [0.6, 0, 0.12]}], [0.45, {"at": [0.05, 0, 0.12]}]], args={"length": 0.26}),
               P("meter", (-0.45, 0.2, 0.14), args={"needle": [[0, 0], [0.35, 0], [0.42, 40], [0.65, 0]]})]))
S("He pulled it out. The needle moved the other way.",
  stage("studio", cam((0.45, -0.9, 0.45), (0.5, -0.85, 0.45), (0, 0, 0.12)),
        props=[P("coil", (0, 0, 0.12), args={"glow": [[0, 0], [0.3, 0], [0.38, 6], [0.6, 0]]}),
               P("bar_magnet", (0.05, 0, 0.12), anim=[[0.1, {"at": [0.05, 0, 0.12]}], [0.4, {"at": [0.6, 0, 0.12]}]], args={"length": 0.26}),
               P("meter", (-0.45, 0.2, 0.14), args={"needle": [[0, 0], [0.3, 0], [0.38, -40], [0.65, 0]]})]))
S("Moving magnets make electricity. This is called electromagnetic induction.",
  stage("studio", cam((0, -1.5, 0.7), (0, -1.2, 0.6), (0, 0, 0.3)),
        props=[P("coil", (0, 0, 0.12), args={"glow": [[0, 3]]}), P("dipole_lines", (0, 0, 0.12), args={"draw": [0.05, 0.5], "scale": 0.8})],
        texts=[T("ELECTROMAGNETIC INDUCTION", (0, 0.3, 0.75), 0.11, pop=0.4)]), still=True, still_at=0.8)
S("He wrote down every experiment in numbered paragraphs. By the end of his life, his notebooks held more than sixteen thousand entries.",
  stage("lab", CLOSE(0, TOP), props=[TABLE, P("notebook", (-0.15, -0.1, TOP)), P("notebook", (0.12, -0.05, TOP), rot=[0, 0, 20]),
                                      P("books", (0.45, 0.0, TOP), args={"n": 8, "seed": 13}), P("candle", (-0.45, 0.05, TOP))],
        texts=[T("16,000+", (0, 0.1, 1.25), 0.1, pop=0.35)]), still=True, still_at=0.8)
S("And it is the trick behind nearly every power station on Earth.",
  stage("lab", cam((0, -3.5, 2.2), (1.5, -3.0, 2.0), (0, 1, 0.8), lens=24), props=[P("generator_hall", (0, 1.0, 0), scale=0.8)],
        env_opts={"wall": [0.2, 0.22, 0.24], "world": [0.05, 0.05, 0.06]}))

# ======================================================== 7. THE FIRST GENERATOR
S("Faraday then spun a copper disc between the poles of a magnet.",
  stage("studio", cam((0.7, -1.1, 0.75), (0.5, -0.9, 0.65), (0, 0, 0.35)), props=[P("faraday_disk", args={"spin": [0.05, 1.0], "turns": 3})]),
  chapter="The first generator")
S("A steady current flowed out of it, for as long as the disc kept turning.",
  stage("studio", cam((-0.3, -1.0, 0.6), (-0.1, -0.85, 0.55), (0.15, 0, 0.3)),
        props=[P("faraday_disk", args={"spin": [0.0, 1.0], "turns": 4, "glow": [0.15, 1]}), P("bulb", (0.55, -0.1, 0.0), args={"on": 0.2})]))
S("It was the first electric generator. Turn something, and you get electricity.",
  stage("studio", cam((0, -1.6, 0.9), (0, -1.3, 0.8), (0, 0, 0.4)),
        props=[P("faraday_disk", args={"spin": [0.0, 1.0], "turns": 3, "glow": [0.0, 1]})],
        texts=[T("FIRST GENERATOR", (0, 0.4, 0.95), 0.12, pop=0.35)]))
S("Within a year, a French instrument maker, Hippolyte Pixii, built a hand-cranked generator using Faraday's principle.",
  stage("studio", cam((0.6, -1.3, 0.8), (0.4, -1.1, 0.7), (0, 0, 0.35)),
        props=[P("horseshoe", (0, 0, 0.3), spin=["z", 540], args={"size": 0.3}), P("coil", (0.0, 0, 0.62), rot=[0, 90, 0], args={"glow": [[0, 0], [0.2, 3]]}),
               P("coil", (0.15, 0, 0.62), rot=[0, 90, 0])], texts=[T("1832", (-0.5, 0.3, 0.95), 0.15, pop=0.2)]))
S("It didn't matter what did the turning: falling water, steam, wind, or later, the heat from nuclear reactions.",
  stage("studio", cam((0, -4.5, 2.0), (0, -3.8, 1.8), (0, 0, 1.0), lens=30),
        props=[P("turbine", (-1.2, 0.5, 0), scale=0.5), P("faraday_disk", (0.4, 0, 0), scale=1.5, args={"spin": [0, 1], "turns": 3, "glow": [0, 1]})],
        texts=[T("WATER", (-1.6, 0, 1.9), 0.12, (0.3, 0.7, 1.0), pop=0.15), T("STEAM", (-0.5, 0, 1.9), 0.12, (1, 1, 1), pop=0.3),
               T("WIND", (0.6, 0, 1.9), 0.12, (0.5, 1.0, 0.6), pop=0.45), T("NUCLEAR", (1.6, 0, 1.9), 0.12, (1.0, 0.5, 0.2), pop=0.6)]))
S("Today almost all the electricity we use comes from Faraday's idea: magnets and coils of wire, moving past each other in giant generators.",
  stage("lab", cam((-2.0, -3.5, 1.8), (1.0, -3.2, 1.6), (0, 1, 0.8), lens=26), props=[P("generator_hall", (0, 1.0, 0), scale=0.8)],
        env_opts={"wall": [0.2, 0.22, 0.24], "world": [0.05, 0.05, 0.06]}))

# ======================================================== 8. INVISIBLE LINES OF FORCE
S("Faraday couldn't do advanced maths. So he pictured what he couldn't calculate.",
  stage("lab", cam((0.5, -1.7, 1.55), (0.35, -1.4, 1.5), "cast0.head"), cast=[who(FARADAY, pose=WORK)],
        props=[TABLE, P("filings", (0, -0.1, TOP), scale=0.6, args={"align": [0.0, 0.01]})]), still=True,
  chapter="Invisible lines of force")
S("He sprinkled iron filings around magnets, and watched them snap into curved patterns.",
  stage("studio", cam((0.15, -0.95, 0.85), (0.05, -0.8, 0.75), (0, 0, 0)), props=[P("filings", args={"align": [0.2, 0.7]})]))
S("He believed these lines of force were real things, filling the space around every magnet and every current.",
  stage("studio", cam((0.8, -1.4, 0.7), (0.4, -1.0, 0.5), (0, 0, 0.1)),
        props=[P("filings", args={"align": [0, 0.01]}), P("dipole_lines", (0, 0, 0.04), rot=[90, 0, 0], args={"draw": [0.1, 0.7], "scale": 0.7})]))
S("Most scientists thought this was childish. But a young Scottish physicist, James Clerk Maxwell, turned Faraday's pictures into mathematics.",
  stage("lab", cam((0.5, -1.8, 1.5), (0.35, -1.5, 1.45), "cast0.head"), cast=[who(MAXWELL, pose=READ)],
        props=[TABLE, P("notebook", (0, 0.0, 1.06), rot=[65, 0, 0])], texts=[T("1860s", (-0.9, 0.6, 1.9), 0.3, pop=0.2)]), still=True)
S("His equations showed something astonishing: light itself is a wave of electricity and magnetism.",
  stage("studio", cam((0, -2.6, 1.2), (0.4, -2.3, 1.1), (0, 0, 0.9)),
        props=[P("em_wave", (0, 0, 0.6), args={"draw": [0.1, 0.4]}), P("equations", (0, 0.5, 1.6), args={"at": 0.05}, scale=0.7)]))
S("Faraday had already shown, in eighteen forty five, that a magnet could twist a beam of light. It was a clue that light and magnetism were connected.",
  stage("studio", cam((0.5, -1.6, 0.8), (0.2, -1.3, 0.7), (0, 0, 0.4)),
        props=[P("bar_magnet", (0, 0.15, 0.35), args={"length": 0.6, "width": 0.1}), P("em_wave", (0, -0.1, 0.42), scale=0.4, args={"draw": [0.05, 0.4]})]))
S("Radio, television, Wi-Fi and mobile phones all grew from that insight.",
  stage("night", cam((0, -5.0, 1.6), (0.6, -4.2, 1.5), (0.5, 0, 1.3), lens=30),
        props=[P("radio_tower", (-0.8, 1.0, 0)), P("phone", (1.2, -1.0, 1.3), args={"glow": 0.4}), P("city", (0, 4, 0))]))

# ======================================================== 9. THE MAN WHO SAID NO
S("Faraday became famous. He also found that a closed metal cage shields whatever is inside from electric charge.",
  stage("storm", cam((2.0, -3.6, 1.6), (1.6, -3.0, 1.4), (0, 0, 0.8)),
        cast=[who(FARADAY, at=(0, 0, 0), scale=0.75, pose=STAND)], props=[P("cage", args={"size": 1.6, "strikes": [0.25, 0.5, 0.75]})]),
  chapter="The man who said no")
S("Which is why we still call it a Faraday cage. It's why you're safe inside a car or a plane in a thunderstorm.",
  stage("storm", cam((-1.6, -3.4, 1.4), (-1.2, -2.9, 1.3), (0, 0, 0.8)),
        cast=[who(FARADAY, at=(0, 0, 0), pose=STAND)], props=[P("cage", args={"size": 2.0, "strikes": [0.3, 0.65]})]))
S("He started the Royal Institution's Christmas Lectures for young people, which still run today.",
  stage("hall", cam((0.3, -2.9, 1.5), (0.2, -2.5, 1.45), (0, 1.0, 1.1), lens=32),
        cast=[who(FARADAY, at=(0, 1.4, 0), pose=PRESENT)],
        props=[P("table", (0, 0.9, 0)), P("candle", (0.2, 0.9, TOP)), P("figures", (0, -0.6, 0), args={"n": 7})]), still=True)
S("But he turned down a knighthood. And twice, he refused to become President of the Royal Society.",
  stage("studio", cam((0, -1.4, 0.8), (0, -1.2, 0.75), (0, 0, 0.35)),
        props=[P("crown", (-0.25, 0, 0.25), spin=["z", 40]), P("medal", (0.3, 0, 0.35), spin=["z", -40])],
        texts=[T("NO, THANK YOU", (0, 0.3, 0.75), 0.11, (1, 0.4, 0.4), pop=0.5)]))
S("He said he wanted to remain plain Michael Faraday, to the last.",
  stage("lab", cam((0.0, -2.3, 1.45), (0.0, -1.9, 1.4), "cast0.head"), cast=[who(FARADAY, pose=STAND)]), still=True)

# ======================================================== 10. LEGACY
S("He was deeply religious, and in the eighteen fifties he refused to help the British government develop poison gas for the Crimean War.",
  stage("lab", cam((0.5, -1.9, 1.5), (0.35, -1.6, 1.45), "cast0.head"), cast=[who(FARADAY, pose={**STAND, "head_nod": 8})],
        props=[P("glassware", (0.6, -0.4, 0.0), args={"n": 2, "colors": [[0.4, 1.0, 0.2], [0.6, 0.9, 0.2]]})],
        env_opts={"wall": [0.08, 0.09, 0.1]}), still=True)
S("Faraday died in eighteen sixty seven.",
  stage("lab", cam((0, -1.2, 1.2), (0, -1.0, 1.15), (0, -0.1, 0.95)), props=[TABLE, P("candle", (0, -0.1, TOP))],
        texts=[T("1791 – 1867", (0, 0.4, 1.45), 0.16, pop=0.2)], env_opts={"wall": [0.05, 0.06, 0.07], "world": [0.01, 0.01, 0.015]}),
  still=True, still_at=0.8, chapter="Legacy")
S("A few years later, Thomas Edison and others used generators built on his principle to light up whole streets.",
  stage("street", cam((1.6, -2.5, 1.9), (1.0, -1.5, 1.8), (0, 4, 1.6), lens=28), props=[P("street_lamps", (0, 0, 0), args={"n": 7, "on": [0.15, 0.8]})]))
S("The unit of electrical capacitance, the farad, is named in his honour.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.0, 1.0), (0, 0, 1.0)), texts=[T("1 FARAD", (0, 0, 1.0), 0.35, pop=0.1)]),
  still=True, still_at=0.8)
S("From nineteen ninety one to two thousand and one, his portrait was on the British twenty pound note.",
  stage("studio", cam((0, -1.9, 1.0), (0, -1.6, 0.95), (0, 0, 0.9)), texts=[T("\u00a320", (0, 0, 1.1), 0.4, (0.6, 0.3, 0.8), pop=0.1),
        T("1991 \u2013 2001", (0, 0, 0.75), 0.12, (1, 1, 1), pop=0.3)]), still=True, still_at=0.8)
S("And Albert Einstein kept a picture of Faraday on his study wall, alongside Isaac Newton and James Clerk Maxwell.",
  stage("lab", cam((0, -1.4, 1.9), (0, -1.1, 1.9), (0, 2.9, 2.0), lens=35), props=[P("portraits", (0, 2.9, 2.0))],
        env_opts={"wall_y": 2.95}), still=True)

# ======================================================== 11. CLOSE
S("He didn't discover electricity. Nobody did.",
  stage("studio", cam((0, -2.0, 1.0), (0, -1.7, 1.0), (0, 0, 0.6)),
        props=[P("coil", (0, 0, 0.6), args={"glow": [[0, 2]]}), P("dipole_lines", (0, 0, 0.6), args={"draw": [0, 0.01], "scale": 0.9})]),
  still=True, chapter="Close")
S("But Michael Faraday discovered how to make it, how to move it, and how to think about it.",
  stage("night", cam((0, -1.4, 1.2), (0, -6.5, 2.8), (0, 0, 1.0), (0, 3, 1.2), 45, 28),
        props=[P("faraday_disk", (0, 0, 0.6), args={"spin": [0, 1], "turns": 3, "glow": [0, 1]}), P("city", (0, 3, 0), args={"on": 0.3})]))
S("So the next time you flip a switch, remember the bookbinder's boy, with a magnet and a coil of wire.",
  stage("lab", cam((0.4, -1.0, 1.5), (0.6, -2.2, 1.6), (0, -0.05, 1.35), (0, 0, 1.2)),
        props=[P("wall_switch", (0, 0, 1.35), args={"flip": 0.35}), P("bulb", (0.0, -0.3, 2.0), args={"on": 0.36})],
        env_opts={"wall_y": 0.02, "world": [0.005, 0.005, 0.008]}), hold=1.2)

spec = {
    "slug": "02-electricity",
    "format": "long",
    "title": "The Scientist Who Discovered Electricity",
    "description": ("Nobody discovered electricity alone - but one poor bookbinder's apprentice worked out how to make it, "
                    "move it and understand it. This is the story of Michael Faraday, told in 3D animation."),
    "tags": ["Michael Faraday", "electricity", "electromagnetic induction", "history of science", "physics",
             "electric generator", "Humphry Davy", "Maxwell", "Faraday cage", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.12, "sentence_silence": 0.28,
              "pronunciations": {"Oersted": "Er-sted", "Gilbert": "Gil-bert", "B.C.": "B C", "Wi-Fi": "Why-Fye",
                                 "elektron": "ee-LEK-tron", "electricus": "ee-LEK-tri-kus"}},
    "render": {"width": 960, "height": 540, "samples": 8, "fps": 12},
    "still_render": {"width": 1920, "height": 1080, "samples": 16},
    "output_fps": 24,
    "gap_seconds": 0.35,
    "chapter_gap_seconds": 0.9,
    "music_mood": "reflective",
    "burn_captions": False,
    "sources": [
        "https://www.rigb.org/explore-science/explore/blog/who-was-michael-faraday",
        "https://www.britannica.com/biography/Michael-Faraday",
        "https://www.theiet.org/membership/library-and-archives/the-iet-archives/biographies/michael-faraday",
        "https://www.britannica.com/biography/Hans-Christian-Orsted",
        "https://www.britannica.com/biography/Alessandro-Volta",
        "https://www.britannica.com/biography/William-Gilbert",
    ],
    "shots": shots,
}

if __name__ == "__main__":
    (HERE / "short.json").write_text(json.dumps(spec, indent=1, ensure_ascii=False))
    words = sum(len(s["line"].split()) for s in shots)
    print(f"{len(shots)} shots, {words} words, {sum(1 for s in shots if s.get('still'))} stills")
