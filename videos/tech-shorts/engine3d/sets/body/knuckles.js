// Sets for Body Shorts episode 3: What Happens When You Crack Your Knuckles.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, SPH, G, plastic, sprite, label, sign, clamp, lerp, seg, ease, pop, V } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, makeDoctor, reach, hud, shoot, orbit, check, counter, gauge, bigHand, trophy, arrow } = B;
  const guy = { skin: 0xd9a07a, shirt: 0x2fbf71, hair: 0x1a120c };
  const BONE = 0xf3ead6;
  // a finger joint, cut open: two bones, the joint capsule, its fluid, and a gas bubble. gap(g) pulls the bones apart.
  function joint() {
    const g = new THREE.Group(), bm = plastic(BONE, { roughness: .5, clearcoat: .3 });
    const bones = [-1, 1].map(d => { const b = new THREE.Group(); b.add(M(new THREE.CylinderGeometry(.3, .34, 2.4, 32), bm, { pos: [d * 1.6, 0, 0], rot: [0, 0, Math.PI / 2] }), M(SPH(.46, 40, 28), bm, { pos: [d * .5, 0, 0], scale: [.8, 1, 1] })); g.add(b); return b; });
    const sac = M(new THREE.CapsuleGeometry(.72, 1.0, 12, 32), plastic(0xbfe6ff, { transparent: true, opacity: .32, roughness: .1, depthWrite: false }), { rot: [0, 0, Math.PI / 2], shadow: false }); g.add(sac);
    const fluid = M(SPH(.5, 32, 24), plastic(0x6fd0ff, { transparent: true, opacity: .35, roughness: .05, depthWrite: false }), { scale: [.7, 1.1, 1.1], shadow: false }); g.add(fluid);
    const skin = M(new THREE.CapsuleGeometry(1.15, 4.6, 12, 40), B.skinM(0xd9a07a), { rot: [0, 0, Math.PI / 2], shadow: false }); skin.material.transparent = true; skin.material.opacity = .16; skin.material.depthWrite = false; g.add(skin);
    const bubble = M(SPH(.26, 32, 24), plastic(0xffffff, { transparent: true, opacity: .8, roughness: .02, clearcoat: 1 }), { shadow: false }); bubble.scale.setScalar(0); g.add(bubble);
    const flash = sprite(0xffffff, 2.2, 0); g.add(flash);
    g.gap = k => { bones[0].position.x = -k / 2; bones[1].position.x = k / 2; sac.scale.set(1, 1 + k * .35, 1); fluid.scale.set(.7 + k * .5, 1.1, 1.1); };
    g.bubble = (k, f = 0) => { bubble.scale.setScalar(k); flash.material.opacity = f; };
    g.fluid = fluid; return g;
  }
  const popTag = (st, x, y, z) => { const p = tag('POP!', 0xffd23f, '#3a2400', 1.2, .5); p.position.set(x, y, z); st.scene.add(p); return p; };

  BUILD.kn_hook = (p) => {
    const st = set('warm'), who = makePerson(guy); st.scene.add(who);
    const ts = hud(st, titleSigns(p.top, p.bottom), .66, 0, .86);
    const pops = [[.9, 2.3, .9], [-.9, 2.0, 1.0], [.7, 1.6, 1.1]].map(q => popTag(st, ...q));
    return { ...st, update(t, s) { const k = seg(t, .05, .25), push = Math.sin(clamp((t - .3) / .6) * Math.PI * 3) * seg(t, .3, .35);
      who.pose({ s, handR: reach([.13 + push * .05, 1.85, .72 + push * .12], k), handL: reach([.13 + push * .05, 1.85, .72 + push * .12], k, -1), poleR: [1, -.4, -.3], poleL: [-1, -.4, -.3], squint: .3 * Math.abs(push), smile: .7 });
      pops.forEach((q, i) => { const a = .38 + i * .18; q.scale.setScalar(t > a && t < a + .3 ? Math.min(1, pop((t - a) * 6)) * .6 : 0); q.rotation.z = (i - 1) * .2; });
      ts.update(t, s); orbit(st, s, [0, 2.45, 0], 5.0, .2); } };
  };
  BUILD.kn_capsule = () => {
    const st = set('flesh'), j = joint(); j.position.set(0, 2.4, 0); st.scene.add(j);
    const l1 = hud(st, tag('JOINT FLUID', 0x6fd0ff, '#0b2a40', 2.1, .46), .58, 0, .55);
    return { ...st, update(t, s) { j.gap(.05 + Math.sin(s * 2) * .03); j.rotation.y = Math.sin(s * .5) * .5 + .2; j.fluid.material.opacity = .3 + Math.sin(s * 3) * .08; l1.scale.setScalar(popIn(t, .25)); shoot(st, [0, 3.0, 6.8], [0, 2.4, 0]); } };
  };
  BUILD.kn_pull = () => {
    const st = set('flesh'), j = joint(); j.position.set(0, 2.4, 0); st.scene.add(j);
    const ar = arrow(0xffd23f, 1.1); ar.rotation.z = -Math.PI / 2; ar.position.set(1.6, 3.6, .4); st.scene.add(ar);
    const g = hud(st, gauge('PRESSURE'), .6, 0, .8);
    return { ...st, update(t, s) { const k = ease(seg(t, .15, .8)); j.gap(.05 + k * .55); j.rotation.y = .25; ar.position.x = 1.0 + k * 1.2; ar.scale.setScalar(popIn(t, .1)); g.set(1 - k * .85); g.scale.setScalar(popIn(t, .05)); shoot(st, [0, 3.0, 6.8], [0, 2.5, 0]); } };
  };
  BUILD.kn_bubble = () => {
    const st = set('flesh'), j = joint(); j.position.set(0, 2.4, 0); st.scene.add(j);
    const p = hud(st, tag('POP!', 0xffd23f, '#3a2400', 1.6, .7), .55, 0, .5), lb = hud(st, tag('GAS BUBBLE', 0xffffff, '#1d2442', 2.0, .44), -.2, 0, .5);
    return { ...st, update(t, s) { const at = .3, b = t > at ? Math.min(1.15, pop((t - at) * 4)) : 0, f = t > at ? Math.max(0, 1 - (t - at) * 6) : 0; j.gap(.6); j.rotation.y = .25; j.bubble(b * 1.3, f);
      p.scale.setScalar(popIn(t, at)); lb.scale.setScalar(popIn(t, .55)); const sh = f * .15; shoot(st, [Math.sin(s * 50) * sh, 3.0 + Math.cos(s * 47) * sh, 6.4], [0, 2.4, 0]); } };
  };
  BUILD.kn_wait = () => {
    const st = set('flesh'), j = joint(); j.position.set(0, 2.2, 0); st.scene.add(j);
    const clk = hud(st, counter(2.0, .7, k => Math.round(k * 20) + ' MIN', '#1d2442'), .58, 0, .55); clk.userData.w = 2.0;
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .9)); j.gap(.6 - k * .55); j.rotation.y = .25; j.bubble(1.3 * (1 - k)); clk.set(k); clk.scale.setScalar(popIn(t, .05)); shoot(st, [0, 2.9, 6.6], [0, 2.3, 0]); } };
  };
  BUILD.kn_doctor = () => {
    const st = set('clinic'), doc = makeDoctor({ hair: 0xd0d0d8 }); st.scene.add(doc);
    const yrs = hud(st, counter(2.2, .7, k => Math.round(k * 60) + ' YEARS', '#1d2442'), .6, 0, .6); yrs.userData.w = 2.2;
    const only = hud(st, tag('LEFT HAND ONLY', 0xff4a5c, '#ffffff', 2.6, .44), .42, 0, .62);
    const pops = [[.9, 2.2, .9], [-.8, 2.5, 1.0], [.7, 1.6, 1.1]].map(q => popTag(st, ...q));
    return { ...st, update(t, s) { const k = seg(t, .05, .2), sq = Math.sin(s * 9) * .03;
      doc.pose({ s, handL: reach([.05, 1.9, .7], k, -1), handR: reach([.02, 1.98 + sq, .78], k), poleR: [1, -.4, -.2], poleL: [-1, -.4, -.2], smile: .7, squint: .2 });
      pops.forEach((q, i) => { const a = .2 + i * .25; q.scale.setScalar(t > a && t < a + .2 ? Math.min(1, pop((t - a) * 6)) * .5 : 0); });
      yrs.set(ease(seg(t, .15, .9))); yrs.scale.setScalar(popIn(t, .1)); only.scale.setScalar(popIn(t, .35)); orbit(st, s, [0, 2.4, 0], 5.2, .2); } };
  };
  BUILD.kn_result = () => {
    const st = set('mint'), hs = [-1, 1].map(d => { const h = bigHand({ skin: 0xd9a07a, side: d < 0 ? 'left' : 'right' }); h.position.set(d * 1.05, 1.4, 0); h.rotation.z = -d * .12; st.scene.add(h); return h; });
    const cks = [-1, 1].map(d => { const c = check(true); c.position.set(d * 1.05, 3.2, .3); st.scene.add(c); return c; });
    const cup = trophy(); cup.position.set(0, 0, 1.4); cup.scale.setScalar(.9); st.scene.add(cup);
    const lb = hud(st, tag('IG NOBEL PRIZE', 0xffc44d, '#3a2400', 2.6, .5), .62, 0, .66);
    return { ...st, update(t, s) { hs.forEach((h, i) => { h.position.y = 1.4 + Math.sin(s * 2 + i) * .05; h.curl(Math.max(0, Math.sin(s * 3 + i)) * .15); }); cks.forEach((c, i) => c.scale.setScalar(popIn(t, .1 + i * .12)));
      cup.scale.setScalar(.9 * popIn(t, .5)); cup.rotation.y = s * .8; lb.scale.setScalar(popIn(t, .55)); orbit(st, s, [0, 2.1, 0], 6.8, .4); } };
  };
}
