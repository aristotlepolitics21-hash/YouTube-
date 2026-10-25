const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const [html, out, f0, f1, fps] = process.argv.slice(2); const FPS = +fps;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1300, height: 760 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + html); await p.waitForFunction(() => window.__ready, null, { timeout: 10000 }).catch(() => console.log('font timeout'));
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', '-preset', 'medium', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = +f0; f < +f1; f += 8) {
    const urls = await p.evaluate(([a, b, FPS]) => { const r = []; for (let f = a; f < b; f++) { window.__at(f / FPS); r.push(document.getElementById('cv').toDataURL('image/jpeg', .9)); } return r; }, [f, Math.min(+f1, f + 8), FPS]);
    for (const u of urls) if (!ff.stdin.write(Buffer.from(u.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('segment done', out);
})();
