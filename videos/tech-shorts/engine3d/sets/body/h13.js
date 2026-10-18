// Weird History of Medicine, episode 13 (cartoon 3D): The Doctor Who Told Everyone to Wash Their Hands.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, germ, arrow } = B;
  const ignaz = { skin: 0xf2c7a5, shirt: 0x2a2f45, pants: 0x2a2f45, hair: 0x3a2418, coat: 0x2a2f45 };
  const doc = (i) => H.who({ skin: [0xf2c7a5, 0xd9a07a, 0xffd9bd][i % 3], shirt: [0x3a3a46, 0x4a2a2a, 0x2a3a4a][i % 3], pants: 0x2a2a32, hair: [0x9a9aa6, 0x2a1a12, 0x6b4a2e][i % 3], coat: [0x3a3a46, 0x4a2a2a, 0x2a3a4a][i % 3] }, 'coat', i % 2 ? 'greybeard' : 'beard');
  const handGerms = (st, n = 3) => Array.from({ length: n }, (_, i) => { const g = germ(0x7ad94a); g.scale.setScalar(.25); st.scene.add(g); return g; });
  const handPos = (p, side = 1) => { const v = new THREE.Vector3(); p.userData.arms[side > 0 ? 0 : 1].userData.el.children[1].getWorldPosition(v); return v; };
  const sign = (txt, bg, fg) => H.card(1.8, .5, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); label(x, txt, w / 2, h * .55, h * .5, fg, 900); }, { color: 0xffffff });

  BUILD.h13_1 = (p) => {
    const st = H.room('ward', { top: '#5a5a6a', bottom: '#9a9aa8' }), ws = [-1, 1].map((d, i) => { const bd = B.bed(); bd.position.set(d * 1.6, 0, -.4); bd.scale.setScalar(.75); st.scene.add(bd);
      const w = H.who({ skin: i ? 0xd9a07a : 0xffd9bd, shirt: 0xf4f0e6, hair: i ? 0x2a1a12 : 0xb5652b, hairStyle: 'long' }); w.scale.setScalar(.75); w.position.set(d * 1.6, .95, .55); st.scene.add(w); return w; });
    const ts = hud(st, titleSigns(p.top, p.bottom, 0x5a6280), .66, 0, .9);
    return { ...st, update(t, s) { ws.forEach((w, i) => w.pose({ s: s * .3 + i, lean: -Math.PI / 2, squint: .6, brow: .7, smile: -.4, headTurn: (i ? -1 : 1) * .3 })); ts.update(t, s); shoot(st, [0, 4.4, 8.0], [0, 1.2, 0]); } };
  };
  BUILD.h13_2 = () => {
    const st = H.room('ward'), door = G(M(RB(1.6, 3.0, .12, .05), plastic(0x6a4422), { pos: [0, 1.5, 0] })); const sg = sign('AUTOPSY ROOM', '#1d1d24', '#ffffff'); sg.position.set(0, 3.4, .1); door.add(sg); door.position.set(-2.0, 0, -2.6); st.scene.add(door);
    const ds = [0, 1, 2].map(i => { const d = doc(i); st.scene.add(d); return d; }), gs = handGerms(st, 6), ig = H.who(ignaz, 'coat', 'beard'); ig.position.set(2.0, 0, .6); ig.rotation.y = -1.0; st.scene.add(ig);
    const lb = hud(st, tag('STRAIGHT FROM AUTOPSIES', 0x7ad94a, '#14320a', 3.6, .46), .62, 0, .78);
    return { ...st, update(t, s) { ds.forEach((d, i) => { const u = clamp(t * 1.1 - i * .12); d.position.set(lerp(-2.0, .6, u) - i * .3, 0, lerp(-2.2, .4, u) + i * .5); d.rotation.y = .9; d.pose({ s: s + i, walk: s * 5 + i, smile: .4, handR: reach('chest', .5) });
        [0, 1].forEach(k => { const g = gs[i * 2 + k]; g.position.copy(handPos(d, k ? -1 : 1)).add(V(0, .12, 0)); g.rotation.y = s * 2 + k; }); });
      ig.pose({ s, brow: .6, squint: .4, look: [-.6, 0], handR: reach('chin', 1) }); lb.scale.setScalar(popIn(t, .25)); shoot(st, [1.0, 3.8, 9.6], [0, 1.8, -.6]); } };
  };
  BUILD.h13_3 = () => {
    const st = H.room('ward'), stand = M(new THREE.CylinderGeometry(.15, .25, 1.4, 16), plastic(0x6a4422), { pos: [0, .7, .6] }); st.scene.add(stand); const bw = H.bowl(1.6); bw.position.set(0, 1.62, .6); st.scene.add(bw);
    const water = M(new THREE.CylinderGeometry(.58, .58, .04, 32), plastic(0x9fd8ff, { transparent: true, opacity: .8 }), { pos: [0, 1.55, .6] }); st.scene.add(water);
    const d = doc(0); d.position.set(0, 0, -.4); st.scene.add(d); const gs = handGerms(st, 4); const bub = [0, 1, 2, 3, 4].map(() => { const b = M(SPH(.06, 10, 8), plastic(0xffffff, { transparent: true, opacity: .8 })); st.scene.add(b); return b; });
    const lb = hud(st, tag('1847: CHLORINATED LIME', 0x3fa9ff, '#ffffff', 3.4, .48), .62, 0, .74);
    return { ...st, update(t, s) { const w = Math.sin(s * 6) * .08; d.pose({ s, handR: reach([.12 + w, 1.75, .95], 1), handL: reach([-.12 - w, 1.75, .95], 1, -1), look: [0, -.8], smile: -.2 + seg(t, .5, .7) * .8 });
      const k = seg(t, .25, .65); gs.forEach((g, i) => { g.position.copy(handPos(d, i % 2 ? -1 : 1)).add(V(Math.sin(i * 2) * .1, .1, 0)); g.scale.setScalar(.25 * (1 - k)); g.visible = k < 1; });
      bub.forEach((b, i) => { const u = frac(s * .7 + i / 5); b.position.set(Math.sin(i * 2.4) * .35, 1.65 + u * .6, .6 + Math.cos(i * 1.7) * .25); b.scale.setScalar(1 - u); });
      lb.scale.setScalar(popIn(t, .1)); shoot(st, [Math.sin(s * .3) * .6, 3.4, 5.8], [0, 2.0, .2]); } };
  };
  BUILD.h13_4 = () => {
    const st = H.room('lab', { top: '#e8eef4', bottom: '#c8d4dc' }), bd = M(RB(4.4, 3.2, .1, .05), plastic(0xffffff), { pos: [0, 2.2, -.5] }); st.scene.add(bd);
    const hs = [1, .95, 1.05, .25, .15, .12], bars = hs.map((h, i) => { const b = M(RB(.5, 1, .2, .04), plastic(i < 3 ? 0xff4a5c : 0x3cc85a), { pos: [-1.5 + i * .6, 0, -.35] }); st.scene.add(b); return b; });
    const ar = arrow(0x3cc85a, .8); ar.rotation.z = Math.PI; ar.position.set(1.4, 3.6, -.3); st.scene.add(ar);
    const l1 = hud(st, tag('BEFORE', 0xff4a5c, '#ffffff', 1.4, .4), -.32, -.3, .26), l2 = hud(st, tag('AFTER', 0x3cc85a, '#ffffff', 1.3, .4), -.32, .3, .24), lb = hud(st, tag('DEATHS DROPPED', 0x3cc85a, '#ffffff', 2.8, .52), .62, 0, .62);
    return { ...st, update(t, s) { bars.forEach((b, i) => { const k = ease(seg(t, .05 + i * .08, .25 + i * .08)), h = Math.max(.01, hs[i] * 2.2 * k); b.scale.y = h; b.position.y = .85 + h / 2; });
      ar.scale.setScalar(popIn(t, .6)); ar.position.y = 3.6 - Math.abs(Math.sin(s * 3)) * .2; [l1, l2].forEach((l, i) => l.scale.setScalar(popIn(t, .1 + i * .3))); lb.scale.setScalar(popIn(t, .55)); shoot(st, [0, 2.6, 8.6], [0, 2.2, -.4]); } };
  };
  BUILD.h13_5 = () => {
    const st = H.room('court'), ds = [0, 1, 2].map(i => { const d = doc(i + 1); d.position.set(-1.4 + i * 1.4, 0, (i === 1 ? -.4 : .1)); d.rotation.y = [.3, 0, -.3][i]; st.scene.add(d); return d; });
    const lb = hud(st, tag('"OUR HANDS? NEVER!"', 0xff4a5c, '#ffffff', 3.2, .52), .62, 0, .72);
    return { ...st, update(t, s) { ds.forEach((d, i) => d.pose({ s: s + i, handR: reach('chest', 1), handL: reach('chest', 1, -1), brow: -.8, smile: -.6, squint: .3, headTilt: Math.sin(s + i) * .1, headTurn: i === 1 ? Math.sin(s * 4) * .3 : 0 }));
      lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.2, 0], 6.6, .3); } };
  };
  BUILD.h13_6 = () => {
    const st = H.room('greek', { top: '#ffd9a8', bottom: '#f4ecd8' }), base = M(RB(1.8, 1.0, 1.4, .06), matte(0xe8dcc4), { pos: [0, .5, 0] }); st.scene.add(base);
    const ig = H.who(ignaz, 'coat', 'beard'); ig.position.set(0, 1.0, 0); ig.traverse(c => { if (c.isMesh && c.material && !c.userData.eye) c.material = metal(0xd4a440, { roughness: .35 }); }); st.scene.add(ig);
    const mo = H.who({ skin: 0xffd9bd, shirt: 0xff8ad0, hair: 0x6b4a2e, hairStyle: 'long' }); mo.position.set(1.6, 0, 1.4); mo.rotation.y = -2.4; st.scene.add(mo); const bb = M(SPH(.25, 16, 12), cloth(0xfff3d6)); st.scene.add(bb);
    const l1 = hud(st, tag('DIED 1865', 0x1d1d24, '#ffffff', 1.8, .44), .62, 0, .4), l2 = hud(st, tag('"SAVIOUR OF MOTHERS"', 0xffc44d, '#3a2400', 3.2, .5), .5, 0, .7);
    function cloth(c) { return B.cloth(c); }
    return { ...st, update(t, s) { ig.pose({ s: 0, handR: reach('chest', 1), smile: .4 }); const h = reach([0, 1.7, .6], 1); mo.pose({ s, handR: h, handL: reach([0, 1.7, .6], 1, -1), smile: .8, look: [0, .5] }); bb.position.copy(mo.localToWorld(h.clone()));
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); orbit(st, s, [.4, 2.4, .4], 7.8, .3); } };
  };
}
