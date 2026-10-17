// Opens the 3D page in headless Chromium (software GL), serving the page, engine and three.js from disk.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.webm': 'video/webm' };
module.exports = async function open(html) {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-accelerated-2d-canvas'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('CONSOLE', m.text()));
  await p.route('http://tech3d.local/**', r => { const u = new URL(r.request().url()).pathname; let f;
    if (u === '/page.html') f = html; else if (u.startsWith('/engine/')) f = path.join(__dirname, u.slice(8)); else if (u.startsWith('/three/')) f = path.join(__dirname, 'node_modules/three', u.slice(7)); else if (u.startsWith('/abs/')) f = decodeURIComponent(u.slice(4));
    if (!f || !fs.existsSync(f)) return r.fulfill({ status: 404, body: 'nf' });
    r.fulfill({ status: 200, contentType: MIME[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); });
  await p.goto('http://tech3d.local/page.html'); await p.waitForFunction(() => window.__ready, null, { timeout: 60000 });
  return { b, p };
};
