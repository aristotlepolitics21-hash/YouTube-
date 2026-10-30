// Ghar Ka Mistri (videos/diy-fixes): home-repair shorts on the Paisa Toons engine (BUILD.pt from paisa.js).
// Adds close-up repair props whose animation follows the shot's p.state (drip, open, plunge, trip, reset, fill ...),
// bathroom and kitchen walls, and a STEP pill on the overlay.
import { register as paisa } from './paisa.js';

export function register(K) {
  const PT = paisa(K), { EXTRA } = PT;
  const { THREE, M, RB, SPH, G, plastic, matte, metal, glowM, sprite, label, clamp, lerp, seg, ease, frac, V, rng } = K;
  const CYL = (a, b, h, n = 24) => new THREE.CylinderGeometry(a, b, h, n);
  const chrome = () => metal(0xdfe4ea, { roughness: .12 });
  const water = (o = .7) => plastic(0x5fb8ec, { transparent: true, opacity: o, roughness: .05 });
  const drops = (g, n, at, fall = 1.2, seed = 1) => { const R = rng(seed), ds = Array.from({ length: n }, () => { const d = M(SPH(.05, 12, 8), water(.85), { scale: [1, 1.4, 1], shadow: false }); g.add(d); return [d, R()]; });
    return (s, on = 1) => ds.forEach(([d, r]) => { const u = frac(s * .9 + r); d.visible = on > 0; d.position.set(at[0], at[1] - u * fall, at[2]); d.scale.setScalar(on * (1 - u * .3)); }); };
  const sparkle = (g, at) => { const sp = sprite(0xfff6c0, .9, .9); sp.position.set(...at); g.add(sp); return k => { sp.material.opacity = k * (.5 + .5 * Math.sin(k * 20)); sp.scale.setScalar(.4 + k * .8); }; };
  const anim = (g, fn) => { g.userData.anim = fn; return g; };

  // ---------- walls ----------
  EXTRA.tilewall = () => { const g = G(M(RB(9, 7, .2, .02), plastic(0xf4f8fb, { roughness: .3 }), { pos: [0, 3.5, 0] })); for (let i = 0; i < 13; i++) g.add(M(RB(.03, 7, .22, .01), matte(0xc8d4dc), { pos: [-4.5 + i * .75, 3.5, 0] })); for (let j = 0; j < 10; j++) g.add(M(RB(9, .03, .22, .01), matte(0xc8d4dc), { pos: [0, j * .75, 0] })); return g; };
  EXTRA.kitchen = () => G(M(RB(9, 7, .2, .02), plastic(0xfff2d6), { pos: [0, 3.5, 0] }), M(RB(9, 1.2, 1.4, .05), plastic(0x8a5a3a), { pos: [0, .6, .7] }), M(RB(9, .12, 1.5, .03), plastic(0x3a3a42, { roughness: .2 }), { pos: [0, 1.26, .7] }),
    M(RB(4, .1, .6, .03), plastic(0x8a5a3a), { pos: [-1.5, 3.4, .3] }), ...[0, 1, 2].map(i => M(CYL(.18, .18, .45, 16), plastic([0xe24b4b, 0xffd23f, 0x3aa76d][i]), { pos: [-2.6 + i * .7, 3.7, .3] })));
  // ---------- tools ----------
  EXTRA.spanner = () => { const m = chrome(); return anim(G(M(RB(.12, 1.2, .06, .03), m), M(new THREE.TorusGeometry(.14, .05, 8, 20, Math.PI * 1.4), m, { pos: [0, .66, 0], rot: [0, 0, -.6] }), M(new THREE.TorusGeometry(.12, .045, 8, 20), m, { pos: [0, -.66, 0] })), (t, s, p) => {}); };
  EXTRA.screwdriver = () => G(M(CYL(.08, .1, .45, 16), plastic(0xffd23f), { pos: [0, .22, 0] }), M(CYL(.025, .025, .6, 10), chrome(), { pos: [0, -.3, 0] }), M(RB(.07, .08, .02, .01), chrome(), { pos: [0, -.62, 0] }));
  EXTRA.plunger = () => anim(G(M(new THREE.SphereGeometry(.35, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), plastic(0xe24b4b, { side: THREE.DoubleSide }), { rot: [Math.PI, 0, 0] }), M(CYL(.04, .04, 1.6, 10), plastic(0xc8864a), { pos: [0, .8, 0] })),
    function (t, s, p) { if (p.state === 'plunge') this.position.y = this.userData.y0 + Math.abs(Math.sin(s * 5)) * .3; });
  EXTRA.toolbox = () => { const g = G(M(RB(1.4, .6, .6, .06), plastic(0xe24b4b), { pos: [0, .3, 0] }), M(RB(1.4, .12, .62, .04), plastic(0xc0392b), { pos: [0, .62, 0] }), M(new THREE.TorusGeometry(.25, .04, 8, 20, Math.PI), plastic(0x2a2a30), { pos: [0, .68, 0] }));
    const sp = EXTRA.spanner(); sp.position.set(-.4, .95, 0); sp.rotation.z = .8; sp.scale.setScalar(.6); const sd = EXTRA.screwdriver(); sd.position.set(.35, 1.0, 0); sd.rotation.z = -.5; g.add(sp, sd); return g; };
  EXTRA.tape = () => G(M(new THREE.TorusGeometry(.18, .09, 12, 24), plastic(0xf8f8f8), { rot: [Math.PI / 2, 0, 0] }));
  EXTRA.oilcan = () => anim(G(M(CYL(.28, .32, .5, 20), plastic(0xe24b4b), { pos: [0, .25, 0] }), M(new THREE.ConeGeometry(.28, .25, 20), plastic(0xe24b4b), { pos: [0, .62, 0] }), M(CYL(.03, .05, .7, 8), metal(0xb0b0b8), { pos: [.25, .85, 0], rot: [0, 0, -1.0] })), (t, s, p) => {});
  EXTRA.putty = () => G(M(RB(.5, .02, .4, .01), chrome(), { pos: [0, 0, 0] }), M(RB(.12, .5, .08, .03), plastic(0x3d7bff), { pos: [0, .28, 0] }));
  EXTRA.pin = () => G(M(CYL(.01, .01, .8, 6), chrome()), M(SPH(.05, 10, 8), plastic(0xe24b4b), { pos: [0, .4, 0] }));
  EXTRA.glue = () => G(M(CYL(.15, .17, .6, 16), plastic(0xffffff), { pos: [0, .3, 0] }), M(new THREE.ConeGeometry(.08, .25, 12), plastic(0xff8a3d), { pos: [0, .72, 0] }));
  EXTRA.toothpicks = () => { const g = new THREE.Group(); for (let i = 0; i < 9; i++) g.add(M(CYL(.015, .015, .8, 6), plastic(0xe8c890), { pos: [(i % 3 - 1) * .05, .4, Math.floor(i / 3) * .05], rot: [0, 0, (i - 4) * .04] })); return g; };
  EXTRA.bucket = () => G(M(CYL(.5, .4, .8, 24, 1, true), plastic(0x3d7bff, { side: THREE.DoubleSide }), { pos: [0, .4, 0] }), M(CYL(.4, .4, .05, 24), plastic(0x3d7bff), { pos: [0, .02, 0] }), M(CYL(.45, .45, .02, 24), water(.8), { pos: [0, .55, 0] }));
  EXTRA.vinegar = () => G(M(CYL(.22, .22, .8, 16), plastic(0xffffff, { transparent: true, opacity: .7 }), { pos: [0, .4, 0] }), M(CYL(.1, .1, .2, 12), plastic(0xe24b4b), { pos: [0, .9, 0] }), M(RB(.4, .3, .02, .02), plastic(0xffd23f), { pos: [0, .4, .23] }));
  EXTRA.washer = (look, arg) => G(M(new THREE.TorusGeometry(.22, .09, 12, 28), matte(arg === 'old' ? 0x3a3a30 : 0x1d1d24, { roughness: 1 }), { rot: [Math.PI / 2, 0, 0] }));

  // ---------- repair props (animated by p.state) ----------
  // a wall tap: drip | off | open (exploded, old washer out, new in) | fixed
  EXTRA.tap = () => { const g = new THREE.Group(), m = chrome(); g.add(M(CYL(.35, .35, .1, 24), m, { rot: [Math.PI / 2, 0, 0], pos: [0, 0, .05] }), M(CYL(.12, .12, .5, 16), m, { rot: [Math.PI / 2, 0, 0], pos: [0, 0, .35] }));
    const spout = M(CYL(.09, .07, .55, 16), m, { pos: [0, -.25, .6] }); g.add(spout, M(SPH(.12, 16, 12), m, { pos: [0, 0, .6] }));
    const head = G(M(CYL(.13, .13, .35, 16), m, { pos: [0, .2, 0] }), M(RB(.6, .1, .12, .05), m, { pos: [0, .42, 0] })); head.position.set(0, .05, .6); g.add(head);
    const oldW = EXTRA.washer(0, 'old'), newW = EXTRA.washer(0, 'new'); [oldW, newW].forEach(w => { w.scale.setScalar(.55); g.add(w); });
    const dr = drops(g, 3, [0, -.55, .6], 1.2, 4), sk = sparkle(g, [0, .3, .9]);
    return anim(g, (t, s, p) => { const st = p.state || 'drip', op = st === 'open' ? ease(seg(t, .05, .35)) : 0;
      head.position.y = .05 + op * .7; head.rotation.y = st === 'off' || st === 'open' ? -op * 3 : st === 'drip' ? 0 : 0;
      const sw = st === 'open' ? seg(t, .4, .8) : 0; oldW.visible = st === 'open'; newW.visible = st === 'open' || st === 'fixed';
      oldW.position.set(lerp(0, .9, ease(sw)), .35 - sw * .3, .6); newW.position.set(lerp(-.9, 0, ease(seg(t, .55, .9))), st === 'fixed' ? -.02 : .35, .6); if (st === 'fixed') newW.visible = false;
      dr(s, st === 'drip' ? 1 : 0); sk(st === 'fixed' ? clamp(t * 2) : 0); }); };
  // the main valve on a pipe: close turns the lever across the pipe
  EXTRA.valve = () => { const g = G(M(CYL(.12, .12, 2.4, 16), metal(0xb8bcc4), { rot: [0, 0, Math.PI / 2] }), M(SPH(.22, 16, 12), metal(0xc8a050), {}));
    const lever = G(M(RB(.9, .1, .12, .04), plastic(0xe24b4b), { pos: [.4, 0, 0] })); lever.position.set(0, .28, 0); g.add(lever, M(CYL(.05, .05, .25, 8), metal(0xc8a050), { pos: [0, .15, 0] }));
    return anim(g, (t, s, p) => { lever.rotation.y = p.state === 'close' ? ease(seg(t, .15, .55)) * Math.PI / 2 : p.state === 'closed' ? Math.PI / 2 : 0; }); };
  // a wash basin with a drain: clog (water sits) | plunge | clear (water drains with a swirl)
  EXTRA.sink = () => { const g = G(M(RB(2.2, .5, 1.4, .2), plastic(0xffffff, { roughness: .2 }), { pos: [0, 1.75, 0] }), M(RB(.5, 1.5, .5, .08), plastic(0xf2f2f2), { pos: [0, .75, -.2] }));
    g.add(M(RB(1.8, .1, 1.0, .1), plastic(0xe8eef2), { pos: [0, 1.95, 0] }), M(CYL(.08, .08, .02, 16), matte(0x1d1d24), { pos: [0, 1.96, 0] }));
    const wt = M(RB(1.75, .3, .95, .1), plastic(0x8a9a8a, { transparent: true, opacity: .8 }), { pos: [0, 2.0, 0], shadow: false }); g.add(wt);
    const swirl = M(new THREE.TorusGeometry(.18, .02, 6, 24, Math.PI * 1.5), plastic(0xffffff, { transparent: true, opacity: .7 }), { pos: [0, 2.05, 0], rot: [Math.PI / 2, 0, 0], shadow: false }); g.add(swirl);
    const tap = EXTRA.tap(); tap.scale.setScalar(.6); tap.position.set(0, 2.2, -.6); g.add(tap); tap.userData.anim = null;
    return anim(g, (t, s, p) => { const st = p.state || 'clog', lvl = st === 'clear' ? 1 - ease(seg(t, .15, .8)) : 1; wt.scale.y = Math.max(.02, lvl); wt.position.y = 1.86 + .14 * lvl; wt.visible = lvl > .03;
      wt.material.color.set(st === 'clear' ? 0x6fb8e0 : 0x8a9a8a); swirl.visible = st === 'clear' && lvl > .1; swirl.rotation.z = s * 6; if (st === 'plunge') wt.position.y += Math.sin(s * 10) * .03; }); };
  // toilet cistern cut-away: leak (flapper lifted, water seeps) | fix (new flapper seats, sparkle)
  EXTRA.cistern = () => { const g = G(M(RB(2.0, 1.6, .8, .08), plastic(0xffffff, { transparent: true, opacity: .25, roughness: .05, depthWrite: false }), { pos: [0, 2.2, 0], shadow: false }), M(RB(2.1, .12, .9, .04), plastic(0xf4f4f4), { pos: [0, 3.05, 0] }));
    g.add(M(RB(1.95, 1.0, .75, .05), water(.45), { pos: [0, 2.0, 0], shadow: false }), M(CYL(.12, .12, .3, 16), metal(0xb0b4bc), { pos: [0, 1.3, 0] }));
    const flap = G(M(CYL(.22, .22, .06, 20), plastic(0xe24b4b), { pos: [.22, 0, 0] })); flap.position.set(-.22, 1.48, 0); g.add(flap);
    g.add(M(CYL(.01, .01, 1.0, 6), metal(0x8a8a92), { pos: [0, 2.0, 0] })); const fl = G(M(SPH(.2, 16, 12), plastic(0x3d7bff), { pos: [.75, 0, 0] }), M(RB(.75, .04, .04, .02), metal(0x8a8a92), { pos: [.37, 0, 0] })); fl.position.set(0, 2.45, 0); g.add(fl);
    const dr = drops(g, 4, [0, 1.3, 0], .8, 7), sk = sparkle(g, [0, 1.6, .5]);
    return anim(g, (t, s, p) => { const leak = p.state === 'leak'; flap.rotation.z = leak ? -.35 - Math.sin(s * 3) * .05 : -.0; dr(s, leak ? 1 : 0); fl.rotation.z = leak ? -.15 : 0; sk(p.state === 'fix' ? clamp(t * 2) : 0); }); };
  // the MCB board: trip (one switch down, red) | reset (it flips up, green light)
  EXTRA.mcb = () => { const g = G(M(RB(2.6, 1.6, .3, .06), plastic(0xd8dce2), { pos: [0, 0, 0] }), M(RB(2.3, .9, .1, .03), plastic(0xf4f6f8), { pos: [0, 0, .16] }));
    const sw = Array.from({ length: 6 }, (_, i) => { const b = G(M(RB(.3, .7, .12, .04), plastic(0xffffff), { pos: [0, 0, 0] })); const lv = M(RB(.16, .2, .14, .03), plastic(i === 2 ? 0x1d1d24 : 0x1d1d24), { pos: [0, .12, .08] }); b.add(lv); b.position.set(-.95 + i * .38, 0, .25); g.add(b); return lv; });
    const led = M(SPH(.07, 12, 8), glowM(0xff4a5c, 2.5), { pos: [-.19, .5, .3], shadow: false }); g.add(led);
    return anim(g, (t, s, p) => { const st = p.state || 'trip', up = st === 'reset' ? ease(seg(t, .3, .55)) : st === 'on' ? 1 : 0; sw[2].position.y = lerp(-.12, .12, up); sw[2].material.color.set(up > .5 ? 0x1d1d24 : 0xe24b4b);
      led.material.emissive.set(up > .5 ? 0x3cc85a : 0xff4a5c); }); };
  // a chair whose legs wobble until the screws are tightened (wobble | fixed)
  EXTRA.chair2 = () => { const g = K.KITM ? new THREE.Group() : new THREE.Group(), w = plastic(0xb8864a); g.add(M(RB(1.2, .14, 1.2, .05), w, { pos: [0, 1.0, 0] }), M(RB(1.2, 1.2, .12, .05), w, { pos: [0, 1.65, -.55] }));
    const legs = [-1, 1].flatMap(a => [-1, 1].map(b => { const l = M(RB(.12, 1.0, .12, .03), w, { pos: [a * .5, .5, b * .5] }); g.add(l); return l; })); const sk = sparkle(g, [.5, .9, .6]);
    return anim(g, (t, s, p) => { const wob = p.state === 'wobble' ? 1 : p.state === 'tighten' ? 1 - ease(seg(t, .2, .8)) : 0; g.rotation.z = Math.sin(s * 9) * .06 * wob; legs[3].rotation.x = Math.sin(s * 9) * .15 * wob; sk(p.state === 'fixed' ? clamp(t * 2) : 0); }); };
  // a wall patch: hole | fill (putty knife sweeps, patch appears) | sand | paint
  EXTRA.wallhole = () => { const g = G(M(RB(3.2, 2.4, .2, .03), plastic(0xf2d0a0, { roughness: .8 }), { pos: [0, 0, 0] })); const hole = M(new THREE.CircleGeometry(.28, 24), matte(0x3a2a1a), { pos: [0, 0, .105] }); g.add(hole);
    const patch = M(new THREE.CircleGeometry(.42, 24), matte(0xffffff), { pos: [0, 0, .11] }); g.add(patch); const knife = EXTRA.putty(); knife.rotation.x = Math.PI / 2 - .3; g.add(knife);
    const paper = M(RB(.45, .3, .04, .02), matte(0xc8a060), {}); g.add(paper);
    return anim(g, (t, s, p) => { const st = p.state || 'hole'; const f = st === 'fill' ? ease(seg(t, .15, .7)) : st === 'hole' ? 0 : 1; patch.scale.setScalar(Math.max(.01, f)); patch.visible = f > .01;
      patch.material.color.set(st === 'paint' ? new THREE.Color(0xffffff).lerp(new THREE.Color(0xf2d0a0), ease(seg(t, .2, .8))) : 0xffffff);
      knife.visible = st === 'fill'; knife.position.set(Math.sin(s * 4) * .5, Math.cos(s * 4) * .1, .4); paper.visible = st === 'sand'; paper.position.set(Math.sin(s * 9) * .3, Math.cos(s * 7) * .15, .14); }); };
  // a door on hinges: squeak (swings, sound arcs) | oil (drops on the hinge) | smooth
  EXTRA.door = () => { const g = G(M(RB(.15, 4.2, .3, .03), plastic(0x7a4a2a), { pos: [-1.1, 2.1, 0] }), M(RB(.15, 4.2, .3, .03), plastic(0x7a4a2a), { pos: [1.1, 2.1, 0] }), M(RB(2.35, .15, .3, .03), plastic(0x7a4a2a), { pos: [0, 4.2, 0] }));
    const leaf = G(M(RB(2.0, 4.0, .12, .05), plastic(0xb8864a), { pos: [1.0, 2.0, 0] }), M(SPH(.08, 12, 8), metal(0xc8a050), { pos: [1.8, 2.0, .1] })); leaf.position.set(-1.0, 0, 0); g.add(leaf);
    [1.0, 3.0].forEach(y => g.add(M(CYL(.06, .06, .4, 12), metal(0xc8a050), { pos: [-1.0, y, .1] })));
    const arcs = [0, 1, 2].map(i => { const a = M(new THREE.TorusGeometry(.2 + i * .15, .02, 6, 20, Math.PI * .6), glowM(0xffd23f, 1.5), { pos: [-.7, 3.0, .3], rot: [0, 0, -.3], shadow: false }); g.add(a); return a; });
    const dr = drops(g, 3, [-.95, 3.5, .2], .5, 2); const can = EXTRA.oilcan(); can.position.set(-.2, 3.6, .5); can.rotation.z = 1.9; can.scale.setScalar(.7); g.add(can);
    return anim(g, (t, s, p) => { const st = p.state || 'squeak'; leaf.rotation.y = -(.2 + .6 * (.5 + .5 * Math.sin(s * 1.6))); arcs.forEach((a, i) => { a.visible = st === 'squeak'; a.scale.setScalar(1 + frac(s * 1.5 + i / 3) * .6); });
      can.visible = st === 'oil'; dr(s, st === 'oil' ? 1 : 0); }); };
  // a gas burner: low (uneven yellow flames) | clean (pin pokes the holes, flames off) | good (even blue flames)
  EXTRA.burner = () => { const g = G(M(RB(2.6, .2, 1.6, .06), plastic(0x1d1d24, { roughness: .2 }), { pos: [0, 0, 0] }), M(CYL(.5, .55, .18, 32), metal(0x3a3a42), { pos: [0, .18, 0] }), M(CYL(.36, .36, .06, 32), metal(0x2a2a30), { pos: [0, .3, 0] }));
    const N = 18, fl = Array.from({ length: N }, (_, i) => { const a = i / N * Math.PI * 2, f = G(M(new THREE.ConeGeometry(.06, .3, 10), glowM(0x3d8bff, 2.4), { pos: [0, .15, 0], shadow: false })); f.position.set(Math.cos(a) * .44, .28, Math.sin(a) * .44); g.add(f);
      g.add(M(SPH(.03, 8, 6), matte(0x0b0b10), { pos: [Math.cos(a) * .44, .27, Math.sin(a) * .44], shadow: false })); return f; });
    const pin = EXTRA.pin(); g.add(pin); const R = rng(9), weak = fl.map(() => R());
    return anim(g, (t, s, p) => { const st = p.state || 'low'; fl.forEach((f, i) => { const on = st === 'good' ? 1 : st === 'clean' ? 0 : (weak[i] > .55 ? 1 : .15); f.visible = on > 0;
        f.scale.set(1, on * (.9 + .2 * Math.sin(s * 20 + i)), 1); f.children[0].material.emissive.set(st === 'good' ? 0x3d8bff : 0xffa030); });
      pin.visible = st === 'clean'; const a = s * 2.5; pin.position.set(Math.cos(a) * .44, .65, Math.sin(a) * .44); pin.rotation.z = .3; }); };
  // a shower head: clog (weak streams, white scale) | soak (bag of vinegar tied on) | good (full spray)
  EXTRA.shower = () => { const g = G(M(CYL(.06, .06, 1.2, 10), chrome(), { pos: [-.5, .3, 0], rot: [0, 0, 1.1] }), M(CYL(.55, .45, .2, 32), chrome(), { pos: [0, 0, 0] }), M(CYL(.5, .5, .02, 32), plastic(0x2a2a30), { pos: [0, -.11, 0] }));
    const R = rng(3), scale = []; for (let i = 0; i < 14; i++) { const d = M(SPH(.05, 8, 6), matte(0xf4f4f0), { pos: [(R() - .5) * .8, -.12, (R() - .5) * .8], scale: [1, .4, 1], shadow: false }); g.add(d); scale.push(d); }
    const streams = Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2, r = .15 + (i % 3) * .12, m = M(CYL(.015, .03, 2.2, 6), water(.55), { pos: [Math.cos(a) * r, -1.2, Math.sin(a) * r], shadow: false }); g.add(m); return m; });
    const bag = M(SPH(.65, 24, 16), plastic(0xffffff, { transparent: true, opacity: .35, roughness: .05, depthWrite: false }), { pos: [0, -.15, 0], scale: [1, .7, 1], shadow: false }); g.add(bag);
    const liquid = M(SPH(.6, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), water(.5), { pos: [0, -.12, 0], scale: [1, .6, 1], shadow: false }); g.add(liquid);
    return anim(g, (t, s, p) => { const st = p.state || 'clog'; streams.forEach((m, i) => { m.visible = st === 'good' || (st === 'clog' && i % 4 === 0); m.scale.x = m.scale.z = st === 'good' ? 1 : .6; });
      scale.forEach(d => d.visible = st !== 'good'); bag.visible = liquid.visible = st === 'soak'; }); };
  // a wood block with a screw hole: stripped (screw spins loose) | fill (toothpicks go in) | tight (screw drives in, sparkle)
  EXTRA.woodhole = () => { const g = G(M(RB(2.0, 1.2, 1.0, .04), plastic(0xc8945a, { roughness: .7 }), { pos: [0, .6, 0] }), M(CYL(.08, .08, .02, 16), matte(0x3a2410), { pos: [0, 1.21, 0] }));
    const screw = G(M(CYL(.16, .16, .06, 20), chrome(), { pos: [0, .5, 0] }), M(CYL(.06, .03, .5, 12), chrome(), { pos: [0, .22, 0] }), M(RB(.22, .03, .04, .01), matte(0x5a5a62), { pos: [0, .54, 0] })); g.add(screw);
    const picks = EXTRA.toothpicks(); picks.scale.setScalar(.8); g.add(picks); const sk = sparkle(g, [0, 1.6, .3]);
    return anim(g, (t, s, p) => { const st = p.state || 'stripped'; screw.visible = st !== 'fill'; picks.visible = st === 'fill';
      screw.rotation.y = s * (st === 'stripped' ? 6 : 3); screw.position.y = st === 'tight' ? lerp(1.15, .95, ease(seg(t, .1, .6))) : 1.0 + (st === 'stripped' ? Math.sin(s * 6) * .04 : 0);
      picks.position.y = lerp(1.6, 1.0, ease(seg(t, .1, .5))); sk(st === 'tight' ? clamp((t - .6) * 3) : 0); }); };

  // remember each prop's start height (the plunger bobs from it)
  const prop0 = PT.prop; // the shot builder calls prop() internally; y0 is set lazily on first anim call
  Object.keys(EXTRA).forEach(k => { const f = EXTRA[k]; EXTRA[k] = (look, arg) => { const g = f(look, arg); const a = g.userData.anim; if (a) g.userData.anim = function (t, s, p, d) { if (this.userData.y0 === undefined) this.userData.y0 = this.position.y; a.call(this, t, s, p, d); }.bind(g); return g; }; });

  // ---------- overlay: STEP pill above the captions ----------
  const prev = window.OVERLAY2, cv = document.getElementById('cv'), c = cv.getContext('2d');
  window.OVERLAY2 = (L, T) => { prev && prev(L, T); const p = L.p || {}; if (!p.step) return; const s = T - L.start, k = clamp(s / .3);
    c.save(); c.globalAlpha = k; c.font = '900 40px Inter, sans-serif'; const tx = String(p.step).toUpperCase(), w = c.measureText(tx).width + 60;
    c.fillStyle = '#3d7bff'; c.beginPath(); c.roundRect(540 - w / 2, 270, w, 70, 35); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(tx, 540, 306); c.restore(); };
}
