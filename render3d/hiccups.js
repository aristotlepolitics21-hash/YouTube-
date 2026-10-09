// "What actually causes hiccups?" — a front cutaway of the chest: lungs, heart, the dome-shaped
// diaphragm breathing smoothly, a full stomach, then a sudden spasm that sucks air in; the vocal
// cords seen from above snapping shut ("hic"), and a 68-year counter.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, cutaway, smooth, band, ellipse, slab,
  flow, label, path3, wet, glowMat, boneMat, flesh, C,
} from './lib_body.js';
import { run } from './lib3d.js';

const TORSO = [[-1.15, 7.6], [-1.25, 6.3], [-3.0, 5.75], [-4.7, 5.15], [-5.15, 3.9], [-4.95, 2.4], [-4.65, 0.0], [-4.2, -3.0], [-4.55, -5.4], [-4.3, -6.6],
  [4.3, -6.6], [4.55, -5.4], [4.2, -3.0], [4.65, 0.0], [4.95, 2.4], [5.15, 3.9], [4.7, 5.15], [3.0, 5.75], [1.25, 6.3], [1.15, 7.6]];
const DOME_UP = [[-4.35, -0.7], [-3.0, 0.55], [-1.2, 0.9], [0.0, 0.55], [1.2, 0.9], [3.0, 0.55], [4.35, -0.7]];
const DOME_DOWN = [[-4.35, -0.9], [-3.0, -0.35], [-1.2, -0.15], [0.0, -0.35], [1.2, -0.15], [3.0, -0.35], [4.35, -0.9]];

function chest(p) {
  const { scene, camera } = setup();
  const layers = [
    { name: 'liver', outline: smooth([[-4.25, -0.9], [-2.6, 0.2], [-0.6, 0.0], [0.8, -0.8], [0.2, -1.8], [-2.0, -3.0], [-4.0, -2.6]]), h: 0.2, color: '#8e3a2c' },
    { name: 'gut', outline: smooth([[-3.8, -3.2], [-1.0, -2.9], [2.0, -3.3], [3.9, -3.6], [4.0, -6.2], [-4.0, -6.2]]), h: 0.12, color: '#d98a86' },
    { name: 'trachea', outline: band([[0, 7.7], [0, 4.5], [0, 3.2]], 0.55), h: 0, color: C.cavity },
    { name: 'bronchL', outline: band([[0, 3.3], [-0.9, 2.6], [-1.9, 2.0]], 0.38), h: 0, color: C.cavity },
    { name: 'bronchR', outline: band([[0, 3.3], [0.9, 2.6], [1.9, 2.0]], 0.38), h: 0, color: C.cavity },
  ];
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) layers.push({ name: `rib${s}${i}`, outline: ellipse(s * (4.5 - i * 0.02), 4.3 - i * 0.78, 0.22, 0.15, 24), h: 0.12, mat: boneMat() });
  const cut = cutaway(smooth(TORSO, 300), layers, { depth: 3.4 });
  scene.add(cut.group);
  // lungs (scale with breath), heart, stomach (can swell), diaphragm (rebuilt per frame)
  const lungM = flesh('#e8909a', 5, { clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const lungs = [-1, 1].map((s) => {
    const o = smooth([[s * 0.7, 4.9], [s * 2.2, 5.0], [s * 3.9, 3.8], [s * 4.15, 1.2], [s * 3.8, 0.4], [s * 2.6, 0.85], [s * 1.3, 1.0], [s * 0.9, 2.2], [s * 0.75, 3.8]]);
    const m = slab(s < 0 ? o.reverse() : o, 0.25, lungM); m.position.z = 0.01; const g = new THREE.Group(); g.position.y = 4.9; m.position.y = -4.9; g.add(m); scene.add(g); return g;
  });
  const heart = slab(ellipse(0.6, 1.55, 1.25, 1.05, 64, 0.06, 3), 0.32, wet('#b8323d')); heart.rotation.z = -0.5; heart.position.set(0.45, 0.3, 0.01); heart.geometry.translate(-0.6, -1.55, 0); heart.position.set(0.6, 1.55, 0.01); scene.add(heart);
  const stomach = slab(smooth([[0.9, -0.6], [2.6, -0.45], [3.9, -1.1], [3.7, -2.6], [2.4, -3.2], [1.0, -2.9], [0.6, -2.0], [1.4, -1.6], [1.6, -1.0]]), 0.26, wet('#e7a18f'));
  stomach.geometry.translate(-2.2, -1.8, 0); stomach.position.set(2.2, -1.8, 0.03); scene.add(stomach);
  const diaM = flesh('#c0303a', 3, { clearcoat: 0.9, clearcoatRoughness: 0.15, emissive: new THREE.Color('#ff2020'), emissiveIntensity: 0 });
  const dia = new THREE.Mesh(new THREE.BufferGeometry(), diaM); dia.position.z = 0.02; scene.add(dia);
  const setDome = (k) => {
    const pts = DOME_UP.map((a, i) => [lerp(a[0], DOME_DOWN[i][0], k), lerp(a[1], DOME_DOWN[i][1], k)]);
    dia.geometry.dispose();
    dia.geometry = new THREE.ExtrudeGeometry(new THREE.Shape(band(pts, 0.6, 80)), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 3 });
  };
  const air = flow(path3([[0, 8.5, 0.3], [0, 5.5, 0.3], [0, 3.6, 0.3], [-1.0, 2.6, 0.3], [-2.4, 2.0, 0.3]]), 50, { r: 0.08, color: '#bfe8ff', spread: 0.25 });
  const air2 = flow(path3([[0, 8.5, 0.3], [0, 5.5, 0.3], [0, 3.6, 0.3], [1.0, 2.6, 0.3], [2.4, 2.0, 0.3]]), 50, { r: 0.08, color: '#bfe8ff', spread: 0.25, seed: 4 });
  scene.add(air, air2);
  const lab = label('DIAPHRAGM', { size: 0.6 }); scene.add(lab);
  studio(scene, { target: [0, 0.5, 0], keyI: 14, keyPos: [-5, 8, 12] });
  return { scene, camera, lungs, stomach, setDome, diaM, air, air2, lab, heart };
}

// 1 — the chest breathing. params: breaths (cycles over the shot), spasmAt (sudden jerk), full (stomach swell 0..1), label
function torso(p) {
  const c = chest(p);
  const update = (t) => {
    const sp = P(p, 'spasmAt', -1);
    let k = 0.5 - 0.5 * Math.cos(t * Math.PI * 2 * P(p, 'breaths', 1));
    const jolt = sp >= 0 ? seg(t, sp, sp + 0.04) * (1 - seg(t, sp + 0.25, sp + 0.6)) : 0;
    if (P(p, 'still', 0)) k = 0.2;
    k = Math.max(k * (1 - jolt), jolt * 1.15);
    c.setDome(Math.min(1.15, k));
    c.diaM.emissiveIntensity = jolt * 0.9 + P(p, 'glow', 0) * (0.35 + 0.2 * Math.sin(t * 20));
    c.lungs.forEach((g) => g.scale.set(1 + k * 0.05, 1 + k * 0.1, 1));
    const full = lerp(P(p, 'full0', 0), P(p, 'full1', 0), ease(t));
    c.stomach.scale.setScalar(1 + full * 0.35);
    const flowing = jolt > 0.2 || !!P(p, 'airflow', 0);
    c.air.visible = c.air2.visible = flowing;
    c.air.userData.update(t, { speed: jolt > 0.2 ? 3 : 0.8 }); c.air2.userData.update(t, { speed: jolt > 0.2 ? 3 : 0.8 });
    c.lab.userData.place(new THREE.Vector3(-2.0, lerp(0.7, -0.3, k), 0.4), new THREE.Vector3(-2.4, -4.4, 0.8), P(p, 'label', 0) ? seg(t, 0.1, 0.25) : 0);
    orbit(c.camera, p, t, { az0: 0.25, az1: 0.15, el0: 0.08, el1: 0.05, dist0: 46, dist1: 42, ty0: 0.4, ty1: 0.4 });
  };
  return done(c.scene, c.camera, update);
}

// 2 — vocal cords from above: two pearly folds over a dark airway, open then slam shut. params: shutAt, open (start state)
function glottis(p) {
  const { scene, camera: cam } = setup({ top: '#2a0c10' });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 1.6, 48, 96), flesh('#c9616b', 4, { clearcoat: 1, clearcoatRoughness: 0.08 })); ring.rotation.x = Math.PI / 2; ring.scale.set(0.85, 1.15, 1); scene.add(ring);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3.4, 64), new THREE.MeshBasicMaterial({ color: '#080102' })); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.2; scene.add(floor);
  const foldM = wet('#e3cfc4', { clearcoat: 0.5, clearcoatRoughness: 0.2, sheen: 0.2, envMapIntensity: 0.15 });
  const folds = [-1, 1].map((s) => {
    const g = new THREE.Group(); g.position.set(0, 0, 2.6); scene.add(g); // hinge at the front
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 4.6, 12, 24), foldM); f.rotation.x = Math.PI / 2; f.position.set(s * 0.3, 0, -2.5); f.scale.set(1, 1, 0.55); g.add(f);
    const back = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 24), flesh('#d27a80', 3, { clearcoat: 1 })); back.position.set(s * 0.6, 0.1, -5.0); g.add(back);
    g.userData.s = s; return g;
  });
  const epi = new THREE.Mesh(new THREE.SphereGeometry(2.0, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2.4), flesh('#d97a85', 3, { clearcoat: 1, side: THREE.DoubleSide })); epi.position.set(0, 0.2, 3.4); epi.rotation.x = -1.2; epi.scale.set(1.2, 1, 0.5); scene.add(epi);
  const air = flow(path3([[0, 7, -0.5], [0, 2, -0.5], [0, -1.5, -0.5]]), 70, { r: 0.07, color: '#bfe8ff', spread: 1.0 }); scene.add(air);
  const flash = new THREE.PointLight('#ffffff', 0, 10, 1.5); flash.position.set(0, 3, 0); scene.add(flash);
  studio(scene, { target: [0, 0, 0], keyI: 14, keyPos: [-3, 10, 6] });
  const update = (t) => {
    const at = P(p, 'shutAt', 0.5), shut = seg(t, at, at + 0.04);
    const ang = lerp(P(p, 'open', 0.32), 0.0, shut) + (shut >= 1 ? 0.012 * Math.sin((t - at) * 120) * Math.max(0, 1 - (t - at) * 6) : 0);
    folds.forEach((g) => { g.rotation.y = -g.userData.s * ang; });
    air.visible = shut < 1; air.userData.update(t, { speed: 2.5 });
    flash.intensity = shut >= 1 ? Math.max(0, 1 - (t - at - 0.04) * 8) * 30 : 0;
    orbit(cam, p, t, { az0: 0.0, az1: 0.0, el0: 1.25, el1: 1.3, dist0: 17, dist1: 14 });
  };
  return done(scene, cam, update);
}

// 3 — record counter: big number rolling up to 68 with "YEARS", calendar pages flying. params: n0/n1
function counter(p) {
  const { scene, camera: cam } = setup({ top: '#141019' });
  const c = document.createElement('canvas'); c.width = 1024; c.height = 768; const x = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(8, 6), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); scene.add(panel);
  const pageM = new THREE.MeshPhysicalMaterial({ color: '#f1ece2', roughness: 0.7, side: THREE.DoubleSide });
  const pages = Array.from({ length: 40 }, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), pageM); scene.add(m); return m; });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.25), new THREE.MeshBasicMaterial({ color: '#d8322f', side: THREE.DoubleSide }));
  pages.forEach((m) => { const t2 = top.clone(); t2.position.y = 0.43; t2.position.z = 0.001; m.add(t2); });
  studio(scene, { target: [0, 0, 0], keyI: 12 });
  let last = -1;
  const update = (t) => {
    const n = Math.round(lerp(P(p, 'n0', 0), P(p, 'n1', 68), ease(t)));
    if (n !== last) {
      x.clearRect(0, 0, 1024, 768);
      x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = '380px Archivo'; x.lineWidth = 26; x.strokeStyle = '#000'; x.strokeText(String(n), 512, 330); x.fillStyle = '#ffd23f'; x.fillText(String(n), 512, 330);
      x.font = '150px Archivo'; x.lineWidth = 16; x.strokeText('YEARS', 512, 620); x.fillStyle = '#ffffff'; x.fillText('YEARS', 512, 620);
      tex.needsUpdate = true; last = n;
    }
    panel.scale.setScalar(1 + 0.04 * Math.sin(t * 30) * (n < P(p, 'n1', 68) ? 1 : 0));
    pages.forEach((m, i) => {
      const u = (rnd(i) + t * 0.9) % 1, a = rnd(i + 0.3) * Math.PI * 2;
      m.position.set(Math.cos(a) * (2 + u * 5), -4 + u * 10 + Math.sin(i) * 0.5, -2 + Math.sin(a) * 2.5);
      m.rotation.set(u * 6 + i, u * 4, u * 3);
    });
    orbit(cam, p, t, { az0: 0.15, az1: -0.1, el0: 0.05, el1: 0.05, dist0: 20, dist1: 17 });
  };
  return done(scene, cam, update);
}

run({ torso, glottis, counter });
