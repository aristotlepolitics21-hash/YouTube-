// "Why do your fingers wrinkle in water?" — a fingertip in bath water that prunes up; a cutaway
// of the fingertip (bone, nail, fatty pulp, vessels, nerve) where the nerve fires, the vessels
// under the pad shrink and the skin crumples into ridges; and wrinkled fingertip vs tire tread.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, label, path3, wet, glowMat, flesh,
  skinMat, rim, tissueMap, smooth, band, slab, decal, C,
} from './lib_body.js';
import { organicTube, bumpNormalMap } from './lib3d.js';
import { run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// wrinkle pattern on the fingertip: wavy ridges running across the pad
// narrow deep grooves between soft ridges, meandering like a pruned fingertip
const ridge = (u, v, seed = 0) => { const w = u * 120 + 4.5 * n3(u * 5 + seed, v * 2.5, 1) + 1.6 * Math.sin(v * 7 + u * 9); return 1 - Math.pow(Math.abs(Math.sin(w)), 0.35); };

// Fingerprint (whorl) normal map for the pad
function printNormal(size = 1024) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  x.fillStyle = '#808080'; x.fillRect(0, 0, size, size);
  x.strokeStyle = '#d8d8d8'; x.lineWidth = 3.5;
  for (let r = 6; r < size * 0.9; r += 11) { x.beginPath(); for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.05) { const rr = r * (1 + 0.06 * Math.sin(a * 3 + r * 0.02)); const px = size / 2 + Math.cos(a) * rr * 1.4, py = size * 0.62 + Math.sin(a) * rr; a ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
  // height -> normal
  const img = x.getImageData(0, 0, size, size), out = x.createImageData(size, size), h = (i, j) => img.data[((j + size) % size * size + (i + size) % size) * 4] / 255;
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const dx = (h(i - 1, j) - h(i + 1, j)) * 2.5, dy = (h(i, j - 1) - h(i, j + 1)) * 2.5, l = Math.hypot(dx, dy, 1), k = (j * size + i) * 4;
    out.data[k] = (dx / l * 0.5 + 0.5) * 255; out.data[k + 1] = (dy / l * 0.5 + 0.5) * 255; out.data[k + 2] = (1 / l * 0.5 + 0.5) * 255; out.data[k + 3] = 255;
  }
  x.putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// 3D fingertip along +x (tip at x=0), pad facing -y. setWrinkle(k) deforms the pad.
function fingertip() {
  const pts = [];
  for (let i = 0; i <= 260; i++) {
    const y = -7 + (i / 260) * 7.05; let r;
    if (y < -1.5) r = 1.0 + (y < -5.6 ? 0.06 * (-(y + 5.6)) : 0);
    else r = Math.pow(Math.max(0, 1 - Math.pow((y + 1.5) / 1.55, 2.4)), 1 / 2.4);
    pts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  const g = new THREE.LatheGeometry(pts, 420); g.rotateZ(-Math.PI / 2);   // axis along +x
  const p = g.attributes.position, base = Float32Array.from(p.array), uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { p.setY(i, base[i * 3 + 1] * 0.88); p.setZ(i, base[i * 3 + 2] * 1.12); }
  // pad bulge on the underside near the tip
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); if (y < 0 && x > -3.4) p.setY(i, y * (1 + 0.12 * Math.exp(-((x + 1.3) ** 2) / 1.2))); }
  g.computeVertexNormals();
  const rest = Float32Array.from(p.array), nrm = Float32Array.from(g.attributes.normal.array);
  const mat = skinMat('#c4846a', 0.35); mat.sheen = 0.3;
  mat.normalMap = printNormal(); mat.normalScale = new THREE.Vector2(0.5, 0.5); mat.normalMap.repeat.set(6, 12);
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true;
  // nail
  const nailG = new THREE.SphereGeometry(1, 64, 32, 0, Math.PI * 2, 0, 0.62); nailG.scale(1.55, 0.18, 0.78); nailG.rotateZ(-0.05);
  const nail = new THREE.Mesh(nailG, new THREE.MeshPhysicalMaterial({ color: '#f2d6cc', roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, transmission: 0.25, thickness: 0.2, sheen: 0.5, sheenColor: new THREE.Color('#ffffff') }));
  nail.position.set(-1.55, 0.72, 0); // (hidden: the shots look at the pad side)
  let last = -1;
  m.userData.setWrinkle = (k) => {
    if (Math.abs(k - last) < 0.005) return; last = k;
    for (let i = 0; i < p.count; i++) {
      const x = rest[i * 3], y = rest[i * 3 + 1], z = rest[i * 3 + 2];
      const pad = clamp01((x + 3.8) / 1.2) * clamp01(-y / 0.3 + 0.75), top = THREE.MathUtils.smoothstep(0.55, 0.1, y) * clamp01((x + 3.4) / 1.0) * 0.3;
      const amt = k * (0.075 * pad + 0.02 * top) * ridge(uv.getX(i), uv.getY(i) * 4, 1);
      p.setXYZ(i, x - nrm[i * 3] * amt, y - nrm[i * 3 + 1] * amt, z - nrm[i * 3 + 2] * amt);
    }
    p.needsUpdate = true; g.computeVertexNormals();
    mat.color.set('#c4846a').lerp(new THREE.Color('#d8ae9c'), k * 0.5);  // waterlogged skin goes paler
  };
  m.userData.setWrinkle(0);
  return m;
}

// Bath water: a rippling transmissive surface
function water(scene, size = 30, y = 0) {
  const geo = new THREE.PlaneGeometry(size, size, 160, 160); geo.rotateX(-Math.PI / 2);
  const base = Float32Array.from(geo.attributes.position.array);
  const m = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: '#3f86c0', roughness: 0.03, metalness: 0, transparent: true, opacity: 0.28, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.5, depthWrite: false }));
  m.position.y = y; scene.add(m);
  return (t, cx = 0) => {
    const a = geo.attributes.position;
    for (let i = 0; i < a.count; i++) { const x = base[i * 3], z = base[i * 3 + 2], r = Math.hypot(x - cx, z); a.setY(i, 0.04 * Math.sin(r * 3 - t * 12) * Math.exp(-r * 0.25) + 0.015 * n3(x * 0.5, z * 0.5, t)); }
    a.needsUpdate = true; geo.computeVertexNormals();
  };
}

// 1 — the finger in the bath. params: k0/k1 (wrinkle), dunk (in water), bubbles, cam
function finger(p) {
  const { scene, camera } = setup();
  const f = fingertip(); scene.add(f);
  const inWater = P(p, 'dunk', 1);
  const ripple = inWater ? water(scene, 30, -0.35) : null;
  const bubM = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0, transmission: 1, thickness: 0.1, clearcoat: 1, transparent: true, opacity: 0.6 });
  const bubs = inWater ? Array.from({ length: 40 }, (_, i) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.03 + rnd(i) * 0.06, 16, 12), bubM); scene.add(b); return b; }) : [];
  studio(scene, { target: [-1.5, 0, 0], keyI: 6, keyPos: [-6, 5, 6], rim: '#ffb59a', rimI: 7, rimPos: [6, 2, -6], hemi: 0.12 });
  const update = (t) => {
    const k = lerp(P(p, 'k0', 0), P(p, 'k1', 1), ease(t));
    f.userData.setWrinkle(k);
    f.rotation.set(P(p, 'roll', -1.15), P(p, 'yaw', 0.25), P(p, 'pitch', 0.1));
    f.position.y = 0.04 * Math.sin(t * 3);
    if (ripple) ripple(t, 0);
    bubs.forEach((b, i) => { const u = (rnd(i) + t * 0.35) % 1; b.position.set(-3.5 + rnd(i + 0.2) * 3.5, -1.3 + u * 1.0, (rnd(i + 0.4) - 0.5) * 2.4); b.visible = u < 0.95; });
    orbit(camera, p, t, { az0: 0.55, az1: 0.4, el0: 0.3, el1: 0.26, dist0: 12, dist1: 10, tx0: -1.6, tx1: -1.5, ty0: -0.1, ty1: -0.1 });
  };
  return done(scene, camera, update, { aperture: 0.0032, maxblur: 0.008 });
}

// 2 — side cutaway of the fingertip. params: k0/k1 (wrinkle), c0/c1 (vessels constrict), pulse, damaged, labels, cam
const TOP = [[-7.2, 0.95], [-4, 1.0], [-2.0, 1.02], [-0.9, 0.86], [-0.25, 0.45], [0.05, -0.05], [-0.25, -0.6], [-0.9, -1.0], [-2.0, -1.18], [-3.5, -1.08], [-5.5, -0.98], [-7.2, -0.96]];
function cut(p) {
  const { scene, camera } = setup();
  const group = new THREE.Group(); scene.add(group);
  const outline0 = smooth(TOP, 360);
  const shellM = skinMat('#c4846a', 0.4), faceTex = tissueMap('#d98f72', 1024, 5); faceTex.repeat.set(0.25, 0.25);
  const faceM = flesh('#ffffff', 2, { map: faceTex, clearcoat: 0.9, clearcoatRoughness: 0.15 });
  const epiM = rim(flesh('#d9a48c', 2, { clearcoat: 0.5 }), '#9fd0ff', 0.2, 2.5), derM = flesh('#cf767a', 2, { clearcoat: 0.6 });
  const shell = new THREE.Mesh(new THREE.BufferGeometry(), shellM), face = new THREE.Mesh(new THREE.BufferGeometry(), faceM);
  const epi = new THREE.Mesh(new THREE.BufferGeometry(), epiM), der = new THREE.Mesh(new THREE.BufferGeometry(), derM);
  face.position.z = 0.002; epi.position.z = 0.01; der.position.z = 0.006; group.add(shell, face, der, epi);
  // outline with pad wrinkles; offset inward for the skin layers
  const wrinkled = (k) => outline0.map((v, i) => {
    const a = outline0[(i + 1) % outline0.length], b = outline0[(i - 1 + outline0.length) % outline0.length];
    const tx = a.x - b.x, ty = a.y - b.y, l = Math.hypot(tx, ty) || 1, nx = ty / l, ny = -tx / l;   // outward normal (clockwise outline)
    const pad = v.y < -0.2 && v.x > -3.8 ? clamp01((v.x + 3.8) / 0.8) : 0;
    const d = -k * 0.13 * pad * Math.pow(0.5 + 0.5 * Math.sin(v.x * 11 + 0.6 * n3(v.x, 0, 1)), 2);
    return new THREE.Vector2(v.x + nx * d, v.y + ny * d);
  });
  const inset = (o, d) => o.map((v, i) => { const a = o[(i + 1) % o.length], b = o[(i - 1 + o.length) % o.length], tx = a.x - b.x, ty = a.y - b.y, l = Math.hypot(tx, ty) || 1; return new THREE.Vector2(v.x - ty / l * d, v.y + tx / l * d); });
  const ring = (outer, inner) => { const s = new THREE.Shape(outer); s.holes.push(new THREE.Path(inner.slice().reverse())); return s; };
  // The outline is open at the base (x = -7.2); clip skin rings there by using a long box behind
  let lastK = -1;
  const build = (k) => {
    if (Math.abs(k - lastK) < 0.01) return; lastK = k;
    const o = wrinkled(k), i1 = inset(o, 0.12), i2 = inset(o, 0.34);
    shell.geometry.dispose(); face.geometry.dispose(); epi.geometry.dispose(); der.geometry.dispose();
    const sg = new THREE.ExtrudeGeometry(new THREE.Shape(o), { depth: 1.3, bevelEnabled: true, bevelThickness: 0.9, bevelSize: 0.75, bevelOffset: -0.75, bevelSegments: 8, curveSegments: 4 });
    const pp = sg.attributes.position; for (let i = 0; i < pp.count; i++) if (pp.getZ(i) > 1.3) pp.setZ(i, 1.3); sg.translate(0, 0, -1.3 - 0.015); sg.computeVertexNormals();
    shell.geometry = sg;
    face.geometry = new THREE.ShapeGeometry(new THREE.Shape(o)); { const q = face.geometry.attributes.position, u = []; for (let j = 0; j < q.count; j++) u.push(q.getX(j), q.getY(j)); face.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); }
    epi.geometry = new THREE.ExtrudeGeometry(ring(o, i1), { depth: 0.06, bevelEnabled: false });
    der.geometry = new THREE.ShapeGeometry(ring(i1, i2));
  };
  build(0);
  // bone (distal phalanx with a tuft at the tip), nail + nail bed, fat lobules in the pulp
  const boneO = smooth([[-7.2, 0.42], [-4.5, 0.4], [-2.2, 0.32], [-1.1, 0.25], [-0.75, 0.05], [-1.0, -0.22], [-2.2, -0.12], [-4.5, -0.25], [-7.2, -0.32]], 160);
  const bone = slab(boneO, 0.22, new THREE.MeshPhysicalMaterial({ color: '#cdb994', roughness: 0.6, clearcoat: 0.2 })); bone.position.z = 0.003; group.add(bone);
  const marrow = slab(smooth([[-7.2, 0.22], [-3.5, 0.18], [-1.8, 0.1], [-3.5, -0.05], [-7.2, -0.12]], 80), 0.26, wet('#c98a5a')); marrow.position.z = 0.003; group.add(marrow);
  const nailO = band([[-3.5, 1.06], [-2.0, 1.12], [-0.95, 0.98], [-0.55, 0.78]], 0.14, 60);
  const nail = slab(nailO, 0.3, new THREE.MeshPhysicalMaterial({ color: '#f3dcd4', roughness: 0.12, clearcoat: 1, sheen: 0.6, sheenColor: new THREE.Color('#ffffff') })); nail.position.z = 0.004; group.add(nail);
  const bed = slab(band([[-3.5, 0.92], [-2.0, 0.97], [-0.95, 0.84]], 0.12, 60), 0.12, wet('#e0707e')); bed.position.z = 0.004; group.add(bed);
  const fatM = flesh('#efc06a', 3, { clearcoat: 1, clearcoatRoughness: 0.1 });
  const lobes = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 18, 12), fatM, 90); const d = new THREE.Object3D();
  for (let i = 0; i < 90; i++) { d.scale.setScalar(0); d.updateMatrix(); lobes.setMatrixAt(i, d.matrix); const x = -6.5 + rnd(i) * 5.8, yMax = -0.3 - (x > -1.5 ? (x + 1.5) * 0.3 : 0), y = -0.45 - rnd(i + 0.4) * (0.45 + (x > -3 ? 0.15 : 0)); if (y > yMax) continue; const r = 0.1 + rnd(i + 0.7) * 0.09; d.position.set(x, y, 0.03); d.scale.set(r, r * 0.85, r * 0.6); d.updateMatrix(); lobes.setMatrixAt(i, d.matrix); }
  group.add(lobes);
  // vessels: artery + vein along the pad, branching into loops under the skin; nerve beside them
  const artC = path3([[-7.2, -0.55, 0.06], [-4.5, -0.6, 0.06], [-2.4, -0.62, 0.06], [-1.0, -0.45, 0.06], [-0.45, -0.1, 0.06]]);
  const veinC = path3([[-7.2, -0.72, 0.05], [-4.5, -0.75, 0.05], [-2.4, -0.78, 0.05], [-1.0, -0.62, 0.05], [-0.5, -0.3, 0.05]]);
  const capCs = Array.from({ length: 9 }, (_, i) => { const x = -3.4 + i * 0.36; return path3([[x, -0.62, 0.06], [x + 0.05, -0.86, 0.06], [x + 0.18, -0.9, 0.06], [x + 0.2, -0.75, 0.05]]); });
  const artM = wet('#d01e2d', { emissive: new THREE.Color('#ff2020'), emissiveIntensity: 0 }), veinM = wet('#3b52b0');
  const art = new THREE.Mesh(new THREE.BufferGeometry(), artM), vein = new THREE.Mesh(new THREE.BufferGeometry(), veinM); group.add(art, vein);
  const caps = capCs.map(() => { const m = new THREE.Mesh(new THREE.BufferGeometry(), artM); group.add(m); return m; });
  let lastC = -1;
  const setVessels = (c) => {
    if (Math.abs(c - lastC) < 0.01) return; lastC = c; const s = 1 - 0.62 * c;
    art.geometry.dispose(); art.geometry = new THREE.TubeGeometry(artC, 120, 0.085 * s, 10);
    vein.geometry.dispose(); vein.geometry = new THREE.TubeGeometry(veinC, 120, 0.1 * (1 - 0.3 * c), 10);
    caps.forEach((m, i) => { m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(capCs[i], 20, 0.035 * s, 6); });
  };
  setVessels(0);
  const nerveC = path3([[-7.2, -0.35, 0.07], [-4.5, -0.4, 0.07], [-2.4, -0.42, 0.07], [-1.2, -0.3, 0.07], [-0.55, 0.0, 0.07]]);
  const nerveM = wet(C.nerve, { emissive: '#ffcc00', emissiveIntensity: 0.25 });
  group.add(new THREE.Mesh(new THREE.TubeGeometry(nerveC, 140, 0.06, 8), nerveM));
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), glowMat('#fff3a0', 2.5)); group.add(pulse);
  const xM = glowMat('#ff2a2a', 1.6), xMark = new THREE.Group(); [0.8, -0.8].forEach((r) => { const b = new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.12, 0.1, 2, 0.04), xM); b.rotation.z = r; xMark.add(b); }); xMark.position.set(-4.6, -0.4, 0.3); group.add(xMark);
  const labs = [['NERVE', C.nerve, [-5.5, -0.38, 0.1], [-5.5, -2.6, 0.4]], ['BLOOD VESSELS', '#ff6a6a', [-2.0, -0.62, 0.1], [-2.0, -2.9, 0.4]], ['BONE', '#e8d8b8', [-4.0, 0.1, 0.25], [-4.0, 2.4, 0.4]]]
    .map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.36 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [-2.5, 0, 0], keyI: 5, keyPos: [-4, 7, 10], rim: '#ffb59a', rimI: 6, hemi: 0.1 });
  const Q = new THREE.Vector3();
  const update = (t) => {
    const dmg = P(p, 'damaged', 0);
    build(dmg ? 0 : lerp(P(p, 'k0', 0), P(p, 'k1', 0), ease(t)));
    setVessels(dmg ? 0 : lerp(P(p, 'c0', 0), P(p, 'c1', 0), ease(t)));
    const pu = P(p, 'pulse', 0) ? ((t * 1.6) % 1) : -1;
    pulse.visible = pu >= 0 && !dmg; if (pulse.visible) { nerveC.getPointAt(pu, Q); pulse.position.copy(Q); }
    nerveM.color.set(dmg ? '#7a7466' : C.nerve); nerveM.emissiveIntensity = dmg ? 0 : 0.25 + (pu >= 0 ? 0.4 : 0);
    xMark.visible = !!dmg; xMark.scale.setScalar(dmg ? ease(seg(t, 0.1, 0.25)) + 0.001 : 0.001);
    artM.emissiveIntensity = P(p, 'c1', 0) > 0.5 && !dmg ? 0.3 * seg(t, 0.2, 0.6) : 0;
    labs.forEach((o, i) => o.l.userData.place(o.a, o.b, P(p, 'labels', 0) ? seg(t, 0.1 + i * 0.12, 0.22 + i * 0.12) : 0));
    orbit(camera, p, t, { az0: 0.35, az1: 0.25, el0: 0.12, el1: 0.08, dist0: 22, dist1: 19, tx0: -3.0, tx1: -2.8, ty0: -0.2, ty1: -0.2 });
  };
  return done(scene, camera, update);
}

// 3 — fingertip pad next to a tire tread, water squeezing out through the grooves. params: flow, cam
function tread(p) {
  const { scene, camera } = setup();
  const f = fingertip(); f.userData.setWrinkle(1); f.rotation.set(Math.PI + 0.95, 0.15, 0); f.position.set(2.0, 2.3, 0); scene.add(f);
  // tread block: rubber slab with zig-zag grooves
  const rub = new THREE.MeshPhysicalMaterial({ color: '#1d1e22', roughness: 0.65, clearcoat: 0.3, clearcoatRoughness: 0.5 });
  const tg = new THREE.Group(); tg.position.set(0, -2.4, 0); scene.add(tg);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) { const b = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.55, 0.85, 3, 0.08), rub); b.position.set((i - 2) * 0.78 + (j % 2) * 0.2, 0, (j - 3) * 1.0); b.rotation.y = (j % 2 ? 0.35 : -0.35); tg.add(b); }
  const basePl = new THREE.Mesh(new RoundedBoxGeometry(4.4, 0.5, 7.6, 3, 0.1), rub); basePl.position.y = -0.4; tg.add(basePl);
  tg.rotation.set(1.05, -0.25, 0.1); tg.scale.setScalar(0.85);
  const wM = new THREE.MeshPhysicalMaterial({ color: '#cfeaff', roughness: 0, transmission: 0.9, thickness: 0.3, clearcoat: 1, transparent: true, opacity: 0.8 });
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 12, 8), wM, 220); drops.frustumCulled = false; scene.add(drops);
  const d = new THREE.Object3D();
  const labs = [['WRINKLED FINGERTIP', '#ffd8c0', [0.6, 3.0, 0.6], [0.6, 4.6, 0.8]], ['TIRE TREAD', '#cfd6e0', [0, -3.6, 1.5], [0, -5.3, 1.6]]].map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.38 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [0, 0, 0], keyI: 8, keyPos: [-4, 8, 9], rim: '#ffb59a', rimI: 8, hemi: 0.15 });
  const update = (t) => {
    for (let i = 0; i < 220; i++) {
      const left = i % 2 === 0, u = (rnd(i) + t * 0.9) % 1, a = rnd(i + 0.3) * Math.PI * 2;
      const cx = left ? 0.4 : 0, cy = left ? 1.6 : -2.0;
      d.position.set(cx + Math.cos(a) * (0.6 + u * 2.0), cy - u * u * 1.0, Math.sin(a) * (0.3 + u * 1.2) + 0.8);
      d.scale.setScalar(P(p, 'flow', 1) ? (1 - u) * 1.2 + 0.2 : 0.001); d.updateMatrix(); drops.setMatrixAt(i, d.matrix);
    }
    drops.instanceMatrix.needsUpdate = true;
    labs.forEach((o, i) => o.l.userData.place(o.a, o.b, P(p, 'labels', 1) ? seg(t, 0.15 + i * 0.15, 0.27 + i * 0.15) : 0));
    orbit(camera, p, t, { az0: 0.2, az1: 0.05, el0: 0.1, el1: 0.06, dist0: 24, dist1: 21, ty0: 0, ty1: 0 });
  };
  return done(scene, camera, update);
}

run({ finger, cut, tread });
