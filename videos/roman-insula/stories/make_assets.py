# usage: python3 make_assets.py
# Draws the two painted textures the Edo and Egypt sets use, into assets/:
#   frieze.png  an Egyptian tomb-painting practice wall: a register of striding figures and
#               hieroglyph columns, finished in colour on the left and only sketched in red on the right
#   scroll.png  a Japanese hanging scroll: a plum branch in ink with red blossoms and a line of script
import math
import os
import random

from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(OUT, exist_ok=True)


def figure(d, x, y, s, fill=True, facing=1):
    """A striding Egyptian figure in profile, feet at (x, y), s = height in px."""
    skin, kilt, wig, collar, line = (150, 70, 40), (235, 228, 210), (25, 20, 20), (40, 110, 120), (170, 40, 30)
    w = s / 6
    head = (x - w * 0.55, y - s, x + w * 0.55, y - s + w * 1.2)
    body = [(x - w * 0.6, y - s + w * 1.5), (x + w * 0.6, y - s + w * 1.5), (x + w * 0.45, y - s * 0.52),
            (x - w * 0.45, y - s * 0.52)]
    skirt = [(x - w * 0.6, y - s * 0.55), (x + w * 0.9 * facing, y - s * 0.55), (x + w * 0.5 * facing, y - s * 0.28),
             (x - w * 0.7, y - s * 0.28)]
    legs = [((x - w * 0.3, y - s * 0.3), (x - w * 1.2 * facing, y)), ((x + w * 0.3, y - s * 0.3), (x + w * 1.3 * facing, y))]
    arms = [((x, y - s + w * 1.7), (x + w * 2.2 * facing, y - s * 0.62)), ((x, y - s + w * 1.7), (x - w * 0.6, y - s * 0.45))]
    if fill:
        for a, b in legs + arms:
            d.line([a, b], fill=skin, width=int(w * 0.5))
        d.polygon(body, fill=skin)
        d.polygon(skirt, fill=kilt)
        d.ellipse(head, fill=skin)
        wx0, wx1 = (head[0] - w * 0.2, x + w * 0.05) if facing > 0 else (x - w * 0.05, head[2] + w * 0.2)
        d.rectangle((wx0, head[1] - w * 0.12, wx1, head[3] + w * 0.55), fill=wig)  # wig on the back of the head
        d.ellipse((x + w * 0.25 * facing - w * 0.06, head[1] + w * 0.4, x + w * 0.25 * facing + w * 0.06,
                   head[1] + w * 0.52), fill=(20, 15, 15))  # eye
        d.line([(x - w * 0.6, y - s + w * 1.55), (x + w * 0.6, y - s + w * 1.55)], fill=collar, width=int(w * 0.45))
    else:  # the sketch: red outline only
        for a, b in legs + arms:
            d.line([a, b], fill=line, width=3)
        d.polygon(body, outline=line, width=3)
        d.polygon(skirt, outline=line, width=3)
        d.ellipse(head, outline=line, width=3)


def glyph(d, x, y, s, rnd, color):
    k = rnd.randrange(6)
    if k == 0:  # water
        for i in range(3):
            pts = [(x + j * s / 6, y + i * s / 5 + (s / 14) * math.sin(j)) for j in range(7)]
            d.line(pts, fill=color, width=3)
    elif k == 1:  # eye
        d.ellipse((x, y + s * 0.25, x + s, y + s * 0.6), outline=color, width=3)
        d.ellipse((x + s * 0.4, y + s * 0.3, x + s * 0.6, y + s * 0.55), fill=color)
    elif k == 2:  # reed
        d.line([(x + s * 0.5, y), (x + s * 0.5, y + s)], fill=color, width=4)
        d.polygon([(x + s * 0.5, y), (x + s * 0.8, y + s * 0.3), (x + s * 0.5, y + s * 0.4)], fill=color)
    elif k == 3:  # sun
        d.ellipse((x + s * 0.2, y + s * 0.2, x + s * 0.8, y + s * 0.8), outline=color, width=3)
        d.ellipse((x + s * 0.45, y + s * 0.45, x + s * 0.55, y + s * 0.55), fill=color)
    elif k == 4:  # bird
        d.polygon([(x, y + s * 0.5), (x + s * 0.6, y + s * 0.3), (x + s, y + s * 0.5), (x + s * 0.6, y + s * 0.7)],
                  fill=color)
        d.line([(x + s * 0.4, y + s * 0.7), (x + s * 0.4, y + s)], fill=color, width=3)
    else:  # loop (ankh)
        d.ellipse((x + s * 0.3, y, x + s * 0.7, y + s * 0.4), outline=color, width=3)
        d.line([(x + s * 0.5, y + s * 0.4), (x + s * 0.5, y + s)], fill=color, width=4)
        d.line([(x + s * 0.2, y + s * 0.45), (x + s * 0.8, y + s * 0.45)], fill=color, width=4)


def frieze():
    W, H = 2400, 840
    rnd = random.Random(5)
    im = Image.new("RGB", (W, H), (214, 190, 150))
    d = ImageDraw.Draw(im)
    for band_y, cols in ((20, [(30, 70, 130), (170, 50, 35), (40, 120, 80)]), (H - 60, [(170, 50, 35), (30, 70, 130)])):
        for i in range(0, W, 40):
            d.rectangle((i, band_y, i + 36, band_y + 36), fill=cols[(i // 40) % len(cols)])
    for i, x in enumerate(range(170, W, 300)):
        done = x < W * 0.62
        figure(d, x, H - 110, 520, fill=done, facing=1 if i % 3 else -1)
        for k in range(4):  # a column of glyphs beside each figure
            glyph(d, x + 95, 110 + k * 120, 70, rnd, (25, 20, 20) if done else (170, 40, 30))
    # grid lines the painters snapped in red ochre
    for gx in range(int(W * 0.62), W, 60):
        d.line([(gx, 70), (gx, H - 70)], fill=(190, 120, 90), width=1)
    im = im.filter(ImageFilter.GaussianBlur(0.8))
    im.save(os.path.join(OUT, "frieze.png"))


def scroll():
    W, H = 600, 1800
    rnd = random.Random(2)
    im = Image.new("RGB", (W, H), (232, 222, 196))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 120), fill=(70, 80, 60))
    d.rectangle((0, H - 160, W, H), fill=(70, 80, 60))
    ink = (25, 22, 20)

    def branch(x, y, ang, length, width, depth):
        if depth == 0 or width < 2:
            return
        x2, y2 = x + length * math.cos(ang), y - length * math.sin(ang)
        d.line([(x, y), (x2, y2)], fill=ink, width=int(width))
        if depth < 4 and rnd.random() < 0.7:
            r = rnd.randint(14, 22)
            d.ellipse((x2 - r, y2 - r, x2 + r, y2 + r), fill=(190, 40, 50))
            d.ellipse((x2 - 4, y2 - 4, x2 + 4, y2 + 4), fill=(240, 220, 120))
        for _ in range(2):
            branch(x2, y2, ang + rnd.uniform(-0.7, 0.7), length * rnd.uniform(0.55, 0.8), width * 0.65, depth - 1)

    branch(120, 1450, 1.15, 330, 26, 6)
    for k in range(7):  # a column of script
        cx, cy = 470, 260 + k * 120
        for _ in range(3):
            a = (cx + rnd.randint(-30, 30), cy + rnd.randint(-40, 40))
            b = (cx + rnd.randint(-30, 30), cy + rnd.randint(-40, 40))
            d.line([a, b], fill=ink, width=rnd.randint(6, 11))
    d.rectangle((440, 1180, 500, 1240), fill=(180, 30, 30))  # the artist's seal
    im = im.filter(ImageFilter.GaussianBlur(1.0))
    im.save(os.path.join(OUT, "scroll.png"))


frieze()
scroll()
print("assets written to", OUT)
