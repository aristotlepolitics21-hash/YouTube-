// Tech Shorts engine: draws every scene on a 1080x1920 canvas.
// DOC.frame(line, T) is called once per frame by the page; scenes get (p, t, s, d):
// p = params from script.json, t = 0..1 progress through the line, s = seconds in, d = line duration.
const DOC = (() => {
  const cv = document.getElementById('cv'), c = cv.getContext('2d');
  const W = 1080, H = 1920, CX = W / 2;
  const C = { bg: '#0a0f1e', bg2: '#121a33', grid: 'rgba(120,150,255,0.07)', ink: '#eef3ff', dim: '#8a97bd', faint: '#3a4670',
    cyan: '#35e0ff', pink: '#ff4fa3', lime: '#b6ff5c', amber: '#ffc44d', red: '#ff5a5a', violet: '#9b7bff' };
  const SANS = 'Inter, "Inter Display", "DejaVu Sans", sans-serif', MONO = '"DejaVu Sans Mono", monospace';

  // ---------- helpers ----------
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const out = k => (k = clamp(k), 1 - Math.pow(1 - k, 3));
  const back = k => { k = clamp(k); const s = 1.7; return 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2); };
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const font = (sz, w = 800, f = SANS) => `${w} ${sz}px ${f}`;
  function rr(x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function text(s, x, y, sz, col = C.ink, w = 800, al = 'center', f = SANS, glow = 0) {
    c.font = font(sz, w, f); c.textAlign = al; c.textBaseline = 'middle'; c.fillStyle = col;
    if (glow) { c.shadowColor = col; c.shadowBlur = glow; } c.fillText(s, x, y); c.shadowBlur = 0;
  }
  function glowStroke(col, lw, blur = 18) { c.strokeStyle = col; c.lineWidth = lw; c.shadowColor = col; c.shadowBlur = blur; }
  function alpha(a, fn) { c.save(); c.globalAlpha *= clamp(a); fn(); c.restore(); }
  function pop(k, x, y, fn) { const s = back(k); if (k <= 0) return; c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= clamp(k * 3); fn(); c.restore(); }
  function arrow(x1, y1, x2, y2, k, col, lw = 8, head = true) {
    if (k <= 0) return; const x = lerp(x1, x2, k), y = lerp(y1, y2, k);
    c.save(); glowStroke(col, lw, 14); c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x, y); c.stroke();
    if (head && k > .15) { const a = Math.atan2(y2 - y1, x2 - x1); c.fillStyle = col; c.beginPath();
      c.moveTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14); c.lineTo(x + Math.cos(a + 2.5) * 26, y + Math.sin(a + 2.5) * 26);
      c.lineTo(x + Math.cos(a - 2.5) * 26, y + Math.sin(a - 2.5) * 26); c.fill(); }
    c.restore();
  }
  function card(x, y, w, h, col = C.cyan, fill = C.bg2) {
    c.save(); rr(x - w / 2, y - h / 2, w, h, 28); c.fillStyle = fill; c.fill(); glowStroke(col, 4, 22); c.stroke(); c.restore();
  }

  // ---------- icons ----------
  function laptop(x, y, s = 1, col = C.cyan) {
    c.save(); c.translate(x, y); c.scale(s, s);
    rr(-110, -80, 220, 140, 14); c.fillStyle = C.bg2; c.fill(); glowStroke(col, 6); c.stroke();
    rr(-90, -62, 180, 104, 6); c.fillStyle = 'rgba(53,224,255,0.12)'; c.fill();
    c.beginPath(); c.moveTo(-140, 70); c.lineTo(140, 70); c.lineTo(122, 88); c.lineTo(-122, 88); c.closePath(); c.fillStyle = col; c.fill();
    c.restore();
  }
  function server(x, y, s = 1, col = C.pink, T = 0) {
    c.save(); c.translate(x, y); c.scale(s, s);
    for (let i = 0; i < 3; i++) {
      const yy = -105 + i * 72; rr(-95, yy, 190, 62, 12); c.fillStyle = C.bg2; c.fill(); glowStroke(col, 5); c.stroke();
      for (let j = 0; j < 3; j++) { const on = Math.sin(T * 7 + i * 2 + j * 1.3) > -0.2; c.fillStyle = on ? (j ? C.lime : col) : C.faint;
        c.beginPath(); c.arc(-60 + j * 26, yy + 31, 7, 0, 7); c.fill(); }
      c.fillStyle = C.faint; rr(20, yy + 24, 56, 14, 7); c.fill();
    }
    c.restore();
  }
  function phone(x, y, s = 1, col = C.cyan) {
    c.save(); c.translate(x, y); c.scale(s, s); rr(-150, -290, 300, 580, 44); c.fillStyle = '#050813'; c.fill(); glowStroke(col, 6); c.stroke();
    rr(-40, -272, 80, 16, 8); c.fillStyle = C.faint; c.fill(); c.restore();
  }
  function lock(x, y, s = 1, col = C.lime, open = 0) {
    c.save(); c.translate(x, y); c.scale(s, s);
    glowStroke(col, 16); c.beginPath(); c.arc(0, -40 - open * 40, 58, Math.PI, 0); c.lineTo(58, 10 - open * 40); c.moveTo(-58, -40 - open * 40); c.lineTo(-58, 10); c.stroke();
    rr(-95, -20, 190, 150, 24); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 30; c.fill(); c.shadowBlur = 0;
    c.fillStyle = C.bg; c.beginPath(); c.arc(0, 40, 18, 0, 7); c.fill(); c.fillRect(-7, 40, 14, 45);
    c.restore();
  }
  function key(x, y, s = 1, col = C.amber, rot = 0) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); glowStroke(col, 12);
    c.beginPath(); c.arc(-60, 0, 34, 0, 7); c.stroke(); c.beginPath(); c.moveTo(-26, 0); c.lineTo(80, 0); c.lineTo(80, 28); c.moveTo(50, 0); c.lineTo(50, 22); c.stroke();
    c.restore();
  }
  function node(x, y, r, col, label, sub, k = 1) {
    pop(k, x, y, () => {
      c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = C.bg2; c.fill(); glowStroke(col, 6, 24); c.stroke();
      if (label) text(label, 0, sub ? -12 : 0, r * 0.42, col, 800);
      if (sub) text(sub, 0, r * 0.38, r * 0.22, C.dim, 600);
    });
  }
  function packetBox(x, y, n, col, s = 1, lbl = true) {
    c.save(); c.translate(x, y); c.scale(s, s); rr(-46, -34, 92, 68, 14); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 20; c.fill(); c.shadowBlur = 0;
    if (lbl) text(String(n), 0, 2, 38, C.bg, 900); c.restore();
  }
  function browser(x, y, w, h, url, k = 1, cursor = false, T = 0, padlock = 0) {
    c.save(); rr(x - w / 2, y - h / 2, w, h, 30); c.fillStyle = C.bg2; c.fill(); glowStroke(C.cyan, 4, 18); c.stroke();
    [C.red, C.amber, C.lime].forEach((cl, i) => { c.fillStyle = cl; c.beginPath(); c.arc(x - w / 2 + 44 + i * 34, y - h / 2 + 44, 11, 0, 7); c.fill(); });
    const bx = x - w / 2 + 40, by = y - h / 2 + 84, bw = w - 80, bh = 76; rr(bx, by, bw, bh, 38); c.fillStyle = '#060a17'; c.fill();
    c.strokeStyle = C.faint; c.lineWidth = 3; c.stroke();
    let tx = bx + 36; if (padlock > 0) { alpha(padlock, () => lock(bx + 46, by + bh / 2 - 6, 0.22)); tx += 50; }
    c.font = font(40, 600, MONO); c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = C.ink; c.fillText(url, tx, by + bh / 2 + 2);
    if (cursor && Math.floor(T * 2.2) % 2 === 0) { const mw = c.measureText(url).width; c.fillStyle = C.cyan; c.fillRect(tx + mw + 4, by + 18, 4, 42); }
    c.restore();
    return { top: by + bh + 30, left: x - w / 2 + 40, w: w - 80, bottom: y + h / 2 - 40 };
  }
  function pageBlocks(a, k, colorize = 1) {
    // a fake web page: hero, heading lines, cards
    const { top, left, w, bottom } = a, h = bottom - top; const items = [
      [0, 0, 1, .34, C.violet], [0, .4, .7, .06, C.ink], [0, .5, .5, .04, C.dim], [0, .6, .31, .3, C.cyan], [.345, .6, .31, .3, C.pink], [.69, .6, .31, .3, C.lime]];
    items.forEach(([ix, iy, iw, ih, col], i) => {
      const kk = seg(k, i / items.length * .8, i / items.length * .8 + .3); if (kk <= 0) return;
      alpha(kk, () => { rr(left + ix * w, top + iy * h + (1 - out(kk)) * 30, iw * w, ih * h, 14); c.fillStyle = colorize ? col : C.faint; c.globalAlpha *= colorize ? .85 : 1; c.fill(); });
    });
  }

  // ---------- background, chrome, captions ----------
  function bg(T) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d1430'); g.addColorStop(1, '#070b17'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = C.grid; c.lineWidth = 2; const off = (T * 20) % 90;
    for (let x = -90 + off; x < W + 90; x += 90) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let y = -90 + off; y < H + 90; y += 90) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    const r = c.createRadialGradient(CX, 800, 50, CX, 800, 900); r.addColorStop(0, 'rgba(80,120,255,0.16)'); r.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = r; c.fillRect(0, 0, W, H);
  }
  function chrome(L, T, total) {
    rr(60, 70, W - 120, 10, 5); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fill();
    rr(60, 70, (W - 120) * clamp(T / total), 10, 5); c.fillStyle = C.cyan; c.fill();
    if (L.step) {
      const k = out(seg(L.secT, 0, .5));
      alpha(k, () => { rr(CX - 150, 120, 300, 72, 36); c.fillStyle = 'rgba(53,224,255,0.12)'; c.fill(); c.strokeStyle = C.cyan; c.lineWidth = 3; c.stroke();
        text(`STEP ${L.step} / 5`, CX, 158, 34, C.cyan, 800); });
      text(L.secName.toUpperCase(), CX, 250, 50, C.ink, 900);
    }
  }
  // captions: split into chunks of ~3 words, timed by character share across the spoken span
  function captions(L, T) {
    if (!L.cap || T < L.cap[0] || T > L.cap[1] + .15) return;
    const words = L.text.split(/\s+/), chunks = []; let cur = [];
    words.forEach(w => { cur.push(w); if (cur.length >= 3 || /[.,?!]$/.test(w)) { chunks.push(cur.join(' ')); cur = []; } }); if (cur.length) chunks.push(cur.join(' '));
    const tot = chunks.reduce((a, ch) => a + ch.length + 4, 0); let acc = 0, k = (T - L.cap[0]) / (L.cap[1] - L.cap[0]) * tot, idx = chunks.length - 1;
    for (let i = 0; i < chunks.length; i++) { acc += chunks[i].length + 4; if (k < acc) { idx = i; break; } }
    const s = chunks[idx].toUpperCase(); c.font = font(70, 900); const mw = Math.min(W - 100, c.measureText(s).width + 70);
    const y = 1530; rr(CX - mw / 2, y - 62, mw, 124, 26); c.fillStyle = 'rgba(5,8,19,0.82)'; c.fill();
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.font = font(70, 900);
    const fit = Math.min(1, (W - 140) / c.measureText(s).width); c.translate(CX, y + 4); c.scale(fit, fit);
    c.fillStyle = idx % 2 ? C.amber : '#ffffff'; c.fillText(s, 0, 0); c.restore();
  }

  // ---------- scenes ----------
  const S = {};
  S.type = (p, t, s) => {
    const n = Math.floor(clamp(seg(t, .05, .55)) * p.url.length);
    browser(CX, 800, 940, 620, p.url.slice(0, n), 1, true, s);
    const k = seg(t, .62, .75), press = k > 0 && k < 1;
    pop(seg(t, .5, .62), CX, 1220, () => {
      c.save(); c.translate(0, press ? 12 : 0); rr(-170, -70, 340, 140, 26); c.fillStyle = press ? C.cyan : C.bg2; c.fill(); glowStroke(C.cyan, 6, 26); c.stroke();
      text('ENTER ⏎', 0, 4, 50, press ? C.bg : C.cyan, 900); c.restore(); });
    if (t > .7) { const r = seg(t, .7, 1); alpha(1 - r, () => { glowStroke(C.cyan, 6); c.beginPath(); c.arc(CX, 1220, 160 + r * 300, 0, 7); c.stroke(); }); }
  };
  S.timer = (p, t, s) => {
    const a = browser(CX, 760, 940, 760, 'example.com', 1, false, s, 0);
    pageBlocks(a, seg(t, .15, .85));
    const v = lerp(0, 0.6, ease(seg(t, .05, .85)));
    pop(seg(t, 0, .2), CX, 1260, () => { card(0, 0, 420, 130, C.amber); text(v.toFixed(3) + ' s', 0, 4, 76, C.amber, 800, 'center', MONO, 16); });
  };
  S.title = (p, t, s) => {
    for (let i = 0; i < 3; i++) { const r = 260 + i * 90, a = s * (0.6 + i * .3) + 2;
      alpha(.5, () => { c.strokeStyle = [C.cyan, C.pink, C.violet][i]; c.lineWidth = 3; c.setLineDash([8, 18]); c.beginPath(); c.arc(CX, 820, r, 0, 7); c.stroke(); c.setLineDash([]); });
      c.fillStyle = [C.cyan, C.pink, C.lime][i]; c.shadowColor = c.fillStyle; c.shadowBlur = 20; c.beginPath(); c.arc(CX + Math.cos(a) * r, 820 + Math.sin(a) * r, 16, 0, 7); c.fill(); c.shadowBlur = 0; }
    pop(seg(t, 0, .25), CX, 760, () => text(p.top, 0, 0, 120, C.ink, 900, 'center', SANS, 20));
    pop(seg(t, .1, .35), CX, 890, () => text(p.bottom, 0, 0, 84, C.cyan, 900, 'center', SANS, 30));
  };
  S.names = (p, t) => {
    pop(seg(t, 0, .15), CX, 560, () => { card(0, 0, 640, 150, C.cyan); text('example.com', 0, 4, 66, C.ink, 700, 'center', MONO); });
    arrow(CX, 660, CX, 830, seg(t, .15, .3), C.dim, 6);
    pop(seg(t, .25, .4), CX, 960, () => { c.save(); c.rotate(Math.PI / 4); rr(-110, -110, 220, 220, 24); c.fillStyle = C.bg2; c.fill(); glowStroke(C.violet, 6); c.stroke(); c.restore();
      text('CPU', 0, 0, 60, C.violet, 900); });
    if (t > .35 && t < .6) text('???', CX + 200, 830, 80, C.red, 900);
    arrow(CX, 1110, CX, 1180, seg(t, .55, .7), C.dim, 6);
    pop(seg(t, .65, .85), CX, 1340, () => { card(0, 0, 640, 140, C.lime); text('203.0.113.7', 0, 4, 66, C.lime, 700, 'center', MONO, 12); text('IP ADDRESS', 0, -105, 30, C.dim, 700); });
  };
  S.cache = (p, t) => {
    const rows = [['news-site.com', '198.51.100.4'], ['mail.app', '192.0.2.88'], ['video.tv', '198.51.100.21'], ['example.com', '?']];
    pop(seg(t, 0, .15), CX, 470, () => text('BROWSER MEMORY', 0, 0, 50, C.dim, 800));
    const scan = seg(t, .25, .85) * rows.length;
    rows.forEach(([n, ip], i) => {
      const y = 620 + i * 170, k = seg(t, .05 + i * .05, .2 + i * .05), hit = Math.floor(scan) === i && scan < rows.length, last = i === rows.length - 1;
      pop(k, CX, y, () => { rr(-440, -66, 880, 132, 22); c.fillStyle = hit ? 'rgba(53,224,255,0.16)' : C.bg2; c.fill(); c.strokeStyle = hit ? C.cyan : C.faint; c.lineWidth = 4; c.stroke();
        text(n, -400, 0, 44, C.ink, 700, 'left', MONO); text(ip, 400, 0, 44, last ? C.red : C.lime, 700, 'right', MONO); });
    });
    pop(seg(t, .85, 1), CX, 1340, () => { card(0, 0, 520, 120, C.red); text('NOT FOUND', 0, 4, 58, C.red, 900, 'center', SANS, 14); });
  };
  S.dns = (p, t, s) => {
    const you = [CX, 470], res = [CX, 800], nodes = [[230, 1210, 'ROOT', '.', C.amber], [CX, 1300, '.COM', 'TLD', C.violet], [850, 1210, 'NS', 'example.com', C.pink]];
    pop(seg(t, 0, .1), you[0], you[1], () => laptop(0, 0, .9));
    node(res[0], res[1], 120, C.cyan, 'DNS', 'resolver', seg(t, .05, .15));
    arrow(you[0], 560, res[0], 670, seg(t, .1, .2), C.cyan, 6);
    nodes.forEach(([x, y, l, sub, col], i) => {
      const a0 = .25 + i * .2; node(x, y, 105, col, l, sub, seg(t, a0 - .05, a0 + .03));
      const dx = x - res[0], dy = y - res[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      arrow(res[0] + ux * 135, res[1] + uy * 135, x - ux * 120, y - uy * 120, seg(t, a0, a0 + .08), col, 6);
      arrow(x - ux * 120 + uy * 30, y - uy * 120 - ux * 30, res[0] + ux * 135 + uy * 30, res[1] + uy * 135 - ux * 30, seg(t, a0 + .1, a0 + .18), C.dim, 4);
    });
    if (t > .9) arrow(res[0] + 40, 670, you[0] + 40, 560, seg(t, .9, 1), C.lime, 8);
  };
  S.ip = (p, t, s) => {
    const n = Math.floor(seg(t, .1, .6) * p.ip.length);
    pop(seg(t, 0, .1), CX, 640, () => text('IP ADDRESS', 0, 0, 50, C.dim, 800));
    text(p.ip.slice(0, n) + (t < .65 && Math.floor(s * 3) % 2 ? '_' : ''), CX, 820, 120, C.lime, 700, 'center', MONO, 40);
    pop(seg(t, .6, .8), CX, 1060, () => { laptop(-240, 0, .7); server(240, 10, .7, C.pink, s); arrow(-120, 0, 120, 0, 1, C.lime, 6); });
  };
  S.packets = (p, t, s) => {
    const sp = ease(seg(t, .15, .45)), N = 6;
    pop(seg(t, 0, .1), CX, 520, () => { card(0, 0, 820, 130, C.cyan); text('GET /  example.com', 0, 4, 54, C.ink, 700, 'center', MONO); });
    for (let i = 0; i < N; i++) {
      const col = [C.cyan, C.pink, C.lime, C.amber, C.violet, C.cyan][i];
      const x0 = CX - 340 + i * 136, y0 = 520, x1 = 130 + (i % 2) * 450, y1 = 760 + Math.floor(i / 2) * 210;
      if (sp > 0) {
        const x = lerp(x0, x1, sp), y = lerp(y0, y1, sp); packetBox(x - (sp > .9 ? 60 : 0) * seg(t, .45, .55), y, i + 1, col, lerp(.9, 1.1, sp));
        const lk = seg(t, .5 + i * .05, .6 + i * .05);
        if (lk > 0) alpha(lk, () => { rr(x + 10, y - 40, 300, 80, 14); c.fillStyle = C.bg2; c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
          text('FROM 192.168.1.20', x + 26, y - 14, 22, C.dim, 700, 'left', MONO); text('TO   203.0.113.7', x + 26, y + 16, 22, C.ink, 700, 'left', MONO); });
      }
    }
  };
  const NET = [[140, 820], [360, 620], [380, 1020], [600, 780], [560, 1240], [800, 600], [820, 1060], [960, 840]];
  const EDGES = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [1, 5], [3, 5], [3, 6], [4, 6], [5, 7], [6, 7]];
  const PATHS = [[0, 1, 5, 7], [0, 2, 4, 6, 7], [0, 1, 3, 6, 7], [0, 2, 3, 5, 7]];
  function onPath(path, k) { const n = path.length - 1, f = clamp(k) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i, a = NET[path[i]], b = NET[path[i + 1]]; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)]; }
  S.routes = (p, t, s) => {
    c.strokeStyle = C.faint; c.lineWidth = 5; EDGES.forEach(([a, b]) => { c.beginPath(); c.moveTo(...NET[a]); c.lineTo(...NET[b]); c.stroke(); });
    NET.forEach(([x, y], i) => { if (i === 0 || i === 7) return; c.beginPath(); c.arc(x, y, 34, 0, 7); c.fillStyle = C.bg2; c.fill(); glowStroke(C.violet, 4); c.stroke();
      c.fillStyle = C.violet; c.fillRect(x - 14, y - 3, 28, 6); c.fillRect(x - 3, y - 14, 6, 28); });
    laptop(NET[0][0], NET[0][1], .55); server(NET[7][0], NET[7][1], .5, C.pink, s);
    const cols = [C.cyan, C.pink, C.lime, C.amber];
    const arrive = [.62, .82, .55, .74]; // packets finish out of order
    PATHS.forEach((path, i) => { const k = seg(t, .08 + i * .05, arrive[i]); if (k <= 0 || k >= 1) return; const [x, y] = onPath(path, k); packetBox(x, y, i + 1, cols[i], .55); });
    // arrived packets stack in order
    pop(seg(t, .55, .65), CX, 1400, () => text('REASSEMBLED IN ORDER', 0, -90, 34, C.dim, 800));
    [0, 1, 2, 3].forEach(i => { if (t < arrive[i]) return; const sorted = t > .88, order = [2, 0, 3, 1].indexOf(i); packetBox(CX - 225 + (sorted ? i : order) * 150, 1400, i + 1, cols[i], .9); });
  };
  S.cable = (p, t, s) => {
    const g = c.createLinearGradient(0, 480, 0, 1360); g.addColorStop(0, '#0b3a5c'); g.addColorStop(1, '#031220'); c.fillStyle = g; c.fillRect(0, 480, W, 880);
    c.strokeStyle = 'rgba(120,200,255,0.5)'; c.lineWidth = 5; c.beginPath(); for (let x = 0; x <= W; x += 10) c.lineTo(x, 480 + Math.sin(x / 60 + s * 2) * 10); c.stroke();
    c.fillStyle = '#1c1a14'; c.beginPath(); c.moveTo(0, 1360); for (let x = 0; x <= W; x += 40) c.lineTo(x, 1250 + Math.sin(x / 140) * 30); c.lineTo(W, 1360); c.fill();
    const cy = x => 1215 + Math.sin(x / 140) * 30;
    c.strokeStyle = '#222b44'; c.lineWidth = 22; c.beginPath(); for (let x = 0; x <= W; x += 10) c.lineTo(x, cy(x)); c.stroke();
    for (let i = 0; i < 7; i++) { const x = ((s * 520 + i * 170) % (W + 200)) - 100; const gr = c.createRadialGradient(x, cy(x), 0, x, cy(x), 60);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(53,224,255,0.9)'); gr.addColorStop(1, 'rgba(53,224,255,0)'); c.fillStyle = gr; c.fillRect(x - 60, cy(x) - 60, 120, 120); }
    pop(seg(t, .15, .3), CX, 760, () => { card(0, 0, 820, 220, C.cyan, 'rgba(10,15,30,0.85)');
      const v = Math.round(lerp(0, 200000, ease(seg(t, .2, .7)))); text(v.toLocaleString('en-US') + ' km/s', 0, -20, 84, C.cyan, 800, 'center', MONO, 20);
      text('about 2/3 the speed of light', 0, 64, 38, C.dim, 600); });
    alpha(seg(t, .4, .55), () => text('FIBRE-OPTIC CABLE  ↓', CX, 1110, 34, C.ink, 800));
  };
  S.shake = (p, t, s) => {
    laptop(260, 620, .9); server(820, 640, .85, C.pink, s);
    const steps = [['SYN', '"Hello?"', C.cyan, 1], ['SYN-ACK', '"Hello, I hear you."', C.pink, -1], ['ACK', '"Great, let\'s talk."', C.lime, 1]];
    steps.forEach(([tag, say, col, dir], i) => {
      const y = 920 + i * 190, a = .1 + i * .28, k = ease(seg(t, a, a + .14));
      const x1 = dir > 0 ? 220 : 860, x2 = dir > 0 ? 860 : 220; arrow(x1, y, x2, y, k, col, 8);
      if (k > 0) alpha(seg(t, a + .05, a + .15), () => { text(tag, CX, y - 50, 40, col, 900, 'center', MONO); text(say, CX, y + 52, 36, C.ink, 600); });
    });
  };
  S.lock = (p, t, s) => {
    const m = ease(seg(t, .05, .35));
    key(lerp(180, CX - 70, m), 560, 1, C.amber, 0); key(lerp(900, CX + 70, m), 560, 1, C.amber, Math.PI);
    pop(seg(t, .3, .45), CX, 560, () => lock(0, 0, .9, C.lime));
    // data stream: plaintext → ciphertext
    const plain = 'password=hunter2  card=4111…', chars = '#$%&@!?*<>{}[]=+~^0123456789abcdef';
    const y = 1010; laptop(170, y, .55); server(910, y + 10, .45, C.pink, s);
    c.strokeStyle = C.faint; c.lineWidth = 4; c.setLineDash([12, 12]); c.beginPath(); c.moveTo(270, y); c.lineTo(810, y); c.stroke(); c.setLineDash([]);
    const enc = seg(t, .45, .6); let str = '';
    for (let i = 0; i < 16; i++) str += enc > i / 16 ? chars[(i * 7 + Math.floor(s * 12)) % chars.length] : plain[i];
    alpha(seg(t, .1, .2), () => { rr(300, y - 140, 480, 80, 16); c.fillStyle = C.bg2; c.fill(); text(str, CX, y - 100, 38, enc > .5 ? C.lime : C.red, 700, 'center', MONO); });
    alpha(1 - seg(t, .8, .86), () => pop(seg(t, .6, .75), CX, 1250, () => { c.save(); c.translate(-200, 0); c.fillStyle = C.ink; c.beginPath(); c.ellipse(0, 0, 70, 40, 0, 0, 7); c.fill(); c.fillStyle = C.bg; c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fill(); c.restore();
      text('sees only noise', 70, 0, 44, C.dim, 700); }));
    alpha(seg(t, .84, .92), () => browser(CX, 1290, 900, 190, 'example.com', 1, false, s, 1));
  };
  S.server = (p, t, s) => {
    server(CX, 860, 1.6, C.pink, s);
    const k1 = ease(seg(t, .05, .35)); alpha(seg(t, .05, .12) * (1 - seg(t, .38, .45)), () => { card(lerp(-200, 260, k1), 520, 420, 110, C.cyan); text('GET /', lerp(-200, 260, k1), 524, 52, C.cyan, 700, 'center', MONO); });
    const k2 = ease(seg(t, .5, .85)); pop(seg(t, .48, .58), lerp(CX, 820, k2), lerp(1180, 1300, k2), () => { card(0, 0, 400, 130, C.lime); text('200 OK', 0, 4, 66, C.lime, 900, 'center', MONO, 18); });
  };
  S.html = (p, t, s) => {
    const code = [['<!doctype html>', C.dim], ['<html>', C.pink], ['  <head>', C.pink], ['    <title>Example</title>', C.ink], ['    <link href="style.css">', C.cyan], ['  </head>', C.pink], ['  <body>', C.pink], ['    <h1>Hello!</h1>', C.ink], ['    <img src="photo.jpg">', C.amber], ['    <script src="app.js">', C.lime], ['  </body>', C.pink], ['</html>', C.pink]];
    card(CX, 920, 940, 900, C.violet, '#070b18'); text('index.html', CX, 525, 36, C.violet, 800, 'center', MONO);
    const n = seg(t, .05, .85) * code.length;
    code.forEach(([l, col], i) => { const k = clamp(n - i); if (k <= 0) return; const sub = l.slice(0, Math.ceil(l.length * k)); text(sub, 150, 610 + i * 62, 36, col, 600, 'left', MONO); });
  };
  S.fanout = (p, t, s) => {
    const files = [['CSS', C.cyan], ['JS', C.lime], ['IMG', C.amber], ['FONT', C.violet], ['CSS', C.cyan], ['IMG', C.amber], ['JS', C.lime], ['IMG', C.amber], ['JSON', C.pink], ['IMG', C.amber], ['JS', C.lime], ['SVG', C.pink]];
    const cx = CX, cy = 900; laptop(cx, cy, .8);
    files.forEach(([lb, col], i) => {
      const a = -Math.PI / 2 + i / files.length * Math.PI * 2, R = 420, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * .95, st = .1 + i * .045;
      arrow(cx + Math.cos(a) * 140, cy + Math.sin(a) * 120, x - Math.cos(a) * 70, y - Math.sin(a) * 60, ease(seg(t, st, st + .12)), col, 5);
      pop(seg(t, st + .08, st + .18), x, y, () => { rr(-62, -46, 124, 92, 16); c.fillStyle = C.bg2; c.fill(); glowStroke(col, 4); c.stroke(); text(lb, 0, 2, 30, col, 800, 'center', MONO); });
    });
    const n = Math.round(lerp(1, 48, ease(seg(t, .1, .85))));
    pop(seg(t, .1, .2), CX, 1420 - 30, () => text(`${n} requests`, 0, 0, 58, C.ink, 800, 'center', MONO));
  };
  S.render = (p, t, s) => {
    const stg = [['DOM TREE', C.violet], ['STYLE', C.pink], ['LAYOUT', C.amber], ['PAINT', C.lime]];
    const ph = seg(t, .03, .95) * 4, cur = Math.min(3, Math.floor(ph));
    stg.forEach(([l, col], i) => { const x = 160 + i * 253, on = i <= cur; rr(x - 110, 400, 220, 80, 40); c.fillStyle = on ? col : C.bg2; c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke(); text(l, x, 442, 28, on ? C.bg : col, 800); });
    const box = { top: 560, left: 160, w: 760, bottom: 1340 };
    if (cur === 0) { // tree
      const k = seg(ph, 0, 1), pts = [[CX, 620, -1], [340, 820, 0], [CX, 820, 0], [740, 820, 0], [260, 1040, 1], [420, 1040, 1], [CX, 1040, 2], [660, 1040, 3], [820, 1040, 3]], lab = ['html', 'head', 'body', 'main', 'title', 'meta', 'h1', 'img', 'p'];
      pts.forEach(([x, y, par], i) => { const kk = seg(k, i / 12, i / 12 + .3); if (par >= 0) { const pp = i < 4 ? pts[0] : pts[[1, 1, 2, 3, 3][i - 4]]; arrow(pp[0], pp[1] + 40, x, y - 40, kk, C.faint, 4, false); }
        pop(kk, x, y, () => { rr(-80, -38, 160, 76, 18); c.fillStyle = C.bg2; c.fill(); glowStroke(C.violet, 3); c.stroke(); text(lab[i], 0, 2, 30, C.ink, 700, 'center', MONO); }); });
    } else if (cur === 1) { pageBlocks(box, 1, 0); const k = seg(ph, 1, 2); alpha(k, () => pageBlocks(box, k * 1.2, 1)); }
    else if (cur === 2) { pageBlocks(box, 1, 1); c.setLineDash([10, 8]); c.strokeStyle = C.amber; c.lineWidth = 3; const k = seg(ph, 2, 3);
      [[0, 0, 1, .34], [0, .4, .7, .06], [0, .6, .31, .3], [.345, .6, .31, .3], [.69, .6, .31, .3]].forEach(([x, y, w, h], i) => { if (k > i / 5) c.strokeRect(box.left + x * box.w - 8, box.top + y * 780 - 8, w * box.w + 16, h * 780 + 16); }); c.setLineDash([]); }
    else { const k = seg(ph, 3, 4), px = 40; for (let y = box.top; y < box.bottom; y += px) for (let x = box.left; x < box.left + box.w; x += px) { const h = ((x * 13 + y * 7) % 97) / 97; if (h < k) { c.fillStyle = 'rgba(182,255,92,0.10)'; c.fillRect(x, y, px - 3, px - 3); } } pageBlocks(box, 1, 1); }
  };
  S.done = (p, t, s) => {
    phone(CX, 900, 1.35);
    pageBlocks({ top: 580, left: CX - 170, w: 340, bottom: 1240 }, seg(t, 0, .4), 1);
    pop(seg(t, .3, .5), CX, 1080, () => { c.beginPath(); c.arc(0, 0, 90, 0, 7); c.fillStyle = C.lime; c.shadowColor = C.lime; c.shadowBlur = 40; c.fill(); c.shadowBlur = 0;
      c.strokeStyle = C.bg; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-40, 0); c.lineTo(-10, 30); c.lineTo(45, -30); c.stroke(); });
    pop(seg(t, .45, .65), CX, 1340, () => { card(0, 0, 420, 110, C.amber); text('< 1 s', 0, 4, 66, C.amber, 800, 'center', MONO, 14); });
  };
  S.recap = (p, t, s) => {
    const items = [['1', 'Find the address', 'DNS', C.cyan], ['2', 'Send the packets', 'routers', C.violet], ['3', 'Shake hands', 'TCP + TLS', C.lime], ['4', 'Get the files', 'HTTP', C.pink], ['5', 'Draw the page', 'render', C.amber]];
    items.forEach(([n, l, sub, col], i) => { const y = 470 + i * 190, k = seg(t, i * .17, i * .17 + .12), act = t > i * .17 && t < (i + 1) * .17 + .05;
      pop(k, CX, y, () => { rr(-450, -76, 900, 152, 28); c.fillStyle = act ? 'rgba(255,255,255,0.08)' : C.bg2; c.fill(); glowStroke(col, act ? 5 : 2, act ? 24 : 6); c.stroke();
        c.beginPath(); c.arc(-360, 0, 46, 0, 7); c.fillStyle = col; c.fill(); text(n, -360, 3, 50, C.bg, 900);
        text(l, -280, -4, 50, C.ink, 800, 'left'); text(sub, 420, 0, 32, col, 700, 'right', MONO); }); });
  };
  S.outro = (p, t, s) => {
    for (let i = 0; i < 3; i++) { const r = 160 + i * 80; alpha(.4, () => { c.strokeStyle = [C.cyan, C.pink, C.violet][i]; c.lineWidth = 3; c.beginPath(); c.arc(CX, 800, r + Math.sin(s * 2 + i) * 8, 0, 7); c.stroke(); }); }
    pop(seg(t, 0, .2), CX, 800, () => { laptop(0, 0, 1.1); });
    pop(seg(t, .45, .6), CX, 1180, () => { rr(-280, -70, 560, 140, 70); c.fillStyle = C.pink; c.shadowColor = C.pink; c.shadowBlur = 30; c.fill(); c.shadowBlur = 0; text('FOLLOW  +', 0, 4, 62, '#fff', 900); });
    pop(seg(t, .5, .7), CX, 1310, () => text('more tech, explained', 0, 0, 44, C.dim, 700));
  };

  // fade/flash between scene cuts
  function dip(a) { if (a <= 0) return; c.fillStyle = `rgba(7,11,23,${a})`; c.fillRect(0, 0, W, H); }

  function frame(L, T, total, cutA) {
    c.save(); bg(T);
    const d = L.end - L.start, s = T - L.start, t = clamp(s / d);
    c.save(); (S[L.scene] || (() => text(L.scene, CX, 900, 60)))(L.p || {}, t, s, d); c.restore();
    dip(cutA); chrome(L, T, total); captions(L, T); c.restore();
  }
  return { frame, W, H };
})();
