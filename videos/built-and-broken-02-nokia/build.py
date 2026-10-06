"""Build the Nokia episode from scenes.json.

Generates narration with Piper (offline TTS), times every scene to its
narration, and writes:
  narration.mp3   - full voice track
  props.json      - Remotion props for OpenMontage's Explainer composition
  nokia.srt       - closed captions for YouTube
  chapters.txt    - chapter timestamps for the description

Usage (from the repo root, after `make setup` in OpenMontage/):
  OpenMontage/.venv/bin/python videos/built-and-broken-02-nokia/build.py \
      --voice /path/to/en_US-ryan-high.onnx
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
ASSET_DIR = "nokia-ep2"  # folder under remotion-composer/public/ at render time

LEAD_IN = 0.6  # silence before the first line
SCENE_GAP = 0.45  # pause between scenes in the same section
SECTION_GAP = 1.1  # longer pause when a new chapter starts
TAIL = 2.0  # hold the final card after the last line

THEME = {
    "primaryColor": "#124191",
    "accentColor": "#4FA3FF",
    "backgroundColor": "#0A1430",
    "surfaceColor": "#132350",
    "textColor": "#F4F7FF",
    "mutedTextColor": "#9FB0D4",
    "chartColors": ["#4FA3FF", "#F5B841", "#7DD3C0", "#E86A6A", "#B79CFF", "#9FB0D4"],
    "captionHighlightColor": "#4FA3FF",
    "captionBackgroundColor": "rgba(10, 20, 48, 0.8)",
}


# Narration spells model numbers the way people say them; captions show digits.
CAPTION_TEXT = {
    "twenty-one ten": "2110",
    "thirty-three ten": "3310",
    "eleven hundred": "1100",
    "nine thousand Communicator": "9000 Communicator",
}


def caption_text(narration: str) -> str:
    for spoken, shown in CAPTION_TEXT.items():
        narration = narration.replace(spoken, shown)
    return narration


def synth(text: str, voice: Path, out: Path, length_scale: float) -> None:
    subprocess.run(
        [sys.executable, "-m", "piper", "-m", str(voice), "-f", str(out),
         "--length-scale", str(length_scale), "--sentence-silence", "0.25"],
        input=text.encode(), check=True, capture_output=True,
    )


def read_wav(path: Path) -> tuple[bytes, int, int, int]:
    with wave.open(str(path), "rb") as w:
        return w.readframes(w.getnframes()), w.getframerate(), w.getsampwidth(), w.getnchannels()


def fmt_srt(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def fmt_chapter(t: float) -> str:
    t = int(t)
    return f"{t // 60}:{t % 60:02d}"


def split_caption(text: str, start: float, end: float, max_chars: int = 84):
    """Split a line into sentence-ish chunks, timed by character share."""
    parts = [p.strip() for p in re.split(r"(?<=[.?!])\s+", text) if p.strip()]
    chunks: list[str] = []
    for p in parts:
        while len(p) > max_chars:
            cut = p.rfind(",", 0, max_chars)
            cut = cut if cut > 20 else p.rfind(" ", 0, max_chars)
            chunks.append(p[: cut + 1].strip())
            p = p[cut + 1 :].strip()
        chunks.append(p)
    total = sum(len(c) for c in chunks)
    t = start
    for c in chunks:
        d = (end - start) * len(c) / total
        yield c, t, t + d
        t += d


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True, type=Path, help="Piper .onnx voice model")
    ap.add_argument("--length-scale", type=float, default=1.05, help=">1 speaks slower")
    args = ap.parse_args()

    spec = json.loads((HERE / "scenes.json").read_text())
    scenes = spec["scenes"]

    pcm = bytearray()
    rate = width = channels = 0
    cuts, srt, chapters = [], [], []
    t = 0.0
    prev_section = None

    def silence(seconds: float) -> bytes:
        return b"\x00" * (int(seconds * rate) * width * channels)

    with tempfile.TemporaryDirectory() as tmp:
        for i, scene in enumerate(scenes):
            wav = Path(tmp) / f"{i:03d}.wav"
            synth(scene["narration"], args.voice, wav, args.length_scale)
            frames, r, sw, ch = read_wav(wav)
            if not rate:
                rate, width, channels = r, sw, ch
                pcm += silence(LEAD_IN)
                t = LEAD_IN
            elif scene["section"] != prev_section:
                pcm += silence(SECTION_GAP)
                t += SECTION_GAP
            else:
                pcm += silence(SCENE_GAP)
                t += SCENE_GAP

            if scene["section"] != prev_section:
                chapters.append((t, spec["sections"][scene["section"]]))
            prev_section = scene["section"]

            dur = len(frames) / (rate * width * channels)
            start, end = t, t + dur
            pcm += frames
            t = end
            srt.extend(split_caption(caption_text(scene["narration"]), start, end))
            cuts.append({"start": start, "end": end, "scene": scene, "index": i})
            print(f"[{i + 1:02d}/{len(scenes)}] {fmt_chapter(start)} {dur:5.1f}s  {scene['narration'][:60]}")

    total = t + TAIL
    pcm += silence(TAIL)

    # Each visual holds from its narration start until the next one begins, so
    # the screen is never empty. The first card also covers the lead-in.
    props_cuts = []
    for n, c in enumerate(cuts):
        v = dict(c["scene"]["visual"])
        cut_in = 0.0 if n == 0 else c["start"] - 0.15
        cut_out = total if n == len(cuts) - 1 else cuts[n + 1]["start"] - 0.15
        cut = {"id": f"s{c['index'] + 1:02d}", "source": "",
               "in_seconds": round(cut_in, 3), "out_seconds": round(cut_out, 3), **v}
        props_cuts.append(cut)

    props = {
        "themeConfig": THEME,
        "cuts": props_cuts,
        "overlays": [],
        "captions": [],
        "audio": {"narration": {"src": f"{ASSET_DIR}/narration.mp3", "volume": 1.0}},
    }

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        full_wav = Path(f.name)
    with wave.open(str(full_wav), "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(width)
        w.setframerate(rate)
        w.writeframes(bytes(pcm))
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(full_wav),
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100",
         "-codec:a", "libmp3lame", "-b:a", "192k", str(HERE / "narration.mp3")],
        check=True,
    )
    full_wav.unlink()

    (HERE / "props.json").write_text(json.dumps(props, indent=2, ensure_ascii=False) + "\n")
    (HERE / "nokia.srt").write_text(
        "\n".join(f"{n}\n{fmt_srt(a)} --> {fmt_srt(b)}\n{txt}\n" for n, (txt, a, b) in enumerate(srt, 1))
    )
    (HERE / "chapters.txt").write_text(
        "\n".join(f"{fmt_chapter(0 if n == 0 else a)} {name}" for n, (a, name) in enumerate(chapters)) + "\n"
    )
    print(f"\nTotal length: {fmt_chapter(total)} ({total:.1f}s), {len(cuts)} scenes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
