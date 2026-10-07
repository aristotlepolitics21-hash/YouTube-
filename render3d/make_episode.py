"""Turn an episode JSON into a finished vertical video: Piper voiceover, shots
timed to the narration, 3D frames from render.mjs, ZackDFilms-style pop-in
captions, sound effects, encoded to MP4.

  python3 render3d/make_episode.py render3d/episodes/knuckles.json \
      --voice voices/en_US-ryan-high.onnx -o render3d/out/knuckles.mp4

Episode JSON: {"module": "<episode .js name>", "shots": [{"vo": str | [str, ...],
"caption": "text with **highlight**", "highlight": "#hex"?, "sfx": [{"type": "pop",
"segment": i}]?, "params": {"name": {"segment": i} | number}?}, ...]}.
A {"segment": i} value becomes the fraction of the shot where voice segment i starts.
--skip-render reuses frames already in frames/<module>/.
"""
import argparse, json, math, pathlib, subprocess, sys, threading, wave, queue
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent
FPS, W, H, SR = 24, 1080, 1920, 44100
LEAD, GAP, TAIL = 0.25, 0.15, 0.45  # seconds of air around each shot's narration
FONT = ROOT / 'fonts' / 'ArchivoBlack-Regular.ttf'


def tts(text, voice, path):
    subprocess.run([sys.executable, '-m', 'piper', '-m', str(voice), '-f', str(path)],
                   input=text.encode(), check=True, capture_output=True)
    with wave.open(str(path)) as w:
        sr, n = w.getframerate(), w.getnframes()
        pcm = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
    # resample to SR
    x = np.interp(np.linspace(0, len(pcm) - 1, int(len(pcm) * SR / sr)), np.arange(len(pcm)), pcm)
    return x.astype(np.float32)


def sfx_pop():
    t = np.arange(int(SR * 0.35)) / SR
    thump = np.sin(2 * np.pi * (140 * np.exp(-t * 18) + 45) * t) * np.exp(-t * 14)
    rng = np.random.default_rng(1)
    click = rng.standard_normal(len(t)) * np.exp(-t * 160)
    click = np.convolve(click, [1, -0.95], mode='same')  # crude high-pass
    return (0.9 * thump + 0.5 * click).astype(np.float32)


def sfx_whoosh(dur=0.35):
    n = int(SR * dur); t = np.arange(n) / SR
    rng = np.random.default_rng(2)
    noise = np.convolve(rng.standard_normal(n), np.ones(24) / 24, mode='same')
    env = np.sin(np.pi * t / dur) ** 2
    return (noise * env * 1.6).astype(np.float32)


def plan(ep, voice, workdir):
    shots, t0 = [], 0.0
    for i, s in enumerate(ep['shots']):
        segs = s['vo'] if isinstance(s['vo'], list) else [s['vo']]
        audio, starts, cur = [], [], LEAD
        for j, text in enumerate(segs):
            a = tts(text, voice, workdir / f'vo{i + 1}_{j}.wav')
            starts.append(cur); audio.append((cur, a)); cur += len(a) / SR + GAP
        dur = cur - GAP + TAIL
        frames = max(2, round(dur * FPS)); dur = frames / FPS
        params = {}
        for k, v in s.get('params', {}).items():
            params[k] = starts[v['segment']] / dur if isinstance(v, dict) else v
        shots.append(dict(index=i, start=t0, dur=dur, frames=frames, audio=audio,
                          starts=starts, params=params, spec=s))
        t0 += dur
    return shots, t0


def render_frames(module, shots, workers=2):
    q = queue.Queue()
    for s in shots: q.put(s)
    errors = []

    def work():
        while True:
            try: s = q.get_nowait()
            except queue.Empty: return
            cmd = ['node', str(ROOT / 'render.mjs'), '--ep', module, '--shot', str(s['index']),
                   '--frames', str(s['frames']), '--params', json.dumps(s['params'])]
            r = subprocess.run(cmd, capture_output=True, text=True)
            print(f"  shot {s['index'] + 1}: {s['frames']} frames {'ok' if r.returncode == 0 else 'FAILED'}", flush=True)
            if r.returncode: errors.append(r.stderr[-2000:])

    ts = [threading.Thread(target=work) for _ in range(workers)]
    for t in ts: t.start()
    for t in ts: t.join()
    if errors: sys.exit('render failed:\n' + '\n'.join(errors))


def caption_layer(text, hl_color, size=96, max_w=940):
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
    for li, (ws, total) in enumerate(lines):
        x = (W - total) / 2; y = pad + li * lh
        for w, hl, ww in ws:
            d.text((x, y), w, font=font, fill=hl_color if hl else '#ffffff', stroke_width=10, stroke_fill='#000000')
            x += ww + space
    return img


def ease_out_back(t, c=1.9):
    return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2


def encode(module, shots, total, out, audio_path):
    cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
           '-r', str(FPS), '-i', '-', '-i', str(audio_path), '-c:v', 'libx264', '-preset', 'medium',
           '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest',
           '-movflags', '+faststart', str(out)]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for s in shots:
        cap = caption_layer(s['spec']['caption'], s['spec'].get('highlight', '#ffd23f'))
        cy = 1330  # caption centre line, lower-middle like ZackDFilms
        fdir = ROOT / 'frames' / module / f"shot{s['index'] + 1}"
        for f in range(s['frames']):
            frame = Image.open(fdir / f'f{f:04d}.png').convert('RGB')
            k = min(1.0, f / 7)  # pop-in over the first 7 frames
            sc = 0.55 + 0.45 * ease_out_back(k)
            c = cap if sc == 1 else cap.resize((max(1, int(cap.width * sc)), max(1, int(cap.height * sc))), Image.LANCZOS)
            frame.paste(c, ((W - c.width) // 2, cy - c.height // 2), c)
            ff.stdin.write(frame.tobytes())
    ff.stdin.close()
    if ff.wait(): sys.exit('ffmpeg failed')


def mix(shots, total, path):
    mixbuf = np.zeros(int(math.ceil(total * SR)) + SR, dtype=np.float32)
    def add(at, clip, gain=1.0):
        i = int(at * SR); mixbuf[i:i + len(clip)] += clip[: len(mixbuf) - i] * gain
    pop, whoosh = sfx_pop(), sfx_whoosh()
    for s in shots:
        for at, a in s['audio']:
            add(s['start'] + at, a)
        if s['index']:
            add(s['start'] - 0.17, whoosh, 0.18)
        for fx in s['spec'].get('sfx', []):
            if fx['type'] == 'pop':
                add(s['start'] + s['starts'][fx['segment']] - 0.05, pop, 0.7)
    mixbuf /= max(1e-6, np.abs(mixbuf).max()) / 0.9
    pcm = (mixbuf[: int(total * SR)] * 32767).astype(np.int16)
    with wave.open(str(path), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('episode'); ap.add_argument('--voice', required=True)
    ap.add_argument('-o', '--out', required=True); ap.add_argument('--skip-render', action='store_true')
    ap.add_argument('--workers', type=int, default=2)
    a = ap.parse_args()
    ep = json.loads(pathlib.Path(a.episode).read_text())
    module = ep['module']
    work = ROOT / 'out' / f'{module}_work'; work.mkdir(parents=True, exist_ok=True)
    print('voiceover...', flush=True)
    shots, total = plan(ep, a.voice, work)
    for s in shots:
        print(f"  shot {s['index'] + 1}: {s['dur']:.2f}s {s['params'] or ''}")
    print(f'total {total:.1f}s', flush=True)
    if not a.skip_render:
        print('rendering 3D frames...', flush=True)
        render_frames(module, shots, a.workers)
    mix(shots, total, work / 'mix.wav')
    print('compositing captions + encoding...', flush=True)
    pathlib.Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    encode(module, shots, total, a.out, work / 'mix.wav')
    print('wrote', a.out)


if __name__ == '__main__':
    main()
