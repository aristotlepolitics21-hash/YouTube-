// History kit for the Weird History of Medicine shorts (cartoon 3D cut): period costumes, rooms and props,
// built on the Body Shorts person. Episode files call hist(K) and add their sets to K.BUILD.
import { body } from './common.js';

export function hist(K) {
  if (hist.done) return hist.done;
  const { THREE, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, textSign, sign, label, ctex, clamp, lerp, frac, V, rng } = K;
  const B = body(K), { set, skinM, cloth, makePerson } = B;

  // ---------- costumes: dress(person, ...kinds) adds pieces to a person (head pieces ride on the head) ----------
  function dress(p, ...kinds) { const h = p.userData.head;
    kinds.forEach(k => {
      if (k === 'tophat') h.add(G(M(new THREE.CylinderGeometry(.5, .5, .7, 32), cloth(0x1d1d24), { pos: [0, .85, 0] }), M(new THREE.CylinderGeometry(.8, .8, .05, 32), cloth(0x1d1d24), { pos: [0, .52, 0] })));
      if (k === 'tricorn') h.add(G(M(new THREE.CylinderGeometry(.5, .6, .35, 24), cloth(0x1d1d24), { pos: [0, .62, 0] }), M(new THREE.CylinderGeometry(.85, .85, .14, 3), cloth(0x1d1d24), { pos: [0, .55, 0], rot: [0, Math.PI, 0] })));
      if (k === 'wig') { const w = cloth(0xeeeae2); [-1, 1].forEach(d => [0, 1].forEach(i => h.add(M(new THREE.TorusGeometry(.1, .06, 10, 20), w, { pos: [d * .62, -.05 - i * .16, -.05], rot: [0, Math.PI / 2, 0] })))); h.add(M(SPH(.67, 40, 24, 0, Math.PI * 2, 0, 1.25), w, { rot: [-.3, 0, 0] })); }
      if (k === 'ruff') p.add(M(new THREE.TorusGeometry(.32, .12, 12, 28), cloth(0xffffff), { pos: [0, 2.1, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, .6] }));
      if (k === 'beard') h.add(M(SPH(.3, 24, 16), cloth(p.userData.hairCol ?? 0x5a3b22), { pos: [0, -.52, .3], scale: [.95, .75, .6] }));
      if (k === 'greybeard') h.add(M(SPH(.34, 24, 16), cloth(0xd8d8de), { pos: [0, -.58, .28], scale: [1, 1.05, .6] }));
      if (k === 'bonnet') h.add(M(SPH(.7, 32, 20, 0, Math.PI * 2, 0, 1.15), cloth(0xf4f0e6), { rot: [-.85, 0, 0] }));
      if (k === 'headband') h.add(M(new THREE.TorusGeometry(.63, .07, 10, 40), cloth(0xf4f0e6), { pos: [0, .25, 0], rot: [Math.PI / 2 - .2, 0, 0] }));
      if (k === 'scrubcap') h.add(M(SPH(.69, 32, 20, 0, Math.PI * 2, 0, .85), cloth(0x5b8cff), { rot: [-.65, 0, 0] }));
      if (k === 'mask') h.add(M(RB(.5, .3, .1, .05), cloth(0x9fd0e6), { pos: [0, -.25, .56] }));
      if (k === 'coat') p.add(M(new THREE.ConeGeometry(.16, .3, 16), cloth(0xffffff), { pos: [0, 1.95, .36], rot: [Math.PI + .3, 0, 0] }));
      if (k === 'apron') p.add(M(RB(.7, 1.0, .05, .03), cloth(0xffffff), { pos: [0, 1.2, .42] }));
      if (k === 'toga') p.add(M(new THREE.CylinderGeometry(.5, .75, 1.8, 24), cloth(0xf4f0e6), { pos: [0, 1.15, 0], rot: [0, 0, .08] }));
      if (k === 'furs') p.add(M(B.lumpy(.62, .12, 10, matte(0x8a5a3c, { roughness: 1 }), 3, 32).geometry, matte(0x8a5a3c, { roughness: 1 }), { pos: [0, 1.6, 0], scale: [1, .9, .8] }));
      if (k === 'plague') { h.add(M(new THREE.ConeGeometry(.22, .9, 24), cloth(0xf2ede2), { pos: [0, -.12, .95], rot: [Math.PI / 2, 0, 0] }), G(M(new THREE.CylinderGeometry(.5, .55, .5, 32), cloth(0x1d1d24), { pos: [0, .8, 0] }), M(new THREE.CylinderGeometry(1.0, 1.0, .05, 32), cloth(0x1d1d24), { pos: [0, .55, 0] })));
        [-1, 1].forEach(d => h.add(M(SPH(.13, 16, 12), glowM(0xffcf6a, .5), { pos: [d * .22, .1, .58] }))); p.add(M(new THREE.CylinderGeometry(.6, 1.0, 2.2, 24), cloth(0x1d1d24), { pos: [0, 1.0, 0] })); }
    }); return p; }
  // a person with costume in one call. o: person options, kinds: costume list
  const who = (o, ...kinds) => { if (kinds.includes('coat') && o.coat !== undefined) o = { ...o, shirt: o.coat }; const p = makePerson(o); p.userData.hairCol = o.hair; p.userData.coatCol = o.coat; return dress(p, ...kinds); };

  // ---------- rooms: a back wall and floor with period dressing ----------
  const ROOMS = {
    candle: { top: '#2a1a12', bottom: '#5a3a26', floor: 0x4a3020, hemi: .7, keyI: 1.6, key: 0xffd6a0 },
    apothecary: { top: '#3a2a1a', bottom: '#7a5a36', floor: 0x5a4028, hemi: .8, key: 0xffe0b0 },
    street: { top: '#7a8090', bottom: '#b0b4bc', floor: 0x8a8a90, fogColor: '#9aa0aa', fogNear: 8, fogFar: 26 },
    tomb: { top: '#3a2a10', bottom: '#8a6a30', floor: 0x9a7a40, hemi: .7, key: 0xffc070 },
    lab: { top: '#dfe8f0', bottom: '#b8c8d6', floor: 0xaebfcc },
    ward: { top: '#e8e2d0', bottom: '#c8c0a8', floor: 0xb0a890 },
    theatre: { top: '#4a3a2a', bottom: '#9a7a56', floor: 0x7a5a3a, hemi: .8, key: 0xffe0b0 },
    barber: { top: '#f2e2c8', bottom: '#d8b88a', floor: 0xc0a070 },
    west: { top: '#ffcf8a', bottom: '#e8a060', floor: 0xd8a070 },
    cottage: { top: '#d8e8c8', bottom: '#f0d8a8', floor: 0xb89868 },
    court: { top: '#6a3a5a', bottom: '#c08a6a', floor: 0x9a6a4a, hemi: .9 },
    cell: { top: '#2a2a32', bottom: '#5a5a66', floor: 0x4a4a52, hemi: .6, keyI: 1.4 },
    clinic: { top: '#e4f4ff', bottom: '#cfe7f2', floor: 0xbfdbe6 },
    river: { top: '#ffd8b0', bottom: '#a8c0d0', floor: 0x7a9a6a },
    greek: { top: '#8fc8ff', bottom: '#f4ecd8', floor: 0xe8dcc4 },
    night: { top: '#111833', bottom: '#33295e', floor: 0x2f2858, hemi: .8 },
  };
  function room(kind, o = {}) { const st = set('day', Object.assign({}, ROOMS[kind] || {}, o)), sc = st.scene, R = rng(kind.length * 7);
    const wallCol = { candle: 0x5a3a28, apothecary: 0x6a4a2e, tomb: 0xb08a50, lab: 0xeef2f6, ward: 0xe8e0c8, theatre: 0x6a4a30, barber: 0xf0dcc0, cottage: 0xe8d8b0, court: 0x8a4a6a, cell: 0x5a5a64, clinic: 0xf2f8fc }[kind];
    if (wallCol !== undefined) sc.add(M(RB(14, 9, .4, .1), matte(wallCol), { pos: [0, 4.5, -3.2] }));
    if (kind === 'apothecary') for (let r = 0; r < 3; r++) { sc.add(M(RB(6, .12, .6, .03), plastic(0x6a4422), { pos: [0, 2.2 + r * 1.0, -2.8] })); for (let i = 0; i < 9; i++) sc.add(M(new THREE.CylinderGeometry(.14, .14, .4 + R() * .3, 16), plastic([0x3fa9ff, 0x7ad94a, 0xb18cff, 0xffb020, 0xe2475a][i % 5], { transparent: true, opacity: .8 }), { pos: [-2.6 + i * .65, 2.5 + r * 1.0, -2.75] })); }
    if (kind === 'candle' || kind === 'theatre' || kind === 'cell') [-1, 1].forEach(d => { const cd = candle(1.4); cd.position.set(d * 2.4, 2.6, -2.9); sc.add(cd); });
    if (kind === 'street') for (let i = 0; i < 6; i++) { const d = i % 2 ? 1 : -1, z = -1 - Math.floor(i / 2) * 3; sc.add(M(RB(2, 4 + R() * 2, 2.6, .1), matte([0xc8b090, 0xa89070, 0xd0c0a0][i % 3]), { pos: [d * 3.2, 2.5, z] })); }
    if (kind === 'tomb') for (let i = 0; i < 4; i++) sc.add(M(RB(.8, 6, .8, .05), matte(0xc8a060), { pos: [-3 + i * 2, 3, -2.6] }));
    if (kind === 'theatre') for (let i = 0; i < 3; i++) sc.add(M(RB(10, .3, 1.0, .05), plastic(0x7a5232), { pos: [0, .6 + i * .9, -1.6 - i * 1.0] }));
    if (kind === 'greek') [-1, 1].forEach(d => sc.add(M(new THREE.CylinderGeometry(.4, .45, 7, 24), matte(0xf4ecd8), { pos: [d * 2.4, 3.5, -1.5] })));
    if (kind === 'west') for (let i = 0; i < 3; i++) sc.add(M(RB(2.6, 3 + i * .4, 2, .05), matte(0xb07848), { pos: [-3.5 + i * 3.5, 1.6, -4] }));
    if (kind === 'river') sc.add(M(new THREE.PlaneGeometry(20, 6), plastic(0x4a7aa0, { roughness: .1 }), { rot: [-Math.PI / 2, 0, 0], pos: [0, .02, -4] }));
    if (kind === 'cell') for (let i = 0; i < 7; i++) sc.add(M(new THREE.CylinderGeometry(.05, .05, 4, 8), metal(0x6a6a72), { pos: [-1.8 + i * .6, 2, 1.8] }));
    return st; }

  // ---------- props ----------
  function candle(s = 1) { const g = G(M(new THREE.CylinderGeometry(.08, .08, .5, 16), plastic(0xfff3d6), { pos: [0, .25, 0] }), M(SPH(.06, 12, 8), glowM(0xffb040, 3), { pos: [0, .56, 0], scale: [1, 1.6, 1], shadow: false }), M(new THREE.CylinderGeometry(.14, .16, .06, 16), metal(0xc8a050), {}));
    const fl = sprite(0xffb040, .8, .7); fl.position.y = .58; g.add(fl); g.scale.setScalar(s); return g; }
  const bowl = (s = 1) => { const m = M(new THREE.SphereGeometry(.4, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), metal(0xd4a440, { side: THREE.DoubleSide }), { scale: [1, .6, 1] }); m.scale.multiplyScalar(s); return m; };
  function bottle(col = 0x8a5a2a, s = 1, glow = 0) { const g = G(M(new THREE.CylinderGeometry(.18, .2, .55, 24), glow ? glowM(col, glow) : plastic(col, { transparent: true, opacity: .85, roughness: .05 }), { pos: [0, .28, 0] }), M(new THREE.CylinderGeometry(.07, .1, .2, 16), plastic(col, { transparent: true, opacity: .85 }), { pos: [0, .65, 0] }), M(new THREE.CylinderGeometry(.06, .06, .08, 12), matte(0xc8a070), { pos: [0, .78, 0] }));
    g.add(M(RB(.3, .2, .02, .01), matte(0xfff3d6), { pos: [0, .3, .2] })); g.scale.setScalar(s); return g; }
  function jar2(fill = 0x9fd8c8) { return G(M(new THREE.CylinderGeometry(.5, .5, 1.1, 32, 1, true), plastic(0xffffff, { transparent: true, opacity: .25, roughness: .02, side: THREE.DoubleSide, depthWrite: false }), { pos: [0, .55, 0], shadow: false }),
    M(new THREE.CylinderGeometry(.48, .48, .9, 32), plastic(fill, { transparent: true, opacity: .45 }), { pos: [0, .47, 0], shadow: false }), M(new THREE.CylinderGeometry(.52, .52, .1, 32), metal(0x9a9aa2), { pos: [0, 1.12, 0] })); }
  function leech(s = 1) { const g = G(M(new THREE.CapsuleGeometry(.12, .45, 8, 16), plastic(0x2a2a1e, { roughness: .2, clearcoat: 1 }), { rot: [0, 0, Math.PI / 2] })); [-1, 1].forEach(d => g.add(M(SPH(.03, 8, 6), plastic(0xffffff), { pos: [.3, .06, d * .06] }))); g.wiggle = t => { g.children[0].scale.set(1 + Math.sin(t * 6) * .12, 1 - Math.sin(t * 6) * .08, 1); }; g.scale.setScalar(s); return g; }
  function skull(s = 1, hole = true) { const bm = plastic(0xf0e6cc, { roughness: .55 }), g = G(M(SPH(.5, 40, 28), bm, { scale: [1, 1, 1.1] }), M(RB(.6, .35, .55, .12), bm, { pos: [0, -.42, .15] }));
    [-1, 1].forEach(d => g.add(M(SPH(.13, 16, 12), matte(0x2a1e14), { pos: [d * .19, -.08, .45], scale: [1, 1.1, .4] }))); g.add(M(new THREE.ConeGeometry(.06, .14, 3), matte(0x2a1e14), { pos: [0, -.25, .52], rot: [Math.PI, 0, 0] }));
    for (let i = 0; i < 6; i++) g.add(M(RB(.07, .1, .05, .02), plastic(0xfaf3e0), { pos: [-.17 + i * .07, -.5, .43] })); if (hole) { const h = M(new THREE.CircleGeometry(.11, 24), matte(0x1a120a), { pos: [0, .5, .1], rot: [-Math.PI / 2 + .2, 0, 0] }); g.add(h); g.userData.hole = h; }
    g.scale.setScalar(s); return g; }
  function drill() { return G(M(new THREE.CylinderGeometry(.03, .03, 1.0, 10), metal(0x8a8a92), { pos: [0, .5, 0] }), M(RB(.4, .06, .06, .02), metal(0x8a8a92), { pos: [.2, .75, 0] }), M(new THREE.CylinderGeometry(.06, .06, .2, 12), plastic(0x6a4422), { pos: [.4, .85, 0] }), M(SPH(.1, 16, 12), plastic(0x6a4422), { pos: [0, 1.05, 0] }), M(new THREE.ConeGeometry(.04, .12, 10), metal(0x8a8a92), { pos: [0, -.04, 0], rot: [Math.PI, 0, 0] })); }
  function lancet() { return G(M(RB(.04, .5, .02, .01), metal(0xe6eaf2), { pos: [0, .25, 0] }), M(RB(.08, .4, .05, .02), plastic(0x6a4422), { pos: [0, -.15, 0] })); }
  // canopy bed with posts and curtains
  function canopyBed() { const g = B.bed(); [-1, 1].forEach(a => [-1, 1].forEach(b => g.add(M(new THREE.CylinderGeometry(.06, .06, 3.4, 12), plastic(0x6a3a22), { pos: [a * 1.05, 1.7, b * 1.95] }))));
    g.add(M(RB(2.3, .15, 4.1, .05), plastic(0x6a3a22), { pos: [0, 3.4, 0] }), M(RB(.05, 2.4, 3.9, .02), cloth(0x8a2a3a), { pos: [-1.08, 2.2, 0] })); return g; }
  function sarcophagus() { return G(M(RB(1.4, 1.0, 3.2, .2), plastic(0xd4a440, { roughness: .4 }), { pos: [0, .5, 0] }), M(RB(1.3, .25, 3.1, .15), plastic(0x3a6ab0), { pos: [0, 1.05, 0] })); }
  function mummy() { const g = G(M(new THREE.CapsuleGeometry(.38, 2.2, 10, 24), matte(0xe8dcbc, { roughness: 1 }), { rot: [Math.PI / 2, 0, 0] })); for (let i = 0; i < 8; i++) g.add(M(new THREE.TorusGeometry(.4, .025, 6, 24), matte(0xd8c8a0), { pos: [0, 0, -1.2 + i * .34], rot: [0, 0, 0] })); return g; }
  function mortar() { return G(M(new THREE.CylinderGeometry(.45, .3, .5, 24, 1, true), plastic(0xa8a8a0, { side: THREE.DoubleSide }), { pos: [0, .25, 0] }), M(new THREE.CylinderGeometry(.42, .42, .05, 24), matte(0x6a4a2a), { pos: [0, .35, 0] })); }
  function goblet(col = 0x6a1a2a) { return G(M(new THREE.CylinderGeometry(.22, .08, .4, 20), metal(0xd4a440), { pos: [0, .55, 0] }), M(new THREE.CylinderGeometry(.04, .04, .3, 10), metal(0xd4a440), { pos: [0, .2, 0] }), M(new THREE.CylinderGeometry(.16, .16, .04, 20), metal(0xd4a440)), M(new THREE.CylinderGeometry(.2, .2, .04, 20), plastic(col), { pos: [0, .72, 0] })); }
  function ironLung() { return G(M(new THREE.CylinderGeometry(.9, .9, 2.8, 40), plastic(0xd8c060, { roughness: .4 }), { rot: [0, 0, Math.PI / 2], pos: [.4, 1.1, 0] }), M(new THREE.CylinderGeometry(.95, .95, .12, 40), metal(0xa8a8b0), { rot: [0, 0, Math.PI / 2], pos: [-1.0, 1.1, 0] }),
    ...[-1, 1].map(d => M(new THREE.CylinderGeometry(.06, .06, .7, 10), metal(0x8a8a92), { pos: [.4 + d * .9, .35, 0] })), ...[0, 1, 2].map(i => M(new THREE.CircleGeometry(.12, 20), plastic(0x9fd8ff, { transparent: true, opacity: .6 }), { pos: [-.2 + i * .6, 1.4, .88] }))); }
  function barberPole() { const t = ctex(256, 1024, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); for (let i = -4; i < 12; i++) { x.fillStyle = i % 2 ? '#e2343c' : '#2a5ad8'; x.beginPath(); x.moveTo(0, i * 120); x.lineTo(w, i * 120 + 160); x.lineTo(w, i * 120 + 200); x.lineTo(0, i * 120 + 40); x.fill(); } });
    t.tex.wrapS = t.tex.wrapT = THREE.RepeatWrapping; const pole = M(new THREE.CylinderGeometry(.3, .3, 2.6, 32), new THREE.MeshPhysicalMaterial({ map: t.tex, roughness: .2, clearcoat: 1 }));
    const g = G(pole, M(SPH(.32, 24, 16), metal(0xd4a440), { pos: [0, 1.4, 0] }), M(SPH(.32, 24, 16), metal(0xd4a440), { pos: [0, -1.4, 0] })); g.spin = s => t.tex.offset.y = -s * .3; return g; }
  function molecule(col = 0xb18cff) { return G(M(SPH(.12, 16, 12), glowM(col, 1.4)), M(SPH(.08, 12, 8), glowM(col, 1.4), { pos: [.14, .06, 0] }), M(SPH(.07, 12, 8), glowM(col, 1.4), { pos: [-.12, .08, .04] })); }
  function cow() { const c = B.animal('dog', { color: 0xffffff }), u = c.userData, blk = matte(0x1d1d24); c.traverse(m => { if (m.isMesh && m.material.color) { const h = m.material.color.getHex(); if (h === 0x8a5a3c) m.material = blk; if (h === 0xf0d2a8) m.material = plastic(0xffb8c8, { roughness: .5 }); } });
    u.fur.visible = false; [[.3, .15, .2, 1], [-.32, .05, -.25, 1.2], [0, .36, -.05, .9], [.25, -.1, -.45, .8], [-.28, .2, .35, .7]].forEach(([x, y, z, k]) => u.bodyG.add(M(SPH(.17 * k, 16, 12), blk, { pos: [x, y, z], scale: [Math.abs(x) > .2 ? .35 : 1, Math.abs(x) > .2 ? 1 : .35, 1.3] })));
    [-1, 1].forEach(d => u.head.add(M(new THREE.ConeGeometry(.05, .2, 10), plastic(0xf4e6c4), { pos: [d * .18, .36, -.05], rot: [0, 0, -d * .5] }))); u.bodyG.add(M(SPH(.16, 16, 12), plastic(0xffb8c8), { pos: [0, -.35, -.25] })); return c; }
  function scroll(draw) { const s = sign(1.6, 1.1, draw ?? ((x, w, h) => { x.fillStyle = '#f4e6c4'; x.fillRect(0, 0, w, h); }), { color: 0xf4e6c4, depth: .05 }); [-1, 1].forEach(d => s.add(M(new THREE.CylinderGeometry(.06, .06, 1.2, 12), plastic(0x8a5a2a), { pos: [d * .82, 0, 0] }))); s.userData.w = 1.6; return s; }
  function newspaper(head) { return sign(1.6, 2.0, (x, w, h) => { x.fillStyle = '#f2ece0'; x.fillRect(0, 0, w, h); label(x, 'THE DAILY', w / 2, h * .1, h * .07, '#1d1d24', 900); x.fillStyle = '#1d1d24'; x.fillRect(w * .05, h * .16, w * .9, 4);
    label(x, head, w / 2, h * .26, h * .085, '#1d1d24', 900); for (let i = 0; i < 12; i++) { x.fillStyle = '#9a968e'; x.fillRect(w * .07 + (i % 2) * w * .45, h * .38 + Math.floor(i / 2) * h * .09, w * .4, h * .02); } }, { color: 0xf2ece0, depth: .02 }); }
  // a still "photo" card on a stand: draw(x, w, h) paints it (charts, diagrams)
  const card = (w, h, draw, o) => { const s = sign(w, h, draw, Object.assign({ color: 0xffffff, depth: .08 }, o)); s.userData.w = w; return s; };

  return (hist.done = { B, dress, who, room, ROOMS, candle, bowl, bottle, jar: jar2, leech, skull, drill, lancet, canopyBed, sarcophagus, mummy, mortar, goblet, ironLung, barberPole, molecule, cow, scroll, newspaper, card });
}
