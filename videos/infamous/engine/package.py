import json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
# usage: package.py EPDIR WORKDIR   (EPDIR holds script.json with a "package" block; WORKDIR holds the render)
R, E = sys.argv[1], sys.argv[2]; W = os.environ.get("WORK", "/tmp"); F = f"{W}/fonts/Anton.ttf"
sc = json.load(open(f"{R}/script.json")); pk = sc["package"]; durs = json.load(open(f"{E}/durs.json"))
mp4 = [f for f in os.listdir(E) if f.startswith("infamous-") and f.endswith(".mp4")][0]
pick = sum(durs[:pk.get("thumb_line", 1)]) + durs[pk.get("thumb_line", 1)] * .7
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(pick), "-i", f"{E}/{mp4}", "-frames:v", "1", f"{E}/tframe.png"], check=True)
im = Image.open(f"{E}/tframe.png").convert("RGBA").resize((1280, 720)); ov = Image.new("RGBA", im.size); od = ImageDraw.Draw(ov)
for x in range(760): od.line([(x, 0), (x, 720)], fill=(8, 10, 14, int(225 * (1 - x / 760))))
im = Image.alpha_composite(im, ov).convert("RGB"); d = ImageDraw.Draw(im)
w1, w2 = pk["thumb"]; size = 150 if max(len(w1), len(w2)) <= 7 else 120 if max(len(w1), len(w2)) <= 10 else 96; f = ImageFont.truetype(F, size)
d.text((60, 150), w1, font=f, fill=(232, 225, 210)); d.text((60, 160 + size * 1.15), w2, font=f, fill=(190, 52, 40)); im.save(f"{R}/thumbnail.jpg", quality=90)
ch = open(f"{E}/chapters.txt").read().strip()
desc = f"{pk['intro']}\n\nInfamous, episode {sc['episode']}.\n\nCHAPTERS\n{ch}\n\nKey facts in this film:\n" + "\n".join("- " + x for x in pk["facts"]) + f"\n\nSources: {pk['sources']}\n\nAnimation: original stickman illustration. Narration: AI voice. This film describes historical crimes for education; it does not endorse them.\n\n{pk['hashtags']}\n"
open(f"{R}/description.txt", "w").write(desc); open(f"{R}/tags.txt", "w").write(pk["tags"] + "\n")
for fn in ["captions.srt", "chapters.txt"]: subprocess.run(["cp", f"{E}/{fn}", R], check=True)
subprocess.run(["cp", f"{E}/{mp4}", R], check=True); print("packaged", R, mp4)
