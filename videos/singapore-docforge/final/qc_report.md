# Quality control report

**Result:** PASS — 0 errors, 12 warnings

## Checklist

- ☑ missing scenes
- ☑ missing assets
- ☑ scene order
- ☑ audio gaps
- ⚠ narration mismatch (4)
- ⚠ repetition (1)
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
| warning | visual_continuity | scene_072 | image title doesn't mention 'singapore': View of Pulau Bukom from Sentosa Siloso Beach |
| warning | visual_continuity | scene_077 | image title doesn't mention 'singapore': Changi Airport Control Tower |
| warning | visual_continuity | scene_079 | image title doesn't mention 'singapore': Marina Bay Financial Centre |
| warning | visual_continuity | scene_093 | image title doesn't mention 'singapore': HDB void deck |
| warning | visual_continuity | scene_101 | image title doesn't mention 'singapore': HDB blocks from Mount Faber |
| warning | visual_continuity | scene_110 | image title doesn't mention 'singapore': Jewel Changi Airport waterfall |
| warning | visual_continuity | scene_126 | image title doesn't mention 'singapore': Changi Airport Jewel - Skytrain passing from and to terminal |
| warning | narration_mismatch | scene_008 | heard "Sing -de -pours entire land area is less than 750 square kilometers." (74% match) |
| warning | narration_mismatch | scene_030 | heard "Japanese forces cross the narrow Johar Strait and attack the island from the Northwest." (79% match) |
| warning | narration_mismatch | scene_069 | heard "Saying a port did the opposite. It invited them in." (78% match) |
| warning | narration_mismatch | scene_087 | heard "That there was housing." (75% match) |
