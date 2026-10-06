# The Boy Who Harnessed the Wind: full CGI film

All 136 shots from `../cgi-batch`, built in three.js and cut to a narrated voiceover. About 8 minutes 38 seconds at 1280×720, 24 fps.

| File | What it is |
|---|---|
| `narration.json` | The voiceover, nine acts, each mapped to its shot range |
| `film.js` | All 136 shots. Needs three.js r160 and `../cgi-hero-threejs/hero.js` loaded first |
| `plan.py` | Voices each line with Piper (Ryan), builds the narration track, and stretches each act's shots to fit its narration (at least 3.8 s per shot) |
| `worker.cjs` | Renders a share of the shots in headless Chromium and writes one MP4 per shot |
| `film.srt` | Captions, timed to the narration |
| `chapters.txt` | Chapter times for the YouTube description |

## Facts checked for the narration

- Malawi sold almost all of its strategic grain reserve in 2001, before the 2001–02 famine.
- William found *Using Energy* in the library at Wimbe.
- He attended the African Leadership Academy near Johannesburg and graduated from Dartmouth College in 2014.
- TEDGlobal 2007 was held in Arusha, Tanzania.

The death toll is described as "many people did not survive that year" because published estimates vary widely.

## Before you publish

The narration is an AI voice. The characters are stylised CGI, not likenesses, but this is a dramatisation of a real person's life, so say so in the description.
