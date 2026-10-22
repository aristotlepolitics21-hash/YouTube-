// Renders frames [f0, f1) of an Infamous 3D page to an H.264 segment.
const open = require('./serve.cjs'); const { spawn } = require('child_process');
(async () => { const [html, out, f0, f1, fps] = process.argv.slice(2); const FPS = +fps; const { b, p } = await open(html);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'medium', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = +f0; f < +f1; f += 6) { const urls = await p.evaluate(([a, b, FPS]) => { const r = []; for (let f = a; f < b; f++) { window.__at(f / FPS); r.push(document.getElementById('cv').toDataURL('image/jpeg', .9)); } return r; }, [f, Math.min(+f1, f + 6), FPS]);
    for (const u of urls) if (!ff.stdin.write(Buffer.from(u.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('segment done', out); })();
