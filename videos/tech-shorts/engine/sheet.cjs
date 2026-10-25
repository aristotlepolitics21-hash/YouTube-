// usage: sheet.cjs PAGE.html OUTDIR [frac]  -> one PNG per line at frac of the way through it
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [html, out, frac = '0.75'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + html); await p.waitForFunction(() => window.__ready, null, { timeout: 10000 }).catch(() => console.log('font timeout'));
  const n = await p.evaluate(() => TL.length);
  for (let i = 0; i < n; i++) {
    await p.evaluate(([i, f]) => { const L = TL[i]; window.__at(L.start + (L.end - L.start) * f); }, [i, +frac]);
    await (await p.$('#cv')).screenshot({ path: `${out}/${String(i).padStart(2, '0')}.png` });
  }
  await b.close();
})();
