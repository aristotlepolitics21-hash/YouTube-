# usage: voice.py SCRIPT.json OUTDIR [rhvoice-profile] [rate%]
# Voices each line with RHVoice (offline), writes narration.wav, durs.json, captions.srt, chapters.txt.
import json, os, subprocess, sys, wave
script, outdir = sys.argv[1], sys.argv[2]
voice = sys.argv[3] if len(sys.argv) > 3 else "slt"
rate = sys.argv[4] if len(sys.argv) > 4 else "100"
sc = json.load(open(script)); lines = [(si, l[2]) for si, s in enumerate(sc["sections"]) for l in s["lines"]]
os.makedirs(f"{outdir}/vo", exist_ok=True)
SR = 24000; durs = []; caps = []; chapters = []; t = 0.0
out = wave.open(f"{outdir}/narration.wav", "wb"); out.setnchannels(1); out.setsampwidth(2); out.setframerate(SR)
sil = lambda s: b"\x00\x00" * int(round(s * SR))
for i, (si, txt) in enumerate(lines):
    raw, f = f"{outdir}/vo/{i:03d}.raw.wav", f"{outdir}/vo/{i:03d}.wav"
    subprocess.run(["RHVoice-test", "-p", voice, "-r", rate, "-o", raw], input=txt.encode(), check=True, capture_output=True)
    # resample to a fixed rate and trim leading/trailing silence so timings are tight
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-ac", "1", "-ar", str(SR), "-af",
        "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse", f], check=True)
    with wave.open(f) as w: fr = w.readframes(w.getnframes()); d = w.getnframes() / SR
    lead = 0.4 if i == 0 else 0.0
    nxt = lines[i + 1][0] if i + 1 < len(lines) else None
    gap = 1.6 if nxt is None else (0.7 if nxt != si else 0.35)
    if i == 0 or lines[i - 1][0] != si: chapters.append((t, sc["sections"][si]["name"]))
    out.writeframes(sil(lead) + fr + sil(gap)); caps.append((t + lead, t + lead + d, txt))
    durs.append(lead + d + gap); t += lead + d + gap
out.close()
json.dump(durs, open(f"{outdir}/durs.json", "w")); json.dump(caps, open(f"{outdir}/caps.json", "w"))
def ts(x): ms = int(round(x * 1000)); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
open(f"{outdir}/captions.srt", "w").write("\n".join(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{l}\n" for i, (a, b, l) in enumerate(caps)))
open(f"{outdir}/chapters.txt", "w").write("\n".join(f"{int(x // 60)}:{int(x % 60):02d} {n}" for x, n in chapters) + "\n")
print(round(t, 1), "s")
