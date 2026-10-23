// Horror sets for the Shorts. BUILD.room is a configurable dark room: empty chairs, coats on hooks, rows of
// shoes, a swinging bulb, a desk with a document, a figure whose face turns slowly to camera, shadows that cross
// the wall. Camera moves are named (push, dolly, rise, low, down, still) because every Short shot asks for one.
import { THREE, scene, camera, BUILD, fig, headPos, POSE, breathe, mat, glow, mesh, box, cyl, ball, ground, backdrop, lights, fog, shot, rng, lerp, ease, clamp } from './r3.js';
const PI = Math.PI, FACE = -90;

function camMove(kind, t, f = [0, 1.5, 4], at = [0, 1, 0]) {
  const k = ease(clamp(t));
  if (kind === 'still') return shot(f, f, 0, at);
  if (kind === 'dolly') return shot([f[0] - 1.2, f[1], f[2]], [f[0] + 1.2, f[1], f[2]], t, [at[0] - .6, at[1], at[2]], [at[0] + .6, at[1], at[2]]);
  if (kind === 'rise') return shot([at[0], at[1] + 1.5, at[2] + .3], [at[0], at[1] + 7, at[2] + .5], t, at);
  if (kind === 'low') return shot([f[0], .35, f[2] * .9], [f[0], .45, f[2] * .75], t, [at[0], at[1] + .6, at[2]]);
  if (kind === 'down') return shot([f[0], f[1] + 2.2, f[2] * .6], [f[0], f[1] + 1.8, f[2] * .45], t, at);
  if (kind === 'track') return shot([0, .55, 2.5], [0, .5, -4], t, [0, .05, -6], [0, .05, -11]);
  return shot(f, [lerp(f[0], at[0], .35), lerp(f[1], at[1], .25), lerp(f[2], at[2], .4)], t, at);   // push
}

function coat(x, y, z, c) { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g); cyl(.012, .012, .12, '#8a8a86', 0, .05, .05, g, 6).rotation.x = PI / 2;
  const body = mesh(new THREE.CylinderGeometry(.09, .2, .75, 10, 1, true), mat(c, .95, { side: THREE.DoubleSide }), 0, -.38, .1, g); const sh = mesh(new THREE.SphereGeometry(.1, 10, 6, 0, PI * 2, 0, PI / 2), c, 0, -.02, .1, g); sh.scale.set(1.6, .5, 1); return g; }
function shoe(x, z, r, c) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; scene.add(g); const b = mesh(new THREE.CapsuleGeometry(.045, .16, 4, 8), c, 0, .045, 0, g); b.rotation.x = PI / 2; mesh(new THREE.BoxGeometry(.1, .06, .1), c, 0, .07, -.06, g); return g; }
function chair(x, z, r = 0) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; scene.add(g); const w = '#3a2e24'; box(.42, .04, .42, w, 0, .45, 0, g); box(.42, .5, .04, w, 0, .72, -.19, g); for (const [a, b] of [[-.18, -.18], [.18, -.18], [-.18, .18], [.18, .18]]) box(.035, .45, .035, w, a, .22, b, g); return g; }

BUILD.room = p => {
  const R = rng(p.seed || 3), props = p.props || [], has = k => props.find(x => x === k || (typeof x === 'string' && x.startsWith(k + ':')));
  const num = (k, d) => { const h = has(k); return h && h.includes(':') ? +h.split(':')[1] : d; };
  const wallC = p.wall || '#3b3d3e', floorC = p.floor || '#2a2a28';
  scene.background = new THREE.Color('#050506'); fog('#050506', 5, p.deep ? 26 : 13);
  const gr = ground(floorC); const back = mesh(new THREE.PlaneGeometry(30, 8), mat(wallC, 1), 0, 4, -3); back.castShadow = false;
  for (const sx of [-1, 1]) { const w = mesh(new THREE.PlaneGeometry(30, 8), mat(wallC, 1), sx * 4.5, 4, 0); w.rotation.y = -sx * PI / 2; w.castShadow = false; }
  const anim = [];
  // light
  const L = p.light || 'bulb', key = [];
  if (L === 'bulb' || L === 'red') { const c = L === 'red' ? '#ff3a2a' : '#ffc880'; const pl = new THREE.PointLight(c, 22, 14, 1.2); pl.castShadow = true; pl.shadow.mapSize.set(512, 512); scene.add(pl); const b = ball(.05, glow(c, 3), 0, 2.6, 0); cyl(.005, .005, 1.4, '#222', 0, 3.3, 0, scene, 4);
    key.push(pl); anim.push((t, T) => { const sw = Math.sin(T * (p.swing ? 1.6 : .7)) * (p.swing ? .5 : .12); pl.position.set(Math.sin(sw) * .7, 2.6 - (1 - Math.cos(sw)) * .7, 0); b.position.copy(pl.position); }); }
  if (L === 'cold' || has('window')) { const w = box(1.1, 1.3, .04, glow('#9fb8d8', .8), 1.6, 2.4, -2.97); const sp = new THREE.SpotLight('#9fb8d8', 60, 16, .6, .6, 1.0); sp.position.set(1.6, 2.6, -2.8); sp.target.position.set(-.3, 0, 1.2); sp.castShadow = true; sp.shadow.mapSize.set(512, 512); scene.add(sp, sp.target); key.push(sp); }
  if (L === 'dark') { const pl = new THREE.PointLight('#8090a8', 12, 14, 1.2); pl.position.set(0, 2.5, 2); scene.add(pl); key.push(pl); }
  scene.add(new THREE.AmbientLight('#8a90a0', p.amb ?? .4));
  if (p.flicker) anim.push((t, T) => { const on = (Math.sin(T * 23) + Math.sin(T * 7.3) + Math.sin(T * 41)) > -1.6; key.forEach(l => l.visible = on); });
  if (p.dies) anim.push((t, T) => key.forEach(l => l.visible = t < p.dies || (t < p.dies + .08 && Math.sin(T * 60) > 0)));
  // props
  if (has('desk')) { box(1.4, .05, .7, '#3a2a1a', 0, .75, 0); for (const [a, b] of [[-.65, -.3], [.65, -.3], [-.65, .3], [.65, .3]]) box(.05, .75, .05, '#2a1a10', a, .37, b); const paper = mesh(new THREE.PlaneGeometry(.3, .4), mat('#e8e0cc', 1), 0, .78, .05); paper.rotation.x = -PI / 2; if (p.stamp) { const st = mesh(new THREE.PlaneGeometry(.14, .06), mat('#a3291f', .8), 0, .781, .12); st.rotation.x = -PI / 2; } }
  if (has('radio')) { box(.35, .22, .16, '#3a3026', .45, .9, -.1); const dial = ball(.04, glow('#e2b45a', 1.5), .45, .92, -.01); anim.push((t, T) => dial.material.emissiveIntensity = 1 + Math.sin(T * 3) * .6); }
  if (has('typewriter')) { box(.4, .12, .3, '#1c1b19', -.3, .84, 0); box(.38, .2, .02, '#e8e0cc', -.3, .98, -.1); }
  if (has('phone')) { box(.2, .08, .14, '#111', .4, .8, .15); }
  const nCh = num('chairs', 0); for (let i = 0; i < nCh; i++) { const cols = Math.min(nCh, 6), r = Math.floor(i / cols); chair((i % cols - (cols - 1) / 2) * .8, -1 + r * .9, R() * .2 - .1); }
  const nCo = num('coats', 0); if (nCo) { box(nCo * .45 + .3, .06, .06, '#3a2a1a', 0, 2.0, -2.95); for (let i = 0; i < nCo; i++) coat((i - (nCo - 1) / 2) * .45, 1.95, -2.95, ['#3a3a3a', '#4a3a2a', '#2a3040', '#5a4a3a'][i % 4]); }
  if (p.deep) { const lamps = []; for (let i = 0; i < 5; i++) { const z = 1 - i * 4; const l = new THREE.PointLight('#d8cfb8', 9, 7, 1.4); l.position.set(0, 2.2, z); scene.add(l); lamps.push(l); ball(.04, glow('#f2e8c8', 2), 0, 2.25, z); }
    anim.push(t => lamps.forEach((l, i) => l.intensity = 9 * clamp(1 - (t * 1.3 - i * .18) * 2))); }
  const nSh = num('shoes', 0); for (let i = 0; i < nSh; i++) shoe((R() - .5) * 2.6, -R() * (p.deep ? 18 : 2.8) + 1, R() * 6, ['#2a2420', '#3a2a1a', '#1c1b19', '#4a3a2a'][i % 4]);
  const nSu = num('suitcases', 0); for (let i = 0; i < nSu; i++) { const s = box(.5, .35, .18, ['#5a4430', '#3a3026', '#6a5a40'][i % 3], (R() - .5) * 3, .18 + Math.floor(i / 6) * .36, -1.5 - R()); s.rotation.y = R() - .5; }
  if (has('bed')) { box(1.9, .5, .9, '#cfc8b8', -1.2, .25, -1.5); box(.5, .14, .7, '#efe9dc', -1.95, .57, -1.5); }
  if (has('door')) { const fr = box(1.0, 2.1, .06, '#1a1612', 0, 1.05, -2.96); const d = new THREE.Group(); d.position.set(-.48, 0, -2.9); scene.add(d); box(.94, 2.04, .05, '#4a3a2a', .47, 1.02, 0, d); const gap = mesh(new THREE.PlaneGeometry(.94, 2.04), glow(p.doorc || '#e8dcc0', .6), 0, 1.02, -2.94); gap.visible = false;
    anim.push(t => { const o = p.door === 'open' ? ease(clamp(t * 1.2)) * 1.2 : p.door === 'close' ? (1 - ease(clamp(t * 2))) * 1.2 : 0; d.rotation.y = -o; gap.visible = o > .02; }); }
  if (has('mirror')) { box(.8, 1.1, .04, '#1a1a1a', -1.6, 1.6, -2.95); mesh(new THREE.PlaneGeometry(.7, 1.0), mat('#6a7480', .1, { metalness: .9 }), -1.6, 1.6, -2.92); }
  if (has('portrait')) { box(.8, 1.0, .04, '#6a4a30', 0, 2.0, -2.95); mesh(new THREE.PlaneGeometry(.66, .86), mat('#b8ad98', 1), 0, 2.0, -2.92); const eye = [ball(.02, '#111', -.08, 2.12, -2.9), ball(.02, '#111', .08, 2.12, -2.9)]; anim.push((t) => eye.forEach((e, i) => e.position.x = (i ? .08 : -.08) + Math.sin(t * PI) * .025)); }
  if (has('bars')) for (let i = 0; i < 12; i++) cyl(.025, .025, 4, '#2a2a2a', -2.4 + i * .44, 2, 2.0, scene, 6);
  if (has('candles')) { const nC = 40; for (let i = 0; i < nC; i++) { const x = (R() - .5) * 4, z = -R() * 3; cyl(.025, .025, .12, '#efe9dc', x, .06, z, scene, 6); const f = ball(.018, glow('#f2c25a', 3), x, .14, z); anim.push((t, T) => f.scale.y = 1 + .4 * Math.sin(T * 9 + i)); } const cl = new THREE.PointLight('#f2a03a', 4, 6, 1.5); cl.position.set(0, .6, -1); scene.add(cl); }
  if (has('swing')) { const g = new THREE.Group(); g.position.set(0, 2.6, -1); scene.add(g); cyl(.006, .006, 2, '#555', -.25, -1, 0, g, 4); cyl(.006, .006, 2, '#555', .25, -1, 0, g, 4); box(.6, .04, .2, '#4a3a2a', 0, -2, 0, g); anim.push((t, T) => g.rotation.x = Math.sin(T * 1.3) * .35 * (1 - t * .7)); }
  // figure: a mannequin with a look, optionally turning slowly to camera
  let m = null; if (p.fig) { const f = p.fig, at = f.at || [0, -.5]; m = fig(Object.assign({ x: at[0], z: at[1], turn: f.turnTo ? FACE + 150 : FACE + (f.yaw || 0) }, f.look || {}));
    (POSE[f.pose] || POSE.stand)(m); if (['sit', 'desk', 'sitSlump'].includes(f.pose)) { if (!has('desk') && !nCh) chair(at[0], at[1] - .1, 0); }
    anim.push((t, T) => { if (f.turnTo) { m.turn = FACE + 150 * (1 - ease(clamp((t - .15) / .7))); } if (f.pose === 'speech') POSE.speech(m, T); breathe(m, T); }); }
  // shadows of figures sliding across the back wall
  const nShad = p.shadows || 0, sh = []; for (let i = 0; i < nShad; i++) { const s = new THREE.Group(); s.position.set(0, 0, -2.97); scene.add(s); const b = mesh(new THREE.PlaneGeometry(.45, 1.6), mat('#000', 1, { transparent: true, opacity: .55 }), 0, 1.0, 0, s); b.castShadow = false; const h = mesh(new THREE.CircleGeometry(.15, 16), mat('#000', 1, { transparent: true, opacity: .55 }), 0, 2.0, 0, s); h.castShadow = false; sh.push([s, R()]); }
  anim.push((t, T) => sh.forEach(([s, r], i) => { s.position.x = lerp(-5, 5, (t * (.8 + r * .6) + i * .3) % 1); s.scale.setScalar(1 + Math.sin(T + i) * .1); }));
  // 'face' frames the figure's head, wherever the mannequin's proportions put it
  if (p.cam === 'face' && m) { const h = headPos(m); return { update(t, T) { anim.forEach(a => a(t, T)); shot([h.x, h.y + .03, h.z + .95], [h.x, h.y + .02, h.z + .62], t, [h.x, h.y - .02, h.z]); } }; }
  if (m && !p.at) { const h = headPos(m); p = Object.assign({}, p, { at: [h.x, h.y - .25, h.z], from: p.from || [h.x, h.y + .15, h.z + 2.6] }); }
  const f0 = p.from || [0, 1.25, 3.4], at = p.at || [0, .7, -.5];
  return { update(t, T) { anim.forEach(a => a(t, T)); camMove(p.cam || 'push', t, f0, at); } };
};
