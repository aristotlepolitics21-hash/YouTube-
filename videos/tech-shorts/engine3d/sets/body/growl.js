// Sets for Body Shorts episode 11: Why Your Stomach Growls.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, textSign, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, tube, stomach, brain, gut, burger, check, counter, soundWaves, pulse, flow } = B;
  const guy = { skin: 0xd9a07a, shirt: 0x35c8ef, hair: 0x1a120c };
  // a coil of small intestine in the belly (person-local)
  function coil() { const pts = []; for (let j = 0; j < 5; j++) for (let i = 0; i <= 6; i++) { const u = i / 6, x = (j % 2 ? 1 - u : u) * .56 - .28; pts.push(V(x, 1.3 - j * .085 - u * .085 / 6 * 0, .22 + Math.sin(u * Math.PI) * .05)); }
    return tube(pts, .04, plastic(0xff9fb0, { roughness: .4 }), 240); }
  const growlTag = () => tag('GRRRR', 0xffd23f, '#3a2400', 1.5, .5);

  BUILD.sg_hook = (p) => {
    const st = set('warm'), who = makePerson(guy); st.scene.add(who); const sw = soundWaves(0xffffff); sw.position.set(.35, 1.4, .7); sw.rotation.y = .3; st.scene.add(sw);
    const gr = growlTag(); gr.position.set(.75, 1.75, .8); st.scene.add(gr); const ts = hud(st, titleSigns(p.top, p.bottom, 0x35c8ef), .66, 0, .86);
    return { ...st, update(t, s) { const k = seg(t, .3, .45); who.pose({ s, handR: reach('belly', seg(t, .1, .3)), handL: reach('belly', seg(t, .15, .35), -1), wide: k * .6, smile: lerp(.3, -.2, k), look: [0, -.8] });
      sw.update(s, k); gr.scale.setScalar(popIn(t, .35) * .8); gr.rotation.z = Math.sin(s * 20) * .05; ts.update(t, s); orbit(st, s, [0, 2.2, 0], 5.6, .2); } };
  };
  BUILD.sg_tubes = () => {
    const st = set('xray'), who = makePerson(guy); st.scene.add(who); const I = who.userData.inner, sto = stomach(1.05); sto.position.set(.1, 1.55, .15); I.add(sto); const co = coil(); I.add(co);
    const ps = [0, 1, 2].map(i => { const p = pulse(co.userData.curve, 0xffa0b4, .35); p.userData.xr = false; I.add(p); return p; }); const lb = hud(st, tag('TUBES OF MUSCLE', 0xff9fb0, '#5a1020', 2.7, .46), .6, 0, .64);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, smile: .3 }); ps.forEach((p, i) => p.at(frac(s * .35 + i / 3))); sto.scale.setScalar(1.05 * (1 + Math.sin(s * 3) * .04)); lb.scale.setScalar(popIn(t, .3)); shoot(st, [.8, 1.9, 3.6], [0, 1.4, 0]); } };
  };
  BUILD.sg_empty = () => {
    const st = set('flesh'), g = gut(10, 1.0); g.position.y = 2.2; st.scene.add(g); const R = rng(3), crumbs = [0, 1, 2, 3, 4].map(i => { const c = M(RB(.18, .14, .16, .04), plastic(0xe0a050)); st.scene.add(c); return c; });
    const clk = hud(st, tag('EVERY ~2 HOURS', 0xffffff, '#1d2442', 2.6, .48), .6, 0, .62), l2 = hud(st, tag('SWEEP!', 0xe2475a, '#ffffff', 1.5, .46), .45, 0, .36);
    return { ...st, update(t, s) { g.update(s); const rx = g.ringX(s); crumbs.forEach((c, i) => { const x0 = -3 + i * 1.2, push = rx.reduce((a, x) => a + (x > x0 - .2 ? clamp((x - x0 + .2) * .8, 0, 1.2) : 0), 0); c.position.set(Math.min(4.5, x0 + push * .9), 1.35 + (i % 2) * .1, (i % 3 - 1) * .3); c.rotation.set(s + i, s * .6, 0); });
      clk.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [.6, 3.4, 6.4], [0, 2.1, 0]); } };
  };
  BUILD.sg_echo = () => {
    const st = set('flesh'), g = gut(10, 1.0); g.position.y = 2.2; st.scene.add(g); const R = rng(5), bubs = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => { const b = M(SPH(.15 + R() * .2, 20, 14), plastic(0xfff0f4, { transparent: true, opacity: .55, roughness: .02 }), { shadow: false }); st.scene.add(b); return b; });
    const sws = [-2, 0, 2].map(x => { const w = soundWaves(0xffffff); w.position.set(x, 3.4, .5); w.rotation.z = Math.PI / 2 - .3; st.scene.add(w); return w; }); const lb = hud(st, tag('GURGLE!', 0xffd23f, '#3a2400', 1.7, .55), .6, 0, .42);
    return { ...st, update(t, s) { g.update(s * .7); bubs.forEach((b, i) => { b.position.set(-3 + ((i * 1.1 + s * .8) % 6.5), 2.0 + Math.sin(s * 3 + i) * .35, Math.cos(i * 2.1) * .4); b.scale.setScalar(1 + Math.sin(s * 6 + i) * .15); }); sws.forEach((w, i) => w.update(s + i * .3, seg(t, .2, .35)));
      lb.scale.setScalar(popIn(t, .25)); lb.rotation.z = Math.sin(s * 14) * .05; shoot(st, [0, 3.0, 6.4], [0, 2.4, 0]); } };
  };
  BUILD.sg_name = () => {
    const st = set('lilac'), who = makePerson(guy); st.scene.add(who);
    const word = textSign(3.6, .9, 'BORBORYGMI', { color: 0x35c8ef, fg: '#ffffff', size: 104, depth: .3 }); word.userData.w = 3.6; hud(st, word, .55, 0, .9);
    const say = textSign(2.6, .5, 'bor-bor-IG-mee', { color: 0xffffff, fg: '#1d2442', size: 64 }); say.userData.w = 2.6; hud(st, say, .36, 0, .62);
    return { ...st, update(t, s) { who.pose({ s, handR: reach('up', seg(t, .1, .3)), smile: .8, look: [0, .6] }); word.scale.setScalar(popIn(t, .2)); word.rotation.z = Math.sin(s * 2) * .03; say.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.2, 0], 6.2, .2); } };
  };
  BUILD.sg_hormone = () => {
    const st = set('xray'), who = makePerson(guy); st.scene.add(who); const I = who.userData.inner, sto = stomach(1.0); sto.position.set(.1, 1.55, .15); I.add(sto); const br = brain(.9); br.position.set(0, 2.82, -.06); I.add(br);
    const path = new THREE.CatmullRomCurve3([V(.15, 1.6, .25), V(.25, 2.0, .2), V(.1, 2.4, .15), V(0, 2.75, .1)]); const fl = flow(path, 10, 0x7ad94a, .05, .5, true); fl.userData.xr = false; I.add(fl);
    const lb = hud(st, tag('GHRELIN', 0x7ad94a, '#14320a', 1.7, .5), .6, 0, .42), l2 = hud(st, tag('= HUNGRY', 0xffffff, '#1d2442', 1.9, .44), .48, 0, .45);
    return { ...st, update(t, s) { who.xray(1); who.pose({ s, smile: -.1, look: [0, -.4] }); fl.update(s, seg(t, .1, .25)); sto.scale.setScalar(1 + Math.sin(s * 5) * .06 * seg(t, .4, .5)); lb.scale.setScalar(popIn(t, .2)); l2.scale.setScalar(popIn(t, .5)); shoot(st, [1.3, 2.4, 4.2], [0, 2.1, 0]); } };
  };
  BUILD.sg_feed = () => {
    const st = set('mint'), who = makePerson(guy); st.scene.add(who); const bg = burger(); bg.scale.setScalar(.6); st.scene.add(bg); const ok = hud(st, check(true), .55, .42, .2), lb = hud(st, tag('FEED ME', 0xff7a59, '#ffffff', 1.8, .55), .58, -.1, .45);
    return { ...st, update(t, s) { const k = seg(t, .1, .35), bite = Math.max(0, Math.sin(s * 5)) * seg(t, .35, .4); const h = reach([.1, 2.25 + bite * .05, .8], k); who.pose({ s, handR: h, poleR: [1, -.6, -.2], mouth: bite * .5, smile: .8, squint: bite * .4 });
      bg.position.copy(h).add(V(-.05, .0, .12)); bg.rotation.set(.3, 0, 0); lb.scale.setScalar(popIn(t, .1)); ok.scale.setScalar(popIn(t, .6)); orbit(st, s, [0, 2.5, 0], 5.0, .2); } };
  };
}
