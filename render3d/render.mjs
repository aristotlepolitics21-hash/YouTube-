// Render the 3D shots to images with headless Chromium.
//   node render.mjs --stills                one PNG per shot (t = 0.7) in stills/
//   node render.mjs --shot 2 --frames 90    image sequence in frames/shot3/ (t from 0 to 1)
//   --ep knuckles                           render episode knuckles.js; output goes under
//                                           stills/knuckles/ and frames/knuckles/ instead
//   --scene approach                        render a named scene (episodes using run({...}))
//   --params '{"popAt":0.4}'               values passed to the scene (window.shotParams)
//   --size 1920x1080                        frame size (default 1080x1920)
//   --out shot07                            frames sub-directory name (default shot<N>)
//   --format jpg                            jpg (faster, smaller) or png (default)
// Frames already on disk are kept, so an interrupted render resumes where it stopped.
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

const [w, h] = String(flag('--size', '1080x1920')).split('x').map(Number);
const fmt = flag('--format', 'png') === 'jpg' ? 'jpg' : 'png';
const browser = await puppeteer.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage();
page.on('console', (m) => { if (!m.text().includes('404')) console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[page error]', e.message));
await page.setViewport({ width: w, height: h });
const ep = flag('--ep', null);
const sub = ep ? ep : '';
await page.goto(`http://localhost:${port}/index.html?w=${w}&h=${h}${ep ? `&ep=${ep}` : ''}`);
await page.waitForFunction('window.ready === true', { timeout: 120000 });
await page.evaluate((p) => { window.shotParams = p; }, JSON.parse(flag('--params', '{}')));

async function grab(key, t, file, mime = 'image/png') {
  await page.evaluate((s, tt) => window.renderShot(s, tt), key, t);
  const data = await page.evaluate((m) => document.querySelector('canvas').toDataURL(m, 0.93), mime);
  fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
}

if (flag('--stills', false)) {
  const outDir = path.join(root, 'stills', sub);
  fs.mkdirSync(outDir, { recursive: true });
  const only = flag('--shot', null), scene = flag('--scene', null);
  const names = scene ? [scene] : await page.evaluate(() => window.shotNames);
  for (const [i, name] of names.entries()) {
    if (only !== null && Number(only) !== i) continue;
    const key = /^\d+$/.test(name) ? Number(name) : name;
    const file = scene ? `${flag('--out', scene)}.png` : `shot${i + 1}.png`;
    const t0 = Date.now();
    await grab(key, Number(flag('--t', 0.7)), path.join(outDir, file));
    console.log(`${file} ${Date.now() - t0}ms`);
  }
} else {
  const scene = flag('--scene', null);
  const s = Number(flag('--shot', 0)), n = Number(flag('--frames', 90));
  const key = scene ?? s;
  const dir = path.join(root, 'frames', sub, flag('--out', `shot${s + 1}`)); fs.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < n; i++) {
    const file = path.join(dir, `f${String(i).padStart(4, '0')}.${fmt}`);
    if (fs.existsSync(file) && fs.statSync(file).size > 0) continue;
    await grab(key, n > 1 ? i / (n - 1) : 0, file + '.tmp', fmt === 'jpg' ? 'image/jpeg' : 'image/png');
    fs.renameSync(file + '.tmp', file);
    if (i % 24 === 0) console.log(`${path.basename(dir)} frame ${i}/${n}`);
  }
}
await browser.close(); server.close();
