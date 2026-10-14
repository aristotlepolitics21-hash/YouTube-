# usage: KOKORO_DIR=... python3 narrate.py STORY_DIR
# Voices story.json line by line with Kokoro, then writes into STORY_DIR/build:
#   narration.wav  the whole voiceover, with unhurried pauses between lines and shots
#   timeline.json  each shot's start and duration, and each line's start and end, in seconds
# Shot lengths come from the voice, so the Blender render (story_render.py) always fits it.
import json, os, subprocess, sys, wave

HERE = os.path.dirname(os.path.abspath(__file__))
SAY = os.path.join(HERE, "..", "..", "tech-shorts", "engine", "kokoro_say.py")
SR = 24000
LEAD, LINE_GAP, SHOT_GAP, TAIL = 0.9, 0.55, 1.1, 3.0

d = sys.argv[1]
story = json.load(open(f"{d}/story.json"))
out_dir = f"{d}/build"
os.makedirs(f"{out_dir}/vo", exist_ok=True)
voice = story["voice"].split(":", 1)[1]
lines = [(si, txt) for si, s in enumerate(story["shots"]) for txt in s["lines"]]
jobs = [[txt, f"{out_dir}/vo/{i:03d}.raw.wav"] for i, (_, txt) in enumerate(lines)]
json.dump(jobs, open(f"{out_dir}/vo/jobs.json", "w"))
kd = os.environ["KOKORO_DIR"]
subprocess.run([f"{kd}/venv/bin/python", "-I", SAY, kd, voice, str(story["rate"] / 100), f"{out_dir}/vo/jobs.json"],
               check=True)

out = wave.open(f"{out_dir}/narration.wav", "wb")
out.setnchannels(1), out.setsampwidth(2), out.setframerate(SR)
sil = lambda s: b"\x00\x00" * int(round(s * SR))
t, caps = 0.0, []
shots = [{"id": s["id"], "flashback": s.get("flashback", False), "start": None} for s in story["shots"]]
for i, (si, txt) in enumerate(lines):
    raw, f = jobs[i][1], f"{out_dir}/vo/{i:03d}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-ac", "1", "-ar", str(SR), "-af",
                    "silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
                    "silenceremove=start_periods=1:start_threshold=-50dB,areverse", f], check=True)
    with wave.open(f) as w:
        fr, dur = w.readframes(w.getnframes()), w.getnframes() / SR
    first_of_shot = i == 0 or lines[i - 1][0] != si
    lead = LEAD if first_of_shot else 0.0
    if first_of_shot:
        shots[si]["start"] = round(t, 3)
    nxt = lines[i + 1][0] if i + 1 < len(lines) else None
    gap = TAIL if nxt is None else (SHOT_GAP if nxt != si else LINE_GAP)
    out.writeframes(sil(lead) + fr + sil(gap))
    caps.append({"shot": si, "start": round(t + lead, 3), "end": round(t + lead + dur, 3), "text": txt})
    t += lead + dur + gap
out.close()
for k, s in enumerate(shots):
    s["dur"] = round((shots[k + 1]["start"] if k + 1 < len(shots) else t) - s["start"], 3)
json.dump({"total": round(t, 3), "shots": shots, "lines": caps}, open(f"{out_dir}/timeline.json", "w"), indent=1)
for s in shots:
    print(f'{s["id"]:18s} {s["start"]:6.1f}s  +{s["dur"]:.1f}s')
print(f"total {t:.1f}s")
