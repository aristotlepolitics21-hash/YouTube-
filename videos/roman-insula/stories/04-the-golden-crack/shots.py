"""Shots for episode 4, The Golden Crack (Kyoto, about 1820), in the "edo" dressing of the house.
f(M, T, L): lit by LIGHT[shot id] (default "day"), T seconds long, L = each narration line's start."""
import math

import bpy
from acting import (B, F1, Figure, box, breathe, cam, face, fr, hair, keyed, kneel, long_skirt, sash, show, sit,
                    stand, wide_sleeves)
from sets import kintsugi_bowl, work_lamp

SET = "edo"
LIGHT = {"k2_alcove": "dawn", "k5_night_work": "night", "k6_morning": "dawn"}
SHELF = (0.17, 4.84, F1 + 1.04)  # where the bowl lives, on the alcove shelf
STOOL_Z = 0.34 - 0.95 + 0.02


def takeo(M, loc=(0, 0, 0.02), rot=0.0):
    t = Figure("takeo", loc, M, "kimono_slate", rot_z=rot)
    hair(t, M, "topknot")
    long_skirt(t, M, "kimono_slate")
    sash(t, M, "obi_dark")
    wide_sleeves(t, M, "kimono_slate")
    return t


def hana(M, loc=(0, 0, 0.02), rot=0.0):
    h = Figure("hana", loc, M, "kimono_rose", rot_z=rot)
    h.root.scale = (0.68,) * 3
    hair(h, M, "bun")
    long_skirt(h, M, "kimono_rose", 0.22)
    sash(h, M, "obi_gold")
    wide_sleeves(h, M, "kimono_rose")
    return h


def at_wheel(t, T):
    """Takeo on his stool, hands cupped round the clay, the wheel turning."""
    t.root.location = (-1.6, 2.98, STOOL_Z)
    sit(t, None, bow=24, spine=24)
    for k in range(int(T / 1.2) + 2):
        d = 3 if k % 2 else 0
        t.pose(fr(k * 1.2), shoulderL=(-58 - d, 0, 12), elbowL=(-40, 0, 25), shoulderR=(-58 + d, 0, -12),
               elbowR=(-40, 0, -25), spine=(-24 - d, 0, 0))
    wheel = bpy.data.objects["kick wheel"]
    keyed(wheel, [(1, (0, 0, 0)), (fr(T), (0, 0, T * 4.0))], "rotation_euler")
    for fc in wheel.animation_data.action.fcurves if hasattr(wheel.animation_data.action, "fcurves") else []:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"


def k1_workshop(M, T, L):
    t = takeo(M)
    at_wheel(t, T)
    h = hana(M, (-0.75, 2.45, 0.02))
    face(h, -1.6, 2.3)
    stand(h, None, neck=(-10, 0, 0), shoulderL=(-20, 0, 0), elbowL=(-70, 0, 0), shoulderR=(-20, 0, 0),
          elbowR=(-70, 0, 0))
    breathe(h, 0, T, spine=2, bow=10, period=2.6)
    cam([(0, (-2.9, -4.4, 1.35)), (T, (-1.9, -2.6, 1.3))],
        [(0, (-1.5, 2.6, 0.85)), (T, (-1.35, 2.5, 0.8))], 30, 3.5)


def k2_alcove(M, T, L):
    # evening: Takeo kneels before the alcove with her bowl, and drinks slowly
    t = takeo(M, (-0.55, 3.75, 0))
    kneel(t, None, bow=14)
    bowl = kintsugi_bowl("her bowl", (0, 0, 0), M, gold=False, parent=t.j["wristL"])
    bowl.location, bowl.rotation_euler = (0.06, -0.04, -0.12), (math.pi / 2, 0, 0)
    t.pose(fr(0), shoulderL=(-40, 0, -10), elbowL=(-95, 0, 30), shoulderR=(-40, 0, 10), elbowR=(-95, 0, -30))
    t.pose(fr(L[1] + 0.3), shoulderL=(-40, 0, -10), elbowL=(-95, 0, 30), shoulderR=(-40, 0, 10), elbowR=(-95, 0, -30),
           neck=(-14, 0, 0))
    t.pose(fr(L[1] + 2.0), shoulderL=(-62, 0, -12), elbowL=(-118, 0, 30), shoulderR=(-62, 0, 12),
           elbowR=(-118, 0, -30), neck=(4, 0, 0))
    t.pose(fr(T), shoulderL=(-60, 0, -12), elbowL=(-116, 0, 30), shoulderR=(-60, 0, 12), elbowR=(-116, 0, -30),
           neck=(6, 0, 0))
    cam([(0, (-0.2, -2.9, F1 + 1.35)), (T, (-0.45, -1.3, F1 + 1.05))],
        [(0, (-0.4, 4.1, F1 + 0.95)), (T, (-0.5, 3.8, F1 + 0.75))], 30, 3)


def k3_slip(M, T, L):
    h = hana(M, (0.17, 4.25, 0.02 + F1), rot=math.pi)
    bowl = kintsugi_bowl("her bowl", SHELF, M, gold=False)
    stand(h, fr(0), neck=(14, 0, 0))
    stand(h, fr(L[0] + 1.6), neck=(20, 0, 0), spine=(4, 0, 0), shoulderL=(-160, 0, 8), elbowL=(-20, 0, 0),
          shoulderR=(-160, 0, -8), elbowR=(-20, 0, 0))
    lift = L[1] - 0.6
    keyed(bowl, [(fr(lift - 0.8), SHELF), (fr(lift), (0.17, 4.6, F1 + 1.22))])
    stand(h, fr(lift), neck=(24, 0, 0), spine=(2, 0, 0), shoulderL=(-165, 0, 10), elbowL=(-25, 0, 0),
          shoulderR=(-165, 0, -10), elbowR=(-25, 0, 0))
    # "...and it slipped": it tips out of her hands and falls to the floor, in pieces
    fall = L[1] + 0.25
    keyed(bowl, [(fr(fall), (0.25, 4.45, F1 + 1.05)), (fr(fall + 0.45), (0.3, 4.15, F1 + 0.05))])
    keyed(bowl, [(fr(lift), (0, 0, 0)), (fr(fall + 0.45), (2.2, 0.6, 0))], "rotation_euler")
    show(bowl, None, fr(fall + 0.47))
    shards = []
    for i, (dx, dy, rz) in enumerate(((0, 0, 0), (0.14, -0.1, 1.1), (-0.12, 0.05, 2.3), (0.05, 0.16, 4.0),
                                      (-0.2, -0.12, 5.1))):
        s = box(f"shard {i}", -0.05, -0.03, 0, 0.05, 0.03, 0.012, bowl.data.materials[0])
        s.location, s.rotation_euler = (0.3 + dx, 4.15 + dy, F1 + 0.01), (0.3, 0.2, rz)
        show(s, fr(fall + 0.47))
        shards.append(s)
    stand(h, fr(fall + 0.6), neck=(-30, 0, 0), spine=(-10, 0, 0), shoulderL=(-90, 0, 20), elbowL=(-60, 0, 0),
          shoulderR=(-90, 0, -20), elbowR=(-60, 0, 0))
    stand(h, fr(T), neck=(-40, 0, 0), spine=(-14, 0, 0), shoulderL=(-60, 0, 25), elbowL=(-90, 0, 0),
          shoulderR=(-60, 0, -25), elbowR=(-90, 0, 0))
    cam([(0, (-0.3, -1.7, F1 + 1.2)), (T, (0.0, 0.6, F1 + 1.0))],
        [(0, (0.17, 4.6, F1 + 0.9)), (L[1], (0.2, 4.5, F1 + 0.8)), (T, (0.25, 4.2, F1 + 0.35))], 32, 3)


def k4_tears(M, T, L):
    h = hana(M, (-3.0, 1.45, 0))
    kneel(h, None, bow=40, scale=0.68)
    face(h, -1.0, -1.0)
    h.pose(None, shoulderL=(-75, 0, 18), elbowL=(-125, 0, 20), shoulderR=(-75, 0, -18), elbowR=(-125, 0, -20))
    for k in range(int(T / 0.7) + 1):  # sobs
        h.pose(fr(k * 0.7), spine=(-14 - (6 if k % 2 else 0), 0, 0), neck=(-40 - (4 if k % 2 else 0), 0, 0))
    mat = B.new_mat("shard glaze")[0]
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.1, 0.06, 0.04, 1)
    for i, (dx, dy) in enumerate(((0, 0), (0.12, 0.05), (-0.08, 0.1))):
        box(f"shard {i}", -0.04, -0.03, 0, 0.04, 0.03, 0.012, mat).location = (-2.75 + dx, 1.15 + dy, F1 + 0.01)
    cam([(0, (-1.6, -1.2, F1 + 1.3)), (T, (-2.2, 0.0, F1 + 1.05))],
        [(0, (-2.9, 1.35, F1 + 0.45)), (T, (-2.9, 1.4, F1 + 0.4))], 34, 2.6)


def k5_night_work(M, T, L):
    # the workshop at night: Takeo kneels at his bench, mending the bowl in lacquer and gold
    t = takeo(M, (-2.9, 4.1, 0.02))
    kneel(t, None, floor=0.02, bow=30)
    work_lamp(M, (-3.45, 3.35, 0.47), 60)
    kintsugi_bowl("mending bowl", (-2.85, 3.42, 0.47), M, gold=True)
    for k in range(int(T / 0.8) + 2):
        d = 4 if k % 2 else -2
        t.pose(fr(k * 0.8), spine=(-22, 0, 0), shoulderL=(-62 + d, 0, 14), elbowL=(-55, 0, 30),
               shoulderR=(-60 - d, 0, -14), elbowR=(-58, 0, -30))
    bpy.data.objects["chochin light"].data.energy = 25
    cam([(0, (-2.4, -2.6, 1.15)), (T, (-2.75, -0.9, 0.95))],
        [(0, (-2.9, 3.6, 0.6)), (T, (-2.88, 3.5, 0.55))], 34, 2.4)


def k6_morning(M, T, L):
    # the mended bowl back on its shelf; the two of them kneel before it
    kintsugi_bowl("her bowl mended", SHELF, M, gold=True)
    t = takeo(M, (-0.35, 3.55, 0), rot=math.pi)
    kneel(t, None, bow=-4)
    h = hana(M, (0.45, 3.6, 0), rot=math.pi)
    kneel(h, None, bow=-8, scale=0.68)
    say = L[1]
    t.pose(fr(say - 0.3), neck=(-4, 0, 0))
    t.pose(fr(say + 0.6), neck=(-14, 0, -40), spine=(-6, 0, -6))  # he turns to her
    h.pose(fr(say + 1.2), neck=(-8, 0, 0))
    h.pose(fr(say + 2.0), neck=(-4, 0, 34))  # and she looks up at him
    t.pose(fr(L[2]), neck=(-14, 0, -40), spine=(-6, 0, -6), shoulderL=(-28, 0, 6), elbowL=(-55, 0, 0))
    t.pose(fr(L[2] + 1.2), neck=(-12, 0, -36), spine=(-8, 0, -8), shoulderL=(-55, 0, 55), elbowL=(-40, 0, 0))
    cam([(0, (0.05, 0.2, F1 + 1.45)), (T, (0.05, 1.45, F1 + 1.3))],
        [(0, (0.15, 4.6, F1 + 0.95)), (T, (0.15, 4.7, F1 + 1.05))], 30, 4)


def k7_pullback(M, T, L):
    kintsugi_bowl("her bowl mended", SHELF, M, gold=True)
    h = hana(M, (0.17, 4.0, 0), rot=math.pi)
    kneel(h, None, bow=-10, scale=0.68)
    t = takeo(M)
    at_wheel(t, T)
    cam([(0, (0.17, 3.3, F1 + 1.2)), (T * 0.35, (0.0, 0.5, F1 + 1.0)), (T, (-0.3, -10.5, 3.4))],
        [(0, (0.17, 4.84, F1 + 1.06)), (T * 0.35, (0.1, 4.6, F1 + 0.9)), (T, (-0.6, 2.5, 3.1))], 26, 6)
