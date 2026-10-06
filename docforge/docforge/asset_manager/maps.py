"""Animated maps from Natural Earth country outlines (public domain).

Spec: {"title", "focus": [names], "context": [names], "bbox": [lon_min, lat_min, lon_max, lat_max],
       "points": [{"name", "lat", "lon"}], "routes": [{"from": [lat, lon], "to": [lat, lon], "label"}],
       "start_zoom": 4}
The camera starts zoomed out by start_zoom around the bbox and eases in, then the
focus countries light up, points appear and routes draw themselves.
"""

from __future__ import annotations

import json
import math
import os
from functools import lru_cache
from pathlib import Path

import numpy as np
import requests
from PIL import Image, ImageDraw

from .graphics import Ctx, ease_io, fade, font, heading, hex_rgb, source_line, text_w, with_alpha

CACHE = Path(os.environ.get("DOCFORGE_CACHE", "~/.cache/docforge")).expanduser()
DEFAULT_URL = ("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/"
               "geojson/ne_10m_admin_0_countries.geojson")


def ensure_countries(url: str = DEFAULT_URL) -> Path:
    path = CACHE / "ne_10m_admin_0_countries.geojson"
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        r = requests.get(url, timeout=120)
        r.raise_for_status()
        tmp = path.with_suffix(".tmp")
        tmp.write_bytes(r.content)
        tmp.replace(path)
    return path


@lru_cache(maxsize=1)
def countries() -> list[dict]:
    data = json.loads(ensure_countries().read_text())
    out = []
    for feat in data["features"]:
        props = feat["properties"]
        geom = feat["geometry"]
        polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        rings = [np.asarray(poly[0], dtype=np.float64) for poly in polys]  # outer rings only
        allpts = np.concatenate(rings)
        out.append({
            "names": {str(props.get(k, "")).lower() for k in ("NAME", "NAME_LONG", "ADMIN", "NAME_EN", "SOVEREIGNT")},
            "rings": rings,
            "bbox": (allpts[:, 0].min(), allpts[:, 1].min(), allpts[:, 0].max(), allpts[:, 1].max()),
        })
    return out


def find_country(name: str) -> dict | None:
    key = name.lower()
    for c in countries():
        if key in c["names"]:
            return c
    return None


def _view(bbox, w: int, h: int, zoom: float):
    """Return (lon0, lat0, scale) so bbox (expanded by zoom) fits the frame."""
    lon_min, lat_min, lon_max, lat_max = bbox
    lon0, lat0 = (lon_min + lon_max) / 2, (lat_min + lat_max) / 2
    k = math.cos(math.radians(lat0))
    span_x = (lon_max - lon_min) * k * zoom * 1.15
    span_y = (lat_max - lat_min) * zoom * 1.15
    scale = min(w / max(span_x, 1e-6), h / max(span_y, 1e-6))
    return lon0, lat0, k, scale


def r_map(spec: dict, t: float, ctx: Ctx) -> Image.Image:
    w, h, s = ctx.width, ctx.height, ctx.s
    focus = [c for c in (find_country(n) for n in spec.get("focus", [])) if c]
    bbox = spec.get("bbox")
    if not bbox:
        if not focus:
            raise ValueError(f"map needs a bbox or a known focus country: {spec}")
        xs = [b for c in focus for b in (c["bbox"][0], c["bbox"][2])]
        ys = [b for c in focus for b in (c["bbox"][1], c["bbox"][3])]
        bbox = [min(xs), min(ys), max(xs), max(ys)]
    zoom_t = ease_io(t / max(1.0, min(3.0, ctx.duration * 0.55)))
    start_zoom = float(spec.get("start_zoom", 4))
    zoom = start_zoom + (1 - start_zoom) * zoom_t
    lon0, lat0, k, scale = _view(bbox, w, h, zoom)

    def project(arr):
        x = (arr[:, 0] - lon0) * k * scale + w / 2
        y = (lat0 - arr[:, 1]) * scale + h / 2
        return np.stack([x, y], axis=1)

    view_lon = w / 2 / (k * scale)
    view_lat = h / 2 / scale
    vb = (lon0 - view_lon, lat0 - view_lat, lon0 + view_lon, lat0 + view_lat)
    img = Image.new("RGB", (w, h), hex_rgb(ctx.colors["sea"]))
    d = ImageDraw.Draw(img)
    land = hex_rgb(ctx.colors["land"])
    edge = hex_rgb(ctx.colors["background"])
    focus_ids = {id(c) for c in focus}
    context_names = {n.lower() for n in spec.get("context", [])}
    hi_a = fade(t, min(1.2, ctx.duration * 0.3), 0.8)
    hi_col = hex_rgb(ctx.colors["land_highlight"])
    ctx_col = tuple(min(255, int(v * 1.25)) for v in land)
    for c in countries():
        b = c["bbox"]
        if b[2] < vb[0] or b[0] > vb[2] or b[3] < vb[1] or b[1] > vb[3]:
            continue
        if id(c) in focus_ids:
            fill = tuple(int(land[i] + (hi_col[i] - land[i]) * hi_a) for i in range(3))
        elif c["names"] & context_names:
            fill = ctx_col
        else:
            fill = land
        for ring in c["rings"]:
            pts = project(ring)
            if len(pts) < 3:
                continue
            if pts[:, 0].max() < 0 or pts[:, 0].min() > w or pts[:, 1].max() < 0 or pts[:, 1].min() > h:
                continue
            flat = [tuple(p) for p in pts]
            d.polygon(flat, fill=fill, outline=edge)
    # Labels for focus countries once highlighted.
    f_lab = font(ctx.font_bold, int(40 * s))
    f_pt = font(ctx.font_regular, int(30 * s))
    for name in spec.get("labels", spec.get("focus", [])):
        c = find_country(name)
        if not c:
            continue
        cx, cy = project(np.array([[(c["bbox"][0] + c["bbox"][2]) / 2, (c["bbox"][1] + c["bbox"][3]) / 2]]))[0]
        if 0 < cx < w and 0 < cy < h and spec.get("label_countries", True):
            img = with_alpha(img, lambda dd, cx=cx, cy=cy, name=name: dd.text(
                (cx - text_w(dd, name.upper(), f_lab) / 2, cy - int(90 * s)), name.upper(), font=f_lab,
                fill=hex_rgb(ctx.colors["text"]) + (255,)), hi_a)
    for i, p in enumerate(spec.get("points", [])):
        a = fade(t, min(1.6, ctx.duration * 0.4) + i * 0.25, 0.5)
        x, y = project(np.array([[p["lon"], p["lat"]]]))[0]

        def draw_pt(dd, x=x, y=y, p=p):
            r = int(10 * s)
            dd.ellipse([x - r, y - r, x + r, y + r], fill=hex_rgb(ctx.colors["accent"]) + (255,),
                       outline=(255, 255, 255, 255), width=max(1, int(2 * s)))
            dd.text((x + int(18 * s), y - f_pt.size / 2), p.get("name", ""), font=f_pt,
                    fill=hex_rgb(ctx.colors["text"]) + (255,))
        img = with_alpha(img, draw_pt, a)
    for i, rt in enumerate(spec.get("routes", [])):
        start = min(1.8, ctx.duration * 0.45) + i * 0.4
        prog = ease_io((t - start) / 1.4)
        if prog <= 0:
            continue
        (la1, lo1), (la2, lo2) = rt["from"], rt["to"]
        n = 48
        ts = np.linspace(0, prog, n)
        # Gentle arc: offset the midpoint perpendicular to the chord.
        lon = lo1 + (lo2 - lo1) * ts
        lat = la1 + (la2 - la1) * ts + np.sin(ts * math.pi) * 0.12 * math.hypot(lo2 - lo1, la2 - la1)
        pts = project(np.stack([lon, lat], axis=1))
        img = with_alpha(img, lambda dd, pts=pts: dd.line([tuple(p) for p in pts],
                                                          fill=hex_rgb(ctx.colors["accent2"]) + (255,),
                                                          width=max(2, int(5 * s)), joint="curve"), 1)
        if prog > 0.98 and rt.get("label"):
            mx, my = pts[len(pts) // 2]
            img = with_alpha(img, lambda dd, mx=mx, my=my, lab=rt["label"]: dd.text(
                (mx + int(12 * s), my - int(40 * s)), lab, font=f_pt,
                fill=hex_rgb(ctx.colors["accent2"]) + (255,)), 1)
    img = heading(img, ctx, spec.get("title", ""), t)
    return source_line(img, ctx, spec.get("source", "Natural Earth"), fade(t, 0.6))
