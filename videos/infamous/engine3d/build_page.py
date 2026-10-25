import json, os, sys
# usage: build_page.py SCRIPT DURS|- OUT.html — a page for serve.cjs: three.js + mannequin.js (r3.js, sets3d.js) under the 2D stickdoc engine.
script_path, durs_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
sc = json.load(open(script_path)); lines = [[l[0], l[1], l[2], si] for si, s in enumerate(sc["sections"]) for l in s["lines"]]
durs = json.load(open(durs_path)) if durs_path != "-" else [len(l[2].split()) / 2.3 + 1.3 for l in lines]
page = f"""<!doctype html><meta charset="utf-8"><style>@font-face{{font-family:Anton;src:url('/Anton.ttf')}}body{{margin:0;background:#000}}</style>
<canvas id="cv" width="1280" height="720"></canvas>
<script type="importmap">{{"imports":{{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/","mannequin":"/mq/src/mannequin.js"}}}}</script>
<script type="module">
const R3 = await import('/engine/r3.js'); await import('/engine/sets3d.js'); window.R3 = R3;
const src = await Promise.all(['/hd/stickdoc.js', '/hd/sets.js', '/bio/bio.js', '/engine/bio3d.js'].map(u => fetch(u).then(r => r.text())));
(0, eval)(src[0].replace('/*SETS*/', src[1] + '\\n' + src[2] + '\\n' + src[3]));
const LINES = {json.dumps(lines)}; const DURS = {json.dumps(durs)};
let t0 = 0; const TL = LINES.map((l, i) => {{ const o = {{ scene: l[0], p: l[1], text: l[2], sec: l[3], start: t0, end: t0 + DURS[i] }}; t0 += DURS[i]; return o; }});
const LIGHT = new Set(['date','lesson','stat','counter','icons','bars','quote','timeline','checklist','chart','paper','decree','ballot','web']);
window.__total = t0; window.__lines = TL;
window.__at = T => {{ let i = TL.findIndex(l => T < l.end); if (i < 0) i = TL.length - 1; const L = TL[i], d = L.end - L.start, t = Math.min(1, Math.max(0, (T - L.start) / d));
  DOC.draw(L.scene, L.p, t, T - L.start);
  const prev = TL[i - 1], next = TL[i + 1], night = !LIGHT.has(L.scene);
  const same = (a, b) => a && b && a.scene === b.scene && JSON.stringify(a.p) === JSON.stringify(b.p);
  let a = 0; if (!same(prev, L)) a = Math.max(a, 1 - (T - L.start) / .35); if (!same(L, next)) a = Math.max(a, 1 - (L.end - T) / .35); DOC.dip(Math.max(0, Math.min(1, a)), night); }};
await document.fonts.load('40px Anton'); window.__ready = true;
</script>"""
open(out, "w").write(page); print(len(lines), "lines", round(sum(durs), 1), "s")
