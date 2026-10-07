# The MrBeast formula, reverse engineered

Source: vidIQ pull on 2026-10-07 of @MrBeast's 50 most popular and 50 most recent long-form
uploads (`data/mrbeast_longform.csv`, 95 unique). Re-run the numbers with
`python3 beast-formula/analyze.py`.

## What the data says

| | Top 50 all-time | Latest 45 |
|---|---|---|
| Median views | 371M | 167M |
| Median length | 16.5 min | 27.4 min |

**Formats by share of the all-time top 50** (median views):

| Format | Example title | Top 50 | Median |
|---|---|---|---|
| `$1 vs $X` price tiers | $1 vs $500,000 Plane Ticket! | 9 | **471M** |
| I survived / spent N days | I Spent 7 Days Buried Alive | 8 | 348M |
| World's most / largest | World's Deadliest Obstacle Course! | 6 | 329M |
| N people / ages fight | Ages 1 - 100 Fight For $500,000 | 6 | 345M |
| Survive N days, win $ | $10,000 Every Day You Survive In A Grocery Store | 5 | 434M |
| Dare for $ | Would You Sit In Snakes For $10,000? | 5 | 407M |
| Last to leave | Last To Leave Circle Wins $500,000 | 2 | 432M |

`$1 vs $X` has the highest median of any format and four of the top ten videos. Of the recent
uploads, the long "Survive N days / Last to leave" competitions get the most views (175-204M median).
Philanthropy videos are 7 of the last 45 but get the fewest views (93M median). He makes them for
the brand, not for views.

**Title rules** (all 95 titles):
- Median 6 words, never more than 11.
- 82% contain a number and 56% contain a dollar amount. The number is the hook.
- Only 24% are first person ("I ..."). The stakes are the subject, not him.
- Sentence-case caps on every word, `!` on 28%, no clickbait question words.
- Built from a few templates: `$1 vs $[huge] [Thing]!`, `Last To Leave [Place] Wins $[X]`,
  `Survive [N] Days [Somewhere], Win $[X]`, `[N] [Group] Fight For $[X]`, `World's [Most] [Adjective] [Thing]`.

## The structure the animations copy (from the format's well-known playbook)

1. **0-5 s: the whole promise in one line.** Show both ends of the stakes ("$1 ... $1,000,000")
   before any context. No intro or logo, and no "hey guys".
2. **Escalation ladder.** Every beat raises the stakes (10x price, fewer players, more hours).
   The viewer always knows the next rung is bigger than the last.
3. **A twist about halfway in.** A new rule or a cash-out offer ("$10,000 to leave now") resets
   tension before the middle sags.
4. **Visual state on screen all the time:** price tag, players-left counter, clock and prize.
   Someone who looks away for 10 seconds can still follow.
5. **A new visual every 2-4 s:** cut, zoom punch, pop-in text, sound effect. Captions run word
   by word in yellow and white.
6. **Payoff, then a fast CTA** that teases the next video ("subscribe for the $1,000,000 burger").

## What `animator/` turns this into

| Formula element | Engine feature |
|---|---|
| Stakes-first hook | `hook` scene: pop-in lines over spinning rays and falling money |
| Price ladder | `tier` scene: item slides along a kitchen counter, the host points, leans in, bites (a chunk disappears), chews, reacts by score and rates it with stars |
| Elimination competition | `circle` scene: up to 10 players with name tags, eliminated ones leap out and run off screen, HUD with prize, clock and players left |
| Mid-video twist | `versus` (split screen slam) and `counter` (cash offer count-up) |
| Payoff | `winner`: crown drop, confetti, money rain |
| CTA | `outro`: animated subscribe press and a comment question |
| Pacing | zoom punch on every cut, scenes timed to the voiceover, word-by-word captions, synthesized whoosh/pop/cash/boom SFX, 126 bpm music bed that ducks under the voice |

The mascot "Chip" and the players are original characters. The videos copy the *format* (title
templates, pacing, escalation), not MrBeast's name, face, likeness or branding. Formats can't be
owned, but don't put his name or face in your titles or thumbnails.

## Scaling the pilots to full length

The three episodes in `animator/episodes/` are 15-60 s pilots. To match the data (16-27 min):
add more rungs (`$1 → $10 → ... → $1B`, 8-10 tiers), give each tier 3-4 scenes (reveal, taste,
reaction, comparison), and add a second twist at about the 70% mark. Each scene is one JSON object,
so a longer video is just a longer list.
