// "Why do you get dizzy after spinning?" — your point of view in a spinning room; the inner ear's
// three fluid-filled loops (semicircular canals) with the cochlea; a close-up of one loop's
// ampulla, where a jelly flap (cupula) on a ridge of hair cells bends as the fluid lags,
// straightens as it catches up, and bends the other way when you stop.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, label, path3, wet, glowMat, flesh,
  glassMat, bubbleMat, rim, C,
} from './lib_body.js';
import { organicTube } from './lib3d.js';
import { run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ---------- 1: first-person spinning room ----------
// params: w0/w1 (spin speed, turns per shot), stop (time the body stops; the view keeps drifting), drift, spot (snap back to a red dot)
function room(p) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#0d1018');
  const camera = new THREE.PerspectiveCamera(70, 1080 / 1920, 0.1, 100);
  const tile = document.createElement('canvas'); tile.width = tile.height = 512; const x = tile.getContext('2d');
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#d8d2c6' : '#2a3140'; x.fillRect(i * 64, j * 64, 64, 64); }
  const tt = new THREE.CanvasTexture(tile); tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(6, 6); tt.colorSpace = THREE.SRGBColorSpace;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ map: tt, roughness: 0.5, side: THREE.DoubleSide })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: '#e8e4dc', roughness: 0.9, side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = 10; scene.add(ceil);
  const wallM = new THREE.MeshPhysicalMaterial({ color: '#6f8fc0', roughness: 0.8, side: THREE.BackSide });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 10, 64, 1, true), wallM); wall.position.y = 5; scene.add(wall);
  const cols = ['#ff5a5a', '#ffd23f', '#4dff9a', '#57b8ff', '#c38bff', '#ff9a3a'];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, f = new THREE.Mesh(new RoundedBoxGeometry(2.2, 2.8, 0.15, 3, 0.05), new THREE.MeshPhysicalMaterial({ color: cols[i % 6], roughness: 0.4, emissive: cols[i % 6], emissiveIntensity: 0.25 }));
    f.position.set(Math.cos(a) * 13.8, 3.6 + (i % 2) * 0.8, Math.sin(a) * 13.8); f.lookAt(0, f.position.y, 0); scene.add(f);
    const lamp = new THREE.PointLight('#ffe6c0', 40, 16, 1.4); lamp.position.set(Math.cos(a + 0.26) * 11, 7.5, Math.sin(a + 0.26) * 11); if (i % 3 === 0) scene.add(lamp);
  }
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.45, 48), new THREE.MeshBasicMaterial({ color: '#ff2a2a' })); dot.position.set(0, 3.2, -13.7); scene.add(dot);
  scene.add(new THREE.HemisphereLight('#ffffff', '#606878', 2.2));
  const update = (t) => {
    const w0 = P(p, 'w0', 1), w1 = P(p, 'w1', 1), stop = P(p, 'stop', 2), spot = P(p, 'spot', 0);
    // angle: integrate a speed that ramps w0 -> w1; after "stop" the body is still but the view drifts (dizzy)
    const tt2 = Math.min(t, stop), ang = (w0 * tt2 + (w1 - w0) * tt2 * tt2 / 2) * Math.PI * 2;
    let a = ang;
    if (t > stop) { const s = t - stop; a += P(p, 'drift', 0) * (1 - Math.exp(-s * 3)) * 0.8 + 0.06 * Math.sin(s * 40) * Math.exp(-s * 4); }
    if (spot) a = Math.round(a / (Math.PI * 2)) * Math.PI * 2 + 0.25 * Math.sin(Math.min(1, (a / (Math.PI * 2)) % 1) * Math.PI) ** 8;
    camera.position.set(0, 3.2, 0); camera.rotation.order = 'YXZ'; camera.rotation.set(-0.12 + 0.02 * Math.sin(t * 9) * (t > stop ? 1 : 0.3), -a, 0.05 * Math.sin(t * 3));
  };
  return { scene, camera, update };
}

// ---------- the inner ear (labyrinth): three canals at right angles + vestibule + cochlea ----------
function labyrinth() {
  const g = new THREE.Group();
  const boneM = rim(new THREE.MeshPhysicalMaterial({ color: '#efe6d8', roughness: 0.35, transmission: 0.55, thickness: 0.8, transparent: true, opacity: 0.55, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }), '#9fd8ff', 0.5, 2.5);
  const fluidM = glowMat('#4fb8ff', 0.5); fluidM.transparent = true; fluidM.opacity = 0.75;
  const ves = new THREE.Mesh(new THREE.SphereGeometry(0.75, 48, 32), boneM); ves.scale.set(1.25, 1, 1); g.add(ves);
  const vesF = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 24), fluidM); vesF.scale.copy(ves.scale); g.add(vesF);
  const canals = [];
  const specs = [[new THREE.Euler(0, 0, 0), new THREE.Vector3(0.1, 1.55, 0)], [new THREE.Euler(0, Math.PI / 2, 0), new THREE.Vector3(-0.15, 1.45, 0.1)], [new THREE.Euler(Math.PI / 2, 0, 0), new THREE.Vector3(-1.45, 0.25, 0)]];
  specs.forEach(([rot, pos], i) => {
    const c = new THREE.Group(); c.rotation.copy(rot); c.position.copy(pos); g.add(c);
    const arc = Math.PI * 1.55, tube = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.19, 24, 120, arc), boneM); tube.rotation.z = -Math.PI * 0.27 + Math.PI; c.add(tube);
    const fl = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.09, 12, 120, arc), fluidM); fl.rotation.copy(tube.rotation); c.add(fl);
    const amp = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 24), boneM); const a0 = tube.rotation.z; amp.position.set(Math.cos(a0) * 1.45, Math.sin(a0) * 1.45, 0); c.add(amp);
    canals.push({ c, fl, ampPos: amp.position });
  });
  // cochlea: a snail-shell spiral tube
  const sp = path3(Array.from({ length: 80 }, (_, i) => { const u = i / 79, a = u * Math.PI * 5, r = 1.1 * (1 - u * 0.75); return [0.7 + Math.cos(a) * r, -0.9 - u * 1.9, 0.9 + Math.sin(a) * r]; }));
  const coch = new THREE.Mesh(organicTube(sp, 0.32, 300, 32, (u) => 1 - u * 0.6), boneM); g.add(coch);
  const cochF = new THREE.Mesh(organicTube(sp, 0.16, 300, 16, (u) => 1 - u * 0.6), glowMat('#ff9ad0', 0.4)); g.add(cochF);
  const nerve = new THREE.Mesh(new THREE.TubeGeometry(path3([[0.4, 0, -0.6], [1.6, -0.3, -1.6], [3.5, -0.2, -2.8]]), 40, 0.22, 12), wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.3 })); g.add(nerve);
  g.userData = { canals, fluidM };
  return g;
}

// 2 — the labyrinth turning in space. params: flow (fluid particles; sign = direction), glow (canals light up), labels, spinG (turn the model)
function ear(p) {
  const { scene, camera } = setup();
  const lab = labyrinth(); scene.add(lab);
  const n = 150, parts = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), glowMat('#cfeeff', 1.6), n); parts.frustumCulled = false; lab.add(parts);
  const labs = [['3 FLUID-FILLED LOOPS', '#7fd8ff', [0.1, 3.0, 0], [0.1, 3.9, 0.5]], ['COCHLEA (HEARING)', '#ff9ad0', [0.8, -1.6, 1.0], [0.8, -3.3, 1.2]]].map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.4 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [0, 0.5, 0], keyI: 10, keyPos: [-4, 7, 9], rim: '#ffb59a', rimI: 8 });
  const d = new THREE.Object3D();
  const update = (t) => {
    const flow = P(p, 'flow', 0);
    for (let i = 0; i < n; i++) {
      const c = lab.userData.canals[i % 3], a = (rnd(i) * Math.PI * 1.55 + flow * t * 4) + Math.PI - Math.PI * 0.27, r = 1.45 + (rnd(i + 0.3) - 0.5) * 0.08;
      d.position.set(Math.cos(a) * r, Math.sin(a) * r, (rnd(i + 0.6) - 0.5) * 0.08).applyEuler(c.c.rotation).add(c.c.position);
      d.scale.setScalar(flow ? 1 : 0.001); d.updateMatrix(); parts.setMatrixAt(i, d.matrix);
    }
    parts.instanceMatrix.needsUpdate = true;
    lab.userData.fluidM.emissiveIntensity = 0.5 + P(p, 'glow', 0) * (0.6 + 0.3 * Math.sin(t * 20));
    lab.rotation.set(0.25, -0.6 + t * P(p, 'spinG', 0.6), 0);
    labs.forEach((o, i) => { const a = o.a.clone().applyEuler(lab.rotation); o.l.userData.place(a, new THREE.Vector3(a.x, o.b.y, o.b.z), P(p, 'labels', 0) ? seg(t, 0.12 + i * 0.15, 0.24 + i * 0.15) : 0); });
    orbit(camera, p, t, { az0: 0.3, az1: 0.15, el0: 0.12, el1: 0.08, dist0: 17, dist1: 15, ty0: 0.4, ty1: 0.4 });
  };
  return done(scene, camera, update);
}

// 3 — inside one loop: the ampulla, the jelly flap on its ridge of hair cells, the fluid.
// params: b0/b1 (flap bend, -1..1), v (fluid speed relative to the loop; sign = direction), signal, labels, cam
function flap(p) {
  const { scene, camera } = setup();
  const g = new THREE.Group(); scene.add(g);
  // the canal: glass tube along x with a bulge (ampulla) at the middle
  const tubeC = path3([[-10, 0, 0], [-3, 0, 0], [0, 0, 0], [3, 0, 0], [10, 0, 0]]);
  const tubeG = organicTube(tubeC, 1.0, 240, 64, (u) => 1 + 1.4 * Math.exp(-((u - 0.5) ** 2) / 0.006), false);
  g.add(new THREE.Mesh(tubeG, glassMat('#9fd8ff', { edge: 0.3, core: 0.0, power: 3 })));
  const backWall = new THREE.Mesh(tubeG, rim(flesh('#c98f8a', 3, { side: THREE.BackSide, clearcoat: 0.8, transparent: true, opacity: 0.35, depthWrite: false }), '#9fd8ff', 0.15, 2.5)); g.add(backWall);
  // crista: ridge at the floor of the ampulla, with hair cell bundles
  const crista = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), flesh('#d97a86', 3, { clearcoat: 1 })); crista.scale.set(0.9, 0.7, 1.5); crista.position.y = -2.25; g.add(crista);
  const hairs = [], hairM = wet('#ffe6a8', { emissive: '#ffcc40', emissiveIntensity: 0.2 });
  for (let i = 0; i < 70; i++) { const a = rnd(i) * Math.PI * 2, r = Math.sqrt(rnd(i + 0.3)) * 0.8; const h = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.5 + rnd(i + 0.6) * 0.25, 5), hairM); h.geometry.translate(0, h.geometry.parameters.height / 2, 0); h.position.set(Math.cos(a) * r * 0.85, -2.25 + 0.68 * Math.sqrt(Math.max(0, 1 - r * r)), Math.sin(a) * r * 1.4); g.add(h); hairs.push(h); }
  // cupula: a jelly sail standing on the crista, spanning the ampulla; bends with the fluid
  const cupG = new THREE.SphereGeometry(1, 48, 48); cupG.scale(0.28, 2.3, 1.95); cupG.translate(0, 0.5, 0);
  const cupBase = Float32Array.from(cupG.attributes.position.array);
  const cupM = new THREE.MeshPhysicalMaterial({ color: '#c8f0ff', roughness: 0.15, transmission: 0.5, thickness: 0.6, transparent: true, opacity: 0.35, clearcoat: 1, emissive: '#57b8ff', emissiveIntensity: 0.08, depthWrite: false, side: THREE.DoubleSide });
  const cup = new THREE.Mesh(cupG, cupM); g.add(cup);
  const cupEdge = new THREE.Mesh(cupG, glassMat('#bfeaff', { edge: 0.45, core: 0.0, power: 2.5 })); g.add(cupEdge);
  const n = 220, fl = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), bubbleMat('#7fd0ff'), n); fl.frustumCulled = false; g.add(fl);
  const sigs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 10, 8), glowMat('#fff3a0', 2.6), 40); sigs.frustumCulled = false; g.add(sigs);
  const nerve = new THREE.Mesh(new THREE.TubeGeometry(path3([[0, -2.3, 0], [0.2, -3.4, 0.3], [1.5, -5, 0.5]]), 40, 0.16, 10), wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.3 })); g.add(nerve);
  const labs = [['JELLY FLAP', '#bfeaff', [0, 2.2, 0.4], [-0.2, 3.9, 0.8]], ['HAIR CELLS', '#ffe6a8', [0.4, -1.75, 0.6], [1.6, -4.0, 1.0]]].map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.42 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [0, 0, 0], keyI: 6, keyPos: [-4, 7, 9], rim: '#ffb59a', rimI: 6, hemi: 0.12 });
  const d = new THREE.Object3D();
  const update = (t) => {
    const b = lerp(P(p, 'b0', 0), P(p, 'b1', 0), ease(t)) + 0.04 * Math.sin(t * 7);
    const pa = cupG.attributes.position;
    for (let i = 0; i < pa.count; i++) { const y = cupBase[i * 3 + 1], h = clamp01((y + 1.8) / 4.6); pa.setX(i, cupBase[i * 3] + b * 1.5 * h * h); pa.setY(i, y - Math.abs(b) * 0.25 * h * h * h); }
    pa.needsUpdate = true; cupG.computeVertexNormals();
    hairs.forEach((h) => { h.rotation.z = -b * 0.6; });
    hairM.emissiveIntensity = 0.2 + Math.abs(b) * 1.4 * P(p, 'signal', 1);
    const v = P(p, 'v', 0);
    for (let i = 0; i < n; i++) {
      const x = ((rnd(i) * 20 + v * t * 8) % 20 + 20) % 20 - 10, rr = Math.sqrt(rnd(i + 0.3)) * (0.85 + 1.3 * Math.exp(-(x * x) / 1.2)), a = rnd(i + 0.6) * Math.PI * 2;
      d.position.set(x, Math.cos(a) * rr, Math.sin(a) * rr); d.scale.setScalar(0.03 + rnd(i + 0.9) ** 2 * 0.09); d.updateMatrix(); fl.setMatrixAt(i, d.matrix);
    }
    fl.instanceMatrix.needsUpdate = true;
    const sigOn = Math.abs(b) > 0.25 && P(p, 'signal', 1);
    for (let i = 0; i < 40; i++) { const u = ((rnd(i) + t * 1.4) % 1); d.position.set(0.2 * u + 1.3 * u * u, -2.3 - u * 2.6, 0.3 * u + 0.2); d.scale.setScalar(sigOn ? 1 : 0.001); d.updateMatrix(); sigs.setMatrixAt(i, d.matrix); }
    sigs.instanceMatrix.needsUpdate = true;
    labs.forEach((o, i) => o.l.userData.place(o.a, new THREE.Vector3(o.a.x, o.b.y, o.b.z), P(p, 'labels', 0) ? seg(t, 0.12 + i * 0.15, 0.24 + i * 0.15) : 0));
    orbit(camera, p, t, { az0: 0.55, az1: 0.4, el0: 0.15, el1: 0.1, dist0: 19, dist1: 17, ty0: -0.4, ty1: -0.4 });
  };
  return done(scene, camera, update);
}

run({ room, ear, flap });
