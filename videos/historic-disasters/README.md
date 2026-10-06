# Historic Disasters

A series of 10-minute documentaries, animated in a serious stickman style: ink on aged paper, one red accent for loss, and dark night palettes for the disasters themselves.

| # | Episode | Status |
|---|---|---|
| 1 | Titanic (1912) | Done |
| 2 | Chernobyl (1986) | Planned |
| 3 | Challenger (1986) | Planned |
| 4 | The Dust Bowl (1930s) | Planned |
| 5 | Bhopal (1984) | Planned |
| 6 | The Johnstown Flood (1889) | Planned |
| 7 | Tenerife (1977) | Planned |
| 8 | The Hindenburg (1937) | Planned |
| 9 | Aberfan (1966) | Planned |
| 10 | Deepwater Horizon (2010) | Planned |

Each episode folder holds `script.json` (narration with one visual per line), `captions.srt`, `chapters.txt`, `description.txt`, `tags.txt` and `thumbnail.jpg`.

## Engine

`engine/stickdoc.js` draws every scene on a 1280×720 canvas. `voice.py` voices each line with Piper and writes the timings, captions and chapters. `render_ep.sh` builds the page, renders it in three parallel segments with Playwright, and adds the narration.
