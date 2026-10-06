import json, subprocess, wave, sys
D = "/tmp/claude-0/-home-user-YouTube-/aece8624-b638-5e16-a980-11f89b661b06/scratchpad"
script, outdir, voice = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else "en_US-ryan-high")
SAY = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}
sc = json.load(open(script)); lines = [(si, l[2]) for si, s in enumerate(sc["sections"]) for l in s["lines"]]
import os; os.makedirs(f"{outdir}/vo", exist_ok=True)
params = None; durs = []; caps = []; chapters = []; t = 0.0
out = wave.open(f"{outdir}/narration.wav", "wb")
for i, (si, txt) in enumerate(lines):
    say = txt
    for k, v in SAY.items(): say = say.replace(k, v)
    f = f"{outdir}/vo/{i:03d}.wav"
    subprocess.run([f"{D}/tts/bin/piper", "-m", f"{D}/voices/{voice}.onnx", "--length_scale", "1.1", "--sentence_silence", "0.4", "-f", f], input=say.encode(), check=True, capture_output=True)
    with wave.open(f) as w:
        if params is None: params = w.getparams(); out.setparams(params)
        fr = w.readframes(w.getnframes()); d = w.getnframes() / w.getframerate()
    lead = 1.0 if i == 0 else 0.0
    nxt = lines[i + 1][0] if i + 1 < len(lines) else None
    gap = 3.0 if nxt is None else (1.8 if nxt != si else 0.9)
    if i == 0 or lines[i - 1][0] != si: chapters.append((t, sc["sections"][si]["name"]))
    rate, sw, ch = params.framerate, params.sampwidth, params.nchannels
    sil = lambda s: b"\x00" * (int(round(s * rate)) * sw * ch)
    out.writeframes(sil(lead) + fr + sil(gap)); caps.append((t + lead, t + lead + d, txt)); dur = lead + d + gap; durs.append(dur); t += dur
out.close()
json.dump(durs, open(f"{outdir}/durs.json", "w"))
def ts(x): ms = int(round(x * 1000)); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
open(f"{outdir}/captions.srt", "w").write("\n".join(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{l}\n" for i, (a, b, l) in enumerate(caps)))
open(f"{outdir}/chapters.txt", "w").write("\n".join(f"{int(x // 60)}:{int(x % 60):02d} {n}" for x, n in chapters) + "\n")
print(round(t, 1), "s"); print(open(f"{outdir}/chapters.txt").read())
