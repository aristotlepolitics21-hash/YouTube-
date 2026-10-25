"""Render a Built & Broken episode to an MP4 with OpenMontage's Remotion composer.

Run from anywhere, after `make setup` in OpenMontage/:
  python videos/tools/render_episode.py videos/built-and-broken-03-blockbuster

Output: <episode>/out/<episode folder name>.mp4 (1920x1080, 30 fps)
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

from build_episode import asset_dir

COMPOSER = Path(__file__).resolve().parents[2] / "OpenMontage" / "remotion-composer"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("episode", type=Path, help="Episode folder containing props.json")
    episode = ap.parse_args().episode.resolve()

    if not (COMPOSER / "node_modules").exists():
        sys.exit(
            "OpenMontage isn't set up yet. Run:\n"
            "  git submodule update --init\n"
            "  cd OpenMontage && make setup"
        )
    npx = shutil.which("npx") or shutil.which("npx.cmd")
    if not npx:
        sys.exit("npx not found. Install Node.js 18+ from https://nodejs.org/")

    public = COMPOSER / "public" / asset_dir(episode)
    public.mkdir(parents=True, exist_ok=True)
    shutil.copy2(episode / "narration.mp3", public / "narration.mp3")

    out = episode / "out" / f"{episode.name}.mp4"
    out.parent.mkdir(exist_ok=True)
    subprocess.run(
        [npx, "remotion", "render", "src/index.tsx", "Explainer", str(out),
         "--props", str(episode / "props.json"), "--codec", "h264"],
        cwd=COMPOSER, check=True,
    )
    print(f"\nDone: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
