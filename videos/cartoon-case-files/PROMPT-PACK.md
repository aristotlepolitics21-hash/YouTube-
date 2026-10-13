# Prompt pack: making episodes with AI image and video tools

Your reference clips are made this way: **AI still → image-to-video → voiceover → captions**. Any script in this folder works with this workflow. Each `script.json` line is one shot.

## Workflow

1. **Character sheets first.** Generate each character once, front-facing on a plain background, and reuse that image as the character reference in every shot. This keeps faces consistent (Midjourney `--cref`, or the reference image in Leonardo, Ideogram or ChatGPT).
2. **One still per script line.** Use the style block below plus the shot prompt.
3. **Animate each still for 5 seconds** in Kling, Hailuo, Runway or Veo, using the motion prompt.
4. **Voiceover**: ElevenLabs, or the free Kokoro voice in this repo (`engine/voice.py` also writes `captions.srt` with timings).
5. **Edit** in CapCut: cut on every line, add punch-in zooms, burn in bold captions, and add a low music bed (about -22 dB) with a "whoosh" on each cut.

## Style block (paste into every image prompt)

> 3D animated film still, Pixar and Disney style, big expressive eyes, soft subsurface skin, cinematic lighting, warm key light with cool rim light, shallow depth of field, rich colour, highly detailed, vertical 9:16 composition, family-friendly, no gore

Negative prompt (where supported): `blood, gore, weapon close-up, text, watermark, extra fingers, deformed face`

## Episode 2 example: D.B. Cooper

**Characters**
- *Cooper*: a man in his 40s, slicked dark hair, dark sunglasses, black suit, white shirt, thin black tie, calm half-smile, holding a black briefcase.
- *Flight attendant*: 1970s airline uniform in teal, pillbox hat, kind face, wide eyes.
- *Brian (8)*: freckles, messy brown hair, red jacket, a gap-toothed grin.

| Line | Image prompt | Motion prompt |
|---|---|---|
| db_hook | Cooper falling through a stormy night sky with a parachute pack, cash bills swirling around him, a 1970s jet above | slow fall, bills flutter, camera tilts down |
| db_seat | Cooper in a 1970s airplane cabin window seat, rain on the window, ordering a drink, other passengers blurred | he glances sideways, subtle smile |
| db_note | Flight attendant holding a folded note, eyes wide with shock, Cooper behind her looking calm | her eyes widen, note trembles |
| db_case | Close-up of an open briefcase on a lap: tangled wires and red cylinders, dramatic rim light (stylised, not realistic) | slow push-in |
| db_seattle | Night airport tarmac, agents in trench coats handing a canvas money bag up the stairs, passengers leaving | passengers walk away, rain falls |
| db_stairs | The rear airstair of a 1970s jet opening in flight, rain and wind blasting, dark forest far below | the stairs lower, wind gusts |
| db_jump | A silhouette leaping from the rear stairs into the black rainy night | the figure drops out of frame |
| db_boy | Brian on a sunny river beach, his family building a campfire, sand and driftwood | he digs with his hands, curious |
| db_money | Brian holding up rotting, rubber-banded bundles of old $20 bills, astonished grin, parents shocked behind him | he lifts the money, parents gasp |
| db_files | A detective's desk: case file stamped UNSOLVED, map of Washington with red string | slow pan across the desk |
| db_outro | Cooper in sunglasses on an empty jungle beach at sunset, back to camera, a question mark in the clouds | waves roll, he turns his head slightly |

Use the same pattern for episodes 3–5: one character sheet per person, then one row per script line.
