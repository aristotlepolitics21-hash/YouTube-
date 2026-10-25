# File formats

In `llm.provider: manual` mode you (or another tool, or an AI assistant) write
these files; in `claude` mode DocForge writes them. Either way they're validated
by the same schemas (`docforge/schemas.py`).

## research/research.json

```json
{
  "topic": "Singapore: How a Tiny Country Became Rich",
  "generated_by": "manual",
  "sections": [
    {"topic": "Geography", "facts": [
      {"claim": "Singapore's land area is about 735 km².", "status": "confirmed",
       "sources": ["https://www.singstat.gov.sg/..."]},
      {"claim": "Popular claim X.", "status": "uncertain", "note": "only one secondary source"}
    ]}
  ],
  "statistics": [{"name": "GDP per capita", "value": "US$84,734", "year": "2023",
                  "source": "https://data.worldbank.org/...", "status": "confirmed"}],
  "sources": [{"url": "https://...", "title": "..."}]
}
```

`status` is `confirmed` (backed by a cited source) or `uncertain`. Section topics
should match `research.topics` in the config; missing ones are reported.

## script/script.json

```json
{
  "topic": "...",
  "title_options": ["Five", "options", "under", "sixty", "characters"],
  "sections": [
    {"id": "hook", "title": "The hook", "narration": ["Paragraph one.", "Paragraph two."]}
  ]
}
```

Checked for: length against the target (words = minutes × words_per_minute × 0.92,
±7%), a generic greeting in the opening, a hook longer than ~40 s, and at least
three title options.

## scenes/scene_plan.json

```json
{
  "style_bible": "One paragraph every AI prompt inherits: palette, lens, light, how each era looks.",
  "scenes": [
    {
      "id": "",
      "section": "hook",
      "narration": "Exact narration for this shot.",
      "visual": {
        "kind": "photo",
        "description": "What the viewer sees.",
        "camera": "push_in",
        "location": "Singapore River",
        "period": "1960s",
        "characters": "", "environment": "", "lighting": "", "mood": "curious",
        "search_query": "Singapore River bumboats 1960s",
        "alt_queries": ["Singapore River boats"],
        "pinned": "",
        "local_file": "",
        "prompt": "",
        "data": {},
        "shots": 1
      },
      "sfx": [],
      "music_mood": "reflective",
      "transition": "crossfade",
      "short_candidate": false
    }
  ]
}
```

`id` is assigned automatically (`scene_001`…). Scene narration, joined in order,
should reproduce the script; the stage warns if it drifts.

### Visual kinds

| kind | source | notes |
|---|---|---|
| `photo` | free providers (`assets.photo_providers`) | `search_query` should name place + subject + decade. `pinned` = a direct image URL (put `credit`/`license` in `data`). |
| `ai_image` / `ai_video` | fal.ai if configured | otherwise falls back to a photo search, and says so in the log |
| `local` | `local_file`, relative to the project | images or video clips you supply; `data.credit` for the credits |
| `map` | Natural Earth | `data`: `title`, `focus` [countries], `context` [countries], `bbox` [lon_min, lat_min, lon_max, lat_max], `points` [{name, lat, lon}], `routes` [{from: [lat, lon], to: [lat, lon], label}], `start_zoom` |
| `chart` | — | `data`: `type` bar/line, `title`, `unit`, `source`, `bars` [{label, value}] or `series` [{label, points: [[x, y]]}], optional `scale: "log"`, `highlight` |
| `timeline` | — | `data`: `title`, `events` [{year, label}], `highlight` (index) |
| `stat` | — | `data`: `value` (numbers count up), `label`, `source` |
| `title` | — | `data`: `text`, `subtitle` |
| `comparison` | — | `data`: `title`, `left` {label, value}, `right` {label, value}, `source` |
| `quote` | — | `data`: `text`, `attribution` (only real, sourced quotes) |
| `text` | — | `data`: `text` |

Cameras: `push_in`, `pull_out`, `pan_left`, `pan_right`, `tilt_up`, `tilt_down`,
`static`, `drone_forward`. Transitions: `crossfade` (within a section), `cut`;
sections always dip through black.

## manifest.json

Written by DocForge; the single record of every scene's assets, audio, timing,
clip and per-stage status. Don't edit it by hand: change `scene_plan.json` and
re-run `scenes` (finished work for unchanged scenes is kept).
