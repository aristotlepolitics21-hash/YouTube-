// Sets for Body Shorts episode 2: The Danger Triangle of Your Face.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, matte, glowM, sprite, clamp, lerp, seg, ease, frac, V } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, tube, vessel, flow, germ, brain, facePt, pimple, makeDoctor, mirror, pills, check, warnSign } = B;
  const girl = { skin: 0xe8b48f, shirt: 0xff7a59, hair: 0x2a1a12, hairStyle: 'long', eye: 0x3a2a1a };
  const RED = 0xff3b4e, VEIN = 0x6a5cff;
  const PIM = [.15, -.12]; // pimple spot on the face, beside the nose
  // the triangle drawn on the face as a glowing outline (head-local); draw(k) reveals it
  function faceTriangle(head) {
    const corners = [[0, .2], [.22, -.3], [-.22, -.3]], pts = [];
    for (let e = 0; e < 3; e++) { const a = corners[e], b = corners[(e + 1) % 3]; for (let i = 0; i < 12; i++) { const u = i / 12; pts.push(facePt(lerp(a[0], b[0], u), lerp(a[1], b[1], u), .03)); } }
    pts.push(pts[0].clone()); const cur = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .1);
    const line = M(new THREE.TubeGeometry(cur, 120, .018, 8), glowM(RED, 2.4), { shadow: false }); line.geometry.setDrawRange(0, 0); head.add(line);
    const fill = M(new THREE.ShapeGeometry(new THREE.Shape(corners.map(([x, y]) => new THREE.Vector2(x, y)))), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0, depthWrite: false, toneMapped: false }), { shadow: false });
    fill.position.z = .6; head.add(fill);
    const dots = corners.map(([x, y]) => { const d = M(SPH(.035, 16, 12), glowM(0xffffff, 3), { shadow: false }); d.position.copy(facePt(x, y, .04)); head.add(d); return d; });
    return { draw(k, f = 0) { line.geometry.setDrawRange(0, Math.floor(clamp(k) * line.geometry.index.count / 6) * 6); fill.material.opacity = f * .22; dots.forEach((d, i) => d.scale.setScalar(clamp(k * 3 - i))); } };
  }
  const addPimple = (who, s = 1) => { const p = pimple(s); p.position.copy(facePt(PIM[0], PIM[1], .005)); p.lookAt(p.position.clone().multiplyScalar(2)); who.userData.head.add(p); return p; };
  // veins from the triangle back to the sinus behind the eyes (person-local), and the sinus itself
  const SINUS = V(0, 2.64, .02);
  const veinPts = d => [[d * .16, 2.5, .58], [d * .2, 2.66, .52], [d * .2, 2.78, .4], [d * .12, 2.72, .2], [SINUS.x + d * .03, SINUS.y, SINUS.z]];
  function headInside(who) { const I = who.userData.inner, br = brain(.95); br.position.set(0, 2.82, -.08); I.add(br);
    const vs = [-1, 1].map(d => { const v = vessel(veinPts(d), .028, VEIN); I.add(v); return v; });
    const sinus = M(SPH(.1, 24, 16), glowM(0x9b7bff, 1.2), { pos: [SINUS.x, SINUS.y, SINUS.z], scale: [1.6, .8, 1] }); I.add(sinus); return { br, vs, sinus }; }

  BUILD.dt_hook = (p) => {
    const st = set('lilac'), who = makePerson(girl); st.scene.add(who); const tri = faceTriangle(who.userData.head);
    const ts = hud(st, titleSigns(p.top, p.bottom), .66, 0, .86);
    return { ...st, update(t, s) { who.pose({ s, smile: .5, look: [0, 0] }); tri.draw(ease(seg(t, .15, .7)), ease(seg(t, .6, .8)) * (.7 + Math.sin(s * 6) * .3)); ts.update(t, s); orbit(st, s, [0, 2.75, 0], 4.4, .1); } };
  };
  BUILD.dt_map = () => {
    const st = set('lilac'), who = makePerson(girl); st.scene.add(who); const tri = faceTriangle(who.userData.head);
    const l1 = hud(st, tag('BRIDGE OF NOSE', 0xffffff, '#1d2442', 2.6, .42), .55, 0, .6), l2 = hud(st, tag('MOUTH CORNERS', RED, '#ffffff', 2.6, .42), -.25, 0, .6);
    return { ...st, update(t, s) { who.pose({ s, smile: .3 }); tri.draw(ease(seg(t, .05, .8)), seg(t, .8, .95)); l1.scale.setScalar(popIn(t, .08)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [Math.sin(s * .4) * .4, 2.75, 2.7], [0, 2.62, 0]); } };
  };
  BUILD.dt_pimple = () => {
    const st = set('warm'), who = makePerson(girl); st.scene.add(who); const pm = addPimple(who, 1); const tri = faceTriangle(who.userData.head);
    const no = hud(st, tag("DON'T POP", RED, '#ffffff', 2.0, .55), .58, 0, .55);
    return { ...st, update(t, s) { const k = seg(t, .15, .45), sq = Math.max(0, Math.sin(clamp((t - .45) / .4) * Math.PI * 3)) * seg(t, .45, .5);
      who.pose({ s, handR: reach([.34, 2.58, .62], k), handL: reach([-.06, 2.6, .76], k, -1), poleR: [1, -.5, 0], poleL: [-1, -.5, 0], squint: .3, brow: -.3, smile: -.1, look: [.4, -.3] });
      pm.scale.set(1 + sq * .25, 1 - sq * .15, 1 + sq * .3); tri.draw(1, .4 + Math.sin(s * 8) * .3); no.scale.setScalar(popIn(t, .55)); no.rotation.z = -.1;
      shoot(st, [.7, 2.8, 2.9], [.08, 2.6, 0]); } };
  };
  BUILD.dt_veins = () => {
    const st = set('xray'), who = makePerson(girl); st.scene.add(who); const { vs, sinus } = headInside(who); const tri = faceTriangle(who.userData.head);
    const fl = vs.map(v => { const f = flow(v.userData.curve, 8, 0xa8a0ff, .03, .5, true); f.userData.xr = false; who.userData.inner.add(f); return f; });
    const lb = hud(st, tag('CAVERNOUS SINUS', 0x9b7bff, '#ffffff', 2.8, .44), .6, 0, .66);
    const halo = sprite(0x9b7bff, .9, 0); halo.position.copy(SINUS); who.add(halo);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, smile: .2 }); tri.draw(1, .3); fl.forEach(f => f.update(s, seg(t, .2, .35), -1));
      const hk = seg(t, .45, .6); sinus.material.emissiveIntensity = 1.2 + hk * 2 + Math.sin(s * 6) * .5 * hk; halo.material.opacity = hk * .8; lb.scale.setScalar(popIn(t, .5));
      shoot(st, [lerp(2.2, 1.6, t), 3.0, 2.6], [0, 2.68, .1]); } };
  };
  BUILD.dt_push = () => {
    const st = set('flesh', { fogNear: 12, fogFar: 40 });
    const skin = M(RB(7, .6, 3, .05), B.skinM(0xe8b48f), { pos: [0, 3.0, -1.5] }), fat = M(RB(7, 1.4, 3, .05), matte(0xffd28a), { pos: [0, 2.0, -1.5] }), deep = M(RB(7, 1.6, 3, .05), matte(0xc84a5c), { pos: [0, .5, -1.5] });
    st.scene.add(skin, fat, deep);
    const bump = M(SPH(.8, 48, 32), plastic(0xe0505a, { roughness: .45 }), { pos: [0, 3.2, 0], scale: [1, .55, 1] }), head_ = M(SPH(.32, 32, 20), plastic(0xfff3d6), { pos: [0, 3.55, 0] }); st.scene.add(bump, head_);
    const sac = M(SPH(.75, 40, 28), matte(0xfff0c8, { transparent: true, opacity: .75 }), { pos: [0, 2.8, 0], scale: [1, .8, .8] }); st.scene.add(sac);
    const vein = vessel([[-4, 1.0, 0], [-1, .95, 0], [1, 1.05, 0], [4, 1.0, 0]], .32, VEIN); st.scene.add(vein);
    const gs = [0, 1, 2, 3, 4].map(i => { const g = germ(0x7ad94a, { seed: i }); g.scale.setScalar(.6); st.scene.add(g); return g; });
    const fingers = [-1, 1].map(d => { const f = M(new THREE.CapsuleGeometry(.5, 1.6, 10, 24), B.skinM(0xe8b48f), { rot: [0, 0, d * .5] }); st.scene.add(f); return f; });
    const lb = hud(st, tag('BACTERIA', 0x7ad94a, '#14320a', 1.8, .46), .6, 0, .5);
    return { ...st, update(t, s) { const sq = ease(seg(t, .15, .4)), go = seg(t, .35, .95);
      fingers.forEach((f, i) => { const d = i ? 1 : -1; f.position.set(d * lerp(2.6, 1.15, sq), 4.1 - sq * .3, 0); });
      bump.scale.set(1 - sq * .25, .55 + sq * .2, 1 - sq * .2); sac.scale.set(1 - sq * .2, .8 + sq * .1, .8);
      gs.forEach((g, i) => { const ph = clamp(go * 1.6 - i * .15), down = ease(clamp(ph * 2)), along = clamp(ph * 2 - 1);
        g.position.set(along > 0 ? -.3 + i * .25 + along * 3.5 : (i - 2) * .22, lerp(2.85 + (i % 2) * .15, 1.0, down), .45); g.wiggle(s + i); });
      lb.scale.setScalar(popIn(t, .05)); shoot(st, [1.2, 3.2, 7.0], [0, 2.2, 0]); } };
  };
  BUILD.dt_travel = () => {
    const st = set('xray'), who = makePerson(girl); st.scene.add(who); const { vs, sinus } = headInside(who); who.xray(1);
    const fl = vs.map(v => { const f = flow(v.userData.curve, 6, 0x7ad94a, .045, .35, true); f.userData.xr = false; who.userData.inner.add(f); return f; });
    const clot = M(SPH(.12, 24, 16), plastic(0x8a0f1e, { roughness: .5 }), { pos: [SINUS.x, SINUS.y, SINUS.z] }); clot.userData.xr = false; who.userData.inner.add(clot);
    const halo = sprite(RED, 1.1, 0); halo.position.copy(SINUS); who.add(halo);
    const w = hud(st, warnSign(1), .55, -.45, .24); w.userData.w = 1.1; const lb = hud(st, tag('CLOT', RED, '#ffffff', 1.3, .46), .55, .3, .32);
    return { ...st, update(t, s) { who.xray(1); who.pose({ s, smile: -.3, brow: .6, squint: .2 }); fl.forEach(f => f.update(s, 1, -1));
      const hk = ease(seg(t, .5, .75)); sinus.material.emissive.setHex(hk > .3 ? RED : 0x9b7bff); sinus.material.emissiveIntensity = 1.5 + hk * 2 * (Math.sin(s * 8) * .5 + .5); clot.scale.setScalar(hk); halo.material.opacity = hk * .9;
      w.scale.setScalar(popIn(t, .55)); lb.scale.setScalar(popIn(t, .62)); shoot(st, [lerp(-1.4, -1.8, t), 3.0, 2.8], [0, 2.66, .1]); } };
  };
  BUILD.dt_doctor = () => {
    const st = set('clinic'), who = makePerson(girl); who.position.set(-.85, 0, 0); who.rotation.y = .5; st.scene.add(who); addPimple(who, 1.2);
    const doc = makeDoctor(); doc.position.set(.95, 0, -.3); doc.rotation.y = -.55; st.scene.add(doc);
    const bottle = pills(); bottle.position.set(.25, 2.0, .9); st.scene.add(bottle);
    const lb = hud(st, tag('SEE A DOCTOR', 0x3cc85a, '#ffffff', 2.4, .5), .6, 0, .6);
    return { ...st, update(t, s) { who.pose({ s, smile: .1, brow: .4, handR: reach('cheek', seg(t, .1, .3)) }); doc.pose({ s, smile: .6, handR: reach([.5, 2.0, .9], seg(t, .4, .55)), headTilt: .1 });
      bottle.position.set(lerp(1.6, .45, ease(seg(t, .4, .55))), 2.0 + Math.sin(s * 3) * .03, .55); bottle.scale.setScalar(popIn(t, .4)); lb.scale.setScalar(popIn(t, .1));
      orbit(st, s, [0, 2.2, 0], 6.8, .4); } };
  };
  BUILD.dt_leave = () => {
    const st = set('mint'), who = makePerson(girl); who.position.set(.3, 0, 0); who.rotation.y = -.45; st.scene.add(who); addPimple(who, .9);
    const mr = mirror(1.4, 2.4); mr.position.set(-1.5, 2.5, .7); mr.rotation.y = 1.0; st.scene.add(mr);
    const ok = hud(st, check(true), .55, .45, .2);
    return { ...st, update(t, s) { who.pose({ s, smile: lerp(-.2, .9, seg(t, .3, .5)), handR: reach('hip', seg(t, .35, .5)), handL: reach('hip', seg(t, .35, .5), -1), headTilt: Math.sin(s * 1.5) * .05 });
      ok.scale.setScalar(popIn(t, .55)); orbit(st, s, [-.2, 2.5, 0], 5.6, .3); } };
  };
}
