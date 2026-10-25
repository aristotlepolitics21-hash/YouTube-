// Stickman documentary engine: 2D canvas, ink on paper, one red accent.
(() => {
const W = 1280, H = 720;
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const SERIF = '"Liberation Serif", Georgia, serif', SANS = '"Liberation Sans", Arial, sans-serif', BIG = 'Anton, Impact, sans-serif';
const P = { paper: '#e8e1d2', paper2: '#d9d0bd', ink: '#1c1b19', soft: '#6b655a', red: '#a3291f', sea: '#5d7380', sea2: '#41545e', night: '#0f141b', night2: '#1b2430', ice: '#f2f4f2', gold: '#e2b45a' };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, seg = (t, a, b) => clamp((t - a) / (b - a)), fade = (t, a, b) => ease(seg(t, a, b));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- paper ----------
const grain = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), id = x.createImageData(W, H), r = rng(7);
  for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 14; } x.putImageData(id, 0, 0); return c; })();
function bg(night = false) { ctx.fillStyle = night ? P.night : P.paper; ctx.fillRect(0, 0, W, H); }
function finish(night = false) { ctx.globalAlpha = night ? .5 : 1; ctx.drawImage(grain, 0, 0); ctx.globalAlpha = 1;
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .9); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, night ? 'rgba(0,0,0,.6)' : 'rgba(60,45,25,.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
const inkOf = night => night ? P.paper : P.ink;

// ---------- primitives ----------
function line(x1, y1, x2, y2, c = P.ink, w = 3) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
function poly(pts, fill, stroke, w = 3) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.stroke(); } }
function circ(x, y, r, fill, stroke, w = 3) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); } }
function rect(x, y, w, h, fill, stroke, lw = 3) { if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.strokeRect(x, y, w, h); } }
function text(s, x, y, size, o = {}) { ctx.save(); ctx.globalAlpha *= o.a ?? 1; ctx.fillStyle = o.c || P.ink; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle'; ctx.font = `${o.it ? 'italic ' : ''}${o.w || 400} ${size}px ${o.f || SERIF}`; if (o.ls) ctx.letterSpacing = o.ls + 'px'; ctx.fillText(s, x, y); ctx.restore(); }
function wrap(s, x, y, size, maxW, o = {}) { ctx.font = `${o.it ? 'italic ' : ''}${o.w || 400} ${size}px ${o.f || SERIF}`; const words = s.split(' '), lines = []; let cur = '';
  words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur);
  const lh = size * 1.25, y0 = y - (lines.length - 1) * lh / 2; lines.forEach((l, i) => text(l, x, y0 + i * lh, size, o)); return lines.length; }
function label(s, x, y, o = {}) { text(s.toUpperCase(), x, y, o.size || 18, Object.assign({ f: SANS, w: 700, ls: 3, c: o.c || P.soft }, o)); }

// ---------- stick figures ----------
// angles: 0 = straight down, positive swings forward (toward facing direction)
function stick(x, y, s = 1, pose = {}, o = {}) {
  const c = o.c || P.ink, w = (o.w || 3.4) * Math.max(.6, s), f = o.face ?? 1, k = 46 * s;
  const lean = pose.lean || 0, hipX = x, hipY = y - k * .95 + (pose.drop || 0) * k;
  const nx = hipX + Math.sin(lean) * k * .8 * f, ny = hipY - Math.cos(lean) * k * .8;
  const limb = (ox, oy, a1, a2, l1, l2) => { const x1 = ox + Math.sin(a1) * l1 * f, y1 = oy + Math.cos(a1) * l1, x2 = x1 + Math.sin(a1 + a2) * l2 * f, y2 = y1 + Math.cos(a1 + a2) * l2; line(ox, oy, x1, y1, c, w); line(x1, y1, x2, y2, c, w); return [x2, y2]; };
  const lg = pose.legs || [[.15, -.05], [-.15, .05]];
  limb(hipX, hipY, lg[0][0], lg[0][1], k * .5, k * .48); limb(hipX, hipY, lg[1][0], lg[1][1], k * .5, k * .48);
  line(hipX, hipY, nx, ny, c, w);
  const am = pose.arms || [[.25, .2], [-.25, -.15]]; const sx = nx - Math.sin(lean) * k * .08 * f, sy = ny + k * .08;
  const hands = [limb(sx, sy, am[0][0], am[0][1], k * .36, k * .34), limb(sx, sy, am[1][0], am[1][1], k * .36, k * .34)];
  const ha = (pose.head || 0) + lean, hr = k * .2, hx = nx + Math.sin(ha) * hr * 1.15 * f, hy = ny - Math.cos(ha) * hr * 1.15;
  circ(hx, hy, hr, o.fill || (o.night ? P.night : P.paper), c, w);
  if (o.cap) { poly([[hx - hr * 1.05, hy - hr * .35], [hx + hr * 1.05, hy - hr * .35], [hx + hr * .8, hy - hr * 1.1], [hx - hr * .8, hy - hr * 1.1]], c); line(hx - hr * .2 * f, hy - hr * .35, hx + hr * 1.5 * f, hy - hr * .3, c, w); }
  if (o.phones) { ctx.strokeStyle = c; ctx.lineWidth = w * .8; ctx.beginPath(); ctx.arc(hx, hy, hr * 1.25, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); circ(hx - hr * 1.1, hy + hr * .1, hr * .35, c); }
  if (o.hat) { rect(hx - hr * .75, hy - hr * 1.9, hr * 1.5, hr * 1.1, c); line(hx - hr * 1.3, hy - hr * .85, hx + hr * 1.3, hy - hr * .85, c, w); }
  if (o.scarf) { ctx.fillStyle = o.scarf; ctx.beginPath(); ctx.arc(hx, hy, hr * 1.05, Math.PI, 0); ctx.fill(); }
  return { hands, head: [hx, hy], neck: [nx, ny], hip: [hipX, hipY] };
}
const POSE = {
  stand: () => ({}),
  walk: ph => ({ legs: [[Math.sin(ph) * .45, -Math.max(0, Math.sin(ph)) * .5], [-Math.sin(ph) * .45, -Math.max(0, -Math.sin(ph)) * .5]], arms: [[-Math.sin(ph) * .4, .2], [Math.sin(ph) * .4, .2]] }),
  point: () => ({ arms: [[1.9, 0], [-.2, -.1]] }),
  up: () => ({ arms: [[2.8, .1], [2.6, .1]] }),
  headDown: () => ({ head: .5, arms: [[.1, .1], [-.1, .05]] }),
  mourn: () => ({ head: .6, lean: .08, arms: [[.4, 1.6], [.3, 1.7]] }),
  sit: () => ({ legs: [[1.5, -1.5], [1.4, -1.4]], drop: .45, arms: [[.6, .6], [.5, .7]] }),
  look: () => ({ head: -.35, arms: [[.2, .2], [-.2, -.1]] }),
  binoc: () => ({ head: -.1, arms: [[1.4, 1.5], [1.3, 1.6]] }),
  desk: () => ({ legs: [[1.5, -1.5], [1.4, -1.4]], drop: .45, lean: .25, arms: [[1.2, .5], [1.1, .6]], head: .2 }),
  row: ph => ({ legs: [[1.4, -1.4], [1.3, -1.3]], drop: .45, lean: Math.sin(ph) * .3, arms: [[1.3 + Math.sin(ph) * .4, .3], [1.2 + Math.sin(ph) * .4, .3]] }),
  wheel: ph => ({ arms: [[1.5, -.4 + Math.sin(ph) * .2], [1.4, -.2 - Math.sin(ph) * .2]] }),
  phone: () => ({ arms: [[2.2, 2.0], [.2, .1]], head: .1 }),
  hammer: ph => ({ arms: [[1.6 + Math.sin(ph) * .8, .2], [.2, .1]] }),
};

// ---------- camera ----------
function cam(t, z0 = 1, z1 = 1.05, px = 0, py = 0) { const z = lerp(z0, z1, ease(t)); ctx.translate(W / 2 + px * t, H / 2 + py * t); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }

// ---------- props ----------
function sea(y, night, t, T) { const c1 = night ? P.night2 : P.sea, c2 = night ? '#0a0e14' : P.sea2; const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(-200, y, W + 400, H - y + 200);
  ctx.strokeStyle = night ? 'rgba(232,225,210,.18)' : 'rgba(232,225,210,.35)'; ctx.lineWidth = 2; for (let i = 0; i < 9; i++) { const yy = y + 14 + i * i * 6, off = (T * 20 * (1 + i * .2) + i * 90) % 160; ctx.beginPath(); for (let x = -160 + off; x < W + 160; x += 160) { ctx.moveTo(x, yy); ctx.lineTo(x + 50 + i * 4, yy); } ctx.stroke(); } }
function starsSky(seed = 3, n = 90) { const r = rng(seed); for (let i = 0; i < n; i++) circ(r() * W, r() * H * .6, r() * 1.4 + .4, 'rgba(232,225,210,.8)'); }
function ship(x, y, w, o = {}) {
  const h = w * .085, night = o.night, ink = night ? P.paper : P.ink, fillLight = night ? '#2a3442' : '#efe9dc';
  ctx.save(); ctx.translate(x, y); if (o.tilt) ctx.rotate(-o.tilt); const half = o.half;
  const L = -w / 2, R = w / 2;
  ctx.save(); if (half === 'stern') { ctx.beginPath(); ctx.rect(L - 10, -w, w * .62 + 10, w * 2); ctx.clip(); } if (half === 'bow') { ctx.beginPath(); ctx.rect(L + w * .62, -w, w, w * 2); ctx.clip(); }
  poly([[L, -h], [R + w * .02, -h * 1.15], [R - w * .02, h * .9], [L + w * .03, h * .9], [L - w * .01, h * .2]], night ? '#05070a' : P.ink, ink, 2);
  rect(L + w * .03, h * .55, w * .93, h * .35, P.red);
  poly([[L + w * .08, -h], [R - w * .12, -h], [R - w * .12, -h * 1.9], [L + w * .08, -h * 1.9]], fillLight, ink, 2);
  poly([[L + w * .14, -h * 1.9], [R - w * .2, -h * 1.9], [R - w * .2, -h * 2.5], [L + w * .14, -h * 2.5]], fillLight, ink, 2);
  for (let i = 0; i < 4; i++) { const fx = L + w * (.24 + i * .155); poly([[fx, -h * 2.5], [fx + w * .045, -h * 2.5], [fx + w * .035, -h * 4.4], [fx - w * .01, -h * 4.4]], night ? '#3a4452' : '#c9b48a', ink, 2); poly([[fx - w * .01, -h * 4.4], [fx + w * .035, -h * 4.4], [fx + w * .037, -h * 3.9], [fx - w * .006, -h * 3.9]], ink); }
  line(L + w * .1, -h * 1.9, L + w * .1, -h * 5, ink, 1.6); line(R - w * .16, -h * 1.9, R - w * .16, -h * 5, ink, 1.6); line(L + w * .1, -h * 5, L - w * .005, -h * 1.05, ink, .8); line(R - w * .16, -h * 5, R + w * .01, -h * 1.15, ink, .8);
  const lights = o.lights ?? night; for (let i = 0; i < 40; i++) { const px = L + w * (.07 + i * .022); circ(px, -h * .35, w * .0035, lights ? P.gold : ink); if (i % 2) circ(px, -h * 1.45, w * .003, lights ? P.gold : (night ? P.paper : ink)); }
  ctx.restore(); ctx.restore(); }
function iceberg(x, y, s, night, under = true) { const c = night ? '#c8d2da' : P.ice; poly([[x - 70 * s, y], [x - 40 * s, y - 60 * s], [x - 10 * s, y - 50 * s], [x + 10 * s, y - 95 * s], [x + 40 * s, y - 40 * s], [x + 80 * s, y]], c, inkOf(night), 2.5);
  if (under) poly([[x - 70 * s, y], [x + 80 * s, y], [x + 140 * s, y + 90 * s], [x - 20 * s, y + 160 * s], [x - 130 * s, y + 80 * s]], 'rgba(220,235,240,.18)', 'rgba(232,225,210,.25)', 1.5); }
function boat(x, y, s, n, night, o = {}) { const ink = inkOf(night); poly([[x - 60 * s, y - 14 * s], [x + 60 * s, y - 14 * s], [x + 48 * s, y + 6 * s], [x - 48 * s, y + 6 * s]], night ? '#3a3226' : '#c8b48c', ink, 2.5);
  for (let i = 0; i < n; i++) { const px = x - 50 * s + (i % 12) * 9 * s, row = Math.floor(i / 12); circ(px, y - 22 * s - row * 6 * s, 4 * s, night ? P.night : P.paper, ink, 1.5); } if (o.oars) { line(x - 40 * s, y - 10 * s, x - 70 * s, y + 18 * s, ink, 2); line(x + 40 * s, y - 10 * s, x + 70 * s, y + 18 * s, ink, 2); } }
function clockFace(x, y, r, h, m, night) { const ink = inkOf(night); circ(x, y, r, night ? P.night2 : '#f2ece0', ink, 4); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(x + Math.sin(a) * r * .85, y - Math.cos(a) * r * .85, x + Math.sin(a) * r * .95, y - Math.cos(a) * r * .95, ink, 3); }
  const ha = ((h % 12) + m / 60) / 12 * Math.PI * 2, ma = m / 60 * Math.PI * 2; line(x, y, x + Math.sin(ha) * r * .5, y - Math.cos(ha) * r * .5, ink, 6); line(x, y, x + Math.sin(ma) * r * .78, y - Math.cos(ma) * r * .78, P.red, 4); circ(x, y, 6, P.red); }
function frame(x, y, w, h, night) { const ink = inkOf(night); rect(x, y, w, h, night ? P.night2 : '#efe9dc', ink, 3); rect(x + 8, y + 8, w - 16, h - 16, null, ink, 1); }
function iconMan(x, y, s, c) { circ(x, y - 15 * s, 4 * s, c); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x - 5 * s, y - 9 * s); ctx.lineTo(x + 5 * s, y - 9 * s); ctx.lineTo(x + 3.5 * s, y); ctx.lineTo(x - 3.5 * s, y); ctx.closePath(); ctx.fill(); }

// ---------- scenes ----------
const SC = {};
SC.title = (t, T, p) => { if (p.art) { SC[p.art](Math.min(1, t * .6), T, Object.assign({}, p.artp || {}, { label: null })); ctx.fillStyle = 'rgba(10,12,16,.55)'; ctx.fillRect(0, 0, W, H); } else { bg(true); starsSky(4); sea(520, true, t, T); ship(W / 2 + 120, 520, 520, { night: true, lights: true }); finish(true); }
  text(p.title, W / 2, 210, 120, { f: BIG, c: P.paper, a: fade(t, .05, .3), ls: 12 }); text(p.sub, W / 2, 300, 34, { it: 1, c: P.paper, a: fade(t, .2, .45) }); return true; };
SC.date = (t, T, p) => { bg(); cam(t, 1, 1.04); finish(); rect(W / 2 - 300, 260, 600, 4, P.red); text(p.date, W / 2, 340, 88, { f: BIG, a: fade(t, .05, .25) }); label(p.place, W / 2, 430, { a: fade(t, .2, .4), size: 22 }); return true; };
SC.lesson = (t, T, p) => { bg(); finish(); wrap(p.text, W / 2, H / 2, 58, 980, { a: fade(t, .05, .3) }); rect(W / 2 - 60, H / 2 + 90, 120, 4, P.red); return true; };
SC.stat = (t, T, p) => { bg(); cam(t); finish(); text(p.value, W / 2, 320, 150, { f: BIG, c: P.red, a: fade(t, .05, .25) }); label(p.label, W / 2, 450, { size: 24, a: fade(t, .2, .4) }); return true; };
SC.counter = (t, T, p) => { bg(); finish(); const n = Math.min(p.n, Math.floor(seg(t, .05, .7) * p.n) + 1);
  for (let i = 0; i < p.n; i++) { const x = W / 2 - (p.n - 1) * 70 + i * 140, y = 300, on = i < n; ctx.globalAlpha = on ? 1 : .15; rect(x - 50, y - 34, 100, 68, '#f2ece0', P.ink, 3); line(x - 50, y - 34, x, y + 6, P.ink, 3); line(x + 50, y - 34, x, y + 6, P.ink, 3); ctx.globalAlpha = 1; }
  text(String(n), W / 2, 450, 96, { f: BIG, c: P.red }); label(p.label, W / 2, 530, { size: 22 }); return true; };
SC.icons = (t, T, p) => { bg(); finish(); const n = Math.ceil(p.total / p.per), red = Math.ceil(p.red / p.per), cols = p.cols || 20, rows = Math.ceil(n / cols), s = p.per === 1 ? 1.5 : 1.25;
  const gx = W / 2 - (cols - 1) * 14 * s * 2 / 2, gy = 300 - (rows - 1) * 18 * s * 2 / 2; const shown = Math.floor(seg(t, .02, .35) * n), reds = Math.floor(seg(t, .35, .7) * red);
  for (let i = 0; i < shown; i++) { const c = (p.fill ? i < reds : i >= n - reds) ? P.red : P.ink; iconMan(gx + (i % cols) * 28 * s, gy + Math.floor(i / cols) * 36 * s, s, (p.fill && i >= red) ? 'rgba(28,27,25,.18)' : c); }
  label(p.label, W / 2, 640, { size: 22, a: fade(t, .4, .6) }); if (p.per > 1) text(`each figure = ${p.per} people`, W / 2, 678, 18, { it: 1, c: P.soft, a: fade(t, .5, .7) }); return true; };
SC.bars = (t, T, p) => { bg(); finish(); p.items.forEach(([lab, v, unit], i) => { const y = 280 + i * 150, k = fade(t, .1 + i * .2, .45 + i * .2), bw = 760 * v / p.max * k, red = p.red && i === p.items.length - 1;
    label(lab, 230, y - 40, { align: 'left' }); rect(230, y - 20, 760, 54, 'rgba(28,27,25,.08)'); rect(230, y - 20, bw, 54, red ? P.red : P.ink); text(Math.round(v * k).toLocaleString('en-US'), 230 + bw + 18, y + 7, 46, { f: BIG, align: 'left', c: red ? P.red : P.ink }); }); return true; };
SC.quote = (t, T, p) => { bg(); finish(); text('“', 230, 230, 200, { c: P.red, a: fade(t, 0, .2) }); wrap(p.text, W / 2, 340, 50, 880, { it: 1, a: fade(t, .05, .3) }); label('— ' + p.who, W / 2, 500, { a: fade(t, .3, .5), size: 20 }); return true; };
SC.timeline = (t, T, p) => { bg(); finish(); const x0 = 140, x1 = 1140, y = 380, k = fade(t, 0, .8); line(x0, y, lerp(x0, x1, k), y, P.ink, 4);
  p.events.forEach(([lab, at], i) => { const x = lerp(x0, x1, at), a = seg(k, at - .05, at + .05); if (!a) return; circ(x, y, 12, P.red); text(lab, x, i % 2 ? y + 60 : y - 60, 26, { a, w: 700 }); line(x, y + (i % 2 ? 14 : -14), x, y + (i % 2 ? 40 : -40), P.ink, 2); }); return true; };
SC.checklist = (t, T, p) => { bg(); finish(); label(p.head || 'After 1914, every ship had to have', W / 2, 150, { size: 20 }); p.items.forEach((it, i) => { const y = 250 + i * 95, a = fade(t, .08 + i * .18, .2 + i * .18); ctx.globalAlpha = a; rect(240, y - 24, 48, 48, null, P.ink, 3);
    ctx.globalAlpha = 1; if (a > .5) { line(250, y, 262, y + 13, P.red, 6); line(262, y + 13, 282, y - 16, P.red, 6); } text(it, 320, y, 36, { align: 'left', a }); }); return true; };
SC.clock = (t, T, p) => { bg(true); finish(true); const [hh, rest] = p.time.split(':'); const mm = parseInt(rest); const pm = /PM/.test(p.time); clockFace(W / 2 - 200, 360, 170, parseInt(hh), mm, true);
  text(p.time, W / 2 + 220, 330, 110, { f: BIG, c: P.paper, a: fade(t, .05, .25) }); label(p.date + (p.year === undefined ? ' 1912' : p.year ? ' ' + p.year : ''), W / 2 + 220, 430, { c: P.gold, size: 22, a: fade(t, .2, .4) }); return true; };
SC.portrait = (t, T, p) => { bg(); cam(t, 1, 1.04); finish(); frame(W / 2 - 330, 140, 300, 380); ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - 322, 148, 284, 364); ctx.clip(); stick(W / 2 - 180, 640, 4.2, POSE.stand(), { cap: p.cap, hat: p.hat, scarf: p.scarf }); ctx.restore();
  text(p.name, W / 2 + 20, 290, 50, { align: 'left', a: fade(t, .05, .25), w: 700 }); rect(W / 2 + 20, 330, 80, 4, P.red); wrap(p.role, W / 2 + 230, 390, 26, 420, { a: fade(t, .15, .35), c: P.soft }); return true; };
SC.ship = (t, T, p) => { const night = p.state !== 'sail' && p.state !== 'dock' || p.dusk; bg(night); ctx.save(); cam(t, 1, 1.05);
  if (night) starsSky(5); if (p.dusk) { const g = ctx.createLinearGradient(0, 0, 0, 500); g.addColorStop(0, '#2a2438'); g.addColorStop(1, '#c8784a'); ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, 620); }
  if (p.state === 'dock') { rect(0, 380, W, 340, '#c9bea8'); for (let i = 0; i < 6; i++) { line(120 + i * 200, 380, 120 + i * 200, 80, P.ink, 4); line(120 + i * 200, 80, 200 + i * 200, 120, P.ink, 3); } ship(W / 2, 520, 900, {}); rect(0, 520, W, 200, '#9aa3a0'); }
  else { const y = 500; sea(y, night, t, T); let x = W / 2; if (p.state === 'sail') x = lerp(W / 2 + 160, W / 2 - 160, t);
    if (p.berg) iceberg(p.turn ? W / 2 + 250 : W / 2 + 330 - (p.scrape ? t * 120 : 0), y, 1.4, night);
    const tilt = (p.tilt || 0) * (p.state === 'split' ? 1 : lerp(.6, 1, t)) + (p.turn ? -.03 * t : 0); const sinkY = y + (p.state === 'list' ? lerp(0, 40, t) : p.state === 'split' ? 80 : 0);
    if (p.state === 'split') { ship(x - 120, sinkY + 40 * t, 760, { night, half: 'stern', tilt: lerp(.35, .7, t), lights: false }); ship(x + 140, sinkY + 120 + 200 * t, 760, { night, half: 'bow', tilt: -.5, lights: false }); }
    else ship(x, sinkY, 760, { night, tilt: tilt, lights: night && !(p.tilt > .2 && t > .6) });
    if (p.scrape) for (let i = 0; i < 12; i++) { const r = rng(i + 3); circ(W / 2 + 230 + r() * 60, y - 30 - r() * 40 * t, 4, P.ice); }
    if (p.rockets) { const ph = (T * .5) % 1; if (ph < .6) { const ry = lerp(y - 80, 120, ph / .6); circ(W / 2 - 120, ry, 4, P.gold); } else { for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; circ(W / 2 - 120 + Math.cos(a) * 60 * (ph - .6) * 2.5, 120 + Math.sin(a) * 60 * (ph - .6) * 2.5, 3, P.ice); } } }
    ctx.globalAlpha = .9; ctx.fillStyle = night ? P.night2 : P.sea; ctx.fillRect(-200, y + 30, W + 400, 2); ctx.globalAlpha = 1; }
  ctx.restore(); finish(night); return true; };
SC.lookout = (t, T, p) => { bg(true); ctx.save(); cam(t, 1.02, 1.08); starsSky(6); sea(560, true, t, T); line(380, 720, 380, 260, P.paper, 8); poly([[300, 300], [460, 300], [440, 380], [320, 380]], P.night2, P.paper, 3);
  stick(360, 330, 1.4, POSE.look(), { c: P.paper, night: true }); stick(410, 330, 1.4, p.berg ? POSE.point() : POSE.look(), { c: P.paper, night: true, face: 1 });
  if (p.berg) { iceberg(lerp(1080, 980, t), 560, .6 + t * .4, true); } const bell = p.berg && t < .5 && Math.sin(T * 14) > 0; if (bell) text('●  ●  ●', 380, 230, 26, { c: P.red, f: SANS });
  ctx.restore(); finish(true); return true; };
SC.bridge = (t, T, p) => { bg(true); ctx.save(); cam(t, 1, 1.05); rect(0, 0, W, 300, P.night); starsSky(8, 40); for (let i = 0; i < 5; i++) rect(80 + i * 240, 80, 200, 180, null, P.paper, 3); rect(0, 300, W, 420, '#1a2028');
  const wx = 620, wy = 470, wr = 70, ang = p.turn ? -ease(seg(t, .1, .6)) * 2.2 : Math.sin(T * .3) * .1; circ(wx, wy, wr, null, P.paper, 6); for (let i = 0; i < 8; i++) { const a = ang + i / 8 * Math.PI * 2; line(wx, wy, wx + Math.cos(a) * (wr + 18), wy + Math.sin(a) * (wr + 18), P.paper, 4); } circ(wx, wy, 12, P.paper);
  line(wx, wy + wr, wx, 720, P.paper, 8); stick(wx - 110, 640, 2.3, POSE.wheel(ang), { c: P.paper, night: true, cap: 1 }); stick(940, 640, 2.2, p.turn ? POSE.point() : POSE.stand(), { c: P.paper, night: true, cap: 1, face: -1 });
  rect(1040, 430, 50, 160, '#2a3240', P.paper, 3); circ(1065, 430, 40, '#2a3240', P.paper, 3); line(1065, 430, 1065 + Math.sin(p.turn ? -2.4 * seg(t, .2, .4) : 0) * 32, 430 - Math.cos(p.turn ? -2.4 * seg(t, .2, .4) : 0) * 32, P.red, 5);
  ctx.restore(); finish(true); return true; };
SC.radio = (t, T, p) => { bg(true); ctx.save(); cam(t, 1, 1.05); rect(0, 470, W, 250, '#211a14'); rect(260, 420, 760, 30, '#4a3a2a', P.paper, 2); rect(560, 250, 380, 170, '#2a3240', P.paper, 3);
  for (let i = 0; i < 6; i++) circ(610 + i * 55, 300, 14, null, P.paper, 3); for (let i = 0; i < 8; i++) rect(600 + i * 40, 350, 20, 40, null, P.paper, 2);
  stick(430, 640, 2.4, POSE.desk(), { c: P.paper, night: true, phones: 1 }); const key = Math.sin(T * 18) > .3; line(500, 412, 540, key ? 412 : 404, P.paper, 4);
  if (key) for (let i = 0; i < 6; i++) { const r = rng(Math.floor(T * 20) + i); line(750, 250, 750 + (r() - .5) * 80, 250 - r() * 70, P.gold, 2); }
  const n = Math.floor(p.text.length * seg(t, .1, .8)); text(p.text.slice(0, n), W / 2, 140, 56, { f: '"Liberation Mono", monospace', c: p.text.startsWith('CQD') ? P.red : P.gold, w: 700, ls: 6 });
  const morse = '·−·−  −−·−  ·−··'; text(morse, W / 2, 200, 28, { c: P.soft, f: '"Liberation Mono", monospace' }); ctx.restore(); finish(true); return true; };
SC.californian = (t, T, p) => { bg(true); ctx.save(); cam(t, 1, 1.04); starsSky(11); sea(500, true, t, T); ship(1000, 500, 300, { night: true, lights: true });
  frame(120, 140, 460, 300, true); rect(160, 330, 380, 70, '#3a3226', P.paper, 2); stick(240, 360, 1.6, { legs: [[1.57, 0], [1.57, 0]], lean: 1.57, arms: [[.2, 0], [.1, 0]] }, { c: P.paper, night: true }); text('z z z', 420, 250, 36, { it: 1, c: P.paper, a: .5 + .5 * Math.sin(T * 2) });
  rect(440, 200, 90, 60, '#2a3240', P.paper, 2); text('OFF', 485, 230, 18, { f: SANS, w: 700, c: P.red });
  if (p.rockets) { for (let k = 0; k < 2; k++) { const ph = ((T * .35) + k * .5) % 1; if (ph > .5) for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; circ(860 + k * 60 + Math.cos(a) * 40 * (ph - .5) * 2, 160 + Math.sin(a) * 40 * (ph - .5) * 2, 2.5, P.ice); } } label('rockets seen · not understood', 900, 260, { c: P.gold, size: 16 }); }
  label('SS Californian · wireless switched off', 350, 470, { c: P.paper, size: 16 }); ctx.restore(); finish(true); return true; };
SC.compartments = (t, T, p) => { bg(); finish(); const x0 = 160, x1 = 1120, y0 = 260, y1 = 470, n = 16, bw = (x1 - x0) / n;
  poly([[x0, y0], [x1 + 40, y0 - 10], [x1 + 10, y1], [x0 + 20, y1]], '#efe9dc', P.ink, 4); const fl = p.flooded || 0, k = ease(seg(t, .1, .7));
  for (let i = 0; i < n; i++) { const bx = x1 - (i + 1) * bw; if (i < fl) { const lev = Math.min(1, k * (fl - i * .1)); const h = (y1 - y0) * (p.spill && i === fl - 1 ? lev * .7 : lev); rect(bx, y1 - h, bw, h, i >= 5 ? 'rgba(163,41,31,.55)' : 'rgba(93,115,128,.8)'); } if (i > 0) line(bx + bw, y1, bx + bw, y0 + 40, P.ink, 3); }
  line(x0, y0 + 40, x1 + 30, y0 + 30, P.soft, 1); label('watertight bulkheads stop here', 640, y0 + 15, { size: 13 }); if (p.gash) for (let i = 0; i < 9; i++) line(x1 - i * 32 - 10, y1 - 30 - (i % 2) * 8, x1 - i * 32 - 30, y1 - 26, P.red, 4);
  text('BOW →', x1 + 20, y1 + 40, 20, { f: SANS, w: 700, align: 'right', c: P.soft }); label(p.label, W / 2, 580, { size: 24, c: p.flooded > 4 ? P.red : P.ink, a: fade(t, .2, .4) }); return true; };
SC.lifeboat = (t, T, p) => { const night = p.mode !== 'davits'; bg(night); ctx.save(); cam(t, 1, 1.05); if (night) starsSky(13);
  if (p.mode === 'davits') { rect(0, 420, W, 300, '#c9bea8'); line(0, 420, W, 420, P.ink, 4); for (let i = 0; i < 5; i++) { const x = 160 + i * 240; line(x, 420, x, 260, P.ink, 5); line(x, 260, x + 60, 260, P.ink, 4); boat(x + 70, 340, .9, 0, false); } for (let i = 0; i < 4; i++) stick(250 + i * 240, 560, 1.5, POSE.walk(T * 4 + i), { face: i % 2 ? 1 : -1 }); }
  else if (p.mode === 'lower') { rect(0, 0, 420, 720, '#05070a'); line(420, 0, 420, 720, P.paper, 3); for (let i = 0; i < 12; i++) circ(380, 60 + i * 50, 6, P.gold); const by = lerp(160, 560, ease(seg(t, .1, .9))); line(440, 0, 470, by - 20, P.paper, 2); line(640, 0, 610, by - 20, P.paper, 2); boat(540, by, 1.6, p.n, true);
    sea(600, true, t, T); label(`${p.n} aboard · room for ${p.cap}`, 900, 140, { c: P.gold, size: 22, a: fade(t, .2, .4) }); }
  else { sea(420, true, t, T); boat(lerp(300, 700, ease(t)), 440, 1.3, 8, true, { oars: 1 }); for (let i = 0; i < 14; i++) { const r = rng(i + 50); rect(400 + r() * 700, 450 + r() * 160, 12 + r() * 30, 4, '#3a3226'); } }
  ctx.restore(); finish(night); return true; };
SC.crowd = (t, T, p) => { const night = p.mode === 'deck' || p.dark; bg(night); ctx.save(); cam(t, 1, 1.05); if (night) starsSky(15); const ink = inkOf(night);
  if (p.mode === 'classes') { ['FIRST CLASS', 'SECOND CLASS', 'THIRD CLASS'].forEach((lab, r) => { const y = 230 + r * 170; line(150, y, 1130, y, ink, 3); label(lab, 150, y - 120, { align: 'left', c: p.dark && r === 2 ? P.red : (night ? P.gold : P.soft), size: 16 });
      const n = [6, 7, 12][r]; for (let i = 0; i < n; i++) stick(240 + i * (r === 2 ? 70 : 110), y, 1.1, POSE.walk(T * 3 + i + r), { c: p.dark && r === 2 ? P.red : ink, night, hat: r === 0 && i % 2 === 0, scarf: r === 2 && i % 3 === 0 ? (night ? '#5a4a3a' : '#8a7a6a') : null, face: i % 2 ? 1 : -1 }); }); }
  else { ctx.translate(W / 2, 520); ctx.rotate(-(p.tilt || 0) * (1 + t)); ctx.translate(-W / 2, -520); line(-100, 520, W + 100, 520, ink, 4); for (let i = 0; i < 30; i++) line(-100 + i * 50, 520, -100 + i * 50, 470, ink, 2); line(-100, 470, W + 100, 470, ink, 3);
    for (let i = 0; i < 14; i++) { const r = rng(i + 9); stick(80 + i * 85 + r() * 20, 520, 1.3, i % 4 === 0 ? POSE.point() : POSE.stand(), { c: ink, night, hat: r() < .3, face: r() < .5 ? 1 : -1 }); } }
  ctx.restore(); finish(night); return true; };
SC.map = (t, T, p) => { bg(); ctx.save(); cam(t, 1, 1.04); ctx.strokeStyle = 'rgba(28,27,25,.12)'; ctx.lineWidth = 1; for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  (p.shapes || []).forEach(sh => poly(sh.map(([x, y]) => [x * W, y * H]), '#d6cbb4', P.ink, 2));
  if (!p.ships && !p.land) { poly([[1000, 0], [W, 0], [W, 600], [1120, 560], [1080, 420], [1150, 330], [1060, 250], [1000, 140]], '#d6cbb4', P.ink, 2); poly([[960, 120], [1010, 100], [1020, 210], [970, 230]], '#d6cbb4', P.ink, 2); poly([[0, 120], [180, 160], [220, 300], [140, 420], [160, 560], [0, 620]], '#d6cbb4', P.ink, 2); }
  const pts = (p.route || []).map(([n, x, y]) => [n, x * W, y * H]); const k = ease(seg(t, .1, .85)), segs = pts.length - 1;
  ctx.setLineDash([10, 10]); ctx.strokeStyle = P.red; ctx.lineWidth = 4; ctx.beginPath(); pts.forEach(([, x, y], i) => { if (i === 0) ctx.moveTo(x, y); else { const f = clamp(k * segs - (i - 1)); if (f > 0) ctx.lineTo(lerp(pts[i - 1][1], x, f), lerp(pts[i - 1][2], y, f)); } }); ctx.stroke(); ctx.setLineDash([]);
  pts.forEach(([n, x, y], i) => { const a = i === 0 ? 1 : seg(k * segs, i - 1, i - .7); circ(x, y, 9, P.red); text(n, x, y - 26, 26, { a, w: 700 }); });
  if (p.ships) { const ip = pts[0], cp = pts[1]; ship(ip[1], ip[2] + 70, 170, {}); ship(lerp(cp[1], ip[1], k * .25), cp[2] + 70, 140, {}); if (p.dist) label(p.dist, (ip[1] + cp[1]) / 2 + 150, (ip[2] + cp[2]) / 2 - 10, { c: P.red, size: 24 }); }
  (p.circles || []).forEach(([x, y, r, lab], i) => { const a = fade(t, .2 + i * .15, .4 + i * .15); ctx.globalAlpha = a; circ(x * W, y * H, r * W * a, 'rgba(163,41,31,.12)', P.red, 2); ctx.globalAlpha = 1; if (lab) label(lab, x * W, y * H + r * W + 20, { c: P.red, size: 14, a }); });
  if (p.plume) { const [x, y, dx, dy] = p.plume, k = ease(seg(t, .1, .9)); for (let i = 0; i < 40; i++) { const r = rng(i + 5); circ((x + dx * k * r()) * W + (r() - .5) * 60 * k, (y + dy * k * r()) * H + (r() - .5) * 60 * k, 24 + r() * 30 * k, 'rgba(28,27,25,.08)'); } }
  (p.marks || []).forEach(([n, x, y], i) => { const a = fade(t, .1 + i * .1, .3 + i * .1); circ(x * W, y * H, 7, P.ink); text(n, x * W + 14, y * H, 20, { a, align: 'left' }); });
  if (p.upto != null && pts.length > 3) { iceberg(pts[2][1] - 150, pts[2][2] + 120, .25, false, false); label('ice field', pts[2][1] - 150, pts[2][2] + 145, { size: 13 }); }
  ctx.restore(); finish(); return true; };
SC.ocean = (t, T, p) => { bg(true); ctx.save(); cam(t, 1, 1.06); starsSky(21, 140); sea(380, true, t, T); for (let i = 0; i < 4; i++) boat(160 + i * 300 + Math.sin(T * .5 + i) * 10, 430 + (i % 2) * 30, .55, 6, true, { oars: 1 });
  for (let i = 0; i < 26; i++) { const r = rng(i + 77); rect(r() * W, 470 + r() * 220, 10 + r() * 40, 3, 'rgba(232,225,210,.35)'); } ctx.restore(); finish(true); text('−2 °C', W - 140, 110, 64, { f: BIG, c: P.ice, a: fade(t, .2, .4) }); label('water temperature', W - 140, 160, { c: P.paper, size: 14, a: fade(t, .25, .45) }); return true; };
SC.rescue = (t, T, p) => { bg(); const g = ctx.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, '#5a6a80'); g.addColorStop(1, '#e8b88a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 420); ctx.save(); cam(t, 1, 1.05);
  circ(W - 260, 400, 60, 'rgba(255,220,170,.8)'); sea(400, false, t, T); ship(900, 405, 420, {}); label('RMS Carpathia', 900, 270, { size: 16 }); for (let i = 0; i < 5; i++) boat(lerp(140 + i * 110, 650 + i * 30, ease(t) * .6), 470 + (i % 2) * 40, .6, 10, false, { oars: 1 });
  iceberg(220, 400, .5, false, false); iceberg(560, 400, .3, false, false); ctx.restore(); finish(); return true; };
SC.inquiry = (t, T, p) => { bg(); ctx.save(); cam(t, 1, 1.04); rect(0, 500, W, 220, '#c9bea8'); rect(380, 300, 520, 60, '#8a6a48', P.ink, 3); for (let i = 0; i < 5; i++) stick(450 + i * 95, 300, 1.2, POSE.stand(), {});
  rect(160, 420, 120, 80, '#8a6a48', P.ink, 3); stick(220, 420, 1.3, POSE.point(), { face: 1 }); for (let i = 0; i < 9; i++) stick(520 + i * 70, 620, 1, POSE.sit(), { face: -1 }); label(p.label || 'United States Senate inquiry · British Wreck Commissioner\'s inquiry', W / 2, 120, { size: 16 }); ctx.restore(); finish(); return true; };
SC.wreck = (t, T, p) => { ctx.fillStyle = '#04070b'; ctx.fillRect(0, 0, W, H); ctx.save(); cam(t, 1, 1.08); const g = ctx.createRadialGradient(lerp(300, 700, t), 300, 10, lerp(300, 700, t), 360, 420); g.addColorStop(0, 'rgba(90,120,140,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  poly([[260, 560], [900, 520], [1000, 470], [980, 600], [260, 620]], '#151b22', '#5d7380', 2); line(860, 520, 840, 380, '#5d7380', 3); for (let i = 0; i < 20; i++) { const r = rng(i + 9); circ(300 + r() * 650, 540 + r() * 30, 3, 'rgba(160,90,50,.7)'); }
  rect(0, 600, W, 120, '#0a0f14'); ctx.restore(); text('3,800 m', 1080, 120, 64, { f: BIG, c: P.paper, a: fade(t, .2, .4) }); label('found 1 September 1985', 1080, 170, { c: P.soft, size: 14, a: fade(t, .25, .45) }); finish(true); return true; };
SC.memorial = (t, T, p) => { bg(true); const n = Math.floor(seg(t, .05, .8) * p.n), r = rng(1912); for (let i = 0; i < p.n; i++) { const x = 100 + r() * (W - 200), y = 120 + r() * 420; if (i < n) circ(x, y, 2.2, P.gold); }
  text(p.date || '15 April 1912', W / 2, 620, 40, { c: P.paper, it: 1, a: fade(t, .5, .8) }); finish(true); return true; };

/*SETS*/
// ---------- playback ----------
window.DOC = {
  W, H,
  draw(scene, params, t, T, prev) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); const f = SC[scene]; if (!f) { bg(); text('missing scene: ' + scene, W / 2, H / 2, 30); } else f(t, T, params || {}); ctx.restore(); },
  dip(a, night) { if (a <= 0) return; ctx.fillStyle = `rgba(${night ? '8,10,14' : '232,225,210'},${a})`; ctx.fillRect(0, 0, W, H); },
  scenes: Object.keys(SC),
};
})();
