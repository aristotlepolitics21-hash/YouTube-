# Infamous

Ten-minute animated biographies of the people on the "Top 50 Most Hated People in History" list
that was circulating as an image. The list's own source line ("Historical Rankings / Global Public
Perception") is not a real dataset, so the series does not present the order as a ranking. Each
film explains who the person was, what they did, and why they are remembered the way they are.

Same visual language as Historic Disasters: ink stickmen on aged paper, one red accent, dark night
palettes for the worst moments. Nothing graphic is drawn. Narration is the Kokoro "George" voice.

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

The drawing engine is shared with Historic Disasters (`../historic-disasters/engine/stickdoc.js`
and `sets.js`); `engine/bio.js` adds the biography scenes listed in `engine/SCENES.md`.

- `engine/voice.py SCRIPT OUTDIR` voices each line with Kokoro and writes timings, captions and chapters.
- `engine/render_ep.sh OUTDIR SCRIPT NAME` builds the page, renders three segments in parallel with Playwright and muxes the narration.
- `engine/package.py EPDIR OUTDIR` makes the thumbnail, description and tags and copies the render in.
- `engine/queue.sh` does all three for every episode that has a script but no video yet.
- `engine/fmt.py SCRIPT` normalises a script's layout and prints its word count.

`$WORK` must contain `voices/kokoro-q8.onnx` (from the `kokoro-q8-shards` npm package),
`voices/voices-v1.0.bin` (the `kokoro-js` voice files packed as an `.npz`), `fonts/Anton.ttf` and a
`tts` virtualenv with `kokoro-onnx` and `soundfile`.
