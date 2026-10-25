# Money Shorts

Ten vertical (1080×1920) shorts, about 40 seconds each, on money basics and side hustles. They're made in a flat, illustrated motion-graphics style:

- **Background:** halftone paper.
- **Headline:** a big grotesk headline with one orange italic serif accent word.
- **Labels:** mono section labels at the top, and a running counter.
- **Props:** one prop card per beat. Cards include charts, bank balances, receipts, a chat box, timers and checklists.
- **Presenter:** an original cartoon in a beanie and round glasses. He talks, gestures and reacts.

Every card and character casts a dotted halftone shadow.

| # | Episode | Folder |
|---|---|---|
| 1 | Same 100 Dollars, Double the Money | `01-start-early` |
| 2 | Is Coffee Really Making You Broke | `02-latte` |
| 3 | Why You Never Have Money Left Over | `03-pay-yourself-first` |
| 4 | One Car Repair Away From Debt | `04-emergency-fund` |
| 5 | The Credit Card Trap | `05-minimum-payment` |
| 6 | The Simplest Budget Ever | `06-fifty-thirty-twenty` |
| 7 | Make It Once, Sell It Forever | `07-digital-products` |
| 8 | How YouTubers Actually Get Paid | `08-creators-paid` |
| 9 | When Will Your Money Double | `09-rule-of-72` |
| 10 | The 24 Hour Rule | `10-twenty-four-hours` |

Each episode folder holds the video, `captions.srt`, `thumbnail.jpg` and `script.json`. The first and last beat of every episode show a small "general info, not financial advice" line.

## Scripts

`scripts.py` writes every episode's `script.json`. Each beat has:

- the narration line
- the on-screen headline, where `*word*` becomes the orange accent
- a top label
- the presenter's `pose` and `face`
- one `prop`
- an optional value for the counter at the top right

**Poses:** idle, point, present, wave, shy, think, shrug, cheer, thumbs, facepalm, count.

**Faces:** smile, grin, happy, worried, wow, smug, sad, think.

**Props:** versus, timeline, stat, bank, chart, coins, tags, cup, receipt, split, phone, calendar, toggle, checklist, card, bars, yt, product, timer, chat. They're all defined in `engine/page.html`.

## How it's made

1. Set up the Kokoro voice once with `../tech-shorts/engine/setup_kokoro.sh DIR`.
2. Run `python3 scripts.py`.
3. Run `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR` for each episode.

`make.sh` voices the script with the shared `voice.py`. It then renders the frames with `engine/page.html` and `engine/render.cjs`, using Playwright and a 2D canvas, which takes about 2 minutes per episode. Finally it adds the narration and saves the video, captions and thumbnail.

For a still of one moment, run `node engine/render.cjs EPDIR WORKDIR out.jpg --still SECONDS`.

The fonts are Space Grotesk, Instrument Serif and JetBrains Mono. All three are under the SIL Open Font License, and their licence files are in `fonts/`.
