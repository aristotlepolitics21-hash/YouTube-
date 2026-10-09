// "What actually happens when a mosquito bites you?" — a striped mosquito on skin, the six
// needles inside her mouthpart fanned out and labelled, a skin cutaway with the needles sawing in,
// saliva going in and blood coming up, her belly filling with blood, and the itchy bump.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, skinBlock, flow, label,
  path3, wet, glowMat, skinMat, displace, C,
} from './lib_body.js';
import { cell } from './lib_sci.js';
import { run } from './lib3d.js';

const chitin = (color = '#1d1714') => new THREE.MeshPhysicalMaterial({ color, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.25, sheen: 0.4, sheenColor: new THREE.Color('#6a5a50'), envMapIntensity: 0.6 });
const white = () => new THREE.MeshPhysicalMaterial({ color: '#e8e8e8', roughness: 0.4, clearcoat: 0.5, sheen: 0.6, sheenColor: new THREE.Color('#ffffff') });

// Banded tube along a curve: dark with white rings (Aedes legs / abdomen)
function bandedTube(curve, r, segs, rings, taper = 0.4) {
  const g = new THREE.TubeGeometry(curve, segs, r, 10);
  const p = g.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3(), col = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs; curve.getPointAt(u, c);
    const k = 1 - taper * u, on = rings && Math.sin(u * rings * Math.PI * 2) > 0.75;
    for (let j = 0; j <= 10; j++) {
      const n = i * 11 + j; v.fromBufferAttribute(p, n).sub(c).multiplyScalar(k).add(c); p.setXYZ(n, v.x, v.y, v.z);
      col.push(...(on ? [0.9, 0.9, 0.9] : [0.12, 0.1, 0.09]));
    }
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.65, clearcoat: 0.1, envMapIntensity: 0.25 }));
}

// The mosquito: head toward +x, standing on y=0. Returns group with .abdomen, .fascicle, .labium
function mosquito() {
  const g = new THREE.Group();
  const thorax = new THREE.Mesh(new THREE.SphereGeometry(0.36, 48, 32), chitin()); thorax.scale.set(1.3, 0.95, 0.85); thorax.position.set(0, 1.25, 0); g.add(thorax);
  // white lyre marking on the thorax
  const lyre = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.03, 8, 32, Math.PI), white()); lyre.position.set(0.02, 1.62, 0); lyre.rotation.set(-Math.PI / 2, 0, Math.PI / 2); g.add(lyre);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 24), chitin()); head.position.set(0.58, 1.18, 0); g.add(head);
  for (const s of [1, -1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 24), new THREE.MeshPhysicalMaterial({ color: '#2a0c08', roughness: 0.15, clearcoat: 1 })); eye.position.set(0.64, 1.22, s * 0.12); g.add(eye); }
  // abdomen: 8 segments with white bands; group so it can inflate
  const abdomen = new THREE.Group(); abdomen.position.set(-0.4, 1.2, 0); abdomen.rotation.z = 0.22; g.add(abdomen);
  const abM = chitin('#241c18'), blood = new THREE.MeshPhysicalMaterial({ color: '#b3121c', roughness: 0.2, transmission: 0.35, thickness: 0.5, clearcoat: 1, emissive: '#3a0000', emissiveIntensity: 0.3 });
  const segsA = [];
  for (let i = 0; i < 8; i++) {
    const r = 0.27 - i * 0.022, m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), abM.clone()); m.scale.set(0.75, 1, 1); m.position.x = -0.26 * i; abdomen.add(m);
    const band = new THREE.Mesh(new THREE.TorusGeometry(r * 0.97, 0.014, 8, 32), white()); band.rotation.y = Math.PI / 2; band.position.x = -0.26 * i + 0.05; abdomen.add(band);
    segsA.push({ m, band, r });
  }
  abdomen.userData.fill = (k) => segsA.forEach(({ m, band }, i) => {
    const s = 1 + k * (0.9 - i * 0.04);
    m.scale.set(0.75 + k * 0.25, s, s); band.scale.setScalar(s); m.position.x = -0.26 * i * (1 + k * 0.25); band.position.x = m.position.x + 0.05;
    m.material.color.set('#241c18').lerp(new THREE.Color('#b3121c'), k * 0.85);
    m.material.transmission = k * 0.35; m.material.emissive.set('#3a0000'); m.material.emissiveIntensity = k * 0.4;
  });
  // proboscis (labium sheath) from the head angled down to the skin
  const prob = path3([[0.72, 1.1, 0], [1.05, 0.75, 0], [1.3, 0.35, 0], [1.45, 0.02, 0]]);
  const labium = bandedTube(prob, 0.06, 40, 0, 0.35); g.add(labium);
  // palps + antennae
  for (const s of [1, -1]) {
    g.add(bandedTube(path3([[0.7, 1.15, s * 0.05], [0.9, 1.05, s * 0.1], [1.0, 0.95, s * 0.12]]), 0.025, 12, 2, 0.2));
    g.add(bandedTube(path3([[0.68, 1.3, s * 0.06], [1.0, 1.7, s * 0.25], [1.25, 2.0, s * 0.35]]), 0.018, 24, 6, 0.4));
  }
  // wings folded back over the abdomen
  const wingShape = new THREE.Shape(); wingShape.moveTo(0, 0); wingShape.bezierCurveTo(-0.6, 0.2, -1.6, 0.25, -2.0, 0.05); wingShape.bezierCurveTo(-1.7, -0.12, -0.6, -0.12, 0, 0);
  const wingM = new THREE.MeshPhysicalMaterial({ color: '#cfe0ee', roughness: 0.15, transparent: true, opacity: 0.32, iridescence: 1, iridescenceIOR: 1.6, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 0.8 });
  for (const s of [1, -1]) { const w = new THREE.Mesh(new THREE.ShapeGeometry(wingShape, 24), wingM); w.position.set(-0.05, 1.5, s * 0.08); w.rotation.set(Math.PI / 2 - s * 0.12, 0, s * 0.12 - 0.12); g.add(w); }
  // six legs: femur up/out, tibia down, long tarsus touching the ground
  const legs = [[0.25, 0.9, 0.6], [0.0, 0.0, 0.0], [-0.25, -0.9, -0.5]];
  for (const [x0, fwd, ang] of legs) for (const s of [1, -1]) {
    const hip = [x0, 1.05, s * 0.2], knee = [x0 + fwd * 0.8, 1.4, s * 1.0], ankle = [x0 + fwd * 1.6, 0.55, s * 1.75], foot = [x0 + fwd * 2.9, 0.02, s * 2.3];
    g.add(bandedTube(new THREE.CatmullRomCurve3([hip, knee, ankle, foot].map((q) => new THREE.Vector3(...q)), false, 'catmullrom', 0.1), 0.028, 80, 7, 0.55));
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.userData = { abdomen, labium, prob };
  return g;
}

// Skin surface: wide bumpy plane with a few hairs and an optional welt. Returns {mesh, welt(k)}
function skinSurface(size = 30) {
  const geo = new THREE.PlaneGeometry(size, size, 260, 260); geo.rotateX(-Math.PI / 2);
  const base = Float32Array.from(geo.attributes.position.array);
  const mat = skinMat('#c48a70');
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true;
  const welt = (k, at = [1.5, 0]) => {
    const p = geo.attributes.position, col = [];
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], z = base[i * 3 + 2], d2 = (x - at[0]) ** 2 + (z - at[1]) ** 2;
      const bump = k * 0.9 * Math.exp(-d2 / 2.2) + 0.04 * n3(x * 0.8, z * 0.8, 0) + 0.012 * n3(x * 5, z * 5, 1);
      p.setY(i, bump);
      const red = k * Math.exp(-d2 / 5);
      col.push(1, 1 - red * 0.35, 1 - red * 0.35);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); mat.vertexColors = true; mat.needsUpdate = true;
    p.needsUpdate = true; geo.computeVertexNormals();
  };
  welt(0);
  const hairM = new THREE.MeshPhysicalMaterial({ color: '#4a3020', roughness: 0.4 });
  for (let i = 0; i < 90; i++) {
    const x = (rnd(i) - 0.5) * size * 0.8, z = (rnd(i + 0.5) - 0.5) * size * 0.8;
    m.add(new THREE.Mesh(new THREE.TubeGeometry(path3([[x, 0, z], [x + 0.2, 0.5, z + 0.1], [x + 0.6, 0.85, z + 0.2]]), 10, 0.02, 5), hairM));
  }
  return { mesh: m, welt };
}

// 1 — hero: the mosquito on skin. params: fill (belly 0..1 over the shot: fill0/fill1), bite (0..1 dips)
function hero(p) {
  const { scene, camera } = setup({ top: '#1a1012' });
  const sk = skinSurface(); scene.add(sk.mesh);
  const mq = mosquito(); scene.add(mq);
  studio(scene, { target: [0, 1, 0], keyI: 10, keyPos: [-4, 9, 7], rim: '#ffb07a', rimI: 10, hemi: 0.15 });
  const update = (t) => {
    const f = lerp(P(p, 'fill0', 0), P(p, 'fill1', 0), ease(t));
    mq.userData.abdomen.userData.fill(f);
    mq.position.y = -0.12 * P(p, 'bite', 0) * Math.min(1, t * 3) + 0.01 * Math.sin(t * 40);
    mq.rotation.y = 0.0;
    orbit(camera, p, t, { az0: 0.9, az1: 0.6, el0: 0.18, el1: 0.12, dist0: 13, dist1: 10.5, ty0: 1.0, ty1: 1.0, tx0: 0.4, tx1: 0.5 });
  };
  return done(scene, camera, update);
}

// The six stylets: [name, color, label] — maxillae saw, mandibles hold, hypopharynx saliva, labrum drinks
const STYLETS = [['max', '#e8d3a8', 'SAW'], ['max', '#e8d3a8', 'SAW'], ['man', '#cbb3e8', 'HOLD'], ['man', '#cbb3e8', 'HOLD'], ['hyp', '#7fe0a0', 'SALIVA'], ['lab', '#ff6f6f', 'DRINK']];

// 2 — the "one needle" splits into six, fanned out and labelled. params: spread0/spread1, labels
function six(p) {
  const { scene, camera } = setup({ top: '#120e18' });
  const group = new THREE.Group(); scene.add(group);
  const sheath = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 5, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: '#2a201c', roughness: 0.4, clearcoat: 0.6, transparent: true, opacity: 1, side: THREE.DoubleSide }));
  sheath.position.y = 3.2; group.add(sheath);
  const sty = STYLETS.map(([kind, color], i) => {
    const m = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 6, 16), wet(color, { emissive: color, emissiveIntensity: 0.15 })); shaft.position.y = 0; m.add(shaft);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.35, 16), shaft.material); tip.rotation.x = Math.PI; tip.position.y = -3.17; m.add(tip);
    if (kind === 'max') for (let k = 0; k < 9; k++) { const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 6), shaft.material); tooth.position.set(0.04, -2.2 - k * 0.1, 0); tooth.rotation.z = -1.2; m.add(tooth); }
    group.add(m);
    return m;
  });
  const PAIRS = [[[0, 1], 'SAW', '#e8d3a8'], [[2, 3], 'HOLD', '#cbb3e8'], [[4], 'SALIVA', '#7fe0a0'], [[5], 'DRINK', '#ff6f6f']];
  const labs = PAIRS.map(([, text, color]) => { const l = label(text, { color, size: 0.4 }); scene.add(l); return l; });
  const update = (t) => {
    const sp = lerp(P(p, 'spread0', 0), P(p, 'spread1', 1), ease(t));
    sheath.material.opacity = 1 - sp; sheath.visible = sp < 0.98;
    const tips = sty.map((m, i) => {
      const a = (i - 2.5) * 0.13 * sp;
      m.position.set((i - 2.5) * 0.1 * sp + Math.sin(a) * 3, 0.5 * sp, 0); m.rotation.z = a; m.updateMatrixWorld();
      return m.localToWorld(new THREE.Vector3(0, -3.3, 0));
    });
    PAIRS.forEach(([ids], j) => {
      const tip = ids.map((i) => tips[i]).reduce((a, b) => a.clone().add(b)).multiplyScalar(1 / ids.length);
      const at = new THREE.Vector3(tip.x, tip.y - 0.5 - j * 0.55, tip.z + 0.3);
      labs[j].userData.place(tip, at, P(p, 'labels', 0) ? seg(t, 0.2 + j * 0.12, 0.32 + j * 0.12) : 0);
    });
    group.rotation.y = 0.3 * Math.sin(t * 2);
    orbit(camera, p, t, { az0: 0.25, az1: -0.1, el0: -0.05, el1: 0.05, dist0: 19, dist1: 17, ty0: -1.0, ty1: -1.3 });
  };
  return done(scene, camera, update);
}

// 3 — inside the skin: the needle bundle saws in, feels for a vessel, saliva in, blood up.
// params: depth0/depth1 (0..1 along the path), saliva, drink
function inside(p) {
  const { scene, camera } = setup();
  const sb = skinBlock({ seed: 2 }); scene.add(sb.group);
  const zf = sb.half - 0.02;
  const path = path3([[0.9, 5, zf + 0.6], [0.75, 0.5, zf], [0.55, -0.6, zf], [0.25, -1.45, zf], [0.1, sb.yDermis + 0.25, zf + 0.06]]);
  const fasM = wet('#e6c9a0', { emissive: '#3a2a10', emissiveIntensity: 0.2 });
  const fas = new THREE.Mesh(new THREE.BufferGeometry(), fasM); scene.add(fas);
  const sheath = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.4, 20), chitin()); sheath.position.set(0.95, 4.4, zf + 0.62); sheath.rotation.z = 0.04; scene.add(sheath);
  const salM = glowMat('#5dff9a', 0.55), bloodM = glowMat('#ff2a2a', 0.6);
  const sal = flow(path, 40, { r: 0.055, mat: salM, spread: 0.05 }), bld = flow(path, 60, { r: 0.07, mat: bloodM, spread: 0.05, seed: 5 });
  scene.add(sal, bld);
  const tipGlow = new THREE.PointLight('#ff6060', 0, 3, 1.5); scene.add(tipGlow);
  studio(scene, { target: [0, -1.5, 2], keyI: 16 });
  const q = new THREE.Vector3();
  const update = (t) => {
    const d = lerp(P(p, 'depth0', 0.3), P(p, 'depth1', 0.7), ease(t));
    const sub = new THREE.CatmullRomCurve3(Array.from({ length: 30 }, (_, i) => path.getPointAt((i / 29) * Math.max(0.02, d))));
    fas.geometry.dispose(); fas.geometry = new THREE.TubeGeometry(sub, 60, 0.07, 10);
    fas.position.x = 0.03 * Math.sin(t * 70) * (d < 0.95 ? 1 : 0); // sawing
    sal.visible = P(p, 'saliva', 0) > 0; sal.userData.update(t, { speed: 0.8, from: d * 0.55, to: d + 0.02 });
    bld.visible = P(p, 'drink', 0) > 0; bld.userData.update(1 - t, { speed: 1.2, from: 0, to: d });
    path.getPointAt(d, q); tipGlow.position.copy(q).add(new THREE.Vector3(0, 0, 0.6)); tipGlow.intensity = P(p, 'drink', 0) * 4;
    orbit(camera, p, t, { az0: 0.35, az1: 0.25, el0: 0.12, el1: 0.08, dist0: 18, dist1: 14, ty0: -0.4, ty1: -0.8, tx0: 0.5, tx1: 0.4, tz0: 2, tz1: 2.5 });
  };
  return done(scene, camera, update);
}

// 4 — the itchy bump: skin welt rises and reddens. params: k0/k1, mosquito (show her flying off)
function bump(p) {
  const { scene, camera } = setup({ top: '#1a1012' });
  const sk = skinSurface(); scene.add(sk.mesh);
  studio(scene, { target: [1.5, 0.3, 0], keyI: 10, keyPos: [-6, 7, 6], rim: '#ffb07a', rimI: 10, hemi: 0.15 });
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), new THREE.MeshBasicMaterial({ color: '#5a0a10' })); dot.rotation.x = -Math.PI / 2; scene.add(dot);
  const update = (t) => {
    const k = lerp(P(p, 'k0', 0), P(p, 'k1', 1), ease(t));
    sk.welt(k); dot.position.set(1.5, k * 0.9 + 0.01, 0);
    orbit(camera, p, t, { az0: 0.6, az1: 0.4, el0: 0.35, el1: 0.25, dist0: 14, dist1: 11, tx0: 1.5, tx1: 1.5, ty0: 0.3, ty1: 0.4 });
  };
  return done(scene, camera, update);
}

// 5 — immune cells in the skin release histamine around the saliva. params: burst
function immune(p) {
  const { scene, camera } = setup();
  const sb = skinBlock({ seed: 4 }); scene.add(sb.group);
  const zf = sb.half - 0.18;
  const cells = [[-1.2, -0.9], [0.4, -1.3], [1.9, -0.8], [-0.2, -0.55]].map(([x, y], i) => { const c = cell({ r: 0.38, color: '#c9a2ff', nucleus: '#5a2aa0', seed: i * 3 }); c.position.set(x, y, zf); scene.add(c); return c; });
  const salM = glowMat('#5dff9a', 1.0);
  const sal = flow(path3([[-2.5, -1.0, zf + 0.1], [0, -0.7, zf + 0.15], [2.5, -1.0, zf + 0.1]]), 40, { r: 0.05, mat: salM, spread: 0.5 }); scene.add(sal);
  const histM = glowMat('#ffe14d', 1.2);
  const hist = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 6), histM, 240); hist.frustumCulled = false; scene.add(hist);
  const d = new THREE.Object3D();
  studio(scene, { target: [0, -1.2, 2.5], keyI: 16 });
  const update = (t) => {
    const b = seg(t, P(p, 'burst', 0.25), 1);
    cells.forEach((c, i) => c.scale.setScalar(1 + 0.1 * Math.sin(t * 20 + i) * b));
    for (let i = 0; i < 240; i++) {
      const c = cells[i % 4].position, a = rnd(i) * Math.PI * 2, e = (rnd(i + 0.3) - 0.5) * 2, r = b * (0.3 + rnd(i + 0.6) * 1.3);
      d.position.set(c.x + Math.cos(a) * r, c.y + e * r * 0.4, c.z + 0.2 + Math.abs(Math.sin(a)) * 0.2); d.scale.setScalar(b > 0 ? 1 : 0); d.updateMatrix(); hist.setMatrixAt(i, d.matrix);
    }
    hist.instanceMatrix.needsUpdate = true;
    sal.userData.update(t, { speed: 0.15 });
    orbit(camera, p, t, { az0: 0.15, az1: 0.25, el0: 0.1, el1: 0.06, dist0: 13, dist1: 11, ty0: -1.1, ty1: -1.0, tz0: 3, tz1: 3 });
  };
  return done(scene, camera, update);
}

run({ hero, six, inside, bump, immune });
