# Cartoon Case Files

Animated true crime for YouTube Shorts, Reels and TikTok (1080×1920, 1–2 minutes). Big-eyed, Pixar-style characters tell real cases: a con, a heist or a mystery, with a twist at the end.

It uses the same 3D engine as Tech Shorts (`../tech-shorts/engine3d`). The cast and props are in `engine3d/sets/crime.js`, and `"format": "story"` swaps the numbered step pill for a red **CASE FILE** chapter tab.

| # | Episode | Status |
|---|---|---|
| 1 | The Man Who Sold the Eiffel Tower (Victor Lustig, 1925) | Rendered (`the-man-who-sold-the-eiffel-tower.mp4`) |
| 2 | The Hijacker Who Vanished (D.B. Cooper, 1971) | Script ready; needs `db_*` sets |
| 3 | The Sandwich That Cracked a Diamond Heist (Antwerp, 2003) | Script ready; needs `aw_*` sets |
| 4 | 13 Paintings, 81 Minutes, Still Missing (Gardner Museum, 1990) | Script ready; needs `gd_*` sets |
| 5 | The 26 Kids Who Dug Their Way Out (Chowchilla, 1976) | Script ready; needs `ch_*` sets |

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
- Presets: `LUSTIG`, `POISSON`, `dealer(i)`, `gendarme()`.
- Props: `tower()`, `parisRow()`, `table()`, `suitcase()`, `cashStack()`, `bill()`, `newspaper(head, sub)`.
- Moods: `NIGHT`, `DUSK`, `ROOM`.
- Keep signs below about y = 4 at normal camera distances. The case-file chip covers the top of the frame.

See `PROMPT-PACK.md` if you would rather make episodes with AI image and video tools, as the reference clips do.
