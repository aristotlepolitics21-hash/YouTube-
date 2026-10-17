// Where the Money Lives: a cinematic 16:9 documentary engine in three.js.
// Each script line names a set; BUILD[key](p) returns { scene, cam, update(t, s, d), labels? }.
// t = 0..1 through the line, s = seconds in, d = line duration. Every frame is a pure function of time,
// so segments render in parallel. The 3D layer renders at 1280x720 under a full-resolution 2D overlay.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const W = window.FILM_W || 1920, H = window.FILM_H || 1080, RS = 2 / 3, VERT = H > W; // VERT: a 9:16 Short
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W * RS, H * RS, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const ENV = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(renderer), .04).texture;
const composer = new EffectComposer(renderer);
const rpass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
const bloom = new UnrealBloomPass(new THREE.Vector2(W * RS / 2, H * RS / 2), .55, .5, .85);
composer.addPass(rpass); composer.addPass(bloom); composer.addPass(new OutputPass());

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const out = k => (k = clamp(k), 1 - Math.pow(1 - k, 3));
const smooth = k => (k = clamp(k), k * k * (3 - 2 * k));
const frac = x => x - Math.floor(x);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- palette ----------
const C = { gold: 0xffb547, goldHi: 0xffd37a, ember: 0xff7a2f, teal: 0x3fd6e8, ink: 0x070b14, navy: 0x0b1424, steel: 0x4a5a72, sand: 0xc9a77a, red: 0xe5484d };
const GOLD = '#ffc15e', CREAM = '#f3ead8', MUTED = 'rgba(243,234,216,.62)';
const SANS = 'Inter, "DejaVu Sans", sans-serif', DISPLAY = '"Inter Display", Inter, sans-serif', SERIF = '"Bitstream Charter", Caladea, "Liberation Serif", serif';

// ---------- materials & meshes ----------
const matte = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .85, envMap: ENV, envMapIntensity: .25 }, o));
const gloss = (color, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness: .3, clearcoat: .6, envMap: ENV, envMapIntensity: .6 }, o));
const metal = (color, o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color, metalness: 1, roughness: .28, envMap: ENV, envMapIntensity: 1.1 }, o));
const glowM = (color, i = 2.5) => new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: i });
const basic = (color, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color, toneMapped: false }, o));
const additive = (color, o = {}) => basic(color, Object.assign({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }, o));
function M(geo, mat, o = {}) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = o.shadow !== false; m.receiveShadow = o.receive !== false;
  if (o.pos) m.position.set(...o.pos); if (o.rot) m.rotation.set(...o.rot); if (o.scale !== undefined) Array.isArray(o.scale) ? m.scale.set(...o.scale) : m.scale.setScalar(o.scale);
  return m;
}
const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const RB = (w, h, d, r = .08) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - .001, h / 2 - .001, d / 2 - .001));
const SPH = (r, a = 32, b = 20) => new THREE.SphereGeometry(r, a, b);
const CYL = (r1, r2, h, n = 24) => new THREE.CylinderGeometry(r1, r2, h, n);
function G(...kids) { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; }

function ctex(wpx, hpx, draw) {
  const cv = document.createElement('canvas'); cv.width = wpx; cv.height = hpx; const x = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  if (draw) draw(x, wpx, hpx); tex.needsUpdate = true; return { tex, x, cv };
}
const GLOW = ctex(128, 128, (x, w) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); }).tex;
function glowSprite(color, size, op = 1) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); s.scale.setScalar(size); return s; }
// windows for buildings: a shared texture of lit and dark panes
const WINDOWS = (() => { const r = rng(7); const t = ctex(256, 512, (x, w, h) => { x.fillStyle = '#0b0f18'; x.fillRect(0, 0, w, h);
  for (let j = 0; j < 32; j++) for (let i = 0; i < 8; i++) { const on = r() < .55; x.fillStyle = on ? `hsl(${36 + r() * 12},95%,${55 + r() * 20}%)` : '#141a26'; x.fillRect(i * 32 + 6, j * 16 + 4, 20, 9); } }).tex;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();

// ---------- geography ----------
let GEO = null; const RIVERS = {
  nile: [[31.25, 30.05], [31.1, 29.07], [30.75, 28.1], [31.18, 27.18], [31.7, 26.55], [32.72, 26.16], [32.64, 25.69], [32.9, 24.09], [31.35, 21.8], [30.48, 19.17], [31.8, 18.1], [33.32, 19.53], [33.98, 17.7], [32.53, 15.6], [32.66, 13.17], [31.65, 9.53], [31.6, 4.85], [31.4, 2.4]],
  nile_rosetta: [[31.25, 30.05], [30.9, 30.6], [30.4, 31.45]], nile_damietta: [[31.25, 30.05], [31.4, 30.8], [31.82, 31.45]], blue_nile: [[32.53, 15.6], [33.6, 13.5], [34.4, 11.3], [35.8, 10.5], [37.3, 11.6]],
  rhine: [[4.1, 51.95], [5.9, 51.85], [6.77, 51.2], [6.95, 50.94], [7.6, 50.36], [8.27, 50.0], [8.47, 49.49], [8.4, 49.0], [7.75, 48.58], [7.59, 47.56], [8.6, 47.6], [9.5, 47.5]],
  danube: [[29.6, 45.2], [28.0, 45.4], [27.9, 44.2], [25.4, 43.6], [22.9, 44.0], [22.4, 44.6], [20.46, 44.82], [19.0, 45.2], [18.9, 46.0], [19.04, 47.5], [18.9, 47.8], [17.1, 48.14], [16.37, 48.2], [14.29, 48.3], [13.43, 48.57], [12.1, 49.0], [10.0, 48.4], [8.5, 47.95]],
  thames: [[1.4, 51.45], [0.5, 51.48], [-0.12, 51.5], [-0.5, 51.45], [-1.0, 51.5], [-1.25, 51.75]],
  elbe: [[8.7, 53.87], [9.99, 53.55], [10.8, 53.2], [11.63, 52.13], [12.2, 51.85], [13.0, 51.3], [13.74, 51.05], [14.2, 50.7], [14.5, 50.4]],
  mississippi: [[-89.25, 29.15], [-90.07, 29.95], [-91.19, 30.45], [-91.4, 31.5], [-91.05, 32.35], [-91.15, 33.5], [-90.05, 35.15], [-89.6, 36.5], [-89.18, 37.0], [-90.19, 38.63], [-91.0, 40.4], [-90.6, 41.5], [-91.2, 43.0], [-92.0, 44.4], [-93.1, 44.95], [-94.0, 46.0], [-95.2, 47.24]],
  missouri: [[-90.19, 38.8], [-91.5, 38.6], [-92.2, 38.6], [-94.58, 39.1], [-95.9, 41.26], [-96.4, 42.5], [-98.0, 43.0], [-100.35, 44.37], [-100.8, 46.8], [-103.0, 47.8], [-106.0, 48.0], [-109.5, 47.7], [-111.3, 47.5]],
  ohio: [[-89.18, 37.0], [-88.6, 37.1], [-87.6, 37.9], [-85.76, 38.25], [-84.5, 39.1], [-82.6, 38.6], [-81.6, 39.3], [-80.7, 40.2], [-80.0, 40.44]],
  congo: [[12.3, -6.05], [13.45, -5.82], [14.2, -5.0], [15.3, -4.3], [16.2, -3.2], [16.5, -2.0], [17.6, -.5], [18.27, .05], [19.6, 1.3], [21.0, 2.0], [22.5, 1.7], [24.0, 1.0], [25.2, .5], [25.5, -1.0], [26.0, -3.0], [26.5, -5.0], [27.0, -7.0], [26.9, -9.0]],
  niger: [[6.0, 4.4], [6.75, 5.3], [6.75, 7.8], [5.5, 8.6], [4.5, 9.5], [3.5, 11.5], [2.1, 13.5], [.5, 15.0], [.05, 16.27], [-3.0, 16.77], [-4.2, 15.0], [-5.0, 14.0], [-6.3, 13.0], [-8.0, 12.65], [-9.0, 11.0], [-10.6, 9.2]],
  zambezi: [[36.3, -18.8], [35.3, -17.6], [33.6, -16.15], [32.7, -15.6], [30.4, -15.6], [28.8, -16.5], [27.4, -17.8], [25.85, -17.93], [24.3, -17.5], [23.1, -15.5], [22.7, -13.5], [24.3, -11.4]],
  james: [[-79.4, 37.7], [-78.5, 37.6], [-77.44, 37.54], [-76.9, 37.25], [-76.3, 36.95]], savannah: [[-82.8, 34.4], [-82.3, 33.9], [-81.97, 33.47], [-81.6, 32.8], [-80.9, 32.03]],
  chattahoochee: [[-84.2, 34.1], [-84.6, 33.5], [-84.99, 32.46], [-85.05, 31.4], [-84.86, 30.7]], potomac: [[-78.3, 39.6], [-77.5, 39.2], [-77.07, 38.9], [-77.0, 38.4], [-76.3, 38.0]],
  susquehanna: [[-76.9, 41.2], [-76.88, 40.27], [-76.2, 39.7], [-76.08, 39.54]], delaware: [[-75.1, 41.3], [-74.76, 40.22], [-75.15, 39.95], [-75.5, 39.4]],
  hudson_erie: [[-74.0, 40.7], [-73.95, 41.5], [-73.75, 42.65], [-76.15, 43.05], [-77.6, 43.16], [-78.88, 42.89]],
  yangtze: [[121.8, 31.4], [120.3, 31.9], [118.8, 32.05], [117.0, 30.5], [116.0, 29.7], [114.3, 30.6], [112.2, 30.3], [111.3, 30.7], [109.5, 31.0], [106.55, 29.56], [104.6, 28.8], [102.0, 26.5], [100.2, 26.9], [99.5, 28.5], [97.5, 32.0]],
  pearl: [[113.6, 22.3], [113.3, 23.1], [112.5, 23.1], [111.3, 23.5], [110.3, 23.4], [109.4, 23.7], [107.5, 23.1], [105.5, 24.8]],
  ganges: [[88.2, 22.0], [88.4, 23.2], [88.0, 24.5], [87.2, 25.3], [85.15, 25.6], [83.0, 25.3], [81.85, 25.43], [80.3, 26.45], [79.0, 27.6], [78.15, 29.95], [78.6, 30.9]],
  seine: [[0.1, 49.48], [1.1, 49.44], [1.9, 49.0], [2.35, 48.86], [2.66, 48.54], [4.08, 48.3], [4.7, 47.8]],
  po: [[12.4, 44.95], [11.6, 44.95], [10.9, 45.05], [9.7, 45.1], [8.6, 45.1], [7.7, 45.05], [7.1, 44.7]],
  st_lawrence: [[-61.5, 49.6], [-66.0, 49.2], [-69.5, 48.0], [-71.2, 46.8], [-72.5, 46.3], [-73.55, 45.5], [-74.7, 45.0], [-75.9, 44.4], [-76.5, 44.2], [-79.4, 43.6], [-82.0, 42.6], [-83.0, 42.3]],
  volga: [[48.03, 46.35], [44.5, 48.7], [46.0, 51.53], [48.5, 53.0], [50.1, 53.2], [49.1, 55.8], [46.5, 56.1], [44.0, 56.3], [39.87, 57.63], [35.9, 56.86], [33.0, 57.2]],
  han: [[126.6, 37.75], [126.9, 37.55], [127.2, 37.53], [127.5, 37.5], [128.0, 37.3]],
  meuse: [[4.1, 51.85], [5.0, 51.75], [5.85, 51.8], [6.0, 51.3], [5.7, 50.85], [5.6, 50.6], [4.85, 50.45], [4.9, 49.9]],
  roanoke: [[-79.9, 37.2], [-78.5, 36.6], [-77.6, 36.48], [-76.7, 35.9]], congaree: [[-81.8, 34.6], [-81.03, 34.0], [-80.6, 33.5], [-79.3, 33.2]],
};
const REGIONS = { // lon0, lon1, lat0, lat1
  egypt: [23, 39, 20, 32.6], japan: [127, 148, 29.5, 46.5], world: [-170, 180, -56, 76], europe: [-11.5, 33, 35.5, 60.5], usa: [-126, -66, 23, 50.5],
  africa: [-21, 53, -36, 38], bayarea: [-123.2, -121.4, 36.85, 38.25], fallline: [-88, -72, 29.5, 41.5], korea: [123.5, 131.5, 33, 43.3],
};
// projection for a flat regional map: equirectangular scaled by cos(mid latitude), fitted into a plane of width PW
const PW = 16;
function projector(reg) {
  const [l0, l1, a0, a1] = REGIONS[reg], cl = Math.cos((a0 + a1) / 2 * Math.PI / 180), sx = PW / ((l1 - l0) * cl), ph = (a1 - a0) * sx;
  const f = (lon, lat) => [((lon - (l0 + l1) / 2) * cl) * sx, (lat - (a0 + a1) / 2) * sx];
  return { f, w: PW, h: ph, sx, cl, b: [l0, l1, a0, a1] };
}
function pointInRing(x, y, ring) { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
const inCountry = (id, lon, lat) => (GEO.countries[id] || []).some(r => pointInRing(lon, lat, r));
const cityCache = {};
function citiesIn(reg, pad = 0) { const [l0, l1, a0, a1] = REGIONS[reg]; return GEO.cities.filter(([x, y]) => x > l0 - pad && x < l1 + pad && y > a0 - pad && y < a1 + pad); }

// map texture of a region: ocean, land, borders, optional coast glow, highlighted countries and city lights
const mapTexCache = {};
function mapTexture(reg, o = {}) {
  const key = reg + JSON.stringify(o); if (mapTexCache[key]) return mapTexCache[key];
  const P = projector(reg), TW = 2048, TH = Math.round(TW * P.h / P.w), k = TW / P.w;
  const px = (lon, lat) => { const [x, y] = P.f(lon, lat); return [TW / 2 + x * k, TH / 2 - y * k]; };
  const t = ctex(TW, TH, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * .75); g.addColorStop(0, '#0c1a2c'); g.addColorStop(1, '#050a13'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    // faint graticule
    x.strokeStyle = 'rgba(120,160,200,.07)'; x.lineWidth = 1.5; const [l0, l1, a0, a1] = P.b, st = (l1 - l0) > 60 ? 15 : (l1 - l0) > 10 ? 5 : 1;
    for (let lo = Math.ceil(l0 / st) * st; lo <= l1; lo += st) { x.beginPath(); const [X0, Y0] = px(lo, a0), [X1, Y1] = px(lo, a1); x.moveTo(X0, Y0); x.lineTo(X1, Y1); x.stroke(); }
    for (let la = Math.ceil(a0 / st) * st; la <= a1; la += st) { x.beginPath(); const [X0, Y0] = px(l0, la), [X1, Y1] = px(l1, la); x.moveTo(X0, Y0); x.lineTo(X1, Y1); x.stroke(); }
    const path = rings => { x.beginPath(); rings.forEach(r => { r.forEach(([lo, la], i) => { if (lo < l0 - 40 || lo > l1 + 40) return; const [X, Y] = px(lo, la); i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath(); }); };
    const ids = Object.keys(GEO.countries);
    const glowStroke = (rings, col, w) => [[w * 6, .08], [w * 3, .18], [w, 1]].forEach(([lw, a]) => { x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = lw; rings.forEach(r => { path(r); x.stroke(); }); x.globalAlpha = 1; });
    if (o.coast) glowStroke(ids.map(id => GEO.countries[id]), 'rgb(110,225,255)', 3);
    ids.forEach(id => { path(GEO.countries[id]); const hl = (o.hl || []).includes(id), dim = (o.dark || []).includes(id);
      x.fillStyle = hl ? '#3a3020' : dim ? '#0d121b' : '#18212f'; x.fill(); });
    x.strokeStyle = 'rgba(150,175,205,.22)'; x.lineWidth = 1.6; ids.forEach(id => { path(GEO.countries[id]); x.stroke(); });
    if (o.hl) glowStroke(o.hl.map(id => GEO.countries[id]), GOLD, 4);
    if (o.lights) { x.globalCompositeOperation = 'lighter';
      citiesIn(reg, 2).forEach(([lo, la, pop]) => { let a = 1; if (o.dark && o.dark.some(id => inCountry(id, lo, la))) a = (pop > 2e6 ? .5 : .03);
        const [X, Y] = px(lo, la), r = Math.max(2, Math.sqrt(pop / 1e6) * (8 + k * P.sx * P.cl * .07) * (o.lightScale || 1)); const gg = x.createRadialGradient(X, Y, 0, X, Y, r * 3);
        gg.addColorStop(0, `rgba(255,236,190,${.95 * a})`); gg.addColorStop(.25, `rgba(255,190,90,${.55 * a})`); gg.addColorStop(1, 'rgba(255,140,40,0)'); x.fillStyle = gg; x.fillRect(X - r * 3, Y - r * 3, r * 6, r * 6); });
      x.globalCompositeOperation = 'source-over'; }
  });
  return (mapTexCache[key] = { tex: t.tex, P, TW, TH });
}
// globe night texture (equirectangular), built once
let NIGHT = null;
function nightTextures() {
  if (NIGHT) return NIGHT; const TW = 4096, TH = 2048, px = (lo, la) => [(lo + 180) / 360 * TW, (90 - la) / 180 * TH];
  const path = (x, rings) => { x.beginPath(); rings.forEach(r => { let prev = null; r.forEach(([lo, la], i) => { const [X, Y] = px(lo, la); if (i && Math.abs(lo - prev) > 180) x.moveTo(X, Y); else i ? x.lineTo(X, Y) : x.moveTo(X, Y); prev = lo; }); x.closePath(); }); };
  const base = ctex(TW, TH, (x, w, h) => { x.fillStyle = '#071121'; x.fillRect(0, 0, w, h); Object.values(GEO.countries).forEach(r => { path(x, r); x.fillStyle = '#25324a'; x.fill(); });
    x.strokeStyle = 'rgba(160,185,215,.18)'; x.lineWidth = 1.2; Object.values(GEO.countries).forEach(r => { path(x, r); x.stroke(); }); });
  const lights = ctex(TW, TH, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'lighter';
    GEO.cities.forEach(([lo, la, pop]) => { if (inKoreaNorth(lo, la) && pop < 2e6) return; const [X, Y] = px(lo, la), r = Math.max(1, Math.sqrt(pop) * .0035), sx = 1 / Math.max(.2, Math.cos(la * Math.PI / 180));
      const g = x.createRadialGradient(X, Y, 0, X, Y, r * 2.6); g.addColorStop(0, 'rgba(255,230,180,.8)'); g.addColorStop(.3, 'rgba(255,170,70,.4)'); g.addColorStop(1, 'rgba(255,120,30,0)');
      x.save(); x.translate(X, Y); x.scale(sx, 1); x.translate(-X, -Y); x.fillStyle = g; x.fillRect(X - r * 2.6, Y - r * 2.6, r * 5.2, r * 5.2); x.restore(); }); });
  return (NIGHT = { base: base.tex, lights: lights.tex });
}
const inKoreaNorth = (lo, la) => lo > 124 && lo < 131 && la > 37.6 && la < 43.1 && inCountry('408', lo, la);
const ll2v = (lon, lat, r = 1) => { const ph = (lon + 180) / 180 * Math.PI, th = lat * Math.PI / 180; return V(-Math.cos(ph) * Math.cos(th) * r, Math.sin(th) * r, Math.sin(ph) * Math.cos(th) * r); };

// ---------- stages ----------
function starfield(n = 1500, R = 60, seed = 3) { const r = rng(seed), p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const v = V(r() - .5, r() - .5, r() - .5).normalize().multiplyScalar(R * (.8 + r() * .2)); p.set([v.x, v.y, v.z], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color: 0xbfd2ff, size: .12, sizeAttenuation: true, transparent: true, opacity: .8, toneMapped: false })); }
// a moody cinematic stage: gradient sky, fog, warm key with shadows, cool rim, a ground plane
function stage(o = {}) {
  const scene = new THREE.Scene(); const top = o.top ?? '#0a1120', bottom = o.bottom ?? '#2a1c16';
  scene.background = ctex(8, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(.62, o.mid ?? '#1a1a26'); g.addColorStop(1, bottom); x.fillStyle = g; x.fillRect(0, 0, w, h); }).tex;
  scene.fog = new THREE.Fog(new THREE.Color(o.fog ?? '#161722'), o.fogNear ?? 18, o.fogFar ?? 60);
  scene.add(new THREE.HemisphereLight(o.sky ?? 0x8aa4d6, o.ground ?? 0x2a1d14, o.hemi ?? .55));
  const key = new THREE.DirectionalLight(o.key ?? 0xffc98a, o.keyI ?? 2.2); key.position.set(...(o.keyPos ?? [-8, 9, 6])); key.castShadow = o.shadows !== false;
  const b = o.shadowBox ?? 10; Object.assign(key.shadow.camera, { left: -b, right: b, top: b, bottom: -b, near: .5, far: 60 });
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -.0005; key.shadow.normalBias = .03; scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(o.rim ?? 0x6fb6ff, o.rimI ?? 1.4); rim.position.set(7, 5, -9); scene.add(rim);
  if (o.floor !== null) scene.add(M(new THREE.CircleGeometry(80, 64), matte(o.floor ?? 0x1b1814, { roughness: .95 }), { rot: [-Math.PI / 2, 0, 0], shadow: false }));
  const cam = new THREE.PerspectiveCamera(o.fov ?? 35, W / H, .1, 300);
  return { scene, cam, key, rim };
}
let NOW = 0;
// a slow, weighty handheld drift, like a camera on a fluid head
function aim(cam, pos, look, drift = 1) {
  cam.position.set(...pos); const d = drift * .05;
  cam.position.x += Math.sin(NOW * .37) * d * 2 + Math.sin(NOW * 1.13) * d * .4; cam.position.y += Math.sin(NOW * .51 + 1) * d * 1.4; cam.lookAt(look[0] + Math.sin(NOW * .29) * d, look[1], look[2]);
}

// ---------- props ----------
function building(w, h, d, o = {}) {
  const tex = WINDOWS.clone(); tex.repeat.set(Math.max(1, Math.round(w * 2)) / 8, Math.max(1, Math.round(h * 4)) / 32); tex.offset.set((o.seed ?? 0) * .37 % 1, (o.seed ?? 0) * .61 % 1); tex.needsUpdate = true;
  const mat = new THREE.MeshStandardMaterial({ color: o.color ?? 0x2b3140, roughness: .55, metalness: .2, envMap: ENV, envMapIntensity: .4, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: o.lit ?? 1.2 });
  const m = M(BOX(w, h, d), [mat, mat, matte(o.roof ?? 0x1c212c), matte(0x111111), mat, mat]); m.geometry.translate(0, h / 2, 0); m.userData.mat = mat; return m;
}
function person(color = 0xe8dcc4, o = {}) {
  const g = new THREE.Group(), body = M(new THREE.CapsuleGeometry(.13, .38, 6, 12), gloss(color, { roughness: .6 }), { pos: [0, .38, 0] }), head = M(SPH(.12, 20, 14), gloss(o.skin ?? 0xd9b48f, { roughness: .7 }), { pos: [0, .78, 0] });
  g.add(body, head); if (o.glow) g.add(glowSprite(o.glow, 1.1, .5)); g.userData = { body, head };
  g.walk = (ph) => { body.rotation.z = Math.sin(ph) * .06; g.children[0].position.y = .38 + Math.abs(Math.sin(ph)) * .04; };
  return g;
}
function tree(s = 1, col = 0x2f5a35) { return G(M(CYL(.05 * s, .07 * s, .5 * s, 8), matte(0x4a3524), { pos: [0, .25 * s, 0] }), M(SPH(.32 * s, 12, 10), matte(col), { pos: [0, .7 * s, 0], scale: [1, .9, 1] })); }
function ship(scale = 1, sailCol = 0xeadcc0) {
  const sh = new THREE.Shape(); sh.moveTo(-1.3, .35); sh.lineTo(1.5, .35); sh.quadraticCurveTo(1.25, -.1, .9, -.3); sh.lineTo(-1.0, -.3); sh.quadraticCurveTo(-1.25, -.05, -1.3, .35);
  const hull = M(new THREE.ExtrudeGeometry(sh, { depth: .7, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 2 }), gloss(0x5a3a22, { roughness: .6 })); hull.geometry.translate(0, 0, -.35);
  const mast = M(CYL(.035, .045, 2.2, 8), matte(0x3a2716), { pos: [0, 1.4, 0] });
  const sailG = new THREE.PlaneGeometry(1.5, 1.4, 8, 4); const sail = M(sailG, matte(sailCol, { side: THREE.DoubleSide, roughness: .9 }), { pos: [0, 1.55, .05], rot: [0, Math.PI / 2, 0] });
  const g = G(hull, mast, sail); g.scale.setScalar(scale); g.rotation.y = Math.PI / 2; g.userData.sail = sail; return g;
}
function water(w, d, col = 0x0d2a3e, o = {}) {
  const geo = new THREE.PlaneGeometry(w, d, o.seg ?? 60, o.seg ?? 60); geo.rotateX(-Math.PI / 2);
  const m = M(geo, new THREE.MeshPhysicalMaterial({ color: col, roughness: .28, metalness: .05, envMap: ENV, envMapIntensity: .35, transparent: o.op !== undefined, opacity: o.op ?? 1 }), { shadow: false });
  const base = geo.attributes.position.array.slice();
  m.update = (s, amp = .06, sp = 1) => { const a = geo.attributes.position.array; for (let i = 0; i < a.length; i += 3) { const x = base[i], z = base[i + 2]; a[i + 1] = base[i + 1] + Math.sin(x * .9 + s * 1.3 * sp) * amp + Math.sin(z * 1.4 - s * 1.7 * sp + x * .3) * amp * .6; } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); };
  return m;
}
// a field of particles drifting in from the edges toward a point (people moving to a city)
function inflow(n, center, R, color = C.goldHi, seed = 1, size = .35) {
  const r = rng(seed), g = new THREE.Group(); const ps = [...Array(n)].map(() => { const sp = glowSprite(color, size, .9); g.add(sp); return { sp, a: r() * Math.PI * 2, o: r(), sp0: .25 + r() * .35 }; });
  g.update = (s, rate = 1, op = 1) => ps.forEach(p => { const f = frac(p.o + s * p.sp0 * .25 * rate), rr = R * (1 - smooth(f)); p.sp.position.set(center[0] + Math.cos(p.a) * rr, center[1] + .3 + Math.sin(f * Math.PI) * .6, center[2] + Math.sin(p.a) * rr); p.sp.material.opacity = Math.sin(f * Math.PI) * op; });
  return g;
}
// gold dust floating in the air for quotes and titles
function dust(n = 400, box = [30, 14, 30], seed = 11, color = C.goldHi) {
  const r = rng(seed), p = new Float32Array(n * 3), base = []; for (let i = 0; i < n; i++) { base.push([(r() - .5) * box[0], r() * box[1], (r() - .5) * box[2], r() * 6]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color, size: .09, map: GLOW, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  pts.update = s => { base.forEach(([x, y, z, ph], i) => p.set([x + Math.sin(s * .2 + ph) * .6, y + Math.sin(s * .13 + ph * 2) * .4 + s * .03, z + Math.cos(s * .17 + ph) * .6], i * 3)); g.attributes.position.needsUpdate = true; };
  pts.update(0); return pts;
}
// glowing tube along a polyline, revealed from start to end
function tube(pts, r = .03, color = C.teal, i = 2.2) {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'), n = Math.max(16, pts.length * 12);
  const geo = new THREE.TubeGeometry(curve, n, r, 6, false), m = M(geo, glowM(color, i), { shadow: false });
  const total = geo.index.count; m.reveal = k => geo.setDrawRange(0, Math.floor(total * clamp(k) / 36) * 36); m.reveal(1); return m;
}
// a ring that pulses outward from a point
function pulseRing(color = C.gold, r = .5) { const m = M(new THREE.RingGeometry(r * .82, r, 64), additive(color, { side: THREE.DoubleSide }), { rot: [-Math.PI / 2, 0, 0], shadow: false });
  m.update = (s, k = 1) => { const f = frac(s * .6); m.scale.setScalar(.3 + f * 2.2); m.material.opacity = (1 - f) * k; }; return m; }

// ---------- gold "wealth towers" ----------
// instanced gold columns: one per city or cell, heights animated by the caller
function towers(items, o = {}) {
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, .5, 0);
  const mat = new THREE.MeshPhysicalMaterial({ color: o.color ?? 0xffa63a, emissive: o.emissive ?? 0xff8a1c, emissiveIntensity: o.ei ?? .9, metalness: .6, roughness: .3, envMap: ENV, envMapIntensity: .8, transparent: o.op !== undefined, opacity: o.op ?? 1 });
  const im = new THREE.InstancedMesh(geo, mat, items.length); im.castShadow = o.shadow !== false; im.receiveShadow = true;
  const d = new THREE.Object3D();
  im.set = fn => { items.forEach((it, i) => { const h = Math.max(.0001, fn(it, i)); d.position.set(it.x, 0, it.z); d.scale.set(it.w ?? o.w ?? .12, h, it.w ?? o.w ?? .12); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }); im.instanceMatrix.needsUpdate = true; };
  im.items = items; return im;
}

// ---------- labels projected into the overlay ----------
const _v = new THREE.Vector3();
function project(cam, p) { _v.copy(p).project(cam); return [(_v.x + 1) / 2 * W, (1 - _v.y) / 2 * H, _v.z < 1]; }

const BUILD = {};
// ===== globe =====
BUILD.globe_night = (p) => {
  const N = nightTextures(), scene = new THREE.Scene(); scene.background = new THREE.Color(0x02040a);
  const earth = M(SPH(1, 128, 64), new THREE.MeshStandardMaterial({ map: N.base, emissive: 0xffffff, emissiveMap: N.lights, emissiveIntensity: 1.1, roughness: .8, metalness: 0 }), { shadow: false });
  scene.add(earth, starfield());
  const atm = M(SPH(1.12, 96, 48), new THREE.ShaderMaterial({ transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
    vertexShader: 'varying vec3 n; varying vec3 v; void main(){ n=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); v=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 n; varying vec3 v; void main(){ float f=pow(clamp(.72-abs(dot(n,v)),0.,1.),2.2)*2.2; gl_FragColor=vec4(vec3(.3,.58,1.)*f, f); }' }), { shadow: false });
  scene.add(atm); scene.add(new THREE.AmbientLight(0x6e86b8, .55)); const sun = new THREE.DirectionalLight(0x9fb7ff, 1.1); scene.add(sun);
  const cam = new THREE.PerspectiveCamera(32, W / H, .05, 200);
  // talent arcs between big cities
  const arcs = []; if (p.arcs) { const hubs = [[-122.4, 37.8], [-74, 40.7], [-0.1, 51.5], [2.35, 48.85], [13.4, 52.5], [139.7, 35.7], [121.5, 31.2], [77.6, 12.97], [103.8, 1.35], [-46.6, -23.5], [28.97, 41.0], [37.6, 55.75], [126.98, 37.57], [114.1, 22.4], [-79.4, 43.7], [18.4, -33.9]];
    const r = rng(5); for (let i = 0; i < 18; i++) { const a = hubs[Math.floor(r() * hubs.length)], b = hubs[Math.floor(r() * hubs.length)]; if (a === b) continue; const A = ll2v(...a, 1.002), B = ll2v(...b, 1.002), mid = A.clone().add(B).multiplyScalar(.5), h = 1 + A.distanceTo(B) * .35;
      const pts = [...Array(24)].map((_, j) => { const u = j / 23, q = A.clone().lerp(B, u); return q.normalize().multiplyScalar(1.002 + Math.sin(u * Math.PI) * (h - 1)); }); const tb = tube(pts, .0035, C.goldHi, 3); tb.userData.d = r() * .4; scene.add(tb); arcs.push(tb); } }
  const sphPos = (lon, lat, d) => ll2v(lon, lat, d);
  return { scene, cam, update(t, s) {
    const k = ease(t), lon = lerp(p.from[0], p.to[0], k), lat = lerp(p.from[1], p.to[1], k), d = lerp(p.dist[0], p.dist[1], k);
    cam.position.copy(sphPos(lon, lat, d)); sun.position.copy(sphPos(lon - 70, lat + 20, 5));
    const side = V(0, 1, 0).cross(cam.position.clone().normalize()).normalize();
    cam.lookAt(side.multiplyScalar(p.stat ? -.35 : 0)); earth.material.emissiveIntensity = 1.1 + Math.sin(s * .6) * .06;
    arcs.forEach(a => a.reveal(seg(t, a.userData.d, a.userData.d + .45)));
  } };
};
// ===== flat regional map, tilted =====
BUILD.map_region = (p) => {
  if (p.bbox) REGIONS[p.region] = p.bbox;
  const reg = p.region, opts = { hl: p.hl, coast: p.coast, lights: p.lights || reg === 'korea' || reg === 'japan' || reg === 'egypt' || reg === 'bayarea', dark: reg === 'korea' ? ['408'] : p.dark, lightScale: reg === 'bayarea' ? .35 : reg === 'world' ? .55 : 1 };
  const T = mapTexture(reg, opts), P = T.P, scene = new THREE.Scene(); scene.background = new THREE.Color(0x03060c); scene.fog = new THREE.Fog(0x03060c, 14, 40);
  const plane = M(new THREE.PlaneGeometry(P.w, P.h), new THREE.MeshStandardMaterial({ map: T.tex, emissive: 0xffffff, emissiveMap: T.tex, emissiveIntensity: .55, roughness: .9 }), { rot: [-Math.PI / 2, 0, 0], shadow: false });
  scene.add(plane); scene.add(new THREE.HemisphereLight(0x9fb8e0, 0x111111, .9)); const key = new THREE.DirectionalLight(0xffd7a0, 1.4); key.position.set(-6, 10, 6); scene.add(key);
  const at = (lon, lat, y = 0) => { const [x, z] = P.f(lon, lat); return V(x, y, -z); };
  const rivers = (p.river || []).flatMap(n => [n, ...(n === 'nile' ? ['nile_rosetta', 'nile_damietta', 'blue_nile'] : [])]).map((n, i) => { const tb = tube(RIVERS[n].map(([a, b]) => at(a, b, .02)), reg === 'world' ? .02 : .045, C.teal, 2.6); tb.userData.d = i * .06; scene.add(tb); return tb; });
  if (reg === 'fallline') ['james', 'savannah', 'chattahoochee', 'potomac', 'susquehanna', 'delaware', 'roanoke', 'congaree'].forEach(n => scene.add(tube(RIVERS[n].map(([a, b]) => at(a, b, .02)), .035, C.teal, 2)));
  const labels = [], falls = (p.falls || []).map(([lo, la]) => { const r = pulseRing(0xffffff, .35); r.position.copy(at(lo, la, .05)); scene.add(r); labels.push({ p: at(lo, la, .1), text: 'RAPIDS', small: 1, k: 0 }); return r; });
  const pulse = p.pulse ? (() => { const r = pulseRing(C.gold, .6); r.position.copy(at(...p.pulse, .05)); scene.add(r); return r; })() : null;
  // gold towers for the biggest cities in the region
  const big = citiesIn(reg).filter(c => !(reg === 'korea' && inKoreaNorth(c[0], c[1]))).sort((a, b) => b[2] - a[2]).slice(0, reg === 'world' ? 60 : 30).map(([lo, la, pop]) => { const v = at(lo, la); return { x: v.x, z: v.z, pop }; });
  const tw = towers(big, { w: reg === 'world' ? .06 : reg === 'bayarea' ? .12 : .09, ei: 1.1 }); scene.add(tw);
  const showTowers = p.towers ?? (reg === 'japan' || reg === 'world' || reg === 'korea' || p.lights);
  const seam = p.seam ? tube(p.seam.map(([a, b]) => at(a, b, .04)), .035, 0xffffff, 1.8) : null; if (seam) scene.add(seam);
  const pins = (p.pins || []).map(([lo, la, name]) => { const g = G(M(new THREE.ConeGeometry(.08, .3, 16), glowM(C.gold, 2), { pos: [0, .2, 0], rot: [Math.PI, 0, 0] }), glowSprite(C.gold, .7, .6)); g.position.copy(at(lo, la)); scene.add(g); labels.push({ p: at(lo, la, .45), text: name, k: 0 }); return g; });
  // fall line: a dashed seam through the cities, then trading posts, then railways
  let fl = null, rails = [], flc = [];
  if (reg === 'fallline') { const FL = [[-74.76, 40.22, 'Trenton'], [-75.15, 39.95, 'Philadelphia'], [-76.61, 39.29, 'Baltimore'], [-77.07, 38.9, 'Washington'], [-77.46, 38.3, ''], [-77.44, 37.54, 'Richmond'], [-78.64, 35.78, 'Raleigh'], [-81.03, 34.0, 'Columbia'], [-81.97, 33.47, 'Augusta'], [-83.63, 32.84, 'Macon'], [-84.99, 32.46, 'Columbus']];
    fl = tube(FL.map(([a, b]) => at(a, b, .03)), .03, 0xffffff, 1.6); scene.add(fl);
    flc = FL.filter(f => f[2]).map(([lo, la, n]) => { const b = M(BOX(.16, 1, .16), new THREE.MeshPhysicalMaterial({ color: 0xffa63a, emissive: 0xff8a1c, emissiveIntensity: 1, metalness: .6, roughness: .3 })); b.geometry.translate(0, .5, 0); b.position.copy(at(lo, la)); scene.add(b); const L = { p: at(lo, la, .2), text: n, k: 0, small: 1 }; labels.push(L); return { b, L, n }; });
    if (p.rail) [[[-84.39, 33.75], [-81.03, 34.0], [-80.84, 35.23], [-78.64, 35.78], [-77.44, 37.54], [-77.03, 38.9], [-76.61, 39.29], [-75.15, 39.95], [-74.0, 40.7]], [[-90.07, 29.95], [-86.8, 33.5], [-84.39, 33.75]], [[-84.39, 33.75], [-85.3, 35.05], [-86.78, 36.16]], [[-81.1, 32.08], [-83.63, 32.84], [-84.39, 33.75]]]
      .forEach(r => { const tb = tube(r.map(([a, b]) => at(a, b, .04)), .025, 0xd8dde8, 1.1); scene.add(tb); rails.push(tb); }); }
  const cam = new THREE.PerspectiveCamera(VERT ? 44 : 32, W / H, .1, 200), span = VERT ? Math.max(P.w * 2.05, P.h * 1.05) : Math.max(P.w, P.h * 1.6);
  const focus = p.pulse ? at(...p.pulse) : p.pins ? at(p.pins[0][0], p.pins[0][1]) : V(0, 0, 0);
  return { scene, cam, labels, update(t, s) {
    const k = ease(t), dist = span * lerp(.92, .74, k) * (p.zoom || 1), tilt = VERT ? lerp(1.22, 1.1, k) : lerp(.95, .8, k);
    if (seam) seam.reveal(seg(t, .1, .6));
    const fx = lerp(0, focus.x, .5 * k), fz = lerp(0, focus.z, .5 * k);
    aim(cam, [fx + Math.sin(s * .05) * .4 - lerp(.6, .2, k), Math.sin(tilt) * dist * .78, fz + Math.cos(tilt) * dist * .78 + 1.2], [fx, 0, fz - .3], .6);
    rivers.forEach(r => r.reveal(seg(t, .08 + r.userData.d, .55 + r.userData.d)));
    falls.forEach((r, i) => { r.update(s, seg(t, .45, .55)); labels[i].k = seg(t, .45, .55); });
    if (pulse) pulse.update(s, 1); scene.fog.far = VERT ? 80 : 40;
    tw.visible = showTowers; tw.set((it, i) => Math.pow(it.pop, .5) * (reg === 'world' ? .00035 : .00028) * out(seg(t, .15 + i * .008, .55 + i * .008)) * (reg === 'bayarea' ? 2 : 1));
    pins.forEach((g, i) => { const kk = out(seg(t, .12 + i * .1, .25 + i * .1)); g.scale.setScalar(kk); g.position.y = (1 - kk) * .5; labels.find(l => l.text === p.pins[i][2]).k = kk; });
    if (fl) { fl.reveal(p.fall === 1 ? seg(t, .2, .8) : 1); flc.forEach((c, i) => { const g = p.fall === 1 ? 0 : p.fall === 2 ? out(seg(t, .1 + i * .07, .3 + i * .07)) : 1; c.b.scale.set(1, .0001 + g * .9, 1); c.L.k = p.fall === 1 ? 0 : (['Richmond', 'Augusta', 'Columbus'].includes(c.n) ? 1 : .55) * g; c.L.hot = ['Richmond', 'Augusta', 'Columbus'].includes(c.n); });
      rails.forEach((r, i) => r.reveal(seg(t, .15 + i * .1, .55 + i * .1))); }
  } };
};
// ===== an abstract plain of wealth: thousands of columns, a few clusters soar =====
BUILD.tower_field = (p) => {
  const st = stage({ top: '#03060c', mid: '#0a0f1a', bottom: '#120d0a', fog: '#05080f', fogNear: 12, fogFar: 46, floor: 0x0c0f15, keyI: 1.2, hemi: .3 });
  const r = rng(p.memory ? 21 : p.superstar ? 33 : 9), hubs = [[-4, -3, 1.0], [5, -6, .8], [1, 4, .55], [-9, 6, .4], [9, 3, .35]];
  const items = []; for (let i = -24; i <= 24; i++) for (let j = -18; j <= 14; j++) { const x = i * .55 + (r() - .5) * .2, z = j * .55 + (r() - .5) * .2; let v = .03 + r() * .05;
    hubs.forEach(([hx, hz, a]) => { const dd = Math.hypot(x - hx, z - hz); v += a * 6 * Math.exp(-dd * dd / 2.2) * (.6 + r() * .6); }); items.push({ x, z, v, w: .38, hub: hubs.findIndex(([hx, hz]) => Math.hypot(x - hx, z - hz) < 2.2) }); }
  const hiI = items.filter(it => it.v > .55), loI = items.filter(it => it.v <= .55);
  const tw = towers(hiI, { ei: .55 }), lo = towers(loI, { color: 0x2a303c, emissive: 0x3a2a14, ei: .35 }); st.scene.add(tw, lo);
  const riv = p.memory ? tube([V(-16, .02, -12), V(-9, .02, -5), V(-4.6, .02, -3.3), V(0, .02, -1), V(6, .02, 1), V(14, .02, 4)], .14, C.teal, 2.4) : null; if (riv) st.scene.add(riv);
  st.scene.add(dust(300, [40, 10, 40], 4));
  return { ...st, update(t, s) {
    const grow = p.memory ? 1 : out(seg(t, 0, .7));
    const hfn = (it, i) => { let h = it.v * grow; if (p.superstar) { h *= it.hub === 0 || it.hub === 1 ? lerp(1, 1.9, ease(seg(t, .2, .9))) : lerp(1, .55, ease(seg(t, .2, .9))); } return h * (1 + Math.sin(s * .8 + i) * .01); }; tw.set(hfn); lo.set(hfn);
    if (riv) { riv.material.emissiveIntensity = 2.4 * (1 - seg(t, .25, .7)); riv.visible = t < .72; }
    tw.material.emissiveIntensity = .55 + .25 * Math.sin(s * .5);
    const a = lerp(-.5, .35, ease(t)) + (p.superstar ? .8 : 0); aim(st.cam, [Math.sin(a) * 19, lerp(7.5, 5.5, ease(t)), Math.cos(a) * 19], [0, 1.6, -1], .8);
  } };
};
BUILD.title = (p) => { const b = BUILD.tower_field({}); return { ...b, update(t, s) { b.update(.85 + t * .15, s + 30); aim(b.cam, [Math.sin(.2 + t * .3) * 22, 9, Math.cos(.2 + t * .3) * 22], [0, 1, 0], .4); } }; };

// ===== cart vs ship =====
BUILD.cart_vs_ship = (p) => {
  const st = stage({ top: '#1c2538', mid: '#6a4a3a', bottom: '#3a2a1e', fog: '#4a3a34', fogNear: 14, fogFar: 50, floor: null, keyI: 2.4, keyPos: [-10, 6, 4] });
  // muddy road on land (left), sea (right)
  const land = M(new THREE.PlaneGeometry(30, 60), matte(0x3b2d1f, { roughness: 1 }), { rot: [-Math.PI / 2, 0, 0], pos: [-15, 0, 0], shadow: false }); st.scene.add(land);
  const road = M(new THREE.PlaneGeometry(2.2, 60), matte(0x5a4129, { roughness: 1 }), { rot: [-Math.PI / 2, 0, 0], pos: [-4, .01, 0], shadow: false }); st.scene.add(road);
  const r = rng(3); for (let i = 0; i < 40; i++) { const tr = tree(.8 + r() * .8, 0x3d4f2a); tr.position.set(-6 - r() * 18, 0, -28 + r() * 50); st.scene.add(tr); }
  const sea = water(30, 60, 0x123247, { seg: 50 }); sea.position.set(15, -.1, 0); st.scene.add(sea);
  // cart and ox
  const cart = G(M(RB(1.4, .5, .9, .05), matte(0x6b4a2a), { pos: [0, .75, 0] }), ...[[-.45, .45], [.45, .45], [-.45, -.45], [.45, -.45]].map(([x, z]) => M(CYL(.32, .32, .08, 16), matte(0x3e2a17), { pos: [x, .32, z], rot: [Math.PI / 2, 0, 0] })),
    M(RB(1.2, .35, .8, .1), matte(0xc9b37a), { pos: [0, 1.15, 0] }));
  const ox = G(M(RB(1.2, .6, .55, .2), matte(0x5b4635), { pos: [0, .85, 0] }), M(RB(.4, .4, .38, .12), matte(0x5b4635), { pos: [.75, 1.0, 0] }), ...[[-.4, .2], [.4, .2], [-.4, -.2], [.4, -.2]].map(([x, z]) => M(CYL(.07, .07, .6, 8), matte(0x4a3828), { pos: [x, .3, z] })));
  ox.position.x = 1.9; const team = G(cart, ox); team.rotation.y = Math.PI / 2; st.scene.add(team);
  const boat = ship(.9); st.scene.add(boat);
  const labels = [{ p: V(-4, 2.6, 0), text: 'BY ROAD', k: 0 }, { p: V(5, 3.2, 0), text: 'BY SEA', k: 0 }];
  return { ...st, labels, update(t, s) {
    sea.update(s, .05);
    team.position.set(-4, 0, 6 - s * .25); team.children[0].rotation.x = Math.sin(s * 3) * .02; ox.children.slice(2).forEach((l, i) => l.rotation.x = Math.sin(s * 3 + i * Math.PI) * .25);
    boat.visible = p.phase === 1; boat.position.set(5, Math.sin(s * 1.2) * .06, 14 - s * 2.4 + (p.phase ? 6 : 0)); boat.rotation.z = Math.sin(s * .9) * .04; boat.userData.sail.scale.z = 1;
    labels[0].p.copy(team.position).add(V(0, 2.4, 0)); labels[1].p.copy(boat.position).add(V(0, 3.4, 0)); labels[0].k = seg(t, .1, .25); labels[1].k = p.phase === 1 ? seg(t, .1, .25) : 0;
    if (p.phase === 0) aim(st.cam, [-12 + t * 2, 3.2, 10 - t * 3], [-4, .8, team.position.z - 3], .8);
    else aim(st.cam, [-1, 4.5, 15], [1.5, 1, 2], .5);
  }, bars: p.phase === 1 };
};
// ===== rapids that stop ships =====
BUILD.rapids = () => {
  const st = stage({ top: '#0e1a24', mid: '#2b3a3a', bottom: '#2a2219', fog: '#22302f', fogNear: 10, fogFar: 40, floor: null, keyI: 2, keyPos: [-6, 8, 8] });
  const steps = [0, -.9, -1.8, -2.7]; steps.forEach((y, i) => { const L = i === 3 ? 24 : 5, w = water(6, L, 0x0b2a33, { seg: 24 }); w.position.set(0, y, -i * 5 - (L - 5) / 2); w.material.color.set(0x0a2a35); w.material.roughness = .4; w.material.envMapIntensity = 0; w.material.specularIntensity = .4; st.scene.add(w); w.userData.i = i; });
  const banks = [-1, 1].map(s => { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const L = i === 3 ? 24 : 5.2; g.add(M(BOX(8, 3, L), matte(0x3a3326), { pos: [s * 7, steps[i] - .6, -i * 5 - (L - 5.2) / 2] })); } return g; }); st.scene.add(...banks);
  const r = rng(8), rocks = []; for (let i = 0; i < 40; i++) { const k = Math.floor(r() * 4); const m = M(new THREE.DodecahedronGeometry(.25 + r() * .45, 0), matte(0x4b4740), { pos: [(r() - .5) * 5.4, steps[k] + .05, -k * 5 + 2.5 - r() * 1.2], rot: [r() * 3, r() * 3, 0] }); st.scene.add(m); rocks.push(m); }
  const n = 500, fp = new Float32Array(n * 3), fb = [...Array(n)].map(() => [r() * 3 | 0, (r() - .5) * 5.6, r()]); const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
  const foam = new THREE.Points(fg, new THREE.PointsMaterial({ color: 0xeaf6ff, size: .13, map: GLOW, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); st.scene.add(foam);
  const boat = ship(.7); st.scene.add(boat);
  for (let i = 0; i < 18; i++) { const tr = tree(1 + r(), 0x274a2a); tr.position.set((r() < .5 ? -1 : 1) * (4 + r() * 5), steps[i % 4] + .9, -(i % 4) * 5 + (r() - .5) * 4); st.scene.add(tr); }
  return { ...st, labels: [{ p: V(0, 1.6, -4), text: 'LIVINGSTONE FALLS, CONGO RIVER', k: 1, small: 1 }], update(t, s) {
    st.scene.children.filter(o => o.update && o.userData.i !== undefined).forEach(w => w.update(s, .06 + w.userData.i * .02, 2));
    fb.forEach(([k, x, ph], i) => { const f = frac(ph + s * .8); fp.set([x, steps[k] - f * .9 + Math.sin(f * 3) * .2, -k * 5 - 2.5 - f * .4], i * 3); }); fg.attributes.position.needsUpdate = true;
    const k = out(seg(t, 0, .45)); boat.position.set(0, -2.7 + .05 * Math.sin(s * 2), lerp(-30, -18.6, k)); boat.rotation.y = Math.sin(s * 1.7) * .06 * seg(t, .4, .6); boat.rotation.z = Math.sin(s * 2.3) * .05 * seg(t, .4, .6);
    aim(st.cam, [lerp(5.5, 3.5, t), lerp(.6, -.4, t), lerp(-33, -29, t)], [0, -1.6, -10], .8);
  } };
};
// ===== a city growing (phase 0/1) or unravelling (phase 2) =====
BUILD.city_grow = (p) => {
  const st = stage({ top: '#060a14', mid: '#1b1a28', bottom: '#2a1c14', fog: '#121420', fogNear: 14, fogFar: 48, floor: 0x15140f, keyI: 1.5, keyPos: [-8, 10, 5] });
  const riv = M(new THREE.PlaneGeometry(2.4, 80), new THREE.MeshPhysicalMaterial({ color: 0x0b2232, roughness: .45, envMap: ENV, envMapIntensity: .25 }), { rot: [-Math.PI / 2, 0, .35], pos: [3.2, .01, 0], shadow: false }); st.scene.add(riv);
  const r = rng(p.phase === 2 ? 77 : 5), bs = [];
  for (let i = 0; i < 170; i++) { const a = r() * Math.PI * 2, d = Math.pow(r(), .7) * 9, x = Math.cos(a) * d, z = Math.sin(a) * d; if (Math.abs((x - 3.2) * Math.cos(.35) + z * Math.sin(.35)) < 1.6) continue;
    const h = (.3 + r() * .5) * (1 + 5 * Math.exp(-d * d / 9)), w = .4 + r() * .45; const b = building(w, h, w * (.8 + r() * .4), { seed: i, lit: 1.1 }); b.position.set(x, 0, z); st.scene.add(b); bs.push({ b, d, h, w, dead: r() < .55 }); }
  const fl = inflow(70, [0, 0, 0], 11, C.goldHi, 3, .3); st.scene.add(fl);
  const out_ = p.phase === 2 ? inflow(50, [0, 0, 0], 14, 0x88aaff, 9, .35) : null; if (out_) st.scene.add(out_);
  return { ...st, update(t, s) {
    const R = p.phase === 0 ? lerp(1.5, 7, ease(t)) : p.phase === 1 ? lerp(4, 11, ease(t)) : 11;
    bs.forEach(({ b, d, dead }, i) => { let k = clamp((R - d) * 1.2); if (p.phase === 2 && dead) k *= 1 - ease(seg(t, .15 + (i % 9) * .05, .55 + (i % 9) * .05)); b.scale.set(1, Math.max(.001, out(k)), 1); b.userData.mat.emissiveIntensity = (p.phase === 2 && dead ? 1.1 * (1 - seg(t, .1, .4)) : 1.1); b.visible = k > .002; });
    fl.update(s, p.phase === 1 ? 2.2 : 1, p.phase === 2 ? 0 : 1); if (out_) { out_.children.forEach(c => c.material.opacity *= 0); out_.update(-s, 1, 1); }
    const a = .6 + t * .5 + (p.phase === 2 ? 2 : 0); aim(st.cam, [Math.sin(a) * lerp(15, 18, t), lerp(9, 11, t), Math.cos(a) * lerp(15, 18, t)], [0, 1, 0], .7);
  } };
};
// ===== quote card: a dark space with drifting gold dust =====
BUILD.quote = (p) => { const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05070c); scene.fog = new THREE.FogExp2(0x05070c, .035);
  const d = dust(900, [40, 16, 40], 17); d.position.y = -6; scene.add(d); const cam = new THREE.PerspectiveCamera(40, W / H, .1, 100);
  return { scene, cam, quote: p, update(t, s) { d.update(s); aim(cam, [0, 0, 12 - t * 3], [0, 0, 0], .3); } }; };
// ===== a row of three glowing pillars (marshall's forces / the rules) =====
function triad(items, o = {}) {
  const st = stage({ top: '#05080f', mid: '#10131c', bottom: '#1a130e', fog: '#0b0d14', fogNear: 14, fogFar: 40, floor: 0x14120f, keyI: 1.4 });
  const groups = items.map(([icon], i) => { const g = new THREE.Group(); g.position.x = (i - 1) * 4.2;
    g.add(M(CYL(1.1, 1.25, .5, 48), gloss(0x22262f), { pos: [0, .25, 0] }), M(new THREE.TorusGeometry(1.15, .03, 8, 64), glowM(C.gold, 2.5), { pos: [0, .5, 0], rot: [Math.PI / 2, 0, 0], shadow: false }));
    const ic = icon(); ic.position.y = .5; g.add(ic); g.userData.ic = ic; const halo = glowSprite(C.gold, 3.5, .25); halo.position.set(0, 1.4, 0); g.add(halo); st.scene.add(g); return g; });
  // ideas leaking between pillars
  const sparks = []; if (o.links) { const r = rng(4); for (let i = 0; i < 36; i++) { const sp = glowSprite(C.goldHi, .35, .9); st.scene.add(sp); sparks.push({ sp, a: r() * 3 | 0, b: r() * 3 | 0, ph: r() }); } }
  const labels = items.map(([, name, sub], i) => ({ p: V((i - 1) * 4.2, 3.6, 0), text: name, sub, k: 0 }));
  return { ...st, labels, update(t, s) {
    groups.forEach((g, i) => { const k = out(seg(t, .08 + i * .22, .3 + i * .22)); g.scale.setScalar(Math.max(.001, k)); g.userData.ic.rotation.y = s * .4 + i; labels[i].k = k; });
    sparks.forEach(sp => { if (sp.a === sp.b) { sp.sp.visible = false; return; } const f = frac(sp.ph + s * .35), A = V((sp.a - 1) * 4.2, 2, 0), B = V((sp.b - 1) * 4.2, 2, 0); sp.sp.position.copy(A.lerp(B, f)).add(V(0, Math.sin(f * Math.PI) * 1.5, 0)); sp.sp.material.opacity = Math.sin(f * Math.PI) * seg(t, .7, .8); });
    aim(st.cam, [Math.sin(t * .4 - .2) * 3, 4.2, 12.5 - t * 1.2], [0, 1.6, 0], .6);
  } };
}
const ICON = {
  crates: () => G(...[[-.35, .3, 0], [.35, .3, .1], [0, .9, 0]].map(p => M(RB(.6, .6, .6, .05), matte(0x9a6a3a), { pos: p })), M(CYL(.08, .08, 2, 8), metal(0xb0b6c0), { pos: [.9, 1, 0] })),
  workers: () => G(...[[-.5, 0], [0, -.2], [.5, 0], [-.25, .45], [.25, .45]].map(([x, z], i) => { const pp = person([0xc9a77a, 0x6f8fb8, 0xd07a5a, 0x8ab07a, 0xe3d3b0][i]); pp.position.set(x, 0, z); return pp; })),
  bulb: () => G(M(SPH(.55, 32, 24), glowM(0xffd37a, 3), { pos: [0, 1.4, 0], shadow: false }), M(CYL(.25, .3, .5, 16), metal(0x9aa0aa), { pos: [0, .7, 0] }), (() => { const h = glowSprite(0xffc15e, 3, .6); h.position.set(0, 1.4, 0); return h; })()),
  house: () => { const g = G(M(BOX(1.2, .9, 1), matte(0xd8cdb6), { pos: [0, .45, 0] }), M(new THREE.ConeGeometry(.95, .6, 4), matte(0x7a3b2c), { pos: [0, 1.2, 0], rot: [0, Math.PI / 4, 0] })); g.add(M(new THREE.TorusGeometry(.18, .05, 8, 20, Math.PI), metal(C.gold), { pos: [.75, .75, .51] }), M(RB(.4, .35, .12, .03), metal(C.gold), { pos: [.75, .55, .51] })); return g; },
  scales: () => { const g = G(M(CYL(.06, .06, 1.8, 12), metal(C.gold), { pos: [0, .9, 0] }), M(CYL(.4, .5, .12, 24), metal(C.gold), { pos: [0, .06, 0] }), M(BOX(1.8, .06, .06), metal(C.gold), { pos: [0, 1.75, 0] }));
    [-1, 1].forEach(s => g.add(M(CYL(.35, .25, .08, 24), metal(C.gold), { pos: [s * .85, 1.15, 0] }), M(CYL(.01, .01, .6, 4), metal(0xdddddd), { pos: [s * .85, 1.45, 0] }))); return g; },
  vault: () => G(M(RB(1.2, 1.2, .9, .08), metal(0x6c7480), { pos: [0, .6, 0] }), M(CYL(.32, .32, .1, 32), metal(C.gold), { pos: [0, .65, .47], rot: [Math.PI / 2, 0, 0] }), ...[0, 1, 2].map(i => M(CYL(.25, .25, .08, 24), metal(0xffc15e), { pos: [-.9 + i * .05, .04 + i * .09, .3] }))),
};
BUILD.three_forces = () => triad([[ICON.crates, 'SHARED SUPPLIERS'], [ICON.workers, 'SKILLED WORKERS'], [ICON.bulb, 'IDEAS IN THE AIR']], { links: 1 });
BUILD.three_rules = () => triad([[ICON.house, 'SAFE PROPERTY'], [ICON.scales, 'FAIR COURTS'], [ICON.vault, 'KEEP WHAT YOU BUILD']]);
// ===== the walkout of 1957 =====
BUILD.walkout = () => {
  const st = stage({ top: '#0c1630', mid: '#4a3b4a', bottom: '#2a2018', fog: '#2c2a36', fogNear: 14, fogFar: 50, floor: 0x2a2620, keyI: 2.4, keyPos: [-9, 7, 5] });
  const lab = G(M(BOX(6, 2.2, 3.5), matte(0xcfc6b2), { pos: [-4, 1.1, 0] }), M(BOX(6.3, .2, 3.8), matte(0x7a6a58), { pos: [-4, 2.3, 0] }), M(BOX(1, 1.6, .1), glowM(0xffd9a0, 1.5), { pos: [-2.4, .8, 1.76], shadow: false }));
  for (let i = 0; i < 5; i++) lab.add(M(BOX(.7, .6, .05), glowM(0xffe2b0, .9), { pos: [-6.3 + i * .9 + (i > 3 ? .6 : 0), 1.4, 1.76], shadow: false })); st.scene.add(lab);
  const fc = G(M(BOX(3.5, 1.8, 3), matte(0x8f9aa8), { pos: [0, .9, 0] }), M(BOX(3.7, .16, 3.2), matte(0x4a525e), { pos: [0, 1.88, 0] }), M(BOX(.8, 1.3, .08), glowM(0x9fd8ff, 1.6), { pos: [0, .65, 1.52], shadow: false })); fc.position.set(6, 0, -3); st.scene.add(fc);
  const r = rng(2); for (let i = 0; i < 14; i++) { const tr = tree(1.1 + r() * .5, 0x3e5a2c); tr.position.set(-12 + r() * 24, 0, -9 - r() * 6); st.scene.add(tr); }
  const eight = [...Array(8)].map((_, i) => { const pp = person([0xe3d3b0, 0x8aa0c8, 0xc9a77a, 0x6f7f9a, 0xd8c8a8, 0x9ab0c0, 0xb89a7a, 0xa0b0d0][i], { glow: C.goldHi }); st.scene.add(pp); return pp; });
  const labels = [{ p: V(-4, 3.2, 0), text: 'SHOCKLEY SEMICONDUCTOR', k: 1, small: 1 }, { p: V(6, 2.8, -3), text: 'FAIRCHILD SEMICONDUCTOR', k: 0, small: 1 }];
  return { ...st, labels, update(t, s) {
    eight.forEach((pp, i) => { const k = ease(seg(t, .08 + i * .04, .7 + i * .03)), A = V(-2.4, 0, 2.2 + (i % 2) * .4), B = V(5.2 + (i % 4) * .45, 0, -1 + Math.floor(i / 4) * .5);
      pp.position.copy(A.clone().lerp(B, k)); pp.position.z += Math.sin(k * Math.PI) * 2.6; pp.visible = t > .06 + i * .04; pp.lookAt(B.x, 0, B.z); pp.walk(s * 7 + i); });
    labels[1].k = seg(t, .55, .7); aim(st.cam, [lerp(-2, 2, t), 4.5, 13], [lerp(-1, 2, t), 1, 0], .7);
  } };
};
// ===== fairchild's family tree =====
BUILD.family_tree = () => {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x04060b); scene.fog = new THREE.FogExp2(0x04060b, .04);
  const r = rng(12), nodes = [{ p: V(0, 0, 0), par: -1, t0: 0, name: 'FAIRCHILD' }];
  const named = { 3: 'INTEL · 1968', 7: 'AMD · 1969' };
  for (let i = 1; i < 70; i++) { const par = i < 12 ? 0 : Math.floor(r() * Math.min(i, 30)); const a = r() * Math.PI * 2, e = (r() - .5) * 1.4, len = par === 0 ? 3.2 + r() * 1.5 : 1.2 + r() * 1.2;
    const pp = nodes[par].p.clone().add(V(Math.cos(a) * Math.cos(e) * len, Math.sin(e) * len, Math.sin(a) * Math.cos(e) * len)); nodes.push({ p: pp, par, t0: nodes[par].t0 + .08 + r() * .12, name: named[i] }); }
  const lines = [], dots = nodes.map((n, i) => { const m = M(SPH(i === 0 ? .45 : n.name ? .26 : .12, 20, 14), glowM(i === 0 ? 0x9fd8ff : n.name ? C.goldHi : C.gold, i === 0 ? 3 : 2.2), { shadow: false }); m.position.copy(n.p); scene.add(m);
    if (n.par >= 0) { const tb = tube([nodes[n.par].p, nodes[n.par].p.clone().lerp(n.p, .5).add(V(0, .2, 0)), n.p], .015, 0xffb547, 1.2); scene.add(tb); lines.push([tb, n]); } return m; });
  scene.add(dust(300, [30, 20, 30], 6)); const cam = new THREE.PerspectiveCamera(36, W / H, .1, 200);
  const labels = nodes.map((n, i) => n.name ? { p: n.p.clone().add(V(0, .55, 0)), text: n.name, k: 0, small: i ? 1 : 0 } : null).filter(Boolean);
  return { scene, cam, labels, update(t, s) {
    const T = t * 1.25; dots.forEach((m, i) => { const k = out(seg(T, nodes[i].t0, nodes[i].t0 + .12)); m.scale.setScalar(Math.max(.001, k)); });
    lines.forEach(([tb, n]) => tb.reveal(seg(T, n.t0 - .1, n.t0))); labels.forEach(l => { const n = nodes.find(nn => nn.name === l.text); l.k = seg(T, n.t0 + .05, n.t0 + .15); });
    const a = s * .08 + .3; aim(cam, [Math.sin(a) * lerp(9, 15, ease(t)), lerp(2, 5, t), Math.cos(a) * lerp(9, 15, ease(t))], [0, 0, 0], .4);
  } };
};
// ===== orchards turn into towers =====
BUILD.tower_valley = () => {
  const st = stage({ top: '#070b16', mid: '#1b1826', bottom: '#20180f', fog: '#10121a', fogNear: 14, fogFar: 46, floor: 0x1a1710, keyI: 1.6 });
  const r = rng(31), items = [], trees = [];
  for (let i = -14; i <= 14; i++) for (let j = -9; j <= 7; j++) { const x = i * .75, z = j * .75, d = Math.hypot(x + 1, z + 1); const tr = tree(.75, 0x3f6a32); tr.position.set(x, 0, z); st.scene.add(tr); trees.push({ tr, d });
    items.push({ x, z, v: (.15 + r() * .2) + 7 * Math.exp(-d * d / 14) * (.5 + r() * .8), d, w: .5 }); }
  const tw = towers(items, { ei: .8 }); st.scene.add(tw);
  return { ...st, update(t, s) { const R = lerp(-1, 14, ease(seg(t, .1, .85)));
    trees.forEach(({ tr, d }) => { tr.scale.setScalar(Math.max(.001, 1 - clamp((R - d) * .8))); }); tw.set(it => it.v * out(clamp((R - it.d) * .5)));
    const a = -.4 + t * .5; aim(st.cam, [Math.sin(a) * 18, lerp(6, 8, t), Math.cos(a) * 18], [0, 1.5, 0], .7); } };
};
// ===== the portage: boats stop at the falls and cargo goes overland =====
BUILD.portage = () => {
  const st = stage({ top: '#132033', mid: '#5a4a44', bottom: '#2e2418', fog: '#3a3a3e', fogNear: 14, fogFar: 46, floor: null, keyI: 2.3, keyPos: [-8, 8, 6] });
  const up = M(BOX(30, 2, 20), matte(0x4f4436), { pos: [0, 0, -10] }), low = M(BOX(30, 1, 20), matte(0x55603a), { pos: [0, -1.5, 10] }); st.scene.add(up, low);
  const w1 = water(3, 20, 0x16384a, { seg: 20 }); w1.position.set(0, 1.02, -10); const w2 = water(3, 20, 0x16384a, { seg: 20 }); w2.position.set(0, -.98, 10); st.scene.add(w1, w2);
  const fall = M(new THREE.PlaneGeometry(3, 2.2, 1, 1), new THREE.MeshPhysicalMaterial({ color: 0xcfe8f0, roughness: .2, transparent: true, opacity: .75, emissive: 0x335566, emissiveIntensity: .4 }), { pos: [0, 0, 0], rot: [-.2, 0, 0], shadow: false }); st.scene.add(fall);
  const r = rng(6), mist = [...Array(24)].map(() => { const sp = glowSprite(0xdfefff, .5 + r() * .5, .12); st.scene.add(sp); return { sp, x: (r() - .5) * 3, ph: r() }; });
  const boat = ship(.55); st.scene.add(boat);
  const post = G(building(1.6, 1.2, 1.2, { seed: 3, lit: .9, color: 0x6a5038 }), M(new THREE.ConeGeometry(1.2, .7, 4), matte(0x5a3a2a), { pos: [0, 1.55, 0], rot: [0, Math.PI / 4, 0] })); post.position.set(3.4, -1, 1.8); st.scene.add(post);
  const porters = [...Array(5)].map((_, i) => { const pp = person(0xc9a77a); pp.add(M(RB(.35, .3, .35, .03), matte(0x9a6a3a), { pos: [0, 1.05, 0] })); st.scene.add(pp); return pp; });
  const path = new THREE.CatmullRomCurve3([V(1.8, -1, 6), V(2.4, -.6, 2.5), V(2.6, .1, -.5), V(2.1, 1, -3.5)]);
  for (let i = 0; i < 14; i++) { const tr = tree(1 + r() * .6, 0x34502a); tr.position.set(-4 - r() * 10, i % 2 ? 1 : -1, -12 + r() * 24); st.scene.add(tr); }
  return { ...st, labels: [{ p: V(0, 2.2, 0), text: 'THE FALL LINE', k: 1, small: 1 }], update(t, s) {
    w1.update(s, .03); w2.update(s, .05, 2); mist.forEach(m => { const f = frac(m.ph + s * .3); m.sp.position.set(m.x, -1 + f * 1.8, .4 + f * .6); m.sp.material.opacity = .12 * Math.sin(f * Math.PI); });
    boat.position.set(0, -.95 + Math.sin(s * 1.5) * .04, lerp(12, 4.2, out(seg(t, 0, .3)))); boat.rotation.y = Math.PI;
    porters.forEach((pp, i) => { const f = frac(s * .07 + i / 5); pp.position.copy(path.getPoint(f)); pp.visible = t > .3; pp.walk(s * 7 + i); const nx = path.getPoint(Math.min(1, f + .01)); pp.lookAt(nx.x, pp.position.y, nx.z); });
    post.scale.setScalar(Math.max(.001, out(seg(t, .55, .8))));
    aim(st.cam, [lerp(9, 7, t), lerp(4, 3.2, t), lerp(9, 7, t)], [0, -.3, 0], .7);
  } };
};
// ===== nogales: one town, split by a fence =====
BUILD.nogales = (p) => {
  const st = stage({ top: '#121c30', mid: '#8a5a44', bottom: '#3a2818', fog: '#6a4a3a', fogNear: 16, fogFar: 55, floor: 0x7a5e40, keyI: 2.6, keyPos: [-10, 6, -4] });
  const r = rng(14), bs = [];
  for (let i = 0; i < 160; i++) { const z = (r() - .5) * 40, x = (r() < .5 ? -1 : 1) * (.8 + Math.pow(r(), .8) * 13), north = x < 0; const h = north ? .5 + r() * (r() < .12 ? 2.4 : .7) : .35 + r() * .4, w = .6 + r() * .6;
    const b = building(w, h, w, { seed: i, lit: north ? 1.2 : .35, color: north ? 0x9a8a78 : 0x8a6a58, roof: north ? 0x4a4a4a : 0x6a4a3a }); b.position.set(x, 0, z); st.scene.add(b); bs.push({ b, north }); }
  const fence = new THREE.InstancedMesh(BOX(.06, 1, .06), metal(0x5b4a3a, { roughness: .6 }), 400); const d = new THREE.Object3D();
  for (let i = 0; i < 400; i++) { d.position.set(0, .9, -20 + i * .1); d.scale.set(1, 1.8, 1); d.updateMatrix(); fence.setMatrixAt(i, d.matrix); } fence.castShadow = true; st.scene.add(fence);
  for (let i = 0; i < 30; i++) { const hill = M(SPH(4 + r() * 4, 16, 10), matte(0x6a5038), { pos: [(r() - .5) * 60, -2.5, -26 - r() * 10], scale: [1.6, .7, 1] }); st.scene.add(hill); }
  return { ...st, labels: [{ p: V(-5, 3.2, 2), text: 'NOGALES, ARIZONA', sub: 'UNITED STATES', k: 1 }, { p: V(5, 3.2, 2), text: 'NOGALES, SONORA', sub: 'MEXICO', k: 1 }], meter: p.phase === 1, update(t, s) {
    bs.forEach(({ b, north }) => { if (p.phase === 1) b.userData.mat.emissiveIntensity = north ? 1.2 + .4 * seg(t, .3, .6) : .35; });
    st.key.intensity = p.phase === 1 ? lerp(2.6, 1.2, seg(t, .2, .6)) : 2.6;
    if (p.phase === 0) aim(st.cam, [lerp(2, -2, t), lerp(14, 9, ease(t)), lerp(22, 14, ease(t))], [0, 0, 0], .6); else aim(st.cam, [0, 7, 15], [0, 0, 1], .5);
  } };
};
// ===== korea at night =====
BUILD.korea = () => { const b = BUILD.map_region({ region: 'korea' }); const L = [{ p: V(0, 0, 0), text: 'NORTH KOREA', k: 0 }, { p: V(0, 0, 0), text: 'SOUTH KOREA', k: 0 }, { p: V(0, 0, 0), text: 'Pyongyang', k: 0, small: 1 }, { p: V(0, 0, 0), text: 'Seoul', k: 0, small: 1 }];
  const P = projector('korea'), at = (lo, la, y) => { const [x, z] = P.f(lo, la); return V(x, y, -z); };
  L[0].p = at(126.9, 40.4, .4); L[1].p = at(128.0, 36.2, .6); L[2].p = at(125.75, 39.0, .3); L[3].p = at(126.98, 37.57, 1.2);
  return { ...b, labels: L, update(t, s) { b.update(t, s); L.forEach((l, i) => l.k = seg(t, .15 + i * .1, .3 + i * .1)); } }; };
// ===== a finest harbour, built then wasted =====
BUILD.harbour = () => {
  const st = stage({ top: '#0b1428', mid: '#3a3348', bottom: '#1c1612', fog: '#1e2030', fogNear: 18, fogFar: 60, floor: null, keyI: 1.7, keyPos: [-10, 7, 2] });
  const sea = water(60, 60, 0x0f2c40, { seg: 50 }); sea.position.y = -.05; st.scene.add(sea);
  const shape = new THREE.Shape(); shape.absarc(0, 0, 14, 0, Math.PI * 2, false); const hole = new THREE.Path(); hole.absellipse(0, 2, 7, 5.5, 0, Math.PI * 2, true); shape.holes.push(hole);
  const ring = M(new THREE.ExtrudeGeometry(shape, { depth: .6, bevelEnabled: true, bevelSize: .5, bevelThickness: .3, bevelSegments: 2 }), matte(0x3a3a2c), { rot: [-Math.PI / 2, 0, 0], pos: [0, -.3, 0] }); st.scene.add(ring);
  const gap = M(BOX(5, 2, 9), matte(0x0f2c40), { pos: [0, -.5, 9.5], shadow: false }); gap.visible = false;
  const r = rng(19), bs = []; for (let i = 0; i < 120; i++) { const a = r() * Math.PI * 2, d = 8 + r() * 4.5, x = Math.cos(a) * d, z = 2 + Math.sin(a) * d * .85; if (z > 8 && Math.abs(x) < 3.5) continue;
    const b = building(.5 + r() * .5, .4 + r() * 1.8, .6, { seed: i, lit: 1.2 }); b.position.set(x, .6, z); b.lookAt(0, .6, 2); st.scene.add(b); bs.push({ b, k: r() }); }
  const ships = [...Array(6)].map((_, i) => { const sp = ship(.45); sp.position.set(-4 + i * 1.6, 0, (i % 2) * 2); st.scene.add(sp); return sp; });
  return { ...st, labels: [], update(t, s) { sea.update(s, .03);
    const up = out(seg(t, 0, .4)), down = ease(seg(t, .55, .9)); bs.forEach(({ b, k }) => { b.scale.set(1, Math.max(.001, up * (1 - down * (k < .9 ? 1 : .6))), 1); });
    ships.forEach((sp, i) => { sp.visible = down < .5; sp.position.z = (i % 2) * 2 + Math.sin(s + i) * .1; });
    const a = .8 + t * .5; aim(st.cam, [Math.sin(a) * 22, 12, Math.cos(a) * 22], [0, 0, 2], .5); } };
};
// ===== housing: the price of getting in =====
BUILD.housing = () => {
  const st = stage({ top: '#0a1020', mid: '#2a2534', bottom: '#1c150f', fog: '#151622', fogNear: 14, fogFar: 46, floor: 0x16140f, keyI: 1.5 });
  const r = rng(41); for (let i = 0; i < 90; i++) { const a = r() * Math.PI * 2, d = Math.pow(r(), .6) * 5, h = (.6 + r()) * (1 + 6 * Math.exp(-d * d / 5)); const b = building(.6 + r() * .4, h, .7, { seed: i }); b.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); st.scene.add(b); }
  const walkers = [...Array(14)].map((_, i) => { const pp = person([0x8ab0d8, 0xe0a0b0, 0xd8c8a8, 0x9ad0a8][i % 4]); st.scene.add(pp); return { pp, a: i / 14 * Math.PI * 2 + .2 }; });
  const tags = [...Array(6)].map((_, i) => { const g = G(M(RB(.7, .4, .06, .05), gloss(0xffc15e), { shadow: false }), M(CYL(.01, .01, .8, 4), metal(0xcccccc), { pos: [0, -.55, 0] })); const a = i / 6 * Math.PI * 2; g.position.set(Math.cos(a) * 3, 3, Math.sin(a) * 3); st.scene.add(g); return g; });
  return { ...st, labels: [], update(t, s) {
    walkers.forEach(({ pp, a }, i) => { const f = ease(seg(t, .15 + i * .02, .85)); const d = lerp(4.5, 12, f); pp.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); pp.lookAt(Math.cos(a) * 20, 0, Math.sin(a) * 20); pp.walk(s * 6 + i); });
    tags.forEach((g, i) => { g.position.y = 3 + i * .3 + seg(t, 0, 1) * 3 * (1 + i * .2); g.rotation.y = s * .6 + i; g.scale.setScalar(.7 + seg(t, 0, 1) * .8); });
    const a = .2 + t * .4; aim(st.cam, [Math.sin(a) * 17, 8, Math.cos(a) * 17], [0, 2, 0], .6); }, price: 1 };
};
// ===== detroit: the snowball rolls backwards =====
BUILD.detroit = () => {
  const st = stage({ top: '#0a0e18', mid: '#272630', bottom: '#15120f', fog: '#14141c', fogNear: 14, fogFar: 44, floor: 0x15130f, keyI: 1.3 });
  const r = rng(51), houses = []; for (let i = -12; i <= 12; i++) for (let j = -9; j <= 6; j++) { if (r() < .12) continue; const g = G(M(BOX(.55, .4, .5), matte(0x9a8a78), { pos: [0, .2, 0] }), M(new THREE.ConeGeometry(.45, .3, 4), matte(0x5a3a2a), { pos: [0, .55, 0], rot: [0, Math.PI / 4, 0] }));
    g.add(M(BOX(.12, .12, .02), glowM(0xffc77a, 1.6), { pos: [.12, .25, .26], shadow: false })); g.position.set(i * 1.0 + (r() - .5) * .2, 0, j * 1.0); st.scene.add(g); houses.push({ g, k: r(), win: g.children[2] }); }
  const core = [...Array(10)].map((_, i) => { const b = building(.9, 2.5 + r() * 4, .9, { seed: i }); b.position.set(-3 + (i % 5) * 1.2, 0, -8 - Math.floor(i / 5) * 1.3); st.scene.add(b); return b; });
  return { ...st, labels: [], detroit: 1, update(t, s) { const k = ease(seg(t, .15, .85));
    houses.forEach(({ g, k: kk, win }) => { const gone = kk < k * .66; g.scale.setScalar(gone ? Math.max(.001, 1 - clamp((k * .66 - kk) * 12)) : 1); win.material.emissiveIntensity = kk < k * .8 ? .1 : 1.6; });
    core.forEach(b => b.userData.mat.emissiveIntensity = lerp(1.2, .45, k));
    aim(st.cam, [lerp(-6, 4, t), lerp(10, 8, t), 13], [0, 0, -1], .6); } };
};
// ===== recap: three layers stack into the answer =====
BUILD.recap = (p) => {
  const st = stage({ top: '#04070d', mid: '#0e121b', bottom: '#17110b', fog: '#0a0c12', fogNear: 14, fogFar: 40, floor: 0x12100d, keyI: 1.5 });
  const names = ['GEOGRAPHY', 'THE SNOWBALL', 'THE RULES'], cols = [0x2f6d7a, 0x8a5a2a, 0x5a4a7a];
  const slabs = names.map((n, i) => { const g = G(M(RB(6.4 - i * .9, .7, 4.2 - i * .6, .08), gloss(cols[i], { roughness: .4 })), M(new THREE.TorusGeometry(1, .02, 6, 4), glowM(C.gold, 2), { scale: [(6.4 - i * .9) * .72, (4.2 - i * .6) * .72, 1], rot: [Math.PI / 2, 0, Math.PI / 4], pos: [0, .36, 0], shadow: false })); g.position.y = .35 + i * .72; st.scene.add(g); return g; });
  names.forEach((n, i) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(BOX(6.4 - i * .9, .7, 4.2 - i * .6)), new THREE.LineBasicMaterial({ color: C.gold, transparent: true, opacity: .25, toneMapped: false })); e.position.y = .35 + i * .72; st.scene.add(e); });
  const tw = towers([{ x: 0, z: 0, w: .9 }], { ei: 1.4 }); st.scene.add(tw);
  const labels = names.map((n, i) => ({ p: V(lerp(3.6, 2.4, i / 2) + .6, .4 + i * .72, 0), text: n, k: 0, left: 1 }));
  return { ...st, labels, update(t, s) {
    slabs.forEach((g, i) => { const shown = i < p.n - 1 ? 1 : i === p.n - 1 ? out(seg(t, .05, .3)) : 0; g.visible = shown > 0; g.position.y = .35 + i * .72 + (1 - shown) * 4; labels[i].k = shown; labels[i].hot = i === p.n - 1; });
    tw.visible = p.n === 3; tw.set(() => .001 + 4 * out(seg(t, .45, .9))); tw.position.y = .35 + 2 * .72 + .35;
    const a = -.5 + s * .03; aim(st.cam, [Math.sin(a) * 13, 6, Math.cos(a) * 13], [0, 1.6, 0], .5);
  } };
};
BUILD.outro = () => { const b = BUILD.globe_night({ from: [100, 25], to: [130, 20], dist: [3.6, 4.4] }); return { ...b, outro: 1 }; };

// ---------- 2D overlay ----------
const cv = document.getElementById('cv'), c2 = cv.getContext('2d');
const GRAIN = (() => { const g = document.createElement('canvas'); g.width = g.height = 256; const x = g.getContext('2d'), d = x.createImageData(256, 256), r = rng(99); for (let i = 0; i < d.data.length; i += 4) { const v = r() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 22; } x.putImageData(d, 0, 0); return g; })();
function txt(s, x, y, size, col, o = {}) { c2.save(); c2.font = `${o.weight ?? 600} ${size}px ${o.font ?? SANS}`; c2.textAlign = o.align ?? 'left'; c2.textBaseline = o.base ?? 'alphabetic'; c2.fillStyle = col; c2.globalAlpha *= o.a ?? 1;
  if (o.spacing) c2.letterSpacing = o.spacing; if (o.shadow !== false) { c2.shadowColor = 'rgba(0,0,0,.75)'; c2.shadowBlur = o.blur ?? 14; } c2.fillText(s, x, y); c2.restore(); }
function wrap(s, maxW, size, font, weight = 400) { c2.font = `${weight} ${size}px ${font}`; const words = s.split(' '), lines = []; let cur = ''; words.forEach(w => { const tr = cur ? cur + ' ' + w : w; if (c2.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; }); if (cur) lines.push(cur); return lines; }
const fmt = n => Math.round(n).toLocaleString('en-US');
function overlay(L, T, total, cur, t, s, d) {
  if (VERT) return overlayShort(L, T, total, cur, t, s, d);
  // projected labels
  (cur.labels || []).forEach(l => { if (!l || l.k <= .01) return; const [x, y, vis] = project(cur.cam, l.p); if (!vis) return; c2.save(); c2.globalAlpha = l.k;
    if (l.left) { c2.fillStyle = GOLD; c2.fillRect(x - 40, y - 2, 30, 3); txt(l.text, x, y + 9, 30, l.hot ? GOLD : CREAM, { weight: 700, spacing: '4px' }); }
    else { const sz = l.small ? 22 : 30; c2.fillStyle = l.hot ? GOLD : 'rgba(255,193,94,.9)'; c2.beginPath(); c2.arc(x, y + 10, 4, 0, 7); c2.fill();
      txt(l.text.toUpperCase() === l.text ? l.text : l.text, x, y - 8, sz, l.hot ? GOLD : CREAM, { weight: 700, align: 'center', spacing: l.small ? '2px' : '4px' }); if (l.sub) txt(l.sub, x, y - 8 - sz - 6, 18, MUTED, { weight: 600, align: 'center', spacing: '4px' }); }
    c2.restore(); });
  const p = L.p || {};
  // location tag, top left
  if (p.tag) { const k = out(seg(s, .3, 1.1)); c2.save(); c2.globalAlpha = k; c2.fillStyle = GOLD; c2.fillRect(110, 150, 60 * k, 3);
    txt(p.tag[0], 110, 205, 46, CREAM, { weight: 800, font: DISPLAY, spacing: '6px' }); txt(p.tag[1], 110, 245, 24, MUTED, { weight: 500, spacing: '1px' }); c2.restore(); }
  // a big number
  if (p.stat) { const k = out(seg(t, .15, .4)); c2.save(); c2.globalAlpha = k; const x = 1180;
    txt(p.stat[0], x, 520, 190, GOLD, { weight: 800, font: DISPLAY, blur: 30 }); txt(p.stat[1], x + 6, 590, 32, CREAM, { weight: 500 }); txt(p.stat[2], x + 6, 636, 32, CREAM, { weight: 700 });
    txt('Source: World Bank, World Development Report 2009', x + 6, 700, 18, MUTED, { weight: 500 }); c2.restore(); }
  // the title card
  if (L.scene === 'title') { const k = out(seg(t, .05, .35)), k2 = out(seg(t, .2, .5)); c2.save(); c2.fillStyle = `rgba(0,0,0,${.35 * k})`; c2.fillRect(0, 0, W, H);
    txt(p.top, W / 2, 440, 40, CREAM, { weight: 600, align: 'center', spacing: '18px', a: k }); txt(p.big, W / 2, 590, 170, GOLD, { weight: 800, font: DISPLAY, align: 'center', spacing: '10px', a: k2, blur: 40 });
    c2.globalAlpha = k2; c2.fillStyle = GOLD; c2.fillRect(W / 2 - 80, 640, 160, 3); txt(p.sub, W / 2, 700, 28, MUTED, { weight: 500, align: 'center', spacing: '3px', a: k2 }); c2.restore(); }
  // quotes
  if (cur.quote) { const q = cur.quote, lines = wrap(q.para ? q.q : '“' + q.q + '”', 1300, 60, SERIF, 400); const y0 = H / 2 - lines.length * 40;
    lines.forEach((ln, i) => txt(ln, W / 2, y0 + i * 80, 60, CREAM, { font: SERIF, weight: 400, align: 'center', a: out(seg(t, .05 + i * .08, .25 + i * .08)) }));
    const k = out(seg(t, .3, .5)); c2.save(); c2.globalAlpha = k; c2.fillStyle = GOLD; c2.fillRect(W / 2 - 40, y0 + lines.length * 80 + 10, 80, 3); c2.restore();
    txt('— ' + q.who, W / 2, y0 + lines.length * 80 + 70, 24, GOLD, { weight: 700, align: 'center', spacing: '4px', a: k }); }
  // transport cost bars (Diocletian's edict of 301 AD)
  if (cur.bars) { const k = seg(t, .15, .6), rows = [['SEA', 1, '1×'], ['RIVER', 4.9, '~5×'], ['ROAD', 42, '28–56×']]; c2.save(); c2.fillStyle = 'rgba(5,8,14,.72)'; c2.beginPath(); c2.roundRect(100, 620, 1000, 330, 18); c2.fill();
    txt('COST OF MOVING GRAIN THE SAME DISTANCE', 140, 680, 24, GOLD, { weight: 700, spacing: '3px' }); txt("Roman Empire, implied by Diocletian's Price Edict (301 AD)", 140, 714, 20, MUTED, { weight: 500 });
    rows.forEach(([n, v, l], i) => { const y = 770 + i * 58, kk = out(seg(k, i * .25, .5 + i * .25)), w = Math.max(6, v / 42 * 640) * kk; txt(n, 140, y + 12, 24, CREAM, { weight: 700, spacing: '2px' });
      c2.fillStyle = i === 2 ? '#e0703a' : '#3fd6e8'; c2.fillRect(280, y - 14, w, 34); txt(l, 290 + w, y + 12, 24, CREAM, { weight: 800, a: kk }); }); c2.restore(); }
  // income comparison in nogales
  if (cur.meter) { const k = out(seg(t, .3, .6)); c2.save(); c2.globalAlpha = k; c2.fillStyle = 'rgba(5,8,14,.7)'; c2.beginPath(); c2.roundRect(610, 690, 700, 230, 18); c2.fill();
    txt('AVERAGE HOUSEHOLD INCOME', W / 2, 740, 24, GOLD, { weight: 700, align: 'center', spacing: '3px' });
    c2.fillStyle = GOLD; c2.fillRect(660, 770, 540 * k, 40); c2.fillStyle = '#8a6a58'; c2.fillRect(660, 830, 180 * k, 40);
    txt('ARIZONA SIDE', 670, 800, 22, '#1a1208', { weight: 800, spacing: '2px' }); txt('SONORA SIDE', 860, 860, 22, CREAM, { weight: 700, spacing: '2px' }); txt('~3×', 1220, 803, 32, GOLD, { weight: 800 });
    txt('Estimate from Acemoglu & Robinson, Why Nations Fail (2012)', W / 2, 900, 18, MUTED, { weight: 500, align: 'center' }); c2.restore(); }
  // detroit population counter
  if (cur.detroit) { const CEN = [[1950, 1849568], [1960, 1670144], [1970, 1511482], [1980, 1203339], [1990, 1027974], [2000, 951270], [2010, 713777], [2020, 639111]], j = Math.min(7, Math.floor(ease(seg(t, .12, .85)) * 7.999)), yr = CEN[j][0], pop = CEN[j][1]; c2.save(); c2.fillStyle = 'rgba(5,8,14,.72)'; c2.beginPath(); c2.roundRect(110, 130, 620, 250, 18); c2.fill();
    txt('DETROIT', 150, 200, 44, CREAM, { weight: 800, font: DISPLAY, spacing: '6px' }); txt(String(yr), 150, 290, 80, GOLD, { weight: 800, font: DISPLAY }); txt(fmt(pop), 410, 290, 52, CREAM, { weight: 700 });
    txt('people, US Census', 410, 330, 20, MUTED, { weight: 500 }); c2.restore(); }
  if (cur.price) { const k = seg(t, 0, 1); c2.save(); txt('HOME PRICES', 1500, 200, 26, GOLD, { weight: 700, spacing: '3px', align: 'right' }); c2.fillStyle = 'rgba(255,193,94,.25)'; c2.fillRect(1520, 160, 16, 260); c2.fillStyle = GOLD; c2.fillRect(1520, 420 - 260 * out(k), 16, 260 * out(k)); c2.restore(); }
  if (cur.outro) { const k = out(seg(t, .1, .4)), k2 = out(seg(t, .45, .7)); c2.save(); c2.fillStyle = `rgba(0,0,0,${.4 * k})`; c2.fillRect(0, 0, W, H);
    txt('SPREAD IT OUT?', W / 2, 470, 96, CREAM, { weight: 800, font: DISPLAY, align: 'center', spacing: '6px', a: k }); txt('OR LET IT ROLL?', W / 2, 590, 96, GOLD, { weight: 800, font: DISPLAY, align: 'center', spacing: '6px', a: k2 });
    txt('TELL ME IN THE COMMENTS', W / 2, 700, 26, MUTED, { weight: 600, align: 'center', spacing: '6px', a: k2 }); c2.restore(); }
  // chapter card at the start of each section after the cold open
  if (L.sec > 0 && L.first) { const a = seg(s, .2, .9) * (1 - seg(s, 3.6, 4.4)); if (a > 0) { c2.save(); c2.globalAlpha = a; txt(`CHAPTER ${L.sec}`, 110, 880, 22, GOLD, { weight: 700, spacing: '8px' });
    txt(L.secName.toUpperCase(), 110, 940, 58, CREAM, { weight: 800, font: DISPLAY, spacing: '5px' }); c2.restore(); } }
}

// Shorts: a progress line, the tag up top, big burned-in captions, and an end card
function overlayShort(L, T, total, cur, t, s, d) {
  (cur.labels || []).forEach(l => { if (!l || l.k <= .01) return; const [x, y, vis] = project(cur.cam, l.p); if (!vis) return; c2.save(); c2.globalAlpha = l.k;
    c2.fillStyle = GOLD; c2.beginPath(); c2.arc(x, y + 10, 6, 0, 7); c2.fill(); txt(l.text, x, y - 12, 34, CREAM, { weight: 800, align: 'center', spacing: '2px', blur: 18 }); c2.restore(); });
  c2.fillStyle = 'rgba(255,255,255,.2)'; c2.fillRect(80, 110, W - 160, 6); c2.fillStyle = GOLD; c2.fillRect(80, 110, (W - 160) * clamp(T / total), 6);
  const p = L.p || {};
  if (p.tag) { const k = out(seg(s, .1, .8)); c2.save(); c2.globalAlpha = k; txt(p.tag[0], W / 2, 260, 96, GOLD, { weight: 800, font: DISPLAY, align: 'center', spacing: '8px', blur: 30 });
    wrap(p.tag[1], W - 200, 40, SANS, 600).forEach((ln, i) => txt(ln, W / 2, 330 + i * 52, 40, CREAM, { weight: 600, align: 'center' })); c2.restore(); }
  if (p.endcard) { const k = out(seg(t, .45, .7)); c2.save(); c2.globalAlpha = k; c2.fillStyle = 'rgba(0,0,0,.7)'; c2.fillRect(0, 0, W, H);
    txt('WHERE', W / 2, 760, 54, CREAM, { weight: 700, align: 'center', spacing: '14px' }); c2.save(); c2.font = `800 110px ${DISPLAY}`; const ew = c2.measureText(p.endcard.toUpperCase()).width; c2.restore(); txt(p.endcard.toUpperCase(), W / 2, 880, Math.min(110, 110 * (W - 140) / ew), GOLD, { weight: 800, font: DISPLAY, align: 'center', blur: 30 }); txt("MONEY LIVES", W / 2, 990, 80, CREAM, { weight: 800, font: DISPLAY, align: 'center', spacing: '6px' });
    txt('FULL DOCUMENTARY ON THE CHANNEL', W / 2, 1110, 34, MUTED, { weight: 700, align: 'center', spacing: '4px' }); c2.restore(); }
  if (!L.cap || T < L.cap[0] || T > L.cap[1] + .15) return;
  const words = L.text.split(/\s+/), chunks = []; let cur_ = [];
  words.forEach(w => { cur_.push(w); if (cur_.length >= 3 || /[.,?!:]$/.test(w)) { chunks.push(cur_.join(' ')); cur_ = []; } }); if (cur_.length) chunks.push(cur_.join(' '));
  const tot = chunks.reduce((a, ch) => a + ch.length + 4, 0), k = (T - L.cap[0]) / (L.cap[1] - L.cap[0]) * tot; let acc = 0, idx = chunks.length - 1;
  for (let i = 0; i < chunks.length; i++) { acc += chunks[i].length + 4; if (k < acc) { idx = i; break; } }
  let st = 0; for (let i = 0; i < idx; i++) st += chunks[i].length + 4; const age = (k - st) / tot * (L.cap[1] - L.cap[0]);
  const str = chunks[idx].toUpperCase(); c2.save(); c2.font = `900 84px ${DISPLAY}`; c2.textAlign = 'center'; c2.textBaseline = 'middle'; c2.lineJoin = 'round';
  const fit = Math.min(1, (W - 120) / c2.measureText(str).width), sc = fit * (1 + .1 * Math.exp(-age * 18)); c2.translate(W / 2, 1420); c2.scale(sc, sc);
  c2.lineWidth = 14; c2.strokeStyle = '#06080e'; c2.strokeText(str, 0, 0); c2.fillStyle = idx % 2 ? GOLD : '#ffffff'; c2.fillText(str, 0, 0); c2.restore();
}

// ---------- frame driver ----------
let curIdx = -1, cur = null;
function dispose(sc) { sc.traverse(o => { if (o.geometry) o.geometry.dispose(); const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : []; ms.forEach(m => { ['map', 'emissiveMap'].forEach(k => { const tx = m[k]; if (tx && tx !== GLOW && !Object.values(mapTexCache).some(c => c.tex === tx) && !(NIGHT && (tx === NIGHT.base || tx === NIGHT.lights)) && tx !== WINDOWS) tx.dispose(); }); m.dispose(); }); }); }
function frame(TL, T, total) {
  let i = TL.findIndex(l => T < l.end); if (i < 0) i = TL.length - 1; const L = TL[i];
  if (i !== curIdx) { if (cur) dispose(cur.scene); cur = (BUILD[L.scene] || BUILD.quote)(L.p || {}); curIdx = i; }
  const d = L.end - L.start, s = T - L.start, t = clamp(s / d); NOW = T;
  cur.update(t, s, d); cur.cam.aspect = W / H; cur.cam.updateProjectionMatrix();
  rpass.scene = cur.scene; rpass.camera = cur.cam; composer.render();
  c2.imageSmoothingQuality = 'high'; c2.fillStyle = '#000'; c2.fillRect(0, 0, W, H);
  const z = 1 + .03 * t; c2.drawImage(renderer.domElement, W * (1 - z) / 2, H * (1 - z) / 2, W * z, H * z); // a slow push on every shot
  // vignette and grain
  const vg = c2.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); c2.fillStyle = vg; c2.fillRect(0, 0, W, H);
  c2.save(); c2.globalCompositeOperation = 'overlay'; const r = rng(Math.floor(T * 24)); c2.translate(-r() * 256, -r() * 256); c2.fillStyle = c2.createPattern(GRAIN, 'repeat'); c2.fillRect(0, 0, W + 256, H + 256); c2.restore();
  overlay(L, T, total, cur, t, s, d);
  // letterbox
  if (!VERT) { c2.fillStyle = '#000'; c2.fillRect(0, 0, W, 64); c2.fillRect(0, H - 64, W, 64); }
  // dip to black between shots, longer at chapter breaks, fade in at the start and out at the end
  const brk = (j) => j > 0 && TL[j].sec !== TL[j - 1].sec ? .7 : .22;
  let a = 0; if (i === 0) a = 1 - clamp(T / 1.2); else a = Math.max(a, 1 - s / brk(i)); if (i < TL.length - 1) a = Math.max(a, 1 - (L.end - T) / brk(i + 1)); else a = Math.max(a, seg(T, total - 2, total));
  if (a > 0) { c2.fillStyle = `rgba(0,0,0,${clamp(a)})`; c2.fillRect(0, 0, W, H); }
}
export async function init() { GEO = await (await fetch('/engine/geo.json')).json(); }
window.DOC3D = { frame };
