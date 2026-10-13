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
    body.add(M(new THREE.CylinderGeometry(.17, .2, .3, 20), skinM, { pos: [0, 1.38, 0] }));
    const head = new THREE.Group(); head.position.set(0, 1.95, 0); body.add(head);
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
    if (hs === 'curly') { const r = rng(9); for (let i = 0; i < 22; i++) { const a = r() * Math.PI * 2, b = r() * .9; head.add(M(SPH(.17, 16, 12), hairM, { pos: [Math.cos(a) * Math.sin(b) * .58, .2 + Math.cos(b) * .42, Math.sin(a) * Math.sin(b) * .5 - .08] })); } }
    if (hs === 'bald') [-1, 1].forEach(s => head.add(M(SPH(.2, 16, 12), hairM, { pos: [s * .5, .05, -.18], scale: [.5, .9, 1] })));
    const hatCol = o.hatCol ?? 0x2b2b33;
    if (o.hat === 'fedora') { const h = G(M(new THREE.CylinderGeometry(.42, .5, .4, 32), plastic(hatCol, { clearcoat: .2 }), { pos: [0, .2, 0] }), M(new THREE.CylinderGeometry(.82, .82, .04, 40), plastic(hatCol, { clearcoat: .2 }), { pos: [0, 0, 0] }),
      M(new THREE.CylinderGeometry(.505, .505, .1, 32), matte(o.band ?? 0x9e1b2c), { pos: [0, .06, 0] })); h.position.set(0, .48, -.03); h.rotation.set(-.1, 0, .08); head.add(h); }
    if (o.hat === 'cap') { const h = G(M(new THREE.SphereGeometry(.64, 32, 16, 0, Math.PI * 2, 0, Math.PI * .4), plastic(hatCol, { clearcoat: .1, roughness: .8 }), { scale: [1, .8, 1.05] }), M(RB(.7, .05, .4, .02), plastic(hatCol, { roughness: .8 }), { pos: [0, .14, .55], rot: [.15, 0, 0] })); h.position.set(0, .2, -.03); head.add(h); }
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
      legs.forEach((l, i) => { l.rotation.x = w === undefined ? 0 : (i ? -sw : sw) * .55; l.position.y = 1.0 + (p.hop ?? 0); });
      head.rotation.set(p.lookX ?? 0, p.lookY ?? 0, (p.tilt ?? 0) + Math.sin(s * 1.3) * .02);
      const blink = (frac(s / 3.1 + (p.seed ?? 0)) < .04) ? .1 : 1;
      eyes.forEach(e => { e.scale.set(1, blink * (1 - (p.happy ?? 0) * .4) * (1 + (p.wide ?? 0) * .25), 1); e.rotation.set(-(p.eyeY ?? 0) * .4, (p.eyeX ?? 0) * .5, 0); });
      const bw = p.brow ?? o.brow ?? 0;
      brows.forEach((b, i) => { const sd = i ? 1 : -1; b.rotation.z = Math.PI / 2 - sd * bw * .35; b.position.y = .3 + (p.browUp ?? 0) * .08 + Math.abs(bw) * .01; });
      const md = p.mouth ?? 'smile', talk = p.talk ? (.25 + .75 * Math.abs(Math.sin(s * 13) * Math.sin(s * 4.1 + 1))) * p.talk : 0;
      const op = Math.max(p.open ?? 0, talk);
      smile.visible = (md === 'smile' || md === 'frown') && op < .2; smile.rotation.z = md === 'frown' ? 0 : Math.PI; smile.position.y = md === 'frown' ? -.08 : 0;
      smile.scale.set(1 + (p.happy ?? 0) * .3, 1, 1);
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
  function newspaper(head, sub, w = 2.6, h = 3.4) { return sign(w, h, (x, cw, ch) => { x.fillStyle = '#f4ecd8'; x.fillRect(0, 0, cw, ch); label(x, 'LE JOURNAL', cw / 2, ch * .08, ch * .065, '#2a2420', 900); x.fillStyle = '#2a2420'; x.fillRect(cw * .05, ch * .14, cw * .9, 6);
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
}
