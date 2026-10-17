# usage: build_page.py SCRIPT.json WORKDIR OUT.html  (WORKDIR holds durs.json and caps.json from ../../tech-shorts/engine/voice.py)
# A script with "format": "short" renders 1080x1920 with burned-in captions.
# The page is served by serve.cjs at http://film.local/, with three.js and film.js resolved through the import map.
import json, sys
script_path, ep, out = sys.argv[1], sys.argv[2], sys.argv[3]
sc = json.load(open(script_path))
lines = [[l[0], l[1], l[2], si, li == 0] for si, s in enumerate(sc["sections"]) for li, l in enumerate(s["lines"])]
durs, caps = json.load(open(f"{ep}/durs.json")), json.load(open(f"{ep}/caps.json"))
names = [s["name"] for s in sc["sections"]]
FW, FH = (1080, 1920) if sc.get("format") == "short" else (1920, 1080)
page = f"""<!doctype html><meta charset="utf-8"><style>body{{margin:0;background:#000}}</style>
<canvas id="cv" width="{FW}" height="{FH}"></canvas><script>window.FILM_W = {FW}; window.FILM_H = {FH};</script>
<script type="importmap">{{"imports":{{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}}}</script>
<script type="module">
const LINES = {json.dumps(lines)}, DURS = {json.dumps(durs)}, CAPS = {json.dumps(caps)}, NAMES = {json.dumps(names)};
await Promise.all([document.fonts.load('800 70px "Inter Display"'), document.fonts.load('700 40px Inter'), document.fonts.load('500 40px Inter'), document.fonts.load('400 40px "Bitstream Charter"')]);
const F = await import('/engine/film.js'); await F.init();
let t0 = 0;
const TL = LINES.map((l, i) => {{ const o = {{ scene: l[0], p: l[1], text: l[2], sec: l[3], first: l[4], start: t0, end: t0 + DURS[i], secName: NAMES[l[3]], cap: CAPS[i] }}; t0 += DURS[i]; return o; }});
window.TL = TL; window.__total = t0;
window.__at = T => DOC3D.frame(TL, T, t0);
window.__ready = true;
</script>"""
open(out, "w").write(page); print(len(lines), "lines", round(sum(durs), 1), "s")
