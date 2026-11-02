# Riddle Shorts

Ten escape-room style riddle shorts (1080×1920, about 40–50 seconds each) with an English voiceover. Each one runs:

1. The setup.
2. The question card with a 10-second hourglass countdown and silent thinking time.
3. A green ANSWER card with the explanation.
4. "Follow for a new riddle every day!"

| # | Riddle | Scene | Answer |
|---|---|---|---|
| 1 | Two Guards, Two Doors | Dungeon | Ask which door the *other* guard would say is freedom, then take the opposite door |
| 2 | Three Deadly Doors | Castle hall | The lions: after 3 years without food they're dead |
| 3 | The Glass or the Dragon | Stone room | Wait until night; the magnifying glass can't burn without sun |
| 4 | The Mirror and the Table | Room | See → saw → cut the table → two halves make a whole → climb out (pun) |
| 5 | The Coconut Tree Race | Jungle | Nobody: coconut trees don't grow bananas |
| 6 | Wolf, Goat and Cabbage | River | Goat over; wolf over, goat back; cabbage over; goat over |
| 7 | The Bridge and the Torch | Night bridge | 1+2 (2), 1 back (3), 5+10 (13), 2 back (15), 1+2 (17) |
| 8 | The King's 8 Gold Balls | Treasury | Weigh 3 vs 3, then 1 vs 1 (or the last 2) |
| 9 | Two Fathers, Two Sons | Lake | Only 3 people: grandfather, father, son |
| 10 | The Race Riddle | Race track | Second place |

Each episode folder holds the video, `captions.srt`, `thumbnail.jpg` (the question card, so the thumbnail asks the riddle) and `script.json`.

## How it's made

- `scripts.py` holds the riddles and writes each `script.json`. A line is a speaker, a beat, the spoken text and the caption. A beat holds:
  - the scene and cast, with poses, expressions and props;
  - `ask` and `timer` for the question card and countdown;
  - `pause` for the silent thinking time;
  - `reveal` and `answer` for the answer cards;
  - `state` for scene switches such as a door opening, nightfall or the table cut in half.
- `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR` does the rest:
  - voices the episode (narrator am_michael, the king bm_lewis);
  - renders it with `engine/page.html` in 3 parallel segments;
  - adds the audio and grabs the thumbnail.
- `engine/page.html` loads the shared 2D toon engine (`../business-ideas/engine/toon.js`, the character rig from the Business Ideas and Comedy series) and `engine/riddle.js`. `riddle.js` sets thinner outlines and adds:
  - **Scenes:** a dungeon with one or two doors, a three-door hall, a sun room, a pun room, a jungle, a river, a night bridge, a treasury, a lake and a race track.
  - **Animals:** monkey, squirrel, bird, wolf, goat, lion and dragon.
  - **Props:** magnifying glass with a sunbeam, mirror, table, saw, boat, balance scale, gold balls and fish.
  - **Overlay:** the hourglass timer, captions, the question card and the answer card.
