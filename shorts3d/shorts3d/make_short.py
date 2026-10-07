"""Make an animated 3D Short from a short.json spec.

  python -m shorts3d.make_short videos/shorts/<name>/short.json [--preview] [--only-shots s01,s02]

Runs in the DocForge environment (Piper, Whisper, Pillow, FFmpeg). Each shot is
rendered by Blender in a separate process (the Blender Python environment given by
SHORTS3D_BLENDER_PYTHON, default /home/user/blender-venv/bin/python). Everything is
resumable: narration lines, rendered frames and encoded shots are reused when their
inputs haven't changed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

from docforge import media
from docforge.editor.audio import RATE, _pad_section, mood_family, whoosh
from docforge.subtitles.subtitles import align, load_16k, _whisper
from docforge.voiceover.tts import Piper

HERE = Path(__file__).resolve().parent
BLENDER_PY = os.environ.get("SHORTS3D_BLENDER_PYTHON", "/home/user/blender-venv/bin/python")
DEFAULT_BUNDLE = os.environ.get(
    "SHORTS3D_HUMAN_BUNDLE", str(Path("~/.cache/shorts3d/human_base_meshes_bundle.blend").expanduser()))
BUNDLE_URL = ("https://download.blender.org/demo/asset-bundles/human-base-meshes/"
              "human-base-meshes-bundle-v1.4.1.zip")


# ----------------------------------------------------------------- assets
def ensure_bundle(path: str) -> str:
    p = Path(path)
    if p.exists():
        return str(p)
    import io
    import zipfile
    import requests
    p.parent.mkdir(parents=True, exist_ok=True)
    print("downloading Blender Human Base Meshes bundle (CC0, ~50 MB)...", flush=True)
    r = requests.get(BUNDLE_URL, timeout=600)
    r.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        name = next(n for n in z.namelist() if n.endswith(".blend"))
        p.write_bytes(z.read(name))
    return str(p)


# ------------------------------------------------------------- narration
def wav_seconds(path: Path) -> float:
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / w.getframerate()


def read_pcm(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def narrate(spec: dict, work: Path) -> list[dict]:
    v = spec.get("voice", {})
    tts = None
    out = []
    for shot in spec["shots"]:
        text = shot["line"]
        key = hashlib.sha1(repr((text, v)).encode()).hexdigest()[:10]
        dest = work / "voice" / f"{shot['id']}_{key}.wav"
        dest.parent.mkdir(parents=True, exist_ok=True)
        if not dest.exists():
            tts = tts or Piper(v.get("piper_voice", "en_US-ryan-high"), v.get("dir", "~/.cache/docforge/voices"),
                               float(v.get("length_scale", 0.95)), float(v.get("sentence_silence", 0.15)))
            spoken = text
            for a, b in (v.get("pronunciations") or {}).items():
                spoken = spoken.replace(a, b)
            tts.synth(spoken, dest)
        out.append({"id": shot["id"], "wav": dest, "seconds": wav_seconds(dest)})
    return out


def timeline(spec: dict, voice: list[dict]) -> list[dict]:
    fps = spec.get("render", {}).get("fps", 24)
    gap = spec.get("gap_seconds", 0.12)
    lead = spec.get("lead_seconds", 0.25)
    t, plan = 0.0, []
    for i, (shot, v) in enumerate(zip(spec["shots"], voice)):
        start = t
        audio_at = start + (lead if i == 0 else 0)
        end = audio_at + v["seconds"] + gap + shot.get("hold", 0)
        frames = max(12, round((end - start) * fps))
        end = start + frames / fps
        plan.append({"id": shot["id"], "start": start, "end": end, "frames": frames, "audio_at": audio_at,
                     "wav": str(v["wav"]), "seconds": v["seconds"]})
        t = end
    return plan


# ---------------------------------------------------------------- render
def render_shots(spec_path: Path, spec: dict, plan: list[dict], work: Path, bundle: str, preview: bool,
                 only: set[str]) -> None:
    for p in plan:
        if only and p["id"] not in only:
            continue
        shot = next(s for s in spec["shots"] if s["id"] == p["id"])
        sig = hashlib.sha1(json.dumps([shot["visual"], p["frames"], spec.get("render", {})],
                                      sort_keys=True).encode()).hexdigest()[:10]
        out = work / "frames" / f"{p['id']}_{sig}"
        p["frames_dir"] = str(out)
        args = [BLENDER_PY, "-m", "shorts3d.render_shot", "--spec", str(spec_path), "--shot", p["id"],
                "--frames", str(p["frames"]), "--out", str(out), "--bundle", bundle]
        if preview:
            args += ["--only", f"1,{max(1, p['frames'] // 2)},{p['frames']}"]
        elif out.exists() and len(list(out.glob("*.png"))) >= p["frames"]:
            continue
        env = {**os.environ, "PYTHONPATH": str(HERE.parent)}
        print(f"rendering {p['id']} ({p['frames']} frames{' preview' if preview else ''})...", flush=True)
        proc = subprocess.run(args, env=env, capture_output=True, text=True)
        if proc.returncode != 0:
            raise RuntimeError(f"Blender failed on {p['id']}:\n{proc.stderr[-2500:]}")
        print([l for l in proc.stdout.splitlines() if l.startswith("SHOT")][-1], flush=True)


def encode_shots(spec: dict, plan: list[dict], work: Path) -> Path:
    fps = spec.get("render", {}).get("fps", 24)
    parts = []
    for p in plan:
        src = Path(p["frames_dir"])
        dest = work / "clips" / f"{src.name}.mp4"
        dest.parent.mkdir(parents=True, exist_ok=True)
        n = len(list(src.glob("*.png")))
        if n < p["frames"]:
            raise RuntimeError(f"{p['id']} has {n}/{p['frames']} frames rendered")
        if not dest.exists():
            media.run(["-framerate", str(fps), "-i", str(src / "%05d.png"),
                       "-vf", "scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,format=yuv420p",
                       "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-r", str(fps), str(dest)])
        parts.append(dest)
    lst = work / "clips.txt"
    lst.write_text("".join(f"file '{p.resolve()}'\n" for p in parts))
    picture = work / "picture.mp4"
    media.run(["-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(picture)])
    return picture


# ---------------------------------------------------------------- audio
def _crack(seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(0.09 * RATE)
    t = np.arange(n) / RATE
    click = rng.standard_normal(n) * np.exp(-t * 90)
    knock = np.sin(2 * np.pi * 180 * t) * np.exp(-t * 40) * 0.6
    x = (click * 0.8 + knock)
    return np.stack([x, x], 1) / np.abs(x).max() * 0.9


def _pop() -> np.ndarray:
    n = int(0.35 * RATE)
    t = np.arange(n) / RATE
    f = 220 * np.exp(-t * 9) + 60
    body = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-t * 14)
    snap = np.random.default_rng(3).standard_normal(n) * np.exp(-t * 120) * 0.7
    x = body + snap
    return np.stack([x, x], 1) / np.abs(x).max() * 0.95


def _chime() -> np.ndarray:
    n = int(1.6 * RATE)
    t = np.arange(n) / RATE
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) * a
            for f, d, a in ((880, 3, 1), (1320, 4, 0.5), (1760, 5, 0.3), (2640, 7, 0.15)))
    return np.stack([x, x * 0.9], 1) / np.abs(x).max() * 0.6


def _noise(n, seed):
    return np.random.default_rng(seed).standard_normal(n).astype(np.float32)


def _lowpass(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")


def _st(x, peak=0.9):
    return np.stack([x, x], 1) / (np.abs(x).max() + 1e-9) * peak


def _thunder(seed=1) -> np.ndarray:
    n = int(3.2 * RATE)
    t = np.arange(n) / RATE
    crack = _noise(n, seed) * np.exp(-t * 18)
    rumble = _lowpass(_lowpass(_noise(n, seed + 1), 60), 60) * 30
    rumble *= np.exp(-t * 0.9) * (1 + 0.5 * np.sin(2 * np.pi * 1.7 * t))
    return _st(crack * 0.7 + rumble, 0.95)


def _zap(seconds=0.6, seed=2) -> np.ndarray:
    n = int(seconds * RATE)
    t = np.arange(n) / RATE
    buzz = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.4 + np.sin(2 * np.pi * 240 * t) * 0.3
    crackle = _noise(n, seed) * (np.random.default_rng(seed).random(n) > 0.985) * 2
    env = np.minimum(1, t * 40) * np.minimum(1, (seconds - t) * 12)
    return _st((buzz + crackle) * env, 0.6)


def _heartbeat() -> np.ndarray:
    n = int(0.5 * RATE)
    t = np.arange(n) / RATE
    def thump(at, f):
        d = np.clip(t - at, 0, None)
        return np.sin(2 * np.pi * f * d) * np.exp(-d * 28) * (t >= at)
    return _st(thump(0, 55) + 0.7 * thump(0.17, 48), 0.95)


def _beep(seconds=0.12, f=1000) -> np.ndarray:
    n = int(seconds * RATE)
    t = np.arange(n) / RATE
    env = np.minimum(1, t * 200) * np.minimum(1, (seconds - t) * 200)
    return _st(np.sin(2 * np.pi * f * t) * env, 0.35)


def _rain(seconds) -> np.ndarray:
    n = int(seconds * RATE)
    x = _noise(n, 9) - _lowpass(_noise(n, 9), 8)
    drops = _noise(n, 10) * (np.random.default_rng(11).random(n) > 0.997) * 3
    env = np.minimum(1, np.arange(n) / RATE * 4) * np.minimum(1, (seconds - np.arange(n) / RATE) * 4)
    return _st((x * 0.6 + drops) * env, 0.5)


def _tick(f=2400, seconds=0.03) -> np.ndarray:
    n = int(seconds * RATE)
    t = np.arange(n) / RATE
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 300) + _noise(n, 3) * np.exp(-t * 500) * 0.4
    return _st(x, 0.5)


def _thud() -> np.ndarray:
    n = int(0.4 * RATE)
    t = np.arange(n) / RATE
    x = np.sin(2 * np.pi * (90 * np.exp(-t * 6) + 40) * t) * np.exp(-t * 14) + _noise(n, 6) * np.exp(-t * 80) * 0.3
    return _st(x, 0.9)


def _swell(seconds=2.0) -> np.ndarray:
    n = int(seconds * RATE)
    t = np.arange(n) / RATE
    f = 38 + 30 * (1 - np.exp(-t * 2))
    x = np.sin(2 * np.pi * np.cumsum(f) / RATE) + 0.4 * np.sin(2 * np.pi * np.cumsum(f * 2.01) / RATE)
    env = np.minimum(1, t / (seconds * 0.6)) * np.minimum(1, (seconds - t) * 3)
    return _st(x * env, 0.8)


def _rumble(seconds=3.0) -> np.ndarray:
    n = int(seconds * RATE)
    t = np.arange(n) / RATE
    x = _lowpass(_lowpass(_noise(n, 12), 120), 120) * 40 + np.sin(2 * np.pi * 32 * t) * 0.5
    env = np.minimum(1, t * 2) * np.minimum(1, (seconds - t) * 2)
    return _st(x * env, 0.8)


def _ping() -> np.ndarray:
    n = int(0.5 * RATE)
    t = np.arange(n) / RATE
    x = np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 9) + 0.3 * np.sin(2 * np.pi * 2640 * t) * np.exp(-t * 12)
    return _st(x, 0.4)


def build_audio(spec: dict, plan: list[dict], work: Path) -> Path:
    total = plan[-1]["end"]
    n = int(total * RATE) + RATE
    voice = np.zeros(n, dtype=np.float32)
    for p in plan:
        pcm = read_pcm(Path(p["wav"]))
        i = int(p["audio_at"] * RATE)
        voice[i:i + len(pcm)] += pcm[: n - i]
    fx = np.zeros((n, 2), dtype=np.float32)

    def place(clip, at, gain):
        i = max(0, int(at * RATE))
        m = min(len(clip), n - i)
        fx[i:i + m] += clip[:m] * gain

    w = whoosh(0.5, seed=7)
    for i, p in enumerate(plan[1:], 1):
        place(w, p["start"] - 0.25, 0.35)
    for p in plan:
        shot = next(s for s in spec["shots"] if s["id"] == p["id"])
        dur = p["end"] - p["start"]
        v = shot["visual"]
        if v.get("crack"):
            times = v["crack"].get("times", 2)
            for k in range(times):  # matches build_character: fist at 0.55 of each cycle
                place(_crack(k), p["start"] + dur * (k + 0.55) / times, 0.55)
        if v.get("bubble"):
            place(_pop(), p["start"] + dur * v["bubble"]["at"] + 2 / spec.get("render", {}).get("fps", 24), 0.8)
        fps = spec.get("render", {}).get("fps", 24)
        if v.get("rain"):
            place(_rain(dur + 0.2), p["start"], 0.25)
        if v.get("bolt"):
            place(_thunder(len(p["id"])), p["start"] + dur * v["bolt"].get("at", 0.3), 0.8)
        if v.get("type") == "crowd":
            place(_thunder(5), p["start"] + dur * v.get("flash_at", 0.45), 0.8)
        if v.get("flashover"):
            a, z = v["flashover"].get("at", (0.1, 0.9))
            place(_zap(dur * (z - a), 4), p["start"] + dur * a, 0.5)
        if v.get("type") == "count":
            n_icons, (s0, s1) = v.get("count", 7), v.get("span", (0.12, 0.8))
            for k in range(n_icons):
                place(_zap(0.18, k), p["start"] + dur * (s0 + (s1 - s0) * k / max(1, n_icons - 1)), 0.5)
        if v.get("heart"):
            hs = v["heart"]
            period = fps * 60 / hs.get("bpm", 80)
            frames = p["frames"]
            for a, b in hs.get("beats", [[0, 1]]):
                f = frames * a + 3
                while f < frames * b:
                    place(_heartbeat(), p["start"] + f / fps, 0.9)
                    place(_beep(), p["start"] + f / fps, 0.5)
                    f += period
            gaps = []  # flat line between active stretches
            edges = sorted(hs.get("beats", [[0, 1]]))
            for (a0, b0), (a1, b1) in zip(edges, edges[1:]):
                gaps.append((b0, a1))
            if edges and edges[-1][1] < 1:
                gaps.append((edges[-1][1], 1.0))
            for g0, g1 in gaps:
                place(_beep(dur * (g1 - g0) * 0.9), p["start"] + dur * g0 + 0.3, 0.35)
        if v.get("drop"):  # matches build_character: apple starts ~2.2 m up, slowed gravity
            g = 9.81 * v["drop"].get("slow", 0.35) ** 2
            t_land = (2 * (2.2 - 0.045) / g) ** 0.5
            place(_thud(), p["start"] + dur * v["drop"].get("at", 0.15) + t_land, 0.8)
        if v.get("type") == "clocks":
            for k, (rate, f) in enumerate(zip(v.get("rates", (1.0, 1.35)), (1800, 2600))):
                t = 0.0
                while t < dur:
                    place(_tick(f), p["start"] + t, 0.45)
                    t += 1 / rate
        if v.get("type") == "gps" and v.get("mode", "signals") == "signals":
            for i in range(3):
                k = int(p["frames"] * 0.1) + i * 5
                while k < p["frames"]:
                    place(_ping(), p["start"] + k / fps, 0.35)
                    k += int(fps * 0.9)
        if v.get("type") == "spacetime" and v.get("mode") in ("sun", "orbits", "blackhole") \
                and not v.get("bent_from_start"):
            a, b = v.get("bend", (0.1, 0.6))
            place(_swell(max(0.8, dur * (b - a) + 0.6)), p["start"] + dur * a, 0.7)
        if v.get("type") == "spacetime" and v.get("mode") == "blackhole":
            place(_rumble(dur), p["start"], 0.5)
        for e in shot.get("sfx", []):
            clip = {"chime": _chime, "pop": _pop, "thunder": _thunder, "zap": _zap, "thud": _thud,
                    "ping": _ping, "swell": _swell, "rumble": _rumble}.get(e["type"])
            if clip:
                place(clip(), p["start"] + dur * e.get("at", 0), e.get("gain", 0.6))
    music = _pad_section(total + 1, mood_family(spec.get("music_mood", "reflective")), seed=11)[:n] * 0.35
    music = np.pad(music, ((0, max(0, n - len(music))), (0, 0)))
    # Simple ducking: lower music where the voice is active.
    env = np.convolve(np.abs(voice), np.ones(4800) / 4800, mode="same")
    duck = 1 - np.clip(env * 25, 0, 0.6)
    mix = music * duck[:, None] + fx + np.stack([voice, voice], 1)
    pre = work / "premix.wav"
    with wave.open(str(pre), "wb") as wv:
        wv.setnchannels(2)
        wv.setsampwidth(2)
        wv.setframerate(RATE)
        wv.writeframes((np.clip(mix[: int(total * RATE)], -1, 1) * 32767).astype(np.int16).tobytes())
    out = work / "mix.wav"
    media.run(["-i", str(pre), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(RATE), str(out)])
    return out


# ------------------------------------------------------------- captions
def word_timings(spec: dict, plan: list[dict]) -> list[dict]:
    words = []
    model = _whisper(spec.get("whisper_model", "base.en"))
    for shot, p in zip(spec["shots"], plan):
        segs, _ = model.transcribe(load_16k(p["wav"]), word_timestamps=True, language="en", beam_size=1)
        heard = [{"word": w.word.strip(), "start": w.start, "end": w.end} for s in segs for w in (s.words or [])]
        timed, sim = align(shot["line"].split(), heard, p["audio_at"], p["seconds"])
        p["narration_match"] = round(sim, 3)
        words += timed
    return words


def write_ass(words: list[dict], path: Path, font: str = "Inter Display", per_cue: int = 2) -> None:
    """Big centred captions, two words at a time, the spoken word in yellow with a pop-in."""
    def ts(t):
        t = max(0.0, t)
        return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
    head = ("[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 2\n\n"
            "[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
            "BackColour, Bold, Alignment, Outline, Shadow, MarginL, MarginR, MarginV\n"
            f"Style: Cap,{font},104,&H00FFFFFF,&H0000E5FF,&H00000000,&H64000000,1,5,9,3,80,80,0\n\n"
            "[Events]\nFormat: Layer, Start, End, Style, Text\n")
    lines = []
    groups = []
    cur: list[dict] = []
    for w in words:
        cur.append(w)
        if len(cur) == per_cue or w["word"][-1:] in ".?!,":
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    for gi, g in enumerate(groups):
        g_end = groups[gi + 1][0]["start"] if gi + 1 < len(groups) else g[-1]["end"] + 0.3
        for k, w in enumerate(g):
            start = w["start"]
            end = g[k + 1]["start"] if k + 1 < len(g) else g_end
            if end - start < 0.05:
                continue
            parts = []
            for j, x in enumerate(g):
                txt = x["word"].upper().replace("{", "").replace("}", "")
                parts.append("{\\c&H00E5FF&}" + txt + "{\\c&HFFFFFF&}" if j == k else txt)
            pop = "{\\fscx112\\fscy112\\t(0,90,\\fscx100\\fscy100)}" if k == 0 else ""
            lines.append(f"Dialogue: 0,{ts(start)},{ts(end)},Cap,{{\\pos(540,1240)}}{pop}{' '.join(parts)}")
    path.write_text(head + "\n".join(lines) + "\n", encoding="utf-8")


def write_srt(words: list[dict], path: Path) -> None:
    from docforge.subtitles import cues_from_words, write_srt as _w
    _w(cues_from_words(words, max_chars=32, max_lines=2, max_seconds=3.5), path)


# ------------------------------------------------------------------ main
def make(spec_path: Path, preview: bool = False, only: set[str] | None = None) -> Path | None:
    spec = json.loads(spec_path.read_text())
    work = spec_path.parent / "build"
    work.mkdir(exist_ok=True)
    bundle = ensure_bundle(spec.get("human_bundle", DEFAULT_BUNDLE))
    voice = narrate(spec, work)
    plan = timeline(spec, voice)
    total = plan[-1]["end"]
    print(f"{len(plan)} shots, {total:.1f}s, {sum(p['frames'] for p in plan)} frames", flush=True)
    render_shots(spec_path, spec, plan, work, bundle, preview, only or set())
    (work / "plan.json").write_text(json.dumps(plan, indent=1, default=str))
    if preview or only:  # a partial render: assemble once every shot is done
        return None
    picture = encode_shots(spec, plan, work)
    audio = build_audio(spec, plan, work)
    words = word_timings(spec, plan)
    (work / "words.json").write_text(json.dumps(words))
    ass = work / "captions.ass"
    write_ass(words, ass, spec.get("caption_font", "Inter Display"))
    final_dir = spec_path.parent / "final"
    final_dir.mkdir(exist_ok=True)
    slug = spec.get("slug", spec_path.parent.name)
    out = final_dir / f"{slug}.mp4"
    media.run(["-i", str(picture), "-i", str(audio), "-vf", f"ass={ass}", "-map", "0:v", "-map", "1:a",
               "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
               "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(out)])
    write_srt(words, final_dir / f"{slug}.srt")
    (work / "plan.json").write_text(json.dumps(plan, indent=1, default=str))
    low = [(p["id"], p["narration_match"]) for p in plan if p.get("narration_match", 1) < 0.8]
    print(f"done: {out} ({media.duration(out):.1f}s); narration check below 80%: {low}", flush=True)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("spec", type=Path)
    ap.add_argument("--preview", action="store_true", help="render first/middle/last frame of each shot only")
    ap.add_argument("--only-shots", default="")
    a = ap.parse_args()
    make(a.spec.resolve(), a.preview, {s for s in a.only_shots.split(",") if s})
    return 0


if __name__ == "__main__":
    sys.exit(main())

