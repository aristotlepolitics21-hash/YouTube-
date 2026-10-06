"""Documentary graphics, drawn with Pillow and animated frame by frame.

Each renderer is a function (spec, t, ctx) -> PIL.Image for time t in seconds,
so the editor can stream frames straight into FFmpeg. All graphics share one
look: dark graded background, one accent colour, large readable type, a small
source line bottom-left, and gentle easing (no bouncing).
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


@dataclass
class Ctx:
    width: int
    height: int
    duration: float
    colors: dict
    font_bold: str
    font_regular: str

    @property
    def s(self) -> float:  # scale relative to 1080p
        return self.height / 1080


def first_font(paths: list[str]) -> str:
    for p in paths:
        if Path(p).exists():
            return p
    return ""


@lru_cache(maxsize=256)
def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    if path:
        return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def ease(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return 1 - (1 - x) ** 3  # ease-out cubic


def ease_io(x: float) -> float:
    x = max(0.0, min(1.0, x))
    return 3 * x * x - 2 * x * x * x


def fade(t: float, start: float, length: float = 0.6) -> float:
    return ease((t - start) / length) if length > 0 else float(t >= start)


def mix(c1, c2, a: float):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * a) for i in range(3))


@lru_cache(maxsize=8)
def _background(w: int, h: int, bg: str, surface: str) -> Image.Image:
    """Radial grade from surface (centre) to background (edges) plus a soft vignette."""
    small = Image.new("RGB", (160, 90))
    c_bg, c_sf = hex_rgb(bg), hex_rgb(surface)
    px = small.load()
    for y in range(90):
        for x in range(160):
            d = math.hypot((x - 80) / 80, (y - 45) / 45) / 1.2
            px[x, y] = mix(c_sf, c_bg, min(1, d))
    return small.resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(4))


def base(ctx: Ctx) -> Image.Image:
    return _background(ctx.width, ctx.height, ctx.colors["background"], ctx.colors["surface"]).copy()


def text_w(draw: ImageDraw.ImageDraw, text: str, f) -> int:
    l, _, r, _ = draw.textbbox((0, 0), text, font=f)
    return r - l


def wrap(draw, text: str, f, max_w: int) -> list[str]:
    lines = []
    for para in text.split("\n"):
        words, line = para.split(), ""
        for w in words:
            trial = f"{line} {w}".strip()
            if text_w(draw, trial, f) <= max_w or not line:
                line = trial
            else:
                lines.append(line)
                line = w
        lines.append(line)
    return lines


def with_alpha(img: Image.Image, draw_fn, alpha: float) -> Image.Image:
    """Draw onto a transparent layer and composite it at `alpha`."""
    if alpha <= 0:
        return img
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(layer))
    if alpha < 1:
        a = layer.getchannel("A").point(lambda v: int(v * alpha))
        layer.putalpha(a)
    out = img.convert("RGBA")
    out.alpha_composite(layer)
    return out.convert("RGB")


def source_line(img: Image.Image, ctx: Ctx, text: str, alpha: float = 1.0) -> Image.Image:
    if not text:
        return img
    f = font(ctx.font_regular, int(24 * ctx.s))
    return with_alpha(img, lambda d: d.text((int(64 * ctx.s), ctx.height - int(64 * ctx.s)),
                                            f"Source: {text}", font=f,
                                            fill=hex_rgb(ctx.colors["muted"]) + (255,)), alpha)


def heading(img, ctx: Ctx, title: str, t: float):
    if not title:
        return img
    f = font(ctx.font_bold, int(52 * ctx.s))
    a = fade(t, 0.0, 0.5)
    dy = int((1 - a) * 20 * ctx.s)
    acc = hex_rgb(ctx.colors["accent"]) + (255,)

    def draw(d):
        x, y = int(96 * ctx.s), int(80 * ctx.s) + dy
        d.rectangle([x, y + int(8 * ctx.s), x + int(8 * ctx.s), y + int(58 * ctx.s)], fill=acc)
        d.text((x + int(28 * ctx.s), y), title, font=f, fill=hex_rgb(ctx.colors["text"]) + (255,))
    return with_alpha(img, draw, a)


# ----------------------------------------------------------------- renderers

def r_title(spec: dict, t: float, ctx: Ctx) -> Image.Image:
    img = base(ctx)
    text, sub = spec.get("text", ""), spec.get("subtitle", "")
    f = font(ctx.font_bold, int(spec.get("size", 112) * ctx.s))
    fs = font(ctx.font_regular, int(40 * ctx.s))
    d0 = ImageDraw.Draw(img)
    lines = wrap(d0, text, f, int(ctx.width * 0.8))
    lh = int(f.size * 1.15)
    total = lh * len(lines) + (int(70 * ctx.s) if sub else 0)
    y0 = (ctx.height - total) // 2
    a = fade(t, 0.15, 0.9)
    spread = 1 + (1 - a) * 0.04

    def draw(d):
        for i, line in enumerate(lines):
            w = text_w(d, line, f) * spread
            d.text(((ctx.width - w) / 2, y0 + i * lh), line, font=f, fill=hex_rgb(ctx.colors["text"]) + (255,))
    img = with_alpha(img, draw, a)
    if sub:
        b = fade(t, 0.7, 0.8)
        acc = hex_rgb(ctx.colors["accent"]) + (255,)
        y = y0 + lh * len(lines) + int(24 * ctx.s)

        def draw_sub(d):
            w = text_w(d, sub, fs)
            d.text(((ctx.width - w) / 2, y), sub, font=fs, fill=acc)
        img = with_alpha(img, draw_sub, b)
    return img


def _split_number(value: str):
    m = re.search(r"-?\d[\d,]*(\.\d+)?", value)
    if not m:
        return None
    num = float(m.group(0).replace(",", ""))
    decimals = len(m.group(1)) - 1 if m.group(1) else 0
    return value[:m.start()], num, decimals, value[m.end():], "," in m.group(0)


def r_stat(spec: dict, t: float, ctx: Ctx) -> Image.Image:
    img = base(ctx)
    value, label = str(spec.get("value", "")), spec.get("label", "")
    parts = _split_number(value)
    shown = value
    if parts:
        pre, num, dec, post, commas = parts
        k = ease(t / max(0.8, min(1.6, ctx.duration * 0.35)))
        cur = num * k
        body = f"{cur:,.{dec}f}" if commas else f"{cur:.{dec}f}"
        shown = f"{pre}{body}{post}"
    f = font(ctx.font_bold, int(spec.get("size", 200) * ctx.s))
    fl = font(ctx.font_regular, int(46 * ctx.s))
    d0 = ImageDraw.Draw(img)
    full_w = text_w(d0, value, f)
    if full_w > ctx.width * 0.86:
        f = font(ctx.font_bold, int(f.size * ctx.width * 0.86 / full_w))
    acc = hex_rgb(ctx.colors["accent"]) + (255,)
    lines = wrap(d0, label, fl, int(ctx.width * 0.7))
    y = int(ctx.height * 0.5 - f.size * 0.75)

    def draw(d):
        w = text_w(d, value, f)  # centre on the final width so digits don't jitter
        d.text(((ctx.width - w) / 2, y), shown, font=f, fill=acc)
    img = with_alpha(img, draw, fade(t, 0.0, 0.4))

    def draw_label(d):
        for i, line in enumerate(lines):
            w = text_w(d, line, fl)
            d.text(((ctx.width - w) / 2, y + int(f.size * 1.25) + i * int(fl.size * 1.3)), line, font=fl,
                   fill=hex_rgb(ctx.colors["text"]) + (255,))
    img = with_alpha(img, draw_label, fade(t, 0.5, 0.7))
    return source_line(img, ctx, spec.get("source", ""), fade(t, 0.8))


def r_text(spec: dict, t: float, ctx: Ctx) -> Image.Image:
    img = base(ctx)
    f = font(ctx.font_bold, int(spec.get("size", 72) * ctx.s))
    d0 = ImageDraw.Draw(img)
    lines = wrap(d0, spec.get("text", ""), f, int(ctx.width * 0.74))
    lh = int(f.size * 1.25)
    y0 = (ctx.height - lh * len(lines)) // 2
    for i, line in enumerate(lines):
        def draw(d, i=i, line=line):
            w = text_w(d, line, f)
            d.text(((ctx.width - w) / 2, y0 + i * lh), line, font=f, fill=hex_rgb(ctx.colors["text"]) + (255,))
        img = with_alpha(img, draw, fade(t, 0.15 + i * 0.35, 0.7))
    return img


def r_quote(spec: dict, t: float, ctx: Ctx) -> Image.Image:
    img = base(ctx)
    f = font(ctx.font_bold, int(64 * ctx.s))
    fa = font(ctx.font_regular, int(36 * ctx.s))
    fq = font(ctx.font_bold, int(220 * ctx.s))
    d0 = ImageDraw.Draw(img)
    lines = wrap(d0, spec.get("text", ""), f, int(ctx.width * 0.7))
    lh = int(f.size * 1.3)
    y0 = (ctx.height - lh * len(lines)) // 2 - int(30 * ctx.s)
    acc = hex_rgb(ctx.colors["accent"]) + (255,)
    x0 = int(ctx.width * 0.15)

    def draw(d):
        d.text((x0 - int(130 * ctx.s), y0 - int(80 * ctx.s)), "“", font=fq, fill=acc)
        for i, line in enumerate(lines):
            d.text((x0, y0 + i * lh), line, font=f, fill=hex_rgb(ctx.colors["text"]) + (255,))
    img = with_alpha(img, draw, fade(t, 0.1, 0.9))
    attr = spec.get("attribution", "")
    if attr:
        img = with_alpha(img, lambda d: d.text((x0, y0 + lh * len(lines) + int(30 * ctx.s)), f"— {attr}",
                                               font=fa, fill=acc), fade(t, 0.9, 0.7))
    return img


def r_comparison(spec: dict, t: float, ctx: Ctx) -> Image.Image:
    img = heading(base(ctx), ctx, spec.get("title", ""), t)
    fl = font(ctx.font_regular, int(40 * ctx.s))
    fv = font(ctx.font_bold, int(96 * ctx.s))
    colors = [hex_rgb(ctx.colors["accent2"]), hex_rgb(ctx.colors["accent"])]
    for i, key in enumerate(("left", "right")):
        side = spec.get(key, {})
        a = fade(t, 0.3 + i * 0.5, 0.7)
        cx = ctx.width * (0.3 if i == 0 else 0.7)
        dx = (1 - a) * 60 * ctx.s * (-1 if i == 0 else 1)

        def draw(d, side=side, cx=cx + dx, col=colors[i]):
            label, value = side.get("label", ""), str(side.get("value", ""))
            vf = fv
            while text_w(d, value, vf) > ctx.width * 0.36 and vf.size > 40:
                vf = font(ctx.font_bold, int(vf.size * 0.9))
            d.text((cx - text_w(d, label, fl) / 2, ctx.height * 0.40), label, font=fl,
                   fill=hex_rgb(ctx.colors["muted"]) + (255,))
            d.text((cx - text_w(d, value, vf) / 2, ctx.height * 0.47), value, font=vf, fill=col + (255,))
        img = with_alpha(img, draw, a)
    line_a = fade(t, 0.2, 0.6)
    img = with_alpha(img, lambda d: d.line([(ctx.width / 2, ctx.height * 0.36),
                                            (ctx.width / 2, ctx.height * 0.36 + ctx.height * 0.32 * line_a)],
                                           fill=hex_rgb(ctx.colors["muted"]) + (120,), width=max(2, int(2 * ctx.s))), 1)
    return source_line(img, ctx, spec.get("source", ""), fade(t, 0.8))


def _nice_max(v: float) -> float:
    if v <= 0:
        return 1
    mag = 10 ** math.floor(math.log10(v))
    for m in (1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10):
        if m * mag >= v:
            return m * mag
    return 10 * mag


def _fmt(v: float) -> str:
    if abs(v) >= 1e9:
        return f"{v / 1e9:.1f}".rstrip("0").rstrip(".") + "B"
    if abs(v) >= 1e6:
        return f"{v / 1e6:.1f}".rstrip("0").rstrip(".") + "M"
    if abs(v) >= 1e4:
        return f"{v / 1e3:.0f}K"
    if v == int(v):
        return f"{int(v):,}"
    return f"{v:,.1f}"


def r_chart(spec: dict, t: float, ctx: Ctx) -> Image.Image:
    img = heading(base(ctx), ctx, spec.get("title", ""), t)
    s = ctx.s
    left, right = int(200 * s), ctx.width - int(140 * s)
    top, bottom = int(230 * s), ctx.height - int(170 * s)
    fl = font(ctx.font_regular, int(30 * s))
    fv = font(ctx.font_bold, int(34 * s))
    unit = spec.get("unit", "")
    text_c = hex_rgb(ctx.colors["text"]) + (255,)
    muted = hex_rgb(ctx.colors["muted"]) + (255,)
    grid = hex_rgb(ctx.colors["muted"]) + (40,)
    palette = [hex_rgb(ctx.colors["accent"]), hex_rgb(ctx.colors["accent2"]), hex_rgb(ctx.colors["negative"])]
    grow = ease_io((t - 0.4) / max(1.0, min(2.2, ctx.duration * 0.45)))

    if spec.get("type", "bar") == "bar":
        bars = spec.get("bars", [])
        vmax = _nice_max(max((b["value"] for b in bars), default=1))
        n = max(1, len(bars))
        slot = (right - left) / n
        bw = slot * 0.56
        hi = spec.get("highlight")

        def draw(d):
            for k in range(5):
                y = bottom - (bottom - top) * k / 4
                d.line([(left, y), (right, y)], fill=grid, width=1)
                d.text((left - int(20 * s) - text_w(d, _fmt(vmax * k / 4), fl), y - fl.size / 2),
                       _fmt(vmax * k / 4), font=fl, fill=muted)
            for i, b in enumerate(bars):
                x = left + slot * i + (slot - bw) / 2
                h = (bottom - top) * b["value"] / vmax * grow
                col = palette[0] if hi is None or hi == i else hex_rgb(ctx.colors["muted"])
                d.rectangle([x, bottom - h, x + bw, bottom], fill=col + (255,))
                label = str(b["label"])
                d.text((x + bw / 2 - text_w(d, label, fl) / 2, bottom + int(16 * s)), label, font=fl, fill=text_c)
                if grow > 0.95:
                    val = _fmt(b["value"]) + (f" {unit}" if unit and len(unit) < 4 else "")
                    d.text((x + bw / 2 - text_w(d, val, fv) / 2, bottom - h - fv.size - int(10 * s)), val,
                           font=fv, fill=text_c)
        img = with_alpha(img, draw, fade(t, 0.1, 0.4))
    else:
        series = spec.get("series", [])
        xs = [p[0] for se in series for p in se["points"]]
        ys = [p[1] for se in series for p in se["points"]]
        xmin, xmax = min(xs), max(xs)
        ymax = _nice_max(max(ys))
        log = spec.get("scale") == "log"
        ymin_log = math.log10(max(min(ys), 1e-9)) if log else 0

        def px(x, y):
            fx = (x - xmin) / max(1e-9, xmax - xmin)
            if log:
                fy = (math.log10(max(y, 1e-9)) - ymin_log) / max(1e-9, math.log10(ymax) - ymin_log)
            else:
                fy = y / ymax
            return left + fx * (right - left), bottom - fy * (bottom - top)

        def draw(d):
            for k in range(5):
                y = bottom - (bottom - top) * k / 4
                d.line([(left, y), (right, y)], fill=grid, width=1)
                val = 10 ** (ymin_log + (math.log10(ymax) - ymin_log) * k / 4) if log else ymax * k / 4
                d.text((left - int(20 * s) - text_w(d, _fmt(val), fl), y - fl.size / 2), _fmt(val), font=fl, fill=muted)
            ticks = spec.get("x_ticks") or sorted({xmin, xmax, *[p[0] for p in series[0]["points"][:: max(1, len(series[0]["points"]) // 6)]]})
            for xv in ticks:
                x, _ = px(xv, ymax)
                lab = str(int(xv)) if float(xv).is_integer() else str(xv)
                d.text((x - text_w(d, lab, fl) / 2, bottom + int(16 * s)), lab, font=fl, fill=muted)
            for si, se in enumerate(series):
                pts = [px(x, y) for x, y in se["points"]]
                if len(pts) < 2:
                    continue
                # Draw the line progressively up to the current share of total length.
                lengths = [math.dist(a, b) for a, b in zip(pts, pts[1:])]
                target = sum(lengths) * grow
                drawn, path = 0.0, [pts[0]]
                for (a, b), L in zip(zip(pts, pts[1:]), lengths):
                    if drawn + L <= target:
                        path.append(b)
                        drawn += L
                    else:
                        r = (target - drawn) / L if L else 0
                        path.append((a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r))
                        break
                col = palette[si % len(palette)] + (255,)
                d.line(path, fill=col, width=max(3, int(6 * s)), joint="curve")
                end = path[-1]
                rad = int(9 * s)
                d.ellipse([end[0] - rad, end[1] - rad, end[0] + rad, end[1] + rad], fill=col)
                if grow > 0.97:
                    last = se["points"][-1]
                    lab = f"{se.get('label', '')}  {_fmt(last[1])}{(' ' + unit) if unit else ''}".strip()
                    d.text((end[0] - text_w(d, lab, fv) - int(16 * s), end[1] - fv.size - int(14 * s)), lab,
                           font=fv, fill=col)
        img = with_alpha(img, draw, fade(t, 0.1, 0.4))
    if unit and spec.get("type", "bar") == "line":
        img = with_alpha(img, lambda d: d.text((left, top - int(46 * s)), unit, font=fl, fill=muted), fade(t, 0.3))
    return source_line(img, ctx, spec.get("source", ""), fade(t, 0.8))


def r_timeline(spec: dict, t: float, ctx: Ctx) -> Image.Image:
    img = heading(base(ctx), ctx, spec.get("title", ""), t)
    events = spec.get("events", [])
    n = max(1, len(events))
    s = ctx.s
    y = ctx.height * 0.55
    left, right = int(160 * s), ctx.width - int(160 * s)
    fy = font(ctx.font_bold, int(44 * s))
    fl = font(ctx.font_regular, int(28 * s))
    hi = spec.get("highlight", n - 1)
    line_a = ease_io(t / max(0.8, ctx.duration * 0.25))
    img = with_alpha(img, lambda d: d.line([(left, y), (left + (right - left) * line_a, y)],
                                           fill=hex_rgb(ctx.colors["muted"]) + (160,), width=max(2, int(3 * s))), 1)
    span = max(0.6, (ctx.duration * 0.6) / n)
    for i, ev in enumerate(events):
        x = left + (right - left) * (i + 0.5) / n
        a = fade(t, 0.3 + i * span, 0.5)
        is_hi = i == hi
        col = hex_rgb(ctx.colors["accent"] if is_hi else ctx.colors["accent2"]) + (255,)
        above = i % 2 == 0

        def draw(d, x=x, ev=ev, col=col, above=above, is_hi=is_hi):
            r = int((16 if is_hi else 11) * s)
            d.ellipse([x - r, y - r, x + r, y + r], fill=col)
            year = str(ev.get("year", ""))
            lines = wrap(d, ev.get("label", ""), fl, int((right - left) / n * 0.95))
            if above:
                base_y = y - int(60 * s) - len(lines) * int(fl.size * 1.25) - fy.size
            else:
                base_y = y + int(36 * s)
            d.text((x - text_w(d, year, fy) / 2, base_y), year, font=fy, fill=col)
            for k, line in enumerate(lines):
                d.text((x - text_w(d, line, fl) / 2, base_y + fy.size + int(10 * s) + k * int(fl.size * 1.25)),
                       line, font=fl, fill=hex_rgb(ctx.colors["text"]) + (255,))
        img = with_alpha(img, draw, a)
    return img


RENDERERS = {
    "title": r_title, "stat": r_stat, "text": r_text, "quote": r_quote,
    "comparison": r_comparison, "chart": r_chart, "timeline": r_timeline,
}


def make_ctx(config, width: int, height: int, duration: float) -> Ctx:
    g = config.get_path
    return Ctx(width=width, height=height, duration=duration, colors=g("graphics.colors"),
               font_bold=first_font(g("graphics.font_bold", [])),
               font_regular=first_font(g("graphics.font_regular", [])))


def render_frame(kind: str, spec: dict, t: float, ctx: Ctx) -> Image.Image:
    if kind == "map":
        from .maps import r_map
        return r_map(spec, t, ctx)
    return RENDERERS[kind](spec, t, ctx)
