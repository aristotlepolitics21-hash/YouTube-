// Sets for Body Shorts episode 7: What Actually Causes Hiccups.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, makeDoctor, reach, hud, shoot, orbit, tube, flow, lungs, burger, sodaCan, glass, check, counter, soundWaves } = B;
  const guy = { skin: 0xffd9bd, shirt: 0x9b7bff, hair: 0xd9a441, eye: 0x3b6fb0 };
  const MUS = 0xe2475a, AIR = 0x7fe3ff;
  // the hiccup jolt: a sharp up-bump of the body at each time in `at` (seconds)
  const jolt = (s, at) => at.reduce((a, x) => a + (s > x && s < x + .35 ? Math.sin((s - x) / .35 * Math.PI) * Math.exp(-(s - x) * 6) : 0), 0);
  function diaphragm() { return M(new THREE.SphereGeometry(.62, 48, 20, 0, Math.PI * 2, 0, Math.PI * .42), plastic(MUS, { roughness: .45, side: THREE.DoubleSide }), { scale: [1, .55, .85] }); }
  // vocal cords: two pink folds that slide shut (k=1 closed)
  function cords() { const g = new THREE.Group(), m = plastic(0xff8fa3, { roughness: .35 }); const f = [-1, 1].map(d => { const c = M(new THREE.CapsuleGeometry(.12, .6, 8, 16), m, { rot: [Math.PI / 2, 0, 0] }); g.add(c); return c; });
    g.add(M(new THREE.TorusGeometry(.55, .1, 12, 40), plastic(0xe2a0a8), { rot: [Math.PI / 2, 0, 0], scale: [1, 1.2, 1] })); g.set = k => f.forEach((c, i) => { c.position.x = (i ? 1 : -1) * lerp(.36, .1, k); c.rotation.z = (i ? -1 : 1) * lerp(.35, 0, k); }); g.set(0); return g; }
  const hicTag = (st, x, y) => { const p = tag('HIC!', 0xffd23f, '#3a2400', 1.2, .5); p.position.set(x, y, .6); st.scene.add(p); return p; };

  BUILD.hc_hook = (p) => {
    const st = set('warm'), who = makePerson(guy); st.scene.add(who); const ts = hud(st, titleSigns(p.top, p.bottom, 0x9b7bff), .66, 0, .86);
    const hs = [hicTag(st, 1.0, 3.3), hicTag(st, -1.0, 3.0)], at = [.8, 2.0];
    return { ...st, update(t, s) { const j = jolt(s, at); who.position.y = j * .18; who.pose({ s, wide: j * 1.5, mouth: j * .5, smile: .2 - j, headNod: -j * .2, handR: reach('chest', seg(t, .5, .7)) });
      hs.forEach((h, i) => { const u = s - at[i]; h.scale.setScalar(u > 0 && u < .9 ? Math.min(1, pop(u * 1.5)) * .7 : 0); h.position.y = 3.1 + i * -.3 + Math.max(0, u) * .3; }); ts.update(t, s); orbit(st, s, [0, 2.6, 0], 5.0, .15); } };
  };
  BUILD.hc_diaphragm = () => {
    const st = set('xray'), who = makePerson(guy); st.scene.add(who); const I = who.userData.inner, lu = lungs(.9); lu.position.set(0, 1.78, 0); I.add(lu);
    const di = diaphragm(); di.position.set(0, 1.3, 0); I.add(di); const lb = hud(st, tag('DIAPHRAGM', MUS, '#ffffff', 1.9, .5), .6, 0, .45);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, smile: .4 }); const br = Math.sin(s * 2.2) * .5 + .5; di.position.y = 1.32 - br * .14; di.scale.set(1, .55 - br * .2, .85); lu.scale.setScalar(.9 * (1 + br * .1));
      lb.scale.setScalar(popIn(t, .3)); shoot(st, [1.0, 2.2, 4.4], [0, 1.65, 0]); } };
  };
  BUILD.hc_irritate = () => {
    const st = set('lilac'), bg = burger(), can = sodaCan(); bg.scale.setScalar(1.6); can.scale.setScalar(1.6); bg.position.set(-1.0, .3, 0); can.position.set(1.0, 0, 0); st.scene.add(bg, can);
    const fizz = new THREE.Group(); for (let i = 0; i < 12; i++) fizz.add(M(SPH(.05, 10, 8), plastic(0xffffff, { transparent: true, opacity: .8 }), { shadow: false })); fizz.position.set(1.0, 1.2, 0); st.scene.add(fizz);
    const di = diaphragm(); di.position.set(0, 2.9, 0); di.scale.setScalar(1.5); st.scene.add(di); const lb = hud(st, tag('SPASM!', MUS, '#ffffff', 1.6, .55), .62, 0, .4);
    return { ...st, update(t, s) { bg.rotation.y = s * .6; can.rotation.y = -s * .4; bg.scale.setScalar(1.6 * popIn(t, .05)); can.scale.setScalar(1.6 * popIn(t, .2)); fizz.children.forEach((f, i) => { const u = frac(s * .8 + i / 12); f.position.set(Math.sin(i * 2.4) * .25, u * 1.2, Math.cos(i * 1.9) * .2); });
      const sp = t > .55 ? Math.sin(s * 30) * Math.exp(-((t - .55) * 8) % 3) : 0; di.position.y = 2.9 + sp * .12; di.scale.set(1.5, 1.5 * (.55 + sp * .2), 1.5 * .85); lb.scale.setScalar(popIn(t, .55)); shoot(st, [0, 2.4, 7.0], [0, 1.8, 0]); } };
  };
  BUILD.hc_snap = () => {
    const st = set('flesh'), pipe = M(new THREE.CylinderGeometry(1.0, 1.0, 5, 48, 1, true, Math.PI * .5, Math.PI), plastic(0xff9fb0, { side: THREE.DoubleSide, roughness: .4 }), { pos: [0, 2.4, 0] }); st.scene.add(pipe);
    const vc = cords(); vc.scale.setScalar(1.7); vc.position.set(0, 2.4, 0); vc.rotation.x = .35; st.scene.add(vc);
    const cur = new THREE.CatmullRomCurve3([V(0, 5, .2), V(0, 3.4, .2), V(0, 2.4, .2), V(0, 1.2, .2), V(0, -.2, .2)]); const fl = flow(cur, 22, AIR, .08, .9, true); st.scene.add(fl);
    const l1 = hud(st, tag('AIR IN', AIR, '#0b2a40', 1.5, .46), .6, -.25, .35), l2 = hud(st, tag('SNAP SHUT', 0xff4a5c, '#ffffff', 2.0, .5), .6, .2, .45);
    const flash = sprite(0xffffff, 2.5, 0); flash.position.set(0, 2.5, .6); st.scene.add(flash);
    return { ...st, update(t, s) { const at = .55, shut = seg(t, at, at + .05); vc.set(shut); fl.update(s, t < at ? 1 : Math.max(0, 1 - (t - at) * 8), 1); flash.material.opacity = t > at ? Math.max(0, 1 - (t - at) * 5) * .8 : 0;
      l1.scale.setScalar(popIn(t, .08) * (t < at ? 1 : 0)); l2.scale.setScalar(popIn(t, at)); const sh = flash.material.opacity * .12; shoot(st, [Math.sin(s * 50) * sh, 3.6, 5.4], [0, 2.3, 0]); } };
  };
  BUILD.hc_sound = () => {
    const st = set('flesh'), vc = cords(); vc.scale.setScalar(2.8); vc.position.set(0, 2.4, 0); vc.rotation.x = .9; st.scene.add(vc);
    const hic = hud(st, tag('HIC!', 0xffd23f, '#3a2400', 1.6, .7), .58, 0, .5), sw = soundWaves(0xffffff); sw.position.set(0, 3.2, .5); sw.scale.setScalar(1.6); st.scene.add(sw); const fl = sprite(0xffffff, 3, 0); fl.position.set(0, 2.6, .8); st.scene.add(fl);
    return { ...st, update(t, s) { const at = .25, k = t > at ? 1 : ease(seg(t, 0, at)) * .3; vc.set(t > at ? 1 : 0); fl.material.opacity = t > at ? Math.max(0, 1 - (t - at) * 5) * .8 : 0;
      hic.scale.setScalar(popIn(t, at)); sw.update(s, t > at ? 1 : 0); const sh = fl.material.opacity * .15; shoot(st, [Math.sin(s * 50) * sh, 4.6, 3.6], [0, 2.4, 0]); } };
  };
  BUILD.hc_record = () => {
    const st = set('clinic'), old = makePerson({ skin: 0xf2c7a5, shirt: 0x8a6a4a, hair: 0xe8e8ee, pants: 0x4a3a2a }); st.scene.add(old);
    const yrs = hud(st, counter(2.4, .72, k => Math.round(k * 68) + ' YEARS', '#1d2442'), .62, 0, .62); yrs.userData.w = 2.4; const nm = hud(st, tag('CHARLES OSBORNE', 0x9b7bff, '#ffffff', 2.8, .44), .44, 0, .66);
    const hs = [hicTag(st, 1.0, 3.2)];
    return { ...st, update(t, s) { const j = jolt(s % 1.6, [.5]); old.position.y = j * .15; old.pose({ s, wide: j * 1.2, smile: .1, brow: .4, mouth: j * .4, headNod: -j * .15 });
      hs[0].scale.setScalar(j > .05 ? .7 : 0); yrs.set(ease(seg(t, .3, .95))); yrs.scale.setScalar(popIn(t, .25)); nm.scale.setScalar(popIn(t, .1)); orbit(st, s, [0, 2.4, 0], 5.6, .2); } };
  };
  BUILD.hc_fix = () => {
    const st = set('mint'), who = makePerson(guy); st.scene.add(who); const gl = glass(.75); st.scene.add(gl); const ok = hud(st, check(true), .55, .42, .2);
    const l1 = hud(st, tag('HOLD BREATH', 0xffffff, '#1d2442', 2.2, .44), .62, -.1, .5), l2 = hud(st, tag('SIP COLD WATER', AIR, '#0b2a40', 2.5, .44), .5, -.05, .55);
    return { ...st, update(t, s) { const hold = seg(t, .05, .15) * (1 - seg(t, .45, .5)), sip = seg(t, .5, .65); who.pose({ s, puff: hold * .8, flush: hold * .4, squint: hold * .3, smile: t > .8 ? .9 : .2, handL: reach([.15, 2.3, .72], sip, -1), poleL: [-1, -.5, -.2] });
      const hp = reach([.15, 2.3, .72], sip, -1); gl.position.copy(hp).add(V(0, -.3, .1)); gl.scale.setScalar(.6); l1.scale.setScalar(popIn(t, .08)); l2.scale.setScalar(popIn(t, .5)); ok.scale.setScalar(popIn(t, .8)); orbit(st, s, [0, 2.6, 0], 4.8, .15); } };
  };
}
