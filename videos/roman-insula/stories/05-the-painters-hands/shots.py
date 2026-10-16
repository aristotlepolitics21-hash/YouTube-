"""Shots for episode 5, The Painter's Hands (Deir el-Medina, about 1200 BC), in the "egypt" dressing.
f(M, T, L): lit by LIGHT[shot id] (default "day"), T seconds long, L = each narration line's start."""
import math

import bpy
from acting import (B, F1, Figure, box, breathe, broad_collar, cam, face, fr, hair, keyed, long_skirt, show, sit,
                    stand, walk)
from sets import work_lamp

SET = "egypt"
LIGHT = {"e1_lamp": "night", "e3_night_practice": "night", "e4_dawn": "dawn", "e6_hands": "dawn"}
WALL_Y = B.D - 0.42  # where a painter stands at the practice wall


def paneb(M, loc=(0, 0, 0.02), rot=0.0):
    p = Figure("paneb", loc, M, "linen", rot_z=rot)
    hair(p, M, "wig_short")
    broad_collar(p, M)
    return p


def meret(M, loc=(0, 0, 0.02), rot=0.0):
    m = Figure("meret", loc, M, "linen", rot_z=rot)
    hair(m, M, "wig_long")
    long_skirt(m, M, "linen", 0.2)
    broad_collar(m, M)
    return m


def painting(fig, t0, t1, shake=0.0, period=0.9):
    """Brush hand up at the wall, drawing slow strokes; shake > 0 makes the hand tremble."""
    t, k = t0, 0
    while t <= t1:
        a = 1 if k % 2 else -1
        fig.pose(fr(t), shoulderR=(-115 + 6 * a, 0, -8 + 10 * a), elbowR=(-35, 0, 0), wristR=(-20, 0, 0),
                 shoulderL=(-40, 0, 10), elbowL=(-70, 0, 0), neck=(6, 0, 0))
        if shake:
            for j in range(1, 4):  # small fast tremors between the strokes
                fig.pose(fr(t + period * j / 4), shoulderR=(-115 + shake * (1 if j % 2 else -1), 0, -8),
                         elbowR=(-35 + shake, 0, 0))
        t, k = t + period, k + 1


def e1_lamp(M, T, L):
    # night upstairs: Paneb holds a papyrus close to the lamp, squinting
    p = paneb(M, (-1.2, 3.12, F1 + 0.32 - 0.95 + 0.02))
    face(p, -2.45, 2.55)
    sit(p, None, bow=10, spine=30)
    pap = box("papyrus", -0.14, -0.005, -0.1, 0.14, 0.005, 0.1, B.flat("papyrus", (0.85, 0.78, 0.6), 0.9))
    pap.parent = p.j["wristL"]
    pap.location, pap.rotation_euler = (0.1, -0.05, -0.1), (0, 0, math.pi / 2)
    for k, (s, n) in enumerate(((-28, 6), (-34, 2), (-36, 4), (-32, 0))):
        p.pose(fr(k * T / 3), spine=(s, 0, 0), neck=(n, 0, 0), shoulderL=(-85, 0, -20), elbowL=(-70, 0, 0),
               shoulderR=(-80, 0, 20), elbowR=(-75, 0, 0))
    cam([(0, (-0.3, -2.6, F1 + 1.4)), (T, (-1.0, -1.1, F1 + 1.15))],
        [(0, (-1.7, 2.9, F1 + 0.9)), (T, (-1.75, 2.85, F1 + 0.95))], 30, 3)


def e2_wall(M, T, L):
    p = paneb(M, (-2.1, WALL_Y, 0.02), rot=math.pi)
    stand(p, fr(0))
    painting(p, 0.2, T, shake=5)
    m = meret(M, (1.25, 3.95, 0.02))
    face(m, -2.1, WALL_Y)
    stand(m, None, neck=(-6, 0, 0), shoulderL=(-10, 0, 6), elbowL=(-30, 0, 0))
    m.pose(fr(L[1]), neck=(-6, 0, 0))
    m.pose(fr(L[1] + 1.2), neck=(-14, 0, 8), spine=(-4, 0, 0))
    cam([(0, (-0.4, -3.6, 1.5)), (T, (-0.9, -2.2, 1.45))],
        [(0, (-1.0, 3.9, 1.35)), (T, (-1.5, 4.0, 1.4))], 26, 4)


def e3_night_practice(M, T, L):
    m = meret(M, (-1.0, WALL_Y, 0.02), rot=math.pi)
    stand(m, fr(0))
    painting(m, 0.3, T, period=1.1)
    keyed(m.root, [(fr(0), (-1.0, WALL_Y, 0.02)), (fr(T), (-1.6, WALL_Y, 0.02))])  # working along the wall
    work_lamp(M, (-0.6, 4.2, 0.36), 55)
    box("lamp stand", -0.7, 4.1, 0.02, -0.5, 4.3, 0.36, M["beam"])
    cam([(0, (-0.5, -2.2, 1.45)), (T, (-1.1, -0.6, 1.4))],
        [(0, (-1.0, 4.4, 1.4)), (T, (-1.5, 4.5, 1.45))], 30, 3)


def e4_dawn(M, T, L):
    m = meret(M, (-1.6, 2.0, 0.02))
    basket = B.lathe("pigment basket", [(0, 0), (0.15, 0), (0.18, 0.14), (0.16, 0.14), (0, 0.02)], M["reed"],
                     (0, 0, 0), 24, m.j["wristR"])
    basket.location = (0, 0, -0.12)
    walk(m, (-1.6, 2.0, 0.02), (-2.2, -0.8, 0.02), 0.2, 3.6, keep_arms=True)
    walk(m, (-2.2, -0.8, 0.02), (-7.0, -1.8, 0.02), 3.6, T + 1.0, keep_arms=True)
    stand(m, fr(0.2), shoulderR=(-10, 0, -8), elbowR=(-15, 0, 0))
    cam([(0, (2.2, -7.5, 1.0)), (T, (1.0, -6.4, 1.1))],
        [(0, (-1.8, 0.6, 1.3)), (3.6, (-2.4, -0.8, 1.2)), (T, (-5.0, -1.6, 1.2))], 26, 5.6)


def e5_praise(M, T, L):
    mas = Figure("master", (-1.7, -0.75, 0.02), M, "linen")
    hair(mas, M, "wig_short")
    broad_collar(mas, M)
    p = paneb(M, (-1.7, 0.45, 0.02), rot=math.pi)
    face(mas, -1.7, 0.45)
    face(p, -1.7, -0.75)
    stand(mas, None, shoulderL=(-30, 0, 10), elbowL=(-60, 0, 0))
    stand(p, fr(0), neck=(-4, 0, 0))
    for k, t in enumerate((L[1] - 0.2, L[1] + 0.8, L[1] + 1.8)):  # the master's open-handed praise
        stand(mas, fr(t), shoulderL=(-30, 0, 10), elbowL=(-60, 0, 0), shoulderR=(-60 - 10 * (k % 2), 0, -25),
              elbowR=(-20, 0, 0))
    # "...and Paneb understood": he turns, slowly, to look back at the wall
    u = L[1] + 2.2
    stand(p, fr(u), neck=(-4, 0, 0))
    stand(p, fr(u + 2.0), neck=(-10, 0, 70), spine=(-4, 0, 20))
    stand(p, fr(T), neck=(-12, 0, 75), spine=(-6, 0, 22))
    cam([(0, (1.4, -2.6, 1.55)), (T, (0.8, -1.4, 1.5))],
        [(0, (-1.7, -0.1, 1.45)), (T, (-1.9, 0.6, 1.4))], 32, 3.5)


def e6_hands(M, T, L):
    m = meret(M, (-1.5, WALL_Y, 0.02), rot=math.pi)
    stand(m, fr(0))
    painting(m, 0.2, L[0] + 2.0, period=1.1)
    p = paneb(M, (1.2, 3.6, 0.02))
    walk(p, (1.2, 3.6, 0.02), (-0.85, 4.05, 0.02), 0.4, 4.2, stride=0.5)
    # she turns to him; he takes her hands
    meet = L[0] + 2.6
    keyed(m.root, [(fr(meet - 0.8), (0, 0, math.pi)), (fr(meet), (0, 0, math.pi / 2 - 0.2))], "rotation_euler")
    keyed(p.root, [(fr(4.2), (0, 0, p.root.rotation_euler.z)), (fr(meet), (0, 0, -math.pi / 2 - 0.2))],
          "rotation_euler")
    keyed(p.root, [(fr(meet), (-1.0, 4.08, 0.02))])
    hold = dict(shoulderL=(-45, 0, -8), elbowL=(-50, 0, 0), shoulderR=(-45, 0, 8), elbowR=(-50, 0, 0))
    stand(m, fr(meet), neck=(4, 0, 0), **hold)
    stand(p, fr(meet), neck=(-12, 0, 0), spine=(-6, 0, 0), **hold)
    stand(m, fr(T), neck=(8, 0, 0), **hold)
    stand(p, fr(T), neck=(-16, 0, 0), spine=(-8, 0, 0), **hold)
    cam([(0, (-0.4, -2.8, 1.55)), (T, (-1.0, 0.4, 1.5))],
        [(0, (-1.0, 4.2, 1.35)), (T, (-1.25, 4.1, 1.45))], 30, 3)


def e7_pullback(M, T, L):
    m = meret(M, (-1.5, WALL_Y, 0.02), rot=math.pi)
    stand(m, fr(0))
    painting(m, 0.0, T, period=1.2)
    p = paneb(M, (-2.75, 2.9, 0.32 - 0.95 + 0.02))
    face(p, -1.5, WALL_Y)
    sit(p, None, bow=-4, spine=10)
    breathe(p, 0, T, spine=10, bow=-4, period=3.4)
    cam([(0, (-1.6, 1.6, 1.5)), (T * 0.35, (-1.4, -1.5, 1.5)), (T, (-0.3, -10.5, 3.4))],
        [(0, (-1.6, 4.4, 1.4)), (T * 0.35, (-1.6, 4.0, 1.4)), (T, (-0.6, 2.5, 3.1))], 26, 6)
