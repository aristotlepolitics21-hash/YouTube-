"""Shot list for long-form #13: The Machine That Can Read Your Brain (brain-computer interfaces).  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

LABCOAT = {"skin": SKIN, "shirt": [0.88, 0.9, 0.93], "pants": [0.15, 0.15, 0.2], "boots": [0.04, 0.03, 0.02]}
BERGER = {"hair": [0.4, 0.38, 0.35], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.15, 0.13, 0.12], "pants": [0.15, 0.13, 0.12], "boots": [0.04, 0.03, 0.02]}}
SCIENTIST = {"hair": [0.25, 0.18, 0.1], "sleeves": "long", "outfit": LABCOAT}
PATIENT = {"hair": [0.3, 0.2, 0.1], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.3, 0.45, 0.7], "pants": [0.2, 0.2, 0.3], "boots": [0.1, 0.08, 0.06]}}
PATIENT2 = {"hair": [0.55, 0.45, 0.3], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.6, 0.3, 0.5], "pants": [0.2, 0.2, 0.3], "boots": [0.1, 0.08, 0.06]}}
SEATED = {"raise_arm": {"L": -35, "R": -35}, "arm_forward": {"L": 30, "R": 30}, "elbow": {"L": 70, "R": 70}, "curl": {"L": 30, "R": 30}, "head_nod": 5}
LAB = {"wall": [0.55, 0.6, 0.62], "world": [0.05, 0.05, 0.055]}
NEURO = {"horizon": [0.1, 0.04, 0.16], "zenith": [0.0, 0.0, 0.03]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
BENCH = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))
BRAIN = cam((0.9, -1.6, 0.9), (0.6, -1.3, 0.8), (0, 0, 0.6))
CHAIR = lambda who_, extra=(): stage("lab", cam((0, -2.4, 1.4), (0.3, -2.0, 1.35), (0.3, 0.2, 1.0)),
                                     cast=[who(who_, at=(-0.2, 0.4, 0), pose=SEATED)],
                                     props=[TABLE, P("laptop", (0.35, -0.15, TOP), args={"glow": 0.1})] + list(extra), env_opts=LAB)

# ===================================================================== HOOK
S("Right now, around eighty six billion nerve cells in your brain are firing tiny electrical signals, thousands of times a second.",
  stage("studio", BRAIN, props=[P("brain", (0, 0, 0.6), args={"glow": [[0, 0], [0.3, 4]]}), P("neuron", (0.9, 0.3, 0.9), scale=0.5, args={"fire": [0.2, 0.8]})], env_opts=NEURO))
S("Every thought, every memory, every movement you make, is written in those signals.",
  stage("studio", cam((0, -2.6, 1.0), (0.3, -2.2, 0.9), (0, 0, 0.6)), props=[P("spikes", (0, 0, 0.1), args={"channels": 6})], env_opts=NEURO))
S("For most of history, that code was completely private. Now, scientists are building machines that can read it, and turn it into action.",
  stage("lab", cam((0.5, -1.8, 1.5), (0.3, -1.5, 1.4), (0.3, 0.2, 1.1)), cast=[who(PATIENT, at=(-0.2, 0.4, 0), pose=SEATED)],
        props=[TABLE, P("robot_arm", (0.5, -0.1, TOP), scale=0.6, args={"reach": [0.3, 0.8]})], env_opts=LAB))
S("People who cannot move or speak are typing, talking and moving robotic arms, just by thinking. This is the story of the machine that can read your brain.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.8, 1.15), (0, 0, 1.1)), texts=[T("THE MACHINE THAT CAN READ YOUR BRAIN", (0, 0, 1.4), 0.15, (0.6, 0.85, 1.0), pop=0.08)],
        props=[P("brain", (0, 0.6, 0.6), scale=0.8, args={"glow": [[0, 0], [0.3, 5]]})], env_opts=NEURO))

# ===================================================================== ELECTRIC BRAIN
S("In seventeen ninety one, the Italian scientist Luigi Galvani made a dead frog's leg kick, using electricity. Nerves and muscles, it turned out, run on electrical signals.",
  stage("lab", cam((0.35, -1.0, 1.25), (0.22, -0.85, 1.2), (0, -0.1, 0.95)), props=[TABLE, P("voltaic_pile", (-0.3, -0.1, TOP), scale=0.6, args={"build": [0, 0.01], "glow": [0.3, 1]}),
        P("wire", (0.1, -0.1, TOP + 0.03), args={"length": 0.4, "glow": [[0, 0], [0.4, 4]]}), P("candle", (0.45, 0, TOP))], env_opts={"wall": [0.3, 0.22, 0.16]}), still=True,
  chapter="The electric brain")
S("In nineteen twenty four, a German psychiatrist named Hans Berger stuck electrodes on his patients' heads, and recorded faint waves of electricity from the brain itself.",
  stage("lab", BENCH, cast=[who(BERGER, pose=WORK)], props=[TABLE, P("eeg_cap", (0, -0.1, TOP + 0.15), scale=0.8)], env_opts={"wall": [0.3, 0.28, 0.25]}), still=True)
S("He called it the electroencephalogram, or EEG. For the first time, we could watch a living brain at work.",
  stage("studio", cam((0, -2.6, 1.0), (0.2, -2.2, 0.9), (0, 0, 0.6)), props=[P("spikes", (0, 0, 0.1), args={"channels": 4, "seed": 2}), P("eeg_cap", (-1.2, 0.3, 0.4), scale=0.8)],
        texts=[T("EEG  1924", (0, 0.3, 1.25), 0.15, pop=0.2)], env_opts=NEURO))
S("But EEG is like listening to a stadium crowd from outside: you can hear the roar, but not individual conversations.",
  stage("sky", cam((0, -7.0, 2.0), (0.5, -6.0, 2.4), (0, 2, 2.5), lens=28), props=[P("stadium", (0, 2, 0))],
        env_opts={"sky": {"horizon": [0.8, 0.6, 0.45], "zenith": [0.2, 0.3, 0.6]}, "floor": [0.3, 0.45, 0.2]}), still=True)
S("To read the brain in detail, scientists needed to listen to single neurons, up close.",
  stage("studio", cam((0.5, -1.4, 0.7), (0.3, -1.2, 0.65), (0.4, 0, 0.6)), props=[P("neuron", (0, 0, 0.6), args={"fire": [0.2, 0.7]})], env_opts=NEURO))

# ===================================================================== MOTOR CORTEX
S("In nineteen seventy three, a computer scientist at UCLA, Jacques Vidal, coined the phrase brain-computer interface, and asked whether brain signals could control machines.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(SCIENTIST, pose=PRESENT)], props=[P("laptop", (0.6, -0.2, 0.9), scale=1.2)], env_opts=LAB),
  still=True)
S("The first brain-computer interfaces most people have heard of don't read thoughts at all. Cochlear implants turn sound into signals for the hearing nerve, and over a million people now use them.",
  stage("studio", cam((0, -2.2, 0.9), (0.2, -1.9, 0.85), (0, 0, 0.6)), props=[P("eeg_cap", (0, 0, 0.6), scale=1.2), P("radio_tower", (1.2, 0.5, 0), scale=0.3)],
        texts=[T("1,000,000+", (0, 0.3, 1.25), 0.15, pop=0.3)], env_opts=NEURO), still=True)
S("A strip of brain called the motor cortex controls movement. Each part of it handles a different part of the body: hands, lips, legs.",
  stage("studio", BRAIN, props=[P("brain", (0, 0, 0.6), args={"glow": [[0, 0], [0.2, 6]], "region": "motor"})], texts=[T("MOTOR CORTEX", (0.5, 0, 1.15), 0.1, pop=0.3)],
        env_opts=NEURO), chapter="Listening to neurons")
S("In the nineteen eighties, the neuroscientist Apostolos Georgopoulos showed that when a monkey moves its arm, groups of neurons vote on the direction. Average their votes, and you can predict the movement.",
  stage("studio", cam((0, -2.6, 1.0), (0.2, -2.2, 0.9), (0, 0, 0.6)), props=[P("neural_net", (0, 0, 0.7), args={"layers": [5, 5, 1], "fire": [0.1, 0.7]})], env_opts=NEURO))
S("The key point: those signals keep firing even in people who are paralysed. The brain still sends the command. It just never reaches the muscles.",
  stage("studio", cam((0, -3.0, 1.0), (0.3, -2.6, 0.95), (0, 0, 0.6)), props=[P("brain", (-0.8, 0, 0.6), scale=0.7, args={"glow": [[0, 4]]}),
        P("neuron", (0, 0, 0.6), scale=0.8, args={"fire": [0.1, 0.5]}), P("robot_arm", (1.0, 0, 0), scale=0.6)],
        texts=[T("✖", (0.55, 0, 0.75), 0.2, (1.0, 0.3, 0.3), pop=0.5)], env_opts=NEURO))
S("So what if you could intercept the command, and send it somewhere else?",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("BRAIN → COMPUTER", (0, 0, 1.0), 0.2, (0.5, 0.9, 1.0), pop=0.2)], env_opts=NEURO),
  still=True, still_at=0.8)

# ===================================================================== BRAINGATE
S("In nineteen ninety eight, the neurologist Phil Kennedy implanted an electrode in a paralysed man named Johnny Ray, who learned to move a cursor with his brain signals.",
  stage("lab", cam((0, -2.4, 1.4), (0.3, -2.0, 1.35), (0.3, 0.2, 1.0)), cast=[who(PATIENT, at=(-0.2, 0.4, 0), pose=SEATED)],
        props=[TABLE, P("laptop", (0.35, -0.15, TOP), args={"glow": 0.1})], texts=[T("1998", (0.9, 0.9, 1.9), 0.2, pop=0.2)], env_opts=LAB), still=True)
S("In two thousand and eight, monkeys at the University of Pittsburgh fed themselves marshmallows using a robotic arm, controlled directly by their brains.",
  stage("studio", cam((0.8, -1.8, 1.0), (0.6, -1.5, 0.9), (0.3, 0, 0.5)), props=[P("robot_arm", args={"reach": [0.2, 0.7], "grip": 0.75}), P("bread", (0.5, -0.4, 0), scale=0.3)],
        env_opts=NEURO))
S("The tool for that job is a tiny chip called the Utah array: four millimetres across, with a hundred hair-thin needles that sit in the brain's surface.",
  stage("studio", cam((0.5, -1.0, 0.5), (0.35, -0.8, 0.4), (0, 0, 0.0)), props=[P("electrode_array", (0, 0, 0.1), args={"glow": [[0, 0], [0.4, 3]]})], env_opts=NEURO),
  chapter="BrainGate")
S("In two thousand and four, Matthew Nagle, a young man paralysed from the neck down after a knife attack, had one implanted, in a research trial called BrainGate.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 0.8)), cast=[who(PATIENT, at=(0, -0.55, 0.74), rot=(-90, 0, 0), pose={"raise_arm": {"L": -40, "R": -40}}),
                                                                         who(SCIENTIST, at=(0.9, 0.2, 0), turn=40, pose=WORK)],
        props=[P("hospital_bed", (0, 0.3, 0))], env_opts=LAB), still=True)
S("Just by imagining moving his hand, he could move a cursor on a screen, open emails, and play a simple video game.",
  CHAIR(PATIENT))
S("In twenty twelve, a woman named Cathy Hutchinson, paralysed by a stroke fifteen years earlier, used a BrainGate implant to control a robotic arm, and lift a bottle of coffee to her lips.",
  stage("lab", cam((0.8, -2.0, 1.4), (0.6, -1.7, 1.3), (0.4, 0.2, 1.0)), cast=[who(PATIENT2, at=(-0.2, 0.4, 0), pose=SEATED, scale=0.95)],
        props=[TABLE, P("robot_arm", (0.5, -0.1, TOP), scale=0.6, args={"reach": [0.2, 0.6], "grip": 0.7}), P("bottle", (0.45, -0.35, TOP), args={"label": ""})], env_opts=LAB))
S("It was the first time in fifteen years she had served herself a drink.",
  stage("lab", cam((0.5, -1.4, 1.5), (0.4, -1.2, 1.48), "cast0.head", lens=45), cast=[who(PATIENT2, at=(-0.2, 0.4, 0), pose=SEATED, scale=0.95)], env_opts=LAB), still=True)

# ===================================================================== WRITING & SPEECH
S("Signals can flow the other way too. In twenty sixteen, Nathan Copeland, paralysed in a car crash, felt pressure in his fingers when a robotic hand was touched, thanks to tiny pulses sent into his brain. He later fist-bumped President Obama with it.",
  stage("lab", cam((0.8, -2.0, 1.4), (0.6, -1.7, 1.3), (0.4, 0.2, 1.0)), cast=[who(PATIENT, at=(-0.2, 0.4, 0), pose=SEATED)],
        props=[TABLE, P("robot_arm", (0.5, -0.1, TOP), scale=0.6, args={"reach": [0.2, 0.6], "grip": 0.7})], env_opts=LAB), still=True)
S("Then the machines learned to write. In twenty twenty one, a Stanford team asked a paralysed man to imagine writing letters by hand.",
  stage("lab", cam((0, -2.4, 1.4), (0.3, -2.0, 1.35), (0.3, 0.2, 1.0)), cast=[who(PATIENT, at=(-0.2, 0.4, 0), pose=SEATED)],
        props=[TABLE, P("laptop", (0.35, -0.15, TOP), args={"glow": 0.1}), P("notebook", (-0.15, -0.15, TOP))], env_opts=LAB), chapter="Writing and speaking")
S("An AI decoder turned his imagined pen strokes into text on a screen, at around ninety characters a minute, close to the speed of texting on a phone.",
  stage("studio", cam((0, -2.4, 1.0), (0.3, -2.0, 0.95), (0, 0, 0.7)), props=[P("spikes", (0, 0, 0.3), scale=0.8), P("laptop", (0, 0.4, 0.95), scale=2.0, args={"glow": 0.05})],
        texts=[T("90 CHARACTERS / MIN", (0, 0, 1.65), 0.12, pop=0.4)], env_opts=NEURO))
S("Speech came next. In twenty twenty three, two teams in California decoded attempted speech, directly from the brains of women who had lost the ability to speak.",
  stage("studio", BRAIN, props=[P("brain", (0, 0, 0.6), args={"glow": [[0, 0], [0.2, 6]], "region": "speech"})], texts=[T("SPEECH", (-0.6, 0, 1.15), 0.1, pop=0.3)],
        env_opts=NEURO))
S("Pat Bennett, who has ALS, a disease that slowly paralyses the body, could communicate at about sixty words a minute. A second woman, Ann Johnson, paralysed by a stroke, spoke through a digital avatar on screen.",
  CHAIR(PATIENT2, [P("phone", (-0.5, -0.2, TOP + 0.1), rot=[-70, 0, 0])]))
S("In twenty twenty four, a team at UC Davis gave a man with ALS a voice that sounded like his own, recreated from old recordings. When he first heard it, he and his family wept.",
  stage("lab", cam((0.5, -1.4, 1.5), (0.4, -1.2, 1.48), "cast0.head", lens=45), cast=[who(PATIENT, at=(-0.2, 0.4, 0), pose=SEATED)], env_opts=LAB), still=True)

# ===================================================================== NEW DEVICES
S("Private companies have joined the race. One of them, Neuralink, founded by Elon Musk, uses a robot to sew ultra-thin threads into the brain.",
  stage("lab", cam((0.6, -2.0, 1.4), (0.4, -1.7, 1.3), (0, 0, 1.0)), props=[P("robot_arm", (0, 0, 0.6), args={"reach": [0.1, 0.8]}), P("electrode_array", (0.5, -0.5, 1.0), scale=0.4),
        P("table", (0, 0, 0), args={"w": 1.2, "h": 0.6})], env_opts=LAB), chapter="The race")
S("In twenty twenty four, its first patient, Noland Arbaugh, paralysed in a diving accident, used his implant to play online chess and video games, controlling the cursor with his thoughts.",
  CHAIR(PATIENT, [P("dice", (-0.45, -0.2, TOP), args={"n": 1, "roll": [0, 0.01]})]))
S("Another company, Synchron, avoids open brain surgery. Its device is a tiny mesh tube, threaded up through a blood vessel from the neck, to sit right next to the motor cortex.",
  stage("studio", cam((0.6, -1.4, 0.8), (0.4, -1.1, 0.7), (0, 0, 0.6)), props=[P("stent", (0, 0, 0.6), spin=["x", 60])], env_opts=NEURO))
S("Most implants still need a cable through the skull, connected to a computer. Newer devices are wireless, charging through the skin like a phone.",
  stage("studio", cam((0.5, -1.0, 0.5), (0.35, -0.8, 0.4), (0, 0, 0.0)), props=[P("electrode_array", (0, 0, 0.1), args={"glow": [[0, 0], [0.3, 2]]}), P("phone", (0.6, 0.1, 0.1), rot=[-70, 0, 0])],
        env_opts=NEURO), still=True)
S("Patients with Synchron implants have sent texts and emails, and shopped online, by thought alone.",
  CHAIR(PATIENT2))

# ===================================================================== READING THOUGHTS?
S("In twenty twenty three, a Dutch man named Gert-Jan Oskam, paralysed in a cycling accident, walked again, using implants that read his brain's intentions and passed them wirelessly to a stimulator on his spinal cord. The team called it a digital bridge.",
  stage("sky", cam((0, -3.6, 1.4), (0.3, -3.2, 1.3), (0, 0, 1.0)), cast=[who(PATIENT, pose=STAND, walk=[[0, [-0.6, 0, 0]], [1, [0.4, 0, 0]]])],
        env_opts={"sky": {"horizon": [0.85, 0.85, 0.9], "zenith": [0.25, 0.45, 0.85]}, "floor": [0.3, 0.5, 0.2]}))
S("Similar implants, called deep brain stimulators, are already used by more than a hundred and sixty thousand people, mostly to calm the tremors of Parkinson's disease.",
  stage("studio", BRAIN, props=[P("brain", (0, 0, 0.6), args={"xray": True}), P("wire", (0.2, 0, 0.75), rot=[0, 60, 0], args={"length": 0.6, "glow": [[0, 0], [0.3, 4]]})],
        env_opts=NEURO), still=True)
S("What about reading thoughts without surgery? Brain scanners called fMRI can see which areas of the brain are working, by tracking blood flow.",
  stage("lab", cam((2.0, -3.5, 1.8), (1.6, -3.0, 1.6), (0, -0.6, 1.1)), props=[P("mri_machine", args={"slide": [0.2, 0.8]})], env_opts=LAB), chapter="Reading thoughts?")
S("As early as twenty eleven, a Berkeley team used fMRI to make blurry reconstructions of movie clips that volunteers were watching.",
  stage("studio", cam((0, -2.4, 0.9), (0, -2.1, 0.85), (0, 0, 0.75)), props=[P("pixel_image", (0, 0, 0.3))], env_opts=NEURO), still=True)
S("In twenty twenty three, a team at the University of Texas trained an AI on many hours of a volunteer's brain scans as they listened to podcasts. It could then produce the rough gist of new stories they heard, or even imagined.",
  stage("lab", cam((2.0, -3.5, 1.8), (1.6, -3.0, 1.6), (0, -0.6, 1.1)), props=[P("mri_machine"), P("spikes", (0, -2.0, 1.8), scale=0.6)], env_opts=LAB))
S("It only worked on people who had spent hours training it, and who cooperated. When volunteers thought about something else on purpose, it failed. True mind reading is still science fiction.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("NOT MIND READING... YET", (0, 0, 1.0), 0.15, (1.0, 0.7, 0.3), pop=0.2)], env_opts=NEURO),
  still=True, still_at=0.8)

# ===================================================================== ETHICS
S("But it raises new questions. Who owns the data from your brain? Could it be sold, hacked, or used against you?",
  stage("studio", BRAIN, props=[P("brain", (0, 0, 0.6), args={"glow": [[0, 0], [0.3, 3]]}), P("bbox_label", (0, -0.5, 0.65), args={"label": "PRIVATE?", "size": (0.9, 0.9), "color": (1.0, 0.4, 0.4), "at": 0.4})],
        env_opts=NEURO), chapter="Neural privacy")
S("In twenty twenty one, Chile became the first country to protect brain activity in its constitution. In twenty twenty four, the US state of Colorado passed a law protecting neural data.",
  stage("hall", cam((0, -2.4, 1.6), (0, -2.0, 1.55), (0, 0.4, 1.3)), props=[P("table", (0, 0.6, 0), args={"w": 2.0}), P("newspapers", (0, 0.6, TOP), args={"headline": "NEURORIGHTS", "n": 2})]),
  still=True)
S("Implants also carry the risks of brain surgery, and some early devices have had problems. In Neuralink's first patient, many of the threads pulled back out of the brain within weeks, although the team recovered much of the performance with software.",
  stage("studio", cam((0.5, -1.0, 0.5), (0.35, -0.8, 0.4), (0, 0, 0.0)), props=[P("electrode_array", (0, 0, 0.1))], env_opts=NEURO), still=True)

# ===================================================================== CLOSE
S("A century ago, Hans Berger could barely detect a whisper of brain electricity.",
  stage("lab", BENCH, cast=[who(BERGER, pose=WORK)], props=[TABLE, P("eeg_cap", (0, -0.1, TOP + 0.15), scale=0.8)], env_opts={"wall": [0.3, 0.28, 0.25]}), still=True,
  chapter="Close")
S("Today, machines can turn the signals in a paralysed person's brain into words, movement and a voice.",
  stage("lab", cam((0.4, -1.5, 1.5), (0.6, -2.6, 1.6), "cast0.head", (0.2, 0.2, 1.1)), cast=[who(PATIENT, at=(-0.2, 0.4, 0), pose=SEATED)],
        props=[TABLE, P("laptop", (0.35, -0.15, TOP), args={"glow": 0.1}), P("robot_arm", (0.6, 0.2, TOP), scale=0.5, args={"reach": [0.2, 0.7]})], env_opts=LAB))
S("The machine that can read your brain isn't coming. For a small number of people, it's already here, and it's giving them back their lives.",
  stage("studio", cam((0.4, -0.9, 0.7), (0.9, -2.2, 1.0), (0, 0, 0.6), (0, 0, 0.6)), props=[P("brain", (0, 0, 0.6), args={"glow": [[0, 0], [0.4, 6]]}),
        P("electrode_array", (0.25, -0.1, 0.92), scale=0.15)], env_opts=NEURO), hold=1.5)

write(HERE, {
    "slug": "13-brain-reader",
    "title": "The Machine That Can Read Your Brain",
    "description": ("From Hans Berger's first EEG to BrainGate, Neuralink and implants that give paralysed people a voice: "
                    "how brain-computer interfaces read the brain's electrical code, told in 3D animation."),
    "tags": ["brain-computer interface", "BCI", "BrainGate", "Neuralink", "Synchron", "neuroscience", "EEG", "neural privacy", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.25, "sentence_silence": 0.28,
              "pronunciations": {"Galvani": "Gal-vah-nee", "electroencephalogram": "electro-en-sef-alo-gram", "Georgopoulos": "Jor-gop-oo-los",
                                 "Nagle": "Nay-gul", "Arbaugh": "Ar-baw", "Synchron": "Sin-kron", "fMRI": "F M R I", "ALS": "A L S", "UC Davis": "U C Davis"}},
    "music_mood": "hopeful",
    "sources": [
        "https://www.braingate.org/research-areas/reach-and-grasp/",
        "https://www.nature.com/articles/s41586-021-03506-2",
        "https://www.nature.com/articles/s41586-023-06377-x",
        "https://www.nature.com/articles/s41586-023-06443-4",
        "https://www.nejm.org/doi/full/10.1056/NEJMoa2314132",
        "https://www.nature.com/articles/s41593-023-01304-9",
    ],
}, S.shots)
