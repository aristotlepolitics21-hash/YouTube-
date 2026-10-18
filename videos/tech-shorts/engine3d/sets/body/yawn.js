// Sets for Body Shorts episode 16: Why Yawning Is Contagious.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, lungs, brain, tube, flow, thermometer, animal, sweat, counter } = B;
  const guy = { skin: 0xd9a07a, shirt: 0x5b8cff, hair: 0x2a1a12, eye: 0x3a2a1a };
  const PEOPLE = [{ skin: 0xf2c7a5, shirt: 0xff7a59, hair: 0xb5652b }, { skin: 0x7a4a30, shirt: 0x2fbf71, hair: 0x15100c, hairStyle: 'long' }, { skin: 0xffd9bd, shirt: 0x9b7bff, hair: 0xd9a441 }];
  // a yawn envelope: rises, holds, falls over [a, b] (fractions of the line)
  const yk = (t, a, b) => Math.sin(Math.PI * clamp((t - a) / (b - a)));
  const yawn = k => ({ mouth: k, mouthW: k * .25, squint: k * .9, headNod: -k * .28, brow: k * .4, smile: .3 });
  const AIR = 0x7fe3ff;

  BUILD.yw_hook = (p) => {
    const st = set('lilac'), who = makePerson(guy); st.scene.add(who); const ts = hud(st, titleSigns(p.top, p.bottom, 0x5b8cff), .66, 0, .86);
    return { ...st, update(t, s) { const k = yk(t, .1, 1.0); who.pose({ s, ...yawn(k), handR: reach('up', k * 1.1), handL: reach('up', k * 1.1, -1) }); ts.update(t, s); orbit(st, s, [0, 2.6, 0], 5.6, .15); } };
  };
  BUILD.yw_what = () => {
    const st = set('xray'), who = makePerson(guy); st.scene.add(who); const I = who.userData.inner, lu = lungs(.95); lu.position.set(0, 1.78, 0); I.add(lu);
    const aw = tube([[0, 2.42, .6], [0, 2.3, .1], [0, 2.0, 0], [0, 1.95, 0]], .05, glowM(AIR, .6)); I.add(aw); const fl = flow(aw.userData.curve, 12, AIR, .05, 1.0, true); fl.userData.xr = false; I.add(fl);
    const l1 = hud(st, tag('JAW STRETCH', 0xffffff, '#1d2442', 2.0, .44), .62, -.2, .45), l2 = hud(st, tag('DEEP BREATH IN', AIR, '#0b2a40', 2.4, .44), .5, .15, .52);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .15))); const k = yk(t, .05, .95), inh = seg(t, .1, .6); who.pose({ s, ...yawn(k) }); lu.scale.setScalar(.95 * (1 + inh * .25 * (1 - seg(t, .8, .95)))); fl.update(s, k, inh < 1 ? 1 : -1);
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .3)); shoot(st, [1.0, 2.4, 4.4], [0, 2.1, 0]); } };
  };
  BUILD.yw_cool = () => {
    const st = set('xray'), who = makePerson(guy); st.scene.add(who); const I = who.userData.inner, br = brain(.95); br.position.set(0, 2.82, -.06); I.add(br);
    const cur = new THREE.CatmullRomCurve3([V(0, 2.42, .9), V(0, 2.42, .5), V(0, 2.55, .25), V(0, 2.75, .05)]); const fl = flow(cur, 14, AIR, .05, .8, true); fl.userData.xr = false; I.add(fl);
    const bm = br.children[0].material, warm = new THREE.Color(0xff8a8a), cool = new THREE.Color(0xa8d8ff);
    const l1 = hud(st, tag('ONE IDEA', 0xffd23f, '#3a2400', 1.5, .44), .64, 0, .32), l2 = hud(st, tag('COOLS YOUR BRAIN', AIR, '#0b2a40', 2.8, .46), .5, 0, .64);
    return { ...st, update(t, s) { who.xray(1); const k = yk(t, .0, .7); who.pose({ s, ...yawn(k) }); fl.update(s, k); const c = ease(seg(t, .2, .8)); [br.children[0], br.children[1]].forEach(h => h.material.color.copy(warm).lerp(cool, c));
      l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .3)); shoot(st, [1.6, 2.9, 3.4], [0, 2.65, 0]); } };
  };
  BUILD.yw_heat = () => {
    const st = set('warm', { top: '#ffd07a', bottom: '#ff9a6a' }), who = makePerson(guy); who.position.x = -.4; st.scene.add(who); const sun = G(M(SPH(.6, 32, 24), glowM(0xffc21a, 2.2), { shadow: false }), sprite(0xffd060, 3, .8)); sun.position.set(1.3, 4.6, -1); st.scene.add(sun);
    const th = thermometer(.9); th.position.set(1.2, .1, .4); th.scale.setScalar(1.3); st.scene.add(th); const sw = sweat(8); sw.position.set(0, 2.6, 0); who.add(sw);
    const lb = hud(st, tag('FEWER YAWNS', 0xff4a5c, '#ffffff', 2.2, .5), .6, 0, .5);
    return { ...st, update(t, s) { who.pose({ s, smile: -.2, squint: .3, flush: .4, mouth: .1 }); sun.rotation.z = s * .3; sun.children[1].scale.setScalar(3 + Math.sin(s * 3) * .3); th.set(.6 + seg(t, .05, .4) * .35); sw.update(s, 1); lb.scale.setScalar(popIn(t, .45)); orbit(st, s, [.2, 2.4, 0], 6.4, .3); } };
  };
  BUILD.yw_catch = () => {
    const st = set('mint'), ps = PEOPLE.map((o, i) => { const p = makePerson(o); p.position.set((i - 1) * 1.45, 0, -Math.abs(i - 1) * .3); p.rotation.y = (1 - i) * .2; st.scene.add(p); return p; });
    const lb = hud(st, tag('CONTAGIOUS', 0x2fbf71, '#ffffff', 2.2, .55), .62, 0, .5);
    return { ...st, update(t, s) { ps.forEach((p, i) => { const k = yk(t, .05 + i * .25, .5 + i * .25); p.pose({ s: s + i, ...yawn(k), seed: i * .3 }); }); lb.scale.setScalar(popIn(t, .4)); orbit(st, s, [0, 2.0, 0], 10.4, .3); } };
  };
  BUILD.yw_dog = () => {
    const st = set('lilac'), who = makePerson(guy); who.position.set(-.8, 0, 0); who.rotation.y = .4; st.scene.add(who); const dog = animal('dog'); dog.scale.setScalar(1.3); dog.position.set(1.0, 0, .3); dog.rotation.y = -.6; st.scene.add(dog);
    const lb = hud(st, tag('DOGS TOO!', 0xd9a066, '#ffffff', 1.9, .55), .6, 0, .45);
    return { ...st, update(t, s) { const k1 = yk(t, .05, .5), k2 = yk(t, .45, .95); who.pose({ s, ...yawn(k1), handR: reach('mouth', k1 * .9) }); dog.pose({ s, mouth: k2, headNod: -k2 * .4, wag: 1 - k2 }); lb.scale.setScalar(popIn(t, .5)); orbit(st, s, [.1, 1.9, 0], 6.6, .3); } };
  };
  BUILD.yw_you = () => {
    const st = set('warm'), who = makePerson(guy); st.scene.add(who); const lb = hud(st, tag('DID YOU YAWN?', 0x5b8cff, '#ffffff', 2.5, .55), .6, 0, .62);
    return { ...st, update(t, s) { const k = yk(t, .2, 1.0); who.pose({ s, ...yawn(k), handR: reach('mouth', k * .9) }); lb.scale.setScalar(popIn(t, .05)); orbit(st, s, [0, 2.7, 0], 4.2, .1); } };
  };
}
