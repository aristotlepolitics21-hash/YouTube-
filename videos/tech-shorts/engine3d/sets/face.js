// Sets for Tech Shorts episode 13: How Face Unlock Actually Works (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { makePhone } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, night = { top: '#141c3d', bottom: '#3b2f6b', floor: 0x3a2f68, hemi: .9 }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };
  const IR = 0xff3b8a;

  // a grid of IR dots projected onto a sphere (centre c, radius r), or a flat wall when flat=1
  function dotField(n = 23) {
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.022, 6, 4), new THREE.MeshBasicMaterial({ color: IR, toneMapped: false }), n * n), m = new THREE.Matrix4();
    im.place = (c, r, k = 1, flat = 0, spread = 2.0) => { let i = 0; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, i++) { const u = (x / (n - 1) - .5) * spread, v = (y / (n - 1) - .5) * spread;
      const d2 = (u * u + v * v) / (r * r), onS = d2 < .98; const z = onS ? Math.sqrt(1 - d2) * r : -1; const P = V(c.x + u, c.y + v, flat ? c.z : (onS ? c.z + z : c.z - .3));
      const s = k * (onS || flat ? 1 : .6); m.makeScale(s, s, s).setPosition(P); im.setMatrixAt(i, m); } im.instanceMatrix.needsUpdate = true; };
    return im;
  }
  function irPhone() { const ph = makePhone(0x2a3046); const bar = M(RB(.5, .1, .04, .03), plastic(0x141a2c), { pos: [0, .62, .08] }); ph.add(bar);
    const em = [-.15, 0, .15].map(x => { const e = M(SPH(.025, 8, 6), glowM(IR, 2), { pos: [x, .62, .1], shadow: false }); ph.add(e); return e; }); ph.userData.em = em; return ph; }
  function beam(from, to, col = IR, op = .12) { const d = to.clone().sub(from), m = M(new THREE.ConeGeometry(1, 1, 32, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, side: THREE.DoubleSide, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }), { shadow: false });
    m.position.copy(from).addScaledVector(d, .5); m.scale.set(1.2, d.length(), 1.2); m.quaternion.setFromUnitVectors(V(0, -1, 0), d.clone().normalize()); return m; }
  const faceC = (bit) => { const p = new THREE.Vector3(); bit.userData.body.getWorldPosition(p); return p; };
  const cam = (st, s, y = 2.6, z = 8.8) => aim(st.cam, [Math.sin(s * .5) * .8, y + .25, z], [0, y, 0]);

  // ---------- sets ----------
  BUILD.f_hook = () => {
    const st = stage(night), bit = makeBit(); bit.scale.setScalar(1.15); bit.position.set(0, .4, -.4); st.scene.add(bit);
    const ph = irPhone(); ph.scale.setScalar(.6); ph.position.set(.9, 1.4, 2.4); ph.rotation.y = -.3; st.scene.add(ph);
    const dots = dotField(); st.scene.add(dots); const bm = beam(V(.9, 1.6, 2.4), V(0, 1.7, .4)); st.scene.add(bm);
    return { ...st, update(t, s) { bit.pose({ s, happy: .4 }); const c = faceC(bit), k = ease(seg(t, .3, .55)); dots.place(V(c.x, c.y, c.z), 1.07, k); dots.visible = k > 0; bm.visible = k > 0; bm.material.opacity = .12 * k;
      ph.userData.em.forEach(e => e.material.emissiveIntensity = 1 + Math.sin(s * 10) * .8); aim(st.cam, [Math.sin(s * .4) * 1.3 + .6, 2.4, 6.8], [0, 1.8, 0]); } };
  };
  BUILD.f_title = (p) => {
    const st = stage({ top: '#d6c8ff', bottom: '#ffc6e2', floor: 0xffb8da }); st.scene.add(pedestal(1.3, 0xffffff, IR));
    const bit = makeBit(); bit.scale.setScalar(.7); bit.position.y = .4; st.scene.add(bit); const dots = dotField(17); st.scene.add(dots);
    const s1 = textSign(3.5, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 92 }), s2 = textSign(3.3, .72, p.bottom, { color: IR, fg: '#ffffff', size: 96 }); s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { bit.pose({ s, happy: .8, waveR: seg(t, .2, .3) }); const c = faceC(bit); dots.place(c, .72, .8 + Math.sin(s * 6) * .2, 0, 1.4);
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.4], [0, 2.5, 0]); } };
  };
  BUILD.f_flood = () => {
    const st = stage({ top: '#060914', bottom: '#151a33', floor: 0x10142a, hemi: .25, keyI: .6, rimI: .6 }), bit = makeBit(); bit.scale.setScalar(.95); bit.position.set(0, 0, -.3); st.scene.add(bit);
    const wash = new THREE.PointLight(IR, 0, 8); wash.position.set(0, 1.3, 2.0); st.scene.add(wash);
    const ph = irPhone(); ph.scale.setScalar(.55); ph.position.set(0, .7, 2.3); st.scene.add(ph); const bm = beam(V(0, 1.1, 2.3), V(0, 1.2, .2), IR, .1); st.scene.add(bm);
    const moon = G(M(SPH(.25, 20, 14), glowM(0xfff2c0, 1.5), { shadow: false }), sprite(0xfff2c0, 1.2, .5)); moon.position.set(1.3, 4.3, -1); st.scene.add(moon);
    const lb = textSign(1.6, .42, 'INFRARED', { color: IR, fg: '#fff', size: 62 }); lb.position.set(-.5, 3.55, .4); st.scene.add(lb);
    return { ...st, update(t, s) { const on = seg(t, .25, .4); wash.intensity = on * 14; bm.material.opacity = .1 * on; bit.pose({ s, happy: on }); lb.scale.setScalar(popIn(t, .4)); aim(st.cam, [Math.sin(s * .4) * .8, 2.4, 7.6], [0, 1.9, 0]); } };
  };
  BUILD.f_dots = () => {
    const st = stage(night), bit = makeBit(); bit.scale.setScalar(1.2); bit.position.set(0, .2, -.4); st.scene.add(bit);
    const dots = dotField(29); st.scene.add(dots); const ph = irPhone(); ph.scale.setScalar(.5); ph.position.set(0, .5, 2.6); st.scene.add(ph); const bm = beam(V(0, .82, 2.6), V(0, 1.6, .4)); st.scene.add(bm);
    const cnt = sign(2.0, .5, () => {}, { color: 0xffffff }); cnt.position.set(0, 3.65, .4); st.scene.add(cnt);
    return { ...st, update(t, s) { bit.pose({ s, happy: .3 }); const c = faceC(bit), k = ease(seg(t, .05, .4)); dots.place(c, 1.1, k, 0, 2.4);
      cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, Math.round(lerp(0, 30000, ease(seg(t, .1, .7)))).toLocaleString('en-US') + '+ dots', w / 2, h / 2 + 4, h * .55, '#d42f7f', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .15));
      aim(st.cam, [Math.sin(s * .4) * 1.2, 2.5, 7.2], [0, 1.9, 0]); } };
  };
  BUILD.f_camera = () => {
    const st = stage(night), wall = M(RB(3.0, 2.6, .1, .05), matte(0xd8dce6), { pos: [0, 2.6, -.5] }); st.scene.add(wall);
    const dots = dotField(19); st.scene.add(dots); const ph = irPhone(); ph.scale.setScalar(.55); ph.position.set(0, .6, 2.2); st.scene.add(ph);
    const flash = sprite(0xffffff, 3, 0); flash.position.set(0, 1.0, 2.3); st.scene.add(flash);
    const lb = textSign(1.6, .42, 'NEAT ROWS', { color: 0xffffff, fg: '#1d2442', size: 60 }); lb.position.set(0, 4.4, .4); st.scene.add(lb);
    return { ...st, update(t, s) { dots.place(V(0, 2.6, -.43), 1.4, 1, 1, 2.6); flash.material.opacity = Math.max(0, 1 - frac(s * .6) * 6) * .7; lb.scale.setScalar(popIn(t, .4)); cam(st, s, 2.4, 8.0); } };
  };
  BUILD.f_depth = () => {
    const st = stage(night), geo = new THREE.SphereGeometry(1.15, 64, 48), pos = geo.attributes.position, cols = [], c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) { const z = pos.getZ(i) / 1.15, y = pos.getY(i) / 1.15, x = pos.getX(i) / 1.15; let zz = z; if (z > 0) zz += .25 * Math.exp(-(x * x / .02 + (y + .05) ** 2 / .06)); pos.setZ(i, zz * 1.15); c.setHSL(lerp(.66, 0, clamp((zz + .2) / 1.45)), .85, .55); cols.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
    const head = M(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .5, wireframe: false }), {}); head.position.set(0, 2.5, 0); st.scene.add(head);
    const wire = M(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: .15 }), { shadow: false }); wire.position.copy(head.position); st.scene.add(wire);
    const lb = textSign(1.4, .44, '3D MAP', { color: 0xffffff, fg: '#1d2442', size: 70 }); lb.position.set(0, 4.4, .4); st.scene.add(lb);
    const near = textSign(.9, .3, 'NEAR', { color: 0xff5a3d, fg: '#fff', size: 50 }), far = textSign(.9, .3, 'FAR', { color: 0x4d6bff, fg: '#fff', size: 50 }); near.position.set(1.2, 2.8, 1.0); far.position.set(1.3, 1.6, .3); st.scene.add(near, far);
    return { ...st, update(t, s) { head.rotation.y = wire.rotation.y = Math.sin(s * .8) * .9; head.scale.setScalar(popIn(t, .1)); wire.scale.copy(head.scale); lb.scale.setScalar(popIn(t, .25)); near.scale.setScalar(popIn(t, .5)); far.scale.setScalar(popIn(t, .6)); cam(st, s, 2.5); } };
  };
  function barcode(seed) { const r = rng(seed), v = []; for (let i = 0; i < 24; i++) v.push(.2 + r() * .8); return v; }
  function bars(vals, col) { const g = new THREE.Group(); vals.forEach((v, i) => { const b = M(RB(.1, 1, .1, .03), plastic(col), {}); b.position.set(-1.25 + i * .109, 0, 0); g.add(b); }); g.set = (vs, k = 1) => g.children.forEach((b, i) => { b.scale.y = Math.max(.02, vs[i] * k); b.position.y = vs[i] * k / 2; }); return g; }
  BUILD.f_math = () => {
    const st = stage(soft), bit = makeBit(); bit.scale.setScalar(.6); bit.position.set(0, 2.4, -.3); st.scene.add(bit);
    const v = barcode(5), b = bars(v, IR); b.position.set(0, .9, .6); st.scene.add(b);
    const nums = sign(3.0, .42, () => {}, { color: 0x1d2442 }); nums.position.set(0, 4.55, .4); st.scene.add(nums);
    return { ...st, update(t, s) { bit.pose({ s, happy: .5 }); const k = ease(seg(t, .15, .6)); b.set(v, k); bit.scale.setScalar(.6 * (1 - seg(t, .6, .8) * .5));
      nums.userData.redraw((x, w, h) => { x.fillStyle = '#1d2442'; x.fillRect(0, 0, w, h); label(x, v.slice(0, Math.floor(k * 9) + 1).map(a => a.toFixed(2)).join('  '), w / 2, h / 2 + 3, h * .44, '#ffd36e', 700, 'center', MONO); }); nums.scale.setScalar(popIn(t, .2)); cam(st, s, 2.5); } };
  };
  BUILD.f_compare = () => {
    const st = stage(soft), v = barcode(5), w = v.map((a, i) => a + Math.sin(i * 3.1) * .04), saved = bars(v, 0x9aa3bd), now = bars(w, IR); saved.position.set(0, 3.1, 0); now.position.set(0, 1.3, .3); st.scene.add(saved, now);
    const l1 = textSign(1.3, .34, 'SAVED', { color: 0x9aa3bd, fg: '#fff', size: 52 }), l2 = textSign(1.3, .34, 'NOW', { color: IR, fg: '#fff', size: 52 }); l1.position.set(-1.0, 4.35, .3); l2.position.set(-1.0, 2.55, .5); st.scene.add(l1, l2);
    const lock = G(M(RB(.7, .55, .3, .1), metal(0xffc44d)), M(new THREE.TorusGeometry(.22, .06, 10, 24, Math.PI), metal(0xd7dbe6), { pos: [0, .3, 0] })); lock.position.set(1.15, 2.55, .5); st.scene.add(lock);
    return { ...st, update(t, s) { saved.set(v, popIn(t, .05)); now.set(w, popIn(t, .2)); const ok = t > .6; lock.children[1].position.y = ok ? .3 + .2 * ease(seg(t, .6, .7)) : .3; lock.children[1].rotation.y = ok ? ease(seg(t, .6, .7)) * 1.2 : 0;
      lock.scale.setScalar(popIn(t, .45)); l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .2)); cam(st, s, 2.7); } };
  };
  BUILD.f_fast = () => {
    const st = stage(warm), ph = makePhone(0xff6fb1); ph.scale.setScalar(1.2); ph.position.set(0, 2.4, 0); st.scene.add(ph);
    const sw = sign(1.8, .52, () => {}, { color: 0xffffff }); sw.position.set(0, 4.55, .4); st.scene.add(sw);
    const ring = M(new THREE.TorusGeometry(.6, .05, 10, 48, Math.PI * 2), glowM(0x5ce06a, 2.5), { shadow: false }); ring.position.set(0, 2.4, .2); st.scene.add(ring);
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .55)); ring.scale.setScalar(k); ring.rotation.z = s * 4; sw.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, (k * .8).toFixed(2) + ' s', w / 2, h / 2 + 4, h * .6, '#2ca84a', 900, 'center', MONO); }); sw.scale.setScalar(popIn(t, .05));
      ph.rotation.y = Math.sin(s * 1.5) * .2; cam(st, s, 2.6); } };
  };
  BUILD.f_secure = () => {
    const st = stage(soft), ph = new THREE.Group(); ph.position.set(-.3, 2.5, 0); st.scene.add(ph); ph.add(M(RB(1.8, 3.4, .25, .3), new THREE.MeshPhysicalMaterial({ color: 0xff6fb1, transparent: true, opacity: .35, roughness: .1, depthWrite: false }), { shadow: false }));
    const chip = G(M(RB(.7, .7, .15, .08), plastic(0x2d3350)), M(RB(.3, .25, .1, .05), metal(0xffc44d), { pos: [0, -.05, .1] }), M(new THREE.TorusGeometry(.1, .03, 8, 16, Math.PI), metal(0xd7dbe6), { pos: [0, .1, .1] })); ph.add(chip);
    const cloud = G(...[[-.4, 0, .4], [0, .15, .5], [.4, 0, .4]].map(([x, y, r]) => M(SPH(r, 20, 14), plastic(0xffffff), { pos: [x, y, 0] }))); cloud.position.set(1.2, 4.3, -.5); st.scene.add(cloud);
    const no = textSign(.5, .5, '✕', { color: C.red, fg: '#fff', size: 100 }); no.position.set(1.2, 4.3, .2); st.scene.add(no);
    const lb = textSign(1.6, .4, 'NOT A PHOTO', { color: IR, fg: '#fff', size: 58 }); lb.position.set(-.3, 4.5, .4); st.scene.add(lb);
    return { ...st, update(t, s) { chip.scale.setScalar(popIn(t, .1) * (1 + Math.sin(s * 4) * .04)); chip.rotation.y = Math.sin(s * 1.5) * .3; no.scale.setScalar(popIn(t, .6)); cloud.position.x = 1.2 + Math.sin(s) * .1; lb.scale.setScalar(popIn(t, .3)); cam(st, s, 2.6); } };
  };
  BUILD.f_attention = () => {
    const st = stage(night), bit = makeBit(); bit.scale.setScalar(.9); bit.position.set(0, 0, 0); st.scene.add(bit);
    const zz = ['z', 'Z', 'z'].map(l => { const g = textSign(.32, .32, l, { color: 0x9b7bff, fg: '#fff', size: 80, depth: .05 }); st.scene.add(g); return g; });
    const lock = G(M(RB(.8, .62, .3, .1), metal(0xffc44d)), M(new THREE.TorusGeometry(.24, .07, 10, 24, Math.PI), metal(0xd7dbe6), { pos: [0, .32, 0] })); lock.position.set(1.1, 3.6, .3); st.scene.add(lock);
    return { ...st, update(t, s) { const awake = t > .55; bit.pose({ s, happy: awake ? 1 : 0, sad: 0, bob: awake ? 1 : .3 }); bit.userData.eyes.forEach(e => e.scale.y = awake ? 1 : .08);
      zz.forEach((g, i) => { const u = frac(s * .5 + i / 3); g.position.set(.6 + u * .5, 2.5 + u * .8, .4); g.scale.setScalar(awake ? 0 : Math.sin(u * Math.PI)); });
      const op = ease(seg(t, .6, .75)); lock.children[1].position.y = .32 + op * .2; lock.children[1].rotation.y = op * 1.2; cam(st, s, 2.3); } };
  };
  BUILD.f_photo = () => {
    const st = stage(warm), card = G(M(RB(1.6, 2.0, .04, .05), plastic(0xffffff), {})); const pt = ctex(300, 380, (x, w, h) => { x.fillStyle = '#cfe9ff'; x.fillRect(0, 0, w, h); x.fillStyle = '#f7f3ec'; x.beginPath(); x.arc(w / 2, h * .55, 110, 0, 7); x.fill(); x.fillStyle = '#161b2e'; x.beginPath(); x.ellipse(w / 2, h * .5, 80, 60, 0, 0, 7); x.fill(); x.fillStyle = '#5ff3ff'; [-1, 1].forEach(d => { x.beginPath(); x.ellipse(w / 2 + d * 30, h * .5, 10, 18, 0, 0, 7); x.fill(); }); });
    card.add(M(new THREE.PlaneGeometry(1.5, 1.9), new THREE.MeshBasicMaterial({ map: pt.tex, toneMapped: false }), { pos: [0, 0, .025], shadow: false })); card.position.set(0, 2.5, 0); st.scene.add(card);
    const dots = dotField(19); st.scene.add(dots); const no = textSign(.55, .55, '✕', { color: C.red, fg: '#fff', size: 110 }); no.position.set(1.1, 3.8, .4); st.scene.add(no);
    const lb = textSign(1.4, .42, 'TOO FLAT', { color: C.red, fg: '#fff', size: 62 }); lb.position.set(-.4, 4.45, .4); st.scene.add(lb);
    return { ...st, update(t, s) { card.rotation.y = Math.sin(s * 1.2) * .2; dots.place(V(0, 2.5, .05), 1.3, popIn(t, .1), 1, 1.6); no.scale.setScalar(popIn(t, .55)); lb.scale.setScalar(popIn(t, .6)); cam(st, s, 2.6); } };
  };
  BUILD.f_adapt = () => {
    const st = stage(soft), bit = makeBit(); bit.scale.setScalar(.9); bit.position.set(0, 0, .2); st.scene.add(bit); const B = bit.userData.body;
    const glasses = G(...[-1, 1].map(d => M(new THREE.TorusGeometry(.2, .035, 8, 24), plastic(0x1d2442), { pos: [d * .27, .15, .95] })), M(RB(.15, .04, .04, .01), plastic(0x1d2442), { pos: [0, .17, .97] })); B.add(glasses);
    const hat = G(M(new THREE.CylinderGeometry(.6, .6, .5, 32), plastic(C.red), { pos: [0, .3, 0] }), M(new THREE.CylinderGeometry(.85, .85, .06, 32), plastic(C.red), { pos: [0, .05, 0] })); hat.position.set(0, .85, 0); B.add(hat);
    const beard = M(new THREE.SphereGeometry(.55, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2.5), plastic(0x8a5a3c, { side: THREE.DoubleSide }), { pos: [0, -.1, .45], scale: [1, .9, .7] }); B.add(beard);
    const upd = textSign(1.6, .42, 'UPDATED ✓', { color: 0x5ce06a, fg: '#14320a', size: 60 }); upd.position.set(0, 4.3, .4); st.scene.add(upd);
    return { ...st, update(t, s) { glasses.visible = t > .1; hat.visible = t > .4; beard.visible = t > .65; [glasses, hat, beard].forEach((g, i) => g.scale.setScalar(Math.min(1, popIn(t, [.1, .4, .65][i])) || .001));
      bit.pose({ s, happy: 1, tilt: Math.sin(s * 2) * .08 }); upd.scale.setScalar(frac(t * 3.3) < .4 && t > .15 ? 1 : .9); cam(st, s, 2.2); } };
  };
  BUILD.f_odds = () => {
    const st = stage(warm), crowd = new THREE.InstancedMesh(new THREE.SphereGeometry(.12, 12, 8), plastic(0xc9cdd8), 160), m = new THREE.Matrix4(), r = rng(3);
    for (let i = 0; i < 160; i++) { m.makeTranslation((i % 16 - 7.5) * .22, .15 + Math.floor(i / 16) * .02, -Math.floor(i / 16) * .45 - .3); crowd.setMatrixAt(i, m); } st.scene.add(crowd);
    const you = makeBit(); you.scale.setScalar(.4); you.position.set(-.5, 0, 1.2); st.scene.add(you); const twin = makeBit(); twin.scale.setScalar(.4); twin.position.set(.5, 0, 1.2); st.scene.add(twin);
    const odds = textSign(2.2, .5, '1 IN 1,000,000', { color: 0xffffff, fg: '#1d2442', size: 70 }); odds.position.set(0, 3.55, .3); st.scene.add(odds);
    const tw = textSign(1.2, .36, 'TWIN?', { color: C.amber, fg: '#3a2400', size: 58 }); tw.position.set(.5, 1.45, 1.4); st.scene.add(tw);
    return { ...st, update(t, s) { odds.scale.setScalar(popIn(t, .1)); you.pose({ s, happy: 1 }); twin.pose({ s: s + 1, happy: 1, tilt: Math.sin(s * 3) * .1 }); twin.visible = t > .5; tw.scale.setScalar(popIn(t, .6)); aim(st.cam, [Math.sin(s * .4) * .8, 3.0, 7.6], [0, 1.6, -.5]); } };
  };
  BUILD.f_2d = () => {
    const st = stage(soft), a = makePhone(0x9aa3bd), b = irPhone(); a.scale.setScalar(.8); b.scale.setScalar(.8); a.position.set(-.9, 2.4, 0); b.position.set(.9, 2.4, 0); st.scene.add(a, b);
    const l1 = textSign(1.3, .36, 'CAMERA ONLY', { color: 0x9aa3bd, fg: '#fff', size: 46 }), l2 = textSign(1.3, .36, '3D DOTS', { color: IR, fg: '#fff', size: 52 }); l1.position.set(-.9, 3.8, .3); l2.position.set(.9, 3.8, .3); st.scene.add(l1, l2);
    const pay = [textSign(.5, .5, '✕', { color: C.red, fg: '#fff', size: 100 }), textSign(.5, .5, '✓', { color: 0x3cc85a, fg: '#fff', size: 100 })]; pay[0].position.set(-.9, 1.55, 1.0); pay[1].position.set(.9, 1.55, 1.0); st.scene.add(...pay);
    const pl = textSign(1.6, .38, 'PAYMENTS', { color: 0xffffff, fg: '#1d2442', size: 54 }); pl.position.set(0, 4.55, .3); st.scene.add(pl);
    return { ...st, update(t, s) { [l1, l2].forEach((g, i) => g.scale.setScalar(popIn(t, .05 + i * .1))); pay.forEach((g, i) => g.scale.setScalar(popIn(t, .55 + i * .1))); pl.scale.setScalar(popIn(t, .5)); a.rotation.z = Math.sin(s * 2) * .05; b.userData.em.forEach(e => e.material.emissiveIntensity = 1.5 + Math.sin(s * 9)); cam(st, s, 2.6); } };
  };
}
