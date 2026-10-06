# The Boy Who Harnessed the Wind: CGI shot batch

136 shots for an AI video generator (Veo, Kling, Runway, Sora, Seedance), cleaned up for consistency and accuracy.

| File | Use it for |
|---|---|
| `shots.csv` | Spreadsheet or bulk upload. One row per shot, with length, characters, reference images and notes |
| `shots.json` | Tools or scripts that take JSON |
| `prompts-paste.txt` | Copying prompts one at a time into a generator |

**Total:** 786 s of footage (13:06) across 136 clips. The 15 hero shots come to 86 s.
Clip lengths are 4, 6 or 8 seconds, which every Veo model accepts. Kling and Seedance take any length in their range.

## What changed from your prompts

- **Character descriptions** are added to every shot a recurring character appears in, so the generator draws the same people each time:
  WILLIAM at 14 (70 shots), WILLIAM as an adult (10), FATHER (10), MOTHER (11).
- **Setting line** ("rural central Malawi, early 2000s") is added to the village shots.
- **"No on-screen text, no logos, no watermarks"** is added to every shot. Generators produce garbled text, and real logos cause rights problems.
- **Fixes:** #10 and #34 (William had six sisters, not a "family of four"); #21 (uniform colour unverified); #113, #118, #129 and #130 (no real branding).
- **Flagged, unchanged:** #25 (the grain-reserve sale is a real claim, so source it in the narration). #23, #115 and #132 pack several scenes into one clip, so they may work better as separate clips. #135 (the ghost effect) may need compositing.
- Your original wording is kept in the `original_prompt` column.

## Reference images (make these first)

Generate or draw one clean, front-lit portrait of each character, save it under the name below, and attach it to every shot that lists it. That's the single biggest fix for faces changing between clips.

| File | Character |
|---|---|
| `ref_william_14.png` | WILLIAM (age 14): slim Malawian boy, close-cropped hair, faded red T-shirt, khaki shorts, worn sandals. |
| `ref_william_adult.png` | WILLIAM (early 20s): same face as the boy, older, slim build, close-cropped hair, collared shirt. |
| `ref_father.png` | FATHER: lean Malawian farmer in his 40s, faded work shirt, weathered hands. |
| `ref_mother.png` | MOTHER: Malawian woman in her 40s, patterned chitenge wrap and headscarf. |

### Generated portraits (Canva)

Download each one at full size from Canva and save it under the file name on the left.

| File | Canva image | Canva media ID |
|---|---|---|
| `ref_william_14.png` | https://www.canva.com/M/MAHXPWynZiA | MAHXPWynZiA |
| `ref_william_adult.png` | https://www.canva.com/M/MAHXPYG1oaA | MAHXPYG1oaA (made from the boy's portrait, so the faces match) |
| `ref_father.png` | https://www.canva.com/M/MAHXPTp-utc | MAHXPTp-utc |
| `ref_mother.png` | https://www.canva.com/M/MAHXPX0zd2E | MAHXPX0zd2E |

These are designed characters, not likenesses of the real family.

Veo takes up to 3 reference images (8-second clips only), Kling and Seedance up to 9.

## Hero shots (generate these first)

#1, #3, #43, #50, #58, #60, #81, #82, #88, #91, #92, #94, #98, #118, #134. If the budget is tight, these carry the story. Fill the gaps with the existing animation and real photos.

## Before you publish

This is realistic AI footage of a real person and real events. In YouTube Studio, set **Altered or synthetic content** to **Yes**.
