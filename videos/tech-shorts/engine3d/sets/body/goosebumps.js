// Sets for Body Shorts episode 5: Why You Get Goosebumps.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, SPH, G, plastic, matte, glowM, sprite, clamp, lerp, seg, ease, frac, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, nerve, pulse, animal, skinSection, link, notes, snow, lumpy, skinM } = B;
  const guy = { skin: 0xf2c7a5, shirt: 0x5b8cff, hair: 0x6b4a2e };
  const MUS = 0xe2475a, HAIR = 0x3a2418;
  // one hair in its follicle with its little muscle. set(k): 0 = lying flat, 1 = standing up
  function hairUnit(x, top) { const g = new THREE.Group(), root = V(x, top - 1.0, .25), piv = new THREE.Group(); piv.position.copy(root); g.add(piv);
    piv.add(M(new THREE.CapsuleGeometry(.12, .9, 8, 16), plastic(0xf7c6b8, { roughness: .5 }), { pos: [0, .5, 0] }), M(new THREE.CylinderGeometry(.035, .045, 2.3, 10), plastic(HAIR), { pos: [0, 1.25, 0] }));
    const bulb = M(SPH(.17, 20, 14), plastic(0xd98a7a), {}); piv.add(bulb);
    const mus = M(new THREE.CapsuleGeometry(.09, 1, 8, 16), plastic(MUS, { roughness: .4 }), {}); g.add(mus);
    const anchor = V(x + 1.1, top - .4, .25), bump = M(SPH(.45, 32, 20), skinM(0xf2c7a5), { pos: [x + .25, top, -.2], scale: [1, 0, 1] }); g.add(bump);
    g.set = k => { piv.rotation.z = lerp(-1.0, -.12, k); const att = V(0, .55, 0).applyEuler(piv.rotation).add(root); link(mus, att, anchor, 1); mus.scale.x = mus.scale.z = 1 + k * .5; bump.scale.y = .02 + k * .38; };
    g.set(0); return g; }

  BUILD.gb_hook = (p) => {
    const st = set('night'), who = makePerson(guy); st.scene.add(who); const sn = snow(50, [6, 6, 3]); sn.position.set(0, 0, 0); st.scene.add(sn);
    const nt = notes(4); nt.position.set(-1.0, 3.0, .5); st.scene.add(nt);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0x5b8cff), .66, 0, .86);
    return { ...st, update(t, s) { const hug = seg(t, .05, .25), sh = Math.sin(s * 40) * .02 * hug; who.position.x = sh;
      who.pose({ s, handR: reach([-.45, 1.95, .35], hug), handL: reach([-.45, 1.95, .35], hug, -1), poleR: [.5, -.8, .3], poleL: [-.5, -.8, .3], squint: .4, brow: .6, smile: -.2, mouth: .1 + Math.abs(Math.sin(s * 20)) * .08 });
      sn.update(s); nt.update(s, seg(t, .3, .45)); ts.update(t, s); orbit(st, s, [0, 2.5, 0], 5.0, .2); } };
  };
  BUILD.gb_muscle = () => {
    const st = set('flesh'), sk = skinSection({ top: 3.2 }); st.scene.add(sk); const h = hairUnit(-.6, 3.2); st.scene.add(h);
    const l1 = hud(st, tag('HAIR', 0x3a2418, '#ffffff', 1.2, .46), .62, -.25, .3), l2 = hud(st, tag('TINY MUSCLE', MUS, '#ffffff', 2.2, .46), -.15, .2, .52);
    return { ...st, update(t, s) { h.set(.05 + Math.sin(s * 2) * .03); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .4)); shoot(st, [Math.sin(s * .4) * .5, 3.0, 6.2], [0, 2.6, 0]); } };
  };
  BUILD.gb_pull = () => {
    const st = set('flesh'), sk = skinSection({ top: 3.2 }); st.scene.add(sk); const hs = [-2.4, -.6, 1.2].map(x => { const h = hairUnit(x, 3.2); st.scene.add(h); return h; });
    const nv = nerve([[4, .8, .3], [2.5, 1.2, .3], [1.0, 1.6, .3], [-.6, 2.2, .3]], .04); st.scene.add(nv); const pl = pulse(nv.userData.curve, 0xfff3a0, .35); st.scene.add(pl);
    const lb = hud(st, tag('SQUEEZE!', MUS, '#ffffff', 1.9, .5), .62, 0, .45);
    return { ...st, update(t, s) { const k = ease(seg(t, .3, .6)); hs.forEach((h, i) => h.set(clamp(k * 1.2 - i * .1))); pl.at(seg(t, .05, .3)); lb.scale.setScalar(popIn(t, .3)); shoot(st, [0, 3.2, 7.2], [0, 2.7, 0]); } };
  };
  BUILD.gb_fur = () => {
    const st = set('night', { top: '#1a2850', bottom: '#4a6aa0', floor: 0xdfe8ff }), bear = animal('dog', { color: 0x8a5a3c }); bear.scale.setScalar(1.6); st.scene.add(bear);
    const sn = snow(50); st.scene.add(sn); const warm = M(SPH(1.5, 40, 28), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }), { pos: [0, 1.5, 0], scale: [1, .8, 1.4], shadow: false }); st.scene.add(warm);
    const lb = hud(st, tag('WARM AIR', 0xffa040, '#3a1a00', 1.9, .5), .6, 0, .45);
    return { ...st, update(t, s) { const k = ease(seg(t, .15, .5)); bear.pose({ s, puff: k, tailUp: .3 }); bear.rotation.y = .6 + Math.sin(s * .3) * .1; warm.material.opacity = k * (.12 + Math.sin(s * 3) * .03); sn.update(s); lb.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 1.5, 0], 7.6, .6); } };
  };
  BUILD.gb_cat = () => {
    const st = set('lilac'), cat = animal('cat', { color: 0x3a3d4a }); cat.scale.setScalar(1.7); st.scene.add(cat);
    const lb = hud(st, tag('BIGGER!', 0xff4a5c, '#ffffff', 1.8, .55), .6, 0, .45);
    return { ...st, update(t, s) { const k = ease(seg(t, .2, .45)); cat.pose({ s, puff: k, arch: k, tailUp: .4 + k * 1.1, mouth: k * .6 + Math.sin(s * 9) * .1 * k, headNod: -k * .1 }); cat.rotation.y = .9; cat.scale.setScalar(1.7 * (1 + k * .15));
      lb.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 1.6, 0], 8.6, .6); } };
  };
  BUILD.gb_us = () => {
    const st = set('mint'), arm = M(new THREE.CapsuleGeometry(.9, 5, 16, 48), skinM(0xf2c7a5), { rot: [0, 0, Math.PI / 2 - .1], pos: [0, 2.3, 0] }); st.scene.add(arm);
    const n = 70, R = rng(8), bumps = new THREE.InstancedMesh(SPH(.12, 12, 8), skinM(0xf2c7a5), n), hairs = new THREE.InstancedMesh(new THREE.CylinderGeometry(.008, .012, .32, 6), plastic(HAIR), n), P = [];
    for (let i = 0; i < n; i++) P.push([(R() - .5) * 4.6, R() * 2.6 - 1.3]); st.scene.add(bumps, hairs); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const lb = hud(st, tag('THE SAME REFLEX', 0xffffff, '#1d2442', 2.8, .46), .6, 0, .66);
    return { ...st, update(t, s) { const k = ease(seg(t, .2, .55));
      P.forEach(([x, a], i) => { const nrm = V(0, Math.cos(a), Math.sin(a)).applyAxisAngle(V(0, 0, 1), -.1), base = V(x, 2.3 - x * .1, 0).addScaledVector(nrm, .9);
        m.compose(base, q.setFromUnitVectors(V(0, 1, 0), nrm), V(1, .3 + k * .8, 1)); bumps.setMatrixAt(i, m);
        const tilt = lerp(1.3, .1, k), dir = nrm.clone().applyAxisAngle(V(0, 0, 1), tilt); m.compose(base.clone().addScaledVector(dir, .17), q.setFromUnitVectors(V(0, 1, 0), dir), V(1, 1, 1)); hairs.setMatrixAt(i, m); });
      bumps.instanceMatrix.needsUpdate = hairs.instanceMatrix.needsUpdate = true; lb.scale.setScalar(popIn(t, .45)); shoot(st, [Math.sin(s * .4) * .4, 3.4, 5.4], [0, 2.4, 0]); } };
  };
  BUILD.gb_end = () => {
    const st = set('warm'), now = makePerson(guy); now.position.set(.85, 0, 0); now.rotation.y = -.25; st.scene.add(now);
    const old = makePerson({ skin: 0xc79a72, shirt: 0x6b4a2e, pants: 0x6b4a2e, hair: 0x4a3020, shoe: 0x6b4a2e }); old.position.set(-.85, 0, -.2); old.rotation.y = .25; st.scene.add(old);
    const furM = matte(0x5a3b22, { roughness: 1 }); [[0, 1.6, 0, [.62, .7, .5]], [0, 2.75, -.05, [.7, .72, .7]], [0, 1.05, 0, [.55, .4, .45]]].forEach(([x, y, z, sc]) => { const f = lumpy(1, .12, 16, furM, y * 3); f.position.set(x, y, z); f.scale.set(...sc); old.add(f); });
    old.userData.head.children[0].visible = true;
    const l1 = hud(st, tag('THEN', 0x6b4a2e, '#ffffff', 1.3, .46), .5, -.42, .3), l2 = hud(st, tag('NOW', 0x5b8cff, '#ffffff', 1.3, .46), .5, .42, .3);
    return { ...st, update(t, s) { old.pose({ s, smile: .4, brow: -.2, seed: .3 }); now.pose({ s, smile: .8, handR: reach('wave', seg(t, .5, .65)) }); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.3, 0], 6.6, .3); } };
  };
}
