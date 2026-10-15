// Tech Shorts 3D engine: Pixar-inspired stylised 3D in three.js, rendered to a 1080x1920 canvas.
// Each script line names a set (scene key); BUILD[key](p) returns { scene, cam, update(t, s, d) }.
// t = 0..1 through the line, s = seconds in, d = line duration. Everything is a pure function of time,
// so any frame can be rendered on its own (segments render in parallel).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = 1080, H = 1920, RS = 2 / 3; // 3D renders at 720x1280 and is upscaled under the full-res overlay
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W * RS, H * RS, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const ENV = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), .04).texture;
const composer = new EffectComposer(renderer);
const rpass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
const bloom = new UnrealBloomPass(new THREE.Vector2(W * RS / 2, H * RS / 2), .42, .45, 2.2);
composer.addPass(rpass); composer.addPass(bloom); composer.addPass(new OutputPass());

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const out = k => (k = clamp(k), 1 - Math.pow(1 - k, 3));
// springy pop: 0 before x=0, overshoots then settles at 1 (x in seconds)
const pop = x => x <= 0 ? 0 : 1 - Math.exp(-7 * x) * Math.cos(13 * x);
const frac = x => x - Math.floor(x);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- materials & meshes ----------
const plastic = (color, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness: .32, clearcoat: .8, clearcoatRoughness: .22, envMap: ENV, envMapIntensity: .75 }, o));
const matte = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .85, envMap: ENV, envMapIntensity: .35 }, o));
const metal = (color, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color, metalness: 1, roughness: .26, clearcoat: .4, envMap: ENV, envMapIntensity: 1.3 }, o));
const glowM = (color, i = 2.5) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: i });
function M(geo, mat, o = {}) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = o.shadow !== false; m.receiveShadow = true;
  if (o.pos) m.position.set(...o.pos); if (o.rot) m.rotation.set(...o.rot); if (o.scale) Array.isArray(o.scale) ? m.scale.set(...o.scale) : m.scale.setScalar(o.scale);
  return m;
}
const RB = (w, h, d, r = .15, s = 4) => new RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001));
const SPH = (r, a = 48, b = 32) => new THREE.SphereGeometry(r, a, b);
function G(...kids) { const g = new THREE.Group(); kids.forEach(k => g.add(k)); return g; }

// ---------- canvas textures ----------
const SANS = 'Inter, "Inter Display", "DejaVu Sans", sans-serif', MONO = '"DejaVu Sans Mono", monospace';
function ctex(wpx, hpx, draw) {
  const cv = document.createElement('canvas'); cv.width = wpx; cv.height = hpx; const x = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const redraw = fn => { x.clearRect(0, 0, wpx, hpx); fn(x, wpx, hpx); tex.needsUpdate = true; };
  if (draw) redraw(draw); return { tex, redraw, x };
}
function rrect(x, X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
function label(x, s, X, Y, size, col, weight = 900, align = 'center', font = SANS) {
  x.font = `${weight} ${size}px ${font}`; x.textAlign = align; x.textBaseline = 'middle'; x.fillStyle = col;
  const w = x.measureText(s).width, max = x.canvas.width * .92; if (w > max && align === 'center') { x.save(); x.translate(X, Y); x.scale(max / w, 1); x.fillText(s, 0, 0); x.restore(); } else x.fillText(s, X, Y);
}
// a chunky 3D sign: rounded plastic slab with a printed face
function sign(w, h, draw, o = {}) {
  const ppu = o.ppu ?? 260, depth = o.depth ?? .2;
  const slab = M(RB(w, h, depth, Math.min(h, w) * .22), plastic(o.color ?? 0xffffff));
  const t = ctex(Math.round(w * ppu), Math.round(h * ppu), draw);
  const face = M(new THREE.PlaneGeometry(w * .94, h * .86), new THREE.MeshBasicMaterial({ map: t.tex, transparent: true, toneMapped: false }), { shadow: false });
  face.position.z = depth / 2 + .004; const g = G(slab, face); g.userData.redraw = t.redraw; g.userData.face = face; return g;
}
const hex = c => '#' + new THREE.Color(c).getHexString();
const textSign = (w, h, txt, o = {}) => sign(w, h, (x, cw, ch) => {
  rrect(x, 0, 0, cw, ch, ch * .25); x.fillStyle = o.bg ?? hex(o.color ?? 0xffffff); x.fill();
  label(x, txt, cw / 2, ch / 2 + 4, o.size ?? ch * .52, o.fg ?? '#1d2442', 900, 'center', o.font ?? SANS);
}, o);
// flat billboard bubble (speech bubbles, tags)
function bubble(w, h, draw, tail = 0) {
  const ppu = 240, t = ctex(Math.round(w * ppu), Math.round(h * ppu), (x, cw, ch) => {
    const th = tail ? ch * .18 : 0; rrect(x, 6, 6, cw - 12, ch - 12 - th, (ch - th) * .3); x.fillStyle = '#ffffff'; x.shadowColor = 'rgba(40,30,80,.25)'; x.shadowBlur = 14; x.fill(); x.shadowBlur = 0;
    if (tail) { const tx = tail < 0 ? cw * .22 : cw * .78; x.beginPath(); x.moveTo(tx - 26, ch - th - 8); x.lineTo(tx + tail * 10, ch - 6); x.lineTo(tx + 26, ch - th - 8); x.fill(); }
    draw(x, cw, ch - th);
  });
  const m = M(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t.tex, transparent: true, toneMapped: false, depthWrite: false, fog: false }), { shadow: false });
  m.userData.redraw = t.redraw; return m;
}
const GLOWTEX = ctex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }).tex;
function sprite(color, size, op = 1) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOWTEX, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); s.scale.setScalar(size); return s; }

// ---------- stage: gradient sky, soft key + cool rim, cyclorama floor ----------
function gradTex(top, bottom) { return ctex(4, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(.62, bottom); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, w, h); }).tex; }
function stage(o = {}) {
  const scene = new THREE.Scene(); scene.background = gradTex(o.top ?? '#ffe3c2', o.bottom ?? '#ffb9a0');
  const floorCol = new THREE.Color(o.floor ?? o.bottom ?? '#ffb9a0');
  if (o.fog !== false) scene.fog = new THREE.Fog(new THREE.Color(o.fogColor ?? o.bottom ?? '#ffb9a0'), o.fogNear ?? 24, o.fogFar ?? 70);
  scene.add(new THREE.HemisphereLight(o.sky ?? 0xfff2e2, floorCol, o.hemi ?? 1.0));
  const key = new THREE.DirectionalLight(o.key ?? 0xfff0dc, o.keyI ?? 2.5); key.position.set(...(o.keyPos ?? [5, 10, 7])); key.castShadow = true;
  const b = o.shadowBox ?? 7; Object.assign(key.shadow.camera, { left: -b, right: b, top: b, bottom: -b, near: .5, far: 60 });
  key.shadow.mapSize.set(1536, 1536); key.shadow.bias = -.0004; key.shadow.normalBias = .03; key.shadow.radius = 4;
  if (o.keyTarget) key.target.position.set(...o.keyTarget); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(o.rim ?? 0xa9dcff, o.rimI ?? 1.8); rim.position.set(-6, 6, -8); scene.add(rim);
  if (o.floor !== null) { const f = M(new THREE.CircleGeometry(90, 64), matte(floorCol, { roughness: o.floorRough ?? .9 }), { rot: [-Math.PI / 2, 0, 0], shadow: false }); f.position.y = o.floorY ?? 0; scene.add(f); }
  const cam = new THREE.PerspectiveCamera(o.fov ?? 38, W / H, .1, 250);
  return { scene, cam, key, rim };
}
// every camera sits a little further back than written: the vertical frame is narrow
const ZOOM = 1.17;
let NOW = 0; // global time, for the handheld drift in the lively style
function aim(cam, pos, look) { cam.position.set(look[0] + (pos[0] - look[0]) * ZOOM, look[1] + (pos[1] - look[1]) * ZOOM, look[2] + (pos[2] - look[2]) * ZOOM);
  if (window.STYLE === 'lively') cam.position.add(new THREE.Vector3(Math.sin(NOW * 1.3) * .09 + Math.sin(NOW * 3.1) * .03, Math.sin(NOW * 1.7 + 1) * .07, Math.sin(NOW * .9 + 2) * .06));
  cam.lookAt(...look); }
// a hop with anticipation, stretch and landing squash: returns { y, sq } for time x (seconds) into a hop of length dur
function hop(x, dur = .7, h = .8) { if (x < 0 || x > dur + .25) return { y: 0, sq: 0 }; if (x < .12) return { y: 0, sq: .12 * Math.sin(x / .12 * Math.PI / 2) };
  if (x < dur) { const u = (x - .12) / (dur - .12); return { y: 4 * h * u * (1 - u), sq: -.1 * Math.sin(u * Math.PI) }; } const v = (x - dur) / .25; return { y: 0, sq: .14 * Math.sin(v * Math.PI) * (1 - v) }; }

// ---------- characters ----------
// Bit: glossy round robot, the request on its journey
function makeBit(o = {}) {
  const acc = o.accent ?? 0xff8a3d, root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.position.y = 1.12;
  body.add(M(SPH(1, 64, 48), plastic(o.shell ?? 0xf7f3ec), { scale: [1, .93, .9] }));
  body.add(M(SPH(1, 64, 40), plastic(0x161b2e, { roughness: .1, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.2 }), { pos: [0, .12, .5], scale: [.74, .57, .45] }));
  const eyes = [-1, 1].map(s => { const e = M(new THREE.CapsuleGeometry(.105, .16, 8, 20), glowM(o.eye ?? 0x38e8ff, 1.5), { pos: [s * .27, .15, .9], shadow: false }); body.add(e); return e; });
  [-1, 1].forEach(s => { body.add(M(SPH(.035, 12, 8), glowM(0xffffff, 4), { pos: [s * .27 + .05, .26, .99], shadow: false })); });
  [-1, 1].forEach(s => body.add(M(SPH(.1, 20, 14), matte(0xff94a8), { pos: [s * .56, -.16, .66], scale: [1, .75, .4], rot: [0, s * .7, 0] })));
  body.add(M(new THREE.TorusGeometry(.92, .065, 16, 64), plastic(acc), { pos: [0, -.3, 0], rot: [Math.PI / 2, 0, 0], scale: [1, .97, 1] }));
  body.add(M(new THREE.CylinderGeometry(.03, .04, .36, 12), metal(0xc8ccd8), { pos: [0, 1.03, 0] }));
  const ball = M(SPH(.11, 24, 16), glowM(acc, 3), { pos: [0, 1.25, 0] }); body.add(ball);
  const arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * .9, -.1, 0);
    sh.add(M(new THREE.CapsuleGeometry(.12, .3, 8, 16), plastic(acc), { pos: [0, -.27, 0] }), M(SPH(.16, 24, 16), plastic(acc), { pos: [0, -.55, 0] })); body.add(sh); return sh; });
  const feet = [-1, 1].map(s => { const f = M(SPH(.27, 32, 20), plastic(acc), { pos: [s * .42, .14, .1], scale: [1, .55, 1.25] }); root.add(f); return f; });
  if (o.carry) { const env = envelope(o.carry, .9); env.position.set(0, -.25, 1.05); body.add(env); root.userData.env = env; }
  root.userData = Object.assign(root.userData, { body, eyes, arms, feet, ball });
  root.pose = (p = {}) => {
    const s = p.s ?? 0, br = Math.sin(s * 3.2) * .035 * (p.bob ?? 1), hop = p.hop ?? 0;
    body.position.y = 1.12 + br + hop; body.scale.set(1 + br * .6 + (p.squash ?? 0), 1 - br * .6 - (p.squash ?? 0), 1 + br * .6 + (p.squash ?? 0));
    body.rotation.set(p.lookX ?? 0, p.lookY ?? 0, p.tilt ?? 0);
    const blink = (frac(s / 2.7 + (p.seed ?? 0)) < .045) ? .12 : 1, happy = p.happy ?? 0;
    eyes.forEach(e => { e.scale.set(1, blink * (1 - happy * .55), 1); e.position.y = .15 + happy * .03 - (p.sad ?? 0) * .05; });
    const wv = Math.sin(s * 11) * .35;
    const w = p.walk, sw = w === undefined ? 0 : Math.sin(w) * .55;
    arms[1].rotation.set(-(p.reachR ?? 0) * 1.3 + sw, 0, .18 + (p.waveR ?? 0) * (2.5 + wv) + (p.upR ?? 0) * 2.7);
    arms[0].rotation.set(-(p.reachL ?? 0) * 1.3 - sw, 0, -(.18 + (p.waveL ?? 0) * (2.5 + wv) + (p.upL ?? 0) * 2.7));
    feet.forEach((f, i) => { const ph = w === undefined ? 0 : w + i * Math.PI; f.position.y = .14 + (w === undefined ? 0 : Math.max(0, Math.sin(ph)) * .22); f.position.z = .1 + (w === undefined ? 0 : Math.cos(ph) * .22); });
    if (w !== undefined) { body.position.y += Math.abs(Math.sin(w)) * .08; body.rotation.z += Math.sin(w) * .07; }
    ball.material.emissiveIntensity = 2.6 + Math.sin(s * 6) * .8;
  };
  root.pose(); return root;
}
// Hosty: a friendly server
function makeHost(o = {}) {
  const col = o.color ?? 0x7b6cff, root = new THREE.Group(), body = new THREE.Group(); root.add(body); body.position.y = 1.4;
  body.add(M(RB(1.7, 2.4, 1.3, .32, 5), plastic(col)));
  body.add(M(RB(1.36, .78, .12, .18), plastic(0x141a2c, { roughness: .1, clearcoat: 1 }), { pos: [0, .58, .64] }));
  const eyes = [-1, 1].map(s => { const e = M(new THREE.CapsuleGeometry(.08, .12, 6, 16), glowM(0xb6ff5c, 3), { pos: [s * .3, .64, .72], shadow: false }); body.add(e); return e; });
  const smile = M(new THREE.TorusGeometry(.17, .035, 8, 32, Math.PI), glowM(0xb6ff5c, 3), { pos: [0, .44, .72], rot: [0, 0, Math.PI], shadow: false }); body.add(smile);
  const leds = [];
  for (let i = 0; i < 3; i++) { body.add(M(RB(1.3, .26, .1, .08), plastic(0x23293f), { pos: [0, -.18 - i * .36, .63] }));
    for (let j = 0; j < 3; j++) { const l = M(SPH(.05, 12, 8), glowM([0xb6ff5c, 0x35e0ff, 0xff4fa3][j], 3), { pos: [-.45 + j * .17, -.18 - i * .36, .7], shadow: false }); body.add(l); leds.push(l); } }
  const arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * .88, .1, 0); sh.add(M(new THREE.CapsuleGeometry(.12, .4, 8, 16), plastic(col), { pos: [0, -.32, 0] }), M(SPH(.16, 20, 14), plastic(0xeeeeff), { pos: [0, -.64, 0] })); body.add(sh); return sh; });
  [-1, 1].forEach(s => root.add(M(new THREE.CylinderGeometry(.2, .25, .2, 24), plastic(0x2a2f45), { pos: [s * .45, .1, 0] })));
  root.pose = (p = {}) => {
    const s = p.s ?? 0; body.position.y = 1.4 + Math.sin(s * 2.6) * .03; body.rotation.set(0, p.lookY ?? 0, p.tilt ?? 0);
    const blink = frac(s / 3.1 + .4) < .045 ? .12 : 1; eyes.forEach(e => e.scale.y = blink);
    leds.forEach((l, i) => l.material.emissiveIntensity = Math.sin(s * 7 + i * 1.7) > -.2 ? 3 : .2);
    arms[0].rotation.set(-(p.reachL ?? 0) * 1.3, 0, -.12 - (p.waveL ?? 0) * (2.4 + Math.sin(s * 11) * .35));
    arms[1].rotation.set(-(p.reachR ?? 0) * 1.3, 0, .12);
  };
  root.pose(); return root;
}
// packet critter: little rounded cube with eyes and a number
function critter(color, n, o = {}) {
  const g = new THREE.Group();
  g.add(M(RB(1, 1, 1, .3, 5), plastic(color)));
  const face = ctex(256, 256, (x) => { x.fillStyle = '#141a2c'; [-1, 1].forEach(s => { rrect(x, 128 + s * 52 - 18, 64, 36, 62, 18); x.fill(); }); x.fillStyle = '#fff'; [-1, 1].forEach(s => { x.beginPath(); x.arc(128 + s * 52 + 6, 78, 7, 0, 7); x.fill(); });
    if (n !== undefined && n !== '') label(x, String(n), 128, 184, 82, 'rgba(20,26,44,.85)', 900); });
  g.add(M(new THREE.PlaneGeometry(.86, .86), new THREE.MeshBasicMaterial({ map: face.tex, transparent: true, toneMapped: false }), { pos: [0, 0, .505], shadow: false }));
  if (o.tag) { const t = textSign(.95, .34, o.tag, { color: 0xffffff, size: 50, fg: '#1d2442', depth: .08, font: MONO }); t.position.set(0, .78, .1); g.add(t); }
  return g;
}
function envelope(txt, s = 1) {
  const g = new THREE.Group(); g.add(M(RB(1.3, .85, .08, .04), matte(0xfff6e4)));
  const t = ctex(520, 340, (x, w, h) => { x.strokeStyle = '#e8d6b4'; x.lineWidth = 8; x.beginPath(); x.moveTo(10, 10); x.lineTo(w / 2, h * .55); x.lineTo(w - 10, 10); x.stroke();
    x.fillStyle = '#e8484f'; x.beginPath(); x.arc(w / 2, h * .55, 34, 0, 7); x.fill(); if (txt) label(x, txt, w / 2, h * .84, 46, '#2a3150', 800, 'center', MONO); });
  g.add(M(new THREE.PlaneGeometry(1.26, .82), new THREE.MeshBasicMaterial({ map: t.tex, transparent: true }), { pos: [0, 0, .045], shadow: false }));
  g.scale.setScalar(s); return g;
}
function pedestal(r = 1.3, col = 0xffffff, acc = 0x35e0ff) { return G(M(new THREE.CylinderGeometry(r, r * 1.05, .4, 64), plastic(col), { pos: [0, .2, 0] }), M(new THREE.TorusGeometry(r * 1.01, .05, 12, 80), glowM(acc, 1.6), { pos: [0, .38, 0], rot: [Math.PI / 2, 0, 0], shadow: false })); }
function tree(x, z, s = 1, col = 0x5cc46a) { return G(M(new THREE.CylinderGeometry(.08 * s, .12 * s, .6 * s, 10), matte(0x8a5a3c), { pos: [x, .3 * s, z] }), M(SPH(.45 * s, 24, 16), plastic(col, { clearcoat: .3 }), { pos: [x, .85 * s, z] })); }
// confetti: deterministic burst from origin at time s0
function confetti(n, origin, seed = 7, spread = 3, up = 1) {
  const r = rng(seed), cols = [0xff4fa3, 0x35e0ff, 0xffc44d, 0xb6ff5c, 0x9b7bff, 0xffffff];
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(.09, .14, .02), new THREE.MeshStandardMaterial({ roughness: .5 }), n); im.castShadow = false;
  const P = []; for (let i = 0; i < n; i++) { P.push([(r() - .5) * spread, (3 + r() * 3.5) * up, (r() - .5) * spread * .6, r() * 10, r() * 6 + 2]); im.setColorAt(i, new THREE.Color(cols[i % cols.length])); }
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), one = V(1, 1, 1);
  im.update = s => { for (let i = 0; i < n; i++) { const [vx, vy, vz, ph, sp] = P[i], t = Math.max(0, s);
    p.set(origin[0] + vx * t * (1 - t * .15), origin[1] + vy * t - 4.2 * t * t + (t > 0 ? 0 : -50), origin[2] + vz * t); e.set(ph + t * sp, ph * 2 + t * sp * .7, 0); q.setFromEuler(e); m.compose(p, q, t > 0 ? one : V(0, 0, 0)); im.setMatrixAt(i, m); }
    im.instanceMatrix.needsUpdate = true; };
  im.update(-1); return im;
}
function sparkles(n, center, radius, color = 0xffffff, seed = 3) {
  const r = rng(seed), g = new THREE.Group(), P = [];
  for (let i = 0; i < n; i++) { const s = sprite(color, .25); g.add(s); P.push([r() * 6.3, r() * 2 - 1, r(), r() * 6]); }
  g.update = s => g.children.forEach((sp, i) => { const [a, y, rr, ph] = P[i]; const k = Math.abs(Math.sin(s * 2 + ph));
    sp.position.set(center[0] + Math.cos(a + s * .3) * radius * (.5 + rr * .5), center[1] + y * radius * .8 + Math.sin(s + ph) * .1, center[2] + Math.sin(a + s * .3) * radius * .4); sp.scale.setScalar(.12 + k * .22); sp.material.opacity = k; });
  return g;
}

// ---------- the sets ----------
const C = { cyan: 0x35e0ff, pink: 0xff4fa3, lime: 0xb6ff5c, amber: 0xffc44d, violet: 0x9b7bff, red: 0xff5a5a, orange: 0xff8a3d };
const BUILD = {};

function laptopRig(st) {
  const lap = new THREE.Group();
  lap.add(M(RB(3.4, .2, 2.3, .09), metal(0xc9cdd8, { roughness: .35 }), { pos: [0, .1, 0] }));
  lap.add(M(RB(2.9, .02, 1.0, .01), matte(0x2a2f40), { pos: [0, .21, -.25] }));
  lap.add(M(RB(1.0, .02, .6, .01), matte(0xaab0bf), { pos: [0, .21, .7] }));
  const lid = new THREE.Group(); lid.position.set(0, .2, -1.1); lid.rotation.x = -.2; lap.add(lid);
  lid.add(M(RB(3.4, 2.2, .12, .09), metal(0xc9cdd8, { roughness: .35 }), { pos: [0, 1.1, 0] }));
  const scr = ctex(1024, 640); const screen = M(new THREE.PlaneGeometry(3.1, 1.94), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }), { pos: [0, 1.12, .065], shadow: false }); lid.add(screen);
  st.scene.add(lap); return { lap, lid, scr };
}
function drawBrowser(x, w, h, url, cursor, page, lockOn) {
  x.fillStyle = '#f4f6fb'; x.fillRect(0, 0, w, h); x.fillStyle = '#e3e8f2'; x.fillRect(0, 0, w, 150);
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(46 + i * 40, 40, 13, 0, 7); x.fill(); });
  rrect(x, 30, 62, w - 60, 76, 38); x.fillStyle = '#fff'; x.fill();
  x.font = `700 50px ${MONO}`; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillStyle = '#1d2442'; x.fillText(url, 64 + (lockOn ? 30 : 0), 102);
  if (cursor) { x.fillStyle = '#2b7bff'; x.fillRect(70 + (lockOn ? 30 : 0) + x.measureText(url).width, 76, 6, 50); }
  const items = [[60, 150, w - 120, 190, '#9b7bff'], [60, 370, 560, 34, '#2a3150'], [60, 420, 400, 24, '#9aa3bd'], [60, 470, 280, 140, '#35c8ef'], [372, 470, 280, 140, '#ff6fb1'], [684, 470, 280, 140, '#9ee85a']];
  items.forEach(([X, Y, ww, hh, c], i) => { const k = clamp(page * items.length * .9 - i); if (k <= 0) return; x.globalAlpha = k; rrect(x, X, Y + (1 - k) * 20, ww, hh, 14); x.fillStyle = c; x.fill(); x.globalAlpha = 1; });
}
BUILD.type = (p) => {
  const st = stage({ top: '#ffe9cc', bottom: '#f3b487', floor: 0xd99a68, keyPos: [4, 9, 8] });
  const { scr } = laptopRig(st);
  const key = new THREE.Group(); key.position.set(0, .2, 2.2); key.scale.setScalar(.72); st.scene.add(key);
  const cap = sign(1.9, 1.0, (x, w, h) => { label(x, 'ENTER ⏎', w / 2, h / 2 + 4, 120, '#0d3b4f', 900); }, { color: C.cyan, depth: .55 });
  cap.rotation.x = -Math.PI / 2 + .35; cap.position.y = .32; key.add(cap);
  const ring = M(new THREE.TorusGeometry(1, .04, 8, 64), glowM(C.cyan, 3), { rot: [Math.PI / 2, 0, 0], shadow: false }); ring.position.y = .1; key.add(ring);
  const plants = G(M(new THREE.CylinderGeometry(.35, .28, .6, 24), plastic(0xff7a59), { pos: [-2.3, .3, -.6] }), M(SPH(.5, 24, 16), plastic(0x55c271), { pos: [-2.3, .95, -.6] }));
  st.scene.add(plants, M(RB(.6, .8, .6, .12), plastic(0xffffff), { pos: [2.2, .4, -.4] }));
  return { ...st, update(t, s) {
    const n = Math.floor(seg(t, .05, .55) * p.url.length); scr.redraw((x, w, h) => drawBrowser(x, w, h, p.url.slice(0, n), Math.floor(s * 2.2) % 2 === 0, 0));
    const k = seg(t, .62, .74); cap.position.y = .32 - (k > 0 && k < 1 ? Math.sin(k * Math.PI) * .22 : 0);
    const r = seg(t, .7, 1); ring.scale.setScalar(.6 + r * 3.5); ring.material.emissiveIntensity = 3 * (1 - r) * (r > 0 ? 1 : 0);
    aim(st.cam, [lerp(.3, 0, ease(t)), lerp(2.2, 2.5, ease(t)), lerp(8.2, 7.4, ease(t))], [0, 1.25, 0]);
  } };
};
BUILD.timer = () => {
  const st = stage({ top: '#ffe9cc', bottom: '#f3b487', floor: 0xd99a68, keyPos: [4, 9, 8] });
  const { scr } = laptopRig(st);
  const watch = new THREE.Group(); watch.position.set(0, 3.95, .4); st.scene.add(watch);
  watch.add(M(new THREE.CylinderGeometry(.8, .8, .26, 64), metal(0xffc44d), { rot: [Math.PI / 2, 0, 0] }));
  watch.add(M(new THREE.CylinderGeometry(.12, .12, .3, 20), metal(0xffc44d), { pos: [0, .92, 0] }), M(RB(.4, .16, .2, .06), plastic(C.red), { pos: [0, 1.1, 0] }));
  const face = ctex(512, 512); watch.add(M(new THREE.CircleGeometry(.68, 64), new THREE.MeshBasicMaterial({ map: face.tex, toneMapped: false }), { pos: [0, 0, .135], shadow: false }));
  const sp = sparkles(14, [0, 2.0, 0], 2.2, 0xffffff); st.scene.add(sp);
  return { ...st, update(t, s) {
    scr.redraw((x, w, h) => drawBrowser(x, w, h, 'example.com', false, seg(t, .1, .8)));
    const v = lerp(0, .6, ease(seg(t, .05, .8)));
    face.redraw((x, w, h) => { x.fillStyle = '#fffaf0'; x.beginPath(); x.arc(256, 256, 256, 0, 7); x.fill();
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.fillStyle = '#c9b48a'; x.fillRect(256 + Math.sin(a) * 210 - 4, 256 - Math.cos(a) * 210 - 14, 8, 28); }
      x.strokeStyle = '#e8484f'; x.lineWidth = 10; x.lineCap = 'round'; const a = v / 1 * Math.PI * 2; x.beginPath(); x.moveTo(256, 256); x.lineTo(256 + Math.sin(a) * 170, 256 - Math.cos(a) * 170); x.stroke();
      label(x, v.toFixed(3) + 's', 256, 360, 64, '#1d2442', 900, 'center', MONO); });
    watch.scale.setScalar(pop(s - .1) * .95); watch.rotation.z = Math.sin(s * 2) * .06; sp.update(s);
    aim(st.cam, [0, 3.0, lerp(9.4, 9.0, t)], [0, 1.9, 0]);
  } };
};
BUILD.title = (p) => {
  const st = stage({ top: '#8fc8ff', bottom: '#ffd0e6', floor: 0xffc6df, rimI: 2.2 });
  const bit = makeBit(); bit.position.y = .4; st.scene.add(pedestal(1.3), bit);
  const s1 = textSign(3.5, .9, p.top, { color: 0xffffff, fg: '#1d2442' }), s2 = textSign(3.5, .72, p.bottom, { color: C.cyan, fg: '#ffffff', size: 100 });
  s1.position.set(0, 4.55, 0); s2.position.set(0, 3.65, .2); st.scene.add(s1, s2);
  const orbs = [C.pink, C.amber, C.lime, C.violet].map(c => { const o = M(SPH(.16, 24, 16), plastic(c)); st.scene.add(o); return o; });
  return { ...st, update(t, s) {
    bit.pose({ s, waveR: seg(t, .15, .25) * (1 - seg(t, .85, .95)), happy: .6 });
    s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .35)); s1.rotation.z = Math.sin(s * 1.6) * .02; s2.rotation.z = -Math.sin(s * 1.6 + 1) * .02;
    orbs.forEach((o, i) => { const a = s * .8 + i * 1.57; o.position.set(Math.cos(a) * 1.9, 1.6 + Math.sin(a * 1.3) * .5, Math.sin(a) * 1.2); });
    const a = Math.sin(s * .35) * .18; aim(st.cam, [Math.sin(a) * 10, 2.8, Math.cos(a) * 10], [0, 2.35, 0]);
  } };
};
BUILD.names = () => {
  const st = stage({ top: '#cbb9ff', bottom: '#ffe0c4', floor: 0xffd8bd });
  const cpu = new THREE.Group(); cpu.position.set(.75, 0, -1.4); st.scene.add(cpu);
  const chip = M(RB(1.9, 1.9, .5, .16), plastic(0x2d3350, { roughness: .25 }), { pos: [0, 1.75, 0] }); cpu.add(chip);
  for (let i = 0; i < 5; i++) [-1, 1].forEach(sd => { cpu.add(M(RB(.12, .34, .12, .04), metal(0xffc44d), { pos: [-.7 + i * .35, 1.75 + sd * 1.07, 0] })); cpu.add(M(RB(.34, .12, .12, .04), metal(0xffc44d), { pos: [sd * 1.07, 1.05 + i * .35, 0] })); });
  [-1, 1].forEach(sd => cpu.add(M(new THREE.CylinderGeometry(.08, .08, .6, 12), metal(0xc9cdd8), { pos: [sd * .45, .4, 0] }), M(SPH(.2, 20, 14), plastic(0x2d3350), { pos: [sd * .45, .1, .05], scale: [1, .6, 1.3] })));
  const cpuEyes = [-1, 1].map(sd => { const e = M(new THREE.CapsuleGeometry(.09, .14, 6, 16), glowM(C.violet, 3), { pos: [sd * .34, 1.95, .27], shadow: false }); cpu.add(e); return e; });
  const lbl = textSign(.9, .32, 'CPU', { color: 0x3c4466, fg: '#c9b8ff', size: 60, depth: .04 }); lbl.position.set(0, 1.4, .27); cpu.add(lbl);
  const q = textSign(.62, .62, '?', { color: C.red, fg: '#ffffff', size: 120 }); q.position.set(.75 + .9, 3.4, -1.1); st.scene.add(q);
  const bit = makeBit(); bit.scale.setScalar(.72); bit.position.set(-.75, 0, 1.0); st.scene.add(bit);
  const card = new THREE.Group(); card.position.set(-.45, 2.5, 1.25); st.scene.add(card);
  const front = textSign(2.0, .58, 'example.com', { color: 0xffffff, fg: '#1d2442', font: MONO, size: 86 }), backS = textSign(2.0, .58, '203.0.113.7', { color: 0x1d2442, fg: '#b6ff5c', font: MONO, size: 86 });
  backS.rotation.y = Math.PI; backS.position.z = -.01; card.add(front, backS);
  return { ...st, update(t, s) {
    const flip = ease(seg(t, .6, .74)); card.rotation.y = flip * Math.PI; card.position.y = 2.5 + Math.sin(flip * Math.PI) * .35;
    bit.pose({ s, upR: 1, upL: 1, lookY: .25, happy: flip * .7 });
    const conf = seg(t, .25, .32) * (1 - seg(t, .6, .66)); q.scale.setScalar(conf); q.rotation.z = Math.sin(s * 5) * .15;
    cpuEyes.forEach((e, i) => { e.scale.y = flip > .5 ? .45 : 1; e.rotation.z = conf * (i ? -.5 : .5); });
    chip.rotation.z = conf * Math.sin(s * 4) * .06;
    aim(st.cam, [0, 2.4, lerp(9.2, 8.6, t)], [0, 1.95, 0]);
  } };
};
BUILD.cache = () => {
  const st = stage({ top: '#bff3e9', bottom: '#ffe6c4', floor: 0xffdcb4 });
  const cab = new THREE.Group(); cab.position.set(-.35, 0, -.4); st.scene.add(cab);
  cab.add(M(RB(2.7, 4.3, 1.6, .2), plastic(0x4f7cff), { pos: [0, 2.15, 0] }));
  const rows = [['news-site.com', '198.51.100.4'], ['mail.app', '192.0.2.88'], ['video.tv', '198.51.100.21'], ['example.com', '?']];
  const drawers = rows.map(([n, ip], i) => { const d = new THREE.Group(); d.position.set(0, 3.7 - i * 1.0, .8); cab.add(d);
    d.add(M(RB(2.4, .86, .26, .1), plastic(0xdfe8ff), { pos: [0, 0, 0] }));
    d.add(M(RB(2.3, .7, 1.2, .05), matte(0xc4d0f0), { pos: [0, 0, -.65] }));
    const lb = sign(2.2, .52, (x, w, h) => { rrect(x, 0, 0, w, h, 20); x.fillStyle = '#ffffff'; x.fill(); label(x, n, 20, h / 2, 34, '#1d2442', 700, 'left', MONO); label(x, ip, w - 20, h / 2, 34, i === 3 ? '#ff4a4a' : '#2c9e3a', 800, 'right', MONO); }, { depth: .04, color: 0xffffff });
    lb.position.set(0, .05, .14); d.add(lb); d.add(M(RB(.5, .1, .1, .04), metal(0x9aa3bd), { pos: [0, -.28, .17] })); return d; });
  const bit = makeBit(); bit.scale.setScalar(.58); bit.position.set(1.35, 0, 1.7); st.scene.add(bit);
  const nf = textSign(1.9, .55, 'NOT FOUND', { color: C.red, fg: '#ffffff', size: 76 }); nf.position.set(-.35, 1.05, 2.2); st.scene.add(nf);
  return { ...st, update(t, s) {
    const scan = seg(t, .22, .82) * 4;
    drawers.forEach((d, i) => { const k = i === 3 ? seg(scan, 3, 3.3) : Math.sin(clamp(scan - i) * Math.PI); d.position.z = .8 + ease(k) * .9; });
    nf.scale.setScalar(t > .85 ? Math.min(1.2, pop((t - .85) * 6)) : 0);
    bit.pose({ s, lookY: -.7, sad: seg(t, .85, .9), reachL: seg(t, .2, .3) * .6 });
    aim(st.cam, [.2, 2.6, lerp(10, 9.4, t)], [0, 2.15, 0]);
  } };
};
function island(col, txt, o = {}) {
  const g = new THREE.Group();
  g.add(M(new THREE.CylinderGeometry(1.1, 1.05, .32, 48), plastic(0x7fd17a, { clearcoat: .3 }), { pos: [0, -.16, 0] }));
  g.add(M(new THREE.ConeGeometry(1.05, 1.5, 48), matte(0xb98a63), { pos: [0, -1.07, 0], rot: [Math.PI, 0, 0] }));
  g.add(M(RB(.9, 1.2, .9, .2), plastic(col), { pos: [0, .6, -.15] }));
  g.add(M(new THREE.ConeGeometry(.62, .55, 4), plastic(0xffffff), { pos: [0, 1.48, -.15], rot: [0, Math.PI / 4, 0] }));
  const s = textSign(o.w ?? 1.4, .46, txt, { color: 0xffffff, fg: '#1d2442', size: 64, depth: .1 }); s.position.set(0, .55, .45); g.add(s);
  g.add(tree(.75, .35, .55), tree(-.8, .1, .45, 0x46b35a)); return g;
}
BUILD.dns = () => {
  const st = stage({ top: '#79a8ff', bottom: '#ffc7a8', floor: null, fogNear: 14, fogFar: 40, shadowBox: 12, keyPos: [6, 14, 10] });
  const P = { res: V(0, 0, 2), root: V(-1.3, 1.7, -1.5), com: V(1.3, 3.2, -4.5), ns: V(-.6, 4.8, -7.5) };
  const isl = [[P.res, C.cyan, 'DNS'], [P.root, C.amber, 'ROOT'], [P.com, C.violet, '.COM'], [P.ns, C.pink, 'SITE']].map(([pos, col, txt], i) => { const g = island(col, txt, { w: 1.4 }); g.position.copy(pos); st.scene.add(g); return g; });
  const route = [P.res, P.root, P.com, P.ns].map(v => v.clone().add(V(0, 2.1, .3)));
  const trails = [], cols = [C.amber, C.violet, C.pink];
  for (let i = 0; i < 3; i++) { const a = route[i], b = route[i + 1], mid = a.clone().lerp(b, .5).add(V(0, .8, 0)); const cur = new THREE.QuadraticBezierCurve3(a, mid, b);
    const tube = M(new THREE.TubeGeometry(cur, 48, .045, 8), glowM(cols[i], 2.5), { shadow: false }); tube.geometry.setDrawRange(0, 0); st.scene.add(tube); trails.push([cur, tube]); }
  const bit = makeBit({ carry: '?' }); bit.scale.setScalar(.36); st.scene.add(bit);
  const clouds = [[-2.4, 3.6, -3], [2.3, 1.2, -1], [2.2, 5.6, -9]].map(([x, y, z]) => { const c = G(...[0, 1, 2].map(i => M(SPH(.5 + i * .1, 24, 16), matte(0xffffff), { pos: [i * .55 - .5, (i % 2) * .15, 0] }))); c.position.set(x, y, z); st.scene.add(c); return c; });
  return { ...st, update(t, s) {
    isl.forEach((g, i) => { g.scale.setScalar(Math.min(1, pop(s - i * .25))); g.position.y = [P.res, P.root, P.com, P.ns][i].y + Math.sin(s * 1.2 + i) * .08; });
    const legs = [[.22, .42], [.47, .66], [.71, .9]]; let pos = route[0].clone();
    legs.forEach(([a, b], i) => { const k = ease(seg(t, a, b)); const [cur, tube] = trails[i]; tube.geometry.setDrawRange(0, Math.floor(k * tube.geometry.index.count / 6) * 6); if (t >= a) pos = cur.getPoint(k); });
    bit.position.copy(pos).add(V(0, -.75 + Math.sin(s * 5) * .05, 0)); bit.pose({ s, upR: .4, upL: .4, lookY: Math.sin(s) * .3 });
    clouds.forEach((c, i) => c.position.x += Math.sin(s * .2 + i) * .002);
    const ly = lerp(1.6, 4.0, ease(seg(t, .15, .95))); aim(st.cam, [0, ly + 1.2, lerp(12.5, 11, t) + 0], [0, ly, -2.8]);
  } };
};
BUILD.ip = (p) => {
  const st = stage({ top: '#bfffe0', bottom: '#fff0c4', floor: 0xffe9b5 });
  const board = sign(3.5, 1.15, () => {}, { color: 0x1d2442, depth: .3 }); board.position.set(0, 3.3, 0); st.scene.add(board);
  [-1, 1].forEach(sd => st.scene.add(M(new THREE.CylinderGeometry(.07, .07, 3.2, 16), metal(0xc9cdd8), { pos: [sd * 1.3, 1.6, -.1] })));
  const tag = textSign(1.7, .42, 'IP ADDRESS', { color: C.lime, fg: '#1d2442', size: 60 }); tag.position.set(0, 4.1, .1); st.scene.add(tag);
  const bit = makeBit(); bit.scale.setScalar(.66); bit.position.set(.25, 0, 1.6); st.scene.add(bit);
  const conf = confetti(160, [0, 5.2, 1.4], 11, 4, .25); st.scene.add(conf);
  return { ...st, update(t, s, d) {
    const n = Math.floor(seg(t, .1, .55) * p.ip.length);
    board.userData.redraw((x, w, h) => { label(x, p.ip.slice(0, n) + (t < .6 && Math.floor(s * 3) % 2 ? '_' : ''), w / 2, h / 2 + 4, 150, '#b6ff5c', 700, 'center', MONO); });
    board.scale.setScalar(Math.min(1.15, pop(s))); tag.scale.setScalar(pop(s - .25));
    bit.pose({ s, upL: ease(seg(t, .55, .65)), upR: ease(seg(t, .55, .65)), happy: seg(t, .55, .6), hop: Math.max(0, Math.sin(clamp((t - .58) * 3) * Math.PI * 2)) * .25, lookX: -.2 });
    conf.update(s - .58 * d);
    aim(st.cam, [0, 2.6, lerp(9.6, 9.1, t)], [0, 2.3, 0]);
  } };
};
BUILD.packets = () => {
  const st = stage({ top: '#ffdcb6', bottom: '#ffb8c6', floor: 0xffb5c3 });
  const env = envelope('GET /  example.com', 1.9); env.position.set(0, 2.9, .3); st.scene.add(env);
  const cols = [C.cyan, C.pink, C.lime, C.amber, C.violet, C.orange];
  const crs = cols.map((c, i) => { const k = critter(c, i + 1); k.scale.setScalar(.62); st.scene.add(k); return k; });
  const tag = sign(3.0, .85, (x, w, h) => { rrect(x, 0, 0, w, h, 30); x.fillStyle = '#fff'; x.fill(); label(x, 'FROM  192.168.1.20', w / 2, h * .32, 66, '#6a7393', 700, 'center', MONO); label(x, 'TO    203.0.113.7', w / 2, h * .7, 66, '#1d2442', 800, 'center', MONO); }, { depth: .14 });
  tag.position.set(0, 1.55, 1.4); st.scene.add(tag);
  const puff = sparkles(16, [0, 2.9, .3], 1.4, 0xffffff, 5); st.scene.add(puff);
  return { ...st, update(t, s) {
    const burst = seg(t, .13, .22); env.scale.setScalar(1.9 * (1 - ease(burst)) * (1 + Math.sin(s * 18) * .04 * (1 - burst))); env.rotation.z = Math.sin(s * 9) * .06 * (1 - burst);
    puff.visible = burst > 0 && burst < 1 || seg(t, .22, .3) < 1 && t > .13; puff.update(s);
    crs.forEach((k, i) => { const tx = (i % 2 ? .78 : -.78), ty = 4.55 - Math.floor(i / 2) * .9, kk = pop((t - .16) * 6 - i * .12) ;
      k.position.set(lerp(0, tx, Math.min(1, kk)), lerp(2.9, ty, Math.min(1, kk)) + Math.sin(s * 4 + i) * .06, .4); k.scale.setScalar(.62 * clamp(kk * 1.4)); k.rotation.set(Math.sin(s * 3 + i) * .1, Math.sin(s * 2 + i) * .25, 0); });
    tag.scale.setScalar(t > .5 ? Math.min(1.1, pop((t - .5) * 5)) : 0);
    aim(st.cam, [0, 2.7, lerp(9.4, 9.0, t)], [0, 2.45, 0]);
  } };
};
BUILD.routes = () => {
  const st = stage({ top: '#a6e4ff', bottom: '#cdeeb3', floor: 0x9dd67f, shadowBox: 13, fogNear: 22, fogFar: 55, keyPos: [6, 14, 8] });
  const N = { H: [0, 5.2], A: [-1.7, 2.6], B: [1.7, 2.2], C: [0, -.4], D: [-1.9, -3.4], E: [1.9, -3.8], F: [0, -6.6], S: [0, -9.4] };
  const E = [['H', 'A'], ['H', 'B'], ['A', 'C'], ['B', 'C'], ['A', 'D'], ['B', 'E'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F'], ['F', 'S']];
  E.forEach(([a, b]) => { const [x1, z1] = N[a], [x2, z2] = N[b], L = Math.hypot(x2 - x1, z2 - z1); st.scene.add(M(RB(.42, .06, L, .02), matte(0x5d6577), { pos: [(x1 + x2) / 2, .03, (z1 + z2) / 2], rot: [0, Math.atan2(x2 - x1, z2 - z1), 0], shadow: false })); });
  'ABCDEF'.split('').forEach(k => { const [x, z] = N[k]; st.scene.add(M(new THREE.CylinderGeometry(.6, .66, .22, 40), plastic(0xffffff), { pos: [x, .11, z] }), M(new THREE.CylinderGeometry(.38, .38, .06, 32), plastic(C.violet), { pos: [x, .24, z] }), M(new THREE.CylinderGeometry(.03, .03, .5, 8), metal(0xc9cdd8), { pos: [x, .5, z] }), M(SPH(.08, 12, 8), glowM(C.lime, 3), { pos: [x, .78, z] })); });
  const home = G(M(RB(1.1, .8, 1, .1), plastic(0xfff3e0), { pos: [0, .4, 0] }), M(new THREE.ConeGeometry(.9, .6, 4), plastic(C.red), { pos: [0, 1.1, 0], rot: [0, Math.PI / 4, 0] })); home.position.set(N.H[0], 0, N.H[1]); st.scene.add(home);
  const host = makeHost(); host.scale.setScalar(.75); host.position.set(N.S[0], 0, N.S[1]); st.scene.add(host);
  const r = rng(4); for (let i = 0; i < 26; i++) { const x = (r() - .5) * 9, z = 6 - r() * 18; if (Math.abs(x) < 2.5 && r() < .8) continue; st.scene.add(tree(x, z, .7 + r() * .6, r() < .5 ? 0x55c271 : 0x3fae63)); }
  const paths = [['H', 'A', 'D', 'F', 'S'], ['H', 'B', 'E', 'F', 'S'], ['H', 'A', 'C', 'E', 'F', 'S'], ['H', 'B', 'C', 'D', 'F', 'S']].map(ps => new THREE.CatmullRomCurve3(ps.map(k => V(N[k][0], .55, N[k][1])), false, 'catmullrom', .1));
  const cols = [C.cyan, C.pink, C.lime, C.amber], arrive = [.62, .82, .55, .74], order = [2, 0, 3, 1];
  const crs = cols.map((c, i) => { const k = critter(c, i + 1); k.scale.setScalar(.48); st.scene.add(k); return k; });
  return { ...st, update(t, s) {
    crs.forEach((k, i) => { const a = .08 + i * .05, u = seg(t, a, arrive[i]);
      if (u < 1) { const p = paths[i].getPoint(ease(u)), q = paths[i].getPoint(Math.min(1, ease(u) + .01)); k.position.set(p.x, .5 + Math.abs(Math.sin(s * 9 + i)) * .18, p.z); k.rotation.set(0, Math.atan2(q.x - p.x, q.z - p.z) + Math.PI, 0); k.visible = u > 0; }
      else { const sk = ease(seg(t, .88, .96)), x0 = -1.35 + order.indexOf(i) * .9, x1 = -1.35 + i * .9;
        k.position.set(t > .88 ? lerp(x0, x1, sk) : x0, .5 + (t > .88 ? Math.sin(sk * Math.PI) * .5 : 0), N.S[1] + 1.7); k.rotation.set(0, 0, 0); k.visible = true; } });
    host.pose({ s, waveL: seg(t, .55, .6) * (1 - seg(t, .7, .75)) });
    aim(st.cam, [0, lerp(10.5, 9.5, t), lerp(12.5, 11.5, t)], [0, 0, -2.6]);
  } };
};
BUILD.cable = () => {
  const st = stage({ top: '#2ea6cc', bottom: '#073550', floor: 0xc9b98c, fogColor: '#0b4a6b', fogNear: 5, fogFar: 32, sky: 0x9fe9ff, hemi: 1.3, key: 0xbff4ff, keyI: 2.2, keyPos: [2, 14, 4], shadowBox: 10 });
  const pts = []; for (let i = 0; i <= 16; i++) pts.push(V(Math.sin(i * .7) * 1.4 + .4, .28, 7 - i * 3));
  const cur = new THREE.CatmullRomCurve3(pts); st.scene.add(M(new THREE.TubeGeometry(cur, 300, .2, 16), plastic(0x2a2f3c, { roughness: .5 })));
  for (let i = 0; i < 30; i++) { const u = i / 30, p = cur.getPoint(u), tg = cur.getTangent(u); const c = M(new THREE.TorusGeometry(.23, .05, 8, 24), metal(0x8a93a8)); c.position.copy(p); c.lookAt(p.clone().add(tg)); st.scene.add(c); }
  const pulses = []; for (let i = 0; i < 9; i++) { const g = G(M(SPH(.17, 20, 14), glowM(0xbffcff, 6), { shadow: false }), sprite(0x6ff0ff, 1.6, .9)); st.scene.add(g); pulses.push(g); }
  const r = rng(9);
  for (let i = 0; i < 40; i++) { const x = (r() - .5) * 12, z = 6 - r() * 40; if (Math.abs(x - .4) < 1.2) continue; st.scene.add(M(new THREE.DodecahedronGeometry(.25 + r() * .6, 1), matte(r() < .5 ? 0x7a6f8f : 0x5f6c80), { pos: [x, .1, z], scale: [1, .6, 1] })); }
  const weeds = []; for (let i = 0; i < 22; i++) { const x = (r() - .5) * 8, z = 5 - r() * 20; if (Math.abs(x - .4) < 1) continue; const h = 1 + r() * 1.8; const w = M(new THREE.ConeGeometry(.12, h, 8), plastic(r() < .5 ? 0x3fbf7f : 0x7ad85a, { clearcoat: .2 }), { pos: [x, h / 2, z] }); st.scene.add(w); weeds.push([w, r() * 6]); }
  const bubbles = []; for (let i = 0; i < 30; i++) { const b = M(SPH(.06 + r() * .06, 12, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .45, roughness: 0, envMap: ENV }), { shadow: false }); st.scene.add(b); bubbles.push([b, (r() - .5) * 6, 4 - r() * 14, r()]); }
  const rider = critter(C.cyan, ''); rider.scale.setScalar(.32); st.scene.add(rider);
  const spd = sign(2.9, 1.1, () => {}, { color: 0xffffff, depth: .2 }); spd.position.set(.45, 4.25, 0); st.scene.add(spd);
  return { ...st, update(t, s) {
    pulses.forEach((g, i) => { const u = 1 - frac(s * .09 + i / 9); g.position.copy(cur.getPoint(u)); });
    const ru = 1 - frac(s * .09), rp = cur.getPoint(clamp(ru)); rider.position.set(rp.x, rp.y + .4, rp.z); rider.rotation.y = Math.PI;
    weeds.forEach(([w, ph]) => w.rotation.z = Math.sin(s * 1.3 + ph) * .12);
    bubbles.forEach(([b, x, z, ph]) => { const y = frac(s * .12 + ph) * 7; b.position.set(x + Math.sin(s + ph * 6) * .2, y, z); });
    const v = Math.round(lerp(0, 200000, ease(seg(t, .18, .7))));
    spd.userData.redraw((x, w, h) => { rrect(x, 0, 0, w, h, h * .2); x.fillStyle = '#fff'; x.fill(); label(x, v.toLocaleString('en-US') + ' km/s', w / 2, h * .38, 140, '#0b6f95', 900, 'center', MONO); label(x, 'about 2/3 the speed of light', w / 2, h * .78, 60, '#5a6688', 700); });
    spd.scale.setScalar(Math.min(1.1, pop(s - .2))); spd.rotation.z = Math.sin(s) * .02;
    aim(st.cam, [lerp(.4, .9, t), 2.4, lerp(9.5, 8.2, t)], [.3, 2.2, -2]);
  } };
};
function speech(w, h, tag, say, col, tail) {
  return bubble(w, h, (x, cw, ch) => { label(x, tag, cw / 2, ch * .33, ch * .28, col, 900, 'center', MONO); label(x, say, cw / 2, ch * .7, ch * .26, '#1d2442', 800); }, tail);
}
BUILD.shake = () => {
  const st = stage({ top: '#ffe2b8', bottom: '#ffc1a6', floor: 0xffbfa1 });
  const bit = makeBit(); bit.scale.setScalar(.72); bit.position.set(-1.0, 0, .7); st.scene.add(bit);
  const host = makeHost(); host.scale.setScalar(.72); host.position.set(1.05, 0, -.1); host.rotation.y = -.35; st.scene.add(host); bit.rotation.y = .35;
  const b = [speech(2.7, 1.0, 'SYN', '"Hello?"', '#0aa6c9', -1), speech(2.9, 1.0, 'SYN-ACK', '"Hello, I hear you!"', '#e0337f', 1), speech(2.9, 1.0, 'ACK', '"Great, let\'s talk!"', '#4c9a12', -1)];
  b[0].position.set(-.4, 4.5, 1); b[1].position.set(.4, 3.6, 1); b[2].position.set(-.4, 2.7, 1.1); b.forEach(x => st.scene.add(x));
  return { ...st, update(t, s) {
    const at = [.08, .36, .64]; b.forEach((x, i) => { x.scale.setScalar(Math.min(1.08, pop((t - at[i]) * 4))); });
    const sh = seg(t, .82, .88), shake = Math.sin(s * 14) * .25 * sh;
    bit.pose({ s, reachR: sh * .9 + shake, happy: seg(t, .64, .7), lookY: 0 }); host.pose({ s, reachL: sh * .9 - shake });
    aim(st.cam, [0, 2.6, lerp(9.8, 9.3, t)], [0, 2.35, 0]);
  } };
};
function padlock() {
  const g = new THREE.Group(), gold = metal(0xffc44d, { roughness: .22 });
  g.add(M(RB(1.9, 1.55, .75, .26), gold, { pos: [0, 0, 0] }));
  const shackle = G(M(new THREE.TorusGeometry(.58, .15, 20, 48, Math.PI), metal(0xd7dbe6)), M(new THREE.CylinderGeometry(.15, .15, .6, 20), metal(0xd7dbe6), { pos: [-.58, -.3, 0] }), M(new THREE.CylinderGeometry(.15, .15, .6, 20), metal(0xd7dbe6), { pos: [.58, -.3, 0] }));
  shackle.position.y = .75; g.add(shackle);
  g.add(M(new THREE.CylinderGeometry(.16, .16, .1, 24), matte(0x2a1d08), { pos: [0, .08, .38], rot: [Math.PI / 2, 0, 0], shadow: false }), M(RB(.12, .35, .1, .04), matte(0x2a1d08), { pos: [0, -.15, .38], shadow: false }));
  g.userData.shackle = shackle; return g;
}
function keyMesh(col) { const g = new THREE.Group(), m = metal(col); g.add(M(new THREE.TorusGeometry(.26, .08, 12, 32), m, { pos: [-.55, 0, 0] }), M(RB(.9, .12, .1, .04), m, { pos: [.1, 0, 0] }), M(RB(.1, .22, .1, .03), m, { pos: [.42, -.13, 0] }), M(RB(.1, .16, .1, .03), m, { pos: [.25, -.1, 0] })); return g; }
BUILD.lock = () => {
  const st = stage({ top: '#2c3f78', bottom: '#f0a6c4', floor: 0xe7a0bf, hemi: .9, rim: 0x9ad8ff, rimI: 2.4 });
  const lk = padlock(); lk.position.set(0, 3.55, 0); st.scene.add(lk);
  const k1 = keyMesh(0xffe08a), k2 = keyMesh(0xffe08a); st.scene.add(k1, k2);
  const ring = M(new THREE.TorusGeometry(1.4, .05, 8, 80), glowM(C.lime, 3), { shadow: false }); ring.position.copy(lk.position); st.scene.add(ring);
  const snoop = new THREE.Group(); snoop.position.set(.75, 0, 1.3); st.scene.add(snoop);
  snoop.add(M(RB(1.1, .9, .9, .18), plastic(0x8d6e4f), { pos: [-.25, .45, 0] }));
  const peek = makeBit({ shell: 0x5a6070, accent: 0x34394a, eye: 0xff5a5a }); peek.scale.setScalar(.42); peek.position.set(.35, 0, -.25); snoop.add(peek);
  const noise = bubble(2.0, .7, () => {}, -1); noise.position.set(-.35, 1.75, .3); snoop.add(noise);
  const bar = sign(3.3, .62, (x, w, h) => { rrect(x, 0, 0, w, h, h / 2); x.fillStyle = '#ffffff'; x.fill();
    x.fillStyle = '#3aa61a'; rrect(x, 40, h * .45, 46, 40, 8); x.fill(); x.strokeStyle = '#3aa61a'; x.lineWidth = 9; x.beginPath(); x.arc(63, h * .45, 16, Math.PI, 0); x.stroke();
    label(x, 'https://example.com', 110, h / 2 + 3, 70, '#1d2442', 700, 'left', MONO); }, { depth: .12 });
  bar.position.set(0, 1.0, 1.4); st.scene.add(bar);
  const chars = '#$%&@!?*<>{}[]=+~^0123456789abcdef', plain = 'card=4111 1111 pw=hunter2';
  return { ...st, update(t, s) {
    const m = ease(seg(t, .04, .3));
    k1.position.set(lerp(-2.6, -.2, m), 3.4, lerp(1, .5, m)); k2.position.set(lerp(2.6, .2, m), 3.4, lerp(1, .5, m)); k2.rotation.z = Math.PI;
    [k1, k2].forEach(k => { k.scale.setScalar(.9 * (1 - seg(t, .27, .33))); k.rotation.y = s * 2; });
    const close = ease(seg(t, .32, .4)); lk.userData.shackle.position.y = .75 + (1 - close) * .45; lk.scale.setScalar(1 + Math.sin(seg(t, .4, .48) * Math.PI) * .1);
    const rk = seg(t, .4, .7); ring.scale.setScalar(.8 + rk * .9); ring.visible = rk > 0 && rk < 1; ring.material.emissiveIntensity = 3 * (1 - rk); ring.rotation.y = s;
    const sv = 1 - seg(t, .82, .88); snoop.scale.setScalar(Math.min(1, pop((t - .48) * 5)) * sv); peek.pose({ s, lookY: -.3, tilt: Math.sin(s * 2) * .1 });
    const enc = seg(t, .55, .7); let str = ''; for (let i = 0; i < plain.length; i++) str += enc > i / plain.length ? chars[(i * 7 + Math.floor(s * 12)) % chars.length] : plain[i];
    noise.userData.redraw((x, cw, H0) => { const ch = H0 * .82; rrect(x, 6, 6, cw - 12, ch - 12, ch * .3); x.fillStyle = '#fff'; x.fill();
      x.beginPath(); x.moveTo(cw * .22 - 26, ch - 8); x.lineTo(cw * .22 - 10, H0 - 6); x.lineTo(cw * .22 + 26, ch - 8); x.fill();
      label(x, str, cw / 2, ch / 2, 46, enc > .5 ? '#3aa61a' : '#e0337f', 800, 'center', MONO); });
    bar.scale.setScalar(t > .85 ? Math.min(1.08, pop((t - .85) * 6)) : 0);
    aim(st.cam, [0, 2.6, lerp(9.6, 9.1, t)], [0, 2.35, 0]);
  } };
};
BUILD.server = () => {
  const st = stage({ top: '#1e2a4d', bottom: '#41598c', floor: 0x2c3858, floorRough: .35, fogNear: 10, fogFar: 36, hemi: .8, key: 0xd7e4ff, keyI: 2.2, rim: 0xff7ac0, rimI: 2.5 });
  const r = rng(12);
  for (let i = 0; i < 9; i++) [-1, 1].forEach(sd => { const z = -1.5 - i * 2.2, rack = G(M(RB(1.3, 3.4, 1.6, .12), plastic(0x2a3046, { roughness: .4 }), { pos: [0, 1.7, 0] }));
    for (let j = 0; j < 8; j++) rack.add(M(RB(.9, .06, .05, .02), glowM(r() < .5 ? C.cyan : (r() < .5 ? C.lime : C.pink), 1.8 + r() * 1.5), { pos: [.05, .45 + j * .35, .82 * 1], shadow: false }));
    rack.position.set(sd * 2.3, 0, z); rack.rotation.y = -sd * Math.PI / 2; st.scene.add(rack); });
  const host = makeHost({ color: 0x8a7bff }); host.scale.setScalar(.82); host.position.set(0, 0, 0); st.scene.add(host);
  const req = envelope('GET /', 1.0); st.scene.add(req);
  const box = G(M(RB(1, .8, .8, .08), matte(0xd9a066)), M(RB(1.02, .14, .82, .03), matte(0xc48a50), { pos: [0, .2, 0] }));
  const ok = textSign(1.3, .46, '200 OK', { color: C.lime, fg: '#14320a', font: MONO, size: 78 }); ok.position.set(0, .72, .1); box.add(ok); st.scene.add(box);
  return { ...st, update(t, s) {
    const k1 = ease(seg(t, .04, .32)); req.position.set(lerp(-2.4, 0, k1), lerp(4.5, 2.6, k1), lerp(2.5, .9, k1)); req.rotation.set(0, 0, (1 - k1) * .8); req.scale.setScalar(1 - seg(t, .32, .38));
    host.pose({ s, reachL: seg(t, .45, .55) * .8, lookY: lerp(-.3, .1, seg(t, .1, .4)) });
    const k2 = ease(seg(t, .5, .85)); box.position.set(lerp(-.6, .55, k2), lerp(1.2, .45, k2) + Math.sin(k2 * Math.PI) * .9, lerp(.8, 2.6, k2)); box.scale.setScalar(t < .48 ? 0 : Math.min(1, pop((t - .48) * 5))); box.rotation.y = lerp(.6, -.25, k2);
    aim(st.cam, [lerp(.6, 0, t), 2.5, lerp(9.2, 8.6, t)], [0, 2.0, 0]);
  } };
};
BUILD.html = () => {
  const st = stage({ top: '#fff3d4', bottom: '#ffcfa6', floor: 0xffc79c });
  const tab = new THREE.Group(); tab.position.set(.35, 3.0, -.2); tab.rotation.y = -.14; st.scene.add(tab);
  tab.add(M(RB(3.3, 4.4, .22, .25), plastic(0x1b2033, { roughness: .2 })));
  const code = ctex(800, 1080); tab.add(M(new THREE.PlaneGeometry(3.05, 4.12), new THREE.MeshBasicMaterial({ map: code.tex, toneMapped: false }), { pos: [0, 0, .115], shadow: false }));
  const bit = makeBit(); bit.scale.setScalar(.56); bit.position.set(-1.0, 0, 1.6); bit.rotation.y = .4; st.scene.add(bit);
  const L = [['<!doctype html>', '#7f8aa8'], ['<html>', '#ff6fb1'], ['  <head>', '#ff6fb1'], ['    <title>Example</title>', '#e9edf8'], ['    <link href="style.css">', '#35e0ff'], ['  </head>', '#ff6fb1'], ['  <body>', '#ff6fb1'], ['    <h1>Hello!</h1>', '#e9edf8'], ['    <img src="photo.jpg">', '#ffc44d'], ['    <script src="app.js">', '#b6ff5c'], ['  </body>', '#ff6fb1'], ['</html>', '#ff6fb1']];
  return { ...st, update(t, s) {
    const n = seg(t, .05, .85) * L.length;
    code.redraw((x, w, h) => { x.fillStyle = '#10142a'; x.fillRect(0, 0, w, h); x.fillStyle = '#232a48'; x.fillRect(0, 0, w, 80); label(x, 'index.html', w / 2, 42, 36, '#9b7bff', 800, 'center', MONO);
      L.forEach(([l, c], i) => { const k = clamp(n - i); if (k <= 0) return; label(x, l.slice(0, Math.ceil(l.length * k)), 34, 130 + i * 76, 34, c, 600, 'left', MONO); }); });
    tab.scale.setScalar(Math.min(1, pop(s))); bit.pose({ s, upR: .55 + Math.sin(s * 3) * .05, lookY: .2, lookX: -.15 });
    aim(st.cam, [0, 2.8, lerp(10, 9.4, t)], [0, 2.55, 0]);
  } };
};
BUILD.fanout = () => {
  const st = stage({ top: '#c6e4ff', bottom: '#ffe1f0', floor: 0xffd9ea });
  const bit = makeBit(); bit.scale.setScalar(.62); st.scene.add(bit);
  const files = [['CSS', C.cyan], ['JS', C.lime], ['IMG', C.amber], ['FONT', C.violet], ['CSS', C.cyan], ['IMG', C.amber], ['JS', C.lime], ['IMG', C.amber], ['JSON', C.pink], ['IMG', C.amber], ['JS', C.lime], ['SVG', C.pink]];
  const crs = files.map(([lb, c], i) => { const k = critter(c, '', { tag: lb }); k.scale.setScalar(.36); st.scene.add(k); return k; });
  const cnt = sign(2.3, .56, () => {}, { color: 0xffffff }); cnt.position.set(0, 4.62, .4); st.scene.add(cnt);
  const cx = 0, cy = 2.75;
  return { ...st, update(t, s) {
    bit.position.set(cx, cy - .75 + Math.sin(s * 2) * .08, 0); bit.pose({ s, upL: .8, upR: .8, happy: .5 });
    crs.forEach((k, i) => { const a = -Math.PI / 2 + i / crs.length * Math.PI * 2 + .26, st0 = .08 + i * .045, kk = ease(seg(t, st0, st0 + .2));
      k.position.set(cx + Math.cos(a) * 1.55 * kk, cy + Math.sin(a) * 1.45 * kk + Math.sin(s * 4 + i) * .05, .3 + kk * .2); k.scale.setScalar(.36 * clamp(kk * 3)); k.rotation.y = Math.sin(s * 2 + i) * .3; });
    const n = Math.round(lerp(1, 48, ease(seg(t, .1, .85))));
    cnt.userData.redraw((x, w, h) => label(x, `${n} requests`, w / 2, h / 2 + 4, 92, '#1d2442', 900, 'center', MONO)); cnt.scale.setScalar(Math.min(1, pop(s - .3)));
    aim(st.cam, [0, 2.7, lerp(9.8, 9.2, t)], [0, 2.45, 0]);
  } };
};
BUILD.render = () => {
  const st = stage({ top: '#e3d8ff', bottom: '#ffdfc6', floor: 0xffd7bb });
  const board = M(RB(3.4, 3.7, .2, .2), plastic(0xffffff), { pos: [0, 3.25, -.3] }); st.scene.add(board);
  const pills = [['DOM', C.violet], ['STYLE', C.pink], ['LAYOUT', C.amber], ['PAINT', C.lime]].map(([l, c], i) => { const p = textSign(.82, .36, l, { color: 0xffffff, fg: '#1d2442', size: 54, depth: .1 }); p.position.set(-1.29 + i * .86, 1.05, 1.3); p.userData.col = c; st.scene.add(p); return p; });
  const tree = new THREE.Group(); tree.position.set(0, 3.25, -.1); st.scene.add(tree);
  const tn = [[0, 1.3], [-1, .35], [0, .35], [1, .35], [-1.3, -.7], [-.6, -.7], [0, -.7], [.7, -.7], [1.3, -.7]], par = [-1, 0, 0, 0, 1, 1, 2, 3, 3];
  const nodes = tn.map(([x, y], i) => { const n = M(SPH(.2, 24, 16), plastic(C.violet), { pos: [x, y, .1] }); tree.add(n); if (par[i] >= 0) { const [px, py] = tn[par[i]]; const cur = new THREE.LineCurve3(V(px, py, .1), V(x, y, .1)); tree.add(M(new THREE.TubeGeometry(cur, 4, .04, 8), plastic(0xb9aee8), { shadow: false })); } return n; });
  const blocks = [[0, 1.15, 3.0, 1.2, 0x9b7bff], [-.35, .2, 2.3, .26, 0x2a3150], [-.65, -.2, 1.7, .16, 0x9aa3bd], [-1.0, -1.1, .9, 1.1, C.cyan], [0, -1.1, .9, 1.1, C.pink], [1.0, -1.1, .9, 1.1, C.lime]];
  const r = rng(21), bl = blocks.map(([x, y, w, h, c]) => { const m = M(RB(w, h, .16, .06), plastic(0xc9cdd8)); m.userData = { x, y, c: new THREE.Color(c), sx: (r() - .5) * 2.4, sy: (r() - .5) * 2.6, rz: (r() - .5) * .9 }; board.add(m); return m; });
  const sp = sparkles(30, [0, 3.05, .3], 2.0, 0xffffff, 8); st.scene.add(sp);
  const grey = new THREE.Color(0xc9cdd8);
  return { ...st, update(t, s) {
    const ph = seg(t, .02, .96) * 4, cur = Math.min(3, Math.floor(ph));
    pills.forEach((p, i) => { p.scale.setScalar(i === cur ? 1.12 : .95); p.children[0].material.color.set(i <= cur ? p.userData.col : 0xffffff); });
    tree.scale.setScalar(cur === 0 ? 1 : Math.max(0, 1 - seg(ph, 1, 1.25) * 1)); nodes.forEach((n, i) => n.scale.setScalar(Math.min(1.1, pop((ph - i * .08) * 2))));
    const vis = seg(ph, 1, 1.15), col = seg(ph, 1.15, 1.9), lay = ease(seg(ph, 2, 2.85));
    bl.forEach((m, i) => { const u = m.userData; m.visible = vis > 0; m.scale.setScalar(vis);
      m.position.set(lerp(u.sx, u.x, lay), lerp(u.sy, u.y, lay), .14 + (1 - lay) * .25 + i * .01); m.rotation.z = u.rz * (1 - lay); m.material.color.copy(grey).lerp(u.c, col); m.material.emissive = u.c; m.material.emissiveIntensity = seg(ph, 3, 3.4) * .25 * (1 - seg(ph, 3.6, 4) * .6); });
    sp.visible = cur === 3; sp.update(s);
    aim(st.cam, [0, 2.9, lerp(9.8, 9.3, t)], [0, 2.6, 0]);
  } };
};
BUILD.done = () => {
  const st = stage({ top: '#ffd56e', bottom: '#ffa3c6', floor: 0xff9fc2 });
  const ph = new THREE.Group(); ph.position.set(-.35, 3.0, -.4); ph.rotation.set(-.05, .2, 0); st.scene.add(ph);
  ph.add(M(RB(2.1, 4.1, .26, .32), plastic(0x161b2e, { roughness: .15 })));
  const scr = ctex(512, 1000); ph.add(M(new THREE.PlaneGeometry(1.86, 3.8), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }), { pos: [0, 0, .135], shadow: false }));
  const bit = makeBit(); bit.scale.setScalar(.58); bit.position.set(1.1, 0, 1.2); bit.rotation.y = -.3; st.scene.add(bit);
  const badge = G(M(new THREE.CylinderGeometry(.5, .5, .18, 48), plastic(0x3cc85a), { rot: [Math.PI / 2, 0, 0] }), M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-.22, 0, .1), V(-.06, -.16, .1), V(.24, .18, .1)], false, 'catmullrom', 0), 20, .06, 8), plastic(0xffffff), { shadow: false }));
  badge.position.set(.75, 3.7, .5); st.scene.add(badge);
  const fast = textSign(1.5, .56, '< 1 s', { color: C.amber, fg: '#4a2a00', font: MONO, size: 92 }); fast.position.set(-.85, 4.6, .6); st.scene.add(fast);
  const conf = confetti(200, [0, 3.0, .6], 5, 4); st.scene.add(conf);
  return { ...st, update(t, s, d) {
    scr.redraw((x, w, h) => { x.fillStyle = '#f4f6fb'; x.fillRect(0, 0, w, h); const items = [[30, 50, 452, 300, '#9b7bff'], [30, 390, 360, 40, '#2a3150'], [30, 450, 260, 28, '#9aa3bd'], [30, 510, 452, 200, '#35c8ef'], [30, 730, 452, 200, '#ff6fb1']];
      const k0 = seg(t, 0, .35); items.forEach(([X, Y, ww, hh, c], i) => { const k = clamp(k0 * items.length - i); x.globalAlpha = k; rrect(x, X, Y + (1 - k) * 30, ww, hh, 18); x.fillStyle = c; x.fill(); x.globalAlpha = 1; }); });
    badge.scale.setScalar(Math.min(1.1, pop((t - .3) * 5))); badge.rotation.y = Math.sin(s * 2) * .3; fast.scale.setScalar(Math.min(1.1, pop((t - .45) * 5)));
    bit.pose({ s, upL: 1, upR: 1, happy: 1, hop: Math.abs(Math.sin(s * 5)) * .35 * seg(t, .25, .3), squash: 0 }); conf.update(s - .3 * d);
    aim(st.cam, [0, 2.8, lerp(9.8, 9.2, t)], [0, 2.55, 0]);
  } };
};
BUILD.recap = () => {
  const st = stage({ top: '#a2d8ff', bottom: '#ffe6c2', floor: 0xffdcb0 });
  const items = [['1', 'Find the address', 'DNS', '#35c8ef'], ['2', 'Send the packets', 'routers', '#9b7bff'], ['3', 'Shake hands', 'TCP + TLS', '#59c21a'], ['4', 'Get the files', 'HTTP', '#ff4fa3'], ['5', 'Draw the page', 'render', '#ffab1f']];
  const slabs = items.map(([n, l, sub, c], i) => { const g = sign(3.5, .74, (x, w, h) => { x.fillStyle = c; x.beginPath(); x.arc(h / 2 + 6, h / 2, h * .36, 0, 7); x.fill(); label(x, n, h / 2 + 6, h / 2 + 4, h * .46, '#fff', 900);
      label(x, l, h + 18, h / 2 + 3, h * .42, '#1d2442', 900, 'left'); }, { color: 0xffffff, depth: .22 });
    g.position.set(0, 4.75 - i * .92, 0); st.scene.add(g); return g; });
  return { ...st, update(t, s) {
    slabs.forEach((g, i) => { const a = i * .17, act = t > a && t < a + .2; g.scale.setScalar(Math.min(1, pop((t - a) * 5)) * (act ? 1.06 : 1)); g.position.z = act ? .35 : 0; g.rotation.y = Math.sin(s * 1.5 + i) * .04; });
    aim(st.cam, [0, 3.0, lerp(9.6, 9.2, t)], [0, 2.75, 0]);
  } };
};
BUILD.outro = () => {
  const st = stage({ top: '#ffb5da', bottom: '#ffe1a4', floor: 0xffd89a });
  st.scene.add(pedestal(1.4, 0xffffff, C.pink));
  const bit = makeBit(); bit.position.y = .4; st.scene.add(bit);
  const btn = textSign(2.8, .85, 'FOLLOW  +', { color: C.pink, fg: '#ffffff', size: 112, depth: .4 }); btn.position.set(0, 4.25, .3); st.scene.add(btn);
  const sp = sparkles(24, [0, 2.6, 0], 2.4, 0xffffff, 2); st.scene.add(sp);
  return { ...st, update(t, s) {
    bit.pose({ s, waveR: 1, happy: .8 }); btn.scale.setScalar(Math.min(1, pop((t - .4) * 5)) * (1 + Math.sin(s * 5) * .03 * seg(t, .5, .6))); sp.update(s);
    aim(st.cam, [Math.sin(s * .3) * .8, 2.7, 9.4], [0, 2.4, 0]);
  } };
};

// ---------- 2D overlay: progress, step header, captions ----------
const cv = document.getElementById('cv'), c2 = cv.getContext('2d');
function overlay(L, T, total) {
  c2.fillStyle = 'rgba(255,255,255,.35)'; c2.beginPath(); c2.roundRect(60, 70, W - 120, 12, 6); c2.fill();
  c2.fillStyle = '#ffffff'; c2.beginPath(); c2.roundRect(60, 70, (W - 120) * clamp(T / total), 12, 6); c2.fill();
  if (L.step) {
    const k = out(seg(L.secT, 0, .45)); c2.save(); c2.globalAlpha = k; c2.translate(W / 2, 175); c2.scale(.85 + .15 * k, .85 + .15 * k);
    c2.shadowColor = 'rgba(30,20,70,.35)'; c2.shadowBlur = 24; c2.shadowOffsetY = 6; c2.fillStyle = '#ffffff'; c2.beginPath(); c2.roundRect(-300, -62, 600, 124, 62); c2.fill(); c2.shadowBlur = 0; c2.shadowOffsetY = 0;
    c2.fillStyle = '#ff4fa3'; c2.beginPath(); c2.roundRect(-284, -46, 150, 92, 46); c2.fill();
    c2.font = `900 40px ${SANS}`; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillStyle = '#fff'; c2.fillText(`${L.step}/5`, -209, 3);
    c2.font = `900 46px ${SANS}`; c2.fillStyle = '#1d2442'; const nm = L.secName.toUpperCase(), mw = c2.measureText(nm).width, fit = Math.min(1, 400 / mw);
    c2.save(); c2.translate(75, 3); c2.scale(fit, 1); c2.fillText(nm, 0, 0); c2.restore(); c2.restore();
  }
  if (window.FORMAT === 'story' && L.sec > 0) { // case-file chip: the chapter name on a red folder tab
    const k = out(seg(L.secT, 0, .45)); c2.save(); c2.globalAlpha = k; c2.translate(W / 2, 175); c2.scale(.85 + .15 * k, .85 + .15 * k);
    c2.font = `900 44px ${SANS}`; const nm = L.secName.toUpperCase(), bw = Math.min(760, c2.measureText(nm).width + 250);
    c2.shadowColor = 'rgba(0,0,0,.45)'; c2.shadowBlur = 24; c2.shadowOffsetY = 6; c2.fillStyle = '#f3e3c3'; c2.beginPath(); c2.roundRect(-bw / 2, -58, bw, 116, 22); c2.fill(); c2.shadowBlur = 0; c2.shadowOffsetY = 0;
    c2.fillStyle = '#c8202f'; c2.beginPath(); c2.roundRect(-bw / 2 + 14, -42, 170, 84, 14); c2.fill();
    c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillStyle = '#fff'; c2.font = `900 30px ${SANS}`; c2.fillText('CASE FILE', -bw / 2 + 99, 3);
    c2.font = `900 44px ${SANS}`; c2.fillStyle = '#2a1a12'; const fit = Math.min(1, (bw - 230) / c2.measureText(nm).width);
    c2.save(); c2.translate(-bw / 2 + 200 + (bw - 220) / 2, 3); c2.scale(fit, 1); c2.fillText(nm, 0, 0); c2.restore(); c2.restore();
  }
  if (!L.cap || T < L.cap[0] || T > L.cap[1] + .15) return;
  const words = L.text.split(/\s+/), chunks = []; let cur = [];
  words.forEach(w => { cur.push(w); if (cur.length >= 3 || /[.,?!]$/.test(w)) { chunks.push(cur.join(' ')); cur = []; } }); if (cur.length) chunks.push(cur.join(' '));
  const tot = chunks.reduce((a, ch) => a + ch.length + 4, 0); let acc = 0, idx = chunks.length - 1; const k = (T - L.cap[0]) / (L.cap[1] - L.cap[0]) * tot;
  for (let i = 0; i < chunks.length; i++) { acc += chunks[i].length + 4; if (k < acc) { idx = i; break; } }
  let chStart = 0; for (let i = 0; i < idx; i++) chStart += chunks[i].length + 4; const age = (k - chStart) / tot * (L.cap[1] - L.cap[0]);
  const s = chunks[idx].toUpperCase(); c2.save(); c2.font = `900 76px ${SANS}`; c2.wordSpacing = '22px'; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.lineJoin = 'round';
  const fit = Math.min(1, (W - 120) / c2.measureText(s).width), sc = fit * (1 + .12 * Math.exp(-age * 18)); c2.translate(W / 2, 1530); c2.scale(sc, sc);
  c2.wordSpacing = '22px'; c2.lineWidth = 11; c2.strokeStyle = '#1a1433'; c2.shadowColor = 'rgba(0,0,0,.35)'; c2.shadowBlur = 18; c2.shadowOffsetY = 6; c2.strokeText(s, 0, 0); c2.shadowBlur = 0; c2.shadowOffsetY = 0;
  c2.fillStyle = idx % 2 ? '#ffd23f' : '#ffffff'; c2.fillText(s, 0, 0); c2.restore();
}

// ---------- frame driver ----------
let curIdx = -1, cur = null;
function dispose(sc) { sc.traverse(o => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(m => { ['map', 'emissiveMap'].forEach(k => m[k] && m[k] !== GLOWTEX && m[k].dispose()); m.dispose(); }); }); if (sc.background && sc.background.dispose) sc.background.dispose(); }
// a still (AI image or image-to-video clip) for this line: slow push or pull with a drift, the same cuts and overlay as the 3D sets
// weather and atmosphere drawn over a still: p.fx = rain | dust | steam | sparkle (deterministic per frame)
function drawFx(fx, s, i) {
  if (!fx) return; const r = rng(i * 97 + 13);
  if (fx === 'rain') { c2.strokeStyle = 'rgba(210,225,255,.38)'; c2.lineWidth = 2.5; c2.beginPath();
    for (let k = 0; k < 170; k++) { const x0 = r() * (W + 300) - 150, sp = 1700 + r() * 900, y = (r() * H + s * sp) % (H + 200) - 100, x = x0 - y * .12; c2.moveTo(x, y); c2.lineTo(x - 9, y + 60); } c2.stroke(); }
  if (fx === 'dust' || fx === 'sparkle') { for (let k = 0; k < (fx === 'dust' ? 70 : 45); k++) { const x = r() * W + Math.sin(s * .6 + k) * 30, y = (r() * H - s * (20 + r() * 40)) % H, sz = 2 + r() * (fx === 'dust' ? 5 : 9);
      const tw = fx === 'sparkle' ? Math.max(0, Math.sin(s * 3 + k * 1.7)) : .35 + .25 * Math.sin(s * 2 + k); const yy = y < 0 ? y + H : y;
      const g = c2.createRadialGradient(x, yy, 0, x, yy, sz * 3); g.addColorStop(0, `rgba(255,240,210,${tw * .8})`); g.addColorStop(1, 'rgba(255,240,210,0)'); c2.fillStyle = g; c2.fillRect(x - sz * 3, yy - sz * 3, sz * 6, sz * 6); } }
  if (fx === 'alarm') { const k = Math.max(0, Math.sin(s * 7)); c2.fillStyle = `rgba(255,30,40,${.28 * k})`; c2.fillRect(0, 0, W, H);
    const g = c2.createRadialGradient(W / 2, H * .45, H * .2, W / 2, H * .45, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(120,0,0,${.5 * k})`); c2.fillStyle = g; c2.fillRect(0, 0, W, H); }
  if (fx === 'steam') { for (let k = 0; k < 14; k++) { const ph = frac(s * .18 + k / 14), x = W * (.35 + r() * .35) + Math.sin(ph * 6 + k) * 60, y = H * (.95 - ph * .6), rr = 80 + ph * 260;
      const g = c2.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, `rgba(235,235,240,${.16 * (1 - ph)})`); g.addColorStop(1, 'rgba(235,235,240,0)'); c2.fillStyle = g; c2.fillRect(x - rr, y - rr, rr * 2, rr * 2); } }
}
async function drawStill(el, L, i, TL, T, total) {
  const d = L.end - L.start, s = T - L.start, t = clamp(s / d);
  if (Array.isArray(el)) { // depth layers: each slides and scales by its distance, like a camera moving through the scene
    const [l0] = el, fw = l0.naturalWidth, fh = l0.naturalHeight, cr = (L.p && L.p.crop) || [0, 0, 1, 1]; // crop: [x, y, w, h] as fractions of the image
    const cx = cr[0] * fw, cy = cr[1] * fh, iw = cr[2] * fw, ih = cr[3] * fh; c2.fillStyle = '#000'; c2.fillRect(0, 0, W, H);
    const kin = i > 0 ? clamp(s / .32) : 1, kout = i < TL.length - 1 ? clamp((L.end - T) / .16) : 1, punch = 1 + .14 * Math.pow(1 - out(kin), 2) + .07 * Math.pow(1 - kout, 2);
    const e = ease(t), dir = i % 2 ? -1 : 1, mv = i % 3; // moves: 0 push in, 1 drift sideways, 2 rise up
    el.forEach((im, li) => { const depth = [.25, .6, 1.15][li], base = Math.max(W / iw, H / ih) * 1.12 * punch;
      const sc = base * (1 + (mv === 0 ? .1 * e : .03 * e) * depth), px = (mv === 1 ? dir * (e - .5) * W * .05 : dir * (e - .5) * W * .012) * depth, py = (mv === 2 ? (.5 - e) * H * .03 : 0) * depth + Math.sin(s * .9 + li) * 3 * depth;
      c2.drawImage(im, cx, cy, iw, ih, (W - iw * sc) / 2 + px, (H - ih * sc) / 2 + py, iw * sc, ih * sc); });
    drawFx(L.p && L.p.fx, s, i);
    const fl = .6 * Math.pow(1 - kin, 3); if (fl > .01) { c2.fillStyle = `rgba(255,255,255,${fl})`; c2.fillRect(0, 0, W, H); }
    el = null;
  }
  const vid = el && el.tagName === 'VIDEO';
  if (vid && el.duration) { const tt = Math.min(s * (el.duration > d ? 1 : el.duration / d), el.duration - .04); if (Math.abs(el.currentTime - tt) > .001) await new Promise(r => { el.onseeked = r; el.currentTime = tt; }); }
  const iw = el ? el.videoWidth || el.naturalWidth : 0, ih = el ? el.videoHeight || el.naturalHeight : 0; if (el) { c2.fillStyle = '#000'; c2.fillRect(0, 0, W, H); }
  if (iw) { const dir = i % 2 ? -1 : 1, kb = vid ? 1.02 : lerp(dir > 0 ? 1.0 : 1.1, dir > 0 ? 1.1 : 1.0, ease(t));
    const kin = i > 0 ? clamp(s / .32) : 1, kout = i < TL.length - 1 ? clamp((L.end - T) / .16) : 1, z = kb * (1 + .14 * Math.pow(1 - out(kin), 2) + .07 * Math.pow(1 - kout, 2));
    const sc = Math.max(W / iw, H / ih) * z, px = Math.sin(i * 2.3) * W * .025 * (t - .5), py = Math.cos(i * 1.7) * H * .015 * (t - .5);
    c2.imageSmoothingQuality = 'high'; c2.drawImage(el, (W - iw * sc) / 2 + px, (H - ih * sc) / 2 + py, iw * sc, ih * sc);
    drawFx(L.p && L.p.fx, s, i);
    const fl = .6 * Math.pow(1 - kin, 3); if (fl > .01) { c2.fillStyle = `rgba(255,255,255,${fl})`; c2.fillRect(0, 0, W, H); } }
  if (L.p && L.p.top) { // title card drawn over the still
    const card = (txt, y, bg, fg, size, at) => { const k = Math.min(1, pop(s - at)); if (k <= 0) return; c2.save(); c2.translate(W / 2, y); c2.scale(k, k); c2.font = `900 ${size}px ${SANS}`;
      const tw = Math.min(W - 140, c2.measureText(txt).width + 90); c2.shadowColor = 'rgba(0,0,0,.45)'; c2.shadowBlur = 26; c2.shadowOffsetY = 8; c2.fillStyle = bg; c2.beginPath(); c2.roundRect(-tw / 2, -size * .85, tw, size * 1.7, size * .4); c2.fill();
      c2.shadowBlur = 0; c2.shadowOffsetY = 0; c2.fillStyle = fg; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.fillText(txt, 0, 4, tw - 60); c2.restore(); };
    if (L.p.case) card(L.p.case, 300, '#1d2442', '#ffc44d', 48, .5); card(L.p.top, 430, '#f3e3c3', '#2a1a12', 84, .05); if (L.p.bottom) card(L.p.bottom, 590, '#c8202f', '#ffffff', 92, .3);
  }
  const g = c2.createLinearGradient(0, H * .62, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); c2.fillStyle = g; c2.fillRect(0, H * .62, W, H * .38);
  overlay(L, T, total);
}
function frame(TL, T, total) {
  let i = TL.findIndex(l => T < l.end); if (i < 0) i = TL.length - 1; const L = TL[i];
  const still = window.STILLS && window.STILLS[L.scene]; if (still) return drawStill(still, L, i, TL, T, total);
  if (i !== curIdx) { if (cur) dispose(cur.scene); cur = (BUILD[L.scene] || (window.FORMAT === 'story' && BUILD.story_missing) || BUILD.title)(L.p || {}, L.scene); curIdx = i; }
  const d = L.end - L.start, s = T - L.start, t = clamp(s / d); NOW = T;
  cur.update(t, s, d); cur.cam.aspect = W / H; cur.cam.updateProjectionMatrix();
  rpass.scene = cur.scene; rpass.camera = cur.cam; composer.render();
  c2.imageSmoothingQuality = 'high';
  if (window.STYLE === 'lively') { // punch-in zoom and a flash on each cut instead of a soft fade
    const kin = i > 0 ? clamp(s / .32) : 1, kout = i < TL.length - 1 ? clamp((L.end - T) / .16) : 1, z = 1 + .14 * Math.pow(1 - out(kin), 2) + .07 * Math.pow(1 - kout, 2);
    c2.fillStyle = '#000'; c2.fillRect(0, 0, W, H); c2.drawImage(renderer.domElement, W * (1 - z) / 2, H * (1 - z) / 2, W * z, H * z);
    const fl = .6 * Math.pow(1 - kin, 3); if (fl > .01) { c2.fillStyle = `rgba(255,255,255,${fl})`; c2.fillRect(0, 0, W, H); }
  } else {
    c2.drawImage(renderer.domElement, 0, 0, W, H);
    let a = 0; if (i > 0) a = Math.max(a, 1 - s / .2); if (i < TL.length - 1) a = Math.max(a, 1 - (L.end - T) / .2);
    if (a > 0) { c2.fillStyle = `rgba(255,248,240,${clamp(a) * .85})`; c2.fillRect(0, 0, W, H); }
  }
  overlay(L, T, total);
}
window.DOC3D = { frame };
// building blocks for episode set files (engine3d/sets/*.js): each exports register(KIT) and adds to KIT.BUILD
export const KIT = { THREE, BUILD, C, W, H, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, bubble, sprite, GLOWTEX, stage, aim,
  makeBit, makeHost, hop, critter, envelope, pedestal, tree, confetti, sparkles, laptopRig, drawBrowser, speech, clamp, lerp, seg, ease, out, pop, frac, V, rng, SANS, MONO, hex };
