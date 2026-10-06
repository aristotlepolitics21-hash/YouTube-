import json, sys
D = "/tmp/claude-0/-home-user-YouTube-/aece8624-b638-5e16-a980-11f89b661b06/scratchpad/doc"
script_path, durs_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
sc = json.load(open(script_path)); lines = [[l[0], l[1], l[2], si] for si, s in enumerate(sc["sections"]) for l in s["lines"]]
durs = json.load(open(durs_path)) if durs_path != "-" else [len(l[2].split()) / 2.5 + 1 for l in lines]
eng = open(f"{D}/stickdoc.js").read()
page = f"""<!doctype html><meta charset="utf-8"><style>@font-face{{font-family:Anton;src:url('file://{D}/../fonts/Anton.ttf')}}body{{margin:0;background:#000}}</style>
<canvas id="cv" width="1280" height="720"></canvas><script>{eng}</script><script>
const LINES = {json.dumps(lines)}; const DURS = {json.dumps(durs)};
let t0 = 0; const TL = LINES.map((l, i) => {{ const o = {{ scene: l[0], p: l[1], text: l[2], sec: l[3], start: t0, end: t0 + DURS[i] }}; t0 += DURS[i]; return o; }});
const NIGHT = new Set(['title','clock','lookout','bridge','radio','californian','ocean','wreck','memorial']);
window.__total = t0; window.__lines = TL;
window.__at = T => {{ let i = TL.findIndex(l => T < l.end); if (i < 0) i = TL.length - 1; const L = TL[i], d = L.end - L.start, t = Math.min(1, Math.max(0, (T - L.start) / d));
  DOC.draw(L.scene, L.p, t, T - L.start);
  const prev = TL[i - 1], next = TL[i + 1], night = NIGHT.has(L.scene) || (L.p && (L.p.state === 'night' || L.p.state === 'list' || L.p.state === 'split'));
  const cutIn = !prev || prev.scene !== L.scene, cutOut = !next || next.scene !== L.scene; let a = 0;
  if (cutIn) a = Math.max(a, 1 - (T - L.start) / .35); if (cutOut) a = Math.max(a, 1 - (L.end - T) / .35); DOC.dip(Math.max(0, Math.min(1, a)), night); }};
document.fonts.load('40px Anton').then(() => window.__ready = true);
</script>"""
open(out, "w").write(page); print(len(lines), "lines", round(t0 if False else sum(durs), 1), "s")
