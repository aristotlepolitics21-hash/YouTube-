import json, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
D = "/tmp/claude-0/-home-user-YouTube-/aece8624-b638-5e16-a980-11f89b661b06/scratchpad/doc"; F = "/tmp/claude-0/-home-user-YouTube-/aece8624-b638-5e16-a980-11f89b661b06/scratchpad/fonts/Anton.ttf"
n, slug, scene, w1, w2, intro, facts = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], sys.argv[6], json.loads(sys.argv[7])
E = f"{D}/ep{n}"; R = f"/home/user/YouTube-/videos/historic-disasters/{n}-{slug}"
sc = json.load(open(f"{R}/script.json")); durs = json.load(open(f"{E}/durs.json")); lines = [l for s in sc["sections"] for l in s["lines"]]
t = 0; pick = None
for l, d in zip(lines, durs):
    if l[0] == scene and pick is None and l is not lines[0]: pick = t + d * .7
    t += d
pick = pick or 30
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(pick), "-i", f"{E}/master.mp4", "-frames:v", "1", f"{E}/tframe.png"], check=True)
im = Image.open(f"{E}/tframe.png").convert("RGBA").resize((1280, 720)); ov = Image.new("RGBA", im.size); od = ImageDraw.Draw(ov)
for x in range(700): od.line([(x, 0), (x, 720)], fill=(8, 10, 14, int(215 * (1 - x / 700))))
im = Image.alpha_composite(im, ov).convert("RGB"); d = ImageDraw.Draw(im); f = ImageFont.truetype(F, 140)
d.text((60, 160), w1, font=f, fill=(232, 225, 210)); d.text((60, 330), w2, font=f, fill=(190, 52, 40)); im.save(f"{R}/thumbnail.jpg", quality=92)
ch = open(f"{E}/chapters.txt").read().strip()
desc = f"{intro}\n\nHistoric Disasters, episode {int(n)}.\n\nCHAPTERS\n{ch}\n\nKey facts in this film:\n" + "\n".join("- " + x for x in facts) + "\n\nAnimation: original stickman illustration. Narration: AI voice.\n\n#History #Documentary #HistoricDisasters\n"
open(f"{R}/description.txt", "w").write(desc)
for fn in ["captions.srt", "chapters.txt"]: subprocess.run(["cp", f"{E}/{fn}", R])
print(open(f"{E}/chapters.txt").read())
