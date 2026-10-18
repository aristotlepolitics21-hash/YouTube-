// Weird History of Medicine, episode 7 (cartoon 3D): When People Ate Mummies as Medicine.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit } = B;
  const explorer = { skin: 0xf2c7a5, shirt: 0x6a3a22, pants: 0x3a2a1a, hair: 0x3a2418, coat: 0x6a3a22 };
  const noble = { skin: 0xffd9bd, shirt: 0x6a2a6a, pants: 0x3a1a3a, hair: 0xb5652b, coat: 0x6a2a6a };
  const powder = (n = 1) => M(SPH(.2 * n, 20, 12), matte(0x6a4a2a, { roughness: 1 }), { scale: [1, .45, 1] });

  BUILD.h07_1 = (p) => {
    const st = H.room('tomb'), sar = H.sarcophagus(); sar.position.set(0, 0, .2); sar.rotation.y = .2; st.scene.add(sar); const lid = sar.children[1]; const mm = H.mummy(); mm.position.set(0, .95, .2); mm.rotation.y = .2; mm.scale.setScalar(.8); st.scene.add(mm);
    const ex = H.who(explorer, 'ruff', 'beard'); ex.position.set(1.2, 0, -.9); ex.rotation.y = -.7; st.scene.add(ex); const tch = H.candle(2); tch.position.set(-1.6, 2.2, -1.0); st.scene.add(tch); const ts = hud(st, titleSigns(p.top, p.bottom, 0xd4a440), .66, 0, .86);
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .5)); lid.position.set(lerp(0, 1.3, k), 1.05 + k * .4, 0); lid.rotation.z = -k * .5; ex.pose({ s, handR: reach([-.2, 1.6, .9], 1), handL: reach([-.2, 1.6, .9], 1, -1), wide: seg(t, .5, .6), smile: .3 });
      ts.update(t, s); shoot(st, [2.4 + Math.sin(s * .3) * .3, 4.6, 5.0], [0, 1.0, .2]); } };
  };
  BUILD.h07_2 = () => {
    const st = H.room('apothecary'), tb = B.table(3, 1.4, 0x6a4422); tb.position.set(0, -.3, .7); st.scene.add(tb); const mo = H.mortar(); mo.position.set(0, .95, .8); st.scene.add(mo);
    const pw = powder(1.6); pw.position.set(0, 1.25, .8); st.scene.add(pw); const pest = M(new THREE.CapsuleGeometry(.08, .6, 8, 12), plastic(0xa8a8a0)); st.scene.add(pest);
    const ap = H.who({ skin: 0xd9a07a, shirt: 0x5a6a3a, hair: 0x2a1a12 }, 'apron'); ap.position.set(0, 0, -.3); st.scene.add(ap); const lb = hud(st, tag('"MUMIA"', 0x6a4a2a, '#ffffff', 1.7, .55), .62, 0, .4);
    return { ...st, update(t, s) { const a = s * 5, tip = V(Math.cos(a) * .15, 1.15, .8 + Math.sin(a) * .15); ap.pose({ s, handR: tip.clone().add(V(0, .55, -.3)), poleR: [1, -.6, -.2], smile: .7, look: [0, -.8] }); pest.position.copy(tip).add(V(0, .3, -.1)); pest.rotation.x = -.3;
      lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 1.8, .3], 5.4, .6); } };
  };
  BUILD.h07_3 = () => {
    const st = H.room('candle', { top: '#4a2a3a', bottom: '#9a6a5a' }), nb = H.who(noble, 'ruff', 'coat'); st.scene.add(nb); const gb = H.goblet(); st.scene.add(gb); const pw = powder(.3); st.scene.add(pw);
    const l1 = hud(st, tag('BRUISES?', 0xffffff, '#1d2442', 1.6, .44), .62, -.3, .34), l2 = hud(st, tag('HEADACHES?', 0xffffff, '#1d2442', 1.9, .44), .5, .25, .4), l3 = hud(st, tag('MUMMY!', 0x6a4a2a, '#ffffff', 1.5, .5), .36, -.15, .34);
    return { ...st, update(t, s) { const h = reach([.55, 2.0, .65], 1); nb.pose({ s, handR: h, poleR: [1, -.6, -.2], handL: reach([-.05, 2.3, .8], seg(t, .1, .3), -1), smile: .9, squint: .2, look: [.4, -.4] }); gb.position.copy(h).add(V(-.05, -.15, .1));
      const u = frac(s * .7); pw.position.copy(h).add(V(-.4 + u * .3, .8 - u * .5, .1)); pw.scale.setScalar(1 - u); [l1, l2, l3].forEach((l, i) => l.scale.setScalar(popIn(t, .1 + i * .2))); orbit(st, s, [0, 2.4, 0], 5.0, .2); } };
  };
  BUILD.h07_4 = () => {
    const st = H.room('tomb'), sch = H.who({ skin: 0xa8714e, shirt: 0xf4f0e6, hair: 0x15100c }, 'headband', 'greybeard'); st.scene.add(sch); const sc = H.scroll(); sc.scale.setScalar(.6); st.scene.add(sc);
    const jarT = G(M(new THREE.CylinderGeometry(.4, .3, .8, 24), plastic(0xb07848), { pos: [0, .4, 0] }), M(new THREE.CylinderGeometry(.36, .36, .05, 24), plastic(0x0a0a0a, { roughness: .05, clearcoat: 1 }), { pos: [0, .8, 0] })); jarT.position.set(-1.2, 0, .6); st.scene.add(jarT);
    const lb = hud(st, tag('MUMIA = BLACK TAR', 0x1d1d24, '#ffffff', 2.9, .48), .62, 0, .66), q = hud(st, tag('MIX UP?', 0xffd23f, '#3a2400', 1.5, .46), .48, .25, .34);
    return { ...st, update(t, s) { const h = reach([.3, 1.6, .75], 1); sch.pose({ s, handR: h, handL: reach([.3, 1.6, .75], 1, -1), look: [0, -.5], brow: seg(t, .4, .5) * .6, smile: .2 }); sc.position.copy(h).add(V(-.3, .1, .15)); sc.rotation.x = -.3;
      lb.scale.setScalar(popIn(t, .2)); q.scale.setScalar(popIn(t, .55)); orbit(st, s, [-.2, 2.0, 0], 5.6, .3); } };
  };
  BUILD.h07_5 = () => {
    const st = H.room('night'), crate = M(RB(1.2, .8, 1.0, .05), plastic(0x8a5a2a), { pos: [1.3, .4, -.8] }); st.scene.add(crate); const mm = H.mummy(); mm.position.set(0, .45, .4); mm.rotation.y = Math.PI / 2; mm.scale.setScalar(.75); st.scene.add(mm);
    const m = H.who({ skin: 0xd9a07a, shirt: 0x3a3a46, hair: 0x1a120c }, 'beard'); m.position.set(0, 0, -.9); st.scene.add(m); const ln = G(M(SPH(.12, 16, 12), glowM(0xffb040, 3)), sprite(0xffb040, 2, .5)); ln.position.set(-1.4, 2.4, .2); st.scene.add(ln);
    const roll = M(new THREE.CylinderGeometry(.15, .15, .4, 16), matte(0xe8dcbc), {}); st.scene.add(roll); const lb = hud(st, tag('FAKE MUMMIES', 0xff4a5c, '#ffffff', 2.2, .5), .62, 0, .5);
    return { ...st, update(t, s) { const a = s * 2.5, h = V(Math.cos(a) * .4, 1.0 + Math.sin(a) * .2, -.2); m.pose({ s, handR: h, handL: reach([-.2, 1.0, .5], 1, -1), lean: .3, squint: .5, smile: .5, brow: -.6, look: [Math.sin(s * 2) * .8, 0] }); roll.position.copy(m.localToWorld(h.clone()));
      lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 1.3, 0], 5.6, .9); } };
  };
  BUILD.h07_6 = () => {
    const st = H.room('lab', { top: '#f0e8d8', bottom: '#d8ccb4', floor: 0xc8b898 }), cs = G(M(RB(1.4, .5, 3.2, .05), plastic(0x6a4422), { pos: [0, .25, 0] }), M(RB(1.4, 1.2, 3.2, .05), plastic(0xdff4ff, { transparent: true, opacity: .25, roughness: .02, depthWrite: false }), { pos: [0, 1.1, 0], shadow: false }));
    cs.rotation.y = 1.2; st.scene.add(cs); const mm = H.mummy(); mm.scale.setScalar(.7); mm.position.set(0, .75, 0); mm.rotation.y = 1.2; st.scene.add(mm);
    const vs = [0, 1].map(i => { const v = H.who({ skin: [0xffd9bd, 0x7a4a30][i], shirt: [0xff7a59, 0x35c8ef][i], hair: 0x2a1a12, hairStyle: i ? 'long' : 'short' }); v.position.set(-1.0 + i * 2.0, 0, 1.6); v.rotation.y = Math.PI + (i ? .4 : -.4); st.scene.add(v); return v; });
    const lb = hud(st, tag('MUSEUMS, NOT MEDICINE', 0x3cc85a, '#ffffff', 3.2, .48), .62, 0, .72);
    return { ...st, update(t, s) { vs.forEach((v, i) => v.pose({ s: s + i, handR: reach('chin', i ? 1 : 0), smile: .6 })); lb.scale.setScalar(popIn(t, .25)); shoot(st, [-3.4, 3.4, 5.4], [0, 1.2, .3]); } };
  };
}
