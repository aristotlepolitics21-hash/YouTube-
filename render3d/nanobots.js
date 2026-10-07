// Scenes for "Can Nanobots Repair Your Body From Inside?" (16:9 long-form).
import {
  THREE, RoundedBoxGeometry, n3, ease, lerp, flesh, displace, baseScene, cam, seg, P, rnd, orbit, finish,
  motes, holoPanel, txt, dnaHelix, cell, bloodCellGeo, xrayBody, dataStream, keyLights, earthTexture, starfield,
} from './lib_sci.js';
import { run, organicTube } from './lib3d.js';

const CYAN = '#57d8ff', RED = '#ff4b5c', GREEN = '#4dff9a', AMBER = '#ffb347';

// ---------- props ----------
// Nanobot: capsule hull with panels, glowing sensor ring, spinning corkscrew tail
function nanobot(scale = 1, glow = CYAN) {
  const g = new THREE.Group();
  const hull = new THREE.MeshPhysicalMaterial({ color: '#a9b4c0', metalness: 0.8, roughness: 0.3, clearcoat: 0.6, envMapIntensity: 0.3 });
  const dark = new THREE.MeshPhysicalMaterial({ color: '#2a313a', metalness: 0.7, roughness: 0.35 });
  const lit = new THREE.MeshBasicMaterial({ color: glow });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.9, 12, 32), hull); body.rotation.z = Math.PI / 2; g.add(body);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 8, 48), lit); band.rotation.y = Math.PI / 2; band.position.x = 0.25; g.add(band);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), lit); eye.position.x = 0.78; g.add(eye);
  for (let i = 0; i < 4; i++) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.35, 4, 8), dark);
    const a = i / 4 * Math.PI * 2; arm.position.set(0.55, Math.cos(a) * 0.3, Math.sin(a) * 0.3); arm.rotation.set(a, 0, Math.PI / 2 - 0.6); g.add(arm);
  }
  const pts = []; for (let i = 0; i <= 80; i++) { const u = i / 80; pts.push(new THREE.Vector3(-0.6 - u * 1.6, Math.cos(u * 18) * 0.18 * (1 - u * 0.4), Math.sin(u * 18) * 0.18 * (1 - u * 0.4))); }
  const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.035, 8), dark); g.add(tail);
  g.scale.setScalar(scale); g.userData.tail = tail; g.userData.lit = lit;
  return g;
}
function rbcMesh() {
  return new THREE.Mesh(bloodCellGeo(0.5), new THREE.MeshPhysicalMaterial({ color: '#c8121e', roughness: 0.35, clearcoat: 0.7, sheen: 0.4, sheenColor: new THREE.Color('#ff6060') }));
}
function vesselTube(len = 80, R = 3) {
  const curve = new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => new THREE.Vector3(Math.sin(i * 0.6) * 1.2, Math.cos(i * 0.45) * 0.8, -i * len / 11 + 10)));
  const g = organicTube(curve, R, 600, 64, (u, a) => 1 + 0.06 * Math.sin(u * 60) + 0.05 * n3(u * 30, Math.cos(a * 6.28), Math.sin(a * 6.28)));
  const m = flesh('#b8323d', 1, { side: THREE.BackSide, transparent: true, opacity: 0.92 }); m.normalMap.repeat.set(30, 4);
  return { mesh: new THREE.Mesh(g, m), curve };
}

// ---------- scenes ----------
// Inside a blood vessel: red cells streaming past, nanobots swimming among them
function bloodstream(p) {
  const scene = baseScene('#1a0306', 0.05); const camera = cam(55);
  const { mesh, curve } = vesselTube(); scene.add(mesh);
  const cells = Array.from({ length: P(p, 'cells', 140) }, (_, i) => { const m = rbcMesh(); scene.add(m); return { m, u: rnd(i), a: rnd(i + 0.3) * 6.28, r: rnd(i + 0.6) * 2.2, s: 0.8 + rnd(i + 0.9) * 0.5 }; });
  const bots = Array.from({ length: P(p, 'bots', 6) }, (_, i) => { const b = nanobot(0.5); scene.add(b); return { b, u: 0.05 + i * 0.025, a: i * 2.1, r: 1 + rnd(i) }; });
  const lamp = new THREE.PointLight('#ffd8d0', 22, 30, 1.6); scene.add(lamp);
  scene.add(new THREE.HemisphereLight('#ff9a9a', '#1a0303', 0.4));
  const Pt = new THREE.Vector3(), T = new THREE.Vector3();
  const update = (t) => {
    const flow = t * P(p, 'flow', 0.12);
    for (const c of cells) {
      const u = (c.u + flow) % 1; curve.getPointAt(u, Pt);
      c.m.position.set(Pt.x + Math.cos(c.a + t) * c.r, Pt.y + Math.sin(c.a + t) * c.r, Pt.z); c.m.rotation.set(c.a + t * 2, c.a, t); c.m.scale.setScalar(c.s);
    }
    for (const q of bots) {
      const u = (q.u + t * P(p, 'botSpeed', 0.05)) % 1; curve.getPointAt(u, Pt); curve.getTangentAt(u, T);
      q.b.position.set(Pt.x + Math.cos(q.a) * q.r, Pt.y + Math.sin(q.a) * q.r, Pt.z); q.b.lookAt(q.b.position.clone().sub(T)); q.b.rotateY(Math.PI / 2);
      q.b.userData.tail.rotation.x = t * 60; q.b.userData.lit.color.setHSL(0.53, 1, 0.55 + 0.15 * Math.sin(t * 20 + q.a));
    }
    const cu = P(p, 'cu', 0.02) + t * P(p, 'camSpeed', 0.04);
    curve.getPointAt(cu, Pt); curve.getPointAt(cu + 0.05, T);
    camera.position.copy(Pt); camera.lookAt(T); lamp.position.copy(Pt);
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.7 });
}

// Hero close-up of one nanobot in fluid
function nanobot_closeup(p) {
  const scene = baseScene('#04101a', 0.04); const camera = cam(32);
  const b = nanobot(1.6); scene.add(b);
  const m = motes(scene, 500, 16, '#9fd8ff', 0.4);
  keyLights(scene, { keyI: 0.7, fill: '#7fb8ff', fillI: 0.5, hemi: 0.2 });
  const rim = new THREE.PointLight(CYAN, 30, 10, 1.5); rim.position.set(-3, 2, -3); scene.add(rim);
  const update = (t) => {
    b.userData.tail.rotation.x = t * 50; b.rotation.y = P(p, 'turn', 0.5) * t - 0.3; b.position.y = 0.1 * Math.sin(t * 3);
    m.userData.update(t);
    orbit(camera, p, t, { dist0: 9, dist1: 7, el0: 0.15, el1: 0.1, az0: 0.6, az1: 0.9 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.85 });
}

// X-ray body with a swarm travelling to a target organ
function body_bots(p) {
  const scene = baseScene('#030a12', 0.03); const camera = cam(32);
  const body = xrayBody(); scene.add(body);
  const target = body.userData.parts[P(p, 'target', 'heart')];
  const tp = target.getWorldPosition(new THREE.Vector3());
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(1.25, 1.2, 0.2), new THREE.Vector3(1.1, 2.6, 0.2), new THREE.Vector3(0.6, 2.9, 0.2), tp]);
  const swarm = dataStream(path, 300, CYAN, 3); scene.add(swarm);
  const update = (t) => {
    swarm.userData.update(t, 0.35);
    target.material.emissive.set(t > 0.5 ? GREEN : RED); target.material.emissiveIntensity = 0.6 + 0.5 * Math.sin(t * 14);
    body.rotation.y = -0.3 + t * 0.4;
    orbit(camera, p, t, { dist0: 14, dist1: 11, el0: 0.08, el1: 0.05, az0: -0.2, az1: 0.2, ty0: 1.5, ty1: 1.6 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.72 });
}

// Big text card: title/sub/number
function title_card(p) {
  const scene = baseScene('#03070c'); const camera = cam(36);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    const k = seg(t, 0.05, 0.5);
    ctx.globalAlpha = k;
    if (p.big) {
      txt(ctx, p.big, w / 2, h * 0.42, 300, P(p, 'color', AMBER), 'center', 900);
      txt(ctx, P(p, 'sub', ''), w / 2, h * 0.75, 56, '#d8f6ff', 'center', 800);
    } else {
      txt(ctx, P(p, 'year', ''), w / 2, h * 0.25, 120, AMBER, 'center', 900);
      txt(ctx, P(p, 'title', ''), w / 2, h * 0.52, 70, '#ffffff', 'center', 900);
      txt(ctx, P(p, 'sub', ''), w / 2, h * 0.72, 46, '#bfe8ff', 'center', 700);
    }
    ctx.globalAlpha = 1;
  }, { res: 1600 });
  scene.add(panel);
  const m = motes(scene, 300, 24, CYAN, 0.3);
  const update = (t) => { panel.userData.update(t); m.userData.update(t); orbit(camera, p, t, { dist0: 11, dist1: 9.5, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Log-scale zoom: hair → red blood cell → bacterium → virus → nanobot
function scale_zoom(p) {
  const scene = baseScene('#04080d'); const camera = cam(40);
  const world = new THREE.Group(); scene.add(world);
  const items = [];
  const add = (obj, size, label) => {
    const holder = new THREE.Group(); holder.add(obj); obj.scale.multiplyScalar(size);
    holder.position.set(size * 1.6, 0, 0); world.add(holder);
    const tag = holoPanel(size * 3, size * 0.5, (ctx, t, w, h) => txt(ctx, label, w / 2, h / 2, 70, CYAN, 'center', 900), { res: 1024, frame: false });
    tag.position.set(size * 1.6, -size * 0.85, 0.6 * size); world.add(tag); items.push(tag);
  };
  const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 20, 64), new THREE.MeshPhysicalMaterial({ color: '#5a4030', roughness: 0.5, clearcoat: 0.6 }));
  add(hair, 1, 'HAIR  ~80,000 nm');
  const rbc = rbcMesh(); rbc.scale.setScalar(2); rbc.rotation.x = 1.2; add(rbc, 0.09, 'RED BLOOD CELL  ~7,500 nm');
  const bac = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.6, 8, 24), new THREE.MeshPhysicalMaterial({ color: '#6fd06f', roughness: 0.4, clearcoat: 0.6 })); bac.rotation.z = Math.PI / 2; add(bac, 0.0125, 'BACTERIUM  ~1,000 nm');
  const vir = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 1), new THREE.MeshPhysicalMaterial({ color: '#d060ff', roughness: 0.3, flatShading: true })); add(vir, 0.0013, 'VIRUS  ~100 nm');
  const bot = nanobot(0.6); add(bot, 0.0011, 'NANOBOT');
  keyLights(scene, { keyI: 1.4, hemi: 0.5 });
  const update = (t) => {
    const z0 = P(p, 'z0', 0), z1 = P(p, 'z1', 3);
    const s = Math.pow(10, lerp(z0, z1, ease(t))); world.scale.setScalar(s);
    items.forEach((q) => q.userData.update(t));
    vir.rotation.y = t * 2; bac.rotation.y = t; bot.rotation.y = t * 1.5;
    camera.position.set(1.3, 0.4, 7); camera.lookAt(1.3, -0.1, 0);
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.6 });
}

// Low Reynolds number swimming: scallop (goes nowhere) | bacterium | helixbot
function low_reynolds(p) {
  const scene = baseScene('#06101a', 0.05); const camera = cam(36);
  const mode = P(p, 'mode', 'scallop');
  const m = motes(scene, 900, 14, '#b8e0ff', 0.45);
  let obj, tail;
  if (mode === 'scallop') {
    obj = new THREE.Group();
    const shell = new THREE.MeshPhysicalMaterial({ color: '#e8c9a0', roughness: 0.5, side: THREE.DoubleSide });
    // two shallow domes hinged at their back edge (x = -1)
    const top = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 16, 0, Math.PI * 2, 0, 1.1), shell), bot = top.clone();
    top.scale.y = 0.35; bot.scale.y = 0.35; bot.rotation.x = Math.PI; top.position.x = 1; bot.position.x = 1;
    const hinge = new THREE.Group(); hinge.add(top); const hinge2 = new THREE.Group(); hinge2.add(bot); hinge.position.x = hinge2.position.x = -1; obj.add(hinge, hinge2);
    obj.userData.hinges = [hinge, hinge2];
  } else {
    obj = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 1.2, 12, 32), new THREE.MeshPhysicalMaterial(mode === 'bacterium' ? { color: '#6fd06f', roughness: 0.4, clearcoat: 0.6 } : { color: '#c9d2dc', metalness: 0.8, roughness: 0.25, clearcoat: 1 }));
    body.rotation.z = Math.PI / 2; obj.add(body);
    const pts = []; for (let i = 0; i <= 100; i++) { const u = i / 100; pts.push(new THREE.Vector3(-0.9 - u * 3, Math.cos(u * 22) * 0.3, Math.sin(u * 22) * 0.3)); }
    tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, mode === 'bacterium' ? 0.04 : 0.09, 10), new THREE.MeshPhysicalMaterial({ color: mode === 'bacterium' ? '#c8f0a0' : '#9aa6b4', metalness: mode === 'bacterium' ? 0 : 0.8, roughness: 0.3 }));
    obj.add(tail);
    if (mode === 'helixbot') { tail.position.x = 0.4; body.scale.set(0.8, 0.6, 0.8); }
  }
  scene.add(obj);
  const trail = new THREE.Mesh(new THREE.BoxGeometry(12, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.4 })); trail.position.y = -1.6; scene.add(trail);
  keyLights(scene, { keyI: 1.3, hemi: 0.45 });
  const update = (t) => {
    m.userData.update(t);
    if (mode === 'scallop') {
      const open = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 4);
      obj.userData.hinges[0].rotation.z = open * 0.5; obj.userData.hinges[1].rotation.z = -open * 0.5;
      obj.position.x = 0.25 * Math.sin(t * Math.PI * 2 * 4); // forward and back: net zero
    } else {
      tail.rotation.x = t * 80; obj.position.x = lerp(-3, 3, t);
    }
    orbit(camera, p, t, { dist0: 10, dist1: 9, el0: 0.2, el1: 0.15, az0: 0.1, az1: -0.1 });
  };
  return finish(scene, camera, update, { strength: 0.4, threshold: 0.88 });
}

// Electromagnet coils steering a magnetic corkscrew along a path; optional swarm
function magnet_control(p) {
  const scene = baseScene('#04080d', 0.03); const camera = cam(38);
  const coilM = new THREE.MeshPhysicalMaterial({ color: '#c87533', metalness: 1, roughness: 0.3 });
  [[0, 0, 5, 0], [0, 0, -5, 0], [5, 0, 0, Math.PI / 2], [-5, 0, 0, Math.PI / 2]].forEach(([x, y, z, r]) => {
    const c = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.45, 24, 64), coilM); c.position.set(x, y, z); c.rotation.y = r; scene.add(c);
  });
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.3, 64), new THREE.MeshPhysicalMaterial({ color: '#bfe8ff', transmission: 0.9, roughness: 0.05, thickness: 0.3, transparent: true, opacity: 0.6 }));
  dish.position.y = -0.4; scene.add(dish);
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.4, 0, 1), new THREE.Vector3(-1, 0, -1.6), new THREE.Vector3(0.8, 0, 0.6), new THREE.Vector3(2.2, 0, -1.2)]);
  const trace = new THREE.Mesh(new THREE.TubeGeometry(path, 120, 0.02, 6), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.5 })); scene.add(trace);
  const n = P(p, 'swarm', 1), bots = [];
  for (let i = 0; i < n; i++) { const b = nanobot(n > 1 ? 0.12 : 0.35); scene.add(b); bots.push({ b, off: new THREE.Vector3((rnd(i) - 0.5) * 0.8, (rnd(i + 0.4) - 0.5) * 0.2, (rnd(i + 0.8) - 0.5) * 0.8) }); }
  const lines = [];
  for (let i = 0; i < 10; i++) {
    const pts = []; for (let j = 0; j <= 40; j++) { const u = j / 40; pts.push(new THREE.Vector3(lerp(-5, 5, u), Math.sin(u * Math.PI) * (0.6 + i * 0.25), (i - 5) * 0.5)); }
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#7fb8ff', transparent: true, opacity: 0.25 })); scene.add(l); lines.push(l);
  }
  keyLights(scene, { keyI: 1.3, hemi: 0.4 });
  const Pt = new THREE.Vector3(), T = new THREE.Vector3();
  const update = (t) => {
    const u = Math.min(0.999, t);
    path.getPointAt(u, Pt); path.getTangentAt(u, T);
    bots.forEach(({ b, off }) => { b.position.copy(Pt).add(off); b.lookAt(b.position.clone().sub(T)); b.rotateY(Math.PI / 2); b.userData.tail.rotation.x = t * 70; });
    lines.forEach((l, i) => { l.rotation.y = Math.atan2(T.x, T.z) + Math.PI / 2; l.material.opacity = 0.15 + 0.15 * Math.sin(t * 10 + i); });
    orbit(camera, p, t, { dist0: 13, dist1: 10, el0: 0.6, el1: 0.5, az0: 0.3, az1: 0.7 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.85 });
}

// DNA origami tube that springs open to release cargo
function dna_origami(p) {
  const scene = baseScene('#04060f', 0.03); const camera = cam(36);
  const g = new THREE.Group(); scene.add(g);
  const N = 12, staves = [];
  for (let i = 0; i < N; i++) {
    const h = dnaHelix({ turns: 3, radius: 0.22, pitch: 1.6, perTurn: 8, seed: i * 5 });
    g.add(h); staves.push({ h, a: i / N * Math.PI * 2 });
  }
  const cargo = Array.from({ length: 8 }, (_, i) => { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), new THREE.MeshPhysicalMaterial({ color: RED, emissive: RED, emissiveIntensity: 0.4, roughness: 0.4 })); m.position.set(0, (i - 3.5) * 0.55, 0); g.add(m); return m; });
  const lockM = new THREE.MeshBasicMaterial({ color: AMBER });
  const locks = [0, 1].map((k) => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.06, 8, 24), lockM); m.position.set(1.15, k ? 1.6 : -1.6, 0); g.add(m); return m; });
  keyLights(scene, { keyI: 1.1, hemi: 0.4 });
  g.rotation.z = Math.PI / 2;
  const update = (t) => {
    const open = ease(seg(t, P(p, 'openAt', 2), Math.min(1, P(p, 'openAt', 2) + 0.35)));
    staves.forEach(({ h, a }, i) => {
      const R = 1.0, ang = a * (1 - open * 0.55) + (open * Math.PI * 0.27);
      const x = Math.cos(ang) * R * (1 - open) + (i - N / 2) * 0.5 * open, z = Math.sin(ang) * R * (1 - open) - open * 0.5;
      h.position.set(x, 0, z); h.rotation.y = t * 2 + i;
    });
    cargo.forEach((c, i) => { c.position.z = open * (1.5 + rnd(i) * 2); c.position.x = open * (rnd(i + 3) - 0.5) * 3; c.rotation.y = t * 3; });
    locks.forEach((l) => { l.visible = open < 0.05; l.rotation.x = t * 4; });
    g.rotation.y = t * 0.5;
    orbit(camera, p, t, { dist0: 10, dist1: 8, el0: 0.25, el1: 0.15, az0: -0.2, az1: 0.3 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.75 });
}

// Tumour fed by a vessel; clots form and the tumour shrinks
function tumor_vessel(p) {
  const scene = baseScene('#0d0306', 0.03); const camera = cam(36);
  const tg = new THREE.SphereGeometry(2, 128, 96); displace(tg, (v) => 0.35 * n3(v.x * 0.9, v.y * 0.9, v.z * 0.9) + 0.1 * n3(v.x * 3, v.y * 3, v.z * 3));
  const tumor = new THREE.Mesh(tg, flesh('#6a2a7a', 3, { clearcoat: 0.8 })); scene.add(tumor);
  const vessels = [], flows = [];
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(Math.cos(a) * 8, Math.sin(a * 2) * 2, Math.sin(a) * 8), new THREE.Vector3(Math.cos(a) * 4.5, Math.sin(a) * 1.5, Math.sin(a) * 4.5), new THREE.Vector3(Math.cos(a) * 2, 0, Math.sin(a) * 2)]);
    const v = new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.25, 12), flesh('#c2303a', 2)); scene.add(v); vessels.push(v);
    const f = dataStream(c, 80, '#ff6a6a', 4); scene.add(f); flows.push(f);
  }
  const clots = vessels.map((v, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), flesh('#4a0a0a', 2)); const a = i / 5 * Math.PI * 2; m.position.set(Math.cos(a) * 4.5, Math.sin(a) * 1.5, Math.sin(a) * 4.5); scene.add(m); return m; });
  keyLights(scene, { key: '#ffe0e8', keyI: 1.2, hemi: 0.35 });
  const update = (t) => {
    const clot = ease(seg(t, 0.1, 0.5)), shrink = ease(seg(t, 0.4, 1)) * P(p, 'shrink', 0.45);
    clots.forEach((c) => c.scale.setScalar(Math.max(0.001, clot)));
    flows.forEach((f) => { f.userData.update(t, 0.3 * (1 - clot)); f.visible = clot < 0.95; });
    tumor.scale.setScalar(1 - shrink); tumor.material.color.set('#6a2a7a').lerp(new THREE.Color('#2a1a22'), shrink * 1.5);
    tumor.rotation.y = t * 0.4;
    orbit(camera, p, t, { dist0: 16, dist1: 12, el0: 0.35, el1: 0.25, az0: 0, az1: 0.5 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.7 });
}

// Enzyme-powered nanobots swarming a bladder tumour
function bladder_bots(p) {
  const scene = baseScene('#120408', 0.04); const camera = cam(40);
  const wg = new THREE.PlaneGeometry(40, 40, 200, 200); wg.rotateX(-Math.PI / 2);
  displace(wg, (v) => 0.6 * Math.abs(n3(v.x * 0.25, 0, v.z * 0.25)) + 0.15 * n3(v.x, 0, v.z));
  scene.add(new THREE.Mesh(wg, flesh('#d07a80', 4)));
  const tg = new THREE.SphereGeometry(1.6, 96, 64); displace(tg, (v) => 0.3 * n3(v.x * 1.5, v.y * 1.5, v.z * 1.5));
  const tumor = new THREE.Mesh(tg, flesh('#7a2a5a', 3)); tumor.position.y = 0.6; tumor.scale.y = 0.7; scene.add(tumor);
  const N = 160, botM = new THREE.MeshPhysicalMaterial({ color: '#d8e0ea', metalness: 0.7, roughness: 0.25, emissive: CYAN, emissiveIntensity: 0.2 });
  const bots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 16, 12), botM, N); scene.add(bots);
  const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.7 }), N * 3); scene.add(bub);
  const M = new THREE.Matrix4(), V = new THREE.Vector3();
  keyLights(scene, { key: '#ffe0e8', keyI: 1.2, hemi: 0.4 });
  const glow = new THREE.PointLight(CYAN, 0, 6, 1.5); glow.position.set(0, 2, 0); scene.add(glow);
  const update = (t) => {
    const k = ease(seg(t, 0, 0.7));
    for (let i = 0; i < N; i++) {
      const a = rnd(i) * Math.PI * 2, r0 = 6 + rnd(i + 0.3) * 8, r = lerp(r0, 1.7 + rnd(i + 0.5) * 0.4, k * (0.7 + 0.3 * rnd(i + 0.7)));
      const aa = a + t * (0.5 + rnd(i + 0.9));
      V.set(Math.cos(aa) * r, 0.6 + Math.sin(t * 6 + i) * 0.3 + rnd(i + 0.2) * 1.5 * (1 - k), Math.sin(aa) * r);
      M.makeTranslation(V.x, V.y, V.z); bots.setMatrixAt(i, M);
      for (let j = 0; j < 3; j++) { M.makeTranslation(V.x - Math.cos(aa + 1.5) * 0.18 * (j + 1), V.y + 0.05 * j, V.z - Math.sin(aa + 1.5) * 0.18 * (j + 1)); bub.setMatrixAt(i * 3 + j, M); }
    }
    bots.instanceMatrix.needsUpdate = bub.instanceMatrix.needsUpdate = true;
    const shrink = ease(seg(t, 0.5, 1)) * P(p, 'shrink', 0);
    tumor.scale.set(1 - shrink * 0.9, 0.7 * (1 - shrink * 0.9), 1 - shrink * 0.9);
    glow.intensity = k * 15;
    orbit(camera, p, t, { dist0: 16, dist1: 10, el0: 0.6, el1: 0.45, az0: 0, az1: 0.6, ty0: 0.5, ty1: 0.5 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.65 });
}

// Macrophage engulfing nanoparticles
function immune_attack(p) {
  const scene = baseScene('#0a0610', 0.04); const camera = cam(38);
  const mg = new THREE.SphereGeometry(2.4, 160, 120);
  const mac = new THREE.Mesh(mg, new THREE.MeshPhysicalMaterial({ color: '#b89a70', envMapIntensity: 0.3, roughness: 0.35, transmission: 0.3, thickness: 2, clearcoat: 0.8, transparent: true, opacity: 0.85 }));
  scene.add(mac);
  const base = Float32Array.from(mg.attributes.position.array);
  const nu = new THREE.Mesh(new THREE.SphereGeometry(0.9, 48, 32), new THREE.MeshPhysicalMaterial({ color: '#7a4ab0', roughness: 0.4 })); nu.position.set(-0.4, 0.2, 0); scene.add(nu);
  const parts = Array.from({ length: 24 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshPhysicalMaterial({ color: '#d8e0ea', metalness: 0.7, roughness: 0.25, emissive: CYAN, emissiveIntensity: 0.3 })); scene.add(m); return { m, a: rnd(i) * 6.28, b: rnd(i + 0.4) * 3 - 1.5, r: 4.5 + rnd(i + 0.8) * 3 }; });
  keyLights(scene, { key: '#fff0e0', keyI: 1.2, hemi: 0.4 });
  const update = (t) => {
    const pa = mg.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
      const s = 1 + 0.12 * n3(x * 0.6 + t * 2, y * 0.6, z * 0.6) + 0.35 * Math.max(0, n3(x * 0.4, y * 0.4 + t, z * 0.4) - 0.2);
      pa.setXYZ(i, x * s, y * s, z * s);
    }
    pa.needsUpdate = true; mg.computeVertexNormals();
    const k = ease(seg(t, 0.1, 0.9));
    parts.forEach((q, i) => { const r = lerp(q.r, 0.6 + rnd(i) * 1.2, Math.min(1, k * 1.2 * (0.6 + rnd(i + 2) * 0.6))); q.m.position.set(Math.cos(q.a + t) * r, q.b * (r / q.r), Math.sin(q.a + t) * r); });
    orbit(camera, p, t, { dist0: 13, dist1: 10, el0: 0.2, el1: 0.12, az0: -0.3, az1: 0.3 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.85 });
}

// Lipid nanoparticle (cut-away) carrying mRNA, fusing with a cell membrane
function lnp(p) {
  const scene = baseScene('#06040e', 0.03); const camera = cam(36);
  const N = 900, heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshPhysicalMaterial({ color: '#ffd27a', roughness: 0.4, clearcoat: 0.5 }), N);
  const M = new THREE.Matrix4(), V = new THREE.Vector3(); let k = 0;
  for (let i = 0; i < N * 2 && k < N; i++) {
    const u = rnd(i) * 2 - 1, a = rnd(i + 0.5) * Math.PI * 2, s = Math.sqrt(1 - u * u);
    V.set(Math.cos(a) * s, u, Math.sin(a) * s);
    if (V.z > 0.35) continue; // cut-away window facing the camera
    V.multiplyScalar(2.2); M.makeTranslation(V.x, V.y, V.z); heads.setMatrixAt(k++, M);
  }
  heads.count = k;
  const ball = new THREE.Group(); ball.add(heads); scene.add(ball);
  const rnaM = new THREE.MeshPhysicalMaterial({ color: '#ff5aa5', emissive: '#ff5aa5', emissiveIntensity: 0.4, roughness: 0.4 });
  for (let j = 0; j < 4; j++) {
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push(new THREE.Vector3(Math.sin(u * 9 + j) * 1.2, (u - 0.5) * 2.4, Math.cos(u * 7 + j * 2) * 1.2)); }
    ball.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.06, 8), rnaM));
  }
  const wall = new THREE.PlaneGeometry(30, 20, 150, 100); displace(wall, (v) => 0.15 * n3(v.x * 0.5, v.y * 0.5, 0));
  const mem = new THREE.Mesh(wall, new THREE.MeshPhysicalMaterial({ color: '#7fb8ff', roughness: 0.3, transmission: 0.4, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
  mem.position.set(0, 0, -6); scene.add(mem);
  keyLights(scene, { keyI: 1.2, hemi: 0.45 });
  const update = (t) => {
    ball.rotation.y = t * 0.6; ball.rotation.x = t * 0.2;
    ball.position.z = lerp(P(p, 'z0', 0), P(p, 'z1', 0), ease(t));
    orbit(camera, p, t, { dist0: 10, dist1: 8, el0: 0.12, el1: 0.08, az0: 0.15, az1: -0.15 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.7 });
}

// Xenobot: C-shaped cluster of cells sweeping loose cells into piles
function xenobot(p) {
  const scene = baseScene('#04100c', 0.03); const camera = cam(38);
  const bot = new THREE.Group(); scene.add(bot);
  const cm = new THREE.MeshPhysicalMaterial({ color: '#d8b08a', roughness: 0.5, clearcoat: 0.4 });
  const cm2 = new THREE.MeshPhysicalMaterial({ color: '#c06a5a', roughness: 0.5 });
  for (let i = 0; i < 260; i++) {
    const a = rnd(i) * Math.PI * 1.6 + 0.4, r = Math.sqrt(rnd(i + 0.3)) * 1.6, y = (rnd(i + 0.6) - 0.5) * 1.6;
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.17 + rnd(i + 0.9) * 0.06, 12, 8), i % 5 ? cm : cm2);
    m.position.set(Math.cos(a) * r, y, Math.sin(a) * r); bot.add(m);
  }
  const loose = Array.from({ length: 60 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), cm); scene.add(m); return { m, x: (rnd(i) - 0.5) * 16, z: (rnd(i + 0.5) - 0.5) * 10 }; });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshPhysicalMaterial({ color: '#0e2a22', roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1; scene.add(floor);
  keyLights(scene, { keyI: 1.2, hemi: 0.45 });
  const update = (t) => {
    const x = lerp(-6, 6, t); bot.position.set(x, 0, Math.sin(t * 4) * 1.5); bot.rotation.y = -Math.PI / 2 + Math.sin(t * 4) * 0.3;
    loose.forEach((q, i) => {
      const dx = q.x - x, dz = q.z - bot.position.z, d = Math.hypot(dx, dz);
      const gathered = p.gather && d < 2.6 ? 1 : 0;
      q.m.position.set(gathered ? x + 1.8 : q.x, -0.85, gathered ? bot.position.z : q.z);
    });
    orbit(camera, p, t, { dist0: 16, dist1: 13, el0: 0.6, el1: 0.5, az0: 0.2, az1: -0.1 });
  };
  return finish(scene, camera, update, { strength: 0.4, threshold: 0.8 });
}

// Concept respirocyte next to a red blood cell
function respirocyte(p) {
  const scene = baseScene('#0a0610', 0.02); const camera = cam(36);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 2), new THREE.MeshPhysicalMaterial({ color: '#dfe8f2', metalness: 0.1, roughness: 0.05, transmission: 0.7, thickness: 1.5, ior: 2.4, clearcoat: 1, flatShading: true }));
  scene.add(core);
  const rotors = [];
  for (let i = 0; i < 24; i++) {
    const u = rnd(i) * 2 - 1, a = rnd(i + 0.5) * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const r = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12), new THREE.MeshPhysicalMaterial({ color: '#57d8ff', emissive: CYAN, emissiveIntensity: 0.6 }));
    r.position.set(Math.cos(a) * s * 1.42, u * 1.42, Math.sin(a) * s * 1.42); r.lookAt(0, 0, 0); r.rotateX(Math.PI / 2); scene.add(r); rotors.push(r);
  }
  const rbc = rbcMesh(); rbc.scale.setScalar(4); rbc.position.set(-4.5, 0, -1); rbc.rotation.x = 1.2; scene.add(rbc);
  const ox = motes(scene, 200, 10, '#9fe0ff', 0.6);
  keyLights(scene, { keyI: 1.3, hemi: 0.45 });
  const update = (t) => {
    core.rotation.y = t; rotors.forEach((r, i) => r.rotateY(0.3)); rbc.rotation.y = t * 0.3; ox.userData.update(t);
    orbit(camera, p, t, { dist0: 12, dist1: 9.5, el0: 0.15, el1: 0.1, az0: 0.3, az1: 0, tx0: -1, tx1: -0.8 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

// Nanobot entering a cell and repairing a broken DNA rung
function cell_repair(p) {
  const scene = baseScene('#06040e', 0.03); const camera = cam(36);
  const c = cell({ r: 5, color: '#ff9aa8', nucleus: '#5a2cff' }); scene.add(c);
  c.userData.nucleus.visible = false;
  const dna = dnaHelix({ turns: 2, radius: 0.8, pitch: 3 }); dna.position.set(0, 0, 0); scene.add(dna);
  const broken = dna.userData.pairs[9];
  const b = nanobot(0.45); scene.add(b);
  keyLights(scene, { keyI: 1.1, hemi: 0.4 });
  const update = (t) => {
    const fix = ease(seg(t, 0.55, 0.8));
    broken.left.position.x = 0.4 + (1 - fix) * 0.9; broken.right.position.x = -0.4 - (1 - fix) * 0.9;
    broken.left.material.emissiveIntensity = broken.right.material.emissiveIntensity = 0.35 + (1 - fix) * Math.max(0, Math.sin(t * 20));
    const k = ease(seg(t, 0, 0.55));
    b.position.set(lerp(7, 1.2, k), lerp(2, broken.y, k), lerp(2, 0.2, k)); b.lookAt(0, broken.y, 0); b.rotateY(-Math.PI / 2);
    b.userData.tail.rotation.x = t * 60;
    dna.rotation.y = 0.4 + t * 0.2;
    orbit(camera, p, t, { dist0: 10, dist1: 7, el0: 0.1, el1: 0.05, az0: 0.6, az1: 0.3, ty0: 0, ty1: broken.y * 0.5 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

// "Gray goo": a planet slowly greyed by a swarm
function gray_goo(p) {
  const scene = baseScene('#000000'); const camera = cam(32);
  starfield(scene);
  const earthM = new THREE.MeshStandardMaterial({ map: earthTexture(), roughness: 0.8 });
  const earth = new THREE.Mesh(new THREE.SphereGeometry(2, 96, 64), earthM); scene.add(earth);
  const goo = new THREE.Mesh(new THREE.SphereGeometry(2.02, 96, 64), new THREE.MeshPhysicalMaterial({ color: '#8a8f96', roughness: 0.6, metalness: 0.4, transparent: true, opacity: 0 }));
  scene.add(goo);
  const sun = new THREE.DirectionalLight('#fff3e0', 2.5); sun.position.set(-5, 2, 6); scene.add(sun); scene.add(new THREE.AmbientLight('#203050', 0.5));
  const update = (t) => { earth.rotation.y = t; goo.rotation.y = t; goo.material.opacity = ease(seg(t, 0.2, 0.8)) * 0.92; camera.position.set(0, 0.5, lerp(9, 7, ease(t))); camera.lookAt(0, 0, 0); };
  return finish(scene, camera, update, { strength: 0.4, threshold: 0.8 });
}

run({ bloodstream, nanobot_closeup, body_bots, title_card, scale_zoom, low_reynolds, magnet_control, dna_origami, tumor_vessel, bladder_bots, immune_attack, lnp, xenobot, respirocyte, cell_repair, gray_goo });
