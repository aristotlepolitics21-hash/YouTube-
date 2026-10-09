// "Why do your ears pop on a plane?" — a plane climbing through clouds, and a cutaway of the ear:
// ear canal, eardrum, the air pocket of the middle ear with its three tiny bones, the cochlea, and
// the Eustachian tube down to the throat that pops open to let trapped air out.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, n3, orbit, done, setup, studio, cutaway, smooth, band, ellipse, slab,
  flow, label, path3, wet, glowMat, boneMat, flesh, C,
} from './lib_body.js';
import { run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// 1 — airliner climbing through clouds. params: climb (pitch), dist...
function plane(p) {
  const { scene, camera } = setup({ top: '#2f7fe0', bottom: '#cfe6ff' });
  const g = new THREE.Group(); scene.add(g);
  const white = new THREE.MeshPhysicalMaterial({ color: '#f4f6f8', roughness: 0.3, clearcoat: 0.8, envMapIntensity: 0.6 });
  const blue = new THREE.MeshPhysicalMaterial({ color: '#1f4fa8', roughness: 0.35, clearcoat: 0.6 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 9, 16, 48), white); body.rotation.z = Math.PI / 2; g.add(body);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.9, 32, 24), white); nose.scale.set(1.6, 1, 1); nose.position.x = 5; g.add(nose);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.905, 0.905, 9, 48, 1, true, 0, Math.PI * 0.25), blue); stripe.rotation.z = Math.PI / 2; stripe.rotation.x = 1.3; g.add(stripe);
  for (let i = 0; i < 16; i++) { const w = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.28, 0.1, 2, 0.06), new THREE.MeshPhysicalMaterial({ color: '#10161e', roughness: 0.1, clearcoat: 1 })); w.position.set(3.4 - i * 0.45, 0.3, 0.86); g.add(w); }
  const cock = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.3, 1.2, 2, 0.1), new THREE.MeshPhysicalMaterial({ color: '#10161e', roughness: 0.1, clearcoat: 1 })); cock.position.set(5.3, 0.45, 0); g.add(cock);
  const wingShape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-2.2, 0), new THREE.Vector2(-3.4, 5.6), new THREE.Vector2(-2.8, 5.6)]);
  for (const s of [1, -1]) {
    const w = new THREE.Mesh(new THREE.ExtrudeGeometry(wingShape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 }), white);
    w.rotation.x = s * Math.PI / 2; w.position.set(1.6, -0.35, 0); g.add(w);
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 1.5, 32), new THREE.MeshPhysicalMaterial({ color: '#c8ccd2', metalness: 0.6, roughness: 0.3 })); eng.rotation.z = Math.PI / 2; eng.position.set(0.6, -0.75, s * 2.2); g.add(eng);
    const tw = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-1.1, 0), new THREE.Vector2(-1.7, 2.0), new THREE.Vector2(-1.3, 2.0)]), { depth: 0.08, bevelEnabled: false }), white);
    tw.rotation.x = s * Math.PI / 2; tw.position.set(-4.0, 0.1, 0); g.add(tw);
  }
  const fin = new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-1.6, 0), new THREE.Vector2(-2.4, 2.6), new THREE.Vector2(-1.7, 2.6)]), { depth: 0.1, bevelEnabled: false }), blue);
  fin.position.set(-3.6, 0.5, -0.05); g.add(fin);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const cloudM = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.9, sheen: 1, sheenColor: new THREE.Color('#ffffff'), transparent: true, opacity: 0.92 });
  const clouds = Array.from({ length: 22 }, (_, i) => {
    const c = new THREE.Group();
    for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1.4 + rnd(i * 5 + k) * 1.2, 24, 16), cloudM); b.position.set(k * 1.4 - 2.8, rnd(i + k) * 0.6, (rnd(i * 3 + k) - 0.5) * 2); c.add(b); }
    c.userData = { x: (rnd(i) - 0.5) * 70, y: -12 + rnd(i + 0.4) * 18, z: -10 - rnd(i + 0.7) * 25 }; scene.add(c); return c;
  });
  studio(scene, { target: [0, 0, 0], key: '#ffffff', keyI: 16, keyPos: [6, 12, 10], rim: '#bfe0ff', hemi: 0.6, fill: '#bfe0ff' });
  const update = (t) => {
    const climb = P(p, 'climb', 0.25);
    g.rotation.set(0.05 * Math.sin(t * 3), 0, climb + 0.02 * Math.sin(t * 5));
    clouds.forEach((c) => { const u = c.userData; c.position.set(((u.x - t * 30 + 35) % 70 + 70) % 70 - 35, u.y - t * 6 * climb * 4, u.z); });
    orbit(camera, p, t, { az0: 0.5, az1: 0.35, el0: -0.05, el1: 0.02, dist0: 30, dist1: 26, tx0: 0.5, tx1: 0.5 });
  };
  return done(scene, camera, update);
}

// Ear cutaway (coronal, outside on the left). Returns parts and helpers.
function ear() {
  const outline = smooth([[-5.6, 3.4], [-6.6, 2.0], [-6.8, -0.4], [-6.1, -2.5], [-5.2, -2.9], [-4.9, -6.6], [6.2, -6.6], [6.4, 4.4], [-4.4, 4.7]], 300);
  const layers = [
    { name: 'bone', outline: smooth([[-2.2, 3.4], [1.6, 4.1], [5.6, 3.6], [6.0, -2.4], [3.6, -3.0], [1.6, -2.4], [-1.8, -1.9], [-2.6, 0.5]]), h: 0, flat: true, color: '#d9c39c' },
    { name: 'skin', outline: band([[-5.4, 3.6], [-6.45, 2.0], [-6.6, -0.4], [-5.9, -2.4], [-5.1, -2.8], [-4.8, -6.5]], 0.45), h: 0.08, color: '#d9a080' },
    { name: 'canal', outline: band([[-7.0, 0.25], [-4.8, 0.4], [-2.8, 0.35], [-1.2, 0.25]], (u) => 1.15 - u * 0.25), h: 0, color: '#2a0c10' },
    { name: 'middle', outline: smooth([[-1.0, 1.7], [0.7, 2.1], [1.7, 1.0], [1.5, -1.2], [0.6, -1.7], [-1.0, -1.2]]), h: 0, color: '#4a1a20' },
    { name: 'malleus', outline: band([[-0.95, 0.0], [-0.75, 0.9], [-0.25, 1.45]], 0.24), h: 0.14, color: '#f3ead8' },
    { name: 'incus', outline: band([[-0.25, 1.45], [0.35, 1.35], [0.55, 0.75]], 0.24), h: 0.14, color: '#f3ead8' },
    { name: 'stapes', outline: band([[0.55, 0.75], [1.0, 0.55], [1.45, 0.45]], 0.2), h: 0.14, color: '#f3ead8' },
    { name: 'canals', outline: band(Array.from({ length: 25 }, (_, i) => { const a = i / 24 * Math.PI * 1.8 + 0.6; return [2.7 + Math.cos(a) * 1.0, 2.7 + Math.sin(a) * 0.9]; }), 0.3), h: 0.16, color: '#e8a9b0' },
    { name: 'cochlea', outline: band(Array.from({ length: 60 }, (_, i) => { const a = i / 59 * Math.PI * 5, r = 1.5 - i / 59 * 1.15; return [3.4 + Math.cos(a) * r, 0.1 + Math.sin(a) * r]; }), (u) => 0.42 - u * 0.25, 240), h: 0.2, color: '#f0a8b4' },
    { name: 'nerve', outline: band([[3.6, 0.4], [5.0, 0.9], [6.3, 1.2]], 0.45), h: 0.12, color: C.nerve },
    { name: 'throat', outline: smooth([[4.2, -4.6], [6.3, -4.2], [6.3, -6.6], [4.6, -6.6]]), h: 0, color: '#2a0c10' },
  ];
  const cut = cutaway(outline, layers, { depth: 3, skin: '#d39a7c' });
  // eardrum: a pearly curved membrane closing the canal; bulge > 0 bows it out toward the canal
  const drumM = wet('#f6dcd0', { emissive: '#ff3020', emissiveIntensity: 0 });
  const drum = new THREE.Mesh(new THREE.BufferGeometry(), drumM); drum.position.z = 0.01; cut.group.add(drum);
  drum.userData.set = (bulge) => {
    drum.geometry.dispose();
    drum.geometry = new THREE.ExtrudeGeometry(new THREE.Shape(band([[-1.1, 1.45], [-1.15 - bulge * 0.9, 0.3], [-1.1, -0.95]], 0.17, 40)), { depth: 0.22, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2 });
  };
  drum.userData.set(0);
  // Eustachian tube: wall + lumen rebuilt each frame at the current width (shut ~ 0.1, open ~ 0.55)
  const ETP = [[0.6, -1.5], [1.6, -2.6], [3.0, -3.6], [4.6, -4.8]];
  const etM = new THREE.MeshPhysicalMaterial({ color: '#2a0c10', roughness: 0.3, clearcoat: 1 });
  const wallM = flesh('#c96570', 3, { clearcoat: 0.9, emissive: new THREE.Color('#ff1a1a'), emissiveIntensity: 0 });
  const et = new THREE.Mesh(new THREE.BufferGeometry(), etM), etWall = new THREE.Mesh(new THREE.BufferGeometry(), wallM);
  etWall.position.z = 0.006; cut.group.add(etWall, et);
  const setTube = (w, swell = 0) => {
    et.geometry.dispose(); etWall.geometry.dispose();
    const depth = 0.06 + swell * 0.15;
    et.geometry = new THREE.ShapeGeometry(new THREE.Shape(band(ETP, Math.max(0.03, w), 80))); et.position.z = depth + 0.12;
    etWall.geometry = new THREE.ExtrudeGeometry(new THREE.Shape(band(ETP, 0.8 + swell * 0.5, 80)), { depth, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
  };
  setTube(0.1);
  return { ...cut, drum, setTube, etM, wallM, ETP };
}

// 2 — the ear. params: bulge0/bulge1 (eardrum, + = pushed out toward the canal), air (trapped air jitter),
// thin (cabin air thins), open0/open1 (tube), flowOut, cold, sound (waves in the canal), labels
function earScene(p) {
  const { scene, camera } = setup({ top: '#1a1016' });
  const e = ear(); scene.add(e.group);
  // trapped air in the middle ear
  const airM = glowMat('#bfe8ff', 0.8);
  const inner = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 10, 8), airM, 40); inner.frustumCulled = false; scene.add(inner);
  const outer = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 10, 8), airM, 60); outer.frustumCulled = false; scene.add(outer);
  const escape = flow(path3(e.ETP.map(([x, y]) => [x, y, 0.25]).concat([[5.6, -5.6, 0.25]])), 40, { r: 0.09, mat: airM, spread: 0.12 }); scene.add(escape);
  const waveM = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
  const waves = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 48, 1, -0.9, 1.8), waveM.clone()); scene.add(m); return m; });
  const labs = [['EARDRUM', '#ffb3a0', [-1.2, 1.2, 0.3], [-1.2, 3.6, 0.6]], ['AIR POCKET', '#bfe8ff', [0.4, -1.0, 0.3], [0.4, -3.3, 0.6]], ['EUSTACHIAN TUBE', '#ff8a8a', [2.6, -3.3, 0.3], [2.6, -5.6, 0.6]]]
    .map(([s, c, a, b]) => { const l = label(s, { color: c, size: 0.5 }); scene.add(l); return { l, a: new THREE.Vector3(...a), b: new THREE.Vector3(...b) }; });
  studio(scene, { target: [0, 0, 0], keyI: 14, keyPos: [-5, 8, 12] });
  const d = new THREE.Object3D();
  const update = (t) => {
    const bulge = lerp(P(p, 'bulge0', 0), P(p, 'bulge1', 0), ease(t));
    e.drum.userData.set(bulge);
    e.drum.material.emissiveIntensity = Math.max(0, bulge) * 0.6 * P(p, 'hurt', 1);
    const open = lerp(P(p, 'open0', 0), P(p, 'open1', 0), ease(seg(t, 0, 0.35))), cold = P(p, 'cold', 0);
    e.setTube(lerp(0.1, 0.55, open) * (1 - cold * 0.9), cold);
    e.wallM.emissiveIntensity = cold * (0.5 + 0.2 * Math.sin(t * 20)) + P(p, 'tubeGlow', 0) * (0.35 + 0.2 * Math.sin(t * 20));
    const press = 0.5 + Math.max(0, bulge);
    for (let i = 0; i < 40; i++) {
      const a = rnd(i) * Math.PI * 2, r = rnd(i + 0.3) * 1.2;
      d.position.set(0.35 + Math.cos(a) * r * 0.9 + 0.12 * Math.sin(t * 30 * press + i), 0.25 + Math.sin(a) * r * 1.2 + 0.12 * Math.cos(t * 27 * press + i), 0.2);
      d.scale.setScalar(P(p, 'air', 1) ? 1 : 0); d.updateMatrix(); inner.setMatrixAt(i, d.matrix);
    }
    inner.instanceMatrix.needsUpdate = true;
    const thin = lerp(P(p, 'thin0', 0), P(p, 'thin1', 0), ease(t));
    for (let i = 0; i < 60; i++) {
      const on = rnd(i + 0.5) > thin * 0.8;
      d.position.set(-6.8 + rnd(i) * 5.4 + 0.1 * Math.sin(t * 8 + i), 0.3 + (rnd(i + 0.3) - 0.5) * 0.8, 0.2);
      d.scale.setScalar(on && P(p, 'air', 1) ? 1 : 0); d.updateMatrix(); outer.setMatrixAt(i, d.matrix);
    }
    outer.instanceMatrix.needsUpdate = true;
    escape.visible = !!P(p, 'flowOut', 0) && open > 0.5; escape.userData.update(t, { speed: 1.4 });
    waves.forEach((m, i) => { const u = (t * 1.5 + i / 4) % 1; m.visible = !!P(p, 'sound', 0); m.position.set(-6.6 + u * 5.2, 0.3, 0.2); m.scale.setScalar(0.8 + u * 0.6); m.material.opacity = 0.6 * (1 - u) * (1 - P(p, 'muffle', 0) * Math.min(1, u * 2.5)); });
    labs.forEach((o, i) => o.l.userData.place(o.a, o.b, P(p, `l${i}`, 0) ? seg(t, 0.1, 0.25) : 0));
    orbit(camera, p, t, { az0: 0.25, az1: 0.15, el0: 0.08, el1: 0.05, dist0: 44, dist1: 40, tx0: -0.3, tx1: -0.3, ty0: -0.8, ty1: -0.8 });
  };
  return done(scene, camera, update);
}

run({ plane, ear: earScene });
