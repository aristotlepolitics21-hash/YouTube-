"""Render an episode JSON to MP4 (+ thumbnail).

  python3 animator/render.py animator/episodes/pizza.json --voice VOICE.onnx -o out/pizza.mp4
  python3 animator/render.py EPISODE.json --stills out/stills   # one PNG per scene, no audio
  python3 animator/render.py EPISODE.json --preview ...         # half resolution, fast

Voice: any Piper .onnx model (e.g. en_US-ryan-high from huggingface.co/rhasspy/piper-voices).
Without --voice the video renders silent-narration (music, SFX and captions only).
"""
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
import engine

ap = argparse.ArgumentParser()
ap.add_argument("episode")
ap.add_argument("-o", "--out")
ap.add_argument("--voice", default=os.environ.get("PIPER_VOICE"))
ap.add_argument("--preview", action="store_true")
ap.add_argument("--stills")
ap.add_argument("--cache", default=".cache/tts")
a = ap.parse_args()
ep = json.load(open(a.episode))
name = os.path.splitext(os.path.basename(a.episode))[0]

if a.stills:
    os.makedirs(a.stills, exist_ok=True)
    portrait = ep.get("format") == "short"
    ctx = engine.Ctx(*((540, 960) if portrait else (960, 540)))
    for i, sc in enumerate(ep["scenes"]):
        img = engine.SCENES[sc["type"]](ctx, sc, sc.get("still_t", 1.6), 3.0)
        img.save(os.path.join(a.stills, f"{name}_{i:02d}_{sc['type']}.png"))
    engine.thumbnail(ep, os.path.join(a.stills, f"{name}_thumb.png"))
    print("stills ->", a.stills); sys.exit()

out = a.out or f"out/{name}.mp4"
os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
print(f"Rendering {ep['title']!r} -> {out}")
total = engine.render(ep, out, voice=a.voice, cache_dir=a.cache, preview=a.preview)
engine.thumbnail(ep, os.path.splitext(out)[0] + "_thumb.png")
print(f"done: {total:.1f}s")
