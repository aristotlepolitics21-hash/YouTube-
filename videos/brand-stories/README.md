# Brand Stories

Ten vertical shorts (1080×1920) on how famous brands really started, focusing on the money moves along the way: cheap deals, bad bets and lucky breaks.

They use the same code-drawn editorial style and engine as `../underdog-shorts`. The engine has extra props for these stories, including the Beetle, savings stamps, flat packs, a waffle iron, a loom, bricks, playing cards, bottles, coupons, a milkshake mixer, a land deed, a tractor and a sports car.

| # | Episode | Folder |
|---|---|---|
| 1 | How Volkswagen Began | `01-volkswagen` |
| 2 | How IKEA Began With Pens | `02-ikea` |
| 3 | How Nike Started From a Car Boot | `03-nike` |
| 4 | How LEGO Survived Bankruptcy, Fire and Plastic | `04-lego` |
| 5 | Toyota Started With Weaving Looms | `05-toyota` |
| 6 | Nintendo Started as a Card Company | `06-nintendo` |
| 7 | Samsung Started Selling Dried Fish | `07-samsung` |
| 8 | Coca-Cola Sold Its Bottling Rights for 1 Dollar | `08-coca-cola` |
| 9 | McDonald's Is Really a Property Business | `09-mcdonalds` |
| 10 | A Tractor Maker Took On Ferrari | `10-lamborghini` |

Each episode folder holds the video, `captions.srt`, `thumbnail.jpg` and `script.json`.

- **No logos:** the characters and products are generic drawings, and no brand logos are drawn.
- **Uncertain stories:** stories that are disputed or rest on one person's word are flagged in the narration ("the story goes", "reportedly", "he later said").
- **VW:** the Volkswagen episode states plainly that the factory was run by the Nazi regime and used forced labour during the war.

## How it's made

1. Run `python3 scripts.py`.
2. Run `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR` for each episode.

`make.sh` uses the renderer in `../underdog-shorts/engine`. The shot format is described in `../underdog-shorts/README.md`.
