"""Cartoon scene kit for the dark-twist story Shorts: characters with hair styles, a few
parameterised sets (rooms, outdoors, pool, elevator...), props and full-frame insert shots
(phones, notes, screens, photos), all drawn with Cairo on top of animator/toon.py.

A beat is a dict (see stories/*/<story>.json):
  {"set": {"type": "room", ...} | "insert": {"type": "phone", ...},
   "props": [{"type": "fridge", "x": 0.7, ...}], "actors": [{"who": "dad", "x": 0.3, "mood": "shock"}],
   "cam": {"z": [1.0, 1.1], "fx": 0.5, "fy": 0.55}, "fx": ["night", "snow", "fire", "red", "flash"]}
Positions are fractions of the 1080x1920 frame. render(beat, cast, u, t) draws one frame
(u: 0..1 through the beat, t: seconds) and returns an RGB PIL image.
"""
import math, pathlib, random, sys
from functools import lru_cache

import cairo
import numpy as np
from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / 'animator'))
import toon as T  # noqa: E402
from toon import WHITE, BLACK, INK, src, lin, rad, ellipse, rrect, paint, glow, lerp, clamp, darker, lighter, mix  # noqa: E402

W, H = 1080, 1920
T.FONT = 'Inter'
HAND = 'DejaVu Serif'
FLOOR = 0.66  # wall/floor line for interiors
GROUND = 0.88  # default character baseline

HAIR_COLS = {'brown': (95, 60, 35), 'black': (35, 30, 35), 'blond': (235, 195, 95), 'red': (190, 80, 40),
             'gray': (190, 190, 195), 'auburn': (150, 65, 40), 'white': (240, 240, 245)}


def ease(x):
    x = clamp(x); return x * x * (3 - 2 * x)


def kv(spec, key, u, default):
    """A number, or [a, b] eased across the beat."""
    v = spec.get(key, default)
    if isinstance(v, (list, tuple)) and len(v) == 2 and not isinstance(v[0], (list, tuple)):
        return lerp(v[0], v[1], ease(u))
    return v


def text(cr, x, y, s, size, color=INK, font=None, anchor='m', bold=True, italic=False, maxw=None):
    cr.save()
    cr.select_font_face(font or 'Inter', cairo.FONT_SLANT_ITALIC if italic else cairo.FONT_SLANT_NORMAL,
                        cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
    cr.set_font_size(size)
    e = cr.text_extents(s)
    if maxw and e.width > maxw:
        cr.set_font_size(size * maxw / e.width); e = cr.text_extents(s)
    ax = {'l': 0, 'm': -e.width / 2, 'r': -e.width}[anchor] - e.x_bearing
    cr.move_to(x + ax, y - e.y_bearing - e.height / 2)
    src(cr, color); cr.show_text(s); cr.new_path()
    cr.restore()
    return e.width


def wrap(cr, s, size, maxw, font='Inter', bold=True, italic=False):
    cr.select_font_face(font, cairo.FONT_SLANT_ITALIC if italic else cairo.FONT_SLANT_NORMAL,
                        cairo.FONT_WEIGHT_BOLD if bold else cairo.FONT_WEIGHT_NORMAL)
    cr.set_font_size(size)
    lines, cur = [], ''
    for word in s.split():
        trial = (cur + ' ' + word).strip()
        if cr.text_extents(trial).width > maxw and cur:
            lines.append(cur); cur = word
        else:
            cur = trial
    if cur: lines.append(cur)
    return lines


def para(cr, x, y, s, size, color=INK, maxw=800, font='Inter', bold=True, italic=False, lh=1.3, anchor='m'):
    lines = wrap(cr, s, size, maxw, font, bold, italic)
    y0 = y - (len(lines) - 1) * size * lh / 2
    for i, ln in enumerate(lines):
        text(cr, x, y0 + i * size * lh, ln, size, color, font, anchor, bold, italic)


# ------------------------------------------------------------------ characters
def person(cr, x, gy, h, look, t, mood='neutral', pose='idle', facing=1, lookdir=(0, 0), walk=0.0,
           lean=0.0, fx=(), alpha=1.0, seed=0, reach=None, talk=0.0):
    color = tuple(look.get('color', (90, 140, 230)))
    r = h / 2.6
    T.toon(cr, x, gy, h, color, t, mood=mood, pose=pose, talk=talk, look=lookdir, facing=facing, walk=walk,
           lean=lean, seed=seed, fx=fx, reach=reach, alpha=alpha, badge=look.get('badge'))
    style = look.get('hair')
    if not style or alpha < 0.05: return
    hc = HAIR_COLS.get(look.get('hair_color', 'brown'), (95, 60, 35))
    lift = abs(math.sin(t * walk * 2 * math.pi)) * r * 0.08 if walk else 0
    cr.save(); cr.translate(x, gy - lift); cr.rotate(lean); cr.translate(0, -r * 1.5)
    sq = 0.03 * math.sin(t * 3.1 + seed)
    cr.translate(0, r); cr.scale(1 + sq, 1 - sq); cr.translate(0, -r)
    out = darker(hc, 0.55)
    if style in ('long', 'pigtails', 'bun', 'ponytail'):
        if style == 'long':
            for sx in (-1, 1):
                cr.move_to(sx * r * 0.62, -r * 0.85)
                cr.curve_to(sx * r * 1.25, -r * 0.6, sx * r * 1.2, r * 0.2, sx * r * 1.05, r * 0.45)
                cr.curve_to(sx * r * 0.95, r * 0.2, sx * r * 0.9, -r * 0.3, sx * r * 0.82, -r * 0.55)
                cr.close_path(); paint(cr, hc, out, r * 0.04)
        if style == 'pigtails':
            for sx in (-1, 1):
                ellipse(cr, sx * r * 1.12, -r * 0.55, r * 0.26, r * 0.32); paint(cr, hc, out, r * 0.04)
                cr.arc(sx * r * 0.92, -r * 0.62, r * 0.07, 0, 2 * math.pi); paint(cr, (230, 60, 90))
        if style == 'bun':
            cr.arc(0, -r * 1.18, r * 0.3, 0, 2 * math.pi); paint(cr, hc, out, r * 0.04)
    if style == 'ears':  # cat
        for sx in (-1, 1):
            cr.move_to(sx * r * 0.35, -r * 0.9); cr.line_to(sx * r * 0.75, -r * 1.45); cr.line_to(sx * r * 0.9, -r * 0.6); cr.close_path()
            paint(cr, color, darker(color, 0.4), r * 0.04)
            for k in (-1, 1):
                cr.move_to(sx * r * 0.55, r * 0.15 + k * r * 0.06); cr.line_to(sx * r * 1.1, r * 0.1 + k * r * 0.14)
            src(cr, darker(color, 0.4)); cr.set_line_width(r * 0.025); cr.stroke()
        cr.restore(); return
    if style == 'bald':
        for sx in (-1, 1):
            ellipse(cr, sx * r * 0.9, -r * 0.35, r * 0.16, r * 0.24); paint(cr, hc, out, r * 0.03)
    else:
        # cap over the top of the head with a fringe
        cr.move_to(-r * 0.98, -r * 0.42)
        cr.curve_to(-r * 1.02, -r * 1.25, r * 1.02, -r * 1.25, r * 0.98, -r * 0.42)
        if style == 'spiky':
            for i in range(6, -1, -1):
                xx = -r * 0.9 + i * r * 0.3
                cr.line_to(xx + r * 0.15, -r * 0.62); cr.line_to(xx, -r * 0.8)
        else:
            cr.curve_to(r * 0.7, -r * 0.62, r * 0.35, -r * 0.82, r * 0.05, -r * 0.7)
            cr.curve_to(-r * 0.3, -r * 0.82, -r * 0.7, -r * 0.65, -r * 0.98, -r * 0.42)
        cr.close_path()
        cr.set_source(lin(0, -r * 1.2, 0, -r * 0.4, [(0, lighter(hc, 0.25)), (1, darker(hc, 0.85))]))
        cr.fill_preserve(); src(cr, out); cr.set_line_width(r * 0.04); cr.stroke()
        ellipse(cr, -r * 0.35, -r * 0.98, r * 0.25, r * 0.07); src(cr, WHITE, 0.25); cr.fill()
    if look.get('glasses'):
        for sx in (-1, 1):
            cr.arc(sx * r * 0.34, -r * 0.2, r * 0.25, 0, 2 * math.pi)
        src(cr, (40, 40, 50)); cr.set_line_width(r * 0.05); cr.stroke()
    cr.restore()


def sleeper(cr, x, y, h, look, t, eyes='closed', mood='calm'):
    """A head on a pillow under a blanket (for bed shots)."""
    r = h / 2.6
    color = tuple(look.get('color', (90, 140, 230)))
    ellipse(cr, x, y, r * 0.95, r * 0.85)
    cr.set_source(rad(x, y, 0, r * 1.2, [(0, lighter(color, 0.45)), (0.5, color), (1, darker(color, 0.65))], fx=x - r * 0.3, fy=y - r * 0.4))
    cr.fill_preserve(); src(cr, darker(color, 0.4)); cr.set_line_width(r * 0.05); cr.stroke()
    for sx in (-1, 1):
        cx = x + sx * r * 0.32
        if eyes == 'closed':
            cr.arc_negative(cx, y - r * 0.12, r * 0.15, math.pi * 0.9, math.pi * 0.1)
            src(cr, darker(color, 0.35)); cr.set_line_width(r * 0.05); cr.stroke()
        else:
            ellipse(cr, cx, y - r * 0.12, r * 0.17, r * 0.22); paint(cr, WHITE, darker(color, 0.4), r * 0.03)
            cr.arc(cx, y - r * 0.1, r * 0.09, 0, 2 * math.pi); paint(cr, (20, 15, 15))
    if eyes == 'closed':
        k = (t * 0.6) % 1
        text(cr, x + r * 0.9 + k * r * 0.4, y - r * 0.9 - k * r * 0.6, 'z', r * (0.3 + 0.2 * k), (255, 255, 255, ), bold=True)
    hs = look.get('hair')
    if hs and hs != 'bald':
        hc = HAIR_COLS.get(look.get('hair_color', 'brown'))
        cr.move_to(x - r * 0.95, y - r * 0.25)
        cr.curve_to(x - r, y - r * 1.05, x + r, y - r * 1.05, x + r * 0.95, y - r * 0.25)
        cr.curve_to(x + r * 0.5, y - r * 0.55, x - r * 0.5, y - r * 0.55, x - r * 0.95, y - r * 0.25)
        paint(cr, hc, darker(hc, 0.55), r * 0.04)


# ------------------------------------------------------------------ sets
SKY = {'day': ((95, 170, 255), (200, 232, 255)), 'dusk': ((60, 40, 110), (250, 140, 90)),
       'night': ((10, 14, 40), (35, 45, 90)), 'snow': ((170, 185, 205), (225, 232, 240)),
       'gray': ((120, 125, 135), (190, 192, 198))}


def sky(cr, kind, horizon):
    a, b = SKY.get(kind, SKY['day'])
    cr.rectangle(0, 0, W, horizon); cr.set_source(lin(0, 0, 0, horizon, [(0, a), (1, b)])); cr.fill()
    if kind == 'night':
        rnd = random.Random(4)
        for _ in range(70):
            cr.arc(rnd.uniform(0, W), rnd.uniform(0, horizon * 0.8), rnd.uniform(1, 3), 0, 2 * math.pi); src(cr, WHITE, rnd.uniform(0.4, 0.9)); cr.fill()
        cr.arc(W * 0.78, H * 0.1, 60, 0, 2 * math.pi); src(cr, (245, 245, 220)); cr.fill()
        glow(cr, W * 0.78, H * 0.1, 200, (200, 210, 255), 0.35)
    elif kind == 'day':
        glow(cr, W * 0.82, H * 0.08, 260, (255, 250, 200), 0.8)
        T.clouds(cr, W, H * 0.7, 0)


def window(cr, x, y, w, h, outside='day', frame=(240, 240, 235)):
    rrect(cr, x - 16, y - 16, w + 32, h + 32, 10); paint(cr, frame, darker(frame, 0.6), 4)
    a, b = SKY.get(outside, SKY['day'])
    cr.rectangle(x, y, w, h); cr.set_source(lin(0, y, 0, y + h, [(0, a), (1, b)])); cr.fill()
    cr.save(); cr.rectangle(x, y, w, h); cr.clip()
    if outside == 'night':
        cr.arc(x + w * 0.7, y + h * 0.3, w * 0.12, 0, 2 * math.pi); src(cr, (240, 240, 215)); cr.fill()
    elif outside == 'snow':
        rnd = random.Random(9)
        for _ in range(30):
            cr.arc(x + rnd.uniform(0, w), y + rnd.uniform(0, h), rnd.uniform(2, 5), 0, 2 * math.pi); src(cr, WHITE, 0.9); cr.fill()
        cr.rectangle(x, y + h * 0.75, w, h * 0.25); src(cr, (245, 248, 255)); cr.fill()
    else:
        ellipse(cr, x + w * 0.3, y + h * 1.05, w * 0.5, h * 0.3); src(cr, (110, 185, 110)); cr.fill()
    cr.restore()
    cr.move_to(x + w / 2, y); cr.line_to(x + w / 2, y + h); cr.move_to(x, y + h / 2); cr.line_to(x + w, y + h / 2)
    src(cr, frame); cr.set_line_width(12); cr.stroke()


def room(cr, s):
    wall = tuple(s.get('wall', (235, 215, 190)))
    floor = s.get('floor', 'wood')
    fy = H * s.get('floor_y', FLOOR)
    cr.rectangle(0, 0, W, fy); cr.set_source(lin(0, 0, 0, fy, [(0, lighter(wall, 0.15)), (1, darker(wall, 0.88))])); cr.fill()
    if s.get('stripes'):
        for i in range(0, W, 90):
            cr.rectangle(i, 0, 45, fy); src(cr, darker(wall, 0.95), 0.6); cr.fill()
    cr.rectangle(0, fy - 22, W, 22); src(cr, darker(wall, 0.75)); cr.fill()
    if floor == 'wood':
        cr.rectangle(0, fy, W, H - fy); cr.set_source(lin(0, fy, 0, H, [(0, (190, 135, 85)), (1, (140, 90, 50))])); cr.fill()
        for j in range(12):
            y = fy + (H - fy) * (j / 12) ** 1.4
            cr.move_to(0, y); cr.line_to(W, y)
        src(cr, (110, 70, 40), 0.5); cr.set_line_width(3); cr.stroke()
    elif floor == 'tile':
        cr.rectangle(0, fy, W, H - fy); src(cr, (225, 228, 232)); cr.fill()
        for i in range(-10, 20):
            cr.move_to(W / 2 + i * 60, fy); cr.line_to(W / 2 + i * 260, H)
        for j in range(10):
            y = fy + (H - fy) * (j / 10) ** 1.5; cr.move_to(0, y); cr.line_to(W, y)
        src(cr, (170, 175, 185)); cr.set_line_width(3); cr.stroke()
    elif floor == 'carpet':
        cr.rectangle(0, fy, W, H - fy); cr.set_source(lin(0, fy, 0, H, [(0, tuple(s.get('carpet', (150, 40, 45)))), (1, darker(tuple(s.get('carpet', (150, 40, 45))), 0.6))])); cr.fill()
    elif floor == 'concrete':
        cr.rectangle(0, fy, W, H - fy); cr.set_source(lin(0, fy, 0, H, [(0, (170, 170, 172)), (1, (120, 120, 125))])); cr.fill()
        rnd = random.Random(3)
        for _ in range(40):
            ellipse(cr, rnd.uniform(0, W), rnd.uniform(fy, H), rnd.uniform(20, 70), rnd.uniform(5, 15)); src(cr, BLACK, 0.05); cr.fill()
    if s.get('window'):
        wx, wy, ww, wh = s.get('window_rect', (0.08, 0.14, 0.36, 0.2))
        window(cr, W * wx, H * wy, W * ww, H * wh, s['window'])
    if s.get('picture'):
        rrect(cr, W * 0.62, H * 0.16, W * 0.26, H * 0.12, 6); paint(cr, (250, 245, 235), (120, 85, 50), 14)
        ellipse(cr, W * 0.75, H * 0.235, W * 0.08, H * 0.03); src(cr, (120, 180, 120)); cr.fill()
    if s.get('lamp'):
        x = W * s['lamp']
        cr.move_to(x, 0); cr.line_to(x, H * 0.08); src(cr, (50, 45, 45)); cr.set_line_width(5); cr.stroke()
        cr.move_to(x - 70, H * 0.08 + 60); cr.curve_to(x - 70, H * 0.08 - 10, x + 70, H * 0.08 - 10, x + 70, H * 0.08 + 60); cr.close_path(); paint(cr, (60, 60, 75))
        glow(cr, x, H * 0.08 + 70, 300, (255, 230, 160), 0.4)


def outdoor(cr, s):
    kind = s.get('sky', 'day')
    hz = H * s.get('horizon', 0.5)
    sky(cr, kind, hz + 4)
    ground = s.get('ground', 'grass')
    rnd = random.Random(s.get('seed', 2))
    if s.get('city'):
        for i in range(9):
            bw, bh = rnd.uniform(110, 190), rnd.uniform(H * 0.12, H * 0.32)
            bx = i * 125 - 30
            col = (60, 70, 100) if kind == 'night' else (150, 165, 190)
            cr.rectangle(bx, hz - bh, bw, bh); src(cr, darker(col, rnd.uniform(0.8, 1.0))); cr.fill()
            for wy in range(int(hz - bh + 20), int(hz - 20), 46):
                for wx in range(int(bx + 15), int(bx + bw - 25), 36):
                    lit = rnd.random() < (0.5 if kind == 'night' else 0.0)
                    cr.rectangle(wx, wy, 20, 26); src(cr, (255, 220, 120) if lit else lighter(col, 0.3), 0.9 if lit else 0.5); cr.fill()
    if s.get('trees', True) and not s.get('city'):
        for i in range(8):
            x = rnd.uniform(0, W); rr = rnd.uniform(60, 110)
            cr.rectangle(x - 10, hz - rr * 0.6, 20, rr * 0.7); src(cr, (90, 60, 40)); cr.fill()
            tc = (70, 110, 95) if ground == 'snow' else ((30, 50, 40) if kind == 'night' else (70, 150, 70))
            cr.arc(x, hz - rr, rr, 0, 2 * math.pi); src(cr, darker(tc, rnd.uniform(0.85, 1.0))); cr.fill()
    if ground == 'grass':
        cr.rectangle(0, hz, W, H - hz); cr.set_source(lin(0, hz, 0, H, [(0, (120, 195, 90)), (1, (60, 135, 45))])); cr.fill()
    elif ground == 'snow':
        cr.rectangle(0, hz, W, H - hz); cr.set_source(lin(0, hz, 0, H, [(0, (235, 240, 250)), (1, (205, 215, 235))])); cr.fill()
        for _ in range(60):
            ellipse(cr, rnd.uniform(0, W), rnd.uniform(hz, H), rnd.uniform(30, 120), rnd.uniform(6, 16)); src(cr, (190, 205, 230), 0.4); cr.fill()
    elif ground == 'street':
        cr.rectangle(0, hz, W, H - hz); src(cr, (175, 175, 180)); cr.fill()
        ry = hz + (H - hz) * 0.25
        cr.rectangle(0, ry, W, (H - hz) * 0.5); src(cr, (70, 72, 80)); cr.fill()
        for i in range(0, W, 160):
            cr.rectangle(i, ry + (H - hz) * 0.24, 90, 14); src(cr, (250, 220, 90)); cr.fill()
    elif ground == 'deck':
        cr.rectangle(0, hz, W, H - hz); src(cr, (225, 210, 180)); cr.fill()
    if kind == 'night':
        cr.rectangle(0, 0, W, H); src(cr, (10, 20, 60), 0.35); cr.fill()


def pool(cr, s):
    hz = H * 0.36
    sky(cr, 'day', hz)
    cr.rectangle(0, hz, W, H * 0.08); src(cr, (230, 215, 185)); cr.fill()
    py = hz + H * 0.08
    cr.rectangle(0, py, W, H - py); cr.set_source(lin(0, py, 0, H, [(0, (90, 210, 240)), (1, (20, 120, 200))])); cr.fill()
    rnd = random.Random(1)
    for _ in range(50):
        y = rnd.uniform(py, H); x = rnd.uniform(0, W)
        cr.move_to(x, y); cr.curve_to(x + 20, y - 8, x + 40, y + 8, x + 60, y); src(cr, WHITE, 0.35); cr.set_line_width(3); cr.stroke()
    for i in range(1, 4):
        x = i * W / 4
        cr.move_to(x, py); cr.line_to(x + (x - W / 2) * 0.6, H)
    src(cr, (255, 255, 255), 0.5); cr.set_line_width(5); cr.set_dash([22, 18]); cr.stroke(); cr.set_dash([])
    if s.get('chair', True):
        cx = W * 0.85
        for dx in (-50, 50):
            cr.move_to(cx + dx, hz + H * 0.06); cr.line_to(cx + dx * 0.6, hz - H * 0.12)
        src(cr, WHITE); cr.set_line_width(14); cr.stroke()
        rrect(cr, cx - 60, hz - H * 0.14, 120, 30, 8); paint(cr, (230, 60, 60))


def underwater(cr, s):
    cr.rectangle(0, 0, W, H); cr.set_source(lin(0, 0, 0, H, [(0, (70, 190, 235)), (1, (10, 60, 130))])); cr.fill()
    for i in range(7):
        a = -0.4 + i * 0.13
        cr.move_to(W * (0.2 + i * 0.1), 0); cr.line_to(W * (0.2 + i * 0.1) + math.sin(a) * H, H)
        src(cr, WHITE, 0.07); cr.set_line_width(60); cr.stroke()
    fy = H * 0.86
    cr.rectangle(0, fy, W, H - fy); src(cr, (40, 120, 170)); cr.fill()
    for i in range(0, W, 120):
        cr.move_to(i, fy); cr.line_to(i - 200, H)
    src(cr, (20, 90, 140)); cr.set_line_width(4); cr.stroke()
    if s.get('drain'):
        dx = W * s.get('drain', 0.5)
        ellipse(cr, dx, fy + 40, 140, 36); paint(cr, (60, 70, 80), (30, 35, 40), 6)
        for k in range(-4, 5):
            cr.move_to(dx + k * 26, fy + 10); cr.line_to(dx + k * 26, fy + 70)
        src(cr, (30, 35, 40)); cr.set_line_width(6); cr.stroke()


def elevator(cr, s):
    cr.rectangle(0, 0, W, H); cr.set_source(lin(0, 0, W, 0, [(0, (150, 140, 120)), (0.5, (205, 195, 170)), (1, (150, 140, 120))])); cr.fill()
    for x in (W * 0.15, W * 0.85):
        cr.move_to(x, 0); cr.line_to(x, H)
    src(cr, (120, 110, 90)); cr.set_line_width(5); cr.stroke()
    cr.rectangle(0, H * 0.8, W, H * 0.2); src(cr, (90, 80, 70)); cr.fill()
    rrect(cr, W * 0.82, H * 0.32, W * 0.13, H * 0.28, 10); paint(cr, (60, 60, 65), (30, 30, 35), 4)
    for i in range(7):
        lit = s.get('lit') == 13 and i == 0
        cr.arc(W * 0.885, H * 0.36 + i * H * 0.033, 16, 0, 2 * math.pi); paint(cr, (255, 210, 90) if lit else (200, 200, 205))
    glow(cr, W * 0.5, 0, 500, (255, 245, 210), 0.45)
    if s.get('flicker'):
        cr.rectangle(0, 0, W, H); src(cr, BLACK, 0.25); cr.fill()


def hallway(cr, s):
    lux = s.get('lux')
    wall = (120, 30, 45) if lux else (210, 205, 190)
    cr.rectangle(0, 0, W, H); src(cr, wall); cr.fill()
    vx, vy = W / 2, H * 0.42
    floor_col = (150, 20, 35) if lux else (170, 160, 140)
    cr.move_to(0, H); cr.line_to(vx - 90, vy + 80); cr.line_to(vx + 90, vy + 80); cr.line_to(W, H); cr.close_path(); paint(cr, floor_col)
    cr.move_to(0, 0); cr.line_to(vx - 90, vy - 160); cr.line_to(vx + 90, vy - 160); cr.line_to(W, 0); cr.close_path(); paint(cr, darker(wall, 0.8))
    rrect(cr, vx - 90, vy - 160, 180, 240, 4); paint(cr, darker(wall, 0.6))
    doors = s.get('doors', [])
    for i, name in enumerate(doors):
        side = -1 if i % 2 == 0 else 1
        d = i // 2
        k = 0.62 ** d
        dx = vx + side * (W * 0.42 * k + 90 * (1 - k))
        dh, dw = 700 * k, 300 * k
        dy = vy + 80 + (H - vy - 80) * k * 0.85
        cr.save(); cr.translate(dx, dy)
        cr.move_to(-side * 0, 0); cr.line_to(side * dw * 0.55, -dh * 0.06); cr.line_to(side * dw * 0.55, -dh * 1.06); cr.line_to(0, -dh); cr.close_path()
        paint(cr, (95, 60, 35), (40, 25, 15), 4)
        if name:
            px, py = side * dw * 0.28, -dh * 0.78
            rrect(cr, px - 70 * k, py - 20 * k, 140 * k, 40 * k, 6 * k); paint(cr, (230, 190, 90), (120, 90, 30), 2)
            text(cr, px, py, name, 22 * k, INK, maxw=125 * k)
        cr.restore()
    if lux:
        for i in range(4):
            glow(cr, vx + (i - 1.5) * 260 * 0.5 ** (i % 2), H * 0.12 + i * 30, 160, (255, 210, 140), 0.35)


def stairs(cr, s):
    cr.rectangle(0, 0, W, H); src(cr, (25, 22, 30)); cr.fill()
    for i in range(9):
        y = H * 0.3 + i * H * 0.08
        x0, x1 = W * (0.3 - i * 0.025), W * (0.7 + i * 0.025)
        cr.rectangle(x0, y, x1 - x0, H * 0.025); src(cr, (80 - i * 6, 65 - i * 5, 55 - i * 4)); cr.fill()
    rnd = random.Random(7)
    if s.get('eyes'):
        for k in range(2):
            ex = W * 0.5 + (k - 0.5) * 70
            ellipse(cr, ex, H * 0.86, 20, 12); paint(cr, (255, 230, 80))
            glow(cr, ex, H * 0.86, 70, (255, 200, 60), 0.5)
    cr.rectangle(0, 0, W, H); cr.set_source(rad(W / 2, H * 0.25, 50, H * 0.9, [(0, BLACK, 0), (1, BLACK, 0.85)])); cr.fill()


SETS = {'room': room, 'outdoor': outdoor, 'pool': pool, 'underwater': underwater, 'elevator': elevator,
        'hallway': hallway, 'stairs': stairs}


# ------------------------------------------------------------------ props
def p_fridge(cr, x, y, s, p, t):
    w, h = 340 * s, 720 * s
    x0, y0 = x - w / 2, y - h
    rrect(cr, x0, y0, w, h, 26 * s)
    cr.set_source(lin(x0, 0, x0 + w, 0, [(0, (200, 205, 212)), (0.5, (240, 242, 246)), (1, (170, 175, 185))])); cr.fill_preserve()
    src(cr, (100, 105, 115)); cr.set_line_width(5 * s); cr.stroke()
    cr.move_to(x, y0 + 10 * s); cr.line_to(x, y - 10 * s); src(cr, (120, 125, 135)); cr.set_line_width(5 * s); cr.stroke()
    for sx in (-1, 1):
        rrect(cr, x + sx * 30 * s - 7 * s, y0 + h * 0.3, 14 * s, h * 0.3, 7 * s); paint(cr, (150, 155, 165))
    scr = p.get('screen', 'list')
    sx0, sy0, sw, sh = x0 + 30 * s, y0 + 60 * s, w * 0.38, h * 0.26
    rrect(cr, sx0, sy0, sw, sh, 12 * s); paint(cr, (20, 30, 50))
    col = (255, 70, 70) if scr == 'red' else (80, 200, 255)
    glow(cr, sx0 + sw / 2, sy0 + sh / 2, sw, col, 0.35)
    for i in range(3):
        rrect(cr, sx0 + 14 * s, sy0 + 20 * s + i * 50 * s, sw - 28 * s, 30 * s, 6 * s); src(cr, col, 0.8); cr.fill()
    if p.get('eye'):
        cr.arc(x - w * 0.1, y0 + 28 * s, 10 * s, 0, 2 * math.pi); paint(cr, (80, 200, 255)); glow(cr, x - w * 0.1, y0 + 28 * s, 40 * s, (80, 200, 255), 0.7)
    if p.get('open'):
        cr.rectangle(x0 + w * 0.5, y0, w * 0.5, h); src(cr, (250, 252, 255)); cr.fill()
        glow(cr, x + w * 0.25, y0 + h * 0.4, w * 0.6, (230, 245, 255), 0.6)


def p_bed(cr, x, y, s, p, t):
    w = 820 * s
    rrect(cr, x - w / 2, y - 260 * s, w, 260 * s, 20 * s); paint(cr, (140, 95, 60), (80, 50, 30), 5)
    rrect(cr, x - w / 2 - 20 * s, y - 520 * s, 60 * s, 520 * s, 14 * s); paint(cr, (120, 80, 50), (70, 45, 25), 5)
    rrect(cr, x - w / 2 + 40 * s, y - 330 * s, 240 * s, 110 * s, 40 * s); paint(cr, WHITE, (190, 195, 210), 4)
    rrect(cr, x - w / 2 + 160 * s, y - 300 * s, w - 170 * s, 150 * s, 40 * s); paint(cr, tuple(p.get('blanket', (90, 120, 200))), (40, 60, 120), 4)


def p_door(cr, x, y, s, p, t):
    w, h = 320 * s, 720 * s
    rrect(cr, x - w / 2 - 20 * s, y - h - 20 * s, w + 40 * s, h + 20 * s, 6 * s); paint(cr, (240, 235, 225))
    open_k = p.get('open', 0)
    cr.rectangle(x - w / 2, y - h, w, h); src(cr, (20, 18, 25) if open_k else (150, 95, 55)); cr.fill()
    if open_k:
        cr.move_to(x - w / 2, y - h); cr.line_to(x - w / 2 + w * (1 - open_k) * 0.6, y - h - 30 * s); cr.line_to(x - w / 2 + w * (1 - open_k) * 0.6, y + 20 * s); cr.line_to(x - w / 2, y); cr.close_path()
        paint(cr, (150, 95, 55), (80, 50, 30), 4)
        if p.get('light'):
            glow(cr, x, y - h * 0.5, w, (255, 210, 140), 0.5)
    else:
        for yy in (0.15, 0.55):
            rrect(cr, x - w / 2 + 30 * s, y - h + h * yy, w - 60 * s, h * 0.32, 8 * s); src(cr, (120, 75, 40)); cr.set_line_width(5 * s); cr.stroke()
        cr.arc(x + w * 0.36, y - h * 0.48, 16 * s, 0, 2 * math.pi); paint(cr, (230, 190, 90))
    if p.get('note'):
        cr.save(); cr.translate(x, y - h * 0.62); cr.rotate(-0.06)
        cr.rectangle(-90 * s, -60 * s, 180 * s, 120 * s); paint(cr, (255, 250, 200), (180, 170, 120), 2)
        for i in range(4):
            cr.move_to(-70 * s, -35 * s + i * 24 * s); cr.line_to(60 * s, -35 * s + i * 24 * s)
        src(cr, (60, 60, 120)); cr.set_line_width(3 * s); cr.stroke(); cr.restore()


def p_table(cr, x, y, s, p, t):
    w = 620 * s
    for dx in (-0.4, 0.4):
        cr.rectangle(x + dx * w - 12 * s, y - 260 * s, 24 * s, 260 * s); src(cr, (110, 70, 40)); cr.fill()
    rrect(cr, x - w / 2, y - 290 * s, w, 40 * s, 10 * s); paint(cr, (160, 105, 60), (90, 55, 30), 4)
    for i, item in enumerate(p.get('items', [])):
        ix = x - w * 0.3 + i * w * 0.3
        if item == 'plate':
            ellipse(cr, ix, y - 300 * s, 70 * s, 18 * s); paint(cr, WHITE, (180, 180, 190), 3)
            ellipse(cr, ix, y - 310 * s, 40 * s, 14 * s); paint(cr, (210, 120, 60))
        elif item == 'mug':
            rrect(cr, ix - 25 * s, y - 360 * s, 50 * s, 60 * s, 8 * s); paint(cr, (230, 80, 80), (120, 40, 40), 3)


def p_couch(cr, x, y, s, p, t):
    w = 760 * s; col = tuple(p.get('color', (120, 90, 160)))
    rrect(cr, x - w / 2, y - 420 * s, w, 260 * s, 50 * s); paint(cr, darker(col, 0.85), darker(col, 0.5), 5)
    rrect(cr, x - w / 2, y - 220 * s, w, 160 * s, 40 * s); paint(cr, col, darker(col, 0.5), 5)
    for sx in (-1, 1):
        rrect(cr, x + sx * w / 2 - 60 * s, y - 300 * s, 120 * s, 260 * s, 40 * s); paint(cr, darker(col, 0.9), darker(col, 0.5), 5)


def p_car(cr, x, y, s, p, t):
    w = 760 * s; col = tuple(p.get('color', (190, 195, 205)))
    if p.get('van'):
        rrect(cr, x - w / 2, y - 420 * s, w, 330 * s, 40 * s); paint(cr, col, darker(col, 0.55), 5)
        rrect(cr, x + w * 0.22, y - 380 * s, w * 0.22, 120 * s, 16 * s); paint(cr, (60, 80, 110))
    else:
        cr.move_to(x - w / 2, y - 110 * s); cr.line_to(x - w * 0.32, y - 260 * s); cr.line_to(x + w * 0.22, y - 260 * s); cr.line_to(x + w / 2, y - 120 * s); cr.close_path()
        paint(cr, col, darker(col, 0.55), 5)
        rrect(cr, x - w / 2, y - 140 * s, w, 110 * s, 30 * s); paint(cr, col, darker(col, 0.55), 5)
        cr.move_to(x - w * 0.28, y - 150 * s); cr.line_to(x - w * 0.2, y - 240 * s); cr.line_to(x + w * 0.16, y - 240 * s); cr.line_to(x + w * 0.3, y - 150 * s); cr.close_path(); paint(cr, (70, 95, 130))
    for dx in (-0.3, 0.3):
        cr.arc(x + dx * w, y - 40 * s, 60 * s, 0, 2 * math.pi); paint(cr, (35, 35, 40))
        cr.arc(x + dx * w, y - 40 * s, 28 * s, 0, 2 * math.pi); paint(cr, (170, 170, 180))


def p_house(cr, x, y, s, p, t):
    w, h = 820 * s, 560 * s
    col = tuple(p.get('color', (240, 220, 180)))
    cr.rectangle(x - w / 2, y - h, w, h); paint(cr, col, darker(col, 0.6), 5)
    cr.move_to(x - w / 2 - 50 * s, y - h); cr.line_to(x, y - h - 300 * s); cr.line_to(x + w / 2 + 50 * s, y - h); cr.close_path(); paint(cr, (160, 60, 50), (90, 30, 25), 5)
    lit = p.get('lit')
    for dx in (-0.28, 0.28):
        cr.rectangle(x + dx * w - 80 * s, y - h * 0.8, 160 * s, 140 * s); paint(cr, (255, 220, 120) if lit else (150, 200, 240), (90, 70, 50), 5)
    cr.rectangle(x - 70 * s, y - 280 * s, 140 * s, 280 * s); paint(cr, (130, 80, 45), (70, 40, 20), 5)
    if p.get('snow'):
        cr.move_to(x - w / 2 - 50 * s, y - h); cr.line_to(x, y - h - 300 * s); cr.line_to(x + w / 2 + 50 * s, y - h)
        src(cr, WHITE); cr.set_line_width(30 * s); cr.stroke()


def p_phone(cr, x, y, s, p, t):
    rrect(cr, x - 50 * s, y - 100 * s, 100 * s, 200 * s, 16 * s); paint(cr, (30, 30, 40))
    rrect(cr, x - 42 * s, y - 90 * s, 84 * s, 180 * s, 10 * s); paint(cr, (90, 180, 255))
    glow(cr, x, y, 140 * s, (120, 200, 255), 0.4)


def p_plate(cr, x, y, s, p, t):
    ellipse(cr, x, y, 110 * s, 30 * s); paint(cr, WHITE, (170, 170, 180), 4)
    if p.get('food', True):
        ellipse(cr, x, y - 12 * s, 70 * s, 22 * s); paint(cr, tuple(p.get('food_color', (190, 60, 50))))
    if p.get('steam'):
        for i in range(3):
            ph = t * 2 + i
            cr.move_to(x + (i - 1) * 40 * s, y - 40 * s)
            for j in range(1, 8): cr.line_to(x + (i - 1) * 40 * s + math.sin(ph + j) * 10 * s, y - 40 * s - j * 20 * s)
            src(cr, WHITE, 0.6); cr.set_line_width(5 * s); cr.stroke()


def p_footprints(cr, x, y, s, p, t):
    n = p.get('n', 8)
    reveal = p.get('reveal', 1.0)
    if isinstance(reveal, list): reveal = lerp(reveal[0], reveal[1], p.get('_u', 1.0))
    x1, y1 = p.get('to', (0.5, 0.55))
    for i in range(n):
        k = i / max(1, n - 1)
        if k > reveal: break
        px, py = lerp(x, W * x1, k), lerp(y, H * y1, k)
        sc = lerp(1.0, 0.5, k) * s
        for side in (p.get('pairs', [-1, 1])):
            ox = side * 36 * sc + (22 * sc if i % 2 else -22 * sc)
            ellipse(cr, px + ox, py, 24 * sc, 44 * sc); src(cr, (105, 120, 165), 0.9); cr.fill()
            if p.get('bare'):
                for tt in range(5):
                    cr.arc(px + ox - 17 * sc + tt * 8.5 * sc, py - 52 * sc, 6 * sc, 0, 2 * math.pi); src(cr, (105, 120, 165), 0.9); cr.fill()


def p_tv(cr, x, y, s, p, t):
    rrect(cr, x - 240 * s, y - 300 * s, 480 * s, 280 * s, 14 * s); paint(cr, (30, 30, 35))
    rrect(cr, x - 225 * s, y - 285 * s, 450 * s, 250 * s, 8 * s); paint(cr, tuple(p.get('screen', (60, 90, 140))))
    if p.get('label'):
        text(cr, x, y - 160 * s, p['label'], 40 * s, WHITE, maxw=420 * s)


def p_piano(cr, x, y, s, p, t):
    w = 640 * s
    rrect(cr, x - w / 2, y - 420 * s, w, 420 * s, 16 * s); paint(cr, (25, 22, 28))
    cr.rectangle(x - w / 2 + 20 * s, y - 250 * s, w - 40 * s, 60 * s); paint(cr, WHITE)
    for i in range(22):
        xx = x - w / 2 + 20 * s + i * (w - 40 * s) / 22
        cr.move_to(xx, y - 250 * s); cr.line_to(xx, y - 190 * s)
        if i % 7 not in (2, 6): cr.rectangle(xx + 10 * s, y - 250 * s, 12 * s, 36 * s); src(cr, BLACK); cr.fill()
    src(cr, (120, 120, 120)); cr.set_line_width(2); cr.stroke()


def p_shelf(cr, x, y, s, p, t):
    w, h = 520 * s, 900 * s
    cr.rectangle(x - w / 2, y - h, w, h); paint(cr, (120, 80, 45), (70, 45, 25), 5)
    rnd = random.Random(int(x))
    for j in range(5):
        yy = y - h + 40 * s + j * 170 * s
        cr.rectangle(x - w / 2 + 15 * s, yy + 130 * s, w - 30 * s, 14 * s); src(cr, (80, 50, 25)); cr.fill()
        xx = x - w / 2 + 25 * s
        while xx < x + w / 2 - 50 * s:
            bw = rnd.uniform(24, 44) * s
            cr.rectangle(xx, yy + rnd.uniform(10, 40) * s, bw, 120 * s - rnd.uniform(0, 30) * s)
            src(cr, [(170, 50, 50), (50, 90, 160), (60, 140, 80), (200, 160, 60), (110, 70, 140)][rnd.randrange(5)]); cr.fill()
            xx += bw + 4 * s


def p_mailboxes(cr, x, y, s, p, t):
    names = p.get('names', [])
    for i, nm in enumerate(names):
        cx, cy = x + (i % 3 - 1) * 200 * s, y + (i // 3) * 170 * s
        rrect(cr, cx - 90 * s, cy - 70 * s, 180 * s, 140 * s, 8 * s); paint(cr, (190, 160, 90), (110, 85, 40), 4)
        rrect(cr, cx - 70 * s, cy - 50 * s, 140 * s, 36 * s, 4 * s); paint(cr, WHITE if nm else (220, 210, 190))
        if nm: text(cr, cx, cy - 32 * s, nm, 22 * s, INK, maxw=130 * s)


def p_counter(cr, x, y, s, p, t):
    w = p.get('w', 1.0) * W
    cr.rectangle(x - w / 2, y - 330 * s, w, 330 * s); paint(cr, tuple(p.get('color', (150, 100, 60))), (80, 50, 25), 5)
    cr.rectangle(x - w / 2 - 10, y - 350 * s, w + 20, 30 * s); paint(cr, (230, 228, 222), (160, 155, 150), 3)


def p_sign(cr, x, y, s, p, t):
    w = p.get('w', 600) * s
    rrect(cr, x - w / 2, y - 70 * s, w, 140 * s, 16 * s); paint(cr, tuple(p.get('color', (240, 240, 240))), (60, 60, 70), 5)
    text(cr, x, y, p.get('text', ''), 56 * s, tuple(p.get('ink', INK)), maxw=w - 40 * s)


def p_monitor(cr, x, y, s, p, t):
    rrect(cr, x - 200 * s, y - 160 * s, 400 * s, 260 * s, 14 * s); paint(cr, (35, 35, 40))
    rrect(cr, x - 185 * s, y - 145 * s, 370 * s, 230 * s, 6 * s); paint(cr, (10, 25, 15))
    cr.move_to(x - 180 * s, y - 30 * s)
    for i in range(36):
        xx = x - 180 * s + i * 10 * s
        yy = y - 30 * s - (60 * s if (i + int(t * 6)) % 12 == 3 else 0) + (25 * s if (i + int(t * 6)) % 12 == 4 else 0)
        cr.line_to(xx, yy)
    src(cr, (60, 255, 120)); cr.set_line_width(5 * s); cr.stroke()


def p_lounge(cr, x, y, s, p, t):
    p_couch(cr, x, y, s, {'color': (200, 160, 70)}, t)
    rrect(cr, x - 180 * s, y - 60 * s, 360 * s, 50 * s, 10 * s); paint(cr, (90, 50, 30))
    for i in range(3):
        ellipse(cr, x - 100 * s + i * 100 * s, y - 70 * s, 40 * s, 14 * s); paint(cr, WHITE)
        cr.arc(x - 100 * s + i * 100 * s, y - 84 * s, 18 * s, 0, 2 * math.pi); paint(cr, [(230, 120, 140), (250, 210, 90), (140, 90, 60)][i])


def p_box(cr, x, y, s, p, t):  # cardboard box / poison box
    if p.get('poison'):
        rrect(cr, x - 120 * s, y - 300 * s, 240 * s, 300 * s, 10 * s); paint(cr, (250, 215, 30), (140, 110, 0), 5)
        skull(cr, x, y - 170 * s, 60 * s)
    else:
        rrect(cr, x - 160 * s, y - 220 * s, 320 * s, 220 * s, 8 * s); paint(cr, (200, 150, 90), (120, 85, 45), 5)


def skull(cr, x, y, r):
    cr.arc(x, y - r * 0.2, r, math.pi, 2 * math.pi); cr.line_to(x + r, y + r * 0.3)
    cr.line_to(x + r * 0.5, y + r * 0.5); cr.line_to(x + r * 0.5, y + r * 0.9); cr.line_to(x - r * 0.5, y + r * 0.9)
    cr.line_to(x - r * 0.5, y + r * 0.5); cr.line_to(x - r, y + r * 0.3); cr.close_path(); paint(cr, (25, 20, 20))
    for sx in (-1, 1):
        cr.arc(x + sx * r * 0.42, y - r * 0.05, r * 0.24, 0, 2 * math.pi); paint(cr, (250, 215, 30))


def p_camera(cr, x, y, s, p, t):
    rrect(cr, x - 180 * s, y - 110 * s, 360 * s, 220 * s, 24 * s); paint(cr, (45, 42, 40), (15, 15, 15), 4)
    rrect(cr, x - 150 * s, y - 150 * s, 110 * s, 50 * s, 10 * s); paint(cr, (60, 58, 55))
    cr.arc(x + 20 * s, y + 5 * s, 80 * s, 0, 2 * math.pi); paint(cr, (20, 20, 25), (150, 150, 155), 8)
    cr.arc(x + 20 * s, y + 5 * s, 45 * s, 0, 2 * math.pi); cr.set_source(rad(x, y - 10 * s, 0, 50 * s, [(0, (120, 150, 220)), (1, (10, 10, 30))])); cr.fill()
    if p.get('flash'):
        glow(cr, x + 120 * s, y - 120 * s, 260 * s, (255, 255, 230), p['flash'])


def p_shovel(cr, x, y, s, p, t):
    cr.move_to(x, y); cr.line_to(x + 40 * s, y - 500 * s); src(cr, (140, 95, 55)); cr.set_line_width(18 * s); cr.stroke()
    cr.move_to(x - 50 * s, y + 10 * s); cr.line_to(x + 40 * s, y + 20 * s); cr.line_to(x + 20 * s, y + 140 * s); cr.line_to(x - 30 * s, y + 130 * s); cr.close_path(); paint(cr, (150, 155, 165))


def p_grave(cr, x, y, s, p, t):
    cr.move_to(x - 120 * s, y); cr.line_to(x - 120 * s, y - 220 * s); cr.curve_to(x - 120 * s, y - 330 * s, x + 120 * s, y - 330 * s, x + 120 * s, y - 220 * s); cr.line_to(x + 120 * s, y); cr.close_path()
    paint(cr, (150, 150, 160), (80, 80, 90), 5)


def p_fire(cr, x, y, s, p, t):
    for i in range(7):
        fx = x + (i - 3) * 70 * s
        hh = (220 + 90 * math.sin(t * 9 + i * 1.7)) * s
        cr.move_to(fx - 60 * s, y); cr.curve_to(fx - 60 * s, y - hh * 0.5, fx - 10 * s, y - hh * 0.6, fx, y - hh)
        cr.curve_to(fx + 10 * s, y - hh * 0.6, fx + 60 * s, y - hh * 0.5, fx + 60 * s, y); cr.close_path()
        cr.set_source(lin(0, y - hh, 0, y, [(0, (255, 230, 90)), (0.5, (255, 130, 30)), (1, (220, 40, 20))])); cr.fill()
    glow(cr, x, y - 150 * s, 600 * s, (255, 120, 30), 0.45)


def p_pond(cr, x, y, s, p, t):
    ellipse(cr, x, y, 420 * s, 110 * s); cr.set_source(lin(0, y - 110 * s, 0, y + 110 * s, [(0, (200, 225, 245)), (1, (150, 185, 220))])); cr.fill()
    if p.get('hole'):
        ellipse(cr, x + 60 * s, y, 90 * s, 30 * s); paint(cr, (20, 40, 70))
    for i in range(4):
        cr.move_to(x - 300 * s + i * 160 * s, y - 40 * s); cr.line_to(x - 220 * s + i * 160 * s, y + 20 * s)
    src(cr, WHITE, 0.6); cr.set_line_width(4 * s); cr.stroke()


def p_clipboard(cr, x, y, s, p, t):
    rrect(cr, x - 110 * s, y - 150 * s, 220 * s, 300 * s, 12 * s); paint(cr, (150, 105, 60), (80, 55, 30), 4)
    cr.rectangle(x - 90 * s, y - 120 * s, 180 * s, 255 * s); paint(cr, WHITE)
    for i in range(7):
        cr.move_to(x - 70 * s, y - 90 * s + i * 32 * s); cr.line_to(x + 70 * s, y - 90 * s + i * 32 * s)
    src(cr, (120, 120, 140)); cr.set_line_width(4 * s); cr.stroke()


def p_lifeguard_chair(cr, x, y, s, p, t):
    for dx in (-90, 90):
        cr.move_to(x + dx * s, y); cr.line_to(x + dx * 0.6 * s, y - 600 * s)
    src(cr, WHITE); cr.set_line_width(22 * s); cr.stroke()
    rrect(cr, x - 110 * s, y - 640 * s, 220 * s, 50 * s, 10 * s); paint(cr, (230, 60, 60))


def p_crowd(cr, x, y, s, p, t):
    rnd = random.Random(p.get('seed', 3))
    for i in range(p.get('n', 6)):
        col = [(240, 120, 90), (120, 200, 150), (230, 190, 80), (150, 130, 230), (90, 170, 230), (230, 120, 180)][i % 6]
        hx = x + (i - p.get('n', 6) / 2 + 0.5) * 170 * s
        person(cr, hx, y + rnd.uniform(-20, 20) * s, 380 * s, {'color': col, 'hair': rnd.choice(['short', 'long', 'spiky', 'bald'])}, t + i,
               mood=p.get('mood', 'happy'), pose=p.get('pose', 'cheer' if p.get('cheer') else 'idle'), seed=i)


PROPS = {k[2:]: v for k, v in globals().items() if k.startswith('p_')}


# ------------------------------------------------------------------ inserts (full-frame close-ups)
def i_phone(cr, s, u, t):
    cr.rectangle(0, 0, W, H); cr.set_source(lin(0, 0, 0, H, [(0, tuple(s.get('bg', (40, 45, 70)))), (1, darker(tuple(s.get('bg', (40, 45, 70))), 0.5))])); cr.fill()
    pw, ph = 720, 1380
    x0, y0 = (W - pw) / 2, H * 0.12
    rrect(cr, x0 - 30, y0 - 30, pw + 60, ph + 60, 90); paint(cr, (25, 25, 32))
    rrect(cr, x0, y0, pw, ph, 66); cr.set_source(lin(0, y0, 0, y0 + ph, [(0, (235, 240, 250)), (1, (205, 215, 235))])); cr.fill()
    rrect(cr, W / 2 - 90, y0 + 20, 180, 44, 22); paint(cr, (25, 25, 32))
    text(cr, x0 + 70, y0 + 46, s.get('time', '9:41'), 34, INK, anchor='l')
    if s.get('app'):
        rrect(cr, x0, y0 + 90, pw, 140, 0); paint(cr, tuple(s.get('app_color', (90, 110, 240))))
        text(cr, W / 2, y0 + 160, s['app'], 52, WHITE, maxw=pw - 60)
    yy = y0 + 300
    for i, item in enumerate(s.get('items', [])):
        k = clamp((u - i * s.get('stagger', 0.18)) / 0.12)
        if k <= 0: continue
        style = item.get('style', 'note') if isinstance(item, dict) else 'note'
        body = item['text'] if isinstance(item, dict) else item
        lines = wrap(cr, body, 44, pw - 140)
        bh = 60 + len(lines) * 58 + (50 if isinstance(item, dict) and item.get('title') else 0)
        cr.save(); cr.translate(0, (1 - T.ease_back(k)) * 60)
        col = {'note': (255, 255, 255), 'alert': (255, 225, 225), 'good': (215, 250, 225), 'bubble': (90, 150, 255), 'vm': (255, 255, 255)}[style]
        rrect(cr, x0 + 40, yy, pw - 80, bh, 30); paint(cr, col, (190, 195, 210), 3)
        ty = yy + 40
        if isinstance(item, dict) and item.get('title'):
            text(cr, x0 + 80, ty + 6, item['title'], 36, (110, 110, 130), anchor='l'); ty += 50
        for ln in lines:
            text(cr, x0 + 80, ty + 18, ln, 44, WHITE if style == 'bubble' else INK, anchor='l'); ty += 58
        if style == 'vm':
            for b in range(28):
                hh = 10 + 40 * abs(math.sin(b * 1.7 + t * (6 if u > 0.1 else 0)))
                rrect(cr, x0 + 90 + b * 20, ty + 40 - hh / 2, 12, hh, 6); src(cr, (90, 110, 240)); cr.fill()
        cr.restore()
        yy += bh + 30


def i_note(cr, s, u, t):
    cr.rectangle(0, 0, W, H); src(cr, tuple(s.get('bg', (110, 80, 60)))); cr.fill()
    if s.get('pillow'):
        ellipse(cr, W / 2, H * 0.5, W * 0.7, H * 0.32); paint(cr, (245, 245, 250), (200, 205, 220), 6)
    cr.save(); cr.translate(W / 2, H * 0.48); cr.rotate(s.get('rot', -0.04))
    pw, ph = 800, s.get('h', 900)
    cr.rectangle(-pw / 2 + 14, -ph / 2 + 18, pw, ph); src(cr, BLACK, 0.3); cr.fill()
    cr.rectangle(-pw / 2, -ph / 2, pw, ph); paint(cr, tuple(s.get('paper', (255, 252, 235))))
    if s.get('lined', True):
        for i in range(int(ph / 70)):
            cr.move_to(-pw / 2, -ph / 2 + 90 + i * 70); cr.line_to(pw / 2, -ph / 2 + 90 + i * 70)
        src(cr, (150, 190, 230), 0.6); cr.set_line_width(3); cr.stroke()
    lines = s.get('lines', [])
    shown = len(lines) if not s.get('write') else int(len(lines) * clamp(u * 1.3) + 0.999)
    y = -ph / 2 + 130
    for ln in lines[:shown]:
        for sub in wrap(cr, ln, s.get('size', 64), pw - 120, HAND, True, True):
            text(cr, -pw / 2 + 60, y, sub, s.get('size', 64), tuple(s.get('ink', (30, 40, 120))), HAND, 'l', True, True); y += s.get('size', 64) * 1.35
        y += 20
    cr.restore()


def i_screen(cr, s, u, t):
    """Fridge touchscreen close-up: grocery icons or household icons."""
    cr.rectangle(0, 0, W, H); cr.set_source(lin(0, 0, W, 0, [(0, (170, 175, 185)), (0.5, (225, 228, 235)), (1, (160, 165, 175))])); cr.fill()
    x0, y0, sw, sh = W * 0.1, H * 0.14, W * 0.8, H * 0.66
    rrect(cr, x0, y0, sw, sh, 40); paint(cr, (15, 22, 40), (60, 65, 75), 10)
    mode = s.get('mode', 'groceries')
    accent = (255, 80, 80) if s.get('red') else (90, 200, 255)
    glow(cr, W / 2, y0 + sh / 2, sw * 0.7, accent, 0.15)
    if mode == 'family':
        n = s.get('gray', 3)
        for i, (hh, hair) in enumerate([(1.0, 'short'), (0.95, 'long'), (0.7, 'short'), (0.65, 'pigtails')]):
            cx = x0 + sw * (0.16 + i * 0.225)
            grayed = i == n
            col = (110, 115, 125) if grayed else accent
            a = 1.0 if not grayed else lerp(1.0, 0.35, ease(u * 1.5))
            r = 70 * hh
            cy = y0 + sh * 0.62
            cr.arc(cx, cy - 330 * hh, r * 0.75, 0, 2 * math.pi); src(cr, col, a); cr.fill()
            rrect(cr, cx - r, cy - 230 * hh, 2 * r, 300 * hh, r * 0.6); src(cr, col, a); cr.fill()
            if not grayed: glow(cr, cx, cy - 150, 160, accent, 0.25)
        text(cr, W / 2, y0 + sh * 0.86, s.get('label', 'HOUSEHOLD: 3'), 64, accent)
    elif mode == 'poison':
        k = ease(u * 2)
        cr.save(); cr.translate(W / 2, y0 + sh * 0.5); cr.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k)
        p_box(cr, 0, 260, 1.6, {'poison': True}, t)
        cr.restore()
        text(cr, W / 2, y0 + sh * 0.88, s.get('label', 'ADDED BY: JEN'), 60, (255, 80, 80))
    else:
        items = s.get('items', ['SHAKES', 'OAT MILK', 'PUDDING'])
        for i, it in enumerate(items):
            yy = y0 + 120 + i * 190
            hl = s.get('highlight') == i
            rrect(cr, x0 + 50, yy, sw - 100, 150, 26); paint(cr, (60, 20, 30) if hl else (30, 45, 75), (255, 80, 80) if hl else None, 6 if hl else 0)
            mark = s.get('marks', ['check'] * len(items))[i]
            text(cr, x0 + 110, yy + 75, it, 58, WHITE, anchor='l', maxw=sw - 330)
            mx = x0 + sw - 140
            if mark == 'check':
                cr.move_to(mx - 30, yy + 75); cr.line_to(mx - 5, yy + 100); cr.line_to(mx + 40, yy + 45); src(cr, (80, 230, 120)); cr.set_line_width(14); cr.stroke()
            elif mark == 'x':
                cr.move_to(mx - 30, yy + 45); cr.line_to(mx + 30, yy + 105); cr.move_to(mx + 30, yy + 45); cr.line_to(mx - 30, yy + 105)
                src(cr, (255, 80, 80)); cr.set_line_width(14); cr.stroke()
            elif mark == 'ai':
                rrect(cr, mx - 40, yy + 45, 80, 60, 10); paint(cr, (90, 200, 255)); text(cr, mx, yy + 75, 'AI', 34, INK)
            elif mark == 'hand':
                rrect(cr, mx - 40, yy + 45, 80, 60, 10); paint(cr, (255, 80, 80)); text(cr, mx, yy + 75, 'JEN', 26, WHITE)


def i_hand(cr, s, u, t):
    """Close-up of a hand wearing a ring; the finger reddens with tight."""
    cr.rectangle(0, 0, W, H); cr.set_source(rad(W / 2, H / 2, 100, H * 0.8, [(0, tuple(s.get('bg', (250, 230, 235)))), (1, darker(tuple(s.get('bg', (250, 230, 235))), 0.7))])); cr.fill()
    tight = kv(s, 'tight', u, 0.0)
    skin = (240, 190, 160)
    fcol = mix(skin, (150, 60, 140), tight)
    cr.save(); cr.translate(W / 2, H * 0.62); cr.rotate(-0.15)
    rrect(cr, -260, 0, 520, 600, 160); paint(cr, skin, darker(skin, 0.6), 6)
    for i, (dx, ln) in enumerate(((-195, 360), (-70, 470), (60, 440), (180, 330))):
        col = fcol if i == 2 else skin
        rrect(cr, dx - 55, -ln + 80, 110, ln, 55); paint(cr, col, darker(skin, 0.6), 6)
        if i == 2:
            ry = -ln * 0.35
            w = 132 - 22 * tight
            rrect(cr, dx - w / 2, ry, w, 46, 20); cr.set_source(lin(0, ry, 0, ry + 46, [(0, (255, 240, 160)), (0.5, (230, 180, 40)), (1, (160, 110, 10))])); cr.fill()
            cr.arc(dx, ry - 6, 26, 0, 2 * math.pi); cr.set_source(rad(dx - 6, ry - 12, 0, 30, [(0, WHITE), (1, (150, 220, 255))])); cr.fill()
            glow(cr, dx, ry, 120, (255, 255, 230), 0.35)
            if tight > 0.2:
                for k in (-1, 1):
                    cr.move_to(dx + k * 80, ry + 20); cr.line_to(dx + k * 120, ry + 10); cr.move_to(dx + k * 80, ry + 34); cr.line_to(dx + k * 125, ry + 44)
                src(cr, (200, 40, 60)); cr.set_line_width(7); cr.stroke()
    cr.restore()


def i_card(cr, s, u, t):
    cr.rectangle(0, 0, W, H); src(cr, tuple(s.get('bg', (40, 35, 45)))); cr.fill()
    if s.get('box'):
        rrect(cr, W * 0.15, H * 0.6, W * 0.7, H * 0.2, 30); paint(cr, (120, 20, 50), (60, 10, 25), 6)
    cr.save(); cr.translate(W / 2, H * 0.42); cr.rotate(-0.03)
    rrect(cr, -380, -220, 760, 440, 18); paint(cr, (252, 248, 238), (190, 180, 160), 4)
    para(cr, 0, 0, s.get('text', ''), s.get('size', 66), tuple(s.get('ink', INK)), 640, s.get('font', 'DejaVu Serif'), True, s.get('italic', False))
    cr.restore()


def i_newspaper(cr, s, u, t):
    cr.rectangle(0, 0, W, H); src(cr, (70, 55, 45)); cr.fill()
    cr.save(); cr.translate(W / 2, H * 0.48); cr.rotate(0.03)
    cr.rectangle(-460, -700, 920, 1400); paint(cr, (235, 225, 195), (160, 150, 120), 4)
    text(cr, 0, -620, s.get('paper', 'THE DAILY GAZETTE'), 64, INK, 'DejaVu Serif', maxw=860)
    cr.move_to(-430, -570); cr.line_to(430, -570); src(cr, INK); cr.set_line_width(4); cr.stroke()
    text(cr, 0, -530, s.get('date', ''), 34, (80, 70, 60), 'DejaVu Serif', bold=False)
    para(cr, 0, -360, s.get('headline', ''), 70, INK, 860, 'DejaVu Serif', True)
    if s.get('photo'):
        cr.rectangle(-300, -220, 600, 440); paint(cr, (190, 180, 160), (90, 80, 70), 4)
        person(cr, 0, 210, 380, s['photo'], 0, mood='happy')
        cr.rectangle(-300, -220, 600, 440); src(cr, (120, 100, 70), 0.25); cr.fill()
    for i in range(9):
        cr.move_to(-430, 300 + i * 40); cr.line_to(430 if i % 3 else 200, 300 + i * 40)
    src(cr, (120, 110, 100)); cr.set_line_width(10); cr.stroke()
    cr.restore()


def i_panel(cr, s, u, t):
    cr.rectangle(0, 0, W, H); cr.set_source(lin(0, 0, W, 0, [(0, (120, 110, 95)), (0.5, (190, 180, 160)), (1, (120, 110, 95))])); cr.fill()
    rrect(cr, W * 0.2, H * 0.12, W * 0.6, H * 0.76, 30); paint(cr, (55, 55, 60), (25, 25, 30), 8)
    floors = list(range(1, 13)) + [13]
    lit = s.get('lit', 13)
    for i, f in enumerate(floors[::-1]):
        col, row = (0 if f == 13 else (f - 1) % 2), (0 if f == 13 else 6 - (f - 1) // 2)
        cx = W * (0.5 if f == 13 else (0.38 + col * 0.24))
        cy = H * (0.2 if f == 13 else 0.3 + row * 0.085)
        on = f == lit and (u > s.get('press_at', 0.4) or s.get('on'))
        cr.arc(cx, cy, 70 if f == 13 else 58, 0, 2 * math.pi)
        paint(cr, (255, 200, 80) if on else ((90, 20, 30) if f == 13 else (210, 210, 215)), (30, 30, 30), 5)
        if on: glow(cr, cx, cy, 200, (255, 190, 60), 0.5)
        text(cr, cx, cy, str(f), 54 if f == 13 else 44, (255, 240, 220) if f == 13 and not on else INK)
    if s.get('finger'):
        k = ease(u / max(0.01, s.get('press_at', 0.4)))
        fx, fy = W * 0.5 + 40, lerp(H * 0.62, H * 0.2 + 40, k)
        cr.save(); cr.translate(fx, fy); cr.rotate(-0.3)
        rrect(cr, -55, 0, 110, 700, 55); paint(cr, (240, 190, 160), (160, 110, 90), 5)
        cr.restore()


def i_photo(cr, s, u, t):
    cr.rectangle(0, 0, W, H); src(cr, tuple(s.get('bg', (60, 50, 45)))); cr.fill()
    dev = clamp(u * s.get('speed', 1.6))
    cr.save(); cr.translate(W / 2, H * 0.46); cr.rotate(s.get('rot', -0.05))
    cr.rectangle(-380, -470, 760, 920); paint(cr, (250, 250, 245), (190, 190, 185), 3)
    cr.rectangle(-330, -420, 660, 660); src(cr, (230, 225, 210)); cr.fill()
    cr.save(); cr.rectangle(-330, -420, 660, 660); cr.clip()
    if s.get('subject'):
        look = dict(s['subject'])
        if s.get('old'):
            look['hair'] = look.get('hair') or 'short'; look['hair_color'] = 'white'
            look['color'] = mix(tuple(look['color']), (175, 175, 180), 0.55)
        person(cr, 0, 360, 720, look, 0, mood=s.get('mood', 'happy'), seed=2)
        if s.get('old'):
            for k in range(3):
                cr.move_to(-120 + k * 20, -40 - k * 30); cr.line_to(-60 + k * 20, -30 - k * 30)
            src(cr, darker(tuple(look['color']), 0.5)); cr.set_line_width(5); cr.stroke()
    cr.rectangle(-330, -420, 660, 660); src(cr, (30, 25, 20), 1 - dev); cr.fill()
    cr.rectangle(-330, -420, 660, 660); src(cr, (150, 110, 60), 0.18); cr.fill()
    cr.restore()
    if s.get('caption'):
        text(cr, 0, 345, s['caption'], 48, (40, 40, 120), HAND, italic=True)
    cr.restore()


def i_door(cr, s, u, t):
    """A door close-up with a nameplate or a note."""
    cr.rectangle(0, 0, W, H); src(cr, tuple(s.get('wall', (120, 30, 45)))); cr.fill()
    rrect(cr, W * 0.12, H * 0.05, W * 0.76, H * 0.95, 10); paint(cr, (100, 62, 35), (50, 30, 15), 8)
    for yy in (0.12, 0.52):
        rrect(cr, W * 0.2, H * yy, W * 0.6, H * 0.34, 10); src(cr, (70, 42, 22)); cr.set_line_width(8); cr.stroke()
    cr.arc(W * 0.76, H * 0.5, 30, 0, 2 * math.pi); paint(cr, (230, 190, 90))
    if s.get('name'):
        rrect(cr, W * 0.25, H * 0.25, W * 0.5, H * 0.08, 12); cr.set_source(lin(0, H * 0.25, 0, H * 0.33, [(0, (255, 230, 150)), (1, (190, 140, 50))])); cr.fill()
        text(cr, W / 2, H * 0.29, s['name'], 70, INK, 'DejaVu Serif', maxw=W * 0.45)
    if s.get('note'):
        cr.save(); cr.translate(W / 2, H * 0.36); cr.rotate(-0.04)
        cr.rectangle(-330, -260, 660, 520); paint(cr, (255, 250, 220), (180, 170, 120), 3)
        para(cr, 0, 0, s['note'], 52, (30, 40, 120), 580, HAND, True, True)
        cr.restore()


def i_score(cr, s, u, t):
    cr.rectangle(0, 0, W, H); cr.set_source(rad(W / 2, H * 0.45, 50, H, [(0, (40, 60, 120)), (1, (8, 10, 30))])); cr.fill()
    a, b = s.get('from', 41), s.get('to', 41)
    v = int(round(lerp(a, b, ease(u * 1.2))))
    col = (255, 80, 80) if v < 50 else ((255, 200, 60) if v < 90 else (80, 240, 140))
    cr.arc(W / 2, H * 0.42, 340, 0, 2 * math.pi); src(cr, (255, 255, 255), 0.1); cr.set_line_width(40); cr.stroke()
    cr.arc(W / 2, H * 0.42, 340, -math.pi / 2, -math.pi / 2 + 2 * math.pi * v / 100); src(cr, col); cr.set_line_width(40); cr.stroke()
    text(cr, W / 2, H * 0.42, str(v), 260, col)
    text(cr, W / 2, H * 0.62, s.get('label', 'KINDNESS SCORE'), 70, WHITE)
    if s.get('sub'): text(cr, W / 2, H * 0.68, s['sub'], 48, (200, 210, 230))


def i_computer(cr, s, u, t):
    cr.rectangle(0, 0, W, H); src(cr, (20, 22, 30)); cr.fill()
    rrect(cr, W * 0.06, H * 0.18, W * 0.88, H * 0.5, 20); paint(cr, (30, 35, 45), (10, 10, 15), 10)
    rrect(cr, W * 0.09, H * 0.2, W * 0.82, H * 0.46, 10); paint(cr, (15, 20, 30))
    for i, name in enumerate(s.get('files', [])):
        y = H * 0.24 + i * 90
        if y > H * 0.62: break
        rrect(cr, W * 0.12, y, W * 0.76, 70, 10); paint(cr, (35, 45, 65))
        for b in range(24):
            hh = 8 + 40 * abs(math.sin(b * 1.3 + i))
            rrect(cr, W * 0.5 + b * 16, y + 35 - hh / 2, 9, hh, 4); src(cr, (255, 90, 120)); cr.fill()
        text(cr, W * 0.14, y + 35, name, 32, (220, 225, 240), 'DejaVu Sans Mono', 'l', False)
    glow(cr, W / 2, H * 0.43, W * 0.6, (120, 160, 255), 0.12)


INSERTS = {k[2:]: v for k, v in globals().items() if k.startswith('i_')}


# ------------------------------------------------------------------ overlays
def overlay(cr, kinds, u, t):
    for k in kinds:
        if k == 'night':
            cr.rectangle(0, 0, W, H); src(cr, (15, 25, 70), 0.45); cr.fill()
        elif k == 'dark':
            cr.rectangle(0, 0, W, H); src(cr, BLACK, 0.45); cr.fill()
        elif k == 'red':
            cr.rectangle(0, 0, W, H); src(cr, (150, 0, 20), 0.25); cr.fill()
        elif k == 'warm':
            cr.rectangle(0, 0, W, H); src(cr, (255, 170, 60), 0.12); cr.fill()
        elif k == 'snow':
            rnd = random.Random(11)
            for _ in range(140):
                x0, y0, sp = rnd.uniform(0, W), rnd.uniform(0, H), rnd.uniform(60, 160)
                x = (x0 + math.sin(t + y0) * 30) % W; y = (y0 + t * sp) % H
                cr.arc(x, y, rnd.uniform(3, 8), 0, 2 * math.pi); src(cr, WHITE, 0.85); cr.fill()
        elif k == 'smoke':
            for i in range(10):
                x = W * (i / 9); y = H * 0.25 + math.sin(t + i) * 60
                glow(cr, x, y, 420, (60, 60, 65), 0.5)
        elif k == 'fire':
            glow(cr, W * 0.5, H * 0.9, H * 0.7, (255, 110, 20), 0.4 + 0.08 * math.sin(t * 13))
        elif k == 'flash':
            cr.rectangle(0, 0, W, H); src(cr, WHITE, max(0, 1 - u * 5) * 0.9); cr.fill()
        elif k == 'bubbles':
            rnd = random.Random(5)
            for _ in range(40):
                x0, y0, sp = rnd.uniform(0, W), rnd.uniform(0, H), rnd.uniform(80, 200)
                y = (y0 - t * sp) % H
                cr.arc(x0 + math.sin(t * 2 + y0) * 15, y, rnd.uniform(6, 16), 0, 2 * math.pi); src(cr, WHITE, 0.45); cr.set_line_width(3); cr.stroke()
        elif k == 'police':
            c = (255, 40, 40) if int(t * 3) % 2 else (40, 80, 255)
            cr.rectangle(0, 0, W, H); src(cr, c, 0.18); cr.fill()
        elif k == 'tv':
            for y in range(0, H, 6):
                cr.rectangle(0, y, W, 2); src(cr, BLACK, 0.18); cr.fill()
    T.vignette(cr, W, H, 0.35)


# ------------------------------------------------------------------ frame
def render(beat, cast, u, t):
    surf = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
    cr = cairo.Context(surf)
    cam = beat.get('cam', {})
    z = kv(cam, 'z', u, [1.0, 1.08])
    fxp, fyp = kv(cam, 'fx', u, 0.5) * W, kv(cam, 'fy', u, 0.5) * H
    shake = cam.get('shake', 0)
    cr.save()
    cr.translate(fxp + (math.sin(t * 37) * shake if shake else 0), fyp + (math.cos(t * 31) * shake if shake else 0))
    cr.scale(z, z); cr.translate(-fxp, -fyp)
    if 'insert' in beat:
        INSERTS[beat['insert']['type']](cr, beat['insert'], u, t)
    else:
        st = beat.get('set', {'type': 'room'})
        SETS[st['type']](cr, st)
        items = []
        for p in beat.get('props', []):
            items.append((p.get('z', p.get('y', GROUND)), 'prop', p))
        for a in beat.get('actors', []):
            items.append((a.get('z', a.get('y', GROUND)), 'actor', a))
        for _, kind, d in sorted(items, key=lambda x: x[0]):
            x, y = kv(d, 'x', u, 0.5) * W, kv(d, 'y', u, GROUND) * H
            if kind == 'prop':
                PROPS[d['type']](cr, x, y, kv(d, 's', u, 1.0), {**d, '_u': ease(u)}, t)
            elif d.get('sleep'):
                sleeper(cr, x, y, d.get('h', 600), cast[d['who']], t, d.get('eyes', 'closed'))
            else:
                look = cast[d['who']]
                mood = d.get('mood', 'neutral')
                if 'mood_at' in d and u >= d['mood_at'][0]: mood = d['mood_at'][1]
                person(cr, x, y, kv(d, 'h', u, look.get('h', 540)), look, t, mood=mood, pose=d.get('pose', 'idle'),
                       facing=d.get('facing', 1), lookdir=tuple(d.get('look', (0, 0))), walk=d.get('walk', 0.0),
                       lean=kv(d, 'lean', u, 0.0), fx=tuple(d.get('fx', ())), alpha=kv(d, 'alpha', u, 1.0),
                       seed=d.get('seed', hash(d['who']) % 7), reach=d.get('reach'), talk=d.get('talk', 0.0))
    cr.restore()
    overlay(cr, beat.get('fx', []), u, t)
    surf.flush()
    buf = np.ndarray((H, surf.get_stride() // 4, 4), np.uint8, buffer=surf.get_data())[:, :W, [2, 1, 0]]
    return Image.fromarray(buf.copy(), 'RGB')
