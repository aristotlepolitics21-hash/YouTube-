// Six 3D shots for "What happens when you crack your knuckles?":
// a hand curling into a fist, an X-ray finger with its joint capsules, then a
// macro view inside one joint where the bones separate and a gas bubble pops.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { n3, ease, lerp, flesh, displace, baseScene, cam, spot, fineNormal, run } from './lib3d.js';

const easeOutBack = (t) => { const c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const seg = (t, a, b) => clamp01((t - a) / (b - a));

// ---------- materials ----------
const skinMat = () => flesh('#c88a6c', 2, {
  clearcoat: 0.2, clearcoatRoughness: 0.5, normalScale: new THREE.Vector2(0.15, 0.15),
  sheen: 0.5, sheenColor: new THREE.Color('#ffb092'),
});
const nailMat = () => new THREE.MeshPhysicalMaterial({ color: '#f1c9bd', roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.6 });
function boneMat(opts = {}) {
  const nm = fineNormal.clone(); nm.repeat.set(3, 3); nm.needsUpdate = true;
  return new THREE.MeshPhysicalMaterial({ color: '#d8c49c', roughness: 0.72, normalMap: nm, normalScale: new THREE.Vector2(0.4, 0.4), envMapIntensity: 0.4, ...opts });
}
const cartilageMat = () => new THREE.MeshPhysicalMaterial({
  color: '#b9d0f0', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04, sheen: 0.5, sheenColor: new THREE.Color('#ffffff'), envMapIntensity: 0.8,
});
const xraySkin = (color = '#6fa8ff') => new THREE.MeshPhysicalMaterial({
  color, emissive: color, emissiveIntensity: 0.15, roughness: 0.3, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide,
});
const capsuleMat = (color = '#ffd977') => new THREE.MeshPhysicalMaterial({
  color, emissive: color, emissiveIntensity: 0.35, roughness: 0.2, clearcoat: 1, transparent: true, opacity: 0.5, depthWrite: false,
});

// ---------- finger / hand ----------
// Phalanx bone: lathe with flared ends and a narrow waist, closed at both ends.
function phalanx(L, r) {
  const pts = [new THREE.Vector2(0, 0)];
  for (let i = 0; i <= 24; i++) {
    const v = i / 24, y = v * L;
    const flare = 1 - 0.3 * Math.sin(Math.PI * v);
    const cap = Math.sin((Math.PI / 2) * Math.min(1, Math.min(v, 1 - v) * 7)) + 0.04;
    pts.push(new THREE.Vector2(r * flare * Math.sqrt(Math.max(0.02, cap)), y));
  }
  pts.push(new THREE.Vector2(0, L));
  const g = new THREE.LatheGeometry(pts, 48);
  g.computeVertexNormals();
  return g;
}

// A finger is a chain of joint groups; rotating joints[k].rotation.x curls it toward +z.
function finger({ lengths = [1.7, 1.1, 0.85], radius = 0.43, xray = false, mats } = {}) {
  const root = new THREE.Group(), joints = [], capsules = [];
  let parent = root;
  lengths.forEach((L, k) => {
    const j = new THREE.Group(); parent.add(j); joints.push(j);
    const r = radius * (1 - k * 0.09);
    const skin = new THREE.Mesh(new THREE.CapsuleGeometry(r, L, 12, 40), mats.skin);
    skin.position.y = L / 2; skin.castShadow = skin.receiveShadow = !xray; j.add(skin);
    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(r * 1.08, 40, 24), mats.skin);
    knuckle.scale.set(1, 0.8, 1.05); j.add(knuckle);
    if (mats.bone) {
      const b = new THREE.Mesh(phalanx(L * 0.9, r * 0.72), mats.bone);
      b.position.y = L * 0.05; j.add(b);
      const cap = new THREE.Mesh(new THREE.SphereGeometry(r * 0.62, 40, 24), mats.capsule);
      cap.scale.set(1, 0.75, 1); j.add(cap); capsules.push(cap);
    }
    if (k === lengths.length - 1 && mats.nail) {
      const nail = new THREE.Mesh(new RoundedBoxGeometry(r * 1.25, L * 0.62, 0.12, 4, 0.05), mats.nail);
      nail.position.set(0, L * 0.62, -r * 0.93); nail.rotation.x = 0.08; j.add(nail);
    }
    const next = new THREE.Group(); next.position.y = L; j.add(next); parent = next;
  });
  return { root, joints, capsules };
}

function hand() {
  const mats = { skin: skinMat(), nail: nailMat() };
  const g = new THREE.Group();
  const pg = new THREE.SphereGeometry(1, 96, 64);
  const pp = pg.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const y = pp.getY(i), sq = 1 + 0.25 * (1 - y * y); // squarer sides, rounded top/bottom
    pp.setXYZ(i, pp.getX(i) * 1.85 * Math.min(1.15, sq), y * 2.5, pp.getZ(i) * 0.55);
  }
  pg.computeVertexNormals();
  displace(pg, (v) => 0.04 * n3(v.x * 0.8, v.y * 0.8, v.z * 0.8));
  const palm = new THREE.Mesh(pg, mats.skin); palm.castShadow = palm.receiveShadow = true; g.add(palm);
  const wrist = new THREE.Mesh(new THREE.CapsuleGeometry(1.35, 5, 12, 48), mats.skin);
  wrist.scale.z = 0.7; wrist.position.y = -4.6; wrist.castShadow = wrist.receiveShadow = true; g.add(wrist);
  const fingers = [];
  const spec = [[-1.45, [1.45, 0.95, 0.75], 0.4], [-0.5, [1.75, 1.1, 0.85], 0.44], [0.48, [1.85, 1.15, 0.85], 0.45], [1.42, [1.7, 1.05, 0.8], 0.43]];
  for (const [x, lengths, radius] of spec) {
    const f = finger({ lengths, radius, mats });
    f.root.position.set(x, 2.2 - Math.abs(x) * 0.12, 0); f.root.rotation.z = -x * 0.035;
    g.add(f.root); fingers.push(f);
  }
  const thumb = finger({ lengths: [1.3, 0.95], radius: 0.5, mats });
  thumb.root.position.set(-2.1, -0.6, 0.35); thumb.root.rotation.z = 0.75; thumb.root.rotation.y = -0.5;
  g.add(thumb.root);
  return { group: g, fingers, thumb };
}

// ---------- shots ----------

// 1 — back of a hand curling into a fist, knuckles to camera
function shotHook() {
  const scene = baseScene('#120a08', 0.02);
  const camera = cam(30);
  const h = hand(); scene.add(h.group);
  h.group.rotation.set(0.25, 0, 0); // camera sits behind the hand: fingers curl away, knuckles forward
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#1a100c', roughness: 0.8 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -5; floor.receiveShadow = true; scene.add(floor);
  spot(scene, '#ffe6d6', 260, [5, 10, -10], [0, 1.5, 0], 0.7);
  spot(scene, '#ff9a6a', 120, [-8, 2, 6], [0, 1.5, 0], 0.7, false);
  scene.add(new THREE.HemisphereLight('#ffe0d0', '#140806', 0.35));
  const update = (t) => {
    const k = ease(t), curl = lerp(0.15, 1.35, ease(seg(t, 0.05, 0.85)));
    h.fingers.forEach((f, i) => {
      f.joints[0].rotation.x = curl * (0.9 + i * 0.04);
      f.joints[1].rotation.x = curl * 1.1;
      f.joints[2].rotation.x = curl * 0.75;
    });
    h.thumb.joints[0].rotation.x = curl * 0.35; h.thumb.joints[1].rotation.x = curl * 0.4;
    camera.position.set(lerp(1.2, 0.6, k), lerp(11, 9, k), lerp(-12.5, -9.5, k));
    camera.lookAt(0, 2.4, 0);
  };
  return { scene, camera, update };
}

// X-ray finger used by shots 2 and 6
function xrayFinger(tint, capsuleColor) {
  const mats = { skin: xraySkin(tint), bone: boneMat({ emissive: '#ffffff', emissiveIntensity: 0.08 }), capsule: capsuleMat(capsuleColor) };
  const f = finger({ lengths: [2.6, 1.7, 1.25], radius: 0.62, xray: true, mats });
  const meta = new THREE.Mesh(phalanx(4, 0.55), mats.bone); meta.position.y = -4.2; f.root.add(meta);
  const metaSkin = new THREE.Mesh(new THREE.CapsuleGeometry(0.75, 3.4, 12, 40), mats.skin); metaSkin.position.y = -2.2; f.root.add(metaSkin);
  const metaCap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 24), mats.capsule); metaCap.scale.set(1, 0.75, 1); f.root.add(metaCap);
  f.capsules.unshift(metaCap);
  f.joints[0].rotation.x = 0.25; f.joints[1].rotation.x = 0.35; f.joints[2].rotation.x = 0.2;
  return f;
}

// 2 — X-ray finger, joint capsules glowing
function shotXray() {
  const scene = baseScene('#03102a', 0.015);
  const camera = cam(30);
  const f = xrayFinger('#6fa8ff', '#ffd977'); scene.add(f.root);
  f.root.position.y = -1.5;
  spot(scene, '#cfe2ff', 200, [6, 8, 10], [0, 1, 0], 0.8, false);
  spot(scene, '#5f8cff', 120, [-8, -2, -6], [0, 1, 0], 0.8, false);
  scene.add(new THREE.HemisphereLight('#bcd4ff', '#020812', 0.6));
  const update = (t) => {
    const k = ease(t);
    f.capsules.forEach((c, i) => { c.material.emissiveIntensity = 0.3 + (i === 1 ? 0.5 * (0.5 + 0.5 * Math.sin(t * 12)) : 0); });
    const a = lerp(-0.9, -0.5, k);
    camera.position.set(Math.cos(a) * lerp(22, 16, k), lerp(3, 2.5, k), -Math.sin(a) * lerp(22, 16, k));
    camera.lookAt(0, 1.5, 0);
  };
  return { scene, camera, update };
}

// Macro view inside one joint, shared by shots 3–5.
// opts(t) -> { gap, bubble (0..1+), shock (0..1 or null), arrows (0..1) }
function shotJoint(opts, camPath) {
  return () => {
    const scene = baseScene('#170d04', 0.045);
    const camera = cam(40);
    const bone = boneMat(), cart = cartilageMat();
    // upper bone: rounded head with a cartilage cap on its underside
    const upper = new THREE.Group(); scene.add(upper);
    const head = new THREE.Mesh(new THREE.SphereGeometry(2.2, 96, 64), bone); head.scale.y = 0.8; head.position.y = 1.76; upper.add(head);
    const capU = new THREE.Mesh(new THREE.SphereGeometry(2.27, 96, 48, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), cart);
    capU.scale.y = 0.8; capU.position.y = 1.76; upper.add(capU);
    const shaftU = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.7, 9, 64), bone); shaftU.position.y = 6.2; upper.add(shaftU);
    // lower bone: rounded head mirroring the upper one, cartilage on its top
    const lower = new THREE.Group(); scene.add(lower);
    const base = new THREE.Mesh(new THREE.SphereGeometry(2.3, 96, 64), bone); base.scale.y = 0.6; base.position.y = -1.38; lower.add(base);
    const disc = new THREE.Mesh(new THREE.SphereGeometry(2.37, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2), cart);
    disc.scale.y = 0.6; disc.position.y = -1.38; lower.add(disc);
    const shaftL = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.3, 9, 64), bone); shaftL.position.y = -6; lower.add(shaftL);
    for (const m of [head, shaftU, base, shaftL]) {
      m.geometry = m.geometry.clone();
      displace(m.geometry, (v) => 0.09 * n3(v.x * 0.9, v.y * 0.9, v.z * 0.9) + 0.03 * n3(v.x * 3, v.y * 3, v.z * 3));
    }
    [head, capU, shaftU, base, disc, shaftL].forEach((m) => { m.castShadow = m.receiveShadow = true; });
    // joint capsule wall around everything
    const wallG = new THREE.SphereGeometry(7, 96, 64);
    displace(wallG, (v) => 0.4 * n3(v.x * 0.4, v.y * 0.4, v.z * 0.4));
    const wall = new THREE.Mesh(wallG, flesh('#b8775c', 3, { side: THREE.BackSide })); wall.scale.y = 1.5; scene.add(wall);
    // floating specks in the synovial fluid
    const speckM = new THREE.MeshPhysicalMaterial({ color: '#ffe7a0', emissive: '#ffcf5a', emissiveIntensity: 0.4, roughness: 0.3, transparent: true, opacity: 0.7 });
    const specks = Array.from({ length: 90 }, (_, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.025 + (i % 7) * 0.008, 8, 6), speckM);
      m.userData = { a: (i * 2.39996) % (Math.PI * 2), r: 2.4 + (i % 11) * 0.3, y: ((i * 0.618) % 1) * 6 - 3, s: 0.2 + (i % 5) * 0.08 };
      scene.add(m); return m;
    });
    // gas bubble + shock ring
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshPhysicalMaterial({
      color: '#ffffff', roughness: 0, transmission: 1, thickness: 0.2, ior: 1.0, iridescence: 1, iridescenceIOR: 1.6,
      clearcoat: 1, envMapIntensity: 2.5, transparent: true,
    }));
    scene.add(bubble);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.04, 16, 128), new THREE.MeshBasicMaterial({ color: '#fff4c0', transparent: true }));
    ring.rotation.x = Math.PI / 2; scene.add(ring);
    // pull arrows
    const arrowM = new THREE.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ffb000', emissiveIntensity: 0.6, roughness: 0.4 });
    const arrows = [1, -1].map((s) => {
      const a = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.6, 24), arrowM); shaft.position.y = 0.8 * s;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.8, 32), arrowM); tip.position.y = 2 * s; if (s < 0) tip.rotation.x = Math.PI;
      a.add(shaft, tip); a.position.x = 3.3; scene.add(a); return a;
    });
    spot(scene, '#ffe8cc', 110, [6, 7, 7], [0, 0, 0], 0.7);
    const gapLight = new THREE.PointLight('#ffcf6a', 10, 8, 1.5); scene.add(gapLight);
    spot(scene, '#ff8a5a', 80, [-7, -4, -5], [0, 0, 0], 0.8, false);
    scene.add(new THREE.HemisphereLight('#ffd9a8', '#160a02', 0.12));

    const update = (t) => {
      const o = opts(t);
      upper.position.y = o.gap / 2; lower.position.y = -o.gap / 2;
      gapLight.position.set(1.5, 0, 2);
      const b = Math.max(0.0001, o.bubble);
      bubble.scale.set(b * 1.25, b * 0.9 * Math.max(0.35, o.gap / 1.9), b * 1.25);
      bubble.visible = o.bubble > 0.01;
      if (o.shock !== null && o.shock < 1) {
        ring.visible = true; ring.scale.setScalar(1 + o.shock * 6); ring.material.opacity = 1 - o.shock;
      } else ring.visible = false;
      arrows.forEach((a, i) => { a.visible = o.arrows > 0.01; a.scale.setScalar(o.arrows); a.position.y = (i ? -1 : 1) * (o.gap / 2 + 2.2); });
      for (const m of specks) {
        const u = m.userData, ang = u.a + t * u.s;
        m.position.set(Math.cos(ang) * u.r, u.y + 0.3 * Math.sin(t * 3 + u.a), Math.sin(ang) * u.r);
      }
      camPath(camera, t, o);
    };
    return { scene, camera, update };
  };
}

// 3 — the joint at rest, bathed in synovial fluid
const shotFluid = shotJoint(
  () => ({ gap: 0.3, bubble: 0, shock: null, arrows: 0 }),
  (camera, t) => { const a = lerp(0.2, 0.8, ease(t)); camera.position.set(Math.cos(a) * lerp(13, 11, t), lerp(2, 1, t), Math.sin(a) * lerp(13, 11, t)); camera.lookAt(0, 0, 0); },
);
// 4 — the bones are pulled apart, pressure drops
const shotPull = shotJoint(
  (t) => ({ gap: lerp(0.3, 1.6, ease(seg(t, 0.15, 0.9))), bubble: 0, shock: null, arrows: ease(seg(t, 0, 0.25)) }),
  (camera, t) => { const a = 0.9; camera.position.set(Math.cos(a) * lerp(13, 12, t), 0.3, Math.sin(a) * lerp(13, 12, t)); camera.lookAt(0, 0, 0); },
);
// 5 — a gas bubble forms in the gap: POP (timed to the voiceover via shotParams.popAt)
const popAt = () => window.shotParams?.popAt ?? 0.22;
const shotPop = shotJoint(
  (t) => {
    const p0 = popAt(), pop = seg(t, p0, p0 + 0.12);
    return { gap: lerp(1.6, 1.95, ease(pop)), bubble: pop > 0 ? easeOutBack(pop) : 0, shock: t > p0 ? seg(t, p0, p0 + 0.25) : null, arrows: 0 };
  },
  (camera, t) => {
    const p0 = popAt(), shake = t > p0 && t < p0 + 0.12 ? (1 - seg(t, p0, p0 + 0.12)) * 0.25 : 0;
    const a = 0.9 + t * 0.15, d = lerp(11, 8.5, ease(t));
    camera.position.set(Math.cos(a) * d + shake * Math.sin(t * 300), 0.4 + shake * Math.cos(t * 260), Math.sin(a) * d);
    camera.lookAt(0, 0, 0);
  },
);

// 6 — healthy X-ray finger with a green check: no arthritis
function shotVerdict() {
  const scene = baseScene('#031a12', 0.015);
  const camera = cam(30);
  const f = xrayFinger('#5fe0a0', '#7dffb0'); scene.add(f.root); f.root.position.y = -1.5;
  const check = new THREE.Shape();
  check.moveTo(0, 0.6); check.lineTo(0.6, 0); check.lineTo(1.9, 1.6); check.lineTo(1.5, 1.95); check.lineTo(0.6, 0.8); check.lineTo(0.35, 1.0); check.lineTo(0, 0.6);
  const cg = new THREE.ExtrudeGeometry(check, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 6 });
  cg.center();
  const mark = new THREE.Mesh(cg, new THREE.MeshPhysicalMaterial({ color: '#2fe07a', emissive: '#14a050', emissiveIntensity: 0.6, roughness: 0.2, clearcoat: 1 }));
  scene.add(mark);
  spot(scene, '#d8ffe8', 200, [6, 8, 10], [0, 1, 0], 0.8, false);
  spot(scene, '#3fff9a', 120, [-8, -2, -6], [0, 1, 0], 0.8, false);
  scene.add(new THREE.HemisphereLight('#c8ffe0', '#02100a', 0.6));
  const update = (t) => {
    const k = ease(t), pop = easeOutBack(seg(t, 0.25, 0.5));
    mark.scale.setScalar(Math.max(0.0001, pop) * 1.7);
    mark.position.set(2.6, 5.2, 0); mark.rotation.set(0, 0.93 + Math.sin(t * 4) * 0.15, 0);
    f.capsules.forEach((c) => { c.material.emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 8); });
    const a = lerp(-0.5, -0.8, k);
    camera.position.set(Math.cos(a) * lerp(19, 24, k), lerp(3, 4, k), -Math.sin(a) * lerp(19, 24, k));
    camera.lookAt(0.8, 2.2, 0);
  };
  return { scene, camera, update };
}

run([shotHook, shotXray, shotFluid, shotPull, shotPop, shotVerdict]);
