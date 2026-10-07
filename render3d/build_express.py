"""Build express-shorts/swallow_gum_3d.html: each 3D still as a full-bleed
background with the ZackDFilms-style caption on top, images inlined as JPEG."""
import base64, io, pathlib
from PIL import Image

root = pathlib.Path(__file__).resolve().parent
caps = [
    'What happens if you <span class="hl">swallow gum?</span>',
    'It slides down your <span class="hl">esophagus</span>',
    'Stomach acid <span class="red">can\'t</span> break it down',
    'So it just… <span class="hl">keeps moving</span>',
    'A few days later it comes out <span class="hl">mostly whole</span>',
    'But swallow a lot at once and it can <span class="red">block your gut</span>',
]
slides = []
for i, cap in enumerate(caps, 1):
    buf = io.BytesIO()
    Image.open(root / 'stills' / f'shot{i}.png').convert('RGB').save(buf, 'JPEG', quality=84)
    b64 = base64.b64encode(buf.getvalue()).decode()
    slides.append(f'''<section class="slide" data-canvas-width="1080" data-canvas-height="1920">
  <img class="bg" src="data:image/jpeg;base64,{b64}" alt="">
  <div class="shade"></div>
  <p class="num">{i}/6</p>
  <h2 class="cap">{cap}</h2>
</section>''')

html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="hz:slide-selector" content=".slide">
<meta name="hz:canvas-width" content="1080"><meta name="hz:canvas-height" content="1920">
<title>Swallow Gum 3D</title>
<link rel="stylesheet" href="https://use.typekit.net/est8dpn.css">
<style>
  html, body {{ margin: 0; background: #000; }}
  .slide {{ position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #000; margin: 0 auto 40px; }}
  .bg {{ position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }}
  .shade {{ position: absolute; left: 0; top: 1100px; width: 1080px; height: 820px;
           background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.55) 100%); }}
  .cap {{ position: absolute; left: 60px; width: 960px; top: 1300px; margin: 0;
         font-family: "archivo-black", sans-serif; font-size: 92px; line-height: 1.08;
         color: #fff; text-align: center; text-transform: uppercase; }}
  .cap .hl {{ color: #ffd23f; }} .cap .red {{ color: #ff3b3b; }}
  .num {{ position: absolute; right: 60px; top: 110px; margin: 0; font-family: "acumin-pro", sans-serif;
         font-weight: 700; font-size: 38px; color: rgba(255,255,255,.6); }}
</style></head><body>
{chr(10).join(slides)}
</body></html>
'''
out = root.parent / 'express-shorts' / 'swallow_gum_3d.html'
out.write_text(html)
print(out, len(html))
