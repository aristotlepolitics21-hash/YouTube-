"""Render the Nokia episode to an MP4 with OpenMontage's Remotion composer.

Run from anywhere, after `make setup` in OpenMontage/:
  python videos/built-and-broken-02-nokia/render.py

Output: videos/built-and-broken-02-nokia/out/nokia.mp4 (1920x1080, 30 fps)
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
COMPOSER = HERE.parents[1] / "OpenMontage" / "remotion-composer"
ASSET_DIR = COMPOSER / "public" / "nokia-ep2"  # must match ASSET_DIR in build.py


def main() -> int:
    if not (COMPOSER / "node_modules").exists():
        sys.exit(
            "OpenMontage isn't set up yet. Run:\n"
            "  git submodule update --init\n"
            "  cd OpenMontage && make setup"
        )
    npx = shutil.which("npx") or shutil.which("npx.cmd")
    if not npx:
        sys.exit("npx not found. Install Node.js 18+ from https://nodejs.org/")

    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(HERE / "narration.mp3", ASSET_DIR / "narration.mp3")

    out = HERE / "out" / "nokia.mp4"
    out.parent.mkdir(exist_ok=True)
    subprocess.run(
        [npx, "remotion", "render", "src/index.tsx", "Explainer", str(out),
         "--props", str(HERE / "props.json"), "--codec", "h264"],
        cwd=COMPOSER, check=True,
    )
    print(f"\nDone: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
