// "What happens if you swallow a button battery?" — a coin vs a button battery, both swallowed in
// a head cutaway (the coin passes, the battery sticks), a close-up of the food pipe where current
// through wet tissue makes an alkaline burn, a two-hour clock, and batteries locked away.
import {
  THREE, ease, lerp, clamp01, seg, P, rnd, orbit, done, setup, studio, headSection, flow, label,
  path3, wet, glowMat, C, n3, displace,
} from './lib_body.js';
import { run } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const metal = (color, rough = 0.22) => new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: rough, clearcoat: 0.4, envMapIntensity: 0.55 });

// Button cell: wide flat can (+, with engraving) and a narrower raised negative cap
function buttonCell(r = 1) {
  const g = new THREE.Group();
  const pts = [[0, -0.16], [0.97, -0.16], [1, -0.13], [1, 0.12], [0.97, 0.16], [0.8, 0.16], [0.78, 0.18], [0.78, 0.26], [0.74, 0.29], [0, 0.29]].map(([x, y]) => new THREE.Vector2(x * r, y * r));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 128), metal('#c9ccd1', 0.18)); g.add(body);
  const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#b8bcc2'; x.fillRect(0, 0, 512, 512); x.fillStyle = '#6f747c'; x.font = '900 120px Archivo'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('+', 256, 150); x.font = '900 90px Archivo'; x.fillText('CR2032', 256, 300); x.font = '700 50px Archivo'; x.fillText('3V', 256, 400);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.93 * r, 96), new THREE.MeshPhysicalMaterial({ map: tex, metalness: 1, roughness: 0.25, bumpMap: tex, bumpScale: -2 }));
  face.rotation.x = Math.PI / 2; face.position.y = -0.161 * r; g.add(face);
  const ins = new THREE.Mesh(new THREE.TorusGeometry(0.79 * r, 0.025 * r, 8, 96), new THREE.MeshPhysicalMaterial({ color: '#1a1a1a', roughness: 0.6 }));
  ins.rotation.x = Math.PI / 2; ins.position.y = 0.17 * r; g.add(ins);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function coin(r = 1) {
  const g = new THREE.Group();
  const m = metal('#a8703c', 0.4); m.envMapIntensity = 0.25;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.14 * r, 128, 1), m); g.add(body);
  for (const s of [1, -1]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 0.94, 0.03 * r, 8, 96), m); rim.rotation.x = Math.PI / 2; rim.position.y = s * 0.07 * r; g.add(rim); }
  const relief = new THREE.Mesh(new THREE.CircleGeometry(r * 0.6, 64), metal('#c88a4c', 0.35)); relief.rotation.x = -Math.PI / 2; relief.position.y = 0.072 * r; g.add(relief);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// 1 — hero: the battery (and optionally a coin) turning in light. params: show 'battery'|'both', alarm
function hero(p) {
  const { scene, camera } = setup({ top: '#141019' });
  const bat = buttonCell(1.4); scene.add(bat);
  const cn = coin(1.25); scene.add(cn);
  const both = P(p, 'show', 'battery') === 'both';
  cn.visible = both;
  studio(scene, { target: [0, 0, 0], keyI: 14, rim: '#6fb8ff', keyPos: [-5, 8, 8] });
  const alarm = new THREE.PointLight('#ff2020', 0, 10, 1.4); alarm.position.set(2, 2, 3); scene.add(alarm);
  const update = (t) => {
    bat.position.set(both ? 1.6 : 0, 0.2 + 0.15 * Math.sin(t * 4), 0); bat.rotation.set(-1.15, t * 1.6 + 0.4, 0.25);
    cn.position.set(-1.7, 0.2 + 0.15 * Math.sin(t * 4 + 1), 0); cn.rotation.set(1.2, -t * 1.4, -0.2);
    alarm.intensity = P(p, 'alarm', 0) * (14 + 10 * Math.sin(t * 25));
    orbit(camera, p, t, { az0: 0.2, az1: -0.2, el0: 0.3, el1: 0.18, dist0: both ? 28 : 18, dist1: both ? 25 : 15 });
  };
  return done(scene, camera, update);
}

// Swallow path: from the lips, over the tongue, down the throat and the food pipe
const SW = path3([[4.4, -1.3], [3.0, -0.9], [1.6, -0.85], [0.6, -1.4], [0.45, -3.0], [0.33, -4.4], [0.12, -5.6], [0.05, -7.4], [0.05, -10.5]].map(([x, y]) => [x, y, 0.32]));

// 2 — head cutaway, the object travels down. params: obj 'coin'|'battery', u0/u1 along the path, stuck (glow)
function swallow(p) {
  const { scene, camera } = setup();
  const h = headSection(); scene.add(h.group);
  studio(scene, { target: [0.5, -3, 0] });
  const objM = P(p, 'obj', 'coin') === 'coin' ? coin(0.5) : buttonCell(0.5);
  scene.add(objM);
  const objL = new THREE.PointLight('#ffffff', 1.5, 3, 1.5); scene.add(objL);
  const eso = h.parts.esophagus; eso.material = eso.material.clone(); eso.material.emissive = new THREE.Color('#ff2a10'); eso.material.emissiveIntensity = 0;
  const q = new THREE.Vector3(), tg = new THREE.Vector3();
  const update = (t) => {
    const u = lerp(P(p, 'u0', 0), P(p, 'u1', 1), ease(t));
    SW.getPointAt(Math.min(1, u), q); SW.getTangentAt(Math.min(1, u), tg);
    objM.position.copy(q); objL.position.copy(q).setZ(1.5); objM.rotation.set(Math.PI / 2, 0, Math.atan2(tg.y, tg.x) + Math.PI / 2);
    if (P(p, 'jiggle', 0)) objM.position.x += 0.03 * Math.sin(t * 60);
    eso.material.emissiveIntensity = P(p, 'stuck', 0) * seg(t, 0.3, 1) * (0.8 + 0.3 * Math.sin(t * 30));
    const follow = P(p, 'follow', 0);
    const d = { az0: 0.32, az1: 0.26, el0: 0.06, el1: 0.03, dist0: 44, dist1: 40, ty0: -2.2, ty1: -2.6, tx0: 0.5, tx1: 0.5 };
    if (follow) Object.assign(d, { tx0: q.x + 0.3, tx1: q.x + 0.3, ty0: q.y + 0.6, ty1: q.y, dist0: 19, dist1: 16 });
    orbit(camera, p, t, d);
  };
  return done(scene, camera, update);
}

// 3 — food-pipe close-up: half tube cut lengthwise with the battery wedged inside.
// params: current (0..1 arcs between the poles), burn (0..1 dark alkaline damage on the wall)
function stuck(p) {
  const { scene, camera } = setup({ top: '#22080c' });
  const R = 1.6, L = 14, segs = 260, radial = 96;
  const g = new THREE.BufferGeometry(), pos = [], uv = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const y = -L / 2 + (i / segs) * L, bulge = 1 + 0.12 * Math.exp(-(y * y) / 2);
    for (let j = 0; j <= radial; j++) {
      const a = Math.PI * (j / radial) + Math.PI, r = R * bulge * (1 + 0.06 * Math.sin(a * 9 + y * 2) + 0.04 * n3(y, j * 0.15, 0));
      pos.push(Math.cos(a) * r, y, Math.sin(a) * r * 0.9); uv.push(j / radial, i / segs);
    }
  }
  for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) { const a = i * (radial + 1) + j, b = a + radial + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  // burn map painted on a canvas: a dark spreading stain around the negative side (left wall)
  const bc = document.createElement('canvas'); bc.width = 512; bc.height = 1024; const bx = bc.getContext('2d');
  const btex = new THREE.CanvasTexture(bc); btex.colorSpace = THREE.SRGBColorSpace;
  const wallM = wet('#d36a72', { side: THREE.DoubleSide, map: btex });
  const wall = new THREE.Mesh(g, wallM); wall.receiveShadow = true; scene.add(wall);
  const paint = (k) => {
    bx.fillStyle = '#ffffff'; bx.fillRect(0, 0, 512, 1024);
    if (k <= 0) { btex.needsUpdate = true; return; }
    for (let i = 0; i < 40; i++) {
      const cx = 200 + (rnd(i) - 0.5) * 200 * k, cy = 512 + (rnd(i + 0.3) - 0.5) * 520 * k, r = (40 + rnd(i + 0.6) * 110) * k;
      const gr = bx.createRadialGradient(cx, cy, 0, cx, cy, r);
      gr.addColorStop(0, `rgba(30,12,10,${0.95 * k})`); gr.addColorStop(0.6, `rgba(80,26,20,${0.7 * k})`); gr.addColorStop(1, 'rgba(120,40,40,0)');
      bx.fillStyle = gr; bx.beginPath(); bx.arc(cx, cy, r, 0, Math.PI * 2); bx.fill();
    }
    btex.needsUpdate = true;
  };
  const bat = buttonCell(1.25); bat.rotation.set(0, -0.7, Math.PI / 2 - 0.12); bat.position.set(0, 0, -0.55); scene.add(bat);
  // saliva film
  const salM = new THREE.MeshPhysicalMaterial({ color: '#dff4ff', roughness: 0.02, transmission: 0.8, thickness: 0.2, clearcoat: 1, transparent: true, opacity: 0.5 });
  for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.08 + rnd(i) * 0.12, 16, 12), salM); d.position.set((rnd(i + 0.2) - 0.5) * 2.6, (rnd(i + 0.4) - 0.5) * 3.6, -1.1 - rnd(i + 0.6) * 0.3); scene.add(d); }
  // current arcs: jagged glowing lines from the + face to the - side through the wall
  const arcM = new THREE.MeshBasicMaterial({ color: '#8fe8ff', transparent: true, opacity: 0.9 });
  const arcs = Array.from({ length: 7 }, () => { const m = new THREE.Mesh(new THREE.BufferGeometry(), arcM); scene.add(m); return m; });
  const makeArc = (i, t) => {
    const a0 = (i / 7) * Math.PI * 2 + t * 3, pts = [];
    for (let k = 0; k <= 8; k++) {
      const u = k / 8, ang = a0 + u * 0.6, r = 1.35 + Math.sin(u * Math.PI) * 0.5;
      pts.push(new THREE.Vector3(lerp(0.3, -0.35, u) + (rnd(i * 13 + k + Math.floor(t * 24)) - 0.5) * 0.18, Math.cos(ang) * r * 0.9, -0.55 + Math.sin(ang) * r * 0.5 + (rnd(i * 7 + k) - 0.5) * 0.15));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.025, 5);
  };
  // fizz where the chemical forms
  const fizz = flow(path3([[-1.3, -1.0, -0.9], [-1.0, 0.6, -0.6], [-0.4, 2.4, 0.2]]), 50, { r: 0.05, color: '#f2fff0', spread: 0.8 }); scene.add(fizz);
  studio(scene, { target: [0, 0, -0.6], keyPos: [-3, 6, 10], keyI: 14 });
  const blue = new THREE.PointLight('#6fd8ff', 0, 8, 1.5); blue.position.set(0, 0, 1.5); scene.add(blue);
  const update = (t) => {
    const cur = P(p, 'current', 0), burn = clamp01(lerp(P(p, 'burn0', 0), P(p, 'burn1', 0), ease(t)));
    arcs.forEach((m, i) => { m.visible = cur > 0 && rnd(i + Math.floor(t * 30) * 0.17) < 0.8; if (m.visible) { m.geometry.dispose(); m.geometry = makeArc(i, t); } });
    blue.intensity = cur * (10 + 8 * Math.sin(t * 50));
    paint(burn);
    fizz.visible = burn > 0.05; fizz.userData.update(t, { speed: 0.6, scale: Math.min(1, burn * 2) });
    bat.position.x = 0.02 * Math.sin(t * 40) * P(p, 'jiggle', 0);
    orbit(camera, p, t, { az0: -0.25, az1: 0.15, el0: 0.15, el1: 0.08, dist0: 16, dist1: 13.5, tz: -0.5 });
  };
  return done(scene, camera, update);
}

// 4 — two-hour clock: dial with a red sweep filling up. params: hours (0..2 at end)
function clock(p) {
  const { scene, camera } = setup({ top: '#140c10' });
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.4, 128), new THREE.MeshPhysicalMaterial({ color: '#b9b3a9', roughness: 0.5, clearcoat: 0.3, envMapIntensity: 0.3 }));
  dial.rotation.x = Math.PI / 2; scene.add(dial);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.22, 24, 128), metal('#2a2a2e', 0.3)); scene.add(bezel);
  for (let i = 0; i < 12; i++) { const tk = new THREE.Mesh(new RoundedBoxGeometry(0.12, i % 3 ? 0.35 : 0.6, 0.06, 2, 0.03), new THREE.MeshPhysicalMaterial({ color: '#1b1b1b' })); const a = (i / 12) * Math.PI * 2; tk.position.set(Math.sin(a) * 2.55, Math.cos(a) * 2.55, 0.23); tk.rotation.z = -a; scene.add(tk); }
  const sweepM = new THREE.MeshBasicMaterial({ color: '#ff2b2b', transparent: true, opacity: 0.55 });
  const sweep = new THREE.Mesh(new THREE.CircleGeometry(2.4, 96, Math.PI / 2, 0.001), sweepM); sweep.position.z = 0.215; scene.add(sweep);
  const hand = (len, w, col) => { const m = new THREE.Mesh(new RoundedBoxGeometry(w, len, 0.06, 2, w / 3), new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.3 })); m.geometry.translate(0, len / 2 - 0.2, 0); m.position.z = 0.28; scene.add(m); return m; };
  const hourH = hand(1.6, 0.18, '#1b1b1b'), minH = hand(2.3, 0.11, '#1b1b1b');
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 24), metal('#c0303a')); pin.rotation.x = Math.PI / 2; pin.position.z = 0.33; scene.add(pin);
  studio(scene, { target: [0, 0, 0], keyI: 14, keyPos: [-4, 6, 10] });
  const update = (t) => {
    const hrs = lerp(P(p, 'h0', 0), P(p, 'h1', 2), ease(t));
    minH.rotation.z = -hrs * Math.PI * 2; hourH.rotation.z = -(hrs / 12) * Math.PI * 2 - 0.0;
    sweep.geometry.dispose(); sweep.geometry = new THREE.CircleGeometry(2.4, 96, Math.PI / 2 - (hrs / 12) * Math.PI * 2, (hrs / 12) * Math.PI * 2 + 0.0001);
    sweepM.opacity = 0.45 + 0.2 * Math.sin(t * 20) * seg(hrs, 1.6, 2);
    orbit(camera, p, t, { az0: 0.35, az1: 0.1, el0: 0.12, el1: 0.05, dist0: 27, dist1: 23 });
  };
  return done(scene, camera, update);
}

// 5 — batteries in a locked box: a blister pack of cells and a padlock that snaps shut. params: lockAt
function locked(p) {
  const { scene, camera } = setup({ top: '#0f1418' });
  const box = new THREE.Group(); scene.add(box);
  const boxM = new THREE.MeshPhysicalMaterial({ color: '#2b3540', roughness: 0.35, metalness: 0.3, clearcoat: 0.6 });
  const base = new THREE.Mesh(new RoundedBoxGeometry(6, 1.6, 4, 4, 0.2), boxM); base.position.y = -0.8; box.add(base);
  const lid = new THREE.Group(); lid.position.set(0, 0, -2); box.add(lid);
  const lidM = new THREE.Mesh(new RoundedBoxGeometry(6.1, 0.4, 4.1, 4, 0.18), boxM); lidM.position.set(0, 0.2, 2); lid.add(lidM);
  for (let i = 0; i < 4; i++) { const c = buttonCell(0.55); c.position.set(-1.8 + i * 1.2, -0.05, 0.3); c.rotation.x = 0.25; box.add(c); }
  const lock = new THREE.Group(); lock.position.set(0, -0.8, 2.15); box.add(lock);
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.2, 1.0, 0.45, 4, 0.15), metal('#d6b04a', 0.3)); lock.add(body);
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.09, 16, 48, Math.PI), metal('#cfd3d8', 0.2)); lock.add(shackle);
  const legs = [-0.4, 0.4].map((x) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.5, 16), shackle.material); l.position.set(x, 0.4, 0); lock.add(l); return l; });
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), new THREE.MeshBasicMaterial({ color: '#111' })); hole.position.set(0, -0.1, 0.23); lock.add(hole);
  studio(scene, { target: [0, -0.5, 0], keyI: 14, rim: '#5fd0ff', keyPos: [-5, 9, 9] });
  const green = new THREE.PointLight('#4dff9a', 0, 8, 1.5); green.position.set(0, 1.5, 4); scene.add(green);
  const update = (t) => {
    const close = ease(seg(t, 0.05, 0.4)), snap = seg(t, P(p, 'lockAt', 0.5), P(p, 'lockAt', 0.5) + 0.08);
    lid.rotation.x = -lerp(1.25, 0, close);
    const up = 0.35 * (1 - snap); shackle.position.y = 0.65 + up; legs.forEach((l) => { l.position.y = 0.4 + up; });
    lock.visible = close > 0.95;
    green.intensity = snap * 12;
    box.rotation.y = -0.4 + t * 0.3;
    orbit(camera, p, t, { az0: 0.2, az1: 0.0, el0: 0.5, el1: 0.4, dist0: 23, dist1: 19, ty0: -0.3, ty1: -0.3 });
  };
  return done(scene, camera, update);
}

run({ hero, swallow, stuck, clock, locked });
