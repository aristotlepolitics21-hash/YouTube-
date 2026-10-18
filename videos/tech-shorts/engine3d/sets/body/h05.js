// Weird History of Medicine, episode 5 (cartoon 3D): Why Doctors Blew Smoke Into People.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, clamp, lerp, seg, ease, frac, V, rng } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit } = B;
  const gent = { skin: 0xf2c7a5, shirt: 0xf4f0e6, pants: 0x3a2a1a, hair: 0x6b4a2e, coat: 0x2a3a5a };
  const drowned = { skin: 0xc8d0d8, shirt: 0xf4f0e6, pants: 0x3a3a46, hair: 0x2a1a12 };
  function bellows() { const g = new THREE.Group(), top = new THREE.Group(); g.add(M(RB(.5, .06, .9, .03), plastic(0x8a5a2a), {})); g.add(top); top.add(M(RB(.5, .06, .9, .03), plastic(0x8a5a2a), { pos: [0, 0, 0] }));
    const leather = M(new THREE.CylinderGeometry(.3, .3, .2, 16, 1, true), matte(0x5a3a22, { side: THREE.DoubleSide }), { pos: [0, .1, .05] }); g.add(leather); g.add(M(new THREE.ConeGeometry(.06, .4, 12), metal(0xc8a050), { pos: [0, .05, .62], rot: [Math.PI / 2, 0, 0] }));
    g.pump = k => { top.position.y = .08 + k * .22; top.rotation.x = -k * .25; leather.scale.y = .5 + k * 1.5; }; g.pump(0); return g; }
  function puffs(n = 8, seed = 2) { const R = rng(seed), g = new THREE.Group(), P = []; for (let i = 0; i < n; i++) { g.add(sprite(0xd8d0c8, .5, .6)); P.push([R() * 6.28, R()]); }
    g.update = (s, k = 1, dir = V(0, 1, 0)) => g.children.forEach((c, i) => { const [a, ph] = P[i], u = frac(s * .5 + ph); c.position.set(Math.cos(a) * .2 + dir.x * u, Math.sin(a) * .2 + dir.y * u, dir.z * u); c.material.opacity = Math.sin(u * Math.PI) * .6 * k; c.scale.setScalar(.3 + u * .6); }); return g; }
  const lying = (p, x, z) => { p.position.set(x, .35, z); return p; };

  BUILD.h05_1 = (p) => {
    const st = H.room('river'), a = H.who(gent, 'tricorn', 'coat'), b = H.who({ ...gent, skin: 0xd9a07a, coat: 0x6a3a22 }, 'tricorn'), v = H.who(drowned); st.scene.add(a, b, v);
    a.position.set(-.9, 0, -.4); a.rotation.y = .8; b.position.set(.9, 0, -.4); b.rotation.y = -.8; lying(v, 0, 1.3);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0x8a5a2a), .66, 0, .86);
    return { ...st, update(t, s) { const k = ease(seg(t, .05, .5)); v.position.z = lerp(-1.5, 1.3, k); v.pose({ s: 0, lean: -Math.PI / 2, squint: 1, smile: 0 }); [a, b].forEach((q, i) => q.pose({ s, handR: reach([.2, 1.0, .9], 1), handL: reach([.2, 1.0, .9], 1, -1), lean: .4 * (1 - k), brow: .6, smile: -.2 }));
      ts.update(t, s); orbit(st, s, [0, 1.6, .4], 7.2, .8); } };
  };
  BUILD.h05_2 = () => {
    const st = H.room('river'), box = G(M(RB(2.0, .6, 1.2, .06), plastic(0x8a5a2a), { pos: [0, .3, 0] }), M(RB(2.0, .08, 1.2, .04), plastic(0x6a4422), { pos: [0, .95, -.65], rot: [-1.2, 0, 0] })); box.position.set(0, 0, .6); st.scene.add(box);
    const bl = bellows(); st.scene.add(bl); const tubeM = M(new THREE.TorusGeometry(.3, .04, 8, 24, Math.PI * 1.5), plastic(0xc8a070), { pos: [.5, .7, .6], rot: [Math.PI / 2, 0, 0] }), pipe = M(new THREE.CylinderGeometry(.05, .03, .6, 10), plastic(0xe8dcc4), { pos: [-.6, .66, .7], rot: [0, 0, 1.4] }); st.scene.add(tubeM, pipe);
    const g = H.who(gent, 'tricorn', 'coat'); g.position.set(0, 0, -.6); st.scene.add(g); const lb = hud(st, tag('RESCUE KIT', 0x8a5a2a, '#ffffff', 1.9, .5), .62, 0, .44);
    return { ...st, update(t, s) { const up = ease(seg(t, .1, .45)), h = reach([.15, lerp(1.1, 2.0, up), .8], 1); g.pose({ s, handR: h, handL: reach([.15, lerp(1.1, 2.0, up), .8], 1, -1), smile: .6, look: [0, -.4] }); bl.position.set(0, lerp(.7, 1.95, up), .2); bl.pump(Math.abs(Math.sin(s * 2)) * .5);
      lb.scale.setScalar(popIn(t, .2)); orbit(st, s, [0, 1.5, .3], 6.0, .9); } };
  };
  BUILD.h05_3 = () => {
    const st = H.room('river'), v = H.who(drowned); lying(v, -.2, .3); v.rotation.y = .3; st.scene.add(v); const bl0 = B.blanket(1.5, 2.6, 0x8a6a4a); bl0.position.set(-.5, .62, -.4); st.scene.add(bl0);
    const d = H.who(gent, 'tricorn', 'coat'); d.position.set(1.4, 0, 1.3); d.rotation.y = -.9; st.scene.add(d); const bl = bellows(); bl.position.set(.9, 1.3, 1.3); bl.rotation.y = -2.3; st.scene.add(bl);
    const pf = puffs(10); pf.position.set(.3, 1.0, .6); st.scene.add(pf); const crowd = [0, 1].map(i => { const c = H.who({ skin: [0xffd9bd, 0xa8714e][i], shirt: [0x8a2a3a, 0x3a5a8a][i], hair: 0x2a1a12, hairStyle: i ? 'long' : 'short' }, 'bonnet'); c.position.set(-1.6 + i * .8, 0, -1.8); st.scene.add(c); return c; });
    const lb = hud(st, tag('A TOBACCO SMOKE ENEMA', 0x8a5a2a, '#ffffff', 3.4, .46), .62, 0, .76);
    return { ...st, update(t, s) { v.pose({ s: 0, lean: -Math.PI / 2, squint: 1 }); const pk = Math.abs(Math.sin(s * 3)); d.pose({ s, handR: reach([.1, 1.4, .8], 1), handL: reach([.1, 1.4, .8], 1, -1), smile: .5 }); bl.pump(pk); pf.update(s, 1, V(-.6, .6, -.4));
      crowd.forEach((c, i) => c.pose({ s: s + i, wide: 1, mouth: .4, smile: -.3, handR: reach('mouth', seg(t, .2, .3)) })); lb.scale.setScalar(popIn(t, .35)); orbit(st, s, [0, 1.4, 0], 7.4, 1.2); } };
  };
  BUILD.h05_4 = () => {
    const st = H.room('candle'), d = H.who(gent, 'wig', 'coat'); st.scene.add(d); const ln = G(M(RB(.4, .6, .4, .05), plastic(0xffd890, { transparent: true, opacity: .7 })), M(SPH(.12, 16, 12), glowM(0xffb040, 3))); ln.position.set(-1.0, 1.8, .4); st.scene.add(ln);
    const pf = puffs(10, 5); pf.position.set(-1.0, 2.0, .4); st.scene.add(pf); const heartG = B.heart(.5); heartG.position.set(.9, 3.3, .3); st.scene.add(heartG); const lb = hud(st, tag('"WARM THE HEART"', 0xff8a3c, '#ffffff', 2.6, .5), .62, 0, .58);
    return { ...st, update(t, s) { d.pose({ s, handR: reach('up', seg(t, .05, .2)), smile: .8, brow: -.4 }); pf.update(s, 1, V(.4, 1.2, 0)); heartG.scale.setScalar(.5 * (1 + Math.max(0, Math.sin(s * 6)) * .12)); lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.5, 0], 5.6, .2); } };
  };
  BUILD.h05_5 = () => {
    const st = H.room('lab', { top: '#efe6d4', bottom: '#cdbf9e', floor: 0xb8a882 }), sc = H.who({ skin: 0xf2c7a5, shirt: 0xf4f0e6, hair: 0x9a9aa6, coat: 0x3a3a46 }, 'coat', 'greybeard'); st.scene.add(sc);
    const tt = G(M(new THREE.CylinderGeometry(.08, .08, .6, 12), plastic(0xffffff, { transparent: true, opacity: .5 }), { pos: [0, .3, 0] }), M(new THREE.CylinderGeometry(.07, .07, .3, 12), glowM(0x7ad94a, 1), { pos: [0, .15, 0] })); st.scene.add(tt);
    const mol = H.molecule(0x7ad94a); mol.scale.setScalar(2); mol.position.set(-1.0, 3.6, .3); st.scene.add(mol); const lb = hud(st, tag('NICOTINE = HEART POISON', 0xff4a5c, '#ffffff', 3.4, .46), .62, 0, .76);
    return { ...st, update(t, s) { const k = seg(t, .3, .4); sc.pose({ s, handR: reach('point', 1 - k), wide: k, mouth: k * .5, smile: -.3 * k, brow: .7 * k }); const h = sc.localToWorld(reach('point', 1 - k)); tt.position.copy(h).add(V(0, -seg(t, .4, .7) * 1.4, .1)); tt.rotation.z = seg(t, .4, .7) * 2;
      mol.rotation.set(s, s * .7, 0); lb.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.4, 0], 5.6, .3); } };
  };
  BUILD.h05_6 = () => {
    const st = H.room('river', { top: '#bfe3ff', bottom: '#d8e8c8', floor: 0x8ab070 }), dm = H.who({ skin: 0xffd9bd, shirt: 0xff7a59, hair: 0x2a1a12 }); lying(dm, 0, .5); st.scene.add(dm);
    const pm = H.who({ skin: 0xa8714e, shirt: 0x2a5ad8, pants: 0x2a5ad8, hair: 0x15100c }); pm.position.set(0, -.3, -1.2); st.scene.add(pm); const amb = sprite(0xff4a5c, 2, .5); amb.position.set(2.5, 2.5, -3); st.scene.add(amb);
    const lb = hud(st, tag('CPR', 0x3cc85a, '#ffffff', 1.2, .6), .62, 0, .3), ok = hud(st, B.check(true), .62, .3, .14);
    return { ...st, update(t, s) { dm.pose({ s: 0, lean: -Math.PI / 2, squint: 1 }); const push = Math.abs(Math.sin(s * 7)) * .12; pm.pose({ s, sit: 1, knee: 2.9, sitY: -.1, lean: .5, handR: reach([.0, 1.0 - push, 1.3], 1), handL: reach([.0, 1.0 - push, 1.3], 1, -1), smile: .2, brow: .4 });
      amb.material.opacity = frac(s * 1.5) < .5 ? .7 : .2; lb.scale.setScalar(popIn(t, .2)); ok.scale.setScalar(popIn(t, .5)); shoot(st, [5.2 + Math.sin(s * .4) * .3, 3.2, 3.4], [0, 1.0, .2]); } };
  };
}
