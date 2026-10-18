// Sets for Body Shorts episode 19: Why Hitting Your Funny Bone Hurts.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, textSign, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, nerve, pulse, bigHand, table, skinM } = B;
  const girl = { skin: 0xe8b48f, shirt: 0xff7a59, hair: 0x6b4a2e, hairStyle: 'long', eye: 0x3a2a1a };
  const NV = 0xffd23f, BONE = 0xf3ead6;
  function sparks(n = 10, seed = 2) { const R = rng(seed), g = new THREE.Group(), P = []; for (let i = 0; i < n; i++) { g.add(sprite(0xfff3a0, .25, 0)); P.push([R() * 6.28, R() * 6.28, .5 + R()]); }
    g.update = (s, k) => g.children.forEach((c, i) => { const [a, b, sp] = P[i], u = frac(s * 2 * sp + i * .13); c.position.set(Math.cos(a) * Math.sin(b) * u * .8, Math.cos(b) * u * .8, Math.sin(a) * Math.sin(b) * u * .8); c.material.opacity = k * (1 - u); }); return g; }
  // the ulnar nerve riding inside the right arm (follows any arm pose), plus a short run up to the neck
  function armNerve(who) { const sh = who.userData.arms[1], el = sh.userData.el; const a = nerve([[-.06, 0, .06], [-.09, -.25, .08], [-.1, -.5, .04]], .035), b = nerve([[-.1, 0, .04], [-.08, -.3, .06], [-.06, -.58, .05]], .035), n = nerve([[.1, 2.15, 0], [.35, 2.05, 0], [.56, 1.95, .06]], .035);
    sh.add(a); el.add(b); who.add(n); return [n, a, b]; }
  // the end of the upper-arm bone at the elbow, with the groove and the nerve lying in it
  function elbowModel() { const g = new THREE.Group(), bm = plastic(BONE, { roughness: .5 }); g.add(M(new THREE.CylinderGeometry(.45, .5, 4, 32), bm, { pos: [0, 2.6, 0] }), M(SPH(.75, 40, 28), bm, { pos: [-.45, .55, 0], scale: [1, .8, 1] }), M(SPH(.65, 40, 28), bm, { pos: [.55, .6, 0], scale: [1, .8, 1] }));
    const nv = nerve([[0, 4.5, .55], [-.05, 2.0, .6], [0, .9, .55], [.05, .1, .7], [.1, -1.2, .7]], .14); g.add(nv);
    const skin = M(new THREE.CylinderGeometry(1.05, 1.15, 6.5, 40, 1, true), skinM(0xe8b48f), { pos: [0, 1.6, 0] }); skin.material.transparent = true; skin.material.opacity = .25; skin.material.side = THREE.DoubleSide; skin.material.depthWrite = false; g.add(skin); g.userData.nerve = nv; return g; }
  const funnyLabel = () => tag('HUMERUS', 0xffffff, '#1d2442', 2.0, .5);

  BUILD.fb_hook = (p) => {
    const st = set('warm'), tb = table(2.4, 1.4); tb.position.set(1.0, -.1, .2); st.scene.add(tb); const who = makePerson(girl); st.scene.add(who); const sp = sparks(14); st.scene.add(sp); const ouch = tag('ZAP!', NV, '#3a2400', 1.3, .5); st.scene.add(ouch);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0xff7a59), .66, 0, .86);
    return { ...st, update(t, s) { const walk = 1 - seg(t, .3, .35), hit = seg(t, .32, .4); who.position.x = lerp(-1.6, -.05, ease(seg(t, 0, .34))); who.pose({ s, walk: walk > 0 ? s * 9 : undefined, wide: hit, brow: hit * .9, mouth: hit * .6, smile: lerp(.6, -.6, hit), squint: seg(t, .5, .6), handL: reach([-.2, 1.9, .5], seg(t, .4, .55), -1) });
      sp.position.set(who.position.x + .62, 1.45, .2); sp.update(s, t > .32 ? 1 - seg(t, .55, .8) : 0); ouch.position.set(who.position.x + 1.0, 2.3, .6); ouch.scale.setScalar(popIn(t, .34) * .8); ts.update(t, s); orbit(st, s, [0, 2.2, 0], 6.4, .4); } };
  };
  BUILD.fb_nerve = () => {
    const st = set('xray'), who = makePerson(girl); who.rotation.y = -.4; st.scene.add(who); const ns = armNerve(who); const lb = hud(st, tag('ULNAR NERVE', NV, '#3a2400', 2.1, .5), .6, 0, .5), nb = hud(st, tag('NOT A BONE', 0xff4a5c, '#ffffff', 1.9, .44), .46, 0, .45);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, handR: reach([.9, 1.8, .4], 1), poleR: [.5, -.8, -.6], smile: .3 }); ns.forEach(n => n.material.emissiveIntensity = 1.4 + Math.sin(s * 5) * .5); lb.scale.setScalar(popIn(t, .2)); nb.scale.setScalar(popIn(t, .45)); shoot(st, [1.8, 2.4, 5.6], [.3, 1.9, 0]); } };
  };
  BUILD.fb_path = () => {
    const st = set('xray'), who = makePerson(girl); who.rotation.y = -.4; st.scene.add(who); who.xray(1); const ns = armNerve(who); const ps = ns.map(n => { const p = pulse(n.userData.curve, 0xffffff, .15); n.add(p); p.scale.setScalar(1); return p; });
    const l1 = hud(st, tag('NECK', 0xffffff, '#1d2442', 1.2, .42), .55, -.3, .28), l2 = hud(st, tag('LITTLE FINGER', NV, '#3a2400', 2.2, .42), -.25, .25, .48);
    return { ...st, update(t, s) { who.xray(1); who.pose({ s, handR: reach([.9, 1.8, .4], 1), poleR: [.5, -.8, -.6], smile: .3 }); const u = frac(s * .5) * 3; ps.forEach((p, i) => { const k = u - i; p.visible = k > 0 && k < 1; if (p.visible) p.position.copy(ns[i].userData.curve.getPoint(k)); });
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [1.8, 2.4, 5.6], [.3, 1.9, 0]); } };
  };
  BUILD.fb_groove = () => {
    const st = set('flesh'), el = elbowModel(); el.position.set(0, 0, 0); el.rotation.set(.2, -.5, 0); st.scene.add(el); const lb = hud(st, tag('ALMOST NO PADDING', 0xffffff, '#1d2442', 3.0, .46), .62, 0, .7), nb = hud(st, tag('NERVE', NV, '#3a2400', 1.3, .44), -.2, -.35, .3);
    return { ...st, update(t, s) { el.rotation.y = -.5 + Math.sin(s * .5) * .25; el.userData.nerve.material.emissiveIntensity = 1.4 + Math.sin(s * 4) * .4; lb.scale.setScalar(popIn(t, .3)); nb.scale.setScalar(popIn(t, .1)); shoot(st, [0, 2.4, 10.0], [0, 1.6, 0]); } };
  };
  BUILD.fb_zap = () => {
    const st = set('flesh'), el = elbowModel(); el.rotation.set(.2, -.5, 0); st.scene.add(el); const edge = M(RB(4, .6, 2, .05), plastic(0xd8a878), {}); st.scene.add(edge); const sp = sparks(20, 5); sp.position.set(0, .9, .9); sp.scale.setScalar(2); st.scene.add(sp);
    const fl = sprite(0xffffff, 4, 0); fl.position.set(0, 1, 1.2); st.scene.add(fl); const lb = hud(st, tag('ZAP!', NV, '#3a2400', 1.4, .6), .6, 0, .4);
    return { ...st, update(t, s) { const at = .3, hitK = t > at ? 1 : 0, sw = ease(seg(t, .05, at)); edge.position.set(lerp(4, 1.4, sw) - (t > at ? Math.min(.5, (t - at) * 3) : 0), .9, 1.3); edge.rotation.z = .3;
      el.userData.nerve.material.emissiveIntensity = 1.4 + hitK * (2.5 + Math.sin(s * 40) * 2) * (1 - seg(t, .7, 1)); sp.update(s, hitK * (1 - seg(t, .7, 1))); fl.material.opacity = t > at ? Math.max(0, 1 - (t - at) * 5) * .8 : 0;
      lb.scale.setScalar(popIn(t, at)); lb.rotation.z = Math.sin(s * 30) * .06; const sh = fl.material.opacity * .2; shoot(st, [Math.sin(s * 50) * sh, 2.4, 10.0], [0, 1.6, 0]); } };
  };
  BUILD.fb_tingle = () => {
    const st = set('lilac'), h = bigHand({ skin: 0xe8b48f }); h.scale.setScalar(2.1); h.position.set(0, .4, 0); st.scene.add(h); const sps = [2, 3].map(i => { const s_ = sparks(10, i); h.userData.fingers[i].userData.b.add(s_); s_.position.y = .3; s_.scale.setScalar(.35); return s_; });
    const glows = [2, 3].map(i => { const g = sprite(NV, 1.3, 0); h.userData.fingers[i].userData.b.add(g); g.position.set(0, .2, .2); return g; }); const lb = hud(st, tag('RING + LITTLE FINGER', NV, '#3a2400', 3.2, .46), .62, 0, .74);
    return { ...st, update(t, s) { sps.forEach(x => x.update(s, 1)); glows.forEach((g, i) => g.material.opacity = .5 + .4 * Math.sin(s * 12 + i)); h.userData.fingers.forEach((f, i) => { f.userData.a.rotation.z = i > 1 ? Math.sin(s * 30 + i) * .04 : 0; }); lb.scale.setScalar(popIn(t, .2)); shoot(st, [.6, 3.2, 8.0], [0, 2.6, 0]); } };
  };
  BUILD.fb_name = () => {
    const st = set('mint'), bone = G(M(new THREE.CylinderGeometry(.22, .25, 3.0, 24), plastic(BONE), { rot: [0, 0, Math.PI / 2] }), ...[-1, 1].flatMap(d => [M(SPH(.36, 24, 16), plastic(BONE), { pos: [d * 1.6, .18, 0] }), M(SPH(.36, 24, 16), plastic(BONE), { pos: [d * 1.6, -.18, 0] })])); bone.position.set(0, 3.55, -.5); st.scene.add(bone);
    const who = makePerson(girl); who.scale.setScalar(.75); st.scene.add(who); const l1 = hud(st, funnyLabel(), .62, 0, .5), l2 = hud(st, tag('= HUMOROUS?', 0xffd23f, '#3a2400', 2.2, .5), .48, 0, .5);
    return { ...st, update(t, s) { bone.rotation.set(.2, s * .5, Math.sin(s) * .1); const lk = seg(t, .45, .55); who.pose({ s, mouth: .5 * lk + Math.abs(Math.sin(s * 12)) * .2 * lk, squint: .7 * lk, smile: .9, headNod: -.12 * lk }); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.2, 0], 6.6, .3); } };
  };
}
