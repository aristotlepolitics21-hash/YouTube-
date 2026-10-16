// Sets for Tech Shorts episode 7: How a Microwave Actually Heats Food (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { waves, screenFace } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const kitchen = { top: '#ffe9c4', bottom: '#ffc6a3', floor: 0xffbd98 }, cool = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, night = { top: '#1e2550', bottom: '#5b4a9a', floor: 0x52448e, hemi: .9 };
  const WAVE = 0xffb347;

  // ---------- props ----------
  function makeMicrowave(o = {}) {
    const g = new THREE.Group(), W = 3.0, H = 1.9, D = 1.8;
    g.add(M(RB(W, H, D, .2), plastic(0xf5f5f5), { pos: [0, H / 2, 0] }));
    const glow = M(RB(2.0, 1.5, 1.4, .05), new THREE.MeshStandardMaterial({ color: 0x1a1208, emissive: 0xffa040, emissiveIntensity: 0 }), { pos: [-.35, H / 2, .1], shadow: false }); g.add(glow);
    const door = M(RB(2.15, 1.6, .06, .08), new THREE.MeshPhysicalMaterial({ color: 0x141414, roughness: .05, transparent: true, opacity: .45 }), { pos: [-.35, H / 2, D / 2 + .01], shadow: false }); g.add(door);
    const disp = textSign(.6, .26, '0:30', { color: 0x1d2442, fg: '#5ff3ff', font: MONO, size: 64, depth: .04 }); disp.position.set(1.12, 1.45, D / 2 + .03); g.add(disp);
    [0, 1, 2].forEach(i => g.add(M(new THREE.CylinderGeometry(.09, .09, .05, 20), plastic(0x9aa3bd), { pos: [1.12, 1.0 - i * .28, D / 2 + .03], rot: [Math.PI / 2, 0, 0] })));
    const plate = M(new THREE.CylinderGeometry(.6, .6, .04, 40), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, transparent: true, opacity: .7 }), { pos: [-.35, .25, .1] }); g.add(plate);
    const bowl = G(M(new THREE.SphereGeometry(.35, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), plastic(o.bowl ?? C.pink, { side: THREE.DoubleSide }), { pos: [0, .35, 0] }), M(new THREE.CircleGeometry(.33, 32), plastic(0xff8a3d), { pos: [0, .33, 0], rot: [-Math.PI / 2, 0, 0] }));
    bowl.position.set(-.35, .22, .1); g.add(bowl);
    g.userData = { glow, plate, bowl, disp, door }; return g;
  }
  function makeMagnetron() {
    const g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(.55, .55, .9, 32), metal(0xc9cdd8), {}));
    for (let i = 0; i < 6; i++) g.add(M(new THREE.CylinderGeometry(.75, .75, .04, 32), metal(0xa9b0c2), { pos: [0, -.35 + i * .14, 0] }));
    const core = M(new THREE.CylinderGeometry(.18, .18, .4, 16), glowM(WAVE, 3), { pos: [0, .65, 0], shadow: false }); g.add(core);
    const f = screenFace(.6, .4, '#141a2c', '#ffd36e'); f.position.set(0, .05, .56); g.add(f); g.userData.core = core; return g;
  }
  function ribbonZig(color, pts) { const cur = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .1); const m = M(new THREE.TubeGeometry(cur, 120, .04, 6), glowM(color, 2.6), { shadow: false }); m.curve = cur; return m; }
  // a water molecule: big red oxygen with two white hydrogens (the positive end)
  function makeWater(s = 1) {
    const g = new THREE.Group(); g.add(M(SPH(.5, 32, 24), plastic(0xff5a5a)));
    [-1, 1].forEach(d => g.add(M(SPH(.3, 24, 16), plastic(0xffffff), { pos: [d * .42, -.38, 0] })));
    [-1, 1].forEach(d => g.add(M(new THREE.CapsuleGeometry(.04, .06, 4, 8), new THREE.MeshBasicMaterial({ color: 0x141a2c }), { pos: [d * .15, .1, .48], shadow: false })));
    g.scale.setScalar(s); return g;
  }
  const charge = (s, txt, col) => textSign(.34, .34, txt, { color: col, fg: '#ffffff', size: 90, depth: .06 });

  // ---------- sets ----------
  BUILD.m_hook = () => {
    const st = stage(kitchen), mw = makeMicrowave(); mw.position.set(0, .9, 0); st.scene.add(mw, M(RB(4, .2, 2.4, .06), plastic(0xffffff), { pos: [0, .8, 0] }), M(RB(3.8, .8, 2.2, .06), plastic(0x8fb8ff), { pos: [0, .4, 0] }));
    const mols = [0, 1, 2, 3].map(() => { const w = makeWater(.32); st.scene.add(w); return w; });
    const steam = sparkles(12, [-.35, 2.4, .3], .5, 0xffffff, 3); st.scene.add(steam);
    return { ...st, update(t, s) { const { glow, plate, bowl, disp } = mw.userData; glow.material.emissiveIntensity = 1.4 + Math.sin(s * 9) * .3; plate.rotation.y = s; bowl.rotation.y = s;
      mols.forEach((w, i) => { const a = s * 2 + i * 1.57; w.position.set(-.35 + Math.cos(a) * 1.25, 3.4 + Math.sin(a * 1.3) * .35 + i * .12, .6 + Math.sin(a) * .3); w.rotation.z = Math.sin(s * 14 + i) * .9; });
      steam.update(s); disp.userData.redraw((x, w, h) => { x.fillStyle = '#1d2442'; x.fillRect(0, 0, w, h); label(x, '0:' + String(30 - Math.floor(s) % 30).padStart(2, '0'), w / 2, h / 2 + 3, h * .62, '#5ff3ff', 700, 'center', MONO); });
      mw.rotation.y = Math.sin(s * .7) * .2; mw.position.y = .9 + Math.abs(Math.sin(s * 9)) * .015;
      aim(st.cam, [Math.sin(s * .4) * 1.2, 3.0, 9.0], [0, 2.3, 0]); } };
  };
  BUILD.m_title = (p) => {
    const st = stage({ top: '#ffd1a8', bottom: '#ffb3c6', floor: 0xffa8bf }); st.scene.add(pedestal(1.6, 0xffffff, C.amber));
    const mw = makeMicrowave(); mw.scale.setScalar(.72); mw.position.set(0, .4, 0); st.scene.add(mw);
    const s1 = textSign(3.5, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 92 }), s2 = textSign(3.3, .72, p.bottom, { color: C.amber, fg: '#3a2400', size: 96 }); s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { const { glow, plate, bowl } = mw.userData; glow.material.emissiveIntensity = 1.3; plate.rotation.y = s; bowl.rotation.y = s; const b = Math.abs(Math.sin(s * 4)); mw.position.y = .4 + b * .1; mw.scale.set(.72 + b * .02, .72 - b * .02, .72); mw.rotation.y = Math.sin(s * 1.2) * .3;
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.4], [0, 2.4, 0]); } };
  };
  BUILD.m_magnetron = () => {
    const st = stage(night), mg = makeMagnetron(); mg.scale.setScalar(1.4); mg.position.set(0, 2.6, 0); st.scene.add(mg);
    const plug = G(M(RB(.4, .5, .3, .08), plastic(0xffffff)), M(new THREE.CylinderGeometry(.04, .04, 1.4, 8), plastic(0x2a3046), { pos: [0, -.9, 0] })); plug.position.set(-1.4, 2.0, .3); st.scene.add(plug);
    const zap = [0, 1, 2, 3, 4].map(() => { const z = G(M(SPH(.06, 10, 8), glowM(0xffe14d, 5), { shadow: false }), sprite(0xffe14d, .4, .8)); st.scene.add(z); return z; });
    const wv = waves(WAVE, 5, 2.6, .9, .04); wv.position.set(0, 3.9, 0); st.scene.add(wv);
    const lb = textSign(1.8, .44, 'MAGNETRON', { color: WAVE, fg: '#3a2400', size: 64 }); lb.position.set(0, 4.75, .4); st.scene.add(lb);
    return { ...st, update(t, s) { zap.forEach((z, i) => { const u = frac(s * 1.2 + i / 5); z.position.set(lerp(-1.4, -.6, u), lerp(1.3, 2.4, u), .4); });
      mg.userData.core.material.emissiveIntensity = 2.5 + Math.sin(s * 12) * 1; mg.rotation.y = Math.sin(s * .8) * .3; mg.scale.y = 1.4 + Math.sin(s * 10) * .02; wv.update(s, seg(t, .3, .4));
      lb.scale.setScalar(popIn(t, .15)); aim(st.cam, [0, 2.8, 9.0], [0, 2.6, 0]); } };
  };
  BUILD.m_guide = () => {
    const st = stage(cool), box = new THREE.Group(); box.position.set(0, 2.3, 0); st.scene.add(box);
    box.add(M(RB(3.2, 2.6, 2.0, .1), new THREE.MeshPhysicalMaterial({ color: 0xc9cdd8, metalness: .6, roughness: .3, transparent: true, opacity: .25, side: THREE.DoubleSide, depthWrite: false }), { shadow: false }));
    const guide = M(RB(.5, .9, .5, .06), metal(0xc9cdd8), { pos: [1.15, 1.6, 0] }); box.add(guide);
    const mg = makeMagnetron(); mg.scale.setScalar(.45); mg.position.set(1.15, 2.4, 0); box.add(mg);
    const pts = [V(1.15, 1.2, 0), V(1.15, .9, .2), V(-1.5, .3, .4), V(.6, -1.2, .2), V(1.5, -.1, -.3), V(-1.2, -.9, .3), V(-.2, 1.2, -.2), V(1.4, .6, .3)];
    const zig = ribbonZig(WAVE, pts); box.add(zig);
    const dot = G(M(SPH(.08, 10, 8), glowM(0xffe14d, 5), { shadow: false }), sprite(WAVE, .7, .9)); box.add(dot);
    return { ...st, update(t, s) { const k = seg(t, .1, .8); zig.geometry.setDrawRange(0, Math.floor(k * zig.geometry.index.count / 6) * 6); dot.position.copy(zig.curve.getPoint(Math.min(1, k + .001))); dot.visible = k > 0 && k < 1;
      box.rotation.y = Math.sin(s * .5) * .3; aim(st.cam, [0, 3.2, 9.4], [0, 2.6, 0]); } };
  };
  BUILD.m_water = () => {
    const st = stage(cool), w = makeWater(1.6); w.position.set(0, 2.7, 0); st.scene.add(w);
    const minus = charge(0, '−', 0x3d6bff), plus1 = charge(0, '+', C.red), plus2 = charge(0, '+', C.red); st.scene.add(minus, plus1, plus2);
    const lb = textSign(1.9, .44, 'LOPSIDED!', { color: C.violet, fg: '#ffffff', size: 64 }); lb.position.set(0, 4.75, .4); st.scene.add(lb);
    return { ...st, update(t, s) { w.rotation.set(Math.sin(s * .9) * .2, Math.sin(s * .7) * .5, Math.sin(s * 1.2) * .1); w.position.y = 2.7 + Math.sin(s * 2) * .08;
      minus.position.set(0, 3.95, .8); plus1.position.set(-1.1, 1.65, .8); plus2.position.set(1.1, 1.65, .8); [minus, plus1, plus2].forEach((c, i) => c.scale.setScalar(popIn(t, .3 + i * .1) * (1 + Math.sin(s * 5 + i) * .06)));
      lb.scale.setScalar(popIn(t, .1)); lb.rotation.z = Math.sin(s * 4) * .04; aim(st.cam, [0, 2.9, 9.0], [0, 2.75, 0]); } };
  };
  BUILD.m_flip = () => {
    const st = stage(night), r = rng(5), mols = [];
    for (let i = 0; i < 9; i++) { const w = makeWater(.45); w.position.set(-1.2 + (i % 3) * 1.2, 1.5 + Math.floor(i / 3) * 1.2, (r() - .5) * .4); st.scene.add(w); mols.push([w, r()]); }
    const arrow = G(M(RB(.12, 2.6, .12, .04), glowM(WAVE, 2.5), { shadow: false }), M(new THREE.ConeGeometry(.3, .5, 16), glowM(WAVE, 2.5), { pos: [0, 1.5, 0], shadow: false })); arrow.position.set(1.85, 2.7, 0); arrow.scale.setScalar(.9); st.scene.add(arrow);
    const cnt = sign(2.6, .52, () => {}, { color: 0xffffff }); cnt.position.set(-.2, 4.75, .3); st.scene.add(cnt);
    return { ...st, update(t, s) { const f = Math.sin(s * 9), dir = f > 0 ? 0 : Math.PI; arrow.rotation.z = lerp(arrow.rotation.z, dir, .5); arrow.rotation.z = f > 0 ? 0 : Math.PI;
      mols.forEach(([w, ph]) => { w.rotation.z = (f > 0 ? 0 : Math.PI) + Math.sin(s * 30 + ph * 9) * .25; w.position.x += Math.sin(s * 25 + ph * 9) * .004; });
      cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, Math.round(s * 2.45e8 * 10).toLocaleString('en-US') + ' flips', w / 2, h / 2 + 4, h * .46, '#c46a00', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .2));
      aim(st.cam, [0, 2.9, 9.2], [0, 2.7, 0]); } };
  };
  BUILD.m_heat = () => {
    const st = stage(kitchen), bowl = G(M(new THREE.SphereGeometry(1.3, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), plastic(C.pink, { side: THREE.DoubleSide }), {}), M(new THREE.CircleGeometry(1.22, 48), plastic(0xff8a3d), { pos: [0, -.1, 0], rot: [-Math.PI / 2, 0, 0] }));
    bowl.position.set(0, 1.4, 0); st.scene.add(bowl);
    const mols = []; for (let i = 0; i < 10; i++) { const w = makeWater(.18); st.scene.add(w); mols.push(w); }
    const steam = []; for (let i = 0; i < 8; i++) { const p = M(SPH(.18, 16, 12), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .6, roughness: .8 }), { shadow: false }); st.scene.add(p); steam.push(p); }
    const temp = sign(1.5, .5, () => {}, { color: 0xffffff }); temp.position.set(1.2, 3.9, .4); st.scene.add(temp);
    return { ...st, update(t, s) { const h = seg(t, .1, .8);
      mols.forEach((w, i) => { const a = i * .63 + s * (1 + h * 3); w.position.set(Math.cos(a) * .7 * (i % 3 + 1) / 3, 1.38 + Math.sin(s * 20 + i) * .05 * h, Math.sin(a) * .7 * (i % 3 + 1) / 3); w.rotation.set(s * 9 * h, s * 7 * h + i, 0); });
      steam.forEach((p, i) => { const u = frac(s * .4 + i / 8); p.position.set(Math.sin(i * 2 + s) * .5, 1.5 + u * 2.6, Math.cos(i * 3) * .3); p.scale.setScalar((.5 + u) * h); p.material.opacity = (1 - u) * .6 * h; });
      temp.userData.redraw((x, w, ht) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, ht); label(x, Math.round(lerp(5, 72, h)) + ' °C', w / 2, ht / 2 + 4, ht * .6, h > .6 ? '#d42f2f' : '#1d2442', 900, 'center', MONO); }); temp.scale.setScalar(popIn(t, .1));
      aim(st.cam, [Math.sin(s * .5) * .8, 4.0, 8.0], [0, 2.0, 0]); } };
  };
  BUILD.m_spots = () => {
    const st = stage(night), floor = M(RB(3.2, .08, 3.2, .04), metal(0x8a93a8, { roughness: .5 }), { pos: [0, .9, 0] }); st.scene.add(floor);
    const blobs = []; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { const b = G(M(SPH(.22, 16, 12), glowM(0xff6a3d, 2.5), { shadow: false }), sprite(0xff6a3d, 1.0, .7)); b.position.set(-1.2 + i * .6, 1.2, -1.2 + j * .6); st.scene.add(b); blobs.push([b, i, j]); }
    const hot = textSign(1.1, .4, 'HOT', { color: C.red, fg: '#fff', size: 64 }), cold = textSign(1.1, .4, 'COLD', { color: 0x5f8cff, fg: '#fff', size: 64 }); hot.position.set(-.65, 3.1, .2); cold.position.set(.65, 3.1, .2); st.scene.add(hot, cold);
    const zigA = ribbonZig(WAVE, [V(-1.6, 3.6, -1), V(0, 1.4, 0), V(1.6, 3.6, 1)]), zigB = ribbonZig(WAVE, [V(1.6, 3.6, -1), V(0, 1.4, 0), V(-1.6, 3.6, 1)]); st.scene.add(zigA, zigB);
    return { ...st, update(t, s) { const k = seg(t, .05, .4);
      blobs.forEach(([b, i, j]) => { const v = Math.abs(Math.sin((i + .5) * 1.4) * Math.sin((j + .5) * 1.4)), on = v > .55 ? 1 : .15; b.scale.setScalar(Math.max(.01, k * on * (1 + Math.sin(s * 6 + i + j) * .1))); });
      hot.scale.setScalar(popIn(t, .45)); cold.scale.setScalar(popIn(t, .55)); aim(st.cam, [Math.sin(s * .4) * 1.0, 5.0, 7.4], [0, 1.6, 0]); } };
  };
  BUILD.m_turn = () => {
    const st = stage(night), plate = M(new THREE.CylinderGeometry(1.5, 1.5, .08, 48), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, transparent: true, opacity: .75 }), { pos: [0, 1.0, 0] }); st.scene.add(plate);
    const bowl = G(M(new THREE.SphereGeometry(.6, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), plastic(C.pink, { side: THREE.DoubleSide }), { pos: [0, .6, 0] }), M(new THREE.CircleGeometry(.56, 32), plastic(0xff8a3d), { pos: [0, .56, 0], rot: [-Math.PI / 2, 0, 0] })); st.scene.add(bowl);
    const spots = [[-.9, -.4], [.8, .6], [.1, -1.0], [-.3, .9]].map(([x, z]) => { const b = G(M(SPH(.2, 16, 12), glowM(0xff6a3d, 2.5), { shadow: false }), sprite(0xff6a3d, 1.0, .7)); b.position.set(x, 1.25, z); st.scene.add(b); return b; });
    const even = textSign(1.9, .44, 'EVENLY COOKED', { color: 0x5ce06a, fg: '#14320a', size: 58 }); even.position.set(0, 3.6, .4); st.scene.add(even);
    return { ...st, update(t, s) { plate.rotation.y = s * 1.2; const a = s * 1.2; bowl.position.set(Math.cos(a) * .85, 1.0, Math.sin(a) * .85); bowl.rotation.y = -a;
      spots.forEach((b, i) => b.scale.setScalar(1 + Math.sin(s * 5 + i) * .15)); even.scale.setScalar(popIn(t, .6)); aim(st.cam, [Math.sin(s * .4), 4.8, 6.8], [0, 1.4, 0]); } };
  };
  BUILD.m_depth = () => {
    const st = stage(cool), food = new THREE.Group(); food.position.set(0, 2.5, 0); st.scene.add(food);
    const tex = ctex(512, 512); const slab = M(new THREE.CircleGeometry(1.4, 64), new THREE.MeshBasicMaterial({ map: tex.tex, toneMapped: false }), { shadow: false }); food.add(slab);
    food.add(M(new THREE.TorusGeometry(1.4, .06, 10, 64), plastic(0xffffff), {}));
    const arrows = [0, 1, 2, 3].map(i => { const a = textSign(.4, .4, ['↓', '←', '↑', '→'][i], { color: WAVE, fg: '#3a2400', size: 90, depth: .06 }); st.scene.add(a); return a; });
    const cm = textSign(1.7, .42, 'A FEW CM IN', { color: WAVE, fg: '#3a2400', size: 58 }); cm.position.set(0, 4.75, .4); st.scene.add(cm);
    return { ...st, update(t, s) { const inner = lerp(1, .0, ease(seg(t, .45, .95)));
      tex.redraw((x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, inner > .6 ? '#7fb8ff' : inner > .3 ? '#ffc44d' : '#ff6a3d'); g.addColorStop(Math.max(.05, .78 - (1 - inner) * .5), inner > .5 ? '#9fd8ff' : '#ffb347'); g.addColorStop(.85, '#ff6a3d'); g.addColorStop(1, '#ff4a3d'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
      arrows.forEach((a, i) => { const ang = -Math.PI / 2 + i * Math.PI / 2 + Math.PI, pul = Math.sin(s * 5) * .1; a.position.set(Math.cos(ang) * (1.75 - pul), 2.5 + Math.sin(ang) * (1.85 - pul), .3); a.scale.setScalar(popIn(t, .05)); });
      cm.scale.setScalar(popIn(t, .25)); food.rotation.z = Math.sin(s * .8) * .05; aim(st.cam, [0, 2.8, 9.0], [0, 2.65, 0]); } };
  };
  BUILD.m_stir = () => {
    const st = stage(kitchen), bowl = G(M(new THREE.SphereGeometry(1.3, 48, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), plastic(C.violet, { side: THREE.DoubleSide }), {}), M(new THREE.CircleGeometry(1.22, 48), plastic(0xff8a3d), { pos: [0, -.1, 0], rot: [-Math.PI / 2, 0, 0] })); bowl.position.set(0, 1.4, 0); st.scene.add(bowl);
    const spoon = G(M(new THREE.CylinderGeometry(.06, .06, 2.2, 10), metal(0xc9cdd8), { pos: [0, 1.1, 0] }), M(SPH(.22, 16, 12), metal(0xc9cdd8), { pos: [0, 0, 0], scale: [1, .4, 1.4] })); st.scene.add(spoon);
    const swirl = M(new THREE.TorusGeometry(.7, .04, 8, 64, Math.PI * 1.5), glowM(0xffffff, 1.5), { rot: [-Math.PI / 2, 0, 0], shadow: false }); swirl.position.set(0, 1.32, 0); st.scene.add(swirl);
    const bit = makeBit(); bit.scale.setScalar(.5); bit.position.set(1.4, 0, 1.4); bit.rotation.y = -.5; st.scene.add(bit);
    const tm = textSign(1.7, .44, 'STIR · WAIT 1 MIN', { color: 0xffffff, fg: '#1d2442', size: 54 }); tm.position.set(0, 4.0, .3); st.scene.add(tm);
    return { ...st, update(t, s) { const a = s * 4; spoon.position.set(Math.cos(a) * .6, 1.3, Math.sin(a) * .6); spoon.rotation.set(Math.sin(a) * .3, 0, -Math.cos(a) * .3); swirl.rotation.z = -s * 4;
      bit.pose({ s, reachL: .7 + Math.sin(s * 4) * .2, happy: .8 }); tm.scale.setScalar(popIn(t, .3)); aim(st.cam, [Math.sin(s * .5) * .6, 4.0, 8.2], [0, 2.0, 0]); } };
  };
  BUILD.m_ice = () => {
    const st = stage(cool), cube = M(RB(1.7, 1.7, 1.7, .2), new THREE.MeshPhysicalMaterial({ color: 0xbfe9ff, transmission: .2, transparent: true, opacity: .55, roughness: .05, depthWrite: false }), { pos: [0, 2.4, 0], shadow: false }); st.scene.add(cube);
    const mols = []; for (let i = 0; i < 8; i++) { const w = makeWater(.24); w.position.set(-.45 + (i % 2) * .9, 1.95 + Math.floor(i / 4) * .9, -.45 + (Math.floor(i / 2) % 2) * .9); st.scene.add(w); mols.push(w); }
    const pw = sign(2.4, .5, () => {}, { color: 0xffffff }); pw.position.set(0, 4.6, .4); st.scene.add(pw);
    const lock = textSign(1.6, .4, 'LOCKED IN PLACE', { color: 0x5f8cff, fg: '#fff', size: 52 }); lock.position.set(0, 3.85, .6); st.scene.add(lock);
    return { ...st, update(t, s) { const on = frac(s * .5) < .5 && t > .45; mols.forEach((w, i) => { w.rotation.z = Math.sin(s * 30 + i) * (on ? .15 : .04); });
      cube.rotation.y = s * .3; cube.material.color.setHex(on ? 0xd8f0ff : 0xbfe9ff);
      pw.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, 'DEFROST: ' + (t < .45 ? '…' : on ? 'POWER ON' : 'pause'), w / 2, h / 2 + 4, h * .5, on ? '#d42f7f' : '#1d2442', 900, 'center', MONO); }); pw.scale.setScalar(popIn(t, .4));
      lock.scale.setScalar(popIn(t, .15)); aim(st.cam, [Math.sin(s * .5), 3.0, 8.8], [0, 2.6, 0]); } };
  };
  BUILD.m_door = () => {
    const st = stage(night), mesh = new THREE.Group(); mesh.position.set(0, 2.6, 0); st.scene.add(mesh);
    const holes = ctex(512, 512, (x, w, h) => { x.fillStyle = '#2a3046'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,220,140,.95)'; for (let i = 0; i < 12; i++) for (let j = 0; j < 12; j++) { x.beginPath(); x.arc(22 + i * 42, 22 + j * 42, 10, 0, 7); x.fill(); } });
    mesh.add(M(RB(3.2, 3.2, .1, .1), new THREE.MeshBasicMaterial({ map: holes.tex, toneMapped: false }), { shadow: false }));
    const light = []; for (let i = 0; i < 10; i++) { const p = G(M(SPH(.04, 8, 6), glowM(0xfff2c0, 5), { shadow: false }), sprite(0xfff2c0, .3, .9)); st.scene.add(p); light.push(p); }
    const big = []; for (let i = 0; i < 3; i++) { const r = M(new THREE.TorusGeometry(.45, .07, 10, 32), glowM(WAVE, 2.5), { shadow: false }); st.scene.add(r); big.push(r); }
    const l1 = textSign(1.4, .4, 'LIGHT ✓', { color: 0x5ce06a, fg: '#14320a', size: 60 }), l2 = textSign(1.8, .4, 'MICROWAVES ✕', { color: C.red, fg: '#fff', size: 56 }); l1.position.set(-.8, 4.35, .5); l2.position.set(.8, 3.9, .5); st.scene.add(l1, l2);
    return { ...st, update(t, s) { light.forEach((p, i) => { const u = frac(s * .7 + i / 10); p.position.set(-1.2 + (i % 5) * .6, 1.6 + Math.floor(i / 5) * 1.6, lerp(-2, 3, u)); });
      big.forEach((r, i) => { const u = frac(s * .5 + i / 3), z = lerp(-2.5, .1, Math.min(1, u * 1.4)), b = u * 1.4 > 1 ? (u * 1.4 - 1) * 3 : 0; r.position.set(-.6 + i * .6, 2.6 + (i - 1) * .7, z - b); });
      l1.scale.setScalar(popIn(t, .2)); l2.scale.setScalar(popIn(t, .45)); mesh.rotation.y = -.5 + Math.sin(s * .5) * .1; aim(st.cam, [3.5, 3.0, 7.6], [0, 2.6, 0]); } };
  };
  BUILD.m_fork = () => {
    const st = stage(night), plate = M(new THREE.CylinderGeometry(1.4, 1.2, .1, 48), plastic(0xffffff), { pos: [0, 1.4, 0] }); st.scene.add(plate);
    const fork = new THREE.Group(); fork.position.set(0, 1.6, 0); fork.rotation.z = .2; st.scene.add(fork); fork.add(M(RB(.22, .06, 1.6, .03), metal(0xc9cdd8), { pos: [0, 0, .5] }));
    for (let i = 0; i < 4; i++) fork.add(M(RB(.04, .05, .7, .02), metal(0xc9cdd8), { pos: [-.09 + i * .06, 0, -.6] }));
    const sparks = []; for (let i = 0; i < 4; i++) { const sp = sparkles(8, [-.09 + i * .06, 1.65, -1.0], .25, 0x9fd8ff, i + 1); st.scene.add(sp); sparks.push(sp); }
    const bolts = [0, 1, 2].map(i => { const b = textSign(.4, .4, '⚡', { color: 0x9fd8ff, fg: '#1d2442', size: 90, depth: .06 }); st.scene.add(b); return b; });
    const no = textSign(1.6, .44, 'KEEP IT OUT', { color: C.red, fg: '#fff', size: 62 }); no.position.set(0, 4.1, .4); st.scene.add(no);
    return { ...st, update(t, s) { const on = t > .25; sparks.forEach(sp => { sp.visible = on && frac(s * 3) < .6; sp.update(s * 3); });
      bolts.forEach((b, i) => { b.position.set(-.6 + i * .6, 2.6 + Math.sin(s * 9 + i) * .15, -.6); b.scale.setScalar(on && frac(s * 2 + i / 3) < .5 ? .8 : 0); });
      fork.position.y = 1.6 + (on ? Math.abs(Math.sin(s * 20)) * .03 : 0); no.scale.setScalar(popIn(t, .6)); no.rotation.z = Math.sin(s * 7) * .05; aim(st.cam, [Math.sin(s * .5) * .8, 4.2, 7.0], [0, 2.0, 0]); } };
  };
}
