// Weird History of Medicine, episode 17 (cartoon 3D): The Man Who Lived in an Iron Lung.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, counter, germ, arrow, check, lungs, gauge } = B;
  const breathe = s => (Math.sin(s * 1.6) + 1) / 2;
  function lungBox(o = {}) { const g = H.ironLung(); const p = H.who({ skin: 0xf2c7a5, shirt: 0xf4f0e6, hair: 0x6b4a2e, ...o }); p.rotation.z = Math.PI / 2; p.position.set(1.2, 1.1, 0); g.add(p); g.userData.p = p;
    const cuff = M(new THREE.TorusGeometry(.42, .08, 10, 24), matte(0xf4f0e6), { pos: [-1.08, 1.1, 0], rot: [0, Math.PI / 2, 0] }); g.add(cuff); return g; }
  const typewriter = () => G(M(RB(.9, .25, .6, .06), plastic(0x2a2a32), { pos: [0, .12, 0] }), M(RB(.8, .05, .3, .02), plastic(0xe8e8ee), { pos: [0, .27, .1] }), M(RB(.6, .35, .03, .01), matte(0xffffff), { pos: [0, .45, -.2], rot: [-.3, 0, 0] }));

  BUILD.h17_1 = (p) => {
    const st = H.room('ward', { top: '#c8c0b0', bottom: '#988c78' }), ls = []; for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { const l = lungBox({ skin: [0xf2c7a5, 0xd9a07a, 0xffd9bd][(i + r) % 3], hair: [0x6b4a2e, 0x2a1a12, 0xd9a441][(i + r) % 3] }); l.rotation.y = .15; l.scale.setScalar(.8); l.position.set(-2.4 + i * 3.4 + r * .8, 0, -1.0 - r * 2.6); st.scene.add(l); ls.push(l); }
    const ts = hud(st, titleSigns(p.top, p.bottom, 0xd8c060), .66, 0, .86);
    return { ...st, update(t, s) { ls.forEach((l, i) => l.userData.p.pose({ s: s * .3 + i, headTilt: -1.45, smile: .2, look: [0, .3] })); ts.update(t, s); shoot(st, [-2.4 + Math.sin(s * .3) * .5, 5.0, 8.0], [-.6, 1.0, -2.2]); } };
  };
  BUILD.h17_2 = () => {
    const st = H.room('ward'), l = lungBox(); l.rotation.y = -.5; st.scene.add(l); const gm = germ(0xff4a5c); gm.scale.setScalar(.6); st.scene.add(gm);
    const l1 = hud(st, tag('POLIO', 0xff4a5c, '#ffffff', 1.5, .55), .62, -.22, .3), l2 = hud(st, tag('IT BREATHES FOR YOU', 0x3fa9ff, '#ffffff', 3.2, .48), .48, 0, .7);
    return { ...st, update(t, s) { l.userData.p.pose({ s: s * .3, headTilt: -1.45, smile: .3, look: [.3, .3], mouth: breathe(s) * .2 }); gm.position.set(-1.6, 3.0 + Math.sin(s * 2) * .15, .6); gm.rotation.y = s; gm.scale.setScalar(.6 * (1 - seg(t, .4, .55)));
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .5)); orbit(st, s, [-1.4, 1.6, 0], 6.6, .3); } };
  };
  BUILD.h17_3 = () => {
    const st = H.room('night', { top: '#1a2a4a', bottom: '#3a5a8a' }), lu = lungs(2.0); lu.position.set(0, 2.4, 0); st.scene.add(lu);
    const ars = [-1, 1].map(d => { const a = arrow(0x3fa9ff, .8); a.rotation.z = d * Math.PI / 2; st.scene.add(a); return a; }); const gg = hud(st, gauge('PRESSURE'), .62, 0, .66);
    const l1 = hud(st, tag('CHEST PULLED OPEN', 0x3cc85a, '#ffffff', 3.0, .44), -.3, 0, .64), l2 = hud(st, tag('LET FALL', 0xffd23f, '#3a2400', 1.7, .44), -.3, 0, .36);
    return { ...st, update(t, s) { const b = breathe(s); lu.scale.set(2.0 * (1 + b * .18), 2.0 * (1 + b * .1), 2.0); ars.forEach((a, i) => { const d = i ? 1 : -1, r = 1.9 + b * .5; a.position.set(d * r + d * .9 * (b > .5 ? 0 : 1), 2.4, 0); a.rotation.z = (b > .5 ? -d : d) * Math.PI / 2; });
      gg.set(1 - b); l1.visible = b > .5; l2.visible = b <= .5; l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .1)); gg.scale.setScalar(popIn(t, .05)); shoot(st, [0, 2.4, 7.4], [0, 2.3, 0]); } };
  };
  BUILD.h17_4 = () => {
    const st = H.room('ward', { top: '#d8e4ec', bottom: '#a8bccb' }), l = lungBox({ skin: 0xffd9bd, hair: 0xd9a441 }); l.rotation.y = -.4; st.scene.add(l); l.userData.p.scale.setScalar(.8); l.userData.p.position.set(.75, 1.1, 0);
    const n = H.who({ skin: 0xd9a07a, shirt: 0xf6f8fb, hair: 0x2a1a12, hairStyle: 'long' }, 'apron'); n.position.set(.6, 0, -1.6); n.rotation.y = -.3; st.scene.add(n);
    const l1 = hud(st, tag('1952', 0x1d1d24, '#ffffff', 1.3, .56), .64, 0, .26), l2 = hud(st, tag('PAUL, AGE 6', 0xffd23f, '#3a2400', 2.0, .5), .52, 0, .38);
    return { ...st, update(t, s) { l.userData.p.pose({ s: s * .3, headTilt: -1.45, wide: .5, smile: .1, look: [.4, .3] }); n.pose({ s, handR: reach([.5, 1.6, .9], 1), smile: .6, brow: .4 }); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .3)); orbit(st, s, [-1.4, 1.6, 0], 6.6, .3); } };
  };
  BUILD.h17_5 = () => {
    const st = H.room('lab', { top: '#e8e0cc', bottom: '#c8bc9c', floor: 0xb8a882 }), l = lungBox({ hair: 0x9a9aa6 }); l.rotation.y = -.2; st.scene.add(l); const tw = typewriter(); tw.position.set(-2.5, 1.0, 1.0); tw.rotation.y = Math.PI * .8; st.scene.add(tw);
    const desk = M(RB(.8, 1.0, .8, .04), plastic(0x8a5a2a), { pos: [-2.5, .5, 1.0] }); st.scene.add(desk); const stick = M(new THREE.CylinderGeometry(.02, .02, .7, 8), plastic(0xc8a070), {}); st.scene.add(stick);
    const ls = [['LAWYER', 0x3fa9ff, -.22], ['AUTHOR', 0x3cc85a, .22]].map(([txt, c, x], i) => hud(st, tag(txt, c, '#ffffff', 1.6, .5), .62, x * 1.2, .28)), l3 = hud(st, tag('TYPED WITH A STICK', 0xffffff, '#1d2442', 3.0, .44), .5, 0, .6);
    return { ...st, update(t, s) { const tap = Math.max(0, Math.sin(s * 7)) * .12; l.userData.p.pose({ s: s * .3, headTilt: -1.45, smile: .5, headNod: tap, squint: .3 }); const mp = new THREE.Vector3(); l.userData.p.userData.head.getWorldPosition(mp);
      stick.position.copy(mp).add(V(-.4, -.2 - tap * .5, .55)); stick.rotation.set(Math.PI / 2 - .4, 0, -.7); ls.forEach((x, i) => x.scale.setScalar(popIn(t, .3 + i * .15))); l3.scale.setScalar(popIn(t, .1)); shoot(st, [1.2, 3.0, 5.0], [-1.7, 1.2, .5]); } };
  };
  BUILD.h17_6 = () => {
    const st = H.room('clinic'), vial = G(M(new THREE.CylinderGeometry(.35, .35, .9, 24), plastic(0xdff4ff, { transparent: true, opacity: .6, roughness: .02 }), { pos: [0, .45, 0] }), M(new THREE.CylinderGeometry(.3, .3, .5, 24), glowM(0xffd23f, .8), { pos: [0, .3, 0] }), M(new THREE.CylinderGeometry(.37, .37, .2, 24), plastic(0xff4a5c), { pos: [0, 1.0, 0] }));
    vial.position.set(0, 1.0, 0); vial.scale.setScalar(1.6); st.scene.add(vial); const ped = M(new THREE.CylinderGeometry(.9, 1.0, 1.0, 32), plastic(0xffffff), { pos: [0, .5, 0] }); st.scene.add(ped);
    const ct = hud(st, counter(2.6, .62, k => Math.round(k * 70) + '+ YEARS', '#1d2442'), .62, 0, .62); ct.userData.w = 2.6; const l2 = hud(st, tag('POLIO VACCINE', 0x3cc85a, '#ffffff', 2.6, .5), .48, -.06, .58), ok = hud(st, check(true), .48, .36, .12);
    return { ...st, update(t, s) { vial.rotation.y = s * .6; ct.set(ease(seg(t, .05, .45))); ct.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .5)); ok.scale.setScalar(popIn(t, .6)); shoot(st, [Math.sin(s * .4) * .8, 2.6, 6.4], [0, 2.0, 0]); } };
  };
}
