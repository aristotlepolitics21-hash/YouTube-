# usage: python3 make_music.py STORY_DIR
# Composes an original, royalty-free score that follows the story's shots (build/timeline.json):
# a warm string-like pad, a plucked lyre (Karplus-Strong) and a long hall reverb. Minor and sparse
# for the lonely opening, darker for the flashback, opening into a major key for the ending.
# Writes build/music.wav (48 kHz stereo).
import json, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)
d = sys.argv[1]
tl = json.load(open(f"{d}/build/timeline.json"))
total = tl["total"] + 1.0
N = int(total * SR)
mix = np.zeros((2, N))

NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def hz(n):  # "A3", "C#4"
    pc = NOTE[n[0]] + (1 if "#" in n else -1 if n[1] == "b" else 0)
    return 440 * 2 ** ((pc + 12 * (int(n[-1]) + 1) - 69) / 12)


CH = {  # pad voicings
    "Am": ["A2", "E3", "A3", "C4", "E4"], "F": ["F2", "C3", "F3", "A3", "C4"],
    "C": ["C3", "G3", "C4", "E4", "G4"], "G": ["G2", "D3", "G3", "B3", "D4"],
    "Dm": ["D3", "A3", "D4", "F4", "A4"], "Em": ["E2", "B2", "E3", "G3", "B3"],
    "Fmaj7": ["F2", "C3", "E3", "A3", "C4"], "Gsus": ["G2", "D3", "G3", "C4", "D4"],
}
# per-shot progression (one chord per ~bar, stretched to the shot)
PLAN = {
    "s1_room_night": ["Am", "F", "C", "G"],
    "s2_bakery_dawn": ["Am", "F", "C", "Em"],
    "s3_stairs": ["F", "C", "G", "Am"],
    "s4_room_morning": ["F", "Am", "Dm", "G"],
    "s5_flashback": ["Dm", "Am", "Dm", "Em", "F", "C", "Gsus", "G"],
    "s6_bakery_meet": ["F", "C", "Am", "G"],
    "s7_room_end": ["F", "G", "Am", "Fmaj7", "C"],
}
LYRE = {"s1_room_night": 0.5, "s2_bakery_dawn": 0.8, "s3_stairs": 0.6, "s4_room_morning": 0.9,
        "s5_flashback": 0.45, "s6_bakery_meet": 1.0, "s7_room_end": 1.0}


def add(sig, t0, pan=0.0, gain=1.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    mix[0, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    mix[1, i:i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def pad(freqs, dur):
    n = int((dur + 2.0) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-0.12, 0.0, 0.13):  # detuned saws, softened, sound like a small string section
            ff = f * 2 ** (det / 12)
            ph = rng.random()
            saw = sum(np.sin(2 * np.pi * ff * k * t + ph * k) / k * 0.6 ** (k - 1) for k in range(1, 6))
            s += saw
    env = np.minimum(1, t / 1.6) * np.clip((dur + 2.0 - t) / 2.0, 0, 1)
    vib = 1 + 0.15 * np.sin(2 * np.pi * 0.2 * t)
    return s * env * vib / (len(freqs) * 3)


def pluck(f, dur=3.5, bright=0.5):
    n, p = int(dur * SR), int(SR / f)
    buf = rng.uniform(-1, 1, p)
    buf = np.convolve(buf, [bright, 1 - bright], "same")
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.996 * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * np.minimum(1, np.arange(n) / 30)


for shot in tl["shots"]:
    prog, t0, dur = PLAN[shot["id"]], shot["start"], shot["dur"]
    bar = dur / len(prog)
    for k, name in enumerate(prog):
        add(pad([hz(n) for n in CH[name]], bar), t0 + k * bar, gain=0.55)
        # lyre: a slow broken chord across the upper voices, two passes per bar
        notes = [hz(n) * 2 for n in CH[name][1:]]
        step = bar / 8
        for j in range(8):
            if rng.random() < LYRE[shot["id"]]:
                f = notes[[0, 2, 1, 3, 2, 1, 3, 2][j]]
                add(pluck(f, 3.0, 0.4), t0 + k * bar + j * step + rng.normal(0, 0.015),
                    pan=rng.uniform(-0.5, 0.5), gain=0.22)
    # low bell to mark each new scene
    add(pluck(hz(CH[prog[0]][0]) * 2, 5.0, 0.2), t0, gain=0.25)

# hall reverb: stereo exponentially decaying noise impulse, FFT convolution
ir_n = int(3.2 * SR)
tt = np.arange(ir_n) / SR
wet = np.zeros_like(mix)
for c in range(2):
    ir = rng.normal(0, 1, ir_n) * np.exp(-tt / 0.9)
    ir[: int(0.02 * SR)] = 0
    L = N + ir_n
    nfft = 1 << (L - 1).bit_length()
    wet[c] = np.fft.irfft(np.fft.rfft(mix[c], nfft) * np.fft.rfft(ir, nfft), nfft)[:N]
wet /= np.abs(wet).max() + 1e-9
dry = mix / (np.abs(mix).max() + 1e-9)
out = 0.55 * dry + 0.6 * wet
fade = np.ones(N)
fade[-int(4 * SR):] = np.linspace(1, 0, int(4 * SR))
fade[: int(1.5 * SR)] = np.linspace(0, 1, int(1.5 * SR))
out *= fade
out = out / np.abs(out).max() * 0.8
pcm = (out.T * 32767).astype(np.int16)
with wave.open(f"{d}/build/music.wav", "wb") as w:
    w.setnchannels(2), w.setsampwidth(2), w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"music {total:.1f}s")
