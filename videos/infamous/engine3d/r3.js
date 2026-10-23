// Infamous 3D core: three.js + mannequin.js figures, rendered synchronously for the 2D engine to composite.
// R3.render(scene, params, t, T) builds the set once per distinct line and redraws it for any time, so every frame
// is a pure function of time and segments can render in parallel.
import * as THREE from 'three';
import { getStage, Male, Female } from 'mannequin';

export const W = 1280, H = 720, RS = .6;
const { renderer, scene, camera } = getStage();
renderer.setAnimationLoop(null); renderer.setPixelRatio(1); renderer.setSize(W * RS, H * RS, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
camera.fov = 35; camera.aspect = W / H; camera.near = .05; camera.far = 400; camera.updateProjectionMatrix();
export { THREE, scene, camera, renderer };
// Shorts render vertical: a 9:16 target with a wider lens, so sets built for 16:9 still hold their subject.
export const MODE = { vertical: false };
export function setVertical(rs = .5) { MODE.vertical = true; renderer.setSize(Math.round(1080 * rs), Math.round(1920 * rs), false); camera.aspect = 9 / 16; camera.fov = 58; camera.updateProjectionMatrix(); }

// ---------- small helpers ----------
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, seg = (t, a, b) => clamp((t - a) / (b - a));
export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const MATS = new Map();
export function mat(c, r = .8, o = {}) { const k = c + '|' + r + '|' + JSON.stringify(o); if (!MATS.has(k)) MATS.set(k, new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o))); return MATS.get(k); }
export const glow = (c, i = 1.5) => mat(c, .5, { emissive: c, emissiveIntensity: i });
export function mesh(geo, m, x = 0, y = 0, z = 0, parent = scene) { const o = new THREE.Mesh(geo, typeof m === 'string' || typeof m === 'number' ? mat(m) : m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; parent.add(o); return o; }
export const box = (w, h, d, c, x, y, z, p) => mesh(new THREE.BoxGeometry(w, h, d), c, x, y, z, p);
export const cyl = (rt, rb, h, c, x, y, z, p, n = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, n), c, x, y, z, p);
export const ball = (r, c, x, y, z, p) => mesh(new THREE.SphereGeometry(r, 20, 14), c, x, y, z, p);
export function ground(c, size = 300) { const f = mesh(new THREE.PlaneGeometry(size, size), mat(c, 1)); f.rotation.x = -Math.PI / 2; f.castShadow = false; return f; }
export function backdrop(c, z = -6, w = 80, h = 30) { const p = mesh(new THREE.PlaneGeometry(w, h), mat(c, 1), 0, h / 2 - 1, z); p.castShadow = false; return p; }
export function sky(top, bottom) { const cv = document.createElement('canvas'); cv.width = 2; cv.height = 256; const x = cv.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, top); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, 2, 256); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; scene.background = t; }
export function lights({ amb = .5, ambc = '#fff4e6', hemi = null, sun = null, spots = [], points = [] } = {}) {
  scene.add(new THREE.AmbientLight(ambc, amb)); if (hemi) scene.add(new THREE.HemisphereLight(hemi[0], hemi[1], hemi[2]));
  if (sun) { const d = new THREE.DirectionalLight(sun.c || '#ffffff', sun.i ?? 2); d.position.set(...(sun.pos || [4, 8, 6])); d.castShadow = true; const s = sun.size || 8; Object.assign(d.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: .5, far: 60 }); d.shadow.mapSize.set(1024, 1024); d.shadow.bias = -.0005; scene.add(d, d.target); if (sun.target) d.target.position.set(...sun.target); }
  const out = [];
  spots.forEach((s, k) => { const l = new THREE.SpotLight(s.c || '#ffe2b0', s.i ?? 40, s.d ?? 30, s.a ?? .4, s.pen ?? .5, 1.2); l.position.set(...s.pos); l.target.position.set(...(s.target || [0, 0, 0])); l.castShadow = s.shadow ?? (k === 0 && !sun); l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -.0005; scene.add(l, l.target); out.push(l); });
  for (const s of points) { const l = new THREE.PointLight(s.c || '#ffc880', s.i ?? 6, s.d ?? 12, 1.5); l.position.set(...s.pos); l.castShadow = !!s.shadow; scene.add(l); out.push(l); }
  return out;
}
export function fog(c, near, far) { scene.fog = new THREE.Fog(c, near, far); }
export function shot(from, to, t, look0, look1) { const k = ease(clamp(t)); camera.position.set(lerp(from[0], to[0], k), lerp(from[1], to[1], k), lerp(from[2], to[2], k)); const a = look0, b = look1 || look0; camera.lookAt(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)); }
export function headPos(m) { scene.updateMatrixWorld(true); return new THREE.Box3().setFromObject(m.head.image || m.head).getCenter(new THREE.Vector3()); }
const protoAttach = THREE.Object3D.prototype.attach;
export const stick = (joint, obj) => protoAttach.call(joint.imageWrapper || joint, obj);

// ---------- figures ----------
export const WOOD = ['#e7cfa6', '#6b4f33', '#d9bc8c', '#a27b4f', '#e7cfa6', '#e0c393', '#a27b4f'];
const COATS = { military: '#5a5e3c', khaki: '#9a8a5a', suit: '#2b2b30', black: '#1c1b19', mao: '#77766a', robe: '#7a2a22', fur: '#6a4a30', tunic: '#e8e0cc', shirt: '#c8c0ae', armour: '#8a8a86', grey: '#55524a', prison: '#7d8088', red: '#9a2a20', navy: '#2a3346' };
export const coatColor = c => COATS[c] || c;
const HAIR = '#2a2420';
let figCount = 0;
export function fig(o = {}) {
  const m = new (o.female ? Female : Male)(o.h || 1), far = o.far ?? (figCount++ >= 4);
  if (o.coat) { const c = coatColor(o.coat), dk = new THREE.Color(c).multiplyScalar(.75).getStyle(); m.recolor(WOOD[0], o.shoes || '#1a1a1a', c, dk, o.bare ? WOOD[4] : c, c, WOOD[6]); if (o.bare) { m.l_arm.recolor && 0; } }
  else if (o.color) m.recolor(WOOD[0], '#2a2420', o.color, o.color, o.color, o.color, WOOD[6]);
  else m.recolor(...WOOD);
  m.traverse(q => { if (q.isMesh) { q.castShadow = !far; q.receiveShadow = !!o.recv; } }); if (far) for (const sd of "lr") for (let i = 0; i < 5; i++) m[sd + "_finger_" + i].visible = false;
  m.turn = 0; scene.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(m); m.position.set(o.x || 0, (o.y || 0) - bb.min.y, o.z || 0);
  m.turn = o.turn || 0; scene.updateMatrixWorld(true); look(m, o); return m;
}
function headFrame(m) { scene.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(m.head.image || m.head), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
  const g = new THREE.Group(); g.position.copy(c); g.rotation.y = THREE.MathUtils.degToRad(m.turn || 0); g.userData.r = Math.max(s.x, s.z) * .46; g.userData.k = s.y * .5 / g.userData.r; scene.add(g); return g; }
function torsoFrame(m) { scene.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(m.torso.image || m.torso), c = bb.getCenter(new THREE.Vector3()), s = bb.getSize(new THREE.Vector3());
  const g = new THREE.Group(); g.position.copy(c); g.rotation.y = THREE.MathUtils.degToRad(m.turn || 0); g.userData.s = s; scene.add(g); return g; }
const sphereCap = (r, thetaLen, c, rough = .9) => new THREE.Mesh(new THREE.SphereGeometry(r, 28, 16, 0, Math.PI * 2, 0, thetaLen), mat(c, rough));
function add(g, o, x, y, z) { o.position.set(x, y, z); o.castShadow = true; g.add(o); return o; }
// Everything below is built in a head frame: face along +x, up +y, sideways z, r = head radius.
function look(m, o) {
  const has = o.hat || o.hair || o.stache || o.beard || o.glasses;
  if (has) { const g = headFrame(m), r = g.userData.r, hc = o.hairc || HAIR, bc = o.beardc || hc;
    const hair = o.hair, hat = o.hat;
    if (hair && hair !== 'bald' && hair !== 'none' && !(hat && ['crown', 'turban', 'helmet', 'fur', 'kufi', 'wrap', 'leopard', 'peak', 'cap'].includes(hat) && !['long', 'wig', 'wild'].includes(hair))) {
      const spec = { side: .98, full: 1.08, back: .92, crop: .86, long: 1.12, wild: 1.15, curly: 1.05, wig: 1.15 }[hair] || 1.0;
      const capm = sphereCap(r * 1.07, spec, hair === 'wig' ? '#efece4' : hc); capm.scale.set(1, g.userData.k * 1.02, 1); capm.rotation.z = .22; add(g, capm, -r * .08, r * .02, 0);
      if (hair === 'side') { const f = new THREE.Mesh(new THREE.SphereGeometry(r * .5, 14, 8), mat(hc, .9)); f.scale.set(.35, .4, 1.2); f.rotation.x = -.45; add(g, f, r * .72, r * .62 * g.userData.k, -r * .22); }
      if (hair === 'long') { const b = new THREE.Mesh(new THREE.BoxGeometry(r * 1.2, r * 2.2, r * 2.0), mat(hc, .9)); add(g, b, -r * .45, -r * .8, 0); }
      if (hair === 'wild' || hair === 'curly') { const R = rng(3); for (let i = 0; i < 14; i++) { const a = R() * Math.PI * 2, e = R() * .9 + .2; add(g, new THREE.Mesh(new THREE.SphereGeometry(r * .28, 10, 8), mat(hc, .95)), Math.cos(a) * Math.cos(e) * r * .95 - r * .1, Math.sin(e) * r * .95 + r * .1, Math.sin(a) * Math.cos(e) * r * .95); } }
      if (hair === 'wig') for (const sz of [-1, 1]) for (let i = 0; i < 2; i++) { const roll = new THREE.Mesh(new THREE.CylinderGeometry(r * .18, r * .18, r * .7, 12), mat('#efece4', .9)); roll.rotation.z = Math.PI / 2; add(g, roll, -r * .15, -r * .05 - i * r * .35, sz * r * .98); }
    }
    if (hair === 'bald') for (const sz of [-1, 1]) add(g, new THREE.Mesh(new THREE.SphereGeometry(r * .3, 12, 8), mat(hc, .95)), -r * .45, -r * .05, sz * r * .85).scale.set(1.3, .8, .5);
    if (o.beard === 'full' || o.beard === 'long') { const k = g.userData.k, sh = new THREE.Mesh(new THREE.SphereGeometry(r * .97, 28, 12, Math.PI * .25, Math.PI * 1.5, Math.PI * .6, Math.PI * .36), mat(bc, .95)); sh.scale.set(.93, k, .86); add(g, sh, 0, 0, 0);
      const b = new THREE.Mesh(new THREE.SphereGeometry(r * .34, 16, 10), mat(bc, .95)); b.scale.set(.8, o.beard === 'long' ? 1.3 : .8, 1.3); add(g, b, r * .55, -r * .8 * k, 0); if (o.beard === 'long') { const cone = new THREE.Mesh(new THREE.ConeGeometry(r * .55, r * 1.4, 16), mat(bc, .95)); cone.rotation.z = Math.PI; add(g, cone, r * .45, -r * 1.8, 0); } }
    if (o.beard === 'goatee') { const cone = new THREE.Mesh(new THREE.ConeGeometry(r * .22, r * .55, 12), mat(bc, .95)); cone.rotation.z = Math.PI; add(g, cone, r * .8, -r * .9, 0); }
    if (o.beard === 'stubble') { const b = new THREE.Mesh(new THREE.SphereGeometry(r * 1.01, 24, 16, 0, Math.PI * 2, Math.PI * .55, Math.PI * .4), mat('#3a3028', 1, { transparent: true, opacity: .35 })); add(g, b, 0, 0, 0); }
    if (o.stache) { const sp = { brush: [.14, .13, .3], big: [.16, .16, .85], thin: [.1, .06, .65] }[o.stache] || [.14, .12, .5]; const s = new THREE.Mesh(new THREE.BoxGeometry(r * sp[0], r * sp[1], r * sp[2]), mat(bc, .95)); add(g, s, r * .93, -r * .42, 0); if (o.stache === 'big') for (const sz of [-1, 1]) { const tip = new THREE.Mesh(new THREE.BoxGeometry(r * .12, r * .14, r * .3), mat(bc, .95)); tip.rotation.x = sz * .5; add(g, tip, r * .88, -r * .55, sz * r * .45); } }
    if (o.glasses) { const ringM = mat('#1a1a1a', .4); for (const sz of [-1, 1]) { const ring = new THREE.Mesh(o.glasses === 'round' ? new THREE.TorusGeometry(r * .22, r * .035, 8, 24) : new THREE.TorusGeometry(r * .24, r * .04, 4, 4), ringM); ring.rotation.y = Math.PI / 2; if (o.glasses !== 'round') ring.rotation.x = Math.PI / 4; add(g, ring, r * 1.0, r * .05, sz * r * .36); if (o.glasses === 'dark') { const lens = new THREE.Mesh(new THREE.CircleGeometry(r * .22, 16), mat('#111', .2)); lens.rotation.y = Math.PI / 2; add(g, lens, r * 1.01, r * .05, sz * r * .36); } } add(g, new THREE.Mesh(new THREE.BoxGeometry(r * .04, r * .04, r * .3), ringM), r * 1.02, r * .08, 0); }
    if (hat) hatOn(g, hat, r, o);
    stick(m.head, g);
  }
  if (o.medals || o.sash || o.epaulettes || o.coat === 'military' || o.coat === 'khaki' || o.armband || o.cape) { const g = torsoFrame(m), s = g.userData.s, d = Math.min(s.x, s.z) / 2, w = Math.max(s.x, s.z) / 2;
    if (o.coat === 'military' || o.coat === 'khaki' || o.epaulettes) for (const sz of [-1, 1]) add(g, new THREE.Mesh(new THREE.BoxGeometry(d * .7, d * .12, w * .35), mat('#c9a24a', .5)), 0, s.y * .38, sz * w * .62);
    if (o.medals) { const cols = ['#a3291f', '#c9a24a', '#3a5a8a', '#3a7a4a']; for (let i = 0; i < o.medals; i++) add(g, new THREE.Mesh(new THREE.BoxGeometry(d * .1, d * .12, d * .2), mat(cols[i % 4], .5)), d * 1.0, s.y * (.2 - Math.floor(i / 4) * .07), -w * .25 - (i % 4) * d * .22); }
    if (o.sash) { const sa = new THREE.Mesh(new THREE.BoxGeometry(d * .1, s.y * 1.05, w * .3), mat(o.sash, .6)); sa.rotation.x = .75; add(g, sa, d * .98, 0, 0); }
    if (o.armband) { /* drawn as a red band on the left upper arm */ const ab = new THREE.Group(); ab.position.copy(g.position); scene.add(ab); }
    if (o.cape) { const cp = new THREE.Mesh(new THREE.BoxGeometry(d * .12, s.y * 2.6, w * 2.1), mat(o.cape === 1 ? '#8a1f17' : o.cape, .8)); add(g, cp, -d * 1.05, -s.y * .75, 0); }
    stick(m.torso, g);
  }
}
function hatOn(g, hat, r, o) {
  const hc = o.hatc || ({ military: '#4a4e30', khaki: '#8a7a4a' }[o.coat] || '#2b2b30');
  const A = (geo, c, x, y, z, rough = .8) => add(g, new THREE.Mesh(geo, typeof c === 'string' ? mat(c, rough) : c), x, y, z);
  if (hat === 'peak') { A(new THREE.CylinderGeometry(r * 1.22, r * 1.0, r * .55, 28), hc, -r * .05, r * .82, 0); A(new THREE.CylinderGeometry(r * 1.03, r * 1.03, r * .2, 28), o.band || '#8a1f17', -r * .05, r * .62, 0); const v = A(new THREE.CylinderGeometry(r * .95, r * 1.25, r * .06, 28, 1, false, Math.PI / 2 - 1.05, 2.1), '#111', r * .05, r * .5, 0, .3); v.rotation.z = -.15; A(new THREE.SphereGeometry(r * .1, 8, 6), '#c9a24a', r * .98, r * .75, 0, .3); }
  if (hat === 'cap') { const c = A(new THREE.SphereGeometry(r * 1.06, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hc, -r * .05, r * .25, 0); const v = A(new THREE.CylinderGeometry(r * .9, r * .9, r * .05, 24, 1, false, Math.PI / 2 - .9, 1.8), hc, r * .45, r * .28, 0); }
  if (hat === 'beret') { const b = A(new THREE.SphereGeometry(r * 1.15, 24, 12), hc, -r * .05, r * .72, -r * .1); b.scale.set(1, .32, 1); b.rotation.x = .2; }
  if (hat === 'crown') { A(new THREE.CylinderGeometry(r * 1.0, r * .95, r * .45, 24, 1, true), mat('#d9a93a', .3, { metalness: .6, side: THREE.DoubleSide }), 0, r * .9, 0); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; A(new THREE.ConeGeometry(r * .13, r * .38, 8), mat('#d9a93a', .3, { metalness: .6 }), Math.cos(a) * r, r * 1.3, Math.sin(a) * r); } A(new THREE.SphereGeometry(r * .12, 8, 6), '#a3291f', r * .98, r * .9, 0, .2); A(new THREE.SphereGeometry(r * .92, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), '#7a1f17', 0, r * .7, 0); }
  if (hat === 'turban') { const tc = o.hatc || '#efe9dc'; for (let i = 0; i < 3; i++) { const t = A(new THREE.TorusGeometry(r * (.86 - i * .14), r * .17, 10, 24), tc, -r * .08, r * (.5 + i * .19), 0, .95); t.rotation.x = Math.PI / 2 + (i % 2 ? .12 : -.12); } A(new THREE.SphereGeometry(r * .66, 16, 10), tc, -r * .08, r * .78, 0, .95).scale.set(1, .6, 1); }
  if (hat === 'helmet') { A(new THREE.SphereGeometry(r * 1.18, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), hc, -r * .03, r * .25, 0, .6); A(new THREE.CylinderGeometry(r * 1.3, r * 1.3, r * .06, 24), hc, -r * .03, r * .25, 0, .6); if (o.spike) A(new THREE.ConeGeometry(r * .12, r * .5, 8), '#c9a24a', 0, r * 1.6, 0, .3); }
  if (hat === 'tricorn' || hat === 'pirate') { const c = hat === 'pirate' ? '#151515' : '#1c1b19'; A(new THREE.CylinderGeometry(r * .95, r * 1.05, r * .55, 20), c, -r * .05, r * .85, 0); for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; const b = A(new THREE.BoxGeometry(r * .1, r * .55, r * 1.5), c, Math.cos(a) * r * .95, r * .85, Math.sin(a) * r * .95); b.rotation.y = -a; b.rotation.z = .35; } if (hat === 'pirate') A(new THREE.SphereGeometry(r * .14, 8, 6), '#efe9dc', r * 1.08, r * .9, 0); }
  if (hat === 'bicorne') { const b = A(new THREE.CylinderGeometry(r * 1.5, r * 1.5, r * .12, 24, 1, false, 0, Math.PI), '#151515', -r * .05, r * .75, 0); b.rotation.x = Math.PI / 2; b.rotation.z = Math.PI / 2; }
  if (hat === 'tudor') { const b = A(new THREE.CylinderGeometry(r * 1.3, r * 1.3, r * .25, 24), '#151515', 0, r * .85, 0); b.rotation.x = -.15; const f = A(new THREE.ConeGeometry(r * .12, r * .9, 8), '#efece4', -r * .3, r * 1.25, r * .5); f.rotation.x = -1.0; }
  if (hat === 'fur') { A(new THREE.CylinderGeometry(r * 1.15, r * 1.1, r * .45, 20), '#8a6a48', 0, r * .7, 0, 1); A(new THREE.ConeGeometry(r * .8, r * .9, 16), o.hatc || '#7a2a22', 0, r * 1.3, 0); }
  if (hat === 'laurel') { const t = A(new THREE.TorusGeometry(r * 1.02, r * .1, 6, 28), '#6a7a3a', -r * .05, r * .45, 0, .9); t.rotation.x = Math.PI / 2 - .2; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; if (Math.cos(a) > .85) continue; const l = A(new THREE.SphereGeometry(r * .13, 6, 4), '#7a8a4a', Math.cos(a) * r * 1.02 - r * .05, r * .45 + Math.cos(a) * r * .2, Math.sin(a) * r * 1.02); l.scale.set(1.6, .6, .8); } }
  if (hat === 'kufi') A(new THREE.CylinderGeometry(r * 1.0, r * 1.02, r * .45, 24), o.hatc || '#efe9dc', -r * .05, r * .75, 0, .95);
  if (hat === 'wrap') { const c = o.hatc || '#1c1b19'; A(new THREE.SphereGeometry(r * 1.12, 24, 14, 0, Math.PI * 2, 0, Math.PI * .6), c, -r * .05, r * .02, 0, .95); A(new THREE.BoxGeometry(r * 1.3, r * 1.8, r * 2.3), c, -r * .55, -r * .7, 0, .95); }
  if (hat === 'leopard') { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64; const x = cv.getContext('2d'); x.fillStyle = '#c8984a'; x.fillRect(0, 0, 128, 64); const R = rng(9); x.fillStyle = '#2a1c10'; for (let i = 0; i < 60; i++) { x.beginPath(); x.arc(R() * 128, R() * 64, 2 + R() * 3, 0, 7); x.fill(); } const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; A(new THREE.CylinderGeometry(r * 1.05, r * 1.0, r * .8, 24), new THREE.MeshStandardMaterial({ map: tx, roughness: 1 }), -r * .05, r * .9, 0); }
}
export function gun(m, side = 'r') { const w = m[side + '_wrist']; scene.updateMatrixWorld(true); const p = new THREE.Vector3(); (w.image || w).getWorldPosition(p); const g = new THREE.Mesh(new THREE.BoxGeometry(.03, .03, .7), mat('#2a2420', .6)); g.position.copy(p); g.rotation.y = THREE.MathUtils.degToRad(m.turn || 0) + Math.PI / 2; g.rotation.x = -1.2; g.castShadow = true; scene.add(g); stick(w, g); return g; }

// ---------- poses (degrees; ph = phase for cycles) ----------
export const POSE = {
  stand(m) { m.l_arm.straddle = 8; m.r_arm.straddle = 8; m.l_elbow.bend = 12; m.r_elbow.bend = 12; },
  walk(m, ph, k = 1) { const s = Math.sin(ph); m.l_leg.raise = 22 * s * k; m.r_leg.raise = -22 * s * k; m.l_knee.bend = 25 * Math.max(0, -s) * k + 5; m.r_knee.bend = 25 * Math.max(0, s) * k + 5; m.l_arm.raise = -20 * s * k; m.r_arm.raise = 20 * s * k; m.l_arm.straddle = m.r_arm.straddle = 8; m.l_elbow.bend = m.r_elbow.bend = 20; m.bend = 2; },
  march(m, ph) { POSE.walk(m, ph, 1.2); m.r_arm.raise = 0; m.r_elbow.bend = 80; m.r_arm.straddle = 5; },
  point(m) { m.r_arm.raise = 85; m.r_arm.straddle = 10; m.r_elbow.bend = 5; m.l_arm.straddle = 8; m.l_elbow.bend = 15; },
  speech(m, T = 0) { const g = Math.sin(T * 2.2); m.r_arm.raise = 55 + 25 * g; m.r_arm.straddle = 25; m.r_elbow.bend = 50 - 20 * g; m.l_arm.raise = 20; m.l_elbow.bend = 70; m.l_arm.straddle = 15; m.head.nod = -6 + 4 * g; m.torso.bend = 4 * g; },
  cheer(m, T = 0, i = 0) { const up = Math.sin(T * 3 + i * 1.7) > .2; m.r_arm.raise = up ? 165 : 20; m.r_elbow.bend = up ? 10 : 30; m.l_arm.raise = up ? 150 : 10; m.l_elbow.bend = up ? 20 : 25; },
  up(m) { m.r_arm.raise = 170; m.l_arm.raise = 170; m.r_elbow.bend = m.l_elbow.bend = 5; },
  mourn(m) { m.head.nod = 30; m.torso.bend = 15; m.l_arm.raise = 60; m.r_arm.raise = 60; m.l_elbow.bend = 120; m.r_elbow.bend = 120; m.l_arm.straddle = m.r_arm.straddle = -10; },
  headDown(m) { m.head.nod = 28; m.torso.bend = 6; m.l_arm.straddle = m.r_arm.straddle = 4; m.l_elbow.bend = m.r_elbow.bend = 8; },
  look(m) { m.head.nod = -18; POSE.stand(m); },
  sit(m) { m.l_leg.raise = 90; m.r_leg.raise = 90; m.l_knee.bend = 90; m.r_knee.bend = 90; m.l_arm.raise = 30; m.r_arm.raise = 30; m.l_elbow.bend = 50; m.r_elbow.bend = 50; },
  sitSlump(m) { POSE.sit(m); m.torso.bend = 25; m.head.nod = 30; m.l_elbow.bend = 80; m.r_elbow.bend = 80; },
  lean(m) { m.torso.bend = 35; m.head.nod = 20; m.r_arm.raise = 45; m.r_elbow.bend = 25; m.l_arm.raise = 35; m.l_elbow.bend = 35; },
  bow(m, k = 1) { m.torso.bend = 45 * k; m.head.nod = 20 * k; m.l_arm.raise = 20 * k; m.r_arm.raise = 20 * k; },
  stoop(m, T = 0, i = 0) { m.torso.bend = 70; m.head.nod = 10; m.l_leg.raise = 10; m.r_leg.raise = 10; m.l_knee.bend = 20; m.r_knee.bend = 20; const g = Math.sin(T * 2.5 + i); m.r_arm.raise = 70 + 25 * g; m.l_arm.raise = 60 - 20 * g; m.r_elbow.bend = 20; m.l_elbow.bend = 30; },
  guard(m) { m.r_arm.raise = 40; m.r_elbow.bend = 90; m.r_arm.straddle = -10; m.l_arm.raise = 50; m.l_elbow.bend = 70; m.l_arm.straddle = -20; },
  aim(m) { m.r_arm.raise = 80; m.r_elbow.bend = 20; m.l_arm.raise = 85; m.l_arm.straddle = -15; m.l_elbow.bend = 15; m.head.nod = 5; },
  behind(m) { m.l_arm.raise = -20; m.r_arm.raise = -20; m.l_elbow.bend = 60; m.r_elbow.bend = 60; m.l_arm.straddle = m.r_arm.straddle = -5; },
  ride(m) { m.l_leg.raise = 70; m.r_leg.raise = 70; m.l_leg.straddle = 25; m.r_leg.straddle = 25; m.l_knee.bend = 70; m.r_knee.bend = 70; m.l_arm.raise = 50; m.r_arm.raise = 50; m.l_elbow.bend = 50; m.r_elbow.bend = 50; m.torso.bend = 10; },
};
export const breathe = (m, T, i = 0) => { m.torso.bend = (m.userData.bend0 ?? (m.userData.bend0 = m.torso.bend)) + Math.sin(T * 1.6 + i) * 1.5; };

// ---------- frame cache ----------
export const BUILD = {};
let cur = null, curKey = null;
function reset() { figCount = 0; const kids = [...scene.children]; for (const k of kids) { scene.remove(k); k.traverse(o => { if (o.geometry && !o.geometry.userData.keep) o.geometry.dispose(); }); } scene.background = null; scene.fog = null; renderer.toneMappingExposure = 1.0; }
export const FPS3 = 12; let lastTq = null;
export function render(name, p, t, T) {
  const key = name + '|' + JSON.stringify(p), Tq = Math.floor(T * FPS3 + 1e-6) / FPS3, tq = T > 0 ? t * Tq / T : 0;
  if (key !== curKey) { reset(); cur = BUILD[name](p || {}) || {}; curKey = key; lastTq = null; }
  if (Tq !== lastTq) { cur.update && cur.update(tq, Tq); renderer.render(scene, camera); lastTq = Tq; }
  return renderer.domElement;
}
