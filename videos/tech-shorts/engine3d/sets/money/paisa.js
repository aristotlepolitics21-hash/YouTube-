// Paisa Toons (videos/money-toons): finance shorts in three looks, all data-driven from the script.
//   faceless: smooth clay mannequins with blank faces in warm, cinematic rooms
//   toon:     desi caricatures (giant noses, thick moustaches) in saturated sunny sets
//   flat:     cel-shaded with black outlines, like a 2D sitcom
// One builder, BUILD.pt(p), makes every shot from p = { look, room, chars, cast, props, cam, move, speaker, stat, last }.
import { body } from '../body/common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, ctex, textSign, clamp, lerp, seg, ease, frac, V, rng } = K;
  const B = body(K), { reach, shoot, popIn } = B;
  const CYL = (a, b, h, n = 24) => new THREE.CylinderGeometry(a, b, h, n);

  // ---------- characters ----------
  const SKIN = { clay: 0xd8b08a, fair: 0xf0c8a0, wheat: 0xd9a07a, brown: 0xb07850, dark: 0x8a5a3a };
  function actor(look, o = {}) {
    const p = B.makePerson({ skin: look === 'faceless' ? SKIN.clay : (SKIN[o.skin] ?? o.skin ?? SKIN.wheat), shirt: o.shirt ?? 0x3d7bff, pants: o.pants ?? 0x2a3150, shoe: o.shoe ?? 0x3a2a22,
      hair: o.hair ?? 0x2a1a12, hairStyle: o.hairStyle ?? 'short', eye: 0x3a2418 });
    const u = p.userData, h = u.head, cl = c => matte(c, { roughness: .8 }), hairM = cl(o.hair ?? 0x2a1a12);
    if (look === 'faceless') { [...u.eyes, ...u.brows, ...u.cheeks, u.mouth, u.nose].forEach(m => m.visible = false); u.skinMats.forEach(m => { m.roughness = .7; m.clearcoat = .05; }); }
    if (look === 'toon' && o.nose !== false) { u.nose.scale.set(1.5, 1.7, 3.4 * (o.noseK ?? 1)); u.nose.position.set(0, -.08, .64); u.eyes.forEach(e => e.scale.setScalar(1.25)); }
    if (o.stache) h.add(...[-1, 1].map(s => M(new THREE.CapsuleGeometry(.07, .2, 6, 12), cl(o.stacheCol ?? o.hair ?? 0x1d1410), { pos: [s * .14, -.2, look === 'toon' ? .66 : .58], rot: [0, 0, s * (o.stache === 'big' ? 1.0 : 1.25)], scale: o.stache === 'big' ? 1.35 : 1 })));
    if (o.beard) h.add(M(SPH(.42, 24, 16), cl(o.beardCol ?? o.hair ?? 0x2a1a12), { pos: [0, -.42, .26], scale: [1.05, .8, .62] }));
    if (o.messy) for (let i = 0; i < 7; i++) h.add(M(new THREE.ConeGeometry(.12, .4, 10), hairM, { pos: [-.45 + i * .15, .55 + Math.sin(i * 2) * .05, -.05], rot: [-.3, 0, (i - 3) * .25] }));
    if (o.bun) h.add(M(SPH(.26, 24, 16), hairM, { pos: [0, .35, -.55] }));
    if (o.ponytail) h.add(M(new THREE.CapsuleGeometry(.13, .5, 8, 14), hairM, { pos: [0, .05, -.7], rot: [.5, 0, 0] }));
    if (o.glasses) [-1, 1].forEach(s => h.add(M(new THREE.TorusGeometry(.16, .025, 8, 24), plastic(0x1d1d24), { pos: [s * .22, .08, .62], shadow: false })));
    if (o.shades) h.add(M(RB(.72, .18, .06, .05), plastic(0x0b0b10, { roughness: .1 }), { pos: [0, .1, .62], shadow: false }));
    if (o.bindi) h.add(M(SPH(.035, 12, 8), plastic(0xd62828), { pos: [0, .22, .62], shadow: false }));
    if (o.cap) h.add(G(M(SPH(.68, 32, 16, 0, Math.PI * 2, 0, 1.2), cl(o.cap), { rot: [-.3, 0, 0] }), M(new THREE.CylinderGeometry(.55, .55, .05, 24, 1, false, -Math.PI / 2, Math.PI), cl(o.cap), { pos: [0, .28, .45], rot: [.15, 0, 0] })));
    if (o.turban) h.add(M(new THREE.TorusGeometry(.5, .26, 16, 32), cl(o.turban), { pos: [0, .42, -.02], rot: [Math.PI / 2 - .2, 0, 0], scale: [1.05, 1.1, 1.3] }));
    if (o.chains) [0, 1, 2].forEach(i => p.add(M(new THREE.TorusGeometry(.3 + i * .06, .025, 8, 32), metal(0xffc44d), { pos: [0, 2.0 - i * .1, .15 + i * .04], rot: [Math.PI / 2 - .5, 0, 0] })));
    if (o.kurta) p.add(M(CYL(.55, .72, 1.1, 28), cl(o.kurta), { pos: [0, 1.1, 0], scale: [1, 1, .78] }));
    if (o.coat) { p.add(M(CYL(.58, .82, 1.6, 28, 1, true), cl(o.coat), { pos: [0, 1.25, 0], scale: [1, 1, .8] })); [-1, 1].forEach(s => p.add(M(RB(.18, .5, .06, .03), cl(o.coat), { pos: [s * .18, 1.95, .42], rot: [0, 0, -s * .5] }))); }
    if (o.saree) { p.add(M(CYL(.5, .78, 1.9, 28), cl(o.saree), { pos: [0, .95, 0], scale: [1, 1, .8] })); p.add(M(RB(.3, 1.2, .08, .04), cl(o.saree), { pos: [-.2, 1.65, .38], rot: [0, 0, .6] })); }
    if (o.bag) { p.add(M(RB(.45, .38, .15, .06), plastic(0x7a4a2a, { roughness: .5 }), { pos: [.6, 1.25, .1] })); p.add(M(new THREE.TorusGeometry(.62, .025, 6, 32, Math.PI * .9), plastic(0x7a4a2a), { pos: [.15, 1.75, 0], rot: [0, 0, -.9] })); }
    if (o.belly) u.torso.scale.x = 1.25;
    if (o.scale) p.scale.setScalar(o.scale);
    p.userData.look = look; return p;
  }
  // named poses: params for person.pose; s = seconds, k = 0..1 ease-in, talk = speaking now
  const POSE = {
    idle: (s) => ({}),
    talk: (s) => ({ handR: reach([.55 + Math.sin(s * 3) * .1, 1.75 + Math.sin(s * 4.3) * .12, .65], 1) }),
    shrug: (s, k) => ({ handR: reach([.85, 1.9, .35], k), handL: reach([.85, 1.9, .35], k, -1), headTilt: .18 * k, brow: .4 }),
    phone: (s, k) => ({ handR: reach([.22, 2.0, .72], k), headNod: .32 * k, look: [0, -1] }),
    headinhands: (s, k) => ({ handR: reach('forehead', k), handL: reach('forehead', k, -1), headNod: .35 * k, brow: .9, smile: -.6 }),
    point: (s, k) => ({ handR: reach('point', k), smile: .7 }),
    cheer: (s, k) => ({ handR: reach('up', k).add(V(Math.sin(s * 8) * .12, 0, 0)), handL: reach('up', k, -1).add(V(-Math.sin(s * 8) * .12, 0, 0)), mouth: .7, smile: 1, wide: .4 }),
    wave: (s, k) => ({ handR: reach('wave', k).add(V(Math.sin(s * 9) * .15, 0, 0)), smile: .9 }),
    sad: (s, k) => ({ headNod: .35 * k, brow: .9, smile: -.6, look: [0, -1] }),
    shock: (s, k) => ({ handR: reach('cheek', k), handL: reach('cheek', k, -1), wide: 1, mouth: .8, brow: .6 }),
    think: (s, k) => ({ handR: reach('chin', k), look: [.5, .8], headTilt: .12, brow: .3 }),
    give: (s, k) => ({ handR: reach([.45, 1.75, 1.0], k), smile: .8 }),
    hips: (s, k) => ({ handR: reach('hip', k), handL: reach('hip', k, -1), smile: .7 }),
    count: (s, k) => ({ handR: reach([.6, 2.6, .6], k).add(V(0, Math.sin(s * 4) * .06, 0)), smile: .6 }),
    dance: (s) => ({ handR: reach(Math.sin(s * 5) > 0 ? 'up' : 'hip', 1), handL: reach(Math.sin(s * 5) > 0 ? 'hip' : 'up', 1, -1), headTilt: Math.sin(s * 5) * .15, smile: 1, mouth: .5 }),
    cry: (s, k) => ({ handR: reach('eye', k), handL: reach('eye', k, -1), headNod: .25, brow: .9, smile: -.8, mouth: .3 + Math.abs(Math.sin(s * 9)) * .3 }),
    type: (s, k) => ({ handR: reach([.32, 1.6 + Math.abs(Math.sin(s * 11)) * .05, .78], k), handL: reach([.32, 1.6 + Math.abs(Math.sin(s * 13 + 1)) * .05, .78], k, -1), look: [0, -1], headNod: .2 }),
    hold: (s, k) => ({ handR: reach([.4, 1.75, .65], k), smile: .6 }),
    holdup: (s, k) => ({ handR: reach([.5, 2.5, .6], k), smile: .9, wide: .3 }),
    stop: (s, k) => ({ handR: reach([.3, 2.2, 1.0], k), brow: -.4, mouth: .4 }),
    wise: (s, k) => ({ handR: reach([.55, 2.85, .45], k), smile: .8, squint: .3 }),
    sit: (s) => ({ sit: 1, sitY: .55 }),
    sittalk: (s) => ({ sit: 1, sitY: .55, handR: reach([.5, 1.65 + Math.sin(s * 4) * .08, .75], 1) }),
    sitphone: (s, k) => ({ sit: 1, sitY: .55, handR: reach([.22, 1.95, .72], k), headNod: .32 * k, look: [0, -1] }),
    sitsad: (s, k) => ({ sit: 1, sitY: .55, handR: reach('forehead', k), handL: reach('forehead', k, -1), headNod: .35 * k, brow: .9, smile: -.6 }),
    sitshrug: (s, k) => ({ sit: 1, sitY: .55, handR: reach([.8, 1.7, .4], k), handL: reach([.8, 1.7, .4], k, -1), headTilt: .2 * k, lean: -.08 }),
    walk: (s) => ({ walk: s * 5.5, smile: .5 }),
  };

  // ---------- looks: palettes and finishing ----------
  const LOOKS = {
    faceless: { top: '#f3d2a6', bottom: '#c9946a', floor: 0xb8865e, key: 0xffd2a0, keyI: 2.7, hemi: .8, rim: 0xffb070, rimI: 1.6, fogNear: 10, fogFar: 34 },
    toon: { top: '#8fd3ff', bottom: '#ffe0b0', floor: 0xe8c890, key: 0xfff0d0, keyI: 2.8, hemi: 1.05 },
    flat: { top: '#7cc8ff', bottom: '#bfe8ff', floor: 0xa8d878, key: 0xffffff, keyI: 2.4, hemi: 1.2, fog: false },
  };
  const GRAD = (() => { const d = new Uint8Array([90, 90, 90, 255, 185, 185, 185, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.needsUpdate = true; t.minFilter = t.magFilter = THREE.NearestFilter; return t; })();
  const OUTLINE = new THREE.MeshBasicMaterial({ color: 0x14100c, side: THREE.BackSide, fog: false });
  function flatten(sc, bg) {
    const list = []; sc.traverse(o => { if (o.isMesh && !o.userData.noFlat) list.push(o); });
    list.forEach(o => { const m = o.material; if (!m || m.isMeshBasicMaterial || m.isShaderMaterial) return;
      const col = m.color ? m.color.clone() : new THREE.Color(0xffffff), em = m.emissive && m.emissive.getHex() !== 0 && m.emissiveIntensity > .5 ? m.emissive.clone().multiplyScalar(Math.min(1.5, m.emissiveIntensity)) : null;
      o.material = em ? new THREE.MeshBasicMaterial({ color: em }) : new THREE.MeshToonMaterial({ color: col, gradientMap: GRAD, transparent: m.transparent, opacity: m.opacity, side: m.side });
      const gt = o.geometry.type; if (m.transparent || gt === 'PlaneGeometry' || gt === 'CircleGeometry') return;
      o.geometry.computeBoundingSphere(); const r = o.geometry.boundingSphere.radius; if (r < .03 || r > 12) return;
      const ol = new THREE.Mesh(o.geometry, OUTLINE); ol.userData.noFlat = true; ol.castShadow = false; ol.scale.setScalar(1 + Math.min(.08, .035 / r + .02)); o.add(ol); });
    sc.background = new THREE.Color(bg); sc.fog = null; }

  // ---------- canvas helpers ----------
  const card = (w, h, draw, col = 0xffffff, depth = .06) => { const s = K.sign(w, h, draw, { color: col, depth }); s.userData.w = w; return s; };
  const poster = (w, h, bg, lines, fg = '#1d1d24') => card(w, h, (x, cw, ch) => { x.fillStyle = bg; x.fillRect(0, 0, cw, ch); lines.forEach((l, i) => label(x, l, cw / 2, ch * (i + 1) / (lines.length + 1), ch / (lines.length + 1.6) * .8, fg, 900)); }, 0xffffff, .03);
  function screen(kind, w = .5, h = .9) { // phone / monitor faces
    return (x, cw, ch) => { x.fillStyle = '#111522'; x.fillRect(0, 0, cw, ch);
      if (kind === 'chart' || kind === 'gold') { x.fillStyle = kind === 'gold' ? '#2a2210' : '#0f1f18'; x.fillRect(cw * .06, ch * .06, cw * .88, ch * .88); x.strokeStyle = kind === 'gold' ? '#ffc44d' : '#3cd27a'; x.lineWidth = cw * .05; x.lineJoin = 'round'; x.beginPath();
        for (let i = 0; i <= 10; i++) { const X = cw * (.12 + i * .076), Y = ch * (.8 - .55 * Math.pow(i / 10, 1.6) + Math.sin(i * 2.3) * .03); i ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke();
        if (kind === 'gold') { x.fillStyle = '#ffc44d'; x.fillRect(cw * .3, ch * .15, cw * .4, ch * .12); } }
      else if (kind === 'chat') { for (let i = 0; i < 4; i++) { x.fillStyle = i % 2 ? '#3cd27a' : '#ffffff'; x.beginPath(); x.roundRect(cw * (i % 2 ? .3 : .08), ch * (.1 + i * .2), cw * .62, ch * .14, cw * .05); x.fill(); } }
      else if (kind === 'grid') { const c = ['#f15bb5', '#ffd23f', '#5fb8ec', '#3aa76d', '#f28c28', '#9b5de5', '#ff6b6b', '#00bbf9', '#fee440']; for (let i = 0; i < 9; i++) { x.fillStyle = c[i]; x.fillRect(cw * (.06 + (i % 3) * .3), ch * (.08 + Math.floor(i / 3) * .3), cw * .27, ch * .27); } }
      else if (kind === 'code') { const c = ['#3cd27a', '#ffd23f', '#5fb8ec', '#f15bb5']; for (let i = 0; i < 9; i++) { x.fillStyle = c[i % 4]; x.fillRect(cw * (.08 + (i % 3) * .06), ch * (.08 + i * .1), cw * (.3 + ((i * 37) % 40) / 100), ch * .05); } }
      else if (kind === 'video') { x.fillStyle = '#2a2f45'; x.fillRect(cw * .05, ch * .08, cw * .9, ch * .55); x.fillStyle = '#ff4fa3'; x.beginPath(); x.moveTo(cw * .45, ch * .25); x.lineTo(cw * .6, ch * .35); x.lineTo(cw * .45, ch * .45); x.fill();
        for (let i = 0; i < 3; i++) { x.fillStyle = ['#3cd27a', '#ffd23f', '#5fb8ec'][i]; x.fillRect(cw * .05, ch * (.7 + i * .09), cw * (.3 + i * .2), ch * .06); } }
      else if (kind === 'bill') { x.fillStyle = '#fff'; x.fillRect(cw * .06, ch * .06, cw * .88, ch * .88); label(x, '₹', cw / 2, ch * .35, ch * .25, '#3cc85a', 900); x.fillStyle = '#3cc85a'; x.beginPath(); x.roundRect(cw * .2, ch * .65, cw * .6, ch * .12, ch * .06); x.fill(); }
      else if (kind === 'alert') { x.fillStyle = '#ff4a5c'; x.fillRect(cw * .06, ch * .3, cw * .88, ch * .3); label(x, '!', cw / 2, ch * .45, ch * .22, '#fff', 900); }
      else if (kind === 'gauge') { x.lineWidth = cw * .1; ['#ff4a5c', '#ffb020', '#3cc85a'].forEach((c, i) => { x.strokeStyle = c; x.beginPath(); x.arc(cw / 2, ch * .7, cw * .32, Math.PI + i * Math.PI / 3, Math.PI + (i + 1) * Math.PI / 3); x.stroke(); }); }
    }; }

  // ---------- props ----------
  function phone(kind = 'chart', s = 1) { const g = G(M(RB(.36, .7, .05, .05), plastic(0x1d1d24, { roughness: .2 }))); const f = card(.32, .64, screen(kind), 0x111522, .01); f.position.z = .03; f.children[0].visible = false; g.add(f); g.scale.setScalar(s); return g; }
  function cup(steam = true) { const g = G(M(CYL(.16, .12, .26, 24), plastic(0xffffff)), M(new THREE.TorusGeometry(.08, .025, 8, 16), plastic(0xffffff), { pos: [.17, .02, 0], rot: [0, 0, Math.PI / 2] }), M(CYL(.28, .28, .03, 24), plastic(0xffffff), { pos: [0, -.14, 0] }), M(CYL(.14, .14, .02, 20), matte(0x6b3a1e), { pos: [0, .12, 0] }));
    if (steam) for (let i = 0; i < 3; i++) { const sp = sprite(0xffffff, .4, .25); sp.position.set((i - 1) * .06, .45 + i * .18, 0); g.add(sp); } return g; }
  const coin = (r = .14) => M(CYL(r, r, r * .28, 28), metal(0xffc44d), { rot: [Math.PI / 2, 0, 0] });
  function coinTree(s = 1) { const g = G(M(CYL(.08, .14, 1.4, 12), matte(0x7a4a2a), { pos: [0, .7, 0] })); [[0, 1.7, 0, .55], [-.4, 1.4, .1, .4], [.42, 1.45, -.05, .42], [0, 2.1, -.1, .38]].forEach(([x, y, z, r]) => g.add(M(SPH(r, 20, 14), plastic(0x5cc46a, { roughness: .6 }), { pos: [x, y, z] })));
    const R = rng(5); for (let i = 0; i < 16; i++) { const c = coin(.09); const a = R() * 6.28, rr = .35 + R() * .3; c.position.set(Math.cos(a) * rr, 1.4 + R() * .8, Math.sin(a) * rr * .6 + .3); c.rotation.set(R() * 3, R() * 3, 0); g.add(c); }
    g.add(M(CYL(.4, .3, .4, 24), plastic(0xc8643c), { pos: [0, .2, 0] })); g.scale.setScalar(s); return g; }
  function hourglass(s = 1) { const g = G(M(CYL(.65, .65, .1, 32), plastic(0x7a4a2a), { pos: [0, 0, 0] }), M(CYL(.65, .65, .1, 32), plastic(0x7a4a2a), { pos: [0, 2.2, 0] }));
    [-1, 1].forEach(a => [-1, 1].forEach(b => g.add(M(CYL(.04, .04, 2.2, 8), plastic(0x7a4a2a), { pos: [a * .55, 1.1, b * .55] }))));
    const pts = []; for (let i = 0; i <= 20; i++) { const y = i / 20 * 2; pts.push(new THREE.Vector2(.08 + .42 * Math.pow(Math.abs(y - 1), .8), y)); }
    g.add(M(new THREE.LatheGeometry(pts, 40), plastic(0xffffff, { transparent: true, opacity: .25, roughness: .02, depthWrite: false }), { pos: [0, .1, 0], shadow: false }));
    const top = M(new THREE.ConeGeometry(.38, .5, 32), metal(0xffc44d), { pos: [0, 1.55, 0], rot: [Math.PI, 0, 0] }), bot = M(new THREE.ConeGeometry(.42, .45, 32), metal(0xffc44d), { pos: [0, .35, 0] }); g.add(top, bot);
    g.userData.set = k => { top.scale.setScalar(Math.max(.05, 1 - k * .7)); bot.scale.setScalar(.4 + k * .6); bot.position.y = .15 + .2 * (.4 + k * .6); }; g.scale.setScalar(s); return g; }
  function piggy(s = 1) { const c = plastic(0xc8643c, { roughness: .6 }); const g = G(M(SPH(.6, 32, 24), c, { scale: [1.1, .95, .95] }), M(CYL(.15, .2, .12, 16), c, { pos: [0, .62, 0] }), M(CYL(.22, .22, .06, 16), c, { pos: [0, .7, 0] }), M(RB(.24, .04, .08, .02), matte(0x3a1a0a), { pos: [0, .74, 0] }));
    [-1, 1].forEach(a => [-1, 1].forEach(b => g.add(M(CYL(.1, .12, .3, 12), c, { pos: [a * .35, -.6, b * .3] })))); g.position.y = .72; const w = G(g); w.scale.setScalar(s); return w; }
  function cash(n = 4, s = 1) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(M(RB(.7, .06, .34, .02), plastic(0x7cc36b, { roughness: .6 }), { pos: [0, .04 + i * .065, 0], rot: [0, (i % 3 - 1) * .08, 0] })); g.add(M(RB(.12, n * .065 + .02, .36, .01), plastic(0xffd23f), { pos: [0, n * .033, 0] })); g.scale.setScalar(s); return g; }
  const note = () => M(RB(.42, .2, .01, .01), plastic(0x7cc36b, { roughness: .6 }));
  const paper = (col = 0xffffff) => M(RB(.42, .55, .01, .01), plastic(col, { roughness: .8 }));
  function credit(col = 0x2a2f80, s = 1) { const g = G(M(RB(.85, .54, .03, .05), plastic(col, { roughness: .25 })), M(RB(.16, .12, .01, .02), metal(0xffc44d), { pos: [-.22, .05, .02] })); g.scale.setScalar(s); return g; }
  function house(s = 1) { const g = G(M(RB(1.6, 1.2, 1.4, .05), plastic(0xfff3d6), { pos: [0, .6, 0] }), M(new THREE.ConeGeometry(1.3, .8, 4), plastic(0xe24b4b), { pos: [0, 1.6, 0], rot: [0, Math.PI / 4, 0] }), M(RB(.35, .6, .05, .03), plastic(0x7a4a2a), { pos: [0, .3, .71] }),
    ...[-1, 1].map(d => M(RB(.3, .3, .05, .03), plastic(0x8fd3ff), { pos: [d * .5, .75, .71] }))); g.scale.setScalar(s); return g; }
  function bigKey(s = 1) { const m = metal(0xffc44d); const g = G(M(new THREE.TorusGeometry(.3, .09, 12, 32), m, { pos: [0, .5, 0] }), M(RB(.12, 1.0, .1, .03), m, { pos: [0, -.25, 0] }), M(RB(.25, .1, .1, .03), m, { pos: [.12, -.55, 0] }), M(RB(.2, .1, .1, .03), m, { pos: [.1, -.35, 0] })); g.scale.setScalar(s); return g; }
  function gaugeDial(s = 1) { const g = G(M(CYL(1.2, 1.2, .2, 48, 1, false, 0, Math.PI), plastic(0xffffff), { rot: [Math.PI / 2, 0, 0] }));
    ['#ff4a5c', '#ffb020', '#3cc85a'].forEach((c, i) => g.add(M(new THREE.TorusGeometry(1.0, .1, 8, 32, Math.PI / 3), plastic(new THREE.Color(c)), { pos: [0, 0, .12], rot: [0, 0, Math.PI - (i + 1) * Math.PI / 3] })));
    const nd = G(M(RB(.08, .9, .06, .03), plastic(0x1d1d24), { pos: [0, .45, 0] })); nd.position.z = .16; g.add(nd, M(SPH(.12, 16, 12), plastic(0x1d1d24), { pos: [0, 0, .16] }));
    g.userData.set = k => nd.rotation.z = Math.PI / 2 - k * Math.PI; g.scale.setScalar(s); return g; }
  function pyramid(look, s = 1) { const g = new THREE.Group(), R = rng(3); for (let row = 0; row < 4; row++) for (let i = 0; i <= row; i++) { const p = actor(look, { shirt: [0x3d7bff, 0xe24b4b, 0x3aa76d, 0xffb020][row], skin: ['wheat', 'brown', 'fair'][(i + row) % 3], scale: .32 });
      p.position.set((i - row / 2) * .55, (3 - row) * .62 - (row === 3 ? .1 : 0), 0); p.pose({ s: 0, handR: reach('up', 1), handL: reach('up', 1, -1), brow: row === 3 ? .9 : 0, smile: row === 0 ? 1 : -.4 }); g.add(p); }
    const top = cash(3, .7); top.position.set(0, 2.85, 0); g.add(top); g.scale.setScalar(s); return g; }
  function umbrella(s = 1) { const g = G(M(new THREE.SphereGeometry(1.6, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2.6), plastic(0xff4a5c, { side: THREE.DoubleSide }), { pos: [0, 2.5, 0] }), M(CYL(.04, .04, 2.6, 8), metal(0x8a8a92), { pos: [0, 1.3, 0] }));
    g.add(M(new THREE.SphereGeometry(1.62, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2.6), glowM(0xfff2c0, .25), { pos: [0, 2.5, 0], scale: [1, .98, 1] })); g.scale.setScalar(s); return g; }
  function snail(s = 1) { const g = G(M(new THREE.CapsuleGeometry(.18, .9, 8, 16), plastic(0x9ad46b), { rot: [0, 0, Math.PI / 2], pos: [0, .18, 0] }), M(new THREE.TorusGeometry(.32, .18, 16, 32), plastic(0xc8864a), { pos: [-.05, .6, 0] }),
    ...[-1, 1].map(d => M(CYL(.02, .02, .3, 6), plastic(0x9ad46b), { pos: [.55, .45, d * .08], rot: [0, 0, -.3] })), ...[-1, 1].map(d => M(SPH(.05, 10, 8), plastic(0x1d1d24), { pos: [.6, .6, d * .08] })));
    const c = coin(.16); c.position.set(-.05, 1.0, 0); g.add(c); g.scale.setScalar(s); return g; }
  function jar(inner, s = 1) { const g = G(M(CYL(.5, .5, 1.2, 32, 1, true), plastic(0xffffff, { transparent: true, opacity: .25, roughness: .02, side: THREE.DoubleSide, depthWrite: false }), { pos: [0, .6, 0], shadow: false }), M(CYL(.53, .53, .1, 32), metal(0x9aa0a8), { pos: [0, 1.25, 0] }));
    if (inner === 'shield') g.add(M(new THREE.CylinderGeometry(.3, .02, .55, 5), plastic(0x3d7bff), { pos: [0, .55, 0], rot: [0, Math.PI / 10, 0] }));
    else { for (let i = 0; i < 8; i++) { const c = coin(.12); c.position.set((i % 3 - 1) * .2, .1 + Math.floor(i / 3) * .1, (i % 2) * .1); c.rotation.x = 0; g.add(c); } g.add(M(SPH(.18, 14, 10), plastic(0x5cc46a), { pos: [0, .75, 0] })); }
    g.scale.setScalar(s); return g; }
  function laptop(kind = 'code', s = 1) { const g = G(M(RB(1.0, .05, .7, .03), plastic(0x9aa0a8), { pos: [0, .03, 0] })); const lid = G(M(RB(1.0, .66, .04, .03), plastic(0x9aa0a8))); lid.position.set(0, .36, -.34); lid.rotation.x = -.25;
    const f = card(.92, .58, screen(kind), 0x111522, .01); f.position.z = .03; f.children[0].visible = false; lid.add(f); g.add(lid); g.scale.setScalar(s); return g; }
  function calc() { return G(M(RB(.4, .06, .55, .04), plastic(0x2a2f45)), M(RB(.3, .02, .14, .02), plastic(0x9fe8c0), { pos: [0, .04, -.16] })); }
  function necklace(s = 1) { const g = new THREE.Group(); for (let i = 0; i < 14; i++) { const a = Math.PI * (i / 13); g.add(M(SPH(.07, 12, 10), metal(0xffc44d), { pos: [Math.cos(a) * .45, -Math.sin(a) * .5, 0] })); } g.add(M(new THREE.ConeGeometry(.12, .2, 4), plastic(0xe24b4b), { pos: [0, -.62, 0], rot: [Math.PI, 0, 0] })); g.scale.setScalar(s); return g; }
  function shutter(locked = true) { const g = G(M(RB(3.2, 3.0, .1, .03), metal(0x9aa0a8, { roughness: .5 }), { pos: [0, 1.5, 0] })); for (let i = 0; i < 14; i++) g.add(M(RB(3.2, .03, .12, .01), metal(0x6a6a72), { pos: [0, .15 + i * .2, .02] }));
    if (locked) g.add(G(M(RB(.5, .45, .2, .08), metal(0xd4a440), { pos: [0, .4, .15] }), M(new THREE.TorusGeometry(.17, .05, 8, 20, Math.PI), metal(0xb0b0b8), { pos: [0, .62, .15] }))); return g; }
  function scooter(col = 0x3d7bff) { return G(M(RB(1.2, .35, .5, .12), plastic(col), { pos: [0, .55, 0] }), M(RB(.5, .2, .45, .1), matte(0x1d1d24), { pos: [-.2, .85, 0] }), M(RB(.15, .9, .2, .05), plastic(col), { pos: [.55, .9, 0], rot: [0, 0, -.25] }),
    M(RB(.6, .06, .06, .03), metal(0x8a8a92), { pos: [.68, 1.35, 0], rot: [0, Math.PI / 2, 0] }), ...[-.45, .55].map(x => M(new THREE.TorusGeometry(.22, .09, 10, 24), matte(0x1d1d24), { pos: [x, .3, 0] }))); }
  function shopBags(n = 3) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(G(M(RB(.45, .55, .2, .03), plastic([0xff4fa3, 0xffd23f, 0x3d7bff, 0xff8a3d][i % 4]), { pos: [0, .3, 0] }), M(new THREE.TorusGeometry(.12, .02, 6, 16, Math.PI), plastic(0x1d1d24), { pos: [0, .6, 0] })).translateX((i - (n - 1) / 2) * .5)); return g; }
  function foodBags(n = 3) { const g = new THREE.Group(); for (let i = 0; i < n; i++) g.add(M(RB(.45, .5, .35, .05), plastic(0xff7a1a), { pos: [(i - 1) * .5, .25 + (i % 2) * .5, 0] })); return g; }
  function bus() { const g = G(M(RB(3.4, 1.4, 1.2, .15), plastic(0xe2343c), { pos: [0, 1.3, 0] }), M(RB(3.4, 1.2, 1.2, .15), plastic(0xe2343c), { pos: [0, 2.6, 0] }));
    [1.3, 2.6].forEach(y => g.add(M(RB(3.0, .5, 1.22, .05), plastic(0x2a3a4a, { roughness: .1 }), { pos: [0, y + .15, 0] }))); [-1.1, 1.1].forEach(x => g.add(M(new THREE.TorusGeometry(.3, .14, 10, 24), matte(0x1d1d24), { pos: [x, .45, .62] }))); return g; }
  function chalkboard(lines) { return card(3.2, 1.9, (x, w, h) => { x.fillStyle = '#2f5a45'; x.fillRect(0, 0, w, h); (lines || []).forEach((l, i) => label(x, l, w / 2, h * (i + 1) / (lines.length + 1), h * .18, i ? '#ffe066' : '#ffffff', 700)); }, 0x7a4a2a, .1); }
  function envelopes() { const g = new THREE.Group(), R = rng(9); for (let i = 0; i < 18; i++) g.add(M(RB(.5, .03, .32, .01), plastic([0xffffff, 0xffe9a8, 0xffc8c8][i % 3]), { pos: [(R() - .5) * 1.4, .02 + i * .04, (R() - .5) * .8], rot: [0, R() * 3, (R() - .5) * .3] })); return g; }
  function scale2() { const g = G(M(CYL(.08, .3, 1.8, 16), metal(0xc8a050), { pos: [0, .9, 0] }), M(RB(2.4, .08, .08, .03), metal(0xc8a050), { pos: [0, 1.8, 0] }));
    [-1, 1].forEach(d => { g.add(M(CYL(.5, .4, .1, 24), metal(0xc8a050), { pos: [d * 1.1, 1.1, 0] })); g.add(M(CYL(.01, .01, .7, 4), metal(0xc8a050), { pos: [d * 1.1, 1.45, 0] })); });
    const m = cash(5, .7); m.position.set(-1.1, 1.15, 0); const b = shopBags(2); b.scale.setScalar(.6); b.position.set(1.1, 1.15, 0); g.add(m, b); return g; }
  function net() { const g = new THREE.Group(); for (let i = 0; i < 8; i++) { g.add(M(new THREE.TorusGeometry(1.1, .03, 6, 40), matte(0x8a6a3a), { rot: [0, i * Math.PI / 8, 0], pos: [0, 1.7, 0] })); }
    for (let i = 0; i < 6; i++) { const c = credit([0x2a2f80, 0xe24b4b, 0x1d1d24][i % 3], .5); c.position.set(Math.cos(i) * .9, 1.2 + (i % 3) * .5, Math.sin(i) * .9); c.rotation.set(i, i * 2, 0); g.add(c); } return g; }
  function almirah(open = true) { const g = G(M(RB(1.6, 2.6, .8, .05), metal(0x8a95a0, { roughness: .5 }), { pos: [0, 1.3, 0] })); if (open) { g.add(M(RB(1.45, 2.4, .05, .02), matte(0x3a3a42), { pos: [0, 1.3, .4] })); for (let i = 0; i < 3; i++) { const c = cash(4, .9); c.position.set(-.3 + (i % 2) * .5, .7 + i * .65, .2); g.add(c); }
      [-1, 1].forEach(d => g.add(M(RB(.75, 2.4, .06, .02), metal(0x8a95a0, { roughness: .5 }), { pos: [d * 1.15, 1.3, .7], rot: [0, d * -1.1, 0] }))); } return g; }
  function brochure() { return card(.7, .9, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffc44d'; x.fillRect(0, 0, w, h * .35); label(x, 'POLICY', w / 2, h * .2, h * .12, '#1d2442', 900); for (let i = 0; i < 5; i++) { x.fillStyle = '#c8ccd8'; x.fillRect(w * .1, h * (.45 + i * .1), w * .8, h * .04); } }, 0xffffff, .02); }
  function calendar(kind = 'ticks') { return card(1.0, 1.1, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#e2343c'; x.fillRect(0, 0, w, h * .22); label(x, kind === 'end' ? '30' : 'MAHINA', w / 2, h * .11, h * .14, '#fff', 900);
    for (let i = 0; i < 20; i++) { const X = w * (.1 + (i % 5) * .17), Y = h * (.32 + Math.floor(i / 5) * .16); if (kind === 'ticks') label(x, '✓', X + w * .06, Y + h * .05, h * .1, '#3cc85a', 900); else if (kind === 'missed' && i === 13) { x.fillStyle = '#ff4a5c'; x.fillRect(X, Y, w * .13, h * .11); } else { x.fillStyle = '#e6e9f2'; x.fillRect(X, Y, w * .13, h * .11); } } }); }
  function ringlight() { return G(M(new THREE.TorusGeometry(.6, .07, 12, 48), glowM(0xfff6e0, 1.6), { pos: [0, 2.6, 0] }), M(CYL(.03, .03, 2.6, 8), metal(0x3a3a42), { pos: [0, 1.3, 0] }), M(CYL(.4, .4, .05, 16), metal(0x3a3a42))); }
  function diya(s = 1) { const g = G(M(new THREE.SphereGeometry(.2, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), plastic(0xc8643c, { side: THREE.DoubleSide }), { scale: [1, .6, 1] })); const f = sprite(0xffa040, .7, .9); f.position.y = .15; g.add(f, M(SPH(.04, 10, 8), glowM(0xffb040, 3), { pos: [0, .1, 0], scale: [1, 1.8, 1] })); g.scale.setScalar(s); return g; }
  function moth() { return G(M(SPH(.05, 10, 8), matte(0x7a6a5a), { scale: [1, 1, 2] }), ...[-1, 1].map(d => M(new THREE.CircleGeometry(.12, 12), matte(0xa89a88, { side: THREE.DoubleSide }), { pos: [d * .1, 0, 0], rot: [Math.PI / 2, 0, d * .3] }))); }
  function pipeFlow() { const g = G(M(CYL(.18, .18, 3.2, 16), metal(0x9aa0a8), { pos: [0, 1.4, 0], rot: [0, 0, Math.PI / 2] }), M(RB(.8, .5, .1, .05), plastic(0xfff3d6), { pos: [-1.9, 1.4, 0] })); const pig = piggy(.9); pig.position.set(1.9, 0, 0); g.add(pig); return g; }

  // ---------- rooms ----------
  function room(look, kind, o = {}) {
    const L = LOOKS[look], extra = {
      cafe: { top: '#5a3a28', bottom: '#8a5a3a', floor: 0x6a4630 }, office: { top: '#2a3550', bottom: '#4a5a7a', floor: 0x5a5f6a }, night: { top: '#141a33', bottom: '#2a2f55', floor: 0x3a3550, keyI: 1.6, key: 0xffd9a0 },
      bank: { top: '#e8eef4', bottom: '#c8d4dc', floor: 0xc0c8d0 }, marine: { top: '#ffb070', bottom: '#ffd8a8', floor: 0xa89a88 }, city: { top: '#b8d8f0', bottom: '#f2dcc0', floor: 0xb0a898 },
      park: { top: '#a8dcff', bottom: '#e8f8d0', floor: 0x7ac05a }, studio: {}, village: { top: '#9fd8ff', bottom: '#ffe6b0', floor: 0xd8b07a }, street: { top: '#8fd3ff', bottom: '#ffe0b0', floor: 0xc8b08a },
      jeweller: { top: '#5a2a3a', bottom: '#a05a4a', floor: 0x8a4a3a, key: 0xffe0b0 }, shop: { top: '#e0f0ff', bottom: '#fff0d8', floor: 0xd8c8b0 }, classroom: { top: '#f2e8d0', bottom: '#e0d0b0', floor: 0xb89068 },
      police: { top: '#c8d4e0', bottom: '#a8b4c4', floor: 0x8a94a4 }, home: { top: '#f5d39b', bottom: '#e7b877', floor: 0xc4935f }, balcony: { top: '#ffcf9a', bottom: '#ffe8c8', floor: 0xd8c0a0 }, mall: { top: '#fff0f8', bottom: '#f0e0ff', floor: 0xe8e0f0 },
    }[kind] || {};
    const st = K.stage(Object.assign({}, L, look === 'flat' ? {} : extra, o, { shadowBox: 9 })), sc = st.scene, R = rng(kind.length * 13 + 1), wall = (c, z = -3.2) => sc.add(M(RB(18, 10, .4, .1), matte(c), { pos: [0, 5, z] }));
    const fl = look === 'flat';
    if (kind === 'cafe') { wall(fl ? 0xc8875a : 0x5a3a28); for (let i = 0; i < 4; i++) { const b = poster(1.4, 1.0, '#1d1d24', ['MENU', '☕ ₹120', '🥐 ₹90'], '#f2e6d0'); b.position.set(-3 + i * 2, 4.2, -2.95); sc.add(b); }
      for (let i = 0; i < 4; i++) { const lp = G(M(CYL(.01, .01, 2, 6), matte(0x1d1d24), { pos: [0, 1, 0] }), M(new THREE.SphereGeometry(.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), metal(0x2a2a2a), {}), M(SPH(.16, 14, 10), glowM(0xffd9a0, 3))); lp.position.set(-3 + i * 2, 5.6, -.5 - (i % 2)); sc.add(lp); }
      sc.add(M(RB(9, 1.3, 1.0, .08), plastic(0x8a5a3a), { pos: [0, .65, -2.3] })); }
    if (kind === 'office' || kind === 'night') { wall(fl ? 0x9aa8c8 : 0x3a4560); const win = card(4.2, 2.6, (x, w, h) => { x.fillStyle = kind === 'night' ? '#141a33' : '#2a3a66'; x.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(255,${200 + (i % 3) * 20},120,${.4 + (i % 5) * .1})`; x.fillRect((i * 97) % w, h * .3 + (i * 53) % (h * .7), 10, 14); } }, 0x2a2a30, .1); win.position.set(1.2, 3.8, -2.95); sc.add(win); }
    if (kind === 'home') { wall(fl ? 0xffd89a : 0xf2d0a0); const win = card(2.2, 2.2, (x, w, h) => { x.fillStyle = '#8fd3f4'; x.fillRect(0, 0, w, h); x.fillStyle = '#7a4a2a'; for (let i = 1; i < 5; i++) x.fillRect(i * w / 5 - 6, 0, 12, h); }, 0x7a4a2a, .12); win.position.set(-2.2, 3.4, -2.95); sc.add(win);
      const cl = calendar('blank'); cl.position.set(2.4, 3.6, -2.95); sc.add(cl); }
    if (kind === 'bank') { wall(0xf2f6fa); sc.add(M(RB(10, 1.3, 1.2, .08), plastic(0x3d6fd1), { pos: [0, .65, -2.0] }), M(RB(10, 1.1, .05, .02), plastic(0xffffff, { transparent: true, opacity: .3, depthWrite: false }), { pos: [0, 1.85, -1.5], shadow: false }));
      const sg = poster(3.4, .8, '#3d6fd1', ['BHARAT BANK'], '#ffffff'); sg.position.set(0, 3.9, -2.9); sc.add(sg); }
    if (kind === 'marine') { sc.add(M(new THREE.PlaneGeometry(80, 40), plastic(0x3a6a90, { roughness: .15 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, .02, -24] }));
      for (let i = 0; i < 20; i++) sc.add(M(RB(.9, .3, .1, .02), metal(0xb0b4bc), { pos: [-9 + i, .9, -1.6] })); for (let i = 0; i < 18; i++) sc.add(M(RB(1.5 + R() * 1.5, 3 + R() * 8, 1.5, .05), matte([0xd8c0a0, 0xc8a890, 0xe8d0b0][i % 3]), { pos: [-20 + i * 2.6, 2, -30] })); }
    if (kind === 'city') { for (let i = 0; i < 6; i++) { const d = i % 2 ? 1 : -1, z = -2 - Math.floor(i / 2) * 4; sc.add(M(RB(2.6, 6 + R() * 3, 3.2, .1), matte([0xd8c0a0, 0xc8b090, 0xe0d0b8][i % 3]), { pos: [d * 4.6, 4, z] })); }
      sc.add(G(M(RB(1.2, 9, 1.2, .05), matte(0xc8a878), { pos: [0, 4.5, -22] }), M(CYL(.5, .5, .1, 24), plastic(0xffffff), { pos: [0, 7.6, -21.35], rot: [Math.PI / 2, 0, 0] }), M(new THREE.ConeGeometry(.95, 2.2, 4), matte(0x5a6a5a), { pos: [0, 10.1, -22], rot: [0, Math.PI / 4, 0] })));
      const bs = bus(); bs.position.set(2.2, 0, -6); bs.rotation.y = -.4; sc.add(bs); [-2.6, 2.8].forEach(x => sc.add(G(M(CYL(.06, .08, 3.4, 10), metal(0x2a2a2a), { pos: [x, 1.7, -1.2] }), M(SPH(.18, 12, 10), glowM(0xffe0a0, 1.2), { pos: [x, 3.5, -1.2] })))); }
    if (kind === 'park') { for (let i = 0; i < 7; i++) sc.add(K.tree(-6 + i * 2 + R(), -3 - R() * 4, 1.4 + R() * .6)); sc.add(G(M(RB(2.2, .12, .6, .03), plastic(0x8a5a3a), { pos: [0, .7, 0] }), M(RB(2.2, .6, .1, .03), plastic(0x8a5a3a), { pos: [0, 1.05, -.28] })).translateX(-2.5).translateZ(-1.5)); }
    if (kind === 'balcony') { for (let i = 0; i < 16; i++) sc.add(M(CYL(.04, .04, 1.1, 8), metal(0xf2f2f2), { pos: [-6 + i * .8, .55, 1.6] })); sc.add(M(RB(13, .08, .1, .02), metal(0xf2f2f2), { pos: [0, 1.1, 1.6] }));
      for (let i = 0; i < 14; i++) sc.add(M(RB(1.4, 3 + R() * 6, 1.4, .05), matte([0xe8d0b0, 0xd8c0a0, 0xf0e0c8][i % 3]), { pos: [-16 + i * 2.4, 1.5, -18] })); [-2.4, 2.6].forEach(x => { const pl = K.tree(x, -.8, .8, 0x4aa85a); sc.add(pl); }); }
    if (kind === 'street' || kind === 'village') { const cols = [0xf2a65a, 0xf7d06b, 0x8fc5a3, 0xe98b8b, 0xb9a3e3, 0x7fb7d6];
      for (let i = 0; i < 5; i++) { const x = -6 + i * 3; sc.add(M(RB(2.9, 4.5 + R() * 1.5, 1.5, .08), matte(kind === 'village' ? 0xd9a066 : cols[i]), { pos: [x, 2.4, -3.5] }));
        if (kind === 'street') { const sh = poster(2.4, .6, ['#ffd23f', '#ffffff', '#e63946', '#3aa76d', '#5fb8ec'][i], [['KIRANA', 'MOBILE', 'CHAI', 'XEROX', 'SWEETS'][i]], i === 2 ? '#fff' : '#1d1d24'); sh.position.set(x, 3.3, -2.7); sc.add(sh); sc.add(M(RB(2.4, 1.8, .06, .02), matte(0x5a4a3a), { pos: [x, 1.0, -2.73] })); } }
      [-5, 5].forEach(x => sc.add(M(CYL(.08, .1, 6, 8), metal(0x8a8f99), { pos: [x, 3, -2.4] })));
      if (kind === 'village') { const cp = G(M(RB(2.2, .12, 1.1, .04), plastic(0xf0d9a8), { pos: [0, .6, 0] }), ...[-1, 1].flatMap(a => [-1, 1].map(b => M(RB(.1, .6, .1, .02), plastic(0x8a5a30), { pos: [a * 1.0, .3, b * .45] })))); cp.position.set(-3, 0, -1.2); sc.add(cp); } }
    if (kind === 'jeweller') { wall(fl ? 0xb85a6a : 0x6a2a3a); for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { const n = necklace(.6); n.position.set(-3 + i * 1.5, 3.4 + r * 1.3, -2.9); sc.add(n); }
      sc.add(M(RB(9, 1.3, 1.1, .08), plastic(0x7a3a2a), { pos: [0, .65, -1.6] }), M(RB(9, .5, 1.1, .05), plastic(0xffffff, { transparent: true, opacity: .25, depthWrite: false }), { pos: [0, 1.55, -1.6], shadow: false }));
      for (let i = 0; i < 6; i++) sc.add(M(new THREE.TorusGeometry(.15, .03, 8, 24), metal(0xffc44d), { pos: [-2.5 + i, 1.4, -1.6], rot: [Math.PI / 2, 0, 0] })); for (let i = 0; i < 3; i++) { const d = diya(); d.position.set(-1.5 + i * 1.5, 1.32, -1.3); sc.add(d); } }
    if (kind === 'shop') { wall(fl ? 0x8fd3ff : 0xe8f0f8); for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const ph = phone(['chart', 'grid', 'video', 'chat'][(i + r) % 4], 1.3); ph.position.set(-3.2 + i * 1.3, 3.0 + r * 1.3, -2.9); sc.add(ph); }
      sc.add(M(RB(9, 1.3, 1.1, .08), plastic(0x2a2f45), { pos: [0, .65, -1.6] }), M(RB(9, .5, 1.1, .05), plastic(0xffffff, { transparent: true, opacity: .25, depthWrite: false }), { pos: [0, 1.55, -1.6], shadow: false })); }
    if (kind === 'classroom') { wall(fl ? 0xfff0c8 : 0xf2e2c0); const cb = chalkboard(o.board); cb.position.set(0, 3.6, -2.9); sc.add(cb); }
    if (kind === 'police') { wall(0xa8b8c8); const sg = poster(3.6, .8, '#1d3fa8', ['POLICE STATION'], '#ffffff'); sg.position.set(0, 4.8, -2.9); sc.add(sg); }
    if (kind === 'mall') { wall(0xfff6fb); for (let i = 0; i < 4; i++) { sc.add(M(RB(2.2, 2.6, .1, .05), plastic(0xd8f0ff, { roughness: .1 }), { pos: [-3.6 + i * 2.4, 2.0, -2.9] })); const sg = poster(2.0, .45, ['#ff4fa3', '#3d7bff', '#ffb020', '#3aa76d'][i], ['SALE 50%'], '#fff'); sg.position.set(-3.6 + i * 2.4, 3.6, -2.8); sc.add(sg); } }
    if (kind === 'studio') { /* clean backdrop for concept shots */ }
    return st;
  }

  // ---------- prop factory ----------
  function prop(look, [kind, x = 0, y = 0, z = 0, s = 1, ry = 0, arg]) {
    let g;
    switch (kind) {
      case 'table': g = B.table(1.6, 1.0, look === 'faceless' ? 0x8a5a3a : 0xd8a878); g.scale.y = .8; break;
      case 'desk': g = B.table(2.6, 1.2, 0x8a6a4a); break;
      case 'chair': g = B.chair(arg ?? (look === 'faceless' ? 0x5a3a28 : 0x9b7bff)); break;
      case 'sofa': g = G(M(RB(2.6, .5, 1.0, .2), plastic(arg ?? 0x7a5aa0), { pos: [0, .5, 0] }), M(RB(2.6, .9, .3, .15), plastic(arg ?? 0x7a5aa0), { pos: [0, 1.0, -.4] })); break;
      case 'cup': g = cup(); break;
      case 'phone': g = phone(arg); break;
      case 'cointree': g = coinTree(); break;
      case 'hourglass': g = hourglass(); break;
      case 'piggy': g = piggy(); break;
      case 'cash': g = cash(arg ?? 5); break;
      case 'card': g = credit(arg ?? 0x2a2f80); break;
      case 'house': g = house(); break;
      case 'key': g = bigKey(); break;
      case 'gauge': g = gaugeDial(); break;
      case 'pyramid': g = pyramid(look); break;
      case 'umbrella': g = umbrella(); break;
      case 'snail': g = snail(); break;
      case 'jar': g = jar(arg); break;
      case 'laptop': g = laptop(arg); break;
      case 'calc': g = calc(); break;
      case 'necklace': g = necklace(); break;
      case 'shutter': g = shutter(arg !== false); break;
      case 'scooter': g = scooter(arg); break;
      case 'bags': g = shopBags(arg ?? 3); break;
      case 'food': g = foodBags(arg ?? 3); break;
      case 'envelopes': g = envelopes(); break;
      case 'scale': g = scale2(); break;
      case 'net': g = net(); break;
      case 'almirah': g = almirah(); break;
      case 'brochure': g = brochure(); break;
      case 'calendar': g = calendar(arg); break;
      case 'ringlight': g = ringlight(); break;
      case 'diya': g = diya(); break;
      case 'pipe': g = pipeFlow(); break;
      case 'board': g = chalkboard(arg); break;
      case 'poster': g = poster(arg[0], arg[1], arg[2], arg[3], arg[4]); break;
      case 'tree': g = K.tree(0, 0, 1.4); break;
      case 'charpai': g = G(M(RB(2.2, .12, 1.1, .04), plastic(0xf0d9a8), { pos: [0, .6, 0] }), ...[-1, 1].flatMap(a => [-1, 1].map(b => M(RB(.1, .6, .1, .02), plastic(0x8a5a30), { pos: [a * 1.0, .3, b * .45] })))); break;
      case 'papers': g = new THREE.Group(); for (let i = 0; i < (arg ?? 6); i++) g.add(paper().translateY(.01 + i * .02).rotateY(i * .3)); g.children.forEach(c => c.rotation.x = -Math.PI / 2); break;
      case 'plant': g = G(M(CYL(.3, .22, .45, 20), plastic(0xc8643c), { pos: [0, .22, 0] }), M(SPH(.45, 18, 14), plastic(0x4aa85a), { pos: [0, .75, 0] })); break;
      case 'counter': g = G(M(RB(arg ?? 3, 1.3, 1.0, .08), plastic(0x8a5a3a), { pos: [0, .65, 0] })); break;
      default: g = new THREE.Group();
    }
    g.position.set(x, y, z); g.scale.multiplyScalar(s); g.rotation.y = ry; g.userData.kind = kind; return g;
  }

  // ---------- the shot ----------
  const _w = new THREE.Vector3();
  BUILD.pt = (p) => {
    const look = p.look || 'toon', st = room(look, p.room || 'studio', p.roomOpt || {}), sc = st.scene, chars = p.chars || {};
    const cast = (p.cast || []).map(([id, x, z, ry, pose, o = {}]) => { const a = actor(look, chars[id] || {}); a.position.set(x, o.y ?? 0, z); a.rotation.y = ry ?? 0; sc.add(a);
      const held = o.hold ? prop(look, [o.hold, 0, 0, 0, o.holdS ?? .8, 0, o.holdArg]) : null; if (held) sc.add(held); return { id, a, pose, o, held, x0: x, z0: z }; });
    const props = (p.props || []).map(d => { const g = prop(look, d); sc.add(g); return g; });
    const flying = []; if (p.fly) { const R = rng(11); for (let i = 0; i < 18; i++) { const n = p.fly === 'bills' ? paper(0xffffff) : p.fly === 'coins' ? coin(.12) : note(); sc.add(n); flying.push([n, R(), R(), R()]); } }
    if (p.moth) { const m = moth(); sc.add(m); flying.push([m, -1]); }
    if (look === 'flat') flatten(sc, p.bg ?? '#9ad8ff');
    const cam = p.cam || [[0, 3.2, 9], [0, 1.9, 0]], mv = p.move || 'push';
    return { ...st, update(t, s, d) {
      const talkEnd = d - (p.last ? 2.2 : .35);
      cast.forEach(({ id, a, pose, o, held }, i) => { const k = ease(seg(s, 0, .6)), talk = (id === p.speaker || id.startsWith(p.speaker + '_')) && s > .05 && s < talkEnd;
        const base = (POSE[pose] || POSE.idle)(s + i * .7, k); if (o.walk) { const u = clamp(s / Math.max(1, d - .5)); a.position.x = lerp(o.walk[0], o.walk[1], u); a.position.z = lerp(o.walk[2] ?? a.position.z, o.walk[3] ?? a.position.z, u); base.walk = s * 5.5; }
        const mouth = talk ? (.25 + .6 * Math.abs(Math.sin(s * 12.5 + i))) : base.mouth;
        const tk = talk && !base.handR && look !== 'faceless' ? POSE.talk(s) : {};
        const nod = talk && look === 'faceless' ? { headNod: (base.headNod ?? 0) + Math.sin(s * 5) * .05, headTilt: (base.headTilt ?? 0) + Math.sin(s * 2.3) * .06 } : {};
        a.pose({ s: s + i * 1.3, seed: i * .3, ...tk, ...base, ...nod, mouth });
        if (held) { a.userData.arms[1].userData.el.children[1].getWorldPosition(_w); held.position.copy(_w).add(V(0, o.holdY ?? .1, .05)); held.rotation.y = a.rotation.y + (o.holdRy ?? 0); } });
      props.forEach((g, i) => { const kd = g.userData.kind; if (kd === 'cointree') g.scale.setScalar((p.props[i][4] ?? 1) * (.55 + .45 * ease(seg(t, 0, .8))));
        if (kd === 'hourglass') g.userData.set(ease(t)); if (kd === 'cash' && p.shrink) g.scale.setScalar((p.props[i][4] ?? 1) * (1 - .6 * ease(seg(t, .15, .85)))); if (kd === 'gauge') g.userData.set(lerp(p.gaugeFrom ?? .1, p.gaugeTo ?? .3, ease(seg(t, .1, .8))));
        if (kd === 'piggy' && p.coinDrop) g.rotation.z = Math.sin(s * 6) * .04; if (kd === 'snail') g.position.x = p.props[i][1] + s * .12;
        if (kd === 'umbrella') g.rotation.z = Math.sin(s * 1.4) * .04; if (kd === 'scale') g.rotation.z = Math.sin(s * 1.2) * .03; });
      flying.forEach(([n, a0, b0, c0]) => { if (a0 < 0) { n.position.set(Math.sin(s * 2) * .6 + (p.mothAt?.[0] ?? 0), 2.2 + Math.sin(s * 3) * .3, p.mothAt?.[2] ?? .8); n.rotation.y = s * 4; return; }
        const u = frac(s * (.25 + b0 * .2) + a0); n.position.set((a0 - .5) * 6, p.fly === 'coins' ? 6 - u * 7 : .5 + u * 5, (c0 - .5) * 2 + .5); n.rotation.set(s * 2 + a0 * 6, s * 3 + b0 * 6, s * (1 + c0)); });
      const k = ease(t), [pos, at] = cam; let P = pos.slice(), A = at.slice();
      if (mv === 'push') P = P.map((v, j) => lerp(v, A[j], .14 * k)); else if (mv === 'pull') P = P.map((v, j) => lerp(v, A[j], .14 * (1 - k))); else if (mv === 'pan') { P[0] += lerp(-.8, .8, k); A[0] += lerp(-.5, .5, k); } else if (mv === 'rise') { P[1] += lerp(-.6, .6, k); A[1] += lerp(-.4, .3, k); }
      shoot(st, P, A); } };
  };

  // ---------- 2D overlay: series tag, speaker pill and money sticker (drawn after the captions) ----------
  const cv = document.getElementById('cv'), c = cv.getContext('2d'), F = (w, s) => `${w} ${s}px Inter, "Noto Color Emoji", sans-serif`;
  const backE = k => { k = clamp(k); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
  window.OVERLAY2 = (L, T) => { const p = L.p || {}, E = window.EP || {}, s = T - L.start;
    c.save(); c.font = F(900, 30); const tg = `PAISA TOONS · #${String(E.num ?? 0).padStart(2, '0')}`, tw = c.measureText(tg).width + 44;
    c.fillStyle = '#ffd23f'; c.beginPath(); c.roundRect(50, 110, tw, 56, 28); c.fill(); c.fillStyle = '#1d1410'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(tg, 72, 140);
    if (E.title) { c.font = F(900, 52); let fs = 52; while (c.measureText(E.title).width > 980 && fs > 30) { fs -= 2; c.font = F(900, fs); } c.lineJoin = 'round'; c.lineWidth = 10; c.strokeStyle = 'rgba(0,0,0,.75)'; c.strokeText(E.title, 52, 214); c.fillStyle = '#fff'; c.fillText(E.title, 52, 214); }
    const nm = (E.cast || {})[p.speaker]; if (nm && L.cap && T >= L.cap[0] && T <= L.cap[1] + .15) { c.font = F(900, 34); const w = c.measureText(nm).width + 44; c.fillStyle = p.speaker === 'N' ? 'rgba(20,16,12,.8)' : '#e63946'; c.beginPath(); c.roundRect(W2 - w / 2, 1418, w, 54, 27); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(nm, W2, 1446); }
    if (p.stat) { const k = backE((s - .3) / .45); if (k > 0) { const [v, l] = p.stat; c.translate(W2, 1180); c.rotate(-.04); c.scale(k, k); c.font = F(900, 110); let fs = 110; while (c.measureText(v).width > 800 && fs > 50) { fs -= 4; c.font = F(900, fs); }
        const w = Math.max(520, c.measureText(v).width + 110); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(-w / 2 + 10, -120, w, 250, 30); c.fill(); c.fillStyle = '#ffe066'; c.beginPath(); c.roundRect(-w / 2, -130, w, 250, 30); c.fill(); c.lineWidth = 7; c.strokeStyle = '#1d1410'; c.stroke();
        c.fillStyle = '#1d1410'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(v, 0, -30); c.fillStyle = '#e63946'; c.beginPath(); c.roundRect(-w / 2 + 34, 40, w - 68, 56, 28); c.fill(); c.font = F(900, 30); c.fillStyle = '#fff'; c.fillText(l.toUpperCase(), 0, 70); } }
    c.restore();
    if (E.note && L === window.TL[window.TL.length - 1]) { c.save(); c.font = F(700, 24); c.textAlign = 'center'; c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = 'rgba(0,0,0,.7)'; c.lineWidth = 5; c.strokeText(E.note, W2, 1880); c.fillText(E.note, W2, 1880); c.restore(); } };
  const W2 = 540;
}
