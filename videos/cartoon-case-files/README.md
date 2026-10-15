# Cartoon Case Files

Animated true crime for YouTube Shorts, Reels and TikTok (1080×1920, 1–2 minutes). Big-eyed, Pixar-style characters tell real cases: a con, a heist or a mystery, with a twist at the end.

It uses the same 3D engine as Tech Shorts (`../tech-shorts/engine3d`). The cast and props are in `engine3d/sets/crime.js`, and `"format": "story"` swaps the numbered step pill for a red **CASE FILE** chapter tab.

| # | Episode | Status |
|---|---|---|
| 1 | The Man Who Sold the Eiffel Tower (Victor Lustig, 1925) | Rendered (`the-man-who-sold-the-eiffel-tower.mp4`) |
| 2 | The Hijacker Who Vanished (D.B. Cooper, 1971) | Rendered (`the-hijacker-who-vanished.mp4`) |
| 3 | The Sandwich That Cracked a Diamond Heist (Antwerp, 2003) | Rendered (`the-sandwich-that-cracked-a-diamond-heist.mp4`) |
| 4 | 13 Paintings, 81 Minutes, Still Missing (Gardner Museum, 1990) | Rendered (`13-paintings-81-minutes-still-missing.mp4`) |
| 5 | The 26 Kids Who Dug Their Way Out (Chowchilla, 1976) | Rendered (`the-26-kids-who-dug-their-way-out.mp4`) |
| 6 | The Grandpa Gang (Hatton Garden, 2015) | Rendered (`the-grandpa-gang.mp4`): AI-image stills with depth parallax. Shots 6–13 reuse the first images with `src`/`crop`; replace them with new images or clips any time |

## The formula (it's the one your reference clips use)

1. **Hook in one line** with an impossible-sounding fact ("He sold the Eiffel Tower. It wasn't his.").
2. **Title card** plus a case number, so viewers start to collect episodes.
3. **Three or four chapters**, each a single visual idea: a newspaper, a secret meeting, a bribe, a getaway.
4. **A turn**: the clever trick, the small mistake, or the hero moment (a kid finds the money, a sandwich gives the gang away).
5. **An ending and a question** ("Would you have fallen for it?") to get comments.

## Rules for this channel

- **Pick cases with distance.** Choose historical cases, cons and heists, or cases where the victims are the heroes. Avoid recent murders and cases where grieving families are easy to find. Never make a victim's death the punchline.
- **No gore, no weapons on screen.** Use cutaways, shadows and objects (an empty frame, a briefcase) instead.
- **Set "Not made for kids".** Cartoon styling and crime themes together can get flagged as content aimed at children. Upload with *Audience: not made for kids* and keep the thumbnails non-violent.
- **Hedge contested facts** with phrases like "the story goes", "an estimated", or "he later claimed". Every script here does this where sources disagree.
- **Disclose AI use** if you make episodes with AI image or video tools: tick YouTube's "altered or synthetic content" box.

## Render an episode

```
cd videos/tech-shorts/engine3d && npm install
KOKORO_DIR=/path/to/kokoro ./render.sh ../../cartoon-case-files/01-eiffel-tower/script.json WORKDIR the-man-who-sold-the-eiffel-tower
```

The voice is Kokoro `am_michael`, a calm male narrator. `bm_george` is a good British alternative. See `../tech-shorts/README.md` for the Kokoro setup and `sheet.cjs` stills.

## Building sets for a new episode (`crime.js`)

- `makeHuman(o)` builds a character. Options: `suit`, `skin`, `hair`, `hairStyle` (slick, side, curly, bald), `hat` (fedora, cap, kepi), `stache`, `belly`, `iris`, `nose`.
- `.pose({...})` sets expression and action: `talk`, `mouth` (smile, frown, open), `brow` (-1 angry to 1 worried), `wide`, `happy`, `sweat`, `walk`, `lean`, `eyeX`, `armR` / `armL` as `[x, z]`.
- More options: `shades`, `skirt`, `headScale` (use about 1.3 with a 0.6 overall scale for a child), hair `bob`, hat `pillbox`, and pose `sit`.
- Presets: `LUSTIG`, `POISSON`, `dealer(i)`, `gendarme()`, `COOPER`, `ATTENDANT`, `agent(i)`, `brian()`.
- Props: `tower()`, `parisRow()`, `table()`, `suitcase()`, `cashStack()`, `bill()`, `newspaper(head, sub)`, `jet()` (with a working rear airstair), `chute()`, `rain()`, `forest()`, `seatRow()`, `cabin()`, `cityLights()`.
- `titleSet(p, mood, makeCharacter)` builds a title card for any episode.
- Moods: `NIGHT`, `DUSK`, `ROOM`, `STORM`, `BEACH`.
- Keep signs below about y = 4 at normal camera distances. The case-file chip covers the top of the frame.

## Realistic human characters (stills mode)

The 3D sets use stylised toy-like people. For the realistic Pixar-style humans in the reference clips, generate one AI image per line and let the engine animate it:

1. Generate the shots with the prompts in the episode's `stills/PROMPTS.md` (Episode 1) or `PROMPT-PACK.md` (Episode 2). Use 9:16, the style block, and the same character reference for every shot.
2. Save each image as `stills/<scene key>.png`, `.jpg` or `.webp`, or number them in script order (`01.png`, `02.png` ...). An image-to-video clip named `<scene key>.mp4` can be used instead.
3. Add `"stills": "stills"` to the episode's `script.json` and render as usual.

With `DEPTH_DIR` set (run `../tech-shorts/engine/setup_depth.sh DIR` once), each image is split into three depth layers with Depth Anything V2. The layers slide and scale at different rates (a push in, a sideways drift or a rise), so it reads like a camera moving through the scene. Add `"fx": "rain" | "dust" | "steam" | "sparkle" | "alarm"` to a line's params for atmosphere on top. `"src": "<other key>"` reuses another line's image (or `refs_<name>` for `stills/refs/<name>`), and `"crop": [x, y, w, h]` (fractions of the image) frames part of it. Without it, each image gets a slow push or pull with drift, the punch-in cuts, the CASE FILE tab, narration and captions. Lines without an image keep their 3D set, so an episode can mix the two; a line with neither shows an "image needed" card. A line with `top`/`bottom`/`case` params gets the title card drawn over its image. Stills render in seconds per frame, much faster than the 3D sets.
