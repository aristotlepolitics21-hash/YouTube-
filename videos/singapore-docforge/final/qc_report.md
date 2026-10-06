# Quality control report

**Result:** PASS — 0 errors, 10 warnings

## Checklist

- ☑ target length
- ☑ missing scenes
- ☑ missing assets
- ☑ scene order
- ☑ audio gaps
- ⚠ narration mismatch (1)
- ⚠ repetition (2)
- ⚠ visual continuity (7)
- ☑ historical detail
- ☑ durations
- ☑ subtitle sync
- ☑ audio clipping
- ☑ black frames
- ☑ corrupt files

_visual continuity and historical detail are heuristics: review flagged scenes by eye._

## Issues

| Severity | Check | Scene | Detail |
|---|---|---|---|
| warning | repetition | scene_101 | 5 'photo' scenes in a row |
| warning | repetition |  | only 32% of the runtime is photos or footage; the rest is graphics and text cards |
| warning | visual_continuity | scene_072 | image title doesn't mention 'singapore': View of Pulau Bukom from Sentosa Siloso Beach |
| warning | visual_continuity | scene_077 | image title doesn't mention 'singapore': Changi Airport Control Tower |
| warning | visual_continuity | scene_079 | image title doesn't mention 'singapore': Marina Bay Financial Centre |
| warning | visual_continuity | scene_093 | image title doesn't mention 'singapore': HDB void deck |
| warning | visual_continuity | scene_101 | image title doesn't mention 'singapore': HDB blocks from Mount Faber |
| warning | visual_continuity | scene_110 | image title doesn't mention 'singapore': Jewel Changi Airport waterfall |
| warning | visual_continuity | scene_128 | image title doesn't mention 'singapore': Changi Airport Jewel - Skytrain passing from and to terminal |
| warning | narration_mismatch | scene_064 | heard "Heart of the answer was already underway." (67% match) |
