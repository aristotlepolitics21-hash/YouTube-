# Stories from the Insula

These are short, emotional stories set in the Roman apartment-block scene. Each one runs about 60–90
seconds as a vertical reel and only uses sets the scene already has: the bakery, the upstairs room and
the stair.

| # | Title | Status |
|---|---|---|
| 1 | The Loaf on the Stairs | Fully produced: `01-the-loaf-on-the-stairs/` |
| 2 | The Water Carrier | Produced: `02-the-water-carrier/` |
| 3 | The Lamp in the Window | Produced: `03-the-lamp-in-the-window/` |
| 4 | The Golden Crack (Kyoto, 1820) | Produced: `04-the-golden-crack/`, set `edo` |
| 5 | The Painter's Hands (Thebes, 1200 BC) | Produced: `05-the-painters-hands/`, set `egypt` |

## How an episode is made

```bash
export KOKORO_DIR=/path/to/kokoro       # ../../tech-shorts/engine/setup_kokoro.sh installs it
python3 narrate.py 01-the-loaf-on-the-stairs             # voice + timeline (shot lengths)
python3 make_music.py 01-the-loaf-on-the-stairs          # original score that follows the shots
python story_render.py -- 01-the-loaf-on-the-stairs --stills          # 3 check frames per shot
python story_render.py -- 01-the-loaf-on-the-stairs --res 720         # all frames, resumable
python3 assemble.py 01-the-loaf-on-the-stairs out.mp4                 # grade, captions, mix
```

## New places

The house is the same cutaway in every story, re-dressed per place by `sets.py`: a theme swaps the
materials (walls, timber, floors, street) and furnishes both floors. `shots.py` picks it with
`SET = "edo"` (Kyoto potter's townhouse) or `SET = "egypt"` (tomb-builders' village); no `SET` means
the Roman insula. Costumes for other places live in `acting.py`: `hair()` (topknot, bun, Egyptian wigs),
`long_skirt()`, `sash()`, `wide_sleeves()`, `broad_collar()`, and the kneeling pose `kneel()`.
Painted textures are drawn by `make_assets.py` into `assets/`. A story can add `"pronounce"` to respell
a name for the voice only, and `"subtitle"` / `"end_card"` for its title and closing text.

To stage a new story, add one function per shot id in `story_render.py` (cast, poses, camera)
and add an entry to `PLAN` in `make_music.py`. The voice decides how long each shot runs.

---

## 2 · The Water Carrier

*The stair shot: a figure climbing with an amphora on their shoulder.*

1. **Stairs, dawn.** Ninety-one steps. That's how many Tullia climbed every morning, with a jar of water on her shoulder.
2. **Stairs, close.** It was heavy, and the fountain was three streets away. But the widow on the top floor couldn't walk any more.
3. **Room.** The widow, Julia, never thanked her. She only ever said, "You're late." Every single day.
4. **Room, night.** One winter, Julia died. The landlord handed Tullia a small cloth bundle. "She said this was yours."
5. **Room, close.** Inside were coins. Years of them. And a scrap of pottery, scratched with one line:
6. **Black, text only.** "You're late, so I knew you'd come."
7. **Stairs, empty, sunbeam.** Some people can't say thank you. So they say it the only way they know.

## 3 · The Lamp in the Window

*The upstairs room at night, with the oil lamp and the window.*

1. **Room, night.** Every night for six years, a mother lit a lamp in the same window.
2. **Window, close.** Her son had gone with the legions to the far north. Rome told her nothing.
3. **Bakery, dawn.** The neighbours whispered that she was wasting oil. The baker kept giving her a little extra.
4. **Room, night, lamp sputtering.** One night the oil ran out, and she cried. She thought it was a sign.
5. **Street, night.** But down in the dark street, a tired soldier looked up at the only dark window in the building.
6. **Stairs, climbing.** He knew which one it was. He'd been watching for that light for three hundred miles.
7. **Room, the door.** "Mother," he said. "You can let it go out now. I'm home."
