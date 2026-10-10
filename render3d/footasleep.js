// "Why does your foot fall asleep?" — crossed legs in x-ray: the top knee presses on the nerve
// that wraps around the outside of the bottom knee; a close-up of that nerve bundle (fascicles,
// axons, the tiny vessels that feed it) getting squashed so signals stop; release, then chaotic
// firing; and the skin of the foot sparkling with "pins and needles".
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, label, path3, wet, glowMat, flesh,
  skinMat, rim, glassMat, C,
} from './lib_body.js';
import { organicTube } from './lib3d.js';
import { run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const capsule = (a, b, r, mat) => {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), len = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len), 16, 40), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return m;
};

// A leg, seated: thigh along +x (hip at origin), knee at x=7, shin down to the ankle, foot forward.
// The common peroneal nerve runs down the back of the thigh and wraps round the outside of the knee.
const KNEE = new THREE.Vector3(7, 0, 0), ANKLE = new THREE.Vector3(7.6, -7.2, 0);
const NERVE = path3([[0.0, -0.4, -0.4], [3.5, -0.6, -0.45], [6.0, -0.8, 0.25], [6.85, -1.1, 0.92], [7.2, -2.2, 0.95], [7.5, -4.6, 0.72], [7.7, -6.7, 0.55], [8.4, -7.5, 0.4], [10.0, -7.75, 0.1]]);
const LEGPATH = path3([[-1, 0.05, 0], [3.5, 0.05, 0], [6.2, -0.05, 0], [7.05, -0.75, 0], [7.25, -2.2, 0], [7.5, -5.0, 0], [7.65, -7.0, 0]]);
const legR = (u) => { // thigh -> knee -> calf bulge -> ankle
  const k = THREE.MathUtils.smoothstep;
  return lerp(1.5, 1.12, k(u, 0.1, 0.5)) + 0.18 * Math.exp(-((u - 0.68) ** 2) / 0.006) - 0.48 * k(u, 0.72, 1.0) - 0.06 * Math.exp(-((u - 0.52) ** 2) / 0.002);
};
function leg({ xray = true, thighOnly = false } = {}) {
  const g = new THREE.Group(), parts = {};
  const skin = skinMat('#c98f74', 0.55); skin.transparent = true; parts.skin = skin;
  const add = (m) => { m.castShadow = true; g.add(m); return m; };
  const path = thighOnly ? path3([[-1, 0.05, 0], [3.5, 0.05, 0], [6.2, -0.05, 0], [7.05, -0.75, 0], [7.25, -2.6, 0]]) : LEGPATH;
  const limb = organicTube(path, 1, 360, 96, (u, a) => (thighOnly ? lerp(1.5, 1.1, THREE.MathUtils.smoothstep(u, 0.2, 0.75)) : legR(u)) * (1 + 0.06 * Math.cos(a * Math.PI * 4)), false);
  add(new THREE.Mesh(limb, skin));
  for (const e of thighOnly ? [path.getPointAt(1)] : []) { const c = add(new THREE.Mesh(new THREE.SphereGeometry(1.08, 48, 32), skin)); c.position.copy(e); }
  if (!thighOnly) {
    add(new THREE.Mesh(new THREE.SphereGeometry(0.66, 48, 32), skin)).position.set(7.65, -7.05, 0);
    const footPath = path3([[7.35, -7.55, 0], [8.4, -7.85, 0], [9.9, -7.95, 0], [10.9, -7.9, 0]]);
    const footG = organicTube(footPath, 1, 160, 64, (u) => lerp(0.95, 0.62, u) * (u > 0.9 ? Math.sqrt(Math.max(0.05, 1 - ((u - 0.9) / 0.1) ** 2)) : 1) * (u < 0.08 ? Math.sqrt(Math.max(0.2, u / 0.08)) : 1), false);
    footG.translate(0, 7.8, 0); footG.scale(1, 0.72, 1.15); footG.translate(0, -7.8, 0);
    const foot = add(new THREE.Mesh(footG, skin)); parts.foot = foot;
    for (let i = 0; i < 5; i++) { const toe = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.16 - i * 0.015, 0.35, 8, 16), skin)); toe.rotation.z = -Math.PI / 2 + 0.1; toe.position.set(11.05 - i * 0.05, -7.88, -0.42 + i * 0.22); }
  }
  const bone = new THREE.MeshPhysicalMaterial({ color: '#e7d7b8', roughness: 0.5, clearcoat: 0.4, emissive: '#9fc8ff', emissiveIntensity: 0.08 }); parts.bone = bone;
  add(capsule([0.0, 0, -0.1], [6.7, -0.1, -0.1], 0.32, bone));            // femur
  add(new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 24), bone)).position.set(6.95, -0.35, -0.1);
  if (!thighOnly) {
    add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 24), bone)).position.set(7.45, -0.4, 0.05); // kneecap
    add(capsule([7.0, -0.95, -0.15], [7.6, -6.9, -0.15], 0.3, bone));     // tibia
    add(capsule([7.15, -1.1, 0.7], [7.75, -6.85, 0.5], 0.13, bone));      // fibula (outside of the leg)
    add(new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 16), bone)).position.set(7.15, -1.15, 0.72);
    for (let i = 0; i < 5; i++) add(capsule([8.2, -7.75, -0.45 + i * 0.22], [10.7, -7.95, -0.45 + i * 0.22], 0.08, bone));
    const nerveM = wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.25 }); parts.nerveM = nerveM;
    add(new THREE.Mesh(new THREE.TubeGeometry(NERVE, 260, 0.15, 12), nerveM));
    for (let i = 0; i < 4; i++) add(new THREE.Mesh(new THREE.TubeGeometry(path3([[10.0, -7.75, 0.1], [10.6, -7.7, 0.3 - i * 0.25], [11.1, -7.78, 0.4 - i * 0.3]]), 20, 0.05, 6), nerveM));
  }
  g.userData = parts;
  parts.setXray = (k) => { skin.opacity = lerp(1, 0.2, k); skin.depthWrite = k < 0.5; };
  parts.setXray(xray ? 1 : 0);
  return g;
}

// 1 — crossed legs. params: xray0/xray1, squeeze0/squeeze1, flow ('up' sensory signals), block, numb, fire, labels, cam
function legs(p) {
  const { scene, camera } = setup();
  const bottom = leg(); scene.add(bottom); const B = bottom.userData;
  const top = leg({ xray: false }); scene.add(top); top.userData.skin.opacity = 0.95;
  top.traverse((o) => { if (o.isMesh && o.material !== top.userData.skin) o.visible = false; });
  // the top leg crosses over: its back-of-knee rests on the outside of the bottom knee
  top.rotation.set(0.0, 0.34, -0.06); top.position.set(0.0, 2.15, 3.0);
  const squeezeM = glowMat('#ff2a2a', 0);
  const hot = new THREE.Mesh(new THREE.SphereGeometry(0.55, 32, 24), squeezeM); hot.position.copy(NERVE.getPointAt(0.42)); scene.add(hot);
  hot.material.transparent = true; hot.material.opacity = 0.6;
  const n = 7, pulses = Array.from({ length: n }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), glowMat('#fff3a0', 2.4)); scene.add(m); return m; });
  const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 10, 8), glowMat('#fff8c0', 2.6), 90); sparks.frustumCulled = false; scene.add(sparks);
  const labs = [['NERVE', C.nerve, 0.6, [-1.6, 0.4]], ['PRESSURE', '#ff6a6a', 0.42, [1.5, 2.2]]].map(([s, c, u, off]) => { const l = label(s, { color: c, size: 0.42 }); scene.add(l); return { l, u, off }; });
  studio(scene, { target: [7, -3, 0], keyI: 12, keyPos: [-2, 8, 14], rim: '#ffb59a', rimI: 8 });
  const d = new THREE.Object3D(), Q = new THREE.Vector3();
  const update = (t) => {
    B.setXray(lerp(P(p, 'xray0', 1), P(p, 'xray1', 1), ease(seg(t, 0, 0.4))));
    const sq = lerp(P(p, 'squeeze0', 0), P(p, 'squeeze1', 0), ease(t));
    top.position.y = 1.9 - 0.25 * sq; top.visible = sq > 0.01 || !!P(p, 'showTop', 1);
    squeezeM.emissiveIntensity = sq * (1.0 + 0.4 * Math.sin(t * 25)); hot.scale.set(1, 1, 1).multiplyScalar(0.6 + sq * 0.6); hot.visible = sq > 0.05;
    // sensory signals travel up from the foot (u from 1 to 0); blocked ones stop at the squeeze point
    const block = P(p, 'block', 0), flow = P(p, 'flow', 0);
    pulses.forEach((m, i) => {
      let u = 1 - ((t * 0.9 + i / n) % 1);
      if (block && u < 0.44) { u = 0.44 + 0.02 * Math.sin(t * 30 + i); m.material.emissiveIntensity = 0.6; } else m.material.emissiveIntensity = 2.4;
      m.visible = !!flow; NERVE.getPointAt(clamp01(u), Q); m.position.copy(Q);
    });
    const fire = P(p, 'fire', 0);
    for (let i = 0; i < 90; i++) {
      const u = 0.42 + rnd(i) * 0.58, on = fire && rnd(i + Math.floor(t * 20) * 0.37) < 0.3;
      NERVE.getPointAt(u, Q); d.position.copy(Q).add(new THREE.Vector3((rnd(i + 0.2) - 0.5) * 0.5, (rnd(i + 0.4) - 0.5) * 0.5, (rnd(i + 0.6) - 0.5) * 0.5));
      d.scale.setScalar(on ? 0.6 + rnd(i + 0.8) : 0.001); d.updateMatrix(); sparks.setMatrixAt(i, d.matrix);
    }
    sparks.instanceMatrix.needsUpdate = true;
    const numb = P(p, 'numb', 0) * seg(t, 0, 0.5);
    B.nerveM.color.set(C.nerve).lerp(new THREE.Color('#6a6a7a'), numb * 0.7); B.nerveM.emissiveIntensity = 0.25 * (1 - numb) + (fire ? 0.6 + 0.4 * Math.sin(t * 50) : 0);
    labs.forEach((o, i) => { const a = NERVE.getPointAt(o.u); o.l.userData.place(a, new THREE.Vector3(a.x + o.off[0], a.y + o.off[1], 2.8), P(p, 'labels', 0) && (i === 0 || sq > 0.3) ? seg(t, 0.1 + i * 0.15, 0.22 + i * 0.15) : 0); });
    orbit(camera, p, t, { az0: 0.6, az1: 0.5, el0: 0.12, el1: 0.08, dist0: 38, dist1: 34, tx0: 6.5, tx1: 6.5, ty0: -3.6, ty1: -3.6 });
  };
  return done(scene, camera, update);
}

// 2 — close-up of the nerve bundle. params: squeeze0/squeeze1, flow, block, fire, wake (blood back), labels, cam
function bundle(p) {
  const { scene, camera } = setup();
  const L = 16, grp = new THREE.Group(); scene.add(grp);
  const sheath = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, L, 96, 160, true), glassMat('#ffe7a0', { edge: 0.22, core: 0.0, power: 3 })); sheath.rotation.z = Math.PI / 2; grp.add(sheath);
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(1.58, 1.58, L, 96, 160, true, -Math.PI / 2, Math.PI), wet('#d9a640', { side: THREE.DoubleSide, transparent: true, opacity: 0.55, clearcoat: 1 })); outer.rotation.z = Math.PI / 2; grp.add(outer);
  const fasM = wet('#cf9628', { clearcoat: 0.6, emissive: '#2a1a00', emissiveIntensity: 0.05 });
  const fas = [[0, 0.5, 0], [0.75, -0.25, 0.1], [-0.7, -0.3, -0.1], [0.1, -0.85, 0.5], [-0.1, 0.0, -0.8]].map(([y, z, s], i) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.45 + s * 0.1, 0.45 + s * 0.1, L, 48, 160), fasM); m.rotation.z = Math.PI / 2; m.userData = { y, z }; grp.add(m); return m;
  });
  // the bundle's own blood vessels running along the surface
  const vesM = wet('#c8202c', { emissive: new THREE.Color('#ff2020'), emissiveIntensity: 0 });
  const ves = Array.from({ length: 4 }, (_, i) => { const a = 0.5 + i * 1.4; const c = path3(Array.from({ length: 9 }, (_, k) => [-L / 2 + k * L / 8, Math.cos(a + 0.15 * Math.sin(k)) * 1.68, Math.sin(a + 0.15 * Math.sin(k)) * 1.68])); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 120, 0.07, 8), vesM); m.userData.c = c; grp.add(m); return m; });
  const press = [1, -1].map((s) => { const m = new THREE.Mesh(new THREE.SphereGeometry(s > 0 ? 2.4 : 2.0, 64, 48), s > 0 ? skinMat('#c98f74', 0.4) : new THREE.MeshPhysicalMaterial({ color: '#a8977a', roughness: 0.7, clearcoat: 0.1, envMapIntensity: 0.3 })); m.scale.set(1.3, 1, 1.3); grp.add(m); return m; });
  // signals: light pulses along fascicles
  const sigM = glowMat('#fff3a0', 2.6);
  const sigs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 12, 8), sigM, 60); sigs.frustumCulled = false; scene.add(sigs);
  const labs = [['BLOOD SUPPLY', '#ff6a6a', [3, 1.2, 1.2], [3.3, 3.4, 1.6]], ['NERVE FIBERS', C.nerve, [-3, 0.5, 0.8], [-3.3, -3.6, 1.6]]].map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.5 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [0, 0, 0], keyI: 5.5, keyPos: [-4, 8, 10], rim: '#ffb59a', rimI: 6, hemi: 0.1 });
  const d = new THREE.Object3D();
  const squash = (x, sq) => 1 - sq * 0.55 * Math.exp(-(x * x) / 4);
  const update = (t) => {
    const sq = lerp(P(p, 'squeeze0', 0), P(p, 'squeeze1', 0), ease(t));
    // squash everything around x = 0 (vertex-free: scale slices via a simple per-mesh y-scale envelope)
    [sheath, outer, ...fas].forEach((m) => {
      const pos = m.geometry.attributes.position; if (!m.userData.base) m.userData.base = Float32Array.from(pos.array);
      const b = m.userData.base;
      for (let i = 0; i < pos.count; i++) { const y = b[i * 3 + 1], x = b[i * 3]; pos.setX(i, x * squash(y, sq)); pos.setZ(i, b[i * 3 + 2] * (1 + sq * 0.25 * Math.exp(-(y * y) / 4))); }
      pos.needsUpdate = true; m.geometry.computeVertexNormals();
      if (m.userData.y !== undefined) m.position.set(0, m.userData.y * squash(0, sq * Math.exp(0)), m.userData.z);
    });
    press.forEach((m, i) => { m.position.y = (i ? -1 : 1) * lerp(i ? 4.4 : 4.8, i ? 2.6 : 2.9, sq); });
    const wake = P(p, 'wake', 0);
    vesM.color.set('#c8202c').lerp(new THREE.Color('#4a2a30'), sq * 0.8); vesM.emissiveIntensity = wake * (0.8 + 0.3 * Math.sin(t * 20));
    ves.forEach((m) => { m.scale.set(1, squash(0, sq * 0.6), 1); });
    const flow = P(p, 'flow', 0), block = P(p, 'block', 0), fire = P(p, 'fire', 0);
    for (let i = 0; i < 60; i++) {
      const f = fas[i % fas.length]; let x;
      if (fire) { x = (rnd(i + Math.floor(t * 18) * 0.13) - 0.5) * L * 0.9; }
      else { x = -L / 2 + ((rnd(i) + t * 0.8) % 1) * L; if (block && x > -0.8) x = -0.8 - rnd(i) * 0.4; }
      const on = flow || fire ? (fire ? rnd(i + Math.floor(t * 24) * 0.21) < 0.55 : 1) : 0;
      d.position.set(x, f.position.y * squash(x, sq) + (rnd(i + 0.5) - 0.5) * 0.4, f.position.z + (rnd(i + 0.7) - 0.5) * 0.4); d.scale.setScalar(on ? (fire ? 0.6 + rnd(i) * 1.2 : 1) : 0.001); d.updateMatrix(); sigs.setMatrixAt(i, d.matrix);
    }
    sigs.instanceMatrix.needsUpdate = true;
    labs.forEach((o, i) => o.l.userData.place(o.a, o.b, P(p, 'labels', 0) ? seg(t, 0.1 + i * 0.15, 0.22 + i * 0.15) : 0));
    orbit(camera, p, t, { az0: 0.5, az1: 0.35, el0: 0.2, el1: 0.15, dist0: 20, dist1: 17 });
  };
  return done(scene, camera, update);
}

// 3 — top of the foot: pins and needles sparkling in the skin. params: numb, tingle0/tingle1, cam
function pins(p) {
  const { scene, camera } = setup();
  const f = leg({ xray: false }); scene.add(f); f.userData.setXray(0.15);
  const skinTop = f.userData.foot;
  const n = 220, sp = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 10, 8), glowMat('#fff6c8', 1.8), n); sp.frustumCulled = false; scene.add(sp);
  const rays = new THREE.InstancedMesh(new THREE.ConeGeometry(0.008, 0.3, 6), glowMat('#ffe48a', 1.4), n); rays.frustumCulled = false; scene.add(rays);
  const blue = new THREE.PointLight('#5fa8ff', 0, 10, 1.4); blue.position.set(9, -5.5, 3); scene.add(blue);
  studio(scene, { target: [8.8, -7.6, 0], keyI: 12, keyPos: [4, 2, 10], rim: '#ffb59a', rimI: 8 });
  const d = new THREE.Object3D();
  const update = (t) => {
    const tg = lerp(P(p, 'tingle0', 0), P(p, 'tingle1', 1), ease(t)), numb = P(p, 'numb', 0);
    f.userData.skin.color.set('#c98f74').lerp(new THREE.Color('#9aa6c8'), numb * 0.45);
    blue.intensity = numb * 8;
    for (let i = 0; i < n; i++) {
      const life = (rnd(i) + t * (1.5 + rnd(i + 0.3) * 2)) % 1, on = rnd(i + 0.6) < tg && life < 0.35;
      const x = 7.6 + rnd(i + 0.1) * 3.3, z = (rnd(i + 0.2) - 0.5) * 1.4, y = -7.42 - (x - 7.6) * 0.06;
      d.position.set(x, y + 0.02, z); d.rotation.set(0, 0, 0); d.scale.setScalar(on ? 1 - life * 2 : 0.001); d.updateMatrix(); sp.setMatrixAt(i, d.matrix);
      d.position.y += 0.25; d.scale.set(on ? 1 : 0.001, on ? 1 - life * 2.5 : 0.001, on ? 1 : 0.001); d.updateMatrix(); rays.setMatrixAt(i, d.matrix);
    }
    sp.instanceMatrix.needsUpdate = true; rays.instanceMatrix.needsUpdate = true;
    orbit(camera, p, t, { az0: 0.35, az1: 0.25, el0: 0.45, el1: 0.4, dist0: 13, dist1: 11, tx0: 8.8, tx1: 8.9, ty0: -7.6, ty1: -7.6 });
  };
  return done(scene, camera, update);
}

run({ legs, bundle, pins });
