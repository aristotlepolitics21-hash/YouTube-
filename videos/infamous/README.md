# Infamous

Ten-minute animated biographies of the people on the "Top 50 Most Hated People in History" list
that was circulating as an image. The list's own source line ("Historical Rankings / Global Public
Perception") is not a real dataset, so the series does not present the order as a ranking. Each
film explains who the person was, what they did, and why they are remembered the way they are.

Characters are 3D articulated wooden mannequins (mannequin.js on three.js): uniforms, hats, hair,
beards, glasses and medals mark who is who, and sets are built per scene (rallies, marching armies,
camps, cells, courts, cities, fleets, horse archers). Dates, numbers, documents and newspapers stay
as the aged-paper cards from Historic Disasters, with one red accent. Nothing graphic is shown.
Narration is the Kokoro "George" voice.

Folder numbers follow the original graphic. Number 35 on it was Jesse Marsch, a living football
coach who doesn't belong on a list of dictators, terrorists and murderers, so there is no
episode 35.

| # | Episode | # | Episode |
|---|---|---|---|
| 01 | Adolf Hitler | 26 | Reinhard Heydrich |
| 02 | Joseph Stalin | 27 | Abu Bakr al-Baghdadi |
| 03 | Pol Pot | 28 | Abu Musab al-Zarqawi |
| 04 | Leopold II of Belgium | 29 | Joseph Kony |
| 05 | Mao Zedong | 30 | Pablo Escobar |
| 06 | Benito Mussolini | 31 | Joaquín "El Chapo" Guzmán |
| 07 | Heinrich Himmler | 32 | Charles Manson |
| 08 | Osama bin Laden | 33 | Ted Bundy |
| 09 | Saddam Hussein | 34 | Jeffrey Dahmer |
| 10 | Idi Amin | 36 | Vlad the Impaler |
| 11 | Joseph Goebbels | 37 | Nero |
| 12 | Kim Jong-un | 38 | Caligula |
| 13 | Kim Jong-il | 39 | Maximilien Robespierre |
| 14 | Slobodan Milošević | 40 | Attila the Hun |
| 15 | Mengistu Haile Mariam | 41 | Hirohito |
| 16 | Hideki Tojo | 42 | Mobutu Sese Seko |
| 17 | Ratko Mladić | 43 | Grigori Rasputin |
| 18 | Augusto Pinochet | 44 | Christopher Columbus |
| 19 | Robert Mugabe | 45 | Hernán Cortés |
| 20 | Muammar Gaddafi | 46 | King John of England |
| 21 | Bashar al-Assad | 47 | Henry VIII |
| 22 | Fidel Castro | 48 | Reinhard Gehlen |
| 23 | Enver Hoxha | 49 | Edward "Blackbeard" Teach |
| 24 | Francisco Franco | 50 | Genghis Khan |
| 25 | Lavrentiy Beria | | |

Each episode folder holds `script.json` (narration, one visual per line, plus the packaging
block), the rendered `infamous-NN-slug.mp4`, `captions.srt`, `chapters.txt`, `description.txt`,
`tags.txt` and `thumbnail.jpg`.

## Engine

`engine3d/` renders the character scenes: `r3.js` (renderer, mannequin factory, looks, poses) and
`sets3d.js` (one builder per scene). `bio3d.js` hands those scenes to the 3D renderer from inside the
2D engine (`../historic-disasters/engine/stickdoc.js` + `sets.js` + `engine/bio.js`), which still draws
the paper cards and all captions. `engine/SCENES.md` lists every scene and its params.

- `engine/voice.py SCRIPT OUTDIR` voices each line with Kokoro and writes timings, captions and chapters.
- `engine3d/render_ep.sh OUTDIR SCRIPT NAME` builds the page, renders three 24 fps segments in parallel in headless Chromium (software WebGL) and muxes the narration.
- `engine3d/sheet.cjs PAGE OUT.png` renders a QA contact sheet, one frame per line.
- `engine/package.py EPDIR OUTDIR` makes the thumbnail, description and tags and copies the render in.
- `engine/queue.sh` does all of it for every episode listed in `$WORK/approved.txt` whose video is missing or older than its script.
- `engine/fmt.py SCRIPT` normalises a script's layout and prints its word count.

Run `npm install` in `engine3d/` first. `$WORK` must contain `voices/kokoro-q8.onnx` (from the
`kokoro-q8-shards` npm package), `voices/voices-v1.0.bin` (the `kokoro-js` voice files packed as an
`.npz`), `fonts/Anton.ttf` and a `tts` virtualenv with `kokoro-onnx` and `soundfile`.

mannequin.js is GPL-3.0; it is installed from npm at build time and not vendored here.
