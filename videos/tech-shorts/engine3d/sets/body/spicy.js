// Sets for Body Shorts episode 18: Why Spicy Food Burns.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, glass, bird, sweat, check, nerve, thermometer } = B;
  const guy = { skin: 0xf2c7a5, shirt: 0x2fbf71, hair: 0x2a1a12 };
  const CAP = 0xff6a1a, RED = 0xe0262b;
  function chilli(s = 1) { const g = new THREE.Group(), m = plastic(RED, { roughness: .25, clearcoat: 1 }); for (let i = 0; i < 12; i++) { const u = i / 11, r = .22 * (1 - u * .8) + .03; g.add(M(SPH(r, 24, 16), m, { pos: [Math.sin(u * 1.6) * .35, -u * 1.3, 0] })); }
    g.add(M(new THREE.CylinderGeometry(.06, .08, .3, 12), plastic(0x3cae3a), { pos: [0, .22, 0], rot: [0, 0, .3] }), M(SPH(.18, 16, 12), plastic(0x3cae3a), { pos: [0, .08, 0], scale: [1.2, .4, 1.2] })); g.scale.setScalar(s); return g; }
  // capsaicin molecules: little orange clusters
  const molecule = (s = 1) => { const g = G(M(SPH(.12, 16, 12), glowM(CAP, 1.2)), M(SPH(.08, 12, 8), glowM(0xffb020, 1.2), { pos: [.14, .06, 0] }), M(SPH(.07, 12, 8), glowM(0xffb020, 1.2), { pos: [-.12, .08, .04] }), M(new THREE.CylinderGeometry(.025, .025, .3, 6), plastic(0xffd8a0), { pos: [0, -.18, 0] })); g.scale.setScalar(s); return g; };
  function steam(n = 6, seed = 3) { const R = rng(seed), g = new THREE.Group(), P = []; for (let i = 0; i < n; i++) { g.add(sprite(0xffffff, .5, .6)); P.push([(R() - .5) * .4, R()]); }
    g.update = (s, k = 1) => g.children.forEach((c, i) => { const [x, ph] = P[i], u = frac(s * .7 + ph); c.position.set(x + Math.sin(s * 3 + i) * .08, u * 1.0, 0); c.material.opacity = Math.sin(u * Math.PI) * .6 * k; c.scale.setScalar(.25 + u * .5); }); return g; }
  function milkCarton() { return G(M(RB(.7, 1.1, .7, .05), plastic(0xffffff), { pos: [0, .55, 0] }), M(new THREE.ConeGeometry(.5, .35, 4), plastic(0x3fa9ff), { pos: [0, 1.27, 0], rot: [0, Math.PI / 4, 0] }), M(RB(.72, .35, .72, .03), plastic(0x3fa9ff), { pos: [0, .6, 0] })); }

  BUILD.sp_hook = (p) => {
    const st = set('warm'), who = makePerson(guy); st.scene.add(who); const ch = chilli(.45); st.scene.add(ch); const sts = [-1, 1].map(d => { const s_ = steam(5, d + 4); s_.position.set(d * .62, 2.8, 0); who.add(s_); return s_; });
    const fire = [0, 1, 2].map(() => { const f = sprite(0xff6a1a, .5, 0); who.add(f); return f; }); const ts = hud(st, titleSigns(p.top, p.bottom, RED), .66, 0, .86);
    return { ...st, update(t, s) { const eat = seg(t, .05, .3) * (1 - seg(t, .35, .45)), hot = seg(t, .4, .6); const h = reach([.08, 2.3, .78], eat); who.pose({ s, handR: h, poleR: [1, -.6, -.2], flush: hot, wide: hot * .6, mouth: hot * .6 + Math.sin(s * 12) * .1 * hot, smile: lerp(.7, -.2, hot), brow: hot * .6 });
      ch.position.copy(h).add(V(0, .3, .1)); ch.rotation.z = -1.2; ch.visible = t < .45; sts.forEach(x => x.update(s, hot)); fire.forEach((f, i) => { const u = frac(s * 2 + i / 3); f.position.set((i - 1) * .08, 2.42 - u * .1, .7 + u * .4); f.material.opacity = hot * (1 - u) * .9; f.scale.setScalar(.3 + u * .4); });
      ts.update(t, s); orbit(st, s, [0, 2.6, 0], 5.0, .1); } };
  };
  BUILD.sp_capsaicin = () => {
    const st = set('lilac'), ch = chilli(2.0); ch.position.set(-.3, 4.0, 0); st.scene.add(ch); const R = rng(5), ms = [0, 1, 2, 3, 4, 5, 6].map(i => { const m = molecule(1.2); st.scene.add(m); return m; }), P = ms.map(() => [R() * 6.28, R()]);
    const lb = hud(st, tag('CAPSAICIN', CAP, '#ffffff', 1.9, .55), .62, 0, .45);
    return { ...st, update(t, s) { ch.rotation.set(.3, s * .5, .25); ms.forEach((m, i) => { const [a, ph] = P[i], u = frac(s * .25 + ph); m.position.set(Math.cos(a + s * .3) * (.8 + u * 1.2), 1.6 + Math.sin(a) * .6 + u * 1.4, Math.sin(a + s * .3) * .8); m.rotation.set(s + i, s * .7, 0); m.scale.setScalar(1.2 * popIn(t, .2 + i * .04)); });
      lb.scale.setScalar(popIn(t, .3)); shoot(st, [0, 3.0, 7.4], [0, 2.6, 0]); } };
  };
  BUILD.sp_receptor = () => {
    const st = set('flesh'), mem = M(RB(8, .5, 3, .1), plastic(0xffb0c0, { roughness: .5 }), { pos: [0, 1.4, -.5] }); st.scene.add(mem); const nv = nerve([[-4, 1.0, .4], [0, 1.0, .4], [4, 1.0, .4]], .14); st.scene.add(nv);
    const rec = G(M(new THREE.CylinderGeometry(.55, .35, .9, 32, 1, true), plastic(0x9b7bff, { side: THREE.DoubleSide }), { pos: [0, .45, 0] }), M(new THREE.TorusGeometry(.55, .08, 12, 32), plastic(0x9b7bff), { pos: [0, .9, 0], rot: [Math.PI / 2, 0, 0] })); rec.position.set(0, 1.65, 0); st.scene.add(rec);
    const mol = molecule(1.6); st.scene.add(mol); const glow = sprite(0xff6a1a, 2.5, 0); glow.position.set(0, 2.4, .2); st.scene.add(glow); const th = thermometer(.2); th.position.set(1.8, 1.7, .3); st.scene.add(th);
    const l1 = hud(st, tag('HEAT SENSOR', 0x9b7bff, '#ffffff', 2.1, .46), .62, -.15, .48), l2 = hud(st, tag('"HOT!"', 0xff4a5c, '#ffffff', 1.4, .55), .5, .3, .32);
    return { ...st, update(t, s) { const d = ease(seg(t, .1, .45)); mol.position.set(lerp(-1.6, 0, d), lerp(4.4, 2.5, d), 0); mol.rotation.set(s, s * .5, 0); const on = seg(t, .45, .55); glow.material.opacity = on * (.6 + .3 * Math.sin(s * 9)); nv.material.emissiveIntensity = 1.4 + on * 2 * (.6 + .4 * Math.sin(s * 12));
      th.set(.2 + on * .75); l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .5)); shoot(st, [.5, 3.2, 6.4], [0, 2.3, 0]); } };
  };
  BUILD.sp_fire = () => {
    const st = set('warm', { top: '#ffb07a', bottom: '#ff7a5a' }), who = makePerson(guy); st.scene.add(who); const sw = sweat(10, 5); sw.position.set(0, 2.65, 0); who.add(sw); const sts = [-1, 1].map(d => { const s_ = steam(5, d + 7); s_.position.set(d * .62, 2.8, 0); who.add(s_); return s_; });
    const drip = M(SPH(.05, 12, 8), plastic(0x9fdcff, { transparent: true, opacity: .85 }), { scale: [1, 1.5, 1] }); who.add(drip); const lb = hud(st, tag('ON FIRE?!', 0xff4a5c, '#ffffff', 1.8, .55), .6, 0, .45);
    return { ...st, update(t, s) { who.pose({ s, flush: 1, mouth: .5 + Math.sin(s * 10) * .15, wide: .5, brow: .7, smile: -.3, handR: reach('mouth', seg(t, .4, .55) * .7) }); sw.update(s, 1); sts.forEach(x => x.update(s, 1)); const u = frac(s * .8); drip.position.set(.05, 2.55 - u * .25, .66); drip.scale.set(1, 1.5, 1).multiplyScalar(u < .9 ? 1 : 0);
      lb.scale.setScalar(popIn(t, .15)); orbit(st, s, [0, 2.65, 0], 3.8, .05); } };
  };
  function tongue(st) { const tg = M(SPH(1.8, 48, 32), plastic(0xff7f95, { roughness: .6 }), { pos: [0, .8, 0], scale: [1.2, .3, 1.6] }); st.scene.add(tg); return tg; }
  BUILD.sp_water = () => {
    const st = set('lilac'), tg = tongue(st); const gl = glass(.7); gl.scale.setScalar(1.4); gl.position.set(1.1, 1.0, -1.6); st.scene.add(gl);
    const R = rng(8), drops = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(() => { const d = M(SPH(.12, 16, 12), plastic(CAP, { roughness: .1, clearcoat: 1 }), { scale: [1, .4, 1] }); st.scene.add(d); return d; }), P = drops.map(() => [R() * 6.28, R() * .5]);
    const wa = sprite(0x9fdcff, 3, 0); wa.position.set(0, 1.4, 0); st.scene.add(wa); const no = hud(st, check(false), .55, .4, .18), lb = hud(st, tag('WATER SPREADS IT', 0x6fc8ff, '#0b2a40', 2.8, .46), .62, -.05, .62);
    return { ...st, update(t, s) { const sp = ease(seg(t, .2, .8)); drops.forEach((d, i) => { const [a, r] = P[i]; d.position.set(Math.cos(a) * (r + sp * 1.4), 1.33, Math.sin(a) * (r + sp * 1.4) * .9); }); wa.material.opacity = seg(t, .15, .3) * (1 - seg(t, .5, .7)) * .7;
      lb.scale.setScalar(popIn(t, .1)); no.scale.setScalar(popIn(t, .6)); shoot(st, [0, 4.4, 5.4], [0, 1.3, -.3]); } };
  };
  BUILD.sp_milk = () => {
    const st = set('mint'), tg = tongue(st); const mc = milkCarton(); mc.scale.setScalar(1.1); mc.position.set(1.1, 1.0, -1.6); st.scene.add(mc);
    const R = rng(8), pairs = [0, 1, 2, 3, 4, 5].map(i => { const d = M(SPH(.12, 16, 12), plastic(CAP, { roughness: .1, clearcoat: 1 }), { scale: [1, .5, 1] }), c = B.lumpy(.18, .1, 6, plastic(0xfffaf0, { roughness: .6 }), i, 24); st.scene.add(d, c); return [d, c, R() * 6.28, R() * .9]; });
    const ok = hud(st, check(true), .55, .4, .18), lb = hud(st, tag('CASEIN GRABS IT', 0xffffff, '#1d2442', 2.7, .46), .62, -.05, .6);
    return { ...st, update(t, s) { pairs.forEach(([d, c, a, r], i) => { const grab = seg(t, .15 + i * .05, .4 + i * .05), away = ease(seg(t, .45 + i * .04, .9)); const p = V(Math.cos(a) * r, 1.33, Math.sin(a) * r * .9);
      c.position.set(lerp(p.x + Math.cos(a) * 2, p.x, grab), 1.38 + away * 1.5, lerp(p.z + 1.5, p.z, grab) + away * 1.2); d.position.copy(grab >= 1 ? c.position.clone().add(V(0, -.05, .1)) : p); });
      lb.scale.setScalar(popIn(t, .1)); ok.scale.setScalar(popIn(t, .65)); shoot(st, [0, 4.4, 5.4], [0, 1.4, -.3]); } };
  };
  BUILD.sp_birds = () => {
    const st = set('mint'), b = bird(); b.scale.setScalar(1.6); b.position.set(-.3, 1.3, 0); b.rotation.y = .7; st.scene.add(b); const ch = chilli(.8); ch.position.set(.9, 1.3, .4); ch.rotation.z = 1.4; st.scene.add(ch);
    const seeds = [0, 1, 2, 3, 4].map(() => { const s_ = M(SPH(.05, 10, 8), plastic(0xfff0b0), { scale: [1, .6, 1] }); st.scene.add(s_); return s_; }); const lb = hud(st, tag("BIRDS DON'T FEEL IT", 0x4fb3ff, '#ffffff', 3.0, .48), .62, 0, .7);
    return { ...st, update(t, s) { const peck = Math.max(0, Math.sin(s * 6)); b.rotation.x = peck * .35; b.flap(s * .2); seeds.forEach((x, i) => { const u = frac(s * .5 + i / 5); x.position.set(.6 + Math.sin(i) * .3, 1.3 - u * 1.3, .5 + Math.cos(i) * .2); x.visible = u < .95; });
      lb.scale.setScalar(popIn(t, .1)); orbit(st, s, [.2, 1.5, 0], 5.6, .5); } };
  };
}
