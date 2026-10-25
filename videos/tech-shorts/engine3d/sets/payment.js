// Sets for Tech Shorts episode 11: How Tap to Pay Actually Works (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { waves, screenFace, makePhone } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, night = { top: '#141c3d', bottom: '#3b2f6b', floor: 0x3a2f68, hemi: .9 }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };
  const FIELD = 0x5ff3ff;

  // ---------- props ----------
  function makeCard(col = 0x6b4fd8, o = {}) {
    const g = new THREE.Group(), W = 2.0, H = 1.26;
    g.add(M(RB(W, H, .05, .08), plastic(col, { roughness: .25 }), {}));
    const face = ctex(512, 322, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#8b6cff'); gr.addColorStop(1, '#ff6fb1'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(255,255,255,.9)'; x.font = `700 34px ${MONO}`; x.fillText(o.number ?? '4821  ••••  ••••  0093', 36, 240); x.strokeStyle = '#fff'; x.lineWidth = 6; [0, 1, 2].forEach(i => { x.beginPath(); x.arc(440, 70, 16 + i * 14, -.8, .8); x.stroke(); }); });
    g.add(M(new THREE.PlaneGeometry(W * .97, H * .95), new THREE.MeshBasicMaterial({ map: face.tex, transparent: true, toneMapped: false }), { pos: [0, 0, .028], shadow: false }));
    const chip = M(RB(.32, .26, .03, .04), metal(0xffc44d, { roughness: .2 }), { pos: [-.55, .1, .04] }); g.add(chip);
    const loopPts = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2; loopPts.push(V(Math.cos(a) * .88 * Math.min(1, 1.6 * Math.abs(Math.cos(a)) + .4), Math.sin(a) * .52 * Math.min(1, 1.6 * Math.abs(Math.sin(a)) + .4), .035)); }
    const curve = new THREE.CatmullRomCurve3(loopPts, true), loop = M(new THREE.TubeGeometry(curve, 160, .012, 6, true), glowM(0xffd36e, .3), { shadow: false }); g.add(loop);
    const dots = []; for (let i = 0; i < 10; i++) { const d = G(M(SPH(.03, 8, 6), glowM(0xffe14d, 5), { shadow: false }), sprite(0xffe14d, .2, .9)); d.visible = false; g.add(d); dots.push(d); }
    g.userData = { chip, loop, curve, dots }; g.flow = (s, on) => { loop.material.emissiveIntensity = .3 + on * 2.5; dots.forEach((d, i) => { d.visible = on > .1; d.position.copy(curve.getPoint(frac(s * .6 + i / 10))); }); };
    return g;
  }
  function makeReader() {
    const g = new THREE.Group(); g.add(M(RB(1.6, 2.2, .5, .22), plastic(0x2a3046), {}));
    const scr = ctex(400, 320); g.add(M(new THREE.PlaneGeometry(1.25, 1.0), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }), { pos: [0, .35, .26], shadow: false }));
    const pad = M(new THREE.CircleGeometry(.32, 32), glowM(FIELD, .6), { pos: [0, -.6, .26], shadow: false }); g.add(pad);
    g.userData = { scr, pad }; g.show = (txt, col = '#5ff3ff', sub) => scr.redraw((x, w, h) => { x.fillStyle = '#10142a'; x.fillRect(0, 0, w, h); label(x, txt, w / 2, h * (sub ? .4 : .5), 64, col, 900); if (sub) label(x, sub, w / 2, h * .72, 40, '#9aa3bd', 700); });
    g.show('£4.50'); return g;
  }
  // magnetic field loops around the reader's pad
  function field() { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const r = M(new THREE.TorusGeometry(.5 + i * .35, .02, 6, 64), new THREE.MeshBasicMaterial({ color: FIELD, transparent: true, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }), { shadow: false }); g.add(r); }
    g.update = (s, on = 1) => g.children.forEach((r, i) => { const u = frac(s * 1.3 + i / 4); r.scale.setScalar(.4 + u * 1.4); r.material.opacity = (1 - u) * on; }); return g; }
  const cam = (st, s, y = 2.6, z = 8.8) => aim(st.cam, [Math.sin(s * .5) * .8, y + .25, z], [0, y, 0]);

  // ---------- sets ----------
  BUILD.tp_hook = () => {
    const st = stage(warm), rd = makeReader(); rd.position.set(0, 1.6, 0); st.scene.add(rd); const fl = field(); fl.position.set(0, 1.0, .3); st.scene.add(fl);
    const card = makeCard(); st.scene.add(card); const nb = textSign(1.6, .42, 'NO BATTERY', { color: C.red, fg: '#fff', size: 60 }); nb.position.set(0, 4.7, .3); st.scene.add(nb);
    return { ...st, update(t, s) { const k = ease(seg(t, .35, .6)); card.position.set(lerp(1.3, 0, k), lerp(4.0, 1.25, k), lerp(.6, .55, k)); card.rotation.set(lerp(.3, -.1, k), lerp(-.6, 0, k), Math.sin(s * 2) * .05 * (1 - k));
      fl.update(s, 1); card.flow(s, k > .95 ? 1 : 0); rd.show(k > .95 ? '✓' : '£4.50', k > .95 ? '#5ce06a' : '#5ff3ff'); nb.scale.setScalar(popIn(t, .1) * (1 - seg(t, .8, .9))); cam(st, s, 2.5); } };
  };
  BUILD.tp_title = (p) => {
    const st = stage({ top: '#d6c8ff', bottom: '#ffc6e2', floor: 0xffb8da }); st.scene.add(pedestal(1.3, 0xffffff, C.violet));
    const card = makeCard(); card.position.set(0, 1.7, 0); st.scene.add(card); const fl = field(); fl.position.set(0, 1.7, -.1); st.scene.add(fl);
    const s1 = textSign(3.4, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 92 }), s2 = textSign(3.3, .72, p.bottom, { color: C.violet, fg: '#ffffff', size: 96 }); s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { card.rotation.y = s * 1.3; card.position.y = 1.7 + Math.sin(s * 3) * .1; card.flow(s, .7); fl.update(s, .7);
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.4], [0, 2.5, 0]); } };
  };
  BUILD.tp_field = () => {
    const st = stage(night), coil = new THREE.Group(); coil.position.set(0, 2.4, 0); st.scene.add(coil);
    for (let i = 0; i < 6; i++) coil.add(M(new THREE.TorusGeometry(.7, .045, 10, 48), metal(0xd98a3d), { pos: [0, 0, -.2 + i * .08] }));
    const fl = field(); fl.position.set(0, 2.4, .2); st.scene.add(fl);
    const lines = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, m = M(new THREE.TorusGeometry(1.2, .015, 6, 64), glowM(FIELD, 1.5), { shadow: false }); m.position.set(0, 2.4, 0); m.rotation.set(Math.PI / 2, a, 0); m.scale.set(1, 1, 1.6); st.scene.add(m); lines.push(m); }
    const cnt = sign(2.6, .5, () => {}, { color: 0xffffff }); cnt.position.set(0, 4.6, .3); st.scene.add(cnt);
    return { ...st, update(t, s) { fl.update(s); lines.forEach((m, i) => { m.rotation.y = i / 6 * Math.PI * 2 + s * .5; m.material.emissiveIntensity = 1.2 + Math.sin(s * 12 + i) * .6; });
      cnt.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, '13,560,000 flips / s', w / 2, h / 2 + 4, h * .46, '#0a8fb5', 900, 'center', MONO); }); cnt.scale.setScalar(popIn(t, .25));
      coil.rotation.y = Math.sin(s * .6) * .4; cam(st, s, 2.6); } };
  };
  BUILD.tp_coil = () => {
    const st = stage(night), card = makeCard(); card.scale.setScalar(1.6); card.position.set(0, 2.6, 0); st.scene.add(card); const fl = field(); fl.position.set(0, 2.6, -.6); fl.scale.setScalar(1.4); st.scene.add(fl);
    const lb = textSign(1.9, .42, 'HIDDEN LOOP', { color: 0xffd36e, fg: '#3a2400', size: 60 }); lb.position.set(0, 4.5, .4); st.scene.add(lb);
    return { ...st, update(t, s) { card.flow(s, seg(t, .35, .5)); fl.update(s, seg(t, .3, .4)); card.rotation.set(-.15, Math.sin(s * .6) * .25, 0); lb.scale.setScalar(popIn(t, .1)); cam(st, s, 2.7, 8.2); } };
  };
  BUILD.tp_wake = () => {
    const st = stage(warm), rd = makeReader(); rd.position.set(0, 1.7, -.3); st.scene.add(rd); const fl = field(); fl.position.set(0, 1.1, 0); st.scene.add(fl);
    const card = makeCard(); st.scene.add(card); const chipFace = screenFace(.3, .22, '#ffc44d', '#3a2400', 'smile'); card.add(chipFace); chipFace.position.set(-.55, .1, .06);
    const cm = textSign(1.3, .42, '~4 CM', { color: FIELD, fg: '#0b3a55', size: 64, font: MONO }); cm.position.set(.75, 3.5, .4); st.scene.add(cm);
    const zz = textSign(.32, .32, 'z', { color: 0x9b7bff, fg: '#fff', size: 80, depth: .05 }); st.scene.add(zz);
    return { ...st, update(t, s) { const d = t < .5 ? lerp(2.4, 0, ease(seg(t, .1, .45))) : 0; card.position.set(0, 1.1, .6 + d); card.rotation.x = -1.2;
      const awake = d < .3; card.flow(s, awake ? 1 : 0); chipFace.visible = awake; chipFace.scale.setScalar(awake ? 1 + Math.sin(s * 10) * .05 : 0); zz.visible = !awake; zz.position.set(-.5, 1.6 + frac(s) * .5, 1.0 + d);
      fl.update(s); rd.show(awake ? 'HELLO' : '£4.50', awake ? '#5ce06a' : '#5ff3ff'); cm.scale.setScalar(popIn(t, .55)); aim(st.cam, [Math.sin(s * .5) * 1.0, 3.4, 7.4], [0, 1.9, .3]); } };
  };
  BUILD.tp_talk = () => {
    const st = stage(night), card = makeCard(); card.position.set(0, 1.6, .3); card.rotation.x = -.3; st.scene.add(card); const rd = makeReader(); rd.position.set(0, 3.7, -.6); rd.scale.setScalar(.8); st.scene.add(rd);
    const bits = []; const r = rng(3); for (let i = 0; i < 12; i++) { const b = textSign(.24, .24, r() < .5 ? '0' : '1', { color: 0xffe14d, fg: '#3a2400', size: 70, font: MONO, depth: .05 }); st.scene.add(b); bits.push([b, r()]); }
    const meter = sign(1.8, .44, () => {}, { color: 0xffffff }); meter.position.set(0, 4.65, .3); st.scene.add(meter);
    return { ...st, update(t, s) { const fl = Math.sin(s * 22) > 0; card.flow(s, fl ? 1 : .35); bits.forEach(([b, ph], i) => { const u = frac(s * .7 + ph); b.position.set(Math.sin(ph * 9) * .5, lerp(1.9, 3.3, u), lerp(.3, -.3, u)); b.scale.setScalar(Math.sin(u * Math.PI)); });
      meter.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); for (let i = 0; i < 18; i++) { x.fillStyle = '#6b4fd8'; const v = Math.sin(s * 22 + i * 1.7) > 0 ? .8 : .35; x.fillRect(20 + i * 24, h * (1 - v) - 6, 16, h * v); } }); meter.scale.setScalar(popIn(t, .3));
      rd.show('READING', '#ffe14d'); cam(st, s, 2.6); } };
  };
  BUILD.tp_nfc = () => {
    const st = stage(soft), card = makeCard(), ph = makePhone(0xff6fb1); card.position.set(-.7, 2.2, 0); ph.position.set(.9, 2.4, 0); ph.scale.setScalar(.8); st.scene.add(card, ph);
    const lb = textSign(1.4, .5, 'NFC', { color: FIELD, fg: '#0b3a55', size: 96 }); lb.position.set(0, 4.3, .3); st.scene.add(lb);
    const sub = textSign(2.6, .38, 'near field communication', { color: 0xffffff, fg: '#1d2442', size: 50 }); sub.position.set(0, 3.7, .4); st.scene.add(sub);
    const fl = field(); fl.position.set(.1, 2.3, .2); fl.scale.setScalar(.6); st.scene.add(fl);
    return { ...st, update(t, s) { card.rotation.y = Math.sin(s * 1.2) * .4; card.flow(s, .8); ph.rotation.z = Math.sin(s * 2) * .05; fl.update(s); lb.scale.setScalar(popIn(t, .05)); sub.scale.setScalar(popIn(t, .2)); cam(st, s, 2.7); } };
  };
  BUILD.tp_code = () => {
    const st = stage(night), card = makeCard(); card.scale.setScalar(1.3); card.position.set(0, 1.7, 0); st.scene.add(card);
    const code = sign(2.8, .62, () => {}, { color: 0x1d2442 }); code.position.set(0, 3.8, .3); st.scene.add(code);
    const lb = textSign(2.0, .42, 'ONE-TIME CODE', { color: 0x5ce06a, fg: '#14320a', size: 58 }); lb.position.set(0, 4.65, .3); st.scene.add(lb);
    return { ...st, update(t, s) { const spin = t < .55; const r = rng(Math.floor(spin ? s * 14 : 99)); let str = ''; for (let i = 0; i < 12; i++) str += '0123456789ABCDEF'[Math.floor(r() * 16)];
      code.userData.redraw((x, w, h) => { x.fillStyle = '#1d2442'; x.fillRect(0, 0, w, h); label(x, str.replace(/(.{4})/g, '$1 ').trim(), w / 2, h / 2 + 4, h * .5, spin ? '#ffe14d' : '#5ce06a', 800, 'center', MONO); }); code.scale.setScalar(popIn(t, .15));
      card.flow(s, 1); card.rotation.y = Math.sin(s * .8) * .25; lb.scale.setScalar(popIn(t, .5)); cam(st, s, 2.7); } };
  };
  BUILD.tp_reuse = () => {
    const st = stage(soft), thief = makeBit({ shell: 0x5a6070, accent: 0x34394a, eye: 0xff5a5a }); thief.scale.setScalar(.6); thief.position.set(-.75, 0, .6); st.scene.add(thief);
    const mask = M(RB(1.6, .35, .2, .1), plastic(0x141a2c), {}); mask.position.set(0, .18, .52); thief.userData.body.add(mask);
    const rd = makeReader(); rd.scale.setScalar(.8); rd.position.set(.9, 1.0, -.2); st.scene.add(rd);
    const slip = textSign(1.6, .36, '9F3A 01C7 77B2', { color: 0xffffff, fg: '#1d2442', size: 48, font: MONO }); st.scene.add(slip);
    const no = textSign(.55, .55, '✕', { color: C.red, fg: '#fff', size: 120 }); no.position.set(.9, 3.3, .4); st.scene.add(no);
    return { ...st, update(t, s) { const k = ease(seg(t, .1, .45)); slip.position.set(lerp(-.75, .9, k), lerp(2.2, 1.8, k) + Math.sin(k * Math.PI) * .6, .6); slip.rotation.z = Math.sin(s * 3) * .1;
      const rej = t > .5; rd.show(rej ? 'DECLINED' : '£4.50', rej ? '#ff5a5a' : '#5ff3ff'); no.scale.setScalar(popIn(t, .52)); thief.pose({ s, reachR: .7, sad: rej ? 1 : 0, lookY: .4 }); cam(st, s, 2.3); } };
  };
  BUILD.tp_token = () => {
    const st = stage(warm), ph = new THREE.Group(); ph.position.set(0, 2.2, 0); st.scene.add(ph); ph.add(M(RB(1.7, 3.1, .2, .26), plastic(0xff6fb1)));
    const scr = ctex(400, 740); ph.add(M(new THREE.PlaneGeometry(1.5, 2.8), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }), { pos: [0, 0, .105], shadow: false }));
    const real = textSign(2.4, .4, 'REAL: 4821 5560 1234 0093', { color: 0xffffff, fg: '#9aa3bd', size: 40, font: MONO }), tok = textSign(2.4, .4, 'TOKEN: 5310 8877 2045 6612', { color: 0x5ce06a, fg: '#14320a', size: 40, font: MONO });
    real.position.set(0, 4.65, .4); tok.position.set(0, 4.05, .9); st.scene.add(real, tok);
    return { ...st, update(t, s) { const k = ease(seg(t, .3, .55));
      scr.redraw((x, w, h) => { x.fillStyle = '#141a2c'; x.fillRect(0, 0, w, h); const g = x.createLinearGradient(40, 200, 360, 420); g.addColorStop(0, '#8b6cff'); g.addColorStop(1, '#ff6fb1'); x.fillStyle = g; rrect(x, 40, 220, 320, 200, 20); x.fill(); label(x, k > .5 ? '•••• 6612' : '•••• 0093', w / 2, 370, 40, '#fff', 800, 'center', MONO); label(x, 'Wallet', w / 2, 150, 44, '#fff', 900); });
      real.scale.setScalar(popIn(t, .05)); real.rotation.z = k > .5 ? .12 : 0; tok.scale.setScalar(popIn(t, .5)); ph.rotation.y = Math.sin(s * .8) * .25; cam(st, s, 2.6); } };
  };
  BUILD.tp_unlock = () => {
    const st = stage(soft), bit = makeBit(); bit.scale.setScalar(.6); bit.position.set(-.9, 0, .8); st.scene.add(bit);
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(.9); ph.position.set(.7, 2.0, .3); ph.rotation.y = -.4; st.scene.add(ph);
    const scan = M(new THREE.TorusGeometry(.5, .03, 8, 48), glowM(FIELD, 3), { shadow: false }); scan.position.set(-.9, 1.25, 1.2); st.scene.add(scan);
    const icons = ['FACE', 'FINGERPRINT', 'PASSCODE'].map((l, i) => { const g = textSign(1.5, .34, l, { color: [C.violet, C.pink, C.amber][i], fg: '#fff', size: 46 }); g.position.set(.8, 4.4 - i * .45, .4); st.scene.add(g); return g; });
    const ok = textSign(.5, .5, '✓', { color: 0x3cc85a, fg: '#fff', size: 110 }); ok.position.set(.7, 2.0, .9); st.scene.add(ok);
    return { ...st, update(t, s) { scan.scale.setScalar(1 + Math.sin(s * 6) * .15); scan.visible = t < .6; icons.forEach((g, i) => g.scale.setScalar(popIn(t, .1 + i * .1))); ok.scale.setScalar(popIn(t, .6)); bit.pose({ s, happy: t > .6 ? 1 : 0, lookY: .4 }); cam(st, s, 2.5); } };
  };
  BUILD.tp_watch = () => {
    const st = stage(warm), watch = G(M(RB(1.0, 1.2, .35, .3), plastic(0x2a3046)), M(RB(.85, 1.0, .05, .22), glowM(0x5ff3ff, .7), { pos: [0, 0, .18], shadow: false }), M(RB(.7, 1.0, .12, .1), plastic(C.pink), { pos: [0, 1.05, -.05] }), M(RB(.7, 1.0, .12, .1), plastic(C.pink), { pos: [0, -1.05, -.05] }));
    watch.position.set(-.8, 2.6, 0); st.scene.add(watch);
    const ring = M(new THREE.TorusGeometry(.45, .14, 20, 48), metal(0xd7dbe6), {}); ring.position.set(.9, 2.7, 0); st.scene.add(ring);
    const chipA = [watch, ring].map(o => { const c = G(M(RB(.18, .14, .04, .03), metal(0xffc44d)), sprite(0xffe14d, .5, .8)); c.position.copy(o.position).add(V(0, 0, .35)); st.scene.add(c); return c; });
    const fl = field(); fl.position.set(0, 2.6, -.4); st.scene.add(fl);
    return { ...st, update(t, s) { watch.rotation.y = Math.sin(s) * .4; ring.rotation.set(s * .8, s, 0); fl.update(s, .7); chipA.forEach((c, i) => c.scale.setScalar(popIn(t, .3 + i * .15) * (1 + Math.sin(s * 8) * .1))); cam(st, s, 2.6); } };
  };
  BUILD.tp_bank = () => {
    const st = stage({ top: '#bfe4ff', bottom: '#d8f2c2', floor: 0x9dd67f }), rd = makeReader(); rd.scale.setScalar(.6); rd.position.set(-1.0, 1.1, 1.0); st.scene.add(rd);
    const bank = G(M(RB(2.0, .25, 1.2, .05), plastic(0xffffff), { pos: [0, .12, 0] }), ...[-.75, -.25, .25, .75].map(x => M(new THREE.CylinderGeometry(.11, .13, 1.4, 20), plastic(0xffffff), { pos: [x, .95, .3] })), M(new THREE.ConeGeometry(1.3, .6, 4), plastic(0xffd36e), { pos: [0, 1.95, 0], rot: [0, Math.PI / 4, 0], scale: [1, 1, .55] }), M(RB(2.0, .2, 1.2, .05), plastic(0xffffff), { pos: [0, 1.7, 0] }));
    bank.position.set(.6, 2.8, -1.5); st.scene.add(bank);
    const net = []; for (let i = 0; i < 3; i++) { const n = M(SPH(.15, 16, 12), plastic(0x9b7bff), {}); n.position.set(lerp(-1.1, .5, (i + 1) / 4), 1.6 + i * .5, lerp(.8, -1.2, (i + 1) / 4)); st.scene.add(n); net.push(n); }
    const pts = [V(-1.3, 1.2, 1.0), ...net.map(n => n.position.clone()), V(.6, 3.0, -1.3)], cur = new THREE.CatmullRomCurve3(pts), line = M(new THREE.TubeGeometry(cur, 80, .025, 6), glowM(0x9b7bff, 1.8), { shadow: false }); st.scene.add(line);
    const pk = G(M(SPH(.09, 12, 8), glowM(0xffe14d, 5), { shadow: false }), sprite(0xffe14d, .6, .9)); st.scene.add(pk);
    const ans = textSign(.9, .44, 'YES', { color: 0x5ce06a, fg: '#14320a', size: 70 }); ans.position.set(.6, 4.6, -1.0); st.scene.add(ans);
    return { ...st, update(t, s) { const u = t < .6 ? ease(seg(t, .05, .55)) : 1 - ease(seg(t, .65, .95)); pk.position.copy(cur.getPoint(u)); ans.scale.setScalar(t > .58 && t < .95 ? popIn(t, .58) : 0); rd.show(t > .95 ? '✓' : '…', '#5ce06a');
      net.forEach((n, i) => n.scale.setScalar(1 + Math.sin(s * 6 + i) * .1)); aim(st.cam, [Math.sin(s * .4) * .8, 3.4, 8.4], [0, 2.3, -.3]); } };
  };
  BUILD.tp_pin = () => {
    const st = stage(warm), rd = makeReader(); rd.scale.setScalar(1.3); rd.position.set(0, 2.3, 0); st.scene.add(rd);
    const keys = []; for (let i = 0; i < 9; i++) { const k = textSign(.3, .3, String(i + 1), { color: 0xffffff, fg: '#1d2442', size: 70, depth: .08 }); k.position.set(-.38 + (i % 3) * .38, 1.55 - Math.floor(i / 3) * .36 + .3, .4); st.scene.add(k); keys.push(k); }
    const big = textSign(1.6, .44, '£120 → PIN', { color: C.amber, fg: '#3a2400', size: 60 }); big.position.set(0, 4.55, .4); st.scene.add(big);
    return { ...st, update(t, s) { const n = Math.min(4, Math.floor(seg(t, .3, .8) * 5)); rd.show(t < .3 ? '£120.00' : '•'.repeat(n) + '○'.repeat(4 - n), '#ffe14d', t < .3 ? 'ENTER PIN' : null);
      const pressed = [4, 0, 7, 2][Math.max(0, n - 1)]; keys.forEach((k, i) => k.position.z = .4 - (i === pressed && t > .3 && frac(s * 2) < .3 ? .05 : 0)); big.scale.setScalar(popIn(t, .1)); cam(st, s, 2.5); } };
  };
  BUILD.tp_beep = () => {
    const st = stage({ top: '#c9ffe0', bottom: '#fff0c4', floor: 0xffe9b5 }), rd = makeReader(); rd.scale.setScalar(1.2); rd.position.set(0, 2.0, 0); st.scene.add(rd);
    const card = makeCard(); st.scene.add(card); const beep = waves(0x5ce06a, 4, 2.6, 1.2, .05); beep.position.set(0, 2.4, .4); st.scene.add(beep);
    const bp = textSign(1.6, .55, 'BEEP!', { color: 0x5ce06a, fg: '#14320a', size: 96 }); bp.position.set(0, 4.5, .4); st.scene.add(bp);
    const conf = K.confetti(140, [0, 2.4, .5], 4, 3.4); st.scene.add(conf);
    return { ...st, update(t, s, d) { const k = ease(seg(t, .05, .3)); card.position.set(lerp(1.4, 0, k), lerp(3.6, 1.3, k), .7); card.rotation.set(-.3 * k, 0, 0); card.flow(s, k > .95 ? 1 : 0);
      const ok = t > .4; rd.show(ok ? '✓ APPROVED' : 'TAP CARD', ok ? '#5ce06a' : '#5ff3ff'); beep.update(s, ok ? 1 : 0); bp.scale.setScalar(popIn(t, .42)); bp.rotation.z = Math.sin(s * 8) * .06; conf.update(s - .42 * d); cam(st, s, 2.5); } };
  };
}
