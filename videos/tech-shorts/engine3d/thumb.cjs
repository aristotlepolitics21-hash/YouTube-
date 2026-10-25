// usage: thumb.cjs PAGE.html OUT.jpg [line]  -> the title card (line 1 by default) without captions
const open = require('./serve.cjs');
(async () => { const [html, out, line = '1'] = process.argv.slice(2); const { b, p } = await open(html);
  await p.evaluate(i => { const L = TL[i]; L.cap = null; window.__at(L.start + (L.end - L.start) * .6); }, +line);
  await (await p.$('#cv')).screenshot({ path: out, type: 'jpeg', quality: 90 }); await b.close(); })();
