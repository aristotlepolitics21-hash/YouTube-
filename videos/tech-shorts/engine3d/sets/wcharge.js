// Sets for Tech Shorts episode 16: How Wireless Charging Actually Works (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, bubble, sprite, stage, aim,
    hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { waves, makePhone } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, night = { top: '#141c3d', bottom: '#3b2f6b', floor: 0x3a2f68, hemi: .9 }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };
  const COPPER = 0xd9824a, FIELD = 0x35e0ff, FIELD2 = 0xff4fa3;
  const cam = (st, s, y = 1.8, up = 2.2, z = 8.2) => aim(st.cam, [Math.sin(s * .5) * .7, y + up, z], [0, y, 0]);

  // ---------- props ----------
  function makePad(lid = true) {
    const base = M(new THREE.CylinderGeometry(1.15, 1.22, .14, 64), plastic(0xf4f6fb), { pos: [0, .07, 0] });
    const ring = M(new THREE.TorusGeometry(1.12, .03, 8, 80), glowM(C.cyan, 1.2), { pos: [0, .15, 0], rot: [Math.PI / 2, 0, 0], shadow: false });
    const top = M(new THREE.CylinderGeometry(1.12, 1.15, .08, 64), plastic(0xffffff), { pos: [0, .18, 0] }); top.visible = lid;
    const g = G(base, ring, top); g.userData = { ring, top }; g.glow = (col, i) => { ring.material.emissive.setHex(col); ring.material.emissiveIntensity = i; }; return g;
  }
  // a flat spiral coil of copper wire (lies in the XZ plane); dots = glowing charge carriers that run along it
  function coil(R = .95, turns = 7, tube = .035, r0 = .2, dots = 14, dotCol = 0xfff1a8) {
    const pts = [], N = turns * 40; for (let i = 0; i <= N; i++) { const th = i / N * turns * Math.PI * 2, r = r0 + (R - r0) * i / N; pts.push(V(r * Math.cos(th), 0, r * Math.sin(th))); }
    const curve = new THREE.CatmullRomCurve3(pts), g = G(M(new THREE.TubeGeometry(curve, N * 2, tube, 6, false), metal(COPPER, { roughness: .3 }), {}));
    const ds = []; for (let i = 0; i < dots; i++) { const d = sprite(dotCol, .26); g.add(d); ds.push(d); }
    g.flow = (s, dir = 1, on = 1, sp = .12) => ds.forEach((d, i) => { const u = frac(dir * s * sp + i / dots); d.position.copy(curve.getPointAt(u)); d.position.y += .05; d.material.opacity = on; d.visible = on > .01; });
    g.flow(0, 1, 0); return g;
  }
  // magnetic field loops around a flat coil: ellipses that rise through the middle and fall outside
  function fieldLoops(h = 1.4, n = 3) {
    const g = new THREE.Group(), loops = [];
    for (let k = 0; k < 3; k++) { const pv = new THREE.Group(); pv.rotation.y = k * Math.PI / 3; g.add(pv);
      [-1, 1].forEach(side => { for (let i = 0; i < n; i++) { const d = .3 + i * .22, hh = h * (.7 + i * .25);
        const tor = new THREE.Mesh(new THREE.TorusGeometry(1, .022, 6, 72), new THREE.MeshBasicMaterial({ color: FIELD, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
        tor.scale.set(d, hh, 1); tor.position.x = side * d; const dot = sprite(FIELD, .22); pv.add(tor, dot); loops.push({ tor, dot, side, d, hh, ph: i * 1.3 + k * .7 }); } }); }
    g.update = (s, dir = 1, strength = 1, pulse = 1) => loops.forEach(L => { L.tor.material.opacity = strength * .6; L.tor.visible = strength > .01; L.tor.scale.set(L.d * pulse, L.hh * pulse, 1); L.tor.position.x = L.side * L.d * pulse;
      const phi = Math.PI - dir * frac(s * .5 + L.ph) * Math.PI * 2; L.dot.position.set(L.side * L.d * pulse * (1 + Math.cos(phi)), L.hh * pulse * Math.sin(phi), 0); L.dot.material.opacity = strength; L.dot.visible = strength > .01; });
    g.color = c => loops.forEach(L => { L.tor.material.color.setHex(c); L.dot.material.color.setHex(c); });
    g.update(0, 1, 0); return g;
  }
  const flatPhone = (col = 0xff6fb1) => { const p = makePhone(col); p.rotation.x = -Math.PI / 2; return p; };
  function battery() { const g = new THREE.Group();
    g.add(M(RB(.9, 1.5, .5, .14), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, roughness: .1 }), {}), M(RB(.36, .12, .3, .04), plastic(0xc9cdd8), { pos: [0, .8, 0] }));
    const fill = M(RB(.72, 1.3, .34, .08), glowM(C.lime, .9), { shadow: false }); g.add(fill);
    g.set = p => { p = clamp(p); fill.scale.y = Math.max(.02, p); fill.position.y = -.65 + .65 * p; fill.material.emissive.setHex(p < .25 ? C.red : p < .55 ? C.amber : C.lime); }; g.set(.3); return g; }
  function chip() { const g = textSign(1.0, 1.0, 'CHIP', { color: 0x23293f, bg: '#23293f', fg: '#b6ff5c', size: 66, font: MONO });
    for (let i = 0; i < 4; i++) [-1, 1].forEach(sd => { g.add(M(RB(.08, .2, .06, .02), metal(0xd7dbe6), { pos: [-.33 + i * .22, sd * .58, 0] })); g.add(M(RB(.2, .08, .06, .02), metal(0xd7dbe6), { pos: [sd * .58, -.33 + i * .22, 0] })); }); return g; }
  // a little live chart: kind 'ac' wiggles back and forth, 'dc' is one steady line
  function graph(w, h, kind, col) { const g = sign(w, h, () => {}, { color: 0xffffff });
    g.draw = s => g.userData.redraw((x, cw, ch) => { x.fillStyle = '#fff'; x.fillRect(0, 0, cw, ch); x.strokeStyle = 'rgba(29,36,66,.18)'; x.lineWidth = 3; x.beginPath(); x.moveTo(10, ch / 2); x.lineTo(cw - 10, ch / 2); x.stroke();
      x.strokeStyle = col; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); for (let px = 20; px <= cw - 20; px += 4) { const y = kind === 'ac' ? ch / 2 - Math.sin(px / cw * Math.PI * 6 - s * 8) * ch * .3 : ch * .28; px === 20 ? x.moveTo(px, y) : x.lineTo(px, y); } x.stroke();
      label(x, kind === 'ac' ? '⇄ BACK & FORTH' : '→ ONE WAY', cw / 2, ch * .84, ch * .14, '#1d2442', 900); }); g.draw(0); return g; }
  // chat bubble that pops in during [a, b]
  function chat(txt, col, w = 1.7, tail = 1) { const b = bubble(w, .62, (x, cw, ch) => label(x, txt, cw / 2, ch / 2 + 6, ch * .42, col, 900), tail); b.show = (t, a, z) => { b.scale.setScalar(t > a && t < z ? Math.min(1, pop((t - a) * 6)) : 0); }; return b; }
  // the shared "rig": pedestal, open pad with its coil, field, and optionally a phone with its coil above
  function rig(st, o = {}) {
    const ped = pedestal(1.35, 0xffffff, C.cyan); st.scene.add(ped);
    const pad = makePad(false); pad.position.y = .4; st.scene.add(pad);
    const pc = coil(.95, 7); pc.position.y = .62; st.scene.add(pc);
    const fl = fieldLoops(o.h ?? 1.4); fl.position.y = .62; st.scene.add(fl);
    const r = { pad, pc, fl };
    if (o.phone) { const ph = new THREE.Group(), p = flatPhone(), cc = coil(.5, 6, .028, .12, 10, 0x9df7ff); cc.position.y = -.12; ph.add(p, cc); ph.position.y = o.phoneY ?? 2.3; st.scene.add(ph); Object.assign(r, { ph, phone: p, cc }); }
    return r;
  }

  // ---------- sets ----------
  BUILD.c_hook = () => {
    const st = stage(night), ped = pedestal(1.35, 0xffffff, C.violet), pad = makePad(); pad.position.y = .4; st.scene.add(ped, pad);
    const ph = flatPhone(); st.scene.add(ph);
    const pct = sign(1.7, .5, () => {}, { color: 0xffffff }); pct.position.set(0, 3.0, .3); st.scene.add(pct);
    const q = textSign(1.9, .5, 'NO PLUG?!', { color: C.amber, fg: '#3a2400', size: 66 }); q.position.set(0, 4.3, .2); st.scene.add(q);
    const sp = sparkles(14, [0, .9, 0], 1.3, 0xb6ff5c, 5); st.scene.add(sp);
    return { ...st, update(t, s) { const land = seg(t, .05, .25), on = t > .25; ph.position.set(0, lerp(2.6, .76, ease(land)), 0); ph.rotation.z = (1 - land) * .4;
      const h = hop(s - 1.6, .45, .25); ph.position.y += h.y; pad.glow(on ? C.lime : C.cyan, on ? 2.2 + Math.sin(s * 5) * .6 : .6); sp.visible = on; sp.update(s);
      const p = 42 + Math.floor(seg(t, .25, 1) * 18); pct.userData.redraw((x, w, hh) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, hh); label(x, (on ? '⚡ ' : '') + p + '%', w / 2, hh / 2 + 4, hh * .58, on ? '#2ca84a' : '#1d2442', 900, 'center', MONO); });
      pct.scale.setScalar(popIn(t, .22)); q.scale.setScalar(popIn(t, .5)); q.rotation.z = Math.sin(s * 4) * .05; cam(st, s, 1.6, 2.4, 8.4); } };
  };
  BUILD.c_title = (p) => {
    const st = stage({ top: '#c9f0ff', bottom: '#d6c8ff', floor: 0xcdb8ff }); st.scene.add(pedestal(1.35, 0xffffff, C.cyan));
    const pad = makePad(); pad.position.y = .4; st.scene.add(pad); const ph = flatPhone(); ph.position.y = .78; st.scene.add(ph);
    const w = waves(C.cyan, 4, 1.6, .8); w.rotation.x = Math.PI / 2; w.position.y = .66; st.scene.add(w);
    const s1 = textSign(3.6, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 88 }), s2 = textSign(3.3, .72, p.bottom, { color: C.cyan, fg: '#0c2a3a', size: 96 }); s1.position.set(0, 4.3, 0); s2.position.set(0, 3.45, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { w.update(s, 1, .9); pad.glow(C.lime, 2 + Math.sin(s * 4) * .5); ph.position.y = .78 + Math.abs(Math.sin(s * 3)) * .06;
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 4.4, 8.6], [0, 2.2, 0]); } };
  };
  BUILD.c_coil = () => {
    const st = stage(soft), ped = pedestal(1.35, 0xffffff, C.cyan), pad = makePad(true); pad.position.y = .4; st.scene.add(ped, pad);
    const cl = coil(.95, 7); cl.position.y = .62; st.scene.add(cl);
    const lb = textSign(2.2, .48, 'COPPER COIL', { color: COPPER, fg: '#fff', size: 62 }); lb.position.set(0, 3.0, .3); st.scene.add(lb);
    return { ...st, update(t, s) { const o = ease(seg(t, .12, .4)), top = pad.userData.top; top.position.set(0, .18 + o * 6, 0); top.rotation.set(o * .5, 0, 0);
      cl.rotation.y = s * .25; lb.scale.setScalar(popIn(t, .42)); cam(st, s, 1.2, 2.9, 7.6); } };
  };
  BUILD.c_phonecoil = () => {
    const st = stage(soft), r = rig(st, { phone: true, phoneY: 2.6 }); r.fl.visible = false;
    const l1 = textSign(1.9, .42, 'PHONE COIL', { color: C.pink, fg: '#fff', size: 54 }), l2 = textSign(1.7, .42, 'PAD COIL', { color: COPPER, fg: '#fff', size: 54 });
    l1.position.set(0, 4.15, .2); l2.position.set(0, 1.55, 1.1); st.scene.add(l1, l2);
    return { ...st, update(t, s) { const ex = ease(seg(t, .1, .4)); r.phone.position.y = ex * .55; r.phone.rotation.z = ex * .25 * Math.sin(s); r.ph.rotation.y = Math.sin(s * .6) * .3; r.ph.position.y = 2.4 + Math.sin(s * 2) * .05;
      l1.scale.setScalar(popIn(t, .4)); l2.scale.setScalar(popIn(t, .2)); cam(st, s, 2.0, 2.0, 8.4); } };
  };
  BUILD.c_ping = () => {
    const st = stage(night), ped = pedestal(1.35, 0xffffff, C.violet), pad = makePad(); pad.position.y = .4; st.scene.add(ped, pad);
    const w = waves(C.amber, 3, 1.4, .9, .03); w.rotation.x = Math.PI / 2; w.position.y = .64; st.scene.add(w); const ph = flatPhone(0x7b6cff); st.scene.add(ph);
    const b1 = chat('ANYONE THERE?', '#c46a00', 2.3, -1), b2 = chat('ME!', '#2ca84a', 1.1, 1), b3 = textSign(1.6, .46, 'POWER ON', { color: C.lime, fg: '#14320a', size: 58 });
    b1.position.set(-.4, 2.2, .8); b2.position.set(.7, 2.6, .8); b3.position.set(0, 3.4, .2); st.scene.add(b1, b2, b3);
    return { ...st, update(t, s) { const ping = t < .55, d = ease(seg(t, .4, .58)); w.update(s, ping ? (frac(s * .9) < .5 ? 1 : .2) : 0, 1); ph.position.set(0, lerp(3.4, .76, d), 0); ph.visible = t > .38;
      pad.glow(t > .62 ? C.lime : C.amber, t > .62 ? 2.4 : .5 + (frac(s * .9) < .15 ? 2 : 0)); b1.show(t, .05, .42); b2.show(t, .6, 1.1); b3.scale.setScalar(popIn(t, .66)); cam(st, s, 1.5, 2.4, 8.2); } };
  };
  BUILD.c_field = () => {
    const st = stage(night), r = rig(st);
    const lb = textSign(2.5, .46, 'CURRENT → MAGNETISM', { color: FIELD, fg: '#0c2a3a', size: 52 }); lb.position.set(0, 3.5, .3); st.scene.add(lb);
    return { ...st, update(t, s) { r.pc.flow(s, 1, popIn(t, .08)); r.fl.update(s, 1, ease(seg(t, .35, .6))); r.pad.glow(C.cyan, 1.6); lb.scale.setScalar(popIn(t, .45)); cam(st, s, 1.5, 2.3, 8.2); } };
  };
  BUILD.c_flip = () => {
    const st = stage(night), r = rig(st);
    const lb = sign(2.6, .5, () => {}, { color: 0xffffff }); lb.position.set(0, 3.55, .3); st.scene.add(lb);
    const big = textSign(2.4, .5, '100,000+ / SEC', { color: C.amber, fg: '#3a2400', size: 62, font: MONO }); big.position.set(0, 2.95, .5); st.scene.add(big);
    return { ...st, update(t, s) { const dir = Math.sin(s * Math.PI * 1.6) > 0 ? 1 : -1; r.pc.flow(s * dir, dir, 1, .3); r.fl.update(s * 2, dir, .9); r.fl.color(dir > 0 ? FIELD : FIELD2); r.pad.glow(dir > 0 ? FIELD : FIELD2, 1.8);
      lb.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, dir > 0 ? 'FLIP  ⟳' : 'FLOP  ⟲', w / 2, h / 2 + 4, h * .56, dir > 0 ? '#0a8fb5' : '#d1307a', 900); });
      lb.scale.setScalar(popIn(t, .05) * (frac(s * .8) < .08 ? 1.08 : 1)); big.scale.setScalar(popIn(t, .45)); cam(st, s, 1.5, 2.3, 8.2); } };
  };
  BUILD.c_pulse = () => {
    const st = stage(night), r = rig(st, { phone: true, phoneY: 2.5, h: 1.5 });
    const glass = M(RB(2.0, .06, 1.3, .03), new THREE.MeshPhysicalMaterial({ color: 0xcfefff, transparent: true, opacity: .28, roughness: .05 }), { pos: [0, 2.15, 0], shadow: false }); st.scene.add(glass);
    const lb = textSign(2.5, .46, 'UP THROUGH THE GLASS', { color: 0xffffff, fg: '#1d2442', size: 50 }); lb.position.set(0, 3.45, .3); st.scene.add(lb);
    return { ...st, update(t, s) { const pu = .55 + .55 * Math.abs(Math.sin(s * 2.4)), dir = Math.sin(s * 2.4) > 0 ? 1 : -1; r.pc.flow(s * dir, dir, 1, .3); r.fl.update(s, dir, .9, pu); r.fl.color(dir > 0 ? FIELD : FIELD2);
      r.ph.rotation.y = Math.sin(s * .5) * .2; lb.scale.setScalar(popIn(t, .3)); cam(st, s, 1.8, 2.0, 8.4); } };
  };
  BUILD.c_induce = () => {
    const st = stage(night), r = rig(st, { phone: true, phoneY: 2.4 });
    const l1 = textSign(2.4, .44, 'CHANGING FIELD', { color: FIELD, fg: '#0c2a3a', size: 54 }), l2 = textSign(2.0, .44, '= CURRENT!', { color: C.lime, fg: '#14320a', size: 58 });
    l1.position.set(0, 3.6, .2); l2.position.set(0, 3.1, .3); st.scene.add(l1, l2);
    return { ...st, update(t, s) { const dir = Math.sin(s * Math.PI * 1.6) > 0 ? 1 : -1, pu = .6 + .45 * Math.abs(Math.sin(s * 2.5)); r.pc.flow(s * dir, dir, .8, .3); r.fl.update(s, dir, .85, pu); r.fl.color(dir > 0 ? FIELD : FIELD2);
      r.cc.flow(s * dir, dir, ease(seg(t, .35, .5)), .4); l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .5)); cam(st, s, 2.0, 1.8, 7.6); } };
  };
  BUILD.c_flow = () => {
    const st = stage(night), r = rig(st, { phone: true, phoneY: 2.35 });
    const lb = textSign(2.2, .52, 'INDUCTION', { color: C.violet, fg: '#fff', size: 72 }), nw = textSign(1.5, .4, 'NO WIRES!', { color: C.amber, fg: '#3a2400', size: 54 });
    lb.position.set(0, 3.5, .3); nw.position.set(1.15, 1.55, .9); st.scene.add(lb, nw); const sp = sparkles(12, [0, 2.4, 0], .9, 0x9df7ff, 8); st.scene.add(sp);
    return { ...st, update(t, s) { const dir = Math.sin(s * Math.PI * 1.6) > 0 ? 1 : -1; r.pc.flow(s * dir, dir, 1, .3); r.cc.flow(s * dir, dir, 1, .4); r.fl.update(s, dir, .8, .85 + .2 * Math.abs(Math.sin(s * 2.5))); r.fl.color(dir > 0 ? FIELD : FIELD2);
      sp.update(s); lb.scale.setScalar(popIn(t, .1)); nw.scale.setScalar(popIn(t, .45)); nw.rotation.z = Math.sin(s * 3) * .06; cam(st, s, 1.7, 2.2, 8.4); } };
  };
  BUILD.c_brush = () => {
    const st = stage(warm), brush = G(M(new THREE.CylinderGeometry(.42, .48, .4, 32), plastic(0x9fd8ff), { pos: [0, .2, 0] }), M(new THREE.CylinderGeometry(.2, .22, 1.6, 24), plastic(0xffffff), { pos: [0, 1.2, 0] }),
      M(new THREE.CylinderGeometry(.06, .11, .7, 16), plastic(0xffffff), { pos: [0, 2.3, 0] }), M(RB(.2, .34, .16, .06), plastic(C.cyan), { pos: [0, 2.68, .06] }), M(SPH(.07, 14, 10), glowM(C.cyan, 3), { pos: [0, 1.4, .2], shadow: false }));
    brush.position.set(-.8, 0, .3); st.scene.add(brush); const bw = waves(C.cyan, 3, .9, .9, .03); bw.rotation.x = Math.PI / 2; bw.position.set(-.8, .42, .3); st.scene.add(bw);
    const hob = new THREE.Group(); hob.add(M(RB(2.0, 1.1, 1.5, .08), plastic(0xfff3e0), { pos: [0, .55, 0] }), M(RB(1.8, .08, 1.3, .04), plastic(0x14161f, { roughness: .15, clearcoat: 1 }), { pos: [0, 1.14, 0] }));
    const rings = [.35, .5].map(rr => { const m = M(new THREE.TorusGeometry(rr, .025, 8, 64), glowM(C.red, 1.2), { pos: [0, 1.19, 0], rot: [Math.PI / 2, 0, 0], shadow: false }); hob.add(m); return m; });
    hob.add(M(new THREE.CylinderGeometry(.55, .5, .3, 40), metal(0x9aa3b5), { pos: [0, 1.34, 0] }), M(RB(.7, .07, .1, .03), plastic(0x2a3046), { pos: [.85, 1.42, 0] }));
    hob.scale.setScalar(.65); hob.position.set(.95, 0, -.3); st.scene.add(hob);
    const steam = [0, 1, 2, 3, 4].map(i => { const sp = sprite(0xffffff, .4, .5); st.scene.add(sp); return sp; });
    const l1 = textSign(1.7, .4, 'TOOTHBRUSH', { color: C.cyan, fg: '#0c2a3a', size: 52 }), l2 = textSign(1.9, .4, 'INDUCTION HOB', { color: C.red, fg: '#fff', size: 50 });
    l1.position.set(-.7, 3.45, .3); l2.position.set(.9, 1.95, .4); st.scene.add(l1, l2);
    return { ...st, update(t, s) { bw.update(s, .9, 1); brush.rotation.z = Math.sin(s * 30) * .015; rings.forEach(m => m.material.emissiveIntensity = 1.5 + Math.sin(s * 6) * .5);
      steam.forEach((sp, i) => { const u = frac(s * .4 + i / 5); sp.position.set(.95 + Math.sin(u * 6 + i) * .15, 1.15 + u * 1.2, -.3); sp.material.opacity = Math.sin(u * Math.PI) * .45; sp.scale.setScalar(.25 + u * .4); });
      l1.scale.setScalar(popIn(t, .15)); l2.scale.setScalar(popIn(t, .45)); aim(st.cam, [Math.sin(s * .5) * .6, 3.6, 8.2], [0, 1.7, 0]); } };
  };
  BUILD.c_rect = () => {
    const st = stage(soft), ac = graph(2.6, 1.0, 'ac', '#ff4fa3'), ch = chip(), bat = battery(); ac.position.set(0, 4.1, 0); ch.position.set(-.6, 2.55, .2); bat.position.set(.9, 2.45, .2); bat.scale.setScalar(.75); st.scene.add(ac, ch, bat);
    const q = textSign(1.8, .44, 'WRONG WAY?', { color: C.amber, fg: '#3a2400', size: 56 }); q.position.set(0, 1.35, .6); st.scene.add(q);
    return { ...st, update(t, s) { ac.draw(s); ac.rotation.z = Math.sin(s * 2) * .03; bat.set(.3); bat.rotation.z = Math.sin(s * 8) * (t > .45 ? .06 : 0); ch.scale.setScalar(popIn(t, .2)); bat.scale.setScalar(popIn(t, .3) * .75); q.scale.setScalar(popIn(t, .5)); cam(st, s, 2.7, .3, 9.0); } };
  };
  BUILD.c_dc = () => {
    const st = stage(soft), ac = graph(1.9, .8, 'ac', '#ff4fa3'), dc = graph(1.9, .8, 'dc', '#2ca84a'), ch = chip(), bat = battery();
    ac.position.set(-.85, 4.3, 0); dc.position.set(.85, 4.3, 0); ch.position.set(0, 2.9, .2); ch.scale.setScalar(.85); bat.position.set(0, 1.5, .2); bat.scale.setScalar(.65); st.scene.add(ac, dc, ch, bat);
    const dots = [0, 1, 2, 3].map(i => { const d = sprite(0xb6ff5c, .3); st.scene.add(d); return d; });
    return { ...st, update(t, s) { ac.draw(s); dc.draw(s); dc.scale.setScalar(popIn(t, .25)); bat.set(lerp(.3, .75, seg(t, .3, 1)));
      dots.forEach((d, i) => { const u = frac(s * .6 + i / 4); d.position.set(0, lerp(2.4, 2.0, u), .5); d.material.opacity = t > .3 ? Math.sin(u * Math.PI) : 0; }); ch.rotation.y = Math.sin(s) * .15; cam(st, s, 2.8, .3, 9.2); } };
  };
  BUILD.c_talk = () => {
    const st = stage(warm), ped = pedestal(1.35, 0xffffff, C.pink), pad = makePad(); pad.position.y = .4; st.scene.add(ped, pad); const ph = flatPhone(0x7b6cff); ph.position.y = .78; st.scene.add(ph);
    const bat = battery(); bat.scale.setScalar(.6); bat.position.set(.15, 1.85, 0); st.scene.add(bat);
    const b = [chat('MORE POWER!', '#d1307a', 2.1, 1), chat('OK!', '#0a8fb5', 1.0, -1), chat('LESS, PLEASE', '#d1307a', 2.1, 1), chat('SURE!', '#0a8fb5', 1.2, -1)];
    b[0].position.set(.5, 3.6, .4); b[1].position.set(-.75, 2.9, .4); b[2].position.set(.5, 3.6, .4); b[3].position.set(-.75, 2.9, .4); st.scene.add(...b);
    return { ...st, update(t, s) { b[0].show(t, .05, .5); b[1].show(t, .2, .5); b[2].show(t, .55, 1.1); b[3].show(t, .7, 1.1); const p = lerp(.45, .95, seg(t, 0, .9)); bat.set(p); pad.glow(C.lime, t < .55 ? 2.6 : 1.0);
      ph.position.y = .78 + hop(s % 3.2 - .2, .4, .12).y; cam(st, s, 2.0, 1.4, 8.6); } };
  };
  BUILD.c_align = () => {
    const st = stage(soft), r = rig(st, { phone: true, phoneY: .95, h: 1.1 }); r.ph.scale.setScalar(1);
    const lb = sign(2.4, .5, () => {}, { color: 0xffffff }); lb.position.set(0, 3.4, .3); st.scene.add(lb);
    return { ...st, update(t, s) { const off = ease(seg(t, .15, .4)) * (1 - ease(seg(t, .75, .92))), dir = Math.sin(s * Math.PI * 1.6) > 0 ? 1 : -1, ok = off < .3;
      r.ph.position.x = off * 1.1; r.pc.flow(s * dir, dir, 1, .3); r.fl.update(s, dir, .7); r.fl.color(dir > 0 ? FIELD : FIELD2); r.cc.flow(s * dir, dir, clamp(1 - off * 1.3), .4);
      lb.userData.redraw((x, w, h) => { x.fillStyle = ok ? '#b6ff5c' : '#ff5a5a'; x.fillRect(0, 0, w, h); label(x, ok ? 'LINED UP ✓' : 'OFF CENTRE ✗', w / 2, h / 2 + 4, h * .52, ok ? '#14320a' : '#fff', 900); }); lb.scale.setScalar(popIn(t, .05));
      cam(st, s, 1.5, 2.6, 7.8); } };
  };
  BUILD.c_magnets = () => {
    const st = stage(soft), ped = pedestal(1.35, 0xffffff, C.violet), pad = makePad(); pad.position.y = .4; st.scene.add(ped, pad);
    const ring = (y, R) => { const g = new THREE.Group(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, m = M(RB(.16, .08, .1, .02), plastic(i % 2 ? C.red : 0x3d8bff), { pos: [Math.cos(a) * R, y, Math.sin(a) * R], rot: [0, -a, 0] }); g.add(m); } return g; };
    const pr = ring(.66, .62); st.scene.add(pr);
    const ph = new THREE.Group(), p = flatPhone(); ph.add(p, ring(-.12, .62)); st.scene.add(ph);
    const snap = textSign(1.4, .48, 'SNAP!', { color: C.amber, fg: '#3a2400', size: 72 }); snap.position.set(0, 3.4, .3); st.scene.add(snap);
    const sp = sparkles(12, [0, 1.1, 0], 1.2, 0xffe14d, 6); st.scene.add(sp);
    return { ...st, update(t, s) { const u = ease(seg(t, .15, .5)), sn = t > .5; ph.position.set(lerp(1.3, 0, u * u), sn ? .78 : lerp(1.6, .95, u), 0); ph.rotation.y = lerp(.6, 0, u);
      pad.glow(sn ? C.lime : C.cyan, sn ? 2.4 : .6); snap.scale.setScalar(popIn(t, .5)); snap.rotation.z = Math.sin(s * 8) * .07; sp.visible = sn; sp.update(s); cam(st, s, 1.4, 2.6, 7.8); } };
  };
  BUILD.c_heat = () => {
    const st = stage(warm), ped = pedestal(1.35, 0xffffff, C.orange), pad = makePad(); pad.position.y = .4; st.scene.add(ped, pad); const ph = flatPhone(); ph.position.y = .78; st.scene.add(ph);
    const heat = []; const r = rng(3); for (let i = 0; i < 10; i++) { const h = sprite(C.orange, .5, .6); st.scene.add(h); heat.push([h, r() * 2 - 1, r() * 2 - 1, r()]); }
    const l1 = textSign(1.9, .44, 'PAD: WARMER', { color: C.orange, fg: '#fff', size: 54 }), l2 = textSign(1.9, .44, 'CABLE: FASTER', { color: 0xffffff, fg: '#1d2442', size: 54 });
    l1.position.set(0, 3.9, .2); l2.position.set(0, 3.2, .3); st.scene.add(l1, l2);
    return { ...st, update(t, s) { heat.forEach(([h, x, z, ph0]) => { const u = frac(s * .35 + ph0); h.position.set(x * .9 + Math.sin(u * 5 + ph0 * 6) * .12, .9 + u * 1.8, z * .5); h.material.opacity = Math.sin(u * Math.PI) * .55 * seg(t, .05, .2); h.scale.setScalar(.3 + u * .5); });
      pad.glow(C.orange, 1.6 + Math.sin(s * 3) * .4); l1.scale.setScalar(popIn(t, .3)); l2.scale.setScalar(popIn(t, .55)); cam(st, s, 1.8, 1.8, 8.4); } };
  };
}
