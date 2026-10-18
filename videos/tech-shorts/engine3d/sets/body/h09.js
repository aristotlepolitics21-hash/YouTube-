// Weird History of Medicine, episode 9 (cartoon 3D): When Heroin Was Cough Medicine.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit } = B;
  const pharm = { skin: 0xf2c7a5, shirt: 0xf4f0e6, pants: 0x3a2a1a, hair: 0x3a2418, coat: 0x6a3a22 };
  const labelled = (txt, col = 0x8a5a2a, s = 1) => { const b = H.bottle(col, s); const l = B.tag(txt, 0xfff3d6, '#3a2400', .9, .3); l.position.set(0, .3 * s, .21 * s); l.scale.setScalar(.38 * s); b.add(l); return b; };
  const counterTop = st => { const c = M(RB(5, 1.2, 1.0, .05), plastic(0x6a4422), { pos: [0, .6, .2] }); st.scene.add(c); return c; };
  const cough = s => Math.max(0, Math.sin(s * 5)) ** 4;

  BUILD.h09_1 = (p) => {
    const st = H.room('apothecary'); counterTop(st); const ph = H.who(pharm, 'coat'); ph.position.set(.8, 0, -.6); ph.rotation.y = -.4; st.scene.add(ph);
    const mo = H.who({ skin: 0xffd9bd, shirt: 0x6a8a6a, hair: 0xb5652b, hairStyle: 'long' }, 'bonnet'); mo.position.set(-1.0, 0, 1.3); mo.rotation.y = 2.6; st.scene.add(mo); const kid = H.who({ skin: 0xffd9bd, shirt: 0xff7a59, hair: 0xb5652b }); kid.scale.setScalar(.6); kid.position.set(-.4, 0, 1.5); kid.rotation.y = 2.8; st.scene.add(kid);
    const bt = labelled('', 0x8a5a2a, .6); st.scene.add(bt); const ts = hud(st, titleSigns(p.top, p.bottom, 0x8a5a2a), .66, 0, .86);
    return { ...st, update(t, s) { const k = seg(t, .2, .6), h = reach([-.2, 1.9, .9], k); ph.pose({ s, handR: h, poleR: [1, -.6, -.2], smile: .8 }); bt.position.copy(ph.localToWorld(h.clone())).add(V(0, -.1, 0)); mo.pose({ s, smile: .3 }); const c = cough(s); kid.pose({ s, mouth: c * .7, squint: c, headNod: c * .3, handR: reach('mouth', c) });
      ts.update(t, s); orbit(st, s, [0, 2.0, .3], 7.2, .6); } };
  };
  BUILD.h09_2 = () => {
    const st = H.room('apothecary'), c = counterTop(st); const bt = labelled('HEROIN', 0x6a3a1a, 2.0); bt.position.set(0, 1.2, .3); st.scene.add(bt); const lamp = G(M(SPH(.2, 16, 12), glowM(0xffd890, 2.5)), sprite(0xffd890, 3, .6)); lamp.position.set(-1.2, 3.0, .4); st.scene.add(lamp);
    const l1 = hud(st, tag('"HEROISCH"', 0xffffff, '#1d2442', 1.9, .5), .62, -.15, .42), l2 = hud(st, tag('= HEROIC', 0xffd23f, '#3a2400', 1.7, .5), .5, .2, .38);
    return { ...st, update(t, s) { bt.rotation.y = Math.sin(s * .6) * .5; l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .4)); shoot(st, [Math.sin(s * .4) * .6, 2.5, 4.2], [0, 1.9, .3]); } };
  };
  BUILD.h09_3 = () => {
    const st = H.room('candle', { top: '#5a4a3a', bottom: '#a8906a' }), d = B.makeDoctor({ skin: 0xf2c7a5, hair: 0x3a2418 }); d.position.set(.7, 0, 0); d.rotation.y = -.7; st.scene.add(d);
    const pt = H.who({ skin: 0xd9a07a, shirt: 0xf4f0e6, hair: 0x2a1a12 }); pt.position.set(-.7, 0, .3); pt.rotation.y = .7; st.scene.add(pt); const lb = hud(st, tag('IT DID CALM COUGHS', 0x3cc85a, '#ffffff', 2.9, .48), .62, 0, .66);
    return { ...st, update(t, s) { const c = cough(s) * (1 - seg(t, .5, .7)); pt.pose({ s, mouth: c * .7, squint: c, headNod: c * .25, handR: reach('mouth', c), smile: t > .7 ? .6 : 0 }); d.pose({ s, handR: reach([-.25, 1.75, .9], 1), poleR: [1, -.5, -.2], smile: .4, look: [-.5, -.3] });
      lb.scale.setScalar(popIn(t, .55)); orbit(st, s, [0, 2.2, 0], 6.0, .3); } };
  };
  BUILD.h09_4 = () => {
    const st = H.room('apothecary'); counterTop(st); const ph = H.who(pharm, 'coat'); st.scene.add(ph); const a = labelled('HEROIN', 0x6a3a1a, .9), b = labelled('MORPHINE', 0x3a4a6a, .9); st.scene.add(a, b);
    const lb = hud(st, tag('"SAFER" THAN MORPHINE?', 0xffd23f, '#3a2400', 3.4, .48), .62, 0, .74);
    return { ...st, update(t, s) { const hr = reach([.6, 2.3, .6], 1), hl = reach([.6, 2.3, .6], 1, -1); ph.pose({ s, handR: hr, handL: hl, smile: .9, brow: -.3 }); a.position.copy(hr).add(V(0, -.1, .1)); b.position.copy(hl).add(V(0, -.1, .1)); a.rotation.z = Math.sin(s * 2) * .1; b.rotation.z = -Math.sin(s * 2) * .1;
      lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.4, 0], 5.6, .2); } };
  };
  BUILD.h09_5 = () => {
    const st = H.room('candle', { top: '#4a4a52', bottom: '#8a8a92' }), tb = B.table(2.6, 1.2, 0x6a4422); tb.position.set(0, -.3, .8); st.scene.add(tb); const d = B.makeDoctor({ skin: 0xd9a07a, hair: 0x2a1a12 }); d.position.set(0, 0, -.2); st.scene.add(d);
    for (let i = 0; i < 6; i++) st.scene.add(M(RB(.7, .06, .5, .01), matte(0xf4ecd8), { pos: [-.6, .98 + i * .06, .8], rot: [0, (i % 2) * .2, 0] }));
    const pt = H.who({ skin: 0xd8c8b0, shirt: 0x6a6a72, hair: 0x2a1a12 }); pt.position.set(1.6, 0, -1.4); pt.rotation.y = -.5; st.scene.add(pt); const lb = hud(st, tag('ADDICTION', 0xff4a5c, '#ffffff', 1.9, .55), .62, 0, .44);
    return { ...st, update(t, s) { d.pose({ s, smile: -.5, brow: .8, look: [-.3, -.7], handR: reach('chin', 1) }); pt.position.x = 1.6 + Math.sin(s * 30) * .02; pt.pose({ s, squint: .4, smile: -.4, brow: .6, handR: reach('chest', 1), handL: reach('chest', 1, -1) });
      lb.scale.setScalar(popIn(t, .35)); orbit(st, s, [.3, 2.1, 0], 6.4, .3); } };
  };
  BUILD.h09_6 = () => {
    const st = H.room('lab', { top: '#e8e0cc', bottom: '#c8bc9c', floor: 0xb8a882 }), cab = G(M(RB(1.8, 2.4, .8, .05), plastic(0x6a4422), { pos: [0, 1.2, 0] }), M(RB(1.7, 2.2, .05, .02), plastic(0xdff4ff, { transparent: true, opacity: .35 }), { pos: [0, 1.25, .42] })); cab.position.set(-.8, 0, -.6); st.scene.add(cab);
    [0, 1, 2].forEach(i => { const b = labelled('', 0x6a3a1a, .6); b.position.set(-1.3 + i * .5, 1.6, -.5); st.scene.add(b); }); const asp = labelled('ASPIRIN', 0xffffff, 1.0); asp.position.set(1.2, 1.25, .5); st.scene.add(asp); const tb = B.table(1.4, 1.0, 0xd8a878); tb.position.set(1.2, -.1, .5); st.scene.add(tb);
    const of = H.who({ skin: 0xf2c7a5, shirt: 0x2a2f45, hair: 0x1a120c }); of.position.set(.3, 0, .6); of.rotation.y = -.6; st.scene.add(of); const key = M(new THREE.TorusGeometry(.08, .025, 8, 16), metal(0xd4a440)); st.scene.add(key);
    const l1 = hud(st, tag('BANNED 1924', 0xff4a5c, '#ffffff', 2.0, .5), .62, -.2, .44), l2 = hud(st, tag('ASPIRIN', 0x3cc85a, '#ffffff', 1.6, .5), .48, .25, .34);
    return { ...st, update(t, s) { const h = reach([-.4, 1.6, .8], seg(t, .05, .3)); of.pose({ s, handR: h, poleR: [1, -.6, -.2], smile: .3 }); key.position.copy(of.localToWorld(h.clone())); key.rotation.z = seg(t, .3, .45) * 1.6; asp.rotation.y = s;
      l1.scale.setScalar(popIn(t, .3)); l2.scale.setScalar(popIn(t, .6)); orbit(st, s, [0, 1.8, 0], 6.6, .4); } };
  };
}
