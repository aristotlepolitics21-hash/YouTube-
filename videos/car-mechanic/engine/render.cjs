// usage: render.cjs EPDIR WORKDIR OUT.mp4 F0 F1   -> renders frames [F0, F1) at 30 fps (no audio)
//        render.cjs EPDIR WORKDIR OUT.jpg --still T [T2 ...] -> saves stills at those times (several: OUT_0.jpg, OUT_1.jpg ...)
// WORKDIR holds durs.json and caps.json from ../../tech-shorts/engine/voice.py.
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
(async () => {
  const [ep, w, out, f0, ...rest] = process.argv.slice(2), FPS = 30, sc = JSON.parse(fs.readFileSync(`${ep}/script.json`));
  const lines = sc.sections.flatMap(s => s.lines), durs = JSON.parse(fs.readFileSync(`${w}/durs.json`)), caps = JSON.parse(fs.readFileSync(`${w}/caps.json`));
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => m.type() === 'error' && console.log('ERR', m.text()));
  await p.goto('file://' + path.join(__dirname, 'page.html'));
  await p.evaluate(d => window.setup(d), { beats: lines.map(l => l[1]), durs, caps, ep: { num: sc.episode, counter: sc.counter, look: sc.look, note: sc.note, of: sc.of } });
  const grab = async T => Buffer.from((await p.evaluate(t => { window.__at(t); return document.getElementById('cv').toDataURL('image/jpeg', .92); }, T)).split(',')[1], 'base64');
  if (f0 === '--still') { for (let i = 0; i < rest.length; i++) fs.writeFileSync(rest.length > 1 ? out.replace(/\.jpg$/, `_${i}.jpg`) : out, await grab(+rest[i])); await b.close(); return; }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = +f0; f < +rest[0]; f++) { const buf = await grab(f / FPS); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})();
