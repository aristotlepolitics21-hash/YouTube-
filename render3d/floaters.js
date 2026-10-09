// "What are those squiggles floating in your vision?" — your point of view against a bright sky
// with floaters drifting, a half-eyeball cutaway (cornea, iris, lens, clear vitreous jelly with
// collagen fibers that clump), light rays casting the clumps' shadows on the retina, and a torn
// retina with flashes and a shower of new floaters.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, flow, label, path3, wet, glowMat, flesh, C,
} from './lib_body.js';
import { run } from './lib3d.js';

// Floater sprite: a soft, dark, semi-transparent squiggle (or ring of beads) drawn on a canvas
function floaterTex(seed, kind = 'string') {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.filter = 'blur(2px)'; x.lineCap = 'round';
  if (kind === 'string') {
    x.strokeStyle = 'rgba(30,40,60,0.55)'; x.lineWidth = 7; x.beginPath();
    for (let i = 0; i <= 40; i++) { const u = i / 40, px = 30 + u * 196, py = 128 + 60 * Math.sin(u * 6 + seed) * Math.sin(u * 3 + seed * 2); i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
    x.strokeStyle = 'rgba(220,230,255,0.25)'; x.lineWidth = 2; x.stroke();
  } else {
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + seed, r = 60 + 15 * Math.sin(i * 2 + seed); x.fillStyle = 'rgba(30,40,60,0.45)'; x.beginPath(); x.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 12, 0, Math.PI * 2); x.fill(); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// 1 — your view: bright sky, floaters drift after each eye movement. params: n (count), shower (many new dark specks), flash
function pov(p) {
  const { scene, camera } = setup({ top: '#3f9cff', bottom: '#d8ecff' });
  const sun = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshBasicMaterial({ color: '#fffbe8' })); sun.position.set(14, 22, -50); scene.add(sun);
  const cloudM = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 });
  for (let i = 0; i < 14; i++) { const cl = new THREE.Mesh(new THREE.SphereGeometry(3 + rnd(i) * 3, 24, 16), cloudM); cl.position.set((rnd(i + 0.2) - 0.5) * 80, -8 + rnd(i + 0.4) * 10, -45 - rnd(i + 0.6) * 5); cl.scale.y = 0.5; scene.add(cl); }
  const n = P(p, 'n', 7), fl = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: floaterTex(i * 1.7, i % 3 === 2 ? 'ring' : 'string'), transparent: true, depthWrite: false }));
    m.userData = { x: (rnd(i) - 0.5) * 1.5, y: (rnd(i + 0.3) - 0.5) * 2.6 + 0.3, s: 0.45 + rnd(i + 0.6) * 0.5, r: rnd(i + 0.9) * 6 };
    scene.add(m); fl.push(m);
  }
  const specks = new THREE.InstancedMesh(new THREE.CircleGeometry(0.03, 10), new THREE.MeshBasicMaterial({ color: '#202030', transparent: true, opacity: 0.6 }), 300);
  specks.frustumCulled = false; scene.add(specks);
  const flashM = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthTest: false });
  const flash = new THREE.Mesh(new THREE.PlaneGeometry(10, 18), flashM); scene.add(flash);
  const d = new THREE.Object3D();
  const update = (t) => {
    camera.position.set(0, 0, 0);
    // the eye darts and the floaters lag behind, then drift back (like jelly sloshing)
    const dart = Math.sin(t * Math.PI * 2 * 0.8) * 0.12;
    camera.rotation.set(0, dart, 0);
    const lag = -Math.sin(t * Math.PI * 2 * 0.8 - 0.9) * 0.35;
    fl.forEach((m) => { const u = m.userData; m.position.set(u.x + lag + 0.2 * Math.sin(t * 2 + u.r), u.y - t * 0.3 + 0.1 * Math.cos(t * 1.5 + u.r), -6); m.scale.setScalar(u.s); m.rotation.z = u.r + t * 0.3; m.position.applyEuler(camera.rotation); m.quaternion.copy(camera.quaternion); m.rotateZ(u.r + t * 0.3); });
    const sh = P(p, 'shower', 0);
    for (let i = 0; i < 300; i++) { d.position.set((rnd(i) - 0.5) * 1.7 + lag * 0.5, (rnd(i + 0.3) - 0.5) * 3.2 - t * (0.3 + rnd(i + 0.5) * 0.4), -5.5); d.position.applyEuler(camera.rotation); d.quaternion.copy(camera.quaternion); d.scale.setScalar(sh ? 0.3 + rnd(i + 0.7) * 0.6 : 0); d.updateMatrix(); specks.setMatrixAt(i, d.matrix); }
    specks.instanceMatrix.needsUpdate = true;
    flash.position.set(0, 0, -2).applyEuler(camera.rotation); flash.quaternion.copy(camera.quaternion);
    flashM.opacity = P(p, 'flash', 0) ? Math.max(0, Math.sin(t * 37) * Math.sin(t * 23)) * 0.75 : 0;
  };
  return { scene, camera, update };
}

// Half eyeball (cut along z=0, looking +x). Returns {group, vitreous, retina, fibers, clumps}
function eyeball() {
  const g = new THREE.Group(), R = 3;
  const half = (r, mat) => new THREE.Mesh(new THREE.SphereGeometry(r, 96, 64, Math.PI, Math.PI), mat); // the far (z<0) half
  g.add(half(R, new THREE.MeshPhysicalMaterial({ color: '#f3efe8', roughness: 0.35, clearcoat: 0.6, side: THREE.DoubleSide })));
  g.add(half(R - 0.12, flesh('#5a1a1a', 3, { side: THREE.BackSide })));
  // retina texture: orange-red with branching vessels from the optic disc at the back
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#d9653a'; x.fillRect(0, 0, 1024, 512);
  x.strokeStyle = '#8a0f14'; x.lineCap = 'round';
  const branch = (px, py, a, w, depth) => { if (depth > 6) return; const L = 60 + rnd(depth + px) * 40; const nx = px + Math.cos(a) * L, ny = py + Math.sin(a) * L; x.lineWidth = w; x.beginPath(); x.moveTo(px, py); x.lineTo(nx, ny); x.stroke(); branch(nx, ny, a - 0.4, w * 0.7, depth + 1); branch(nx, ny, a + 0.35, w * 0.7, depth + 1); };
  for (let k = 0; k < 6; k++) branch(256, 256, k * 1.05, 7, 0);
  x.fillStyle = '#ffd9a0'; x.beginPath(); x.arc(256, 256, 22, 0, Math.PI * 2); x.fill();
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const retina = half(R - 0.18, new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.4, clearcoat: 0.5, side: THREE.BackSide })); g.add(retina);
  // cut rim (the wall thickness on the cut plane)
  g.add(new THREE.Mesh(new THREE.RingGeometry(R - 0.18, R, 128), new THREE.MeshPhysicalMaterial({ color: '#e8d8d0', roughness: 0.5, side: THREE.DoubleSide })));
  // cornea, iris, lens
  const cornea = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 32, Math.PI, Math.PI, 0, Math.PI), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, transmission: 1, thickness: 0.2, clearcoat: 1, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  cornea.position.x = 2.05; cornea.scale.x = 0.75; g.add(cornea);
  const iris = new THREE.Mesh(new THREE.RingGeometry(0.55, 1.45, 64, 1, Math.PI / 2, Math.PI), wet('#3a6ea8', { side: THREE.DoubleSide })); iris.rotation.y = Math.PI / 2; iris.position.x = 2.45; g.add(iris);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.95, 48, 32, Math.PI, Math.PI), new THREE.MeshPhysicalMaterial({ color: '#f6f0d8', roughness: 0.05, transmission: 0.8, thickness: 1, clearcoat: 1, transparent: true, opacity: 0.85 }));
  lens.scale.set(0.45, 1, 1); lens.position.x = 2.0; g.add(lens);
  const nerve = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 3, 32, 1, false, Math.PI / 2, Math.PI), wet(C.nerve)); nerve.rotation.z = Math.PI / 2; nerve.position.x = -4.2; g.add(nerve);
  // vitreous gel
  const vitreous = half(R - 0.2, new THREE.MeshPhysicalMaterial({ color: '#cfeaff', roughness: 0.1, transmission: 0.6, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }));
  g.add(vitreous);
  // collagen fibers: loose wavy strands; clumps form where several strands knot together
  const fibM = new THREE.MeshPhysicalMaterial({ color: '#ffffff', emissive: '#9fc8ff', emissiveIntensity: 0.2, transparent: true, opacity: 0.35, depthWrite: false });
  const fibers = Array.from({ length: 16 }, (_, i) => {
    const pts = Array.from({ length: 7 }, (_, k) => new THREE.Vector3(-2.2 + k * 0.65, (rnd(i + k * 0.1) - 0.5) * 4 * Math.sin((k + 1) / 8 * Math.PI), -0.2 - rnd(i + 0.5) * 1.8));
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.018, 5), fibM); g.add(m); return m;
  });
  const clumpM = new THREE.MeshPhysicalMaterial({ color: '#5a6478', roughness: 0.5, transparent: true, opacity: 0.9 });
  const clumps = [[-0.6, 0.9, -0.6], [0.4, -1.0, -0.9], [-1.4, -0.3, -0.5]].map(([cx, cy, cz], i) => {
    const m = new THREE.Group(); m.position.set(cx, cy, cz); g.add(m);
    for (let k = 0; k < 6; k++) { const pts = Array.from({ length: 6 }, (_, j) => new THREE.Vector3((rnd(i * 9 + k + j) - 0.5) * 0.7, (rnd(i * 9 + k + j + 0.3) - 0.5) * 0.7, (rnd(i * 9 + k + j + 0.6) - 0.5) * 0.4)); m.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.045, 6), clumpM)); }
    return m;
  });
  return { group: g, vitreous, retina, fibers, clumps, fibM, clumpM };
}

// 2 — eye cutaway. params: fibers (show), clump0/clump1 (fibers fade, clumps grow), rays, shadows, slosh, cam
function eye(p) {
  const { scene, camera } = setup({ top: '#141019' });
  const e = eyeball(); scene.add(e.group);
  // light rays: come in through the cornea, cross at the lens, land on the back of the retina
  const rayM = new THREE.MeshBasicMaterial({ color: '#fff3c4', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const rays = [-1.0, -0.5, 0, 0.5, 1.0].map((y) => { const c = path3([[8, y, -0.4], [2.4, y * 0.9, -0.4], [1.8, y * 0.6, -0.4], [-2.75, -y * 1.35, -0.4]]); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.035, 6), rayM); scene.add(m); return m; });
  const shadowM = new THREE.MeshBasicMaterial({ color: '#1a0606', transparent: true, opacity: 0.0, depthWrite: false });
  const shadows = e.clumps.map((c) => { const s = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), shadowM); s.position.set(-2.72, -c.position.y * 0.9, c.position.z); s.rotation.y = Math.PI / 2; s.scale.set(1, 1.3, 1); scene.add(s); return s; });
  const labs = [['VITREOUS JELLY', '#9fd8ff', [-0.5, 1.8, -0.3], [-0.5, 4.3, 0.5]], ['RETINA', '#ff8a5a', [-2.75, -1.2, -0.5], [-2.3, -4.2, 0.5]]].map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.42 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [0, 0, -0.5], keyI: 14, keyPos: [6, 6, 10], rim: '#7fb8ff' });
  const update = (t) => {
    const cl = lerp(P(p, 'clump0', 0), P(p, 'clump1', 0), ease(t));
    e.fibers.forEach((f) => { f.visible = !!P(p, 'fibers', 1); }); e.fibM.opacity = 0.35 * (1 - cl * 0.7);
    e.clumps.forEach((c, i) => { c.scale.setScalar(0.001 + cl); const sl = P(p, 'slosh', 0) * Math.sin(t * 6 - i) * 0.35; c.position.y += 0; c.rotation.z = sl; c.position.x = [-0.6, 0.4, -1.4][i] + sl; });
    const r = P(p, 'rays', 0); rays.forEach((m) => { m.visible = r > 0; }); rayM.opacity = 0.5 * r;
    shadowM.opacity = 0.65 * P(p, 'shadows', 0) * cl;
    shadows.forEach((s, i) => { s.position.z = e.clumps[i].position.z; s.position.y = -e.clumps[i].position.y * 0.9 + (e.clumps[i].position.x - [-0.6, 0.4, -1.4][i]) * 0.5; });
    e.group.rotation.y = P(p, 'slosh', 0) * 0.25 * Math.sin(t * 6);
    labs.forEach((o, i) => o.l.userData.place(o.a, new THREE.Vector3(o.a.x, o.b.y, o.b.z), P(p, 'labels', 0) ? seg(t, 0.1 + i * 0.2, 0.25 + i * 0.2) : 0));
    orbit(camera, p, t, { az0: 0.25, az1: 0.1, el0: 0.12, el1: 0.06, dist0: 22, dist1: 19 });
  };
  return done(scene, camera, update);
}

// 3 — torn retina: close on the inner back wall; a horseshoe tear lifts, light flashes, specks pour out. params: tear0/tear1, flash
function retina(p) {
  const { scene, camera } = setup({ top: '#1a0a0a' });
  const e = eyeball(); scene.add(e.group); e.fibers.forEach((f) => { f.visible = false; }); e.clumps.forEach((c) => { c.visible = false; });
  const flap = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.5, 48, 1, 0.3, Math.PI * 1.4), new THREE.MeshPhysicalMaterial({ color: '#2a0505', roughness: 0.6, side: THREE.DoubleSide }));
  flap.position.set(-2.55, 1.2, -1.3); flap.rotation.y = Math.PI / 2 - 0.4; scene.add(flap);
  const specks = flow(path3([[-2.5, 1.2, -1.3], [-1.2, 0.6, -1.0], [0.5, -0.4, -0.6]]), 120, { r: 0.035, color: '#2a2a3a', spread: 1.2, mat: new THREE.MeshBasicMaterial({ color: '#1c1c28' }) }); scene.add(specks);
  const fl = new THREE.PointLight('#ffffff', 0, 8, 1.5); fl.position.set(-1.5, 1, -0.5); scene.add(fl);
  studio(scene, { target: [-1.5, 0.5, -1], keyI: 12, keyPos: [6, 4, 10] });
  const update = (t) => {
    const k = lerp(P(p, 'tear0', 0), P(p, 'tear1', 1), ease(t));
    flap.scale.setScalar(0.4 + k * 1.2); flap.rotation.z = k * 0.5;
    specks.visible = k > 0.2; specks.userData.update(t, { speed: 0.5, scale: Math.min(1, k * 1.5) });
    fl.intensity = P(p, 'flash', 0) ? Math.max(0, Math.sin(t * 37) * Math.sin(t * 23)) * 40 : 0;
    orbit(camera, p, t, { az0: 0.9, az1: 0.7, el0: 0.2, el1: 0.15, dist0: 9, dist1: 7, tx0: -1.0, tx1: -1.3, ty0: 0.6, ty1: 0.8, tz0: -0.6, tz1: -0.8 });
  };
  return done(scene, camera, update);
}

run({ pov, eye, retina });
