// Sets for Body Shorts episode 12: Why Paper Cuts Hurt So Much.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, bigHand, skinSection, nerve, check, bandage, skinM } = B;
  const girl = { skin: 0xffd9bd, shirt: 0x9b7bff, hair: 0xb5652b, hairStyle: 'long', eye: 0x3b6fb0 };
  const SKIN = 0xffd9bd, NV = 0xffd23f;
  const paper = (w = 1.0, h = 1.35) => M(new THREE.PlaneGeometry(w, h), matte(0xffffff, { side: THREE.DoubleSide }), { shadow: false });
  // a long strip of paper edge seen up close: smooth from afar, a saw blade up close
  function sawEdge(len = 8, teeth = 60, seed = 3) { const R = rng(seed), sh = new THREE.Shape(); sh.moveTo(-len / 2, -1); for (let i = 0; i <= teeth; i++) { const x = -len / 2 + i / teeth * len; sh.lineTo(x, (i % 2 ? .12 + R() * .2 : -.05 + R() * .08)); } sh.lineTo(len / 2, -1); sh.lineTo(-len / 2, -1);
    return M(new THREE.ExtrudeGeometry(sh, { depth: .25, bevelEnabled: false }), matte(0xf7f5ee, { roughness: .95 })); }
  // a cut on a finger: a thin red slit that can open up
  function cutMark() { return M(RB(.14, .025, .02, .01), plastic(0xc8283c, { roughness: .3 }), { shadow: false }); }

  BUILD.pc_hook = (p) => {
    const st = set('lilac'), who = makePerson(girl); st.scene.add(who); const pp = paper(); st.scene.add(pp); const ouch = tag('OUCH!', 0xff4a5c, '#ffffff', 1.5, .55); ouch.position.set(.9, 3.4, .6); st.scene.add(ouch);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0x9b7bff), .66, 0, .86);
    return { ...st, update(t, s) { const slide = seg(t, .1, .4), hurt = seg(t, .4, .48); const hl = reach([.35, 1.9, .75], 1, -1); const hr = V(lerp(.1, .55, slide), 2.2 - hurt * .3, .82 - hurt * .1);
      who.pose({ s, handL: hl, poleL: [-1, -.5, -.3], handR: hr, poleR: [1, -.5, -.2], wide: hurt * (1 - seg(t, .6, .8)), squint: seg(t, .6, .8), brow: hurt * .8, mouth: hurt * .5, smile: lerp(.4, -.6, hurt) });
      pp.position.copy(hl).add(V(.2, .05, .25)); pp.rotation.set(-.3, .9, .1); pp.scale.setScalar(.7); ouch.scale.setScalar(popIn(t, .42) * .8); ouch.rotation.z = -.15; ts.update(t, s); orbit(st, s, [0, 2.5, 0], 5.2, .2); } };
  };
  BUILD.pc_nerves = () => {
    const st = set('xray'), h = bigHand({ skin: SKIN }); h.position.set(0, .6, 0); h.scale.setScalar(2.0); h.userData.mat.transparent = true; h.userData.mat.opacity = .45; st.scene.add(h);
    const R = rng(7), n = 220, dots = new THREE.InstancedMesh(SPH(.025, 8, 6), glowM(NV, 2.2), n), m = new THREE.Matrix4(); st.scene.add(dots);
    const tips = [[-.36, .7], [-.12, .8], [.12, .76], [.35, .62]].map(([x, L]) => V(x, 1.02 + L * .92, 0));
    const P = []; for (let i = 0; i < n; i++) { const tip = R() < .78; if (tip) { const tp = tips[i % 4]; P.push(V(tp.x + (R() - .5) * .18, tp.y - R() * .3, (R() - .5) * .18)); } else P.push(V((R() - .5) * .9, .1 + R() * 1.0, (R() - .5) * .3)); }
    const lb = hud(st, tag('NERVE ENDINGS', NV, '#3a2400', 2.6, .48), .62, 0, .62);
    return { ...st, update(t, s) { P.forEach((p, i) => { const k = clamp(t * 4 - i / n * 2) * (1 + Math.sin(s * 6 + i) * .3); m.makeScale(k, k, k).setPosition(p.clone().multiplyScalar(2.0).add(V(0, .6, .45))); dots.setMatrixAt(i, m); }); dots.instanceMatrix.needsUpdate = true;
      lb.scale.setScalar(popIn(t, .35)); shoot(st, [Math.sin(s * .4) * .6, 3.4, 6.6], [0, 3.0, 0]); } };
  };
  BUILD.pc_saw = () => {
    const st = set('night'), e = sawEdge(); e.position.set(0, 2.5, 0); st.scene.add(e); const lens = B.lensRing(1.0); st.scene.add(lens);
    const lb = hud(st, tag('JAGGED, LIKE A SAW', 0xffffff, '#1d2442', 3.0, .46), .6, 0, .72);
    return { ...st, update(t, s) { const z = ease(seg(t, .05, .6)); lens.position.set(0, 2.55, 1.6 - z * .8); lens.scale.setScalar(.6 + z * .6); lens.visible = z < .95; lb.scale.setScalar(popIn(t, .55));
      shoot(st, [lerp(0, .4, z), lerp(2.6, 2.9, z), lerp(14, 3.6, z)], [lerp(0, -.6, z), 2.4, 0]); } };
  };
  BUILD.pc_tear = () => {
    const st = set('flesh'), sk = skinSection({ top: 3.2, skin: SKIN }); st.scene.add(sk); const e = sawEdge(5, 36, 5); e.scale.setScalar(.6); e.rotation.x = Math.PI; st.scene.add(e);
    const R = rng(2), bits = []; for (let i = 0; i < 22; i++) { const b = M(RB(.18, .25 + R() * .25, .3, .03), plastic(0x8a1a2a, { roughness: .6 }), {}); b.position.set(-2.6 + i * .25, 3.0 - R() * .15, .15); b.rotation.z = (R() - .5) * .9; st.scene.add(b); bits.push(b); }
    const lb = hud(st, tag('RIPPED, NOT SLICED', 0xff4a5c, '#ffffff', 3.0, .46), .6, 0, .72);
    return { ...st, update(t, s) { const x = lerp(-4.5, 3.5, ease(seg(t, .05, .75))); e.position.set(x, 3.35, .15); bits.forEach(b => b.visible = b.position.x < x + 1.4); lb.scale.setScalar(popIn(t, .5)); shoot(st, [0, 3.6, 6.2], [0, 2.8, 0]); } };
  };
  BUILD.pc_open = () => {
    const st = set('flesh'), sk = skinSection({ top: 3.2, skin: SKIN }); st.scene.add(sk); const groove = M(RB(4.4, .35, .5, .05), plastic(0x8a1a2a), { pos: [0, 3.1, -.05] }); st.scene.add(groove);
    const ends = [-1.6, -.9, -.2, .5, 1.2, 1.8].map((x, i) => { const n = nerve([[x, 1.6, .2], [x + .1, 2.4, .2], [x - .05, 3.05, .2]], .045); st.scene.add(n); const tip = sprite(0xfff3a0, .45, 1); tip.position.set(x - .05, 3.1, .25); st.scene.add(tip); return [n, tip]; });
    const air = [0, 1, 2, 3].map(i => { const w = sprite(0xdff4ff, .7, .5); st.scene.add(w); return w; }); const drop = M(SPH(.07, 12, 8), plastic(0xc8283c), {}); st.scene.add(drop);
    const l1 = hud(st, tag('BARELY BLEEDS', 0xc8283c, '#ffffff', 2.4, .46), .62, 0, .56), l2 = hud(st, tag('NERVES EXPOSED', NV, '#3a2400', 2.6, .46), .48, 0, .6);
    return { ...st, update(t, s) { ends.forEach(([n, tip], i) => { const f = .6 + .4 * Math.sin(s * 9 + i * 1.3); n.material.emissiveIntensity = 1.4 + f; tip.material.opacity = f * seg(t, .4, .55); });
      air.forEach((w, i) => { const u = frac(s * .3 + i / 4); w.position.set(-2 + u * 4, 3.6 + Math.sin(u * 5 + i) * .2, .5); w.material.opacity = Math.sin(u * Math.PI) * .45; }); drop.position.set(.3, 3.3, .3); drop.scale.setScalar(popIn(t, .15) * .8);
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .5)); shoot(st, [0, 3.8, 5.6], [0, 2.9, 0]); } };
  };
  function handWithCut() { const h = bigHand({ skin: SKIN }); const f = h.userData.fingers[0].userData.b, c = cutMark(); c.position.set(0, .3, .11); f.add(c); h.userData.cut = c; return h; }
  BUILD.pc_flex = () => {
    const st = set('lilac'), h = handWithCut(); h.scale.setScalar(2.2); h.position.set(.4, .4, 0); h.rotation.y = -.3; st.scene.add(h); const lb = hud(st, tag('PULLED OPEN', 0xff4a5c, '#ffffff', 2.1, .5), .62, 0, .5);
    const zap = sprite(0xff6a5c, .8, 0); st.scene.add(zap);
    return { ...st, update(t, s) { const b = Math.max(0, Math.sin(s * 3.2)); h.curl(b * .6, [0]); h.userData.cut.scale.set(1, 1 + b * 5, 1); h.userData.cut.getWorldPosition(zap.position); zap.position.z += .2; zap.material.opacity = b * .7;
      lb.scale.setScalar(popIn(t, .3)); shoot(st, [-.6, 3.0, 8.4], [0, 2.5, 0]); } };
  };
  BUILD.pc_fix = () => {
    const st = set('mint'), h = handWithCut(); h.scale.setScalar(2.2); h.position.set(.4, .4, 0); h.rotation.y = -.3; st.scene.add(h); const bd = bandage(); bd.scale.setScalar(1.15); h.userData.fingers[0].userData.b.add(bd); bd.position.set(0, .3, .12);
    const ok = hud(st, check(true), .55, .38, .2), lb = hud(st, tag('BANDAGE IT', 0xf2c8a0, '#3a2400', 2.0, .5), .58, -.1, .45);
    return { ...st, update(t, s) { bd.scale.setScalar(1.15 * popIn(t, .1)); h.curl(Math.max(0, Math.sin(s * 2)) * .3); h.rotation.z = Math.sin(s * 1.3) * .05; lb.scale.setScalar(popIn(t, .3)); ok.scale.setScalar(popIn(t, .6)); shoot(st, [-.6, 3.0, 8.4], [0, 2.5, 0]); } };
  };
}
