// usage: render.cjs EPDIR WORKDIR OUT.mp4 F0 F1  -> renders frames [F0, F1) of the episode at 30 fps to OUT.mp4 (no audio)
// WORKDIR holds durs.json and caps.json from ../../tech-shorts/engine/voice.py; EPDIR/images/sN.jpg are the scenes.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
(async () => {
  const [ep, w, out, f0, f1] = process.argv.slice(2), FPS = 30, sc = JSON.parse(fs.readFileSync(`${ep}/script.json`));
  const lines = sc.sections.flatMap(s => s.lines), durs = JSON.parse(fs.readFileSync(`${w}/durs.json`)), caps = JSON.parse(fs.readFileSync(`${w}/caps.json`));
  const images = lines.map(l => 'data:image/jpeg;base64,' + fs.readFileSync(`${w}/img/${l[0]}.jpg`).toString('base64'));
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.join(__dirname, 'page.html'));
  await p.evaluate(d => window.setup(d), { images, durs, caps, texts: lines.map(l => l[2]) });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = +f0; f < +f1; f++) { const url = await p.evaluate(t => { window.__at(t); return document.getElementById('cv').toDataURL('image/jpeg', .9); }, f / FPS);
    if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})();
