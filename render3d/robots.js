// Scenes for "How Humanoid Robots Learn to Walk" (16:9 long-form).
import {
  THREE, RoundedBoxGeometry, n3, ease, lerp, displace, baseScene, cam, seg, P, rnd, orbit, finish,
  motes, holoPanel, txt, lineChart, humanoid, walkPose, standPose, neuralNet, dataStream, techFloor, keyLights,
} from './lib_sci.js';
import { run } from './lib3d.js';

const CYAN = '#57d8ff', RED = '#ff4b5c', GREEN = '#4dff9a', AMBER = '#ffb347';

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

// Pose helper: a fall that pivots at the feet; arms flail
function fallPose(rig, k, dir = 1) {
  const J = rig.userData.joints;
  rig.rotation.x = dir * k * Math.PI / 2 * 0.95;
  J.shoulderL.rotation.x = -k * 2.2; J.shoulderR.rotation.x = -k * 1.6; J.shoulderL.rotation.z = k * 0.8; J.shoulderR.rotation.z = -k * 0.9;
  J.kneeL.rotation.x = k * 0.6; J.hipL.rotation.x = -k * 0.4; J.spine.rotation.x = k * 0.3;
}

// A robot (or person) walking along a tech floor, camera tracking
function robot_walk(p) {
  const scene = baseScene('#04070d', 0.025); const camera = cam(36);
  techFloor(scene, { y: 0, matte: true });
  const r = humanoid({ style: P(p, 'style', 'robot'), color: P(p, 'color', undefined) }); scene.add(r);
  if (p.style === 'person') r.traverse((o) => { if (o.isMesh && o.material === r.userData.materials.dark) o.material = new THREE.MeshPhysicalMaterial({ color: '#3b4a6b', roughness: 0.7 }); });
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const speed = P(p, 'speed', 1), wob = P(p, 'wobble', 0), crouch = P(p, 'crouch', 0);
  const update = (t) => {
    const ph = t * 4 * speed; walkPose(r, ph, { stride: P(p, 'stride', 0.5), wobble: wob });
    if (crouch) { const J = r.userData.joints; J.kneeL.rotation.x += crouch; J.kneeR.rotation.x += crouch; J.hipL.rotation.x -= crouch * 0.5; J.hipR.rotation.x -= crouch * 0.5; J.pelvis.position.y -= crouch * 0.2; }
    r.position.z = t * 6 * speed - 3;
    orbit(camera, p, t, { dist0: 8, dist1: 7, el0: 0.12, el1: 0.1, az0: 1.2, az1: 0.8, ty0: 1.8, ty1: 1.8, tz0: -3, tz1: 6 * speed - 3 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.82 });
}

// Robot tipping over (optionally getting back up)
function fall(p) {
  const scene = baseScene('#06070d', 0.025); const camera = cam(36);
  techFloor(scene, { y: 0, color: '#3a2a1d', matte: true });
  const r = humanoid({ style: 'robot' }); scene.add(r);
  const debris = motes(scene, 120, 4, '#c8b090', 0.5);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => {
    standPose(r);
    const k = ease(seg(t, 0.15, 0.5)), up = P(p, 'recover', 0) ? ease(seg(t, 0.6, 0.95)) : 0;
    walkPose(r, t * 2, { stride: 0.25 * (1 - k), wobble: 1 });
    fallPose(r, k * (1 - up), 1);
    r.position.set(0, 0, k * (1 - up) * 0.3);
    debris.visible = k > 0.95 && up < 0.1; debris.userData.update(t); debris.position.set(0, 0.2, 1.8);
    orbit(camera, p, t, { dist0: 8, dist1: 7, el0: 0.2, el1: 0.15, az0: 1.4, az1: 1.1, ty0: 1.4, ty1: 0.9 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.82 });
}

// Inverted pendulum on a cart, correcting itself
function inverted_pendulum(p) {
  const scene = baseScene('#04070d', 0.02); const camera = cam(36);
  techFloor(scene, { y: 0, matte: true });
  const cart = new THREE.Mesh(new RoundedBoxGeometry(2, 0.6, 1.2, 3, 0.1), new THREE.MeshPhysicalMaterial({ color: '#3a4250', metalness: 0.6, roughness: 0.3 })); cart.position.y = 0.5; scene.add(cart);
  for (const s of [-1, 1]) for (const z of [-0.5, 0.5]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.15, 24), new THREE.MeshPhysicalMaterial({ color: '#111' })); w.rotation.x = Math.PI / 2; w.position.set(s * 0.7, 0.25, z); cart.add(w); w.position.y -= 0.5; }
  const pole = new THREE.Group(); scene.add(pole);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 4, 16), new THREE.MeshPhysicalMaterial({ color: '#c8d0d8', metalness: 0.8, roughness: 0.25 })); stick.position.y = 2; pole.add(stick);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 24), new THREE.MeshPhysicalMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.3, roughness: 0.3 })); ball.position.y = 4; pole.add(ball);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(4, 0.02, 6, 64, 0.8), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.6 })); arc.rotation.z = Math.PI / 2 - 0.4; arc.position.y = 0.8; scene.add(arc);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => {
    const ang = 0.25 * Math.sin(t * 9) * Math.exp(-((t * 3) % 1) * 1.5) * (p.unstable ? 1 + t * 3 : 1);
    const cx = -ang * 3; cart.position.x = cx; pole.position.set(cx, 0.8, 0); pole.rotation.z = ang * (p.unstable ? 1.6 : 1);
    if (p.unstable && t > 0.6) pole.rotation.z = ang + (t - 0.6) * 3;
    arc.position.x = cx;
    orbit(camera, p, t, { dist0: 10, dist1: 9, el0: 0.12, el1: 0.08, az0: 0.1, az1: -0.1, ty0: 2.2, ty1: 2.2 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.75 });
}

// Robot with sensors and joint count highlighted
function sensors(p) {
  const scene = baseScene('#04070d', 0.025); const camera = cam(34);
  techFloor(scene, { y: 0, matte: true });
  const r = humanoid({ style: 'robot' }); standPose(r); scene.add(r);
  const dot = (parent, x, y, z, c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); parent.add(m); return m; };
  const J = r.userData.joints, glow = [];
  Object.values(J).forEach((j) => glow.push(dot(j, 0, 0, 0.15, CYAN)));
  const imu = dot(J.spine, 0, 0.5, 0.25, AMBER); imu.scale.setScalar(1.6); glow.push(imu);
  [J.ankleL, J.ankleR].forEach((a) => { const m = dot(a, 0, -0.12, 0.08, GREEN); m.scale.set(1.8, 0.6, 2.4); glow.push(m); });
  const labels = [['JOINT MOTORS', CYAN, -2.4, 3.2], ['BALANCE SENSOR (IMU)', AMBER, 2.6, 2.6], ['FOOT FORCE SENSORS', GREEN, 2.4, 0.3]].map(([s, c, x, y]) => { const q = holoPanel(3.2, 0.6, (ctx, t, w, h) => txt(ctx, s, w / 2, h / 2, 52, c, 'center', 900), { res: 900, frame: false }); q.position.set(x, y, 0.5); scene.add(q); return q; });
  keyLights(scene, { keyI: 0.9, hemi: 0.3 });
  const update = (t) => { glow.forEach((g, i) => { g.visible = t > 0.05 + (i % 6) * 0.06; }); labels.forEach((q, i) => { q.userData.update(t); q.visible = t > 0.2 + i * 0.15; q.lookAt(camera.position); }); r.rotation.y = -0.3 + t * 0.4; orbit(camera, p, t, { dist0: 9, dist1: 7.5, el0: 0.1, el1: 0.08, az0: -0.2, az1: 0.15, ty0: 2, ty1: 2 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.8 });
}

// Zero moment point: support polygon on the floor with the balance point moving inside it
function zmp(p) {
  const scene = baseScene('#04070d', 0.025); const camera = cam(36);
  techFloor(scene, { y: 0, matte: true });
  const r = humanoid({ style: 'robot' }); scene.add(r);
  const poly = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.25, side: THREE.DoubleSide })); poly.rotation.x = -Math.PI / 2; poly.position.y = 0.02; scene.add(poly);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1)), new THREE.LineBasicMaterial({ color: GREEN })); edge.rotation.x = -Math.PI / 2; edge.position.y = 0.03; scene.add(edge);
  const pt = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), new THREE.MeshBasicMaterial({ color: AMBER })); scene.add(pt);
  const plumb = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2, 6), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.6 })); scene.add(plumb);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => {
    const walking = !!p.walk, ph = walking ? t * 2.5 : 0;
    walkPose(r, ph, { stride: walking ? 0.25 : 0 }); const J = r.userData.joints; J.kneeL.rotation.x += 0.35; J.kneeR.rotation.x += 0.35; J.hipL.rotation.x -= 0.2; J.hipR.rotation.x -= 0.2; J.pelvis.position.y = 1.85;
    r.position.z = walking ? t * 2 : 0;
    const a = ph * Math.PI * 2, single = walking && Math.abs(Math.sin(a)) > 0.3;
    const side = Math.sin(a) > 0 ? -1 : 1;
    poly.scale.set(single ? 0.3 : 0.75, single ? 0.5 : 0.55, 1); poly.position.set(single ? side * 0.2 : 0, 0.02, r.position.z + 0.05); edge.scale.copy(poly.scale); edge.position.copy(poly.position); edge.position.y = 0.03;
    pt.position.set(poly.position.x + 0.05 * Math.sin(t * 9), 0.06, poly.position.z + 0.05 * Math.cos(t * 7)); plumb.position.set(pt.position.x, 1.05, pt.position.z);
    orbit(camera, p, t, { dist0: 10, dist1: 9, el0: 0.4, el1: 0.32, az0: 0.9, az1: 0.6, ty0: 1.3, ty1: 1.3, tz0: 0, tz1: walking ? 2 : 0 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.8 });
}

// Parkour: running jump over boxes, optional backflip
function parkour(p) {
  const scene = baseScene('#06080d', 0.02); const camera = cam(38);
  techFloor(scene, { y: 0, matte: true });
  const boxM = new THREE.MeshPhysicalMaterial({ color: '#8a6a4a', roughness: 0.7 });
  [[0, 0.5, 2], [0, 0.9, 6.5], [0, 1.4, 11]].forEach(([x, h, z]) => { const b = new THREE.Mesh(new RoundedBoxGeometry(2.4, h, 1.6, 2, 0.06), boxM); b.position.set(x, h / 2, z); b.castShadow = b.receiveShadow = true; scene.add(b); });
  const r = humanoid({ style: 'robot', color: '#3a4250' }); scene.add(r);
  keyLights(scene, { keyI: 1.2, hemi: 0.35 });
  const update = (t) => {
    const flip = !!p.flip;
    if (flip) {
      standPose(r); const k = seg(t, 0.25, 0.7);
      r.position.set(0, Math.sin(k * Math.PI) * 2.2, 2); r.rotation.x = -k * Math.PI * 2;
      const J = r.userData.joints, tuck = Math.sin(k * Math.PI); J.hipL.rotation.x = J.hipR.rotation.x = -tuck * 1.6; J.kneeL.rotation.x = J.kneeR.rotation.x = tuck * 2; J.shoulderL.rotation.x = J.shoulderR.rotation.x = -tuck * 2.4;
    } else {
      const z = t * 13 - 1, hops = [[2, 1.2], [6.5, 1.6], [11, 2.1]];
      let y = 0; hops.forEach(([hz, hh]) => { const d = (z - hz + 1.6) / 3.2; if (d > 0 && d < 1) y = Math.max(y, Math.sin(d * Math.PI) * hh); });
      walkPose(r, t * 10, { stride: 0.8 }); r.position.set(0, y, z); r.rotation.x = 0;
    }
    orbit(camera, p, t, { dist0: 11, dist1: 10, el0: 0.15, el1: 0.12, az0: 1.4, az1: 1.1, ty0: 1.6, ty1: 2, tz0: flip ? 2 : 1, tz1: flip ? 2 : 10 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.82 });
}

// Grid of simulated robots; progress 0 = mostly falling, 1 = all walking
function sim_grid(p) {
  const scene = baseScene('#03050c', 0.02); const camera = cam(42);
  const grid = new THREE.GridHelper(80, 80, '#1d6f8f', '#123a4a'); scene.add(grid);
  const cols = P(p, 'cols', 7), rows = P(p, 'rows', 5), bots = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const r = humanoid({ style: 'robot', color: ['#aeb4bc', '#7fa0c0', '#c0a080'][(i + j) % 3] }); r.scale.setScalar(0.6);
    const x = (i - (cols - 1) / 2) * 2.4, z = (j - (rows - 1) / 2) * 3; r.userData.home = new THREE.Vector3(x, 0, z); r.userData.seed = i * 31 + j * 7; scene.add(r); bots.push(r);
  }
  const counter = holoPanel(6, 1, (ctx, t, w, h) => txt(ctx, P(p, 'label', `TRAINING STEP ${Math.floor(lerp(P(p, 'p0', 0), P(p, 'p1', 1), t) * 1e6).toLocaleString()}`), w / 2, h / 2, 80, CYAN, 'center', 900), { res: 1400 });
  counter.position.set(0, 5, -8); scene.add(counter);
  scene.add(new THREE.HemisphereLight('#bfe0ff', '#0a1018', 0.8));
  const sun = new THREE.DirectionalLight('#ffffff', 1.2); sun.position.set(5, 10, 6); scene.add(sun);
  const update = (t) => {
    const prog = lerp(P(p, 'p0', 0), P(p, 'p1', 1), t);
    bots.forEach((r) => {
      const s = r.userData.seed, skill = prog + (rnd(s) - 0.5) * 0.4;
      standPose(r); r.rotation.set(0, 0, 0);
      const cycleT = (t * 1.5 + rnd(s + 1)) % 1;
      if (skill < 0.55) { walkPose(r, t * 4 + rnd(s), { stride: 0.4, wobble: 1.5 }); const k = ease(seg(cycleT, 0.2, 0.6)); fallPose(r, k, rnd(s + 2) > 0.5 ? 1 : -1); r.position.copy(r.userData.home); r.position.z += cycleT * 0.8 * (1 - k); }
      else { walkPose(r, t * 6 + rnd(s), { stride: 0.5, wobble: Math.max(0, 0.8 - skill) }); r.position.copy(r.userData.home); r.position.z += ((t * 2 + rnd(s)) % 1) * 1.2; }
    });
    counter.userData.update(t); counter.lookAt(camera.position);
    orbit(camera, p, t, { dist0: 22, dist1: 17, el0: 0.45, el1: 0.35, az0: -0.3, az1: 0.25, ty0: 0.8, ty1: 0.8 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.7 });
}

// Reward terms + rising reward curve
function reward_panel(p) {
  const scene = baseScene('#02060c'); const camera = cam(36);
  const terms = [['+ moving forward', GREEN], ['+ staying upright', GREEN], ['+ saving energy', GREEN], ['− falling over', RED], ['− slipping', RED], ['− jerky motion', RED]];
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    txt(ctx, 'REWARD', 60, 70, 56, '#d8f6ff');
    terms.forEach(([s, c], i) => { if (t > 0.05 + i * 0.07) txt(ctx, s, 80, 160 + i * 70, 44, c, 'left', 800); });
    txt(ctx, 'TOTAL REWARD', w * 0.5, 160, 40, '#7fb8d0', 'left', 700);
    lineChart(ctx, w * 0.5, 200, w * 0.45, h - 320, (u) => 0.05 + 0.85 * (1 - Math.exp(-u * 4)) + 0.04 * n3(u * 30, 1, 1), seg(t, 0.2, 0.95), AMBER, 5);
    txt(ctx, 'training time →', w * 0.95, h - 70, 32, '#7fb8d0', 'right', 600);
  }, { res: 1600 });
  scene.add(panel);
  const update = (t) => { panel.userData.update(t); orbit(camera, p, t, { dist0: 10.5, dist1: 9.2, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Neural network policy: sensors in → motor commands out, beside a robot
function neural_policy(p) {
  const scene = baseScene('#02060c', 0.02); const camera = cam(38);
  const nn = neuralNet({ layers: [8, 12, 12, 10], w: 8, h: 5 }); nn.position.x = -2; scene.add(nn);
  const r = humanoid({ style: 'robot' }); r.position.set(5.5, -2.5, 0); r.scale.setScalar(1.1); scene.add(r);
  const inL = holoPanel(3, 0.6, (ctx, t, w, h) => txt(ctx, 'SENSORS IN', w / 2, h / 2, 60, AMBER, 'center', 900), { res: 800, frame: false }); inL.position.set(-6, 3.4, 0); scene.add(inL);
  const outL = holoPanel(3.4, 0.6, (ctx, t, w, h) => txt(ctx, 'MOTOR COMMANDS', w / 2, h / 2, 56, GREEN, 'center', 900), { res: 900, frame: false }); outL.position.set(2, 3.4, 0); scene.add(outL);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => { nn.userData.update(t, 2); inL.userData.update(t); outL.userData.update(t); walkPose(r, t * 4, { stride: 0.45 }); orbit(camera, p, t, { dist0: 17, dist1: 14, el0: 0.1, el1: 0.06, az0: -0.15, az1: 0.15, tx0: 0.5, tx1: 0.5 }); };
  return finish(scene, camera, update, { strength: 0.8, threshold: 0.45 });
}

// Domain randomisation: changing floor friction (colour), slopes and pushes
function randomize(p) {
  const scene = baseScene('#04070d', 0.025); const camera = cam(38);
  const floorM = new THREE.MeshPhysicalMaterial({ color: '#1d3a4a', roughness: 0.4 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60, 60, 60), floorM); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const grid = new THREE.GridHelper(60, 60, '#1d6f8f', '#123a4a'); grid.position.y = 0.01; scene.add(grid);
  const r = humanoid({ style: 'robot' }); scene.add(r);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 16), new THREE.MeshPhysicalMaterial({ color: RED, emissive: RED, emissiveIntensity: 0.4 })); scene.add(ball);
  const tag = holoPanel(4.6, 1.6, (ctx, t, w, h) => {
    const k = Math.floor(t * 6);
    txt(ctx, `FRICTION   ${(0.3 + rnd(k) * 0.9).toFixed(2)}`, 30, 50, 46, CYAN, 'left', 800);
    txt(ctx, `MASS       ${(42 + rnd(k + 9) * 12).toFixed(1)} kg`, 30, 115, 46, CYAN, 'left', 800);
    txt(ctx, `MOTOR      ${(85 + rnd(k + 17) * 25).toFixed(0)} %`, 30, 180, 46, CYAN, 'left', 800);
  }, { res: 1000 });
  tag.position.set(-2.6, 3.6, 0.5); scene.add(tag);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => {
    const k = Math.floor(t * 6); floorM.color.setHSL(0.5 + rnd(k) * 0.3, 0.4, 0.15 + rnd(k + 3) * 0.12);
    walkPose(r, t * 5, { stride: 0.45, wobble: 0.3 });
    const push = p.push ? Math.max(0, 1 - Math.abs((t * 3 % 1) - 0.5) * 6) : 0;
    r.rotation.z = push * 0.25; r.position.x = push * 0.3;
    ball.visible = !!p.push; const bt = (t * 3) % 1; ball.position.set(lerp(-6, 0.3, Math.min(1, bt * 2)), 2.4, 0);
    tag.userData.update(t); tag.lookAt(camera.position);
    orbit(camera, p, t, { dist0: 10, dist1: 9, el0: 0.15, el1: 0.12, az0: 0.3, az1: 0.0, ty0: 1.8, ty1: 1.8 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.8 });
}

// Outdoors: grass, slopes, trees
function real_world(p) {
  const scene = baseScene('#8fb8d8', 0.012); const camera = cam(40);
  scene.background = new THREE.Color('#9cc4e4');
  const g = new THREE.PlaneGeometry(120, 120, 160, 160); g.rotateX(-Math.PI / 2);
  displace(g, (v) => 0.5 * n3(v.x * 0.06, 0, v.z * 0.06) + 0.08 * n3(v.x * 0.5, 0, v.z * 0.5));
  const ground = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#4f8a3a', roughness: 0.95 })); scene.add(ground);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 60), new THREE.MeshStandardMaterial({ color: '#9a9488', roughness: 0.9 })); path.rotation.x = -Math.PI / 2; path.position.y = 0.05; scene.add(path);
  for (let i = 0; i < 40; i++) { const tr = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.6, 8), new THREE.MeshStandardMaterial({ color: '#5a3a24' })); trunk.position.y = 0.8; tr.add(trunk); const top = new THREE.Mesh(new THREE.ConeGeometry(1, 2.4, 12), new THREE.MeshStandardMaterial({ color: '#2f6a2a' })); top.position.y = 2.6; tr.add(top); const side = rnd(i) > 0.5 ? 1 : -1; tr.position.set(side * (4 + rnd(i + 1) * 20), 0, (rnd(i + 2) - 0.5) * 60); scene.add(tr); }
  const r = humanoid({ style: 'robot', color: '#3a4250' }); scene.add(r);
  const sun = new THREE.DirectionalLight('#fff4e0', 2.0); sun.position.set(10, 20, 8); sun.castShadow = true; scene.add(sun); scene.add(new THREE.HemisphereLight('#cfe8ff', '#3a5a2a', 0.7));
  const update = (t) => { walkPose(r, t * 5, { stride: 0.5 }); r.position.set(0, 0.05, t * 7 - 3); orbit(camera, p, t, { dist0: 9, dist1: 8, el0: 0.18, el1: 0.15, az0: 0.9, az1: 0.5, ty0: 1.8, ty1: 1.8, tz0: -3, tz1: 4 }); };
  return finish(scene, camera, update, { strength: 0.4, threshold: 0.9 });
}

// Motion capture actor with markers, robot copying beside
function mocap(p) {
  const scene = baseScene('#04070d', 0.025); const camera = cam(38);
  techFloor(scene, { y: 0, matte: true });
  const actor = humanoid({ style: 'person', color: '#2a2a2a' }); actor.traverse((o) => { if (o.isMesh) o.material = new THREE.MeshPhysicalMaterial({ color: '#202428', roughness: 0.8 }); }); actor.position.x = -1.6; scene.add(actor);
  const markers = []; Object.values(actor.userData.joints).forEach((j) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' })); m.position.z = 0.15; j.add(m); markers.push(m); });
  const bot = humanoid({ style: 'robot' }); bot.position.x = 1.6; scene.add(bot);
  const link = dataStream(new THREE.CatmullRomCurve3([new THREE.Vector3(-1.6, 3.5, 0), new THREE.Vector3(0, 4.2, 0), new THREE.Vector3(1.6, 3.5, 0)]), 120, CYAN, 3); scene.add(link);
  keyLights(scene, { keyI: 1.0, hemi: 0.35 });
  const update = (t) => {
    const dance = !!p.dance, ph = t * 4;
    for (const r of [actor, bot]) {
      if (dance) { standPose(r); const J = r.userData.joints, a = ph * Math.PI * 2; J.shoulderL.rotation.z = 1.2 + 0.6 * Math.sin(a); J.shoulderR.rotation.z = -1.2 - 0.6 * Math.sin(a + 1); J.hipL.rotation.x = 0.3 * Math.sin(a); J.hipR.rotation.x = -0.3 * Math.sin(a); J.spine.rotation.z = 0.15 * Math.sin(a * 0.5); J.pelvis.position.y = 2 - 0.1 * Math.abs(Math.sin(a)); }
      else walkPose(r, ph, { stride: 0.5 });
    }
    link.userData.update(t, 0.6);
    orbit(camera, p, t, { dist0: 10, dist1: 8.5, el0: 0.12, el1: 0.08, az0: -0.2, az1: 0.2, ty0: 1.8, ty1: 1.8 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.8 });
}

// Warehouse: robot carrying a tote between shelves
function warehouse(p) {
  const scene = baseScene('#0a0c10', 0.03); const camera = cam(40);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#5a5e64', roughness: 0.8 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const shelfM = new THREE.MeshStandardMaterial({ color: '#2a5a9a', roughness: 0.6 }), boxM = new THREE.MeshStandardMaterial({ color: '#c89a5a', roughness: 0.8 });
  for (const x of [-3, 3]) for (let z = 0; z < 6; z++) { const sh = new THREE.Group(); for (let lvl = 0; lvl < 4; lvl++) { const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 2.6), shelfM); board.position.y = 0.3 + lvl * 1.1; sh.add(board); if (rnd(x + z * 7 + lvl) > 0.3) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.9), boxM); b.position.set(0, 0.7 + lvl * 1.1, (rnd(z + lvl) - 0.5) * 1.2); sh.add(b); } } sh.position.set(x, 0, -z * 3); scene.add(sh); }
  const r = humanoid({ style: 'robot', color: '#e8c060' }); scene.add(r);
  const tote = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.45, 0.6, 2, 0.05), new THREE.MeshStandardMaterial({ color: '#2a6a3a', roughness: 0.5 })); scene.add(tote);
  const lamp = new THREE.HemisphereLight('#fff6e0', '#2a2e34', 0.9); scene.add(lamp);
  const key = new THREE.DirectionalLight('#ffffff', 1.0); key.position.set(4, 10, 4); scene.add(key);
  const update = (t) => {
    walkPose(r, t * 5, { stride: 0.4 }); const J = r.userData.joints; J.shoulderL.rotation.x = J.shoulderR.rotation.x = -1.2; J.elbowL.rotation.x = J.elbowR.rotation.x = -0.4;
    r.position.set(0, 0, -t * 9 + 2); r.rotation.y = Math.PI; tote.position.set(0, 2.1, r.position.z - 0.7);
    orbit(camera, p, t, { dist0: 9, dist1: 8, el0: 0.2, el1: 0.15, az0: 2.6, az1: 2.9, ty0: 1.8, ty1: 1.8, tz0: 2, tz1: -7 });
  };
  return finish(scene, camera, update, { strength: 0.4, threshold: 0.88 });
}

// Half-marathon road with a running robot and a finish banner
function marathon(p) {
  const scene = baseScene('#9cc4e4', 0.01); const camera = cam(40);
  scene.background = new THREE.Color('#a8cce8');
  const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 200), new THREE.MeshStandardMaterial({ color: '#3a3e44', roughness: 0.9 })); road.rotation.x = -Math.PI / 2; scene.add(road);
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#5a8a4a', roughness: 1 })); grass.rotation.x = -Math.PI / 2; grass.position.y = -0.02; scene.add(grass);
  for (let i = 0; i < 40; i++) { const line = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 1.5), new THREE.MeshBasicMaterial({ color: '#ffffff' })); line.rotation.x = -Math.PI / 2; line.position.set(0, 0.01, -i * 4); scene.add(line); }
  const banner = holoPanel(9, 1.4, (ctx, t, w, h) => { ctx.fillStyle = '#c0302a'; ctx.fillRect(0, 0, w, h); txt(ctx, 'FINISH', w / 2, h / 2, 140, '#ffffff', 'center', 900); }, { res: 1400, frame: false });
  banner.position.set(0, 5, -50); scene.add(banner);
  for (const s of [-1, 1]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 5.5, 12), new THREE.MeshStandardMaterial({ color: '#d8d8d8' })); post.position.set(s * 4.6, 2.75, -50); scene.add(post); }
  const r = humanoid({ style: 'robot', color: '#e8e8ec' }); scene.add(r);
  const runner = humanoid({ style: 'person', color: '#c8946c' }); scene.add(runner);
  const sun = new THREE.DirectionalLight('#fff4e0', 2.0); sun.position.set(10, 20, 8); scene.add(sun); scene.add(new THREE.HemisphereLight('#cfe8ff', '#3a5a2a', 0.7));
  const update = (t) => {
    banner.userData.update(t);
    walkPose(r, t * 9, { stride: 0.7 }); r.position.set(-1.5, 0, -t * 40); r.rotation.y = Math.PI;
    walkPose(runner, t * 9.3, { stride: 0.7 }); runner.position.set(1.8, 0, -t * 41 - 2); runner.rotation.y = Math.PI;
    camera.position.set(4, 3, r.position.z + 9); camera.lookAt(0, 1.8, r.position.z - 6);
  };
  return finish(scene, camera, update, { strength: 0.4, threshold: 0.9 });
}

run({ title_card, robot_walk, fall, inverted_pendulum, sensors, zmp, parkour, sim_grid, reward_panel, neural_policy, randomize, real_world, mocap, warehouse, marathon });
