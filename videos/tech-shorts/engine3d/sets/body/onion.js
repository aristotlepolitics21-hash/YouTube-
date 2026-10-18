// Sets for Body Shorts episode 9: Why Onions Make You Cry.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, metal, glowM, ctex, sprite, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, table, eyeball, nerve, animal, check, snow, spray } = B;
  const cook = { skin: 0xd9a07a, shirt: 0xffffff, hair: 0x2a1a12, eye: 0x3a2a1a };
  const GAS = 0xd8f07a;
  function onion(s = 1, face = false) { const pts = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI, r = Math.sin(a) * (1 + .25 * Math.cos(a)) * .5; pts.push(new THREE.Vector2(Math.max(.001, r), -Math.cos(a) * .5)); }
    const g = G(M(new THREE.LatheGeometry(pts, 48), plastic(0xc9824a, { roughness: .5 })), M(new THREE.ConeGeometry(.08, .3, 12), plastic(0xc9a26a), { pos: [0, .62, 0] }));
    if (face) { [-1, 1].forEach(d => g.add(M(SPH(.06, 16, 12), plastic(0x15151c), { pos: [d * .15, .05, .44] }))); g.add(M(new THREE.TorusGeometry(.08, .02, 8, 20, Math.PI), plastic(0x15151c), { pos: [0, -.1, .45], rot: [0, 0, Math.PI] })); }
    g.scale.setScalar(s); return g; }
  function knife() { return G(M(RB(.08, .4, 1.4, .02), metal(0xe6eaf2, { roughness: .12 }), { pos: [0, 0, .7] }), M(RB(.14, .3, .6, .06), plastic(0x2a1a12), { pos: [0, .02, -.3] })); }
  const tears = (who) => [-1, 1].map(d => { const sp = spray(18, 0x9fdcff, 3 + d); who.add(sp); return sp; });
  // a sheet of onion cells: each holds two chemicals, kept apart until the cell breaks
  function cells(nx = 5, ny = 4) { const g = new THREE.Group(), list = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const c = new THREE.Group(); c.position.set((i - (nx - 1) / 2) * 1.05, 1.0 + j * 1.05, 0);
      c.add(M(RB(1.0, 1.0, .5, .18), plastic(0xfff3c4, { transparent: true, opacity: .35, roughness: .1, depthWrite: false }), { shadow: false }));
      const a = M(SPH(.2, 16, 12), plastic(0x9b7bff), { pos: [-.22, 0, 0] }), b = M(SPH(.2, 16, 12), plastic(0x5cc46a), { pos: [.22, 0, 0] }), gas = M(SPH(.3, 20, 14), plastic(GAS, { transparent: true, opacity: .6, depthWrite: false }), { shadow: false }); gas.scale.setScalar(0);
      c.add(a, b, gas); c.userData = { a, b, gas, box: c.children[0] }; g.add(c); list.push(c); }
    g.cells = list; g.burst = (c, k, s) => { const { a, b, gas, box } = c.userData; box.scale.setScalar(1 - k * .9); box.visible = k < .95; a.position.x = lerp(-.22, 0, k); b.position.x = lerp(.22, 0, k); a.visible = b.visible = k < .9; gas.scale.setScalar(k > .8 ? 1 + (k - .8) * 2 : 0); gas.position.y = Math.max(0, k - .8) * 4 + Math.sin(s * 3) * .05; }; return g; }

  BUILD.on_hook = (p) => {
    const st = set('warm'), who = makePerson(cook); st.scene.add(who); const tb = table(3, 1.4); tb.position.set(0, -.2, .9); st.scene.add(tb);
    const board = M(RB(1.4, .1, .9, .04), plastic(0xd8a878), { pos: [0, 1.05, .85] }); st.scene.add(board); const on = onion(.8); on.position.set(-.2, 1.42, .85); st.scene.add(on); const kn = knife(); kn.scale.setScalar(.6); st.scene.add(kn);
    const tr = tears(who); const ts = hud(st, titleSigns(p.top, p.bottom, 0xc9824a), .66, 0, .86);
    return { ...st, update(t, s) { const chop = Math.abs(Math.sin(s * 6)); const hand = V(.3, 1.35 + chop * .35, .75); who.pose({ s, handR: hand, poleR: [1, -.3, -.4], handL: reach([-.35, 1.3, .8], 1, 1), squint: .7, brow: .7, smile: -.3, look: [0, -.6] });
      kn.position.copy(hand).add(V(-.1, -.05, .05)); kn.rotation.set(0, -1.4, -.2); tr.forEach((sp, i) => sp.fire(V((i ? 1 : -1) * .22, 2.68, .62), V(0, -1, .25), frac(s * .8 + i * .4)));
      ts.update(t, s); orbit(st, s, [0, 2.2, .4], 5.6, .4); } };
  };
  BUILD.on_cells = () => {
    const st = set('xray'), cs = cells(); st.scene.add(cs); const lb = hud(st, tag('ONION CELLS', 0xc9824a, '#ffffff', 2.2, .48), .62, 0, .52), l2 = hud(st, tag('KEPT APART', 0x9b7bff, '#ffffff', 1.9, .44), -.2, 0, .45);
    return { ...st, update(t, s) { cs.cells.forEach((c, i) => { c.scale.setScalar(popIn(t, i * .02)); c.rotation.y = Math.sin(s + i) * .1; }); lb.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); orbit(st, s, [0, 2.6, 0], 7.4, .3); } };
  };
  BUILD.on_cut = () => {
    const st = set('xray'), cs = cells(); st.scene.add(cs); const kn = knife(); kn.scale.setScalar(3); st.scene.add(kn); const lb = hud(st, tag('GAS!', GAS, '#2a3a00', 1.3, .55), .62, 0, .34);
    return { ...st, update(t, s) { const k = ease(seg(t, .05, .45)); kn.position.set(0, lerp(6.5, .4, k), 1.0); kn.rotation.set(0, Math.PI / 2, -Math.PI / 2);
      cs.cells.forEach(c => { const near = Math.abs(c.position.x) < .9, hit = near ? clamp((t - .05 - (5 - c.position.y) * .07) * 3) : 0; cs.burst(c, hit, s); });
      lb.scale.setScalar(popIn(t, .5)); shoot(st, [0, 3.0, 7.6], [0, 2.6, 0]); } };
  };
  BUILD.on_gas = () => {
    const st = set('warm'), who = makePerson(cook); who.position.set(0, 0, -.6); st.scene.add(who); const tb = table(3, 1.4); tb.position.set(0, -.2, .6); st.scene.add(tb);
    const halves = [-1, 1].map(d => { const o = onion(.7); o.position.set(d * .35, 1.25, .7); o.rotation.z = d * .6; st.scene.add(o); return o; });
    const cur = new THREE.CatmullRomCurve3([V(0, 1.4, .7), V(.3, 1.9, .6), V(-.2, 2.4, .45), V(0, 2.75, .2)]); const wisps = [0, 1, 2, 3, 4, 5].map(() => { const w = sprite(GAS, .5, .7); st.scene.add(w); return w; });
    return { ...st, update(t, s) { wisps.forEach((w, i) => { const u = frac(s * .35 + i / 6); w.position.copy(cur.getPoint(u)).add(V(Math.sin(s * 2 + i) * .15, 0, 0)); w.material.opacity = Math.sin(u * Math.PI) * .7; w.scale.setScalar(.35 + u * .4); });
      const sting = seg(t, .55, .7); who.pose({ s, squint: sting, brow: sting * .8, smile: lerp(.3, -.4, sting), look: [0, -.5] }); orbit(st, s, [0, 2.0, 0], 4.8, .3); } };
  };
  BUILD.on_tears = () => {
    const st = set('lilac'), eye = eyeball(1.2, 0x6b4a2e); eye.position.set(0, 2.6, 0); st.scene.add(eye); const tr = [0, 1, 2].map(i => { const sp = spray(30, 0x9fdcff, i + 2); sp.scale.setScalar(3); st.scene.add(sp); return sp; });
    const nv = nerve([[-.4, 2.3, -1.3], [-1.2, 2.1, -2.0], [-2.4, 2.4, -2.6]], .06); st.scene.add(nv);
    const wisps = [0, 1, 2].map(() => { const w = sprite(GAS, .8, .6); st.scene.add(w); return w; }); const lb = hud(st, tag('STING!', 0xff4a5c, '#ffffff', 1.6, .55), .62, 0, .4);
    return { ...st, update(t, s) { eye.veins(.25); eye.rotation.set(-.15, Math.sin(s) * .1, 0); tr.forEach((sp, i) => sp.fire(V((-.5 + i * .5) / 3, 1.6 / 3, 1.0 / 3), V(0, -1, .3), frac(s * .7 + i * .33) * seg(t, .3, .45)));
      wisps.forEach((w, i) => { const u = frac(s * .3 + i / 3); w.position.set(-1.2 + i * 1.2, .6 + u * 1.8, 1.4); w.material.opacity = Math.sin(u * Math.PI) * .6; }); nv.material.emissiveIntensity = 1.2 + Math.sin(s * 9) * .8;
      lb.scale.setScalar(popIn(t, .2)); shoot(st, [0, 2.7, 5.8], [0, 2.3, 0]); } };
  };
  BUILD.on_defence = () => {
    const st = set('mint'), on = onion(2.0, true); on.position.set(-.8, 1.0, 0); st.scene.add(on); const bun = animal('bunny'); bun.position.set(1.2, 0, .4); bun.rotation.y = -1.1; bun.scale.setScalar(1.3); st.scene.add(bun);
    const tr = spray(16, 0x9fdcff, 7); st.scene.add(tr); const lb = hud(st, tag("ONION'S DEFENCE", 0xc9824a, '#ffffff', 2.8, .48), .6, 0, .66);
    const wisps = [0, 1, 2, 3].map(() => { const w = sprite(GAS, .7, .6); st.scene.add(w); return w; });
    return { ...st, update(t, s) { const back = ease(seg(t, .35, .7)); bun.position.x = 1.2 + back * .8; bun.pose({ s, headNod: .2, mouth: .2 }); on.rotation.y = Math.sin(s * 1.5) * .15;
      wisps.forEach((w, i) => { const u = frac(s * .4 + i / 4); w.position.set(-.4 + u * 1.8, 1.4 + Math.sin(u * 4 + i) * .3, .3); w.material.opacity = Math.sin(u * Math.PI) * .6; });
      tr.fire(V(bun.position.x - .35, 1.4, .9), V(0, -1, .5), frac(s * .8) * seg(t, .3, .4)); lb.scale.setScalar(popIn(t, .1)); orbit(st, s, [.2, 1.3, 0], 6.6, .5); } };
  };
  BUILD.on_tip = () => {
    const st = set('mint'), on = onion(1.5); on.position.set(-.7, 1.2, 0); st.scene.add(on); const kn = knife(); kn.scale.setScalar(1.8); kn.position.set(1.0, 1.6, 0); kn.rotation.set(0, Math.PI / 2, .9); st.scene.add(kn);
    const sn = snow(30, [1.8, 2.4, 1.2]); sn.position.set(-.7, .3, 0); st.scene.add(sn); const glint = sprite(0xffffff, 1.0, 0); st.scene.add(glint);
    const l1 = hud(st, tag('CHILL IT', 0x7fd8ff, '#0b2a40', 1.6, .46), .64, -.15, .38), l2 = hud(st, tag('SHARP KNIFE', 0xffffff, '#1d2442', 2.0, .46), .52, .12, .45), ok = hud(st, check(true), .38, 0, .18);
    return { ...st, update(t, s) { sn.update(s); on.rotation.y = s * .4; const gl = frac(s * .5); glint.position.set(1.0 + Math.cos(.9) * (gl * 2.5 - 1.25), 1.6 + Math.sin(.9) * (gl * 2.5 - 1.25), .3); glint.material.opacity = Math.sin(gl * Math.PI) * .9;
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .35)); ok.scale.setScalar(popIn(t, .7)); orbit(st, s, [0, 1.5, 0], 6.2, .4); } };
  };
}
