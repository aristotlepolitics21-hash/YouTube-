"""Beast-style animated explainer engine.

Renders an episode JSON (see animator/episodes/) into an MP4: punchy text, rotating ray
backgrounds, blob characters, money rain, price tiers, elimination circles, word-by-word
captions, a synthesized music bed + SFX, and a Piper TTS voiceover.

Only needs Pillow, numpy, ffmpeg and (for voice) `pip install piper-tts` plus a voice model.
"""
import hashlib, json, math, os, random, subprocess, wave
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

FPS = 30
SR = 44100
FONT_PATH = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"

YELLOW, WHITE, BLACK = (255, 221, 0), (255, 255, 255), (0, 0, 0)
RED, GREEN, BLUE = (240, 40, 60), (40, 200, 90), (40, 140, 255)
GOLD, CASH = (255, 196, 30), (60, 170, 80)
PALETTES = {  # ray backgrounds: (inner, outer)
    "blue": ((60, 170, 255), (10, 60, 180)), "red": ((255, 90, 80), (150, 10, 30)),
    "gold": ((255, 220, 90), (200, 110, 0)), "green": ((90, 230, 120), (10, 110, 50)),
    "purple": ((190, 110, 255), (70, 20, 150)), "dark": ((60, 60, 90), (10, 10, 25)),
}


# ---------------------------------------------------------------- helpers
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_in(x): x = clamp(x); return x ** 3
def ease_back(x, s=2.2):
    x = clamp(x) - 1
    return 1 + (s + 1) * x ** 3 + s * x ** 2
def lerp(a, b, t): return a + (b - a) * t
def mix(c1, c2, t): return tuple(int(lerp(a, b, t)) for a, b in zip(c1, c2))
def darker(c, f=0.6): return tuple(int(v * f) for v in c)


@lru_cache(maxsize=256)
def font(size): return ImageFont.truetype(FONT_PATH, max(8, int(size)))


def money(v):
    v = int(round(v))
    return f"${v:,}"


class Ctx:
    def __init__(self, w, h):
        self.W, self.H = w, h
        self.S = min(w, h) / 1080  # scale unit
        self.sfx = []              # (time, kind)
        self.t0 = 0.0              # scene start in global time

    def cue(self, local_t, kind):
        self.sfx.append((self.t0 + local_t, kind))


def text(d, ctx, xy, s, size, fill=WHITE, stroke=None, anchor="mm", scale=1.0, shadow=True):
    size = size * ctx.S * scale
    if size < 4: return
    f = font(size)
    sw = int(stroke if stroke is not None else max(2, size * 0.09))
    if shadow:
        off = max(2, int(size * 0.06))
        d.text((xy[0] + off, xy[1] + off), s, font=f, fill=BLACK, anchor=anchor, stroke_width=sw, stroke_fill=BLACK)
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=sw, stroke_fill=BLACK)


def fit_size(s, size, max_w, ctx):
    w = font(size * ctx.S).getlength(s)
    return size if w <= max_w else size * max_w / w


# ---------------------------------------------------------------- backgrounds
@lru_cache(maxsize=16)
def _radial(w, h, inner, outer):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / 1.2
    r = np.clip(r, 0, 1)[..., None]
    arr = np.array(inner, np.float32) * (1 - r) + np.array(outer, np.float32) * r
    return Image.fromarray(arr.astype(np.uint8))


def bg_rays(ctx, t, palette="blue", spin=0.15, n=18):
    inner, outer = PALETTES.get(palette, PALETTES["blue"])
    img = _radial(ctx.W, ctx.H, inner, outer).copy()
    d = ImageDraw.Draw(img, "RGBA")
    cx, cy, R = ctx.W / 2, ctx.H / 2, max(ctx.W, ctx.H)
    a0 = t * spin
    for i in range(n):
        a = a0 + i * 2 * math.pi / n
        b = a + math.pi / n
        d.polygon([(cx, cy), (cx + R * math.cos(a), cy + R * math.sin(a)),
                   (cx + R * math.cos(b), cy + R * math.sin(b))], fill=(255, 255, 255, 28))
    return img, d


def bg_floor(ctx, t, sky=(110, 190, 255), ground=(120, 200, 90)):
    img = _radial(ctx.W, ctx.H, sky, darker(sky, 0.75)).copy()
    d = ImageDraw.Draw(img, "RGBA")
    hy = ctx.H * 0.42
    d.rectangle([0, hy, ctx.W, ctx.H], fill=ground)
    for i in range(6):  # stripes for depth
        y = hy + (ctx.H - hy) * (i / 6) ** 1.6
        d.line([(0, y), (ctx.W, y)], fill=darker(ground, 0.9), width=max(1, int(3 * ctx.S)))
    for i in range(4):  # drifting clouds
        x = (i * ctx.W / 3.2 + t * 25 * ctx.S) % (ctx.W + 400 * ctx.S) - 200 * ctx.S
        y = ctx.H * (0.08 + 0.07 * (i % 2))
        for dx, r in ((0, 50), (55, 65), (115, 45)):
            rr = r * ctx.S
            d.ellipse([x + dx * ctx.S - rr, y - rr, x + dx * ctx.S + rr, y + rr], fill=(255, 255, 255, 220))
    return img, d


# ---------------------------------------------------------------- sprites
def blob(d, ctx, cx, cy, r, color, mood="happy", t=0.0, seed=0, look=(0, 0), squash=0.0, hat=None):
    """Original round mascot: body, eyes, mouth. r in pixels."""
    rx, ry = r * (1 + squash * 0.25), r * (1 - squash * 0.25)
    ow = max(3, int(r * 0.07))
    d.ellipse([cx - rx * 0.9, cy + ry * 0.85, cx + rx * 0.9, cy + ry * 1.1], fill=(0, 0, 0, 60))  # shadow
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=color, outline=BLACK, width=ow)
    d.ellipse([cx - rx * 0.55, cy - ry * 0.8, cx - rx * 0.1, cy - ry * 0.45], fill=(255, 255, 255, 90))  # shine
    blink = ((t * 0.6 + seed * 0.37) % 3.1) < 0.12
    ey, ex, er = cy - ry * 0.18, rx * 0.36, r * 0.24
    if mood == "shock": er *= 1.25
    for sx in (-1, 1):
        x = cx + sx * ex
        if blink:
            d.line([(x - er, ey), (x + er, ey)], fill=BLACK, width=ow)
            continue
        d.ellipse([x - er, ey - er * 1.1, x + er, ey + er * 1.1], fill=WHITE, outline=BLACK, width=max(2, ow // 2))
        pr = er * (0.35 if mood == "shock" else 0.5)
        px, py = x + look[0] * er * 0.4, ey + look[1] * er * 0.4
        d.ellipse([px - pr, py - pr, px + pr, py + pr], fill=BLACK)
        d.ellipse([px - pr * 0.4 + pr * 0.3, py - pr * 0.7, px + pr * 0.2 + pr * 0.3, py - pr * 0.1], fill=WHITE)
    if mood in ("angry", "nervous"):  # brows
        for sx in (-1, 1):
            x = cx + sx * ex
            tilt = 1 if mood == "angry" else -1
            d.line([(x - er, ey - er * 1.4 - sx * tilt * er * 0.3), (x + er, ey - er * 1.4 + sx * tilt * er * 0.3)],
                   fill=BLACK, width=ow)
    my, mw = cy + ry * 0.38, rx * 0.38
    if mood == "happy":
        d.chord([cx - mw, my - mw * 0.6, cx + mw, my + mw * 0.9], 0, 180, fill=(120, 20, 30), outline=BLACK, width=ow)
    elif mood == "shock":
        o = mw * (0.55 + 0.08 * math.sin(t * 9))
        d.ellipse([cx - o * 0.8, my - o * 0.6, cx + o * 0.8, my + o * 1.1], fill=(80, 10, 20), outline=BLACK, width=ow)
    elif mood == "sad":
        d.arc([cx - mw * 0.8, my, cx + mw * 0.8, my + mw * 1.0], 200, 340, fill=BLACK, width=ow)
    elif mood == "nervous":
        pts = [(cx - mw + i * mw / 3, my + (mw * 0.12 if i % 2 else -mw * 0.12)) for i in range(7)]
        d.line(pts, fill=BLACK, width=ow)
    elif mood == "angry":
        d.arc([cx - mw * 0.7, my, cx + mw * 0.7, my + mw * 0.9], 200, 340, fill=BLACK, width=ow)
    else:
        d.line([(cx - mw * 0.5, my + mw * 0.2), (cx + mw * 0.5, my + mw * 0.2)], fill=BLACK, width=ow)
    if hat == "crown":
        top = cy - ry * 0.92
        w = rx * 0.7
        pts = [(cx - w, top), (cx - w, top - w * 0.8), (cx - w * 0.5, top - w * 0.35), (cx, top - w * 1.0),
               (cx + w * 0.5, top - w * 0.35), (cx + w, top - w * 0.8), (cx + w, top)]
        d.polygon(pts, fill=GOLD, outline=BLACK)
        d.line(pts + [pts[0]], fill=BLACK, width=ow)


@lru_cache(maxsize=4)
def _bill_sprites(s):
    w, h = int(150 * s), int(70 * s)
    base = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(base)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=int(8 * s), fill=(110, 200, 110), outline=(20, 90, 30), width=max(2, int(4 * s)))
    d.rounded_rectangle([w * 0.1, h * 0.15, w * 0.9, h * 0.85], radius=int(6 * s), outline=(40, 130, 50), width=max(1, int(3 * s)))
    d.ellipse([w / 2 - h * 0.3, h * 0.2, w / 2 + h * 0.3, h * 0.8], fill=(70, 160, 80))
    d.text((w / 2, h / 2), "$", font=font(h * 0.5), fill=(230, 255, 230), anchor="mm")
    return [base.rotate(a, expand=True, resample=Image.BICUBIC) for a in range(0, 360, 30)]


def money_rain(img, ctx, t, n=26, seed=1, speed=1.0):
    sprites = _bill_sprites(ctx.S)
    rnd = random.Random(seed)
    for i in range(n):
        x0, ph, sp, rot = rnd.random(), rnd.random(), rnd.uniform(0.6, 1.2) * speed, rnd.randrange(12)
        span = ctx.H + 300 * ctx.S
        y = ((ph * span + t * sp * 420 * ctx.S) % span) - 150 * ctx.S
        x = x0 * ctx.W + math.sin(t * 2 + i) * 40 * ctx.S
        spr = sprites[(rot + int(t * 6 * sp)) % len(sprites)]
        img.paste(spr, (int(x - spr.width / 2), int(y - spr.height / 2)), spr)


def confetti(d, ctx, t, n=90, seed=3):
    rnd = random.Random(seed)
    cols = [RED, YELLOW, BLUE, GREEN, (255, 120, 220), WHITE]
    for i in range(n):
        x0, sp, ph = rnd.random() * ctx.W, rnd.uniform(200, 500) * ctx.S, rnd.random()
        y = ((ph * ctx.H * 1.2 + t * sp) % (ctx.H * 1.2)) - ctx.H * 0.1
        x = x0 + math.sin(t * 3 + i) * 30 * ctx.S
        a, s = t * 5 + i, 12 * ctx.S
        pts = [(x + s * math.cos(a + k * math.pi / 2), y + s * 0.5 * math.sin(a + k * math.pi / 2)) for k in range(4)]
        d.polygon(pts, fill=cols[i % len(cols)])


def sparkle(d, cx, cy, r, color=WHITE):
    d.polygon([(cx, cy - r), (cx + r * 0.25, cy - r * 0.25), (cx + r, cy), (cx + r * 0.25, cy + r * 0.25),
               (cx, cy + r), (cx - r * 0.25, cy + r * 0.25), (cx - r, cy), (cx - r * 0.25, cy - r * 0.25)], fill=color)


def burst(d, cx, cy, r, color=YELLOW, n=14):
    pts = []
    for i in range(n * 2):
        a = i * math.pi / n
        rr = r if i % 2 == 0 else r * 0.72
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=color, outline=BLACK)
    d.line(pts + [pts[0]], fill=BLACK, width=max(3, int(r * 0.04)))


# ---------------------------------------------------------------- items for $1 vs $X tiers
def item_pizza(d, ctx, cx, cy, r, level, t):
    gold = level >= 5
    crust = GOLD if gold else mix((170, 120, 70), (215, 150, 70), level / 4)
    cheese = (255, 230, 120) if gold else mix((230, 200, 140), (255, 205, 80), level / 4)
    ow = max(3, int(r * 0.03))
    if level == 0:  # sad, tiny, burnt slice
        pts = [(cx - r * 0.5, cy - r * 0.35), (cx + r * 0.5, cy - r * 0.35), (cx, cy + r * 0.6)]
        d.polygon(pts, fill=(200, 170, 110), outline=BLACK)
        d.line(pts + [pts[0]], fill=BLACK, width=ow)
        d.rectangle([cx - r * 0.55, cy - r * 0.48, cx + r * 0.55, cy - r * 0.32], fill=(110, 70, 40), outline=BLACK, width=ow)
        return
    d.ellipse([cx - r, cy - r * 0.62, cx + r, cy + r * 0.62], fill=crust, outline=BLACK, width=ow)
    d.ellipse([cx - r * 0.86, cy - r * 0.52, cx + r * 0.86, cy + r * 0.52], fill=cheese)
    rnd = random.Random(level)
    for i in range(level * 5):
        a, rr = rnd.random() * 2 * math.pi, math.sqrt(rnd.random()) * 0.72
        px, py = cx + r * rr * math.cos(a), cy + r * 0.6 * rr * math.sin(a)
        pr = r * 0.075
        col = [(200, 40, 40), (60, 140, 50), (90, 50, 30), (240, 240, 230)][(i + level) % (min(4, level))]
        if gold: col = (255, 240, 170) if i % 2 else (230, 160, 20)
        d.ellipse([px - pr, py - pr * 0.6, px + pr, py + pr * 0.6], fill=col, outline=darker(col))
    if level >= 4:
        for i in range(6):
            a = t * 1.5 + i * math.pi / 3
            sparkle(d, cx + r * 1.1 * math.cos(a), cy + r * 0.7 * math.sin(a),
                    r * (0.08 + 0.04 * math.sin(t * 6 + i)), WHITE if not gold else (255, 250, 200))


def item_burger(d, ctx, cx, cy, r, level, t):
    gold = level >= 5
    ow = max(3, int(r * 0.03))
    bun = GOLD if gold else mix((200, 150, 80), (230, 160, 60), level / 4)
    layers = [("bun_b", bun)]
    patties = 1 if level < 3 else level - 1
    for i in range(patties):
        layers += [("patty", (90, 50, 30) if not gold else (200, 140, 20)), ("cheese", (255, 200, 40))]
        if level >= 2: layers.append(("lettuce", (90, 190, 60)))
    if level == 0: layers = [("bun_b", (190, 170, 130)), ("patty", (70, 60, 50))]
    hgt = {"bun_b": 0.25, "patty": 0.2, "cheese": 0.06, "lettuce": 0.07}
    total = sum(hgt[k] for k, _ in layers) + 0.45
    scale = min(1.0, 1.7 / total)
    y = cy + r * total * scale / 2
    w = r * (0.7 if level == 0 else 1.0)
    for kind, col in layers:
        hh = r * hgt[kind] * scale
        if kind == "cheese":
            d.polygon([(cx - w, y - hh), (cx + w, y - hh), (cx + w * 0.6, y + hh), (cx - w * 0.3, y + hh * 1.5)], fill=col, outline=BLACK)
        elif kind == "lettuce":
            pts = [(cx - w * 1.05 + i * w * 0.15, y - hh + (hh if i % 2 else 0)) for i in range(15)]
            d.line(pts, fill=col, width=int(hh * 1.5))
        else:
            d.rounded_rectangle([cx - w, y - hh, cx + w, y], radius=int(hh * 0.5), fill=col, outline=BLACK, width=ow)
        y -= hh
    hh = r * 0.45 * scale
    d.chord([cx - w, y - hh * 2, cx + w, y + hh * 0.2], 180, 360, fill=bun, outline=BLACK, width=ow)
    rnd = random.Random(7)
    for i in range(8):
        sx, sy = cx + rnd.uniform(-0.6, 0.6) * w, y - hh * rnd.uniform(0.3, 0.9)
        d.ellipse([sx - r * 0.03, sy - r * 0.015, sx + r * 0.03, sy + r * 0.015], fill=(255, 245, 210))
    if level >= 4:
        for i in range(6):
            a = t * 1.5 + i * math.pi / 3
            sparkle(d, cx + r * 1.15 * math.cos(a), cy + r * 0.9 * math.sin(a), r * (0.08 + 0.04 * math.sin(t * 6 + i)))


ITEMS = {"pizza": item_pizza, "burger": item_burger}


# ---------------------------------------------------------------- scenes
# Each scene: fn(ctx, sc, t, dur) -> PIL image. sc is the scene dict. Cue SFX on frame 0 only.
def _first(t): return t < 1 / FPS


def scene_hook(ctx, sc, t, dur):
    img, d = bg_rays(ctx, t, sc.get("palette", "red"), spin=0.4)
    if sc.get("money", True): money_rain(img, ctx, t, n=18, seed=sc.get("seed", 1))
    d = ImageDraw.Draw(img, "RGBA")
    lines = sc["lines"]
    step = min(0.45, dur * 0.6 / max(1, len(lines)))
    portrait = ctx.H > ctx.W
    base = ctx.H * (0.30 if portrait else 0.27)
    gap = ctx.H * (0.12 if portrait else 0.17)
    for i, ln in enumerate(lines):
        lt = t - i * step
        if lt < 0: continue
        if _first(t): ctx.cue(i * step, "pop")
        size = fit_size(ln, sc.get("size", 150), ctx.W * 0.9, ctx)
        col = [YELLOW, WHITE, YELLOW, WHITE][i % 4] if ln.upper() != "VS" else RED
        wob = 1 + 0.03 * math.sin(t * 7 + i)
        text(d, ctx, (ctx.W / 2, base + i * gap), ln, size, col, scale=ease_back(lt / 0.3) * wob)
    if sc.get("mascot", True):
        y = ctx.H * (0.82 if portrait else 0.80) + math.sin(t * 6) * 10 * ctx.S
        blob(d, ctx, ctx.W * (0.5 if portrait else 0.86), y, 120 * ctx.S, BLUE, sc.get("mood", "shock"), t)
    return img


def scene_tier(ctx, sc, t, dur):
    lvl = sc.get("level", 0)
    img, d = bg_rays(ctx, t, sc.get("palette", ["dark", "blue", "green", "purple", "red", "gold"][min(lvl, 5)]))
    portrait = ctx.H > ctx.W
    if lvl >= 5: money_rain(img, ctx, t, n=14, seed=lvl, speed=0.6)
    d = ImageDraw.Draw(img, "RGBA")
    if _first(t): ctx.cue(0.05, "whoosh"); ctx.cue(0.9, "cash" if lvl >= 3 else "ding")
    # price tag counting up
    price = sc["price"]
    shown = price * ease_out((t - 0.15) / 0.8)
    tag = money(shown) + (" " + sc["label"] if sc.get("label") else "")
    py = ctx.H * (0.16 if not portrait else 0.18)
    size = fit_size(tag, 120, ctx.W * 0.92, ctx)
    text(d, ctx, (ctx.W / 2, py), tag, size, YELLOW if lvl < 5 else GOLD, scale=ease_back(t / 0.3))
    # item drops in and bobs
    cx = ctx.W * (0.5 if portrait else 0.42)
    cy = ctx.H * (0.52 if not portrait else 0.48) + math.sin(t * 2.5) * 8 * ctx.S
    drop = ease_back((t - 0.1) / 0.45)
    cy -= (1 - drop) * ctx.H * 0.7
    r = ctx.S * (330 if not portrait else 330) * (0.7 + 0.3 * min(1, lvl / 3 + 0.34))
    if lvl >= 4:  # glow
        for k in range(4, 0, -1):
            gr = r * (1 + k * 0.12)
            d.ellipse([cx - gr, cy - gr * 0.7, cx + gr, cy + gr * 0.7], fill=(255, 240, 150, 25))
    ITEMS.get(sc.get("item", "pizza"), item_pizza)(d, ctx, cx, cy, r, lvl, t)
    # rating meter
    score = sc.get("score")
    if score is not None:
        mx, my = (ctx.W * 0.74, ctx.H * 0.3) if not portrait else (ctx.W * 0.15, ctx.H * 0.72)
        bw, bh = 70 * ctx.S, 360 * ctx.S
        if portrait: bw, bh = 520 * ctx.S, 60 * ctx.S
        fill = clamp((t - 0.6) / 1.0) * score / 10
        d.rounded_rectangle([mx, my, mx + bw, my + bh], radius=int(14 * ctx.S), fill=(0, 0, 0, 140), outline=BLACK, width=int(5 * ctx.S))
        col = mix(RED, GREEN, score / 10)
        if portrait: d.rounded_rectangle([mx, my, mx + bw * fill + 1, my + bh], radius=int(14 * ctx.S), fill=col)
        else: d.rounded_rectangle([mx, my + bh * (1 - fill), mx + bw, my + bh], radius=int(14 * ctx.S), fill=col)
        lbl = f"{score * clamp((t - 0.6) / 1.0):.0f}/10"
        if portrait: text(d, ctx, (mx + bw / 2, my - 45 * ctx.S), "RATING " + lbl, 50)
        else:
            text(d, ctx, (mx + bw / 2, my - 45 * ctx.S), "RATING", 44)
            text(d, ctx, (mx + bw / 2, my + bh + 55 * ctx.S), lbl, 64, YELLOW)
    if sc.get("mood") and not portrait:
        bx, by = ctx.W * 0.88, ctx.H * 0.78
        blob(d, ctx, bx, by + math.sin(t * 5) * 6 * ctx.S, 95 * ctx.S, BLUE, sc["mood"], t, look=(-1, -0.3))
    elif sc.get("mood"):
        blob(d, ctx, ctx.W * 0.8, ctx.H * 0.86, 90 * ctx.S, BLUE, sc["mood"], t, look=(-1, -0.5))
    return img


PLAYER_COLS = [(240, 70, 70), (255, 170, 30), (250, 220, 50), (90, 200, 90), (60, 190, 230),
               (90, 110, 240), (170, 90, 230), (240, 110, 190), (150, 110, 70), (200, 200, 210)]


def _hud(d, ctx, sc, t, alive):
    portrait = ctx.H > ctx.W
    pad = 40 * ctx.S
    prize = sc.get("prize")
    if prize:
        text(d, ctx, (pad, pad + 40 * ctx.S), money(prize), 80, GREEN, anchor="lm")
    if sc.get("clock"):
        cx = ctx.W - pad
        text(d, ctx, (cx, pad + 40 * ctx.S), sc["clock"], 70, WHITE, anchor="rm")
    text(d, ctx, (ctx.W / 2, ctx.H - (240 if portrait else 70) * ctx.S), f"{alive} LEFT", 70, YELLOW)


def scene_circle(ctx, sc, t, dur):
    img, d = bg_floor(ctx, t, ground=(110, 190, 80))
    portrait = ctx.H > ctx.W
    cx, cy = ctx.W / 2, ctx.H * (0.64 if not portrait else 0.6)
    RX = ctx.W * (0.38 if not portrait else 0.42)
    RY = RX * 0.5
    lw = int(12 * ctx.S)
    d.ellipse([cx - RX * 1.12, cy - RY * 1.12, cx + RX * 1.12, cy + RY * 1.12], outline=WHITE, width=lw)
    players = sc["players"]
    gone = set(sc.get("gone", []))
    out = sc.get("out", [])
    out_t = {p: dur * (0.25 + 0.5 * i / max(1, len(out))) for i, p in enumerate(out)}
    if _first(t):
        ctx.cue(0.02, "whoosh")
        for p, te in out_t.items(): ctx.cue(te, "boom")
    n = len(players)
    order = sorted(range(n), key=lambda i: math.sin(i * 2 * math.pi / n))  # back to front
    alive = 0
    for i in order:
        if i in gone: continue
        a = (i + 0.5) * 2 * math.pi / n - math.pi / 2
        x, y = cx + RX * 0.85 * math.cos(a), cy + RY * 0.85 * math.sin(a)
        depth = 0.75 + 0.25 * (math.sin(a) + 1) / 2
        r = 100 * ctx.S * depth * (0.8 if portrait else 1)
        mood = sc.get("moods", {}).get(str(i), sc.get("mood", "nervous"))
        te = out_t.get(i)
        if te is not None and t > te:
            k = (t - te) / 0.7
            if k < 1:
                y -= ease_in(k) * ctx.H * 0.9
                x += (1 if math.cos(a) >= 0 else -1) * k * ctx.W * 0.2
                blob(d, ctx, x, y, r * (1 - 0.3 * k), players[i]["color"] if isinstance(players[i], dict) else PLAYER_COLS[i % 10], "shock", t, seed=i, squash=-0.3)
            if k < 1.6:
                sx, sy = cx + RX * 0.85 * math.cos(a), cy + RY * 0.85 * math.sin(a) - 110 * ctx.S
                text(d, ctx, (sx, sy), "OUT!", 70, RED, scale=ease_back(k / 0.3))
            continue
        alive += 1
        if te is not None and t > te - 0.6: mood = "shock"
        col = players[i]["color"] if isinstance(players[i], dict) else PLAYER_COLS[i % 10]
        bob = math.sin(t * 4 + i) * 6 * ctx.S
        blob(d, ctx, x, y + bob, r, tuple(col), mood, t, seed=i, look=(-math.cos(a) * 0.6, -0.3))
        name = players[i]["name"] if isinstance(players[i], dict) else players[i]
        text(d, ctx, (x, y - r * 1.35), name, 46 * depth, WHITE)
    _hud(d, ctx, sc, t, alive)
    if sc.get("banner"):
        text(d, ctx, (ctx.W / 2, ctx.H * (0.2 if not portrait else 0.22)), sc["banner"],
             fit_size(sc["banner"], 110, ctx.W * 0.9, ctx), YELLOW, scale=ease_back(t / 0.35))
    return img


def scene_counter(ctx, sc, t, dur):
    img, d = bg_rays(ctx, t, sc.get("palette", "green"), spin=0.3)
    money_rain(img, ctx, t, n=30, seed=5, speed=1.3)
    d = ImageDraw.Draw(img, "RGBA")
    if _first(t): ctx.cue(0.0, "whoosh"); ctx.cue(min(dur - 0.1, 1.5), "cash")
    k = ease_out(t / 1.5)
    v = lerp(sc.get("start", 0), sc["value"], k)
    s = money(v)
    shake = (1 - k) * 8 * ctx.S
    x = ctx.W / 2 + random.uniform(-shake, shake)
    size = fit_size(s, 230, ctx.W * 0.9, ctx)
    text(d, ctx, (x, ctx.H * 0.45), s, size, GREEN if k < 1 else YELLOW, scale=1 + 0.05 * math.sin(t * 8))
    if sc.get("label"):
        text(d, ctx, (ctx.W / 2, ctx.H * 0.66), sc["label"], fit_size(sc["label"], 90, ctx.W * 0.9, ctx), WHITE,
             scale=ease_back((t - 0.3) / 0.3))
    return img


def scene_versus(ctx, sc, t, dur):
    portrait = ctx.H > ctx.W
    img = Image.new("RGB", (ctx.W, ctx.H))
    d = ImageDraw.Draw(img, "RGBA")
    if _first(t): ctx.cue(0.0, "whoosh"); ctx.cue(0.45, "boom")
    L, R = sc["left"], sc["right"]
    slide = ease_out(t / 0.4)
    if portrait:
        d.rectangle([0, 0, ctx.W, ctx.H / 2 * slide], fill=darker(BLUE, 0.9))
        d.rectangle([0, ctx.H - ctx.H / 2 * slide, ctx.W, ctx.H], fill=darker(RED, 0.9))
        pts = [(ctx.W * 0.25, ctx.H * 0.22), (ctx.W * 0.25, ctx.H * 0.78)]
        lbl = [(ctx.W / 2, ctx.H * 0.38), (ctx.W / 2, ctx.H * 0.88)]
    else:
        d.polygon([(0, 0), (ctx.W * 0.55 * slide, 0), (ctx.W * 0.45 * slide, ctx.H), (0, ctx.H)], fill=darker(BLUE, 0.9))
        d.polygon([(ctx.W, 0), (ctx.W - ctx.W * 0.45 * slide, 0), (ctx.W - ctx.W * 0.55 * slide, ctx.H), (ctx.W, ctx.H)], fill=darker(RED, 0.9))
        pts = [(ctx.W * 0.25, ctx.H * 0.48), (ctx.W * 0.75, ctx.H * 0.48)]
        lbl = [(ctx.W * 0.25, ctx.H * 0.84), (ctx.W * 0.75, ctx.H * 0.84)]
    for side, (px, py), (lx, ly), col in ((L, pts[0], lbl[0], BLUE), (R, pts[1], lbl[1], RED)):
        if portrait: px = ctx.W / 2; py = ly - ctx.H * 0.2
        if side.get("item"):
            ITEMS[side["item"]](d, ctx, px, py, 170 * ctx.S, side.get("level", 2), t)
        else:
            blob(d, ctx, px, py + math.sin(t * 5) * 8 * ctx.S, 150 * ctx.S, tuple(side.get("color", col)), side.get("mood", "happy"), t)
        text(d, ctx, (lx, ly), side["label"], fit_size(side["label"], 90, ctx.W * (0.9 if portrait else 0.45), ctx), YELLOW)
    vs = ease_back((t - 0.35) / 0.3)
    if vs > 0:
        burst(d, ctx.W / 2, ctx.H / 2, 150 * ctx.S * vs, YELLOW)
        text(d, ctx, (ctx.W / 2, ctx.H / 2), "VS", 140, RED, scale=vs)
    return img


def scene_winner(ctx, sc, t, dur):
    img, d = bg_rays(ctx, t, "gold", spin=0.5)
    money_rain(img, ctx, t, n=24, seed=9)
    d = ImageDraw.Draw(img, "RGBA")
    if _first(t): ctx.cue(0.0, "boom"); ctx.cue(0.6, "cash"); ctx.cue(1.2, "ding")
    portrait = ctx.H > ctx.W
    cx, cy = ctx.W / 2, ctx.H * (0.58 if not portrait else 0.55)
    jump = abs(math.sin(t * 4)) * 50 * ctx.S
    col = tuple(sc.get("color", BLUE))
    blob(d, ctx, cx, cy - jump, 200 * ctx.S, col, "happy", t, squash=0.15 * math.cos(t * 8), hat="crown" if t > 0.8 else None)
    if t <= 0.8:  # crown dropping in
        k = ease_in(t / 0.8)
        cyy = lerp(-200 * ctx.S, cy - jump - 200 * ctx.S, k)
        w = 140 * ctx.S
        d.polygon([(cx - w, cyy), (cx - w, cyy - w * 0.8), (cx - w * 0.5, cyy - w * 0.35), (cx, cyy - w),
                   (cx + w * 0.5, cyy - w * 0.35), (cx + w, cyy - w * 0.8), (cx + w, cyy)], fill=GOLD, outline=BLACK)
    confetti(d, ctx, t)
    text(d, ctx, (ctx.W / 2, ctx.H * 0.15), sc.get("headline", "WINNER!"), fit_size(sc.get("headline", "WINNER!"), 150, ctx.W * 0.9, ctx),
         YELLOW, scale=ease_back(t / 0.35))
    if sc.get("name"):
        text(d, ctx, (ctx.W / 2, ctx.H * (0.88 if not portrait else 0.8)), sc["name"], 90, WHITE, scale=ease_back((t - 0.3) / 0.3))
    return img


def scene_outro(ctx, sc, t, dur):
    img, d = bg_rays(ctx, t, sc.get("palette", "blue"))
    d = ImageDraw.Draw(img, "RGBA")
    if _first(t): ctx.cue(0.6, "pop"); ctx.cue(1.2, "ding")
    bw, bh = 640 * ctx.S, 150 * ctx.S
    cx, cy = ctx.W / 2, ctx.H * 0.45
    pressed = t > 1.2
    k = ease_back(t / 0.4)
    col = (120, 120, 120) if pressed else (230, 30, 40)
    d.rounded_rectangle([cx - bw / 2 * k, cy - bh / 2 * k, cx + bw / 2 * k, cy + bh / 2 * k], radius=int(30 * ctx.S), fill=col, outline=BLACK, width=int(8 * ctx.S))
    text(d, ctx, (cx, cy), "SUBSCRIBED" if pressed else "SUBSCRIBE", 80, WHITE, scale=k)
    # cursor
    ct = ease_out((t - 0.4) / 0.7)
    mx, my = lerp(ctx.W * 0.9, cx + bw * 0.25, ct), lerp(ctx.H * 0.95, cy + 20 * ctx.S, ct)
    s = 60 * ctx.S * (0.85 if 1.15 < t < 1.35 else 1)
    d.polygon([(mx, my), (mx, my + s), (mx + s * 0.28, my + s * 0.75), (mx + s * 0.62, my + s * 0.7)], fill=WHITE, outline=BLACK)
    if sc.get("line"):
        text(d, ctx, (ctx.W / 2, ctx.H * 0.72), sc["line"], fit_size(sc["line"], 80, ctx.W * 0.9, ctx), YELLOW, scale=ease_back((t - 1.3) / 0.3))
    blob(d, ctx, ctx.W * 0.15, ctx.H * 0.78 + math.sin(t * 5) * 8 * ctx.S, 110 * ctx.S, BLUE, "happy", t, look=(1, -0.3))
    return img


SCENES = {"hook": scene_hook, "tier": scene_tier, "circle": scene_circle, "counter": scene_counter,
          "versus": scene_versus, "winner": scene_winner, "outro": scene_outro}


# ---------------------------------------------------------------- captions
def caption_chunks(say, dur):
    """Split narration into <=3-word chunks timed by character weight."""
    words = say.split()
    if not words: return []
    weights = [len(w) + 2 + (4 if w[-1] in ".!?," else 0) for w in words]
    total = sum(weights)
    times, acc = [], 0.0
    for w in weights:
        times.append(acc / total * dur); acc += w
    chunks, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        if len(cur) == 3 or sum(len(words[j]) for j in cur) > 13 or w[-1] in ".!?,":
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    out = []
    for c in chunks:
        out.append((times[c[0]], [(words[j].strip(",.").upper(), times[j]) for j in c]))
    return out


def draw_caption(img, ctx, chunks, t):
    cur = None
    for start, words in chunks:
        if t >= start: cur = (start, words)
    if not cur: return
    start, words = cur
    d = ImageDraw.Draw(img)
    portrait = ctx.H > ctx.W
    size = 92 if portrait else 78
    f = font(size * ctx.S)
    gap = f.getlength(" ")
    widths = [f.getlength(w) for w, _ in words]
    total = sum(widths) + gap * (len(words) - 1)
    scale = 1.0
    if total > ctx.W * 0.92: scale = ctx.W * 0.92 / total
    x = ctx.W / 2 - total * scale / 2
    y = ctx.H * (0.68 if portrait else 0.9)
    pop = ease_back((t - start) / 0.15, 3)
    for (w, wt), ww in zip(words, widths):
        col = YELLOW if t >= wt else WHITE
        text(d, ctx, (x + ww * scale / 2, y), w, size, col, scale=scale * (0.8 + 0.2 * pop), stroke=int(10 * ctx.S))
        x += (ww + gap) * scale


# ---------------------------------------------------------------- audio
def _env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)


def synth_sfx(kind):
    rng = np.random.default_rng(abs(hash(kind)) % 2**32)
    if kind == "whoosh":
        n = int(SR * 0.35); t = np.arange(n) / SR
        noise = rng.standard_normal(n)
        k = np.exp(-((t - 0.15) / 0.08) ** 2)
        # crude band sweep: difference of moving averages
        sm = np.convolve(noise, np.ones(8) / 8, "same") - np.convolve(noise, np.ones(40) / 40, "same")
        return sm * k * 0.9
    if kind == "pop":
        n = int(SR * 0.12); t = np.arange(n) / SR
        f = 900 * np.exp(-t * 25) + 300
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.002, 0.03)
    if kind == "ding":
        n = int(SR * 0.9); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * 1320 * t) + 0.5 * np.sin(2 * np.pi * 2640 * t)) * _env(n, 0.002, 0.25) * 0.5
    if kind == "cash":
        n = int(SR * 0.8); t = np.arange(n) / SR
        bell = sum(np.sin(2 * np.pi * f * t) for f in (1568, 2093, 2637)) * _env(n, 0.002, 0.18) * 0.35
        clk = rng.standard_normal(n) * _env(n, 0.001, 0.015)
        return bell + clk * 0.6
    if kind == "boom":
        n = int(SR * 0.7); t = np.arange(n) / SR
        f = 120 * np.exp(-t * 6) + 40
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.002, 0.25) + rng.standard_normal(n) * _env(n, 0.001, 0.04) * 0.5
    return np.zeros(1)


def synth_music(dur, bpm=126):
    n = int(dur * SR)
    out = np.zeros(n)
    beat = 60 / bpm
    kick = synth_sfx("boom")[: int(SR * 0.25)] * 0.9
    tt = np.arange(int(SR * 0.05)) / SR
    hat = np.random.default_rng(1).standard_normal(len(tt)) * np.exp(-tt * 90) * 0.25
    roots = [55.0, 55.0, 43.65, 49.0]  # A A F G (bass, Hz)
    i = 0
    while i * beat * 0.5 < dur:
        s = int(i * beat * 0.5 * SR)
        if i % 2 == 0:
            e = min(n, s + len(kick)); out[s:e] += kick[: e - s]
        else:
            e = min(n, s + len(hat)); out[s:e] += hat[: e - s]
        # bass eighth notes
        f = roots[(i // 16) % 4] * (2 if i % 4 == 3 else 1)
        ln = int(beat * 0.5 * SR)
        e = min(n, s + ln)
        tb = np.arange(e - s) / SR
        out[s:e] += np.sign(np.sin(2 * np.pi * f * tb)) * 0.12 * np.exp(-tb * 6)
        # plucky arp on top
        if i % 2 == 0:
            fa = roots[(i // 16) % 4] * 8 * [1, 1.5, 2, 1.5][(i // 2) % 4]
            out[s:e] += np.sin(2 * np.pi * fa * tb) * 0.08 * np.exp(-tb * 10)
        i += 1
    return out


def tts(text_, voice, cache_dir, length_scale=0.85):
    key = hashlib.sha1(f"{voice}|{length_scale}|{text_}".encode()).hexdigest()[:16]
    raw, wav44 = os.path.join(cache_dir, key + ".raw.wav"), os.path.join(cache_dir, key + ".wav")
    if not os.path.exists(wav44):
        subprocess.run(["python3", "-m", "piper", "-m", voice, "-f", raw, "--length-scale", str(length_scale),
                        "--sentence-silence", "0.05"], input=text_.encode(), check=True, capture_output=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-ar", str(SR), "-ac", "1",
                        "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                        wav44], check=True)
    with wave.open(wav44) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


# ---------------------------------------------------------------- camera + render
def camera(img, ctx, t, dur, punch=True):
    """Fast-cut feel: each scene opens with a quick zoom-out from 1.12x, plus a slow push-in."""
    z = 1 + (0.12 * (1 - ease_out(t / 0.25)) if punch else 0) + 0.03 * clamp(t / max(dur, 0.1))
    if z <= 1.002: return img
    w, h = ctx.W / z, ctx.H / z
    x0, y0 = (ctx.W - w) / 2, (ctx.H - h) / 2
    return img.resize((ctx.W, ctx.H), Image.BILINEAR, box=(x0, y0, x0 + w, y0 + h))


def plan(episode, voice, cache_dir):
    """Synthesize narration and fix every scene's duration."""
    ls = episode.get("voice", {}).get("length_scale", 0.85)
    out = []
    for sc in episode["scenes"]:
        say = sc.get("say", "")
        audio = tts(say, voice, cache_dir, ls) if (say and voice) else np.zeros(0)
        speech = len(audio) / SR if len(audio) else len(say.split()) * 0.33
        dur = max(sc.get("min", 1.2), speech + sc.get("pad", 0.25))
        out.append((sc, audio, speech, dur))
    return out


def render(episode, out_path, voice=None, cache_dir=".cache", preview=False):
    os.makedirs(cache_dir, exist_ok=True)
    w, h = (1080, 1920) if episode.get("format") == "short" else (1920, 1080)
    if preview: w, h = w // 2, h // 2
    ctx = Ctx(w, h)
    timeline = plan(episode, voice, cache_dir)
    total = sum(x[3] for x in timeline)
    voice_track = np.zeros(int((total + 1) * SR))
    tmp_wav = out_path + ".audio.wav"
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{w}x{h}", "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264",
                           "-preset", "veryfast" if not preview else "ultrafast", "-crf", "20",
                           "-pix_fmt", "yuv420p", out_path + ".video.mp4"], stdin=subprocess.PIPE)
    frame_i = 0
    for si, (sc, audio, speech, dur) in enumerate(timeline):
        ctx.t0 = frame_i / FPS
        s = int(ctx.t0 * SR)
        voice_track[s:s + len(audio)] += audio
        chunks = caption_chunks(sc.get("say", ""), speech)
        fn = SCENES[sc["type"]]
        nframes = int(round(dur * FPS))
        for k in range(nframes):
            t = k / FPS
            img = fn(ctx, sc, t, dur)
            img = camera(img, ctx, t, dur, punch=sc.get("punch", True))
            if episode.get("captions", True): draw_caption(img, ctx, chunks, t)
            ff.stdin.write(img.tobytes())
            frame_i += 1
        print(f"  scene {si + 1}/{len(timeline)} {sc['type']:8} {dur:5.2f}s", flush=True)
    ff.stdin.close(); ff.wait()
    total = frame_i / FPS
    music = synth_music(total + 1) * episode.get("music_volume", 0.35)
    sfx = np.zeros_like(music)
    for tt, kind in ctx.sfx:
        clip = synth_sfx(kind); s = int(tt * SR); e = min(len(sfx), s + len(clip))
        if s < len(sfx): sfx[s:e] += clip[: e - s]
    n = len(music)
    vt = np.zeros(n); vt[: min(n, len(voice_track))] = voice_track[:n]
    duck = 1 - 0.5 * np.clip(np.convolve(np.abs(vt), np.ones(4410) / 4410, "same") * 8, 0, 1)
    mixed = vt * 1.0 + music * duck + sfx * 0.35
    mixed /= max(1.0, np.abs(mixed).max() / 0.95)
    write_wav(tmp_wav, mixed[: int(total * SR)])
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", out_path + ".video.mp4", "-i", tmp_wav,
                    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out_path], check=True)
    os.remove(out_path + ".video.mp4"); os.remove(tmp_wav)
    return total


def thumbnail(episode, out_path):
    """1280x720 thumbnail: one scene frame, saturated, with 2-4 word text and a red arrow."""
    th = episode.get("thumbnail", {})
    portrait = episode.get("format") == "short"
    ctx = Ctx(*((1080, 1920) if portrait else (1920, 1080)))
    sc = dict(episode["scenes"][th.get("scene", 0)])
    sc.update(th.get("override", {}))
    img = SCENES[sc["type"]](ctx, sc, th.get("t", 2.0), 4.0)
    d = ImageDraw.Draw(img, "RGBA")
    for i, ln in enumerate(th.get("text", [])):
        text(d, ctx, (ctx.W * th.get("x", 0.5), ctx.H * (th.get("y", 0.14) + i * 0.17)), ln,
             fit_size(ln, 190, ctx.W * 0.9, ctx), [YELLOW, WHITE][i % 2], stroke=int(16 * ctx.S))
    if th.get("arrow"):
        ax, ay, bx, by = (v * (ctx.W if j % 2 == 0 else ctx.H) for j, v in enumerate(th["arrow"]))
        d.line([(ax, ay), (bx, by)], fill=RED, width=int(36 * ctx.S))
        a = math.atan2(by - ay, bx - ax); L = 90 * ctx.S
        d.polygon([(bx + L * 0.4 * math.cos(a), by + L * 0.4 * math.sin(a)),
                   (bx + L * math.cos(a + 2.5), by + L * math.sin(a + 2.5)),
                   (bx + L * math.cos(a - 2.5), by + L * math.sin(a - 2.5))], fill=RED)
    if th.get("mascot"):  # big reaction face: [x, y, radius, mood]
        mx, my, mr, mood = th["mascot"]
        blob(d, ctx, ctx.W * mx, ctx.H * my, mr * ctx.S, BLUE, mood, 0.5, look=(-1, -0.4))
    img = ImageEnhance.Color(img).enhance(1.35)
    img = ImageEnhance.Contrast(img).enhance(1.1)
    img = img.resize((720, 1280) if portrait else (1280, 720), Image.LANCZOS)
    img.save(out_path)
