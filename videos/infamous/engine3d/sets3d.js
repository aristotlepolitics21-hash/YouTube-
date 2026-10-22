// Infamous 3D sets. Each BUILD[name](p) lays out a set once and returns { update(t, T) } for camera and motion.
// Floor is y = 0, a figure is about 1.8 tall, and FACE turns a figure to look at a camera on +z.
import { THREE, scene, camera, BUILD, fig, headPos, POSE, breathe, gun, mat, glow, mesh, box, cyl, ball, ground, backdrop, sky, lights, fog, shot, rng, lerp, ease, clamp, seg, stick } from './r3.js';
const FACE = -90, PI = Math.PI;
const SOLDIER = { coat: 'military', hat: 'helmet' };
const looks = p => { const o = {}; for (const k of ['hair', 'stache', 'beard', 'hat', 'glasses', 'coat', 'medals', 'sash', 'hairc', 'beardc', 'hatc', 'band', 'spike', 'cape']) if (p[k] != null) o[k] = p[k]; if (o.coat === 'suit' || o.coat === 'black') o.shoes = '#111'; return o; };

function canvasTex(w, h, draw, rep) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
const windowsTex = (lit, seed) => canvasTex(64, 128, (x, w, h) => { const R = rng(seed); x.fillStyle = lit ? '#2a3038' : '#cfc6b2'; x.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) { x.fillStyle = lit ? (R() < .45 ? '#f2c46a' : '#141a20') : (R() < .2 ? '#8a8270' : '#5a5a58'); x.fillRect(6 + i * 15, 6 + j * 15, 9, 10); } });
const brickTex = (c1, c2) => canvasTex(128, 128, (x, w, h) => { x.fillStyle = c1; x.fillRect(0, 0, w, h); x.strokeStyle = c2; x.lineWidth = 2; for (let j = 0; j < 8; j++) { x.beginPath(); x.moveTo(0, j * 16); x.lineTo(w, j * 16); x.stroke(); for (let i = 0; i < 4; i++) { const xx = i * 32 + (j % 2) * 16; x.beginPath(); x.moveTo(xx, j * 16); x.lineTo(xx, j * 16 + 16); x.stroke(); } } }, [6, 3]);
function building(x, z, w, h, d, o = {}) { const tex = windowsTex(o.lit, Math.round(x * 13 + z * 7)); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(Math.max(1, Math.round(w / 1.2)), Math.max(1, Math.round(h / 2.4))); const b = mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ map: tex, roughness: .9, emissive: o.lit ? '#ffffff' : '#000000', emissiveMap: o.lit ? tex : null, emissiveIntensity: o.lit ? .6 : 0 }), x, h / 2, z); return b; }
function ruin(x, z, w, h, d, c, seed) { const R = rng(seed); for (let i = 0; i < 4; i++) { const hh = h * (.3 + R() * .7); box(w / 4, hh, d, c, x - w / 2 + w / 8 + i * w / 4, hh / 2, z); } for (let i = 0; i < 6; i++) { const r = box(.3 + R() * .6, .2 + R() * .3, .3 + R() * .5, c, x + (R() - .5) * w * 1.3, .15, z + d / 2 + R() * 1.2); r.rotation.y = R() * 3; } }
function flame(x, y, z, s = 1, seed = 1) { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); const R = rng(seed), parts = []; for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(.25 * s, 1.0 * s, 8), glow(i % 2 ? '#d8661e' : '#e89a2a', .9)); c.position.set((R() - .5) * .8 * s, .4 * s, (R() - .5) * .8 * s); g.add(c); parts.push([c, R() * 6]); } const l = new THREE.PointLight('#ff8a3a', 6 * s, 10 * s, 1.5); l.position.set(x, y + 1 * s, z); scene.add(l); return T => { parts.forEach(([c, ph], i) => { c.scale.y = .7 + .4 * Math.abs(Math.sin(T * 7 + ph)); }); l.intensity = 6 * s * (.8 + .25 * Math.sin(T * 13 + seed)); }; }
function smoke(x, y, z, n = 10, s = 1, seed = 2, drift = .4) { const R = rng(seed), puffs = []; for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(.5 * s, 10, 8), mat('#3a3836', 1, { transparent: true, opacity: .5 })); scene.add(p); puffs.push([p, i / n, R()]); } return T => puffs.forEach(([p, o, r]) => { const f = (T * .08 + o) % 1; p.position.set(x + (r - .5) * s + drift * f * 4 * s, y + f * 6 * s, z + (r - .5) * s); p.scale.setScalar(.5 + f * 2); p.material.opacity = .45 * (1 - f); }); }
function tank(x, z, s = 1, turn = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = turn; g.scale.setScalar(s); scene.add(g); const c = '#4a4e30'; box(3.2, .9, 1.9, c, 0, .75, 0, g); box(1.7, .55, 1.3, c, -.2, 1.45, 0, g); const b = cyl(.08, .08, 2.2, '#3a3e28', 1.6, 1.45, 0, g); b.rotation.z = PI / 2; for (const sz of [-1, 1]) box(3.4, .55, .45, '#2a2a26', 0, .3, sz * .95, g); return g; }
function plane3(x, y, z, s = 1, c = '#3a3a38') { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); scene.add(g); const f = cyl(.18, .12, 3, c, 0, 0, 0, g); f.rotation.z = PI / 2; box(.8, .05, 4.2, c, .2, 0, 0, g); box(.4, .05, 1.4, c, -1.35, .05, 0, g); box(.4, .6, .05, c, -1.35, .3, 0, g); return g; }
function palm(x, z, s = 1, c = '#4a6a3a') { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g); const tr = cyl(.09, .15, 4, '#6a4a30', 0, 2, 0, g, 8); tr.rotation.z = .08; for (let i = 0; i < 7; i++) { const a = i / 7 * PI * 2, l = mesh(new THREE.ConeGeometry(.35, 2.4, 4), c, Math.cos(a) * .9, 3.8, Math.sin(a) * .9, g); l.rotation.z = -Math.cos(a) * 1.25; l.rotation.x = Math.sin(a) * 1.25; l.scale.set(1, 1, .25); } return g; }
function house(x, z, s = 1, turn = 0, o = {}) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = turn; g.scale.setScalar(s); scene.add(g); box(2.4, 1.6, 2, o.wall || '#d9cfbd', 0, .8, 0, g); const roof = mesh(new THREE.ConeGeometry(1.9, 1.1, 4), o.roof || '#8a6a48', 0, 2.15, 0, g); roof.rotation.y = PI / 4; roof.scale.set(1, 1, .85); box(.4, .8, .05, '#3a2a1a', 0, .4, 1.01, g); return g; }
function carrack(x, z, s = 1, o = {}) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); scene.add(g); const wood = '#6a4a30';
  const hull = mesh(new THREE.CylinderGeometry(1.0, .6, 6, 16, 1, false, 0, PI), wood, 0, .35, 0, g); hull.rotation.set(0, 0, PI / 2); hull.rotation.order = 'ZYX'; hull.scale.set(1, 1, 1); hull.rotation.x = PI;
  box(1.6, .9, 1.9, wood, -2.4, 1.2, 0, g); box(1.0, .6, 1.6, wood, 2.4, 1.0, 0, g);
  const sailC = o.pirate ? '#2b2b2b' : '#efe6d0', crossTex = !o.pirate && canvasTex(64, 64, (x2, w, h) => { x2.fillStyle = sailC; x2.fillRect(0, 0, w, h); x2.strokeStyle = '#a3291f'; x2.lineWidth = 9; x2.beginPath(); x2.moveTo(12, 12); x2.lineTo(52, 52); x2.moveTo(52, 12); x2.lineTo(12, 52); x2.stroke(); });
  [[-1.4, 4.2, 1.6], [.4, 5.2, 2.0], [2.2, 3.6, 1.3]].forEach(([mx, h, sw], i) => { cyl(.07, .09, h, wood, mx, h / 2 + .5, 0, g, 8); const sail = mesh(new THREE.PlaneGeometry(sw * 1.4, sw), crossTex && i < 2 ? new THREE.MeshStandardMaterial({ map: crossTex, side: THREE.DoubleSide, roughness: 1 }) : mat(sailC, 1, { side: THREE.DoubleSide }), mx, h * .62 + .5, 0, g); sail.rotation.y = PI / 2; sail.userData.sail = 1; });
  if (o.pirate) { const fl = mesh(new THREE.PlaneGeometry(.8, .5), mat('#111', 1, { side: THREE.DoubleSide }), .4, 6.0, 0, g); fl.rotation.y = PI / 2; ball(.09, '#efe9dc', .4, 6.05, .02, g); }
  return g; }
function horse(s = 1) { const g = new THREE.Group(); g.scale.setScalar(s); scene.add(g); const c = '#6a4a30', legs = [];
  const body = mesh(new THREE.CapsuleGeometry(.32, 1.0, 6, 12), c, 0, 1.35, 0, g); body.rotation.z = PI / 2;
  const neck = mesh(new THREE.CapsuleGeometry(.16, .55, 4, 8), c, .75, 1.75, 0, g); neck.rotation.z = -.7; const head = mesh(new THREE.BoxGeometry(.55, .22, .2), c, 1.05, 1.95, 0, g); head.rotation.z = -.5;
  const tail = mesh(new THREE.ConeGeometry(.08, .7, 6), '#2a2018', -.85, 1.25, 0, g); tail.rotation.z = -2.4;
  for (const [lx, lz] of [[.5, .18], [.5, -.18], [-.5, .18], [-.5, -.18]]) { const pivot = new THREE.Group(); pivot.position.set(lx, 1.15, lz); g.add(pivot); const leg = mesh(new THREE.CylinderGeometry(.06, .05, 1.1, 6), c, 0, -.55, 0, pivot); legs.push(pivot); }
  return { g, legs, run(T, ph = 0) { legs.forEach((p, i) => p.rotation.z = Math.sin(T * 9 + ph + (i % 2 ? PI : 0) + (i > 1 ? .8 : 0)) * .6); body.position.y = 1.35 + Math.abs(Math.sin(T * 9 + ph)) * .06; } }; }

// ---------- portrait ----------
BUILD.bust = p => { backdrop('#cdbfa3', -1.6, 12, 6); ground('#a8977a');
  const m = fig(Object.assign({ turn: FACE }, looks(p))); POSE.stand(m); m.l_arm.straddle = m.r_arm.straddle = 4; const h = headPos(m), y = h.y - .12;
  lights({ amb: .7, spots: [{ pos: [-1.4, h.y + 1.0, 2.2], target: [0, y, 0], i: 7, a: .45, c: '#ffe8c8' }, { pos: [1.6, h.y + .6, -1], target: [0, y, 0], i: 4, a: .6, c: '#fff2dc', shadow: false }] });
  return { update(t, T) { m.head.turn = Math.sin(T * .35) * 7; m.head.nod = -2 + Math.sin(T * .27) * 3; breathe(m, T); shot([.3, y + .12, .95], [.27, y + .11, .8], t, [.24, y + .06, 0]); } }; };
// ---------- gatherings ----------
BUILD.podium = p => { const night = p.night !== 0;
  if (night) { scene.background = new THREE.Color('#0d1015'); fog('#0d1015', 9, 24); } else { sky('#9fb4c2', '#e2d8c4'); fog('#d8d2c4', 18, 60); box(30, 9, 1, '#bfb19a', 0, 4.5, -5); }
  ground(night ? '#201d19' : '#b8ad98'); box(8, 1.2, 2.6, night ? '#3a3228' : '#8a7a62', 0, .6, -1.6);
  const nb = p.banners ?? 4; for (let i = 0; i < nb; i++) box(1.0, 4.4, .05, p.bannerc || '#8a1f17', (i - (nb - 1) / 2) * 1.7, 3.2, -2.9);
  box(.55, .62, .45, '#5a4430', 0, 1.51, -.85);
  const L = fig({ x: 0, y: 1.2, z: -1.45, turn: FACE, coat: p.coat || 'military', hat: p.hat, hair: p.hair || 'side', stache: p.stache });
  const crowd = [], R = rng(7); for (let r = 0; r < 3; r++) for (let i = -5; i <= 5; i++) { const m = fig({ x: i * .7 + (r % 2) * .35, z: 1.0 + r * .8, turn: 90 + (R() - .5) * 20, h: .95 + R() * .1 }); crowd.push(m); }
  const spots = lights({ amb: night ? .25 : .7, sun: night ? null : { pos: [5, 9, 7], i: 1.8, size: 9 }, spots: night ? [{ pos: [0, 7, 4], target: [0, 1.6, -1.4], i: 120, a: .3 }, { pos: [-5, 6, -1], target: [-1, 3, -3], i: 25, a: .5, c: '#ffd8a0', shadow: false }, { pos: [5, 6, -1], target: [1, 3, -3], i: 25, a: .5, c: '#ffd8a0', shadow: false }] : [] });
  return { update(t, T) { POSE.speech(L, T); crowd.forEach((m, i) => p.cheer ? POSE.cheer(m, T, i) : POSE.stand(m)); shot([1.6, 2.0, 7.0], [.9, 1.9, 6.0], t, [0, 1.3, -1]); } }; };
BUILD.people = p => { const night = !!p.night, n = Math.min(p.n || 8, 12);
  if (night) { scene.background = new THREE.Color('#0f141b'); fog('#0f141b', 8, 22); } else { sky('#b8c4c8', '#e2d8c4'); fog('#e2d8c4', 12, 40); }
  ground(night ? '#1a1e24' : '#c2b49a'); for (let i = 0; i < 5; i++) house(-8 + i * 4, -6, 1.1, 0, {});
  const ms = []; for (let i = 0; i < n; i++) { const red = p.red && i < p.red; const m = fig({ x: (i - (n - 1) / 2) * .9, z: (i % 2) * .5, turn: p.pose === 'walk' ? 0 : FACE + (i % 3 - 1) * 12, coat: red ? 'red' : null, h: .92 + (i % 3) * .05 }); ms.push(m); }
  lights({ amb: night ? .25 : .65, sun: { pos: [4, 8, 6], i: night ? .4 : 1.8, c: night ? '#9fb0d0' : '#ffffff', size: 10 }, points: night ? [{ pos: [0, 4, 3], i: 10, d: 14 }] : [] });
  return { update(t, T) { ms.forEach((m, i) => { const pose = p.pose || 'stand'; if (pose === 'walk') { POSE.walk(m, T * 4 + i); m.position.x = ((i - (n - 1) / 2) * .9 + T * .5 + 30) % (n * .9 + 2) - (n * .9 + 2) / 2; } else (POSE[pose] || POSE.stand)(m, T, i); breathe(m, T, i); }); shot([0, 1.6, 7.5], [0, 1.5, 6.5], t, [0, 1.0, 0]); } }; };
BUILD.inquiry = p => { scene.background = new THREE.Color('#2a2018'); ground('#6a5038'); backdrop('#5a4430', -4, 30, 10);
  box(6, 1.1, 1, '#7a5a3a', 0, .55, -2.6); box(6.2, .1, 1.2, '#8a6a48', 0, 1.12, -2.6); const judges = []; for (let i = 0; i < 5; i++) { const j = fig({ x: (i - 2) * 1.05, y: .45, z: -3.2, turn: FACE, coat: '#1c1b19' }); POSE.sit(j); judges.push(j); }
  box(1, 1, .8, '#7a5a3a', -3.4, .5, -.6); const w = fig({ x: -3.4, z: -1.1, turn: FACE + 40, coat: 'suit' }); POSE.headDown(w);
  const aud = []; for (let r = 0; r < 2; r++) { box(7, .45, .5, '#5a4030', 0, .22, 1.6 + r * 1.1); for (let i = 0; i < 5; i++) { const a = fig({ x: (i - 2) * 1.2, y: .0, z: 2.0 + r * 1.1, turn: 90 }); POSE.sit(a); aud.push(a); } }
  lights({ amb: .5, spots: [{ pos: [0, 6, 3], target: [0, 1, -2.5], i: 60, a: .6 }, { pos: [-4, 5, 2], target: [-3.4, 1, -1], i: 30, a: .35 }] });
  return { update(t, T) { judges.forEach((j, i) => breathe(j, T, i)); shot([2.5, 2.6, 7.5], [1.2, 2.3, 6.5], t, [-.5, 1.0, -1.5]); } }; };
BUILD.versus = p => { scene.background = new THREE.Color('#141210'); ground('#2a2622');
  const L = fig({ x: -1.3, turn: 0, coat: p.lcoat || 'suit' }), Rm = fig({ x: 1.3, turn: 180, coat: p.red === 'r' ? 'red' : (p.rcoat || 'suit') });
  lights({ amb: .25, spots: [{ pos: [-2.5, 6, 3], target: [-1.3, 1, 0], i: 70, a: .3 }, { pos: [2.5, 6, 3], target: [1.3, 1, 0], i: 70, a: .3, c: p.red === 'r' ? '#ffb8a0' : '#ffe2b0' }] });
  return { update(t, T) { (p.lpose === 'point' ? POSE.point : POSE.stand)(L); (p.rpose === 'point' ? POSE.point : POSE.stand)(Rm); breathe(L, T); breathe(Rm, T, 2); shot([0, 1.6, 7.2], [0, 1.5, 6.0], t, [0, 1.2, 0]); } }; };
BUILD.throne = p => { const night = !!p.night; scene.background = new THREE.Color(night ? '#10131a' : '#3a3026'); ground(night ? '#1b2430' : '#8a7a62');
  backdrop(night ? '#1b2430' : '#6a5a48', -5, 30, 12); for (let i = 0; i < 6; i++) { const x = (i - 2.5) * 2.6; cyl(.32, .36, 6, night ? '#2a3240' : '#cfc3ab', x, 3, -3.5); }
  box(2, .02, 9, '#8a1f17', 0, .01, 0); box(2.4, .4, 1.6, '#c9a24a', 0, .2, -2.8); const th = box(1.2, 2.8, .25, '#d9a93a', 0, 1.8, -3.45); box(1.2, .2, .9, '#d9a93a', 0, .9, -2.9);
  const k = fig({ y: .45, z: -2.85, turn: FACE, hat: p.crown === 0 ? null : 'crown', coat: 'robe', cape: 1, beard: p.beard }); POSE.sit(k); k.l_arm.raise = 35; k.r_arm.raise = 35;
  const court = []; for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) court.push(fig({ x: sd * (1.6 + i * .9), z: -1.2 + i * .9, turn: sd < 0 ? -30 : -150, coat: i % 2 ? 'navy' : 'robe' }));
  lights({ amb: .4, spots: [{ pos: [0, 7, 3], target: [0, 1.2, -2.8], i: 80, a: .45, c: '#ffe2b0' }], points: [{ pos: [-3, 3, -2], i: 5 }, { pos: [3, 3, -2], i: 5 }] });
  return { update(t, T) { court.forEach((c, i) => POSE.bow(c, .7 + .15 * Math.sin(T * 1.2 + i))); breathe(k, T); shot([0, 1.8, 7.5], [0, 1.7, 5.8], t, [0, 1.1, -2]); } }; };
BUILD.ruler = p => { const night = !!p.night; if (night) scene.background = new THREE.Color('#0f141b'); else sky('#8aa0b0', '#e2d8c4'); ground(night ? '#1a1e24' : '#b8ad98');
  box(3, 1.2, 2, night ? '#2a3240' : '#cfc3ab', 0, .6, 0); const k = fig({ y: 1.2, turn: FACE, h: 1.05, hat: p.hat, coat: p.hat === 'crown' ? 'robe' : 'military', cape: p.cape ? 1 : null, medals: p.hat === 'peak' ? 8 : 0 });
  const gs = []; for (let i = 0; i < (p.guards || 0); i++) { const sd = i % 2 ? 1 : -1, g = fig(Object.assign({ x: sd * (2.2 + Math.floor(i / 2) * 1.1), z: .6, turn: FACE }, SOLDIER)); POSE.guard(g); gun(g); gs.push(g); }
  lights({ amb: night ? .3 : .6, sun: { pos: [3, 8, 6], i: night ? .6 : 2, size: 8 }, spots: night ? [{ pos: [0, 6, 4], target: [0, 2, 0], i: 60, a: .35 }] : [] });
  return { update(t, T) { (POSE[p.pose] || POSE.stand)(k, T); breathe(k, T); shot([0, .6, 7], [0, .7, 5.6], t, [0, 2.0, 0]); } }; };

// ---------- war and repression ----------
BUILD.army = p => { const night = !!p.night, dir = p.dir === -1 ? -1 : 1;
  if (night) { scene.background = new THREE.Color('#0f141b'); fog('#0f141b', 10, 40); } else { sky('#a8b4bc', '#ddd5c4'); fog('#ddd5c4', 14, 50); }
  ground(night ? '#1a1e24' : '#a89a80');
  if (p.ruins) for (let i = 0; i < 6; i++) ruin(-12 + i * 5, -7, 3.5, 4 + (i % 3), 1.5, night ? '#2a3240' : '#b9ab92', i + 3);
  const rows = Math.min(p.rows || 3, 3), cols = 7, sp = 1.4, men = [];
  for (let r = 0; r < rows; r++) for (let i = 0; i < cols; i++) { const m = fig(Object.assign({ z: -r * .9, turn: dir > 0 ? 0 : 180 }, SOLDIER)); gun(m); men.push([m, r, i]); }
  const tanks = p.tanks ? [tank(0, -4.5, 1, dir > 0 ? 0 : PI), tank(0, -7.5, 1, dir > 0 ? 0 : PI)] : [];
  const planes = p.planes ? [0, 1, 2, 3].map(i => plane3(0, 8 + i % 2 * 1.5, -6 - i * 2.5, .9)) : [];
  const fires = p.fire ? [flame(-5, 0, -5, 1.4, 1), flame(6, 0, -6, 1.6, 2), smoke(-5, 1.5, -5, 10, 1.2, 3), smoke(6, 1.5, -6, 10, 1.3, 4)] : [];
  lights({ amb: night ? .25 : .6, sun: { pos: [5, 10, 7], i: night ? .5 : 2.0, c: night ? '#9fb0d0' : '#fff6e6', size: 14 } });
  return { update(t, T) { const off = (T * 1.1) % sp; men.forEach(([m, r, i]) => { m.position.x = dir * ((i - cols / 2) * sp + off + r * .3); POSE.march(m, T * 5.5 + i * .3); });
      tanks.forEach((k, i) => k.position.x = dir * lerp(-14, 6 - i * 5, ease(seg(t, 0, 1)))); planes.forEach((pl, i) => { pl.position.x = ((T * 6 + i * 7) % 40) - 20; pl.rotation.y = 0; }); fires.forEach(f => f(T));
      shot([3, 2.2, 8], [1.5, 2.0, 6.8], t, [0, 1.2, -2]); } }; };
BUILD.camp = p => { const night = p.night !== 0, snow = !!p.snow;
  scene.background = new THREE.Color(night ? '#141a24' : '#b8c0c4'); fog(night ? '#141a24' : '#c8ccc8', 14, 45); ground(snow ? (night ? '#5a6068' : '#e9ebe6') : (night ? '#1a1e24' : '#9a8c74'));
  for (let i = 0; i < 4; i++) { const x = -7 + i * 4.6; box(3.6, 1.8, 2.2, night ? '#2a3240' : '#8a7a62', x, .9, -5); const roof = mesh(new THREE.CylinderGeometry(.01, 1.6, 1.0, 4, 1), night ? '#1b2430' : '#6a5a48', x, 2.3, -5); roof.rotation.y = PI / 4; roof.scale.set(1.6, 1, .9); for (let j = 0; j < 3; j++) box(.4, .3, .02, night ? '#e2b45a' : '#3a3a38', x - 1 + j, 1.2, -3.88); }
  const tw = new THREE.Group(); tw.position.set(8, 0, -4); scene.add(tw); for (const [a, b] of [[-.8, -.8], [.8, -.8], [-.8, .8], [.8, .8]]) box(.15, 5, .15, '#5a4a38', a, 2.5, b, tw); box(2.2, .15, 2.2, '#5a4a38', 0, 5, 0, tw); box(2.2, 1, .1, '#5a4a38', 0, 5.5, 1.05, tw); const tr = mesh(new THREE.ConeGeometry(1.8, 1, 4), '#4a3a28', 0, 6.5, 0, tw); tr.rotation.y = PI / 4;
  for (let x = -12; x <= 12; x += 2) box(.12, 2.4, .12, '#4a4038', x, 1.2, 1.5); const wire = mat('#8a8a86', .5); for (let k = 0; k < 5; k++) { const w = mesh(new THREE.CylinderGeometry(.012, .012, 24, 4), wire, 0, .4 + k * .45, 1.5); w.rotation.z = PI / 2; }
  const n = Math.min(p.n || 8, 10), pr = []; for (let i = 0; i < n; i++) { const m = fig({ x: (i - (n - 1) / 2) * .85, z: -1.2, turn: FACE, coat: 'prison' }); POSE.headDown(m); pr.push(m); }
  const sp = lights({ amb: night ? .5 : .6, sun: { pos: [4, 9, 6], i: night ? .9 : 1.4, c: night ? '#9fb0d0' : '#ffffff', size: 14 }, spots: night ? [{ pos: [8, 5.6, -4], target: [0, 0, 0], i: 120, a: .22, pen: .3, c: '#f2e8c8' }] : [] });
  let flakes = null; if (snow) { const g = new THREE.BufferGeometry(), N = 600, R = rng(5), a = new Float32Array(N * 3); for (let i = 0; i < N; i++) { a[i * 3] = (R() - .5) * 24; a[i * 3 + 1] = R() * 8; a[i * 3 + 2] = (R() - .5) * 14; } g.setAttribute('position', new THREE.BufferAttribute(a, 3)); flakes = new THREE.Points(g, new THREE.PointsMaterial({ color: '#f2f4f2', size: .06 })); flakes.userData.base = a.slice(); scene.add(flakes); }
  return { update(t, T) { if (night && sp[0]) sp[0].target.position.set(Math.sin(T * .4) * 7, 0, -1 + Math.cos(T * .3) * 2); pr.forEach((m, i) => breathe(m, T, i));
      if (flakes) { const a = flakes.geometry.attributes.position.array, b = flakes.userData.base; for (let i = 0; i < a.length; i += 3) { a[i + 1] = ((b[i + 1] - T * .8) % 8 + 8) % 8; a[i] = b[i] + Math.sin(T + i) * .2; } flakes.geometry.attributes.position.needsUpdate = true; }
      shot([0, 1.4, 8.5], [0, 1.6, 7.2], t, [0, 1.2, -1.5]); } }; };
BUILD.wall = p => { const night = !!p.night; scene.background = new THREE.Color(night ? '#0f141b' : '#b8b4aa'); ground(night ? '#1a1e24' : '#9a8c74');
  mesh(new THREE.BoxGeometry(16, 4, .4), new THREE.MeshStandardMaterial({ map: brickTex(night ? '#3a3e44' : '#a89a86', night ? '#2a2e34' : '#8a7c68'), roughness: 1 }), 0, 2, -2.2);
  const n = Math.min(p.n || 6, 8), vs = []; for (let i = 0; i < n; i++) { const m = fig({ x: (i - (n - 1) / 2) * .9, z: -1.6, turn: FACE, coat: 'shirt' }); POSE.headDown(m); vs.push(m); }
  const gs = []; for (let i = 0; i < 4; i++) { const s = fig(Object.assign({ x: (i - 1.5) * 1.6, z: 3.2, turn: 90 }, SOLDIER)); POSE.aim(s); gun(s); gs.push(s); }
  lights({ amb: night ? .2 : .55, spots: [{ pos: [0, 6, 6], target: [0, 1, -2], i: night ? 45 : 30, a: .5, c: night ? '#c8d0e0' : '#fff2dc' }] });
  return { update(t, T) { vs.forEach((m, i) => breathe(m, T, i)); shot([1.5, 1.7, 7.5], [.8, 1.6, 6.6], t, [0, 1.2, -1]); } }; };
BUILD.cell = p => { const night = p.night !== 0; scene.background = new THREE.Color('#111'); ground(night ? '#2a2c2e' : '#8a8478');
  const wm = new THREE.MeshStandardMaterial({ map: brickTex(night ? '#4a4c4e' : '#bdb5a6', night ? '#3a3c3e' : '#a49c8e'), roughness: 1 });
  mesh(new THREE.BoxGeometry(5, 4, .2), wm, 0, 2, -1.6); mesh(new THREE.BoxGeometry(.2, 4, 4), wm, -2.5, 2, .4); mesh(new THREE.BoxGeometry(.2, 4, 4), wm, 2.5, 2, .4);
  box(.9, .6, .05, night ? '#2a3a4a' : '#e8e1d2', .9, 3.0, -1.48); for (let i = 0; i < 4; i++) box(.04, .6, .06, '#2a2a2a', .6 + i * .2, 3.0, -1.45);
  box(1.8, .1, .6, '#5a4430', -.6, .5, -1.2); box(.1, .5, .5, '#4a3420', -1.4, .25, -1.2); box(.1, .5, .5, '#4a3420', .2, .25, -1.2);
  const m = fig({ x: -.6, y: p.pose === 'stand' ? 0 : .02, z: p.pose === 'stand' ? -.6 : -1.1, turn: FACE, coat: p.coat || 'shirt' }); if (p.pose === 'stand') POSE.headDown(m); else POSE.sitSlump(m);
  if (p.pose !== 'stand') { m.position.y += .05; }
  if (p.bars !== 0) for (let i = 0; i < 12; i++) cyl(.03, .03, 4, '#3a3a3a', -2.4 + i * .44, 2, 2.3, scene, 8);
  lights({ amb: night ? .45 : .6, spots: [{ pos: [.9, 3.0, -1.7], target: [-.4, 0, .8], i: night ? 25 : 20, a: .45, c: night ? '#b8c8e0' : '#fff2dc' }], points: [{ pos: [0, 3.5, 1.5], i: night ? 1.2 : 3, d: 8 }] });
  return { update(t, T) { breathe(m, T); shot([.0, 1.05, 2.3], [-.1, 1.0, 2.0], t, [-.55, .6, -1.0]); } }; };
BUILD.bunker = p => { scene.background = new THREE.Color('#141618'); ground('#2a2a28'); backdrop('#3b3d3e', -2.2, 20, 8);
  box(2.6, .08, 1.3, '#4a3a28', 0, .75, 0); for (const [x, z] of [[-1.2, -.55], [1.2, -.55], [-1.2, .55], [1.2, .55]]) box(.08, .75, .08, '#3a2a1a', x, .37, z);
  const map = mesh(new THREE.PlaneGeometry(1.6, .9), mat('#d8cbb0', 1), 0, .8, 0); map.rotation.x = -PI / 2;
  const n = p.n ?? 4, spots = [[-.4, -1.0, 0, 'lean'], [1.0, -1.0, -20, 'stand'], [1.7, .3, -80, 'stand'], [-1.7, .2, 75, 'stand'], [.2, 1.1, 180, 'stand']], ms = [];
  for (let i = 0; i < Math.min(n, 5); i++) { const [x, z, turn, pose] = spots[i]; const m = fig({ x, z, turn: turn + FACE + 90, coat: i === 3 ? 'suit' : 'military', hat: i && i !== 3 ? 'peak' : null, hair: 'side' }); (pose === 'lean' ? POSE.lean : POSE.headDown)(m); ms.push(m); }
  lights({ amb: .25, points: [{ pos: [0, 2.6, 0], i: 14, d: 10, shadow: true }] }); ball(.06, glow('#ffe0b0', 3), 0, 2.6, 0);
  return { update(t, T) { ms.forEach((m, i) => breathe(m, T, i)); shot([2.6, 2.1, 4.0], [2.1, 1.9, 3.3], t, [0, .6, -.3]); } }; };

// ---------- places ----------
BUILD.city = p => { const st = p.state || 'normal', night = !!p.night || st === 'fire', R = rng(p.seed || 11);
  if (night) { scene.background = new THREE.Color(st === 'fire' ? '#1a1012' : '#0f141b'); fog(st === 'fire' ? '#2a1612' : '#0f141b', 12, 60); } else { sky('#a8b8c4', '#e2d8c4'); fog('#e2d8c4', 20, 70); }
  ground(night ? '#1a1e24' : '#a8a090'); const fx = [];
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) { const x = -16 + i * 4 + row * 1.5 + R(), z = -6 - row * 6, w = 2.4 + R() * 1.4, h = 4 + R() * (p.towers ? 6 : 10); if (st === 'ruin') ruin(x, z, w, h * .6, 2.5, '#9a8e7c', i * 3 + row); else building(x, z, w, h, 2.5, { lit: night && st !== 'fire' }); if (st === 'fire' && R() < .45) { fx.push(flame(x, h * .6 * (R() < .5 ? 0 : 1), z + 1.4, 1.3, i + row)); } }
  if (p.towers) { building(-1.6, -14, 2.4, 22, 2.4, {}); building(1.6, -15, 2.4, 22, 2.4, {}); fx.push(smoke(0, 18, -14, 14, 2.2, 6, 1.2)); }
  if (st === 'fire') { fx.push(smoke(-6, 6, -10, 12, 2, 2, .6), smoke(5, 6, -12, 12, 2, 8, .6)); }
  const people = []; if (st === 'normal' && !p.towers) for (let i = 0; i < 6; i++) people.push(fig({ x: -6 + i * 2.2, z: 1 + (i % 2), turn: i % 2 ? 0 : 180, coat: i % 3 ? null : 'suit' }));
  const planes = p.planes ? [0, 1, 2, 3, 4].map(i => plane3(0, 10 + (i % 3) * 1.5, -6 - i * 2, 1)) : [], tanks = p.tanks ? [tank(0, -1, 1)] : [];
  lights({ amb: night ? .3 : .65, sun: { pos: [6, 12, 8], i: night ? .4 : 2.0, c: night ? '#9fb0d0' : '#fff6e6', size: 20 } });
  return { update(t, T) { fx.forEach(f => f(T)); people.forEach((m, i) => { POSE.walk(m, T * 4 + i); m.position.x = ((-6 + i * 2.2 + (i % 2 ? 1 : -1) * T * .6) % 16 + 24) % 16 - 8; }); planes.forEach((pl, i) => pl.position.x = ((T * 7 + i * 8) % 48) - 24); tanks.forEach(k => k.position.x = lerp(-12, 2, ease(t)));
      shot([0, 3.0, 14], [0, 3.4, 11.5], t, [0, 3.5, -6]); } }; };
BUILD.field = p => { const fam = !!p.famine; sky(fam ? '#c8b088' : '#b8c8cc', '#e6dcc4'); fog('#e6dcc4', 18, 60);
  const ft = canvasTex(256, 256, (x, w, h) => { x.fillStyle = fam ? '#b39a72' : '#8a9a50'; x.fillRect(0, 0, w, h); x.strokeStyle = fam ? 'rgba(80,50,20,.4)' : 'rgba(50,60,20,.35)'; x.lineWidth = 6; for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(0, i * 16); x.lineTo(w, i * 16); x.stroke(); } if (fam) { const R = rng(4); x.strokeStyle = 'rgba(60,40,20,.5)'; x.lineWidth = 2; for (let i = 0; i < 60; i++) { const a = R() * w, b = R() * h; x.beginPath(); x.moveTo(a, b); x.lineTo(a + 14, b + 5); x.lineTo(a + 20, b - 6); x.stroke(); } } }, [8, 8]);
  const gr = mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ map: ft, roughness: 1 })); gr.rotation.x = -PI / 2;
  if (!fam) { const R = rng(6); for (let i = 0; i < 120; i++) mesh(new THREE.ConeGeometry(.08, .45, 5), '#6b7a3a', (R() - .5) * 18, .22, -R() * 9 + 2); }
  if (p.village) for (let i = 0; i < 4; i++) house(-9 + i * 6, -10, 1.1, R0(i));
  const n = Math.min(p.n || 7, 9), ws = []; for (let i = 0; i < n; i++) { const m = fig({ x: (i - (n - 1) / 2) * 1.4, z: -1 - (i % 2) * 1.2, turn: (i % 2 ? 0 : 180) + 20, coat: i % 3 === 1 ? 'shirt' : null }); ws.push(m); }
  let g = null; if (p.guard) { g = fig(Object.assign({ x: 5.2, z: .8, turn: FACE - 50 }, SOLDIER)); POSE.guard(g); gun(g); }
  lights({ amb: .65, sun: { pos: [6, 10, 6], i: fam ? 2.4 : 2.0, c: fam ? '#ffe2b0' : '#ffffff', size: 12 } });
  return { update(t, T) { ws.forEach((m, i) => fam ? (i % 3 === 0 ? POSE.mourn(m) : POSE.headDown(m)) : POSE.stoop(m, T, i)); shot([2, 2.4, 9], [1, 2.2, 7.6], t, [0, .8, -1]); } }; };
function R0(i) { return [.2, -.3, .5, -.1][i % 4]; }
BUILD.jungle = p => { const night = !!p.night; scene.background = new THREE.Color(night ? '#122019' : '#b8c4a8'); fog(night ? '#122019' : '#b8c4a8', 9, 30); ground(night ? '#141e18' : '#6a6a40');
  const R = rng(12); for (let i = 0; i < 22; i++) palm((R() - .5) * 24, -2 - R() * 14, .9 + R() * .5, night ? '#1f3a28' : '#4a6a3a'); for (let i = 0; i < 30; i++) { const b = mesh(new THREE.SphereGeometry(.5 + R() * .5, 8, 6), night ? '#18301f' : '#557a40', (R() - .5) * 20, .3, -R() * 10 + 1); b.scale.y = .6; }
  const n = Math.min(p.n || 5, 7), ms = []; for (let i = 0; i < n; i++) { const m = fig({ x: (i - (n - 1) / 2) * 1.3, z: (i % 2) * .8 - .5, turn: 0, coat: i % 2 ? 'khaki' : 'military' }); gun(m); ms.push(m); }
  lights({ amb: night ? .45 : .6, sun: { pos: [3, 10, 4], i: night ? 1.0 : 1.8, c: night ? '#9fb8d0' : '#fff2d0', size: 12 } });
  return { update(t, T) { ms.forEach((m, i) => { POSE.walk(m, T * 3 + i, .6); m.position.x = ((i - (n - 1) / 2) * 1.3 + T * .35 + 20) % (n * 1.3 + 2) - (n * 1.3 + 2) / 2; }); shot([0, 1.7, 7.5], [0, 1.6, 6.5], t, [0, 1.2, -1]); } }; };
BUILD.fleet = p => { const night = !!p.night; if (night) scene.background = new THREE.Color('#0f141b'); else sky('#a8bcc8', '#e2dcc8'); fog(night ? '#0f141b' : '#dcd8c8', 20, 80);
  const sea = mesh(new THREE.PlaneGeometry(200, 200, 60, 60), mat(night ? '#1b2a38' : '#4f6a78', .35, { flatShading: true })); sea.rotation.x = -PI / 2; sea.castShadow = false; const base = sea.geometry.attributes.position.array.slice();
  if (p.land) { const l = mesh(new THREE.SphereGeometry(12, 20, 10), '#a8a060', 18, -9.5, -30); l.scale.set(2, 1, 1); for (let i = 0; i < 6; i++) palm(10 + i * 3, -26 + (i % 2) * 2, 1.5); }
  const n = Math.min(p.n || 3, 4), ships = []; for (let i = 0; i < n; i++) ships.push(carrack(-8 + i * 7, -6 - (i % 2) * 6, 1 - (i % 2) * .1, { pirate: p.pirate }));
  const sm = p.cannon ? ships.map((s, i) => smoke(s.position.x + 1, 1, s.position.z + 1.5, 6, .6, i + 3, .2)) : [];
  lights({ amb: night ? .25 : .6, sun: { pos: [8, 12, 6], i: night ? .4 : 2.0, c: night ? '#9fb0d0' : '#fff6e6', size: 25 } });
  return { update(t, T) { const a = sea.geometry.attributes.position.array; for (let i = 0; i < a.length; i += 3) a[i + 2] = Math.sin(base[i] * .35 + T * 1.2) * .18 + Math.cos(base[i + 1] * .3 + T * .9) * .14; sea.geometry.attributes.position.needsUpdate = true; sea.geometry.computeVertexNormals();
      ships.forEach((s, i) => { s.position.x = -8 + i * 7 + T * .3; s.position.y = Math.sin(T * 1.1 + i) * .08; s.rotation.x = Math.sin(T * .9 + i) * .04; s.rotation.z = Math.sin(T * 1.3 + i) * .03; }); sm.forEach(f => f(T)); shot([0, 3, 16], [2, 3.2, 13.5], t, [0, 2.5, -6]); } }; };
BUILD.riders = p => { sky('#c8b89a', '#e6dcc4'); fog('#e6dcc4', 14, 60); ground('#c2ae84'); const R = rng(4); for (let i = 0; i < 6; i++) { const h = mesh(new THREE.SphereGeometry(10, 16, 8), '#b8a888', -40 + i * 16, -6, -40 - R() * 10); h.scale.set(1.6, .8, 1); }
  const n = Math.min(p.n || 6, 7), dir = p.flip ? -1 : 1, rs = [];
  for (let i = 0; i < n; i++) { const h = horse(1); h.g.rotation.y = dir > 0 ? 0 : PI; const m = fig({ turn: dir > 0 ? 0 : 180, coat: 'fur', hat: 'fur' }); POSE.ride(m); scene.updateMatrixWorld(true); const pv = new THREE.Vector3(); (m.pelvis.image || m.pelvis).getWorldPosition(pv); rs.push({ h, m, z: -(i % 3) * 1.6, o: i * 3.1, dy: 1.72 - pv.y + m.position.y }); }
  lights({ amb: .6, sun: { pos: [6, 10, 6], i: 2.0, size: 16 } });
  return { update(t, T) { rs.forEach(({ h, m, z, o }, i) => { const x = dir * (((T * 4 + o) % 24) - 12); h.g.position.set(x, 0, z); h.run(T, i); m.position.set(x - dir * .1, rs[i].dy + h.g.children[0].position.y - 1.35, z); }); shot([0, 2, 11], [0, 2, 9.5], t, [0, 1.3, -1.5]); } }; };
