// Shared anatomy for the Medical Body shorts (9:16): medical-model cutaways built from 2D
// outlines (a skin shell with a flat cut face and raised or recessed tissue on it), a skin
// block with its layers, particles along a path, pop-in labels and a studio light rig.
// Scenes take camera params (az0/az1, el0/el1, dist0/dist1, tx/ty/tz...) through orbit(), so an
// episode's "cuts" can re-frame the same scene from new angles.
import {
  THREE, n3, ease, lerp, flesh, displace, baseScene, cam, clamp01, seg, P, rnd, orbit as orbitSci, finish,
} from './lib_sci.js';
import { renderer, W, H } from './lib3d.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export { THREE, n3, ease, lerp, flesh, displace, baseScene, cam, clamp01, seg, P, rnd, finish };

// orbit() from lib_sci, also remembering the focus distance for depth of field
export function orbit(camera, p, t, d = {}) {
  orbitSci(camera, p, t, d);
  camera.userData.focus = lerp(P(p, 'dist0', d.dist0 ?? 12), P(p, 'dist1', d.dist1 ?? 12), ease(t));
}

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
// Fresnel rim light baked into a material: edges facing away from the camera glow (the
// "backlit translucent skin" look). Works on any Mesh*Material.
export function rim(mat, color = '#6fb6ff', strength = 0.8, power = 3.0) {
  mat.userData.rim = { value: new THREE.Color(color).multiplyScalar(strength) };
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.rimColor = mat.userData.rim;
    sh.fragmentShader = 'uniform vec3 rimColor;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
      totalEmissiveRadiance += rimColor * pow(1.0 - clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), ${power.toFixed(1)});`);
  };
  mat.customProgramCacheKey = () => `rim${power}`;
  return mat;
}
export function skinMat(color = C.skin, rimStrength = 0.9) {
  return rim(flesh(color, 3, { roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.35, normalScale: new THREE.Vector2(0.15, 0.15), sheen: 0.6, sheenRoughness: 0.4, sheenColor: new THREE.Color('#ffd2c0') }), '#7cc0ff', rimStrength, 2.6);
}
// vertex shader shared by the fresnel materials (works on plain and instanced meshes)
const INST_VS = `varying vec3 vN; varying vec3 vV;
  void main(){
    vec4 p = vec4(position, 1.0); vec3 nn = normal;
    #ifdef USE_INSTANCING
      p = instanceMatrix * p; nn = mat3(instanceMatrix) * nn;
    #endif
    vec4 mv = modelViewMatrix * p; vN = normalize(normalMatrix * nn); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
// Glassy outer membrane: transparent in the middle, glowing blue-white at grazing angles
export function glassMat(color = '#9fd2ff', { edge = 0.85, core = 0.05, power = 2.2 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color(color) } },
    vertexShader: INST_VS,
    fragmentShader: `uniform vec3 c; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), ${power.toFixed(1)});
        gl_FragColor = vec4(c * (0.6 + 1.4 * f), ${core.toFixed(3)} + ${edge.toFixed(3)} * f); }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
}
// Air bubble: clear centre, bright fresnel rim, a specular glint and a faint blue core
export function bubbleMat(color = '#8fd0ff') {
  return new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color(color) } },
    vertexShader: INST_VS,
    fragmentShader: `uniform vec3 c; varying vec3 vN; varying vec3 vV;
      void main(){ vec3 n = normalize(vN); float f = pow(1.0 - max(dot(n, normalize(vV)), 0.0), 2.4);
        float glint = pow(max(dot(n, normalize(vec3(-0.45, 0.6, 0.65))), 0.0), 60.0);
        float glint2 = pow(max(dot(n, normalize(vec3(0.5, -0.5, 0.7))), 0.0), 25.0) * 0.35;
        vec3 col = c * (0.2 + 1.0 * f) + vec3(1.0) * (glint * 1.3 + glint2 * 0.6);
        gl_FragColor = vec4(col, clamp(0.06 + 0.7 * f + glint, 0.0, 1.0)); }`,
    transparent: true, depthWrite: false,
  });
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
  const membrane = new THREE.Mesh(g, glassMat('#8cc8ff', { edge: 0.3, core: 0.0, power: 3.0 })); membrane.scale.set(1.01, 1.01, 1.02); group.add(membrane); parts.membrane = membrane;
  const fm = tissueMap(face, 1024, 7); fm.repeat.set(0.18, 0.18);
  const faceM = flesh('#ffffff', 4, { map: fm, clearcoat: 0.9, clearcoatRoughness: 0.18 });
  const f = decal(outline, faceM, 0.002); group.add(f); parts.face = f;
  { const p = f.geometry.attributes.position, u = []; for (let i = 0; i < p.count; i++) u.push(p.getX(i), p.getY(i)); f.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); }
  // rim of skin + fat around the cut edge
  const rimTube = new THREE.Mesh(new THREE.TubeGeometry(path3(outline.filter((_, i) => i % 2 === 0).map((v) => [v.x, v.y, 0]), true), 400, 0.06, 8, true), wet('#c98e5a', { clearcoat: 0.3 }));
  group.add(rimTube); parts.rim = rimTube;
  // Air spaces are real pockets sunk into the cut: a stencil mask punches the face and shell open
  // where a cavity is, and a dark-walled pocket (seen from inside) shows the depth.
  const hideInHoles = (m) => Object.assign(m, { stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc, stencilZPass: THREE.KeepStencilOp });
  hideInHoles(faceM); hideInHoles(shell.material); hideInHoles(rimTube.material);
  const maskM = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
  layers.forEach((l, i) => {
    const cavity = !(l.h > 0) && !l.flat;
    if (cavity) {
      const mask = decal(l.outline, maskM, 0.003); mask.renderOrder = -5; group.add(mask);
      const D = l.depthIn || 0.7;
      const pg = new THREE.ExtrudeGeometry(new THREE.Shape(l.outline), { depth: D, bevelEnabled: false, curveSegments: 8 }); pg.translate(0, 0, -D + 0.001);
      const pm = flesh(l.wall || '#6a2028', 3, { side: THREE.BackSide, clearcoat: 1, clearcoatRoughness: 0.1, roughness: 0.35 });
      const pocket = new THREE.Mesh(pg, pm); pocket.receiveShadow = true; group.add(pocket); parts[l.name || `l${i}`] = pocket;
      return;
    }
    const mat = l.mat || (l.h > 0 ? rim(wet(l.color, { sheen: 0.4, sheenColor: new THREE.Color('#ffd8d0') }), '#9fd0ff', 0.25, 3.0) : new THREE.MeshPhysicalMaterial({ color: l.color || C.cavity, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.1 }));
    const m = l.h > 0 ? slab(l.outline, l.h * 1.8, mat, l.bevel) : decal(l.outline, mat, 0.004 + i * 0.0005);
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
export function studio(scene, { key = '#fff1e8', keyI = 18, rim = '#ff5a6a', rimI = 14, fill = '#7fa8ff', hemi = 0.3, target = [0, 0, 0], keyPos = [-6, 9, 12], rimPos = [8, 3, -8], rim2 = '#4f9dff', rim2I = 22, rim2Pos = [-9, 4, -9] } = {}) {
  const k = new THREE.SpotLight(key, keyI, 0, 0.6, 0.6, 1.2); k.position.set(...keyPos); k.target.position.set(...target);
  k.castShadow = true; k.shadow.mapSize.set(2048, 2048); k.shadow.bias = -0.0004; k.shadow.radius = 5;
  const r = new THREE.SpotLight(rim, rimI, 0, 0.7, 0.6, 1.2); r.position.set(...rimPos); r.target.position.set(...target);
  // cool back light from the other side: the blue edge glow of the reference look
  const r2 = new THREE.SpotLight(rim2, rim2I, 0, 0.8, 0.7, 1.1); r2.position.set(...rim2Pos); r2.target.position.set(...target);
  scene.add(k, k.target, r, r.target, r2, r2.target, new THREE.HemisphereLight(fill, '#05070f', hemi));
  return { key: k, rim: r, rim2: r2 };
}

// Studio backdrop: navy vertical gradient with a soft cool glow behind the subject
export function backdrop(scene, { top = '#14284f', bottom = '#03050c', glow = '#2b62b0', r = 80 } = {}) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 1024;
  const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 1024);
  gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 512, 1024);
  const rg = g.createRadialGradient(256, 470, 0, 256, 470, 300);
  rg.addColorStop(0, glow + 'aa'); rg.addColorStop(1, glow + '00'); g.fillStyle = rg; g.fillRect(0, 0, 512, 1024);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  // a camera-facing plane far behind everything (follows the camera every frame)
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, fog: false, depthWrite: false, toneMapped: false }));
  m.renderOrder = -10; m.frustumCulled = false;
  m.onBeforeRender = (rdr, sc, camera) => {
    const d = r, h = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.05;
    m.position.copy(camera.position).add(new THREE.Vector3(0, 0, -d).applyQuaternion(camera.quaternion));
    m.quaternion.copy(camera.quaternion); m.scale.set(h * camera.aspect, h, 1); m.updateMatrixWorld();
  };
  scene.add(m);
  return m;
}

// Out-of-focus dust motes floating around the subject
function dust(scene, n = 160, spread = 40) {
  const g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pos.set([(rnd(i) - 0.5) * spread, (rnd(i + 0.3) - 0.5) * spread, (rnd(i + 0.6) - 0.5) * spread], i * 3);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#9fcfff', size: 0.09, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(pts);
  return pts;
}

// Standard scene + camera for a Medical Body shot. Dark custom backdrops fall back to the
// shared navy studio look; bright ones (sky) are kept.
export function setup({ bg = '#05070f', fov = 30, top, bottom } = {}) {
  const scene = baseScene(bg);
  const bright = top && new THREE.Color(top).getHSL({}).l > 0.25;
  backdrop(scene, bright ? { top, bottom: bottom || '#ffffff', glow: '#ffffff' } : {});
  if (!bright) dust(scene);
  const camera = cam(fov); camera.near = 0.3; camera.updateProjectionMatrix();
  return { scene, camera };
}

// Finisher with a gentle bloom (only real highlights glow)
// Final look: MSAA render, depth of field on the orbit target, gentle bloom, then a grade pass
// (teal shadows / warm highlights, vignette, film grain, slight chromatic fringe).
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, vig: { value: 0.55 }, grain: { value: 0.035 }, ca: { value: 0.0016 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time, vig, grain, ca; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time * 7.13) * 43758.5453); }
    void main(){
      vec2 d = vUv - 0.5; float r2 = dot(d, d);
      vec3 col = vec3(texture2D(tDiffuse, vUv - d * ca * 4.0).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv + d * ca * 4.0).b);
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, col * vec3(0.86, 0.96, 1.12), (1.0 - smoothstep(0.0, 0.45, l)) * 0.6);   // cool shadows
      col = mix(col, col * vec3(1.06, 1.0, 0.93), smoothstep(0.55, 1.0, l) * 0.5);          // warm highlights
      col = (col - 0.5) * 1.06 + 0.5;                                                        // a touch of contrast
      col *= 1.0 - vig * smoothstep(0.08, 0.55, r2 * 1.6);
      col += (h(vUv * vec2(1080.0, 1920.0)) - 0.5) * grain;
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0); }`,
};
export function done(scene, camera, update, b = {}) {
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4, stencilBuffer: true });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(1); composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  const dof = b.dof === false ? null : new BokehPass(scene, camera, { focus: 10, aperture: b.aperture ?? 0.0018, maxblur: b.maxblur ?? 0.006 });
  if (dof) composer.addPass(dof);
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), b.strength ?? 0.32, b.radius ?? 0.5, b.threshold ?? 0.88));
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader); composer.addPass(grade);
  let first = true, frame = 0;
  const upd = (t) => {
    update(t); if (first) { update(t); first = false; }
    if (dof) dof.uniforms.focus.value = camera.userData.focus ?? 10;
    grade.uniforms.time.value = (frame++ % 97) * 0.37 + t;
  };
  return { scene, camera, update: upd, render: () => composer.render() };
}

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

// ---------- procedural tissue textures ----------
// Muscle: long parallel fibers (colour + normal map). Repeat along u.
export function muscleMaps(color = '#b8434c', size = 512) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const base = new THREE.Color(color);
  x.fillStyle = color; x.fillRect(0, 0, size, size);
  for (let i = 0; i < 260; i++) {
    const px = rnd(i) * size, w = 1 + rnd(i + 0.3) * 3, l = 0.75 + rnd(i + 0.6) * 0.5;
    x.strokeStyle = base.clone().offsetHSL(0, 0, (rnd(i + 0.9) - 0.5) * 0.18).getStyle(); x.lineWidth = w;
    x.beginPath(); x.moveTo(px, 0); for (let y = 0; y <= size; y += 16) x.lineTo(px + 4 * Math.sin(y * 0.02 + i), y); x.stroke();
    x.strokeStyle = `rgba(255,220,220,${0.12 * l})`; x.lineWidth = 0.8; x.stroke();
  }
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.wrapS = map.wrapT = THREE.RepeatWrapping;
  // normal: ridges across u
  const n = document.createElement('canvas'); n.width = n.height = size; const nx = n.getContext('2d'), img = nx.createImageData(size, size);
  for (let yy = 0; yy < size; yy++) for (let xx = 0; xx < size; xx++) {
    const v = Math.sin(xx * 0.55 + 2 * n3(xx * 0.02, yy * 0.004, 0)) * 0.6 + 0.4 * n3(xx * 0.08, yy * 0.01, 3);
    const i = (yy * size + xx) * 4; img.data[i] = 128 + v * 70; img.data[i + 1] = 128; img.data[i + 2] = 230; img.data[i + 3] = 255;
  }
  nx.putImageData(img, 0, 0);
  const nrm = new THREE.CanvasTexture(n); nrm.wrapS = nrm.wrapT = THREE.RepeatWrapping;
  return { map, normalMap: nrm };
}
// Soft tissue with fine capillaries (for flat cut faces)
export function tissueMap(color = '#d9767c', size = 1024, seed = 0) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  x.fillStyle = color; x.fillRect(0, 0, size, size);
  const base = new THREE.Color(color);
  for (let i = 0; i < 900; i++) { const px = rnd(i + seed) * size, py = rnd(i + 0.5 + seed) * size, r = 6 + rnd(i + 0.7) * 30; x.fillStyle = base.clone().offsetHSL(0, 0.05, (rnd(i + 0.2) - 0.5) * 0.08).getStyle().replace('rgb', 'rgba').replace(')', ',0.35)'); x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill(); }
  x.lineCap = 'round';
  const vessel = (px, py, a, w, d) => { if (d > 7 || w < 0.4) return; const L = 25 + rnd(px + py) * 45, nx2 = px + Math.cos(a) * L, ny = py + Math.sin(a) * L; x.strokeStyle = d % 2 ? 'rgba(150,20,40,0.55)' : 'rgba(120,10,30,0.6)'; x.lineWidth = w; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo((px + nx2) / 2 + 8, (py + ny) / 2 - 8, nx2, ny); x.stroke(); vessel(nx2, ny, a + 0.5, w * 0.72, d + 1); vessel(nx2, ny, a - 0.45, w * 0.68, d + 1); };
  for (let k = 0; k < 7; k++) vessel(rnd(k + seed) * size, rnd(k + 0.5 + seed) * size, rnd(k + 0.2) * 6.3, 3.2, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ---------- neck, cut in half lengthwise (sagittal): a 3D medical model ----------
// x = toward the front of the neck, y = up, the cut plane is z = 0 and the model fills z < 0.
// Layers from the front: glassy skin, fat lobules laced with connective fibers, strap muscle,
// the windpipe (C-shaped cartilage rings, pink lining), muscle, the food pipe, the spine.
// tear(k) opens a ragged hole in the windpipe's front wall; swell(k) pushes the front out.
export function neckCutaway({ seed = 1 } = {}) {
  const group = new THREE.Group(), parts = {};
  const R = (y) => 4.6 + 1.5 * THREE.MathUtils.smoothstep(y, 4.5, 9) + 1.2 * THREE.MathUtils.smoothstep(-y, 5, 9);
  const Y0 = -9, Y1 = 9, NY = 120;
  const TX = 1.75, TR = 1.12;              // windpipe centre x, radius
  const EX = -0.55, ER = 0.62;             // food pipe
  let swellK = 0;
  const front = (y) => swellK * 1.1 * Math.exp(-(y * y) / 10);   // swelling bulge of the front
  // half shell of the outer skin
  const shellGeo = new THREE.BufferGeometry();
  const NA = 64, sp = new Float32Array((NY + 1) * (NA + 1) * 3), uv = [], idx = [];
  for (let i = 0; i <= NY; i++) for (let j = 0; j <= NA; j++) uv.push(j / NA, i / NY);
  for (let i = 0; i < NY; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  shellGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3)); shellGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); shellGeo.setIndex(idx);
  const fillShell = () => {
    for (let i = 0; i <= NY; i++) {
      const y = Y0 + (i / NY) * (Y1 - Y0), r = R(y);
      for (let j = 0; j <= NA; j++) {
        const a = Math.PI + (j / NA) * Math.PI, cx = Math.cos(a), k = (i * (NA + 1) + j) * 3;
        sp[k] = cx * r + (cx > 0 ? front(y) * cx : 0); sp[k + 1] = y; sp[k + 2] = Math.sin(a) * r * 0.92;
      }
    }
    shellGeo.attributes.position.needsUpdate = true; shellGeo.computeVertexNormals();
  };
  fillShell();
  const shell = new THREE.Mesh(shellGeo, skinMat('#d4937a', 0.7)); shell.castShadow = shell.receiveShadow = true; group.add(shell);
  const membrane = new THREE.Mesh(shellGeo, glassMat('#8cc8ff', { edge: 0.3, core: 0.0, power: 3.0 })); membrane.scale.set(1.02, 1, 1.02); group.add(membrane);
  // flat strips on the cut face, rebuilt when the front swells
  const strip = (x0, x1, mat, z = 0.002, depth = 0) => {
    const m = new THREE.Mesh(new THREE.BufferGeometry(), mat); m.position.z = z; group.add(m);
    m.userData.build = () => {
      const L = [], Rr = [];
      for (let i = 0; i <= 90; i++) { const y = Y0 + (i / 90) * (Y1 - Y0); L.push(new THREE.Vector2(x0(y), y)); Rr.push(new THREE.Vector2(x1(y), y)); }
      const sh = new THREE.Shape([...L, ...Rr.reverse()]);
      m.geometry.dispose();
      m.geometry = depth ? new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: depth * 0.5, bevelSize: 0.03, bevelSegments: 3 }) : new THREE.ShapeGeometry(sh);
      if (!depth) { const p = m.geometry.attributes.position, u = []; for (let i = 0; i < p.count; i++) u.push(p.getX(i) * 0.12, p.getY(i) * 0.12); m.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); }
    };
    m.userData.build(); return m;
  };
  const mm = muscleMaps('#b5434b'); mm.map.repeat.set(1.5, 0.35); mm.normalMap.repeat.set(1.5, 0.35);
  const muscleM = flesh('#ffffff', 1, { map: mm.map, normalMap: mm.normalMap, normalScale: new THREE.Vector2(0.6, 0.6), clearcoat: 0.9, clearcoatRoughness: 0.12, sheen: 0.4, sheenColor: new THREE.Color('#ff9a9a') });
  const fatM = flesh('#e2a63e', 3, { clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.15, sheenColor: new THREE.Color('#ffe2a0') });
  const skinCutM = rim(flesh('#e9b9a2', 2, { clearcoat: 0.6, roughness: 0.4 }), '#9fd0ff', 0.35, 2.0);
  parts.strips = [
    strip((y) => R(y) - 0.38 + front(y), (y) => R(y) + front(y), skinCutM, 0.002, 0.06),                     // skin (front)
    strip((y) => -R(y), (y) => -R(y) + 0.38, skinCutM, 0.002, 0.06),                                          // skin (back)
    strip((y) => R(y) - 1.7, (y) => R(y) - 0.38 + front(y), fatM, 0.0015),                                    // fat (front)
    strip((y) => -R(y) + 0.38, (y) => -R(y) + 1.0, fatM, 0.0015),                                             // fat (back)
    strip((y) => TX + TR + 0.05, (y) => R(y) - 1.7, muscleM, 0.003, 0.08),                                     // strap muscle in front of the windpipe
    strip((y) => EX + ER + 0.04, (y) => TX - TR - 0.05, muscleM, 0.003, 0.08),                                 // between food pipe and windpipe
    strip((y) => -R(y) + 1.0, (y) => EX - ER - 0.04, muscleM, 0.003, 0.08),                                    // back muscle
  ];
  // fat lobules bulging out of the fat strips + connective fibers + tiny vessels
  const lobG = new THREE.SphereGeometry(1, 20, 14);
  const lobes = new THREE.InstancedMesh(lobG, fatM, 220); lobes.frustumCulled = false; group.add(lobes);
  const lobData = Array.from({ length: 220 }, (_, i) => ({ front: i < 170, u: rnd(i + seed), y: Y0 + 1 + rnd(i + 0.4 + seed) * (Y1 - Y0 - 2), r: 0.16 + rnd(i + 0.7) * 0.16 }));
  const fibM = new THREE.MeshPhysicalMaterial({ color: '#fff6ee', roughness: 0.3, transparent: true, opacity: 0.75, clearcoat: 1, emissive: '#ffffff', emissiveIntensity: 0.08 });
  const fibers = new THREE.Group(); group.add(fibers);
  const vesM = wet('#c8202c'), veinM = wet('#3b4fb0');
  const d = new THREE.Object3D();
  const placeFat = () => {
    lobData.forEach((l, i) => {
      const x0 = l.front ? R(l.y) - 1.6 : -R(l.y) + 0.45, x1 = l.front ? R(l.y) - 0.45 + front(l.y) : -R(l.y) + 0.95;
      d.position.set(lerp(x0, x1, l.u), l.y, 0.02); d.scale.set(l.r * (1 + 0.6 * front(l.y) * 0.3), l.r * 0.85, l.r * 0.55); d.updateMatrix(); lobes.setMatrixAt(i, d.matrix);
    });
    lobes.instanceMatrix.needsUpdate = true;
    fibers.children.forEach((c) => c.geometry.dispose()); fibers.clear();
    for (let i = 0; i < 46; i++) {
      const y = Y0 + 1.5 + rnd(i * 2 + seed) * (Y1 - Y0 - 3), x0 = R(y) - 1.6, x1 = R(y) - 0.45 + front(y);
      const pts = Array.from({ length: 5 }, (_, k) => new THREE.Vector3(lerp(x0, x1, k / 4) + (rnd(i + k) - 0.5) * 0.15, y + (rnd(i + k + 0.5) - 0.5) * 0.9, 0.06 + rnd(i + k + 0.2) * 0.08));
      fibers.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.012 + rnd(i) * 0.012, 5), fibM));
    }
    for (let i = 0; i < 8; i++) {
      const y = Y0 + 2 + i * 2, xm = R(y) - 1.0 + front(y) * 0.5;
      const pts = Array.from({ length: 6 }, (_, k) => new THREE.Vector3(xm + Math.sin(k * 1.3 + i) * 0.35, y + k * 0.35, 0.05));
      fibers.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.035, 6), i % 2 ? veinM : vesM));
    }
  };
  placeFat();
  // windpipe: pink lining (inside of a half tube), C-shaped cartilage rings, membrane between
  const half = (r, h, mat, side) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 64, 400, true, Math.PI / 2, Math.PI), mat); if (side) m.material.side = side; return m; };
  const liningMap = tissueMap('#e98a92', 512, 3); liningMap.repeat.set(1, 4);
  const lining = half(TR - 0.1, Y1 - Y0, flesh('#ffffff', 2, { map: liningMap, side: THREE.BackSide, clearcoat: 1, clearcoatRoughness: 0.05 }));
  // longitudinal folds in the lining
  { const p = lining.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), yy = p.getY(i), a = Math.atan2(z, x), ring = Math.pow(0.5 + 0.5 * Math.cos(((yy - (Y0 + 0.4)) / 0.62) * Math.PI * 2), 3), k = 1 + 0.02 * Math.sin(a * 14) + 0.015 * n3(x, yy * 0.5, z) - 0.09 * ring; p.setX(i, x * k); p.setZ(i, z * k); } lining.geometry.computeVertexNormals(); }
  lining.position.x = TX; group.add(lining);
  const outer = half(TR, Y1 - Y0, flesh('#e8b4a4', 2, { clearcoat: 0.7 })); outer.position.x = TX; group.add(outer);
  const cartM = rim(flesh('#eef2f2', 2, { clearcoat: 1, clearcoatRoughness: 0.15, sheen: 0.6, sheenColor: new THREE.Color('#dff4ff') }), '#bfe6ff', 0.35, 2.5);
  parts.rings = [];
  for (let y = Y0 + 0.4; y < Y1; y += 0.62) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(TR + 0.1, 0.13, 14, 64, Math.PI), cartM);
    ring.rotation.x = Math.PI / 2; ring.rotation.z = Math.PI; ring.scale.set(1, 1, 0.8); ring.position.set(TX, y, 0); group.add(ring);
    for (const s of [1, -1]) { const cap = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), cartM); cap.scale.set(1, 0.8, 0.5); cap.position.set(TX + s * (TR + 0.1), y, 0.0); group.add(cap); }
    parts.rings.push(ring);
  }
  // food pipe: thick muscular wall, folded lining
  const eLin = half(ER - 0.2, Y1 - Y0, flesh('#d77a86', 3, { side: THREE.BackSide, clearcoat: 1 }));
  { const p = eLin.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.12 * Math.sin(a * 9); p.setX(i, x * k); p.setZ(i, z * k); } eLin.geometry.computeVertexNormals(); }
  eLin.position.x = EX; group.add(eLin);
  for (const s of [1, -1]) { const w = strip(() => EX + s * (ER - 0.2), () => EX + s * ER, flesh('#c25a66', 3, { clearcoat: 0.8 }), 0.004, 0.08); if (s < 0) w.userData.build(); }
  // spine: vertebral bodies + discs + cord
  const boneM = new THREE.MeshPhysicalMaterial({ color: '#e7d7b8', roughness: 0.55, clearcoat: 0.4, sheen: 0.3 });
  const spineX = -R(0) + 1.9;
  for (let y = Y0 + 0.3; y < Y1 - 1.5; y += 1.25) {
    const v = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.95, 0.6, 4, 0.18), boneM); v.position.set(spineX, y, -0.25); group.add(v);
    const dk = new THREE.Mesh(new RoundedBoxGeometry(1.05, 0.22, 0.5, 3, 0.08), wet('#cfe0ee', { clearcoat: 0.6 })); dk.position.set(spineX, y + 0.62, -0.22); group.add(dk);
  }
  // the tear: a ragged dark hole in the front wall, placed where the inside of the wall faces the viewer
  const PHI = -0.62, tearPos = new THREE.Vector3(TX + Math.cos(PHI) * (TR - 0.1), 0.6, Math.sin(PHI) * (TR - 0.1));
  const tearG = new THREE.Group(); tearG.position.copy(tearPos); tearG.lookAt(new THREE.Vector3(TX, 0.6, 0)); group.add(tearG);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: '#2a070b' })); hole.position.z = 0.12; tearG.add(hole);
  const flapM = flesh('#d9606c', 3, { clearcoat: 1, side: THREE.DoubleSide });
  const flaps = Array.from({ length: 22 }, (_, i) => {
    const g = new THREE.SphereGeometry(1, 10, 8); displace(g, (v) => 0.3 * n3(v.x * 3 + i, v.y * 3, v.z * 3));
    const m = new THREE.Mesh(g, flapM); m.userData.a = (i / 22) * Math.PI * 2; tearG.add(m); return m;
  });
  parts.tearPos = tearPos;
  parts.tear = (k) => {
    tearG.visible = k > 0.02; hole.scale.set(0.28 * k + 0.001, 0.42 * k + 0.001, 1);
    flaps.forEach((f, i) => { const a = f.userData.a; f.position.set(Math.cos(a) * 0.3 * k, Math.sin(a) * 0.45 * k, 0.14); f.scale.set(0.09 * k, 0.07 * k, 0.05 * k); f.rotation.set(i, a, 0); });
  };
  parts.tear(0);
  parts.swell = (k) => { if (Math.abs(k - swellK) < 1e-4) return; swellK = k; fillShell(); parts.strips.forEach((s) => s.userData.build()); placeFat(); };
  parts.R = R; parts.front = front; parts.TX = TX; parts.TR = TR; parts.fatX = (y) => R(y) - 1.0 + front(y) * 0.6;
  return { group, parts };
}
