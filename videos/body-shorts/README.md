# Body Shorts

Vertical (1080×1920) 3D shorts, 30–40 seconds each, about what's really going on inside your body: "what happens if you hold in a sneeze", "why your foot falls asleep" and so on. One narrator, fast cuts, no intro. Each one opens on the question and ends on a twist or a tip.

| # | Episode | Status |
|---|---|---|
| 1 | What Happens If You Hold In a Sneeze | Rendered |
| 2 | The Danger Triangle of Your Face | Rendering |
| 3 | What Happens When You Crack Your Knuckles | Rendering |
| 4 | What Actually Causes Brain Freeze | Rendering |
| 5 | Why You Get Goosebumps | Scripted |
| 6 | What Happens If You Swallow Gum | Scripted |
| 7 | What Actually Causes Hiccups | Scripted |
| 8 | Why Your Foot Falls Asleep | Scripted |
| 9 | Why Onions Make You Cry | Scripted |
| 10 | What a Mosquito Bite Really Does | Scripted |
| 11 | Why Your Stomach Growls | Scripted |
| 12 | Why Paper Cuts Hurt So Much | Scripted |
| 13 | Why You See Stars When You Stand Up | Scripted |
| 14 | Why Your Fingers Go Wrinkly in Water | Scripted |
| 15 | Why You Can't Tickle Yourself | Scripted |
| 16 | Why Yawning Is Contagious | Scripted |
| 17 | Why Bees Die When They Sting | Scripted |
| 18 | Why Spicy Food Burns | Scripted |
| 19 | Why Hitting Your Funny Bone Hurts | Scripted |
| 20 | Why You Get a Fever | Scripted |

Each episode folder holds `script.json` (one scene and one narration line per entry), the video, `captions.srt`, `description.txt`, `tags.txt` and `thumbnail.jpg`.

## How it's made

The shorts use the Tech Shorts 3D engine (`../tech-shorts/engine3d`). Their sets live in `engine3d/sets/body/`:

- `common.js` is the shared kit: a stylised person (posable face, elbows and knees, hands that reach for a target, and an x-ray mode that turns skin see-through to show the organs inside), anatomy (brain, lungs, heart, vessels, nerves, germs, immune cells), animals, insects, everyday props, and labels pinned to the screen so close-ups never clip them.
- One file per episode (`sneeze.js`, `triangle.js`, ...) builds that episode's scenes.

Narration is Kokoro-82M (`am_michael`, 108% speed). Set it up once with `../tech-shorts/engine/setup_kokoro.sh DIR`, then:

```
cd ../tech-shorts/engine3d && npm install
KOKORO_DIR=DIR ./make.sh 01-sneeze WORKDIR    # run from videos/body-shorts
```

`make.sh` voices the script, renders the video (about 15 minutes on a 4-core CPU), and copies the video, captions and a thumbnail into the episode folder. `make-all.sh WORKROOT` renders every episode named in `WORKROOT/queue.txt`, one after another.

## Fact notes

The scripts stick to well-documented claims and say "rarely" or "one idea" where the science is thin:

- **Sneeze:** the 2018 throat tear is the BMJ Case Reports patient from Leicester.
- **Knuckles:** the one-hand study is Donald Unger's, which won the 2009 Ig Nobel Prize in Medicine.
- **Hiccups:** Charles Osborne's 68 years is the Guinness record.
- **Wrinkly fingers:** the wet-marbles study is Kareklas et al., 2013. A later study didn't replicate it, which is why the script calls grip "one idea".
- **Tickling:** the robot-delay experiment is Blakemore, Frith and Wolpert, 1999.
