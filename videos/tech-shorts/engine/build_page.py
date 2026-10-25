# usage: build_page.py SCRIPT.json EPDIR OUT.html  (EPDIR holds durs.json and caps.json from voice.py)
import json, os, sys
script_path, ep, out = sys.argv[1], sys.argv[2], sys.argv[3]
here = os.path.dirname(os.path.abspath(__file__))
sc = json.load(open(script_path))
lines = [[l[0], l[1], l[2], si] for si, s in enumerate(sc["sections"]) for l in s["lines"]]
durs, caps = json.load(open(f"{ep}/durs.json")), json.load(open(f"{ep}/caps.json"))
names = [s["name"] for s in sc["sections"]]
# sections between the hook and the recap are the five numbered steps
steps = {si: si for si in range(1, len(names) - 1)}
page = f"""<!doctype html><meta charset="utf-8"><style>body{{margin:0;background:#000}}</style>
<canvas id="cv" width="1080" height="1920"></canvas><script>{open(f"{here}/techdoc.js").read()}</script><script>
const LINES = {json.dumps(lines)}, DURS = {json.dumps(durs)}, CAPS = {json.dumps(caps)}, NAMES = {json.dumps(names)}, STEPS = {json.dumps(steps)};
let t0 = 0; const secStart = {{}};
const TL = LINES.map((l, i) => {{ if (!(l[3] in secStart)) secStart[l[3]] = t0;
  const o = {{ scene: l[0], p: l[1], text: l[2], sec: l[3], start: t0, end: t0 + DURS[i], cap: CAPS[i].slice(0, 2), step: STEPS[l[3]], secName: NAMES[l[3]] }}; t0 += DURS[i]; return o; }});
window.__total = t0;
window.__at = T => {{ let i = TL.findIndex(l => T < l.end); if (i < 0) i = TL.length - 1; const L = TL[i];
  L.secT = T - secStart[L.sec];
  let a = 0; if (i > 0) a = Math.max(a, 1 - (T - L.start) / .22); if (i < TL.length - 1) a = Math.max(a, 1 - (L.end - T) / .22);
  DOC.frame(L, T, t0, Math.max(0, Math.min(1, a)) * .9); }};
Promise.all([document.fonts.load('900 70px Inter'), document.fonts.load('700 40px "DejaVu Sans Mono"')]).then(() => window.__ready = true);
</script>"""
open(out, "w").write(page); print(len(lines), "lines", round(sum(durs), 1), "s")
