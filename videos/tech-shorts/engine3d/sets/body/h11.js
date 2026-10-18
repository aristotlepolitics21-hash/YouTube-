// Weird History of Medicine, episode 11 (cartoon 3D): The Ice Pick Surgery That Won a Nobel Prize. Kept non-graphic.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, clamp, lerp, seg, ease, frac, V, rng } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, counter, brain, nerve } = B;
  const freeman = { skin: 0xf2c7a5, shirt: 0x5a4a3a, pants: 0x5a4a3a, hair: 0x8a8a92 };
  const pick = () => G(M(new THREE.CylinderGeometry(.025, .008, 1.0, 10), metal(0xe6eaf2, { roughness: .1 }), { pos: [0, .5, 0] }), M(new THREE.CylinderGeometry(.07, .07, .35, 12), metal(0x9a9aa2), { pos: [0, -.15, 0] }));
  const bag = () => G(M(RB(.7, .45, .3, .1), plastic(0x3a2010), {}), M(new THREE.TorusGeometry(.15, .03, 8, 16, Math.PI), plastic(0x3a2010), { pos: [0, .25, 0] }));

  BUILD.h11_1 = (p) => {
    const st = H.room('ward'), d = H.who(freeman); st.scene.add(d); const bg = bag(); st.scene.add(bg); const ts = hud(st, titleSigns(p.top, p.bottom, 0x5a6280), .66, 0, .86);
    for (let i = 0; i < 4; i++) { const dr = M(RB(1.0, 2.2, .1, .05), plastic(0x8aa0a8), { pos: [i % 2 ? 2.4 : -2.4, 1.1, -i * 2.5] }); st.scene.add(dr); }
    return { ...st, update(t, s) { d.position.z = lerp(-3, .5, t); d.pose({ s, walk: s * 5, smile: .8, handR: reach('rest', 0) }); const hw = new THREE.Vector3(); d.userData.arms[1].userData.el.children[1].getWorldPosition(hw); bg.position.copy(hw).add(V(0, -.3, 0));
      ts.update(t, s); shoot(st, [.8, 2.4, d.position.z + 5.5], [0, 2.2, d.position.z]); } };
  };
  BUILD.h11_2 = () => {
    const st = H.room('lab', { top: '#c8d4dc', bottom: '#98a8b4', floor: 0x8898a4 }), tray = M(RB(2.4, .06, 1.4, .03), metal(0xc8ccd8, { roughness: .2 }), { pos: [0, 1.4, 0] }); st.scene.add(tray); const pk = pick(); pk.scale.setScalar(2.2); pk.position.set(-.1, 1.55, 0); pk.rotation.set(0, 0, Math.PI / 2 - .1); st.scene.add(pk);
    const lb = hud(st, tag('TRANSORBITAL LOBOTOMY', 0x5a6280, '#ffffff', 3.4, .48), .62, 0, .74);
    return { ...st, update(t, s) { pk.rotation.y = Math.sin(s * .5) * .4; lb.scale.setScalar(popIn(t, .2)); shoot(st, [Math.sin(s * .3) * .8, 3.4, 4.4], [0, 1.4, 0]); } };
  };
  BUILD.h11_3 = () => {
    const st = H.room('night'), br = brain(2.4); br.position.set(0, 2.5, 0); st.scene.add(br); const front = M(SPH(.55, 32, 20), glowM(0xff8a5c, 1.4), { pos: [0, 2.7, .7], scale: [1.3, .9, .6], shadow: false }); front.material.transparent = true; st.scene.add(front);
    const R = rng(3), links = [0, 1, 2, 3, 4, 5].map(i => { const a = V((R() - .5) * 1.4, 2.4 + (R() - .5) * .8, .4), b = V((R() - .5) * 1.2, 2.5 + (R() - .5) * .9, -.6); const n = nerve([a, a.clone().lerp(b, .5).add(V(0, .2, 0)), b], .04); st.scene.add(n); return n; });
    const l1 = hud(st, tag('FRONT OF THE BRAIN', 0xff8a5c, '#ffffff', 3.0, .46), .62, 0, .68), l2 = hud(st, tag('CONNECTIONS CUT', 0xff4a5c, '#ffffff', 2.6, .46), -.3, 0, .6);
    return { ...st, update(t, s) { const k = seg(t, .35, .7); links.forEach((n, i) => { n.material.emissiveIntensity = 1.4 * (1 - clamp(k * 2 - i * .2)) + .05; }); front.material.opacity = .5 * (1 - k * .6); br.rotation.y = -.6 + Math.sin(s * .4) * .2;
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .55)); shoot(st, [2.4, 3.2, 5.4], [0, 2.5, 0]); } };
  };
  BUILD.h11_4 = () => {
    const st = H.room('court', { top: '#2a1a3a', bottom: '#6a4a7a', floor: 0x4a2a5a }), stage_ = M(RB(5, .5, 2.4, .05), plastic(0x8a2a3a), { pos: [0, .25, 0] }); st.scene.add(stage_);
    const d = H.who({ skin: 0xd9a07a, shirt: 0x1d1d24, pants: 0x1d1d24, hair: 0x9a9aa6 }); d.position.set(0, .5, 0); st.scene.add(d); const med = G(M(new THREE.CylinderGeometry(.18, .18, .04, 32), metal(0xffc44d), { rot: [Math.PI / 2, 0, 0] })); st.scene.add(med);
    const spot = sprite(0xfff3c0, 5, .35); spot.position.set(0, 3, -.5); st.scene.add(spot); const lb = hud(st, tag('NOBEL PRIZE, 1949', 0xffc44d, '#3a2400', 2.6, .5), .62, 0, .58);
    return { ...st, update(t, s) { const h = reach('up', seg(t, .1, .3)); d.pose({ s, handR: h, smile: .9 }); med.position.copy(d.localToWorld(h.clone())).add(V(0, .2, .1)); med.rotation.y = s * 2; lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.6, 0], 6.0, .2); } };
  };
  BUILD.h11_5 = () => {
    const st = H.room('ward', { top: '#c8c0b0', bottom: '#988c78' }), win = M(RB(1.6, 2.0, .1, .05), glowM(0xdfeeff, .8), { pos: [-1.0, 2.6, -3.0] }); st.scene.add(win);
    const pt = H.who({ skin: 0xf2c7a5, shirt: 0xd8dce6, hair: 0x6b4a2e }); pt.position.set(-.3, -.47, 0); st.scene.add(pt); const ch = B.chair(0x8aa0a8); ch.position.set(-.3, 0, -.15); st.scene.add(ch);
    const fam = H.who({ skin: 0xf2c7a5, shirt: 0x8a5a7a, hair: 0x3a2418, hairStyle: 'long' }); fam.position.set(1.0, 0, .3); fam.rotation.y = -.7; st.scene.add(fam); const lb = hud(st, tag('CHANGED FOREVER', 0x5a6280, '#ffffff', 2.6, .5), .62, 0, .6);
    return { ...st, update(t, s) { pt.pose({ s: s * .2, sit: 1, sitY: 0, smile: 0, squint: .2, look: [-.6, .2], bob: .2 }); fam.pose({ s, smile: -.4, brow: .7, handR: reach([-.6, 1.4, .9], 1) }); lb.scale.setScalar(popIn(t, .4)); orbit(st, s, [0, 2.0, 0], 6.0, .2); } };
  };
  BUILD.h11_6 = () => {
    const st = H.room('ward'), tb = B.table(2.6, 1.2, 0xd8a878); tb.position.set(0, -.3, .9); st.scene.add(tb); const tray = M(RB(1.0, .05, .6, .02), metal(0xc8ccd8), { pos: [-.9, .95, .9] }); st.scene.add(tray); const pk = pick(); pk.rotation.z = Math.PI / 2; pk.position.set(-.9, 1.0, .9); st.scene.add(pk);
    const d = B.makeDoctor({ skin: 0xf2c7a5, hair: 0x3a2418 }); st.scene.add(d); const pb = B.pills(); st.scene.add(pb);
    const ct = hud(st, counter(3.0, .62, k => '~' + (Math.round(k * 35) * 100).toLocaleString('en-US') + ' OPERATIONS', '#1d2442'), .62, 0, .66); ct.userData.w = 3.0; const l2 = hud(st, tag('1950s: NEW MEDICINES', 0x3cc85a, '#ffffff', 3.0, .44), .48, 0, .66);
    return { ...st, update(t, s) { const h = reach('up', seg(t, .05, .2)); d.pose({ s, handR: h, smile: .6 }); pb.position.copy(d.localToWorld(h.clone())).add(V(0, .05, .05)); pb.scale.setScalar(.6); tray.position.x = -.9 - seg(t, .2, .4) * .8; pk.position.x = tray.position.x;
      ct.set(ease(seg(t, .4, .9))); ct.scale.setScalar(popIn(t, .4)); l2.scale.setScalar(popIn(t, .1)); orbit(st, s, [0, 2.3, 0], 5.6, .2); } };
  };
}
