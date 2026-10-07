// Scenes for "The Secret Technology Behind Nuclear Fusion" (16:9 long-form).
import {
  THREE, RoundedBoxGeometry, n3, ease, lerp, displace, baseScene, cam, seg, P, rnd, orbit, finish,
  motes, holoPanel, txt, humanoid, standPose, dataStream, keyLights, starfield,
} from './lib_sci.js';
import { run } from './lib3d.js';

const CYAN = '#57d8ff', RED = '#ff4b5c', GREEN = '#4dff9a', AMBER = '#ffb347', PLASMA = '#ff6ad5';

// ---------- shaders ----------
const noiseGLSL = `
float hash(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; } return v; }`;
function sunMaterial(gain = 1.0) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uGain: { value: gain } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normal; vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: `uniform float uTime, uGain; varying vec3 vN; varying vec3 vV; ${noiseGLSL}
      void main(){ float n = fbm(vN * 4.0 + vec3(uTime * 0.3)); float g = fbm(vN * 14.0 - uTime * 0.5);
        vec3 c = mix(vec3(0.9, 0.25, 0.02), vec3(1.0, 0.85, 0.45), n * 0.8 + g * 0.4);
        float limb = pow(max(dot(normalize(vN), vec3(0.0, 0.0, 1.0)), 0.0), 0.25);
        gl_FragColor = vec4(c * (0.6 + 0.6 * n) * uGain, 1.0); }`,
  });
}
// Plasma ring material: glowing pink-violet with flowing filaments
function plasmaMaterial(opacity = 0.85) {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOpacity: { value: opacity } },
    vertexShader: 'varying vec3 vP; varying vec3 vN; varying vec3 vV; void main(){ vP = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: `uniform float uTime, uOpacity; varying vec3 vP; varying vec3 vN; varying vec3 vV; ${noiseGLSL}
      void main(){ float a = atan(vP.z, vP.x); float n = fbm(vec3(a * 6.0 + uTime * 3.0, vP.y * 3.0, length(vP.xz) * 2.0));
        float rim = pow(1.0 - abs(dot(vN, vV)), 1.5);
        vec3 c = mix(vec3(0.85, 0.25, 0.95), vec3(1.0, 0.75, 1.0), n);
        gl_FragColor = vec4(c * (0.12 + rim * 0.65 + n * 0.25) * uOpacity, 1.0); }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
}

// ---------- props ----------
// Nucleus: cluster of protons (red) and neutrons (grey)
function nucleus(protons, neutrons, r = 0.32) {
  const g = new THREE.Group();
  const pm = new THREE.MeshPhysicalMaterial({ color: '#ff4b4b', roughness: 0.3, clearcoat: 1, emissive: '#5a0a0a', emissiveIntensity: 0.4 });
  const nm = new THREE.MeshPhysicalMaterial({ color: '#c8ccd4', roughness: 0.3, clearcoat: 1 });
  const n = protons + neutrons;
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), i < protons ? pm : nm);
    if (n > 1) { const a = i / n * Math.PI * 2, y = (i % 2 ? 0.5 : -0.5) * r; m.position.set(Math.cos(a) * r * 0.9, y, Math.sin(a) * r * 0.9); }
    g.add(m);
  }
  return g;
}

// Tokamak: vacuum vessel (cut away), D-shaped toroidal coils, central solenoid, plasma ring
function tokamakMesh({ cut = true, R = 4, a = 1.4, coils = 18 } = {}) {
  const g = new THREE.Group();
  const vessel = new THREE.Mesh(new THREE.TorusGeometry(R, a * 1.25, 48, 128, cut ? Math.PI * 1.45 : Math.PI * 2),
    new THREE.MeshPhysicalMaterial({ color: '#6a7078', metalness: 0.8, roughness: 0.4, side: THREE.DoubleSide, envMapIntensity: 0.22 }));
  vessel.rotation.x = Math.PI / 2; if (cut) vessel.rotation.z = Math.PI * 0.4; g.add(vessel);
  const coilM = new THREE.MeshPhysicalMaterial({ color: '#c87533', metalness: 0.9, roughness: 0.3, envMapIntensity: 0.5 });
  const D = new THREE.Shape(); D.absellipse(0, 0, a * 1.9, a * 2.4, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absellipse(0, 0, a * 1.6, a * 2.1, 0, Math.PI * 2, true); D.holes.push(hole);
  const dg = new THREE.ExtrudeGeometry(D, { depth: 0.35, bevelEnabled: false, curveSegments: 48 }); dg.translate(0, 0, -0.175);
  for (let i = 0; i < coils; i++) {
    const ang = i / coils * Math.PI * 2;
    if (cut && ang > Math.PI * 0.4 && ang < Math.PI * 0.95) continue;
    const c = new THREE.Mesh(dg, coilM); c.position.set(Math.cos(ang) * R, 0, Math.sin(ang) * R); c.rotation.y = -ang; g.add(c);
  }
  const sol = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.32, R * 0.32, a * 5, 48), new THREE.MeshPhysicalMaterial({ color: '#5a6470', metalness: 0.8, roughness: 0.3 })); g.add(sol);
  const plasma = new THREE.Mesh(new THREE.TorusGeometry(R, a * 0.85, 48, 160), plasmaMaterial()); plasma.rotation.x = Math.PI / 2; plasma.scale.z = 1.3; g.add(plasma);
  g.userData.plasma = plasma;
  return g;
}

function finishBright(scene, camera, update, threshold = 0.6) { return finish(scene, camera, update, { strength: 0.9, threshold, radius: 0.6 }); }

// ---------- scenes ----------
function sun(p) {
  const scene = baseScene('#000000'); const camera = cam(32);
  starfield(scene, 3000);
  const s = new THREE.Mesh(new THREE.SphereGeometry(3, 128, 96), sunMaterial(1.0)); scene.add(s);
  const corona = new THREE.Mesh(new THREE.SphereGeometry(3.4, 64, 48), new THREE.ShaderMaterial({
    uniforms: {}, vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float r = pow(1.0 - abs(dot(vN, vV)), 3.0); gl_FragColor = vec4(vec3(1.0, 0.55, 0.15) * r * 1.4, 1.0); }',
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
  })); scene.add(corona);
  const loops = [];
  for (let i = 0; i < 6; i++) {
    const a = rnd(i) * Math.PI * 2, b = (rnd(i + 0.5) - 0.5) * 2, base = new THREE.Vector3(Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)).multiplyScalar(3);
    const side = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(0.8);
    const c = new THREE.CatmullRomCurve3([base.clone().sub(side), base.clone().multiplyScalar(1.25), base.clone().add(side)]);
    const m = new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.06, 8), new THREE.MeshBasicMaterial({ color: '#ff8a3a', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })); scene.add(m); loops.push(m);
  }
  const update = (t) => { s.material.uniforms.uTime.value = t * 3; s.rotation.y = t * 0.2; orbit(camera, p, t, { dist0: 14, dist1: 10, el0: 0.1, el1: 0.05, az0: -0.2, az1: 0.2 }); };
  return finishBright(scene, camera, update, 0.7);
}

// Sun cut-away with fusing particles at the core
function sun_core(p) {
  const scene = baseScene('#000000'); const camera = cam(36);
  starfield(scene, 3000);
  const s = new THREE.Mesh(new THREE.SphereGeometry(4, 128, 96, 0, Math.PI * 1.5), sunMaterial(0.8)); s.material.side = THREE.DoubleSide; scene.add(s);
  const core = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 48), new THREE.MeshBasicMaterial({ color: '#fff2c0' })); scene.add(core);
  const N = 500, pos = new Float32Array(N * 3); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size: 3, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending }));
  scene.add(pts);
  const update = (t) => {
    s.material.uniforms.uTime.value = t * 3; s.rotation.y = Math.PI + t * 0.2;
    for (let i = 0; i < N; i++) { const u = rnd(i) * 2 - 1, a = rnd(i + 0.5) * 6.28 + t * (1 + rnd(i)), s2 = Math.sqrt(1 - u * u), r = 1.4 * Math.cbrt(rnd(i + 0.9)); pos.set([Math.cos(a) * s2 * r, u * r, Math.sin(a) * s2 * r], i * 3); }
    g.attributes.position.needsUpdate = true; core.scale.setScalar(1 + 0.05 * Math.sin(t * 30));
    orbit(camera, p, t, { dist0: 16, dist1: 9, el0: 0.2, el1: 0.12, az0: 0.6, az1: 0.3 });
  };
  return finishBright(scene, camera, update, 0.7);
}

// D + T → He + n (with flash)
function fusion_reaction(p) {
  const scene = baseScene('#04030c', 0.02); const camera = cam(34);
  starfield(scene, 2000);
  const D = nucleus(1, 1), T = nucleus(1, 2), He = nucleus(2, 2), n = nucleus(0, 1);
  scene.add(D, T, He, n);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshBasicMaterial({ color: '#fff6d0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(flash);
  const light = new THREE.PointLight('#fff0c0', 0, 20, 1.5); scene.add(light);
  const labels = ['DEUTERIUM', 'TRITIUM', 'HELIUM', 'NEUTRON'].map((s, i) => { const q = holoPanel(2.6, 0.55, (ctx, t, w, h) => txt(ctx, s, w / 2, h / 2, 76, i === 3 ? AMBER : CYAN, 'center', 900), { res: 768, frame: false }); scene.add(q); return q; });
  keyLights(scene, { keyI: 1.2, hemi: 0.4 });
  const update = (t) => {
    const hit = P(p, 'hitAt', 0.45), k = ease(seg(t, 0, hit)), after = seg(t, hit, 1);
    D.visible = T.visible = t < hit; He.visible = n.visible = t >= hit;
    D.position.set(lerp(-5, -0.35, k), 0, 0); T.position.set(lerp(5, 0.4, k), 0, 0); D.rotation.y = t * 4; T.rotation.y = -t * 4;
    He.position.set(-after * 2.5, after * 0.8, 0); He.rotation.y = t * 3; n.position.set(after * 12, -after * 2, 0);
    flash.visible = t > hit && after < 0.25; flash.scale.setScalar(0.5 + after * 14); flash.material.opacity = 1 - after * 4;
    light.position.set(0, 0, 1); light.intensity = t > hit ? 200 * Math.exp(-after * 8) : 0;
    labels[0].position.set(D.position.x, -1.3, 0); labels[1].position.set(T.position.x, -1.3, 0); labels[2].position.set(He.position.x, He.position.y - 1.3, 0); labels[3].position.set(Math.min(n.position.x, 6.5), n.position.y - 1.0, 0);
    labels.forEach((q, i) => { q.visible = i < 2 ? t < hit : t > hit + 0.04; q.userData.update(t); });
    orbit(camera, p, t, { dist0: 13, dist1: 12, el0: 0.1, el1: 0.06, az0: 0, az1: 0.1 });
  };
  return finish(scene, camera, update, { strength: 1.0, threshold: 0.7 });
}

// Two protons repelling unless fast enough
function repulsion(p) {
  const scene = baseScene('#04030c', 0.02); const camera = cam(34);
  const a = nucleus(1, 0, 0.5), b = nucleus(1, 0, 0.5); scene.add(a, b);
  const field = [];
  for (let i = 0; i < 10; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.8 + i * 0.35, 0.012, 6, 64), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.35 - i * 0.03 })); scene.add(r); field.push(r); }
  const fast = !!p.fast;
  keyLights(scene, { keyI: 1.2, hemi: 0.4 });
  const flash = new THREE.PointLight('#fff0c0', 0, 20, 1.5); scene.add(flash);
  const update = (t) => {
    let x;
    if (fast) { x = lerp(5, 0.5, ease(seg(t, 0, 0.6))); }
    else { const u = seg(t, 0, 1); x = 5 - 3.6 * Math.sin(Math.min(1, u * 1.3) * Math.PI); }
    a.position.set(-x, 0, 0); b.position.set(x, 0, 0);
    field.forEach((r, i) => { r.position.set(i % 2 ? x : -x, 0, 0); r.lookAt(camera.position); r.scale.setScalar(1 + 0.05 * Math.sin(t * 20 + i)); });
    flash.intensity = fast && t > 0.6 ? 150 * Math.exp(-(t - 0.6) * 10) : 0;
    orbit(camera, p, t, { dist0: 12, dist1: 11, el0: 0.05, el1: 0.03, az0: 0, az1: 0.05 });
  };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.65 });
}

// Chaotic glowing plasma particles
function plasma_particles(p) {
  const scene = baseScene('#06020c', 0.03); const camera = cam(40);
  const N = 3000, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  for (let i = 0; i < N; i++) { const e = i % 3 === 0; col.set(e ? [0.5, 0.8, 1.2] : [1.3, 0.4, 1.1], i * 3); }
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
  const glow = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 24), new THREE.MeshBasicMaterial({ color: '#7a2a8a', transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(glow);
  const update = (t) => {
    for (let i = 0; i < N; i++) {
      const s = 4 + rnd(i) * 6;
      pos.set([Math.sin(rnd(i + 0.1) * 50 + t * s) * 5 * rnd(i + 0.2), Math.sin(rnd(i + 0.3) * 50 + t * s * 1.3) * 3 * rnd(i + 0.4), Math.cos(rnd(i + 0.5) * 50 + t * s * 0.8) * 5 * rnd(i + 0.6)], i * 3);
    }
    g.attributes.position.needsUpdate = true;
    orbit(camera, p, t, { dist0: 12, dist1: 9, el0: 0.2, el1: 0.1, az0: 0, az1: 0.6 });
  };
  return finish(scene, camera, update, { strength: 1.1, threshold: 0.3 });
}

// Tokamak exterior (cut-away); optional tiny human for scale
function tokamak(p) {
  const scene = baseScene('#04060a', 0.015); const camera = cam(36);
  const tk = tokamakMesh({ cut: P(p, 'cut', true) }); scene.add(tk);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshPhysicalMaterial({ color: '#1a2028', roughness: 0.6, metalness: 0.3 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -4.5; scene.add(floor);
  if (p.person) { const h = humanoid({ style: 'person' }); standPose(h); h.scale.setScalar(0.42); h.position.set(7.5, -4.5, 3); scene.add(h); }
  keyLights(scene, { keyI: 1.2, hemi: 0.35 });
  const pl = new THREE.PointLight(PLASMA, 60, 20, 1.5); scene.add(pl);
  const update = (t) => {
    tk.userData.plasma.material.uniforms.uTime.value = t * 4; tk.userData.plasma.material.uniforms.uOpacity.value = P(p, 'glow', 0.85);
    tk.rotation.y = t * 0.15;
    orbit(camera, p, t, { dist0: 20, dist1: 15, el0: 0.35, el1: 0.25, az0: -0.4, az1: 0.2, ty0: 0, ty1: 0 });
  };
  return finishBright(scene, camera, update, 0.6);
}

// Inside the vessel: tiled wall, glowing plasma ring
function tokamak_inside(p) {
  const scene = baseScene('#06030a', 0.04); const camera = cam(70);
  const R = 6, a = 2.2;
  const N = 64 * 18, tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.5, 0.12), new THREE.MeshPhysicalMaterial({ color: '#4a4e56', metalness: 0.7, roughness: 0.4 }), N);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1), V = new THREE.Vector3(); let k = 0;
  for (let i = 0; i < 64; i++) for (let j = 0; j < 18; j++) {
    const u = i / 64 * Math.PI * 2, v = j / 18 * Math.PI * 2;
    V.set((R + a * Math.cos(v)) * Math.cos(u), a * 1.3 * Math.sin(v), (R + a * Math.cos(v)) * Math.sin(u));
    const nrm = new THREE.Vector3(Math.cos(v) * Math.cos(u), Math.sin(v), Math.cos(v) * Math.sin(u));
    Q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm.negate()); M.compose(V, Q, S); tiles.setMatrixAt(k++, M);
  }
  scene.add(tiles);
  const plasma = new THREE.Mesh(new THREE.TorusGeometry(R, a * 0.4, 48, 200), plasmaMaterial(0.9)); plasma.rotation.x = Math.PI / 2; plasma.scale.z = 1.3; scene.add(plasma);
  const pl = new THREE.PointLight(PLASMA, 25, 30, 1.2); pl.position.set(R, 0, 0); scene.add(pl);
  scene.add(new THREE.HemisphereLight('#ff9ae0', '#100410', 0.4));
  const update = (t) => {
    plasma.material.uniforms.uTime.value = t * 6;
    const u = P(p, 'u0', 0) + t * 0.6; camera.position.set(Math.cos(u) * (R + 1.7), -0.4, Math.sin(u) * (R + 1.7));
    camera.lookAt(Math.cos(u + 0.6) * R, 0, Math.sin(u + 0.6) * R); pl.position.copy(camera.position);
  };
  return finishBright(scene, camera, update, 0.7);
}

// Twisted magnetic field lines around a torus with a particle spiralling along one
function field_lines(p) {
  const scene = baseScene('#03050c', 0.02); const camera = cam(36);
  const R = 4, a = 1.3, twist = P(p, 'twist', 3);
  const lines = [];
  for (let k = 0; k < 10; k++) {
    const pts = []; for (let i = 0; i <= 600; i++) { const u = i / 600 * Math.PI * 2, v = k / 10 * Math.PI * 2 + u * twist; pts.push(new THREE.Vector3((R + a * Math.cos(v)) * Math.cos(u), a * Math.sin(v), (R + a * Math.cos(v)) * Math.sin(u))); }
    const l = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 600, 0.025, 6, true), new THREE.MeshBasicMaterial({ color: k % 2 ? CYAN : '#a98bff', transparent: true, opacity: 0.8 }));
    scene.add(l); lines.push(l);
  }
  const ghost = new THREE.Mesh(new THREE.TorusGeometry(R, a, 32, 96), plasmaMaterial(0.25)); ghost.rotation.x = Math.PI / 2; scene.add(ghost);
  const ion = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffffff' })); scene.add(ion);
  const trail = dataStream(new THREE.CatmullRomCurve3(Array.from({ length: 200 }, (_, i) => { const u = i / 200 * Math.PI * 2, v = u * twist; return new THREE.Vector3((R + a * 0.6 * Math.cos(v)) * Math.cos(u), a * 0.6 * Math.sin(v), (R + a * 0.6 * Math.cos(v)) * Math.sin(u)); }), true), 300, '#ffe6ff', 3);
  scene.add(trail);
  const update = (t) => {
    const u = t * Math.PI * 2 * 0.8, v = u * twist; ion.position.set((R + a * 0.6 * Math.cos(v)) * Math.cos(u), a * 0.6 * Math.sin(v), (R + a * 0.6 * Math.cos(v)) * Math.sin(u));
    trail.userData.update(t, 0.4); ghost.material.uniforms.uTime.value = t * 4;
    orbit(camera, p, t, { dist0: 13, dist1: 10, el0: 0.6, el1: 0.45, az0: 0, az1: 0.5 });
  };
  return finish(scene, camera, update, { strength: 0.9, threshold: 0.35 });
}

// Stellarator: twisted plasma with wavy coils
function stellarator(p) {
  const scene = baseScene('#03050c', 0.02); const camera = cam(36);
  const R = 4, a = 1.0;
  const geo = new THREE.TorusGeometry(R, a, 64, 300), pa = geo.attributes.position;
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), u = Math.atan2(y, x), rx = Math.hypot(x, y) - R, phase = u * 2.5;
    const nx = rx * Math.cos(phase) * 1.5 - z * Math.sin(phase) * 0.7, nz = rx * Math.sin(phase) * 1.5 + z * Math.cos(phase) * 0.7;
    pa.setXYZ(i, (R + nx) * Math.cos(u), (R + nx) * Math.sin(u), nz);
  }
  geo.computeVertexNormals();
  const pl = new THREE.Mesh(geo, plasmaMaterial(0.9)); pl.rotation.x = Math.PI / 2; scene.add(pl);
  const coilM = new THREE.MeshPhysicalMaterial({ color: '#c87533', metalness: 0.9, roughness: 0.3, envMapIntensity: 0.5 });
  for (let i = 0; i < 40; i++) {
    const u0 = i / 40 * Math.PI * 2, pts = [];
    for (let j = 0; j <= 48; j++) { const v = j / 48 * Math.PI * 2, u = u0 + 0.12 * Math.sin(v * 2 + i); pts.push(new THREE.Vector3((R + 1.9 * Math.cos(v)) * Math.cos(u), 1.9 * Math.sin(v) * (1 + 0.25 * Math.sin(u * 5)), (R + 1.9 * Math.cos(v)) * Math.sin(u))); }
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 96, 0.11, 8, true), coilM));
  }
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => { pl.material.uniforms.uTime.value = t * 4; orbit(camera, p, t, { dist0: 15, dist1: 11, el0: 0.55, el1: 0.4, az0: 0, az1: 0.6 }); };
  return finishBright(scene, camera, update, 0.55);
}

// NIF: beams converge on a tiny capsule which implodes and flashes
function laser_target(p) {
  const scene = baseScene('#02030a', 0.01); const camera = cam(40);
  const chamber = new THREE.Mesh(new THREE.SphereGeometry(8, 48, 32), new THREE.MeshPhysicalMaterial({ color: '#2a3038', metalness: 0.8, roughness: 0.4, side: THREE.BackSide, wireframe: false }));
  scene.add(chamber);
  const beams = new THREE.Group(); scene.add(beams);
  for (let i = 0; i < 192; i++) {
    const u = (i % 2 ? 1 : -1) * (0.3 + 0.6 * rnd(i)), a = rnd(i + 0.5) * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const dir = new THREE.Vector3(Math.cos(a) * s, u, Math.sin(a) * s);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.06, 7.5, 6), new THREE.MeshBasicMaterial({ color: '#6f8bff', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    b.position.copy(dir.clone().multiplyScalar(3.9)); b.lookAt(0, 0, 0); b.rotateX(Math.PI / 2); beams.add(b);
  }
  const hohl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.9, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: '#ffcf4a', metalness: 1, roughness: 0.2, side: THREE.DoubleSide })); hohl.rotation.z = Math.PI / 2; scene.add(hohl);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), new THREE.MeshPhysicalMaterial({ color: '#dfe8f2', transmission: 0.6, roughness: 0.1 })); scene.add(cap);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshBasicMaterial({ color: '#fff6d0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(flash);
  const light = new THREE.PointLight('#fff0c0', 0, 30, 1.2); scene.add(light);
  keyLights(scene, { keyI: 0.6, hemi: 0.3 });
  const update = (t) => {
    const fire = seg(t, 0.15, 0.5), imp = seg(t, 0.5, 0.62), boom = seg(t, 0.62, 1);
    beams.visible = fire > 0 && fire < 1; beams.children.forEach((b) => { b.material.opacity = 0.7 * Math.sin(fire * Math.PI); });
    cap.scale.setScalar(Math.max(0.15, 1 - imp * 0.85)); cap.visible = boom === 0;
    flash.visible = boom > 0; flash.scale.setScalar(0.2 + boom * 5); flash.material.opacity = Math.max(0, 1 - boom * 1.3);
    light.intensity = boom > 0 ? 400 * Math.exp(-boom * 5) : 0; hohl.visible = boom < 0.2;
    orbit(camera, p, t, { dist0: P(p, 'close', 0) ? 3 : 7, dist1: P(p, 'close', 0) ? 2.2 : 5, el0: 0.25, el1: 0.15, az0: 0.3, az1: 0.6 });
  };
  return finish(scene, camera, update, { strength: 1.0, threshold: 0.55 });
}

// Text / number cards
function title_card(p) {
  const scene = baseScene('#03070c'); const camera = cam(36);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    ctx.globalAlpha = seg(t, 0.03, 0.4);
    if (p.big) { txt(ctx, p.big, w / 2, h * 0.4, P(p, 'bigSize', 240), P(p, 'color', AMBER), 'center', 900); txt(ctx, P(p, 'sub', ''), w / 2, h * 0.72, 54, '#d8f6ff', 'center', 800); txt(ctx, P(p, 'sub2', ''), w / 2, h * 0.84, 40, '#7fb8d0', 'center', 600); }
    else { txt(ctx, P(p, 'year', ''), w / 2, h * 0.22, 110, AMBER, 'center', 900); P(p, 'lines', [P(p, 'title', '')]).forEach((l, i) => txt(ctx, l, w / 2, h * 0.46 + i * 84, i ? 52 : 68, i ? '#d8f6ff' : '#ffffff', 'center', 900)); txt(ctx, P(p, 'sub', ''), w / 2, h * 0.86, 42, '#7fb8d0', 'center', 700); }
    ctx.globalAlpha = 1;
  }, { res: 1600 });
  scene.add(panel);
  const m = motes(scene, 300, 24, P(p, 'mote', CYAN), 0.3);
  const update = (t) => { panel.userData.update(t); m.userData.update(t); orbit(camera, p, t, { dist0: 11, dist1: 9.5, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Energy in vs out bars: 'nif' (laser energy vs yield vs wall-plug) | 'iter' (50 MW in, 500 MW out)
function energy_bars(p) {
  const scene = baseScene('#03070c'); const camera = cam(36);
  const kind = P(p, 'kind', 'nif');
  const rows = kind === 'nif' ? [['LASER LIGHT ON TARGET', 2.05, CYAN, '2.05 MJ'], ['FUSION ENERGY OUT', 3.15, GREEN, '3.15 MJ'], ['ELECTRICITY TO RUN LASERS', 300, RED, '~300 MJ']] : [['HEATING POWER IN', 50, CYAN, '50 MW'], ['FUSION POWER OUT (GOAL)', 500, GREEN, '500 MW']];
  const max = Math.max(...rows.map((r) => r[1]));
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    txt(ctx, kind === 'nif' ? 'NIF IGNITION SHOT — DEC 5, 2022' : 'ITER TARGET: Q = 10', 60, 80, 50, '#d8f6ff');
    rows.forEach(([label, v, c, s], i) => {
      const k = ease(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2)), y = 190 + i * 210, bw = Math.max(8, (w - 200) * (kind === 'nif' ? Math.log10(1 + v) / Math.log10(1 + max) : v / max)) * k;
      txt(ctx, label, 80, y, 38, '#bfe8ff', 'left', 800); ctx.fillStyle = c; ctx.fillRect(80, y + 40, bw, 90); if (k > 0.9) txt(ctx, s, 100 + bw, y + 85, 54, c, 'left', 900);
    });
    if (kind === 'nif') txt(ctx, '(bar lengths on a log scale)', w - 60, h - 40, 30, '#7fb8d0', 'right', 600);
  }, { res: 1600 });
  scene.add(panel);
  const update = (t) => { panel.userData.update(t); orbit(camera, p, t, { dist0: 10.5, dist1: 9.2, el0: 0.04, el1: 0.02, az0: 0.15, az1: -0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Superconducting coil with frost next to the hot plasma
function cold_hot(p) {
  const scene = baseScene('#03050c', 0.02); const camera = cam(36);
  const coil = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.55, 32, 96), new THREE.MeshPhysicalMaterial({ color: '#c87533', metalness: 0.9, roughness: 0.3 })); coil.position.x = -3.5; scene.add(coil);
  const frost = motes(scene, 400, 6, '#cfefff', 0.8); frost.position.x = -3.5;
  const pl = new THREE.Mesh(new THREE.SphereGeometry(1.8, 64, 48), plasmaMaterial(1)); pl.position.x = 3.5; scene.add(pl);
  const l1 = holoPanel(4, 1, (ctx, t, w, h) => txt(ctx, '−269 °C', w / 2, h / 2, 140, '#9fe0ff', 'center', 900), { res: 1024, frame: false }); l1.position.set(-3.5, -3, 0); scene.add(l1);
  const l2 = holoPanel(5, 1, (ctx, t, w, h) => txt(ctx, '150,000,000 °C', w / 2, h / 2, 130, PLASMA, 'center', 900), { res: 1280, frame: false }); l2.position.set(3.5, -3, 0); scene.add(l2);
  keyLights(scene, { key: '#cfe8ff', keyI: 1.2, hemi: 0.35 });
  const update = (t) => { coil.rotation.y = t * 0.5; pl.material.uniforms.uTime.value = t * 5; frost.userData.update(t); l1.userData.update(t); l2.userData.update(t); orbit(camera, p, t, { dist0: 15, dist1: 13, el0: 0.1, el1: 0.05, az0: -0.1, az1: 0.1, ty0: -0.5, ty1: -0.5 }); };
  return finishBright(scene, camera, update, 0.55);
}

// Neutrons hitting wall tiles (damage) or lithium blanket (breeding tritium)
function neutron_wall(p) {
  const scene = baseScene('#04030a', 0.02); const camera = cam(38);
  const mode = P(p, 'mode', 'damage');
  const N = 12 * 8, tiles = new THREE.InstancedMesh(new RoundedBoxGeometry(0.9, 0.9, 0.4, 2, 0.06), new THREE.MeshPhysicalMaterial({ color: mode === 'breed' ? '#8aa0b0' : '#4a4e56', metalness: 0.7, roughness: 0.35 }), N);
  const M = new THREE.Matrix4(), C = new THREE.Color(); let k = 0;
  for (let i = 0; i < 12; i++) for (let j = 0; j < 8; j++) { M.makeTranslation((i - 5.5) * 1, (j - 3.5) * 1, -3); tiles.setMatrixAt(k++, M); }
  scene.add(tiles);
  const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 14, 48), plasmaMaterial(0.8)); pl.rotation.z = Math.PI / 2; pl.position.z = 2; scene.add(pl);
  const neutrons = Array.from({ length: 40 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshBasicMaterial({ color: '#e8eef8' })); scene.add(m); return { m, x: (rnd(i) - 0.5) * 11, y: (rnd(i + 0.3) - 0.5) * 7, ph: rnd(i + 0.6) }; });
  const trit = Array.from({ length: 40 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: GREEN })); scene.add(m); return m; });
  keyLights(scene, { keyI: 0.9, hemi: 0.35 });
  const update = (t) => {
    neutrons.forEach((q, i) => {
      const u = ((t * 2.2 + q.ph) % 1); q.m.position.set(q.x * u, q.y * u, lerp(3, -2.8, u));
      const hit = u > 0.97, idx = Math.floor(((q.x + 5.5) / 11) * 11.99) * 8 + Math.floor(((q.y + 3.5) / 7) * 7.99);
      if (hit && idx >= 0 && idx < N) { C.set(mode === 'breed' ? GREEN : AMBER).multiplyScalar(1.5); tiles.setColorAt(idx, C); }
      trit[i].visible = mode === 'breed' && u > 0.9; trit[i].position.set(q.x, q.y, -2.5 + (u - 0.9) * 10);
    });
    if (tiles.instanceColor) { for (let i = 0; i < N; i++) { tiles.getColorAt(i, C); C.lerp(new THREE.Color('#ffffff'), 0.05); tiles.setColorAt(i, C); } tiles.instanceColor.needsUpdate = true; }
    else { for (let i = 0; i < N; i++) tiles.setColorAt(i, new THREE.Color('#ffffff')); }
    pl.material.uniforms.uTime.value = t * 5;
    orbit(camera, p, t, { dist0: 14, dist1: 11, el0: 0.1, el1: 0.05, az0: 0.6, az1: 0.35, tz0: 0, tz1: 0 });
  };
  return finishBright(scene, camera, update, 0.55);
}

// Ocean with sparkles — deuterium from seawater
function seawater(p) {
  const scene = baseScene('#7fb8e0', 0.012); const camera = cam(45);
  scene.background = new THREE.Color('#9cc8e8');
  const wg = new THREE.PlaneGeometry(200, 200, 200, 200); wg.rotateX(-Math.PI / 2);
  const base = Float32Array.from(wg.attributes.position.array);
  const water = new THREE.Mesh(wg, new THREE.MeshPhysicalMaterial({ color: '#0e4a70', roughness: 0.12, clearcoat: 1, envMapIntensity: 0.8 })); scene.add(water);
  const sparks = motes(scene, 400, 30, '#ffffff', 0.8); sparks.position.y = 0.5;
  const sun = new THREE.DirectionalLight('#fff4e0', 1.5); sun.position.set(20, 15, 30); scene.add(sun); scene.add(new THREE.HemisphereLight('#cfe8ff', '#0e2a40', 0.6));
  const update = (t) => {
    const a = wg.attributes.position;
    for (let i = 0; i < a.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; a.setY(i, 0.35 * Math.sin(x * 0.3 + t * 6) + 0.25 * Math.sin(z * 0.4 - t * 5) + 0.2 * n3(x * 0.1, z * 0.1, t)); }
    a.needsUpdate = true; wg.computeVertexNormals(); sparks.userData.update(t);
    camera.position.set(0, lerp(4, 3, t), lerp(14, 10, t)); camera.lookAt(0, 0.5, -10);
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.85 });
}

// Future fusion plant feeding a glowing city
function power_plant(p) {
  const scene = baseScene('#04060c', 0.02); const camera = cam(40);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#0b1016', roughness: 1 })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(4, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: '#8a929c', metalness: 0.3, roughness: 0.5, envMapIntensity: 0.2 })); dome.position.set(-12, 0, -4); scene.add(dome);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.15, 12, 96), new THREE.MeshBasicMaterial({ color: PLASMA })); ring.rotation.x = Math.PI / 2; ring.position.set(-12, 0.5, -4); scene.add(ring);
  const winM = new THREE.MeshBasicMaterial({ color: '#ffd58a' }), bldM = new THREE.MeshStandardMaterial({ color: '#1a2230', roughness: 0.8 });
  const city = new THREE.Group(); scene.add(city);
  const lights = [];
  for (let i = 0; i < 70; i++) {
    const h = 1 + rnd(i) ** 2 * 8, x = 4 + (i % 10) * 1.6 + (rnd(i + 0.2) - 0.5), z = -8 + Math.floor(i / 10) * 1.8;
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, h, 1.1), bldM); b.position.set(x, h / 2, z); city.add(b);
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, h * 0.85), winM.clone()); w.position.set(x, h / 2, z + 0.56); city.add(w); lights.push(w);
  }
  const line = new THREE.CatmullRomCurve3([new THREE.Vector3(-8, 3, -4), new THREE.Vector3(-3, 5, -4), new THREE.Vector3(2, 4, -4), new THREE.Vector3(6, 3, -4)]);
  const power = dataStream(line, 200, '#9fe0ff', 4); scene.add(power);
  scene.add(new THREE.HemisphereLight('#7fa0d0', '#05070c', 0.5));
  const update = (t) => {
    power.userData.update(t, 0.6);
    lights.forEach((w, i) => { const on = t > 0.2 + rnd(i) * 0.5; w.material.color.set(on ? '#ffd58a' : '#202830'); });
    orbit(camera, p, t, { dist0: 30, dist1: 24, el0: 0.3, el1: 0.22, az0: -0.2, az1: 0.2, tx0: -2, tx1: -1, ty0: 2, ty1: 2 });
  };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.5 });
}

run({ sun, sun_core, fusion_reaction, repulsion, plasma_particles, tokamak, tokamak_inside, field_lines, stellarator, laser_target, title_card, energy_bars, cold_hot, neutron_wall, seawater, power_plant });
