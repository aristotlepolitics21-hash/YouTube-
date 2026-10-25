// Underdog Shorts character rig: realistic-proportion people in a ligne-claire style (fine ink outline, flat muted fills).
// Everything draws into the global X context. A person is drawn in local units with the head centre at (0, 0);
// the face is ~190 wide and ~250 tall, shoulders sit near y = 220, and the waist near y = 700.
const INK = '#2b1d14';
const ll = (a, b, k) => a + (b - a) * k, cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k); return '#' + [f(r), f(g), f(b)].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join(''); }
function inkFill(fill, lw = 3.2) { if (fill) { X.fillStyle = fill; X.fill(); } X.lineWidth = lw; X.strokeStyle = INK; X.lineJoin = 'round'; X.lineCap = 'round'; X.stroke(); }
function stroke(pts, lw = 3, col = INK) { X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.lineWidth = lw; X.strokeStyle = col; X.lineCap = 'round'; X.lineJoin = 'round'; X.stroke(); }
function curve(a, c, b, lw = 3, col = INK) { X.beginPath(); X.moveTo(...a); X.quadraticCurveTo(...c, ...b); X.lineWidth = lw; X.strokeStyle = col; X.lineCap = 'round'; X.stroke(); }
function ell(x, y, rx, ry, fill, lw = 3, rot = 0) { X.beginPath(); X.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); if (fill) { X.fillStyle = fill; X.fill(); } if (lw) { X.lineWidth = lw; X.strokeStyle = INK; X.stroke(); } }

const EXPR = {   // brows: [inner raise, outer raise] per side; mouth: curve, open; lid: upper-lid droop
  neutral: { bi: 0, bo: 0, sk: 0, mc: 0, mo: 0, lid: .15, look: [0, 0] },
  smile: { bi: .1, bo: 0, sk: 0, mc: .7, mo: 0, lid: .2, look: [0, 0] },
  grin: { bi: .2, bo: .1, sk: 0, mc: 1, mo: .4, lid: .3, look: [0, 0] },
  worried: { bi: .9, bo: -.2, sk: 0, mc: -.4, mo: 0, lid: .1, look: [0, .3] },
  sad: { bi: .8, bo: -.3, sk: 0, mc: -.7, mo: 0, lid: .45, look: [0, .6] },
  determined: { bi: -.7, bo: .2, sk: 0, mc: -.1, mo: 0, lid: .35, look: [0, 0] },
  skeptical: { bi: -.3, bo: .2, sk: 1, mc: -.2, mo: 0, lid: .3, look: [.6, 0] },
  surprised: { bi: .8, bo: .6, sk: 0, mc: 0, mo: .7, lid: 0, look: [0, 0] },
  think: { bi: .3, bo: .1, sk: .5, mc: 0, mo: 0, lid: .25, look: [.7, -.6] },
  proud: { bi: 0, bo: .2, sk: 0, mc: .5, mo: 0, lid: .4, look: [0, 0] },
  tired: { bi: .5, bo: -.2, sk: 0, mc: -.25, mo: 0, lid: .6, look: [0, .4] },
  annoyed: { bi: -.8, bo: .3, sk: .3, mc: -.35, mo: 0, lid: .35, look: [.4, 0] },
};

function head(P, ex, t, T) {
  const w = P.kid ? 84 : (P.fem ? 88 : 96), h = P.kid ? 112 : (P.fem ? 120 : 126), dx = t * 24, sk = P.skin, skD = shade(sk, -.16);
  const blink = ((T + (P.seed || 0)) % 4.3) < .13;
  if (P.hair === 'long' || P.hair === 'ponytail' || P.hair === 'bob') hairBack(P, w, h);
  // ears
  [-1, 1].forEach(s => { if (t * s < -.6) return; ell(s * (w - 2) + dx * .2, 4, 15, 25, sk, 3); curve([s * (w + 2) + dx * .2, -8], [s * (w + 8), 4], [s * (w + 1), 18], 2, skD); });
  // neck
  X.beginPath(); X.rect(-36, h * .6, 72, 110); inkFill(sk); X.fillStyle = skD; X.fillRect(-34, h * .6 + 2, 68, 34);
  // face
  const FP = new Path2D(); FP.moveTo(0, -h); FP.bezierCurveTo(w * .8, -h, w, -h * .6, w, -h * .1); FP.bezierCurveTo(w, h * .45, w * .55, h * .9, 0, h);
  FP.bezierCurveTo(-w * .55, h * .9, -w, h * .45, -w, -h * .1); FP.bezierCurveTo(-w, -h * .6, -w * .8, -h, 0, -h); FP.closePath();
  X.save(); X.fillStyle = sk; X.fill(FP); X.clip(FP); X.fillStyle = skD; X.beginPath(); X.ellipse(-t * 40 + (t >= 0 ? -w : w) * .95, 20, w * .55, h * 1.2, 0, 0, 7); X.fill();
  X.fillStyle = 'rgba(214,92,60,.18)'; [-1, 1].forEach(s => { X.beginPath(); X.ellipse(s * 52 + dx, 38, 30, 20, 0, 0, 7); X.fill(); }); X.restore();
  X.lineWidth = 3.4; X.strokeStyle = INK; X.stroke(FP);
  if (P.stubble) { X.save(); X.clip(FP); X.fillStyle = 'rgba(60,40,30,.16)'; X.beginPath(); X.ellipse(dx * .5, h * .72, w * .9, h * .42, 0, 0, 7); X.fill(); X.restore(); }
  // eyes
  const ey = -14, look = ex.look;
  [-1, 1].forEach(s => { const far = s * t < 0 ? 1 - Math.abs(t) * .35 : 1, x = s * 40 + dx, sc = far;
    X.save(); X.translate(x, ey); X.scale(sc, 1);
    if (blink) { curve([-18, 1], [0, 6], [18, 1], 3.4); X.restore(); return; }
    X.beginPath(); X.moveTo(-18, 0); X.quadraticCurveTo(0, -11, 18, 0); X.quadraticCurveTo(0, 9, -18, 0); X.closePath(); X.save(); X.fillStyle = '#f5efe2'; X.fill(); X.clip();
    ell(look[0] * 6, look[1] * 3, 8.5, 8.5, P.eye || '#4a6a8a', 0); ell(look[0] * 6, look[1] * 3, 4, 4, '#14100c', 0); ell(look[0] * 6 + 2.5, look[1] * 3 - 3, 1.8, 1.8, '#fff', 0);
    X.fillStyle = sk; X.fillRect(-20, -14, 40, 14 * ex.lid + 2); X.restore();
    curve([-19, 1], [0, -12 + ex.lid * 10], [19, -1], 3.6); curve([-14, 5], [0, 9], [14, 4], 1.4, 'rgba(43,29,20,.5)'); X.restore(); });
  // brows
  [-1, 1].forEach(s => { const x0 = s * 18 + dx, x1 = s * 50 + dx, by = -42 - (s === 1 ? ex.sk * 10 : 0);
    const yi = by - ex.bi * 9, yo = by - ex.bo * 7 + 2; X.beginPath(); X.moveTo(x0, yi + 2); X.quadraticCurveTo((x0 + x1) / 2, Math.min(yi, yo) - 6, x1, yo + 3); X.lineTo(x1, yo + 7);
    X.quadraticCurveTo((x0 + x1) / 2, Math.min(yi, yo), x0, yi + 8); X.closePath(); X.fillStyle = P.brow || P.hairCol; X.fill(); });
  // nose
  X.beginPath(); X.moveTo(dx + 3 + t * 4, -18); X.quadraticCurveTo(dx + 12 + t * 16, 18, dx + 14 + t * 10, 34); X.lineWidth = 2.6; X.strokeStyle = INK; X.stroke();
  X.beginPath(); X.moveTo(dx - 12 + t * 8, 34); X.quadraticCurveTo(dx + t * 8, 42, dx + 14 + t * 10, 34); X.lineWidth = 2.6; X.stroke();
  X.fillStyle = skD; X.beginPath(); X.ellipse(dx - 14 + t * 6, 36, 6, 4, 0, 0, 7); X.fill();
  // mouth
  const my = 66, mw = P.fem ? 30 : 34, c = ex.mc * 9;
  if (ex.mo > .1) { X.beginPath(); X.moveTo(dx - mw, my - c * .5); X.quadraticCurveTo(dx, my - 4 + c * .4, dx + mw, my - c * .5); X.quadraticCurveTo(dx, my + 10 + ex.mo * 26 + c, dx - mw, my - c * .5); X.closePath();
    X.save(); X.fillStyle = '#4a1f18'; X.fill(); X.clip(); X.fillStyle = '#f4efe6'; X.fillRect(dx - mw, my - 12, mw * 2, 12); X.restore(); X.lineWidth = 2.8; X.strokeStyle = INK; X.stroke(); }
  else { curve([dx - mw, my - c], [dx, my + c * 1.4], [dx + mw, my - c], 3); curve([dx - 12, my + 13], [dx, my + 16], [dx + 12, my + 13], 2, skD); }
  if (P.fem) { X.fillStyle = 'rgba(190,70,70,.35)'; X.beginPath(); X.ellipse(dx, my + 6, mw * .8, 7, 0, 0, 7); X.fill(); }
  // facial hair
  const fh = P.facial, hc = P.facialCol || P.hairCol;
  if (fh === 'beard' || fh === 'goatee') { X.beginPath(); if (fh === 'beard') { X.moveTo(-w + 4, 10); X.quadraticCurveTo(-w * .9, h * 1.05, dx, h + 22); X.quadraticCurveTo(w * .9, h * 1.05, w - 4, 10); X.quadraticCurveTo(w * .7, 70, dx + 30, 84); X.quadraticCurveTo(dx, 78, dx - 30, 84); X.quadraticCurveTo(-w * .7, 70, -w + 4, 10); }
    else { X.moveTo(dx - 26, 88); X.quadraticCurveTo(dx - 30, h + 26, dx, h + 30); X.quadraticCurveTo(dx + 30, h + 26, dx + 26, 88); X.quadraticCurveTo(dx, 96, dx - 26, 88); } inkFill(hc, 3); }
  if (fh === 'handlebar' || fh === 'mustache' || fh === 'beard' || fh === 'goatee') { X.save(); X.translate(dx + t * 6, 47);
    X.beginPath(); if (fh === 'handlebar') { X.moveTo(0, -3); X.bezierCurveTo(24, -12, 46, 6, 60, 0); X.bezierCurveTo(78, -6, 78, -26, 68, -24); X.bezierCurveTo(74, -14, 64, -4, 54, 12); X.bezierCurveTo(34, 20, 12, 12, 0, 8);
      X.bezierCurveTo(-12, 12, -34, 20, -54, 12); X.bezierCurveTo(-64, -4, -74, -14, -68, -24); X.bezierCurveTo(-78, -26, -78, -6, -60, 0); X.bezierCurveTo(-46, 6, -24, -12, 0, -3); }
    else { X.moveTo(0, -6); X.bezierCurveTo(26, -12, 44, -2, 46, 14); X.bezierCurveTo(30, 20, 12, 14, 0, 10); X.bezierCurveTo(-12, 14, -30, 20, -46, 14); X.bezierCurveTo(-44, -2, -26, -12, 0, -6); }
    inkFill(hc, 2.6); X.restore(); }
  hairFront(P, w, h, t);
  if (P.glasses) { const heavy = P.glasses === 'heavy', col = heavy ? '#15110e' : INK; [-1, 1].forEach(s => { const x = s * 40 + dx; X.beginPath();
      if (P.glasses === 'round') X.arc(x, -12, 27, 0, 7); else X.roundRect(x - 30, -32, 60, 40, heavy ? 8 : 12); X.fillStyle = 'rgba(255,255,255,.12)'; X.fill(); X.lineWidth = heavy ? 8 : 3.6; X.strokeStyle = col; X.stroke(); });
    stroke([[dx - 12, -16], [dx, -20], [dx + 12, -16]], heavy ? 6 : 3, col); stroke([[-w + 4, -20], [-70 + dx, -16]], heavy ? 6 : 3, col); stroke([[w - 4, -20], [70 + dx, -16]], heavy ? 6 : 3, col); }
}
function hairBack(P, w, h) { const c = P.hairCol; X.beginPath(); X.moveTo(-w - 14, -40);
  if (P.hair === 'bob') { X.moveTo(-w - 18, -30); X.bezierCurveTo(-w - 30, -h * 1.2, w + 30, -h * 1.2, w + 18, -30); X.quadraticCurveTo(w + 30, 60, w + 8, 105); X.lineTo(-w - 8, 105); X.quadraticCurveTo(-w - 30, 60, -w - 18, -30); X.closePath(); inkFill(c, 3); return; }
  if (P.hair === 'long') { X.quadraticCurveTo(-w - 40, 140, -w - 10, 190); X.quadraticCurveTo(0, 215, w + 10, 190); X.quadraticCurveTo(w + 40, 140, w + 14, -40); } else { X.quadraticCurveTo(-w - 20, 60, -w + 10, 120); X.lineTo(w - 10, 120); X.quadraticCurveTo(w + 20, 60, w + 14, -40); }
  X.closePath(); inkFill(c, 3); if (P.hair === 'ponytail') { X.beginPath(); X.ellipse(w + 30, 40, 26, 80, -.3, 0, 7); inkFill(c, 3); } }
function hairFront(P, w, h, t) { const c = P.hairCol, hl = shade(c, .25), st = P.hair, dx = t * 10;
  const cap = (top, side, part) => { X.beginPath(); X.moveTo(-w - 4, side); X.bezierCurveTo(-w - 8, -h * .9, -w * .5, -h - top, dx, -h - top); X.bezierCurveTo(w * .5, -h - top, w + 8, -h * .9, w + 4, side);
    X.bezierCurveTo(w * .8, -h * .55, w * .3, -h * .62, part, -h * .7); X.bezierCurveTo(-w * .3, -h * .6, -w * .85, -h * .5, -w - 4, side); X.closePath(); inkFill(c, 3.2);
    curve([part, -h * .72], [part + 6, -h - top * .5], [part + 14, -h - top + 6], 2, hl); curve([part + 30, -h * .7], [part + 40, -h - top * .4], [part + 60, -h - top * .6], 2, hl); };
  if (st === 'slick') cap(12, -10, -30 + dx);
  else if (st === 'side') cap(24, -26, -36 + dx);
  else if (st === 'buzz') cap(6, -40, dx);
  else if (st === 'curly') { for (let i = 0; i < 14; i++) { const a = Math.PI * (1.05 + i / 13 * .9), r = w + 8; ell(Math.cos(a) * r * 1.02 + dx * .4, Math.sin(a) * h * .98 - 18, 26, 24, c, 3); } X.beginPath(); X.ellipse(dx * .4, -h * .78, w * .9, h * .35, 0, 0, 7); X.fillStyle = c; X.fill(); }
  else if (st === 'bald') { [-1, 1].forEach(s => { X.beginPath(); X.moveTo(s * (w + 2), -50); X.quadraticCurveTo(s * (w + 12), -10, s * (w - 2), 26); X.lineTo(s * (w - 18), 20); X.quadraticCurveTo(s * (w - 10), -20, s * (w - 18), -54); X.closePath(); inkFill(c, 2.6); }); curve([-30, -h + 14], [0, -h + 4], [30, -h + 14], 3, 'rgba(255,255,255,.35)'); }
  else if (st === 'swept') { X.beginPath(); X.moveTo(-w - 6, -6); X.bezierCurveTo(-w - 14, -h * 1.1, w * .2, -h - 34, w + 6, -h * .55); X.bezierCurveTo(w + 10, -h * .3, w + 6, -20, w + 2, -4); X.bezierCurveTo(w * .7, -h * .6, -w * .2, -h * .8, -w * .7, -h * .45); X.quadraticCurveTo(-w * .9, -h * .3, -w - 6, -6); X.closePath(); inkFill(c, 3); for (let i = 0; i < 4; i++) curve([-w * .6 + i * 30, -h * .7 + i * 4], [i * 30 - 10, -h - 20], [w * .5 + i * 10, -h * .8 + i * 6], 2, shade(c, -.15)); }
  else if (st === 'bob' || st === 'long' || st === 'ponytail' || st === 'bun') { X.beginPath(); X.moveTo(-w - 10, -10); X.bezierCurveTo(-w - 20, -h * 1.5, w * .5, -h * 1.5 - 20, w + 10, -10);
    X.bezierCurveTo(w * .9, -h * .45, w * .55, -h * .62, w * .05 + dx, -h * .66); X.bezierCurveTo(-w * .35, -h * .5, -w * .8, -h * .45, -w - 10, -10); X.closePath(); inkFill(c, 3.2);
    curve([-w * .4, -h * .85], [w * .1, -h - 16], [w * .6, -h * .75], 2, hl); if (st === 'bun') ell(w * .15, -h - 34, 42, 34, c, 3); }
  if (P.hat === 'bowler' || P.hat === 'fedora' || P.hat === 'cap') { const hc = P.hatCol || '#2b2622'; X.beginPath(); X.ellipse(dx, -h * .72, w * 1.45, 22, 0, 0, 7); inkFill(hc, 3);
    X.beginPath(); X.moveTo(-w * .95 + dx, -h * .74); X.bezierCurveTo(-w * .95 + dx, -h * 1.5, w * .95 + dx, -h * 1.5, w * .95 + dx, -h * .74); X.closePath(); inkFill(hc, 3); X.fillStyle = shade(hc, -.3); X.fillRect(-w * .93 + dx, -h * .92, w * 1.86, 18); }
}

// ---------- body ----------
const SHO = 165, SY = 222;
function torso(P) { const o = P.outfit || 'suit', jc = P.top || '#3a4a6a', shirt = P.shirt || '#f2ede2';
  X.beginPath(); X.moveTo(-58, 170); X.bezierCurveTo(-110, 186, -SHO - 10, 206, -SHO - 18, 290); X.lineTo(-SHO + 14, 900); X.lineTo(SHO - 14, 900); X.lineTo(SHO + 18, 290); X.bezierCurveTo(SHO + 10, 206, 110, 186, 58, 170); X.closePath();
  const body = new Path2D(); body.moveTo(-58, 170); body.bezierCurveTo(-110, 186, -SHO - 10, 206, -SHO - 18, 290); body.lineTo(-SHO + 14, 900); body.lineTo(SHO - 14, 900); body.lineTo(SHO + 18, 290); body.bezierCurveTo(SHO + 10, 206, 110, 186, 58, 170); body.closePath();
  const base = (o === 'suit' || o === 'period' || o === 'whitesuit') ? jc : (o === 'apron' ? shirt : jc);
  X.fillStyle = base; X.fill(body); X.save(); X.clip(body);
  X.fillStyle = shade(base, -.15); X.fillRect(SHO - 40, 160, 80, 760);
  if (o === 'suit' || o === 'period' || o === 'whitesuit') {
    X.beginPath(); X.moveTo(-58, 168); X.lineTo(0, 470); X.lineTo(58, 168); X.closePath(); X.fillStyle = shirt; X.fill();
    if (o === 'period') { X.beginPath(); X.moveTo(-50, 230); X.lineTo(0, 470); X.lineTo(50, 230); X.lineTo(70, 520); X.lineTo(-70, 520); X.closePath(); X.fillStyle = shade(jc, -.25); X.fill(); }
    const tie = P.tie || (o === 'whitesuit' ? '#15110e' : '#5a2a2a');
    if (o === 'period') { X.beginPath(); X.moveTo(-34, 186); X.quadraticCurveTo(0, 175, 34, 186); X.lineTo(22, 300); X.quadraticCurveTo(0, 320, -22, 300); X.closePath(); X.fillStyle = tie; X.fill(); X.lineWidth = 2.6; X.strokeStyle = INK; X.stroke();
      X.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 6; i++) { X.beginPath(); X.arc(-14 + (i % 3) * 14, 210 + Math.floor(i / 3) * 40, 3, 0, 7); X.fill(); } }
    else if (o === 'whitesuit') { stroke([[0, 196], [-30, 214], [-30, 190], [0, 200], [30, 190], [30, 214], [0, 196]], 6, tie); stroke([[-6, 205], [-14, 260]], 5, tie); stroke([[6, 205], [16, 262]], 5, tie); }
    else { X.beginPath(); X.moveTo(-14, 190); X.lineTo(14, 190); X.lineTo(20, 380); X.lineTo(0, 410); X.lineTo(-20, 380); X.closePath(); X.fillStyle = tie; X.fill(); X.lineWidth = 2.6; X.strokeStyle = INK; X.stroke(); }
    [-1, 1].forEach(s => { X.beginPath(); X.moveTo(s * 58, 168); X.lineTo(s * 96, 250); X.lineTo(s * 70, 300); X.lineTo(s * 8, 520); X.lineTo(s * 30, 520); X.lineTo(s * 120, 300); X.lineTo(s * 110, 190); X.closePath(); X.fillStyle = shade(base, -.08); X.fill(); X.lineWidth = 2.6; X.strokeStyle = INK; X.stroke(); });
    [580, 680].forEach(y => ell(14, y, 6, 6, shade(base, -.4), 1.6));
  } else if (o === 'shirt' || o === 'apron') { stroke([[0, 180], [0, 900]], 2.4); [260, 340, 420, 500].forEach(y => ell(8, y, 4, 4, shade(base, -.3), 1.2));
    if (P.tie) { X.beginPath(); X.moveTo(-14, 190); X.lineTo(14, 190); X.lineTo(20, 380); X.lineTo(0, 410); X.lineTo(-20, 380); X.closePath(); X.fillStyle = P.tie; X.fill(); X.lineWidth = 2.6; X.strokeStyle = INK; X.stroke(); }
    if (o === 'apron') { X.beginPath(); X.moveTo(-120, 300); X.lineTo(120, 300); X.lineTo(150, 900); X.lineTo(-150, 900); X.closePath(); X.fillStyle = P.apron || '#efe6d2'; X.fill(); X.lineWidth = 3; X.strokeStyle = INK; X.stroke(); stroke([[-120, 300], [-70, 170]], 6, P.apron || '#efe6d2'); stroke([[120, 300], [70, 170]], 6, P.apron || '#efe6d2'); } }
  else if (o === 'tee' || o === 'hoodie' || o === 'sweater' || o === 'blouse') { X.beginPath(); X.moveTo(-60, 170); X.quadraticCurveTo(0, o === 'blouse' ? 240 : 215, 60, 170); X.lineWidth = o === 'sweater' ? 12 : 3; X.strokeStyle = o === 'sweater' ? shade(base, -.2) : INK; X.stroke();
    if (o === 'hoodie') { stroke([[-24, 215], [-28, 330]], 4, '#f2ede2'); stroke([[24, 215], [28, 330]], 4, '#f2ede2'); X.beginPath(); X.rect(-110, 560, 220, 120); X.lineWidth = 2.6; X.strokeStyle = INK; X.stroke(); } }
  X.restore(); X.lineWidth = 3.4; X.strokeStyle = INK; X.stroke(body);
  if (o === 'suit' || o === 'period' || o === 'whitesuit' || o === 'shirt' || o === 'apron') [-1, 1].forEach(s => { X.beginPath(); X.moveTo(s * 6, 178); X.lineTo(s * 52, 160); X.lineTo(s * (o === 'period' ? 34 : 40), o === 'period' ? 214 : 232); X.closePath(); inkFill(shirt, 2.6); });
  if (o === 'hoodie') { X.beginPath(); X.moveTo(-120, 190); X.quadraticCurveTo(0, 120, 120, 190); X.quadraticCurveTo(0, 170, -120, 190); inkFill(shade(base, -.12), 3); }
}
function ik(Sx, Sy, Tx, Ty, L1, L2, side) { const dx = Tx - Sx, dy = Ty - Sy; let d = Math.hypot(dx, dy); const r = Math.min(1, (L1 + L2 - 1) / d); d = Math.min(d, L1 + L2 - 1);
  const a = Math.atan2(dy, dx), A = Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)); const c1 = [a + A, a - A].map(g => [Sx + Math.cos(g) * L1, Sy + Math.sin(g) * L1]);
  const sc = e => side * (e[0] - Sx) + .5 * (e[1] - Sy); return { E: sc(c1[0]) > sc(c1[1]) ? c1[0] : c1[1], T: [Sx + dx * r, Sy + dy * r] }; }
function handShape(kind, side, P) { const sk = P.skin; X.save(); X.scale(1.3, 1.3 * side);
  if (kind === 'point') { X.beginPath(); X.roundRect(20, -30, 70, 16, 8); inkFill(sk, 2.6); }
  X.beginPath(); X.ellipse(16, 0, 30, 26, 0, 0, 7); inkFill(sk, 2.8);
  if (kind === 'open' || kind === 'palm') { for (let i = 0; i < 4; i++) { X.beginPath(); X.roundRect(30, -22 + i * 12, 40 - Math.abs(i - 1.5) * 6, 11, 5.5); inkFill(sk, 2.2); } }
  else if (kind !== 'point') for (let i = 0; i < 3; i++) curve([36, -14 + i * 12], [44, -8 + i * 12], [36, -4 + i * 12], 2);
  X.beginPath(); X.ellipse(8, -24, 9, 18, -.6, 0, 7); inkFill(sk, 2.4); X.restore(); }
function arm(P, i, tx, ty, kind) { const side = i ? 1 : -1, Sx = side * (SHO - 10), Sy = SY + 30, sl = P.sleeve || ((P.outfit === 'apron' || P.outfit === 'shirt') ? (P.shirt || '#f2ede2') : (P.top || '#3a4a6a'));
  const { E, T } = ik(Sx, Sy, tx, ty, 220, 205, side); const pts = [[Sx, Sy], E, T];
  stroke(pts, 76, INK); stroke(pts, 69, sl); X.save(); X.beginPath(); X.moveTo(Sx, Sy); X.lineTo(...E); X.lineTo(...T); X.lineWidth = 30; X.strokeStyle = shade(sl, -.12); X.globalAlpha = .5; X.stroke(); X.restore();
  const a = Math.atan2(T[1] - E[1], T[0] - E[0]); stroke([[T[0] - Math.cos(a) * 26, T[1] - Math.sin(a) * 26], [T[0] - Math.cos(a) * 20, T[1] - Math.sin(a) * 20]], 72, INK);
  stroke([[T[0] - Math.cos(a) * 26, T[1] - Math.sin(a) * 26], [T[0] - Math.cos(a) * 21, T[1] - Math.sin(a) * 21]], 64, (P.outfit === 'suit' || P.outfit === 'period' || P.outfit === 'whitesuit') ? (P.shirt || '#f2ede2') : sl);
  return { T, a, side }; }
const POSE = {   // hand targets in local units (L = viewer-left arm) and hand shapes
  rest: [[-200, 660, 'fist'], [200, 660, 'fist']], shrug: [[-285, 470, 'palm'], [285, 470, 'palm']], neck: [[-200, 660, 'fist'], [110, 150, 'open']],
  chin: [[-200, 660, 'fist'], [20, 150, 'fist']], hold: [[-95, 470, 'fist'], [95, 470, 'fist']], point: [[-340, 120, 'point'], [200, 660, 'fist']],
  desk: [[-150, 600, 'open'], [150, 600, 'open']], write: [[-150, 600, 'open'], [70, 560, 'fist']], head: [[-110, -60, 'open'], [110, -60, 'open']],
  cheer: [[-200, 660, 'fist'], [270, -130, 'fist']], wave: [[-200, 660, 'fist'], [310, -40, 'open']], phone: [[-200, 660, 'fist'], [100, 40, 'fist']],
  shake: [[-200, 660, 'fist'], [340, 380, 'open']], present: [[-380, 300, 'palm'], [200, 660, 'fist']], hips: [[-250, 560, 'fist'], [250, 560, 'fist']],
};
function crossedArms(P) { const sl = P.top || '#3a4a6a'; [[-1, 470], [1, 500]].forEach(([s, y]) => { X.beginPath(); X.roundRect(-210, y - 40, 420, 80, 40); inkFill(s < 0 ? sl : shade(sl, .06), 3.4);
    X.save(); X.translate(s * 190, y); handShape('fist', 1, P); X.restore(); }); }
// P: look; o: { pose, expr, turn, holding(fn) }; T: time for blink/breath
function person(P, o, T) { const ex = EXPR[o.expr || 'neutral'], br = Math.sin(T * 1.6 + (P.seed || 0)) * 3;
  X.save(); if (o.flip) X.scale(-1, 1);
  if (P.legs) legs(P);
  X.save(); X.translate(0, br * .6); torso(P); X.restore();
  const pose = POSE[o.pose] || POSE.rest; let hands = [];
  if (o.pose === 'crossed') { X.save(); X.translate(0, br * .6); crossedArms(P); X.restore(); }
  else { const wob = o.pose === 'wave' ? Math.sin(T * 7) * 30 : 0, sh = o.pose === 'shrug' ? Math.abs(Math.sin(T * 2)) * -18 : 0;
    hands = [0, 1].map(i => arm(P, i, pose[i][0] + (i ? wob : 0), pose[i][1] + sh + br, pose[i][2])); }
  X.save(); X.translate(0, br * .3); X.rotate((o.tilt || 0) * .05 + Math.sin(T * .9 + (P.seed || 0)) * .012); X.scale(1.2, 1.2); head(P, ex, (o.turn || 0) * (o.flip ? -1 : 1), T); X.restore();
  if (o.holding) o.holding();
  hands.forEach((h, i) => { X.save(); X.translate(...h.T); X.rotate(h.a); handShape(pose[i][2], (h.side < 0 ? 1 : -1) * (Math.cos(h.a) < 0 ? -1 : 1), P); X.restore(); });
  X.restore(); }
function legs(P) { const pc = P.pants || '#2a2a30'; [-1, 1].forEach(s => { X.beginPath(); X.moveTo(s * 10, 860); X.lineTo(s * 150, 860); X.lineTo(s * 130, 1500); X.lineTo(s * 40, 1500); X.closePath(); inkFill(pc, 3.4);
    X.beginPath(); X.ellipse(s * 95, 1510, 80, 30, 0, Math.PI, 0); X.lineTo(s * 175, 1520); X.lineTo(s * 15, 1520); X.closePath(); inkFill(P.shoes || '#1d1612', 3); }); }
