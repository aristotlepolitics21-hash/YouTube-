# Tech Shorts

Vertical (1080×1920) animated tech explainers, about two minutes each, built for YouTube Shorts.
The look is a neon diagram on a dark grid, with five numbered steps and burned-in captions.

| # | Episode | Status |
|---|---|---|
| 1 | What Happens in the 1 Second After You Hit Enter | Rendered |

Each episode folder holds `script.json` (one scene and one narration line per entry), `captions.srt`, `chapters.txt`, `description.txt`, `tags.txt` and `thumbnail.jpg`.

## Engine

- `engine/techdoc.js` draws every scene on a 1080×1920 canvas.
- `engine/voice.py` voices each line offline with RHVoice (`apt-get install rhvoice rhvoice-english`), then writes the narration, timings, captions and chapters.
- `engine/build_page.py` builds the page, `engine/seg.cjs` renders frames with Playwright, and `engine/render.sh` does the whole thing in one go:

```
videos/tech-shorts/engine/render.sh videos/tech-shorts/01-hit-enter/script.json WORKDIR what-happens-when-you-hit-enter
```

`engine/sheet.cjs PAGE.html OUTDIR` renders one still per scene, to check layouts before a full render.
