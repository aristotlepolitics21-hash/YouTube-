#!/usr/bin/env python3
"""Compose 1280x720 YouTube thumbnails from rendered 3D backgrounds (publish/bg/*.png).

    python3 render3d/publish/thumbs.py     # writes render3d/publish/thumbs/<module>.jpg (< 2 MB each)
"""
import pathlib
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

HERE = pathlib.Path(__file__).resolve().parent
FONT = str(HERE.parent / 'fonts' / 'ArchivoBlack-Regular.ttf')
W, H = 1280, 720
YEL, WHITE, RED, CYAN = (255, 214, 10), (255, 255, 255), (255, 59, 59), (87, 216, 255)

# module: background, text lines [(text, colour)], anchor side, optional crop zoom (scale, cx, cy)
THUMBS = {
    'aidisease': ('aidisease_a.png', [('NOT SICK...', WHITE), ('YET', RED)], 'left', (1.25, 0.5, 0.45)),
    'nanobots': ('nanobots_comp', [('IN YOUR', WHITE), ('BLOOD', RED)], 'left', None),
    'crispr': ('crispr_a.png', [('EDIT ONE', WHITE), ('LETTER', YEL)], 'bottom', (1.15, 0.45, 0.4)),
    'agi': ('agi_b.png', [('THE LAST', WHITE), ('INVENTION', YEL)], 'bottom', None),
    'fusion': ('fusion_a.png', [('10×', YEL), ('THE SUN', WHITE)], 'right', (1.1, 0.4, 0.5)),
    'organs': ('organs_a.png', [('PRINTED', WHITE), ('HEART', RED)], 'left', (1.3, 0.5, 0.45)),
    'bci': ('bci_c.png', [('MIND', WHITE), ('→ TEXT', CYAN)], 'right', None),
    'blackhole': ('blackhole_b.png', [('NO WAY', WHITE), ('BACK', YEL)], 'right', (1.15, 0.55, 0.5)),
    'robots': ('robots_c.png', [('MILLIONS', WHITE), ('OF FALLS', YEL)], 'top', None),
    'windmill': ('windmill_c.png', [('CALLED HIM', WHITE), ('CRAZY', YEL)], 'left', None),
}


def load_bg(name):
    if name == 'nanobots_comp':  # nanobot cut out of its black background, laid over the bloodstream
        blood = Image.open(HERE / 'bg' / 'nanobots_b.png').convert('RGB').filter(ImageFilter.GaussianBlur(3))
        bot = Image.open(HERE / 'bg' / 'nanobots_a.png').convert('RGB')
        mask = bot.convert('L').point(lambda v: 0 if v < 28 else min(255, (v - 28) * 6))
        blood.paste(bot, (180, 20), mask)
        return blood
    return Image.open(HERE / 'bg' / name).convert('RGB')


def zoom(im, z):
    if not z: return im
    s, cx, cy = z
    w, h = W / s, H / s
    x0 = min(max(0, cx * W - w / 2), W - w); y0 = min(max(0, cy * H - h / 2), H - h)
    return im.crop((int(x0), int(y0), int(x0 + w), int(y0 + h))).resize((W, H), Image.LANCZOS)


def compose(mod):
    bgname, lines, side, z = THUMBS[mod]
    im = zoom(load_bg(bgname).resize((W, H)), z)
    im = ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.25)).enhance(1.12)
    # darken the text side so the words hold contrast at feed size
    shade = Image.new('L', (W, H), 0); d = ImageDraw.Draw(shade)
    for i in range(W if side in ('left', 'right') else H):
        a = int(170 * max(0, 1 - i / ((W if side in ('left', 'right') else H) * 0.55)))
        if side == 'left': d.line([(i, 0), (i, H)], fill=a)
        elif side == 'right': d.line([(W - 1 - i, 0), (W - 1 - i, H)], fill=a)
        elif side == 'top': d.line([(0, i), (W, i)], fill=a)
        else: d.line([(0, H - 1 - i), (W, H - 1 - i)], fill=a)
    im = Image.composite(Image.new('RGB', (W, H), 'black'), im, shade)
    d = ImageDraw.Draw(im)
    size = 150 if max(len(t) for t, _ in lines) <= 8 else 122
    font = ImageFont.truetype(FONT, size)
    boxes = [d.textbbox((0, 0), t, font=font) for t, _ in lines]
    lh = size * 1.02
    block_h = lh * len(lines); block_w = max(b[2] - b[0] for b in boxes)
    if side == 'left': x, y = 60, (H - block_h) / 2
    elif side == 'right': x, y = W - 60 - block_w, (H - block_h) / 2
    elif side == 'top': x, y = (W - block_w) / 2, 40
    else: x, y = (W - block_w) / 2, H - block_h - 50
    for k, ((t, col), b) in enumerate(zip(lines, boxes)):
        tx = x if side in ('left',) else x + (block_w - (b[2] - b[0])) * (1 if side == 'right' else 0.5)
        ty = y + k * lh - b[1]
        d.text((tx + 8, ty + 10), t, font=font, fill=(0, 0, 0))  # drop shadow
        d.text((tx, ty), t, font=font, fill=col, stroke_width=10, stroke_fill=(0, 0, 0))
    out = HERE / 'thumbs' / f'{mod}.jpg'; out.parent.mkdir(exist_ok=True)
    im.save(out, quality=92)
    return out


if __name__ == '__main__':
    for m in THUMBS: print(compose(m))
