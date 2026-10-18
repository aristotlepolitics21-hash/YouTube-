// Weird History of Medicine, episode 6 (cartoon 3D): Why Plague Doctors Wore Bird Masks.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, glowM, sprite, clamp, lerp, seg, ease, frac, V, rng } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, animal } = B;
  const doc = { skin: 0xf2c7a5, shirt: 0x1d1d24, pants: 0x1d1d24, hair: 0x3a2418, shoe: 0x1d1d24 };
  // the beaked mask on its own (so it can be lifted off): leather hood, glass eyes, long beak
  function mask() { const g = new THREE.Group(), lm = matte(0x2a2420, { roughness: .9 }); g.add(M(SPH(.7, 32, 24, 0, Math.PI * 2, 0, Math.PI * .75), lm, {}));
    [-1, 1].forEach(d => g.add(M(new THREE.TorusGeometry(.13, .03, 8, 24), plastic(0xb08a40), { pos: [d * .22, .1, .62] }), M(new THREE.CircleGeometry(.12, 24), plastic(0xffd890, { transparent: true, opacity: .7, roughness: .02 }), { pos: [d * .22, .1, .63] })));
    const beak = M(new THREE.ConeGeometry(.22, 1.0, 24), matte(0xf2ede2), { pos: [0, -.15, 1.05], rot: [Math.PI / 2, 0, 0] }); g.add(beak);
    g.add(G(M(new THREE.CylinderGeometry(.5, .56, .5, 32), matte(0x1d1d24), { pos: [0, .85, 0] }), M(new THREE.CylinderGeometry(1.0, 1.0, .05, 32), matte(0x1d1d24), { pos: [0, .6, 0] }))); g.userData.beak = beak; return g; }
  function plagueDoc() { const p = H.who(doc); p.add(M(new THREE.CylinderGeometry(.6, 1.0, 2.0, 24), matte(0x1d1d24, { roughness: .3 }), { pos: [0, 1.0, 0] })); const m = mask(); p.userData.head.add(m); p.userData.mask = m; return p; }
  function fog(n = 14, col = 0xd8e0e8, seed = 3, box = [6, 2, 3]) { const R = rng(seed), g = new THREE.Group(), P = []; for (let i = 0; i < n; i++) { g.add(sprite(col, 2.0, .3)); P.push([(R() - .5) * box[0], R() * box[1], (R() - .5) * box[2], R() * 6]); }
    g.update = (s, k = 1) => g.children.forEach((c, i) => { const [x, y, z, ph] = P[i]; c.position.set(x + Math.sin(s * .3 + ph) * .5, y + frac(s * .08 + ph) * .8, z); c.material.opacity = .3 * k; }); return g; }
  const cane = () => M(new THREE.CylinderGeometry(.03, .03, 2.4, 10), plastic(0x6a4422), {});

  BUILD.h06_1 = (p) => {
    const st = H.room('street'), d = plagueDoc(); st.scene.add(d); const fg = fog(16); st.scene.add(fg); const ts = hud(st, titleSigns(p.top, p.bottom, 0x1d1d24), .66, 0, .86);
    return { ...st, update(t, s) { d.position.z = lerp(-3, 1.0, t); d.pose({ s, walk: s * 5 }); fg.update(s); ts.update(t, s); shoot(st, [1.2, 2.2, d.position.z + 6.0], [0, 2.3, d.position.z]); } };
  };
  BUILD.h06_2 = () => {
    const st = H.room('candle'), tb = B.table(3, 1.6, 0x6a4422); tb.position.set(0, -.3, 0); st.scene.add(tb); const m = mask(); m.position.set(0, 1.55, 0); m.rotation.set(0, -.6, 0); st.scene.add(m);
    const R = rng(4), herbs = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const h = M(SPH(.07, 10, 8), plastic([0xb18cff, 0x7ad94a, 0xffd23f, 0xff8ad0][i % 4]), {}); st.scene.add(h); return h; });
    const lb = hud(st, tag('STUFFED WITH HERBS', 0x7ad94a, '#14320a', 3.0, .48), .62, 0, .68);
    return { ...st, update(t, s) { m.rotation.y = -.6 + Math.sin(s * .5) * .2; const tip = new THREE.Vector3(); m.userData.beak.getWorldPosition(tip); herbs.forEach((h, i) => { const u = frac(s * .3 + i / 8); h.position.copy(tip).add(V(Math.sin(i * 2) * .3, .3 + u * .6, Math.cos(i * 1.7) * .3)); h.scale.setScalar(Math.sin(u * Math.PI)); });
      lb.scale.setScalar(popIn(t, .2)); shoot(st, [-1.2, 2.6, 3.4], [.3, 1.6, .3]); } };
  };
  BUILD.h06_3 = () => {
    const st = H.room('street', { fogColor: '#7a9a80' }), fg = fog(18, 0x8acf7a, 5); st.scene.add(fg); const ps = [0, 1, 2].map(i => { const p = H.who({ skin: [0xffd9bd, 0xd9a07a, 0xa8714e][i], shirt: [0x8a5a3a, 0x5a6a3a, 0x7a3a3a][i], hair: 0x2a1a12, hairStyle: i === 1 ? 'long' : 'short' }); p.position.set((i - 1) * 1.4, 0, -.3 * (i % 2)); st.scene.add(p); return p; });
    const lb = hud(st, tag('"BAD AIR"', 0x5a8a4a, '#ffffff', 1.8, .55), .62, 0, .45);
    return { ...st, update(t, s) { ps.forEach((p, i) => p.pose({ s: s + i, handR: reach('nose', seg(t, .1 + i * .08, .3 + i * .08)), squint: .6, brow: .7, smile: -.4 })); fg.update(s, 1.5); lb.scale.setScalar(popIn(t, .35)); orbit(st, s, [0, 2.2, 0], 7.4, .3); } };
  };
  BUILD.h06_4 = () => {
    const st = H.room('candle'), bd = B.bed(); bd.position.set(-.8, 0, 0); bd.rotation.y = Math.PI / 2; st.scene.add(bd); const pt = H.who({ skin: 0xd8c8b0, shirt: 0xf4f0e6, hair: 0x6b4a2e }); pt.position.set(.4, 1.25, 0); pt.rotation.y = -Math.PI / 2; st.scene.add(pt);
    const d = plagueDoc(); d.position.set(2.0, 0, -1.2); d.rotation.y = -.9; st.scene.add(d); const cn = cane(); st.scene.add(cn); const lb = hud(st, tag('NO TOUCHING', 0xff4a5c, '#ffffff', 2.0, .5), .62, 0, .46);
    return { ...st, update(t, s) { pt.pose({ s, lean: -Math.PI / 2, smile: -.4, brow: .6 }); const h = reach('point', 1); d.pose({ s, handR: h }); const hw = d.localToWorld(h.clone()); const tip = V(.1, 1.9 + Math.sin(s * 3) * .05, 0); cn.position.copy(hw).lerp(tip, .5); cn.quaternion.setFromUnitVectors(V(0, 1, 0), tip.clone().sub(hw).normalize()); cn.scale.y = hw.distanceTo(tip) / 2.4;
      lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [.5, 1.8, -.3], 7.4, .6); } };
  };
  BUILD.h06_5 = () => {
    const st = H.room('night'), rope = M(new THREE.CylinderGeometry(.08, .08, 8, 12), plastic(0xc8a070), { rot: [0, 0, .25], pos: [0, 2.2, 0] }); st.scene.add(rope);
    const rat = animal('cat', { color: 0x6a6a72 }); rat.scale.setScalar(1.1); rat.position.set(-.2, 1.65, 0); rat.rotation.set(0, Math.PI / 2, .25); st.scene.add(rat);
    const fl = G(M(SPH(.08, 12, 8), plastic(0x3a2010), { scale: [1, .8, 1.3] }), sprite(0xffd23f, .5, .8)); st.scene.add(fl); const water = M(new THREE.PlaneGeometry(20, 10), plastic(0x1a2a4a, { roughness: .05 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, .05, 0] }); st.scene.add(water);
    const l1 = hud(st, tag('FLEAS ON RATS', 0xffd23f, '#3a2400', 2.3, .5), .62, 0, .52);
    return { ...st, update(t, s) { rat.pose({ s, tailUp: -.3, headNod: .1 }); const hp = new THREE.Vector3(); rat.userData.head.getWorldPosition(hp); fl.position.copy(hp).add(V(.1, .45 + Math.abs(Math.sin(s * 4)) * .2, 0));
      l1.scale.setScalar(popIn(t, .1)); shoot(st, [.6, 2.8, 6.4], [0, 1.9, 0]); } };
  };
  BUILD.h06_6 = () => {
    const st = H.room('night'), d = H.who({ ...doc, skin: 0xffd9bd, hair: 0x6b4a2e }); d.add(M(new THREE.CylinderGeometry(.6, 1.0, 2.0, 24), matte(0x1d1d24, { roughness: .3 }), { pos: [0, 1.0, 0] })); st.scene.add(d); const m = mask(); st.scene.add(m);
    const ln = G(M(RB(.4, .6, .4, .05), plastic(0xffd890, { transparent: true, opacity: .7 })), M(SPH(.12, 16, 12), glowM(0xffb040, 3)), sprite(0xffb040, 1.5, .6)); ln.position.set(-1.1, 2.9, .5); st.scene.add(ln);
    const lb = hud(st, tag('THE HERBS DID NOTHING', 0x5a6280, '#ffffff', 3.4, .46), .62, 0, .76);
    return { ...st, update(t, s) { const k = ease(seg(t, .15, .45)); const h = reach([.5, lerp(2.8, 2.0, k), lerp(.4, .8, k)], seg(t, .05, .15)); d.pose({ s, handR: h, poleR: [1, -.6, -.2], smile: lerp(0, -.2, k), brow: .4, squint: .2 });
      const head = new THREE.Vector3(); d.userData.head.getWorldPosition(head); m.position.copy(head).lerp(d.localToWorld(h.clone()).add(V(0, .2, .3)), k); m.rotation.set(-k * .5, 0, k * .6); m.scale.setScalar(1 - k * .3);
      lb.scale.setScalar(popIn(t, .55)); orbit(st, s, [0, 2.6, 0], 5.0, .2); } };
  };
}
