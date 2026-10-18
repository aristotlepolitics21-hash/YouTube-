// Weird History of Medicine, episode 3 (cartoon 3D): Why Hospitals Still Use Leeches.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, bigHand, counter } = B;
  const doc = { skin: 0xf2c7a5, shirt: 0xf4f0e6, pants: 0x2a2f45, hair: 0x6b4a2e, coat: 0x2a2f45 };

  BUILD.h03_1 = (p) => {
    const st = H.room('apothecary'), d = H.who(doc, 'tophat', 'coat'); st.scene.add(d); const jar = H.jar(0x6a8a6a); st.scene.add(jar);
    const ls = [0, 1, 2, 3, 4].map(i => { const l = H.leech(.6); jar.add(l); return l; }); const ts = hud(st, titleSigns(p.top, p.bottom, 0x2a2a1e), .66, 0, .86);
    const ct = hud(st, tag('TENS OF MILLIONS A YEAR', 0xffffff, '#1d2442', 3.4, .44), .28, 0, .66);
    return { ...st, update(t, s) { const up = seg(t, .05, .25), h = reach([.75, 2.5, .6], up); d.pose({ s, handR: h, poleR: [1, -.6, -.2], smile: .8, brow: -.3, look: [.5, .3], headTilt: .1 });
      jar.position.copy(h).add(V(-.05, -.1, .2)); jar.scale.setScalar(.55); ls.forEach((l, i) => { l.position.set(Math.sin(s + i * 2) * .25, .3 + i * .14, Math.cos(s * .8 + i) * .2); l.rotation.y = s + i; l.wiggle(s + i); });
      ts.update(t, s); ct.scale.setScalar(popIn(t, .4)); orbit(st, s, [0, 2.6, 0], 5.2, .2); } };
  };
  BUILD.h03_2 = () => {
    const st = H.room('candle'), pt = H.who({ skin: 0xd9a07a, shirt: 0xf4f0e6, hair: 0x2a1a12 }); pt.position.set(-.5, 0, 0); pt.rotation.y = .5; st.scene.add(pt);
    const d = H.who(doc, 'tophat', 'coat'); d.position.set(1.0, 0, -.4); d.rotation.y = -.6; st.scene.add(d); const ls = [0, 1].map(() => { const l = H.leech(.5); st.scene.add(l); return l; });
    const lb = hud(st, tag('HEADACHES? LEECHES.', 0x2a2a1e, '#ffffff', 3.0, .46), .62, 0, .66);
    return { ...st, update(t, s) { const arm = reach([.85, 1.75, .6], 1); pt.pose({ s, handR: arm, poleR: [.5, -.8, -.4], squint: .6, brow: .8, smile: -.5, look: [.7, -.3] }); d.pose({ s, smile: .7, handR: reach('chin', 1) });
      const w = pt.localToWorld(arm.clone().add(V(-.15, .1, 0))); ls.forEach((l, i) => { l.position.copy(w).add(V(-.15 * i, .05 + i * .02, .1)); l.rotation.set(0, .5, .3); l.wiggle(s + i); }); lb.scale.setScalar(popIn(t, .25)); orbit(st, s, [0, 2.2, 0], 5.8, .3); } };
  };
  BUILD.h03_3 = () => {
    const st = H.room('night'), head = new THREE.Group(); head.position.set(0, 2.6, 0); st.scene.add(head);
    head.add(M(new THREE.CapsuleGeometry(1.2, 2.5, 16, 40), plastic(0x2a2a1e, { roughness: .2, clearcoat: 1 }), { rot: [Math.PI / 2, 0, 0], pos: [0, 0, -2.9] }));
    head.add(M(new THREE.CircleGeometry(1.0, 48), plastic(0x6a1a2a), { pos: [0, 0, .02] }));
    const jaws = [0, 1, 2].map(i => { const j = new THREE.Group(); j.rotation.z = i * Math.PI * 2 / 3; head.add(j); const jw = M(new THREE.SphereGeometry(.45, 24, 12, 0, Math.PI), plastic(0xd8c8b8), { pos: [0, .45, .1], rot: [0, 0, 0], scale: [1, 1, .4] }); j.add(jw);
      for (let k = 0; k < 7; k++) j.add(M(new THREE.ConeGeometry(.04, .14, 6), plastic(0xffffff), { pos: [-.36 + k * .12, .08, .2], rot: [0, 0, Math.PI] })); return j; });
    const l1 = hud(st, tag('3 JAWS', 0xffffff, '#1d2442', 1.5, .5), .62, -.25, .36), l2 = hud(st, tag('ANTI-CLOT SPIT', 0x7ad94a, '#14320a', 2.5, .46), -.3, .1, .55);
    return { ...st, update(t, s) { const o = .5 + .5 * Math.sin(s * 3); jaws.forEach(j => j.children[0].position.y = .45 + o * .25); head.rotation.set(Math.sin(s * .7) * .15, Math.sin(s * .5) * .25, s * .2);
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .5)); shoot(st, [0, 2.6, 5.4], [0, 2.6, 0]); } };
  };
  function orScene() { const st = H.room('clinic'), lamp = G(M(new THREE.CylinderGeometry(.9, .6, .3, 32), plastic(0xe8eef4), {}), M(new THREE.CircleGeometry(.6, 32), glowM(0xffffff, 2), { pos: [0, -.16, 0], rot: [Math.PI / 2, 0, 0] })); lamp.position.set(0, 5.2, .4); st.scene.add(lamp); return st; }
  function finger(st) { const h = bigHand({ skin: 0xf2c7a5 }); h.scale.setScalar(1.1); h.rotation.set(-1.4, 0, 0); h.position.set(0, 1.3, 0); st.scene.add(h);
    const tip = h.userData.fingers[1].userData.b, scar = M(new THREE.TorusGeometry(.12, .02, 6, 20), plastic(0xc8283c), { rot: [Math.PI / 2, 0, 0], pos: [0, 0, 0] }); h.userData.fingers[1].userData.a.add(scar); scar.position.y = .4; return { h, tip }; }
  BUILD.h03_4 = () => {
    const st = orScene(), sg = H.who({ skin: 0x7a4a30, shirt: 0x2fbf71, pants: 0x2fbf71, hair: 0x15100c }, 'scrubcap', 'mask'); sg.position.set(.4, 0, -2.4); st.scene.add(sg);
    const { h, tip } = finger(st), l = H.leech(.6); st.scene.add(l); const lb = hud(st, tag('REATTACHED FINGER', 0xffffff, '#1d2442', 2.9, .46), .62, 0, .66);
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .6)); sg.pose({ s, handR: reach([-.1, 1.9, 1.5], 1), poleR: [1, -.6, -.2], smile: .5, look: [0, -.8], headNod: .25 }); const w = new THREE.Vector3(); tip.getWorldPosition(w);
      l.position.copy(w).add(V(lerp(.8, .05, k), lerp(1.2, .3, k), .1)); l.rotation.set(0, 0, lerp(.8, -.2, k)); l.wiggle(s); lb.scale.setScalar(popIn(t, .3)); shoot(st, [1.4, 4.8, 4.0], [0, 1.4, -.9]); } };
  };
  BUILD.h03_5 = () => {
    const st = orScene(), { h, tip } = finger(st), l = H.leech(.7); st.scene.add(l); const mat = h.userData.mat, purple = new THREE.Color(0x8a4a8a), pink = new THREE.Color(0xf2c7a5);
    const lb = hud(st, tag('KEEPS BLOOD FLOWING', 0xd8283c, '#ffffff', 3.0, .46), .62, 0, .7);
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .9)); mat.color.copy(purple).lerp(pink, k); const w = new THREE.Vector3(); tip.getWorldPosition(w); l.position.copy(w).add(V(.05, .32, .05)); l.rotation.set(0, 0, -.2); l.wiggle(s * 1.5); l.scale.setScalar(.7 * (1 + k * .4));
      lb.scale.setScalar(popIn(t, .2)); shoot(st, [.8, 3.6, 2.4], [0, 1.4, -1.1]); } };
  };
  BUILD.h03_6 = () => {
    const st = H.room('clinic'), shelf = M(RB(4, .12, .8, .03), plastic(0xffffff), { pos: [0, 2.0, -1.2] }); st.scene.add(shelf); const ph = H.who({ skin: 0xffd9bd, shirt: 0xffffff, hair: 0xb5652b, hairStyle: 'long' }); ph.position.set(1.2, 0, 0); ph.rotation.y = -.4; st.scene.add(ph);
    [-1.4, -.9, -.4, .8, 1.3].forEach((x, i) => { const b = H.bottle([0x3fa9ff, 0xffb020, 0xffffff, 0x7ad94a, 0xb18cff][i], .9); b.position.set(x, 2.06, -1.2); st.scene.add(b); });
    const jr = H.jar(0x6a8a6a); jr.scale.setScalar(.7); jr.position.set(.2, 2.06, -1.2); st.scene.add(jr); const l = H.leech(.4); jr.add(l); l.position.y = .5;
    const lb = hud(st, tag('APPROVED IN 2004', 0x3cc85a, '#ffffff', 2.6, .5), .62, 0, .6), ok = hud(st, B.check(true), .45, 0, .16);
    return { ...st, update(t, s) { ph.pose({ s, smile: .9, handL: reach('point', seg(t, .1, .3), -1) }); l.wiggle(s); l.rotation.y = s; lb.scale.setScalar(popIn(t, .2)); ok.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 2.2, 0], 5.6, .3); } };
  };
}
