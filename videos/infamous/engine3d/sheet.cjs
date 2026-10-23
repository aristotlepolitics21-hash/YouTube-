// QA contact sheet: one frame from each line (60% through), labelled with index and scene.
const open = require('./serve.cjs');
(async () => { const [html, out, cols = 6] = process.argv.slice(2); const { b, p } = await open(html); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const n = await p.evaluate(() => window.__lines.length), urls = [];
  for (let i = 0; i < n; i++) urls.push(await p.evaluate(([i, C]) => { const l = window.__lines[i]; window.__at(l.start + (l.end - l.start) * .6); return [i, l.scene, document.getElementById(C).toDataURL('image/jpeg', .55)]; }, [i, process.env.CANVAS || 'cv']));
  await p.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${cols},1fr);gap:2px;background:#000;font:13px sans-serif;color:#ff0">` + urls.map(([i, s, u]) => `<div style="position:relative"><img src="${u}" style="width:100%;display:block"><b style="position:absolute;left:3px;top:2px;background:#000">${i} ${s}</b></div>`).join('') + '</body>');
  await p.setViewportSize({ width: 2100, height: 900 }); await p.screenshot({ path: out, fullPage: true }); console.log('frames', urls.length, 'errors', JSON.stringify(errs)); await b.close(); })();
