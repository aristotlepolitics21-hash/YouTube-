// Sets for Tech Shorts episode 4: How GPS Actually Works.
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { waves, screenFace, makePhone } = common(K);
  const space = { top: '#141c3d', bottom: '#3b2f6b', floor: null, fogNear: 30, fogFar: 90, hemi: .9, sky: 0xcfe0ff, key: 0xfff2dd, keyI: 2.6, rim: 0x8fd0ff, rimI: 2.2, shadowBox: 9 };

  // ---------- props ----------
  function stars(n = 140, seed = 5) { const r = rng(seed), g = new THREE.Group(); for (let i = 0; i < n; i++) { const s = sprite(0xffffff, .05 + r() * .12, .4 + r() * .6); s.position.set((r() - .5) * 30, -4 + r() * 22, -12 - r() * 10); g.add(s); } return g; }
  function earth(R = 2, seed = 3) {
    const g = new THREE.Group(), r = rng(seed); g.add(M(SPH(R, 64, 48), plastic(0x3d8bff, { roughness: .35 })));
    for (let i = 0; i < 14; i++) { const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1), n = V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)), s = .25 + r() * .45;
      const c = M(SPH(R * s * .5, 24, 16), plastic(r() < .2 ? 0xf0e2b6 : 0x5cc46a, { clearcoat: .3 }), { scale: [1, 1, .25] }); c.position.copy(n.clone().multiplyScalar(R * .97)); c.lookAt(n.clone().multiplyScalar(R * 2)); g.add(c); }
    g.add(M(SPH(R * 1.04, 48, 32), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: .14, side: THREE.BackSide, depthWrite: false }), { shadow: false }));
    return g;
  }
  // cute satellite: gold body with eyes, two blue solar wings, a dish
  function makeSat(s = 1, face = true) {
    const g = new THREE.Group();
    g.add(M(RB(.7, .7, .7, .14), metal(0xffc44d, { roughness: .3 })));
    [-1, 1].forEach(d => { g.add(M(new THREE.CylinderGeometry(.03, .03, .4, 8), metal(0xc9cdd8), { pos: [d * .55, 0, 0], rot: [0, 0, Math.PI / 2] }));
      const w = M(RB(.9, .5, .04, .03), plastic(0x2f5bd8, { roughness: .2 }), { pos: [d * 1.2, 0, 0] }); g.add(w);
      for (let i = 0; i < 3; i++) g.add(M(RB(.02, .5, .05, .005), metal(0xc9cdd8), { pos: [d * 1.2 - .3 + i * .3, 0, 0], shadow: false })); });
    g.add(M(new THREE.ConeGeometry(.22, .18, 24, 1, true), metal(0xe8ecf4, { side: THREE.DoubleSide }), { pos: [0, -.48, 0], rot: [Math.PI, 0, 0] }));
    if (face) [-1, 1].forEach(d => g.add(M(new THREE.CapsuleGeometry(.05, .08, 6, 12), new THREE.MeshBasicMaterial({ color: 0x141a2c }), { pos: [d * .13, .06, .36], shadow: false })));
    g.scale.setScalar(s); return g;
  }
  // a phone whose screen is a little map with the blue dot
  function mapPhone(col = 0xff6fb1) {
    const g = new THREE.Group(); g.add(M(RB(1.5, 2.9, .2, .26), plastic(col)));
    const t = ctex(400, 780); g.add(M(new THREE.PlaneGeometry(1.32, 2.6), new THREE.MeshBasicMaterial({ map: t.tex, toneMapped: false }), { pos: [0, 0, .105], shadow: false }));
    g.draw = (dx = 0, dy = 0, acc = 0, pulse = 0) => t.redraw((x, w, h) => { x.fillStyle = '#eef1e4'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#cfe8c0'; x.fillRect(20, 60, 150, 200); x.fillRect(240, 420, 140, 260); x.fillStyle = '#bfe2ff'; x.fillRect(0, 300, 120, 90);
      x.strokeStyle = '#ffffff'; x.lineWidth = 26; [[0, 200, w, 340], [200, 0, 180, h], [0, 560, w, 520]].forEach(([a, b, c, d]) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); });
      const cx = w / 2 + dx, cy = h / 2 + dy; if (acc > 0) { x.fillStyle = 'rgba(43,123,255,.18)'; x.beginPath(); x.arc(cx, cy, acc, 0, 7); x.fill(); }
      x.fillStyle = `rgba(43,123,255,${.3 * (1 - pulse)})`; x.beginPath(); x.arc(cx, cy, 30 + pulse * 40, 0, 7); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(cx, cy, 24, 0, 7); x.fill(); x.fillStyle = '#2b7bff'; x.beginPath(); x.arc(cx, cy, 17, 0, 7); x.fill(); });
    return g;
  }
  // a glowing pulse travelling from a to b
  function pulseDot(col = 0x6ff0ff) { return G(M(SPH(.1, 16, 12), glowM(col, 5), { shadow: false }), sprite(col, .8, .9)); }
  function beam(a, b, col = C.cyan) { const d = b.clone().sub(a), m = M(new THREE.CylinderGeometry(.015, .015, 1, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .45, toneMapped: false }), { shadow: false });
    m.position.copy(a).addScaledVector(d, .5); m.scale.y = d.length(); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); return m; }
  const ground = { top: '#bfe4ff', bottom: '#d8f2c2', floor: 0x9dd67f, shadowBox: 10 };

  // ---------- sets ----------
  BUILD.g_hook = () => {
    const st = stage(space); st.scene.add(stars());
    const ph = mapPhone(); ph.position.set(0, 1.9, .4); ph.scale.setScalar(.95); st.scene.add(ph);
    const sats = [[-1.4, 4.7, -1.5], [1.5, 4.9, -2]].map(p => { const s = makeSat(.45); s.position.set(...p); st.scene.add(s); return s; });
    const pulses = [0, 1, 2, 3].map(() => { const p = pulseDot(); st.scene.add(p); return p; });
    const noUp = textSign(1.6, .4, 'RECEIVE ONLY', { color: C.lime, fg: '#14320a', size: 56 }); noUp.position.set(0, 3.8, 1.0); st.scene.add(noUp);
    return { ...st, update(t, s) { ph.draw(0, 0, 0, frac(s * .8)); ph.rotation.y = Math.sin(s * .7) * .15;
      sats.forEach((g, i) => { g.rotation.z = Math.sin(s + i) * .1; g.position.y = [4.7, 4.9][i] + Math.sin(s * 1.3 + i) * .08; });
      pulses.forEach((p, i) => { const src = sats[i % 2].position, u = frac(s * .7 + i * .25); p.position.lerpVectors(src, V(0, 2.4, .5), u); p.scale.setScalar(1 - u * .5); });
      noUp.scale.setScalar(t > .6 ? Math.min(1, pop((t - .6) * 5)) : 0);
      aim(st.cam, [0, 2.8, 9.4], [0, 2.6, 0]); } };
  };
  BUILD.g_title = (p) => {
    const st = stage({ top: '#1d2a5c', bottom: '#5a4a9a', floor: 0x4f428c, hemi: 1.0, rim: 0x9ad8ff, rimI: 2.2 }); st.scene.add(stars(80));
    st.scene.add(pedestal(1.3, 0xffffff, C.cyan)); const e = earth(1.05); e.position.set(0, 1.55, 0); st.scene.add(e);
    const sat = makeSat(.3); st.scene.add(sat);
    const s1 = textSign(3.0, .9, p.top, { color: 0xffffff, fg: '#1d2442' }), s2 = textSign(3.5, .72, p.bottom, { color: C.amber, fg: '#3a2400', size: 96 });
    s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { e.rotation.y = s * .4; const a = s * 1.1; sat.position.set(Math.cos(a) * 1.75, 1.55 + Math.sin(a) * .5, Math.sin(a) * 1.2); sat.rotation.y = -a;
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); const b = Math.sin(s * .4) * .2; aim(st.cam, [Math.sin(b) * 10, 2.8, Math.cos(b) * 10], [0, 2.45, 0]); } };
  };
  BUILD.g_sats = () => {
    const st = stage(space); st.scene.add(stars());
    const e = earth(1.6); e.position.set(0, 2.5, 0); st.scene.add(e);
    const orbits = [[.3, 0], [-.4, 1.0], [.9, 2.1], [-.9, 3.0]].map(([tilt, rot]) => { const g = new THREE.Group(); g.rotation.set(tilt, rot, 0); g.position.set(0, 2.5, 0); st.scene.add(g);
      g.add(M(new THREE.TorusGeometry(2.6, .012, 6, 160), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: .5, toneMapped: false }), { rot: [Math.PI / 2, 0, 0], shadow: false }));
      const ss = [0, 1].map(() => { const s = makeSat(.22, false); g.add(s); return s; }); return [g, ss]; });
    const info = sign(3.2, .62, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, '~30 satellites · 20,200 km up', w / 2, h / 2 + 4, h * .42, '#1d2442', 900); });
    info.position.set(0, 1.0, 2.0); st.scene.add(info);
    return { ...st, update(t, s) { e.rotation.y = s * .2;
      orbits.forEach(([g, ss], i) => { g.scale.setScalar(Math.min(1, pop((t - i * .08) * 4))); ss.forEach((sat, j) => { const a = s * .5 + j * Math.PI + i; sat.position.set(Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6); sat.rotation.y = -a; }); });
      info.scale.setScalar(t > .4 ? Math.min(1, pop((t - .4) * 5)) : 0);
      aim(st.cam, [0, 3.6, 9.6], [0, 2.4, 0]); } };
  };
  BUILD.g_clock = () => {
    const st = stage(space); st.scene.add(stars());
    const sat = makeSat(1.1); sat.position.set(0, 3.4, 0); st.scene.add(sat);
    const clk = sign(2.6, .62, () => {}, { color: 0x1d2442 }); clk.position.set(0, 4.75, .3); st.scene.add(clk);
    const wv = waves(C.amber, 5, 3.4, .6, .04); wv.position.set(0, 2.85, .1); st.scene.add(wv);
    const tags = [['TIME', C.lime, -.85], ['POSITION', C.pink, .85]].map(([l, c, x]) => { const g = textSign(1.5, .44, l, { color: c, fg: '#1d2442', size: 62 }); g.position.set(x, 1.65, 1.0); st.scene.add(g); return g; });
    return { ...st, update(t, s) { sat.rotation.y = Math.sin(s * .6) * .3; sat.position.y = 3.4 + Math.sin(s) * .06;
      const ns = Math.floor(s * 1e9) % 1e9; clk.userData.redraw((x, w, h) => { x.fillStyle = '#1d2442'; x.fillRect(0, 0, w, h); label(x, '12:00:0' + Math.floor(s % 10) + '.' + String(ns).padStart(9, '0'), w / 2, h / 2 + 4, h * .5, '#ffd36e', 700, 'center', MONO); });
      clk.scale.setScalar(pop(s - .1)); wv.update(s, seg(t, .45, .55)); tags.forEach((g, i) => g.scale.setScalar(t > .55 + i * .08 ? Math.min(1, pop((t - .55 - i * .08) * 5)) : 0));
      aim(st.cam, [0, 2.9, 9.2], [0, 2.7, 0]); } };
  };
  BUILD.g_listen = () => {
    const st = stage(ground);
    const ph = mapPhone(); ph.position.set(0, 1.55, .5); ph.scale.setScalar(.9); st.scene.add(ph);
    const sats = [[-1.5, 5.0, -3], [0, 5.6, -4], [1.5, 5.0, -3]].map(p => { const s = makeSat(.35); s.position.set(...p); st.scene.add(s); return s; });
    const pulses = sats.map(() => { const p = pulseDot(); st.scene.add(p); return p; });
    const stamps = sats.map((sat, i) => { const g = textSign(1.05, .32, ['sent 0.0671', 'sent 0.0702', 'sent 0.0684'][i], { color: 0xffffff, fg: '#1d2442', size: 40, font: MONO, depth: .05 }); st.scene.add(g); return g; });
    const ear = textSign(1.7, .42, 'LISTENS ONLY', { color: C.lime, fg: '#14320a', size: 58 }); ear.position.set(0, 3.8, 1.0); st.scene.add(ear);
    return { ...st, update(t, s) { ph.draw(0, 0, 0, frac(s * .8));
      sats.forEach((sat, i) => { sat.rotation.z = Math.sin(s + i) * .1; const u = frac(s * .55 + i * .33); pulses[i].position.lerpVectors(sat.position, V(0, 2.6, .5), u);
        stamps[i].position.lerpVectors(sat.position, V(0, 2.6, .5), u).add(V(.62, 0, 0)); stamps[i].scale.setScalar(t > .4 ? .9 * (1 - u * .3) : 0); });
      ear.scale.setScalar(t > .15 ? Math.min(1, pop((t - .15) * 5)) : 0);
      aim(st.cam, [0, 2.6, 9.4], [0, 2.75, -.5]); } };
  };
  BUILD.g_delay = () => {
    const st = stage(space); st.scene.add(stars());
    const sat = makeSat(.6); sat.position.set(0, 5.0, -1); st.scene.add(sat);
    const e = earth(3.2); e.position.set(0, -2.15, -1); st.scene.add(e);
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(.5); ph.position.set(0, 1.45, .3); st.scene.add(ph);
    st.scene.add(beam(V(0, 4.6, -1), V(0, 1.8, .2), C.cyan));
    const p = pulseDot(); st.scene.add(p);
    const tm = sign(2.4, .6, () => {}, { color: 0xffffff }), km = sign(2.4, .6, () => {}, { color: 0xffffff }); tm.position.set(-.95, 3.35, .6); km.position.set(.95, 2.45, .6); tm.scale.setScalar(.75); km.scale.setScalar(.75); st.scene.add(tm, km);
    return { ...st, update(t, s) { const u = ease(seg(t, .1, .75)); p.position.lerpVectors(V(0, 4.6, -1), V(0, 1.8, .2), u); p.visible = t > .08 && t < .78; e.rotation.y = s * .1;
      tm.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, (u * .067).toFixed(3) + ' s', w / 2, h / 2 + 4, h * .55, '#0a8fb5', 900, 'center', MONO); });
      km.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, Math.round(u * 20200).toLocaleString('en-US') + ' km', w / 2, h / 2 + 4, h * .55, '#d42f7f', 900, 'center', MONO); });
      aim(st.cam, [0, 3.0, 9.4], [0, 2.75, 0]); } };
  };
  // ground with a phone and satellites high above; spheres around satellites cut the ground in circles
  function fieldSet() {
    const st = stage(ground), r = rng(7);
    for (let i = 0; i < 18; i++) { const x = (r() - .5) * 12, z = -2 - r() * 12; st.scene.add(K.tree(x, z, .6 + r() * .6, r() < .5 ? 0x55c271 : 0x3fae63)); }
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(.5); ph.position.set(.3, .38, .6); ph.rotation.x = -.2; st.scene.add(ph);
    return { st, ph, me: V(.3, .02, .6) };
  }
  function ringAt(center, radius, col) { const m = M(new THREE.TorusGeometry(radius, .05, 8, 160), glowM(col, 2.2), { rot: [Math.PI / 2, 0, 0], shadow: false }); m.position.copy(center); return m; }
  BUILD.g_one = () => {
    const st = stage(ground), r = rng(7);
    for (let i = 0; i < 14; i++) { const x = (r() - .5) * 12, z = -3 - r() * 10; st.scene.add(K.tree(x, z, .6 + r() * .6, r() < .5 ? 0x55c271 : 0x3fae63)); }
    const sp = V(0, 4.9, -3), me = V(.9, 1.0, 1.2), R = sp.distanceTo(me);
    const sat = makeSat(.45); sat.position.copy(sp); st.scene.add(sat);
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(.45); ph.position.copy(me); st.scene.add(ph);
    const bub = new THREE.Group(); bub.position.copy(sp); st.scene.add(bub);
    bub.add(M(SPH(1, 64, 48), new THREE.MeshPhysicalMaterial({ color: C.cyan, transparent: true, opacity: .13, roughness: .1, side: THREE.DoubleSide, depthWrite: false }), { shadow: false }));
    [-.6, -.3, 0, .3, .6].forEach(y => { const rr = Math.sqrt(1 - y * y); bub.add(M(new THREE.TorusGeometry(rr, .006, 6, 128), glowM(C.cyan, 1.8), { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], shadow: false })); });
    [0, Math.PI / 3, -Math.PI / 3].forEach(a => bub.add(M(new THREE.TorusGeometry(1, .006, 6, 128), glowM(C.cyan, 1.8), { rot: [0, a, 0], shadow: false })));
    const q = textSign(1.6, .42, 'You are somewhere on this', { color: 0xffffff, fg: '#0a8fb5', size: 46 }); q.position.set(-.4, 4.1, 1.4); st.scene.add(q);
    const dist = textSign(1.4, .38, '20,200 km', { color: C.cyan, fg: '#0b3a55', size: 58, font: MONO }); st.scene.add(dist);
    return { ...st, update(t, s) { const k = ease(seg(t, .08, .6)); bub.scale.setScalar(Math.max(.01, k * R)); bub.rotation.y = s * .2; sat.rotation.z = Math.sin(s) * .1;
      dist.position.copy(sp).lerp(me, .5).add(V(.85, 0, .3)); dist.scale.setScalar(t > .3 ? Math.min(1, pop((t - .3) * 5)) : 0);
      q.scale.setScalar(t > .65 ? Math.min(1, pop((t - .65) * 5)) : 0);
      aim(st.cam, [0, 3.2, 10.5], [0, 2.7, -.5]); } };
  };
  BUILD.g_three = () => {
    const { st, me } = fieldSet();
    const defs = [[V(-2.4, 7, -5), C.cyan], [V(3.2, 7.5, -4), C.pink], [V(.5, 8, -9), C.amber]];
    const rings = defs.map(([sp, col]) => { const s = makeSat(.45); s.position.copy(sp); st.scene.add(s); const R = sp.distanceTo(me), rr = Math.sqrt(R * R - sp.y * sp.y), g = ringAt(V(sp.x, .03, sp.z), rr, col); st.scene.add(g); return [g, s]; });
    const you = G(M(new THREE.CylinderGeometry(.25, .25, .06, 32), glowM(0x2b7bff, 3), { shadow: false }), sprite(0x6aa8ff, 1.4, .9)); you.position.copy(me).add(V(0, .05, 0)); st.scene.add(you);
    const lb = textSign(1.0, .44, 'YOU', { color: 0x2b7bff, fg: '#ffffff', size: 70 }); lb.position.set(.3, 1.35, .7); st.scene.add(lb);
    return { ...st, update(t, s) { rings.forEach(([g, sat], i) => { const k = seg(t, .05 + i * .22, .2 + i * .22); g.visible = k > 0; g.scale.setScalar(.2 + ease(k) * .8); sat.rotation.z = Math.sin(s + i) * .1; });
      const done = t > .72; you.visible = done; you.scale.setScalar(1 + Math.sin(s * 6) * .1); lb.scale.setScalar(done ? Math.min(1, pop((t - .72) * 5)) : 0);
      aim(st.cam, [1.2, 9.5, 8.5], [.2, 0, -2.2]); } };
  };
  BUILD.g_four = () => {
    const st = stage(cleanGround());
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(.9); ph.position.set(-.85, 1.5, .5); st.scene.add(ph);
    const sat = makeSat(.5); sat.position.set(1.15, 3.4, -.5); st.scene.add(sat);
    const n4 = textSign(.5, .5, '4', { color: C.lime, fg: '#14320a', size: 110 }); n4.position.set(1.15, 4.1, -.2); st.scene.add(n4);
    const err = sign(2.6, .6, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, '1 µs off = 300 m', w / 2, h / 2 + 4, h * .55, '#d42f7f', 900, 'center', MONO); }); err.position.set(-.3, 4.75, .4); st.scene.add(err);
    const circ = M(new THREE.TorusGeometry(1, .04, 8, 96), glowM(C.pink, 2.2), { rot: [Math.PI / 2, 0, 0], shadow: false }); circ.position.set(.6, .04, 1.0); st.scene.add(circ);
    const p = pulseDot(C.lime); st.scene.add(p);
    return { ...st, update(t, s) { const u = frac(s * .6); p.position.lerpVectors(sat.position, V(-.85, 2.2, .5), u); sat.rotation.z = Math.sin(s) * .1;
      n4.scale.setScalar(pop(s - .1)); const shrink = seg(t, .25, .55); circ.scale.setScalar(lerp(1.6, .15, ease(shrink)));
      err.scale.setScalar(t > .6 ? Math.min(1, pop((t - .6) * 5)) : 0);
      aim(st.cam, [0, 3.0, 9.0], [0, 2.4, 0]); } };
  };
  function cleanGround() { return { top: '#cfe9ff', bottom: '#e8f6d8', floor: 0xcdeab8 }; }
  BUILD.g_rel = () => {
    const st = stage(space); st.scene.add(stars());
    const e = earth(2.6); e.position.set(0, -1.6, -1); st.scene.add(e);
    const sat = makeSat(.55); sat.position.set(0, 3.6, .2); st.scene.add(sat);
    const plus = textSign(2.6, .5, 'Less gravity: +45 µs/day', { color: C.lime, fg: '#14320a', size: 50 }), minus = textSign(2.6, .5, 'Speed: −7 µs/day', { color: C.pink, fg: '#ffffff', size: 50 });
    plus.position.set(0, 4.75, .4); minus.position.set(0, 2.2, .8); st.scene.add(plus, minus);
    const trail = M(new THREE.TorusGeometry(4.4, .02, 6, 160, Math.PI / 2.4), new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: .6, toneMapped: false }), { shadow: false }); trail.position.set(0, -1.6, -1); trail.rotation.z = Math.PI / 2 - .5; st.scene.add(trail);
    return { ...st, update(t, s) { e.rotation.y = s * .15; sat.rotation.z = Math.sin(s) * .08; sat.position.x = Math.sin(s * .5) * .3;
      plus.scale.setScalar(t > .1 ? Math.min(1, pop((t - .1) * 5)) : 0); minus.scale.setScalar(t > .55 ? Math.min(1, pop((t - .55) * 5)) : 0);
      aim(st.cam, [0, 3.0, 9.4], [0, 2.8, 0]); } };
  };
  BUILD.g_fix = () => {
    const st = stage(space); st.scene.add(stars());
    const sat = makeSat(.7); sat.position.set(.8, 3.35, -.3); st.scene.add(sat);
    const bit = makeBit(); bit.scale.setScalar(.5); bit.position.set(-1.0, 2.0, .6); st.scene.add(bit);
    const wrench = G(M(RB(.5, .08, .06, .02), metal(0xc9cdd8)), M(new THREE.TorusGeometry(.09, .035, 8, 16, Math.PI * 1.5), metal(0xc9cdd8), { pos: [.27, 0, 0] })); st.scene.add(wrench);
    const net = textSign(2.2, .52, '+38 µs / day', { color: C.amber, fg: '#3a2400', size: 74, font: MONO }), slow = textSign(2.4, .5, 'SET TO TICK SLOW', { color: C.lime, fg: '#14320a', size: 60 });
    net.position.set(0, 4.85, .3); slow.position.set(0, 4.2, .5); st.scene.add(net, slow);
    const drift = textSign(2.9, .48, 'Without it: ~10 km off a day', { color: C.red, fg: '#ffffff', size: 50 }); drift.position.set(0, 1.45, 1.4); st.scene.add(drift);
    return { ...st, update(t, s) { bit.position.y = 2.0 + Math.sin(s * 2) * .1; bit.pose({ s, reachR: .8 + Math.sin(s * 8) * .2 * seg(t, .35, .4), happy: .5 });
      wrench.position.set(-.35, 2.5 + Math.sin(s * 8) * .08, .8); wrench.rotation.z = Math.sin(s * 8) * .4; sat.rotation.z = Math.sin(s) * .08;
      net.scale.setScalar(pop(s - .1)); slow.scale.setScalar(t > .4 ? Math.min(1, pop((t - .4) * 5)) : 0); drift.scale.setScalar(t > .68 ? Math.min(1, pop((t - .68) * 5)) : 0);
      aim(st.cam, [0, 2.9, 9.4], [0, 2.75, 0]); } };
  };
  BUILD.g_block = () => {
    const st = stage({ top: '#a9c8ff', bottom: '#e0d6f2', floor: 0xb9b3cf, shadowBox: 10 }), r = rng(31);
    [-1, 1].forEach(side => { for (let i = 0; i < 5; i++) { const h = 3 + r() * 3.5, b = M(RB(1.4, h, 1.4, .1), plastic([0x9aa6c8, 0xb7c0dc, 0x8a96bb][i % 3], { roughness: .4 }), { pos: [side * 1.75, h / 2, 1 - i * 1.9] }); st.scene.add(b);
      for (let k = 0; k < Math.floor(h / .6); k++) st.scene.add(M(RB(1.0, .18, .02, .02), glowM(0xffe7a8, .5), { pos: [side * 1.75 - side * .71, .5 + k * .6, 1 - i * 1.9], rot: [0, Math.PI / 2, 0], shadow: false })); } });
    st.scene.add(M(RB(2.0, .02, 12, .01), matte(0x5d6577), { pos: [0, .01, -2.5], shadow: false }));
    const ph = mapPhone(); ph.scale.setScalar(.48); ph.position.set(0, 1.75, 1.8); st.scene.add(ph);
    const path = [V(-.5, 7, -6), V(-1.0, 3.2, -2.2), V(1.0, 2.3, -.6), V(0, 1.85, 1.6)], cur = new THREE.CatmullRomCurve3(path, false, 'catmullrom', 0);
    const line = M(new THREE.TubeGeometry(cur, 80, .03, 6), glowM(C.cyan, 2.2), { shadow: false }); st.scene.add(line); const p = pulseDot(); st.scene.add(p);
    return { ...st, update(t, s) { const u = frac(s * .5); p.position.copy(cur.getPoint(u)); line.visible = t > .2;
      const jx = Math.sin(s * 2.3) * 40 + Math.sin(s * 5.1) * 20, jy = Math.cos(s * 1.7) * 50; ph.draw(t > .45 ? jx : 0, t > .45 ? jy : 0, t > .45 ? 90 : 0, frac(s * .8));
      aim(st.cam, [0, 2.6, 7.6], [0, 2.4, -1]); } };
  };
  BUILD.g_assist = () => {
    const st = stage(cleanGround());
    const ph = mapPhone(); ph.scale.setScalar(.8); ph.position.set(0, 2.3, .4); st.scene.add(ph);
    const tower = new THREE.Group(); tower.position.set(-1.45, 0, -.8); st.scene.add(tower);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => tower.add(M(new THREE.CylinderGeometry(.03, .03, 3.6, 6), metal(0xc9cdd8), { pos: [a * .2, 1.8, b * .2], rot: [b * .05, 0, -a * .05] })));
    tower.add(M(RB(.5, .3, .15, .05), plastic(0xffffff), { pos: [0, 3.5, .2] }), M(SPH(.09, 12, 8), glowM(C.red, 3), { pos: [0, 3.75, 0] }));
    const router = G(M(RB(.8, .26, .5, .08), plastic(0xffffff), { pos: [0, .13, 0] }), ...[-.25, .25].map(x => M(new THREE.CapsuleGeometry(.03, .4, 4, 8), plastic(0x2a3046), { pos: [x, .5, -.15] }))); router.position.set(1.45, .9, -.2); st.scene.add(router); st.scene.add(M(new THREE.CylinderGeometry(.45, .5, .9, 24), plastic(0xffffff), { pos: [1.45, .45, -.2] }));
    const w1 = waves(C.amber, 4, 2.4, .6, .035), w2 = waves(C.cyan, 4, 2.0, .7, .035); w1.position.set(-1.45, 3.5, -.6); w2.position.set(1.45, 1.5, -.1); st.scene.add(w1, w2);
    const sat = makeSat(.4); sat.position.set(.9, 5.0, -1.5); st.scene.add(sat); const p = pulseDot(); st.scene.add(p);
    const tags = [['ROUGH', C.amber, -.95, 4.65], ['SHARP', C.lime, .95, 4.65]].map(([l, c, x, y]) => { const g = textSign(1.2, .4, l, { color: c, fg: '#1d2442', size: 60 }); g.position.set(x, y, .4); st.scene.add(g); return g; });
    return { ...st, update(t, s) { const rough = seg(t, .05, .2), sharp = seg(t, .55, .8); w1.update(s, rough * (1 - sharp * .7)); w2.update(s, rough * (1 - sharp * .7));
      ph.draw(lerp(60, 0, sharp), lerp(-40, 0, sharp), lerp(170, 0, ease(sharp)) * rough, frac(s * .8));
      p.visible = t > .5; p.position.lerpVectors(sat.position, ph.position, frac(s * .7)); sat.rotation.z = Math.sin(s) * .1;
      tags[0].scale.setScalar(t > .15 ? Math.min(1, pop((t - .15) * 5)) : 0); tags[1].scale.setScalar(t > .6 ? Math.min(1, pop((t - .6) * 5)) : 0);
      aim(st.cam, [0, 2.8, 9.2], [0, 2.55, 0]); } };
  };
}
