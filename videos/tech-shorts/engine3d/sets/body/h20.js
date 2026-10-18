// Weird History of Medicine, episode 20 (cartoon 3D): The Magic Stone That Was Supposed to Cure Poison. Kept non-graphic.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, check, warnSign } = B;
  const stone = (s = 1) => { const g = G(M(SPH(.3, 32, 24), plastic(0x5a6a4a, { roughness: .35, clearcoat: .6 }), { scale: [1, .85, 1] }), M(new THREE.TorusGeometry(.3, .03, 8, 32), metal(0xd4a440), { rot: [Math.PI / 2, 0, 0] }), M(new THREE.TorusGeometry(.3, .03, 8, 32), metal(0xd4a440), {})); g.scale.setScalar(s); return g; };
  const crown = () => G(M(new THREE.CylinderGeometry(.5, .5, .25, 24, 1, true), metal(0xffc44d, { side: THREE.DoubleSide })), ...[0, 1, 2, 3, 4, 5].map(i => M(new THREE.ConeGeometry(.08, .22, 8), metal(0xffc44d), { pos: [Math.sin(i / 6 * Math.PI * 2) * .48, .22, Math.cos(i / 6 * Math.PI * 2) * .48] })));
  const king = () => { const k = H.who({ skin: 0xf2c7a5, shirt: 0x6a2a6a, pants: 0x3a1a3a, hair: 0x6b4a2e, coat: 0x6a2a6a }, 'coat', 'beard', 'furs'); const c = crown(); c.position.y = .75; k.userData.head.add(c); return k; };
  const pare = () => H.who({ skin: 0xf2c7a5, shirt: 0x1d1d24, pants: 0x1d1d24, hair: 0x3a2418, coat: 0x1d1d24 }, 'coat', 'ruff', 'beard');
  const cook = () => H.who({ skin: 0xd9a07a, shirt: 0xf4f0e6, pants: 0x5a4a3a, hair: 0x2a1a12 }, 'apron');
  const poison = (s = 1) => { const b = H.bottle(0x3a8a3a, s); const l = B.tag('☠', 0xffffff, '#1d1d24', .5, .4); l.position.set(0, .3, .21); l.scale.setScalar(.45); b.add(l); return b; };
  function goat() { const g = B.animal('dog', { color: 0xe8e0d0 }), u = g.userData; [-1, 1].forEach(d => u.head.add(M(new THREE.ConeGeometry(.06, .35, 10), plastic(0x8a7a6a), { pos: [d * .15, .4, -.08], rot: [-.4, 0, -d * .3] }))); u.head.add(M(new THREE.ConeGeometry(.08, .25, 10), plastic(0xe8e0d0), { pos: [0, -.32, .25], rot: [Math.PI, 0, 0] })); g.traverse(m => { if (m.isMesh && m.material.color && m.material.color.getHex() === 0x8a5a3c) m.material = plastic(0xd8ccb8, { roughness: .7 }); }); g.scale.setScalar(2.0); return g; }

  BUILD.h20_1 = (p) => {
    const st = H.room('court'), n = H.who({ skin: 0xffd9bd, shirt: 0x2a4a6a, pants: 0x1a2a3a, hair: 0xb5652b, coat: 0x2a4a6a }, 'coat', 'ruff'); st.scene.add(n); const sn = stone(.8); st.scene.add(sn); const gl = sprite(0xffe08a, 1.4, .5); st.scene.add(gl);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0x5a6a4a), .66, 0, .86);
    return { ...st, update(t, s) { const h = reach([.6, 2.0, .7], 1); n.pose({ s, handR: h, poleR: [1, -.6, -.2], smile: .9, squint: .3, look: [.4, -.2] }); sn.position.copy(n.localToWorld(h.clone())).add(V(.1, .3, .1)); sn.rotation.y = s; gl.position.copy(sn.position);
      ts.update(t, s); orbit(st, s, [0, 2.4, 0], 5.4, .2); } };
  };
  BUILD.h20_2 = () => {
    const st = H.room('cottage'), gt = goat(); gt.rotation.y = .7; st.scene.add(gt); const sto = M(new THREE.CapsuleGeometry(.5, .6, 10, 20), plastic(0xff9fb0, { transparent: true, opacity: .5, depthWrite: false }), { rot: [0, 0, Math.PI / 2], shadow: false }); st.scene.add(sto);
    const sn = stone(.8); st.scene.add(sn); const l1 = hud(st, tag('FROM GOAT STOMACHS', 0xffffff, '#1d2442', 3.2, .48), .62, 0, .72), l2 = hud(st, tag('"CURES ANY POISON"', 0x5a6a4a, '#ffffff', 3.0, .48), .5, 0, .68);
    return { ...st, update(t, s) { const k = ease(seg(t, .15, .45)); sto.position.set(0, 1.5, 0); sto.material.opacity = .5 * (1 - k * .6); sn.position.set(0, 1.5 + k * 1.6, k * .8); sn.rotation.y = s; gt.rotation.y = .7 + Math.sin(s * .5) * .1;
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .5)); shoot(st, [1.6, 3.4, 8.6], [0, 2.0, 0]); } };
  };
  BUILD.h20_3 = () => {
    const st = H.room('court'), k = king(); k.position.set(-1.0, 0, -.4); k.rotation.y = .5; st.scene.add(k); const pr = pare(); pr.position.set(1.0, 0, .2); pr.rotation.y = -.6; st.scene.add(pr);
    const l1 = hud(st, tag('1567: AMBROISE PARÉ', 0xffffff, '#1d2442', 3.2, .48), .64, 0, .7), l2 = hud(st, tag('"NONSENSE!"', 0xff4a5c, '#ffffff', 2.0, .5), .52, -.15, .44), l3 = hud(st, tag("LET'S TEST IT", 0x3fa9ff, '#ffffff', 2.4, .48), .4, .1, .5);
    return { ...st, update(t, s) { k.pose({ s, handR: reach('chin', 1), brow: .4, squint: .3, look: [.5, 0] }); pr.pose({ s, handR: reach('up', .5 + Math.sin(s * 3) * .2), mouth: Math.abs(Math.sin(s * 5)) * .4, brow: -.5, smile: .3, headTurn: Math.sin(s * 2) * .2 });
      [l1, l2, l3].forEach((l, i) => l.scale.setScalar(popIn(t, .1 + i * .25))); orbit(st, s, [0, 2.2, 0], 6.6, .3); } };
  };
  BUILD.h20_4 = () => {
    const st = H.room('cell'), c = cook(); c.position.set(-.7, 0, -.4); c.rotation.y = .4; st.scene.add(c); const pr = pare(); pr.position.set(1.0, 0, .2); pr.rotation.y = -.7; st.scene.add(pr);
    const pb = poison(.7), sn = stone(.45); st.scene.add(pb, sn); const l1 = hud(st, tag('THE DEAL', 0xffd23f, '#3a2400', 1.8, .55), .62, 0, .4), l2 = hud(st, tag('SURVIVE = GO FREE', 0x3cc85a, '#ffffff', 3.0, .46), .5, 0, .64);
    return { ...st, update(t, s) { const hr = reach([-.5, 2.0, .75], 1), hl = reach([.5, 2.0, .75], 1, -1); pr.pose({ s, handR: hr, handL: hl, smile: .2, look: [-.5, 0] }); pb.position.copy(pr.localToWorld(hr.clone())).add(V(0, -.05, 0)); sn.position.copy(pr.localToWorld(hl.clone())).add(V(0, .15, 0)); sn.rotation.y = s;
      c.pose({ s, brow: .8, wide: .5, smile: -.3, look: [Math.sin(s * 2) * .6, 0], handR: reach('chin', 1) }); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.2, 0], 6.4, .3); } };
  };
  BUILD.h20_5 = () => {
    const st = H.room('candle', { top: '#15151c', bottom: '#3a3a46', floor: 0x4a4a52 }), cot = M(RB(2.4, .5, 1.2, .08), plastic(0x6a5a4a), { pos: [0, .5, -1.0] }); st.scene.add(cot); const gb = H.goblet(0x3a8a3a); gb.position.set(-.9, 0, .6); gb.rotation.z = Math.PI / 2; gb.position.y = .22; st.scene.add(gb);
    const sn = stone(.45); sn.position.set(.6, .2, .7); st.scene.add(sn); const cn = H.candle(1.5); cn.position.set(1.2, 0, -.2); st.scene.add(cn); const flame = cn.children[1], glow = sprite(0xffb040, 1.4, .6); glow.position.set(1.2, .85, -.2); st.scene.add(glow);
    const hg = G(M(new THREE.ConeGeometry(.3, .5, 20), plastic(0xdff4ff, { transparent: true, opacity: .6 }), { pos: [0, .25, 0], rot: [Math.PI, 0, 0] }), M(new THREE.ConeGeometry(.3, .5, 20), plastic(0xdff4ff, { transparent: true, opacity: .6 }), { pos: [0, .75, 0] }), M(new THREE.CylinderGeometry(.35, .35, .06, 20), plastic(0x6a4422), { pos: [0, 1.02, 0] }), M(new THREE.CylinderGeometry(.35, .35, .06, 20), plastic(0x6a4422), {}));
    hg.position.set(-.2, .55, -.9); st.scene.add(hg); const l1 = hud(st, tag('HOURS LATER...', 0xffffff, '#1d2442', 2.6, .5), .62, 0, .56), l2 = hud(st, tag('HE DIED', 0x1d1d24, '#ffffff', 1.6, .5), .5, 0, .34);
    return { ...st, update(t, s) { const out = seg(t, .55, .65); flame.scale.setScalar(Math.max(.001, 1 - out)); glow.material.opacity = .6 * (1 - out); hg.rotation.z = seg(t, .1, .3) * Math.PI; l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .6)); shoot(st, [1.4 + Math.sin(s * .3) * .4, 3.2, 4.6], [0, .7, -.1]); } };
  };
  BUILD.h20_6 = () => {
    const st = H.room('lab', { top: '#f0e8d8', bottom: '#d8ccb4', floor: 0xc8b898 }), ped = M(new THREE.CylinderGeometry(.8, .9, 1.0, 32), plastic(0x6a4422), { pos: [-.6, .5, 0] }); st.scene.add(ped); const sn = stone(1.4); sn.position.set(-.6, 1.5, 0); st.scene.add(sn);
    const sc = H.scroll((x, w, h) => { x.fillStyle = '#f4e6c4'; x.fillRect(0, 0, w, h); label(x, 'TEST:', w / 2, h * .2, h * .14, '#3a2400', 900); label(x, 'BEZOAR', w / 2, h * .45, h * .14, '#3a2400', 900); label(x, 'FAILED', w / 2, h * .75, h * .16, '#c0303a', 900); }); sc.position.set(1.1, 2.0, .2); sc.rotation.y = -.3; st.scene.add(sc);
    const x = hud(st, check(false), -.2, -.22, .14), l1 = hud(st, tag('DID NOTHING', 0xff4a5c, '#ffffff', 2.2, .5), .64, 0, .5), l2 = hud(st, tag('AN EARLY MEDICINE TEST', 0x3cc85a, '#ffffff', 3.4, .46), .52, 0, .76);
    return { ...st, update(t, s) { sn.rotation.y = s * .5; x.scale.setScalar(popIn(t, .1)); l1.scale.setScalar(popIn(t, .1)); sc.scale.setScalar(popIn(t, .35)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [Math.sin(s * .4) * .6, 2.4, 6.0], [.2, 1.8, 0]); } };
  };
}
