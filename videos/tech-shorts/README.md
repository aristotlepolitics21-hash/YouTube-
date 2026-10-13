# Tech Shorts

Vertical (1080×1920) animated tech explainers, about two minutes each, built for YouTube Shorts.
The look is a neon diagram on a dark grid, with five numbered steps and burned-in captions.

| # | Episode | Status |
|---|---|---|
| 1 | What Happens in the 1 Second After You Hit Enter | Rendered (3D, Kokoro voice; the older 2D cut keeps the RHVoice narration) |
| 2 | How Wi-Fi Actually Works (in 5 Steps) | Rendered (3D, Kokoro voice) |
| 3 | How Your Phone Battery Actually Works (5 Steps) | Rendered (3D, Kokoro voice) |
| 4 | How GPS Actually Works (in 5 Steps) | Rendered (3D, Kokoro voice) |
| 5 | How Touchscreens Actually Work (5 Steps) | Rendered (3D, Kokoro voice, lively style) |
| 6 | How Noise Cancelling Actually Works (5 Steps) | Rendered (3D, Kokoro voice, lively style) |

Each episode folder holds `script.json` (one scene and one narration line per entry; an optional `"sets"` names an `engine3d/sets/` file with that episode's 3D sets), `captions.srt`, `chapters.txt`, `description.txt`, `tags.txt` and `thumbnail.jpg`.

## Engine

- `engine/techdoc.js` draws every scene on a 1080×1920 canvas.
- `engine/voice.py` voices each line, then writes the narration, timings, captions and chapters. The voice comes from `"voice"` in `script.json`:
  - `kokoro:af_heart` (from episode 3): Kokoro-82M, a natural neural voice that runs offline. Set it up once with `engine/setup_kokoro.sh DIR` (it fetches the model and voices from npm and the runtime from PyPI, and checks the model's sha256), then pass `KOKORO_DIR=DIR`. Other voices include `am_michael`, `af_bella` and `bm_george`.
  - an RHVoice profile such as `slt` (episodes 1 and 2): `apt-get install rhvoice rhvoice-english`.
- `engine/build_page.py` builds the page, `engine/seg.cjs` renders frames with Playwright, and `engine/render.sh` does the whole thing in one go:

```
videos/tech-shorts/engine/render.sh videos/tech-shorts/01-hit-enter/script.json WORKDIR what-happens-when-you-hit-enter
```

`engine/sheet.cjs PAGE.html OUTDIR` renders one still per scene, to check layouts before a full render.

## 3D engine (Pixar-inspired)

`engine3d/` renders the same scripts as stylised 3D in three.js: Bit, a glossy round robot, carries the request through soft toy-like sets, with a warm key light, cool rim light, soft shadows, reflections and bloom on glowing parts. It uses the same narration, captions and timings as the 2D engine. Each scene key in `script.json` maps to a set in `engine3d/pixar.js` (episode 1) or the episode's `engine3d/sets/` file; `sets/common.js` holds the shared helpers and the recap set.

```
cd videos/tech-shorts/engine3d && npm install
./render.sh ../01-hit-enter/script.json WORKDIR what-happens-when-you-hit-enter-3d
```

It renders on the CPU (SwiftShader): the 3D layer at 720×1280 under a full-resolution overlay, in two parallel segments, about 45 minutes for a two-minute episode. `sheet.cjs PAGE.html OUTDIR [frac] [lines]` renders single stills to check sets first.

### Lively style

Set `"style": "lively"` in `script.json` (from episode 5) for punch-in zoom cuts with a flash instead of soft fades, and a subtle handheld drift on every camera. Sets can also use `pose({ walk })` for Bit's walk cycle and `hop(x, dur, height)` for jumps with anticipation, stretch and landing squash.

### Story format

Set `"format": "story"` in `script.json` for narrative episodes (see `../cartoon-case-files`). The numbered step pill becomes a red **CASE FILE** chapter tab showing the section name. `sets/crime.js` holds the shared human cast builder, `makeHuman()`.
