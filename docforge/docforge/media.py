"""Small FFmpeg/ffprobe helpers shared by the editor, QC and renderer."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


class FFmpegError(RuntimeError):
    pass


def run(args: list[str], input: bytes | None = None) -> subprocess.CompletedProcess:
    cmd = ["ffmpeg", "-hide_banner", "-y", "-loglevel", "error", *args]
    proc = subprocess.run(cmd, input=input, capture_output=True)
    if proc.returncode != 0:
        raise FFmpegError(f"ffmpeg failed: {' '.join(cmd)[:400]}\n{proc.stderr.decode(errors='replace')[-1500:]}")
    return proc


def probe(path: Path | str) -> dict:
    proc = subprocess.run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)],
                          capture_output=True, text=True)
    if proc.returncode != 0:
        raise FFmpegError(f"ffprobe failed for {path}: {proc.stderr[-500:]}")
    return json.loads(proc.stdout)


def duration(path: Path | str) -> float:
    return float(probe(path)["format"]["duration"])


def frame_count(path: Path | str) -> int:
    proc = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
                           "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", str(path)],
                          capture_output=True, text=True)
    return int(proc.stdout.strip() or 0)


def analyze(path: Path | str, filters: str, video: bool = False) -> str:
    """Run an analysis filter and return ffmpeg's stderr (where detect filters log)."""
    flag = "-vf" if video else "-af"
    proc = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), flag, filters,
                           "-f", "null", "-"], capture_output=True, text=True)
    return proc.stderr


def max_volume_db(path: Path | str) -> float:
    m = re.search(r"max_volume:\s*(-?[\d.]+) dB", analyze(path, "volumedetect"))
    return float(m.group(1)) if m else 0.0


def decode_errors(path: Path | str) -> str:
    proc = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "null", "-"],
                          capture_output=True, text=True)
    return proc.stderr.strip()
