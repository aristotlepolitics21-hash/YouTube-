# Infamous scene catalogue

A script line is `[scene, params, narration]`. Scenes with people (portraits, places and events) are
rendered in 3D with wooden mannequins by `engine3d/`; documents and data are aged-paper cards with one
red accent. Both draw on a 1280×720 canvas. Coordinates in params are 0–1 fractions of
the frame. Night scenes (`night: 1`) fade through black instead of paper.

## Portraits

`bust` — framed head-and-shoulders likeness, with name, years and a one-line role beside it.

| param | values |
|---|---|
| `name`, `years`, `role` | text (role wraps; keep it under ~90 characters) |
| `hair` | `side` (side-parted fringe), `full`, `back` (slicked back), `crop`, `long`, `wild`, `curly`, `bald`, `wig` (powdered 18th-century) |
| `stache` | `brush` (toothbrush), `big` (walrus), `thin` |
| `beard` | `full`, `long`, `goatee`, `stubble` |
| `hat` | `peak` (military cap; `band` colour), `cap` (baseball), `beret`, `crown`, `turban`, `helmet` (`spike: 1` for a spiked helmet), `tricorn`, `bicorne`, `pirate`, `tudor`, `fur` (steppe hat), `laurel` (Roman wreath), `wrap` (head scarf, `hatc`), `leopard` (leopard-skin toque), `kufi` |
| `coat` | `military`, `khaki`, `suit` (`tie` colour, `tie: 0` for none), `black`, `mao`, `robe`, `fur`, `tunic`, `shirt`, `armour` |
| extras | `glasses` (`square`, `round`, `dark`), `medals` (count), `sash` (colour), `scarf` (colour), `frown: 1`, `round: 1` (round face), `hairc` / `beardc` (colour, e.g. `#9a9a92` for grey) |

`versus` — two standing figures facing each other: `left`, `right`, `mid` (e.g. "VS"), `red: "r"` to colour the right one red.

`ruler` — one large standing figure: `hat` (`crown`/`peak`), `cape: 1`, `pose` (`point`/`up`), `guards` (count), `label`, `night`.

## Places and events

| scene | what it shows | params |
|---|---|---|
| `podium` | speaker at a lectern above a crowd, banners, spotlights | `cheer`, `banners` (count), `bannerc`, `night: 0` for daylight, `label` |
| `army` | soldiers marching (`era`: `ancient`, `steppe`, `medieval` for spears and shields; `musket` for 1790s line infantry) | `era`, `tanks`, `planes`, `fire`, `ruins`, `rows`, `dir: -1`, `night`, `label` |
| `camp` | huts, watchtower, barbed wire, prisoners | `snow` (gulag), `n`, `night: 0` for daylight, `label` |
| `wall` | people against a wall, armed soldiers in silhouette (purges, executions; nothing graphic) | `n`, `night`, `label` |
| `cell` | prison cell, seated prisoner | `pose: "stand"`, `bars: 0`, `night: 0`, `label` |
| `bunker` | concrete room, one bulb, figures at a table | `n` (figures), `label` |
| `throne` | royal hall, ruler on throne, courtiers bowing | `crown: 0`, `night`, `label` |
| `city` | skyline | `state` (`normal`/`fire`/`ruin`), `towers` (two smoking towers), `planes`, `tanks`, `night`, `seed`, `label` |
| `field` | farmland and workers | `famine` (barren), `guard`, `village`, `n`, `label` |
| `fleet` | sailing ships at sea | `n`, `pirate`, `cannon`, `land` (palm coast), `night`, `label` |
| `riders` | horse archers galloping across a steppe | `n`, `bow: 0`, `flip`, `label` |
| `jungle` | palms, armed men | `n`, `night`, `label` |
| `people` | a row of ordinary people | `n`, `pose` (`walk`/`mourn`/`up`/`look`), `red` (first n in red), `night`, `label` |
| `inquiry` | tribunal or court | `label` |
| `memorial` | candle points of light | `n`, `date` (caption) |

## Documents and data

| scene | params |
|---|---|
| `title` | `title`, `sub`, `art` (any scene name drawn darkened behind), `artp` (its params) |
| `date` | `date`, `place` |
| `paper` | newspaper front page: `mast`, `head`, `sub`, `date` |
| `decree` | parchment document: `title`, `lines` (≤ 5 short strings), `date`, `seal: 0` |
| `tv` | old television broadcast: `text` (caption above), `speaker: 0` |
| `ballot` | ballot box: `value` (big red text), `label` |
| `web` | org chart / network: `nodes` `[[name, x, y, red]]`, `links` `[[i, j]]`, `label` |
| `timeline` | `events` `[[label, at]]` with `at` 0–1 |
| `stat` | `value`, `label` |
| `counter` | counts up envelopes: `n` (≤ 6), `label` |
| `icons` | grid of figures, some red: `total`, `per`, `red`, `cols`, `label` |
| `bars` | `items` `[[label, value, unit]]` (2–3 items), `max`, `red: 1` colours the last bar |
| `chart` | line chart: `points` `[[x, y]]` in 0–1, `notes` `[[x, y, text]]`, `title`, `x`, `y` |
| `quote` | `text`, `who` |
| `checklist` | `head`, `items` (≤ 4) |
| `lesson` | `text` (one short line, on paper) |

Avoid `map` (it draws a North Atlantic coastline by default) and the Historic Disasters scenes
(`ship`, `reactor`, `shuttle`, …) unless they really fit.
