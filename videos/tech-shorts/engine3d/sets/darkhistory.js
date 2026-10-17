// Sets for Dark Chapters (videos/dark-chapters): moody toy-diorama history shorts, "dark" style.
// Episode 1 (p_*): Dick Proenneke's cabin. Episode 2 (w_*): 1 September 1939. Episode 3 (n_*): the Nuremberg trial.
// Also replaces the overlay: a red progress bar, series tag, chapter chip and captions over a vignette.
export function register(K) {
  const { THREE, BUILD, W, H, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    pedestal, sparkles, clamp, lerp, seg, ease, out, pop, frac, V, rng, SANS, MONO } = K;
  const RED = 0xd8342c, BONE = 0xf1e6d2, INK = '#16121a';
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.06, pop((t - at) * sp)) : 0;
  const PAL = {
    night: { top: '#070a14', bottom: '#1b2033', floor: 0x1a1e2c, hemi: .55, keyI: 2.0, rimI: 2.2, fogNear: 14, fogFar: 40 },
    sepia: { top: '#1d140e', bottom: '#4b3826', floor: 0x3b2c1f, hemi: .7, key: 0xffd9a8, keyI: 2.3, rim: 0xffc890, fogNear: 16, fogFar: 44 },
    ember: { top: '#120606', bottom: '#46180f', floor: 0x2c120c, hemi: .5, key: 0xffb27a, keyI: 2.2, rim: 0xff6a3d, rimI: 2.4, fogNear: 14, fogFar: 40 },
    dusk: { top: '#2b3a5c', bottom: '#d9a77c', floor: 0x56704a, hemi: .9, key: 0xffd7a8, keyI: 2.4, fogNear: 22, fogFar: 70 },
    snow: { top: '#1a2440', bottom: '#8fa3c4', floor: 0xdfe8f4, hemi: .8, key: 0xc8dcff, keyI: 1.8, rim: 0x9fc0ff, fogNear: 12, fogFar: 40 },
    court: { top: '#1a120c', bottom: '#3a2a1c', floor: 0x5a3f28, hemi: .75, key: 0xffe3bd, keyI: 2.2, fogNear: 20, fogFar: 60 },
  };
  const cam = (st, s, y = 2.5, z = 8.8, x = 0) => aim(st.cam, [x + Math.sin(s * .35) * .5, y + .3, z], [x, y, 0]);
  const dust = (st, col = 0xffe2b0, n = 18, c = [0, 2.6, 0], r = 2.6) => { const d = sparkles(n, c, r, col, 5); d.children.forEach(s => s.material.opacity = .4); st.scene.add(d); return d; };

  // ---------- people: clay figures with a walk cycle and posable arms ----------
  function person(o = {}) {
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const skin = o.skin ?? 0xeec3a0, pants = o.pants ?? 0x3b3129;
    const legs = [-1, 1].map(s => { const hip = new THREE.Group(); hip.position.set(s * .15, .8, 0);
      hip.add(M(new THREE.CapsuleGeometry(.11, .48, 6, 12), matte(pants), { pos: [0, -.36, 0] }), M(RB(.22, .12, .34, .05), matte(0x231d19), { pos: [0, -.74, .06] })); root.add(hip); return hip; });
    body.add(M(RB(.6, .8, .38, .16), matte(o.coat ?? 0x4a5a78), { pos: [0, .4, 0] }));
    if (o.belt) body.add(M(RB(.62, .08, .4, .03), matte(0x2a2018), { pos: [0, .12, 0] }));
    const head = new THREE.Group(); head.position.y = 1.08; body.add(head);
    const skinM = plastic(skin, { clearcoat: .15, roughness: .55 });
    head.add(M(SPH(.25, 32, 24), skinM), M(SPH(.05, 12, 8), skinM, { pos: [0, -.03, .25] }));
    [-1, 1].forEach(s => head.add(M(SPH(.032, 10, 8), plastic(0x161616), { pos: [s * .09, .04, .225], shadow: false })));
    if (o.hair !== false) head.add(M(SPH(.26, 24, 16), matte(o.hair ?? 0x5a4632), { pos: [0, .07, -.04], scale: [1, .75, .95] }));
    if (o.hat === 'cap') head.add(M(new THREE.CylinderGeometry(.25, .27, .14, 24), matte(o.hatCol ?? 0x2f3b52), { pos: [0, .2, 0] }), M(RB(.3, .03, .2, .01), matte(o.hatCol ?? 0x2f3b52), { pos: [0, .14, .24] }));
    if (o.hat === 'peak') head.add(M(new THREE.CylinderGeometry(.3, .26, .1, 24), matte(o.hatCol ?? 0x4b4f45), { pos: [0, .24, 0] }), M(new THREE.CylinderGeometry(.26, .26, .1, 24), matte(o.hatCol ?? 0x4b4f45), { pos: [0, .17, 0] }), M(RB(.34, .025, .16, .01), matte(0x1d1d1d), { pos: [0, .13, .26] }));
    if (o.hat === 'helmet') head.add(M(new THREE.SphereGeometry(.3, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), plastic(o.hatCol ?? 0xf2f2f2), { pos: [0, .08, 0] }), M(new THREE.TorusGeometry(.3, .025, 8, 32), plastic(o.hatCol ?? 0xf2f2f2), { pos: [0, .08, 0], rot: [Math.PI / 2, 0, 0] }));
    if (o.phones) head.add(M(new THREE.TorusGeometry(.27, .025, 8, 32, Math.PI), plastic(0x1d1d1d), { pos: [0, .02, 0] }), ...[-1, 1].map(s => M(new THREE.CylinderGeometry(.07, .07, .06, 16), plastic(0x1d1d1d), { pos: [s * .26, 0, 0], rot: [0, 0, Math.PI / 2] })));
    if (o.tie) body.add(M(RB(.08, .4, .02, .02), matte(o.tie), { pos: [0, .55, .2] }), M(RB(.24, .2, .02, .02), matte(0xf3efe6), { pos: [0, .72, .19] }));
    const arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * .38, .7, 0);
      const hand = new THREE.Group(); hand.position.y = -.62; hand.add(M(SPH(.09, 16, 12), skinM));
      sh.add(M(new THREE.CapsuleGeometry(.09, .44, 6, 12), matte(o.coat ?? 0x4a5a78), { pos: [0, -.3, 0] }), hand); sh.hand = hand; body.add(sh); return sh; });
    root.handR = arms[1].hand; root.handL = arms[0].hand; root.head = head;
    root.pose = (p = {}) => {
      const s = p.s ?? 0, w = p.walk ?? 0, ph = Math.sin(s * 7) * w, sit = p.sit ?? 0;
      legs.forEach((l, i) => { l.rotation.x = (i ? -ph : ph) * .6 - sit * 1.45; l.position.y = .8 - sit * .3; });
      body.position.y = Math.abs(Math.cos(s * 7)) * .04 * w + Math.sin(s * 2) * .008 - sit * .3; body.rotation.x = p.lean ?? 0;
      arms[0].rotation.set(-ph * .5 - (p.armL ?? 0), 0, -.1 - (p.outL ?? 0)); arms[1].rotation.set(ph * .5 - (p.armR ?? 0), 0, .1 + (p.outR ?? 0));
      head.rotation.set(p.nod ?? 0, p.look ?? 0, 0);
    };
    root.pose(); if (o.scale) root.scale.setScalar(o.scale); return root;
  }
  const proenneke = () => person({ coat: 0x5b6f8c, pants: 0x4a3a2a, hat: 'cap', hatCol: 0x7a2e24, hair: 0x9a8a78 });

  // ---------- nature ----------
  function pine(x, z, s = 1, col = 0x23452f) { const g = G(M(new THREE.CylinderGeometry(.06 * s, .09 * s, .5 * s, 8), matte(0x4a3424), { pos: [0, .25 * s, 0] }));
    [0, 1, 2].forEach(i => g.add(M(new THREE.ConeGeometry((.55 - i * .14) * s, .7 * s, 10), matte(col), { pos: [0, (.65 + i * .38) * s, 0] }))); g.position.set(x, 0, z); return g; }
  function mountain(x, z, h, r, snow = true, col = 0x4d566b) { const g = G(M(new THREE.ConeGeometry(r, h, 7), matte(col, { flatShading: true }), { pos: [0, h / 2, 0] }));
    if (snow) g.add(M(new THREE.ConeGeometry(r * .34, h * .34, 7), matte(0xf4f6fb, { flatShading: true }), { pos: [0, h * .83 + .01, 0] })); g.position.set(x, 0, z); return g; }
  function water(col = 0x2c5a7a, r = 60, y = .02) { const m = M(new THREE.CircleGeometry(r, 64), new THREE.MeshPhysicalMaterial({ color: col, roughness: .12, metalness: .1, clearcoat: 1, envMapIntensity: 1 }), { rot: [-Math.PI / 2, 0, 0], shadow: false }); m.position.y = y; return m; }
  function wilds(st, o = {}) {
    const lake = water(o.water ?? 0x35698c, 22); lake.position.z = -19; lake.scale.set(1.4, .55, 1); st.scene.add(lake);
    [[-7, -22, 9, 5], [2, -26, 12, 6.5], [10, -20, 8, 5], [-14, -18, 7, 4.5], [16, -24, 10, 6]].forEach(([x, z, h, r]) => st.scene.add(mountain(x, z, h, r, true, o.rock ?? 0x55607a)));
    const r = rng(o.seed ?? 11); for (let i = 0; i < (o.trees ?? 14); i++) { const x = (r() - .5) * 12, z = 1 - r() * 5; if (Math.abs(x) < 2.2 && z > -2.5) continue; st.scene.add(pine(x, z, .8 + r() * .6)); }
    return lake;
  }
  // a log with pale cut ends
  const LOGM = () => matte(0x8a6440), ENDM = () => matte(0xd9b98a);
  function log(len = 2.4, r = .1) { const g = G(M(new THREE.CylinderGeometry(r, r, len, 14), LOGM(), { rot: [0, 0, Math.PI / 2] }));
    [-1, 1].forEach(s => g.add(M(new THREE.CircleGeometry(r * .96, 14), ENDM(), { pos: [s * (len / 2 + .002), 0, 0], rot: [0, s * Math.PI / 2, 0], shadow: false }))); return g; }
  // cabin: k = 0..1 walls rise row by row; roof and door from k > .98
  function cabin(k = 1, o = {}) {
    const g = new THREE.Group(), rows = 9, L = 2.4, D = 1.9, r = .1, walls = [];
    for (let i = 0; i < rows; i++) { const y = .1 + i * .19;
      const a = log(L + .3, r), b = log(L + .3, r), c = log(D + .3, r), d = log(D + .3, r); a.position.set(0, y, D / 2); b.position.set(0, y, -D / 2); c.position.set(L / 2, y + .095, 0); d.position.set(-L / 2, y + .095, 0); c.rotation.y = d.rotation.y = Math.PI / 2;
      [a, b, c, d].forEach(m => g.add(m)); walls.push([a, b, c, d]); }
    const roof = new THREE.Group(); [-1, 1].forEach(s => { const p = M(RB(L + .6, .1, 1.35, .03), matte(o.roof ?? 0x5d6b3a), { pos: [0, 0, s * .55], rot: [s * .62, 0, 0] }); roof.add(p); }); roof.position.y = 2.0; g.add(roof);
    const door = M(RB(.55, 1.0, .06, .03), matte(0x5c3f26), { pos: [-.4, .55, D / 2 + .1] }), win = M(RB(.5, .4, .05, .03), plastic(0xffd27a, { emissive: 0xffb04a, emissiveIntensity: o.lit ?? 0 }), { pos: [.55, .95, D / 2 + .1] }); g.add(door, win);
    const chimney = M(RB(.32, 1.0, .32, .05), matte(0x8c8a84), { pos: [L / 2 - .1, 2.1, -.3] }); g.add(chimney);
    g.set = k => { walls.forEach((w, i) => { const v = clamp(k * rows - i); w.forEach(m => { m.visible = v > 0; m.scale.setScalar(v > 0 ? .6 + .4 * out(v) : 1); }); }); const done = k > .98; roof.visible = door.visible = win.visible = chimney.visible = done; };
    g.win = win; g.set(k); return g;
  }
  function axe() { return G(M(new THREE.CylinderGeometry(.03, .035, .8, 8), matte(0x9a6b3c), { pos: [0, -.3, 0] }), M(RB(.08, .2, .26, .02), metal(0xb8bcc4), { pos: [0, -.68, .1] })); }

  // ---------- war and court props ----------
  function ship(col = 0x5a606b) { const g = new THREE.Group();
    g.add(M(RB(4.2, .5, .8, .2), plastic(col, { roughness: .6, clearcoat: .2 }), { pos: [0, .25, 0] }), M(RB(1.3, .55, .55, .08), plastic(0x6b717c, { roughness: .6 }), { pos: [-.2, .75, 0] }), M(RB(.4, .7, .4, .06), plastic(0x6b717c, { roughness: .6 }), { pos: [-.1, 1.3, 0] }), M(new THREE.CylinderGeometry(.13, .15, .7, 12), matte(0x3a3d44), { pos: [.45, 1.1, 0] }));
    const turrets = [1.3, -1.4].map(x => { const t = G(M(new THREE.CylinderGeometry(.28, .3, .22, 16), plastic(0x6b717c, { roughness: .6 })), M(new THREE.CylinderGeometry(.04, .04, .9, 8), matte(0x2c2f35), { pos: [0, .02, .45], rot: [Math.PI / 2, 0, 0] })); t.position.set(x, .62, 0); g.add(t); return t; });
    g.turrets = turrets; return g; }
  function plane(col = 0x5c6450) { const g = G(M(new THREE.CapsuleGeometry(.14, .9, 6, 12), plastic(col, { roughness: .5 }), { rot: [0, 0, Math.PI / 2] }), M(RB(.3, .03, 1.7, .02), plastic(col, { roughness: .5 }), { pos: [.1, 0, 0] }), M(RB(.2, .03, .6, .01), plastic(col), { pos: [-.55, .02, 0] }), M(RB(.18, .25, .03, .01), plastic(col), { pos: [-.55, .14, 0] }));
    const prop = M(RB(.03, .5, .06, .01), matte(0x222222), { pos: [.62, 0, 0] }); g.add(prop); g.prop = prop; return g; }
  function flash(col = 0xffb04a, size = 1.6) { const s = sprite(col, size, 0); return s; }
  function flagTex(kind) { return ctex(300, 200, (x, w, h) => {
    if (kind === 'fr') ['#1f3d8a', '#f4f1ea', '#c8282e'].forEach((c, i) => { x.fillStyle = c; x.fillRect(i * w / 3, 0, w / 3 + 1, h); });
    if (kind === 'us') { for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#f4f1ea' : '#b8262d'; x.fillRect(0, i * h / 13, w, h / 13 + 1); } x.fillStyle = '#2a3770'; x.fillRect(0, 0, w * .42, h * 7 / 13); x.fillStyle = '#f4f1ea'; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { x.beginPath(); x.arc(12 + c * 20, 11 + r * 20, 3.5, 0, 7); x.fill(); } }
    if (kind === 'uk') { x.fillStyle = '#25387a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f4f1ea'; x.lineWidth = 36; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke(); x.strokeStyle = '#c8282e'; x.lineWidth = 12; x.stroke();
      x.fillStyle = '#f4f1ea'; x.fillRect(w / 2 - 30, 0, 60, h); x.fillRect(0, h / 2 - 30, w, 60); x.fillStyle = '#c8282e'; x.fillRect(w / 2 - 18, 0, 36, h); x.fillRect(0, h / 2 - 18, w, 36); }
    if (kind === 'su') { x.fillStyle = '#c3221f'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2c12e'; x.lineWidth = 3; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 4 : 9; x.lineTo(45 + Math.cos(a) * rr, 26 + Math.sin(a) * rr); } x.closePath(); x.stroke();
      x.lineWidth = 7; x.beginPath(); x.arc(45, 66, 20, -.3 * Math.PI, .9 * Math.PI); x.stroke(); x.beginPath(); x.moveTo(30, 50); x.lineTo(62, 86); x.stroke(); x.fillStyle = '#f2c12e'; x.fillRect(22, 40, 18, 10); }
    if (kind === 'pl') { x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, w, h / 2); x.fillStyle = '#d3233a'; x.fillRect(0, h / 2, w, h / 2); }
  }); }
  function flag(kind, w = .9) { const t = flagTex(kind), g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(.025, .025, 2.0, 8), metal(0xc9a24a), { pos: [0, 1.0, 0] }));
    const geo = new THREE.PlaneGeometry(w, w * .66, 12, 4), f = M(geo, new THREE.MeshStandardMaterial({ map: t.tex, side: THREE.DoubleSide, roughness: .8 }), { pos: [w / 2 + .03, 1.6, 0] }); g.add(f);
    const base = geo.attributes.position.array.slice(); g.wave = s => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const X = base[i * 3] + w / 2; p.setZ(i, Math.sin(X * 5 - s * 4) * .06 * X); } p.needsUpdate = true; geo.computeVertexNormals(); }; return g; }
  // a parchment card: big text over a small line
  function card(w, h, big, small, o = {}) { return sign(w, h, (x, cw, ch) => { rrect(x, 0, 0, cw, ch, ch * .12); x.fillStyle = o.bg ?? '#efe2c8'; x.fill(); x.strokeStyle = o.edge ?? '#8a6b44'; x.lineWidth = 8; rrect(x, 14, 14, cw - 28, ch - 28, ch * .1); x.stroke();
    label(x, big, cw / 2, ch * (small ? .42 : .52), o.size ?? ch * .38, o.fg ?? '#2a1d12', 900, 'center', o.font ?? SANS); if (small) label(x, small, cw / 2, ch * .76, ch * .15, o.sub ?? '#8a3b2a', 800, 'center', MONO); }, { color: o.slab ?? 0xd9c7a2, depth: o.depth ?? .14 }); }
  function counter(w, h, o = {}) { const g = sign(w, h, () => {}, { color: o.slab ?? 0x1b1716, depth: .18 }); g.set = (txt, sub) => g.userData.redraw((x, cw, ch) => { x.fillStyle = '#1b1716'; x.fillRect(0, 0, cw, ch); label(x, txt, cw / 2, ch * (sub ? .4 : .52), ch * (sub ? .42 : .55), o.fg ?? '#f1e6d2', 900, 'center', o.font ?? SANS); if (sub) label(x, sub, cw / 2, ch * .78, ch * .17, o.sub ?? '#e0574d', 800, 'center', MONO); }); return g; }
  function candle() { const g = G(M(new THREE.CylinderGeometry(.16, .17, .9, 20), plastic(0xf2ead8, { roughness: .5 }), { pos: [0, .45, 0] }), M(new THREE.CylinderGeometry(.01, .01, .1, 6), matte(0x222222), { pos: [0, .95, 0] }));
    const fl = M(SPH(.05, 12, 10), glowM(0xffb347, 5), { pos: [0, 1.05, 0], scale: [1, 2.1, 1], shadow: false }), halo = sprite(0xff9a3a, 1.4, .55); halo.position.set(0, 1.05, 0); const light = new THREE.PointLight(0xffa04a, 6, 7, 1.6); light.position.set(0, 1.15, .1); g.add(fl, halo, light);
    g.flick = s => { const k = 1 + Math.sin(s * 17) * .06 + Math.sin(s * 29) * .04; fl.scale.set(k, 2.1 * k, k); light.intensity = 6 * k; halo.material.opacity = .5 * k; }; return g; }

  // ---------- shared sets ----------
  function titleSet(p, pal, accent, prop) {
    const st = stage(PAL[pal]); st.scene.add(pedestal(1.25, 0x2a2420, accent));
    const yr = card(1.5, .5, p.year, null, { size: 74, bg: '#1d1714', fg: '#f1e6d2', edge: '#a8402f', slab: 0x1d1714, depth: .1 }); yr.position.set(0, .35, 1.32); yr.rotation.x = -.15; st.scene.add(yr);
    const s1 = textSign(3.5, .82, p.top, { color: 0xf1e6d2, fg: INK, size: 96 }), s2 = textSign(3.3, .74, p.bottom, { color: RED, fg: '#fff3e6', size: 96 }); s1.position.set(0, 4.75, 0); s2.position.set(0, 3.88, .2); st.scene.add(s1, s2);
    const pr = prop ? prop(st) : null, d = dust(st, accent === RED ? 0xffc9a0 : 0xffe2b0);
    return { ...st, update(t, s) { s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .3)); s1.rotation.z = Math.sin(s * 2.4) * .02; yr.scale.setScalar(pop(s - .5)); d.update(s); pr && pr(t, s);
      aim(st.cam, [Math.sin(s * .5) * .9, 2.9, lerp(9.8, 9.0, t)], [0, 2.55, 0]); } };
  }
  BUILD.d_outro = (p) => {
    const st = stage(PAL.night), c = candle(); c.position.set(0, .4, 0); c.scale.setScalar(1.5); st.scene.add(pedestal(1.2, 0x2a2420, RED), c);
    const btn = textSign(2.8, .85, 'FOLLOW  +', { color: RED, fg: '#fff3e6', size: 108, depth: .4 }); btn.position.set(0, 4.35, .3); st.scene.add(btn);
    const tag = textSign(2.6, .5, `DARK CHAPTERS ${p.tag ?? ''}`, { color: 0xf1e6d2, fg: INK, size: 64 }); tag.position.set(0, 3.45, .3); st.scene.add(tag); const d = dust(st);
    return { ...st, update(t, s) { c.flick(s); btn.scale.setScalar(popIn(t, .3) * (1 + Math.sin(s * 5) * .025 * seg(t, .5, .6))); tag.scale.setScalar(popIn(t, .45)); d.update(s); aim(st.cam, [Math.sin(s * .3) * .7, 2.7, 9.2], [0, 2.5, 0]); } };
  };

  // ================= Episode 1: the cabin at Twin Lakes =================
  BUILD.p_hook = () => {
    const st = stage(PAL.dusk); wilds(st, { seed: 3 }); const pl = plane(0xd7c25a); pl.scale.setScalar(1.3); st.scene.add(pl);
    const man = proenneke(); man.position.set(.3, 0, 1.2); st.scene.add(man); const box = G(M(RB(.5, .3, .35, .04), matte(0x7a5a38)), M(RB(.06, .5, .06, .02), matte(0x9a6b3c), { pos: [.15, .3, 0], rot: [0, 0, -.6] })); box.position.set(-.5, .15, 1.4); st.scene.add(box);
    return { ...st, update(t, s) { const k = seg(t, 0, .45); pl.position.set(lerp(-6, 4, k), lerp(5.5, 4.2, k), -2); pl.rotation.set(0, 0, Math.sin(s * 2) * .05); pl.prop.rotation.x = s * 40; pl.visible = k < 1;
      man.visible = box.visible = t > .4; man.scale.setScalar(popIn(t, .4)); box.scale.setScalar(popIn(t, .48)); man.pose({ s, look: Math.sin(s) * .5, nod: -.15 }); cam(st, s, 2.4, 9.5); } };
  };
  BUILD.p_title = (p) => titleSet(p, 'dusk', 0xffb04a, st => { const c = cabin(1); c.scale.setScalar(.55); c.position.set(0, .4, 0); st.scene.add(c); return (t, s) => { c.rotation.y = s * .4; }; });
  BUILD.p_lake = () => {
    const st = stage(PAL.dusk), lake = wilds(st, { seed: 8, trees: 18 }); const pin = G(M(SPH(.16, 16, 12), glowM(0xff5a4a, 3)), M(new THREE.ConeGeometry(.12, .3, 12), glowM(0xff5a4a, 3), { pos: [0, -.2, 0], rot: [Math.PI, 0, 0] })); st.scene.add(pin);
    const tag = textSign(2.2, .44, 'TWIN LAKES, ALASKA', { color: 0xf1e6d2, fg: INK, size: 52 }); tag.position.set(0, 4.1, 0); st.scene.add(tag);
    const nr = textSign(1.4, .36, 'NO ROADS', { color: RED, fg: '#fff3e6', size: 52 }); nr.position.set(0, 3.5, .2); st.scene.add(nr);
    return { ...st, update(t, s) { pin.position.set(-.4, .7 + Math.abs(Math.sin(s * 3)) * .2, -2.6); pin.scale.setScalar(popIn(t, .2)); tag.scale.setScalar(popIn(t, .1)); nr.scale.setScalar(popIn(t, .55));
      aim(st.cam, [Math.sin(s * .3) * 1.2, lerp(6, 3.2, ease(seg(t, 0, .6))), 9], [0, 1.9, -3]); } };
  };
  BUILD.p_logs = () => {
    const st = stage(PAL.dusk); wilds(st, { seed: 5 }); const stack = new THREE.Group(); for (let r = 0; r < 4; r++) for (let i = 0; i < 4 - r; i++) { const l = log(2.4, .12); l.position.set(0, .12 + r * .21, (i - (3 - r) / 2) * .25); l.rotation.y = Math.PI / 2; stack.add(l); }
    stack.position.set(.6, 0, .6); st.scene.add(stack); const man = proenneke(); man.position.set(-1.0, 0, 1.0); man.rotation.y = .5; st.scene.add(man);
    const sun = sprite(0xffd38a, 3, .8); st.scene.add(sun); const lb = card(2.0, .62, 'LEFT TO DRY', '1967', { size: 52 }); lb.position.set(0, 3.7, 0); st.scene.add(lb);
    return { ...st, update(t, s) { stack.children.forEach((l, i) => l.scale.setScalar(popIn(t, i * .05))); man.pose({ s, armR: .3, look: .4 }); const a = lerp(-.6, 2.6, t); sun.position.set(Math.cos(a) * 5, 1.5 + Math.sin(a) * 3.5, -8);
      lb.scale.setScalar(popIn(t, .45)); cam(st, s, 2.2); } };
  };
  BUILD.p_axe = () => {
    const st = stage(PAL.dusk); wilds(st, { seed: 9, trees: 10 }); const c = cabin(.5); c.position.set(.4, 0, -.6); st.scene.add(c);
    const man = proenneke(); man.position.set(-1.0, 0, 1.0); man.rotation.y = .9; st.scene.add(man); const ax = axe(); man.handR.add(ax);
    const work = log(2.0, .11); work.position.set(-.2, .3, 1.2); work.rotation.y = .9; st.scene.add(work, M(RB(.3, .3, .3, .04), LOGM(), { pos: [-.7, .15, 1.6] }), M(RB(.3, .3, .3, .04), LOGM(), { pos: [.3, .15, .8] }));
    const chips = []; const r = rng(4); for (let i = 0; i < 8; i++) { const ch = M(RB(.07, .02, .05, .01), ENDM(), {}); st.scene.add(ch); chips.push([ch, r() - .5, r(), r() - .5]); }
    return { ...st, update(t, s) { const sw = frac(s * 1.3), up = sw < .7 ? ease(sw / .7) : 1 - ease((sw - .7) / .3); man.pose({ s, armR: lerp(.4, 2.7, up), armL: lerp(.3, 2.2, up), lean: .15 - up * .1 }); c.set(lerp(.4, .7, t));
      const hit = sw > .97 || sw < .25, k = sw < .25 ? sw / .25 : 0; chips.forEach(([ch, vx, vy, vz]) => { ch.visible = hit && k > 0; ch.position.set(-.35 + vx * k * 1.5, .4 + vy * 1.4 * k - 2 * k * k, 1.1 + vz * k); ch.rotation.set(k * 9 * vx, k * 7, 0); });
      cam(st, s, 1.8, 7.0, -.3); } };
  };
  BUILD.p_camera = () => {
    const st = stage(PAL.dusk); wilds(st, { seed: 2, trees: 8 }); const c = cabin(.75); c.position.set(.8, 0, -.8); st.scene.add(c);
    const tri = new THREE.Group(); [0, 1, 2].forEach(i => { const a = i * 2.1; tri.add(M(new THREE.CylinderGeometry(.02, .02, 1.5, 6), matte(0x2b2b2b), { pos: [Math.cos(a) * .25, .7, Math.sin(a) * .25], rot: [Math.sin(a) * .2, 0, -Math.cos(a) * .2] })); });
    const camBody = G(M(RB(.42, .3, .22, .04), plastic(0x1f1f22)), M(new THREE.CylinderGeometry(.08, .1, .22, 16), plastic(0x2c2c30), { pos: [0, 0, .2], rot: [Math.PI / 2, 0, 0] }), M(new THREE.CylinderGeometry(.13, .13, .05, 20), plastic(0x2c2c30), { pos: [-.08, .24, 0], rot: [Math.PI / 2, 0, 0] }), M(new THREE.CylinderGeometry(.13, .13, .05, 20), plastic(0x2c2c30), { pos: [.12, .24, 0], rot: [Math.PI / 2, 0, 0] }));
    camBody.position.y = 1.5; tri.add(camBody); tri.position.set(-1.2, 0, 1.6); tri.rotation.y = .7; st.scene.add(tri);
    const rec = M(SPH(.04, 10, 8), glowM(0xff2a2a, 5), { pos: [.18, .1, .12], shadow: false }); camBody.add(rec); const man = proenneke(); man.position.set(.4, 0, .6); man.rotation.y = -.5; st.scene.add(man);
    const lb = card(1.6, .56, '16 MM', 'SELF-FILMED', { size: 66 }); lb.position.set(-.3, 3.6, .2); st.scene.add(lb);
    return { ...st, update(t, s) { rec.visible = frac(s * 1.2) < .6; camBody.children[2].rotation.y = camBody.children[3].rotation.y = s * 4; man.pose({ s, walk: t > .5 ? 1 : 0, armR: t < .5 ? 1.2 + Math.sin(s * 3) * .2 : 0 }); man.position.x = t > .5 ? .4 + (t - .5) * 1.2 : .4;
      lb.scale.setScalar(popIn(t, .3)); cam(st, s, 2.0, 7.6, -.3); } };
  };
  BUILD.p_cabin = () => {
    const st = stage(PAL.dusk); wilds(st, { seed: 7 }); const c = cabin(.6); c.position.set(0, 0, 0); st.scene.add(c); const smoke = []; for (let i = 0; i < 6; i++) { const p = sprite(0xd8d4cc, .5, .35); p.material.blending = THREE.NormalBlending; st.scene.add(p); smoke.push(p); }
    const tick = ['ROOF', 'DOOR', 'WINDOWS', 'FIREPLACE'].map((w, i) => { const g = textSign(1.5, .34, '✓ ' + w, { color: 0xf1e6d2, fg: INK, size: 46 }); g.position.set(i % 2 ? .9 : -.9, 4.5 - Math.floor(i / 2) * .5, .4); st.scene.add(g); return g; });
    return { ...st, update(t, s) { c.set(lerp(.6, 1, ease(seg(t, 0, .35)))); c.rotation.y = -.35 + Math.sin(s * .4) * .1; smoke.forEach((p, i) => { const u = frac(s * .25 + i / 6); p.visible = t > .35; p.position.set(1.1 + u * .6, 3.1 + u * 2, -.3); p.scale.setScalar(.3 + u * .9); p.material.opacity = .35 * (1 - u); });
      tick.forEach((g, i) => g.scale.setScalar(popIn(t, .38 + i * .1))); cam(st, s, 2.3, 9.0); } };
  };
  BUILD.p_winter = () => {
    const st = stage(PAL.snow); [[-6, -18, 8, 5], [3, -22, 11, 6.5], [11, -17, 7, 4.5]].forEach(([x, z, h, r]) => st.scene.add(mountain(x, z, h, r, true, 0x7f8aa3)));
    const lake = water(0xc8d6e8, 40); lake.material.roughness = .4; lake.position.z = -8; st.scene.add(lake); for (let i = 0; i < 10; i++) st.scene.add(pine(-4 + i * .9 + (i > 4 ? 1.5 : 0), -1.5 - (i % 3), 1, 0x2b4a3c));
    const c = cabin(1, { roof: 0xf2f6fb, lit: 2.5 }); st.scene.add(c); const glow = new THREE.PointLight(0xffb04a, 4, 5); glow.position.set(.55, 1, 1.6); st.scene.add(glow);
    const snow = new THREE.InstancedMesh(new THREE.SphereGeometry(.03, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), 260), r = rng(2), P = []; for (let i = 0; i < 260; i++) P.push([(r() - .5) * 10, r() * 7, (r() - .5) * 6 + 1, r()]); st.scene.add(snow);
    const tmp = card(1.7, .6, '−40°', 'WINTER NIGHTS', { size: 70, bg: '#e7eef8', edge: '#6a7fa6', slab: 0xcfd9ea }); tmp.position.set(0, 3.8, .3); st.scene.add(tmp); const m = new THREE.Matrix4();
    return { ...st, update(t, s) { P.forEach(([x, y, z, ph], i) => { m.setPosition(x + Math.sin(s + ph * 6) * .2, 7 - frac((y + s * (.5 + ph * .4)) / 7) * 7, z); snow.setMatrixAt(i, m); }); snow.instanceMatrix.needsUpdate = true;
      tmp.scale.setScalar(popIn(t, .3)); cam(st, s, 2.2, 9.2); } };
  };
  BUILD.p_journal = () => {
    const st = stage(PAL.sepia), table = G(M(RB(2.2, .12, 1.2, .04), matte(0x7a5634), { pos: [0, 1.0, 0] }), ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => M(RB(.1, 1.0, .1, .02), matte(0x6a4a2c), { pos: [a * .95, .5, b * .5] }))); st.scene.add(table);
    const book = new THREE.Group(), pg = ctex(512, 340); book.add(M(RB(1.1, .05, .72, .02), matte(0x5a2a20)), M(new THREE.PlaneGeometry(1.04, .68), new THREE.MeshStandardMaterial({ map: pg.tex, roughness: .9 }), { pos: [0, .03, 0], rot: [-Math.PI / 2, 0, 0], shadow: false })); book.position.set(-.1, 1.08, .1); st.scene.add(book);
    const c = candle(); c.position.set(.75, 1.06, -.2); c.scale.setScalar(.6); st.scene.add(c); const man = proenneke(); man.position.set(-.1, 0, -.95); man.pose({ sit: 1 }); st.scene.add(man, M(RB(.6, .5, .6, .05), matte(0x6a4a2c), { pos: [-.1, .25, -1.1] }));
    const icons = ['FISH', 'GARDEN', 'WILDLIFE', 'JOURNAL'].map((e, i) => { const g = textSign(1.5, .4, e, { color: i === 3 ? RED : 0xf1e6d2, fg: i === 3 ? '#fff3e6' : INK, size: 54 }); g.position.set(i % 2 ? .82 : -.82, 3.55 - Math.floor(i / 2) * .52, 0); st.scene.add(g); return g; });
    return { ...st, update(t, s) { c.flick(s); const n = Math.floor(t * 40); pg.redraw((x, w, h) => { x.fillStyle = '#efe2c8'; x.fillRect(0, 0, w, h); x.fillStyle = '#b8a07a'; x.fillRect(w / 2 - 2, 0, 4, h); x.strokeStyle = '#3a2a1c'; x.lineWidth = 3;
        for (let i = 0; i < n; i++) { const col = i % 20 < 10 ? 0 : 1, row = i % 10, X = 24 + col * (w / 2), Y = 40 + row * 30; x.beginPath(); x.moveTo(X, Y); for (let k = 0; k < 18; k++) x.lineTo(X + k * 11, Y + Math.sin(k * 2.3 + i) * 4); x.stroke(); } });
      man.pose({ s, sit: 1, armR: 1.2 + Math.sin(s * 9) * .08, armL: 1.0, nod: .35 }); icons.forEach((g, i) => { g.scale.setScalar(popIn(t, .15 + i * .15)); g.rotation.y = Math.sin(s * 1.5 + i) * .15; }); cam(st, s, 2.0, 7.4); } };
  };
  BUILD.p_plane = () => {
    const st = stage(PAL.dusk); const lake = wilds(st, { seed: 13 }); const c = cabin(1); c.scale.setScalar(.7); c.position.set(-1.1, 0, .2); st.scene.add(c);
    const pl = plane(0xd7c25a); pl.scale.setScalar(1.2); [-1, 1].forEach(s => pl.add(M(new THREE.CapsuleGeometry(.07, .7, 4, 8), plastic(0xeeeeee), { pos: [.05, -.32, s * .3], rot: [0, 0, Math.PI / 2] }))); st.scene.add(pl);
    const bag = G(M(RB(.4, .3, .3, .08), matte(0x8a7a5a)), textSign(.4, .2, '✉', { color: 0xf1e6d2, size: 90, depth: .04 })); bag.children[1].position.set(0, 0, .17); st.scene.add(bag);
    const yrs = counter(1.9, .7); yrs.position.set(0, 3.7, .3); st.scene.add(yrs);
    return { ...st, update(t, s) { const k = ease(seg(t, 0, .4)); pl.position.set(lerp(5, 1.2, k), lerp(3, .45, k), lerp(-4, -1, k)); pl.rotation.y = Math.PI; pl.prop.rotation.x = s * 40; bag.visible = t > .4; bag.position.set(.6, .15 + Math.abs(Math.sin(s * 4)) * .05 * (t < .5), .2);
      const y = Math.round(lerp(1968, 1998, ease(seg(t, .35, .95)))); yrs.set(String(y), 'YEARS ALONE: ' + (y - 1968)); yrs.scale.setScalar(popIn(t, .3)); cam(st, s, 2.0, 9.0); } };
  };
  BUILD.p_book = () => {
    const st = stage(PAL.sepia), bk = G(M(RB(1.3, 1.8, .22, .05), matte(0x2f4a3a)), M(RB(1.22, 1.72, .2, .04), matte(0xefe2c8), { pos: [.05, 0, 0] }));
    const cover = card(1.1, 1.5, 'ONE MAN\'S', 'WILDERNESS', { size: 64, bg: '#2f4a3a', fg: '#f1e6d2', sub: '#f2c46a', edge: '#c9a24a', slab: 0x2f4a3a, depth: .04 }); cover.position.z = .12; bk.add(cover); bk.position.set(-.85, 2.6, 0); st.scene.add(bk);
    const tv = G(M(RB(1.7, 1.25, .5, .12), plastic(0x5a3f2a, { roughness: .5 })), M(new THREE.PlaneGeometry(1.25, .92), new THREE.MeshBasicMaterial({ color: 0x9fb8c8, toneMapped: false }), { pos: [-.1, 0, .26], shadow: false })); tv.position.set(1.0, 2.2, 0); st.scene.add(tv);
    const mini = cabin(1); mini.scale.setScalar(.22); mini.position.set(.9, 1.85, .4); st.scene.add(mini); const d = dust(st);
    return { ...st, update(t, s) { bk.scale.setScalar(popIn(t, .05)); bk.rotation.y = .35 + Math.sin(s) * .08; tv.scale.setScalar(popIn(t, .45)); mini.visible = t > .5; mini.rotation.y = s; tv.rotation.y = -.3; d.update(s); cam(st, s, 2.5); } };
  };
  BUILD.p_today = () => {
    const st = stage(PAL.dusk); wilds(st, { seed: 21, trees: 20 }); const c = cabin(1); c.rotation.y = -.3; st.scene.add(c);
    const plaque = card(2.6, .9, 'NATIONAL PARK', 'PROTECTED · STILL STANDING', { size: 74 }); plaque.position.set(0, 3.7, .3); st.scene.add(plaque);
    return { ...st, update(t, s) { plaque.scale.setScalar(popIn(t, .35)); aim(st.cam, [Math.sin(s * .25) * 3, 2.6, lerp(7.5, 10, t)], [0, 1.6, 0]); } };
  };

  // ================= Episode 2: 1 September 1939 =================
  function sea(st) { const w = water(0x1f3346, 50); st.scene.add(w); return w; }
  BUILD.w_hook = () => {
    const st = stage({ ...PAL.night, floor: null }); sea(st); const sh = ship(); sh.position.set(-.8, -.1, -1); sh.rotation.y = .35; st.scene.add(sh);
    const fort = G(M(RB(1.6, .5, 1.2, .1), matte(0x8a8270), { pos: [0, .25, 0] }), M(RB(.7, .45, .6, .06), matte(0x9a917c), { pos: [.2, .7, 0] }), M(RB(2.4, .12, 2, .1), matte(0x5a6a3a), { pos: [0, .02, 0] })); fort.position.set(1.4, 0, -4.2); st.scene.add(fort);
    const fl = flash(0xffc070, 2.4), boom = flash(0xff7a3a, 2.6); st.scene.add(fl, boom); const clock = counter(1.6, .62, { fg: '#ffd9a0' }); clock.position.set(0, 3.7, .3); st.scene.add(clock);
    return { ...st, update(t, s) { sh.position.y = -.1 + Math.sin(s * 1.2) * .04; sh.rotation.z = Math.sin(s) * .02; const shot = frac(s / 2.4), k = Math.exp(-shot * 12); fl.position.set(.5, 1.0, -.2); fl.material.opacity = t > .3 ? k : 0;
      boom.position.set(1.4, .9, -4.2); boom.material.opacity = t > .3 ? Math.exp(-Math.max(0, shot - .25) * 8) * (shot > .25 ? 1 : 0) : 0; const mm = Math.min(48, 40 + Math.floor(t * 9)); clock.set(`04:${mm}`, '1 SEPT 1939'); clock.scale.setScalar(popIn(t, .05));
      aim(st.cam, [Math.sin(s * .3) * .8, 2.6, 9.5], [0, 1.4, -1.5]); } };
  };
  BUILD.w_title = (p) => titleSet(p, 'ember', RED, st => { const sh = ship(); sh.scale.setScalar(.45); sh.position.set(0, .5, 0); st.scene.add(sh); return (t, s) => { sh.rotation.y = s * .4; }; });
  function mapBoard() { const t = ctex(900, 1100), g = G(M(RB(3.6, .14, 4.4, .06), matte(0x3a2c20)), M(new THREE.PlaneGeometry(3.4, 4.2), new THREE.MeshStandardMaterial({ map: t.tex, roughness: .9 }), { pos: [0, .075, 0], rot: [-Math.PI / 2, 0, 0], shadow: false }));
    const arrow = (x, X0, Y0, X1, Y1, k, col) => { if (k <= 0) return; const X = lerp(X0, X1, k), Y = lerp(Y0, Y1, k), a = Math.atan2(Y - Y0, X - X0); x.strokeStyle = col; x.fillStyle = col; x.lineWidth = 26; x.lineCap = 'round'; x.beginPath(); x.moveTo(X0, Y0); x.lineTo(X, Y); x.stroke();
      x.beginPath(); x.moveTo(X + Math.cos(a) * 40, Y + Math.sin(a) * 40); x.lineTo(X + Math.cos(a + 2.4) * 46, Y + Math.sin(a + 2.4) * 46); x.lineTo(X + Math.cos(a - 2.4) * 46, Y + Math.sin(a - 2.4) * 46); x.fill(); };
    g.set = (kw = 0, ke = 0) => t.redraw((x, w, h) => { x.fillStyle = '#d9c9a3'; x.fillRect(0, 0, w, h); x.fillStyle = '#7f9bb0'; x.fillRect(0, 0, w, 150); // the Baltic
      x.fillStyle = '#c4b088'; x.fillRect(0, 150, 230, h); x.fillRect(670, 150, 230, h); x.fillRect(230, 150, 270, 150); x.fillRect(230, 850, 440, 250); // Germany, USSR, East Prussia, the south
      x.fillStyle = '#efe2c8'; x.beginPath(); x.moveTo(230, 300); x.lineTo(500, 300); x.lineTo(520, 150); x.lineTo(670, 200); x.lineTo(670, 850); x.lineTo(230, 850); x.closePath(); x.fill(); x.strokeStyle = '#6a5236'; x.lineWidth = 6; x.stroke();
      label(x, 'POLAND', 450, 560, 78, '#8a2a20', 900); label(x, 'GERMANY', 115, 600, 40, '#5a4630', 900); label(x, 'USSR', 785, 600, 48, '#5a4630', 900); label(x, 'E. PRUSSIA', 365, 225, 34, '#5a4630', 900); label(x, 'BALTIC SEA', 450, 70, 40, '#2c4a60', 800);
      x.fillStyle = '#8a2a20'; x.beginPath(); x.arc(430, 190, 12, 0, 7); x.fill(); label(x, 'WESTERPLATTE', 430, 160, 24, '#8a2a20', 800);
      arrow(x, 80, 520, 380, 520, kw, '#2c2c2c'); arrow(x, 330, 230, 400, 470, kw, '#2c2c2c'); arrow(x, 380, 1000, 430, 720, kw, '#2c2c2c'); arrow(x, 860, 560, 560, 600, ke, '#b8262d'); });
    g.set(0, 0); return g; }
  function tank(col = 0x4a4f42) { return G(M(RB(.5, .16, .32, .05), plastic(col, { roughness: .7 }), { pos: [0, .1, 0] }), M(RB(.24, .12, .2, .05), plastic(col, { roughness: .7 }), { pos: [-.04, .24, 0] }), M(new THREE.CylinderGeometry(.025, .025, .3, 8), matte(0x2a2a2a), { pos: [.2, .25, 0], rot: [0, 0, Math.PI / 2] })); }
  BUILD.w_map = () => {
    const st = stage(PAL.sepia), mb = mapBoard(); mb.position.set(0, .9, 0); st.scene.add(mb); const tanks = [[-1.55, .2, -.35, .2], [-.55, -1.1, -.25, -.45], [-.35, 1.85, -.15, .85]].map(([x0, z0, x1, z1]) => { const tk = tank(); tk.position.y = .97; st.scene.add(tk); return [tk, x0, z0, x1, z1]; });
    const lamp = sprite(0xffd9a0, 6, .25); lamp.position.set(0, 5, 0); st.scene.add(lamp);
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .8)); mb.set(k, 0); tanks.forEach(([tk, x0, z0, x1, z1]) => { tk.position.x = lerp(x0, x1, k); tk.position.z = lerp(z0, z1, k); tk.rotation.y = -Math.atan2(z1 - z0, x1 - x0); });
      aim(st.cam, [Math.sin(s * .3) * .5, 6.2, 4.6], [0, .9, .1]); } };
  };
  BUILD.w_planes = () => {
    const st = stage(PAL.ember); const town = new THREE.Group(), r = rng(6); for (let i = 0; i < 14; i++) { const h = .4 + r() * .7, b = G(M(RB(.5, h, .5, .04), matte(0x6a5a4a), { pos: [0, h / 2, 0] }), M(new THREE.ConeGeometry(.4, .3, 4), matte(0x6a2a20), { pos: [0, h + .15, 0], rot: [0, Math.PI / 4, 0] })); b.position.set((i % 5 - 2) * .75 + r() * .2, 0, -Math.floor(i / 5) * .9 + r() * .2); town.add(b); } st.scene.add(town);
    const pls = [0, 1, 2].map(i => { const p = plane(0x4f5547); p.scale.setScalar(.8); st.scene.add(p); return p; }); const fls = [0, 1, 2, 3].map(() => { const f = flash(0xff8a3a, 2.2); st.scene.add(f); return f; });
    return { ...st, update(t, s) { pls.forEach((p, i) => { const u = frac(s * .18 + i * .33); p.position.set(lerp(-5, 5, u), 4.2 + i * .4, -1 + i * .6); p.prop.rotation.x = s * 40; });
      fls.forEach((f, i) => { const u = frac(s * .5 + i * .27); f.position.set(-1.5 + i * 1.0, .5, -i % 2 * .9); f.material.opacity = t > .2 ? Math.exp(-u * 6) : 0; f.scale.setScalar(1.5 + u * 2); }); cam(st, s, 2.2, 9.0); } };
  };
  BUILD.w_fort = () => {
    const st = stage({ ...PAL.night, floor: null }); sea(st); const land = M(new THREE.CylinderGeometry(2.6, 2.8, .3, 32), matte(0x4a5a34), { pos: [0, .15, 0], scale: [1, 1, .6] }); st.scene.add(land);
    const bunker = G(M(RB(1.4, .55, 1.0, .1), matte(0x8a8270), { pos: [0, .55, 0] }), M(RB(.2, .08, .5, .02), matte(0x222222), { pos: [0, .6, .51] })); st.scene.add(bunker);
    const men = [-1.3, -.7, .7, 1.3].map((x, i) => { const p = person({ coat: 0x5d6448, pants: 0x4d543c, hat: 'helmet', hatCol: 0x56603f, scale: .55 }); p.position.set(x, .3, .9 - Math.abs(x) * .2); p.rotation.y = -x * .2; st.scene.add(p); return p; });
    const plq = flag('pl', .7); plq.position.set(.5, .8, -.2); st.scene.add(plq); const days = counter(1.7, .7, { fg: '#f1e6d2' }); days.position.set(0, 3.5, .3); st.scene.add(days);
    const fls = [0, 1].map(() => { const f = flash(0xffa040, 2.0); st.scene.add(f); return f; });
    return { ...st, update(t, s) { men.forEach((m, i) => m.pose({ s: s + i, armR: .9, armL: .7, look: Math.sin(s + i) * .3 })); plq.wave(s); const d = Math.min(7, 1 + Math.floor(t * 7.5)); days.set(`DAY ${d}`, `OF 7 · ~200 MEN`); days.scale.setScalar(popIn(t, .05));
      fls.forEach((f, i) => { const u = frac(s * .6 + i * .5); f.position.set(-1.6 + i * 3, .8, -1.2); f.material.opacity = Math.exp(-u * 7) * .9; }); cam(st, s, 2.0, 8.6); } };
  };
  BUILD.w_declare = () => {
    const st = stage(PAL.sepia), fl = [flag('uk'), flag('fr')]; fl[0].position.set(-1.2, 0, 0); fl[1].position.set(.5, 0, 0); st.scene.add(...fl);
    const cal = card(1.8, 1.4, '3', 'SEPTEMBER 1939', { size: 150 }); cal.position.set(0, 3.9, .2); st.scene.add(cal);
    const radio = G(M(RB(1.1, .75, .45, .12), plastic(0x6a4a2c, { roughness: .4 })), M(new THREE.CircleGeometry(.24, 24), matte(0x2a1f17), { pos: [-.22, 0, .23], shadow: false }), M(RB(.3, .06, .04, .02), plastic(0xd9c9a3), { pos: [.27, .1, .23] }));
    radio.position.set(0, .4, 1.6); st.scene.add(radio); const waves = [0, 1, 2].map(i => { const w = M(new THREE.TorusGeometry(.3, .02, 6, 32, Math.PI / 2), glowM(0xffd9a0, 2), { shadow: false }); w.rotation.z = Math.PI / 4; w.position.set(0, .9, 1.6); st.scene.add(w); return w; });
    return { ...st, update(t, s) { fl.forEach(f => f.wave(s)); cal.scale.setScalar(popIn(t, .1)); cal.rotation.z = Math.sin(s * 1.5) * .02; waves.forEach((w, i) => { const u = frac(s * .8 + i / 3); w.scale.setScalar(.6 + u * 1.6); w.position.y = .7 + u * .3; w.material.emissiveIntensity = 2 * (1 - u); });
      cam(st, s, 2.3, 9.0); } };
  };
  BUILD.w_east = () => {
    const st = stage(PAL.sepia), mb = mapBoard(); mb.position.set(0, .9, 0); st.scene.add(mb); const tk = tank(0x6a3a2a); tk.position.y = .97; st.scene.add(tk);
    const d = card(1.8, .6, '17 SEPT', null, { size: 80 }); d.position.set(0, 2.2, 1.9); d.rotation.x = -.6; st.scene.add(d);
    return { ...st, update(t, s) { const k = ease(seg(t, .15, .8)); mb.set(1, k); tk.position.set(lerp(1.6, .5, k), .97, lerp(.05, .1, k)); tk.rotation.y = Math.PI; d.scale.setScalar(popIn(t, .1)); aim(st.cam, [Math.sin(s * .3) * .5, 6.2, 4.6], [0, .9, .1]); } };
  };
  function globeG(R = 1.5) { const g = new THREE.Group(), r = rng(8); g.add(M(SPH(R, 64, 48), plastic(0x2a4a64, { roughness: .4 }))); const pts = [];
    for (let i = 0; i < 16; i++) { const th = r() * 6.28, ph = .6 + r() * 1.8, n = V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)), c = M(SPH(R * (.16 + r() * .2), 20, 14), matte(0xb8a27a), { scale: [1, 1, .22] }); c.position.copy(n.clone().multiplyScalar(R * .97)); c.lookAt(n.clone().multiplyScalar(R * 2)); g.add(c);
      const f = sprite(0xff5a3a, .5, 0); f.position.copy(n.clone().multiplyScalar(R * 1.04)); g.add(f); pts.push(f); } g.pts = pts; return g; }
  BUILD.w_globe = () => {
    const st = stage(PAL.night), gl = globeG(); gl.position.set(0, 2.6, 0); st.scene.add(gl); const names = ['EUROPE', 'AFRICA', 'ASIA', 'PACIFIC'].map((n, i) => { const g = textSign(1.3, .34, n, { color: 0xf1e6d2, fg: INK, size: 48 }); g.position.set(i % 2 ? 1.1 : -1.1, 4.4 - Math.floor(i / 2) * .5, .4); st.scene.add(g); return g; });
    return { ...st, update(t, s) { gl.rotation.y = s * .35; gl.pts.forEach((p, i) => { p.material.opacity = t > i / 18 ? .55 + Math.sin(s * 5 + i) * .35 : 0; }); names.forEach((g, i) => g.scale.setScalar(popIn(t, .1 + i * .18))); cam(st, s, 2.8, 8.8); } };
  };
  BUILD.w_toll = () => {
    const st = stage(PAL.night), ct = counter(3.4, 1.3, { fg: '#f1e6d2' }); ct.position.set(0, 3.9, 0); st.scene.add(ct); const rowN = 9, im = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.06, .14, 4, 8), matte(0xb8aa94), 9 * 22); st.scene.add(im);
    const m = new THREE.Matrix4(); const end = card(1.6, .5, '1939–1945', null, { size: 60 }); end.position.set(0, 2.7, .4); st.scene.add(end);
    return { ...st, update(t, s) { const k = ease(seg(t, .05, .8)); const v = Math.round(lerp(0, 70, k)); ct.set(k >= 1 ? '70–85M' : `${v}M`, 'ESTIMATED DEATHS'); end.scale.setScalar(popIn(t, .6));
      let n = 0; for (let r = 0; r < rowN; r++) for (let c = 0; c < 22; c++) { const show = (r * 22 + c) / (rowN * 22) < k; m.makeScale(show ? 1 : 0, show ? 1 : 0, show ? 1 : 0); m.setPosition(-2.1 + c * .2, .14, 1.2 - r * .32); im.setMatrixAt(n++, m); } im.instanceMatrix.needsUpdate = true;
      aim(st.cam, [Math.sin(s * .3) * .4, 3.4, 8.6], [0, 2.4, 0]); } };
  };
  BUILD.w_candle = () => {
    const st = stage({ ...PAL.night, hemi: .25, keyI: .6 }), c = candle(); c.scale.setScalar(2); st.scene.add(c); const sh = ship(0x3a3d44); sh.scale.setScalar(.3); sh.position.set(-1.2, 0, 1.2); sh.rotation.y = .4; st.scene.add(sh);
    const d = dust(st, 0xffc890, 14, [0, 2.4, 0], 2); return { ...st, update(t, s) { c.flick(s); d.update(s); aim(st.cam, [Math.sin(s * .2) * .6, 2.6, lerp(8, 6.5, t)], [0, 1.8, 0]); } };
  };

  // ================= Episode 3: the Nuremberg trial =================
  function courtroom(st, o = {}) {
    st.scene.add(M(RB(9, 6, .3, .05), matte(0x4a3220), { pos: [0, 3, -3.5] })); for (let i = 0; i < 7; i++) st.scene.add(M(RB(1.0, 4.2, .1, .04), matte(0x5a3e28), { pos: [-3.6 + i * 1.2, 2.6, -3.3] }));
    const bench = M(RB(4.4, 1.0, .9, .08), matte(0x6a4a2e), { pos: [0, .5, -2.4] }); st.scene.add(bench);
    const kinds = ['us', 'uk', 'su', 'fr'], flags = kinds.map((k, i) => { const f = flag(k, .7); f.position.set(-1.65 + i * 1.1, 1.2, -3.0); f.scale.setScalar(.8); st.scene.add(f); return f; });
    const judges = kinds.map((k, i) => { const j = person({ coat: 0x1d1d22, tie: 0x1d1d22, hair: 0x6a6a6a, scale: .62 }); j.pose({ sit: 1 }); j.position.set(-1.65 + i * 1.1, 1.0, -2.85); st.scene.add(j); return j; });
    const dock = []; if (o.view === 'dock') { [bench, ...flags, ...judges].forEach(m => m.visible = false);
      for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const p = person({ coat: [0x55584f, 0x3e4148, 0x5a5348][(i + r) % 3], tie: 0x2a2a2a, hair: [0x4a4038, 0x7a7a7a, 0x2a2622][i % 3], phones: o.phones, scale: .55 }); p.pose({ sit: 1 }); p.position.set(-1.85 + i * .68 + r * .2, .3 + r * .35, .4 - r * .8); st.scene.add(p); dock.push(p); }
      st.scene.add(M(RB(4.4, .55, .2, .05), matte(0x6a4a2e), { pos: [0, .28, 1.0] }), M(RB(4.4, .5, .6, .05), matte(0x5a3e28), { pos: [0, .25, -.4] }));
      [-2.4, 2.4].forEach(x => { const g = person({ coat: 0x5b6048, hat: 'helmet', belt: true, scale: .62 }); g.position.set(x, 0, -1.3); st.scene.add(g); dock.push(g); });
    } else if (o.dock !== false) { st.scene.add(M(RB(4.0, .6, .5, .06), matte(0x6a4a2e), { pos: [-.3, .3, 1.2] }), M(RB(4.0, .9, .5, .06), matte(0x6a4a2e), { pos: [-.3, .45, 2.0] }));
      for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const p = person({ coat: [0x55584f, 0x3e4148, 0x5a5348][(i + r) % 3], tie: 0x2a2a2a, hair: [0x4a4038, 0x7a7a7a, 0x2a2622][i % 3], phones: o.phones, scale: .55 }); p.pose({ sit: 1 }); p.position.set(-2.0 + i * .68, .3 + r * .3, .9 + r * .8); p.rotation.y = Math.PI; st.scene.add(p); dock.push(p); }
      [-2.5, 1.9].forEach(x => { const g = person({ coat: 0x5b6048, hat: 'helmet', belt: true, scale: .62 }); g.position.set(x, 0, 2.8); g.rotation.y = Math.PI; st.scene.add(g); dock.push(g); }); }
    const lamp = new THREE.PointLight(0xffe2b8, 5, 9, 1.4); lamp.position.set(0, 4, 0); st.scene.add(lamp); return { flags, judges, dock, bench };
  }
  const courtCam = (st, s, t) => aim(st.cam, [Math.sin(s * .25) * 1.2, 2.6, 4.4], [0, 1.3, -1.5]);
  BUILD.n_hook = () => {
    const st = stage(PAL.court), c = courtroom(st), spot = new THREE.SpotLight(0xfff0d0, 30, 12, .4, .5); spot.position.set(0, 6, 4); spot.target.position.set(-.3, .5, 1.4); st.scene.add(spot, spot.target);
    const world = textSign(2.4, .42, 'THE WORLD WATCHES', { color: 0xf1e6d2, fg: INK, size: 52 }); world.position.set(0, 4.7, -.5); st.scene.add(world);
    return { ...st, update(t, s) { c.flags.forEach(f => f.wave(s * .4)); c.judges.forEach((j, i) => j.pose({ s: s + i, sit: 1, look: Math.sin(s * .5 + i) * .2 })); world.scale.setScalar(popIn(t, .45));
      aim(st.cam, [Math.sin(s * .2) * .8, lerp(3.4, 2.6, t), lerp(8.5, 6.8, t)], [0, 1.4, -.5]); } };
  };
  BUILD.n_title = (p) => titleSet(p, 'court', RED, st => { const sc = new THREE.Group(); sc.add(M(new THREE.CylinderGeometry(.04, .04, 1.2, 8), metal(0xc9a24a), { pos: [0, .6, 0] }), M(RB(1.3, .05, .05, .02), metal(0xc9a24a), { pos: [0, 1.2, 0] }));
    const pans = [-1, 1].map(s => { const p = M(new THREE.CylinderGeometry(.22, .16, .06, 20), metal(0xc9a24a), {}); sc.add(p); return [p, s]; }); sc.position.set(0, .4, 0); st.scene.add(sc);
    return (t, s) => { const tilt = Math.sin(s * 1.2) * .08; pans.forEach(([p, k]) => p.position.set(k * .6, .85 + k * tilt, 0)); sc.rotation.y = s * .3; }; });
  BUILD.n_flags = () => {
    const st = stage(PAL.court), kinds = ['us', 'uk', 'fr', 'su'], fl = kinds.map((k, i) => { const f = flag(k, .95); f.position.set(-1.7 + i * 1.05, 0, -i % 2 * .4); st.scene.add(f); return f; });
    const lb = card(3.0, .9, 'INTERNATIONAL', 'MILITARY TRIBUNAL · NOV 1945', { size: 76 }); lb.position.set(0, 3.9, .4); st.scene.add(lb);
    return { ...st, update(t, s) { fl.forEach((f, i) => { f.wave(s + i); f.scale.setScalar(popIn(t, i * .12)); }); lb.scale.setScalar(popIn(t, .5)); cam(st, s, 2.2, 8.4); } };
  };
  BUILD.n_hall = () => {
    const st = stage(PAL.sepia), b = new THREE.Group(); b.add(M(RB(4.0, 1.8, 1.6, .06), matte(0xb8a07a), { pos: [0, .9, 0] }), M(RB(1.2, 2.6, 1.7, .06), matte(0xc4ad86), { pos: [0, 1.3, 0] }), M(new THREE.ConeGeometry(.9, .9, 4), matte(0x6a5a4a), { pos: [0, 3.05, 0], rot: [0, Math.PI / 4, 0] }));
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) if (i < 2 || i > 3) b.add(M(RB(.22, .36, .04, .02), plastic(0x2a2e3a), { pos: [-1.75 + i * .7, .6 + r * .7, .81] })); b.position.z = -.5; st.scene.add(b);
    const rubble = new THREE.Group(), r = rng(3); for (let i = 0; i < 26; i++) { const sz = .15 + r() * .35; rubble.add(M(RB(sz, sz * .7, sz, .03), matte(0x6a6258, { flatShading: true }), { pos: [(r() - .5) * 7, sz * .3, 1.2 + r() * 2.2], rot: [r(), r() * 3, r()] })); } st.scene.add(rubble);
    const tag = card(2.6, .62, 'PALACE OF JUSTICE', null, { size: 60 }); tag.position.set(0, .45, 2.6); tag.rotation.x = -.3; st.scene.add(tag);
    return { ...st, update(t, s) { tag.scale.setScalar(popIn(t, .3)); aim(st.cam, [Math.sin(s * .25) * 1.5, 2.4, lerp(10, 8.6, t)], [0, 1.5, 0]); } };
  };
  BUILD.n_dock = () => {
    const st = stage(PAL.court), c = courtroom(st, { view: 'dock' }), n = counter(1.6, .62, { fg: '#f1e6d2' }); n.position.set(0, 2.75, -.8); st.scene.add(n);
    return { ...st, update(t, s) { c.flags.forEach(f => f.wave(s * .4)); c.dock.forEach((p, i) => p.pose({ s: s + i, sit: i < 12 ? 1 : 0, nod: .1 })); const k = Math.round(lerp(1, 21, ease(seg(t, .1, .6)))); n.set(String(k), k < 21 ? 'DEFENDANTS' : '+1 TRIED IN ABSENCE'); n.scale.setScalar(popIn(t, .05));
      aim(st.cam, [Math.sin(s * .25) * .6, 2.2, 6.8], [0, 1.3, 0]); } };
  };
  BUILD.n_phones = () => {
    const st = stage(PAL.court), c = courtroom(st, { phones: true, view: 'dock' }), langs = ['ENGLISH', 'FRENCH', 'RUSSIAN', 'GERMAN'].map((l, i) => { const g = textSign(1.35, .34, l, { color: [0x2a3770, 0x1f3d8a, 0xc3221f, 0x3a3a3a][i], fg: '#f1e6d2', size: 48 }); g.position.set(i % 2 ? .75 : -.75, 2.85 - Math.floor(i / 2) * .5, -1.0); st.scene.add(g); return g; });
    return { ...st, update(t, s) { c.dock.forEach((p, i) => p.pose({ s: s + i, sit: i < 12 ? 1 : 0, look: Math.sin(s * .7 + i) * .15 })); langs.forEach((g, i) => g.scale.setScalar(popIn(t, .1 + i * .12))); aim(st.cam, [Math.sin(s * .25) * .5, 2.2, 6.8], [0, 1.3, 0]); } };
  };
  BUILD.n_docs = () => {
    const st = stage(PAL.court), table = M(RB(3.2, .1, 1.4, .04), matte(0x6a4a2e), { pos: [0, 1.0, 0] }); st.scene.add(table, M(RB(.2, 1.0, .2, .03), matte(0x5a3e28), { pos: [-1.3, .5, 0] }), M(RB(.2, 1.0, .2, .03), matte(0x5a3e28), { pos: [1.3, .5, 0] }));
    const stacks = []; for (let i = 0; i < 4; i++) { const g = new THREE.Group(); for (let j = 0; j < 10; j++) g.add(M(RB(.5, .025, .66, .005), matte(0xefe8d8), { pos: [Math.sin(j * 2.1) * .02, j * .028, 0], rot: [0, Math.sin(j) * .06, 0] })); g.position.set(-1.25 + i * .45, 1.06, .1); st.scene.add(g); stacks.push(g); }
    const proj = G(M(RB(.5, .4, .7, .06), plastic(0x2a2a2a)), M(new THREE.CylinderGeometry(.08, .1, .25, 16), plastic(0x1a1a1a), { pos: [0, 0, .45], rot: [Math.PI / 2, 0, 0] }), ...[-.2, .2].map(z => M(new THREE.CylinderGeometry(.22, .22, .04, 24), plastic(0x2a2a2a), { pos: [0, .38, z], rot: [0, 0, Math.PI / 2] })));
    proj.position.set(1.0, 1.25, .2); proj.rotation.y = Math.PI; st.scene.add(proj); const scr = M(new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshBasicMaterial({ color: 0xd8d2c4, toneMapped: false }), { pos: [0, 3.6, -2], shadow: false }); st.scene.add(scr);
    const beam = M(new THREE.ConeGeometry(1.4, 4.2, 4, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff2d8, transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide }), { shadow: false }); beam.position.set(.5, 2.4, -.9); beam.rotation.set(-1.15, 0, 0); st.scene.add(beam);
    const stamp = card(2.4, .55, 'THEIR OWN RECORDS', null, { size: 56 }); stamp.position.set(0, 1.9, 1.0); st.scene.add(stamp);
    return { ...st, update(t, s) { stacks.forEach((g, i) => g.scale.setScalar(popIn(t, i * .07))); stamp.scale.setScalar(popIn(t, .25)); const on = t > .5; beam.visible = on; scr.material.color.setScalar(on ? .55 + Math.sin(s * 23) * .05 : .25);
      proj.children[2].rotation.x = proj.children[3].rotation.x = s * 3; cam(st, s, 2.4, 8.6); } };
  };
  BUILD.n_orders = () => {
    const st = stage(PAL.court), p = person({ coat: 0x55584f, tie: 0x2a2a2a, hair: 0x4a4038 }); p.position.set(0, 0, .2); st.scene.add(p, M(RB(1.4, .7, .5, .06), matte(0x6a4a2e), { pos: [0, .35, 1.0] }));
    const bub = card(2.8, .8, '"I WAS FOLLOWING ORDERS"', null, { size: 54, bg: '#f4f1ea', slab: 0xf4f1ea }); bub.position.set(0, 3.5, .5); st.scene.add(bub);
    return { ...st, update(t, s) { p.pose({ s, outL: .3 + Math.sin(s * 2) * .15, outR: .3 + Math.sin(s * 2 + 1) * .15, armL: .5, armR: .5, look: Math.sin(s) * .2 }); bub.scale.setScalar(popIn(t, .15)); bub.rotation.z = Math.sin(s * 1.5) * .03; cam(st, s, 2.1, 6.8); } };
  };
  BUILD.n_rule = () => {
    const st = stage(PAL.court), bub = card(2.8, .8, '"I WAS FOLLOWING ORDERS"', null, { size: 54, bg: '#f4f1ea', slab: 0xf4f1ea }); bub.position.set(0, 3.3, 0); st.scene.add(bub);
    const stamp = sign(2.4, .9, (x, w, h) => { x.strokeStyle = '#b8262d'; x.lineWidth = 16; rrect(x, 12, 12, w - 24, h - 24, 20); x.stroke(); label(x, 'NO EXCUSE', w / 2, h / 2 + 4, h * .5, '#b8262d', 900); }, { color: 0xf4f1ea, depth: .06 }); stamp.position.set(0, 3.3, .3); stamp.rotation.z = -.12; st.scene.add(stamp);
    const gavel = G(M(new THREE.CylinderGeometry(.16, .16, .55, 20), matte(0x5a3a22), { rot: [0, 0, Math.PI / 2] }), M(new THREE.CylinderGeometry(.04, .04, 1.0, 10), matte(0x6a4a2e), { pos: [0, -.5, 0] })); st.scene.add(gavel, M(new THREE.CylinderGeometry(.4, .45, .12, 24), matte(0x5a3a22), { pos: [0, 1.06, .6] }), M(RB(2.6, 1.0, 1.4, .06), matte(0x6a4a2e), { pos: [0, .5, .6] }));
    const law = card(3.2, .6, 'RESPONSIBLE, EVEN UNDER ORDERS', null, { size: 46 }); law.position.set(0, 4.6, 0); st.scene.add(law);
    return { ...st, update(t, s) { const hit = seg(t, .12, .2); gavel.position.set(.1, 1.75 - Math.sin(hit * Math.PI) * .5 + (hit >= 1 ? -.45 : 0), .6); gavel.rotation.z = -.3 + hit * .3; stamp.scale.setScalar(t > .2 ? Math.max(1, 1.6 - (t - .2) * 8) : 0); bub.visible = true;
      law.scale.setScalar(popIn(t, .5)); cam(st, s, 2.6, 8.4); } };
  };
  BUILD.n_verdict = () => {
    const st = stage(PAL.court), cols = [['12', 'DEATH', '#e0574d'], ['7', 'PRISON', '#f2c46a'], ['3', 'ACQUITTED', '#9fd3a6']].map(([n, l, c], i) => { const g = counter(1.15, 1.25, { fg: '#f1e6d2', sub: c }); g.set(n, l); g.position.set(-1.25 + i * 1.25, 2.9, 0); st.scene.add(g); return g; });
    const date = card(1.9, .5, 'OCTOBER 1946', null, { size: 56 }); date.position.set(0, 4.2, .2); st.scene.add(date); st.scene.add(pedestal(1.9, 0x2a2420, RED));
    return { ...st, update(t, s) { cols.forEach((g, i) => { g.scale.setScalar(popIn(t, .1 + i * .22)); g.rotation.y = Math.sin(s + i) * .06; }); date.scale.setScalar(popIn(t, .02)); cam(st, s, 2.7, 8.6); } };
  };
  BUILD.n_icc = () => {
    const st = stage(PAL.night), b = G(M(RB(3.0, 1.4, 1.4, .08), plastic(0xe8ecf2, { roughness: .4 }), { pos: [0, .7, 0] }), M(RB(1.0, 2.6, 1.0, .08), plastic(0xdfe4ec, { roughness: .4 }), { pos: [-.8, 1.3, .1] }));
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) b.add(M(RB(.3, .2, .04, .02), plastic(0x9fc8ff, { emissive: 0x6aa0e0, emissiveIntensity: .8 }), { pos: [-1.2 + i * .48, .35 + r * .35, .71], shadow: false })); b.position.set(0, 0, -.6); st.scene.add(b);
    const steps = ['1945  NUREMBERG', '1948  GENOCIDE CONVENTION', '2002  INTERNATIONAL CRIMINAL COURT'].map((l, i) => { const g = textSign(3.4, .44, l, { color: i === 2 ? RED : 0xf1e6d2, fg: i === 2 ? '#fff3e6' : INK, size: 44 }); g.position.set(0, 4.9 - i * .58, .3); st.scene.add(g); return g; });
    const tag = card(1.8, .42, 'THE HAGUE', null, { size: 48 }); tag.position.set(.8, 2.2, .6); st.scene.add(tag);
    return { ...st, update(t, s) { steps.forEach((g, i) => g.scale.setScalar(popIn(t, .05 + i * .25))); b.scale.setScalar(popIn(t, .55)); tag.scale.setScalar(popIn(t, .7)); cam(st, s, 2.8, 9.0); } };
  };

  // ---------- overlay: vignette, red progress bar, series tag, chapter chip, captions ----------
  const c2 = document.getElementById('cv').getContext('2d');
  K.overlay = (L, T, total) => { const meta = window.META || {};
    const vg = c2.createRadialGradient(W / 2, H * .42, H * .28, W / 2, H * .42, H * .78); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); c2.fillStyle = vg; c2.fillRect(0, 0, W, H);
    c2.fillStyle = 'rgba(255,255,255,.22)'; c2.beginPath(); c2.roundRect(60, 70, W - 120, 10, 5); c2.fill(); c2.fillStyle = '#d8342c'; c2.beginPath(); c2.roundRect(60, 70, (W - 120) * clamp(T / total), 10, 5); c2.fill();
    c2.save(); c2.font = `900 34px ${SANS}`; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.letterSpacing = '6px'; c2.fillStyle = 'rgba(241,230,210,.85)'; c2.fillText(`DARK CHAPTERS  ·  #${meta.episode ?? ''}`, W / 2, 128); c2.restore();
    if (L.step && L.scene !== 'd_outro') { const k = out(seg(L.secT, 0, .45)), nm = L.secName.toUpperCase(); c2.save(); c2.globalAlpha = k; c2.translate(W / 2, 215); c2.scale(.85 + .15 * k, .85 + .15 * k); c2.font = `900 44px ${SANS}`;
      const tw = Math.min(760, c2.measureText(nm).width), bw = tw + 90; c2.fillStyle = 'rgba(16,12,14,.82)'; c2.beginPath(); c2.roundRect(-bw / 2, -42, bw, 84, 16); c2.fill(); c2.fillStyle = '#d8342c'; c2.fillRect(-bw / 2, -42, 12, 84);
      c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillStyle = '#f1e6d2'; c2.save(); c2.translate(6, 3); c2.scale(tw / Math.max(1, c2.measureText(nm).width), 1); c2.fillText(nm, 0, 0); c2.restore(); c2.restore(); }
    if (!L.cap || T < L.cap[0] || T > L.cap[1] + .15) return;
    const words = L.text.split(/\s+/), chunks = []; let cur = []; words.forEach(w => { cur.push(w); if (cur.length >= 3 || /[.,?!]$/.test(w)) { chunks.push(cur.join(' ')); cur = []; } }); if (cur.length) chunks.push(cur.join(' '));
    const tot = chunks.reduce((a, ch) => a + ch.length + 4, 0), k = (T - L.cap[0]) / (L.cap[1] - L.cap[0]) * tot; let acc = 0, idx = chunks.length - 1;
    for (let i = 0; i < chunks.length; i++) { acc += chunks[i].length + 4; if (k < acc) { idx = i; break; } }
    let chStart = 0; for (let i = 0; i < idx; i++) chStart += chunks[i].length + 4; const age = (k - chStart) / tot * (L.cap[1] - L.cap[0]), s = chunks[idx].toUpperCase();
    c2.save(); c2.font = `900 74px ${SANS}`; c2.wordSpacing = '20px'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.lineJoin = 'round';
    const fit = Math.min(1, (W - 120) / c2.measureText(s).width), sc = fit * (1 + .1 * Math.exp(-age * 18)); c2.translate(W / 2, 1520); c2.scale(sc, sc);
    c2.lineWidth = 12; c2.strokeStyle = '#0d0a0c'; c2.shadowColor = 'rgba(0,0,0,.5)'; c2.shadowBlur = 18; c2.shadowOffsetY = 6; c2.strokeText(s, 0, 0); c2.shadowBlur = 0; c2.shadowOffsetY = 0;
    c2.fillStyle = idx % 2 ? '#ff5a4f' : '#f6efe4'; c2.fillText(s, 0, 0); c2.restore();
  };
}
