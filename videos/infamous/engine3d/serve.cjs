// Opens an Infamous 3D page in headless Chromium (software GL), serving the page, both engines, three.js and mannequin.js from disk.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf' };
const ROOTS = { '/engine/': __dirname, '/bio/': path.join(__dirname, '../engine'), '/hd/': path.join(__dirname, '../../historic-disasters/engine'), '/three/': path.join(__dirname, 'node_modules/three'), '/mq/': path.join(__dirname, 'node_modules/mannequin-js') };
module.exports = async function open(html, W = 1280, H = 720) {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await p.route('http://inf3d.local/**', r => { const u = new URL(r.request().url()).pathname; let f;
    if (u === '/page.html') f = html; else if (u === '/Anton.ttf') f = process.env.ANTON || path.join(process.env.WORK || '/tmp', 'fonts/Anton.ttf');
    else for (const [k, d] of Object.entries(ROOTS)) if (u.startsWith(k)) { f = path.join(d, u.slice(k.length)); break; }
    if (!f || !fs.existsSync(f)) return r.fulfill({ status: 404, body: 'nf' });
    r.fulfill({ status: 200, contentType: MIME[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); });
  await p.goto('http://inf3d.local/page.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
  return { b, p };
};
