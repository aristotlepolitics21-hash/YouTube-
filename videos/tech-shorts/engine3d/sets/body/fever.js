// Sets for Body Shorts episode 20: Why You Get a Fever.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, sign, label, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, makeDoctor, reach, hud, shoot, orbit, bed, blanket, brain, germs, whiteCell, counter, check, snow, sweat, floaters } = B;
  const kid = { skin: 0xd9a07a, shirt: 0x9fd0e6, hair: 0x1a120c, eye: 0x3a2a1a };
  const MSG = 0xb18cff;
  const temp = k => (37 + k * 2).toFixed(1) + ' °C';
  // a round thermostat dial: set(k) turns the needle from cool (0) to hot (1)
  function dial() { const g = sign(1.5, 1.5, () => {}, { color: 0xffffff }); g.userData.w = 1.5;
    g.set = k => g.userData.redraw((x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); const cx = w / 2, cy = h * .58, r = w * .38; x.lineWidth = w * .08; x.lineCap = 'round';
      const grd = x.createLinearGradient(cx - r, 0, cx + r, 0); grd.addColorStop(0, '#3fa9ff'); grd.addColorStop(1, '#ff4a5c'); x.strokeStyle = grd; x.beginPath(); x.arc(cx, cy, r, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
      const a = Math.PI * (1.1 + .8 * clamp(k)); x.strokeStyle = '#1d2442'; x.lineWidth = w * .035; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * r * .85, cy + Math.sin(a) * r * .85); x.stroke(); x.fillStyle = '#1d2442'; x.beginPath(); x.arc(cx, cy, w * .05, 0, 7); x.fill();
      label(x, temp(k), cx, h * .86, h * .14, '#1d2442', 900); }); g.set(0); return g; }
  function sickInBed(st) { const b = bed(); st.scene.add(b); const who = makePerson(kid); who.position.set(0, 1.25, 1.3); st.scene.add(who); const bl = blanket(2.0, 2.4, 0x6fa8ff); bl.position.set(0, 1.55, .55); st.scene.add(bl); return { who, bl }; }

  BUILD.fv_hook = (p) => {
    const st = set('clinic'), { who } = sickInBed(st); const th = M(new THREE.CylinderGeometry(.025, .025, .5, 10), plastic(0xffffff), {}); st.scene.add(th);
    const tc = hud(st, counter(2.0, .66, temp, '#d42f3f'), .28, .3, .42); tc.userData.w = 2.0; const ts = hud(st, titleSigns(p.top, p.bottom, 0xff4a5c), .66, 0, .86);
    return { ...st, update(t, s) { who.pose({ s, lean: -Math.PI / 2, smile: -.3, brow: .5, squint: .3, flush: seg(t, .1, .8) * .7, headTurn: .25 }); th.position.set(.12, 1.85 + .55, -1.2); th.rotation.set(-.6, 0, .4);
      tc.set(ease(seg(t, .1, .9))); tc.scale.setScalar(popIn(t, .25)); ts.update(t, s); shoot(st, [2.4, 4.6, 4.2], [0, 1.9, -.6]); } };
  };
  BUILD.fv_germs = () => {
    const st = set('flesh'), gs = germs(6, 0x7ad94a, [3, 1.6, 1], 4, [-.6, 2.6, 0]); st.scene.add(gs); const wc = whiteCell(1.4); wc.position.set(1.0, 2.2, .3); st.scene.add(wc);
    const R = rng(6), msgs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => { const m = M(SPH(.07, 12, 8), glowM(MSG, 1.8), { shadow: false }); st.scene.add(m); return m; }), P = msgs.map(() => [R() * 6.28, R()]);
    const l1 = hud(st, tag('GERMS', 0x7ad94a, '#14320a', 1.4, .46), .62, -.5, .28), l2 = hud(st, tag('MESSENGERS', MSG, '#ffffff', 2.0, .46), .62, .4, .4);
    return { ...st, update(t, s) { gs.update(s, 1); wc.rotation.y = Math.sin(s) * .3; wc.position.y = 2.2 + Math.sin(s * 2) * .08; msgs.forEach((m, i) => { const [a, ph] = P[i], u = frac(s * .4 + ph); m.position.set(1.0 + Math.cos(a) * u * 2.5, 2.2 + u * 2.0 + Math.sin(a) * .5, .3 + Math.sin(a) * u); m.visible = t > .35; });
      l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .4)); shoot(st, [0, 3.0, 7.0], [0, 2.6, 0]); } };
  };
  BUILD.fv_thermostat = () => {
    const st = set('xray'), who = makePerson(kid); st.scene.add(who); const br = brain(.95); br.position.set(0, 2.82, -.06); who.userData.inner.add(br); const hy = M(SPH(.07, 16, 12), glowM(0xff4a5c, 2), { pos: [0, 2.6, .05], shadow: false }); hy.userData.xr = false; who.userData.inner.add(hy);
    const d = hud(st, dial(), .4, .52, .32), lb = hud(st, tag('HYPOTHALAMUS', 0xff4a5c, '#ffffff', 2.4, .46), .66, -.3, .46);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, smile: -.2, flush: .3 }); hy.material.emissiveIntensity = 2 + Math.sin(s * 6) * 1; hy.scale.setScalar(1 + seg(t, .3, .5) * .4); d.set(ease(seg(t, .5, .9))); d.scale.setScalar(popIn(t, .4)); lb.scale.setScalar(popIn(t, .15)); shoot(st, [-.6, 3.0, 3.6], [.25, 2.65, 0]); } };
  };
  BUILD.fv_chills = () => {
    const st = set('night'), { who, bl } = sickInBed(st); const sn = snow(40, [5, 5, 4]); st.scene.add(sn); const lb = hud(st, tag('CHILLS', 0x7fd8ff, '#0b2a40', 1.6, .55), .6, 0, .4);
    return { ...st, update(t, s) { const sh = Math.sin(s * 45) * .02; who.position.x = sh; bl.position.x = sh; who.pose({ s, lean: -Math.PI / 2, smile: -.4, brow: .7, squint: .5, mouth: .12 + Math.abs(Math.sin(s * 30)) * .1, headTurn: .25 }); sn.update(s); lb.scale.setScalar(popIn(t, .2)); shoot(st, [2.4, 4.6, 4.2], [0, 1.9, -.6]); } };
  };
  BUILD.fv_fight = () => {
    const st = set('flesh', { top: '#5a0a12', bottom: '#b0302a' }), gs = germs(5, 0x7ad94a, [3, 1.4, 1], 9, [-.4, 2.5, 0]); st.scene.add(gs); const wcs = [0, 1, 2].map(i => { const w = whiteCell(1.0); st.scene.add(w); return w; });
    const heat = sprite(0xff8a3c, 6, .25); heat.position.set(0, 2.6, -1); st.scene.add(heat); const l1 = hud(st, tag('GERMS SLOW DOWN', 0x7ad94a, '#14320a', 2.7, .44), .62, 0, .6), l2 = hud(st, tag('DEFENDERS SPEED UP', 0xffffff, '#1d2442', 2.9, .44), .5, 0, .64);
    return { ...st, update(t, s) { gs.update(s * .3, 1); wcs.forEach((w, i) => { const a = s * 2.2 + i * 2.1; w.position.set(-.4 + Math.cos(a) * 1.6, 2.5 + Math.sin(a * 1.3) * .7, Math.sin(a) * .6); w.rotation.y = a; }); heat.material.opacity = .25 + Math.sin(s * 2) * .08;
      l1.scale.setScalar(popIn(t, .1)); l2.scale.setScalar(popIn(t, .45)); shoot(st, [0, 3.0, 7.2], [0, 2.5, 0]); } };
  };
  BUILD.fv_break = () => {
    const st = set('warm'), who = makePerson(kid); st.scene.add(who); const sw = sweat(10, 4); sw.position.set(0, 2.65, 0); who.add(sw); const d = hud(st, dial(), .5, .5, .32), lb = hud(st, tag('RESET', 0x3cc85a, '#ffffff', 1.4, .5), .64, -.4, .28);
    return { ...st, update(t, s) { const k = 1 - ease(seg(t, .1, .6)); d.set(k); d.scale.setScalar(popIn(t, .02)); sw.update(s, seg(t, .4, .55)); who.pose({ s, smile: lerp(-.2, .8, seg(t, .5, .8)), flush: k * .5, handR: reach('forehead', seg(t, .55, .7)) }); lb.scale.setScalar(popIn(t, .55)); orbit(st, s, [-.2, 2.5, 0], 5.0, .1); } };
  };
  BUILD.fv_doctor = () => {
    const st = set('clinic'), who = makePerson(kid); who.position.set(-.85, 0, 0); who.rotation.y = .5; st.scene.add(who); const doc = makeDoctor({ skin: 0xf2c7a5, hair: 0x9a9aa6 }); doc.position.set(.95, 0, -.3); doc.rotation.y = -.55; st.scene.add(doc);
    const l1 = hud(st, tag('VERY HIGH? SEE A DOCTOR', 0xff4a5c, '#ffffff', 3.6, .44), .64, 0, .78), l2 = hud(st, tag('MILD = FIGHTING BACK', 0x3cc85a, '#ffffff', 3.2, .44), .5, 0, .7);
    return { ...st, update(t, s) { who.pose({ s, smile: .5 }); doc.pose({ s, smile: .7, handR: reach('point', seg(t, .1, .3)) }); l1.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .5)); orbit(st, s, [0, 2.1, 0], 7.0, .4); } };
  };
}
