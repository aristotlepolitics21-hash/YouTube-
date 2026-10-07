// Scenes for "How CRISPR Can Rewrite Human DNA" (16:9 long-form).
import {
  THREE, RoundedBoxGeometry, n3, ease, lerp, flesh, displace, baseScene, cam, seg, P, rnd, orbit, finish,
  motes, holoPanel, txt, dnaHelix, cell, bloodCellGeo, xrayBody, dataStream, keyLights,
} from './lib_sci.js';
import { run } from './lib3d.js';

const CYAN = '#57d8ff', RED = '#ff4b5c', GREEN = '#4dff9a', AMBER = '#ffb347', PINK = '#ff7ad9';
const BASES = { A: '#ff5a5a', T: '#ffd23f', G: '#4dd2ff', C: '#5dff8f' };

// Straight ladder DNA along x that can unzip and be cut: returns {group, pairs, setUnzip(a,b,amt), setCut(x,gap)}
function ladder(n = 60, spacing = 0.34, twist = 0.6) {
  const g = new THREE.Group(), pairs = [];
  const back = new THREE.MeshPhysicalMaterial({ color: '#d8e6ff', roughness: 0.3, clearcoat: 1, emissive: '#2a3c66', emissiveIntensity: 0.35 });
  const strandA = [], strandB = [];
  for (let i = 0; i < n; i++) {
    const L = 'ATGC'[Math.floor(rnd(i * 1.7) * 4)], R = { A: 'T', T: 'A', G: 'C', C: 'G' }[L];
    const pg = new THREE.Group(); g.add(pg);
    const mk = (letter) => new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.48, 10), new THREE.MeshPhysicalMaterial({ color: BASES[letter], emissive: BASES[letter], emissiveIntensity: 0.3, roughness: 0.35 }));
    const a = mk(L), b = mk(R); pg.add(a, b);
    const na = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), back), nb = na.clone(); pg.add(na, nb);
    pairs.push({ pg, a, b, na, nb, L, R, x: (i - n / 2) * spacing, ang: i * twist });
    strandA.push(na); strandB.push(nb);
  }
  const state = { unzip: () => 0, cut: null, gap: 0 };
  const layout = (t) => {
    for (const q of pairs) {
      const u = state.unzip(q.x), ang = q.ang + t;
      const off = state.cut !== null ? Math.sign(q.x - state.cut) * state.gap : 0;
      const rA = 0.5 + u * 0.7, rB = 0.5 + u * 0.7;
      q.pg.position.set(q.x + off, 0, 0);
      const ya = Math.cos(ang) * rA, za = Math.sin(ang) * rA, yb = -Math.cos(ang) * rB, zb = -Math.sin(ang) * rB;
      q.na.position.set(0, ya, za); q.nb.position.set(0, yb, zb);
      q.a.position.set(0, ya * 0.5 * (1 - u) + ya * u * 0.75, za * 0.5 * (1 - u) + za * u * 0.75); q.a.lookAt(q.pg.localToWorld(new THREE.Vector3(0, 0, 0)));
      q.a.position.set(0, ya * (0.75 - 0.25 * (1 - u)), za * (0.75 - 0.25 * (1 - u)));
      q.b.position.set(0, yb * (0.75 - 0.25 * (1 - u)), zb * (0.75 - 0.25 * (1 - u)));
      q.a.rotation.set(ang, 0, 0); q.b.rotation.set(ang, 0, 0);
      q.a.scale.y = q.b.scale.y = 1 - u * 0.5;
    }
  };
  return { group: g, pairs, state, layout };
}

// Cas9: bilobed protein blob with an orange guide RNA
function cas9() {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 96, 64);
  displace(geo, (v) => 0.18 * n3(v.x * 2, v.y * 2, v.z * 2) + 0.06 * n3(v.x * 6, v.y * 6, v.z * 6));
  const mat = new THREE.MeshPhysicalMaterial({ color: '#7fb0ff', roughness: 0.45, transmission: 0.35, thickness: 1.5, transparent: true, opacity: 0.8, clearcoat: 0.6 });
  const lobe1 = new THREE.Mesh(geo, mat); lobe1.scale.set(1.1, 0.95, 1); lobe1.position.set(0, 0.85, 0);
  const lobe2 = new THREE.Mesh(geo, mat.clone()); lobe2.material.color.set('#b08aff'); lobe2.scale.set(1, 0.8, 0.95); lobe2.position.set(0.2, -0.85, 0);
  g.add(lobe1, lobe2);
  const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push(new THREE.Vector3(-1.2 + u * 2.6, 0.3 + Math.sin(u * 9) * 0.2, 0.9 + Math.cos(u * 7) * 0.2)); }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.07, 8), new THREE.MeshPhysicalMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.6 })));
  return g;
}

// ---------- scenes ----------
function dna_hero(p) {
  const scene = baseScene('#02040c', 0.02); const camera = cam(38);
  const dna = dnaHelix({ turns: 8, radius: 1.2, pitch: 3.6 }); dna.rotation.z = Math.PI / 2.4; scene.add(dna);
  const m = motes(scene, 500, 30, CYAN, 0.35);
  keyLights(scene, { keyI: 1, hemi: 0.4 });
  const tint = P(p, 'tint', null);
  if (tint) dna.traverse((o) => { if (o.material && o.material.emissive) o.material.emissive.set(tint); });
  const update = (t) => {
    dna.rotation.y = t * 0.8; m.userData.update(t);
    orbit(camera, p, t, { dist0: 18, dist1: 10, el0: 0.12, el1: 0.05, az0: -0.4, az1: 0.2 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.78 });
}

// Streams of A/T/G/C letters on panels — the size of the genome
function genome_scale(p) {
  const scene = baseScene('#02040c', 0.03); const camera = cam(42);
  const panels = [];
  for (let i = 0; i < 9; i++) {
    const col = holoPanel(1.6, 9, (ctx, t, w, h) => {
      ctx.font = '700 36px monospace'; ctx.textAlign = 'center';
      for (let r = 0; r < 60; r++) {
        const L = 'ATGC'[Math.floor(rnd(r * 7 + i * 131 + Math.floor(t * 20)) * 4)];
        ctx.fillStyle = BASES[L]; ctx.globalAlpha = 0.35 + 0.65 * rnd(r + i); ctx.fillText(L, w / 2, ((r * 42 + t * 900 + i * 77) % (h + 60)) - 30);
      }
      ctx.globalAlpha = 1;
    }, { res: 256, frame: false });
    col.position.set((i - 4) * 2.1, 0, -Math.abs(i - 4) * 1.2); scene.add(col); panels.push(col);
  }
  const counter = holoPanel(8, 1.6, (ctx, t, w, h) => txt(ctx, `${Math.floor(3.1e9 * ease(seg(t, 0, 0.85))).toLocaleString()} LETTER PAIRS`, w / 2, h / 2, 110, '#ffffff', 'center', 900), { res: 1600 });
  counter.position.set(0, -3.4, 2); scene.add(counter);
  const update = (t) => { panels.forEach((q) => q.userData.update(t)); counter.userData.update(t); orbit(camera, p, t, { dist0: 10, dist1: 8, el0: 0.05, el1: 0.02, az0: -0.15, az1: 0.15, ty0: -0.8, ty1: -1.0 }); };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.45 });
}

// Bacteriophage landing on a bacterium and injecting DNA
function phageMesh() {
  const g = new THREE.Group();
  const shell = new THREE.MeshPhysicalMaterial({ color: '#c060ff', roughness: 0.3, metalness: 0.2, flatShading: true });
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 0), shell); head.position.y = 1.5; head.scale.y = 1.3; g.add(head);
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16), new THREE.MeshPhysicalMaterial({ color: '#a080d0', roughness: 0.4 })); tail.position.y = 0.4; g.add(tail);
  for (let i = 0; i < 6; i++) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.8, 4, 8), new THREE.MeshPhysicalMaterial({ color: '#d0b0ff' }));
    const a = i / 6 * Math.PI * 2; leg.position.set(Math.cos(a) * 0.35, -0.45, Math.sin(a) * 0.35); leg.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); g.add(leg);
  }
  return g;
}
function virus_bacteria(p) {
  const scene = baseScene('#04100a', 0.03); const camera = cam(36);
  const bac = new THREE.Mesh(new THREE.CapsuleGeometry(2, 5, 24, 64), new THREE.MeshPhysicalMaterial({ color: '#5fbf6f', roughness: 0.4, transmission: 0.3, thickness: 2, clearcoat: 0.6 }));
  bac.rotation.z = Math.PI / 2; bac.position.y = -2.2; scene.add(bac);
  const phages = Array.from({ length: P(p, 'n', 4) }, (_, i) => { const ph = phageMesh(); scene.add(ph); return { ph, x: (i - 1.5) * 1.8, d: rnd(i) }; });
  const inject = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.2, 0), new THREE.Vector3(0.3, -1, 0.2), new THREE.Vector3(-0.2, -1.8, 0), new THREE.Vector3(0.4, -2.6, 0.3)]), 60, 0.05, 8), new THREE.MeshBasicMaterial({ color: AMBER }));
  scene.add(inject);
  keyLights(scene, { keyI: 1.2, hemi: 0.45 });
  const update = (t) => {
    phages.forEach(({ ph, x, d }) => { const land = ease(seg(t, d * 0.3, 0.4 + d * 0.3)); ph.position.set(x, lerp(5, 0.4, land), Math.sin(x) * 0.6); ph.rotation.y = t + x; });
    const k = seg(t, 0.55, 0.9); inject.geometry.setDrawRange(0, Math.floor(inject.geometry.index.count * k / 3) * 3); inject.position.x = phages[1] ? phages[1].x : 0;
    orbit(camera, p, t, { dist0: 15, dist1: 11, el0: 0.2, el1: 0.12, az0: -0.3, az1: 0.2, ty0: 0, ty1: -0.5 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.8 });
}

// CRISPR array: repeats (grey diamonds) alternating with virus spacers (coloured); a new spacer slides in
function crispr_array(p) {
  const scene = baseScene('#02060c', 0.02); const camera = cam(36);
  const g = new THREE.Group(); scene.add(g);
  const blocks = [], spCols = ['#ff5a5a', '#ffd23f', '#4dd2ff', '#5dff8f', '#ff7ad9', '#ffb347'];
  for (let i = 0; i < 6; i++) {
    const rep = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), new THREE.MeshPhysicalMaterial({ color: '#aab4c0', metalness: 0.5, roughness: 0.3 }));
    const sp = new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.5, 0.5, 3, 0.12), new THREE.MeshPhysicalMaterial({ color: spCols[i], emissive: spCols[i], emissiveIntensity: 0.35, roughness: 0.4 }));
    g.add(rep, sp); blocks.push({ rep, sp, i });
  }
  const fresh = new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.5, 0.5, 3, 0.12), new THREE.MeshPhysicalMaterial({ color: '#c060ff', emissive: '#c060ff', emissiveIntensity: 0.8 }));
  g.add(fresh);
  const label = holoPanel(9, 1.2, (ctx, t, w, h) => txt(ctx, P(p, 'label', 'REPEAT · SPACER · REPEAT · SPACER ...'), w / 2, h / 2, 64, '#d8f6ff', 'center', 800), { res: 1600, frame: false });
  label.position.set(0, -2.2, 0); scene.add(label);
  keyLights(scene, { keyI: 1.1, hemi: 0.45 });
  const update = (t) => {
    const ins = p.insert ? ease(seg(t, 0.2, 0.7)) : 0;
    const shift = ins * 2.1;
    fresh.visible = !!p.insert; fresh.position.set(-5.6 + 0.0, lerp(3, 0, ins), 0); fresh.rotation.y = (1 - ins) * 3;
    blocks.forEach(({ rep, sp, i }) => { const x = -4.5 + i * 2.1 + shift; rep.position.set(x - 1.05, 0, 0); sp.position.set(x, 0, 0); rep.rotation.y = t * 2; });
    label.userData.update(t);
    orbit(camera, p, t, { dist0: 14, dist1: 11, el0: 0.15, el1: 0.08, az0: -0.2, az1: 0.2, tx0: 0.5, tx1: 1 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.55 });
}

// Cas9 scanning DNA; mode "scan" (slides & checks) or "cut" (unzip + double-strand cut)
function cas9_scene(p) {
  const scene = baseScene('#02040c', 0.025); const camera = cam(36);
  const L = ladder(70); scene.add(L.group);
  const c = cas9(); scene.add(c);
  const flash = new THREE.PointLight('#ffffff', 0, 8, 1.5); scene.add(flash);
  const wrong = P(p, 'offtarget', false);
  keyLights(scene, { keyI: 1.0, hemi: 0.4 });
  const target = 2.4;
  const update = (t) => {
    const mode = P(p, 'mode', 'scan');
    const x = mode === 'scan' ? lerp(-9, target, ease(seg(t, 0, 0.85))) : target;
    c.position.set(x, 0.2, 0.2);
    const zip = mode === 'cut' ? ease(seg(t, 0.1, 0.45)) : (mode === 'scan' ? ease(seg(t, 0.85, 1)) * 0.6 : 0);
    L.state.unzip = (qx) => zip * Math.exp(-((qx - x) ** 2) / 1.2);
    const cut = mode === 'cut' ? ease(seg(t, 0.5, 0.8)) : 0;
    L.state.cut = cut > 0 ? target + 0.17 : null; L.state.gap = cut * 0.9;
    L.layout(t * 0.6);
    flash.position.set(target, 0, 1); flash.intensity = cut > 0 && cut < 0.4 ? 80 : 0;
    if (wrong) L.pairs.forEach((q) => { const near = Math.abs(q.x - x) < 0.8; q.a.material.emissiveIntensity = near ? 1 + Math.sin(t * 20) : 0.3; });
    orbit(camera, p, t, { dist0: 11, dist1: 8, el0: 0.2, el1: 0.12, az0: 0.3, az1: 0.1, tx0: mode === 'scan' ? -3 : target, tx1: target });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

// Repair after a cut: nhej (ends rejoin with errors) | hdr (green template copied in)
function repair(p) {
  const scene = baseScene('#02040c', 0.025); const camera = cam(36);
  const L = ladder(50); scene.add(L.group);
  const mode = P(p, 'mode', 'nhej');
  const tmpl = dnaHelix({ turns: 1, radius: 0.4, pitch: 2.4, perTurn: 8 }); tmpl.rotation.z = Math.PI / 2;
  tmpl.traverse((o) => { if (o.material && o.material.emissive) { o.material.color.set(GREEN); o.material.emissive.set(GREEN); o.material.emissiveIntensity = 0.6; } });
  scene.add(tmpl); tmpl.visible = mode === 'hdr';
  keyLights(scene, { keyI: 1.0, hemi: 0.4 });
  const update = (t) => {
    const close = ease(seg(t, 0.2, 0.7));
    L.state.cut = 0.17; L.state.gap = (1 - close) * 0.9 + (mode === 'hdr' ? close * 0.6 : 0);
    L.layout(t * 0.5);
    L.pairs.forEach((q) => { const near = Math.abs(q.x) < 0.7; if (near && mode === 'nhej' && close > 0.8) { q.a.material.color.set(RED); q.a.material.emissive.set(RED); q.a.material.emissiveIntensity = 0.8; } });
    tmpl.position.set(0.17, lerp(3, 0, close), 0); tmpl.rotation.x = t * 2;
    orbit(camera, p, t, { dist0: 9, dist1: 7, el0: 0.18, el1: 0.1, az0: -0.3, az1: 0.1 });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

// Base editing: a single letter changes colour (A→G), "pencil not scissors"
function base_edit(p) {
  const scene = baseScene('#02040c', 0.025); const camera = cam(34);
  const L = ladder(40); scene.add(L.group);
  const c = cas9(); c.scale.setScalar(0.8); scene.add(c);
  const pen = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 16), new THREE.MeshPhysicalMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 0.6 }));
  scene.add(pen);
  const tgt = L.pairs[22];
  keyLights(scene, { keyI: 1.0, hemi: 0.4 });
  const update = (t) => {
    L.state.unzip = (qx) => 0.7 * Math.exp(-((qx - tgt.x) ** 2) / 0.6) * ease(seg(t, 0, 0.3));
    L.layout(0.3 + t * 0.2);
    c.position.set(tgt.x, 1.4, 0.4);
    const k = ease(seg(t, 0.4, 0.65));
    const from = new THREE.Color(BASES[P(p, 'from', 'A')]), to = new THREE.Color(BASES[P(p, 'to', 'G')]);
    tgt.a.material.color.copy(from).lerp(to, k); tgt.a.material.emissive.copy(tgt.a.material.color); tgt.a.material.emissiveIntensity = 0.4 + Math.sin(t * 18) * 0.4 * (1 - k) + k * 0.6;
    pen.position.set(tgt.x, 0.9 - k * 0.2, 0.6); pen.rotation.z = Math.PI;
    orbit(camera, p, t, { dist0: 7, dist1: 5, el0: 0.2, el1: 0.12, az0: 0.4, az1: 0.15, tx0: tgt.x, tx1: tgt.x });
  };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.6 });
}

// Normal vs sickle red blood cells in a vessel; mix 0..1 = sickle fraction
function sickleGeo() {
  const sh = new THREE.Shape(); sh.absarc(0, 0, 0.8, 0.3, Math.PI - 0.3, false); sh.absarc(0, -0.25, 0.62, Math.PI - 0.45, 0.45, true);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 6, curveSegments: 32 }); g.center(); return g;
}
function sickle(p) {
  const scene = baseScene('#14030a', 0.04); const camera = cam(42);
  const ng = bloodCellGeo(0.5), sg = sickleGeo();
  const mat = new THREE.MeshPhysicalMaterial({ color: '#c8121e', roughness: 0.35, clearcoat: 0.7, sheen: 0.4, sheenColor: new THREE.Color('#ff6060') });
  const cells = Array.from({ length: 70 }, (_, i) => { const s = rnd(i + 3) < P(p, 'mix', 0); const m = new THREE.Mesh(s ? sg : ng, mat); scene.add(m); return { m, s, x: (rnd(i) - 0.5) * 18, y: (rnd(i + 0.3) - 0.5) * 6, z: (rnd(i + 0.6) - 0.5) * 6 - 2 }; });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 40, 64, 1, true), flesh('#a02a35', 2, { side: THREE.BackSide })); wall.rotation.z = Math.PI / 2; scene.add(wall);
  keyLights(scene, { key: '#ffe0e0', keyI: 1.0, hemi: 0.4 });
  const update = (t) => {
    cells.forEach((c, i) => {
      const speed = c.s ? 0.6 : 3; const x = ((c.x + t * speed * 6 + 9) % 18) - 9;
      const stuck = c.s && P(p, 'jam', false) && x > 2; c.m.position.set(stuck ? 2 + rnd(i) * 1.5 : x, c.y, c.z); c.m.rotation.set(t * 2 + i, i, t);
    });
    orbit(camera, p, t, { dist0: 10, dist1: 8, el0: 0.05, el1: 0.02, az0: 0.2, az1: -0.1 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.75 });
}

// Gene switch diagram: BCL11A switch off → fetal haemoglobin gene on
function gene_switch(p) {
  const scene = baseScene('#02060c'); const camera = cam(36);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    const off = p.edited ? ease(seg(t, 0.2, 0.5)) : 0;
    txt(ctx, 'BCL11A  (the "off switch")', 80, 120, 52, '#d8f6ff');
    ctx.fillStyle = off > 0.5 ? '#3a1a1a' : RED; ctx.beginPath(); ctx.arc(w - 220, 120, 60, 0, Math.PI * 2); ctx.fill();
    txt(ctx, off > 0.5 ? 'OFF' : 'ON', w - 220, 120, 44, '#ffffff', 'center', 900);
    if (off > 0) { ctx.strokeStyle = AMBER; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(60, 60); ctx.lineTo(60 + (w - 400) * off, 180); ctx.stroke(); txt(ctx, 'CRISPR', 80, 220, 40, AMBER, 'left', 900); }
    txt(ctx, 'FETAL HEMOGLOBIN', 80, 420, 58, '#d8f6ff');
    const on = p.edited ? ease(seg(t, 0.45, 0.75)) : 0;
    ctx.fillStyle = on > 0.5 ? GREEN : '#1a2a20'; ctx.beginPath(); ctx.arc(w - 220, 420, 60, 0, Math.PI * 2); ctx.fill();
    txt(ctx, on > 0.5 ? 'ON' : 'OFF', w - 220, 420, 44, on > 0.5 ? '#06121a' : '#7a8a80', 'center', 900);
    txt(ctx, P(p, 'foot', 'after birth, BCL11A turns fetal hemoglobin off'), w / 2, h - 90, 42, '#7fb8d0', 'center', 600);
  }, { res: 1600 });
  scene.add(panel);
  const m = motes(scene, 250, 24, CYAN, 0.25);
  const update = (t) => { panel.userData.update(t); m.userData.update(t); orbit(camera, p, t, { dist0: 10.5, dist1: 9.2, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.45 });
}

// Ex vivo: cells taken out, edited in a dish, returned to the body
function ex_vivo(p) {
  const scene = baseScene('#04080d', 0.025); const camera = cam(38);
  const body = xrayBody({ tint: '#57b8ff', organs: false }); body.position.set(-5, -2, 0); scene.add(body);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.35, 64, 1, true), new THREE.MeshPhysicalMaterial({ color: '#cfe8ff', transmission: 0.9, roughness: 0.05, thickness: 0.2, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  dish.position.set(4, 0, 0); scene.add(dish);
  const cells = Array.from({ length: 16 }, (_, i) => { const c = cell({ r: 0.32, seed: i, color: '#ffb0b8' }); c.position.set(4 + (rnd(i) - 0.5) * 2.6, 0.1, (rnd(i + 0.5) - 0.5) * 2.6); scene.add(c); return c; });
  const out = new THREE.CatmullRomCurve3([new THREE.Vector3(-4.2, 1.2, 0), new THREE.Vector3(-1, 3.5, 0), new THREE.Vector3(2.5, 2.5, 0), new THREE.Vector3(4, 0.4, 0)]);
  const back = new THREE.CatmullRomCurve3([new THREE.Vector3(4, 0.4, 0), new THREE.Vector3(2, -2.5, 0), new THREE.Vector3(-1.5, -2.6, 0), new THREE.Vector3(-4.5, -0.8, 0)]);
  const s1 = dataStream(out, 120, '#ff8a8a', 4), s2 = dataStream(back, 120, GREEN, 4); scene.add(s1, s2);
  keyLights(scene, { keyI: 1.0, hemi: 0.4 });
  const update = (t) => {
    s1.visible = t < 0.45; s2.visible = t > 0.6; s1.userData.update(t, 0.5); s2.userData.update(t, 0.5);
    const edited = ease(seg(t, 0.4, 0.6));
    cells.forEach((c, i) => { c.userData.nucleus.material.emissive.set(edited > rnd(i) ? GREEN : '#7a3cff'); c.userData.nucleus.material.emissiveIntensity = 0.3 + edited * 0.6; c.rotation.y = t + i; });
    orbit(camera, p, t, { dist0: 13, dist1: 11.5, el0: 0.2, el1: 0.15, az0: 0, az1: 0.15, tx0: -0.5, tx1: -0.5 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.55 });
}

// In-body editing: nanoparticles travel through the blood to the liver
function liver_lnp(p) {
  const scene = baseScene('#030a12', 0.03); const camera = cam(32);
  const body = xrayBody(); scene.add(body);
  const liver = body.userData.parts.liver, lp = liver.getWorldPosition(new THREE.Vector3());
  const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-1.3, 1.6, 0.3), new THREE.Vector3(-0.8, 2.4, 0.3), new THREE.Vector3(0, 2.0, 0.3), lp]);
  const s = dataStream(path, 300, PINK, 3); scene.add(s);
  const update = (t) => {
    s.userData.update(t, 0.4);
    liver.material.emissive.set(t > 0.5 ? GREEN : AMBER); liver.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 12);
    body.rotation.y = 0.2 + t * 0.3;
    orbit(camera, p, t, { dist0: 13, dist1: 9, el0: 0.08, el1: 0.05, az0: 0.3, az1: 0.1, ty0: 1.6, ty1: 1.6 });
  };
  return finish(scene, camera, update, { strength: 0.7, threshold: 0.72 });
}

// Big text card
function title_card(p) {
  const scene = baseScene('#03070c'); const camera = cam(36);
  const panel = holoPanel(9, 5, (ctx, t, w, h) => {
    ctx.globalAlpha = seg(t, 0.03, 0.4);
    if (p.big) { txt(ctx, p.big, w / 2, h * 0.42, 260, P(p, 'color', AMBER), 'center', 900); txt(ctx, P(p, 'sub', ''), w / 2, h * 0.75, 56, '#d8f6ff', 'center', 800); }
    else { txt(ctx, P(p, 'year', ''), w / 2, h * 0.25, 120, AMBER, 'center', 900); txt(ctx, P(p, 'title', ''), w / 2, h * 0.52, 70, '#ffffff', 'center', 900); txt(ctx, P(p, 'sub', ''), w / 2, h * 0.72, 46, '#bfe8ff', 'center', 700); }
    ctx.globalAlpha = 1;
  }, { res: 1600 });
  scene.add(panel);
  const m = motes(scene, 300, 24, CYAN, 0.3);
  const update = (t) => { panel.userData.update(t); m.userData.update(t); orbit(camera, p, t, { dist0: 11, dist1: 9.5, el0: 0.04, el1: 0.02, az0: -0.15, az1: 0.12 }); };
  return finish(scene, camera, update, { strength: 0.6, threshold: 0.5 });
}

// Crop field with one glowing edited plant
function crops(p) {
  const scene = baseScene('#0b1a12', 0.03); const camera = cam(40);
  const soil = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: '#3a2a1a', roughness: 1 })); soil.rotation.x = -Math.PI / 2; scene.add(soil);
  const stemM = new THREE.MeshStandardMaterial({ color: '#4a8a3a', roughness: 0.8 }), leafM = new THREE.MeshStandardMaterial({ color: '#5fae4a', roughness: 0.7, side: THREE.DoubleSide });
  const glowM = new THREE.MeshStandardMaterial({ color: '#7dff9a', emissive: '#3aff7a', emissiveIntensity: 0.7, side: THREE.DoubleSide });
  const plants = [];
  for (let i = -8; i <= 8; i++) for (let j = -5; j <= 5; j++) {
    const g = new THREE.Group(); const hero = i === 0 && j === 2;
    const h = 1.2 + rnd(i * 31 + j) * 0.5;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, h, 6), hero ? glowM : stemM); stem.position.y = h / 2; g.add(stem);
    for (let k = 0; k < 4; k++) { const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.18), hero ? glowM : leafM); leaf.position.set(0.2, 0.3 + k * h / 4.5, 0); leaf.rotation.set(0, k * 1.6, -0.5); g.add(leaf); }
    g.position.set(i * 1.1, 0, j * 1.3); scene.add(g); plants.push(g);
  }
  const sun = new THREE.DirectionalLight('#fff0d0', 2.2); sun.position.set(8, 10, 6); scene.add(sun); scene.add(new THREE.HemisphereLight('#bfe0ff', '#3a2a1a', 0.6));
  const update = (t) => { plants.forEach((g, i) => { g.rotation.z = 0.05 * Math.sin(t * 6 + i * 0.3); }); orbit(camera, p, t, { dist0: 14, dist1: 9, el0: 0.35, el1: 0.25, az0: -0.3, az1: 0.1, tz0: 2, tz1: 2.6 }); };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.7 });
}

// Mosquito swarm; gene-drive carriers glow and spread
function mosquitoMesh(m) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.5, 4, 8), m); body.rotation.z = Math.PI / 2; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), m); head.position.x = 0.32; g.add(head);
  const wingM = new THREE.MeshBasicMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.12), wingM); w.position.set(0.05, 0.04, s * 0.18); w.rotation.x = Math.PI / 2; g.add(w); g.userData['w' + s] = w; }
  for (let i = 0; i < 6; i++) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.45, 4), m); leg.position.set(-0.1 + (i % 3) * 0.12, -0.15, (i < 3 ? 1 : -1) * 0.12); leg.rotation.x = (i < 3 ? 1 : -1) * 0.6; g.add(leg); }
  return g;
}
function mosquito(p) {
  const scene = baseScene('#06080c', 0.04); const camera = cam(40);
  const dark = new THREE.MeshPhysicalMaterial({ color: '#3a3430', roughness: 0.5 }), glowM = new THREE.MeshPhysicalMaterial({ color: '#7dff9a', emissive: GREEN, emissiveIntensity: 0.8 });
  const ms = Array.from({ length: 60 }, (_, i) => { const m = mosquitoMesh(dark); scene.add(m); return { m, i, base: new THREE.Vector3((rnd(i) - 0.5) * 12, (rnd(i + 0.3) - 0.5) * 5, (rnd(i + 0.6) - 0.5) * 8) }; });
  const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(15, 7, 10, 6, 3, 4)), new THREE.LineBasicMaterial({ color: '#7fb8d0', transparent: true, opacity: P(p, 'cage', 0) }));
  scene.add(cage);
  keyLights(scene, { keyI: 1.1, hemi: 0.4 });
  const update = (t) => {
    const spread = ease(seg(t, 0.1, 0.9)) * P(p, 'spread', 0), crash = ease(seg(t, 0.5, 1)) * P(p, 'crash', 0);
    ms.forEach(({ m, i, base }) => {
      const carrier = rnd(i + 7) < 0.05 + spread * 0.95;
      m.traverse((o) => { if (o.isMesh && o.material !== m.userData['w1']?.material && o.material !== m.userData['w-1']?.material) o.material = carrier ? glowM : dark; });
      m.visible = rnd(i + 9) > crash;
      m.position.set(base.x + Math.sin(t * 3 + i) * 0.8, base.y + Math.sin(t * 5 + i * 2) * 0.4, base.z + Math.cos(t * 2 + i) * 0.8); m.rotation.y = t * 2 + i;
      m.userData.w1.rotation.y = Math.sin(t * 300 + i) * 0.6; m.userData['w-1'].rotation.y = -Math.sin(t * 300 + i) * 0.6;
    });
    orbit(camera, p, t, { dist0: 16, dist1: 12, el0: 0.15, el1: 0.08, az0: -0.2, az1: 0.25 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.7 });
}

// Early embryo inside its shell, with a micro-needle
function embryo(p) {
  const scene = baseScene('#0a0a10', 0.03); const camera = cam(36);
  const zona = new THREE.Mesh(new THREE.SphereGeometry(3, 96, 64), new THREE.MeshPhysicalMaterial({ color: '#e8f0ff', roughness: 0.2, transmission: 0.85, thickness: 0.6, transparent: true, opacity: 0.45, depthWrite: false }));
  scene.add(zona);
  const blast = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, y = i < 4 ? 0.6 : -0.6; const c = cell({ r: 1.0, color: '#ffd8c8', nucleus: '#9a6aff', seed: i }); c.position.set(Math.cos(a) * 1.1, y, Math.sin(a) * 1.1); scene.add(c); blast.push(c); }
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.12, 7, 24), new THREE.MeshPhysicalMaterial({ color: '#dfe8f2', transmission: 0.8, roughness: 0.05, thickness: 0.2 }));
  needle.rotation.z = Math.PI / 2; scene.add(needle);
  keyLights(scene, { keyI: 1.0, hemi: 0.45 });
  const update = (t) => {
    const k = ease(seg(t, 0.1, 0.5)); needle.position.set(lerp(9, 5.2, k), 0.2, 0.2);
    blast.forEach((c, i) => { c.rotation.y = t + i; c.userData.nucleus.material.emissive.set(t > 0.55 && i % 2 ? AMBER : '#9a6aff'); });
    orbit(camera, p, t, { dist0: 12, dist1: 9, el0: 0.2, el1: 0.12, az0: -0.2, az1: 0.2, tx0: 1, tx1: 1.2 });
  };
  return finish(scene, camera, update, { strength: 0.5, threshold: 0.8 });
}

run({ dna_hero, genome_scale, virus_bacteria, crispr_array, cas9: cas9_scene, repair, base_edit, sickle, gene_switch, ex_vivo, liver_lnp, title_card, crops, mosquito, embryo });
