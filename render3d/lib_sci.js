// Shared props for the long-form science episodes: camera helpers, bloom finish,
// holographic screens, DNA, cells, neurons, brain, heart, X-ray body, a jointed
// humanoid rig (person or robot) with a walk cycle, neural-net graphs, data streams.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { n3, ease, lerp, flesh, displace, baseScene, cam, bloom, fineNormal } from './lib3d.js';

export { THREE, RoundedBoxGeometry, n3, ease, lerp, flesh, displace, baseScene, cam, bloom };
export const clamp01 = (t) => Math.min(1, Math.max(0, t));
export const seg = (t, a, b) => clamp01((t - a) / (b - a));
export const P = (p, k, d) => (p[k] === undefined ? d : p[k]);
export const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Orbit camera around (tx, ty, 0): az/el/dist/tx/ty lerp from *0 to *1 over the shot.
export function orbit(camera, p, t, d = {}) {
  const k = ease(t), g = (n, def) => lerp(P(p, n + '0', d[n + '0'] ?? def), P(p, n + '1', d[n + '1'] ?? def), k);
  const az = g('az', 0), el = g('el', 0.15), r = g('dist', 12), tx = g('tx', 0), ty = g('ty', 0), tz = g('tz', 0);
  camera.position.set(Math.sin(az) * Math.cos(el) * r + tx, Math.sin(el) * r + ty, Math.cos(az) * Math.cos(el) * r + tz);
  camera.lookAt(tx, ty, tz);
}

// Bloom render; the first frame runs update twice so camera-facing parts see the placed camera.
export function finish(scene, camera, update, b = {}) {
  let first = true;
  const upd = (t) => { update(t); if (first) { update(t); first = false; } };
  return { scene, camera, update: upd, render: bloom(scene, camera, { strength: b.strength ?? 0.7, radius: b.radius ?? 0.5, threshold: b.threshold ?? 0.75 }) };
}

export function starfield(scene, n = 6000, R = 160) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = rnd(i) * 2 - 1, a = rnd(i + 0.5) * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(a) * s * R, u * R, Math.sin(a) * s * R], i * 3);
    const b = 0.25 + rnd(i + 0.25) ** 3 * 1.3; col.set([b, b, b * 1.05], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, vertexColors: true, fog: false }));
  scene.add(pts); return pts;
}

// Floating dust / particles in a box, gently drifting
export function motes(scene, n = 400, size = 20, color = '#9fd8ff', opacity = 0.6) {
  const pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([(rnd(i) - 0.5) * size, (rnd(i + 0.3) - 0.5) * size * 0.6, (rnd(i + 0.6) - 0.5) * size]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size: 2.5, sizeAttenuation: false, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(pts);
  pts.userData.update = (t) => {
    const a = g.attributes.position;
    base.forEach((b, i) => a.setXYZ(i, b[0] + Math.sin(t * 2 + i) * 0.3, b[1] + Math.sin(t * 1.3 + i * 0.7) * 0.3, b[2]));
    a.needsUpdate = true;
  };
  return pts;
}

// ---------- holographic screen ----------
// draw(ctx, t, w, h) paints a 2D canvas each frame; the panel glows (bloom) and has scanlines.
export function holoPanel(w = 4, h = 2.25, draw, { res = 1024, color = '#57d8ff', frame = true } = {}) {
  const c = document.createElement('canvas'); c.width = res; c.height = Math.round(res * h / w);
  const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat));
  if (frame) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
    g.add(e);
  }
  g.userData.update = (t) => {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = 'rgba(10,40,60,0.35)'; ctx.fillRect(0, 0, c.width, c.height);
    draw(ctx, t, c.width, c.height);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = 0; y < c.height; y += 4) ctx.fillRect(0, y, c.width, 1);
    tex.needsUpdate = true;
  };
  return g;
}
// Canvas helpers for panels
export function txt(ctx, s, x, y, size, color = '#bff0ff', align = 'left', weight = 800) {
  ctx.font = `${weight} ${size}px sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}
export function lineChart(ctx, x, y, w, h, fn, k, color = '#57d8ff', lw = 4) {
  ctx.strokeStyle = 'rgba(120,200,255,0.25)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(x, y + h * i / 4); ctx.lineTo(x + w, y + h * i / 4); ctx.stroke(); }
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath();
  const n = Math.max(2, Math.floor(120 * k));
  for (let i = 0; i <= n; i++) { const u = i / 120; const v = fn(u); const px = x + u * w, py = y + h - v * h; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke();
}

// ---------- biology ----------
const BASE_COLORS = { A: '#ff5a5a', T: '#ffd23f', G: '#4dd2ff', C: '#5dff8f' };
// DNA double helix along y. Returns group with .pairs (each {mesh, letters}) for highlighting/cutting.
export function dnaHelix({ turns = 3, radius = 1, pitch = 3.4, perTurn = 10, seed = 0 } = {}) {
  const g = new THREE.Group(), n = turns * perTurn, H = turns * pitch;
  const back = new THREE.MeshPhysicalMaterial({ color: '#d8e6ff', roughness: 0.3, clearcoat: 1, emissive: '#2a3c66', emissiveIntensity: 0.4 });
  for (const off of [0, Math.PI]) {
    const pts = [];
    for (let i = 0; i <= n * 4; i++) { const u = i / (n * 4), a = u * turns * Math.PI * 2 + off; pts.push(new THREE.Vector3(Math.cos(a) * radius, u * H - H / 2, Math.sin(a) * radius)); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 8, radius * 0.11, 12), back));
  }
  const pairs = [];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n, a = u * turns * Math.PI * 2, y = u * H - H / 2;
    const L = 'ATGC'[Math.floor(rnd(i + seed) * 4)], R = { A: 'T', T: 'A', G: 'C', C: 'G' }[L];
    const pg = new THREE.Group(); pg.position.y = y; pg.rotation.y = -a; g.add(pg);
    const mk = (letter, s) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.07, radius * 0.07, radius * 0.95, 12),
        new THREE.MeshPhysicalMaterial({ color: BASE_COLORS[letter], emissive: BASE_COLORS[letter], emissiveIntensity: 0.35, roughness: 0.35 }));
      m.rotation.z = Math.PI / 2; m.position.x = s * radius * 0.5; pg.add(m); return m;
    };
    pairs.push({ group: pg, left: mk(L, 1), right: mk(R, -1), letters: [L, R], y });
  }
  g.userData.pairs = pairs; g.userData.height = H;
  return g;
}

// A cell: translucent wobbly membrane + nucleus + a few organelles
export function cell({ r = 1, color = '#ff9aa8', nucleus = '#7a3cff', seed = 0 } = {}) {
  const g = new THREE.Group();
  const mg = new THREE.SphereGeometry(r, 96, 64);
  displace(mg, (v) => r * 0.07 * n3(v.x * 2 / r + seed, v.y * 2 / r, v.z * 2 / r));
  g.add(new THREE.Mesh(mg, new THREE.MeshPhysicalMaterial({ color, roughness: 0.25, transmission: 0.6, thickness: r, transparent: true, opacity: 0.55, clearcoat: 1, depthWrite: false })));
  const nu = new THREE.Mesh(new THREE.SphereGeometry(r * 0.38, 48, 32), new THREE.MeshPhysicalMaterial({ color: nucleus, roughness: 0.4, emissive: nucleus, emissiveIntensity: 0.25 }));
  nu.position.set(r * 0.1, 0, 0); g.add(nu);
  for (let i = 0; i < 6; i++) {
    const o = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.06, r * 0.18, 4, 12), new THREE.MeshPhysicalMaterial({ color: '#ffb347', roughness: 0.5 }));
    o.position.set((rnd(i + seed) - 0.5) * r * 1.1, (rnd(i + seed + 0.3) - 0.5) * r * 1.1, (rnd(i + seed + 0.6) - 0.5) * r * 1.1).clampLength(0, r * 0.75);
    o.rotation.set(i, i * 2, 0); g.add(o);
  }
  g.userData.nucleus = nu;
  return g;
}

export function bloodCellGeo(r = 0.5) {
  const pts = [];
  for (let i = 0; i <= 32; i++) { const a = (i / 32) * Math.PI, x = Math.sin(a), y = Math.cos(a); pts.push(new THREE.Vector2(Math.max(0.001, r * x), r * 0.34 * y * (0.35 + 0.65 * x * x))); }
  const g = new THREE.LatheGeometry(pts, 48); g.computeVertexNormals(); return g;
}

// Folded brain (two hemispheres) — sulci carved along noise zero-crossings
export function brainMesh(color = '#d98c94') {
  const g = new THREE.SphereGeometry(2.6, 220, 160);
  displace(g, (v) => -0.32 * Math.exp(-Math.abs(n3(v.x * 1.7, v.y * 1.7, v.z * 1.7)) * 14)
    - 0.14 * Math.exp(-Math.abs(n3(v.x * 3.6 + 9, v.y * 3.6, v.z * 3.6)) * 16)
    - 0.45 * Math.exp(-(v.x * v.x) / 0.04) * (v.y > -1 ? 1 : 0));
  const m = new THREE.Mesh(g, flesh(color, 2, { clearcoat: 0.8, sheen: 0.3 }));
  m.scale.set(1.0, 0.85, 1.3);
  return m;
}

// Neuron: soma + branching dendrites + long axon; .pulse(t) lights spikes travelling down the axon
export function neuron({ seed = 0, color = '#7fd4ff', len = 6 } = {}) {
  const g = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.4, clearcoat: 0.5 });
  const soma = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 24), mat); g.add(soma);
  const branch = (from, dir, depth, r, k) => {
    const pts = [from.clone()]; let p = from.clone(), d = dir.clone();
    for (let i = 0; i < 6; i++) { d.add(new THREE.Vector3(rnd(k + i) - 0.5, rnd(k + i + 0.3) - 0.5, rnd(k + i + 0.6) - 0.5).multiplyScalar(0.6)).normalize(); p = p.clone().addScaledVector(d, 0.35); pts.push(p); }
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 8), mat));
    if (depth > 0) for (let b = 0; b < 2; b++) branch(p, d.clone().add(new THREE.Vector3(rnd(k + b) - 0.5, rnd(k + b + 1) - 0.5, rnd(k + b + 2) - 0.5)).normalize(), depth - 1, r * 0.6, k * 3 + b + 7);
  };
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; branch(new THREE.Vector3(), new THREE.Vector3(Math.cos(a), 0.8, Math.sin(a)).normalize(), 2, 0.09, seed * 10 + i); }
  const axonPts = []; for (let i = 0; i <= 12; i++) axonPts.push(new THREE.Vector3(Math.sin(i * 0.6 + seed) * 0.4, -i * len / 12, Math.cos(i * 0.5 + seed) * 0.3));
  const axon = new THREE.CatmullRomCurve3(axonPts);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(axon, 80, 0.1, 10), mat));
  const spike = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffffff' })); g.add(spike);
  g.userData.pulse = (u) => { spike.visible = u >= 0 && u <= 1; if (spike.visible) spike.position.copy(axon.getPointAt(u)); soma.material.emissiveIntensity = 0.35 + (u >= 0 && u < 0.1 ? 1.2 : 0); };
  return g;
}

// Stylised beating heart
export function heartMesh() {
  const g = new THREE.SphereGeometry(1, 128, 96);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const lobe = y > 0 ? 1 + 0.35 * Math.exp(-((Math.abs(x) - 0.45) ** 2) / 0.08) : 1;
    const point = y < 0 ? 1 - 0.55 * (-y) ** 1.5 : 1;
    p.setXYZ(i, x * 1.15 * point * lobe, y * 1.25 - (y > 0.6 ? 0.25 * Math.exp(-(x * x) / 0.02) : 0), z * 0.85 * point);
  }
  g.computeVertexNormals();
  displace(g, (v) => 0.04 * n3(v.x * 3, v.y * 3, v.z * 3));
  const m = new THREE.Mesh(g, flesh('#b8323d', 3, { clearcoat: 1, clearcoatRoughness: 0.1 }));
  const aorta = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.1, 0.9, 0), new THREE.Vector3(0.2, 1.6, 0), new THREE.Vector3(-0.4, 1.9, 0), new THREE.Vector3(-0.8, 1.4, 0)]), 40, 0.22, 16), flesh('#c44a55', 2));
  m.add(aorta);
  m.rotation.z = -0.35;
  return m;
}

// X-ray human: translucent body shell with glowing skeleton hints and organs
export function xrayBody({ tint = '#57b8ff', organs = true } = {}) {
  const g = new THREE.Group();
  const skin = new THREE.MeshPhysicalMaterial({ color: tint, emissive: tint, emissiveIntensity: 0.12, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, roughness: 0.3 });
  const add = (geo, m, x, y, z, sx = 1, sy = 1, sz = 1, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.z = rz; g.add(o); return o; };
  add(new THREE.SphereGeometry(0.55, 48, 32), skin, 0, 3.55, 0, 0.9, 1.1, 1);
  add(new THREE.CapsuleGeometry(0.85, 1.6, 12, 32), skin, 0, 1.95, 0, 1, 1, 0.6);
  add(new THREE.CapsuleGeometry(0.7, 0.4, 12, 32), skin, 0, 0.75, 0, 1, 1, 0.6);
  for (const s of [-1, 1]) {
    add(new THREE.CapsuleGeometry(0.22, 1.9, 8, 20), skin, s * 1.2, 1.85, 0, 1, 1, 1, s * 0.12);
    add(new THREE.CapsuleGeometry(0.3, 2.6, 8, 20), skin, s * 0.42, -1.1, 0, 1, 1, 1);
  }
  const parts = {};
  if (organs) {
    const glow = (c, e = 0.5) => new THREE.MeshPhysicalMaterial({ color: c, emissive: c, emissiveIntensity: e, roughness: 0.4, transparent: true, opacity: 0.9 });
    parts.heart = add(new THREE.SphereGeometry(0.25, 32, 24), glow('#ff4d5e'), 0.12, 2.3, 0.15, 1, 1.2, 0.9);
    parts.lungL = add(new THREE.SphereGeometry(0.42, 32, 24), glow('#ff9aa8', 0.25), -0.38, 2.45, 0, 0.8, 1.5, 0.7);
    parts.lungR = add(new THREE.SphereGeometry(0.42, 32, 24), glow('#ff9aa8', 0.25), 0.42, 2.45, 0, 0.8, 1.5, 0.7);
    parts.liver = add(new THREE.SphereGeometry(0.4, 32, 24), glow('#b8562f', 0.3), 0.3, 1.5, 0.05, 1.4, 0.7, 0.7);
    parts.stomach = add(new THREE.SphereGeometry(0.28, 32, 24), glow('#ffb07a', 0.3), -0.3, 1.35, 0.1, 1.2, 0.9, 0.7);
    parts.kidneyL = add(new THREE.SphereGeometry(0.16, 24, 16), glow('#c0392b', 0.4), -0.32, 1.0, -0.15, 0.8, 1.3, 0.7);
    parts.kidneyR = add(new THREE.SphereGeometry(0.16, 24, 16), glow('#c0392b', 0.4), 0.32, 1.0, -0.15, 0.8, 1.3, 0.7);
    parts.brain = add(new THREE.SphereGeometry(0.42, 32, 24), glow('#ff9ecf', 0.35), 0, 3.65, 0, 1, 0.8, 1.15);
    parts.pancreas = add(new THREE.CapsuleGeometry(0.07, 0.45, 6, 12), glow('#ffd27a', 0.4), 0.05, 1.2, 0.05, 1, 1, 1, Math.PI / 2.3);
  }
  const bone = new THREE.MeshPhysicalMaterial({ color: '#e8f2ff', emissive: '#9fc8ff', emissiveIntensity: 0.25, transparent: true, opacity: 0.55, depthWrite: false });
  add(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 12), bone, 0, 1.9, -0.25);
  for (let i = 0; i < 6; i++) add(new THREE.TorusGeometry(0.55 - i * 0.02, 0.025, 8, 32, Math.PI * 1.6), bone, 0, 2.9 - i * 0.22, -0.05, 1, 1, 0.6).rotation.x = Math.PI / 2;
  g.userData.parts = parts;
  return g;
}

// ---------- humanoid rig ----------
// Joints: pelvis, spine, neck, shoulderL/R, elbowL/R, hipL/R, kneeL/R, ankleL/R (rotate .x for swing).
export function humanoid({ style = 'robot', color } = {}) {
  const robot = style === 'robot';
  const shell = robot
    ? new THREE.MeshPhysicalMaterial({ color: color || '#aeb4bc', metalness: 0.3, roughness: 0.4, clearcoat: 0.5, envMapIntensity: 0.22 })
    : new THREE.MeshPhysicalMaterial({ color: color || '#8a5a3c', roughness: 0.6, sheen: 0.3, envMapIntensity: 0.3 });
  const dark = new THREE.MeshPhysicalMaterial({ color: robot ? '#2a2f36' : '#3b4a6b', metalness: robot ? 0.6 : 0, roughness: 0.45, envMapIntensity: 0.4 });
  const glow = new THREE.MeshBasicMaterial({ color: '#57d8ff' });
  const J = {}, root = new THREE.Group();
  const joint = (name, parent, x, y, z) => { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); J[name] = j; return j; };
  const limb = (parent, len, r, mat, y0 = 0) => { const m = new THREE.Mesh(robot ? new RoundedBoxGeometry(r * 2, len, r * 2, 3, r * 0.6) : new THREE.CapsuleGeometry(r, len - r * 2, 6, 16), mat); m.position.y = y0 - len / 2; parent.add(m); return m; };
  const pelvis = joint('pelvis', root, 0, 2.0, 0);
  const hips = new THREE.Mesh(robot ? new RoundedBoxGeometry(0.7, 0.3, 0.38, 3, 0.1) : new THREE.CapsuleGeometry(0.2, 0.3, 6, 16), dark); if (!robot) hips.rotation.z = Math.PI / 2; pelvis.add(hips);
  const spine = joint('spine', pelvis, 0, 0.15, 0);
  const torso = new THREE.Mesh(robot ? new RoundedBoxGeometry(0.8, 0.95, 0.45, 4, 0.15) : new THREE.CapsuleGeometry(0.33, 0.55, 8, 20), robot ? shell : dark);
  torso.position.y = 0.5; if (!robot) torso.scale.z = 0.7; spine.add(torso);
  if (robot) { const chest = new THREE.Mesh(new THREE.CircleGeometry(0.09, 24), glow); chest.position.set(0, 0.62, 0.231); spine.add(chest); }
  const neck = joint('neck', spine, 0, 1.0, 0);
  const head = new THREE.Mesh(robot ? new RoundedBoxGeometry(0.38, 0.42, 0.4, 4, 0.14) : new THREE.SphereGeometry(0.22, 32, 24), shell); head.position.y = 0.25; if (!robot) head.scale.set(1, 1.15, 1.05); neck.add(head);
  if (robot) { const visor = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.1, 0.05, 2, 0.02), glow); visor.position.set(0, 0.28, 0.2); neck.add(visor); }
  else { const hair = new THREE.Mesh(new THREE.SphereGeometry(0.235, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshPhysicalMaterial({ color: '#1b1410', roughness: 0.9 })); hair.position.y = 0.28; hair.scale.set(1, 1, 1.05); neck.add(hair); }
  for (const [s, L] of [[1, 'L'], [-1, 'R']]) {
    const sh = joint('shoulder' + L, spine, s * 0.5, 0.88, 0); limb(sh, 0.5, 0.09, robot ? shell : dark);
    const el = joint('elbow' + L, sh, 0, -0.5, 0); limb(el, 0.48, 0.08, robot ? dark : shell);
    const hip = joint('hip' + L, pelvis, s * 0.2, -0.1, 0); limb(hip, 0.85, 0.12, robot ? shell : dark);
    const kn = joint('knee' + L, hip, 0, -0.85, 0); limb(kn, 0.85, 0.1, robot ? dark : dark);
    const an = joint('ankle' + L, kn, 0, -0.85, 0);
    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.12, 0.42, 2, 0.05), robot ? shell : new THREE.MeshPhysicalMaterial({ color: '#1e1e1e', roughness: 0.8 })); foot.position.set(0, -0.06, 0.08); an.add(foot);
  }
  root.userData.joints = J; root.userData.materials = { shell, dark };
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return root;
}
// Walk cycle pose: phase in cycles; stability 0 (wobbly) → 1 (clean)
export function walkPose(rig, phase, { stride = 0.5, wobble = 0 } = {}) {
  const J = rig.userData.joints, a = phase * Math.PI * 2;
  J.hipL.rotation.x = Math.sin(a) * stride; J.hipR.rotation.x = -Math.sin(a) * stride;
  J.kneeL.rotation.x = Math.max(0, -Math.cos(a)) * stride * 1.6; J.kneeR.rotation.x = Math.max(0, Math.cos(a)) * stride * 1.6;
  J.ankleL.rotation.x = -Math.sin(a) * 0.2; J.ankleR.rotation.x = Math.sin(a) * 0.2;
  J.shoulderL.rotation.x = -Math.sin(a) * stride * 0.8; J.shoulderR.rotation.x = Math.sin(a) * stride * 0.8;
  J.elbowL.rotation.x = -0.3; J.elbowR.rotation.x = -0.3;
  J.pelvis.position.y = 2.0 - Math.abs(Math.cos(a)) * 0.05;
  J.pelvis.rotation.z = Math.sin(a) * 0.04 + wobble * Math.sin(a * 0.5 + 1) * 0.25;
  J.spine.rotation.x = 0.05 + wobble * Math.sin(a * 0.7) * 0.2;
}
export function standPose(rig) {
  const J = rig.userData.joints;
  for (const k of Object.keys(J)) J[k].rotation.set(0, 0, 0);
  J.pelvis.position.y = 2.0; J.shoulderL.rotation.z = 0.08; J.shoulderR.rotation.z = -0.08; J.elbowL.rotation.x = -0.15; J.elbowR.rotation.x = -0.15;
}

// ---------- AI ----------
// Layered neural net graph with signal pulses along edges
export function neuralNet({ layers = [5, 8, 8, 4], w = 8, h = 4.5, color = '#57d8ff' } = {}) {
  const g = new THREE.Group(), nodes = [];
  const nm = new THREE.MeshBasicMaterial({ color });
  layers.forEach((n, li) => {
    const col = [];
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), nm.clone());
      m.position.set(-w / 2 + li * w / (layers.length - 1), (i - (n - 1) / 2) * h / Math.max(1, n - 1) * (n > 1 ? 1 : 0), 0); g.add(m); col.push(m);
    }
    nodes.push(col);
  });
  const edges = [], pos = [];
  for (let li = 0; li < layers.length - 1; li++) for (const a of nodes[li]) for (const b of nodes[li + 1]) { pos.push(a.position.x, a.position.y, 0, b.position.x, b.position.y, 0); edges.push([a, b, li]); }
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.add(new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.18 })));
  const pulses = Array.from({ length: 60 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' })); g.add(m); return { m, e: edges[Math.floor(rnd(i) * edges.length)], ph: rnd(i + 0.5) }; });
  g.userData.update = (t, speed = 1) => {
    const wave = (t * speed * 1.2) % 1 * (layers.length - 1);
    for (const p of pulses) {
      const [a, b, li] = p.e, u = wave - li + p.ph * 0.3 - 0.15;
      p.m.visible = u > 0 && u < 1; if (p.m.visible) p.m.position.lerpVectors(a.position, b.position, u);
    }
    nodes.forEach((col, li) => col.forEach((m, i) => { const on = Math.abs(wave - li) < 0.4; m.material.color.set(on ? '#ffffff' : color); m.scale.setScalar(on ? 1.5 : 1); }));
  };
  return g;
}

// Particles flowing along a curve
export function dataStream(curve, n = 300, color = '#57d8ff', size = 3) {
  const pos = new Float32Array(n * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  const v = new THREE.Vector3();
  pts.userData.update = (t, speed = 0.3) => {
    for (let i = 0; i < n; i++) {
      curve.getPointAt(((rnd(i) + t * speed) % 1 + 1) % 1, v);
      g.attributes.position.setXYZ(i, v.x + (rnd(i + 0.2) - 0.5) * 0.25, v.y + (rnd(i + 0.4) - 0.5) * 0.25, v.z + (rnd(i + 0.6) - 0.5) * 0.25);
    }
    g.attributes.position.needsUpdate = true;
  };
  return pts;
}

// Glowing tech floor grid
export function techFloor(scene, { size = 60, color = '#1d6f8f', y = 0, matte = false } = {}) {
  const grid = new THREE.GridHelper(size, size, color, color); grid.position.y = y;
  grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(size, size), matte
    ? new THREE.MeshStandardMaterial({ color: '#0a1820', roughness: 0.85, metalness: 0.1, envMapIntensity: 0.1 })
    : new THREE.MeshPhysicalMaterial({ color: '#05121a', roughness: 0.35, metalness: 0.2, clearcoat: 0.5, envMapIntensity: 0.15 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = y - 0.01; floor.receiveShadow = true; scene.add(floor);
  return grid;
}

// Earth with procedural texture
export function earthTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const x = c.getContext('2d'), img = x.createImageData(1024, 512);
  for (let j = 0; j < 512; j++) for (let i = 0; i < 1024; i++) {
    const lon = (i / 1024) * Math.PI * 2, lat = (j / 512 - 0.5) * Math.PI;
    const px = Math.cos(lat) * Math.cos(lon), py = Math.sin(lat), pz = Math.cos(lat) * Math.sin(lon);
    const h = n3(px * 1.8, py * 1.8, pz * 1.8) + 0.5 * n3(px * 4, py * 4, pz * 4);
    let r, gg, b;
    if (Math.abs(lat) > 1.2) [r, gg, b] = [235, 240, 245];
    else if (h > 0.08) { const k = Math.min(1, (h - 0.08) * 3); [r, gg, b] = [lerp(70, 150, k), 120, lerp(50, 70, k)]; }
    else [r, gg, b] = [20, lerp(60, 90, h + 0.5), lerp(130, 170, h + 0.5)];
    img.data.set([r, gg, b, 255], (j * 1024 + i) * 4);
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function keyLights(scene, { key = '#ffffff', keyI = 1.6, fill = '#9fc0ff', fillI = 0.6, hemi = 0.35 } = {}) {
  const k = new THREE.DirectionalLight(key, keyI); k.position.set(5, 8, 6); k.castShadow = true; k.shadow.mapSize.set(2048, 2048);
  k.shadow.camera.left = -12; k.shadow.camera.right = 12; k.shadow.camera.top = 12; k.shadow.camera.bottom = -12; scene.add(k);
  const f = new THREE.DirectionalLight(fill, fillI); f.position.set(-6, 3, -4); scene.add(f);
  scene.add(new THREE.HemisphereLight('#ffffff', '#202430', hemi));
  return { k, f };
}
