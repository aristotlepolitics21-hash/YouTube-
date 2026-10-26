// Car Mechanic 101, batch 2: ignition, injection, charging, steering, tyres, oil, dashboard lights, hybrids, timing belt.
// Uses the helpers from page.html and diagrams.js (gearShape, flowDots, arrow, wheel, carSide).
function bolt(x0, y0, x1, y1, T, col = '#ffe27a') { const pts = [[x0, y0]]; for (let i = 1; i < 6; i++) { const f = i / 6; pts.push([lerp(x0, x1, f) + Math.sin(T * 40 + i * 2) * 10, lerp(y0, y1, f)]); } pts.push([x1, y1]); line(pts, 6, col); }
function lightIcon(kind, x, y, col, on) { X.save(); X.translate(x, y); X.globalAlpha = on ? 1 : .18; X.strokeStyle = col; X.fillStyle = col; X.lineWidth = 6; X.lineCap = 'round'; X.lineJoin = 'round';
  if (kind === 'oil') { X.beginPath(); X.moveTo(-40, 10); X.lineTo(20, 10); X.lineTo(40, -6); X.lineTo(20, -16); X.lineTo(-30, -16); X.closePath(); X.stroke(); X.beginPath(); X.arc(48, 14, 5, 0, 7); X.fill(); }
  else if (kind === 'temp') { X.beginPath(); X.moveTo(0, -36); X.lineTo(0, 14); X.stroke(); X.beginPath(); X.arc(0, 22, 10, 0, 7); X.fill(); [-24, -10].forEach(yy => { X.beginPath(); X.moveTo(6, yy); X.lineTo(20, yy); X.stroke(); }); X.beginPath(); X.moveTo(-34, 36); X.quadraticCurveTo(-17, 28, 0, 36); X.quadraticCurveTo(17, 44, 34, 36); X.stroke(); }
  else if (kind === 'battery') { X.strokeRect(-36, -20, 72, 44); X.fillRect(-26, -30, 12, 10); X.fillRect(14, -30, 12, 10); X.beginPath(); X.moveTo(-24, 2); X.lineTo(-10, 2); X.moveTo(-17, -5); X.lineTo(-17, 9); X.moveTo(10, 2); X.lineTo(24, 2); X.stroke(); }
  else if (kind === 'brake' || kind === 'abs' || kind === 'tpms') { X.beginPath(); X.arc(0, 0, 30, 0, 7); X.stroke(); X.beginPath(); X.arc(0, 0, 42, -.9, .9); X.stroke(); X.beginPath(); X.arc(0, 0, 42, Math.PI - .9, Math.PI + .9); X.stroke();
    X.font = '900 30px "DejaVu Sans", sans-serif'; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText(kind === 'abs' ? 'ABS' : '!', 0, 2); if (kind === 'abs') { X.font = '900 22px "DejaVu Sans", sans-serif'; X.fillText('ABS', 0, 2); } }
  else if (kind === 'engine') { X.beginPath(); X.moveTo(-40, -10); X.lineTo(-28, -10); X.lineTo(-28, -22); X.lineTo(10, -22); X.lineTo(18, -12); X.lineTo(34, -12); X.lineTo(34, 22); X.lineTo(-20, 22); X.lineTo(-28, 12); X.lineTo(-40, 12); X.closePath(); X.stroke(); }
  else if (kind === 'beam') { X.beginPath(); X.arc(-6, 0, 24, -1.57, 1.57); X.closePath(); X.stroke(); for (let i = 0; i < 4; i++) { X.beginPath(); X.moveTo(-50, -18 + i * 12); X.lineTo(-30, -18 + i * 12); X.stroke(); } }
  X.restore(); }

Object.assign(PROPS, {
  spark(p, k, T) { const worn = p.mode === 'worn'; rr(-440, -60, 150, 110, 12); X.fillStyle = '#3a3a40'; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); txt('12 V', -365, 0, F.sg(40, 700), '#fff');
    rr(-200, -120, 170, 230, 16); X.fillStyle = '#6a7a8a'; X.fill(); X.stroke(); for (let i = 0; i < 9; i++) line([[-185, -100 + i * 24], [-45, -90 + i * 24]], 4, '#c98a3a'); txt('IGNITION COIL', -115, 150, F.mono(22, 700), C.mut);
    const w1 = [[-290, 0], [-200, 0]], w2 = [[-30, 0], [120, 0], [160, -80]]; line(w1, 8, C.ink); line(w2, 10, C.ink); flowDots(w2, T, '#f2b632', 8, .9);
    X.save(); X.translate(260, -40); X.rotate(.35); rr(-40, -190, 80, 140, 18); X.fillStyle = '#f2ede2'; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); rr(-50, -50, 100, 60, 8); X.fillStyle = STEELD; X.fill(); X.stroke();
    rr(-26, 10, 52, 90, 6); X.fillStyle = STEEL; X.fill(); X.stroke(); for (let i = 0; i < 5; i++) line([[-26, 20 + i * 16], [26, 26 + i * 16]], 3, C.ink); line([[0, 100], [0, 150]], 8, C.ink); line([[ -30, 175], [worn ? 6 : 14, 175], [worn ? 6 : 14, 160]], 8, worn ? '#8a7a6a' : C.ink);
    if (!worn || frac(T * 3) < .3) { const f = (T * 12) % 1 < .6; if (f) bolt(0, 150, 0, 172, T, worn ? '#c9b07a' : '#7ad8ff'); } X.restore();
    pill(worn ? 'WORN GAP: WEAK SPARK' : '12 V  →  20,000+ V', 160, 200, F.mono(28, 700), worn ? C.card : C.or, worn ? C.ink : '#fff'); },

  injector(p, k, T) { X.save(); X.translate(-140, 0); rr(-170, -150, 340, 300, 10); X.fillStyle = '#f3eee6'; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke(); rr(-160, 90, 320, 60, 8); X.fillStyle = STEEL; X.fill(); X.stroke();
    X.save(); X.translate(-120, -170); X.rotate(.6); rr(-18, -120, 36, 120, 8); X.fillStyle = '#3a3a40'; X.fill(); X.stroke(); X.restore();
    if (frac(T * 1.2) < .45) { const u = frac(T * 1.2) / .45; for (let i = 0; i < 26; i++) { const a = .5 + (hr(i) - .5) * .5, d = u * (160 + hr(i + 9) * 80); circ(-110 + Math.cos(a) * d, -150 + Math.sin(a) * d, 5 + hr(i + 3) * 4, 'rgba(240,180,60,.85)', 0); } }
    X.restore(); rr(200, -160, 200, 120, 14); X.fillStyle = '#2f4a6a'; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); txt('ECU', 300, -100, F.sg(44, 700), '#fff');
    line([[200, -120], [-180, -250]], 4, C.ink); [['AIR FLOW', 400], ['OXYGEN', 170]].forEach(([l, x]) => { line([[300, -40], [x, 80]], 4, C.ink); pill(l + ' SENSOR', x, 110, F.mono(20, 700), C.card, C.ink, 14, 44); });
    if (p.ratio) pill('14.7 : 1  AIR : FUEL', 0, 220, F.mono(28, 700), C.or, '#fff'); },

  charging(p, k, T) { const start = p.mode === 'start'; const crank = [-150, 120], alt = [180, -110];
    X.beginPath(); X.arc(crank[0], crank[1], 110, 0, 7); X.fillStyle = STEEL; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke(); txt('CRANK', crank[0], crank[1] + 150, F.mono(22, 700), C.mut);
    rr(alt[0] - 90, alt[1] - 90, 180, 180, 40); X.fillStyle = '#9aa0a8'; X.fill(); X.stroke(); circ(alt[0], alt[1], 46, STEELD, 4); txt('ALTERNATOR', alt[0], alt[1] - 120, F.mono(22, 700), C.mut);
    const a = start ? T * 3 : T * 5; for (let i = 0; i < 4; i++) line([[crank[0], crank[1]], [crank[0] + Math.cos(a + i * 1.57) * 90, crank[1] + Math.sin(a + i * 1.57) * 90]], 6, STEELD);
    line([[crank[0] - 110, crank[1]], [alt[0] - 46, alt[1]]], 8, C.ink); line([[crank[0] + 110, crank[1]], [alt[0] + 46, alt[1]]], 8, C.ink);
    rr(-440, -160, 160, 110, 12); X.fillStyle = '#3a3a40'; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); txt('BATTERY', -360, -105, F.mono(22, 700), '#fff');
    const wire = start ? [[-280, -105], [-320, 40], [-300, 160]] : [[alt[0], alt[1] - 90], [alt[0], -240], [-360, -240], [-360, -160]]; line(wire, 8, C.ink); flowDots(wire, T, start ? C.or : '#3cc85a', start ? 14 : 10, start ? 1.4 : .6);
    if (start) { rr(-380, 140, 120, 80, 14); X.fillStyle = C.or; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); txt('STARTER', -320, 180, F.mono(20, 700), '#fff'); gearShape(-250, 150, 26, 6, T * 9, '#f2b632'); }
    pill(start ? 'STARTER: HUNDREDS OF AMPS' : 'ALTERNATOR: ~14 V, RECHARGES', 140, 220, F.mono(26, 700), start ? C.or : '#3cc85a', '#fff'); },

  rack(p, k, T) { const turn = Math.sin(T * 1.4), sx = turn * 60; X.save(); X.translate(0, -120); X.rotate(turn * 1.2); circ(0, 0, 110, null, 16); line([[-104, 0], [104, 0]], 14, C.ink); line([[0, 0], [0, 104]], 14, C.ink); circ(0, 0, 26, C.ink, 0); X.restore();
    line([[0, -10], [0, 90]], 18, STEELD); gearShape(0, 110, 30, 7, turn * 3, '#f2b632'); rr(-300 + sx, 140, 600, 34, 8); X.fillStyle = STEEL; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); for (let i = 0; i < 18; i++) line([[-280 + sx + i * 32, 140], [-268 + sx + i * 32, 130]], 4, C.ink);
    [-1, 1].forEach(s => { line([[s * 300 + sx, 157], [s * 380, 157]], 12, C.ink); X.save(); X.translate(s * 420, 157); X.rotate(-turn * .35); rr(-34, -80, 68, 160, 16); X.fillStyle = '#2b2724'; X.fill(); X.restore(); });
    if (p.assist) { rr(150 + sx * 0, 190, 140, 60, 12); X.fillStyle = C.or; X.fill(); X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke(); txt('E-MOTOR', 220, 220, F.mono(20, 700), '#fff'); }
    pill(p.label || 'RACK AND PINION', 0, 270, F.mono(26, 700), C.ink, '#fff'); },

  tyre(p, k, T) { const parts = [['205', 'WIDTH: 205 MM'], ['55', 'SIDEWALL = 55% OF WIDTH'], ['R', 'RADIAL CONSTRUCTION'], ['16', 'FITS A 16-INCH WHEEL'], ['91', 'LOAD: 615 KG PER TYRE'], ['V', 'SPEED: UP TO 240 KM/H']];
    X.save(); X.beginPath(); X.arc(0, 520, 640, Math.PI * 1.2, Math.PI * 1.8); X.lineWidth = 210; X.strokeStyle = '#2b2724'; X.stroke(); X.restore(); X.save(); X.beginPath(); X.arc(0, 520, 520, Math.PI * 1.2, Math.PI * 1.8); X.lineWidth = 30; X.strokeStyle = STEEL; X.stroke(); X.restore();
    const hi = p.hi ?? -1; X.font = F.mono(64, 700); let x = -330; ['205', '/', '55', ' ', 'R', '16', ' ', '91', 'V'].forEach(t => { const idx = ['205', '55', 'R', '16', '91', 'V'].indexOf(t), on = idx === hi; X.fillStyle = on ? C.or : '#d8d4cc'; X.textAlign = 'left'; X.textBaseline = 'middle'; X.fillText(t, x, -60); x += X.measureText(t).width; });
    if (hi >= 0) pill(parts[hi][1], 0, 140, F.mono(30, 700), C.or, '#fff');
    if (p.date) pill('DOT ...2321 = WEEK 23 OF 2021', 0, 140, F.mono(28, 700), C.ink, '#fff'); },

  tread(p, k) { const depth = p.depth ?? 8; rr(-400, 40, 800, 60, 10); X.fillStyle = '#2b2724'; X.fill(); for (let i = 0; i < 8; i++) { rr(-390 + i * 100, 40 - depth * 18, 80, depth * 18, 8); X.fillStyle = '#3a3532'; X.fill(); X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke(); }
    line([[-420, 40 - 1.6 * 18], [420, 40 - 1.6 * 18]], 4, C.or); pill('LEGAL MIN 1.6 MM (UK/EU)', 0, -230, F.mono(26, 700), C.or, '#fff'); pill(depth > 3 ? 'NEW: ~8 MM' : 'WORN: REPLACE', 0, 170, F.mono(28, 700), depth > 3 ? '#3cc85a' : C.or, '#fff'); },

  oilsys(p, k, T) { const col = p.dirty ? '#2a2018' : '#d9a53a'; rr(-330, -230, 460, 330, 26); X.fillStyle = '#9a958c'; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke(); txt('ENGINE', -100, -170, F.sg(40, 700), '#fff');
    rr(-300, 100, 400, 110, 20); X.fillStyle = '#5a5a60'; X.fill(); X.stroke(); X.save(); rr(-296, 140, 392, 66, 16); X.fillStyle = col; X.fill(); X.restore(); txt('SUMP', -100, 240, F.mono(22, 700), C.mut);
    const path = [[-200, 160], [-200, 40], [-200, -100], [0, -100], [0, 40], [60, 160]]; line(path, 12, C.ink); line(path, 7, col); flowDots(path, T, col, 10, .5); circ(-200, 40, 26, STEEL, 4); txt('PUMP', -260, 40, F.mono(20, 700), C.mut, 'right');
    X.save(); X.translate(320, -10); rr(-12, -260, 24, 380, 8); X.fillStyle = STEEL; X.fill(); X.lineWidth = 3; X.strokeStyle = C.ink; X.stroke(); const lv = p.level ?? .6; rr(-12, 120 - 140 * lv - 120, 24, 140 * lv, 6); X.fillStyle = col; X.fill();
    [['MAX', -20], ['MIN', 40]].forEach(([l, y]) => { line([[-24, y], [24, y]], 4, C.ink); txt(l, 40, y, F.mono(22, 700), C.mut, 'left'); }); txt('DIPSTICK', 0, 160, F.mono(22, 700), C.mut); X.restore(); },

  dash(p, k, T) { rr(-450, -220, 900, 440, 60); X.fillStyle = '#1d1b1a'; X.fill(); X.lineWidth = 5; X.strokeStyle = C.ink; X.stroke();
    const L = [['oil', '#e8442a'], ['temp', '#e8442a'], ['battery', '#e8442a'], ['brake', '#e8442a'], ['engine', '#f2a62a'], ['tpms', '#f2a62a'], ['abs', '#f2a62a'], ['beam', '#4a8af2']], hi = p.hi || [];
    L.forEach(([kind, col], i) => { const x = -330 + (i % 4) * 220, y = -80 + Math.floor(i / 4) * 170, on = hi.includes(kind) || hi.includes('all'), blink = p.flash === kind ? (T * 3) % 1 < .5 : true; lightIcon(kind, x, y, col, on && blink); }); },

  hybrid(p, k, T) { const m = p.mode || 'ev', box2 = (x, y, w, h, c, l, tc = '#fff') => { rr(x - w / 2, y - h / 2, w, h, 14); X.fillStyle = c; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); txt(l, x, y, F.mono(24, 700), tc); };
    const E = [-300, -120], Mo = [60, -120], Ba = [60, 140], W = [360, 0], Pl = [-300, 160];
    const paths = { ev: [[Ba, Mo, W]], engine: [[E, Mo, W], [Mo, Ba]], regen: [[W, Mo, Ba]], plug: [[Pl, Ba]] }[m];
    paths.forEach(pt => { line(pt, 10, C.ink); flowDots(pt, T, m === 'regen' ? '#3cc85a' : m === 'engine' ? C.or : '#f2b632', 8, .6); });
    box2(...E, 200, 120, m === 'engine' ? '#9a958c' : '#c8c4bc', 'ENGINE'); box2(...Mo, 180, 120, STEELD, 'MOTOR'); box2(...Ba, 220, 100, '#4a5a6a', 'BATTERY'); wheel(W[0], W[1], 90, T * (m === 'regen' ? 2 : 4));
    if (m === 'plug' || p.showPlug) { box2(...Pl, 160, 90, '#3cc85a', 'PLUG IN'); }
    pill({ ev: 'ELECTRIC ONLY', engine: 'ENGINE DRIVES + CHARGES', regen: 'BRAKING RECHARGES', plug: 'PLUG-IN: CHARGE FROM THE WALL' }[m], 0, 260, F.mono(26, 700), C.ink, '#fff'); },

  timing(p, k, T) { const snap = !!p.snap, a = snap ? 0 : T * 3, cr = [0, 180], cm = [0, -170];
    X.beginPath(); X.moveTo(cr[0] - 70, cr[1]); X.lineTo(cm[0] - 120, cm[1]); X.arc(cm[0], cm[1], 120, Math.PI, 0); X.lineTo(cr[0] + 70, cr[1]); X.arc(cr[0], cr[1], 70, 0, Math.PI); X.lineWidth = 16; X.strokeStyle = snap ? '#8a847a' : C.ink; if (snap) X.setLineDash([60, 40]); X.stroke(); X.setLineDash([]);
    gearShape(cr[0], cr[1], 60, 10, a, STEEL); gearShape(cm[0], cm[1], 108, 18, a / 2, '#f2b632'); txt('CRANKSHAFT', 0, 290, F.mono(22, 700), C.mut); txt('CAMSHAFT: HALF SPEED', 0, -320, F.mono(22, 700), C.mut);
    X.save(); X.translate(300, -60); const lift = snap ? 1 : Math.max(0, Math.sin(a / 2 * 2)) ; X.save(); X.rotate(a / 2); X.beginPath(); X.ellipse(0, 0, 40, 60, 0, 0, 7); X.fillStyle = '#f2b632'; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); X.restore();
    line([[0, 60], [0, 150 + lift * 30]], 10, C.ink); rr(-40, 150 + lift * 30, 80, 14, 4); X.fillStyle = STEEL; X.fill(); txt('VALVE', 80, 120, F.mono(20, 700), C.mut, 'left');
    if (snap) { rr(-60, 200, 120, 60, 8); X.fillStyle = STEEL; X.fill(); X.lineWidth = 4; X.strokeStyle = C.ink; X.stroke(); X.save(); X.globalAlpha = (T * 4) % 1 < .5 ? 1 : .3; txt('CRUNCH!', 0, 300, F.sg(46, 700), C.or); X.restore(); } X.restore();
    if (snap) pill('BELT SNAPPED', -260, 0, F.mono(28, 700), C.or, '#fff'); },
});
function hr(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
