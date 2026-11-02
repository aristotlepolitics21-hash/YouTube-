// Riddle Shorts: escape-room style riddles on the 2D toon engine (../../business-ideas/engine/toon.js).
// Flat vector look (thin outlines), illustrated scenes, an hourglass countdown at the top, captions under it,
// a question card during the think time and an ANSWER banner on the reveal.
// A beat may add: props [[kind, x, y, scale, flip, arg]], timer (seconds to count down in this beat), ask (question card),
// reveal (ANSWER banner), state (scene-specific switch, e.g. which door is open).
LW = 4; INK = '#231a2e';

// ---------- small helpers ----------
const wob = (s, k = 1) => Math.sin(NOW * s) * k;
function grad(y0, y1, a, b) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); return g; }
function bricks(x0, y0, x1, y1, base, line, bw = 150, bh = 64) { c.fillStyle = base; c.fillRect(x0, y0, x1 - x0, y1 - y0); c.strokeStyle = line; c.lineWidth = 4;
  for (let y = y0, r = 0; y < y1; y += bh, r++) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); for (let x = x0 + (r % 2) * bw / 2; x < x1; x += bw) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + bh); c.stroke(); } } }
function floorTiles(y0, col, line) { c.fillStyle = col; c.fillRect(0, y0, W, H - y0); c.strokeStyle = line; c.lineWidth = 4; for (let y = y0 + 90, k = 1; y < H; y += 90 + k * 30, k++) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  for (let i = -6; i < 10; i++) { c.beginPath(); c.moveTo(540 + i * 150, y0); c.lineTo(540 + i * 260, H); c.stroke(); } }
function wallTorch(x, y) { poly([[x - 40, y + 60], [x + 40, y + 60], [x + 22, y + 110], [x - 22, y + 110]]); ink('#2e2440'); rr(x - 9, y - 60, 18, 120, 4); ink('#5a3a26');
  const f = 1 + wob(15 + x * .01, .08); c.save(); c.translate(x, y - 70); c.scale(f, 1 / f); c.beginPath(); c.moveTo(0, -110); c.quadraticCurveTo(46, -30, 0, 14); c.quadraticCurveTo(-46, -30, 0, -110); c.fillStyle = '#ff9a1f'; c.fill();
  c.beginPath(); c.moveTo(0, -60); c.quadraticCurveTo(22, -16, 0, 10); c.quadraticCurveTo(-22, -16, 0, -60); c.fillStyle = '#ffe680'; c.fill(); c.restore();
  const g = c.createRadialGradient(x, y - 90, 10, x, y - 90, 260); g.addColorStop(0, 'rgba(255,170,60,.28)'); g.addColorStop(1, 'rgba(255,170,60,0)'); c.fillStyle = g; c.fillRect(x - 260, y - 350, 520, 520); }
function archDoor(x, y, w, h, open = 0, col = '#7a4a2a') { const top = y - h; c.beginPath(); c.moveTo(x - w / 2 - 34, y); c.lineTo(x - w / 2 - 34, top + w * .3); c.quadraticCurveTo(x, top - w * .35, x + w / 2 + 34, top + w * .3); c.lineTo(x + w / 2 + 34, y); ink('#4a3a5e');
  c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x - w / 2, top + w * .3); c.quadraticCurveTo(x, top - w * .25, x + w / 2, top + w * .3); c.lineTo(x + w / 2, y); c.closePath(); c.fillStyle = open ? '#140f1c' : col; c.fill(); c.lineWidth = LW; c.strokeStyle = INK; c.stroke();
  if (open) { c.save(); c.globalAlpha = .9; const g = c.createRadialGradient(x, y - h * .4, 10, x, y - h * .4, h * .7); g.addColorStop(0, 'rgba(255,240,180,.95)'); g.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = g; c.fill(); c.restore(); return; }
  c.save(); c.clip(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 4; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(x - w / 2 + i * w / 5, top - 50); c.lineTo(x - w / 2 + i * w / 5, y); c.stroke(); } c.restore();
  [.28, .62, .9].forEach(k => { rr(x - w / 2, top + h * k - 12, w, 24, 4); ink('#3a3242', 3); for (let i = 0; i < 7; i++) { ell(x - w / 2 + 20 + i * (w - 40) / 6, top + h * k, 6, 6); c.fillStyle = '#9aa0b0'; c.fill(); } });
  [-1, 1].forEach(sd => { rr(x + sd * w * .22 - 40, top + h * .38, 80, 100, 8); ink('#1d1626'); for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(x + sd * w * .22 - 40 + i * 20, top + h * .38); c.lineTo(x + sd * w * .22 - 40 + i * 20, top + h * .38 + 100); c.lineWidth = 7; c.strokeStyle = '#3a3242'; c.stroke(); } }); }
function sun(x, y, r) { const g = c.createRadialGradient(x, y, r * .3, x, y, r * 2.4); g.addColorStop(0, 'rgba(255,240,170,.9)'); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); ell(x, y, r, r); c.fillStyle = '#ffe066'; c.fill(); }
function cloud(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.arc(-50, 10, 45, 0, 7); c.arc(0, -15, 60, 0, 7); c.arc(55, 8, 45, 0, 7); c.fillStyle = 'rgba(255,255,255,.95)'; c.fill(); c.restore(); }

// ---------- animals and props ----------
const PR = {
  monkey(x, y, s, f) { c.save(); c.translate(x, y); c.scale(s * f, s); c.beginPath(); c.moveTo(40, 40); c.quadraticCurveTo(160, 60, 120, 220 + wob(2, 10)); c.lineWidth = 22; c.strokeStyle = INK; c.stroke(); c.lineWidth = 14; c.strokeStyle = '#8a5a30'; c.stroke();
    ell(0, 40, 90, 100); ink('#8a5a30'); ell(0, 60, 56, 66); ink('#e8c49a', 3); [-1, 1].forEach(sd => { ell(sd * 70, 120, 36, 30); ink('#8a5a30'); ell(sd * 70, 136, 26, 20); ink('#e8c49a', 3); ell(sd * 92, 90, 26, 26); ink('#e8c49a'); });
    [-1, 1].forEach(sd => { ell(sd * 92, -110, 34, 34); ink('#8a5a30'); ell(sd * 92, -110, 20, 20); c.fillStyle = '#e8c49a'; c.fill(); }); ell(0, -100, 92, 86); ink('#8a5a30'); ell(0, -80, 66, 58); c.fillStyle = '#e8c49a'; c.fill();
    [-26, 26].forEach(dx => { ell(dx, -112, 13, 15); c.fillStyle = INK; c.fill(); ell(dx + 4, -116, 4, 4); c.fillStyle = '#fff'; c.fill(); }); [-8, 8].forEach(dx => { ell(dx, -80, 4, 3); c.fillStyle = INK; c.fill(); });
    c.beginPath(); c.arc(0, -66, 22, .2, Math.PI - .2); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.restore(); },
  squirrel(x, y, s, f) { c.save(); c.translate(x, y); c.scale(s * f, s); c.beginPath(); c.moveTo(-40, 40); c.bezierCurveTo(-170, 20, -150, -170, -60, -150); c.bezierCurveTo(-90, -80, -60, 0, -40, 40); ink('#c8742e');
    ell(0, 10, 56, 70); ink('#d9843a'); ell(10, 26, 30, 44); c.fillStyle = '#f2d2a6'; c.fill(); ell(26, -70, 46, 42); ink('#d9843a'); poly([[6, -104], [18, -140], [32, -104]]); ink('#d9843a'); ell(40, -78, 9, 10); c.fillStyle = INK; c.fill(); ell(66, -64, 6, 5); c.fill(); c.restore(); },
  bird(x, y, s, f) { c.save(); c.translate(x, y + wob(4, 10)); c.scale(s * f, s); ell(0, 0, 60, 44); ink('#3d8bff'); const fl = wob(14, .6); c.save(); c.rotate(-.4 + fl); ell(-10, -30, 50, 20, -.4); ink('#2a6ad8'); c.restore();
    ell(46, -24, 30, 28); ink('#3d8bff'); poly([[70, -28], [100, -20], [70, -12]]); ink('#ffb020', 3); ell(54, -30, 6, 7); c.fillStyle = INK; c.fill(); poly([[-56, -6], [-96, -26], [-90, 16]]); ink('#2a6ad8'); c.restore(); },
  wolf(x, y, s, f) { c.save(); c.translate(x, y); c.scale(s * f, s); [-50, -20, 30, 56].forEach(lx => { rr(lx - 10, -10, 20, 80, 8); ink('#7a8090'); }); c.beginPath(); c.moveTo(-90, -40); c.quadraticCurveTo(-170, -60, -150, 10); ink('#7a8090');
    ell(0, -30, 96, 52); ink('#8a90a0'); ell(80, -90, 46, 40); ink('#8a90a0'); poly([[60, -126], [72, -170], [90, -126]]); ink('#8a90a0'); poly([[100, -86], [160, -72], [104, -60]]); ink('#8a90a0'); ell(150, -72, 8, 7); c.fillStyle = INK; c.fill();
    ell(92, -100, 7, 8); c.fill(); c.restore(); },
  goat(x, y, s, f) { c.save(); c.translate(x, y); c.scale(s * f, s); [-50, -24, 34, 58].forEach(lx => { rr(lx - 8, -10, 16, 80, 6); ink('#f2efe6'); }); ell(0, -30, 90, 50); ink('#f6f3ea');
    c.beginPath(); c.moveTo(70, -110); c.quadraticCurveTo(40, -170, 10, -160); c.lineWidth = 12; c.strokeStyle = '#8a7a60'; c.stroke(); ell(86, -90, 32, 40, .3); ink('#f6f3ea'); poly([[96, -56], [108, -56], [100, -24]]); ink('#f6f3ea', 3); ell(94, -98, 6, 7); c.fillStyle = INK; c.fill(); c.restore(); },
  cabbage(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); for (let i = 0; i < 5; i++) { ell(Math.cos(i * 1.3) * 26, -40 + Math.sin(i * 1.3) * 16, 52, 44, i); ink(['#7cc36b', '#5aa84a', '#8fd47a'][i % 3], 3); } ell(0, -46, 38, 34); ink('#a8e08a', 3); c.restore(); },
  lion(x, y, s, f, arg) { c.save(); c.translate(x, y); c.scale(s * f, s); const dead = arg === 'dead'; if (dead) c.rotate(.0);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; ell(80 + Math.cos(a) * 62, -70 + Math.sin(a) * 62, 34, 34); c.fillStyle = '#b8642a'; c.fill(); } ell(-10, -10, 110, 50); ink(dead ? '#c8a878' : '#e0a050'); ell(80, -70, 60, 58); ink(dead ? '#d8b888' : '#f0b860');
    if (dead) { [[64, -80], [100, -80]].forEach(([a, b]) => { c.beginPath(); c.moveTo(a - 10, b - 10); c.lineTo(a + 10, b + 10); c.moveTo(a + 10, b - 10); c.lineTo(a - 10, b + 10); c.lineWidth = 6; c.strokeStyle = INK; c.stroke(); }); for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-80 + i * 34, -40); c.lineTo(-80 + i * 34, 20); c.lineWidth = 4; c.strokeStyle = 'rgba(0,0,0,.3)'; c.stroke(); } }
    else { [64, 100].forEach(a => { ell(a, -82, 8, 9); c.fillStyle = INK; c.fill(); }); c.beginPath(); c.arc(82, -48, 18, 0, Math.PI); ink('#7a1f1f', 4); }
    [-70, -30, 40, 70].forEach(lx => { rr(lx - 14, 20, 28, dead ? 30 : 60, 10); ink(dead ? '#c8a878' : '#e0a050'); }); c.restore(); },
  dragon(x, y, s, f) { c.save(); c.translate(x, y); c.scale(s * f, s); c.beginPath(); c.moveTo(-120, 200); c.quadraticCurveTo(-60, 0, 40, -60); c.lineTo(90, -20); c.quadraticCurveTo(10, 60, 0, 200); c.closePath(); ink('#3aa76d');
    ell(70, -80, 90, 60, -.2); ink('#3aa76d'); poly([[30, -130], [50, -190], [70, -130]]); ink('#ffcf33'); poly([[80, -136], [110, -190], [120, -128]]); ink('#ffcf33'); ell(60, -98, 14, 16); ink('#ffe066', 3); ell(64, -98, 6, 12); c.fillStyle = INK; c.fill();
    const fl = .8 + wob(9, .2); c.save(); c.translate(150, -60); c.scale(fl, fl); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(120, -60, 260, -10); c.quadraticCurveTo(120, 40, 260, 70); c.quadraticCurveTo(110, 70, 0, 20); c.fillStyle = '#ff7a1a'; c.fill(); c.beginPath(); c.moveTo(0, 6); c.quadraticCurveTo(90, -20, 180, 10); c.quadraticCurveTo(90, 30, 0, 16); c.fillStyle = '#ffe066'; c.fill(); c.restore(); c.restore(); },
  coconut(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.moveTo(-30, 0); c.quadraticCurveTo(-10, -500, 40, -980); c.lineTo(80, -980); c.quadraticCurveTo(40, -500, 30, 0); c.closePath(); ink('#b07a46');
    for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(-22 + i * 2, -100 - i * 100); c.lineTo(28 + i * 4, -110 - i * 100); c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,.3)'; c.stroke(); }
    for (let i = 0; i < 7; i++) { const a = -Math.PI + i * Math.PI / 6; c.save(); c.translate(60, -990); c.rotate(a + wob(1.3, .04)); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(140, -60, 280, 40); c.quadraticCurveTo(140, -10, 0, 20); ink('#3aa76d', 3); c.restore(); }
    [[30, -950], [80, -940], [56, -920]].forEach(([a, b]) => { ell(a, b, 30, 30); ink('#7a5230', 3); }); c.restore(); },
  magnifier(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-.5); rr(-16, 120, 32, 220, 12); ink('#6b4a2e'); ell(0, 0, 150, 150); c.lineWidth = 34; c.strokeStyle = INK; c.stroke(); c.lineWidth = 26; c.strokeStyle = '#c8a050'; c.stroke(); ell(0, 0, 136, 136); c.fillStyle = 'rgba(190,230,255,.45)'; c.fill(); ell(-50, -50, 30, 18, -.6); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); c.restore(); },
  beam(x, y, s, f, arg) { c.save(); c.globalAlpha = arg === 'off' ? 0 : .55 + wob(6, .1); c.beginPath(); c.moveTo(x - 130 * s, y - 120 * s); c.lineTo(x + 150 * s, y - 60 * s); c.lineTo(x + 10, y + 560 * s); c.closePath(); c.fillStyle = '#fff1a0'; c.fill();
    if (arg !== 'off') { ell(x + 10, y + 560 * s, 60, 20); c.fillStyle = '#ff7a1a'; c.fill(); } c.restore(); },
  mirror(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); rr(-110, -170, 220, 340, 110); ink('#c8a050'); rr(-90, -150, 180, 300, 90); c.fillStyle = '#bfe4f6'; c.fill(); c.beginPath(); c.moveTo(-40, -110); c.lineTo(40, -20); c.lineWidth = 12; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke(); c.restore(); },
  table(x, y, s, f, arg) { c.save(); c.translate(x, y); c.scale(s, s); const gap = arg === 'cut' ? 40 : 0; [-1, 1].forEach(sd => { c.save(); c.translate(sd * gap, 0); rr(sd < 0 ? -200 : 0, -200, 200, 40, 8); ink('#a8743e'); rr(sd * 160 - 14 + (sd < 0 ? 0 : 0), -160, 28, 160, 6); ink('#8a5a30'); c.restore(); }); c.restore(); },
  saw(x, y, s) { c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-.3); poly([[0, 0], [260, -20], [260, 30], [0, 40]]); ink('#cfd5db'); for (let i = 0; i < 12; i++) { poly([[i * 21, 40], [i * 21 + 10, 56], [i * 21 + 20, 38]]); c.fillStyle = '#cfd5db'; c.fill(); } rr(-80, -10, 90, 60, 20); ink('#c0392b'); c.restore(); },
  hole(x, y, s) { ell(x, y, 120 * s, 40 * s); c.fillStyle = '#140f1c'; c.fill(); c.lineWidth = LW; c.strokeStyle = INK; c.stroke(); },
  boat(x, y, s, f) { c.save(); c.translate(x, y + wob(2, 6)); c.scale(s * f, s); c.beginPath(); c.moveTo(-200, -60); c.lineTo(200, -60); c.quadraticCurveTo(170, 30, 0, 30); c.quadraticCurveTo(-170, 30, -200, -60); ink('#a8743e'); rr(-200, -70, 400, 18, 6); ink('#8a5a30'); c.restore(); },
  scale(x, y, s, f, arg) { c.save(); c.translate(x, y); c.scale(s, s); const tilt = arg === 'left' ? -.18 : arg === 'right' ? .18 : 0; rr(-20, -420, 40, 420, 10); ink('#c8a050'); rr(-140, -20, 280, 40, 12); ink('#a8843a');
    c.save(); c.translate(0, -420); c.rotate(tilt); rr(-300, -14, 600, 28, 10); ink('#c8a050'); [-1, 1].forEach(sd => { c.beginPath(); c.moveTo(sd * 280, 0); c.lineTo(sd * 220, 200); c.moveTo(sd * 280, 0); c.lineTo(sd * 340, 200); c.lineWidth = 4; c.strokeStyle = INK; c.stroke(); }); c.restore();
    [-1, 1].forEach(sd => { const py = -220 + sd * Math.sin(tilt) * 280; c.beginPath(); c.ellipse(sd * 280, py, 110, 26, 0, 0, Math.PI); ink('#c8a050'); }); c.restore(); },
  balls(x, y, s, f, arg) { const n = +(arg || 8), heavy = 5; for (let i = 0; i < n; i++) { const bx = x + (i - (n - 1) / 2) * 70 * s; ell(bx, y, 30 * s, 30 * s); ink(i === heavy && f < 0 ? '#ffcf33' : '#e8c060', 3); ell(bx - 10 * s, y - 10 * s, 8 * s, 6 * s); c.fillStyle = 'rgba(255,255,255,.7)'; c.fill(); } },
  fish(x, y, s, f) { c.save(); c.translate(x, y); c.scale(s * f, s); ell(0, 0, 60, 28); ink('#5fb8ec'); poly([[-56, 0], [-96, -26], [-96, 26]]); ink('#5fb8ec'); ell(30, -6, 6, 6); c.fillStyle = INK; c.fill(); c.restore(); },
  emoji(x, y, s, f, arg) { txt(arg, x, y, F(400, 110 * s), '#000'); },
  sign(x, y, s, f, arg) { c.font = F(900, 54 * s); const w = c.measureText(arg).width + 60 * s; rr(x - w / 2, y - 44 * s, w, 88 * s, 18); ink('#fff3d6', 4); txt(arg, x, y + 18 * s, F(900, 54 * s), INK); },
  stopwatch(x, y, s, f, arg) { c.save(); c.translate(x, y); c.scale(s, s); ell(0, 0, 90, 90); ink('#fff'); rr(-18, -122, 36, 30, 6); ink('#c0392b'); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(NOW * 2) * 60, -Math.cos(NOW * 2) * 60); c.lineWidth = 8; c.strokeStyle = INK; c.stroke(); txt(arg || '', 0, 150, F(900, 60), '#fff'); c.restore(); },
};

// ---------- scenes ----------
function dungeonBase() { c.fillStyle = grad(0, 1400, '#3a2e4e', '#5a4a6e'); c.fillRect(0, 0, W, 1400); bricks(0, 0, W, 1380, 'rgba(0,0,0,0)', 'rgba(20,12,34,.35)'); floorTiles(1380, '#3e3354', 'rgba(20,12,34,.45)'); }
SCENES.dungeon = (b, t) => { dungeonBase(); archDoor(540, 1380, 470, 760, b.state === 'open' ? 1 : 0); wallTorch(150, 760); wallTorch(930, 760); };
SCENES.dungeon2 = (b, t) => { dungeonBase(); [300, 780].forEach((x, i) => { archDoor(x, 1380, 330, 640, (b.state === 'left' && i === 0) || (b.state === 'right' && i === 1) ? 1 : 0, i ? '#6a3a2a' : '#7a4a2a'); }); wallTorch(540, 700); };
SCENES.hall3 = (b, t) => { dungeonBase(); const icons = ['🔥', '🗡️', '🦁']; [200, 540, 880].forEach((x, i) => { archDoor(x, 1380, 240, 560, b.state === 'lion' && i === 2 ? 1 : 0); rr(x - 70, 640, 140, 120, 20); ink('#fff3d6', 4); txt(icons[i], x, 735, F(400, 84), '#000'); }); };
SCENES.sunroom = (b, t) => { c.fillStyle = grad(0, 1400, '#c8a878', '#e8d0a0'); c.fillRect(0, 0, W, 1400); bricks(0, 0, W, 1380, 'rgba(0,0,0,0)', 'rgba(90,60,30,.25)', 170, 70); floorTiles(1380, '#b8956a', 'rgba(90,60,30,.35)');
  const night = b.state === 'night'; [270, 810].forEach(x => { rr(x - 170, 560, 340, 820, 30); c.fillStyle = night ? '#1a2244' : '#8fd3ff'; c.fill(); c.lineWidth = LW; c.strokeStyle = INK; c.stroke(); });
  if (night) { ell(270, 700, 50, 50); c.fillStyle = '#fff6c8'; c.fill(); for (let i = 0; i < 20; i++) { ell(110 + (i * 97) % 320, 620 + (i * 53) % 300, 3, 3); c.fill(); } } else sun(270, 680, 60); };
SCENES.room = (b, t) => { c.fillStyle = grad(0, 1400, '#6a7ab8', '#8a9ad0'); c.fillRect(0, 0, W, 1400); c.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 0; x < W; x += 120) c.fillRect(x, 0, 60, 1400); floorTiles(1380, '#5a4a7e', 'rgba(20,12,34,.35)'); };
SCENES.jungle = (b, t) => { c.fillStyle = grad(0, 1300, '#7fd0ff', '#d8f6ff'); c.fillRect(0, 0, W, 1400); sun(860, 260, 60); cloud(220, 300, 1); cloud(700, 420, .7);
  [[-80, 1180, 260, '#5aa84a'], [300, 1220, 220, '#4a9a3e'], [980, 1180, 260, '#5aa84a']].forEach(([x, y, r, col]) => { ell(x, y, r, r * .8); ink(col); }); c.fillStyle = '#7cc36b'; c.fillRect(0, 1300, W, H - 1300); c.beginPath(); c.moveTo(0, 1300); c.lineTo(W, 1300); c.lineWidth = LW; c.strokeStyle = INK; c.stroke(); };
SCENES.river = (b, t) => { c.fillStyle = grad(0, 900, '#8fd3ff', '#e0f6ff'); c.fillRect(0, 0, W, 1000); sun(180, 260, 56); cloud(760, 300, .9); c.fillStyle = '#7cc36b'; c.fillRect(0, 900, W, 260); c.fillStyle = '#4aa3e0'; c.fillRect(0, 1160, W, 220);
  for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo((i * 160 + NOW * 40) % (W + 160) - 80, 1240 + (i % 2) * 60); c.lineTo((i * 160 + NOW * 40) % (W + 160) - 20, 1240 + (i % 2) * 60); c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke(); }
  c.fillStyle = '#8fd47a'; c.fillRect(0, 1380, W, H - 1380); [[0, 1160], [0, 1380]].forEach(([x, y]) => { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.lineWidth = LW; c.strokeStyle = INK; c.stroke(); }); };
SCENES.bridge = (b, t) => { c.fillStyle = grad(0, 1400, '#0e1430', '#2a2a5e'); c.fillRect(0, 0, W, H); for (let i = 0; i < 40; i++) { ell((i * 137) % W, (i * 89) % 900, 2.5, 2.5); c.fillStyle = '#fff'; c.fill(); } ell(840, 260, 60, 60); c.fillStyle = '#fff6c8'; c.fill();
  poly([[0, 1100], [260, 1100], [300, H], [0, H]]); ink('#3a3050'); poly([[W, 1100], [W - 260, 1100], [W - 300, H], [W, H]]); ink('#3a3050'); c.beginPath(); c.moveTo(250, 1110); c.quadraticCurveTo(540, 1220, 830, 1110); c.lineWidth = 26; c.strokeStyle = '#8a5a30'; c.stroke();
  for (let i = 0; i < 16; i++) { const x = 270 + i * 36, y = 1110 + Math.sin(i / 15 * Math.PI) * 54; rr(x - 14, y - 8, 28, 18, 3); ink('#a8743e', 3); } c.beginPath(); c.moveTo(250, 1000); c.quadraticCurveTo(540, 1100, 830, 1000); c.lineWidth = 6; c.strokeStyle = '#c8a878'; c.stroke(); };
SCENES.treasury = (b, t) => { c.fillStyle = grad(0, 1400, '#5a2a3a', '#8a4a3a'); c.fillRect(0, 0, W, 1400); for (let i = 0; i < 6; i++) { ell(120 + i * 170, 520, 60, 60); ink('rgba(255,207,51,.25)', 3); } floorTiles(1380, '#6a3a2a', 'rgba(0,0,0,.25)');
 };
SCENES.lake = (b, t) => { c.fillStyle = grad(0, 900, '#ffcf9a', '#ffe8c8'); c.fillRect(0, 0, W, 900); sun(540, 760, 90); c.fillStyle = '#5a7ab0'; c.fillRect(0, 860, W, 120); c.fillStyle = grad(900, 1600, '#4a8ad0', '#2a5a9a'); c.fillRect(0, 900, W, H - 900);
  for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo((i * 130 + NOW * 30) % (W + 100) - 50, 1100 + (i % 3) * 140); c.lineTo((i * 130 + NOW * 30) % (W + 100) + 30, 1100 + (i % 3) * 140); c.lineWidth = 5; c.strokeStyle = 'rgba(255,255,255,.5)'; c.stroke(); } };
SCENES.track = (b, t) => { c.fillStyle = grad(0, 900, '#7fd0ff', '#d8f6ff'); c.fillRect(0, 0, W, 900); for (let i = 0; i < 12; i++) { rr(i * 95, 700 + (i % 3) * 20, 80, 200, 6); c.fillStyle = ['#e24b4b', '#3d7bff', '#ffd23f'][i % 3]; c.fill(); }
  c.fillStyle = '#c8553d'; c.fillRect(0, 900, W, H - 900); for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, 1000 + i * 150); c.lineTo(W, 1000 + i * 150); c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,.8)'; c.stroke(); } txt('2', 120, 1110, F(900, 70), 'rgba(255,255,255,.8)'); };

// props are drawn after the scene, before the cast: hook into the cast drawing by drawing them at the start of every frame's cast pass
const _scene = scene;
scene = function (b, i, T) { const t = T - b.start; (SCENES[b.bg] || street)(b, t); (b.props || []).forEach(([k, x, y, s = 1, f = 1, arg]) => PR[k] && PR[k](x, y, s, f, arg));
  const cs = castState(b, i, t); cs.sort((p, q) => (p.z || 0) - (q.z || 0)).forEach(o => character(o, t, o.id === b.who && T >= b.cap[0] && T <= b.cap[1], T)); cs.forEach(o => fx(o, T));
  (b.front || []).forEach(([k, x, y, s = 1, f = 1, arg]) => PR[k] && PR[k](x, y, s, f, arg)); };

// ---------- overlay ----------
function timerBox(T) { const L = BEATS, tb = L.find(b => b.timer), total = tb ? tb.timer : 30; let left = total; if (tb) left = T < tb.start ? total : Math.max(0, Math.ceil(total - (T - tb.start) * total / Math.max(.1, tb.end - tb.start - .2)));
  const red = tb && T > tb.start && left <= 3; c.save(); rr(300, 64, 480, 150, 30); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill(); rr(294, 56, 480, 150, 30); c.fillStyle = '#f2ead6'; c.fill();
  c.save(); c.translate(380, 131); const fl = tb && T > tb.start && T < tb.end ? (T * 1.2) % 1 : 0; c.rotate(fl > .9 ? (fl - .9) * 10 * Math.PI : 0); poly([[-40, -58], [40, -58], [6, 0], [40, 58], [-40, 58], [-6, 0]]); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#6b4a2e'; c.stroke();
  poly([[-26, 40], [26, 40], [0, 10]]); c.fillStyle = '#e8b04a'; c.fill(); rr(-48, -66, 96, 12, 4); c.fillStyle = '#6b4a2e'; c.fill(); rr(-48, 54, 96, 12, 4); c.fill(); c.restore();
  const s = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; [...s].forEach((ch, i) => { const x = 470 + i * 92; if (ch === ':') { txt(':', x - 20, 162, F(900, 80), '#1d2442'); return; } rr(x - 40, 76, 80, 110, 14); c.fillStyle = red ? '#c0392b' : '#1d2442'; c.fill(); txt(ch, x, 160, F(900, 82), '#fff'); }); c.restore(); }
function captionLine(b, T) { if (!b.cap || T < b.cap[0] || T > b.cap[1] + .2) return; const words = b.text.split(/\s+/), chunks = []; let cur = [];
  words.forEach(w => { cur.push(w); if (cur.length >= 4 || /[.,?!:;]$/.test(w)) { chunks.push(cur.join(' ')); cur = []; } }); if (cur.length) chunks.push(cur.join(' '));
  const tot = chunks.reduce((a, ch) => a + ch.length + 3, 0), k = (T - b.cap[0]) / (b.cap[1] - b.cap[0]) * tot; let acc = 0, idx = chunks.length - 1; for (let i = 0; i < chunks.length; i++) { acc += chunks[i].length + 3; if (k < acc) { idx = i; break; } }
  const s = chunks[idx]; c.save(); let fs = 70; c.font = F(900, fs); while (c.measureText(s).width > 960 && fs > 40) { fs -= 2; c.font = F(900, fs); } c.textAlign = 'center'; c.lineJoin = 'round'; c.lineWidth = 14; c.strokeStyle = 'rgba(20,12,34,.9)'; c.strokeText(s, 540, 330); c.fillStyle = idx % 2 ? '#ffe066' : '#fff'; c.fillText(s, 540, 330); c.restore(); }
function card(text, y, bg, fg, t) { const p = back((t - .1) / .45); if (p <= 0) return; c.save(); c.translate(540, y); c.scale(p, p); c.rotate(-.02); let fs = 64; c.font = F(900, fs); const lines = text.split('|'); let mw = Math.max(...lines.map(l => c.measureText(l).width));
  while (mw > 900 && fs > 36) { fs -= 2; c.font = F(900, fs); mw = Math.max(...lines.map(l => c.measureText(l).width)); } const h = lines.length * fs * 1.25 + 60, w = mw + 90;
  rr(-w / 2 + 10, -h / 2 + 10, w, h, 30); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); rr(-w / 2, -h / 2, w, h, 30); c.fillStyle = bg; c.fill(); lines.forEach((l, i) => txt(l, 0, -h / 2 + 30 + fs + i * fs * 1.25 - fs * .2, F(900, fs), fg)); c.restore(); }
window.UI = (b, t, T, i) => { timerBox(T); if (b.ask) card(b.ask, 520, '#fff', '#231a2e', t); if (b.reveal) { card('ANSWER', 470, '#3cc85a', '#fff', t); if (b.answer) card(b.answer, 640, '#fff', '#231a2e', t - .3); } else if (!b.ask) captionLine(b, T);
  if (b.ask) captionLine(b, T); if (EP.cta && i === BEATS.length - 1) card(EP.cta, 1880 - 70, '#ffd23f', '#231a2e', t - .5); return true; };
