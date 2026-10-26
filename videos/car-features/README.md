# Car Features

Ten vertical shorts (1080×1920), about 45–55 seconds each, each one a feature rundown of a single car built on real photos. The batch covers five SUVs and sedans picked by the channel, plus five electric cars.

| # | Car | Folder |
|---|---|---|
| 1 | Volkswagen Virtus | `01-vw-virtus` |
| 2 | Kia Seltos | `02-kia-seltos` |
| 3 | Kia Sorento | `03-kia-sorento` |
| 4 | Toyota Fortuner | `04-fortuner` |
| 5 | Tata Safari | `05-tata-safari` |
| 6 | Tata Nexon EV | `06-nexon-ev` |
| 7 | BYD Atto 3 | `07-byd-atto3` |
| 8 | Hyundai Ioniq 5 | `08-ioniq5` |
| 9 | MG ZS EV | `09-mg-zs-ev` |
| 10 | Mahindra XUV400 | `10-xuv400` |

Each episode folder holds:

- the video, `captions.srt` and `thumbnail.jpg`;
- `script.json`;
- `photos/` with the photos used, and `photos.json` with each photo's credit line;
- `photo-credits.txt`, ready to paste into the YouTube description.

## Photos and licences

All photos come from Wikimedia Commons under CC BY, CC BY-SA, CC0 or public-domain licences. Each video shows the credit for the photo currently on screen, and the CC BY / CC BY-SA licences require that credit to appear in the YouTube description too.

Gaps in what's available:

- **Tata Safari:** Commons has almost no photos of the 2021+ model. The episode tells the story through the old Safari, the Safari Storme, the 2019 Buzzard concept and a current Safari from a 2025 auto show.
- **Nexon EV:** only one usable photo (2020 model).
- **XUV400:** only two usable photos.

## Specs

- Figures are manufacturer or claimed figures (ARAI/MIDC ranges for India, otherwise WLTP or market figures). They vary by variant and model year, and each video's last beat says so.
- The Kia Sorento is not sold in India, so its episode uses global figures and says that.

## How it's made

1. `fetch_photos.py search OUTDIR` lists freely licensed candidates per car.
2. `fetch_photos.py get PICKS.json .` downloads the chosen photos and writes the credits. Wikimedia rate-limits heavily, so it goes slowly.
3. `scripts.py` writes every `script.json`.
4. `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR` voices, renders and muxes each episode.

The renderer is `engine/page.html` plus `engine/render.cjs`. It draws:

- the photo, fitted to the width so the whole car stays in view, over a blurred fill, with slow pans and zooms;
- the model name and an animated spec card per line;
- captions, the photo credit, and a progress bar.

Captions show written forms (PS, NCAP, EV) for terms the narration spells out for the voice.
