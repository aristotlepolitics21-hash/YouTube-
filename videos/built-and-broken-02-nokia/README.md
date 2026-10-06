# Built & Broken, Episode 2: Nokia

**Title:** Nokia Had 40% of All Phones. Six Years Later, It Quit
**Thumbnail:** `nokia-thumbnail.jpg` (40% of all phones, 2007 → 3.5% of smartphones, 2012)
**Length:** about 6:57, 1920×1080, 51 scenes

## Render it

You need Python 3.10+, Node.js 18+ and FFmpeg. From the repo root:

```bash
git submodule update --init          # fetch OpenMontage if you haven't
cd OpenMontage && make setup && cd ..
python videos/built-and-broken-02-nokia/render.py
```

The video is written to `videos/built-and-broken-02-nokia/out/nokia.mp4`.

## Files

| File | What it is |
| --- | --- |
| `scenes.json` | The episode: every scene's narration line and on-screen visual, with chapter sections. Edit this. |
| `build.py` | Regenerates `narration.mp3`, `props.json`, `nokia.srt` and `chapters.txt` from `scenes.json`. |
| `render.py` | Renders the MP4 with OpenMontage's Remotion `Explainer` composition. |
| `narration.mp3` | AI narration (Piper, voice `en_US-ryan-high`), loudness-normalised. |
| `props.json` | Generated scene timings for Remotion. Don't edit by hand. |
| `nokia.srt` | Closed captions to upload to YouTube. |
| `description.txt`, `tags.txt` | Upload text, with chapters and the fact list. |

## Changing the script

Edit `scenes.json`, then rebuild the narration and timings:

```bash
cd OpenMontage
.venv/bin/python -m piper.download_voices --download-dir ~/.piper en_US-ryan-high
cd ..
OpenMontage/.venv/bin/python videos/built-and-broken-02-nokia/build.py --voice ~/.piper/en_US-ryan-high.onnx
```

If the chapter times in `chapters.txt` change, copy them into `description.txt`.

To use a better voice (for example ElevenLabs), replace `narration.mp3` with your own recording of
the same lines. Timings in `props.json` follow the generated narration, so re-time the scenes if the
pacing differs a lot.
