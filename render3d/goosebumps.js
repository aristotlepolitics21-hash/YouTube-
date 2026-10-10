// "Why do you get goosebumps?" — a macro of skin where bumps rise around each hair; a skin
// cutaway with hair follicles, the tiny arrector pili muscle that pulls each hair upright, a
// nerve firing, sebaceous glands and the stem cells at the follicle; and a patch of animal fur
// that fluffs up and traps warm air.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, label, path3, wet, glowMat, flesh,
  skinMat, rim, muscleMaps, tissueMap, C,
} from './lib_body.js';
import { organicTube, bumpNormalMap } from './lib3d.js';
import { run } from './lib3d.js';

const gauss = (d2, r) => Math.exp(-d2 / (r * r));

// ---------- skin colour map: mottled tone, pores, fine creases ----------
function skinTexture(size = 2048, seed = 0) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  x.fillStyle = '#b97858'; x.fillRect(0, 0, size, size);
  for (let i = 0; i < 2600; i++) {
    const px = rnd(i + seed) * size, py = rnd(i + 0.3 + seed) * size, r = 10 + rnd(i + 0.6) * 60;
    const g = x.createRadialGradient(px, py, 0, px, py, r), tone = rnd(i + 0.9);
    g.addColorStop(0, tone > 0.5 ? 'rgba(214,150,120,0.18)' : 'rgba(170,100,80,0.16)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  x.strokeStyle = 'rgba(120,70,55,0.18)'; x.lineWidth = 1.4;
  for (let i = 0; i < 380; i++) { const px = rnd(i * 2 + seed) * size, py = rnd(i * 2 + 0.5) * size, a = (rnd(i) - 0.5) * 0.8 + (i % 2 ? 0.6 : -0.6), L = 40 + rnd(i + 0.2) * 120; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); }
  for (let i = 0; i < 5000; i++) { const px = rnd(i * 3 + seed) * size, py = rnd(i * 3 + 0.7) * size; x.fillStyle = 'rgba(110,60,45,0.35)'; x.beginPath(); x.arc(px, py, 1.2 + rnd(i) * 1.6, 0, Math.PI * 2); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const poreNormal = bumpNormalMap(512, 60, 3, 11);

// ---------- 1: macro of the skin surface; bumps rise around every hair ----------
// params: k0/k1 (goosebump amount), cold (blue light), music (sound rings), cam
function surface(p) {
  const { scene, camera } = setup();
  const SZ = 16, N = 320;
  const geo = new THREE.PlaneGeometry(SZ, SZ, N, N); geo.rotateX(-Math.PI / 2);
  const base = Float32Array.from(geo.attributes.position.array);
  const map = skinTexture(2048, 3); map.repeat.set(1, 1);
  const nm = poreNormal.clone(); nm.repeat.set(10, 10); nm.needsUpdate = true;
  const mat = rim(new THREE.MeshPhysicalMaterial({ map, normalMap: nm, normalScale: new THREE.Vector2(0.35, 0.35), roughness: 0.55, clearcoat: 0.12, clearcoatRoughness: 0.5, sheen: 0.35, sheenRoughness: 0.45, sheenColor: new THREE.Color('#ffc8b0') }), '#8cc6ff', 0.35, 3.0);
  const skin = new THREE.Mesh(geo, mat); skin.receiveShadow = true; scene.add(skin);
  // hairs: each sits in a small dimple and stands up as its bump rises
  const hairs = [];
  for (let i = 0; i < 260; i++) {
    const hx = (rnd(i) - 0.5) * (SZ - 2), hz = (rnd(i + 0.4) - 0.5) * (SZ - 2), len = 0.35 + rnd(i + 0.7) * 0.4;
    const pts = Array.from({ length: 6 }, (_, k) => new THREE.Vector3(0.05 * Math.sin(k + i), (k / 5) * len, 0.04 * k * k / 25));
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.009, 6);
    { const p2 = g.attributes.position; for (let v = 0; v < p2.count; v++) { const y = p2.getY(v), k = 1 - 0.75 * (y / len); p2.setX(v, p2.getX(v) * k); p2.setZ(v, p2.getZ(v) * k); } }
    const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#6a4630').offsetHSL(0, 0, (rnd(i) - 0.5) * 0.12), roughness: 0.35, transparent: true, opacity: 0.9, clearcoat: 0.6, sheen: 0.5, sheenColor: new THREE.Color('#a07050') }));
    m.castShadow = true; m.userData = { hx, hz, dir: rnd(i + 0.9) * Math.PI * 2 }; scene.add(m); hairs.push(m);
  }
  const ringM = new THREE.MeshBasicMaterial({ color: '#9fd8ff', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const rings = Array.from({ length: 4 }, () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 128), ringM.clone()); r.rotation.x = -Math.PI / 2; scene.add(r); return r; });
  const L = studio(scene, { target: [0, 0, 0], keyI: 9, keyPos: [-9, 2.2, 3], rim: '#ffb59a', rimI: 8, rimPos: [8, 2, -6], hemi: 0.08 });
  let lastK = -1;
  const height = (x, z, k) => {
    let h = 0.03 * n3(x * 0.6, z * 0.6, 1) + 0.01 * n3(x * 3, z * 3, 2);
    if (k > 0) for (const m of hairs) { const u = m.userData, d2 = (x - u.hx) ** 2 + (z - u.hz) ** 2; if (d2 < 0.6) h += k * (0.13 * gauss(d2, 0.2) - 0.035 * gauss(d2, 0.05)); }
    return h;
  };
  const update = (t) => {
    const k = lerp(P(p, 'k0', 0), P(p, 'k1', 1), ease(t));
    if (Math.abs(k - lastK) > 0.004) {
      const a = geo.attributes.position;
      for (let i = 0; i < a.count; i++) a.setY(i, height(base[i * 3], base[i * 3 + 2], k));
      a.needsUpdate = true; geo.computeVertexNormals(); lastK = k;
      hairs.forEach((m) => {
        const u = m.userData; m.position.set(u.hx, height(u.hx, u.hz, k) - 0.03, u.hz);
        m.rotation.set(0, u.dir, 0); m.rotateZ(lerp(1.25, 0.25, k));
      });
    }
    const cold = P(p, 'cold', 0);
    L.rim2.color.set(cold ? '#5fb4ff' : '#4f9dff'); L.rim2.intensity = cold ? 20 : 14; L.key.color.set(cold ? '#e6f2ff' : '#fff1e8');
    rings.forEach((r, i) => { const u = (t * 1.2 + i / 4) % 1; r.visible = !!P(p, 'music', 0); r.scale.setScalar(0.5 + u * 9); r.position.y = 0.3; r.material.opacity = 0.35 * (1 - u); });
    orbit(camera, p, t, { az0: 0.5, az1: 0.35, el0: 0.24, el1: 0.2, dist0: 7.5, dist1: 6.2 });
  };
  return done(scene, camera, update, { aperture: 0.004, maxblur: 0.01 });
}

// ---------- 2: skin cutaway with three hair follicles and their goosebump muscles ----------
// params: k0/k1 (contraction), pulse (nerve signal), stem (stem cells glow), grow (new hair), labels, cam
function block(p) {
  const { scene, camera } = setup();
  const SX = 9, HALF = 3, EPI = 0.32, DER = 2.4, FAT = 1.9, yD = -EPI, yF = -EPI - DER, yB = yF - FAT;
  const g = new THREE.Group(); scene.add(g);
  // dermis + fat boxes with tissue texture; epidermis with a live top surface
  const tm = tissueMap('#e0858a', 1024, 4); tm.repeat.set(0.25, 0.25);
  const derm = new THREE.Mesh(new THREE.BoxGeometry(SX, DER, HALF * 2), flesh('#ffffff', 2, { map: tm, clearcoat: 0.8, clearcoatRoughness: 0.2 })); derm.position.y = yD - DER / 2; g.add(derm);
  { const p2 = derm.geometry.attributes.position, u = []; for (let i = 0; i < p2.count; i++) u.push(p2.getX(i) * 0.2 + p2.getZ(i) * 0.2, p2.getY(i) * 0.2); derm.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); }
  const fatM = flesh('#e2a63e', 3, { clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.15, sheenColor: new THREE.Color('#ffe2a0') });
  const fat = new THREE.Mesh(new THREE.BoxGeometry(SX, FAT, HALF * 2), fatM); fat.position.y = yF - FAT / 2; g.add(fat);
  const lob = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), fatM, 140); const d = new THREE.Object3D();
  for (let i = 0; i < 140; i++) { const onX = i % 3 === 0, r = 0.22 + rnd(i) * 0.18, a = (rnd(i + 0.3) - 0.5) * (onX ? HALF * 2 - 0.4 : SX - 0.4); d.position.set(onX ? SX / 2 - r * 0.5 : a, yF - 0.25 - rnd(i + 0.6) * (FAT - 0.5), onX ? a : HALF - r * 0.5); d.scale.set(r, r * 0.8, r); d.updateMatrix(); lob.setMatrixAt(i, d.matrix); }
  g.add(lob);
  const epiGeo = new THREE.BoxGeometry(SX, EPI, HALF * 2, 220, 1, 150); epiGeo.translate(0, -EPI / 2, 0);
  const epiBase = Float32Array.from(epiGeo.attributes.position.array);
  const sm = skinTexture(1024, 9); sm.repeat.set(0.5, 0.5);
  const epi = new THREE.Mesh(epiGeo, rim(new THREE.MeshPhysicalMaterial({ map: sm, roughness: 0.5, clearcoat: 0.3, sheen: 0.6, sheenColor: new THREE.Color('#ffc8b0') }), '#8cc6ff', 0.4, 3)); epi.castShadow = epi.receiveShadow = true; g.add(epi);
  { const p2 = epiGeo.attributes.position, u = []; for (let i = 0; i < p2.count; i++) u.push(p2.getX(i) * 0.12 + 0.5, p2.getZ(i) * 0.12 + 0.5); epiGeo.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); }
  // a thin pale line where epidermis meets dermis on the cut faces
  // follicle units on the front cut face (z = HALF)
  const ZF = HALF - 0.04, mm = muscleMaps('#c0404a', 256); mm.map.repeat.set(3, 1);
  const muscleM = flesh('#ffffff', 1, { map: mm.map, normalMap: mm.normalMap, normalScale: new THREE.Vector2(0.6, 0.6), clearcoat: 0.9, emissive: new THREE.Color('#ff2a2a'), emissiveIntensity: 0 });
  const sheathM = wet('#d9878e', { clearcoat: 1 }), hairM = new THREE.MeshPhysicalMaterial({ color: '#2e1d12', roughness: 0.3, clearcoat: 0.7, sheen: 0.4, sheenColor: new THREE.Color('#8a6040') });
  const glandM = wet('#f1e2b8', { clearcoat: 1, sheen: 0.5, sheenColor: new THREE.Color('#ffffff') });
  const nerveM = wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.25 });
  const stemM = glowMat('#5dff9a', 0);
  const units = [-2.9, 0.1, 3.0].map((x0, ui) => {
    const u = { x0, ui, follicle: new THREE.Mesh(new THREE.BufferGeometry(), sheathM), hair: new THREE.Mesh(new THREE.BufferGeometry(), hairM), muscle: new THREE.Mesh(new THREE.BufferGeometry(), muscleM), bulb: new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), wet('#b04452')), glands: [], stem: [] };
    g.add(u.follicle, u.hair, u.muscle, u.bulb);
    for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.16 - k * 0.03, 20, 14), glandM); g.add(s); u.glands.push(s); }
    for (let k = 0; k < 9; k++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), stemM); g.add(s); u.stem.push(s); }
    return u;
  });
  const nerve = new THREE.Mesh(new THREE.TubeGeometry(path3([[SX / 2 + 0.1, yF + 0.35, ZF], [2.5, yF + 0.5, ZF], [0.6, yF + 0.8, ZF], [-1.5, yF + 0.55, ZF], [-SX / 2 - 0.1, yF + 0.4, ZF]]), 120, 0.07, 8), nerveM); g.add(nerve);
  const branches = units.map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), nerveM); g.add(m); return m; });
  const pulses = units.map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), glowMat('#fff3a0', 2.5)); g.add(m); return m; });
  // capillary loops between follicles
  const capM = wet('#d02a3a');
  for (let i = 0; i < 6; i++) { const x = -3.8 + i * 1.5 + 0.4; g.add(new THREE.Mesh(new THREE.TubeGeometry(path3([[x - 0.2, yD - 1.4, ZF], [x - 0.12, yD - 0.25, ZF], [x + 0.12, yD - 0.25, ZF], [x + 0.2, yD - 1.4, ZF]]), 30, 0.045, 8), capM)); }
  const labs = [['HAIR', '#e8d0b0'], ['GOOSEBUMP MUSCLE', '#ff8a8a'], ['NERVE', C.nerve], ['STEM CELLS', '#5dff9a']].map(([s, c]) => { const l = label(s, { color: c, size: 0.42 }); scene.add(l); return l; });
  studio(scene, { target: [0, -1.4, HALF], keyI: 12, keyPos: [-5, 8, 12], rim: '#ffb59a', rimI: 8, rimPos: [9, 4, -5] });
  const Q = new THREE.Vector3();
  const update = (t) => {
    const k = lerp(P(p, 'k0', 0), P(p, 'k1', 1), ease(t));
    const pulseU = P(p, 'pulse', 0) ? clamp01((t - 0.05) / 0.45) : -1;
    const stem = P(p, 'stem', 0) * (0.6 + 0.4 * Math.sin(t * 18)), grow = P(p, 'grow', 0) * ease(t);
    // per follicle: angle from vertical goes 40° -> 8°, pivot at the skin exit
    const exits = [];
    units.forEach((u) => {
      const kk = clamp01(k * 1.15 - u.ui * 0.07), th = THREE.MathUtils.degToRad(lerp(40, 8, kk));
      const ex = new THREE.Vector3(u.x0, 0, ZF), dir = new THREE.Vector3(Math.sin(th), -Math.cos(th), 0);
      exits.push([u.x0, kk]);
      const len = 2.0, root = ex.clone().addScaledVector(dir, len);
      u.follicle.geometry.dispose(); u.follicle.geometry = organicTube(new THREE.LineCurve3(ex.clone().addScaledVector(dir, 0.05), root), 0.17, 30, 16, (s) => 0.8 + 0.4 * s);
      u.bulb.position.copy(root); u.bulb.scale.set(1, 1.15, 0.8);
      const tip = ex.clone().addScaledVector(dir, -(1.6 + grow * 0.8)).add(new THREE.Vector3(-0.12, 0, 0));
      u.hair.geometry.dispose(); u.hair.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([root.clone().addScaledVector(dir, -0.1), ex.clone(), ex.clone().lerp(tip, 0.5).add(new THREE.Vector3(-0.05, 0, 0)), tip]), 40, 0.045, 8);
      // muscle: from the follicle (1.25 down) to an anchor under the epidermis on the other side
      const att = ex.clone().addScaledVector(dir, 1.25), anchor = new THREE.Vector3(u.x0 - 1.05, yD - 0.25, ZF);
      const mid = att.clone().lerp(anchor, 0.5).add(new THREE.Vector3(0, -0.12 * (1 - kk), 0));
      const fat = 1 + kk * 0.45;
      u.muscle.geometry.dispose(); u.muscle.geometry = organicTube(new THREE.CatmullRomCurve3([att, mid, anchor]), 0.11 * fat, 40, 14, (s) => 0.35 + 0.65 * Math.sin(s * Math.PI));
      u.glands.forEach((s, j) => { s.position.copy(ex).addScaledVector(dir, 0.55 + j * 0.18).add(new THREE.Vector3(-0.2 - j * 0.05, 0, 0)); });
      u.stem.forEach((s, j) => { const a = (j / 9) * Math.PI * 2; s.position.copy(att).add(new THREE.Vector3(Math.cos(a) * 0.2, Math.sin(a) * 0.26, 0.04)); s.scale.setScalar(stem > 0 ? 1 : 0.001); });
      // nerve branch to the muscle + travelling pulse
      const from = new THREE.Vector3(u.x0 + 0.4, yF + 0.65, ZF), curve = new THREE.CatmullRomCurve3([from, from.clone().lerp(mid, 0.5).add(new THREE.Vector3(0.3, 0, 0)), mid]);
      branches[u.ui].geometry.dispose(); branches[u.ui].geometry = new THREE.TubeGeometry(curve, 30, 0.035, 6);
      pulses[u.ui].visible = pulseU >= 0 && pulseU < 1; if (pulses[u.ui].visible) { curve.getPointAt(pulseU, Q); pulses[u.ui].position.copy(Q); }
      if (u.ui === 1) {
        labs[0].userData.place(tip.clone(), new THREE.Vector3(tip.x, tip.y + 0.9, ZF + 0.3), P(p, 'labels', 0) ? seg(t, 0.1, 0.22) : 0);
        labs[1].userData.place(mid.clone(), new THREE.Vector3(mid.x + 0.5, 1.6, ZF + 0.4), P(p, 'labels', 0) ? seg(t, 0.25, 0.37) : 0);
        labs[2].userData.place(from.clone(), new THREE.Vector3(from.x - 0.5, yB - 0.4, ZF + 0.4), P(p, 'labels', 0) > 1 || P(p, 'pulse', 0) ? seg(t, 0.15, 0.27) : 0);
        labs[3].userData.place(att.clone(), new THREE.Vector3(att.x + 0.6, -4.9, ZF + 0.4), P(p, 'stem', 0) ? seg(t, 0.2, 0.32) : 0);
      }
    });
    muscleM.emissiveIntensity = P(p, 'pulse', 0) ? 0.5 * seg(t, 0.45, 0.55) * (0.6 + 0.4 * Math.sin(t * 30)) : k * 0.12;
    stemM.emissiveIntensity = stem * 1.6;
    // epidermis top: a bump rises around each hair exit
    const a = epiGeo.attributes.position;
    for (let i = 0; i < a.count; i++) {
      const y = epiBase[i * 3 + 1]; if (y < -0.001) continue;
      const x = epiBase[i * 3], z = epiBase[i * 3 + 2];
      let h = 0.025 * n3(x * 0.8, z * 0.8, 0);
      for (const [ex, kk] of exits) h += kk * (0.32 * gauss((x - ex) ** 2 + (z - ZF) ** 2 * 0.6, 0.55) - 0.06 * gauss((x - ex) ** 2 + (z - ZF) ** 2, 0.1));
      for (let j = 0; j < 10; j++) { const hx = -4 + rnd(j + 3) * 8, hz = -2.6 + rnd(j + 4) * 5; h += k * 0.18 * gauss((x - hx) ** 2 + (z - hz) ** 2, 0.4); }
      a.setY(i, h);
    }
    a.needsUpdate = true; epiGeo.computeVertexNormals();
    orbit(camera, p, t, { az0: 0.32, az1: 0.22, el0: 0.12, el1: 0.08, dist0: 24, dist1: 21, ty0: -1.4, ty1: -1.5, tz0: HALF, tz1: HALF });
  };
  return done(scene, camera, update);
}

// ---------- 3: animal fur fluffing up, trapping warm air ----------
// params: k0/k1 (raise), warm (trapped warm air glow), cold (cold air above)
function fur(p) {
  const { scene, camera } = setup();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), skinMat('#8a5a46', 0.2)); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const N = 9000, H = 1.3;
  const hg = new THREE.CylinderGeometry(0.003, 0.016, H, 5, 10); hg.translate(0, H / 2, 0);
  { const p2 = hg.attributes.position; for (let i = 0; i < p2.count; i++) { const y = p2.getY(i); p2.setX(i, p2.getX(i) + 0.32 * (y / H) ** 2); } hg.computeVertexNormals(); }
  const hm = new THREE.MeshPhysicalMaterial({ roughness: 0.55, sheen: 0.6, sheenRoughness: 0.4, sheenColor: new THREE.Color('#ffd8b0'), clearcoat: 0.1, envMapIntensity: 0.3 });
  const hairs = new THREE.InstancedMesh(hg, hm, N); hairs.frustumCulled = false; scene.add(hairs);
  const data = Array.from({ length: N }, (_, i) => ({ x: (rnd(i) - 0.5) * 14, z: (rnd(i + 0.33) - 0.5) * 14, yaw: 0.4 + (rnd(i + 0.66) - 0.5) * 0.6, s: 0.7 + rnd(i + 0.9) * 0.6 }));
  const col = new THREE.Color();
  data.forEach((h, i) => { const tone = rnd(i + 0.15); col.set(tone > 0.8 ? '#d9c6a8' : tone > 0.4 ? '#9a7050' : '#4a3222').multiplyScalar(0.8); hairs.setColorAt(i, col); });
  const warmM = glowMat('#ff9a3a', 1.1), coldM = glowMat('#7fc8ff', 0.9);
  const warm = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), warmM, 260); warm.frustumCulled = false; scene.add(warm);
  const cold = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 10, 8), coldM, 200); cold.frustumCulled = false; scene.add(cold);
  const warmL = new THREE.PointLight('#ff8a3a', 0, 10, 1.4); warmL.position.set(0, 0.6, 2); scene.add(warmL);
  studio(scene, { target: [0, 0.6, 0], keyI: 11, keyPos: [-6, 9, 8], rim: '#ffb59a', rimI: 10 });
  const d = new THREE.Object3D();
  const update = (t) => {
    const k = lerp(P(p, 'k0', 0), P(p, 'k1', 1), ease(t));
    data.forEach((h, i) => {
      const tilt = lerp(1.3, 0.35, k) + 0.06 * Math.sin(t * 6 + h.x * 0.7) + (rnd(i + 0.5) - 0.5) * 0.2;
      d.position.set(h.x, 0, h.z); d.rotation.set(0, h.yaw, 0); d.rotateZ(-tilt); d.scale.set(1, h.s, 1); d.updateMatrix(); hairs.setMatrixAt(i, d.matrix);
    });
    hairs.instanceMatrix.needsUpdate = true;
    const w = P(p, 'warm', 0) * k;
    for (let i = 0; i < 260; i++) { d.position.set((rnd(i) - 0.5) * 12 + 0.2 * Math.sin(t * 3 + i), 0.15 + rnd(i + 0.3) * 0.9 * k, (rnd(i + 0.6) - 0.5) * 12); d.rotation.set(0, 0, 0); d.scale.setScalar(w > 0.05 ? 1 : 0.001); d.updateMatrix(); warm.setMatrixAt(i, d.matrix); }
    warm.instanceMatrix.needsUpdate = true; warmL.intensity = w * 14;
    const c = P(p, 'cold', 0);
    for (let i = 0; i < 200; i++) { const u = (rnd(i) + t * 0.4) % 1; d.position.set((rnd(i + 0.2) - 0.5) * 14 - 6 + u * 12, 2.4 + rnd(i + 0.4) * 2.5, (rnd(i + 0.7) - 0.5) * 10); d.scale.setScalar(c ? 1 : 0.001); d.updateMatrix(); cold.setMatrixAt(i, d.matrix); }
    cold.instanceMatrix.needsUpdate = true;
    orbit(camera, p, t, { az0: 0.6, az1: 0.45, el0: 0.22, el1: 0.16, dist0: 9, dist1: 7.5, ty0: 0.6, ty1: 0.6 });
  };
  return done(scene, camera, update, { aperture: 0.004, maxblur: 0.01 });
}

run({ surface, block, fur });
