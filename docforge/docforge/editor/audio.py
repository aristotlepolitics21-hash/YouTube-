"""Music bed, sound effects and the final audio mix.

Music: tracks from editor.music.library_dir (files named <mood>_anything.mp3/wav)
are looped per section; if none fits, a procedural ambient pad is synthesised
(a placeholder: it is calm and unobtrusive, but licensed music will sound better).

SFX: a soft whoosh at each section change (procedural unless a library file named
whoosh* exists), plus per-scene effects from the library matched by name.

Mix: narration on top; music ducked under it with a sidechain compressor; then a
two-pass EBU R128 loudness normalisation to the configured LUFS and true peak.
"""

from __future__ import annotations

import json
import random
import re
import wave
from pathlib import Path

import numpy as np

from .. import media
from ..project import Project

RATE = 48000
AUDIO_EXT = (".mp3", ".wav", ".flac", ".ogg", ".m4a")

# Chord progressions (semitones from A2 = 110 Hz) per mood family.
PROGRESSIONS = {
    "tense": [[0, 3, 7, 10], [-4, 0, 3, 7], [-2, 2, 5, 9], [-5, -1, 2, 7]],
    "hopeful": [[0, 4, 7, 11], [5, 9, 12, 16], [-3, 0, 4, 7], [7, 11, 14, 17]],
    "reflective": [[0, 5, 7, 12], [-2, 3, 7, 10], [-4, 0, 5, 7], [-5, 0, 2, 7]],
    "epic": [[0, 7, 12, 16], [-4, 3, 8, 12], [-2, 5, 10, 14], [-5, 2, 7, 11]],
}
MOOD_WORDS = {
    "tense": "tense dark suspense danger crisis war uncertain ominous anguish struggle",
    "hopeful": "hopeful uplifting optimistic bright triumphant growth progress inspiring warm",
    "epic": "epic grand powerful ambitious soaring momentous",
}


def mood_family(mood: str) -> str:
    words = set(re.findall(r"[a-z]+", (mood or "").lower()))
    for fam, vocab in MOOD_WORDS.items():
        if words & set(vocab.split()):
            return fam
    return "reflective"


def _pad_section(seconds: float, family: str, seed: int) -> np.ndarray:
    """Slow evolving chord pad, stereo float32 in [-1, 1]."""
    rng = random.Random(seed)
    n = int(seconds * RATE)
    t = np.arange(n, dtype=np.float32) / RATE
    out = np.zeros((n, 2), dtype=np.float32)
    prog = PROGRESSIONS[family]
    chord_len = 8.0
    base = 110.0
    n_chords = int(np.ceil(seconds / chord_len)) + 1
    for c in range(n_chords):
        chord = prog[(c + seed) % len(prog)]
        c0 = c * chord_len - 1.5  # overlap neighbouring chords for smooth changes
        i0, i1 = max(0, int(c0 * RATE)), min(n, int((c0 + chord_len + 3.0) * RATE))
        if i1 <= i0:
            continue
        tt = t[i0:i1] - c0
        env = np.minimum(1.0, tt / 2.5) * np.minimum(1.0, np.maximum(0.0, (chord_len + 3.0 - tt) / 2.5))
        for k, semi in enumerate(chord):
            f = base * 2 ** (semi / 12)
            for ch, det in ((0, -0.15), (1, 0.15)):
                ph = rng.random() * 6.283
                wave_ = (np.sin(2 * np.pi * (f + det) * tt + ph) * 0.6
                         + np.sin(2 * np.pi * (f * 2 + det) * tt + ph) * 0.12)
                out[i0:i1, ch] += wave_ * env * (0.16 if k == 0 else 0.1)
    # Slow "breathing" swell.
    out *= (0.85 + 0.15 * np.sin(2 * np.pi * t / 23.0))[:, None]
    peak = np.abs(out).max() or 1.0
    return out / peak * 0.5


def whoosh(seconds: float = 1.2, seed: int = 1) -> np.ndarray:
    rng = np.random.default_rng(seed)
    n = int(seconds * RATE)
    noise = rng.standard_normal(n).astype(np.float32)
    t = np.linspace(0, 1, n, dtype=np.float32)
    # Rising-then-falling band: a moving average whose window shrinks then grows.
    out = np.zeros(n, dtype=np.float32)
    cs = np.cumsum(np.concatenate([[0], noise]))
    for i in range(n):
        w = int(40 - 34 * np.sin(np.pi * t[i]))
        j0 = max(0, i - w)
        out[i] = (cs[i + 1] - cs[j0]) / (i + 1 - j0)
    env = np.sin(np.pi * t) ** 2
    out = out * env
    out /= np.abs(out).max() or 1
    return np.stack([out * 0.9, out * 0.7], axis=1) * 0.6


def _write_stereo(path: Path, data: np.ndarray) -> None:
    pcm = np.clip(data, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes((pcm * 32767).astype(np.int16).tobytes())


def _library(dir_: str) -> list[Path]:
    if not dir_:
        return []
    root = Path(dir_).expanduser()
    return sorted(p for p in root.glob("**/*") if p.suffix.lower() in AUDIO_EXT) if root.exists() else []


def sections_with_moods(project: Project) -> list[dict]:
    out = []
    for s in project.scenes:
        if not out or out[-1]["section"] != s["section"]:
            out.append({"section": s["section"], "start": s["timing"]["start"], "moods": []})
        out[-1]["end"] = s["timing"]["end"]
        if s.get("music_mood"):
            out[-1]["moods"].append(s["music_mood"])
    for sec in out:
        fams = [mood_family(m) for m in sec["moods"]] or ["reflective"]
        sec["family"] = max(set(fams), key=fams.count)
    return out


def build_music(project: Project, total: float) -> Path:
    g = project.config.get_path
    out = project.path("music", "bed.wav")
    sections = sections_with_moods(project)
    tracks = _library(g("editor.music.library_dir", ""))
    if tracks:
        # Concatenate one looped track per section, chosen by mood family in the filename.
        parts = []
        for i, sec in enumerate(sections):
            pick = [t for t in tracks if t.name.lower().startswith(sec["family"])] or tracks
            src = pick[i % len(pick)]
            seg = project.path("music", f"sec_{i:02d}.wav")
            media.run(["-stream_loop", "-1", "-i", str(src), "-t", f"{sec['end'] - sec['start']:.3f}",
                       "-af", "afade=t=in:d=1.5,areverse,afade=t=in:d=2.5,areverse",
                       "-ac", "2", "-ar", str(RATE), str(seg)])
            parts.append(seg)
        lst = project.path("music", "list.txt")
        lst.write_text("".join(f"file '{p}'\n" for p in parts))
        media.run(["-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(out)])
        project.manifest["outputs"]["music"] = [str(p) for p in tracks]
        return out
    if not g("editor.music.procedural_fallback", True):
        _write_stereo(out, np.zeros((int(total * RATE), 2), dtype=np.float32))
        return out
    bed = np.zeros((int(total * RATE) + RATE, 2), dtype=np.float32)
    xf = int(3.0 * RATE)
    for i, sec in enumerate(sections):
        a = int(sec["start"] * RATE)
        length = sec["end"] - sec["start"] + (3.0 if i + 1 < len(sections) else 0)
        pad = _pad_section(length, sec["family"], seed=i)
        if i > 0:
            ramp = np.linspace(0, 1, min(xf, len(pad)), dtype=np.float32)[:, None]
            pad[: len(ramp)] *= ramp
        if i + 1 < len(sections):
            ramp = np.linspace(1, 0, min(xf, len(pad)), dtype=np.float32)[:, None]
            pad[-len(ramp):] *= ramp
        bed[a:a + len(pad)] += pad[: len(bed) - a]
    _write_stereo(out, bed[: int(total * RATE)])
    project.manifest["outputs"]["music"] = "procedural ambient pad (placeholder)"
    return out


def build_sfx(project: Project, total: float) -> Path:
    g = project.config.get_path
    out = project.path("sfx", "sfx.wav")
    track = np.zeros((int(total * RATE) + RATE, 2), dtype=np.float32)
    lib = _library(g("editor.sfx.library_dir", ""))
    events = []
    if g("editor.sfx.whoosh_on_section_change", True):
        for sec in sections_with_moods(project)[1:]:
            events.append((sec["start"] - 0.6, "whoosh"))
    for s in project.scenes:
        for name in s.get("sfx", []):
            events.append((s["timing"]["start"], name))
    used = []
    for at, name in events:
        clip = None
        match = [p for p in lib if name.lower().split()[0] in p.stem.lower()] if name else []
        if match:
            tmp = project.path("sfx", "_tmp.wav")
            media.run(["-i", str(match[0]), "-ac", "2", "-ar", str(RATE), "-t", "6", str(tmp)])
            with wave.open(str(tmp), "rb") as w:
                clip = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2) / 32767.0
        elif name == "whoosh" and g("editor.sfx.procedural_fallback", True):
            clip = whoosh()
        if clip is None:
            continue
        i = max(0, int(at * RATE))
        n = min(len(clip), len(track) - i)
        track[i:i + n] += clip[:n].astype(np.float32)
        used.append({"at": round(at, 2), "sfx": name})
    _write_stereo(out, track[: int(total * RATE)])
    project.manifest["outputs"]["sfx_events"] = used
    return out


def mix(project: Project, narration: Path, music: Path, sfx: Path, out: Path, total: float) -> Path:
    g = project.config.get_path
    music_db = float(g("editor.music.volume_db", -20))
    duck = float(g("editor.music.duck_db", 10))
    sfx_db = float(g("editor.sfx.volume_db", -18))
    lufs, tp = float(g("editor.target_lufs", -14)), float(g("editor.true_peak_db", -1.5))
    ratio = max(2.0, 10 ** (duck / 20) * 2)
    graph = (
        f"[0:a]aformat=channel_layouts=stereo,asplit=2[narr][key];"
        f"[1:a]volume={music_db}dB[mus];"
        f"[mus][key]sidechaincompress=threshold=0.015:ratio={ratio:.1f}:attack=40:release=600:makeup=1[ducked];"
        f"[2:a]volume={sfx_db}dB[fx];"
        f"[narr][ducked][fx]amix=inputs=3:duration=first:normalize=0[mix]"
    )
    pre = out.with_name("premix.wav")
    media.run(["-i", str(narration), "-i", str(music), "-i", str(sfx), "-filter_complex", graph,
               "-map", "[mix]", "-t", f"{total:.3f}", "-ar", str(RATE), str(pre)])
    # Two-pass loudness normalisation.
    stats = media.analyze(pre, f"loudnorm=I={lufs}:TP={tp}:LRA=11:print_format=json")
    m = re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", stats, re.S)
    if m:
        d = json.loads(m.group(0))
        ln = (f"loudnorm=I={lufs}:TP={tp}:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:"
              f"measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
    else:
        ln = f"loudnorm=I={lufs}:TP={tp}:LRA=11"
    media.run(["-i", str(pre), "-af", ln, "-ar", str(RATE), "-t", f"{total:.3f}", str(out)])
    pre.unlink(missing_ok=True)
    return out
