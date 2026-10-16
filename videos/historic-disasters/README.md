# Historic Disasters

A series of 10-minute documentaries, animated in a serious stickman style: ink on aged paper, one red accent for loss, and dark night palettes for the disasters themselves.

| # | Episode | Status |
|---|---|---|
| 1 | Titanic (1912) | Done |
| 2 | Chernobyl (1986) | Done |
| 3 | Challenger (1986) | Done |
| 4 | The Dust Bowl (1930s) | Done |
| 5 | Bhopal (1984) | Done |
| 6 | The Johnstown Flood (1889) | Done |
| 7 | Tenerife (1977) | Done |
| 8 | The Hindenburg (1937) | Done |
| 9 | Aberfan (1966) | Done |
| 10 | Deepwater Horizon (2010) | Done |

Each episode folder holds `script.json` (narration with one visual per line), `captions.srt`, `chapters.txt`, `description.txt`, `tags.txt` and `thumbnail.jpg`.

## Engine

`engine/stickdoc.js` draws every scene on a 1280×720 canvas. `voice.py` voices each line with Piper and writes the timings, captions and chapters. `render_ep.sh` builds the page, renders it in three parallel segments with Playwright, and adds the narration. `sets.js` holds the scene sets for episodes 2–10 and is inlined by `build_page.py`. `queue.sh` renders episodes one after another, `package.py` makes the thumbnail and description, `sheet.cjs` makes a QA contact sheet and `fixjson.sh` cleans up a script.
