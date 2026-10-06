const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const [html, outdir] = process.argv.slice(2), FPS = 30;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1300, height: 760 } });
  await p.goto('file://' + html); await p.waitForTimeout(500);
  const shots = await p.evaluate(() => window.HERO.shots);
  for (const s of shots) {
    const out = `${outdir}/shot-${String(s.n).padStart(3, '0')}.mp4`, N = s.dur * FPS;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-vf', `fade=in:0:8,fade=out:${N - 8}:8`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) {
      const url = await p.evaluate(([n, k, T]) => window.HERO.draw(n, k, T).toDataURL('image/jpeg', .93), [s.n, f / (N - 1), f / FPS]);
      if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); await p.evaluate(n => window.HERO.free(n), s.n); console.log('done shot', s.n);
  }
  await b.close();
})();
