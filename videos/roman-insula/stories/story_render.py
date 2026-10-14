"""Stage and render an insula story, shot by shot.

Each shot is built from scratch on the shared set (acting.base_set) by the function of the same id in
STORY_DIR/shots.py, and lasts exactly as long as its narration (build/timeline.json from narrate.py).
Text-card shots ("card" in story.json) are made by assemble.py and skipped here.
Frames go to STORY_DIR/build/frames/<shot id>/ and finished frames are skipped, so a render resumes.

  python story_render.py -- STORY_DIR [--res 720] [--samples 10] [--only id1,id2] [--stills 0.1,0.5,0.95]
Works with `blender -b -P story_render.py -- ...` or the bpy wheel.
"""
import argparse
import importlib.util
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy  # noqa: E402
import acting  # noqa: E402
from acting import fr  # noqa: E402


def load_shots(story_dir):
    spec = importlib.util.spec_from_file_location("shots", os.path.join(story_dir, "shots.py"))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def render_shot(shots, shot, a, out_root, stills):
    T = shot["dur"]
    M = acting.base_set(getattr(shots, "LIGHT", {}).get(shot["id"], "day"), a.res, a.samples)
    fn = getattr(shots, shot["id"])
    if fn.__code__.co_argcount >= 3:  # L: each line's start, in seconds from the start of the shot
        fn(M, T, [ln["start"] - shot["start"] for ln in shot["lines"]])
    else:
        fn(M, T)
    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = 1, fr(T)
    out = os.path.join(out_root, shot["id"])
    os.makedirs(out, exist_ok=True)
    frames = sorted({fr(T * u) for u in stills}) if stills else range(1, fr(T) + 1)
    for f in frames:
        path = os.path.join(out, f"{f:04d}.png")
        if os.path.exists(path) and not stills:
            continue  # resumable
        sc.frame_set(f)
        sc.render.filepath = path
        bpy.ops.render.render(write_still=True)
    print(f"done {shot['id']} frames {len(frames)}", flush=True)


def main(argv):
    p = argparse.ArgumentParser()
    p.add_argument("story")
    p.add_argument("--res", type=int, default=720)
    p.add_argument("--samples", type=int, default=10)
    p.add_argument("--only")
    p.add_argument("--stills", nargs="?", const="0.1,0.5,0.95", help="check frames, as fractions of each shot")
    a = p.parse_args(argv)
    story = os.path.abspath(a.story)
    shots = load_shots(story)
    tl = json.load(open(os.path.join(story, "build", "timeline.json")))
    root = os.path.join(story, "build", "stills" if a.stills else "frames")
    for k, shot in enumerate(tl["shots"]):
        shot["lines"] = [ln for ln in tl["lines"] if ln["shot"] == k]
        if shot.get("card") or (a.only and shot["id"] not in a.only.split(",")):
            continue
        render_shot(shots, shot, a, root, [float(u) for u in a.stills.split(",")] if a.stills else None)


if __name__ == "__main__":
    main(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
