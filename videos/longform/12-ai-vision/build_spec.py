"""Shot list for long-form #12: How AI Learned to See.  python build_spec.py"""

import sys
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent))
from common import (P, PRESENT, READ, SKIN, STAND, T, TOP, WORK, LOOK_UP, ShotList, cam, stage, who, write)  # noqa: E402

SUIT = {"skin": SKIN, "shirt": [0.14, 0.14, 0.17], "pants": [0.14, 0.14, 0.17], "boots": [0.04, 0.03, 0.02]}
LABCOAT = {"skin": SKIN, "shirt": [0.88, 0.9, 0.93], "pants": [0.15, 0.15, 0.2], "boots": [0.04, 0.03, 0.02]}
ROSENBLATT = {"hair": [0.1, 0.08, 0.06], "sleeves": "long", "outfit": SUIT}
HUBEL = {"hair": [0.3, 0.25, 0.2], "sleeves": "long", "outfit": LABCOAT}
LECUN = {"hair": [0.25, 0.2, 0.15], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.2, 0.3, 0.5], "pants": [0.15, 0.15, 0.2]}}
FEIFEI = {"hair": [0.05, 0.04, 0.04], "sleeves": "long", "outfit": {"skin": [0.85, 0.68, 0.55], "shirt": [0.6, 0.15, 0.2], "pants": [0.12, 0.12, 0.15], "boots": [0.05, 0.04, 0.03]}}
HINTON = {"hair": [0.75, 0.75, 0.75], "sleeves": "long", "outfit": {**SUIT, "shirt": [0.3, 0.3, 0.32], "pants": [0.2, 0.2, 0.22]}}
STUDENT = {"hair": [0.15, 0.1, 0.07], "sleeves": "long", "outfit": {"skin": SKIN, "shirt": [0.2, 0.45, 0.35], "pants": [0.15, 0.15, 0.2], "boots": [0.05, 0.04, 0.03]}}
OFFICE = {"wall": [0.35, 0.37, 0.42], "world": [0.03, 0.03, 0.04]}
DIGITAL = {"horizon": [0.02, 0.1, 0.18], "zenith": [0.0, 0.01, 0.03]}

S = ShotList()
TABLE = P("table", (0, -0.1, 0))
BENCH = cam((0.9, -2.5, 1.6), (0.6, -2.1, 1.5), (0, 0, 1.15))
NET = cam((0, -3.0, 0.9), (0.3, -2.6, 0.85), (0, 0, 0.8))
PIX = cam((0, -3.0, 0.95), (0, -2.7, 0.9), (0, 0, 0.8))

# ===================================================================== HOOK
S("Show a three year old a picture of a cat, and they'll say cat in an instant.",
  stage("studio", PIX, props=[P("pixel_image", (0, 0, 0.3))], env_opts=DIGITAL))
S("For decades, that simple act defeated the most powerful computers in the world.",
  stage("lab", cam((0.6, -2.0, 1.6), (0.3, -1.6, 1.5), (-0.6, 1.2, 1.2), lens=26), props=[P("eniac", args={"panels": 6})], env_opts=OFFICE))
S("Today, AI systems recognise faces, read medical scans, and steer cars through traffic.",
  stage("street", cam((3, -4, 2), (2.4, -3.4, 1.8), (0.4, 0, 0.6)), props=[P("car", args={"boxes": True}), P("bbox_label", (0, -0.2, 1.4), args={"label": "CAR 99%", "size": (1.2, 1.2), "at": 0.1})]))
S("So how did machines finally learn to see? The answer came from copying the brain, and from a mountain of pictures.",
  stage("studio", cam((0, -3.2, 1.2), (0, -2.8, 1.15), (0, 0, 1.1)), texts=[T("HOW AI LEARNED TO SEE", (0, 0, 1.4), 0.25, (0.4, 0.9, 1.0), pop=0.08)],
        props=[P("eye", (-0.9, 0.5, 0.6), scale=0.5), P("neural_net", (0.6, 0.5, 0.6), scale=0.5)], env_opts=DIGITAL))

# ===================================================================== WHY SEEING IS HARD
S("To a computer, a picture is just a grid of numbers: one for the brightness of each tiny dot, or pixel.",
  stage("studio", PIX, props=[P("pixel_image", (0, 0, 0.3), args={"numbers": True})], env_opts=DIGITAL), still=True, chapter="Why seeing is hard")
S("A cat might be black or ginger, near or far, curled up or stretching, half hidden behind a sofa. Every version produces completely different numbers.",
  stage("studio", cam((0, -3.0, 1.0), (0.2, -2.6, 0.95), (0, 0, 0.6)), props=[P("pixel_image", (-0.7, 0, 0.2), scale=0.6), P("pixel_image", (0.7, 0.2, 0.3), scale=0.9, rot=[0, 10, 0])],
        env_opts=DIGITAL), still=True)
S("Early researchers tried writing rules: a cat has two pointy ears, whiskers, fur. But there were always too many exceptions. The rules kept breaking.",
  stage("lab", cam((0, -3.0, 1.5), (0, -2.6, 1.5), (0, 1.5, 1.6)), props=[P("blackboard", (0, 1.5, 0), args={"lines": ["IF ears = pointy", "AND whiskers = yes", "THEN cat ?"], "at": 0.1})],
        env_opts=OFFICE), still=True)
S("In nineteen sixty six, an MIT professor famously set a group of students a summer project: get a computer to describe what it sees. It took more than half a century.",
  stage("lab", cam((0, -3.0, 1.7), (0.3, -2.6, 1.6), (0, 0.3, 1.1)), cast=[who(STUDENT, at=(-0.6, 0.35, 0), turn=-15, pose=WORK), who(STUDENT | {"hair": [0.4, 0.25, 0.1]}, at=(0.6, 0.35, 0), turn=15, pose=READ)],
        props=[P("table", (0, -0.1, 0), args={"w": 2.2})], texts=[T("SUMMER 1966", (0, 1.2, 1.75), 0.15, pop=0.2)], env_opts=OFFICE), still=True)

# ===================================================================== THE BRAIN
S("Meanwhile, neuroscientists were discovering how real eyes and brains do it.",
  stage("studio", cam((0, -2.0, 0.8), (0.2, -1.7, 0.75), (0, 0, 0.6)), props=[P("eye", (0, 0, 0.6), args={"look": [[0, [0, -15]], [1, [5, 15]]]})], env_opts=DIGITAL),
  chapter="Learning from the brain")
S("In the late nineteen fifties, David Hubel and Torsten Wiesel recorded signals from single nerve cells in the visual part of a cat's brain.",
  stage("lab", BENCH, cast=[who(HUBEL, pose=WORK)], props=[TABLE, P("meter", (0.3, -0.1, TOP + 0.14)), P("microscope", (-0.4, -0.05, TOP))], env_opts=OFFICE), still=True)
S("They found cells that fired only when the cat saw an edge, tilted at one particular angle. Other cells combined those edges into more complex shapes.",
  stage("studio", cam((0.8, -2.2, 0.9), (0.6, -1.9, 0.8), (0.6, 0, 0.5)), props=[P("neuron", (0, 0, 0.6), args={"fire": [0.3, 0.8]}), P("bar_magnet", (-0.8, 0, 0.6), rot=[0, 35, 0], scale=1.5)],
        env_opts=DIGITAL))
S("The breakthrough came partly by accident. A cell burst into activity as they slid a glass slide into their projector, and its edge cast a faint line across the screen.",
  stage("studio", cam((0.8, -2.2, 0.9), (0.6, -1.9, 0.8), (0.6, 0, 0.5)), props=[P("neuron", (0, 0, 0.6), args={"fire": [0.3, 0.8]}), P("bar_magnet", (-0.8, 0, 0.6), rot=[0, 35, 0], scale=1.5)],
        env_opts=DIGITAL), still=True)
S("Vision is a ladder: from edges, to shapes, to whole objects. That work won them a Nobel Prize, and it inspired the computer scientists who came next.",
  stage("studio", cam((0, -3.9, 1.05), (0.3, -3.5, 1.0), (0, 0, 1.0)), props=[P("neural_net", (0, 0, 0.8), args={"fire": [0.1, 0.8]})], texts=[T("EDGES → SHAPES → OBJECTS", (0, 0.4, 1.78), 0.16, pop=0.3)], env_opts=DIGITAL))
S("In nineteen fifty eight, a psychologist named Frank Rosenblatt built the Perceptron, a machine with a camera and a simple artificial neural network that could learn to tell shapes apart.",
  stage("lab", cam((0.6, -2.0, 1.6), (0.3, -1.6, 1.5), (-0.6, 1.2, 1.2), lens=26), cast=[who(ROSENBLATT, at=(0.6, 0.0, 0), turn=-30, pose=PRESENT)],
        props=[P("eniac", args={"panels": 4, "seed": 5})], texts=[T("PERCEPTRON 1958", (-0.2, 0.6, 1.85), 0.15, pop=0.2)], env_opts=OFFICE), still=True)
S("Its eye was a grid of just four hundred light sensors, twenty by twenty, wired at random to its artificial neurons.",
  stage("lab", cam((0.6, -2.0, 1.6), (0.3, -1.6, 1.5), (-0.6, 1.2, 1.2), lens=26), cast=[who(ROSENBLATT, at=(0.6, 0.0, 0), turn=-30, pose=PRESENT)],
        props=[P("eniac", args={"panels": 4, "seed": 5})], texts=[T("PERCEPTRON 1958", (-0.2, 0.6, 1.85), 0.15, pop=0.2)], env_opts=OFFICE), still=True)
S("Newspapers predicted it would soon walk, talk and see. It couldn't. Its single layer of artificial neurons was far too simple, and interest in neural networks collapsed for years.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "ELECTRONIC BRAIN TEACHES ITSELF", "n": 3})]), still=True, still_at=0.7)

# ===================================================================== DEEP NETWORKS
S("Funding dried up. Researchers later called these lean years the AI winters.",
  stage("sky", cam((0, -3.0, 1.4), (0.3, -2.6, 1.3), (0, 0, 1.0)), props=[P("eniac", (0, 1.5, 0), scale=0.5, args={"panels": 4, "blink": False})],
        env_opts={"sky": {"horizon": [0.7, 0.75, 0.85], "zenith": [0.3, 0.4, 0.6]}, "floor": [0.85, 0.87, 0.9]}), still=True)
S("In nineteen eighty, the Japanese researcher Kunihiko Fukushima built the Neocognitron, a layered network directly inspired by Hubel and Wiesel's discoveries.",
  stage("studio", cam((0, -3.9, 1.05), (0.3, -3.5, 1.0), (0, 0, 1.0)), props=[P("neural_net", (0, 0, 0.8), args={"layers": [8, 6, 6, 4, 2], "fire": [0.1, 0.7]})], texts=[T("NEOCOGNITRON 1980", (0, 0.4, 1.78), 0.16, pop=0.2)],
        env_opts=DIGITAL))
S("An artificial neural network is made of layers of simple units. Each one adds up signals from the layer before, and passes a signal on if the total is big enough.",
  stage("studio", NET, props=[P("neural_net", (0, 0, 0.8), args={"fire": [0.1, 0.8]})], env_opts=DIGITAL), chapter="Deep networks")
S("At first, the connections are random. To train it, you show it thousands of labelled examples. Every time it gets one wrong, you nudge all the connections slightly, so it would have done a bit better.",
  stage("studio", NET, props=[P("neural_net", (0, 0, 0.8), args={"fire": [0.05, 0.4], "seed": 3}), P("pixel_image", (-1.5, 0, 0.5), scale=0.4)], env_opts=DIGITAL))
S("The method for working out those nudges, called backpropagation, was popularised in nineteen eighty six by Geoffrey Hinton and his colleagues.",
  stage("lab", cam((0, -3.0, 1.5), (0, -2.6, 1.5), (0, 1.5, 1.6)), cast=[who(HINTON, at=(0.9, 0.6, 0), turn=20, pose=PRESENT)],
        props=[P("blackboard", (-0.3, 1.5, 0), args={"lines": ["∂E / ∂w", "w ← w − η ∂E/∂w"], "at": 0.1})], env_opts=OFFICE), still=True)
S("In the late nineteen eighties, Yann LeCun, then at Bell Labs, built a network for reading handwritten digits. Instead of looking at the whole image at once, it scanned small windows across it, like the edge-detecting cells in the brain.",
  stage("studio", PIX, props=[P("pixel_image", (0, 0, 0.3)), P("conv_filter", (0, 0, 0.3), args={"sweep": [0.05, 0.95]})], env_opts=DIGITAL))
S("This was a convolutional neural network. By the late nineteen nineties, versions of it were reading millions of handwritten cheques for American banks.",
  stage("lab", BENCH, cast=[who(LECUN, pose=WORK)], props=[TABLE, P("newspapers", (0, -0.1, TOP), args={"headline": "PAY TO THE ORDER OF", "n": 4})], env_opts=OFFICE), still=True)
S("But for photos of the real world, neural networks still weren't good enough. They needed two things that didn't exist yet: far more data, and far more computing power.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.1, 0.95), (0, 0, 0.8)), texts=[T("MORE DATA", (0, 0, 1.12), 0.15, pop=0.2), T("MORE POWER", (0, 0, 0.82), 0.15, (1.0, 0.6, 0.3), pop=0.5)],
        env_opts=DIGITAL), still=True, still_at=0.8)

# ===================================================================== IMAGENET
S("The data came from a young professor named Fei-Fei Li.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(FEIFEI, pose=STAND, scale=0.95)], env_opts=OFFICE), still=True, chapter="ImageNet")
S("She believed computers needed to see the world the way children do: by looking at an enormous number of examples.",
  stage("studio", cam((0, -3.4, 1.4), (0.3, -3.0, 1.3), (0, 0, 0.8)),
        props=[P("pixel_image", ((k % 5 - 2) * 0.55, 0.3 * (k // 5), 0.1 + 0.6 * (k // 5)), scale=0.45, rot=[0, 0, (k % 3 - 1) * 8]) for k in range(10)], env_opts=DIGITAL), still=True)
S("Starting in two thousand and seven, her team gathered images from the internet, and paid thousands of online workers, through Amazon's Mechanical Turk website, to label them.",
  stage("lab", cam((0, -3.4, 1.9), (0.3, -3.0, 1.8), (0, 0.3, 1.0)),
        cast=[who(STUDENT | {"hair": [0.1 + 0.15 * i, 0.08, 0.05]}, at=(x, 0.35, 0), pose=WORK, scale=0.95) for i, x in enumerate((-1.1, 0, 1.1))],
        props=[P("table", (0, -0.1, 0), args={"w": 3.2})] + [P("laptop", (x, -0.15, TOP), args={"glow": 0.1}) for x in (-1.1, 0, 1.1)], env_opts=OFFICE), still=True)
S("At its peak, nearly fifty thousand people in a hundred and sixty seven countries were helping to label the pictures.",
  stage("space", cam((0, -3.4, 0.6), (0.3, -3.0, 0.5), (0, 0, 0.5)), texts=[T("50,000 PEOPLE", (0, -0.6, 0.72), 0.2, pop=0.3), T("167 COUNTRIES", (0, -0.6, 0.38), 0.2, (1.0, 0.6, 0.3), pop=0.35)]), still=True)
S("Many experts thought it was a waste of time. More data, they argued, wouldn't fix bad algorithms.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(FEIFEI, pose={**STAND, "head_nod": 10}, scale=0.95)], env_opts=OFFICE), still=True)
S("The result, ImageNet, held more than fourteen million pictures, sorted into over twenty thousand categories, from strawberries to sports cars to dozens of breeds of dog.",
  stage("studio", cam((0, -4.0, 1.6), (0.3, -3.4, 1.4), (0, 0, 0.9)),
        props=[P("pixel_image", ((k % 7 - 3) * 0.5, 0.4 * (k // 7), 0.1 + 0.55 * (k // 7)), scale=0.42) for k in range(21)],
        texts=[T("14,000,000 IMAGES", (0, -0.5, 2.1), 0.18, pop=0.3)], env_opts=DIGITAL))
S("In two thousand and ten, she launched a yearly contest: whose program could recognise objects in a thousand different categories most accurately?",
  stage("hall", cam((0, -4.6, 2.7), (0.3, -4.0, 2.4), (0, 1.2, 1.2), lens=30), cast=[who(FEIFEI, at=(0, 1.4, 0), pose=PRESENT, scale=0.95)],
        props=[P("audience", (0, 1.2, 0), rot=[0, 0, 180])]))

# ===================================================================== 2012
S("In twenty twelve, a team from the University of Toronto entered: Geoffrey Hinton and two of his students, Alex Krizhevsky and Ilya Sutskever.",
  stage("lab", cam((0, -3.0, 1.7), (0.3, -2.6, 1.6), (0, 0.3, 1.1)),
        cast=[who(STUDENT, at=(-0.9, 0.35, 0), turn=-15), who(HINTON, at=(0, 0.45, 0), pose=PRESENT), who(STUDENT | {"hair": [0.3, 0.2, 0.1]}, at=(0.9, 0.35, 0), turn=15)],
        texts=[T("2012", (0, 1.2, 2.1), 0.2, pop=0.2)], env_opts=OFFICE), still=True, chapter="The 2012 breakthrough")
S("Their network, later called AlexNet, was deep, with eight learning layers and sixty million adjustable connections.",
  stage("studio", NET, props=[P("neural_net", (0, 0, 0.8), args={"layers": [8, 10, 10, 10, 10, 8, 6, 4], "spacing": 0.4, "fire": [0.05, 0.9]})], env_opts=DIGITAL))
S("To train it, Krizhevsky used two graphics cards, the chips built for video games, in his bedroom. Training took about a week. Their parallel number crunching turned out to be perfect for neural networks.",
  stage("lab", cam((0.4, -1.1, 1.2), (0.3, -0.9, 1.15), (0, -0.1, 0.95)), props=[TABLE, P("gpu", (-0.2, -0.1, TOP)), P("gpu", (0.35, -0.1, TOP)), P("laptop", (0, 0.2, TOP))],
        env_opts=OFFICE), still=True)
S("The results stunned the field. AlexNet's top five error rate was about fifteen percent. The next best entry got twenty six percent.",
  stage("studio", cam((0, -2.4, 1.0), (0, -2.1, 0.95), (0, 0, 0.8)), texts=[T("15%", (-0.6, 0, 1.0), 0.3, (0.4, 1.0, 0.6), pop=0.2), T("26%", (0.65, 0, 1.0), 0.3, (1.0, 0.4, 0.4), pop=0.45)],
        env_opts=DIGITAL), still=True, still_at=0.8)
S("That same year, a Google team trained a huge network on ten million still frames from YouTube videos, without telling it what anything was. One of its artificial neurons learned, all by itself, to respond to cats.",
  stage("studio", NET, props=[P("neural_net", (0, 0, 0.8), args={"fire": [0.1, 0.8], "seed": 9}), P("pixel_image", (1.6, 0, 0.5), scale=0.45)], env_opts=DIGITAL))
S("Soon after, Google bought Hinton's tiny company, which had just three employees, for forty four million dollars, after an auction between tech giants.",
  stage("studio", cam((0, -2.2, 1.0), (0, -1.9, 0.95), (0, 0, 0.8)), texts=[T("$44,000,000", (0, 0, 1.0), 0.26, (0.4, 1.0, 0.6), pop=0.2)], env_opts=DIGITAL), still=True, still_at=0.8)
S("Almost overnight, the whole field switched to deep learning. Within three years, networks were beating the human benchmark on the ImageNet test.",
  stage("studio", NET, props=[P("neural_net", (0, 0, 0.8), args={"layers": [6, 8, 8, 8, 8, 8, 8, 8, 5, 3], "spacing": 0.32, "fire": [0.05, 0.9]})], env_opts=DIGITAL))
S("That human benchmark came from one dedicated researcher, Andrej Karpathy, who sat down and labelled the test images himself. He got about five percent of them wrong.",
  stage("studio", NET, props=[P("neural_net", (0, 0, 0.8), args={"layers": [6, 8, 8, 8, 8, 8, 8, 8, 5, 3], "spacing": 0.32, "fire": [0.05, 0.9]})], env_opts=DIGITAL), still=True)
S("Inside a trained network, the first layers detect simple edges and colours, just like Hubel and Wiesel's cells. Deeper layers respond to eyes, wheels, fur, and faces.",
  stage("studio", PIX, props=[P("pixel_image", (0, 0, 0.3)), P("conv_filter", (0, 0, 0.3), args={"sweep": [0.1, 0.9]}), P("bbox_label", (0, -0.05, 0.75), args={"at": 0.85})],
        env_opts=DIGITAL))

# ===================================================================== WORLD
S("Today, computer vision is everywhere. It unlocks your phone with your face, and sorts the photos in your gallery.",
  stage("studio", cam((0, -0.7, 0.3), (0, -0.6, 0.28), (0, 0, 0.12), lens=85), props=[P("phone", (0, 0, 0.12), rot=[-75, 0, 0], args={"glow": 0.1})], env_opts=DIGITAL),
  chapter="Seeing machines everywhere")
S("It helps doctors spot cancers and eye disease in scans, sometimes catching what a busy human might miss.",
  stage("lab", cam((0, -2.6, 1.6), (0.3, -2.2, 1.5), (0, 0.3, 1.1)), cast=[who(FEIFEI | {"outfit": LABCOAT}, at=(0.6, 0.3, 0), turn=20, pose=WORK)],
        props=[TABLE, P("laptop", (0, -0.15, TOP), args={"glow": 0.1}), P("eye", (-0.5, -0.1, 1.15), scale=0.25)], env_opts=OFFICE), still=True)
S("It guides robots in warehouses, checks crops from drones, and lets cars detect pedestrians, cyclists, and traffic lights.",
  stage("street", cam((3, -5, 2.2), (2.4, -4.4, 2.0), (0, 0, 0.6)),
        props=[P("car", args={"boxes": True, "drive": [[0, -2], [1, 2]]}), P("street_lamps", (-1.6, -2, 0), args={"n": 4, "on": [0, 0.01]}),
               P("bbox_label", (1.5, 0, 1.2), args={"label": "PERSON 98%", "size": (0.6, 1.8), "at": 0.3})]))
S("In some American cities, taxis with no human driver now carry paying passengers, using cameras, radar and laser scanners to build a picture of the road.",
  stage("street", cam((3, -5, 2.2), (2.4, -4.4, 2.0), (0, 0, 0.6)), props=[P("car", args={"boxes": True, "color": (0.9, 0.9, 0.92), "drive": [[0, -2], [1, 2]]}),
        P("houses", (0, 4, 0), args={"on": [0, 0.01]})]))
S("Eye-screening systems can now detect diabetic eye disease from a photo of the back of the eye, helping clinics that have too few specialists.",
  stage("studio", cam((0, -3.5, 0.9), (0.2, -3.2, 0.85), (0, 0, 0.7)), props=[P("eye", (0, 0, 0.6)), P("bbox_label", (0, -0.6, 0.62), args={"label": "SCAN OK", "size": (1.0, 1.0), "at": 0.4})],
        env_opts=DIGITAL), still=True)
S("But machine vision has strange weaknesses. Change a handful of pixels in a way no human would notice, and a network can be fooled into calling a panda a gibbon.",
  stage("studio", PIX, props=[P("pixel_image", (0, 0, 0.3)), P("bbox_label", (0, -0.05, 0.75), args={"label": "GIBBON 99%", "color": (1.0, 0.3, 0.3), "at": 0.4})], env_opts=DIGITAL))
S("And if the training pictures are unbalanced, it can work worse for some groups of people than others. Fixing that is one of the biggest challenges in the field.",
  stage("lab", cam((0, -3.0, 1.7), (0.3, -2.6, 1.6), (0, 0.3, 1.1)),
        cast=[who(STUDENT | {"outfit": {**STUDENT["outfit"], "skin": sk}}, at=(x, 0.35, 0), scale=0.95) for x, sk in ((-0.9, [0.45, 0.3, 0.22]), (0, [0.85, 0.68, 0.55]), (0.9, [0.72, 0.52, 0.42]))],
        env_opts=OFFICE), still=True)

# ===================================================================== LEGACY
S("In twenty fifteen, a photo app wrongly tagged a photo of two Black people with an offensive animal label. The company apologised, and its quick fix was simply to block that label.",
  stage("studio", cam((0.2, -1.1, 0.8), (0.1, -0.95, 0.75), (0, 0, 0.1)), props=[P("newspapers", args={"headline": "ALGORITHM BIAS", "n": 3})]), still=True, still_at=0.7)
S("In twenty eighteen, Hinton, LeCun and Yoshua Bengio won the Turing Award, computing's highest prize, for their work on deep learning.",
  stage("hall", cam((0, -2.8, 1.6), (0, -2.4, 1.5), (0, 0.4, 1.2)),
        cast=[who(HINTON, at=(-0.75, 0.35, 0), turn=-10), who(LECUN, at=(0, 0.45, 0)), who(STUDENT | {"hair": [0.2, 0.15, 0.1], "outfit": SUIT}, at=(0.75, 0.35, 0), turn=10)],
        props=[P("medal", (0, -0.2, 1.75), spin=["z", 40])], texts=[T("TURING AWARD 2018", (0, 0.2, 2.05), 0.13, pop=0.2)]), still=True, chapter="Legacy")
S("And in twenty twenty four, Hinton shared the Nobel Prize in Physics with John Hopfield, for discoveries that made machine learning with neural networks possible.",
  stage("lab", cam((0.5, -1.8, 1.55), (0.35, -1.5, 1.5), "cast0.head"), cast=[who(HINTON, pose=STAND)], props=[P("medal", (0.6, -0.3, 1.4), spin=["z", 40])], env_opts=OFFICE),
  still=True)
S("The same ideas that taught machines to see now power systems that understand speech, translate languages, and write text.",
  stage("studio", NET, props=[P("neural_net", (0, 0, 0.8), args={"fire": [0.05, 0.6], "seed": 7})], env_opts=DIGITAL))
S("It took more than half a century, a trick borrowed from a cat's brain, a contest built on fourteen million photos, and two graphics cards in a student's bedroom.",
  stage("studio", cam((0, -3.0, 1.2), (0.3, -2.6, 1.1), (0, 0, 0.8)), props=[P("neuron", (-1.0, 0, 0.8), scale=0.6), P("pixel_image", (0, 0.2, 0.4), scale=0.6), P("gpu", (1.0, 0, 0.6))],
        env_opts=DIGITAL), still=True, chapter="Close")
S("But machines finally learned to do what a three year old does without thinking: look at the world, and understand what they see.",
  stage("studio", cam((0, -1.7, 0.85), (0, -3.2, 1.1), (0, 0, 0.8), (0, 0, 0.8)), props=[P("pixel_image", (0, 0, 0.3)), P("bbox_label", (0, -0.05, 0.75), args={"at": 0.3})],
        env_opts=DIGITAL), hold=1.5)

write(HERE, {
    "slug": "12-ai-vision",
    "title": "How AI Learned to See",
    "description": ("From a cat's visual cortex to the Perceptron, ImageNet and AlexNet: how computers finally learned to recognise "
                    "what they see, told in 3D animation."),
    "tags": ["computer vision", "deep learning", "ImageNet", "AlexNet", "neural networks", "Fei-Fei Li", "Geoffrey Hinton", "Yann LeCun", "3D animation"],
    "voice": {"piper_voice": "en_US-ryan-high", "length_scale": 1.33, "sentence_silence": 0.28,
              "pronunciations": {"Karpathy": "Kar-path-ee", "Wiesel": "Vee-zel", "Rosenblatt": "Roh-zen-blat", "LeCun": "Luh-kun", "Fei-Fei": "Fay-Fay",
                                 "Krizhevsky": "Kri-zhev-skee", "Sutskever": "Suts-kev-er", "Bengio": "Ben-jee-oh", "AlexNet": "Alex Net"}},
    "music_mood": "hopeful",
    "sources": [
        "https://www.nobelprize.org/prizes/medicine/1981/hubel/facts/",
        "https://www.image-net.org/about.php",
        "https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks",
        "https://awards.acm.org/about/2018-turing",
        "https://www.nobelprize.org/prizes/physics/2024/press-release/",
        "https://news.cornell.edu/stories/2019/09/professors-perceptron-paved-way-ai-60-years-too-soon",
    ],
}, S.shots)
