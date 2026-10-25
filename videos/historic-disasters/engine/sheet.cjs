const { chromium } = require('playwright');
(async () => {
  const [html, out] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 760 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + html); await p.waitForFunction(() => window.__ready, null, { timeout: 10000 }).catch(() => errs.push('font timeout'));
  const urls = await p.evaluate(() => window.__lines.map((l, i) => { window.__at(l.start + (l.end - l.start) * .6); return [i, l.scene, document.getElementById('cv').toDataURL('image/jpeg', .5)]; }));
  await p.setContent('<body style="margin:0;display:grid;grid-template-columns:repeat(6,1fr);gap:2px;background:#000;font:13px sans-serif;color:#ff0">' + urls.map(([i, s, u]) => `<div style="position:relative"><img src="${u}" style="width:100%;display:block"><b style="position:absolute;left:3px;top:2px;background:#000">${i} ${s}</b></div>`).join('') + '</body>');
  await p.setViewportSize({ width: 2100, height: 900 }); await p.screenshot({ path: out, fullPage: true }); console.log('frames', urls.length, 'errors', JSON.stringify(errs)); await b.close();
})();
