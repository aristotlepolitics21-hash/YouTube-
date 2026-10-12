# usage: build_page.py SCRIPT.json EPDIR OUT.html  (EPDIR holds durs.json and caps.json from ../engine/voice.py)
# The page is served by render.cjs at http://tech3d.local/, with three.js and pixar.js resolved through the import map.
import json, sys
script_path, ep, out = sys.argv[1], sys.argv[2], sys.argv[3]
sc = json.load(open(script_path))
lines = [[l[0], l[1], l[2], si] for si, s in enumerate(sc["sections"]) for l in s["lines"]]
durs, caps = json.load(open(f"{ep}/durs.json")), json.load(open(f"{ep}/caps.json"))
names = [s["name"] for s in sc["sections"]]
steps = {si: si for si in range(1, len(names) - 1)}  # sections between the hook and the recap are steps 1-5
page = f"""<!doctype html><meta charset="utf-8"><style>body{{margin:0;background:#000}}</style>
<canvas id="cv" width="1080" height="1920"></canvas>
<script type="importmap">{{"imports":{{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}}}</script>
<script type="module">
const LINES = {json.dumps(lines)}, DURS = {json.dumps(durs)}, CAPS = {json.dumps(caps)}, NAMES = {json.dumps(names)}, STEPS = {json.dumps(steps)};
await Promise.all([document.fonts.load('900 70px Inter'), document.fonts.load('700 40px Inter'), document.fonts.load('700 40px "DejaVu Sans Mono"')]);
await import('/engine/pixar.js');
let t0 = 0; const secStart = {{}};
const TL = LINES.map((l, i) => {{ if (!(l[3] in secStart)) secStart[l[3]] = t0;
  const o = {{ scene: l[0], p: l[1], text: l[2], sec: l[3], start: t0, end: t0 + DURS[i], cap: CAPS[i].slice(0, 2), step: STEPS[l[3]], secName: NAMES[l[3]] }}; t0 += DURS[i]; return o; }});
window.TL = TL; window.__total = t0;
window.__at = T => {{ let i = TL.findIndex(l => T < l.end); if (i < 0) i = TL.length - 1; TL[i].secT = T - secStart[TL[i].sec]; DOC3D.frame(TL, T, t0); }};
window.__ready = true;
</script>"""
open(out, "w").write(page); print(len(lines), "lines", round(sum(durs), 1), "s")
