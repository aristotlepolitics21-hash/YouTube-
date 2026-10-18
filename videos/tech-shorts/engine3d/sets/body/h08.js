// Weird History of Medicine, episode 8 (cartoon 3D): The Energy Drink That Made a Man's Jaw Fall Off.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, counter } = B;
  const RAD = 0x7dff6a;
  const byers = { skin: 0xf2c7a5, shirt: 0x2a2f45, pants: 0x2a2f45, hair: 0x1a120c, coat: 0x2a2f45 };
  const radBottle = s => { const b = H.bottle(0xb8ffb0, s); const glow = sprite(RAD, 1.2 * s, .7); glow.position.y = .3 * s; b.add(M(new THREE.CylinderGeometry(.15, .17, .45, 20), glowM(RAD, 1.8), { pos: [0, .26, 0], shadow: false }), glow); return b; };
  function rays(n = 14) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(M(new THREE.PlaneGeometry(.5, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffe08a : 0xffc44d, transparent: true, opacity: .55, side: THREE.DoubleSide, toneMapped: false }), { rot: [0, 0, i / n * Math.PI * 2], shadow: false })); g.children.forEach((r, i) => r.position.set(Math.sin(-i / n * Math.PI * 2) * 3, Math.cos(i / n * Math.PI * 2) * 3, 0)); return g; }

  BUILD.h08_1 = (p) => {
    const st = H.room('court', { top: '#2a3a4a', bottom: '#6a8a8a', floor: 0x4a5a5a }), b = H.who(byers, 'coat'); st.scene.add(b); const bt = radBottle(.5); st.scene.add(bt); const ts = hud(st, titleSigns(p.top, p.bottom, 0x3cb84a), .66, 0, .86);
    return { ...st, update(t, s) { const dr = seg(t, .1, .3) * (1 - seg(t, .7, .8)), h = reach([.08, 2.35, .78], dr); b.pose({ s, handR: h, poleR: [1, -.6, -.2], headNod: -dr * .2, squint: dr * .5, smile: .7 }); bt.position.copy(h).add(V(-.05, .05, .1)); bt.rotation.z = dr * 1.8;
      ts.update(t, s); orbit(st, s, [0, 2.6, 0], 5.0, .2); } };
  };
  BUILD.h08_2 = () => {
    const st = H.room('night'), tray = M(new THREE.CylinderGeometry(1.0, 1.0, .06, 48), metal(0xd8dce6, { roughness: .1 }), { pos: [0, 1.5, 0] }); st.scene.add(tray); const bt = radBottle(1.4); bt.position.set(0, 1.53, 0); st.scene.add(bt);
    const lb = hud(st, tag('RADITHOR', RAD, '#14320a', 1.9, .6), .62, 0, .45), l2 = hud(st, tag('WATER + RADIUM', 0xffffff, '#1d2442', 2.4, .44), .48, 0, .55);
    return { ...st, update(t, s) { bt.rotation.y = s * .6; tray.rotation.y = s * .2; lb.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [Math.sin(s * .4) * .8, 2.6, 3.6], [0, 2.0, 0]); } };
  };
  BUILD.h08_3 = () => {
    const st = H.room('greek', { top: '#ffd070', bottom: '#ffb050', floor: 0xe89a40 }); st.scene.children.filter(c => c.isMesh && c.geometry.type === 'CylinderGeometry').forEach(c => c.visible = false);
    const rs = rays(); rs.position.set(0, 2.6, -2.5); st.scene.add(rs); const b = H.who({ ...byers, shirt: 0xf4f0e6 }); b.position.x = -.8; st.scene.add(b); const bt = radBottle(3.0); bt.position.set(1.0, 0, 0); st.scene.add(bt);
    const ct = hud(st, counter(2.6, .66, k => Math.round(k * 1400).toLocaleString('en-US') + ' BOTTLES', '#1d2442'), .62, 0, .62); ct.userData.w = 2.6;
    return { ...st, update(t, s) { b.pose({ s, handR: reach('up', seg(t, .05, .2)), handL: reach('up', seg(t, .05, .2), -1), smile: .9, squint: .3 }); rs.rotation.z = s * .2; ct.set(ease(seg(t, .2, .9))); ct.scale.setScalar(popIn(t, .15)); orbit(st, s, [0, 2.2, 0], 6.6, .3); } };
  };
  BUILD.h08_4 = () => {
    const st = H.room('night'), b = H.who(byers); st.scene.add(b); b.xray(1); const I = b.userData.inner, bm = glowM(RAD, 1.4);
    [[[0, 2.1, 0], [0, 1.0, 0]], [[-.24, 1.0, 0], [-.24, .1, .05]], [[.24, 1.0, 0], [.24, .1, .05]], [[-.56, 1.95, 0], [-.62, .95, .05]], [[.56, 1.95, 0], [.62, .95, .05]], [[-.5, 1.85, 0], [.5, 1.85, 0]]].forEach(([a, c]) => { const m = M(new THREE.CylinderGeometry(.06, .06, 1, 10), bm, { shadow: false }); B.link(m, V(...a), V(...c), 1); m.userData.xr = false; I.add(m); });
    const sk = H.skull(.95, false); sk.position.set(0, 2.7, 0); sk.traverse(c => { if (c.material) { c.material = glowM(RAD, 1.0); c.userData.xr = false; } }); I.add(sk);
    const lb = hud(st, tag('RADIUM ACTS LIKE CALCIUM', RAD, '#14320a', 3.6, .46), .62, 0, .78), l2 = hud(st, tag('IT STAYS IN YOUR BONES', 0xffffff, '#1d2442', 3.4, .44), .48, 0, .74);
    return { ...st, update(t, s) { b.xray(1); b.pose({ s, smile: .1 }); bm.emissiveIntensity = 1.2 + Math.sin(s * 4) * .4; lb.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 1.8, 0], 6.2, .4); } };
  };
  BUILD.h08_5 = () => {
    const st = H.room('ward'), bd = B.bed(); st.scene.add(bd); const b = H.who({ ...byers, skin: 0xd8d0c0, shirt: 0xf4f0e6 }); b.position.set(0, 1.25, 1.3); st.scene.add(b);
    const band = M(new THREE.TorusGeometry(.45, .14, 12, 32), plastic(0xffffff), { pos: [0, -.32, .1], rot: [Math.PI / 2 - .3, 0, 0], scale: [1, 1.1, 1] }); b.userData.head.add(band);
    const d = B.makeDoctor({ skin: 0xf2c7a5, hair: 0x9a9aa6 }); d.position.set(-1.6, 0, -.6); d.rotation.y = .7; st.scene.add(d); const yr = hud(st, tag('1932', 0x1d1d24, '#ffffff', 1.3, .6), .62, 0, .32);
    return { ...st, update(t, s) { b.pose({ s, lean: -Math.PI / 2, smile: -.4, brow: .6, headTurn: .3 }); d.pose({ s, smile: -.4, brow: .7, handR: reach('chin', 1) }); yr.scale.setScalar(popIn(t, .3)); shoot(st, [2.4, 4.6, 5.2], [0, 1.6, -.2]); } };
  };
  BUILD.h08_6 = () => {
    const st = H.room('street'), m = H.who({ skin: 0xd9a07a, shirt: 0x6a5a4a, hair: 0x2a1a12 }, 'tophat'); st.scene.add(m); const np = H.newspaper('RADIUM DRINK KILLS'); np.scale.setScalar(.6); st.scene.add(np);
    const lb = hud(st, tag('STRONGER MEDICINE LAWS', 0x3cc85a, '#ffffff', 3.4, .46), .62, 0, .76);
    return { ...st, update(t, s) { const h = reach([.3, 1.9, .75], 1); m.pose({ s, handR: h, handL: reach([.3, 1.9, .75], 1, -1), wide: seg(t, .2, .3), mouth: seg(t, .2, .3) * .5, look: [0, -.4] }); np.position.copy(h).add(V(-.3, .1, .2));
      lb.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.4, 0], 5.0, .2); } };
  };
}
