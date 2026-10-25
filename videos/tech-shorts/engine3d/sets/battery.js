// Sets for Tech Shorts episode 3: How Your Phone Battery Actually Works.
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, pedestal, confetti, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { waves, screenFace, makePhone } = common(K);

  // ---------- the cell: graphite on top, electrolyte + separator in the middle, metal oxide below ----------
  const Y = { gTop: 4.35, gBot: 3.45, sep: 2.6, cTop: 1.75, cBot: .95 }, CW = 3.0;
  function cell(o = {}) {
    const g = new THREE.Group(), parts = {};
    parts.case = M(RB(CW + .3, 3.75, 1.3, .25), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .16, roughness: .05, depthWrite: false }), { pos: [0, 2.65, -.1], shadow: false });
    parts.graphite = new THREE.Group(); for (let i = 0; i < 5; i++) parts.graphite.add(M(RB(CW - .1, .1, 1.0, .03), plastic(0x3a3f4f, { roughness: .5 }), { pos: [0, Y.gBot + .05 + i * .2, 0] }));
    parts.oxide = new THREE.Group(); parts.oxide.add(M(RB(CW - .1, .78, 1.0, .1), plastic(0x2f8fb8, { roughness: .4 }), { pos: [0, (Y.cTop + Y.cBot) / 2, 0] }));
    for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) parts.oxide.add(M(SPH(.07, 12, 8), plastic(0x9fe3ff), { pos: [-1.2 + i * .4, 1.2 + j * .32, .51], shadow: false }));
    parts.liquid = M(RB(CW - .1, Y.gBot - Y.cTop - .1, .95, .05), new THREE.MeshPhysicalMaterial({ color: 0x7fd8ff, transparent: true, opacity: .28, roughness: .1, depthWrite: false }), { pos: [0, (Y.gBot + Y.cTop) / 2, 0], shadow: false });
    const sepTex = ctex(512, 64, (x, w, h) => { x.fillStyle = '#ffd36e'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(8 + i * 13, h / 2, 3, 0, 7); x.fill(); } });
    parts.sep = M(RB(CW - .1, .05, 1.0, .02), new THREE.MeshStandardMaterial({ map: sepTex.tex, transparent: true, opacity: .85 }), { pos: [0, Y.sep, 0] });
    Object.values(parts).forEach(p => g.add(p));
    if (o.labels !== false) {
      parts.lg = textSign(1.35, .32, 'GRAPHITE', { color: 0x3a3f4f, fg: '#ffffff', size: 46, depth: .06 }); parts.lg.position.set(-.75, Y.gTop + .3, .6);
      parts.ls = textSign(1.4, .3, 'SEPARATOR', { color: 0xffd36e, fg: '#5a3d00', size: 44, depth: .06 }); parts.ls.position.set(.75, Y.sep + .32, .6);
      parts.lo = textSign(1.55, .32, 'METAL OXIDE', { color: 0x2f8fb8, fg: '#ffffff', size: 44, depth: .06 }); parts.lo.position.set(-.7, Y.cTop + .3, .6);
      [parts.lg, parts.ls, parts.lo].forEach(l => g.add(l));
    }
    g.userData = parts; return g;
  }
  // lithium ions: glowing lime balls with eyes; k=0 home in the oxide, k=1 tucked between graphite layers
  function ions(n = 16, seed = 4) {
    const g = new THREE.Group(), r = rng(seed), list = [];
    for (let i = 0; i < n; i++) {
      const b = new THREE.Group(); b.add(M(SPH(.11, 20, 14), glowM(0xb6ff5c, 1.6), { shadow: false }));
      [-1, 1].forEach(s => b.add(M(SPH(.022, 8, 6), new THREE.MeshBasicMaterial({ color: 0x14320a }), { pos: [s * .04, .02, .1], shadow: false })));
      const x = -1.3 + (i % 8) * .37 + r() * .05, lane = Math.floor(i / 8);
      b.userData = { from: V(x, 1.2 + lane * .32, .62), to: V(x + (r() - .5) * .1, Y.gBot + .15 + (i % 4) * .2, .55), ph: r() * 6, delay: r() * .35 };
      g.add(b); list.push(b);
    }
    g.place = (k, s, swim = 0) => list.forEach(b => { const u = b.userData, kk = ease(clamp((k - u.delay * (k > 0 && k < 1 ? 1 : 0)) / (1 - u.delay * .999))), mid = Math.sin(kk * Math.PI);
      b.position.lerpVectors(u.from, u.to, kk); b.position.x += Math.sin(s * 3 + u.ph) * (.05 + mid * .15 + swim * .12); b.position.y += Math.sin(s * 4 + u.ph * 2) * swim * .12; b.rotation.y = Math.sin(s * 2 + u.ph) * .5; });
    g.list = list; return g;
  }
  // electrons on the outside wire: from the oxide round the right side up to the graphite (charging), or back (using)
  function wire(extra) {
    const pts = extra || [V(1.55, Y.cBot + .35, .2), V(2.0, Y.cBot + .35, .2), V(2.0, Y.gTop - .2, .2), V(1.55, Y.gTop - .2, .2)];
    const cur = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .05), g = new THREE.Group();
    g.add(M(new THREE.TubeGeometry(cur, 80, .045, 8), plastic(0xff8a3d)));
    const es = []; for (let i = 0; i < 8; i++) { const e = G(M(SPH(.07, 12, 8), glowM(0xffe14d, 4), { shadow: false }), sprite(0xffe14d, .5, .8)); g.add(e); es.push(e); }
    g.flow = (s, dir, on) => es.forEach((e, i) => { const u = frac(s * .45 * Math.abs(dir) + i / es.length); e.position.copy(cur.getPoint(dir > 0 ? u : 1 - u)); e.visible = on > 0; e.scale.setScalar(on); });
    return g;
  }
  function pctSign(w = 1.5, h = .5) { const g = sign(w, h, () => {}, { color: 0xffffff }); g.setPct = (v, col) => g.userData.redraw((x, cw, ch) => { x.fillStyle = '#fff'; x.fillRect(0, 0, cw, ch); label(x, Math.round(v) + '%', cw / 2, ch / 2 + 4, ch * .62, col ?? '#2ca84a', 900, 'center', MONO); }); return g; }
  // a cute pouch-cell character with a bolt
  function makeCell(col = 0x35c8ef) {
    const g = new THREE.Group(), body = new THREE.Group(); body.position.y = 1.3; g.add(body);
    body.add(M(RB(1.4, 2.1, .55, .26), plastic(col)), M(RB(.5, .16, .3, .06), metal(0xc9cdd8), { pos: [0, 1.1, 0] }));
    const f = screenFace(.95, .62, '#141a2c', '#c8ff8a'); f.position.set(0, .45, .28); body.add(f);
    const bolt = ctex(256, 256, (x) => { x.fillStyle = '#ffe14d'; x.beginPath(); x.moveTo(150, 20); x.lineTo(70, 140); x.lineTo(125, 140); x.lineTo(100, 236); x.lineTo(190, 100); x.lineTo(135, 100); x.closePath(); x.fill(); });
    body.add(M(new THREE.PlaneGeometry(.6, .6), new THREE.MeshBasicMaterial({ map: bolt.tex, transparent: true, toneMapped: false }), { pos: [0, -.42, .285], shadow: false }));
    [-1, 1].forEach(s => g.add(M(SPH(.2, 20, 14), plastic(0x2a3046), { pos: [s * .38, .12, .05], scale: [1, .6, 1.3] })));
    g.userData = { body, face: f }; g.pose = (s, hop = 0) => { body.position.y = 1.3 + Math.sin(s * 3) * .04 + hop; body.rotation.z = Math.sin(s * 1.7) * .04; };
    return g;
  }
  // phone with a battery icon screen
  function batteryPhone(col = 0xff6fb1) {
    const g = new THREE.Group(); g.add(M(RB(1.5, 2.9, .2, .26), plastic(col)));
    const t = ctex(400, 780); const scr = M(new THREE.PlaneGeometry(1.32, 2.6), new THREE.MeshBasicMaterial({ map: t.tex, toneMapped: false }), { pos: [0, 0, .105], shadow: false }); g.add(scr);
    g.draw = (lvl, charging) => t.redraw((x, w, h) => { x.fillStyle = '#141a2c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 14; rrect(x, 100, 230, 200, 340, 30); x.stroke(); x.fillStyle = '#fff'; rrect(x, 160, 200, 80, 30, 8); x.fill();
      const col = lvl < .2 ? '#ff4a4a' : lvl < .5 ? '#ffc44d' : '#5ce06a'; x.fillStyle = col; const hh = 300 * clamp(lvl); rrect(x, 120, 550 - hh, 160, hh, 16); x.fill();
      if (charging) { x.fillStyle = '#ffe14d'; x.beginPath(); x.moveTo(215, 300); x.lineTo(160, 400); x.lineTo(200, 400); x.lineTo(185, 500); x.lineTo(245, 380); x.lineTo(205, 380); x.closePath(); x.fill(); }
      label(x, Math.round(lvl * 100) + '%', w / 2, 660, 90, col, 900); });
    return g;
  }
  const warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 }, cool = { top: '#d6ecff', bottom: '#e6dcff', floor: 0xdcd0ff };

  // ---------- sets ----------
  BUILD.b_hook = () => {
    const st = stage({ top: '#2c3f78', bottom: '#f0a6c4', floor: 0xe7a0bf, rim: 0x9ad8ff, rimI: 2.4 });
    const ph = batteryPhone(); ph.position.set(0, 2.85, 0); st.scene.add(ph);
    const bit = makeBit(); bit.scale.setScalar(.55); bit.position.set(1.15, 0, 1.3); bit.rotation.y = -.4; st.scene.add(bit);
    const sp = sparkles(26, [0, 2.85, .3], 1.6, 0xb6ff5c, 6); st.scene.add(sp);
    const plug = G(M(RB(.5, .7, .4, .1), plastic(0xffffff)), M(RB(.12, .3, .08, .02), metal(0xc9cdd8), { pos: [-.1, .5, 0] }), M(RB(.12, .3, .08, .02), metal(0xc9cdd8), { pos: [.1, .5, 0] }));
    st.scene.add(plug);
    return { ...st, update(t, s) {
      const plugged = seg(t, .3, .42), lvl = t < .4 ? lerp(.04, .01, seg(t, 0, .3)) : lerp(.01, 1, ease(seg(t, .45, .95)));
      ph.draw(lvl, t > .42); ph.rotation.z = (t < .4 ? Math.sin(s * 14) * .02 : 0); plug.position.set(0, lerp(-.8, .95, ease(plugged)), .1); plug.rotation.z = Math.PI;
      sp.visible = t > .45; sp.update(s); bit.pose({ s, sad: t < .4 ? 1 : 0, happy: t > .5 ? 1 : 0, upL: t > .55 ? .8 : 0, upR: t > .55 ? .8 : 0, lookY: -.3 });
      aim(st.cam, [0, 2.8, 9.2], [0, 2.5, 0]); } };
  };
  BUILD.b_title = (p) => {
    const st = stage({ top: '#a6f0d4', bottom: '#fff1b8', floor: 0xffe9a8 });
    st.scene.add(pedestal(1.3, 0xffffff, C.lime)); const c = makeCell(); c.position.y = .4; st.scene.add(c);
    const s1 = textSign(3.6, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 96 }), s2 = textSign(3.4, .72, p.bottom, { color: 0x1d2442, fg: '#b6ff5c', size: 96 });
    s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    const sp = sparkles(18, [0, 2.0, 0], 1.8, 0xffe14d, 2); st.scene.add(sp);
    return { ...st, update(t, s) { c.pose(s, Math.abs(Math.sin(s * 4)) * .12); s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); sp.update(s);
      const a = Math.sin(s * .4) * .2; aim(st.cam, [Math.sin(a) * 10, 2.8, Math.cos(a) * 10], [0, 2.45, 0]); } };
  };
  BUILD.b_layers = () => {
    const st = stage(cool); const c = cell(); st.scene.add(c); const P = c.userData;
    return { ...st, update(t, s) {
      const steps = [[P.graphite, P.lg, .12], [P.oxide, P.lo, .38], [P.liquid, null, .62], [P.sep, P.ls, .78]];
      steps.forEach(([obj, lb, at]) => { const k = t > at ? Math.min(1, pop((t - at) * 5)) : 0; obj.scale.set(1, k, 1); obj.visible = k > 0; if (lb) lb.scale.setScalar(k); });
      P.case.visible = t > .05; c.rotation.y = Math.sin(s * .5) * .15;
      aim(st.cam, [0, 3.0, 9.4], [0, 2.6, 0]); } };
  };
  BUILD.b_ions = () => {
    const st = stage(cool); const c = cell(); st.scene.add(c); const io = ions(); st.scene.add(io);
    const tag = textSign(1.6, .4, 'Li⁺ IONS', { color: C.lime, fg: '#14320a', size: 64 }); tag.position.set(.75, Y.cTop + .55, .9); st.scene.add(tag);
    return { ...st, update(t, s) { io.list.forEach((b, i) => b.scale.setScalar(Math.min(1, pop((t - .05 - i * .02) * 5))));
      const swim = seg(t, .45, .6); io.place(0, s, swim); io.list.slice(0, 6).forEach((b, i) => { b.position.y += Math.sin(s * 1.5 + i) * .4 * swim + .4 * swim; });
      tag.scale.setScalar(t > .25 ? Math.min(1, pop((t - .25) * 5)) : 0);
      aim(st.cam, [lerp(0, .4, t), lerp(3, 2.8, t), lerp(9.4, 8.7, ease(t))], [.15, 2.5, 0]); } };
  };
  BUILD.b_charge = () => {
    const st = stage(warm); const c = cell(); st.scene.add(c); const io = ions(); st.scene.add(io); const w = wire(); st.scene.add(w);
    const plug = G(M(RB(.55, .5, .4, .1), plastic(0xffffff)), M(new THREE.CylinderGeometry(.05, .05, 1.4, 10), plastic(0x2a3046), { pos: [0, .9, 0] })); st.scene.add(plug);
    const pct = pctSign(); pct.position.set(-.95, 5.0, .4); st.scene.add(pct);
    return { ...st, update(t, s) { const k = ease(seg(t, .2, .9)); io.place(k, s); w.flow(s, 1, seg(t, .15, .2));
      plug.position.set(2.0, lerp(6.5, 4.6, ease(seg(t, 0, .15))), .2); pct.setPct(k * 100); pct.scale.setScalar(pop(s - .3));
      aim(st.cam, [.3, 3.0, 9.6], [.2, 2.65, 0]); } };
  };
  BUILD.b_store = () => {
    const st = stage({ top: '#a9ddff', bottom: '#d8f2c2', floor: 0x9dd67f });
    const hill = M(new THREE.SphereGeometry(2.4, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), plastic(0x6fcf6a, { clearcoat: .3 }), { scale: [.75, .9, .6] }); st.scene.add(hill);
    const pool = M(new THREE.CylinderGeometry(.6, .6, .12, 40), new THREE.MeshPhysicalMaterial({ color: 0x5fc8ff, roughness: .05, transparent: true, opacity: .85 }), { pos: [0, 2.17, 0] }); st.scene.add(pool);
    const drops = []; for (let i = 0; i < 10; i++) { const d = M(SPH(.12, 16, 12), plastic(0x5fc8ff, { roughness: .05 }), { shadow: false }); st.scene.add(d); drops.push(d); }
    const pump = G(M(RB(.7, .9, .6, .14), plastic(C.amber)), M(new THREE.CylinderGeometry(.12, .12, .3, 16), metal(0xc9cdd8), { pos: [0, .55, 0] })); pump.position.set(-1.5, .45, 1.0); st.scene.add(pump);
    const lb = textSign(2.2, .44, 'STORED ENERGY', { color: 0x5fc8ff, fg: '#0b3a55', size: 60 }); lb.position.set(0, 3.3, .3); st.scene.add(lb);
    return { ...st, update(t, s) {
      drops.forEach((d, i) => { const u = frac(s * .3 + i / drops.length), th = u * Math.PI / 2 * .93, az = -.45 + Math.sin(u * 5) * .08, k = 1.08;
        d.position.set(1.8 * k * Math.cos(th) * Math.sin(az), 2.16 * k * Math.sin(th) + .05, 1.44 * k * Math.cos(th) * Math.cos(az)); });
      pool.scale.set(lerp(.6, 1, seg(t, .1, .6)), 1, lerp(.6, 1, seg(t, .1, .6))); lb.scale.setScalar(t > .4 ? Math.min(1, pop((t - .4) * 5)) : 0); pump.scale.y = 1 + Math.sin(s * 10) * .04;
      aim(st.cam, [0, 3.0, 9.0], [0, 2.1, 0]); } };
  };
  BUILD.b_discharge = () => {
    const st = stage(cool); const c = cell(); st.scene.add(c); const io = ions(); st.scene.add(io);
    const el = G(M(SPH(.08, 12, 8), glowM(0xffe14d, 4), { shadow: false }), sprite(0xffe14d, .55, .8)); st.scene.add(el);
    const no = textSign(.5, .5, '✕', { color: C.red, fg: '#ffffff', size: 110 }); no.position.set(-.6, Y.sep + .45, .9); st.scene.add(no);
    return { ...st, update(t, s) { const k = 1 - ease(seg(t, .05, .55)); io.place(k, s);
      const b = seg(t, .55, .9), bounce = Math.abs(Math.sin(b * Math.PI * 3)) * .5; el.position.set(-.6, Y.sep + .08 + bounce + (b === 0 ? 1 : 0), .75); el.visible = t > .55;
      no.scale.setScalar(t > .62 ? Math.min(1, pop((t - .62) * 5)) : 0);
      aim(st.cam, [0, 3.0, 9.4], [0, 2.6, 0]); } };
  };
  BUILD.b_circuit = () => {
    const st = stage(warm); const c = cell({ labels: false }); st.scene.add(c); c.position.y = -.25; const io = ions(); io.position.y = -.25; st.scene.add(io);
    const lamp = batteryPhone(0x9b7bff); lamp.scale.setScalar(.38); lamp.position.set(1.55, 4.6, .3); st.scene.add(lamp);
    const pts = [V(-1.55, Y.gTop - .45, .2), V(-2.0, Y.gTop - .45, .2), V(-2.0, 4.6, .2), V(1.2, 4.6, .2), V(1.95, 4.0, .2), V(1.95, Y.cBot + .1, .2), V(1.55, Y.cBot + .1, .2)];
    const w = wire(pts); st.scene.add(w);
    return { ...st, update(t, s) { io.place(1 - ease(seg(t, 0, .9)) * .6, s); w.flow(s, 1, seg(t, .05, .12)); lamp.draw(lerp(.9, .8, t), false); lamp.rotation.z = Math.sin(s * 2) * .04;
      aim(st.cam, [0, 2.9, 10.0], [0, 2.55, 0]); } };
  };
  BUILD.b_gauge = () => {
    const st = stage(cool);
    const chip = G(M(RB(1.8, 1.8, .4, .14), plastic(0x2d3350, { roughness: .25 })));
    for (let i = 0; i < 5; i++) [-1, 1].forEach(sd => { chip.add(M(RB(.1, .3, .1, .03), metal(0xffc44d), { pos: [-.64 + i * .32, sd * 1.0, 0] })); chip.add(M(RB(.3, .1, .1, .03), metal(0xffc44d), { pos: [sd * 1.0, -.64 + i * .32, 0] })); });
    const f = screenFace(1.2, .8, '#141a2c', '#9b7bff'); f.position.set(0, .2, .21); chip.add(f); chip.position.set(0, 1.6, 0); st.scene.add(chip);
    const pct = pctSign(1.9, .62); pct.position.set(0, 3.35, .2); st.scene.add(pct);
    const inS = textSign(.85, .36, 'IN ↑', { color: C.lime, fg: '#14320a', size: 54 }), outS = textSign(.85, .36, 'OUT ↓', { color: C.pink, fg: '#ffffff', size: 54 }), vS = textSign(1.2, .36, '3.85 V', { color: 0xffffff, fg: '#1d2442', size: 54, font: MONO });
    inS.position.set(-1.35, 4.3, .2); outS.position.set(1.35, 4.3, .2); vS.position.set(0, 4.3, .2); st.scene.add(inS, outS, vS);
    return { ...st, update(t, s) { const v = lerp(100, 73, ease(seg(t, .1, .9))); pct.setPct(v, v > 50 ? '#2ca84a' : '#c48a00'); pct.scale.setScalar(pop(s - .1));
      inS.scale.setScalar(pop(s - .3) * (.9 + .1 * Math.sin(s * 5))); outS.scale.setScalar(pop(s - .45) * (.9 + .1 * Math.sin(s * 5 + 2))); vS.scale.setScalar(t > .5 ? Math.min(1, pop((t - .5) * 5)) : 0);
      vS.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, lerp(4.2, 3.85, ease(seg(t, .5, .9))).toFixed(2) + ' V', w / 2, h / 2 + 3, h * .6, '#1d2442', 900, 'center', MONO); });
      chip.rotation.y = Math.sin(s * .8) * .2; aim(st.cam, [0, 2.7, 9.2], [0, 2.45, 0]); } };
  };
  BUILD.b_wear = () => {
    const st = stage(warm); const c = cell(); st.scene.add(c); const io = ions(); st.scene.add(io);
    const crust = new THREE.Group(), r = rng(13), bumps = []; st.scene.add(crust);
    for (let i = 0; i < 40; i++) { const b = M(SPH(.07 + r() * .07, 12, 8), matte(0x8a6a4a), { pos: [-1.4 + r() * 2.8, Y.gBot - .05 - r() * .1, .1 + r() * .45], shadow: false }); crust.add(b); bumps.push([b, r()]); }
    const stuck = [0, 3, 6, 10, 13];
    return { ...st, update(t, s) { const g = seg(t, .1, .8);
      bumps.forEach(([b, ph]) => b.scale.setScalar(clamp((g - ph * .7) * 4)));
      io.place(.5 + .5 * Math.sin(s * 1.2), s);
      stuck.forEach((i, j) => { const b = io.list[i], k = seg(t, .25 + j * .1, .35 + j * .1); if (k > 0) { b.position.set(-1.2 + j * .6, Y.gBot - .12, .6); b.children[0].material.emissive.setHex(k > .5 ? 0x777777 : 0xb6ff5c); b.children[0].material.emissiveIntensity = lerp(1.6, .5, k); } });
      aim(st.cam, [.3, 3.4, lerp(8.6, 7.6, t)], [0, 3.0, 0]); } };
  };
  BUILD.b_cycles = () => {
    const st = stage(cool);
    const shell = M(RB(1.6, 3.2, .6, .2), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .25, roughness: .05, depthWrite: false }), { pos: [0, 2.3, 0], shadow: false }); st.scene.add(shell);
    st.scene.add(M(RB(.6, .2, .4, .06), metal(0xc9cdd8), { pos: [0, 4.0, 0] }));
    const fill = M(RB(1.36, 1, .42, .1), plastic(0x5ce06a), {}); st.scene.add(fill);
    const pct = pctSign(1.6, .55); pct.position.set(0, 1.0, 1.0); st.scene.add(pct);
    const cyc = sign(2.6, .5, () => {}, { color: 0xffffff }); cyc.position.set(0, 4.65, .2); st.scene.add(cyc);
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .85)), v = lerp(100, 80, k), h = 2.95 * v / 100;
      fill.scale.y = h; fill.position.set(0, .85 + h / 2, 0); fill.material.color.setHex(v > 90 ? 0x5ce06a : 0x9bd94a); pct.setPct(v, '#2ca84a'); pct.scale.setScalar(pop(s - .1));
      cyc.userData.redraw((x, w, h2) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h2); label(x, Math.round(lerp(0, 1000, k)) + ' charge cycles', w / 2, h2 / 2 + 4, h2 * .55, '#1d2442', 900, 'center', MONO); }); cyc.scale.setScalar(pop(s - .2));
      shell.rotation.y = Math.sin(s * .6) * .2; aim(st.cam, [0, 2.8, 9.2], [0, 2.6, 0]); } };
  };
  BUILD.b_heat = () => {
    const st = stage({ top: '#ffb35c', bottom: '#ffdd9c', floor: 0xffcf85, key: 0xffd28a, keyI: 3 });
    const sun = G(M(SPH(.7, 32, 24), glowM(0xffd23f, 2.2), { shadow: false }), sprite(0xffb020, 3.5, .7)); sun.position.set(1.3, 4.6, -1.5); st.scene.add(sun);
    const ph = makePhone(0xff6fb1, 'sad'); ph.scale.setScalar(1.6); ph.position.set(-.3, 2.1, .3); st.scene.add(ph);
    const heat = waves(0xff7a3d, 4, 2.2, .9, .04); heat.position.set(-.3, 2.1, .2); st.scene.add(heat);
    const therm = G(M(new THREE.CylinderGeometry(.12, .12, 2.0, 16), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .4, roughness: .05 })), M(SPH(.22, 20, 14), glowM(0xff3b3b, 1.5), { pos: [0, -1.05, 0] }));
    const merc = M(new THREE.CylinderGeometry(.07, .07, 1, 12), glowM(0xff3b3b, 1.5), {}); therm.add(merc); therm.position.set(1.35, 2.0, .6); st.scene.add(therm);
    const drops = [0, 1, 2].map(i => { const d = M(SPH(.08, 12, 8), plastic(0x7fd8ff, { roughness: .05 }), { scale: [1, 1.4, 1], shadow: false }); st.scene.add(d); return d; });
    return { ...st, update(t, s) { const h = seg(t, .05, .7); merc.scale.y = lerp(.4, 1.8, h); merc.position.y = -1 + merc.scale.y / 2; heat.update(s, h); sun.rotation.z = s * .3; sun.scale.setScalar(1 + Math.sin(s * 3) * .04);
      ph.rotation.z = Math.sin(s * 10) * .03 * h; drops.forEach((d, i) => { const u = frac(s * .5 + i / 3); d.position.set(-.85 + i * .5, 3.2 - u * 1.2, .5); d.visible = h > .3; });
      aim(st.cam, [0, 2.7, 9.2], [0, 2.5, 0]); } };
  };
  BUILD.b_range = () => {
    const st = stage(cool);
    const bar = new THREE.Group(); bar.position.set(0, 2.2, 0); st.scene.add(bar);
    [[-1.5, .6, 0xff6b6b], [0, 2.4, 0x5ce06a], [1.5, .6, 0xff6b6b]].forEach(([x, w, c], i) => bar.add(M(RB(w, .4, .5, .12), plastic(c), { pos: [i === 0 ? -1.5 : i === 2 ? 1.5 : 0, 0, 0] })));
    const ticks = [['0%', -1.8], ['20%', -1.2], ['80%', 1.2], ['100%', 1.8]].map(([l, x]) => { const s = textSign(.62, .28, l, { color: 0xffffff, fg: '#1d2442', size: 46, font: MONO, depth: .05 }); s.position.set(x, 1.65, .3); st.scene.add(s); return s; });
    const c = makeCell(); c.scale.setScalar(.6); st.scene.add(c);
    const happy = textSign(1.6, .42, 'HAPPY ZONE', { color: 0x5ce06a, fg: '#14320a', size: 60 }); happy.position.set(0, 4.55, .3); st.scene.add(happy);
    let mood = ''; const setM = c.userData.face.userData.set;
    return { ...st, update(t, s) { const x = t < .3 ? lerp(0, 1.65, ease(seg(t, .05, .25))) : t < .6 ? lerp(1.65, -1.65, ease(seg(t, .32, .52))) : lerp(-1.65, 0, ease(seg(t, .62, .8)));
      c.position.set(x, 2.4, .1); c.pose(s); const m = Math.abs(x) > 1.2 ? 'sad' : 'smile'; if (m !== mood) { setM(m); mood = m; }
      happy.scale.setScalar(t > .8 ? Math.min(1, pop((t - .8) * 5)) : 0); aim(st.cam, [0, 2.8, 9.4], [0, 2.6, 0]); } };
  };
  BUILD.b_fast = () => {
    const st = stage(warm);
    const board = M(RB(3.6, 3.0, .15, .14), plastic(0xffffff), { pos: [0, 2.7, -.2] }); st.scene.add(board);
    const f = x => x < .35 ? x / .35 * .55 : .55 + (1 - Math.exp(-(x - .35) * 3.2)) * .47;
    const N = 80, pts = []; for (let i = 0; i <= N; i++) { const x = i / N; pts.push(V(-1.5 + x * 3.0, 1.45 + f(x) * 2.4, -.05)); }
    const curve = new THREE.CatmullRomCurve3(pts); const line = M(new THREE.TubeGeometry(curve, 160, .06, 8), glowM(C.cyan, 2.2), { shadow: false }); st.scene.add(line);
    st.scene.add(M(RB(3.1, .04, .04, .01), matte(0x9aa3bd), { pos: [0, 1.43, -.05] }), M(RB(.04, 2.6, .04, .01), matte(0x9aa3bd), { pos: [-1.52, 2.7, -.05] }));
    const dot = G(M(SPH(.12, 16, 12), glowM(0xffe14d, 4), { shadow: false }), sprite(0xffe14d, .6, .9)); st.scene.add(dot);
    const l1 = textSign(1.3, .36, 'FAST', { color: C.lime, fg: '#14320a', size: 56 }), l2 = textSign(1.3, .36, 'SLOWER', { color: C.amber, fg: '#4a2a00', size: 56 }), stop = textSign(1.7, .4, 'STOP AT 80%', { color: C.pink, fg: '#ffffff', size: 56 });
    l1.position.set(-1.0, 3.6, .2); l2.position.set(.9, 4.55, .2); stop.position.set(.6, .75, .6); st.scene.add(l1, l2, stop);
    const y80 = 1.45 + .8 * 2.4, mark = M(RB(3.0, .03, .03, .01), glowM(C.pink, 2), { pos: [0, y80, 0], shadow: false }); st.scene.add(mark);
    return { ...st, update(t, s) { const k = seg(t, .05, .7); line.geometry.setDrawRange(0, Math.floor(k * line.geometry.index.count / 6) * 6); dot.position.copy(curve.getPoint(k));
      l1.scale.setScalar(t > .2 ? Math.min(1, pop((t - .2) * 5)) : 0); l2.scale.setScalar(t > .5 ? Math.min(1, pop((t - .5) * 5)) : 0);
      mark.visible = t > .72; stop.scale.setScalar(t > .74 ? Math.min(1, pop((t - .74) * 5)) : 0);
      aim(st.cam, [0, 2.8, 9.2], [0, 2.6, 0]); } };
  };
}
