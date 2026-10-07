// Scene library for "What Happens If You Fall Into a Black Hole?" (16:9 long-form).
// Every scene takes params from the episode JSON so one scene can be shot many
// ways; camera moves are lerped over the shot (t in [0, 1]) from *0 to *1 values.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { n3, ease, lerp, baseScene, cam, bloom, run } from './lib3d.js';

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const P = (p, k, d) => (p[k] === undefined ? d : p[k]);
// deterministic pseudo-random
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- camera ----------
// Orbit camera: az (around y), elev (radians above the disk), dist, look target.
function orbit(camera, p, t, d = {}) {
  const k = ease(t);
  const az = lerp(P(p, 'az0', d.az0 ?? 0), P(p, 'az1', d.az1 ?? 0.3), k);
  const el = lerp(P(p, 'el0', d.el0 ?? 0.15), P(p, 'el1', d.el1 ?? 0.1), k);
  const r = lerp(P(p, 'dist0', d.dist0 ?? 20), P(p, 'dist1', d.dist1 ?? 14), k);
  const ty = lerp(P(p, 'ty0', d.ty0 ?? 0), P(p, 'ty1', d.ty1 ?? 0), k);
  const tx = lerp(P(p, 'tx0', d.tx0 ?? 0), P(p, 'tx1', d.tx1 ?? 0), k);
  camera.position.set(Math.sin(az) * Math.cos(el) * r + tx, Math.sin(el) * r + ty, Math.cos(az) * Math.cos(el) * r);
  camera.lookAt(tx, ty, 0);
}

// ---------- stars ----------
function starfield(scene, n = 7000, R = 160) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const palette = [[1, 1, 1], [0.75, 0.85, 1], [1, 0.85, 0.65], [1, 0.95, 0.85]];
  for (let i = 0; i < n; i++) {
    const u = rnd(i) * 2 - 1, a = rnd(i + 0.5) * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(a) * s * R, u * R, Math.sin(a) * s * R], i * 3);
    const c = palette[i % 4], b = 0.25 + rnd(i + 0.25) ** 3 * 1.4;
    col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, fog: false }));
  scene.add(pts);
  return pts;
}

// ---------- accretion disk shader ----------
const diskFrag = `
uniform float uTime, uInner, uOuter, uView, uGain;
varying vec2 vPos;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  float r = length(vPos), a = atan(vPos.y, vPos.x);
  float x = (r - uInner) / (uOuter - uInner);
  if (x < 0.0 || x > 1.0) discard;
  float swirl = a + uTime * 1.6 / (0.35 + x * 1.8);
  float n = fbm(vec2(cos(swirl), sin(swirl)) * (2.5 + x * 3.0) + vec2(r * 1.7, -r * 1.3));
  float bands = 0.65 + 0.35 * sin(r * 13.0 + n * 7.0);
  vec3 hot = vec3(1.0, 0.96, 0.88), mid = vec3(1.0, 0.56, 0.16), cool = vec3(0.55, 0.1, 0.03);
  vec3 col = x < 0.3 ? mix(hot, mid, x / 0.3) : mix(mid, cool, (x - 0.3) / 0.7);
  float doppler = 1.0 + 0.7 * sin(a - uView);
  float fade = smoothstep(0.0, 0.05, x) * (1.0 - smoothstep(0.6, 1.0, x));
  float I = (0.3 + 1.0 * n) * bands * doppler * fade * (1.7 - x);
  gl_FragColor = vec4(col * I * uGain, 1.0);
}`;
const diskVert = `varying vec2 vPos; void main(){ vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
function diskMaterial(inner, outer, gain = 1) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uInner: { value: inner }, uOuter: { value: outer }, uView: { value: 0 }, uGain: { value: gain } },
    vertexShader: diskVert, fragmentShader: diskFrag,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
}

// Black hole with accretion disk, lensed halo and photon ring.
function blackHole(scene, { disk = true, gain = 1, tilt = 0.12, size = 1 } = {}) {
  const g = new THREE.Group(); g.scale.setScalar(size); scene.add(g);
  const horizon = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshBasicMaterial({ color: '#000000' }));
  g.add(horizon);
  const parts = { group: g, horizon, mats: [] };
  if (disk) {
    const dm = diskMaterial(1.9, 7, gain);
    const d = new THREE.Mesh(new THREE.RingGeometry(1.9, 7, 256, 16), dm);
    d.rotation.x = -Math.PI / 2; const dg = new THREE.Group(); dg.rotation.z = tilt; dg.add(d); g.add(dg);
    // far side of the disk lensed over and under the shadow: a camera-facing ring
    const hm = diskMaterial(1.3, 3.0, gain * 0.9);
    const halo = new THREE.Mesh(new THREE.RingGeometry(1.3, 3.0, 256, 8), hm); g.add(halo);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.24, 1.32, 256, 1), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    g.add(ring);
    Object.assign(parts, { disk: d, diskGroup: dg, halo, ring, mats: [dm, hm] });
  }
  parts.update = (t, camera, speed = 1) => {
    if (!disk) return;
    const local = camera.position.clone(); g.worldToLocal(local);
    const view = Math.atan2(local.z, local.x);
    parts.mats.forEach((m) => { m.uniforms.uTime.value = t * 6 * speed; m.uniforms.uView.value = view; });
    // halo & photon ring face the camera; the halo fades when looking down on the disk
    parts.halo.lookAt(camera.position); parts.ring.lookAt(camera.position);
    const elev = Math.abs(Math.asin(local.y / local.length()));
    parts.mats[1].uniforms.uGain.value = gain * 0.9 * (1 - Math.min(1, elev / 1.2) * 0.85);
  };
  return parts;
}

// ---------- props ----------
function astronaut() {
  const g = new THREE.Group();
  const suit = new THREE.MeshPhysicalMaterial({ color: '#9ea3ab', roughness: 0.65, sheen: 0.2, sheenColor: new THREE.Color('#ffffff'), envMapIntensity: 0.25 });
  const grey = new THREE.MeshPhysicalMaterial({ color: '#7d8590', roughness: 0.5, envMapIntensity: 0.3 });
  const visor = new THREE.MeshPhysicalMaterial({ color: '#d8a640', metalness: 1, roughness: 0.08, clearcoat: 1, envMapIntensity: 1.5 });
  const add = (geo, mat, x, y, z, rx = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); g.add(m); return m; };
  add(new THREE.CapsuleGeometry(0.42, 0.7, 8, 24), suit, 0, 0, 0);
  add(new RoundedBoxGeometry(0.75, 0.9, 0.38, 4, 0.1), suit, 0, 0.05, -0.38);
  add(new THREE.SphereGeometry(0.36, 48, 32), suit, 0, 0.82, 0);
  const v = add(new THREE.SphereGeometry(0.3, 48, 32, Math.PI / 12, Math.PI / 1.2, Math.PI / 4, Math.PI / 2.2), visor, 0, 0.84, 0.08);
  v.rotation.y = 0;
  add(new THREE.CapsuleGeometry(0.13, 0.55, 6, 16), suit, -0.55, 0.15, 0.05, 0, 0.9);
  add(new THREE.CapsuleGeometry(0.13, 0.55, 6, 16), suit, 0.55, 0.15, 0.05, 0, -0.9);
  add(new THREE.SphereGeometry(0.13, 16, 12), grey, -0.85, -0.12, 0.05);
  add(new THREE.SphereGeometry(0.13, 16, 12), grey, 0.85, -0.12, 0.05);
  add(new THREE.CapsuleGeometry(0.16, 0.65, 6, 16), suit, -0.2, -0.85, 0.05, 0.2, 0.08);
  add(new THREE.CapsuleGeometry(0.16, 0.65, 6, 16), suit, 0.22, -0.88, 0.0, -0.15, -0.06);
  add(new RoundedBoxGeometry(0.26, 0.2, 0.36, 3, 0.06), grey, -0.24, -1.32, 0.12);
  add(new RoundedBoxGeometry(0.26, 0.2, 0.36, 3, 0.06), grey, 0.26, -1.34, 0.04);
  g.userData.materials = [suit, grey, visor];
  return g;
}

function ship() {
  const g = new THREE.Group();
  const hull = new THREE.MeshPhysicalMaterial({ color: '#aab0b8', metalness: 0.6, roughness: 0.4, clearcoat: 0.3, envMapIntensity: 0.3 });
  const dark = new THREE.MeshPhysicalMaterial({ color: '#2b3038', metalness: 0.5, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 3.4, 12, 32), hull); body.rotation.x = Math.PI / 2; g.add(body);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.16, 16, 64), hull); g.add(ring);
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.2, 0.1), dark); spoke.rotation.z = i * Math.PI / 2; spoke.position.set(Math.sin(i * Math.PI / 2) * 0.6, Math.cos(i * Math.PI / 2) * 0.6, 0); spoke.rotation.z = -i * Math.PI / 2; g.add(spoke);
  }
  const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 0.6, 32), dark); eng.rotation.x = Math.PI / 2; eng.position.z = -2.3; g.add(eng);
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.38, 1.6, 32), new THREE.MeshBasicMaterial({ color: '#7fc8ff', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
  flame.rotation.x = -Math.PI / 2; flame.position.z = -3.3; g.add(flame);
  const win = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffe6a0' })); win.position.set(0, 0.3, 1.9); win.scale.set(1, 0.5, 0.6); g.add(win);
  g.userData.flame = flame;
  return g;
}

function earthTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const x = c.getContext('2d'), img = x.createImageData(1024, 512);
  for (let j = 0; j < 512; j++) for (let i = 0; i < 1024; i++) {
    const lon = (i / 1024) * Math.PI * 2, lat = (j / 512 - 0.5) * Math.PI;
    const px = Math.cos(lat) * Math.cos(lon), py = Math.sin(lat), pz = Math.cos(lat) * Math.sin(lon);
    const h = n3(px * 1.8, py * 1.8, pz * 1.8) + 0.5 * n3(px * 4, py * 4, pz * 4);
    const ice = Math.abs(lat) > 1.2;
    let r, gg, b;
    if (ice) [r, gg, b] = [235, 240, 245];
    else if (h > 0.08) { const k = Math.min(1, (h - 0.08) * 3); [r, gg, b] = [lerp(70, 150, k), lerp(120, 120, k), lerp(50, 70, k)]; }
    else [r, gg, b] = [20, lerp(60, 90, h + 0.5), lerp(130, 170, h + 0.5)];
    const k = (j * 1024 + i) * 4; img.data.set([r, gg, b, 255], k);
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const sunFrag = `
uniform float uTime; varying vec3 vN;
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z); }
void main(){
  float n = noise(vN * 5.0 + uTime) * 0.6 + noise(vN * 12.0 - uTime * 1.3) * 0.4;
  vec3 c = mix(vec3(1.0, 0.45, 0.08), vec3(1.0, 0.92, 0.6), n);
  gl_FragColor = vec4(c * 1.05, 1.0);
}`;
function sunMesh(color) {
  return new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec3 vN; void main(){ vN = normal; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: color ? sunFrag.replace('vec3(1.0, 0.45, 0.08), vec3(1.0, 0.92, 0.6)', color) : sunFrag,
  }));
}

function finish(scene, camera, update, b = {}) {
  let first = true;
  const upd = (t) => { update(t); if (first) { update(t); first = false; } }; // camera-facing parts need the camera placed first
  return { scene, camera, update: upd, render: bloom(scene, camera, { strength: b.strength ?? 0.85, radius: b.radius ?? 0.55, threshold: b.threshold ?? 0.6 }) };
}

// =================== SCENES ===================

// Cinematic black hole. params: az/el/dist/ty 0→1, tilt, gain, ship, astro, speed
function bh_hero(p) {
  const scene = baseScene('#000000'); const camera = cam(P(p, 'fov', 35));
  starfield(scene);
  const bh = blackHole(scene, { tilt: P(p, 'tilt', 0.12), gain: P(p, 'gain', 1) });
  let s = null, a = null;
  if (p.ship) { s = ship(); s.scale.setScalar(0.35); scene.add(s); }
  if (p.astro) { a = astronaut(); a.scale.setScalar(0.4); scene.add(a); }
  scene.add(new THREE.HemisphereLight('#ffd9b0', '#000000', 0.6));
  const key = new THREE.PointLight('#ffb070', 60, 40, 1.2); scene.add(key);
  const update = (t) => {
    orbit(camera, p, t);
    bh.update(t, camera, P(p, 'speed', 1));
    if (s) { s.position.set(lerp(9, 7, t), 1.6, lerp(6, 4, t)); s.lookAt(0, 0, 0); }
    if (a) { a.position.set(lerp(5, 3.4, ease(t)), 0.9, lerp(4, 3, ease(t))); a.rotation.set(t * 0.6, t * 0.9, 0.3); }
  };
  return finish(scene, camera, update);
}

// A giant star collapsing. phase "collapse": shrink & darken; "supernova": flash, shell, black hole appears
function star_collapse(p) {
  const scene = baseScene('#000000'); const camera = cam(35);
  starfield(scene);
  const star = sunMesh(); scene.add(star);
  // supernova shell: rim-lit bubble (bright at the limb, clear in the middle)
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color('#cfe6ff') }, opacity: { value: 1 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 color; uniform float opacity; varying vec3 vN; varying vec3 vV; void main(){ float rim = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(color * rim * opacity * 2.0, 1.0); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  shell.material.color = shell.material.uniforms.color.value;
  Object.defineProperty(shell.material, 'opacity', { set(v) { this.uniforms && (this.uniforms.opacity.value = v); }, get() { return this.uniforms ? this.uniforms.opacity.value : 1; } });
  scene.add(shell);
  const bh = blackHole(scene, { gain: 0.8, size: 0.6 }); bh.group.visible = false;
  const flash = new THREE.PointLight('#ffffff', 0, 100, 1); scene.add(flash);
  const nova = p.phase === 'supernova';
  const update = (t) => {
    star.material.uniforms.uTime.value = t * 2;
    if (!nova) {
      const s = lerp(4.5, 1.2, ease(seg(t, 0.15, 1)) ** 2) * (1 + 0.04 * Math.sin(t * 40) * seg(t, 0.5, 1));
      star.scale.setScalar(s); shell.visible = false;
    } else {
      const f = seg(t, 0, 0.12);
      star.visible = t < 0.08; star.scale.setScalar(lerp(1.2, 0.3, f));
      shell.visible = t > 0.03; const sh = seg(t, 0.03, 1);
      shell.scale.setScalar(lerp(0.5, 16, ease(sh))); shell.material.opacity = (1 - sh) ** 1.5;
      shell.material.color.set('#cfe6ff').lerp(new THREE.Color('#ff7a2a'), sh); // blue-white flash cooling to orange
      bh.group.visible = t > 0.25; bh.group.scale.setScalar(0.6 * ease(seg(t, 0.25, 0.6)) + 0.001);
      bh.update(t, camera);
    }
    orbit(camera, p, t, { dist0: nova ? 30 : 30, dist1: nova ? 24 : 22, el0: 0.12, el1: 0.18, az0: -0.2, az1: 0.25 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.85 });
}

// Spacetime grid funnel. params: depth0/depth1 (well depth), mass ("planet"|"star"|"hole"), glitch
function grid_well(p) {
  const scene = baseScene('#02040c', 0.012); const camera = cam(38);
  starfield(scene, 4000);
  const N = 120, S = 40, lines = [];
  const mat = new THREE.LineBasicMaterial({ color: '#4fc3ff', transparent: true, opacity: 0.85 });
  for (let dir = 0; dir < 2; dir++) for (let i = 0; i <= N; i += 3) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 3), 3));
    const l = new THREE.Line(g, mat); l.userData = { dir, i }; scene.add(l); lines.push(l);
  }
  const mass = P(p, 'mass', 'star');
  let body;
  if (mass === 'planet') { body = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.MeshStandardMaterial({ map: earthTexture(), roughness: 0.8 })); }
  else if (mass === 'star') { body = sunMesh(); }
  else { body = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.MeshBasicMaterial({ color: '#000' })); }
  scene.add(body);
  const glow = new THREE.PointLight('#ffd27a', mass === 'star' ? 40 : 0, 30, 1.2); scene.add(glow);
  scene.add(new THREE.HemisphereLight('#bfe0ff', '#000', 0.8));
  const point = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  point.visible = !!p.glitch; scene.add(point);
  const update = (t) => {
    const k = ease(t), depth = lerp(P(p, 'depth0', 2), P(p, 'depth1', 6), k);
    const hole = mass === 'hole', w = hole ? 0.6 : 2.5;
    const f = (r) => hole ? -depth * Math.min(6, w / (r + 0.05)) : -depth / (1 + (r / w) ** 2);
    for (const l of lines) {
      const a = l.geometry.attributes.position, { dir, i } = l.userData;
      for (let j = 0; j <= N; j++) {
        const u = -S / 2 + (j / N) * S, v = -S / 2 + (i / N) * S;
        const x = dir ? u : v, z = dir ? v : u, r = Math.hypot(x, z);
        let y = f(r);
        if (p.glitch && r < 4) y += (rnd(j * 7 + i * 13 + Math.floor(t * 30)) - 0.5) * t * 2 * (4 - r);
        a.setXYZ(j, x, y, z);
      }
      a.needsUpdate = true;
    }
    const bodyY = hole ? f(1.4) : f(0) + (mass === 'planet' ? 0.9 : 1.1);
    body.position.y = bodyY; body.scale.setScalar(hole ? 0.9 : mass === 'planet' ? 0.9 : 1.2);
    if (body.material.uniforms) body.material.uniforms.uTime.value = t * 2;
    body.rotation.y = t * 0.8; glow.position.set(0, bodyY + 2, 0);
    point.position.y = f(0.02) * 0.98; point.scale.setScalar(1 + 0.5 * Math.sin(t * 50));
    orbit(camera, p, t, { dist0: 26, dist1: 21, el0: 0.55, el1: 0.42, az0: -0.3, az1: 0.2, ty0: -2, ty1: -2.5 });
  };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.4 });
}

// Earth squeezed down to a marble-sized black hole
function earth_squeeze(p) {
  const scene = baseScene('#000000'); const camera = cam(30);
  starfield(scene);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), new THREE.MeshStandardMaterial({ map: earthTexture(), roughness: 0.75 }));
  scene.add(earth);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.03, 96, 64), new THREE.MeshBasicMaterial({ color: '#6fb6ff', transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(atmo);
  const bh = blackHole(scene, { gain: 0.9, size: 0.25 }); bh.group.visible = false;
  const sun = new THREE.DirectionalLight('#fff3e0', 3); sun.position.set(-5, 2, 6); scene.add(sun);
  scene.add(new THREE.AmbientLight('#203050', 0.4));
  const update = (t) => {
    const s = lerp(3.2, 0.02, ease(seg(t, 0.1, 0.75)) ** 0.6);
    earth.scale.setScalar(s); atmo.scale.setScalar(s); earth.rotation.y = t * 1.5;
    earth.visible = atmo.visible = t < 0.78;
    bh.group.visible = t > 0.74; bh.group.scale.setScalar(0.25 * ease(seg(t, 0.74, 0.9)) + 0.001);
    bh.update(t, camera);
    camera.position.set(0, 0.8, lerp(14, 6, ease(seg(t, 0.4, 1)))); camera.lookAt(0, 0, 0);
  };
  return finish(scene, camera, update);
}

// Milky Way spiral with a marker on Sagittarius A*
function galaxy(p) {
  const scene = baseScene('#000000'); const camera = cam(40);
  starfield(scene, 3000);
  const n = 60000, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const arm = i % 4, r = Math.pow(rnd(i), 0.6) * 18 + 0.3;
    const ang = arm * Math.PI / 2 + r * 0.42 + (rnd(i + 0.3) - 0.5) * (0.5 + 4 / (r + 1));
    const spread = (rnd(i + 0.7) - 0.5) * 1.2;
    pos.set([Math.cos(ang) * r + spread, (rnd(i + 0.9) - 0.5) * 0.6 * Math.exp(-r / 8) * 2, Math.sin(ang) * r + spread], i * 3);
    const core = Math.exp(-r / 3);
    col.set([lerp(0.55, 1, core) * 0.9, lerp(0.65, 0.85, core) * 0.9, lerp(1, 0.55, core) * 0.9], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const gal = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(gal);
  const bulge = new THREE.Mesh(new THREE.SphereGeometry(1.4, 32, 24), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  bulge.scale.y = 0.4; scene.add(bulge);
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.68, 64), new THREE.MeshBasicMaterial({ color: '#ff4b4b', side: THREE.DoubleSide, transparent: true }));
  scene.add(marker);
  const update = (t) => {
    gal.rotation.y = t * 0.15;
    orbit(camera, p, t, { dist0: 40, dist1: 18, el0: 0.8, el1: 0.5, az0: 0, az1: 0.4 });
    marker.lookAt(camera.position); marker.material.opacity = seg(t, 0.4, 0.6) * (0.7 + 0.3 * Math.sin(t * 20));
    marker.scale.setScalar(1 + 0.15 * Math.sin(t * 12));
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.3 });
}

// Sgr A*'s horizon to scale with the Sun and Mercury's orbit
function size_compare(p) {
  const scene = baseScene('#000000'); const camera = cam(36);
  starfield(scene);
  const bh = blackHole(scene, { disk: false });
  const glow = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.35, 128), new THREE.MeshBasicMaterial({ color: '#ff9a40', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
  scene.add(glow);
  const orbitPts = []; for (let i = 0; i <= 256; i++) { const a = (i / 256) * Math.PI * 2; orbitPts.push(new THREE.Vector3(Math.cos(a) * 4.8, 0, Math.sin(a) * 4.8)); }
  const orb = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPts), new THREE.LineDashedMaterial({ color: '#9fb4d0', dashSize: 0.2, gapSize: 0.12 }));
  orb.computeLineDistances(); scene.add(orb);
  const mercury = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 16), new THREE.MeshStandardMaterial({ color: '#a89f94' })); scene.add(mercury);
  const sun = sunMesh(); sun.scale.setScalar(0.058); sun.position.set(1.9, 0, 1.0); scene.add(sun);
  const sunHalo = new THREE.PointLight('#ffcc66', 8, 3, 1.5); sunHalo.position.copy(sun.position); scene.add(sunHalo);
  scene.add(new THREE.HemisphereLight('#ffffff', '#202020', 1));
  const update = (t) => {
    sun.material.uniforms.uTime.value = t;
    const a = t * 1.2 + 0.4; mercury.position.set(Math.cos(a) * 4.8, 0, Math.sin(a) * 4.8);
    glow.lookAt(camera.position);
    orbit(camera, p, t, { dist0: 15, dist1: 11, el0: 0.6, el1: 0.45, az0: 0.3, az1: 0.7 });
  };
  return finish(scene, camera, update, { strength: 0.9, threshold: 0.5 });
}

// Recreation of an Event Horizon Telescope-style image: blurry orange ring
function eht_image(p) {
  const scene = baseScene('#000000'); const camera = new THREE.OrthographicCamera(-16 / 9, 16 / 9, 1, -1, 0.1, 10);
  camera.position.z = 2;
  const mat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uRot: { value: P(p, 'rot', 0) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float uTime, uRot; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){
        float r = length(vUv), a = atan(vUv.y, vUv.x);
        float ring = exp(-pow((r - 0.42) / 0.11, 2.0));
        float bright = 0.55 + 0.45 * cos(a - (-2.2 + uRot)) + 0.12 * sin(a * 3.0 + uTime);
        float v = ring * bright;
        v += (hash(vUv * 400.0 + uTime) - 0.5) * 0.04;
        vec3 c = mix(vec3(0.35, 0.06, 0.0), vec3(1.0, 0.6, 0.15), smoothstep(0.1, 0.8, v));
        c = mix(c, vec3(1.0, 0.92, 0.7), smoothstep(0.75, 1.1, v));
        gl_FragColor = vec4(c * v * 1.4, 1.0);
      }`,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.25), mat); scene.add(quad);
  const update = (t) => { mat.uniforms.uTime.value = t * 2; quad.scale.setScalar(lerp(1, 1.12, ease(t))); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Spaceship cruising toward a distant black hole
function ship_travel(p) {
  const scene = baseScene('#000000'); const camera = cam(40);
  const stars = starfield(scene);
  const bh = blackHole(scene, { gain: 1.2 }); bh.group.position.set(P(p, 'bhx', -30), 4, -120);
  const s = ship(); scene.add(s);
  scene.add(new THREE.HemisphereLight('#ffe0c0', '#101820', 0.3));
  const key = new THREE.DirectionalLight('#ffb070', 1.1); key.position.set(-30, 4, -120); scene.add(key);
  const update = (t) => {
    const k = ease(t);
    bh.group.scale.setScalar(lerp(P(p, 'size0', 3), P(p, 'size1', 6), k)); bh.update(t, camera);
    s.position.set(0, 0, 0); s.rotation.set(0, Math.PI + 0.25, 0.08 * Math.sin(t * 3));
    s.userData.flame.scale.setScalar(1 + 0.15 * Math.sin(t * 60));
    stars.position.z = t * 6;
    camera.position.set(lerp(6, 4, k), lerp(1.5, 1, k), lerp(8, 6, k)); camera.lookAt(-1.5, 0.5, -8);
  };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.8 });
}

// Astronaut near a black hole. params: stretch0/1 (spaghettification), small (small hole),
// tint0/1 (redshift fade), fall (move toward hole), einstein (lensed star arcs), cam az/dist
function astronaut_bh(p) {
  const scene = baseScene('#000000'); const camera = cam(P(p, 'fov', 32));
  starfield(scene);
  const small = !!p.small;
  const bh = blackHole(scene, { gain: small ? 0.55 : 0.6, tilt: 0.1 }); bh.group.position.set(0, -1.5, -22); bh.group.scale.setScalar(small ? 1.3 : 2.6);
  const a = astronaut(); scene.add(a);
  const mats = a.userData.materials;
  const base = mats.map((m) => m.color.clone());
  let arcs = null;
  if (p.einstein) {
    const n = 900, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const ang = rnd(i) * Math.PI * 2, r = 4.4 * 2.2 + (rnd(i + 0.4) - 0.5) * 1.2; pos.set([Math.cos(ang) * r, Math.sin(ang) * r, 0], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    arcs = new THREE.Points(g, new THREE.PointsMaterial({ color: '#cfe0ff', size: 2.6, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    arcs.position.copy(bh.group.position); arcs.scale.setScalar(0.65); scene.add(arcs);
  }
  scene.add(new THREE.HemisphereLight('#ffe0c0', '#05070a', 0.3));
  const key = new THREE.PointLight('#ffb070', 14, 60, 1.2); key.position.set(0, 1, -10); scene.add(key);
  const fill = new THREE.DirectionalLight('#9fc0ff', 0.6); fill.position.set(5, 3, 8); scene.add(fill);
  const update = (t) => {
    const k = ease(t);
    bh.update(t, camera);
    const st = lerp(P(p, 'stretch0', 0), P(p, 'stretch1', 0), k);
    a.scale.set(1 / (1 + st * 0.5), 1 + st * 3.5, 1 / (1 + st * 0.5));
    const fall = P(p, 'fall', 0);
    a.position.set(0, -st * 1.2, lerp(0, -fall, P(p, 'slow', 0) ? 1 - Math.exp(-4 * t) : k));
    a.rotation.set(0.25 + (st ? -Math.PI / 2 * 0.9 : 0.15 * Math.sin(t * 2)), 0.5 + t * 0.4, st ? 0 : 0.2);
    const tint = lerp(P(p, 'tint0', 0), P(p, 'tint1', 0), k);
    mats.forEach((m, i) => { m.color.copy(base[i]).lerp(new THREE.Color('#5a0000'), tint); m.transparent = tint > 0; m.opacity = 1 - tint * 0.85; });
    if (arcs) { arcs.rotation.z = t * 0.2; arcs.material.opacity = 0.6 + 0.3 * Math.sin(t * 5); }
    const az = lerp(P(p, 'az0', 0.5), P(p, 'az1', 0.2), k), r = lerp(P(p, 'dist0', 7), P(p, 'dist1', 5), k);
    camera.position.set(Math.sin(az) * r, lerp(P(p, 'y0', 1), P(p, 'y1', 0.6), k), Math.cos(az) * r);
    camera.lookAt(lerp(0, 0, k), P(p, 'lookY', 0), lerp(-3, -5, k));
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.9 });
}

// Light paths bending around the hole; photon sphere; optional astronaut on the photon sphere
function light_paths(p) {
  const scene = baseScene('#000000'); const camera = cam(36);
  starfield(scene, 4000);
  blackHole(scene, { disk: false });
  const ps = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.015, 8, 256), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.35 }));
  ps.rotation.x = Math.PI / 2; scene.add(ps);
  // integrate photon-like paths in the xz-plane (exaggerated Newtonian bending)
  const rays = [];
  const mkRay = (b, color) => {
    const pts = []; let x = -14, z = b, vx = 1, vz = 0;
    for (let i = 0; i < 2400; i++) {
      const r = Math.hypot(x, z); if (r < 1.02 || r > 16) break;
      const acc = 2.6 / (r * r) * (1 + 3 / (r * r));
      vx -= acc * x / r * 0.01; vz -= acc * z / r * 0.01;
      const vl = Math.hypot(vx, vz); vx /= vl; vz /= vl;
      x += vx * 0.01; z += vz * 0.01;
      if (i % 4 === 0) pts.push(new THREE.Vector3(x, 0, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const g = new THREE.TubeGeometry(curve, Math.max(8, pts.length), 0.035, 8);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color })); scene.add(m); rays.push(m);
  };
  [-5, -3.6, -2.8, -2.45, 2.45, 2.7, 3.2, 4.2, 6].forEach((b, i) => mkRay(b, i % 2 ? '#ffd27a' : '#7fd4ff'));
  // a ray circling on the photon sphere
  const loopPts = []; for (let i = 0; i <= 256; i++) { const a = (i / 256) * Math.PI * 2; loopPts.push(new THREE.Vector3(Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5)); }
  const loop = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loopPts, true), 256, 0.05, 10, true), new THREE.MeshBasicMaterial({ color: '#ff7ad9' }));
  scene.add(loop); loop.visible = !!p.loop;
  let a = null;
  if (p.astro) { a = astronaut(); a.scale.setScalar(0.32); a.position.set(1.5, 0.05, 0); scene.add(a); }
  scene.add(new THREE.HemisphereLight('#ffffff', '#202020', 1));
  const update = (t) => {
    const k = seg(t, 0, 0.75);
    rays.forEach((r) => { const c = r.geometry.index.count; r.geometry.setDrawRange(0, Math.floor(c * k / 6) * 6); });
    const lc = loop.geometry.index.count; loop.geometry.setDrawRange(0, Math.floor(lc * seg(t, 0.2, 0.9) / 6) * 6);
    if (a) a.rotation.set(0, -Math.PI / 2 + t * 0.2, 0);
    orbit(camera, p, t, { dist0: 18, dist1: 13, el0: 0.9, el1: 0.6, az0: 0, az1: 0.3 });
  };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.3 });
}

// Tidal disruption: a star shredded into a glowing stream
function tidal_star(p) {
  const scene = baseScene('#000000'); const camera = cam(36);
  starfield(scene);
  const bh = blackHole(scene, { gain: 0.6, size: 0.7 });
  const n = 9000, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const part = [];
  for (let i = 0; i < n; i++) {
    const u = rnd(i) * 2 - 1, a = rnd(i + 0.1) * Math.PI * 2, rr = Math.cbrt(rnd(i + 0.2)) * 1.1, s = Math.sqrt(1 - u * u);
    part.push({ dx: Math.cos(a) * s * rr, dy: u * rr, dz: Math.sin(a) * s * rr });
    col.set([1, 0.75 + 0.25 * rnd(i + 0.3), 0.45 + 0.3 * rnd(i + 0.5)], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const cloud = new THREE.Points(g, new THREE.PointsMaterial({ size: 2.4, sizeAttenuation: false, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(cloud);
  const update = (t) => {
    const tau = lerp(P(p, 'tau0', 0), P(p, 'tau1', 1), t) * 9;
    const a = g.attributes.position;
    part.forEach((q, i) => {
      const r0 = 9 + q.dx, th0 = -0.9 + q.dz / 9;
      const r = Math.max(2.4, r0 * (1 - 0.06 * tau));
      const th = th0 + tau * 0.9 / Math.pow(r0 / 9, 1.5) * (1 + 0.6 * (q.dx / 1.1)) * 0.5;
      a.setXYZ(i, Math.cos(th) * r, q.dy * (1 / (1 + tau * 0.3)), Math.sin(th) * r);
    });
    a.needsUpdate = true;
    bh.update(t, camera);
    orbit(camera, p, t, { dist0: 30, dist1: 25, el0: 0.75, el1: 0.6, az0: 0.2, az1: 0.5 });
  };
  return finish(scene, camera, update, { strength: 0.9, threshold: 0.4 });
}

// Two clocks: the ship's ticks normally, the falling astronaut's slows and reddens
function clocks(p) {
  const scene = baseScene('#04050a'); const camera = cam(32);
  starfield(scene, 3000);
  const bh = blackHole(scene, { gain: 0.8 }); bh.group.position.set(0, -2, -40); bh.group.scale.setScalar(3);
  const mk = (x) => {
    const g = new THREE.Group(); g.position.x = x; scene.add(g);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.3, 96), new THREE.MeshPhysicalMaterial({ color: '#b4b4ae', roughness: 0.5, clearcoat: 0.3, envMapIntensity: 0.3 }));
    face.rotation.x = Math.PI / 2; g.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.15, 24, 96), new THREE.MeshPhysicalMaterial({ color: '#b8bcc4', metalness: 1, roughness: 0.25 })); g.add(rim);
    for (let i = 0; i < 12; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.08, i % 3 ? 0.22 : 0.38, 0.05), new THREE.MeshBasicMaterial({ color: '#222' })); const a = i / 12 * Math.PI * 2; tk.position.set(Math.sin(a) * 1.7, Math.cos(a) * 1.7, 0.17); tk.rotation.z = -a; g.add(tk); }
    const hand = (len, w, c) => { const h = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.05), new THREE.MeshBasicMaterial({ color: c })); m.position.y = len / 2; h.add(m); h.position.z = 0.2; g.add(h); return h; };
    return { g, face, min: hand(1.3, 0.1, '#222'), sec: hand(1.6, 0.04, '#e23b3b') };
  };
  const A = mk(-2.8), B = mk(2.8);
  scene.add(new THREE.HemisphereLight('#ffffff', '#303040', 0.5));
  const key = new THREE.DirectionalLight('#ffffff', 0.7); key.position.set(2, 4, 8); scene.add(key);
  const update = (t) => {
    const T = t * 8;
    // slowed clock: rate falls toward zero (integral of 1 - 0.97 t)
    const S = 8 * (t - 0.485 * t * t);
    A.sec.rotation.z = -T * Math.PI * 2 / 3; A.min.rotation.z = -T * 0.15;
    B.sec.rotation.z = -S * Math.PI * 2 / 3; B.min.rotation.z = -S * 0.15;
    const red = ease(seg(t, 0.2, 1));
    B.face.material.color.set('#b4b4ae').lerp(new THREE.Color('#b01818'), red * 0.9);
    bh.update(t, camera);
    camera.position.set(lerp(-0.5, 0.5, t), 0.6, lerp(14, 12, ease(t))); camera.lookAt(0, 0, 0);
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.92 });
}

// Inside the horizon: everything streams toward a single point ahead (the future)
function inside(p) {
  const scene = baseScene('#050000'); const camera = cam(70);
  const n = 2600, pos = new Float32Array(n * 6), col = new Float32Array(n * 6), seeds = [];
  for (let i = 0; i < n; i++) { seeds.push({ a: rnd(i) * Math.PI * 2, r: 0.5 + rnd(i + 0.3) * 9, z: rnd(i + 0.6) * 80 }); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const streaks = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(streaks);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 24), new THREE.MeshBasicMaterial({ color: '#ffffff' })); core.position.z = -80; scene.add(core);
  const update = (t) => {
    const speed = lerp(P(p, 'speed0', 20), P(p, 'speed1', 60), ease(t));
    const travel = t * speed, a = g.attributes.position, c = g.attributes.color;
    seeds.forEach((s, i) => {
      const z = -((s.z + travel) % 80);
      const squeeze = 1 - (-z / 80) * 0.92, len = 0.6 + speed * 0.05;
      const x = Math.cos(s.a + t * 0.5) * s.r * squeeze, y = Math.sin(s.a + t * 0.5) * s.r * squeeze;
      a.setXYZ(i * 2, x, y, z); a.setXYZ(i * 2 + 1, x * 1.02, y * 1.02, z + len);
      const heat = -z / 80, b = 0.4 + heat;
      c.setXYZ(i * 2, b, b * lerp(0.9, 0.5, heat), b * lerp(1, 0.3, heat)); c.setXYZ(i * 2 + 1, 0, 0, 0);
    });
    a.needsUpdate = c.needsUpdate = true;
    core.scale.setScalar(1 + t * 3 + 0.2 * Math.sin(t * 40));
    camera.position.set(0.3 * Math.sin(t * 2), 0.3 * Math.cos(t * 1.7), 0); camera.lookAt(0, 0, -80);
  };
  return finish(scene, camera, update, { strength: 1.2, threshold: 0.2, radius: 0.8 });
}

// Hawking radiation: particle pairs at the horizon, one falls in, one escapes; the hole shrinks
function hawking(p) {
  const scene = baseScene('#000000'); const camera = cam(34);
  starfield(scene, 4000);
  const bh = blackHole(scene, { disk: false });
  const rim = new THREE.Mesh(new THREE.SphereGeometry(1.02, 96, 64), new THREE.MeshBasicMaterial({ color: '#3a6dff', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false }));
  scene.add(rim);
  const pairs = 140, geoOut = new THREE.SphereGeometry(0.022, 12, 8);
  const pring = new THREE.Mesh(new THREE.RingGeometry(1.45, 1.52, 192), new THREE.MeshBasicMaterial({ color: '#ffcf8a', transparent: true, opacity: 0.8, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(pring);
  const outM = new THREE.MeshBasicMaterial({ color: '#8fd8ff' }), inM = new THREE.MeshBasicMaterial({ color: '#ff8a5a' });
  const ps = [];
  for (let i = 0; i < pairs; i++) {
    const u = rnd(i) * 2 - 1, a = rnd(i + 0.2) * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const n = new THREE.Vector3(Math.cos(a) * s, u, Math.sin(a) * s);
    const o = new THREE.Mesh(geoOut, outM), q = new THREE.Mesh(geoOut, inM); scene.add(o, q);
    ps.push({ n, o, q, t0: rnd(i + 0.7), life: 0.25 + rnd(i + 0.9) * 0.2 });
  }
  const update = (t) => {
    const R = lerp(1, P(p, 'shrink', 1), ease(t));
    bh.group.scale.setScalar(R); rim.scale.setScalar(R); pring.scale.setScalar(R); pring.lookAt(camera.position);
    for (const q of ps) {
      const age = ((t * 1.6 - q.t0) % 1 + 1) % 1 / q.life;
      const on = age < 1;
      q.o.visible = q.q.visible = on;
      if (!on) continue;
      q.o.position.copy(q.n).multiplyScalar(R * (1.02 + age * 2.5));
      q.q.position.copy(q.n).multiplyScalar(R * Math.max(0.9, 1.02 - age * 0.2));
      q.q.visible = age < 0.5;
    }
    orbit(camera, p, t, { dist0: 9, dist1: 7, el0: 0.3, el1: 0.2, az0: 0, az1: 0.5 });
  };
  return finish(scene, camera, update, { strength: 0.9, threshold: 0.3 });
}

// S-stars on Keplerian ellipses around Sgr A*, with fading trails
function star_orbits(p) {
  const scene = baseScene('#000000'); const camera = cam(36);
  starfield(scene, 5000);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), new THREE.MeshBasicMaterial({ color: '#000' })); scene.add(core);
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.4, 64), new THREE.MeshBasicMaterial({ color: '#ff9a40', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
  scene.add(halo);
  const orbits = [[5, 0.88, 0.3, 0.2, '#fff2c0', 1], [7, 0.6, 1.4, -0.4, '#bfe0ff', 0.55], [4, 0.75, 2.4, 0.6, '#ffd0a0', 1.4], [8.5, 0.4, 3.6, 0.3, '#e0e8ff', 0.4], [6, 0.8, 5.0, -0.7, '#fff', 0.8]];
  const bodies = orbits.map(([a, e, w, inc, color, rate]) => {
    const g = new THREE.Group(); g.rotation.set(inc, w, 0); scene.add(g);
    const pts = []; for (let i = 0; i <= 256; i++) { const E = (i / 256) * Math.PI * 2; pts.push(new THREE.Vector3(a * (Math.cos(E) - e), 0, a * Math.sqrt(1 - e * e) * Math.sin(E))); }
    const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.3 })); g.add(path);
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), new THREE.MeshBasicMaterial({ color })); g.add(star);
    return { a, e, rate, star };
  });
  const update = (t) => {
    for (const b of bodies) {
      const M = t * Math.PI * 2 * b.rate + 1.0; let E = M;
      for (let i = 0; i < 8; i++) E = M + b.e * Math.sin(E); // Kepler's equation
      b.star.position.set(b.a * (Math.cos(E) - b.e), 0, b.a * Math.sqrt(1 - b.e * b.e) * Math.sin(E));
    }
    halo.lookAt(camera.position);
    orbit(camera, p, t, { dist0: 22, dist1: 17, el0: 0.9, el1: 0.7, az0: 0, az1: 0.4 });
  };
  return finish(scene, camera, update, { strength: 1.0, threshold: 0.3 });
}

// Two black holes spiralling together above a rippling space-time grid
function merger(p) {
  const scene = baseScene('#02040c', 0.01); const camera = cam(38);
  starfield(scene, 4000);
  const A = blackHole(scene, { gain: 0.7, size: 0.45 }), B = blackHole(scene, { gain: 0.7, size: 0.38 });
  const N = 110, S = 50, lines = [];
  const mat = new THREE.LineBasicMaterial({ color: '#4fc3ff', transparent: true, opacity: 0.75 });
  for (let dir = 0; dir < 2; dir++) for (let i = 0; i <= N; i += 2) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 3), 3));
    const l = new THREE.Line(g, mat); l.userData = { dir, i }; scene.add(l); lines.push(l);
  }
  const flash = new THREE.PointLight('#ffffff', 0, 60, 1); scene.add(flash);
  const update = (t) => {
    const tm = 0.72, pre = Math.min(t, tm) / tm;
    const sep = lerp(5, 0.5, pre ** 2), phase = 2 * Math.PI * (2 + 10 * pre ** 3);
    const merged = t > tm;
    A.group.position.set(Math.cos(phase) * sep * 0.45, 3, Math.sin(phase) * sep * 0.45);
    B.group.position.set(-Math.cos(phase) * sep * 0.55, 3, -Math.sin(phase) * sep * 0.55);
    B.group.visible = !merged;
    if (merged) { A.group.position.set(0, 3, 0); A.group.scale.setScalar(lerp(0.45, 0.62, seg(t, tm, tm + 0.05))); }
    A.update(t, camera, 3); B.update(t, camera, 3);
    const amp = merged ? 1.2 * Math.exp(-(t - tm) * 6) : 0.15 + 1.0 * pre ** 4;
    for (const l of lines) {
      const a = l.geometry.attributes.position, { dir, i } = l.userData;
      for (let j = 0; j <= N; j++) {
        const u = -S / 2 + (j / N) * S, v = -S / 2 + (i / N) * S;
        const x = dir ? u : v, z = dir ? v : u, r = Math.hypot(x, z), th = Math.atan2(z, x);
        const wave = amp * Math.sin(2 * (th - phase) + r * 0.9 - t * 40) / (1 + r * 0.15);
        a.setXYZ(j, x, -2.5 / (1 + r * r * 0.08) + wave, z);
      }
      a.needsUpdate = true;
    }
    flash.position.set(0, 3, 0); flash.intensity = merged ? 400 * Math.exp(-(t - tm) * 12) : 0;
    orbit(camera, p, t, { dist0: 28, dist1: 22, el0: 0.45, el1: 0.38, az0: 0, az1: 0.5, ty0: 1, ty1: 1 });
  };
  return finish(scene, camera, update, { strength: 0.9, threshold: 0.35 });
}

// Looking up while falling in: the outside sky shrinks to a bright circle
function falling_view(p) {
  const scene = baseScene('#000000'); const camera = cam(70);
  starfield(scene, 9000, 120);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 12, 256), new THREE.MeshBasicMaterial({ color: '#cfe4ff', transparent: true, blending: THREE.AdditiveBlending }));
  ring.rotation.x = Math.PI / 2; scene.add(ring);
  let shell = null;
  const update = (t) => {
    const cap = lerp(1.25, 0.18, ease(t)); // half-angle of the visible sky, radians
    if (shell) { scene.remove(shell); shell.geometry.dispose(); }
    shell = new THREE.Mesh(new THREE.SphereGeometry(60, 128, 64, 0, Math.PI * 2, cap, Math.PI - cap), new THREE.MeshBasicMaterial({ color: '#000', side: THREE.BackSide }));
    scene.add(shell);
    ring.position.y = Math.cos(cap) * 59.5; ring.scale.setScalar(Math.sin(cap) * 59.5);
    ring.material.opacity = 0.6 + 0.3 * Math.sin(t * 12);
    camera.position.set(0, 0, 0); camera.up.set(0, 0, -1); camera.lookAt(0, 1, 0);
    camera.rotation.z += t * 0.3;
  };
  return finish(scene, camera, update, { strength: 1.0, threshold: 0.3 });
}

// Catenoid wormhole: two funnels joined by a throat
function wormhole(p) {
  const scene = baseScene('#02040c', 0.012); const camera = cam(38);
  starfield(scene, 5000);
  const mat = new THREE.LineBasicMaterial({ color: '#a98bff', transparent: true, opacity: 0.8 });
  const r0 = 1.6, H = 7;
  for (let i = 0; i < 48; i++) { // meridians
    const a = (i / 48) * Math.PI * 2, pts = [];
    for (let j = 0; j <= 120; j++) { const y = -H + (j / 120) * 2 * H; const r = r0 * Math.cosh(y / (r0 * 1.6)); pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)); }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  const rings = [];
  for (let j = 0; j <= 28; j++) { // parallels
    const y = -H + (j / 28) * 2 * H, r = r0 * Math.cosh(y / (r0 * 1.6)), pts = [];
    for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)); }
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat); scene.add(l); rings.push(l);
  }
  const traveller = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffe08a' })); scene.add(traveller);
  const tl = new THREE.PointLight('#ffd27a', 20, 6, 1.5); scene.add(tl);
  const update = (t) => {
    const y = lerp(H * 0.9, -H * 0.9, ease(t));
    const r = r0 * Math.cosh(y / (r0 * 1.6)) * 0.55;
    traveller.position.set(Math.cos(t * 6) * r, y, Math.sin(t * 6) * r); tl.position.copy(traveller.position);
    orbit(camera, p, t, { dist0: 26, dist1: 22, el0: 0.25, el1: 0.15, az0: 0, az1: 0.6 });
  };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.35 });
}

run({ bh_hero, star_collapse, grid_well, earth_squeeze, galaxy, size_compare, eht_image, ship_travel, astronaut_bh, light_paths, tidal_star, clocks, inside, hawking, star_orbits, merger, falling_view, wormhole });
