"""Render one preview still per distinct scene of an episode (first use of each scene),
plus a labelled contact sheet: python3 render3d/preview.py render3d/episodes/<ep>.json [t] [--all]
--all renders every clip instead (each shot and each of its "cuts"), a storyboard of the edit."""
import json, subprocess, sys, pathlib, concurrent.futures as cf
from PIL import Image, ImageDraw
root = pathlib.Path(__file__).resolve().parent
args = [a for a in sys.argv[1:] if a != '--all']; every = '--all' in sys.argv
ep = json.load(open(args[0])); t = args[1] if len(args) > 1 else '0.6'
size = ep.get('size', [1080, 1920]); mod = ep['module']
seen = {}
for i, s in enumerate(ep['shots']):
    clips = [(s.get('scene', str(i)), s.get('params', {}))]
    for c in s.get('cuts', []):  # a cut without "scene" re-frames the shot's scene with merged params
        clips.append((c['scene'], c.get('params', {})) if 'scene' in c else (clips[0][0], {**s.get('params', {}), **c.get('params', {})}))
    for n, (name, params) in enumerate(clips):
        if every: seen[f'{i + 1:02d}{"abcdefghij"[n]}_{name}'] = (name, params)
        elif name not in [v[0] for v in seen.values()]: seen[f'{i + 1:02d}_{name}'] = (name, params)
def go(item):
    out, (name, params) = item
    params = {k: v for k, v in params.items() if not isinstance(v, dict)}
    r = subprocess.run(['node', str(root / 'render.mjs'), '--stills', '--ep', mod, '--scene', name, '--params', json.dumps(params),
                        '--size', f'{size[0]}x{size[1]}', '--t', t, '--out', out], capture_output=True, text=True)
    err = [l for l in (r.stdout + r.stderr).splitlines() if 'error' in l.lower()]
    return f'{name}: {"ok" if r.returncode == 0 and not err else "FAIL " + " | ".join(err)[:300]}'
with cf.ThreadPoolExecutor(3) as ex:
    for res in ex.map(go, seen.items()): print(res)
files = [root / 'stills' / mod / f'{out}.png' for out in seen]
W, H = (480, 270) if size[0] > size[1] else (270, 480)
cols = 6 if every else 4; rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (W + 8), rows * (H + 8)), '#333')
for k, f in enumerate(files):
    if not f.exists(): continue
    x, y = (k % cols) * (W + 8), (k // cols) * (H + 8)
    sheet.paste(Image.open(f).convert('RGB').resize((W, H)), (x, y)); ImageDraw.Draw(sheet).text((x + 6, y + 6), f.stem, fill='yellow')
out = root / 'out' / f'{mod}_sheet.jpg'; sheet.save(out, quality=85); print(out)
