// Sets for Body Shorts episode 1: What Happens If You Hold In a Sneeze.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, G, plastic, glowM, sign, label, sprite, clamp, lerp, seg, ease, frac, V } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, tube, flow, pulse, eyeball, spray, bed, ivPole, check } = B;
  const guy = { skin: 0xf2c7a5, shirt: 0x3d7bff, hair: 0x3a2418 };
  const AIR = 0x7fe3ff;
  // the airway inside the head and neck, in person-local coordinates
  const airway = () => [[0, 2.62, .62], [0, 2.66, .35], [0, 2.6, .05], [0, 2.35, -.08], [0, 2.05, -.04], [0, 1.75, 0]];
  function gauge() { const g = sign(2.4, .56, () => {}, { color: 0xffffff }); g.userData.w = 2.4; g.set = k => g.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); label(x, 'PRESSURE', w * .25, h / 2 + 3, h * .34, '#1d2442', 900);
    x.fillStyle = '#e6e9f2'; x.beginPath(); x.roundRect(w * .47, h * .3, w * .48, h * .4, h * .2); x.fill(); x.fillStyle = k > .7 ? '#ff4a5c' : k > .4 ? '#ffb020' : '#3cc85a'; x.beginPath(); x.roundRect(w * .47, h * .3, Math.max(h * .4, w * .48 * k), h * .4, h * .2); x.fill(); }); g.set(0); return g; }
  // the sneeze wind-up: ah... ah... (squint, head back, mouth open) then the snap at `at`
  const windUp = (t, at) => { const k = ease(seg(t, .05, at)), snap = seg(t, at, at + .06), rel = seg(t, at + .06, at + .4);
    return { squint: k * (1 - rel), mouth: k * .7 * (1 - snap) + snap * (1 - rel) * .4, headNod: -k * .35 * (1 - snap) + snap * (1 - rel) * .35, brow: k * .6 * (1 - rel), smile: lerp(.4, -.2, k) }; };

  BUILD.sz_hook = (p) => {
    const st = set('warm'), who = makePerson(guy); st.scene.add(who);
    const ts = hud(st, titleSigns(p.top, p.bottom), .66, 0, .86);
    const tickle = G(...[0, 1, 2, 3, 4].map(() => sprite(0xffffff, .12, .8))); st.scene.add(tickle);
    return { ...st, update(t, s) { const w = windUp(t, 2), pinch = seg(t, .55, .72);
      who.pose({ s, ...w, handR: reach('nose', pinch), mouth: w.mouth * (1 - pinch), puff: ease(pinch) * (.5 + Math.sin(s * 8) * .1), flush: pinch * .6, brow: .5 + pinch * .3 });
      tickle.children.forEach((d, i) => { const a = s * 2 + i * 1.3; d.position.set(Math.sin(a) * .25, 2.62 + Math.cos(a * 1.3) * .1, .85 + Math.sin(a * .7) * .1); d.material.opacity = .8 * (1 - pinch); });
      ts.update(t, s); orbit(st, s, [0, 2.75, 0], 4.6, .1); } };
  };
  BUILD.sz_blast = () => {
    const st = set('day'), who = makePerson(guy); st.scene.add(who); const sp = spray(90), sp2 = spray(50, 0xe6f8ff, 8); st.scene.add(sp, sp2);
    const achoo = hud(st, tag('ACHOO!', 0xffd23f, '#3a2400', 1.9, .62), .6, .2, .55);
    return { ...st, update(t, s) { const at = .42, w = windUp(t, at); who.pose({ s, ...w, headTurn: .5 }); const u = seg(t, at, at + .5);
      sp.fire(V(.35, 2.55, .65), V(.6, -.15, 1), u); sp2.fire(V(.3, 2.42, .6), V(.7, -.3, 1), u * .9); achoo.scale.setScalar(popIn(t, at)); achoo.rotation.z = -.12 + Math.sin(s * 8) * .04;
      shoot(st, [lerp(2.6, 2.3, t), 2.9, lerp(5.6, 5.2, t)], [.6, 2.3, .6]); } };
  };
  BUILD.sz_pressure = () => {
    const st = set('xray'), who = makePerson(guy); st.scene.add(who); const I = who.userData.inner;
    const aw = tube(airway(), .07, glowM(AIR, .6)); I.add(aw); const fl = flow(aw.userData.curve, 16, AIR, .06, .9, true); fl.userData.xr = false; I.add(fl);
    const lung = B.lungs(.75); lung.position.set(0, 1.45, 0); I.add(lung);
    const g = hud(st, gauge(), .62, 0, .8);
    const glow = sprite(0xff6a5c, 1.4, 0); glow.position.set(0, 2.55, .2); st.scene.add(glow);
    return { ...st, update(t, s) { const k = ease(seg(t, .05, .25)), pr = ease(seg(t, .1, .9));
      who.xray(k); who.pose({ s, handR: reach('nose'), puff: .5 + pr * .6, flush: pr, squint: .3, brow: .6 });
      fl.update(s, k, -1); aw.material.emissiveIntensity = .6 + pr * 2; aw.material.emissive.setHex(pr > .6 ? 0xff6a5c : AIR); glow.material.opacity = pr * .7 * (1 + Math.sin(s * 14) * .2);
      lung.scale.setScalar(.75 * (1 + Math.sin(s * 6) * .03)); g.set(pr); g.scale.setScalar(popIn(t, .15)); g.position.x = Math.sin(s * 30) * .02 * pr;
      shoot(st, [2.2, 2.9, 4.4], [0, 2.25, 0]); } };
  };
  BUILD.sz_ears = () => {
    const st = set('xray'), who = makePerson(guy); st.scene.add(who); const I = who.userData.inner;
    const aw = tube(airway(), .07, glowM(AIR, .8)); I.add(aw);
    const tubes = [-1, 1].map(d => { const tb = tube([[0, 2.5, -.06], [d * .25, 2.58, -.05], [d * .45, 2.66, -.02], [d * .56, 2.7, 0]], .035, glowM(0xff9a3c, 1.6)); I.add(tb); return tb; });
    const drums = [-1, 1].map(d => { const m = M(new THREE.CircleGeometry(.11, 32), new THREE.MeshStandardMaterial({ color: 0xffd9c0, emissive: 0xff3b3b, emissiveIntensity: 0, side: THREE.DoubleSide }), { pos: [d * .6, 2.7, 0], rot: [0, Math.PI / 2, 0], shadow: false }); I.add(m); return m; });
    const pulses = tubes.map(tb => { const p = pulse(tb.userData.curve, 0xffe0a0, .45); I.add(p); p.userData.xr = false; return p; });
    const lb = hud(st, tag('EARDRUM', 0xff4a5c, '#ffffff', 1.6, .42), .55, -.3, .45);
    const bang = sprite(0xffffff, 1.0, 0); bang.position.set(-.62, 2.7, 0); st.scene.add(bang);
    return { ...st, update(t, s) { who.xray(1); who.pose({ s, handR: reach('nose'), puff: .9, flush: .9, squint: .5, brow: .7 });
      pulses.forEach((p, i) => p.at(frac(s * 1.4 + i * .5))); const hit = seg(t, .62, .7), bu = Math.sin(s * 14) * .5 + .5;
      drums.forEach(d => { d.scale.setScalar(1 + bu * .25 + hit * .4); d.material.emissiveIntensity = .4 + hit * 3; }); bang.material.opacity = hit > 0 && hit < 1 ? 1 : seg(t, .7, .8) < 1 && t > .7 ? 1 - seg(t, .7, .8) : 0;
      lb.scale.setScalar(popIn(t, .62)); shoot(st, [lerp(-.5, -1.0, t), 2.95, 3.4], [-.15, 2.55, 0]); } };
  };
  BUILD.sz_eyes = () => {
    const st = set('night'), eye = eyeball(1.2, 0x4a7bd0); eye.position.set(0, 2.5, 0); st.scene.add(eye);
    const lb = hud(st, tag('BURST VESSELS', 0xff4a5c, '#ffffff', 2.4, .46), .62, 0, .7);
    return { ...st, update(t, s) { eye.veins(ease(seg(t, .1, .8))); eye.rotation.set(Math.sin(s * 1.3) * .08 - .1, Math.sin(s * .9) * .15, 0); lb.scale.setScalar(popIn(t, .4)); shoot(st, [Math.sin(s * .5) * .6, 2.6, 6.2], [0, 2.5, 0]); } };
  };
  BUILD.sz_hospital = () => {
    const st = set('clinic'), b = bed(), iv = ivPole(); iv.position.set(-1.6, 0, -1.2); st.scene.add(b, iv);
    const who = makePerson({ ...guy, shirt: 0x9fd0e6 }); who.position.set(0, 1.25, 1.3); st.scene.add(who);
    const brace = M(new THREE.CylinderGeometry(.22, .22, .3, 24), plastic(0xffffff), { pos: [0, 2.12, 0] }); who.add(brace);
    const cal = hud(st, sign(1.1, 1.1, () => {}, { color: 0xffffff }), .55, .45, .32); cal.userData.w = 1.1;
    const yr = hud(st, tag('2018 · ENGLAND', 0x1d2442, '#ffffff', 2.4, .44), .58, -.25, .5);
    return { ...st, update(t, s) { who.pose({ s, lean: -Math.PI / 2, smile: -.4, brow: .6, headTurn: .25 });
      const d = Math.min(7, 1 + Math.floor(ease(seg(t, .2, .85)) * 7)); cal.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff4a5c'; x.fillRect(0, 0, w, h * .26); label(x, 'DAY', w / 2, h * .14, h * .16, '#fff', 900); label(x, String(d), w / 2, h * .62, h * .56, '#1d2442', 900); });
      cal.scale.setScalar(popIn(t, .1)); yr.scale.setScalar(popIn(t, .02)); shoot(st, [3.0, 5.2, 6.0], [0, 1.6, -.2]); } };
  };
  BUILD.sz_elbow = () => {
    const st = set('mint'), who = makePerson(guy); st.scene.add(who); const sp = spray(40, 0xbfe9ff, 5); st.scene.add(sp);
    const ok = hud(st, check(true), .5, .5, .2); ok.userData.w = .62;
    return { ...st, update(t, s) { const at = .4, w = windUp(t, at), up = seg(t, .08, .3); who.pose({ s, ...w, headTurn: .6 * ease(up), headNod: w.headNod + .25 * ease(up), handR: reach('elbow', up), poleR: [0, -.1, 1], smile: t > .7 ? .8 : w.smile });
      sp.fire(V(.5, 2.45, .55), V(.4, -.2, .3), seg(t, at, at + .25) * .15); ok.scale.setScalar(popIn(t, .65)); shoot(st, [-1.6 + Math.sin(s * .4) * .3, 2.9, 4.4], [.15, 2.45, 0]); } };
  };
  BUILD.sz_myth = () => {
    const st = set('lilac'), who = makePerson(guy); st.scene.add(who); const sp = spray(70); st.scene.add(sp);
    const myth = hud(st, tag('MYTH', 0xff4a5c, '#ffffff', 1.7, .66), .58, 0, .5);
    return { ...st, update(t, s) { const at = .3, w = windUp(t, at); who.pose({ s, ...w, squint: 0, wide: seg(t, .25, .32) * (1 - seg(t, .6, .7)), smile: t > .65 ? .9 : w.smile });
      sp.fire(V(0, 2.5, .75), V(0, -.2, 1), seg(t, at, at + .4)); myth.scale.setScalar(popIn(t, .55)); myth.rotation.z = -.15; orbit(st, s, [0, 2.6, 0], 4.8, .15); } };
  };
}
