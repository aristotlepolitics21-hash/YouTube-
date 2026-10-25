# Hero shots in three.js

The 15 hero shots from `../cgi-batch`, built as stylised game-CGI in three.js instead of an AI video generator.

| Shot | Length | What it shows |
|---|---|---|
| 001 | 6 s | Boy at the school gate as classmates walk in, push-in, head lowers |
| 003 | 6 s | Aerial pull-back over the dry village and cracked fields |
| 043 | 6 s | Library room, shelves and donated books, dust in the window light |
| 050 | 6 s | Textbook cover with a windmill, thumb at the edge |
| 058 | 6 s | Scrapyard at golden hour, boy turns to look it over |
| 060 | 6 s | Bicycle frame, tractor fan, PVC pipes, shock absorber and wire laid out one by one |
| 081 | 6 s | Tilt up the blue-gum tower above the house |
| 082 | 4 s | PVC blades on the fan hub give their first turn |
| 088 | 6 s | Finished windmill, boy beside it, villagers gathering |
| 091 | 4 s | The bulb flickers twice, then glows |
| 092 | 6 s | Windmill spinning fast as the boy raises the lit bulb |
| 094 | 6 s | Dusk, villagers crowd around the boy and the glowing bulb |
| 098 | 6 s | Night descent toward the one lit window |
| 118 | 6 s | From behind, the young man walks into the stage spotlight |
| 134 | 6 s | Sunset, the windmill turning behind the house |

## Re-rendering

`hero.js` needs three.js r160 (`three.min.js`) loaded first and exposes `window.HERO`. `render.cjs` drives it in headless Chromium with Playwright and pipes the frames to ffmpeg:

```
node render.cjs /path/to/hero_render.html /path/to/output-folder
```

`hero_render.html` is three.min.js and hero.js inlined into one page.
