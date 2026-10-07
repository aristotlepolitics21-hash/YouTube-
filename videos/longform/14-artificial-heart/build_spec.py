"""Shot list for long-form #14: How Scientists Made an Artificial Heart.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

SCRUBS = {"skin": SKIN, "shirt": [0.25, 0.55, 0.5], "pants": [0.25, 0.55, 0.5], "boots": [0.9, 0.9, 0.9]}
SURGEON = {"hair": [0.25, 0.18, 0.1], "sleeves": "long", "outfit": SCRUBS}
SURGEON2 = {"hair": [0.55, 0.5, 0.45], "sleeves": "long", "outfit": {**SCRUBS, "shirt": [0.2, 0.4, 0.65], "pants": [0.2, 0.4, 0.65]}}
LABCOAT = {"skin": SKIN, "shirt": [0.88, 0.9, 0.93], "pants": [0.15, 0.15, 0.2], "boots": [0.04, 0.03, 0.02]}
ENGINEER = {"hair": [0.2, 0.15, 0.1], "sleeves": "long", "outfit": LABCOAT}
PATIENT = {"hair": [0.5, 0.45, 0.4], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.75, 0.8, 0.9], "pants": [0.75, 0.8, 0.9], "boots": SKIN}}
WALKER = {"hair": [0.3, 0.2, 0.1], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.3, 0.45, 0.7], "pants": [0.2, 0.2, 0.3], "boots": [0.1, 0.08, 0.06]}}
LYING = {"raise_arm": {"L": -40, "R": -40}, "elbow": {"L": 5, "R": 5}, "curl": {"L": 20, "R": 20}}
OR = {"wall": [0.45, 0.6, 0.58], "world": [0.04, 0.05, 0.05]}
LAB = {"wall": [0.55, 0.6, 0.62], "world": [0.05, 0.05, 0.055]}
BODY = {"horizon": [0.2, 0.04, 0.06], "zenith": [0.01, 0.0, 0.01]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
HEART = cam((0.3, -1.4, 0.7), (0.2, -1.2, 0.65), (0, 0, 0.55))
BED = lambda extra=(), cast=(): stage("lab", cam((0, -2.8, 1.8), (0.3, -2.4, 1.7), (0, 0.3, 0.9)),
                                       cast=[who(PATIENT, at=(0, -0.55, 0.74), rot=(-90, 0, 0), pose=LYING)] + list(cast),
                                       props=[P("hospital_bed", (0, 0.3, 0)), P("surgical_lights", (0, 0.3, 0))] + list(extra), env_opts=OR)

# ===================================================================== HOOK
S("Your heart beats about a hundred thousand times a day. Over a lifetime, that's around three billion beats, without a single day off.",
  stage("studio", HEART, props=[P("heart_organ", (0, 0, 0.5))], texts=[T("100,000 / DAY", (0, 0.3, 1.0), 0.1, pop=0.3)], env_opts=BODY))
S("It pumps around seven thousand litres of blood every day, enough to fill a small swimming pool every few months.",
  stage("studio", cam((0.8, -2.0, 0.9), (0.5, -1.7, 0.8), (0.3, 0, 0.55)), props=[P("heart_organ", (-0.3, 0, 0.5)), P("blood_cells", (0.6, 0.2, 0.0), scale=0.6)],
        env_opts=BODY))
S("But when it fails, there is no backup. Heart disease is the world's biggest killer.",
  stage("studio", HEART, props=[P("heart_organ", (0, 0, 0.5), args={"beats": [[0, 0.4]]})], texts=[T("NO. 1 KILLER", (0, 0.3, 1.0), 0.1, (1.0, 0.4, 0.4), pop=0.5)], env_opts=BODY))
S("So for seventy years, scientists and surgeons have tried to do something incredible: build a machine that can replace the human heart.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.8, 1.15), (0, 0, 1.1)), texts=[T("THE ARTIFICIAL HEART", (0, 0, 1.4), 0.26, (1.0, 0.45, 0.45), pop=0.08)],
        props=[P("artificial_heart", (0, 0.4, 0.55))], env_opts=BODY))

# ===================================================================== HOW THE HEART WORKS
S("Your heart is really two pumps, side by side.",
  stage("studio", HEART, props=[P("heart_organ", (0, 0, 0.5))], env_opts=BODY), chapter="Two pumps in one")
S("The right side sends tired, oxygen-poor blood to the lungs. The left side, the stronger one, pushes fresh, oxygen-rich blood out to the whole body.",
  stage("studio", cam((0.8, -2.2, 0.9), (0.5, -1.8, 0.8), (0, 0, 0.55)), props=[P("heart_organ", (0, 0, 0.5)), P("blood_cells", (0.9, 0.2, 0.2), scale=0.5, args={"n": 6})],
        texts=[T("LUNGS", (-0.7, 0, 1.1), 0.1, (0.4, 0.6, 1.0), pop=0.2), T("BODY", (0.7, 0, 1.1), 0.1, (1.0, 0.4, 0.4), pop=0.5)], env_opts=BODY))
S("Four valves act like one-way doors, so blood only flows forwards. And a natural pacemaker sends an electrical spark to time every beat.",
  stage("studio", HEART, props=[P("heart_organ", (0, 0, 0.5)), P("spikes", (0, -0.4, 0.15), scale=0.4, args={"channels": 1})], env_opts=BODY))
S("Copying that with metal and plastic, inside a living body, for years, turned out to be one of the hardest problems in medicine.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.98)), props=[TABLE, P("artificial_heart", (0, -0.1, TOP + 0.15), scale=0.8), P("glassware", (0.45, 0, TOP), args={"n": 2})],
        env_opts=LAB), still=True)
S("And unlike skin or bone, the heart barely repairs itself. In an adult, only about one percent of heart muscle cells are replaced each year, so damage from a heart attack is largely permanent.",
  stage("studio", HEART, props=[P("heart_organ", (0, 0, 0.5))], env_opts=BODY), still=True)

# ===================================================================== HEART-LUNG MACHINE
S("The first step was a machine that could take over from the heart for a few hours, so surgeons could operate on it.",
  stage("lab", cam((1.5, -3.6, 1.8), (1.2, -3.2, 1.7), (0.6, 0, 1.0), lens=30), props=[P("heart_lung_machine"), P("hospital_bed", (1.4, 0, 0)), P("surgical_lights", (1.4, 0, 0))],
        env_opts=OR), chapter="The heart-lung machine")
S("An American surgeon, John Gibbon, spent nearly twenty years building one, partly funded by IBM engineers.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(SURGEON2, pose=WORK)], props=[P("heart_lung_machine", (0.9, 0.3, 0), scale=0.7)], env_opts=LAB),
  still=True)
S("His obsession began in the early nineteen thirties, when he sat all night beside a woman dying from a blood clot in her lungs, and imagined a machine that could take over while surgeons removed it.",
  BED([], [who(SURGEON2, at=(-0.9, 0.2, 0), turn=-40, pose=STAND)]), still=True)
S("His machine spread the blood in thin films over metal screens inside a chamber of oxygen, doing the work of the lungs, while a pump did the work of the heart.",
  stage("lab", cam((1.0, -2.2, 1.5), (0.8, -1.9, 1.45), (0, 0, 1.0)), props=[P("heart_lung_machine")], env_opts=OR), still=True)
S("On the sixth of May, nineteen fifty three, he used it during an operation to repair a hole in the heart of an eighteen year old student, Cecelia Bavolek. The machine kept her alive for twenty six minutes. She recovered completely.",
  BED([P("heart_lung_machine", (1.4, 0.2, 0), scale=0.8)], [who(SURGEON, at=(-0.9, 0.2, 0), turn=-40, pose=WORK)]))
S("Open-heart surgery was born. But surgeons still dreamed of something that could replace a heart for good.",
  BED([P("heart_lung_machine", (1.4, 0.2, 0), scale=0.8)]), still=True)
S("In nineteen fifty eight, Swedish doctors implanted the first pacemaker, a small device that sends electrical pulses to keep a slow heart beating steadily. Its first patient, Arne Larsson, went on to receive twenty six of them, and outlived both its inventors.",
  stage("studio", cam((0.4, -1.4, 0.8), (0.3, -1.2, 0.75), (0.2, 0, 0.6)), props=[P("pacemaker", (0, 0, 0.7), scale=1.5), P("heart_organ", (0.6, 0, 0.45), scale=0.8)], env_opts=BODY))

# ===================================================================== TRANSPLANTS
S("In December nineteen sixty seven, in Cape Town, South Africa, surgeon Christiaan Barnard performed the first human heart transplant.",
  BED([], [who(SURGEON, at=(-0.9, 0.2, 0), turn=-40, pose=WORK), who(SURGEON2, at=(0.9, 0.2, 0), turn=40, pose=WORK)]), chapter="Transplants, and a shortage")
S("His patient, Louis Washkansky, lived for eighteen days.",
  BED(), still=True)
S("The new heart itself worked well. He died of pneumonia, because the drugs that stopped his body rejecting it had also weakened his defences against infection.",
  BED(), still=True)
S("It took until the nineteen eighties, and a new drug called cyclosporine, for transplants to become truly reliable. Today, more than four thousand heart transplants happen every year in the United States alone.",
  stage("studio", HEART, props=[P("heart_organ", (0, 0, 0.5))], env_opts=BODY), still=True)
S("But there's a problem that has never gone away: there are never enough donor hearts. Many patients die while waiting.",
  stage("lab", cam((0, -4.0, 2.0), (0.3, -3.6, 1.9), (0, 0.6, 0.8), lens=30),
        props=[P("hospital_bed", (x, 0.3, 0)) for x in (-2.2, 0, 2.2)], env_opts={"wall": [0.35, 0.4, 0.42], "world": [0.02, 0.02, 0.02]}), still=True)
S("That's why engineers kept chasing the dream of a mechanical heart.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.98)), props=[TABLE, P("artificial_heart", (0, -0.1, TOP + 0.15), scale=0.8)], env_opts=LAB))

# ===================================================================== FIRST ARTIFICIAL HEARTS
S("In April nineteen sixty nine, in Houston, surgeon Denton Cooley implanted the first total artificial heart in a human, designed by Domingo Liotta.",
  BED([P("artificial_heart", (0.6, -0.3, 1.3), scale=0.8)], [who(SURGEON2, at=(0.9, 0.2, 0), turn=40, pose=WORK)]), chapter="The first artificial hearts")
S("It kept the patient, Haskell Karp, alive for sixty four hours, until a donor heart was found. It was meant as a bridge, not a permanent replacement.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("64 HOURS", (0, 0, 1.0), 0.3, pop=0.1)], env_opts=BODY), still=True, still_at=0.8)
S("In Salt Lake City, a team at the University of Utah, including the engineer Robert Jarvik, built a stronger design: the Jarvik seven.",
  stage("lab", cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15)), cast=[who(ENGINEER, pose=WORK)],
        props=[TABLE, P("artificial_heart", (0, -0.1, TOP + 0.15), scale=0.8)], env_opts=LAB), still=True)
S("Two plastic pumping chambers replaced the heart's two lower chambers. Inside each, a flexible diaphragm was pushed by puffs of compressed air, squeezing blood out.",
  stage("studio", cam((0.3, -1.2, 0.7), (0.2, -1.0, 0.65), (0, 0, 0.6)), props=[P("artificial_heart", (0, 0, 0.6))], env_opts=BODY))
S("On the second of December, nineteen eighty two, a sixty one year old dentist named Barney Clark became the first person to receive one as a permanent replacement.",
  BED([P("artificial_heart", (0.6, -0.3, 1.3), scale=0.8)], [who(SURGEON, at=(-0.9, 0.2, 0), turn=-40, pose=WORK)]))
S("He lived for a hundred and twelve days. But he was tied by tubes to an air compressor the size of a washing machine, and suffered strokes and infections.",
  BED([P("heart_lung_machine", (1.4, 0.2, 0), scale=0.8)]), still=True)
S("The world watched with a mix of wonder and unease. Was this extending life, or just extending suffering?",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "MAN WITH A MECHANICAL HEART", "n": 3})]), still=True, still_at=0.7)
S("Another patient, William Schroeder, lived for six hundred and twenty days with a Jarvik seven, and even went on a fishing trip.",
  stage("sky", cam((0, -3.0, 1.4), (0.3, -2.6, 1.3), (0, 0, 1.0)), cast=[who(WALKER, pose=STAND)], props=[P("heart_lung_machine", (1.0, 0.3, 0), scale=0.6)],
        env_opts={"sky": {"horizon": [0.85, 0.8, 0.7], "zenith": [0.25, 0.45, 0.85]}, "floor": [0.1, 0.35, 0.55]}), still=True)
S("Both implants were led by the same surgeon, William DeVries. But the strokes kept coming, and in nineteen ninety, US regulators withdrew approval for the Jarvik heart.",
  BED([P("artificial_heart", (0.7, -0.3, 1.3), scale=0.6)], [who(SURGEON, at=(-0.9, 0.2, 0), turn=-40, pose=STAND)]), still=True)

# ===================================================================== LVADS
S("Doctors realised that most failing hearts don't need to be replaced completely. Often, just the left side, the main pump, is too weak.",
  stage("studio", HEART, props=[P("heart_organ", (0, 0, 0.5))], texts=[T("LEFT VENTRICLE", (0.5, 0.2, 0.95), 0.08, (1.0, 0.4, 0.4), pop=0.3)], env_opts=BODY),
  chapter="Helping a heart, not replacing it")
S("So they built smaller devices to help it. A left ventricular assist device, or LVAD, is a pump about the size of a fist, attached to the heart.",
  stage("studio", cam((0.4, -1.4, 1.0), (0.3, -1.2, 0.95), (0.1, 0, 0.7)), props=[P("lvad", (0, 0, 0.9)), P("heart_organ", (-0.35, 0, 0.75), scale=0.6)], env_opts=BODY))
S("The first ones copied the heart, with pumping sacs that squeezed and relaxed, and wore out within a few years. Switching to spinning rotors made them smaller, quieter and far longer lasting.",
  stage("studio", cam((0.4, -1.4, 1.0), (0.3, -1.2, 0.95), (0.1, 0, 0.7)), props=[P("lvad", (0, 0, 0.9))], env_opts=BODY), still=True)
S("Modern LVADs don't beat at all. A tiny spinning rotor, often levitated by magnets so it never wears out, pushes blood in a smooth, continuous stream.",
  stage("studio", cam((0.25, -0.6, 1.0), (0.18, -0.5, 0.95), (0, 0, 0.92)), props=[P("lvad", (0, 0, 0.9))], env_opts=BODY))
S("That leads to something astonishing: many people with these pumps have no pulse. A doctor feeling their wrist would find nothing, even though they're perfectly alive.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(WALKER, pose=STAND)], props=[P("spikes", (0.9, 0.4, 1.4), scale=0.4, args={"channels": 1, "seed": 9})],
        env_opts=LAB), still=True)
S("A cable runs through the skin to a controller and batteries worn on a belt or in a bag. Patients can go home, walk, and even return to work.",
  stage("sky", cam((0, -3.0, 1.4), (0.3, -2.6, 1.3), (0, 0, 1.0)), cast=[who(WALKER, pose=STAND, walk=[[0, [-0.6, 0, 0]], [1, [0.4, 0, 0]]])],
        env_opts={"sky": {"horizon": [0.85, 0.85, 0.9], "zenith": [0.25, 0.45, 0.85]}, "floor": [0.3, 0.5, 0.2]}))
S("Tens of thousands of people have now lived with an LVAD, some for more than ten years. The former US vice president Dick Cheney lived with one for about twenty months, before a heart transplant.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(PATIENT | {"outfit": {**PATIENT["outfit"], "shirt": [0.15, 0.15, 0.2], "pants": [0.15, 0.15, 0.2]}}, pose=STAND)],
        env_opts={"wall": [0.35, 0.37, 0.42]}), still=True)

# ===================================================================== TODAY'S TOTAL HEARTS
S("Total artificial hearts are still used too, as a bridge for people whose whole heart has failed. The best known today, SynCardia, is a descendant of the Jarvik seven.",
  stage("studio", cam((0.3, -1.2, 0.7), (0.2, -1.0, 0.65), (0, 0, 0.6)), props=[P("artificial_heart", (0, 0, 0.6))], env_opts=BODY), chapter="A heart with no beat")
S("More than two thousand have been implanted. And instead of a washing-machine-sized compressor, patients can now carry a portable driver in a backpack.",
  stage("sky", cam((0, -3.0, 1.4), (0.3, -2.6, 1.3), (0, 0, 1.0)), cast=[who(WALKER | {"outfit": {**WALKER["outfit"], "shirt": [0.7, 0.4, 0.2]}}, pose=STAND)],
        props=[P("crates", (0.2, 0.4, 0.9), scale=0.25, args={"n": 1, "label": ""})], env_opts={"sky": {"horizon": [0.85, 0.85, 0.9], "zenith": [0.25, 0.45, 0.85]}, "floor": [0.3, 0.5, 0.2]}),
  still=True)
S("The newest designs go further. The BiVACOR heart, from an Australian inventor, Daniel Timms, replaces both pumps with a single spinning disc, floating in a magnetic field.",
  stage("studio", cam((0.25, -0.6, 1.0), (0.18, -0.5, 0.95), (0, 0, 0.92)), props=[P("lvad", (0, 0, 0.9), scale=1.6)], env_opts=BODY))
S("It has no valves, nothing to rub, and nothing to wear out. In twenty twenty four, the first patients received it in the United States.",
  stage("lab", cam((0, -2.8, 1.8), (0.3, -2.4, 1.7), (0, 0.3, 0.9)), cast=[who(PATIENT, at=(0, -0.55, 0.74), rot=(-90, 0, 0), pose=LYING), who(SURGEON, at=(0.9, 0.2, 0), turn=40, pose=WORK)],
        props=[P("hospital_bed", (0, 0.3, 0)), P("surgical_lights", (0, 0.3, 0))], env_opts=OR), still=True)
S("Fittingly, the first implant took place at the Texas Heart Institute in Houston, where Denton Cooley had implanted the first artificial heart fifty five years earlier. Timms had started the project as a PhD student in Brisbane, more than twenty years before.",
  BED([P("artificial_heart", (0.7, -0.3, 1.3), scale=0.6)], [who(SURGEON, at=(-0.9, 0.2, 0), turn=-40, pose=WORK)]), still=True)
S("In twenty twenty five, an Australian man in his forties became the first to leave hospital with one, living for more than a hundred days on a titanium heart, before receiving a donor heart.",
  stage("sky", cam((0, -3.0, 1.4), (0.3, -2.6, 1.3), (0, 0, 1.0)), cast=[who(WALKER, pose=STAND, walk=[[0, [-0.4, 0, 0]], [1, [0.4, 0, 0]]])],
        texts=[T("100+ DAYS", (0.9, 0.5, 1.8), 0.15, pop=0.3)], env_opts={"sky": {"horizon": [0.95, 0.75, 0.5], "zenith": [0.2, 0.45, 0.85]}, "floor": [0.75, 0.6, 0.35]}))

# ===================================================================== FUTURE
S("Other researchers are trying different routes: hearts from genetically modified pigs, and heart tissue grown from a patient's own stem cells.",
  stage("studio", cam((0, -3.0, 1.0), (0.3, -2.6, 0.95), (0, 0, 0.6)), props=[P("heart_organ", (-0.7, 0, 0.5), scale=0.8), P("cell", (0.7, 0, 0.6), scale=0.45), P("dna_helix", (0, 0.6, 1.1), scale=0.4)],
        env_opts=BODY), chapter="The future")
S("In twenty twenty two, a man in Maryland lived for two months with a gene-edited pig heart, the first such transplant in a living person.",
  BED([P("heart_organ", (0.6, -0.3, 1.3), scale=0.8)]), still=True)
S("His name was David Bennett, and he was fifty seven. A second patient received a pig heart the following year, and lived for about six weeks.",
  BED([P("heart_organ", (0.6, -0.3, 1.3), scale=0.8)], [who(SURGEON2, at=(-0.9, 0.2, 0), turn=-40, pose=STAND)]), still=True)
S("And researchers have printed small, beating patches of heart tissue using 3D printers loaded with living cells.",
  stage("studio", cam((0.25, -0.75, 0.35), (0.18, -0.65, 0.32), (0, 0, 0.1)), props=[P("petri_dish", args={"mould": False, "colonies": 40, "seed": 9}),
        P("heart_organ", (0, 0, 0.05), scale=0.2)], env_opts=BODY))
S("None of these is perfect yet. But each year, people who would once have died are living longer, at home, with their families.",
  stage("lab", cam((0, -3.0, 1.7), (0.3, -2.6, 1.6), (0, 0.3, 1.1)),
        cast=[who(WALKER, at=(-0.6, 0.35, 0), turn=-15), who(PATIENT | {"outfit": {**WALKER["outfit"], "shirt": [0.7, 0.3, 0.4]}, "hair": [0.3, 0.15, 0.08]}, at=(0.6, 0.35, 0), turn=15, scale=0.94)],
        env_opts={"wall": [0.6, 0.5, 0.4]}), still=True)

# ===================================================================== CLOSE
S("The human heart beats three billion times without stopping. Engineers have spent seventy years trying to match it.",
  stage("studio", HEART, props=[P("heart_organ", (0, 0, 0.5))], env_opts=BODY), chapter="Close")
S("They haven't beaten nature yet. But they've learned how to keep a human being alive, with a heart made by human hands.",
  stage("studio", cam((0.3, -0.9, 0.7), (0.6, -2.4, 0.9), (0, 0, 0.6), (0, 0, 0.6)), props=[P("artificial_heart", (-0.35, 0, 0.6), scale=0.8), P("heart_organ", (0.35, 0, 0.5), scale=0.8)],
        env_opts=BODY), hold=1.5)

write(HERE, {
    "slug": "14-artificial-heart",
    "title": "How Scientists Made an Artificial Heart",
    "description": ("From the first heart-lung machine to the Jarvik-7, LVADs that leave people with no pulse, and the magnetic BiVACOR heart: "
                    "seventy years of building a heart by hand, told in 3D animation."),
    "tags": ["artificial heart", "Jarvik-7", "LVAD", "heart transplant", "BiVACOR", "heart-lung machine", "pacemaker", "medical history", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.25, "sentence_silence": 0.28,
              "pronunciations": {"Bavolek": "Bav-oh-lek", "Washkansky": "Wash-kan-skee", "Liotta": "Lee-ot-ta", "Jarvik": "Jar-vik",
                                 "LVAD": "L-vad", "LVADs": "L-vads", "BiVACOR": "Bye-va-core", "SynCardia": "Sin-car-dee-a", "Timms": "Tims"}},
    "music_mood": "hopeful",
    "sources": [
        "https://www.heart.org/en/health-topics/heart-failure/treatment-options-for-heart-failure/implantable-medical-devices-for-heart-failure",
        "https://www.uchealth.org/today/history-of-the-artificial-heart/",
        "https://www.texasheart.org/about-us/history/",
        "https://healthcare.utah.edu/transplant/heart/history",
        "https://bivacor.com/news/",
        "https://www.umms.org/ummc/news/2022/university-of-maryland-school-of-medicine-faculty-scientists-and-clinicians-perform-historic-first-successful-transplant-of-porcine-heart-into-adult-human",
    ],
}, S.shots)
