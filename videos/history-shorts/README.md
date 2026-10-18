# Weird History of Medicine

Vertical (1080×1920) shorts, about 35 seconds each, on strange medical history: drilling holes in skulls, bloodletting, mercury cures, radium water and more.

The series comes in two looks:

- **Episodes 1–2** are realistic stylised 3D. They use one AI-generated still per narration line, with slow camera moves and punch-in cuts.
- **Episodes 3–20** are cartoon 3D, made with the same three.js engine as the Body Shorts. The free image credits ran out after two episodes.

Every episode has burned-in captions. Each episode folder holds the video, `captions.srt` and `thumbnail.jpg`.

| # | Episode | Folder | Look |
|---|---|---|---|
| 1 | Why Doctors Drilled Holes in Skulls | `01-trepanation` | Realistic stills |
| 2 | The Cure That Killed George Washington | `02-bloodletting` | Realistic stills |
| 3 | Why Hospitals Still Use Leeches | `03-leeches` | Cartoon 3D |
| 4 | When Doctors Treated Disease With Mercury | `04-mercury` | Cartoon 3D |
| 5 | Why Doctors Blew Smoke Into People | `05-smoke-enema` | Cartoon 3D |
| 6 | Why Plague Doctors Wore Bird Masks | `06-plague-doctor` | Cartoon 3D |
| 7 | When People Ate Mummies as Medicine | `07-mummy-medicine` | Cartoon 3D |
| 8 | The Energy Drink That Made a Man's Jaw Fall Off | `08-radium-water` | Cartoon 3D |
| 9 | When Heroin Was Cough Medicine | `09-heroin-syrup` | Cartoon 3D |
| 10 | When Kids Got Cocaine for Toothache | `10-cocaine-drops` | Cartoon 3D |
| 11 | The Ice Pick Surgery That Won a Nobel Prize | `11-ice-pick` | Cartoon 3D |
| 12 | The Fastest Surgeon in History | `12-fastest-surgeon` | Cartoon 3D |
| 13 | The Doctor Who Told Everyone to Wash Their Hands | `13-semmelweis` | Cartoon 3D |
| 14 | Why Barber Poles Are Red and White | `14-barber-pole` | Cartoon 3D |
| 15 | What Was Actually in Snake Oil | `15-snake-oil` | Cartoon 3D |
| 16 | The Milkmaid Secret That Beat Smallpox | `16-cowpox` | Cartoon 3D |
| 17 | The Man Who Lived in an Iron Lung for 70 Years | `17-iron-lung` | Cartoon 3D |
| 18 | The Baby Medicine That Was Really Morphine | `18-soothing-syrup` | Cartoon 3D |
| 19 | When People Thought Worms Caused Cavities | `19-tooth-worm` | Cartoon 3D |
| 20 | The Magic Stone That Was Tested on a Prisoner | `20-bezoar` | Cartoon 3D |

## Scripts

`scripts.py` holds all 20 scripts and writes each episode's `script.json`. Each line in a script has an image prompt and its narration, and the shared image style is in `STYLE`.

`to3d.py` turns these into `script3d.json` for episodes 3–20. Each one keeps the same narration and points to a scene file, `../tech-shorts/engine3d/sets/body/hNN.js`. The scene files use the history kit in `sets/body/hist.js`, which provides costumes, rooms and period props.

## How it's made

Set up the Kokoro voice once with `../tech-shorts/engine/setup_kokoro.sh DIR`.

**Realistic episodes (1–2).**
1. Generate one 9:16 image per script line and save them as `NN-slug/images/s1.jpg`, `s2.jpg` and so on.
2. Run `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR`.

This uses `engine/page.html` and `engine/render.cjs` and takes about 2 minutes per episode.

**Cartoon 3D episodes (3–20).** Run `KOKORO_DIR=DIR ./make3d.sh NN-slug WORKDIR`. Each episode takes about 15 minutes on SwiftShader.

To render a batch, list the episode folders in `WORKROOT/queue.txt` and run `KOKORO_DIR=DIR ./make3d-all.sh WORKROOT MINUTES`. It skips episodes that already have a video and stops after the given number of minutes.
