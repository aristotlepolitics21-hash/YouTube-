// Sets for Tech Shorts episode 14: How Your Phone Stores Photos (flash memory, lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { makePhone } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, night = { top: '#141c3d', bottom: '#3b2f6b', floor: 0x3a2f68, hemi: .9 }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };
  const EL = 0x5ff3ff;

  // ---------- props ----------
  function electron(s = 1) { const g = G(M(SPH(.09, 14, 10), glowM(EL, 3.5), { shadow: false }), sprite(EL, .45, .8)); [-1, 1].forEach(d => g.add(M(SPH(.016, 6, 4), new THREE.MeshBasicMaterial({ color: 0x0b3a55 }), { pos: [d * .03, .02, .085], shadow: false }))); g.scale.setScalar(s); return g; }
  // a memory-cell cutaway: silicon base, source/drain, insulated floating gate (the cage), control gate on top
  function makeCell(s = 1) {
    const g = new THREE.Group();
    g.add(M(RB(3.0, .5, 1.2, .06), plastic(0x8a93a8, { roughness: .5 }), { pos: [0, .25, 0] }));
    [-1, 1].forEach(d => g.add(M(RB(.7, .3, 1.2, .05), plastic(0xff9ec4), { pos: [d * 1.1, .6, 0] })));
    const ins = M(RB(1.4, 1.1, 1.0, .08), new THREE.MeshPhysicalMaterial({ color: 0xbfe9ff, transparent: true, opacity: .35, roughness: .05, depthWrite: false }), { pos: [0, 1.15, 0], shadow: false }); g.add(ins);
    const cage = M(RB(1.0, .32, .8, .05), new THREE.MeshPhysicalMaterial({ color: 0xffc44d, transparent: true, opacity: .55, roughness: .3 }), { pos: [0, 1.0, 0], shadow: false }); g.add(cage);
    const top = M(RB(1.3, .3, 1.0, .06), metal(0x9aa3bd), { pos: [0, 1.85, 0] }); g.add(top);
    const lbs = [['CONTROL GATE', 0x9aa3bd, 2.25], ['CAGE', 0xffc44d, 1.0], ['SILICON', 0x8a93a8, .25]].map(([l, c, y]) => { const t = textSign(l.length * .1 + .3, .26, l, { color: c, fg: '#1d2442', size: 40, depth: .04 }); t.position.set(-1.45 + (l.length * .1 + .3) / 2, y, .65); g.add(t); return t; });
    g.userData = { ins, cage, top, lbs }; g.scale.setScalar(s); return g;
  }
  function chipGrid(n = 10, cell = .28) {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(cell * .8, cell * .8, .08), new THREE.MeshBasicMaterial({ toneMapped: false }), n * n), m = new THREE.Matrix4(), c = new THREE.Color();
    im.paint = fn => { let i = 0; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++, i++) { const r = fn(x, y, i) || {}, sc = r.s ?? 1; m.makeScale(sc, sc, sc).setPosition((x - n / 2 + .5) * cell, (n / 2 - y - .5) * cell, .06); im.setMatrixAt(i, m); im.setColorAt(i, c.set(r.c ?? 0x3a4466)); } im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; };
    const g = G(M(RB(n * cell + .3, n * cell + .3, .1, .08), plastic(0x1d2236), {}), im); g.userData.im = im; im.paint(() => ({})); return g;
  }
  const cam = (st, s, y = 2.6, z = 8.8) => aim(st.cam, [Math.sin(s * .5) * .8, y + .25, z], [0, y, 0]);

  // ---------- sets ----------
  BUILD.s_hook = () => {
    const st = stage(night), ph = makePhone(0xff6fb1); ph.scale.setScalar(1.2); ph.position.set(-.6, 2.3, 0); st.scene.add(ph);
    const cage = M(RB(1.0, 1.0, 1.0, .15), new THREE.MeshPhysicalMaterial({ color: 0xffc44d, transparent: true, opacity: .3, roughness: .2, depthWrite: false }), { pos: [1.0, 2.6, .5], shadow: false }); st.scene.add(cage);
    const es = [0, 1, 2, 3, 4].map(() => { const e = electron(1.3); st.scene.add(e); return e; });
    const off = textSign(1.4, .42, 'POWER OFF', { color: 0x2a3046, fg: '#ffffff', size: 56 }); off.position.set(0, 4.45, .4); st.scene.add(off);
    return { ...st, update(t, s) { es.forEach((e, i) => { const a = s * 2 + i * 1.26; e.position.set(1.0 + Math.cos(a) * .28, 2.6 + Math.sin(a * 1.3) * .28, .5 + Math.sin(a) * .25); });
      cage.rotation.y = s * .4; off.scale.setScalar(popIn(t, .55)); cam(st, s, 2.6); } };
  };
  BUILD.s_title = (p) => {
    const st = stage({ top: '#c9f0ff', bottom: '#d6c8ff', floor: 0xcdb8ff }); st.scene.add(pedestal(1.3, 0xffffff, EL));
    const chip = chipGrid(8, .26); chip.position.set(0, 1.7, 0); st.scene.add(chip);
    const s1 = textSign(3.4, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 92 }), s2 = textSign(3.3, .72, p.bottom, { color: EL, fg: '#0b3a55', size: 96 }); s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { chip.userData.im.paint((x, y) => ({ c: Math.sin(s * 4 - x * .6 - y * .4) > .3 ? EL : 0x3a4466 })); chip.rotation.y = Math.sin(s * 1.2) * .35; chip.position.y = 1.7 + Math.abs(Math.sin(s * 3)) * .08;
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.4], [0, 2.5, 0]); } };
  };
  BUILD.s_bits = () => {
    const st = stage(soft), photo = sign(1.8, 1.4, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7ec8ff'); g.addColorStop(.6, '#ffe0b8'); g.addColorStop(.61, '#6fcf6a'); g.addColorStop(1, '#3f9e52'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#fff3a0'; x.beginPath(); x.arc(w * .75, h * .25, w * .1, 0, 7); x.fill(); }, { color: 0xffffff, depth: .06 });
    photo.position.set(-.8, 3.7, 0); st.scene.add(photo);
    const r = rng(2), bits = []; for (let i = 0; i < 26; i++) { const b = textSign(.22, .22, r() < .5 ? '0' : '1', { color: EL, fg: '#0b3a55', size: 70, font: MONO, depth: .04 }); st.scene.add(b); bits.push([b, r(), r()]); }
    const chip = chipGrid(8, .24); chip.position.set(.6, 1.5, 0); st.scene.add(chip);
    const lb = textSign(1.6, .4, 'FLASH MEMORY', { color: EL, fg: '#0b3a55', size: 56 }); lb.position.set(.6, 2.85, .5); st.scene.add(lb);
    return { ...st, update(t, s) { bits.forEach(([b, a, c]) => { const u = frac(s * .5 + a); b.position.set(lerp(-.8 + (c - .5) * 1.4, .6 + (a - .5) * 1.6, u), lerp(3.4, 1.6, u), .3); b.rotation.z = u * 5; b.scale.setScalar(Math.sin(u * Math.PI) * (t > .1 ? 1 : 0)); });
      chip.userData.im.paint((x, y, i) => ({ c: frac(i * .37 + s * .3) < .4 ? EL : 0x3a4466 })); photo.rotation.z = Math.sin(s * 2) * .05; lb.scale.setScalar(popIn(t, .45)); cam(st, s, 2.5); } };
  };
  BUILD.s_cells = () => {
    const st = stage(night), chip = chipGrid(14, .2); chip.position.set(0, 2.6, 0); st.scene.add(chip);
    const cnt = sign(2.8, .5, () => {}, { color: 0xffffff }); cnt.position.set(0, 4.55, .4); st.scene.add(cnt);
    const zoom = textSign(1.6, .4, '256 GB', { color: EL, fg: '#0b3a55', size: 64, font: MONO }); zoom.position.set(0, 3.95, .6); st.scene.add(zoom);
    return { ...st, update(t, s) { chip.userData.im.paint((x, y, i) => ({ c: frac(Math.sin(i * 12.9) * 43758 + s * .5) < .5 ? EL : 0x2a3046 })); chip.rotation.x = -.4 + Math.sin(s * .5) * .1;
      const v = Math.round(lerp(0, 2.05e12, Math.pow(ease(seg(t, .2, .85)), 2))); cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, v.toLocaleString('en-US') + ' bits', w / 2, h / 2 + 4, h * .44, '#0a8fb5', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .2));
      zoom.scale.setScalar(popIn(t, .1)); cam(st, s, 2.6); } };
  };
  BUILD.s_cage = () => {
    const st = stage(soft), cell = makeCell(1); cell.position.set(0, .9, 0); st.scene.add(cell);
    return { ...st, update(t, s) { const U = cell.userData; U.lbs.forEach((l, i) => l.scale.setScalar(popIn(t, .1 + i * .15))); U.cage.material.emissive = new THREE.Color(0xffc44d); U.cage.material.emissiveIntensity = t > .25 ? .4 + Math.sin(s * 5) * .3 : 0;
      cell.rotation.y = Math.sin(s * .6) * .35; aim(st.cam, [Math.sin(s * .5) * .8 + .2, 2.9, 8.6], [0, 1.65, 0]); } };
  };
  BUILD.s_write = () => {
    const st = stage(night), cell = makeCell(1); cell.position.set(0, .9, 0); st.scene.add(cell);
    const es = [0, 1, 2, 3, 4, 5].map(() => { const e = electron(1); st.scene.add(e); return e; });
    const bolt = textSign(.5, .5, '⚡', { color: 0xffe14d, fg: '#3a2400', size: 100 }); bolt.position.set(1.1, 3.6, .4); st.scene.add(bolt);
    const v = textSign(1.4, .4, 'VOLTAGE JOLT', { color: 0xffe14d, fg: '#3a2400', size: 52 }); v.position.set(-.6, 3.6, .4); st.scene.add(v);
    return { ...st, update(t, s) { const jolt = t > .25; bolt.scale.setScalar(popIn(t, .2) * (1 + Math.sin(s * 20) * .1 * (jolt ? 1 : 0))); v.scale.setScalar(popIn(t, .25)); cell.userData.top.material.emissive = new THREE.Color(0xffe14d); cell.userData.top.material.emissiveIntensity = jolt ? .6 + Math.sin(s * 20) * .4 : 0;
      es.forEach((e, i) => { const at = .3 + i * .08, k = ease(seg(t, at, at + .15)); e.position.set(-.4 + i * .16, k < 1 ? lerp(1.25, 1.9, k) : 1.9 + Math.sin(s * 6 + i) * .03, .3); e.visible = t > .25; });
      aim(st.cam, [Math.sin(s * .5) * .8 + .2, 2.9, 8.6], [0, 1.75, 0]); } };
  };
  BUILD.s_keep = () => {
    const st = stage(night), cell = makeCell(1); cell.position.set(0, .9, 0); st.scene.add(cell);
    const es = [0, 1, 2, 3, 4, 5].map(() => { const e = electron(1); st.scene.add(e); return e; });
    const bat = G(M(RB(1.2, .5, .3, .1), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, depthWrite: false }), { shadow: false }), M(RB(.1, .2, .2, .03), plastic(0xc9cdd8), { pos: [.65, 0, 0] })); bat.position.set(.8, 3.7, .4); st.scene.add(bat);
    const fill = M(RB(.15, .38, .22, .05), plastic(C.red), { pos: [-.47, 0, 0] }); bat.add(fill);
    const ok = textSign(1.6, .4, 'STILL THERE ✓', { color: 0x5ce06a, fg: '#14320a', size: 54 }); ok.position.set(-.6, 3.7, .4); st.scene.add(ok);
    return { ...st, update(t, s) { es.forEach((e, i) => e.position.set(-.4 + i * .16 + Math.sin(s * 5 + i) * .03, 1.0 + Math.sin(s * 7 + i * 2) * .06, .3)); fill.visible = frac(s * 1.2) < .5; ok.scale.setScalar(popIn(t, .45)); bat.scale.setScalar(popIn(t, .1));
      aim(st.cam, [Math.sin(s * .5) * .8 + .2, 2.9, 8.6], [0, 1.75, 0]); } };
  };
  BUILD.s_read = () => {
    const st = stage(soft), cells = [0, 1].map(i => { const c = makeCell(.6); c.position.set(0, .5 + i * 1.75, 0); c.userData.lbs.forEach(l => l.visible = false); st.scene.add(c); return c; });
    const es = []; for (let i = 0; i < 5; i++) { const e = electron(.7); st.scene.add(e); es.push(e); }
    const flows = [0, 1].map(i => { const a = []; for (let j = 0; j < 6; j++) { const p = G(M(SPH(.05, 8, 6), glowM(0x5ce06a, 4), { shadow: false })); st.scene.add(p); a.push(p); } return a; });
    const vals = [textSign(.5, .5, '1', { color: 0x5ce06a, fg: '#14320a', size: 100, font: MONO }), textSign(.5, .5, '0', { color: 0xff9ec4, fg: '#5a1030', size: 100, font: MONO })]; vals[0].position.set(1.4, .85, .5); vals[1].position.set(1.4, 2.6, .5); st.scene.add(...vals);
    const l1 = textSign(1.1, .3, 'EMPTY', { color: 0xffffff, fg: '#1d2442', size: 44 }), l2 = textSign(1.1, .3, 'FULL', { color: 0xffc44d, fg: '#3a2400', size: 44 }); l1.position.set(-1.35, 1.3, .5); l2.position.set(-1.35, 3.05, .5); st.scene.add(l1, l2);
    return { ...st, update(t, s) { es.forEach((e, i) => e.position.set(-.25 + i * .12, 2.25 + .35 + Math.sin(s * 6 + i) * .02, .2));
      flows.forEach((a, k) => a.forEach((p, j) => { const sp = k === 0 ? 1.2 : .25, u = frac(s * sp + j / 6); p.position.set(lerp(-.9, .9, u), .5 + k * 1.75 + .32, .4); }));
      vals.forEach((v, i) => v.scale.setScalar(popIn(t, .45 + i * .1))); [l1, l2].forEach((l, i) => l.scale.setScalar(popIn(t, .15 + i * .1))); aim(st.cam, [Math.sin(s * .5) * .6, 2.6, 7.6], [0, 2.0, 0]); } };
  };
  BUILD.s_levels = () => {
    const st = stage(night), codes = ['000', '001', '010', '011', '100', '101', '110', '111'], cols = codes.map((c, i) => { const g = new THREE.Group(); g.position.set(-1.4 + i * .4, 1.3, 0); st.scene.add(g);
      g.add(M(RB(.3, 2.0, .3, .06), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .2, depthWrite: false }), { pos: [0, 1.0, 0], shadow: false }));
      const f = M(RB(.26, 1, .26, .05), glowM(EL, 1.2), { shadow: false }); g.add(f); const t = textSign(.36, .24, c, { color: 0xffffff, fg: '#1d2442', size: 46, font: MONO, depth: .04 }); t.position.set(0, -.25, .2); g.add(t); g.userData = { f, t }; return g; });
    const lb = textSign(2.2, .42, '3 BITS PER CELL', { color: EL, fg: '#0b3a55', size: 56 }); lb.position.set(0, 4.4, .4); st.scene.add(lb);
    return { ...st, update(t, s) { cols.forEach((g, i) => { const k = popIn(t, .05 + i * .06), h = Math.max(.02, (i / 7) * 1.9 * Math.min(1, k)); g.userData.f.scale.y = h; g.userData.f.position.y = h / 2 + .02; g.userData.t.scale.setScalar(Math.min(1, k)); });
      lb.scale.setScalar(popIn(t, .55)); cam(st, s, 2.6); } };
  };
  BUILD.s_layers = () => {
    const st = stage(night), tower = new THREE.Group(); st.scene.add(tower); const N = 40;
    const im = new THREE.InstancedMesh(new RoundedBoxGeom(), plastic(0x6f86c8, { roughness: .3 }), N), m = new THREE.Matrix4(), c = new THREE.Color(); tower.add(im);
    const cnt = sign(2.0, .5, () => {}, { color: 0xffffff }); cnt.position.set(0, 4.15, .5); st.scene.add(cnt);
    return { ...st, update(t, s) { const k = ease(seg(t, .05, .8)), shown = Math.floor(k * N);
      for (let i = 0; i < N; i++) { const on = i < shown; m.makeScale(on ? 1 : .001, 1, on ? 1 : .001).setPosition(0, .3 + i * .08, 0); im.setMatrixAt(i, m); im.setColorAt(i, c.setHSL(.6 + i / N * .25, .6, .6)); } im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
      tower.rotation.y = s * .4; cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, Math.round(k * 232) + ' layers', w / 2, h / 2 + 4, h * .55, '#6b4fd8', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .05));
      aim(st.cam, [Math.sin(s * .4) * 1.0, lerp(1.8, 3.0, ease(t)), 8.6], [0, lerp(1.4, 2.3, ease(t)), 0]); } };
  };
  function RoundedBoxGeom() { return new THREE.BoxGeometry(2.0, .07, 2.0); }
  BUILD.s_wear = () => {
    const st = stage(soft), cell = makeCell(1); cell.position.set(0, .9, 0); st.scene.add(cell);
    const cracks = []; for (let i = 0; i < 6; i++) { const c = M(RB(.02, .3 + (i % 3) * .1, .02, .005), matte(0x2a3046), { rot: [0, 0, (i - 3) * .4], shadow: false }); c.position.set(-.55 + i * .22, 1.6 + (i % 2) * .15, .52); st.scene.add(c); cracks.push(c); }
    const cnt = sign(2.2, .48, () => {}, { color: 0xffffff }); cnt.position.set(0, 3.55, .4); st.scene.add(cnt);
    return { ...st, update(t, s) { const w = seg(t, .1, .9); cracks.forEach((c, i) => c.visible = w > i / 6); cell.userData.ins.material.color.setHex(new THREE.Color(0xbfe9ff).lerp(new THREE.Color(0x8a7a6a), w).getHex());
      cnt.userData.redraw((x, ww, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, ww, h); label(x, 'rewrites: ' + Math.round(w * 3000).toLocaleString('en-US'), ww / 2, h / 2 + 4, h * .5, '#d42f7f', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .05));
      aim(st.cam, [Math.sin(s * .5) * .8 + .2, 2.9, 8.6], [0, 1.75, 0]); } };
  };
  BUILD.s_level = () => {
    const st = stage(night), chip = chipGrid(10, .3); chip.position.set(0, 2.6, 0); st.scene.add(chip);
    const ctrl = G(M(RB(.9, .9, .25, .1), plastic(0x2d3350)), ...[0, 1, 2, 3].flatMap(i => [-1, 1].map(d => M(RB(.06, .18, .06, .02), metal(0xffc44d), { pos: [-.3 + i * .2, d * .52, 0] })))); ctrl.position.set(1.1, .8, .8); st.scene.add(ctrl);
    const lb = textSign(2.1, .42, 'WEAR LEVELLING', { color: EL, fg: '#0b3a55', size: 56 }); lb.position.set(0, 4.55, .4); st.scene.add(lb);
    const W = new Array(100).fill(0); let last = -1;
    return { ...st, update(t, s) { const n = Math.floor(s * 12); if (n !== last) { for (let k = last + 1; k <= n; k++) W[Math.floor(frac(Math.sin(k * 7.13) * 912.7) * 100)] += 1; last = n; }
      const mx = Math.max(1, ...W); chip.userData.im.paint((x, y, i) => ({ c: new THREE.Color(0x2a3046).lerp(new THREE.Color(0x5ce06a), W[i] / mx).getHex(), s: i === Math.floor(frac(Math.sin(n * 7.13) * 912.7) * 100) ? 1.3 : 1 }));
      ctrl.rotation.z = Math.sin(s * 3) * .1; lb.scale.setScalar(popIn(t, .2)); cam(st, s, 2.6); } };
  };
  BUILD.s_erase = () => {
    const st = stage(soft), chip = chipGrid(10, .3); chip.position.set(0, 2.6, 0); st.scene.add(chip);
    const wiper = M(RB(1.6, .1, .2, .04), glowM(0xff9ec4, 2.5), { shadow: false }); st.scene.add(wiper);
    const lb = textSign(1.8, .42, 'WHOLE BLOCK', { color: 0xff9ec4, fg: '#5a1030', size: 58 }); lb.position.set(0, 4.55, .4); st.scene.add(lb);
    return { ...st, update(t, s) { const u = frac(s * .35), row = u * 10;
      chip.userData.im.paint((x, y, i) => { const inBlock = x < 5; if (inBlock && y < row) return { c: 0xffffff }; return { c: frac(i * .37) < .5 ? EL : 0x3a4466 }; });
      wiper.position.set(-.75, 2.6 + 1.5 - u * 3.0, .2); lb.scale.setScalar(popIn(t, .2)); cam(st, s, 2.6); } };
  };
}
