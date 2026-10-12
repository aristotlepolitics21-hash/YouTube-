# Tech Shorts

Vertical (1080×1920) animated tech explainers, about two minutes each, built for YouTube Shorts.
The look is a neon diagram on a dark grid, with five numbered steps and burned-in captions.

| # | Episode | Status |
|---|---|---|
| 1 | What Happens in the 1 Second After You Hit Enter | Rendered (2D and 3D) |

Each episode folder holds `script.json` (one scene and one narration line per entry), `captions.srt`, `chapters.txt`, `description.txt`, `tags.txt` and `thumbnail.jpg`.

## Engine

- `engine/techdoc.js` draws every scene on a 1080×1920 canvas.
- `engine/voice.py` voices each line offline with RHVoice (`apt-get install rhvoice rhvoice-english`), then writes the narration, timings, captions and chapters.
- `engine/build_page.py` builds the page, `engine/seg.cjs` renders frames with Playwright, and `engine/render.sh` does the whole thing in one go:

```
videos/tech-shorts/engine/render.sh videos/tech-shorts/01-hit-enter/script.json WORKDIR what-happens-when-you-hit-enter
```

`engine/sheet.cjs PAGE.html OUTDIR` renders one still per scene, to check layouts before a full render.

## 3D engine (Pixar-inspired)

`engine3d/` renders the same scripts as stylised 3D in three.js: Bit, a glossy round robot, carries the request through soft toy-like sets, with a warm key light, cool rim light, soft shadows, reflections and bloom on glowing parts. It uses the same narration, captions and timings as the 2D engine. Each scene key in `script.json` maps to a set in `engine3d/pixar.js`.

```
cd videos/tech-shorts/engine3d && npm install
./render.sh ../01-hit-enter/script.json WORKDIR what-happens-when-you-hit-enter-3d
```

It renders on the CPU (SwiftShader), at about 2 seconds a frame, in four parallel segments. `sheet.cjs PAGE.html OUTDIR [frac] [lines]` renders single stills to check sets first.
