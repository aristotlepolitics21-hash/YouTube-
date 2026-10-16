// Sets for Tech Shorts episode 15: How Video Streaming Actually Works (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, makeHost, hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { makePhone } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, night = { top: '#141c3d', bottom: '#3b2f6b', floor: 0x3a2f68, hemi: .9 }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };
  const PLAY = 0xff4f6a;

  // ---------- a little cartoon "video": a ball bouncing over hills; q = quality (pixel block size), tt = video time ----------
  function frame2d(x, w, h, tt = 0, q = 1) {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7ec8ff'); g.addColorStop(.6, '#ffe0b8'); g.addColorStop(.61, '#6fcf6a'); g.addColorStop(1, '#3f9e52'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#fff3a0'; x.beginPath(); x.arc(w * .8, h * .22, w * .08, 0, 7); x.fill(); x.fillStyle = '#ffffff'; [[.2, .2], [.5, .14]].forEach(([a, b]) => { x.beginPath(); x.ellipse(w * ((a + tt * .03) % 1.1), h * b, w * .1, h * .05, 0, 0, 7); x.fill(); });
    const bx = w * (.15 + frac(tt * .25) * .7), by = h * (.6 - Math.abs(Math.sin(tt * 3)) * .35); x.fillStyle = '#ff4f6a'; x.beginPath(); x.arc(bx, by, w * .07, 0, 7); x.fill(); x.fillStyle = '#141a2c'; [-1, 1].forEach(d => { x.beginPath(); x.arc(bx + d * w * .02, by - w * .01, w * .01, 0, 7); x.fill(); });
    if (q > 1) { const d = x.getImageData(0, 0, w, h), a = d.data, B = Math.round(q); for (let Y = 0; Y < h; Y += B) for (let X = 0; X < w; X += B) { const i = (Y * w + X) * 4; for (let yy = Y; yy < Math.min(h, Y + B); yy++) for (let xx = X; xx < Math.min(w, X + B); xx++) { const j = (yy * w + xx) * 4; a[j] = a[i]; a[j + 1] = a[i + 1]; a[j + 2] = a[i + 2]; } } x.putImageData(d, 0, 0); }
  }
  function screen(w, h, o = {}) { const t = ctex(Math.round(w * 140), Math.round(h * 140)); const g = G(M(RB(w + .2, h + .2, .14, .1), plastic(o.frame ?? 0x2a3046), {}), M(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t.tex, toneMapped: false }), { pos: [0, 0, .075], shadow: false }));
    g.draw = (tt, q = 1, over) => t.redraw((x, cw, ch) => { frame2d(x, cw, ch, tt, q); if (over) over(x, cw, ch); }); return g; }
  function chunk(i, q = 1, w = .7) { const g = screen(w, w * .56, { frame: [C.pink, C.amber, C.cyan, C.lime, C.violet][i % 5] }); g.draw(i * 1.3, q); return g; }
  function progressBar(w = 3.2) { const g = new THREE.Group(); g.add(M(RB(w, .12, .12, .05), plastic(0x3a4466), {}));
    const buf = M(RB(1, .13, .13, .05), plastic(0xc9cdd8), {}), played = M(RB(1, .14, .14, .05), plastic(PLAY), {}), head = M(SPH(.13, 20, 14), plastic(PLAY), {}); g.add(buf, played, head);
    g.set = (p, b) => { const x0 = -w / 2; played.scale.x = Math.max(.001, p * w); played.position.x = x0 + p * w / 2; buf.scale.x = Math.max(.001, b * w); buf.position.x = x0 + b * w / 2; head.position.x = x0 + p * w; }; g.set(0, 0); return g; }
  function spinner() { const g = new THREE.Group(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.add(M(SPH(.07, 12, 8), plastic(0xffffff, { transparent: true, opacity: .3 + i / 8 * .7 }), { pos: [Math.cos(a) * .35, Math.sin(a) * .35, 0] })); } return g; }
  const cam = (st, s, y = 2.6, z = 8.8) => aim(st.cam, [Math.sin(s * .5) * .8, y + .25, z], [0, y, 0]);

  // ---------- sets ----------
  BUILD.v_hook = () => {
    const st = stage(night), ph = makePhone(0xff6fb1); ph.scale.setScalar(1.0); ph.position.set(0, 1.6, .6); st.scene.add(ph);
    const chunks = [0, 1, 2, 3, 4].map(i => { const c = chunk(i); st.scene.add(c); return c; });
    const btn = G(M(new THREE.CylinderGeometry(.35, .35, .1, 32), plastic(PLAY), { rot: [Math.PI / 2, 0, 0] }), M(new THREE.ConeGeometry(.14, .22, 3), plastic(0xffffff), { pos: [.02, 0, .08], rot: [0, 0, -Math.PI / 2] })); btn.position.set(0, 1.6, .75); st.scene.add(btn);
    return { ...st, update(t, s) { const pr = t > .1 && t < .16; btn.scale.setScalar(pr ? .85 : 1); btn.visible = t < .2;
      chunks.forEach((c, i) => { const u = frac(s * .35 + i / 5); c.position.set(Math.sin(i * 2.1) * .6, lerp(4.6, 2.0, ease(u)), lerp(-1, .5, u)); c.rotation.set(0, Math.sin(s + i) * .4, Math.sin(s * 2 + i) * .1); c.scale.setScalar(t > .2 ? Math.sin(u * Math.PI) : 0); c.draw(s + i, 1); });
      cam(st, s, 2.6); } };
  };
  BUILD.v_title = (p) => {
    const st = stage({ top: '#ffd1d8', bottom: '#d6c8ff', floor: 0xcdb8ff }); st.scene.add(pedestal(1.3, 0xffffff, PLAY));
    const tv = screen(2.0, 1.13); tv.position.set(0, 1.7, 0); st.scene.add(tv);
    const s1 = textSign(3.4, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 92 }), s2 = textSign(3.3, .72, p.bottom, { color: PLAY, fg: '#ffffff', size: 96 }); s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { tv.draw(s, 1); tv.rotation.y = Math.sin(s * 1.2) * .3; tv.position.y = 1.7 + Math.abs(Math.sin(s * 3)) * .08;
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.4], [0, 2.5, 0]); } };
  };
  BUILD.v_chunks = () => {
    const st = stage(soft), strip = []; for (let i = 0; i < 5; i++) { const c = chunk(i, 1, .65); st.scene.add(c); strip.push(c); }
    const knife = G(M(RB(.06, 1.0, .3, .02), metal(0xd7dbe6), {}), M(RB(.12, .4, .3, .05), plastic(0x2a3046), { pos: [0, .7, 0] })); st.scene.add(knife);
    const secs = textSign(1.6, .4, '~2–10 s EACH', { color: 0xffffff, fg: '#1d2442', size: 54 }); secs.position.set(0, 4.4, .4); st.scene.add(secs);
    return { ...st, update(t, s) { const sp = ease(seg(t, .25, .55)); strip.forEach((c, i) => { c.position.set(-1.44 + i * .72 + (i - 2) * sp * .12, 2.6 + (i % 2 ? 1 : -1) * sp * .35, 0); c.rotation.z = (i - 2) * sp * .08; c.draw(i * 1.3 + s * .2, 1); });
      const kx = lerp(-1.1, 1.1, seg(t, .1, .5)); knife.position.set(kx, 2.65 + Math.abs(Math.sin(s * 14)) * .1, .3); knife.visible = t < .55; secs.scale.setScalar(popIn(t, .55)); cam(st, s, 2.7); } };
  };
  BUILD.v_ladder = () => {
    const st = stage(night), qs = [12, 8, 5, 3, 1], labs = ['240p', '480p', '720p', '1080p', '4K'], rungs = qs.map((q, i) => { const c = screen(1.25, .7); c.position.set(.4, 1.35 + i * .8, -i * .05); c.draw(1.5, q); st.scene.add(c);
      const l = textSign(.8, .32, labs[i], { color: [0x9aa3bd, 0x9aa3bd, C.cyan, C.lime, C.amber][i], fg: '#1d2442', size: 54, font: MONO }); l.position.set(-1.1, 1.35 + i * .8, .3); st.scene.add(l); return [c, l]; });
    return { ...st, update(t, s) { rungs.forEach(([c, l], i) => { c.scale.setScalar(popIn(t, .05 + i * .12)); l.scale.setScalar(popIn(t, .1 + i * .12)); c.rotation.y = Math.sin(s + i) * .1; }); cam(st, s, 2.7); } };
  };
  BUILD.v_why = () => {
    const st = stage(warm), tv = screen(2.4, 1.35); tv.position.set(0, 3.0, 0); st.scene.add(tv); const bar = progressBar(2.6); bar.position.set(0, 1.9, .3); st.scene.add(bar);
    const skip = textSign(1.0, .4, '⏩', { color: 0xffffff, fg: '#1d2442', size: 80 }); skip.position.set(1.0, 1.25, .5); st.scene.add(skip);
    return { ...st, update(t, s) { const jump = t > .5, p = jump ? .65 + (t - .5) * .2 : t * .3; bar.set(p, Math.min(1, p + .1)); tv.draw(jump ? 20 + s : s, 1); skip.scale.setScalar(t > .45 && t < .6 ? 1.1 : popIn(t, .3) * .9); cam(st, s, 2.6); } };
  };
  function globe(R = 1.6) { const g = new THREE.Group(), r = rng(4); g.add(M(SPH(R, 64, 48), plastic(0x3d8bff, { roughness: .35 })));
    for (let i = 0; i < 12; i++) { const th = r() * 6.28, ph = Math.acos(2 * r() - 1), n = V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)), c = M(SPH(R * (.15 + r() * .2), 20, 14), plastic(0x5cc46a), { scale: [1, 1, .25] }); c.position.copy(n.clone().multiplyScalar(R * .97)); c.lookAt(n.clone().multiplyScalar(R * 2)); g.add(c); } return g; }
  BUILD.v_cdn = () => {
    const st = stage(night), gl = globe(); gl.position.set(0, 2.6, 0); st.scene.add(gl);
    const nodes = []; const r = rng(9); for (let i = 0; i < 9; i++) { const th = r() * 6.28, ph = .5 + r() * 2.1, n = V(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)); const s = G(M(RB(.16, .22, .16, .04), plastic(0x7b6cff), {}), M(SPH(.04, 8, 6), glowM(0xb6ff5c, 3), { pos: [0, .14, 0], shadow: false })); s.position.copy(n.clone().multiplyScalar(1.68)); s.lookAt(n.clone().multiplyScalar(3)); s.rotateX(Math.PI / 2); gl.add(s); nodes.push(s); }
    const lb = textSign(2.0, .42, 'COPIES WORLDWIDE', { color: 0x7b6cff, fg: '#fff', size: 54 }); lb.position.set(0, 4.65, .4); st.scene.add(lb);
    return { ...st, update(t, s) { gl.rotation.y = s * .3; nodes.forEach((n, i) => n.scale.setScalar(popIn(t, .1 + i * .06))); lb.scale.setScalar(popIn(t, .3)); cam(st, s, 2.6); } };
  };
  BUILD.v_close = () => {
    const st = stage({ top: '#bfe4ff', bottom: '#d8f2c2', floor: 0x9dd67f, shadowBox: 9 }), house = G(M(RB(.9, .7, .8, .1), plastic(0xfff3e0), { pos: [0, .35, 0] }), M(new THREE.ConeGeometry(.75, .5, 4), plastic(C.red), { pos: [0, .95, 0], rot: [0, Math.PI / 4, 0] })); house.position.set(-1.1, 0, 1.4); st.scene.add(house);
    const near = makeHost(); near.scale.setScalar(.4); near.position.set(.3, 0, .2); st.scene.add(near); const far = makeHost({ color: 0x9aa3bd }); far.scale.setScalar(.5); far.position.set(1.2, 0, -7); st.scene.add(far);
    const p1 = G(M(SPH(.08, 12, 8), glowM(0x5ce06a, 4), { shadow: false })), p2 = G(M(SPH(.08, 12, 8), glowM(0xff5a5a, 4), { shadow: false })); st.scene.add(p1, p2);
    const l1 = textSign(1.0, .34, 'NEAR', { color: 0x5ce06a, fg: '#14320a', size: 54 }), l2 = textSign(1.0, .34, 'FAR', { color: 0x9aa3bd, fg: '#fff', size: 54 }); l1.position.set(.3, 1.5, .4); l2.position.set(1.2, 2.2, -7); st.scene.add(l1, l2);
    for (let i = 0; i < 8; i++) st.scene.add(K.tree(-2.5 + i * .7, -3 - (i % 3), .9, 0x55c271));
    return { ...st, update(t, s) { near.pose({ s }); far.pose({ s }); const a = frac(s * .8), b = frac(s * .2); p1.position.lerpVectors(V(.3, .7, .3), V(-1.1, .6, 1.4), a); p2.position.lerpVectors(V(1.2, .9, -7), V(-1.1, .6, 1.4), b); p2.position.y += Math.sin(b * Math.PI) * 1.5;
      l1.scale.setScalar(popIn(t, .2)); l2.scale.setScalar(popIn(t, .3)); aim(st.cam, [Math.sin(s * .4) * .6, 3.4, 8.0], [0, 1.0, -1.5]); } };
  };
  BUILD.v_isp = () => {
    const st = stage(soft), isp = G(M(RB(2.2, 1.6, 1.4, .15), plastic(0xffffff), { pos: [0, .8, 0] }), M(RB(2.3, .2, 1.5, .06), plastic(C.violet), { pos: [0, 1.7, 0] })); isp.position.set(0, 1.2, -.4); st.scene.add(isp);
    const sign1 = textSign(1.9, .38, 'YOUR INTERNET PROVIDER', { color: C.violet, fg: '#fff', size: 42 }); sign1.position.set(0, 3.3, .4); st.scene.add(sign1);
    const rack = makeHost({ color: PLAY }); rack.scale.setScalar(.45); rack.position.set(0, 1.25, .35); st.scene.add(rack);
    const tag = textSign(1.4, .34, 'VIDEO SERVER', { color: PLAY, fg: '#fff', size: 46 }); tag.position.set(0, 4.0, .4); st.scene.add(tag);
    return { ...st, update(t, s) { rack.pose({ s }); rack.position.z = .35 + (1 - ease(seg(t, .15, .45))) * 2; rack.scale.setScalar(.45 * popIn(t, .1)); sign1.scale.setScalar(popIn(t, .05)); tag.scale.setScalar(popIn(t, .5)); cam(st, s, 2.4); } };
  };
  function bufferSet(rate, labelTxt) {
    const st = stage(warm), tv = screen(2.4, 1.35); tv.position.set(0, 3.1, 0); st.scene.add(tv); const bar = progressBar(2.8); bar.position.set(0, 2.05, .3); st.scene.add(bar);
    const sp = spinner(); sp.position.set(0, 3.1, .3); st.scene.add(sp);
    const inc = [0, 1, 2].map(i => { const c = chunk(i, 1, .45); st.scene.add(c); return c; });
    const lb = labelTxt ? textSign(1.8, .4, labelTxt, { color: 0xffffff, fg: '#1d2442', size: 54 }) : null; if (lb) { lb.position.set(0, 4.55, .4); st.scene.add(lb); }
    return { st, tv, bar, sp, inc, lb, rate };
  }
  BUILD.v_buffer = () => {
    const B = bufferSet(1, 'BUFFER'), { st, tv, bar, sp, inc, lb } = B;
    return { ...st, update(t, s) { const p = t * .35, b = Math.min(1, p + .25 + t * .2); bar.set(p, b); tv.draw(s, 1); sp.visible = false;
      inc.forEach((c, i) => { const u = frac(s * .6 + i / 3); c.position.set(lerp(1.8, -1.4 + b * 2.8, u), lerp(1.2, 2.05, u), .5); c.scale.setScalar(Math.sin(u * Math.PI) * .8); c.draw(i, 1); }); lb.scale.setScalar(popIn(t, .15)); cam(st, s, 2.8); } };
  };
  BUILD.v_ahead = () => {
    const B = bufferSet(1, 'PLENTY AHEAD ✓'), { st, tv, bar, sp, inc, lb } = B;
    return { ...st, update(t, s) { const p = .2 + t * .2; bar.set(p, .9); tv.draw(s, 1); sp.visible = false; inc.forEach(c => c.visible = t > .5 && t < .62 ? false : true);
      inc.forEach((c, i) => { const u = frac(s * .4 + i / 3); c.position.set(lerp(1.8, 1.1, u), lerp(1.2, 2.05, u), .5); c.scale.setScalar(Math.sin(u * Math.PI) * .7); }); lb.scale.setScalar(popIn(t, .2)); cam(st, s, 2.8); } };
  };
  BUILD.v_spin = () => {
    const B = bufferSet(.2, null), { st, tv, bar, sp, inc } = B;
    const bit = makeBit(); bit.scale.setScalar(.45); bit.position.set(1.2, 0, 1.4); bit.rotation.y = -.4; st.scene.add(bit);
    return { ...st, update(t, s) { const p = Math.min(.5, .3 + t * .4), b = Math.min(.5, .42 + t * .05), dry = p >= b - .001; bar.set(Math.min(p, b), b); tv.draw(dry ? 3 : s, 1, dry ? (x, w, h) => { x.fillStyle = 'rgba(0,0,0,.45)'; x.fillRect(0, 0, w, h); } : null);
      sp.visible = dry; sp.rotation.z = -s * 6; inc.forEach((c, i) => { const u = frac(s * .12 + i / 3); c.position.set(lerp(1.8, .2, u), lerp(1.2, 2.05, u), .5); c.scale.setScalar(Math.sin(u * Math.PI) * .6); });
      bit.pose({ s, sad: dry ? 1 : 0, lookY: -.4 }); cam(st, s, 2.6); } };
  };
  function speedo() { const g = new THREE.Group(); g.add(M(new THREE.CylinderGeometry(1.0, 1.0, .2, 48, 1, false, -Math.PI / 2, Math.PI), plastic(0xffffff), { rot: [-Math.PI / 2, 0, 0] }));
    const t = ctex(400, 200, (x, w, h) => { [['#ff5a5a', 0, .33], ['#ffc44d', .33, .66], ['#5ce06a', .66, 1]].forEach(([c, a, b]) => { x.strokeStyle = c; x.lineWidth = 30; x.beginPath(); x.arc(w / 2, h, h * .8, Math.PI + a * Math.PI, Math.PI + b * Math.PI); x.stroke(); }); });
    g.add(M(new THREE.PlaneGeometry(1.9, .95), new THREE.MeshBasicMaterial({ map: t.tex, transparent: true, toneMapped: false }), { pos: [0, .48, .11], shadow: false }));
    const needle = M(RB(.05, .85, .04, .02), plastic(0x1d2442), {}); needle.geometry.translate(0, .42, 0); needle.position.set(0, 0, .14); g.add(needle); g.userData.needle = needle; return g; }
  BUILD.v_measure = () => {
    const st = stage(night), sp = speedo(); sp.position.set(0, 2.4, 0); st.scene.add(sp);
    const mb = sign(1.8, .46, () => {}, { color: 0xffffff }); mb.position.set(0, 4.3, .3); st.scene.add(mb);
    const inc = [0, 1, 2, 3].map(i => { const c = chunk(i, 1, .4); st.scene.add(c); return c; });
    return { ...st, update(t, s) { const v = .5 + Math.sin(s * 1.3) * .35 + Math.sin(s * 3.1) * .1; sp.userData.needle.rotation.z = Math.PI / 2 - clamp(v) * Math.PI;
      mb.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, (clamp(v) * 50).toFixed(1) + ' Mb/s', w / 2, h / 2 + 4, h * .55, '#0a8fb5', 900, 'center', MONO); }); mb.scale.setScalar(popIn(t, .1));
      inc.forEach((c, i) => { const u = frac(s * (.3 + clamp(v) * .5) + i / 4); c.position.set(lerp(-1.8, 1.8, u), 1.1 + Math.sin(u * 6) * .1, .5); c.scale.setScalar(Math.sin(u * Math.PI) * .7); }); cam(st, s, 2.6); } };
  };
  BUILD.v_switch = () => {
    const st = stage(soft), sp = speedo(); sp.scale.setScalar(.7); sp.position.set(-.9, 4.0, 0); st.scene.add(sp);
    const tv = screen(2.4, 1.35); tv.position.set(0, 2.2, 0); st.scene.add(tv); const ql = sign(1.1, .4, () => {}, { color: 0xffffff }); ql.position.set(1.05, 4.15, .3); st.scene.add(ql);
    return { ...st, update(t, s) { const fast = t < .5, v = fast ? .9 : .2, q = fast ? 1 : 8; sp.userData.needle.rotation.z = Math.PI / 2 - v * Math.PI;
      tv.draw(s, q); ql.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, fast ? '1080p' : '360p', w / 2, h / 2 + 4, h * .55, fast ? '#2ca84a' : '#c46a00', 900, 'center', MONO); }); ql.scale.setScalar(popIn(t, .05)); cam(st, s, 2.8); } };
  };
  BUILD.v_start = () => {
    const st = stage(warm), tv = screen(2.6, 1.46); tv.position.set(0, 2.7, 0); st.scene.add(tv);
    const snap = textSign(1.2, .4, 'SNAP!', { color: C.amber, fg: '#3a2400', size: 70 }); snap.position.set(0, 4.3, .4); st.scene.add(snap);
    return { ...st, update(t, s) { const q = t < .45 ? 10 : t < .55 ? 4 : 1; tv.draw(s, q); snap.scale.setScalar(popIn(t, .55)); snap.rotation.z = Math.sin(s * 8) * .08; tv.scale.setScalar(t > .55 && t < .6 ? 1.05 : 1); cam(st, s, 2.7); } };
  };
  BUILD.v_squeeze = () => {
    const st = stage(night), f1 = screen(1.6, .9), f2 = screen(1.6, .9); f1.position.set(-.5, 3.7, -.2); f2.position.set(.5, 2.6, .2); st.scene.add(f1, f2);
    const diff = screen(1.6, .9); diff.position.set(0, 1.3, .5); st.scene.add(diff);
    const lb = textSign(1.9, .4, 'ONLY THE CHANGES', { color: C.amber, fg: '#3a2400', size: 54 }); lb.position.set(0, 4.65, .4); st.scene.add(lb);
    return { ...st, update(t, s) { f1.draw(2, 1); f2.draw(2.15, 1); diff.draw(2.15, 1, (x, w, h) => { const d = x.getImageData(0, 0, w, h); x.fillStyle = '#10142a'; x.fillRect(0, 0, w, h); const bx = w * (.15 + frac(2.15 * .25) * .7), by = h * (.6 - Math.abs(Math.sin(2.15 * 3)) * .35); x.fillStyle = '#ff4f6a'; x.beginPath(); x.arc(bx, by, w * .07, 0, 7); x.fill(); x.strokeStyle = '#ffe14d'; x.lineWidth = 4; x.strokeRect(bx - w * .12, by - w * .12, w * .24, w * .24); });
      diff.scale.setScalar(popIn(t, .4)); lb.scale.setScalar(popIn(t, .5)); f1.rotation.y = Math.sin(s) * .1; f2.rotation.y = -Math.sin(s) * .1; cam(st, s, 2.7); } };
  };
  BUILD.v_together = () => {
    const st = stage(soft), tv = screen(2.4, 1.35); tv.position.set(0, 3.2, 0); st.scene.add(tv);
    const belt = M(RB(3.6, .12, .8, .05), plastic(0x2a3046), { pos: [0, 1.4, .3] }); st.scene.add(belt);
    const cs = [0, 1, 2, 3, 4, 5].map(i => { const c = chunk(i, 1, .55); st.scene.add(c); return c; });
    return { ...st, update(t, s) { tv.draw(s, 1); cs.forEach((c, i) => { const u = frac(s * .25 + i / 6); c.position.set(lerp(-1.9, 1.9, u), 1.75, .3); c.rotation.y = .3; c.scale.setScalar(u > .85 ? (1 - u) / .15 : u < .1 ? u / .1 : 1); }); cam(st, s, 2.7); } };
  };
}
