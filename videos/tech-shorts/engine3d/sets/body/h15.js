// Weird History of Medicine, episode 15 (cartoon 3D): The Real Snake Oil Salesman.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, counter, check } = B;
  const cowboy = () => { const p = H.who({ skin: 0xf2c7a5, shirt: 0xa83a2a, pants: 0x3a4a6a, hair: 0x6b4a2e }, 'beard'); p.userData.head.add(G(M(new THREE.CylinderGeometry(.42, .5, .45, 24), B.cloth(0xc8a070), { pos: [0, .78, 0] }), M(new THREE.CylinderGeometry(.95, .95, .05, 32), B.cloth(0xc8a070), { pos: [0, .56, 0], scale: [1, 1, .8] }))); return p; };
  const oil = (s = 1) => { const b = H.bottle(0xd8a030, s); const l = B.tag('SNAKE OIL', 0xfff3d6, '#8a2a2a', 1.1, .32); l.position.set(0, .3 * s, .21 * s); l.scale.setScalar(.34 * s); b.add(l); return b; };
  function snake(len = 2.4) { const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push(V(-len / 2 + u * len, 0, Math.sin(u * Math.PI * 3) * .25)); }
    const g = G(M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, .09, 10), plastic(0x8a7a3a, { roughness: .4 }), {}), M(SPH(.14, 16, 12), plastic(0x8a7a3a), { pos: [len / 2 + .05, 0, 0], scale: [1.4, .8, 1] })); return g; }
  const wagon = () => G(M(RB(3.4, .9, 1.6, .05), plastic(0x8a2a2a), { pos: [0, .7, 0] }), ...[-1, 1].map(d => M(new THREE.TorusGeometry(.45, .07, 10, 24), plastic(0x3a2418), { pos: [d * 1.1, .45, .85] })));
  const crowd = (st, n = 4) => Array.from({ length: n }, (_, i) => { const c = H.who({ skin: [0xf2c7a5, 0xd9a07a, 0xa8714e][i % 3], shirt: [0x6a8a6a, 0x5a6280, 0xb07848, 0x8a5a7a][i % 4], hair: [0x2a1a12, 0xb5652b, 0x6b4a2e][i % 3], hairStyle: i % 2 ? 'long' : 'short' }, i % 2 ? 'bonnet' : 'tophat');
    c.position.set(-2.2 + i * 1.45, 0, 2.2 + (i % 2) * .4); c.rotation.y = Math.PI + (i - 1.5) * .15; st.scene.add(c); return c; });

  BUILD.h15_1 = (p) => {
    const st = H.room('west'), wg = wagon(); wg.position.set(0, 0, -.6); st.scene.add(wg); const cs = cowboy(); cs.position.set(0, 1.15, -.6); st.scene.add(cs); const bt = oil(.6); st.scene.add(bt);
    for (let i = 0; i < 5; i++) { const b = oil(.45); b.position.set(-1.3 + i * .25, 1.15, .0); st.scene.add(b); } const ts = hud(st, titleSigns(p.top, p.bottom, 0xd8a030), .66, 0, .86);
    return { ...st, update(t, s) { const h = reach('up', .7 + Math.sin(s * 3) * .3); cs.pose({ s, handR: h, handL: reach([-.6, 1.6, .7], 1, -1), smile: 1, mouth: Math.abs(Math.sin(s * 5)) * .5, bob: 2 }); bt.position.copy(cs.localToWorld(h.clone())).add(V(0, .05, .05)); ts.update(t, s); orbit(st, s, [0, 3.0, -.6], 9.0, .25); } };
  };
  BUILD.h15_2 = () => {
    const st = H.room('west'), pot = G(M(new THREE.SphereGeometry(.8, 32, 16, 0, Math.PI * 2, Math.PI * .35, Math.PI * .65), metal(0x3a3a42, { side: THREE.DoubleSide })), M(new THREE.CylinderGeometry(.66, .66, .04, 32), plastic(0x7a9a3a, { roughness: .2 }), { pos: [0, .35, 0] }));
    pot.position.set(0, .9, .3); st.scene.add(pot); const fire = sprite(0xff8a3a, 2.2, .8); fire.position.set(0, .2, .3); st.scene.add(fire); const sn = snake(1.6); sn.position.set(0, 1.3, .3); st.scene.add(sn);
    const cs = cowboy(); cs.position.set(-1.9, 0, -.2); cs.rotation.y = .6; st.scene.add(cs); const cr = crowd(st, 3); cr.forEach((c, i) => { c.position.set(-.4 + i * 1.3, 0, -1.9); c.rotation.y = (1 - i) * .2; }); const steam = [0, 1, 2, 3].map(() => { const m = sprite(0xffffff, 1.0, .35); st.scene.add(m); return m; });
    const lb = hud(st, tag('BOILED RATTLESNAKES', 0x7a9a3a, '#ffffff', 3.2, .5), .62, 0, .7);
    return { ...st, update(t, s) { sn.position.y = 1.3 + Math.sin(s * 2) * .1; sn.rotation.y = s * .8; fire.scale.setScalar(2.2 + Math.sin(s * 9) * .2); steam.forEach((m, i) => { const u = frac(s * .4 + i / 4); m.position.set(Math.sin(i * 2) * .4, 1.4 + u * 1.6, .3); m.material.opacity = .35 * (1 - u); });
      cs.pose({ s, handR: reach([.9, 1.9, .6], 1), smile: .9, mouth: Math.abs(Math.sin(s * 5)) * .4 }); cr.forEach((c, i) => c.pose({ s: s + i, wide: .7, mouth: .2 })); lb.scale.setScalar(popIn(t, .3)); shoot(st, [.8, 3.4, 7.4], [0, 1.6, -.2]); } };
  };
  BUILD.h15_3 = () => {
    const st = H.room('west', { top: '#ffd9a0', bottom: '#f0b070' }), bt = oil(2.2); bt.position.set(0, 1.0, 0); st.scene.add(bt); const ped = M(new THREE.CylinderGeometry(.8, .9, 1.0, 32), plastic(0x8a2a2a), { pos: [0, .5, 0] }); st.scene.add(ped);
    const ls = [['ACHES', -.3, .62], ['PAINS', .3, .62], ['TOOTHACHE', -.25, .5], ['& MORE!', .3, .5]].map(([txt, x, y], i) => hud(st, tag(txt, i === 3 ? 0xffd23f : 0xffffff, i === 3 ? '#3a2400' : '#8a2a2a', txt.length * .2 + .5, .44), y, x, (txt.length * .2 + .5) * .2));
    return { ...st, update(t, s) { bt.rotation.y = s * .6; ls.forEach((l, i) => l.scale.setScalar(popIn(t, .1 + i * .17))); shoot(st, [Math.sin(s * .4) * .8, 2.4, 7.4], [0, 2.0, 0]); } };
  };
  BUILD.h15_4 = () => {
    const st = H.room('lab'), tb = B.table(3.2, 1.4, 0xd8dce6); tb.position.set(0, -.3, .7); st.scene.add(tb); const bt = oil(.7); bt.position.set(-.5, .95, .8); st.scene.add(bt);
    const tubes = [0, 1, 2].map(i => { const tt = G(M(new THREE.CylinderGeometry(.07, .07, .6, 12, 1, true), plastic(0xffffff, { transparent: true, opacity: .4, side: THREE.DoubleSide })), M(new THREE.CylinderGeometry(.065, .065, .25, 12), plastic([0xd8a030, 0xff4a5c, 0x7a9a3a][i]), { pos: [0, -.15, 0] })); tt.position.set(.4 + i * .3, 1.25, .8); st.scene.add(tt); return tt; });
    const ch = [0, 1].map(i => { const c = H.who({ skin: i ? 0xd9a07a : 0xf2c7a5, shirt: 0xf6f8fb, hair: i ? 0x2a1a12 : 0x9a9aa6 }); c.position.set(-.6 + i * 1.3, 0, -.2); c.rotation.y = i ? -.3 : .3; st.scene.add(c); return c; });
    const lb = hud(st, tag('1917: TESTED', 0x3fa9ff, '#ffffff', 2.2, .54), .62, 0, .5);
    return { ...st, update(t, s) { ch[0].pose({ s, handR: reach([.2, 1.8, .9], 1), squint: .5, look: [.3, -.6] }); ch[1].pose({ s: s + 1, handR: reach([-.2, 1.9, .9], 1), handL: reach('chin', 1, -1), brow: .5, look: [-.3, -.6] }); tubes.forEach((tt, i) => tt.rotation.z = Math.sin(s * 3 + i) * .1);
      lb.scale.setScalar(popIn(t, .2)); orbit(st, s, [0, 1.9, .3], 5.8, .3); } };
  };
  BUILD.h15_5 = () => {
    const st = H.room('lab', { top: '#f4ecd8', bottom: '#e0d0b0' }), items = [
      G(M(SPH(.35, 24, 16), plastic(0xf4e6a0, { transparent: true, opacity: .8, roughness: .05 }), { scale: [1, 1.3, 1] })),
      G(M(RB(.6, .45, .5, .1), plastic(0xfff0e0, { roughness: .6 }))),
      G(M(new THREE.ConeGeometry(.16, .8, 16), plastic(0xe2343c, { clearcoat: 1 }), { rot: [0, 0, Math.PI] }), M(new THREE.CylinderGeometry(.03, .03, .15, 8), plastic(0x3cc85a), { pos: [0, .45, 0] })),
      G(M(RB(.5, .7, .3, .04), metal(0x8a9aa8), {}), M(new THREE.CylinderGeometry(.06, .06, .12, 10), metal(0x6a6a72), { pos: [.12, .4, 0] }))];
    const P = [[-1.1, 3.9], [-1.1, 3.0], [-1.1, 2.1], [-1.1, 1.2]]; items.forEach((it, i) => { it.position.set(P[i][0], P[i][1], 0); st.scene.add(it); });
    const names = ['MINERAL OIL', 'BEEF FAT', 'RED PEPPER', 'TURPENTINE'], ls = names.map((n, i) => { const l = tag(n, 0xffffff, '#1d2442', 1.9, .44); l.position.set(.5, P[i][1], 0); st.scene.add(l); return l; });
    const sn = hud(st, tag('SNAKE', 0x7a9a3a, '#ffffff', 1.4, .48), .62, -.08, .26), x = hud(st, check(false), .62, .14, .12);
    return { ...st, update(t, s) { items.forEach((it, i) => { it.scale.setScalar(popIn(t, .05 + i * .14)); it.rotation.y = s + i; it.position.y = P[i][1] + Math.sin(s * 2 + i) * .06; }); ls.forEach((l, i) => l.scale.setScalar(popIn(t, .1 + i * .14)));
      sn.scale.setScalar(popIn(t, .7)); x.scale.setScalar(popIn(t, .78)); shoot(st, [0, 2.4, 7.6], [0, 2.3, 0]); } };
  };
  BUILD.h15_6 = () => {
    const st = H.room('court'), bench = M(RB(3.4, 1.4, 1.0, .05), plastic(0x6a3a22), { pos: [0, .7, -.8] }); st.scene.add(bench); const j = H.who({ skin: 0xf2c7a5, shirt: 0x1d1d24, hair: 0x9a9aa6 }, 'wig'); j.position.set(0, .6, -1.4); st.scene.add(j);
    const gv = G(M(new THREE.CylinderGeometry(.12, .12, .4, 16), plastic(0x6a3a22), { rot: [0, 0, Math.PI / 2] }), M(new THREE.CylinderGeometry(.03, .03, .5, 8), plastic(0x6a3a22), { pos: [0, -.25, 0] })); st.scene.add(gv);
    const cs = cowboy(); cs.position.set(1.4, 0, .9); cs.rotation.y = -2.6; st.scene.add(cs); const ct = hud(st, tag('$20 FINE', 0x3cc85a, '#ffffff', 1.8, .58), -.2, 0, .4), l2 = hud(st, tag('"SNAKE OIL" = FAKE CURE', 0xd8a030, '#3a2400', 3.6, .46), -.34, 0, .78);
    return { ...st, update(t, s) { const bang = Math.abs(Math.sin(s * 4)) * (1 - seg(t, .3, .4)), h = reach([.5, 2.0 + bang * .4, .7], 1); j.pose({ s, handR: h, brow: -.5, smile: -.2 }); gv.position.copy(j.localToWorld(h.clone())).add(V(0, .2, 0)); cs.pose({ s, smile: -.3, brow: .5, headNod: -.2 });
      ct.scale.setScalar(popIn(t, .2)); l2.scale.setScalar(popIn(t, .5)); shoot(st, [-1.4, 3.0, 5.8], [0, 1.9, -.4]); } };
  };
}
