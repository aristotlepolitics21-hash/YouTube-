# Car Mechanic 101

Ten vertical shorts (1080×1920), about 45–55 seconds each, explaining how cars work. A mechanic presenter walks through each system using animated cutaway diagrams. The look is the flat halftone style of `../money-shorts`, with the presenter in a red beanie and navy work jacket.

| # | Episode | Folder | Main diagram |
|---|---|---|---|
| 1 | How a Car Engine Works | `01-engine` | 4-stroke cylinder: valves, piston, rod and crank |
| 2 | What's Actually Inside a Car | `02-anatomy` | Top-view car map with each system highlighted |
| 3 | Why Your Car Needs Gears | `03-gearbox` | Meshing gear ratios, clutch |
| 4 | How One Foot Stops Two Tonnes | `04-brakes` | Pedal, hydraulic line, caliper and disc |
| 5 | Why Your Car Does Not Bounce | `05-suspension` | Wheel over a bump: spring only vs spring + damper |
| 6 | How a Turbo Makes Free Power | `06-turbo` | Turbine and compressor with gas flow |
| 7 | Why Your Wheels Spin at Different Speeds | `07-differential` | Inner and outer wheel paths, diff gearset |
| 8 | How Your Car Is Built to Crash | `08-structure` | Ladder frame, monocoque, crumple zone and safety cage |
| 9 | Why Your Engine Does Not Melt | `09-cooling` | Pump, radiator, fan and thermostat loop |
| 10 | How an Electric Car Works | `10-electric` | Battery, inverter and motor, plus regenerative braking |

Each episode folder holds the video, `captions.srt`, `thumbnail.jpg` and `script.json`.

## How it's made

- `engine/` is a copy of the money-shorts engine with two changes:
  - the presenter's look (`look`) and the small note line (`note`) are set per series;
  - `engine/diagrams.js` adds the animated car diagrams (`engine4`, `carmap`, `gears`, `clutch`, `brake`, `suspension`, `turbo`, `diff`, `chassis`, `cooling`, `ev`).
- `scripts.py` writes every `script.json`.

To render an episode, run `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR`. It voices the script, renders the frames, adds the narration, and saves the video, captions and thumbnail.
