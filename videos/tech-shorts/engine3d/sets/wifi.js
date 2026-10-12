// Sets for Tech Shorts episode 2: How Wi-Fi Actually Works.
export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, critter, pedestal, confetti, sparkles, speech, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;

  // ---------- props ----------
  // expanding wave rings: additive glowing tori that grow from a point and fade
  function waves(color, n = 5, R = 3, rate = .7, thick = .045) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) g.add(new THREE.Mesh(new THREE.TorusGeometry(1, thick, 8, 96), new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));
    g.update = (s, strength = 1, reach = 1) => g.children.forEach((r, i) => { const ph = frac(s * rate + i / n); r.scale.setScalar(.25 + ph * R * reach); r.material.opacity = (1 - ph) * strength * .95; r.visible = strength > .01; });
    return g;
  }
  // a face drawn on a screen: two eyes and a mouth
  function faceTex(bg, eye, mood = 'smile') {
    return ctex(256, 256, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = eye; x.strokeStyle = eye; x.lineWidth = 12; x.lineCap = 'round';
      if (mood === 'dizzy') [-1, 1].forEach(s => { x.beginPath(); x.moveTo(128 + s * 50 - 18, 90); x.lineTo(128 + s * 50 + 18, 126); x.moveTo(128 + s * 50 + 18, 90); x.lineTo(128 + s * 50 - 18, 126); x.stroke(); });
      else [-1, 1].forEach(s => { rrect(x, 128 + s * 50 - 15, 82, 30, 50, 15); x.fill(); });
      x.beginPath(); if (mood === 'sad' || mood === 'dizzy') x.arc(128, 200, 30, Math.PI * 1.15, Math.PI * 1.85); else x.arc(128, 160, 34, Math.PI * .15, Math.PI * .85); x.stroke(); });
  }
  function screenFace(w, h, bg, eye, mood) { const f = faceTex(bg, eye, mood); const m = M(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: f.tex, toneMapped: false }), { shadow: false }); m.userData.set = md => f.redraw((x, cw, ch) => { const t = faceTex(bg, eye, md); x.drawImage(t.tex.image, 0, 0); }); return m; }

  // Rudy the router: white box, three antennas, a face strip
  function makeRouter(o = {}) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.position.y = .42;
    body.add(M(RB(1.9, .62, 1.2, .2), plastic(o.color ?? 0xffffff)));
    const face = screenFace(1.2, .42, '#141a2c', '#5ff3ff'); face.position.set(0, .02, .605); body.add(face);
    const leds = [0, 1, 2, 3].map(i => { const l = M(SPH(.04, 10, 8), glowM(i % 2 ? C.lime : C.cyan, 3), { pos: [-.75 + i * .08, -.2, .6], shadow: false }); body.add(l); return l; });
    const ants = [-.65, 0, .65].map((x, i) => { const a = new THREE.Group(); a.position.set(x, .3, -.35); a.add(M(new THREE.CapsuleGeometry(.06, .9, 6, 12), plastic(0x2a3046), { pos: [0, .5, 0] }), M(SPH(.1, 16, 12), glowM(C.cyan, 2.5), { pos: [0, 1.05, 0] })); body.add(a); return a; });
    [-1, 1].forEach(s => root.add(M(new THREE.CylinderGeometry(.14, .17, .12, 20), plastic(0x2a3046), { pos: [s * .7, .06, 0] })));
    root.userData = { face, ants, body };
    root.pose = (p = {}) => { const s = p.s ?? 0; body.position.y = .42 + Math.abs(Math.sin(s * 3)) * .03 * (p.bounce ?? 1);
      ants.forEach((a, i) => a.rotation.z = Math.sin(s * 4 + i) * .06 * (p.wiggle ?? 1) + (i - 1) * .18 * (p.spread ?? 1)); leds.forEach((l, i) => l.material.emissiveIntensity = Math.sin(s * 9 + i * 2) > 0 ? 3 : .3); };
    root.pose(); return root;
  }
  // devices with faces
  function makePhone(col = 0xff6fb1, mood = 'smile') {
    const g = new THREE.Group(); g.add(M(RB(.78, 1.45, .14, .14), plastic(col)));
    const f = screenFace(.62, 1.2, '#141a2c', '#9df7ff', mood); f.position.z = .072; g.add(f); g.userData.face = f; return g;
  }
  function makeLaptopBuddy(col = 0x9b7bff) {
    const g = new THREE.Group(); g.add(M(RB(1.4, .1, .95, .05), metal(0xc9cdd8), { pos: [0, .05, 0] }));
    const lid = new THREE.Group(); lid.position.set(0, .1, -.45); lid.rotation.x = -.18; g.add(lid); lid.add(M(RB(1.4, .92, .07, .05), plastic(col), { pos: [0, .46, 0] }));
    const f = screenFace(1.22, .76, '#141a2c', '#c8ff8a'); f.position.set(0, .46, .04); lid.add(f); g.userData.face = f; return g;
  }
  function makeTV(col = 0x2a3046) {
    const g = new THREE.Group(); g.add(M(RB(1.9, 1.15, .12, .08), plastic(col), { pos: [0, .85, 0] }), M(new THREE.CylinderGeometry(.05, .05, .3, 10), metal(0xc9cdd8), { pos: [0, .15, 0] }), M(RB(.7, .05, .35, .02), metal(0xc9cdd8), { pos: [0, .02, 0] }));
    const f = screenFace(1.75, 1.0, '#1b3a6b', '#ffd36e'); f.position.set(0, .85, .065); g.add(f); g.userData.face = f; return g;
  }
  function makeSpeaker(col = 0xffc44d) {
    const g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(.38, .4, 1.1, 40), plastic(col), { pos: [0, .55, 0] }), M(new THREE.TorusGeometry(.3, .03, 8, 40), glowM(C.cyan, 2), { pos: [0, 1.12, 0], rot: [Math.PI / 2, 0, 0], shadow: false }));
    [-1, 1].forEach(s => g.add(M(new THREE.CapsuleGeometry(.05, .08, 4, 10), matte(0x141a2c), { pos: [s * .12, .75, .38], shadow: false })));
    return g;
  }
  // a cutaway room: floor slab, back wall, side wall
  function room(o = {}) {
    const g = new THREE.Group(), w = o.w ?? 3.6, d = o.d ?? 2.6;
    g.add(M(RB(w, .2, d, .06), matte(o.floor ?? 0xe8c49a), { pos: [0, -.1, 0] }));
    g.add(M(RB(w, o.h ?? 2.6, .18, .06), matte(o.wall ?? 0xfff1e0), { pos: [0, (o.h ?? 2.6) / 2, -d / 2] }));
    if (o.side !== false) g.add(M(RB(.18, o.h ?? 2.6, d, .06), matte(o.wall2 ?? 0xffe2c4), { pos: [-w / 2, (o.h ?? 2.6) / 2, 0] }));
    return g;
  }
  function house(col, roofCol, s = 1) {
    const g = new THREE.Group(); g.add(M(RB(2.2, 1.6, 1.8, .12), plastic(col), { pos: [0, .8, 0] }));
    const roof = M(new THREE.ConeGeometry(1.75, 1.0, 4), plastic(roofCol), { pos: [0, 2.1, 0], rot: [0, Math.PI / 4, 0], scale: [1, 1, .82] }); g.add(roof);
    g.add(M(RB(.5, .8, .06, .05), plastic(0x8a5a3c), { pos: [-.45, .4, .91] }), M(RB(.55, .45, .06, .05), glowM(0xffd36e, .8), { pos: [.45, 1.0, .91] }));
    g.scale.setScalar(s); return g;
  }
  // a glowing sine ribbon along x, scrolling with time
  function ribbon(color, len, amp, k, radius = .05) {
    const N = 220, pts = []; for (let i = 0; i <= N; i++) pts.push(V(0, 0, 0));
    const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, radius, 8);
    const mesh = M(geo, glowM(color, 2.4), { shadow: false });
    mesh.update = (s, f = (x, s) => Math.sin(x * k - s * 6) * amp) => { const p = []; for (let i = 0; i <= N; i++) { const x = -len / 2 + len * i / N; p.push(V(x, f(x, s), 0)); }
      mesh.geometry.dispose(); mesh.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p), N, radius, 8); };
    return mesh;
  }
  const sky = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };

  // ---------- sets ----------
  BUILD.w_room = () => {
    const st = stage({ top: '#ffd9b0', bottom: '#f7b48e', floor: 0xe9a57c });
    const rm = room({ w: 3.8, d: 3.0, h: 3.0 }); rm.position.set(0, 0, -.6); st.scene.add(rm);
    const couch = G(M(RB(2.0, .5, .9, .2), plastic(0x5f8cff), { pos: [0, .45, 0] }), M(RB(2.0, .7, .3, .14), plastic(0x5f8cff), { pos: [0, .85, -.35] }), M(RB(.3, .55, .9, .12), plastic(0x4d78e8), { pos: [-1.05, .55, 0] }), M(RB(.3, .55, .9, .12), plastic(0x4d78e8), { pos: [1.05, .55, 0] }));
    couch.position.set(.3, 0, -.5); st.scene.add(couch);
    const shelf = M(RB(1.2, .1, .5, .03), plastic(0xffffff), { pos: [-1.1, 2.15, -1.8] }); st.scene.add(shelf);
    const router = makeRouter(); router.scale.setScalar(.45); router.position.set(-1.1, 2.2, -1.8); st.scene.add(router);
    const bit = makeBit(); bit.scale.setScalar(.52); bit.position.set(.45, .68, -.45); st.scene.add(bit);
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(.35); ph.position.set(.55, 1.15, .05); ph.rotation.x = -.3; st.scene.add(ph);
    const plant = G(M(new THREE.CylinderGeometry(.25, .2, .45, 20), plastic(0xff7a59), { pos: [1.5, .22, .3] }), M(SPH(.42, 20, 14), plastic(0x55c271), { pos: [1.5, .8, .3] })); st.scene.add(plant);
    const wv = waves(C.cyan, 6, 5.5, .45, .03); wv.position.set(-1.1, 2.55, -1.6); st.scene.add(wv);
    return { ...st, update(t, s) { router.pose({ s }); bit.pose({ s, reachR: .5, reachL: .5, lookX: .3 }); wv.update(s, seg(t, 0, .1)); ph.rotation.z = Math.sin(s * 2) * .04;
      aim(st.cam, [lerp(1.0, .4, t), 2.7, lerp(7.6, 6.9, t)], [0, 1.55, -.8]); } };
  };
  BUILD.w_title = (p) => {
    const st = stage({ top: '#8fd3ff', bottom: '#d7c4ff', floor: 0xcdb8ff });
    st.scene.add(pedestal(1.4, 0xffffff, C.cyan)); const router = makeRouter(); router.position.y = .4; router.scale.setScalar(1.05); st.scene.add(router);
    const s1 = textSign(3.3, .9, p.top, { color: 0xffffff, fg: '#1d2442' }), s2 = textSign(3.5, .72, p.bottom, { color: 0x1d2442, fg: '#5ff3ff', size: 96 });
    s1.position.set(0, 4.6, 0); s2.position.set(0, 3.7, .2); st.scene.add(s1, s2);
    const wv = waves(C.cyan, 5, 3.2, .6); wv.position.set(0, 1.6, -.3); st.scene.add(wv);
    return { ...st, update(t, s) { router.pose({ s }); wv.update(s); s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .3)); s1.rotation.z = Math.sin(s * 1.6) * .02;
      const a = Math.sin(s * .35) * .2; aim(st.cam, [Math.sin(a) * 10, 2.8, Math.cos(a) * 10], [0, 2.4, 0]); } };
  };
  BUILD.w_cable = () => {
    const st = stage({ top: '#cfe9ff', bottom: '#ffe1c2', floor: 0xffd8b0 });
    const globe = G(M(SPH(.75, 48, 32), plastic(0x3d8bff)), ...[[.3, .35, .55], [-.35, -.1, .6], [.1, -.45, .55]].map(([x, y, z]) => M(SPH(.28, 20, 14), plastic(0x58c46a), { pos: [x, y, z], scale: [1.2, .8, .5] })));
    globe.position.set(-1.1, 1.0, .6); st.scene.add(globe);
    const gl = textSign(1.6, .42, 'INTERNET', { color: 0x3d8bff, fg: '#ffffff', size: 60 }); gl.position.set(-1.1, 2.1, .7); st.scene.add(gl);
    const cur = new THREE.CatmullRomCurve3([V(-1.1, .25, .6), V(-.6, .12, 1.2), V(.4, .12, .9), V(.9, .15, -.2), V(.9, 2.3, -.7), V(.9, 2.8, -.7)]);
    st.scene.add(M(new THREE.TubeGeometry(cur, 120, .09, 12), plastic(0x2a3046)));
    const pulses = [0, 1, 2, 3, 4].map(() => { const g = G(M(SPH(.12, 16, 12), glowM(0xbffcff, 6), { shadow: false }), sprite(0x6ff0ff, .9, .9)); st.scene.add(g); return g; });
    const shelf = M(RB(1.6, .12, .9, .04), plastic(0xffffff), { pos: [.75, 2.8, -.7] }); st.scene.add(shelf);
    const router = makeRouter(); router.scale.setScalar(.6); router.position.set(.75, 2.86, -.6); st.scene.add(router);
    const rl = textSign(1.3, .4, 'ROUTER', { color: 0xffffff, fg: '#1d2442', size: 58 }); rl.position.set(.75, 4.25, -.5); st.scene.add(rl);
    return { ...st, update(t, s) { globe.rotation.y = s * .4; pulses.forEach((g, i) => g.position.copy(cur.getPoint(frac(s * .35 + i / 5))));
      router.pose({ s }); gl.scale.setScalar(pop(s - .1)); rl.scale.setScalar(t > .45 ? Math.min(1.1, pop((t - .45) * 5)) : 0);
      aim(st.cam, [0, 2.6, lerp(9.4, 8.9, t)], [0, 2.1, 0]); } };
  };
  BUILD.w_radio = () => {
    const st = stage({ top: '#b9e6ff', bottom: '#e8d4ff', floor: 0xdcc6ff });
    const router = makeRouter(); router.scale.setScalar(1.25); st.scene.add(router);
    const bits = []; const r = rng(3);
    for (let i = 0; i < 14; i++) { const b = textSign(.34, .34, r() < .5 ? '0' : '1', { color: [C.cyan, C.lime, C.amber][i % 3], fg: '#1d2442', font: MONO, size: 70, depth: .12 }); st.scene.add(b); bits.push([b, r()]); }
    const wvs = [-.81, 0, .81].map(x => { const w = waves(C.cyan, 4, 2.6, .8, .035); w.position.set(x, 2.15, -.4); st.scene.add(w); return w; });
    return { ...st, update(t, s) { router.pose({ s, wiggle: 2 });
      bits.forEach(([b, ph], i) => { const k = frac(s * .5 + ph); b.position.set(lerp(-1.8 + ph * .6, 0, ease(k)), lerp(.3 + ph * 1.2, .6, ease(k)), lerp(1.8, .5, k)); b.scale.setScalar((1 - k) * .9); b.rotation.y = s * 2 + ph * 6; });
      wvs.forEach((w, i) => w.update(s + i * .3, seg(t, .3, .45)));
      aim(st.cam, [0, 2.5, lerp(9, 8.4, t)], [0, 1.95, 0]); } };
  };
  BUILD.w_wave = () => {
    const st = stage({ top: '#2a3c7a', bottom: '#7a5cc4', floor: 0x6a50b0, hemi: .8 });
    const r1 = ribbon(C.cyan, 3.8, .45, 3.2), r2 = ribbon(C.pink, 3.8, .32, 6.6); r1.position.set(0, 3.7, 0); r2.position.set(0, 2.25, 0); st.scene.add(r1, r2);
    const bit = makeBit(); bit.scale.setScalar(.3); st.scene.add(bit);
    const board = M(RB(.9, .06, .32, .03), plastic(C.amber), {}); st.scene.add(board);
    const l1 = textSign(1.5, .44, '2.4 GHz', { color: 0xffffff, fg: '#0a8fb5', font: MONO, size: 66 }), l2 = textSign(1.5, .44, '5 GHz', { color: 0xffffff, fg: '#d42f7f', font: MONO, size: 66 });
    l1.position.set(-1.0, 4.45, .2); l2.position.set(-1.0, 2.95, .2); st.scene.add(l1, l2);
    const cnt = sign(2.9, .7, () => {}, { color: 0xffffff }); cnt.position.set(0, 1.2, .8); st.scene.add(cnt);
    return { ...st, update(t, s) {
      r1.update(s); r2.visible = t > .55; if (r2.visible) r2.update(s);
      const bx = .6, by = 3.7 + Math.sin(bx * 3.2 - s * 6) * .45, slope = Math.cos(bx * 3.2 - s * 6) * .45 * 3.2;
      bit.position.set(bx, by + .12, .1); board.position.set(bx, by + .08, .1); board.rotation.z = Math.atan(slope) * .8; bit.rotation.z = Math.atan(slope) * .5; bit.pose({ s, upL: .6, upR: .6, happy: .7 });
      l1.scale.setScalar(pop(s - .2)); l2.scale.setScalar(t > .55 ? Math.min(1, pop((t - .55) * 5)) : 0);
      const n = t < .55 ? Math.round(lerp(0, 2.4e9, ease(seg(t, .1, .5)))) : Math.round(lerp(2.4e9, 5e9, ease(seg(t, .6, .9))));
      cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.font = `900 66px ${MONO}`; label(x, n.toLocaleString('en-US') + ' / s', w / 2, h / 2 + 4, 66, t < .55 ? '#0a8fb5' : '#d42f7f', 900, 'center', MONO); }); cnt.scale.setScalar(pop(s - .3));
      aim(st.cam, [0, 2.7, 9.2], [0, 2.45, 0]); } };
  };
  BUILD.w_bits = () => {
    const st = stage({ top: '#2a3c7a', bottom: '#7a5cc4', floor: 0x6a50b0, hemi: .8 });
    const rb = ribbon(C.cyan, 3.8, 1, 5.5, .055); rb.position.set(0, 2.5, 0); st.scene.add(rb);
    const codes = ['01', '11', '10', '00'], amps = [.35, .7, .5, .2], shifts = [0, 0, Math.PI, Math.PI];
    const tags = codes.map((c, i) => { const g = textSign(.78, .44, c, { color: [C.lime, C.amber, C.pink, C.violet][i], fg: '#1d2442', font: MONO, size: 76 }); g.position.set(-1.425 + i * .95, 3.75, .2); st.scene.add(g); return g; });
    const dividers = [1, 2, 3].map(i => { const d = M(RB(.03, 1.8, .03, .01), matte(0xffffff, { transparent: true, opacity: .35 }), { pos: [-1.9 + i * .95, 2.5, 0], shadow: false }); st.scene.add(d); return d; });
    return { ...st, update(t, s) {
      const shown = Math.floor(seg(t, .15, .8) * 4.99);
      rb.update(s * .25, (x, ss) => { const i = clamp(Math.floor((x + 1.9) / .95), 0, 3); return Math.sin(x * 6.6 + shifts[i] - ss * 6) * amps[i]; });
      tags.forEach((g, i) => g.scale.setScalar(i < shown ? Math.min(1, pop((t - .15 - i * .16) * 5)) : 0));
      aim(st.cam, [0, 2.7, 9.2], [0, 2.45, 0]); } };
  };
  BUILD.w_phone = () => {
    const st = stage(sky);
    const router = makeRouter(); router.scale.setScalar(.7); router.position.set(-.9, 2.6, -2.2); st.scene.add(router);
    const ped = M(new THREE.CylinderGeometry(.6, .7, 2.6, 32), plastic(0xffffff), { pos: [-.9, 1.3, -2.2] }); st.scene.add(ped);
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(1.3); ph.position.set(.65, 1.7, 1.0); ph.rotation.y = -.35; st.scene.add(ph);
    const out = waves(C.cyan, 5, 4.2, .55), back = waves(C.pink, 4, 3.6, .7); out.position.set(-.9, 3.3, -2.0); back.position.set(.65, 1.9, 1.05); st.scene.add(out, back);
    const bits = []; const r = rng(8); for (let i = 0; i < 10; i++) { const b = textSign(.26, .26, r() < .5 ? '0' : '1', { color: C.lime, fg: '#1d2442', font: MONO, size: 66, depth: .1 }); st.scene.add(b); bits.push([b, r()]); }
    return { ...st, update(t, s) { router.pose({ s }); out.update(s, 1 - seg(t, .7, .8)); back.update(s, seg(t, .72, .82));
      ph.rotation.z = Math.sin(s * 3) * .05; ph.position.y = 1.7 + Math.sin(s * 2) * .05;
      bits.forEach(([b, ph0]) => { const k = frac(s * .6 + ph0), on = seg(t, .3, .4) * (1 - seg(t, .7, .75)); b.position.set(.65 + Math.sin(ph0 * 9) * .4 + k * .6, 2.6 + k * 1.8, 1.2); b.scale.setScalar(on * (1 - k)); });
      aim(st.cam, [.2, 2.7, 9.4], [0, 2.4, 0]); } };
  };
  function crowdSet(mode) {
    const st = stage({ top: '#d3ecff', bottom: '#ffd9ec', floor: 0xffd0e6 });
    const router = makeRouter(); router.scale.setScalar(.8); router.position.set(0, 2.2, -1); st.scene.add(router);
    st.scene.add(M(new THREE.CylinderGeometry(.55, .65, 2.2, 32), plastic(0xffffff), { pos: [0, 1.1, -1] }));
    const devs = [[makePhone(0xff6fb1), [-1.3, 3.9, .3], .7, C.pink], [makeLaptopBuddy(), [1.15, 3.6, .2], .75, C.violet], [makeTV(), [-1.15, .3, .6], .65, C.amber], [makeSpeaker(), [1.3, .25, .8], .75, C.lime]];
    const wv = devs.map(([d, pos, sc, col]) => { d.position.set(...pos); d.scale.setScalar(sc); st.scene.add(d); const w = waves(col, 4, 1.8, 1.1, .04); w.position.set(pos[0], pos[1] + .5, pos[2] + .2); st.scene.add(w); return w; });
    return { st, router, devs, wv };
  }
  BUILD.w_crowd = () => {
    const { st, router, devs, wv } = crowdSet(); const set = router.userData.face.userData.set; let mood = '';
    return { ...st, update(t, s) { const chaos = seg(t, .3, .45); wv.forEach((w, i) => w.update(s * (1 + i * .23), chaos));
      router.pose({ s, wiggle: 1 + chaos * 4 }); router.rotation.z = Math.sin(s * 9) * .05 * chaos; const m = chaos > .5 ? 'dizzy' : 'smile'; if (m !== mood) { set(m); mood = m; }
      devs.forEach(([d], i) => { d.rotation.z = Math.sin(s * 6 + i) * .06 * chaos; d.position.y += 0; });
      aim(st.cam, [0, 2.7, 9.6], [0, 2.35, 0]); } };
  };
  BUILD.w_turns = () => {
    const { st, router, devs, wv } = crowdSet();
    const multi = textSign(2.6, .5, 'NEWER ROUTERS: SEVERAL AT ONCE', { color: C.lime, fg: '#1d2442', size: 46 }); multi.position.set(0, 4.68, .4); st.scene.add(multi);
    const halos = devs.map(([d, pos]) => { const h = M(new THREE.TorusGeometry(.75, .04, 8, 48), glowM(C.lime, 3), { shadow: false }); h.position.set(pos[0], pos[1] + .5, pos[2] - .1); st.scene.add(h); return h; });
    return { ...st, update(t, s) { router.pose({ s });
      const turn = Math.floor(seg(t, .05, .62) * 4), all = t > .66;
      wv.forEach((w, i) => w.update(s * 1.2, all ? 1 : (i === turn && t < .62 ? 1 : 0)));
      halos.forEach((h, i) => { h.visible = all || (i === turn && t < .62); h.rotation.z = s; });
      multi.scale.setScalar(all ? Math.min(1, pop((t - .66) * 5)) : 0);
      aim(st.cam, [0, 2.7, 9.6], [0, 2.35, 0]); } };
  };
  BUILD.w_open = () => {
    const st = stage({ top: '#a9ddff', bottom: '#d8f2c2', floor: 0x9dd67f, shadowBox: 9 });
    const h1 = house(0xfff1e0, 0xff6b5b, 1), h2 = house(0xe2ecff, 0x5b8cff, 1); h1.position.set(-1.2, 0, -1.2); h2.position.set(1.4, 0, -3.4); st.scene.add(h1, h2);
    const router = makeRouter(); router.scale.setScalar(.3); router.position.set(-1.2, 1.7, -.25); st.scene.add(router);
    const wv = waves(C.cyan, 6, 6, .4, .035); wv.position.set(-1.2, 1.9, -.2); st.scene.add(wv);
    const nb = makeBit({ shell: 0xd9dde8, accent: 0x5b8cff }); nb.scale.setScalar(.5); nb.position.set(1.1, 0, -1.9); nb.rotation.y = -.5; st.scene.add(nb);
    const nph = makePhone(0x5b8cff); nph.scale.setScalar(.3); nph.position.set(.95, .62, -1.55); st.scene.add(nph);
    const q = textSign(1.4, .42, 'I see you!', { color: 0xffffff, fg: '#2c5ad8', size: 58 }); q.position.set(1.15, 1.35, -1.6); st.scene.add(q);
    for (let i = 0; i < 6; i++) st.scene.add(K.tree(-2.2 + (i % 3) * 2.4 + (i > 2 ? .8 : 0), -5 + (i > 2 ? 0 : -1.5), 1, 0x55c271));
    return { ...st, update(t, s) { router.pose({ s }); wv.update(s); nb.pose({ s, lookY: -.5, reachR: .6 }); q.scale.setScalar(t > .55 ? Math.min(1, pop((t - .55) * 5)) : 0);
      aim(st.cam, [0, 3.6, lerp(9.2, 8.6, t)], [0, 1.6, -1.6]); } };
  };
  BUILD.w_lock = () => {
    const st = stage({ top: '#2c3f78', bottom: '#f0a6c4', floor: 0xe7a0bf, rim: 0x9ad8ff, rimI: 2.4 });
    const pw = sign(2.8, .62, () => {}, { color: 0xffffff }); pw.position.set(0, 4.55, 0); st.scene.add(pw);
    const keys = [0, 1].map(i => G(M(new THREE.TorusGeometry(.22, .07, 10, 28), metal(0xffd36e), { pos: [-.45, 0, 0] }), M(RB(.7, .1, .08, .03), metal(0xffd36e), { pos: [.08, 0, 0] }), M(RB(.08, .18, .08, .02), metal(0xffd36e), { pos: [.34, -.1, 0] })));
    keys.forEach(k => st.scene.add(k));
    const mine = makePhone(0xff6fb1), theirs = makePhone(0x8a93a8, 'sad'); mine.scale.setScalar(.85); theirs.scale.setScalar(.85); mine.position.set(-1.0, 1.2, .8); theirs.position.set(1.0, 1.2, .6); st.scene.add(mine, theirs);
    const ok = textSign(1.3, .42, 'hello!', { color: C.lime, fg: '#1d2442', size: 64 }), bad = textSign(1.3, .42, '#$%&@!', { color: 0x3a3f55, fg: '#ff7a9a', font: MONO, size: 64 });
    ok.position.set(-1.0, 2.35, .9); bad.position.set(1.0, 2.35, .7); st.scene.add(ok, bad);
    const wv = waves(C.violet, 5, 3, .7); wv.position.set(0, 3.2, -.6); st.scene.add(wv);
    return { ...st, update(t, s) {
      const n = Math.floor(seg(t, .02, .2) * 8); pw.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, 'PASSWORD  ' + '•'.repeat(n), 40, h / 2 + 4, 64, '#1d2442', 900, 'left', MONO); }); pw.scale.setScalar(pop(s));
      const kk = ease(seg(t, .25, .45)); keys[0].position.set(lerp(0, -1.0, kk), lerp(4.0, 2.95, kk), .9); keys[1].position.set(lerp(0, 1.0, kk), lerp(4.0, 2.95, kk), .7);
      keys[1].visible = t < .5; keys.forEach(k => { k.scale.setScalar(kk > 0 ? .9 : 0); k.rotation.y = s * 3; });
      wv.update(s, seg(t, .45, .55)); ok.scale.setScalar(t > .55 ? Math.min(1, pop((t - .55) * 5)) : 0); bad.scale.setScalar(t > .62 ? Math.min(1, pop((t - .62) * 5)) : 0);
      aim(st.cam, [0, 2.7, 9.4], [0, 2.5, 0]); } };
  };
  BUILD.w_walls = () => {
    const st = stage(sky);
    const router = makeRouter(); router.scale.setScalar(.5); router.position.set(-1.45, 0, .2); st.scene.add(router);
    const walls = [[M(RB(.25, 1.9, 1.9, .05), matte(0xd4826a)), 'BRICK', -.5], [M(RB(.18, 1.9, 1.9, .05), metal(0xb8c0cc)), 'METAL', .5], [M(RB(.7, 1.6, 1.6, .12), new THREE.MeshPhysicalMaterial({ color: 0x6fd3ff, transparent: true, opacity: .6, roughness: .05 })), 'WATER', 1.5]];
    walls.forEach(([w, lb, x]) => { w.position.set(x, .95, 0); st.scene.add(w); const l = textSign(.95, .34, lb, { color: 0xffffff, fg: '#1d2442', size: 50, depth: .08 }); l.position.set(x, 2.25, .3); st.scene.add(l); });
    st.scene.add(M(SPH(.13, 16, 12), plastic(0xff8a3d), { pos: [1.5, 1.0, .2], scale: [1.6, 1, .7] }));
    const beam = []; for (let i = 0; i < 16; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.5, .05, 8, 48), new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); r.rotation.y = Math.PI / 2; st.scene.add(r); beam.push(r); }
    const bars = sign(1.3, .9, () => {}, { color: 0xffffff }); bars.position.set(.2, 3.25, 0); st.scene.add(bars);
    return { ...st, update(t, s) { router.pose({ s });
      beam.forEach((r, i) => { const x = -1.1 + frac(s * .3 + i / beam.length) * 3.3, passed = (x > -.5) + (x > .5) + (x > 1.5), strength = [1, .55, .28, .1][passed];
        r.position.set(x, .95, 0); r.scale.setScalar(.75 - passed * .12); r.material.opacity = strength * seg(t, 0, .1); });
      const lvl = 4 - Math.floor(seg(t, .2, .85) * 3.99);
      bars.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { x.fillStyle = i < lvl ? '#2ca84a' : '#d8dce6'; rrect(x, 40 + i * 70, h - 40 - (i + 1) * 40, 50, (i + 1) * 40, 10); x.fill(); } });
      bars.scale.setScalar(pop(s - .3));
      aim(st.cam, [1.5, 2.7, 8.6], [.2, 1.35, 0]); } };
  };
  BUILD.w_bands = () => {
    const st = stage({ top: '#2a3c7a', bottom: '#7a5cc4', floor: 0x6a50b0, hemi: .8 });
    const r1 = ribbon(C.cyan, 3.8, .4, 3.0), r2 = ribbon(C.pink, 3.8, .3, 7.0); r1.position.set(0, 3.6, 0); r2.position.set(0, 1.7, 0); st.scene.add(r1, r2);
    const l1 = textSign(3.0, .46, '2.4 GHz: further, through walls', { color: 0xffffff, fg: '#0a8fb5', size: 50 }), l2 = textSign(3.0, .46, '5 GHz: faster, shorter range', { color: 0xffffff, fg: '#d42f7f', size: 50 });
    l1.position.set(0, 4.45, .3); l2.position.set(0, 2.55, .3); st.scene.add(l1, l2);
    return { ...st, update(t, s) {
      r1.update(s, (x, ss) => Math.sin(x * 3 - ss * 6) * .4 * (1 - (x + 1.9) / 3.8 * .3));
      r2.update(s, (x, ss) => Math.sin(x * 7 - ss * 12) * .3 * Math.max(0, 1 - (x + 1.9) / 3.8 * 1.25));
      l1.scale.setScalar(pop(s - .1)); l2.scale.setScalar(t > .48 ? Math.min(1, pop((t - .48) * 5)) : 0); r2.visible = t > .45;
      aim(st.cam, [0, 2.8, 9.2], [0, 2.6, 0]); } };
  };
  BUILD.w_microwave = () => {
    const st = stage({ top: '#ffe9c4', bottom: '#ffc6a3', floor: 0xffbd98 });
    const counter = M(RB(4, .2, 1.6, .06), plastic(0xffffff), { pos: [0, 1.0, -.2] }); st.scene.add(counter, M(RB(3.8, 1.0, 1.4, .06), plastic(0x8fb8ff), { pos: [0, .45, -.2] }));
    const mw = new THREE.Group(); mw.position.set(-.55, 1.1, -.3); st.scene.add(mw);
    mw.add(M(RB(1.9, 1.15, 1.2, .14), plastic(0xf5f5f5), { pos: [0, .58, 0] }));
    mw.add(M(RB(1.2, .85, .05, .06), new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, roughness: .05, transparent: true, opacity: .55 }), { pos: [-.25, .58, .6] }));
    const glow = M(RB(1.1, .75, .9, .05), glowM(0xffa040, .0), { pos: [-.25, .58, .1], shadow: false }); mw.add(glow);
    const food = M(SPH(.22, 20, 14), plastic(0xff7a3d), { pos: [-.25, .38, .15] }); mw.add(food);
    const disp = textSign(.42, .2, '0:30', { color: 0x1d2442, fg: '#5ff3ff', font: MONO, size: 60, depth: .04 }); disp.position.set(.62, .85, .6); mw.add(disp);
    const router = makeRouter(); router.scale.setScalar(.45); router.position.set(1.15, 1.1, -.4); st.scene.add(router);
    const noise = waves(0xff8a3d, 6, 4.2, 1.4, .06); noise.position.set(-.55, 1.7, .1); st.scene.add(noise);
    const wifi = waves(C.cyan, 4, 2, .6, .03); wifi.position.set(1.15, 1.75, -.3); st.scene.add(wifi);
    const ph = makePhone(0xff6fb1, 'sad'); ph.scale.setScalar(.8); ph.position.set(.95, 3.6, .8); st.scene.add(ph);
    const buf = M(new THREE.TorusGeometry(.18, .04, 8, 32, Math.PI * 1.5), glowM(0xffffff, 2), { shadow: false }); buf.position.set(.95, 3.55, .9); st.scene.add(buf);
    const mf = textSign(1.6, .42, '≈ 2.45 GHz', { color: 0xff8a3d, fg: '#ffffff', font: MONO, size: 62 }); mf.position.set(-.55, 3.0, .4); st.scene.add(mf);
    return { ...st, update(t, s) { const on = seg(t, .15, .25); router.pose({ s });
      food.rotation.y = s * 2 * on; food.position.x = -.25 + Math.cos(s * 2) * .15 * on; food.position.z = .15 + Math.sin(s * 2) * .15 * on; glow.material.emissiveIntensity = on * 1.6;
      noise.update(s, on); wifi.update(s, 1 - on * .8, 1 - on * .5); mf.scale.setScalar(t > .3 ? Math.min(1, pop((t - .3) * 5)) : 0);
      ph.visible = t > .55; ph.scale.setScalar(.8 * Math.min(1, pop((t - .55) * 5))); buf.visible = t > .6; buf.rotation.z = -s * 6;
      aim(st.cam, [0, 2.7, 9.0], [0, 2.3, 0]); } };
  };
  BUILD.w_tip = () => {
    const st = stage({ top: '#bfe4ff', bottom: '#ffe3c4', floor: 0xffd7ad });
    const h = new THREE.Group(); st.scene.add(h);
    h.add(M(RB(3.6, .18, 2.4, .05), matte(0xe8c49a), { pos: [0, -.09, 0] }), M(RB(3.6, .14, 2.4, .05), matte(0xe8c49a), { pos: [0, 1.9, 0] }), M(RB(3.6, 4.0, .16, .05), matte(0xfff1e0), { pos: [0, 1.9, -1.2] }), M(RB(.14, 1.7, 2.4, .05), matte(0xffe2c4), { pos: [0, .85, 0] }), M(RB(.14, 1.9, 2.4, .05), matte(0xffe2c4), { pos: [.6, 2.9, 0] }));
    h.add(M(RB(3.8, .3, 2.6, .1), plastic(0xff6b5b), { pos: [0, 4.0, 0] }));
    const shelf = M(RB(.8, .08, .5, .03), plastic(0xffffff), { pos: [.05, 2.65, -.9] }); h.add(shelf);
    const router = makeRouter(); router.scale.setScalar(.32); st.scene.add(router);
    const wv = waves(C.cyan, 6, 4.2, .5, .03); st.scene.add(wv);
    const ok = G(M(new THREE.CylinderGeometry(.36, .36, .14, 40), plastic(0x3cc85a), { rot: [Math.PI / 2, 0, 0] }), M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-.16, 0, .08), V(-.04, -.12, .08), V(.17, .13, .08)], false, 'catmullrom', 0), 16, .045, 8), plastic(0xffffff), { shadow: false }));
    ok.position.set(1.3, 4.65, .5); st.scene.add(ok);
    return { ...st, update(t, s) { const m = ease(seg(t, .15, .5)); router.position.set(lerp(-1.5, .05, m), lerp(0, 2.69, m) + Math.sin(m * Math.PI) * .6, lerp(.8, -.85, m)); router.pose({ s });
      wv.position.copy(router.position).add(V(0, .4, .1)); wv.update(s, 1, lerp(.45, 1, m)); ok.scale.setScalar(t > .6 ? Math.min(1, pop((t - .6) * 5)) : 0);
      aim(st.cam, [0, 2.6, 10.4], [0, 2.1, 0]); } };
  };
  BUILD.w_recap = (p) => {
    const st = stage({ top: '#a2d8ff', bottom: '#ffe6c2', floor: 0xffdcb0 }), cols = ['#35c8ef', '#9b7bff', '#59c21a', '#ff4fa3', '#ffab1f'];
    const slabs = p.items.map(([l], i) => { const c = cols[i]; const g = sign(3.5, .74, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = c; x.beginPath(); x.arc(h / 2 + 6, h / 2, h * .36, 0, 7); x.fill(); label(x, String(i + 1), h / 2 + 6, h / 2 + 4, h * .46, '#fff', 900);
        label(x, l, h + 18, h / 2 + 3, h * .33, '#1d2442', 900, 'left'); }, { color: 0xffffff, depth: .22 }); g.position.set(0, 4.75 - i * .92, 0); st.scene.add(g); return g; });
    return { ...st, update(t, s) { slabs.forEach((g, i) => { const a = i * .17, act = t > a && t < a + .2; g.scale.setScalar(Math.min(1, pop((t - a) * 5)) * (act ? 1.06 : 1)); g.position.z = act ? .35 : 0; g.rotation.y = Math.sin(s * 1.5 + i) * .04; });
      aim(st.cam, [0, 3.0, lerp(9.6, 9.2, t)], [0, 2.75, 0]); } };
  };
}
