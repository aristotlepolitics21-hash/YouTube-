// Weird History of Medicine, episode 12 (cartoon 3D): The Fastest Surgeon in History. Kept non-graphic.
import { hist } from './hist.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V } = K;
  const H = hist(K), B = H.B, { popIn, tag, titleSigns, reach, hud, shoot, orbit, counter } = B;
  const liston = { skin: 0xf2c7a5, shirt: 0x2a2f45, pants: 0x2a2f45, hair: 0x3a2418, coat: 0x2a2f45 };
  const saw = () => G(M(RB(1.0, .26, .02, .01), metal(0xe6eaf2, { roughness: .15 }), { pos: [.55, 0, 0] }), M(RB(.3, .2, .08, .04), plastic(0x6a4422), {}));
  function watch(s = 1) { const face = H.card(.5, .5, (x, w, h) => { x.fillStyle = '#fff8e8'; x.beginPath(); x.arc(w / 2, h / 2, w * .48, 0, 7); x.fill(); x.fillStyle = '#1d1d24'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillRect(w / 2 + Math.sin(a) * w * .38 - 4, h / 2 - Math.cos(a) * h * .38 - 4, 8, 8); } }, { color: 0xfff8e8, depth: .01 });
    const g = G(M(new THREE.CylinderGeometry(.3, .3, .08, 40), metal(0xd4a440), { rot: [Math.PI / 2, 0, 0] }), M(new THREE.TorusGeometry(.07, .02, 8, 16), metal(0xd4a440), { pos: [0, .36, 0] })); face.position.z = .05; face.scale.setScalar(1.1); g.add(face);
    const hand = G(M(RB(.03, .24, .01, .005), plastic(0xff4a5c), { pos: [0, .1, 0] })); hand.position.z = .07; g.add(hand); g.userData.hand = hand; g.scale.setScalar(s); return g; }
  const sheet = () => M(RB(1.3, .25, 2.6, .12), matte(0xf4f0e6), {});

  BUILD.h12_1 = (p) => {
    const st = H.room('theatre'), l = H.who(liston, 'coat'); st.scene.add(l); const sw = saw(); st.scene.add(sw); const ts = hud(st, titleSigns(p.top, p.bottom, 0xc8a050), .66, 0, .86);
    return { ...st, update(t, s) { const h = reach('up', seg(t, .1, .3)); l.pose({ s, handR: h, smile: .8, brow: -.4 }); sw.position.copy(l.localToWorld(h.clone())).add(V(0, .1, .1)); sw.rotation.z = .4 + Math.sin(s * 3) * .1; ts.update(t, s); orbit(st, s, [0, 2.4, 0], 5.6, .2); } };
  };
  BUILD.h12_2 = () => {
    const st = H.room('theatre'), bd = B.bed(); st.scene.add(bd); const pt = H.who({ skin: 0xf2c7a5, shirt: 0xf4f0e6, hair: 0x6b4a2e }); pt.position.set(0, 1.25, 1.3); st.scene.add(pt);
    const as = [-1, 1].map(d => { const a = H.who({ skin: d > 0 ? 0xd9a07a : 0xf2c7a5, shirt: d > 0 ? 0x8a5a3a : 0x5a6a3a, hair: 0x2a1a12 }, d > 0 ? 'beard' : 'apron'); a.position.set(d * 1.5, 0, -.4); a.rotation.y = -d * 1.2; st.scene.add(a); return a; });
    const bt = H.bottle(0x8a5a2a, .9); bt.position.set(-1.2, 0, 1.6); st.scene.add(bt);
    const l1 = hud(st, tag('NO ANAESTHETIC', 0xff4a5c, '#ffffff', 2.6, .5), .62, 0, .6), l2 = hud(st, tag('ALCOHOL + STRONG ARMS', 0xffffff, '#1d2442', 3.2, .44), .48, 0, .7);
    return { ...st, update(t, s) { pt.pose({ s, lean: -Math.PI / 2, wide: .8, mouth: .3 + Math.sin(s * 6) * .1, brow: .7, headTurn: Math.sin(s * 2) * .3 }); as.forEach((a, i) => a.pose({ s: s + i, handR: reach([0, 1.6, .9], 1), handL: reach([0, 1.6, .9], 1, -1), lean: .2, squint: .4 }));
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [2.6, 4.4, 5.6], [0, 1.4, .2]); } };
  };
  BUILD.h12_3 = () => {
    const st = H.room('night', { top: '#3a2a1a', bottom: '#8a6a4a' }), w = watch(5); w.position.set(0, 2.4, 0); st.scene.add(w);
    const ct = hud(st, counter(2.6, .62, k => (k * 2.5).toFixed(1) + ' MINUTES', '#1d2442'), .62, 0, .62); ct.userData.w = 2.6; const lb = hud(st, tag('A WHOLE LEG', 0xc8a050, '#3a2400', 2.0, .48), .48, 0, .44);
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .85)); w.userData.hand.rotation.z = -k * Math.PI * 5; w.rotation.y = Math.sin(s * .5) * .2; ct.set(k); ct.scale.setScalar(popIn(t, .1)); lb.scale.setScalar(popIn(t, .5)); shoot(st, [0, 2.2, 8.6], [0, 2.2, 0]); } };
  };
  BUILD.h12_4 = () => {
    const st = H.room('theatre'), l = H.who(liston, 'coat'); l.position.set(0, 0, 1.0); st.scene.add(l);
    const studs = []; for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const sd = H.who({ skin: [0xf2c7a5, 0xd9a07a, 0xffd9bd][(i + r) % 3], shirt: [0x3a3a46, 0x6a3a22, 0x2a4a3a, 0x5a5a6a][i], hair: [0x2a1a12, 0xb5652b, 0x6b4a2e][(i + r) % 3] }, i % 2 ? 'tophat' : 'coat');
      sd.scale.setScalar(.7); sd.position.set(-2.4 + i * 1.6 + (r % 2) * .5, .75 + r * .9, -1.5 - r * 1.0); st.scene.add(sd); const w = watch(.4); st.scene.add(w); studs.push([sd, w]); }
    const lb = hud(st, tag('"TIME ME, GENTLEMEN!"', 0xc8a050, '#3a2400', 3.4, .52), .62, 0, .74);
    return { ...st, update(t, s) { l.pose({ s, handR: reach('up', .6 + Math.sin(s * 3) * .4), mouth: .5 + Math.abs(Math.sin(s * 5)) * .4, wide: .6, brow: -.6, headTurn: Math.sin(s * 1.5) * .4 });
      studs.forEach(([sd, w], i) => { const h = reach([.1, 2.2, .7], 1); sd.pose({ s: s + i, handR: h, look: [0, -.3], smile: .3 }); w.position.copy(sd.localToWorld(h.clone())); });
      lb.scale.setScalar(popIn(t, .15)); shoot(st, [Math.sin(s * .3) * .8, 2.8, 6.6], [0, 2.0, -.4]); } };
  };
  BUILD.h12_5 = () => {
    const st = H.room('theatre'), bd = B.bed(); st.scene.add(bd); const pt = H.who({ skin: 0xf2c7a5, shirt: 0xf4f0e6, hair: 0x6b4a2e }); pt.position.set(0, 1.25, 1.3); st.scene.add(pt);
    const inh = G(M(SPH(.3, 24, 16), plastic(0xdff4ff, { transparent: true, opacity: .5, roughness: .02 })), M(SPH(.22, 20, 14), glowM(0xb8f0ff, .6), { scale: [1, .5, 1], pos: [0, -.1, 0] }), M(new THREE.CylinderGeometry(.04, .04, .6, 10), plastic(0xc8a070), { pos: [.4, 0, 0], rot: [0, 0, Math.PI / 2] }));
    inh.position.set(.9, 1.9, -.2); st.scene.add(inh); const zs = [0, 1, 2].map(i => { const z = tag('Z', 0xffffff, '#1d2442', .5, .5); st.scene.add(z); return z; });
    const l1 = hud(st, tag('1846: ETHER', 0x3fa9ff, '#ffffff', 2.2, .52), .62, 0, .5), l2 = hud(st, tag('FAST ASLEEP', 0x3cc85a, '#ffffff', 2.0, .46), .48, 0, .46);
    return { ...st, update(t, s) { pt.pose({ s: s * .2, lean: -Math.PI / 2, squint: 1, smile: .5 }); const hp = new THREE.Vector3(); pt.userData.head.getWorldPosition(hp);
      zs.forEach((z, i) => { const u = frac(s * .4 + i / 3); z.position.copy(hp).add(V(.3 + u * .6, .5 + u * 1.2, 0)); z.scale.setScalar(.5 + u * .6); });
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [2.6, 4.4, 5.6], [0, 1.4, .2]); } };
  };
  BUILD.h12_6 = () => {
    const st = H.room('theatre'), l = H.who(liston, 'coat'); l.position.set(0, 0, 1.0); st.scene.add(l);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const sd = H.who({ skin: [0xf2c7a5, 0xd9a07a, 0xffd9bd][(i + r) % 3], shirt: [0x3a3a46, 0x6a3a22, 0x2a4a3a, 0x5a5a6a][i], hair: 0x3a2418 }); sd.scale.setScalar(.7); sd.position.set(-2.4 + i * 1.6 + (r % 2) * .5, .75 + r * .9, -1.5 - r * 1.0); sd.userData.clap = true; st.scene.add(sd); }
    const studs = st.scene.children.filter(c => c.userData.clap);
    const l1 = hud(st, tag('"THIS YANKEE DODGE', 0xffffff, '#1d2442', 3.0, .46), .64, 0, .66), l2 = hud(st, tag('BEATS MESMERISM HOLLOW!"', 0xc8a050, '#3a2400', 3.6, .46), .52, 0, .76);
    return { ...st, update(t, s) { const bow = Math.max(0, Math.sin(s * 1.5)) * seg(t, .1, .2); l.pose({ s, lean: bow * .6, smile: 1, handR: reach('chest', bow), handL: reach([-.6, 1.4, .2], 1, -1) });
      studs.forEach((sd, i) => { const c = Math.abs(Math.sin(s * 8 + i)); sd.pose({ s: s + i, handR: reach([.05 * c, 2.1, .6], 1), handL: reach([-.05 * c, 2.1, .6], 1, -1), smile: 1, wide: .5 }); });
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .4)); shoot(st, [Math.sin(s * .3) * .8, 2.8, 6.6], [0, 2.0, -.4]); } };
  };
}
