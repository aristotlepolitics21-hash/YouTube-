// Weird History of Medicine, episode 14 (cartoon 3D): Why Barber Poles Are Red and White. Kept non-graphic.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit } = B;
  const barber = { skin: 0xf2c7a5, shirt: 0xf4f0e6, pants: 0x3a2a1a, hair: 0x2a1a12 };
  const staff = () => M(new THREE.CylinderGeometry(.06, .06, 1.6, 12), plastic(0xf4f0e6), {});
  const strip = (col, len = 1.2) => M(RB(.16, len, .02, .01), B.cloth(col), {});
  function spiral(turns = 4, col = 0xe2343c) { const pts = []; for (let i = 0; i <= 200; i++) { const u = i / 200, a = u * turns * Math.PI * 2; pts.push(V(Math.cos(a) * .32, -1.3 + u * 2.6, Math.sin(a) * .32)); }
    return M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, .07, 8), B.cloth(col), {}); }
  const shopFront = st => { const w = M(RB(6, 4, .2, .05), plastic(0xd8b88a), { pos: [0, 2, -1.6] }), win = M(RB(2.2, 1.6, .1, .05), glowM(0xfff3c0, .6), { pos: [-1.2, 2.2, -1.45] }), dr = M(RB(1.1, 2.4, .1, .05), plastic(0x6a3a22), { pos: [1.4, 1.2, -1.45] }); st.scene.add(w, win, dr); };

  BUILD.h14_1 = (p) => {
    const st = H.room('street'), bp = H.barberPole(); bp.position.set(0, 2.2, 0); st.scene.add(bp); const ts = hud(st, titleSigns(p.top, p.bottom, 0xe2343c), .66, 0, .86);
    return { ...st, update(t, s) { bp.spin(s); bp.rotation.z = Math.sin(s * .6) * .05; ts.update(t, s); shoot(st, [Math.sin(s * .3) * 1.2, 2.4, 5.4], [0, 2.0, 0]); } };
  };
  BUILD.h14_2 = () => {
    const st = H.room('barber'), b = H.who(barber, 'apron'); st.scene.add(b); const sc = G(M(RB(.06, .5, .02, .01), metal(0xe6eaf2), { pos: [0, .25, 0] }), M(RB(.06, .3, .04, .02), plastic(0x1d1d24), { pos: [0, -.15, 0] })); st.scene.add(sc);
    const tongs = G(M(RB(.04, .7, .04, .02), metal(0x8a8a92), { rot: [0, 0, .12] }), M(RB(.04, .7, .04, .02), metal(0x8a8a92), { rot: [0, 0, -.12] })); st.scene.add(tongs);
    const ls = [['HAIR', 0x3fa9ff, -.35], ['TEETH', 0xffffff, .0], ['BONES', 0xffd23f, .35]].map(([txt, c, x], i) => hud(st, tag(txt, c, '#1d2442', 1.3, .46), .62 - (i % 2) * .1, x, .26)), l4 = hud(st, tag('+ SURGERY', 0xe2343c, '#ffffff', 1.9, .5), .44, 0, .38);
    return { ...st, update(t, s) { const hr = reach('up', .7), hl = reach('up', .7, -1); b.pose({ s, handR: hr, handL: hl, smile: .9, brow: -.3, bob: 2 }); sc.position.copy(b.localToWorld(hr.clone())).add(V(0, .2, .05)); sc.rotation.z = Math.sin(s * 4) * .3; tongs.position.copy(b.localToWorld(hl.clone())).add(V(0, .25, .05));
      ls.forEach((l, i) => l.scale.setScalar(popIn(t, .1 + i * .15))); l4.scale.setScalar(popIn(t, .6)); orbit(st, s, [0, 2.3, 0], 5.6, .2); } };
  };
  BUILD.h14_3 = () => {
    const st = H.room('barber'), ch = B.chair(0x8a2a3a); ch.position.set(-.3, 0, -.15); st.scene.add(ch); const pt = H.who({ skin: 0xd9a07a, shirt: 0x6a8a6a, hair: 0x6b4a2e }); pt.position.set(-.3, -.47, 0); st.scene.add(pt);
    const sf = staff(); st.scene.add(sf); const bw = H.bowl(.8); bw.position.set(.6, .3, .6); st.scene.add(bw); const b = H.who(barber, 'apron'); b.position.set(1.3, 0, -.4); b.rotation.y = -.8; st.scene.add(b);
    const l1 = hud(st, tag('BLOODLETTING', 0xe2343c, '#ffffff', 2.4, .52), .62, 0, .5), l2 = hud(st, tag('SQUEEZE THE POLE', 0xffffff, '#1d2442', 2.8, .44), .48, 0, .6);
    return { ...st, update(t, s) { const sq = .5 + Math.sin(s * 4) * .5, h = reach([.45, 1.6, .7], 1); pt.pose({ s, sit: 1, sitY: 0, handR: h, squint: sq * .6, smile: -.3, brow: .5 }); sf.position.copy(pt.localToWorld(h.clone())); sf.scale.set(1 + sq * .05, 1, 1 + sq * .05);
      b.pose({ s, handR: reach([-.2, 1.6, .9], 1), smile: .5, look: [-.5, -.3] }); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); orbit(st, s, [.2, 2.0, 0], 6.4, .3); } };
  };
  BUILD.h14_4 = () => {
    const st = H.room('street'); shopFront(st); const pole = M(new THREE.CylinderGeometry(.08, .08, 3.2, 12), plastic(0xf4f0e6), { pos: [0, 2.6, .6], rot: [0, 0, Math.PI / 2] }); st.scene.add(pole);
    const brk = M(RB(.15, .15, 1.0, .03), plastic(0x6a3a22), { pos: [-1.5, 2.6, .1] }); st.scene.add(brk);
    const ss = [0, 1, 2, 3, 4, 5, 6].map(i => { const sp = strip(i % 2 ? 0xc0303a : 0xffffff); sp.position.set(-1.2 + i * .4, 2.0, .6); st.scene.add(sp); return sp; });
    const lb = hud(st, tag('SO THE STORY GOES...', 0xffffff, '#1d2442', 3.0, .48), .62, 0, .66), l2 = hud(st, tag('WASHED BANDAGES', 0xe2343c, '#ffffff', 2.6, .44), .5, 0, .58);
    return { ...st, update(t, s) { ss.forEach((sp, i) => { sp.rotation.z = Math.sin(s * 2 + i) * .15; sp.rotation.y = Math.sin(s * 1.3 + i) * .5; sp.position.x = -1.2 + i * .4 + Math.sin(s * 2 + i) * .08; });
      lb.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .4)); shoot(st, [Math.sin(s * .3) * .6, 2.4, 5.2], [0, 2.2, .3]); } };
  };
  BUILD.h14_5 = () => {
    const st = H.room('street'); shopFront(st); const core = M(new THREE.CylinderGeometry(.3, .3, 2.6, 32), plastic(0xffffff, { roughness: .4 }), {}); const sp = spiral(4, 0xe2343c); const pg = G(core, sp); pg.position.set(0, 2.2, .3); st.scene.add(pg);
    const winds = [0, 1, 2].map(i => { const w = M(new THREE.TorusGeometry(.5, .025, 6, 24, Math.PI * .8), plastic(0xffffff, { transparent: true, opacity: .7 }), {}); st.scene.add(w); return w; });
    const lb = hud(st, tag('RED + WHITE', 0xe2343c, '#ffffff', 2.4, .55), .62, 0, .52);
    return { ...st, update(t, s) { const k = ease(seg(t, .05, .6)); sp.scale.y = .1 + k * .9; sp.position.y = -1.3 * (1 - (.1 + k * .9)); pg.rotation.y = s * 1.5;
      winds.forEach((w, i) => { const u = frac(s * .5 + i / 3); w.position.set(-2.4 + u * 4.8, 1.6 + i * .7, .8); w.material.opacity = Math.sin(u * Math.PI) * .7; });
      lb.scale.setScalar(popIn(t, .55)); shoot(st, [0, 2.4, 5.4], [0, 2.2, .3]); } };
  };
  BUILD.h14_6 = () => {
    const st = H.room('street', { top: '#bfe0ff', bottom: '#f4ecd8' }); shopFront(st); const bp = H.barberPole(); bp.position.set(-1.0, 2.2, .2); st.scene.add(bp); const flag = G(...[0, 1, 2, 3, 4, 5, 6].map(i => M(RB(1.2, .1, .02, .005), plastic(i % 2 ? 0xffffff : 0xe2343c), { pos: [0, -i * .1, 0] })), M(RB(.5, .4, .025, .005), plastic(0x2a5ad8), { pos: [-.35, -.15, .005] }));
    flag.position.set(1.4, 3.4, .2); st.scene.add(flag); const b = H.who(barber, 'apron'); b.position.set(.9, 0, .5); b.rotation.y = -.3; st.scene.add(b);
    const l1 = hud(st, tag("THE BARBER'S SIGN", 0xe2343c, '#ffffff', 3.0, .48), .62, 0, .68), l2 = hud(st, tag('+ BLUE IN AMERICA', 0x2a5ad8, '#ffffff', 2.8, .46), .5, 0, .64);
    return { ...st, update(t, s) { bp.spin(s); flag.rotation.y = Math.sin(s * 2) * .2; b.pose({ s, handR: reach('up', seg(t, .1, .2)), smile: 1, look: [-.5, .2] }); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 2.3, 0], 6.4, .3); } };
  };
}
