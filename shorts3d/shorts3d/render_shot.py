"""Render one shot to a PNG sequence. Runs inside the Blender (bpy) environment.

  python -m shorts3d.render_shot --spec short.json --shot s04 --frames 120 --out frames/s04 \
      --bundle human_base_meshes_bundle.blend [--only 1,60,120]

Frames that already exist are skipped, so an interrupted render resumes.
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import bpy

from .shots import BUILDERS


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True)
    ap.add_argument("--shot", required=True)
    ap.add_argument("--frames", type=int, required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--bundle", required=True)
    ap.add_argument("--only", default="", help="comma-separated frame numbers (previews)")
    ap.add_argument("--width", type=int)
    ap.add_argument("--height", type=int)
    ap.add_argument("--samples", type=int)
    a = ap.parse_args()
    spec = json.loads(Path(a.spec).read_text())
    shot = next(s for s in spec["shots"] if s["id"] == a.shot)
    r = spec.get("render", {})
    ctx = {"bundle": a.bundle, "width": a.width or r.get("width", 540), "height": a.height or r.get("height", 960),
           "samples": a.samples or r.get("samples", 12), "fps": r.get("fps", 24), "spec": spec}
    scene = BUILDERS[shot["visual"]["type"]](shot["visual"], a.frames, ctx)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    frames = [int(x) for x in a.only.split(",") if x] or list(range(1, a.frames + 1))
    t0 = time.time()
    done = 0
    for f in frames:
        dest = out / f"{f:05d}.png"
        if dest.exists():
            continue
        scene.frame_set(f)
        scene.render.filepath = str(dest)
        bpy.ops.render.render(write_still=True)
        done += 1
    print(f"SHOT {a.shot}: rendered {done} frames in {time.time() - t0:.0f}s", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
