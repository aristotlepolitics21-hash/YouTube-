import json, os, re, sys, wave
import numpy as np
from kokoro_onnx import Kokoro
# usage: voice.py SCRIPT OUTDIR [VOICE]   models in $WORK/voices
W = os.environ.get("WORK", "/tmp"); script, outdir = sys.argv[1], sys.argv[2]; voice = sys.argv[3] if len(sys.argv) > 3 else "bm_george"
sc = json.load(open(script)); SAY = sc.get("say", {}); lines = [(si, l[2]) for si, s in enumerate(sc["sections"]) for l in s["lines"]]
k = Kokoro(f"{W}/voices/kokoro-q8.onnx", f"{W}/voices/voices-v1.0.bin"); os.makedirs(outdir, exist_ok=True)
SR = 24000; out = wave.open(f"{outdir}/narration.wav", "wb"); out.setnchannels(1); out.setsampwidth(2); out.setframerate(SR)
durs, caps, chapters, t = [], [], [], 0.0
for i, (si, txt) in enumerate(lines):
    say = txt
    for a, b in SAY.items(): say = re.sub(r"\b" + re.escape(a) + r"\b", b, say)
    audio, sr = k.create(say, voice=voice, speed=float(os.environ.get("SPEED", "0.95")), lang="en-gb" if voice[0] == "b" else "en-us")
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes(); d = len(audio) / SR
    lead = 1.0 if i == 0 else 0.0; nxt = lines[i + 1][0] if i + 1 < len(lines) else None
    gap = 3.0 if nxt is None else (2.2 if nxt != si else 1.1)
    if i == 0 or lines[i - 1][0] != si: chapters.append((t, sc["sections"][si]["name"]))
    sil = lambda s: b"\x00\x00" * int(round(s * SR))
    out.writeframes(sil(lead) + pcm + sil(gap)); caps.append((t + lead, t + lead + d, txt)); dur = lead + d + gap; durs.append(dur); t += dur
out.close(); json.dump(durs, open(f"{outdir}/durs.json", "w"))
def ts(x): ms = int(round(x * 1000)); return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"
open(f"{outdir}/captions.srt", "w").write("\n".join(f"{i + 1}\n{ts(a)} --> {ts(b)}\n{l}\n" for i, (a, b, l) in enumerate(caps)))
open(f"{outdir}/chapters.txt", "w").write("\n".join(f"{int(x // 60)}:{int(x % 60):02d} {n}" for x, n in chapters) + "\n")
print(round(t, 1), "s"); print(open(f"{outdir}/chapters.txt").read())
