// Car Mechanic 101: animated cutaway diagrams, added to the flat engine's PROPS.
// Each prop draws centred on (0, 0) inside the prop area (~900 x 480); k = progress through the beat, T = seconds.
const BLUE = '#5aa0d8', HOT = '#e8562a', STEEL = '#c9cdd4', STEELD = '#8f959e', OIL = '#3a2a1e';
function gearShape(x, y, r, teeth, a, fill) { X.beginPath(); for (let i = 0; i < teeth * 2; i++) { const ang = a + i / (teeth * 2) * Math.PI * 2, rr2 = i % 2 ? r : r + 16;
    X.lineTo(x + Math.cos(ang - .08) * rr2, y + Math.sin(ang - .08) * rr2); X.lineTo(x + Math.cos(ang + .08) * rr2, y + Math.sin(ang + .08) * rr2); } X.closePath();
  X.fillStyle = fill || STEEL; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); circ(x, y, r * .3, STEELD, 4); circ(x, y, 8, C.ink, 0); line([[x, y], [x + Math.cos(a) * r * .8, y + Math.sin(a) * r * .8]], 6, C.ink); }
function flowDots(pts, T, col, n = 14, speed = .35, rev = false) { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  for (let j = 0; j < n; j++) { let u = frac(j / n + (rev ? -1 : 1) * T * speed) * tot, i = 0; while (i < L.length - 1 && u > L[i]) { u -= L[i]; i++; } const f = u / L[i];
    circ(lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f), 9, typeof col === 'function' ? col(j / n) : col, 0); } }
function arrow(x0, y0, x1, y1, col = C.or, lw = 8) { line([[x0, y0], [x1, y1]], lw, col); const a = Math.atan2(y1 - y0, x1 - x0); X.beginPath(); X.moveTo(x1 + Math.cos(a) * 20, y1 + Math.sin(a) * 20);
  X.lineTo(x1 + Math.cos(a + 2.4) * 22, y1 + Math.sin(a + 2.4) * 22); X.lineTo(x1 + Math.cos(a - 2.4) * 22, y1 + Math.sin(a - 2.4) * 22); X.closePath(); X.fillStyle = col; X.fill(); }
function wheel(x, y, r, a = 0) { circ(x, y, r, '#2b2724', 5); circ(x, y, r * .62, STEEL, 4); for (let i = 0; i < 5; i++) line([[x, y], [x + Math.cos(a + i * 1.256) * r * .55, y + Math.sin(a + i * 1.256) * r * .55]], 6, STEELD); circ(x, y, r * .15, STEELD, 3); }
function carSide(col = '#d9603a', x0 = -400) { X.beginPath(); X.moveTo(x0, 40); X.lineTo(x0, -40); X.lineTo(x0 + 140, -60); X.lineTo(x0 + 280, -150); X.lineTo(x0 + 560, -150); X.lineTo(x0 + 700, -60); X.lineTo(x0 + 800, -40); X.lineTo(x0 + 800, 40); X.closePath();
  X.fillStyle = col; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke(); X.beginPath(); X.moveTo(x0 + 300, -135); X.lineTo(x0 + 410, -135); X.lineTo(x0 + 410, -65); X.lineTo(x0 + 220, -65); X.closePath(); X.fillStyle = '#cfe3ee'; X.fill(); X.stroke();
  X.beginPath(); X.moveTo(x0 + 430, -135); X.lineTo(x0 + 545, -135); X.lineTo(x0 + 640, -65); X.lineTo(x0 + 430, -65); X.closePath(); X.fill(); X.stroke(); }

Object.assign(PROPS, {
  // four-stroke cylinder; p.stroke = 0..3 loops a single stroke, otherwise the full cycle runs
  engine4(p, k, T) { const sp = p.speed || 1.6, th = p.stroke !== undefined ? p.stroke * Math.PI + frac(T * .45) * Math.PI : (T * sp) % (Math.PI * 4);
    const r = 62, Lr = 210, cy = 200, cr = th % (Math.PI * 2), py = cy - (r * Math.cos(cr) + Math.sqrt(Lr * Lr - Math.pow(r * Math.sin(cr), 2))), st = Math.floor(th / Math.PI) % 4;
    const names = ['INTAKE', 'COMPRESSION', 'POWER', 'EXHAUST'], fill = [ 'rgba(90,160,216,.45)', 'rgba(90,160,216,.75)', 'rgba(240,120,40,.85)', 'rgba(120,115,110,.6)'][st];
    X.save(); X.scale(.82, .82); X.translate(0, 70); X.save(); X.translate(-120, 0);
    rr(-150, -250, 300, 300, 10); X.fillStyle = '#f3eee6'; X.fill(); X.save(); rr(-150, -250, 300, py + 250 - 40, 0); X.clip(); X.fillStyle = fill; X.fillRect(-150, -250, 300, 400); X.restore();
    rr(-180, -320, 40, 380, 6); X.fillStyle = STEELD; X.fill(); rr(140, -320, 40, 380, 6); X.fill(); rr(-180, -330, 360, 80, 10); X.fillStyle = STEELD; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke();
    const vo = [st === 0 ? 1 : 0, st === 3 ? 1 : 0].map(v => v * 22 * Math.abs(Math.sin((th % Math.PI)))); [-70, 70].forEach((x, i) => { line([[x, -380], [x, -262 + vo[i]]], 12, C.ink); X.beginPath(); X.moveTo(x - 34, -250 + vo[i]); X.lineTo(x + 34, -250 + vo[i]); X.lineTo(x + 10, -266 + vo[i]); X.lineTo(x - 10, -266 + vo[i]); X.closePath(); X.fillStyle = STEEL; X.fill(); X.lineWidth = 3; X.stroke(); });
    txt('IN', -70, -405, F.mono(24, 700), BLUE); txt('OUT', 70, -405, F.mono(24, 700), C.mut); rr(-12, -360, 24, 46, 6); X.fillStyle = '#efe6d2'; X.fill(); X.stroke();
    if (st === 2 && (th % Math.PI) < .5) { X.save(); X.globalAlpha = 1 - (th % Math.PI) / .5; circ(0, -240, 60, '#ffe27a', 0); X.restore(); for (let i = 0; i < 8; i++) line([[0, -250], [Math.cos(i) * 50, -250 + Math.abs(Math.sin(i)) * 50]], 4, '#f2b632'); }
    if (st === 0) flowDots([[-70, -380], [-70, -250], [-40, py - 60]], T, BLUE, 6, .8); if (st === 3) flowDots([[40, py - 60], [70, -250], [70, -380]], T, '#8a847a', 6, .8);
    rr(-140, py - 40, 280, 90, 10); X.fillStyle = STEEL; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); [py - 20, py - 2].forEach(y => line([[-140, y], [140, y]], 3, STEELD));
    const cx = r * Math.sin(cr), cyy = cy - r * Math.cos(cr); line([[0, py + 10], [cx, cyy]], 26, C.ink); line([[0, py + 10], [cx, cyy]], 16, STEELD); circ(0, cy, 90, '#d8d2c6', 4); circ(cx, cyy, 18, C.ink, 0); circ(0, cy, 14, C.ink, 0); X.restore();
    // stroke panel
    names.forEach((n, i) => { const on = i === st, y = -170 + i * 92; box(170, y - 36, 300, 72, 36, on ? C.or : C.card, 4); txt(`${i + 1}. ${n}`, 320, y + 2, F.mono(28, 700), on ? '#fff' : C.mut); }); X.restore(); },

  carmap(p, k, T) { const parts = { radiator: [-395, 0, 30, 220, 'RADIATOR'], engine: [-290, 0, 150, 190, 'ENGINE'], gearbox: [-160, 0, 90, 110, 'GEARBOX'], shaft: [10, 0, 260, 24, 'DRIVESHAFT'], diff: [230, 0, 80, 80, 'DIFFERENTIAL'],
      tank: [330, 0, 70, 220, 'FUEL TANK'], battery: [-320, -150, 70, 50, 'BATTERY'], brakes: [-260, 205, 70, 40, 'BRAKES'], susp: [270, -205, 60, 40, 'SUSPENSION'], steer: [-260, -60, 30, 120, 'STEERING'] };
    rr(-450, -240, 900, 480, 140); X.fillStyle = '#f3eee6'; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke(); rr(-120, -190, 330, 380, 40); X.lineWidth = 3; X.strokeStyle = C.line; X.stroke();
    [[-260, -235], [-260, 235], [270, -235], [270, 235]].forEach(([x, y]) => { rr(x - 70, y - 30, 140, 60, 16); X.fillStyle = '#2b2724'; X.fill(); });
    const hi = p.hi || []; Object.entries(parts).forEach(([key, [x, y, w, h, lab]], i) => { const on = hi.includes(key) || hi.includes('all'); rr(x - w / 2, y - h / 2, w, h, 10); X.fillStyle = on ? C.or : '#d9d2c6'; X.fill(); X.lineWidth = 3.5; X.strokeStyle = C.ink; X.stroke(); });
    hi.filter(h => parts[h]).forEach((key, i) => { const [x, y, w, h, lab] = parts[key], e = back((k - .15 - i * .1) * 4); if (e <= 0) return; X.save(); X.translate(x, y + (y > 0 ? 80 : -80) - (h > 150 ? (y >= 0 ? -60 : 60) : 0)); X.scale(e, e); pill(lab, 0, 0, F.mono(26, 700), C.ink, '#fff'); X.restore(); }); },

  gears(p, k, T) { const r1 = p.r1 || 70, r2 = p.r2 || 140, a1 = T * (p.speed || 1.6), a2 = -a1 * r1 / r2 + Math.PI / (r2 / 8), x1 = -(r1 + r2 + 16) / 2 + r1 * 0 - 40, x2 = x1 + r1 + r2 + 16;
    gearShape(x1, 0, r1, Math.round(r1 / 9), a1, '#f2b632'); gearShape(x2, 0, r2, Math.round(r2 / 9), a2, STEEL);
    txt(p.l1 || 'ENGINE SIDE', x1, -r1 - 60, F.mono(26, 700), C.mut); txt(p.l2 || 'WHEEL SIDE', x2, -r2 - 50, F.mono(26, 700), C.mut);
    if (p.label) pill(p.label, 0, 215, F.sg(36, 700), C.or, '#fff'); },

  clutch(p, k, T) { const gap = (Math.sin(T * 1.6) > 0 ? 0 : 1) * 40, sp = T * 5; X.save(); X.translate(-60, 0);
    line([[-420, 0], [-120, 0]], 30, STEELD); rr(-140, -170, 40, 340, 8); X.fillStyle = STEEL; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); txt('ENGINE', -280, -60, F.mono(26, 700), C.mut);
    rr(-96 + gap, -140, 26, 280, 6); X.fillStyle = '#b8743a'; X.fill(); X.stroke(); rr(-66 + gap, -160, 40, 320, 8); X.fillStyle = STEEL; X.fill(); X.stroke(); line([[-26 + gap, 0], [300, 0]], 30, STEELD); txt('GEARBOX', 180, -60, F.mono(26, 700), C.mut);
    for (let i = 0; i < 3; i++) { const y = Math.sin(sp + i * 2) * 120; line([[-140, y], [-100, y]], 5, C.ink); if (!gap) line([[-60, y], [-26, y]], 5, C.ink); }
    X.restore(); pill(gap ? 'PEDAL DOWN: DISCONNECTED' : 'PEDAL UP: CONNECTED', 0, 215, F.mono(28, 700), gap ? C.card : C.or, gap ? C.ink : '#fff'); },

  brake(p, k, T) { const sq = p.squeeze ?? clamp((k - .25) * 4), w = T * 6 * (1 - .8 * sq); X.save(); X.translate(160, 10);
    circ(0, 0, 200, '#d8d4cc', 5); for (let i = 0; i < 12; i++) circ(Math.cos(w + i * .52) * 150, Math.sin(w + i * .52) * 150, 9, '#9a958c', 0); circ(0, 0, 80, STEELD, 4); for (let i = 0; i < 5; i++) circ(Math.cos(w + i * 1.256) * 45, Math.sin(w + i * 1.256) * 45, 10, C.ink, 0);
    if (sq > .5) { X.save(); X.globalAlpha = (sq - .5) * .6; circ(0, 0, 196, HOT, 0); X.restore(); }
    rr(-90, -250, 180, 120, 22); X.fillStyle = C.or; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke(); rr(-70, -150 + (1 - sq) * -20, 140, 22, 6); X.fillStyle = '#5a4a3a'; X.fill(); X.stroke(); txt('CALIPER', 0, -195, F.mono(24, 700), '#fff'); X.restore();
    X.save(); X.translate(-330, 120); X.rotate(-.4 + sq * .3); rr(-20, -160, 40, 160, 10); X.fillStyle = STEELD; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); rr(-50, -190, 100, 40, 12); X.fillStyle = '#2b2724'; X.fill(); X.restore(); txt('PEDAL', -330, 200, F.mono(24, 700), C.mut);
    const pipe = [[-300, 40], [-220, -60], [0, -60], [80, -180]]; line(pipe, 16, C.ink); line(pipe, 9, '#e8c27a'); if (sq > .05) flowDots(pipe, T, HOT, 8, .8); },

  suspension(p, k, T) { const mode = p.mode || 'good', bx = ((T * 300) % 1400) - 700, bump = x => Math.max(0, 1 - Math.abs(x) / 120) * 70, wy = 120 - bump(-bx);
    const lag = mode === 'none' ? Math.sin(T * 6) * 30 * Math.exp(-((T % 4.6) - (700 / 300)) * .2) : mode === 'spring' ? Math.sin(T * 7) * 18 : 0, by = -120 - (120 - wy) * (mode === 'good' ? .25 : .55) + lag;
    rr(-450, 220, 900, 30, 0); X.fillStyle = '#6a645c'; X.fill(); X.beginPath(); X.moveTo(bx - 130, 220); X.quadraticCurveTo(bx, 130, bx + 130, 220); X.closePath(); X.fillStyle = '#6a645c'; X.fill();
    wheel(0, wy, 90, -T * 4); const top = by + 40, bot = wy - 60, n = 9; X.beginPath(); for (let i = 0; i <= n * 8; i++) { const f = i / (n * 8), y = lerp(top, bot, f); X.lineTo(-90 + Math.sin(f * n * Math.PI * 2) * 34, y); } X.lineWidth = 9; X.strokeStyle = C.or; X.stroke();
    if (mode !== 'none' && mode !== 'spring') { rr(66, top, 40, (bot - top) * .55, 8); X.fillStyle = STEELD; X.fill(); X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke(); line([[86, top + (bot - top) * .55], [86, bot]], 10, C.ink); }
    rr(-300, by - 80, 600, 120, 24); X.fillStyle = '#5a7aa0'; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke(); txt('CAR BODY', 0, by - 20, F.mono(28, 700), '#fff');
    if (p.label) pill(p.label, 300, 160, F.mono(26, 700), C.card, C.ink); },

  turbo(p, k, T) { const a = T * 9; X.save(); X.translate(-200, 0); circ(0, 0, 140, '#e8a07a', 5); for (let i = 0; i < 8; i++) line([[0, 0], [Math.cos(a + i * .785) * 120, Math.sin(a + i * .785) * 120]], 10, '#b8562a'); circ(0, 0, 26, C.ink, 0); txt('TURBINE (HOT)', 0, 190, F.mono(26, 700), HOT); X.restore();
    X.save(); X.translate(200, 0); circ(0, 0, 140, '#bcd8ec', 5); for (let i = 0; i < 8; i++) line([[0, 0], [Math.cos(-a + i * .785) * 120, Math.sin(-a + i * .785) * 120]], 10, '#3a7ab0'); circ(0, 0, 26, C.ink, 0); txt('COMPRESSOR', 0, 190, F.mono(26, 700), BLUE); X.restore();
    rr(-60, -14, 120, 28, 10); X.fillStyle = STEELD; X.fill(); X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke();
    flowDots([[-460, -180], [-260, -120], [-200, 0], [-320, 160], [-460, 220]], T, i => `rgba(${200 - i * 60},${90 + i * 30},${60 + i * 40},1)`, 12, .5); flowDots([[460, 220], [260, 140], [200, 0], [300, -150], [460, -210]], T, BLUE, 12, .5);
    txt('EXHAUST IN', -400, -230, F.mono(22, 700), C.mut); txt('TO ENGINE', 400, -250, F.mono(22, 700), C.mut); },

  diff(p, k, T) { X.save(); X.translate(-260, 220); X.strokeStyle = C.line; X.lineWidth = 46; X.beginPath(); X.arc(0, 0, 360, -Math.PI / 2, 0); X.stroke();
    X.lineWidth = 5; X.strokeStyle = C.or; X.setLineDash([16, 12]); X.beginPath(); X.arc(0, 0, 440, -Math.PI / 2, 0); X.stroke(); X.strokeStyle = BLUE; X.beginPath(); X.arc(0, 0, 280, -Math.PI / 2, 0); X.stroke(); X.setLineDash([]);
    const u = frac(T * .12) * Math.PI / 2 - Math.PI / 2; circ(Math.cos(u) * 440, Math.sin(u) * 440, 22, C.or, 4); circ(Math.cos(u) * 280, Math.sin(u) * 280, 22, BLUE, 4); line([[Math.cos(u) * 280, Math.sin(u) * 280], [Math.cos(u) * 440, Math.sin(u) * 440]], 8, C.ink); X.restore();
    pill('OUTER WHEEL: LONGER PATH', 250, -170, F.mono(26, 700), C.or, '#fff'); pill('INNER WHEEL: SHORTER PATH', 250, -90, F.mono(26, 700), BLUE, '#fff');
    if (p.gearset) { X.save(); X.translate(260, 110); const a = T * 2; gearShape(-70, 0, 46, 6, a, STEEL); gearShape(70, 0, 46, 6, -a, STEEL); gearShape(0, -60, 34, 5, a * 1.3, '#f2b632'); gearShape(0, 60, 34, 5, -a * 1.3, '#f2b632'); X.restore(); } },

  chassis(p, k, T) { const mode = p.mode || 'mono', c = mode === 'crash' ? clamp((k - .2) * 2.5) : 0; X.save(); X.translate(0, 30);
    if (mode === 'frame') { rr(-440, 40, 880, 40, 10); X.fillStyle = '#4a4a50'; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); for (let i = 0; i < 5; i++) rr(-400 + i * 200, 20, 24, 80, 4), X.fill(); X.globalAlpha = .55; carSide('#d9603a'); X.globalAlpha = 1; pill('LADDER FRAME', 0, 150, F.mono(28, 700), C.ink, '#fff'); }
    else { X.save(); X.translate(0, 0); if (mode === 'crash') { X.translate(c * 120, 0); X.scale(1, 1); } carSide(mode === 'crash' ? '#d9d2c6' : '#d9d2c6');
      X.save(); X.beginPath(); X.moveTo(-170, 40); X.lineTo(-170, -60); X.lineTo(-120, -150); X.lineTo(160, -150); X.lineTo(300, -60); X.lineTo(300, 40); X.closePath(); X.lineWidth = 12; X.strokeStyle = C.or; X.stroke(); X.restore();
      if (mode === 'crash') { X.save(); X.beginPath(); X.rect(-400 - 10, -70, 230 - c * 120, 120); X.fillStyle = 'rgba(240,80,42,.25)'; X.fill(); for (let i = 0; i < 6; i++) line([[-400 + i * (230 - c * 120) / 6, -60], [-400 + (i + .5) * (230 - c * 120) / 6, 40]], 4, C.ink); X.restore(); }
      X.restore(); if (mode === 'crash') { rr(-480, -200, 40, 260, 6); X.fillStyle = '#4a4a50'; X.fill(); pill('CRUMPLE ZONE', -240, 150, F.mono(26, 700), C.or, '#fff'); pill('SAFETY CAGE', 160, 150, F.mono(26, 700), C.ink, '#fff'); }
      else pill('MONOCOQUE: THE BODY IS THE FRAME', 0, 150, F.mono(26, 700), C.ink, '#fff'); }
    [-260, 260].forEach(x => wheel(x + (mode === 'crash' ? c * 120 : 0), 50, 62, 0)); X.restore(); },

  cooling(p, k, T) { const open = p.open ?? true; rr(-440, -160, 300, 320, 20); X.fillStyle = '#9a958c'; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke(); txt('ENGINE', -290, 0, F.sg(40, 700), '#fff');
    rr(160, -200, 260, 400, 12); X.fillStyle = '#d8d4cc'; X.fill(); X.stroke(); for (let i = 0; i < 16; i++) line([[176, -184 + i * 24], [404, -184 + i * 24]], 3, STEELD); txt('RADIATOR', 290, 240, F.mono(26, 700), C.mut);
    X.save(); X.translate(290, 0); X.rotate(T * 8); for (let i = 0; i < 4; i++) { X.save(); X.rotate(i * 1.57); X.beginPath(); X.ellipse(0, -55, 22, 55, 0, 0, 7); X.fillStyle = 'rgba(40,40,40,.35)'; X.fill(); X.restore(); } X.restore();
    const top = [[-140, -100], [160, -100]], bot = [[160, 100], [-140, 100]]; line(top, 22, C.ink); line(top, 13, '#e88a6a'); line(bot, 22, C.ink); line(bot, 13, '#8ac0e8');
    circ(-60, 100, 34, STEEL, 4); txt('PUMP', -60, 160, F.mono(22, 700), C.mut); rr(20, -130, 50, 60, 8); X.fillStyle = open ? '#3cc85a' : C.or; X.fill(); X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke(); txt(open ? 'THERMOSTAT OPEN' : 'THERMOSTAT SHUT', 45, -170, F.mono(22, 700), open ? '#2f9e5b' : C.or);
    if (open) { flowDots(top, T, HOT, 7, .5); flowDots(bot, T, BLUE, 7, .5); } },

  ev(p, k, T) { const rg = !!p.regen; rr(-450, 120, 520, 90, 16); X.fillStyle = '#4a5a6a'; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke(); for (let i = 0; i < 10; i++) rr(-430 + i * 50, 136, 40, 58, 6), X.fillStyle = '#8ab0d0', X.fill(); txt('BATTERY (DC)', -190, 250, F.mono(24, 700), C.mut);
    rr(-60, -170, 200, 130, 16); X.fillStyle = '#f2b632'; X.fill(); X.stroke(); txt('INVERTER', 40, -105, F.mono(26, 700), C.ink);
    circ(330, -40, 110, STEEL, 5); for (let i = 0; i < 6; i++) { const a = T * (rg ? -4 : 6) + i * 1.05; rr(330 + Math.cos(a) * 60 - 16, -40 + Math.sin(a) * 60 - 16, 32, 32, 6); X.fillStyle = i % 2 ? C.or : BLUE; X.fill(); } circ(330, -40, 22, C.ink, 0); txt('MOTOR (AC)', 330, 110, F.mono(24, 700), C.mut);
    const pa = [[-190, 120], [-190, -100], [-60, -100]], pb = [[140, -100], [220, -60]]; line(pa, 10, C.ink); line(pb, 10, C.ink); flowDots(pa, T, rg ? '#3cc85a' : '#f2b632', 8, .6, rg); flowDots(pb, T, rg ? '#3cc85a' : '#f2b632', 4, .6, rg);
    if (rg) pill('REGEN: ENERGY BACK TO BATTERY', 0, -230, F.mono(26, 700), '#3cc85a', '#fff'); },
});
