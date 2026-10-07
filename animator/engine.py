"""Beast-style animated video engine (Cairo vector renderer).

Episode JSON -> MP4: characters with lip-sync and actions, detailed sets, camera punches and
whip-pan transitions, word-by-word captions, Piper TTS voiceover, synthesized music and SFX.
Scenes render in parallel (one process per scene) and are concatenated.
"""
import hashlib, math, os, random, subprocess, tempfile, wave
from multiprocessing import Pool

import cairo
import numpy as np
from PIL import Image, ImageEnhance

import toon as T
from toon import WHITE, YELLOW, RED, GREEN, BLUE, GOLD, INK, clamp, lerp, ease_out, ease_in, ease_io, ease_back, bump

FPS = 30
SR = 44100
PLAYER_COLS = [(240, 70, 70), (255, 165, 30), (250, 215, 50), (90, 200, 90), (60, 190, 230),
               (95, 110, 240), (170, 95, 230), (240, 110, 190), (165, 115, 75), (200, 200, 215)]
CHIP = BLUE


def money(v): return f"${int(round(v)):,}"


class Ctx:
    def __init__(self, portrait, k):
        self.portrait = portrait
        self.W, self.H = (1080, 1920) if portrait else (1920, 1080)
        self.k = k
        self.px = (int(self.W * k), int(self.H * k))


class Frame:
    def __init__(self, ctx, cr, t, dur, talk=0.0):
        self.ctx, self.cr, self.t, self.dur, self.talk = ctx, cr, t, dur, talk
        self.W, self.H, self.P = ctx.W, ctx.H, ctx.portrait
        self.cues = None  # a list on the first frame only

    def cue(self, local_t, kind):
        if self.cues is not None: self.cues.append((local_t, kind))


def blit(cr, surf, k):
    cr.save(); cr.scale(1 / k, 1 / k); cr.set_source_surface(surf, 0, 0); cr.paint(); cr.restore()


# ------------------------------------------------------------------ scenes
def scene_hook(F, sc):
    cr, W, H, t = F.cr, F.W, F.H, F.t
    fy = T.studio(cr, W, H, t, sc.get("palette", "red"), spin=0.22)
    if sc.get("money", True): T.money_rain(cr, W, H, t, n=16, seed=sc.get("seed", 1))
    # host walks on from the right, then presents
    k = ease_out(t / 0.7)
    x = lerp(W + 250, W * (0.5 if F.P else 0.82), k)
    walking = k < 0.98
    mood = sc.get("mood", "shock")
    if F.talk > 0.25 and mood != "shock": mood = "happy"
    T.toon(cr, x, fy + (60 if not F.P else 120), 560 if not F.P else 600, CHIP, t, mood=mood,
           pose="idle" if walking else sc.get("pose", "present"), talk=0 if walking else F.talk,
           walk=2.4 if walking else 0, facing=-1, look=(-0.6, 0) if walking else (0, 0), seed=1)
    lines = sc["lines"]
    step = min(0.42, F.dur * 0.6 / max(1, len(lines)))
    base, gap = (H * 0.2, H * 0.11) if F.P else (H * 0.24, H * 0.18)
    cxl = W / 2 if F.P else W * 0.4
    for i, ln in enumerate(lines):
        lt = t - i * step
        F.cue(i * step, "pop")
        if lt < 0: continue
        col = RED if ln.upper() == "VS" else [YELLOW, WHITE][i % 2]
        T.text(cr, cxl, base + i * gap, ln, sc.get("size", 150) * (0.8 if F.P else 1), col,
               scale=ease_back(lt / 0.3) * (1 + 0.025 * math.sin(t * 6 + i)), rot=math.sin(t * 2.5 + i) * 0.025,
               maxw=W * (0.9 if F.P else 0.62))


def _reaction(score):
    if score is None: return "happy", "present", ()
    if score <= 3: return "gross", "shrug", ("stink",)
    if score <= 6: return "think", "think", ()
    if score <= 8: return "happy", "present", ()
    if score <= 9: return "shock", "cheer", ("stars",)
    return "laugh", "cheer", ("hearts", "stars")


def scene_tier(F, sc):
    """Item slides in, the host points, leans in, takes a bite, chews, reacts, rates it."""
    cr, W, H, t, dur, k = F.cr, F.W, F.H, F.t, F.dur, F.ctx.k
    lvl, score = sc.get("level", 0), sc.get("score")
    item = sc.get("item", "pizza")
    blit(cr, T.kitchen_back(W, H, k), k)
    top = T.counter_top(W, H)
    if not F.P:  # oven fire flicker
        T.glow(cr, W * 0.76, top - H * 0.24, 170 + 25 * math.sin(t * 9) + 15 * math.sin(t * 23), (255, 150, 40), 0.35)
    cx0 = W * (0.75 if not F.P else 0.72)
    ix = W * 0.36
    R = (300 if not F.P else 250) * (0.88 + 0.03 * lvl)
    iy = top + (75 if item == "pizza" else -10)
    bite_t = clamp(dur * 0.55, 1.1, max(1.1, dur - 1.0))
    if t < bite_t + 0.05: lean_k = ease_io((t - (bite_t - 0.45)) / 0.45)
    else: lean_k = 1 - ease_io((t - bite_t - 0.05) / 0.35)
    F.cue(0.0, "whoosh"); F.cue(bite_t, "chomp")
    h = 660 if not F.P else 640
    r = h / 2.6
    reach_x = ix + R * 0.75 + r * 0.6
    x = lerp(cx0, reach_x + (cx0 - reach_x) * 0.35, lean_k)
    if t < bite_t - 0.45:
        mood, pose, fx, look, talk = "happy", "point", (), (-1, 0.5), F.talk
    elif t < bite_t:
        mood, pose, fx, look, talk = "chomp", "reach", (), (-1, 0.6), 0
    elif t < bite_t + 0.8:
        mood, pose, fx, look, talk = "chew", "hold", (), (0, 0), 0
    else:
        mood, pose, fx = _reaction(score)
        look, talk = (0, 0), F.talk
    squash = 0.07 * math.sin(t * 22) if bite_t <= t < bite_t + 0.8 else None
    if not sc.get("hide_host"): T.toon(cr, x, top + 150, h, CHIP, t, mood=mood, pose=pose, talk=talk, look=look, facing=-1,
           lean=-0.32 * lean_k, squash=squash, fx=fx, reach=lean_k, seed=2, hat="chef" if sc.get("chef") else None)
    blit(cr, T.kitchen_counter(W, H, k), k)
    sx = lerp(-R * 1.6, ix, ease_back(t / 0.5, 1.4))
    bites = []
    if t >= bite_t:
        if item == "pizza" and lvl == 0: bites = [(sx + R * 0.36, iy - R * 0.25, R * 0.13)]
        elif item == "pizza": bites = [(sx + R * 0.86, iy - R * 0.1, R * 0.17)]
        else: bites = [(sx + R * 0.9, iy - R * 0.1, R * 0.2)]
    if lvl >= 4: T.glow(cr, sx, iy - R * 0.1, R * 1.6, (255, 240, 170), 0.35)
    T.ITEMS.get(item, T.pizza)(cr, sx, iy, R, lvl, t, bites)
    if bites:  # crumbs
        bx, by, _ = bites[0]
        rnd = random.Random(lvl)
        kk = t - bite_t
        for i in range(14):
            vx, vy = rnd.uniform(-60, 260), rnd.uniform(-420, -150)
            px, py = bx + vx * kk, by + vy * kk + 900 * kk * kk
            if py < top + 120:
                T.ellipse(cr, px, py, 9, 6); T.src(cr, GOLD if lvl >= 5 else (230, 170, 80)); cr.fill()
    drop = ease_back((t - 0.1) / 0.45, 1.6)
    price = sc["price"] * ease_out((t - 0.2) / 0.8)
    F.cue(1.0, "cash" if lvl >= 3 else "ding")
    if sc.get("hide_tag"): drop = -1
    tag = money(price) + (" " + sc["label"] if sc.get("label") else "")
    if drop >= 0: T.price_tag(cr, ix if not F.P else W / 2, lerp(-200, H * (0.24 if not F.P else 0.17), drop), tag,
                84 if not F.P else 66, YELLOW if lvl < 5 else GOLD, swing=math.sin(t * 2.4) * 0.05 * math.exp(-t * 0.6))
    if score is not None and t > bite_t + 0.8:  # rating stars above the host
        rt = t - bite_t - 0.8
        sx0, sy0 = (cx0, top + 150 - h - 60) if not F.P else (W * 0.62, top + 150 - h - 110)
        for i in range(5):
            a = ease_back((rt - i * 0.1) / 0.25)
            if a > 0: T.star(cr, sx0 + (i - 2) * 92, sy0, 40 * a, YELLOW, clamp(score / 2 - i))
        if rt > 0.6:
            T.text(cr, sx0, sy0 + 85, f"{score}/10", 60, YELLOW if score >= 7 else WHITE, scale=ease_back((rt - 0.6) / 0.25))
    if score is not None: F.cue(bite_t + 0.8, "twinkle" if score >= 7 else "pop")


def _ring(F):
    return (540, 1130, 430, 320) if F.P else (960, 680, 660, 285)


def scene_circle(F, sc):
    cr, W, H, t, dur, k = F.cr, F.W, F.H, F.t, F.dur, F.ctx.k
    ring = _ring(F)
    blit(cr, T.field_back(W, H, k, ring), k)
    T.clouds(cr, W, H, t)
    cx, cy, rx, ry = ring
    players = sc["players"]
    gone = set(sc.get("gone", []))
    out = sc.get("out", [])
    out_t = {p: dur * (0.25 + 0.5 * i / max(1, len(out))) for i, p in enumerate(out)}
    F.cue(0.0, "whoosh")
    for te in out_t.values(): F.cue(te, "boom")
    n = len(players)
    spots = []
    for i in range(n):
        a = (i + 0.5) * 2 * math.pi / n - math.pi / 2
        spots.append((i, a, cx + rx * 0.8 * math.cos(a), cy + ry * 0.78 * math.sin(a)))
    alive, stamps = 0, []
    hmin, hmax = (190, 260) if F.P else (210, 285)
    poses = ["idle", "idle", "think", "shrug", "idle", "hold"]
    for i, a, x, y in sorted(spots, key=lambda s: s[3]):
        if i in gone: continue
        depth = (y - (cy - ry)) / (2 * ry)
        h = lerp(hmin, hmax, depth)
        p = players[i]
        name = p["name"] if isinstance(p, dict) else p
        col = tuple(p["color"]) if isinstance(p, dict) and "color" in p else PLAYER_COLS[i % 10]
        mood = sc.get("moods", {}).get(str(i), sc.get("mood", "nervous"))
        te = out_t.get(i)
        dirx = 1 if math.cos(a) >= 0 else -1
        if te is not None and t > te:  # eliminated: leap out, then run off screen
            kk = t - te
            stamps.append((x, y - h - 20, kk))
            if kk < 0.45:
                q = kk / 0.45
                T.toon(cr, x + dirx * q * 140, y, h, col, t, mood="shock", pose="flail", lift=math.sin(q * math.pi) * 170,
                       seed=i, facing=dirx, badge=name)
            elif kk < 2.0:
                T.toon(cr, x + dirx * (140 + (kk - 0.45) * 1500), y, h, col, t, mood="sad", pose="flail", walk=3.2,
                       seed=i, facing=dirx, badge=name)
            continue
        alive += 1
        fx = ("sweat",) if mood == "nervous" else ()
        if te is not None and t > te - 0.7: mood, fx = "shock", ("sweat",)
        T.toon(cr, x, y, h, col, t, mood=mood, pose=poses[(i * 7 + len(gone)) % len(poses)],
               look=(-math.cos(a) * 0.7, -0.15), facing=-dirx, seed=i, fx=fx, badge=name)
    for sx, sy, kk in stamps:
        if kk < 1.5:
            cr.save(); cr.translate(sx, sy); cr.rotate(-0.12); s = ease_back(kk / 0.25, 2.5)
            cr.scale(s, s); T.rrect(cr, -110, -48, 220, 96, 18); T.paint(cr, RED, WHITE, 8)
            T.text(cr, 0, 0, "OUT!", 64, WHITE, stroke=None, shadow=False); cr.restore()
    _hud(F, sc, alive)
    if sc.get("banner"):
        T.text(cr, W / 2, H * (0.22 if not F.P else 0.25), sc["banner"], 110, YELLOW, scale=ease_back(t / 0.35), maxw=W * 0.9)


def _hud(F, sc, alive):
    cr, W, H = F.cr, F.W, F.H
    if sc.get("prize"):
        T.rrect(cr, 30, 30, 420, 130, 26); T.paint(cr, (15, 20, 35), alpha=0.6)
        T.text(cr, 60, 62, "PRIZE", 30, (180, 255, 190), anchor="lm", stroke=None, shadow=False)
        T.text(cr, 60, 118, money(sc["prize"]), 66, GREEN, anchor="lm", sw=9)
    if sc.get("clock"):
        x1 = W - 30
        T.rrect(cr, x1 - 360, 30, 360, 130, 26); T.paint(cr, (15, 20, 35), alpha=0.6)
        ccx, ccy = x1 - 290, 95
        cr.arc(ccx, ccy, 40, 0, 2 * math.pi); T.paint(cr, WHITE, INK, 6)
        for ang, ln in ((F.t * 2, 30), (F.t * 0.4, 20)):
            cr.move_to(ccx, ccy); cr.line_to(ccx + ln * math.sin(ang), ccy - ln * math.cos(ang))
            T.src(cr, INK); cr.set_line_width(6); cr.stroke()
        T.text(cr, x1 - 30, 95, sc["clock"], 54, WHITE, anchor="rm", sw=8)
    T.pill(cr, W / 2, 95 if not F.P else 230, f"{alive} LEFT", 46, fill=(200, 30, 50), alpha=0.9)


def scene_counter(F, sc):
    cr, W, H, t = F.cr, F.W, F.H, F.t
    fy = T.studio(cr, W, H, t, sc.get("palette", "green"), spin=0.3)
    F.cue(0.0, "whoosh"); F.cue(min(F.dur - 0.1, 1.6), "cash")
    rows = [6, 5, 4, 3, 2, 1]
    bw = 170 if not F.P else 140
    cxp = W * (0.42 if not F.P else 0.5)
    gy = fy + 60
    j = 0
    for ri, n in enumerate(rows):  # cash bricks drop in and stack into a pyramid
        for c in range(n):
            bt = 0.08 + j * 0.06
            q = ease_back((t - bt) / 0.3)
            if j % 4 == 0: F.cue(bt + 0.25, "pop")
            j += 1
            if q <= 0: continue
            y = gy - ri * bw * 0.3
            T.cash_brick(cr, cxp + (c - (n - 1) / 2) * bw * 1.02, lerp(y - 700, y, q), bw)
    T.money_rain(cr, W, H, t, n=14, seed=5, speed=1.2)
    kk = ease_out(t / 1.6)
    v = lerp(sc.get("start", 0), sc["value"], kk)
    T.text(cr, W / 2 + random.uniform(-6, 6) * (1 - kk), H * (0.2 if not F.P else 0.18), money(v), 200,
           GREEN if kk < 1 else YELLOW, scale=1 + 0.04 * math.sin(t * 8), maxw=W * 0.9)
    if sc.get("label"):
        T.text(cr, W / 2, H * (0.34 if not F.P else 0.27), sc["label"], 80, WHITE, scale=ease_back((t - 0.3) / 0.3), maxw=W * 0.9)
    if not F.P:
        T.toon(cr, W * 0.82, fy + 70, 500, CHIP, t, mood="shock" if F.talk < 0.2 else "happy", pose="present",
               talk=F.talk, look=(-1, 0.2), facing=-1, seed=3, fx=("stars",) if t > 1.6 else ())


def scene_versus(F, sc):
    cr, W, H, t = F.cr, F.W, F.H, F.t
    F.cue(0.0, "whoosh"); F.cue(0.42, "boom")
    L, R_ = sc["left"], sc["right"]
    slide = ease_out(t / 0.4)
    cr.rectangle(0, 0, W, H); T.src(cr, (15, 15, 25)); cr.fill()
    for side, base in ((0, (40, 110, 230)), (1, (225, 40, 60))):
        cr.save()
        if F.P:
            if side == 0: cr.rectangle(0, 0, W, H / 2 * slide)
            else: cr.rectangle(0, H - H / 2 * slide, W, H / 2 * slide)
        else:
            if side == 0:
                cr.move_to(0, 0); cr.line_to(W * 0.56 * slide, 0); cr.line_to(W * 0.44 * slide, H); cr.line_to(0, H)
            else:
                cr.move_to(W, 0); cr.line_to(W - W * 0.44 * slide, 0); cr.line_to(W - W * 0.56 * slide, H); cr.line_to(W, H)
            cr.close_path()
        cr.clip()
        cx = (W * 0.25 if side == 0 else W * 0.75) if not F.P else W / 2
        cy = H * 0.45 if not F.P else (H * 0.25 if side == 0 else H * 0.75)
        cr.rectangle(0, 0, W, H); cr.set_source(T.rad(cx, cy, 0, W * 0.6, [(0, T.lighter(base, 0.35)), (1, T.darker(base, 0.45))])); cr.fill()
        T.glow(cr, cx, cy, 380, WHITE, 0.25)
        cr.restore()
    for side, d in ((0, L), (1, R_)):
        if not F.P:
            cx, gy, ly = (W * 0.25 if side == 0 else W * 0.75), H * 0.74, H * 0.86
            off = (-1 if side == 0 else 1) * (1 - slide) * W * 0.6
        else:
            cx, gy, ly = W / 2, (H * 0.41 if side == 0 else H * 0.9), (H * 0.08 if side == 0 else H * 0.58)
            off = 0
        T.soft_shadow(cr, cx + off, gy + 70, 280, 40, 0.5)
        cr.rectangle(cx + off - 230, gy, 460, 70); cr.set_source(T.lin(cx + off - 230, 0, cx + off + 230, 0, [(0, (60, 60, 80)), (0.5, (120, 120, 145)), (1, (50, 50, 70))])); cr.fill()
        T.ellipse(cr, cx + off, gy + 70, 230, 45); T.src(cr, (45, 45, 60)); cr.fill()
        T.ellipse(cr, cx + off, gy, 230, 45); cr.set_source(T.lin(0, gy - 45, 0, gy + 45, [(0, (200, 200, 220)), (1, (140, 140, 160))])); cr.fill()
        if d.get("item"):
            T.ITEMS[d["item"]](cr, cx + off, gy - 60, 220, d.get("level", 2), t)
        else:
            mood = d.get("mood", "happy")
            pose = {"nervous": "shrug", "happy": "cheer", "angry": "point", "sad": "idle"}.get(mood, "present")
            T.toon(cr, cx + off, gy, 420 if not F.P else 380, tuple(d.get("color", BLUE)), t, mood=mood, pose=pose,
                   facing=1 if side == 0 else -1, look=((1 if side == 0 else -1) * 0.5, 0), seed=side + 4,
                   fx=("sweat",) if mood == "nervous" else ())
        T.text(cr, cx + off, ly, d["label"], 90, YELLOW, maxw=W * (0.42 if not F.P else 0.9))
    vs = ease_back((t - 0.35) / 0.3)
    if vs > 0:
        T.burst(cr, W / 2, H / 2, 160 * vs, YELLOW, rot=t * 0.5)
        T.text(cr, W / 2, H / 2, "VS", 140, RED, scale=vs)
    fl = bump(t, 0.38, 0.6)
    if fl > 0:
        cr.rectangle(0, 0, W, H); T.src(cr, WHITE, fl * 0.6); cr.fill()


def scene_winner(F, sc):
    cr, W, H, t = F.cr, F.W, F.H, F.t
    fy = T.studio(cr, W, H, t, "gold", spin=0.45)
    F.cue(0.0, "boom"); F.cue(0.8, "cash"); F.cue(1.0, "cheer")
    cx = W / 2
    cr.move_to(cx - 90, 0); cr.line_to(cx + 90, 0); cr.line_to(cx + 380, fy + 80); cr.line_to(cx - 380, fy + 80); cr.close_path()
    cr.set_source(T.lin(0, 0, 0, fy, [(0, WHITE, 0.45), (1, WHITE, 0.08)])); cr.fill()
    T.money_rain(cr, W, H, t, n=18, seed=9)
    col = tuple(sc.get("color", BLUE))
    h = 600 if not F.P else 620
    landed = t > 0.8
    lift = abs(math.sin((t - 0.8) * 4.2)) * 120 if landed else 0
    T.toon(cr, cx, fy + 90, h, col, t, mood="laugh" if landed else "shock", pose="cheer" if landed else "idle",
           lift=lift, hat="crown" if landed else None, seed=6, squash=-0.06 if lift > 60 else 0.05 * math.cos(t * 8))
    if not landed:  # crown falls onto the head
        r = h / 2.6
        T._crown(cr, cx, lerp(-150, fy + 90 - 2.42 * r, ease_in(t / 0.8)), r * 0.55)
    T.confetti(cr, W, H, t)
    T.text(cr, W / 2, H * (0.14 if not F.P else 0.12), sc.get("headline", "WINNER!"), 140, YELLOW,
           scale=ease_back(t / 0.35), maxw=W * 0.92)
    if sc.get("name"):
        T.pill(cr, W * 0.2 if not F.P else W / 2, H * 0.55 if not F.P else H * 0.22, sc["name"], 70, alpha=0.85)


def scene_outro(F, sc):
    cr, W, H, t = F.cr, F.W, F.H, F.t
    fy = T.studio(cr, W, H, t, sc.get("palette", "blue"))
    press = 1.25
    F.cue(press, "pop"); F.cue(press + 0.15, "ding")
    bw, bh = (620, 150) if not F.P else (600, 140)
    bx, by = (W * 0.62, H * 0.42) if not F.P else (W / 2, H * 0.36)
    pressed = t > press
    s = ease_back(t / 0.4) * (1 - 0.08 * bump(t, press - 0.05, press + 0.15))
    cr.save(); cr.translate(bx, by); cr.scale(max(s, 0.01), max(s, 0.01))
    T.soft_shadow(cr, 0, bh * 0.6, bw * 0.55, 30, 0.4)
    T.rrect(cr, -bw / 2, -bh / 2, bw, bh, 34)
    base = (130, 130, 140) if pressed else (235, 30, 45)
    cr.set_source(T.lin(0, -bh / 2, 0, bh / 2, [(0, T.lighter(base, 0.25)), (1, T.darker(base, 0.75))]))
    T.paint(cr, None, INK, 8)
    T.text(cr, 0, 0, "SUBSCRIBED" if pressed else "SUBSCRIBE", 74, WHITE, sw=10, maxw=bw * 0.86)
    cr.restore()
    bellx, belly = (bx + bw / 2 + 110, by) if not F.P else (bx, by - 190)
    swing = math.sin((t - press) * 14) * 0.5 * math.exp(-(t - press) * 2.5) if pressed else 0
    cr.save(); cr.translate(bellx, belly - 55); cr.rotate(swing); cr.scale(max(s, 0.01), max(s, 0.01))
    cr.move_to(-55, 75); cr.curve_to(-55, -10, -40, -50, 0, -50); cr.curve_to(40, -50, 55, -10, 55, 75); cr.close_path()
    cr.set_source(T.lin(0, -50, 0, 75, [(0, (255, 235, 120)), (1, (220, 150, 0))])); T.paint(cr, None, INK, 7)
    cr.arc(0, 85, 16, 0, 2 * math.pi); T.paint(cr, (220, 150, 0), INK, 5)
    cr.restore()
    # host walks to the button, presses it, then waves
    h = 540 if not F.P else 520
    r = h / 2.6
    target = bx - bw / 2 - r * 1.9 if not F.P else bx - r * 0.2
    kw = ease_io((t - 0.15) / 0.85)
    x = lerp(W * 0.12 if not F.P else -200, target, kw)
    gy = fy + 70 if not F.P else H * 0.7
    if t < 1.0: pose, reach = "idle", None
    elif t < press + 0.3: pose, reach = "reach", ease_out((t - 1.0) / 0.25)
    else: pose, reach = "wave", None
    T.toon(cr, x, gy, h, CHIP, t, mood="happy", pose=pose, walk=2.4 if kw < 0.98 else 0, reach=reach,
           talk=F.talk if t > press else 0, facing=1, look=(0.6, -0.2) if t < press + 0.3 else (0, 0), seed=7)
    if sc.get("line"):
        T.text(cr, W * 0.6 if not F.P else W / 2, H * (0.62 if not F.P else 0.53), sc["line"], 72, YELLOW, scale=ease_back((t - press - 0.2) / 0.3), maxw=W * (0.62 if not F.P else 0.9))


SCENES = {"hook": scene_hook, "tier": scene_tier, "circle": scene_circle, "counter": scene_counter,
          "versus": scene_versus, "winner": scene_winner, "outro": scene_outro}


def shake_times(sc, dur):
    if sc["type"] == "circle":
        out = sc.get("out", [])
        return [dur * (0.25 + 0.5 * i / max(1, len(out))) for i in range(len(out))]
    return {"versus": [0.42], "winner": [0.0], "counter": [1.6]}.get(sc["type"], [])


# ------------------------------------------------------------------ captions
def caption_chunks(say, dur):
    """Split narration into <=3-word chunks timed by character weight."""
    words = say.split()
    if not words: return []
    weights = [len(w) + 2 + (4 if w[-1] in ".!?," else 0) for w in words]
    total, acc, times = sum(weights), 0.0, []
    for w in weights:
        times.append(acc / total * dur); acc += w
    chunks, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        if len(cur) == 3 or sum(len(words[j]) for j in cur) > 13 or w[-1] in ".!?,":
            chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    return [(times[c[0]], [(words[j].strip(",.").upper(), times[j]) for j in c]) for c in chunks]


def draw_caption(cr, ctx, chunks, t):
    cur = None
    for start, words in chunks:
        if t >= start: cur = (start, words)
    if not cur: return
    start, words = cur
    size = 84 if ctx.portrait else 74
    gap = size * 0.5
    widths = [T.measure(cr, w, size).x_advance for w, _ in words]
    total = sum(widths) + gap * (len(words) - 1)
    sc = min(1.0, ctx.W * 0.9 / total)
    x = ctx.W / 2 - total * sc / 2
    y = ctx.H * (0.8 if ctx.portrait else 0.9)
    pop = ease_back((t - start) / 0.14, 3)
    for (w, wt), ww in zip(words, widths):
        on = t >= wt
        T.text(cr, x + ww * sc / 2, y, w, size, YELLOW if on else WHITE,
               scale=sc * (0.82 + 0.18 * pop) * (1.08 if on and t - wt < 0.25 else 1), sw=size * 0.22)
        x += (ww + gap) * sc


# ------------------------------------------------------------------ frames + parallel segments
def draw_frame(ctx, surf, sc, t, dur, talk=0.0, chunks=(), captions=True, camera=True, punch=True, shakes=(), cues=None):
    cr = cairo.Context(surf)
    cr.scale(ctx.k, ctx.k)
    W, H = ctx.W, ctx.H
    cr.save()
    if camera:  # punch-in on cuts, slow push, shake on impacts
        z = 1 + (0.1 * (1 - ease_out(t / 0.3)) if punch else 0) + 0.035 * clamp(t / max(dur, 0.1))
        sx = sy = 0.0
        for st in shakes:
            if 0 <= t - st < 0.4:
                a = 22 * (1 - (t - st) / 0.4)
                sx += math.sin(t * 90) * a; sy += math.cos(t * 77) * a
        cr.translate(W / 2 + sx, H / 2 + sy); cr.scale(z, z); cr.translate(-W / 2, -H / 2)
    F = Frame(ctx, cr, t, dur, talk)
    F.cues = cues
    SCENES[sc["type"]](F, sc)
    cr.restore()
    T.vignette(cr, W, H, 0.35)
    if camera and punch:
        fl = 1 - clamp(t / 0.12)
        if fl > 0: cr.rectangle(0, 0, W, H); T.src(cr, WHITE, 0.3 * fl); cr.fill()
    if captions: draw_caption(cr, ctx, chunks, t)
    surf.flush()
    return surf


def _render_segment(job):
    ctx = Ctx(job["portrait"], job["k"])
    sc, dur, env = job["scene"], job["dur"], job["env"]
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, *ctx.px)
    slide = job["prev"] is not None and job["prev"][0]["type"] != sc["type"]
    prev = comp = None
    if slide:  # whip-pan from the previous scene's last frame
        psc, pdur = job["prev"]
        prev = cairo.ImageSurface(cairo.FORMAT_ARGB32, *ctx.px)
        draw_frame(ctx, prev, psc, pdur - 1 / FPS, pdur, captions=False, shakes=shake_times(psc, pdur))
        comp = cairo.ImageSurface(cairo.FORMAT_ARGB32, *ctx.px)
    chunks = caption_chunks(sc.get("say", ""), job["speech"])
    shakes = shake_times(sc, dur)
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra",
                           "-s", f"{ctx.px[0]}x{ctx.px[1]}", "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264",
                           "-preset", job["preset"], "-crf", "19", "-pix_fmt", "yuv420p", job["path"]], stdin=subprocess.PIPE)
    cues = []
    TR = 0.3
    for i in range(int(round(dur * FPS))):
        t = i / FPS
        draw_frame(ctx, surf, sc, t, dur, env[min(i, len(env) - 1)] if env else 0.0, chunks,
                   job["captions"], True, punch=not slide, shakes=shakes, cues=cues if i == 0 else None)
        out = surf
        if slide and t < TR:
            e = ease_io(t / TR)
            c = cairo.Context(comp)
            c.set_source_surface(prev, -ctx.px[0] * e, 0); c.paint()
            for j, a in ((2, 0.35), (1, 0.5), (0, 1.0)):  # cheap motion streak
                c.set_source_surface(surf, ctx.px[0] * (1 - e) + j * 40 * ctx.k * (1 - e), 0); c.paint_with_alpha(a)
            comp.flush(); out = comp
        ff.stdin.write(bytes(out.get_data()))
    ff.stdin.close(); ff.wait()
    return cues


# ------------------------------------------------------------------ audio
def _env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / r)


def synth_sfx(kind):
    rng = np.random.default_rng(sum(map(ord, kind)))
    if kind == "whoosh":
        n = int(SR * 0.4); t = np.arange(n) / SR
        noise = rng.standard_normal(n)
        sm = np.convolve(noise, np.ones(6) / 6, "same") - np.convolve(noise, np.ones(48) / 48, "same")
        return sm * np.exp(-((t - 0.17) / 0.09) ** 2) * 0.9
    if kind == "pop":
        n = int(SR * 0.12); t = np.arange(n) / SR
        return np.sin(2 * np.pi * np.cumsum(900 * np.exp(-t * 25) + 300) / SR) * _env(n, 0.002, 0.03)
    if kind == "ding":
        n = int(SR * 0.9); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * 1320 * t) + 0.5 * np.sin(2 * np.pi * 2640 * t)) * _env(n, 0.002, 0.25) * 0.5
    if kind == "cash":
        n = int(SR * 0.8); t = np.arange(n) / SR
        bell = sum(np.sin(2 * np.pi * f * t) for f in (1568, 2093, 2637)) * _env(n, 0.002, 0.18) * 0.35
        return bell + rng.standard_normal(n) * _env(n, 0.001, 0.015) * 0.6
    if kind == "boom":
        n = int(SR * 0.7); t = np.arange(n) / SR
        return (np.sin(2 * np.pi * np.cumsum(120 * np.exp(-t * 6) + 40) / SR) * _env(n, 0.002, 0.25)
                + rng.standard_normal(n) * _env(n, 0.001, 0.04) * 0.5)
    if kind == "chomp":
        n = int(SR * 0.35); out = np.zeros(n)
        for st in (0.0, 0.09, 0.17):
            s, m = int(st * SR), int(SR * 0.07)
            b = np.convolve(rng.standard_normal(m) * _env(m, 0.001, 0.02), np.ones(5) / 5, "same")
            out[s:s + m] += b[: n - s]
        return out * 1.2
    if kind == "twinkle":
        n = int(SR * 0.7); out = np.zeros(n)
        for i, f in enumerate((1760, 2217, 2637, 3520)):
            s = int(i * 0.07 * SR); t = np.arange(n - s) / SR
            out[s:] += np.sin(2 * np.pi * f * t) * _env(n - s, 0.002, 0.15) * 0.3
        return out
    if kind == "cheer":
        n = int(SR * 1.6); t = np.arange(n) / SR
        return np.convolve(rng.standard_normal(n), np.ones(12) / 12, "same") * np.minimum(1, t / 0.2) * np.exp(-t / 0.9) * 1.2
    return np.zeros(1)


def synth_music(dur, bpm=126):
    n = int(dur * SR)
    out = np.zeros(n)
    beat = 60 / bpm
    kick = synth_sfx("boom")[: int(SR * 0.25)] * 0.9
    tt = np.arange(int(SR * 0.05)) / SR
    hat = np.random.default_rng(1).standard_normal(len(tt)) * np.exp(-tt * 90) * 0.25
    roots = [55.0, 55.0, 43.65, 49.0]  # A A F G
    i = 0
    while i * beat * 0.5 < dur:
        s = int(i * beat * 0.5 * SR)
        clip = kick if i % 2 == 0 else hat
        e = min(n, s + len(clip)); out[s:e] += clip[: e - s]
        f = roots[(i // 16) % 4] * (2 if i % 4 == 3 else 1)
        e = min(n, s + int(beat * 0.5 * SR)); tb = np.arange(e - s) / SR
        out[s:e] += np.sign(np.sin(2 * np.pi * f * tb)) * 0.12 * np.exp(-tb * 6)
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
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-ar", str(SR), "-ac", "1", "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                        wav44], check=True)
    with wave.open(wav44) as w:
        return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768


def talk_envelope(audio, nframes):
    """Per-frame mouth openness 0..1 from narration loudness (drives lip-sync)."""
    if not len(audio): return [0.0] * nframes
    spf = SR // FPS
    env = np.array([np.sqrt(np.mean(audio[i * spf:(i + 1) * spf] ** 2)) if i * spf < len(audio) else 0.0
                    for i in range(nframes)])
    peak = np.percentile(env[env > 0], 90) if np.any(env > 0) else 1
    env = np.clip((env / peak - 0.12) / 0.75, 0, 1)
    out, v = [], 0.0
    for e in env:  # fast attack, slower release
        v = e if e > v else v * 0.55 + e * 0.45
        out.append(float(v))
    return out


def write_wav(path, x):
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


# ------------------------------------------------------------------ top level
def plan(episode, voice, cache_dir):
    ls = episode.get("voice", {}).get("length_scale", 0.85)
    out = []
    for sc in episode["scenes"]:
        say = sc.get("say", "")
        audio = tts(say, voice, cache_dir, ls) if (say and voice) else np.zeros(0)
        speech = len(audio) / SR if len(audio) else len(say.split()) * 0.33
        dur = max(sc.get("min", 1.2), speech + sc.get("pad", 0.3))
        if sc["type"] == "tier": dur = max(dur, 3.6)  # room for the bite + rating
        out.append((sc, audio, speech, dur))
    return out


def render(episode, out_path, voice=None, cache_dir=".cache", preview=False, workers=4):
    os.makedirs(cache_dir, exist_ok=True)
    portrait = episode.get("format") == "short"
    k = 0.5 if preview else 1.0
    timeline = plan(episode, voice, cache_dir)
    tmp = tempfile.mkdtemp(prefix="seg_", dir=os.path.dirname(os.path.abspath(out_path)))
    jobs, starts, f0 = [], [], 0
    for i, (sc, audio, speech, dur) in enumerate(timeline):
        n = int(round(dur * FPS))
        starts.append(f0 / FPS); f0 += n
        prev = (timeline[i - 1][0], int(round(timeline[i - 1][3] * FPS)) / FPS) if i else None
        jobs.append({"portrait": portrait, "k": k, "scene": sc, "dur": n / FPS, "speech": speech,
                     "env": talk_envelope(audio, n), "prev": prev, "path": os.path.join(tmp, f"{i:03d}.mp4"),
                     "captions": episode.get("captions", True), "preset": "ultrafast" if preview else "veryfast"})
    with Pool(workers) as pool:
        results = pool.map(_render_segment, jobs, chunksize=1)
    total = f0 / FPS
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        for j in jobs: f.write(f"file '{j['path']}'\n")
    video = os.path.join(tmp, "video.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", video], check=True)
    n = int((total + 1) * SR)
    vt, sfx = np.zeros(n), np.zeros(n)
    for (sc, audio, speech, dur), st in zip(timeline, starts):
        s = int(st * SR); vt[s:s + len(audio)] += audio[: n - s]
    for cues, st in zip(results, starts):
        for lt, kind in cues:
            clip = synth_sfx(kind); s = int((st + lt) * SR); e = min(n, s + len(clip))
            if s < n: sfx[s:e] += clip[: e - s]
    music = synth_music(total + 1)[:n] * episode.get("music_volume", 0.35)
    duck = 1 - 0.5 * np.clip(np.convolve(np.abs(vt), np.ones(4410) / 4410, "same") * 8, 0, 1)
    mixed = vt + music * duck + sfx * 0.35
    mixed /= max(1.0, np.abs(mixed).max() / 0.95)
    wav = os.path.join(tmp, "audio.wav")
    write_wav(wav, mixed[: int(total * SR)])
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", video, "-i", wav, "-c:v", "copy", "-c:a", "aac",
                    "-b:a", "192k", "-shortest", out_path], check=True)
    for f in os.listdir(tmp): os.remove(os.path.join(tmp, f))
    os.rmdir(tmp)
    return total


def surface_to_pil(surf):
    w, h = surf.get_width(), surf.get_height()
    a = np.ndarray((h, surf.get_stride() // 4, 4), np.uint8, buffer=surf.get_data())[:, :w]
    return Image.fromarray(a[..., [2, 1, 0]].copy())


def still(episode, i, t, k=0.5):
    ctx = Ctx(episode.get("format") == "short", k)
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, *ctx.px)
    draw_frame(ctx, surf, episode["scenes"][i], t, max(4.0, t + 1), talk=0.5, captions=False, camera=False)
    return surface_to_pil(surf)


def thumbnail(episode, out_path):
    """1280x720 (or 720x1280) thumbnail: a scene frame + giant text, reaction face, arrow."""
    th = episode.get("thumbnail", {})
    portrait = episode.get("format") == "short"
    ctx = Ctx(portrait, (720 if portrait else 1280) / (1080 if portrait else 1920))
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, *ctx.px)
    sc = dict(episode["scenes"][th.get("scene", 0)]); sc.update(th.get("override", {}))
    draw_frame(ctx, surf, sc, th.get("t", 2.0), 6.0, captions=False, camera=False)
    cr = cairo.Context(surf); cr.scale(ctx.k, ctx.k)
    W, H = ctx.W, ctx.H
    if th.get("mascot"):
        mx, my, mh, mood = th["mascot"]
        T.toon(cr, W * mx, H * my, mh, CHIP, 0.5, mood=mood, pose="shrug", look=(-1, -0.3), facing=-1, fx=("sweat",))
    if th.get("arrow"):
        ax, ay, bx, by = (v * (W if j % 2 == 0 else H) for j, v in enumerate(th["arrow"]))
        cr.set_line_cap(cairo.LINE_CAP_ROUND)
        cr.move_to(ax, ay); cr.line_to(bx, by); T.src(cr, INK); cr.set_line_width(60); cr.stroke()
        cr.move_to(ax, ay); cr.line_to(bx, by); T.src(cr, RED); cr.set_line_width(40); cr.stroke()
        a, L = math.atan2(by - ay, bx - ax), 110
        cr.move_to(bx + L * 0.5 * math.cos(a), by + L * 0.5 * math.sin(a))
        cr.line_to(bx + L * math.cos(a + 2.4), by + L * math.sin(a + 2.4)); cr.line_to(bx + L * math.cos(a - 2.4), by + L * math.sin(a - 2.4))
        cr.close_path(); T.paint(cr, RED, INK, 8)
    for i, ln in enumerate(th.get("text", [])):
        T.text(cr, W * th.get("x", 0.5), H * (th.get("y", 0.14) + i * 0.17), ln, 190, [YELLOW, WHITE][i % 2], sw=34, maxw=W * 0.9)
    surf.flush()
    img = ImageEnhance.Contrast(ImageEnhance.Color(surface_to_pil(surf)).enhance(1.25)).enhance(1.08)
    img.save(out_path)
