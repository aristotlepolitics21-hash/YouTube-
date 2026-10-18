// Sets for Body Shorts episode 17: Why Bees Die When They Sting.
import { body } from './common.js';

export function register(K) {
  const { THREE, BUILD, M, RB, SPH, G, plastic, glowM, sprite, clamp, lerp, seg, ease, frac, pop, V } = K;
  const B = body(K), { set, popIn, tag, titleSigns, makePerson, reach, hud, shoot, orbit, insect, skinSection, flow, check, counter, skinM } = B;
  const SKIN = 0xd9a07a, VEN = 0xffe14a;
  const bigArm = () => M(new THREE.CapsuleGeometry(1.0, 6, 16, 48), skinM(SKIN), { rot: [0, 0, Math.PI / 2], pos: [0, 1.4, 0] });
  // a stinger pointing down (-y) from its base at the origin, with backward barbs; length L
  function stinger(L = 3, barbs = true) { const g = new THREE.Group(), m = plastic(0x2a2420, { roughness: .35 }); g.add(M(new THREE.ConeGeometry(.16, L, 20), m, { pos: [0, -L / 2, 0], rot: [Math.PI, 0, 0] }));
    if (barbs) for (let i = 0; i < 9; i++) [-1, 1].forEach(d => { const y = -L * (.2 + i * .08), r = .16 * (1 - (.2 + i * .08)); g.add(M(new THREE.ConeGeometry(.05, .3, 8), m, { pos: [d * (r + .06), y + .07, 0], rot: [0, 0, d * -.55] })); }); return g; }
  function venomSac() { return G(M(SPH(.32, 32, 24), plastic(VEN, { transparent: true, opacity: .8, roughness: .1 }), { scale: [1, 1.2, 1] }), M(new THREE.TorusGeometry(.16, .05, 10, 24), plastic(0x8a6a3a), { pos: [0, -.35, 0], rot: [Math.PI / 2, 0, 0] })); }

  BUILD.bs_hook = (p) => {
    const st = set('mint'), arm = bigArm(); st.scene.add(arm); const bee = insect('bee'); bee.scale.setScalar(1.4); st.scene.add(bee); const ts = hud(st, titleSigns(p.top, p.bottom, 0xffb020), .66, 0, .86);
    return { ...st, update(t, s) { const land = ease(seg(t, .05, .55)); bee.position.set(lerp(2.6, .1, land), lerp(4.0, 2.85, land) + Math.sin(s * 7) * .06 * (1 - land), .2); bee.rotation.set(.45 * land, -1.4 + land * .2, 0); bee.flap(s);
      ts.update(t, s); orbit(st, s, [0, 2.4, 0], 8.0, .6); } };
  };
  BUILD.bs_barbs = () => {
    const st = set('lilac'), sg = stinger(3.4); sg.position.set(0, 4.3, 0); sg.rotation.z = .5; st.scene.add(sg); const lb = hud(st, tag('BACKWARD BARBS', 0xffb020, '#3a2400', 2.6, .48), .62, 0, .6), l2 = hud(st, tag('LIKE A HARPOON', 0xffffff, '#1d2442', 2.4, .44), -.2, 0, .55);
    return { ...st, update(t, s) { sg.rotation.y = s * .5; lb.scale.setScalar(popIn(t, .15)); l2.scale.setScalar(popIn(t, .5)); shoot(st, [0, 3.0, 5.4], [.6, 2.8, 0]); } };
  };
  function stingRig(st) { const sk = skinSection({ top: 3.0, skin: SKIN }); st.scene.add(sk); const sg = stinger(1.6); sg.position.set(0, 3.9, .2); sg.rotation.z = -.35; st.scene.add(sg); const sac = venomSac(); sac.scale.setScalar(.8); st.scene.add(sac); return { sg, sac }; }
  BUILD.bs_rip = () => {
    const st = set('flesh'), { sg, sac } = stingRig(st), bee = insect('bee'); bee.scale.setScalar(1.6); st.scene.add(bee); const lb = hud(st, tag('RIPPED OUT', 0xff4a5c, '#ffffff', 2.0, .5), .62, 0, .45);
    return { ...st, update(t, s) { const off = ease(seg(t, .3, .9)); sac.position.copy(sg.position).add(V(.12, .28, 0)); sac.rotation.z = -.35;
      bee.position.set(.6 + off * 2.6, 4.9 + off * 1.4 + Math.sin(s * 8) * .05 * off, .2); bee.rotation.set(-.3, -1.3, -.4 * off); bee.flap(s); lb.scale.setScalar(popIn(t, .35)); shoot(st, [.5, 4.2, 7.0], [.6, 3.6, 0]); } };
  };
  BUILD.bs_pump = () => {
    const st = set('flesh'), { sg, sac } = stingRig(st); sac.position.copy(sg.position).add(V(.12, .28, 0));
    const fl = flow(new THREE.CatmullRomCurve3([V(.1, 4.1, .35), V(-.2, 3.3, .35), V(-.5, 2.5, .35), V(-.7, 1.9, .35)]), 12, VEN, .06, .7, true); st.scene.add(fl);
    const lb = hud(st, tag('STILL PUMPING', VEN, '#3a2400', 2.3, .5), .62, 0, .55);
    return { ...st, update(t, s) { sac.scale.setScalar(.8 * (1 + Math.max(0, Math.sin(s * 6)) * .2)); fl.update(s, 1); lb.scale.setScalar(popIn(t, .15)); shoot(st, [.5, 3.8, 6.0], [0, 3.2, 0]); } };
  };
  BUILD.bs_scrape = () => {
    const st = set('flesh'), sk = skinSection({ top: 3.0, skin: SKIN }); st.scene.add(sk); const sg = stinger(1.6); st.scene.add(sg); const sac = venomSac(); sac.scale.setScalar(.8); st.scene.add(sac);
    const card = M(RB(2.2, 1.4, .08, .12), plastic(0x3fa9ff), {}); st.scene.add(card); const lb = hud(st, tag('SCRAPE IT OUT', 0x3fa9ff, '#ffffff', 2.4, .5), .62, 0, .55), l2 = hud(st, tag('FAST', 0xff4a5c, '#ffffff', 1.2, .5), .48, 0, .3);
    return { ...st, update(t, s) { const sw = ease(seg(t, .15, .5)), x = lerp(-3.0, 2.2, sw), fly = seg(t, .32, .7); card.position.set(x, 3.7, .2); card.rotation.set(0, 0, -.6);
      const p = V(.25 + fly * 2.5, 4.2 + Math.sin(fly * Math.PI) * 1.5 - fly * .5, .2); sg.position.copy(p).add(V(-.25, -.3, 0)); sg.rotation.z = -.35 - fly * 3; sac.position.copy(sg.position).add(V(.12, .28, 0)); sac.visible = sg.visible = fly < .95;
      lb.scale.setScalar(popIn(t, .05)); l2.scale.setScalar(popIn(t, .35)); shoot(st, [.5, 4.0, 7.4], [0, 3.4, 0]); } };
  };
  BUILD.bs_swell = () => {
    const st = set('mint'), arm = bigArm(); st.scene.add(arm); const bump = M(SPH(.6, 32, 24), skinM(0xe88a6a), { pos: [0, 2.35, 0] }); st.scene.add(bump);
    const d = hud(st, counter(1.6, .62, k => k < .5 ? 'DAY 1' : 'DAY 2', '#1d2442'), .62, 0, .4); d.userData.w = 1.6; const ok = hud(st, check(true), .48, 0, .16);
    return { ...st, update(t, s) { const k = ease(seg(t, .25, .95)); bump.scale.set(1.3 - k * 1.0, .55 - k * .5, 1.3 - k * 1.0); bump.material.color.setHex(k > .6 ? SKIN : 0xe88a6a); d.set(k); d.scale.setScalar(popIn(t, .05)); ok.scale.setScalar(popIn(t, .8)); shoot(st, [0, 3.6, 6.0], [0, 2.3, 0]); } };
  };
  BUILD.bs_wasp = () => {
    const st = set('lilac'), arm = bigArm(); st.scene.add(arm); const w = insect('wasp'); w.scale.setScalar(1.3); st.scene.add(w); const ct = hud(st, counter(1.4, .66, k => '×' + Math.max(1, Math.ceil(k * 3)), '#d42f3f'), .48, .3, .32); ct.userData.w = 1.4;
    const lb = hud(st, tag('SMOOTH STINGER', 0xffb020, '#3a2400', 2.6, .5), .62, 0, .6); const zaps = [0, 1, 2].map(i => { const z = sprite(0xff6a5c, .8, 0); z.position.set(-.8 + i * .8, 2.45, .5); st.scene.add(z); return z; });
    return { ...st, update(t, s) { const ph = seg(t, .1, .95) * 3, i = Math.min(2, Math.floor(ph)), u = frac(ph); const x = -.8 + i * .8, dip = Math.sin(u * Math.PI); w.position.set(x + .25, 3.1 + (1 - dip) * .8, .3); w.rotation.set(.6, -1.5, 0); w.flap(s);
      zaps.forEach((z, j) => z.material.opacity = j < i || (j === i && u > .5) ? .6 : 0); ct.set(seg(t, .1, .95)); ct.scale.setScalar(popIn(t, .2)); lb.scale.setScalar(popIn(t, .05)); shoot(st, [0, 3.4, 8.6], [0, 2.5, 0]); } };
  };
}
