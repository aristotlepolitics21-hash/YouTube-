// Weird History of Medicine, episode 19 (cartoon 3D): The Tooth Worm That Never Existed.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V, rng } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, germ, check } = B;
  function tooth(s = 1) { const w = plastic(0xfffaf0, { roughness: .3, clearcoat: .6 }), g = G(M(RB(1.4, 1.1, 1.2, .4), w, { pos: [0, 1.6, 0] }), ...[-1, 1].map(d => M(new THREE.ConeGeometry(.32, 1.3, 20), w, { pos: [d * .35, .55, 0], rot: [Math.PI, 0, d * .12] })));
    [-1, 1].forEach(d => g.add(M(SPH(.32, 20, 14), w, { pos: [d * .38, 2.12, 0], scale: [1, .45, 1] }))); const hole = M(SPH(.22, 20, 14), matte(0x2a1a12), { pos: [.25, 1.8, .55], scale: [1, 1, .4] }); g.add(hole); g.userData.hole = hole; g.scale.setScalar(s); return g; }
  function worm() { const g = new THREE.Group(), segs = []; for (let i = 0; i < 7; i++) { const m = M(SPH(.13 - i * .008, 16, 12), plastic(0xff9fb0, { roughness: .4 }), {}); g.add(m); segs.push(m); }
    [-1, 1].forEach(d => segs[0].add(M(SPH(.035, 10, 8), plastic(0x15151c), { pos: [d * .05, .05, .11] }))); g.wiggle = s => segs.forEach((m, i) => m.position.set(Math.sin(s * 4 - i * .7) * .08, -i * .1, -i * .07)); g.wiggle(0); return g; }
  const ouch = { skin: 0xf2c7a5, shirt: 0x6a8a6a, pants: 0x3a2a1a, hair: 0x6b4a2e };

  BUILD.h19_1 = (p) => {
    const st = H.room('candle'), m = H.who(ouch); m.position.set(-.8, 0, 0); m.rotation.y = .3; st.scene.add(m); const tt = tooth(.8); tt.position.set(1.1, .8, -.4); st.scene.add(tt); const w = worm(); w.scale.setScalar(.8); st.scene.add(w);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0xff9fb0), .66, 0, .86);
    return { ...st, update(t, s) { m.pose({ s, puff: .5, squint: .8, smile: -.6, brow: .9, handR: reach('cheek', 1), headTilt: .2 }); m.userData.cheeks[1].scale.multiplyScalar(1.5); const hp = new THREE.Vector3(); tt.userData.hole.getWorldPosition(hp);
      w.position.copy(hp).add(V(0, .1 + Math.abs(Math.sin(s * 1.5)) * .25, .1)); w.wiggle(s); ts.update(t, s); orbit(st, s, [.2, 2.0, 0], 7.4, .25); } };
  };
  BUILD.h19_2 = () => {
    const st = H.room('night', { top: '#3a1a2a', bottom: '#8a4a5a' }), tt = tooth(1.4); tt.position.set(0, 0, 0); st.scene.add(tt); const w = worm(); w.scale.setScalar(1.6); st.scene.add(w);
    const l1 = hud(st, tag('THE TOOTH WORM', 0xff9fb0, '#5a1428', 2.8, .55), .62, 0, .62), l2 = hud(st, tag('BLAMED FOR HOLES + PAIN', 0xffffff, '#1d2442', 3.4, .44), .48, 0, .74);
    return { ...st, update(t, s) { const hp = new THREE.Vector3(); tt.userData.hole.getWorldPosition(hp); const k = seg(t, .1, .3); w.position.copy(hp).add(V(0, -.1 + k * .5, .15)); w.wiggle(s); tt.rotation.y = Math.sin(s * .4) * .25;
      l1.scale.setScalar(popIn(t, .2)); l2.scale.setScalar(popIn(t, .5)); shoot(st, [Math.sin(s * .3) * .8, 2.8, 6.2], [0, 2.2, 0]); } };
  };
  BUILD.h19_3 = () => {
    const st = H.room('candle', { top: '#3a2a1a', bottom: '#7a5a3a' }), pt = H.who(ouch); pt.position.set(-.6, -.45, 0); pt.rotation.y = .5; st.scene.add(pt); const ch = B.chair(0x6a4422); ch.position.set(-.6, 0, -.15); ch.rotation.y = .5; st.scene.add(ch);
    const hl = H.who({ skin: 0xd9a07a, shirt: 0x5a3a6a, hair: 0x9a9aa6 }, 'greybeard', 'furs'); hl.position.set(.9, 0, -.3); hl.rotation.y = -.7; st.scene.add(hl); const dish = G(M(new THREE.CylinderGeometry(.3, .2, .1, 20), metal(0xd4a440)), sprite(0xff8a3a, .6, .7)); st.scene.add(dish);
    const smoke = [0, 1, 2, 3].map(() => { const m = sprite(0xcccccc, .7, .4); st.scene.add(m); return m; }); const lb = hud(st, tag('BURNING SEEDS', 0xff8a3a, '#ffffff', 2.4, .52), .62, 0, .5);
    return { ...st, update(t, s) { pt.pose({ s, sit: 1, sitY: 0, mouth: .7, squint: .5, headNod: -.2 }); const mp = new THREE.Vector3(); pt.userData.head.getWorldPosition(mp); const h = hl.worldToLocal(mp.clone().add(V(.35, -.5, .35)));
      hl.pose({ s, handR: h, poleR: [1, -.6, -.2], look: [-.4, -.4], squint: .4, smile: .3 }); dish.position.copy(mp).add(V(.35, -.4, .35)); smoke.forEach((m, i) => { const u = frac(s * .5 + i / 4); m.position.copy(dish.position).add(V(-u * .3, u * .9, 0)); m.material.opacity = .4 * (1 - u); });
      lb.scale.setScalar(popIn(t, .2)); orbit(st, s, [0, 1.9, 0], 5.8, .3); } };
  };
  BUILD.h19_4 = () => {
    const st = H.room('night', { top: '#2a2a32', bottom: '#5a5a66' }), dish = M(new THREE.CylinderGeometry(1.4, 1.0, .25, 40), metal(0xd4a440), { pos: [0, 1.0, 0] }); st.scene.add(dish); const R = rng(8);
    const curls = Array.from({ length: 9 }, (_, i) => { const c = M(new THREE.TorusGeometry(.12, .035, 8, 20, Math.PI * 1.3), plastic(0xe8d8b0, { roughness: .6 }), {}); c.position.set((R() - .5) * 1.6, 1.18, (R() - .5) * 1.2); c.rotation.set(Math.PI / 2 + (R() - .5) * .6, 0, R() * 6); st.scene.add(c); return c; });
    const seeds = Array.from({ length: 6 }, () => { const sd = M(SPH(.07, 10, 8), matte(0x2a1a12), { scale: [1, .7, 1.4] }); sd.position.set((R() - .5) * 1.6, 1.16, (R() - .5) * 1.2); st.scene.add(sd); return sd; });
    const l1 = hud(st, tag('"WORMS"?', 0xff9fb0, '#5a1428', 1.8, .5), .62, -.12, .34), x = hud(st, check(false), .62, .2, .12), l2 = hud(st, tag('JUST SEED SPROUTS', 0xffffff, '#1d2442', 3.0, .48), .48, 0, .62);
    return { ...st, update(t, s) { curls.forEach((c, i) => c.rotation.z = R.length ? i + Math.sin(s * 2 + i) * .1 : 0); l1.scale.setScalar(popIn(t, .1)); x.scale.setScalar(popIn(t, .4)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [Math.sin(s * .3) * .6, 3.2, 3.2], [0, 1.1, 0]); } };
  };
  BUILD.h19_5 = () => {
    const st = H.room('court', { top: '#4a3a6a', bottom: '#b08a7a' }), f = H.who({ skin: 0xf2c7a5, shirt: 0x6a2a3a, pants: 0x3a1a1a, hair: 0xe8e8ee, coat: 0x6a2a3a }, 'coat'); st.scene.add(f);
    const bk = G(M(RB(.9, 1.2, .15, .03), plastic(0x6a2a3a), {}), M(RB(.84, 1.14, .1, .02), matte(0xf4ecd8), { pos: [.04, 0, 0] })); st.scene.add(bk); const w = worm(); w.scale.setScalar(.9); st.scene.add(w);
    const l1 = hud(st, tag('1728: PIERRE FAUCHARD', 0xffffff, '#1d2442', 3.4, .48), .64, 0, .74), l2 = hud(st, tag('NO TOOTH WORM', 0xff4a5c, '#ffffff', 2.5, .48), .52, -.06, .54), x = hud(st, check(false), .52, .32, .12);
    return { ...st, update(t, s) { const h = reach([.5, 1.45, .7], 1); f.pose({ s, handR: h, handL: reach('up', seg(t, .3, .4), -1), smile: .6, brow: -.3 }); bk.position.copy(f.localToWorld(h.clone())).add(V(.1, .1, .1)); bk.rotation.y = -.3;
      w.position.set(-1.4, 2.4, .4); w.wiggle(s); w.scale.setScalar(.9 * (1 - seg(t, .5, .6))); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .4)); x.scale.setScalar(popIn(t, .5)); orbit(st, s, [-.2, 2.3, 0], 6.0, .25); } };
  };
  BUILD.h19_6 = () => {
    const st = H.room('night', { top: '#1a3a4a', bottom: '#3a7a8a' }), tt = tooth(1.3); st.scene.add(tt); const gs = Array.from({ length: 5 }, (_, i) => { const g = germ([0x7ad94a, 0xb18cff, 0xffb84a][i % 3]); g.scale.setScalar(.55); st.scene.add(g); return g; });
    const sug = [0, 1, 2].map(i => { const c = M(RB(.3, .3, .3, .04), plastic(0xffffff, { roughness: .9 }), {}); st.scene.add(c); return c; }), drops = [0, 1, 2, 3].map(() => { const d = M(SPH(.07, 10, 8), glowM(0xd8ff4a, 1.2), { scale: [1, 1.4, 1] }); st.scene.add(d); return d; });
    const l1 = hud(st, tag('BACTERIA', 0x7ad94a, '#14320a', 1.8, .46), .64, -.25, .3), l2 = hud(st, tag('+ SUGAR', 0xffffff, '#1d2442', 1.5, .46), .64, .25, .26), l3 = hud(st, tag('= ACID', 0xd8ff4a, '#3a3a00', 1.4, .5), .52, 0, .26);
    return { ...st, update(t, s) { tt.rotation.y = Math.sin(s * .4) * .3; gs.forEach((g, i) => { const a = s * .8 + i / 5 * Math.PI * 2; g.position.set(Math.cos(a) * 1.3, 2.9 + Math.sin(a * 2) * .2, Math.sin(a) * 1.0); g.rotation.y = -a; });
      sug.forEach((c, i) => { const u = frac(s * .3 + i / 3); c.position.set(-1.8 + i * .2, 4.0 - u * 2.0, .6); c.scale.setScalar(1 - u); c.rotation.set(s, s * .7, 0); }); drops.forEach((d, i) => { const u = frac(s * .5 + i / 4); d.position.set(-.6 + i * .4, 2.7 - u * .5, .9); d.visible = t > .55; });
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .3)); l3.scale.setScalar(popIn(t, .55)); shoot(st, [0, 3.0, 6.8], [0, 2.3, 0]); } };
  };
}
