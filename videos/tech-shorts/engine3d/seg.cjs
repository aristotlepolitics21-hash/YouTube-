// usage: seg.cjs PAGE.html OUT.mp4 F0 F1 FPS  -> renders frames [F0, F1) and pipes them to ffmpeg
const open = require('./serve.cjs'); const { spawn } = require('child_process');
(async () => {
  const [html, out, f0, f1, fps] = process.argv.slice(2), FPS = +fps;
  const { b, p } = await open(html);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = +f0; f < +f1; f++) {
    const url = await p.evaluate(([f, FPS]) => { window.__at(f / FPS); return document.getElementById('cv').toDataURL('image/jpeg', .92); }, [f, FPS]);
    if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 150 === 0) console.log('frame', f, Math.round((Date.now() - t0) / Math.max(1, f - f0)), 'ms/frame');
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('segment done', out);
})();
