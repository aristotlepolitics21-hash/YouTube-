// Sets for Body Shorts episode 8: Why Your Foot Falls Asleep.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, makeDoctor, reach, hud, shoot, orbit, nerve, vessel, pulse, check, counter, skinM } = B;
  const girl = { skin: 0x7a4a30, shirt: 0x2fbf71, hair: 0x15100c, hairStyle: 'long', eye: 0x2a1a10, pants: 0x3a4a8a };
  const NV = 0xffd23f;
  const kneel = { sit: 1, knee: 2.95, sitY: -.12 };
  // nerves that ride inside the legs, so they follow any pose (visible through x-ray clothes)
  function legNerves(who) { const out = []; who.userData.legs.forEach(l => { const a = nerve([[0, 0, .08], [0, -.25, .1], [0, -.47, .1]], .035), b = nerve([[0, 0, .1], [0, -.25, .12], [0, -.43, .2]], .035); l.add(a); l.userData.knee.add(b); out.push(a, b); }); return out; }
  const zzz = (st) => ['z', 'Z', 'z'].map(l => { const g = tag(l, 0x9b7bff, '#ffffff', .4, .4); st.scene.add(g); return g; });
  function bigFoot() { const sk = skinM(0x7a4a30), g = new THREE.Group(); g.add(M(SPH(1, 48, 32), sk, { scale: [.75, .45, 1.5] }));
    [[-.45, .95, .28], [-.2, 1.05, .25], [.05, 1.05, .23], [.28, .98, .21], [.48, .88, .19]].forEach(([x, z, r]) => g.add(M(SPH(r, 24, 16), sk, { pos: [x, .1, z + .25] }))); return g; }

  BUILD.fa_hook = (p) => {
    const st = set('lilac'), who = makePerson(girl); who.rotation.y = .5; st.scene.add(who); const zs = zzz(st); const ts = hud(st, titleSigns(p.top, p.bottom, 0x2fbf71), .66, 0, .86);
    return { ...st, update(t, s) { who.pose({ s, ...kneel, smile: lerp(.5, -.3, seg(t, .5, .7)), wide: seg(t, .55, .65), look: [.6, -.6], handR: reach([.5, 1.0, .5], 1), handL: reach([.5, 1.0, .5], 1, -1) });
      zs.forEach((g, i) => { const u = frac(s * .4 + i / 3); g.position.set(-.35 + u * .5, .45 + u * .9, -.7); g.scale.setScalar(Math.sin(u * Math.PI) * seg(t, .3, .45)); });
      ts.update(t, s); orbit(st, s, [0, 1.6, 0], 5.6, .5); } };
  };
  BUILD.fa_nerve = () => {
    const st = set('xray'), who = makePerson(girl); who.rotation.y = 1.2; st.scene.add(who); const ns = legNerves(who);
    const press = sprite(0xff3b3b, 1.0, 0); press.position.set(.15, .35, -.3); st.scene.add(press);
    const lb = hud(st, tag('SQUASHED NERVE', 0xff4a5c, '#ffffff', 2.7, .46), .6, 0, .64);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, ...kneel, smile: -.2 }); const k = seg(t, .3, .5); press.material.opacity = k * (.6 + .3 * Math.sin(s * 8));
      ns.forEach((n, i) => { n.material.emissiveIntensity = 1.4 + k * 1.5 * (i % 2); n.material.emissive.setHex(k > .5 && i % 2 ? 0xff6a3c : NV); }); lb.scale.setScalar(popIn(t, .4)); orbit(st, s, [0, .8, 0], 4.0, .9); } };
  };
  function pinchRig(st) { const nv = nerve([[-5, 2.6, 0], [0, 2.6, 0], [5, 2.6, 0]], .3), vs = vessel([[-5, 1.6, 0], [0, 1.6, 0], [5, 1.6, 0]], .3); st.scene.add(nv, vs);
    const block = M(RB(1.6, 1.4, 1.6, .2), plastic(0x3a4a8a, { roughness: .6 }), { pos: [0, 4.3, 0] }); st.scene.add(block);
    const ps = [0, 1, 2, 3, 4, 5].map(() => { const p = sprite(0xffffff, .7, 1); st.scene.add(p); return p; });
    return { nv, vs, block, ps, squash(k) { block.position.y = lerp(4.6, 3.05, k); nv.scale.set(1, 1, 1); [nv, vs].forEach((m, i) => { m.scale.y = 1; }); } }; }
  BUILD.fa_signal = () => {
    const st = set('flesh'), r = pinchRig(st), l1 = hud(st, tag('NERVE', NV, '#3a2400', 1.4, .44), .62, -.3, .34), l2 = hud(st, tag('SIGNALS STOP', 0xff4a5c, '#ffffff', 2.4, .46), .48, .15, .55);
    const pinchTex = M(new THREE.CylinderGeometry(.34, .34, 1.4, 32), plastic(0xff6a3c, { transparent: true, opacity: 0 }), { rot: [0, 0, Math.PI / 2], pos: [0, 2.6, 0], shadow: false }); st.scene.add(pinchTex);
    return { ...st, update(t, s) { const k = ease(seg(t, .05, .3)); r.squash(k); pinchTex.material.opacity = k * .6; const speed = lerp(1.2, .15, ease(seg(t, .2, .7)));
      r.ps.forEach((p, i) => { const x = -5 + ((s * speed * 3 + i * 1.6) % 8); const blocked = t > .7 && x > -.6; p.visible = !blocked && x < -.6 || t < .3; p.position.set(Math.min(x, t > .3 ? -.6 : 5), 2.6, .35); p.material.opacity = 1 - seg(t, .6, .8) * .6; });
      l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .65)); shoot(st, [0, 3.4, 8.0], [0, 2.6, 0]); } };
  };
  BUILD.fa_wake = () => {
    const st = set('flesh'), r = pinchRig(st), sparks = new THREE.Group(), R = rng(9), P = []; for (let i = 0; i < 24; i++) { sparks.add(sprite(0xfff3a0, .5, 0)); P.push([R() * 10 - 5, R() * 6, R() * .5]); } st.scene.add(sparks);
    const lb = hud(st, tag('STATIC!', NV, '#3a2400', 1.6, .55), .6, 0, .4);
    return { ...st, update(t, s) { const k = 1 - ease(seg(t, .05, .25)); r.squash(k); r.ps.forEach(p => p.visible = false);
      sparks.children.forEach((sp, i) => { const [x, ph, z] = P[i], on = frac(s * 3 + ph) < .25 && t > .25; sp.position.set(x, 2.6 + Math.sin(i) * .2, .35 + z); sp.material.opacity = on ? 1 : 0; sp.scale.setScalar(.4 + Math.sin(s * 20 + i) * .2); });
      r.nv.material.emissiveIntensity = t > .25 ? 1.4 + Math.sin(s * 37) * 1.2 : 1.4; lb.scale.setScalar(popIn(t, .3)); lb.rotation.z = Math.sin(s * 30) * .05; shoot(st, [Math.sin(s * 40) * .03, 3.4, 8.0], [0, 2.6, 0]); } };
  };
  BUILD.fa_pins = () => {
    const st = set('lilac'), ft = bigFoot(); ft.position.set(0, 1.2, 0); ft.rotation.set(.3, .4, 0); st.scene.add(ft);
    const R = rng(4), pins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const p = G(M(new THREE.CylinderGeometry(.015, .002, .7, 8), K.metal(0xd7dbe6), { pos: [0, .35, 0] }), M(SPH(.06, 12, 8), plastic([0xff4a5c, 0xffd23f, 0x3fa9ff][i % 3]), { pos: [0, .72, 0] }));
      const a = R() * 6.28, b = R() * .9; p.position.set(Math.cos(a) * .6 * b, 1.55 + R() * .2, Math.sin(a) * 1.2 * b); p.rotation.set((R() - .5) * .6, 0, (R() - .5) * .6); p.userData.ph = R() * 6; st.scene.add(p); return p; });
    const sps = pins.map(p => { const s_ = sprite(0xfff3a0, .4, 0); s_.position.copy(p.position); st.scene.add(s_); return s_; });
    const lb = hud(st, tag('PINS & NEEDLES', 0xffffff, '#1d2442', 2.5, .5), .6, 0, .62);
    return { ...st, update(t, s) { pins.forEach((p, i) => { const on = frac(s * 1.5 + p.userData.ph) < .5; p.scale.setScalar(on ? 1 : 0); sps[i].material.opacity = on ? .8 : 0; }); lb.scale.setScalar(popIn(t, .2)); orbit(st, s, [0, 1.5, 0], 5.6, 1.2); } };
  };
  BUILD.fa_back = () => {
    const st = set('mint'), who = makePerson(girl); st.scene.add(who); const ok = hud(st, check(true), .55, .42, .2);
    const clk = hud(st, counter(1.9, .66, k => (k < .5 ? 1 : 2) + ' MIN', '#1d2442'), .58, -.12, .45); clk.userData.w = 1.9;
    return { ...st, update(t, s) { const up = ease(seg(t, .05, .35)); who.pose({ s, sit: 1 - up, knee: lerp(2.95, 0, up), sitY: lerp(-.12, 0, up), smile: .9, handR: reach('up', seg(t, .4, .55)), handL: reach('up', seg(t, .4, .55), -1) });
      clk.set(seg(t, .1, .6)); clk.scale.setScalar(popIn(t, .05)); ok.scale.setScalar(popIn(t, .6)); orbit(st, s, [0, 2.0, 0], 6.2, .3); } };
  };
  BUILD.fa_doctor = () => {
    const st = set('clinic'), who = makePerson(girl); who.position.set(-.85, 0, 0); who.rotation.y = .5; st.scene.add(who);
    const doc = makeDoctor({ skin: 0xf2c7a5, hair: 0x6b4a2e }); doc.position.set(.95, 0, -.3); doc.rotation.y = -.55; st.scene.add(doc);
    const lb = hud(st, tag('GET IT CHECKED', 0x3cc85a, '#ffffff', 2.6, .5), .6, 0, .64);
    return { ...st, update(t, s) { who.pose({ s, smile: .2, brow: .3, handR: reach([.4, 1.2, .5], seg(t, .1, .3)) }); doc.pose({ s, smile: .6, handR: reach('chin', seg(t, .3, .5)), headTilt: .1 }); lb.scale.setScalar(popIn(t, .15)); orbit(st, s, [0, 2.2, 0], 6.8, .4); } };
  };
}
