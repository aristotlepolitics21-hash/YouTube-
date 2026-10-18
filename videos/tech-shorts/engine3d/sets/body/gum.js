// Sets for Body Shorts episode 6: What Happens If You Swallow Gum.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, tube, lumpy, stomach, check, counter, warnSign } = B;
  const kid = { skin: 0xa8714e, shirt: 0xff6fb1, hair: 0x1a120c, eye: 0x2a1a10 };
  const GUM = 0xff8fc8;
  const gumBlob = (s = 1, seed = 2) => { const g = lumpy(.3, .1, 7, plastic(GUM, { roughness: .45 }), seed, 40); g.scale.setScalar(s); return g; };
  const ESO = [[0, 2.42, .45], [0, 2.3, .05], [0, 2.0, 0], [0, 1.7, .05], [.1, 1.42, .15]];
  function toilet() { const w = plastic(0xffffff, { roughness: .2 }); return G(M(new THREE.CylinderGeometry(.55, .4, .8, 40), w, { pos: [0, .4, 0], scale: [1, 1, 1.25] }), M(new THREE.TorusGeometry(.5, .08, 12, 40), w, { pos: [0, .82, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1.25, 1] }),
    M(RB(1.0, 1.0, .4, .1), w, { pos: [0, 1.1, -.75] }), M(RB(.2, .06, .1, .02), plastic(0xc9cdd8), { pos: [.3, 1.5, -.55] })); }
  // a fat gut tube along x with squeezing rings that travel along it; squeeze(u) returns the ring pinch at x
  function gut(len = 9, r = 1.0) { const g = new THREE.Group(); const t = M(new THREE.CylinderGeometry(r, r, len, 48, 1, true), plastic(0xff9fb0, { transparent: true, opacity: .4, side: THREE.DoubleSide, depthWrite: false, roughness: .3 }), { rot: [0, 0, Math.PI / 2], shadow: false }); g.add(t);
    const back = M(new THREE.CylinderGeometry(r * 1.01, r * 1.01, len, 48, 1, true, Math.PI * .5, Math.PI), matte(0xc84a5c, { side: THREE.BackSide }), { rot: [0, 0, Math.PI / 2], shadow: false }); g.add(back);
    const rings = [0, 1, 2].map(() => { const m = M(new THREE.TorusGeometry(r, .16, 16, 48), plastic(0xe2475a, { roughness: .4 }), { rot: [0, Math.PI / 2, 0] }); g.add(m); return m; });
    g.update = s => rings.forEach((m, i) => { const x = ((s * 1.6 + i * 3) % len) - len / 2; m.position.x = x; m.scale.setScalar(.75); });
    g.ringX = s => rings.map((_, i) => ((s * 1.6 + i * 3) % len) - len / 2); return g; }

  BUILD.gm_hook = (p) => {
    const st = set('lilac'), who = makePerson(kid); st.scene.add(who); const bub = M(SPH(.3, 40, 28), plastic(GUM, { roughness: .25, transparent: true, opacity: .92 }), { pos: [0, 2.43, .7] }); st.scene.add(bub);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0xe84d9a), .66, 0, .86), yrs = hud(st, tag('7 YEARS?', 0xffd23f, '#3a2400', 1.8, .55), -.05, .45, .4);
    return { ...st, update(t, s) { const grow = ease(seg(t, .05, .4)), popd = t > .42; bub.scale.setScalar(popd ? 0 : .2 + grow * 1.6); bub.position.z = .62 + (popd ? 0 : grow * .45);
      const gulp = seg(t, .6, .7) * (1 - seg(t, .75, .85)); who.pose({ s, mouth: popd ? .1 : .15, smile: popd ? -.1 : .3, wide: popd && t < .55 ? 1 : 0, headNod: gulp * .25, squint: gulp * .5, puff: popd ? 0 : .3 });
      ts.update(t, s); yrs.scale.setScalar(popIn(t, .72)); orbit(st, s, [0, 2.75, 0], 4.4, .1); } };
  };
  BUILD.gm_down = () => {
    const st = set('xray'), who = makePerson(kid); st.scene.add(who); const I = who.userData.inner;
    const es = tube(ESO, .05, plastic(0xff9fb0, { roughness: .4 })); I.add(es); const sto = stomach(1.1); sto.position.set(.1, 1.35, .15); I.add(sto);
    const gb = gumBlob(.55); gb.userData.xr = false; I.add(gb); gb.traverse(c => c.userData.xr = false);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, smile: .3 }); const u = ease(seg(t, .2, .9)); gb.position.copy(es.userData.curve.getPoint(u)); gb.rotation.set(s, s * .7, 0);
      shoot(st, [1.6, 2.6, 4.6], [0, 1.9, 0]); } };
  };
  BUILD.gm_resist = () => {
    const st = set('flesh'), pool = M(new THREE.CircleGeometry(4, 48), plastic(0x9be05a, { transparent: true, opacity: .5, roughness: .05 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, .6, 0], shadow: false }); st.scene.add(pool);
    const R = rng(3), food = [0, 1, 2, 3].map(i => { const f = M(RB(.6, .6, .6, .12), plastic([0xffb020, 0x5cc46a, 0xe0a050, 0xff6a5c][i]), { pos: [-1.6 + i * .45, .9, .4 - i * .3] }); st.scene.add(f); return f; });
    const gb = gumBlob(1.4); gb.position.set(.7, 1.1, .3); st.scene.add(gb);
    const bubbles = new THREE.Group(); for (let i = 0; i < 16; i++) bubbles.add(M(SPH(.06 + R() * .06, 12, 8), plastic(0xd8ffb0, { transparent: true, opacity: .7 }), { shadow: false })); st.scene.add(bubbles);
    const l1 = hud(st, tag('FOOD: DIGESTED', 0x3cc85a, '#ffffff', 2.6, .44), .62, -.3, .48), l2 = hud(st, tag('GUM: NOPE', 0xff4a5c, '#ffffff', 2.0, .44), .48, .3, .4);
    return { ...st, update(t, s) { const d = ease(seg(t, .1, .7)); food.forEach((f, i) => { f.scale.setScalar(Math.max(.01, 1 - clamp(d * 1.3 - i * .1))); f.rotation.set(s * .3 + i, s * .2, 0); });
      gb.rotation.y = s * .4; gb.position.y = 1.1 + Math.sin(s * 2) * .05; bubbles.children.forEach((b, i) => { const u = frac(s * .5 + i / 16); b.position.set(Math.sin(i * 2.3) * 2.5, .6 + u * 1.5, Math.cos(i * 1.7) * 1.5); });
      l1.scale.setScalar(popIn(t, .35)); l2.scale.setScalar(popIn(t, .55)); shoot(st, [0, 2.5, 6.4], [0, 1.2, 0]); } };
  };
  BUILD.gm_move = () => {
    const st = set('flesh'), g = gut(10, 1.0); g.position.y = 2.2; st.scene.add(g); const gb = gumBlob(1.3); st.scene.add(gb);
    const bits = [0, 1, 2].map(i => { const b = M(RB(.35, .35, .35, .08), plastic([0xffb020, 0x5cc46a, 0xe0a050][i])); st.scene.add(b); return b; });
    const lb = hud(st, tag('SQUEEZE, SQUEEZE', 0xe2475a, '#ffffff', 2.8, .46), .6, 0, .66);
    return { ...st, update(t, s) { g.update(s); const x = -3 + s * 1.2; gb.position.set(x, 2.2 + Math.sin(s * 3) * .05, 0); gb.rotation.set(s, s * .5, 0); bits.forEach((b, i) => { b.position.set(x - 1.4 - i * 1.1, 2.0 + (i % 2) * .3, .2); b.rotation.set(s + i, s, 0); });
      lb.scale.setScalar(popIn(t, .1)); shoot(st, [x * .5 + .5, 3.2, 6.0], [x * .5, 2.2, 0]); } };
  };
  BUILD.gm_out = () => {
    const st = set('mint'), to = toilet(); to.scale.setScalar(1.3); to.rotation.y = .3; st.scene.add(to);
    const glow = sprite(0xffffff, 1.2, 0); glow.position.set(0, 1.6, .2); st.scene.add(glow);
    const cal = hud(st, counter(1.9, .7, k => 'DAY ' + Math.max(1, Math.ceil(k * 3)), '#1d2442'), .6, 0, .5); cal.userData.w = 1.9;
    const lb = hud(st, tag('A FEW DAYS', 0x3cc85a, '#ffffff', 2.0, .46), .45, 0, .45);
    return { ...st, update(t, s) { cal.set(ease(seg(t, .05, .6))); cal.scale.setScalar(popIn(t, .02)); glow.material.opacity = seg(t, .6, .7) * (.5 + .5 * Math.sin(s * 8)); lb.scale.setScalar(popIn(t, .65)); orbit(st, s, [0, 1.3, 0], 5.6, .8); } };
  };
  BUILD.gm_risk = () => {
    const st = set('flesh'), g = gut(10, 1.0); g.position.y = 2.2; st.scene.add(g);
    const blobs = [0, 1, 2, 3, 4, 5, 6].map(i => { const b = gumBlob(1.1 + (i % 3) * .2, i + 3); b.position.set(-1.6 + i * .5, 2.2 + Math.sin(i * 2.1) * .3, Math.cos(i * 1.3) * .3); st.scene.add(b); return b; });
    const w = hud(st, B.warnSign(1), .6, -.35, .24); w.userData.w = 1.1; const lb = hud(st, tag('BLOCKAGE', 0xff4a5c, '#ffffff', 1.9, .5), .6, .2, .44);
    return { ...st, update(t, s) { g.update(s * .3); blobs.forEach((b, i) => { b.scale.setScalar((1.1 + (i % 3) * .2) * clamp(popIn(t, i * .06))); b.rotation.y = s * .2 + i; });
      w.scale.setScalar(popIn(t, .5)); lb.scale.setScalar(popIn(t, .55)); shoot(st, [.5, 3.2, 6.2], [0, 2.2, 0]); } };
  };
  BUILD.gm_fine = () => {
    const st = set('warm'), who = makePerson(kid); st.scene.add(who); const ok = hud(st, check(true), .55, .42, .2), one = hud(st, tag('ONE PIECE', 0xe84d9a, '#ffffff', 1.9, .5), .55, -.15, .45);
    return { ...st, update(t, s) { who.pose({ s, smile: .9, handR: reach('up', seg(t, .1, .3)), headTilt: Math.sin(s * 2) * .06 }); one.scale.setScalar(popIn(t, .1)); ok.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.6, 0], 5.0, .2); } };
  };
}
