# Shorts shot plans

Each Short has a plan, `plans/NN-slug.json`, that turns its script's 16 shots into things the engine can
render. Voiceover and on-screen text come from the script (`NN-slug.md`); the plan only says what to show.

```json
{
  "id": "01-hitler",
  "say": {"Mein Kampf": "Mine Kampf"},
  "scenes": [
    {"text": "THEY HANDED HIM THE KEYS.", "red": ["KEYS"], "shots": [
      {"d": 2, "scene": "room", "fx": ["punch"], "p": {"props": ["desk"], "light": "bulb", "fig": {"look": {"coat": "military"}, "pose": "desk"}}},
      ...four shots whose "d" add up to exactly 15
    ]},
    ...four scenes
  ]
}
```

- `text` is the scene's on-screen text, copied exactly from the script. `red` lists the words drawn in red
  (numbers are always red). `say` gives pronunciations for names the voice may mangle.
- `d` is the shot length in seconds (whole or half seconds), taken from the script's timings.
- `fx` lists the script's edit tags in lower case: `punch`, `flash`, `glitch`, `freeze`, `smash`, `shake`,
  `ramp` (`[J]` is audio only; leave it out). `freeze` takes `"circle": [x, y]`, where the red circle
  goes (0–1 of the frame; a face filmed with `cam: "face"` sits near `[0.5, 0.42]`).

## Scenes

**`room`**: the horror room, for empty objects, lone figures and dying lights. Params:

| param | values |
|---|---|
| `light` | `bulb` (warm hanging bulb), `red`, `cold` (moonlit window), `dark` |
| `swing`, `flicker` | 1 to swing the bulb / make the light flicker |
| `dies` | 0–1: when in the shot the light goes out |
| `props` | any of `desk` (with a document; `stamp: 1` adds a red stamp), `radio`, `typewriter`, `phone`, `chairs:N`, `coats:N` (on hooks), `shoes:N`, `suitcases:N`, `bed`, `door` (`door: "open"` or `"close"`), `mirror`, `portrait` (eyes follow), `bars`, `candles`, `swing` (empty swing), `window` |
| `deep` | 1 for a long corridor (use with `shoes:120` and `cam: "track"`; ceiling lamps die one by one) |
| `shadows` | N figure shadows that slide across the wall |
| `fig` | one mannequin: `look` (same keys as `bust`: hair, stache, beard, hat, glasses, coat, medals, sash…), `pose` (`stand`, `sit`, `desk`, `sitSlump`, `speech`, `headDown`, `mourn`, `point`, `up`, `lean`), `at` `[x, z]`, `yaw` (degrees; 180 = back to camera), `turnTo: 1` (head and body turn slowly round to face camera) |
| `cam` | `push` (default), `face` (close on the figure's face), `still`, `dolly`, `rise` (top-down rise), `low`, `down`, `track` |
| `wall`, `floor` | colours |

**3D sets** (see `../engine/SCENES.md` for params): `bust`, `podium`, `army`, `camp`, `wall`, `cell`,
`bunker`, `throne`, `ruler`, `city`, `field`, `fleet`, `riders`, `jungle`, `people`, `inquiry`, `versus`.

**Paper cards** (2D, shown as a framed insert): `paper` (newspaper), `decree` (document), `stat`
(big number), `date`, `quote`, `timeline`, `checklist`, `chart`, `bars`, `ballot`, `counter`, `lesson`.

## Choosing

Match each scripted shot to the closest scene, and keep the script's edits. Use `room` for anything
built from empty objects, a single figure, a face turning, a bulb or a door. Use the 3D sets for crowds,
armies, cities, ships and riders. Use cards for headlines, signed documents, dates and numbers. Nothing
graphic: no figure is shown being harmed.
