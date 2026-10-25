// Sets for Tech Shorts episode 5: How Touchscreens Actually Work (lively style: everything keeps moving).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, confetti, sparkles, clamp, lerp, seg, ease, out, pop, frac, V, rng, MONO } = K;
  const { waves, screenFace } = common(K);
  const desk = { top: '#d9ecff', bottom: '#f3dcf0', floor: 0xf0d2ea }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;

  // ---------- the flat phone with its sensor grid ----------
  const SW = 2.0, SL = 3.9, COLS = 7, ROWS = 13;
  function flatPhone(o = {}) {
    const g = new THREE.Group();
    g.add(M(RB(SW + .3, .18, SL + .35, .14), plastic(o.color ?? 0x2a3046, { roughness: .25 }), { pos: [0, .09, 0] }));
    const disp = ctex(256, 512, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2b1f5c'); gr.addColorStop(1, '#13365e'); x.fillStyle = gr; x.fillRect(0, 0, w, h); });
    const screen = M(new THREE.PlaneGeometry(SW, SL), new THREE.MeshBasicMaterial({ map: disp.tex, toneMapped: false }), { rot: [-Math.PI / 2, 0, 0], pos: [0, .185, 0], shadow: false }); g.add(screen);
    const grid = new THREE.Group(); grid.position.y = .2; g.add(grid);
    const lineM = new THREE.MeshBasicMaterial({ color: 0x7fe9ff, transparent: true, opacity: .55, toneMapped: false });
    const rows = [], cols = [];
    for (let r = 0; r < ROWS; r++) { const m = M(new THREE.BoxGeometry(SW * .96, .012, .02), lineM, { pos: [0, 0, -SL / 2 + (r + .5) * SL / ROWS], shadow: false }); grid.add(m); rows.push(m); }
    for (let c = 0; c < COLS; c++) { const m = M(new THREE.BoxGeometry(.02, .012, SL * .97), lineM, { pos: [-SW / 2 + (c + .5) * SW / COLS, .004, 0], shadow: false }); grid.add(m); cols.push(m); }
    const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(.045, 12, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), ROWS * COLS); grid.add(nodes);
    const P = [], mtx = new THREE.Matrix4(), col = new THREE.Color();
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) P.push(V(-SW / 2 + (c + .5) * SW / COLS, .01, -SL / 2 + (r + .5) * SL / ROWS));
    // fn(p, i, r, c) -> [scale, hexColor]
    nodes.paint = fn => { P.forEach((p, i) => { const [s, h] = fn(p, i, Math.floor(i / COLS), i % COLS); mtx.makeScale(s, s, s).setPosition(p); nodes.setMatrixAt(i, mtx); nodes.setColorAt(i, col.set(h)); }); nodes.instanceMatrix.needsUpdate = true; nodes.instanceColor.needsUpdate = true; };
    nodes.paint(() => [1, 0x5ff3ff]);
    const glass = M(RB(SW + .2, .06, SL + .25, .03), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .18, roughness: .02, depthWrite: false }), { pos: [0, .25, 0], shadow: false }); g.add(glass);
    g.userData = { grid, nodes, rows, cols, glass, screen, disp, P }; return g;
  }
  // a cartoon finger pointing down, tip at the local origin
  function makeFinger(skin = 0xf3c3a2) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    body.add(M(new THREE.CapsuleGeometry(.3, 1.6, 10, 24), plastic(skin, { roughness: .55, clearcoat: .15 }), { pos: [0, 1.1, 0] }));
    body.add(M(RB(.4, .5, .1, .08), plastic(0xffdcd6, { roughness: .2, clearcoat: 1 }), { pos: [0, .5, .26], rot: [-.15, 0, 0] }));
    [0, 1].forEach(i => body.add(M(new THREE.TorusGeometry(.29, .012, 6, 24, Math.PI), matte(0xd9a688), { pos: [0, 1.25 + i * .1, .02], rot: [0, 0, 0], shadow: false })));
    g.press = sq => body.scale.set(1 + sq * .5, 1 - sq, 1 + sq * .5);
    return g;
  }
  // tap cycle: height above the glass and contact squash for time s
  const tapCycle = (s, period = 1, ph = 0, hgt = .9) => { const u = frac(s / period + ph); if (u < .18) return [lerp(hgt, 0, ease(u / .18)), 0]; if (u < .34) return [0, Math.sin((u - .18) / .16 * Math.PI) * .18]; return [lerp(0, hgt, ease((u - .34) / .66)), 0]; };
  function ripple(col = 0x9df7ff) { const m = M(new THREE.TorusGeometry(1, .03, 8, 64), new THREE.MeshBasicMaterial({ color: col, transparent: true, toneMapped: false, depthWrite: false }), { rot: [Math.PI / 2, 0, 0], shadow: false }); m.at = k => { m.visible = k > 0 && k < 1; m.scale.setScalar(.1 + k * .9); m.material.opacity = 1 - k; }; return m; }
  function chip() {
    const g = new THREE.Group(); g.add(M(RB(1.1, 1.1, .3, .1), plastic(0x2d3350, { roughness: .25 })));
    for (let i = 0; i < 4; i++) [-1, 1].forEach(sd => { g.add(M(RB(.08, .22, .08, .02), metal(0xffc44d), { pos: [-.36 + i * .24, sd * .63, 0] })); g.add(M(RB(.22, .08, .08, .02), metal(0xffc44d), { pos: [sd * .63, -.36 + i * .24, 0] })); });
    const f = screenFace(.75, .5, '#141a2c', '#9b7bff'); f.position.set(0, .1, .16); g.add(f); g.userData.face = f; return g;
  }
  const cam0 = (st, t, extra = 0) => aim(st.cam, [Math.sin(t * 1.2) * .6, 7.0 - extra, 6.3 - extra * .4], [0, 0, -.75]);
  const drainFn = (touches, R = .5) => (p) => { let k = 0; touches.forEach(([x, z, a = 1]) => { const d2 = (p.x - x) ** 2 + (p.z - z) ** 2; k = Math.max(k, Math.exp(-d2 / (R * R)) * a); }); return k; };
  const heat = k => k > .66 ? 0xffe14d : k > .33 ? 0xff7ab8 : k > .08 ? 0x9b7bff : 0x5ff3ff;

  // ---------- sets ----------
  BUILD.t_hook = () => {
    const st = stage(desk); const ph = flatPhone(); ph.scale.setScalar(1.25); st.scene.add(ph); const { nodes } = ph.userData;
    const bit = makeBit(); bit.scale.setScalar(.42); st.scene.add(bit);
    const rp = ripple(); st.scene.add(rp); const sp = sparkles(14, [0, .6, 0], .6, 0xffe14d, 4); st.scene.add(sp);
    const spots = [[-.4, .6], [.45, -.3], [-.3, -1.3], [.35, 1.2], [0, -.1]];
    return { ...st, update(t, s) {
      const per = .9, n = Math.floor(s / per), x = s - n * per, a = spots[n % spots.length], b = spots[(n + 1) % spots.length], h = hop(x, .7, .9), k = clamp((x - .12) / .58);
      bit.position.set(lerp(a[0], b[0], k) * 1.25, .45 + h.y, lerp(a[1], b[1], k) * 1.25); bit.pose({ s, squash: h.sq, upL: .8, upR: .8, happy: 1 });
      const land = clamp((x - .7) / .4), lx = b[0], lz = b[1]; rp.position.set(lx * 1.25, .48, lz * 1.25); rp.at(x > .7 ? land : (n > 0 ? clamp((x + per - .7) / .4) : 0));
      nodes.paint(p => { const d = Math.hypot(p.x - lx, p.z - lz), w = Math.exp(-((d - land * 1.2) ** 2) / .05) * (1 - land); return [1 + w * 1.5, w > .3 ? 0xffe14d : 0x5ff3ff]; });
      sp.position.set(lx * 1.25, 0, lz * 1.25); sp.update(s); sp.visible = x > .7;
      const a2 = s * .25; aim(st.cam, [Math.sin(a2) * 3.5, 5.6, Math.cos(a2) * 6.2], [0, .3, -.3]); } };
  };
  BUILD.t_title = (p) => {
    const st = stage({ top: '#ffd1e8', bottom: '#c9b8ff', floor: 0xbfaaf5 }); st.scene.add(pedestal(1.3, 0xffffff, C.pink));
    const ph = new THREE.Group(); ph.position.set(0, .4, 0); st.scene.add(ph); const fp = flatPhone(); fp.rotation.x = Math.PI / 2 - .25; fp.position.y = 1.85; fp.scale.setScalar(.62); ph.add(fp);
    const fin = makeFinger(); fin.scale.setScalar(.6); fin.rotation.x = Math.PI / 2 + .3; st.scene.add(fin);
    const rp = ripple(0xffe14d); rp.rotation.set(-.25, 0, 0); st.scene.add(rp);
    const s1 = textSign(3.6, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 92 }), s2 = textSign(3.3, .72, p.bottom, { color: C.pink, fg: '#ffffff', size: 96 });
    s1.position.set(0, 4.7, 0); s2.position.set(0, 3.85, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { const [hgt, sq] = tapCycle(s, 1.1, .2, .9); fin.position.set(.25, 2.2 + .15, .9 + hgt); fin.press(sq);
      const u = frac(s / 1.1 + .2), rk = u > .18 ? clamp((u - .18) / .5) : 0; rp.position.set(.25, 2.3, .55); rp.at(rk);
      ph.rotation.y = Math.sin(s * 1.4) * .25; ph.position.y = .4 + Math.abs(Math.sin(s * 3)) * .06;
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .04; s2.rotation.z = -Math.sin(s * 3 + 1) * .05;
      aim(st.cam, [Math.sin(s * .5) * 1.2, 2.8, 9.6], [0, 2.5, 0]); } };
  };
  function stackSet(labels) {
    const st = stage(desk), ph = flatPhone(); st.scene.add(ph); const U = ph.userData;
    const tags = labels ? [['GLASS', 0xffffff, '#1d2442'], ['TOUCH GRID', C.cyan, '#0b3a55'], ['DISPLAY', C.violet, '#ffffff']].map(([l, c, f]) => { const g = textSign(1.5, .4, l, { color: c, fg: f, size: 60 }); st.scene.add(g); return g; }) : [];
    return { st, ph, U, tags };
  }
  BUILD.t_grid = () => {
    const { st, ph, U } = stackSet(false);
    return { ...st, update(t, s) {
      const lift = ease(seg(t, .05, .3)); U.glass.position.y = .25 + lift * 1.6; U.grid.position.y = .2 + lift * .8; U.glass.rotation.z = Math.sin(s * 2) * .03 * lift;
      const r = seg(t, .3, .6), c = seg(t, .55, .85);
      U.rows.forEach((m, i) => m.scale.x = clamp(r * ROWS - i)); U.cols.forEach((m, i) => m.scale.z = clamp(c * COLS - i)); U.nodes.visible = c > .95;
      ph.rotation.y = Math.sin(s * .6) * .25;
      aim(st.cam, [2.6, 4.4, 5.6], [0, .7, -.3]); } };
  };
  BUILD.t_layers = () => {
    const { st, ph, U, tags } = stackSet(true);
    const ox = textSign(2.2, .38, 'see-through metal oxide', { color: 0xffffff, fg: '#0b6f95', size: 50 }); st.scene.add(ox);
    return { ...st, update(t, s) { U.glass.position.y = 1.85 + Math.sin(s * 2) * .08; U.grid.position.y = 1.0 + Math.sin(s * 2 + 1) * .06; ph.rotation.y = .3 + Math.sin(s * .5) * .2;
      [[U.glass.position.y + .5], [U.grid.position.y + .45], [.75]].forEach(([y], i) => { tags[i].position.set(-.55, y, .9); tags[i].scale.setScalar(popIn(t, .05 + i * .14)); tags[i].rotation.z = Math.sin(s * 3 + i) * .04; });
      ox.position.set(.35, U.grid.position.y - .15, 1.6); ox.scale.setScalar(popIn(t, .5));
      U.nodes.paint(p => { const w = .5 + .5 * Math.sin(s * 4 - (p.x + p.z) * 2); return [.8 + w * .6, 0x5ff3ff]; });
      aim(st.cam, [Math.sin(s * .5) * .8, 6.6, 6.8], [0, 1.0, -.6]); } };
  };
  BUILD.t_field = () => {
    const st = stage(desk), ph = flatPhone(); ph.scale.setScalar(1.25); st.scene.add(ph); const U = ph.userData;
    const arcs = []; for (let i = 0; i < 10; i++) { const a = M(new THREE.TorusGeometry(.09, .01, 6, 24, Math.PI), glowM(C.cyan, 2.5), { shadow: false }); st.scene.add(a); arcs.push(a); }
    const bit = makeBit(); bit.scale.setScalar(.36); st.scene.add(bit);
    const n = textSign(1.9, .44, 'HUNDREDS OF SENSORS', { color: C.cyan, fg: '#0b3a55', size: 56 }); n.position.set(0, 2.6, .2); st.scene.add(n);
    return { ...st, update(t, s) {
      U.nodes.paint(p => { const d = Math.hypot(p.x, p.z), w = .5 + .5 * Math.sin(d * 5 - s * 6); return [.9 + w * .9, w > .8 ? 0xffffff : 0x5ff3ff]; });
      arcs.forEach((a, i) => { const r = Math.floor(i * 1.3) % ROWS, c = (i * 3) % COLS, P = U.P[r * COLS + c]; a.position.set(P.x * 1.25, .27, P.z * 1.25); a.rotation.y = i; a.scale.setScalar(1 + .3 * Math.sin(s * 5 + i)); });
      const z = lerp(2.0, -2.0, frac(s * .12)); bit.position.set(Math.sin(s * .8) * .4, .45, z); bit.rotation.y = Math.PI; bit.pose({ s, walk: s * 9, lookX: .3 });
      n.scale.setScalar(popIn(t, .45)); n.rotation.z = Math.sin(s * 3) * .04;
      cam0(st, s); } };
  };
  BUILD.t_finger = () => {
    const st = stage(desk), ph = flatPhone(); ph.scale.setScalar(1.25); st.scene.add(ph); const U = ph.userData;
    const fin = makeFinger(); fin.scale.setScalar(.75); st.scene.add(fin);
    const parts = []; for (let i = 0; i < 26; i++) { const p = G(M(SPH(.04, 10, 8), glowM(C.cyan, 4), { shadow: false }), sprite(C.cyan, .25, .8)); st.scene.add(p); parts.push([p, Math.random() * 6.28, (i * .37) % 1]); }
    const at = [.2, .2];
    return { ...st, update(t, s) {
      const down = ease(seg(t, .1, .45)), hov = .25 + (1 - down) * 2.4 + Math.sin(s * 4) * .03 * down; fin.position.set(at[0] * 1.25, hov, at[1] * 1.25); fin.rotation.z = Math.sin(s * 2) * .05; fin.press(down > .98 ? .05 + Math.sin(s * 6) * .02 : 0);
      const drain = seg(t, .35, .6);
      U.nodes.paint(p => { const k = drainFn([[at[0], at[1], drain]], .55)(p); return [1 - k * .6, k > .4 ? 0x3a3f66 : k > .15 ? 0x2b9fc0 : 0x5ff3ff]; });
      parts.forEach(([p, a, ph0]) => { const u = frac(s * .8 + ph0), r = .6 * (1 - u); p.position.set(at[0] * 1.25 + Math.cos(a + s) * r, .25 + u * .7, at[1] * 1.25 + Math.sin(a + s) * r); p.visible = drain > .1; p.scale.setScalar(1 - u * .6); });
      aim(st.cam, [Math.sin(s * .6) * .5, lerp(7.0, 5.6, ease(t)), lerp(6.3, 5.0, ease(t))], [at[0], .4, at[1] - .5]); } };
  };
  BUILD.t_drop = () => {
    const st = stage(warm);
    const gauge = new THREE.Group(); gauge.position.set(.2, 3.55, -.3); gauge.scale.setScalar(.85); st.scene.add(gauge);
    gauge.add(M(new THREE.CylinderGeometry(1.35, 1.35, .25, 64), plastic(0xffffff), { rot: [Math.PI / 2, 0, 0] }), M(new THREE.TorusGeometry(1.35, .08, 12, 64), plastic(C.violet), {}));
    const face = ctex(512, 512); gauge.add(M(new THREE.CircleGeometry(1.25, 64), new THREE.MeshBasicMaterial({ map: face.tex, toneMapped: false }), { pos: [0, 0, .13], shadow: false }));
    const needle = G(M(RB(.06, 1.0, .05, .02), plastic(C.red), { pos: [0, .45, 0] }), M(new THREE.CylinderGeometry(.1, .1, .08, 20), plastic(0x2a3046), { rot: [Math.PI / 2, 0, 0] })); needle.position.z = .17; gauge.add(needle);
    const fin = makeFinger(); fin.scale.setScalar(.7); st.scene.add(fin);
    const pad = M(RB(1.6, .12, 1.0, .06), plastic(0x2a3046), { pos: [-.55, .9, .9] }); st.scene.add(pad);
    const c = chip(); c.scale.setScalar(.6); c.position.set(1.35, 1.4, 1.2); st.scene.add(c);
    const ex = textSign(.42, .42, '!', { color: C.amber, fg: '#3a2400', size: 100 }); ex.position.set(1.35, 2.05, 1.3); st.scene.add(ex);
    return { ...st, update(t, s) { const [hgt, sq] = tapCycle(s, 1.2, .1, .8), touching = hgt < .15;
      fin.position.set(-.55, .96 + hgt, .9); fin.press(sq); const v = touching ? .1 : 0;
      face.redraw((x, w, h) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, w, h); for (let i = 0; i <= 10; i++) { const a = -Math.PI * .75 + i / 10 * Math.PI * 1.5; x.fillStyle = i > 7 ? '#5ce06a' : '#c9b48a'; x.fillRect(256 + Math.sin(a) * 200 - 5, 256 - Math.cos(a) * 200 - 16, 10, 32); }
        label(x, touching ? 'CHANGE!' : 'FIELD', 256, 380, 52, touching ? '#d42f7f' : '#1d2442', 900); });
      needle.rotation.z = -(.55 - v * 2.2) + Math.sin(s * 20) * .01; ex.scale.setScalar(touching ? 1 : 0); c.rotation.z = touching ? Math.sin(s * 30) * .06 : 0;
      aim(st.cam, [0, 2.6, 8.6], [0, 2.3, 0]); } };
  };
  BUILD.t_glove = () => {
    const st = stage(desk), ph = flatPhone(); ph.scale.setScalar(1.15); st.scene.add(ph); const U = ph.userData;
    const mitten = G(M(RB(.9, 1.2, .45, .3), plastic(0x5f8cff, { roughness: .9, clearcoat: 0 }), { pos: [0, .6, 0] }), M(RB(.35, .55, .4, .16), plastic(0x5f8cff, { roughness: .9, clearcoat: 0 }), { pos: [.55, .55, 0], rot: [0, 0, -.5] }));
    const pencil = G(M(new THREE.CylinderGeometry(.12, .12, 1.8, 6), plastic(0xffc44d), { pos: [0, 1.15, 0] }), M(new THREE.ConeGeometry(.12, .3, 6), matte(0xf0d8b0), { pos: [0, .1, 0], rot: [Math.PI, 0, 0] }), M(new THREE.CylinderGeometry(.125, .125, .2, 6), plastic(C.pink), { pos: [0, 2.1, 0] }));
    const tglove = G(M(RB(.5, 1.5, .5, .24), plastic(0x2a3046, { roughness: .9, clearcoat: 0 }), { pos: [0, .9, 0] }), M(SPH(.26, 20, 14), metal(0xd7dbe6), { pos: [0, .2, 0] }));
    const items = [mitten, pencil, tglove]; items.forEach(i => st.scene.add(i));
    const marks = [textSign(.5, .5, '✕', { color: C.red, fg: '#fff', size: 110 }), textSign(.5, .5, '✕', { color: C.red, fg: '#fff', size: 110 }), textSign(.5, .5, '✓', { color: 0x3cc85a, fg: '#fff', size: 110 })]; marks.forEach(m => st.scene.add(m));
    const lb = textSign(2.2, .42, 'METAL THREAD TIP', { color: 0xd7dbe6, fg: '#1d2442', size: 56 }); lb.position.set(0, 3.2, .3); st.scene.add(lb);
    return { ...st, update(t, s, d) {
      items.forEach((it, i) => { const t0 = .03 + i * .3, x = (t - t0) * d, act = t >= t0 && t < t0 + .3, h = hop(x - .05, .55, .7);
        it.visible = act; it.position.set(0, .3 + (x < .05 ? 3 - x * 50 : h.y), .1); it.rotation.z = Math.sin(x * 9) * .15 * (i < 2 ? 1 : 0); it.scale.set(1 + h.sq * .5, 1 - h.sq, 1 + h.sq * .5);
        marks[i].position.set(1.0, 2.0, .6); marks[i].scale.setScalar(act && x > .3 ? Math.min(1.1, pop(x - .3)) : 0); });
      const ok = t > .63 && t < .93; U.nodes.paint(p => { const k = ok ? Math.exp(-(p.x ** 2 + (p.z - .1) ** 2) / .25) : 0; return [1 + k, k > .3 ? 0xffe14d : 0x5ff3ff]; });
      lb.scale.setScalar(popIn(t, .72)); cam0(st, s, .4); } };
  };
  BUILD.t_scan = () => {
    const st = stage(desk), ph = flatPhone(); ph.scale.setScalar(1.25); st.scene.add(ph); const U = ph.userData;
    const bar = M(RB(SW * 1.3, .03, .1, .01), glowM(0xffe14d, 4), { shadow: false }); st.scene.add(bar); const glow = sprite(0xffe14d, 2.5, .5); st.scene.add(glow);
    const c = chip(); c.scale.setScalar(.7); c.position.set(1.55, .7, 2.2); c.rotation.x = -.4; st.scene.add(c);
    return { ...st, update(t, s) { const row = Math.floor(frac(s * .6) * ROWS), z = (-SL / 2 + (row + .5) * SL / ROWS) * 1.25;
      bar.position.set(0, .3, z); glow.position.set(0, .35, z);
      U.nodes.paint((p, i, r) => r === row ? [1.8, 0xffe14d] : [1, r < row ? 0x8ff6ff : 0x5ff3ff]);
      c.userData.face.rotation.z = Math.sin(s * 5) * .05; c.position.y = .7 + Math.abs(Math.sin(s * 4)) * .08;
      cam0(st, s); } };
  };
  BUILD.t_speed = () => {
    const st = stage(desk), ph = flatPhone(); ph.scale.setScalar(1.25); st.scene.add(ph); const U = ph.userData;
    const bar = M(RB(SW * 1.3, .03, .14, .01), glowM(0xffe14d, 4), { shadow: false }); st.scene.add(bar);
    const bit = makeBit(); bit.scale.setScalar(.36); st.scene.add(bit);
    const sw = sign(2.0, .55, () => {}, { color: 0xffffff }); sw.position.set(0, 2.7, .2); st.scene.add(sw);
    return { ...st, update(t, s) { const z = lerp(-SL / 2, SL / 2, frac(s * 4)) * 1.25; bar.position.set(0, .3, z); bar.scale.z = 3;
      U.nodes.paint(p => { const dz = Math.abs(p.z * 1.25 - z); return dz < .3 ? [1.6, 0xffe14d] : [1, 0x5ff3ff]; });
      const bz = lerp(2.0, -2.0, frac(s * .35)); bit.position.set(Math.sin(s * 2) * .5, .45 + Math.abs(Math.sin(s * 14)) * .1, bz); bit.rotation.y = Math.PI; bit.pose({ s, walk: s * 16, lookX: .2 });
      sw.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, (frac(s * 4) * .008).toFixed(4) + ' s', w / 2, h / 2 + 4, h * .55, '#0a8fb5', 900, 'center', MONO); }); sw.scale.setScalar(popIn(t, .1));
      cam0(st, s); } };
  };
  BUILD.t_locate = () => {
    const st = stage(desk), ph = flatPhone(); ph.scale.setScalar(1.25); st.scene.add(ph); const U = ph.userData;
    const tx = .23, tz = -.35, cross = new THREE.Group(); st.scene.add(cross);
    cross.add(M(new THREE.TorusGeometry(1, .03, 8, 64), glowM(0xffffff, 3), { rot: [Math.PI / 2, 0, 0], shadow: false }), M(RB(.03, .02, 2.4, .01), glowM(0xffffff, 3), { shadow: false }), M(RB(2.4, .02, .03, .01), glowM(0xffffff, 3), { shadow: false }));
    const mm = textSign(1.3, .44, '± 1 mm', { color: 0xffffff, fg: '#1d2442', size: 70, font: MONO }); st.scene.add(mm);
    return { ...st, update(t, s) { const hk = seg(t, .05, .35);
      U.nodes.paint(p => { const k = drainFn([[tx, tz, hk]], .45)(p); return [1 + k * 1.2, heat(k)]; });
      const z = lerp(1.2, .12, ease(seg(t, .35, .75))); cross.position.set(tx * 1.25, .32, tz * 1.25); cross.scale.setScalar(z); cross.rotation.y = s * (1 - seg(t, .7, .8)); cross.visible = t > .35;
      mm.position.set(tx * 1.25 + .2, 1.2, tz * 1.25 + .6); mm.scale.setScalar(popIn(t, .75));
      aim(st.cam, [Math.sin(s * .6) * .4, lerp(6, 4.4, ease(seg(t, .3, .9))), lerp(5.2, 3.6, ease(seg(t, .3, .9)))], [tx, 0, tz - .3]); } };
  };
  BUILD.t_multi = () => {
    const st = stage(desk), ph = flatPhone(); ph.scale.setScalar(1.25); st.scene.add(ph); const U = ph.userData;
    const fins = [0, 1, 2].map(() => { const f = makeFinger(); f.scale.setScalar(.55); st.scene.add(f); return f; });
    const tags = ['1', '2', '3'].map((n, i) => { const g = textSign(.36, .36, n, { color: [C.pink, C.amber, C.lime][i], fg: '#1d2442', size: 80 }); st.scene.add(g); return g; });
    return { ...st, update(t, s) { const pts = [[-.5 + Math.sin(s * 1.3) * .3, -.9 + Math.cos(s * 1.1) * .4], [.5 + Math.sin(s * 1.7 + 1) * .25, -.1 + Math.cos(s * .9) * .5], [-.2 + Math.cos(s * 1.2) * .35, .9 + Math.sin(s * 1.5) * .3]];
      const on = [0, 1, 2].map(i => seg(t, .05 + i * .15, .15 + i * .15));
      fins.forEach((f, i) => { f.position.set(pts[i][0] * 1.25, .27 + (1 - on[i]) * 3, pts[i][1] * 1.25); f.rotation.set(-.2, 0, .15 * (i - 1)); f.press(on[i] >= 1 ? .04 : 0); });
      tags.forEach((g, i) => { g.position.set(pts[i][0] * 1.25 + .45, 1.0, pts[i][1] * 1.25 + .3); g.scale.setScalar(on[i] >= 1 ? 1 : 0); });
      U.nodes.paint(p => { const k = drainFn(pts.map((q, i) => [q[0], q[1], on[i]]), .4)(p); return [1 + k * 1.2, heat(k)]; });
      cam0(st, s); } };
  };
  BUILD.t_palm = () => {
    const st = stage(desk), ph = flatPhone(); ph.scale.setScalar(1.25); st.scene.add(ph); const U = ph.userData;
    const palm = M(SPH(1, 40, 24), plastic(0xf3c3a2, { roughness: .55, clearcoat: .1 }), { scale: [1.1, .35, .9] }); st.scene.add(palm);
    const fin = makeFinger(); fin.scale.setScalar(.6); st.scene.add(fin);
    const no = textSign(1.4, .42, 'IGNORED', { color: C.red, fg: '#fff', size: 62 }), yes = textSign(1.2, .42, 'TOUCH ✓', { color: 0x3cc85a, fg: '#fff', size: 62 }); st.scene.add(no, yes);
    return { ...st, update(t, s) { const pk = ease(seg(t, .05, .3)); palm.position.set(.2, .25 + (1 - pk) * 2.5, 1.55); palm.rotation.z = Math.sin(s * 1.5) * .05;
      const [hgt, sq] = tapCycle(s, 1.0, 0, .8), fk = seg(t, .4, .5); fin.position.set(-.35, .27 + hgt + (1 - fk) * 3, -1.3); fin.press(sq);
      const tap = fk >= 1 && hgt < .1 ? 1 : 0;
      U.nodes.paint(p => { const kp = Math.exp(-(((p.x - .16) / .75) ** 2 + ((p.z - 1.24) / .6) ** 2)) * pk, kf = Math.exp(-((p.x + .28) ** 2 + (p.z + 1.04) ** 2) / .08) * tap;
        return kp > .3 ? [1.3, 0xff6b6b] : [1 + kf, kf > .3 ? 0x5ce06a : 0x5ff3ff]; });
      no.position.set(.2, 1.2, 2.1); no.scale.setScalar(popIn(t, .3)); yes.position.set(-.35, 1.7, -1.1); yes.scale.setScalar(tap ? 1.05 : popIn(t, .55) * .9);
      cam0(st, s); } };
  };
  BUILD.t_gesture = () => {
    const st = stage({ top: '#ffe0f0', bottom: '#d8d0ff', floor: 0xcfc6ff });
    const body = M(RB(2.3, 4.2, .2, .3), plastic(0x2a3046, { roughness: .25 }), { pos: [0, 2.6, 0] }); st.scene.add(body);
    const pic = ctex(512, 1024, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7ec8ff'); g.addColorStop(.55, '#ffd6a8'); g.addColorStop(.56, '#5cc46a'); g.addColorStop(1, '#3b8f4a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = '#ffe14d'; x.beginPath(); x.arc(370, 250, 70, 0, 7); x.fill(); x.fillStyle = '#7a6f8f'; x.beginPath(); x.moveTo(0, 580); x.lineTo(180, 330); x.lineTo(330, 580); x.fill(); x.fillStyle = '#9a8fb0'; x.beginPath(); x.moveTo(200, 580); x.lineTo(380, 380); x.lineTo(512, 580); x.fill(); });
    pic.tex.wrapS = pic.tex.wrapT = THREE.ClampToEdgeWrapping;
    const scr = M(new THREE.PlaneGeometry(2.05, 3.9), new THREE.MeshBasicMaterial({ map: pic.tex, toneMapped: false }), { pos: [0, 2.6, .105], shadow: false }); st.scene.add(scr);
    const next = M(new THREE.PlaneGeometry(2.05, 3.9), new THREE.MeshBasicMaterial({ color: 0xffc4e0, toneMapped: false }), { pos: [0, 2.6, .104], shadow: false }); st.scene.add(next);
    const f1 = makeFinger(), f2 = makeFinger(); [f1, f2].forEach(f => { f.scale.setScalar(.5); f.rotation.x = Math.PI / 2 - 1.0; st.scene.add(f); });
    const l1 = textSign(1.7, .42, 'PINCH TO ZOOM', { color: C.amber, fg: '#3a2400', size: 56 }), l2 = textSign(1.2, .42, 'SWIPE', { color: C.cyan, fg: '#0b3a55', size: 62 }); l1.position.set(0, 5.0, .4); l2.position.set(0, 5.0, .4); st.scene.add(l1, l2);
    return { ...st, update(t, s) {
      const pinch = t < .55, pk = ease(seg(t, .08, .45)), z = 1 + pk * 1.2; pic.tex.repeat.set(1 / z, 1 / z); pic.tex.offset.set((1 - 1 / z) * .6, (1 - 1 / z) * .55);
      const sk = ease(seg(t, .65, .85)); scr.position.x = -sk * 2.6; next.visible = t > .6;
      if (pinch) { const sp = lerp(.25, 1.0, pk); f1.position.set(-sp * .7, 2.6 - sp * .5, .15 + .9 * (1 - seg(t, 0, .08))); f2.position.set(sp * .7, 2.6 + sp * .5, .15 + .9 * (1 - seg(t, 0, .08))); f2.visible = true; }
      else { f2.visible = false; f1.position.set(lerp(.8, -1.3, sk), 2.6, .15 + (t < .62 ? .9 * (1 - seg(t, .55, .62)) : 0)); }
      l1.scale.setScalar(pinch ? popIn(t, .15) : 0); l2.scale.setScalar(t > .65 ? popIn(t, .65) : 0); body.rotation.y = Math.sin(s * .8) * .08; scr.rotation.y = next.rotation.y = body.rotation.y;
      aim(st.cam, [0, 2.8, 9.0], [0, 2.6, 0]); } };
  };
  BUILD.t_water = () => {
    const st = stage({ top: '#9fb4d6', bottom: '#d8e2f0', floor: 0xc9d4e6 }), ph = flatPhone(); ph.scale.setScalar(1.25); st.scene.add(ph); const U = ph.userData;
    const cloud = G(...[[-.6, 0, 0, .6], [0, .2, 0, .75], [.6, 0, 0, .6]].map(([x, y, z, r]) => M(SPH(r, 24, 16), plastic(0xeef2fa, { clearcoat: .3 }), { pos: [x, y, z] })));
    [-1, 1].forEach(d => cloud.add(M(new THREE.CapsuleGeometry(.05, .07, 4, 10), new THREE.MeshBasicMaterial({ color: 0x141a2c }), { pos: [d * .18, .1, .7], shadow: false }))); cloud.position.set(0, 2.5, -.8); st.scene.add(cloud);
    const r = rng(17), drops = []; for (let i = 0; i < 9; i++) { const d = M(SPH(.08, 14, 10), new THREE.MeshPhysicalMaterial({ color: 0x8fd8ff, roughness: .05, transmission: .3, transparent: true, opacity: .85 }), { scale: [1, 1.4, 1], shadow: false }); st.scene.add(d); drops.push([d, (r() - .5) * 1.8, (r() - .5) * 3.2, r()]); }
    const ghosts = drops.map(() => { const g = textSign(.36, .36, '?', { color: C.red, fg: '#fff', size: 80 }); st.scene.add(g); return g; });
    return { ...st, update(t, s) { cloud.position.x = Math.sin(s * .9) * .4; cloud.scale.y = 1 + Math.sin(s * 3) * .04;
      const hits = []; drops.forEach(([d, x, z, ph0], i) => { const u = frac(s * .5 + ph0); d.position.set(x * 1.25, lerp(2.3, .3, u * u), z * 1.25); d.visible = u < .98; if (u > .8 || u < .25) hits.push([x, z, 1]);
        ghosts[i].position.set(x * 1.25, .85, z * 1.25); ghosts[i].scale.setScalar(t > .45 && (u > .9 || u < .3) ? .9 : 0); });
      U.nodes.paint(p => { const k = drainFn(hits, .3)(p); return [1 + k, k > .4 ? 0xff6b6b : 0x5ff3ff]; });
      cam0(st, s); } };
  };
  BUILD.t_old = () => {
    const st = stage(warm);
    st.scene.add(M(RB(2.6, .25, 3.6, .1), plastic(0x2a3046), { pos: [0, .125, 0] }));
    const seg2 = 40, sheet = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.4, seg2, seg2), new THREE.MeshPhysicalMaterial({ color: 0xcfe9ff, transparent: true, opacity: .75, roughness: .1, side: THREE.DoubleSide }));
    sheet.rotation.x = -Math.PI / 2; sheet.position.y = .62; sheet.receiveShadow = true; st.scene.add(sheet); const base = sheet.geometry.attributes.position.array.slice();
    const bottom = M(new THREE.PlaneGeometry(2.4, 3.4), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: .5 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, .26, 0], shadow: false }); st.scene.add(bottom);
    [[-1.2, -1.7], [1.2, -1.7], [-1.2, 1.7], [1.2, 1.7]].forEach(([x, z]) => st.scene.add(M(new THREE.CylinderGeometry(.06, .06, .36, 10), plastic(0xffffff), { pos: [x, .44, z] })));
    const bit = makeBit(); bit.scale.setScalar(.45); st.scene.add(bit);
    const spark = sparkles(12, [0, .3, 0], .3, 0xffe14d, 9); st.scene.add(spark);
    const lb = textSign(1.9, .44, 'PUSH HARDER!', { color: C.amber, fg: '#3a2400', size: 60 }); lb.position.set(0, 2.0, .3); st.scene.add(lb);
    return { ...st, update(t, s) { const push = seg(t, .25, .55), wob = Math.sin(s * 12) * .03 * push, depth = .36 * ease(push) + wob;
      const a = sheet.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 3) { const x = base[i], y = base[i + 1], d2 = x * x + y * y; a[i + 2] = -depth * Math.exp(-d2 / .5); } sheet.geometry.attributes.position.needsUpdate = true; sheet.geometry.computeVertexNormals();
      bit.position.set(0, .62 - depth + .02, 0); bit.pose({ s, squash: push * .12 + wob, upL: 0, reachL: 0, sad: push > .5 ? .6 : 0, lookX: .4 });
      spark.visible = depth > .33; spark.update(s); lb.scale.setScalar(popIn(t, .3)); lb.rotation.z = Math.sin(s * 8) * .05;
      aim(st.cam, [Math.sin(s * .5) * 1.5, 3.4, 6.4], [0, .6, 0]); } };
  };
}
