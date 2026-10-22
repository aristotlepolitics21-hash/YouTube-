import json, os, sys
# usage: build_page.py SCRIPT DURS|- OUT.html   (fonts from $FONTS, default ../../../.fonts)
E = os.path.dirname(os.path.abspath(__file__)); HD = os.path.join(E, "../../historic-disasters/engine")
FONT = os.environ.get("ANTON", os.path.join(os.environ.get("WORK", "/tmp"), "fonts/Anton.ttf"))
script_path, durs_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
sc = json.load(open(script_path)); lines = [[l[0], l[1], l[2], si] for si, s in enumerate(sc["sections"]) for l in s["lines"]]
durs = json.load(open(durs_path)) if durs_path != "-" else [len(l[2].split()) / 2.3 + 1.3 for l in lines]
sets = open(f"{HD}/sets.js").read() + "\n" + open(f"{E}/bio.js").read()
eng = open(f"{HD}/stickdoc.js").read().replace("/*SETS*/", sets)
page = f"""<!doctype html><meta charset="utf-8"><style>@font-face{{font-family:Anton;src:url('file://{FONT}')}}body{{margin:0;background:#000}}</style>
<canvas id="cv" width="1280" height="720"></canvas><script>{eng}</script><script>
const LINES = {json.dumps(lines)}; const DURS = {json.dumps(durs)};
let t0 = 0; const TL = LINES.map((l, i) => {{ const o = {{ scene: l[0], p: l[1], text: l[2], sec: l[3], start: t0, end: t0 + DURS[i] }}; t0 += DURS[i]; return o; }});
const NIGHT = new Set(['title','memorial','tv','bunker']); const DAYDEF = new Set(['podium','camp','cell']);
window.__total = t0; window.__lines = TL;
window.__at = T => {{ let i = TL.findIndex(l => T < l.end); if (i < 0) i = TL.length - 1; const L = TL[i], d = L.end - L.start, t = Math.min(1, Math.max(0, (T - L.start) / d));
  DOC.draw(L.scene, L.p, t, T - L.start);
  const prev = TL[i - 1], next = TL[i + 1], p = L.p || {{}}, night = NIGHT.has(L.scene) || !!p.night || (DAYDEF.has(L.scene) && p.night !== 0) || p.state === 'fire';
  const same = (a, b) => a && b && a.scene === b.scene && JSON.stringify(a.p) === JSON.stringify(b.p);
  const cutIn = !same(prev, L), cutOut = !same(L, next); let a = 0;
  if (cutIn) a = Math.max(a, 1 - (T - L.start) / .35); if (cutOut) a = Math.max(a, 1 - (L.end - T) / .35); DOC.dip(Math.max(0, Math.min(1, a)), night); }};
document.fonts.load('40px Anton').then(() => window.__ready = true);
</script>"""
open(out, "w").write(page); print(len(lines), "lines", round(sum(durs), 1), "s")
