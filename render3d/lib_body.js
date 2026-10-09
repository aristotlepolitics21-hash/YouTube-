// Shared anatomy for the Medical Body shorts (9:16): medical-model cutaways built from 2D
// outlines (a skin shell with a flat cut face and raised or recessed tissue on it), a skin
// block with its layers, particles along a path, pop-in labels and a studio light rig.
// Scenes take camera params (az0/az1, el0/el1, dist0/dist1, tx/ty/tz...) through orbit(), so an
// episode's "cuts" can re-frame the same scene from new angles.
import {
  THREE, n3, ease, lerp, flesh, displace, baseScene, cam, clamp01, seg, P, rnd, orbit, finish,
} from './lib_sci.js';

export { THREE, n3, ease, lerp, flesh, displace, baseScene, cam, clamp01, seg, P, rnd, orbit, finish };

// Caption font for labels (loaded before any scene is built)
const font = new FontFace('Archivo', 'url(./fonts/ArchivoBlack-Regular.ttf)');
await font.load(); document.fonts.add(font);

export const C = {
  skin: '#d79c7f', tissue: '#c4575c', muscle: '#a8343c', brain: '#e2a2a3', bone: '#dccbaa',
  cavity: '#1c0507', cartilage: '#d6e4ea', fat: '#efc96a', nerve: '#f3d56a', artery: '#d01e2d',
  vein: '#3b52b0', mucosa: '#e07a84', dark: '#0b0507',
};

// ---------- materials ----------
export const wet = (color, opts = {}) => flesh(color, 2, { clearcoat: 1, clearcoatRoughness: 0.1, ...opts });
export const matte = (color, opts = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.55, sheen: 0.3, sheenColor: new THREE.Color('#ffd8c8'), envMapIntensity: 0.3, ...opts });
export const boneMat = () => new THREE.MeshPhysicalMaterial({ color: C.bone, roughness: 0.6, clearcoat: 0.15, envMapIntensity: 0.25 });
export const glowMat = (color, e = 1) => new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: e, roughness: 0.3 });
export function skinMat(color = C.skin) {
  return flesh(color, 3, { roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.5, normalScale: new THREE.Vector2(0.15, 0.15), sheen: 0.4, sheenColor: new THREE.Color('#ffc9b0') });
}

// ---------- 2D outline helpers (x right, y up) ----------
const v2 = (p) => new THREE.Vector2(p[0], p[1]);
// Smooth closed outline through points
export function smooth(pts, n = 200, closed = true) {
  const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], 0)), closed, 'centripetal');
  return c.getSpacedPoints(n).slice(0, closed ? n : n + 1).map((v) => new THREE.Vector2(v.x, v.y));
}
// Closed outline of a strip of width w(u) along an open path
export function band(pts, w, n = 120) {
  const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], 0)), false, 'centripetal');
  const L = [], R = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = c.getPointAt(u), t = c.getTangentAt(u), ww = (typeof w === 'function' ? w(u) : w) / 2;
    L.push(new THREE.Vector2(p.x - t.y * ww, p.y + t.x * ww)); R.push(new THREE.Vector2(p.x + t.y * ww, p.y - t.x * ww));
  }
  return [...L, ...R.reverse()];
}
export const ellipse = (cx, cy, rx, ry, n = 96, wob = 0, seed = 0) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2, r = 1 + wob * n3(Math.cos(a) * 1.5 + seed, Math.sin(a) * 1.5, seed);
  return new THREE.Vector2(cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r);
});
// 3D path helper: [[x,y,z?], ...] -> CatmullRomCurve3
export const path3 = (pts, closed = false) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2] || 0)), closed, 'centripetal');

// Raised slab of a 2D outline on the cut face: h > 0 sticks out, bevel rounds its edge
export function slab(outline, h, mat, bevel = Math.min(0.08, h * 0.6)) {
  const shape = new THREE.Shape(outline);
  const g = new THREE.ExtrudeGeometry(shape, { depth: Math.max(0.001, h - bevel), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 4, curveSegments: 8 });
  const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true;
  return m;
}
// Flat shape lying on the cut face (cavities, stains)
export function decal(outline, mat, z = 0.004) {
  const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(outline)), mat); m.position.z = z; m.receiveShadow = true;
  return m;
}

// ---------- cutaway ----------
// A half body part cut along a plane: skin shell behind z=0 from an outline (thickness `depth`,
// rounded back), a flat tissue face at z=0, then layers: [{name, outline, h, color|mat}] where
// h > 0 is raised tissue and h <= 0 a dark recess (air spaces). Returns {group, parts}.
export function cutaway(outline, layers, { depth = 3, face = C.tissue, skin = C.skin } = {}) {
  const group = new THREE.Group(), parts = {};
  const bev = depth * 0.45;
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(outline), { depth: depth - bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.9, bevelOffset: -bev * 0.9, bevelSegments: 10, curveSegments: 12 });
  // flatten the front bevel into the cut plane, then put the cut plane at z = 0
  const p = g.attributes.position, top = depth - bev;
  for (let i = 0; i < p.count; i++) if (p.getZ(i) > top) p.setZ(i, top);
  g.translate(0, 0, -top - 0.015); g.computeVertexNormals(); // just behind the face decal (no z-fighting)
  const shell = new THREE.Mesh(g, skinMat(skin)); shell.castShadow = shell.receiveShadow = true;
  group.add(shell); parts.shell = shell;
  const faceM = flesh(face, 4, { clearcoat: 0.9, clearcoatRoughness: 0.18 });
  const f = decal(outline, faceM, 0.002); group.add(f); parts.face = f;
  // rim of skin + fat around the cut edge
  const rim = new THREE.Mesh(new THREE.TubeGeometry(path3(outline.filter((_, i) => i % 2 === 0).map((v) => [v.x, v.y, 0]), true), 400, 0.06, 8, true), wet('#c98e5a', { clearcoat: 0.3 }));
  group.add(rim); parts.rim = rim;
  layers.forEach((l, i) => {
    const mat = l.mat || (l.h > 0 ? wet(l.color) : new THREE.MeshPhysicalMaterial({ color: l.color || C.cavity, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }));
    const m = l.h > 0 ? slab(l.outline, l.h, mat, l.bevel) : decal(l.outline, mat, 0.004 + i * 0.0005);
    if (l.h > 0) m.position.z = 0.002 + (l.z || 0);
    group.add(m); parts[l.name || `l${i}`] = m;
  });
  return { group, parts };
}

// ---------- head + neck, sagittal (facing +x; crown y≈6.2, neck bottom y=-9.5) ----------
export const HEAD = {
  outline: [[-2.5, -9.6], [-2.35, -6.5], [-2.7, -3.6], [-3.7, -1.6], [-4.25, 0.8], [-4.0, 3.4], [-2.8, 5.3], [-0.7, 6.2], [1.5, 5.95],
    [3.1, 4.75], [3.85, 3.0], [3.75, 2.1], [4.15, 1.2], [4.85, 0.2], [4.95, -0.05], [4.45, -0.35], [4.2, -0.55], [4.4, -1.0],
    [4.15, -1.3], [4.35, -1.65], [3.95, -2.1], [4.15, -2.75], [3.6, -3.4], [2.2, -3.7], [1.55, -4.3], [1.8, -5.5], [1.45, -7.2], [1.5, -9.6]],
  pharynx: [[1.05, 0.9], [0.55, 0.1], [0.4, -1.2], [0.42, -2.6], [0.55, -3.7]],
  trachea: [[0.75, -4.0], [0.95, -5.2], [1.0, -6.8], [0.95, -9.7]],
  esophagus: [[0.35, -4.3], [0.15, -5.4], [0.05, -7.0], [0.05, -9.7]],
  nasal: [[4.6, -0.12], [4.15, 0.75], [3.55, 1.45], [2.5, 1.75], [1.35, 1.55], [0.85, 0.85], [1.3, 0.15], [2.6, 0.05], [3.8, -0.15]],
};
export function headSection({ airway = true } = {}) {
  const H = HEAD;
  const layers = [
    { name: 'skull', outline: band([[3.45, 2.6], [3.35, 4.3], [1.6, 5.55], [-0.6, 5.85], [-2.6, 5.0], [-3.65, 3.3], [-3.85, 1.0], [-3.3, -0.9], [-2.4, -1.4]], 0.32), h: 0.12, mat: boneMat() },
    { name: 'brain', outline: smooth([[-3.3, 2.0], [-3.2, 3.6], [-2.2, 4.9], [-0.4, 5.45], [1.5, 5.2], [2.9, 4.0], [3.1, 2.7], [2.2, 2.2], [0.6, 1.9], [-0.6, 1.4], [-2.0, 1.5]]), h: 0.22, color: C.brain },
    { name: 'cerebellum', outline: ellipse(-2.4, 0.55, 0.95, 0.75, 64, 0.05, 2), h: 0.2, color: '#d48f93' },
    { name: 'brainstem', outline: band([[-0.4, 1.7], [-0.9, 0.4], [-1.25, -1.0]], (u) => 0.75 - u * 0.25), h: 0.18, color: '#dba0a0' },
    { name: 'cord', outline: band([[-1.25, -1.0], [-1.5, -4], [-1.55, -6.5], [-1.5, -9.7]], 0.32), h: 0.12, color: '#f1cfa6' },
    { name: 'frontalSinus', outline: ellipse(3.05, 3.0, 0.32, 0.45, 48, 0.1, 4), h: 0, color: C.cavity },
    { name: 'nasal', outline: smooth(H.nasal), h: 0, color: C.cavity },
    { name: 'palate', outline: band([[4.0, -0.6], [2.8, -0.42], [1.4, -0.4], [0.75, -1.05]], (u) => (u < 0.7 ? 0.24 : 0.2)), h: 0.12, mat: boneMat() },
    { name: 'mouth', outline: smooth([[4.1, -1.35], [3.3, -0.8], [2.2, -0.68], [1.1, -0.75], [0.7, -1.3], [1.4, -1.05], [2.6, -0.98], [3.6, -1.3]]), h: 0, color: C.cavity },
    { name: 'tongue', outline: smooth([[3.65, -1.45], [2.7, -1.0], [1.5, -1.0], [0.75, -1.6], [0.7, -2.7], [1.5, -3.25], [2.8, -2.75], [3.5, -2.0]]), h: 0.2, color: '#d9646e' },
    { name: 'jaw', outline: band([[3.9, -2.05], [3.85, -2.85], [3.2, -3.25], [1.9, -3.35]], 0.36), h: 0.12, mat: boneMat() },
    { name: 'teethU', outline: smooth([[4.15, -0.62], [4.25, -1.15], [3.9, -1.2], [3.85, -0.65]]), h: 0.14, mat: boneMat() },
    { name: 'teethL', outline: smooth([[4.15, -1.42], [3.9, -1.38], [3.85, -2.0], [4.1, -2.0]]), h: 0.14, mat: boneMat() },
  ];
  if (airway) layers.push(
    { name: 'pharynx', outline: band(H.pharynx, 0.5), h: 0, color: C.cavity },
    { name: 'trachea', outline: band(H.trachea, 0.7), h: 0, color: C.cavity },
    { name: 'esophagus', outline: band(H.esophagus, 0.42), h: 0.1, color: C.mucosa },
  );
  // vertebrae + discs
  for (let i = 0; i < 9; i++) {
    const y = -0.9 - i * 0.98, x = -0.75 - i * 0.03;
    layers.push({ name: `vert${i}`, outline: smooth([[x - 0.42, y + 0.36], [x + 0.42, y + 0.36], [x + 0.46, y - 0.36], [x - 0.46, y - 0.36]], 40), h: 0.16, mat: boneMat() });
    layers.push({ name: `disc${i}`, outline: smooth([[x - 0.4, y - 0.4], [x + 0.4, y - 0.4], [x + 0.4, y - 0.58], [x - 0.4, y - 0.58]], 30), h: 0.1, color: '#c9d8e6' });
  }
  const cut = cutaway(smooth(H.outline, 300), layers, { depth: 3.2 });
  // cartilage rings on the trachea
  const ringM = wet(C.cartilage, { clearcoat: 0.7 });
  const tc = path3(H.trachea);
  for (let i = 0; i < 9; i++) {
    const u = 0.12 + i * 0.1, q = tc.getPointAt(u), t = tc.getTangentAt(u);
    const r = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.62, 4, 8), ringM);
    r.position.set(q.x, q.y, 0.05); r.rotation.z = Math.atan2(t.y, t.x) + Math.PI; cut.group.add(r);
  }
  return cut;
}

// ---------- skin block (top surface at y=0, cut faces toward +x and +z) ----------
// Layers top->bottom: epidermis, dermis, fat. Like a medical model, the structures sit half
// embedded in the two cut faces so they read: hair follicles, capillary loops, an artery/vein
// pair and a nerve. Returns {group, parts, top(x, z), depth, onFace(face, along, y, inset)}.
export function skinBlock({ size = 8, epi = 0.28, dermis = 1.7, fat = 2.0, hairs = 40, skin = C.skin, seed = 0 } = {}) {
  const group = new THREE.Group(), parts = {};
  const S = size, half = S / 2;
  const surf = (x, z) => 0.05 * n3(x * 0.9 + seed, z * 0.9, 1) + 0.015 * n3(x * 4, z * 4, 2);
  // a point on cut face 'z' (+z side, along = x) or 'x' (+x side, along = z), pushed in by inset
  const onFace = (face, along, y, inset = 0) => face === 'z' ? new THREE.Vector3(along, y, half - inset) : new THREE.Vector3(half - inset, y, along);
  const layer = (y0, y1, mat, name, bumpTop) => {
    const g = new THREE.BoxGeometry(S, y0 - y1, S, bumpTop ? 140 : 1, 1, bumpTop ? 140 : 1);
    g.translate(0, (y0 + y1) / 2, 0);
    if (bumpTop) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > y0 - 0.001) p.setY(i, y0 + surf(p.getX(i), p.getZ(i))); g.computeVertexNormals(); }
    const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; group.add(m); parts[name] = m; return m;
  };
  layer(0, -epi, skinMat(skin), 'epidermis', true);
  layer(-epi, -epi - dermis, flesh('#e58c8a', 3, { clearcoat: 0.8, clearcoatRoughness: 0.2 }), 'dermis');
  layer(-epi - dermis, -epi - dermis - fat, wet('#e9c46d', { clearcoat: 0.7 }), 'fatBase');
  const yF = -epi - dermis, yB = yF - fat;
  // fat lobules bulging on the two cut faces
  const lobM = wet(C.fat, { clearcoat: 0.8, clearcoatRoughness: 0.12 });
  for (let i = 0; i < 80; i++) {
    const r = 0.26 + rnd(i + seed) * 0.2, face = i % 2 ? 'x' : 'z', along = (rnd(i + 0.3 + seed) - 0.5) * (S - 0.6);
    const y = yF - 0.28 - rnd(i + 0.6 + seed) * (fat - 0.55);
    const b = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), lobM);
    b.position.copy(onFace(face, along, y, r * 0.55)); b.scale.set(1, 0.8, 1); group.add(b);
  }
  // artery + vein along both cut faces at the dermis/fat border, capillary loops up into the dermis
  const vessels = new THREE.Group(); group.add(vessels); parts.vessels = vessels;
  const art = wet(C.artery), vein = wet(C.vein), capM = wet('#d9364a');
  parts.capillaries = [];
  for (const face of ['z', 'x']) {
    for (const [mat, dy, r] of [[art, 0.1, 0.16], [vein, -0.3, 0.19]]) {
      const pts = [-half, -half / 2, 0, half / 2, half].map((a, i) => onFace(face, a, yF + dy + 0.06 * Math.sin(i * 1.7 + (face === 'x' ? 1 : 0)), r * 0.35));
      vessels.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, r, 16), mat));
    }
    for (let i = 0; i < 6; i++) {
      const a = -half + 0.9 + i * (S - 1.8) / 5 + (rnd(i + (face === 'x' ? 9 : 0)) - 0.5) * 0.4;
      const c = new THREE.CatmullRomCurve3([onFace(face, a - 0.22, yF + 0.1, 0.03), onFace(face, a - 0.14, -epi - 0.3, 0.03), onFace(face, a + 0.14, -epi - 0.3, 0.03), onFace(face, a + 0.22, yF + 0.1, 0.03)]);
      const m = new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.05, 8), capM); vessels.add(m); parts.capillaries.push(m);
    }
  }
  // nerve with endings reaching up toward the epidermis
  const nerveM = wet(C.nerve, { emissive: '#5a4400', emissiveIntensity: 0.2 });
  const nerve = new THREE.Group(); group.add(nerve); parts.nerve = nerve; parts.nerveEnds = [];
  const nc = new THREE.CatmullRomCurve3([-half, -1, 1, half].map((a, i) => onFace('z', a, yF - 0.75 + 0.1 * Math.sin(i * 2), 0.04)));
  nerve.add(new THREE.Mesh(new THREE.TubeGeometry(nc, 60, 0.1, 10), nerveM)); parts.nerveCurve = nc;
  for (let i = 0; i < 5; i++) {
    const u = 0.12 + i * 0.18, p0 = nc.getPointAt(u);
    const c = new THREE.CatmullRomCurve3([p0, onFace('z', p0.x + 0.25, yF + 0.2, 0.03), onFace('z', p0.x + 0.1, -epi - 0.12, 0.03)]);
    nerve.add(new THREE.Mesh(new THREE.TubeGeometry(c, 20, 0.045, 6), nerveM)); parts.nerveEnds.push(c);
  }
  // hair follicles on the cut faces, hairs coming out of the top
  const hairM = new THREE.MeshPhysicalMaterial({ color: '#3a2418', roughness: 0.35, clearcoat: 0.5 });
  const follM = wet('#c86b6e'), bulbM = wet('#a8434f');
  parts.hairs = [];
  const addHair = (x, z, len, follicle, face) => {
    const y = surf(x, z), lean = new THREE.Vector3(face === 'x' ? 0 : 0.45, 1, face === 'x' ? 0.45 : 0.25).normalize();
    if (follicle) {
      const root = new THREE.Vector3(x, y, z).addScaledVector(lean, -1.45);
      const fol = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 1.2, 4, 12), follM);
      fol.position.copy(root).addScaledVector(lean, 0.62); fol.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), lean); group.add(fol);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), bulbM); bulb.position.copy(root); group.add(bulb);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(root, new THREE.Vector3(x, y, z)), 4, 0.03, 6), hairM));
    }
    const tip = new THREE.Vector3(x, y, z).addScaledVector(lean, len).add(new THREE.Vector3(0.12, -0.08 * len, 0.05));
    const mid = new THREE.Vector3(x, y, z).addScaledVector(lean, len * 0.55);
    const h = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x, y - 0.05, z), mid, tip]), 16, 0.022, 6), hairM);
    group.add(h); parts.hairs.push({ hair: h, x, z, lean });
  };
  for (let i = 0; i < 4; i++) { addHair(-half + 1.2 + i * 1.9, half - 0.06, 0.7, true, 'z'); addHair(half - 0.06, -half + 1.6 + i * 1.9, 0.7, true, 'x'); }
  for (let i = 0; i < hairs; i++) addHair((rnd(i * 3 + seed) - 0.5) * (S - 1), (rnd(i * 3 + 1 + seed) - 0.5) * (S - 1), 0.4 + rnd(i + 7) * 0.4, false);
  return { group, parts, top: surf, depth: epi + dermis + fat, onFace, yDermis: yF, yBottom: yB, half };
}

// ---------- particles moving along a curve (instanced spheres) ----------
export function flow(curve, n, { r = 0.06, color = '#ffffff', spread = 0.2, mat, seed = 0 } = {}) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 12, 8), mat || glowMat(color, 0.8), n);
  m.frustumCulled = false;
  const d = new THREE.Object3D(), q = new THREE.Vector3();
  m.userData.update = (t, { speed = 0.5, from = 0, to = 1, scale = 1 } = {}) => {
    for (let i = 0; i < n; i++) {
      const u = from + (((rnd(i + seed) + t * speed) % 1) + 1) % 1 * (to - from);
      curve.getPointAt(Math.min(1, Math.max(0, u)), q);
      d.position.set(q.x + (rnd(i + 0.2) - 0.5) * spread, q.y + (rnd(i + 0.4) - 0.5) * spread, q.z + (rnd(i + 0.6) - 0.5) * spread);
      d.scale.setScalar(scale * (0.6 + rnd(i + 0.8) * 0.8)); d.updateMatrix(); m.setMatrixAt(i, d.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  };
  m.userData.update(0);
  return m;
}

// ---------- pop-in label: pill with text + leader line to an anchor ----------
export function label(text, { color = '#ff3b3b', size = 0.55 } = {}) {
  const c = document.createElement('canvas'), g = c.getContext('2d');
  const fs = 72; g.font = `${fs}px Archivo`;
  const tw = g.measureText(text).width; c.width = Math.ceil(tw + 90); c.height = 120;
  g.font = `${fs}px Archivo`;
  g.fillStyle = 'rgba(8,6,10,0.78)'; g.beginPath(); g.roundRect(4, 4, c.width - 8, c.height - 8, 50); g.fill();
  g.fillStyle = color; g.beginPath(); g.arc(46, 60, 13, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.fillText(text, 70, 64);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  const w = size * c.width / c.height; sp.scale.set(w, size, 1); sp.renderOrder = 10;
  sp.userData.base = [w, size];
  const grp = new THREE.Group(); grp.add(sp);
  const lineM = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, depthTest: false });
  const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const line = new THREE.Line(lg, lineM); line.renderOrder = 9; grp.add(line);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', depthTest: false })); dot.renderOrder = 10; grp.add(dot);
  // place(anchor, at, k): anchor = point on the body, at = label position, k = pop-in 0..1
  grp.userData.place = (anchor, at, k) => {
    const s = k <= 0 ? 0 : 1 + 0.25 * Math.sin(Math.min(1, k) * Math.PI) * (1 - k); // overshoot pop
    grp.visible = k > 0;
    sp.position.copy(at); sp.scale.set(sp.userData.base[0] * s, sp.userData.base[1] * s, 1);
    sp.center.set(Math.abs(at.x - anchor.x) < 1e-4 ? 0.5 : at.x > anchor.x ? 0 : 1, 0.5);
    lg.setFromPoints([anchor, at]); dot.position.copy(anchor);
    lineM.opacity = Math.min(1, k * 3);
  };
  return grp;
}

// ---------- lights ----------
export function studio(scene, { key = '#fff1e8', keyI = 18, rim = '#ff5a6a', rimI = 14, fill = '#7fa8ff', hemi = 0.3, target = [0, 0, 0], keyPos = [-6, 9, 12], rimPos = [8, 3, -8] } = {}) {
  const k = new THREE.SpotLight(key, keyI, 0, 0.6, 0.6, 1.2); k.position.set(...keyPos); k.target.position.set(...target);
  k.castShadow = true; k.shadow.mapSize.set(2048, 2048); k.shadow.bias = -0.0004; k.shadow.radius = 5;
  const r = new THREE.SpotLight(rim, rimI, 0, 0.7, 0.6, 1.2); r.position.set(...rimPos); r.target.position.set(...target);
  scene.add(k, k.target, r, r.target, new THREE.HemisphereLight(fill, '#100406', hemi));
  return { key: k, rim: r };
}

// Medical dark backdrop: dark gradient sphere + faint floating particles
export function backdrop(scene, { top = '#1a0b10', bottom = '#030103', r = 60 } = {}) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, fog: false, depthWrite: false }));
  scene.add(s);
  return s;
}

// Standard scene + camera + finisher for a Medical Body shot
export function setup({ bg = '#0a0508', fov = 30, top, bottom } = {}) {
  const scene = baseScene(bg);
  backdrop(scene, { top: top || '#1c0d12', bottom: bottom || '#030103' });
  const camera = cam(fov); camera.near = 0.3; camera.updateProjectionMatrix();
  return { scene, camera };
}

// Finisher with a gentle bloom (only real highlights glow)
export const done = (scene, camera, update, b = {}) => finish(scene, camera, update, { strength: 0.35, radius: 0.4, threshold: 0.95, ...b });

// Skin surface seen from outside: a wide plane with fine bumps, a few hairs and a canvas colour
// map. paint(fn) redraws it: fn(ctx, size) draws in a size x size canvas covering the plane
// (canvas centre = plane origin). bulge(k, at, r) raises a welt.
export function skinPlane({ size = 24, color = '#c48a70', hairs = 80, res = 1024 } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, 220, 220); geo.rotateX(-Math.PI / 2);
  const base = Float32Array.from(geo.attributes.position.array);
  const c = document.createElement('canvas'); c.width = c.height = res; const ctx = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = skinMat('#ffffff'); mat.map = tex;
  const mesh = new THREE.Mesh(geo, mat); mesh.receiveShadow = true;
  const paint = (fn) => { ctx.fillStyle = color; ctx.fillRect(0, 0, res, res); if (fn) fn(ctx, res); tex.needsUpdate = true; };
  const bulge = (k, at = [0, 0], r = 2.2) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], z = base[i * 3 + 2], d2 = (x - at[0]) ** 2 + (z - at[1]) ** 2;
      p.setY(i, k * Math.exp(-d2 / r) + 0.04 * n3(x * 0.8, z * 0.8, 0) + 0.012 * n3(x * 5, z * 5, 1));
    }
    p.needsUpdate = true; geo.computeVertexNormals();
  };
  paint(); bulge(0);
  const hairM = new THREE.MeshPhysicalMaterial({ color: '#4a3020', roughness: 0.4 });
  for (let i = 0; i < hairs; i++) {
    const x = (rnd(i) - 0.5) * size * 0.8, z = (rnd(i + 0.5) - 0.5) * size * 0.8;
    mesh.add(new THREE.Mesh(new THREE.TubeGeometry(path3([[x, 0, z], [x + 0.2, 0.4, z + 0.1], [x + 0.5, 0.7, z + 0.2]]), 10, 0.018, 5), hairM));
  }
  // world (x, z) -> canvas pixel
  const px = (x, z) => [(x / size + 0.5) * res, (z / size + 0.5) * res];
  return { mesh, paint, bulge, px, res };
}
