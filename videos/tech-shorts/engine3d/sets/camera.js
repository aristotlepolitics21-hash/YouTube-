// Sets for Tech Shorts episode 9: How Your Phone Camera Takes a Photo (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, night = { top: '#141c3d', bottom: '#3b2f6b', floor: 0x3a2f68, hemi: .9 }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };

  // ---------- a little landscape, drawn at any exposure / noise / blur ----------
  function scene2d(x, w, h, o = {}) {
    const ex = o.exposure ?? 1, g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7ec8ff'); g.addColorStop(.55, '#ffe0b8'); g.addColorStop(.56, '#6fcf6a'); g.addColorStop(1, '#3f9e52');
    x.save(); if (o.blurBg) x.filter = `blur(${o.blurBg}px)`; x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#fff3a0'; x.beginPath(); x.arc(w * .75, h * .22, w * .1, 0, 7); x.fill();
    x.fillStyle = '#8f86b8'; x.beginPath(); x.moveTo(0, h * .56); x.lineTo(w * .3, h * .3); x.lineTo(w * .6, h * .56); x.fill(); x.fillStyle = '#2f7d44'; [[.15, .7], [.85, .66]].forEach(([a, b]) => { x.beginPath(); x.arc(w * a, h * b, w * .09, 0, 7); x.fill(); }); x.restore();
    if (o.subject) { x.fillStyle = '#ff6fb1'; x.beginPath(); x.arc(w * .5, h * .7, w * .14, 0, 7); x.fill(); x.fillStyle = '#141a2c'; [-1, 1].forEach(d => { x.beginPath(); x.ellipse(w * .5 + d * w * .045, h * .68, w * .015, w * .028, 0, 0, 7); x.fill(); }); }
    if (ex !== 1) { x.fillStyle = ex > 1 ? `rgba(255,255,255,${Math.min(.85, (ex - 1) * .7)})` : `rgba(10,12,30,${Math.min(.9, (1 - ex) * 1.1)})`; x.fillRect(0, 0, w, h); }
    if (o.noise) { const r = rng(o.seed ?? 1); for (let i = 0; i < 2400 * o.noise; i++) { x.fillStyle = `rgba(${200 + r() * 55},${200 + r() * 55},${200 + r() * 55},${.5 * r()})`; x.fillRect(r() * w, r() * h, 3, 3); } }
  }
  function photo(w, h, o = {}) { const t = ctex(Math.round(w * 160), Math.round(h * 160), (x, cw, ch) => scene2d(x, cw, ch, o)); const g = G(M(RB(w + .1, h + .1, .06, .03), plastic(0xffffff), {}), M(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t.tex, toneMapped: false }), { pos: [0, 0, .035], shadow: false })); g.redraw = o2 => t.redraw((x, cw, ch) => scene2d(x, cw, ch, o2)); return g; }
  function cameraPhone(col = 0x2a3046) {
    const g = new THREE.Group(); g.add(M(RB(1.6, 3.0, .2, .26), plastic(col)));
    g.add(M(RB(.8, .8, .1, .2), plastic(0x1d2236), { pos: [-.3, .95, -.14] }));
    [[-.47, 1.12], [-.13, .78], [-.47, .78]].forEach(([x, y], i) => { g.add(M(new THREE.CylinderGeometry(.13, .13, .06, 28), metal(0x9aa3bd), { pos: [x, y, -.2], rot: [Math.PI / 2, 0, 0] })); g.add(M(new THREE.CircleGeometry(.09, 28), new THREE.MeshPhysicalMaterial({ color: 0x0a1030, roughness: .02, clearcoat: 1 }), { pos: [x, y, -.235], rot: [0, Math.PI, 0], shadow: false })); });
    return g;
  }
  const lensDisc = (r, th) => M(new THREE.CylinderGeometry(r, r, th, 40), new THREE.MeshPhysicalMaterial({ color: 0xcfe9ff, transmission: .3, transparent: true, opacity: .55, roughness: .02, clearcoat: 1 }), { rot: [0, 0, Math.PI / 2], shadow: false });
  function sensorGrid(n = 9, cell = .26) {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(cell * .86, cell * .86, 1), plastic(0xffffff, { roughness: .3 }), n * n), m = new THREE.Matrix4(), c = new THREE.Color(); im.castShadow = true;
    im.paint = fn => { let i = 0; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, i++) { const r = fn(x, y, i) || {}, h = r.h ?? .1; m.makeScale(1, 1, h).setPosition((x - n / 2 + .5) * cell, (n / 2 - y - .5) * cell, h / 2); im.setMatrixAt(i, m); im.setColorAt(i, c.set(r.c ?? 0x3a4466)); } im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; };
    im.paint(() => ({})); return im;
  }
  const bayer = (x, y) => (y % 2 === 0) ? (x % 2 === 0 ? 'R' : 'G') : (x % 2 === 0 ? 'G' : 'B'), BC = { R: 0xff5a5a, G: 0x5ce06a, B: 0x4d7bff };
  const cam = (st, s, y = 2.6, z = 8.8) => aim(st.cam, [Math.sin(s * .5) * .8, y + .25, z], [0, y, 0]);

  // ---------- sets ----------
  BUILD.c_hook = () => {
    const st = stage(warm), ph = cameraPhone(); ph.position.set(0, 2.4, 0); st.scene.add(ph);
    const frames = [0, 1, 2, 3, 4].map(i => { const p = photo(1.3, 1.0, { exposure: [.4, .7, 1, 1.4, 1.8][i] }); st.scene.add(p); return p; });
    const flash = sprite(0xffffff, 3, 0); flash.position.set(-.3, 3.3, .3); st.scene.add(flash);
    return { ...st, update(t, s) { ph.rotation.y = Math.PI + Math.sin(s * 1.2) * .25; const fan = ease(seg(t, .1, .45)), merge = ease(seg(t, .55, .85));
      frames.forEach((p, i) => { const a = (i - 2) * .55 * fan * (1 - merge); p.position.set(Math.sin(a) * 1.6 * (1 - merge), 3.9 + Math.cos(a) * .3 - merge * .2, .5 + i * .02); p.rotation.z = -a * .6; p.visible = i === 2 || merge < .98; });
      flash.material.opacity = Math.max(0, 1 - frac(s * .8) * 6) * .8; cam(st, s, 2.9); } };
  };
  BUILD.c_title = (p) => {
    const st = stage({ top: '#ffd1e8', bottom: '#c9b8ff', floor: 0xbfaaf5 }); st.scene.add(pedestal(1.3, 0xffffff, C.cyan));
    const ph = cameraPhone(0xff6fb1); ph.scale.setScalar(.7); ph.position.set(0, 1.5, 0); st.scene.add(ph);
    const s1 = textSign(3.4, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 92 }), s2 = textSign(3.3, .72, p.bottom, { color: C.cyan, fg: '#0b3a55', size: 96 }); s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    const fl = sprite(0xffffff, 2.5, 0); fl.position.set(-.2, 2.2, -.4); st.scene.add(fl);
    return { ...st, update(t, s) { ph.rotation.y = Math.PI + Math.sin(s * 1.4) * .6; ph.position.y = 1.5 + Math.abs(Math.sin(s * 3)) * .1; fl.material.opacity = Math.max(0, 1 - frac(s * .7) * 5);
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.4], [0, 2.5, 0]); } };
  };
  BUILD.c_lens = () => {
    const st = stage(night), lenses = [.9, .75, .6, .8].map((r, i) => { const l = lensDisc(r, .14); l.position.set(-.6 + i * .32, 2.6, 0); st.scene.add(l); return l; });
    const sensor = M(RB(.08, .9, .9, .02), plastic(0x2f5bd8), { pos: [1.5, 2.6, 0] }); st.scene.add(sensor);
    const rays = []; for (let i = 0; i < 7; i++) { const y0 = 2.6 + (i - 3) * .28, cur = new THREE.CatmullRomCurve3([V(-2.4, y0, 0), V(-.6, y0, 0), V(.4, lerp(y0, 2.6, .5), 0), V(1.45, 2.6 + (i - 3) * .03, 0)], false, 'catmullrom', .2);
      const m = M(new THREE.TubeGeometry(cur, 60, .02, 6), glowM([0xfff2a0, 0xffd36e][i % 2], 2.6), { shadow: false }); st.scene.add(m); rays.push(m); }
    const lb = textSign(1.9, .42, 'SENSOR < FINGERNAIL', { color: 0x2f5bd8, fg: '#ffffff', size: 50 }); lb.position.set(.6, 4.2, .4); st.scene.add(lb);
    return { ...st, update(t, s) { const k = seg(t, .05, .5); rays.forEach(r => r.geometry.setDrawRange(0, Math.floor(k * r.geometry.index.count / 6) * 6)); lenses.forEach((l, i) => l.rotation.x = Math.sin(s * 2 + i) * .1);
      sensor.material.emissive = new THREE.Color(0x2f5bd8); sensor.material.emissiveIntensity = k > .95 ? .8 + Math.sin(s * 8) * .3 : 0; lb.scale.setScalar(popIn(t, .55)); aim(st.cam, [Math.sin(s * .4) * 1.5 + .5, 3.2, 8.0], [0, 2.6, 0]); } };
  };
  BUILD.c_sensor = () => {
    const st = stage(night), grid = sensorGrid(); grid.position.set(0, 2.6, 0); st.scene.add(grid);
    const cnt = sign(2.4, .5, () => {}, { color: 0xffffff }); cnt.position.set(0, 4.45, .4); st.scene.add(cnt);
    return { ...st, update(t, s) { const k = seg(t, .05, .5); grid.paint((x, y) => { const d = Math.hypot(x - 4, y - 4), on = d < k * 7; return { h: on ? .15 + Math.max(0, Math.sin(s * 4 - d)) * .2 : .02, c: on ? 0x6f86c8 : 0x2a3046 }; });
      cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, Math.round(lerp(0, 48, ease(seg(t, .2, .8)))) + ',000,000 photosites', w / 2, h / 2 + 4, h * .42, '#2f5bd8', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .2));
      grid.rotation.x = -.5 + Math.sin(s * .5) * .1; grid.rotation.y = Math.sin(s * .4) * .2; cam(st, s); } };
  };
  BUILD.c_photons = () => {
    const st = stage(night), grid = sensorGrid(5, .55); grid.position.set(0, 1.9, 0); grid.rotation.x = -Math.PI / 2 + .25; st.scene.add(grid);
    const r = rng(4), ph = []; for (let i = 0; i < 24; i++) { const p = G(M(SPH(.06, 10, 8), glowM(0xfff2a0, 5), { shadow: false }), sprite(0xffd36e, .5, .9)); st.scene.add(p); ph.push([p, r() * 5 | 0, r() * 5 | 0, r()]); }
    const lb = textSign(2.2, .44, 'BRIGHTER = MORE', { color: 0xfff2a0, fg: '#3a2400', size: 58 }); lb.position.set(0, 4.4, .4); st.scene.add(lb);
    const fill = [3, 9, 15, 6, 12, 1, 18, 8, 4, 14, 10, 2, 20, 7, 13, 5, 11, 16, 3, 9, 17, 6, 12, 19, 8];
    return { ...st, update(t, s) { const k = seg(t, .05, .85);
      grid.paint((x, y, i) => ({ h: .1 + fill[i] / 20 * k * 1.4, c: new THREE.Color(0x2a3046).lerp(new THREE.Color(0xffe07a), fill[i] / 20 * k).getHex() }));
      ph.forEach(([p, x, y, o]) => { const u = frac(s * .8 + o); p.position.set((x - 2) * .55, lerp(4.0, 1.9 + .3, u), (y - 2) * .5 + .2); p.scale.setScalar(1 - u * .5); });
      lb.scale.setScalar(popIn(t, .3)); aim(st.cam, [Math.sin(s * .5) * .8, 4.0, 7.5], [0, 2.2, 0]); } };
  };
  BUILD.c_numbers = () => {
    const st = stage(soft), board = sign(3.4, 3.4, () => {}, { color: 0xffffff, depth: .15 }); board.position.set(0, 2.6, 0); st.scene.add(board);
    const pic = photo(1.2, 1.2, {}); pic.position.set(1.3, 4.3, .5); st.scene.add(pic);
    const r = rng(8), vals = []; for (let i = 0; i < 64; i++) vals.push(r());
    return { ...st, update(t, s) { const k = seg(t, .05, .8);
      board.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); const n = 8, cw = w / n; for (let i = 0; i < n * n; i++) { if (i / (n * n) > k) break; const X = (i % n) * cw, Y = Math.floor(i / n) * cw, v = Math.floor((vals[i] * .6 + .2 + Math.sin(s + i) * .05) * 255);
        x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(X + 4, Y + 4, cw - 8, cw - 8); label(x, String(v), X + cw / 2, Y + cw / 2 + 3, cw * .32, v > 128 ? '#1d2442' : '#ffffff', 800, 'center', MONO); } });
      pic.scale.setScalar(popIn(t, .5)); pic.rotation.z = Math.sin(s * 2) * .08; board.rotation.y = Math.sin(s * .6) * .15; cam(st, s); } };
  };
  BUILD.c_bayer = () => {
    const st = stage(night), grid = sensorGrid(8, .34); grid.position.set(0, 2.5, 0); st.scene.add(grid);
    const tags = ['R', 'G', 'B'].map((l, i) => { const g = textSign(.5, .5, l, { color: [BC.R, BC.G, BC.B][i], fg: '#ffffff', size: 100 }); g.position.set(-.8 + i * .8, 4.35, .4); st.scene.add(g); return g; });
    return { ...st, update(t, s) { const k = seg(t, .25, .6); grid.paint((x, y) => { const on = (x + y) / 14 < k, b = bayer(x, y); return { h: on ? .25 + Math.max(0, Math.sin(s * 4 - x * .5 - y * .3)) * .15 : .08, c: on ? BC[b] : 0x8a93a8 }; });
      tags.forEach((g, i) => { g.scale.setScalar(popIn(t, .3 + i * .1)); g.rotation.z = Math.sin(s * 4 + i) * .1; }); grid.rotation.x = -.35 + Math.sin(s * .5) * .1; cam(st, s); } };
  };
  BUILD.c_green = () => {
    const st = stage(soft), grid = sensorGrid(8, .34); grid.position.set(0, 2.5, 0); st.scene.add(grid);
    const eye = G(M(SPH(.45, 32, 24), plastic(0xffffff), { scale: [1.3, .9, .6] }), M(SPH(.22, 24, 16), plastic(0x3cc85a), { pos: [0, 0, .25] }), M(SPH(.1, 16, 12), matte(0x141a2c), { pos: [0, 0, .38] })); eye.position.set(0, 4.35, .5); st.scene.add(eye);
    const x2 = textSign(1.0, .44, '2 × GREEN', { color: BC.G, fg: '#14320a', size: 56 }); x2.position.set(1.3, 4.35, .5); st.scene.add(x2);
    return { ...st, update(t, s) { grid.paint((x, y) => { const b = bayer(x, y), g = b === 'G'; return { h: g ? .3 + Math.max(0, Math.sin(s * 5 - x - y)) * .3 : .12, c: g ? BC.G : new THREE.Color(BC[b]).lerp(new THREE.Color(0x8a93a8), .6).getHex() }; });
      eye.rotation.y = Math.sin(s * 1.5) * .3; eye.scale.y = frac(s / 2.5) < .05 ? .2 : 1; x2.scale.setScalar(popIn(t, .3)); grid.rotation.x = -.35; cam(st, s); } };
  };
  BUILD.c_demosaic = () => {
    const st = stage(soft), board = sign(3.2, 3.2, () => {}, { color: 0xffffff, depth: .15 }); board.position.set(0, 2.6, 0); st.scene.add(board);
    return { ...st, update(t, s) { const k = ease(seg(t, .15, .75));
      board.userData.redraw((x, w, h) => { scene2d(x, w, h, {}); const d = x.getImageData(0, 0, w, h), n = 16, cw = Math.floor(w / n), a = d.data;
        for (let Y = 0; Y < h; Y++) for (let X = 0; X < w; X++) { const i = (Y * w + X) * 4, ch = bayer(Math.floor(X / cw), Math.floor(Y / cw)), keep = ch === 'R' ? 0 : ch === 'G' ? 1 : 2; for (let c = 0; c < 3; c++) if (c !== keep) a[i + c] = a[i + c] * k; }
        x.putImageData(d, 0, 0); if (k < 1) { x.strokeStyle = `rgba(0,0,0,${.25 * (1 - k)})`; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * cw, 0); x.lineTo(i * cw, h); x.moveTo(0, i * cw); x.lineTo(w, i * cw); x.stroke(); } } });
      board.rotation.y = Math.sin(s * .6) * .15; cam(st, s); } };
  };
  BUILD.c_stack = () => {
    const st = stage(warm), ph = cameraPhone(0xff6fb1); ph.scale.setScalar(.8); ph.position.set(0, 1.6, .5); ph.rotation.y = Math.PI; st.scene.add(ph);
    const frames = [0, 1, 2, 3, 4, 5].map(i => { const p = photo(1.1, .8, { exposure: 1 }); st.scene.add(p); return p; });
    const btn = M(new THREE.CylinderGeometry(.25, .25, .1, 32), plastic(0xffffff), { rot: [Math.PI / 2, 0, 0] }); st.scene.add(btn);
    const lb = textSign(2.4, .42, 'ALREADY CAPTURING', { color: C.amber, fg: '#3a2400', size: 54 }); lb.position.set(0, 4.8, .3); st.scene.add(lb);
    return { ...st, update(t, s) { frames.forEach((p, i) => { const u = frac(s * .4 + i / 6); p.position.set(lerp(-2.2, 2.2, u), 3.7 + Math.sin(u * Math.PI) * .2, -.2); p.rotation.y = .3; p.scale.setScalar(Math.sin(u * Math.PI) * .9); });
      const pr = t > .6 && t < .7; btn.position.set(.9, .9, 1.4); btn.scale.set(1, pr ? .5 : 1, 1); lb.scale.setScalar(popIn(t, .2)); cam(st, s, 2.7); } };
  };
  BUILD.c_hdr = () => {
    const st = stage(soft), dark = photo(1.4, 1.1, { exposure: .35 }), bright = photo(1.4, 1.1, { exposure: 1.9 }), out = photo(2.0, 1.6, { exposure: 1 });
    st.scene.add(dark, bright, out); const l1 = textSign(1.0, .36, 'DARK', { color: 0x2a3046, fg: '#fff', size: 56 }), l2 = textSign(1.0, .36, 'BRIGHT', { color: 0xffffff, fg: '#1d2442', size: 56 }), l3 = textSign(1.1, .4, 'HDR', { color: C.amber, fg: '#3a2400', size: 70 }); st.scene.add(l1, l2, l3);
    return { ...st, update(t, s) { const m = ease(seg(t, .3, .65)); dark.position.set(lerp(-.85, 0, m), lerp(4.0, 2.4, m), .1); bright.position.set(lerp(.85, 0, m), lerp(4.0, 2.4, m), .1); dark.visible = bright.visible = t < .68;
      out.position.set(0, 2.4, .3); out.scale.setScalar(t > .62 ? Math.min(1.05, pop((t - .62) * 5)) : 0); l1.position.set(-.85, 4.75, .3); l2.position.set(.85, 4.75, .3); l1.scale.setScalar(1 - m); l2.scale.setScalar(1 - m); l3.position.set(0, 3.55, .5); l3.scale.setScalar(m > .95 ? popIn(t, .7) : 0);
      cam(st, s, 2.8); } };
  };
  BUILD.c_night = () => {
    const st = stage(night), pic = photo(2.4, 1.8, { exposure: .55, noise: 1 }); pic.position.set(0, 2.9, 0); st.scene.add(pic);
    const cnt = sign(1.9, .5, () => {}, { color: 0xffffff }); cnt.position.set(0, 4.55, .3); st.scene.add(cnt);
    const moon = G(M(SPH(.3, 24, 16), glowM(0xfff2c0, 1.5), { shadow: false }), sprite(0xfff2c0, 1.4, .6)); moon.position.set(1.4, 1.4, .4); st.scene.add(moon); let last = -1;
    return { ...st, update(t, s) { const n = Math.min(12, 1 + Math.floor(seg(t, .1, .8) * 12)); if (n !== last) { pic.redraw({ exposure: .55 + n * .03, noise: 1 / Math.sqrt(n), seed: n }); last = n; }
      cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, n + ' frames', w / 2, h / 2 + 4, h * .55, '#6b4fd8', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .1));
      pic.rotation.y = Math.sin(s * .6) * .15; moon.position.y = 1.4 + Math.sin(s) * .05; cam(st, s, 2.8); } };
  };
  BUILD.c_portrait = () => {
    const st = stage({ top: '#bfe4ff', bottom: '#d8f2c2', floor: 0x9dd67f }), bit = makeBit(); bit.scale.setScalar(.7); bit.position.set(0, 0, 1.0); st.scene.add(bit);
    const bg = []; for (let i = 0; i < 7; i++) { const tr = K.tree(-2.4 + i * .8, -3 - (i % 2) * 1.5, 1.2 + (i % 3) * .3, i % 2 ? 0x55c271 : 0x3fae63); st.scene.add(tr); bg.push(tr); }
    const veil = M(new THREE.PlaneGeometry(14, 8), new THREE.MeshBasicMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0, depthWrite: false }), { pos: [0, 3, -1.2], shadow: false }); st.scene.add(veil);
    const dep = textSign(1.7, .42, 'DEPTH MAP', { color: C.violet, fg: '#fff', size: 58 }); dep.position.set(0, 4.2, 1.2); st.scene.add(dep);
    return { ...st, update(t, s) { const b = ease(seg(t, .35, .7)); veil.material.opacity = b * .55; bg.forEach((tr, i) => tr.scale.setScalar(1 + b * .08 * Math.sin(s * 2 + i)));
      bit.pose({ s, happy: 1, waveR: seg(t, .6, .7) }); dep.scale.setScalar(popIn(t, .1) * (1 - seg(t, .6, .7))); aim(st.cam, [Math.sin(s * .4) * .5, 2.4, 7.4], [0, 1.9, 0]); } };
  };
  BUILD.c_finish = () => {
    const st = stage(warm), pic = photo(2.2, 1.65, { exposure: 1 }); pic.position.set(0, 3.0, 0); st.scene.add(pic);
    const sliders = ['COLOUR', 'SHARPEN'].map((l, i) => { const g = new THREE.Group(); g.position.set(-.5, 1.65 - i * .5, .6); st.scene.add(g); g.add(M(RB(1.8, .08, .08, .03), plastic(0xc9cdd8), {}));
      const knob = M(SPH(.12, 20, 14), plastic([C.pink, C.cyan][i]), {}); g.add(knob); const lb = textSign(.95, .3, l, { color: 0xffffff, fg: '#1d2442', size: 44, depth: .05 }); lb.position.set(1.5, 0, 0); g.add(lb); g.userData.knob = knob; return g; });
    const size = sign(1.6, .5, () => {}, { color: 0xffffff }); size.position.set(0, 4.55, .3); st.scene.add(size);
    return { ...st, update(t, s) { sliders.forEach((g, i) => g.userData.knob.position.x = lerp(-.8, .5, ease(seg(t, .05 + i * .15, .3 + i * .15))) + Math.sin(s * 3 + i) * .02);
      const mb = lerp(48, 3, ease(seg(t, .5, .85))); size.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, mb.toFixed(1) + ' MB', w / 2, h / 2 + 4, h * .58, mb < 10 ? '#2ca84a' : '#d42f7f', 900, 'center', MONO); }); size.scale.setScalar(popIn(t, .45));
      pic.scale.setScalar(lerp(1, .8, ease(seg(t, .5, .85)))); pic.rotation.z = Math.sin(s * 1.5) * .03; cam(st, s, 2.7); } };
  };
}
