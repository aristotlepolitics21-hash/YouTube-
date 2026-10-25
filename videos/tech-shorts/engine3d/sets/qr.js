// Sets for Tech Shorts episode 8: How QR Codes Actually Work (lively style).
import { common } from './common.js';

export function register(K) {
  const { THREE, BUILD, C, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, rrect, label, sign, textSign, sprite, stage, aim,
    makeBit, hop, pedestal, sparkles, clamp, lerp, seg, ease, pop, frac, V, rng, MONO } = K;
  const { makePhone } = common(K);
  const popIn = (t, at, sp = 5) => t > at ? Math.min(1.08, pop((t - at) * sp)) : 0;
  const soft = { top: '#d8ecff', bottom: '#e6dcff', floor: 0xdcd0ff }, warm = { top: '#ffe7c7', bottom: '#ffc4a8', floor: 0xffbfa0 };

  // ---------- a QR code in 3D blocks with the real layout: finders, timing, alignment, format, data ----------
  function layout(N = 25, seed = 7) {
    const r = rng(seed), kind = [], dark = [];
    for (let y = 0; y < N; y++) { kind.push([]); dark.push([]); for (let x = 0; x < N; x++) { kind[y].push('data'); dark[y].push(r() < .5); } }
    const finder = (fx, fy) => { for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) { const X = fx + x, Y = fy + y; if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
      kind[Y][X] = (x < 0 || y < 0 || x > 6 || y > 6) ? 'sep' : 'finder'; const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3)); dark[Y][X] = kind[Y][X] === 'finder' && ring !== 2; } };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    for (let i = 8; i < N - 8; i++) { kind[6][i] = kind[i][6] = 'timing'; dark[6][i] = dark[i][6] = i % 2 === 0; }
    const ax = N - 7, ay = N - 7; for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) { kind[ay + y][ax + x] = 'align'; dark[ay + y][ax + x] = Math.max(Math.abs(x), Math.abs(y)) !== 1; }
    for (let i = 0; i < 9; i++) { [[8, i], [i, 8]].forEach(([x, y]) => { if (kind[y][x] === 'data') { kind[y][x] = 'format'; } }); }
    for (let i = 0; i < 8; i++) { if (kind[8][N - 1 - i] === 'data') kind[8][N - 1 - i] = 'format'; if (kind[N - 1 - i][8] === 'data') kind[N - 1 - i][8] = 'format'; }
    return { N, kind, dark };
  }
  function makeQR(o = {}) {
    const L = layout(o.N ?? 25, o.seed ?? 7), N = L.N, cell = o.cell ?? .115, size = N * cell, g = new THREE.Group();
    g.add(M(RB(size + cell * 4, size + cell * 4, .12, .08), plastic(0xffffff), { pos: [0, 0, -.06] }));
    const im = new THREE.InstancedMesh(new RoundedBoxBox(cell), plastic(0xffffff, { roughness: .25 }), N * N); im.castShadow = true; g.add(im);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
    // fn(x, y, dark, kind, i) -> { h, c, show, dx, dy, dz, rot }
    im.paint = fn => { let i = 0; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++, i++) { const d = L.dark[y][x], k = L.kind[y][x], r = fn(x, y, d, k, i) || {}; const show = r.show ?? d;
      p.set((x - N / 2 + .5) * cell + (r.dx ?? 0), (N / 2 - y - .5) * cell + (r.dy ?? 0), (r.h ?? 1) * cell * .5 + (r.dz ?? 0)); q.setFromEuler(new THREE.Euler(r.rot ?? 0, r.rot ?? 0, 0)); sc.set(show ? 1 : 0, show ? 1 : 0, show ? (r.h ?? 1) : 0);
      m.compose(p, q, sc); im.setMatrixAt(i, m); im.setColorAt(i, col.set(r.c ?? 0x1d2442)); } im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true; };
    im.paint(() => ({})); g.userData = { im, L, cell, size }; return g;
  }
  function RoundedBoxBox(c) { return new THREE.BoxGeometry(c * .92, c * .92, c); }
  const KC = { finder: 0xff4fa3, timing: 0xffc44d, align: 0x9b7bff, format: 0x35c8ef, data: 0x1d2442, sep: 0x1d2442 };
  const cam = (st, s, y = 2.65, z = 8.6) => aim(st.cam, [Math.sin(s * .5) * .9, y + .25, z], [0, y, 0]);

  // ---------- sets ----------
  BUILD.q_hook = () => {
    const st = stage(warm), qr = makeQR(); qr.position.set(0, 2.7, 0); st.scene.add(qr); const { im, L } = qr.userData;
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(.7); st.scene.add(ph);
    const ok = textSign(1.3, .42, 'STILL WORKS', { color: 0x5ce06a, fg: '#14320a', size: 56 }); ok.position.set(0, 4.5, .4); st.scene.add(ok);
    return { ...st, update(t, s) { const rip = ease(seg(t, .1, .4));
      im.paint((x, y, d) => { const torn = x + y > 34 && x > 12 && y > 12; return torn ? { dx: rip * (x - 12) * .03, dy: -rip * 1.2 - rip * (y - 12) * .02, dz: rip * .8, rot: rip * (x * .3) } : {}; });
      ph.position.set(lerp(2.6, 1.1, ease(seg(t, .45, .65))), 1.3, 1.4); ph.rotation.set(-.2, -.4, .1); ok.scale.setScalar(popIn(t, .72)); ok.rotation.z = Math.sin(s * 4) * .04;
      qr.rotation.y = Math.sin(s * .7) * .2; cam(st, s); } };
  };
  BUILD.q_title = (p) => {
    const st = stage({ top: '#ffd1e8', bottom: '#c9b8ff', floor: 0xbfaaf5 }); st.scene.add(pedestal(1.4, 0xffffff, C.pink));
    const qr = makeQR({ cell: .085 }); qr.position.set(0, 1.75, 0); st.scene.add(qr); const { im } = qr.userData;
    const s1 = textSign(3.2, .82, p.top, { color: 0xffffff, fg: '#1d2442', size: 96 }), s2 = textSign(3.3, .72, p.bottom, { color: C.pink, fg: '#ffffff', size: 96 }); s1.position.set(0, 4.65, 0); s2.position.set(0, 3.8, .2); st.scene.add(s1, s2);
    return { ...st, update(t, s) { im.paint((x, y) => ({ h: 1 + Math.max(0, Math.sin(s * 5 - (x + y) * .35)) * 1.5 })); qr.rotation.y = Math.sin(s * 1.1) * .35; qr.position.y = 1.75 + Math.abs(Math.sin(s * 3)) * .08;
      s1.scale.setScalar(pop(s - .05)); s2.scale.setScalar(pop(s - .25)); s1.rotation.z = Math.sin(s * 3) * .03; aim(st.cam, [Math.sin(s * .5), 2.8, 9.4], [0, 2.5, 0]); } };
  };
  function qrFocus(kinds, labelTxt, col, extra) {
    return () => {
      const st = stage(soft), qr = makeQR(); qr.position.set(0, 2.4, 0); st.scene.add(qr); const { im } = qr.userData;
      const lb = textSign(2.2, .44, labelTxt, { color: col, fg: col === C.amber || col === 0x35c8ef ? '#1d2442' : '#ffffff', size: 58 }); lb.position.set(0, 4.5, .4); st.scene.add(lb);
      const ex = extra ? extra(st, qr) : null;
      return { ...st, update(t, s) { const k = seg(t, .1, .3);
        im.paint((x, y, d, kd) => kinds.includes(kd) ? { h: 1 + k * (2 + Math.sin(s * 6 + x * .5) * .5), c: d ? KC[kd] : 0xffffff, show: d } : { c: lerp(0, 1, k) > .5 ? 0xc9cdd8 : 0x1d2442 });
        lb.scale.setScalar(popIn(t, .2)); qr.rotation.y = Math.sin(s * .6) * .25; if (ex) ex(t, s); cam(st, s); } };
    };
  }
  BUILD.q_finders = qrFocus(['finder'], 'FINDER SQUARES', C.pink, (st, qr) => { const ph = makePhone(0xff6fb1); ph.scale.setScalar(.6); st.scene.add(ph); const rings = [0, 1, 2].map(() => { const r = M(new THREE.TorusGeometry(.55, .03, 8, 48), glowM(C.pink, 3), { shadow: false }); st.scene.add(r); return r; });
    const pos = [[-1.035, 3.435], [1.035, 3.435], [-1.035, 1.365]]; return (t, s) => { rings.forEach((r, i) => { r.position.set(pos[i][0], pos[i][1], .4); r.scale.setScalar(t > .4 + i * .1 ? 1 + Math.sin(s * 6) * .08 : 0); }); ph.position.set(1.4, 1.2, 1.6); ph.rotation.set(-.2, -.5, Math.sin(s * 2) * .2); }; });
  BUILD.q_timing = qrFocus(['timing'], 'TIMING RULER', C.amber, null);
  BUILD.q_align = qrFocus(['align'], 'ALIGNMENT SQUARE', C.violet, null);
  BUILD.q_format = qrFocus(['format'], 'FORMAT INFO', 0x35c8ef, null);
  BUILD.q_bits = () => {
    const st = stage(soft), qr = makeQR({ cell: .3, N: 25 }); qr.position.set(1.2, 2.2, 0); st.scene.add(qr); const { im } = qr.userData;
    const one = textSign(.7, .7, '1', { color: 0x1d2442, fg: '#ffffff', size: 140, font: MONO }), zero = textSign(.7, .7, '0', { color: 0xffffff, fg: '#1d2442', size: 140, font: MONO }); st.scene.add(one, zero);
    const l1 = textSign(1.2, .38, 'DARK = 1', { color: 0x1d2442, fg: '#fff', size: 56 }), l0 = textSign(1.2, .38, 'LIGHT = 0', { color: 0xffffff, fg: '#1d2442', size: 56 }); st.scene.add(l1, l0);
    return { ...st, update(t, s) { im.paint((x, y) => ({ h: 1 + (x === 10 && y === 10 ? 2 * Math.abs(Math.sin(s * 3)) : 0) }));
      one.position.set(-.9, 3.6, .8); zero.position.set(-.9, 2.3, .8); l1.position.set(-.9, 4.3, .8); l0.position.set(-.9, 1.6, .8);
      [one, l1].forEach(g => g.scale.setScalar(popIn(t, .2))); [zero, l0].forEach(g => g.scale.setScalar(popIn(t, .45))); one.rotation.y = Math.sin(s * 2) * .3; zero.rotation.y = -Math.sin(s * 2) * .3;
      aim(st.cam, [Math.sin(s * .5) * .5, 3.0, 8.0], [0, 2.75, 0]); } };
  };
  BUILD.q_bytes = () => {
    const st = stage(soft), qr = makeQR(); qr.position.set(0, 2.9, 0); st.scene.add(qr); const { im, L, cell } = qr.userData, N = L.N;
    const order = []; for (let col = N - 1; col > 0; col -= 2) { if (col === 6) col--; const up = ((N - 1 - col) / 2) % 2 === 0; for (let k = 0; k < N; k++) { const y = up ? N - 1 - k : k; [col, col - 1].forEach(x => { if (L.kind[y][x] === 'data') order.push([x, y]); }); } }
    const pts = order.slice(0, 120).map(([x, y]) => V((x - N / 2 + .5) * cell, (N / 2 - y - .5) * cell + 2.9, .3)), cur = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0);
    const path = M(new THREE.TubeGeometry(cur, 600, .025, 6), glowM(C.lime, 2.5), { shadow: false }); st.scene.add(path);
    const word = sign(2.6, .6, () => {}, { color: 0xffffff }); word.position.set(0, .95, 1.2); st.scene.add(word);
    const txt = 'example.com';
    return { ...st, update(t, s) { const k = seg(t, .05, .9), n = Math.floor(k * 120); path.geometry.setDrawRange(0, Math.floor(k * path.geometry.index.count / 6) * 6);
      const hot = new Set(order.slice(Math.max(0, n - 8), n).map(([x, y]) => x + ',' + y)); im.paint((x, y) => hot.has(x + ',' + y) ? { h: 3, c: C.lime, show: true } : {});
      word.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, txt.slice(0, Math.floor(k * txt.length + .5)) + (Math.floor(s * 3) % 2 ? '_' : ''), w / 2, h / 2 + 4, h * .55, '#1d2442', 800, 'center', MONO); }); word.scale.setScalar(popIn(t, .05));
      cam(st, s, 2.75); } };
  };
  BUILD.q_errors = () => {
    const st = stage(soft), qr = makeQR(); qr.position.set(0, 2.6, 0); st.scene.add(qr); const { im } = qr.userData;
    const lb = textSign(2.4, .44, 'ERROR CORRECTION', { color: 0x5ce06a, fg: '#14320a', size: 56 }); lb.position.set(0, 4.5, .4); st.scene.add(lb);
    return { ...st, update(t, s) { const k = seg(t, .15, .4); im.paint((x, y, d, kd) => kd === 'data' && (x * 7 + y * 3) % 5 < 2 ? { c: k > .5 ? 0x3cc85a : 0x1d2442, h: 1 + k * (1.2 + Math.sin(s * 5 + x) * .4) } : {});
      lb.scale.setScalar(popIn(t, .2)); qr.rotation.y = Math.sin(s * .6) * .25; cam(st, s); } };
  };
  BUILD.q_torn = () => {
    const st = stage(warm), qr = makeQR(); qr.position.set(0, 2.6, 0); st.scene.add(qr); const { im } = qr.userData;
    const pct = sign(1.6, .52, () => {}, { color: 0xffffff }); pct.position.set(0, 4.5, .4); st.scene.add(pct);
    const blot = M(new THREE.CircleGeometry(.7, 32), matte(0x8a5a3c), { pos: [-.6, 2.0, .3], shadow: false }); st.scene.add(blot);
    const ok = textSign(.5, .5, '✓', { color: 0x3cc85a, fg: '#fff', size: 110 }); ok.position.set(1.4, 1.1, .8); st.scene.add(ok);
    return { ...st, update(t, s) { const rip = ease(seg(t, .1, .35)), cov = ease(seg(t, .3, .5)), scr = seg(t, .5, .7);
      im.paint((x, y) => { if (x > 16 && y < 9 && x + (8 - y) > 18) return { dx: rip * 1.5, dy: rip * 1.4, dz: rip, rot: rip * 2 }; if (y > 20 && x > 10 && x < 15 && scr > (x - 10) / 5) return { show: false }; return {}; });
      blot.scale.setScalar(Math.max(.01, cov)); pct.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, '~' + Math.round(lerp(0, 30, ease(seg(t, .1, .7)))) + '% damaged', w / 2, h / 2 + 4, h * .46, '#d42f7f', 900, 'center', MONO); }); pct.scale.setScalar(popIn(t, .1));
      ok.scale.setScalar(popIn(t, .75)); ok.rotation.z = Math.sin(s * 5) * .1; cam(st, s); } };
  };
  BUILD.q_logo = () => {
    const st = stage(soft), qr = makeQR(); qr.position.set(0, 2.6, 0); st.scene.add(qr); const { im } = qr.userData;
    const logo = G(M(RB(1.0, 1.0, .3, .25), plastic(C.pink), {}), M(SPH(.22, 20, 14), plastic(0xffffff), { pos: [0, 0, .2] })); logo.position.set(0, 2.6, .25); st.scene.add(logo);
    const ph = makePhone(0x9b7bff); ph.scale.setScalar(.6); ph.position.set(1.3, 1.1, 1.6); ph.rotation.set(-.2, -.5, 0); st.scene.add(ph);
    return { ...st, update(t, s) { const k = Math.min(1.05, pop((t - .1) * 4)); im.paint((x, y) => Math.abs(x - 12) < 4 && Math.abs(y - 12) < 4 ? { show: k < .3 } : {}); logo.scale.setScalar(Math.max(.001, k)); logo.rotation.y = Math.sin(s * 3) * .4;
      ph.position.y = 1.1 + Math.abs(Math.sin(s * 4)) * .1; cam(st, s); } };
  };
  BUILD.q_mask = () => {
    const st = stage(soft), qr = makeQR(); qr.position.set(0, 2.55, 0); st.scene.add(qr); const { im } = qr.userData;
    const lb = sign(2.0, .46, () => {}, { color: 0xffffff }); lb.position.set(0, 4.5, .4); st.scene.add(lb);
    const bit = makeBit(); bit.scale.setScalar(.4); bit.position.set(1.4, 0, 1.6); bit.rotation.y = -.5; st.scene.add(bit);
    return { ...st, update(t, s) { const blocky = t < .3, mk = Math.min(7, Math.floor(seg(t, .3, .9) * 8));
      im.paint((x, y, d, kd) => { if (kd !== 'data') return {}; if (blocky) { const b = (Math.floor(x / 5) + Math.floor(y / 5)) % 2 === 0; return { show: b, c: b ? 0x1d2442 : 0xffffff }; }
        const masks = [(x + y) % 2, y % 2, x % 3, (x + y) % 3, (Math.floor(y / 2) + Math.floor(x / 3)) % 2, (x * y) % 2 + (x * y) % 3, ((x * y) % 2 + (x * y) % 3) % 2, ((x + y) % 2 + (x * y) % 3) % 2]; const m = masks[mk] === 0;
        return { show: d !== m, c: m ? 0x9b7bff : 0x1d2442, h: 1 + (m ? .6 : 0) }; });
      lb.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, blocky ? 'TOO BLOCKY' : 'MASK ' + (mk + 1) + ' / 8', w / 2, h / 2 + 4, h * .55, blocky ? '#d42f2f' : '#6b4fd8', 900, 'center', MONO); }); lb.scale.setScalar(popIn(t, .05));
      bit.pose({ s, sad: blocky ? .8 : 0, happy: blocky ? 0 : .8, lookY: -.4 }); cam(st, s); } };
  };
  BUILD.q_unmask = () => {
    const st = stage(soft), qr = makeQR(); qr.position.set(-.1, 2.9, -.6); qr.scale.setScalar(.8); st.scene.add(qr); const { im } = qr.userData;
    const ph = makePhone(0xff6fb1); ph.scale.setScalar(.9); ph.position.set(.5, 1.6, 1.2); ph.rotation.set(-.1, -.3, 0); st.scene.add(ph);
    const beam = M(new THREE.ConeGeometry(.9, 2.0, 32, 1, true), new THREE.MeshBasicMaterial({ color: C.lime, transparent: true, opacity: .15, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }), { shadow: false }); beam.position.set(.2, 2.3, .3); beam.rotation.set(Math.PI / 2 + .5, 0, .3); st.scene.add(beam);
    return { ...st, update(t, s) { const un = seg(t, .2, .7); im.paint((x, y, d, kd) => kd !== 'data' ? {} : (((x + y) % 2 === 0) && frac(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) > un ? { show: !d, c: 0x9b7bff } : {})); beam.material.opacity = .12 + Math.sin(s * 8) * .05;
      ph.rotation.z = Math.sin(s * 2) * .05; aim(st.cam, [Math.sin(s * .5) * .6, 2.9, 8.4], [0, 2.6, 0]); } };
  };
  BUILD.q_sizes = () => {
    const st = stage(warm), small = makeQR({ N: 21, cell: .07, seed: 3 }), big = makeQR({ N: 57, cell: .055, seed: 9 }); small.position.set(-1.2, 3.4, 0); big.position.set(.45, 2.3, -.3); st.scene.add(small, big);
    const l1 = textSign(1.0, .38, '21 × 21', { color: 0xffffff, fg: '#1d2442', size: 60, font: MONO }), l2 = textSign(1.3, .38, 'up to 177 × 177', { color: C.amber, fg: '#3a2400', size: 50, font: MONO }); l1.position.set(-1.2, 4.45, .3); l2.position.set(.45, .55, .9); st.scene.add(l1, l2);
    return { ...st, update(t, s) { small.scale.setScalar(popIn(t, .05)); big.scale.setScalar(popIn(t, .3)); small.rotation.y = Math.sin(s) * .3; big.rotation.y = Math.sin(s * .8 + 1) * .2;
      big.userData.im.paint((x, y) => ({ h: 1 + Math.max(0, Math.sin(s * 4 - (x + y) * .2)) })); l1.scale.setScalar(popIn(t, .15)); l2.scale.setScalar(popIn(t, .45)); aim(st.cam, [0, 2.8, 8.8], [0, 2.5, 0]); } };
  };
  BUILD.q_safe = () => {
    const st = stage(soft), qr = makeQR({ cell: .09 }); qr.position.set(-.9, 3.8, -.5); st.scene.add(qr);
    const ph = new THREE.Group(); ph.position.set(.3, 2.2, .6); st.scene.add(ph); ph.add(M(RB(1.6, 3.0, .2, .26), plastic(0xff6fb1)));
    const scr = ctex(400, 760); ph.add(M(new THREE.PlaneGeometry(1.42, 2.7), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }), { pos: [0, 0, .105], shadow: false }));
    const warn = textSign(1.9, .44, 'CHECK THE LINK', { color: C.amber, fg: '#3a2400', size: 58 }); warn.position.set(.3, .3, 1.3); st.scene.add(warn);
    return { ...st, update(t, s) { const k = seg(t, .1, .3);
      scr.redraw((x, w, h) => { x.fillStyle = '#141a2c'; x.fillRect(0, 0, w, h); if (k > 0) { rrect(x, 30, 260, w - 60, 220, 30); x.fillStyle = '#ffffff'; x.fill(); label(x, 'Open link?', w / 2, 320, 40, '#1d2442', 900);
        label(x, t > .55 ? 'examp1e-c0m.biz' : 'example.com', w / 2, 390, 34, t > .55 ? '#d42f2f' : '#2b7bff', 700, 'center', MONO); } });
      ph.rotation.set(-.1, -.2 + Math.sin(s) * .1, 0); warn.scale.setScalar(popIn(t, .6)); warn.rotation.z = Math.sin(s * 6) * .05; aim(st.cam, [0, 2.8, 8.6], [0, 2.5, 0]); } };
  };
  BUILD.q_origin = () => {
    const st = stage(warm), box = G(M(RB(1.6, 1.1, 1.2, .08), matte(0xd9a066)), M(RB(1.62, .14, 1.22, .03), matte(0xc48a50), { pos: [0, .3, 0] })); box.position.set(.5, .55, .4); st.scene.add(box);
    const qr = makeQR({ cell: .035 }); qr.position.set(.5, .55, 1.03); st.scene.add(qr);
    const gear = M(new THREE.TorusGeometry(.6, .2, 8, 12), metal(0x9aa3bd), {}); gear.position.set(-1.0, 2.6, -.4); st.scene.add(gear);
    const car = G(M(RB(1.6, .5, .8, .2), plastic(C.red)), M(RB(.9, .4, .75, .15), plastic(0xff8a8a), { pos: [-.1, .4, 0] }), ...[-1, 1].flatMap(a => [-1, 1].map(b => M(new THREE.CylinderGeometry(.18, .18, .12, 20), plastic(0x2a3046), { pos: [a * .55, -.25, b * .42], rot: [Math.PI / 2, 0, 0] })))); car.position.set(.6, 3.2, -.6); st.scene.add(car);
    const yr = textSign(1.2, .5, '1994', { color: C.amber, fg: '#3a2400', size: 90, font: MONO }); yr.position.set(-.6, 4.6, .3); st.scene.add(yr);
    return { ...st, update(t, s) { gear.rotation.z = s; car.position.x = .6 + Math.sin(s * 1.5) * .3; car.rotation.y = Math.sin(s * .8) * .3; yr.scale.setScalar(popIn(t, .1)); qr.scale.setScalar(popIn(t, .4)); box.rotation.y = Math.sin(s * .6) * .1;
      aim(st.cam, [Math.sin(s * .5) * .6, 2.8, 8.4], [0, 2.3, 0]); } };
  };
}
