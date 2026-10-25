"""Stage 7 - subtitles, word timings and a narration check.

whisper aligner: transcribes each scene's audio with word timestamps, then maps
the *script's* words (correct spelling) onto those times. The transcript is also
compared with the script; the similarity is stored per scene for QC, which
catches mispronounced, skipped or garbled lines.

proportional aligner: spreads each scene's words across its audio by length
(no speech model needed, less precise).

Writes subtitles/subtitles.srt and subtitles/words.json.
"""

from __future__ import annotations

import difflib
import json
import re
import subprocess

import numpy as np

from ..project import Project

_model = None


def _whisper(name: str):
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel(name, device="cpu", compute_type="int8")
    return _model


def load_16k(path) -> np.ndarray:
    """Decode with FFmpeg to 16 kHz mono float32 (avoids PyAV version mismatches)."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", "16000",
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


ONES = ("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen "
        "fifteen sixteen seventeen eighteen nineteen").split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def number_words(n: int) -> str:
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else " " + ONES[n % 10])
    if n < 1000:
        return ONES[n // 100] + " hundred" + ("" if n % 100 == 0 else " " + number_words(n % 100))
    for size, name in ((10**9, "billion"), (10**6, "million"), (1000, "thousand")):
        if n >= size:
            rest = n % size
            return number_words(n // size) + f" {name}" + ("" if rest == 0 else " " + number_words(rest))
    return str(n)


def spoken_form(text: str) -> str:
    """Normalise digits, currency and percent signs to words so '$500' matches 'five hundred dollars'."""
    text = re.sub(r"(\d)\s*,\s*(\d{3})", r"\1\2", text)
    text = re.sub(r"\$\s?(\d+(?:\.\d+)?)(?:\s*(billion|million|thousand))?",
                  lambda m: f"{m.group(1)} {m.group(2) + ' ' if m.group(2) else ''}dollars", text)
    text = text.replace("%", " percent")

    def year_or_number(m):
        n = int(m.group(0))
        if 1100 <= n <= 1999 or 2010 <= n <= 2099:  # years are read in pairs
            return f"{number_words(n // 100)} {number_words(n % 100) if n % 100 else 'hundred'}"
        return number_words(n)
    text = re.sub(r"(\d+)\.(\d+)", lambda m: f"{m.group(1)} point {' '.join(m.group(2))}", text)
    return re.sub(r"\d+", year_or_number, text)


def norm(w: str) -> str:
    return re.sub(r"[^a-z0-9]", "", w.lower())


def norm_words(text: str) -> list[str]:
    return [n for n in (norm(w) for w in spoken_form(text).split()) if n]


def proportional(words: list[str], start: float, dur: float) -> list[dict]:
    weights = [max(2, len(w)) for w in words]
    total = sum(weights)
    out, t = [], start
    for w, k in zip(words, weights):
        d = dur * k / total
        out.append({"word": w, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return out


def align(script_words: list[str], heard: list[dict], start: float, dur: float) -> tuple[list[dict], float]:
    """Map script words onto heard word timings. Returns (timed words, similarity)."""
    a = [norm(w) for w in script_words]
    b = [norm(h["word"]) for h in heard]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    # The match score compares spoken forms, so "$500" and "five hundred dollars" agree.
    ratio = difflib.SequenceMatcher(a=norm_words(" ".join(script_words)),
                                    b=norm_words(" ".join(h["word"] for h in heard)), autojunk=False).ratio()
    times: list[tuple[float, float] | None] = [None] * len(script_words)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal" or (op == "replace" and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                h = heard[j1 + k]
                times[i1 + k] = (start + h["start"], start + h["end"])
    # Interpolate words the recogniser missed between their known neighbours.
    known = [i for i, t in enumerate(times) if t]
    if not known:
        return proportional(script_words, start, dur), ratio
    for i in range(len(times)):
        if times[i]:
            continue
        prev = max((k for k in known if k < i), default=None)
        nxt = min((k for k in known if k > i), default=None)
        t0 = times[prev][1] if prev is not None else start
        t1 = times[nxt][0] if nxt is not None else start + dur
        gap_words = (nxt if nxt is not None else len(times)) - (prev if prev is not None else -1) - 1
        pos = i - (prev if prev is not None else -1) - 1
        step = (t1 - t0) / max(1, gap_words)
        times[i] = (t0 + step * pos, t0 + step * (pos + 1))
    return ([{"word": w, "start": round(t[0], 3), "end": round(t[1], 3)} for w, t in zip(script_words, times)],
            ratio)


def srt_time(t: float) -> str:
    ms = int(round(max(0.0, t) * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def cues_from_words(words: list[dict], max_chars: int = 42, max_lines: int = 2,
                    max_seconds: float = 6.0) -> list[dict]:
    """Group timed words into readable cues, breaking at punctuation where possible."""
    cues, cur = [], []
    limit = max_chars * max_lines

    def flush():
        if cur:
            text = " ".join(w["word"] for w in cur)
            cues.append({"start": cur[0]["start"], "end": cur[-1]["end"], "text": text})
            cur.clear()

    for w in words:
        trial = " ".join(x["word"] for x in cur + [w])
        if cur and (len(trial) > limit or w["end"] - cur[0]["start"] > max_seconds
                    or w["start"] - cur[-1]["end"] > 0.6):
            flush()
        cur.append(w)
        if re.search(r"[.?!]$", w["word"]) or (re.search(r"[,;:]$", w["word"]) and len(trial) > limit * 0.6):
            flush()
    flush()
    for c in cues:  # wrap into lines
        lines, line = [], ""
        for word in c["text"].split():
            if line and len(line) + 1 + len(word) > max_chars:
                lines.append(line)
                line = word
            else:
                line = f"{line} {word}".strip()
        lines.append(line)
        c["text"] = "\n".join(lines)
        c["end"] = max(c["end"], c["start"] + 0.8)
    for a, b in zip(cues, cues[1:]):  # no overlaps
        a["end"] = min(a["end"], b["start"] - 0.01)
    return cues


def write_srt(cues: list[dict], path) -> None:
    path.write_text("\n".join(f"{i}\n{srt_time(c['start'])} --> {srt_time(c['end'])}\n{c['text']}\n"
                              for i, c in enumerate(cues, 1)), encoding="utf-8")


def run_subtitles(project: Project) -> dict:
    g = project.config.get_path
    use_whisper = g("subtitles.aligner") == "whisper"
    all_words, sims = [], {}
    for i, scene in enumerate(project.scenes):
        words = scene["narration"].split()
        start = scene["timing"]["audio_start"]
        dur = scene["timing"]["audio_duration"]
        if use_whisper:
            segments, _ = _whisper(g("subtitles.whisper_model")).transcribe(
                load_16k(project.path(scene["audio"]["path"])), word_timestamps=True, language="en",
                beam_size=1, vad_filter=False)  # no script prompt: the check must hear, not read
            heard = [{"word": w.word.strip(), "start": w.start, "end": w.end}
                     for seg in segments for w in (seg.words or [])]
            timed, sim = align(words, heard, start, dur)
            scene["transcript"] = " ".join(h["word"] for h in heard)
            scene["narration_match"] = round(sim, 3)
            sims[scene["id"]] = sim
        else:
            timed = proportional(words, start, dur)
        for w in timed:
            w["scene"] = scene["id"]
        all_words += timed
        project.set_progress("subtitles", (i + 1) / len(project.scenes), scene["id"])
    cues = cues_from_words(all_words, int(g("subtitles.max_chars_per_line", 42)), int(g("subtitles.max_lines", 2)))
    write_srt(cues, project.path("subtitles", "subtitles.srt"))
    project.path("subtitles", "words.json").write_text(json.dumps(all_words))
    project.save()
    low = [k for k, v in sims.items() if v < float(g("quality_control.narration_match_min", 0.8))]
    project.log("subtitles", f"{len(cues)} cues" + (f"; {len(low)} scenes below narration-match threshold"
                                                    if use_whisper else ""))
    return {"cues": len(cues), "low_match": low}
