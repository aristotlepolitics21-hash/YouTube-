// Weird History of Medicine, episode 10 (cartoon 3D): When Kids Got Cocaine for Toothache.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, spray } = B;
  const child = { skin: 0xffd9bd, shirt: 0x5b8cff, hair: 0xd9a441, eye: 0x3b6fb0 };
  function scarfKid() { const k = H.who(child); k.userData.head.add(M(new THREE.TorusGeometry(.66, .09, 10, 40), H.B.cloth(0xffffff), { pos: [0, -.05, -.05] }), M(SPH(.12, 12, 10), H.B.cloth(0xffffff), { pos: [0, .7, .05] })); return k; }
  function dropper() { return G(M(new THREE.CylinderGeometry(.03, .015, .5, 10), plastic(0xffffff, { transparent: true, opacity: .6 }), { pos: [0, -.25, 0] }), M(SPH(.08, 12, 8), plastic(0xff4a5c), { pos: [0, .03, 0], scale: [1, 1.3, 1] })); }
  const ad = () => H.card(1.6, 1.2, (x, w, h) => { x.fillStyle = '#fff3d6'; x.fillRect(0, 0, w, h); label(x, 'TOOTHACHE DROPS', w / 2, h * .14, h * .11, '#8a2a2a', 900); [.3, .7].forEach(c => { x.fillStyle = '#ffd9bd'; x.beginPath(); x.arc(w * c, h * .55, h * .2, 0, 7); x.fill(); x.strokeStyle = '#3a2400'; x.lineWidth = 6; x.beginPath(); x.arc(w * c, h * .58, h * .1, .2, Math.PI - .2); x.stroke(); });
    label(x, 'INSTANT CURE!', w / 2, h * .88, h * .1, '#1d2442', 900); }, { color: 0xfff3d6 });

  BUILD.h10_1 = (p) => {
    const st = H.room('cottage'), tb = B.table(3, 1.4, 0xb07848); tb.position.set(0, -.4, .9); st.scene.add(tb); const k = scarfKid(); k.position.set(0, 0, -.2); st.scene.add(k); const ts = hud(st, titleSigns(p.top, p.bottom, 0x5b8cff), .66, 0, .86);
    return { ...st, update(t, s) { k.pose({ s, puff: .6, smile: -.6, brow: .8, squint: .3, handR: reach('cheek', seg(t, .2, .4)), headTilt: .15 }); k.userData.cheeks[1].scale.multiplyScalar(1.5); ts.update(t, s); orbit(st, s, [0, 2.3, 0], 5.0, .2); } };
  };
  BUILD.h10_2 = () => {
    const st = H.room('apothecary'), c = M(RB(5, 1.2, 1.0, .05), plastic(0x6a4422), { pos: [0, .6, .2] }); st.scene.add(c); const a = ad(); a.position.set(-.7, 2.0, .3); a.rotation.z = .05; st.scene.add(a);
    const box = G(M(RB(.7, .4, .4, .04), plastic(0xff8ad0), { pos: [0, .2, 0] }), M(RB(.4, .2, .02, .01), matte(0xfff3d6), { pos: [0, .22, .21] })); box.position.set(.8, 1.2, .3); st.scene.add(box); const bt = H.bottle(0x8a5a2a, .7); bt.position.set(1.3, 1.2, .3); st.scene.add(bt);
    const lb = hud(st, tag('SOLD TO PARENTS', 0xff8ad0, '#ffffff', 2.6, .5), .62, 0, .6);
    return { ...st, update(t, s) { a.scale.setScalar(popIn(t, .05)); box.rotation.y = Math.sin(s) * .3; lb.scale.setScalar(popIn(t, .35)); shoot(st, [Math.sin(s * .4) * .5, 2.4, 4.6], [0, 1.8, .2]); } };
  };
  BUILD.h10_3 = () => {
    const st = H.room('candle', { top: '#5a4a3a', bottom: '#a8906a' }), pt = H.who({ skin: 0xd9a07a, shirt: 0xf4f0e6, hair: 0x2a1a12 }); pt.position.set(-.5, -.45, 0); pt.rotation.y = .5; st.scene.add(pt); const ch = B.chair(0x6a4422); ch.position.set(-.5, 0, -.15); ch.rotation.y = .5; st.scene.add(ch);
    const sg = H.who({ skin: 0xf2c7a5, shirt: 0x2a2f45, hair: 0x6b4a2e, coat: 0x2a2f45 }, 'coat', 'beard'); sg.position.set(.8, 0, -.4); sg.rotation.y = -.7; st.scene.add(sg); const dp = dropper(); st.scene.add(dp); const drop = M(SPH(.04, 10, 8), plastic(0xbfe9ff)); st.scene.add(drop);
    const lb = hud(st, tag('1884: EYE SURGERY', 0xffffff, '#1d2442', 2.6, .48), .62, 0, .6), l2 = hud(st, tag('FIRST LOCAL ANAESTHETIC', 0x3cc85a, '#ffffff', 3.4, .44), .48, 0, .72);
    return { ...st, update(t, s) { pt.pose({ s, sit: 1, sitY: 0, headNod: -.4, wide: .6, smile: .2 }); const eye = new THREE.Vector3(); pt.userData.eyes[1].getWorldPosition(eye); const h = sg.worldToLocal(eye.clone().add(V(0, .55, .1)));
      sg.pose({ s, handR: h, poleR: [1, -.6, -.2], smile: .4, look: [-.4, -.6] }); dp.position.copy(eye).add(V(0, .5, .05)); const u = frac(s * .8); drop.position.copy(eye).add(V(0, .22 - u * .2, .05)); drop.visible = u < .9;
      lb.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.0, 0], 5.6, .4); } };
  };
  BUILD.h10_4 = () => {
    const st = H.room('candle'), bar = M(RB(5, 1.2, 1.0, .05), plastic(0x6a3a22), { pos: [0, .6, .8] }); st.scene.add(bar); const m = H.who({ skin: 0xf2c7a5, shirt: 0x8a2a3a, hair: 0x3a2418 }, 'tophat'); st.scene.add(m);
    const gl = B.glass(.7, 0xc8a050); gl.scale.setScalar(.6); st.scene.add(gl); const bub = [0, 1, 2, 3].map(() => { const b = M(SPH(.03, 8, 6), plastic(0xffffff)); st.scene.add(b); return b; });
    const l1 = hud(st, tag('WINES', 0x8a2a3a, '#ffffff', 1.3, .46), .62, -.45, .26), l2 = hud(st, tag('TONICS', 0xc8a050, '#ffffff', 1.4, .46), .62, .12, .28), l3 = hud(st, tag('SOFT DRINKS', 0x3fa9ff, '#ffffff', 2.0, .46), .5, .1, .42);
    return { ...st, update(t, s) { const h = reach([.6, 2.0, .6], 1); m.pose({ s, handR: h, poleR: [1, -.6, -.2], wide: .8, smile: 1, bob: 3, handL: reach('up', Math.abs(Math.sin(s * 3))) }); gl.position.copy(h).add(V(0, -.2, .1)); bub.forEach((b, i) => { const u = frac(s + i / 4); b.position.copy(gl.position).add(V(Math.sin(i * 2) * .06, .1 + u * .35, 0)); });
      [l1, l2, l3].forEach((l, i) => l.scale.setScalar(popIn(t, .1 + i * .2))); orbit(st, s, [0, 2.4, 0], 5.4, .2); } };
  };
  BUILD.h10_5 = () => {
    const st = H.room('candle', { top: '#3a3a42', bottom: '#7a7a82' }), d = H.who({ skin: 0xf2c7a5, shirt: 0x2a2f45, hair: 0x9a9aa6, coat: 0x2a2f45 }, 'coat', 'greybeard'); d.position.set(.9, 0, -.3); d.rotation.y = -.6; st.scene.add(d);
    const pt = H.who({ skin: 0xd8c8b0, shirt: 0x6a6a72, hair: 0x2a1a12 }); pt.position.set(-.6, 0, .2); pt.rotation.y = .5; st.scene.add(pt); const lb = hud(st, tag('HIGHLY ADDICTIVE', 0xff4a5c, '#ffffff', 2.7, .5), .62, 0, .62);
    return { ...st, update(t, s) { d.pose({ s, headTurn: Math.sin(s * 5) * .3, smile: -.4, brow: .7 }); pt.position.x = -.6 + Math.sin(s * 35) * .02; pt.pose({ s, wide: .8, squint: 0, smile: -.2, brow: .5, handR: reach('chest', 1), handL: reach('chest', 1, -1) });
      lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.2, 0], 6.0, .3); } };
  };
  BUILD.h10_6 = () => {
    const st = H.room('clinic'), ch = G(M(RB(1.2, .3, 2.2, .1), plastic(0x3fa9ff), { pos: [0, .9, 0], rot: [-.3, 0, 0] }), M(new THREE.CylinderGeometry(.15, .25, .8, 16), metal(0xc8ccd8), { pos: [0, .4, 0] })); st.scene.add(ch);
    const k = H.who({ ...child, shirt: 0xff7a59 }); k.scale.setScalar(.75); k.position.set(0, .55, .2); st.scene.add(k); const dn = H.who({ skin: 0x7a4a30, shirt: 0xf6f8fb, hair: 0x15100c }, 'mask'); dn.position.set(1.2, 0, -.3); dn.rotation.y = -.8; st.scene.add(dn);
    const lamp = G(M(new THREE.CylinderGeometry(.5, .35, .2, 24), plastic(0xe8eef4)), M(new THREE.CircleGeometry(.35, 24), glowM(0xffffff, 2), { pos: [0, -.11, 0], rot: [Math.PI / 2, 0, 0] })); lamp.position.set(-.3, 3.8, .8); st.scene.add(lamp);
    const lb = hud(st, tag('LIDOCAINE', 0x3cc85a, '#ffffff', 1.8, .55), .62, -.1, .42), ok = hud(st, B.check(true), .62, .3, .14);
    return { ...st, update(t, s) { k.pose({ s, sit: .6, sitY: .55, smile: .9, look: [.6, .2] }); dn.pose({ s, handR: reach([-.25, 2.0, .9], 1), poleR: [1, -.6, -.2], squint: .3 }); lb.scale.setScalar(popIn(t, .2)); ok.scale.setScalar(popIn(t, .5)); orbit(st, s, [.3, 2.0, 0], 5.8, .5); } };
  };
}
