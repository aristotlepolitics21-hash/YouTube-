"""Shots for episode 3, The Lamp in the Window. One function per shot id in story.json:
f(M, T, L) stages the shot on the set lit by LIGHT[shot id] (default "day"); it lasts T seconds and
L holds each narration line's start time within the shot."""
import math

import bpy
from acting import (B, F1, Figure, box, breathe, cam, climber, exposure, face, fr, keyed, knead, lamp_out, lamp_to_window,
                    sit, soldier_kit, stand, walk)

LIGHT = {"l1_room_lamp": "night", "l2_window": "night", "l3_bakery": "dawn", "l4_room_dark": "night",
         "l5_street": "night_dark", "l6_stairs": "night_dark", "l7_reunion": "night_dark"}
WIN = (B.W0 + 0.55, 2.15)  # where the mother stands at the window


def mother(M, loc, rot=0.0):
    return Figure("livia", loc, M, "tunic_plum", rot_z=rot)


def soldier(M, loc, rot=0.0):
    fig = Figure("gaius", loc, M, "tunic_umber", rot_z=rot)
    soldier_kit(fig, M)
    return fig


def at_window(m, frame, reach=0):
    stand(m, frame, spine=(-8, 0, 0), neck=(-12, 0, 0), shoulderR=(-35 - reach, 0, 6), elbowR=(-40 - reach / 2, 0, 0),
          shoulderL=(-20, 0, 10), elbowL=(-60, 0, 0))


def l1_room_lamp(M, T, L):
    lamp_to_window()
    m = mother(M, (WIN[0], WIN[1], F1 + 0.02), rot=-math.pi / 2)
    at_window(m, fr(0), reach=30)
    at_window(m, fr(2.5), reach=25)
    at_window(m, fr(T), reach=0)
    cam([(0, (-1.0, -2.6, F1 + 1.45)), (T, (-1.9, -1.4, F1 + 1.35))],
        [(0, (-3.5, 2.15, F1 + 1.15)), (T, (-3.6, 2.15, F1 + 1.15))], 30, 3.2)


def l2_window(M, T, L):
    # from outside, in the night air: the one lit window, and her shape behind the lamp
    lamp_to_window()
    m = mother(M, (WIN[0] + 0.15, WIN[1] + 0.1, F1 + 0.02), rot=-math.pi / 2)
    at_window(m, fr(0))
    breathe(m, 0, T, spine=8, bow=12, period=3.6)
    cam([(0, (-8.5, 0.6, F1 + 0.9)), (T, (-5.9, 1.75, F1 + 1.4))],
        [(0, (-4.0, 2.15, F1 + 1.35)), (T, (-4.0, 2.15, F1 + 1.4))], 40, 2.8)


def l3_bakery(M, T, L):
    # the baker slips her a flask of oil, and waves away the coin
    baker = Figure("marcus", (-1.9, 2.75, 0.02), M, "tunic_red")
    m = mother(M, (-3.0, -1.6, 0.02))
    knead(baker, 0, 4.5)
    exposure([(1, 0.1)])
    walk(m, (-3.0, -1.6, 0.02), (-1.85, 1.2, 0.02), 0.0, 4.2, stride=0.5)
    keyed(m.root, [(fr(4.9), (0, 0, math.pi))], "rotation_euler")
    stand(m, fr(4.9), neck=(-6, 0, 0))
    flask = B.lathe("oil flask", [(0, 0), (0.05, 0), (0.06, 0.06), (0.03, 0.13), (0.02, 0.18), (0.03, 0.19), (0, 0.19)],
                    M["clay_pale"], (-2.3, 2.15, 1.0))
    stand(baker, fr(5.0), spine=(-8, 0, 0))
    stand(baker, fr(6.5), spine=(-14, 0, 0), shoulderR=(-70, 0, 8), elbowR=(-15, 0, 0))
    keyed(flask, [(fr(5.2), (-2.3, 2.15, 1.0)), (fr(6.5), (-2.0, 1.95, 1.08)), (fr(7.6), (-1.9, 1.75, 1.08))])
    # she offers a coin; he shakes his head
    stand(m, fr(7.0), shoulderR=(-60, 0, 0), elbowR=(-15, 0, 0), shoulderL=(-45, 0, 0), elbowL=(-40, 0, 0))
    stand(m, fr(T), shoulderR=(-20, 0, -6), elbowR=(-60, 0, 0), shoulderL=(-45, 0, 0), elbowL=(-50, 0, 0))
    for k, z in enumerate((-12, 12, -12, 0)):
        stand(baker, fr(L[1] + 1.4 + k * 0.35), spine=(-8, 0, 0), neck=(0, 0, z),
              shoulderR=(-20, 0, -6), elbowR=(-20, 0, 0))
    keyed(flask, [(fr(8.4), (-1.75, 1.45, 0.95)), (fr(T), (-1.75, 1.45, 0.95))])
    cam([(0, (1.0, -2.8, 1.55)), (T, (0.3, -1.5, 1.5))],
        [(0, (-2.2, 1.8, 1.2)), (T, (-1.9, 1.85, 1.25))], 34, 3.5)


def l4_room_dark(M, T, L):
    # the flame gutters and dies; she sits on the bed, face in her hands
    lamp_to_window()
    lamp_out(fr(0.3), fr(3.8))
    bpy.data.objects["bounce fill"].data.energy = 70  # moonlight through the open front
    exposure([(fr(3.4), 0.9), (fr(T), 2.0)])  # eyes adjusting to the dark
    m = Figure("livia", (-1.05, 3.45, F1 + 0.5 - 0.95 + 0.02), M, "tunic_plum")
    sit(m, None, bow=35, spine=32)
    m.pose(None, shoulderL=(-75, 0, 18), elbowL=(-125, 0, 20), shoulderR=(-75, 0, -18), elbowR=(-125, 0, -20))
    for k in range(int(T / 0.9) + 1):  # quiet sobs
        m.pose(fr(k * 0.9), spine=(-32 - (4 if k % 2 else 0), 0, 0), neck=(-35 - (3 if k % 2 else 0), 0, 0))
    cam([(0, (-2.6, -1.0, F1 + 1.5)), (T, (-1.6, 0.6, F1 + 1.3))],
        [(0, (-2.6, 2.6, F1 + 1.1)), (3.8, (-1.6, 3.1, F1 + 0.9)), (T, (-1.1, 3.35, F1 + 0.85))], 30, 3)


def l5_street(M, T, L):
    # a soldier comes down the dark street, stops, and looks up
    g = soldier(M, (5.0, -3.4, 0.02))
    walk(g, (5.0, -3.4, 0.02), (0.2, -2.3, 0.02), 0.0, 5.0, stride=0.65)
    keyed(g.root, [(fr(5.8), (0, 0, math.radians(200)))], "rotation_euler")
    stand(g, fr(5.8), neck=(0, 0, 0))
    stand(g, fr(L[1] + 0.3), spine=(4, 0, 0), neck=(34, 0, 0))
    stand(g, fr(T), spine=(5, 0, 0), neck=(38, 0, 0))
    cam([(0, (1.6, -8.0, 0.9)), (T, (1.0, -6.6, 1.0))],
        [(0, (2.5, -2.5, 1.6)), (5.5, (0.4, -1.5, 2.2)), (T, (-0.6, 0.6, 3.6))], 22, 5.6)


def l6_stairs(M, T, L):
    g = soldier(M, (0, 0, 0), rot=math.pi)
    climber(g, 0.0, T - 0.3, 0, B.STEPS + 3)
    head = B.empty("gaius head", (0, 0, 1.2), g.root)
    cam([(0, (3.0, 4.25, B.TOP - 0.2)), (T, (2.95, 4.15, B.TOP - 0.1))], head, 17, 8)


def l7_reunion(M, T, L):
    lamp_to_window()
    m = Figure("livia", (-1.05, 3.45, F1 + 0.5 - 0.95 + 0.02), M, "tunic_plum")
    sit(m, None, bow=30, spine=28)
    g = soldier(M, (2.3, 4.78, F1 + 0.02))
    walk(g, (2.3, 4.78, F1 + 0.02), (0.2, 4.8, F1 + 0.02), 0.0, 2.2)
    walk(g, (0.2, 4.8, F1 + 0.02), (-0.75, 2.65, F1 + 0.02), 2.2, 4.4)
    # "Mother." She lifts her head... and stands
    sit(m, fr(L[0] + 0.3), bow=30, spine=28)
    sit(m, fr(L[0] + 1.2), bow=-5, spine=10)
    face(m, -0.75, 2.65)
    m.root.keyframe_insert("rotation_euler", frame=fr(L[0] + 1.2))
    keyed(m.root, [(fr(L[0] + 1.2), (-1.05, 3.45, F1 + 0.5 - 0.95 + 0.02)), (fr(L[1] - 0.2), (-1.0, 3.2, F1 + 0.02))])
    stand(m, fr(L[1] - 0.2), neck=(4, 0, 0))
    keyed(g.root, [(fr(4.4), (0, 0, math.atan2(-0.3, -0.8)))], "rotation_euler")
    stand(g, fr(4.4))
    # they hold each other
    hug = dict(spine=(-8, 0, 0), neck=(-10, 0, 0), shoulderL=(-75, -10, 0), elbowL=(-70, 0, 30),
               shoulderR=(-75, 10, 0), elbowR=(-70, 0, -30))
    keyed(m.root, [(fr(L[1] + 1.4), (-0.95, 3.0, F1 + 0.02))])
    keyed(g.root, [(fr(L[1] + 0.6), (-0.75, 2.65, F1 + 0.02)), (fr(L[1] + 1.4), (-0.85, 2.72, F1 + 0.02))])
    stand(m, fr(L[1] + 1.4), **hug)
    stand(g, fr(L[1] + 1.4), **hug)
    for k in range(int((T - L[1] - 1.4) / 1.6)):
        f = fr(L[1] + 1.4 + (k + 1) * 1.6)
        stand(m, f, **{**hug, "spine": (-8 - (3 if k % 2 else 0), 0, 0)})
    cam([(0, (0.6, -2.2, F1 + 1.5)), (L[1], (-0.1, -1.6, F1 + 1.4)), (T, (-0.3, -4.6, F1 + 0.9))],
        [(0, (0.3, 3.4, F1 + 1.1)), (L[1], (-0.85, 2.9, F1 + 1.2)), (T, (-0.9, 2.9, F1 + 1.1))], 30, 3.5)
