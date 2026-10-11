"""Contact sheet of a cartoon story: one frame from the middle of each beat, to check
layouts before a full render.  python3 stories/contact.py stories/fridge/fridge.json out.png"""
import json, pathlib, sys
from PIL import Image, ImageDraw
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import cartoon

ep = json.loads(pathlib.Path(sys.argv[1]).read_text())
shots = [s for s in ep['shots'] if 'set' in s or 'insert' in s]
cols, tw, th = 6, 270, 480
sheet = Image.new('RGB', (cols * tw, ((len(shots) + cols - 1) // cols) * th), 'black')
for i, s in enumerate(shots):
    im = cartoon.render(s, ep.get('cast', {}), float(sys.argv[3]) if len(sys.argv) > 3 else 0.6, 1.5).resize((tw, th))
    ImageDraw.Draw(im).text((8, 8), str(i + 1), fill='white')
    sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
sheet.save(sys.argv[2])
