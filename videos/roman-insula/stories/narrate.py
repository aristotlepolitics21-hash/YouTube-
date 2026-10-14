# usage: KOKORO_DIR=... python3 narrate.py STORY_DIR
# Voices story.json with Kokoro, then writes into STORY_DIR/build:
#   narration.wav  the whole voiceover, mastered, with unhurried pauses
#   timeline.json  each shot's start and duration, and each line's start, end, text and speaker
# Shot lengths come from the voice, so the Blender render (story_render.py) always fits it.
#
# The voice is "enhanced" in four ways:
#   cast       story.json "cast" gives each speaker a voice (or a weighted blend), speed and pitch;
#              a line is a string (the narrator) or {"say", "as", "pause"}
#   pacing     every sentence is voiced on its own, and "..." becomes a held breath, so the pauses
#              are chosen rather than whatever the model does in one long run
#   mastering  per speaker: pitch, high-pass, de-mud, presence and air EQ, de-esser, gentle compression
#   model      the full-precision Kokoro model when KOKORO_DIR has model_fp32.onnx
# Episode 1's flat {"voice", "rate"} form still works.
import json, os, re, subprocess, sys, wave

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 24000
LEAD, LINE_GAP, SHOT_GAP, TAIL = 0.9, 0.6, 1.2, 3.2
SENT_GAP, BREATH = 0.38, 0.75  # between sentences in a line; at "..."
MASTER = ("highpass=f=75,equalizer=f=280:t=q:w=1.2:g=-2.5,equalizer=f=3200:t=q:w=1.4:g=2.5,"
          "highshelf=f=9500:g=2,deesser=i=0.35,"
          "acompressor=threshold=-22dB:ratio=2.8:attack=8:release=180:makeup=2")

d = sys.argv[1]
story = json.load(open(f"{d}/story.json"))
B = f"{d}/build"
os.makedirs(f"{B}/vo", exist_ok=True)
cast = story.get("cast") or {"narrator": {"voice": story["voice"].split(":", 1)[1], "speed": story["rate"] / 100}}
for c in cast.values():
    c.setdefault("pitch", 1.0)

# lines -> pieces: (shot, line, speaker, text, pause after the piece)
lines, pieces = [], []
for si, shot in enumerate(story["shots"]):
    for raw in shot["lines"]:
        ln = {"say": raw} if isinstance(raw, str) else dict(raw)
        ln.update(shot=si, speaker=ln.get("as", "narrator"))
        li = len(lines)
        lines.append(ln)
        sents = [s for s in re.split(r"(?<=[.!?])\s+", ln["say"].strip()) if s]
        for k, s in enumerate(sents):
            parts = [p.strip() for p in s.split("...") if p.strip()]
            for m, part in enumerate(parts):
                last_part = m == len(parts) - 1
                if not last_part or s.rstrip().endswith("..."):
                    gap = BREATH
                    part = part.rstrip(",") + ("," if not last_part else ".")
                else:
                    gap = SENT_GAP
                pieces.append({"line": li, "text": part, "gap": gap})
        pieces[-1]["gap"] = None  # filled by line/shot gaps below

jobs = []
for i, p in enumerate(pieces):
    c = cast[lines[p["line"]]["speaker"]]
    p["raw"] = f"{B}/vo/{i:03d}.raw.wav"
    jobs.append({"text": p["text"], "voice": c["voice"], "speed": c["speed"], "out": p["raw"], "clause_pause": 0.2})
json.dump(jobs, open(f"{B}/vo/jobs.json", "w"), indent=1)
kd = os.environ["KOKORO_DIR"]
subprocess.run([f"{kd}/venv/bin/python", "-I", os.path.join(HERE, "tts.py"), kd, f"{B}/vo/jobs.json"], check=True)

out = wave.open(f"{B}/narration.wav", "wb")
out.setnchannels(1), out.setsampwidth(2), out.setframerate(SR)
sil = lambda s: b"\x00\x00" * int(round(s * SR))
t = 0.0
shots = [{"id": s["id"], "flashback": s.get("flashback", False), "card": s.get("card"), "mood": s.get("mood"),
          "start": None} for s in story["shots"]]
for i, p in enumerate(pieces):
    ln = lines[p["line"]]
    c = cast[ln["speaker"]]
    f = f"{B}/vo/{i:03d}.wav"
    pitch = (f"asetrate={round(SR * c['pitch'])},aresample={SR},atempo={1 / c['pitch']:.4f},"
             if c["pitch"] != 1.0 else "")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", p["raw"], "-ac", "1", "-af",
                    f"aresample={SR},{pitch}silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
                    f"silenceremove=start_periods=1:start_threshold=-50dB,areverse,{MASTER}", "-ar", str(SR), f],
                   check=True)
    with wave.open(f) as w:
        fr_, dur = w.readframes(w.getnframes()), w.getnframes() / SR
    first_of_line = i == 0 or pieces[i - 1]["line"] != p["line"]
    first_of_shot = first_of_line and (p["line"] == 0 or lines[p["line"] - 1]["shot"] != ln["shot"])
    lead = LEAD if first_of_shot else 0.0
    if first_of_shot:
        shots[ln["shot"]]["start"] = round(t, 3)
    if first_of_line:
        ln["start"] = round(t + lead, 3)
    gap = p["gap"]
    if gap is None:  # end of a line
        nxt = lines[p["line"] + 1] if p["line"] + 1 < len(lines) else None
        gap = TAIL if nxt is None else (SHOT_GAP if nxt["shot"] != ln["shot"] else LINE_GAP)
        gap = max(gap, ln.get("pause", 0))
        ln["end"] = round(t + lead + dur, 3)
    out.writeframes(sil(lead) + fr_ + sil(gap))
    t += lead + dur + gap
out.close()
for k, s in enumerate(shots):
    s["dur"] = round((shots[k + 1]["start"] if k + 1 < len(shots) else t) - s["start"], 3)
caps = [{"shot": ln["shot"], "start": ln["start"], "end": ln["end"], "text": ln["say"], "speaker": ln["speaker"]}
        for ln in lines]
json.dump({"total": round(t, 3), "shots": shots, "lines": caps}, open(f"{B}/timeline.json", "w"), indent=1)
for s in shots:
    print(f'{s["id"]:18s} {s["start"]:6.1f}s  +{s["dur"]:.1f}s')
print(f"total {t:.1f}s")
