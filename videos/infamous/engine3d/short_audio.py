import json, os, re, subprocess, sys, wave
import numpy as np
from kokoro_onnx import Kokoro
# usage: short_audio.py SHORT.md PLAN.json OUTDIR — voices each scene's VO into its 15-second slot, writes
# word timings for the captions, synthesises a horror sound bed keyed to the shots' edits, and mixes audio.wav.
W = os.environ.get("WORK", "/tmp"); md, plan_path, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(outdir, exist_ok=True); SR = 24000; N = SR * 60
text = open(md).read(); plan = json.load(open(plan_path))
vos = [" ".join(l[2:] for l in b.splitlines()) for b in re.findall(r'\*\*VO \(\d+ words\)\*\*\n((?:> .*\n?)+)', text)]
assert len(vos) == 4, f"{md}: expected 4 VO blocks, found {len(vos)}"
k = Kokoro(f"{W}/voices/kokoro-q8.onnx", f"{W}/voices/voices-v1.0.bin")
say = plan.get("say", {})
vo, words = np.zeros(N, np.float32), []
for si, line in enumerate(vos):
    spoken = line
    for a, b in say.items(): spoken = re.sub(r"\b" + re.escape(a) + r"\b", b, spoken)
    audio, _ = k.create(spoken, voice=plan.get("voice", "bm_george"), speed=float(os.environ.get("SPEED", "1.08")), lang="en-gb")
    audio = np.asarray(audio, np.float32); room = 14.3
    if len(audio) / SR > room:   # speed up just enough to fit, keeping pitch
        f = f"{outdir}/vo{si}.wav"; g = f"{outdir}/vo{si}f.wav"
        with wave.open(f, "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f, "-filter:a", f"atempo={len(audio) / SR / room:.4f}", g], check=True)
        with wave.open(g) as w: audio = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32767
    start = si * 15 + .25; a = int(start * SR); vo[a:a + len(audio)] += audio[:N - a]
    ws = line.split(); wts = np.array([len(re.sub(r"\W", "", x)) + 1.6 + (2.5 if re.search(r"[.?!]$", x) else 1.0 if re.search(r"[,:;]$", x) else 0) for x in ws], float)
    d = len(audio) / SR; edges = start + np.concatenate([[0], np.cumsum(wts)]) / wts.sum() * d
    words += [[si, round(edges[i], 3), round(edges[i + 1], 3), w] for i, w in enumerate(ws)]
json.dump(words, open(f"{outdir}/words.json", "w"))
# ---- sound bed ----
t = np.arange(N) / SR; rnd = np.random.default_rng(7)
def onepole(x, a):   # one-pole low-pass
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a * (x[i] - s); y[i] = s
    return y
noise = rnd.standard_normal(N).astype(np.float32)
rumble = onepole(noise[::8].copy(), .02).repeat(8)[:N] * 3
bed = (.10 * np.sin(2 * np.pi * 41.2 * t) + .06 * np.sin(2 * np.pi * 61.9 * t * (1 + .002 * np.sin(.3 * t))) + .05 * rumble) * (.75 + .25 * np.sin(2 * np.pi * t / 15 - np.pi / 2))
def at(sec, sig):
    a = int(sec * SR); b = min(N, a + len(sig)); bed[a:b] += sig[:b - a]
def boom(amp=.55, dur=1.1):
    n = int(dur * SR); tt = np.arange(n) / SR; f = 70 * np.exp(-tt * 2.2) + 26; return (amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)).astype(np.float32)
def burst(amp=.25, dur=.12, hp=True):
    n = int(dur * SR); x = noise[:n] * np.exp(-np.arange(n) / n * 5); return (amp * (x - onepole(x, .2)) if hp else amp * x).astype(np.float32)
def crackle(amp=.22, dur=.18):
    n = int(dur * SR); x = np.sign(rnd.standard_normal(n)) * (rnd.random(n) < .05); return (amp * x).astype(np.float32)
def whoosh(amp=.2, dur=.7):
    n = int(dur * SR); x = noise[1000:1000 + n]; env = np.sin(np.linspace(0, np.pi, n)) ** 2; y = np.empty(n, np.float32); s = 0.0
    for i in range(n): s += (.01 + .25 * i / n) * (x[i] - s); y[i] = s
    return (amp * 4 * y * env).astype(np.float32)
mute = np.ones(N, np.float32)
for si, sc in enumerate(plan["scenes"]):
    at(si * 15, boom(.6))
    s0 = si * 15
    for sh in sc["shots"]:
        fx = sh.get("fx", [])
        if "punch" in fx: at(s0, boom(.45, .8))
        if "flash" in fx: at(s0, burst(.3))
        if "ramp" in fx: at(s0, whoosh())
        if "shake" in fx: at(s0, (.18 * rumble[:int(sh["d"] * SR)]).astype(np.float32))
        if "glitch" in fx: at(s0 + sh["d"] - .18, crackle())
        if "freeze" in fx: at(s0 + sh["d"] * .72, boom(.5, 1.4))
        if "smash" in fx: a = int((s0 + sh["d"] - .4) * SR); mute[a:a + int(.45 * SR)] = 0
        s0 += sh["d"]
n = int(3.5 * SR); tt = np.arange(n) / SR; at(56, (.12 * (np.sin(2 * np.pi * 110 * tt) + np.sin(2 * np.pi * 111.6 * tt) + .5 * np.sin(2 * np.pi * 220.9 * tt)) * np.exp(-tt * 1.1)).astype(np.float32))
mix = (vo * 1.0 + bed * .55) * mute
mix = mix / max(1e-6, np.abs(mix).max()) * .95
with wave.open(f"{outdir}/audio.wav", "wb") as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("audio", outdir, len(words), "words")
