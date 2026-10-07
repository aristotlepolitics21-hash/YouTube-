// Scenes for "Can Scientists Grow a New Human Organ?" (16:9 long-form).
import {
  THREE, RoundedBoxGeometry, n3, ease, lerp, flesh, displace, baseScene, cam, seg, P, rnd, orbit, finish,
  motes, holoPanel, txt, dnaHelix, cell, neuron, heartMesh, xrayBody, humanoid, standPose, dataStream, techFloor, keyLights,
} from './lib_sci.js';
import { run, renderer } from './lib3d.js';

renderer.localClippingEnabled = true; // bioprinter reveals the heart layer by layer

const CYAN = '#57d8ff', RED = '#ff4b5c', GREEN = '#4dff9a', AMBER = '#ffb347', PINK = '#ff9ab8';

function kidneyGeo() {
  const g = new THREE.SphereGeometry(1, 128, 96), pa = g.attributes.position;
  for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); const indent = 0.45 * Math.exp(-((x - 1) ** 2) / 0.25) * Math.exp(-(y * y) / 0.35); pa.setXYZ(i, x * 0.85 - indent, y * 1.45, z * 0.6); }
  g.computeVertexNormals(); displace(g, (v) => 0.03 * n3(v.x * 4, v.y * 4, v.z * 4)); return g;
}

// ---------- scenes ----------
function title_card(p) {
  const scene = baseScene('#03070c'); const camera = cam(36);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    ctx.globalAlpha = seg(t, 0.03, 0.4);
    if (p.big) { txt(ctx, p.big, w / 2, h * 0.4, P(p, 'bigSize', 240), P(p, 'color', AMBER), 'center', 900); txt(ctx, P(p, 'sub', ''), w / 2, h * 0.72, 54, '#d8f6ff', 'center', 800); txt(ctx, P(p, 'sub2', ''), w / 2, h * 0.84, 40, '#7fb8d0', 'center', 600); }
    else { txt(ctx, P(p, 'year', ''), w / 2, h * 0.22, 110, AMBER, 'center', 900); P(p, 'lines', [P(p, 'title', '')]).forEach((l, i) => txt(ctx, l, w / 2, h * 0.46 + i * 84, i ? 52 : 68, i ? '#d8f6ff' : '#ffffff', 'center', 900)); txt(ctx, P(p, 'sub', ''), w / 2, h * 0.86, 42, '#7fb8d0', 'center', 700); }
    ctx.globalAlpha = 1;
  }, { res: 1600 });
  scene.add(panel);
  const m = motes(scene, 300, 24, CYAN, 0.3);
  const update = (t) => { panel.userData.update(t); m.userData.update(t); orbit(camera, p, t, { dist0: 11, dist1: 9.5, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Crowd of people waiting, with a counter
function waiting_list(p) {
  const scene = baseScene('#02060c', 0.035); const camera = cam(40);
  const N = 40 * 24, bodyG = new THREE.CapsuleGeometry(0.14, 0.4, 4, 10), headG = new THREE.SphereGeometry(0.13, 12, 8);
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const bodies = new THREE.InstancedMesh(bodyG, mat, N), heads = new THREE.InstancedMesh(headG, mat, N);
  const M = new THREE.Matrix4(), C = new THREE.Color(); let k = 0;
  for (let i = 0; i < 40; i++) for (let j = 0; j < 24; j++, k++) { const x = (i - 19.5) * 0.75, z = (j - 12) * 0.75; M.makeTranslation(x, 0.35, z); bodies.setMatrixAt(k, M); M.makeTranslation(x, 0.82, z); heads.setMatrixAt(k, M); }
  scene.add(bodies, heads); techFloor(scene, { y: 0 });
  const panel = holoPanel(8, 1.6, (ctx, t, w, h) => txt(ctx, `${Math.floor(lerp(0, 100000, ease(seg(t, 0, 0.8)))).toLocaleString()}+ WAITING`, w / 2, h / 2, 120, '#ffffff', 'center', 900), { res: 1600 });
  panel.position.set(0, 4.5, -4); scene.add(panel);
  const update = (t) => {
    for (let i = 0; i < N; i++) { const lost = rnd(i * 7.7) < 0.02 * seg(t, 0.5, 1) / 0.5; C.set(lost ? '#404040' : CYAN).multiplyScalar(lost ? 1 : 0.55 + 0.25 * rnd(i)); bodies.setColorAt(i, C); heads.setColorAt(i, C); }
    bodies.instanceColor.needsUpdate = heads.instanceColor.needsUpdate = true; panel.userData.update(t); panel.lookAt(camera.position);
    orbit(camera, p, t, { dist0: 22, dist1: 16, el0: 0.4, el1: 0.28, az0: -0.4, az1: 0.2, ty0: 1, ty1: 1.5 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.5 });
}

// Lab with glowing bioreactor jars holding organs
function lab(p) {
  const scene = baseScene('#05080c', 0.03); const camera = cam(40);
  techFloor(scene, { y: 0, color: '#1d4a5f' });
  const bench = new THREE.Mesh(new RoundedBoxGeometry(14, 0.3, 3, 3, 0.08), new THREE.MeshPhysicalMaterial({ color: '#8a929c', roughness: 0.4, metalness: 0.2, envMapIntensity: 0.15 })); bench.position.set(0, 1.4, 0); scene.add(bench);
  const legs = new THREE.Mesh(new THREE.BoxGeometry(13.6, 1.4, 2.6), new THREE.MeshPhysicalMaterial({ color: '#2a3038', metalness: 0.5, roughness: 0.4 })); legs.position.set(0, 0.7, 0); scene.add(legs);
  const organs = [heartMesh(), new THREE.Mesh(kidneyGeo(), flesh('#9a3b2e', 3, { clearcoat: 1 })), new THREE.Mesh(new THREE.SphereGeometry(0.9, 64, 48), flesh('#c06a7a', 3))];
  const jars = [];
  [-4.5, 0, 4.5].forEach((x, i) => {
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 3.6, 64, 1, true), new THREE.MeshPhysicalMaterial({ color: '#cfefff', transmission: 0.95, roughness: 0.02, thickness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
    glass.position.set(x, 3.35, 0); scene.add(glass);
    const fluid = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 3.2, 48), new THREE.MeshBasicMaterial({ color: ['#ff7a9a', '#ffb07a', '#9affc8'][i], transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending }));
    fluid.position.set(x, 3.2, 0); scene.add(fluid);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 48), new THREE.MeshPhysicalMaterial({ color: '#8a929c', metalness: 0.8, roughness: 0.3 })); cap.position.set(x, 5.25, 0); scene.add(cap);
    const o = organs[i]; o.scale.multiplyScalar(0.75); o.position.set(x, 3.3, 0); scene.add(o); jars.push(o);
    const pl = new THREE.PointLight(['#ff7a9a', '#ffb07a', '#9affc8'][i], 8, 6, 1.5); pl.position.set(x, 3.3, 1.5); scene.add(pl);
  });
  const bub = motes(scene, 200, 10, '#ffffff', 0.5); bub.position.y = 3.3;
  keyLights(scene, { keyI: 0.9, hemi: 0.3 });
  const update = (t) => {
    jars.forEach((o, i) => { o.rotation.y = t * 0.8 + i; const beat = i === 0 ? Math.max(0, Math.sin(t * Math.PI * 2 * 5)) ** 8 : 0; o.scale.setScalar(0.75 * (1 + beat * 0.08)); });
    bub.userData.update(t);
    orbit(camera, p, t, { dist0: 14, dist1: 11, el0: 0.15, el1: 0.1, az0: -0.3, az1: 0.2, ty0: 3, ty1: 3.2 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.85 });
}

// Operating theatre: patient on a table under a surgical lamp
function transplant_ops(p) {
  const scene = baseScene('#04080a', 0.03); const camera = cam(38);
  techFloor(scene, { y: 0, color: '#2a5a4a' });
  const table = new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.3, 6, 3, 0.1), new THREE.MeshPhysicalMaterial({ color: '#c8d0d8', metalness: 0.6, roughness: 0.3, envMapIntensity: 0.3 })); table.position.y = 1.6; scene.add(table);
  const body = xrayBody({ tint: '#7fd8b0' }); body.rotation.x = -Math.PI / 2; body.scale.setScalar(0.65); body.position.set(0, 2.0, 1.4); scene.add(body);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 0.4, 48), new THREE.MeshPhysicalMaterial({ color: '#e8eef2', metalness: 0.4, roughness: 0.3 })); lamp.position.set(0, 6, 0); scene.add(lamp);
  const lampGlow = new THREE.Mesh(new THREE.CircleGeometry(1.0, 48), new THREE.MeshBasicMaterial({ color: '#fffbe8' })); lampGlow.rotation.x = Math.PI / 2; lampGlow.position.set(0, 5.79, 0); scene.add(lampGlow);
  const spot = new THREE.SpotLight('#fffbe8', 80, 15, 0.6, 0.6); spot.position.set(0, 5.8, 0); spot.target.position.set(0, 1.6, 0); scene.add(spot, spot.target);
  for (const s of [-1, 1]) { const doc = humanoid({ style: 'person', color: '#7a5038' }); standPose(doc); doc.position.set(s * 2.2, 0, -0.5 + s * 0.8); doc.rotation.y = -s * Math.PI / 2; doc.traverse((o) => { if (o.isMesh && o.material === doc.userData.materials.dark) o.material = new THREE.MeshPhysicalMaterial({ color: '#2f7a6a', roughness: 0.8 }); }); const J = doc.userData.joints; J.shoulderL.rotation.x = J.shoulderR.rotation.x = -0.9; J.elbowL.rotation.x = J.elbowR.rotation.x = -0.6; J.spine.rotation.x = 0.25; scene.add(doc); }
  scene.add(new THREE.HemisphereLight('#cfe8e0', '#0a1210', 0.4));
  const kid = body.userData.parts[P(p, 'organ', 'kidneyL')];
  const update = (t) => {
    if (kid) { kid.material.emissive.set(AMBER); kid.material.emissiveIntensity = 0.8 + 0.5 * Math.sin(t * 10); }
    orbit(camera, p, t, { dist0: 11, dist1: 9, el0: 0.4, el1: 0.32, az0: 0.6, az1: 0.9, ty0: 2.2, ty1: 2.2 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.85 });
}

// Immune cells swarming a transplanted organ
function immune_reject(p) {
  const scene = baseScene('#0b0306', 0.03); const camera = cam(36);
  const organ = new THREE.Mesh(kidneyGeo(), flesh('#9a3b2e', 3, { clearcoat: 1 })); organ.scale.setScalar(1.6); scene.add(organ);
  const N = 90, cells = Array.from({ length: N }, (_, i) => {
    const g = new THREE.SphereGeometry(0.22, 24, 16); displace(g, (v) => 0.05 * n3(v.x * 8 + i, v.y * 8, v.z * 8));
    const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: '#e8f0ff', roughness: 0.3, transmission: 0.3, emissive: '#5a7aff', emissiveIntensity: 0.3 })); scene.add(m);
    const u = rnd(i) * 2 - 1, a = rnd(i + 0.5) * 6.28, s = Math.sqrt(1 - u * u); return { m, dir: new THREE.Vector3(Math.cos(a) * s, u * 1.4, Math.sin(a) * s * 0.7) };
  });
  const warn = new THREE.PointLight(RED, 0, 8, 1.5); warn.position.set(0, 0, 3); scene.add(warn);
  keyLights(scene, { key: '#ffe0e8', keyI: 1.1, hemi: 0.35 });
  const update = (t) => {
    const k = ease(seg(t, 0, 0.7)) * P(p, 'attack', 1);
    cells.forEach(({ m, dir }, i) => { const r = lerp(7, 1.65, k * (0.8 + 0.2 * rnd(i))); m.position.copy(dir).multiplyScalar(r); m.position.y *= 1; m.rotation.y = t * 3 + i; });
    warn.intensity = k * (10 + 8 * Math.sin(t * 16));
    organ.material.color.set('#9a3b2e').lerp(new THREE.Color('#4a2020'), k * 0.5);
    orbit(camera, p, t, { dist0: 12, dist1: 9, el0: 0.15, el1: 0.08, az0: -0.3, az1: 0.3 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.75 });
}

function kidney(p) {
  const scene = baseScene('#0b0306', 0.03); const camera = cam(34);
  const k = new THREE.Mesh(kidneyGeo(), flesh(P(p, 'color', '#9a3b2e'), 3, { clearcoat: 1 })); scene.add(k);
  const art = new THREE.CatmullRomCurve3([new THREE.Vector3(0.4, 0.15, 0), new THREE.Vector3(1.4, 0.3, 0.1), new THREE.Vector3(2.6, 0.6, 0), new THREE.Vector3(4, 0.7, 0)]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(art, 60, 0.16, 16), flesh('#c2303a', 2)));
  const flow = dataStream(art, 160, '#ff5a5a', 4); scene.add(flow);
  const glow = new THREE.PointLight(P(p, 'glow', GREEN), 0, 8, 1.5); glow.position.set(-1, 0, 2.5); scene.add(glow);
  keyLights(scene, { keyI: 1.2, hemi: 0.3 });
  const update = (t) => { k.rotation.y = -0.3 + t * 0.4; flow.userData.update(t, 0.4); glow.intensity = P(p, 'healthy', 0) * (8 + 4 * Math.sin(t * 8)); orbit(camera, p, t, { dist0: 8, dist1: 6, el0: 0.2, el1: 0.1, az0: -0.3, az1: 0.2, tx0: 0.8, tx1: 0.6 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.65 });
}

function heart_beat(p) {
  const scene = baseScene('#0a0306', 0.02); const camera = cam(34);
  const h = heartMesh(); scene.add(h);
  const m = motes(scene, 250, 12, '#ff9aa8', 0.35);
  keyLights(scene, { key: '#ffe6e6', keyI: 1.4, hemi: 0.35 });
  const rim = new THREE.PointLight('#ff6a7a', 20, 10, 1.5); rim.position.set(-3, 2, -3); scene.add(rim);
  const update = (t) => {
    const beat = Math.max(0, Math.sin(t * Math.PI * 2 * P(p, 'beats', 7))) ** 8;
    h.scale.setScalar(P(p, 'size', 1) * (1 + beat * 0.08)); h.rotation.y = 0.3 + t * 0.6; m.userData.update(t);
    orbit(camera, p, t, { dist0: 8, dist1: 6, el0: 0.1, el1: 0.05, az0: -0.2, az1: 0.2 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.75 });
}

// Vessels growing into a tissue block; cells far from vessels are grey (starved)
function vessels(p) {
  const scene = baseScene('#0b0306', 0.03); const camera = cam(36);
  const N = 14 * 10 * 6, cg = new THREE.SphereGeometry(0.22, 12, 8);
  const cellsM = new THREE.InstancedMesh(cg, new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.4 }), N);
  const posA = []; const M = new THREE.Matrix4(), C = new THREE.Color(); let k = 0;
  for (let i = 0; i < 14; i++) for (let j = 0; j < 10; j++) for (let l = 0; l < 6; l++) { const v = new THREE.Vector3((i - 6.5) * 0.5, (j - 4.5) * 0.5, (l - 2.5) * 0.5); posA.push(v); M.makeTranslation(v.x, v.y, v.z); cellsM.setMatrixAt(k++, M); }
  scene.add(cellsM);
  const tree = [];
  const grow = (from, dir, depth, r, s) => {
    const to = from.clone().addScaledVector(dir, 1.2 + rnd(s) * 0.6);
    tree.push({ a: from, b: to, r, depth });
    if (depth < 4) for (let b = 0; b < 2; b++) grow(to, dir.clone().add(new THREE.Vector3(rnd(s * 3 + b) - 0.5, rnd(s * 5 + b) - 0.5, rnd(s * 7 + b) - 0.5).multiplyScalar(1.6)).normalize(), depth + 1, r * 0.7, s * 2 + b + 1);
  };
  grow(new THREE.Vector3(-4.5, 0, 0), new THREE.Vector3(1, 0, 0), 0, 0.2, 1);
  const vm = flesh('#c2303a', 2);
  const tubes = tree.map((seg_) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(seg_.r, seg_.r, seg_.a.distanceTo(seg_.b), 10), vm); m.position.copy(seg_.a).add(seg_.b).multiplyScalar(0.5); m.lookAt(seg_.b); m.rotateX(Math.PI / 2); scene.add(m); return m; });
  keyLights(scene, { key: '#ffe0e8', keyI: 1.0, hemi: 0.4 });
  const update = (t) => {
    const g = P(p, 'grow0', 0) + (P(p, 'grow1', 1) - P(p, 'grow0', 0)) * ease(t);
    tubes.forEach((m, i) => { const d = tree[i].depth / 5; m.visible = g > d; });
    const reach = 0.5 + g * 1.5;
    for (let i = 0; i < N; i++) {
      let dmin = 99; for (let s = 0; s < tree.length; s++) { if (tree[s].depth / 5 >= g) continue; const d = posA[i].distanceTo(tree[s].b); if (d < dmin) dmin = d; }
      const alive = dmin < reach * 0.6 + 0.4; C.set(alive ? '#ff8a9a' : '#3a3438'); cellsM.setColorAt(i, C);
    }
    cellsM.instanceColor.needsUpdate = true;
    orbit(camera, p, t, { dist0: 12, dist1: 10, el0: 0.35, el1: 0.25, az0: -0.4, az1: 0.2 });
  };
  return finish(scene, camera, update, { strength: 0.4, threshold: 0.8 });
}

// Biodegradable scaffold (bladder-shaped lattice) seeded with cells
function scaffold(p) {
  const scene = baseScene('#04060c', 0.025); const camera = cam(36);
  const lat = new THREE.Mesh(new THREE.SphereGeometry(2.4, 18, 14), new THREE.MeshBasicMaterial({ color: '#e8eef4', wireframe: true, transparent: true, opacity: 0.6 }));
  lat.scale.set(1, 1.15, 1); scene.add(lat);
  const inner = new THREE.Mesh(new THREE.SphereGeometry(2.3, 18, 14), new THREE.MeshBasicMaterial({ color: '#9fb8d0', wireframe: true, transparent: true, opacity: 0.25 })); inner.scale.set(1, 1.15, 1); inner.rotation.y = 0.2; scene.add(inner);
  const N = 900, cells = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshPhysicalMaterial({ color: PINK, roughness: 0.4, emissive: '#5a1a2a', emissiveIntensity: 0.3 }), N);
  const pts = []; for (let i = 0; i < N; i++) { const u = rnd(i) * 2 - 1, a = rnd(i + 0.5) * 6.28, s = Math.sqrt(1 - u * u); pts.push(new THREE.Vector3(Math.cos(a) * s * 2.4, u * 2.4 * 1.15, Math.sin(a) * s * 2.4)); }
  scene.add(cells);
  keyLights(scene, { keyI: 1.0, hemi: 0.4 });
  const M = new THREE.Matrix4();
  const update = (t) => {
    const k = P(p, 'seed', 0) ? ease(seg(t, 0.05, 0.85)) : 0;
    const n = Math.floor(k * N);
    for (let i = 0; i < N; i++) { const s = i < n ? 1 : 0.0001; M.makeScale(s, s, s).setPosition(pts[i]); cells.setMatrixAt(i, M); }
    cells.instanceMatrix.needsUpdate = true; lat.rotation.y = t * 0.6; inner.rotation.y = 0.2 + t * 0.6; cells.rotation.y = t * 0.6;
    orbit(camera, p, t, { dist0: 11, dist1: 8.5, el0: 0.2, el1: 0.1, az0: -0.2, az1: 0.3 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.7 });
}

// Decellularised heart: red → ghost white → reseeded red and beating
function decell_heart(p) {
  const scene = baseScene('#06060a', 0.02); const camera = cam(34);
  const h = heartMesh(); scene.add(h);
  h.material.transparent = true;
  const aorta = h.children[0];
  const m = motes(scene, 300, 12, '#cfe8ff', 0.35);
  keyLights(scene, { key: '#f0f4ff', keyI: 1.2, hemi: 0.4 });
  const red = new THREE.Color('#b8323d'), ghost = new THREE.Color('#e8eef4');
  const update = (t) => {
    const phase = P(p, 'phase', 'wash');
    let g = 0, beat = 0;
    if (phase === 'wash') g = ease(seg(t, 0.1, 0.9));
    else if (phase === 'ghost') g = 1;
    else { g = 1 - ease(seg(t, 0.1, 0.6)); beat = t > 0.55 ? Math.max(0, Math.sin(t * Math.PI * 2 * 5)) ** 8 * 0.6 : 0; }
    h.material.color.copy(red).lerp(ghost, g); h.material.opacity = 1 - g * 0.55; h.material.depthWrite = g < 0.5;
    aorta.material.color.copy(new THREE.Color('#c44a55')).lerp(ghost, g);
    h.scale.setScalar(1 + beat * 0.08); h.rotation.y = 0.3 + t * 0.5; m.userData.update(t);
    orbit(camera, p, t, { dist0: 8, dist1: 6.5, el0: 0.1, el1: 0.05, az0: -0.2, az1: 0.2 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.75 });
}

// Stem cell reprogramming and differentiation into many cell types
function stem_cells(p) {
  const scene = baseScene('#04040c', 0.025); const camera = cam(38);
  const mode = P(p, 'mode', 'reprogram');
  const center = cell({ r: 1.4, color: mode === 'reprogram' ? '#e8c0a0' : '#9fe0ff', nucleus: '#7a3cff' }); scene.add(center);
  const genes = [AMBER, GREEN, CYAN, PINK].map((c, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: c })); scene.add(m); return m; });
  const kids = [];
  const types = [['neuron', '#c08aff'], ['heart', '#ff6a7a'], ['liver', '#c8803a'], ['blood', '#ff3030'], ['skin', '#e8c0a0'], ['gut', '#ffb0c0']];
  types.forEach(([kind, c], i) => {
    const a = i / types.length * Math.PI * 2;
    const obj = kind === 'neuron' ? neuron({ seed: i, color: c, len: 2.5 }) : cell({ r: 0.7, color: c, nucleus: '#5a2c8f', seed: i });
    if (kind === 'neuron') obj.scale.setScalar(0.5);
    obj.userData.home = new THREE.Vector3(Math.cos(a) * 5, Math.sin(a) * 3, 0); scene.add(obj); kids.push(obj);
  });
  keyLights(scene, { keyI: 1.0, hemi: 0.45 });
  const update = (t) => {
    if (mode === 'reprogram') {
      const k = ease(seg(t, 0.05, 0.6));
      genes.forEach((g, i) => { const a = i / 4 * Math.PI * 2 + t * 2; g.position.set(Math.cos(a) * lerp(5, 1.0, k), Math.sin(a) * lerp(3, 0.4, k), lerp(0, 1.2, k)); g.visible = k < 0.98; });
      const glow = ease(seg(t, 0.55, 0.9)); center.children[0].material.color.set('#e8c0a0').lerp(new THREE.Color('#9fe0ff'), glow); center.userData.nucleus.material.emissiveIntensity = 0.25 + glow * 0.8;
      kids.forEach((o) => { o.visible = false; });
    } else {
      genes.forEach((g) => { g.visible = false; });
      const k = ease(seg(t, 0.05, 0.8));
      kids.forEach((o, i) => { o.visible = true; o.position.lerpVectors(new THREE.Vector3(), o.userData.home, k); o.rotation.set(t + i, t * 0.7, 0); if (o.userData.pulse) o.userData.pulse((t * 2 + i * 0.2) % 1); });
    }
    center.rotation.y = t;
    orbit(camera, p, t, mode === 'reprogram' ? { dist0: 10, dist1: 7, el0: 0.1, el1: 0.05, az0: -0.2, az1: 0.2 } : { dist0: 15, dist1: 12, el0: 0.1, el1: 0.05, az0: -0.2, az1: 0.2 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

// Mini-organ in a dish (bumpy, folded sphere) with a pea for scale
function organoid(p) {
  const scene = baseScene('#04060c', 0.02); const camera = cam(32);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 64, 1, true), new THREE.MeshPhysicalMaterial({ color: '#cfefff', transmission: 0.95, roughness: 0.03, thickness: 0.2, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false })); scene.add(dish);
  const base = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.MeshPhysicalMaterial({ color: '#ff9ac0', transparent: true, opacity: 0.25, roughness: 0.1 })); base.rotation.x = -Math.PI / 2; base.position.y = -0.24; scene.add(base);
  const og = new THREE.SphereGeometry(1, 160, 120);
  displace(og, (v) => -0.12 * Math.exp(-Math.abs(n3(v.x * 2.4, v.y * 2.4, v.z * 2.4)) * 10) + 0.08 * n3(v.x * 5, v.y * 5, v.z * 5));
  const org = new THREE.Mesh(og, flesh(P(p, 'color', '#e8a0b0'), 4, { transmission: 0.3, thickness: 1, clearcoat: 1 })); org.position.y = 0.75; scene.add(org);
  const pea = new THREE.Mesh(new THREE.SphereGeometry(0.85, 48, 32), new THREE.MeshPhysicalMaterial({ color: '#6fbf3a', roughness: 0.4, clearcoat: 0.5 })); pea.position.set(2.6, 0.6, 0.8); pea.visible = !!p.pea; scene.add(pea);
  keyLights(scene, { keyI: 1.2, hemi: 0.45 });
  const update = (t) => { org.rotation.y = t * 0.6; org.scale.setScalar(1 + 0.02 * Math.sin(t * 8)); orbit(camera, p, t, { dist0: 8, dist1: 5.5, el0: 0.45, el1: 0.3, az0: -0.2, az1: 0.3, ty0: 0.6, ty1: 0.6 }); };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.75 });
}

// 3-D bioprinter building a heart layer by layer
function bioprinter(p) {
  const scene = baseScene('#04070c', 0.025); const camera = cam(36);
  techFloor(scene, { y: 0 });
  const frameM = new THREE.MeshPhysicalMaterial({ color: '#c8d0d8', metalness: 0.7, roughness: 0.3, envMapIntensity: 0.3 });
  for (const [x, z] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, 6, 0.25), frameM); post.position.set(x, 3, z); scene.add(post); }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.25, 0.3), frameM); rail.position.y = 5.5; scene.add(rail);
  const head = new THREE.Group(); const body = new THREE.Mesh(new RoundedBoxGeometry(0.7, 1.2, 0.7, 3, 0.1), frameM); body.position.y = 0.6; head.add(body);
  const noz = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 16), new THREE.MeshPhysicalMaterial({ color: '#2a3038' })); noz.rotation.x = Math.PI; noz.position.y = -0.3; head.add(noz);
  const syr = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 16), new THREE.MeshBasicMaterial({ color: '#ff6a8a', transparent: true, opacity: 0.8 })); syr.position.y = 1.2; head.add(syr);
  scene.add(head);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.12, 48), new THREE.MeshPhysicalMaterial({ color: '#cfefff', transmission: 0.8, roughness: 0.05 })); plate.position.y = 1.0; scene.add(plate);
  const h = heartMesh(); h.scale.setScalar(0.85); h.position.set(0, 2.15, 0); scene.add(h);
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1);
  h.traverse((o) => { if (o.material) { o.material = o.material.clone(); o.material.clippingPlanes = [clip]; o.material.clipShadows = true; } });
  const bead = new THREE.PointLight('#ff6a8a', 8, 3, 1.5); scene.add(bead);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => {
    const k = P(p, 'k0', 0) + (P(p, 'k1', 1) - P(p, 'k0', 0)) * seg(t, 0, 0.95);
    const y = lerp(1.0, 3.6, k); clip.constant = y;
    const a = t * 60; head.position.set(Math.cos(a) * 0.9 * (1 - Math.abs(k - 0.5)), y + 0.4, Math.sin(a * 1.3) * 0.9 * (1 - Math.abs(k - 0.5)));
    bead.position.set(head.position.x, y, head.position.z);
    orbit(camera, p, t, { dist0: 11, dist1: 8.5, el0: 0.3, el1: 0.22, az0: -0.4, az1: 0.2, ty0: 2.4, ty1: 2.4 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.75 });
}

// Stylised pig; xray mode shows a glowing kidney
function pig(p) {
  const scene = baseScene('#0b0a10', 0.03); const camera = cam(36);
  const xr = !!p.xray;
  const skin = xr ? new THREE.MeshPhysicalMaterial({ color: '#ffb0c0', emissive: '#ff9ab8', emissiveIntensity: 0.15, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide })
    : new THREE.MeshPhysicalMaterial({ color: '#c88080', roughness: 0.65, sheen: 0.2, sheenColor: new THREE.Color('#ffd0d0'), envMapIntensity: 0.12 });
  const g = new THREE.Group(); scene.add(g);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.6, 64, 48), skin); body.scale.set(1.5, 1, 1); g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.95, 48, 32), skin); head.position.set(2.4, 0.4, 0); g.add(head);
  const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 0.4, 32), skin); snout.rotation.z = Math.PI / 2; snout.position.set(3.35, 0.25, 0); g.add(snout);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 16), skin); ear.position.set(2.2, 1.25, s * 0.5); ear.rotation.set(s * 0.4, 0, -0.5); g.add(ear);
    for (const x of [-1.4, 1.2]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.22, 1.2, 16), skin); leg.position.set(x, -1.4, s * 0.8); g.add(leg); }
  }
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 8, 24, Math.PI * 1.6), skin); tail.position.set(-2.45, 0.4, 0); g.add(tail);
  const eye = new THREE.MeshBasicMaterial({ color: '#111' });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), eye); e.position.set(3.0, 0.7, s * 0.4); g.add(e); }
  const organ = new THREE.Mesh(kidneyGeo(), new THREE.MeshPhysicalMaterial({ color: '#c0392b', emissive: P(p, 'glow', GREEN), emissiveIntensity: 0.6 })); organ.scale.setScalar(0.45); organ.position.set(0.2, 0.2, 0); organ.visible = xr; g.add(organ);
  const dna = dnaHelix({ turns: 2, radius: 0.5, pitch: 2 }); dna.position.set(0, 2.8, 0); dna.rotation.z = Math.PI / 2; dna.visible = !!p.dna; g.add(dna);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#16181e', roughness: 1 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -2; scene.add(floor);
  keyLights(scene, { keyI: 1.1, hemi: 0.4 });
  const update = (t) => { g.rotation.y = -0.4 + t * 0.4; dna.rotation.x = t * 3; body.scale.y = 1 + 0.02 * Math.sin(t * 6); orbit(camera, p, t, { dist0: 11, dist1: 9, el0: 0.15, el1: 0.1, az0: -0.2, az1: 0.2 }); };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.88 });
}

// DNA with many edit markers
function dna_edits(p) {
  const scene = baseScene('#02040c', 0.02); const camera = cam(38);
  const dna = dnaHelix({ turns: 7, radius: 1.1, pitch: 3.4 }); dna.rotation.z = Math.PI / 2.3; scene.add(dna);
  const pairs = dna.userData.pairs;
  const edits = pairs.filter((_, i) => rnd(i * 3.3) < 0.6);
  keyLights(scene, { keyI: 1.0, hemi: 0.4 });
  const counter = holoPanel(5, 1.2, (ctx, t, w, h) => txt(ctx, `${Math.min(P(p, 'count', 69), Math.floor(seg(t, 0.05, 0.85) * P(p, 'count', 69)))} EDITS`, w / 2, h / 2, 130, AMBER, 'center', 900), { res: 1200 });
  counter.position.set(0, -4, 2); scene.add(counter);
  const update = (t) => {
    const n = Math.floor(seg(t, 0.05, 0.85) * edits.length);
    edits.forEach((q, i) => { const on = i < n; q.left.material.emissive.set(on ? AMBER : q.left.material.color); q.left.material.emissiveIntensity = on ? 1 : 0.35; });
    dna.rotation.y = t * 0.7; counter.userData.update(t);
    orbit(camera, p, t, { dist0: 16, dist1: 12, el0: 0.1, el1: 0.05, az0: -0.3, az1: 0.2, ty0: -0.8, ty1: -0.8 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.8 });
}

run({ title_card, waiting_list, lab, transplant_ops, immune_reject, kidney, heart_beat, vessels, scaffold, decell_heart, stem_cells, organoid, bioprinter, pig, dna_edits });
