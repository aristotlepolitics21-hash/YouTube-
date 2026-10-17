// Opens the film page in headless Chromium (software GL), serving the page, engine and three.js from disk.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
module.exports = async function open(html) {
  const vert = /FILM_H = 1920/.test(fs.readFileSync(html, 'utf8'));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: vert ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await p.route('http://film.local/**', r => { const u = new URL(r.request().url()).pathname; let f;
    if (u === '/page.html') f = html; else if (u.startsWith('/engine/')) f = path.join(__dirname, u.slice(8)); else if (u.startsWith('/three/')) f = path.join(__dirname, 'node_modules/three', u.slice(7));
    if (!f || !fs.existsSync(f)) return r.fulfill({ status: 404, body: 'nf' });
    r.fulfill({ status: 200, contentType: MIME[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); });
  await p.goto('http://film.local/page.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
  return { b, p };
};
