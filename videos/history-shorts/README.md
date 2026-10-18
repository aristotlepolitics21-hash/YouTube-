# Weird History of Medicine

Vertical (1080×1920) shorts, about 35 seconds each, on strange medical history: drilling holes in skulls, bloodletting, mercury cures, radium water and more. The look is realistic stylised 3D, with one AI-generated still per narration line, slow camera moves, punch-in cuts and bold lowercase captions.

All 20 scripts are in `scripts.py`, which writes each episode's `script.json`. Each script line holds the image prompt for its scene and the narration; the shared style prompt is in `STYLE`.

| # | Episode | Status |
|---|---|---|
| 1 | Why Doctors Drilled Holes in Skulls | Rendered |
| 2–20 | See `scripts.py` | Scripted, waiting for images |

## How it's made

1. Generate one 9:16 image per script line from its prompt plus the style prompt. Save them as `NN-slug/images/s1.jpg`, `s2.jpg` and so on.
2. Set up the Kokoro voice once with `../tech-shorts/engine/setup_kokoro.sh DIR`.
3. Run `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR`.

`make.sh` voices the script, renders the scenes with `engine/page.html` and `engine/render.cjs` (Playwright, 2D canvas, about 2 minutes per episode), adds the narration, and writes the video, `captions.srt` and `thumbnail.jpg` into the episode folder.
