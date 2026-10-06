// 3D CGI shots for Built & Broken: Kodak. Needs the global THREE (three.js r160 UMD build).
(() => {
  if (!window.THREE) return;
  const T3 = window.THREE, W = 1280, H = 720;
  let renderer;
  try {
    renderer = new T3.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
  } catch (e) { return; }
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
  renderer.toneMapping = T3.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
  renderer.outputColorSpace = T3.SRGBColorSpace;

  const COL = { charcoal: 0x1d1d20, amber: 0xe8a33d, amberD: 0xb97d22, rust: 0xb4472a, rustD: 0x7e2f1c, paper: 0xefe9df, grey: 0x6d6a66, yellow: 0xf2c230, brass: 0xc9a14a, black: 0x141416, green: 0x2f6b3f };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const mat = (c, o = {}) => new T3.MeshStandardMaterial(Object.assign({ color: c, roughness: .55, metalness: .05 }, o));
  const box = (w, h, d, m) => { const x = new T3.Mesh(new T3.BoxGeometry(w, h, d), m); x.castShadow = x.receiveShadow = true; return x; };
  const cyl = (rt, rb, h, m, seg = 48) => { const x = new T3.Mesh(new T3.CylinderGeometry(rt, rb, h, seg), m); x.castShadow = x.receiveShadow = true; return x; };
  function rounded(w, h, d, r, m) {
    const s = new T3.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new T3.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: r * .4, bevelSize: r * .4, bevelSegments: 4, curveSegments: 12 }); g.center();
    const o = new T3.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o;
  }
  function stage(bg = COL.charcoal, fog = true) {
    const scene = new T3.Scene(); scene.background = new T3.Color(bg); if (fog) scene.fog = new T3.Fog(bg, 18, 60);
    scene.add(new T3.HemisphereLight(0xfff2e0, 0x2a2a30, 1.1));
    const key = new T3.DirectionalLight(0xfff0dc, 3.0); key.position.set(6, 10, 7); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 }); key.shadow.bias = -.0005;
    scene.add(key); const rim = new T3.DirectionalLight(0xe8a33d, 1.1); rim.position.set(-8, 4, -6); scene.add(rim);
    const cam = new T3.PerspectiveCamera(35, W / H, .1, 200);
    return { scene, cam, key, rim };
  }
  function floor(scene, c = 0x18181b, y = 0) { const f = new T3.Mesh(new T3.PlaneGeometry(200, 200), mat(c, { roughness: .95 })); f.rotation.x = -Math.PI / 2; f.position.y = y; f.receiveShadow = true; scene.add(f); return f; }
  function orbit(cam, r, h, ang, look = [0, 1, 0]) { cam.position.set(Math.sin(ang) * r, h, Math.cos(ang) * r); cam.lookAt(...look); }

  // ---------- models ----------
  function tower() {
    const g = new T3.Group(), body = mat(COL.amberD, { roughness: .6 }), win = new T3.MeshStandardMaterial({ color: 0x2a1c0c, emissive: COL.amber, emissiveIntensity: 1.4, roughness: .3 });
    const main = box(4, 12, 4, body); main.position.y = 6; g.add(main);
    const crown = box(4.6, .5, 4.6, body); crown.position.y = 12.25; g.add(crown);
    const top = box(2.4, 2, 2.4, body); top.position.y = 13.5; g.add(top);
    const spire = cyl(.05, .25, 2.5, body); spire.position.y = 15.7; g.add(spire);
    const wins = [], geo = new T3.PlaneGeometry(.42, .6);
    for (let face = 0; face < 4; face++) for (let r = 0; r < 14; r++) for (let c = 0; c < 5; c++) {
      const m = win.clone(), w = new T3.Mesh(geo, m), a = face * Math.PI / 2, off = -1.6 + c * .8;
      w.position.set(Math.sin(a) * 2.01 + Math.cos(a) * off, 1.2 + r * .78, Math.cos(a) * 2.01 - Math.sin(a) * off); w.rotation.y = a; g.add(w); wins.push(w);
    }
    const door = box(1.2, 1.4, .1, mat(0x0d0d0f)); door.position.set(0, .7, 2.02); g.add(door);
    return { g, body, wins };
  }
  function boxCamera(leather = 0x1a1716) {
    const g = new T3.Group();
    const b = rounded(1.6, 1.3, 2.1, .08, mat(leather, { roughness: .85 })); b.position.y = .65; g.add(b);
    const ring = new T3.Mesh(new T3.TorusGeometry(.32, .07, 24, 64), mat(COL.brass, { metalness: .9, roughness: .3 })); ring.position.set(0, .75, 1.15); g.add(ring);
    const lens = cyl(.3, .3, .1, new T3.MeshPhysicalMaterial({ color: 0x0a0c10, roughness: .05, metalness: .2, clearcoat: 1 })); lens.rotation.x = Math.PI / 2; lens.position.set(0, .75, 1.12); g.add(lens);
    const key = cyl(.1, .1, .25, mat(COL.brass, { metalness: .9, roughness: .3 })); key.rotation.z = Math.PI / 2; key.position.set(.92, .9, .2); g.add(key);
    const strap = box(.9, .06, .2, mat(0x2a2016, { roughness: .9 })); strap.position.set(0, 1.33, 0); g.add(strap);
    return g;
  }
  function brownie() {
    const g = new T3.Group(), card = mat(0x5a3a22, { roughness: .9 });
    const b = rounded(1.5, 1.6, 1.9, .05, card); b.position.y = .8; g.add(b);
    const plate = box(1.2, 1.2, .04, mat(0x1a1716, { roughness: .7 })); plate.position.set(0, .8, .98); g.add(plate);
    const lens = cyl(.16, .16, .08, new T3.MeshPhysicalMaterial({ color: 0x0a0c10, roughness: .05, clearcoat: 1 })); lens.rotation.x = Math.PI / 2; lens.position.set(0, .8, 1.02); g.add(lens);
    const vf = box(.35, .3, .35, mat(0x111113, { roughness: .4 })); vf.position.set(.45, 1.75, .6); g.add(vf);
    const tag = box(.9, .18, .02, mat(COL.amber, { metalness: .6, roughness: .35 })); tag.position.set(0, 1.42, .99); g.add(tag);
    return g;
  }
  function canister() {
    const g = new T3.Group();
    const body = cyl(.32, .32, .9, mat(COL.yellow, { roughness: .4 })); g.add(body);
    const band = cyl(.325, .325, .18, mat(0xc43c2a, { roughness: .4 })); band.position.y = .1; g.add(band);
    const cap1 = cyl(.34, .34, .06, mat(0x111113, { metalness: .4, roughness: .4 })); cap1.position.y = .48; g.add(cap1);
    const cap2 = cap1.clone(); cap2.position.y = -.48; g.add(cap2);
    const spool = cyl(.09, .09, .2, mat(0x111113)); spool.position.y = .6; g.add(spool);
    return g;
  }
  function coin() { const c = cyl(.3, .3, .06, mat(COL.amber, { metalness: .95, roughness: .25 })); return c; }
  function prototype() {
    const g = new T3.Group(), chassis = mat(0x8e8b86, { metalness: .6, roughness: .35 });
    const base = rounded(2.6, 1.3, 1.5, .06, chassis); base.position.set(-.4, .7, 0); g.add(base);
    const lensBody = cyl(.38, .42, .7, mat(0x141416, { roughness: .4 })); lensBody.rotation.x = Math.PI / 2; lensBody.position.set(-1.15, .8, 1.05); g.add(lensBody);
    const glass = cyl(.3, .3, .05, new T3.MeshPhysicalMaterial({ color: 0x0a1018, roughness: .02, clearcoat: 1, metalness: .1 })); glass.rotation.x = Math.PI / 2; glass.position.set(-1.15, .8, 1.42); g.add(glass);
    for (let i = 0; i < 5; i++) { const b = box(.08, 1.0, 1.2, mat(COL.green, { roughness: .6 })); b.position.set(-.1 + i * .22, 1.85, 0); g.add(b);
      for (let k = 0; k < 4; k++) { const chip = box(.1, .12, .2, mat(0x111113)); chip.position.set(-.1 + i * .22 + .06, 1.5 + k * .22, -.3 + (k % 2) * .5); g.add(chip); } }
    const deck = rounded(1.5, .9, 1.3, .05, mat(0x3c3b40, { roughness: .5 })); deck.position.set(1.75, .5, 0); g.add(deck);
    const reels = [];
    for (let i = 0; i < 2; i++) { const r = cyl(.22, .22, .05, mat(0xd8d4c6, { roughness: .4 })); r.rotation.x = Math.PI / 2; r.position.set(1.45 + i * .6, .6, .68); g.add(r); reels.push(r);
      const hub = box(.06, .3, .06, mat(0x111113)); hub.position.copy(r.position); hub.position.z += .03; g.add(hub); reels.push(hub); }
    const cable = new T3.Mesh(new T3.TorusGeometry(.5, .03, 8, 32, Math.PI), mat(0x111113)); cable.position.set(1.0, 1.0, -.4); g.add(cable);
    return { g, reels };
  }
  function digicam() {
    const g = new T3.Group();
    const b = rounded(2.0, 1.2, .6, .12, mat(0x9a9894, { metalness: .5, roughness: .35 })); b.position.y = .6; g.add(b);
    const l = cyl(.42, .45, .35, mat(0x1a1a1c, { metalness: .6, roughness: .3 })); l.rotation.x = Math.PI / 2; l.position.set(-.35, .6, .5); g.add(l);
    const gl = cyl(.3, .3, .03, new T3.MeshPhysicalMaterial({ color: 0x0a1018, roughness: .02, clearcoat: 1 })); gl.rotation.x = Math.PI / 2; gl.position.set(-.35, .6, .68); g.add(gl);
    const btn = cyl(.1, .1, .08, mat(COL.amber)); btn.position.set(.6, 1.25, 0); g.add(btn);
    return g;
  }
  function phoneModel() {
    const g = new T3.Group();
    const b = rounded(1.2, 2.4, .12, .16, mat(0x101012, { metalness: .7, roughness: .25 })); g.add(b);
    const scr = new T3.Mesh(new T3.PlaneGeometry(1.08, 2.2), new T3.MeshStandardMaterial({ color: 0x111111, emissive: COL.amber, emissiveIntensity: .0, roughness: .1 })); scr.position.z = .2; g.add(scr);
    const camB = rounded(.36, .36, .05, .06, mat(0x1a1a1c, { metalness: .6, roughness: .3 })); camB.position.set(-.33, .9, -.2); g.add(camB);
    const lens = cyl(.08, .08, .04, new T3.MeshPhysicalMaterial({ color: 0x050608, clearcoat: 1, roughness: .02 })); lens.rotation.x = Math.PI / 2; lens.position.set(-.33, .9, -.24); g.add(lens);
    return { g, scr };
  }

  // ---------- shots ----------
  const shots = {};
  function make(id, build) { shots[id] = { build, s: null }; }

  make('tower', () => { const S = stage(); floor(S.scene); const t = tower(); S.scene.add(t.g);
    const people = []; for (let i = 0; i < 14; i++) { const p = new T3.Mesh(new T3.CapsuleGeometry(.12, .35, 4, 8), mat(0x0d0d0f)); p.castShadow = true; S.scene.add(p); people.push(p); }
    return (k, T) => { orbit(S.cam, 30, 5 + 3 * k, .5 - .35 * k, [0, 7.5, 0]);
      people.forEach((p, i) => { const f = (T * .06 + i / 14) % 1; p.position.set(-8 + f * 8, .3, 4 + (i % 3) * .5); }); return S; }; });
  make('tower_crack', () => { const S = stage(); floor(S.scene, 0x161012); const t = tower(); S.scene.add(t.g);
    const debris = []; for (let i = 0; i < 26; i++) { const d = box(.3 + Math.random() * .4, .3, .3 + Math.random() * .3, t.body); d.visible = false; S.scene.add(d); debris.push({ d, x: (Math.random() - .5) * 4, z: (Math.random() - .5) * 4, y0: 8 + Math.random() * 5, t0: Math.random() * .5, r: Math.random() * 3 }); }
    return (k, T) => { const r = ease(seg(k, 0, .45));
      t.body.color.setHex(COL.amberD).lerp(new T3.Color(COL.rustD), r); S.scene.background.setHex(COL.charcoal).lerp(new T3.Color(0x2a1612), r); S.scene.fog.color.copy(S.scene.background);
      t.wins.forEach((w, i) => { w.material.emissiveIntensity = (i * 0.618 % 1) < r ? 0 : 1.4; });
      t.g.rotation.z = -.05 * r;
      debris.forEach(o => { const p = seg(k, .15 + o.t0, .45 + o.t0); o.d.visible = p > 0; o.d.position.set(o.x * (1 + p), Math.max(.15, o.y0 * (1 - p * p)), o.z * (1 + p)); o.d.rotation.set(p * o.r, p * o.r * .7, 0); });
      orbit(S.cam, 31 - 3 * k, 4, .15 + .1 * k, [0, 7.5, 0]); return S; }; });
  make('box1888', () => { const S = stage(); floor(S.scene); const c = boxCamera(); c.scale.setScalar(2); S.scene.add(c);
    const spot = new T3.SpotLight(0xffe2b0, 60, 30, .5, .6); spot.position.set(0, 9, 4); spot.castShadow = true; S.scene.add(spot);
    return k => { c.rotation.y = -.9 + 1.6 * k; orbit(S.cam, 9, 3.2, 0, [0, 1.3, 0]); return S; }; });
  make('brownie3d', () => { const S = stage(); floor(S.scene); const c = brownie(); c.scale.setScalar(2.1); c.position.x = -1.8; S.scene.add(c);
    return k => { c.rotation.y = .6 - 1.1 * k; orbit(S.cam, 10, 3, 0, [0, 1.6, 0]); return S; }; });
  make('razor3d', () => { const S = stage(); floor(S.scene); const items = [];
    for (let i = 0; i < 34; i++) { const isCoin = i % 2 === 1, o = isCoin ? coin() : canister(); S.scene.add(o);
      const col = i % 6, row = Math.floor(i / 6); items.push({ o, isCoin, x: -3 + col * 1.2 + (isCoin ? .3 : 0), z: -1 + (row % 2) * .9, yRest: isCoin ? .03 + row * .07 : .45 + (row > 2 ? .9 : 0) * 0, t0: i * .022, spin: Math.random() * 6 }); }
    const cam = boxCamera(0x26262a); cam.position.set(-5.5, 0, 1); cam.scale.setScalar(1.2); S.scene.add(cam);
    return (k, T) => { items.forEach(it => { const p = seg(k, it.t0, it.t0 + .25), b = p < 1 ? 1 - Math.pow(1 - p, 2) : 1;
        it.o.position.set(it.x, it.yRest + (1 - b) * 9, it.z); it.o.rotation.set(it.isCoin ? (1 - b) * it.spin : 0, (1 - b) * it.spin, it.isCoin ? 0 : (1 - b) * 1.5); it.o.visible = k > it.t0; });
      orbit(S.cam, 13, 6, -.25 + .3 * k, [-.5, .6, 0]); return S; }; });
  make('proto3d', () => { const S = stage(0x202024); floor(S.scene, 0x2a2a2e); const p = prototype(); p.g.scale.setScalar(1.6); S.scene.add(p.g);
    const desk = box(12, .2, 5, mat(0x4a4540, { roughness: .8 })); desk.position.y = -.1; S.scene.add(desk);
    return (k, T) => { p.reels.forEach((r, i) => { r.rotation.z = -T * 4; }); orbit(S.cam, 11, 4.2, -.7 + .9 * k, [0, 1.5, 0]); return S; }; });
  make('phone3d', () => { const S = stage(); floor(S.scene); const d = digicam(); d.scale.setScalar(1.6); S.scene.add(d); const ph = phoneModel(); ph.g.scale.setScalar(1.15); S.scene.add(ph.g);
    return (k, T) => { const a = ease(seg(k, .2, .6));
      d.position.set(-2.2 * a, 0, -3 * a); d.rotation.set(0, .4 + a, -a * .4); d.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = 1 - a * .85; } });
      ph.g.position.set(1.4 * a, 1.9 + (1 - a) * -3, 1.2 * a); ph.g.rotation.y = -.5 + (1 - a) * 2 + Math.sin(T * .6) * .08; ph.scr.material.emissiveIntensity = .9 * a;
      orbit(S.cam, 10, 3, 0, [0, 1.6, 0]); return S; }; });
  make('hide3d', () => { const S = stage(); floor(S.scene); const d = digicam(); d.scale.setScalar(1.5); S.scene.add(d);
    const glow = new T3.PointLight(COL.amber, 8, 6); glow.position.set(0, 1.2, 1.5); S.scene.add(glow);
    const lid = new T3.Group(); const top = box(4.2, .2, 3, mat(COL.rustD, { roughness: .7 })); top.position.y = 2.2; lid.add(top);
    [[-2, 0], [2, 0]].forEach(([x]) => { const s = box(.2, 2.2, 3, mat(COL.rustD, { roughness: .7 })); s.position.set(x, 1.1, 0); lid.add(s); });
    const back = box(4.2, 2.2, .2, mat(COL.rustD, { roughness: .7 })); back.position.set(0, 1.1, -1.4); lid.add(back); const front = back.clone(); front.position.z = 1.4; lid.add(front); S.scene.add(lid);
    return k => { const a = ease(seg(k, .35, .8)); lid.position.y = 6 * (1 - a); glow.intensity = 8 * (1 - a); orbit(S.cam, 10, 4.5, .35, [0, 1, 0]); return S; }; });
  make('blueprint3d', () => { const S = stage(0x16243a, false); const t = tower();
    const edges = new T3.Group(); t.g.traverse(o => { if (o.isMesh && o.geometry.type === 'BoxGeometry') { const e = new T3.LineSegments(new T3.EdgesGeometry(o.geometry), new T3.LineBasicMaterial({ color: 0xffffff, transparent: true })); e.position.copy(o.position); e.rotation.copy(o.rotation); edges.add(e); } });
    S.scene.add(edges); const grid = new T3.GridHelper(60, 60, 0x3a5a80, 0x24405f); S.scene.add(grid);
    return (k, T) => { edges.children.forEach((e, i) => { e.material.opacity = seg(k * 1.6, i / edges.children.length * .8, i / edges.children.length * .8 + .2); }); edges.rotation.y = T * .15; orbit(S.cam, 32, 9, .3, [0, 7.5, 0]); return S; }; });

  const glCanvas = renderer.domElement;
  window.K3D = {
    has: id => !!shots[id],
    draw(id, k, T) { const s = shots[id]; if (!s.s) s.s = s.build(); const S = s.s(k, T); renderer.render(S.scene, S.cam); return glCanvas; },
  };
})();
