"""Sound for the episodes: Kokoro narration, a generated cinematic music bed, stereo sound
effects, and a mastering pass (voice EQ + compression, music ducked under the voice,
loudness normalised to -14 LUFS for YouTube)."""
import json, pathlib, subprocess, wave
import numpy as np
from scipy import signal

SR = 48000
ROOT = pathlib.Path(__file__).resolve().parent
KOKORO = ROOT.parent / 'voices' / 'kokoro'
_kokoro = None


def kokoro_tts(text, voice, path, speed=1.0):
    """Mono float32 at SR, cached as a wav at path."""
    if not path.exists():
        global _kokoro
        if _kokoro is None:
            from kokoro_onnx import Kokoro
            _kokoro = Kokoro(str(KOKORO / 'kokoro-v1.0.onnx'), str(KOKORO / 'voices-v1.0.bin'))
        a, sr = _kokoro.create(text, voice=voice, speed=speed, lang='en-us')
        write_wav(path, a, sr)
    return read_wav(path)


def read_wav(path):
    with wave.open(str(path)) as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
    if ch > 1: x = x.reshape(-1, ch).mean(axis=1)
    if sr != SR:
        g = np.gcd(sr, SR); x = signal.resample_poly(x, SR // g, sr // g)
    return x.astype(np.float32)


def write_wav(path, x, sr=SR):
    x = np.asarray(x, dtype=np.float32)
    ch = 1 if x.ndim == 1 else x.shape[1]
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


# ---------- building blocks ----------
def t_(dur): return np.arange(int(dur * SR)) / SR
def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def lp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, f0, f1, order=2): return signal.sosfilt(signal.butter(order, [f0, f1], 'band', fs=SR, output='sos'), x, axis=0)
def pan(x, p):  # p -1 (left) .. 1 (right), constant power; p may be an array
    a = (np.asarray(p) + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def saw(f, t, phase=0.0):
    return 2 * ((f * t + phase) % 1.0) - 1


def reverb(x, decay=2.6, mix=0.3, seed=7, pre=0.02):
    """Stereo convolution reverb with a decaying-noise impulse response."""
    rng = np.random.default_rng(seed); n = int(decay * SR)
    tt = np.arange(n) / SR; env = np.exp(-tt * 6.9 / decay)
    ir = np.stack([lp(rng.standard_normal(n), 6000) * env, lp(rng.standard_normal(n), 6000) * env], axis=1)
    ir[: int(pre * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(axis=0))
    if x.ndim == 1: x = np.stack([x, x], axis=1)
    wet = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x * (1 - mix) + wet * mix * 3.0


# ---------- music ----------
PROGS = [  # minor-key progressions, semitones from the tonic, as triads (root, third, fifth) + colour
    [(0, 3, 7, 10), (-4, 0, 3, 7), (-7, -3, 0, 5), (-2, 2, 5, 9)],     # i  VI  iv  VII
    [(0, 3, 7, 14), (-5, -2, 2, 7), (-4, 0, 3, 10), (-7, -4, 0, 3)],    # i  v  VI  iv
    [(0, 3, 7, 10), (-2, 2, 5, 12), (-4, 0, 3, 7), (-5, -1, 2, 7)],     # i  VII  VI  V
]


def music_score(total, seed=0, bpm=96, cues=()):
    """Stereo music bed: warm detuned-saw pad, sub bass, soft pulse, a glassy arpeggio and reverb.
    It builds after the hook and thins out at the end. cues = times (s) for a soft hit."""
    rng = np.random.default_rng(seed)
    tonic = 45 + int(rng.integers(0, 7))      # A2..D#3
    prog = PROGS[seed % len(PROGS)]
    n = int((total + 0.5) * SR); t = np.arange(n) / SR
    beat = 60 / bpm; bar = beat * 4; span = bar * 2   # each chord lasts two bars
    pad = np.zeros((n, 2)); bass = np.zeros(n); arp = np.zeros((n, 2)); perc = np.zeros((n, 2))
    k = 0
    while k * span < total + span:
        ch = prog[k % len(prog)]; s0 = k * span - 0.4
        i0, i1 = max(0, int(s0 * SR)), min(n, int((s0 + span + 1.2) * SR))
        if i0 < i1:
            tt = t[i0:i1] - s0
            env = np.clip(tt / 0.8, 0, 1) * np.clip((span + 1.2 - tt) / 0.8, 0, 1)
            for j, iv in enumerate(ch):
                f = midi(tonic + 12 + iv)
                for c, det in enumerate((-0.07, 0.07)):
                    v = sum(saw(f * 2 ** ((det + d) / 12), tt, rng.random()) for d in (-0.06, 0.0, 0.06))
                    pad[i0:i1, c] += v * env * (0.9 if j < 3 else 0.5)
            fb = midi(tonic - 12 + ch[0])
            bass[i0:i1] += np.sin(2 * np.pi * fb * tt) * env + 0.3 * np.sin(2 * np.pi * fb * 2 * tt) * env
        k += 1
    # pad: low-pass that opens slowly over the episode
    pad = lp(pad, 900, 2) * 0.8 + lp(pad, 2600, 2) * 0.2 * np.clip(t / total, 0, 1)[:, None]
    pad *= (0.85 + 0.15 * np.sin(2 * np.pi * t / (span * 2)))[:, None]
    # arpeggio: chord tones in 8ths, two octaves up, bell-ish (sine + soft 3rd harmonic), ping-pong pan
    step = beat / 2; m = 0
    while m * step < total:
        s0 = m * step; ch = prog[int(s0 // span) % len(prog)]
        note = tonic + 24 + ch[[0, 1, 2, 3, 2, 1][m % 6]] + (12 if m % 12 == 9 else 0)
        i0 = int(s0 * SR); L = min(n - i0, int(1.2 * SR))
        if L > 0:
            tt = np.arange(L) / SR; f = midi(note)
            v = (np.sin(2 * np.pi * f * tt) + 0.15 * np.sin(2 * np.pi * f * 3 * tt)) * np.exp(-tt * 5) * (1 - np.exp(-tt * 400))
            arp[i0:i0 + L] += pan(v, 0.55 if m % 2 else -0.55)
        m += 1
    # pulse: soft kick on each beat + filtered hats on the off-beats
    kick_t = t_(0.35); kick = np.sin(2 * np.pi * (48 + 90 * np.exp(-kick_t * 30)) * kick_t) * np.exp(-kick_t * 9)
    hat_t = t_(0.08); hat = hp(rng.standard_normal(len(hat_t)), 7000) * np.exp(-hat_t * 60)
    b = 0
    while b * beat < total:
        i0 = int(b * beat * SR)
        L = min(n - i0, len(kick)); perc[i0:i0 + L] += kick[:L, None] * 0.9
        j0 = int((b + 0.5) * beat * SR); L = min(n - j0, len(hat))
        if L > 0: perc[j0:j0 + L] += pan(hat[:L], 0.3 if b % 2 else -0.3) * 0.25
        b += 1
    # arrangement: pad + bass from the start; arp after the hook; pulse a little later; thin out at the end
    hook = min(3.0, total * 0.1)
    def ramp(a, b_): return np.clip((t - a) / max(1e-3, b_ - a), 0, 1)
    out_env = np.clip((total - t) / 2.0, 0, 1)
    mix = pad * 0.16 + bass[:, None] * 0.22
    mix += arp * 0.07 * ramp(hook, hook + 2)[:, None]
    mix += perc * 0.16 * ramp(hook + 1, hook + 4)[:, None] * np.clip((total - 3.0 - t) / 1.0, 0, 1)[:, None]
    for c in cues:  # soft hits: sub drop + reverse-swell noise
        i0 = int(max(0, c - 0.6) * SR); tt = t_(2.2); L = min(n - i0, len(tt))
        if L <= 0: continue
        sub = np.sin(2 * np.pi * (38 + 40 * np.exp(-tt * 6)) * tt) * np.exp(-np.maximum(0, tt - 0.6) * 2.5) * (tt > 0.6)
        sw = bp(rng.standard_normal(len(tt)), 300, 5000) * np.clip(tt / 0.6, 0, 1) ** 3 * (tt < 0.6)
        mix[i0:i0 + L] += (sub[:L, None] * 0.5 + pan(sw[:L], 0) * 0.12)
    mix = reverb(mix, decay=3.0, mix=0.32) * out_env[:, None]
    return (mix / (np.abs(mix).max() + 1e-9)).astype(np.float32)


# ---------- stereo sound effects ----------
def sfx_whoosh(dur=0.42, seed=2, direction=1):
    rng = np.random.default_rng(seed); tt = t_(dur); u = tt / dur
    x = rng.standard_normal(len(tt))
    lo, hi = bp(x, 200, 1200), bp(x, 1500, 7000)
    body = lo * (1 - u) + hi * u                       # rising sweep
    env = np.sin(np.pi * np.clip(u, 0, 1)) ** 2 * (1 - 0.3 * u)
    return (pan(body * env * 2.2, direction * (u * 1.4 - 0.7))).astype(np.float32)


def sfx_pop():
    tt = t_(0.35); rng = np.random.default_rng(1)
    thump = np.sin(2 * np.pi * (140 * np.exp(-tt * 18) + 45) * tt) * np.exp(-tt * 14)
    click = hp(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 160)
    return pan(0.9 * thump + 0.5 * click, 0).astype(np.float32)


def sfx_boom():
    tt = t_(2.5); rng = np.random.default_rng(3)
    rumble = lp(rng.standard_normal(len(tt)), 180, 4) * 4
    sub = np.sin(2 * np.pi * (60 * np.exp(-tt * 2) + 28) * tt)
    x = (0.8 * sub + rumble) * np.exp(-tt * 1.6)
    return reverb(x, 2.0, 0.2).astype(np.float32)


def sfx_impact():
    """Hook hit: a sub thump with a bright transient and a short tail."""
    tt = t_(1.6); rng = np.random.default_rng(5)
    sub = np.sin(2 * np.pi * (45 + 80 * np.exp(-tt * 12)) * tt) * np.exp(-tt * 3.0)
    snap = bp(rng.standard_normal(len(tt)), 800, 9000) * np.exp(-tt * 40)
    return reverb(0.9 * sub + 0.35 * snap, 2.2, 0.3).astype(np.float32)


# ---------- mastering ----------
VOICE_CHAIN = ('highpass=f=80,equalizer=f=220:t=q:w=1.0:g=1.5,equalizer=f=3300:t=q:w=1.2:g=2.5,'
               'treble=g=2:f=9000,deesser=i=0.35,'
               'acompressor=threshold=0.07:ratio=3:attack=5:release=90:makeup=1.8')


def master(voice, music, fx, out, workdir, music_gain=0.2, lufs=-14.0):
    """voice: mono; music, fx: stereo (all at SR, same length). Writes a stereo wav at out."""
    workdir = pathlib.Path(workdir)
    v = voice / (np.abs(voice).max() + 1e-9) * 0.5
    vrms = np.sqrt(np.mean(v[np.abs(v) > 0.01] ** 2)) if np.any(np.abs(v) > 0.01) else 0.1
    mrms = np.sqrt(np.mean(music ** 2)) + 1e-9
    m = music * (vrms * music_gain / mrms)
    paths = [workdir / 'stem_voice.wav', workdir / 'stem_music.wav', workdir / 'stem_fx.wav']
    write_wav(paths[0], v); write_wav(paths[1], np.clip(m, -1, 1)); write_wav(paths[2], np.clip(fx * 0.5, -1, 1))
    graph = (f'[0:a]{VOICE_CHAIN},asplit=2[v][key];'
             '[1:a][key]sidechaincompress=threshold=0.02:ratio=5:attack=25:release=400:makeup=1[m];'
             '[v]pan=stereo|c0=c0|c1=c0[vs];'
             '[vs][m][2:a]amix=inputs=3:normalize=0:weights=1 1 1,alimiter=limit=0.95:level=false[mix]')
    pre = workdir / 'premaster.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *sum([['-i', str(p)] for p in paths], []),
                    '-filter_complex', graph, '-map', '[mix]', '-ar', str(SR), str(pre)], check=True)
    # two-pass loudness normalisation
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(pre), '-af',
                        f'loudnorm=I={lufs}:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True)
    st = json.loads(r.stderr[r.stderr.rindex('{'):])
    ln = (f"loudnorm=I={lufs}:TP=-1.5:LRA=9:measured_I={st['input_i']}:measured_TP={st['input_tp']}:"
          f"measured_LRA={st['input_lra']}:measured_thresh={st['input_thresh']}:offset={st['target_offset']}:linear=true")
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(pre), '-af', ln, '-ar', str(SR), str(out)], check=True)
