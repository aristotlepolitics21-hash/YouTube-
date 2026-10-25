// Sets for Tech Shorts episode 10: How Bluetooth Actually Works (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { waves, screenFace, makePhone } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, night = { top: '#141c3d', bottom: '#3b2f6b', floor: 0x3a2f68, hemi: .9 }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };
  const BT = 0x2b7bff;

  // ---------- props ----------
  function makeBud(col = 0xffffff) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    body.add(M(SPH(.42, 32, 24), plastic(col), { scale: [1, 1.15, .9] }), M(new THREE.CapsuleGeometry(.12, .5, 8, 16), plastic(col), { pos: [.05, -.6, 0], rot: [0, 0, .15] }), M(SPH(.16, 20, 14), plastic(0x2a3046), { pos: [-.22, .1, .28] }));
    [-1, 1].forEach(d => body.add(M(new THREE.CapsuleGeometry(.035, .06, 4, 8), new THREE.MeshBasicMaterial({ color: 0x141a2c }), { pos: [.1 + d * .1, .12, .37], shadow: false })));
    body.add(M(new THREE.TorusGeometry(.06, .015, 6, 16, Math.PI), new THREE.MeshBasicMaterial({ color: 0x141a2c }), { pos: [.1, -.02, .38], rot: [0, 0, Math.PI], shadow: false }));
    g.userData.body = body; g.bob = (s, ph = 0) => { body.position.y = Math.sin(s * 4 + ph) * .06; body.rotation.z = Math.sin(s * 3 + ph) * .1; };
    return g;
  }
  function btLogo(s = 1, col = BT) {
    const t = ctex(256, 256, (x, w, h) => { x.fillStyle = col === BT ? '#2b7bff' : '#' + new THREE.Color(col).getHexString(); rrect(x, 20, 4, 216, 248, 100); x.fill();
      x.strokeStyle = '#ffffff'; x.lineWidth = 18; x.lineJoin = 'round'; x.beginPath(); x.moveTo(78, 82); x.lineTo(176, 172); x.lineTo(128, 216); x.lineTo(128, 40); x.lineTo(176, 84); x.lineTo(78, 174); x.stroke(); });
    const m = M(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t.tex, transparent: true, toneMapped: false }), { shadow: false }); m.scale.setScalar(s); return m;
  }
  function pulse(col = BT) { return G(M(SPH(.07, 12, 8), glowM(col, 5), { shadow: false }), sprite(col, .55, .9)); }
  const cam = (st, s, y = 2.6, z = 8.8) => aim(st.cam, [Math.sin(s * .5) * .8, y + .25, z], [0, y, 0]);

  // ---------- sets ----------
  BUILD.bt_hook = () => {
    const st = stage(night), ph = makePhone(0xff6fb1); ph.scale.setScalar(1.1); ph.position.set(-.9, 2.3, 0); st.scene.add(ph);
    const buds = [0, 1].map(i => { const b = makeBud(); b.scale.setScalar(.8); b.position.set(1.1, 3.4 - i * 1.4, .3); st.scene.add(b); return b; });
    const ps = [0, 1, 2, 3, 4, 5].map(() => { const p = pulse(); st.scene.add(p); return p; });
    const cnt = sign(2.2, .5, () => {}, { color: 0xffffff }); cnt.position.set(0, 4.75, .3); st.scene.add(cnt);
    return { ...st, update(t, s) { buds.forEach((b, i) => b.bob(s, i * 2));
      ps.forEach((p, i) => { const u = frac(s * 1.4 + i / 6), dst = buds[i % 2].position; p.position.lerpVectors(V(-.9, 2.6, .3), dst, u); p.position.y += Math.sin(u * Math.PI) * .6 * ((i % 3) - 1); });
      cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, Math.floor(s * 1600).toLocaleString('en-US') + ' hops', w / 2, h / 2 + 4, h * .55, '#2b7bff', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .2));
      cam(st, s, 2.7); } };
  };
  BUILD.bt_title = (p) => {
    const st = stage({ top: '#bcd8ff', bottom: '#d8c8ff', floor: 0xcdb8ff }); st.scene.add(pedestal(1.3, 0xffffff, BT));
    const logo = btLogo(1.3); logo.position.set(0, 1.55, .2); st.scene.add(logo);
    const buds = [-1, 1].map(d => { const b = makeBud(); b.scale.setScalar(.55); b.position.set(d * 1.15, 1.2, .3); b.rotation.y = -d * .4; st.scene.add(b); return b; });
    const s1 = textSign(3.2, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 96 }), s2 = textSign(3.3, .72, p.bottom, { color: BT, fg: '#ffffff', size: 96 }); s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { logo.position.y = 1.55 + Math.abs(Math.sin(s * 3)) * .15; logo.rotation.y = Math.sin(s * 1.5) * .5; buds.forEach((b, i) => { b.bob(s, i * 3); b.position.y = 1.0 + hop(frac(s * .7 + i * .5) * 1.4, .8, .4).y; });
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.4], [0, 2.5, 0]); } };
  };
  BUILD.bt_radio = () => {
    const st = stage(soft), ph = makePhone(0xff6fb1); ph.scale.setScalar(.8); ph.position.set(0, 2.2, 0); st.scene.add(ph);
    const bub = M(SPH(1, 48, 32), new THREE.MeshPhysicalMaterial({ color: BT, transparent: true, opacity: .12, roughness: .1, depthWrite: false }), { pos: [0, 2.2, 0], shadow: false }); st.scene.add(bub);
    const wv = waves(BT, 4, 1.8, .9, .035); wv.position.set(0, 2.6, .1); st.scene.add(wv);
    const wifi = waves(0xffc44d, 4, 3.4, .6, .02); wifi.position.set(0, 2.6, -.4); st.scene.add(wifi);
    const lb1 = textSign(1.6, .4, '2.4 GHz', { color: 0xffffff, fg: '#2b7bff', size: 62, font: MONO }), lb2 = textSign(1.8, .4, 'A FEW METRES', { color: BT, fg: '#fff', size: 56 }); lb1.position.set(0, 4.55, .4); lb2.position.set(0, .6, 1.5); st.scene.add(lb1, lb2);
    return { ...st, update(t, s) { const r = ease(seg(t, .4, .7)) * 1.7; bub.scale.setScalar(Math.max(.01, r)); wv.update(s, 1, .55); wifi.update(s, .5 * seg(t, .1, .2));
      lb1.scale.setScalar(popIn(t, .1)); lb2.scale.setScalar(popIn(t, .6)); ph.rotation.y = Math.sin(s) * .2; cam(st, s); } };
  };
  BUILD.bt_power = () => {
    const st = stage(warm), items = [makeBud(), new THREE.Group(), new THREE.Group()];
    items[1].add(M(RB(.9, 1.0, .3, .25), plastic(0x2a3046)), M(RB(.7, .8, .05, .2), glowM(0x5ff3ff, .8), { pos: [0, 0, .16], shadow: false }), M(RB(.5, .6, .1, .1), plastic(C.pink), { pos: [0, .75, -.05] }), M(RB(.5, .6, .1, .1), plastic(C.pink), { pos: [0, -.75, -.05] }));
    items[2].add(M(RB(1.8, .14, .7, .06), plastic(0xeeeeee)), ...Array.from({ length: 18 }, (_, i) => M(RB(.16, .06, .16, .03), plastic(0xffffff), { pos: [-.7 + (i % 6) * .28, .1, -.2 + Math.floor(i / 6) * .2] })));
    items.forEach((it, i) => { it.position.set(-1.1 + i * 1.1, 2.4 + (i % 2) * .5, 0); it.scale.setScalar(i === 2 ? .5 : .7); st.scene.add(it); });
    const bat = new THREE.Group(); bat.position.set(0, 1.4, 1.0); st.scene.add(bat); bat.add(M(RB(1.6, .6, .35, .12), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .3, roughness: .05, depthWrite: false }), { shadow: false }), M(RB(.1, .26, .25, .03), plastic(0xc9cdd8), { pos: [.86, 0, 0] }));
    const fill = M(RB(1.4, .46, .28, .08), plastic(0x5ce06a), {}); bat.add(fill);
    const lb = textSign(1.9, .42, 'LOW POWER', { color: 0x5ce06a, fg: '#14320a', size: 60 }); lb.position.set(0, 4.5, .4); st.scene.add(lb);
    return { ...st, update(t, s) { items.forEach((it, i) => { it.position.x = -1.1 + i * 1.1; it.position.y = 2.6 + (i % 2) * .5 + hop(frac(s * .6 + i * .33) * 1.6, .9, .35).y; it.rotation.y = Math.sin(s + i) * .3; }); items[0].bob(s);
      fill.scale.x = .96 - Math.sin(s * .2) * .02; lb.scale.setScalar(popIn(t, .2)); cam(st, s, 2.5); } };
  };
  BUILD.bt_crowd = () => {
    const st = stage(night), cols = [0xffc44d, 0xff8a3d, 0xff4fa3, 0x9b7bff, 0x5ce06a], srcs = cols.map((c, i) => { const w = waves(c, 4, 2.2, .8 + i * .2, .035); w.position.set(-1.4 + (i % 3) * 1.4, 2.0 + Math.floor(i / 3) * 1.8, -.2); st.scene.add(w); return w; });
    const tags = ['Wi-Fi', 'microwave', 'speaker', 'mouse', 'watch'].map((l, i) => { const g = textSign(1.0, .32, l, { color: cols[i], fg: '#1d2442', size: 44, depth: .05 }); g.position.set(-1.4 + (i % 3) * 1.4, 2.0 + Math.floor(i / 3) * 1.8 + .55, .2); st.scene.add(g); return g; });
    return { ...st, update(t, s) { srcs.forEach((w, i) => w.update(s * (1 + i * .1))); tags.forEach((g, i) => { g.scale.setScalar(popIn(t, .1 + i * .1)); g.rotation.z = Math.sin(s * 6 + i) * .08; }); cam(st, s, 2.8); } };
  };
  // the 79-lane channel board, with a hop pattern
  const pattern = (n, seed = 3) => { const r = rng(seed), a = []; for (let i = 0; i < n; i++) a.push(Math.floor(r() * 79)); return a; };
  function laneBoard() {
    const g = new THREE.Group(); g.add(M(RB(3.4, 3.0, .1, .1), plastic(0x1d2236), { pos: [0, 0, -.06] }));
    const lanes = new THREE.InstancedMesh(new THREE.BoxGeometry(.03, 2.8, .02), new THREE.MeshBasicMaterial({ toneMapped: false }), 79), m = new THREE.Matrix4(), c = new THREE.Color();
    lanes.paint = fn => { for (let i = 0; i < 79; i++) { m.makeTranslation(-1.6 + i * 3.2 / 78, 0, 0); lanes.setMatrixAt(i, m); lanes.setColorAt(i, c.set(fn(i))); } lanes.instanceMatrix.needsUpdate = true; lanes.instanceColor.needsUpdate = true; };
    lanes.paint(() => 0x3a4466); g.add(lanes); g.userData.lanes = lanes; g.laneX = i => -1.6 + i * 3.2 / 78; return g;
  }
  BUILD.bt_hop = () => {
    const st = stage(night), b = laneBoard(); b.position.set(0, 2.6, 0); st.scene.add(b); const P = pattern(400);
    const dot = pulse(0x5ff3ff); st.scene.add(dot); const trail = []; for (let i = 0; i < 10; i++) { const d = pulse(0x5ff3ff); d.scale.setScalar(.6); st.scene.add(d); trail.push(d); }
    const n79 = textSign(1.7, .42, '79 CHANNELS', { color: 0x5ff3ff, fg: '#0b3a55', size: 58 }); n79.position.set(0, 4.5, .4); st.scene.add(n79);
    return { ...st, update(t, s) { const k = Math.floor(s * 8), cur = P[k % P.length]; b.userData.lanes.paint(i => i === cur ? 0x5ff3ff : 0x3a4466);
      dot.position.set(b.laneX(cur), 2.6 + Math.sin(s * 8 * Math.PI) * .1, .2); trail.forEach((d, j) => { const kk = Math.max(0, k - j - 1); d.position.set(b.laneX(P[kk % P.length]), 2.6 - (j + 1) * .12, .15); d.scale.setScalar(.5 * (1 - j / 10)); });
      n79.scale.setScalar(popIn(t, .2)); cam(st, s, 2.8); } };
  };
  BUILD.bt_dodge = () => {
    const st = stage(night), b = laneBoard(); b.position.set(0, 2.9, 0); st.scene.add(b); const P = pattern(400, 9), noisy = new Set([20, 21, 22, 23, 24, 25, 50, 51, 52]);
    const ph = makePhone(0xff6fb1), bud = makeBud(); ph.scale.setScalar(.5); bud.scale.setScalar(.6); ph.position.set(-1.2, .9, .8); bud.position.set(1.2, 1.0, .8); st.scene.add(ph, bud);
    const d1 = pulse(0xff6fb1), d2 = pulse(0xffffff); st.scene.add(d1, d2);
    const sync = textSign(1.8, .42, 'IN STEP ✓', { color: 0x5ce06a, fg: '#14320a', size: 58 }); sync.position.set(0, 4.75, .4); st.scene.add(sync);
    return { ...st, update(t, s) { const k = Math.floor(s * 6); let cur = P[k % P.length]; if (noisy.has(cur)) cur = (cur + 7) % 79;
      b.userData.lanes.paint(i => noisy.has(i) ? 0xff5a3d : i === cur ? 0x5ff3ff : 0x3a4466); d1.position.set(b.laneX(cur), 3.3, .25); d2.position.set(b.laneX(cur), 2.5, .25); bud.bob(s);
      sync.scale.setScalar(popIn(t, .5)); cam(st, s, 2.7); } };
  };
  BUILD.bt_pair = () => {
    const st = stage(soft), ph = makePhone(0xff6fb1), bud = makeBud(); ph.scale.setScalar(.9); bud.scale.setScalar(.9); st.scene.add(ph, bud);
    const keys = [0, 1].map(() => { const k = G(M(new THREE.TorusGeometry(.16, .05, 10, 24), metal(0xffd36e), { pos: [-.3, 0, 0] }), M(RB(.4, .07, .06, .02), metal(0xffd36e), { pos: [.05, 0, 0] }), M(RB(.06, .12, .06, .02), metal(0xffd36e), { pos: [.2, -.07, 0] })); k.scale.setScalar(1.8); st.scene.add(k); return k; });
    const heart = textSign(.6, .6, '♥', { color: C.pink, fg: '#ffffff', size: 120 }); heart.position.set(0, 4.4, .5); st.scene.add(heart);
    return { ...st, update(t, s) { const near = ease(seg(t, .05, .3)); ph.position.set(lerp(-1.6, -.8, near), 2.3, 0); bud.position.set(lerp(1.6, .8, near), 2.6, .2); bud.bob(s);
      const sw = ease(seg(t, .3, .7)); keys[0].position.set(lerp(-.8, .8, sw), 3.3 + Math.sin(sw * Math.PI) * .6, .5); keys[1].position.set(lerp(.8, -.8, sw), 3.3 - Math.sin(sw * Math.PI) * .3, .5); keys.forEach(k => k.rotation.y = s * 3);
      heart.scale.setScalar(popIn(t, .72) * (1 + Math.sin(s * 8) * .08)); cam(st, s, 2.8); } };
  };
  BUILD.bt_reconnect = () => {
    const st = stage(warm), ph = makePhone(0xff6fb1), bud = makeBud(); ph.scale.setScalar(.85); bud.scale.setScalar(.85); ph.position.set(-.9, 2.4, 0); bud.position.set(.95, 2.6, .2); st.scene.add(ph, bud);
    const chain = []; for (let i = 0; i < 5; i++) { const l = M(new THREE.TorusGeometry(.13, .04, 8, 20), metal(0xc9cdd8), { rot: [0, i % 2 ? Math.PI / 2 : 0, Math.PI / 2] }); l.position.set(-.45 + i * .22, 2.7, .3); st.scene.add(l); chain.push(l); }
    const lock = G(M(RB(.5, .42, .25, .08), metal(0xffc44d)), M(new THREE.TorusGeometry(.16, .05, 10, 20, Math.PI), metal(0xd7dbe6), { pos: [0, .2, 0] })); lock.position.set(0, 3.6, .4); st.scene.add(lock);
    const lb = textSign(1.6, .42, 'ENCRYPTED', { color: C.amber, fg: '#3a2400', size: 60 }); lb.position.set(0, 4.5, .4); st.scene.add(lb);
    return { ...st, update(t, s) { chain.forEach((l, i) => l.scale.setScalar(popIn(t, .05 + i * .05))); bud.bob(s); lock.scale.setScalar(popIn(t, .45)); lock.rotation.y = Math.sin(s * 2) * .3; lb.scale.setScalar(popIn(t, .55)); cam(st, s, 2.8); } };
  };
  BUILD.bt_codec = () => {
    const st = stage(night), big = M(new THREE.TorusKnotGeometry(.5, .15, 120, 16), glowM(0xffc44d, 1.6), { shadow: false }); st.scene.add(big);
    const box = M(RB(.6, .6, .6, .15), plastic(BT), {}); st.scene.add(box);
    const ph = makePhone(0xff6fb1), bud = makeBud(); ph.scale.setScalar(.6); bud.scale.setScalar(.7); ph.position.set(-1.3, 1.4, .5); bud.position.set(1.3, 1.5, .5); st.scene.add(ph, bud);
    const l1 = textSign(1.3, .4, 'SQUEEZE', { color: 0xffc44d, fg: '#3a2400', size: 58 }), l2 = textSign(1.3, .4, 'UNPACK', { color: 0x5ce06a, fg: '#14320a', size: 58 }); l1.position.set(-1.0, 4.5, .4); l2.position.set(1.0, 4.5, .4); st.scene.add(l1, l2);
    return { ...st, update(t, s) { const sq = ease(seg(t, .05, .3)), tr = ease(seg(t, .3, .7)), up = ease(seg(t, .7, .9)); big.rotation.set(s, s * .7, 0);
      big.scale.setScalar(t < .3 ? lerp(1, .15, sq) : t < .7 ? .0001 : lerp(.15, .8, up)); big.position.set(t < .7 ? -1.0 : 1.0, 3.2, 0); box.visible = t > .25 && t < .75; box.position.set(lerp(-1.0, 1.0, tr), 3.2 + Math.sin(tr * Math.PI) * .5, 0); box.rotation.set(s * 3, s * 2, 0);
      l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .7)); bud.bob(s); cam(st, s, 2.7); } };
  };
  BUILD.bt_delay = () => {
    const st = stage(soft), tv = G(M(RB(2.6, 1.6, .14, .1), plastic(0x2a3046)), M(new THREE.CylinderGeometry(.05, .05, .4, 10), metal(0xc9cdd8), { pos: [0, -1.0, 0] }));
    const face = ctex(512, 320); tv.add(M(new THREE.PlaneGeometry(2.4, 1.4), new THREE.MeshBasicMaterial({ map: face.tex, toneMapped: false }), { pos: [0, 0, .08], shadow: false })); tv.position.set(0, 3.5, 0); st.scene.add(tv);
    const bud = makeBud(); bud.scale.setScalar(.7); bud.position.set(1.2, 1.3, .6); st.scene.add(bud);
    const note = textSign(.42, .42, '♪', { color: C.amber, fg: '#3a2400', size: 90 }); st.scene.add(note);
    const lag = textSign(1.6, .4, 'TINY DELAY', { color: C.pink, fg: '#ffffff', size: 58 }); lag.position.set(-.9, 1.6, .8); st.scene.add(lag);
    return { ...st, update(t, s) { const open = Math.abs(Math.sin(s * 5)) > .5;
      face.redraw((x, w, h) => { x.fillStyle = '#ffd6a8'; x.fillRect(0, 0, w, h); x.fillStyle = '#141a2c'; [-1, 1].forEach(d => { x.beginPath(); x.arc(w / 2 + d * 70, 120, 20, 0, 7); x.fill(); }); x.fillStyle = '#c0392b'; x.beginPath(); x.ellipse(w / 2, 210, 60, open ? 40 : 8, 0, 0, 7); x.fill(); });
      const u = frac(s * 5 / Math.PI); note.position.set(lerp(.5, 1.2, u), lerp(2.8, 1.9, u), .6); note.scale.setScalar(Math.sin(u * Math.PI)); bud.bob(s); lag.scale.setScalar(popIn(t, .3)); cam(st, s, 2.7); } };
  };
  BUILD.bt_ble = () => {
    const st = stage(night), tag = G(M(new THREE.CylinderGeometry(.8, .8, .3, 48), plastic(0xffffff), { rot: [Math.PI / 2, 0, 0] }), M(new THREE.CylinderGeometry(.55, .55, .32, 48), plastic(0xeef2fa), { rot: [Math.PI / 2, 0, 0] }));
    const face = screenFace(.7, .45, '#eef2fa', '#2a3046'); face.position.set(0, .05, .17); tag.add(face); tag.position.set(0, 2.5, 0); st.scene.add(tag);
    const zz = ['z', 'Z', 'z'].map((l, i) => { const g = textSign(.32, .32, l, { color: 0x9b7bff, fg: '#ffffff', size: 80, depth: .05 }); st.scene.add(g); return g; });
    const burst = waves(BT, 3, 1.6, 1.5, .04); burst.position.set(0, 2.5, .1); st.scene.add(burst);
    const yr = textSign(1.9, .44, '~1 YEAR', { color: 0x5ce06a, fg: '#14320a', size: 70 }); yr.position.set(0, 4.5, .4); st.scene.add(yr);
    return { ...st, update(t, s) { const awake = frac(s * .5) < .12; burst.update(s, awake ? 1 : 0); tag.position.y = 2.5 + (awake ? .1 : Math.sin(s * 1.5) * .04); tag.rotation.z = Math.sin(s * .8) * .1;
      zz.forEach((g, i) => { const u = frac(s * .4 + i / 3); g.position.set(.6 + u * .6, 3.2 + u * .8, .3); g.scale.setScalar(awake ? 0 : Math.sin(u * Math.PI) * .9); }); yr.scale.setScalar(popIn(t, .55)); cam(st, s, 2.8); } };
  };
  BUILD.bt_name = () => {
    const st = stage(warm), bit = makeBit(); bit.scale.setScalar(.8); bit.position.set(0, 0, .3); st.scene.add(bit);
    const helm = G(M(new THREE.SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), metal(0xb8c0cc), { scale: [1.05, .8, 1.05] }), ...[-1, 1].map(d => M(new THREE.ConeGeometry(.15, .7, 16), plastic(0xfff3d6), { pos: [d * .95, .4, 0], rot: [0, 0, -d * 1.0] })));
    helm.position.set(0, .4, 0); bit.userData.body.add(helm);
    const runes = ctex(512, 256, (x, w, h) => { x.fillStyle = '#fff6e0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a3046'; x.lineWidth = 14; x.lineCap = 'round';
      x.beginPath(); x.moveTo(110, 40); x.lineTo(110, 216); x.moveTo(60, 70); x.lineTo(160, 186); x.moveTo(160, 70); x.lineTo(60, 186); x.stroke();
      x.beginPath(); x.moveTo(250, 40); x.lineTo(250, 216); x.moveTo(250, 40); x.lineTo(320, 90); x.lineTo(250, 128); x.lineTo(320, 172); x.lineTo(250, 216); x.stroke(); label(x, '+', 190, 128, 70, '#9aa3bd', 900); label(x, '=', 375, 128, 70, '#9aa3bd', 900); });
    const plate = M(new THREE.PlaneGeometry(1.8, .9), new THREE.MeshBasicMaterial({ map: runes.tex, toneMapped: false }), { shadow: false }); plate.position.set(-.45, 4.1, .2); st.scene.add(plate);
    const logo = btLogo(.75); logo.position.set(1.15, 4.1, .3); st.scene.add(logo);
    return { ...st, update(t, s) { bit.pose({ s, happy: 1, upR: .9, tilt: Math.sin(s * 2) * .08 }); plate.scale.setScalar(popIn(t, .45)); logo.scale.setScalar(.75 * popIn(t, .65)); logo.rotation.y = Math.sin(s * 2) * .3; cam(st, s, 2.4); } };
  };
}
