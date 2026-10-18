// Sets for Body Shorts episode 4: What Actually Causes Brain Freeze.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, glowM, sprite, clamp, lerp, seg, ease, frac, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, tube, vessel, nerve, flow, pulse, brain, rbc, check, counter } = B;
  const kid = { skin: 0xf2c7a5, shirt: 0xffb020, hair: 0xb5652b, eye: 0x3b6fb0 };
  const ICE = 0x7fd8ff;
  function slushie() { const g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(.28, .2, .8, 32), plastic(0xffffff, { transparent: true, opacity: .55, roughness: .05 }), { pos: [0, .4, 0] }),
      M(new THREE.CylinderGeometry(.26, .19, .7, 32), plastic(0x3fa9ff, { roughness: .6 }), { pos: [0, .37, 0] }), M(SPH(.27, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), plastic(0x7fd0ff, { roughness: .7 }), { pos: [0, .78, 0] }),
      M(new THREE.CylinderGeometry(.03, .03, .9, 12), plastic(0xff4a5c), { pos: [.06, 1.05, 0], rot: [0, 0, -.15] })); return g; }
  function frost(n, center, r, seed = 3) { const g = new THREE.Group(), R = rng(seed), P = []; for (let i = 0; i < n; i++) { const s = sprite(0xcff4ff, .2, .9); g.add(s); P.push([R() * 6.28, R(), R() * 6]); }
    g.update = (s, k = 1) => g.children.forEach((sp, i) => { const [a, rr, ph] = P[i]; sp.position.set(center[0] + Math.cos(a + s * .4) * r * (.6 + rr * .4), center[1] + Math.sin(s * .7 + ph) * r * .5, center[2] + Math.sin(a + s * .4) * r * .5); sp.material.opacity = k * (.5 + .5 * Math.sin(s * 3 + ph)); }); return g; }
  // palate, tongue and the vessels above them, person-local (head centre is y=2.7)
  function mouthInside(who) { const I = who.userData.inner;
    const palate = M(RB(.42, .05, .5, .02), plastic(0xff9fb0), { pos: [0, 2.5, .32] }); I.add(palate);
    const tongue = M(SPH(.2, 32, 20), plastic(0xff6f86), { pos: [0, 2.4, .32], scale: [1.1, .4, 1.4] }); I.add(tongue);
    const vs = [-1, 1].map(d => { const v = vessel([[d * .12, 2.56, .55], [d * .1, 2.57, .35], [d * .06, 2.6, .1], [0, 2.7, -.1]], .025); I.add(v); return v; });
    return { palate, tongue, vs }; }
  // the three branches of the trigeminal nerve on one side of the face (person-local)
  const trig = d => [[[d * .5, 2.68, .05], [d * .35, 2.86, .4], [d * .18, 3.02, .55]], [[d * .5, 2.68, .05], [d * .38, 2.62, .45], [d * .2, 2.6, .58]], [[d * .5, 2.68, .05], [d * .42, 2.45, .35], [d * .2, 2.32, .52]]];

  BUILD.bf_hook = (p) => {
    const st = set('mint'), who = makePerson(kid); st.scene.add(who); const cup = slushie(); st.scene.add(cup);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0x3fa9ff), .66, 0, .86); const fr = frost(14, [0, 3.05, .3], .7); st.scene.add(fr);
    return { ...st, update(t, s) { const drink = seg(t, .05, .2) * (1 - seg(t, .5, .6)), hit = seg(t, .5, .58);
      const hand = reach([.12, 2.05, .75], drink); who.pose({ s, handR: hand, handL: reach('forehead', hit, -1), squint: hit, brow: hit * .8, mouth: hit * .4, smile: lerp(.6, -.5, hit), headNod: -drink * .1 + hit * .15, flush: 0 });
      cup.position.copy(hand).add(V(0, .05, .05)); cup.rotation.z = .1; fr.update(s, hit); ts.update(t, s); orbit(st, s, [0, 2.6, 0], 4.8, .15); } };
  };
  BUILD.bf_brain = () => {
    const st = set('xray'), who = makePerson(kid); st.scene.add(who); const br = brain(.95); br.position.set(0, 2.82, -.06); who.userData.inner.add(br);
    const th = hud(st, counter(1.8, .62, k => (37 * k).toFixed(0) + ' °C', '#2c9e3a'), .6, -.3, .4); th.userData.w = 1.8;
    const no = hud(st, tag('NO PAIN SENSORS', 0xff4a5c, '#ffffff', 2.8, .46), .45, .1, .66);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, smile: .2 }); br.rotation.y = Math.sin(s * .8) * .2; th.set(ease(seg(t, .1, .35))); th.scale.setScalar(popIn(t, .1)); no.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 2.75, 0], 3.4, .1); } };
  };
  BUILD.bf_roof = () => {
    const st = set('xray'), who = makePerson(kid); st.scene.add(who); who.xray(1); const { palate, vs } = mouthInside(who);
    const cold = sprite(ICE, .8, 0); cold.position.set(0, 2.47, .5); who.add(cold); const fr = frost(10, [0, 2.48, .45], .25, 5); who.add(fr);
    const lb = hud(st, tag('ROOF OF MOUTH', ICE, '#0b2a40', 2.5, .44), .6, 0, .6);
    return { ...st, update(t, s) { who.xray(1); who.pose({ s, smile: -.2, headTurn: -.2 }); const c = ease(seg(t, .1, .4)); cold.material.opacity = c * .8; fr.update(s, c);
      palate.material.color.setHex(c > .5 ? 0xa8e6ff : 0xff9fb0); vs.forEach(v => v.material.emissive = new THREE.Color(0x400008)); lb.scale.setScalar(popIn(t, .3)); shoot(st, [2.2, 2.75, 1.9], [0, 2.52, .3]); } };
  };
  BUILD.bf_vessels = () => {
    const st = set('flesh'), v = vessel([[-5, 0, 0], [-1.5, .05, 0], [1.5, -.05, 0], [5, 0, 0]], .7, 0xd8283c); v.position.y = 2.4; st.scene.add(v);
    v.material.transparent = true; v.material.opacity = .55; v.material.depthWrite = false;
    const cells = new THREE.Group(); const R = rng(4); const P = []; for (let i = 0; i < 18; i++) { const c = rbc(); c.scale.setScalar(1.8); cells.add(c); P.push([R() * 8 - 4, (R() - .5) * .7, (R() - .5) * .7, R() * 6]); } st.scene.add(cells);
    const lb = hud(st, tag('TIGHTEN', ICE, '#0b2a40', 1.7, .5), .6, 0, .45), l2 = hud(st, tag('WIDEN', 0xff6a5c, '#ffffff', 1.7, .5), .6, 0, .45);
    return { ...st, update(t, s) { const sq = seg(t, .05, .3) * (1 - seg(t, .5, .75)), wide = seg(t, .55, .8); const r = 1 - sq * .55 + wide * .25; v.scale.set(1, r, r);
      cells.children.forEach((c, i) => { const [x, y, z, ph] = P[i]; c.position.set(((x + s * (1.5 + wide * 3) + 4) % 8 + 8) % 8 - 4, 2.4 + y * r, z * r); c.rotation.set(ph + s, ph, 0); c.scale.setScalar(1.3 * r); });
      lb.scale.setScalar(popIn(t, .1) * (t < .52 ? 1 : 0)); l2.scale.setScalar(popIn(t, .55)); shoot(st, [0, 2.9, 6.4], [0, 2.4, 0]); } };
  };
  BUILD.bf_nerve = () => {
    const st = set('xray'), who = makePerson(kid); st.scene.add(who); const I = who.userData.inner;
    const ns = [-1, 1].flatMap(d => trig(d).map(pts => { const n = nerve(pts, .025); I.add(n); return n; }));
    const ps = ns.map((n, i) => { const p = pulse(n.userData.curve, 0xfff3a0, .18); p.userData.xr = false; I.add(p); return p; });
    const lb = hud(st, tag('TRIGEMINAL NERVE', 0xffd23f, '#3a2400', 2.9, .46), .6, 0, .7);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, squint: .5, brow: .7, smile: -.4 }); const on = seg(t, .2, .35);
      ns.forEach(n => n.material.emissiveIntensity = .5 + on * 2 + Math.sin(s * 10) * .5 * on); ps.forEach((p, i) => p.at(on > 0 ? 1 - frac(s * 1.1 + i * .17) : -1)); lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.7, 0], 3.2, .05); } };
  };
  BUILD.bf_forehead = () => {
    const st = set('warm'), who = makePerson(kid); st.scene.add(who); const g = sprite(0xff3b3b, 1.0, 0); g.position.set(0, 3.0, .6); who.add(g);
    const q = hud(st, tag('?!', 0xffd23f, '#3a2400', .9, .62), .5, .38, .22);
    return { ...st, update(t, s) { const k = seg(t, .1, .3); who.pose({ s, handR: reach('forehead', k), handL: reach('forehead', k * .8, -1), squint: .8, brow: .9, mouth: .3 + Math.sin(s * 6) * .1, smile: -.6, headNod: .1 });
      g.material.opacity = k * (.6 + .4 * Math.sin(s * 9)); q.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.8, 0], 4.2, .1); } };
  };
  BUILD.bf_fix = () => {
    const st = set('xray'), who = makePerson(kid); st.scene.add(who); const { palate, tongue } = mouthInside(who);
    const warm = sprite(0xffa040, .9, 0); warm.position.set(0, 2.48, .35); who.add(warm); const ok = hud(st, check(true), .55, .4, .2);
    const lb = hud(st, tag('TONGUE UP', 0xff6f86, '#ffffff', 1.9, .48), .55, -.1, .45);
    return { ...st, update(t, s) { who.xray(1); who.pose({ s, smile: .3 }); const up = ease(seg(t, .15, .4)); tongue.position.y = 2.4 + up * .06; tongue.scale.set(1.1, .4 + up * .12, 1.4);
      const w = seg(t, .4, .8); warm.material.opacity = w * .9; palate.material.color.setHex(w > .4 ? 0xff9fb0 : 0xa8e6ff); lb.scale.setScalar(popIn(t, .2)); ok.scale.setScalar(popIn(t, .7)); shoot(st, [2.0, 2.75, 1.8], [0, 2.5, .3]); } };
  };
}
