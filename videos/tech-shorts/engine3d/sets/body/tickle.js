// Sets for Body Shorts episode 15: Why You Can't Tickle Yourself.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, glowM, sprite, makeBit, clamp, lerp, seg, ease, frac, pop, V } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, brain, bigHand, gauge, counter, pulse } = B;
  const kid = { skin: 0xf2c7a5, shirt: 0xff4fa3, hair: 0x2a1a12, eye: 0x5a3a22 };
  const pal = { skin: 0x7a4a30, shirt: 0x35c8ef, hair: 0x15100c, eye: 0x2a1a10 };
  const laugh = (s, k = 1) => ({ mouth: .7 * k + Math.abs(Math.sin(s * 14)) * .2 * k, squint: .75 * k, smile: .9, headNod: -.15 * k + Math.sin(s * 14) * .04 * k, brow: .3 * k, bob: 1 + k * 2 });
  const wiggle = (s, tgt, side = 1) => V(side * (tgt[0] + Math.sin(s * 18) * .05), tgt[1] + Math.cos(s * 18) * .04, tgt[2]);
  function feather() { return G(M(new THREE.CylinderGeometry(.01, .01, .9, 6), plastic(0xffffff), { pos: [0, .45, 0] }), M(SPH(.2, 20, 14), matte(0xff8ad0, { roughness: 1 }), { pos: [0, .7, 0], scale: [.35, 1.4, .1] })); }

  BUILD.tk_hook = (p) => {
    const st = set('lilac'), who = makePerson(kid); st.scene.add(who); const ts = hud(st, titleSigns(p.top, p.bottom, 0xff4fa3), .66, 0, .86), meh = hud(st, tag('...NOTHING', 0xffffff, '#1d2442', 2.0, .5), -.1, .4, .42);
    return { ...st, update(t, s) { const k = seg(t, .1, .3); who.pose({ s, handR: k > 0 ? wiggle(s, [.38, 1.55, .5]).lerp(reach('rest', 0), 1 - ease(k)) : reach('rest', 0), handL: k > 0 ? wiggle(s + 1, [.38, 1.55, .5], -1).lerp(reach('rest', 0, -1), 1 - ease(k)) : reach('rest', 0, -1),
      poleR: [1, -.6, -.3], poleL: [-1, -.6, -.3], smile: lerp(.6, 0, seg(t, .45, .6)), brow: -seg(t, .5, .6) * .2, squint: seg(t, .5, .6) * .3 }); meh.scale.setScalar(popIn(t, .6)); ts.update(t, s); orbit(st, s, [0, 2.4, 0], 5.4, .2); } };
  };
  BUILD.tk_predict = () => {
    const st = set('xray'), who = makePerson(kid); st.scene.add(who); const br = brain(.95); br.position.set(0, 2.82, -.06); who.userData.inner.add(br);
    const bub = M(SPH(.55, 40, 28), plastic(0xffffff, { transparent: true, opacity: .25, roughness: .05, depthWrite: false }), { pos: [.9, 3.9, 0], shadow: false }); st.scene.add(bub);
    const small = [0, 1].map(i => { const b = M(SPH(.1 + i * .06, 20, 14), plastic(0xffffff, { transparent: true, opacity: .4 }), { pos: [.45 + i * .2, 3.35 + i * .2, 0], shadow: false }); st.scene.add(b); return b; });
    const h = bigHand({ skin: 0xf2c7a5 }); h.scale.setScalar(.32); h.position.set(.9, 3.65, 0); st.scene.add(h); const lb = hud(st, tag('PREDICTING', 0xff4fa3, '#ffffff', 2.0, .5), .62, -.15, .45);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .25))); who.pose({ s, smile: .4, look: [.6, .6] }); br.children[0].material.emissive = new THREE.Color(0xff4fa3); br.children.forEach(c => c.material && (c.material.emissiveIntensity = .2 + .2 * Math.sin(s * 5)));
      const k = popIn(t, .3); bub.scale.setScalar(k); small.forEach((b, i) => b.scale.setScalar(popIn(t, .2 + i * .05))); h.scale.setScalar(.32 * k); h.rotation.y = Math.sin(s * 2) * .3; h.curl(Math.max(0, Math.sin(s * 4)) * .4); lb.scale.setScalar(popIn(t, .45)); shoot(st, [.6, 3.3, 4.6], [.35, 3.1, 0]); } };
  };
  BUILD.tk_copy = () => {
    const st = set('xray'), br = brain(2.6); br.position.set(0, 2.6, 0); st.scene.add(br); const cb = br.children[2]; cb.material = glowM(0xffd23f, 0); cb.material.color = new THREE.Color(0xf07f98);
    const ghost = bigHand({ skin: 0xffd23f }); ghost.userData.mat.transparent = true; ghost.userData.mat.opacity = .6; ghost.scale.setScalar(.45); st.scene.add(ghost);
    const l1 = hud(st, tag('CEREBELLUM', 0xffd23f, '#3a2400', 2.0, .48), .62, 0, .5), l2 = hud(st, tag('COPY OF THE MOVE', 0xffffff, '#1d2442', 2.7, .44), -.25, 0, .62);
    return { ...st, update(t, s) { br.rotation.y = -.9 + Math.sin(s * .4) * .2; cb.material.emissiveIntensity = seg(t, .1, .3) * (1.5 + Math.sin(s * 8)); const f = ease(seg(t, .4, .9)); ghost.position.set(lerp(-.6, 1.6, f), lerp(1.8, 3.6, f), lerp(-.6, 1.4, f)); ghost.visible = t > .4; ghost.rotation.y = s;
      l1.scale.setScalar(popIn(t, .15)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [0, 3.0, 8.4], [0, 2.6, 0]); } };
  };
  BUILD.tk_mute = () => {
    const st = set('lilac'), who = makePerson(kid); st.scene.add(who); const g = hud(st, gauge('FEELING', '#ff4fa3'), .62, 0, .8), lb = hud(st, tag('TURNED DOWN', 0x9aa3bd, '#ffffff', 2.2, .48), .48, 0, .5);
    return { ...st, update(t, s) { const k = seg(t, .05, .2); who.pose({ s, handR: wiggle(s, [.38, 1.55, .5]).lerp(reach('rest', 0), 1 - ease(k)), poleR: [1, -.6, -.3], smile: .1, look: [0, -.5] }); const v = 1 - ease(seg(t, .2, .7)) * .85; g.set(v); g.scale.setScalar(popIn(t, .05)); lb.scale.setScalar(popIn(t, .6)); orbit(st, s, [0, 2.3, 0], 5.4, .2); } };
  };
  BUILD.tk_other = () => {
    const st = set('warm'), who = makePerson(kid); who.position.set(-.5, 0, .2); who.rotation.y = .3; st.scene.add(who); const fr = makePerson(pal); fr.position.set(.9, 0, -.2); fr.rotation.y = -.7; st.scene.add(fr);
    const g = hud(st, gauge('FEELING', '#ff4fa3'), .62, 0, .8), lb = hud(st, tag('SURPRISE!', 0xffd23f, '#3a2400', 1.8, .5), .48, 0, .42);
    return { ...st, update(t, s) { const k = seg(t, .05, .25), lk = seg(t, .25, .35); fr.pose({ s, handR: wiggle(s, [-.1, 1.6, .9]).lerp(reach('rest', 0), 1 - ease(k)), handL: wiggle(s + 1, [.6, 1.55, .9], -1).lerp(reach('rest', 0, -1), 1 - ease(k)), smile: .9, squint: .3 });
      who.pose({ s, ...laugh(s, lk), handR: reach('belly', lk), handL: reach('belly', lk, -1) }); who.position.y = Math.abs(Math.sin(s * 14)) * .05 * lk; g.set(lk); g.scale.setScalar(popIn(t, .05)); lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.2, 0], 6.4, .3); } };
  };
  BUILD.tk_robot = () => {
    const st = set('mint'), who = makePerson(kid); who.position.set(-.7, 0, 0); who.rotation.y = .4; st.scene.add(who); const bot = makeBit(); bot.scale.setScalar(.8); bot.position.set(1.0, 0, .3); bot.rotation.y = -.8; st.scene.add(bot);
    const fe = feather(); st.scene.add(fe); const d = hud(st, counter(2.0, .66, k => '+' + (k * .2).toFixed(1) + ' s DELAY', '#1d2442'), .62, 0, .6); d.userData.w = 2.0; const lb = hud(st, tag('1999 STUDY', 0x9b7bff, '#ffffff', 1.9, .44), .48, 0, .42);
    return { ...st, update(t, s) { who.pose({ s, smile: .5, handR: reach([.1, 1.9, .7], seg(t, .05, .2)), poleR: [1, -.5, -.3] }); bot.pose({ s, reachL: .8, lookY: .3 }); fe.position.set(.25 + Math.sin(s * 10) * .06, 1.35, .7); fe.rotation.set(0, 0, 1.2 + Math.sin(s * 10) * .2);
      d.set(ease(seg(t, .2, .6))); d.scale.setScalar(popIn(t, .15)); lb.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 2.0, 0], 6.4, .3); } };
  };
  BUILD.tk_works = () => {
    const st = set('warm'), who = makePerson(kid); who.position.set(-.5, 0, 0); who.rotation.y = .3; st.scene.add(who); const bot = makeBit(); bot.scale.setScalar(.8); bot.position.set(1.1, 0, .3); bot.rotation.y = -.8; st.scene.add(bot);
    const fe = feather(); st.scene.add(fe); const lb = hud(st, tag('TICKLISH!', 0xff4fa3, '#ffffff', 2.0, .6), .6, 0, .5);
    return { ...st, update(t, s) { const lk = seg(t, .15, .3); who.pose({ s, ...laugh(s, lk), handR: reach('belly', lk), handL: reach('belly', lk, -1) }); who.position.y = Math.abs(Math.sin(s * 14)) * .05 * lk; bot.pose({ s, reachL: .8, happy: 1, lookY: .3 });
      fe.position.set(.25 + Math.sin(s * 12) * .08, 1.45, .7); fe.rotation.set(0, 0, 1.2 + Math.sin(s * 12) * .25); lb.scale.setScalar(popIn(t, .25)); lb.rotation.z = Math.sin(s * 10) * .05; orbit(st, s, [0, 2.1, 0], 6.2, .3); } };
  };
}
