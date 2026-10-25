const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs');
(async () => {
  const [html, planF, outdir, wi, wn] = process.argv.slice(2);
  const plan = JSON.parse(fs.readFileSync(planF)); const FPS = plan.fps;
  const mine = plan.shots.filter((s, i) => i % +wn === +wi);
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1300, height: 760 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + html); await p.waitForTimeout(500);
  for (const s of mine) {
    const out = `${outdir}/shot-${String(s.n).padStart(3, '0')}.mp4`; if (fs.existsSync(out)) continue; const N = s.frames, tmp = out + '.tmp.mp4';
    const vf = [s.fadeIn ? 'fade=in:0:8' : null, s.fadeOut ? `fade=out:${Math.max(0, N - 8)}:8` : null].filter(Boolean);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', ...(vf.length ? ['-vf', vf.join(',')] : []), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium', '-r', String(FPS), '-f', 'mp4', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = 0; f < N; f++) {
      const url = await p.evaluate(([n, k, T]) => window.FILM.draw(n, k, T).toDataURL('image/jpeg', .92), [s.n, N > 1 ? f / (N - 1) : 0, f / FPS]);
      if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); fs.renameSync(tmp, out); await p.evaluate(n => window.FILM.free(n), s.n); console.log('done', s.n);
  }
  await b.close(); console.log('worker finished', wi);
})();
