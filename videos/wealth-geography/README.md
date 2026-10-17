# Where the Money Lives: Why Does Wealth Concentrate in Certain Places?

A 7-minute 16:9 documentary in cinematic 3D with animated maps, narrated in a dramatic documentary voice (Kokoro, British "George" voice at 92% speed).

**Central question:** Why does wealth concentrate in certain places?
**Answer, in three forces:** geography (cheap movement by water), the snowball (agglomeration), and the rules (institutions), with history locking each in place.

| File | What it is |
|---|---|
| `script.json` | 45 lines in 7 sections; each line names a 3D set and its narration |
| `captions.srt` | Captions timed to the narration |
| `chapters.txt` | Chapter times (also in the description) |
| `description.txt` | Description with chapters and sources |
| `tags.txt` | Tags |
| `thumbnail.jpg` | 1280×720, text "WHY HERE?" |
| `engine/` | The film engine (see below) |

**Title:** Why Does Wealth Concentrate in Certain Places?
**Alternatives:** "Why Money Lives Where It Lives" · "Half the World's Wealth Sits on 1.5% of Its Land. Why?"

## Engine

- `engine/film.js`: every set, in three.js: the night globe, tilted regional maps with glowing rivers and gold "wealth towers", and the cinematic sets (cart and ship, the Congo rapids, a growing city, the Fairchild family tree, the fall line portage, Nogales, Korea, Detroit, the recap stack). It renders at 1280×720 under a 1920×1080 overlay with letterbox, grain, vignette, chapter cards and labels.
- `engine/geo.json`: Natural Earth 1:50m countries and GeoNames cities of 25,000+ people, packed by `engine/prep_geo.cjs` from the `world-atlas`, `topojson-client` and `all-the-cities` npm packages.
- `engine/render.sh` voices the script with `../tech-shorts/engine/voice.py`, builds the page, renders 24 fps segments in parallel, adds a low drone bed, and muxes:

```
cd videos/wealth-geography/engine && npm install
KOKORO_DIR=DIR ./render.sh ../script.json WORKDIR why-wealth-concentrates 3
```

`engine/sheet.cjs PAGE.html OUTDIR [frac] [lines]` renders one still per line, to check sets before a full render. A full render takes about an hour on 4 CPU cores (SwiftShader).

## Facts checked

- "Half the world's production fits on 1.5 percent of its land": World Bank WDR 2009.
- About 95% of Egyptians live along the Nile valley and delta; Greater Tokyo holds close to a third of Japan's population.
- Roman transport costs: Diocletian's Price Edict implies road haulage cost roughly 28–56 times sea freight, river about 5 times.
- Livingstone Falls block navigation on the lower Congo between Kinshasa and Matadi.
- Shockley Semiconductor Laboratory opened in Mountain View in 1956; Shockley chose the area partly to be near his mother in Palo Alto. The "traitorous eight" left in 1957 and founded Fairchild Semiconductor. Intel (1968) and AMD (1969) were founded by Fairchild alumni.
- Krugman's "Increasing Returns and Economic Geography" was published in 1991; he won the 2008 Nobel Prize.
- Fall-line cities and portage persistence: Bleakley and Lin (2012).
- Nogales income gap (about 3×): Acemoglu and Robinson, *Why Nations Fail* (2012). The narration says "by one estimate".
- Korea was divided in 1945. Acemoglu, Johnson and Robinson won the 2024 Nobel Prize.
- Detroit: 1,849,568 people in 1950 and 639,111 in 2020 (US Census). The on-screen counter steps through the real decennial census figures.

## Before you publish

The narration is an AI voice; say so in the description (already included). The rendered MP4 is not in git because of its size.
