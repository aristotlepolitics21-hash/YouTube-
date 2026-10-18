// Sets for Body Shorts episode 14: Why Your Fingers Go Wrinkly in Water.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, bigHand, vessel, nerve, check, counter, skinM, spray } = B;
  const kid = { skin: 0xf2c7a5, shirt: 0xffffff, hair: 0x6b4a2e, eye: 0x4a7bd0 };
  const SKIN = 0xf2c7a5, WATER = 0x6fc8ff;
  function bathtub() { const w = plastic(0xffffff, { roughness: .2 }); const g = G(M(RB(3.2, 1.0, 1.8, .4), w, { pos: [0, .5, 0] })); const water = M(RB(2.9, .1, 1.5, .05), plastic(WATER, { transparent: true, opacity: .75, roughness: .02 }), { pos: [0, .95, 0] }); g.add(water);
    const R = rng(3); for (let i = 0; i < 18; i++) g.add(M(SPH(.12 + R() * .14, 16, 12), plastic(0xffffff, { roughness: .6 }), { pos: [(R() - .5) * 2.6, 1.0 + R() * .08, (R() - .5) * 1.2] })); return g; }
  // a big fingertip with ridges that rise as it wrinkles; set(k)
  function fingertip(r = .6, L = 2.2) { const g = new THREE.Group(); g.add(M(new THREE.CapsuleGeometry(r, L, 16, 40), skinM(SKIN)));
    g.add(M(RB(r * 1.0, r * .2, r * .9, .08), plastic(0xffe2e2, { roughness: .2 }), { pos: [0, L / 2 + r * .3, -r * .6], rot: [.5, 0, 0] }));
    const ridges = []; for (let i = 0; i < 9; i++) { const m = M(new THREE.TorusGeometry(r, .05, 8, 40), skinM(0xe8b898), { pos: [0, L / 2 - i * .2, 0], rot: [Math.PI / 2, 0, 0] }); g.add(m); ridges.push(m); }
    g.set = k => ridges.forEach((m, i) => { m.visible = k > .02; m.scale.set(1 + k * .03, 1 + k * .03, k * 1.6); }); g.set(0); return g; }

  BUILD.wf_hook = (p) => {
    const st = set('lilac'), tub = bathtub(); st.scene.add(tub); const who = makePerson(kid); who.position.set(-.3, 0, 0); st.scene.add(who); const h = bigHand({ skin: SKIN }); h.scale.setScalar(.35); st.scene.add(h);
    const ts = hud(st, titleSigns(p.top, p.bottom, WATER), .66, 0, .86);
    return { ...st, update(t, s) { const up = seg(t, .2, .4); const hp = reach([.75, 2.6, .6], up); who.pose({ s, sit: 1, legsOut: 1, sitY: .35, handR: hp, poleR: [1, -.5, -.2], smile: lerp(.6, -.1, seg(t, .45, .6)), wide: seg(t, .45, .55), look: [.6, .1] });
      h.position.copy(hp).add(V(-.3, -.05, .02)); h.visible = up > .5; h.curl(.1); ts.update(t, s); orbit(st, s, [0, 2.3, 0], 6.6, .5); } };
  };
  BUILD.wf_myth = () => {
    const st = set('lilac'), h = bigHand({ skin: SKIN }); h.scale.setScalar(2.0); h.position.set(0, .3, 0); st.scene.add(h); const dr = spray(30, WATER, 4); dr.scale.setScalar(2); st.scene.add(dr);
    const ns = h.userData.fingers.map(f => { const a = nerve([[0, 0, .08], [0, .2, .1], [0, .4, .1]], .022), b = nerve([[0, 0, .08], [0, .2, .09], [0, .35, .07]], .022); f.userData.a.add(a); f.userData.b.add(b); return [a, b]; }).flat();
    const pn = nerve([[0, .1, .2], [0, .6, .2], [0, 1.0, .1]], .03); h.add(pn); ns.push(pn);
    const l1 = hud(st, tag('SOAKED UP?', WATER, '#0b2a40', 2.0, .48), .62, 0, .48), x = hud(st, check(false), .62, .45, .16), l2 = hud(st, tag('NERVES!', 0xffd23f, '#3a2400', 1.7, .5), .46, 0, .4);
    return { ...st, update(t, s) { const k = seg(t, .5, .65); h.userData.mat.transparent = true; h.userData.mat.opacity = 1 - k * .55; ns.forEach(n => { n.visible = k > 0; n.material.emissiveIntensity = 1 + Math.sin(s * 8) * .8; });
      dr.fire(V(0, 2.4 / 2, .4 / 2), V(0, -1, .2), frac(s * .7) * (1 - k)); l1.scale.setScalar(popIn(t, .05)); x.scale.setScalar(popIn(t, .35)); l2.scale.setScalar(popIn(t, .55)); shoot(st, [Math.sin(s * .4) * .5, 3.2, 8.0], [0, 2.5, 0]); } };
  };
  BUILD.wf_shrink = () => {
    const st = set('flesh'), shell = M(new THREE.CapsuleGeometry(1.6, 2.4, 16, 48, ), skinM(SKIN), { pos: [0, 2.4, -1.0], scale: [1, 1, .4] }); st.scene.add(shell);
    const vs = [-.6, 0, .6].map(x => { const v = vessel([[x, .8, .1], [x * 1.1, 2.0, .1], [x * .8, 3.2, .1], [x * .4, 4.0, .1]], .16); v.userData.cx = x; st.scene.add(v); return v; });
    const clk = hud(st, counter(1.7, .62, k => Math.round(k * 5) + ' MIN', '#1d2442'), .62, 0, .4); clk.userData.w = 1.7; const lb = hud(st, tag('SHRINK', 0xd8283c, '#ffffff', 1.5, .46), .48, 0, .35);
    return { ...st, update(t, s) { const k = ease(seg(t, .2, .8)); vs.forEach(v => { v.scale.set(1 - k * .55, 1, 1 - k * .55); v.position.x = v.userData.cx * k * .55; }); clk.set(seg(t, .05, .3)); clk.scale.setScalar(popIn(t, .02)); lb.scale.setScalar(popIn(t, .45)); shoot(st, [0, 2.8, 7.2], [0, 2.4, 0]); } };
  };
  BUILD.wf_sink = () => {
    const st = set('flesh'), geo = new THREE.PlaneGeometry(6, 6, 160, 160), pos = geo.attributes.position, base = pos.array.slice(); const skin = M(geo, skinM(SKIN), { rot: [-Math.PI / 2, 0, 0], pos: [0, 1.6, 0] }); st.scene.add(skin);
    const lb = hud(st, tag('SKIN SINKS IN', 0xffffff, '#1d2442', 2.4, .48), .62, 0, .55);
    return { ...st, update(t, s) { const k = ease(seg(t, .05, .75)); for (let i = 0; i < pos.count; i++) { const x = base[i * 3], y = base[i * 3 + 1]; const w = Math.sin(x * 4.2 + Math.sin(y * 1.3) * 1.6) * .5 + Math.sin(x * 2.1 - y * 1.7) * .25; pos.setZ(i, -Math.max(0, w) * .45 * k); } pos.needsUpdate = true; geo.computeVertexNormals();
      lb.scale.setScalar(popIn(t, .3)); shoot(st, [Math.sin(s * .3) * .8 + 1.2, 2.9, 4.0], [0, 1.5, -1.0]); } };
  };
  BUILD.wf_proof = () => {
    const st = set('lilac'), a = fingertip(), b = fingertip(); a.position.set(-1.0, 2.2, 0); b.position.set(1.0, 2.2, 0); st.scene.add(a, b);
    const l1 = hud(st, tag('NERVES OK', 0x3cc85a, '#ffffff', 1.8, .44), .55, -.5, .34), l2 = hud(st, tag('NERVE DAMAGED', 0xff4a5c, '#ffffff', 2.4, .44), .55, .5, .42);
    const lb = hud(st, tag('NO WRINKLES', 0xffffff, '#1d2442', 2.1, .44), -.25, .5, .4);
    return { ...st, update(t, s) { a.set(ease(seg(t, .1, .5))); b.set(0); a.rotation.y = s * .3; b.rotation.y = -s * .3; l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .2)); lb.scale.setScalar(popIn(t, .55)); shoot(st, [0, 3.0, 8.4], [0, 2.3, 0]); } };
  };
  BUILD.wf_grip = () => {
    const st = set('mint'), tyre = new THREE.Group(); tyre.add(M(new THREE.TorusGeometry(1.0, .42, 24, 64), plastic(0x2a2a32, { roughness: .7 })), M(new THREE.CylinderGeometry(.62, .62, .5, 40), K.metal(0xc9cdd8), { rot: [Math.PI / 2, 0, 0] }));
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; tyre.add(M(RB(.16, .5, .9, .04), plastic(0x1a1a20), { pos: [Math.cos(a) * 1.4, Math.sin(a) * 1.4, 0], rot: [0, 0, a] })); } tyre.position.set(-1.0, 1.55, 0); st.scene.add(tyre);
    const f = fingertip(.45, 1.6); f.position.set(1.15, 2.0, 0); f.set(1); st.scene.add(f); const dr = spray(30, WATER, 6); st.scene.add(dr);
    const lb = hud(st, tag('LIKE TYRE TREAD', 0xffffff, '#1d2442', 2.6, .48), .62, 0, .6), idea = hud(st, tag('ONE IDEA', 0xffd23f, '#3a2400', 1.5, .4), .48, 0, .32);
    return { ...st, update(t, s) { tyre.rotation.z = -s * 1.2; f.rotation.y = s * .4; dr.fire(V(1.15, 1.2, .3), V(.2, -1, .4), frac(s * .8)); lb.scale.setScalar(popIn(t, .05)); idea.scale.setScalar(popIn(t, .25)); shoot(st, [0, 2.6, 8.0], [0, 2.0, 0]); } };
  };
  BUILD.wf_marbles = () => {
    const st = set('lilac'), bowl = (x, col) => { const b = M(new THREE.SphereGeometry(.8, 40, 20, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), plastic(col, { side: THREE.DoubleSide, roughness: .3 }), { pos: [x, 1.0, 0] }); st.scene.add(b); return b; };
    bowl(-1.2, 0x6fc8ff); bowl(1.2, 0xffb020); const R = rng(2), ms = [0, 1, 2, 3, 4, 5].map(i => { const m = M(SPH(.14, 24, 16), plastic([0xff4a5c, 0x3cc85a, 0x9b7bff, 0xffd23f, 0x35c8ef, 0xff7a59][i], { roughness: .02, clearcoat: 1 })); st.scene.add(m); return m; });
    const watch = hud(st, counter(1.6, .62, k => (k * 9.9).toFixed(1) + ' s', '#1d2442'), .6, -.2, .38); watch.userData.w = 1.6; const lb = hud(st, tag('FASTER', 0x3cc85a, '#ffffff', 1.5, .5), .6, .25, .35);
    const f = fingertip(.25, .9); f.set(1); f.rotation.z = Math.PI; st.scene.add(f);
    return { ...st, update(t, s) { const k = seg(t, .05, .95) * 6; ms.forEach((m, i) => { const u = clamp(k - i), x = lerp(-1.2, 1.2, ease(u)) + (i % 3 - 1) * .15, y = .55 + .25 + Math.sin(u * Math.PI) * 1.4 + (i % 2) * .1; m.position.set(x, y, (i % 2) * .2 - .1); });
      const cur = Math.min(5, Math.floor(k)), u = clamp(k - cur); f.position.set(lerp(-1.2, 1.2, ease(u)), .55 + Math.sin(u * Math.PI) * 1.4 + .75, 0); watch.set(t); watch.scale.setScalar(popIn(t, .02)); lb.scale.setScalar(popIn(t, .6)); shoot(st, [0, 3.0, 7.0], [0, 1.6, 0]); } };
  };
}
