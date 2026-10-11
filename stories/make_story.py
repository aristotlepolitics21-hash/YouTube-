"""Turn a folder of story stills into a finished Short: the render3d pipeline's Piper
voiceover, word-by-word pop-in captions, music bed and sound effects, with each beat's
still image animated by a slow push/pan (Ken Burns) instead of 3D frames.

  python3 stories/make_story.py stories/fridge/fridge.json \
      --voice voices/en_US-ryan-high.onnx -o out/fridge.mp4

Story JSON: {"size": [1080, 1920]?, "music": "ambient"?, "punch": 0.05?, "highlight": "#hex"?, "caption_y": px?,
             "shots": [{"vo": str, "kb": {"z": [z0, z1], "x": [x0, x1], "y": [y0, y1]}?,
                        "sfx": [{"type": "pop" | "boom", "word": "..."}]?}, ...]}
Shot i uses beats/beatNN.(jpg|png) next to the JSON, NN = i + 1. A beat without one falls
back to preview/beatNN.jpg (low-res draft), then to a dark "image pending" card, so a
draft can be cut before every image exists. kb: zoom from z0 to z1 while the frame centre
moves from (x0, y0) to (x1, y1), as fractions of the image.
A shot with "set" or "insert" is drawn as an animated cartoon instead (stories/cartoon.py),
with the story's "cast": {"name": {"color": [r, g, b], "hair": "short", ...}}.
"""
import argparse, json, pathlib, shutil, sys
from multiprocessing import Pool
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'render3d'))
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import make_episode as me  # noqa: E402


def cover(img, W, H):
    """Scale and centre-crop img to fill W x H."""
    s = max(W / img.width, H / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    l, t = (img.width - W) // 2, (img.height - H) // 2
    return img.crop((l, t, l + W, t + H))


def pending_card(n, W, H):
    img = Image.new('RGB', (W, H), '#14181f')
    d = ImageDraw.Draw(img)
    font = ImageFont.truetype(str(me.FONT), 90)
    for k, line in enumerate([f'BEAT {n}', 'IMAGE PENDING']):
        d.text((W / 2, H * 0.4 + k * 120), line, font=font, fill='#5a6472', anchor='mm')
    return img


def beat_image(story_dir, n, W, H):
    for sub in ('beats', 'preview'):
        for ext in ('jpg', 'png', 'jpeg', 'webp'):
            p = story_dir / sub / f'beat{n:02d}.{ext}'
            if p.exists():
                return cover(Image.open(p).convert('RGB'), W, H), sub
    return pending_card(n, W, H), 'pending'


def smooth(t):
    return t * t * (3 - 2 * t)


def render_shot(img, kb, frames, out_dir, W, H):
    out_dir.mkdir(parents=True, exist_ok=True)
    z0, z1 = kb.get('z', [1.0, 1.1]); x0, x1 = kb.get('x', [0.5, 0.5]); y0, y1 = kb.get('y', [0.5, 0.5])
    for f in range(frames):
        t = smooth(f / max(1, frames - 1))
        z = z0 + (z1 - z0) * t
        cw, ch = img.width / z, img.height / z
        cx = min(max((x0 + (x1 - x0) * t) * img.width, cw / 2), img.width - cw / 2)
        cy = min(max((y0 + (y1 - y0) * t) * img.height, ch / 2), img.height - ch / 2)
        frame = img.resize((W, H), Image.BICUBIC, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))
        frame.save(out_dir / f'f{f:04d}.jpg', quality=92)


def render_cartoon(job):
    import cartoon
    beat, cast, frames, out_dir = job
    out_dir.mkdir(parents=True, exist_ok=True)
    for f in range(frames):
        cartoon.render(beat, cast, f / max(1, frames - 1), f / me.FPS).save(out_dir / f'f{f:04d}.jpg', quality=90)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('story'); ap.add_argument('--voice', required=True); ap.add_argument('-o', '--out', required=True)
    ap.add_argument('--workers', type=int, default=4)
    a = ap.parse_args()
    path = pathlib.Path(a.story).resolve(); story_dir = path.parent
    ep = json.loads(path.read_text())
    W, H = ep.get('size', [1080, 1920])
    for s in ep['shots']:
        s.setdefault('highlight', ep.get('highlight', '#ffd23f'))
    work = story_dir / 'work'; work.mkdir(exist_ok=True)
    me.frame_dir = lambda module, c: work / 'frames' / c['name']  # stills, not render3d/frames

    print('voiceover...', flush=True)
    shots, total = me.plan(ep, a.voice, work)
    print('animating beats...', flush=True)
    shutil.rmtree(work / 'frames', ignore_errors=True)
    src = 1.3  # render stills larger than the frame so the push-in stays sharp
    jobs = []
    for s in shots:
        n, spec, out_dir = s['index'] + 1, s['spec'], work / 'frames' / s['clips'][0]['name']
        if 'set' in spec or 'insert' in spec:
            jobs.append((spec, ep.get('cast', {}), s['frames'], out_dir)); kind = 'cartoon'
        else:
            img, kind = beat_image(story_dir, n, round(W * src), round(H * src))
            render_shot(img, spec.get('kb', {}), s['frames'], out_dir, W, H)
        print(f'  beat {n:2d}: {s["dur"]:.2f}s  {kind}')
    if jobs:
        with Pool(a.workers) as pool:
            pool.map(render_cartoon, jobs)
    print(f'total {total:.1f}s', flush=True)
    me.mix(ep, shots, total, work / 'mix.wav')
    print('captions + encoding...', flush=True)
    pathlib.Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    me.encode('story', shots, (W, H), a.out, work / 'mix.wav', 'words', ep.get('punch', 0.0), ep.get('caption_y'))
    shutil.rmtree(work / 'frames', ignore_errors=True)
    print('wrote', a.out)


if __name__ == '__main__':
    main()
