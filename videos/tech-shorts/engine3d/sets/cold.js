// Sets for the story short "Why Your Phone Dies in the Cold" (story style: one shot per line, no HUD).
// Bit stands in the snow with a phone; cutaways go inside the battery, where lithium ions swim through a liquid
// that thickens like syrup in the cold, then thaws.
export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, glowM, ctex, rrect, label, sprite, stage, aim,
    makeBit, sparkles, clamp, lerp, seg, ease, pop, frac, rng } = K;

  const SNOW = { top: '#2fa9e2', bottom: '#dff3fc', floor: 0xf2f7ff, fogColor: '#e4f3fb', fogNear: 14, fogFar: 40, key: 0xf4f8ff, keyI: 2.6, hemi: 1.2 };
  const INSIDE = { top: '#124679', bottom: '#5fb6e6', floor: null, rim: 0xbfe8ff, rimI: 2.4 };
  const WARM = { top: '#ff9c57', bottom: '#ffd9ae', floor: 0xb97c4f, fogColor: '#ffd9ae', key: 0xffc98a, keyI: 3.0 };
  const HAND = 0xff8a3d;

  // ---------- props ----------
  // phone: dark slab with a canvas screen; draw({ pct, dim, frost, boot }) repaints it
  function phone(col = 0x23283a) {
    const g = new THREE.Group(), mat = plastic(col, { roughness: .22, transparent: true });
    g.add(M(RB(1.5, 3.0, .2, .24), mat));
    g.add(M(RB(.55, .55, .06, .14), plastic(0x14182a), { pos: [-.38, 1.0, -.12] }));
    const t = ctex(420, 860), scr = M(new THREE.PlaneGeometry(1.36, 2.84), new THREE.MeshBasicMaterial({ map: t.tex, toneMapped: false, transparent: true }), { pos: [0, 0, .104], shadow: false });
    g.add(scr);
    g.draw = (o = {}) => t.redraw((x, w, h) => {
      const bg = x.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1b4a86'); bg.addColorStop(1, '#5cc0ee'); x.fillStyle = bg; x.fillRect(0, 0, w, h);
      if (o.boot !== undefined) { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.globalAlpha = o.boot; x.fillStyle = '#ffe14d'; x.beginPath(); x.moveTo(235, 330); x.lineTo(160, 450); x.lineTo(205, 450); x.lineTo(185, 560); x.lineTo(265, 420); x.lineTo(218, 420); x.closePath(); x.fill(); x.globalAlpha = 1; return; }
      label(x, '9:41', w / 2, 140, 112, '#ffffff', 800);
      const p = clamp((o.pct ?? 50) / 100), col = p < .15 ? '#ff4a4a' : p < .3 ? '#ffc44d' : '#5ce06a';
      x.strokeStyle = '#fff'; x.lineWidth = 13; rrect(x, 120, 330, 180, 320, 30); x.stroke(); x.fillStyle = '#fff'; rrect(x, 175, 298, 70, 32, 8); x.fill();
      x.fillStyle = col; const hh = 288 * Math.max(p, .02); rrect(x, 135, 636 - hh, 150, hh, 16); x.fill();
      label(x, Math.round(o.pct ?? 50) + '%', w / 2, 740, 92, '#ffffff', 900);
      if (o.frost) { const fr = x.createRadialGradient(w / 2, h / 2, h * .22, w / 2, h / 2, h * .62); fr.addColorStop(0, 'rgba(235,248,255,0)'); fr.addColorStop(1, `rgba(235,248,255,${.75 * o.frost})`); x.fillStyle = fr; x.fillRect(0, 0, w, h); }
      if (o.dim) { x.fillStyle = `rgba(4,5,8,${clamp(o.dim)})`; x.fillRect(0, 0, w, h); }
      const gl = x.createLinearGradient(0, 0, w, h); gl.addColorStop(0, 'rgba(255,255,255,.12)'); gl.addColorStop(.45, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(0, 0, w, h);
    });
    g.userData = { mat, scr }; g.draw(); return g;
  }
  // falling snow, a pure function of time
  function snow(n, box, center = [0, 0, 0], seed = 5, size = .04) {
    const r = rng(seed), im = new THREE.InstancedMesh(new THREE.SphereGeometry(size, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false }), n); im.castShadow = false;
    const P = []; for (let i = 0; i < n; i++) P.push([r() - .5, r(), r() - .5, .35 + r() * .4, r() * 6, .6 + r() * .8]);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
    im.update = s => { P.forEach(([x, y, z, v, ph, k], i) => { p.set(center[0] + x * box[0] + Math.sin(s * .9 + ph) * .18, center[1] + box[1] * (1 - frac(y + s * v / box[1])), center[2] + z * box[2]); sc.setScalar(k); m.compose(p, q, sc); im.setMatrixAt(i, m); }); im.instanceMatrix.needsUpdate = true; };
    im.update(0); return im;
  }
  function pine(x, z, s = 1) {
    const g = G(M(new THREE.CylinderGeometry(.1 * s, .14 * s, .6 * s, 10), matte(0x7a5236), { pos: [0, .3 * s, 0] }));
    [[1.0, .9], [.78, 1.55], [.55, 2.1]].forEach(([r, y], i) => { g.add(M(new THREE.ConeGeometry(r * s, 1.0 * s, 20), plastic(0x2f7d55, { clearcoat: .2 }), { pos: [0, y * s, 0] }));
      g.add(M(new THREE.ConeGeometry(r * s * .62, .42 * s, 20), plastic(0xffffff, { roughness: .6, clearcoat: .1 }), { pos: [0, (y + .3) * s, 0], shadow: false })); });
    g.position.set(x, 0, z); return g;
  }
  function snowyGround(st, seed = 2) {
    const r = rng(seed);
    [[-3.2, -3.5, 1.3], [3.4, -4.5, 1.6], [-5.5, -8, 1.8], [5.8, -9, 2.0], [-1.2, -9.5, 1.4], [2.0, -6.5, 1.1]].forEach(([x, z, s]) => st.scene.add(pine(x, z, s)));
    for (let i = 0; i < 9; i++) st.scene.add(M(SPH(.6 + r() * .9, 24, 16), plastic(0xffffff, { roughness: .7, clearcoat: .05 }), { pos: [(r() - .5) * 12, 0, -2 - r() * 7], scale: [1.4, .35, 1] }));
  }
  // breath puffs in the cold: soft white sprites drifting out from a point
  function breath(at) {
    const g = new THREE.Group(); for (let i = 0; i < 3; i++) g.add(sprite(0xffffff, 1, .5));
    g.update = s => g.children.forEach((sp, i) => { const u = frac(s * .55 + i / 3); sp.position.set(at[0] + u * .5, at[1] + u * .35, at[2] + u * .9); sp.scale.setScalar(.25 + u * .9); sp.material.opacity = Math.sin(u * Math.PI) * .45; });
    return g;
  }
  // Bit holding a phone at chest height; the screen faces Bit, so cameras behind Bit can read it
  function bitWithPhone() {
    const bit = makeBit(), ph = phone(); ph.scale.setScalar(.42); ph.position.set(0, .62, 1.38); ph.rotation.set(-.75, Math.PI, 0); bit.add(ph);
    return { bit, ph };
  }

  // ---------- inside the battery ----------
  // two electrodes with liquid between; ions swim from the left plate to the right one.
  // speed(sx) is the swim speed at second sx; positions use its integral, so any frame renders on its own.
  function cellMacro(st) {
    const g = new THREE.Group(), r = rng(9);
    const plateA = M(RB(.7, 4.2, 1.9, .12), plastic(0x3a3f4f, { roughness: .45 }), { pos: [-2.05, 2.6, 0] });
    const plateB = M(RB(.7, 4.2, 1.9, .12), plastic(0x2f8fb8, { roughness: .35 }), { pos: [2.05, 2.6, 0] });
    for (let i = 0; i < 9; i++) [-1, 1].forEach(sd => plateB.add(M(SPH(.1, 12, 8), plastic(0x9fe3ff), { pos: [-.36, -1.7 + i * .42, sd * .45], shadow: false })));
    const liqMat = new THREE.MeshPhysicalMaterial({ color: 0x7fd8ff, transparent: true, opacity: .22, roughness: .08, depthWrite: false });
    const liquid = M(RB(3.4, 4.1, 1.8, .1), liqMat, { pos: [0, 2.6, 0], shadow: false });
    const glass = M(RB(4.9, 4.6, 2.3, .3), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .1, roughness: .02, depthWrite: false }), { pos: [0, 2.6, 0], shadow: false });
    g.add(plateA, plateB, liquid, glass);
    const ions = []; for (let i = 0; i < 26; i++) {
      const b = G(M(SPH(.13, 20, 14), glowM(0xb6ff5c, 1.8), { shadow: false }), sprite(0xb6ff5c, .42, .45));
      b.userData = { ph: r(), y: 1.0 + r() * 3.2, z: (r() - .5) * 1.3, w: r() * 6, sp: .8 + r() * .4 }; g.add(b); ions.push(b);
    }
    const frost = []; for (let i = 0; i < 70; i++) {
      const edge = i % 4, u = r(), f = M(new THREE.OctahedronGeometry(.07 + r() * .1, 0), plastic(0xf2fbff, { roughness: .3, transparent: true, opacity: .9 }), { shadow: false });
      f.position.set(edge < 2 ? (u - .5) * 4.8 : (edge === 2 ? -2.42 : 2.42), edge === 0 ? 4.88 : edge === 1 ? .32 : .4 + u * 4.4, 1.12 + r() * .05); f.rotation.set(r() * 3, r() * 3, r() * 3); f.userData.k = r(); g.add(f); frost.push(f);
    }
    st.scene.add(g);
    const dist = (sx, speed) => { let d = 0; const dt = .02; for (let x = 0; x < sx; x += dt) d += speed(x) * dt; return d; };
    return {
      g, ions, liquid,
      // cold 0..1 thickens and tints the liquid and grows frost; glow dims as ions slow
      update(s, speed, cold = 0, show = 1) {
        const d = dist(s, speed), v = speed(s);
        ions.forEach((b, i) => { const u = b.userData, k = frac(u.ph + d * .32 * u.sp), wob = Math.sin(s * 5 + u.w) * .06 * (.3 + v);
          b.position.set(lerp(-1.55, 1.55, k), u.y + wob, u.z); b.scale.setScalar(Math.min(show, Math.sin(k * Math.PI) * 4) * (1 + .25 * Math.min(1, v) * Math.sin(s * 9 + u.w)));
          b.children[0].material.emissiveIntensity = lerp(.7, 1.9, clamp(v / 1.2)); b.scale.x *= 1 + clamp(v - .4) * .35; });
        liqMat.color.setHex(0x7fd8ff).lerp(new THREE.Color(0xd9861a), cold); liqMat.opacity = lerp(.22, .62, cold);
        frost.forEach(f => f.scale.setScalar(clamp((cold - f.userData.k * .6) * 3)));
      }
    };
  }
  // a thick amber drip stretching down from the top of the liquid
  function syrupDrip(x, top) {
    const mat = plastic(0xd98a1c, { roughness: .08, clearcoat: 1, transparent: true, opacity: .9 });
    const neck = M(new THREE.CylinderGeometry(.09, .16, 1, 20), mat, { shadow: false }), drop = M(SPH(.2, 24, 16), mat, { shadow: false });
    const g = G(neck, drop); g.update = k => { const len = .05 + ease(k) * 1.6; neck.scale.y = len; neck.position.set(x, top - len / 2, 1.0); drop.position.set(x, top - len - .1, 1.0); drop.scale.set(1, 1 + k * .4, 1); g.visible = k > 0; };
    return g;
  }

  // ---------- sets, one per line ----------
  BUILD.c_snow = () => {
    const st = stage(SNOW); snowyGround(st); const { bit, ph } = bitWithPhone(); st.scene.add(bit);
    const sn = snow(260, [10, 7, 8], [0, 0, -1]), br = breath([.15, 1.55, 1.0]); st.scene.add(sn, br);
    return { ...st, update(t, s) { sn.update(s); br.update(s); ph.draw({ pct: 41, frost: .3 });
      bit.pose({ s, reachL: .85, reachR: .85, lookX: .45, tilt: Math.sin(s * 28) * .015 }); bit.userData.body.position.x = Math.sin(s * 31) * .012;
      aim(st.cam, [lerp(3.0, 2.4, ease(t)), 2.5, lerp(7.2, 6.2, ease(t))], [0, 1.45, 0]); } };
  };
  BUILD.c_dead = () => {
    const st = stage(SNOW); snowyGround(st, 4); const ph = phone(); ph.position.set(0, 2.6, 0); ph.scale.setScalar(1.05); st.scene.add(ph);
    const hands = [-1, 1].map(sd => M(SPH(.32, 24, 16), plastic(HAND), { pos: [sd * .86, 1.95, .15], scale: [1, 1.15, .9] })); st.scene.add(...hands);
    const sn = snow(160, [7, 6, 5], [0, 0, 1.5], 8, .035); st.scene.add(sn);
    return { ...st, update(t, s) { sn.update(s);
      const fl = t > .38 && t < .5 ? (Math.sin(s * 70) > 0 ? .7 : 0) : 0, dim = Math.max(fl, ease(seg(t, .5, .62)));
      ph.draw({ pct: 41, frost: .45, dim }); ph.rotation.z = Math.sin(s * 30) * .006; ph.rotation.y = Math.sin(s * .8) * .06;
      aim(st.cam, [0, 2.7, lerp(6.4, 5.6, ease(t))], [0, 2.6, 0]); } };
  };
  BUILD.c_xray = () => {
    const st = stage(SNOW); const ph = phone(); ph.position.set(0, 2.6, 0); ph.scale.setScalar(1.05); st.scene.add(ph);
    const r = rng(3), pack = M(RB(1.15, 2.2, .1, .1), plastic(0x9aa3bd, { roughness: .4 }), { pos: [0, -.1, 0] }); ph.add(pack);
    const ions = []; for (let i = 0; i < 30; i++) { const b = G(M(SPH(.07, 14, 10), glowM(0xb6ff5c, 2.2), { shadow: false }), sprite(0xb6ff5c, .4, .6)); b.position.set(-.42 + (i % 5) * .21 + (r() - .5) * .04, -1.0 + Math.floor(i / 5) * .34, .08); pack.add(b); ions.push(b); }
    const sn = snow(120, [7, 6, 5], [0, 0, 1.5], 11, .035); st.scene.add(sn);
    return { ...st, update(t, s) { sn.update(s); const k = ease(seg(t, .08, .4));
      ph.draw({ pct: 0, dim: 1 }); ph.userData.mat.opacity = lerp(1, .14, k); ph.userData.mat.depthWrite = k < .5; ph.userData.scr.material.opacity = 1 - k;
      ions.forEach((b, i) => { b.scale.setScalar(Math.min(1, pop(s - .35 - (i % 7) * .05)) * (1 + .15 * Math.sin(s * 6 + i))); });
      ph.rotation.y = lerp(-.25, .2, ease(t)); aim(st.cam, [0, 2.7, lerp(6.2, 5.2, ease(t))], [0, 2.55, 0]); } };
  };
  BUILD.c_ions = () => {
    const st = stage(INSIDE), c = cellMacro(st);
    return { ...st, update(t, s) { c.update(s, () => 1.2, 0, Math.min(1, pop(s - .1)));
      aim(st.cam, [lerp(-.6, .6, t), 2.7, lerp(9.4, 8.4, ease(t))], [0, 2.6, 0]); } };
  };
  BUILD.c_flow = () => {
    const st = stage(INSIDE), c = cellMacro(st), r = rng(6), bub = [];
    for (let i = 0; i < 14; i++) { const b = M(SPH(.05 + r() * .05, 12, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .35, roughness: 0, depthWrite: false }), { shadow: false }); b.userData = [(r() - .5) * 3, r(), (r() - .5) * 1.4]; st.scene.add(b); bub.push(b); }
    return { ...st, update(t, s) { c.update(s + 3, () => 1.3); bub.forEach(b => { const [x, y, z] = b.userData; b.position.set(x, .6 + 4 * frac(y + s * .15), z); });
      aim(st.cam, [lerp(1.6, .9, ease(t)), 2.1, lerp(4.6, 3.8, ease(t))], [-.4, 2.7, 0]); } };
  };
  BUILD.c_freeze = () => {
    const st = stage({ ...INSIDE, top: '#0d3762', bottom: '#8fd3f5' }), c = cellMacro(st), drip = syrupDrip(-.3, 4.6); st.scene.add(drip);
    const sp = t => lerp(1.2, .3, ease(seg(t, .15, .75)));
    return { ...st, update(t, s, d) { const cold = ease(seg(t, .05, .65)); c.update(s + 6, x => sp(x / d), cold); drip.update(seg(t, .45, 1));
      aim(st.cam, [0, 2.8, lerp(9.0, 8.0, ease(t))], [0, 2.6, 0]); } };
  };
  BUILD.c_slow = () => {
    const st = stage({ ...INSIDE, top: '#0d3762', bottom: '#8fd3f5' }), c = cellMacro(st), drip = syrupDrip(-.3, 4.6); st.scene.add(drip);
    return { ...st, update(t, s) { c.update(s + 9, () => .09, 1); drip.update(1);
      c.ions.forEach((b, i) => { const st2 = Math.sin(s * 7 + i); b.scale.y *= 1 - .12 * st2; b.scale.x *= 1 + .12 * st2; });
      aim(st.cam, [lerp(.9, .4, t), 2.5, lerp(4.6, 4.1, ease(t))], [.2, 2.6, 0]); } };
  };
  BUILD.c_off = () => {
    const st = stage(SNOW); snowyGround(st, 7); const { bit, ph } = bitWithPhone(); st.scene.add(bit);
    const sn = snow(220, [9, 7, 8], [0, 0, 0], 13); st.scene.add(sn);
    return { ...st, update(t, s) { sn.update(s);
      const blink = t < .4 && Math.sin(s * 12) > 0, dim = ease(seg(t, .42, .58));
      ph.draw({ pct: blink ? 3 : 2, frost: .5, dim }); bit.pose({ s, reachL: .85, reachR: .85, lookX: .3, sad: t > .55 ? 1 : 0, tilt: Math.sin(s * 28) * .012 });
      ph.rotation.set(-.25, -.15, Math.sin(s * 30) * .01); ph.position.set(.42, .66, 1.5); ph.scale.setScalar(.36); aim(st.cam, [lerp(.8, .4, t), 2.1, lerp(7.0, 6.3, ease(t))], [.1, 1.25, .6]); } };
  };
  BUILD.c_warm = () => {
    const st = stage(WARM); const { bit, ph } = bitWithPhone(); bit.position.set(-.6, 0, 0); bit.rotation.y = .5; st.scene.add(bit);
    const heater = G(M(RB(1.6, 2.2, .7, .16), plastic(0xf2ece4)), M(RB(1.3, 1.5, .1, .06), plastic(0x2a2026), { pos: [0, .15, .33] }));
    const coils = []; for (let i = 0; i < 4; i++) { const c = M(new THREE.CylinderGeometry(.05, .05, 1.1, 10), glowM(0xff6a1f, 3), { pos: [-.45 + i * .3, .15, .4], shadow: false }); heater.add(c); coils.push(c); }
    heater.add(sprite(0xff8a3d, 3.4, .55)); heater.children.at(-1).position.set(0, .15, .7);
    heater.position.set(1.7, 1.1, -.4); heater.rotation.y = -.5; st.scene.add(heater);
    const win = M(RB(2.6, 2.2, .1, .08), plastic(0xffffff), { pos: [-1.6, 3.6, -3] }), pane = M(new THREE.PlaneGeometry(2.3, 1.9), new THREE.MeshBasicMaterial({ color: 0x6fb8e8 }), { pos: [-1.6, 3.6, -2.94], shadow: false });
    const sn = snow(60, [2.2, 1.9, .05], [-1.6, 2.65, -2.9], 21, .03); st.scene.add(win, pane, sn);
    const glow = sparkles(16, [1.4, 1.6, 0], 1.5, 0xffb35c, 5); st.scene.add(glow);
    return { ...st, update(t, s) { sn.update(s); glow.update(s); coils.forEach((c, i) => c.material.emissiveIntensity = 2.6 + Math.sin(s * 3 + i) * .5);
      ph.draw({ pct: 0, dim: 1 }); bit.pose({ s, reachL: .85, reachR: .85, lookX: .2, lookY: .1 });
      aim(st.cam, [lerp(.6, .2, t), 2.4, lerp(7.4, 6.6, ease(t))], [.3, 1.5, 0]); } };
  };
  BUILD.c_thaw = () => {
    const st = stage({ ...INSIDE, top: '#7a3a1c', bottom: '#ffb36b', rim: 0xffd2a0 }), c = cellMacro(st), drip = syrupDrip(-.3, 4.6); st.scene.add(drip);
    const sp = t => lerp(.15, 1.3, ease(seg(t, .1, .6)));
    return { ...st, update(t, s, d) { const cold = 1 - ease(seg(t, .02, .55)); c.update(s + 12, x => sp(x / d), cold); drip.update(1 - seg(t, .0, .4));
      aim(st.cam, [lerp(.5, -.5, t), 2.7, lerp(8.6, 8.9, t)], [0, 2.6, 0]); } };
  };
  BUILD.c_back = () => {
    const st = stage(WARM); const ph = phone(); ph.position.set(0, 2.6, 0); ph.scale.setScalar(1.05); st.scene.add(ph);
    const hands = [-1, 1].map(sd => M(SPH(.32, 24, 16), plastic(HAND), { pos: [sd * .86, 1.95, .15], scale: [1, 1.15, .9] })); st.scene.add(...hands);
    const sp = sparkles(22, [0, 2.6, .6], 1.9, 0xffe14d, 7); st.scene.add(sp);
    return { ...st, update(t, s) { sp.update(s); sp.visible = t > .35;
      if (t < .12) ph.draw({ pct: 0, dim: 1 }); else if (t < .3) ph.draw({ boot: Math.sin(seg(t, .12, .3) * Math.PI) }); else ph.draw({ pct: Math.round(lerp(1, 38, ease(seg(t, .3, .6)))) });
      ph.rotation.y = Math.sin(s * .9) * .08; ph.position.y = 2.6 + Math.min(1, pop(s - .9)) * .05;
      aim(st.cam, [0, 2.7, lerp(5.4, 6.0, ease(t))], [0, 2.6, 0]); } };
  };
}
