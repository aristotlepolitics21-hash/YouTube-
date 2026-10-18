// Shared building blocks for Body Shorts (videos/body-shorts): a stylised human with an x-ray mode,
// anatomy props (brain, vessels, nerves, organs, germs) and the stages the episodes are filmed on.
export function body(K) {
  if (body.done) return body.done;
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, label, sign, textSign, sprite, stage, aim, clamp, lerp, seg, ease, pop, frac, V, rng } = K;

  // ---------- stages ----------
  const ST = {
    day: { top: '#bfe3ff', bottom: '#ffe2c6', floor: 0xf2d2b2 },
    warm: { top: '#ffe0bd', bottom: '#ffb99a', floor: 0xf0a888 },
    mint: { top: '#c9f5e6', bottom: '#fff1cc', floor: 0xf3e2b6 },
    lilac: { top: '#d9ccff', bottom: '#ffd3e6', floor: 0xf6c1d9 },
    night: { top: '#111833', bottom: '#33295e', floor: 0x2f2858, hemi: .8 },
    // inside the body: deep reds, fog, no sky
    flesh: { top: '#3a0812', bottom: '#8a2236', floor: 0x7a1c2e, fogColor: '#5a1020', fogNear: 9, fogFar: 30, hemi: .9, sky: 0xffc2c8, key: 0xffe2dc, rim: 0xff8fa8, rimI: 2.4 },
    xray: { top: '#0b1a33', bottom: '#12345a', floor: 0x0f2a48, fogColor: '#0f2a48', fogNear: 12, fogFar: 40, hemi: .7, rim: 0x7fd8ff, rimI: 2.6 },
    clinic: { top: '#e4f4ff', bottom: '#cfe7f2', floor: 0xbfdbe6 },
  };
  const set = (name, o = {}) => stage(Object.assign({}, ST[name] || ST.day, o));

  // ---------- small helpers ----------
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const skinM = c => plastic(c, { roughness: .55, clearcoat: .25, clearcoatRoughness: .5, envMapIntensity: .55 });
  const cloth = c => matte(c, { roughness: .78 });
  const tag = (txt, col = 0xffffff, fg = '#1d2442', w, h = .44) => { w = w ?? Math.max(1.0, txt.length * .19 + .4); const g = textSign(w, h, txt, { color: col, fg, size: h * 150 }); g.userData.w = w; return g; };
  // a title sign pair on top of the frame (hook lines)
  function titleSigns(top, bottom, col = 0xff4a5c) {
    const a = textSign(3.4, .78, top, { color: 0xffffff, fg: '#1d2442', size: 96 }), b = textSign(3.2, .7, bottom, { color: col, fg: '#ffffff', size: 92 });
    const g = G(a, b); g.userData.w = 3.4; b.position.set(0, -.82, .15); g.update = (t, s) => { a.scale.setScalar(popIn(t, .02)); b.scale.setScalar(popIn(t, .12)); a.rotation.z = Math.sin(s * 2.2) * .025; b.rotation.z = -Math.sin(s * 2.2 + 1) * .025; }; return g;
  }
  function arrow(col = 0xffd23f, len = 1) { const g = G(M(new THREE.CylinderGeometry(.07, .07, len, 16), glowM(col, 1.6), { pos: [0, len / 2, 0], shadow: false }), M(new THREE.ConeGeometry(.18, .36, 20), glowM(col, 1.8), { pos: [0, len + .16, 0], shadow: false })); return g; }
  function check(ok = true) { const g = textSign(.62, .62, ok ? '✓' : '✕', { color: ok ? 0x3cc85a : 0xff4a5c, fg: '#ffffff', size: 120 }); g.userData.w = .62; return g; }
  function warnSign(s = 1) {
    const g = sign(1.1 * s, 1.0 * s, (x, w, h) => { x.fillStyle = '#ffcf33'; x.beginPath(); x.moveTo(w / 2, 10); x.lineTo(w - 10, h - 10); x.lineTo(10, h - 10); x.closePath(); x.fill(); x.strokeStyle = '#1d2442'; x.lineWidth = 16; x.lineJoin = 'round'; x.stroke(); label(x, '!', w / 2, h * .62, h * .6, '#1d2442', 900); }, { color: 0xffffff, depth: .08 });
    g.children[0].visible = false; return g;
  }
  // a counter sign: draw(k) prints a value as k goes 0..1
  function counter(w, h, fmt, col = '#1d2442', bg = '#ffffff') { const g = sign(w, h, () => {}, { color: 0xffffff }); g.set = k => g.userData.redraw((x, cw, ch) => { x.fillStyle = bg; x.fillRect(0, 0, cw, ch); label(x, fmt(k), cw / 2, ch / 2 + 4, ch * .56, col, 900); }); g.set(0); return g; }

  // ---------- the person ----------
  // Stylised, big-headed human. Local units: feet at y=0, head centre at y=2.7, facing +z.
  const SKINS = [0xf2c7a5, 0xd9a07a, 0xa8714e, 0x7a4a30, 0xffd9bd];
  function makePerson(o = {}) {
    const skinC = new THREE.Color(o.skin ?? SKINS[0]), root = new THREE.Group(), skinMats = [], clothMats = [];
    const sk = () => { const m = skinM(skinC.clone()); skinMats.push(m); return m; }, cl = c => { const m = cloth(c); clothMats.push(m); return m; };
    const shirt = cl(o.shirt ?? 0x3d7bff), pants = cl(o.pants ?? 0x2a3150), shoe = cl(o.shoe ?? 0xffffff), hairM = cl(o.hair ?? 0x3a2418);
    const hips = M(SPH(.5, 32, 20), pants, { pos: [0, 1.05, 0], scale: [1, .5, .72] }); root.add(hips);
    const torso = M(new THREE.CapsuleGeometry(.5, .55, 10, 28), shirt, { pos: [0, 1.58, 0], scale: [1, 1, .72] }); root.add(torso);
    const legs = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * .24, 1.0, 0); g.add(M(new THREE.CapsuleGeometry(.2, .3, 8, 18), pants, { pos: [0, -.22, 0] }));
      const kn = new THREE.Group(); kn.position.y = -.47; g.add(kn); kn.add(M(new THREE.CapsuleGeometry(.18, .25, 8, 18), pants, { pos: [0, -.2, 0] }), M(SPH(.22, 24, 16), shoe, { pos: [0, -.43, .1], scale: [1, .6, 1.4] })); g.userData.knee = kn; root.add(g); return g; });
    const neck = M(new THREE.CylinderGeometry(.16, .18, .32, 20), sk(), { pos: [0, 2.12, 0] }); root.add(neck);
    // arms: shoulder -> upper arm -> elbow -> forearm + hand; posed by angles or by a hand target (two-bone IK)
    const UA = .5, FA = .55;
    const arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * .56, 1.95, 0);
      sh.add(M(new THREE.CapsuleGeometry(.15, UA - .15, 8, 16), shirt, { pos: [0, -UA / 2 + .03, 0] }));
      const el = new THREE.Group(); el.position.y = -UA; sh.add(el);
      el.add(M(new THREE.CapsuleGeometry(.12, FA - .3, 8, 16), sk(), { pos: [0, -FA / 2 + .1, 0] }), M(SPH(.15, 24, 16), sk(), { pos: [0, -FA, 0], scale: [1, 1.1, .85] }));
      sh.userData.el = el; root.add(sh); return sh; });
    const _q = new THREE.Quaternion(), _d = new THREE.Vector3(), DOWN = new THREE.Vector3(0, -1, 0);
    function ik(sh, T, pole) { const S = sh.position, d = Math.min(_d.copy(T).sub(S).length(), UA + FA - .02), dir = _d.clone().normalize();
      const x = (UA * UA - FA * FA + d * d) / (2 * d), h = Math.sqrt(Math.max(0, UA * UA - x * x)), pv = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize();
      const E = S.clone().addScaledVector(dir, x).addScaledVector(pv, h), Tc = S.clone().addScaledVector(dir, d);
      sh.quaternion.setFromUnitVectors(DOWN, E.clone().sub(S).normalize());
      const fd = Tc.sub(E).normalize().applyQuaternion(_q.copy(sh.quaternion).invert()); sh.userData.el.quaternion.setFromUnitVectors(DOWN, fd); }
    // head
    const head = new THREE.Group(); head.position.set(0, 2.7, 0); root.add(head);
    const skull = M(SPH(.62, 64, 48), sk(), { scale: [1, 1.04, .97] }); head.add(skull);
    [-1, 1].forEach(s => head.add(M(SPH(.12, 20, 14), skull.material, { pos: [s * .6, -.02, 0], scale: [.55, 1, .8] })));
    const nose = M(SPH(.1, 24, 16), skull.material, { pos: [0, -.06, .6], scale: [.9, 1, 1.15] }); head.add(nose);
    const eyes = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * .22, .08, .5);
      e.add(M(SPH(.12, 28, 20), plastic(0xffffff, { roughness: .2 }), { shadow: false }), M(SPH(.072, 24, 16), plastic(o.eye ?? 0x5a3a22, { roughness: .15 }), { pos: [0, 0, .1], scale: [1, 1, .45], shadow: false }),
        M(SPH(.036, 16, 10), plastic(0x0b0b10, { roughness: .1 }), { pos: [0, 0, .122], scale: [1, 1, .4], shadow: false }), M(SPH(.016, 10, 8), glowM(0xffffff, 3), { pos: [.025, .03, .134], shadow: false }));
      head.add(e); return e; });
    const brows = [-1, 1].map(s => { const b = M(RB(.2, .05, .06, .02), hairM, { pos: [s * .22, .29, .52] }); head.add(b); return b; });
    const mouth = new THREE.Group(); mouth.position.set(0, -.27, .55); head.add(mouth);
    const smile = M(new THREE.TorusGeometry(.12, .025, 8, 28, Math.PI), plastic(0x8a2b2b), { rot: [0, 0, Math.PI], shadow: false }); mouth.add(smile);
    const open = M(SPH(.12, 28, 18), plastic(0x5a1418, { roughness: .4 }), { scale: [1, .2, .35], shadow: false }); mouth.add(open);
    const cheeks = [-1, 1].map(s => { const c = M(SPH(.1, 20, 14), matte(0xff8e8e, { transparent: true, opacity: .55 }), { pos: [s * .36, -.14, .44], scale: [1, .7, .4], shadow: false }); head.add(c); return c; });
    if ((o.hairStyle ?? 'short') !== 'bald') { const long = o.hairStyle === 'long';
      const hair = M(new THREE.SphereGeometry(.665, 48, 32, 0, Math.PI * 2, 0, long ? 1.6 : 1.2), hairM, { rot: [long ? -.62 : -.35, 0, 0] }); head.add(hair);
      if (long) head.add(M(RB(1.15, .9, .3, .14), hairM, { pos: [0, -.35, -.38] })); }
    const inner = new THREE.Group(); root.add(inner); // organs live here, in person-local coordinates
    root.userData = { head, skull, eyes, brows, mouth, smile, open, cheeks, arms, legs, torso, nose, inner, skinMats, clothMats };
    // p: s (seconds), mouth 0..1 (open), smile -1..1, squint 0..1, brow -1 (angry) .. 1 (worried), flush 0..1, puff 0..1,
    //    headTilt, headTurn, headNod, armR/armL [forward, out] angles, look [x, y], walk phase, bob
    const red = new THREE.Color(0xe8433f);
    root.pose = (p = {}) => {
      const s = p.s ?? 0, br = Math.sin(s * 2.6) * .02 * (p.bob ?? 1);
      head.rotation.set(p.headNod ?? 0, p.headTurn ?? 0, p.headTilt ?? 0); head.position.y = 2.7 + br * 1.5;
      torso.scale.set(1 + br, 1 - br * .5, .72); root.rotation.x = p.lean ?? 0;
      const blink = frac(s / 3.1 + (p.seed ?? 0)) < .04 ? .1 : 1, sq = clamp(p.squint ?? 0);
      eyes.forEach(e => { e.scale.set(1 + (p.wide ?? 0) * .25, Math.max(.06, blink * (1 - sq * .9) * (1 + (p.wide ?? 0) * .3)), 1); e.children[1].position.x = (p.look?.[0] ?? 0) * .03; e.children[1].position.y = (p.look?.[1] ?? 0) * .03; e.children[2].position.copy(e.children[1].position).setZ(.122); });
      const bw = p.brow ?? 0; brows.forEach((b, i) => { const sd = i ? 1 : -1; b.rotation.z = sd * bw * .35; b.position.y = .29 + Math.abs(bw) * .02 + (bw > 0 ? .03 : 0) - sq * .04; });
      const mo = clamp(p.mouth ?? 0), sm = p.smile ?? .6; open.visible = mo > .05; smile.visible = mo <= .05;
      open.scale.set(1 + (p.mouthW ?? 0), .15 + mo * 1.05, .35); smile.scale.set(1, Math.abs(sm) + .05, 1); smile.rotation.z = sm >= 0 ? Math.PI : 0; smile.position.y = sm >= 0 ? 0 : -.08;
      const fl = clamp(p.flush ?? 0); skinMats.forEach(m => m.color.copy(skinC).lerp(red, fl * .45));
      cheeks.forEach(c => { const pf = p.puff ?? 0; c.scale.set(1 + pf * 1.4, .7 + pf, .4 + pf * .9); c.material.opacity = .45 + fl * .5; c.position.z = .44 + pf * .06; });
      const w = p.walk, sw = w === undefined ? 0 : Math.sin(w) * .5;
      [[arms[1], p.handR, p.armR, p.poleR, 1, sw], [arms[0], p.handL, p.armL, p.poleL, -1, -sw]].forEach(([sh, hT, a, pole, sd, swing]) => {
        if (hT) { ik(sh, hT.isVector3 ? hT : V(...hT), pole ? V(...pole) : V(sd * .6, -.6, -.3)); return; }
        a = a ?? [0, 0]; sh.userData.el.quaternion.identity(); sh.rotation.set(-a[0] + swing, 0, sd * (.1 + a[1])); sh.userData.el.rotation.x = -(a[2] ?? (.15 + Math.abs(swing) * .3)); });
      const sit = p.sit ?? 0; legs.forEach((l, i) => { l.rotation.x = w === undefined ? -1.5 * sit : Math.sin(w + i * Math.PI) * .45; l.userData.knee.rotation.x = w === undefined ? 1.5 * sit * (1 - (p.legsOut ?? 0)) : Math.max(0, -Math.sin(w + i * Math.PI)) * .6; l.rotation.z = (i ? 1 : -1) * (p.spread ?? 0); });
      if (p.sit !== undefined) root.position.y = (p.sitY ?? 0) - .47 * sit;
    };
    // x-ray: skin and clothes go see-through so the organs in userData.inner show
    root.xray = k => { [...skinMats, ...clothMats, ...eyes.flatMap(e => e.children.map(c => c.material)), smile.material, open.material].forEach(m => { m.transparent = k > 0; m.opacity = 1 - k * .82; m.depthWrite = k < .5; });
      hairM.opacity = 1 - k * .9; cheeks.forEach(c => c.visible = k < .3); inner.visible = k > .01; inner.traverse(c => { if (c.material && c.userData.xr !== false) { c.material.transparent = true; c.material.opacity = clamp(k * 1.4); } }); };
    root.pose(); return root;
  }
  // a point on the face surface, in head-local coordinates (x, y across the face; off lifts it off the skin)
  const facePt = (x, y, off = 0) => { const k = Math.sqrt(Math.max(0, 1 - (x / .62) ** 2 - (y / .645) ** 2)); return V(x * (1 + off), y * (1 + off), .97 * .62 * k + off); };
  // a pimple on the skin: red bump with a white head
  function pimple(s = 1) { const g = G(M(SPH(.07, 24, 16), plastic(0xe0505a, { roughness: .4 }), { scale: [1, 1, .55] }), M(SPH(.032, 16, 12), plastic(0xfff3d6, { roughness: .3 }), { pos: [0, 0, .035] })); g.scale.setScalar(s); return g; }
  // a doctor: white coat, grey hair, stethoscope
  function makeDoctor(o = {}) { const d = makePerson({ skin: o.skin ?? SKINS[2], shirt: 0xf6f8fb, pants: 0x3a4a6a, hair: o.hair ?? 0x9a9aa6, ...o });
    d.add(M(new THREE.TorusGeometry(.32, .025, 8, 32, Math.PI), plastic(0x2a3150), { pos: [0, 1.95, .3], rot: [0, 0, Math.PI] }), M(SPH(.06, 16, 12), metal(0xc9cdd8), { pos: [0, 1.62, .4] })); return d; }
  function mirror(w = 1.6, h = 2.4) { return G(M(K.RB(w + .2, h + .2, .12, .1), plastic(0xd9b98a)), M(new THREE.PlaneGeometry(w, h), new THREE.MeshPhysicalMaterial({ color: 0xdcefff, metalness: .6, roughness: .08, clearcoat: 1 }), { pos: [0, 0, .065], shadow: false })); }
  // a big hand for close-ups: palm, four curlable fingers and a thumb, palm facing +z, fingers up (+y)
  function bigHand(o = {}) { const sm = skinM(o.skin ?? SKINS[0]), g = new THREE.Group(), palm = M(RB(1.0, 1.05, .36, .16), sm, { pos: [0, .52, 0] }); g.add(palm);
    const fingers = [[-.36, .7], [-.12, .8], [.12, .76], [.35, .62]].map(([x, L]) => { const f = new THREE.Group(); f.position.set(x, 1.02, 0);
      const a = new THREE.Group(); a.add(M(new THREE.CapsuleGeometry(.11, L * .45, 8, 16), sm, { pos: [0, L * .25, 0] })); f.add(a);
      const b = new THREE.Group(); b.position.y = L * .5; a.add(b); b.add(M(new THREE.CapsuleGeometry(.105, L * .4, 8, 16), sm, { pos: [0, L * .22, 0] }));
      b.add(M(RB(.15, .16, .04, .03), plastic(0xffe2e2, { roughness: .2 }), { pos: [0, L * .38, -.09] })); f.userData = { a, b }; g.add(f); return f; });
    const thumb = new THREE.Group(); thumb.position.set(-.5, .35, .05); thumb.rotation.z = .7; thumb.add(M(new THREE.CapsuleGeometry(.12, .45, 8, 16), sm, { pos: [0, .3, 0] })); g.add(thumb);
    g.userData = { fingers, thumb, palm, mat: sm };
    g.curl = (k, which) => fingers.forEach((f, i) => { if (which && !which.includes(i)) return; f.userData.a.rotation.x = k * 1.3; f.userData.b.rotation.x = k * 1.5; });
    if (o.side === 'left') g.scale.x = -1; return g; }
  // a gold trophy cup
  function trophy() { const gold = metal(0xffc44d); const pts = [[0, 0], [.45, 0], [.45, .08], [.12, .2], [.1, .6], [.2, .7], [.55, .9], [.62, 1.5], [.58, 1.52], [.5, 1.0], [0, .85]].map(([x, y]) => new THREE.Vector2(x, y));
    const g = G(M(new THREE.LatheGeometry(pts, 48), gold)); [-1, 1].forEach(d => g.add(M(new THREE.TorusGeometry(.22, .05, 10, 24, Math.PI * 1.2), gold, { pos: [d * .62, 1.2, 0], rot: [0, 0, d > 0 ? -Math.PI * .6 : Math.PI * 1.6] }))); return g; }
  // a labelled gauge bar: set(k) fills it 0..1 (green -> amber -> red, or a fixed colour)
  function gauge(name = 'PRESSURE', col) { const g = sign(2.4, .56, () => {}, { color: 0xffffff }); g.userData.w = 2.4; g.set = k => g.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, name, w * .25, h / 2 + 3, h * .34, '#1d2442', 900);
    x.fillStyle = '#e6e9f2'; x.beginPath(); x.roundRect(w * .47, h * .3, w * .48, h * .4, h * .2); x.fill(); x.fillStyle = col ?? (k > .7 ? '#ff4a5c' : k > .4 ? '#ffb020' : '#3cc85a'); x.beginPath(); x.roundRect(w * .47, h * .3, Math.max(h * .4, w * .48 * clamp(k)), h * .4, h * .2); x.fill(); }); g.set(0); return g; }
  // ---------- animals ----------
  // a stylised four-legged animal: kind 'cat' | 'dog' | 'bunny'. pose: s, puff (fur up), arch, mouth, tailUp, sit
  function animal(kind = 'cat', o = {}) { const col = o.color ?? (kind === 'dog' ? 0xd9a066 : kind === 'bunny' ? 0xf4f1ec : 0x6b6f80), fm = plastic(col, { roughness: .7, clearcoat: .1 }), root = new THREE.Group();
    const bodyG = new THREE.Group(); bodyG.position.y = .75; root.add(bodyG); const torso = M(new THREE.CapsuleGeometry(.38, .7, 10, 24), fm, { rot: [0, 0, Math.PI / 2], scale: [1, 1, 1] }); torso.rotation.set(0, Math.PI / 2, Math.PI / 2); bodyG.add(torso);
    const fur = M(new THREE.CapsuleGeometry(.4, .7, 10, 24), plastic(col, { roughness: .9, transparent: true, opacity: .5 }), {}); fur.rotation.copy(torso.rotation); bodyG.add(fur);
    const head = new THREE.Group(); head.position.set(0, .45, .62); bodyG.add(head); head.add(M(SPH(.36, 32, 24), fm));
    head.add(M(SPH(.17, 24, 16), plastic(kind === 'dog' ? 0xf0d2a8 : 0xffffff, { roughness: .6 }), { pos: [0, -.1, .27], scale: [1.1, .8, kind === 'dog' ? 1.3 : .9] }), M(SPH(.05, 12, 8), plastic(0x2a1a1a), { pos: [0, -.02, .42] }));
    [-1, 1].forEach(d => { head.add(M(SPH(.07, 16, 12), plastic(0x15151c, { roughness: .1 }), { pos: [d * .14, .08, .3] }), M(SPH(.02, 8, 6), glowM(0xffffff, 3), { pos: [d * .14 + .02, .11, .36], shadow: false }));
      if (kind === 'cat') head.add(M(new THREE.ConeGeometry(.12, .25, 4), fm, { pos: [d * .2, .33, 0], rot: [0, 0, -d * .25] }));
      if (kind === 'dog') head.add(M(SPH(.13, 16, 12), plastic(0x8a5a3c, { roughness: .7 }), { pos: [d * .32, .05, 0], scale: [.5, 1.3, .9], rot: [0, 0, d * .3] }));
      if (kind === 'bunny') head.add(M(new THREE.CapsuleGeometry(.07, .45, 8, 12), fm, { pos: [d * .12, .55, -.05], rot: [0, 0, -d * .12] })); });
    const mouth = M(SPH(.08, 16, 12), plastic(0x5a1418), { pos: [0, -.2, .33], scale: [1, .1, .5] }); head.add(mouth);
    const legsA = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => { const l = M(new THREE.CapsuleGeometry(.1, .45, 8, 12), fm, { pos: [x * .2, .35, z * .38] }); root.add(l); return l; });
    const tail = new THREE.Group(); tail.position.set(0, .8, -.62); root.add(tail); tail.add(kind === 'bunny' ? M(SPH(.12, 16, 12), plastic(0xffffff), {}) : M(new THREE.CapsuleGeometry(.07, .55, 8, 12), fm, { pos: [0, .3, 0] }));
    root.userData = { head, mouth, fur, tail, bodyG };
    root.pose = (p = {}) => { const s = p.s ?? 0, pf = p.puff ?? 0, ar = p.arch ?? 0; bodyG.position.y = .75 + ar * .25 + Math.sin(s * 2.5) * .015; bodyG.rotation.x = 0;
      torso.scale.set(1, 1 + ar * .15, 1); fur.scale.setScalar(1 + pf * .45); fur.material.opacity = .25 + pf * .55; head.rotation.set(p.headNod ?? 0, p.headTurn ?? 0, p.headTilt ?? 0);
      mouth.scale.set(1 + (p.mouth ?? 0) * .4, .1 + (p.mouth ?? 0) * 1.4, .5); tail.rotation.x = -(p.tailUp ?? .4) + Math.sin(s * 3) * .15 * (p.wag ?? 0); tail.scale.setScalar(1 + pf * .6); };
    root.pose(); if (o.scale) root.scale.setScalar(o.scale); return root; }
  // a bird: round body, beak, wings
  function bird(col = 0x4fb3ff) { const g = new THREE.Group(), m = plastic(col); g.add(M(SPH(.4, 32, 24), m, { scale: [1, .95, 1.15] }), M(SPH(.26, 24, 16), m, { pos: [0, .38, .25] }), M(new THREE.ConeGeometry(.08, .22, 16), plastic(0xffb020), { pos: [0, .36, .55], rot: [Math.PI / 2, 0, 0] }));
    [-1, 1].forEach(d => g.add(M(SPH(.05, 12, 8), plastic(0x15151c), { pos: [d * .12, .45, .45] })));
    const wings = [-1, 1].map(d => { const w = new THREE.Group(); w.position.set(d * .35, .05, 0); w.add(M(SPH(.25, 20, 12), m, { pos: [d * .12, 0, -.05], scale: [.4, .8, 1.2] })); g.add(w); return w; });
    g.flap = s => wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * Math.sin(s * 18) * .6); return g; }
  // an insect: kind 'bee' | 'wasp' | 'mosquito'. flap(s) beats the wings; userData.abdomen for swelling
  function insect(kind = 'bee') { const g = new THREE.Group(), yl = plastic(kind === 'mosquito' ? 0x5a5040 : 0xffc21a), dk = plastic(0x1d1a16), wingM = plastic(0xe8f6ff, { transparent: true, opacity: .45, roughness: .05, side: THREE.DoubleSide, depthWrite: false });
    const abd = new THREE.Group(); abd.position.set(0, 0, -.55); g.add(abd);
    if (kind === 'mosquito') abd.add(M(new THREE.CapsuleGeometry(.12, .7, 8, 16), yl, { rot: [Math.PI / 2, 0, 0] }));
    else { abd.add(M(SPH(.36, 32, 24), yl, { scale: [1, 1, kind === 'wasp' ? 1.5 : 1.3] })); for (let i = 0; i < 3; i++) abd.add(M(new THREE.TorusGeometry(.33 - i * .05, .05, 10, 32), dk, { pos: [0, 0, -.12 - i * .17] })); }
    g.add(M(SPH(kind === 'mosquito' ? .14 : .26, 24, 16), kind === 'mosquito' ? yl : dk, { pos: [0, .02, 0] }), M(SPH(kind === 'mosquito' ? .12 : .22, 24, 16), dk, { pos: [0, .05, .35] }));
    [-1, 1].forEach(d => g.add(M(SPH(.08, 16, 12), plastic(kind === 'mosquito' ? 0x8a1a1a : 0x2a2a3a, { roughness: .05 }), { pos: [d * .13, .12, .45] })));
    const sting = M(new THREE.ConeGeometry(.04, .25, 12), dk, { pos: [0, 0, kind === 'mosquito' ? -.95 : -1.08], rot: [-Math.PI / 2, 0, 0] }); if (kind !== 'mosquito') g.add(sting);
    if (kind === 'mosquito') g.add(M(new THREE.CylinderGeometry(.012, .012, .7, 8), dk, { pos: [0, -.18, .75], rot: [Math.PI / 2 + .5, 0, 0] }));
    const wings = [-1, 1].map(d => { const w = new THREE.Group(); w.position.set(d * .1, .2, .0); w.add(M(new THREE.CircleGeometry(.4, 24), wingM, { pos: [d * .35, 0, -.1], rot: [-Math.PI / 2, 0, 0], scale: [.55, 1.2, 1], shadow: false })); g.add(w); return w; });
    for (let i = 0; i < 3; i++) [-1, 1].forEach(d => g.add(M(new THREE.CylinderGeometry(.02, .02, kind === 'mosquito' ? .9 : .45, 6), dk, { pos: [d * (kind === 'mosquito' ? .35 : .22), -.2, .15 - i * .15], rot: [0, 0, d * (kind === 'mosquito' ? 1.0 : .5)] })));
    g.userData = { abdomen: abd, sting }; g.flap = s => wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * (Math.sin(s * 40) * .5 + .2)); return g; }

  // ---------- everyday props ----------
  function glass(fill = .7, col = 0xbfe9ff) { return G(M(new THREE.CylinderGeometry(.28, .24, .8, 32, 1, true), plastic(0xffffff, { transparent: true, opacity: .3, roughness: .02, side: THREE.DoubleSide, depthWrite: false }), { pos: [0, .4, 0], shadow: false }),
    M(new THREE.CylinderGeometry(.26, .23, .78 * fill, 32), plastic(col, { transparent: true, opacity: .7, roughness: .05 }), { pos: [0, .39 * fill + .01, 0] })); }
  function burger() { return G(M(SPH(.42, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), plastic(0xe0a050), { pos: [0, .38, 0], scale: [1, .7, 1] }), M(new THREE.CylinderGeometry(.44, .44, .06, 32), plastic(0x5cc46a), { pos: [0, .34, 0] }),
    M(new THREE.CylinderGeometry(.4, .4, .14, 32), plastic(0x6a3a22), { pos: [0, .25, 0] }), M(new THREE.CylinderGeometry(.43, .4, .04, 4), plastic(0xffc21a), { pos: [0, .33, 0] }), M(new THREE.CylinderGeometry(.42, .4, .14, 32), plastic(0xe0a050), { pos: [0, .1, 0] })); }
  function sodaCan(col = 0xe23d3d) { return G(M(new THREE.CylinderGeometry(.22, .22, .7, 32), metal(col, { roughness: .3 }), { pos: [0, .35, 0] }), M(new THREE.CylinderGeometry(.2, .22, .04, 32), metal(0xd7dbe6), { pos: [0, .72, 0] })); }
  function chair(col = 0x9b7bff) { return G(M(RB(1.0, .14, 1.0, .06), plastic(col), { pos: [0, .55, 0] }), M(RB(1.0, 1.0, .14, .06), plastic(col), { pos: [0, 1.1, -.45] }),
    ...[-1, 1].flatMap(a => [-1, 1].map(b => M(new THREE.CylinderGeometry(.05, .05, .55, 10), plastic(0x2a3150), { pos: [a * .42, .27, b * .42] })))); }
  function thermometer(k = .5, col = 0xff4a5c) { const g = new THREE.Group(); g.add(M(new THREE.CapsuleGeometry(.12, 1.4, 10, 20), plastic(0xffffff, { transparent: true, opacity: .55, roughness: .05 }), { pos: [0, .95, 0] }), M(SPH(.2, 24, 16), plastic(col), { pos: [0, .2, 0] }));
    const bar = M(new THREE.CylinderGeometry(.06, .06, 1, 16), plastic(col), { pos: [0, .3, 0] }); g.add(bar); g.set = k => { bar.scale.y = Math.max(.01, k * 1.4); bar.position.y = .3 + k * .7; }; g.set(k); return g; }
  function blanket(w = 2.2, d = 2.6, col = 0x6fa8ff) { return M(RB(w, .25, d, .12), cloth(col)); }
  function bandage() { return G(M(RB(.5, .26, .06, .03), plastic(0xf2c8a0)), M(RB(.2, .2, .07, .02), plastic(0xfff3e6))); }
  function sweat(n = 8, seed = 2) { const R = rng(seed), g = new THREE.Group(), P = []; for (let i = 0; i < n; i++) { const d = M(SPH(.05, 12, 8), plastic(0x9fdcff, { transparent: true, opacity: .85, roughness: .02 }), { scale: [1, 1.4, 1], shadow: false }); g.add(d); P.push([(R() - .5) * 1.0, R() * .4, R()]); }
    g.update = (s, k = 1) => g.children.forEach((d, i) => { const [x, y, ph] = P[i], u = frac(s * .6 + ph); d.position.set(x, .3 + y - u * .7, .55 - Math.abs(x) * .3); d.visible = k > 0; d.scale.set(k, k * 1.4, k); }); return g; }
  // stars that orbit a point (dizzy / seeing stars)
  function dizzy(n = 5, col = 0xffd23f) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const st_ = new THREE.Shape(); for (let j = 0; j < 10; j++) { const r = j % 2 ? .06 : .14, a = j / 10 * Math.PI * 2; j ? st_.lineTo(Math.sin(a) * r, Math.cos(a) * r) : st_.moveTo(Math.sin(a) * r, Math.cos(a) * r); }
      g.add(M(new THREE.ExtrudeGeometry(st_, { depth: .04, bevelEnabled: false }), glowM(col, 1.5), { shadow: false })); }
    g.update = (s, k = 1) => g.children.forEach((c, i) => { const a = s * 2.5 + i / n * Math.PI * 2; c.position.set(Math.cos(a) * .7, Math.sin(a * 2) * .05, Math.sin(a) * .7); c.rotation.y = s * 3; c.scale.setScalar(k); }); return g; }
  // sound waves: arcs that spread from a point (growls, hiccups, yawns)
  function soundWaves(col = 0xffffff, n = 3) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(M(new THREE.TorusGeometry(.4, .04, 8, 32, Math.PI * .7), new THREE.MeshBasicMaterial({ color: col, transparent: true, toneMapped: false }), { rot: [0, 0, -Math.PI * .35], shadow: false }));
    g.update = (s, k = 1) => g.children.forEach((c, i) => { const u = frac(s * 1.2 + i / n); c.scale.setScalar(.5 + u * 1.5); c.material.opacity = (1 - u) * k; }); return g; }
  // immune cell: a lumpy white blob with a face
  function whiteCell(s = 1) { const g = new THREE.Group(); g.add(lumpy(.5, .08, 6, plastic(0xf4f6ff, { roughness: .5 }), 7, 48)); [-1, 1].forEach(d => g.add(M(SPH(.08, 16, 12), plastic(0x15151c, { roughness: .1 }), { pos: [d * .15, .1, .46] })));
    g.add(M(new THREE.TorusGeometry(.1, .025, 8, 20, Math.PI), plastic(0x15151c), { pos: [0, -.06, .47], rot: [0, 0, Math.PI] })); g.scale.setScalar(s); return g; }

  // a pill bottle
  function pills() { return G(M(new THREE.CylinderGeometry(.22, .22, .5, 24), plastic(0xff8a3d, { transparent: true, opacity: .85 }), { pos: [0, .25, 0] }), M(new THREE.CylinderGeometry(.24, .24, .14, 24), plastic(0xffffff), { pos: [0, .56, 0] }), M(new THREE.CylinderGeometry(.225, .225, .22, 24, 1, true), matte(0xffffff), { pos: [0, .25, 0] })); }

  // hand targets (person-local) for the right hand; mirror x for the left. rest is where a hanging hand sits.
  const HAND = { rest: [.62, .98, .08], nose: [.04, 2.6, .78], mouth: [.02, 2.38, .78], chin: [.1, 2.15, .62], cheek: [.42, 2.5, .6], ear: [.68, 2.7, .1], forehead: [.15, 3.05, .65],
    elbow: [.5, 2.75, .05], belly: [.1, 1.45, .6], chest: [.15, 1.85, .55], point: [.75, 2.2, 1.0], up: [.75, 3.6, .2], wave: [.95, 3.1, .35], hip: [.7, 1.25, -.05], eye: [.22, 2.75, .74] };
  const ARM = { down: [0, 0] };
  // hand target that blends from rest (k=0) to a named or explicit target (k=1); side -1 mirrors for the left hand
  const reach = (to, k = 1, side = 1) => { const a = HAND.rest, b = typeof to === 'string' ? HAND[to] : to, e = ease(clamp(k)); return V(side * lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e)); };
  // labels pinned to the screen: they ride in front of the camera so a close-up never clips them.
  // ny/nx are screen positions (-1..1); wf is the width as a fraction of the screen.
  function hud(st, obj, ny, nx = 0, wf = .7, dist = 3) { const w = new THREE.Group(); w.add(obj); obj.traverse(o => o.castShadow = false); st.scene.add(w); (st.huds = st.huds || []).push([w, ny, nx, wf, dist, obj]); return obj; }
  const _v = new THREE.Vector3();
  function placeHuds(st) { const c = st.cam; if (!st.huds) return; c.updateMatrixWorld(); const hh = Math.tan(c.fov * Math.PI / 360);
    st.huds.forEach(([w, ny, nx, wf, dist, o]) => { const sw = o.userData.w ?? 1, halfH = hh * dist, halfW = halfH * c.aspect;
      w.position.copy(c.position).add(_v.set(nx * halfW, ny * halfH, -dist).applyQuaternion(c.quaternion)); w.quaternion.copy(c.quaternion); w.scale.setScalar(wf * 2 * halfW / sw); }); }
  const shoot = (st, pos, look) => { aim(st.cam, pos, look); st.cam.aspect = K.W / K.H; placeHuds(st); };

  // ---------- anatomy ----------
  const pink = c => plastic(c ?? 0xff8fa3, { roughness: .45, clearcoat: .6 });
  // bumpy displaced sphere (brain lobes, cells, blobs)
  function lumpy(r, amp, freq, mat, seed = 1, seg_ = 64) { const g = new THREE.SphereGeometry(r, seg_, seg_ * .75), p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); const n = Math.sin(v.x * freq + seed) * Math.sin(v.y * freq * 1.3 + seed * 2) * Math.sin(v.z * freq * .9 + seed * 3) + .5 * Math.sin(v.x * freq * 2.1 + v.z * freq * 1.7 + seed);
      v.multiplyScalar(r * (1 + amp * n)); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return M(g, mat); }
  function brain(s = 1, col = 0xffa0b4) { const m = pink(col), g = G(...[-1, 1].map(d => { const h = lumpy(.42, .07, 14, m, d * 3); h.position.x = d * .2; h.scale.set(.62, .8, 1); return h; }));
    g.add(M(SPH(.17, 24, 16), pink(0xf07f98), { pos: [0, -.3, -.22], scale: [1.4, .7, 1] })); g.scale.setScalar(s); return g; }
  function heart(s = 1) { const m = pink(0xe0384f), g = G(M(SPH(.3, 32, 24), m, { pos: [-.14, .1, 0] }), M(SPH(.3, 32, 24), m, { pos: [.14, .1, 0] }), M(new THREE.ConeGeometry(.4, .62, 32), m, { pos: [0, -.28, 0], rot: [Math.PI, 0, 0] }));
    g.add(M(new THREE.CylinderGeometry(.08, .1, .3, 16), pink(0xff5a6e), { pos: [.05, .45, 0] })); g.scale.setScalar(s); return g; }
  function lungs(s = 1) { const m = pink(0xff9fb0); const g = G(...[-1, 1].map(d => lumpy(.36, .04, 9, m, d * 2))); g.children.forEach((l, i) => { l.position.x = (i ? 1 : -1) * .3; l.scale.set(.75, 1.25, .7); });
    g.add(M(new THREE.CylinderGeometry(.06, .06, .5, 16), pink(0xf2c8d0), { pos: [0, .6, 0] })); g.scale.setScalar(s); return g; }
  function stomach(s = 1) { const pts = [V(.25, .45, 0), V(.3, .15, 0), V(.15, -.15, 0), V(-.15, -.2, 0), V(-.35, -.05, 0)], cur = new THREE.CatmullRomCurve3(pts);
    const g = G(M(new THREE.TubeGeometry(cur, 40, .2, 20), pink(0xf58fa0))); g.scale.setScalar(s); return g; }
  // a tube along points (vessels, nerves, airways); flow() returns dots that travel along it
  function tube(pts, r = .05, mat, segs = 64) { const cur = new THREE.CatmullRomCurve3(pts.map(p => Array.isArray(p) ? V(...p) : p)); const m = M(new THREE.TubeGeometry(cur, segs, r, 12), mat); m.userData.curve = cur; return m; }
  const vessel = (pts, r = .05, col = 0xd8283c) => tube(pts, r, plastic(col, { roughness: .35, clearcoat: .9 }));
  const nerve = (pts, r = .03, col = 0xffd23f) => tube(pts, r, glowM(col, 1.4));
  function flow(curve, n = 10, col = 0xff3b4e, size = .06, speed = .25, glow = false) { const im = new THREE.InstancedMesh(SPH(size, 12, 8), glow ? glowM(col, 2.4) : plastic(col), n), m = new THREE.Matrix4();
    im.castShadow = false; im.update = (s, k = 1, dir = 1) => { for (let i = 0; i < n; i++) { const u = frac(i / n + s * speed), p = curve.getPoint(dir > 0 ? u : 1 - u), sc = k * Math.min(1, Math.sin(Math.PI * u) * 4); m.makeScale(sc, sc, sc).setPosition(p); im.setMatrixAt(i, m); } im.instanceMatrix.needsUpdate = true; }; im.update(0); return im; }
  // a pulse of light that travels along a curve once (u = 0..1)
  function pulse(curve, col = 0xffffff, size = .5) { const g = sprite(col, size); g.at = u => { g.visible = u > 0 && u < 1; if (g.visible) g.position.copy(curve.getPoint(clamp(u))); }; return g; }
  // germs: rounded capsule bodies with cartoon faces (mean by default)
  function germ(col = 0x7ad94a, o = {}) { const g = new THREE.Group(), body = M(new THREE.CapsuleGeometry(.24, .32, 10, 24), plastic(col, { roughness: .4 }), { rot: [0, 0, Math.PI / 2] }); g.add(body);
    const r = rng(o.seed ?? 4); for (let i = 0; i < 10; i++) { const a = r() * 6.28, b = (r() - .5) * 2.2; const sp = M(new THREE.CylinderGeometry(.015, .015, .18, 6), plastic(col), { shadow: false }); sp.position.set(Math.cos(a) * .3 * (1 + Math.abs(b) * .3), Math.sin(a) * .26, b * .05); sp.lookAt(sp.position.clone().multiplyScalar(3)); sp.rotateX(Math.PI / 2); g.add(sp); }
    const face = ctex(256, 160, (x, w, h) => { x.fillStyle = '#fff'; [-1, 1].forEach(s => { x.beginPath(); x.ellipse(w / 2 + s * 46, h * .45, 26, 30, 0, 0, 7); x.fill(); }); x.fillStyle = '#141a2c'; [-1, 1].forEach(s => { x.beginPath(); x.arc(w / 2 + s * 46 + 4, h * .5, 13, 0, 7); x.fill(); });
      x.strokeStyle = '#141a2c'; x.lineWidth = 10; x.lineCap = 'round'; if (o.mood !== 'happy') [-1, 1].forEach(s => { x.beginPath(); x.moveTo(w / 2 + s * 74, h * .12); x.lineTo(w / 2 + s * 20, h * .26); x.stroke(); });
      x.beginPath(); if (o.mood === 'happy') x.arc(w / 2, h * .66, 22, .2, Math.PI - .2); else { x.moveTo(w / 2 - 26, h * .86); x.quadraticCurveTo(w / 2, h * .7, w / 2 + 26, h * .86); } x.stroke(); });
    g.add(M(new THREE.PlaneGeometry(.5, .31), new THREE.MeshBasicMaterial({ map: face.tex, transparent: true, toneMapped: false }), { pos: [0, .02, .245], shadow: false }));
    g.wiggle = s => { body.scale.set(1 + Math.sin(s * 6 + (o.seed ?? 0)) * .06, 1 - Math.sin(s * 6 + (o.seed ?? 0)) * .06, 1); g.rotation.z = Math.sin(s * 3 + (o.seed ?? 0)) * .15; }; return g; }
  function germs(n, col, spread = [2, 1.2, 1], seed = 9, center = [0, 2, 0]) { const r = rng(seed), g = new THREE.Group(), P = [];
    for (let i = 0; i < n; i++) { const k = germ(col, { seed: i + seed }); k.scale.setScalar(.6 + r() * .5); g.add(k); P.push([(r() - .5) * spread[0], (r() - .5) * spread[1], (r() - .5) * spread[2], r() * 6]); }
    g.update = (s, k = 1) => g.children.forEach((c, i) => { const [x, y, z, ph] = P[i]; c.position.set(center[0] + x + Math.sin(s * .8 + ph) * .12, center[1] + y + Math.sin(s * 1.1 + ph) * .1, center[2] + z); c.wiggle(s); c.visible = k > 0; c.scale.setScalar((.6 + (i % 3) * .2) * clamp(k * 3 - i * .1)); }); return g; }
  // red blood cell (flattened torus-ish disc)
  function rbc(col = 0xd8283c) { return M(new THREE.TorusGeometry(.12, .07, 12, 24), plastic(col, { roughness: .35 }), { scale: [1, 1, .8] }); }
  function floaters(n, col, box = [6, 6, 4], center = [0, 2.5, -1], seed = 2, mk) { const r = rng(seed), g = new THREE.Group(), P = [];
    for (let i = 0; i < n; i++) { const c = mk ? mk(i) : rbc(col); g.add(c); P.push([(r() - .5) * box[0], (r() - .5) * box[1], (r() - .5) * box[2], r() * 6, .5 + r()]); }
    g.update = s => g.children.forEach((c, i) => { const [x, y, z, ph, sp] = P[i]; c.position.set(center[0] + x + Math.sin(s * .3 * sp + ph) * .3, center[1] + y + Math.sin(s * .4 * sp + ph * 2) * .25, center[2] + z); c.rotation.set(s * .4 * sp + ph, s * .3 + ph, 0); }); return g; }
  // a big eyeball (close-ups), with optional red veins that grow with k
  function eyeball(r = 1, iris = 0x4a7bd0) { const g = new THREE.Group(); g.add(M(SPH(r, 64, 48), plastic(0xfffaf5, { roughness: .15, clearcoat: 1 })));
    g.add(M(SPH(r * .45, 48, 32), plastic(iris, { roughness: .2 }), { pos: [0, 0, r * .9], scale: [1, 1, .4] }), M(SPH(r * .2, 32, 20), plastic(0x07070b, { roughness: .05 }), { pos: [0, 0, r * 1.0], scale: [1, 1, .3] }), M(SPH(r * .07, 16, 10), glowM(0xffffff, 3), { pos: [r * .12, r * .14, r * 1.06], shadow: false }));
    const veins = [], rr = rng(5); for (let i = 0; i < 9; i++) { const a = rr() * 6.28, pts = []; for (let j = 0; j < 6; j++) { const th = .55 + j * .13, ph = a + Math.sin(j * 1.7 + i) * .25; pts.push(V(Math.sin(th) * Math.cos(ph) * r * 1.005, Math.sin(th) * Math.sin(ph) * r * 1.005, Math.cos(th) * r * 1.005)); }
      const v = tube(pts.reverse(), r * .012, plastic(0xd8283c, { roughness: .3 }), 24); v.geometry.setDrawRange(0, 0); g.add(v); veins.push(v); }
    g.veins = k => veins.forEach((v, i) => v.geometry.setDrawRange(0, Math.floor(clamp(k * 1.3 - i * .03) * v.geometry.index.count / 6) * 6)); return g; }
  // a spray of droplets from a point along a direction (sneezes, splashes); u = 0..1 progress
  function spray(n = 60, col = 0xbfe9ff, seed = 3) { const r = rng(seed), im = new THREE.InstancedMesh(SPH(.035, 8, 6), plastic(col, { transparent: true, opacity: .85, roughness: .05 }), n), m = new THREE.Matrix4(), P = [];
    for (let i = 0; i < n; i++) P.push([r() * .9 + .4, (r() - .5) * .9, (r() - .5) * .9, .5 + r()]); im.castShadow = false;
    im.fire = (origin, dir, u) => { const d = dir.clone().normalize(), up = V(0, 1, 0), side = d.clone().cross(up).normalize(), up2 = side.clone().cross(d);
      for (let i = 0; i < n; i++) { const [sp, a, b, sz] = P[i], dist = sp * 3.2 * Math.pow(u, .6); const p = origin.clone().addScaledVector(d, dist).addScaledVector(side, a * dist * .5).addScaledVector(up2, b * dist * .5 - u * u * .6); const sc = u > 0 && u < 1 ? sz * (1 - u * .5) : 0; m.makeScale(sc, sc, sc).setPosition(p); im.setMatrixAt(i, m); } im.instanceMatrix.needsUpdate = true; };
    im.fire(V(0, 0, 0), V(0, 0, 1), 0); return im; }
  // hospital bed
  function bed() { const g = new THREE.Group(); g.add(M(RB(2.2, .3, 4.0, .1), plastic(0xdfe6ee), { pos: [0, .9, 0] }), M(RB(2.0, .25, 3.8, .12), matte(0xffffff), { pos: [0, 1.15, 0] }), M(RB(1.2, .2, .7, .1), matte(0xf2f6ff), { pos: [0, 1.35, -1.4] }), M(RB(2.2, 1.3, .12, .06), plastic(0x9fc4dd), { pos: [0, 1.4, -2.0] }));
    [-1, 1].forEach(a => [-1, 1].forEach(b => g.add(M(new THREE.CylinderGeometry(.05, .05, .8, 10), plastic(0x9aa3bd), { pos: [a * .95, .4, b * 1.8] })))); return g; }
  function ivPole() { return G(M(new THREE.CylinderGeometry(.04, .04, 3.2, 12), plastic(0xc9cdd8), { pos: [0, 1.6, 0] }), M(RB(.4, .55, .12, .06), plastic(0xdff3ff, { transparent: true, opacity: .8 }), { pos: [.2, 2.9, 0] }), M(new THREE.CylinderGeometry(.4, .4, .06, 24), plastic(0x9aa3bd), { pos: [0, .03, 0] })); }
  function table(w = 4, d = 2, col = 0xd8a878) { return G(M(RB(w, .16, d, .05), plastic(col, { roughness: .5 }), { pos: [0, 1.2, 0] }), ...[-1, 1].flatMap(a => [-1, 1].map(b => M(RB(.14, 1.2, .14, .04), plastic(col), { pos: [a * (w / 2 - .2), .6, b * (d / 2 - .2)] })))); }
  // a magnifier ring + lens disc for close-up callouts
  function lensRing(r = 1, col = 0xffffff) { return G(M(new THREE.TorusGeometry(r, .06, 12, 64), plastic(col)), M(new THREE.CircleGeometry(r, 48), new THREE.MeshPhysicalMaterial({ color: 0xdff4ff, transparent: true, opacity: .15, roughness: 0, depthWrite: false }), { shadow: false })); }

  // camera that drifts gently around a look point
  const orbit = (st, s, look, dist, h = .25, sway = .5, spd = .4) => shoot(st, [look[0] + Math.sin(s * spd) * sway * dist * .12, look[1] + h, look[2] + dist], look);
  // camera dolly between two framings over the line
  const dolly = (st, t, a, b) => { const k = ease(t); shoot(st, a[0].map((v, i) => lerp(v, b[0][i], k)), a[1].map((v, i) => lerp(v, b[1][i], k))); };

  // generic outro used by every episode: the person waves next to a big FOLLOW sign
  BUILD.b_outro = (p) => {
    const st = set(p.stage ?? 'lilac'), who = makePerson(p.person ?? {}); st.scene.add(who);
    const bs = textSign(2.6, .8, 'FOLLOW  +', { color: 0xff4a5c, fg: '#ffffff', size: 108, depth: .35 }); bs.userData.w = 2.6; const btn = hud(st, bs, .62, 0, .62);
    const q = p.q ? hud(st, tag(p.q, 0xffffff, '#1d2442', 3.4, .5), .4, 0, .8) : null;
    return { ...st, update(t, s) { who.pose({ s, handR: reach('wave', seg(t, 0, .15)).add(V(Math.sin(s * 9) * .15, 0, 0)), smile: .9 }); btn.scale.setScalar(popIn(t, .15)); if (q) q.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.6, 0], 6.6); } };
  };

  return (body.done = { ST, set, popIn, tag, titleSigns, arrow, check, warnSign, counter, makePerson, ARM, SKINS, pink, lumpy, brain, heart, lungs, stomach, tube, vessel, nerve, flow, pulse, germ, germs, rbc, floaters, eyeball, spray, bed, ivPole, table, lensRing, orbit, dolly, skinM, cloth, HAND, reach, hud, placeHuds, shoot, facePt, pimple, makeDoctor, mirror, pills, bigHand, trophy, gauge, animal, bird, insect, glass, burger, sodaCan, chair, thermometer, blanket, bandage, sweat, dizzy, soundWaves, whiteCell });
}
