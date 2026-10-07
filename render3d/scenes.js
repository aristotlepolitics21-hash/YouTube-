// Six 3D shots for "What happens if you swallow gum?" in the ZackDFilms look:
// wet glossy anatomy, a lumpy pink gum blob, dark backgrounds, slow camera push.
// Each shot exports build() -> { scene, camera, update(t) } with t in [0, 1].
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const W = 1080, H = 1920;
const noise = new ImprovedNoise();
const n3 = (x, y, z) => noise.noise(x, y, z);
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---------- procedural textures ----------
function bumpNormalMap(size = 512, freq = 8, octaves = 4, seed = 0) {
  const h = new Float32Array(size * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let v = 0, a = 1, f = freq / size;
    for (let o = 0; o < octaves; o++) {
      // tileable: sample a torus in 4D-ish by mixing two periodic coords
      const u = x * f, w = y * f;
      v += a * n3(u + seed, w + seed * 2, o * 7.1);
      a *= 0.5; f *= 2;
    }
    h[y * size + x] = v;
  }
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d'); const img = ctx.createImageData(size, size);
  const s = 6;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const l = h[y * size + ((x - 1 + size) % size)], r = h[y * size + ((x + 1) % size)];
    const d = h[((y - 1 + size) % size) * size + x], u = h[((y + 1) % size) * size + x];
    let nx = (l - r) * s, ny = (d - u) * s, nz = 1;
    const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
    const i = (y * size + x) * 4;
    img.data[i] = (nx * 0.5 + 0.5) * 255; img.data[i + 1] = (ny * 0.5 + 0.5) * 255;
    img.data[i + 2] = (nz * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const fleshNormal = bumpNormalMap(512, 10, 5, 1);
const fineNormal = bumpNormalMap(512, 40, 3, 5);

function textTexture(lines, { w = 512, h = 512, bg = '#f4f1ea', fg = '#1b1b1b', head = '#d8322f' } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = head; g.fillRect(0, 0, w, h * 0.24);
  g.fillStyle = '#fff'; g.font = `900 ${h * 0.11}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(lines[0], w / 2, h * 0.125);
  g.fillStyle = fg; g.font = `900 ${h * 0.48}px sans-serif`;
  g.fillText(lines[1], w / 2, h * 0.62);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// ---------- materials ----------
function flesh(color = '#c2474f', repeat = 3, opts = {}) {
  const nm = fleshNormal.clone(); nm.repeat.set(repeat, repeat); nm.needsUpdate = true;
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.42, metalness: 0, normalMap: nm, normalScale: new THREE.Vector2(0.8, 0.8),
    clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.2, sheenColor: new THREE.Color('#ff7a7a'),
    sheenRoughness: 0.5, envMapIntensity: 0.25, ...opts,
  });
}
function gumMaterial() {
  const nm = fineNormal.clone(); nm.repeat.set(2, 2); nm.needsUpdate = true;
  return new THREE.MeshPhysicalMaterial({
    color: '#f02a86', roughness: 0.45, normalMap: nm, normalScale: new THREE.Vector2(0.35, 0.35),
    sheen: 0.35, sheenColor: new THREE.Color('#ff9cc8'), sheenRoughness: 0.4,
    clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 0.35,
  });
}

// ---------- geometry helpers ----------
function displace(geo, fn) {
  const p = geo.attributes.position, n = geo.attributes.normal, v = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); nn.fromBufferAttribute(n, i);
    const d = fn(v, i);
    p.setXYZ(i, v.x + nn.x * d, v.y + nn.y * d, v.z + nn.z * d);
  }
  geo.computeVertexNormals();
  return geo;
}
function gumBlob(r = 1, seed = 0) {
  const g = new THREE.SphereGeometry(r, 160, 120);
  displace(g, (v) => r * (0.13 * n3(v.x * 1.6 + seed, v.y * 1.6, v.z * 1.6) +
                         0.035 * n3(v.x * 6 + seed, v.y * 6, v.z * 6)));
  const m = new THREE.Mesh(g, gumMaterial());
  m.castShadow = m.receiveShadow = true;
  return m;
}
// Tube whose radius varies along its length: rf(u, angle) -> radius multiplier
function organicTube(curve, radius, segs, radial, rf, closed = false) {
  const g = new THREE.TubeGeometry(curve, segs, radius, radial, closed);
  const p = g.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs; curve.getPointAt(u, c);
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(p, k).sub(c).multiplyScalar(rf(u, j / radial, v)).add(c);
      p.setXYZ(k, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return g;
}
function baseScene(bg = '#0b0405', fog = null) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(bg);
  s.environment = envMap;
  if (fog) s.fog = new THREE.FogExp2(bg, fog);
  return s;
}
function cam(fov = 32) { return new THREE.PerspectiveCamera(fov, W / H, 0.05, 200); }
function spot(scene, color, intensity, pos, target = [0, 0, 0], angle = 0.5, shadow = true) {
  const l = new THREE.SpotLight(color, intensity, 0, angle, 0.6, 1.2);
  l.position.set(...pos); l.target.position.set(...target);
  scene.add(l, l.target);
  if (shadow) { l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0004; l.shadow.radius = 6; }
  return l;
}

// =================== SHOTS ===================

// 1 — close-up of an open mouth, gum resting on the tongue
function shotMouth() {
  const scene = baseScene('#1a0a08');
  const camera = cam(30);
  const skin = flesh('#b8705a', 2, { sheenColor: new THREE.Color('#ffb59a'), clearcoat: 0.25, clearcoatRoughness: 0.4, normalScale: new THREE.Vector2(0.2, 0.2) });
  const lipM = flesh('#b8524f', 2, { clearcoat: 0.9, clearcoatRoughness: 0.08 });

  // face slab with mouth hole, softly bevelled
  const face = new THREE.Shape();
  face.moveTo(-14, -18); face.lineTo(14, -18); face.lineTo(14, 18); face.lineTo(-14, 18); face.lineTo(-14, -18);
  const hole = new THREE.Path();
  hole.absellipse(0, 0, 3.0, 1.55, 0, Math.PI * 2, true);
  face.holes.push(hole);
  const fg = new THREE.ExtrudeGeometry(face, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.8, bevelSize: 0.3, bevelSegments: 16, curveSegments: 160 });
  fg.translate(0, 0, -0.6);
  const faceMesh = new THREE.Mesh(fg, skin);
  faceMesh.receiveShadow = true; scene.add(faceMesh);

  // lips: two fat tubes around the opening
  const lipCurve = (up) => new THREE.CatmullRomCurve3(Array.from({ length: 41 }, (_, i) => {
    const a = (up ? 0 : Math.PI) + (i / 40) * Math.PI;
    const x = Math.cos(a) * 3.0, y = Math.sin(a) * 1.45;
    return new THREE.Vector3(x, y + (up ? 0.05 : -0.05), 0.75 - (x * x) * 0.02);
  }));
  for (const up of [true, false]) {
    const c = lipCurve(up);
    const g = organicTube(c, 0.55, 200, 48, (u) => 0.25 + 0.75 * Math.sin(u * Math.PI) ** 0.6 * (up ? 1 - 0.18 * Math.exp(-((u - 0.5) ** 2) / 0.004) : 1.12));
    const m = new THREE.Mesh(g, lipM); m.castShadow = m.receiveShadow = true; scene.add(m);
  }

  // mouth cavity
  const cav = new THREE.Mesh(new THREE.SphereGeometry(4.2, 64, 48), flesh('#5a1418', 3, { side: THREE.BackSide, clearcoat: 1 }));
  cav.scale.set(1, 0.75, 1.2); cav.position.set(0, 0, -4); cav.receiveShadow = true; scene.add(cav);

  // teeth
  const toothM = new THREE.MeshPhysicalMaterial({ color: '#f3ede0', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.3, envMapIntensity: 0.9 });
  const teeth = (up) => {
    for (let i = -5; i <= 5; i++) {
      const a = i * 0.13, w = Math.abs(i) < 2 ? 0.52 : 0.46;
      const t = new THREE.Mesh(new RoundedBoxGeometry(w, 0.75, 0.42, 4, 0.14), toothM);
      t.position.set(Math.sin(a) * 3.3, up ? 0.88 - Math.abs(i) * 0.02 : -0.85 + Math.abs(i) * 0.02, -0.3 - (1 - Math.cos(a)) * 3.3);
      t.rotation.y = a; t.castShadow = t.receiveShadow = true; scene.add(t);
    }
  };
  teeth(true); teeth(false);

  // tongue
  const tg = new THREE.SphereGeometry(1, 96, 64);
  displace(tg, (v) => 0.06 * n3(v.x * 3, v.y * 3, v.z * 3));
  const tongue = new THREE.Mesh(tg, flesh('#d0585e', 4, { clearcoat: 1, clearcoatRoughness: 0.06 }));
  tongue.scale.set(2.5, 0.8, 2.6); tongue.position.set(0, -1.35, -1.8); tongue.receiveShadow = true; tongue.castShadow = true; scene.add(tongue);

  const gum = gumBlob(0.55, 3); gum.scale.set(1.15, 0.72, 1); gum.position.set(0.1, -0.22, -0.95); scene.add(gum);

  spot(scene, '#ffd9c2', 200, [-6, 9, 14], [0, -0.5, -1], 0.9);
  spot(scene, '#ff8a6a', 50, [9, -3, 8], [0, 0, -1], 0.5, false);
  const inner = new THREE.PointLight('#ffb08a', 3, 6, 2); inner.position.set(0, 0.2, 0.6); scene.add(inner);
  scene.add(new THREE.HemisphereLight('#ffd6c8', '#200808', 0.25));

  const update = (t) => {
    const k = ease(t);
    camera.position.set(lerp(0.8, 0.2, k), lerp(4.5, 3.4, k), lerp(24, 17, k));
    camera.lookAt(0, -0.4, -1);
    gum.rotation.y = 0.4 + t * 0.6;
  };
  return { scene, camera, update };
}

// 2 — inside the esophagus, gum sliding away from camera
function shotEsophagus() {
  const scene = baseScene('#120304', 0.06);
  const camera = cam(55);
  const L = 60;
  const pts = Array.from({ length: 30 }, (_, i) => {
    const z = -i * (L / 29);
    return new THREE.Vector3(Math.sin(i * 0.35) * 1.2, Math.cos(i * 0.27) * 0.9, z + 6);
  });
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = organicTube(curve, 2.3, 700, 96, (u, a, v) =>
    1 + 0.13 * Math.sin(u * 90) + 0.12 * n3(u * 30, Math.cos(a * Math.PI * 2) * 1.5, Math.sin(a * Math.PI * 2) * 1.5)
      + 0.08 * Math.sin(a * Math.PI * 2 * 5 + u * 12));
  const tube = new THREE.Mesh(g, flesh('#c9535a', 1, { side: THREE.BackSide }));
  tube.material.normalMap.repeat.set(30, 4);
  tube.receiveShadow = true; scene.add(tube);

  const gum = gumBlob(0.85, 7); gum.scale.set(1, 1.1, 1.3); scene.add(gum);
  const headlamp = new THREE.SpotLight('#ffe2d6', 45, 40, 0.75, 0.7, 1.4);
  headlamp.castShadow = true; headlamp.shadow.mapSize.set(2048, 2048); headlamp.shadow.bias = -0.0005;
  scene.add(headlamp, headlamp.target);
  const glow = new THREE.PointLight('#ff6aa8', 6, 7, 2); scene.add(glow);
  scene.add(new THREE.HemisphereLight('#ff9a9a', '#200404', 0.12));

  const P = new THREE.Vector3(), T = new THREE.Vector3();
  const update = (t) => {
    const cu = lerp(0.02, 0.08, t), gu = lerp(0.12, 0.2, ease(t));
    curve.getPointAt(cu, P); curve.getPointAt(cu + 0.04, T);
    camera.position.copy(P); camera.lookAt(T);
    headlamp.position.copy(P); headlamp.target.position.copy(T);
    curve.getPointAt(gu, P); gum.position.copy(P); gum.position.y -= 0.6;
    gum.rotation.set(t * 1.2, t * 0.7, 0.3);
    glow.position.copy(P).add(new THREE.Vector3(0, 0.8, 1.5));
  };
  return { scene, camera, update };
}

// 3 — inside the stomach: churning green acid, gum floating untouched
function shotStomach() {
  const scene = baseScene('#0d0304', 0.03);
  const camera = cam(42);
  const sg = new THREE.SphereGeometry(12, 160, 120);
  // rugae: long folds stretched in one direction
  displace(sg, (v) => 0.9 * Math.abs(n3(v.x * 0.15, v.y * 0.6, v.z * 0.15)) * -1 + 0.3 * n3(v.x * 0.5, v.y * 0.5, v.z * 0.5));
  const wall = new THREE.Mesh(sg, flesh('#b8434b', 5, { side: THREE.BackSide }));
  wall.scale.set(1.3, 0.85, 1); wall.receiveShadow = true; scene.add(wall);

  const lg = new THREE.PlaneGeometry(40, 40, 260, 260); lg.rotateX(-Math.PI / 2);
  const acidM = new THREE.MeshPhysicalMaterial({
    color: '#7bd62b', emissive: '#2c6a04', emissiveIntensity: 0.15, roughness: 0.08, metalness: 0,
    transmission: 0.55, thickness: 2, ior: 1.33, attenuationColor: new THREE.Color('#4f9a10'), attenuationDistance: 3,
    clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.94, envMapIntensity: 1.2,
  });
  const acid = new THREE.Mesh(lg, acidM); acid.position.y = -2.4; acid.receiveShadow = true; scene.add(acid);
  const baseY = Float32Array.from(lg.attributes.position.array);

  const gum = gumBlob(1.05, 11); gum.scale.set(1.25, 0.8, 1.05); scene.add(gum);

  const bubbleM = new THREE.MeshPhysicalMaterial({ color: '#e7ffb8', roughness: 0.02, transmission: 1, thickness: 0.3, ior: 1.2, clearcoat: 1, envMapIntensity: 1.5 });
  const bubbles = [];
  for (let i = 0; i < 70; i++) {
    const r = 0.04 + Math.random() ** 3 * 0.35;
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), bubbleM);
    const ang = Math.random() * Math.PI * 2, rad = 1.6 + Math.random() * 7;
    b.userData = { x: Math.cos(ang) * rad, z: Math.sin(ang) * rad - 1, r, ph: Math.random() };
    scene.add(b); bubbles.push(b);
  }
  spot(scene, '#ffe0d0', 300, [-5, 10, 8], [0, -2.4, 0], 0.55);
  const under = new THREE.PointLight('#a6ff3a', 18, 18, 1.6); under.position.set(0, -4, 0); scene.add(under);
  const rim = new THREE.PointLight('#ff7a8a', 12, 20, 1.5); rim.position.set(6, 3, -6); scene.add(rim);

  const update = (t) => {
    const k = ease(t), time = t * 3;
    const p = lg.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = baseY[i * 3], z = baseY[i * 3 + 2];
      p.setY(i, 0.12 * Math.sin(x * 0.9 + time * 2) + 0.1 * Math.sin(z * 1.3 - time * 1.6) + 0.15 * n3(x * 0.4, z * 0.4, time * 0.5));
    }
    lg.computeVertexNormals(); p.needsUpdate = true;
    gum.position.set(0, -2.15 + 0.08 * Math.sin(time * 2), 0); gum.rotation.set(0.15 * Math.sin(time), time * 0.4, 0.1);
    for (const b of bubbles) {
      const u = b.userData; const y = ((u.ph + t * 0.8) % 1);
      b.position.set(u.x + 0.2 * Math.sin(time + u.ph * 9), -2.6 + y * 0.5 + u.r * 0.6, u.z);
    }
    camera.position.set(lerp(-1.5, -0.6, k), lerp(5.5, 3.6, k), lerp(13, 9.5, k));
    camera.lookAt(0, -2.2, 0);
  };
  return { scene, camera, update };
}

// 4 — x-ray view of coiled intestines with the gum travelling through
function shotIntestine() {
  const scene = baseScene('#120506', 0.025);
  const camera = cam(36);
  // serpentine path: smooth zig-zag between left and right
  const path = [];
  for (let r = 0; r <= 5; r++) {
    const y = 7 - r * 3.1, s = r % 2 ? -1 : 1;
    path.push(new THREE.Vector3(-3.6 * s, y, 0.3 * Math.sin(r)), new THREE.Vector3(0, y - 0.25, 0.9 * s), new THREE.Vector3(3.6 * s, y, -0.3));
    path.push(new THREE.Vector3(4.7 * s, y - 1.55, 0.2));
  }
  const curve = new THREE.CatmullRomCurve3(path, false, 'catmullrom', 0.5);
  const g = organicTube(curve, 1.05, 1600, 64, (u) => 1 + 0.1 * Math.abs(Math.sin(u * 220)) + 0.06 * n3(u * 40, 0, 0));
  const gutM = flesh('#d9605e', 1, { transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
  gutM.normalMap.repeat.set(80, 3);
  const gut = new THREE.Mesh(g, gutM); scene.add(gut);

  const gum = gumBlob(0.75, 21); gum.scale.set(1.35, 0.85, 0.85); gum.renderOrder = -1; scene.add(gum);
  const gumGlow = new THREE.PointLight('#ff5aa5', 8, 4, 2); scene.add(gumGlow);

  spot(scene, '#ffe2d4', 350, [-8, 12, 16], [0, 0, 0], 0.6, false);
  spot(scene, '#ff6a6a', 120, [10, -6, -8], [0, 0, 0], 0.6, false);
  scene.add(new THREE.HemisphereLight('#ffc0b0', '#1a0404', 0.35));

  const P = new THREE.Vector3(), T = new THREE.Vector3();
  const update = (t) => {
    const k = ease(t), u = lerp(0.47, 0.53, k);
    curve.getPointAt(u, P); curve.getTangentAt(u, T);
    gum.position.copy(P); gum.lookAt(P.clone().add(T)); gum.rotateY(Math.PI / 2);
    gumGlow.position.copy(P).add(new THREE.Vector3(0, 0, 1.4));
    camera.position.set(P.x * 0.6 + 1, P.y + 1.5, lerp(26, 19, k));
    camera.lookAt(P.x * 0.6, P.y - 0.3, 0);
  };
  return { scene, camera, update };
}

// 5 — tear-off desk calendar: DAY 1 page flying off, DAY 3 underneath
function shotCalendar() {
  const scene = baseScene('#0a1018', 0.02);
  const camera = cam(30);
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshPhysicalMaterial({ color: '#2a1d16', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 }));
  desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);

  const block = new THREE.Group(); scene.add(block);
  const body = new THREE.Mesh(new RoundedBoxGeometry(4, 4.6, 1.4, 6, 0.18), new THREE.MeshPhysicalMaterial({ color: '#eae6dc', roughness: 0.7 }));
  body.position.y = 2.3; body.castShadow = body.receiveShadow = true; block.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 4.4), new THREE.MeshPhysicalMaterial({ map: textTexture(['DAY', '3']), roughness: 0.6 }));
  face.position.set(0, 2.3, 0.711); face.receiveShadow = true; block.add(face);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.05, 16, 32), new THREE.MeshStandardMaterial({ color: '#888', metalness: 1, roughness: 0.25 }));
  for (const x of [-1, 1]) { const r = ring.clone(); r.position.set(x, 4.6, 0.5); block.add(r); }
  block.rotation.y = -0.25;

  const pageGeo = new THREE.PlaneGeometry(3.8, 4.4, 40, 40);
  const page = new THREE.Mesh(pageGeo, new THREE.MeshPhysicalMaterial({ map: textTexture(['DAY', '1']), roughness: 0.6, side: THREE.DoubleSide }));
  page.castShadow = true; scene.add(page);
  const base = Float32Array.from(pageGeo.attributes.position.array);

  const gum = gumBlob(0.5, 31); gum.scale.set(1.2, 0.6, 1); gum.position.set(2.8, 0.3, 1.8); scene.add(gum);

  spot(scene, '#fff1e0', 300, [-6, 12, 10], [0, 2, 0], 0.45);
  spot(scene, '#7fb4ff', 90, [8, 5, -6], [0, 2, 0], 0.6, false);
  scene.add(new THREE.HemisphereLight('#c8dcff', '#100806', 0.3));

  const update = (t) => {
    const k = ease(t);
    // page curls up and flies to the right
    const p = pageGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      const v = (y + 2.2) / 4.4; // 0 bottom, 1 top
      const curl = k * 1.6 * (1 - v) ** 2;
      p.setXYZ(i, x, y - Math.sin(curl) * 0.4, Math.sin(curl) * 1.4 * (1 - v));
    }
    p.needsUpdate = true; pageGeo.computeVertexNormals();
    page.position.set(lerp(-0.25, 4.5, k ** 2), 2.3 + k * 2.2, 0.75 + k * 0.4);
    page.rotation.set(-k * 0.6, -0.25 - k * 0.7, -k * 0.8);
    camera.position.set(lerp(-1.5, -2.5, k), lerp(5, 4.4, k), lerp(24, 20, k));
    camera.lookAt(0.8, 2.6, 0);
  };
  return { scene, camera, update };
}

// 6 — cutaway intestine jammed by a big wad of gum, red alarm light
function shotBlockage() {
  const scene = baseScene('#100203', 0.025);
  const camera = cam(34);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-14, 0.5, 0), new THREE.Vector3(-6, -0.3, 0), new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(6, 0.4, 0), new THREE.Vector3(14, -0.2, 0)]);
  // half-tube cut lengthwise so we see the jam inside
  const segs = 600, radial = 64, R = 2.2;
  const g = new THREE.BufferGeometry(), pos = [], idx = [];
  const P = new THREE.Vector3(), Tn = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3();
  const frames = curve.computeFrenetFrames(segs, false);
  for (let i = 0; i <= segs; i++) {
    const u = i / segs; curve.getPointAt(u, P);
    const jam = Math.exp(-((u - 0.5) ** 2) / 0.006);
    for (let j = 0; j <= radial; j++) {
      const a = Math.PI * (j / radial) + Math.PI; // back half only
      const r = R * (1 + 0.1 * Math.abs(Math.sin(u * 70)) + 0.35 * jam + 0.05 * n3(u * 40, j * 0.2, 0));
      N.copy(frames.normals[i]).multiplyScalar(Math.cos(a) * r);
      B.copy(frames.binormals[i]).multiplyScalar(Math.sin(a) * r);
      pos.push(P.x + N.x + B.x, P.y + N.y + B.y, P.z + N.z + B.z);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) {
    const a = i * (radial + 1) + j, b = a + radial + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  // uv for normal map
  const uv = []; for (let i = 0; i <= segs; i++) for (let j = 0; j <= radial; j++) uv.push(i / segs * 20, j / radial * 2);
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  const wall = new THREE.Mesh(g, flesh('#c8545a', 1, { side: THREE.DoubleSide }));
  wall.receiveShadow = true; wall.castShadow = true; scene.add(wall);
  // cut edge rim
  const rimM = flesh('#8e2a30', 2);
  for (const s of [1, -1]) {
    const pts = []; for (let i = 0; i <= 80; i++) { const u = i / 80; curve.getPointAt(u, P); const fr = Math.min(segs, Math.round(u * segs)); const jam = Math.exp(-((u - 0.5) ** 2) / 0.006); pts.push(P.clone().add(frames.normals[fr].clone().multiplyScalar(s * R * (1.05 + 0.35 * jam)))); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 0.16, 16), rimM); scene.add(m);
  }
  const group = new THREE.Group(); scene.add(group);
  const blobs = [];
  [[-0.9, 0.2, -0.5, 1.3], [0.6, 0.4, -0.4, 1.45], [1.9, -0.3, -0.6, 1.1], [-0.1, -0.9, -0.9, 1.2], [0.4, 1.3, -1.0, 0.9], [-1.8, -0.4, -0.8, 0.95]]
    .forEach(([x, y, z, r], i) => { const b = gumBlob(r, 40 + i); b.position.set(x, y, z); group.add(b); blobs.push(b); });
  // small trapped bits behind the jam
  for (let i = 0; i < 9; i++) { const b = gumBlob(0.25 + Math.random() * 0.2, 60 + i); b.position.set(-4 - i * 0.7, -1.2 + Math.random() * 0.6, -1 + Math.random()); group.add(b); }

  spot(scene, '#ffe0d0', 260, [-4, 9, 12], [0, 0, -1], 0.55);
  const alarm = new THREE.PointLight('#ff1e1e', 40, 25, 1.6); alarm.position.set(3, 4, 6); scene.add(alarm);
  scene.add(new THREE.HemisphereLight('#ff9a9a', '#1a0303', 0.2));

  const update = (t) => {
    const k = ease(t);
    alarm.intensity = 25 + 35 * (0.5 + 0.5 * Math.sin(t * Math.PI * 6));
    blobs.forEach((b, i) => b.scale.setScalar(1 + 0.03 * Math.sin(t * 10 + i)));
    camera.position.set(lerp(-4, -2, k), lerp(4.5, 3.5, k), lerp(21, 16, k));
    camera.lookAt(0.2, -0.2, -1);
  };
  return { scene, camera, update };
}

export const shots = [shotMouth, shotEsophagus, shotStomach, shotIntestine, shotCalendar, shotBlockage];

let current = null, currentIdx = -1;
window.renderShot = (i, t) => {
  if (currentIdx !== i) {
    if (current) current.scene.traverse((o) => { o.geometry?.dispose?.(); });
    current = shots[i](); currentIdx = i;
  }
  current.update(t);
  renderer.render(current.scene, current.camera);
  return true;
};
window.ready = true;
