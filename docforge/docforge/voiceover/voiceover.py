"""Stage 6 - voiceover and the master timeline.

Each scene's narration is synthesised to voiceover/<scene>.wav (48 kHz mono),
resumably. The timeline then places scenes back to back with short pauses
(longer at section changes), snapped to whole video frames, and the narration
track voiceover/narration.wav is assembled from it. Every later stage (subtitles,
editing, QC) reads scene["timing"], so picture and voice stay in sync.
"""

from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

from ..project import DONE, FAILED, Project
from .tts import make_tts

RATE = 48000


def speakable(text: str, pronunciations: dict) -> str:
    for written, spoken in (pronunciations or {}).items():
        text = text.replace(written, spoken)
    return text


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as w:
        assert w.getframerate() == RATE and w.getnchannels() == 1, path
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)


def write_wav(path: Path, samples: np.ndarray, rate: int = RATE, channels: int = 1) -> None:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(channels)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(samples.astype(np.int16).tobytes())


def wav_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / w.getframerate()


def build_timeline(project: Project) -> float:
    """Assign scene['timing'] for every scene; returns total length in seconds."""
    g = project.config.get_path
    fps = int(g("project.fps", 30))
    scene_gap = float(g("voiceover.scene_gap_seconds", 0.35))
    section_gap = float(g("voiceover.section_gap_seconds", 0.9))
    min_scene = float(g("planning.min_scene_seconds", 3.0))
    lead_in, tail = 0.6, 2.5

    def snap(t: float) -> float:
        return round(t * fps) / fps

    t = lead_in
    scenes = project.scenes
    for i, scene in enumerate(scenes):
        dur = scene["audio"]["duration"]
        nxt = scenes[i + 1] if i + 1 < len(scenes) else None
        gap = tail if nxt is None else (section_gap if nxt["section"] != scene["section"] else scene_gap)
        start = 0.0 if i == 0 else snap(t)
        audio_start = snap(t)
        end = snap(max(audio_start + dur + gap, start + min_scene))
        scene["timing"] = {"start": start, "end": end, "audio_start": audio_start, "audio_duration": dur}
        t = end
    project.save()
    return scenes[-1]["timing"]["end"] if scenes else 0.0


def assemble_narration(project: Project, total: float) -> Path:
    track = np.zeros(int(total * RATE) + RATE, dtype=np.int16)
    for scene in project.scenes:
        pcm = read_wav(project.path(scene["audio"]["path"]))
        at = int(scene["timing"]["audio_start"] * RATE)
        track[at:at + len(pcm)] = pcm[: max(0, len(track) - at)]
    track = track[: int(total * RATE)]
    out = project.path("voiceover", "narration.wav")
    write_wav(out, track)
    return out


def voice_key(project: Project, text: str) -> str:
    """Identifies what the audio was made from, so changed voice settings re-synthesise it."""
    import hashlib
    g = project.config.get_path
    parts = [text, g("voiceover.provider"), g("voiceover.piper_voice"), g("voiceover.length_scale"),
             g("voiceover.sentence_silence"), g("voiceover.elevenlabs.voice_id")]
    return hashlib.sha1(repr(parts).encode()).hexdigest()[:12]


def run_voiceover(project: Project) -> dict:
    tts = None
    prons = project.config.get_path("voiceover.pronunciations", {}) or {}
    todo = [s for s in project.scenes if project.scene_status(s, "voiceover") != DONE
            or not project.path(s.get("audio", {}).get("path", "missing")).exists()
            or s.get("audio", {}).get("key") != voice_key(project, speakable(s["narration"], prons))]
    for i, scene in enumerate(todo):
        dest = project.path("voiceover", f"{scene['id']}.wav")
        try:
            tts = tts or make_tts(project.config)
            text = speakable(scene["narration"], prons)
            tts.synth(text, dest)
            scene["audio"] = {"path": project.rel(dest), "duration": round(wav_duration(dest), 3),
                              "key": voice_key(project, text)}
            project.mark_scene(scene, "voiceover", DONE)
        except Exception as exc:
            project.mark_scene(scene, "voiceover", FAILED, f"{type(exc).__name__}: {exc}")
            project.log("voiceover", f"{scene['id']}: FAILED {exc}")
        project.set_progress("voiceover", (i + 1) / max(1, len(todo)), scene["id"])
    failed = project.failed_scenes("voiceover")
    if failed:
        raise RuntimeError(f"voiceover failed for {len(failed)} scenes: {[s['id'] for s in failed][:10]}")
    total = build_timeline(project)
    assemble_narration(project, total)
    speech = sum(s["audio"]["duration"] for s in project.scenes)
    words = sum(len(s["narration"].split()) for s in project.scenes)
    wpm = words / (speech / 60) if speech else 0
    target = float(project.config.get_path("project.target_minutes", 0)) * 60
    project.manifest["outputs"].update({"duration_seconds": round(total, 2), "measured_wpm": round(wpm)})
    project.save()
    project.log("voiceover", f"narration assembled: {total / 60:.2f} min (voice speaks {wpm:.0f} wpm; "
                             f"planning assumed {project.config.get_path('planning.words_per_minute')})")
    if target and total < target * float(project.config.get_path("quality_control.min_length_ratio", 0.9)):
        project.log("voiceover", f"WARNING: {total / 60:.1f} min is short of the {target / 60:g} min target. "
                                 "Slow the voice (voiceover.length_scale), lengthen pauses, or add script, "
                                 "then re-run from voiceover.")
    return {"duration": total}
