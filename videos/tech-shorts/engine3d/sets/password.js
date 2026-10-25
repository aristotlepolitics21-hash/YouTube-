// Sets for Tech Shorts episode 12: How Websites Store Your Password (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { screenFace, makePhone } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, night = { top: '#141c3d', bottom: '#3b2f6b', floor: 0x3a2f68, hemi: .9 }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };

  // a stand-in hash for display: deterministic and avalanche-y
  function fakeHash(str, n = 16) { let h = 2166136261 >>> 0, out = ''; for (let k = 0; k < n; k++) { for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i) + k * 31; h = Math.imul(h, 16777619) >>> 0; } h ^= h >>> 13; out += '0123456789abcdef'[h & 15]; } return out; }
  const pill = (w, h, txt, o = {}) => textSign(w, h, txt, { color: o.color ?? 0xffffff, fg: o.fg ?? '#1d2442', size: o.size ?? 52, font: o.font ?? MONO, depth: o.depth ?? .1 });
  function makeBlender(col = C.pink) {
    const g = new THREE.Group(); g.add(M(RB(1.2, .8, 1.2, .2), plastic(col), { pos: [0, .4, 0] }));
    const jar = M(new THREE.CylinderGeometry(.62, .45, 1.7, 40, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .3, roughness: .02, side: THREE.DoubleSide, depthWrite: false }), { pos: [0, 1.65, 0], shadow: false }); g.add(jar);
    g.add(M(new THREE.CylinderGeometry(.66, .66, .14, 40), plastic(0x2a3046), { pos: [0, 2.55, 0] }));
    const blade = G(M(RB(.7, .04, .12, .02), metal(0xc9cdd8)), M(RB(.12, .04, .7, .02), metal(0xc9cdd8))); blade.position.y = .95; g.add(blade);
    const swirl = M(new THREE.CylinderGeometry(.5, .4, 1.2, 32), new THREE.MeshStandardMaterial({ color: 0xb6ff5c, transparent: true, opacity: 0 }), { pos: [0, 1.5, 0], shadow: false }); g.add(swirl);
    const f = screenFace(.7, .4, '#141a2c', '#ffffff'); f.position.set(0, .4, .61); g.add(f);
    g.userData = { blade, swirl, jar }; g.spin = (s, on) => { blade.rotation.y = s * 30 * on; g.rotation.z = Math.sin(s * 40) * .02 * on; swirl.material.opacity = on * .75; swirl.rotation.y = s * 20; swirl.material.color.setHSL(frac(s * .3), .7, .6); };
    return g;
  }
  function makeVault() { const g = new THREE.Group(); g.add(M(RB(1.6, 1.6, 1.4, .18), metal(0x9aa3bd, { roughness: .35 }), {})); const door = M(new THREE.CylinderGeometry(.55, .55, .1, 40), metal(0x6f7896), { pos: [0, 0, .72], rot: [Math.PI / 2, 0, 0] }); g.add(door);
    for (let i = 0; i < 4; i++) g.add(M(RB(.5, .06, .06, .02), metal(0xd7dbe6), { pos: [0, 0, .8], rot: [0, 0, i * Math.PI / 4] })); g.userData.door = door; return g; }
  function loginForm(w = 2.6) { const g = sign(w, 1.3, () => {}, { color: 0xffffff, depth: .12 }); g.fill = (pw, status) => g.userData.redraw((x, cw, ch) => { x.fillStyle = '#fff'; x.fillRect(0, 0, cw, ch); label(x, 'Log in', cw / 2, ch * .2, ch * .14, '#1d2442', 900);
      rrect(x, 30, ch * .38, cw - 60, ch * .26, 18); x.fillStyle = '#eef1f8'; x.fill(); label(x, pw, 60, ch * .51, ch * .14, '#1d2442', 700, 'left', MONO);
      rrect(x, cw * .3, ch * .72, cw * .4, ch * .2, 18); x.fillStyle = status === 'ok' ? '#3cc85a' : status === 'no' ? '#ff5a5a' : '#2b7bff'; x.fill(); label(x, status === 'ok' ? '✓' : status === 'no' ? '✕' : 'Go', cw / 2, ch * .82, ch * .14, '#fff', 900); }); g.fill('', ''); return g; }
  const cam = (st, s, y = 2.6, z = 8.8) => aim(st.cam, [Math.sin(s * .5) * .8, y + .25, z], [0, y, 0]);

  // ---------- sets ----------
  BUILD.pw_hook = () => {
    const st = stage(night), bit = makeBit(); bit.scale.setScalar(.7); bit.position.set(.9, 0, .6); bit.rotation.y = -.4; st.scene.add(bit);
    const srv = G(M(RB(1.3, 2.2, 1.0, .2), plastic(0x7b6cff), { pos: [0, 1.1, 0] })); const f = screenFace(.9, .55, '#141a2c', '#b6ff5c', 'smile'); f.position.set(0, 1.7, .51); srv.add(f); srv.position.set(-.9, 0, -.3); st.scene.add(srv);
    const q = pill(.55, .55, '?', { color: C.amber, fg: '#3a2400', size: 110, font: undefined }); q.position.set(-.9, 3.0, .3); st.scene.add(q);
    const pw = pill(1.8, .42, '••••••••', { color: 0xffffff, size: 70 }); pw.position.set(.9, 2.6, .8); st.scene.add(pw);
    return { ...st, update(t, s) { bit.pose({ s, happy: .8, upR: .6 }); q.scale.setScalar(popIn(t, .4)); q.rotation.z = Math.sin(s * 5) * .2; pw.scale.setScalar(popIn(t, .1)); pw.position.y = 2.6 + Math.sin(s * 2) * .08; srv.rotation.y = Math.sin(s * .8) * .2; cam(st, s, 2.3); } };
  };
  BUILD.pw_title = (p) => {
    const st = stage({ top: '#d6c8ff', bottom: '#c9ffe0', floor: 0xb8f0d4 }); st.scene.add(pedestal(1.3, 0xffffff, C.lime));
    const bl = makeBlender(); bl.scale.setScalar(.75); bl.position.y = .4; st.scene.add(bl);
    const s1 = textSign(3.2, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 96 }), s2 = textSign(3.2, .72, p.bottom, { color: C.lime, fg: '#14320a', size: 96 }); s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { bl.spin(s, .8); bl.rotation.y = Math.sin(s * 1.2) * .3; s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.4], [0, 2.5, 0]); } };
  };
  BUILD.pw_hash = () => {
    const st = stage(warm), bl = makeBlender(); bl.position.set(0, .2, 0); st.scene.add(bl);
    const letters = 'hunter2'.split('').map((ch, i) => { const g = pill(.4, .4, ch, { color: [C.pink, C.amber, C.cyan, C.lime, C.violet, C.pink, C.amber][i], size: 80 }); st.scene.add(g); return g; });
    const lb = textSign(1.9, .42, 'ONE-WAY BLENDER', { color: C.pink, fg: '#fff', size: 56 }); lb.position.set(0, 4.7, .4); st.scene.add(lb);
    return { ...st, update(t, s) { letters.forEach((g, i) => { const k = ease(seg(t, .1 + i * .06, .3 + i * .06)); g.position.set(lerp(-1.4 + i * .45, 0, k), lerp(4.0, 2.0, k), lerp(.4, 0, k)); g.rotation.z = k * 6; g.scale.setScalar(1 - k * .8); g.visible = k < .99; });
      bl.spin(s, seg(t, .45, .55)); lb.scale.setScalar(popIn(t, .5)); cam(st, s, 2.4); } };
  };
  BUILD.pw_out = () => {
    const st = stage(warm), bl = makeBlender(); bl.position.set(-.8, 0, 0); bl.scale.setScalar(.8); st.scene.add(bl);
    const out = pill(2.4, .42, fakeHash('hunter2'), { color: 0x1d2442, fg: '#b6ff5c', size: 54 }); st.scene.add(out);
    const vault = makeVault(); vault.scale.setScalar(.7); vault.position.set(1.1, .8, .3); st.scene.add(vault);
    const bin = G(M(new THREE.CylinderGeometry(.35, .28, .7, 24), plastic(0x8a93a8), { pos: [0, .35, 0] })); bin.position.set(-1.4, 0, 1.4); st.scene.add(bin);
    const pw = pill(1.1, .34, 'hunter2', { color: 0xffffff, size: 50 }); st.scene.add(pw);
    return { ...st, update(t, s) { bl.spin(s, 1 - seg(t, .4, .5)); const k = ease(seg(t, .1, .45)); out.position.set(lerp(-.8, .2, k), lerp(2.6, 3.7, k), .4); out.scale.setScalar(popIn(t, .1));
      const v = ease(seg(t, .5, .7)); out.position.lerp(V(1.1, 1.3, .9), v); out.scale.multiplyScalar(1 - v * .6); vault.userData.door.rotation.y = Math.sin(s * 3) * .2;
      const b = ease(seg(t, .6, .85)); pw.position.set(lerp(-.2, -1.4, b), lerp(4.5, .9, b) + Math.sin(b * Math.PI) * .6, lerp(.5, 1.4, b)); pw.rotation.z = b * 4; pw.scale.setScalar(popIn(t, .55) * (1 - seg(t, .85, .9))); cam(st, s, 2.4); } };
  };
  BUILD.pw_oneway = () => {
    const st = stage(soft), glass = G(M(new THREE.CylinderGeometry(.5, .4, 1.4, 40, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, roughness: .02, side: THREE.DoubleSide, depthWrite: false }), { pos: [0, .7, 0], shadow: false }), M(new THREE.CylinderGeometry(.46, .38, 1.15, 40), plastic(0xff8fb8), { pos: [0, .62, 0] }), M(new THREE.CylinderGeometry(.03, .03, 1.2, 8), plastic(C.lime), { pos: [.2, 1.3, 0], rot: [0, 0, .3] }));
    glass.position.set(-.8, 1.3, 0); st.scene.add(glass);
    const fruits = [[0xff4a4a, .25], [0xffc44d, .22], [0x5cc46a, .2]].map(([c, r], i) => { const f = M(SPH(r, 24, 16), plastic(c), {}); st.scene.add(f); return f; });
    const arrow = pill(.6, .5, '→', { color: 0xffffff, size: 90, font: undefined }); arrow.position.set(.2, 2.3, .3); st.scene.add(arrow);
    const no = pill(.55, .55, '✕', { color: C.red, fg: '#fff', size: 110, font: undefined }); no.position.set(.2, 2.3, .5); st.scene.add(no);
    const hash = pill(2.0, .38, fakeHash('hunter2'), { color: 0x1d2442, fg: '#b6ff5c', size: 48 }); hash.position.set(0, 4.4, .3); st.scene.add(hash);
    return { ...st, update(t, s) { fruits.forEach((f, i) => f.position.set(1.1 + Math.sin(s * 2 + i * 2) * .05, 1.6 + i * .5 + Math.sin(s * 3 + i) * .05, .3)); const tryIt = t > .35; arrow.visible = !tryIt || frac(s) < .5; no.scale.setScalar(tryIt ? popIn(t, .4) : 0);
      hash.scale.setScalar(popIn(t, .05)); glass.rotation.y = s * .5; cam(st, s, 2.5); } };
  };
  BUILD.pw_login = () => {
    const st = stage(soft), form = loginForm(); form.position.set(0, 4.1, 0); st.scene.add(form);
    const bl = makeBlender(); bl.scale.setScalar(.55); bl.position.set(-.9, .3, .3); st.scene.add(bl);
    const live = pill(1.9, .36, '', { color: 0x1d2442, fg: '#b6ff5c', size: 46 }), stored = pill(1.9, .36, fakeHash('hunter2'), { color: 0x9aa3bd, fg: '#1d2442', size: 46 }); live.position.set(.55, 2.2, .6); stored.position.set(.55, 1.65, .6); st.scene.add(live, stored);
    const eq = pill(.45, .45, '=', { color: 0xffffff, size: 80, font: undefined }); eq.position.set(1.75, 1.92, .7); st.scene.add(eq);
    return { ...st, update(t, s) { const n = Math.floor(seg(t, .05, .35) * 7.99); form.fill('•'.repeat(n), t > .8 ? 'ok' : ''); bl.spin(s, seg(t, .35, .45) * (1 - seg(t, .55, .6)));
      live.userData.redraw((x, w, h) => { x.fillStyle = '#1d2442'; x.fillRect(0, 0, w, h); label(x, t > .55 ? fakeHash('hunter2') : '', w / 2, h / 2 + 3, h * .5, '#b6ff5c', 700, 'center', MONO); }); live.scale.setScalar(popIn(t, .5)); stored.scale.setScalar(popIn(t, .1)); eq.scale.setScalar(popIn(t, .7));
      cam(st, s, 2.8); } };
  };
  BUILD.pw_match = () => {
    const st = stage(night), rows = [['hunter2', true], ['hunter3', false]].map(([pw, ok], i) => { const g = new THREE.Group(); g.position.set(0, 3.7 - i * 1.6, 0); st.scene.add(g);
      const a = pill(1.2, .38, pw, { color: 0xffffff, size: 50 }); a.position.set(-1.0, .3, 0); const b = pill(2.6, .38, fakeHash(pw), { color: 0x1d2442, fg: ok ? '#b6ff5c' : '#ff7a9a', size: 50 }); b.position.set(0, -.25, 0); g.add(a, b);
      const m = pill(.45, .45, ok ? '✓' : '✕', { color: ok ? 0x3cc85a : C.red, fg: '#fff', size: 90, font: undefined }); m.position.set(1.1, .3, .1); g.add(m); g.userData = { a, b, m }; return g; });
    const hi = M(RB(.18, .5, .1, .04), glowM(C.amber, 2.5), { shadow: false }); hi.position.set(-.62, 2.4, .2); st.scene.add(hi);
    return { ...st, update(t, s) { rows.forEach((g, i) => { const at = .05 + i * .35; g.userData.a.scale.setScalar(popIn(t, at)); g.userData.b.scale.setScalar(popIn(t, at + .1)); g.userData.m.scale.setScalar(popIn(t, at + .2)); g.position.x = Math.sin(s * 1.5 + i) * .05; });
      hi.visible = t > .4; hi.scale.setScalar(1 + Math.sin(s * 8) * .1); cam(st, s, 2.7); } };
  };
  BUILD.pw_same = () => {
    const st = stage(warm), users = [-1, 1].map(d => { const b = makeBit({ accent: d < 0 ? C.pink : C.cyan }); b.scale.setScalar(.5); b.position.set(d * 1.0, 0, .6); st.scene.add(b); return b; });
    const hs = [-1, 1].map(d => { const g = pill(1.35, .32, fakeHash('qwerty123', 10), { color: 0x1d2442, fg: '#ff7a9a', size: 50 }); g.position.set(d * .75, 2.6 - (d > 0 ? .5 : 0), .4); st.scene.add(g); return g; });
    const link = M(new THREE.CylinderGeometry(.03, .03, 1.2, 8), glowM(C.red, 3), { rot: [0, 0, Math.PI / 2 + .3], shadow: false }); link.position.set(0, 2.35, .5); st.scene.add(link);
    const spy = makeBit({ shell: 0x5a6070, accent: 0x34394a, eye: 0xff5a5a }); spy.scale.setScalar(.4); spy.position.set(0, 3.5, -.6); st.scene.add(spy);
    return { ...st, update(t, s) { users.forEach((b, i) => b.pose({ s, upR: i ? 0 : .5, upL: i ? .5 : 0 })); hs.forEach((g, i) => g.scale.setScalar(popIn(t, .1 + i * .1))); link.visible = t > .4; link.scale.y = 1 + Math.sin(s * 6) * .05;
      spy.pose({ s, lookY: Math.sin(s * 2) * .5, happy: t > .5 ? 1 : 0 }); spy.scale.setScalar(.4 * popIn(t, .5)); cam(st, s, 2.3); } };
  };
  BUILD.pw_salt = () => {
    const st = stage(warm), shaker = G(M(new THREE.CylinderGeometry(.3, .35, .9, 24), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .6, roughness: .05 }), { pos: [0, .45, 0] }), M(new THREE.SphereGeometry(.31, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), metal(0xc9cdd8), { pos: [0, .9, 0] }));
    shaker.position.set(0, 3.6, .3); shaker.rotation.z = Math.PI; st.scene.add(shaker);
    const grains = []; for (let i = 0; i < 20; i++) { const g = M(new THREE.BoxGeometry(.05, .05, .05), plastic(0xffffff), { shadow: false }); st.scene.add(g); grains.push([g, i / 20]); }
    const hs = [-1, 1].map((d, i) => { const g = pill(1.35, .32, '', { color: 0x1d2442, fg: '#b6ff5c', size: 50 }); g.position.set(d * .72, 1.8 - i * .5, .5); st.scene.add(g); return g; });
    const salts = [-1, 1].map((d, i) => { const g = pill(.9, .3, ['+ x7Q2', '+ m9Lp'][i], { color: 0xffffff, fg: '#6b4fd8', size: 44 }); g.position.set(d * .72, 2.45 - i * .5, .5); st.scene.add(g); return g; });
    const lb = textSign(1.6, .42, 'SALT', { color: 0xffffff, fg: '#1d2442', size: 70 }); lb.position.set(0, 4.65, .4); st.scene.add(lb);
    return { ...st, update(t, s) { shaker.rotation.z = Math.PI + Math.sin(s * 10) * .3; shaker.position.x = Math.sin(s * 2) * .4; grains.forEach(([g, ph]) => { const u = frac(s * 1.2 + ph); g.position.set(shaker.position.x + Math.sin(ph * 30) * .2, lerp(3.2, 1.8, u), .4); g.rotation.set(s * 5, s * 3, 0); });
      const salted = t > .4; hs.forEach((g, i) => { g.userData.redraw((x, w, h) => { x.fillStyle = '#1d2442'; x.fillRect(0, 0, w, h); label(x, salted ? fakeHash('qwerty123' + ['x7Q2', 'm9Lp'][i], 10) : fakeHash('qwerty123', 10), w / 2, h / 2 + 3, h * .5, salted ? '#b6ff5c' : '#ff7a9a', 700, 'center', MONO); }); g.scale.setScalar(popIn(t, .05)); });
      salts.forEach((g, i) => g.scale.setScalar(popIn(t, .3 + i * .05))); lb.scale.setScalar(popIn(t, .1)); cam(st, s, 2.7); } };
  };
  BUILD.pw_slow = () => {
    const st = stage(soft), glass = new THREE.Group(); glass.position.set(0, 2.6, 0); st.scene.add(glass);
    glass.add(M(new THREE.ConeGeometry(.6, 1.0, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false }), { pos: [0, .5, 0], rot: [Math.PI, 0, 0], shadow: false }), M(new THREE.ConeGeometry(.6, 1.0, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, side: THREE.DoubleSide, depthWrite: false }), { pos: [0, -.5, 0], shadow: false }));
    [-1, 1].forEach(d => glass.add(M(new THREE.CylinderGeometry(.7, .7, .1, 32), plastic(0x8a5a3c), { pos: [0, d * 1.05, 0] })));
    const top = M(new THREE.ConeGeometry(.5, .8, 32), plastic(0xffc44d), { pos: [0, .45, 0], rot: [Math.PI, 0, 0] }), bot = M(new THREE.ConeGeometry(.5, .8, 32), plastic(0xffc44d), { pos: [0, -.62, 0] }); glass.add(top, bot);
    const ms = pill(1.8, .42, '0.25 s each', { color: 0xffffff, size: 56 }); ms.position.set(0, 4.5, .4); st.scene.add(ms);
    return { ...st, update(t, s) { const k = frac(s * .4); top.scale.set(1 - k * .8, 1 - k * .8, 1 - k * .8); bot.scale.set(.2 + k * .8, .2 + k * .8, .2 + k * .8); glass.rotation.z = k > .97 ? Math.PI * (k - .97) / .03 : 0;
      ms.scale.setScalar(popIn(t, .3)); cam(st, s, 2.7); } };
  };
  BUILD.pw_guess = () => {
    const st = stage(night), bot = makeBit({ shell: 0x5a6070, accent: 0x34394a, eye: 0xff5a5a }); bot.scale.setScalar(.7); bot.position.set(0, .3, .6); st.scene.add(bot);
    const belt = M(RB(2.6, .2, 1.2, .08), plastic(0x2a3046), { pos: [0, .1, .6] }); st.scene.add(belt);
    const guesses = ['password', '123456', 'letmein', 'dragon', 'qwerty', 'monkey', 'sunshine', 'iloveyou'].map(w => { const g = pill(1.3, .3, w, { color: 0xffffff, size: 42 }); st.scene.add(g); return g; });
    const yrs = sign(2.4, .5, () => {}, { color: 0xffffff }); yrs.position.set(0, 4.6, .3); st.scene.add(yrs);
    return { ...st, update(t, s) { bot.pose({ s, walk: s * 14, sad: seg(t, .5, .7), tilt: Math.sin(s * 7) * .05 }); guesses.forEach((g, i) => { const u = frac(s * .3 + i / 8); g.position.set(lerp(-1.6, 1.6, u), 2.2 + (i % 3) * .5, -.3); g.scale.setScalar(Math.sin(u * Math.PI) * .9); });
      const v = lerp(1, 40000, Math.pow(ease(seg(t, .2, .9)), 2)); yrs.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, 'time needed ×' + Math.round(v).toLocaleString('en-US'), w / 2, h / 2 + 4, h * .46, '#d42f7f', 900, 'center', MONO); }); yrs.scale.setScalar(popIn(t, .15)); cam(st, s, 2.4); } };
  };
  BUILD.pw_weak = () => {
    const st = stage(warm), list = ['123456', 'password', 'qwerty', '111111', 'abc123'].map((w, i) => { const g = pill(1.6, .38, w, { color: 0xffffff, size: 54 }); g.position.set(-.5, 4.3 - i * .55, 0); st.scene.add(g); return g; });
    const marks = list.map(() => { const m = pill(.4, .4, '✕', { color: C.red, fg: '#fff', size: 80, font: undefined }); st.scene.add(m); return m; });
    const strong = pill(2.6, .4, 'tulip-orbit-Gravel-93!', { color: 0x5ce06a, fg: '#14320a', size: 46 }); strong.position.set(0, .9, .8); st.scene.add(strong);
    return { ...st, update(t, s) { list.forEach((g, i) => { g.scale.setScalar(popIn(t, .05 + i * .07)); marks[i].position.set(.6, 4.3 - i * .55, .2); marks[i].scale.setScalar(popIn(t, .4 + i * .05)); g.rotation.z = t > .4 + i * .05 ? Math.sin(s * 6 + i) * .05 : 0; });
      strong.scale.setScalar(popIn(t, .75)); cam(st, s, 2.6); } };
  };
  BUILD.pw_tips = () => {
    const st = stage(soft), vault = makeVault(); vault.scale.setScalar(.7); vault.position.set(-1.0, 3.6, 0); st.scene.add(vault);
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(.6); ph.position.set(1.0, 3.6, .2); st.scene.add(ph);
    const code = pill(1.0, .34, '482 193', { color: 0xffffff, size: 56 }); code.position.set(1.0, 4.55, .4); st.scene.add(code);
    const mail = G(M(RB(1.6, 1.0, .08, .05), plastic(0xffffff), {})); const mt = ctex(400, 250, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, 'Your password is:', w / 2, 80, 32, '#1d2442', 800); label(x, 'hunter2', w / 2, 150, 44, '#d42f2f', 800, 'center', MONO); });
    mail.add(M(new THREE.PlaneGeometry(1.5, .9), new THREE.MeshBasicMaterial({ map: mt.tex, toneMapped: false }), { pos: [0, 0, .045], shadow: false })); mail.position.set(0, 1.7, .5); st.scene.add(mail);
    const no = pill(.5, .5, '✕', { color: C.red, fg: '#fff', size: 100, font: undefined }); no.position.set(.8, 2.1, .7); st.scene.add(no);
    const l1 = pill(1.4, .32, 'MANAGER', { color: C.violet, fg: '#fff', size: 46, font: undefined }), l2 = pill(1.1, .32, '2FA', { color: C.pink, fg: '#fff', size: 50, font: undefined }); l1.position.set(-1.0, 2.8, .4); l2.position.set(1.0, 2.8, .4); st.scene.add(l1, l2);
    return { ...st, update(t, s) { vault.scale.setScalar(.7 * popIn(t, .05)); vault.userData.door.rotation.y = s; ph.scale.setScalar(.6 * popIn(t, .2)); code.scale.setScalar(popIn(t, .25)); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .25));
      mail.scale.setScalar(popIn(t, .55)); no.scale.setScalar(popIn(t, .7)); mail.rotation.z = Math.sin(s * 2) * .05; cam(st, s, 2.8); } };
  };
}
