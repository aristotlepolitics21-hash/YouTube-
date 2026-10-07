"""Shot list for long-form #10: How CRISPR Could Rewrite Human DNA.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

LABCOAT = {"skin": SKIN, "shirt": [0.88, 0.9, 0.93], "pants": [0.15, 0.15, 0.2], "boots": [0.04, 0.03, 0.02]}
DOUDNA = {"hair": [0.45, 0.32, 0.18], "sleeves": "long", "outfit": LABCOAT}
CHARPENTIER = {"hair": [0.12, 0.08, 0.06], "sleeves": "long", "outfit": {**LABCOAT, "pants": [0.1, 0.1, 0.12]}}
MOJICA = {"hair": [0.5, 0.45, 0.4], "sleeves": "long", "outfit": LABCOAT}
PATIENT = {"hair": [0.08, 0.06, 0.05], "sleeves": "long",
           "outfit": {"skin": [0.45, 0.3, 0.22], "shirt": [0.3, 0.45, 0.7], "pants": [0.2, 0.2, 0.3], "boots": [0.1, 0.08, 0.06]}}
DOCTOR = {"hair": [0.25, 0.18, 0.1], "sleeves": "long", "outfit": {**LABCOAT, "shirt": [0.3, 0.6, 0.6], "pants": [0.3, 0.6, 0.6]}}
LAB = {"wall": [0.55, 0.6, 0.62], "world": [0.05, 0.05, 0.055]}
MICRO = {"horizon": [0.04, 0.12, 0.2], "zenith": [0.0, 0.01, 0.03]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
BENCH = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))
HELIX = cam((0, -2.4, 0.9), (0.3, -2.0, 0.8), (0, 0, 0.6))

# ===================================================================== HOOK
S("Inside almost every cell of your body is a set of instructions, three billion letters long. Your DNA.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.4, 1.0), (0, 0, 1.0)), props=[P("cell", (0, 0, 1.0)), P("dna_helix", (0, 0, 1.0), scale=0.3)], env_opts=MICRO))
S("A single wrong letter in that code can cause a devastating disease.",
  stage("studio", HELIX, props=[P("dna_helix", (0, 0, 0.6), args={"spin": 30})], texts=[T("1 WRONG LETTER", (0, 0.3, 1.1), 0.12, (1.0, 0.4, 0.4), pop=0.4)], env_opts=MICRO))
S("For most of history, there was nothing we could do about it. Then, scientists found a tool that can find any spot in the genome, and cut it, with incredible precision.",
  stage("studio", HELIX, props=[P("dna_helix", (0, 0, 0.6), args={"cut": [0.65, 0.2], "spin": 20}), P("cas9", (0.2, -0.35, 0.75), scale=0.8,
        anim=[[0, {"at": [-1.0, -0.35, 0.75]}], [0.6, {"at": [0.2, -0.35, 0.75]}]])], env_opts=MICRO))
S("It's called CRISPR. And it was borrowed from bacteria.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.8, 1.15), (0, 0, 1.1)), texts=[T("CRISPR", (0, 0, 1.4), 0.4, (0.5, 0.95, 0.6), pop=0.08),
        T("HOW IT COULD REWRITE HUMAN DNA", (0, 0, 1.0), 0.11, (1, 1, 1), pop=0.3)], props=[P("bacteria", (0, 0.6, 0.4), args={"n": 12, "area": 0.6})], env_opts=MICRO))

# ===================================================================== DNA BASICS
S("DNA is a long, twisted ladder. Each rung is a pair of chemical letters: A, T, G and C. Their order spells out genes, the recipes for making proteins.",
  stage("studio", cam((0.5, -1.6, 0.8), (0.2, -1.3, 0.7), (0, 0, 0.6)), props=[P("dna_helix", (0, 0, 0.6))],
        texts=[T("A   T   G   C", (0, 0.3, 1.05), 0.14, pop=0.3)], env_opts=MICRO), chapter="The code of life")
S("If you printed out the DNA in one human cell, it would fill around two hundred thick phone books. And if you stretched it out, it would be about two metres long.",
  stage("studio", cam((0.2, -1.4, 0.9), (0.1, -1.2, 0.8), (0, 0, 0.3)), props=[P("books", args={"n": 12, "seed": 3}), P("books", (0.4, 0.1, 0), args={"n": 10, "seed": 4}),
        P("chromosome", (-0.5, 0.2, 0.4))], env_opts=MICRO), still=True)
S("Some diseases, like sickle cell disease, come from a single misspelled letter in a single gene.",
  stage("studio", cam((0, -2.8, 0.9), (0.2, -2.4, 0.8), (0, 0, 0.6)), props=[P("blood_cells", (0, 0.4, 0), args={"sickle": 5})], env_opts={"horizon": [0.25, 0.04, 0.05]}))
S("In sickle cell disease, red blood cells bend into stiff crescent shapes. They get stuck in blood vessels, causing terrible pain and organ damage.",
  stage("studio", cam((0, -1.8, 0.7), (0.2, -1.5, 0.65), (0, 0.3, 0.6)), props=[P("blood_cells", (0, 0.4, 0), args={"sickle": 7, "seed": 9})],
        env_opts={"horizon": [0.25, 0.04, 0.05]}))
S("For decades, scientists dreamed of fixing faulty genes directly. But the early tools for editing DNA were slow, expensive, and hard to aim.",
  stage("lab", BENCH, cast=[who(DOCTOR, pose=WORK)], props=[TABLE, P("microscope", (0.4, -0.05, TOP)), P("glassware", (-0.4, -0.1, TOP), args={"n": 3})], env_opts=LAB),
  still=True)

# ===================================================================== DISCOVERY IN BACTERIA
S("The answer came from somewhere unexpected. In the nineteen nineties, a Spanish microbiologist named Francisco Mojica was studying microbes from salt marshes.",
  stage("sky", cam((0, -3.0, 1.4), (0.3, -2.6, 1.3), (0, 0, 1.0)), cast=[who(MOJICA, pose=STAND)],
        env_opts={"sky": {"horizon": [0.95, 0.8, 0.6], "zenith": [0.3, 0.5, 0.85]}, "floor": [0.85, 0.82, 0.75]}), still=True, chapter="A bacterial immune system")
S("In their DNA, he noticed strange repeated sequences, separated by unique spacers. Other scientists had spotted similar repeats in nineteen eighty seven.",
  stage("studio", cam((0, -2.6, 0.8), (0.2, -2.2, 0.75), (0, 0, 0.6)), props=[P("dna_helix", (0, 0, 0.6), args={"edit": [0.3, -0.6, 3]})], env_opts=MICRO))
S("He and colleagues named them CRISPR: clustered regularly interspaced short palindromic repeats.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("C  R  I  S  P  R", (0, 0, 1.2), 0.22, (0.5, 0.95, 0.6), pop=0.05),
        T("CLUSTERED REGULARLY INTERSPACED", (0, 0, 0.9), 0.08, (1, 1, 1), pop=0.3), T("SHORT PALINDROMIC REPEATS", (0, 0, 0.75), 0.08, (1, 1, 1), pop=0.45)]),
  still=True, still_at=0.85)
S("Around two thousand and five, Mojica worked out what the spacers were: snippets of DNA from viruses that had attacked the bacteria before.",
  stage("studio", cam((0.6, -1.6, 0.6), (0.4, -1.3, 0.55), (0, 0, 0.4)), props=[P("phage", args={"attack": [0.1, 0.7]}), P("bacteria", args={"n": 3, "area": 0.25})], env_opts=MICRO))
S("CRISPR was an immune system. The bacteria kept a library of mugshots of their enemies.",
  stage("studio", cam((0, -2.6, 0.9), (0.2, -2.2, 0.85), (0, 0, 0.6)), props=[P("dna_helix", (0, 0, 0.6), args={"edit": [0.2, 0.4, 1]})],
        texts=[T("VIRUS MUGSHOTS", (0, 0.3, 1.05), 0.11, pop=0.3)], env_opts=MICRO))
S("If the same virus attacked again, the bacteria copied the matching mugshot into a short strand of RNA. That strand guided a cutting protein to the virus's DNA, and chopped it up.",
  stage("studio", HELIX, props=[P("dna_helix", (0, 0, 0.6), args={"cut": [0.7, 0.2], "spin": 20}), P("cas9", (0.2, -0.35, 0.75), scale=0.8,
        anim=[[0, {"at": [-1.2, -0.35, 0.75]}], [0.65, {"at": [0.2, -0.35, 0.75]}]])], env_opts=MICRO))
S("In two thousand and seven, scientists at the yoghurt company Danisco confirmed it, while trying to protect the bacteria they used to make yoghurt and cheese from viruses.",
  stage("studio", cam((0.25, -0.75, 0.35), (0.18, -0.65, 0.32), (0, 0, 0.1)), props=[P("glassware", (0, 0.05, 0), args={"n": 3, "colors": [[0.95, 0.95, 0.9], [0.95, 0.9, 0.8], [1.0, 0.95, 0.85]]})]),
  still=True)

# ===================================================================== 2012
S("The most important cutting protein is called Cas nine.",
  stage("studio", cam((0, -1.4, 0.6), (0.3, -1.2, 0.55), (0, 0, 0.5)), props=[P("cas9", (0, 0, 0.5), spin=["z", 120])], env_opts=MICRO), chapter="The breakthrough")
S("In two thousand and eleven, the French microbiologist Emmanuelle Charpentier met the American biochemist Jennifer Doudna at a conference in Puerto Rico. They decided to work together.",
  stage("sky", cam((0, -2.6, 1.6), (0.2, -2.2, 1.5), (0, 0.3, 1.25)), cast=[who(CHARPENTIER, at=(-0.45, 0.35, 0), turn=-15, pose=PRESENT, scale=0.95),
                                                                            who(DOUDNA, at=(0.45, 0.35, 0), turn=15, pose=STAND, scale=0.95)],
        env_opts={"sky": {"horizon": [0.95, 0.75, 0.55], "zenith": [0.2, 0.45, 0.85]}, "floor": [0.85, 0.75, 0.55]}), still=True)
S("In June twenty twelve, they published a landmark paper. They showed that Cas nine could be reprogrammed with a guide RNA to cut any DNA sequence they chose.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "A PROGRAMMABLE DUAL-RNA-GUIDED DNA ENDONUCLEASE", "n": 2})],
        texts=[T("2012", (0, 0.3, 0.45), 0.12, pop=0.3)]), still=True, still_at=0.7)
S("Here's how it works. Scientists write a short guide sequence, about twenty letters long, that matches the target.",
  stage("studio", cam((0.3, -1.0, 0.6), (0.2, -0.85, 0.55), (0, 0, 0.5)), props=[P("cas9", (0, 0, 0.5))],
        texts=[T("20 LETTERS", (0, 0.3, 0.85), 0.08, (1.0, 0.85, 0.2), pop=0.3)], env_opts=MICRO))
S("Cas nine slides along the DNA. When the guide finds its perfect match, Cas nine cuts both strands of the double helix.",
  stage("studio", HELIX, props=[P("dna_helix", (0, 0, 0.6), args={"cut": [0.75, 0.2], "spin": 15}),
                                P("cas9", (0.2, -0.35, 0.75), scale=0.8, anim=[[0, {"at": [-1.2, -0.35, 0.75]}], [0.7, {"at": [0.2, -0.35, 0.75]}]])], env_opts=MICRO))
S("The cell then rushes to repair the break. Scientists can use that moment to switch a gene off, or to slip in a new, corrected piece of DNA.",
  stage("studio", HELIX, props=[P("dna_helix", (0, 0, 0.6), args={"cut": [0.1, 0.2], "edit": [0.5, 0.2, 3], "spin": 15})], env_opts=MICRO))
S("It's like a word processor for genes: find, cut, and replace.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("FIND", (-0.7, 0, 1.0), 0.18, pop=0.1), T("CUT", (0, 0, 1.0), 0.18, (1.0, 0.5, 0.3), pop=0.35),
        T("REPLACE", (0.75, 0, 1.0), 0.18, (0.4, 1.0, 0.6), pop=0.6)]), still=True, still_at=0.85)
S("Within months, teams led by Feng Zhang and George Church showed that it worked in human cells too.",
  stage("lab", BENCH, cast=[who(DOCTOR | {"hair": [0.05, 0.04, 0.04], "outfit": LABCOAT}, pose=WORK)], props=[TABLE, P("microscope", (0.1, -0.1, TOP))], env_opts=LAB),
  still=True)
S("CRISPR was cheap, fast and easy. Labs all over the world began using it almost overnight.",
  stage("lab", cam((0, -3.4, 1.9), (0.3, -3.0, 1.8), (0, 0.3, 1.0)),
        cast=[who(DOCTOR | {"hair": [0.1 + 0.15 * i, 0.08, 0.05], "outfit": LABCOAT}, at=(x, 0.35, 0), pose=WORK, scale=0.95) for i, x in enumerate((-1.1, 0, 1.1))],
        props=[P("table", (0, -0.1, 0), args={"w": 3.2}), P("microscope", (-1.1, -0.1, TOP)), P("petri_dish", (0, -0.1, TOP), args={"mould": False}), P("glassware", (1.1, -0.1, TOP), args={"n": 3})],
        env_opts=LAB), still=True)
S("In twenty twenty, Charpentier and Doudna won the Nobel Prize in Chemistry. It was the first time a science Nobel had been shared only by women.",
  stage("hall", cam((0, -2.6, 1.6), (0, -2.2, 1.5), (0, 0.4, 1.2)), cast=[who(CHARPENTIER, at=(-0.45, 0.4, 0), turn=-10, scale=0.95), who(DOUDNA, at=(0.45, 0.4, 0), turn=10, scale=0.95)],
        props=[P("medal", (0, -0.2, 1.7), spin=["z", 40])], texts=[T("NOBEL 2020", (0, 0.2, 2.0), 0.14, pop=0.2)]), still=True)

# ===================================================================== MEDICINE
S("The first big medical success came for sickle cell disease.",
  stage("studio", cam((0, -2.8, 0.9), (0.2, -2.4, 0.8), (0, 0, 0.6)), props=[P("blood_cells", (0, 0.4, 0), args={"sickle": 5, "fix": 0.5})],
        env_opts={"horizon": [0.25, 0.04, 0.05]}), chapter="Curing disease")
S("Doctors take a patient's own blood stem cells, and use CRISPR to switch on a gene for a type of haemoglobin we all make before we're born.",
  stage("lab", BENCH, cast=[who(DOCTOR, pose=WORK)], props=[TABLE, P("vials", (0, -0.1, TOP)), P("syringe", (0.4, -0.15, TOP + 0.03))], env_opts=LAB), still=True)
S("Those edited cells are put back, and begin making healthy red blood cells.",
  stage("studio", cam((0, -2.8, 0.9), (0.2, -2.4, 0.8), (0, 0, 0.6)), props=[P("blood_cells", (0, 0.4, 0), args={"sickle": 6, "fix": 0.2, "seed": 3})]))
S("Victoria Gray, from Mississippi, was the first American with sickle cell disease to be treated this way, in twenty nineteen. Her pain crises stopped.",
  stage("sky", cam((0.5, -2.4, 1.6), (0.35, -2.0, 1.55), "cast0.head"), cast=[who(PATIENT | {"hair": [0.05, 0.04, 0.04], "outfit": {**PATIENT["outfit"], "shirt": [0.8, 0.4, 0.6]}}, pose=STAND, scale=0.95)],
        env_opts={"sky": {"horizon": [0.9, 0.8, 0.6], "zenith": [0.25, 0.45, 0.85]}, "floor": [0.3, 0.55, 0.25]}), still=True)
S("In late twenty twenty three, regulators in Britain and the United States approved the treatment, called Casgevy. It was the world's first approved CRISPR medicine.",
  stage("studio", cam((0.25, -0.8, 0.35), (0.18, -0.65, 0.32), (0, 0, 0.1)), props=[P("vials", args={"n": 4, "label": "CASGEVY"})], texts=[T("2023", (0, 0.2, 0.3), 0.08, pop=0.3)]),
  still=True)
S("Scientists are now testing CRISPR against inherited blindness, high cholesterol, some cancers, and other genetic diseases.",
  stage("studio", cam((0, -3.2, 1.2), (0.3, -2.8, 1.1), (0, 0, 0.8)), props=[P("cell", (-0.8, 0, 0.8), scale=0.6), P("dna_helix", (0.6, 0, 0.8), scale=0.6)], env_opts=MICRO))
S("In twenty twenty five, doctors in Philadelphia treated a baby boy named KJ, born with a rare and deadly liver disorder, with a gene-editing therapy designed just for him.",
  stage("lab", cam((0, -2.0, 1.4), (0, -1.7, 1.3), (0, 0.3, 0.9)), cast=[who(DOCTOR, at=(0.6, 0.3, 0), turn=20, pose=WORK)],
        props=[P("hospital_bed", (-0.3, 0.3, 0), scale=0.6)], env_opts=LAB), still=True)

# ===================================================================== BEYOND MEDICINE
S("CRISPR is also changing farming. Researchers are using it to make crops that resist disease, survive drought, or simply keep fresh for longer.",
  stage("sky", cam((0, -4.5, 1.4), (0.4, -4.0, 1.3), (0, 0, 0.4)), props=[P("cantaloupe", (-0.5, 0, 0), args={"mould": False}), P("bread", (0.4, 0, 0))],
        env_opts={"sky": {"horizon": [0.9, 0.85, 0.65], "zenith": [0.25, 0.45, 0.85]}, "floor": [0.45, 0.6, 0.25]}), still=True, chapter="Beyond medicine")
S("Some scientists want to use it to spread genes through wild mosquitoes that stop them carrying malaria, a disease that kills hundreds of thousands of people every year.",
  stage("sky", cam((0, -3, 1.6), (0.3, -2.6, 1.6), (0, 0, 1.6)), props=[P("birds", (0, 0, 1.6), scale=0.4, args={"n": 10, "area": 2.0})],
        env_opts={"sky": {"horizon": [0.85, 0.65, 0.4], "zenith": [0.25, 0.35, 0.6]}, "floor": [0.25, 0.4, 0.2]}))

# ===================================================================== ETHICS
S("But CRISPR also raises hard questions.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("?", (0, 0, 1.0), 0.5, (1.0, 0.5, 0.3), pop=0.1)], env_opts=MICRO), still=True,
  chapter="The hard questions")
S("Editing a patient's blood cells affects only that person. But editing an embryo would change every cell, including eggs and sperm, so the changes would pass to future generations.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.6, 1.0), (0, 0, 1.0)), props=[P("cell", (0, 0, 1.0))], env_opts=MICRO))
S("In twenty eighteen, a Chinese scientist, He Jiankui, announced that he had secretly edited the DNA of human embryos, and that twin girls had been born.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "GENE-EDITED BABIES", "n": 3})]), still=True, still_at=0.7)
S("Scientists around the world condemned it as reckless and unethical. He was sentenced to three years in prison.",
  stage("hall", cam((0, -2.4, 1.6), (0, -2.0, 1.55), (0, 0.4, 1.3)), props=[P("table", (0, 0.6, 0), args={"w": 2.0})], texts=[T("2019", (0, 1.0, 1.9), 0.2, pop=0.2)]),
  still=True)
S("Most countries now ban or tightly restrict editing embryos for pregnancy. Deciding where the limits should be is a question for all of us, not just scientists.",
  stage("lab", cam((0, -3.0, 1.7), (0.3, -2.6, 1.6), (0, 0.3, 1.1)),
        cast=[who(DOUDNA, at=(-0.9, 0.35, 0), turn=-15, pose=PRESENT, scale=0.95), who(DOCTOR, at=(0, 0.45, 0)), who(PATIENT, at=(0.9, 0.35, 0), turn=15)], env_opts=LAB), still=True)

# ===================================================================== CLOSE
S("A defence system that bacteria evolved to fight viruses has become one of the most powerful tools in the history of medicine.",
  stage("studio", HELIX, props=[P("dna_helix", (0, 0, 0.6), args={"spin": 30}), P("phage", (1.2, 0.4, 0.3), scale=0.5), P("cas9", (0.2, -0.35, 0.75), scale=0.8)], env_opts=MICRO),
  chapter="Close")
S("We can now rewrite the code of life. The question is no longer whether we can. It's how wisely we choose to.",
  stage("studio", cam((0.3, -0.8, 0.7), (0, -3.4, 1.2), (0, 0, 0.6), (0, 0, 0.6)), props=[P("dna_helix", (0, 0, 0.6), args={"edit": [0.3, 0.0, 2], "spin": 40})],
        env_opts=MICRO), hold=1.5)

write(HERE, {
    "slug": "10-crispr",
    "title": "How CRISPR Could Rewrite Human DNA",
    "description": ("A bacterial immune system became a word processor for genes. How CRISPR works, how it cured sickle cell disease, "
                    "and the hard questions it raises, told in 3D animation."),
    "tags": ["CRISPR", "gene editing", "Cas9", "Jennifer Doudna", "Emmanuelle Charpentier", "sickle cell", "Casgevy", "DNA", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.25, "sentence_silence": 0.28,
              "pronunciations": {"CRISPR": "Crisper", "Cas nine": "Cass nine", "Mojica": "Mo-hee-ka", "Charpentier": "Shar-pon-tee-ay",
                                 "Doudna": "Dowd-na", "Danisco": "Dan-isco", "Casgevy": "Cas-jev-ee", "Jiankui": "Jyen-kway", "haemoglobin": "hee-mo-glow-bin"}},
    "music_mood": "hopeful",
    "sources": [
        "https://www.nobelprize.org/prizes/chemistry/2020/press-release/",
        "https://www.science.org/doi/10.1126/science.1225829",
        "https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapies-treat-patients-sickle-cell-disease",
        "https://www.npr.org/sections/health-shots/2019/07/29/744826505/sickle-cell-patient-reveals-why-she-is-volunteering-for-landmark-gene-editing-st",
        "https://www.chop.edu/news/world-s-first-patient-treated-personalized-crispr-gene-editing-therapy-childrens-hospital",
        "https://www.nature.com/articles/d41586-019-03891-1",
    ],
}, S.shots)
