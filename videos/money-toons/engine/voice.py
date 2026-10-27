# usage: voice.py SCRIPT.json OUTDIR   (needs KOKORO_DIR)
# Voices a multi-character skit: each line is [speaker, beat, spoken text, caption]; script["voices"][speaker] = [voice, speed].
# Writes narration.wav, durs.json, caps.json and captions.srt.
import json, os, subprocess, sys, wave
script, outdir = sys.argv[1], sys.argv[2]
sc = json.load(open(script)); lines = [l for s in sc["sections"] for l in s["lines"]]
os.makedirs(f"{outdir}/vo", exist_ok=True); kd = os.environ["KOKORO_DIR"]
json.dump([[l[2], f"{outdir}/vo/{i:03d}.raw.wav", *sc["voices"][l[0]]] for i, l in enumerate(lines)], open(f"{outdir}/vo/jobs.json", "w"))
subprocess.run([f"{kd}/venv/bin/python", "-I", os.path.join(os.path.dirname(os.path.abspath(__file__)), "say.py"), kd, f"{outdir}/vo/jobs.json"], check=True)
SR = 24000; durs = []; caps = []; t = 0.0
out = wave.open(f"{outdir}/narration.wav", "wb"); out.setnchannels(1); out.setsampwidth(2); out.setframerate(SR)
sil = lambda s: b"\x00\x00" * int(round(s * SR))
for i, l in enumerate(lines):
    raw, f = f"{outdir}/vo/{i:03d}.raw.wav", f"{outdir}/vo/{i:03d}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-ac", "1", "-ar", str(SR), "-af",
        "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse", f], check=True)
    with wave.open(f) as w: fr = w.readframes(w.getnframes()); d = w.getnframes() / SR
    lead = 0.35 if i == 0 else 0.0
    nxt = lines[i + 1] if i + 1 < len(lines) else None
    gap = 2.4 if nxt is None else (0.55 if nxt[1].get("bg") else 0.3)
    out.writeframes(sil(lead) + fr + sil(gap)); caps.append((t + lead, t + lead + d, l[3]))
    durs.append(lead + d + gap); t += lead + d + gap
out.close()
json.dump(durs, open(f"{outdir}/durs.json", "w")); json.dump(caps, open(f"{outdir}/caps.json", "w"))
def ts(x): ms = int(round(x * 1000)); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
open(f"{outdir}/captions.srt", "w").write("\n".join(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{x}\n" for i, (a, b, x) in enumerate(caps)))
print(round(t, 1), "s")
