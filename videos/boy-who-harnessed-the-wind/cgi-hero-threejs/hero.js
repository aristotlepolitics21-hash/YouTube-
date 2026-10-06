// Hero shots for "The Boy Who Harnessed the Wind", stylised game-CGI in three.js (r160 UMD, global THREE).
(() => {
const T3 = THREE, W = 1280, H = 720;
const renderer = new T3.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = T3.SRGBColorSpace;
const canvas = renderer.domElement;

// ---------- utilities ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const seg = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const V = (x, y, z) => new T3.Vector3(x, y, z);
const mat = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: .85, metalness: 0, flatShading: true }, o));
function mesh(geo, m, shadow = true) { const x = new T3.Mesh(geo, m); x.castShadow = shadow; x.receiveShadow = true; return x; }
function beam(a, b, r, m) {
  const d = new T3.Vector3().subVectors(b, a), len = d.length();
  const x = mesh(new T3.CylinderGeometry(r * .85, r, len, 6), m);
  x.position.copy(a).addScaledVector(d, .5); x.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return x;
}
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; return t; }
function skyTex(stops) { return canvasTex(8, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); }); }
const GLOW = canvasTex(128, 128, (x, w) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); });
const PUFF = canvasTex(256, 128, (x) => { for (let i = 0; i < 14; i++) { const cx = 40 + Math.random() * 176, cy = 64 + (Math.random() - .5) * 30, r = 22 + Math.random() * 26; const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 128); } });
function glow(color, size, opacity = 1) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: GLOW, color, transparent: true, opacity, blending: T3.AdditiveBlending, depthWrite: false, fog: false })); s.scale.set(size, size, 1); return s; }
function cloud(color, w) { const s = new T3.Sprite(new T3.SpriteMaterial({ map: PUFF, color, transparent: true, opacity: .9, depthWrite: false, fog: false })); s.scale.set(w, w / 2, 1); return s; }
function dust(n, box, color = 0xe8d2a8, size = .05, opacity = .55, seed = 3) {
  const r = rng(seed), p = new Float32Array(n * 3); for (let i = 0; i < n; i++) { p[i * 3] = (r() - .5) * box[0]; p[i * 3 + 1] = r() * box[1]; p[i * 3 + 2] = (r() - .5) * box[2]; }
  const g = new T3.BufferGeometry(); g.setAttribute('position', new T3.BufferAttribute(p, 3));
  const pts = new T3.Points(g, new T3.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false, map: GLOW, blending: T3.AdditiveBlending }));
  pts.userData.base = p.slice(); pts.userData.box = box;
  pts.userData.tick = T => { const a = pts.geometry.attributes.position.array, b = pts.userData.base; for (let i = 0; i < n; i++) { a[i * 3] = b[i * 3] + Math.sin(T * .3 + i) * .4 + T * .25; a[i * 3 + 1] = b[i * 3 + 1] + Math.sin(T * .5 + i * 1.7) * .2; a[i * 3] = ((a[i * 3] + box[0] / 2) % box[0] + box[0]) % box[0] - box[0] / 2; } pts.geometry.attributes.position.needsUpdate = true; };
  return pts;
}
function stage(o = {}) {
  const scene = new T3.Scene(); scene.background = skyTex(o.sky || [[0, '#9fc3dd'], [.6, '#e9d6b0'], [1, '#d9b98a']]);
  if (o.fog !== false) scene.fog = new T3.Fog(o.fogColor ?? 0xd9c2a0, o.fogNear ?? 30, o.fogFar ?? 160);
  const hemi = new T3.HemisphereLight(o.skyLight ?? 0xfff1d8, o.groundLight ?? 0x6a5038, o.hemi ?? .9); scene.add(hemi);
  const sun = new T3.DirectionalLight(o.sunColor ?? 0xffd9a0, o.sunI ?? 3); sun.position.set(...(o.sunPos || [30, 25, 20])); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = o.shadowBox ?? 30; Object.assign(sun.shadow.camera, { left: -sc, right: sc, top: sc, bottom: -sc, near: 1, far: 200 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
  scene.add(sun); scene.add(sun.target);
  const cam = new T3.PerspectiveCamera(o.fov ?? 40, W / H, .05, 600);
  return { scene, cam, sun, hemi, ticks: [] };
}
function terrain(o = {}) {
  const size = o.size ?? 300, segs = o.segs ?? 140, g = new T3.PlaneGeometry(size, size, segs, segs); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, col = [], c1 = new T3.Color(o.c1 ?? 0xb08a5a), c2 = new T3.Color(o.c2 ?? 0x8f6a42), c3 = new T3.Color(o.c3 ?? 0xc9a676), tmp = new T3.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), d = Math.hypot(x, z), flat = clamp((d - (o.flat ?? 25)) / 40);
    const h = (Math.sin(x * .045) * Math.cos(z * .038) * 3 + Math.sin(x * .11 + z * .07) * 1 + Math.sin(x * .3 - z * .23) * .25) * flat * (o.amp ?? 1);
    pos.setY(i, h + Math.sin(x * 1.7 + z * 1.3) * .03);
    const n = (Math.sin(x * .21 + z * .17) + Math.sin(x * .07 - z * .29) + 2) / 4; tmp.copy(c1).lerp(n > .5 ? c3 : c2, Math.abs(n - .5) * 2); col.push(tmp.r, tmp.g, tmp.b);
  }
  g.setAttribute('color', new T3.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = mesh(g, new T3.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }), false); m.receiveShadow = true; return m;
}
function house(o = {}) {
  const g = new T3.Group(), w = o.w ?? 4, d = o.d ?? 3.2, h = o.h ?? 2.4;
  const wall = mesh(new T3.BoxGeometry(w, h, d), mat(o.wall ?? 0x9a6340)); wall.position.y = h / 2; g.add(wall);
  const door = mesh(new T3.BoxGeometry(.8, 1.6, .06), mat(0x2a1a12)); door.position.set(-w * .2, .8, d / 2 + .03); g.add(door);
  const win = mesh(new T3.BoxGeometry(.6, .5, .06), o.windowLit ? new T3.MeshStandardMaterial({ color: 0x331f08, emissive: 0xffb54a, emissiveIntensity: o.windowLit }) : mat(0x1a120c));
  win.position.set(w * .22, 1.45, d / 2 + .03); g.add(win); g.userData.win = win;
  if (o.roof === 'tin') { [-1, 1].forEach(s => { const r = mesh(new T3.BoxGeometry(w + .4, .06, d / 2 + .5), mat(0x8d8f93, { metalness: .5, roughness: .55 })); r.position.set(0, h + .35, s * (d / 4 + .1)); r.rotation.x = s * .28; g.add(r); }); }
  else { const r = mesh(new T3.ConeGeometry(Math.max(w, d) * .82, 1.9, 4), mat(0xc8a35e)); r.position.y = h + .9; r.rotation.y = Math.PI / 4; r.scale.set(w / Math.max(w, d) * 1.15, 1, d / Math.max(w, d) * 1.15); g.add(r); }
  return g;
}
function tree(o = {}, seed = 1) {
  const r = rng(seed), g = new T3.Group(), hgt = o.h ?? 4 + r() * 2;
  const trunk = mesh(new T3.CylinderGeometry(.12, .2, hgt, 6), mat(0x5a4330)); trunk.position.y = hgt / 2; g.add(trunk);
  if (!o.bare) for (let i = 0; i < 4; i++) { const c = mesh(new T3.IcosahedronGeometry(.9 + r() * .7, 0), mat(o.leaf ?? 0x6d7a3a)); c.position.set((r() - .5) * 1.6, hgt + (r() - .2) * .8, (r() - .5) * 1.6); g.add(c); }
  else for (let i = 0; i < 4; i++) { const a = r() * 6.3; g.add(beam(V(0, hgt * .7, 0), V(Math.cos(a) * 1.4, hgt + .6 + r(), Math.sin(a) * 1.4), .06, mat(0x5a4330))); }
  return g;
}
function person(o = {}) {
  const g = new T3.Group(), s = o.scale ?? 1, skin = mat(o.skin ?? 0x5b3a26, { flatShading: false, roughness: .7 }), shirt = mat(o.shirt ?? 0xa8342a, { flatShading: false }), pants = mat(o.pants ?? 0x8b7b58, { flatShading: false });
  const body = new T3.Group(); g.add(body); body.scale.setScalar(s);
  const legs = [-1, 1].map(side => { const L = new T3.Group(); L.position.set(side * .1, .88, 0);
    const up = mesh(new T3.CylinderGeometry(.085, .075, .4, 10), o.longPants ? pants : pants); up.position.y = -.2; L.add(up);
    const lo = mesh(new T3.CylinderGeometry(.06, .05, .48, 10), o.longPants ? pants : skin); lo.position.y = -.62; L.add(lo);
    const foot = mesh(new T3.BoxGeometry(.1, .05, .2), mat(0x2a2018)); foot.position.set(0, -.86, .04); L.add(foot); body.add(L); return L; });
  const torso = mesh(new T3.CapsuleGeometry(.19, .42, 6, 12), shirt); torso.position.y = 1.18; torso.scale.set(1.05, 1, .7); body.add(torso);
  const arms = [-1, 1].map(side => { const A = new T3.Group(); A.position.set(side * .25, 1.45, 0);
    const sl = mesh(new T3.CylinderGeometry(.07, .065, .26, 10), shirt); sl.position.y = -.13; A.add(sl);
    const fa = mesh(new T3.CylinderGeometry(.05, .045, .5, 10), skin); fa.position.y = -.48; A.add(fa);
    const hand = mesh(new T3.SphereGeometry(.055, 10, 8), skin); hand.position.y = -.75; A.add(hand); A.userData.hand = hand; body.add(A); return A; });
  const neck = mesh(new T3.CylinderGeometry(.06, .07, .12, 10), skin); neck.position.y = 1.62; body.add(neck);
  const head = new T3.Group(); head.position.y = 1.8; body.add(head);
  const skull = mesh(new T3.SphereGeometry(.15, 24, 18), skin); skull.scale.set(.92, 1.08, 1); head.add(skull);
  const hair = mesh(new T3.SphereGeometry(.155, 24, 12, 0, Math.PI * 2, 0, Math.PI * .5), mat(0x121010, { flatShading: false, roughness: 1 })); hair.position.y = .025; hair.scale.set(.93, 1.05, 1.02); head.add(hair);
  [-1, 1].forEach(side => { const e = mesh(new T3.SphereGeometry(.026, 12, 10), mat(0xf2ede4, { flatShading: false, roughness: .3 }), false); e.position.set(side * .055, .02, .128); head.add(e);
    const p = mesh(new T3.SphereGeometry(.015, 10, 8), mat(0x140c08, { flatShading: false, roughness: .1 }), false); p.position.set(side * .055, .02, .15); head.add(p);
    const ear = mesh(new T3.SphereGeometry(.03, 8, 6), skin); ear.position.set(side * .142, 0, 0); head.add(ear); });
  const nose = mesh(new T3.SphereGeometry(.025, 8, 6), skin); nose.position.set(0, -.03, .145); head.add(nose);
  const mouth = mesh(new T3.TorusGeometry(.035, .008, 6, 16, Math.PI), mat(0x3a1a14), false); mouth.position.set(0, -.075, .132); mouth.rotation.z = Math.PI; mouth.scale.y = o.smile ? 1 : .25; head.add(mouth);
  if (o.headscarf) { const sc = mesh(new T3.SphereGeometry(.17, 16, 10, 0, Math.PI * 2, 0, Math.PI * .55), mat(o.headscarf, { flatShading: false })); sc.position.y = .03; sc.scale.set(1, 1.2, 1.05); head.add(sc); }
  if (o.wrap) { const w = mesh(new T3.CylinderGeometry(.2, .3, .7, 14), mat(o.wrap, { flatShading: false })); w.position.y = .62; body.add(w); }
  const api = { g, body, legs, arms, head, mouth,
    walk(ph, amt = 1) { legs[0].rotation.x = Math.sin(ph) * .5 * amt; legs[1].rotation.x = -Math.sin(ph) * .5 * amt; arms[0].rotation.x = -Math.sin(ph) * .4 * amt; arms[1].rotation.x = Math.sin(ph) * .4 * amt; body.position.y = Math.abs(Math.cos(ph)) * .03 * amt * s; },
    smile(v) { mouth.scale.y = lerp(.25, 1, v); } };
  return api;
}
const SKIN = [0x4a2e1e, 0x5b3a26, 0x6a4430, 0x3f281a, 0x553522];
function crowdPerson(i, o = {}) { const r = rng(i * 7 + 3); const shirts = [0xd8d2c4, 0x3f6b8a, 0x8a5a3a, 0x6d7a3a, 0xc9a14a, 0x7a3a4a, 0x445566];
  const f = r() < .45; return person(Object.assign({ skin: SKIN[i % 5], shirt: shirts[Math.floor(r() * shirts.length)], pants: f ? [0xc0502a, 0x2f6b6b, 0xd9a03a][i % 3] : 0x4a4038, scale: (o.kids ? .78 : .95) + r() * .12, wrap: f && !o.kids ? [0xc0502a, 0x2f6b6b, 0xd9a03a][i % 3] : null, headscarf: f && !o.kids && r() < .7 ? [0xe0b030, 0x3a6aa0, 0xb03a3a][i % 3] : null, longPants: !f }, o)); }
function windmill(o = {}) {
  const g = new T3.Group(), Hh = o.h ?? 6.5, wood = mat(0x8c6a46), b = o.base ?? 1.1, t = .28;
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  corners.forEach(([x, z]) => g.add(beam(V(x * b, 0, z * b), V(x * t, Hh, z * t), .07, wood)));
  [.22, .45, .68, .88].forEach(f => { const w = lerp(b, t, f), y = Hh * f; for (let i = 0; i < 4; i++) { const [x1, z1] = corners[i], [x2, z2] = corners[(i + 1) % 4]; g.add(beam(V(x1 * w, y, z1 * w), V(x2 * w, y, z2 * w), .04, wood)); } });
  [[0, 1], [2, 3]].forEach(([i, j]) => { const [x1, z1] = corners[i], [x2, z2] = corners[j]; g.add(beam(V(x1 * b, 0, z1 * b), V(x2 * lerp(b, t, .45), Hh * .45, z2 * lerp(b, t, .45)), .035, wood)); });
  const plat = mesh(new T3.BoxGeometry(.8, .08, .8), wood); plat.position.y = Hh; g.add(plat);
  const shaft = mesh(new T3.CylinderGeometry(.05, .05, .9, 8), mat(0x6b4b35, { metalness: .6, roughness: .5 })); shaft.rotation.x = Math.PI / 2; shaft.position.set(0, Hh + .3, .1); g.add(shaft);
  const wheel = mesh(new T3.TorusGeometry(.33, .02, 6, 28), mat(0x3a3a3c, { metalness: .6, roughness: .5 })); wheel.position.set(0, Hh + .3, -.2); g.add(wheel);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.add(beam(V(0, Hh + .3, -.2), V(Math.cos(a) * .33, Hh + .3 + Math.sin(a) * .33, -.2), .006, mat(0x9a9a9a, { metalness: .8 }))); }
  const tail = mesh(new T3.BoxGeometry(.03, .5, .8), mat(0xa8a49a, { metalness: .4 })); tail.position.set(0, Hh + .35, -.9); g.add(tail);
  g.add(beam(V(0, Hh + .3, -.2), V(0, Hh + .35, -.55), .03, wood));
  const rotor = new T3.Group(); rotor.position.set(0, Hh + .3, .55); g.add(rotor);
  const hub = mesh(new T3.CylinderGeometry(.18, .2, .12, 12), mat(0x8a4a2a, { metalness: .5, roughness: .7 })); hub.rotation.x = Math.PI / 2; rotor.add(hub);
  const pvc = new T3.MeshStandardMaterial({ color: 0xdcd8cb, roughness: .55, side: T3.DoubleSide });
  for (let i = 0; i < 4; i++) { const arm = new T3.Group(); arm.rotation.z = i * Math.PI / 2; rotor.add(arm);
    const bl = mesh(new T3.CylinderGeometry(.11, .11, o.blade ?? 1.6, 10, 1, true, 0, Math.PI), pvc); bl.position.y = (o.blade ?? 1.6) / 2 + .15; bl.rotation.y = .5; arm.add(bl);
    arm.add(beam(V(0, 0, 0), V(0, .3, 0), .03, mat(0x8a4a2a, { metalness: .5 }))); }
  return { g, rotor, top: Hh + .3 };
}
function bulb() {
  const g = new T3.Group();
  const glass = new T3.Mesh(new T3.SphereGeometry(.06, 20, 16), new T3.MeshPhysicalMaterial({ color: 0xfff6e0, transmission: .6, roughness: .05, transparent: true, opacity: .55, emissive: 0xffc860, emissiveIntensity: 0 })); glass.scale.y = 1.25; g.add(glass);
  const base = mesh(new T3.CylinderGeometry(.03, .028, .05, 12), mat(0xb0a99a, { metalness: .8, roughness: .3 })); base.position.y = -.085; g.add(base);
  const fil = mesh(new T3.TorusGeometry(.015, .003, 4, 12), new T3.MeshBasicMaterial({ color: 0x553311 }), false); g.add(fil);
  const light = new T3.PointLight(0xffc870, 0, 6, 1.6); g.add(light); const halo = glow(0xffc870, .9, 0); g.add(halo);
  return { g, set(v) { glass.material.emissiveIntensity = v * 3; fil.material.color.setHex(v > .2 ? 0xfff1c0 : 0x553311); light.intensity = v * 3.5; halo.material.opacity = v * .9; halo.scale.setScalar(.4 + v * .8); } };
}
const flick = k => k < .25 ? 0 : k < .3 ? .6 : k < .36 ? 0 : k < .42 ? .85 : k < .47 ? .1 : clamp((k - .47) * 4);
function look(cam, p, t) { cam.position.set(...p); cam.lookAt(...t); }
function lerpV(a, b, k) { return [0, 1, 2].map(i => lerp(a[i], b[i], k)); }

// ---------- shots ----------
const SHOTS = {};
// 1 · school gate
SHOTS[1] = () => { const S = stage({ sky: [[0, '#b9cfdc'], [.7, '#efd9b2'], [1, '#e3c08a']], sunPos: [-25, 14, 18], sunColor: 0xffc98a, sunI: 3.2, fogColor: 0xe6cfa6 });
  S.scene.add(terrain({ flat: 60, amp: .6 }));
  const school = new T3.Group(); const sb = mesh(new T3.BoxGeometry(18, 3.4, 5), mat(0xa0583c)); sb.position.y = 1.7; school.add(sb);
  for (let i = 0; i < 6; i++) { const w = mesh(new T3.BoxGeometry(1.2, 1, .1), mat(0x24201c)); w.position.set(-7 + i * 2.8, 2, 2.52); school.add(w); }
  const rf = mesh(new T3.BoxGeometry(19, .1, 6), mat(0x8d8f93, { metalness: .5, roughness: .5 })); rf.position.y = 3.6; rf.rotation.x = .08; school.add(rf);
  school.position.set(0, 0, -14); S.scene.add(school);
  [-2.2, 2.2].forEach(x => { const p = mesh(new T3.BoxGeometry(.6, 2.6, .6), mat(0xb36a48)); p.position.set(x, 1.3, -3); S.scene.add(p); });
  for (let i = 0; i < 10; i++) S.scene.add(beam(V(-1.9 + i * .42, 0, -3), V(-1.9 + i * .42, 2.0, -3), .025, mat(0x3a3c40, { metalness: .6 })));
  [-6, -4.2, 4.2, 6].forEach((x, i) => { const w = mesh(new T3.BoxGeometry(1.8, 1.4, .3), mat(0xa86a48)); w.position.set(x > 0 ? x + .2 : x - .2, .7, -3); S.scene.add(w); });
  [[-10, -8], [11, -9], [-14, -2]].forEach(([x, z], i) => { const t = tree({}, i + 2); t.position.set(x, 0, z); S.scene.add(t); });
  const boy = person({ shirt: 0xa8342a, smile: false }); boy.g.position.set(-3.6, 0, -1); boy.g.rotation.y = .25; S.scene.add(boy.g);
  const kids = []; for (let i = 0; i < 9; i++) { const k = crowdPerson(i, { kids: true, shirt: 0xe8e4da, pants: 0x34507a, longPants: false, wrap: null, headscarf: null }); S.scene.add(k.g); kids.push({ k, off: i * .11, x: (i % 3) * .6 - .6 }); }
  return (k, T) => {
    kids.forEach(o => { const f = (k * .9 + o.off) % 1; o.k.g.position.set(lerp(9, -.2, Math.min(1, f * 1.4)) + o.x * .3, 0, lerp(2, -5, Math.max(0, f * 1.4 - .55) / .85) + o.x); o.k.g.rotation.y = f * 1.4 < 1 ? -Math.PI / 2 : Math.PI; o.k.walk(T * 7 + o.off * 9); });
    boy.head.rotation.x = ease(seg(k, .55, .85)) * .45; boy.g.rotation.y = .25 + Math.sin(T * .5) * .02;
    look(S.cam, lerpV([-1, 1.7, 9], [-3.2, 1.65, 2.2], ease(k)), [-3.6, 1.45, -1]); return S; }; };
// 3 · aerial pull-back over the dry village
SHOTS[3] = () => { const S = stage({ sky: [[0, '#a9b3b8'], [1, '#d8cbb3']], sunI: 2.2, sunPos: [20, 40, 10], hemi: 1.1, fogColor: 0xcfc3ad, fogNear: 60, fogFar: 260, shadowBox: 60 });
  S.scene.add(terrain({ flat: 70, amp: 2.2, c1: 0xa7895f, c2: 0x8b7454, c3: 0xb9a07a }));
  const r = rng(9);
  for (let i = 0; i < 6; i++) { const f = mesh(new T3.PlaneGeometry(14 + r() * 8, 10 + r() * 6, 1, 1), new T3.MeshStandardMaterial({ map: canvasTex(128, 128, (x) => { x.fillStyle = '#7d5f3e'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#5a422a'; x.lineWidth = 1.2; for (let j = 0; j < 40; j++) { x.beginPath(); let px = Math.random() * 128, py = Math.random() * 128; x.moveTo(px, py); for (let q = 0; q < 4; q++) { px += (Math.random() - .5) * 30; py += (Math.random() - .5) * 30; x.lineTo(px, py); } x.stroke(); } }), roughness: 1 }), false);
    f.rotation.x = -Math.PI / 2; f.position.set((r() - .5) * 110, .05, (r() - .5) * 110); f.rotation.z = r(); S.scene.add(f); }
  for (let i = 0; i < 22; i++) { const h = house({ roof: r() < .3 ? 'tin' : 'thatch', w: 3 + r(), d: 2.6 + r() }); const a = r() * 6.3, d = 6 + r() * 30; h.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); h.rotation.y = r() * 6; S.scene.add(h); }
  for (let i = 0; i < 18; i++) { const t = tree({ bare: r() < .6, leaf: 0x7a7a4a }, i + 20); t.position.set((r() - .5) * 120, 0, (r() - .5) * 120); S.scene.add(t); }
  const d = dust(400, [140, 6, 140], 0xd9c7a2, .5, .25, 4); S.scene.add(d);
  return (k, T) => { d.userData.tick(T); const e = ease(k); look(S.cam, [lerp(6, 30, e), lerp(14, 70, e), lerp(18, 90, e)], [0, 0, 0]); return S; }; };
// 43 · library room
SHOTS[43] = () => { const S = stage({ sky: [[0, '#1a1410'], [1, '#1a1410']], fog: false, hemi: .35, sunI: 6, sunPos: [8, 6, 2], sunColor: 0xffd49a, shadowBox: 8, skyLight: 0xffe2b8, groundLight: 0x3a2a1a });
  S.sun.target.position.set(0, 0, 0);
  const room = mesh(new T3.BoxGeometry(12, 4, 10), new T3.MeshStandardMaterial({ color: 0xb07a5a, roughness: 1, side: T3.BackSide }), false); room.position.y = 2; S.scene.add(room);
  const floor = mesh(new T3.PlaneGeometry(12, 10), mat(0x7a5a3e)); floor.rotation.x = -Math.PI / 2; floor.position.y = .01; S.scene.add(floor);
  const win = new T3.Mesh(new T3.PlaneGeometry(1.8, 1.4), new T3.MeshBasicMaterial({ color: 0xfff1d0 })); win.position.set(5.98, 2.4, 0); win.rotation.y = -Math.PI / 2; S.scene.add(win);
  const shaft = new T3.Mesh(new T3.BoxGeometry(1.6, 1.3, 9), new T3.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: .08, blending: T3.AdditiveBlending, depthWrite: false }));
  shaft.position.set(2.2, 1.6, 0); shaft.rotation.set(0, Math.PI / 2, .55); S.scene.add(shaft);
  const r = rng(43), bookCols = [0x7a3a2a, 0x3a5a6a, 0x6a6a3a, 0x8a6a3a, 0x4a3a5a, 0xa08050, 0x2f4f3f];
  [[-5.6, 0, Math.PI / 2], [0, -4.6, 0]].forEach(([x, z, ry]) => { const sh = new T3.Group(); sh.position.set(x, 0, z); sh.rotation.y = ry; S.scene.add(sh);
    for (let lv = 0; lv < 5; lv++) { const b = mesh(new T3.BoxGeometry(7, .06, .5), mat(0x6a4a30)); b.position.y = .3 + lv * .65; sh.add(b);
      let bx = -3.3; while (bx < 3.3) { const w = .06 + r() * .08, hh = .4 + r() * .18; const bk = mesh(new T3.BoxGeometry(w, hh, .36), mat(bookCols[Math.floor(r() * 7)])); bk.position.set(bx + w / 2, .33 + lv * .65 + hh / 2, 0); bk.rotation.z = r() < .1 ? .2 : 0; sh.add(bk); bx += w + .01; } }
    [-3.5, 3.5].forEach(px => { const p = mesh(new T3.BoxGeometry(.08, 3.4, .5), mat(0x6a4a30)); p.position.set(px, 1.7, 0); sh.add(p); }); });
  for (let i = 0; i < 4; i++) { const bx = mesh(new T3.BoxGeometry(.8, .5, .6), mat(0xb08a5a)); bx.position.set(-2 + i * 1.1, .25, 1.5 + (i % 2) * .7); bx.rotation.y = r() - .5; S.scene.add(bx);
    for (let j = 0; j < 3; j++) { const bk = mesh(new T3.BoxGeometry(.5, .08, .35), mat(bookCols[(i + j) % 7])); bk.position.set(bx.position.x, .54 + j * .08, bx.position.z); bk.rotation.y = r(); S.scene.add(bk); } }
  const table = mesh(new T3.BoxGeometry(2.2, .08, 1.1), mat(0x7a5432)); table.position.set(1, .8, -1.5); S.scene.add(table);
  [[-1, -.5], [1, -.5], [-1, .5], [1, .5]].forEach(([a, b]) => { const l = mesh(new T3.BoxGeometry(.07, .8, .07), mat(0x5a3a22)); l.position.set(1 + a, .4, -1.5 + b * .9); S.scene.add(l); });
  const d = dust(260, [8, 3.6, 3], 0xffe2b0, .04, .7, 7); d.position.set(2, .3, 0); S.scene.add(d);
  const fill = new T3.PointLight(0xffc890, 6, 14, 1.5); fill.position.set(3, 2.5, 0); S.scene.add(fill);
  return (k, T) => { d.userData.tick(T * .3); look(S.cam, lerpV([-4.5, 1.9, 4.2], [-2.2, 1.7, 1.8], ease(k)), [1.5, 1.4, -2]); return S; }; };
// 50 · textbook cover
SHOTS[50] = () => { const S = stage({ sky: [[0, '#2a1d14'], [1, '#2a1d14']], fog: false, hemi: .5, sunI: 3.2, sunPos: [3, 6, 2], sunColor: 0xffd6a0, shadowBox: 3 });
  const table = mesh(new T3.BoxGeometry(6, .2, 4), mat(0x6e4a2c, { flatShading: false, roughness: .7 })); table.position.y = -.1; S.scene.add(table);
  const cover = canvasTex(512, 680, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3f86c9'); g.addColorStop(.7, '#9fd0f0'); g.addColorStop(1, '#9fd0f0'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#5f9a4a'; x.beginPath(); x.moveTo(0, 560); x.quadraticCurveTo(256, 470, 512, 560); x.lineTo(512, 680); x.lineTo(0, 680); x.fill();
    x.fillStyle = '#f4f4f0'; x.beginPath(); x.moveTo(250, 520); x.lineTo(262, 520); x.lineTo(259, 250); x.lineTo(253, 250); x.fill();
    x.save(); x.translate(256, 245); for (let i = 0; i < 3; i++) { x.rotate(Math.PI * 2 / 3); x.beginPath(); x.moveTo(-4, 0); x.lineTo(4, 0); x.lineTo(2, -150); x.lineTo(-1, -150); x.fill(); } x.restore(); x.beginPath(); x.arc(256, 245, 8, 0, 7); x.fill();
    x.fillStyle = '#c64a2c'; x.fillRect(0, 0, w, 80); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(40, 28, 300, 22); x.fillStyle = 'rgba(0,0,0,.15)'; for (let i = 0; i < 30; i++) x.fillRect(Math.random() * w, Math.random() * h, 2, 2); });
  const book = new T3.Group(); const pages = mesh(new T3.BoxGeometry(1.5, .18, 2), mat(0xeee6d2)); pages.position.y = .09; book.add(pages);
  const c = mesh(new T3.BoxGeometry(1.52, .02, 2.02), [mat(0x8a3a24), mat(0x8a3a24), new T3.MeshStandardMaterial({ map: cover, roughness: .8 }), mat(0x8a3a24), mat(0x8a3a24), mat(0x8a3a24)]); c.position.y = .19; book.add(c);
  book.rotation.y = .15; S.scene.add(book);
  const thumb = mesh(new T3.CapsuleGeometry(.07, .22, 6, 10), mat(0x4e301e, { flatShading: false, roughness: .6 })); thumb.position.set(.78, .26, .5); thumb.rotation.set(Math.PI / 2, 0, .9); S.scene.add(thumb);
  const hand = mesh(new T3.BoxGeometry(.5, .14, .5), mat(0x4e301e, { flatShading: false })); hand.position.set(1.05, .2, .72); hand.rotation.y = .6; S.scene.add(hand);
  const lamp = new T3.PointLight(0xffc890, 4, 6, 1.5); lamp.position.set(-1.5, 1.6, 1.2); S.scene.add(lamp);
  return (k, T) => { thumb.position.x = .78 + Math.sin(T * 1.3) * .01; look(S.cam, lerpV([0, 3.2, 2.3], [.05, 2.3, .9], ease(k)), [0, .2, 0]); return S; }; };
// 58 · scrapyard
function junkPile(S, cx, cz, n, seed) { const r = rng(seed), rust = [0x7a3e22, 0x8a5030, 0x5a3a2a, 0x6a6a6e, 0x4a4a4e];
  for (let i = 0; i < n; i++) { const t = r(), m = mat(rust[Math.floor(r() * 5)], { metalness: .4, roughness: .9 }); let o;
    if (t < .3) o = mesh(new T3.TorusGeometry(.35 + r() * .2, .13, 8, 18), mat(0x1c1c1e, { roughness: .9 }));
    else if (t < .55) o = mesh(new T3.CylinderGeometry(.06, .06, 1.5 + r() * 2, 8), m);
    else if (t < .8) o = mesh(new T3.BoxGeometry(.4 + r() * 1.2, .1 + r() * .5, .4 + r() * 1), m);
    else o = mesh(new T3.BoxGeometry(1.2 + r(), .03, .8 + r()), m);
    const a = r() * 6.3, d = r() * 2.4; o.position.set(cx + Math.cos(a) * d, .15 + r() * (1.2 - d * .4), cz + Math.sin(a) * d); o.rotation.set(r() * 3, r() * 3, r() * 3); S.scene.add(o); } }
SHOTS[58] = () => { const S = stage({ sky: [[0, '#8fb0c8'], [.65, '#f1c98a'], [1, '#e7a35c']], sunPos: [-30, 7, -10], sunColor: 0xffb067, sunI: 3.6, fogColor: 0xe8b67a, fogNear: 25, fogFar: 120 });
  S.scene.add(terrain({ flat: 40, amp: .8, c1: 0x9a7650, c2: 0x7d5e3e }));
  [[-3, -3, 40, 1], [2.5, -5, 50, 2], [-6, -8, 35, 3], [6, -2, 25, 4], [0, -10, 45, 5]].forEach(a => junkPile(S, ...a));
  const car = new T3.Group(); const cb = mesh(new T3.BoxGeometry(3.6, .9, 1.7), mat(0x6a3a28, { metalness: .4, roughness: .9 })); cb.position.y = .6; car.add(cb); const ct = mesh(new T3.BoxGeometry(1.8, .7, 1.5), mat(0x5a3020, { metalness: .4 })); ct.position.set(-.2, 1.35, 0); car.add(ct); car.position.set(5, 0, -8); car.rotation.set(0, .5, .06); S.scene.add(car);
  [[-9, -6], [10, -10]].forEach(([x, z], i) => { const t = tree({ bare: true }, i + 40); t.position.set(x, 0, z); S.scene.add(t); });
  const boy = person({ shirt: 0xa8342a }); boy.g.position.set(-1.5, 0, 2.5); S.scene.add(boy.g);
  const sunG = glow(0xffb36a, 40, .9); sunG.position.set(-80, 18, -30); S.scene.add(sunG);
  const d = dust(150, [20, 3, 14], 0xffd29a, .06, .5, 8); S.scene.add(d);
  return (k, T) => { d.userData.tick(T); boy.g.rotation.y = lerp(0, -2.3, ease(seg(k, .25, .7))); look(S.cam, lerpV([2.5, 2.4, 11], [.6, 1.9, 7], ease(k)), [-1.2, 1.1, -1.5]); return S; }; };
// 60 · parts laid out on the dirt
SHOTS[60] = () => { const S = stage({ sky: [[0, '#3a2a1c'], [1, '#3a2a1c']], fog: false, sunPos: [6, 10, 3], sunColor: 0xffd29a, sunI: 3.4, shadowBox: 5, hemi: .7 });
  const floor = mesh(new T3.PlaneGeometry(12, 12, 40, 40), mat(0x8a6a48)); floor.rotation.x = -Math.PI / 2; S.scene.add(floor);
  const rust = mat(0x7a3e22, { metalness: .5, roughness: .8 }), steel = mat(0x6a6a70, { metalness: .7, roughness: .45 });
  const items = [];
  const bike = new T3.Group(); [-.9, .9].forEach(x => { const w = mesh(new T3.TorusGeometry(.55, .03, 6, 32), mat(0x2a2a2c)); w.rotation.x = Math.PI / 2; w.position.set(x, .03, 0); bike.add(w); });
  [[-.9, 0, -.1, -.5], [-.1, -.5, .6, -.5], [.6, -.5, .9, 0], [-.1, -.5, .15, .1], [.15, .1, .6, -.5], [-.9, 0, .15, .1]].forEach(([a, b, c, d]) => bike.add(beam(V(a, .04, b), V(c, .04, d), .035, rust)));
  bike.position.set(-1.6, 0, -.6); items.push(bike);
  const fan = new T3.Group(); const fh = mesh(new T3.CylinderGeometry(.15, .15, .1, 10), rust); fan.add(fh); for (let i = 0; i < 4; i++) { const bl = mesh(new T3.BoxGeometry(.18, .03, .7), rust); bl.position.set(Math.cos(i * Math.PI / 2) * .45, .02, Math.sin(i * Math.PI / 2) * .45); bl.rotation.y = -i * Math.PI / 2 + .3; fan.add(bl); } fan.position.set(1.2, .05, -.8); items.push(fan);
  const pipes = new T3.Group(); for (let i = 0; i < 4; i++) { const p = mesh(new T3.CylinderGeometry(.06, .06, 2, 12), mat(0xdcd8cb, { flatShading: false, roughness: .5 })); p.rotation.z = Math.PI / 2; p.position.set(0, .06, i * .16); pipes.add(p); } pipes.position.set(-.3, 0, .9); items.push(pipes);
  const shock = new T3.Group(); const sb = mesh(new T3.CylinderGeometry(.06, .06, .8, 10), steel); sb.rotation.z = Math.PI / 2; shock.add(sb); for (let i = 0; i < 7; i++) { const ring = mesh(new T3.TorusGeometry(.1, .015, 6, 14), mat(0xa03020, { metalness: .5 })); ring.rotation.y = Math.PI / 2; ring.position.x = -.3 + i * .1; shock.add(ring); } shock.position.set(1.4, .1, .5); items.push(shock);
  const wire = new T3.Group(); for (let i = 0; i < 6; i++) { const t = mesh(new T3.TorusGeometry(.28 - i * .015, .012, 6, 30), mat(0xb5652e, { metalness: .9, roughness: .3 })); t.rotation.x = Math.PI / 2; t.position.y = .02 + i * .015; t.rotation.z = i * .3; wire.add(t); } wire.position.set(.2, 0, -1.6); items.push(wire);
  items.forEach(o => S.scene.add(o));
  return (k, T) => { items.forEach((o, i) => { const p = ease(seg(k, .05 + i * .16, .17 + i * .16)); o.visible = p > 0; o.position.y = (1 - p) * 1.2; o.rotation.y = (1 - p) * .6; });
    look(S.cam, [Math.sin(.3 + k * .25) * 2.2, 5.6, Math.cos(.3 + k * .25) * 2.2], [0, 0, 0]); return S; }; };
// 81 · tilt up the blue-gum tower
function homestead(S, o = {}) { S.scene.add(terrain({ flat: 50, amp: .7 })); const h = house({ roof: 'tin', w: 5, d: 3.6, h: 2.6, windowLit: o.lit }); h.position.set(0, 0, 0); S.scene.add(h);
  const wm = windmill({ h: o.h ?? 7 }); wm.g.position.set(3.8, 0, -1.4); S.scene.add(wm.g);
  const wire = beam(V(3.8, wm.top - .1, -1), V(1.5, 2.6, 0), .008, mat(0x111111)); S.scene.add(wire);
  [[-8, -6], [9, -9], [-12, -14], [14, -4]].forEach(([x, z], i) => { const t = tree({}, i + 60); t.position.set(x, 0, z); S.scene.add(t); });
  for (let i = 0; i < 14; i++) maizeRow(S, -10 + i * .9, -10, 0x8a8a3a); return { house: h, wm }; }
function maizeRow(S, x, z, c) { for (let j = 0; j < 6; j++) { const st = beam(V(x, 0, z - j * .9), V(x + .05, 1.6, z - j * .9 + .05), .03, mat(c)); S.scene.add(st); } }
SHOTS[81] = () => { const S = stage({ sky: [[0, '#6fa3d6'], [.75, '#cfe2ee'], [1, '#f2d6a4']], sunPos: [-20, 10, 15], sunColor: 0xffc27a, sunI: 3.4 });
  const { wm } = homestead(S, { h: 8 }); const sunG = glow(0xffc27a, 30, .8); sunG.position.set(-60, 20, 40); S.scene.add(sunG);
  return (k, T) => { wm.rotor.rotation.z = T * .6; const e = ease(k); S.cam.position.set(1.8, .5, 4.6); S.cam.lookAt(3.8, lerp(1, 8.5, e), -1.4); return S; }; };
// 82 · first turn of the blades
SHOTS[82] = () => { const S = stage({ sky: [[0, '#8fbce6'], [.6, '#f6f1df'], [1, '#fff7e0']], sunPos: [0, 10, -20], sunColor: 0xfff0d0, sunI: 2.6, hemi: .6, fog: false });
  const wm = windmill({ h: 8 }); S.scene.add(wm.g); const sunG = glow(0xfff2d0, 26, 1); sunG.position.set(-2, 13, -30); S.scene.add(sunG);
  return (k, T) => { wm.rotor.rotation.z = -(ease(seg(k, .2, .55)) * .35 + Math.pow(seg(k, .55, 1), 2) * 2.2); look(S.cam, [1.6, 6.6, 3.2], [0, 8.4, 0]); return S; }; };
// 88 · finished windmill, crowd gathering
SHOTS[88] = () => { const S = stage({ sky: [[0, '#7fa9d2'], [.7, '#f3dcb6'], [1, '#f6c98e']], sunPos: [-30, 8, 20], sunColor: 0xffc890, sunI: 3.2 });
  const { wm } = homestead(S, { h: 8 }); const boy = person({ shirt: 0xa8342a }); boy.g.position.set(2.4, 0, .8); boy.g.rotation.y = .5; S.scene.add(boy.g);
  const clouds = []; for (let i = 0; i < 7; i++) { const c = cloud(0xfff3e0, 30 + i * 4); c.position.set(-60 + i * 22, 30 + (i % 3) * 6, -80); S.scene.add(c); clouds.push(c); }
  const crowd = []; for (let i = 0; i < 12; i++) { const p = crowdPerson(i); S.scene.add(p.g); crowd.push({ p, tx: -3 + (i % 6) * 1.1, tz: 3.5 + Math.floor(i / 6) * 1.1, sx: -14 - i * 1.5 }); }
  return (k, T) => { wm.rotor.rotation.z = -T * .8; clouds.forEach((c, i) => c.position.x = -60 + i * 22 + T * 2);
    crowd.forEach((o, i) => { const f = clamp(k * 1.6 - i * .05); o.p.g.position.set(lerp(o.sx, o.tx, ease(f)), 0, o.tz); o.p.g.rotation.y = f < 1 ? Math.PI / 2 : 2.6; o.p.walk(T * 7 + i, f < 1 ? 1 : 0); });
    look(S.cam, lerpV([-6, 1.2, 16], [-3, 1.3, 11], ease(k)), [2.5, 4.5, -1]); return S; }; };
// 91 · the bulb lights
SHOTS[91] = () => { const S = stage({ sky: [[0, '#6a4a30'], [1, '#3a281a']], fog: false, hemi: .35, sunI: 1.2, sunPos: [-3, 4, 4], sunColor: 0xffc890, shadowBox: 3 });
  const boy = person({ shirt: 0xa8342a }); boy.g.position.set(0, -1.15, -.55); S.scene.add(boy.g);
  const b = bulb(); b.g.position.set(-.16, .5, -.12); S.scene.add(b.g);
  const hand = mesh(new T3.SphereGeometry(.035, 12, 10), mat(0x5b3a26, { flatShading: false })); hand.scale.set(1.2, .8, 1); hand.position.set(-.16, .39, -.12); S.scene.add(hand);
  const wires = [beam(V(-.19, .41, -.12), V(-.5, -.3, .2), .004, mat(0x111111)), beam(V(-.13, .41, -.12), V(-.2, -.3, .3), .004, mat(0xb5652e, { metalness: .8 }))]; wires.forEach(w => S.scene.add(w));
  const bg = new T3.Mesh(new T3.PlaneGeometry(6, 4), new T3.MeshStandardMaterial({ color: 0x7a5a3e })); bg.position.set(0, .5, -2.5); S.scene.add(bg);
  return (k, T) => { const v = flick(k); b.set(v); b.g.children[3].intensity = v * .7; boy.smile(ease(seg(k, .6, 1)) * .6); boy.head.rotation.x = .05; look(S.cam, lerpV([.12, .6, .75], [.08, .6, .55], k), [-.07, .6, -.4]); return S; }; };
// 92 · windmill spinning, bulb raised
SHOTS[92] = () => { const S = stage({ sky: [[0, '#3f7fc6'], [.6, '#9fc9ea'], [1, '#e6dcc4']], sunPos: [-20, 18, 25], sunColor: 0xffe2b0, sunI: 3.2 });
  const { wm } = homestead(S, { h: 8 }); const boy = person({ shirt: 0xa8342a }); boy.g.position.set(1.8, 0, 3.4); boy.g.rotation.y = -.35; S.scene.add(boy.g);
  const b = bulb(); boy.arms[1].userData.hand.add(b.g); b.g.position.set(0, -.1, 0); b.g.scale.setScalar(1.6);
  return (k, T) => { wm.rotor.rotation.z = -T * 6; const up = ease(seg(k, .1, .45)); boy.arms[1].rotation.x = -up * 2.7; boy.arms[1].rotation.z = up * .2; b.set(clamp(.7 + .3 * Math.sin(T * 20) * .1)); boy.smile(ease(seg(k, .3, .6)));
    look(S.cam, lerpV([0.6, .35, 6.8], [.9, .3, 6.2], k), [2.7, 4.2, 0]); return S; }; };
// 94 · dusk crowd around the bulb
SHOTS[94] = () => { const S = stage({ sky: [[0, '#1d2340'], [.6, '#5a4a6a'], [1, '#c87a4a']], sunPos: [-30, 3, -20], sunColor: 0xff9a5a, sunI: .8, hemi: .35, fogColor: 0x3a3048, fogNear: 15, fogFar: 70 });
  const { wm } = homestead(S, { h: 8, lit: .6 }); const boy = person({ shirt: 0xa8342a, smile: true }); boy.g.position.set(0, 0, 3); boy.g.rotation.y = .4; S.scene.add(boy.g);
  const b = bulb(); b.g.position.set(.25, 1.2, 3.25); b.g.scale.setScalar(1.8); b.set(1); S.scene.add(b.g); boy.arms[1].rotation.x = -1.1;
  const crowd = []; for (let i = 0; i < 13; i++) { const p = crowdPerson(i + 20); const a = Math.PI * .58 + i * (Math.PI * .84 / 12), r = 1.3 + (i % 2) * .55; p.g.position.set(Math.sin(a) * r, 0, 3 + Math.cos(a) * r); p.g.lookAt(0, 0, 3); S.scene.add(p.g); crowd.push(p); }
  return (k, T) => { wm.rotor.rotation.z = -T * 1.5; crowd.forEach((p, i) => { p.body.rotation.x = ease(seg(k, .1 + i * .02, .5)) * .22; p.head.rotation.x = .15; });
    const a = .2 + k * .5; look(S.cam, [Math.sin(a) * 5.5, 2.2, 3 + Math.cos(a) * 5.5], [0, 1.2, 3]); return S; }; };
// 98 · night descent to the one lit window
SHOTS[98] = () => { const S = stage({ sky: [[0, '#05070f'], [.7, '#121a2e'], [1, '#1d2740']], sunPos: [20, 30, -20], sunColor: 0x8aa0d0, sunI: .5, hemi: .15, skyLight: 0x4a5a80, groundLight: 0x05050a, fogColor: 0x0d1220, fogNear: 30, fogFar: 160, shadowBox: 40 });
  S.scene.add(terrain({ flat: 50, amp: 1.5, c1: 0x3a3a3a, c2: 0x2a2a2e, c3: 0x444448 }));
  const r = rng(98); for (let i = 0; i < 18; i++) { const h = house({ roof: r() < .4 ? 'tin' : 'thatch' }); const a = r() * 6.3, d = 12 + r() * 30; h.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); h.rotation.y = r() * 6; S.scene.add(h); }
  const home = house({ roof: 'tin', w: 5, d: 3.6, windowLit: 2.5 }); S.scene.add(home); const wl = new T3.PointLight(0xffb54a, 30, 25, 1.4); wl.position.set(1.1, 1.5, 2.6); S.scene.add(wl); const wg = glow(0xffb54a, 4, .9); wg.position.set(1.1, 1.45, 1.9); S.scene.add(wg);
  const wm = windmill({ h: 7 }); wm.g.position.set(3.8, 0, -1.4); S.scene.add(wm.g);
  const moon = glow(0xdde6ff, 22, .9); moon.position.set(-60, 70, -120); S.scene.add(moon); const moonC = new T3.Mesh(new T3.CircleGeometry(3, 32), new T3.MeshBasicMaterial({ color: 0xeef2ff, fog: false })); moonC.position.copy(moon.position); moonC.lookAt(0, 0, 0); S.scene.add(moonC);
  const sp = new Float32Array(900); for (let i = 0; i < 300; i++) { const a = r() * 6.3, e = .1 + r() * 1.3, R = 400; sp[i * 3] = Math.cos(a) * Math.cos(e) * R; sp[i * 3 + 1] = Math.sin(e) * R; sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * R; }
  const sg = new T3.BufferGeometry(); sg.setAttribute('position', new T3.BufferAttribute(sp, 3)); S.scene.add(new T3.Points(sg, new T3.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false })));
  return (k, T) => { wm.rotor.rotation.z = -T * .7; const e = ease(k); look(S.cam, [lerp(-10, -2, e), lerp(40, 5, e), lerp(60, 14, e)], [1.5, lerp(0, 2.5, e), 0]); return S; }; };
// 118 · walking to the stage
SHOTS[118] = () => { const S = stage({ sky: [[0, '#050506'], [1, '#0a0a0c']], fog: true, fogColor: 0x050506, fogNear: 10, fogFar: 40, hemi: .08, sunI: 0, shadowBox: 10 });
  const st = mesh(new T3.BoxGeometry(14, .9, 7), mat(0x1a1a1e)); st.position.set(0, .45, 0); S.scene.add(st);
  const fl = mesh(new T3.PlaneGeometry(60, 60), mat(0x0c0c0e)); fl.rotation.x = -Math.PI / 2; S.scene.add(fl);
  const spot = new T3.SpotLight(0xffe6c0, 260, 30, .32, .5, 1.2); spot.position.set(0, 10, 3); spot.target.position.set(0, .9, 2.4); spot.castShadow = true; S.scene.add(spot); S.scene.add(spot.target);
  const cone = new T3.Mesh(new T3.ConeGeometry(2.6, 9.5, 32, 1, true), new T3.MeshBasicMaterial({ color: 0xffe6c0, transparent: true, opacity: .07, blending: T3.AdditiveBlending, depthWrite: false, side: T3.DoubleSide })); cone.position.set(0, 5.6, 2.6); S.scene.add(cone);
  const pool = new T3.Mesh(new T3.CircleGeometry(1.8, 32), new T3.MeshBasicMaterial({ color: 0xffe6c0, transparent: true, opacity: .18, blending: T3.AdditiveBlending, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, .91, 2.4); S.scene.add(pool);
  const rim = new T3.DirectionalLight(0xffd8a0, .8); rim.position.set(0, 4, 10); S.scene.add(rim);
  const aud = new T3.InstancedMesh(new T3.CapsuleGeometry(.22, .4, 4, 8), mat(0x101012), 260), m4 = new T3.Matrix4(), r = rng(118);
  let n = 0; for (let row = 0; row < 10; row++) for (let c = 0; c < 26; c++) { m4.makeTranslation(-13 + c + (row % 2) * .5 + (r() - .5) * .2, .6 + row * .35, 6 + row * 1.1); aud.setMatrixAt(n++, m4); } S.scene.add(aud);
  const heads = new T3.InstancedMesh(new T3.SphereGeometry(.15, 10, 8), mat(0x141416), 260); n = 0; for (let row = 0; row < 10; row++) for (let c = 0; c < 26; c++) { m4.makeTranslation(-13 + c + (row % 2) * .5, 1.15 + row * .35, 6 + row * 1.1); heads.setMatrixAt(n++, m4); } S.scene.add(heads);
  const man = person({ shirt: 0x9ab8d8, pants: 0x2a2a30, longPants: true, scale: 1.08 }); man.g.position.set(0, .9, -2.5); S.scene.add(man.g);
  return (k, T) => { const f = ease(seg(k, 0, .8)); man.g.position.z = lerp(-2.5, 2.2, f); man.walk(T * 6, 1 - seg(k, .75, .85)); man.g.rotation.y = 0;
    look(S.cam, [lerp(.5, .3, k), 2.3, lerp(-6.5, -2.5, f)], [0, 1.6, 6]); return S; }; };
// 134 · sunset
SHOTS[134] = () => { const S = stage({ sky: [[0, '#3a3a6a'], [.45, '#d9784a'], [.8, '#f5b25a'], [1, '#f7d08a']], sunPos: [-10, 3, -30], sunColor: 0xff9a50, sunI: 2.6, hemi: .5, fogColor: 0xe0905a, fogNear: 30, fogFar: 150 });
  const { wm, house: h } = homestead(S, { h: 8 }); const sunG = glow(0xffb060, 60, 1); sunG.position.set(-30, 8, -110); S.scene.add(sunG); const disc = new T3.Mesh(new T3.CircleGeometry(5, 32), new T3.MeshBasicMaterial({ color: 0xffe0a0, fog: false })); disc.position.set(-30, 8, -110); S.scene.add(disc);
  const d = dust(120, [30, 4, 20], 0xffc890, .07, .45, 13); S.scene.add(d);
  return (k, T) => { d.userData.tick(T); wm.rotor.rotation.z = -T * .5; look(S.cam, lerpV([8, 1.6, 17], [6, 2, 11.5], ease(k)), [2, 3.4, -2]); return S; }; };

const ORDER = [1, 3, 43, 50, 58, 60, 81, 82, 88, 91, 92, 94, 98, 118, 134];
const DUR = { 82: 4, 91: 4 };
const cache = {};
window.HERO_LIB = { T3, renderer, canvas, clamp, lerp, ease, seg, rng, V, mat, mesh, beam, canvasTex, skyTex, glow, cloud, dust, stage, terrain, house, tree, person, crowdPerson, windmill, bulb, flick, look, lerpV, junkPile, homestead, maizeRow, SHOTS, SKIN, GLOW };
window.HERO = {
  shots: ORDER.map(n => ({ n, dur: DUR[n] || 6 })),
  draw(n, k, T) { if (!cache[n]) cache[n] = SHOTS[n](); const S = cache[n](k, T); renderer.render(S.scene, S.cam); return canvas; },
  free(n) { delete cache[n]; renderer.renderLists.dispose(); },
  canvas,
};
})();
