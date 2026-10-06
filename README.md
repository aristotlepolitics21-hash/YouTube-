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
