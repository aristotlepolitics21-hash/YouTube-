// Weird History of Medicine, episode 16 (cartoon 3D): How a Cow Saved Millions of Lives. Kept non-graphic.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V, rng } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, germ, check } = B;
  const jenner = { skin: 0xf2c7a5, shirt: 0x3a4a6a, pants: 0xd8c8a0, hair: 0xe8e8ee, coat: 0x3a4a6a };
  const maid = { skin: 0xffd9bd, shirt: 0x6a8ab0, hair: 0xb5652b, hairStyle: 'long' }, boy = { skin: 0xffd9bd, shirt: 0xf4f0e6, pants: 0x6a4a2e, hair: 0xd9a441 };
  const bigCow = () => { const c = H.cow(); c.scale.setScalar(2.2); return c; };
  const bucket = () => G(M(new THREE.CylinderGeometry(.3, .25, .5, 24, 1, true), metal(0xa8a8b0, { side: THREE.DoubleSide }), { pos: [0, .25, 0] }), M(new THREE.CylinderGeometry(.28, .28, .03, 24), plastic(0xffffff), { pos: [0, .4, 0] }));
  const pox = (col = 0xe2343c) => { const g = germ(col); g.scale.setScalar(.35); return g; };

  BUILD.h16_1 = (p) => {
    const st = H.room('cottage'), cw = bigCow(); cw.position.set(.4, 0, -.6); st.scene.add(cw); const m = H.who(maid); m.scale.setScalar(.85); m.position.set(-1.2, -.2, .6); m.rotation.y = .5; st.scene.add(m);
    const bk = bucket(); bk.position.set(-.4, 0, .4); st.scene.add(bk); const ts = hud(st, titleSigns(p.top, p.bottom, 0x6a8ab0), .66, 0, .86), sh = hud(st, check(true), -.25, -.25, .14);
    return { ...st, update(t, s) { m.pose({ s, sit: .6, handR: reach([.4, 1.2, .7], 1), handL: reach([.3, 1.1, .7], 1, -1), smile: .9, look: [.4, 0] }); cw.rotation.y = Math.sin(s * .5) * .1; ts.update(t, s); sh.scale.setScalar(popIn(t, .6)); orbit(st, s, [0, 1.8, 0], 7.4, .3); } };
  };
  BUILD.h16_2 = () => {
    const st = H.room('cottage'), j = H.who(jenner, 'coat'); j.position.set(-1.0, 0, .2); j.rotation.y = .6; st.scene.add(j); const m = H.who(maid); m.position.set(.6, 0, .4); m.rotation.y = -.5; st.scene.add(m);
    const cw = bigCow(); cw.position.set(1.8, 0, -1.6); st.scene.add(cw); const gs = [0, 1, 2].map(() => { const g = pox(0xff8ad0); st.scene.add(g); return g; });
    const l1 = hud(st, tag('COWPOX', 0xff8ad0, '#ffffff', 1.9, .55), .62, 0, .42), l2 = hud(st, tag('MILD', 0x3cc85a, '#ffffff', 1.2, .44), .5, 0, .26);
    return { ...st, update(t, s) { j.pose({ s, handR: reach('chin', 1), brow: .4, squint: .3, look: [.6, 0] }); m.pose({ s, handR: reach([-.3, 1.8, .7], 1), mouth: Math.abs(Math.sin(s * 5)) * .4, smile: .6 });
      gs.forEach((g, i) => { const a = s + i * 2.1; g.position.set(1.8 + Math.cos(a) * .9, 2.6 + Math.sin(a * 1.3) * .3, -1.6 + Math.sin(a) * .9); g.rotation.y = s * 2; });
      l1.scale.setScalar(popIn(t, .25)); l2.scale.setScalar(popIn(t, .5)); orbit(st, s, [.3, 2.0, -.4], 7.8, .3); } };
  };
  BUILD.h16_3 = () => {
    const st = H.room('candle', { top: '#d8c8a8', bottom: '#f0e0c0' }), ch = B.chair(0x8a5a2a); ch.position.set(-.5, 0, -.15); st.scene.add(ch); const b = H.who(boy); b.scale.setScalar(.75); b.position.set(-.5, .05, 0); st.scene.add(b);
    const j = H.who(jenner, 'coat'); j.position.set(.9, 0, .1); j.rotation.y = -1.0; st.scene.add(j); const ln = H.lancet(); ln.scale.setScalar(.8); st.scene.add(ln);
    const l1 = hud(st, tag('1796', 0x1d1d24, '#ffffff', 1.3, .56), .62, -.22, .28), l2 = hud(st, tag('AGE 8', 0xffd23f, '#3a2400', 1.3, .5), .62, .22, .28), l3 = hud(st, tag('A TINY SCRATCH', 0xffffff, '#1d2442', 2.6, .44), .48, 0, .56);
    return { ...st, update(t, s) { b.pose({ s, sit: 1, sitY: 0, armR: [.3, .9], squint: .4, smile: .2, look: [.6, -.2] }); const ap = new THREE.Vector3(); b.userData.arms[0].userData.el.getWorldPosition(ap);
      const h = j.worldToLocal(ap.clone().add(V(.15, .2, .25))); j.pose({ s, handR: h, poleR: [1, -.5, -.2], look: [-.4, -.5], smile: .3 }); ln.position.copy(ap).add(V(.15, .15, .25)); ln.rotation.z = .9 + Math.sin(s * 6) * .1;
      [l1, l2, l3].forEach((l, i) => l.scale.setScalar(popIn(t, .1 + i * .2))); orbit(st, s, [.2, 1.9, 0], 6.8, .3); } };
  };
  BUILD.h16_4 = () => {
    const st = H.room('cottage'), b = H.who(boy); b.position.set(0, 0, 0); st.scene.add(b); const sh = M(SPH(1.9, 32, 24), glowM(0x9fd8ff, .5, { transparent: true, opacity: .18 }), { pos: [0, 1.7, 0], shadow: false }); sh.material.transparent = true; sh.material.opacity = .18; sh.material.depthWrite = false; st.scene.add(sh);
    const gs = Array.from({ length: 6 }, () => { const g = pox(); st.scene.add(g); return g; }); const l1 = hud(st, tag("DIDN'T GET SICK", 0x3cc85a, '#ffffff', 2.8, .52), .62, 0, .62), ok = hud(st, check(true), .48, 0, .14);
    return { ...st, update(t, s) { b.pose({ s, smile: 1, handR: reach('up', seg(t, .4, .5)), handL: reach('up', seg(t, .4, .5), -1), bob: 2 });
      gs.forEach((g, i) => { const a = i / 6 * Math.PI * 2 + s * .3, u = Math.abs(Math.sin(s * 1.6 + i)), r = 1.9 + u * 1.4; g.position.set(Math.cos(a) * r, 1.7 + Math.sin(a * 2) * .9, Math.sin(a) * r * .6); g.rotation.y = s * 2; });
      sh.material.opacity = .12 + Math.abs(Math.sin(s * 3)) * .1; l1.scale.setScalar(popIn(t, .45)); ok.scale.setScalar(popIn(t, .6)); orbit(st, s, [0, 1.8, 0], 7.6, .3); } };
  };
  BUILD.h16_5 = () => {
    const st = H.room('greek'), cw = bigCow(); cw.position.set(0, 0, 0); st.scene.add(cw);
    const l1 = hud(st, tag('COW = "VACCA"', 0xffffff, '#1d2442', 2.6, .52), .62, 0, .6), ar = hud(st, tag('↓', 0xffd23f, '#3a2400', .6, .5), .5, 0, .12), l2 = hud(st, tag('VACCINE', 0x3fa9ff, '#ffffff', 2.0, .6), .38, 0, .5);
    return { ...st, update(t, s) { cw.rotation.y = .6 + Math.sin(s * .5) * .3; l1.scale.setScalar(popIn(t, .1)); ar.scale.setScalar(popIn(t, .4)); l2.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 1.5, 0], 8.8, .3); } };
  };
  BUILD.h16_6 = () => {
    const st = H.room('night', { top: '#1a2a4a', bottom: '#3a5a8a' }), gl = G(M(SPH(1.4, 48, 32), plastic(0x3a7ad8, { roughness: .3 })), ...[[.3, .9, .9], [-.8, .2, 1.0], [.9, -.4, .9], [-.2, -.8, 1.1]].map(p => M(SPH(.55, 24, 16), plastic(0x5ab84a), { pos: p.map(v => v * .9), scale: [1, .7, .5] })));
    gl.position.set(0, 2.2, 0); st.scene.add(gl); const R = rng(4), conf = Array.from({ length: 30 }, (_, i) => { const c = M(RB(.12, .04, .06, .01), plastic([0xffd23f, 0xff4a5c, 0x3cc85a, 0x3fa9ff][i % 4]), { shadow: false }); c.userData.p = [R() * 5 - 2.5, R(), R() * 2 - 1]; st.scene.add(c); return c; });
    const l1 = hud(st, tag('1980', 0xffffff, '#1d2442', 1.3, .56), .66, 0, .3), l2 = hud(st, tag('SMALLPOX: ERADICATED', 0x3cc85a, '#ffffff', 3.4, .5), .54, 0, .76);
    return { ...st, update(t, s) { gl.rotation.y = s * .4; conf.forEach((c, i) => { const [x, o, z] = c.userData.p, u = frac(s * .25 + o); c.position.set(x, 5 - u * 5, z); c.rotation.set(s * 3 + i, s * 2, i); c.visible = t > .3; });
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .3)); shoot(st, [0, 2.4, 10.0], [0, 2.4, 0]); } };
  };
}
