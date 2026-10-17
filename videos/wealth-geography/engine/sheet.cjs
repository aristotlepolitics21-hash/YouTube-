// usage: sheet.cjs PAGE.html OUTDIR [frac] [only]  -> one JPEG per line at frac of the way through it (only: comma list of line indexes)
const open = require('./serve.cjs'); const fs = require('fs');
(async () => {
  const [html, out, frac = '0.6', only] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const { b, p } = await open(html); const n = await p.evaluate(() => TL.length);
  const idx = only ? only.split(',').map(Number) : [...Array(n).keys()];
  for (const i of idx) { const t0 = Date.now(); const url = await p.evaluate(([i, f]) => { const L = TL[i]; window.__at(L.start + (L.end - L.start) * f); return document.getElementById('cv').toDataURL('image/jpeg', .85); }, [i, +frac]);
    fs.writeFileSync(`${out}/${String(i).padStart(2, '0')}.jpg`, Buffer.from(url.split(',')[1], 'base64')); console.log(i, Date.now() - t0, 'ms'); }
  await b.close();
})();
