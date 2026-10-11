// "Why can't you tickle yourself?" — a fingertip stroking skin while touch sensors fire; a brain
// in a glassy head where the cerebellum sends a "forecast" that cancels the incoming touch signal
// (and fails when someone else does the tickling); the robot-delay experiment; and a rat that
// "laughs" in ultrasonic squeaks when tickled.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, label, path3, wet, glowMat, flesh,
  skinMat, rim, glassMat, skinTexture, poreNormal, fingertip, C,
} from './lib_body.js';
import { brainMesh } from './lib_sci.js';
import { organicTube } from './lib3d.js';
import { run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Fingertip in a group: the tip sits at the group origin and the finger rises away along +x
function pointer(scale = 1, tilt = 0.5, roll = 0) {
  const g = new THREE.Group(), f = fingertip(); f.scale.setScalar(scale);
  f.rotation.set(roll, Math.PI, tilt); g.add(f); return g;
}

// ---------- 1: a fingertip strokes the skin; touch sensors under it light up ----------
// params: who ('self' | 'other'), fire (sensor response 0..1), cam
function touch(p) {
  const { scene, camera } = setup();
  const geo = new THREE.PlaneGeometry(16, 16, 260, 260); geo.rotateX(-Math.PI / 2);
  { const a = geo.attributes.position; for (let i = 0; i < a.count; i++) a.setY(i, 0.03 * n3(a.getX(i) * 0.6, a.getZ(i) * 0.6, 1) + 0.01 * n3(a.getX(i) * 3, a.getZ(i) * 3, 2)); geo.computeVertexNormals(); }
  const map = skinTexture(2048, 7); const nm = poreNormal.clone(); nm.repeat.set(10, 10); nm.needsUpdate = true;
  const skinM = rim(new THREE.MeshPhysicalMaterial({ map, normalMap: nm, normalScale: new THREE.Vector2(0.35, 0.35), roughness: 0.55, clearcoat: 0.12, sheen: 0.35, sheenColor: new THREE.Color('#ffc8b0'), transparent: true, opacity: 0.78, depthWrite: false }), '#8cc6ff', 0.3, 3);
  scene.add(new THREE.Mesh(geo, skinM));
  // nerve endings just under the skin: branching yellow threads with sensor tips
  const nerveM = wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.25, transparent: true, opacity: 0.7 });
  const tips = [];
  for (let k = 0; k < 9; k++) {
    const x0 = -6 + rnd(k) * 12, z0 = -4 + rnd(k + 0.5) * 8;
    const c = path3([[x0 - 3, -0.6, z0 - 1], [x0 - 1, -0.35, z0 - 0.2], [x0, -0.15, z0]]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.035, 6), nerveM));
    const tm = glowMat('#fff3a0', 0.3); const t = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), tm); t.renderOrder = 5; t.position.set(x0, -0.12, z0); scene.add(t); tips.push(t);
  }
  const f = pointer(0.85, -0.5); scene.add(f);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), new THREE.MeshBasicMaterial({ color: '#ffe38a', transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; scene.add(ring);
  studio(scene, { target: [0, 0, 0], keyI: 9, keyPos: [-7, 6, 6], rim: '#ffb59a', rimI: 8, hemi: 0.1 });
  const update = (t) => {
    const other = P(p, 'who', 'self') === 'other', fire = P(p, 'fire', other ? 1 : 0.15);
    // the finger strokes back and forth across the skin
    const sx = 0.9 * Math.sin(t * Math.PI * 2 * 0.9), sz = 0.4 * Math.sin(t * Math.PI * 2 * 1.8);
    f.position.set(sx, 0.12, sz); f.rotation.y = P(p, 'yaw', other ? 4.0 : 0);
    tips.forEach((m) => { const d = Math.hypot(m.position.x - sx, m.position.z - sz); const on = Math.max(0, 1 - d / 3) * fire; m.material.emissiveIntensity = 0.3 + on * (2.5 + Math.sin(t * 40) * 0.8); m.scale.setScalar(1 + on * 0.8); });
    nerveM.emissiveIntensity = 0.25 + fire * 0.6 * (0.6 + 0.4 * Math.sin(t * 30));
    ring.position.set(sx, 0.05, sz); ring.scale.setScalar(0.4 + ((t * 3) % 1) * 2 * fire); ring.material.opacity = 0.5 * fire * (1 - ((t * 3) % 1));
    orbit(camera, p, t, { az0: -0.5, az1: -0.4, el0: 0.22, el1: 0.18, dist0: 13, dist1: 11, ty0: 0.9, ty1: 0.9, tx0: 0.6, tx1: 0.6 });
  };
  return done(scene, camera, update, { aperture: 0.002, maxblur: 0.006 });
}

// ---------- 2: the brain's forecast cancels the touch ----------
// params: mode ('cancel' | 'surprise' | 'predict'), cereb (highlight), labels, cam
function brain(p) {
  const { scene, camera } = setup();
  const head = new THREE.Mesh(new THREE.SphereGeometry(4.2, 64, 48), glassMat('#9fd8ff', { edge: 0.22, core: 0.0, power: 3.0 })); head.scale.set(0.95, 1.05, 1.15); head.position.y = 0.2; scene.add(head);
  const bg = new THREE.SphereGeometry(2.6, 220, 160);
  { const a = bg.attributes.position; for (let i = 0; i < a.count; i++) { const x = a.getX(i), y = a.getY(i), z = a.getZ(i); const sul = 0.085 * Math.exp(-Math.abs(n3(x * 0.65, y * 0.65, z * 0.65)) * 12) + 0.04 * Math.exp(-Math.abs(n3(x * 1.4 + 9, y * 1.4, z * 1.4)) * 14), groove = 0.12 * Math.exp(-(x * x) / 0.03) * (y > -0.8 ? 1 : 0); const k = 1 - sul - groove; a.setXYZ(i, x * k, y * k, z * k); } bg.computeVertexNormals(); }
  const b = new THREE.Mesh(bg, flesh('#e0a2a6', 2, { clearcoat: 0.8, clearcoatRoughness: 0.2, sheen: 0.4, sheenColor: new THREE.Color('#ffd6d6') })); b.scale.set(0.9, 0.78, 1.18); b.position.y = 0.7; scene.add(b);
  const cerM = flesh('#c9727c', 3, { clearcoat: 0.9, emissive: new THREE.Color('#57b8ff'), emissiveIntensity: 0 });
  const cer = new THREE.Mesh(new THREE.SphereGeometry(1.2, 96, 64), cerM); cer.scale.set(1.4, 0.75, 0.9);
  { const a = cer.geometry.attributes.position; for (let i = 0; i < a.count; i++) { const y = a.getY(i), k = 1 - 0.05 * Math.abs(Math.sin(y * 18)); a.setX(i, a.getX(i) * k); a.setZ(i, a.getZ(i) * k); } cer.geometry.computeVertexNormals(); }
  cer.position.set(0, -0.95, -1.95); cer.scale.set(1.35, 0.68, 0.85); scene.add(cer);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.38, 2.2, 32), flesh('#d49aa0', 2)); stem.position.set(0, -2.1, -0.9); stem.rotation.x = 0.3; scene.add(stem);
  // the touch-sensing strip across the top of the brain
  const stripM = glowMat('#ff9a3a', 0); stripM.transparent = true; stripM.opacity = 0.85;
  const strip = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.16, 16, 80, Math.PI * 0.9), stripM); strip.rotation.set(0, Math.PI / 2, Math.PI * 0.05); strip.position.set(0, 0.95, -0.15); scene.add(strip);
  // signal paths: touch comes up the spinal cord (orange); the forecast leaves the cerebellum (blue)
  const touchC = path3([[0.2, -6, -0.4], [0.1, -3.2, -0.6], [0.2, -0.6, -0.3], [1.2, 1.8, 0.3], [1.5, 2.85, 0.2]]);
  const foreC = path3([[0, -0.95, -1.95], [0.8, 0.0, -1.9], [1.5, 1.6, -0.9], [1.5, 2.85, 0.2]]);
  const mk = (c, col) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 14), glowMat(col, 2.6)); scene.add(m); const tr = Array.from({ length: 8 }, (_, i) => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.17 - i * 0.017, 12, 8), glowMat(col, 1.6)); scene.add(s); return s; }); return { m, tr, c }; };
  const sigT = mk(touchC, '#ff9a3a'), sigF = mk(foreC, '#57b8ff');
  const flash = new THREE.PointLight('#ff9a3a', 0, 8, 1.4); flash.position.set(1.6, 2.9, 1.2); scene.add(flash);
  const poof = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), glassMat('#cfe8ff', { edge: 0.9, core: 0.05 })); poof.position.set(1.6, 2.9, 0.2); scene.add(poof);
  const labs = [['CEREBELLUM', '#57b8ff', [0, -0.95, -1.4], [0, -3.4, 1.0]], ['FORECAST', '#57b8ff', [1.4, 1.2, -1.0], [0, 3.9, 1.0]], ['TOUCH', '#ff9a3a', [0.2, -3.6, -0.4], [0, -4.5, 1.0]]]
    .map(([s, c, a, b2]) => { const l = label(s, { color: c, size: 0.45 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b2) }; });
  studio(scene, { target: [0, 0, 0], keyI: 6, keyPos: [-5, 7, 9], rim: '#ffb59a', rimI: 6, hemi: 0.1 });
  const Q = new THREE.Vector3();
  const place = (s, u, on) => { s.m.visible = on && u >= 0 && u <= 1; s.c.getPointAt(clamp01(u), Q); s.m.position.copy(Q); s.tr.forEach((x, i) => { const v = u - (i + 1) * 0.025; x.visible = s.m.visible && v >= 0; s.c.getPointAt(clamp01(v), Q); x.position.copy(Q); }); };
  const update = (t) => {
    const mode = P(p, 'mode', 'cancel');
    const u = seg(t, 0.05, 0.62);
    place(sigT, u, mode !== 'predict');
    place(sigF, mode === 'predict' || mode === 'cancel' ? seg(t, 0.0, 0.55) : -1, mode !== 'surprise');
    const arrived = seg(t, 0.62, 0.7);
    const cancel = mode === 'cancel' && arrived > 0, burst = mode === 'surprise' && arrived > 0;
    poof.visible = cancel; poof.scale.setScalar(0.2 + arrived * 1.4 * (1 + (t - 0.62) * 2)); poof.material.uniforms.c.value.set('#cfe8ff');
    stripM.emissiveIntensity = burst ? 1.2 + 0.8 * Math.sin(t * 40) : cancel ? 0.15 : 0;
    flash.intensity = burst ? 30 * (0.6 + 0.4 * Math.sin(t * 40)) : 0;
    cerM.emissiveIntensity = P(p, 'cereb', 0) * (0.5 + 0.3 * Math.sin(t * 20)) + (mode !== 'surprise' ? 0.3 * (1 - seg(t, 0.3, 0.6)) : 0);
    labs.forEach((o, i) => o.l.userData.place(o.a, new THREE.Vector3(o.a.x, o.b.y, o.b.z), P(p, 'labels', 0) && (i < 2 ? mode !== 'surprise' : mode !== 'predict') ? seg(t, 0.08 + i * 0.12, 0.2 + i * 0.12) : 0));
    orbit(camera, p, t, { az0: 0.9, az1: 0.75, el0: 0.15, el1: 0.1, dist0: 20, dist1: 18, ty0: 0, ty1: 0 });
  };
  return done(scene, camera, update);
}

// ---------- 3: the robot experiment: you move a lever, a robot strokes your palm, with a delay ----------
// params: delay (show the 0.2 s delay and a stronger response), cam
function robot(p) {
  const { scene, camera } = setup();
  const skin = skinMat('#c98f74', 0.4);
  // an upturned palm with fingers
  const palm = new THREE.Mesh(new RoundedBoxGeometry(3.4, 0.9, 3.2, 6, 0.42), skin); palm.position.set(0, -1.5, 0); scene.add(palm);
  [[-1.2, 2.1], [-0.4, 2.4], [0.4, 2.3], [1.15, 1.9]].forEach(([x, len]) => { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.33, len, 12, 24), skin); f.rotation.x = Math.PI / 2; f.position.set(x, -1.45, -1.6 - len / 2); scene.add(f); });
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 1.6, 12, 24), skin); thumb.rotation.set(Math.PI / 2, 0, -0.8); thumb.position.set(-2.2, -1.45, 0.2); scene.add(thumb);
  const wrist = new THREE.Mesh(new THREE.CapsuleGeometry(1.3, 3, 12, 32), skin); wrist.rotation.x = Math.PI / 2; wrist.scale.set(1.2, 1, 0.55); wrist.position.set(0, -1.5, 3.4); scene.add(wrist);
  // robot arm with a soft foam tip
  const metal = new THREE.MeshPhysicalMaterial({ color: '#c9ced6', metalness: 0.7, roughness: 0.25, clearcoat: 0.6 }), dark = new THREE.MeshPhysicalMaterial({ color: '#2a2f38', metalness: 0.4, roughness: 0.35 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 0.8, 48), dark); base.position.set(3.8, -1.9, -1); scene.add(base);
  const j1 = new THREE.Group(); j1.position.set(3.8, -1.5, -1); scene.add(j1);
  const s1 = new THREE.Mesh(new RoundedBoxGeometry(0.6, 3.4, 0.6, 4, 0.2), metal); s1.position.y = 1.7; j1.add(s1);
  const j2 = new THREE.Group(); j2.position.y = 3.4; j1.add(j2);
  j2.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 24), dark));
  const s2 = new THREE.Mesh(new RoundedBoxGeometry(0.5, 3.6, 0.5, 4, 0.18), metal); s2.position.y = 1.8; j2.add(s2);
  const foam = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 24), new THREE.MeshPhysicalMaterial({ color: '#ffd23f', roughness: 0.9, sheen: 1, sheenColor: new THREE.Color('#fff2a0') })); foam.position.y = 3.7; j2.add(foam);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), glowMat('#4dff9a', 2)); led.position.set(0.32, 0.4, 0); j1.add(led);
  const sparkM = glowMat('#fff3a0', 2.4); const sparks = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 10, 8), sparkM, 60); sparks.frustumCulled = false; scene.add(sparks);
  const delayL = label('DELAY: 0.2 SEC', { color: '#ff4b4b', size: 0.55 }); scene.add(delayL);
  studio(scene, { target: [1, -0.5, 0], keyI: 10, keyPos: [-4, 8, 9], rim: '#ffb59a', rimI: 8 });
  const d = new THREE.Object3D(), Q = new THREE.Vector3();
  const update = (t) => {
    const del = P(p, 'delay', 0), lag = del ? 0.12 : 0;
    const ph = (t - lag) * Math.PI * 2 * 1.2;
    j1.rotation.z = 0.55 + 0.12 * Math.sin(ph); j2.rotation.z = 1.75 + 0.2 * Math.sin(ph + 0.6);
    j1.updateMatrixWorld(); foam.getWorldPosition(Q);
    const resp = del ? 1 : 0.25;
    for (let i = 0; i < 60; i++) { const a = rnd(i) * Math.PI * 2, r = 0.3 + rnd(i + 0.3) * 1.2 * resp; const on = rnd(i + Math.floor(t * 20) * 0.31) < 0.5 * resp + 0.1; d.position.set(Q.x + Math.cos(a) * r, -1.0 + rnd(i + 0.5) * 0.6, Q.z + Math.sin(a) * r); d.scale.setScalar(on ? 0.6 + rnd(i) : 0.001); d.updateMatrix(); sparks.setMatrixAt(i, d.matrix); }
    sparks.instanceMatrix.needsUpdate = true;
    led.material.emissive.set(del ? '#ff4b4b' : '#4dff9a');
    delayL.userData.place(new THREE.Vector3(1.2, 3.6, 0.6), new THREE.Vector3(1.2, 4.2, 0.6), del ? seg(t, 0.1, 0.22) : 0);
    orbit(camera, p, t, { az0: 0.35, az1: 0.2, el0: 0.45, el1: 0.38, dist0: 22, dist1: 19, tx0: 1.2, tx1: 1.2, ty0: 0.4, ty1: 0.4 });
  };
  return done(scene, camera, update);
}

// ---------- 4: a rat being tickled squeaks in ultrasound ----------
// params: tickle, cam
function rat(p) {
  const { scene, camera } = setup();
  const fur = new THREE.MeshPhysicalMaterial({ color: '#8d8a86', roughness: 0.8, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color('#e8e2da') });
  const pink = flesh('#e8a0a8', 2, { clearcoat: 0.6 });
  const r = new THREE.Group(); scene.add(r);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), fur); body.scale.set(2.0, 1.05, 1.15); r.add(body);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshPhysicalMaterial({ color: '#e8e2da', roughness: 0.85, sheen: 1, sheenColor: new THREE.Color('#ffffff') })); belly.scale.set(1.6, 0.7, 0.95); belly.position.set(0.1, -0.42, 0.18); r.add(belly);
  const head = new THREE.Group(); head.position.set(2.0, 0.35, 0); r.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.75, 48, 32), fur); skull.scale.set(1.15, 0.9, 0.9); head.add(skull);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 48), fur); snout.rotation.z = -Math.PI / 2; snout.position.set(0.95, -0.08, 0); head.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), pink); nose.position.set(1.48, -0.08, 0); head.add(nose);
  for (const s of [1, -1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), pink); ear.scale.set(1, 0.25, 1); ear.rotation.set(Math.PI / 2 - 0.2, s * 0.3, 0); ear.position.set(-0.15, 0.62, s * 0.48); head.add(ear);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 16), new THREE.MeshPhysicalMaterial({ color: '#0b0b0f', roughness: 0.05, clearcoat: 1 })); eye.position.set(0.45, 0.2, s * 0.42); head.add(eye);
    for (let k = 0; k < 4; k++) { const wsk = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.1, 4), new THREE.MeshBasicMaterial({ color: '#f0f0f0' })); wsk.rotation.set(0, 0, Math.PI / 2 + (k - 1.5) * 0.12); wsk.rotation.y = s * 0.5; wsk.position.set(1.3, -0.05 + (k - 1.5) * 0.04, s * 0.35); head.add(wsk); }
  }
  const tail = new THREE.Mesh(organicTube(path3([[-1.9, -0.2, 0], [-3.2, -0.6, 0.4], [-4.4, -0.3, 1.2], [-5.4, 0.2, 1.4]]), 0.16, 80, 12, (u) => 1 - u * 0.85), pink); r.add(tail);
  for (const [x, z] of [[1.1, 0.55], [1.1, -0.55], [-1.0, 0.6], [-1.0, -0.6]]) { const paw = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), pink); paw.scale.set(1.3, 0.6, 1); paw.position.set(x, -1.0, z); r.add(paw); }
  r.rotation.set(0, 0.35, 0.05);
  const f = pointer(0.42, -0.35, 0); scene.add(f);
  const ringM = new THREE.MeshBasicMaterial({ color: '#7fd8ff', transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const rings = Array.from({ length: 5 }, () => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 8, 64, Math.PI * 0.7), ringM.clone()); scene.add(m); return m; });
  const lab = label('ULTRASONIC "LAUGHS"', { color: '#7fd8ff', size: 0.42 }); scene.add(lab);
  studio(scene, { target: [0.5, 0, 0], keyI: 10, keyPos: [-4, 8, 9], rim: '#ffb59a', rimI: 8 });
  const Q = new THREE.Vector3();
  const update = (t) => {
    const tk = P(p, 'tickle', 1);
    f.position.set(0.4 + 0.35 * Math.sin(t * 25) * tk, -0.95, 1.0); f.rotation.set(0, -1.1, 0);
    r.position.y = 0.06 * Math.sin(t * 40) * tk; head.rotation.z = 0.08 * Math.sin(t * 31) * tk;
    head.updateMatrixWorld(); nose.getWorldPosition(Q);
    rings.forEach((m, i) => { const u = (t * 2.2 + i / 5) % 1; m.visible = tk > 0; m.position.copy(Q).add(new THREE.Vector3(0.2 + u * 1.2, 0, 0.2)); m.rotation.set(0, 0.35, -Math.PI * 0.35); m.scale.setScalar(0.3 + u * 2.2); m.material.opacity = 0.65 * (1 - u); });
    lab.userData.place(new THREE.Vector3(0.9, 2.7, Q.z + 0.5), new THREE.Vector3(0.9, 3.4, Q.z + 0.5), tk && P(p, 'labels', 0) ? seg(t, 0.2, 0.32) : 0);
    orbit(camera, p, t, { az0: 0.15, az1: 0.05, el0: 0.2, el1: 0.15, dist0: 24, dist1: 21, tx0: 0.2, tx1: 0.3, ty0: 0.2, ty1: 0.2 });
  };
  return done(scene, camera, update);
}

run({ touch, brain, robot, rat });
