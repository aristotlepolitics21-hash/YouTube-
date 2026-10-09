// "Why does a bruise change color?" — a hit breaks tiny vessels in a skin cutaway, blood leaks
// into the tissue, the bruise on the surface goes red > purple > blue > green > yellow, macrophages
// eat the trapped blood, the pigment changes hemoglobin > biliverdin > bilirubin, two-week timeline.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, skinBlock, skinPlane, label,
  wet, glowMat, displace, flesh, C,
} from './lib_body.js';
import { bloodCellGeo } from './lib_sci.js';
import { run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Bruise colour by stage s: 0 red, 1 purple, 2 blue, 3 green, 4 yellow, 5 gone
const STAGES = ['#b3202c', '#5e1f52', '#2d2f70', '#617a2e', '#c9a43c', '#c48a70'].map((c) => new THREE.Color(c));
const stageColor = (s) => { const i = Math.min(4, Math.floor(s)), k = clamp01(s - i); return STAGES[i].clone().lerp(STAGES[i + 1], k); };
function paintBruise(sp, s, at = [0, 0], scale = 1) {
  const col = stageColor(s), fade = s > 4 ? 1 - (s - 4) : 1;
  sp.paint((ctx, res) => {
    const [cx, cy] = sp.px(...at), R = res * 0.11 * scale;
    for (let i = 0; i < 26; i++) {
      const x = cx + (rnd(i) - 0.5) * R * 1.3, y = cy + (rnd(i + 0.4) - 0.5) * R * 1.0, r = R * (0.35 + rnd(i + 0.7) * 0.6);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const c = col.clone().lerp(STAGES[Math.min(5, Math.floor(s) + 1)], rnd(i + 0.2) * 0.35).getStyle();
      g.addColorStop(0, c.replace('rgb', 'rgba').replace(')', `,${0.55 * fade})`)); g.addColorStop(1, c.replace('rgb', 'rgba').replace(')', ',0)'));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  });
}

// 1 — a rubber ball slams the skin; capillaries burst and blood leaks out. params: hitAt, leak0/leak1, ball
function impact(p) {
  const { scene, camera } = setup();
  const sb = skinBlock({ seed: 7 }); scene.add(sb.group);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(1.6, 64, 48), new THREE.MeshPhysicalMaterial({ color: '#2f6fd6', roughness: 0.45, clearcoat: 0.6 }));
  ball.castShadow = true; scene.add(ball);
  // leak: blood cells spilling from the capillary loops on the front face
  const capM = sb.parts.capillaries[0].material.clone(); capM.emissive = new THREE.Color('#ff1010');
  sb.parts.capillaries.forEach((c) => { c.material = capM; });
  const n = 260, cellG = bloodCellGeo(0.09);
  const leak = new THREE.InstancedMesh(cellG, wet('#9e1420', { clearcoat: 0.6 }), n); leak.frustumCulled = false; scene.add(leak);
  const src = sb.parts.capillaries.map((c) => { c.geometry.computeBoundingBox(); return c.geometry.boundingBox.getCenter(new THREE.Vector3()); });
  const d = new THREE.Object3D();
  studio(scene, { target: [0, -1.5, 2], keyI: 16 });
  const update = (t) => {
    const hit = P(p, 'hitAt', 0.35), useBall = P(p, 'ball', 1);
    const fall = clamp01(t / hit), back = seg(t, hit, hit + 0.3);
    ball.visible = !!useBall;
    ball.position.set(-0.5, t < hit ? lerp(9, 1.45, fall * fall) : lerp(1.45, 5, ease(back)), 1.2);
    const squash = t >= hit ? Math.max(0, 1 - (t - hit) / 0.12) : 0;
    sb.group.scale.y = 1 - 0.06 * squash;
    const lk = lerp(P(p, 'leak0', 0), P(p, 'leak1', 1), seg(t, hit, 1));
    capM.emissiveIntensity = (t >= hit ? 0.8 * Math.max(0, 1 - (t - hit) * 3) : 0) + lk * 0.2;
    for (let i = 0; i < n; i++) {
      const s = src[i % src.length], a = rnd(i) * Math.PI * 2, r = lk * (0.15 + rnd(i + 0.3) * 1.3);
      d.position.set(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r * 0.45 + 0.1, s.z + 0.08 + rnd(i + 0.6) * 0.1);
      d.rotation.set(rnd(i + 0.1) * 6, rnd(i + 0.2) * 6, t * 2); d.scale.setScalar(lk > 0.01 ? 1 : 0); d.updateMatrix(); leak.setMatrixAt(i, d.matrix);
    }
    leak.instanceMatrix.needsUpdate = true;
    orbit(camera, p, t, { az0: 0.35, az1: 0.25, el0: 0.2, el1: 0.12, dist0: 22, dist1: 18, ty0: -0.5, ty1: -1.0, tz0: 2, tz1: 2.5 });
  };
  return done(scene, camera, update);
}

// 2 — the bruise on the skin surface, colour stage s0 -> s1 (0 red ... 4 yellow, 5 gone)
function spot(p) {
  const { scene, camera } = setup({ top: '#1a1012' });
  const sp = skinPlane(); scene.add(sp.mesh);
  studio(scene, { target: [0, 0, 0], keyI: 10, keyPos: [-5, 9, 6], rim: '#ffb07a', rimI: 8, hemi: 0.15 });
  let last = -1;
  const update = (t) => {
    const s = lerp(P(p, 's0', 0), P(p, 's1', 1), ease(t));
    if (Math.abs(s - last) > 0.01) { paintBruise(sp, s); last = s; }
    sp.bulge(0.25 * clamp01(1 - s / 3), [0, 0], 4);
    orbit(camera, p, t, { az0: 0.4, az1: 0.25, el0: 0.7, el1: 0.8, dist0: 24, dist1: 20 });
  };
  return done(scene, camera, update);
}

// Macrophage: lumpy translucent blob with pseudopods reaching out
function macrophage(seed = 0) {
  const g = new THREE.SphereGeometry(1.4, 128, 96);
  displace(g, (v) => 0.18 * n3(v.x * 1.2 + seed, v.y * 1.2, v.z * 1.2) + 0.5 * Math.max(0, n3(v.x * 0.9 + seed, v.y * 0.9 + 3, v.z * 0.9)) ** 2 * 3);
  const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: '#b9d7ff', roughness: 0.25, transmission: 0.5, thickness: 1.5, transparent: true, opacity: 0.75, clearcoat: 1, depthWrite: false }));
  const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), new THREE.MeshPhysicalMaterial({ color: '#4a3c9a', roughness: 0.4, emissive: '#2a1c6a', emissiveIntensity: 0.3 }));
  nuc.scale.set(1.2, 0.8, 1); nuc.position.set(-0.3, 0.2, 0); m.add(nuc);
  return m;
}

// 3 — macrophages swallow the trapped red cells, which turn green inside them. params: eat0/eat1
function macro(p) {
  const { scene, camera } = setup({ top: '#2a0c14' });
  const back = new THREE.Mesh(new THREE.SphereGeometry(30, 48, 32), flesh('#4a1418', 6, { side: THREE.BackSide, clearcoat: 0, roughness: 0.8 })); scene.add(back);
  const mac = [macrophage(0), macrophage(5)]; mac[0].position.set(-1.2, 1.2, 0); mac[1].position.set(1.4, -2.2, -1); scene.add(...mac);
  const rbcG = bloodCellGeo(0.45);
  const cells = Array.from({ length: 22 }, (_, i) => {
    const m = new THREE.Mesh(rbcG, wet('#b3121c', { clearcoat: 0.8 }));
    const tgt = mac[i % 2].position;
    m.userData = { from: new THREE.Vector3((rnd(i) - 0.5) * 7, (rnd(i + 0.3) - 0.5) * 9, (rnd(i + 0.6) - 0.5) * 3), to: tgt.clone().add(new THREE.Vector3((rnd(i + 1) - 0.5) * 1.4, (rnd(i + 2) - 0.5) * 1.4, (rnd(i + 3) - 0.5) * 0.8)), d: rnd(i + 0.9) };
    scene.add(m); return m;
  });
  studio(scene, { target: [0, 0, 0], keyI: 14, keyPos: [-4, 6, 10], rim: '#7fb8ff' });
  const update = (t) => {
    const eat = lerp(P(p, 'eat0', 0), P(p, 'eat1', 1), ease(t));
    cells.forEach((c, i) => {
      const u = c.userData, k = clamp01(eat * 1.6 - u.d * 0.6);
      c.position.lerpVectors(u.from, u.to, ease(k)); c.rotation.set(i + t * 2, i * 0.5, t);
      c.scale.setScalar(1 - 0.45 * k);
      c.material.color.set('#b3121c').lerp(new THREE.Color('#5f8a2e'), clamp01(k * 1.4 - 0.4));
    });
    mac.forEach((m, i) => { m.rotation.y = t * 0.6 + i; m.scale.setScalar(1 + 0.04 * Math.sin(t * 9 + i)); });
    orbit(camera, p, t, { az0: 0.3, az1: -0.1, el0: 0.1, el1: 0.05, dist0: 22, dist1: 19, ty0: -0.4, ty1: -0.4 });
  };
  return done(scene, camera, update);
}

// Ball-and-stick pigment molecule (a ring of four rings, like heme / bile pigments)
function molecule(color, seed = 0, open = 0) {
  const g = new THREE.Group();
  const atomM = glowMat(color, 0.35), bondM = new THREE.MeshPhysicalMaterial({ color: '#e8e8e8', roughness: 0.3 });
  const pts = [];
  for (let r = 0; r < 4; r++) {
    const a = (r / 4) * Math.PI * 2 + Math.PI / 4, cx = Math.cos(a) * 1.6, cy = Math.sin(a) * 1.6;
    for (let k = 0; k < 5; k++) { const b = a + Math.PI + (k - 2) * 0.9; pts.push(new THREE.Vector3(cx + Math.cos(b) * 0.55 * (1 + open * (r === 0 ? 1.4 : 0)), cy + Math.sin(b) * 0.55, (rnd(r * 5 + k + seed) - 0.5) * 0.2)); }
  }
  pts.forEach((v, i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(i % 5 === 2 ? 0.26 : 0.2, 24, 16), atomM); s.position.copy(v); g.add(s);
    const nb = pts[(i + 1) % pts.length];
    if (i % 5 !== 4 || true) { const len = v.distanceTo(nb); if (len < 1.8) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 8), bondM); b.position.copy(v).add(nb).multiplyScalar(0.5); b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), nb.clone().sub(v).normalize()); g.add(b); } }
  });
  g.userData.atomM = atomM;
  return g;
}

// 4 — pigment change: hemoglobin (red, iron centre) -> biliverdin (green) -> bilirubin (yellow). params: st0/st1 (0..2)
function pigment(p) {
  const { scene, camera } = setup({ top: '#121018' });
  const mols = [molecule('#e0283a', 1), molecule('#4fd06a', 2, 0.6), molecule('#ffcc33', 3, 0.9)];
  const iron = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 24), glowMat('#ff7a3a', 0.8)); mols[0].add(iron);
  mols.forEach((m) => scene.add(m));
  const names = ['HEMOGLOBIN', 'BILIVERDIN', 'BILIRUBIN'].map((s, i) => { const l = label(s, { color: ['#e0283a', '#4fd06a', '#ffcc33'][i], size: 0.55 }); scene.add(l); return l; });
  studio(scene, { target: [0, 0, 0], keyI: 14, keyPos: [-4, 6, 10], rim: '#9f7aff' });
  const update = (t) => {
    const st = lerp(P(p, 'st0', 0), P(p, 'st1', 2), ease(t));
    mols.forEach((m, i) => {
      const w = clamp01(1 - Math.abs(st - i)); m.visible = w > 0.02;
      m.scale.setScalar(0.4 + 0.6 * ease(w)); m.rotation.set(0.3 * Math.sin(t * 2), t * 1.2 + i, 0.2);
      names[i].userData.place(new THREE.Vector3(0, -2.4 * m.scale.x, 0), new THREE.Vector3(0, -3.3, 0.5), w > 0.6 ? (w - 0.6) * 2.5 : 0);
    });
    orbit(camera, p, t, { az0: 0.1, az1: -0.1, el0: 0.05, el1: 0.05, dist0: 15, dist1: 13.5, ty0: -0.8, ty1: -0.9 });
  };
  return done(scene, camera, update);
}

// 5 — two-week timeline: five skin tiles, day 1 -> day 14. params: reveal (0..1 tiles appear)
function timeline(p) {
  const { scene, camera } = setup({ top: '#141016' });
  const days = [[1, 0.2], [3, 1.6], [6, 2.7], [10, 3.8], [14, 4.85]];
  const tiles = days.map(([day, s], i) => {
    const g = new THREE.Group(); g.position.set(0, 7 - i * 3.5, 0); scene.add(g);
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = '#c48a70'; x.fillRect(0, 0, 256, 256);
    const col = stageColor(s), fade = s > 4 ? 1 - (s - 4) : 1;
    for (let k = 0; k < 18; k++) { const cx = 128 + (rnd(k + i) - 0.5) * 70, cy = 128 + (rnd(k + i + 0.5) - 0.5) * 60, r = 30 + rnd(k + 0.7) * 40; const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, col.getStyle().replace('rgb', 'rgba').replace(')', `,${0.5 * fade})`)); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const tile = new THREE.Mesh(new RoundedBoxGeometry(3, 3, 0.5, 4, 0.12), [0, 1, 2, 3, 4, 5].map((f) => f === 4 ? new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.55, sheen: 0.4, sheenColor: new THREE.Color('#ffc9b0') }) : wet('#e58c8a')));
    tile.position.x = 1.0; g.add(tile);
    const l = label(`DAY ${day}`, { color: col.getStyle(), size: 0.6 }); g.add(l);
    g.userData = { l, tile };
    return g;
  });
  studio(scene, { target: [0, 0, 0], keyI: 14, keyPos: [-4, 6, 12] });
  const update = (t) => {
    tiles.forEach((g, i) => {
      const k = seg(t, P(p, 'reveal0', 0) + i * 0.12, P(p, 'reveal0', 0) + i * 0.12 + 0.15);
      g.scale.setScalar(0.001 + ease(k)); g.userData.tile.rotation.y = -0.35 + 0.15 * Math.sin(t * 3 + i);
      g.userData.l.userData.place(new THREE.Vector3(-0.5, 0, 0.3), new THREE.Vector3(-1.0, 0, 0.6), k);
    });
    orbit(camera, p, t, { az0: 0.15, az1: 0.05, el0: 0.05, el1: 0.05, dist0: 34, dist1: 34, ty0: 4, ty1: -1.0, tx0: 0.2, tx1: 0.2 });
  };
  return done(scene, camera, update);
}

run({ impact, spot, macro, pigment, timeline });
