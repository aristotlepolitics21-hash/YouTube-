"""Cairo cartoon kit: anti-aliased characters with limbs and lip-sync, props, and sets.

All coordinates are design pixels (1920x1080 landscape or 1080x1920 portrait); the engine
scales the context to the output resolution.
"""
import math, random
from functools import lru_cache

import cairo
import numpy as np
from PIL import Image, ImageFilter

FONT = "Inter Display Black"
WHITE, BLACK = (255, 255, 255), (0, 0, 0)
YELLOW, RED, GREEN, BLUE = (255, 214, 0), (235, 45, 60), (45, 200, 95), (45, 135, 255)
GOLD, INK = (255, 190, 30), (25, 20, 35)
PALETTES = {
    "blue": ((70, 175, 255), (12, 50, 160)), "red": ((255, 95, 85), (130, 10, 30)),
    "gold": ((255, 222, 100), (190, 95, 0)), "green": ((95, 230, 125), (8, 95, 45)),
    "purple": ((195, 120, 255), (60, 18, 140)), "dark": ((70, 70, 105), (12, 12, 28)),
}


# ------------------------------------------------------------------ basics
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def lerp(a, b, t): return a + (b - a) * t
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_in(x): x = clamp(x); return x ** 3
def ease_io(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_back(x, s=2.0):
    x = clamp(x) - 1
    return 1 + (s + 1) * x ** 3 + s * x ** 2
def bump(x, a, b):  # 0 -> 1 -> 0 over [a, b]
    if x <= a or x >= b: return 0.0
    return math.sin((x - a) / (b - a) * math.pi)
def mix(c1, c2, t): return tuple(int(lerp(a, b, clamp(t))) for a, b in zip(c1[:3], c2[:3]))
def darker(c, f=0.6): return tuple(int(v * f) for v in c[:3])
def lighter(c, f=0.4): return mix(c, WHITE, f)
def C(c): return tuple(v / 255 for v in c[:3])
def src(cr, c, a=1.0): cr.set_source_rgba(*C(c), a)


def lin(x0, y0, x1, y1, stops):
    g = cairo.LinearGradient(x0, y0, x1, y1)
    for s in stops:
        o, c = s[0], s[1]
        g.add_color_stop_rgba(o, *C(c), s[2] if len(s) > 2 else 1.0)
    return g


def rad(cx, cy, r0, r1, stops, fx=None, fy=None):
    g = cairo.RadialGradient(cx if fx is None else fx, cy if fy is None else fy, r0, cx, cy, r1)
    for s in stops:
        o, c = s[0], s[1]
        g.add_color_stop_rgba(o, *C(c), s[2] if len(s) > 2 else 1.0)
    return g


def ellipse(cr, cx, cy, rx, ry):
    cr.save(); cr.translate(cx, cy); cr.scale(max(rx, 0.01), max(ry, 0.01))
    cr.arc(0, 0, 1, 0, 2 * math.pi); cr.restore()


def rrect(cr, x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    cr.new_sub_path()
    cr.arc(x + w - r, y + r, r, -math.pi / 2, 0); cr.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    cr.arc(x + r, y + h - r, r, math.pi / 2, math.pi); cr.arc(x + r, y + r, r, math.pi, 1.5 * math.pi)
    cr.close_path()


def paint(cr, fill, line=None, lw=0.0, alpha=1.0):
    if isinstance(fill, cairo.Pattern): cr.set_source(fill)
    elif fill is not None: src(cr, fill, alpha)
    if line is not None and lw > 0:
        cr.fill_preserve(); src(cr, line, alpha); cr.set_line_width(lw); cr.stroke()
    else:
        cr.fill()


def soft_shadow(cr, cx, cy, rx, ry, a=0.35):
    cr.save(); cr.translate(cx, cy); cr.scale(rx, max(ry, 0.01))
    cr.set_source(rad(0, 0, 0, 1, [(0, BLACK, a), (0.6, BLACK, a * 0.6), (1, BLACK, 0)]))
    cr.arc(0, 0, 1, 0, 2 * math.pi); cr.fill(); cr.restore()


def glow(cr, cx, cy, r, color, a=0.6):
    cr.set_source(rad(cx, cy, 0, r, [(0, color, a), (0.4, color, a * 0.45), (1, color, 0)]))
    cr.arc(cx, cy, r, 0, 2 * math.pi); cr.fill()


def measure(cr, s, size):
    cr.select_font_face(FONT); cr.set_font_size(size)
    return cr.text_extents(s)


def text(cr, x, y, s, size, fill=WHITE, anchor="mm", stroke=INK, sw=None, scale=1.0, rot=0.0,
         shadow=True, maxw=None, alpha=1.0):
    """Outlined, gradient-filled headline text. Returns drawn width."""
    if not s or scale <= 0.01: return 0
    cr.save()
    ext = measure(cr, s, size)
    if maxw and ext.width * scale > maxw: scale = maxw / ext.width
    cr.translate(x, y); cr.rotate(rot); cr.scale(scale, scale)
    ax = {"l": 0, "m": -ext.width / 2, "r": -ext.width}[anchor[0]] - ext.x_bearing
    ay = {"t": -ext.y_bearing, "m": -ext.y_bearing - ext.height / 2, "b": -ext.y_bearing - ext.height}[anchor[1]]
    sw = sw if sw is not None else size * 0.17
    cr.set_line_join(cairo.LINE_JOIN_ROUND)
    if shadow:
        cr.move_to(ax + size * 0.04, ay + size * 0.07); cr.text_path(s)
        src(cr, BLACK, 0.4 * alpha); cr.set_line_width(sw); cr.stroke_preserve(); cr.fill()
    cr.move_to(ax, ay); cr.text_path(s)
    if stroke is not None:
        src(cr, stroke, alpha); cr.set_line_width(sw); cr.stroke_preserve()
    top = ay + ext.y_bearing
    cr.set_source(lin(0, top, 0, top + ext.height, [(0, lighter(fill, 0.45), alpha), (0.5, fill, alpha), (1, _bottom(fill), alpha)]))
    cr.fill()
    cr.restore()
    return ext.width * scale


def _bottom(c):
    if c[0] > 200 and c[1] > 150 and c[2] < 120: return mix(c, (255, 120, 0), 0.4)  # yellows -> warm orange
    if min(c) > 220: return (215, 225, 240)
    return darker(c, 0.8)


def pill(cr, x, y, s, size, fill=(20, 20, 35), fg=WHITE, alpha=0.75, anchor="m"):
    ext = measure(cr, s, size)
    w, h = ext.width + size * 0.9, size * 1.45
    x0 = {"l": x, "m": x - w / 2, "r": x - w}[anchor]
    rrect(cr, x0, y - h / 2, w, h, h / 2); paint(cr, fill, alpha=alpha)
    text(cr, x0 + w / 2, y, s, size, fg, stroke=None, shadow=False)
    return w


# ------------------------------------------------------------------ character
POSES = ("idle", "wave", "cheer", "point", "present", "hold", "shrug", "flail", "reach", "think")


def _hand_targets(pose, r, t, facing, seed, reach=None):
    """Hand offsets from each shoulder, (left, right). y down."""
    sway = math.sin(t * 2.2 + seed) * r * 0.04
    idle = lambda sx: (sx * r * 0.16, r * 0.62 + sway)
    if pose == "wave":
        return idle(-1), (r * 0.42 + math.sin(t * 11) * r * 0.2, -r * 0.78)
    if pose == "cheer":
        b = math.sin(t * 13) * r * 0.09
        return (-r * 0.42, -r * 0.82 + b), (r * 0.42, -r * 0.82 - b)
    if pose == "point":
        p = (facing * r * 0.98, -r * 0.18 + math.sin(t * 4) * r * 0.03)
        return (p, idle(1)) if facing < 0 else (idle(-1), p)
    if pose == "present":
        return (-r * 0.72, r * 0.12 + sway), (r * 0.72, r * 0.12 - sway)
    if pose == "hold":
        return (r * 0.3, r * 0.42), (-r * 0.3, r * 0.42)
    if pose == "shrug":
        return (-r * 0.5, -r * 0.32), (r * 0.5, -r * 0.32)
    if pose == "flail":
        return ((-r * 0.6 * abs(math.cos(t * 15)) - r * 0.2, -r * 0.4 + r * 0.45 * math.sin(t * 17)),
                (r * 0.6 * abs(math.cos(t * 14 + 1)) + r * 0.2, -r * 0.4 + r * 0.45 * math.sin(t * 16 + 2)))
    if pose == "reach":
        k = reach if reach is not None else 1.0
        p = (facing * r * lerp(0.3, 1.25, k), lerp(r * 0.5, -r * 0.05, k))
        return (p, idle(1)) if facing < 0 else (idle(-1), p)
    if pose == "think":
        return idle(-1), (-r * 0.55, -r * 0.05)
    return idle(-1), idle(1)


def _face(cr, r, color, mood, t, seed, talk, look, facing, blink_on=True):
    out = darker(color, 0.4)
    fx = look[0] * r * 0.1 + facing * r * 0.05
    fy = look[1] * r * 0.06
    ex, ey = r * 0.34, -r * 0.2 + fy
    erx, ery = r * 0.2, r * 0.25
    if mood == "shock": erx, ery = erx * 1.12, ery * 1.18
    # blink: closure 0..1
    ph = (t * 0.55 + seed * 0.37) % 3.3
    close = bump(ph, 0, 0.16) if blink_on else 0.0
    lid = {"smug": 0.4, "tired": 0.5, "angry": 0.25, "chew": 0.55, "gross": 0.35}.get(mood, 0.0)
    close = max(close, lid)
    if mood == "laugh": close = 1.0
    for sx in (-1, 1):
        cx = fx + sx * ex
        # sclera
        ellipse(cr, cx, ey, erx, ery)
        cr.set_source(rad(cx, ey, 0, ery * 1.1, [(0, WHITE), (0.75, (245, 245, 250)), (1, (205, 210, 225))], fx=cx - erx * 0.3, fy=ey - ery * 0.4))
        cr.fill_preserve(); src(cr, out); cr.set_line_width(r * 0.032); cr.stroke()
        if close < 0.98:
            cr.save(); ellipse(cr, cx, ey, erx * 0.97, ery * 0.97); cr.clip()
            ir = erx * (0.46 if mood == "shock" else 0.62)
            px, py = cx + look[0] * erx * 0.42, ey + look[1] * ery * 0.35 + ery * 0.05
            if mood == "gross": px += sx * erx * 0.3
            cr.arc(px, py, ir, 0, 2 * math.pi)
            cr.set_source(rad(px, py, 0, ir, [(0, (90, 60, 45)), (0.55, (45, 30, 25)), (1, (15, 10, 10))])); cr.fill()
            cr.arc(px, py, ir * 0.5, 0, 2 * math.pi); src(cr, (8, 5, 5)); cr.fill()
            cr.arc(px - ir * 0.35, py - ir * 0.4, ir * 0.3, 0, 2 * math.pi); src(cr, WHITE, 0.95); cr.fill()
            cr.arc(px + ir * 0.35, py + ir * 0.3, ir * 0.13, 0, 2 * math.pi); src(cr, WHITE, 0.8); cr.fill()
            if close > 0:
                yl = ey - ery + 2 * ery * close
                tilt = (sx * ery * 0.5) if mood == "angry" else 0
                cr.move_to(cx - erx * 1.2, ey - ery * 1.2)
                cr.line_to(cx + erx * 1.2, ey - ery * 1.2)
                cr.line_to(cx + erx * 1.2, yl - tilt); cr.line_to(cx - erx * 1.2, yl + tilt); cr.close_path()
                src(cr, darker(color, 0.92)); cr.fill_preserve()
                cr.new_path(); cr.move_to(cx - erx * 1.2, yl + tilt); cr.line_to(cx + erx * 1.2, yl - tilt)
                src(cr, out); cr.set_line_width(r * 0.035); cr.stroke()
            cr.restore()
        else:  # closed / laughing eye: arc
            cr.new_path()
            if mood == "laugh": cr.arc(cx, ey + ery * 0.3, erx * 0.8, math.pi * 1.1, math.pi * 1.9)
            else: cr.arc_negative(cx, ey - ery * 0.2, erx * 0.8, math.pi * 0.9, math.pi * 0.1)
            src(cr, out); cr.set_line_width(r * 0.05); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.stroke()
    # brows
    by = ey - ery - r * 0.1
    inner, outer = {"happy": (-0.03, -0.05), "shock": (-0.16, -0.12), "sad": (-0.1, 0.04), "nervous": (-0.09, 0.03),
                    "angry": (0.08, -0.06), "gross": (0.05, -0.04), "smug": (0.0, -0.08), "laugh": (-0.06, -0.06),
                    "think": (0.02, -0.1), "chew": (-0.02, -0.04)}.get(mood, (-0.02, -0.03))
    if mood == "think": inner, outer = (0.0, -0.02)
    for sx in (-1, 1):
        cx = fx + sx * ex
        i_dy, o_dy = inner * r, outer * r
        if mood == "think" and sx > 0: i_dy, o_dy = -0.1 * r, -0.14 * r
        cr.move_to(cx + -sx * erx * 0.15, by + i_dy)
        cr.curve_to(cx + sx * erx * 0.3, by + i_dy - r * 0.05, cx + sx * erx * 0.8, by + o_dy - r * 0.04, cx + sx * erx * 1.1, by + o_dy)
        src(cr, darker(color, 0.32)); cr.set_line_width(r * 0.075); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.stroke()
    # cheeks
    if mood in ("happy", "laugh", "smug", "love"):
        for sx in (-1, 1):
            cr.save(); ellipse(cr, fx + sx * r * 0.56, r * 0.12, r * 0.15, r * 0.09)
            cr.set_source(rad(fx + sx * r * 0.56, r * 0.12, 0, r * 0.15, [(0, (255, 110, 140), 0.45), (1, (255, 110, 140), 0)])); cr.fill(); cr.restore()
    # mouth
    mx, my, w = fx, r * 0.33, r * 0.44
    openness = talk
    if mood == "shock": openness = max(openness, 0.55 + 0.1 * math.sin(t * 8))
    if mood == "laugh": openness = max(openness, 0.6 + 0.25 * abs(math.sin(t * 14)))
    if mood == "chomp": openness = 1.0
    cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_join(cairo.LINE_JOIN_ROUND)
    if mood == "chew":
        cr.move_to(mx - w * 0.35, my); cr.curve_to(mx - w * 0.1, my - r * 0.06 * math.sin(t * 18), mx + w * 0.1, my + r * 0.06, mx + w * 0.35, my)
        src(cr, out); cr.set_line_width(r * 0.05); cr.stroke(); return
    if openness > 0.08:
        h = r * (0.05 + 0.34 * openness)
        ww = w * (0.55 if mood in ("shock", "chomp") else 0.95) * (1 - 0.15 * openness)
        cr.new_path()
        if mood in ("happy", "laugh", "smug", "present"):
            cr.move_to(mx - ww / 2, my - h * 0.15)
            cr.curve_to(mx - ww / 4, my - h * 0.3, mx + ww / 4, my - h * 0.3, mx + ww / 2, my - h * 0.15)
            cr.curve_to(mx + ww / 2, my + h * 0.9, mx - ww / 2, my + h * 0.9, mx - ww / 2, my - h * 0.15)
        elif mood in ("sad", "gross", "nervous"):
            cr.move_to(mx - ww / 2, my + h * 0.5)
            cr.curve_to(mx - ww / 3, my - h * 0.6, mx + ww / 3, my - h * 0.6, mx + ww / 2, my + h * 0.5)
            cr.curve_to(mx + ww / 3, my + h * 0.75, mx - ww / 3, my + h * 0.75, mx - ww / 2, my + h * 0.5)
        else:
            ellipse(cr, mx, my + h * 0.2, ww / 2, h * 0.6)
        cr.close_path()
        path = cr.copy_path()
        cr.set_source(lin(0, my - h, 0, my + h, [(0, (70, 8, 20)), (1, (140, 25, 45))])); cr.fill()
        cr.save(); cr.append_path(path); cr.clip()
        ellipse(cr, mx, my + h * 0.75, ww * 0.32, h * 0.38); src(cr, (240, 100, 120)); cr.fill()
        if openness > 0.3 and mood not in ("sad", "gross"):
            cr.rectangle(mx - ww, my - h * 0.5, ww * 2, h * 0.32); src(cr, WHITE); cr.fill()
        cr.restore()
        cr.append_path(path); src(cr, out); cr.set_line_width(r * 0.045); cr.stroke()
        return
    cr.new_path()
    if mood in ("happy", "smug", "love", "present", "laugh"):
        lift = r * (0.16 if mood != "smug" else 0.08)
        cr.move_to(mx - w / 2, my - r * 0.02)
        cr.curve_to(mx - w / 4, my + lift, mx + w / 4, my + lift, mx + w / 2, my - (r * 0.08 if mood == "smug" else r * 0.02))
    elif mood in ("sad", "gross", "angry"):
        cr.move_to(mx - w * 0.4, my + r * 0.08)
        cr.curve_to(mx - w / 5, my - r * 0.06, mx + w / 5, my - r * 0.06, mx + w * 0.4, my + r * 0.08)
    elif mood == "nervous":
        n = 6
        cr.move_to(mx - w * 0.45, my)
        for i in range(1, n + 1):
            cr.line_to(mx - w * 0.45 + i * w * 0.9 / n, my + (r * 0.04 if i % 2 else -r * 0.04))
    elif mood == "think":
        cr.move_to(mx - w * 0.25, my + r * 0.03); cr.line_to(mx + w * 0.3, my - r * 0.02)
    else:
        cr.move_to(mx - w * 0.3, my + r * 0.02); cr.curve_to(mx - w * 0.1, my + r * 0.05, mx + w * 0.1, my + r * 0.05, mx + w * 0.3, my + r * 0.02)
    src(cr, out); cr.set_line_width(r * 0.055); cr.stroke()


def _crown(cr, cx, top, w):
    pts = [(-1, 0), (-1, -0.75), (-0.5, -0.3), (0, -1.0), (0.5, -0.3), (1, -0.75), (1, 0)]
    cr.move_to(cx + pts[0][0] * w, top)
    for px, py in pts[1:]: cr.line_to(cx + px * w, top + py * w)
    cr.close_path()
    cr.set_source(lin(0, top - w, 0, top, [(0, (255, 245, 150)), (0.5, GOLD), (1, (200, 120, 0))]))
    cr.fill_preserve(); src(cr, (120, 70, 0)); cr.set_line_width(w * 0.08); cr.set_line_join(cairo.LINE_JOIN_ROUND); cr.stroke()
    for gx, col in ((-0.5, RED), (0, (60, 200, 255)), (0.5, GREEN)):
        cr.arc(cx + gx * w, top - w * 0.18, w * 0.12, 0, 2 * math.pi); src(cr, col); cr.fill_preserve()
        src(cr, (120, 70, 0)); cr.set_line_width(w * 0.04); cr.stroke()
    for px, py in pts[1:-1:2] + [pts[3]]:
        cr.arc(cx + px * w, top + py * w, w * 0.09, 0, 2 * math.pi); src(cr, (255, 250, 200)); cr.fill()


def _chef_hat(cr, cx, top, w):
    rrect(cr, cx - w * 0.6, top - w * 0.45, w * 1.2, w * 0.5, w * 0.1); paint(cr, (250, 250, 250), (150, 150, 165), w * 0.06)
    for dx, dy, rr in ((-0.45, -0.75, 0.42), (0.45, -0.75, 0.42), (0, -1.0, 0.5)):
        cr.arc(cx + dx * w, top + dy * w, rr * w, 0, 2 * math.pi)
        cr.set_source(rad(cx + dx * w, top + dy * w, 0, rr * w, [(0, WHITE), (1, (225, 225, 235))])); cr.fill_preserve()
        src(cr, (150, 150, 165)); cr.set_line_width(w * 0.06); cr.stroke()


def toon(cr, x, gy, h, color, t, mood="happy", pose="idle", talk=0.0, look=(0, 0), facing=1, walk=0.0,
         lift=0.0, lean=0.0, squash=None, seed=0, hat=None, fx=(), reach=None, alpha=1.0, badge=None):
    """Draw a character standing at (x, gy) with total height h."""
    color = tuple(color)
    r = h / 2.6
    out = darker(color, 0.4)
    phase = t * walk * 2 * math.pi
    if walk: lift += abs(math.sin(phase)) * r * 0.08
    if squash is None: squash = 0.03 * math.sin(t * 3.1 + seed)
    k = clamp(1 - lift / (h * 0.9), 0.2, 1)
    soft_shadow(cr, x, gy, r * 1.05 * k, r * 0.24 * k, 0.38 * k)
    if alpha < 1: cr.push_group()
    cr.save(); cr.translate(x, gy - lift); cr.rotate(lean)
    by = -r * 0.5 - r * 1.0
    leg_len = r * 0.75
    cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for sx in (-1, 1):
        hx, hy = sx * r * 0.36, by + r * 0.75
        if walk: a = 0.6 * math.sin(phase + (0 if sx < 0 else math.pi))
        elif lift > r * 0.25: a = sx * 0.45 + 0.1 * math.sin(t * 12 + sx)
        else: a = 0.0
        fxp, fyp = hx + math.sin(a) * leg_len, hy + math.cos(a) * leg_len
        cr.move_to(hx, hy); cr.line_to(fxp, fyp)
        src(cr, out); cr.set_line_width(r * 0.22); cr.stroke_preserve()
        src(cr, darker(color, 0.8)); cr.set_line_width(r * 0.13); cr.stroke()
        sxp = fxp + facing * r * 0.07
        ellipse(cr, sxp, fyp - r * 0.06, r * 0.21, r * 0.12)
        cr.set_source(lin(0, fyp - r * 0.18, 0, fyp + r * 0.06, [(0, (80, 80, 100)), (1, (25, 25, 35))])); cr.fill()
        cr.rectangle(sxp - r * 0.21, fyp - r * 0.02, r * 0.42, r * 0.05); src(cr, (235, 235, 240)); cr.fill()
    # body (squash about its base)
    cr.save(); cr.translate(0, by + r * 1.0); cr.scale(1 + squash, 1 - squash); cr.translate(0, -r * 1.0)
    ellipse(cr, 0, 0, r, r * 1.05)
    path = cr.copy_path()
    cr.set_source(rad(0, 0, r * 0.05, r * 1.35, [(0, lighter(color, 0.5)), (0.42, color), (1, darker(color, 0.62))], fx=-r * 0.35, fy=-r * 0.5))
    cr.fill()
    cr.save(); cr.append_path(path); cr.clip()
    ellipse(cr, 0, r * 0.55, r * 0.62, r * 0.42); src(cr, lighter(color, 0.3), 0.45); cr.fill()
    ellipse(cr, -r * 0.38, -r * 0.6, r * 0.28, r * 0.16); src(cr, WHITE, 0.35); cr.fill()
    cr.arc(r * 0.15, r * 0.1, r * 1.0, -0.2, 1.3); src(cr, lighter(color, 0.6), 0.25); cr.set_line_width(r * 0.06); cr.stroke()
    cr.restore()
    cr.append_path(path); src(cr, out); cr.set_line_width(r * 0.06); cr.stroke()
    _face(cr, r, color, mood, t, seed, talk, look, facing)
    if badge:  # name-tag sticker on the belly
        size = r * 0.25
        ext = measure(cr, badge, size)
        bw, bh = ext.width + size * 0.9, size * 1.5
        cr.save(); cr.translate(0, r * 0.74); cr.rotate(math.sin(seed * 1.7) * 0.08)
        rrect(cr, -bw / 2, -bh / 2, bw, bh, size * 0.3); paint(cr, WHITE, out, r * 0.03)
        rrect(cr, -bw / 2, -bh / 2, bw, size * 0.32, size * 0.15); src(cr, RED); cr.fill()
        text(cr, 0, size * 0.12, badge, size, INK, stroke=None, shadow=False)
        cr.restore()
    # arms
    lh, rh = _hand_targets(pose, r, t, facing, seed, reach)
    for sx, (hx, hy) in ((-1, lh), (1, rh)):
        shx, shy = sx * r * 0.86, r * 0.08
        ex, ey = shx + hx, shy + hy
        mx, my = (shx + ex) / 2, (shy + ey) / 2
        dx, dy = ex - shx, ey - shy
        ln = math.hypot(dx, dy) or 1
        bend = sx * r * 0.18
        cx_, cy_ = mx + dy / ln * bend, my - dx / ln * bend
        cr.move_to(shx, shy); cr.curve_to(cx_, cy_, cx_, cy_, ex, ey)
        p = cr.copy_path()
        src(cr, out); cr.set_line_width(r * 0.19); cr.stroke()
        cr.append_path(p); src(cr, darker(color, 0.92)); cr.set_line_width(r * 0.115); cr.stroke()
        cr.arc(ex, ey, r * 0.135, 0, 2 * math.pi)
        cr.set_source(rad(ex, ey, 0, r * 0.14, [(0, WHITE), (1, (215, 215, 228))], fx=ex - r * 0.05, fy=ey - r * 0.05))
        cr.fill_preserve(); src(cr, out); cr.set_line_width(r * 0.035); cr.stroke()
    if hat == "crown": _crown(cr, 0, -r * 0.92, r * 0.55)
    elif hat == "chef": _chef_hat(cr, 0, -r * 0.88, r * 0.55)
    cr.restore()
    # effects in body space
    cx, cy = 0, by
    if "sweat" in fx:
        k2 = (t * 0.8 + seed * 0.3) % 1.0
        sx_, sy_ = r * 0.85, by - r * 0.5 + k2 * r * 0.5
        cr.move_to(sx_, sy_ - r * 0.18)
        cr.curve_to(sx_ + r * 0.12, sy_, sx_ + r * 0.1, sy_ + r * 0.1, sx_, sy_ + r * 0.1)
        cr.curve_to(sx_ - r * 0.1, sy_ + r * 0.1, sx_ - r * 0.12, sy_, sx_, sy_ - r * 0.18)
        cr.set_source(lin(0, sy_ - r * 0.18, 0, sy_ + r * 0.1, [(0, (200, 240, 255)), (1, (80, 170, 255))]))
        cr.fill_preserve(); src(cr, (30, 90, 170)); cr.set_line_width(r * 0.025); cr.stroke()
    if "stink" in fx:
        for i in range(3):
            ox = (i - 1) * r * 0.45
            ph = t * 2 + i
            cr.move_to(ox, by - r * 1.2)
            for j in range(1, 7):
                cr.line_to(ox + math.sin(ph + j) * r * 0.1, by - r * 1.2 - j * r * 0.1)
            src(cr, (120, 190, 60), 0.85); cr.set_line_width(r * 0.05); cr.stroke()
    if "stars" in fx:
        for i in range(5):
            a = t * 2.5 + i * 2 * math.pi / 5
            star(cr, math.cos(a) * r * 1.25, by - r * 1.15 + math.sin(a) * r * 0.25, r * 0.13, YELLOW)
    if "hearts" in fx:
        for i in range(3):
            k2 = (t * 0.7 + i / 3) % 1
            heart(cr, (i - 1) * r * 0.6, by - r * 1.1 - k2 * r * 0.8, r * 0.14 * (1 - k2 * 0.3), (255, 70, 110), 1 - k2)
    cr.restore()
    if alpha < 1:
        cr.pop_group_to_source(); cr.paint_with_alpha(alpha)


def star(cr, cx, cy, r, color=YELLOW, fill_k=1.0, line=INK):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    def path():
        cr.move_to(*pts[0])
        for p in pts[1:]: cr.line_to(*p)
        cr.close_path()
    path(); src(cr, (40, 40, 55), 0.6); cr.fill()
    if fill_k > 0:
        cr.save(); cr.rectangle(cx - r, cy - r, 2 * r * fill_k, 2 * r); cr.clip()
        path(); cr.set_source(lin(0, cy - r, 0, cy + r, [(0, lighter(color, 0.5)), (1, darker(color, 0.85))])); cr.fill()
        cr.restore()
    path(); src(cr, line); cr.set_line_width(r * 0.12); cr.set_line_join(cairo.LINE_JOIN_ROUND); cr.stroke()


def heart(cr, cx, cy, s, color, a=1.0):
    cr.move_to(cx, cy + s)
    cr.curve_to(cx - s * 1.6, cy - s * 0.2, cx - s * 0.6, cy - s * 1.4, cx, cy - s * 0.5)
    cr.curve_to(cx + s * 0.6, cy - s * 1.4, cx + s * 1.6, cy - s * 0.2, cx, cy + s)
    src(cr, color, a); cr.fill()


def sparkle(cr, cx, cy, r, color=WHITE, a=1.0):
    glow(cr, cx, cy, r * 1.6, color, 0.5 * a)
    cr.move_to(cx, cy - r)
    for px, py in ((0.18, -0.18), (1, 0), (0.18, 0.18), (0, 1), (-0.18, 0.18), (-1, 0), (-0.18, -0.18)):
        cr.line_to(cx + px * r, cy + py * r)
    cr.close_path(); src(cr, color, a); cr.fill()


# ------------------------------------------------------------------ props
def plate(cr, cx, cy, rx, gold=False):
    ry = rx * 0.32
    soft_shadow(cr, cx, cy + ry * 0.35, rx * 1.08, ry * 1.1, 0.35)
    base = (255, 205, 70) if gold else (250, 250, 252)
    ellipse(cr, cx, cy, rx, ry)
    cr.set_source(rad(cx, cy, rx * 0.2, rx, [(0, darker(base, 0.93)), (0.75, base), (1, darker(base, 0.8))]))
    cr.fill_preserve(); src(cr, darker(base, 0.55)); cr.set_line_width(rx * 0.015); cr.stroke()
    ellipse(cr, cx, cy - ry * 0.05, rx * 0.72, ry * 0.68); src(cr, darker(base, 0.9), 0.6); cr.set_line_width(rx * 0.012); cr.stroke()


def _bites(cr, bites):
    if not bites: return
    cr.set_operator(cairo.OPERATOR_CLEAR)
    for bx, by, br in bites:
        for dx, dy, k in ((0, 0, 1), (br * 0.7, -br * 0.55, 0.75), (br * 0.65, br * 0.6, 0.72)):
            cr.arc(bx + dx, by + dy, br * k, 0, 2 * math.pi); cr.fill()
    cr.set_operator(cairo.OPERATOR_OVER)


def pizza(cr, cx, cy, R, level, t, bites=()):
    """Perspective pizza; level 0 sad slice ... 5 gold leaf. cy = centre on plate."""
    if level == 0:
        plate(cr, cx, cy + R * 0.15, R * 0.75)
    else:
        plate(cr, cx, cy + R * 0.08, R * 1.18, gold=level >= 5)
    cr.push_group()
    ry = R * 0.56
    if level == 0:
        tip, l, rgt = (cx - R * 0.05, cy + R * 0.25), (cx - R * 0.5, cy - R * 0.28), (cx + R * 0.45, cy - R * 0.3)
        cr.move_to(*tip); cr.line_to(*l); cr.line_to(*rgt); cr.close_path()
        cr.set_source(lin(0, cy - R * 0.3, 0, cy + R * 0.25, [(0, (230, 200, 130)), (1, (200, 165, 95))]))
        cr.fill_preserve(); src(cr, (90, 60, 30)); cr.set_line_width(R * 0.025); cr.set_line_join(cairo.LINE_JOIN_ROUND); cr.stroke()
        cr.move_to(l[0] - R * 0.04, l[1]); cr.curve_to(cx, cy - R * 0.42, cx, cy - R * 0.42, rgt[0] + R * 0.04, rgt[1])
        src(cr, (95, 55, 25)); cr.set_line_width(R * 0.1); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.stroke()
        rnd = random.Random(0)
        for _ in range(6):
            px, py = cx + rnd.uniform(-0.3, 0.25) * R, cy + rnd.uniform(-0.2, 0.05) * R
            ellipse(cr, px, py, R * 0.05, R * 0.03); src(cr, (70, 45, 25), 0.7); cr.fill()
        ellipse(cr, cx - R * 0.05, cy - R * 0.12, R * 0.07, R * 0.045); src(cr, (150, 70, 60)); cr.fill()
        cr.pop_group_to_source(); cr.paint()
        return
    gold = level >= 5
    crust = (255, 200, 60) if gold else mix((205, 140, 70), (220, 150, 65), level / 4)
    cheese = (255, 225, 110) if gold else mix((250, 215, 120), (255, 200, 80), level / 4)
    ellipse(cr, cx, cy, R, ry)
    cr.set_source(rad(cx, cy - ry * 0.3, R * 0.6, R * 1.05, [(0, lighter(crust, 0.3)), (0.8, crust), (1, darker(crust, 0.7))]))
    cr.fill_preserve(); src(cr, darker(crust, 0.45)); cr.set_line_width(R * 0.018); cr.stroke()
    # crust bubbles
    rnd = random.Random(level * 11)
    for i in range(18):
        a = i / 18 * 2 * math.pi + rnd.uniform(-0.1, 0.1)
        ellipse(cr, cx + math.cos(a) * R * 0.93, cy + math.sin(a) * ry * 0.92, R * 0.05, ry * 0.04)
        src(cr, darker(crust, 0.8) if not gold else (255, 240, 170), 0.6); cr.fill()
    ellipse(cr, cx, cy, R * 0.86, ry * 0.84); src(cr, (190, 50, 30) if not gold else (230, 150, 20)); cr.fill()
    ellipse(cr, cx, cy, R * 0.82, ry * 0.8)
    cr.set_source(rad(cx, cy - ry * 0.2, R * 0.1, R * 0.85, [(0, lighter(cheese, 0.45)), (0.7, cheese), (1, darker(cheese, 0.88))]))
    cr.fill()
    for i in range(14):  # melted / browned spots
        a, rr = rnd.random() * 2 * math.pi, math.sqrt(rnd.random()) * 0.7
        ellipse(cr, cx + R * rr * math.cos(a), cy + ry * rr * math.sin(a), R * 0.07, ry * 0.05)
        src(cr, (255, 245, 200) if i % 2 else darker(cheese, 0.8), 0.5); cr.fill()
    for i in range(4):  # cut lines
        a = i * math.pi / 4
        cr.move_to(cx - math.cos(a) * R * 0.82, cy - math.sin(a) * ry * 0.8); cr.line_to(cx + math.cos(a) * R * 0.82, cy + math.sin(a) * ry * 0.8)
        src(cr, darker(cheese, 0.7), 0.35); cr.set_line_width(R * 0.01); cr.stroke()
    def spots(n, seed):
        rr_ = random.Random(seed)
        for _ in range(n):
            a, rr = rr_.random() * 2 * math.pi, math.sqrt(rr_.random()) * 0.66
            yield cx + R * rr * math.cos(a), cy + ry * rr * math.sin(a), rr_
    if level >= 2 and not gold:
        for px, py, _ in spots(9 + level * 2, 5):
            pr = R * 0.085
            ellipse(cr, px, py + pr * 0.12, pr, pr * 0.58); src(cr, (120, 20, 20)); cr.fill()
            ellipse(cr, px, py, pr, pr * 0.56)
            cr.set_source(rad(px, py, 0, pr, [(0, (225, 70, 55)), (0.8, (190, 40, 35)), (1, (140, 25, 25))], fx=px - pr * 0.3, fy=py - pr * 0.2)); cr.fill()
            ellipse(cr, px - pr * 0.3, py - pr * 0.18, pr * 0.25, pr * 0.1); src(cr, WHITE, 0.5); cr.fill()
    if level >= 3 and not gold:
        for px, py, rr_ in spots(7, 9):  # basil leaves
            cr.save(); cr.translate(px, py); cr.rotate(rr_.uniform(0, 3)); cr.scale(1, 0.55)
            cr.move_to(-R * 0.08, 0); cr.curve_to(-R * 0.03, -R * 0.06, R * 0.04, -R * 0.06, R * 0.09, 0)
            cr.curve_to(R * 0.04, R * 0.06, -R * 0.03, R * 0.06, -R * 0.08, 0)
            cr.restore(); src(cr, (40, 140, 50)); cr.fill()
        for px, py, _ in spots(8, 13):  # olives
            ellipse(cr, px, py, R * 0.04, R * 0.025); src(cr, (30, 30, 30)); cr.fill()
            ellipse(cr, px, py, R * 0.015, R * 0.01); src(cr, (60, 30, 30)); cr.fill()
    if level == 4:
        for px, py, rr_ in spots(14, 21):  # truffle shavings
            cr.save(); cr.translate(px, py); cr.rotate(rr_.uniform(0, 3))
            ellipse(cr, 0, 0, R * 0.06, R * 0.03); src(cr, (90, 65, 45)); cr.fill_preserve()
            src(cr, (60, 40, 25)); cr.set_line_width(R * 0.006); cr.stroke(); cr.restore()
        ellipse(cr, cx, cy, R * 0.2, ry * 0.18)
        cr.set_source(rad(cx, cy, 0, R * 0.2, [(0, WHITE), (1, (235, 235, 225))])); cr.fill()
    if gold:
        for px, py, rr_ in spots(22, 33):  # gold leaf flakes
            cr.save(); cr.translate(px, py); cr.rotate(rr_.uniform(0, 6))
            s = R * rr_.uniform(0.05, 0.1)
            cr.move_to(-s, 0); cr.line_to(-s * 0.2, -s * 0.7); cr.line_to(s, -s * 0.2); cr.line_to(s * 0.4, s * 0.6); cr.close_path()
            cr.set_source(lin(-s, -s, s, s, [(0, (255, 250, 200)), (0.5, (255, 200, 40)), (1, (200, 130, 0))])); cr.fill()
            cr.restore()
        for px, py, _ in spots(14, 41):  # caviar
            for j in range(4):
                cr.arc(px + j * R * 0.015, py + (j % 2) * R * 0.01, R * 0.012, 0, 2 * math.pi)
            src(cr, (20, 20, 30)); cr.fill()
    _bites(cr, bites)
    cr.pop_group_to_source(); cr.paint()
    if level >= 4:
        for i in range(6):
            a = t * 1.3 + i * math.pi / 3
            sparkle(cr, cx + math.cos(a) * R * 0.95, cy - ry * 0.2 + math.sin(a) * ry * 0.9,
                    R * (0.06 + 0.03 * math.sin(t * 7 + i)), (255, 250, 220))


def burger(cr, cx, cy, R, level, t, bites=()):
    """Side-view burger centred near (cx, cy)."""
    gold = level >= 5
    plate(cr, cx, cy + R * 0.62, R * 1.15, gold=gold)
    cr.push_group()
    w = R * (0.68 if level == 0 else 0.95)
    bun = (255, 200, 50) if gold else ((205, 175, 120) if level == 0 else (225, 150, 60))
    layers = [("bottom", 0.2)]
    patties = {0: 1, 1: 1, 2: 1, 3: 2, 4: 3, 5: 3}[level]
    for i in range(patties):
        layers += [("patty", 0.2 if level else 0.12), ("cheese", 0.05)]
        if level >= 2: layers += [("lettuce", 0.06)]
        if level >= 3 and i == 0: layers += [("tomato", 0.07)]
    if level == 0: layers = [("bottom", 0.16), ("patty", 0.1)]
    total = sum(h for _, h in layers) + 0.45
    sc = min(1.0, 1.55 / total)
    y = cy + R * 0.55
    def H(v): return v * R * sc
    for kind, hh in layers:
        h = H(hh)
        if kind == "bottom":
            rrect(cr, cx - w, y - h, w * 2, h, h * 0.45)
            cr.set_source(lin(0, y - h, 0, y, [(0, lighter(bun, 0.2)), (1, darker(bun, 0.75))])); cr.fill_preserve()
            src(cr, darker(bun, 0.45)); cr.set_line_width(R * 0.015); cr.stroke()
        elif kind == "patty":
            col = (230, 160, 30) if gold else (95, 55, 32)
            cr.move_to(cx - w * 1.03, y - h * 0.5)
            for i in range(13):
                xx = cx - w * 1.03 + i * w * 2.06 / 12
                cr.line_to(xx, y - h - (R * 0.012 if i % 2 else 0))
            cr.line_to(cx + w * 1.03, y); cr.line_to(cx - w * 1.03, y); cr.close_path()
            cr.set_source(lin(0, y - h, 0, y, [(0, lighter(col, 0.15)), (1, darker(col, 0.6))])); cr.fill_preserve()
            src(cr, darker(col, 0.4)); cr.set_line_width(R * 0.012); cr.stroke()
            for i in range(5):
                xx = cx - w * 0.7 + i * w * 0.35
                cr.move_to(xx, y - h * 0.8); cr.line_to(xx + w * 0.12, y - h * 0.25)
                src(cr, darker(col, 0.45), 0.7); cr.set_line_width(R * 0.018); cr.stroke()
        elif kind == "cheese":
            col = (255, 195, 30)
            cr.move_to(cx - w * 1.05, y - h)
            cr.line_to(cx + w * 1.05, y - h); cr.line_to(cx + w * 1.0, y + h * 0.6)
            for dxk, dyk in ((0.6, 0.6), (0.45, 2.6), (0.3, 0.6), (-0.2, 0.6), (-0.35, 2.0), (-0.5, 0.6)):
                cr.line_to(cx + w * dxk, y + h * dyk)
            cr.line_to(cx - w * 1.0, y + h * 0.4); cr.close_path()
            cr.set_source(lin(0, y - h, 0, y + h * 2, [(0, (255, 225, 90)), (1, col)])); cr.fill_preserve()
            src(cr, (200, 130, 0)); cr.set_line_width(R * 0.01); cr.stroke()
        elif kind == "lettuce":
            cr.move_to(cx - w * 1.1, y)
            for i in range(17):
                xx = cx - w * 1.1 + i * w * 2.2 / 16
                cr.line_to(xx, y - h * (1.6 if i % 2 else 0.2))
            cr.line_to(cx + w * 1.1, y + h * 0.3); cr.line_to(cx - w * 1.1, y + h * 0.3); cr.close_path()
            src(cr, (85, 185, 60)); cr.fill_preserve(); src(cr, (40, 110, 30)); cr.set_line_width(R * 0.01); cr.stroke()
        elif kind == "tomato":
            rrect(cr, cx - w * 0.95, y - h, w * 1.9, h, h * 0.4)
            cr.set_source(lin(0, y - h, 0, y, [(0, (250, 90, 70)), (1, (180, 30, 30))])); cr.fill()
        y -= h * 0.92
    h = H(0.45)
    cr.move_to(cx - w * 1.02, y)
    cr.curve_to(cx - w * 1.02, y - h * 1.35, cx + w * 1.02, y - h * 1.35, cx + w * 1.02, y)
    cr.close_path()
    cr.set_source(rad(cx - w * 0.3, y - h * 0.8, w * 0.05, w * 1.3, [(0, lighter(bun, 0.5)), (0.5, bun), (1, darker(bun, 0.7))]))
    cr.fill_preserve(); src(cr, darker(bun, 0.45)); cr.set_line_width(R * 0.015); cr.stroke()
    rnd = random.Random(4)
    for _ in range(14):
        sx = cx + rnd.uniform(-0.75, 0.75) * w
        sy = y - h * (0.95 - abs(sx - cx) / w * 0.55) * rnd.uniform(0.7, 1.0)
        cr.save(); cr.translate(sx, sy); cr.rotate(rnd.uniform(-0.6, 0.6))
        ellipse(cr, 0, 0, R * 0.03, R * 0.014); src(cr, (255, 245, 215)); cr.fill(); cr.restore()
    _bites(cr, bites)
    cr.pop_group_to_source(); cr.paint()
    if level >= 4:
        for i in range(6):
            a = t * 1.3 + i * math.pi / 3
            sparkle(cr, cx + math.cos(a) * R * 1.1, cy + math.sin(a) * R * 0.7, R * (0.06 + 0.03 * math.sin(t * 7 + i)), (255, 250, 220))


ITEMS = {"pizza": pizza, "burger": burger}


def bill(cr, x, y, w, rot=0.0, flip=1.0):
    h = w * 0.46
    cr.save(); cr.translate(x, y); cr.rotate(rot); cr.scale(max(0.05, abs(flip)), 1)
    rrect(cr, -w / 2, -h / 2, w, h, w * 0.05)
    shade = 0.75 + 0.25 * abs(flip)
    cr.set_source(lin(0, -h / 2, 0, h / 2, [(0, darker((150, 215, 140), shade)), (1, darker((90, 170, 95), shade))]))
    cr.fill_preserve(); src(cr, (30, 95, 45)); cr.set_line_width(w * 0.03); cr.stroke()
    rrect(cr, -w * 0.42, -h * 0.36, w * 0.84, h * 0.72, w * 0.03); src(cr, (40, 120, 55), 0.7); cr.set_line_width(w * 0.015); cr.stroke()
    ellipse(cr, 0, 0, h * 0.3, h * 0.3); src(cr, (70, 150, 80)); cr.fill()
    if flip > 0:
        cr.select_font_face(FONT); cr.set_font_size(h * 0.45)
        e = cr.text_extents("$"); cr.move_to(-e.width / 2 - e.x_bearing, -e.y_bearing - e.height / 2)
        src(cr, (225, 255, 225)); cr.show_text("$")
    cr.restore()


def money_rain(cr, W, H, t, n=24, seed=1, speed=1.0, size=150):
    rnd = random.Random(seed)
    for i in range(n):
        x0, ph, sp = rnd.random(), rnd.random(), rnd.uniform(0.6, 1.2) * speed
        rot0, spin = rnd.uniform(0, 6), rnd.uniform(1.5, 4)
        span = H + 300
        y = ((ph * span + t * sp * 380) % span) - 150
        x = x0 * W + math.sin(t * 1.7 + i) * 50
        bill(cr, x, y, size * rnd.uniform(0.8, 1.15), rot0 + math.sin(t + i) * 0.6, math.cos(t * spin + i))


def cash_brick(cr, x, y, w):
    """Banded stack of bills, (x, y) = bottom-centre."""
    h, d = w * 0.28, w * 0.18
    cr.move_to(x - w / 2, y - h); cr.line_to(x - w / 2 + d, y - h - d * 0.6); cr.line_to(x + w / 2 + d, y - h - d * 0.6); cr.line_to(x + w / 2, y - h); cr.close_path()
    src(cr, (160, 225, 150)); cr.fill_preserve(); src(cr, (30, 95, 45)); cr.set_line_width(w * 0.02); cr.stroke()
    cr.move_to(x + w / 2, y - h); cr.line_to(x + w / 2 + d, y - h - d * 0.6); cr.line_to(x + w / 2 + d, y - d * 0.6); cr.line_to(x + w / 2, y); cr.close_path()
    src(cr, (70, 140, 75)); cr.fill_preserve(); src(cr, (30, 95, 45)); cr.stroke()
    cr.rectangle(x - w / 2, y - h, w, h)
    cr.set_source(lin(0, y - h, 0, y, [(0, (120, 195, 115)), (1, (80, 155, 85))])); cr.fill_preserve(); src(cr, (30, 95, 45)); cr.stroke()
    for i in range(1, 5):
        cr.move_to(x - w / 2, y - h * i / 5); cr.line_to(x + w / 2, y - h * i / 5); src(cr, (40, 110, 55), 0.5); cr.set_line_width(w * 0.008); cr.stroke()
    cr.rectangle(x - w * 0.08, y - h, w * 0.16, h); src(cr, (240, 225, 180)); cr.fill()


def confetti(cr, W, H, t, n=110, seed=3):
    rnd = random.Random(seed)
    cols = [RED, YELLOW, BLUE, GREEN, (255, 120, 220), WHITE, (255, 150, 40)]
    for i in range(n):
        x0, sp, ph = rnd.random() * W, rnd.uniform(160, 420), rnd.random()
        y = ((ph * H * 1.3 + t * sp) % (H * 1.3)) - H * 0.15
        x = x0 + math.sin(t * 2.5 + i) * 40
        cr.save(); cr.translate(x, y); cr.rotate(t * 3 + i); cr.scale(1, math.cos(t * 6 + i * 1.3))
        cr.rectangle(-9, -5, 18, 10); src(cr, cols[i % len(cols)]); cr.fill(); cr.restore()


def burst(cr, cx, cy, r, color=YELLOW, n=14, rot=0.0):
    cr.move_to(cx + r * math.cos(rot), cy + r * math.sin(rot))
    for i in range(1, n * 2):
        a = rot + i * math.pi / n
        rr = r if i % 2 == 0 else r * 0.72
        cr.line_to(cx + rr * math.cos(a), cy + rr * math.sin(a))
    cr.close_path()
    cr.set_source(rad(cx, cy, 0, r, [(0, lighter(color, 0.5)), (1, darker(color, 0.85))]))
    cr.fill_preserve(); src(cr, INK); cr.set_line_width(r * 0.05); cr.set_line_join(cairo.LINE_JOIN_ROUND); cr.stroke()


def price_tag(cr, cx, cy, s, size, color=YELLOW, scale=1.0, swing=0.0):
    """Hanging price tag card with string."""
    if scale <= 0.01: return
    cr.save(); cr.translate(cx, cy - size * 1.4); cr.rotate(swing); cr.scale(scale, scale)
    ext = measure(cr, s, size)
    w, h = ext.width + size * 1.4, size * 1.6
    cr.move_to(0, -size * 1.2); cr.line_to(0, size * 1.4 - h / 2)
    src(cr, (60, 50, 40)); cr.set_line_width(size * 0.05); cr.stroke()
    y0 = size * 1.4 - h / 2
    cr.move_to(-w / 2 + size * 0.5, y0); cr.line_to(w / 2, y0); cr.line_to(w / 2, y0 + h); cr.line_to(-w / 2 + size * 0.5, y0 + h)
    cr.line_to(-w / 2, y0 + h / 2); cr.close_path()
    cr.set_source(lin(0, y0, 0, y0 + h, [(0, lighter(color, 0.3)), (1, darker(color, 0.85))]))
    cr.fill_preserve(); src(cr, INK); cr.set_line_width(size * 0.09); cr.set_line_join(cairo.LINE_JOIN_ROUND); cr.stroke()
    cr.arc(-w / 2 + size * 0.45, y0 + h / 2, size * 0.13, 0, 2 * math.pi); src(cr, INK); cr.fill()
    text(cr, size * 0.25, y0 + h / 2, s, size, WHITE, sw=size * 0.14, shadow=False)
    cr.restore()


# ------------------------------------------------------------------ sets
def _surface(W, H, k):
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, int(W * k), int(H * k))
    cr = cairo.Context(s); cr.scale(k, k)
    return s, cr


def _blur(surface, radius):
    w, h = surface.get_width(), surface.get_height()
    buf = np.ndarray((h, surface.get_stride() // 4, 4), np.uint8, buffer=surface.get_data())[:, :w]
    img = Image.fromarray(buf[..., [2, 1, 0, 3]].copy(), "RGBA").filter(ImageFilter.GaussianBlur(radius))
    arr = np.asarray(img)[..., [2, 1, 0, 3]].copy()
    out = cairo.ImageSurface(cairo.FORMAT_ARGB32, w, h)
    np.ndarray((h, out.get_stride() // 4, 4), np.uint8, buffer=out.get_data())[:, :w] = arr
    out.mark_dirty()
    return out


@lru_cache(maxsize=8)
def kitchen_back(W, H, k):
    s, cr = _surface(W, H, k)
    portrait = H > W
    top = H * (0.655 if not portrait else 0.6)
    cr.rectangle(0, 0, W, H); cr.set_source(lin(0, 0, 0, top, [(0, (255, 238, 205)), (1, (232, 196, 160))])); cr.fill()
    # tile backsplash
    ty = top - H * 0.2
    cr.rectangle(0, ty, W, top - ty); src(cr, (245, 245, 240)); cr.fill()
    tw = 90
    for i in range(int(W / tw) + 2):
        cr.move_to(i * tw, ty); cr.line_to(i * tw, top)
    for j in range(int((top - ty) / (tw * 0.5)) + 1):
        cr.move_to(0, ty + j * tw * 0.5); cr.line_to(W, ty + j * tw * 0.5)
    src(cr, (200, 195, 185)); cr.set_line_width(3); cr.stroke()
    # window
    wx, wy, ww, wh = W * 0.06, H * 0.08, W * (0.3 if not portrait else 0.5), H * (0.34 if not portrait else 0.2)
    rrect(cr, wx - 18, wy - 18, ww + 36, wh + 36, 14); src(cr, (150, 95, 55)); cr.fill()
    cr.rectangle(wx, wy, ww, wh); cr.set_source(lin(0, wy, 0, wy + wh, [(0, (110, 185, 255)), (1, (200, 235, 255))])); cr.fill()
    glow(cr, wx + ww * 0.75, wy + wh * 0.3, wh * 0.5, (255, 250, 200), 0.9)
    cr.save(); cr.rectangle(wx, wy, ww, wh); cr.clip()
    for i, (hx, hr, col) in enumerate(((0.2, 0.5, (120, 190, 120)), (0.7, 0.6, (95, 170, 100)))):
        ellipse(cr, wx + ww * hx, wy + wh * 1.05, ww * hr, wh * 0.38); src(cr, col); cr.fill()
    cr.restore()
    cr.move_to(wx + ww / 2, wy); cr.line_to(wx + ww / 2, wy + wh); cr.move_to(wx, wy + wh / 2); cr.line_to(wx + ww, wy + wh / 2)
    src(cr, (150, 95, 55)); cr.set_line_width(14); cr.stroke()
    rrect(cr, wx - 40, wy + wh + 10, ww + 80, 26, 8); src(cr, (125, 80, 45)); cr.fill()
    # brick pizza oven
    if not portrait:
        ox, oy, orx, ory = W * 0.76, top - H * 0.2, W * 0.15, H * 0.3
        cr.move_to(ox - orx, oy); cr.curve_to(ox - orx, oy - ory * 1.3, ox + orx, oy - ory * 1.3, ox + orx, oy); cr.close_path()
        cr.set_source(lin(0, oy - ory, 0, oy, [(0, (190, 90, 60)), (1, (140, 60, 40))])); cr.fill()
        cr.save(); cr.move_to(ox - orx, oy); cr.curve_to(ox - orx, oy - ory * 1.3, ox + orx, oy - ory * 1.3, ox + orx, oy); cr.close_path(); cr.clip()
        for j in range(12):
            yy = oy - j * 28
            cr.move_to(ox - orx, yy); cr.line_to(ox + orx, yy)
            for i in range(-8, 9):
                xx = ox + i * 60 + (30 if j % 2 else 0)
                cr.move_to(xx, yy); cr.line_to(xx, yy - 28)
        src(cr, (110, 45, 30), 0.6); cr.set_line_width(3); cr.stroke(); cr.restore()
        cr.move_to(ox - orx * 0.45, oy); cr.curve_to(ox - orx * 0.45, oy - ory * 0.65, ox + orx * 0.45, oy - ory * 0.65, ox + orx * 0.45, oy); cr.close_path()
        src(cr, (30, 15, 10)); cr.fill()
        glow(cr, ox, oy - ory * 0.12, orx * 0.55, (255, 140, 30), 0.9)
        rrect(cr, ox - orx * 1.1, oy - 6, orx * 2.2, 22, 6); src(cr, (120, 110, 105)); cr.fill()
    # shelf with jars
    sx0 = W * (0.42 if not portrait else 0.6)
    sy0 = H * (0.2 if not portrait else 0.08)
    rrect(cr, sx0, sy0, W * 0.15 if not portrait else W * 0.33, 18, 6); src(cr, (140, 90, 50)); cr.fill()
    rnd = random.Random(2)
    for i in range(4):
        jx = sx0 + 20 + i * (W * 0.035 if not portrait else W * 0.08)
        jh = rnd.uniform(50, 90)
        rrect(cr, jx, sy0 - jh, 48, jh, 10); src(cr, [(230, 120, 60), (120, 180, 220), (240, 200, 90), (200, 90, 110)][i], 0.85); cr.fill()
        rrect(cr, jx - 3, sy0 - jh - 10, 54, 14, 4); src(cr, (90, 70, 60)); cr.fill()
    # pendant lamps
    for lx in ((0.38, 0.62) if not portrait else (0.3, 0.7)):
        x = W * lx
        cr.move_to(x, 0); cr.line_to(x, H * 0.06); src(cr, (50, 45, 45)); cr.set_line_width(4); cr.stroke()
        cr.move_to(x - 55, H * 0.06 + 55); cr.curve_to(x - 55, H * 0.06 - 10, x + 55, H * 0.06 - 10, x + 55, H * 0.06 + 55); cr.close_path()
        cr.set_source(lin(0, H * 0.06, 0, H * 0.06 + 55, [(0, (60, 60, 70)), (1, (30, 30, 40))])); cr.fill()
        glow(cr, x, H * 0.06 + 60, 230, (255, 230, 160), 0.45)
    return _blur(s, 3.2 * k)


@lru_cache(maxsize=8)
def kitchen_counter(W, H, k):
    s, cr = _surface(W, H, k)
    top = H * (0.655 if not portrait_(W, H) else 0.6)
    cr.rectangle(0, top, W, 46); cr.set_source(lin(0, top, 0, top + 46, [(0, (245, 242, 236)), (0.5, (220, 215, 208)), (1, (170, 165, 160))])); cr.fill()
    rnd = random.Random(8)
    for _ in range(25):  # marble veins
        x = rnd.uniform(0, W); cr.move_to(x, top + 4); cr.curve_to(x + 40, top + 15, x + 20, top + 30, x + 90, top + 42)
        src(cr, (180, 175, 175), 0.35); cr.set_line_width(2); cr.stroke()
    cr.rectangle(0, top + 46, W, H - top); cr.set_source(lin(0, top + 46, 0, H, [(0, (160, 100, 55)), (1, (105, 60, 30))])); cr.fill()
    cr.rectangle(0, top + 46, W, 18); src(cr, BLACK, 0.25); cr.fill()
    pw = 360
    for i in range(int(W / pw) + 1):
        rrect(cr, i * pw + 25, top + 90, pw - 50, H - top - 120, 16); src(cr, (80, 45, 20), 0.35); cr.set_line_width(6); cr.stroke()
        rrect(cr, i * pw + pw / 2 - 40, top + 120, 80, 14, 7); src(cr, (215, 190, 140)); cr.fill()
    return s


def portrait_(W, H): return H > W


def counter_top(W, H): return H * (0.655 if not portrait_(W, H) else 0.6)


@lru_cache(maxsize=8)
def field_back(W, H, k, ring):
    s, cr = _surface(W, H, k)
    hz = H * 0.42
    cr.rectangle(0, 0, W, hz + 5); cr.set_source(lin(0, 0, 0, hz, [(0, (70, 150, 250)), (1, (190, 228, 255))])); cr.fill()
    glow(cr, W * 0.82, H * 0.12, H * 0.35, (255, 250, 200), 0.85)
    cr.arc(W * 0.82, H * 0.12, H * 0.06, 0, 2 * math.pi); src(cr, (255, 252, 225)); cr.fill()
    for col, base, amp, ph in (((150, 190, 215), hz - 40, 90, 0.3), ((110, 175, 120), hz - 10, 60, 1.7)):
        cr.move_to(0, hz + 10)
        for i in range(0, 41):
            x = i * W / 40
            cr.line_to(x, base - amp * (0.5 + 0.5 * math.sin(i * 0.35 + ph)) * (0.6 + 0.4 * math.sin(i * 0.13)))
        cr.line_to(W, hz + 10); cr.close_path(); src(cr, col); cr.fill()
    rnd = random.Random(5)
    for i in range(22):  # tree line
        x = rnd.uniform(0, W); rr = rnd.uniform(28, 55)
        cr.rectangle(x - 5, hz - rr * 0.5, 10, rr * 0.8); src(cr, (90, 60, 40)); cr.fill()
        for dx, dy, kk in ((0, -rr * 0.9, 1), (-rr * 0.5, -rr * 0.55, 0.75), (rr * 0.5, -rr * 0.55, 0.75)):
            cr.arc(x + dx, hz + dy, rr * kk, 0, 2 * math.pi)
            cr.set_source(rad(x + dx, hz + dy, 0, rr * kk, [(0, (95, 170, 80)), (1, (45, 115, 50))], fx=x + dx - rr * 0.3, fy=hz + dy - rr * 0.3)); cr.fill()
    s = _blur(s, 2.5 * k)
    cr = cairo.Context(s); cr.scale(k, k)
    cr.rectangle(0, hz, W, H - hz); cr.set_source(lin(0, hz, 0, H, [(0, (135, 205, 95)), (1, (70, 150, 45))])); cr.fill()
    for _ in range(1600):  # grass blades, denser/larger towards camera
        y = hz + (rnd.random() ** 0.7) * (H - hz)
        x = rnd.uniform(0, W)
        hh = 4 + (y - hz) / (H - hz) * 16
        cr.move_to(x, y); cr.line_to(x + rnd.uniform(-3, 3), y - hh)
        src(cr, (170, 230, 120) if rnd.random() < 0.5 else (60, 130, 40), 0.55); cr.set_line_width(1.5 + hh * 0.08); cr.stroke()
    cx, cy, rx, ry = ring
    ellipse(cr, cx, cy, rx, ry); src(cr, WHITE, 0.92); cr.set_line_width(16); cr.stroke()
    ellipse(cr, cx, cy, rx, ry); src(cr, (255, 255, 255), 0.18); cr.fill()
    return s


def clouds(cr, W, H, t):
    for i in range(4):
        x = (i * W / 3.4 + t * 18) % (W + 500) - 250
        y = H * (0.07 + 0.06 * (i % 2))
        for dx, dy, r in ((0, 0, 45), (50, -20, 60), (110, 0, 48), (55, 12, 50)):
            cr.arc(x + dx, y + dy, r, 0, 2 * math.pi)
            cr.set_source(rad(x + dx, y + dy, 0, r, [(0, WHITE, 0.95), (0.85, (235, 245, 255), 0.95), (1, (220, 235, 250), 0)], fy=y + dy - r * 0.4)); cr.fill()


def studio(cr, W, H, t, palette="blue", spin=0.12, n=20):
    inner, outer = PALETTES.get(palette, PALETTES["blue"])
    cr.rectangle(0, 0, W, H)
    cr.set_source(rad(W / 2, H * 0.45, 0, max(W, H) * 0.75, [(0, inner), (1, outer)])); cr.fill()
    cx, cy, R = W / 2, H * 0.45, max(W, H) * 1.2
    a0 = t * spin
    for i in range(n):
        a = a0 + i * 2 * math.pi / n
        cr.move_to(cx, cy); cr.line_to(cx + R * math.cos(a), cy + R * math.sin(a))
        cr.line_to(cx + R * math.cos(a + math.pi / n), cy + R * math.sin(a + math.pi / n)); cr.close_path()
    cr.set_source(rad(cx, cy, 0, R * 0.6, [(0, WHITE, 0.0), (0.15, WHITE, 0.16), (1, WHITE, 0.05)])); cr.fill()
    # stage floor
    fy = H * (0.8 if W > H else 0.78)
    cr.rectangle(0, fy, W, H - fy); cr.set_source(lin(0, fy, 0, H, [(0, darker(outer, 0.7)), (1, darker(outer, 0.35))])); cr.fill()
    ellipse(cr, W / 2, fy + (H - fy) * 0.25, W * 0.42, (H - fy) * 0.35)
    cr.set_source(rad(W / 2, fy + (H - fy) * 0.25, 0, W * 0.42, [(0, WHITE, 0.25), (1, WHITE, 0)])); cr.fill()
    cr.move_to(0, fy); cr.line_to(W, fy); src(cr, lighter(inner, 0.4), 0.6); cr.set_line_width(4); cr.stroke()
    return fy


def vignette(cr, W, H, a=0.38):
    cr.save(); cr.translate(W / 2, H / 2); cr.scale(W / 2, H / 2)
    cr.rectangle(-1, -1, 2, 2)
    cr.set_source(rad(0, 0, 0.55, 1.45, [(0, BLACK, 0), (1, BLACK, a)])); cr.fill(); cr.restore()
