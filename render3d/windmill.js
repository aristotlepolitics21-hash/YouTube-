// Scenes for "How One Boy Built a Windmill From Scrap" (William Kamkwamba's story, 16:9).
// The boy is a generic stylised figure, not a likeness of any real person.
import {
  THREE, RoundedBoxGeometry, n3, ease, lerp, displace, baseScene, cam, seg, P, rnd, orbit, finish,
  motes, holoPanel, txt, humanoid, walkPose, standPose, dataStream, starfield,
} from './lib_sci.js';
import { run } from './lib3d.js';

const AMBER = '#ffb347', WARM = '#ffd27a', CYAN = '#57d8ff', GREEN = '#4dff9a';

// ---------- environment ----------
function sky(scene, mode) {
  const col = { day: ['#9cc8e8', '#e8d8b0'], sunset: ['#3a2a5a', '#ff9a5a'], night: ['#050818', '#101a30'], drought: ['#c8b890', '#e8c890'] }[mode] || ['#9cc8e8', '#e8d8b0'];
  const g = new THREE.SphereGeometry(200, 32, 16);
  const m = new THREE.ShaderMaterial({ uniforms: { a: { value: new THREE.Color(col[0]) }, b: { value: new THREE.Color(col[1]) } }, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying float vY; void main(){ vY = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform vec3 a, b; varying float vY; void main(){ gl_FragColor = vec4(mix(b, a, smoothstep(-0.05, 0.5, vY)), 1.0); }' });
  scene.add(new THREE.Mesh(g, m));
  if (mode === 'night') starfield(scene, 3000, 150);
}
function lights(scene, mode) {
  const sun = new THREE.DirectionalLight(mode === 'sunset' ? '#ffb070' : mode === 'night' ? '#6f8ac0' : '#fff2d8', mode === 'night' ? 0.35 : 1.45);
  sun.position.set(mode === 'sunset' ? -30 : 20, mode === 'sunset' ? 8 : 30, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30 }); scene.add(sun);
  scene.add(new THREE.HemisphereLight(mode === 'night' ? '#2a3a6a' : '#cfe0ff', '#5a4a2a', mode === 'night' ? 0.25 : 0.6));
}
function ground(scene, color = '#a8885a') {
  const g = new THREE.PlaneGeometry(300, 300, 150, 150); g.rotateX(-Math.PI / 2);
  displace(g, (v) => 0.6 * n3(v.x * 0.03, 0, v.z * 0.03) * Math.min(1, Math.hypot(v.x, v.z) / 20));
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 1 })); m.receiveShadow = true; scene.add(m); return m;
}
function tree(x, z, s = 1, color = '#4a6a2a') {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * s, 0.2 * s, 2.4 * s, 8), new THREE.MeshStandardMaterial({ color: '#5a3a24', roughness: 1 })); trunk.position.y = 1.2 * s; g.add(trunk);
  const top = new THREE.Mesh(new THREE.SphereGeometry(1.6 * s, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshStandardMaterial({ color, roughness: 1 })); top.scale.y = 0.45; top.position.y = 2.3 * s; g.add(top);
  g.position.set(x, 0, z); g.traverse((o) => { if (o.isMesh) o.castShadow = true; }); return g;
}
function hut(x, z, r = 1.6, window = false) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 2, 24), new THREE.MeshStandardMaterial({ color: '#9a6a44', roughness: 1 })); wall.position.y = 1; g.add(wall);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(r * 1.35, 1.8, 24), new THREE.MeshStandardMaterial({ color: '#a08452', roughness: 1 })); roof.position.y = 2.9; g.add(roof);
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.3), new THREE.MeshStandardMaterial({ color: '#2a1a10' })); door.position.set(0, 0.65, r + 0.01); g.add(door);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.4), new THREE.MeshBasicMaterial({ color: '#1a120a' })); win.position.set(r * 0.7, 1.3, r * 0.72); win.rotation.y = 0.8; g.add(win);
  g.userData.win = win; g.position.set(x, 0, z); g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g;
}
// Shirt on torso and arms, trousers on hips and legs
function dress(fig, shirt, pants = '#5a4a3a') {
  const J = fig.userData.joints, dark = fig.userData.materials.dark;
  const sm = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.95 }), pm = new THREE.MeshStandardMaterial({ color: pants, roughness: 0.95 });
  const legs = [J.pelvis, J.hipL, J.hipR, J.kneeL, J.kneeR];
  fig.traverse((o) => { if (o.isMesh && o.material === dark) o.material = legs.includes(o.parent) ? pm : sm; });
  return fig;
}
function boy() {
  const b = humanoid({ style: 'person', color: '#5a3a26' }); standPose(b); b.scale.setScalar(0.85);
  return dress(b, '#a8402a', '#4a4a52');
}
function maizeField(scene, dry, x0 = -12, z0 = -6, nx = 14, nz = 8) {
  const stalkM = new THREE.MeshStandardMaterial({ color: dry ? '#a8905a' : '#4a8a2a', roughness: 1 }), leafM = new THREE.MeshStandardMaterial({ color: dry ? '#b89a62' : '#5aa832', roughness: 1, side: THREE.DoubleSide });
  const plants = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const g = new THREE.Group(), h = (dry ? 1.2 : 2.0) + rnd(i * 13 + j) * 0.5;
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, h, 6), stalkM); s.position.y = h / 2; g.add(s);
    for (let k = 0; k < 5; k++) { const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.12), leafM); leaf.position.set(0.35, 0.4 + k * h / 6, 0); leaf.rotation.set(0, k * 2.2, dry ? -1.1 : -0.35); g.add(leaf); }
    g.position.set(x0 + i * 0.9, 0, z0 + j * 1.1); if (dry) g.rotation.z = (rnd(i + j) - 0.5) * 0.3; scene.add(g); plants.push(g);
  }
  return plants;
}

// ---------- props ----------
function bicycle() {
  const g = new THREE.Group();
  const tubeM = new THREE.MeshStandardMaterial({ color: '#2a4a8a', roughness: 0.5, metalness: 0.4 }), tireM = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.9 }), metal = new THREE.MeshStandardMaterial({ color: '#a8acb0', metalness: 0.8, roughness: 0.35 });
  const wheel = (x) => { const w = new THREE.Group(); w.add(new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 12, 48), tireM)); for (let i = 0; i < 16; i++) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.38, 4), metal); sp.rotation.z = i / 16 * Math.PI; w.add(sp); } w.position.set(x, 0.7, 0); g.add(w); return w; };
  const back = wheel(-1.0), front = wheel(1.0);
  const bar = (a, b) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, a.distanceTo(b), 8), tubeM); m.position.copy(a).add(b).multiplyScalar(0.5); m.lookAt(b); m.rotateX(Math.PI / 2); g.add(m); };
  const V = (x, y) => new THREE.Vector3(x, y, 0);
  bar(V(-1, 0.7), V(-0.1, 0.75)); bar(V(-0.1, 0.75), V(-0.3, 1.5)); bar(V(-0.3, 1.5), V(0.75, 1.45)); bar(V(-0.1, 0.75), V(0.75, 1.45)); bar(V(-1, 0.7), V(-0.3, 1.5)); bar(V(0.75, 1.45), V(1, 0.7)); bar(V(0.75, 1.45), V(0.7, 1.8));
  const dyn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 16), new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 0.9, roughness: 0.25 })); dyn.position.set(-1.0, 1.42, 0.1); g.add(dyn);
  g.userData.wheels = [back, front]; g.userData.dynamo = dyn;
  return g;
}
// Windmill: blue-gum tower, bicycle frame/wheel hub, four flattened-PVC blades
function windmill({ height = 6 } = {}) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: '#8a6a4a', roughness: 1 });
  for (const [x, z] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, height, 8), wood); pole.position.set(x * (1 - 0.3), height / 2, z * (1 - 0.3)); pole.rotation.set(z * 0.05, 0, -x * 0.05); g.add(pole); }
  for (let k = 1; k < 5; k++) { const y = k * height / 5; const r = 0.6 - k * 0.04; for (const [a, b] of [[[-r, -r], [r, -r]], [[r, -r], [r, r]], [[r, r], [-r, r]], [[-r, r], [-r, -r]]]) { const p1 = new THREE.Vector3(a[0], y, a[1]), p2 = new THREE.Vector3(b[0], y, b[1]); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, p1.distanceTo(p2), 6), wood); m.position.copy(p1).add(p2).multiplyScalar(0.5); m.lookAt(p2); m.rotateX(Math.PI / 2); g.add(m); } }
  const top = new THREE.Group(); top.position.y = height + 0.2; g.add(top);
  const bike = bicycle(); bike.scale.setScalar(0.6); bike.position.set(-0.3, -0.3, 0); top.add(bike);
  const hub = new THREE.Group(); hub.position.set(0.9, 0.55, 0); top.add(hub);
  const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.15, 24), new THREE.MeshStandardMaterial({ color: '#c84a2a', metalness: 0.5, roughness: 0.4 })); fan.rotation.z = Math.PI / 2; hub.add(fan);
  const bladeM = new THREE.MeshStandardMaterial({ color: '#2a5aa8', roughness: 0.5, side: THREE.DoubleSide });
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.0, 16, 1, true, 0, Math.PI), bladeM); b.position.y = 1.1; const arm = new THREE.Group(); arm.rotation.x = i * Math.PI / 2; arm.add(b); b.rotation.y = 0.5; hub.add(arm); }
  g.userData.hub = hub; g.userData.bike = bike;
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function bulbMesh() {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), new THREE.MeshBasicMaterial({ color: '#3a3020' })); g.add(glass);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 16), new THREE.MeshStandardMaterial({ color: '#b8b0a0', metalness: 0.8 })); base.position.y = -0.24; g.add(base);
  const light = new THREE.PointLight(WARM, 0, 12, 1.5); g.add(light);
  g.userData.set = (k) => { glass.material.color.set('#3a3020').lerp(new THREE.Color('#fff2c0'), k); light.intensity = k * 7; };
  return g;
}

// ---------- scenes ----------
function title_card(p) {
  const scene = baseScene('#0c0804'); const camera = cam(36);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    ctx.globalAlpha = seg(t, 0.03, 0.4);
    if (p.big) { txt(ctx, p.big, w / 2, h * 0.4, P(p, 'bigSize', 240), P(p, 'color', AMBER), 'center', 900); txt(ctx, P(p, 'sub', ''), w / 2, h * 0.72, 54, '#fff0d8', 'center', 800); txt(ctx, P(p, 'sub2', ''), w / 2, h * 0.84, 40, '#d8b890', 'center', 600); }
    else { txt(ctx, P(p, 'year', ''), w / 2, h * 0.22, 110, AMBER, 'center', 900); P(p, 'lines', [P(p, 'title', '')]).forEach((l, i) => txt(ctx, l, w / 2, h * 0.46 + i * 84, i ? 52 : 68, i ? '#fff0d8' : '#ffffff', 'center', 900)); txt(ctx, P(p, 'sub', ''), w / 2, h * 0.86, 42, '#d8b890', 'center', 700); }
    ctx.globalAlpha = 1;
  }, { res: 1600, color: AMBER });
  scene.add(panel);
  const m = motes(scene, 300, 24, WARM, 0.3);
  const update = (t) => { panel.userData.update(t); m.userData.update(t); orbit(camera, p, t, { dist0: 11, dist1: 9.5, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.55 });
}

// Village of huts and trees; drought (dry, dusty) or green
function village(p) {
  const mode = P(p, 'mode', 'drought');
  const scene = baseScene(mode === 'night' ? '#050818' : '#d8c8a0', mode === 'night' ? 0.01 : 0.012); const camera = cam(40);
  sky(scene, mode); lights(scene, mode);
  ground(scene, mode === 'green' ? '#6a8a3a' : mode === 'night' ? '#3a2e22' : '#b8925a');
  for (let i = 0; i < 9; i++) { const h = hut(-14 + i * 3.6 + rnd(i) * 1.5, -6 - rnd(i + 1) * 6, 1.3 + rnd(i + 2) * 0.5); if (mode === 'night') { h.traverse((o) => { if (o.isMesh && o.material.color && o !== h.userData.win) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.3); } }); if (i % 3 === 1) h.userData.win.material.color.set(WARM); } scene.add(h); }
  for (let i = 0; i < 26; i++) scene.add(tree((rnd(i + 3) - 0.5) * 70, -10 - rnd(i + 4) * 40, 0.8 + rnd(i + 5) * 0.8, mode === 'green' ? '#3a7a2a' : '#7a7a3a'));
  if (p.windmill) { const w = windmill({ height: 7 }); w.position.set(2, 0, -4); scene.add(w); scene.userData.w = w; }
  const dust = motes(scene, 300, 40, '#e8d0a0', mode === 'drought' ? 0.4 : 0);
  const update = (t) => { dust.userData.update(t); if (scene.userData.w) scene.userData.w.userData.hub.rotation.x = t * 30; orbit(camera, p, t, { dist0: 26, dist1: 20, el0: 0.18, el1: 0.12, az0: -0.2, az1: 0.15, ty0: 2, ty1: 2, tz0: -6, tz1: -6 }); };
  return finish(scene, camera, update, { strength: 0.3, threshold: 0.92 });
}

// Maize field, dry or green
function maize(p) {
  const dry = P(p, 'dry', true);
  const scene = baseScene(dry ? '#d8c8a0' : '#b8d8e8', 0.02); const camera = cam(40);
  sky(scene, dry ? 'drought' : 'day'); lights(scene, 'day'); ground(scene, dry ? '#b08a50' : '#6a5a3a');
  const plants = maizeField(scene, dry);
  const update = (t) => { plants.forEach((g, i) => { g.rotation.x = 0.05 * Math.sin(t * 4 + i * 0.3); }); orbit(camera, p, t, { dist0: 12, dist1: 8, el0: 0.25, el1: 0.15, az0: -0.3, az1: 0.2, ty0: 1, ty1: 1, tx0: -6, tx1: -6 }); };
  return finish(scene, camera, update, { strength: 0.3, threshold: 0.92 });
}

// Boy walking along a dirt path (optionally toward a small library building)
function boy_walk(p) {
  const scene = baseScene('#d8c8a0', 0.015); const camera = cam(38);
  sky(scene, P(p, 'sky', 'day')); lights(scene, 'day'); ground(scene, '#b8925a');
  const path = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 80), new THREE.MeshStandardMaterial({ color: '#c8a874', roughness: 1 })); path.rotation.x = -Math.PI / 2; path.position.y = 0.03; scene.add(path);
  for (let i = 0; i < 18; i++) scene.add(tree((rnd(i) > 0.5 ? 1 : -1) * (4 + rnd(i + 1) * 14), -rnd(i + 2) * 60 + 10, 0.8 + rnd(i + 3) * 0.6, '#7a7a3a'));
  if (p.library) { const lib = new THREE.Mesh(new RoundedBoxGeometry(6, 3, 4, 2, 0.1), new THREE.MeshStandardMaterial({ color: '#c8b8a0', roughness: 0.9 })); lib.position.set(0, 1.5, -22); scene.add(lib); const roof = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.3, 4.6), new THREE.MeshStandardMaterial({ color: '#7a3a2a' })); roof.position.set(0, 3.15, -22); scene.add(roof); }
  const b = boy(); scene.add(b);
  const update = (t) => { walkPose(b, t * 4, { stride: 0.45 }); b.position.set(0, 0, -t * 10 + 2); b.rotation.y = Math.PI; orbit(camera, p, t, { dist0: 7, dist1: 6, el0: 0.15, el1: 0.12, az0: 0.5, az1: 0.2, ty0: 1.4, ty1: 1.4, tz0: 2, tz1: -8 }); };
  return finish(scene, camera, update, { strength: 0.3, threshold: 0.92 });
}

// Library table with an open book showing windmill diagrams
function library(p) {
  const scene = baseScene('#1a120a', 0.03); const camera = cam(36);
  const table = new THREE.Mesh(new RoundedBoxGeometry(8, 0.3, 5, 2, 0.05), new THREE.MeshStandardMaterial({ color: '#6a4a2a', roughness: 0.7 })); scene.add(table);
  const c = document.createElement('canvas'); c.width = 1600; c.height = 1000; const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const book = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.6), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })); book.rotation.x = -Math.PI / 2; book.position.y = 0.17; scene.add(book);
  const shelves = new THREE.Group(); scene.add(shelves);
  const cols = ['#8a2a2a', '#2a5a8a', '#3a7a3a', '#c8a03a', '#5a3a7a'];
  for (let s = 0; s < 4; s++) for (let i = 0; i < 26; i++) { const bk = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.9 + rnd(i + s * 30) * 0.3, 0.7), new THREE.MeshStandardMaterial({ color: cols[(i + s) % 5], roughness: 0.8 })); bk.position.set(-3.2 + i * 0.25, 1 + s * 1.3, -4); shelves.add(bk); }
  const lamp = new THREE.PointLight(WARM, 11, 15, 1.5); lamp.position.set(1.5, 4, 1.5); scene.add(lamp);
  scene.add(new THREE.HemisphereLight('#ffe0b0', '#1a120a', 0.4));
  const update = (t) => {
    x.fillStyle = '#d8ccb4'; x.fillRect(0, 0, 1600, 1000); x.fillStyle = '#d8ccb0'; x.fillRect(795, 0, 10, 1000);
    if (p.cover) { x.fillStyle = '#2a6a9a'; x.fillRect(820, 0, 780, 1000); x.fillStyle = '#ffffff'; x.font = '900 90px sans-serif'; x.textAlign = 'center'; x.fillText('USING', 1210, 200); x.fillText('ENERGY', 1210, 300); }
    const drawMill = (cx, cy, s, rot) => { x.strokeStyle = '#3a2a1a'; x.lineWidth = 6 * s; x.beginPath(); x.moveTo(cx - 60 * s, cy + 300 * s); x.lineTo(cx, cy); x.lineTo(cx + 60 * s, cy + 300 * s); x.stroke(); for (let i = 0; i < 4; i++) { const a = rot + i * Math.PI / 2; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * 150 * s, cy + Math.sin(a) * 150 * s); x.stroke(); } };
    drawMill(380, 380, 1, t * 6); if (!p.cover) drawMill(1200, 420, 0.8, -t * 6); else { drawMill(1050, 600, 0.6, t * 4); drawMill(1370, 640, 0.5, t * 5); }
    x.fillStyle = '#3a2a1a'; x.font = '700 40px sans-serif'; x.textAlign = 'left'; x.fillText('wind → blades → generator → electricity', 60, 900);
    tex.needsUpdate = true;
    orbit(camera, p, t, { dist0: 6, dist1: 4.5, el0: 0.9, el1: 0.75, az0: -0.2, az1: 0.1, ty0: 0.2, ty1: 0.2 });
  };
  return finish(scene, camera, update, { strength: 0.25, threshold: 0.97 });
}

// Hut at night; window and bulb glow when powered
function house_light(p) {
  const scene = baseScene('#050818', 0.01); const camera = cam(38);
  sky(scene, 'night'); lights(scene, 'night'); ground(scene, '#4a3a2a');
  const h = hut(0, 0, 1.8); scene.add(h);
  const lamp = new THREE.PointLight(P(p, 'kerosene', 0) ? '#ff8a3a' : WARM, 0, 10, 1.5); lamp.position.set(1.2, 1.3, 1.4); scene.add(lamp);
  const bulb = bulbMesh(); bulb.position.set(P(p, 'handheld', 0) ? 3.6 : 1.4, P(p, 'handheld', 0) ? 1.6 : 1.4, 2.2); scene.add(bulb);
  if (p.windmill) { const w = windmill({ height: 7 }); w.position.set(-6, 0, -3); scene.add(w); scene.userData.w = w; }
  const update = (t) => {
    const on = lerp(P(p, 'on0', 0), P(p, 'on1', 1), ease(seg(t, 0.15, 0.6))) * (P(p, 'flicker', 0) ? 0.6 + 0.4 * Math.sin(t * 60) * Math.sin(t * 23) : 1);
    bulb.userData.set(Math.max(0, on)); lamp.intensity = P(p, 'kerosene', 0) ? 1.6 + 0.4 * Math.sin(t * 30) : Math.max(0, on) * 4;
    h.userData.win.material.color.set('#1a120a').lerp(new THREE.Color(WARM), P(p, 'kerosene', 0) ? 0.3 : Math.max(0, on));
    if (scene.userData.w) scene.userData.w.userData.hub.rotation.x = t * 30;
    orbit(camera, p, t, { dist0: 12, dist1: 9, el0: 0.12, el1: 0.08, az0: 0.5, az1: 0.25, ty0: 1.8, ty1: 1.8 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.8 });
}

// Magnet spinning inside a copper coil, current flowing to a bulb
function dynamo(p) {
  const scene = baseScene('#0a0806', 0.02); const camera = cam(36);
  const coil = new THREE.Group(); scene.add(coil);
  const cu = new THREE.MeshStandardMaterial({ color: '#c87533', metalness: 0.9, roughness: 0.3 });
  for (let i = 0; i < 24; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.06, 8, 48), cu); r.position.x = (i - 12) * 0.13; r.rotation.y = Math.PI / 2; coil.add(r); }
  const mag = new THREE.Group(); scene.add(mag);
  const n = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.6), new THREE.MeshStandardMaterial({ color: '#d03a3a', roughness: 0.4 })); n.position.y = 0.45; mag.add(n);
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.6), new THREE.MeshStandardMaterial({ color: '#3a6ad0', roughness: 0.4 })); s.position.y = -0.45; mag.add(s);
  const wire = new THREE.CatmullRomCurve3([new THREE.Vector3(1.6, 1.2, 0), new THREE.Vector3(3, 2.5, 0), new THREE.Vector3(5, 2.2, 0), new THREE.Vector3(5.5, 1, 0)]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(wire, 60, 0.04, 8), cu));
  const e = dataStream(wire, 120, '#9fe0ff', 4); scene.add(e);
  const bulb = bulbMesh(); bulb.position.set(5.5, 0.7, 0); bulb.scale.setScalar(2); scene.add(bulb);
  const lab = holoPanel(5.5, 0.7, (ctx, t, w, h) => txt(ctx, 'MAGNET + COIL = CURRENT', w / 2, h / 2, 64, WARM, 'center', 900), { res: 1200, frame: false, color: AMBER }); lab.position.set(1.5, -2.2, 0); scene.add(lab);
  scene.add(new THREE.HemisphereLight('#fff0d8', '#1a120a', 0.6)); const key = new THREE.DirectionalLight('#ffffff', 1.4); key.position.set(3, 6, 6); scene.add(key);
  const update = (t) => { const sp = ease(seg(t, 0, 0.3)); mag.rotation.x = t * 30 * sp; e.userData.update(t, 0.6 * sp); e.visible = sp > 0.2; bulb.userData.set(sp); lab.userData.update(t); orbit(camera, p, t, { dist0: 11, dist1: 9, el0: 0.2, el1: 0.12, az0: -0.3, az1: 0.2, tx0: 1.5, tx1: 1.8 }); };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.6 });
}

function bicycle_scene(p) {
  const scene = baseScene('#0c0a08', 0.02); const camera = cam(36);
  const b = bicycle(); scene.add(b);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: '#3a2e22', roughness: 1 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const glow = new THREE.PointLight(WARM, 0, 4, 1.5); glow.position.set(-1, 1.6, 0.4); scene.add(glow);
  scene.add(new THREE.HemisphereLight('#fff0d8', '#1a120a', 0.6)); const key = new THREE.DirectionalLight('#ffe8c8', 1.6); key.position.set(4, 6, 5); scene.add(key);
  const update = (t) => { b.userData.wheels.forEach((w) => { w.rotation.z = -t * 20; }); glow.intensity = 6 + 2 * Math.sin(t * 30); orbit(camera, p, t, { dist0: 6, dist1: 4.5, el0: 0.25, el1: 0.15, az0: 0.4, az1: 0.1, ty0: 1, ty1: 1.2, tx0: -0.3, tx1: -0.6 }); };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.8 });
}

// Scrapyard with piles of junk and the boy searching
function junkyard(p) {
  const scene = baseScene('#d8c8a0', 0.015); const camera = cam(40);
  sky(scene, 'day'); lights(scene, 'day'); ground(scene, '#9a7a4a');
  const rust = ['#7a4a2a', '#5a5a5a', '#8a6a3a', '#3a3a3a', '#9a3a2a'];
  for (let i = 0; i < 70; i++) {
    const kind = i % 4, m = new THREE.MeshStandardMaterial({ color: rust[i % 5], roughness: 0.8, metalness: 0.4 });
    const geo = kind === 0 ? new THREE.BoxGeometry(1 + rnd(i), 0.6 + rnd(i + 1), 0.8) : kind === 1 ? new THREE.CylinderGeometry(0.12, 0.12, 2 + rnd(i) * 2, 10) : kind === 2 ? new THREE.TorusGeometry(0.5, 0.08, 8, 24) : new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16);
    const o = new THREE.Mesh(geo, m); const a = rnd(i + 2) * 6.28, r = 2 + rnd(i + 3) * 8; o.position.set(Math.cos(a) * r, 0.3 + rnd(i + 4) * 0.5, Math.sin(a) * r - 4); o.rotation.set(rnd(i) * 3, rnd(i + 1) * 3, rnd(i + 2) * 3); o.castShadow = true; scene.add(o);
  }
  const fan = new THREE.Group(); for (let i = 0; i < 4; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.9, 0.03), new THREE.MeshStandardMaterial({ color: '#c84a2a', metalness: 0.5 })); bl.position.y = 0.45; const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; arm.add(bl); fan.add(arm); } fan.position.set(1.2, 0.4, 0.2); fan.rotation.x = -1.3; scene.add(fan);
  const b = boy(); b.position.set(0, 0, 1.2); scene.add(b);
  const update = (t) => { standPose(b); const J = b.userData.joints; J.spine.rotation.x = 0.6; J.shoulderL.rotation.x = -1.0 - 0.3 * Math.sin(t * 6); J.shoulderR.rotation.x = -0.8; J.kneeL.rotation.x = J.kneeR.rotation.x = 0.5; J.hipL.rotation.x = J.hipR.rotation.x = -0.4; J.pelvis.position.y = 1.85; orbit(camera, p, t, { dist0: 9, dist1: 7, el0: 0.3, el1: 0.22, az0: 0.6, az1: 0.3, ty0: 1, ty1: 1, tz0: 0, tz1: 0 }); };
  return finish(scene, camera, update, { strength: 0.3, threshold: 0.92 });
}

// PVC pipe halves heated over a fire and flattened into blades
function pvc_blades(p) {
  const scene = baseScene('#0c0806', 0.02); const camera = cam(36);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3, 32, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#b0b4b8', roughness: 0.6, side: THREE.DoubleSide }));
  pipe.rotation.z = Math.PI / 2; pipe.position.y = 1.2; scene.add(pipe);
  const N = 300, pos = new Float32Array(N * 3), fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const fire = new THREE.Points(fg, new THREE.PointsMaterial({ color: '#ff8a2a', size: 6, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(fire);
  const glow = new THREE.PointLight('#ff7a2a', 25, 8, 1.5); glow.position.set(0, 0.4, 0); scene.add(glow);
  for (let i = 0; i < 6; i++) { const log = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 8), new THREE.MeshStandardMaterial({ color: '#3a2414' })); log.rotation.set(Math.PI / 2, i * 0.5, 0); log.position.y = 0.1; scene.add(log); }
  scene.add(new THREE.HemisphereLight('#ffd8b0', '#1a0a04', 0.35));
  const update = (t) => {
    for (let i = 0; i < N; i++) { const u = ((t * 2 + rnd(i)) % 1); pos.set([(rnd(i + 0.1) - 0.5) * 1.2 * (1 - u), 0.1 + u * 1.2, (rnd(i + 0.2) - 0.5) * 0.6 * (1 - u)], i * 3); }
    fg.attributes.position.needsUpdate = true; glow.intensity = 6 + 2 * Math.sin(t * 40);
    const flat = ease(seg(t, 0.4, 0.9)) * P(p, 'flatten', 0); pipe.scale.set(1, 1, 1 - flat * 0.85); pipe.position.y = 1.2 + flat * 0.4;
    pipe.material.color.set('#b0b4b8').lerp(new THREE.Color('#2a5aa8'), P(p, 'flatten', 0) ? flat : 0);
    orbit(camera, p, t, { dist0: 6, dist1: 5, el0: 0.3, el1: 0.22, az0: -0.4, az1: 0.1, ty0: 0.9, ty1: 1 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.85 });
}

// Tower of blue-gum poles rising
function build(p) {
  const scene = baseScene('#d8c8a0', 0.012); const camera = cam(40);
  sky(scene, 'day'); lights(scene, 'day'); ground(scene, '#b8925a');
  const w = windmill({ height: 6 }); scene.add(w);
  const kids = [boy(), boy(), boy()]; kids.forEach((k, i) => { k.position.set(-2 + i * 2, 0, 2.2); k.rotation.y = Math.PI + (i - 1) * 0.3; scene.add(k); });
  scene.add(hut(-7, -4)); scene.add(tree(6, -6, 1.2));
  const update = (t) => {
    const k = ease(seg(t, 0, 0.8)) * P(p, 'k1', 1) + P(p, 'k0', 0) * (1 - ease(seg(t, 0, 0.8)));
    w.scale.set(1, Math.max(0.02, k), 1); w.userData.hub.visible = k > 0.98; w.userData.bike.visible = k > 0.95;
    kids.forEach((kd, i) => { standPose(kd); const J = kd.userData.joints; J.shoulderL.rotation.x = J.shoulderR.rotation.x = -2.2 - 0.2 * Math.sin(t * 8 + i); J.neck.rotation.x = -0.3; });
    orbit(camera, p, t, { dist0: 14, dist1: 12, el0: 0.12, el1: 0.08, az0: 0.6, az1: 0.3, ty0: 3, ty1: 3.5 });
  };
  return finish(scene, camera, update, { strength: 0.3, threshold: 0.92 });
}

// The finished windmill spinning (day / sunset / night with lit window)
function windmill_scene(p) {
  const mode = P(p, 'mode', 'sunset');
  const scene = baseScene(mode === 'night' ? '#050818' : '#c88a5a', 0.01); const camera = cam(38);
  sky(scene, mode); lights(scene, mode); ground(scene, mode === 'night' ? '#3a2e22' : '#a8825a');
  const w = windmill({ height: P(p, 'height', 7) }); scene.add(w);
  const h = hut(-5, 2, 1.6); scene.add(h);
  const wire = new THREE.CatmullRomCurve3([new THREE.Vector3(0, P(p, 'height', 7) - 0.5, 0), new THREE.Vector3(-2.5, 4, 1), new THREE.Vector3(-5, 2.6, 2)]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(wire, 40, 0.025, 6), new THREE.MeshStandardMaterial({ color: '#1a1a1a' })));
  const pulse = dataStream(wire, 60, WARM, 3); scene.add(pulse);
  const lamp = new THREE.PointLight(WARM, mode === 'night' ? 3 : 0, 8, 1.5); lamp.position.set(-4, 1.4, 3.6); scene.add(lamp);
  for (let i = 0; i < 10; i++) scene.add(tree((rnd(i) - 0.5) * 60, -12 - rnd(i + 1) * 30, 0.9 + rnd(i + 2) * 0.6, '#5a6a2a'));
  if (p.crowd) for (let i = 0; i < 12; i++) { const v = humanoid({ style: 'person', color: ['#5a3a26', '#4a2e1e', '#6a4430'][i % 3] }); standPose(v); v.scale.setScalar(0.9 + rnd(i) * 0.15); dress(v, ['#a8402a', '#2a5a8a', '#c8a030', '#6a3a7a'][i % 4], ['#4a4a52', '#5a4a3a', '#3a3a3a'][i % 3]); const a = -0.8 + i * 0.15, r = 6 + rnd(i + 3) * 2; v.position.set(Math.sin(a) * r, 0, Math.cos(a) * r); v.lookAt(0, 0, 0); v.userData.joints.neck.rotation.x = -0.45; scene.add(v); }
  const update = (t) => {
    w.userData.hub.rotation.x = t * P(p, 'spin', 30); w.userData.bike.userData.wheels[0].rotation.z = -t * 40;
    h.userData.win.material.color.set(mode === 'night' ? WARM : '#1a120a'); pulse.userData.update(t, 0.8);
    orbit(camera, p, t, { dist0: 21, dist1: 17, el0: 0.12, el1: 0.08, az0: 0.4, az1: 0.0, ty0: P(p, 'height', 7) * 0.8, ty1: P(p, 'height', 7) * 0.85 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: mode === 'night' ? 0.75 : 0.9 });
}

// Pump: water flowing from a well to green crops
function pump(p) {
  const scene = baseScene('#b8d8e8', 0.012); const camera = cam(40);
  sky(scene, 'day'); lights(scene, 'day'); ground(scene, '#7a6a3a');
  const well = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#8a8a8a', roughness: 0.9, side: THREE.DoubleSide })); well.position.set(-6, 0.5, 0); scene.add(well);
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.15, 32), new THREE.MeshStandardMaterial({ color: '#2a6a9a', roughness: 0.1 })); water.rotation.x = -Math.PI / 2; water.position.set(-6, 0.7, 0); scene.add(water);
  const w = windmill({ height: 6 }); w.position.set(-6, 0, -2.5); scene.add(w);
  const pipe = new THREE.CatmullRomCurve3([new THREE.Vector3(-6, 0.9, 0), new THREE.Vector3(-3, 0.3, 0), new THREE.Vector3(2, 0.2, 0), new THREE.Vector3(8, 0.2, 0)]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(pipe, 60, 0.12, 10), new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.6 })));
  const flow = dataStream(pipe, 160, '#7fd0ff', 4); scene.add(flow);
  const plants = maizeField(scene, false, 1, -5, 10, 10);
  const update = (t) => { w.userData.hub.rotation.x = t * 30; flow.userData.update(t, 0.6); const g = ease(seg(t, 0.1, 0.8)); plants.forEach((pl, i) => { pl.scale.setScalar(Math.max(0.15, Math.min(1, g * 1.4 - rnd(i) * 0.4))); }); orbit(camera, p, t, { dist0: 18, dist1: 14, el0: 0.35, el1: 0.25, az0: 0.3, az1: 0.6, ty0: 1.5, ty1: 1.5 }); };
  return finish(scene, camera, update, { strength: 0.3, threshold: 0.92 });
}

// Speaking on a stage under a spotlight
function stage(p) {
  const scene = baseScene('#050406', 0.03); const camera = cam(36);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.4, 64), new THREE.MeshStandardMaterial({ color: '#2a1a1a', roughness: 0.6 })); floor.position.y = -0.2; scene.add(floor);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.2, 64), new THREE.MeshStandardMaterial({ color: '#b02020', roughness: 0.9 })); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.01; scene.add(rug);
  const b = boy(); b.scale.setScalar(1); scene.add(b);
  const spot = new THREE.SpotLight('#fff4e0', 120, 20, 0.35, 0.5); spot.position.set(0, 10, 4); spot.target.position.set(0, 1.5, 0); spot.castShadow = true; scene.add(spot, spot.target);
  const beam = new THREE.Mesh(new THREE.ConeGeometry(2.2, 10, 48, 1, true), new THREE.MeshBasicMaterial({ color: '#fff4e0', transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); beam.position.set(0, 5, 0); scene.add(beam);
  const aud = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 12, 8), new THREE.MeshStandardMaterial({ color: '#141418' }), 200);
  const M = new THREE.Matrix4(); for (let i = 0; i < 200; i++) { const row = Math.floor(i / 25), col = i % 25; M.makeTranslation((col - 12) * 0.9, 0.5 + row * 0.35, 8 + row * 1.1); aud.setMatrixAt(i, M); } scene.add(aud);
  scene.add(new THREE.HemisphereLight('#3a3040', '#050406', 0.3));
  const update = (t) => { standPose(b); const J = b.userData.joints; J.shoulderR.rotation.x = -0.6 - 0.3 * Math.sin(t * 5); J.elbowR.rotation.x = -0.9; J.neck.rotation.y = 0.2 * Math.sin(t * 2); orbit(camera, p, t, { dist0: 10, dist1: 7, el0: 0.1, el1: 0.08, az0: 0.3, az1: 0.0, ty0: 1.8, ty1: 1.8 }); };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.85 });
}

run({ title_card, village, maize, boy_walk, library, house_light, dynamo, bicycle: bicycle_scene, junkyard, pvc_blades, build, windmill: windmill_scene, pump, stage });
