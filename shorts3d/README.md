# shorts3d — animated 3D explainer Shorts

Builds vertical (9:16) 3D-animated Shorts in the style of fast science-explainer
channels: a smooth clay human, an x-ray dissolve to the skeleton, macro "inside
the body" shots, fast cuts, word-by-word captions and sound effects.
Everything is original: the character is the CC0 *Human Base Meshes* bundle from
Blender, and every prop is built procedurally.

```
python -m shorts3d.make_short videos/shorts/<name>/short.json [--preview] [--only-shots s01,s05]
```

Output: `videos/shorts/<name>/final/<slug>.mp4` (1080×1920) plus `<slug>.srt`.

## What it does

1. **Narration.** Each shot's `line` is spoken by Piper TTS. Lines are cached by text and voice.
2. **Timeline.** Each shot lasts as long as its line, plus `gap_seconds` and an optional `hold`.
3. **Rendering.** Each shot is rendered by Blender in a separate process (`render_shot.py`) with Cycles on the CPU.
   - Frames go to `build/frames/<shot>_<hash of the shot spec>/`.
   - Frames that already exist are skipped, so an interrupted render can be resumed.
4. **Encoding.** Frames are upscaled to 1080×1920 and the shots are concatenated.
5. **Audio.**
   - The narration track gets procedural SFX synced to the animation: whooshes on cuts, cracks, pops, chimes, thunder, an electric buzz, heartbeats, ECG beeps, a flatline tone and rain.
   - A ducked ambient bed plays underneath.
   - The mix is loudness-normalised to −14 LUFS.
6. **Captions.** Whisper gives word timings. The captions are burned-in ASS: 2 words per cue, with the active word in yellow.

## Shot types (`visual.type`)

| type | what it shows | main keys |
|---|---|---|
| `character` | The posed, rigged human. | `look` is `clay`, `xray`, or `{from, to, at:[a,b]}` for a dissolve.<br>`pose` / `pose_to` (see `rig.body_pose`).<br>`crack {side, times, curl}`, `bone_glow {at, color}`.<br>`camera {from, to}`, each with an `anchor` (head, chest, hips, hands, hand.L, hand.R), an `offset` in metres and a `lens`. |
| `joint` | A macro of one finger joint: bones, capsule and synovial fluid. | `side`, `finger`, `separate [t0, t1, metres]`, `bubble {at, size, shrink}`, `mri`, `progress`, `orbit`, `distance` |
| `trophy` | A spinning gold cup on a plinth. | `spin` |
| `compare` | A lightning icon vs a sun, with bars growing to a ratio and a label such as "5×". | `ratio` |
| `crowd` | Rows of simple coloured figures. After a lightning flash, one greys out and topples. | `count`, `cols`, `flash_at`, `victim` |
| `count` | A big gold number, with lightning icons popping in one by one. | `count`, `text`, `span` |

**Extra `character` options** (all in `fx.py`):

| key | what it does |
|---|---|
| `env: "storm"` | Purple gradient sky, wet reflective floor and coloured lights. |
| `rain: true` | Rain falling for the whole shot. |
| `outfit` | Colours for `skin`, `shirt`, `pants` and `boots`, painted from bone weights. `shirt: null` leaves the chest bare. |
| `hat` | A ranger hat in the given colour. |
| `bolt {at, seed, from}` | A lightning strike on the head, with a sky flash and thunder. |
| `flashover {at:[a,b], strength}` | Glowing electric veins crawling over the skin, with a buzz. |
| `heart {beats:[[a,b],...], bpm, ecg}` | A glowing heart that beats only inside the given stretches of the shot, plus an ECG line that draws itself. Between the stretches you get a flatline tone. |
| `lichtenberg {reveal:[a,b], fade:[a,b]}` | A fern-shaped Lichtenberg figure that grows on the back, then fades. |

Shot `sfx` entries (`{"type": "chime", "at": 0.15}`) add extra sounds.

## Setup

- **Blender as a Python module.** This needs Python 3.13:
  `python3.13 -m venv ~/blender-venv && ~/blender-venv/bin/pip install bpy`.
  - If the venv lives somewhere else, point `SHORTS3D_BLENDER_PYTHON` at it.
- **The DocForge environment.** `make_short` runs in it, because it reuses DocForge's Piper, Whisper and FFmpeg helpers. See `docforge/README.md`.
- **The character bundle.** It is downloaded on the first run to `~/.cache/shorts3d/` (CC0, download.blender.org).
- **Set PYTHONPATH:**
  `PYTHONPATH=shorts3d:docforge python -m shorts3d.make_short …`

## Cost and speed

There are no paid APIs. On 4 CPU cores at 540×960 and 12 samples, it takes about
4–6 s per frame. A 45 s Short (~1,050 frames) renders in roughly 1.5 h.
Use `--preview`, which renders first, middle and last frames only, to check framing first.

## Tested here / known limits

- **Tested:** the knuckle-cracking Short, end to end, in this repo's cloud container.
- **The rig is home-made.** An armature is built from the skeleton's joints and the skin uses automatic weights.
  - Extreme poses deform poorly; forearm twist is the weakest point.
  - Keep cameras frontal for hand close-ups.
- **No facial animation and no lip sync.**
- **Sound effects and music are procedural placeholders.** A real SFX library would sound better.
- **The background limit.** Long renders here hit the 2-hour limit on background jobs. Render in halves with `--only-shots`; finished frames are reused.
