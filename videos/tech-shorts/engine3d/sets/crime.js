// Cartoon Case Files: animated true-crime sets. Big-eyed stylised people, toy-like props, warm key light on moody skies.
// makeHuman() is the shared cast builder; the cc_* sets are episode 1 (Victor Lustig sells the Eiffel Tower).
export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, bubble, sprite, stage, aim,
    envelope, confetti, sparkles, clamp, lerp, seg, ease, out, pop, frac, V, rng, SANS, MONO } = K;

  // ---------- cast ----------
  // o: skin, suit, pants, shirt, tie, shoe, hair, hairStyle (slick|curly|bald|side), hat (fedora|cap|kepi), stache, iris, nose, belly, brow
  function makeHuman(o = {}) {
    const skin = o.skin ?? 0xf0bd96, suit = o.suit ?? 0x34425f, root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const skinM = plastic(skin, { roughness: .5, clearcoat: .15 }), hairM = plastic(o.hair ?? 0x2b1d14, { roughness: .45, clearcoat: .5 });
    const legs = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * .25, 1.0, 0);
      g.add(M(new THREE.CapsuleGeometry(.17, .6, 8, 16), matte(o.pants ?? suit), { pos: [0, -.44, 0] }), M(SPH(.21, 24, 16), plastic(o.shoe ?? 0x2a1d17), { pos: [0, -.86, .09], scale: [1, .6, 1.5] }));
      root.add(g); return g; });
    body.position.y = 1.0; const bel = o.belly ?? 1;
    body.add(M(SPH(.62, 48, 32), matte(suit, { roughness: .7 }), { pos: [0, .62, 0], scale: [bel, 1.12, .8 * bel] }));
    body.add(M(RB(.3, .46, .06, .03), matte(o.shirt ?? 0xf6f1e6), { pos: [0, .95, .44 * bel], rot: [-.35, 0, 0] }));
    if (o.tie !== null) body.add(M(RB(.11, .42, .05, .02), plastic(o.tie ?? 0x9e1b2c), { pos: [0, .9, .48 * bel + .01], rot: [-.32, 0, 0] }));
    if (o.skirt) body.add(M(new THREE.CylinderGeometry(.5, .66, .62, 32), matte(o.skirt), { pos: [0, .05, 0] }));
    body.add(M(new THREE.CylinderGeometry(.17, .2, .3, 20), skinM, { pos: [0, 1.38, 0] }));
    const head = new THREE.Group(); head.position.set(0, 1.95 + ((o.headScale ?? 1) - 1) * .45, 0); head.scale.setScalar(o.headScale ?? 1); body.add(head);
    head.add(M(SPH(.6, 48, 36), skinM, { scale: [1, 1.04, .95] }));
    [-1, 1].forEach(s => head.add(M(SPH(.12, 16, 12), skinM, { pos: [s * .58, -.02, 0], scale: [.5, 1, .8] })));
    head.add(M(SPH(o.nose ?? .13, 24, 16), plastic(o.noseCol ?? skin, { roughness: .45 }), { pos: [0, -.08, .58], scale: [1, .9, 1] }));
    [-1, 1].forEach(s => head.add(M(SPH(.1, 16, 12), matte(0xff9a8a, { transparent: true, opacity: .55 }), { pos: [s * .32, -.17, .45], scale: [1, .6, .3], shadow: false })));
    const eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * .22, .08, .43); head.add(e);
      e.add(M(SPH(.165, 32, 24), plastic(0xffffff, { roughness: .15 }), { shadow: false }));
      const iris = new THREE.Group(); e.add(iris);
      iris.add(M(new THREE.CircleGeometry(.095, 32), new THREE.MeshStandardMaterial({ color: o.iris ?? 0x6b3e1e, roughness: .3 }), { pos: [0, 0, .161], shadow: false }));
      iris.add(M(new THREE.CircleGeometry(.05, 24), new THREE.MeshBasicMaterial({ color: 0x0b0b10 }), { pos: [0, 0, .163], shadow: false }));
      iris.add(M(new THREE.CircleGeometry(.022, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }), { pos: [.03, .035, .166], shadow: false }));
      e.traverse(m => { m.receiveShadow = false; }); return e; });
    const brows = [-1, 1].map(s => { const b = M(new THREE.CapsuleGeometry(.04, .17, 6, 12), hairM, { pos: [s * .22, .3, .53], rot: [0, 0, Math.PI / 2], shadow: false }); head.add(b); return b; });
    const mouth = new THREE.Group(); mouth.position.set(0, -.3, .5); head.add(mouth);
    const smile = M(new THREE.TorusGeometry(.13, .028, 8, 24, Math.PI), matte(0x5a1e1e), { rot: [0, 0, Math.PI], shadow: false }); mouth.add(smile);
    const open = M(SPH(.12, 24, 16), matte(0x4a1418), { scale: [1, .5, .35], shadow: false }); mouth.add(open);
    const teeth = M(RB(.15, .04, .02, .01), matte(0xffffff), { pos: [0, .035, .045], shadow: false }); open.add(teeth);
    if (o.stache) { [-1, 1].forEach(s => head.add(M(new THREE.CapsuleGeometry(.045, .16, 6, 12), hairM, { pos: [s * .1, -.19, .55], rot: [0, 0, Math.PI / 2 + s * .35], shadow: false }))); }
    const hs = o.hairStyle ?? 'slick';
    if (hs === 'slick' || hs === 'side') head.add(M(new THREE.SphereGeometry(.625, 40, 20, 0, Math.PI * 2, 0, Math.PI * .42), hairM, { pos: [0, .05, -.04], rot: [hs === 'side' ? -.25 : -.15, 0, hs === 'side' ? .12 : 0] }));
    if (hs === 'bob') { head.add(M(new THREE.SphereGeometry(.66, 40, 20, 0, Math.PI * 2, 0, Math.PI * .4), hairM, { pos: [0, .04, -.02] }));
      head.add(M(new THREE.SphereGeometry(.68, 40, 24, Math.PI / 2 + .95, Math.PI * 2 - 1.9, Math.PI * .3, Math.PI * .38), hairM, { pos: [0, .02, -.03] })); }
    if (hs === 'curly') { const r = rng(9); for (let i = 0; i < 22; i++) { const a = r() * Math.PI * 2, b = r() * .9; head.add(M(SPH(.17, 16, 12), hairM, { pos: [Math.cos(a) * Math.sin(b) * .58, .2 + Math.cos(b) * .42, Math.sin(a) * Math.sin(b) * .5 - .08] })); } }
    if (hs === 'bald') [-1, 1].forEach(s => head.add(M(SPH(.2, 16, 12), hairM, { pos: [s * .5, .05, -.18], scale: [.5, .9, 1] })));
    if (o.shades) { const sm = plastic(0x0d0f16, { roughness: .08, clearcoat: 1, envMapIntensity: 1.4 });
      [-1, 1].forEach(s => head.add(M(RB(.36, .24, .06, .08), sm, { pos: [s * .22, .08, .6], rot: [0, s * .18, 0], shadow: false }))); head.add(M(RB(.14, .04, .04, .015), sm, { pos: [0, .14, .63], shadow: false }));
      [-1, 1].forEach(s => head.add(M(RB(.04, .04, .5, .015), sm, { pos: [s * .48, .12, .35], rot: [0, s * .45, 0], shadow: false }))); }
    const hatCol = o.hatCol ?? 0x2b2b33;
    if (o.hat === 'fedora') { const h = G(M(new THREE.CylinderGeometry(.42, .5, .4, 32), plastic(hatCol, { clearcoat: .2 }), { pos: [0, .2, 0] }), M(new THREE.CylinderGeometry(.82, .82, .04, 40), plastic(hatCol, { clearcoat: .2 }), { pos: [0, 0, 0] }),
      M(new THREE.CylinderGeometry(.505, .505, .1, 32), matte(o.band ?? 0x9e1b2c), { pos: [0, .06, 0] })); h.position.set(0, .48, -.03); h.rotation.set(-.1, 0, .08); head.add(h); }
    if (o.hat === 'cap') { const h = G(M(new THREE.SphereGeometry(.64, 32, 16, 0, Math.PI * 2, 0, Math.PI * .4), plastic(hatCol, { clearcoat: .1, roughness: .8 }), { scale: [1, .8, 1.05] }), M(RB(.7, .05, .4, .02), plastic(hatCol, { roughness: .8 }), { pos: [0, .14, .55], rot: [.15, 0, 0] })); h.position.set(0, .2, -.03); head.add(h); }
    if (o.hat === 'pillbox') { const h = G(M(new THREE.CylinderGeometry(.3, .32, .24, 32), plastic(hatCol)), M(new THREE.CylinderGeometry(.33, .33, .05, 32), plastic(o.band ?? 0xffffff), { pos: [0, -.1, 0] })); h.position.set(.12, .62, -.05); h.rotation.set(-.2, 0, -.2); head.add(h); }
    if (o.hat === 'kepi') { const h = G(M(new THREE.CylinderGeometry(.42, .5, .45, 32), plastic(hatCol), { pos: [0, .2, 0] }), M(new THREE.CylinderGeometry(.42, .42, .05, 32), plastic(0xc8202f), { pos: [0, .44, 0] }), M(RB(.6, .04, .3, .02), plastic(0x15151c), { pos: [0, 0, .45], rot: [.25, 0, 0] })); h.position.set(0, .42, 0); h.rotation.x = -.08; head.add(h); }
    const sweat = M(SPH(.07, 16, 12), plastic(0x9fe2ff, { transparent: true, opacity: .85, roughness: .05 }), { pos: [.45, .28, .38], scale: [.8, 1.3, .8], shadow: false }); head.add(sweat);
    const arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * .64, 1.1, 0);
      sh.add(M(new THREE.CapsuleGeometry(.13, .52, 8, 16), matte(suit, { roughness: .7 }), { pos: [0, -.36, 0] }), M(SPH(.15, 20, 14), skinM, { pos: [0, -.74, 0] })); body.add(sh); return sh; });
    root.userData = { body, head, eyes, arms, legs, mouth };
    root.hand = (s = 1) => arms[s > 0 ? 1 : 0].children[1];
    // p: s, walk, hop, lookY, lookX, tilt, eyeX, eyeY, brow (-1 angry .. 1 worried), browUp, mouth (smile|frown|open|flat), open, talk, happy,
    //    reachL/R, upL/R, waveL/R, armL/armR ([x, z] overrides), sweat, squash, lean
    root.pose = (p = {}) => {
      const s = p.s ?? 0, br = Math.sin(s * 2.6) * .02, w = p.walk, sw = w === undefined ? 0 : Math.sin(w);
      body.position.y = 1.0 + br + (p.hop ?? 0) + (w === undefined ? 0 : Math.abs(sw) * .06);
      const sq = p.squash ?? 0; body.scale.set(1 + sq, 1 - sq, 1 + sq); body.rotation.set(p.lean ?? 0, 0, (w === undefined ? 0 : sw * .04));
      legs.forEach((l, i) => { l.rotation.x = (w === undefined ? 0 : (i ? -sw : sw) * .55) - (p.sit ?? 0) * 1.45; l.position.y = 1.0 + (p.hop ?? 0); });
      head.rotation.set(p.lookX ?? 0, p.lookY ?? 0, (p.tilt ?? 0) + Math.sin(s * 1.3) * .02);
      const blink = (frac(s / 3.1 + (p.seed ?? 0)) < .04) ? .1 : 1;
      eyes.forEach(e => { e.scale.set(1, blink * (1 - (p.happy ?? 0) * .4) * (1 + (p.wide ?? 0) * .25), 1); e.rotation.set(-(p.eyeY ?? 0) * .4, (p.eyeX ?? 0) * .5, 0); });
      const bw = p.brow ?? o.brow ?? 0;
      brows.forEach((b, i) => { const sd = i ? 1 : -1; b.rotation.z = Math.PI / 2 - sd * bw * .35; b.position.y = .3 + (p.browUp ?? 0) * .08 + Math.abs(bw) * .01; });
      const md = p.mouth ?? 'smile', talk = p.talk ? (.25 + .75 * Math.abs(Math.sin(s * 13) * Math.sin(s * 4.1 + 1))) * p.talk : 0;
      const op = Math.max(p.open ?? 0, talk);
      smile.visible = (md === 'smile' || md === 'frown' || md === 'flat') && op < .2; smile.rotation.z = md === 'frown' ? 0 : Math.PI; smile.position.y = md === 'frown' ? -.08 : 0;
      smile.scale.set(1 + (p.happy ?? 0) * .3, md === 'flat' ? .25 : 1, 1);
      open.visible = md === 'open' || op >= .2; open.scale.set(1 + (md === 'smile' ? .3 : 0), .25 + Math.max(op, md === 'open' ? .8 : 0) * .75, .35);
      sweat.visible = !!p.sweat; sweat.position.y = .28 - frac(s * .5) * .25 * (p.sweat ? 1 : 0);
      const wv = Math.sin(s * 11) * .35;
      const setArm = (a, sd, reach, up, wave, ov) => { if (ov) return a.rotation.set(ov[0], 0, sd * ov[1]);
        a.rotation.set(-reach * 1.3 + (w === undefined ? 0 : -sd * sw * .5), 0, sd * (.12 + wave * (2.5 + wv) + up * 2.7)); };
      setArm(arms[1], 1, p.reachR ?? 0, p.upR ?? 0, p.waveR ?? 0, p.armR); setArm(arms[0], -1, p.reachL ?? 0, p.upL ?? 0, p.waveL ?? 0, p.armL);
    };
    root.pose(); return root;
  }
  const LUSTIG = { suit: 0x3b3f52, pants: 0x34384a, tie: 0x9e1b2c, hair: 0x22180f, stache: true, hat: 'fedora', hatCol: 0x2c2c36, iris: 0x2f6d8a, brow: -.25, skin: 0xf2c4a0 };
  const POISSON = { suit: 0x7a5a3a, pants: 0x5e4630, tie: 0x2f5d8a, hair: 0x6b4a2e, hairStyle: 'bald', hat: 'cap', hatCol: 0x5e5248, belly: 1.25, nose: .17, noseCol: 0xf2a88a, iris: 0x4c6b2e, skin: 0xf4c7a6 };
  const lustig = () => makeHuman(LUSTIG), poisson = () => makeHuman(POISSON);
  const dealer = (i) => makeHuman({ suit: [0x4f5d4a, 0x5a4b6b, 0x6b4f3a, 0x3a5566][i % 4], hair: [0x3a2a1e, 0x9a9a9a, 0x1a1a1a, 0x7a4a2a][i % 4], hairStyle: ['side', 'bald', 'slick', 'curly'][i % 4], stache: i % 2 === 0, belly: 1 + (i % 3) * .1, skin: [0xf0bd96, 0xd9a07a, 0xf4c7a6, 0xa86e4b][i % 4], tie: [0x2f5d8a, 0x7a2a2a, 0x2a6a4a, 0x8a6a1a][i % 4] });
  const gendarme = () => makeHuman({ suit: 0x1f2c5c, pants: 0x1f2c5c, tie: null, shirt: 0x1f2c5c, hat: 'kepi', hatCol: 0x1f2c5c, stache: true, hair: 0x2a1a10, brow: -.5 });

  // ---------- props ----------
  const latticeTex = ctex(256, 512, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineCap = 'round';
    x.lineWidth = 22; x.strokeRect(11, 0, w - 22, h); x.lineWidth = 9; const n = 6;
    for (let i = 0; i < n; i++) { const y0 = i / n * h, y1 = (i + 1) / n * h; x.beginPath(); x.moveTo(11, y0); x.lineTo(w - 11, y1); x.moveTo(w - 11, y0); x.lineTo(11, y1); x.stroke(); x.beginPath(); x.moveTo(0, y1); x.lineTo(w, y1); x.lineWidth = 12; x.stroke(); x.lineWidth = 9; } }).tex;
  latticeTex.wrapS = THREE.RepeatWrapping; latticeTex.repeat.set(4, 1);
  function tower(col = 0x8a5e43) {
    const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: col, map: latticeTex, alphaTest: .5, side: THREE.DoubleSide, roughness: .55, metalness: .35, envMapIntensity: .6 });
    const frustum = (y0, y1, rb, rt) => { const c = M(new THREE.CylinderGeometry(rt, rb, y1 - y0, 4, 1, true), m); c.rotation.y = Math.PI / 4; c.position.y = (y0 + y1) / 2; g.add(c); };
    frustum(0, 1.7, 1.55, .78); frustum(1.82, 3.2, .7, .36); frustum(3.3, 5.4, .33, .09);
    const pm = plastic(col, { roughness: .5, clearcoat: .3 });
    g.add(M(RB(1.85, .14, 1.85, .05), pm, { pos: [0, 1.76, 0] }), M(RB(.92, .12, .92, .04), pm, { pos: [0, 3.25, 0] }), M(RB(.3, .2, .3, .05), pm, { pos: [0, 5.45, 0] }));
    g.add(M(new THREE.ConeGeometry(.06, .7, 12), pm, { pos: [0, 5.9, 0] }));
    [0, 1, 2, 3].forEach(i => { const a = i * Math.PI / 2, arch = M(new THREE.TorusGeometry(.62, .07, 8, 24, Math.PI), pm); arch.position.set(Math.sin(a) * 1.08, .55, Math.cos(a) * 1.08); arch.rotation.y = a; g.add(arch); });
    const beacon = sprite(0xffe9a8, .9, .8); beacon.position.y = 6.25; g.add(beacon); g.userData.beacon = beacon;
    return g;
  }
  function house(x, z, w = 1.4, h = 1.6, col = 0xf3e2c4, seed = 1) {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const win = ctex(128, 160, (c, cw, ch) => { c.fillStyle = '#f3e2c4'; c.fillRect(0, 0, cw, ch); const r = rng(seed); for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { c.fillStyle = r() > .45 ? '#ffd27a' : '#3a4a6a'; rrect(c, 18 + i * 56, 20 + j * 70, 36, 50, 8); c.fill(); } });
    g.add(M(RB(w, h, w * .8, .08), [0, 0, 0, 0, 0, 0].map((_, i) => i === 4 ? new THREE.MeshStandardMaterial({ map: win.tex, roughness: .8 }) : matte(col)), { pos: [0, h / 2, 0] }));
    const roof = M(new THREE.ConeGeometry(w * .78, .7, 4), plastic(0x4f6a8f, { roughness: .6 }), { pos: [0, h + .35, 0], rot: [0, Math.PI / 4, 0], scale: [1, 1, .82] }); g.add(roof);
    return g;
  }
  function parisRow(z = -6, n = 9, spread = 15, seed = 3) { const r = rng(seed), g = new THREE.Group(); for (let i = 0; i < n; i++) { const x = -spread / 2 + i * spread / (n - 1) + (r() - .5) * .6; g.add(house(x, z + (r() - .5) * 1.5, 1.2 + r() * .6, 1.3 + r() * 1.4, [0xf3e2c4, 0xeed2b0, 0xf6e9d6][i % 3], seed * 10 + i)); } return g; }
  function bill(col = 0x7fb87a) { const t = ctex(240, 120, (x, w, h) => { x.fillStyle = '#9fd39a'; rrect(x, 0, 0, w, h, 10); x.fill(); x.strokeStyle = '#4c8a48'; x.lineWidth = 6; rrect(x, 8, 8, w - 16, h - 16, 8); x.stroke(); x.fillStyle = '#4c8a48'; x.beginPath(); x.arc(w / 2, h / 2, 30, 0, 7); x.fill(); label(x, '₣', w / 2, h / 2 + 3, 44, '#e8ffe4', 900); });
    return M(new THREE.PlaneGeometry(.6, .3), new THREE.MeshStandardMaterial({ map: t.tex, side: THREE.DoubleSide, roughness: .8 }), { shadow: false }); }
  function cashStack(n = 6) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const b = M(RB(.62, .06, .32, .01), matte(0x8fc98a), { pos: [0, .03 + i * .065, 0], rot: [0, (i % 3 - 1) * .08, 0] }); g.add(b); } g.add(M(RB(.2, n * .065 + .01, .34, .01), matte(0xf3e3c3), { pos: [0, n * .065 / 2 + .01, 0] })); return g; }
  function suitcase(open = false) { const g = new THREE.Group(); g.add(M(RB(1.3, .9, .4, .08), plastic(0x7a4a2a, { roughness: .5 }), { pos: [0, .45, 0] }));
    g.add(M(new THREE.TorusGeometry(.16, .04, 8, 20, Math.PI), metal(0xd8b36a), { pos: [0, .92, 0] })); [-1, 1].forEach(s => g.add(M(RB(.1, .14, .44, .02), metal(0xd8b36a), { pos: [s * .42, .8, 0] }))); return g; }
  function table(w = 3.2, d = 1.4, col = 0x6b3e26) { const g = new THREE.Group(); g.add(M(RB(w, .12, d, .05), plastic(col, { clearcoat: .9, roughness: .25 }), { pos: [0, 1.05, 0] }));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(M(new THREE.CylinderGeometry(.06, .05, 1.0, 12), plastic(col), { pos: [a * (w / 2 - .2), .5, b * (d / 2 - .15)] }))); return g; }
  function newspaper(head, sub, w = 2.6, h = 3.4, mast = 'LE JOURNAL') { return sign(w, h, (x, cw, ch) => { x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, cw, ch); label(x, mast, cw / 2, ch * .08, ch * .065, '#2a2420', 900); x.fillStyle = '#2a2420'; x.fillRect(cw * .05, ch * .14, cw * .9, 6);
      head.split('\n').forEach((l, i) => label(x, l, cw / 2, ch * (.25 + i * .1), ch * .085, '#1a1410', 900)); if (sub) label(x, sub, cw / 2, ch * (.27 + head.split('\n').length * .1), ch * .04, '#5a4a3a', 700);
      x.fillStyle = '#c9bfa8'; for (let i = 0; i < 9; i++) { x.fillRect(cw * .06, ch * (.55 + i * .045), cw * .4, ch * .018); x.fillRect(cw * .54, ch * (.55 + i * .045), cw * .4, ch * .018); } }, { color: 0xf4ecd8, depth: .04, ppu: 200 }); }
  const NIGHT = { top: '#1d2350', bottom: '#d98a6a', floor: 0x5a4a5a, fogColor: '#7a5a6a', key: 0xffd9a8, keyI: 2.6, rim: 0x7aa8ff, rimI: 2.4, hemi: .8 };
  const DUSK = { top: '#4a5a9a', bottom: '#f2b98a', floor: 0xc9a07a, fogColor: '#e2a882', key: 0xffe2b8, keyI: 2.6, rim: 0x9ac0ff, rimI: 2.0 };
  const ROOM = { top: '#5a2a2a', bottom: '#b8704a', floor: 0x7a3a2a, fogColor: '#8a4a3a', key: 0xffd9a0, keyI: 2.4, rim: 0xffb37a, rimI: 1.6, hemi: .9 };
  const qmark = (col = 0xffc44d) => textSign(.6, .6, '?', { color: col, fg: '#1d2442', size: 120 });

  // ---------- episode 1 sets ----------
  BUILD.cc_hook = () => {
    const st = stage(DUSK); const tw = tower(); tw.position.set(.3, 0, -2.2); tw.scale.setScalar(1.15); st.scene.add(tw, parisRow(-7, 10, 18));
    const lu = lustig(); lu.position.set(-1.2, 0, 1.4); lu.scale.setScalar(.8); st.scene.add(lu);
    const forSale = sign(2.0, 1.0, (x, w, h) => { x.fillStyle = '#c8202f'; rrect(x, 0, 0, w, h, 24); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 10; rrect(x, 14, 14, w - 28, h - 28, 16); x.stroke(); label(x, 'À VENDRE', w / 2, h * .38, h * .3, '#fff'); label(x, 'FOR SALE', w / 2, h * .72, h * .2, '#ffe0e0'); }, { color: 0xc8202f, depth: .1 });
    const hang = new THREE.Group(); hang.position.set(.3, 2.25, -.9); st.scene.add(hang); forSale.position.y = -.65; hang.add(forSale);
    [-1, 1].forEach(s => hang.add(M(new THREE.CylinderGeometry(.015, .015, .5, 6), metal(0xbbbbbb), { pos: [s * .7, -.1, 0], rot: [0, 0, -s * .5] })));
    const no = textSign(1.4, .5, 'NOT HIS!', { color: 0xffc44d, fg: '#2a1a12', size: 70 }); no.position.set(1.4, 3.7, 0); st.scene.add(no);
    return { ...st, update(t, s, d) {
      hang.scale.setScalar(Math.min(1.1, pop(s - .4))); hang.rotation.z = Math.sin(s * 2.2) * .1 * Math.exp(-s * .3);
      lu.pose({ s, talk: t < .62 ? 1 : 0, lookY: .35, armR: [-.4 - Math.sin(s * 2) * .1, .9], happy: .3, brow: -.4, mouth: 'smile', tilt: .06 });
      no.scale.setScalar(t > .7 ? Math.min(1.1, pop((t - .7) * d)) : 0); no.rotation.z = Math.sin(s * 6) * .08;
      tw.userData.beacon.material.opacity = .6 + Math.sin(s * 4) * .3;
      const k = ease(seg(t, 0, 1)); aim(st.cam, [lerp(-1.5, 1.2, k), lerp(2.0, 2.6, k), lerp(10.5, 8.8, k)], [0, 2.5, -.6]);
    } };
  };
  BUILD.cc_title = (p) => {
    const st = stage(NIGHT); const tw = tower(); tw.position.set(0, 0, -5); tw.scale.setScalar(1.3); st.scene.add(tw, parisRow(-9, 11, 20, 5));
    const lu = lustig(); lu.position.set(0, 0, .6); lu.scale.setScalar(.9); st.scene.add(lu);
    const s1 = textSign(3.6, .82, p.top, { color: 0xf3e3c3, fg: '#2a1a12' }), s2 = textSign(3.6, .8, p.bottom, { color: 0xc8202f, fg: '#ffffff', size: 92 });
    s1.position.set(0, 5.0, 0); s2.position.set(0, 4.15, .2); st.scene.add(s1, s2);
    const cs = textSign(1.5, .46, p.case, { color: 0x1d2442, fg: '#ffc44d', size: 60, font: MONO }); cs.position.set(-1.0, 5.75, -.2); cs.rotation.z = .08; st.scene.add(cs);
    const spot = new THREE.SpotLight(0xfff1d0, 40, 14, .35, .5); spot.position.set(0, 8, 3); spot.target = lu; st.scene.add(spot);
    return { ...st, update(t, s) {
      lu.pose({ s, armR: [0, .25], armL: [-.3, .5], lookY: Math.sin(s * .8) * .15, mouth: 'smile', happy: .25, brow: -.35, talk: seg(t, .1, .95) > 0 && t < .95 ? .6 : 0 });
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .3)); cs.scale.setScalar(pop(s - .6)); s1.rotation.z = Math.sin(s * 1.6) * .02;
      const a = Math.sin(s * .35) * .2; aim(st.cam, [Math.sin(a) * 10, 3.3, Math.cos(a) * 10], [0, 3.0, 0]);
    } };
  };
  BUILD.cc_news = () => {
    const st = stage(ROOM);
    const lu = lustig(); lu.position.set(0, 0, 0); st.scene.add(lu);
    const paper = newspaper('LA TOUR\nROUILLE !', 'The tower is rusting · repairs cost a fortune'); paper.position.set(0, 2.55, 1.15); paper.scale.setScalar(.62); st.scene.add(paper);
    const bulb = G(M(new THREE.CylinderGeometry(.02, .02, 1.6, 6), metal(0x333333), { pos: [0, .8, 0] }), M(SPH(.16, 20, 14), glowM(0xffd27a, 3), { pos: [0, 0, 0] })); bulb.position.set(.9, 4.8, .8); st.scene.add(bulb);
    const glow = sprite(0xffd27a, 2.2, .7); glow.position.copy(bulb.position); st.scene.add(glow);
    return { ...st, update(t, s) {
      const lower = ease(seg(t, .55, .7)); paper.position.y = 2.55 - lower * 1.1; paper.rotation.x = -lower * .5; paper.rotation.z = Math.sin(s * 1.5) * .02;
      lu.pose({ s, armR: [-1.2 + lower * .4, .35], armL: [-1.2 + lower * .4, .35], lookX: lower > .5 ? 0 : .12, eyeY: lower > .5 ? 0 : -.3, brow: lerp(0, -.6, seg(t, .7, .8)), mouth: 'smile', happy: seg(t, .75, .85) * .6, tilt: seg(t, .75, .85) * .12 });
      bulb.rotation.z = Math.sin(s * 1.1) * .06; glow.material.opacity = .6 + Math.sin(s * 5) * .05;
      const k = ease(t); aim(st.cam, [lerp(.8, .3, k), lerp(2.6, 2.9, k), lerp(6.4, 5.2, k)], [0, 2.6, .5]);
    } };
  };
  BUILD.cc_letters = () => {
    const st = stage(ROOM); const tb = table(3.0, 1.3); tb.position.set(0, 0, .8); st.scene.add(tb);
    const lu = lustig(); lu.position.set(0, 0, -.25); st.scene.add(lu);
    const stamp = G(M(new THREE.CylinderGeometry(.08, .1, .35, 16), plastic(0x6b3e26), { pos: [0, .25, 0] }), M(SPH(.12, 16, 12), plastic(0x6b3e26), { pos: [0, .47, 0] }), M(RB(.34, .08, .26, .02), plastic(0xc8202f), { pos: [0, .04, 0] }));
    st.scene.add(stamp);
    const letters = [0, 1, 2, 3, 4].map(i => { const e = envelope('', .55); st.scene.add(e); return e; });
    const page = sign(1.1, .78, (x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); label(x, 'RÉPUBLIQUE FRANÇAISE', w / 2, h * .12, h * .07, '#1d2442', 900); x.fillStyle = '#c9bfa8'; for (let i = 0; i < 6; i++) x.fillRect(w * .1, h * (.28 + i * .08), w * .8, h * .025);
      x.strokeStyle = '#c8202f'; x.lineWidth = 10; x.beginPath(); x.arc(w * .76, h * .8, h * .12, 0, 7); x.stroke(); label(x, 'OFFICIEL', w * .76, h * .8, h * .045, '#c8202f', 900); }, { color: 0xfbf6ea, depth: .02 });
    page.rotation.x = -Math.PI / 2 + .25; page.position.set(0, 1.13, .85); st.scene.add(page);
    const tag = textSign(2.4, .5, '“Deputy Director-General”', { color: 0xf3e3c3, fg: '#2a1a12', size: 42 }); tag.position.set(0, 3.9, 1.3); st.scene.add(tag);
    return { ...st, update(t, s) {
      const ph = s * 2.4, down = Math.max(0, Math.sin(ph)), hit = t < .55;
      stamp.position.set(.45, 1.13 + (hit ? down * .45 : .5), .85); stamp.rotation.z = -.1;
      lu.pose({ s, armR: hit ? [-.9 - down * .25, .15] : [-.2, .2], armL: [-.6, .35], lookX: hit ? .25 : 0, brow: -.5, mouth: 'smile', happy: .5, eyeY: hit ? -.4 : 0 });
      letters.forEach((e, i) => { const k = seg(t, .5 + i * .07, .75 + i * .07), a = -1.1 + i * .55; e.visible = k > 0;
        e.position.set(lerp(0, Math.sin(a) * 2.6, ease(k)), lerp(1.3, 2.6 + Math.cos(a) * 1.4, ease(k)) + Math.sin(s * 3 + i) * .05, lerp(.9, .4, k)); e.rotation.set(0, Math.sin(s * 2 + i) * .4, Math.sin(s * 3 + i) * .2); });
      tag.scale.setScalar(t > .2 ? Math.min(1, pop((t - .2) * 8)) : 0); tag.rotation.z = Math.sin(s * 1.4) * .03;
      aim(st.cam, [lerp(-.6, .4, t), 3.1, lerp(7.4, 6.9, t)], [0, 2.35, .3]);
    } };
  };
  BUILD.cc_hotel = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#6a2a3a', bottom: '#d49a6a', floor: 0x8a3a3a }));
    const tb = table(5.2, 1.6, 0x4a2a1a); tb.position.set(0, 0, 0); st.scene.add(tb);
    const lu = lustig(); lu.position.set(0, 0, -1.35); st.scene.add(lu);
    const ds = [0, 1, 2, 3].map(i => { const d = dealer(i); d.scale.setScalar(.82); d.position.set([-2.1, -.9, .9, 2.1][i], 0, 1.35); d.rotation.y = Math.PI + [-.3, -.1, .1, .3][i]; st.scene.add(d); return d; });
    const po = poisson(); po.scale.setScalar(.82); po.position.set(2.9, 0, .1); po.rotation.y = -Math.PI / 2 - .3; st.scene.add(po);
    const mini = tower(); mini.scale.setScalar(.22); mini.position.set(0, 1.11, 0); st.scene.add(mini);
    const tons = textSign(2.1, .55, '7,000 TONS OF IRON', { color: 0xffc44d, fg: '#2a1a12', size: 52 }); tons.position.set(0, 3.55, -1.0); st.scene.add(tons);
    const chand = G(M(SPH(.35, 24, 16), glowM(0xffe0a0, 2.2)), M(new THREE.TorusGeometry(.6, .05, 8, 32), metal(0xd8b36a), { rot: [Math.PI / 2, 0, 0] })); chand.position.set(0, 5.4, -.4); st.scene.add(chand);
    [-1, 1].forEach(sd => st.scene.add(M(RB(1.2, 4.5, .2, .1), matte(0x8a1a2a), { pos: [sd * 3.6, 2.25, -3.0] })));
    const cash = sparkles(18, [0, 2.0, 0], 1.5, 0xffe08a, 4); st.scene.add(cash);
    return { ...st, update(t, s, d) {
      lu.pose({ s, talk: 1, armR: [-.6, .5 + Math.sin(s * 3) * .15], armL: [-.3, .3], lookY: Math.sin(s * .9) * .4, brow: -.3, mouth: 'smile' });
      ds.forEach((dd, i) => dd.pose({ s: s + i, lookX: -.05, wide: seg(t, .6, .7), mouth: t > .65 ? 'open' : 'smile', open: .4, seed: i * .3 }));
      po.pose({ s, wide: seg(t, .6, .7), mouth: t > .65 ? 'open' : 'smile', open: .5, lookY: .2 });
      mini.position.y = 1.11 + Math.sin(s * 2) * .02; mini.rotation.y = s * .4;
      tons.scale.setScalar(t > .62 ? Math.min(1.1, pop((t - .62) * d)) : 0); cash.visible = t > .62; cash.update(s);
      aim(st.cam, [lerp(-3.2, -1.6, ease(t)), lerp(4.6, 4.0, t), lerp(7.8, 7.0, t)], [0, 1.9, -.3]);
    } };
  };
  BUILD.cc_mark = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#2a1a2a', bottom: '#5a3040', floor: 0x3a2028, hemi: .35, keyI: .6 }));
    const lu = lustig(); lu.position.set(-1.4, 0, .4); lu.rotation.y = .5; st.scene.add(lu);
    const ds = [0, 1, 2].map(i => { const d = dealer(i); d.scale.setScalar(.85); d.position.set(1.0 + i * .9 - .9, 0, -2.2 - (i % 2) * .4); st.scene.add(d); return d; });
    const po = poisson(); po.position.set(1.4, 0, .2); po.rotation.y = -.4; st.scene.add(po);
    const spot = new THREE.SpotLight(0xfff1d0, 0, 12, .3, .45); spot.position.set(1.4, 7, 2.5); spot.target = po; st.scene.add(spot);
    const spot2 = new THREE.SpotLight(0xffd9b0, 30, 12, .3, .5); spot2.position.set(-1.4, 7, 2.5); spot2.target = lu; st.scene.add(spot2);
    const nm = textSign(2.1, .55, 'ANDRÉ POISSON', { color: 0xf3e3c3, fg: '#2a1a12', size: 64 }); nm.position.set(1.1, 3.95, .4); st.scene.add(nm);
    const tg = textSign(1.6, .42, 'NEW IN TOWN', { color: 0xc8202f, fg: '#fff', size: 52 }); tg.position.set(1.2, 3.42, .5); tg.rotation.z = -.06; st.scene.add(tg);
    return { ...st, update(t, s, d) {
      const on = seg(t, .3, .4); spot.intensity = on * 45;
      lu.pose({ s, eyeX: lerp(.2, .9, seg(t, .1, .35)), lookY: lerp(.2, .55, seg(t, .1, .4)), brow: -.6, mouth: 'smile', happy: seg(t, .4, .5) * .7, armL: [-.5, .2], armR: [-.4, .25] });
      ds.forEach((dd, i) => dd.pose({ s: s + i * .7, seed: i * .2, mouth: 'flat' }));
      po.pose({ s, sweat: t > .55, brow: .7, mouth: 'smile', happy: .2, lookY: -.3, eyeX: -.4, armR: [-.2, .3 + Math.sin(s * 4) * .05], armL: [-.9, .2], wide: .3 });
      nm.scale.setScalar(t > .5 ? Math.min(1, pop((t - .5) * d)) : 0); tg.scale.setScalar(t > .66 ? Math.min(1.1, pop((t - .66) * d)) : 0);
      const k = ease(seg(t, .25, .55)); aim(st.cam, [lerp(-.4, .8, k), lerp(3.2, 3.1, k), lerp(9.0, 7.6, k)], [lerp(0, .7, k), 2.5, 0]);
    } };
  };
  BUILD.cc_hint = () => {
    const st = stage(ROOM);
    const lu = lustig(); lu.position.set(-1.05, 0, 0); lu.rotation.y = .45; st.scene.add(lu);
    const po = poisson(); po.position.set(1.1, 0, 0); po.rotation.y = -.45; st.scene.add(po);
    const sigh = bubble(2.2, .95, (x, w, h) => { label(x, '“So poorly paid…”', w / 2, h / 2 + 4, h * .3, '#2a1a12', 800); }, -1); sigh.position.set(-.55, 4.15, .9); st.scene.add(sigh);
    const think = bubble(1.0, .8, (x, w, h) => { x.fillStyle = '#4c8a48'; x.beginPath(); x.arc(w / 2, h / 2, h * .32, 0, 7); x.fill(); label(x, '₣', w / 2, h / 2 + 4, h * .4, '#e8ffe4'); }, 1); think.position.set(1.15, 4.1, .9); st.scene.add(think);
    const env = cashStack(5); st.scene.add(env);
    return { ...st, update(t, s, d) {
      const a = seg(t, .05, .45), b = seg(t, .5, .7), c = seg(t, .72, 1);
      lu.pose({ s, talk: a > 0 && a < 1 ? 1 : 0, brow: .5, mouth: 'frown', tilt: -.12 * (a > 0 && a < 1), armR: [-.4, .7 + Math.sin(s * 9) * .05 * (a < 1 ? 1 : 0)], armL: [-.2, .2], eyeX: c > 0 ? .5 : .1, happy: c * .6, lookX: c > 0 ? .15 : 0 });
      sigh.scale.setScalar(a > 0 && t < .62 ? Math.min(1, pop(a * d * .4)) : 0);
      think.scale.setScalar(b > 0 && t < .8 ? Math.min(1, pop(b * d * .2)) : 0);
      po.pose({ s, brow: lerp(.4, -.2, b), mouth: 'smile', happy: b * .5, wide: b * (1 - c), lookY: -.2, armR: [-.2, .2], armL: c > 0 ? [-1.25 * ease(seg(c, 0, .5)), .1] : [-.1, .2] });
      env.visible = c > 0; po.updateMatrixWorld(true); const hp = po.hand(-1).getWorldPosition(new THREE.Vector3()); env.position.set(hp.x - .15, hp.y - .05, hp.z + .15); env.rotation.y = .4;
      aim(st.cam, [Math.sin(s * .2) * .5, 3.0, lerp(9.2, 8.6, t)], [0, 2.55, 0]);
    } };
  };
  BUILD.cc_proof = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#2a1a3a', bottom: '#6a3a5a', floor: 0x3a2a3a }));
    const po = poisson(); po.position.set(0, 0, 0); st.scene.add(po);
    const badge = sign(2.4, .74, (x, w, h) => { x.fillStyle = '#2f8a48'; rrect(x, 0, 0, w, h, 24); x.fill(); label(x, '✔ HE MUST BE REAL', w / 2, h / 2 + 4, h * .4, '#ffffff'); }, { color: 0x2f8a48, depth: .2 });
    badge.position.set(0, 3.95, .4); st.scene.add(badge);
    const bulb = G(M(SPH(.3, 24, 16), glowM(0xffe47a, 2.5)), M(new THREE.CylinderGeometry(.14, .14, .2, 16), metal(0x9a9a9a), { pos: [0, -.32, 0] })); bulb.position.set(.9, 3.6, .4); st.scene.add(bulb);
    const gl = sprite(0xffe47a, 2.0, .8); gl.position.copy(bulb.position); st.scene.add(gl);
    const sp = sparkles(20, [0, 3.2, .3], 1.8, 0xffffff, 6); st.scene.add(sp);
    return { ...st, update(t, s, d) {
      const k = seg(t, .3, .4);
      po.pose({ s, brow: lerp(.5, -.1, k), happy: k * .8, mouth: 'smile', wide: k * .5, armR: [0, .3 + k * 2.4], armL: [-.2, .2], hop: Math.max(0, Math.sin(clamp((t - .4) * 4) * Math.PI)) * .2, eyeY: k * .4 });
      bulb.scale.setScalar(Math.min(1.1, pop((t - .3) * d))); gl.visible = k > 0; gl.material.opacity = .6 + Math.sin(s * 8) * .2;
      badge.scale.setScalar(t > .5 ? Math.min(1.1, pop((t - .5) * d)) : 0); badge.rotation.z = Math.sin(s * 2) * .03; sp.visible = t > .5; sp.update(s);
      aim(st.cam, [0, 3.2, lerp(7.4, 6.6, ease(t))], [0, 2.75, 0]);
    } };
  };
  BUILD.cc_train = () => {
    const st = stage(Object.assign({}, DUSK, { top: '#2a3a7a', bottom: '#f2a07a', floor: 0x8aa86a, shadowBox: 10 }));
    const train = new THREE.Group(); st.scene.add(train);
    const car = (x, col) => { const g = new THREE.Group(); g.position.x = x; g.add(M(RB(3.0, 1.5, 1.4, .2), plastic(col), { pos: [0, 1.25, 0] }), M(RB(3.1, .14, 1.5, .06), plastic(0x2a1a12), { pos: [0, 2.05, 0] }));
      for (let i = 0; i < 3; i++) g.add(M(RB(.6, .55, .05, .08), glowM(0xffd98a, 1.4), { pos: [-.95 + i * .95, 1.4, .71], shadow: false }));
      [-1, 1].forEach(sd => g.add(M(new THREE.CylinderGeometry(.28, .28, .14, 20), metal(0x3a3a3a), { pos: [sd * 1.0, .35, .7], rot: [Math.PI / 2, 0, 0] }))); train.add(g); return g; };
    car(0, 0x2f5a3a); car(3.15, 0x7a2a2a);
    const loco = new THREE.Group(); loco.position.x = -3.2; train.add(loco);
    loco.add(M(new THREE.CylinderGeometry(.62, .62, 2.6, 24), plastic(0x1a1a22), { pos: [.1, 1.25, 0], rot: [0, 0, Math.PI / 2] }), M(RB(1.1, 1.8, 1.3, .12), plastic(0x1a1a22), { pos: [1.0, 1.5, 0] }), M(new THREE.CylinderGeometry(.18, .24, .6, 16), plastic(0x1a1a22), { pos: [-.7, 2.1, 0] }));
    loco.add(M(SPH(.16, 16, 12), glowM(0xfff2c0, 3), { pos: [-1.2, 1.3, .3], shadow: false }));
    const puffs = [0, 1, 2, 3, 4].map(i => { const p = M(SPH(.35, 16, 12), matte(0xffffff, { transparent: true, opacity: .8 }), { shadow: false }); st.scene.add(p); return p; });
    const lu = lustig(); lu.scale.setScalar(.5); lu.position.set(0, .6, .2); train.children[0].add(lu);
    const sc = suitcase(); sc.scale.setScalar(.4); sc.position.set(.55, .6, .3); train.children[0].add(sc);
    const bills = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const b = bill(); st.scene.add(b); return b; });
    const sgn = textSign(1.6, .5, '→ VIENNA', { color: 0xf3e3c3, fg: '#2a1a12', size: 64 }); sgn.position.set(2.6, 2.8, 1.8); st.scene.add(sgn);
    st.scene.add(M(new THREE.CylinderGeometry(.05, .05, 2.6, 8), metal(0x777777), { pos: [2.6, 1.3, 1.75] }));
    const rails = M(RB(30, .08, 1.6, .02), matte(0x6a5a4a), { pos: [0, .05, 0] }); st.scene.add(rails);
    for (let i = 0; i < 30; i++) st.scene.add(M(RB(.2, .06, 1.9, .02), matte(0x5a3a2a), { pos: [-15 + i, .04, 0] }));
    const r = rng(4); for (let i = 0; i < 9; i++) { const x = -12 + i * 3 + r(); st.scene.add(G(M(new THREE.CylinderGeometry(.1, .14, .8, 8), matte(0x6a4a2a), { pos: [x, .4, -3 - r() * 2] }), M(SPH(.7, 16, 12), plastic(0x3e7a3a, { clearcoat: .2 }), { pos: [x, 1.2, -3 - r() * 2] }))); }
    return { ...st, update(t, s, d) {
      const x = lerp(-2.5, 3.5, ease(seg(t, .2, 1))) ; train.position.x = x;
      lu.pose({ s, happy: .8, mouth: 'smile', waveR: t > .45 ? 1 : 0, brow: -.3, lookY: .4 });
      puffs.forEach((p, i) => { const ph = frac(s * .7 + i / 5); p.position.set(x - 3.9 - ph * 1.5, 2.5 + ph * 1.6, 0); p.scale.setScalar(.4 + ph * 1.1); p.material.opacity = .8 * (1 - ph); });
      bills.forEach((b, i) => { const ph = frac(s * .5 + i / 8); b.visible = t > .35; b.position.set(x + .6 - ph * 3.5, 1.8 + Math.sin(ph * 6 + i) * .4 + ph * 1.2, .9 + Math.sin(i) * .4); b.rotation.set(ph * 6 + i, ph * 4, i); });
      sgn.scale.setScalar(Math.min(1, pop(s - .3))); sgn.rotation.z = Math.sin(s * 2) * .03;
      aim(st.cam, [x * .6, 2.6, 8.6], [x * .7, 1.7, 0]);
    } };
  };
  BUILD.cc_silent = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#2a2a4a', bottom: '#7a6a8a', floor: 0x4a4458 }));
    const po = poisson(); po.position.set(0, 0, 0); st.scene.add(po);
    const papers = [0, 1, 2].map(i => { const p = newspaper(['RIEN', 'RIEN', 'RIEN'][i], ['nothing', 'still nothing', 'nothing at all'][i], 1.5, 2.0); st.scene.add(p); return p; });
    const blush = M(SPH(.3, 16, 12), matte(0xff5a6a, { transparent: true, opacity: 0 }), { shadow: false }); st.scene.add(blush);
    const shh = textSign(1.1, .5, '…', { color: 0xf3e3c3, fg: '#2a1a12', size: 90 }); shh.position.set(1.1, 4.0, .3); st.scene.add(shh);
    return { ...st, update(t, s, d) {
      papers.forEach((p, i) => { const k = seg(t, .05 + i * .12, .2 + i * .12), gone = seg(t, .55, .65); p.position.set(lerp(-3 + i * 3, -1.4 + i * 1.4, ease(k)), 4.3 - gone * 3 + Math.sin(s * 2 + i) * .05, .2 - i * .1); p.rotation.set(0, 0, (i - 1) * .1 + gone * (i - 1)); p.scale.setScalar(k * (1 - gone)); });
      const hide = ease(seg(t, .6, .75));
      po.pose({ s, brow: .8, mouth: 'frown', eyeX: Math.sin(s * 3) * .5 * (1 - hide), armR: [-hide * 2.2, .25 + hide * .35], armL: [-hide * 2.2, .25 + hide * .35], lookX: hide * .25, sweat: true, squash: hide * .05 });
      blush.position.set(0, 2.85, .55); blush.material.opacity = hide * .35; blush.scale.set(1.8, .7, .5);
      shh.scale.setScalar(t > .78 ? Math.min(1, pop((t - .78) * d)) : 0);
      aim(st.cam, [0, 3.1, lerp(7.2, 5.8, ease(t))], [0, 2.7, 0]);
    } };
  };
  BUILD.cc_again = () => {
    const st = stage(Object.assign({}, DUSK, { shadowBox: 11 })); const tw = tower(); tw.position.set(0, 0, -6); tw.scale.setScalar(1.2); st.scene.add(tw, parisRow(-10, 10, 20, 8));
    const lu = lustig(); st.scene.add(lu);
    const cop = gendarme(); st.scene.add(cop);
    const d2 = dealer(2); d2.position.set(2.2, 0, -1.5); d2.scale.setScalar(.85); st.scene.add(d2);
    const again = textSign(1.9, .55, 'AGAIN?!', { color: 0xffc44d, fg: '#2a1a12', size: 84 }); again.position.set(0, 4.5, 0); st.scene.add(again);
    const whistle = textSign(1.0, .45, 'TWEET!', { color: 0xffffff, fg: '#1f2c5c', size: 56 }); st.scene.add(whistle);
    const usa = textSign(1.7, .5, '→ AMERICA', { color: 0xf3e3c3, fg: '#2a1a12', size: 60 }); st.scene.add(usa);
    const dust = [0, 1, 2, 3].map(i => { const p = M(SPH(.2, 12, 8), matte(0xe8d0b0, { transparent: true, opacity: .7 }), { shadow: false }); st.scene.add(p); return p; });
    return { ...st, update(t, s, d) {
      const run = seg(t, .55, 1), lux = -1 + lerp(0, 6.5, run * run * .6 + run * .4);
      lu.position.set(lux, 0, .5); lu.rotation.y = run > 0 ? Math.PI / 2 : .3;
      lu.pose({ s, walk: run > 0 ? s * 16 : undefined, talk: run > 0 ? 0 : 1, mouth: run > 0 ? 'open' : 'smile', open: .5, wide: run > 0 ? .6 : 0, brow: run > 0 ? .7 : -.3, armR: run > 0 ? undefined : [-.5, .8], lean: run > 0 ? .25 : 0 });
      d2.pose({ s, mouth: t > .35 ? 'open' : 'smile', open: .4, brow: -.5, armR: t > .4 ? [-1.5, .3] : [0, .2], lookY: -.4 });
      const cin = seg(t, .4, .6); cop.position.set(Math.max(lerp(-6, -3.2, ease(cin)), lux - 2.1), 0, .3); cop.rotation.y = Math.PI / 2;
      cop.pose({ s: s + 1, walk: (cin > 0 && cin < 1) || run > 0 ? s * 15 : undefined, mouth: 'open', open: .3, brow: -.8, armR: [-1.4, .2], lean: .2 });
      again.scale.setScalar(t < .5 ? Math.min(1.1, pop(s - .2)) : Math.max(0, 1 - seg(t, .5, .55))); again.rotation.z = Math.sin(s * 5) * .06;
      whistle.position.set(cop.position.x + .6, 3.9, .5); whistle.scale.setScalar(cin > 0 ? Math.min(1, pop((t - .4) * d)) * (1 + Math.sin(s * 20) * .05) : 0);
      usa.position.set(lux, 4.0, .5); usa.scale.setScalar(t > .8 ? Math.min(1, pop((t - .8) * d)) : 0);
      dust.forEach((p, i) => { const ph = frac(s * 2 + i / 4); p.visible = run > 0; p.position.set(lu.position.x - .4 - ph * 1.2, .2 + ph * .4, .5 + (i % 2 - .5) * .3); p.scale.setScalar(.5 + ph); p.material.opacity = .7 * (1 - ph); });
      const fx = lux + .4; aim(st.cam, [fx, 3.0, 9.5], [fx - .3, 2.2, 0]);
    } };
  };
  BUILD.cc_jail = () => {
    const st = stage({ top: '#1a2a4a', bottom: '#5a7aa0', floor: null, fogColor: '#4a6a90', fogNear: 18, fogFar: 50, key: 0xdfe8ff, keyI: 2.2, rim: 0x9ac0ff, shadowBox: 9 });
    const sea = M(new THREE.CircleGeometry(80, 64), plastic(0x2a5a8a, { roughness: .15, clearcoat: 1 }), { rot: [-Math.PI / 2, 0, 0], shadow: false }); st.scene.add(sea);
    const isl = G(M(new THREE.CylinderGeometry(3.2, 3.8, 1.0, 24), matte(0x6a5a4a), { pos: [0, .3, 0] }), M(RB(3.6, 1.3, 1.8, .1), matte(0xe8e2d4), { pos: [-.3, 1.45, -.5] }), M(RB(2.0, .9, 1.3, .1), matte(0xdcd4c4), { pos: [1.4, 1.25, .6] }));
    for (let i = 0; i < 8; i++) isl.add(M(RB(.18, .3, .05, .03), matte(0x2a3a5a), { pos: [-1.8 + i * .4, 1.55, .41] }));
    const lh = G(M(new THREE.CylinderGeometry(.18, .26, 2.2, 16), matte(0xf4f0e8), { pos: [2.0, 1.9, -1.0] }), M(SPH(.2, 16, 12), glowM(0xfff2b0, 3), { pos: [2.0, 3.1, -1.0] })); isl.add(lh);
    isl.position.set(0, 0, -3.5); st.scene.add(isl);
    const beam = sprite(0xfff2b0, 2.4, .8); beam.position.set(2.0, 3.1, -4.5); st.scene.add(beam);
    const cell = new THREE.Group(); cell.position.set(0, 0, 2.2); st.scene.add(cell);
    const lu = makeHuman(Object.assign({}, LUSTIG, { suit: 0xd8d2c0, pants: 0xd8d2c0, tie: null, shirt: 0xd8d2c0, hat: undefined, hairStyle: 'slick' })); lu.scale.setScalar(.75); lu.position.set(0, 0, -.5); cell.add(lu);
    cell.add(M(RB(3.2, .2, 1.6, .05), matte(0x7a7a80), { pos: [0, .1, -.4] }));
    for (let i = 0; i < 9; i++) cell.add(M(new THREE.CylinderGeometry(.05, .05, 3.3, 12), metal(0x8a8f99), { pos: [-1.6 + i * .4, 1.65, .4] }));
    cell.add(M(RB(3.4, .14, .14, .04), metal(0x8a8f99), { pos: [0, 3.3, .4] }), M(RB(3.4, .14, .14, .04), metal(0x8a8f99), { pos: [0, .2, .4] }));
    const fake = G(bill(), bill()); fake.children[1].position.set(.2, -.15, .02); fake.position.set(-1.4, 3.9, .8); st.scene.add(fake);
    const fk = textSign(1.4, .45, 'FAKE', { color: 0xc8202f, fg: '#fff', size: 64 }); fk.position.set(-1.4, 4.45, .9); fk.rotation.z = .12; st.scene.add(fk);
    const yr = textSign(1.5, .5, '1947', { color: 0xf3e3c3, fg: '#2a1a12', size: 72, font: MONO }); yr.position.set(1.3, 4.2, .8); st.scene.add(yr);
    const nm = textSign(2.1, .5, 'ALCATRAZ', { color: 0x1d2442, fg: '#ffffff', size: 66 }); nm.position.set(0, 3.45, 2.9); st.scene.add(nm);
    return { ...st, update(t, s, d) {
      const into = ease(seg(t, .2, .45));
      lu.pose({ s, mouth: 'frown', brow: .6, eyeX: Math.sin(s * .7) * .3, armR: [-.5, .2], armL: [-.5, .2], lookX: .1 });
      fake.scale.setScalar(t < .35 ? Math.min(1, pop(s - .1)) : Math.max(0, 1 - seg(t, .35, .4))); fk.scale.copy(fake.scale); fake.rotation.z = Math.sin(s * 3) * .1;
      nm.scale.setScalar(t > .3 && t < .6 ? Math.min(1, pop((t - .3) * d)) : 0);
      yr.scale.setScalar(t > .68 ? Math.min(1, pop((t - .68) * d)) : 0);
      beam.material.opacity = .5 + Math.sin(s * 3) * .4;
      aim(st.cam, [lerp(0, .2, into), lerp(5.0, 2.6, into), lerp(14, 7.6, into)], [0, lerp(1.6, 2.0, into), lerp(-2.5, 1.6, into)]);
    } };
  };
  BUILD.cc_outro = () => {
    const st = stage(NIGHT); const tw = tower(0x9a6a4a); tw.position.set(0, 0, -1.2); tw.scale.setScalar(1.05); st.scene.add(tw, parisRow(-7, 10, 18, 9));
    const sold = textSign(2.4, .7, 'NEVER FOR SALE', { color: 0x2f8a48, fg: '#fff', size: 66 }); sold.position.set(0, 1.8, 1.4); st.scene.add(sold);
    const q = bubble(3.3, 1.2, (x, w, h) => { label(x, 'Would YOU fall for it?', w / 2, h / 2 + 4, h * .3, '#2a1a12', 900); }, 0); q.position.set(0, 4.3, 1.6); st.scene.add(q);
    const btn = textSign(2.5, .75, 'FOLLOW  +', { color: 0xc8202f, fg: '#ffffff', size: 100, depth: .35 }); btn.position.set(0, 3.0, 2.0); st.scene.add(btn);
    const sp = sparkles(30, [0, 4.5, -1.2], 3, 0xfff2c0, 12); st.scene.add(sp);
    return { ...st, update(t, s, d) {
      sold.scale.setScalar(Math.min(1, pop(s - .2))); sold.rotation.z = Math.sin(s * 1.6) * .03;
      q.scale.setScalar(t > .35 ? Math.min(1, pop((t - .35) * d)) : 0);
      btn.scale.setScalar(t > .65 ? Math.min(1, pop((t - .65) * d)) * (1 + Math.sin(s * 5) * .03) : 0);
      tw.userData.beacon.material.opacity = .6 + Math.sin(s * 4) * .3; sp.update(s);
      aim(st.cam, [Math.sin(s * .25) * 1.5, 2.4, 9.6], [0, 3.0, 0]);
    } };
  };

  // ---------- episode 2: D.B. Cooper ----------
  const COOPER = { suit: 0x1c1f2a, pants: 0x1c1f2a, tie: 0x0d0d12, shirt: 0xf6f3ea, hair: 0x1a120c, hairStyle: 'side', shades: true, skin: 0xe8b48e, brow: -.2 };
  const ATTENDANT = { suit: 0x1f8a8a, pants: 0xe8b8a0, skirt: 0x1f8a8a, tie: null, shirt: 0xffffff, hair: 0xb5562a, hairStyle: 'bob', hat: 'pillbox', hatCol: 0x1f8a8a, iris: 0x3a6a3a, skin: 0xf6cfb0, shoe: 0x1f2a2a };
  const BRIAN = { suit: 0xd23a2a, pants: 0x3a5a8a, tie: null, shirt: 0xd23a2a, hair: 0x7a4a24, hairStyle: 'curly', headScale: 1.3, iris: 0x6b4a2a, skin: 0xf6cfb0, nose: .11 };
  const cooper = () => makeHuman(COOPER), attendant = () => makeHuman(ATTENDANT);
  const agent = (i = 0) => makeHuman({ suit: [0xb89a6a, 0x9a8a6a][i % 2], pants: 0x3a3a44, tie: 0x2a2a3a, hat: 'fedora', hatCol: 0x4a4038, band: 0x2a2018, hair: 0x3a2a1e, stache: i % 2 === 1, brow: -.4 });
  const brian = () => { const h = makeHuman(BRIAN); h.scale.setScalar(.6); return h; };
  // Boeing 727-style jet: three tail engines, T-tail and the rear airstair (stairs.rotation.x lowers it). Faces +x.
  function jet(o = {}) {
    const g = new THREE.Group(), white = plastic(0xf4f2ee), stripe = plastic(o.stripe ?? 0xc8202f);
    const win = ctex(1024, 64, (x, w, h) => { x.fillStyle = '#f4f2ee'; x.fillRect(0, 0, w, h); x.fillStyle = o.night ? '#ffd98a' : '#2a3450'; for (let i = 0; i < 30; i++) { rrect(x, 80 + i * 29, 18, 16, 26, 7); x.fill(); } });
    g.add(M(new THREE.CapsuleGeometry(.62, 6.4, 12, 32), white, { rot: [0, 0, Math.PI / 2] }));
    g.add(M(new THREE.CylinderGeometry(.635, .635, 6.0, 32, 1, true, Math.PI * .35, Math.PI * .3), new THREE.MeshStandardMaterial({ map: win.tex, roughness: .4, side: THREE.DoubleSide }), { rot: [0, 0, Math.PI / 2], shadow: false }));
    g.add(M(new THREE.CylinderGeometry(.64, .64, 6.6, 32, 1, true, Math.PI * .6, Math.PI * .06), stripe, { rot: [0, 0, Math.PI / 2], shadow: false }));
    g.add(M(new THREE.CylinderGeometry(.64, .64, 6.6, 32, 1, true, Math.PI * 1.34, Math.PI * .06), stripe, { rot: [0, 0, Math.PI / 2], shadow: false }));
    g.add(M(RB(.5, .3, .9, .1), plastic(0x2a3450, { roughness: .1, clearcoat: 1 }), { pos: [3.55, .25, 0], scale: [.6, .5, .9] }));
    [-1, 1].forEach(s => { const wg = M(RB(1.6, .1, 4.2, .05), white, { pos: [.1, -.25, s * 2.3], rot: [0, s * .45, 0] }); g.add(wg); });
    [-1, 1].forEach(s => g.add(M(RB(.7, .06, 1.6, .03), white, { pos: [-3.4, 2.05, s * .7], rot: [0, s * .4, 0] })));
    g.add(M(RB(1.3, 1.9, .1, .05), white, { pos: [-3.2, 1.15, 0], rot: [0, 0, -.35] }), M(RB(1.1, .5, .12, .05), stripe, { pos: [-3.3, 1.2, 0], rot: [0, 0, -.35] }));
    [-1, 0, 1].forEach(s => g.add(M(new THREE.CylinderGeometry(.24, .26, 1.1, 20), plastic(0xc9cdd8), { pos: [-2.6, s === 0 ? .85 : .25, s * .78], rot: [0, 0, Math.PI / 2] })));
    const stairs = new THREE.Group(); stairs.position.set(-3.2, -.45, 0); g.add(stairs);
    stairs.add(M(RB(1.9, .08, .6, .03), plastic(0xc9cdd8), { pos: [-.95, 0, 0] }));
    for (let i = 0; i < 6; i++) stairs.add(M(RB(.08, .12, .56, .02), metal(0x9aa0aa), { pos: [-.2 - i * .3, .08, 0] }));
    g.userData.stairs = stairs; const beacon = sprite(0xff3a3a, .5, .9); beacon.position.set(-3.6, 2.15, 0); g.add(beacon); g.userData.beacon = beacon;
    return g;
  }
  function rain(n = 260, area = [14, 12, 8], center = [0, 4, 0], seed = 2) {
    const r = rng(seed), im = new THREE.InstancedMesh(new THREE.BoxGeometry(.015, .45, .015), new THREE.MeshBasicMaterial({ color: 0xbfd4ff, transparent: true, opacity: .45, depthWrite: false }), n);
    const P = []; for (let i = 0; i < n; i++) P.push([r() - .5, r(), r() - .5, .7 + r() * .6]);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, .25)), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
    im.update = s => { P.forEach(([x, y, z, sp], i) => { v.set(center[0] + x * area[0] + frac(y + s * sp * 1.2) * area[1] * .25, center[1] + (1 - frac(y + s * sp * 1.2)) * area[1] - area[1] / 2, center[2] + z * area[2]); m.compose(v, q, one); im.setMatrixAt(i, m); }); im.instanceMatrix.needsUpdate = true; };
    im.castShadow = false; im.update(0); return im;
  }
  function chute(col = 0xf2f2f2, col2 = 0xc8202f) {
    const g = new THREE.Group();
    for (let i = 0; i < 8; i++) g.add(M(new THREE.SphereGeometry(1.4, 8, 12, i * Math.PI / 4, Math.PI / 4, 0, Math.PI * .42), plastic(i % 2 ? col : col2, { side: THREE.DoubleSide, roughness: .6 }), { pos: [0, 0, 0] }));
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, top = V(Math.cos(a) * 1.35, .35, Math.sin(a) * 1.35); g.add(M(new THREE.TubeGeometry(new THREE.LineCurve3(top, V(0, -1.8, 0)), 2, .012, 4), matte(0xdddddd), { shadow: false })); }
    return g;
  }
  function pine(x, z, h = 2, col = 0x1f4a3a) { return G(M(new THREE.CylinderGeometry(.08, .12, h * .3, 8), matte(0x4a3020), { pos: [x, h * .15, z] }), M(new THREE.ConeGeometry(h * .3, h * .75, 10), plastic(col, { clearcoat: .1, roughness: .7 }), { pos: [x, h * .62, z] }), M(new THREE.ConeGeometry(h * .22, h * .5, 10), plastic(col, { clearcoat: .1, roughness: .7 }), { pos: [x, h * .95, z] })); }
  function forest(n = 40, w = 30, d = 14, z0 = 0, seed = 5, col) { const r = rng(seed), g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(pine((r() - .5) * w, z0 - r() * d, 1.4 + r() * 1.6, col)); return g; }
  function seatRow(x, z, col = 0x3a5a9a) { const g = new THREE.Group(); g.position.set(x, 0, z);
    [-1, 0, 1].forEach(i => g.add(M(RB(.9, .5, .8, .12), plastic(col, { roughness: .7, clearcoat: .1 }), { pos: [i * .95, .45, 0] }), M(RB(.9, 1.3, .25, .12), plastic(col, { roughness: .7, clearcoat: .1 }), { pos: [i * .95, 1.15, -.4] }), M(RB(.5, .2, .27, .06), plastic(0xf2efe6), { pos: [i * .95, 1.75, -.4] })));
    return g; }
  function cabin(st, night = true) {
    const wall = ctex(1024, 512, (x, w, h) => { x.fillStyle = '#e9e2d2'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8cdb6'; x.fillRect(0, h * .78, w, h * .22);
      for (let i = 0; i < 4; i++) { rrect(x, 90 + i * 240, 120, 120, 170, 50); x.fillStyle = night ? '#1a2440' : '#9ac8ff'; x.fill(); x.strokeStyle = '#c8bca4'; x.lineWidth = 14; x.stroke(); } });
    st.scene.add(M(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshStandardMaterial({ map: wall.tex, roughness: .8 }), { pos: [0, 2.25, -1.6], shadow: false }));
    st.scene.add(M(RB(9, .3, 3, .1), matte(0xd8cdb6), { pos: [0, 4.4, 0] }));
    for (let i = 0; i < 4; i++) st.scene.add(M(RB(.7, .1, .5, .05), glowM(0xfff2d0, .8), { pos: [-3 + i * 2, 4.24, .2], shadow: false }));
  }
  const cityLights = (n = 60, seed = 3) => { const r = rng(seed), g = new THREE.Group(); for (let i = 0; i < n; i++) { const s = sprite([0xffd98a, 0xffffff, 0xff9a5a][i % 3], .2 + r() * .25, .9); s.position.set((r() - .5) * 24, .1, -4 - r() * 14); g.add(s); } return g; };
  const STORM = { top: '#070a1c', bottom: '#1e2a4e', floor: null, fogColor: '#1a2444', fogNear: 10, fogFar: 40, key: 0xbfd0ff, keyI: 1.6, rim: 0x7aa8ff, rimI: 2.2, hemi: .5, shadowBox: 10 };
  function titleSet(p, mood, make, extra) {
    const st = stage(mood); const who = make(); who.position.set(0, 0, .6); who.scale.setScalar(.9); st.scene.add(who);
    const s1 = textSign(3.6, .82, p.top, { color: 0xf3e3c3, fg: '#2a1a12' }), s2 = textSign(3.6, .8, p.bottom, { color: 0xc8202f, fg: '#ffffff', size: 92 });
    s1.position.set(0, 4.95, 0); s2.position.set(0, 4.1, .2); st.scene.add(s1, s2);
    const cs = textSign(1.5, .46, p.case, { color: 0x1d2442, fg: '#ffc44d', size: 60, font: MONO }); cs.position.set(-1.0, 5.7, -.2); cs.rotation.z = .08; st.scene.add(cs);
    const spot = new THREE.SpotLight(0xfff1d0, 40, 14, .35, .5); spot.position.set(0, 8, 3); spot.target = who; st.scene.add(spot);
    const ex = extra ? extra(st, who) : null;
    return { ...st, update(t, s) {
      who.pose({ s, armR: [0, .2], armL: [-.3, .5], lookY: Math.sin(s * .8) * .15, mouth: 'smile', happy: .2, brow: -.3 });
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .3)); cs.scale.setScalar(pop(s - .6)); s1.rotation.z = Math.sin(s * 1.6) * .02;
      if (ex) ex(t, s);
      const a = Math.sin(s * .35) * .2; aim(st.cam, [Math.sin(a) * 10, 3.3, Math.cos(a) * 10], [0, 3.0, 0]);
    } };
  }
  const handProp = (h, side, prop, off = [0, -.12, .12]) => { h.updateMatrixWorld(true); const v = h.hand(side).getWorldPosition(new THREE.Vector3()); prop.position.set(v.x + off[0], v.y + off[1], v.z + off[2]); };

  BUILD.db_hook = () => {
    const st = stage(STORM); const j = jet({ night: true }); j.scale.setScalar(.55); st.scene.add(j);
    const co = makeHuman(Object.assign({}, COOPER, { hairStyle: 'side' })); co.scale.setScalar(.42); st.scene.add(co);
    const ch = chute(); ch.scale.setScalar(.6); st.scene.add(ch);
    const bills = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => { const b = bill(); b.scale.setScalar(.7); st.scene.add(b); return b; });
    const rn = rain(300, [12, 14, 6], [0, 3, 0]); st.scene.add(rn); st.scene.add(forest(60, 30, 10, -2, 7, 0x16302a));
    const flash = new THREE.AmbientLight(0xcfe0ff, 0); st.scene.add(flash);
    const gone = textSign(2.6, .62, 'NEVER SEEN AGAIN', { color: 0xc8202f, fg: '#fff', size: 66 }); gone.position.set(0, 1.6, 1.5); st.scene.add(gone);
    const yr = textSign(1.2, .46, '1971', { color: 0xf3e3c3, fg: '#2a1a12', size: 70, font: MONO }); yr.position.set(-.6, 4.6, 1); st.scene.add(yr);
    return { ...st, update(t, s, d) {
      j.position.set(lerp(-7, 7, t), 5.0, -2); j.rotation.z = .04;
      const open = seg(t, .42, .5), ff = seg(t, .22, .45), y = open > 0 ? lerp(3.4, 1.3, ease(seg(t, .45, 1))) : lerp(4.7, 3.4, ff * ff);
      co.visible = t > .22; co.position.set(-.3 + Math.sin(s * .8) * .25, y, -.6); co.rotation.z = open > 0 ? Math.sin(s * 2) * .1 : s * 3;
      co.pose({ s, armR: [0, 2.6], armL: [0, 2.6], mouth: 'smile', happy: .3 });
      ch.visible = open > 0; ch.scale.setScalar(.6 * Math.min(1, pop(open * 2))); ch.position.set(co.position.x, co.position.y + 1.85, co.position.z); ch.rotation.z = co.rotation.z;
      bills.forEach((b, i) => { const ph = frac(s * .25 + i / 10); b.visible = t > .3; b.position.set(co.position.x + Math.sin(i * 2.1 + s) * 1.6, co.position.y + .8 - ph * 3, -1.4 + Math.cos(i) * .8); b.rotation.set(s * 2 + i, s + i, i); });
      rn.update(s); const lf = Math.max(0, 1 - Math.abs(s - .35 * d) * 6) + Math.max(0, 1 - Math.abs(s - .8 * d) * 6) * .7; flash.intensity = lf * 3;
      gone.scale.setScalar(t > .78 ? Math.min(1.1, pop((t - .78) * d)) : 0); yr.scale.setScalar(Math.min(1, pop(s - .3))) ;
      aim(st.cam, [0, 3.2, 10], [0, 3.0, -1]);
    } };
  };
  BUILD.db_title = (p) => titleSet(p, Object.assign({}, STORM, { floor: 0x1a2240, top: '#0d1230', bottom: '#2a3a6a' }), () => { const c = cooper(); const bc = suitcase(); bc.scale.set(.5, .5, .5); bc.children[0].material = plastic(0x15151c); bc.position.set(.72, .3, .1); c.add(bc); return c; },
    (st) => { const rn = rain(200, [10, 10, 6], [0, 4, 0]); st.scene.add(rn); return (t, s) => rn.update(s); });
  BUILD.db_seat = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#2a2a3a', bottom: '#4a4050', floor: 0x5a3a4a, key: 0xfff0d8 })); cabin(st);
    const row = seatRow(.2, .2); st.scene.add(row);
    const co = cooper(); co.position.set(-.75, -.45 + .0, .25); st.scene.add(co);
    const front = seatRow(.2, 1.9); front.scale.set(1, .75, 1); st.scene.add(front);
    const gl = G(M(new THREE.CylinderGeometry(.09, .07, .22, 16), plastic(0xffffff, { transparent: true, opacity: .5, roughness: .05 })), M(new THREE.CylinderGeometry(.08, .065, .12, 16), matte(0xc87a2a), { pos: [0, -.04, 0] })); st.scene.add(gl);
    const tk = sign(1.8, .7, (x, w, h) => { x.fillStyle = '#fbf6ea'; rrect(x, 0, 0, w, h, 20); x.fill(); label(x, 'NAME: DAN COOPER', w / 2, h * .32, h * .2, '#1d2442', 900, 'center', MONO); label(x, 'PORTLAND → SEATTLE', w / 2, h * .7, h * .17, '#c8202f', 800); }, { color: 0xfbf6ea, depth: .04 });
    tk.position.set(-.2, 3.3, 1.2); tk.rotation.z = -.05; st.scene.add(tk);
    const dt = textSign(1.9, .48, 'NOV 24, 1971', { color: 0x1d2442, fg: '#ffc44d', size: 60, font: MONO }); dt.position.set(-.2, 3.88, 1.0); st.scene.add(dt);
    return { ...st, update(t, s, d) {
      co.pose({ s, sit: 1, armR: t > .55 ? [-1.0 - Math.max(0, Math.sin(s * 1.2)) * .2, .1] : [-.8, .15], armL: [-.8, .15], lookY: t > .7 ? .5 : 0, mouth: 'smile', happy: .1, brow: -.15 });
      handProp(co, 1, gl, [0, .1, .1]); gl.visible = t > .55;
      dt.scale.setScalar(Math.min(1, pop(s - .3))); tk.scale.setScalar(t > .35 ? Math.min(1, pop((t - .35) * d)) : 0);
      aim(st.cam, [lerp(1.6, .9, ease(t)), 3.0, lerp(7.4, 6.6, ease(t))], [-.3, 2.25, .3]);
    } };
  };
  BUILD.db_note = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#2a2a3a', bottom: '#4a4050', floor: 0x5a3a4a, key: 0xfff0d8 })); cabin(st);
    st.scene.add(seatRow(-.4, -.2));
    const co = cooper(); co.position.set(.55, -.45, -.15); st.scene.add(co);
    const fa = attendant(); fa.position.set(-1.25, 0, 1.0); fa.rotation.y = .5; st.scene.add(fa);
    const note = sign(.5, .34, (x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#9a9a9a'; for (let i = 0; i < 3; i++) x.fillRect(w * .1, h * (.25 + i * .22), w * .8, h * .06); }, { color: 0xfbf6ea, depth: .02 }); st.scene.add(note);
    const say = bubble(2.3, .92, (x, w, h) => { label(x, '“Miss, you’d better', w / 2, h * .36, h * .22, '#2a1a12', 800); label(x, 'look at that note.”', w / 2, h * .68, h * .22, '#2a1a12', 800); }, 1); say.position.set(-.1, 3.8, 1.4); st.scene.add(say);
    const heart = textSign(.5, .5, '♥', { color: 0xffd0dc, fg: '#e84a6a', size: 100 }); heart.position.set(-.6, 3.9, 1.2); st.scene.add(heart);
    return { ...st, update(t, s, d) {
      const give = seg(t, .05, .25), pocket = seg(t, .3, .45), lean = seg(t, .5, .6), shock = seg(t, .85, .9);
      co.pose({ s, sit: 1, armL: give < 1 ? [-1.3 * give, .2] : [-.8, .15], armR: [-.8, .15], lean: lean * .25, talk: lean > 0 && t < .85 ? 1 : 0, mouth: 'smile', lookY: -.4, brow: -.2 });
      fa.pose({ s, armR: pocket < 1 ? [-1.1 * give * (1 - pocket), .2] : [-.1, .15], armL: [0, .15], mouth: shock > 0 ? 'open' : 'smile', open: .5, happy: (1 - shock) * .4, wide: shock, brow: shock > 0 ? .7 : 0, eyeX: .4, tilt: (1 - lean) * .1 });
      if (pocket < 1 && give > .5) handProp(fa, 1, note); else if (give <= .5) handProp(co, -1, note); else note.position.set(fa.position.x + .5, 1.6, fa.position.z + .3);
      note.visible = pocket < 1; note.rotation.set(0, .5, 0);
      heart.scale.setScalar(t > .28 && t < .5 ? Math.min(1, pop((t - .28) * d)) : 0);
      say.scale.setScalar(t > .58 ? Math.min(1, pop((t - .58) * d)) : 0);
      aim(st.cam, [lerp(-1.2, -.6, t), 3.0, lerp(7.6, 6.9, t)], [-.3, 2.3, .4]);
    } };
  };
  BUILD.db_case = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#1a1420', bottom: '#3a2a30', floor: 0x2a1a20, keyI: 1.4, hemi: .4 }));
    const bc = new THREE.Group(); bc.position.set(0, 1.2, 0); st.scene.add(bc);
    bc.add(M(RB(2.6, .5, 1.6, .1), plastic(0x15151c, { roughness: .35 }), { pos: [0, .25, 0] }));
    const lid = new THREE.Group(); lid.position.set(0, .5, -.8); bc.add(lid); lid.add(M(RB(2.6, .14, 1.6, .08), plastic(0x15151c, { roughness: .35 }), { pos: [0, .07, .8] }));
    [-1, 1].forEach(s => bc.add(M(RB(.2, .12, .1, .03), metal(0xd8b36a), { pos: [s * .8, .4, .82] })));
    bc.add(M(RB(2.4, .05, 1.4, .02), matte(0x5a1a2a), { pos: [0, .46, 0] }));
    for (let i = 0; i < 6; i++) bc.add(M(new THREE.CylinderGeometry(.11, .11, 1.0, 16), plastic(0xc8202f), { pos: [-.85 + i * .26, .62, -.15], rot: [Math.PI / 2, 0, 0] }));
    const wires = [0xffc44d, 0x35e0ff, 0xff4fa3, 0x59c21a].map((c, i) => { const cur = new THREE.CatmullRomCurve3([V(-1.0, .75, .4), V(-.3 + i * .2, 1.0 + i * .05, .5), V(.4, .7, .35 - i * .1), V(.9, .8, .2)]); return M(new THREE.TubeGeometry(cur, 30, .025, 6), plastic(c), { shadow: false }); }); wires.forEach(w => bc.add(w));
    const glow = sprite(0xff3a3a, 2.4, .0); glow.position.set(0, 2, .5); st.scene.add(glow);
    const m1 = textSign(1.9, .58, '$200,000', { color: 0x2f8a48, fg: '#fff', size: 100, font: MONO }), m2 = textSign(2.2, .56, '4 PARACHUTES', { color: 0xf3e3c3, fg: '#2a1a12', size: 72 });
    m1.position.set(0, 3.0, 1.0); m2.position.set(0, 2.42, 1.2); st.scene.add(m1, m2);
    return { ...st, update(t, s, d) {
      const op = ease(seg(t, .08, .3)); lid.rotation.x = -op * 1.9; glow.material.opacity = op * (.25 + Math.sin(s * 6) * .1);
      wires.forEach((w, i) => w.visible = op > .3);
      m1.scale.setScalar(t > .55 ? Math.min(1.1, pop((t - .55) * d)) : 0); m2.scale.setScalar(t > .75 ? Math.min(1.1, pop((t - .75) * d)) : 0); m1.rotation.z = Math.sin(s * 2) * .03;
      aim(st.cam, [Math.sin(s * .4) * .5, lerp(4.2, 3.7, t), lerp(5.4, 4.6, ease(t))], [0, 1.95, 0]);
    } };
  };
  BUILD.db_seattle = () => {
    const st = stage(Object.assign({}, STORM, { floor: 0x2a2f3a, fogNear: 16, fogFar: 45 }));
    const j = jet({ night: true }); j.position.set(.6, 1.0, -4.2); j.rotation.y = .25; st.scene.add(j); st.scene.add(cityLights(70));
    const pax = [0, 1, 2, 3, 4, 5].map(i => { const h = dealer(i); h.scale.setScalar(.42); st.scene.add(h); return h; });
    const ag = agent(0); ag.scale.setScalar(.6); ag.position.set(-1.6, 0, .9); ag.rotation.y = .6; st.scene.add(ag);
    const sack = G(M(SPH(.32, 20, 14), matte(0xc8b48a), { scale: [1, 1.2, .9] }), M(new THREE.CylinderGeometry(.06, .1, .2, 10), matte(0xa8946a), { pos: [0, .42, 0] })); st.scene.add(sack);
    const cnt = textSign(2.4, .6, '', { color: 0xf3e3c3, fg: '#2a1a12', size: 64 }); cnt.position.set(.4, 3.6, .8); st.scene.add(cnt);
    const rn = rain(220, [12, 10, 8], [0, 3, 0]); st.scene.add(rn);
    return { ...st, update(t, s, d) {
      pax.forEach((h, i) => { const k = seg(t, .3 + i * .07, .7 + i * .07); h.visible = k > 0; h.position.set(lerp(.6, 3.5 + (i % 2) * .6, k), 0, lerp(-1.6, 1.4, k) + i * .1); h.rotation.y = .9; h.pose({ s: s + i, walk: k > 0 && k < 1 ? s * 12 + i : undefined, mouth: 'smile', happy: .6 }); });
      ag.pose({ s, armR: [-.6, .2], armL: [-.3, .15], brow: -.4, mouth: 'flat', lookY: .4 }); handProp(ag, 1, sack, [.0, -.3, .1]);
      const n = Math.round(lerp(0, 36, ease(seg(t, .3, .9)))); cnt.userData.redraw((x, w, h) => label(x, `${n} PASSENGERS FREE`, w / 2, h / 2 + 4, h * .42, '#2a1a12', 900)); cnt.scale.setScalar(Math.min(1, pop(s - .3)));
      j.userData.beacon.material.opacity = Math.sin(s * 6) > 0 ? .9 : .1; rn.update(s);
      aim(st.cam, [lerp(-1.5, -.6, t), 2.6, 9.4], [.4, 1.7, -.6]);
    } };
  };
  BUILD.db_takeoff = () => {
    const st = stage(Object.assign({}, STORM, { floor: 0x1a1f2a }));
    const j = jet({ night: true }); st.scene.add(j); st.scene.add(cityLights(90, 7));
    const rn = rain(240, [14, 12, 8], [0, 4, 0]); st.scene.add(rn);
    const sth = textSign(1.7, .52, '↓ SOUTH', { color: 0xf3e3c3, fg: '#2a1a12', size: 70 }); sth.position.set(.9, 4.3, 1); st.scene.add(sth);
    const lo = textSign(1.9, .46, 'LOW & SLOW', { color: 0x1d2442, fg: '#ffc44d', size: 60 }); lo.position.set(-.3, 3.65, 1.2); st.scene.add(lo);
    return { ...st, update(t, s, d) {
      const k = ease(t); j.position.set(lerp(-4, 3, k), lerp(.8, 3.6, seg(t, .15, 1)), -2); j.rotation.z = lerp(0, .18, seg(t, .1, .4)) - seg(t, .7, 1) * .12;
      j.userData.beacon.material.opacity = Math.sin(s * 6) > 0 ? .9 : .1; rn.update(s);
      sth.scale.setScalar(t > .3 ? Math.min(1, pop((t - .3) * d)) : 0); lo.scale.setScalar(t > .55 ? Math.min(1, pop((t - .55) * d)) : 0);
      aim(st.cam, [0, 2.6, 10], [lerp(-1, 1.5, k), 2.5, -1]);
    } };
  };
  BUILD.db_stairs = () => {
    const st = stage(STORM); const j = jet({ night: true }); j.scale.setScalar(.8); j.position.set(2.0, 3.9, -1); j.rotation.y = .15; st.scene.add(j);
    st.scene.add(forest(90, 40, 16, -1, 9, 0x10261f)); const rn = rain(300, [12, 12, 8], [0, 3, 0]); st.scene.add(rn);
    const wind = [0, 1, 2, 3, 4, 5].map(i => { const w = M(RB(1.4, .02, .02, .01), new THREE.MeshBasicMaterial({ color: 0xdfe8ff, transparent: true, opacity: .5 }), { shadow: false }); st.scene.add(w); return w; });
    const tag = textSign(2.2, .52, 'REAR STAIRS', { color: 0xc8202f, fg: '#fff', size: 66 }); tag.position.set(-.3, 4.6, 1.6); st.scene.add(tag);
    return { ...st, update(t, s, d) {
      j.userData.stairs.rotation.z = ease(seg(t, .2, .7)) * .65; j.position.y = 3.9 + Math.sin(s * 1.5) * .05;
      wind.forEach((w, i) => { const ph = frac(s * 1.2 + i / 6); w.position.set(3 - ph * 7, 2.6 + i * .35, .5 - i * .2); w.material.opacity = .5 * Math.sin(ph * Math.PI); });
      tag.scale.setScalar(t > .45 ? Math.min(1, pop((t - .45) * d)) : 0); rn.update(s);
      aim(st.cam, [lerp(-1.8, -1.2, t), 2.8, 9.0], [.0, 3.2, -1]);
    } };
  };
  BUILD.db_jump = () => {
    const st = stage(STORM); const j = jet({ night: true }); j.scale.setScalar(.6); st.scene.add(j); j.userData.stairs.rotation.z = .65;
    st.scene.add(forest(90, 40, 16, -2, 11, 0x10261f)); const rn = rain(300, [12, 14, 8], [0, 3, 0]); st.scene.add(rn);
    const co = cooper(); co.scale.setScalar(.32); st.scene.add(co);
    const gone = textSign(1.6, .62, 'GONE.', { color: 0xc8202f, fg: '#fff', size: 100 }); gone.position.set(0, 2.2, 1.6); st.scene.add(gone);
    const flash = new THREE.AmbientLight(0xcfe0ff, 0); st.scene.add(flash);
    return { ...st, update(t, s, d) {
      const fly = t; j.position.set(lerp(2.4, 7.5, ease(seg(t, .4, 1))), 4.3, -1); j.rotation.y = .2;
      j.updateMatrixWorld(true); const tip = j.userData.stairs.localToWorld(V(-1.45, .05, 0));
      const jt = seg(t, .25, .75);
      if (jt === 0) { co.position.copy(tip); co.position.y -= .3; co.rotation.z = 0; co.pose({ s, armR: [0, .4], armL: [0, .4], mouth: 'smile', lookY: .3 }); }
      else { const ft = jt * d * .5; co.position.set(tip.x - .3 - ft * .6, tip.y - .2 - 2.4 * ft * ft - .4 * ft, -1); co.rotation.z = ft * 4; co.pose({ s, armR: [0, 2.4], armL: [0, 2.4], mouth: 'open', open: .4 }); }
      co.visible = t < .75; flash.intensity = (Math.max(0, 1 - Math.abs(t - .28) * 12) + Math.max(0, 1 - Math.abs(t - .78) * 25)) * 3;
      gone.scale.setScalar(t > .8 ? Math.min(1.1, pop((t - .8) * d)) : 0); rn.update(s);
      aim(st.cam, [-.4, 3.0, 9.6], [.3, 3.1, -1]);
    } };
  };
  const BEACH = { top: '#7ab8ff', bottom: '#ffe6c4', floor: 0xe8d2a6, fogColor: '#dfe8f0', key: 0xfff2dc, keyI: 2.8, rim: 0xbfe0ff, rimI: 1.6 };
  function beachSet(st) {
    const river = M(new THREE.PlaneGeometry(60, 18), plastic(0x3a8ac8, { roughness: .1, clearcoat: 1, transparent: true, opacity: .92 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, .03, -12], shadow: false }); st.scene.add(river);
    st.scene.add(forest(30, 40, 4, -22, 13, 0x3e7a4a));
    const logs = G(...[0, 1, 2].map(i => M(new THREE.CylinderGeometry(.08, .08, .9, 10), matte(0x7a5232), { pos: [0, .1, 0], rot: [Math.PI / 2, i * 1.05, 0] }))); logs.position.set(1.5, 0, .2); st.scene.add(logs);
    const r = rng(17); for (let i = 0; i < 6; i++) st.scene.add(M(new THREE.CylinderGeometry(.1, .12, 1.4 + r(), 8), matte(0xc8b08a), { pos: [(r() - .5) * 10, .1, -2 - r() * 4], rot: [Math.PI / 2, r() * 3, 0] }));
    return { river, logs };
  }
  BUILD.db_boy = () => {
    const st = stage(BEACH); const { logs } = beachSet(st);
    const dad = dealer(0), mom = makeHuman({ suit: 0x9a5aa0, pants: 0x3a3a6a, tie: null, shirt: 0x9a5aa0, hair: 0x6a3a1e, hairStyle: 'bob', skin: 0xf4c7a6 });
    dad.scale.setScalar(.85); mom.scale.setScalar(.82); dad.position.set(2.3, 0, -.6); mom.position.set(2.9, 0, .5); dad.rotation.y = -.6; mom.rotation.y = -.9; st.scene.add(dad, mom);
    const b = brian(); b.position.set(-.5, 0, .9); st.scene.add(b);
    const yr = textSign(1.2, .46, '1980', { color: 0xf3e3c3, fg: '#2a1a12', size: 70, font: MONO }); yr.position.set(.1, 3.65, 1.0); st.scene.add(yr);
    const nm = textSign(2.1, .5, 'BRIAN INGRAM, 8', { color: 0xc8202f, fg: '#fff', size: 58 }); nm.position.set(.1, 3.1, 1.4); st.scene.add(nm);
    const sand = [0, 1, 2, 3, 4].map(() => { const p = M(SPH(.06, 8, 6), matte(0xd8be8a), { shadow: false }); st.scene.add(p); return p; });
    return { ...st, update(t, s, d) {
      const dig = t > .55;
      b.pose({ s, lean: dig ? .5 : 0, armR: dig ? [-1.2 + Math.sin(s * 9) * .35, .2] : [0, .2], armL: dig ? [-1.2 - Math.sin(s * 9) * .35, .2] : [-.2, .3], mouth: 'smile', happy: .6, lookX: dig ? .3 : 0 });
      dad.pose({ s, lean: .25, armR: [-1.1 + Math.sin(s * 3) * .1, .1], mouth: 'smile', happy: .4 }); mom.pose({ s: s + 2, mouth: 'smile', happy: .5, talk: 1, armR: [-.3, .4] });
      sand.forEach((p, i) => { const ph = frac(s * 1.6 + i / 5); p.visible = dig; p.position.set(-.5 + Math.sin(i * 2) * .4 * ph, .1 + Math.sin(ph * Math.PI) * .7, 1.6 + ph * .2); });
      yr.scale.setScalar(Math.min(1, pop(s - .2))); nm.scale.setScalar(t > .3 ? Math.min(1, pop((t - .3) * d)) : 0);
      aim(st.cam, [lerp(-1.4, -.8, t), 2.7, lerp(8.4, 7.6, t)], [.6, 1.65, 0]);
    } };
  };
  BUILD.db_money = () => {
    const st = stage(BEACH); beachSet(st);
    const b = brian(); b.position.set(0, 0, .6); st.scene.add(b);
    const dad = dealer(0), mom = makeHuman({ suit: 0x9a5aa0, pants: 0x3a3a6a, tie: null, shirt: 0x9a5aa0, hair: 0x6a3a1e, hairStyle: 'bob', skin: 0xf4c7a6 });
    dad.scale.setScalar(.85); mom.scale.setScalar(.82); dad.position.set(-1.6, 0, -1.2); mom.position.set(1.6, 0, -1.2); dad.rotation.y = .4; mom.rotation.y = -.4; st.scene.add(dad, mom);
    const bundles = [0, 1].map(i => { const c = cashStack(4); c.children.forEach(m => m.material = matte(0x9aaa7a)); c.scale.setScalar(.7); st.scene.add(c); return c; });
    const amt = textSign(2.0, .66, '$5,800', { color: 0x2f8a48, fg: '#fff', size: 110, font: MONO }); amt.position.set(0, 3.25, .8); st.scene.add(amt);
    const mt = textSign(2.6, .5, 'SERIAL NUMBERS MATCH ✔', { color: 0xf3e3c3, fg: '#2a1a12', size: 46 }); mt.position.set(0, 2.55, 1.0); st.scene.add(mt);
    const sp = sparkles(20, [0, 1.6, .8], 1.4, 0xfff2b0, 3); st.scene.add(sp);
    return { ...st, update(t, s, d) {
      const up = ease(seg(t, .1, .3)), gasp = seg(t, .3, .38);
      b.pose({ s, armR: [-up * 1.1, .3 + up * .4], armL: [-up * 1.1, .3 + up * .4], mouth: up > .5 ? 'open' : 'smile', open: .6, happy: .5, wide: up, hop: Math.max(0, Math.sin(clamp((t - .3) * 3) * Math.PI)) * .1 });
      bundles.forEach((c, i) => handProp(b, i ? 1 : -1, c, [0, -.08, .12]));
      [dad, mom].forEach((h, i) => h.pose({ s: s + i, mouth: gasp > 0 ? 'open' : 'smile', open: .7, wide: gasp, brow: gasp * .6, armR: gasp > 0 ? [-.6, .9] : [0, .2], armL: gasp > 0 ? [-.6, .9] : [0, .2] }));
      amt.scale.setScalar(t > .38 ? Math.min(1.1, pop((t - .38) * d)) : 0); mt.scale.setScalar(t > .7 ? Math.min(1, pop((t - .7) * d)) : 0); sp.visible = t > .38; sp.update(s);
      aim(st.cam, [0, 2.5, lerp(7.2, 6.4, ease(t))], [0, 1.8, 0]);
    } };
  };
  BUILD.db_files = () => {
    const st = stage(ROOM); const tb = table(4.0, 2.2, 0x5a3a26); st.scene.add(tb);
    const map = sign(3.4, 2.4, (x, w, h) => { x.fillStyle = '#e8dcbc'; x.fillRect(0, 0, w, h); x.fillStyle = '#a8c890'; x.beginPath(); x.ellipse(w * .5, h * .55, w * .42, h * .38, .2, 0, 7); x.fill(); x.strokeStyle = '#4a7ab0'; x.lineWidth = 14; x.beginPath(); x.moveTo(0, h * .8); x.bezierCurveTo(w * .3, h * .7, w * .5, h * .9, w, h * .75); x.stroke();
      label(x, 'WASHINGTON', w * .5, h * .12, h * .08, '#4a3a2a', 900); x.strokeStyle = '#c8202f'; x.lineWidth = 6; x.setLineDash([16, 10]); x.beginPath(); x.moveTo(w * .2, h * .2); x.lineTo(w * .55, h * .5); x.lineTo(w * .4, h * .78); x.stroke(); x.setLineDash([]);
      [[.2, .2], [.55, .5], [.4, .78]].forEach(([a, b]) => { x.fillStyle = '#c8202f'; x.beginPath(); x.arc(w * a, h * b, 16, 0, 7); x.fill(); }); }, { color: 0xe8dcbc, depth: .04 });
    map.position.set(0, 3.0, -1.4); st.scene.add(map);
    const folder = sign(1.6, 1.1, (x, w, h) => { x.fillStyle = '#d8b878'; rrect(x, 0, 0, w, h, 12); x.fill(); label(x, 'FBI · NORJAK', w / 2, h * .22, h * .12, '#4a3a2a', 900); }, { color: 0xd8b878, depth: .04 });
    folder.rotation.x = -Math.PI / 2 + .3; folder.position.set(0, 1.15, .4); st.scene.add(folder);
    const stamp = textSign(1.7, .5, 'UNSOLVED', { color: 0xc8202f, fg: '#ffffff', size: 80 }); stamp.position.set(0, 2.5, 1.0); stamp.rotation.z = -.12; st.scene.add(stamp);
    const yr = textSign(2.6, .5, '2016: ACTIVE CASE ENDS', { color: 0x1d2442, fg: '#ffc44d', size: 50 }); yr.position.set(0, 4.45, -1.0); st.scene.add(yr);
    const lamp = sprite(0xffd27a, 3, .5); lamp.position.set(1.6, 3.6, 0); st.scene.add(lamp);
    return { ...st, update(t, s, d) {
      const k = seg(t, .55, .62); stamp.scale.setScalar(k > 0 ? 1 + (1 - k) * 1.5 : 0); stamp.position.z = 1.0 + (1 - k) * .8;
      yr.scale.setScalar(t > .7 ? Math.min(1, pop((t - .7) * d)) : 0);
      aim(st.cam, [Math.sin(s * .3) * .6, lerp(4.2, 3.8, t), lerp(7.4, 6.6, t)], [0, 2.4, 0]);
    } };
  };
  BUILD.db_outro = () => {
    const st = stage(Object.assign({}, STORM, { top: '#0d1438', bottom: '#3a4a7a' })); st.scene.add(forest(80, 40, 14, -1, 21, 0x14302a));
    const moon = M(SPH(1.3, 32, 24), glowM(0xfff2d0, 1.4), { pos: [1.8, 6.2, -10], shadow: false }); st.scene.add(moon);
    const co = cooper(); co.scale.setScalar(.4); st.scene.add(co); const ch = chute(); ch.scale.setScalar(.48); st.scene.add(ch);
    const q = textSign(.9, .9, '?', { color: 0xffc44d, fg: '#1d2442', size: 170 }); q.position.set(-1.3, 4.2, .4); st.scene.add(q);
    const ask = bubble(3.3, 1.15, (x, w, h) => { label(x, 'What happened to him?', w / 2, h / 2 + 4, h * .3, '#2a1a12', 900); }, 0); ask.position.set(0, 2.2, 1.6); st.scene.add(ask);
    const btn = textSign(2.5, .75, 'FOLLOW  +', { color: 0xc8202f, fg: '#ffffff', size: 100, depth: .35 }); btn.position.set(0, 1.2, 2.0); st.scene.add(btn);
    return { ...st, update(t, s, d) {
      co.position.set(.6 + Math.sin(s * .5) * .3, 4.0 - t * .8, -1.5); co.rotation.z = Math.sin(s * 1.2) * .08; co.pose({ s, armR: [0, 2.6], armL: [0, 2.6], mouth: 'smile', happy: .3 });
      ch.position.set(co.position.x, co.position.y + 1.6, co.position.z); ch.rotation.z = co.rotation.z;
      q.scale.setScalar(Math.min(1, pop(s - .3))); q.rotation.z = Math.sin(s * 3) * .1;
      ask.scale.setScalar(t > .3 ? Math.min(1, pop((t - .3) * d)) : 0); btn.scale.setScalar(t > .62 ? Math.min(1, pop((t - .62) * d)) * (1 + Math.sin(s * 5) * .03) : 0);
      aim(st.cam, [Math.sin(s * .25) * 1.0, 3.0, 9.6], [0, 3.1, 0]);
    } };
  };

  // ---------- shared helpers for later episodes ----------
  const appear = (o, t, at, d, mx = 1) => o.scale.setScalar(t > at ? Math.min(mx, pop((t - at) * d)) : 0);
  const spot = (st, target, I = 40, pos = [0, 8, 3]) => { const l = new THREE.SpotLight(0xfff1d0, I, 16, .35, .5); l.position.set(...pos); l.target = target; st.scene.add(l); return l; };
  function gem(col = 0xbfefff, s = .2) { const g = G(M(new THREE.ConeGeometry(s, s * .7, 8), plastic(col, { roughness: .02, clearcoat: 1, transmission: .3, envMapIntensity: 2.2 }), { pos: [0, s * .35, 0] }), M(new THREE.ConeGeometry(s, s * 1.1, 8), plastic(col, { roughness: .02, clearcoat: 1, envMapIntensity: 2.2 }), { pos: [0, -s * .55, 0], rot: [Math.PI, 0, 0] })); return g; }
  function gemPile(n = 30, r = 1, seed = 4) { const R = rng(seed), g = new THREE.Group(), cols = [0xdff6ff, 0xbfefff, 0xffe0f0, 0xfff2c0, 0xd8ffe8]; for (let i = 0; i < n; i++) { const a = R() * 6.3, d = Math.sqrt(R()) * r, k = gem(cols[i % 5], .1 + R() * .08); k.position.set(Math.cos(a) * d, .12 + (1 - d / r) * .35 * R(), Math.sin(a) * d * .6); k.rotation.set(R(), R() * 6, R()); g.add(k); } return g; }
  function bars(w = 3.4, h = 3.3, n = 9) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(M(new THREE.CylinderGeometry(.05, .05, h, 12), metal(0x8a8f99), { pos: [-w / 2 + i * w / (n - 1), h / 2, 0] }));
    g.add(M(RB(w + .2, .14, .14, .04), metal(0x8a8f99), { pos: [0, h, 0] }), M(RB(w + .2, .14, .14, .04), metal(0x8a8f99), { pos: [0, .2, 0] })); return g; }
  function followOutro(st, ask, o = {}) {
    const q = bubble(3.0, 1.05, (x, w, h) => label(x, ask, w / 2, h / 2 + 4, h * .26, '#2a1a12', 900), 0); q.position.set(0, o.qy ?? 4.0, 1.6); st.scene.add(q);
    const btn = textSign(2.5, .75, 'FOLLOW  +', { color: 0xc8202f, fg: '#ffffff', size: 100, depth: .35 }); btn.position.set(0, o.by ?? 1.2, 2.0); st.scene.add(btn);
    return (t, s, d) => { appear(q, t, .3, d); btn.scale.setScalar(t > .62 ? Math.min(1, pop((t - .62) * d)) * (1 + Math.sin(s * 5) * .03) : 0); };
  }
  function car(col = 0x3a4a6a) { const g = new THREE.Group(); g.add(M(RB(2.2, .55, 1.0, .18), plastic(col), { pos: [0, .5, 0] }), M(RB(1.2, .45, .9, .15), plastic(0x2a3450, { roughness: .1, clearcoat: 1 }), { pos: [-.1, .95, 0] }));
    [[-.7, .5], [.7, .5], [-.7, -.5], [.7, -.5]].forEach(([x, z]) => g.add(M(new THREE.CylinderGeometry(.22, .22, .14, 16), plastic(0x1a1a1a), { pos: [x, .22, z], rot: [Math.PI / 2, 0, 0] })));
    g.add(M(SPH(.07, 10, 8), glowM(0xfff2c0, 3), { pos: [1.1, .55, .3], shadow: false }), M(SPH(.07, 10, 8), glowM(0xfff2c0, 3), { pos: [1.1, .55, -.3], shadow: false })); return g; }
  function road(len = 40, w = 3, col = 0x4a4a52) { const g = new THREE.Group(); g.add(M(new THREE.PlaneGeometry(len, w), matte(col), { rot: [-Math.PI / 2, 0, 0], pos: [0, .02, 0], shadow: false }));
    for (let i = 0; i < len / 2; i++) g.add(M(new THREE.PlaneGeometry(.8, .1), matte(0xf2e2a0), { rot: [-Math.PI / 2, 0, 0], pos: [-len / 2 + i * 2, .03, 0], shadow: false })); return g; }

  // ---------- episode 3: the Antwerp diamond heist ----------
  const NOTAR = { suit: 0x6a5a4a, pants: 0x4a3e34, tie: 0x8a6a1a, hair: 0x9a9a9a, hairStyle: 'side', stache: false, belly: 1.15, skin: 0xe8b48e, iris: 0x4a3a2a, brow: -.1 };
  const THIEF = { suit: 0x1a1a22, pants: 0x1a1a22, tie: null, shirt: 0x1a1a22, hat: 'cap', hatCol: 0x15151c, hair: 0x15151c, hairStyle: 'bald', skin: 0xe0b090 };
  const thief = () => makeHuman(THIEF), notar = () => makeHuman(NOTAR);
  const VAULT = { top: '#14181f', bottom: '#2c3440', floor: 0x3a4250, fogColor: '#20262e', key: 0xdfe8ff, keyI: 2.0, rim: 0x7ad0ff, rimI: 2.2, hemi: .6 };
  function vaultDoor(r = 2) { const g = new THREE.Group(), st = metal(0xb8bec8, { roughness: .3 });
    g.add(M(new THREE.CylinderGeometry(r, r, .45, 64), st, { rot: [Math.PI / 2, 0, 0] }), M(new THREE.TorusGeometry(r, .14, 16, 64), metal(0x8a9098), {}));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.add(M(new THREE.CylinderGeometry(.09, .09, .3, 12), metal(0x9aa0aa), { pos: [Math.cos(a) * r * .86, Math.sin(a) * r * .86, .3], rot: [Math.PI / 2, 0, 0] })); }
    const wheel = new THREE.Group(); wheel.position.z = .4; g.add(wheel); wheel.add(M(new THREE.TorusGeometry(.55, .06, 12, 40), metal(0xd8b36a)));
    for (let i = 0; i < 3; i++) wheel.add(M(new THREE.CylinderGeometry(.04, .04, 1.1, 8), metal(0xd8b36a), { rot: [0, 0, i * Math.PI / 3] })); wheel.add(M(SPH(.12, 16, 12), metal(0xd8b36a)));
    const dial = M(new THREE.CylinderGeometry(.28, .28, .12, 32), metal(0x2a2a2a), { pos: [r * .55, r * .45, .3], rot: [Math.PI / 2, 0, 0] }); g.add(dial);
    g.userData = { wheel, dial }; return g; }
  function boxWall(cols = 8, rows = 6, seed = 1) { const g = new THREE.Group(), doors = [];
    g.add(M(RB(cols * .62 + .2, rows * .5 + .2, .4, .05), metal(0x7a8090), { pos: [0, rows * .25, -.2] }));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const piv = new THREE.Group(); piv.position.set(-cols * .31 + c * .62 + .02, .1 + r * .5 + .2, .02); g.add(piv);
      piv.add(M(RB(.56, .44, .05, .03), metal(0xc8ccd6, { roughness: .35 }), { pos: [.28, 0, 0] }), M(SPH(.035, 8, 6), metal(0xd8b36a), { pos: [.48, 0, .04] })); doors.push(piv); }
    g.userData.doors = doors; return g; }
  function sandwich(bite = true) { const g = new THREE.Group(), bread = plastic(0xe8b878, { roughness: .7, clearcoat: .1 });
    g.add(M(RB(1.4, .22, .9, .1), bread, { pos: [0, .11, 0] }), M(new THREE.CylinderGeometry(.62, .62, .1, 32), matte(0xb83a3a), { pos: [0, .27, 0], scale: [1, 1, .65] }), M(RB(1.45, .06, .95, .03), matte(0x6ab84a), { pos: [0, .34, 0] }), M(RB(1.4, .24, .9, .1), bread, { pos: [0, .48, 0] }));
    for (let i = 0; i < 5; i++) g.add(M(SPH(.06, 8, 6), matte(0xf2e2c8), { pos: [-.45 + i * .23, .27, (i % 2 - .5) * .3], scale: [1, .4, 1] }));
    if (bite) [0, 1, 2].forEach(i => g.add(M(SPH(.26, 16, 12), matte(0x2a3440), { pos: [.72, .3, -.25 + i * .25], scale: [1, 1.6, 1] }))); return g; }
  function trashBag() { return G(M(SPH(.6, 24, 16), plastic(0x15151c, { roughness: .25 }), { pos: [0, .55, 0], scale: [1, 1.1, .9] }), M(new THREE.ConeGeometry(.15, .35, 10), plastic(0x15151c, { roughness: .25 }), { pos: [0, 1.25, 0] })); }
  function sensorIcon(kind) { const g = new THREE.Group();
    if (kind === 'heat') { g.add(M(RB(.5, .5, .3, .12), plastic(0xffffff)), M(SPH(.14, 16, 12), glowM(0xff7a2a, 2.5), { pos: [0, 0, .16], shadow: false })); }
    if (kind === 'motion') { g.add(M(RB(.5, .3, .3, .1), plastic(0xffffff)), M(new THREE.CylinderGeometry(.1, .1, .05, 16), glowM(0xff2a3a, 3), { pos: [0, 0, .16], rot: [Math.PI / 2, 0, 0], shadow: false })); }
    if (kind === 'magnet') { const m = plastic(0xd82a2a); g.add(M(new THREE.TorusGeometry(.28, .1, 12, 24, Math.PI), m, { rot: [0, 0, Math.PI] }), M(RB(.2, .18, .2, .04), metal(0xd8dce4), { pos: [-.28, .05, 0] }), M(RB(.2, .18, .2, .04), metal(0xd8dce4), { pos: [.28, .05, 0] })); }
    return g; }
  function beams(n = 4, w = 4, col = 0xff2a3a) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(M(new THREE.CylinderGeometry(.015, .015, w, 6), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .8, toneMapped: false }), { rot: [0, 0, Math.PI / 2 + (i % 2 ? .12 : -.12)], pos: [0, .5 + i * .45, 0], shadow: false })); return g; }

  BUILD.aw_hook = () => {
    const st = stage(VAULT); const pile = gemPile(40, 1.3); pile.position.set(0, 1.05, 0); st.scene.add(table(3.2, 1.6, 0x3a1a2a), pile);
    const th = thief(); th.position.set(-1.2, 0, -.6); th.rotation.y = .5; st.scene.add(th);
    const sw = sandwich(); sw.position.set(.5, 1.1, .4); sw.scale.setScalar(.8); st.scene.add(sw);
    const bust = textSign(1.9, .62, 'BUSTED!', { color: 0xc8202f, fg: '#fff', size: 100 }); bust.position.set(0, 3.7, .6); st.scene.add(bust);
    const sp = sparkles(26, [0, 1.6, 0], 1.6, 0xffffff, 9); st.scene.add(sp); spot(st, pile, 50, [0, 7, 2]);
    return { ...st, update(t, s, d) {
      th.pose({ s, happy: t < .5 ? .7 : 0, mouth: t < .5 ? 'smile' : 'open', open: .6, wide: t > .55 ? 1 : 0, brow: t > .55 ? .8 : -.3, armR: [-1.0 + Math.sin(s * 6) * .15 * (t < .5), .2], armL: [-.9, .2], lean: .2 });
      const drop = seg(t, .5, .62); sw.visible = t > .5; sw.position.y = lerp(5, 1.1, out(drop)) + (drop >= 1 ? Math.abs(Math.sin((t - .62) * 18)) * .1 * Math.exp(-(t - .62) * 10) : 0); sw.rotation.y = s * .3;
      appear(bust, t, .66, d, 1.1); bust.rotation.z = Math.sin(s * 5) * .06; sp.update(s);
      aim(st.cam, [Math.sin(s * .3) * .8, 3.6, lerp(9.4, 8.6, t)], [0, 2.1, 0]);
    } };
  };
  BUILD.aw_title = (p) => titleSet(p, VAULT, thief, (st) => { const pile = gemPile(24, .8, 7); pile.position.set(1.4, 0, 1.2); st.scene.add(pile); const sp = sparkles(20, [1.4, .4, 1.2], .9, 0xffffff, 3); st.scene.add(sp); return (t, s) => sp.update(s); });
  BUILD.aw_vault = () => {
    const st = stage(VAULT); const vd = vaultDoor(1.9); vd.position.set(0, 2.2, -1); st.scene.add(vd);
    st.scene.add(M(RB(6, 5, .3, .05), matte(0x4a5260), { pos: [0, 2.5, -1.4] }));
    const sgn = textSign(2.6, .55, 'ANTWERP DIAMOND CENTRE', { color: 0xf3e3c3, fg: '#2a1a12', size: 46 }); sgn.position.set(0, 4.5, 0); st.scene.add(sgn);
    const lay = textSign(2.4, .55, '10 LAYERS OF SECURITY', { color: 0xc8202f, fg: '#fff', size: 52 }); lay.position.set(0, 4.5, 0); st.scene.add(lay);
    const rings = [0, 1, 2, 3, 4].map(i => { const r = M(new THREE.TorusGeometry(2.1 + i * .22, .03, 8, 64), glowM(0x35e0ff, 1.5), { shadow: false }); r.position.set(0, 2.2, -.9); st.scene.add(r); return r; });
    return { ...st, update(t, s, d) {
      vd.userData.wheel.rotation.z = s * .4; appear(sgn, t, .05, d); if (t > .55) sgn.scale.setScalar(0); appear(lay, t, .58, d);
      rings.forEach((r, i) => { r.visible = t > .55 + i * .04; r.material.emissiveIntensity = 1.2 + Math.sin(s * 4 + i) * .5; });
      aim(st.cam, [0, lerp(5.5, 2.8, ease(t)), lerp(10, 8.6, t)], [0, lerp(3.2, 2.3, ease(t)), -1]);
    } };
  };
  BUILD.aw_layers = () => {
    const st = stage(VAULT); const vd = vaultDoor(1.6); vd.position.set(0, 2.1, -1.2); st.scene.add(vd);
    const icons = [['heat', 'HEAT SENSORS', 0, 4.1], ['motion', 'MOTION DETECTORS', 0, 4.1], ['magnet', 'MAGNETIC FIELD', 0, 4.1], ['dial', '', 0, 4.1]].map(([k, l, x, y]) => { const g = new THREE.Group(); g.position.set(x, y, .4);
      if (k !== 'dial') { const ic = sensorIcon(k); ic.position.y = .25; g.add(ic); } const tg = textSign(1.9, .36, l || '100,000,000 CODES', { color: 0xf3e3c3, fg: '#2a1a12', size: 36 }); tg.position.y = -.25; g.add(tg); st.scene.add(g); return g; });
    const bm = beams(5, 6); bm.position.set(0, 0, .2); st.scene.add(bm);
    return { ...st, update(t, s, d) {
      icons.forEach((g, i) => { appear(g, t, .05 + i * .22, d); if (t > .05 + (i + 1) * .22 && i < 3) g.scale.setScalar(0); });
      bm.visible = t > .27 && t < .5; bm.children.forEach((b, i) => b.position.y = .5 + i * .45 + Math.sin(s * 3 + i) * .1);
      vd.userData.dial.rotation.y = t > .7 ? s * 6 : 0;
      aim(st.cam, [0, 2.6, lerp(8.8, 8.2, t)], [0, 2.35, 0]);
    } };
  };
  BUILD.aw_office = () => {
    const st = stage(ROOM); const tb = table(2.6, 1.2); tb.position.set(0, 0, .6); st.scene.add(tb);
    const no = notar(); no.position.set(0, 0, -.3); st.scene.add(no);
    const loupe = G(M(new THREE.TorusGeometry(.12, .03, 8, 20), metal(0x2a2a2a)), M(new THREE.CircleGeometry(.11, 20), plastic(0xbfe8ff, { transparent: true, opacity: .4 }))); st.scene.add(loupe);
    const g1 = gem(0xdff6ff, .14); g1.position.set(.3, 1.25, .8); st.scene.add(g1);
    const door = sign(1.2, .45, (x, w, h) => { x.fillStyle = '#f3e3c3'; x.fillRect(0, 0, w, h); label(x, 'GEM DEALER', w / 2, h / 2 + 3, h * .42, '#2a1a12', 900); }, { color: 0xf3e3c3, depth: .04 }); door.position.set(-.65, 4.15, -.6); st.scene.add(door);
    const cal = textSign(1.0, .48, '2001', { color: 0x1d2442, fg: '#ffc44d', size: 80, font: MONO }); cal.position.set(.75, 4.15, -.5); st.scene.add(cal);
    const nm = textSign(2.6, .48, 'LEONARDO NOTARBARTOLO', { color: 0xc8202f, fg: '#fff', size: 46 }); nm.position.set(0, 1.6, 1.4); st.scene.add(nm);
    return { ...st, update(t, s, d) {
      const wave = t > .6; no.pose({ s, mouth: 'smile', happy: .7, waveR: wave ? 1 : 0, armR: wave ? undefined : [-.9, .2], armL: [-.9, .15], lookY: wave ? .4 : 0, talk: wave ? .6 : 0 });
      handProp(no, 1, loupe, [0, .05, .1]); loupe.visible = !wave; g1.rotation.y = s;
      const yr = Math.min(2003, 2001 + Math.floor(seg(t, .3, .8) * 3)); cal.userData.redraw((x, w, h) => { x.fillStyle = '#1d2442'; x.fillRect(0, 0, w, h); label(x, String(yr), w / 2, h / 2 + 4, h * .6, '#ffc44d', 900, 'center', MONO); });
      appear(door, t, .05, d); appear(cal, t, .15, d); appear(nm, t, .25, d);
      aim(st.cam, [lerp(-.6, .3, t), 3.0, lerp(7.4, 6.8, t)], [0, 2.4, 0]);
    } };
  };
  BUILD.aw_camera = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#3a2a20', bottom: '#8a6a4a', floor: 0x6a5038 }));
    const rep = new THREE.Group(); rep.position.set(0, 0, -1.2); st.scene.add(rep);
    rep.add(M(RB(4.4, 3.4, .2, .05), matte(0xc89a62), { pos: [0, 1.7, -.2] })); const vd = vaultDoor(1.2); vd.position.set(0, 1.7, 0); vd.traverse(o => { if (o.material) o.material = matte(0xd8b07a); }); rep.add(vd);
    const crew = [0, 1].map(i => { const h = thief(); h.scale.setScalar(.8); h.position.set(i ? 1.6 : -1.6, 0, .4); h.rotation.y = i ? -.5 : .5; st.scene.add(h); return h; });
    const tg = textSign(2.0, .55, 'A REPLICA?', { color: 0xffc44d, fg: '#2a1a12', size: 70 }); tg.position.set(0, 4.1, 0); st.scene.add(tg);
    const cl = textSign(2.0, .4, '(he later claimed)', { color: 0xf3e3c3, fg: '#5a4a3a', size: 44 }); cl.position.set(0, 3.55, .1); st.scene.add(cl);
    const cam = G(M(RB(.3, .2, .2, .05), plastic(0x2a2a2a)), M(new THREE.CylinderGeometry(.06, .06, .1, 12), plastic(0x0a0a10, { roughness: .05 }), { pos: [0, 0, .14], rot: [Math.PI / 2, 0, 0] })); cam.position.set(-.3, 3.0, 1.2); st.scene.add(cam);
    const flash = sprite(0xffffff, 1.4, 0); flash.position.copy(cam.position); st.scene.add(flash);
    return { ...st, update(t, s, d) {
      crew.forEach((h, i) => h.pose({ s: s + i, walk: t > .55 ? s * 6 + i : undefined, armR: [-.8, .3], mouth: 'flat', brow: -.4, lookY: i ? .3 : -.3 }));
      vd.userData.wheel.rotation.z = t > .55 ? s * 2 : 0;
      appear(cam, t, .02, d); cam.visible = t < .5; flash.material.opacity = (Math.max(0, 1 - Math.abs(t - .2) * 30) + Math.max(0, 1 - Math.abs(t - .35) * 30)) * .9;
      appear(tg, t, .55, d); appear(cl, t, .62, d);
      aim(st.cam, [0, 3.0, lerp(8.6, 8.0, t)], [0, 2.3, -.4]);
    } };
  };
  BUILD.aw_night = () => {
    const st = stage(Object.assign({}, VAULT, { top: '#0a0c14', bottom: '#1a2030', keyI: 1.2 }));
    const bm = beams(5, 9); bm.position.set(0, 0, 0); st.scene.add(bm);
    const crew = [0, 1, 2].map(i => { const h = thief(); h.scale.setScalar(.75); st.scene.add(h); return h; });
    const vd = vaultDoor(1.4); vd.position.set(3.2, 1.9, -1.4); st.scene.add(vd);
    const dt = textSign(1.8, .5, 'FEB 2003', { color: 0x1d2442, fg: '#ffc44d', size: 66, font: MONO }); dt.position.set(-.6, 4.2, .4); st.scene.add(dt);
    const ht = textSign(.6, .6, '♥', { color: 0xffd0dc, fg: '#e84a6a', size: 110 }); ht.position.set(.85, 4.2, .4); st.scene.add(ht);
    return { ...st, update(t, s, d) {
      crew.forEach((h, i) => { const x = lerp(-4, 2.2, ease(seg(t, .1 + i * .05, .9))) - i * .9; h.position.set(x, 0, .6 - i * .3); h.rotation.y = Math.PI / 2;
        h.pose({ s: s + i, walk: s * 7 + i, hop: Math.max(0, Math.sin(s * 3.5 + i)) * .35, lean: .3, mouth: 'flat', brow: .2, armR: [-.6, .5], armL: [-.6, .5] }); });
      bm.children.forEach((b, i) => b.material.opacity = .5 + Math.sin(s * 5 + i) * .3);
      appear(dt, t, .05, d); appear(ht, t, .15, d); ht.scale.multiplyScalar(1 + Math.sin(s * 6) * .08);
      aim(st.cam, [lerp(-1, .6, t), 2.6, 9], [lerp(-.5, .8, t), 1.8, 0]);
    } };
  };
  BUILD.aw_boxes = () => {
    const st = stage(VAULT); const wall = boxWall(8, 6); wall.position.set(0, 0, -1.2); st.scene.add(wall);
    const bag = G(M(SPH(.5, 20, 14), matte(0x2a2a30), { scale: [1, 1.1, .9] })); bag.position.set(.8, .5, .8); st.scene.add(bag);
    const flying = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const g = i % 3 === 2 ? M(RB(.3, .12, .14, .02), metal(0xffc44d)) : gem([0xdff6ff, 0xffe0f0, 0xfff2c0][i % 3], .12); st.scene.add(g); return g; });
    const cnt = textSign(2.4, .58, '', { color: 0xf3e3c3, fg: '#2a1a12', size: 60 }); cnt.position.set(0, 3.95, 0); st.scene.add(cnt);
    const val = textSign(2.4, .62, '≈ $100,000,000', { color: 0x2f8a48, fg: '#fff', size: 72, font: MONO }); val.position.set(-.3, 1.6, 1.2); st.scene.add(val);
    const doors = wall.userData.doors, order = doors.map((_, i) => i).sort((a, b) => ((a * 37) % 48) - ((b * 37) % 48));
    return { ...st, update(t, s, d) {
      const k = seg(t, .05, .75) * doors.length; order.forEach((di, j) => { doors[di].rotation.y = -ease(clamp(k - j)) * 1.6; });
      const n = Math.round(seg(t, .05, .75) * 109); cnt.userData.redraw((x, w, h) => label(x, `${n} BOXES EMPTIED`, w / 2, h / 2 + 4, h * .42, '#2a1a12', 900)); appear(cnt, t, .03, d);
      flying.forEach((g, i) => { const ph = frac(s * .7 + i / 8); g.position.set(lerp(-1.6 + (i % 4) * .9, .8, ph), 1.0 + (i % 3) * .6 + Math.sin(ph * Math.PI) * 1.2 - ph * .5, lerp(-1.0, .8, ph)); g.rotation.set(s * 3 + i, s * 2, 0); g.visible = t > .1; });
      bag.scale.setScalar(1 + seg(t, .1, .9) * .5); appear(val, t, .75, d, 1.1);
      aim(st.cam, [0, 2.6, lerp(8.4, 7.8, t)], [0, 2.0, -.4]);
    } };
  };
  BUILD.aw_trash = () => {
    const st = stage(Object.assign({}, DUSK, { floor: 0x5a8a4a, top: '#7aa8d8', bottom: '#e8d8b0' })); st.scene.add(forest(40, 30, 8, -3, 15, 0x2e6a3a));
    const rd = road(40, 2.6); rd.position.z = 1.8; st.scene.add(rd);
    const cr = car(0x3a3a44); st.scene.add(cr); const bg = trashBag(); bg.scale.setScalar(.6); st.scene.add(bg);
    const man = makeHuman({ suit: 0x5a6a3a, pants: 0x3a3a2a, tie: null, shirt: 0x5a6a3a, hair: 0x8a8a8a, hairStyle: 'side', stache: true, belly: 1.1, hat: 'cap', hatCol: 0x4a4a3a }); man.position.set(-1.6, 0, -.6); man.rotation.y = .6; st.scene.add(man);
    const ph = textSign(1.7, .55, '☎ POLICE!', { color: 0x1d2442, fg: '#fff', size: 64 }); ph.position.set(-1.2, 3.6, 0); st.scene.add(ph);
    const e19 = textSign(1.1, .42, 'E19', { color: 0x2f6a3a, fg: '#fff', size: 60 }); e19.position.set(1.6, 3.9, .2); st.scene.add(e19);
    return { ...st, update(t, s, d) {
      const cx = lerp(-6, 7, seg(t, 0, .55)); cr.position.set(cx, 0, 1.8);
      const toss = seg(t, .2, .35); bg.position.set(lerp(-.2, .5, toss) + (toss >= 1 ? 0 : 0), toss >= 1 ? 0 : .6 + Math.sin(toss * Math.PI) * 1.4, lerp(1.8, -.3, toss)); bg.visible = t > .2; bg.rotation.z = toss * 3;
      if (t < .2) bg.visible = false;
      const walk = seg(t, .45, .65); man.position.x = lerp(-3.2, -.7, walk); man.visible = t > .42;
      man.pose({ s, walk: walk > 0 && walk < 1 ? s * 8 : undefined, mouth: t > .7 ? 'open' : 'smile', open: .4, wide: t > .7 ? .5 : 0, armR: t > .72 ? [-.2, 2.0] : [0, .2], lookX: t > .65 ? .3 : 0 });
      appear(ph, t, .74, d); appear(e19, t, .05, d);
      aim(st.cam, [0, 3.2, 9.4], [0, 1.4, 0]);
    } };
  };
  BUILD.aw_sandwich = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#1a1a26', bottom: '#3a3448', floor: 0x2a2634, keyI: 1.4 }));
    const tb = table(3.4, 1.8, 0x5a5a62); st.scene.add(tb);
    const sw = sandwich(); sw.position.set(0, 1.12, .2); sw.scale.setScalar(.9); st.scene.add(sw);
    const tapes = [0, 1].map(i => { const g = G(M(RB(.7, .1, .42, .02), plastic(0x15151c)), M(RB(.5, .02, .2, .01), matte(0xf2f2f2), { pos: [0, .06, 0] })); g.position.set(-1.1 + i * .2, 1.17 + i * .11, -.3); st.scene.add(g); return g; });
    const rc = sign(.4, .6, (x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#9a9a9a'; for (let i = 0; i < 7; i++) x.fillRect(w * .1, h * (.1 + i * .12), w * (.5 + (i % 3) * .1), h * .04); }, { color: 0xfbf6ea, depth: .01 }); rc.rotation.x = -Math.PI / 2 + .1; rc.position.set(1.1, 1.13, -.1); st.scene.add(rc);
    const mag = G(M(new THREE.TorusGeometry(.45, .06, 12, 40), metal(0x2a2a2a)), M(new THREE.CircleGeometry(.43, 32), plastic(0xbfe8ff, { transparent: true, opacity: .25, roughness: .02 })), M(new THREE.CylinderGeometry(.05, .06, .8, 12), plastic(0x5a3a26), { pos: [0, -.85, 0] })); st.scene.add(mag);
    const clue = textSign(1.7, .6, 'CLUE!', { color: 0xffc44d, fg: '#2a1a12', size: 100 }); clue.position.set(0, 2.85, .9); st.scene.add(clue);
    const sl = spot(st, sw, 0, [0, 6, 2]);
    return { ...st, update(t, s, d) {
      appear(tapes[0], t, .05, d); appear(tapes[1], t, .1, d); appear(rc, t, .18, d);
      sl.intensity = seg(t, .35, .45) * 60; sw.rotation.y = Math.sin(s * .8) * .2;
      mag.position.set(lerp(-1.5, .1, ease(seg(t, .4, .6))), 2.0 + Math.sin(s * 2) * .05, .9); mag.rotation.z = .3;
      appear(clue, t, .6, d, 1.1); clue.rotation.z = Math.sin(s * 4) * .05;
      aim(st.cam, [Math.sin(s * .3) * .6, 3.4, lerp(6.6, 5.6, ease(t))], [0, 1.6, 0]);
    } };
  };
  BUILD.aw_caught = () => {
    const st = stage(Object.assign({}, VAULT, { top: '#1a2a4a', bottom: '#5a7aa0' }));
    const no = makeHuman(Object.assign({}, NOTAR, { suit: 0xd8d2c0, pants: 0xd8d2c0, tie: null, shirt: 0xd8d2c0 })); no.position.set(0, 0, -.5); no.scale.setScalar(.8); st.scene.add(no);
    const b = bars(); b.position.set(0, 0, .6); st.scene.add(b);
    const yrs = textSign(1.8, .6, '10 YEARS', { color: 0xc8202f, fg: '#fff', size: 92 }); yrs.position.set(0, 3.9, 1.0); st.scene.add(yrs);
    const pile = gemPile(18, .6, 11); pile.position.set(1.3, 3.0, 1.0); pile.scale.setScalar(.8); st.scene.add(pile);
    const nf = textSign(2.2, .5, 'DIAMONDS: NEVER FOUND', { color: 0xf3e3c3, fg: '#2a1a12', size: 46 }); nf.position.set(0, 1.2, 1.3); st.scene.add(nf);
    const q = textSign(.5, .5, '?', { color: 0xffc44d, fg: '#1d2442', size: 100 }); q.position.set(1.3, 3.6, 1.0); st.scene.add(q);
    return { ...st, update(t, s, d) {
      no.pose({ s, mouth: 'frown', brow: .6, eyeX: Math.sin(s * .7) * .3, armR: [-.5, .2], armL: [-.5, .2] });
      appear(yrs, t, .15, d); pile.visible = t > .55; pile.rotation.y = s * .5; pile.scale.setScalar(.8 * (t > .55 ? Math.max(0, 1 - seg(t, .75, .9)) : 0)); appear(nf, t, .6, d); appear(q, t, .8, d); q.rotation.z = Math.sin(s * 3) * .1;
      aim(st.cam, [0, 2.8, lerp(7.6, 7.0, t)], [0, 2.4, 0]);
    } };
  };
  BUILD.aw_outro = () => {
    const st = stage(VAULT); st.scene.add(K.pedestal(1.2, 0xffffff, 0xffc44d));
    const sw = sandwich(); sw.position.set(0, .45, 0); sw.scale.setScalar(.9); st.scene.add(sw); spot(st, sw, 50, [0, 7, 2]);
    const sp = sparkles(24, [0, 1.6, 0], 2, 0xffffff, 5); st.scene.add(sp);
    const fo = followOutro(st, 'Where are the diamonds?', { qy: 3.7, by: 2.7 });
    return { ...st, update(t, s, d) { sw.rotation.y = s * .5; sp.update(s); fo(t, s, d); aim(st.cam, [Math.sin(s * .3) * .4, 3.0, 8.4], [0, 2.2, 0]); } };
  };

  // ---------- episode 4: the Isabella Stewart Gardner Museum heist ----------
  const FAKECOP = (i) => ({ suit: 0x1f2c5c, pants: 0x1f2c5c, tie: 0x0d1430, shirt: 0x8aa0c8, hat: 'kepi', hatCol: 0x1f2c5c, stache: true, hair: [0x2a1a10, 0x4a3020][i % 2], brow: -.5, belly: 1 + i * .1, skin: [0xf0bd96, 0xe8b08a][i % 2] });
  const fakeCop = (i = 0) => makeHuman(FAKECOP(i));
  const GUARD = { suit: 0x5a6a8a, pants: 0x3a4050, tie: 0x2a2a3a, shirt: 0xd8e0f0, hair: 0x6a4a2a, hairStyle: 'curly', skin: 0xf4c7a6, iris: 0x3a5a7a };
  const guard = () => makeHuman(GUARD);
  const MUSEUM = { top: '#3a2a3a', bottom: '#8a6a5a', floor: 0x6a4a3a, fogColor: '#6a4a40', key: 0xffe6c0, keyI: 2.2, rim: 0xffc890, rimI: 1.4, hemi: .8 };
  const MUSEUM_NIGHT = { top: '#0e1020', bottom: '#2a2440', floor: 0x3a2a30, fogColor: '#1e1a2a', key: 0xbfd0ff, keyI: 1.5, rim: 0x7a9aff, rimI: 1.8, hemi: .5 };
  function drawStorm(x, w, h) { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a2a22'); g.addColorStop(.45, '#8a7a50'); g.addColorStop(1, '#1a2a2a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e8d8a0'; x.beginPath(); x.ellipse(w * .7, h * .2, w * .25, h * .1, 0, 0, 7); x.fill();
    x.fillStyle = '#2a4a40'; x.beginPath(); x.moveTo(0, h * .75); for (let i = 0; i <= 10; i++) x.lineTo(w * i / 10, h * (.7 + Math.sin(i * 1.7) * .06)); x.lineTo(w, h); x.lineTo(0, h); x.fill();
    x.fillStyle = '#4a3020'; x.beginPath(); x.moveTo(w * .25, h * .62); x.lineTo(w * .75, h * .55); x.lineTo(w * .68, h * .7); x.lineTo(w * .3, h * .74); x.fill();
    x.strokeStyle = '#3a2a1a'; x.lineWidth = w * .015; x.beginPath(); x.moveTo(w * .5, h * .6); x.lineTo(w * .46, h * .2); x.stroke(); x.fillStyle = '#d8c8a0'; x.beginPath(); x.moveTo(w * .46, h * .22); x.lineTo(w * .7, h * .4); x.lineTo(w * .48, h * .5); x.fill();
    x.fillStyle = 'rgba(255,255,240,.5)'; for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(w * (.1 + i * .16), h * (.72 + (i % 2) * .05), w * .06, h * .02, 0, 0, 7); x.fill(); } }
  function drawConcert(x, w, h) { x.fillStyle = '#4a4030'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8c8a8'; x.fillRect(0, 0, w, h * .55);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#e8e0d0' : '#2a2420'; x.beginPath(); const y0 = h * (.7 + j * .075); x.moveTo(w * (i / 8) - j * 6, y0); x.lineTo(w * ((i + 1) / 8) - j * 6, y0); x.lineTo(w * ((i + 1) / 8) - (j + 1) * 6, y0 + h * .075); x.lineTo(w * (i / 8) - (j + 1) * 6, y0 + h * .075); x.fill(); }
    x.fillStyle = '#3a2a20'; x.fillRect(w * .15, h * .4, w * .45, h * .2); x.fillStyle = '#f2e8d0'; x.beginPath(); x.ellipse(w * .25, h * .35, w * .05, h * .06, 0, 0, 7); x.fill(); x.fillStyle = '#e8d8b8'; x.fillRect(w * .19, h * .38, w * .12, h * .25);
    x.fillStyle = '#8a3a2a'; x.fillRect(w * .48, h * .3, w * .12, h * .35); x.fillStyle = '#f2e0c8'; x.beginPath(); x.ellipse(w * .54, h * .26, w * .045, h * .055, 0, 0, 7); x.fill();
    x.fillStyle = '#f2e8d0'; x.fillRect(w * .68, h * .32, w * .14, h * .35); x.fillStyle = '#f2e0c8'; x.beginPath(); x.ellipse(w * .75, h * .28, w * .045, h * .055, 0, 0, 7); x.fill(); x.fillStyle = '#6a5a3a'; x.fillRect(w * .62, h * .08, w * .3, h * .2); }
  function drawPortrait(x, w, h, seed = 1) { const r = rng(seed); x.fillStyle = ['#3a3020', '#2a2a3a', '#3a2a2a'][seed % 3]; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1410'; x.beginPath(); x.ellipse(w / 2, h * .85, w * .35, h * .3, 0, 0, 7); x.fill();
    x.fillStyle = ['#e8c8a0', '#d8b090', '#f0d0b0'][seed % 3]; x.beginPath(); x.ellipse(w / 2, h * .42, w * .17, h * .16, 0, 0, 7); x.fill(); x.fillStyle = ['#2a1a10', '#5a4030', '#8a8070'][seed % 3]; x.beginPath(); x.ellipse(w / 2, h * .33, w * .2, h * .1, 0, Math.PI, 0); x.fill();
    x.fillStyle = '#f2ece0'; x.beginPath(); x.ellipse(w / 2, h * .62, w * .16, h * .04, 0, 0, 7); x.fill(); }
  function painting(w, h, draw, o = {}) { const g = new THREE.Group(), gold = metal(0xc8a050, { roughness: .35 }), fw = .14;
    [[0, h / 2 + fw / 2, w + fw * 2, fw], [0, -h / 2 - fw / 2, w + fw * 2, fw], [-w / 2 - fw / 2, 0, fw, h], [w / 2 + fw / 2, 0, fw, h]].forEach(([x, y, ww, hh]) => g.add(M(RB(ww, hh, .12, .04), gold, { pos: [x, y, 0] })));
    const t = ctex(Math.round(w * 220), Math.round(h * 220), draw); const canvas = M(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t.tex, roughness: .7 }), { pos: [0, 0, .01], shadow: false }); g.add(canvas);
    const back = M(new THREE.PlaneGeometry(w, h), matte(0x6a5a4a), { pos: [0, 0, -.01], shadow: false }); g.add(back); g.userData.canvas = canvas; return g; }
  function gallery(st, empty = false) { st.scene.add(M(new THREE.PlaneGeometry(14, 7), matte(0x8a2a2a, { roughness: .9 }), { pos: [0, 3.5, -2.2], shadow: false }));
    st.scene.add(M(RB(14, .2, .3, .05), metal(0xc8a050), { pos: [0, 5.2, -2.1] })); const ps = [];
    [[-2.6, 2.6, 1.3, 1.6, 1], [0, 2.8, 1.6, 2.0, 0], [2.6, 2.6, 1.3, 1.6, 2]].forEach(([x, y, w, h, k]) => { const p = painting(w, h, (c, cw, ch) => k === 0 ? drawStorm(c, cw, ch) : drawPortrait(c, cw, ch, k)); p.position.set(x, y, -2.0); if (empty) p.userData.canvas.visible = false; st.scene.add(p); ps.push(p); }); return ps; }

  BUILD.gd_hook = () => {
    const st = stage(MUSEUM_NIGHT); const ps = gallery(st, true);
    const cops = [0, 1].map(i => { const c = fakeCop(i); c.scale.setScalar(.8); st.scene.add(c); return c; });
    const rolls = cops.map(() => { const r = M(new THREE.CylinderGeometry(.12, .12, 1.3, 16), matte(0xd8c8a0), { rot: [0, 0, Math.PI / 2] }); st.scene.add(r); return r; });
    const v = textSign(2.4, .66, '$500,000,000', { color: 0x2f8a48, fg: '#fff', size: 96, font: MONO }); v.position.set(0, 4.4, 0); st.scene.add(v);
    const sl = ps.map(p => spot(st, p, 20, [p.position.x, 6, 1]));
    return { ...st, update(t, s, d) {
      cops.forEach((c, i) => { const x = lerp(-1.4 + i * 1.2, 4.5 + i * 1.2, ease(seg(t, .15, .75))); c.position.set(x, 0, .6 - i * .4); c.rotation.y = Math.PI / 2; c.pose({ s: s + i, walk: s * 9 + i, mouth: 'smile', happy: .5, armR: [-1.2, .2], lean: .1 }); handProp(c, 1, rolls[i], [0, .05, .1]); });
      appear(v, t, .5, d, 1.1); v.rotation.z = Math.sin(s * 2) * .03;
      aim(st.cam, [0, 3.0, 9.4], [0, 2.6, -.5]);
    } };
  };
  BUILD.gd_title = (p) => titleSet(p, MUSEUM_NIGHT, () => fakeCop(0), (st) => { const fr = painting(2.2, 2.6, (x, w, h) => { x.fillStyle = '#6a5a4a'; x.fillRect(0, 0, w, h); }); fr.position.set(0, 2.2, -1.6); fr.userData.canvas.visible = false; st.scene.add(fr); return null; });
  BUILD.gd_door = () => {
    const st = stage(Object.assign({}, MUSEUM_NIGHT, { floor: 0x4a4a52 }));
    st.scene.add(M(RB(7, 5, .4, .05), matte(0xb8a890), { pos: [0, 2.5, -1.6] }));
    st.scene.add(M(RB(1.4, 2.6, .2, .05), plastic(0x3a2a20), { pos: [.4, 1.3, -1.35] }), M(RB(.25, .35, .08, .03), plastic(0x2a2a2a), { pos: [1.4, 1.6, -1.35] }));
    const bz = M(SPH(.06, 10, 8), glowM(0xff3a3a, 3), { pos: [1.4, 1.65, -1.29], shadow: false }); st.scene.add(bz);
    const lamp = sprite(0xffe0a0, 2.2, .7); lamp.position.set(.4, 3.0, -1.1); st.scene.add(lamp);
    const cops = [0, 1].map(i => { const c = fakeCop(i); c.position.set(-.75 + i * 1.4, 0, .2); c.rotation.y = -.25 + i * .3; st.scene.add(c); return c; });
    const dt = textSign(2.2, .5, 'MARCH 18, 1990', { color: 0x1d2442, fg: '#ffc44d', size: 60, font: MONO }); dt.position.set(0, 4.45, .2); st.scene.add(dt);
    const bos = textSign(1.4, .44, 'BOSTON', { color: 0xf3e3c3, fg: '#2a1a12', size: 60 }); bos.position.set(0, 3.95, 1.2); st.scene.add(bos);
    const sh = confetti(60, [0, 4.5, .5], 13, 4, .3); sh.material.color = new THREE.Color(0x3ac85a); for (let i = 0; i < 60; i++) sh.setColorAt(i, new THREE.Color([0x2ab84a, 0x5ae87a, 0x1a8a3a][i % 3])); st.scene.add(sh);
    return { ...st, update(t, s, d) {
      cops.forEach((c, i) => c.pose({ s: s + i, mouth: 'smile', happy: .2, brow: -.6, eyeX: -.4, armR: i === 1 && t > .55 ? [-1.3, .1] : [0, .2] }));
      bz.material.emissiveIntensity = t > .6 ? (Math.sin(s * 12) > 0 ? 4 : .5) : .5; appear(dt, t, .05, d); appear(bos, t, .18, d); sh.update(s - .3 * d);
      aim(st.cam, [lerp(-.5, .3, t), 2.7, lerp(8.4, 7.8, t)], [0, 2.3, -.4]);
    } };
  };
  BUILD.gd_guard = () => {
    const st = stage(Object.assign({}, MUSEUM_NIGHT, { floor: 0x3a3a46 })); const tb = table(2.6, 1.2, 0x4a4a52); tb.position.z = .6; st.scene.add(tb);
    const mons = [-.6, .6].map(x => { const m = G(M(RB(.9, .7, .2, .05), plastic(0x2a2a2a)), M(new THREE.PlaneGeometry(.78, .56), glowM(0x6a9aff, .8), { pos: [0, 0, .11], shadow: false })); m.position.set(x, 1.6, .5); st.scene.add(m); return m; });
    const gu = guard(); gu.position.set(0, 0, -.4); st.scene.add(gu);
    const say = bubble(2.6, .95, (x, w, h) => { label(x, '“We’re answering a', w / 2, h * .36, h * .22, '#2a1a12', 800); label(x, 'disturbance call.”', w / 2, h * .68, h * .22, '#2a1a12', 800); }, -1); say.position.set(-.3, 4.0, .9); st.scene.add(say);
    const btn = M(new THREE.CylinderGeometry(.1, .1, .06, 20), glowM(0x3ae85a, 1.5), { pos: [.5, 1.14, 1.0], shadow: false }); st.scene.add(btn);
    const rule = textSign(2.2, .55, 'RULE BROKEN', { color: 0xc8202f, fg: '#fff', size: 72 }); rule.position.set(0, 1.5, 1.6); st.scene.add(rule);
    return { ...st, update(t, s, d) {
      const press = seg(t, .55, .62);
      gu.pose({ s, mouth: t < .5 ? 'open' : 'smile', open: .3, wide: t < .5 ? .3 : 0, armR: press > 0 ? [-1.25, .05] : [-.8, .15], armL: [-.8, .15], lookY: t < .5 ? .3 : 0, brow: .3 });
      appear(say, t, .08, d); if (t > .52) say.scale.setScalar(0); btn.position.y = 1.14 - (press > 0 && press < 1 ? .03 : 0); btn.material.emissiveIntensity = press > 0 ? 3 : 1;
      mons.forEach((m, i) => m.children[1].material.emissiveIntensity = .7 + Math.sin(s * 3 + i) * .2); appear(rule, t, .7, d, 1.1); rule.rotation.z = -.06;
      aim(st.cam, [.4, 3.0, lerp(7.2, 6.6, t)], [0, 2.4, 0]);
    } };
  };
  BUILD.gd_tied = () => {
    const st = stage(Object.assign({}, MUSEUM_NIGHT, { top: '#1a1a22', bottom: '#3a3a40', floor: 0x4a4a4e }));
    for (let i = 0; i < 4; i++) st.scene.add(M(new THREE.CylinderGeometry(.08, .08, 9, 12), metal(0x7a7a82), { pos: [0, 4.4 - i * .25, -1.6 + i * .1], rot: [0, 0, Math.PI / 2] }));
    const gs = [0, 1].map(i => { const g = makeHuman(Object.assign({}, GUARD, i ? { hair: 0x2a1a10, hairStyle: 'side', skin: 0xc8946a } : {})); g.position.set(-.8 + i * 1.6, -.45, -.4); st.scene.add(g); return g; });
    const tapes = gs.map(g => { const tp = M(RB(.42, .14, .05, .03), matte(0xb8b8b0), { shadow: false }); g.userData.head.add(tp); tp.position.set(0, -.3, .56); return tp; });
    const cops = [0, 1].map(i => { const c = fakeCop(i); c.scale.setScalar(.85); c.position.set(-1.75 + i * 3.5, 0, .9); c.rotation.y = i ? -.6 : .6; st.scene.add(c); return c; });
    const fk = textSign(2.4, .6, 'NOT REAL POLICE', { color: 0xc8202f, fg: '#fff', size: 66 }); fk.position.set(0, 3.5, .6); st.scene.add(fk);
    return { ...st, update(t, s, d) {
      gs.forEach((g, i) => g.pose({ s: s + i, sit: 1, armR: [.3, -.2], armL: [.3, -.2], brow: .8, wide: .6, mouth: 'flat', eyeX: Math.sin(s * 2 + i) * .4 }));
      cops.forEach((c, i) => c.pose({ s: s + i, mouth: 'smile', happy: .4, brow: -.6, armR: [-.2, .3], armL: [-.2, .3] }));
      appear(fk, t, .55, d, 1.1); aim(st.cam, [0, 3.6, lerp(8.4, 7.6, t)], [0, 1.9, 0]);
    } };
  };
  BUILD.gd_cut = () => {
    const st = stage(MUSEUM_NIGHT); const p = painting(1.8, 2.2, drawStorm); p.position.set(0, 2.6, -1.6); st.scene.add(p);
    st.scene.add(M(new THREE.PlaneGeometry(14, 7), matte(0x6a2020, { roughness: .9 }), { pos: [0, 3.5, -1.8], shadow: false }));
    const loose = painting(1.8, 2.2, drawStorm); loose.children.slice(0, 4).forEach(f => f.visible = false); st.scene.add(loose);
    const th = fakeCop(0); th.position.set(1.4, 0, -.6); th.rotation.y = -.7; st.scene.add(th);
    const clk = ctex(400, 400); const clock = G(M(new THREE.CylinderGeometry(.6, .6, .12, 48), plastic(0xffffff), { rot: [Math.PI / 2, 0, 0] }), M(new THREE.CircleGeometry(.55, 48), new THREE.MeshBasicMaterial({ map: clk.tex, toneMapped: false }), { pos: [0, 0, .07], shadow: false })); clock.position.set(-.75, 4.0, .2); clock.scale.setScalar(.8); st.scene.add(clock);
    return { ...st, update(t, s, d) {
      const cut = seg(t, .2, .55), pull = ease(seg(t, .55, .85)); p.userData.canvas.visible = cut < 1 || false; if (cut >= 1) p.userData.canvas.visible = false;
      loose.visible = cut >= 1; loose.position.set(lerp(0, 1.2, pull), 2.6 - pull * .8, -1.55 + pull * 1.5); loose.rotation.set(-pull * .3, -pull * .6, pull * .3); loose.scale.setScalar(1 - pull * .3);
      th.pose({ s, armR: cut < 1 && t > .2 ? [-1.3, .4 + Math.sin(s * 10) * .2] : [-1.0, .3], armL: [-1.1, .3], mouth: 'smile', happy: .3, brow: -.5, lookY: -.3 });
      const mins = Math.round(lerp(0, 81, seg(t, .05, .95)));
      clk.redraw((x, w, h) => { x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(200, 200, 200, 0, 7); x.fill(); const a = mins / 60 * Math.PI * 2; x.strokeStyle = '#c8202f'; x.lineWidth = 12; x.lineCap = 'round'; x.beginPath(); x.moveTo(200, 200); x.lineTo(200 + Math.sin(a) * 140, 200 - Math.cos(a) * 140); x.stroke(); label(x, `${mins} MIN`, 200, 290, 64, '#1d2442', 900, 'center', MONO); });
      appear(clock, t, .02, d, .8);
      aim(st.cam, [lerp(-.4, .4, t), 3.0, lerp(7.8, 7.2, t)], [0, 2.6, -.6]);
    } };
  };
  BUILD.gd_list = () => {
    const st = stage(MUSEUM); const cnt = textSign(1.9, .58, '', { color: 0xf3e3c3, fg: '#2a1a12', size: 70 }); cnt.position.set(0, 4.35, 0); st.scene.add(cnt);
    const tiles = []; for (let i = 0; i < 13; i++) { const c = i % 4, r = Math.floor(i / 4); const pp = painting(.62, .62, (x, w, h) => i === 0 ? drawStorm(x, w, h) : i === 1 ? drawConcert(x, w, h) : drawPortrait(x, w, h, i)); pp.position.set(-1.05 + c * .7, 3.4 - r * .78, 0); pp.scale.setScalar(.95); st.scene.add(pp); tiles.push(pp); }
    const big = [painting(1.5, 1.8, drawStorm), painting(1.7, 1.5, drawConcert)]; big.forEach(b => st.scene.add(b));
    const lb = [textSign(2.4, .48, 'REMBRANDT · only seascape', { color: 0x1d2442, fg: '#fff', size: 44 }), textSign(2.4, .48, 'VERMEER · The Concert', { color: 0x1d2442, fg: '#fff', size: 44 })]; lb.forEach(l => st.scene.add(l));
    return { ...st, update(t, s, d) {
      tiles.forEach((tl, i) => appear(tl, t, .03 + i * .025, d));
      const n = Math.min(13, Math.floor(seg(t, .03, .36) * 13) + 1); cnt.userData.redraw((x, w, h) => label(x, `${n} WORKS`, w / 2, h / 2 + 4, h * .5, '#2a1a12', 900)); appear(cnt, t, .02, d); if (t > .42) cnt.scale.setScalar(0);
      [[.38, .62], [.62, 1.01]].forEach(([a, b], i) => { const on = t > a && t < b, k = on ? Math.min(1, pop((t - a) * d)) : 0; big[i].scale.setScalar(k); big[i].position.set(0, 2.25, 1.2); big[i].rotation.y = Math.sin(s * 1.2) * .1; lb[i].scale.setScalar(k); lb[i].position.set(0, 3.6, 1.5); });
      tiles.forEach(tl => tl.visible = t < .42 || true); tiles.forEach(tl => { if (t > .42) tl.scale.multiplyScalar(.6); });
      aim(st.cam, [0, 2.8, 8.0], [0, 2.7, 0]);
    } };
  };
  BUILD.gd_reward = () => {
    const st = stage(Object.assign({}, ROOM, { top: '#2a2030', bottom: '#5a4a50', floor: 0x3a2e34 }));
    const poster = sign(2.6, 3.0, (x, w, h) => { x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, w, h); label(x, 'REWARD', w / 2, h * .14, h * .12, '#c8202f', 900); x.fillStyle = '#2a2420'; x.fillRect(w * .1, h * .23, w * .8, 6);
      label(x, '$10,000,000', w / 2, h * .38, h * .1, '#1a1410', 900, 'center', MONO); label(x, 'for information leading', w / 2, h * .5, h * .045, '#5a4a3a', 700); label(x, 'to the return of the art', w / 2, h * .56, h * .045, '#5a4a3a', 700);
      [[.25, .78], [.5, .78], [.75, .78]].forEach(([a, b]) => { x.strokeStyle = '#c8a050'; x.lineWidth = 10; x.strokeRect(w * a - 50, h * b - 60, 100, 120); }); }, { color: 0xf4ecd8, depth: .04, ppu: 200 });
    poster.position.set(0, 3.0, -1.0); st.scene.add(poster);
    const det = makeHuman({ suit: 0xb89a6a, pants: 0x3a3a44, tie: 0x2a2a3a, hat: 'fedora', hatCol: 0x4a4038, band: 0x2a2018, hair: 0x3a2a1e, brow: .3 }); det.position.set(1.3, 0, .6); det.rotation.y = -.5; det.scale.setScalar(.85); st.scene.add(det);
    const mag = G(M(new THREE.TorusGeometry(.22, .04, 10, 30), metal(0x2a2a2a)), M(new THREE.CircleGeometry(.21, 24), plastic(0xbfe8ff, { transparent: true, opacity: .3 }))); st.scene.add(mag);
    const notes = ['LEAD?', 'RUMOUR', 'DEAD END', 'TIP?', 'DEAD END'].map((n, i) => { const nt = textSign(1.2, .4, n, { color: [0xffe47a, 0xff9ab0, 0xc8e8ff][i % 3], fg: '#2a1a12', size: 48 }); nt.position.set([-1.2, 1.1, -1.1, 1.0, 0][i], [4.5, 4.4, 1.5, 1.4, 4.75][i], -.6 + i * .1); nt.rotation.z = (i % 2 - .5) * .2; st.scene.add(nt); return nt; });
    return { ...st, update(t, s, d) {
      appear(poster, t, .02, d); det.pose({ s, armR: [-1.2, .2], brow: .5, mouth: 'frown', lookY: .4 }); handProp(det, 1, mag, [0, .1, .15]);
      notes.forEach((n, i) => appear(n, t, .35 + i * .1, d));
      aim(st.cam, [0, 3.1, lerp(8.4, 7.8, t)], [0, 2.9, -.4]);
    } };
  };
  BUILD.gd_frames = () => {
    const st = stage(MUSEUM); const ps = gallery(st, true); ps.forEach(p => spot(st, p, 25, [p.position.x, 6.5, 1.5]));
    const v = makeHuman({ suit: 0x9a5aa0, pants: 0x3a3a6a, tie: null, shirt: 0x9a5aa0, hair: 0x6a3a1e, hairStyle: 'bob', skin: 0xf4c7a6 }); v.position.set(.5, 0, .8); v.rotation.y = Math.PI; v.scale.setScalar(.85); st.scene.add(v);
    const tg = textSign(2.2, .5, 'STILL WAITING', { color: 0xf3e3c3, fg: '#2a1a12', size: 64 }); tg.position.set(0, 4.55, -1.4); st.scene.add(tg);
    return { ...st, update(t, s, d) { v.pose({ s, lookX: -.15, armL: [-.2, .2], armR: [-.2, .2] }); appear(tg, t, .5, d); aim(st.cam, [lerp(-1.2, -.4, t), 2.8, lerp(9.4, 8.6, t)], [0, 2.7, -1]); } };
  };
  BUILD.gd_outro = () => {
    const st = stage(MUSEUM_NIGHT); const fr = painting(2.2, 2.6, (x, w, h) => { x.fillStyle = '#6a5a4a'; x.fillRect(0, 0, w, h); }); fr.position.set(0, 2.6, -1.4); fr.userData.canvas.visible = false; st.scene.add(fr); spot(st, fr, 40, [0, 7, 2]);
    st.scene.add(M(new THREE.PlaneGeometry(14, 7), matte(0x5a1a1a, { roughness: .9 }), { pos: [0, 3.5, -1.6], shadow: false }));
    const q = textSign(.9, .9, '?', { color: 0xffc44d, fg: '#1d2442', size: 170 }); q.position.set(0, 2.6, -1.2); st.scene.add(q);
    const fo = followOutro(st, 'Have you seen these paintings?', { qy: 4.45, by: .9 });
    return { ...st, update(t, s, d) { appear(q, t, .05, d); q.rotation.y = Math.sin(s * 1.5) * .3; fo(t, s, d); aim(st.cam, [Math.sin(s * .3) * .4, 2.8, 8.4], [0, 2.7, 0]); } };
  };

  // ---------- episode 5: the Chowchilla kidnapping (kept gentle: kidnappers are faceless shadows, no weapons shown) ----------
  const ED = { suit: 0x6a7a5a, pants: 0x4a4a3a, tie: null, shirt: 0x6a7a5a, hair: 0x5a4030, hairStyle: 'side', hat: 'cap', hatCol: 0x2a4a7a, stache: false, belly: 1.15, skin: 0xe8b48e, iris: 0x3a5a7a, brow: .1 };
  const ed = () => makeHuman(ED);
  const kid = (i) => { const h = makeHuman({ suit: [0xd23a2a, 0x3a8ad2, 0xf2c44a, 0x5ab84a, 0xd25aa0, 0xf28a3a][i % 6], pants: [0x3a5a8a, 0x5a4a3a, 0x2a3a5a][i % 3], tie: null, shirt: [0xd23a2a, 0x3a8ad2, 0xf2c44a, 0x5ab84a, 0xd25aa0, 0xf28a3a][i % 6], hair: [0x7a4a24, 0x2a1a10, 0xd8a85a, 0x4a2a1a][i % 4], hairStyle: ['curly', 'bob', 'side', 'bob', 'curly', 'side'][i % 6], headScale: 1.3, skin: [0xf6cfb0, 0xd8a07a, 0xa86e4b, 0xf4c7a6][i % 4], nose: .1 }); h.scale.setScalar(.5 + (i % 3) * .04); return h; };
  const MIKE = () => { const h = makeHuman({ suit: 0x3a6aa8, pants: 0x3a3a4a, tie: null, shirt: 0x3a6aa8, hair: 0x6a4a2a, hairStyle: 'side', headScale: 1.12, skin: 0xf4c7a6 }); h.scale.setScalar(.72); return h; };
  const shadowMan = () => { const h = makeHuman({ suit: 0x15151a, pants: 0x15151a, tie: null, shirt: 0x15151a, hair: 0x15151a, hairStyle: 'bald', skin: 0x2a2a30, hat: 'cap', hatCol: 0x101014 }); h.userData.eyes.forEach(e => e.visible = false); h.userData.mouth.visible = false; return h; };
  const FIELDS = { top: '#8ac0f0', bottom: '#f2e2b0', floor: 0xc8b86a, fogColor: '#e8e0c0', key: 0xfff2dc, keyI: 2.8, rim: 0xbfe0ff, rimI: 1.4 };
  function schoolBus() { const g = new THREE.Group(), y = plastic(0xf2b81a);
    g.add(M(RB(4.6, 1.7, 1.7, .25), y, { pos: [0, 1.25, 0] }), M(RB(1.0, 1.1, 1.6, .2), y, { pos: [2.6, .95, 0] }), M(RB(4.7, .12, 1.75, .04), plastic(0x1a1a1a), { pos: [0, .75, 0] }));
    for (let i = 0; i < 6; i++) [-1, 1].forEach(sd => g.add(M(RB(.55, .5, .04, .06), plastic(0x2a3450, { roughness: .1, clearcoat: 1 }), { pos: [-1.8 + i * .7, 1.55, sd * .86], shadow: false })));
    g.add(M(RB(.05, .6, 1.4, .05), plastic(0x2a3450, { roughness: .1, clearcoat: 1 }), { pos: [2.33, 1.6, 0] }));
    [[-1.4, .82], [1.6, .82], [-1.4, -.82], [1.6, -.82]].forEach(([x, z]) => g.add(M(new THREE.CylinderGeometry(.34, .34, .2, 18), plastic(0x1a1a1a), { pos: [x, .34, z], rot: [Math.PI / 2, 0, 0] })));
    const sg = textSign(1.5, .3, 'SCHOOL BUS', { color: 0xf2b81a, fg: '#1a1a1a', size: 46, depth: .04 }); sg.position.set(0, 2.0, .87); g.add(sg);
    const stop = G(M(new THREE.CylinderGeometry(.22, .22, .03, 8), plastic(0xc8202f), { rot: [Math.PI / 2, 0, Math.PI / 8] })); stop.position.set(.9, 1.3, .9); g.add(stop);
    return g; }
  function van() { const g = new THREE.Group(), w = plastic(0xe8e8e0); g.add(M(RB(2.8, 1.6, 1.5, .2), w, { pos: [0, 1.15, 0] }), M(RB(.9, 1.0, 1.45, .18), w, { pos: [1.7, .85, 0] }), M(RB(.05, .5, 1.2, .05), plastic(0x2a3450, { roughness: .1 }), { pos: [2.16, 1.15, 0] }));
    [[-.9, .75], [1.5, .75], [-.9, -.75], [1.5, -.75]].forEach(([x, z]) => g.add(M(new THREE.CylinderGeometry(.3, .3, .18, 18), plastic(0x1a1a1a), { pos: [x, .3, z], rot: [Math.PI / 2, 0, 0] }))); return g; }
  function stars(n = 120, seed = 3) { const r = rng(seed), g = new THREE.Group(); for (let i = 0; i < n; i++) { const s = sprite(0xffffff, .08 + r() * .14, .6 + r() * .4); s.position.set((r() - .5) * 30, 3 + r() * 12, -12 - r() * 6); g.add(s); } return g; }
  function cutaway(st, o = {}) { const soil = new THREE.Group(); soil.add(M(RB(12, 4.5, 4, .05), matte(0x7a5a3a), { pos: [0, -2.25, -2.5] }));
    const lay = ctex(64, 256, (x, w, h) => { [['#8a6a44', 0], ['#7a5a3a', .25], ['#6a4a30', .5], ['#5a3e28', .75]].forEach(([c, y]) => { x.fillStyle = c; x.fillRect(0, y * h, w, h * .25); }); });
    soil.add(M(new THREE.PlaneGeometry(12, 4.5), new THREE.MeshStandardMaterial({ map: lay.tex, roughness: .95 }), { pos: [0, -2.25, -.49], shadow: false }));
    const r = rng(8); for (let i = 0; i < 14; i++) soil.add(M(SPH(.15 + r() * .15, 10, 8), matte(0x9a8a7a), { pos: [(r() - .5) * 11, -r() * 4.2, -.45], scale: [1, .7, .5] }));
    st.scene.add(soil); const tr = new THREE.Group(); tr.position.set(0, -2.6, -.6); st.scene.add(tr);
    tr.add(M(RB(5.2, 2.0, .1, .05), matte(0x9aa0a8), { pos: [0, 0, -.3] }), M(RB(5.4, .12, 1.0, .04), metal(0xa8aeb8), { pos: [0, 1.06, .1] }), M(RB(5.4, .12, 1.0, .04), metal(0x8a909a), { pos: [0, -1.06, .1] }));
    [-2.65, 2.65].forEach(x => tr.add(M(RB(.12, 2.2, 1.0, .04), metal(0xa8aeb8), { pos: [x, 0, .1] })));
    const hatch = new THREE.Group(); hatch.position.set(1.4, 1.12, .1); tr.add(hatch); hatch.add(M(RB(.9, .1, .8, .03), metal(0xc8ccd6), { pos: [.45, 0, 0] }));
    return { soil, tr, hatch }; }

  BUILD.ch_hook = () => {
    const st = stage(FIELDS); const rd = road(60, 3); st.scene.add(rd); st.scene.add(forest(20, 40, 4, -8, 31, 0x4a8a4a));
    const bus = schoolBus(); bus.scale.setScalar(.9); st.scene.add(bus);
    const yr = textSign(1.2, .46, '1976', { color: 0xf3e3c3, fg: '#2a1a12', size: 70, font: MONO }); yr.position.set(0, 3.3, .5); st.scene.add(yr);
    const q = textSign(.8, .8, '?', { color: 0xffc44d, fg: '#1d2442', size: 150 }); q.position.set(.6, 2.0, .5); st.scene.add(q);
    const sp = sparkles(20, [.6, 1.4, 0], 1.4, 0xffffff, 6); st.scene.add(sp);
    return { ...st, update(t, s, d) {
      const x = lerp(-5, 0, ease(seg(t, 0, .45))), van_ = seg(t, .5, .65); bus.position.set(x, 0, 0); bus.scale.setScalar(.9 * (1 - ease(van_)));
      appear(yr, t, .05, d); appear(q, t, .66, d); q.rotation.z = Math.sin(s * 3) * .1; sp.visible = van_ > 0 && van_ < 1; sp.update(s);
      aim(st.cam, [0, 2.6, 7.4], [0, 1.5, 0]);
    } };
  };
  BUILD.ch_title = (p) => titleSet(p, FIELDS, ed, (st) => { const b = schoolBus(); b.scale.setScalar(.6); b.position.set(0, 0, -2.4); st.scene.add(b); return null; });
  BUILD.ch_bus = () => {
    const st = stage(FIELDS); const rd = road(80, 3); st.scene.add(rd); const trees = forest(30, 60, 4, -6, 33, 0x4a8a4a); st.scene.add(trees);
    const bus = schoolBus(); st.scene.add(bus);
    const kids = [0, 1, 2, 3].map(i => { const k = kid(i); k.scale.setScalar(.32); k.position.set(-1.8 + i * 1.05, .85, .95); bus.add(k); return k; });
    const dr = ed(); dr.scale.setScalar(.36); dr.position.set(1.95, .7, .95); bus.add(dr);
    const pl = textSign(2.4, .48, 'CHOWCHILLA, CALIFORNIA', { color: 0xf3e3c3, fg: '#2a1a12', size: 46 }); pl.position.set(0, 4.15, .5); st.scene.add(pl);
    const dt = textSign(1.9, .46, 'JULY 15, 1976', { color: 0x1d2442, fg: '#ffc44d', size: 58, font: MONO }); dt.position.set(0, 3.6, .6); st.scene.add(dt);
    const n = textSign(1.6, .5, '26 KIDS', { color: 0xc8202f, fg: '#fff', size: 76 }); n.position.set(0, 3.0, .8); st.scene.add(n);
    return { ...st, update(t, s, d) {
      bus.position.set(0, Math.abs(Math.sin(s * 8)) * .02, 0); trees.position.x = -(s * 2.5 % 20); rd.position.x = -(s * 2.5 % 2);
      kids.forEach((k, i) => k.pose({ s: s + i, waveR: 1, happy: .8, mouth: 'smile', seed: i * .3 })); dr.pose({ s, armR: [-1.2, .1], armL: [-1.2, .1], mouth: 'smile', happy: .5 });
      appear(pl, t, .03, d); appear(dt, t, .15, d); appear(n, t, .6, d, 1.1);
      aim(st.cam, [-1.5, 2.6, 8.6], [0, 1.9, 0]);
    } };
  };
  BUILD.ch_van = () => {
    const st = stage(Object.assign({}, FIELDS, { top: '#c8a080', bottom: '#f2c890', key: 0xffd8a8 })); st.scene.add(road(60, 3));
    const bus = schoolBus(); bus.position.set(-2.4, 0, 0); bus.scale.setScalar(.8); st.scene.add(bus);
    const faces = [0, 1, 2].map(i => { const k = kid(i + 2); k.scale.setScalar(.3); k.position.set(-1.2 + i * .9, .85, .95); bus.add(k); return k; });
    const vn = van(); vn.position.set(2.4, 0, 0); vn.rotation.y = Math.PI * .6; vn.scale.setScalar(.8); st.scene.add(vn);
    const men = [0, 1, 2].map(i => { const m = shadowMan(); m.scale.setScalar(.75); m.position.set(1.0 + i * .6, 0, 1.2 + (i % 2) * .3); m.rotation.y = -1.2; st.scene.add(m); return m; });
    const stop = textSign(1.4, .55, 'STOP!', { color: 0xc8202f, fg: '#fff', size: 90 }); stop.position.set(.3, 3.8, .6); st.scene.add(stop);
    return { ...st, update(t, s, d) {
      const brake = seg(t, 0, .25); bus.position.x = lerp(-4.2, -2.4, out(brake)); bus.rotation.z = brake < 1 ? 0 : Math.sin(Math.min(1, (t - .25) * 6) * Math.PI) * -.02;
      faces.forEach((k, i) => k.pose({ s: s + i, wide: t > .35 ? 1 : 0, mouth: t > .35 ? 'open' : 'smile', open: .4, brow: t > .35 ? .8 : 0, seed: i * .2 }));
      men.forEach((m, i) => { const k = seg(t, .4 + i * .06, .7 + i * .06); m.visible = k > 0; m.position.x = lerp(1.6 + i * .5, .2 + i * .55, k); m.pose({ s: s + i, walk: k > 0 && k < 1 ? s * 7 : undefined, armR: [0, .2], armL: [0, .2] }); });
      appear(stop, t, .2, d, 1.1); if (t > .5) stop.scale.setScalar(0);
      aim(st.cam, [0, 3.0, 9.6], [0, 1.6, 0]);
    } };
  };
  BUILD.ch_quarry = () => {
    const st = stage(Object.assign({}, STORM, { top: '#0d1438', bottom: '#2a3460', floor: 0x5a5a62 }));
    st.scene.add(stars());
    const rocks = new THREE.Group(); const r = rng(41); for (let i = 0; i < 16; i++) rocks.add(M(new THREE.DodecahedronGeometry(.6 + r() * 1.2, 0), matte(0x8a8a90), { pos: [(r() - .5) * 14, .2, -2 - r() * 6], scale: [1, .6 + r() * .6, 1] })); st.scene.add(rocks);
    const map = sign(3.2, 2.2, (x, w, h) => { x.fillStyle = '#e8dcbc'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8d8a0'; x.beginPath(); x.ellipse(w * .5, h * .5, w * .45, h * .4, .3, 0, 7); x.fill();
      x.strokeStyle = '#c8202f'; x.lineWidth = 8; x.setLineDash([18, 12]); x.beginPath(); x.moveTo(w * .7, h * .78); x.bezierCurveTo(w * .6, h * .5, w * .4, h * .55, w * .25, h * .22); x.stroke(); x.setLineDash([]);
      x.fillStyle = '#c8202f'; [[.7, .78], [.25, .22]].forEach(([a, b]) => { x.beginPath(); x.arc(w * a, h * b, 18, 0, 7); x.fill(); }); label(x, 'CHOWCHILLA', w * .7, h * .9, h * .07, '#2a1a12', 900); label(x, 'QUARRY', w * .25, h * .1, h * .07, '#2a1a12', 900); }, { color: 0xe8dcbc, depth: .04 });
    map.position.set(0, 2.6, .6); st.scene.add(map);
    const mi = textSign(1.9, .52, '≈ 100 MILES', { color: 0xc8202f, fg: '#fff', size: 70 }); mi.position.set(0, 4.2, .9); st.scene.add(mi);
    const vn = van(); vn.scale.setScalar(.5); st.scene.add(vn);
    return { ...st, update(t, s, d) {
      appear(map, t, .02, d); if (t > .62) map.scale.setScalar(Math.max(0, 1 - seg(t, .62, .7)));
      appear(mi, t, .3, d); vn.position.set(lerp(-5, 2, seg(t, .65, 1)), 0, 1.4); vn.visible = t > .62;
      aim(st.cam, [0, 2.8, lerp(8.4, 9.2, t)], [0, 2.3, 0]);
    } };
  };
  BUILD.ch_buried = () => {
    const st = stage(Object.assign({}, STORM, { top: '#0d1438', bottom: '#2a3460', floor: null, fog: false })); st.scene.add(stars(80, 5));
    st.scene.add(M(RB(12, .2, 4, .05), matte(0x6a5a42), { pos: [0, -.1, -2.5] }));
    const { tr } = cutaway(st);
    const ladder = G(...[-.2, .2].map(x => M(new THREE.CylinderGeometry(.03, .03, 2.8, 8), matte(0x8a6a4a), { pos: [x, 0, 0] })), ...[0, 1, 2, 3, 4, 5].map(i => M(new THREE.CylinderGeometry(.025, .025, .4, 8), matte(0x8a6a4a), { pos: [0, -1.2 + i * .45, 0], rot: [0, 0, Math.PI / 2] }))); ladder.position.set(1.85, -1.1, -.3); st.scene.add(ladder);
    const kids = [0, 1, 2, 3, 4, 5].map(i => { const k = kid(i); k.scale.setScalar(.34); st.scene.add(k); return k; });
    const rs = textSign(2.2, .55, '$5,000,000 RANSOM', { color: 0x2f8a48, fg: '#fff', size: 56 }); rs.position.set(0, 2.2, .4); st.scene.add(rs);
    const ug = textSign(2.2, .48, 'BURIED UNDERGROUND', { color: 0xc8202f, fg: '#fff', size: 52 }); ug.position.set(0, .8, .5); st.scene.add(ug);
    return { ...st, update(t, s, d) {
      kids.forEach((k, i) => { const k0 = seg(t, .05 + i * .07, .3 + i * .07); k.position.set(lerp(1.85, -1.8 + i * .62, k0 >= 1 ? 1 : 0), k0 < 1 ? lerp(.2, -3.55, k0) : -3.55, -.25); k.visible = k0 > 0;
        k.pose({ s: s + i, mouth: 'frown', brow: .7, wide: .5, armR: k0 < 1 ? [0, 2.6] : [0, .2], armL: k0 < 1 ? [0, 2.6] : [0, .2], seed: i * .2 }); });
      appear(ug, t, .2, d); appear(rs, t, .6, d);
      aim(st.cam, [0, .6, 10.4], [0, -.6, -.5]);
    } };
  };
  BUILD.ch_dark = () => {
    const st = stage(Object.assign({}, STORM, { top: '#05060c', bottom: '#0d1020', floor: 0x2a2a30, hemi: .25, keyI: .3 }));
    st.scene.add(M(RB(7, 3.2, .1, .05), matte(0x6a7078), { pos: [0, 1.6, -1.2] }), M(RB(7, .1, 3, .04), metal(0x6a7078), { pos: [0, 3.2, 0] }));
    const e = ed(); e.scale.setScalar(.8); e.position.set(-.4, 0, -.2); st.scene.add(e);
    const ks = [0, 1, 2, 3, 4].map(i => { const k = kid(i + 1); k.position.set([-1.4, .5, 1.1, -1.0, .2][i], 0, [.4, .3, .5, 1.1, 1.2][i]); k.rotation.y = [.4, -.4, -.6, .3, 0][i]; st.scene.add(k); return k; });
    const fl = new THREE.SpotLight(0xfff2c8, 30, 10, .5, .6); fl.position.set(-.4, 2.6, 1.5); fl.target.position.set(0, .8, 0); st.scene.add(fl, fl.target);
    const glow = sprite(0xfff2c8, 1.5, .6); glow.position.set(-.1, 1.6, .4); st.scene.add(glow);
    const hg = textSign(.55, .55, '♥', { color: 0xffd0dc, fg: '#e84a6a', size: 100 }); hg.position.set(.8, 2.4, .8); st.scene.add(hg);
    return { ...st, update(t, s, d) {
      e.pose({ s, talk: t < .5 ? .7 : 0, mouth: 'smile', happy: .4, brow: .3, armR: [-.6, .5], armL: [-.4, .4], lookY: Math.sin(s * .6) * .4 });
      ks.forEach((k, i) => k.pose({ s: s + i, mouth: i % 2 ? 'smile' : 'frown', brow: .5, armR: i === 1 || i === 2 ? [-.8, .6] : [0, .2], armL: i === 1 || i === 2 ? [-.8, .6] : [0, .2], seed: i * .3 }));
      fl.target.position.x = Math.sin(s * .8) * 1.2; glow.material.opacity = .5 + Math.sin(s * 3) * .1; appear(hg, t, .55, d); hg.scale.multiplyScalar(1 + Math.sin(s * 5) * .08);
      aim(st.cam, [0, 2.4, lerp(6.6, 6.0, t)], [0, 1.4, .2]);
    } };
  };
  BUILD.ch_dig = () => {
    const st = stage(Object.assign({}, STORM, { top: '#0d1438', bottom: '#2a3460', floor: null, fog: false })); st.scene.add(stars(80, 7));
    st.scene.add(M(RB(12, .2, 4, .05), matte(0x6a5a42), { pos: [0, -.1, -2.5] }));
    const { tr, hatch } = cutaway(st);
    const e = ed(); e.scale.setScalar(.42); st.scene.add(e); const mk = MIKE(); mk.scale.setScalar(.36); st.scene.add(mk);
    const mats = [0, 1, 2, 3].map(i => { const m = M(RB(1.2, .14, .7, .06), matte([0xd8c8a8, 0xc8b8e8, 0xa8c8d8, 0xe8c8b8][i]), {}); st.scene.add(m); return m; });
    const dirt = [0, 1, 2, 3, 4, 5, 6].map(() => { const p = M(SPH(.07, 8, 6), matte(0x8a6a44), { shadow: false }); st.scene.add(p); return p; });
    const nm = textSign(2.5, .5, 'MICHAEL MARSHALL, 14', { color: 0xc8202f, fg: '#fff', size: 52 }); nm.position.set(.9, -.45, .5); st.scene.add(nm);
    return { ...st, update(t, s, d) {
      mats.forEach((m, i) => { const k = seg(t, .05 + i * .07, .15 + i * .07); m.position.set(lerp(-1.6, 1.85, k), -3.6 + .07 + i * .15 * (k >= 1 ? 1 : 0) + (k < 1 ? Math.sin(k * Math.PI) * .4 : 0), -.3); m.visible = k > 0; });
      const top = -3.6 + .6 + .15; e.position.set(1.4, top, -.3); mk.position.set(2.3, top, -.3);
      const push = t > .45; hatch.rotation.z = push ? ease(seg(t, .6, .85)) * 1.1 : 0;
      [e, mk].forEach((h, i) => h.pose({ s: s + i, upR: push ? 1 : 0, upL: push ? 1 : 0, armR: push ? undefined : [-.6, .3], mouth: 'open', open: .3 + (push ? Math.abs(Math.sin(s * 6)) * .3 : 0), brow: .4, lookX: push ? -.3 : 0, squash: push ? Math.sin(s * 6) * .03 : 0 }));
      dirt.forEach((p, i) => { const ph = frac(s * .9 + i / 7); p.visible = push; p.position.set(1.8 + Math.sin(i * 3) * .5, -1.4 - ph * 2.0, -.2); });
      appear(nm, t, .25, d);
      aim(st.cam, [.9, -1.3, 7.0], [.9, -2.2, -.4]);
    } };
  };
  BUILD.ch_out = () => {
    const st = stage(Object.assign({}, STORM, { top: '#0d1840', bottom: '#4a4a80', floor: 0x5a5a62, fogNear: 14 })); st.scene.add(stars(140, 9));
    const hole = M(new THREE.CylinderGeometry(.6, .6, .05, 24), matte(0x1a1410), { pos: [0, .03, 0], shadow: false }); st.scene.add(hole);
    const rocks = new THREE.Group(); const r = rng(43); for (let i = 0; i < 12; i++) rocks.add(M(new THREE.DodecahedronGeometry(.6 + r() * 1.0, 0), matte(0x8a8a90), { pos: [(r() - .5) * 14, .2, -3 - r() * 6], scale: [1, .6 + r() * .6, 1] })); st.scene.add(rocks);
    const kids = []; for (let i = 0; i < 10; i++) { const k = kid(i); st.scene.add(k); kids.push(k); }
    const cnt = textSign(1.6, .55, '', { color: 0xf3e3c3, fg: '#2a1a12', size: 70 }); cnt.position.set(0, 3.7, .3); st.scene.add(cnt);
    const all = textSign(2.6, .55, 'EVERY CHILD SURVIVED', { color: 0x2f8a48, fg: '#fff', size: 58 }); all.position.set(0, 3.1, .5); st.scene.add(all);
    const moon = M(SPH(1.0, 32, 24), glowM(0xfff2d0, 1.4), { pos: [-2, 6.5, -10], shadow: false }); st.scene.add(moon);
    return { ...st, update(t, s, d) {
      kids.forEach((k, i) => { const k0 = seg(t, .05 + i * .055, .2 + i * .055), ang = -2.4 + i * .53; k.visible = k0 > 0;
        const hp = Math.min(1, k0 * 1.8), run = clamp(k0 * 1.8 - .8); k.position.set(Math.cos(ang) * 1.9 * ease(run), hp < 1 ? -.6 + hp * .6 : 0, Math.sin(ang) * .9 * ease(run) + .3);
        k.pose({ s: s + i, mouth: 'smile', happy: .9, upR: hp >= 1 ? 1 : 0, upL: hp >= 1 ? 1 : 0, hop: run >= 1 ? Math.abs(Math.sin(s * 5 + i)) * .15 : 0, seed: i * .2 }); });
      const n = Math.min(26, Math.round(seg(t, .05, .62) * 26)); cnt.userData.redraw((x, w, h) => label(x, `${n} / 26`, w / 2, h / 2 + 4, h * .55, '#2a1a12', 900, 'center', MONO)); appear(cnt, t, .03, d); appear(all, t, .66, d, 1.1);
      aim(st.cam, [0, 2.8, lerp(8.0, 8.8, t)], [0, 1.6, 0]);
    } };
  };
  BUILD.ch_caught = () => {
    const st = stage(ROOM); const pap = newspaper('KIDNAPPERS\nCAUGHT', 'all three arrested within weeks', 2.6, 3.4, 'THE DAILY NEWS'); pap.position.set(0, 2.9, -.4); pap.scale.setScalar(.78); st.scene.add(pap);
    const b = bars(3.4, 3.6); b.position.set(0, 0, .8); st.scene.add(b);
    const life = textSign(2.2, .56, 'LIFE SENTENCES', { color: 0xc8202f, fg: '#fff', size: 70 }); life.position.set(0, 1.75, 1.2); st.scene.add(life);
    const par = textSign(2.6, .5, 'PAROLED DECADES LATER', { color: 0xf3e3c3, fg: '#2a1a12', size: 52 }); par.position.set(0, 4.35, 1.0); st.scene.add(par);
    return { ...st, update(t, s, d) { appear(pap, t, .02, d, .78); b.position.y = lerp(4, 0, out(seg(t, .3, .45))); appear(life, t, .42, d); appear(par, t, .65, d); aim(st.cam, [0, 2.8, lerp(7.8, 7.2, t)], [0, 2.6, 0]); } };
  };
  BUILD.ch_outro = () => {
    const st = stage({ top: '#ffb87a', bottom: '#ffe2b0', floor: 0xe8c88a, keyPos: [-6, 6, 6], key: 0xffd8a0 }); st.scene.add(road(60, 3));
    const bus = schoolBus(); bus.scale.setScalar(.7); bus.position.set(0, 0, -3); st.scene.add(bus);
    st.scene.add(K.pedestal(1.6, 0xffffff, 0xffc44d));
    const e = ed(); e.position.set(-.55, .4, 0); e.scale.setScalar(.85); st.scene.add(e); const mk = MIKE(); mk.position.set(.6, .4, .1); st.scene.add(mk);
    const hero = textSign(1.6, .5, 'HEROES', { color: 0xffc44d, fg: '#2a1a12', size: 76 }); hero.position.set(0, 3.95, .4); st.scene.add(hero);
    const btn = textSign(2.5, .75, 'FOLLOW  +', { color: 0xc8202f, fg: '#ffffff', size: 100, depth: .35 }); btn.position.set(0, 1.0, 2.0); st.scene.add(btn);
    const sp = sparkles(26, [0, 2.4, 0], 2, 0xffffff, 14); st.scene.add(sp);
    return { ...st, update(t, s, d) {
      e.pose({ s, mouth: 'smile', happy: .7, armR: [0, .2], armL: [0, .2] }); mk.pose({ s, mouth: 'smile', happy: .9, waveR: 1 });
      appear(hero, t, .1, d); btn.scale.setScalar(t > .62 ? Math.min(1, pop((t - .62) * d)) * (1 + Math.sin(s * 5) * .03) : 0); sp.update(s);
      aim(st.cam, [Math.sin(s * .25) * .5, 2.8, 8.4], [0, 2.3, 0]);
    } };
  };
}
