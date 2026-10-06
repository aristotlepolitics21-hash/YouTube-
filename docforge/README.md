# DocForge

A modular, resumable pipeline that turns a topic into a 10–60 minute documentary
for YouTube: research → script → scene breakdown → assets → voiceover →
subtitles → editing → quality control → final render, plus thumbnail,
title options, description with chapters, tags and Shorts.

The documentary is never one giant prompt. It is split into scenes of a few
seconds; each scene has its own narration, visual spec, prompt, assets, audio,
timing and clip, all tracked in `manifest.json`, so any scene can be inspected,
fixed and re-rendered on its own.

## What works offline, what needs an API, what is manual

| Stage | Free / offline (tested here) | Paid / external (not tested here: no keys) |
|---|---|---|
| Research | **manual**: you supply `research/research.json` | Claude + web search (`ANTHROPIC_API_KEY`) |
| Script | **manual**: `script/script.json` | Claude |
| Scene breakdown | **manual**: `scenes/scene_plan.json`; pacing, prompts and checks are automatic | Claude, section by section |
| Assets | Openverse (CC Flickr etc.), Library of Congress, NASA, Wikimedia*, local files, animated maps/charts/timelines | fal.ai images and image-to-video (`FAL_KEY`) |
| Voiceover | Piper neural TTS | ElevenLabs (`ELEVENLABS_API_KEY`) |
| Subtitles | faster-whisper alignment + narration check | — |
| Music / SFX | your licensed library, or a synthesized ambient pad (placeholder) | — |
| Editing, QC, render, Shorts | FFmpeg | — |

\* Wikimedia rate-limits many shared cloud IPs; DocForge detects the 429 and skips
that host for the rest of the run.

"Manual" means a person or another AI writes the file in the documented format
(`docs/formats.md`). Nothing in DocForge fakes an API response: without
credentials the Claude stages stop with a clear message.

## Install

Requirements: Python 3.10+, FFmpeg (with libx264 and libass), ~2 GB disk for models.

```bash
cd docforge
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install -e .            # adds the `docforge` command
pytest -q                   # 42 tests, offline, ~15 s
```

The first run downloads the Piper voice (~120 MB) and Whisper `base.en` (~150 MB)
and the Natural Earth country outlines (~13 MB) into `~/.cache`.

## API keys (all optional)

| Variable | Used for |
|---|---|
| `ANTHROPIC_API_KEY` (or `ant auth login`) | research, script, scene breakdown with `llm.provider: claude` |
| `FAL_KEY` | `ai_image` / `ai_video` scenes with `assets.ai_image_provider` / `ai_video_provider: fal` |
| `ELEVENLABS_API_KEY` | `voiceover.provider: elevenlabs` (+ `voiceover.elevenlabs.voice_id`) |

## Configuration

`config/default.yaml` holds every setting with comments. Each project has its own
`config.yaml`, deep-merged on top, so it only lists what it changes:

```yaml
project:
  topic: "Singapore: How a Tiny Country Became Rich Without Natural Resources"
  target_minutes: 20
llm:
  provider: claude
voiceover:
  piper_voice: en_US-lessac-high
  pronunciations: {"Lee Kuan Yew": "Lee Kwan Yoo"}
editor:
  music: {library_dir: ~/music/licensed}
cost:
  limit_usd: 10
```

Length scales automatically: words ≈ minutes × `words_per_minute` × 0.92, scenes ≈
minutes × 60 / `target_scene_seconds` (20 min → ~2,760 words, ~200 scenes).
`docforge plan <project>` prints the numbers and the cost estimate.

## Start a project

```bash
docforge new "Singapore: How a Tiny Country Became Rich Without Natural Resources" --minutes 20 --llm claude
docforge plan projects/singapore-how-a-tiny-country-became-rich-without-natural-res
docforge run  projects/singapore-...
```

Or use the web interface: `docforge ui` → http://localhost:8765 (topic, length,
style, language, voice, video model, aspect ratio, resolution; live progress per
stage; approve costs; open outputs).

Project folders: `research/ script/ scenes/ prompts/ images/ video_clips/
voiceover/ music/ sfx/ subtitles/ renders/ final/ logs/` plus `manifest.json`.

## Generate scenes

`docforge run <project> --stage scenes` turns the script into scenes (Claude) or
validates your `scenes/scene_plan.json`, then:

- assigns `scene_001…`, checks the scenes reproduce the script,
- paces: photo scenes longer than `max_scene_seconds` get extra shots; runs of
  the same visual kind and over-used searches are flagged (`scenes/pacing.txt`),
- writes a production prompt per scene (`prompts/scene_NNN.txt`) with the style
  bible, period guards and negative prompt,
- writes the human-readable breakdown `scenes/scenes.md`.

## Generate assets

`docforge run <project> --stage assets`. Photos are scored for relevance (query
words in title/tags), resolution, shape and period (a 2015 photo for a 1965 scene
is penalised), de-duplicated by perceptual hash, and recorded with licence,
credit and source page. Graphics render a preview, which also validates their
data. `final/credits.txt` is rebuilt every run.

Before money is spent (Claude, fal, ElevenLabs) the stage's estimate is compared
with `cost.limit_usd`; above it the run stops and asks (CLI prompt, `--yes`, or
the UI button).

## Render the final video

`docforge run <project>` continues through voiceover, subtitles, editing, QC and
render. Outputs in `final/`:

- `<slug>_1080p.mp4` (and `<slug>_2160p.mp4` if `project.render_4k`; this is an
  upscale, not native 4K)
- `<slug>.srt`, `thumbnail.jpg`, `youtube.md` (title options, description with
  chapters and sources, tags), `credits.txt`
- `shorts/short_N.mp4` (vertical, burned-in captions)
- `qc_report.md` (the checklist below)

QC runs before the final render: missing scenes/assets, order, audio gaps,
narration mismatch (Whisper vs script), repetition, visual continuity and
historical detail (heuristics, flagged for review), durations, subtitle sync,
clipping, black frames, corrupt files. Mechanical problems are fixed
automatically (re-fetch, re-render, re-mix) and re-checked; errors that remain
stop the render.

## Resume an interrupted project

Run the same command again. Finished stages are skipped and, inside a stage,
finished scenes are skipped. Other tools:

```bash
docforge status <project>              # per-stage state and failed scene counts
docforge retry  <project>              # redo only failed scenes, then what depends on them
docforge reset  <project> --from editing   # re-run from a stage (scene results kept)
```

A failed scene never stops the others: fix its query or file in
`scenes/scene_plan.json`, re-run `scenes` (unchanged scenes keep their work) and
`retry`.

## Modules

```
docforge/
  research/         Stage 1   research.json (+ research.md)
  script/           Stage 2   script.json, checks
  scene_generator/  Stage 3-4 scenes, pacing, prompts
  asset_manager/    Stage 5   providers, scoring, graphics, maps, fal
  voiceover/        Stage 6   TTS, timeline, narration track
  subtitles/        Stage 7   alignment, SRT, narration check
  editor/           Stage 8   clips, assembly, music, SFX, mix
  quality_control/  Stage 9   checks, autofix, report
  renderer/         Stage 10  final video, 4K, thumbnail, kit, Shorts
  pipeline.py cli.py ui/ project.py config.py cost.py llm.py
```

Each module has tests in `tests/` and can be run alone with `--stage`.
