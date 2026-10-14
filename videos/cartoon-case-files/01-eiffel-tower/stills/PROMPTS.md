# Episode 1 shots: realistic animated humans

Generate one image per line in **9:16 portrait** and save it here under the scene key (for example `cc_hook.png`). Then add `"stills": "stills"` to `../script.json` and re-render. Any line without an image keeps its 3D set, so you can swap shots in one at a time.

An image-to-video clip with the same name (`cc_hook.mp4`, 5–10 s, made in Kling, Hailuo, Runway or Veo from the still) is used instead of the image and gives real movement. It is slowed or trimmed to fit the line.

**Style block (start every prompt with this):**
> 3D animated feature film still, Pixar and Disney style, realistic human proportions, expressive faces with big detailed eyes, soft subsurface skin, detailed hair and fabric, cinematic warm key light and cool rim light, shallow depth of field, vertical 9:16, no text, no watermark

**Cast (paste the matching line, and reuse the first good image as a character reference so the face stays the same):**
- **LUSTIG**: slim man in his 30s, slicked-back dark hair, thin neat moustache, sly half-smile, one raised eyebrow, hazel eyes, tailored charcoal three-piece suit, red silk tie, black fedora with a red band
- **POISSON**: stout, nervous man in his 50s, balding with a brown fringe, rosy round nose, worried green eyes, brown tweed suit, flat cap, sweat on his brow
- **DEALERS**: four 1920s businessmen in suits and moustaches of different ages, curious faces
- **GENDARME**: 1920s French policeman, navy uniform and kepi, bushy moustache, whistle

| Key | Image prompt (after the style block) | Motion prompt (image-to-video) |
|---|---|---|
| cc_hook | LUSTIG tipping his fedora with a sly wink, standing before the Eiffel Tower at golden hour, a red "À VENDRE" sign hanging on the tower | he tips the hat and winks; the sign sways |
| cc_title | LUSTIG in a spotlight on a dark Paris street at night, the tower glowing behind him, dramatic noir framing (keep space at the top for the title) | slow push-in, his eyes glint |
| cc_news | LUSTIG in a smoky 1920s café reading a French newspaper, the headline about the rusting tower visible, a light bulb of an idea in his expression | he lowers the paper and smirks |
| cc_letters | LUSTIG at a desk at night stamping official-looking government letters with a red wax seal, envelopes piled up, warm lamp light | the stamp comes down; envelopes slide |
| cc_hotel | A grand gilded hotel salon with a chandelier, LUSTIG presenting to the DEALERS around a polished table with a tiny model of the Eiffel Tower in the middle | the dealers lean in, amazed |
| cc_mark | Close-up of POISSON in a spotlight among the dark, blurred DEALERS, LUSTIG watching him from the shadows | the spotlight swells on Poisson, who swallows nervously |
| cc_hint | LUSTIG sighing theatrically with a hand on his chest, POISSON beside him slowly realising, a thick envelope of francs in Poisson's hand | Poisson slides the envelope across |
| cc_proof | POISSON beaming with relief and pride, a warm glow around him, confetti-like dust motes, eyes sparkling | he exhales and grins |
| cc_train | LUSTIG in a 1920s train compartment window, grinning, holding an open suitcase overflowing with francs, the countryside rushing by | banknotes flutter out of the window |
| cc_silent | POISSON hiding his face behind his hands at home, newspapers everywhere, blushing with embarrassment | he peeks through his fingers |
| cc_again | LUSTIG running down a cobbled Paris street, holding his fedora on, the GENDARME chasing and blowing a whistle, the tower behind | a comic chase that runs past the camera |
| cc_jail | LUSTIG older and thinner in a grey prison uniform behind bars, Alcatraz island and its lighthouse through the window, moody blue light | slow pull-out through the bars |
| cc_outro | The Eiffel Tower at night sparkling with lights, seen from the Trocadéro, magical and peaceful | slow tilt up the tower |
