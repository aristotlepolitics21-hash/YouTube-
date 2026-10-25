"""Turn finished Shorts into Instagram Reels posts and a posting schedule for a scheduler app.

For every Short folder (one with a short.json), writes final/instagram.md:
  caption       - hook, description, a question for the comments, follow CTA and up to 5 hashtags
  first comment - the sources (links in Instagram captions aren't clickable)
  cover text    - the title, for the Reel cover

Then writes videos/instagram/queue.csv: one row per Reel that hasn't been posted yet, given the next
free posting slot. Import it into the scheduler, or work down it by hand. Slugs listed in
videos/instagram/posted.txt (one per line) are left out, so add each slug there once it goes live.

Optional "instagram" key in short.json overrides the generated text:
  {"caption": "...", "question": "...", "hashtags": ["science", "space"]}

Usage (from the repo root):
  python videos/tools/instagram_pack.py                      # every Short, Tue/Fri 18:00 slots
  python videos/tools/instagram_pack.py --days mon,thu --time 17:30 --start 2026-11-03
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SHORT_DIRS = [ROOT / "videos" / "sciencefacts", ROOT / "videos" / "shorts"]
OUT = ROOT / "videos" / "instagram"
HANDLE = "@scimotion_lab"
MAX_HASHTAGS = 5  # Instagram's per-post limit
DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
SKIP_TAGS = {"shorts", "science facts"}


def hashtags(spec: dict) -> list[str]:
    tags = spec.get("instagram", {}).get("hashtags")
    if tags is None:
        tags = ["science"] + [t for t in spec.get("tags", []) if t not in SKIP_TAGS]
    out = []
    for t in tags:
        t = "#" + t.lstrip("#").replace(" ", "").lower()
        if t not in out:
            out.append(t)
    return out[:MAX_HASHTAGS]


def description(spec: dict) -> str:
    """The YouTube description without its hashtags, or the second narration line."""
    text = spec.get("description") or spec["shots"][1]["line"]
    return " ".join(w for w in text.split() if not w.startswith("#"))


def caption(spec: dict) -> str:
    ig = spec.get("instagram", {})
    if "caption" in ig:
        body = ig["caption"]
    else:
        hook = spec["shots"][0]["line"]
        question = ig.get("question", "Did you know this? Tell me in the comments 👇")
        body = f"{hook}\n\n{description(spec)}\n\n{question}"
    return f"{body}\n\nFollow {HANDLE} for animated science every week 🧪\n.\n{' '.join(hashtags(spec))}"


def write_post(folder: Path, spec: dict) -> None:
    sources = "\n".join(f"- {s}" for s in spec.get("sources", []))
    text = (
        f"# {spec['title']}\n\n"
        f"Video: final/{spec['slug']}.mp4\n\n"
        f"## Caption\n\n{caption(spec)}\n\n"
        f"## First comment\n\nSources 📚\n{sources}\n\n"
        f"## Cover text\n\n{spec['title']}\n"
    )
    (folder / "final").mkdir(exist_ok=True)
    (folder / "final" / "instagram.md").write_text(text)


def slots(start: dt.date, days: list[int], time: str):
    day = start
    while True:
        if day.weekday() in days:
            yield f"{day.isoformat()} {time}"
        day += dt.timedelta(days=1)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", default="tue,fri", help="posting days, e.g. tue,fri")
    ap.add_argument("--time", default="18:00", help="posting time (your local time)")
    ap.add_argument("--start", type=dt.date.fromisoformat, default=dt.date.today() + dt.timedelta(days=1))
    args = ap.parse_args()

    posted_file = OUT / "posted.txt"
    posted = set(posted_file.read_text().split()) if posted_file.exists() else set()
    folders = sorted(p.parent for d in SHORT_DIRS for p in d.glob("*/short.json"))

    rows = []
    slot = slots(args.start, [DAYS.index(d) for d in args.days.split(",")], args.time)
    for folder in folders:
        spec = json.loads((folder / "short.json").read_text())
        write_post(folder, spec)
        if spec["slug"] in posted:
            continue
        final = folder.relative_to(ROOT) / "final"
        rows.append([next(slot), spec["slug"], spec["title"], final / f"{spec['slug']}.mp4", final / "instagram.md"])

    OUT.mkdir(exist_ok=True)
    with (OUT / "queue.csv").open("w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["post_at", "slug", "title", "video", "caption_file"])
        w.writerows(rows)
    print(f"{len(folders)} captions written, {len(rows)} Reels queued -> {(OUT / 'queue.csv').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
