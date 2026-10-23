import json, os, sys
# usage: short_page.py PLAN.json WORDS.json OUT.html — a 1080x1920 page for serve.cjs that plays a Short's shots
# through the 3D sets (or the paper cards), applies its edit effects and grade, and draws captions.
plan_path, words_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
plan = json.load(open(plan_path)); words = json.load(open(words_path)) if words_path != "-" else []
shots, t0 = [], 0.0
for si, sc in enumerate(plan["scenes"]):
    tot = sum(s["d"] for s in sc["shots"]); assert abs(tot - 15) < 1e-6, f"scene {si + 1} shots add up to {tot}s"
    for sh in sc["shots"]:
        shots.append(dict(sh, start=t0, sec=si)); t0 += sh["d"]
texts = [[sc["text"], sc.get("red", [])] for sc in plan["scenes"]]
page = f"""<!doctype html><meta charset="utf-8"><style>@font-face{{font-family:Anton;src:url('/Anton.ttf')}}body{{margin:0;background:#000}}</style>
<canvas id="cv" width="1280" height="720" style="display:none"></canvas><canvas id="out" width="1080" height="1920"></canvas>
<script type="importmap">{{"imports":{{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/","mannequin":"/mq/src/mannequin.js"}}}}</script>
<script type="module">
const R3 = await import('/engine/r3.js'); await import('/engine/sets3d.js'); await import('/engine/shorts3d.js'); R3.setVertical(.5); window.R3 = R3;
const src = await Promise.all(['/hd/stickdoc.js', '/hd/sets.js', '/bio/bio.js'].map(u => fetch(u).then(r => r.text())));
(0, eval)(src[0].replace('/*SETS*/', src[1] + '\\n' + src[2]));
const SHOTS = {json.dumps(shots)}, WORDS = {json.dumps(words)}, TEXTS = {json.dumps(texts)}, FPS = 24, TOTAL = 60;
const S3 = new Set(Object.keys(R3.BUILD)), out = document.getElementById('out'), o = out.getContext('2d'), cv = document.getElementById('cv'), OW = 1080, OH = 1920;
function rng(s) {{ return () => {{ s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }}; }}
const grain = (() => {{ const c = document.createElement('canvas'); c.width = 540; c.height = 960; const x = c.getContext('2d'), id = x.createImageData(540, 960), r = rng(5); for (let i = 0; i < id.data.length; i += 4) {{ const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 22; }} x.putImageData(id, 0, 0); return c; }})();
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const has = (sh, f) => (sh.fx || []).includes(f);
// local shot time after speed ramps and freezes; returns [t 0..1, seconds]
function localTime(sh, s) {{ let t = s / sh.d; if (has(sh, 'ramp')) t = t < .4 ? t / .4 * .7 : .7 + (t - .4) / .6 * .3; if (has(sh, 'freeze')) t = Math.min(t, .72); return [t, t * sh.d]; }}
function source(sh, t, T) {{ if (S3.has(sh.scene)) return R3.render(sh.scene, sh.p || {{}}, t, T); DOC.draw(sh.scene, sh.p || {{}}, t, T); return null; }}
function drawShot(sh, s) {{
  const [t, T] = localTime(sh, s), img = source(sh, t, T); o.save();
  const punch = has(sh, 'punch') ? 1 + .12 * (1 - ease(clamp(s / .3))) : 1, push = 1 + .05 * clamp(s / sh.d), r = rng(Math.floor(s * 24) + 7);
  const sx = has(sh, 'shake') ? (r() - .5) * 26 : 0, sy = has(sh, 'shake') ? (r() - .5) * 26 : 0, k = punch * push;
  o.translate(OW / 2 + sx, OH / 2 + sy); o.scale(k, k); o.translate(-OW / 2, -OH / 2); o.filter = 'saturate(.45) contrast(1.15) brightness(1.08)';
  if (img) o.drawImage(img, 0, 0, OW, OH); else {{ o.fillStyle = '#0b0c0e'; o.fillRect(0, 0, OW, OH); const h = OW * 720 / 1280; o.drawImage(cv, 0, (OH - h) / 2 - 80, OW, h); }}
  o.restore(); o.fillStyle = 'rgba(12,22,38,.22)'; o.fillRect(0, 0, OW, OH);
  if (has(sh, 'freeze') && s / sh.d > .72) {{ const c = sh.circle || [.5, .4], a = clamp((s / sh.d - .72) / .12); o.strokeStyle = '#e0261c'; o.lineWidth = 12; o.beginPath(); o.arc(c[0] * OW, c[1] * OH, 150, -Math.PI / 2, -Math.PI / 2 + a * Math.PI * 2); o.stroke(); }}
  if (has(sh, 'glitch') && sh.d - s < .18) {{ const snap = o.getImageData(0, 0, OW, OH), g = rng(Math.floor(s * 24)); o.globalCompositeOperation = 'lighter'; o.globalAlpha = .5;
    o.putImageData(snap, 0, 0); for (let i = 0; i < 9; i++) {{ const y = g() * OH, h = 30 + g() * 140; o.drawImage(out, 0, y, OW, h, (g() - .5) * 120, y, OW, h); }} o.fillStyle = 'rgba(255,0,40,.18)'; o.fillRect(-12, 0, OW, OH); o.fillStyle = 'rgba(0,200,255,.14)'; o.fillRect(12, 0, OW, OH);
    o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; }}
  if (has(sh, 'flash') && s < .15) {{ o.fillStyle = `rgba(255,255,255,${{1 - s / .15}})`; o.fillRect(0, 0, OW, OH); }}
  return has(sh, 'smash') && sh.d - s < .4; }}
function finish() {{ o.globalAlpha = 1; o.drawImage(grain, Math.random() * -40, Math.random() * -40, OW + 40, OH + 40); const v = o.createRadialGradient(OW / 2, OH / 2, OH * .28, OW / 2, OH / 2, OH * .72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.62)'); o.fillStyle = v; o.fillRect(0, 0, OW, OH); }}
function word(w, x, y, size, red, scale = 1) {{ o.save(); o.translate(x, y); o.scale(scale, scale); o.font = `${{size}}px Anton`; o.textAlign = 'left'; o.textBaseline = 'middle'; o.lineJoin = 'round'; o.lineWidth = size * .16; o.strokeStyle = '#000'; o.strokeText(w, 0, 0); o.fillStyle = red ? '#e0261c' : '#f4f1ea'; o.fillText(w, 0, 0); o.restore(); }}
function line(ws, cx, y, size, isRed, scales) {{ o.font = `${{size}}px Anton`; const sp = size * .28, widths = ws.map(w => o.measureText(w).width); let x = cx - (widths.reduce((a, b) => a + b, 0) + sp * (ws.length - 1)) / 2; ws.forEach((w, i) => {{ word(w, x, y, size, isRed(w), scales ? scales[i] : 1); x += widths[i] + sp; }}); }}
const keyWord = (w, list) => /\\d/.test(w) || list.some(k => w.replace(/[^\\w']/g, '').toUpperCase() === k.toUpperCase());
function title(T) {{ const sc = Math.min(3, Math.floor(T / 15)), s = T - sc * 15; if (s > 3.4) return; const [txt, red] = TEXTS[sc], a = s < .15 ? s / .15 : s > 3.1 ? (3.4 - s) / .3 : 1, pop = 1 + .25 * (1 - ease(clamp(s / .2)));
  const ws = txt.split(' '), rows = []; let cur = []; o.font = '88px Anton'; for (const w of ws) {{ const tr = [...cur, w].join(' '); if (o.measureText(tr).width > 900 && cur.length) {{ rows.push(cur); cur = [w]; }} else cur.push(w); }} rows.push(cur);
  o.save(); o.globalAlpha = a; rows.forEach((r, i) => line(r, OW / 2, 360 + i * 104, 88, w => red.length ? keyWord(w, red) : w === ws[ws.length - 1], r.map(() => pop))); o.restore(); }}
function captions(T) {{ const i = WORDS.findIndex(w => T >= w[1] && T < w[2] + .25); if (i < 0) return; const sc = WORDS[i][0]; let a = i; while (a > 0 && WORDS[a - 1][0] === sc && i - a < 2 && !/[.?!,:]$/.test(WORDS[a - 1][3])) a--;
  const chunk = WORDS.slice(a, i + 1).map(w => w[3]); const cur = WORDS[i], pop = 1 + .14 * (1 - ease(clamp((T - cur[1]) / .12))); line(chunk, OW / 2, 1430, 104, w => keyWord(w, TEXTS[sc][1]), chunk.map((_, j) => j === chunk.length - 1 ? pop : 1)); }}
window.__total = TOTAL; window.__lines = SHOTS.map(s => ({{ scene: s.scene, start: s.start, end: s.start + s.d }}));
window.__at = T => {{ let i = SHOTS.findIndex(s => T < s.start + s.d); if (i < 0) i = SHOTS.length - 1; const sh = SHOTS[i], s = T - sh.start;
  const black = drawShot(sh, s); finish(); if (black) {{ o.fillStyle = '#000'; o.fillRect(0, 0, OW, OH); return; }} title(T); captions(T);
  if (s < .06 && i > 0 && !has(sh, 'flash')) {{ o.fillStyle = 'rgba(0,0,0,.6)'; o.fillRect(0, 0, OW, OH); }} }};
await document.fonts.load('80px Anton'); window.__ready = true;
</script>"""
open(out, "w").write(page); print(len(shots), "shots", round(t0, 2), "s")
