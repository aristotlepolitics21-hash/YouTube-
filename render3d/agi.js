// Scenes for "What Happens If AI Becomes Smarter Than Humans?" (16:9 long-form).
import {
  THREE, RoundedBoxGeometry, n3, ease, lerp, flesh, displace, baseScene, cam, seg, P, rnd, orbit, finish,
  motes, holoPanel, txt, lineChart, brainMesh, humanoid, standPose, neuralNet, dataStream, techFloor, keyLights, earthTexture, starfield,
} from './lib_sci.js';
import { run } from './lib3d.js';

const CYAN = '#57d8ff', RED = '#ff4b5c', GREEN = '#4dff9a', AMBER = '#ffb347', GOLD = '#ffcf4a';

function title_card(p) {
  const scene = baseScene('#03070c'); const camera = cam(36);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    ctx.globalAlpha = seg(t, 0.03, 0.4);
    if (p.big) { txt(ctx, p.big, w / 2, h * 0.4, 250, P(p, 'color', AMBER), 'center', 900); txt(ctx, P(p, 'sub', ''), w / 2, h * 0.72, 54, '#d8f6ff', 'center', 800); txt(ctx, P(p, 'sub2', ''), w / 2, h * 0.84, 40, '#7fb8d0', 'center', 600); }
    else {
      txt(ctx, P(p, 'year', ''), w / 2, h * 0.2, 110, AMBER, 'center', 900);
      const lines = P(p, 'lines', [P(p, 'title', '')]);
      lines.forEach((l, i) => txt(ctx, l, w / 2, h * 0.42 + i * 86, i === 0 && !p.quote ? 70 : 56, i === 0 && !p.quote ? '#ffffff' : '#d8f6ff', 'center', p.quote ? 600 : 900));
      txt(ctx, P(p, 'sub', ''), w / 2, h * 0.88, 42, '#7fb8d0', 'center', 700);
    }
    ctx.globalAlpha = 1;
  }, { res: 1600 });
  scene.add(panel);
  const m = motes(scene, 300, 24, CYAN, 0.3);
  const update = (t) => { panel.userData.update(t); m.userData.update(t); orbit(camera, p, t, { dist0: 11, dist1: 9.5, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Brain vs. chip
function chipMesh() {
  const g = new THREE.Group();
  const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d');
  x.fillStyle = '#0b1622'; x.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) { x.strokeStyle = `rgba(87,216,255,${0.25 + rnd(i) * 0.6})`; x.lineWidth = 2 + rnd(i + 1) * 4; x.beginPath(); let px = rnd(i + 2) * 1024, py = rnd(i + 3) * 1024; x.moveTo(px, py); for (let k = 0; k < 4; k++) { if (k % 2) px += (rnd(i + k) - 0.5) * 300; else py += (rnd(i + k + 9) - 0.5) * 300; x.lineTo(px, py); } x.stroke(); }
  for (let i = 0; i < 64; i++) { x.fillStyle = '#123'; x.fillRect(100 + (i % 8) * 105, 100 + Math.floor(i / 8) * 105, 80, 80); x.strokeStyle = CYAN; x.strokeRect(100 + (i % 8) * 105, 100 + Math.floor(i / 8) * 105, 80, 80); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const die = new THREE.Mesh(new RoundedBoxGeometry(3, 0.3, 3, 4, 0.06), [new THREE.MeshPhysicalMaterial({ color: '#1a2633', metalness: 0.7, roughness: 0.3 }), new THREE.MeshPhysicalMaterial({ color: '#1a2633', metalness: 0.7, roughness: 0.3 }), new THREE.MeshBasicMaterial({ map: tex }), new THREE.MeshPhysicalMaterial({ color: '#1a2633' }), new THREE.MeshPhysicalMaterial({ color: '#1a2633', metalness: 0.7 }), new THREE.MeshPhysicalMaterial({ color: '#1a2633', metalness: 0.7 })]);
  g.add(die);
  const pinM = new THREE.MeshPhysicalMaterial({ color: '#d8b060', metalness: 1, roughness: 0.25 });
  for (let s = 0; s < 4; s++) for (let i = 0; i < 12; i++) { const pin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.4), pinM); const o = -1.37 + i * 0.25; const a = s * Math.PI / 2; pin.position.set(Math.cos(a) * 1.68 + (s % 2 ? o : 0) * (s === 1 ? 1 : -1) * 0 + (s % 2 ? o : 0), -0.05, Math.sin(a) * 1.68 + (s % 2 ? 0 : o)); pin.rotation.y = -a + Math.PI / 2; g.add(pin); }
  return g;
}
function brain_vs_chip(p) {
  const scene = baseScene('#04050c', 0.02); const camera = cam(34);
  const b = brainMesh(); b.scale.multiplyScalar(0.7); b.position.set(-3.6, 0, 0); scene.add(b);
  const chip = chipMesh(); chip.position.set(3.6, 0, 0); chip.rotation.x = 0.9; scene.add(chip);
  const arc = dataStream(new THREE.CatmullRomCurve3([new THREE.Vector3(-2, 0.5, 0), new THREE.Vector3(0, 2.5, 0.5), new THREE.Vector3(2.4, 0.5, 0)]), 200, P(p, 'arc', CYAN), 3); scene.add(arc);
  keyLights(scene, { keyI: 1.2, hemi: 0.4 });
  const glow = new THREE.PointLight(CYAN, 20, 8, 1.5); glow.position.set(3.6, 2, 1); scene.add(glow);
  const update = (t) => { b.rotation.y = 0.5 + t * 0.6; chip.rotation.y = t * 0.6; arc.userData.update(t, 0.4); orbit(camera, p, t, { dist0: 13, dist1: 11, el0: 0.12, el1: 0.08, az0: -0.2, az1: 0.15 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.65 });
}

// Chessboard with lathe pieces; one side glows
function piece(kind, mat) {
  const prof = { pawn: [[0, 0], [0.32, 0], [0.3, 0.1], [0.14, 0.25], [0.12, 0.5], [0.2, 0.62], [0.18, 0.75], [0, 0.82]], rook: [[0, 0], [0.34, 0], [0.32, 0.12], [0.22, 0.3], [0.22, 0.75], [0.3, 0.8], [0.3, 0.98], [0, 0.98]], king: [[0, 0], [0.36, 0], [0.33, 0.14], [0.18, 0.4], [0.16, 1.0], [0.28, 1.08], [0.12, 1.2], [0, 1.25]], queen: [[0, 0], [0.36, 0], [0.33, 0.14], [0.17, 0.4], [0.15, 0.95], [0.3, 1.05], [0.18, 1.15], [0, 1.18]] }[kind];
  return new THREE.Mesh(new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 32), mat);
}
function chess(p) {
  const scene = baseScene('#05060a', 0.03); const camera = cam(36);
  const light = new THREE.MeshPhysicalMaterial({ color: '#a8a090', roughness: 0.45, clearcoat: 0.4, envMapIntensity: 0.3 }), dark = new THREE.MeshPhysicalMaterial({ color: '#3a2a20', roughness: 0.4, clearcoat: 0.6 });
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const sq = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), (i + j) % 2 ? dark : light); sq.position.set(i - 3.5, -0.1, j - 3.5); sq.receiveShadow = true; scene.add(sq); }
  const whiteM = new THREE.MeshPhysicalMaterial({ color: '#c8c8c8', roughness: 0.35, clearcoat: 0.6, envMapIntensity: 0.3 }), aiM = new THREE.MeshPhysicalMaterial({ color: '#1a2a3a', emissive: CYAN, emissiveIntensity: 0.35, metalness: 0.6, roughness: 0.25 });
  const pieces = [];
  const place = (k, m, x, z) => { const q = piece(k, m); q.position.set(x - 3.5, 0, z - 3.5); q.castShadow = true; scene.add(q); pieces.push(q); return q; };
  for (let i = 0; i < 8; i += 2) { place('pawn', whiteM, i, 1); place('pawn', aiM, i + 1, 6); }
  const wk = place('king', whiteM, 4, 0); place('rook', whiteM, 0, 0); place('queen', aiM, 3, 7); const ak = place('king', aiM, 4, 7); const mover = place('rook', aiM, 7, 7);
  keyLights(scene, { keyI: 0.8, hemi: 0.3 });
  const update = (t) => {
    const k = ease(seg(t, 0.3, 0.7)); mover.position.set(3.5, 0.4 * Math.sin(k * Math.PI), lerp(3.5, -3.5 + 1, k));
    wk.rotation.z = ease(seg(t, 0.8, 1)) * 1.4 * P(p, 'topple', 0);
    orbit(camera, p, t, { dist0: 12, dist1: 9.5, el0: 0.65, el1: 0.5, az0: 0.6, az1: 0.9 });
  };
  return finish(scene, camera, update, { strength: 0.4, threshold: 0.9 });
}

// Go board; stones appear; "move 37" glows
function go_board(p) {
  const scene = baseScene('#05060a', 0.03); const camera = cam(36);
  const board = new THREE.Mesh(new RoundedBoxGeometry(10, 0.5, 10, 3, 0.1), new THREE.MeshPhysicalMaterial({ color: '#a8783a', roughness: 0.55, clearcoat: 0.3, envMapIntensity: 0.25 })); board.position.y = -0.25; scene.add(board);
  const lm = new THREE.LineBasicMaterial({ color: '#2a1a0a' }), pts = [];
  for (let i = 0; i < 19; i++) { const c = -4.5 + i * 0.5; pts.push(-4.5, 0.01, c, 4.5, 0.01, c, c, 0.01, -4.5, c, 0.01, 4.5); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); scene.add(new THREE.LineSegments(lg, lm));
  const sg = new THREE.SphereGeometry(0.23, 24, 12); sg.scale(1, 0.4, 1);
  const bm = new THREE.MeshPhysicalMaterial({ color: '#111', roughness: 0.2, clearcoat: 1 }), wm = new THREE.MeshPhysicalMaterial({ color: '#f4f4f0', roughness: 0.25, clearcoat: 1 });
  const stones = Array.from({ length: 70 }, (_, i) => { const s = new THREE.Mesh(sg, i % 2 ? wm : bm); s.position.set(-4.5 + Math.floor(rnd(i) * 19) * 0.5, 0.08, -4.5 + Math.floor(rnd(i + 0.5) * 19) * 0.5); s.castShadow = true; scene.add(s); return s; });
  const special = new THREE.Mesh(sg, new THREE.MeshPhysicalMaterial({ color: '#111', emissive: CYAN, emissiveIntensity: 0, roughness: 0.2 })); special.position.set(-4.5 + 4 * 0.5, 0.08, -4.5 + 13 * 0.5); scene.add(special);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 8, 48), new THREE.MeshBasicMaterial({ color: CYAN })); ring.rotation.x = Math.PI / 2; ring.position.copy(special.position); scene.add(ring);
  keyLights(scene, { keyI: 0.8, hemi: 0.3 });
  const update = (t) => {
    const n = Math.floor(seg(t, 0, 0.6) * stones.length); stones.forEach((s, i) => { s.visible = i < n; });
    const k = seg(t, 0.6, 0.7); special.visible = t > 0.6; special.material.emissiveIntensity = k * (0.6 + 0.4 * Math.sin(t * 20)); ring.visible = t > 0.62; ring.scale.setScalar(1 + 0.2 * Math.sin(t * 12));
    orbit(camera, p, t, { dist0: 13, dist1: 8, el0: 0.9, el1: 0.7, az0: 0.3, az1: 0.6, tx0: 0, tx1: special.position.x * 0.6 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.88 });
}

// Protein chain folding from a line into a compact structure
function protein(p) {
  const scene = baseScene('#04050c', 0.02); const camera = cam(36);
  const N = 140, line = [], fold = [];
  for (let i = 0; i < N; i++) {
    line.push(new THREE.Vector3((i - N / 2) * 0.18, 0, 0));
    const helix = Math.floor(i / 20) % 2 === 0;
    const a = i * (helix ? 1.7 : 0.4), cx = Math.cos(i * 0.09) * 1.8, cy = Math.sin(i * 0.13) * 1.5, cz = Math.sin(i * 0.07) * 1.8;
    fold.push(new THREE.Vector3(cx + Math.cos(a) * (helix ? 0.45 : 0.1), cy + (helix ? (i % 20) * 0.08 - 0.8 : 0), cz + Math.sin(a) * (helix ? 0.45 : 0.1)));
  }
  let mesh = null;
  const mat = new THREE.MeshPhysicalMaterial({ vertexColors: false, color: '#ffffff', roughness: 0.35, clearcoat: 0.6 });
  const colors = new THREE.Color();
  const update = (t) => {
    const k = ease(seg(t, P(p, 'f0', 0.1), P(p, 'f1', 0.8)));
    const pts = line.map((v, i) => v.clone().lerp(fold[i], k));
    if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); }
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 600, 0.16, 10);
    const col = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < g.attributes.position.count; i++) { colors.setHSL((Math.floor(i / 11) / 601) * 0.8, 0.8, 0.55); col.set([colors.r, colors.g, colors.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); mat.vertexColors = true;
    mesh = new THREE.Mesh(g, mat); scene.add(mesh); mesh.rotation.y = t * 0.8;
    orbit(camera, p, t, { dist0: 18, dist1: 10, el0: 0.2, el1: 0.15, az0: 0, az1: 0.3 });
  };
  keyLights(scene, { keyI: 1.3, hemi: 0.45 });
  return finish(scene, camera, update, { strength: 0.4, threshold: 0.8 });
}

function net(p) {
  const scene = baseScene('#02060c', 0.02); const camera = cam(38);
  const nn = neuralNet({ layers: P(p, 'layers', [6, 10, 12, 12, 10, 6]), w: 12, h: 6, color: P(p, 'color', CYAN) }); scene.add(nn);
  const m = motes(scene, 300, 24, CYAN, 0.3);
  const update = (t) => { nn.userData.update(t, P(p, 'speed', 1.5)); m.userData.update(t); orbit(camera, p, t, { dist0: 18, dist1: 13, el0: 0.12, el1: 0.06, az0: -0.25, az1: 0.25 }); };
  return finish(scene, camera, update, { strength: 0.9, threshold: 0.35 });
}

// Exponential compute chart
function compute_chart(p) {
  const scene = baseScene('#02060c'); const camera = cam(36);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    txt(ctx, P(p, 'title', 'COMPUTE USED TO TRAIN TOP AI MODELS'), 60, 70, 46, '#d8f6ff');
    txt(ctx, P(p, 'sub', 'log scale — roughly 4 to 5× more every year'), 60, 130, 36, '#7fb8d0', 'left', 600);
    const k = seg(t, 0.05, 0.85), n = 14;
    for (let i = 0; i < n; i++) { if (i / n > k) break; const hh = (i + 1) / n * (h - 300); ctx.fillStyle = i > n - 4 ? AMBER : CYAN; ctx.fillRect(100 + i * ((w - 200) / n), h - 80 - hh, (w - 200) / n - 18, hh); }
    txt(ctx, '2010', 100, h - 40, 34, '#7fb8d0', 'left', 600); txt(ctx, 'TODAY', w - 100, h - 40, 34, '#7fb8d0', 'right', 600);
  }, { res: 1600 });
  scene.add(panel);
  const update = (t) => { panel.userData.update(t); orbit(camera, p, t, { dist0: 10.5, dist1: 9.2, el0: 0.04, el1: 0.02, az0: 0.15, az1: -0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Data-centre aisle with blinking server racks
function server_farm(p) {
  const scene = baseScene('#020408', 0.04); const camera = cam(50);
  const rackM = new THREE.MeshPhysicalMaterial({ color: '#141a22', metalness: 0.6, roughness: 0.4 });
  const N = 2 * 16 * 30, leds = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: '#ffffff' }), N);
  const M = new THREE.Matrix4(), C = new THREE.Color(); let k = 0;
  for (const side of [-1, 1]) for (let r = 0; r < 16; r++) {
    const rack = new THREE.Mesh(new RoundedBoxGeometry(1.2, 4, 1.4, 2, 0.05), rackM); rack.position.set(side * 2.2, 2, -r * 1.5); scene.add(rack);
    for (let i = 0; i < 30; i++) { M.makeTranslation(side * 2.2 - side * 0.71, 0.3 + i * 0.12, -r * 1.5 + (rnd(k) - 0.5) * 1.1); leds.setMatrixAt(k++, M); }
  }
  scene.add(leds);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 60), new THREE.MeshPhysicalMaterial({ color: '#0a1018', roughness: 0.3, clearcoat: 1, envMapIntensity: 0.2 })); floor.rotation.x = -Math.PI / 2; floor.position.z = -15; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#5fb8ff', '#05080c', 0.4));
  const update = (t) => {
    for (let i = 0; i < N; i++) { const on = rnd(i * 3 + Math.floor(t * 30 + rnd(i) * 10)) > 0.4; C.set(rnd(i) < 0.15 ? AMBER : CYAN).multiplyScalar(on ? 1.5 : 0.15); leds.setColorAt(i, C); }
    leds.instanceColor.needsUpdate = true;
    camera.position.set(0, 1.8, lerp(4, -8, t)); camera.lookAt(0, 1.6, lerp(-6, -18, t));
  };
  return finish(scene, camera, update, { strength: 0.9, threshold: 0.4 });
}

// Robot with a holographic brain above its head
function robot_mind(p) {
  const scene = baseScene('#04070d', 0.03); const camera = cam(36);
  techFloor(scene, { y: 0 });
  const r = humanoid({ style: 'robot' }); standPose(r); scene.add(r);
  const halo = brainMesh(P(p, 'brain', '#57d8ff')); halo.scale.multiplyScalar(0.22); halo.position.set(0, 4.2, 0);
  halo.material = new THREE.MeshBasicMaterial({ color: P(p, 'brain', CYAN), wireframe: true, transparent: true, opacity: 0.45 }); scene.add(halo);
  const m = motes(scene, 300, 14, CYAN, 0.4);
  keyLights(scene, { keyI: 1.1, hemi: 0.35 });
  const update = (t) => {
    halo.rotation.y = t * 1.5; halo.scale.setScalar(0.22 * (1 + P(p, 'grow', 0) * ease(t) * 1.5)); halo.position.y = 4.2 + P(p, 'grow', 0) * ease(t) * 0.8;
    const J = r.userData.joints; J.neck.rotation.x = -0.15; J.neck.rotation.y = 0.1 * Math.sin(t * 2);
    m.userData.update(t);
    orbit(camera, p, t, { dist0: 12, dist1: 10, el0: 0.12, el1: 0.08, az0: -0.4, az1: 0.2, ty0: 2.6, ty1: 2.9 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.82 });
}

// Intelligence explosion: each generation builds a bigger, brighter successor
function explosion(p) {
  const scene = baseScene('#020208', 0.01); const camera = cam(42);
  starfield(scene, 3000);
  const nodes = [];
  for (let i = 0; i < 14; i++) {
    const s = 0.2 * Math.pow(1.35, i), a = i * 0.9, r = 0.6 * Math.pow(1.3, i);
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 2), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(0.55 - i * 0.035, 1, 0.55), wireframe: i % 2 === 0 }));
    m.position.set(Math.cos(a) * r, i * 0.25, Math.sin(a) * r); scene.add(m); nodes.push(m);
  }
  const update = (t) => {
    const n = seg(t, 0, 0.9) * nodes.length;
    nodes.forEach((m, i) => { const k = Math.max(0, Math.min(1, n - i)); m.scale.setScalar(Math.max(0.001, ease(k))); m.rotation.set(t * 2, t * 3, 0); });
    orbit(camera, p, t, { dist0: 10, dist1: 26, el0: 0.4, el1: 0.3, az0: 0, az1: 1.2, ty0: 0.5, ty1: 2 });
  };
  return finish(scene, camera, update, { strength: 1.0, threshold: 0.3 });
}

// Scientific discovery: molecules assembling in a glowing lab space
function discovery(p) {
  const scene = baseScene('#03060c', 0.03); const camera = cam(38);
  const mols = [];
  const atomCols = ['#ffffff', '#ff4b5c', '#57d8ff', '#ffd23f', '#4dff9a'];
  for (let k = 0; k < 7; k++) {
    const g = new THREE.Group(); const n = 5 + Math.floor(rnd(k) * 6), at = [];
    for (let i = 0; i < n; i++) { const a = new THREE.Mesh(new THREE.SphereGeometry(0.25 + rnd(k * 9 + i) * 0.15, 24, 16), new THREE.MeshPhysicalMaterial({ color: atomCols[Math.floor(rnd(k + i) * 5)], roughness: 0.25, clearcoat: 1 })); a.position.set((rnd(k * 3 + i) - 0.5) * 2, (rnd(k * 5 + i) - 0.5) * 2, (rnd(k * 7 + i) - 0.5) * 2); g.add(a); at.push(a); }
    for (let i = 1; i < n; i++) { const a = at[i - 1].position, b = at[i].position; const bond = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, a.distanceTo(b), 8), new THREE.MeshPhysicalMaterial({ color: '#c0c8d0' })); bond.position.copy(a).add(b).multiplyScalar(0.5); bond.lookAt(b); bond.rotateX(Math.PI / 2); g.add(bond); }
    g.userData.home = new THREE.Vector3((k - 3) * 3, Math.sin(k) * 1.5, Math.cos(k) * 2); g.userData.from = new THREE.Vector3((rnd(k) - 0.5) * 30, (rnd(k + 1) - 0.5) * 20, -20);
    scene.add(g); mols.push(g);
  }
  const nn = neuralNet({ layers: [4, 6, 6, 4], w: 6, h: 3 }); nn.position.set(0, 5, -6); scene.add(nn);
  keyLights(scene, { keyI: 1.2, hemi: 0.45 });
  const update = (t) => {
    mols.forEach((g, k) => { const a = ease(seg(t, k * 0.06, 0.5 + k * 0.06)); g.position.lerpVectors(g.userData.from, g.userData.home, a); g.rotation.set(t + k, t * 1.3 + k, 0); });
    nn.userData.update(t, 2);
    orbit(camera, p, t, { dist0: 18, dist1: 14, el0: 0.15, el1: 0.1, az0: -0.3, az1: 0.3, ty0: 1, ty1: 1 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

// Boat-race game: the AI boat loops for points instead of finishing
function boat_race(p) {
  const scene = baseScene('#06121c', 0.02); const camera = cam(40);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshPhysicalMaterial({ color: '#0d4a6a', roughness: 0.15, clearcoat: 1, envMapIntensity: 0.4 })); water.rotation.x = -Math.PI / 2; scene.add(water);
  const track = new THREE.CatmullRomCurve3([new THREE.Vector3(-12, 0, 6), new THREE.Vector3(0, 0, 8), new THREE.Vector3(12, 0, 5), new THREE.Vector3(14, 0, -4), new THREE.Vector3(4, 0, -8), new THREE.Vector3(-10, 0, -6)], true);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(track, 200, 0.08, 6, true), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3 })));
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 4), new THREE.MeshBasicMaterial({ color: '#ffffff' })); flag.position.set(-10, 1.5, -6); scene.add(flag);
  const loopC = new THREE.Vector3(6, 0, 1);
  const targets = Array.from({ length: 3 }, (_, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.15, 12, 32), new THREE.MeshBasicMaterial({ color: GOLD })); m.position.set(loopC.x + Math.cos(i * 2.1) * 2.5, 0.6, loopC.z + Math.sin(i * 2.1) * 2.5); scene.add(m); return m; });
  const boat = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2, 16), new THREE.MeshPhysicalMaterial({ color: RED, roughness: 0.3, clearcoat: 1 })); hull.rotation.z = -Math.PI / 2; hull.scale.z = 0.5; boat.add(hull); scene.add(boat);
  const wake = dataStream(new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => new THREE.Vector3(loopC.x + Math.cos(i * 0.785) * 2.5, 0.05, loopC.z + Math.sin(i * 0.785) * 2.5)), true), 200, '#e8f8ff', 3); scene.add(wake);
  const score = holoPanel(4, 1, (ctx, t, w, h) => txt(ctx, `SCORE ${Math.floor(t * 4000)}`, w / 2, h / 2, 110, GOLD, 'center', 900), { res: 1024 });
  score.position.set(0, 6, -4); scene.add(score);
  const sun = new THREE.DirectionalLight('#ffffff', 2); sun.position.set(5, 10, 5); scene.add(sun); scene.add(new THREE.HemisphereLight('#bfe0ff', '#0d2030', 0.6));
  const update = (t) => {
    const a = t * Math.PI * 2 * 3; boat.position.set(loopC.x + Math.cos(a) * 2.5, 0.2, loopC.z + Math.sin(a) * 2.5); boat.rotation.y = -a - Math.PI / 2;
    targets.forEach((m, i) => { m.rotation.y = t * 4; m.visible = Math.sin(a - i * 2.1) < 0.9; });
    wake.userData.update(t, 0.6); score.userData.update(t); score.lookAt(camera.position);
    orbit(camera, p, t, { dist0: 17, dist1: 14, el0: 0.7, el1: 0.6, az0: 0.2, az1: 0.5, tx0: 3, tx1: 4 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.7 });
}

// King Midas: everything touched turns to gold
function midas(p) {
  const scene = baseScene('#0a0806', 0.03); const camera = cam(36);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.3, 64), new THREE.MeshPhysicalMaterial({ color: '#4a2e1a', roughness: 0.6 })); table.position.y = -0.15; scene.add(table);
  const gold = new THREE.MeshPhysicalMaterial({ color: '#ffcf4a', metalness: 1, roughness: 0.18 });
  const objs = [
    [new THREE.SphereGeometry(0.6, 32, 24), '#c0302a', -2.4, 0.6, 0.5],
    [new THREE.CylinderGeometry(0.45, 0.35, 1.1, 32), '#e8e8f0', -0.6, 0.55, 1.2],
    [new THREE.TorusKnotGeometry(0.4, 0.14, 100, 16), '#5fae4a', 1.2, 0.7, 0.4],
    [new THREE.BoxGeometry(1.2, 0.3, 0.9), '#f0e0b0', 2.6, 0.15, 1.3],
    [new THREE.ConeGeometry(0.5, 1.2, 32), '#ff9a3a', 0.4, 0.6, -1.4],
  ].map(([g, c, x, y, z]) => { const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5 })); m.position.set(x, y, z); m.castShadow = true; scene.add(m); return m; });
  keyLights(scene, { key: '#fff0d0', keyI: 1.5, hemi: 0.35 });
  const update = (t) => {
    objs.forEach((m, i) => { if (t > 0.15 + i * 0.14) m.material = gold; m.rotation.y = t * 0.8; });
    orbit(camera, p, t, { dist0: 10, dist1: 8, el0: 0.4, el1: 0.3, az0: -0.2, az1: 0.3 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.7 });
}

// Crowd with a share highlighted (jobs exposed)
function crowd(p) {
  const scene = baseScene('#02060c', 0.035); const camera = cam(40);
  const N = 40 * 24, bodyG = new THREE.CapsuleGeometry(0.14, 0.4, 4, 10), headG = new THREE.SphereGeometry(0.13, 12, 8);
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const bodies = new THREE.InstancedMesh(bodyG, mat, N), heads = new THREE.InstancedMesh(headG, mat, N);
  const M = new THREE.Matrix4(), C = new THREE.Color(); let k = 0;
  for (let i = 0; i < 40; i++) for (let j = 0; j < 24; j++, k++) { const x = (i - 19.5) * 0.75, z = (j - 12) * 0.75; M.makeTranslation(x, 0.35, z); bodies.setMatrixAt(k, M); M.makeTranslation(x, 0.82, z); heads.setMatrixAt(k, M); }
  scene.add(bodies, heads); techFloor(scene, { y: 0 });
  const update = (t) => {
    const frac = P(p, 'frac', 0.4) * seg(t, 0.15, 0.6);
    for (let i = 0; i < N; i++) { const hl = rnd(i * 3.1) < frac; C.set(hl ? AMBER : CYAN).multiplyScalar(hl ? 1.1 : 0.5 + 0.2 * rnd(i)); bodies.setColorAt(i, C); heads.setColorAt(i, C); }
    bodies.instanceColor.needsUpdate = heads.instanceColor.needsUpdate = true;
    orbit(camera, p, t, { dist0: 22, dist1: 15, el0: 0.45, el1: 0.3, az0: -0.5, az1: 0.2 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.5 });
}

// Big red off switch beside a robot
function off_switch(p) {
  const scene = baseScene('#06060a', 0.03); const camera = cam(36);
  techFloor(scene, { y: 0, color: '#3a1d1d' });
  const base = new THREE.Mesh(new RoundedBoxGeometry(1.6, 1.0, 1.6, 4, 0.1), new THREE.MeshPhysicalMaterial({ color: '#2a2e35', metalness: 0.6, roughness: 0.35 })); base.position.set(1.8, 0.5, 0); scene.add(base);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.35, 48), new THREE.MeshPhysicalMaterial({ color: RED, emissive: RED, emissiveIntensity: 0.4, roughness: 0.3, clearcoat: 1 })); btn.position.set(1.8, 1.15, 0); scene.add(btn);
  const r = humanoid({ style: 'robot' }); standPose(r); r.position.set(-1.2, 0, 0); r.rotation.y = 0.6; scene.add(r);
  keyLights(scene, { keyI: 1.0, hemi: 0.3 });
  const update = (t) => {
    const J = r.userData.joints, reach = ease(seg(t, 0.3, 0.8)) * P(p, 'reach', 1);
    J.shoulderR.rotation.x = -reach * 1.2; J.shoulderR.rotation.z = -reach * 0.5; J.neck.rotation.y = 0.4 * reach;
    btn.material.emissiveIntensity = 0.4 + 0.4 * Math.sin(t * 10);
    orbit(camera, p, t, { dist0: 9, dist1: 7.5, el0: 0.22, el1: 0.16, az0: 0.6, az1: 0.3, ty0: 1.6, ty1: 1.5, tx0: 0.4, tx1: 0.4 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.82 });
}

// Globe with glowing links between regions (international cooperation)
function globe(p) {
  const scene = baseScene('#000000'); const camera = cam(32);
  starfield(scene);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(2, 96, 64), new THREE.MeshStandardMaterial({ map: earthTexture(), roughness: 0.8 })); scene.add(earth);
  const arcs = new THREE.Group(); earth.add(arcs);
  const pts = Array.from({ length: 12 }, (_, i) => { const u = rnd(i) * 1.6 - 0.8, a = rnd(i + 0.5) * Math.PI * 2, s = Math.sqrt(1 - u * u); return new THREE.Vector3(Math.cos(a) * s * 2.02, u * 2.02, Math.sin(a) * s * 2.02); });
  const streams = [];
  for (let i = 0; i < 16; i++) { const a = pts[i % 12], b = pts[(i * 5 + 3) % 12]; const mid = a.clone().add(b).normalize().multiplyScalar(3.1); const c = new THREE.QuadraticBezierCurve3(a, mid, b); arcs.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.012, 6), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.6 }))); const s = dataStream(c, 30, '#ffffff', 3); arcs.add(s); streams.push(s); }
  const sun = new THREE.DirectionalLight('#fff3e0', 2.4); sun.position.set(-5, 2, 6); scene.add(sun); scene.add(new THREE.AmbientLight('#203050', 0.5));
  const update = (t) => { earth.rotation.y = t * 0.8; streams.forEach((s) => s.userData.update(t, 0.6)); camera.position.set(0, 1, lerp(9, 7.5, ease(t))); camera.lookAt(0, 0, 0); };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.6 });
}

// A road that forks: bright path vs dark path
function fork_paths(p) {
  const scene = baseScene('#05070c', 0.025); const camera = cam(45);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#0b0f14', roughness: 1 })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const roadM = (c, e) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: e, roughness: 0.6 });
  const trunk = new THREE.Mesh(new THREE.PlaneGeometry(3, 20), roadM('#2a3440', 0.1)); trunk.rotation.x = -Math.PI / 2; trunk.position.z = 6; scene.add(trunk);
  const mk = (s, c, e) => { const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.01, -4), new THREE.Vector3(s * 6, 0.01, -16), new THREE.Vector3(s * 14, 0.01, -40)]); const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 1.4, 4), roadM(c, e)); m.scale.y = 0.02; scene.add(m); return curve; };
  const good = mk(-1, '#57d8ff', 0.8), bad = mk(1, '#ff4b5c', 0.5);
  const s1 = dataStream(good, 200, '#e8fbff', 3), s2 = dataStream(bad, 200, '#ffb0b0', 3); scene.add(s1, s2);
  scene.add(new THREE.HemisphereLight('#9fc0ff', '#05070c', 0.5));
  const update = (t) => { s1.userData.update(t, 0.2); s2.userData.update(t, 0.2); camera.position.set(0, lerp(3, 9, ease(t)), lerp(14, 8, ease(t))); camera.lookAt(0, 0, -14); };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.4 });
}

run({ title_card, brain_vs_chip, chess, go_board, protein, net, compute_chart, server_farm, robot_mind, explosion, discovery, boat_race, midas, crowd, off_switch, globe, fork_paths });
