// Shared 3D toolkit for the ZackDFilms-style episodes: renderer, procedural
// textures, wet-flesh / gum materials, geometry helpers and the page runner.
// An episode module calls run([shotFn, ...]); each shotFn() returns
// { scene, camera, update(t) } with t in [0, 1].
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

export const W = 1080, H = 1920;
export const noise = new ImprovedNoise();
export const n3 = (x, y, z) => noise.noise(x, y, z);
export const ease = (t) => t * t * (3 - 2 * t);
export const lerp = (a, b, t) => a + (b - a) * t;

export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

export const pmrem = new THREE.PMREMGenerator(renderer);
export const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---------- procedural textures ----------
export function bumpNormalMap(size = 512, freq = 8, octaves = 4, seed = 0) {
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
export const fleshNormal = bumpNormalMap(512, 10, 5, 1);
export const fineNormal = bumpNormalMap(512, 40, 3, 5);

export function textTexture(lines, { w = 512, h = 512, bg = '#f4f1ea', fg = '#1b1b1b', head = '#d8322f' } = {}) {
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
export function flesh(color = '#c2474f', repeat = 3, opts = {}) {
  const nm = fleshNormal.clone(); nm.repeat.set(repeat, repeat); nm.needsUpdate = true;
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.42, metalness: 0, normalMap: nm, normalScale: new THREE.Vector2(0.8, 0.8),
    clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.2, sheenColor: new THREE.Color('#ff7a7a'),
    sheenRoughness: 0.5, envMapIntensity: 0.25, ...opts,
  });
}
export function gumMaterial() {
  const nm = fineNormal.clone(); nm.repeat.set(2, 2); nm.needsUpdate = true;
  return new THREE.MeshPhysicalMaterial({
    color: '#f02a86', roughness: 0.45, normalMap: nm, normalScale: new THREE.Vector2(0.35, 0.35),
    sheen: 0.35, sheenColor: new THREE.Color('#ff9cc8'), sheenRoughness: 0.4,
    clearcoat: 0.35, clearcoatRoughness: 0.3, envMapIntensity: 0.35,
  });
}

// ---------- geometry helpers ----------
export function displace(geo, fn) {
  const p = geo.attributes.position, n = geo.attributes.normal, v = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); nn.fromBufferAttribute(n, i);
    const d = fn(v, i);
    p.setXYZ(i, v.x + nn.x * d, v.y + nn.y * d, v.z + nn.z * d);
  }
  geo.computeVertexNormals();
  return geo;
}
export function gumBlob(r = 1, seed = 0) {
  const g = new THREE.SphereGeometry(r, 160, 120);
  displace(g, (v) => r * (0.13 * n3(v.x * 1.6 + seed, v.y * 1.6, v.z * 1.6) +
                         0.035 * n3(v.x * 6 + seed, v.y * 6, v.z * 6)));
  const m = new THREE.Mesh(g, gumMaterial());
  m.castShadow = m.receiveShadow = true;
  return m;
}
// Tube whose radius varies along its length: rf(u, angle) -> radius multiplier
export function organicTube(curve, radius, segs, radial, rf, closed = false) {
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
export function baseScene(bg = '#0b0405', fog = null) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(bg);
  s.environment = envMap;
  if (fog) s.fog = new THREE.FogExp2(bg, fog);
  return s;
}
export function cam(fov = 32) { return new THREE.PerspectiveCamera(fov, W / H, 0.05, 200); }
export function spot(scene, color, intensity, pos, target = [0, 0, 0], angle = 0.5, shadow = true) {
  const l = new THREE.SpotLight(color, intensity, 0, angle, 0.6, 1.2);
  l.position.set(...pos); l.target.position.set(...target);
  scene.add(l, l.target);
  if (shadow) { l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0004; l.shadow.radius = 6; }
  return l;
}


export function run(shots) {
  let current = null, currentIdx = -1;
  window.shotCount = shots.length;
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
}
