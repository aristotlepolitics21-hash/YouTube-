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
pip install piper-tts   # plus a Piper voice, e.g. en_US-ryan-high.onnx from huggingface.co/rhasspy/piper-voices
python3 animator/render.py animator/episodes/pizza.json --voice en_US-ryan-high.onnx -o out/pizza.mp4
python3 animator/render.py animator/episodes/circle.json --stills out/stills   # quick per-scene PNGs
```

Episodes: `pizza.json` ($1 vs $1,000,000 Pizza), `circle.json` (Last To Leave The Circle Wins
$100,000), `burger_short.json` (vertical Short). Scene types are `hook`, `tier`, `circle`,
`counter`, `versus`, `winner` and `outro`.
