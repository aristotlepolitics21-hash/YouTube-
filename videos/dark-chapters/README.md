# Dark Chapters

Vertical (1080×1920) 3D-animated history Shorts, 60–80 seconds each: moments from history that hit hard, staged as moody toy dioramas with a red accent and burned-in captions. The format brief is in [analysis.md](analysis.md).

| # | Episode | Status |
|---|---|---|
| 1 | He Built a Cabin by Hand in the Wilderness and Lived Alone for 30 Years | Rendered (3D, Kokoro `am_michael`) |
| 2 | The Morning the Deadliest War in History Began | Rendered (3D, Kokoro `am_michael`) |
| 3 | The Trial That Changed International Law Forever | Rendered (3D, Kokoro `am_michael`) |

Each episode folder holds `script.json`, the rendered `.mp4`, `captions.srt`, `chapters.txt`, `description.txt`, `tags.txt` and `thumbnail.jpg`.

## Engine

It uses the Tech Shorts 3D engine (`../tech-shorts/engine3d`) with `"style": "dark"`, which adds a handheld camera and punch-in cuts with a black flash. The sets for all episodes are in `engine3d/sets/darkhistory.js`, and that file also replaces the overlay with a vignette, a red progress bar, the "DARK CHAPTERS · #N" tag, a chapter chip and the captions.

```
cd videos/tech-shorts/engine3d && npm install
KOKORO_DIR=DIR ./render.sh ../../dark-chapters/02-the-first-shot/script.json WORKDIR the-day-ww2-began-3d
./finalize.sh ../../dark-chapters/02-the-first-shot WORKDIR the-day-ww2-began-3d
```

Before voicing a script, check every date, number and name against a source.
