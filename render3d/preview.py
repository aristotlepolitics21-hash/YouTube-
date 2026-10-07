"""Render one preview still per distinct scene of an episode (first use of each scene),
plus a labelled contact sheet: python3 render3d/preview.py render3d/episodes/<ep>.json [t]"""
import json, subprocess, sys, pathlib, concurrent.futures as cf
from PIL import Image, ImageDraw
root = pathlib.Path(__file__).resolve().parent
ep = json.load(open(sys.argv[1])); t = sys.argv[2] if len(sys.argv) > 2 else '0.6'
size = ep.get('size', [1080, 1920]); mod = ep['module']
seen = {}
for i, s in enumerate(ep['shots']):
    seen.setdefault(s.get('scene', str(i)), (i, s.get('params', {})))
def go(item):
    name, (i, params) = item
    params = {k: v for k, v in params.items() if not isinstance(v, dict)}
    r = subprocess.run(['node', str(root / 'render.mjs'), '--stills', '--ep', mod, '--scene', name, '--params', json.dumps(params),
                        '--size', f'{size[0]}x{size[1]}', '--t', t, '--out', f'{i + 1:02d}_{name}'], capture_output=True, text=True)
    err = [l for l in (r.stdout + r.stderr).splitlines() if 'error' in l.lower()]
    return f'{name}: {"ok" if r.returncode == 0 and not err else "FAIL " + " | ".join(err)[:300]}'
with cf.ThreadPoolExecutor(3) as ex:
    for res in ex.map(go, seen.items()): print(res)
files = [root / 'stills' / mod / f'{i + 1:02d}_{n}.png' for n, (i, _) in seen.items()]
W, H = (480, 270) if size[0] > size[1] else (270, 480)
cols = 4; rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (W + 8), rows * (H + 8)), '#333')
for k, f in enumerate(files):
    if not f.exists(): continue
    x, y = (k % cols) * (W + 8), (k // cols) * (H + 8)
    sheet.paste(Image.open(f).convert('RGB').resize((W, H)), (x, y)); ImageDraw.Draw(sheet).text((x + 6, y + 6), f.stem, fill='yellow')
out = root / 'out' / f'{mod}_sheet.jpg'; sheet.save(out, quality=85); print(out)
