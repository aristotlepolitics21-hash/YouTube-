// Sets for Body Shorts episode 10: What a Mosquito Bite Really Does.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, insect, skinSection, vessel, flow, check, counter, skinM, link } = B;
  const guy = { skin: 0xf2c7a5, shirt: 0xff7a59, hair: 0x2a1a12 };
  const SKIN = 0xf2c7a5;
  const bigArm = () => M(new THREE.CapsuleGeometry(1.0, 6, 16, 48), skinM(SKIN), { rot: [0, 0, Math.PI / 2], pos: [0, 1.4, 0] });
  // six stylets: a bundle that enters the skin from above and fans out
  function stylets() { const g = new THREE.Group(), cols = [0x3a3020, 0x3a3020, 0x6a5040, 0x6a5040, 0xd8283c, 0x5cc46a];
    const ms = cols.map(c => { const m = M(new THREE.CylinderGeometry(.035, .02, 1, 8), plastic(c, { roughness: .4 })); g.add(m); return m; });
    g.set = (depth, fan, s, reachV = 0) => ms.forEach((m, i) => { const a = (i - 2.5) * .22 * fan, saw = i < 2 ? Math.sin(s * 14 + i * Math.PI) * .12 : 0; const tip = V(Math.sin(a) * depth + (i === 4 ? reachV * .8 : 0), 4.4 - depth - saw + (i === 4 ? -reachV * .5 : 0), 0);
      link(m, V(0, 5.2, 0), tip, 1); }); return g; }

  BUILD.mq_hook = (p) => {
    const st = set('mint'), arm = bigArm(); st.scene.add(arm); const mq = insect('mosquito'); mq.scale.setScalar(1.6); st.scene.add(mq);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0x5a5040), .66, 0, .86);
    return { ...st, update(t, s) { const land = ease(seg(t, .05, .5)); mq.position.set(lerp(2.5, .2, land), lerp(4.2, 2.95, land) + Math.sin(s * 6) * .05 * (1 - land), .2); mq.rotation.set(.3 * land, -1.2, 0); mq.flap(s);
      ts.update(t, s); orbit(st, s, [0, 2.4, 0], 8.0, .6); } };
  };
  BUILD.mq_female = () => {
    const st = set('lilac'), mq = insect('mosquito'); mq.scale.setScalar(2.2); mq.position.set(0, 2.6, 0); st.scene.add(mq);
    const eggs = G(...[0, 1, 2, 3, 4, 5, 6].map(i => M(SPH(.12, 16, 12), plastic(0xfff3d6), { pos: [(i % 4) * .26 - .4, Math.floor(i / 4) * .22, 0], scale: [1, 1.5, 1] }))); eggs.position.set(-.2, 1.0, 1.0); st.scene.add(eggs);
    const lb = hud(st, tag('ONLY FEMALES BITE', 0xff6fb1, '#ffffff', 3.0, .48), .62, 0, .72), l2 = hud(st, tag('FOR HER EGGS', 0xfff3d6, '#3a2400', 2.2, .44), -.2, 0, .5);
    return { ...st, update(t, s) { mq.flap(s); mq.rotation.set(.2, s * .5 + .4, 0); mq.position.y = 2.6 + Math.sin(s * 2) * .08; lb.scale.setScalar(popIn(t, .05)); eggs.scale.setScalar(popIn(t, .45)); l2.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 2.2, 0], 6.4, .3); } };
  };
  BUILD.mq_needles = () => {
    const st = set('flesh'), sk = skinSection({ top: 4.4, skin: SKIN }); st.scene.add(sk); const sy = stylets(); st.scene.add(sy);
    const head = M(SPH(.35, 24, 16), plastic(0x3a3020), { pos: [0, 5.5, 0] }); st.scene.add(head);
    const lb = hud(st, tag('6 NEEDLES', 0xffffff, '#1d2442', 1.9, .5), .62, 0, .45), l2 = hud(st, tag('2 SAWS', 0xff4a5c, '#ffffff', 1.5, .46), .48, -.25, .35);
    return { ...st, update(t, s) { const d = ease(seg(t, .05, .5)), f = ease(seg(t, .3, .6)); sy.set(.3 + d * 1.6, f, s); lb.scale.setScalar(popIn(t, .2)); l2.scale.setScalar(popIn(t, .55)); shoot(st, [.4, 4.6, 7.0], [0, 3.6, 0]); } };
  };
  BUILD.mq_vessel = () => {
    const st = set('flesh'), sk = skinSection({ top: 4.4, skin: SKIN }); st.scene.add(sk); const sy = stylets(); st.scene.add(sy);
    const vs = vessel([[-5, 2.4, .3], [0, 2.3, .3], [5, 2.4, .3]], .32); st.scene.add(vs);
    const spit = flow(new THREE.CatmullRomCurve3([V(0, 5.2, 0), V(.35, 3.9, .05), V(.6, 3.0, .1)]), 10, 0x7ad94a, .06, .8, true); st.scene.add(spit);
    const blood = flow(new THREE.CatmullRomCurve3([V(.75, 2.5, .2), V(.4, 3.6, .05), V(0, 5.2, 0)]), 10, 0xd8283c, .06, .8); st.scene.add(blood);
    const lb = hud(st, tag('ANTI-CLOT SPIT', 0x7ad94a, '#14320a', 2.6, .46), .62, 0, .6);
    return { ...st, update(t, s) { sy.set(1.9, 1, s, ease(seg(t, .05, .35))); spit.update(s, seg(t, .35, .45)); blood.update(s, seg(t, .55, .65)); lb.scale.setScalar(popIn(t, .4)); shoot(st, [.4, 4.0, 7.4], [0, 3.2, 0]); } };
  };
  BUILD.mq_drink = () => {
    const st = set('mint'), arm = bigArm(); st.scene.add(arm); const mq = insect('mosquito'); mq.scale.setScalar(2.0); mq.position.set(0, 2.85, 0); mq.rotation.set(.35, -1.4, 0); st.scene.add(mq);
    const ab = mq.userData.abdomen, am = ab.children[0].material, base = new THREE.Color(0x5a5040), red = new THREE.Color(0xd8283c);
    const ct = hud(st, counter(1.6, .7, k => '×' + (1 + Math.round(k * 2)), '#d42f3f'), .6, 0, .4); ct.userData.w = 1.6;
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .85)); ab.scale.set(1 + k * 1.6, 1 + k * 1.6, 1 + k * .5); am.color.copy(base).lerp(red, k); am.transparent = true; am.opacity = .9; ct.set(k); ct.scale.setScalar(popIn(t, .05)); orbit(st, s, [0, 2.7, 0], 7.4, .5); } };
  };
  BUILD.mq_itch = () => {
    const st = set('lilac'), arm = bigArm(); st.scene.add(arm); const bump = M(SPH(.5, 32, 24), skinM(0xf08a7a), { pos: [0, 2.4, 0], scale: [1, 0, 1] }); st.scene.add(bump);
    const R = rng(6), hs = [0, 1, 2, 3, 4, 5, 6, 7].map(() => { const h = sprite(0xffd23f, .3, .9); st.scene.add(h); return h; }), P = hs.map(() => [R() * 6.28, R()]);
    const lb = hud(st, tag('HISTAMINE', 0xffd23f, '#3a2400', 1.9, .5), .6, 0, .45), l2 = hud(st, tag('ITCH!', 0xff4a5c, '#ffffff', 1.3, .5), .45, .3, .3);
    return { ...st, update(t, s) { const k = ease(seg(t, .05, .5)); bump.scale.set(1 + k * .4, .05 + k * .55, 1 + k * .4); hs.forEach((h, i) => { const [a, r] = P[i], u = frac(s * .5 + r); h.position.set(Math.cos(a + s) * (.6 + u), 2.5 + u * 1.2, Math.sin(a + s) * .6 + .4); h.material.opacity = Math.sin(u * Math.PI) * seg(t, .2, .35); });
      lb.scale.setScalar(popIn(t, .3)); l2.scale.setScalar(popIn(t, .6)); shoot(st, [0, 4.0, 4.6], [0, 2.3, 0]); } };
  };
  BUILD.mq_scratch = () => {
    const st = set('warm'), who = makePerson(guy); st.scene.add(who); const bump = M(SPH(.12, 20, 14), skinM(0xf08a7a), {}); st.scene.add(bump);
    const no = hud(st, check(false), .55, .42, .2), lb = hud(st, tag('ITCHIER', 0xff4a5c, '#ffffff', 1.7, .5), .58, -.08, .42);
    return { ...st, update(t, s) { const sc = Math.sin(s * 14) * .08; const hl = reach([.35, 1.55, .55], 1, -1); who.pose({ s, handL: hl, poleL: [-1, -.5, -.3], handR: V(-.28 + sc, 1.62, .7), poleR: [1, -.6, .2], squint: .5, brow: .6, smile: -.3, look: [-.3, -.6] });
      bump.position.copy(hl).add(V(.12, .18, .05)); bump.scale.setScalar(1 + seg(t, .2, .8) * .6); lb.scale.setScalar(popIn(t, .3)); no.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 2.0, 0], 5.0, .3); } };
  };
}
