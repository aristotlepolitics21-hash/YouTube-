#!/usr/bin/env python3
"""Build upload packaging (title, thumbnail text, description with chapters, tags) for each episode.

    python3 render3d/publish/packaging.py      # writes render3d/publish/<module>.md

Chapter times come from timings.json (exact shot starts from make_episode.plan)."""
import json, pathlib

HERE = pathlib.Path(__file__).resolve().parent
T = json.loads((HERE / 'timings.json').read_text())

EPS = [
 dict(n=1, m='aidisease',
  title='How AI Predicts Disease Years Before Symptoms',
  thumb='NOT SICK... YET',
  alts=['This AI Knows You\'re Sick Before You Do', 'Can AI Predict Your Next Disease?'],
  hook=('AI can now predict diseases like cancer, kidney injury and Parkinson\'s before any symptoms appear. '
        'Here\'s how it works, what it gets wrong, and what it means for your health.'),
  body=('In this 3D-animated explainer we look at how machine learning finds early warning signs hidden in blood tests, '
        'eye scans, heart readings and smartwatch data: from DeepMind\'s kidney-injury model and Google\'s retina research '
        'to MIT\'s Mirai mammogram model and the Mayo Clinic\'s heart-pump AI. We also cover the problems: false alarms, '
        'models that fail in new hospitals, bias, and privacy.'),
  chapters=[(1, 'A call before you feel sick'), (5, 'The hidden signals in your data'), (13, 'Kidney injury, 48 hours early'),
            (17, 'What your eyes reveal'), (21, 'Spotting cancer years ahead'), (27, 'Hearts, watches and Parkinson\'s'),
            (34, 'Putting it all together'), (38, 'Why it isn\'t everywhere yet'), (45, 'A second pair of eyes')],
  tags=['AI in healthcare', 'AI predicts disease', 'machine learning medicine', 'early disease detection', 'predictive medicine',
        'AI cancer detection', 'Mirai mammogram AI', 'DeepMind kidney', 'retina scan AI', 'AI ECG', 'Parkinson\'s smartwatch',
        'medical AI explained', '3D animation', 'science explained'],
  hashtags='#AI #Health #Science'),
 dict(n=2, m='nanobots',
  title='Can Nanobots Repair Your Body From Inside?',
  thumb='IN YOUR BLOOD',
  alts=['How Nanobots Shrank Tumors by 90% in Mice', 'Robots Smaller Than a Cell Are Already Here'],
  hook=('Nanobots smaller than a single cell are already swimming, steering and delivering drugs inside living animals. '
        'How do they move, what powers them, and could they ever repair your body from the inside?'),
  body=('This 3D-animated explainer covers Feynman\'s 1959 idea, why water feels like honey at the microscale, magnetic '
        'corkscrew microrobots, enzyme-powered nanobots that shrank bladder tumors in mice, DNA origami robots, '
        'xenobots, the nanotechnology already inside mRNA vaccines, and the huge hurdles left: the immune system, '
        'navigation, manufacturing and safety.'),
  chapters=[(1, 'A machine smaller than a cell'), (4, 'Feynman\'s 1959 idea'), (7, 'How small is nano?'),
            (10, 'Swimming through honey'), (13, 'Magnetic corkscrew robots'), (18, 'Powering a nanobot'),
            (22, 'DNA robots vs tumors'), (27, 'Nanotech already inside you'), (31, 'Robots made of living cells'),
            (34, 'Why we don\'t have them yet'), (41, 'What the future could hold')],
  tags=['nanobots', 'nanorobots', 'medical nanobots', 'nanotechnology', 'nanomedicine', 'microrobots', 'DNA origami',
        'xenobots', 'nanobots in the body', 'cancer nanobots', 'Fantastic Voyage', 'Richard Feynman', '3D animation',
        'science explained'],
  hashtags='#Nanobots #Science #Medicine'),
 dict(n=3, m='crispr',
  title='CRISPR Explained: How Scientists Rewrite DNA',
  thumb='EDIT ONE LETTER',
  alts=['How CRISPR Can Rewrite Human DNA', 'The 2012 Discovery That Lets Us Rewrite DNA'],
  hook=('CRISPR lets scientists find one spot among three billion DNA letters and rewrite it. '
        'Here\'s how this gene-editing tool works, how it\'s treating sickle cell disease, and why it scares people too.'),
  body=('A 3D-animated guide to CRISPR-Cas9: the bacterial immune system it came from, Doudna and Charpentier\'s 2012 '
        'breakthrough and Nobel Prize, how guide RNA and Cas9 cut DNA, base and prime editing, Casgevy for sickle cell '
        'disease and beta thalassemia, editing inside the body, CRISPR crops and gene drives, the He Jiankui embryo '
        'scandal, off-target risks and the $2 million price tag.'),
  chapters=[(1, 'Rewriting the code of life'), (5, 'A weapon borrowed from bacteria'), (12, 'The 2012 breakthrough'),
            (15, 'How CRISPR cuts DNA'), (20, 'Base and prime editing'), (23, 'Treating sickle cell disease'),
            (31, 'Editing inside the body'), (34, 'Crops and mosquitoes'), (38, 'The CRISPR babies scandal'),
            (42, 'Risks, price and what\'s next')],
  tags=['CRISPR', 'CRISPR explained', 'CRISPR Cas9', 'gene editing', 'how CRISPR works', 'DNA editing', 'Casgevy',
        'sickle cell cure', 'base editing', 'prime editing', 'Jennifer Doudna', 'He Jiankui', '3D animation', 'science explained'],
  hashtags='#CRISPR #DNA #Science'),
 dict(n=4, m='agi',
  title='What Happens If AI Becomes Smarter Than Humans?',
  thumb='THE LAST INVENTION',
  alts=['What If AI Becomes Smarter Than Us?', 'AI Smarter Than Humans by 2047?'],
  hook=('What happens when we build AI that\'s smarter than us at everything? '
        'Here\'s what artificial general intelligence is, when experts think it could arrive, and what could go right or very wrong.'),
  body=('A 3D-animated explainer on AGI and superintelligence: from Turing\'s 1950 question and Deep Blue to AlphaGo, '
        'AlphaFold and large language models; scaling laws and compute; the 2024 survey of thousands of AI researchers; '
        'I. J. Good\'s intelligence explosion; the alignment problem; misuse and jobs; and the safety work and laws now '
        'taking shape.'),
  chapters=[(1, 'Smarter than us?'), (4, 'What is AGI?'), (6, 'From Deep Blue to AlphaFold'), (12, 'How language models work'),
            (15, 'Brains vs computers'), (18, 'When could AI match us?'), (20, 'The intelligence explosion'),
            (24, 'The best case'), (26, 'The alignment problem'), (31, 'Misuse, power and jobs'),
            (34, 'How worried are experts?'), (37, 'Making AI safe'), (41, 'It depends on us')],
  tags=['AGI', 'artificial general intelligence', 'superintelligence', 'AI smarter than humans', 'future of AI', 'AI risk',
        'AI alignment', 'intelligence explosion', 'AI safety', 'large language models', 'AlphaFold', 'AI explained',
        '3D animation', 'science explained'],
  hashtags='#AI #AGI #Future'),
 dict(n=5, m='fusion',
  title='How Nuclear Fusion Works at 150 Million Degrees',
  thumb='10× THE SUN',
  alts=['The Secret Technology Behind Nuclear Fusion', 'Why Fusion Is Always 30 Years Away'],
  hook=('Nuclear fusion powers the Sun, and scientists are trying to build a star on Earth. '
        'Here\'s how fusion works, how magnets and lasers hold plasma hotter than the Sun\'s core, and how close we really are.'),
  body=('A 3D-animated explainer: fusion vs fission, deuterium and tritium, E=mc², why nuclei repel, plasma at '
        '150 million degrees, tokamaks and stellarators, superconducting magnets, KSTAR, JET and Wendelstein 7-X records, '
        'ignition at the National Ignition Facility in 2022, ITER, Commonwealth Fusion Systems\' SPARC, and the challenges '
        'of neutrons, tritium fuel and cost.'),
  chapters=[(1, 'A star on Earth'), (5, 'Fusion vs fission'), (10, 'Why fusion is so hard'), (16, 'Holding plasma with magnets'),
            (21, 'The twisted stellarator'), (23, 'Record-breaking machines'), (25, 'Ignition with lasers'),
            (29, 'ITER and the private race'), (34, 'The remaining challenges'), (38, 'Safe, clean and steady?'),
            (41, 'Is fusion finally close?')],
  tags=['nuclear fusion', 'fusion energy', 'how fusion works', 'tokamak', 'stellarator', 'ITER', 'fusion ignition',
        'National Ignition Facility', 'plasma', 'SPARC fusion', 'clean energy', 'fusion vs fission', '3D animation',
        'science explained'],
  hashtags='#Fusion #Energy #Science'),
 dict(n=6, m='organs',
  title='Can Scientists Grow a New Human Organ?',
  thumb='PRINTED HEART',
  alts=['17 People Die Daily Waiting for an Organ', 'Can We 3D-Print a Human Heart?'],
  hook=('Over a hundred thousand people in the US are waiting for an organ transplant. Could scientists grow new ones instead? '
        'Here\'s how lab-grown organs, 3D bioprinting and gene-edited pig organs work, and how close they are.'),
  body=('A 3D-animated explainer on regenerative medicine: the first transplant in 1954, rejection, why blood vessels are '
        'the hardest part, Anthony Atala\'s lab-grown bladders, the "ghost heart" experiment, Yamanaka\'s stem cells, '
        'organoids, the 3D-printed heart from Tel Aviv, gene-edited pig hearts and kidneys, human-animal chimeras, '
        'and what still stands in the way.'),
  chapters=[(1, 'The organ waiting list'), (5, 'The first transplant'), (11, 'Why organs are so hard to grow'),
            (15, 'Lab-grown bladders and skin'), (19, 'The ghost heart'), (22, 'Stem cells from skin'), (25, 'Mini-organs'),
            (27, '3D-printing a heart'), (31, 'Pig organs for people'), (38, 'Human organs in animals?'),
            (41, 'So, can we grow one?')],
  tags=['lab grown organs', 'growing human organs', '3D bioprinting', '3D printed heart', 'organ transplant', 'pig kidney transplant',
        'xenotransplantation', 'stem cells', 'organoids', 'regenerative medicine', 'tissue engineering', 'organ donation',
        '3D animation', 'science explained'],
  hashtags='#Science #Medicine #Biotech'),
 dict(n=7, m='bci',
  title='How Brain Chips Turn Thoughts Into Words',
  thumb='MIND → TEXT',
  alts=['How Brain-Computer Interfaces Can Read Your Thoughts', 'Can a Brain Chip Read Your Mind?'],
  hook=('Brain-computer interfaces are letting paralyzed people move cursors, control robot arms and speak again, just by thinking. '
        'Here\'s how brain chips like Neuralink work, and whether they can really read your thoughts.'),
  body=('A 3D-animated explainer on BCIs: how neurons fire, EEG vs implanted electrodes, the Utah array and BrainGate, '
        'robotic arms and a sense of touch, handwriting and speech decoders, the 2023-2024 speech breakthroughs, Neuralink, '
        'Synchron\'s stentrode, walking again with a brain-spine bridge, decoding meaning from fMRI, neurorights, privacy and risks.'),
  chapters=[(1, 'Listening to your brain'), (5, 'How neurons talk'), (8, 'Listening from outside: EEG'),
            (11, 'Implants inside the brain'), (14, 'Cursors and robot arms'), (17, 'Decoding intentions'),
            (20, 'Giving people their voice back'), (25, 'Neuralink, Synchron and walking again'),
            (30, 'Can it read your mind?'), (33, 'Privacy and risks'), (37, 'What comes next')],
  tags=['brain computer interface', 'BCI', 'Neuralink', 'brain chip', 'brain implant', 'mind reading technology', 'Synchron',
        'BrainGate', 'neurotechnology', 'thought to text', 'speech decoding', 'ALS', '3D animation', 'science explained'],
  hashtags='#Neuralink #BCI #Science'),
 dict(n=8, m='blackhole',
  title='What Happens If You Fall Into a Black Hole?',
  thumb='NO WAY BACK',
  alts=['Falling Into a Black Hole, Step by Step', 'What You\'d See Falling Into a Black Hole'],
  hook=('What would actually happen if you fell into a black hole? Would you be crushed, stretched, or frozen in time? '
        'Here\'s the real answer, step by step, in 3D.'),
  body=('A 3D-animated journey into Sagittarius A*, the supermassive black hole at the center of the Milky Way: how black holes '
        'form, curved space-time, the event horizon, the Event Horizon Telescope image, the photon sphere, spaghettification, '
        'time dilation, what you\'d see as you cross the horizon, the singularity, wormholes and Hawking radiation.'),
  chapters=[(1, 'Falling into the dark'), (5, 'How black holes form'), (9, 'Bending space-time'),
            (14, 'The monster at our galaxy\'s center'), (20, 'How we know they\'re real'), (24, 'The journey begins'),
            (30, 'Stepping outside'), (35, 'Spaghettification'), (41, 'Time slows down'), (45, 'Crossing the horizon'),
            (47, 'Inside the black hole'), (52, 'Wormholes and Hawking radiation'), (57, 'So, what happens?')],
  tags=['black hole', 'falling into a black hole', 'what happens if you fall into a black hole', 'inside a black hole',
        'event horizon', 'spaghettification', 'Sagittarius A*', 'time dilation', 'singularity', 'Hawking radiation',
        'astrophysics', 'space documentary', '3D animation', 'science explained'],
  hashtags='#BlackHole #Space #Science'),
 dict(n=9, m='robots',
  title='How Humanoid Robots Learn to Walk',
  thumb='MILLIONS OF FALLS',
  alts=['Why Walking Is So Hard for Robots', 'Humanoid Robots Explained: From ASIMO to Atlas'],
  hook=('Walking is one of the hardest problems in robotics. Here\'s how humanoid robots went from shuffling and falling '
        'to running and dancing, by practicing millions of times in virtual worlds.'),
  body=('A 3D-animated explainer: why walking is a controlled fall, the inverted pendulum, robot sensors, WABOT-1, the zero '
        'moment point, Honda\'s ASIMO, the DARPA Robotics Challenge falls, Boston Dynamics\' Atlas, reinforcement learning, '
        'training thousands of robots in simulation, domain randomization, motion capture, and humanoids in warehouses '
        'and the 2025 Beijing robot half marathon.'),
  chapters=[(1, 'Why walking is hard'), (5, 'A controlled fall'), (10, 'The first walking robots'),
            (18, 'Atlas and dynamic balance'), (21, 'Learning by trial and error'), (27, 'Training in simulation'),
            (31, 'From virtual to real'), (36, 'Learning from humans'), (39, 'Robots in the real world'),
            (42, 'What comes next')],
  tags=['humanoid robots', 'how robots learn to walk', 'robot walking', 'reinforcement learning', 'robotics', 'Boston Dynamics Atlas',
        'ASIMO', 'sim to real', 'domain randomization', 'AI robots', 'Unitree', 'Figure AI', '3D animation', 'science explained'],
  hashtags='#Robots #AI #Science'),
 dict(n=10, m='windmill',
  title='How a Boy in Malawi Built a Windmill From Scrap',
  thumb='CALLED HIM CRAZY',
  alts=['How One Boy Built a Windmill From Scrap', 'The Boy Who Harnessed the Wind: True Story'],
  hook=('During a famine in Malawi, a teenager who had to drop out of school built a working windmill from scrap '
        'and brought electricity to his home. This is the true story of William Kamkwamba, and the science behind it.'),
  body=('A 3D-animated true story: the 2001 Malawi famine, the library book "Using Energy", Faraday\'s electromagnetic '
        'induction and the bicycle dynamo, building blades from PVC pipe and a tower from blue gum trees, the first light, '
        'a homemade circuit breaker, a solar-powered water pump, his TED talk, and "The Boy Who Harnessed the Wind".'),
  chapters=[(1, 'Famine in Malawi'), (8, 'A library book'), (14, 'The science of a dynamo'), (21, 'Building it from scrap'),
            (30, 'The light comes on'), (34, 'Lighting up the village'), (41, 'From Malawi to TED'),
            (49, 'Big ideas from anywhere')],
  tags=['William Kamkwamba', 'The Boy Who Harnessed the Wind', 'windmill from scrap', 'homemade windmill', 'Malawi',
        'wind power', 'how a dynamo works', 'electromagnetic induction', 'inspiring true story', 'renewable energy',
        'TED talk', 'invention story', '3D animation', 'science explained'],
  hashtags='#TrueStory #WindPower #Science'),
]


def mmss(t):
    t = int(t)
    return f'{t // 60}:{t % 60:02d}'


def chapters(ep):
    starts = {s['i']: s['start'] for s in T[ep['m']]['shots']}
    total = T[ep['m']]['total']
    rows = [(0.0 if i == 1 else starts[i], name) for i, name in ep['chapters']]
    ends = [r[0] for r in rows[1:]] + [total]
    assert rows[0][0] == 0 and len(rows) >= 3 and all(e - s >= 10 for (s, _), e in zip(rows, ends)), ep['m']
    return '\n'.join(f'{mmss(s)} {name}' for s, name in rows)


def build(ep):
    desc = (f"{ep['hook']}\n\n{ep['body']}\n\nChapters\n{chapters(ep)}\n\n"
            "Animated in 3D. Narration and captions are synthetic; facts are drawn from published research and reporting "
            "up to 2025. If you spot an error, tell us in the comments.\n\n"
            "Subscribe for more 3D science explainers.\n\n"
            f"{ep['hashtags']}")
    tags = ', '.join(ep['tags'])
    assert len(desc) < 5000 and len(tags) < 500, ep['m']
    return desc, tags


if __name__ == '__main__':
    allmd = []
    for ep in EPS:
        desc, tags = build(ep)
        md = (f"# Episode {ep['n']}: {ep['title']}\n\n"
              f"**Title:** {ep['title']}\n\n"
              f"**Thumbnail text:** {ep['thumb']}  (image: `thumbs/{ep['m']}.jpg`)\n\n"
              f"**A/B alternatives:** {' | '.join(ep['alts'])}\n\n"
              f"**Description:**\n\n```\n{desc}\n```\n\n**Tags:**\n\n```\n{tags}\n```\n")
        (HERE / f"{ep['m']}.md").write_text(md)
        allmd.append(md)
    (HERE / 'ALL_EPISODES.md').write_text('\n---\n\n'.join(allmd))
    print('ok')
