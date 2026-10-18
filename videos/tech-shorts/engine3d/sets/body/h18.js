// Weird History of Medicine, episode 18 (cartoon 3D): The Baby Syrup With a Deadly Secret. Kept non-graphic.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, check, warnSign } = B;
  const syrup = (s = 1, txt = 'SOOTHING SYRUP') => { const b = H.bottle(0x6a3a5a, s); const l = B.tag(txt, 0xfff3d6, '#6a2a4a', 1.2, .34); l.position.set(0, .3, .21); l.scale.setScalar(.3); b.add(l); return b; };
  function crib() { const g = G(M(RB(1.6, .12, 1.0, .03), plastic(0xf4f0e6), { pos: [0, .7, 0] }), M(RB(1.5, .15, .9, .06), matte(0xbfe0ff), { pos: [0, .8, 0] }));
    [-1, 1].forEach(d => { g.add(M(RB(.08, 1.2, 1.0, .03), plastic(0xf4f0e6), { pos: [d * .8, .6, 0] })); for (let i = 0; i < 6; i++) g.add(M(new THREE.CylinderGeometry(.025, .025, .5, 8), plastic(0xf4f0e6), { pos: [-.62 + i * .25, 1.0, d * .48] })); }); return g; }
  function baby() { const b = H.who({ skin: 0xffd9bd, shirt: 0xbfe0ff, pants: 0xbfe0ff, hair: 0xd9a441, hairStyle: 'bald' }); b.scale.setScalar(.32); return b; }
  const zs = (st, n = 3) => Array.from({ length: n }, () => { const z = tag('Z', 0xffffff, '#1d2442', .5, .5); st.scene.add(z); return z; });
  const zUpdate = (zz, p, s) => zz.forEach((z, i) => { const u = frac(s * .4 + i / zz.length); z.position.copy(p).add(V(.2 + u * .5, .3 + u * 1.0, 0)); z.scale.setScalar(.4 + u * .5); });
  const headPos = p => { const v = new THREE.Vector3(); p.userData.head.getWorldPosition(v); return v; };

  BUILD.h18_1 = (p) => {
    const st = H.room('night', { top: '#1a1a3a', bottom: '#4a3a6a' }), cr = crib(); st.scene.add(cr); const bb = baby(); bb.position.set(0, .85, .05); st.scene.add(bb);
    const ps = [-1, 1].map((d, i) => { const q = H.who({ skin: i ? 0xd9a07a : 0xffd9bd, shirt: i ? 0x6a8ab0 : 0xc88ab0, hair: i ? 0x2a1a12 : 0xb5652b, hairStyle: i ? 'short' : 'long' }, i ? 'tophat' : 'bonnet'); q.position.set(d * 1.6, 0, -.5); q.rotation.y = -d * .5; st.scene.add(q); return q; });
    const cn = H.candle(1.6); cn.position.set(1.0, 1.6, -1.6); st.scene.add(cn); const ts = hud(st, titleSigns(p.top, p.bottom, 0x6a3a5a), .66, 0, .86);
    return { ...st, update(t, s) { bb.pose({ s, mouth: .6 + Math.sin(s * 8) * .3, squint: 1, brow: .9, handR: reach('up', .5 + Math.sin(s * 6) * .5), handL: reach('up', .5 + Math.cos(s * 6) * .5, -1) });
      ps.forEach((q, i) => q.pose({ s: s * .5 + i, squint: .7, smile: -.5, brow: .8, headNod: .2, handR: reach('cheek', i ? 1 : 0), handL: reach('cheek', i ? 0 : 1, -1) })); ts.update(t, s); orbit(st, s, [0, 1.8, 0], 6.4, .2); } };
  };
  BUILD.h18_2 = () => {
    const st = H.room('cottage'), ad = H.card(1.8, 2.4, (x, w, h) => { x.fillStyle = '#fff3d6'; x.fillRect(0, 0, w, h); label(x, "MRS WINSLOW'S", w / 2, h * .1, h * .065, '#6a2a4a', 900); label(x, 'SOOTHING SYRUP', w / 2, h * .19, h * .07, '#6a2a4a', 900);
      x.fillStyle = '#ffd9bd'; x.beginPath(); x.arc(w / 2, h * .5, h * .14, 0, 7); x.fill(); x.strokeStyle = '#3a2400'; x.lineWidth = 6; [-1, 1].forEach(d => { x.beginPath(); x.arc(w / 2 + d * h * .05, h * .48, h * .025, 0, Math.PI); x.stroke(); }); x.fillStyle = '#ffd23f'; x.beginPath(); x.arc(w * .8, h * .32, h * .06, 0, 7); x.fill();
      label(x, 'FOR TEETHING', w / 2, h * .76, h * .06, '#1d2442', 900); label(x, 'A PEACEFUL NIGHT!', w / 2, h * .87, h * .06, '#8a2a2a', 900); }, { color: 0xfff3d6 });
    ad.position.set(0, 2.2, 0); st.scene.add(ad); const bt = syrup(.9); bt.position.set(1.4, 1.0, .6); st.scene.add(bt); const tb = B.table(1.4, 1.0, 0xb07848); tb.position.set(1.4, -.4, .6); st.scene.add(tb);
    const lb = hud(st, tag('SOLD FOR TEETHING', 0xc88ab0, '#ffffff', 2.9, .48), .62, 0, .66);
    return { ...st, update(t, s) { ad.scale.setScalar(popIn(t, .05)); ad.rotation.y = Math.sin(s * .5) * .15; bt.rotation.y = s; lb.scale.setScalar(popIn(t, .4)); shoot(st, [Math.sin(s * .3) * .8, 2.4, 5.4], [.3, 2.0, 0]); } };
  };
  BUILD.h18_3 = () => {
    const st = H.room('night', { top: '#2a1a2a', bottom: '#6a3a5a' }), bt = syrup(2.4); bt.position.set(0, .6, 0); st.scene.add(bt); const ped = M(new THREE.CylinderGeometry(.8, .9, .6, 32), plastic(0x3a2a3a), { pos: [0, .3, 0] }); st.scene.add(ped);
    const ws = hud(st, warnSign(), .62, -.28, .2), lb = hud(st, tag('MORPHINE', 0xff4a5c, '#ffffff', 2.0, .6), .62, .12, .44);
    return { ...st, update(t, s) { bt.rotation.y = Math.sin(s * .6) * .4; ws.scale.setScalar(popIn(t, .3)); lb.scale.setScalar(popIn(t, .25)); shoot(st, [Math.sin(s * .4) * .6, 2.2, 5.6], [0, 1.8, 0]); } };
  };
  BUILD.h18_4 = () => {
    const st = H.room('night', { top: '#1a1a3a', bottom: '#3a3a6a' }), cr = crib(); st.scene.add(cr); const bb = baby(); bb.position.set(0, .9, .45); st.scene.add(bb); const zz = zs(st);
    const l1 = hud(st, tag('VERY SLEEPY', 0x3fa9ff, '#ffffff', 2.2, .5), .62, 0, .5), l2 = hud(st, tag('TOO MUCH = DANGER', 0xff4a5c, '#ffffff', 3.0, .5), .48, 0, .66), ws = hud(st, warnSign(), -.3, 0, .18);
    return { ...st, update(t, s) { bb.pose({ s: s * .2, lean: -Math.PI / 2, squint: 1, smile: .3, headTurn: .3 }); zUpdate(zz, headPos(bb), s); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .5)); ws.scale.setScalar(popIn(t, .55)); shoot(st, [1.4 + Math.sin(s * .3) * .3, 3.6, 3.2], [0, .9, 0]); } };
  };
  BUILD.h18_5 = () => {
    const st = H.room('court'), d = H.who({ skin: 0xf2c7a5, shirt: 0x2a2f45, hair: 0x9a9aa6, coat: 0x2a2f45 }, 'coat', 'greybeard'); st.scene.add(d); const np = H.newspaper('"BABY KILLER"'); np.scale.setScalar(.65); st.scene.add(np);
    const lb = hud(st, tag('1911: AMA REPORT', 0x1d1d24, '#ffffff', 2.7, .5), .62, 0, .6);
    return { ...st, update(t, s) { const h = reach([.3, 1.9, .75], 1); d.pose({ s, handR: h, handL: reach([.3, 1.9, .75], 1, -1), brow: .8, smile: -.6, look: [0, -.3] }); np.position.copy(h).add(V(-.3, .1, .2)); lb.scale.setScalar(popIn(t, .25)); orbit(st, s, [0, 2.4, 0], 5.0, .2); } };
  };
  BUILD.h18_6 = () => {
    const st = H.room('clinic'), bt = syrup(1.8, 'NO MORPHINE'); bt.position.set(-.6, .9, 0); st.scene.add(bt); const ped = M(new THREE.CylinderGeometry(.8, .9, .9, 32), plastic(0xffffff), { pos: [-.6, .45, 0] }); st.scene.add(ped);
    const m = H.who({ skin: 0x7a4a30, shirt: 0xff8ad0, hair: 0x15100c, hairStyle: 'long' }); m.position.set(1.1, 0, .2); m.rotation.y = -.4; st.scene.add(m); const bb = baby(); st.scene.add(bb);
    const l1 = hud(st, tag('LAWS CHANGED', 0x3cc85a, '#ffffff', 2.4, .5), .62, 0, .5), l2 = hud(st, tag('BETTER LABELS', 0xffffff, '#1d2442', 2.4, .44), .5, -.06, .5), ok = hud(st, check(true), .5, .32, .12);
    return { ...st, update(t, s) { const h = reach([-.05, 1.6, .7], 1); m.pose({ s, handR: h, handL: reach([.05, 1.6, .7], 1, -1), smile: .9, look: [0, -.5] }); bb.position.copy(m.localToWorld(h.clone())).add(V(0, -.25, 0)); bb.rotation.y = -.4; bb.pose({ s, smile: 1, squint: .3 });
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .4)); ok.scale.setScalar(popIn(t, .5)); orbit(st, s, [.4, 2.0, 0], 7.2, .3); } };
  };
}
