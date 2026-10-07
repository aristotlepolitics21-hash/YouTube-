"""Turn an episode JSON into a finished video: Piper voiceover, shots timed to
the narration, 3D frames from render.mjs, ZackDFilms-style pop-in captions,
sound effects and an optional ambient music bed, encoded to MP4.

  python3 render3d/make_episode.py render3d/episodes/knuckles.json \
      --voice voices/en_US-ryan-high.onnx -o render3d/out/knuckles.mp4

Episode JSON:
  {"module": "<episode .js name>", "size": [1920, 1080]?, "length_scale": 1.0?,
   "music": "ambient"?, "shots": [shot, ...]}
  shot: {"vo": str | [str, ...], "caption": "text with **highlight**"?, "highlight": "#hex"?,
         "scene": "<scene name>"?, "params": {"name": value | {"segment": i}}?,
         "sfx": [{"type": "pop" | "boom", "segment": i}]?}
A {"segment": i} value becomes the fraction of the shot where voice segment i starts.
Shots without "scene" render the module's i-th scene (episodes that call run([...])).
Shots whose frames are already complete in frames/<module>/ are not re-rendered, so an
interrupted build can simply be run again; --skip-render never renders.
"""
import argparse, hashlib, json, math, pathlib, subprocess, sys, threading, wave, queue
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent
FPS, SR = 24, 44100
LEAD, GAP, TAIL = 0.25, 0.15, 0.45  # seconds of air around each shot's narration
FONT = ROOT / 'fonts' / 'ArchivoBlack-Regular.ttf'


def tts(text, voice, path, length_scale=1.0):
    if not path.exists():
        subprocess.run([sys.executable, '-m', 'piper', '-m', str(voice), '-f', str(path),
                        '--length-scale', str(length_scale)],
                       input=text.encode(), check=True, capture_output=True)
    with wave.open(str(path)) as w:
        sr, n = w.getframerate(), w.getnframes()
        pcm = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
    x = np.interp(np.linspace(0, len(pcm) - 1, int(len(pcm) * SR / sr)), np.arange(len(pcm)), pcm)
    return x.astype(np.float32)


def sfx_pop():
    t = np.arange(int(SR * 0.35)) / SR
    thump = np.sin(2 * np.pi * (140 * np.exp(-t * 18) + 45) * t) * np.exp(-t * 14)
    rng = np.random.default_rng(1)
    click = rng.standard_normal(len(t)) * np.exp(-t * 160)
    click = np.convolve(click, [1, -0.95], mode='same')  # crude high-pass
    return (0.9 * thump + 0.5 * click).astype(np.float32)


def sfx_boom():
    t = np.arange(int(SR * 2.5)) / SR
    rng = np.random.default_rng(3)
    rumble = np.convolve(rng.standard_normal(len(t)), np.ones(200) / 200, mode='same') * 6
    sub = np.sin(2 * np.pi * (60 * np.exp(-t * 2) + 28) * t)
    return ((0.8 * sub + rumble) * np.exp(-t * 1.6)).astype(np.float32)


def sfx_whoosh(dur=0.35):
    n = int(SR * dur); t = np.arange(n) / SR
    rng = np.random.default_rng(2)
    noise = np.convolve(rng.standard_normal(n), np.ones(24) / 24, mode='same')
    env = np.sin(np.pi * t / dur) ** 2
    return (noise * env * 1.6).astype(np.float32)


def music_ambient(total):
    """Slow minor-key pad: four chords, 8 s each, crossfaded, with a low drone."""
    n = int(total * SR); t = np.arange(n) / SR
    chords = [[110, 130.81, 164.81], [87.31, 110, 130.81], [98, 123.47, 146.83], [82.41, 103.83, 123.47]]
    out = np.zeros(n, dtype=np.float32)
    span = 8.0
    for k in range(int(total / span) + 2):
        c = chords[k % 4]; start = k * span - 1.5
        i0, i1 = max(0, int(start * SR)), min(n, int((start + span + 3) * SR))
        if i0 >= i1: continue
        tt = t[i0:i1] - start
        env = np.clip(tt / 1.5, 0, 1) * np.clip((span + 3 - tt) / 1.5, 0, 1)
        for f in c:
            out[i0:i1] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.003 * tt)) * env
    out += 0.6 * np.sin(2 * np.pi * 55 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * t / 23))
    return out / (np.abs(out).max() + 1e-6)


def plan(ep, voice, workdir):
    shots, t0, ls = [], 0.0, ep.get('length_scale', 1.0)
    for i, s in enumerate(ep['shots']):
        segs = s['vo'] if isinstance(s['vo'], list) else [s['vo']]
        audio, starts, cur = [], [], LEAD
        for j, text in enumerate(segs):
            key = hashlib.md5(f'{text}|{ls}'.encode()).hexdigest()[:10]  # cache by text + speed
            a = tts(text, voice, workdir / f'vo{i + 1}_{j}_{key}.wav', ls)
            starts.append(cur); audio.append((cur, a)); cur += len(a) / SR + GAP
        dur = cur - GAP + TAIL
        frames = max(2, round(dur * FPS)); dur = frames / FPS
        params = {}
        for k, v in s.get('params', {}).items():
            params[k] = starts[v['segment']] / dur if isinstance(v, dict) and 'segment' in v else v
        shots.append(dict(index=i, start=t0, dur=dur, frames=frames, audio=audio,
                          starts=starts, params=params, spec=s))
        t0 += dur
    return shots, t0


def frame_dir(module, s):
    return ROOT / 'frames' / module / f"shot{s['index'] + 1:02d}"


def frame_files(module, s):
    d = frame_dir(module, s)
    return sorted(d.glob('f*.jpg')) or sorted(d.glob('f*.png')) if d.exists() else []


def render_frames(module, shots, size, workers):
    todo = [s for s in shots if len(frame_files(module, s)) != s['frames']]
    for s in shots:  # a changed duration invalidates old frames
        if s in todo and frame_dir(module, s).exists():
            for f in frame_dir(module, s).glob('f*'): f.unlink()
    print(f'  {len(shots) - len(todo)} shots already rendered, {len(todo)} to go', flush=True)
    q = queue.Queue()
    for s in todo: q.put(s)
    errors = []

    def work():
        while True:
            try: s = q.get_nowait()
            except queue.Empty: return
            scene = s['spec'].get('scene')
            cmd = ['node', str(ROOT / 'render.mjs'), '--ep', module, '--frames', str(s['frames']),
                   '--params', json.dumps(s['params']), '--size', f'{size[0]}x{size[1]}',
                   '--format', 'jpg', '--out', frame_dir(module, s).name]
            cmd += ['--scene', scene] if scene else ['--shot', str(s['index'])]
            r = subprocess.run(cmd, capture_output=True, text=True)
            ok = r.returncode == 0 and len(frame_files(module, s)) == s['frames']
            print(f"  shot {s['index'] + 1} ({scene or 'index'}): {s['frames']} frames {'ok' if ok else 'FAILED'}", flush=True)
            if not ok: errors.append(f"shot {s['index'] + 1}: " + (r.stderr or r.stdout)[-1500:])

    ts = [threading.Thread(target=work) for _ in range(workers)]
    for t in ts: t.start()
    for t in ts: t.join()
    if errors: sys.exit('render failed:\n' + '\n'.join(errors))


def caption_layer(text, hl_color, W, size, max_w):
    font = ImageFont.truetype(str(FONT), size)
    words = []  # (word, highlighted)
    for k, part in enumerate(text.split('**')):
        words += [(w.upper(), k % 2 == 1) for w in part.split()]
    space = font.getlength(' ')
    lines, line, lw = [], [], 0
    for w, hl in words:
        ww = font.getlength(w)
        if line and lw + space + ww > max_w:
            lines.append((line, lw)); line, lw = [], 0
        lw += (space if line else 0) + ww; line.append((w, hl, ww))
    if line: lines.append((line, lw))
    lh = int(size * 1.12); pad = 30
    img = Image.new('RGBA', (W, lh * len(lines) + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    stroke = max(6, size // 9)
    for li, (ws, total) in enumerate(lines):
        x = (W - total) / 2; y = pad + li * lh
        for w, hl, ww in ws:
            d.text((x, y), w, font=font, fill=hl_color if hl else '#ffffff', stroke_width=stroke, stroke_fill='#000000')
            x += ww + space
    return img


def ease_out_back(t, c=1.9):
    return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2


def encode(module, shots, size, out, audio_path):
    W, H = size
    landscape = W > H
    cap_size, cap_w = (66, 1500) if landscape else (96, 940)
    cy = H - 150 if landscape else 1330  # lower third (16:9) / lower-middle (9:16)
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
           '-r', str(FPS), '-i', '-', '-i', str(audio_path), '-c:v', 'libx264', '-preset', 'medium',
           '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest',
           '-movflags', '+faststart', str(out)]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for s in shots:
        text = s['spec'].get('caption')
        cap = caption_layer(text, s['spec'].get('highlight', '#ffd23f'), W, cap_size, cap_w) if text else None
        files = frame_files(module, s)
        for f in range(s['frames']):
            frame = Image.open(files[f]).convert('RGB')
            if cap:
                k = min(1.0, f / 7)  # pop-in over the first 7 frames
                sc = 0.55 + 0.45 * ease_out_back(k)
                c = cap if sc == 1 else cap.resize((max(1, int(cap.width * sc)), max(1, int(cap.height * sc))), Image.LANCZOS)
                frame.paste(c, ((W - c.width) // 2, cy - c.height // 2), c)
            ff.stdin.write(frame.tobytes())
    ff.stdin.close()
    if ff.wait(): sys.exit('ffmpeg failed')


def mix(ep, shots, total, path):
    mixbuf = np.zeros(int(math.ceil(total * SR)) + SR * 3, dtype=np.float32)
    def add(at, clip, gain=1.0):
        i = max(0, int(at * SR)); mixbuf[i:i + len(clip)] += clip[: len(mixbuf) - i] * gain
    fx = {'pop': sfx_pop(), 'boom': sfx_boom()}
    whoosh = sfx_whoosh()
    for s in shots:
        for at, a in s['audio']:
            add(s['start'] + at, a)
        if s['index']:
            add(s['start'] - 0.17, whoosh, 0.12)
        for e in s['spec'].get('sfx', []):
            add(s['start'] + s['starts'][e.get('segment', 0)] - 0.05, fx[e['type']], 0.7)
    voice_peak = np.abs(mixbuf).max()
    if ep.get('music') == 'ambient':
        mixbuf[: int(total * SR)] += music_ambient(total) * voice_peak * 0.07
    mixbuf /= max(1e-6, np.abs(mixbuf).max()) / 0.9
    pcm = (mixbuf[: int(total * SR)] * 32767).astype(np.int16)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('episode'); ap.add_argument('--voice', required=True)
    ap.add_argument('-o', '--out', required=True); ap.add_argument('--skip-render', action='store_true')
    ap.add_argument('--plan-only', action='store_true', help='voiceover + timing only')
    ap.add_argument('--workers', type=int, default=2)
    a = ap.parse_args()
    ep = json.loads(pathlib.Path(a.episode).read_text())
    module, size = ep['module'], tuple(ep.get('size', [1080, 1920]))
    work = ROOT / 'out' / f'{module}_work'; work.mkdir(parents=True, exist_ok=True)
    print('voiceover...', flush=True)
    shots, total = plan(ep, a.voice, work)
    for s in shots:
        print(f"  shot {s['index'] + 1}: {s['dur']:.2f}s {s['spec'].get('scene', '')} {s['params'] or ''}")
    print(f'total {total:.1f}s ({total / 60:.1f} min), {sum(s["frames"] for s in shots)} frames', flush=True)
    if a.plan_only: return
    if not a.skip_render:
        print('rendering 3D frames...', flush=True)
        render_frames(module, shots, size, a.workers)
    mix(ep, shots, total, work / 'mix.wav')
    print('compositing captions + encoding...', flush=True)
    pathlib.Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    encode(module, shots, size, a.out, work / 'mix.wav')
    print('wrote', a.out)


if __name__ == '__main__':
    main()
