# Why Shorts

30-second vertical explainers that answer one everyday "why" in one breath, reverse engineered from a
zackdfilms short ("why your cat sits on your keyboard"). They run on the Tech Shorts 3D engine with
`"style": "story"` (see `../tech-shorts/README.md`).

| # | Episode | Status |
|---|---|---|
| 1 | Why Your Phone Dies in the Cold | Rendered (3D, Kokoro `am_michael`) |

## The formula

The reference video is 29 seconds, 85 words (about 180 words a minute), with a new shot every 1.5–3 seconds.

| Beat | Reference line | Job |
|---|---|---|
| Relatable hook | "You know when your cat climbs onto your keyboard" | A moment the viewer has lived |
| Contradiction | "even though it has a soft bed nearby?" | Makes the behaviour feel irrational |
| Twist | "Well the reason for this might actually be your fault." | Promises a surprise, puts the viewer in the story |
| Mechanism | "You see, every time you type, your hands leave traces of your scent across the keys." | The real cause, shown on screen |
| Invisible made visible | "And while you can't smell it, your cat can." | The thing you can't sense becomes a visual (yellow scent smoke) |
| Consequence | "So when it rubs across the places your hands touched, it leaves some of its own scent behind." | Cause leads to effect |
| Payoff | "And this could be its way of claiming the laptop as part of its territory." | A satisfying, slightly funny reframe; ends immediately, which helps it loop |

Craft notes:

- One clause per shot. Each line of `script.json` is one shot, so cuts land on the narration.
- Captions are white sentence-case chunks of one to three words, centred low, no HUD, no title card.
- The camera always drifts or pushes in. Close-ups and macro views alternate with wide shots.
- No intro and no call to action. The first frame is already the hook scene.
- The visual star is something normally invisible (scent there, ions and thick electrolyte here).

## Episode folders

Each holds `script.json` (one shot per line; `"gap"` sets the pause between lines), the render,
`captions.srt`, `description.txt`, `tags.txt` and `thumbnail.jpg`.

```
cd ../tech-shorts/engine3d && npm install
KOKORO_DIR=DIR ./render.sh ../../why-shorts/01-cold-phone/script.json WORKDIR why-your-phone-dies-in-the-cold
./finalize.sh ../../why-shorts/01-cold-phone WORKDIR why-your-phone-dies-in-the-cold
```
