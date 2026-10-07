// Render the 3D shots to PNG with headless Chromium.
//   node render.mjs --stills            one PNG per shot (t = 0.7) in stills/
//   node render.mjs --shot 2 --frames 90  PNG sequence in frames/shot2/ (t from 0 to 1)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i < 0 ? d : (args[i + 1] ?? true); };
const root = path.dirname(new URL(import.meta.url).pathname);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };

const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.error('[page error]', e.message));
await page.setViewport({ width: 1080, height: 1920 });
await page.goto(`http://localhost:${port}/index.html`);
await page.waitForFunction('window.ready === true', { timeout: 120000 });

async function grab(shot, t, file) {
  await page.evaluate((s, tt) => window.renderShot(s, tt), shot, t);
  const data = await page.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
}

if (flag('--stills', false)) {
  fs.mkdirSync(path.join(root, 'stills'), { recursive: true });
  const only = flag('--shot', null);
  for (let s = 0; s < 6; s++) {
    if (only !== null && Number(only) !== s) continue;
    const t0 = Date.now();
    await grab(s, Number(flag('--t', 0.7)), path.join(root, 'stills', `shot${s + 1}.png`));
    console.log(`shot${s + 1}.png ${Date.now() - t0}ms`);
  }
} else {
  const s = Number(flag('--shot', 0)), n = Number(flag('--frames', 90));
  const dir = path.join(root, 'frames', `shot${s + 1}`); fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < n; i++) {
    await grab(s, i / (n - 1), path.join(dir, `f${String(i).padStart(4, '0')}.png`));
    if (i % 15 === 0) console.log(`shot${s + 1} frame ${i}/${n}`);
  }
}
await browser.close(); server.close();
