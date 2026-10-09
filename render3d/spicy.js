// "What happens when you eat a hot pepper?" — a chili sliced open with capsaicin glowing in the
// pith, capsaicin landing on the tongue, a TRPV1 heat sensor opening in a cell membrane, the brain
// reading "fire", a thermometer that never moves, and why water fails but milk works.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, headSection, flow, label,
  path3, wet, glowMat, displace, flesh, C,
} from './lib_body.js';
import { organicTube, renderer } from './lib3d.js';
import { run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

renderer.localClippingEnabled = true;
const capsM = () => glowMat('#ff8a1a', 1.1);

// Chili pepper along +x (stem at x<0). clip: a plane that slices it open lengthwise
function chili({ clip = null } = {}) {
  const g = new THREE.Group();
  const curve = path3([[-2.6, 0.2, 0], [-1.2, 0.05, 0], [0.6, -0.25, 0], [2.0, -0.8, 0], [2.9, -1.6, 0]]);
  const rf = (u, a) => (u < 0.06 ? Math.sqrt(u / 0.06) : 1) * (1 - u ** 1.6 * 0.94) * (1 + 0.05 * Math.sin(a * Math.PI * 6));
  const planes = clip ? [clip] : [];
  const skin = new THREE.Mesh(organicTube(curve, 0.62, 200, 64, rf, false), new THREE.MeshPhysicalMaterial({ color: '#c3121a', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.3, sheenColor: new THREE.Color('#ff6a5a'), side: THREE.DoubleSide, clippingPlanes: planes }));
  skin.castShadow = true; g.add(skin);
  if (clip) {
    // inner flesh wall + white pith ridge loaded with glowing capsaicin + seeds
    const inner = new THREE.Mesh(organicTube(curve, 0.54, 200, 64, rf, false), new THREE.MeshPhysicalMaterial({ color: '#e8473a', roughness: 0.4, side: THREE.BackSide, clippingPlanes: planes })); g.add(inner);
    const pith = new THREE.Mesh(organicTube(path3([[-2.3, 0.15, -0.05], [-1.2, 0.0, -0.12], [0.2, -0.22, -0.15]]), 0.2, 80, 24, (u) => 1 - u * 0.6), wet('#f3ead0', { emissive: '#ff7a10', emissiveIntensity: 0.25 })); g.add(pith);
    for (let i = 0; i < 26; i++) {
      const u = rnd(i) * 0.85, q = new THREE.Vector3(lerp(-2.2, 0.3, u), lerp(0.15, -0.2, u) + (rnd(i + 0.3) - 0.5) * 0.35, -0.15 + (rnd(i + 0.6) - 0.5) * 0.15);
      const seed = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 20), wet('#f2dc9a')); seed.position.copy(q); seed.rotation.set(rnd(i) * 3, rnd(i + 1) * 3, 0); g.add(seed);
    }
  }
  const stemM = wet('#3d7a28', { clearcoat: 0.6 });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), stemM); cap.rotation.z = Math.PI / 2; cap.scale.set(0.5, 1.08, 1.08); cap.position.x = -2.6; g.add(cap);
  const stem = new THREE.Mesh(new THREE.TubeGeometry(path3([[-2.8, 0.2, 0], [-3.4, 0.35, 0], [-3.8, 0.8, 0]]), 20, 0.1, 12), stemM); g.add(stem);
  return g;
}

// 1 — the pepper. params: open (sliced, capsaicin glowing), spin
function pepper(p) {
  const { scene, camera } = setup({ top: '#1a0c0a' });
  const open = P(p, 'open', 0);
  const clip = open ? new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.0) : null;
  const ch = chili({ clip }); scene.add(ch);
  const drops = open ? flow(path3([[-2.2, 0.3, 0.1], [-1.0, 0.1, 0.4], [0.3, -0.1, 0.2]]), 70, { r: 0.04, mat: capsM(), spread: 0.35 }) : null;
  if (drops) scene.add(drops);
  studio(scene, { target: [0, -0.3, 0], keyI: 14, keyPos: [-4, 8, 9], rim: '#ffb050' });
  const glow = new THREE.PointLight('#ff8a1a', open ? 6 : 0, 5, 1.5); glow.position.set(-1, 0.2, 1); scene.add(glow);
  const update = (t) => {
    ch.rotation.set(open ? 0.35 : 0.2, open ? -0.25 + t * 0.2 : t * 1.2, 0.15);
    ch.position.y = 0.1 * Math.sin(t * 3);
    if (drops) drops.userData.update(t, { speed: 0.15 });
    orbit(camera, p, t, { az0: 0.2, az1: -0.1, el0: 0.25, el1: 0.15, dist0: open ? 14 : 19, dist1: open ? 11 : 16, ty0: -0.2, ty1: -0.3 });
  };
  return done(scene, camera, update);
}

// 2 — tongue surface: papillae bumps; capsaicin drops land and soak in. params: land0/land1
function tongue(p) {
  const { scene, camera } = setup({ top: '#2a0c10' });
  const geo = new THREE.PlaneGeometry(22, 22, 300, 300); geo.rotateX(-Math.PI / 2);
  displace(geo, () => 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const cell = Math.abs(Math.sin(x * 4.2 + 0.6 * n3(x, z, 0)) * Math.sin(z * 4.2 + 0.6 * n3(z, x, 1)));
    pos.setY(i, 0.12 * cell ** 3 + 0.25 * n3(x * 0.3, z * 0.3, 2) - 0.02 * (x * x + z * z) * 0.05);
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, flesh('#d65d6a', 6, { clearcoat: 1, clearcoatRoughness: 0.06 })); m.receiveShadow = true; scene.add(m);
  const n = 90, dropM = capsM();
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 16, 12), dropM, n); drops.frustumCulled = false; scene.add(drops);
  const d = new THREE.Object3D();
  studio(scene, { target: [0, 0, 0], keyI: 12, keyPos: [-5, 8, 6], rim: '#ff9a7a' });
  const heat = new THREE.PointLight('#ff4a10', 0, 10, 1.4); heat.position.set(0, 1.2, 0); scene.add(heat);
  const update = (t) => {
    const land = lerp(P(p, 'land0', 0), P(p, 'land1', 1), t);
    for (let i = 0; i < n; i++) {
      const k = clamp01(land * 1.5 - rnd(i) * 0.5), x = (rnd(i + 0.2) - 0.5) * 9, z = (rnd(i + 0.4) - 0.5) * 9;
      d.position.set(x, lerp(5, 0.08, k * k), z); d.scale.setScalar(k >= 1 ? 1.3 : 1); d.updateMatrix(); drops.setMatrixAt(i, d.matrix);
    }
    drops.instanceMatrix.needsUpdate = true;
    heat.intensity = land * 14;
    orbit(camera, p, t, { az0: 0.4, az1: 0.25, el0: 0.45, el1: 0.38, dist0: 15, dist1: 12 });
  };
  return done(scene, camera, update);
}

// 3 — TRPV1 in the cell membrane: capsaicin docks, the channel opens, ions pour in.
// params: dock (0..1 when it docks), open0/open1, heat (red glow)
function receptor(p) {
  const { scene, camera } = setup({ top: '#120c1a' });
  // lipid bilayer: two sheets of head beads with tails
  const headG = new THREE.SphereGeometry(0.16, 12, 10), headM = wet('#7fb8e8', { clearcoat: 0.6 });
  const N = 26, heads = new THREE.InstancedMesh(headG, headM, N * N * 2); scene.add(heads);
  const d = new THREE.Object3D(); let k = 0;
  for (const y of [0.9, -0.9]) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = (i - N / 2) * 0.36 + (j % 2) * 0.18, z = (j - N / 2) * 0.32;
    if (x * x + z * z < 1.6) { d.scale.setScalar(0); } else d.scale.setScalar(1);
    d.position.set(x, y + 0.05 * n3(x, z, y), z); d.updateMatrix(); heads.setMatrixAt(k++, d.matrix);
  }
  const tails = new THREE.Mesh(new THREE.BoxGeometry(N * 0.36, 1.5, N * 0.32), new THREE.MeshPhysicalMaterial({ color: '#e8d8a0', roughness: 0.6, transparent: true, opacity: 0.35 })); scene.add(tails);
  // channel: four subunits around a pore
  const subs = Array.from({ length: 4 }, (_, i) => {
    const g = new THREE.Group(); const a = (i / 4) * Math.PI * 2; g.userData.a = a; scene.add(g);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 2.4, 8, 24), wet('#a05ae0', { emissive: '#3a1a6a', emissiveIntensity: 0.3 }));
    g.add(body); return g;
  });
  const capsule = new THREE.Group(); scene.add(capsule);
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), capsM()); s.position.set(i * 0.2 - 0.6, 0.08 * Math.sin(i * 2), 0); capsule.add(s); }
  const ions = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 12, 8), glowMat('#ffd84a', 1.2), 60); ions.frustumCulled = false; scene.add(ions);
  studio(scene, { target: [0, 0, 0], keyI: 14, keyPos: [-5, 8, 8], rim: '#ff6a4a' });
  const hot = new THREE.PointLight('#ff3010', 0, 12, 1.4); hot.position.set(0, -2, 2); scene.add(hot);
  const update = (t) => {
    const dock = seg(t, P(p, 'dock', -1), P(p, 'dock', -1) + 0.25);
    const open = Math.max(lerp(P(p, 'open0', 0), P(p, 'open1', 0), ease(t)), dock);
    subs.forEach((g) => { const a = g.userData.a, r = 0.62 + open * 0.35; g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); g.rotation.set(Math.sin(a) * open * 0.25, 0, -Math.cos(a) * open * 0.25); });
    capsule.position.set(lerp(-4, 1.05, ease(dock)), lerp(3, 1.4, ease(dock)), 0.4); capsule.rotation.z = -0.4;
    capsule.visible = P(p, 'dock', -1) > -1 || open > 0;
    for (let i = 0; i < 60; i++) {
      const u = ((rnd(i) + t * 1.2) % 1), on = open > 0.3;
      d.position.set((rnd(i + 0.3) - 0.5) * 0.5 * (1 - u) + (rnd(i + 0.5) - 0.5) * 3 * u * u, lerp(3, -3.5, u), (rnd(i + 0.7) - 0.5) * 0.5 * (1 - u)); d.scale.setScalar(on ? 1 : 0); d.updateMatrix(); ions.setMatrixAt(i, d.matrix);
    }
    ions.instanceMatrix.needsUpdate = true;
    hot.intensity = P(p, 'heat', 0) * open * (14 + 6 * Math.sin(t * 30));
    orbit(camera, p, t, { az0: 0.5, az1: 0.25, el0: 0.35, el1: 0.25, dist0: 18, dist1: 15 });
  };
  return done(scene, camera, update);
}

// 4 — the brain thinks the mouth is on fire: flames from the mouth in the head cutaway. params: burn0/burn1
function fire(p) {
  const { scene, camera } = setup();
  const h = headSection({ airway: true }); scene.add(h.group);
  const br = h.parts.brain; br.material = br.material.clone(); br.material.emissive = new THREE.Color('#ff2a10');
  const tg = h.parts.tongue; tg.material = tg.material.clone(); tg.material.emissive = new THREE.Color('#ff3a10');
  const n = 160, flameM = new THREE.MeshBasicMaterial({ color: '#ffb030', transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 12, 8), flameM, n); fl.frustumCulled = false; scene.add(fl);
  const d = new THREE.Object3D();
  studio(scene, { target: [0.5, -1, 0], keyI: 14 });
  const glow = new THREE.PointLight('#ff6a10', 0, 12, 1.3); glow.position.set(4.5, -1.2, 2); scene.add(glow);
  const update = (t) => {
    const b = lerp(P(p, 'burn0', 0.3), P(p, 'burn1', 1), ease(t));
    for (let i = 0; i < n; i++) {
      const u = ((rnd(i) + t * 1.8) % 1), x = 4.3 + (rnd(i + 0.2) - 0.3) * 1.2 + u * 1.2 + 0.3 * Math.sin(u * 9 + i);
      d.position.set(x, -1.4 + u * 4.5 * b, 0.6 + (rnd(i + 0.4) - 0.5) * 1.2); d.scale.setScalar(b * (1 - u) * (0.6 + rnd(i + 0.6))); d.updateMatrix(); fl.setMatrixAt(i, d.matrix);
    }
    fl.instanceMatrix.needsUpdate = true;
    flameM.color.setHSL(0.08 - 0.03 * Math.sin(t * 20), 1, 0.55);
    br.material.emissiveIntensity = b * (0.55 + 0.2 * Math.sin(t * 25)); tg.material.emissiveIntensity = b * 0.8;
    glow.intensity = b * 25;
    orbit(camera, p, t, { az0: 0.32, az1: 0.26, el0: 0.06, el1: 0.03, dist0: 44, dist1: 40, ty0: -0.6, ty1: -0.4, tx0: 1.2, tx1: 1.3 });
  };
  return done(scene, camera, update);
}

// 5 — thermometer stuck at 37 °C while the mouth "burns". params: none
function thermo(p) {
  const { scene, camera } = setup({ top: '#10141a' });
  const glass = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 7, 12, 48), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.03, transmission: 1, thickness: 0.3, ior: 1.4, clearcoat: 1, transparent: true }));
  scene.add(glass);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 32), glowMat('#e0201a', 0.4)); bulb.position.y = -3.9; scene.add(bulb);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1, 24), glowMat('#e0201a', 0.4)); scene.add(col);
  for (let i = 0; i <= 10; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(i % 5 ? 0.25 : 0.45, 0.04, 0.04), new THREE.MeshBasicMaterial({ color: '#dddddd' })); tk.position.set(-0.6, -2.8 + i * 0.6, 0.2); scene.add(tk); }
  const l = label('37°C  NORMAL', { color: '#4dff9a', size: 0.55 }); scene.add(l);
  studio(scene, { target: [0, 0, 0], keyI: 12, keyPos: [-4, 6, 10], rim: '#7fc8ff' });
  const update = (t) => {
    const level = 3.0 + 0.03 * Math.sin(t * 30);
    col.scale.y = level; col.position.y = -3.6 + level / 2;
    l.userData.place(new THREE.Vector3(0, 4.05, 0.3), new THREE.Vector3(0, 4.7, 0.5), seg(t, 0.15, 0.3));
    scene.rotation.y = 0.2 * Math.sin(t * 2);
    orbit(camera, p, t, { az0: 0.2, az1: 0.05, el0: 0.1, el1: 0.05, dist0: 22, dist1: 19, ty0: 0.2, ty1: 0.2, tx0: 0, tx1: 0 });
  };
  return done(scene, camera, update);
}

// 6 — a glass of water (capsaicin oil floats untouched) or milk (casein grabs it). params: liquid, grab0/grab1
function glass(p) {
  const { scene, camera } = setup({ top: '#10121a' });
  const milk = P(p, 'liquid', 'water') === 'milk';
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 1.8, 6, 96, 1, true), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, transmission: 1, thickness: 0.15, ior: 1.5, clearcoat: 1, side: THREE.DoubleSide, transparent: true }));
  scene.add(cup);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 1.75, 4.6, 96), milk
    ? new THREE.MeshPhysicalMaterial({ color: '#fbf8f0', roughness: 0.4, sheen: 0.5, sheenColor: new THREE.Color('#ffffff'), transparent: true, opacity: 0.72, depthWrite: false })
    : new THREE.MeshPhysicalMaterial({ color: '#bfe6ff', roughness: 0.05, transmission: 0.9, thickness: 3, ior: 1.33, transparent: true, opacity: 0.6, depthWrite: false }));
  liquid.position.y = -0.65; scene.add(liquid);
  const n = 40, drops = Array.from({ length: n }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12 + rnd(i) * 0.08, 16, 12), capsM()); scene.add(m); return m; });
  const casein = milk ? Array.from({ length: 70 }, (_, i) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 2), wet('#ffffff', { roughness: 0.5, clearcoat: 0.2 })); scene.add(m); return m; }) : [];
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.25, 96), cup.material); base.position.y = -3; scene.add(base);
  studio(scene, { target: [0, -0.5, 0], keyI: 12, keyPos: [-5, 7, 9], rim: milk ? '#ffe0b0' : '#7fc8ff' });
  const update = (t) => {
    const grab = lerp(P(p, 'grab0', 0), P(p, 'grab1', 1), ease(t));
    drops.forEach((m, i) => {
      const a = rnd(i) * Math.PI * 2, r = rnd(i + 0.3) * 1.6;
      // water: oil drops bob together on top. milk: drops sink into the liquid, wrapped by casein
      const top = new THREE.Vector3(Math.cos(a + t * 0.4) * r, 1.6 + 0.05 * Math.sin(t * 6 + i), Math.sin(a + t * 0.4) * r);
      const deep = new THREE.Vector3(Math.cos(a) * r * 0.8, -2.4 + rnd(i + 0.6) * 3.2, Math.sin(a) * r * 0.8);
      m.position.copy(milk ? top.lerp(deep, ease(clamp01(grab * 1.4 - rnd(i + 0.9) * 0.4))) : top);
    });
    casein.forEach((c, i) => {
      const dp = drops[i % n].position, a = rnd(i + 0.1) * Math.PI * 2, e = rnd(i + 0.2) * Math.PI;
      const home = new THREE.Vector3((rnd(i + 0.3) - 0.5) * 3, -2.6 + rnd(i + 0.5) * 3.8, (rnd(i + 0.7) - 0.5) * 3);
      const hug = dp.clone().add(new THREE.Vector3(Math.cos(a) * Math.sin(e), Math.cos(e), Math.sin(a) * Math.sin(e)).multiplyScalar(0.24));
      c.position.copy(home.lerp(hug, ease(clamp01(grab * 1.3))));
    });
    orbit(camera, p, t, { az0: 0.3, az1: 0.1, el0: 0.3, el1: 0.22, dist0: 24, dist1: 20, ty0: -0.4, ty1: -0.3 });
  };
  return done(scene, camera, update);
}

run({ pepper, tongue, receptor, fire, thermo, glass });
