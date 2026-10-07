// Six 3D shots for "What happens when you get brain freeze?": an ice cream cone,
// the cold roof of the mouth, a blood vessel tightening then widening, a nerve
// signal racing to the brain, and the fix (tongue on the palate).
import * as THREE from 'three';
import { n3, ease, lerp, flesh, displace, organicTube, baseScene, cam, spot, run } from './lib3d.js';

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const seg = (t, a, b) => clamp01((t - a) / (b - a));

// ---------- textures / materials ----------
function waffleBump() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = '#000'; g.lineWidth = 18;
  for (let i = -512; i < 1024; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 512, 512); g.stroke();
    g.beginPath(); g.moveTo(i + 512, 0); g.lineTo(i, 512); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2);
  return t;
}
const iceCreamMat = (color = '#8fe0bd') => new THREE.MeshPhysicalMaterial({
  color, roughness: 0.62, sheen: 0.3, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.6,
  clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 0.5,
});
const frostMat = () => new THREE.MeshPhysicalMaterial({ color: '#e8f8ff', emissive: '#9fdcff', emissiveIntensity: 0.6, roughness: 0.1, transparent: true, opacity: 0.9 });

// ---------- props ----------
function iceCream() {
  const g = new THREE.Group();
  const coneG = new THREE.ConeGeometry(1.35, 4.2, 96, 32, true); coneG.rotateX(Math.PI); coneG.translate(0, -2.1, 0);
  const cone = new THREE.Mesh(coneG, new THREE.MeshPhysicalMaterial({ color: '#d39a52', roughness: 0.75, bumpMap: waffleBump(), bumpScale: 0.8, side: THREE.DoubleSide }));
  cone.castShadow = cone.receiveShadow = true; g.add(cone);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.14, 24, 96), cone.material); rim.rotation.x = Math.PI / 2; g.add(rim);
  const sg = new THREE.SphereGeometry(1.6, 160, 120);
  displace(sg, (v) => 0.16 * n3(v.x * 1.3, v.y * 1.3, v.z * 1.3) + 0.05 * n3(v.x * 4, v.y * 4, v.z * 4) - (v.y < -0.6 ? 0.25 * (1 + 0.6 * Math.sin(Math.atan2(v.z, v.x) * 7)) * (-0.6 - v.y) : 0));
  const scoop = new THREE.Mesh(sg, iceCreamMat()); scoop.position.y = 1.1; scoop.castShadow = scoop.receiveShadow = true; g.add(scoop);
  // drips
  [[0.4, 1.2], [2.2, 0.8], [4.1, 1.0]].forEach(([a, len]) => {
    const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, len, 8, 24), scoop.material);
    d.position.set(Math.cos(a) * 1.38, -0.05 - len / 2, Math.sin(a) * 1.38); g.add(d);
  });
  // chocolate chips
  const chipM = new THREE.MeshPhysicalMaterial({ color: '#3a2014', roughness: 0.4, clearcoat: 0.6 });
  for (let i = 0; i < 26; i++) {
    // golden-spiral points over the upper 80% of the scoop
    const y = 1 - 1.6 * ((i + 0.5) / 26), r = Math.sqrt(1 - y * y), a = i * 2.39996;
    const chip = new THREE.Mesh(new THREE.TetrahedronGeometry(0.12 + (i % 3) * 0.03, 1), chipM);
    chip.position.set(Math.cos(a) * r * 1.62, 1.1 + y * 1.62, Math.sin(a) * r * 1.62); chip.rotation.set(i, i * 2, 0); g.add(chip);
  }
  return g;
}

function frostField(scene, n, spread, center = [0, 0, 0]) {
  const m = frostMat(), arr = [];
  for (let i = 0; i < n; i++) {
    const p = new THREE.Mesh(new THREE.OctahedronGeometry(0.03 + (i % 5) * 0.012, 0), m);
    p.userData = { x: center[0] + (((i * 0.754) % 1) - 0.5) * spread, y: center[1] + (((i * 0.377) % 1) - 0.5) * spread, z: center[2] + (((i * 0.913) % 1) - 0.5) * spread, ph: i * 0.37 };
    scene.add(p); arr.push(p);
  }
  return { arr, mat: m, update(t, scale = 1) {
    for (const p of arr) {
      const u = p.userData;
      p.position.set(u.x + 0.2 * Math.sin(t * 2 + u.ph), u.y - ((t * 0.6 + u.ph) % 1) * 0.6, u.z);
      p.rotation.set(t * 3 + u.ph, t * 2, 0); p.scale.setScalar(scale);
    }
  } };
}

// Roof of the mouth: a ridged dome seen from below
function palate() {
  const g = new THREE.SphereGeometry(8, 180, 120, 0, Math.PI * 2, 0, 1.05);
  displace(g, (v) => {
    const ridges = Math.max(0, Math.sin(v.z * 2.2 + 0.6 * n3(v.x * 0.5, 0, v.z * 0.5) * 3)) * 0.22 * Math.exp(-(v.x * v.x) / 18);
    const raphe = -0.18 * Math.exp(-(v.x * v.x) / 0.08);
    return -(ridges + raphe + 0.06 * n3(v.x * 1.5, v.y * 1.5, v.z * 1.5));
  });
  const m = new THREE.Mesh(g, flesh('#d77c82', 4, { side: THREE.BackSide }));
  m.position.y = -6.2; m.receiveShadow = true;
  return m;
}

// ---------- shots ----------

// 1 — ice cream cone, slow orbit, frosty air
function shotCone() {
  const scene = baseScene('#071a2b', 0.02);
  const camera = cam(30);
  const ic = iceCream(); scene.add(ic); ic.position.y = 0.6;
  const frost = frostField(scene, 120, 10, [0, 1, 0]);
  spot(scene, '#ffffff', 140, [5, 9, 8], [0, 0.5, 0], 0.6);
  spot(scene, '#5ec8ff', 160, [-7, 2, -6], [0, 0.5, 0], 0.7, false);
  scene.add(new THREE.HemisphereLight('#cdeeff', '#05101a', 0.4));
  const update = (t) => {
    const k = ease(t), a = lerp(-0.4, 0.4, k);
    ic.rotation.y = t * 0.6;
    camera.position.set(Math.sin(a) * lerp(15, 11, k), lerp(3, 2.2, k), Math.cos(a) * lerp(15, 11, k));
    camera.lookAt(0, 0.6, 0);
    frost.update(t);
  };
  return { scene, camera, update };
}

// 2 — looking up at the roof of the mouth as cold ice cream presses on it
function shotPalate() {
  const scene = baseScene('#14060a', 0.03);
  const camera = cam(42);
  scene.add(palate());
  const blobG = new THREE.SphereGeometry(1.6, 120, 90);
  displace(blobG, (v) => 0.18 * n3(v.x * 1.5, v.y * 1.5, v.z * 1.5));
  const blob = new THREE.Mesh(blobG, iceCreamMat()); blob.scale.y = 0.55; scene.add(blob);
  const frost = frostField(scene, 140, 6, [0, 0.8, 0]);
  const cold = new THREE.PointLight('#6fd0ff', 30, 10, 1.6); cold.position.set(0, 0.8, 1); scene.add(cold);
  spot(scene, '#ffe2d8', 120, [3, -8, 6], [0, 1.5, 0], 0.7);
  scene.add(new THREE.HemisphereLight('#ffd0d0', '#1a0408', 0.25));
  const update = (t) => {
    const k = ease(t);
    blob.position.set(0, lerp(-0.8, 0.95, ease(seg(t, 0, 0.6))), 0);
    cold.intensity = lerp(4, 22, k);
    frost.update(t, k);
    camera.position.set(lerp(-3, -2, k), lerp(-6.5, -5, k), lerp(7, 5.5, k));
    camera.lookAt(0, 1.4, 0);
  };
  return { scene, camera, update };
}

// Biconcave red blood cell
function bloodCellGeo() {
  const pts = [];
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * Math.PI, x = Math.sin(a), y = Math.cos(a);
    const r = 0.5 * x, h = 0.17 * y * (0.35 + 0.65 * x * x);
    pts.push(new THREE.Vector2(Math.max(0.001, r), h));
  }
  const g = new THREE.LatheGeometry(pts, 48); g.computeVertexNormals(); return g;
}

// Blood vessel close-up shared by shots 3–4: radius(t) in vessel units, mood(t) 0 = cold, 1 = hot
function shotVessel(radius, mood, flow) {
  return () => {
    const scene = baseScene('#12040a', 0.035);
    const camera = cam(36);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -14, 0), new THREE.Vector3(0.6, -5, 0.3), new THREE.Vector3(-0.5, 4, -0.2), new THREE.Vector3(0.2, 14, 0)]);
    const g = organicTube(curve, 1.4, 500, 64, (u) => 1 + 0.03 * n3(u * 30, 0, 0));
    const wallM = flesh('#c0303c', 1, { transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide, clearcoat: 1 });
    wallM.normalMap.repeat.set(20, 2);
    const vessel = new THREE.Mesh(g, wallM); scene.add(vessel);
    // surrounding tissue
    const bgG = new THREE.SphereGeometry(30, 64, 48); displace(bgG, (v) => 1.5 * n3(v.x * 0.1, v.y * 0.1, v.z * 0.1));
    scene.add(new THREE.Mesh(bgG, flesh('#4a1418', 6, { side: THREE.BackSide })));
    const cellM = new THREE.MeshPhysicalMaterial({ color: '#c8121e', roughness: 0.35, clearcoat: 0.7, sheen: 0.4, sheenColor: new THREE.Color('#ff6060') });
    const cg = bloodCellGeo();
    const cells = Array.from({ length: 70 }, (_, i) => {
      const m = new THREE.Mesh(cg, cellM);
      m.userData = { u: (i * 0.618) % 1, a: i * 2.39996, r: ((i * 0.371) % 1) * 0.75, rot: i };
      scene.add(m); return m;
    });
    const frost = frostField(scene, 120, 7, [0, 0, 1.5]);
    const coldL = new THREE.PointLight('#5fc8ff', 0, 14, 1.4); coldL.position.set(3, 1, 4); scene.add(coldL);
    const hotL = new THREE.PointLight('#ff3b2b', 0, 14, 1.4); hotL.position.set(-2, 0, 3); scene.add(hotL);
    spot(scene, '#ffe0e0', 140, [6, 6, 10], [0, 0, 0], 0.7, false);
    scene.add(new THREE.HemisphereLight('#ffc8c8', '#140306', 0.3));
    const P = new THREE.Vector3();
    const update = (t) => {
      const r = radius(t), m = mood(t);
      vessel.scale.set(r, 1, r);
      coldL.intensity = (1 - m) * 40; hotL.intensity = m * (35 + 25 * Math.sin(t * 25));
      frost.update(t, 1 - m);
      for (const c of cells) {
        const d = c.userData, u = (d.u + flow(t)) % 1;
        curve.getPointAt(u, P);
        c.position.set(P.x * r + Math.cos(d.a) * d.r * 1.4 * r, P.y, P.z * r + Math.sin(d.a) * d.r * 1.4 * r);
        c.rotation.set(d.rot + t * 3, d.rot * 0.5, t * 2); c.scale.setScalar(0.9 + 0.3 * r);
      }
      const k = ease(t);
      camera.position.set(lerp(6.5, 5.2, k), lerp(1.2, 0.5, k), lerp(9, 7.5, k));
      camera.lookAt(0, 0, 0);
    };
    return { scene, camera, update };
  };
}
// 3 — cold: the vessel tightens
const shotTighten = shotVessel((t) => lerp(1.15, 0.5, ease(seg(t, 0.1, 0.8))), () => 0, (t) => t * 0.25);
// 4 — then it suddenly widens, warm blood rushes in
const shotWiden = shotVessel((t) => lerp(0.5, 1.45, 1 - (1 - seg(t, 0.05, 0.35)) ** 3) + 0.06 * Math.sin(t * 25) * seg(t, 0.3, 0.5), (t) => seg(t, 0.03, 0.25), (t) => t * 1.4);

// Brain with gyri
function brain() {
  const g = new THREE.SphereGeometry(2.6, 220, 160);
  // sulci: thin deep grooves along the zero-crossings of two noise octaves
  displace(g, (v) => -0.32 * Math.exp(-Math.abs(n3(v.x * 1.7, v.y * 1.7, v.z * 1.7)) * 14)
    - 0.14 * Math.exp(-Math.abs(n3(v.x * 3.6 + 9, v.y * 3.6, v.z * 3.6)) * 16)
    - 0.45 * Math.exp(-(v.x * v.x) / 0.04) * (v.y > -1 ? 1 : 0));
  const m = new THREE.Mesh(g, flesh('#c97a80', 2, { clearcoat: 0.8, sheen: 0.3 }));
  m.scale.set(1.0, 0.85, 1.35);
  return m;
}

// 5 — a pain signal races up the trigeminal nerve to the brain; forehead flashes
function shotNerve() {
  const scene = baseScene('#0a0612', 0.02);
  const camera = cam(34);
  const b = brain(); b.position.set(0, 3, 0); scene.add(b);
  b.material.emissive = new THREE.Color('#ff1a1a'); b.material.emissiveIntensity = 0;
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0.4, -5.5, 3.6), new THREE.Vector3(1.4, -3.2, 3.4), new THREE.Vector3(1.6, -0.8, 2.6), new THREE.Vector3(1.2, 0.8, 2.3), new THREE.Vector3(0.6, 2.2, 3.1), new THREE.Vector3(0.3, 3.4, 3.4)]);
  const nerve = new THREE.Mesh(new THREE.TubeGeometry(curve, 300, 0.13, 20), new THREE.MeshPhysicalMaterial({ color: '#f1cf72', emissive: '#a07a10', emissiveIntensity: 0.25, roughness: 0.35, clearcoat: 0.6 }));
  scene.add(nerve);
  // branches
  [[2, 0.9], [3, -0.7]].forEach(([i, s]) => {
    const p0 = curve.points[i];
    const br = new THREE.CatmullRomCurve3([p0, p0.clone().add(new THREE.Vector3(s, -0.4, 0.4)), p0.clone().add(new THREE.Vector3(s * 1.6, -1.2, 0.5))]);
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(br, 60, 0.07, 12), nerve.material));
  });
  const pulseM = new THREE.MeshBasicMaterial({ color: '#fff3b0' });
  const pulses = Array.from({ length: 6 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.28 - i * 0.035, 24, 16), pulseM); scene.add(m); return m; });
  const pulseL = new THREE.PointLight('#ffd84a', 25, 5, 1.6); scene.add(pulseL);
  const pain = new THREE.PointLight('#ff2020', 0, 9, 1.4); pain.position.set(0, 3.6, 4.8); scene.add(pain);
  spot(scene, '#e8e0ff', 110, [10, 8, 4], [0, 1.5, 0], 0.7);
  spot(scene, '#7a5cff', 90, [-8, 2, -6], [0, 1.5, 0], 0.8, false);
  scene.add(new THREE.HemisphereLight('#e0d8ff', '#05030a', 0.3));
  const P = new THREE.Vector3();
  const update = (t) => {
    const k = ease(t), head = ease(seg(t, 0.08, 0.7));
    pulses.forEach((p, i) => { const u = clamp01(head - i * 0.025); curve.getPointAt(u, P); p.position.copy(P); p.visible = head > 0 && head < 1; });
    curve.getPointAt(Math.max(0.001, head), P); pulseL.position.copy(P); pulseL.intensity = head < 1 ? 25 : 0;
    const hit = seg(t, 0.7, 0.8), flash = hit * (0.65 + 0.35 * Math.sin(t * 40));
    pain.intensity = flash * 120; b.material.emissiveIntensity = flash * 1.3;
    camera.position.set(lerp(15, 12.5, k), lerp(0.5, 1.5, k), lerp(11, 9.5, k));
    camera.lookAt(0, lerp(0, 1.8, k), 0);
  };
  return { scene, camera, update };
}

// 6 — the fix: tongue pressed to the palate, cold turns to warm
function shotFix() {
  const scene = baseScene('#14060a', 0.03);
  const camera = cam(40);
  scene.add(palate());
  const tg = new THREE.SphereGeometry(1, 160, 120);
  displace(tg, (v) => 0.05 * n3(v.x * 3, v.y * 3, v.z * 3));
  const tongue = new THREE.Mesh(tg, flesh('#e0707a', 5, { clearcoat: 1, clearcoatRoughness: 0.08 }));
  tongue.scale.set(3.2, 1.3, 3.4); tongue.castShadow = true; scene.add(tongue);
  const frost = frostField(scene, 140, 6, [0, 0.9, 0]);
  const cold = new THREE.PointLight('#6fd0ff', 14, 10, 1.6); cold.position.set(0, 1.2, 0); scene.add(cold);
  const warm = new THREE.PointLight('#ff8a2a', 0, 12, 1.4); warm.position.set(0, 1.0, -0.5); scene.add(warm);
  spot(scene, '#ffe2d8', 120, [3, -8, 6], [0, 1.5, 0], 0.7);
  scene.add(new THREE.HemisphereLight('#ffd0d0', '#1a0408', 0.25));
  const update = (t) => {
    const k = ease(t), up = ease(seg(t, 0.05, 0.5)), heat = ease(seg(t, 0.35, 0.9));
    tongue.position.set(0, lerp(-3.6, -0.75, up), -1);
    tongue.scale.y = lerp(1.3, 1.05, up);
    cold.intensity = (1 - heat) * 14; warm.intensity = heat * 16;
    frost.update(t, 1 - heat);
    camera.position.set(lerp(0.8, 0.3, k), lerp(-0.9, -0.7, k), lerp(4.8, 4.4, k));
    camera.lookAt(0, 0.8, -3);
  };
  return { scene, camera, update };
}

run([shotCone, shotPalate, shotTighten, shotWiden, shotNerve, shotFix]);
