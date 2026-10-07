// Scenes for "How Brain-Computer Interfaces Can Read Your Thoughts" (16:9 long-form).
import {
  THREE, RoundedBoxGeometry, n3, ease, lerp, flesh, displace, baseScene, cam, seg, P, rnd, orbit, finish,
  motes, holoPanel, txt, lineChart, brainMesh, neuron, xrayBody, humanoid, standPose, neuralNet, dataStream, techFloor, keyLights,
} from './lib_sci.js';
import { run } from './lib3d.js';

const CYAN = '#57d8ff', RED = '#ff4b5c', GREEN = '#4dff9a', AMBER = '#ffb347', VIOLET = '#b08aff';

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

// Brain with sparks flashing over its surface
function brain_hero(p) {
  const scene = baseScene('#03030a', 0.02); const camera = cam(34);
  const b = brainMesh(); scene.add(b);
  const N = 500, pos = new Float32Array(N * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sparks = new THREE.Points(g, new THREE.PointsMaterial({ color: '#bfefff', size: 5, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(sparks);
  const pts = []; for (let i = 0; i < N; i++) { const u = rnd(i) * 2 - 1, a = rnd(i + 0.5) * 6.28, s = Math.sqrt(1 - u * u); pts.push(new THREE.Vector3(Math.cos(a) * s * 2.75, u * 2.35, Math.sin(a) * s * 3.5)); }
  keyLights(scene, { key: '#ffe6ee', keyI: 0.8, hemi: 0.25 });
  const rim = new THREE.PointLight(CYAN, 15, 12, 1.5); rim.position.set(-4, 3, -4); scene.add(rim);
  const update = (t) => {
    b.rotation.y = t * 0.6 + P(p, 'rot', 0); sparks.rotation.y = b.rotation.y;
    for (let i = 0; i < N; i++) { const on = rnd(i * 5 + Math.floor(t * 40)) > 0.75; pos.set(on ? [pts[i].x, pts[i].y, pts[i].z] : [0, -999, 0], i * 3); }
    g.attributes.position.needsUpdate = true;
    orbit(camera, p, t, { dist0: 13, dist1: 10, el0: 0.15, el1: 0.08, az0: -0.3, az1: 0.2 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.78 });
}

function neurons(p) {
  const scene = baseScene('#04020c', 0.04); const camera = cam(40);
  const ns = [];
  for (let i = 0; i < 9; i++) { const n = neuron({ seed: i, color: '#7fd4ff', len: 5 + rnd(i) * 2 }); n.position.set((i % 3 - 1) * 4.5 + (rnd(i + 3) - 0.5), Math.floor(i / 3) * 3 - 1, (rnd(i + 5) - 0.5) * 4); n.rotation.z = (rnd(i + 7) - 0.5) * 0.6; scene.add(n); ns.push(n); }
  keyLights(scene, { key: '#d0e8ff', keyI: 0.8, hemi: 0.3 });
  const update = (t) => { ns.forEach((n, i) => n.userData.pulse((t * P(p, 'rate', 2.2) + rnd(i)) % 1)); orbit(camera, p, t, { dist0: 16, dist1: 12, el0: 0.1, el1: 0.05, az0: -0.3, az1: 0.2, ty0: 0, ty1: -0.5 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.72 });
}

// Spike raster + voltage trace
function spike_chart(p) {
  const scene = baseScene('#02060c'); const camera = cam(36);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    txt(ctx, 'NEURON SPIKES', 60, 64, 48, '#d8f6ff');
    lineChart(ctx, 60, 110, w - 120, 220, (u) => { const ph = (u * 12 + t * 4) % 1; return 0.35 + (ph > 0.5 && ph < 0.53 ? 0.6 : 0) - (ph > 0.53 && ph < 0.58 ? 0.15 : 0) + 0.02 * Math.sin(u * 300); }, 1, GREEN, 4);
    txt(ctx, 'RASTER — 40 NEURONS', 60, 380, 36, '#7fb8d0', 'left', 700);
    for (let r = 0; r < 40; r++) for (let k = 0; k < 30; k++) {
      const x = ((rnd(r * 31 + k) + t * 0.5) % 1) * (w - 120) + 60, intent = P(p, 'intent', 0) && r < 20 && Math.abs(x / w - 0.5) < 0.15;
      if (rnd(r * 7 + k * 3) < (intent ? 0.95 : 0.35)) { ctx.fillStyle = intent ? AMBER : CYAN; ctx.fillRect(x, 420 + r * 11, 3, 8); }
    }
  }, { res: 1600 });
  scene.add(panel);
  const update = (t) => { panel.userData.update(t); orbit(camera, p, t, { dist0: 10.5, dist1: 9.2, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.45 });
}

// Head with an EEG cap and live traces
function headMesh(skinColor = '#b98a6a') {
  const g = new THREE.Group();
  const skin = new THREE.MeshPhysicalMaterial({ color: skinColor, roughness: 0.6, sheen: 0.3, envMapIntensity: 0.15 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 48), skin); head.scale.set(0.95, 1.15, 1.05); g.add(head);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 16), skin); nose.rotation.x = Math.PI / 2; nose.position.set(0, -0.05, 1.25); g.add(nose);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.2, 32), skin); neck.position.y = -1.5; g.add(neck);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), skin); ear.scale.set(0.4, 1, 0.7); ear.position.set(s * 1.13, 0, 0); g.add(ear); const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: '#222' })); eye.position.set(s * 0.38, 0.22, 1.08); g.add(eye); }
  return g;
}
function eeg_cap(p) {
  const scene = baseScene('#04070c', 0.02); const camera = cam(34);
  const h = headMesh(); scene.add(h);
  const capM = new THREE.MeshPhysicalMaterial({ color: '#2a3a4a', roughness: 0.6, transparent: true, opacity: 0.6 });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1.23, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.1), capM); cap.scale.set(0.95, 1.15, 1.05); h.add(cap);
  const elM = new THREE.MeshPhysicalMaterial({ color: '#c8d0d8', metalness: 0.8, roughness: 0.3, emissive: CYAN, emissiveIntensity: 0.3 });
  for (let i = 0; i < 28; i++) { const u = 0.15 + rnd(i) * 0.8, a = rnd(i + 0.5) * 6.28, s = Math.sqrt(1 - u * u); const e = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 16), elM); e.position.set(Math.cos(a) * s * 1.18, u * 1.42, Math.sin(a) * s * 1.29); e.lookAt(0, 0, 0); e.rotateX(Math.PI / 2); h.add(e); }
  const panel = holoPanel(5.5, 3.4, (ctx, t, w, h2) => {
    txt(ctx, 'EEG', 30, 44, 40, '#d8f6ff');
    for (let r = 0; r < 6; r++) lineChart(ctx, 30, 80 + r * 80, w - 60, 70, (u) => 0.5 + 0.3 * Math.sin(u * 40 + t * 9 + r) * Math.sin(u * 7 + r) + 0.1 * n3(u * 60, r, t), 1, r % 2 ? CYAN : VIOLET, 2);
  }, { res: 1100 });
  panel.position.set(3.8, 0.4, -0.5); panel.rotation.y = -0.4; scene.add(panel);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => { h.rotation.y = -0.5 + t * 0.4; panel.userData.update(t); orbit(camera, p, t, { dist0: 9, dist1: 7.5, el0: 0.12, el1: 0.08, az0: -0.2, az1: 0.15, tx0: 1.5, tx1: 1.5 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.7 });
}

// Macro: a 10×10 needle array on the cortex surface
function utah_array(p) {
  const scene = baseScene('#0b0306', 0.04); const camera = cam(38);
  const cg = new THREE.PlaneGeometry(30, 30, 200, 200); cg.rotateX(-Math.PI / 2);
  displace(cg, (v) => -0.6 * Math.exp(-Math.abs(n3(v.x * 0.3, 0, v.z * 0.3)) * 8) + 0.15 * n3(v.x, 0, v.z));
  scene.add(new THREE.Mesh(cg, flesh('#d98c94', 6, { clearcoat: 0.8 })));
  const arr = new THREE.Group(); scene.add(arr);
  const base = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 4), new THREE.MeshPhysicalMaterial({ color: '#3a4250', metalness: 0.7, roughness: 0.3 })); base.position.y = 1.6; arr.add(base);
  const needleM = new THREE.MeshPhysicalMaterial({ color: '#d8dee6', metalness: 0.9, roughness: 0.2 }), tipM = new THREE.MeshBasicMaterial({ color: AMBER });
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) { const n = new THREE.Mesh(new THREE.ConeGeometry(0.06, 1.8, 8), needleM); n.rotation.x = Math.PI; n.position.set((i - 4.5) * 0.4, 0.55, (j - 4.5) * 0.4); arr.add(n); const tp = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), tipM); tp.position.set(n.position.x, -0.33, n.position.z); arr.add(tp); }
  const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(2, 1.6, 0), new THREE.Vector3(5, 3, 1), new THREE.Vector3(9, 4, -2)]), 40, 0.12, 8), new THREE.MeshPhysicalMaterial({ color: '#c8a050', metalness: 0.8, roughness: 0.3 })); arr.add(wire);
  keyLights(scene, { key: '#ffe6ee', keyI: 1.2, hemi: 0.35 });
  const update = (t) => { arr.position.y = lerp(P(p, 'y0', 0), P(p, 'y1', 0), ease(t)); orbit(camera, p, t, { dist0: 9, dist1: 7, el0: 0.45, el1: 0.35, az0: -0.4, az1: 0.2, ty0: 0.6, ty1: 0.6 }); };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.8 });
}

// Seated person controlling a cursor on a screen with their thoughts
function seated(rig) { standPose(rig); const J = rig.userData.joints; J.hipL.rotation.x = J.hipR.rotation.x = -1.5; J.kneeL.rotation.x = J.kneeR.rotation.x = 1.5; J.pelvis.position.y = 1.35; J.shoulderL.rotation.x = J.shoulderR.rotation.x = -0.3; J.elbowL.rotation.x = J.elbowR.rotation.x = -0.9; }
function cursor_control(p) {
  const scene = baseScene('#04070c', 0.03); const camera = cam(38);
  techFloor(scene, { y: 0 });
  const person = humanoid({ style: 'person', color: '#8a5a3c' }); seated(person); person.position.set(0, 0, 2); person.rotation.y = Math.PI; scene.add(person);
  const chair = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.25, 1.1, 3, 0.08), new THREE.MeshPhysicalMaterial({ color: '#2a2e35', roughness: 0.5 })); chair.position.set(0, 1.2, 2.05); scene.add(chair);
  const back = new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.4, 0.15, 3, 0.06), chair.material); back.position.set(0, 1.95, 2.55); scene.add(back);
  for (const s of [-1, 1]) { const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.05, 12, 48), new THREE.MeshPhysicalMaterial({ color: '#8a929c', metalness: 0.8 })); wheel.rotation.y = Math.PI / 2; wheel.position.set(s * 0.65, 0.6, 2.2); scene.add(wheel); }
  const targets = [[0.2, 0.7], [0.75, 0.3], [0.5, 0.8], [0.15, 0.25], [0.8, 0.75]];
  const mode = P(p, 'mode', 'cursor');
  const screen = holoPanel(5.5, 3.1, (ctx, t, w, h) => {
    if (mode === 'chess') {
      const s = Math.min(w, h) * 0.8, x0 = (w - s) / 2, y0 = (h - s) / 2;
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { ctx.fillStyle = (i + j) % 2 ? 'rgba(87,216,255,0.35)' : 'rgba(255,255,255,0.12)'; ctx.fillRect(x0 + i * s / 8, y0 + j * s / 8, s / 8, s / 8); }
    } else { const k = Math.floor(t * 5) % targets.length; const [tx, ty] = targets[k]; ctx.strokeStyle = AMBER; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(tx * w, ty * h, 40, 0, Math.PI * 2); ctx.stroke(); }
    const seg_ = (t * 5) % 1, k = Math.floor(t * 5) % targets.length, prev = targets[(k + targets.length - 1) % targets.length], cur = targets[k];
    const cx = lerp(prev[0], cur[0], ease(Math.min(1, seg_ * 1.6))) * w, cy = lerp(prev[1], cur[1], ease(Math.min(1, seg_ * 1.6))) * h;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 26, cy + 30); ctx.lineTo(cx + 8, cy + 30); ctx.lineTo(cx, cy + 46); ctx.closePath(); ctx.fill();
  }, { res: 1280 });
  screen.position.set(0, 2.6, -1.2); scene.add(screen);
  const head = person.userData.joints.neck;
  const beam = dataStream(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 3.6, 1.9), new THREE.Vector3(0, 4.2, 0.6), new THREE.Vector3(0, 3.4, -1.1)]), 160, CYAN, 3); scene.add(beam);
  keyLights(scene, { keyI: 0.9, hemi: 0.35 });
  const update = (t) => { screen.userData.update(t); beam.userData.update(t, 0.6); head.rotation.x = 0.1; orbit(camera, p, t, { dist0: 9, dist1: 7.5, el0: 0.25, el1: 0.2, az0: 2.6, az1: 2.3, ty0: 2.4, ty1: 2.4, tz0: 0.5, tz1: 0.5 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.75 });
}

// Robotic arm bringing a cup to a seated person
function robot_arm(p) {
  const scene = baseScene('#04070c', 0.03); const camera = cam(38);
  techFloor(scene, { y: 0 });
  const person = humanoid({ style: 'person', color: '#c8946c' }); seated(person); person.position.set(-1.6, 0, 0); person.rotation.y = Math.PI / 2; scene.add(person);
  const armM = new THREE.MeshPhysicalMaterial({ color: '#c8d0d8', metalness: 0.6, roughness: 0.3, envMapIntensity: 0.25 }), jointM = new THREE.MeshPhysicalMaterial({ color: '#2a2e35', metalness: 0.5 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.2, 32), jointM); base.position.set(1.2, 0.6, 0); scene.add(base);
  const sh = new THREE.Group(); sh.position.set(1.2, 1.3, 0); scene.add(sh);
  const up = new THREE.Mesh(new RoundedBoxGeometry(0.3, 1.6, 0.3, 2, 0.08), armM); up.position.y = 0.8; sh.add(up);
  const el = new THREE.Group(); el.position.y = 1.6; sh.add(el); el.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), jointM));
  const fore = new THREE.Mesh(new RoundedBoxGeometry(0.25, 1.4, 0.25, 2, 0.07), armM); fore.position.y = 0.7; el.add(fore);
  const wr = new THREE.Group(); wr.position.y = 1.4; el.add(wr);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.42, 24), new THREE.MeshPhysicalMaterial({ color: '#f4f0e8', roughness: 0.3, clearcoat: 1 })); cup.position.y = 0.25; wr.add(cup);
  for (const s of [-1, 1]) { const f = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.35, 0.12, 1, 0.02), jointM); f.position.set(s * 0.24, 0.2, 0); wr.add(f); }
  const beam = dataStream(new THREE.CatmullRomCurve3([new THREE.Vector3(-1.6, 3.5, 0), new THREE.Vector3(-0.2, 4.2, 0), new THREE.Vector3(1.2, 1.4, 0)]), 140, CYAN, 3); scene.add(beam);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => {
    const k = ease(seg(t, 0.1, 0.8));
    sh.rotation.z = lerp(-0.3, 0.9, k); el.rotation.z = lerp(-1.2, 0.9, k); wr.rotation.z = -sh.rotation.z - el.rotation.z;
    beam.userData.update(t, 0.6);
    orbit(camera, p, t, { dist0: 9, dist1: 7.5, el0: 0.15, el1: 0.1, az0: 0.3, az1: 0.0, ty0: 2.2, ty1: 2.4 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.78 });
}

function net(p) {
  const scene = baseScene('#02060c', 0.02); const camera = cam(38);
  const nn = neuralNet({ layers: [8, 10, 10, 6], w: 9, h: 5 }); scene.add(nn);
  const inflow = dataStream(new THREE.CatmullRomCurve3([new THREE.Vector3(-14, 2, 2), new THREE.Vector3(-9, -1, 1), new THREE.Vector3(-5, 0, 0)]), 400, VIOLET, 3); scene.add(inflow);
  const out = holoPanel(3, 1.6, (ctx, t, w, h) => { txt(ctx, 'DECODED', w / 2, 60, 46, '#d8f6ff', 'center'); txt(ctx, P(p, 'out', '→ MOVE LEFT'), w / 2, h / 2 + 40, 90, GREEN, 'center', 900); }, { res: 768 });
  out.position.set(7.5, 0, 0); out.rotation.y = -0.35; scene.add(out);
  const update = (t) => { nn.userData.update(t, 1.6); inflow.userData.update(t, 0.35); out.userData.update(t); orbit(camera, p, t, { dist0: 18, dist1: 14, el0: 0.12, el1: 0.06, az0: -0.25, az1: 0.2, tx0: 1, tx1: 1.5 }); };
  return finish(scene, camera, update, { strength: 0.9, threshold: 0.35 });
}

// Imagined handwriting decoded into text
function handwriting(p) {
  const scene = baseScene('#02060c'); const camera = cam(36);
  const msg = P(p, 'text', 'hello, i can write again');
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    txt(ctx, 'IMAGINED HANDWRITING → TEXT', 60, 70, 46, '#d8f6ff');
    const n = Math.floor(seg(t, 0.05, 0.9) * msg.length);
    ctx.strokeStyle = VIOLET; ctx.lineWidth = 6; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const u = i / 60, x = 200 + u * 300 + Math.sin(u * 20 + t * 30) * 40, y = 300 + Math.cos(u * 14 + t * 25) * 60; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    txt(ctx, msg.slice(0, n) + (Math.sin(t * 30) > 0 ? '|' : ''), 100, 560, 80, '#ffffff', 'left', 800);
    txt(ctx, `${Math.round(lerp(0, 90, seg(t, 0.1, 0.6)))} characters / min`, w - 80, h - 60, 46, AMBER, 'right', 900);
  }, { res: 1600 });
  scene.add(panel);
  const update = (t) => { panel.userData.update(t); orbit(camera, p, t, { dist0: 10.5, dist1: 9.2, el0: 0.04, el1: 0.02, az0: 0.15, az1: -0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Speech decoder with avatar face and words-per-minute
function speech_avatar(p) {
  const scene = baseScene('#02060c'); const camera = cam(36);
  const words = P(p, 'words', 'it feels amazing to talk with my family again').split(' ');
  const wpm = P(p, 'wpm', 62);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    const cx = 330, cy = h / 2 - 20;
    if (p.avatar) {
      ctx.fillStyle = 'rgba(255,214,186,0.9)'; ctx.beginPath(); ctx.ellipse(cx, cy, 170, 210, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(cx, cy - 150, 180, 90, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(cx - 60, cy - 30, 14, 0, Math.PI * 2); ctx.arc(cx + 60, cy - 30, 14, 0, Math.PI * 2); ctx.fill();
      const open = Math.abs(Math.sin(t * 40)) * 30 + 6; ctx.fillStyle = '#7a2a2a'; ctx.beginPath(); ctx.ellipse(cx, cy + 90, 50, open, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = GREEN; ctx.lineWidth = 5; ctx.beginPath();
      for (let i = 0; i <= 100; i++) { const x = 80 + i * 5, y = cy + Math.sin(i * 0.5 + t * 40) * 80 * Math.abs(Math.sin(i * 0.08 + t * 6)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    }
    const n = Math.floor(seg(t, 0.05, 0.9) * words.length);
    let line = '', y = 200; ctx.font = '800 64px sans-serif';
    words.slice(0, n).forEach((wd) => { if (ctx.measureText(line + wd).width > w - 760) { txt(ctx, line, 680, y, 64, '#ffffff', 'left', 800); line = ''; y += 84; } line += wd + ' '; });
    txt(ctx, line, 680, y, 64, '#ffffff', 'left', 800);
    txt(ctx, `${Math.round(lerp(0, wpm, seg(t, 0.1, 0.6)))} WORDS / MIN`, w - 80, h - 60, 50, AMBER, 'right', 900);
  }, { res: 1600 });
  scene.add(panel);
  const update = (t) => { panel.userData.update(t); orbit(camera, p, t, { dist0: 10.5, dist1: 9.2, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Coin-sized implant with ultra-thin threads into the cortex; robot needle
function neuralink_threads(p) {
  const scene = baseScene('#0b0306', 0.04); const camera = cam(38);
  const cg = new THREE.PlaneGeometry(30, 30, 200, 200); cg.rotateX(-Math.PI / 2);
  displace(cg, (v) => -0.6 * Math.exp(-Math.abs(n3(v.x * 0.3, 0, v.z * 0.3)) * 8) + 0.15 * n3(v.x, 0, v.z));
  scene.add(new THREE.Mesh(cg, flesh('#d98c94', 6, { clearcoat: 0.8 })));
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 64), new THREE.MeshPhysicalMaterial({ color: '#c8d0d8', metalness: 0.9, roughness: 0.2, envMapIntensity: 0.4 })); coin.position.set(0, 2.2, 0); scene.add(coin);
  const threads = [];
  for (let i = 0; i < 64; i++) {
    const a = rnd(i) * 6.28, r = 1.5 + rnd(i + 0.5) * 3.5, end = new THREE.Vector3(Math.cos(a) * r, -0.6, Math.sin(a) * r);
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(Math.cos(a) * 0.9, 2.0, Math.sin(a) * 0.9), new THREE.Vector3(Math.cos(a) * (r * 0.6), 1.2, Math.sin(a) * (r * 0.6)), end.clone().add(new THREE.Vector3(0, 0.5, 0)), end]);
    const m = new THREE.Mesh(new THREE.TubeGeometry(c, 40, 0.015, 4), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); scene.add(m); threads.push(m);
  }
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4, 8), new THREE.MeshPhysicalMaterial({ color: '#e8eef4', metalness: 1, roughness: 0.15 })); scene.add(needle);
  keyLights(scene, { key: '#ffe6ee', keyI: 1.1, hemi: 0.35 });
  const update = (t) => {
    const n = Math.floor(seg(t, 0.05, 0.9) * threads.length); threads.forEach((m, i) => { m.visible = i < n; });
    const cur = Math.min(n, 63), a = rnd(cur) * 6.28, r = 1.5 + rnd(cur + 0.5) * 3.5; needle.position.set(Math.cos(a) * r, 1.4 + Math.abs(Math.sin(t * 60)) * 0.6, Math.sin(a) * r);
    orbit(camera, p, t, { dist0: 11, dist1: 8.5, el0: 0.5, el1: 0.4, az0: -0.3, az1: 0.3, ty0: 0.8, ty1: 0.8 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.8 });
}

// Stent electrode expanding inside a blood vessel beside the brain
function stentrode(p) {
  const scene = baseScene('#0b0306', 0.04); const camera = cam(40);
  const vessel = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 30, 64, 1, true), new THREE.MeshPhysicalMaterial({ color: '#b0303a', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false, roughness: 0.3 }));
  vessel.rotation.z = Math.PI / 2; scene.add(vessel);
  const stent = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 4, 24, 12, true), new THREE.MeshBasicMaterial({ color: '#e8eef4', wireframe: true }));
  stent.rotation.z = Math.PI / 2; scene.add(stent);
  const el = []; for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), new THREE.MeshBasicMaterial({ color: AMBER })); scene.add(m); el.push({ m, a: i / 16 * 6.28 * 3, x: (i / 16 - 0.5) * 3.6 }); }
  const brain = brainMesh(); brain.scale.multiplyScalar(1.2); brain.position.set(0, -4.6, -1); scene.add(brain);
  const flow = dataStream(new THREE.CatmullRomCurve3([new THREE.Vector3(-14, 0, 0), new THREE.Vector3(14, 0, 0)]), 200, '#ff6a6a', 4); scene.add(flow);
  keyLights(scene, { key: '#ffe6ee', keyI: 1.1, hemi: 0.35 });
  const update = (t) => {
    const k = ease(seg(t, 0.15, 0.6)), r = lerp(0.25, 1.1, k);
    stent.scale.set(r, 1, r); stent.position.x = lerp(-8, 0, ease(seg(t, 0, 0.3)));
    el.forEach((q) => { q.m.position.set(stent.position.x + q.x, Math.cos(q.a) * r * 1.0, Math.sin(q.a) * r * 1.0); });
    flow.userData.update(t, 0.4);
    orbit(camera, p, t, { dist0: 11, dist1: 9, el0: 0.15, el1: 0.1, az0: 0.4, az1: 0.2, ty0: -1, ty1: -1 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.7 });
}

// Brain implant → spinal implant bridge; signals flow down the spine
function spine_bridge(p) {
  const scene = baseScene('#030a12', 0.03); const camera = cam(32);
  const body = xrayBody({ tint: '#57b8ff', organs: false }); scene.add(body);
  const imp1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 32), new THREE.MeshBasicMaterial({ color: AMBER })); imp1.position.set(0, 4.1, 0); imp1.rotation.x = 0.3; scene.add(imp1);
  const imp2 = new THREE.Mesh(new RoundedBoxGeometry(0.25, 0.5, 0.08, 2, 0.03), new THREE.MeshBasicMaterial({ color: AMBER })); imp2.position.set(0, 0.6, -0.3); scene.add(imp2);
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 4.1, 0), new THREE.Vector3(0.6, 3.2, -0.3), new THREE.Vector3(0.2, 1.6, -0.3), new THREE.Vector3(0, 0.6, -0.3), new THREE.Vector3(-0.42, -1.5, 0), new THREE.Vector3(-0.42, -2.4, 0)]);
  const s = dataStream(path, 300, GREEN, 3); scene.add(s);
  const update = (t) => { s.userData.update(t, 0.5); body.rotation.y = -0.3 + t * 0.4; orbit(camera, p, t, { dist0: 13, dist1: 10, el0: 0.06, el1: 0.03, az0: -0.2, az1: 0.2, ty0: 1.2, ty1: 1.3 }); };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.6 });
}

// MRI scanner with a person; decoded "gist" text
function fmri(p) {
  const scene = baseScene('#04070c', 0.025); const camera = cam(38);
  techFloor(scene, { y: 0 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.9, 32, 96), new THREE.MeshPhysicalMaterial({ color: '#a8b0b8', roughness: 0.45, envMapIntensity: 0.15 })); ring.position.set(0, 2.4, 0); scene.add(ring);
  const housing = new THREE.Mesh(new RoundedBoxGeometry(6, 5.2, 2.4, 4, 0.4), new THREE.MeshPhysicalMaterial({ color: '#d8dee6', roughness: 0.4, envMapIntensity: 0.2 }));
  housing.position.set(0, 2.6, 0); scene.add(housing);
  const hole = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.6, 48, 1, true), new THREE.MeshPhysicalMaterial({ color: '#2a3038', side: THREE.DoubleSide })); hole.rotation.x = Math.PI / 2; hole.position.set(0, 2.4, 0); scene.add(hole);
  housing.material.transparent = true; housing.material.opacity = 0.0001; // ring alone reads as the scanner
  const bed = new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.3, 6, 3, 0.1), new THREE.MeshPhysicalMaterial({ color: '#8a929c' })); bed.position.set(0, 1.4, 2.5); scene.add(bed);
  const person = humanoid({ style: 'person', color: '#8a5a3c' }); standPose(person); person.rotation.x = -Math.PI / 2; person.position.set(0, 1.8, 0.8); scene.add(person);
  const panel = holoPanel(5, 2.4, (ctx, t, w, h) => {
    txt(ctx, P(p, 'title', 'DECODED MEANING'), 30, 44, 40, '#d8f6ff');
    const s = P(p, 'text', '"she hasn\'t started learning to drive yet"'), n = Math.floor(seg(t, 0.2, 0.9) * s.length);
    txt(ctx, s.slice(0, n), 30, h / 2 + 20, 44, AMBER, 'left', 800);
  }, { res: 1100 });
  panel.position.set(3.6, 4.6, -1); panel.rotation.y = -0.4; scene.add(panel);
  keyLights(scene, { keyI: 0.9, hemi: 0.35 });
  const update = (t) => { panel.userData.update(t); orbit(camera, p, t, { dist0: 12, dist1: 10, el0: 0.25, el1: 0.18, az0: 0.7, az1: 0.45, ty0: 2.6, ty1: 2.8, tx0: 0.8, tx1: 0.8 }); };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.9 });
}

// Brain data behind a lock
function privacy(p) {
  const scene = baseScene('#03050c', 0.02); const camera = cam(36);
  const b = brainMesh('#b07ab8'); b.scale.multiplyScalar(0.8); scene.add(b);
  const shield = new THREE.Mesh(new THREE.SphereGeometry(3.6, 32, 24), new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true, transparent: true, opacity: 0.2 })); scene.add(shield);
  const lock = holoPanel(2.4, 2.4, (ctx, t, w, h) => {
    const cx = w / 2, cy = h / 2 + 30; ctx.strokeStyle = CYAN; ctx.lineWidth = 30; ctx.beginPath(); ctx.arc(cx, cy - 80, 110, Math.PI, 0); ctx.stroke(); ctx.fillStyle = CYAN; ctx.fillRect(cx - 170, cy - 80, 340, 260);
  }, { res: 640, frame: false });
  lock.position.set(0, 0, 4.2); scene.add(lock);
  const streams = [0, 1, 2].map((i) => { const s = dataStream(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(4 + i, 2 - i * 2, -2), new THREE.Vector3(10, 3 - i * 3, -6)]), 120, i === 1 ? RED : AMBER, 3); scene.add(s); return s; });
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => { b.rotation.y = t * 0.5; shield.rotation.y = -t * 0.3; lock.userData.update(t); streams.forEach((s) => s.userData.update(t, 0.4)); orbit(camera, p, t, { dist0: 13, dist1: 11, el0: 0.1, el1: 0.05, az0: -0.2, az1: 0.2 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

run({ title_card, brain_hero, neurons, spike_chart, eeg_cap, utah_array, cursor_control, robot_arm, net, handwriting, speech_avatar, neuralink_threads, stentrode, spine_bridge, fmri, privacy });
