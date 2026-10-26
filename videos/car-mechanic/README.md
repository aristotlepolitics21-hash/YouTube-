# Car Mechanic 101

Twenty vertical shorts (1080×1920), about 45–55 seconds each, explaining how cars work. A mechanic presenter walks through each system using animated cutaway diagrams. The look is the flat halftone style of `../money-shorts`, with the presenter in a red beanie and navy work jacket.

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
| 11 | How a Spark Plug Lights Your Engine | `11-spark-plugs` | Battery → coil → plug, with the spark gap (healthy vs worn) |
| 12 | How Your Car Mixes Fuel and Air | `12-fuel-injection` | Injector spray, ECU and sensors, 14.7:1 mix |
| 13 | How Your Car Starts and Charges | `13-charging` | Starter motor, then the belt-driven alternator recharging the battery |
| 14 | How Your Steering Wheel Turns the Wheels | `14-steering` | Rack and pinion, tie rods, electric assist |
| 15 | What the Numbers on Your Tyres Mean | `15-tyre-codes` | Sidewall code 205/55 R16 91V, DOT date code, tread depth |
| 16 | When Should You Really Change Your Oil | `16-oil` | Oil pump circuit, clean vs dirty oil, dipstick |
| 17 | What Your Dashboard Lights Mean | `17-warning-lights` | Red, amber and green/blue warning lights |
| 18 | Diesel vs Petrol Engines | `18-diesel-vs-petrol` | Diesel cylinder: heat from compression ignites the fuel |
| 19 | Hybrid vs Plug-In vs Electric | `19-hybrid-vs-electric` | Power-flow modes: electric only, engine charging, regen, plug-in |
| 20 | The Belt That Can Destroy Your Engine | `20-timing-belt` | Crank and cam pulleys at a 2:1 ratio, valve timing, snapped belt |

Each episode folder holds the video, `captions.srt`, `thumbnail.jpg` and `script.json`.

## How it's made

- `engine/` is a copy of the money-shorts engine with two changes:
  - the presenter's look (`look`) and the small note line (`note`) are set per series;
  - `engine/diagrams.js` adds the animated car diagrams (`engine4`, `carmap`, `gears`, `clutch`, `brake`, `suspension`, `turbo`, `diff`, `chassis`, `cooling`, `ev`).
  - `engine/diagrams2.js` adds the batch 2 diagrams (`spark`, `injector`, `charging`, `rack`, `tyre`, `tread`, `oilsys`, `dash`, `hybrid`, `timing`), and `engine4` gains a `diesel` mode.
- `scripts.py` writes every `script.json`.

To render an episode, run `KOKORO_DIR=DIR ./make.sh NN-slug WORKDIR`. It voices the script, renders the frames, adds the narration, and saves the video, captions and thumbnail.
