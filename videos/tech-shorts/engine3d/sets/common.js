// Helpers shared by episode set files, and the generic recap set.
export function common(K) {
  const { THREE, BUILD, C, M, RB, plastic, ctex, rrect, label, sign, stage, aim, pop, frac, lerp } = K;
  if (common.done) return common.done;
  // expanding wave rings: additive glowing tori that grow from a point and fade
  function waves(color, n = 5, R = 3, rate = .7, thick = .045) {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) g.add(new THREE.Mesh(new THREE.TorusGeometry(1, thick, 8, 96), new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })));
    g.update = (s, strength = 1, reach = 1) => g.children.forEach((r, i) => { const ph = frac(s * rate + i / n); r.scale.setScalar(.25 + ph * R * reach); r.material.opacity = (1 - ph) * strength * .95; r.visible = strength > .01; });
    return g;
  }
  // a face drawn on a screen: two eyes and a mouth
  function faceTex(bg, eye, mood = 'smile') {
    return ctex(256, 256, (x, w, h) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.fillStyle = eye; x.strokeStyle = eye; x.lineWidth = 12; x.lineCap = 'round';
      if (mood === 'dizzy') [-1, 1].forEach(s => { x.beginPath(); x.moveTo(128 + s * 50 - 18, 90); x.lineTo(128 + s * 50 + 18, 126); x.moveTo(128 + s * 50 + 18, 90); x.lineTo(128 + s * 50 - 18, 126); x.stroke(); });
      else [-1, 1].forEach(s => { rrect(x, 128 + s * 50 - 15, 82, 30, 50, 15); x.fill(); });
      x.beginPath(); if (mood === 'sad' || mood === 'dizzy') x.arc(128, 200, 30, Math.PI * 1.15, Math.PI * 1.85); else x.arc(128, 160, 34, Math.PI * .15, Math.PI * .85); x.stroke(); });
  }
  function screenFace(w, h, bg, eye, mood) { const f = faceTex(bg, eye, mood); const m = M(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: f.tex, toneMapped: false }), { shadow: false }); m.userData.set = md => f.redraw((x, cw, ch) => { const t = faceTex(bg, eye, md); x.drawImage(t.tex.image, 0, 0); }); return m; }

  function makePhone(col = 0xff6fb1, mood = 'smile') {
    const g = new THREE.Group(); g.add(M(RB(.78, 1.45, .14, .14), plastic(col)));
    const f = screenFace(.62, 1.2, '#141a2c', '#9df7ff', mood); f.position.z = .072; g.add(f); g.userData.face = f; return g;
  }
  BUILD.w_recap = (p) => {
    const st = stage({ top: '#a2d8ff', bottom: '#ffe6c2', floor: 0xffdcb0 }), cols = ['#35c8ef', '#9b7bff', '#59c21a', '#ff4fa3', '#ffab1f'];
    const slabs = p.items.map(([l], i) => { const c = cols[i]; const g = sign(3.5, .74, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = c; x.beginPath(); x.arc(h / 2 + 6, h / 2, h * .36, 0, 7); x.fill(); label(x, String(i + 1), h / 2 + 6, h / 2 + 4, h * .46, '#fff', 900);
        label(x, l, h + 18, h / 2 + 3, h * .3, '#1d2442', 900, 'left'); }, { color: 0xffffff, depth: .22 }); g.position.set(0, 4.75 - i * .92, 0); st.scene.add(g); return g; });
    return { ...st, update(t, s) { slabs.forEach((g, i) => { const a = i * .17, act = t > a && t < a + .2; g.scale.setScalar(Math.min(1, pop((t - a) * 5)) * (act ? 1.06 : 1)); g.position.z = act ? .35 : 0; g.rotation.y = Math.sin(s * 1.5 + i) * .04; });
      aim(st.cam, [0, 3.0, lerp(9.6, 9.2, t)], [0, 2.75, 0]); } };
  };
  return (common.done = { waves, faceTex, screenFace, makePhone });
}
