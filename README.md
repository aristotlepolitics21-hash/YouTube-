# YouTube production toolkit

Claude Code skills for YouTube (`.claude/skills/yt-*`), plus standalone Python 3 tools with no
dependencies. `skills/` is a symlink to `.claude/skills/`, so run these from the repo root:

```sh
python3 skills/yt-script/hookscore.py --hook "one line"        # 5-property hook panel
python3 skills/yt-package/title.py --title "..." --thumb "..." # title + thumbnail linter
python3 skills/yt-edit/deadair.py transcript.srt               # edit decision list
python3 skills/yt-chapters/chapters.py transcript.srt          # validated chapters
python3 skills/yt-retention/retention.py retention.csv         # where they left, and why
python3 skills/yt-viral/swipe.py collected.json --min 2.0      # outliers by own-channel multiple
```

Transcripts can be `.srt`, `.vtt` or Whisper `.json`. Add `--json` to any tool for machine-readable
output; run one with no arguments to see its full usage.

## Animated videos in the MrBeast format

`beast-formula/README.md` breaks down the format from channel data. `animator/` renders episode
scripts (JSON) into finished MP4s with voiceover, captions, music, SFX and a thumbnail:

```sh
pip install piper-tts pycairo   # plus a Piper voice, e.g. en_US-ryan-high.onnx from huggingface.co/rhasspy/piper-voices
python3 animator/render.py animator/episodes/pizza.json --voice en_US-ryan-high.onnx -o out/pizza.mp4
python3 animator/render.py animator/episodes/circle.json --stills out/stills   # quick per-scene PNGs
```

Episodes: `pizza.json` ($1 vs $1,000,000 Pizza), `circle.json` (Last To Leave The Circle Wins
$100,000), `burger_short.json` (vertical Short). Scene types are `hook`, `tier`, `circle`,
`counter`, `versus`, `winner` and `outro`. Art is anti-aliased Cairo vector drawing (`animator/toon.py`):
characters with arms, legs, eyelids and lip-sync to the voiceover, detailed kitchen and field sets with
depth-of-field blur, whip-pan transitions, and scenes rendered in parallel.

## Title cards from code

`title-cards/` renders a silent title-card sequence frame by frame: Canvas2D in headless Chrome
(puppeteer), deterministic `window.renderFrame(t)`, encoded with ffmpeg. Edit `title-cards/tokens.js`
for lines, palette, font and timing.

```sh
cd title-cards && npm install
node render.mjs --stills   # one PNG per card in stills/
node render.mjs            # every frame in frames/
npm run encode             # out/title_cards.mp4
```

## Medical Body shorts: fast-cut 3D cutaways

`render3d/` renders 3D episodes with three.js in headless Chromium. `make_episode.py` adds a Piper
voiceover, word-by-word captions, whooshes and music, and encodes the MP4. The ten Medical Body
shorts (vertical, 30–40 s) use the shared anatomy kit `render3d/lib_body.js`: a head-and-neck
cutaway, chest and ear cutaways, a skin block with its layers, particles along a path, and pop-in
labels. The kit lets the edit cut every 1–2 seconds:

- A shot's `"cuts": [{"at": "word", "scene"?, "params"?}]` switches to a new clip when that word is
  spoken, so one sentence can span several camera angles. Leave out `"scene"` to re-frame the same
  scene: its params merge over the shot's, e.g. `az0/az1`, `dist0/dist1`, `tx0/ty0`.
- `"punch": 0.06` starts every clip slightly zoomed in. Each mid-sentence cut gets a quieter whoosh.
  `"max_clip"` warns about slow clips. `"sfx": [{"type": "pop", "word": "pop!"}]` puts a sound on a word.
- Frames are cached per clip and re-rendered only when its scene, params, size or episode code changes.

```sh
pip install piper-tts faster-whisper && (cd render3d && npm install)
python3 render3d/preview.py render3d/episodes/sneeze.json 0.6 --all   # storyboard: one frame per clip
python3 render3d/make_episode.py render3d/episodes/sneeze.json --voice voices/en_US-ryan-high.onnx \
    -o render3d/out/sneeze.mp4 --plan-only                            # timings + clip lengths only
python3 render3d/make_episode.py render3d/episodes/sneeze.json --voice voices/en_US-ryan-high.onnx \
    -o render3d/out/sneeze.mp4 --workers 3                            # full render
```

Episodes: `sneeze`, `battery`, `mosquito`, `hiccups`, `spicy`, `funnybone`, `bruise`, `floaters`,
`sunburn`, `earspop`. Titles, descriptions, tags and pinned comments are in
`render3d/publish/MEDICAL_BODY_SHORTS.md`, and storyboards are in `render3d/storyboards/`. To make a
new one, write `render3d/<topic>.js` (scenes built from `lib_body.js`, each taking camera params)
and `render3d/episodes/<topic>.json` (the script and its cuts). Then check the storyboard before
rendering.
