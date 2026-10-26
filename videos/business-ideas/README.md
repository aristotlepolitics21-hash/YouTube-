# 100 Business Ideas

Desi cartoon skits (1080×1920, about 50 seconds each), made in batches of 10. Every idea comes in two versions:

- **Hindi:** a Hindi voice with Hinglish (Roman) captions, `NN-slug-hindi.mp4`.
- **English:** `NN-slug-english.mp4`.

Each skit follows the same ten beats:

1. The hero is stuck (no job, no money).
2. Chacha Ji (Gandhi topi, blue kurta) pitches the business.
3. The hero asks a question.
4. Chacha Ji gives the setup cost.
5. Chacha Ji gives a setup tip.
6. A customer arrives at the new shop.
7. The hero quotes the price.
8. Chacha Ji gives the daily earnings.
9. Chacha Ji gives a growth tip.
10. "<Name> Ki Life Set! 😂"

## Batch 1

| # | Idea | Shop sign |
|---|---|---|
| 1 | Tyre puncture shop | ABDUL TIRE WALA |
| 2 | Chai stall | RAJU CHAI WALA |
| 3 | Mobile repair | SONU MOBILE WALA |
| 4 | Tiffin service | SUNITA TIFFIN SERVICE |
| 5 | Sugarcane juice | PAPPU GANNA JUICE |
| 6 | Pani puri cart | GOLU GOLGAPPE WALA |
| 7 | Xerox & online forms | BUNTY XEROX CENTRE |
| 8 | Bike & car wash | KALLU WASHING CENTRE |
| 9 | Momos stall | CHINTU MOMOS |
| 10 | Ironing stall | MUNNA PRESS WALA |

Each episode folder holds:

- both videos;
- `captions-hi.srt` / `captions-en.srt`;
- `thumbnail-hi.jpg` / `thumbnail-en.jpg`;
- `script-hi.json` / `script-en.json`.

Money figures are rough Indian estimates. They vary by city and season, and the last beat of each video says so.

## How it's made

1. `scripts.py` holds every idea and writes both script files. Each line is stored as Devanagari for the Hindi voice, a Roman Hinglish caption, and an English line.
2. `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR [hi en]` voices, renders and muxes each episode.

Voices are Kokoro, one per character:

| Character | Hindi | English |
|---|---|---|
| Chacha Ji | hm_omega | bm_george |
| Male hero | hm_psi | am_puck |
| Female hero | hf_alpha | af_bella |
| Customers | blended or female voices (set per customer in `scripts.py`) | |

The renderer is `engine/page.html` with `engine/render.cjs`. It is all code-drawn:

- **Backgrounds:** home, street, and a shop with a big sign banner, scalloped awning, nimbu-mirchi and props for each business.
- **Characters:** IK arms, poses, expressions, talking mouths, blinking, and props in hand. There are five looks: lungi + vest + gamcha, Gandhi topi + kurta, tilak + kurta, saree, and shirt or kurti.
- **Overlays:** a white dialogue box with a speaker tag and word-by-word highlighting, money stickers, and the "life set" finish with coin rain.
