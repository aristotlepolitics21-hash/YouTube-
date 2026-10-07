// Frame capture: serves this folder over http, drives index.html in headless Chrome,
// and writes one PNG per frame. `node render.mjs --stills` writes one still per card instead.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const STILLS = process.argv.includes('--stills');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r)); // port 0 = any free port
const url = `http://127.0.0.1:${server.address().port}/index.html`;

// Use a preinstalled Chromium when one is configured, otherwise puppeteer's own download.
const executablePath =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

const browser = await puppeteer.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--font-render-hinting=none', '--force-color-profile=srgb'],
});

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.error('page error:', e.message));
  page.on('console', (m) => console.log('page:', m.text()));
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.READY === true', { timeout: 30000 });

  const { duration, fps, stills, layout } = await page.evaluate(() => ({
    duration: window.DURATION,
    fps: window.FPS,
    stills: window.CARD_STILLS,
    layout: window.LAYOUT(),
  }));
  for (const l of layout) console.log(`  ${String(l.size).padStart(3)}px  ${String(l.width).padStart(4)}px wide  ${l.line}`);

  const grab = (t) =>
    page.evaluate((t) => {
      window.renderFrame(t);
      return document.getElementById('c').toDataURL('image/png').split(',')[1];
    }, t);

  if (STILLS) {
    const dir = path.join(ROOT, 'stills');
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < stills.length; i++) {
      const file = path.join(dir, `card${i + 1}.png`);
      fs.writeFileSync(file, Buffer.from(await grab(stills[i]), 'base64'));
      console.log(`card ${i + 1} @ ${stills[i].toFixed(3)}s -> ${path.relative(ROOT, file)}`);
    }
  } else {
    const dir = path.join(ROOT, 'frames');
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const total = Math.ceil(duration * fps);
    console.log(`${total} frames, ${duration.toFixed(3)}s at ${fps} fps`);
    for (let i = 0; i < total; i++) {
      const name = `f${String(i).padStart(5, '0')}.png`;
      fs.writeFileSync(path.join(dir, name), Buffer.from(await grab(i / fps), 'base64'));
      if (i % 60 === 0 || i === total - 1) process.stdout.write(`\r  ${i + 1}/${total}`);
    }
    process.stdout.write('\n');
  }
} finally {
  await browser.close();
  server.close();
}
