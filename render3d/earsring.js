// "Why do your ears ring after a concert?" — a speaker stack blasting the crowd; the cochlea, a
// glassy snail shell that unrolls into a long tube lined with hair cells; a close-up of the hair
// cells' bristle tufts swaying, bending, misfiring and dying; and a foam earplug in the ear canal
// soaking up the sound waves.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, orbit, done, setup, studio, label, path3, wet, glowMat, flesh,
  glassMat, bubbleMat, rim, C,
} from './lib_body.js';
import { organicTube, run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ---------- 1: concert speaker stack ----------
// params: blast (cone throw + shock rings), beams (stage lights), plugs (rings fade before the camera)
function concert(p) {
  const { scene, camera } = setup();
  const g = new THREE.Group(); scene.add(g);
  const boxM = new THREE.MeshPhysicalMaterial({ color: '#16181d', roughness: 0.55, clearcoat: 0.3 });
  const grillM = new THREE.MeshPhysicalMaterial({ color: '#0a0b0e', roughness: 0.9 });
  const coneM = new THREE.MeshPhysicalMaterial({ color: '#23262d', roughness: 0.35, clearcoat: 0.6, side: THREE.DoubleSide });
  const capM = new THREE.MeshPhysicalMaterial({ color: '#8a8f99', metalness: 0.8, roughness: 0.25 });
  const ringM = rim(new THREE.MeshPhysicalMaterial({ color: '#30343c', metalness: 0.7, roughness: 0.3 }), '#ff5ad0', 0.6, 3);
  const cones = [];
  const cab = (x, y, s) => {
    const c = new THREE.Group(); c.position.set(x, y, 0); g.add(c);
    c.add(new THREE.Mesh(new RoundedBoxGeometry(3.2 * s, 3.2 * s, 2.2, 4, 0.12), boxM));
    const face = new THREE.Mesh(new RoundedBoxGeometry(3.0 * s, 3.0 * s, 0.05, 2, 0.02), grillM); face.position.z = 1.11; c.add(face);
    const R = 1.25 * s;
    const lathe = new THREE.LatheGeometry(Array.from({ length: 24 }, (_, i) => { const u = i / 23; return new THREE.Vector2(0.25 * R + u * 0.75 * R, -0.55 * R * (1 - u) ** 1.6); }), 64);
    lathe.rotateX(Math.PI / 2);
    const cone = new THREE.Mesh(lathe, coneM); cone.position.z = 1.12; c.add(cone);
    const surround = new THREE.Mesh(new THREE.TorusGeometry(R, 0.08 * s, 12, 64), ringM); surround.position.z = 1.14; c.add(surround);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.28 * R, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), capM); cap.rotation.x = Math.PI / 2; cap.position.z = 1.12 - 0.5 * R; c.add(cap);
    cones.push({ cone, cap, z: cone.position.z, cz: cap.position.z, s, c });
  };
  for (const x of [-3.4, 0, 3.4]) for (const y of [-3.3, 0, 3.3]) cab(x, y, 1);
  // shock rings flying toward the camera from each cone
  const waveM = new THREE.MeshBasicMaterial({ color: '#ff8ae0', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const waves = Array.from({ length: 18 }, (_, i) => { const m = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.035, 96), waveM.clone()); m.userData = { k: i % 9, ph: Math.floor(i / 9) / 2 }; scene.add(m); return m; });
  // stage light beams (additive cones) + haze
  const beamM = new THREE.MeshBasicMaterial({ color: '#8a5cff', transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const beams = Array.from({ length: 6 }, (_, i) => {
    const b = new THREE.Mesh(new THREE.ConeGeometry(1.6, 26, 32, 1, true), beamM.clone()); b.geometry.translate(0, -13, 0);
    b.material.color.set(['#8a5cff', '#ff3fa8', '#3fc8ff'][i % 3]); b.position.set(-7 + i * 2.8, 8.5, -3); scene.add(b); return b;
  });
  // the crowd: silhouettes in the foreground, some with hands up
  const crowdM = new THREE.MeshStandardMaterial({ color: '#050608', roughness: 0.9 });
  const crowd = [];
  for (let i = 0; i < 16; i++) {
    const c = new THREE.Group(), x = -9 + i * 1.2 + (rnd(i) - 0.5) * 0.5; c.position.set(x * 0.8, -9.6 + rnd(i + 0.2) * 0.6, 15 + rnd(i + 0.4) * 2); scene.add(c);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), crowdM); head.position.y = 1.0; c.add(head);
    c.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.62, 1.2, 4, 12), crowdM));
    if (rnd(i + 0.7) > 0.5) { const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 1.6, 4, 8), crowdM); arm.geometry.translate(0, 0.8, 0); arm.position.set(0.45, 0.9, 0); arm.rotation.z = -0.3; c.add(arm); c.userData.arm = arm; }
    crowd.push(c);
  }
  studio(scene, { target: [0, 0, 0], keyI: 8, keyPos: [-5, 6, 14], rim: '#ff3fa8', rimI: 16, rim2: '#3fc8ff', hemi: 0.15 });
  const update = (t) => {
    const blast = P(p, 'blast', 1), beat = Math.max(0, Math.sin(t * 2 * Math.PI * 3.2)) ** 6;
    cones.forEach((o, i) => { const k = blast * (0.35 * beat + 0.08 * Math.sin(t * 90 + i)); o.cone.position.z = o.z + k; o.cap.position.z = o.cz + k; });
    waves.forEach((m) => {
      const o = cones[m.userData.k], u = (t * 1.6 + m.userData.ph + o.s * 0.13 * m.userData.k) % 1;
      m.position.set(o.c.position.x, o.c.position.y, 1.3 + u * 16); m.scale.setScalar(1.2 + u * 3.2);
      m.material.opacity = blast * 0.3 * (1 - u) * (1 - P(p, 'plugs', 0) * clamp01(u * 2));
    });
    beams.forEach((b, i) => { b.rotation.z = 0.5 * Math.sin(t * 2.2 + i * 1.3); b.rotation.x = 0.25 + 0.1 * Math.cos(t * 1.7 + i); b.material.opacity = P(p, 'beams', 1) * (0.05 + 0.06 * beat); });
    g.position.x = 0.04 * beat * blast * Math.sin(t * 60);
    crowd.forEach((c, i) => { c.position.y = -8.4 + rnd(i + 0.2) * 0.6 + 0.25 * beat * (rnd(i + 0.9) > 0.4 ? 1 : 0); if (c.userData.arm) c.userData.arm.rotation.z = -0.3 + 0.25 * Math.sin(t * 20 + i); });
    orbit(camera, p, t, { az0: 0.15, az1: 0.05, el0: 0.05, el1: 0.02, dist0: 46, dist1: 41, ty0: -1.5, ty1: -1.5 });
  };
  return done(scene, camera, update);
}

// ---------- the cochlea: spiral <-> straight tube (u = 0 base, high pitch; u = 1 apex, low pitch) ----------
const COIL = 2.6;
function cochPath(k) {
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const u = i / 89, a = u * Math.PI * 2 * COIL, r = 2.4 * (1 - u * 0.72);
    const spiral = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, u * 1.8 - 0.9);
    const line = new THREE.Vector3(0, 6.5 - u * 13, 0);
    pts.push(spiral.lerp(line, ease(k)));
  }
  return new THREE.CatmullRomCurve3(pts);
}

// 2 — the cochlea. params: uncoil0/uncoil1, cells (hair-cell dots along the inside), pulse (sound
// ripples travel from the base), gain (high-pitch end shimmers: ringing), labels, spin
function cochlea(p) {
  const { scene, camera } = setup();
  const g = new THREE.Group(); scene.add(g);
  const shellM = glassMat('#ffc2d8', { edge: 0.6, core: 0.03, power: 2.4 });
  const fluidM = rim(new THREE.MeshPhysicalMaterial({ color: '#ff7fb0', emissive: '#ff4f90', emissiveIntensity: 0.25, roughness: 0.3, transparent: true, opacity: 0.55, depthWrite: false }), '#ffd0e8', 0.5, 2.5);
  const shell = new THREE.Mesh(new THREE.BufferGeometry(), shellM), core = new THREE.Mesh(new THREE.BufferGeometry(), fluidM);
  g.add(core, shell);
  const nC = 260, cells = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }), nC); cells.frustumCulled = false; g.add(cells);
  const cellCol = new THREE.Color();
  for (let i = 0; i < nC; i++) cells.setColorAt(i, cellCol.set('#ffffff'));
  const nP = 120, puls = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10), bubbleMat('#9fe0ff'), nP); puls.frustumCulled = false; g.add(puls);
  const nerve = new THREE.Mesh(new THREE.BufferGeometry(), wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.3 })); g.add(nerve);
  const labs = [['COCHLEA', '#ff9ad0', 0], ['HIGH PITCH', '#ffd23f', 1], ['LOW PITCH', '#7fd8ff', 2]].map(([s, c, k]) => { const l = label(s, { color: c, size: k ? 0.5 : 0.6 }); scene.add(l); return { l, k }; });
  studio(scene, { target: [0, 0, 0], keyI: 8, keyPos: [-4, 7, 10], rim: '#ff8ab0', rimI: 8, hemi: 0.12 });
  const d = new THREE.Object3D(), v = new THREE.Vector3(), q = new THREE.Vector3();
  let lastK = -1;
  const update = (t) => {
    const k = lerp(P(p, 'uncoil0', 0), P(p, 'uncoil1', 0), ease(seg(t, 0.05, 0.85)));
    const curve = cochPath(k), rf = (u) => 1 - u * 0.55 * (1 - k * 0.5);
    if (Math.abs(k - lastK) > 1e-4) {
      shell.geometry.dispose(); shell.geometry = organicTube(curve, 0.62, 260, 40, rf);
      core.geometry.dispose(); core.geometry = organicTube(curve, 0.3, 260, 20, rf);
      const a = curve.getPointAt(0.02);
      nerve.geometry.dispose(); nerve.geometry = new THREE.TubeGeometry(path3([[a.x, a.y, a.z], [a.x - 1.2 * (1 - k), a.y - 1.6, a.z - 1.2], [a.x - 2.5 * (1 - k) - 1.5 * k, a.y - 4.5, a.z - 2.5]]), 40, 0.22, 12);
      nerve.visible = k < 0.5; lastK = k;
    }
    const gain = P(p, 'gain', 0), show = P(p, 'cells', 0);
    for (let i = 0; i < nC; i++) {
      const u = (i + 0.5) / nC; curve.getPointAt(u, v); curve.getTangentAt(u, q);
      const side = new THREE.Vector3(0, 0, 1).cross(q).normalize().multiplyScalar(0.3 * rf(u) * (i % 2 ? 1 : -1));
      d.position.copy(v).add(side); d.scale.setScalar(show ? 1 : 0.001); d.updateMatrix(); cells.setMatrixAt(i, d.matrix);
      const hot = gain * Math.exp(-u * 3.5) * (0.6 + 0.4 * Math.sin(t * 60 + i * 2.1));
      cells.setColorAt(i, cellCol.set('#ffd98a').lerp(new THREE.Color('#ff2a2a'), clamp01(hot * 1.5)).multiplyScalar(1 + hot * 2));
    }
    cells.instanceMatrix.needsUpdate = true; cells.instanceColor.needsUpdate = true;
    const pulse = P(p, 'pulse', 0);
    for (let i = 0; i < nP; i++) {
      const u = ((rnd(i) + t * 0.6) % 1), a = rnd(i + 0.3) * Math.PI * 2, r = Math.sqrt(rnd(i + 0.6)) * 0.25 * rf(u);
      curve.getPointAt(u, v); d.position.set(v.x + Math.cos(a) * r * 0.3, v.y + Math.cos(a) * r, v.z + Math.sin(a) * r);
      d.scale.setScalar(pulse ? (0.03 + rnd(i + 0.9) ** 2 * 0.07) * (1 - u * 0.6) : 0.001); d.updateMatrix(); puls.setMatrixAt(i, d.matrix);
    }
    puls.instanceMatrix.needsUpdate = true;
    fluidM.emissiveIntensity = 0.25 + gain * (0.2 + 0.15 * Math.sin(t * 50));
    g.rotation.set(lerp(-0.75, 0, ease(k)), lerp(0.45, 0.25, ease(k)) + t * P(p, 'spin', 0), 0);
    g.updateMatrixWorld();
    labs.forEach((o) => {
      let on = 0, a, at;
      if (o.k === 0) { a = curve.getPointAt(0.5).applyMatrix4(g.matrixWorld); at = new THREE.Vector3(a.x, a.y + 4.2, a.z); on = P(p, 'labels', 0) === 1; }
      else { a = curve.getPointAt(o.k === 1 ? 0.03 : 0.97).applyMatrix4(g.matrixWorld); at = new THREE.Vector3(a.x + 1.4, a.y + (o.k === 1 ? -0.6 : 0.6), a.z); on = P(p, 'labels', 0) === 2; }
      o.l.userData.place(a, at, on ? seg(t, 0.12 + o.k * 0.12, 0.26 + o.k * 0.12) : 0);
    });
    orbit(camera, p, t, { az0: 0.2, az1: 0.1, el0: 0.1, el1: 0.06, dist0: 34, dist1: 30 });
  };
  return done(scene, camera, update);
}

// ---------- 3: hair cells up close ----------
// A strip of membrane with rows of cells; each cell is topped by a V-shaped staircase tuft of bristles.
// params: sway (vibration, 0..1), bend0/bend1 (damage: tufts splay and flop), fire (spontaneous sparks
// down the nerve fibres), dead (fraction of cells gone dark with broken tufts), heal (bend relaxes back),
// labels
function hairs(p) {
  const { scene, camera } = setup();
  const g = new THREE.Group(); scene.add(g);
  const memM = flesh('#c9707e', 3, { clearcoat: 0.9 });
  const mem = new THREE.Mesh(new RoundedBoxGeometry(16, 0.6, 7, 4, 0.25), memM); mem.position.y = -2.3; g.add(mem);
  const cellM = rim(flesh('#e48a96', 3, { clearcoat: 1, emissive: new THREE.Color('#ff2040'), emissiveIntensity: 0 }), '#ffc0d0', 0.4, 2.5);
  const deadM = flesh('#5a3a40', 3, { clearcoat: 0.4 });
  const ciliaM = rim(wet('#ffe9b8', { emissive: '#ffcc40', emissiveIntensity: 0.15 }), '#fff2c0', 0.5, 2.5);
  const brokenM = wet('#8a7a60', { emissive: '#000000' });
  const sparkM = glowMat('#fff3a0', 2.4);
  const cells = [];
  const rows = [-1.7, 0, 1.7];
  for (let r = 0; r < rows.length; r++) for (let i = 0; i < 7; i++) {
    const c = new THREE.Group(); c.position.set(-6.3 + i * 2.1 + (r % 2) * 0.5, -2.0, rows[r]); g.add(c);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.2, 8, 24), cellM); body.position.y = 0.2; body.scale.set(1, 1, 0.9); c.add(body);
    const top = new THREE.Group(); top.position.y = 1.35; c.add(top);
    const bris = [];
    for (let row = 0; row < 3; row++) for (let j = 0; j < 9; j++) {
      const s = (j - 4) / 4, h = (0.55 + row * 0.35) * (1 - 0.2 * Math.abs(s));
      const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, h, 4, 8), ciliaM); b.geometry.translate(0, h / 2 + 0.035, 0);
      b.position.set(s * 0.42, 0, (row - 1) * 0.16 - Math.abs(s) * 0.25); top.add(b); bris.push({ b, s, row, h });
    }
    const dead = rnd(r * 7 + i + 0.4);
    cells.push({ c, body, top, bris, ph: rnd(r * 7 + i) * 6.28, dead, x: c.position.x, z: c.position.z });
  }
  // nerve fibres below each cell with sparks
  const fib = [], sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 10, 8), sparkM, cells.length * 3); sparks.frustumCulled = false; g.add(sparks);
  const fibM = wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.2 });
  cells.forEach((o, i) => { const cv = path3([[o.x, -2.4, o.z], [o.x + 0.3, -3.6, o.z + 0.2], [o.x * 0.6 + 1.0, -6.5, o.z * 0.4]]); fib.push(cv); g.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 24, 0.06, 6), fibM)); });
  const labs = [['HAIR CELLS', '#ff9ab0', [0.5, -1.4, 2.2], [0.5, -4.6, 2.6]], ['BRISTLES', '#ffe9b8', [0.0, -0.0, 0.0], [0.0, 2.3, 0.4]]].map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.45 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [0, -1, 0], keyI: 7, keyPos: [-4, 8, 9], rim: '#ffb59a', rimI: 7, hemi: 0.12 });
  const d = new THREE.Object3D();
  const update = (t) => {
    const sway = P(p, 'sway', 0), bend = lerp(P(p, 'bend0', 0), P(p, 'bend1', 0), ease(seg(t, 0, 0.6)));
    const deadF = lerp(P(p, 'dead0', 0), P(p, 'dead1', 0), ease(seg(t, 0.1, 0.7))), fire = P(p, 'fire', 0);
    cells.forEach((o, i) => {
      const gone = o.dead < deadF, hit = bend * (0.55 + 0.45 * rnd(i + 0.2));
      o.body.material = gone ? deadM : cellM;
      o.body.scale.y = gone ? 0.75 : 1;
      const w = sway * 0.28 * Math.sin(t * 26 + o.x * 0.9) * (1 - hit * 0.7);
      o.bris.forEach((q, j) => {
        q.b.material = gone ? brokenM : ciliaM;
        const flop = (gone ? 1 : hit) * (0.9 + 0.8 * rnd(i * 31 + j)), dir = rnd(i * 13 + j) - 0.5;
        q.b.rotation.set(flop * 0.5 * dir, 0, w + q.s * flop * 0.9 + flop * 0.4 * dir);
        q.b.scale.y = gone && rnd(i * 7 + j + 0.5) < 0.6 ? 0.35 : 1;
      });
      cellM.emissiveIntensity = fire * 0.35 * (0.5 + 0.5 * Math.sin(t * 40));
      for (let s = 0; s < 3; s++) {
        const idx = i * 3 + s, rate = gone ? 0 : (fire ? 1.3 + rnd(idx) : sway ? 0.9 : 0);
        const u = ((rnd(idx + 0.7) + t * rate) % 1), on = rate > 0 && (fire ? rnd(Math.floor(rnd(idx) * 9 + t * rate) + idx) > 0.3 : true);
        fib[i].getPointAt(u, d.position); d.scale.setScalar(on ? 1 : 0.001); d.updateMatrix(); sparks.setMatrixAt(idx, d.matrix);
      }
    });
    sparks.instanceMatrix.needsUpdate = true;
    ciliaM.emissiveIntensity = 0.15 + sway * 0.25 + fire * 0.6 * (0.5 + 0.5 * Math.sin(t * 55));
    labs.forEach((o, i) => o.l.userData.place(o.a, o.b, P(p, 'labels', 0) ? seg(t, 0.12 + i * 0.15, 0.26 + i * 0.15) : 0));
    orbit(camera, p, t, { az0: 0.35, az1: 0.25, el0: 0.35, el1: 0.3, dist0: 27, dist1: 24, ty0: -1, ty1: -1 });
  };
  return done(scene, camera, update);
}

// ---------- 4: foam earplug in the ear canal ----------
// params: plug0/plug1 (0 = out of the canal, 1 = fully in), waves, labels
function plug(p) {
  const { scene, camera } = setup();
  const g = new THREE.Group(); scene.add(g);
  const canal = path3([[-7.5, 0.3, 0], [-5, 0.5, 0], [-1, 0.1, 0], [3, -0.2, 0], [5.2, -0.1, 0]]);
  const rf = (u) => 1.0 - u * 0.15 + 0.08 * Math.sin(u * 9);
  const tubeG = organicTube(canal, 1.25, 200, 56, rf);
  g.add(new THREE.Mesh(tubeG, glassMat('#ffc8b0', { edge: 0.5, core: 0.02, power: 2.6 })));
  g.add(new THREE.Mesh(tubeG, rim(flesh('#c98f80', 3, { side: THREE.BackSide, clearcoat: 0.8, transparent: true, opacity: 0.4, depthWrite: false }), '#ffc8b0', 0.15, 2.5)));
  // eardrum at the far end
  const drumM = rim(wet('#f6dcd0', { transparent: true, opacity: 0.85 }), '#ffd8c8', 0.5, 2.2);
  const drum = new THREE.Mesh(new THREE.SphereGeometry(1.2, 48, 24, 0, Math.PI * 2, 0, 0.5), drumM); drum.rotation.z = Math.PI / 2; drum.position.set(5.6, -0.1, 0); drum.scale.set(1, 1, 1); g.add(drum);
  // foam plug: a squashy cylinder with pores
  const pc = document.createElement('canvas'); pc.width = pc.height = 512; const x = pc.getContext('2d');
  x.fillStyle = '#ff9a2a'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${120 + rnd(i) * 60},50,0,${0.25 + rnd(i + 0.5) * 0.3})`; x.beginPath(); x.arc(rnd(i + 0.1) * 512, rnd(i + 0.2) * 512, 1 + rnd(i + 0.3) * 4, 0, 7); x.fill(); }
  const pt = new THREE.CanvasTexture(pc); pt.colorSpace = THREE.SRGBColorSpace; pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(2, 1);
  const plugM = new THREE.MeshPhysicalMaterial({ map: pt, roughness: 0.85, bumpMap: pt, bumpScale: 2, sheen: 0.6, sheenColor: new THREE.Color('#ffd0a0') });
  const plugG = new THREE.LatheGeometry(Array.from({ length: 30 }, (_, i) => { const u = i / 29; return new THREE.Vector2(1.0 * Math.sin(Math.min(1, u * 1.15) * Math.PI / 2) ** 0.4 * Math.sin(Math.min(1, (1 - u) * 8) * Math.PI / 2) ** 0.5 * (1 - 0.05 * u) + 0.001, u * 3.6); }), 64);
  plugG.rotateZ(Math.PI / 2);
  const pl = new THREE.Mesh(plugG, plugM); g.add(pl);
  const waveM = new THREE.MeshBasicMaterial({ color: '#9fe0ff', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const waves = Array.from({ length: 7 }, () => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 8, 48), waveM.clone()); m.rotation.y = Math.PI / 2; g.add(m); return m; });
  const labs = [['FOAM EARPLUG', '#ffb04a', [-2.6, 0.9, 0], [-2.6, 3.4, 0.4]], ['EARDRUM', '#ffb3a0', [5.5, -1.0, 0], [4.6, -3.4, 0.4]]].map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.5 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [0, 0, 0], keyI: 8, keyPos: [-4, 7, 10], rim: '#ffb59a', rimI: 8, hemi: 0.14 });
  const update = (t) => {
    const k = lerp(P(p, 'plug0', 1), P(p, 'plug1', 1), ease(seg(t, 0, 0.5)));
    const tip = lerp(-12, -0.5, k); pl.position.set(tip, 0.15, 0);
    pl.scale.set(1, lerp(1.5, 1.1, clamp01((tip + 6) / 5)), lerp(1.5, 1.1, clamp01((tip + 6) / 5)));
    waves.forEach((m, i) => {
      const u = (t * 0.9 + i / waves.length) % 1, xw = -7.5 + u * 12.9;
      const past = clamp01((xw - (tip - 3.6)) / 3.6) * (k > 0.6 ? 1 : 0);
      m.position.set(xw, canal.getPointAt(clamp01((xw + 7.5) / 12.7)).y, 0); m.scale.setScalar(1.25 * rf(clamp01((xw + 7.5) / 12.7)));
      m.material.opacity = P(p, 'waves', 1) * 0.6 * (1 - u * 0.3) * (1 - 0.85 * past);
    });
    drum.position.x = 5.6 + 0.04 * Math.sin(t * 50) * (k > 0.6 ? 0.15 : 1);
    labs.forEach((o, i) => o.l.userData.place(o.a, o.b, P(p, 'labels', 0) ? seg(t, 0.15 + i * 0.15, 0.3 + i * 0.15) : 0));
    orbit(camera, p, t, { az0: 0.45, az1: 0.32, el0: 0.18, el1: 0.12, dist0: 37, dist1: 34, tx0: 0.8, tx1: 0.8 });
  };
  return done(scene, camera, update);
}

run({ concert, cochlea, hairs, plug });
