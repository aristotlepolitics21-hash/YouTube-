// Sets for Tech Shorts episode 6: How Noise Cancelling Actually Works (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, confetti, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { waves, screenFace } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#ffe0ec', floor: 0xffd6e6 }, night = { top: '#1e2550', bottom: '#5b4a9a', floor: 0x52448e, hemi: .9, rim: 0x9ad8ff, rimI: 2.4 };
  const NOISE = 0xff8a3d, ANTI = 0x35e0ff;

  // ---------- props ----------
  function ribbon(color, len, radius = .05) {
    const N = 200, mk = pts => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, radius, 8), zero = []; for (let i = 0; i <= N; i++) zero.push(V(-len / 2 + len * i / N, 0, 0));
    const m = M(mk(zero), glowM(color, 2.4), { shadow: false });
    m.update = f => { const p = []; for (let i = 0; i <= N; i++) { const x = -len / 2 + len * i / N; p.push(V(x, f(x), 0)); } m.geometry.dispose(); m.geometry = mk(p); };
    return m;
  }
  function makeHeadphones(col = 0xff4fa3, s = 1) {
    const g = new THREE.Group();
    g.add(M(new THREE.TorusGeometry(1.05, .11, 16, 48, Math.PI), plastic(0x2a3046), { pos: [0, .2, 0] }));
    const cups = [-1, 1].map(d => { const c = new THREE.Group(); c.position.set(d * 1.05, .1, 0); g.add(c);
      c.add(M(new THREE.CylinderGeometry(.5, .5, .38, 40), plastic(col), { rot: [0, 0, Math.PI / 2] }));
      c.add(M(new THREE.TorusGeometry(.4, .13, 14, 36), plastic(0x2a3046, { roughness: .8, clearcoat: 0 }), { pos: [-d * .22, 0, 0], rot: [0, Math.PI / 2, 0] }));
      const mic = M(SPH(.06, 12, 8), glowM(C.lime, 2.5), { pos: [d * .2, .22, .3], shadow: false }); c.add(mic); c.userData.mic = mic; return c; });
    g.userData.cups = cups; g.scale.setScalar(s); return g;
  }
  function wear(bit, col) { const h = makeHeadphones(col, 1); h.position.set(0, .45, 0); bit.userData.body.add(h); return h; }
  function noiseBug(seed = 1) {
    const g = new THREE.Group(); g.add(M(new THREE.IcosahedronGeometry(.32, 0), plastic(NOISE, { flatShading: true })));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + seed; g.add(M(new THREE.ConeGeometry(.08, .28, 8), plastic(0xff5a3d), { pos: [Math.cos(a) * .32, Math.sin(a) * .32, 0], rot: [0, 0, a - Math.PI / 2] })); }
    [-1, 1].forEach(d => g.add(M(new THREE.CapsuleGeometry(.04, .05, 4, 8), new THREE.MeshBasicMaterial({ color: 0x141a2c }), { pos: [d * .1, .05, .3], rot: [0, 0, d * .5], shadow: false })));
    return g;
  }
  function makeEar() {
    const g = new THREE.Group(), skin = plastic(0xf3c3a2, { roughness: .55, clearcoat: .1 });
    g.add(M(new THREE.TorusGeometry(.9, .28, 20, 48, Math.PI * 1.6), skin, { rot: [0, 0, -Math.PI * .3], scale: [.85, 1.15, 1] }));
    g.add(M(SPH(.32, 24, 16), skin, { pos: [.05, -.9, 0], scale: [1, 1.2, .8] }));
    g.add(M(new THREE.CylinderGeometry(.32, .38, .5, 28, 1, true), plastic(0xc98a6a, { side: THREE.DoubleSide }), { pos: [.05, 0, -.2], rot: [Math.PI / 2, 0, 0] }));
    const drum = M(new THREE.CircleGeometry(.3, 32), plastic(0xffb8c8, { side: THREE.DoubleSide }), { pos: [.05, 0, -.42] }); g.add(drum); g.userData.drum = drum; return g;
  }
  function chip() {
    const g = new THREE.Group(); g.add(M(RB(1.2, 1.2, .3, .1), plastic(0x2d3350, { roughness: .25 })));
    for (let i = 0; i < 4; i++) [-1, 1].forEach(sd => { g.add(M(RB(.08, .22, .08, .02), metal(0xffc44d), { pos: [-.39 + i * .26, sd * .68, 0] })); g.add(M(RB(.22, .08, .08, .02), metal(0xffc44d), { pos: [sd * .68, -.39 + i * .26, 0] })); });
    const f = screenFace(.8, .55, '#141a2c', '#5ff3ff'); f.position.set(0, .1, .16); g.add(f); g.userData.face = f; return g;
  }
  // a grid of air particles pushed by a travelling pressure wave (down the screen, along -y)
  function airField(cols = 9, rows = 15, w = 3.2, h = 4.4) {
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 10, 8), new THREE.MeshBasicMaterial({ toneMapped: false }), cols * rows), m = new THREE.Matrix4(), c = new THREE.Color();
    im.update = (s, amp = .14, k = 3.2, sp = 5) => { let i = 0; for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++, i++) { const x = -w / 2 + q * w / (cols - 1), y = h / 2 - r * h / (rows - 1), ph = k * y + s * sp, dy = Math.sin(ph) * amp, dens = Math.cos(ph);
      m.makeTranslation(x, y + dy, 0); im.setMatrixAt(i, m); im.setColorAt(i, c.set(dens > .3 ? 0xff8a3d : dens < -.3 ? 0x9fd8ff : 0xffffff)); } im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; };
    im.update(0); return im;
  }

  // ---------- sets ----------
  BUILD.n_hook = () => {
    const st = stage(night); const bit = makeBit(); bit.scale.setScalar(.75); bit.position.set(0, 0, .6); st.scene.add(bit); const hp = wear(bit, C.pink);
    const bugs = [0, 1, 2, 3, 4].map(i => { const b = noiseBug(i); b.scale.setScalar(.7); st.scene.add(b); return b; });
    const zap = waves(ANTI, 4, 2.4, 1.0, .05); zap.position.set(0, 2.0, .8); st.scene.add(zap);
    const poofs = bugs.map(() => { const p = sparkles(8, [0, 0, 0], .35, 0xffe14d, 3); st.scene.add(p); return p; });
    return { ...st, update(t, s) { zap.update(s, seg(t, .35, .45));
      bugs.forEach((b, i) => { const a = i / 5 * Math.PI * 2 + s * .6, u = frac(s * .35 + i / 5), r = lerp(2.3, 1.2, u), dead = t > .4 && u > .7;
        b.position.set(Math.cos(a) * r * .75, 2.0 + Math.sin(a) * r, .6 + Math.sin(a * 2) * .3); b.rotation.z = s * 4 + i; b.scale.setScalar(dead ? 0 : .7 * (1 + Math.sin(s * 12 + i) * .08));
        poofs[i].position.copy(b.position); poofs[i].visible = t > .4 && u > .7 && u < .85; poofs[i].update(s); });
      const relax = seg(t, .45, .6); bit.pose({ s, happy: relax, sad: 1 - relax, tilt: Math.sin(s * 8) * .08 * (1 - relax) + Math.sin(s * 1.5) * .05 * relax, upL: relax * .2 });
      aim(st.cam, [Math.sin(s * .5) * 1.2, 2.6, 9.0], [0, 2.1, 0]); } };
  };
  BUILD.n_title = (p) => {
    const st = stage({ top: '#ffc6e2', bottom: '#cdbaff', floor: 0xc2aef7 }); st.scene.add(pedestal(1.3, 0xffffff, C.pink));
    const hp = makeHeadphones(C.pink, 1.2); hp.position.set(0, 1.6, 0); st.scene.add(hp);
    const s1 = textSign(3.7, .78, p.top, { color: 0xffffff, fg: '#1d2442', size: 82 }), s2 = textSign(3.3, .72, p.bottom, { color: ANTI, fg: '#0b3a55', size: 96 }); s1.position.set(0, 4.7, 0); s2.position.set(0, 3.85, .2); st.scene.add(s1, s2);
    const notes = [0, 1, 2, 3].map(i => { const n = textSign(.4, .4, '♪', { color: [C.amber, C.lime, ANTI, C.pink][i], fg: '#1d2442', size: 90, depth: .1 }); st.scene.add(n); return n; });
    return { ...st, update(t, s) { const beat = Math.abs(Math.sin(s * Math.PI * 1.6)); hp.position.y = 1.6 + beat * .25; hp.scale.set(1.2 + beat * .05, 1.2 - beat * .05, 1.2); hp.rotation.y = Math.sin(s * .9) * .4;
      notes.forEach((n, i) => { const u = frac(s * .4 + i / 4); n.position.set((i % 2 ? 1 : -1) * (1.3 + u * .4), 1.4 + u * 2.2, .3); n.scale.setScalar(Math.sin(u * Math.PI)); n.rotation.z = Math.sin(s * 4 + i) * .3; });
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.6], [0, 2.5, 0]); } };
  };
  BUILD.n_wave = () => {
    const st = stage(soft), air = airField(); air.position.set(0, 2.55, 0); st.scene.add(air);
    const spk = G(M(new THREE.CylinderGeometry(.75, .55, .4, 40), plastic(0x2a3046), {}), M(new THREE.CylinderGeometry(.55, .55, .05, 40), plastic(C.violet), { pos: [0, -.2, 0] })); spk.position.set(0, 5.05, 0); st.scene.add(spk);
    const sq = textSign(1.3, .4, 'SQUEEZED', { color: NOISE, fg: '#ffffff', size: 56 }), str = textSign(1.3, .4, 'STRETCHED', { color: 0x9fd8ff, fg: '#0b3a55', size: 54 }); st.scene.add(sq, str);
    return { ...st, update(t, s) { air.update(s); spk.scale.y = 1 + Math.sin(s * 5) * .1;
      const y1 = (Math.PI / 2 - s * 5) / 3.2, wrap = v => ((v + 2.2) % (Math.PI * 2 / 3.2) + Math.PI * 2 / 3.2) % (Math.PI * 2 / 3.2) - 2.2 + 1.0;
      sq.position.set(-1.0, 2.55 + wrap(-s * 5 / 3.2) * 1, .5); str.position.set(1.0, 2.55 + wrap(-s * 5 / 3.2 + Math.PI / 3.2) * 1, .5);
      sq.scale.setScalar(popIn(t, .3)); str.scale.setScalar(popIn(t, .45)); aim(st.cam, [0, 2.8, 9.4], [0, 2.6, 0]); } };
  };
  BUILD.n_ear = () => {
    const st = stage(soft), ear = makeEar(); ear.scale.setScalar(1.5); ear.position.set(-.2, 2.6, 0); ear.rotation.y = -.5; st.scene.add(ear);
    const wv = waves(NOISE, 5, 2.6, .9, .04); wv.position.set(1.6, 2.6, .3); wv.rotation.y = -1.0; st.scene.add(wv);
    const brain = G(M(SPH(.55, 32, 24), plastic(0xff9ec4, { roughness: .4 }), { scale: [1.2, .9, 1] })); brain.position.set(-.9, 4.4, -.3); st.scene.add(brain);
    const bang = textSign(.9, .4, 'SOUND!', { color: C.amber, fg: '#3a2400', size: 56 }); bang.position.set(-.1, 4.6, .3); st.scene.add(bang);
    return { ...st, update(t, s) { wv.update(s); ear.userData.drum.position.z = -.42 + Math.sin(s * 14) * .07; ear.userData.drum.scale.setScalar(1 + Math.sin(s * 14) * .05);
      brain.scale.setScalar(1 + Math.abs(Math.sin(s * 7)) * .06 * seg(t, .5, .6)); bang.scale.setScalar(popIn(t, .55)); bang.rotation.z = Math.sin(s * 9) * .08;
      aim(st.cam, [0, 2.9, 9.0], [0, 2.75, 0]); } };
  };
  BUILD.n_pitch = () => {
    const st = stage(night), hi = ribbon(C.amber, 3.6, .05), lo = ribbon(C.violet, 3.6, .07); hi.position.set(0, 3.9, 0); lo.position.set(0, 1.9, 0); st.scene.add(hi, lo);
    const l1 = textSign(1.3, .42, 'HIGH', { color: C.amber, fg: '#3a2400', size: 64 }), l2 = textSign(1.3, .42, 'LOW', { color: C.violet, fg: '#ffffff', size: 64 }); l1.position.set(-1.1, 4.75, .2); l2.position.set(-1.1, 2.85, .2); st.scene.add(l1, l2);
    const bit = makeBit(); bit.scale.setScalar(.3); st.scene.add(bit);
    return { ...st, update(t, s) { hi.update(x => Math.sin(x * 9 - s * 14) * .35); lo.update(x => Math.sin(x * 2 - s * 4) * .45); lo.visible = t > .45;
      const bx = Math.sin(s * .8) * 1.2, by = 1.9 + Math.sin(bx * 2 - s * 4) * .45; bit.position.set(bx, by + .05, .1); bit.visible = t > .45; bit.pose({ s, upL: .6, upR: .6, happy: 1, tilt: Math.cos(bx * 2 - s * 4) * .4 });
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .5)); aim(st.cam, [0, 2.9, 9.2], [0, 2.75, 0]); } };
  };
  function cupClose() { const st = stage(soft), hp = makeHeadphones(C.pink, 1.35); hp.position.set(0, 2.4, 0); st.scene.add(hp); return { st, hp }; }
  BUILD.n_mics = () => {
    const { st, hp } = cupClose(); hp.rotation.y = .6;
    const bugs = [0, 1, 2].map(i => { const b = noiseBug(i); b.scale.setScalar(.55); st.scene.add(b); return b; });
    const lb = textSign(1.8, .44, 'OUTSIDE MIC', { color: C.lime, fg: '#14320a', size: 60 }); lb.position.set(1.0, 4.6, .5); st.scene.add(lb);
    const ears = [0, 1, 2].map(() => { const r = M(new THREE.TorusGeometry(.2, .02, 6, 24), glowM(C.lime, 3), { shadow: false }); st.scene.add(r); return r; });
    return { ...st, update(t, s) { const mic = hp.userData.cups[1].userData.mic, mp = mic.getWorldPosition(V(0, 0, 0)); mic.material.emissiveIntensity = 2 + Math.sin(s * 10) * 1.5;
      bugs.forEach((b, i) => { const a = s * .9 + i * 2.1; b.position.set(mp.x + 1.3 + Math.cos(a) * .4, mp.y + Math.sin(a) * 1.4, mp.z + .6); b.rotation.z = s * 3; });
      ears.forEach((r, i) => { const u = frac(s * 1.2 + i / 3); r.position.copy(mp); r.scale.setScalar(1 + u * 4); r.material.opacity = 1 - u; r.material.transparent = true; r.lookAt(st.cam.position); });
      hp.rotation.y = .6 + Math.sin(s * .8) * .15; lb.scale.setScalar(popIn(t, .3)); aim(st.cam, [0, 2.9, 8.6], [0, 2.6, 0]); } };
  };
  BUILD.n_inside = () => {
    const st = stage(soft), cup = new THREE.Group(); cup.position.set(0, 2.5, 0); st.scene.add(cup);
    cup.add(M(new THREE.CylinderGeometry(1.4, 1.4, .9, 48, 1, false, 0, Math.PI), plastic(C.pink, { side: THREE.DoubleSide }), { rot: [Math.PI / 2, 0, 0] }));
    cup.add(M(new THREE.TorusGeometry(1.15, .3, 16, 40, Math.PI), plastic(0x2a3046, { roughness: .8, clearcoat: 0 }), { pos: [0, 0, .55], rot: [0, 0, 0] }));
    const spk = M(new THREE.CylinderGeometry(.6, .6, .1, 32), plastic(0x2a3046), { pos: [0, .15, -.2], rot: [Math.PI / 2, 0, 0] }); cup.add(spk);
    const mic = M(SPH(.12, 16, 12), glowM(C.lime, 3), { pos: [.55, .55, .2], shadow: false }); cup.add(mic);
    const ear = makeEar(); ear.scale.setScalar(.7); ear.position.set(0, 1.0, 1.0); ear.rotation.y = Math.PI * .1; st.scene.add(ear);
    const lb = textSign(1.8, .44, 'INSIDE MIC', { color: C.lime, fg: '#14320a', size: 60 }); lb.position.set(.3, 4.55, .5); st.scene.add(lb);
    const chk = textSign(.5, .5, '✓', { color: 0x3cc85a, fg: '#fff', size: 110 }); chk.position.set(1.3, 3.6, .8); st.scene.add(chk);
    return { ...st, update(t, s) { mic.scale.setScalar(1 + Math.sin(s * 8) * .2); cup.rotation.y = Math.sin(s * .7) * .2; spk.scale.y = 1 + Math.sin(s * 12) * .3;
      lb.scale.setScalar(popIn(t, .2)); chk.scale.setScalar(popIn(t, .6)); chk.rotation.z = Math.sin(s * 5) * .1; aim(st.cam, [Math.sin(s * .6) * .6, 3.0, 8.8], [0, 2.6, 0]); } };
  };
  BUILD.n_passive = () => {
    const st = stage(soft), bit = makeBit(); bit.scale.setScalar(.8); bit.position.set(0, 0, .3); st.scene.add(bit); const hp = wear(bit, C.violet);
    const bugs = [0, 1, 2, 3].map(i => { const b = noiseBug(i); b.scale.setScalar(.5); st.scene.add(b); return b; });
    const lb = textSign(2.2, .44, 'CUSHIONS SEAL IT', { color: C.violet, fg: '#ffffff', size: 56 }); lb.position.set(0, 4.65, .4); st.scene.add(lb);
    return { ...st, update(t, s) { bit.pose({ s, happy: .8, tilt: Math.sin(s * 1.4) * .05 });
      bugs.forEach((b, i) => { const side = i % 2 ? 1 : -1, x = (s * 1.3 + i * .7) % 2.6, bounce = x > 1.6 ? (x - 1.6) : 0; b.position.set(side * (2.6 - Math.min(x, 1.6) + bounce * 1.4), 1.8 + (i < 2 ? .4 : -.3) + Math.sin(s * 6 + i) * .1, .5); b.rotation.z = s * 5 * side; b.scale.setScalar(.5 * (1 - bounce * .5)); });
      lb.scale.setScalar(popIn(t, .3)); aim(st.cam, [0, 2.8, 9.0], [0, 2.3, 0]); } };
  };
  function flipSet() { const st = stage(night), n = ribbon(NOISE, 3.6, .06), a = ribbon(ANTI, 3.6, .06), ch = chip(); ch.scale.setScalar(.6); ch.position.set(1.35, 4.65, .3); st.scene.add(n, a, ch); return { st, n, a, ch }; }
  const noiseF = (x, s) => Math.sin(x * 3 - s * 5) * .42 + Math.sin(x * 5.3 - s * 7.1) * .12;
  BUILD.n_flip = () => {
    const { st, n, a, ch } = flipSet(); n.position.set(0, 3.6, 0); a.position.set(0, 1.7, 0);
    const l1 = textSign(1.4, .4, 'NOISE', { color: NOISE, fg: '#fff', size: 62 }), l2 = textSign(1.6, .4, 'ANTI-NOISE', { color: ANTI, fg: '#0b3a55', size: 56 }); l1.position.set(-1.0, 4.45, .2); l2.position.set(-1.0, 2.55, .2); st.scene.add(l1, l2);
    const arrows = [0, 1, 2, 3].map(i => { const m = textSign(.36, .36, i % 2 ? '↓' : '↑', { color: 0xffffff, fg: '#1d2442', size: 80, depth: .06 }); st.scene.add(m); return m; });
    return { ...st, update(t, s) { n.update(x => noiseF(x, s)); const f = ease(seg(t, .2, .5)); a.update(x => -noiseF(x, s) * f); a.visible = t > .18;
      ch.rotation.z = Math.sin(s * 6) * .05; l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .3));
      arrows.forEach((m, i) => { const x = -.3 + i * .55, top = i % 2 === 0; m.position.set(x, (top ? 3.6 : 1.7) + (top ? 1 : -1) * .75, .3); m.scale.setScalar(t > .55 ? .8 : 0); });
      aim(st.cam, [0, 2.9, 9.2], [0, 2.75, 0]); } };
  };
  BUILD.n_cancel = () => {
    const { st, n, a } = flipSet(); const flat = ribbon(0xffffff, 3.6, .04); st.scene.add(flat);
    const sp = sparkles(20, [0, 2.6, .2], 1.6, 0xffffff, 6); st.scene.add(sp);
    const ok = textSign(1.7, .46, 'SILENCE', { color: 0xffffff, fg: '#1d2442', size: 70 }); ok.position.set(0, 4.5, .3); st.scene.add(ok);
    return { ...st, update(t, s) { const m = ease(seg(t, .05, .45)); n.position.set(0, lerp(3.6, 2.6, m), 0); a.position.set(0, lerp(1.7, 2.6, m), 0);
      const fade = seg(t, .45, .6); n.update(x => noiseF(x, s) * (1 - fade)); a.update(x => -noiseF(x, s) * (1 - fade)); n.visible = a.visible = fade < 1;
      flat.position.set(0, 2.6, 0); flat.update(x => 0); flat.visible = fade > .3; sp.visible = fade > .5; sp.update(s); ok.scale.setScalar(popIn(t, .62));
      aim(st.cam, [0, 2.9, 9.2], [0, 2.75, 0]); } };
  };
  BUILD.n_fast = () => {
    const { st, n, a, ch } = flipSet(); n.position.set(0, 3.4, 0); a.position.set(0, 1.9, 0); ch.scale.setScalar(.9); ch.position.set(0, .7, .8);
    const cnt = sign(2.6, .55, () => {}, { color: 0xffffff }); cnt.position.set(0, 4.65, .3); st.scene.add(cnt);
    const drops = [-1, 1].map(d => { const m = M(SPH(.06, 10, 8), plastic(0x7fd8ff, { roughness: .05 }), { scale: [1, 1.4, 1], shadow: false }); st.scene.add(m); return m; });
    return { ...st, update(t, s) { const jit = Math.floor(s * 6); n.update(x => noiseF(x, s) + Math.sin(x * 11 + jit) * .1); a.update(x => -(noiseF(x, s) + Math.sin(x * 11 + jit) * .1));
      ch.rotation.z = Math.sin(s * 30) * .04; ch.position.y = .7 + Math.abs(Math.sin(s * 10)) * .06;
      drops.forEach((m, i) => { const u = frac(s * .9 + i * .5); m.position.set((i ? .55 : -.6), 1.3 - u * .6, 1.0); m.visible = u < .9; });
      cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, 'adjusting ×' + (Math.floor(s * 2400)).toLocaleString('en-US'), w / 2, h / 2 + 4, h * .5, '#0a8fb5', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .05));
      aim(st.cam, [0, 2.8, 9.2], [0, 2.65, 0]); } };
  };
  function sourceIcon(kind) {
    const g = new THREE.Group();
    if (kind === 'plane') { g.add(M(new THREE.CapsuleGeometry(.22, 1.2, 8, 16), plastic(0xffffff), { rot: [0, 0, Math.PI / 2] }), M(RB(.3, .05, 1.4, .02), plastic(0xc9cdd8), {}), M(RB(.2, .4, .05, .02), plastic(C.red), { pos: [-.65, .25, 0] })); }
    else if (kind === 'fan') { g.add(M(new THREE.TorusGeometry(.5, .05, 8, 32), plastic(0xc9cdd8), {})); const bl = new THREE.Group(); for (let i = 0; i < 3; i++) bl.add(M(RB(.42, .14, .03, .05), plastic(ANTI), { pos: [Math.cos(i * 2.09) * .22, Math.sin(i * 2.09) * .22, 0], rot: [0, 0, i * 2.09] })); g.add(bl); g.userData.spin = bl; }
    else { g.add(M(RB(.9, .55, .5, .1), plastic(0x8a93a8), {}), M(new THREE.CylinderGeometry(.08, .08, .5, 12), metal(0xc9cdd8), { pos: [.25, .45, 0] })); }
    return g;
  }
  BUILD.n_low = () => {
    const st = stage(soft), srcs = ['plane', 'fan', 'engine'].map((k, i) => { const g = sourceIcon(k); g.position.set(-1.25 + i * 1.25, 4.3 - (i % 2) * .4, 0); g.scale.setScalar(.72); st.scene.add(g); return g; });
    const rb = ribbon(C.violet, 3.4, .07), flat = ribbon(0x5ce06a, 3.4, .05); rb.position.set(0, 2.5, 0); flat.position.set(0, 2.5, 0); st.scene.add(rb, flat);
    const bit = makeBit(); bit.scale.setScalar(.5); bit.position.set(0, .55, .8); st.scene.add(bit, pedestal(.6, 0xffffff, C.violet)); st.scene.children.at(-1).position.set(0, 0, .8); st.scene.children.at(-1).scale.set(1, 1.4, 1); wear(bit, C.pink);
    const chk = textSign(.5, .5, '✓', { color: 0x3cc85a, fg: '#fff', size: 110 }); chk.position.set(1.4, 2.5, .5); st.scene.add(chk);
    return { ...st, update(t, s) { const f = 1 - ease(seg(t, .3, .6)); rb.update(x => Math.sin(x * 2 - s * 4) * .5 * f); flat.visible = f < .2; flat.update(x => 0);
      srcs.forEach((g, i) => { g.rotation.z = Math.sin(s * 3 + i) * .1; g.position.y = 4.3 - (i % 2) * .4 + Math.sin(s * 5 + i) * .05; g.position.x = -1.25 + i * 1.25; if (g.userData.spin) g.userData.spin.rotation.z = s * 12; });
      bit.pose({ s, happy: 1 - f, tilt: Math.sin(s * 1.3) * .05 }); chk.scale.setScalar(popIn(t, .6)); aim(st.cam, [0, 2.9, 9.0], [0, 2.6, 0]); } };
  };
  BUILD.n_high = () => {
    const st = stage(warm()), plates = [0, 1, 2].map(i => { const p = M(new THREE.CylinderGeometry(.45, .3, .08, 32), plastic(0xffffff), {}); st.scene.add(p); return p; });
    const blah = textSign(1.2, .44, 'blah blah', { color: 0xffffff, fg: '#1d2442', size: 54 }); blah.position.set(1.0, 4.4, .2); st.scene.add(blah);
    const spiky = ribbon(C.amber, 3.4, .05); spiky.position.set(0, 3.2, 0); st.scene.add(spiky);
    const wall = M(RB(3.2, .5, .6, .2), plastic(0x2a3046, { roughness: .8, clearcoat: 0 }), { pos: [0, 2.2, .2] }); st.scene.add(wall);
    const lb = textSign(1.8, .42, 'CUSHIONS BLOCK', { color: C.violet, fg: '#fff', size: 56 }); lb.position.set(0, 1.5, .8); st.scene.add(lb);
    return { ...st, update(t, s) { plates.forEach((p, i) => { const h = hop(frac(s * .7 + i * .33) * 1.4, .9, .5); p.position.set(-.7 + i * .35, 4.0 + h.y, -.2 + i * .1); p.rotation.set(Math.sin(s * 9 + i) * .4, 0, Math.sin(s * 7 + i) * .4); });
      spiky.update(x => Math.sin(x * 14 - s * 20) * .3 * (.5 + .5 * Math.sin(x * 3 + s * 9)) * (1 - seg(t, .55, .7) * .6)); blah.rotation.z = Math.sin(s * 9) * .06;
      wall.visible = t > .5; wall.scale.setScalar(popIn(t, .5)); lb.scale.setScalar(popIn(t, .6)); aim(st.cam, [0, 2.9, 9.0], [0, 2.75, 0]); } };
  };
  function warm() { return { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 }; }
  BUILD.n_trans = () => {
    const st = stage({ top: '#bfe4ff', bottom: '#d8f2c2', floor: 0x9dd67f }), bit = makeBit(); bit.scale.setScalar(.7); bit.position.set(0, 0, .5); st.scene.add(bit); const hp = wear(bit, C.lime);
    const notes = [0, 1, 2, 3, 4].map(i => { const n = textSign(.36, .36, '♪', { color: [C.amber, C.pink, ANTI, C.violet, C.lime][i], fg: '#1d2442', size: 90, depth: .08 }); st.scene.add(n); return n; });
    const bird = G(M(SPH(.3, 20, 14), plastic(0x5f8cff), {}), M(new THREE.ConeGeometry(.08, .2, 8), plastic(C.amber), { pos: [.32, 0, 0], rot: [0, 0, -Math.PI / 2] })); st.scene.add(bird);
    const lb = textSign(2.2, .44, 'TRANSPARENCY MODE', { color: C.lime, fg: '#14320a', size: 54 }); lb.position.set(0, 4.4, .3); st.scene.add(lb);
    return { ...st, update(t, s) { bit.pose({ s, happy: 1, waveR: seg(t, .5, .6) * (1 - seg(t, .85, .95)), tilt: Math.sin(s * 1.5) * .06 });
      bird.position.set(-1.4 + Math.sin(s * .9) * .3, 3.7 + Math.abs(Math.sin(s * 6)) * .2, 0); bird.rotation.z = Math.sin(s * 6) * .2;
      notes.forEach((n, i) => { const u = frac(s * .5 + i / 5); n.position.set(lerp(-1.2, -.6, u), lerp(3.6, 2.0, u) + Math.sin(u * 9) * .1, .6); n.scale.setScalar(Math.sin(u * Math.PI) * .9); });
      lb.scale.setScalar(popIn(t, .1)); aim(st.cam, [Math.sin(s * .6) * .6, 2.8, 8.8], [0, 2.3, 0]); } };
  };
  BUILD.n_pressure = () => {
    const st = stage(soft), bit = makeBit(); bit.scale.setScalar(.85); bit.position.set(0, 0, .3); st.scene.add(bit); wear(bit, C.pink);
    const arrows = [-1, 1].map(d => { const a = textSign(.5, .5, d < 0 ? '→' : '←', { color: C.amber, fg: '#3a2400', size: 100 }); st.scene.add(a); return a; });
    const q = textSign(.5, .5, '?', { color: C.violet, fg: '#fff', size: 110 }); q.position.set(.9, 3.6, .5); st.scene.add(q);
    const nothing = textSign(2.2, .42, 'NOTHING THERE', { color: 0xffffff, fg: '#1d2442', size: 58 }); nothing.position.set(0, 4.55, .5); st.scene.add(nothing);
    return { ...st, update(t, s) { const press = seg(t, .1, .2) * (1 - seg(t, .55, .65)), squeeze = press * Math.abs(Math.sin(s * 3)) * .08;
      bit.pose({ s, squash: -squeeze, lookY: Math.sin(s * 2) * .4 * press, sad: press * .5, tilt: Math.sin(s * 1.2) * .1 });
      arrows.forEach((a, i) => { a.position.set((i ? 1 : -1) * (1.35 - Math.abs(Math.sin(s * 3)) * .15), 2.2, .6); a.scale.setScalar(press * 1.3); });
      q.scale.setScalar(t > .25 && t < .65 ? 1 : 0); q.rotation.z = Math.sin(s * 5) * .2; nothing.scale.setScalar(popIn(t, .66));
      aim(st.cam, [0, 2.8, 9.0], [0, 2.4, 0]); } };
  };
  BUILD.n_battery = () => {
    const st = stage(night), hp = makeHeadphones(C.pink, 1.1); hp.position.set(0, 3.0, 0); st.scene.add(hp);
    const bat = new THREE.Group(); bat.position.set(0, 1.55, .8); st.scene.add(bat);
    bat.add(M(RB(1.8, .7, .4, .15), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .3, roughness: .05, depthWrite: false }), { shadow: false }), M(RB(.12, .3, .3, .04), plastic(0xc9cdd8), { pos: [.97, 0, 0] }));
    const fill = M(RB(1, .55, .32, .08), plastic(0x5ce06a), {}); bat.add(fill);
    const lb = textSign(2.2, .44, 'ALWAYS WORKING', { color: C.amber, fg: '#3a2400', size: 58 }); lb.position.set(0, 4.65, .3); st.scene.add(lb);
    const zz = waves(ANTI, 4, 1.6, 1.2, .03); zz.position.set(0, 3.2, .2); st.scene.add(zz);
    return { ...st, update(t, s) { const lvl = lerp(.95, .55, ease(seg(t, .1, .9))); fill.scale.x = 1.6 * lvl; fill.position.x = -.8 + .8 * lvl; fill.material.color.setHex(lvl > .7 ? 0x5ce06a : 0xffc44d);
      hp.rotation.y = Math.sin(s * .8) * .4; zz.update(s); lb.scale.setScalar(popIn(t, .2)); aim(st.cam, [0, 2.8, 9.0], [0, 2.7, 0]); } };
  };
}
