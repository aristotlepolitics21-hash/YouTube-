// Weird History of Medicine, episode 4 (cartoon 3D): When Doctors Treated Disease With Mercury.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, metal, glowM, sprite, clamp, lerp, seg, ease, frac, V, rng } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, spray } = B;
  const quack = { skin: 0xf2c7a5, shirt: 0x1d1d24, pants: 0x1d1d24, hair: 0x3a2418, coat: 0x1d1d24 };
  const vial = () => G(M(new THREE.CylinderGeometry(.12, .12, .5, 20), plastic(0xffffff, { transparent: true, opacity: .3, roughness: .02 }), { pos: [0, .25, 0] }), M(new THREE.CylinderGeometry(.1, .1, .3, 20), metal(0xd8dce6, { roughness: .05 }), { pos: [0, .17, 0] }));
  function steam(n = 8, seed = 4) { const R = rng(seed), g = new THREE.Group(), P = []; for (let i = 0; i < n; i++) { g.add(sprite(0xe8eef4, .6, .5)); P.push([(R() - .5) * 1.4, R()]); }
    g.update = s => g.children.forEach((c, i) => { const [x, ph] = P[i], u = frac(s * .4 + ph); c.position.set(x, u * 1.6, .2); c.material.opacity = Math.sin(u * Math.PI) * .55; c.scale.setScalar(.5 + u * .8); }); return g; }

  BUILD.h04_1 = (p) => {
    const st = H.room('candle'), d = H.who(quack, 'coat', 'beard', 'ruff'); st.scene.add(d); const v = vial(); st.scene.add(v); const gl = sprite(0xd8e4ff, 1.0, .6); st.scene.add(gl);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0x5a6280), .66, 0, .86);
    return { ...st, update(t, s) { const h = reach([.7, 2.6, .6], seg(t, .05, .25)); d.pose({ s, handR: h, poleR: [1, -.6, -.2], smile: .7, look: [.6, .2], brow: -.2 }); v.position.copy(h).add(V(0, .1, .1)); v.rotation.z = Math.sin(s * 2) * .15; gl.position.copy(v.position).add(V(0, .2, .1));
      ts.update(t, s); orbit(st, s, [0, 2.6, 0], 5.0, .2); } };
  };
  BUILD.h04_2 = () => {
    const st = H.room('candle'), box = M(RB(1.5, 1.9, 1.5, .1), plastic(0x8a5a2a, { roughness: .6 }), { pos: [-.3, .95, 0] }); st.scene.add(box);
    const pt = H.who({ skin: 0xf2c7a5, shirt: 0xf4f0e6, hair: 0x6b4a2e }); pt.position.set(-.3, -.35, 0); st.scene.add(pt); const fur = M(RB(.6, .7, .6, .1), metal(0x6a6a72), { pos: [1.3, .35, .2] }); st.scene.add(fur);
    const fire = sprite(0xff8a3c, .7, .9); fire.position.set(1.3, .5, .55); st.scene.add(fire); const pipe = M(new THREE.CylinderGeometry(.06, .06, .9, 10), metal(0x8a8a92), { pos: [.85, .9, .2], rot: [0, 0, 1.2] }); st.scene.add(pipe);
    const sm = steam(10); sm.position.set(-.3, 1.9, 0); st.scene.add(sm); const d = H.who(quack, 'coat', 'beard'); d.position.set(1.6, 0, -.9); d.rotation.y = -.6; st.scene.add(d); const lb = hud(st, tag('MERCURY FUMES', 0x5a6280, '#ffffff', 2.4, .5), .62, 0, .56);
    return { ...st, update(t, s) { pt.pose({ s, smile: -.4, brow: .8, squint: .3 + Math.sin(s * 3) * .1, look: [.5, 0] }); d.pose({ s, smile: .6, handR: reach('point', 1) }); sm.update(s); fire.material.opacity = .7 + Math.sin(s * 12) * .2; lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [.2, 2.0, 0], 6.0, .4); } };
  };
  BUILD.h04_3 = () => {
    const st = H.room('candle'), pt = H.who({ skin: 0xd8d0c0, shirt: 0xf4f0e6, hair: 0x6b4a2e }); st.scene.add(pt); const dr = spray(12, 0xbfe9ff, 7); pt.add(dr);
    const l1 = hud(st, tag('DROOLING', 0xffffff, '#1d2442', 1.7, .44), .62, -.3, .38), l2 = hud(st, tag('LOOSE TEETH', 0xffffff, '#1d2442', 1.9, .44), .48, .25, .42), l3 = hud(st, tag('SHAKING', 0xff4a5c, '#ffffff', 1.5, .44), .34, -.2, .34);
    return { ...st, update(t, s) { const sh = Math.sin(s * 40) * .02; pt.position.x = sh; pt.pose({ s, mouth: .25, smile: -.5, brow: .8, squint: .4, handR: reach('chest', 1).add(V(sh * 3, 0, 0)), handL: reach('chest', 1, -1).add(V(-sh * 3, 0, 0)) });
      dr.fire(V(0, 2.4, .62), V(0, -1, .3), frac(s * .6)); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .35)); l3.scale.setScalar(popIn(t, .6)); orbit(st, s, [0, 2.5, 0], 4.6, .1); } };
  };
  BUILD.h04_4 = () => {
    const st = H.room('candle', { top: '#3a2010', bottom: '#8a5a30' }), tb = B.table(3.2, 1.6, 0x8a5a2a); tb.position.set(0, -.25, .8); st.scene.add(tb);
    const sl = H.who({ skin: 0xd9a07a, shirt: 0x3a5ab0, hair: 0x2a1a12 }, 'beard'); sl.position.set(0, 0, -.2); st.scene.add(sl); const gb = H.goblet(); st.scene.add(gb);
    const l1 = hud(st, tag('A NIGHT WITH VENUS...', 0xff6fb1, '#ffffff', 3.2, .46), .62, 0, .72), l2 = hud(st, tag('A LIFETIME WITH MERCURY', 0x5a6280, '#ffffff', 3.6, .46), .48, 0, .78);
    return { ...st, update(t, s) { const k = seg(t, .4, .55), h = reach([.55, 2.0, .6], 1); sl.pose({ s, handR: h, poleR: [1, -.6, -.2], mouth: (1 - k) * Math.abs(Math.sin(s * 12)) * .5, squint: (1 - k) * .7, smile: lerp(.9, -.3, k), wide: k }); gb.position.copy(h).add(V(-.05, -.1, .1));
      l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.3, 0], 5.2, .2); } };
  };
  BUILD.h04_5 = () => {
    const st = H.room('ward'), d = B.makeDoctor({ skin: 0xf2c7a5, hair: 0x6b4a2e }); st.scene.add(d); const v = vial(); v.children[1].material = plastic(0xffe08a); st.scene.add(v); const gl = sprite(0xffe08a, 1.2, .7); st.scene.add(gl);
    const n = H.who({ skin: 0xffd9bd, shirt: 0xffffff, hair: 0xd9a441, hairStyle: 'long' }, 'bonnet'); n.position.set(-1.2, 0, -.6); n.rotation.y = .4; st.scene.add(n); const lb = hud(st, tag('PENICILLIN', 0xffb020, '#3a2400', 2.0, .55), .62, 0, .46);
    return { ...st, update(t, s) { const h = reach('up', seg(t, .05, .25)); d.pose({ s, handR: h, smile: .9 }); n.pose({ s, smile: .9, handR: reach('wave', seg(t, .4, .55)) }); v.position.copy(d.localToWorld(h.clone())).add(V(0, .1, 0)); gl.position.copy(v.position).add(V(0, .3, .1));
      lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [-.3, 2.6, 0], 6.0, .3); } };
  };
  BUILD.h04_6 = () => {
    const st = H.room('clinic'), d = H.who({ skin: 0x7a4a30, shirt: 0xf6f8fb, hair: 0x15100c }, 'mask'); st.scene.add(d); const th = B.thermometer(.5, 0xc8ccd8); th.scale.setScalar(.5); st.scene.add(th);
    const bin = G(M(RB(1.0, 1.0, 1.0, .1), plastic(0xffd23f), { pos: [0, .5, 0] }), M(RB(1.05, .1, 1.05, .05), plastic(0x1d1d24), { pos: [0, 1.0, 0] })); bin.position.set(-1.0, 0, .6); st.scene.add(bin);
    const w = hud(st, B.warnSign(1), .6, -.35, .22); w.userData.w = 1.1; const lb = hud(st, tag('SPECIAL CLEANUP', 0xffd23f, '#3a2400', 2.6, .5), .6, .18, .5);
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .7)), h = reach([lerp(.5, -.5, k), lerp(1.5, 1.9, k), .7], 1); d.pose({ s, handR: h, poleR: [1, -.6, -.2], smile: .2, look: [-.4, -.6] }); th.position.copy(h).add(V(0, -.2, .1)); th.rotation.z = 1.4;
      w.scale.setScalar(popIn(t, .1)); lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [-.3, 2.0, 0], 5.6, .4); } };
  };
}
