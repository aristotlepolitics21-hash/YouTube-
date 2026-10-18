// Sets for Body Shorts episode 13: Why You See Stars When You Stand Up.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V, rng } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, heart, brain, chair, vessel, flow, pulse, arrow, check, counter, gauge, dizzy } = B;
  const girl = { skin: 0xa8714e, shirt: 0xffb020, hair: 0x15100c, hairStyle: 'long', eye: 0x2a1a10 };
  const BLOOD = 0xff3b4e;
  // a screen-sized dark veil with sparkles, pinned in front of the camera (vision fading)
  function veil(st) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.78), new THREE.MeshBasicMaterial({ color: 0x05030a, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false })); m.renderOrder = 10; m.userData.w = 1; hud(st, m, 0, 0, 1.05, .5);
    const R = rng(4), sp = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(() => { const s = sprite(0xffffff, .03, 0); s.material.depthTest = false; s.renderOrder = 11; m.add(s); return s; }), P = sp.map(() => [R() - .5, (R() - .5) * 1.6, R() * 6]);
    m.set = (k, s) => { m.material.opacity = k * .95; sp.forEach((x, i) => { const [a, b, ph] = P[i]; x.position.set(a * .9, b, .01); x.material.opacity = k * Math.max(0, Math.sin(s * 5 + ph)); x.scale.setScalar(.05 + .03 * Math.sin(s * 7 + ph)); }); }; return m; }
  const HEART = V(.08, 1.62, .18);
  const downPaths = [-1, 1].map(d => [HEART.toArray(), [d * .12, 1.25, .1], [d * .24, .8, .05], [d * .24, .15, .1]]), upPath = [HEART.toArray(), [.02, 2.05, .08], [0, 2.4, .05], [0, 2.75, 0]];
  function circulation(who, n = 10) { const I = who.userData.inner, h = heart(.35); h.position.copy(HEART); I.add(h);
    const downs = downPaths.map(pts => { const v = vessel(pts, .03); I.add(v); const f = flow(v.userData.curve, n, BLOOD, .045, .5, true); f.userData.xr = false; I.add(f); return f; });
    const uv = vessel(upPath, .03); I.add(uv); const up = flow(uv.userData.curve, n, BLOOD, .045, .5, true); up.userData.xr = false; I.add(up); const br = brain(.9); br.position.set(0, 2.82, -.06); I.add(br); return { h, downs, up, br }; }

  BUILD.hr_hook = (p) => {
    const st = set('warm'), ch = chair(); ch.position.set(0, 0, -.15); st.scene.add(ch); const who = makePerson(girl); st.scene.add(who); const dz = dizzy(); st.scene.add(dz); const vl = veil(st);
    const ts = hud(st, titleSigns(p.top, p.bottom, 0xffb020), .66, 0, .86);
    return { ...st, update(t, s) { const up = ease(seg(t, .15, .3)), dk = seg(t, .35, .6) * (1 - seg(t, .9, 1)); who.pose({ s, sit: 1 - up, sitY: 0, squint: dk * .6, brow: dk * .6, smile: lerp(.6, -.3, dk), headTilt: Math.sin(s * 2.5) * .12 * dk, handR: reach('forehead', dk) });
      who.rotation.z = Math.sin(s * 2.5) * .05 * dk; dz.position.set(0, 3.15, 0); dz.update(s, dk); vl.set(dk * .8, s); ts.update(t, s); orbit(st, s, [0, 2.2, 0], 6.0, .2); } };
  };
  BUILD.hr_gravity = () => {
    const st = set('xray'), who = makePerson(girl); st.scene.add(who); const c = circulation(who, 12); const ar = arrow(0xffd23f, 1.2); ar.rotation.z = Math.PI; ar.position.set(1.3, 2.6, .5); st.scene.add(ar);
    const lb = hud(st, tag('GRAVITY', 0xffd23f, '#3a2400', 1.7, .5), .62, 0, .42);
    return { ...st, update(t, s) { who.xray(ease(seg(t, 0, .2))); who.pose({ s, smile: .2 }); c.downs.forEach(f => f.update(s, 1)); c.up.update(s, .4); c.h.scale.setScalar(.35 * (1 + Math.max(0, Math.sin(s * 7)) * .15)); ar.position.y = 2.6 - frac(s * .6) * .8; ar.scale.setScalar(popIn(t, .1));
      lb.scale.setScalar(popIn(t, .2)); shoot(st, [1.0, 2.0, 6.6], [0, 1.6, 0]); } };
  };
  BUILD.hr_less = () => {
    const st = set('xray'), who = makePerson(girl); st.scene.add(who); who.xray(1); const c = circulation(who, 12); const g = hud(st, gauge('BLOOD TO HEAD', '#ff4a5c'), .6, 0, .82);
    return { ...st, update(t, s) { who.xray(1); who.pose({ s, smile: -.1 }); const k = ease(seg(t, .1, .6)); c.downs.forEach(f => f.update(s, 1)); c.up.update(s, 1 - k * .85); c.h.scale.setScalar(.35 * (1 + Math.max(0, Math.sin(s * 7)) * .15)); g.set(1 - k * .7); g.scale.setScalar(popIn(t, .05)); shoot(st, [1.0, 2.6, 4.4], [0, 2.2, 0]); } };
  };
  BUILD.hr_sensors = () => {
    const st = set('xray'), who = makePerson(girl); st.scene.add(who); who.xray(1); const c = circulation(who, 12); const I = who.userData.inner;
    const sens = [-1, 1].map(d => { const s_ = M(SPH(.05, 16, 12), glowM(0x7fe3ff, 2.5), { pos: [d * .1, 2.1, .1], shadow: false }); s_.userData.xr = false; I.add(s_); return s_; });
    const sig = new THREE.CatmullRomCurve3([V(.1, 2.1, .12), V(.15, 1.9, .2), HEART.clone()]), ps = pulse(sig, 0x7fe3ff, .25); ps.userData.xr = false; I.add(ps);
    const bpm = hud(st, counter(1.8, .62, k => Math.round(70 + k * 30) + ' BPM', '#d42f3f'), .6, -.2, .42); bpm.userData.w = 1.8; const lb = hud(st, tag('NECK SENSORS', 0x7fe3ff, '#0b2a40', 2.3, .44), .45, .1, .52);
    return { ...st, update(t, s) { who.xray(1); who.pose({ s, smile: 0 }); const k = ease(seg(t, .3, .7)), rate = 7 + k * 5; sens.forEach(x => x.material.emissiveIntensity = 1.5 + Math.sin(s * 10) * 1); ps.at(frac(s * 1.2)); c.downs.forEach(f => f.update(s, 1)); c.up.update(s, .3 + k * .6);
      c.h.scale.setScalar(.35 * (1 + Math.max(0, Math.sin(s * rate)) * .2)); bpm.set(k); bpm.scale.setScalar(popIn(t, .3)); lb.scale.setScalar(popIn(t, .05)); shoot(st, [1.0, 2.4, 3.8], [0, 1.95, 0]); } };
  };
  BUILD.hr_delay = () => {
    const st = set('xray'), who = makePerson(girl); st.scene.add(who); who.xray(1); const c = circulation(who, 10); const vl = veil(st);
    const clk = hud(st, counter(1.6, .62, k => Math.max(1, Math.ceil(k * 3)) + ' SEC', '#1d2442'), .62, -.2, .38); clk.userData.w = 1.6; const lb = hud(st, tag('LOW ON OXYGEN', 0x9aa3bd, '#ffffff', 2.4, .44), .48, .05, .55);
    const brM = c.br.children[0].material, pinkC = new THREE.Color(0xffa0b4), grey = new THREE.Color(0x8a8aa0);
    return { ...st, update(t, s) { who.xray(1); who.pose({ s, squint: .4, smile: -.2 }); const k = ease(seg(t, .1, .8)); c.downs.forEach(f => f.update(s, 1)); c.up.update(s, .2); brM.color.copy(pinkC).lerp(grey, k); vl.set(k * .45, s);
      clk.set(k); clk.scale.setScalar(popIn(t, .05)); lb.scale.setScalar(popIn(t, .45)); shoot(st, [.8, 2.9, 3.4], [0, 2.55, 0]); } };
  };
  BUILD.hr_stars = () => {
    const st = set('warm'), who = makePerson(girl); st.scene.add(who); const dz = dizzy(6); dz.position.set(0, 3.2, 0); st.scene.add(dz); const vl = veil(st); const lb = hud(st, tag('HEAD RUSH', 0xffb020, '#3a2400', 2.0, .55), .6, 0, .48);
    return { ...st, update(t, s) { const dk = Math.sin(clamp(t * 1.2) * Math.PI); who.pose({ s, squint: .5, brow: .6, smile: -.3, headTilt: Math.sin(s * 2.5) * .15, handR: reach('forehead', seg(t, .05, .25)) }); who.rotation.z = Math.sin(s * 2.5) * .06;
      dz.update(s, 1); vl.set(dk * .55, s); lb.scale.setScalar(popIn(t, .3)); orbit(st, s, [0, 2.6, 0], 4.8, .2); } };
  };
  BUILD.hr_slow = () => {
    const st = set('mint'), ch = chair(); ch.position.set(0, 0, -.15); st.scene.add(ch); const who = makePerson(girl); st.scene.add(who); const ok = hud(st, check(true), .55, .4, .2), lb = hud(st, tag('NICE AND SLOW', 0x3cc85a, '#ffffff', 2.4, .5), .58, -.1, .55);
    return { ...st, update(t, s) { const up = ease(seg(t, .05, .85)); who.pose({ s, sit: 1 - up, sitY: 0, smile: .8 }); lb.scale.setScalar(popIn(t, .1)); ok.scale.setScalar(popIn(t, .8)); orbit(st, s, [0, 2.0, 0], 6.0, .3); } };
  };
}
