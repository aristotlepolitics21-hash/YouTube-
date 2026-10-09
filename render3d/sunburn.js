// "What actually happens when you get sunburned?" — UV rays diving into a skin cutaway, DNA
// kinking where two bases fuse, damaged cells self-destructing, vessels widening (red, hot skin),
// the dead top layer peeling, surviving damaged cells, and sunscreen bouncing the rays away.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, skinBlock, flow, label, path3, wet, glowMat, displace, flesh, C,
} from './lib_body.js';
import { dnaHelix } from './lib_sci.js';
import { run } from './lib3d.js';

const uvM = () => new THREE.MeshBasicMaterial({ color: '#b36bff', transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });

// 1 — skin block in the sun. params: rays (0..1 how deep they reach), red0/red1, peel0/peel1, shield, sun
function skin(p) {
  const { scene, camera } = setup({ top: '#1c1020' });
  const sb = skinBlock({ seed: 9, hairs: 30 }); scene.add(sb.group);
  const epi = sb.parts.epidermis, base = epi.material.color.clone();
  const capScale = sb.parts.capillaries.map((c) => c);
  // UV beams from the upper left, ending inside the skin at different depths
  const beamM = uvM();
  const beams = Array.from({ length: 9 }, (_, i) => {
    const x = -3 + i * 0.8, z = 3.7, end = new THREE.Vector3(x + 0.6, -0.3 - (i % 3) * 0.55, z + 0.25);
    const start = end.clone().add(new THREE.Vector3(-5, 9, 0));
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), beamM); m.userData = { start, end }; scene.add(m); return m;
  });
  const setBeam = (m, k) => { const { start, end } = m.userData, e = start.clone().lerp(end, k), len = start.distanceTo(e); m.scale.set(1, Math.max(0.001, len), 1); m.position.copy(start).add(e).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.clone().sub(start).normalize()); };
  const hits = beams.map(() => { const h = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), glowMat('#d9a0ff', 2)); scene.add(h); return h; });
  // peeling flake: a thin sheet of top skin curling up from the front corner
  const flakeG = new THREE.PlaneGeometry(4.2, 3.2, 40, 30); flakeG.rotateX(-Math.PI / 2);
  const fb = Float32Array.from(flakeG.attributes.position.array);
  const flake = new THREE.Mesh(flakeG, flesh('#f0dccb', 3, { side: THREE.DoubleSide, roughness: 0.75, clearcoat: 0.05 })); flake.position.set(1.85, 0.03, 2.35); scene.add(flake);
  // sunscreen film + bounced rays
  const film = new THREE.Mesh(new THREE.BoxGeometry(8.05, 0.12, 8.05), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.2, transparent: true, opacity: 0.45, clearcoat: 1, sheen: 1, sheenColor: new THREE.Color('#ffffff') }));
  film.position.y = 0.1; scene.add(film);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 24), new THREE.MeshBasicMaterial({ color: '#fff2b0' })); sun.position.set(-8, 12, 3); scene.add(sun);
  const heat = new THREE.PointLight('#ff3a1a', 0, 14, 1.4); heat.position.set(0, 1.5, 4); scene.add(heat);
  studio(scene, { target: [0, -1.5, 2], keyI: 14, keyPos: [-6, 10, 10], key: '#fff2d8' });
  const update = (t) => {
    const r = P(p, 'rays', 0), shield = P(p, 'shield', 0);
    beams.forEach((m, i) => {
      const k = shield ? Math.min(seg(t, i * 0.04, 0.4 + i * 0.04), 0.5) : seg(t, i * 0.04, 0.5 + i * 0.04) * r;
      m.visible = k > 0.01; if (m.visible) setBeam(m, shield ? k * 0.98 : 0.35 + k * 0.65);
      hits[i].visible = !shield && k > 0.95; hits[i].position.copy(m.userData.end); hits[i].scale.setScalar(0.8 + 0.4 * Math.sin(t * 30 + i));
    });
    film.visible = !!shield;
    const red = lerp(P(p, 'red0', 0), P(p, 'red1', 0), ease(t));
    epi.material.color.copy(base).lerp(new THREE.Color('#e0503c'), red * 0.75);
    capScale.forEach((c) => c.scale.set(1 + red * 0.25, 1, 1 + red * 0.25));
    heat.intensity = red * (14 + 5 * Math.sin(t * 20));
    const pl = lerp(P(p, 'peel0', 0), P(p, 'peel1', 0), ease(t));
    flake.visible = pl > 0.01;
    const a = flakeG.attributes.position;
    for (let i = 0; i < a.count; i++) { const x = fb[i * 3], z = fb[i * 3 + 2], u = clamp01((z + 1.6) / 3.2) * clamp01((x + 2.1) / 4.2); const lift = pl * 2.8 * u * u; a.setXYZ(i, x - Math.sin(lift) * 0.6 * u, (1 - Math.cos(lift)) * 1.6 + 0.03 + 0.04 * n3(x * 3, z * 3, 0), z - Math.sin(lift) * 0.9 * u); }
    a.needsUpdate = true; flakeG.computeVertexNormals();
    sun.visible = !!P(p, 'sun', 0);
    orbit(camera, p, t, { az0: 0.35, az1: 0.25, el0: 0.25, el1: 0.18, dist0: 26, dist1: 22, ty0: -0.5, ty1: -1.0, tz0: 1.5, tz1: 2 });
  };
  return done(scene, camera, update);
}

// 2 — DNA hit by UV: two neighbouring T bases fuse and the helix kinks. params: kink0/kink1, flash
function dna(p) {
  const { scene, camera } = setup({ top: '#140c1e' });
  const h = dnaHelix({ turns: 3, radius: 1.1, pitch: 3.6, perTurn: 10, seed: 3 }); scene.add(h);
  const pairs = h.userData.pairs, mid = Math.floor(pairs.length / 2);
  [mid, mid + 1].forEach((i) => { pairs[i].letters = ['T', 'A']; pairs[i].left.material = pairs[i].left.material.clone(); pairs[i].left.material.color.set('#ffd23f'); pairs[i].left.material.emissive.set('#ffd23f'); });
  const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1, 12), glowMat('#ff3b3b', 1.5)); scene.add(bond);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 14, 12), uvM()); scene.add(beam);
  const lab = label('DNA DAMAGE', { color: '#ff4b4b', size: 0.55 }); scene.add(lab);
  studio(scene, { target: [0, 0, 0], keyI: 12, keyPos: [-5, 8, 10], rim: '#b36bff' });
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  const update = (t) => {
    const k = lerp(P(p, 'kink0', 0), P(p, 'kink1', 1), ease(t));
    // bend: rotate the upper half around the damaged pair
    const yMid = pairs[mid].y;
    h.children.forEach((c) => { c.rotation.x = 0; });
    h.rotation.set(0, t * 0.6, 0);
    pairs[mid].group.rotation.z = k * 0.25; pairs[mid + 1].group.rotation.z = -k * 0.25;
    [mid, mid + 1].forEach((i) => { pairs[i].left.material.emissiveIntensity = 0.35 + k * (0.8 + 0.4 * Math.sin(t * 30)); pairs[i].left.material.emissive.set(k > 0.3 ? '#ff3b3b' : '#ffd23f'); });
    pairs[mid].left.getWorldPosition(a); pairs[mid + 1].left.getWorldPosition(b);
    bond.visible = k > 0.15; bond.position.copy(a).add(b).multiplyScalar(0.5); bond.scale.y = a.distanceTo(b); bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    const fl = P(p, 'flash', 0) ? Math.max(0, 1 - Math.abs(t - 0.2) * 5) : 0;
    beam.visible = fl > 0.02; beam.position.set(a.x - 3, a.y + 4, a.z); beam.rotation.z = 0.65; beam.material.opacity = fl;
    lab.userData.place(a.clone(), new THREE.Vector3(a.x, a.y + 2.6, a.z + 0.5), P(p, 'label', 0) ? seg(t, 0.3, 0.45) : 0);
    orbit(camera, p, t, { az0: 0.3, az1: 0.1, el0: 0.1, el1: 0.05, dist0: 20, dist1: 17, ty0: 0, ty1: 0 });
  };
  return done(scene, camera, update);
}

// 3 — skin cells: damaged ones shrink, bubble and break apart; or a cluster of damaged survivors glowing. params: die0/die1, mutant
function cells(p) {
  const { scene, camera } = setup({ top: '#1e0e14' });
  const N = 7, cs = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < 5; j++) {
    const g = new THREE.SphereGeometry(0.9, 48, 32); displace(g, (v) => 0.06 * n3(v.x * 2 + i, v.y * 2 + j, v.z * 2));
    const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: '#f0b8a4', roughness: 0.35, clearcoat: 0.8, transmission: 0.25, thickness: 1 }));
    m.scale.set(1, 0.8, 1); m.position.set((i - (N - 1) / 2) * 1.75 + (j % 2) * 0.85, (j - 2) * 1.45, 0); scene.add(m);
    const nu = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 16), wet('#7a3a8a')); m.add(nu);
    const dead = rnd(i * 5 + j) < 0.3, mut = !dead && Math.abs(i - 4) <= 1 && Math.abs(j - 2) <= 1;
    m.userData = { dead, mut, base: m.position.clone(), blebs: [] };
    if (dead) for (let k = 0; k < 7; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), m.material); const a = k / 7 * Math.PI * 2; b.userData.dir = new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.8, rnd(k) - 0.5).normalize(); scene.add(b); m.userData.blebs.push(b); }
    cs.push(m);
  }
  studio(scene, { target: [0, 0, 0], keyI: 12, keyPos: [-5, 8, 10] });
  const update = (t) => {
    const die = lerp(P(p, 'die0', 0), P(p, 'die1', 1), ease(t)), mutant = P(p, 'mutant', 0);
    cs.forEach((m) => {
      const u = m.userData;
      if (u.dead) {
        const s = 1 - 0.65 * die; m.scale.set(s, s * 0.8, s); m.material.color.set('#f0b8a4').lerp(new THREE.Color('#6a3a3a'), die);
        u.blebs.forEach((b) => { b.visible = die > 0.2; b.position.copy(u.base).addScaledVector(b.userData.dir, 0.4 + die * 1.4); b.scale.setScalar(die); });
      }
      if (mutant && u.mut) { m.material.emissive = new THREE.Color('#ff2020'); m.material.emissiveIntensity = 0.25 + 0.2 * Math.sin(t * 15); m.material.color.set('#7a2a3a'); m.scale.setScalar(1.05 + 0.15 * t); }
    });
    orbit(camera, p, t, { az0: 0.35, az1: 0.15, el0: 0.2, el1: 0.12, dist0: 22, dist1: 18 });
  };
  return done(scene, camera, update);
}

run({ skin, dna, cells });
