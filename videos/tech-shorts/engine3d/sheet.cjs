// usage: sheet.cjs PAGE.html OUTDIR [frac] [only]  -> one PNG per line at frac of the way through it (only: comma list of line indexes)
const open = require('./serve.cjs'); const fs = require('fs');
(async () => {
  const [html, out, frac = '0.7', only] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const { b, p } = await open(html); const n = await p.evaluate(() => TL.length);
  const idx = only ? only.split(',').map(Number) : [...Array(n).keys()];
  for (const i of idx) { const t0 = Date.now(); await p.evaluate(async ([i, f]) => { const L = TL[i]; await window.__at(L.start + (L.end - L.start) * f); }, [i, +frac]);
    await (await p.$('#cv')).screenshot({ path: `${out}/${String(i).padStart(2, '0')}.png` }); console.log(i, Date.now() - t0, 'ms'); }
  await b.close();
})();
