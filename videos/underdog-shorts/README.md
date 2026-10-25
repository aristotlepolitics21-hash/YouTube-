# Underdogs

Ten vertical shorts (1080×1920), each 40 to 55 seconds, telling true stories of people who failed, got rejected or lost everything before they made it.

The look is a code-drawn take on an editorial, graphic-novel style:

- Fine ink outlines, flat muted colours and paper grain.
- The scene sits in a 16:9 panel inside a black 9:16 frame, with the episode title above it.
- Narration appears as lowercase italic subtitles.

No AI images are used; every person, background and prop is drawn in code.

| # | Episode | Folder |
|---|---|---|
| 1 | The Man Who Failed 5,126 Times (James Dyson) | `01-dyson` |
| 2 | He Started Over in His Sixties (Harland Sanders) | `02-sanders` |
| 3 | He Lost Everything, Then Drew a Mouse (Walt Disney) | `03-disney` |
| 4 | Rejected 12 Times (J.K. Rowling) | `04-rowling` |
| 5 | From Fax Machines to Billionaire (Sara Blakely) | `05-blakely` |
| 6 | Rejected by Toyota, Then Ruined by an Earthquake (Soichiro Honda) | `06-honda` |
| 7 | Two Failed Shops Before Chocolate (Milton Hershey) | `07-hershey` |
| 8 | Three Air Mattresses and a Rent Problem (Airbnb) | `08-airbnb` |
| 9 | From Food Stamps to 19 Billion (Jan Koum, WhatsApp) | `09-whatsapp` |
| 10 | Two Failed Car Companies First (Henry Ford) | `10-ford` |

Each episode folder holds the video, `captions.srt`, `thumbnail.jpg` and `script.json`.

The characters are generic illustrations, not likenesses, and no brand logos are drawn.

## Scripts

`scripts.py` holds all 10 stories. Each line is a narration sentence plus a shot, and a shot has:

- **Background:** study, oldoffice, home, kitchen, workshop, office, street, diner, road, factory, cafe, train, cinema, shop, classroom, ruins, shed or studio.
- **Cast:** each person's pose, expression, head turn and an optional held prop. Smaller scales give full-body shots.
- **Props:** from `PR` in `engine/world.js`.
- **Overlays (optional):** a rubber `stamp`, such as "REJECTED", or a `counter`.

## Engine

- `engine/rig.js` draws the people. It covers faces with expressions and blinking; hair, facial hair and glasses; outfits; and arms posed with IK.
- `engine/world.js` draws the backgrounds and props.
- `engine/page.html` handles the camera moves, crossfades, grain, title, subtitles and progress line.
- `engine/render.cjs` renders the frames with Playwright. With `--still T`, it saves a single frame instead.

## How it's made

1. Set up the Kokoro voice once with `../tech-shorts/engine/setup_kokoro.sh DIR`.
2. Run `python3 scripts.py`.
3. Run `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR` for each episode.

`make.sh` voices the script, renders the episode in 3 parallel segments, adds the narration, and saves the video, captions and thumbnail.
