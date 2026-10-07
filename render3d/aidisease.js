// Scenes for "The AI That Can Predict Diseases Before Symptoms Appear" (16:9 long-form).
import {
  THREE, RoundedBoxGeometry, n3, ease, lerp, flesh, displace, baseScene, cam, seg, P, rnd, orbit, finish,
  motes, holoPanel, txt, lineChart, dnaHelix, cell, neuron, heartMesh, xrayBody, humanoid, standPose,
  neuralNet, dataStream, techFloor, keyLights,
} from './lib_sci.js';
import { run } from './lib3d.js';

const CYAN = '#57d8ff', RED = '#ff4b5c', GREEN = '#4dff9a', AMBER = '#ffb347';

// X-ray body under a moving scan plane; one organ can be highlighted, with data rising from it
function body_scan(p) {
  const scene = baseScene('#030a12', 0.03); const camera = cam(32);
  techFloor(scene, { y: -2.4 });
  const body = xrayBody(); body.position.y = -0.2; scene.add(body);
  const scan = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.02, 1.6), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.8 }));
  scene.add(scan);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.02, 8, 64), new THREE.MeshBasicMaterial({ color: RED }));
  scene.add(ring);
  const organ = body.userData.parts[P(p, 'highlight', '')];
  let stream = null;
  if (organ) {
    const o = organ.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -0.2, 0));
    stream = dataStream(new THREE.CatmullRomCurve3([o, o.clone().add(new THREE.Vector3(1.2, 1.2, 0.5)), new THREE.Vector3(3, 4, 0)]), 260, CYAN, 3); scene.add(stream);
  }
  const m = motes(scene, 300, 18, CYAN, 0.35);
  keyLights(scene, { keyI: 0.6, hemi: 0.3 });
  const update = (t) => {
    body.rotation.y = P(p, 'spin', 0.6) * t + P(p, 'rot', 0);
    scan.position.y = -2.2 + ((t * P(p, 'scans', 1.5)) % 1) * 6.4;
    if (organ) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 18);
      organ.material.emissive.set(RED); organ.material.emissiveIntensity = 0.6 + pulse * 0.8;
      organ.getWorldPosition(ring.position); ring.lookAt(camera.position); ring.scale.setScalar(1 + pulse * 0.2);
      stream.update(t, 0.4);
    } else ring.visible = false;
    m.userData.update(t);
    orbit(camera, p, t, { dist0: 14, dist1: 11, el0: 0.1, el1: 0.06, az0: -0.4, az1: 0.3, ty0: 1.3, ty1: 1.4 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.72 });
}

// A sea of people as small glowing figures; some turn red (at risk)
function crowd_records(p) {
  const scene = baseScene('#02060c', 0.035); const camera = cam(40);
  const N = 40 * 24, bodyG = new THREE.CapsuleGeometry(0.14, 0.4, 4, 10), headG = new THREE.SphereGeometry(0.13, 12, 8);
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const bodies = new THREE.InstancedMesh(bodyG, mat, N), heads = new THREE.InstancedMesh(headG, mat, N);
  const M = new THREE.Matrix4(), C = new THREE.Color();
  let k = 0;
  for (let i = 0; i < 40; i++) for (let j = 0; j < 24; j++, k++) {
    const x = (i - 19.5) * 0.75 + (rnd(k) - 0.5) * 0.2, z = (j - 12) * 0.75 + (rnd(k + 0.5) - 0.5) * 0.2;
    M.makeTranslation(x, 0.35, z); bodies.setMatrixAt(k, M); M.makeTranslation(x, 0.82, z); heads.setMatrixAt(k, M);
  }
  scene.add(bodies, heads);
  techFloor(scene, { y: 0 });
  const redFrac = P(p, 'red', 0.04);
  const update = (t) => {
    for (let i = 0; i < N; i++) {
      const isRed = rnd(i * 3.1) < redFrac * seg(t, 0.15, 0.6) / Math.max(0.001, seg(1, 0.15, 0.6));
      C.set(isRed ? RED : CYAN).multiplyScalar(isRed ? 1.2 + 0.4 * Math.sin(t * 15 + i) : 0.55 + 0.25 * rnd(i));
      bodies.setColorAt(i, C); heads.setColorAt(i, C);
    }
    bodies.instanceColor.needsUpdate = heads.instanceColor.needsUpdate = true;
    orbit(camera, p, t, { dist0: 22, dist1: 15, el0: 0.45, el1: 0.3, az0: -0.5, az1: 0.2, ty0: 0, ty1: 0 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.5 });
}

// Wall of holographic patient records with vitals; optional red alerts
function hospital_data(p) {
  const scene = baseScene('#02070d', 0.03); const camera = cam(40);
  const panels = [], alerts = P(p, 'alerts', 0);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) {
    const id = r * 7 + c, alert = alerts && rnd(id + 9) < alerts;
    const panel = holoPanel(2.2, 1.24, (ctx, t, w, h) => {
      const col = alert && Math.sin(t * 20 + id) > 0 ? RED : CYAN;
      txt(ctx, `PATIENT ${1000 + id * 37}`, 24, 36, 30, col);
      txt(ctx, `HR ${62 + Math.floor(rnd(id) * 30)}  BP ${110 + Math.floor(rnd(id + 1) * 30)}/${70 + Math.floor(rnd(id + 2) * 15)}`, 24, 80, 26, '#d8f6ff', 'left', 600);
      lineChart(ctx, 20, 110, w - 40, h - 140, (u) => 0.5 + 0.35 * Math.sin(u * 40 + t * 8 + id) * Math.exp(-((u * 10 + t * 3 + id) % 1) * 3), 1, col, 3);
      if (alert) txt(ctx, 'ALERT', w - 24, 36, 34, RED, 'right', 900);
    }, { res: 512 });
    const a = (c - 3) * 0.32;
    panel.position.set(Math.sin(a) * 9, 3.2 - r * 1.45, -Math.cos(a) * 9 + 6); panel.lookAt(0, 3.2 - r * 1.45, 8);
    scene.add(panel); panels.push(panel);
  }
  const m = motes(scene, 400, 20, CYAN, 0.3);
  const update = (t) => {
    panels.forEach((q) => q.userData.update(t));
    m.userData.update(t);
    camera.position.set(lerp(-1.5, 1.5, ease(t)), lerp(1.8, 1.9, t), lerp(9, 6.5, ease(t))); camera.lookAt(0, 1.8, -2);
  };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.4 });
}

// Neural network with data flowing in and a risk read-out
function net(p) {
  const scene = baseScene('#02060c', 0.02); const camera = cam(38);
  const nn = neuralNet({ layers: P(p, 'layers', [6, 9, 9, 9, 3]), w: 9, h: 5 }); scene.add(nn);
  const inflow = dataStream(new THREE.CatmullRomCurve3([new THREE.Vector3(-14, 2, 2), new THREE.Vector3(-9, -1, 1), new THREE.Vector3(-5, 0, 0)]), 400, AMBER, 3);
  scene.add(inflow);
  const out = holoPanel(3, 1.6, (ctx, t, w, h) => {
    const v = Math.min(P(p, 'risk', 82), Math.floor(seg(t, 0.3, 0.9) * P(p, 'risk', 82)));
    txt(ctx, P(p, 'label', 'RISK SCORE'), w / 2, 60, 46, '#d8f6ff', 'center');
    txt(ctx, `${v}%`, w / 2, h / 2 + 40, 180, v > 60 ? RED : CYAN, 'center', 900);
  }, { res: 768 });
  out.position.set(7.5, 0, 0); out.rotation.y = -0.35; scene.add(out);
  const m = motes(scene, 300, 24, CYAN, 0.3);
  const update = (t) => {
    nn.userData.update(t, P(p, 'speed', 1.5)); inflow.userData.update(t, 0.35); out.userData.update(t); m.userData.update(t);
    orbit(camera, p, t, { dist0: 18, dist1: 14, el0: 0.12, el1: 0.06, az0: -0.25, az1: 0.2, tx0: 1, tx1: 1.5 });
  };
  return finish(scene, camera, update, { strength: 0.9, threshold: 0.35 });
}

// Risk timeline dashboard: risk rises, the AI alert fires well before symptoms
function risk_dashboard(p) {
  const scene = baseScene('#02060c'); const camera = cam(36);
  const alertAt = P(p, 'alertAt', 0.45), symAt = P(p, 'symAt', 0.82);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    const k = seg(t, 0.05, 0.9);
    txt(ctx, P(p, 'title', 'PREDICTED RISK'), 60, 70, 56, '#d8f6ff');
    txt(ctx, P(p, 'sub', 'patient timeline'), 60, 130, 34, '#7fb8d0', 'left', 600);
    const x0 = 80, y0 = 190, cw = w - 160, ch = h - 320;
    lineChart(ctx, x0, y0, cw, ch, (u) => 0.08 + 0.85 * Math.pow(u, 2.4), k, AMBER, 6);
    if (k > alertAt) {
      const x = x0 + alertAt * cw;
      ctx.strokeStyle = CYAN; ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + ch); ctx.stroke(); ctx.setLineDash([]);
      txt(ctx, P(p, 'alertLabel', 'AI ALERT'), x + 14, y0 + 30, 38, CYAN, 'left', 900);
    }
    if (k > symAt) {
      const x = x0 + symAt * cw;
      ctx.strokeStyle = RED; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + ch); ctx.stroke();
      txt(ctx, P(p, 'symLabel', 'SYMPTOMS'), x - 14, y0 + 30, 38, RED, 'right', 900);
    }
    if (k > symAt + 0.02 && P(p, 'lead', '')) {
      const xa = x0 + alertAt * cw, xs = x0 + symAt * cw, y = y0 + ch + 60;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xs, y); ctx.stroke();
      txt(ctx, P(p, 'lead', ''), (xa + xs) / 2, y + 44, 44, '#ffffff', 'center', 900);
    }
    txt(ctx, P(p, 'axis', 'TIME'), w - 80, h - 40, 28, '#7fb8d0', 'right', 600);
  }, { res: 1600 });
  scene.add(panel);
  const m = motes(scene, 300, 24, CYAN, 0.25);
  const update = (t) => {
    panel.userData.update(t); m.userData.update(t);
    orbit(camera, p, t, { dist0: 10.5, dist1: 9, el0: 0.05, el1: 0.02, az0: -0.25, az1: 0.1 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.45 });
}

// Kidney with vessels and blood flow; damage darkens it and pulses red
function kidney(p) {
  const scene = baseScene('#0b0306', 0.03); const camera = cam(34);
  const g = new THREE.SphereGeometry(1, 128, 96), pa = g.attributes.position;
  for (let i = 0; i < pa.count; i++) {
    const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
    const indent = 0.45 * Math.exp(-((x - 1) ** 2) / 0.25) * Math.exp(-(y * y) / 0.35);
    pa.setXYZ(i, x * 0.85 - indent, y * 1.45, z * 0.6);
  }
  g.computeVertexNormals(); displace(g, (v) => 0.03 * n3(v.x * 4, v.y * 4, v.z * 4));
  const km = flesh('#9a3b2e', 3, { clearcoat: 1 });
  const k = new THREE.Mesh(g, km); scene.add(k);
  const art = new THREE.CatmullRomCurve3([new THREE.Vector3(0.4, 0.15, 0), new THREE.Vector3(1.4, 0.3, 0.1), new THREE.Vector3(2.6, 0.6, 0), new THREE.Vector3(4, 0.7, 0)]);
  const vein = new THREE.CatmullRomCurve3([new THREE.Vector3(0.4, -0.2, 0.1), new THREE.Vector3(1.4, -0.4, 0.2), new THREE.Vector3(2.6, -0.7, 0.1), new THREE.Vector3(4, -0.8, 0)]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(art, 60, 0.16, 16), flesh('#c2303a', 2)));
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(vein, 60, 0.18, 16), flesh('#5a3a8c', 2)));
  const flow = dataStream(art, 160, '#ff5a5a', 4); scene.add(flow);
  const warn = new THREE.PointLight(RED, 0, 8, 1.5); warn.position.set(-1, 0, 2.5); scene.add(warn);
  keyLights(scene, { keyI: 1.2, hemi: 0.3 });
  const update = (t) => {
    const dmg = lerp(P(p, 'dmg0', 0), P(p, 'dmg1', 0), ease(t));
    km.color.set('#9a3b2e').lerp(new THREE.Color('#3a1a1a'), dmg * 0.7);
    warn.intensity = dmg * (20 + 15 * Math.sin(t * 20));
    flow.userData.update(t, lerp(0.5, 0.15, dmg));
    k.rotation.y = -0.3 + t * 0.4;
    orbit(camera, p, t, { dist0: 8, dist1: 6, el0: 0.2, el1: 0.1, az0: -0.3, az1: 0.2, tx0: 0.8, tx1: 0.6 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

// Retina fundus drawing (procedural branching vessels)
function drawRetina(ctx, w, h, k, t) {
  const cx = w / 2, cy = h / 2, R = h * 0.46;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
  g.addColorStop(0, '#f0a050'); g.addColorStop(0.7, '#c0502a'); g.addColorStop(1, '#3a0e06');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffe8b0'; ctx.beginPath(); ctx.arc(cx - R * 0.35, cy, R * 0.12, 0, Math.PI * 2); ctx.fill();
  const branch = (x, y, a, len, wdt, d, s) => {
    if (d === 0 || wdt < 0.6) return;
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    ctx.strokeStyle = s % 2 ? '#7a1010' : '#a01818'; ctx.lineWidth = wdt; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
    branch(x2, y2, a + (rnd(s) - 0.5) * 0.9 + 0.25, len * 0.82, wdt * 0.75, d - 1, s * 2 + 1);
    branch(x2, y2, a + (rnd(s + 1) - 0.5) * 0.9 - 0.25, len * 0.8, wdt * 0.72, d - 1, s * 2 + 2);
  };
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();
  for (let i = 0; i < 6; i++) branch(cx - R * 0.35, cy, (i / 6) * Math.PI * 2 + 0.3, R * 0.22, 9, 7, i + 3);
  if (k > 0) { // AI attention boxes
    for (let i = 0; i < 4; i++) {
      const bx = cx + (rnd(i + 20) - 0.3) * R, by = cy + (rnd(i + 30) - 0.5) * R * 1.2;
      ctx.strokeStyle = `rgba(87,216,255,${Math.min(1, k * 2 - i * 0.3)})`; ctx.lineWidth = 4; ctx.strokeRect(bx, by, 90, 90);
    }
    ctx.globalAlpha = 0.6; ctx.fillStyle = CYAN; ctx.fillRect(cx - R, cy - R + ((t * 0.8) % 1) * 2 * R, 2 * R, 4); ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// Eyeball with scanning beam, retina image panel behind
function eye_scan(p) {
  const scene = baseScene('#02060c', 0.02); const camera = cam(34);
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#f4f1ec'; x.fillRect(0, 0, 512, 512);
  const ig = x.createRadialGradient(256, 256, 30, 256, 256, 110); ig.addColorStop(0, '#0b0b0b'); ig.addColorStop(0.32, '#0b0b0b'); ig.addColorStop(0.35, '#3a7a5a'); ig.addColorStop(0.9, '#2a5a8a'); ig.addColorStop(1, '#f4f1ec');
  x.fillStyle = ig; x.beginPath(); x.arc(256, 256, 110, 0, Math.PI * 2); x.fill();
  for (let i = 0; i < 80; i++) { x.strokeStyle = 'rgba(200,230,255,0.25)'; x.beginPath(); const a = i / 80 * Math.PI * 2; x.moveTo(256 + Math.cos(a) * 40, 256 + Math.sin(a) * 40); x.lineTo(256 + Math.cos(a) * 105, 256 + Math.sin(a) * 105); x.stroke(); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const eye = new THREE.Mesh(new THREE.SphereGeometry(1.4, 96, 64), new THREE.MeshPhysicalMaterial({ map: tex, color: '#cfcac4', roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 0.3 }));
  eye.rotation.y = -Math.PI / 2; scene.add(eye);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 6, 12), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.8 }));
  beam.rotation.x = Math.PI / 2; beam.position.z = 4.3; scene.add(beam);
  const panel = holoPanel(6, 3.4, (ctx, t, w, h) => { drawRetina(ctx, w, h, seg(t, 0.3, 0.8), t); txt(ctx, 'RETINA SCAN', 30, 40, 34, CYAN); }, { res: 1024 });
  panel.position.set(4.5, 0.6, -2); panel.rotation.y = -0.5; scene.add(panel);
  keyLights(scene, { keyI: 0.7, hemi: 0.25 });
  const update = (t) => {
    beam.material.opacity = 0.5 + 0.4 * Math.sin(t * 30);
    panel.userData.update(t);
    orbit(camera, p, t, { dist0: 9, dist1: 7, el0: 0.1, el1: 0.05, az0: 0.5, az1: 0.25, tx0: 1.5, tx1: 1.8 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.82 });
}

// Procedural medical image on a big panel: retina | mammogram | ct; AI heat-map overlay
function medical_image(p) {
  const scene = baseScene('#02060c'); const camera = cam(34);
  const kind = P(p, 'kind', 'retina');
  const base = document.createElement('canvas'); base.width = 1600; base.height = 900; const b = base.getContext('2d');
  b.fillStyle = '#000'; b.fillRect(0, 0, 1600, 900);
  if (kind === 'mammogram') {
    const img = b.createImageData(1600, 900);
    for (let y = 0; y < 900; y++) for (let x = 0; x < 1600; x++) {
      const dx = (x - 500) / 520, dy = (y - 450) / 430, inside = dx < 0 ? 1 : Math.max(0, 1 - (dx * dx + dy * dy));
      const tissue = inside > 0 && dx * dx * 0.3 + dy * dy < 1 && x < 1000 ? 0.25 + 0.55 * (0.5 + 0.5 * n3(x / 60, y / 60, 1)) * (0.6 + 0.4 * n3(x / 15, y / 15, 2)) : 0;
      const v = Math.max(0, Math.min(255, tissue * 255)); img.data.set([v, v, v, 255], (y * 1600 + x) * 4);
    }
    b.putImageData(img, 0, 0);
  } else if (kind === 'ct') {
    b.fillStyle = '#555'; b.beginPath(); b.ellipse(800, 450, 520, 360, 0, 0, Math.PI * 2); b.fill();
    b.fillStyle = '#222'; b.beginPath(); b.ellipse(800, 450, 470, 320, 0, 0, Math.PI * 2); b.fill();
    const blob = (x, y, rx, ry, c) => { b.fillStyle = c; b.beginPath(); b.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); b.fill(); };
    blob(560, 400, 170, 120, '#7a7a7a'); blob(1050, 420, 90, 140, '#8a8a8a'); blob(800, 650, 60, 60, '#e0e0e0'); blob(820, 470, 150, 40, '#9a9a9a'); blob(650, 600, 70, 50, '#6a6a6a'); blob(960, 600, 70, 50, '#6a6a6a');
  } else drawRetina(b, 1600, 900, 0, 0);
  const hx = P(p, 'hx', kind === 'ct' ? 0.55 : 0.42), hy = P(p, 'hy', 0.45);
  const panel = holoPanel(9, 5.06, (ctx, t, w, h) => {
    ctx.drawImage(base, 0, 0, w, h);
    const k = seg(t, P(p, 'heatAt', 0.35), 0.85);
    if (k > 0) {
      const g = ctx.createRadialGradient(hx * w, hy * h, 0, hx * w, hy * h, 180 * k + 20);
      g.addColorStop(0, `rgba(255,60,40,${0.75 * k})`); g.addColorStop(0.5, `rgba(255,190,40,${0.45 * k})`); g.addColorStop(1, 'rgba(255,255,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = CYAN; ctx.lineWidth = 4; ctx.strokeRect(hx * w - 120, hy * h - 120, 240, 240);
      txt(ctx, P(p, 'tag', 'AI: HIGH RISK'), hx * w + 130, hy * h - 100, 34, CYAN, 'left', 900);
    }
    ctx.globalAlpha = 0.5; ctx.fillStyle = CYAN; ctx.fillRect(0, ((t * 0.7) % 1) * h, w, 3); ctx.globalAlpha = 1;
    txt(ctx, P(p, 'title', ''), 30, 40, 34, CYAN);
  }, { res: 1600, frame: true });
  scene.add(panel);
  const update = (t) => { panel.userData.update(t); orbit(camera, p, t, { dist0: 9.5, dist1: 8, el0: 0.04, el1: 0.02, az0: -0.2, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.6 });
}

// Healthy cells with a growing cluster of dark, dividing tumour cells
function cells_tumor(p) {
  const scene = baseScene('#12040a', 0.04); const camera = cam(36);
  const normal = [], tumor = [];
  for (let i = 0; i < 46; i++) {
    const c = cell({ r: 0.7 + rnd(i) * 0.2, seed: i }); c.position.set((rnd(i + 0.1) - 0.5) * 14, (rnd(i + 0.2) - 0.5) * 7, (rnd(i + 0.3) - 0.5) * 8 - 2); scene.add(c); normal.push(c);
  }
  for (let i = 0; i < 18; i++) {
    const c = cell({ r: 0.55, color: '#7a3c9a', nucleus: '#1a0a2a', seed: i + 50 });
    const a = i * 2.4, r = 0.4 + Math.sqrt(i) * 0.55; c.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.8, Math.sin(a * 1.3) * 0.6 + 1); scene.add(c); tumor.push(c);
  }
  keyLights(scene, { key: '#ffe0e8', keyI: 1.4, hemi: 0.4 });
  const glow = new THREE.PointLight('#c060ff', 0, 8, 1.5); glow.position.set(0, 0, 3); scene.add(glow);
  const update = (t) => {
    const n = Math.floor(lerp(P(p, 'n0', 1), P(p, 'n1', 18), ease(t)));
    tumor.forEach((c, i) => { const s = i < n ? Math.min(1, (lerp(P(p, 'n0', 1), P(p, 'n1', 18), ease(t)) - i)) : 0; c.scale.setScalar(Math.max(0.001, s)); c.rotation.y = t + i; });
    normal.forEach((c, i) => { c.rotation.set(t * 0.2 + i, t * 0.3, 0); });
    glow.intensity = n * 1.5;
    orbit(camera, p, t, { dist0: 12, dist1: 8, el0: 0.1, el1: 0.05, az0: -0.3, az1: 0.25, tz0: 0, tz1: 0.5 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.75 });
}

// Beating heart beside a live ECG; AI flag
function heart_ecg(p) {
  const scene = baseScene('#0a0306', 0.02); const camera = cam(34);
  const heart = heartMesh(); scene.add(heart); heart.position.x = -2.2;
  const ecg = (u) => { const ph = u % 1; return 0.45 + (ph > 0.42 && ph < 0.46 ? -0.12 : 0) + (ph > 0.46 && ph < 0.5 ? 0.45 : 0) + (ph > 0.5 && ph < 0.54 ? -0.18 : 0) + 0.06 * Math.exp(-((ph - 0.7) ** 2) / 0.003); };
  const panel = holoPanel(6, 3.4, (ctx, t, w, h) => {
    txt(ctx, 'ECG  LEAD II', 30, 44, 36, '#d8f6ff');
    lineChart(ctx, 30, 90, w - 60, h - 170, (u) => ecg(u * 5 + t * 6), 1, GREEN, 5);
    if (p.flag && t > 0.4) txt(ctx, P(p, 'flagText', 'AI: WEAK HEART PUMP RISK'), w / 2, h - 40, 40, Math.sin(t * 16) > 0 ? RED : AMBER, 'center', 900);
  }, { res: 1200 });
  panel.position.set(2.6, 0.2, 0); panel.rotation.y = -0.3; scene.add(panel);
  keyLights(scene, { key: '#ffe6e6', keyI: 1.5, hemi: 0.35 });
  const update = (t) => {
    const beat = Math.max(0, Math.sin(t * Math.PI * 2 * 6)) ** 8;
    heart.scale.setScalar(1 + beat * 0.08); heart.rotation.y = 0.3 + t * 0.3;
    panel.userData.update(t);
    orbit(camera, p, t, { dist0: 10, dist1: 8.5, el0: 0.08, el1: 0.05, az0: -0.15, az1: 0.15 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

// Wrist with a smartwatch streaming movement data
function smartwatch(p) {
  const scene = baseScene('#04070c', 0.02); const camera = cam(32);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 5, 12, 40), new THREE.MeshPhysicalMaterial({ color: '#8f5c42', roughness: 0.6, sheen: 0.2, sheenColor: new THREE.Color('#ffb59a'), envMapIntensity: 0.15 }));
  arm.rotation.z = Math.PI / 2; arm.position.x = -1.5; scene.add(arm);
  const strap = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.12, 16, 64), new THREE.MeshPhysicalMaterial({ color: '#1e2228', roughness: 0.6 })); strap.rotation.y = Math.PI / 2; strap.position.x = 0.3; scene.add(strap);
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.85, 0.2, 4, 0.12), new THREE.MeshPhysicalMaterial({ color: '#2a2e35', metalness: 0.7, roughness: 0.25, clearcoat: 1 }));
  body.position.set(0.3, 0.64, 0); body.rotation.x = -Math.PI / 2; scene.add(body);
  const c = document.createElement('canvas'); c.width = 320; c.height = 360; const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.7), new THREE.MeshBasicMaterial({ map: tex })); screen.position.set(0.3, 0.745, 0); screen.rotation.x = -Math.PI / 2; scene.add(screen);
  const panel = holoPanel(6, 3, (cx, t, w, h) => {
    txt(cx, P(p, 'title', 'MOVEMENT & SLEEP — 7 DAYS'), 30, 44, 38, '#d8f6ff');
    lineChart(cx, 30, 100, w - 60, h - 140, (u) => 0.5 + 0.3 * Math.sin(u * 60) * (1 - 0.4 * u) + 0.08 * n3(u * 80, t, 0), seg(t, 0.05, 0.9), CYAN, 4);
  }, { res: 1200 });
  panel.position.set(1.2, 2.6, -1.5); panel.rotation.x = -0.1; scene.add(panel);
  keyLights(scene, { keyI: 0.8, hemi: 0.25 });
  const update = (t) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 320, 360);
    ctx.font = '900 64px sans-serif'; ctx.fillStyle = '#ff5a6a'; ctx.textAlign = 'center'; ctx.fillText(`${72 + Math.round(3 * Math.sin(t * 9))}`, 160, 120);
    ctx.font = '700 28px sans-serif'; ctx.fillStyle = '#aaa'; ctx.fillText('BPM', 160, 160);
    ctx.strokeStyle = CYAN; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const x = 20 + i * 4.7, y = 260 + Math.sin(i * 0.5 + t * 20) * 30 * Math.sin(i * 0.1); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    tex.needsUpdate = true; panel.userData.update(t);
    arm.rotation.x = 0.05 * Math.sin(t * 4); body.position.y = 0.64;
    orbit(camera, p, t, { dist0: 6, dist1: 4.5, el0: 0.75, el1: 0.6, az0: 0.4, az1: 0.1, tx0: 0.5, tx1: 0.6, ty0: 0.8, ty1: 1.0 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.85 });
}

// Field of neurons firing; fade > 0 makes some go dark (dopamine-cell loss)
function neurons(p) {
  const scene = baseScene('#04020c', 0.04); const camera = cam(40);
  const ns = [];
  for (let i = 0; i < 9; i++) {
    const n = neuron({ seed: i, color: '#c08aff', len: 5 + rnd(i) * 2 });
    n.position.set((i % 3 - 1) * 4.5 + (rnd(i + 3) - 0.5), Math.floor(i / 3) * 3 - 1, (rnd(i + 5) - 0.5) * 4); n.rotation.z = (rnd(i + 7) - 0.5) * 0.6;
    scene.add(n); ns.push(n);
  }
  keyLights(scene, { key: '#e0d0ff', keyI: 0.8, hemi: 0.3 });
  const update = (t) => {
    const fade = lerp(P(p, 'fade0', 0), P(p, 'fade1', 0), ease(t));
    ns.forEach((n, i) => {
      const dead = rnd(i + 11) < fade;
      n.userData.pulse(dead ? -1 : ((t * 2.2 + rnd(i)) % 1));
      n.traverse((o) => { if (o.material && o.material.emissive) { o.material.emissiveIntensity = dead ? 0 : o.material.emissiveIntensity; o.material.color.set(dead ? '#2a2233' : '#c08aff'); } });
    });
    orbit(camera, p, t, { dist0: 16, dist1: 12, el0: 0.1, el1: 0.05, az0: -0.3, az1: 0.2, ty0: 0, ty1: -0.5 });
  };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.45 });
}

// DNA helix with scanning ring and floating data tags
function dna_scan(p) {
  const scene = baseScene('#02060c', 0.02); const camera = cam(36);
  const dna = dnaHelix({ turns: 4 }); scene.add(dna);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.04, 8, 96), new THREE.MeshBasicMaterial({ color: CYAN })); ring.rotation.x = Math.PI / 2; scene.add(ring);
  const tags = ['GENES', 'BLOOD TESTS', 'SCANS', 'WEARABLES', 'HISTORY'].map((s, i) => {
    const panel = holoPanel(2.6, 0.7, (ctx, t, w, h) => txt(ctx, s, w / 2, h / 2, 64, CYAN, 'center', 900), { res: 512 });
    const a = i / 5 * Math.PI * 2; panel.position.set(Math.cos(a) * 4.2, (i - 2) * 1.6, Math.sin(a) * 4.2); scene.add(panel); return panel;
  });
  keyLights(scene, { keyI: 1, hemi: 0.4 });
  const update = (t) => {
    dna.rotation.y = t * 1.2;
    ring.position.y = Math.sin(t * Math.PI * 2) * dna.userData.height * 0.45;
    tags.forEach((q, i) => { q.userData.update(t); q.lookAt(camera.position); q.visible = !p.noTags && t > i * 0.12; });
    orbit(camera, p, t, { dist0: 15, dist1: 11, el0: 0.15, el1: 0.08, az0: 0, az1: 0.6 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.5 });
}

// Generic info panels: calc | falsealarm | sepsis | bias | privacy | approved
function chart_panel(p) {
  const scene = baseScene('#02060c'); const camera = cam(36);
  const kind = P(p, 'kind', 'calc');
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    const k = seg(t, 0.05, 0.75);
    if (kind === 'calc') {
      txt(ctx, 'CLASSIC RISK CALCULATOR', 60, 80, 48, '#d8f6ff');
      ['AGE', 'CHOLESTEROL', 'BLOOD PRESSURE', 'SMOKING', 'DIABETES'].forEach((s, i) => { if (k > i * 0.08) txt(ctx, '• ' + s, 90, 170 + i * 70, 40, CYAN, 'left', 700); });
      txt(ctx, 'AI MODEL', w * 0.58, 80, 48, '#d8f6ff');
      const n = Math.floor(seg(t, 0.35, 0.95) * 1400);
      for (let i = 0; i < n; i++) { ctx.fillStyle = i % 7 ? 'rgba(87,216,255,0.8)' : AMBER; ctx.fillRect(w * 0.58 + (i % 50) * 13, 140 + Math.floor(i / 50) * 18, 9, 12); }
      txt(ctx, `${Math.floor(seg(t, 0.35, 0.95) * 1400).toLocaleString()} FACTORS`, w * 0.58, h - 60, 44, AMBER, 'left', 900);
    } else if (kind === 'falsealarm') {
      txt(ctx, 'ALERTS RAISED', 60, 70, 50, '#d8f6ff');
      for (let i = 0; i < 30; i++) {
        const x = 120 + (i % 10) * 150, y = 190 + Math.floor(i / 10) * 210, show = k > i / 34, real = i % 3 === 0;
        if (!show) continue;
        ctx.fillStyle = real ? GREEN : AMBER; ctx.beginPath(); ctx.arc(x, y, 30, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(x - 30, y + 38, 60, 90);
      }
      txt(ctx, 'TRUE CASE', 120, h - 50, 36, GREEN, 'left', 900); txt(ctx, 'FALSE ALARM', 480, h - 50, 36, AMBER, 'left', 900);
    } else if (kind === 'sepsis') {
      txt(ctx, 'SEPSIS WARNING TOOL — INDEPENDENT TEST (2021)', 60, 70, 42, '#d8f6ff');
      const bar = (y, frac, label, col) => { ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(80, y, w - 160, 90); ctx.fillStyle = col; ctx.fillRect(80, y, (w - 160) * frac * k, 90); txt(ctx, label, 100, y + 45, 40, '#06121a', 'left', 900); };
      bar(200, 0.33, 'CAUGHT  ~33%', GREEN); bar(340, 0.67, 'MISSED  ~67%', RED);
    } else if (kind === 'bias') {
      txt(ctx, 'SAME ILLNESS, DIFFERENT SCORES', 60, 70, 46, '#d8f6ff');
      const col = (x, hgt, c, label) => { ctx.fillStyle = c; ctx.fillRect(x, h - 140 - hgt * k, 220, hgt * k); txt(ctx, label, x + 110, h - 90, 34, '#d8f6ff', 'center', 800); };
      col(220, 520, CYAN, 'WHITE PATIENTS'); col(620, 330, AMBER, 'BLACK PATIENTS');
      txt(ctx, 'ALGORITHM RISK SCORE', 1050, 250, 40, '#7fb8d0', 'left', 700);
      txt(ctx, 'trained on past', 1050, 330, 40, '#7fb8d0', 'left', 600); txt(ctx, 'healthcare SPENDING', 1050, 390, 40, AMBER, 'left', 900);
    } else if (kind === 'privacy') {
      const cx = w / 2, cy = h / 2 + 20;
      ctx.strokeStyle = CYAN; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(cx, cy - 90, 110, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = CYAN; ctx.fillRect(cx - 170, cy - 90, 340, 260);
      ctx.fillStyle = '#02060c'; ctx.beginPath(); ctx.arc(cx, cy + 20, 34, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(cx - 14, cy + 20, 28, 80);
      ['INSURERS?', 'EMPLOYERS?', 'HACKERS?'].forEach((s, i) => { if (k > 0.3 + i * 0.2) txt(ctx, s, i % 2 ? w - 120 : 120, 180 + i * 220, 52, AMBER, i % 2 ? 'right' : 'left', 900); });
    } else if (kind === 'approved') {
      txt(ctx, 'AUTONOMOUS AI EYE SCREENING', w / 2, 120, 58, '#d8f6ff', 'center');
      txt(ctx, 'FDA AUTHORIZED — 2018', w / 2, 230, 64, GREEN, 'center', 900);
      if (k > 0.4) { ctx.strokeStyle = GREEN; ctx.lineWidth = 28; ctx.beginPath(); ctx.moveTo(w / 2 - 120, 520); ctx.lineTo(w / 2 - 20, 620); ctx.lineTo(w / 2 + 160, 400); ctx.stroke(); }
    }
  }, { res: 1600 });
  scene.add(panel);
  const m = motes(scene, 250, 24, CYAN, 0.25);
  const update = (t) => { panel.userData.update(t); m.userData.update(t); orbit(camera, p, t, { dist0: 10.5, dist1: 9.2, el0: 0.04, el1: 0.02, az0: 0.2, az1: -0.1 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Doctor looking at a holographic patient with the AI's findings
function doctor_ai(p) {
  const scene = baseScene('#04080d', 0.03); const camera = cam(36);
  techFloor(scene, { y: 0 });
  const doc = humanoid({ style: 'person', color: '#8a5a3c' }); standPose(doc); scene.add(doc);
  doc.position.set(-1.6, 0, 1); doc.rotation.y = 0.9;
  const coat = new THREE.MeshPhysicalMaterial({ color: '#b9c2ca', roughness: 0.75, envMapIntensity: 0.15 });
  doc.traverse((o) => { if (o.isMesh && o.material === doc.userData.materials.dark) o.material = coat; });
  const holo = xrayBody({ tint: '#57d8ff' }); holo.scale.setScalar(0.42); holo.position.set(0.8, 1.2, 0); scene.add(holo);
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1, 0.12, 48), new THREE.MeshPhysicalMaterial({ color: '#1a2630', metalness: 0.6, roughness: 0.3 })); pad.position.set(0.8, 0.5, 0); scene.add(pad);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 2.4, 48, 1, true), new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  beam.position.set(0.8, 1.75, 0); scene.add(beam);
  const panel = holoPanel(2.6, 1.5, (ctx, t, w, h) => {
    txt(ctx, 'AI FINDINGS', 24, 40, 40, '#d8f6ff');
    txt(ctx, P(p, 'finding', 'Elevated risk detected'), 24, 110, 34, AMBER, 'left', 800);
    txt(ctx, P(p, 'action', 'Recommend: early check-up'), 24, 170, 34, GREEN, 'left', 800);
  }, { res: 768 });
  panel.position.set(2.6, 2.4, -0.4); panel.rotation.y = -0.5; scene.add(panel);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const hl = holo.userData.parts[P(p, 'highlight', 'heart')];
  const update = (t) => {
    holo.rotation.y = t * 1.2;
    if (hl) { hl.material.emissive.set(AMBER); hl.material.emissiveIntensity = 0.8 + 0.6 * Math.sin(t * 14); }
    panel.userData.update(t);
    const J = doc.userData.joints; J.shoulderL.rotation.x = -0.6 - 0.1 * Math.sin(t * 3); J.elbowL.rotation.x = -0.6; J.neck.rotation.y = -0.15;
    orbit(camera, p, t, { dist0: 9.5, dist1: 8, el0: 0.14, el1: 0.1, az0: -0.9, az1: -0.6, ty0: 1.7, ty1: 1.8, tx0: 0.3, tx1: 0.5 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.85 });
}

run({ body_scan, crowd_records, hospital_data, net, risk_dashboard, kidney, eye_scan, medical_image, cells_tumor, heart_ecg, smartwatch, neurons, dna_scan, chart_panel, doctor_ai });
