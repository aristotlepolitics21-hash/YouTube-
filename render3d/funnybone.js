// "Why does hitting your funny bone feel so weird?" — an arm (bent at the elbow, thumb up) that
// turns x-ray to show the humerus, radius, ulna and the yellow ulnar nerve running behind the
// elbow into the ring and pinky fingers; a table corner hits it; a cross-section of the groove.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, cutaway, smooth, ellipse, slab, band,
  flow, label, path3, wet, glowMat, boneMat, skinMat, flesh, C,
} from './lib_body.js';
import { run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const capsuleBetween = (a, b, r, mat) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len), 12, 32), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
};

// Nerve route: shoulder -> inner upper arm -> behind the inner elbow knob -> under the forearm -> ring + pinky
const NERVE = path3([[0.3, 8.5, -0.5], [0.15, 5, -0.62], [-0.15, 2, -0.72], [-0.55, 0.45, -0.82], [-0.45, -0.25, -0.62], [0.6, -0.6, -0.42], [3.0, -0.55, -0.32], [5.6, -0.6, -0.3], [7.2, -0.75, -0.3]]);
const PINKY = path3([[7.2, -0.75, -0.3], [8.4, -0.9, -0.3], [9.4, -0.95, -0.2], [10.3, -1.15, 0.0]]);
const RING = path3([[7.2, -0.75, -0.3], [8.4, -0.45, -0.3], [9.6, -0.42, -0.2], [10.6, -0.55, 0.05]]);

function arm({ xray = 0 } = {}) {
  const g = new THREE.Group(), parts = {};
  const skin = skinMat('#c98f74'); skin.transparent = true; skin.depthWrite = true; parts.skin = skin;
  const add = (m, name) => { g.add(m); if (name) parts[name] = m; m.castShadow = true; return m; };
  // skin: upper arm, forearm, elbow ball, palm, fingers (index top -> pinky bottom), thumb
  add(capsuleBetween([0.2, 9, 0], [0, 0.2, 0], 1.15, skin));
  add(capsuleBetween([0, 0, 0], [6.6, -0.1, 0], 0.92, skin));
  add(new THREE.Mesh(new THREE.SphereGeometry(1.12, 48, 32), skin));
  const palm = add(new THREE.Mesh(new RoundedBoxGeometry(2.4, 2.1, 0.85, 6, 0.38), skin)); palm.position.set(7.7, -0.05, -0.05);
  parts.fingers = [];
  [[0.72, 2.2], [0.24, 2.4], [-0.24, 2.25], [-0.7, 1.85]].forEach(([y, len], i) => {
    const f = add(capsuleBetween([8.8, y, -0.05], [8.8 + len, y - 0.15 - i * 0.05, 0.25 + i * 0.05], 0.22, skin)); parts.fingers.push(f);
  });
  add(capsuleBetween([7.4, 0.95, 0.25], [8.6, 1.65, 0.55], 0.25, skin));
  // bones
  const bone = boneMat(); bone.emissive = new THREE.Color('#ffb040'); bone.emissiveIntensity = 0;
  parts.humerus = add(capsuleBetween([0.2, 8.6, 0], [0, 0.6, 0], 0.36, bone));
  const knob = add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), bone)); knob.position.set(0, 0.35, -0.48); // inner elbow knob (medial epicondyle)
  add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), bone)).position.set(0.05, 0.2, 0.1);
  const ul = add(capsuleBetween([-0.45, -0.1, -0.2], [6.3, -0.55, -0.22], 0.2, bone)); // ulna (pinky side, makes the elbow point)
  add(capsuleBetween([0.6, 0.25, 0.25], [6.3, 0.25, 0.2], 0.18, bone)); // radius
  // nerve + branches
  const nerveM = wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.25 }); parts.nerveM = nerveM;
  add(new THREE.Mesh(new THREE.TubeGeometry(NERVE, 200, 0.12, 12), nerveM));
  add(new THREE.Mesh(new THREE.TubeGeometry(PINKY, 40, 0.07, 8), nerveM)); add(new THREE.Mesh(new THREE.TubeGeometry(RING, 40, 0.07, 8), nerveM));
  parts.bone = bone;
  g.userData = parts;
  return g;
}

function setXray(parts, k) {
  parts.skin.opacity = lerp(1, 0.18, k); parts.skin.depthWrite = k < 0.5;
}

// 1 — the arm. params: xray0/xray1, pulse (signal 0..1 along the nerve, p0/p1), zap (fingers glow), hitAt, humerus, labels
function armScene(p) {
  const { scene, camera } = setup({ top: '#16101a' });
  const a = arm(); scene.add(a); const parts = a.userData;
  const table = new THREE.Mesh(new RoundedBoxGeometry(14, 1.2, 8, 4, 0.08), new THREE.MeshPhysicalMaterial({ color: '#6a4a33', roughness: 0.4, clearcoat: 0.6 }));
  table.visible = P(p, 'hitAt', -1) >= 0; scene.add(table);
  const spark = new THREE.PointLight('#ffe066', 0, 8, 1.5); spark.position.set(-0.7, 0.3, -1.2); scene.add(spark);
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 16), glowMat('#fff3a0', 2)); scene.add(pulse);
  const tips = [PINKY, RING].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), glowMat('#fff3a0', 2)); scene.add(m); return m; });
  const zapL = new THREE.PointLight('#ffd84a', 0, 6, 1.5); zapL.position.set(10, -0.8, 0.8); scene.add(zapL);
  const labs = { nerve: label('ULNAR NERVE', { color: C.nerve, size: 0.6 }), hum: label('HUMERUS', { color: '#ffb040', size: 0.6 }) };
  Object.values(labs).forEach((l) => scene.add(l));
  studio(scene, { target: [3, 1, 0], keyI: 16, keyPos: [-4, 9, 10], rim: '#7fb8ff' });
  const q = new THREE.Vector3();
  const update = (t) => {
    setXray(parts, lerp(P(p, 'xray0', 0), P(p, 'xray1', 0), ease(seg(t, 0, 0.4))));
    // the table edge slides in and hits the inner elbow
    const hit = P(p, 'hitAt', -1), k = hit >= 0 ? clamp01(t / hit) : 0, after = hit >= 0 ? seg(t, hit, hit + 0.15) : 0;
    table.position.set(-0.9, lerp(-5, -1.5, k * k) - 0.15 * (1 - after) * (t > hit ? 1 : 0), -4.5);
    a.position.y = hit >= 0 && t > hit ? 0.08 * Math.sin((t - hit) * 60) * (1 - after) : 0;
    const flash = hit >= 0 && t > hit ? Math.max(0, 1 - (t - hit) * 4) : 0;
    spark.intensity = flash * 40;
    // signal travels down the nerve then splits into ring + pinky
    const pu = lerp(P(p, 'p0', -1), P(p, 'p1', -1), t);
    pulse.visible = pu >= 0 && pu <= 1; if (pulse.visible) NERVE.getPointAt(pu, q), pulse.position.copy(q);
    const fin = clamp01(pu - 1) * 4 + P(p, 'zap', 0) * (0.5 + 0.5 * Math.sin(t * 40));
    tips.forEach((m, i) => { const u = clamp01(pu - 1) * 4; m.visible = u > 0 && u < 1; if (m.visible) [PINKY, RING][i].getPointAt(u, q), m.position.copy(q); });
    parts.nerveM.emissiveIntensity = 0.25 + P(p, 'glow', 0) * (0.8 + 0.3 * Math.sin(t * 30)) + flash * 2;
    zapL.intensity = Math.min(1, fin) * 12;
    parts.fingers.slice(2).forEach((f) => { f.material = parts.skin; });
    parts.bone.emissiveIntensity = P(p, 'humerus', 0) * (0.6 + 0.2 * Math.sin(t * 20));
    labs.nerve.userData.place(new THREE.Vector3(3.0, -0.55, -0.32), new THREE.Vector3(2.4, -3.2, 0.5), P(p, 'labelNerve', 0) ? seg(t, 0.15, 0.3) : 0);
    labs.hum.userData.place(new THREE.Vector3(0.1, 5, 0.3), new THREE.Vector3(1.8, 6.5, 1), P(p, 'humerus', 0) ? seg(t, 0.2, 0.35) : 0);
    orbit(camera, p, t, { az0: -0.7, az1: -0.55, el0: 0.15, el1: 0.1, dist0: 42, dist1: 38, tx0: 4.6, tx1: 4.6, ty0: 2.6, ty1: 2.6 });
  };
  // a glowing overlay on the ring + pinky when zapped
  const zapM = glowMat('#ffd84a', 0.9); zapM.transparent = true; zapM.opacity = 0.55;
  const glowFingers = parts.fingers.slice(2).map((f) => { const m = f.clone(); m.material = zapM; m.scale.setScalar(1.08); scene.add(m); return m; });
  const upd2 = (t) => { update(t); const z = P(p, 'zap', 0) ? (0.5 + 0.5 * Math.sin(t * 40)) : clamp01((lerp(P(p, 'p0', -1), P(p, 'p1', -1), t) - 1) * 4); glowFingers.forEach((m) => { m.visible = z > 0.05; }); zapM.opacity = 0.25 + 0.45 * z; };
  return done(scene, camera, upd2);
}

// 2 — cross-section through the inner elbow: bone with a groove, the nerve in it, only skin + fat on top.
// params: hitAt, labels
function groove(p) {
  const { scene, camera } = setup({ top: '#16101a' });
  const outline = smooth([[-4.2, -3.2], [-4.4, 0.5], [-3.2, 2.6], [-0.6, 3.1], [1.5, 2.9], [3.6, 2.1], [4.3, -0.3], [3.8, -3.0], [0, -3.6]]);
  const bone = smooth([[-3.2, -2.0], [-3.4, 0.6], [-2.2, 1.8], [-0.95, 1.85], [-0.75, 1.1], [-0.2, 0.75], [0.35, 1.1], [0.6, 1.95], [2.0, 1.7], [3.0, 0.3], [2.6, -1.9], [0, -2.7]]);
  const layers = [
    { name: 'muscle', outline: smooth([[-4.0, -3.0], [3.6, -2.8], [3.9, -0.6], [3.2, 1.0], [2.6, -1.0], [-3.0, -1.6], [-3.9, 0.0]]), h: 0.1, color: '#a8343c' },
    { name: 'bone', outline: bone, h: 0.2, color: '#c9b48e' },
    { name: 'marrow', outline: ellipse(0.0, -0.6, 1.6, 0.9, 48, 0.06, 2), h: 0.24, color: '#d9a066' },
    { name: 'fat', outline: band([[-3.4, 2.35], [-1.6, 2.65], [-0.2, 2.45], [1.4, 2.55], [3.2, 1.95]], 0.5), h: 0.14, color: C.fat },
  ];
  const cut = cutaway(outline, layers, { depth: 2.4 }); scene.add(cut.group);
  const nerve = new THREE.Group(); nerve.position.set(-0.2, 1.55, 0.18); scene.add(nerve);
  const nM = wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.3 });
  nerve.add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 48), nM)).rotation.x = Math.PI / 2;
  for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.36, 16), wet('#e8c040')); const a = i / 7 * Math.PI * 2; f.position.set(Math.cos(a) * 0.32 * (i ? 1 : 0), Math.sin(a) * 0.32 * (i ? 1 : 0), 0); f.rotation.x = Math.PI / 2; nerve.add(f); }
  const blk = new THREE.Mesh(new RoundedBoxGeometry(4, 1.2, 3, 4, 0.1), new THREE.MeshPhysicalMaterial({ color: '#6a4a33', roughness: 0.4, clearcoat: 0.6 })); scene.add(blk);
  const flash = new THREE.PointLight('#ffe066', 0, 8, 1.5); flash.position.set(-0.2, 1.6, 2); scene.add(flash);
  const labs = [['ULNAR NERVE', C.nerve, [-0.2, 1.55, 0.4], [0.4, 4.4, 0.8]], ['SKIN + FAT', '#ffd8c0', [-2.5, 2.7, 0.3], [-0.6, 5.5, 0.8]], ['BONE', '#e8dcc0', [1.5, 0.0, 0.3], [1.0, -4.6, 0.8]]]
    .map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.5 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [0, 0.5, 0], keyI: 14, keyPos: [-4, 8, 10] });
  const update = (t) => {
    const hit = P(p, 'hitAt', -1), k = hit >= 0 ? clamp01(t / hit) : 0;
    blk.visible = hit >= 0; blk.position.set(-0.2, lerp(9, 3.7, k * k), 0.6);
    const fl = hit >= 0 && t > hit ? Math.max(0, 1 - (t - hit) * 3) : 0;
    nerve.scale.set(1 + 0.15 * fl, 1 - 0.3 * fl, 1); nM.emissiveIntensity = 0.3 + fl * 2.5 + P(p, 'glow', 0) * 0.6;
    flash.intensity = fl * 40;
    labs.forEach((o, i) => o.l.userData.place(o.a, new THREE.Vector3(o.a.x, o.b.y, o.b.z), P(p, 'labels', 0) ? seg(t, 0.1 + i * 0.15, 0.22 + i * 0.15) : 0));
    orbit(camera, p, t, { az0: 0.3, az1: 0.15, el0: 0.15, el1: 0.1, dist0: 26, dist1: 22, ty0: 0.6, ty1: 0.6 });
  };
  return done(scene, camera, update);
}

run({ arm: armScene, groove });
