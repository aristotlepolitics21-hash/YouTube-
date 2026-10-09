// "What happens if you hold in a sneeze?" — sagittal head cutaway: air blasting up the windpipe,
// nose and mouth sealed, pressure waves, the windpipe tearing, air leaking into the neck, and the
// safe version (sneeze into your elbow).
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, orbit, done, setup, studio, headSection, flow, label,
  path3, wet, glowMat, C, neckCutaway, bubbleMat, n3,
} from './lib_body.js';
import { run } from './lib3d.js';

// Air route from the lungs up through the throat, nose and mouth (on the cut face, z just above it)
const UP = [[0.95, -10], [1.0, -6.8], [0.8, -4.2], [0.5, -3.0], [0.45, -1.4], [0.55, 0.0], [1.2, 0.9]];
const NOSE = path3([...UP, [2.4, 1.15], [3.6, 0.65], [4.6, 0.0], [6.5, -0.5]].map(([x, y]) => [x, y, 0.2]));
const MOUTH = path3([...UP.slice(0, 5), [0.9, -0.95], [2.2, -0.82], [3.4, -1.0], [4.4, -1.42], [6.5, -1.7]].map(([x, y]) => [x, y, 0.2]));
const WIDE = { az0: 0.32, az1: 0.26, el0: 0.06, el1: 0.03, dist0: 46, dist1: 42, ty0: -1.8, ty1: -1.6, tx0: 0.4, tx1: 0.5 };
const airMat = () => new THREE.MeshPhysicalMaterial({ color: '#cfefff', emissive: '#7fd0ff', emissiveIntensity: 0.9, roughness: 0.2, transparent: true, opacity: 0.9 });

// Head cutaway with the airway parts ready to glow red under pressure
function head(p, { light = {} } = {}) {
  const { scene, camera } = setup();
  const h = headSection(); scene.add(h.group);
  const airway = ['pharynx', 'trachea', 'nasal', 'mouth', 'frontalSinus'].map((k) => h.parts[k]);
  airway.forEach((m) => { m.material = m.material.clone(); m.material.emissive = new THREE.Color('#ff1a1a'); m.material.emissiveIntensity = 0; });
  const lights = studio(scene, { target: [0.5, -1.5, 0], ...light });
  const glow = (k) => airway.forEach((m) => { m.material.emissiveIntensity = k; });
  return { scene, camera, h, glow, lights };
}

// Red seals over the nostril and lips ("pinch your nose, close your mouth")
function seals(scene) {
  const m = glowMat('#ff2b2b', 1.4);
  const nose = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.75, 6, 16), m); nose.position.set(4.72, -0.12, 0.35); nose.rotation.z = 0.5;
  const lips = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.8, 6, 16), m); lips.position.set(4.45, -1.45, 0.35);
  scene.add(nose, lips);
  return (k) => { const s = ease(clamp01(k)); nose.scale.setScalar(s); lips.scale.setScalar(s); nose.visible = lips.visible = k > 0; };
}

// Droplet cloud leaving the nose and mouth
function spray(scene, n = 260) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 10, 8), airMat(), n);
  m.frustumCulled = false; scene.add(m);
  const d = new THREE.Object3D();
  return (k) => {
    for (let i = 0; i < n; i++) {
      const fromNose = i % 3 !== 0, o = fromNose ? [4.75, -0.1] : [4.5, -1.45];
      const life = clamp01(k * 1.6 - rnd(i) * 0.6), a = (rnd(i + 0.2) - 0.5) * 0.9 - (fromNose ? 0.15 : 0.3), r = life * (3 + rnd(i + 0.4) * 9);
      d.position.set(o[0] + Math.cos(a) * r, o[1] + Math.sin(a) * r - life * life * 1.2, 0.2 + (rnd(i + 0.6) - 0.5) * r * 0.8);
      d.scale.setScalar(life > 0 ? 0.5 + rnd(i + 0.8) * 1.5 : 0); d.updateMatrix(); m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  };
}

// 1 — pressure builds behind a sealed nose and mouth. params: seal (0/1), press0/press1, cam
function build(p) {
  const { scene, camera, glow } = head(p);
  const seal = seals(scene);
  const air = flow(NOSE, 140, { r: 0.07, mat: airMat(), spread: 0.25 }); scene.add(air);
  const update = (t) => {
    const pr = lerp(P(p, 'press0', 0.2), P(p, 'press1', 1), ease(t));
    const sealK = P(p, 'sealAt', -1) >= 0 ? seg(t, P(p, 'sealAt', 0), P(p, 'sealAt', 0) + 0.12) : P(p, 'seal', 1);
    seal(sealK);
    // air crowds below the seal: the stream stops short of the nostril and jitters
    air.userData.update(t, { speed: 0.6 + pr, from: 0.0, to: lerp(1, 0.86, sealK), scale: 1 + pr * 0.6 });
    glow(pr * (1.0 + 0.35 * Math.sin(t * 40)));
    orbit(camera, p, t, WIDE);
  };
  return done(scene, camera, update);
}

// 2 — a normal sneeze: air rushes up and out of the nose and mouth
function blast(p) {
  const { scene, camera, glow } = head(p);
  const a1 = flow(NOSE, 160, { r: 0.07, mat: airMat(), spread: 0.25 }), a2 = flow(MOUTH, 90, { r: 0.07, mat: airMat(), spread: 0.25, seed: 3 });
  scene.add(a1, a2);
  const sp = spray(scene);
  const update = (t) => {
    const k = seg(t, P(p, 'at', 0.15), 1);
    a1.userData.update(t, { speed: 2.2 }); a2.userData.update(t, { speed: 2.2 });
    sp(k); glow(0.15);
    orbit(camera, p, t, { ...WIDE, tx0: 1.5, tx1: 2.0, dist0: 44, dist1: 48 });
  };
  return done(scene, camera, update);
}

// 3 — pressure waves spread from the throat to the sinuses and toward the ears
function waves(p) {
  const { scene, camera, glow, h } = head(p);
  seals(scene)(1);
  const ringM = new THREE.MeshBasicMaterial({ color: '#ff3a3a', transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });
  const rings = Array.from({ length: 5 }, () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 96), ringM.clone()); r.position.set(0.6, -0.8, 0.3); scene.add(r); return r; });
  const labs = [['THROAT', [0.6, -3.2, 0.2], [-2.9, -3.3, 0.6]], ['SINUSES', [3.05, 3.0, 0.2], [2.9, 5.0, 0.6], 0.5], ['EARS', [-1.2, 0.3, 0.2], [-0.6, 2.4, 0.6], 0.6]]
    .map(([s, a, b, size]) => { const l = label(s, { size: size || 0.75 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  const update = (t) => {
    rings.forEach((r, i) => { const u = (t * 2.2 + i / rings.length) % 1; r.scale.setScalar(0.5 + u * 6); r.material.opacity = 0.7 * (1 - u); });
    glow(0.7 + 0.3 * Math.sin(t * 50));
    h.parts.frontalSinus.material.emissiveIntensity = seg(t, P(p, 'sinusAt', 0.3), P(p, 'sinusAt', 0.3) + 0.1) * (1.4 + 0.4 * Math.sin(t * 60));
    labs.forEach((o, i) => o.l.userData.place(o.a, o.b, seg(t, P(p, `l${i}`, [0.05, 0.35, 0.7][i]), P(p, `l${i}`, [0.05, 0.35, 0.7][i]) + 0.12)));
    orbit(camera, p, t, WIDE);
  };
  return done(scene, camera, update);
}

// Windpipe close-up: soft tube with C-shaped cartilage rings; a tear opens and air escapes
function tear(p) {
  const { scene, camera } = setup({ top: '#2a0a10' });
  const g = new THREE.Group(); scene.add(g);
  const wallG = new THREE.CylinderGeometry(1.25, 1.25, 16, 96, 120, true);
  const tube = new THREE.Mesh(wallG, wet('#d4737a', { side: THREE.DoubleSide })); g.add(tube);
  const ringM = wet(C.cartilage, { clearcoat: 0.8 });
  for (let i = 0; i < 15; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.31, 0.13, 12, 64, Math.PI * 1.6), ringM); r.rotation.set(Math.PI / 2, 0, Math.PI * 0.7); r.position.y = -7 + i; g.add(r); }
  const muscle = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 16, 48, 1, true, -Math.PI * 0.2, Math.PI * 0.4), wet('#b0444c', { side: THREE.DoubleSide }));
  muscle.rotation.y = Math.PI; g.add(muscle);
  // the tear: a dark slit on the front wall between two rings, with angry red edges
  const slit = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: '#120204' }));
  slit.position.set(0, 0.5, 1.262); g.add(slit);
  const edge = new THREE.Mesh(new THREE.RingGeometry(1, 1.35, 48), glowMat('#ff2030', 0.9)); edge.position.copy(slit.position).setZ(1.263); g.add(edge);
  const leak = Array.from({ length: 6 }, (_, i) => path3([[0, 0.5, 1.3], [(rnd(i) - 0.5) * 1.5, 0.5 + (rnd(i + 0.4) - 0.5) * 2, 3], [(rnd(i + 1) - 0.5) * 5, 0.5 + (rnd(i + 2) - 0.5) * 5, 6.5]]));
  const bubbles = leak.map((c, i) => { const f = flow(c, 16, { r: 0.07, mat: airMat(), spread: 0.15, seed: i * 7 }); scene.add(f); return f; });
  const back = new THREE.Mesh(new THREE.SphereGeometry(30, 48, 32), wet('#3a0e12', { side: THREE.BackSide })); scene.add(back);
  studio(scene, { target: [0, 0.5, 0], keyPos: [-5, 6, 12], keyI: 14 });
  const alarm = new THREE.PointLight('#ff2020', 0, 12, 1.5); alarm.position.set(0, 0.5, 4); scene.add(alarm);
  const update = (t) => {
    const open = P(p, 'heal', 0) ? 1 - ease(seg(t, 0.1, 0.8)) : ease(seg(t, P(p, 'at', 0.2), P(p, 'at', 0.2) + 0.25));
    slit.scale.set(0.2 * open + 0.001, 0.75 * open + 0.001, 1); edge.scale.copy(slit.scale);
    edge.material.emissive.set(P(p, 'heal', 0) ? '#ff6a6a' : '#ff2030');
    bubbles.forEach((b) => { b.visible = open > 0.15; b.userData.update(t, { speed: 0.9, scale: open }); });
    alarm.intensity = open * (20 + 15 * Math.sin(t * 30)) * (P(p, 'heal', 0) ? 0.3 : 1);
    g.rotation.y = -0.35 + t * 0.25;
    orbit(camera, p, t, { az0: 0.1, az1: -0.05, el0: 0.12, el1: 0.05, dist0: 15, dist1: 11, ty0: 0.5, ty1: 0.5 });
  };
  return done(scene, camera, update);
}

// Neck swelling: air bubbles spread under the skin and the neck puffs out
function swell(p) {
  const { scene, camera, h, glow } = head(p);
  // remember the original shell / face / rim vertices, then push the neck outward
  const meshes = [h.parts.shell, h.parts.face, h.parts.rim].map((m) => ({ m, base: Float32Array.from(m.geometry.attributes.position.array) }));
  const puff = (k) => meshes.forEach(({ m, base }) => {
    const a = m.geometry.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1];
      const w = clamp01((y + 9.6) / 1.5) * clamp01((-3.2 - y) / 1.6), front = x > 0.4 ? 1 : 0.35;
      a.setX(i, x + Math.sign(x - 0.2) * k * 1.3 * w * front * (0.8 + 0.2 * Math.sin(y * 3)));
    }
    a.needsUpdate = true; m.geometry.computeVertexNormals();
  });
  const bubM = new THREE.MeshPhysicalMaterial({ color: '#f3f9ff', roughness: 0.05, transmission: 0.6, thickness: 0.3, clearcoat: 1, transparent: true, opacity: 0.85 });
  const bubs = Array.from({ length: 90 }, (_, i) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.08 + rnd(i) * 0.14, 16, 12), bubM);
    const y = -4 - rnd(i + 0.3) * 5.2, side = rnd(i + 0.5) < 0.7 ? 1 : -1;
    b.userData = { x: side > 0 ? 1.45 + rnd(i + 0.7) * 0.5 : -2.1 + rnd(i + 0.7) * 0.4, y, d: rnd(i + 0.9) };
    scene.add(b); return b;
  });
  const update = (t) => {
    const k = ease(seg(t, P(p, 'from', 0.05), 1)) * P(p, 'amount', 1) + P(p, 'start', 0);
    puff(Math.min(1, k));
    bubs.forEach((b) => { const u = b.userData, on = clamp01(k * 1.5 - u.d * 0.8); b.visible = on > 0; b.scale.setScalar(on); b.position.set(u.x + Math.sign(u.x) * k * 0.9 * (u.x > 0 ? 1 : 0.35), u.y, 0.35); });
    glow(0.35);
    h.parts.trachea.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 30);
    orbit(camera, p, t, { ...WIDE, ty0: -5, ty1: -5.5, tx0: 0.5, tx1: 0.3, dist0: 30, dist1: 26 });
  };
  return done(scene, camera, update);
}

// Soft puff sprite for misty air
function puffTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(200,235,255,0.55)'); g.addColorStop(1, 'rgba(200,235,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t;
}

// The neck in 3D, cut in half: the windpipe tears and air bubbles burst out into the fat under
// the skin, which swells. params: tear0/tear1, swell0/swell1, jet (air stream), camera
function neck(p) {
  const { scene, camera } = setup();
  const nk = neckCutaway(); scene.add(nk.group); const P2 = nk.parts;
  const n = 260, bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 24, 16), bubbleMat('#8fd0ff'), n); bub.frustumCulled = false; scene.add(bub);
  const puffM = new THREE.SpriteMaterial({ map: puffTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const puffs = Array.from({ length: 26 }, () => { const s = new THREE.Sprite(puffM); scene.add(s); return s; });
  const glow = new THREE.PointLight('#6fc3ff', 0, 7, 1.5); scene.add(glow);
  studio(scene, { target: [1.5, 0.5, 0], keyI: 9, keyPos: [-4, 9, 14], rim: '#ffb59a', rimI: 8, rimPos: [10, 5, -6], hemi: 0.15 });
  const d = new THREE.Object3D(), ox = P2.TX + P2.TR + 0.2, oy = 0.6, tp = P2.tearPos;
  const update = (t) => {
    const tear = clamp01(lerp(P(p, 'tear0', 0), P(p, 'tear1', 0), ease(t)));
    const sw = clamp01(lerp(P(p, 'swell0', 0), P(p, 'swell1', 0), ease(t)));
    P2.tear(tear); P2.swell(sw);
    const jet = P(p, 'jet', 0) * tear, spread = Math.max(jet, sw);
    for (let i = 0; i < n; i++) {
      const life = ((rnd(i) + t * (0.35 + rnd(i + 0.2) * 0.4)) % 1), stay = i < n * sw * 0.8;
      const yy = oy + (rnd(i + 0.4) - 0.5) * 2 * (0.4 + 4.5 * spread) * (stay ? 1 : life), fx = P2.fatX(yy);
      const u2 = Math.min(1, life * 1.6), x = stay ? fx + (rnd(i + 0.6) - 0.5) * 1.0 : lerp(tp.x, fx + (rnd(i + 0.6) - 0.5) * 0.9, u2);
      d.position.set(x, yy + (stay ? 0.05 * Math.sin(t * 6 + i) : 0), stay ? 0.12 + rnd(i + 0.8) * 0.35 : lerp(tp.z + 0.1, 0.12 + rnd(i + 0.8) * 0.35, Math.min(1, u2 * 2)));
      const r = (0.05 + rnd(i + 0.9) ** 2 * 0.24) * (1 + sw * 0.9) * (stay || jet > 0 ? 1 : 0) * Math.min(1, life * 5 + (stay ? 1 : 0));
      d.scale.setScalar(r); d.updateMatrix(); bub.setMatrixAt(i, d.matrix);
    }
    bub.instanceMatrix.needsUpdate = true;
    puffs.forEach((s, i) => { const u = (rnd(i) + t * 0.8) % 1; s.visible = false; s.position.set(ox + u * 1.6, oy + (rnd(i + 0.3) - 0.5) * u * 2.2, 0.3); s.scale.setScalar(0.4 + u * 1.4); s.material.opacity = 0.18 * jet * (1 - u); });
    glow.position.set(ox + 0.8, oy, 1.2); glow.intensity = (jet + sw) * 0.8;
    orbit(camera, p, t, { az0: -0.4, az1: -0.28, el0: 0.18, el1: 0.1, dist0: 31, dist1: 28, tx0: 0.4, tx1: 0.6, ty0: 0.4, ty1: 0.5 });
  };
  return done(scene, camera, update);
}

run({ build, blast, waves, tear, swell, neck });
