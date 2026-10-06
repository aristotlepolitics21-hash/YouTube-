# Built & Broken, Episode 3: Blockbuster

**Title:** Blockbuster Could Have Bought Netflix for $50 Million
**Thumbnail:** `blockbuster-thumbnail.jpg` (THEY LAUGHED.)
**Length:** about 5:46, 1920×1080, 46 scenes

## Render it

You need Python 3.10+, Node.js 18+ and FFmpeg. From the repo root:

```bash
git submodule update --init          # fetch OpenMontage if you haven't
cd OpenMontage && make setup && cd ..
python videos/tools/render_episode.py videos/built-and-broken-03-blockbuster
```

The video is written to `videos/built-and-broken-03-blockbuster/out/built-and-broken-03-blockbuster.mp4`.

## Files

| File | What it is |
| --- | --- |
| `scenes.json` | The episode: every scene's narration line and on-screen visual, chapter sections, colours and caption fixes. Edit this. |
| `narration.mp3` | AI narration (Piper, voice `en_US-ryan-high`), loudness-normalised. |
| `props.json` | Generated scene timings for Remotion. Don't edit by hand. |
| `captions.srt` | Closed captions to upload to YouTube. |
| `description.txt`, `tags.txt` | Upload text, with chapters and the fact list. |

## Changing the script

The build and render scripts are shared by every episode and live in `videos/tools/`.

Edit `scenes.json`, then rebuild the narration and timings:

```bash
cd OpenMontage
.venv/bin/python -m piper.download_voices --download-dir ~/.piper en_US-ryan-high
cd ..
OpenMontage/.venv/bin/python videos/tools/build_episode.py videos/built-and-broken-03-blockbuster --voice ~/.piper/en_US-ryan-high.onnx
```

If the chapter times in `chapters.txt` change, copy them into `description.txt`.
