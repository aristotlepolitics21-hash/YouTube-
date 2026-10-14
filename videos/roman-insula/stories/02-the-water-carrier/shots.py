"""Shots for episode 2, The Water Carrier. One function per shot id in story.json:
f(M, T, L) stages the shot on the set lit by LIGHT[shot id] (default "day"); it lasts T seconds and
L holds each narration line's start time within the shot."""
import math
import random

from acting import (B, F1, Figure, box, breathe, cam, carry_amphora, climber, face, fr, keyed, show, sit, stand,
                    walk)

LIGHT = {"w1_stairs_dawn": "dawn", "w2_stairs_up": "dawn", "w4_room_night": "night", "w5_bundle": "night",
         "w7_stairs_end": "dawn"}


def tullia(M, loc=(0, 0, 0.02), rot=0.0):
    return Figure("tullia", loc, M, "tunic_olive", rot_z=rot)


def widow(M, loc=(-1.05, 3.45)):
    fig = Figure("julia", (loc[0], loc[1], F1 + 0.5 - 0.95 + 0.02), M, "tunic_slate")
    sit(fig, None, bow=22, spine=26)
    return fig


def w1_stairs_dawn(M, T, L):
    # from the foot of the stair: she starts up the first flight, away from us
    t = tullia(M, rot=math.pi)
    carry_amphora(t, M)
    climber(t, 0.0, T + 1.5, 0, 12, arms="amphora")
    head = B.empty("tullia head", (0, 0, 1.3), t.root)
    cam([(0, (3.55, -3.4, 1.25)), (T, (3.4, -1.9, 1.7))], head, 24, 5.6)


def w2_stairs_up(M, T, L):
    # top-down, as she comes up the last steps toward us
    t = tullia(M, rot=math.pi)
    carry_amphora(t, M)
    climber(t, 0.0, T - 0.4, 6, B.STEPS + 3, arms="amphora")
    head = B.empty("tullia head", (0, 0, 1.2), t.root)
    cam([(0, (3.0, 4.25, B.TOP - 0.2)), (T, (2.95, 4.15, B.TOP - 0.1))], head, 17, 8)


def w3_room_day(M, T, L):
    julia = widow(M)
    breathe(julia, 0, L[1] - 0.6, spine=26, bow=22)
    # Tullia comes in from the landing with the jar, and sets it down by the bed
    t = tullia(M, (2.3, 4.78, F1 + 0.02))
    jar = carry_amphora(t, M)
    stand(t, fr(0), shoulderL=(-150, 0, 35), elbowL=(-95, 0, 0))
    walk(t, (2.3, 4.78, F1 + 0.02), (0.15, 4.8, F1 + 0.02), 0.3, 3.3, keep_arms=True)
    walk(t, (0.15, 4.8, F1 + 0.02), (0.05, 2.75, F1 + 0.02), 3.3, 5.8, keep_arms=True)
    for k in (0.3, 5.8):
        stand(t, fr(k), shoulderL=(-150, 0, 35), elbowL=(-95, 0, 0))
    keyed(t.root, [(fr(6.4), (0, 0, math.atan2(-1.1, -0.7)))], "rotation_euler")
    stand(t, fr(6.4), shoulderL=(-150, 0, 35), elbowL=(-95, 0, 0))
    # she crouches and lowers it; the carried jar is swapped for one on the floor as it lands
    stand(t, fr(7.6), spine=(-45, 0, 0), hipL=(-60, 0, 0), kneeL=(80, 0, 0), hipR=(-60, 0, 0), kneeR=(80, 0, 0),
          shoulderL=(-70, 0, 10), elbowL=(-20, 0, 0), shoulderR=(-60, 0, -10), elbowR=(-20, 0, 0))
    keyed(t.root, [(fr(6.4), (0.05, 2.75, F1 + 0.02)), (fr(7.6), (0.05, 2.75, F1 - 0.3)),
                   (fr(9.0), (0.05, 2.75, F1 - 0.3)), (fr(10.2), (0.05, 2.75, F1 + 0.02))])
    stand(t, fr(9.0), spine=(-45, 0, 0), hipL=(-60, 0, 0), kneeL=(80, 0, 0), hipR=(-60, 0, 0), kneeR=(80, 0, 0),
          shoulderL=(-70, 0, 10), elbowL=(-20, 0, 0), shoulderR=(-60, 0, -10), elbowR=(-20, 0, 0))
    stand(t, fr(10.2), neck=(-10, 0, 0))
    floor_jar = B.amphora("jar on floor", (-0.35, 2.4, F1 + 0.01), M, 1.0)
    show(jar, None, fr(7.6))
    show(floor_jar, fr(7.6))
    # "You're late." Julia lifts her head toward her, without a smile
    julia.pose(fr(L[1] - 0.4), spine=(-18, 0, 0), neck=(4, 0, 32))
    julia.pose(fr(L[2] + 1.0), spine=(-20, 0, 0), neck=(0, 0, 28))
    cam([(0, (0.1, -3.4, F1 + 1.55)), (T, (-0.6, -1.9, F1 + 1.3))],
        [(0, (0.2, 3.6, F1 + 0.9)), (6.0, (-0.4, 3.0, F1 + 0.8)), (T, (-0.55, 3.0, F1 + 0.8))], 26, 4)


def w4_room_night(M, T, L):
    # the bed is empty. The landlord gives Tullia a small bundle
    t = tullia(M, (-0.15, 2.45, F1 + 0.02))
    land = Figure("landlord", (0.95, 3.05, F1 + 0.02), M, "tunic_brown")
    face(t, 0.95, 3.05)
    face(land, -0.15, 2.45)
    stand(t, fr(0), spine=(-6, 0, 0), neck=(-14, 0, 0))
    stand(land, fr(0), spine=(-10, 0, 0), neck=(-8, 0, 0), shoulderR=(-30, 0, -6), elbowR=(-40, 0, 0))
    bundle = box("bundle", -0.09, -0.07, -0.05, 0.09, 0.07, 0.05, M["curtain"], bevel=0.03)
    keyed(bundle, [(fr(0), (0.78, 2.92, F1 + 0.95)), (fr(L[2] - 0.6), (0.78, 2.92, F1 + 0.95)),
                   (fr(L[2] + 0.8), (0.42, 2.72, F1 + 1.08)), (fr(L[2] + 2.2), (0.3, 2.65, F1 + 1.05)),
                   (fr(T), (0.25, 2.62, F1 + 1.02))])
    stand(land, fr(L[2] - 0.6), spine=(-10, 0, 0), neck=(-8, 0, 0), shoulderR=(-30, 0, -6), elbowR=(-40, 0, 0))
    stand(land, fr(L[2] + 0.8), spine=(-14, 0, 0), neck=(-12, 0, 0), shoulderR=(-70, 0, 0), elbowR=(-10, 0, 0))
    stand(land, fr(T), spine=(-14, 0, 0), neck=(-16, 0, 0), shoulderR=(-15, 0, -6), elbowR=(-20, 0, 0))
    stand(t, fr(L[2] + 1.6), spine=(-10, 0, 0), neck=(-24, 0, 0),
          shoulderL=(-55, 0, -10), elbowL=(-45, 0, 0), shoulderR=(-55, 0, 10), elbowR=(-45, 0, 0))
    stand(t, fr(T), spine=(-14, 0, 0), neck=(-30, 0, 0),
          shoulderL=(-45, 0, -12), elbowL=(-60, 0, 0), shoulderR=(-45, 0, 12), elbowR=(-60, 0, 0))
    cam([(0, (-0.9, -2.8, F1 + 1.5)), (T, (-0.2, -1.4, F1 + 1.35))],
        [(0, (0.3, 2.8, F1 + 1.0)), (T, (0.35, 2.75, F1 + 1.05))], 30, 3.2)


def w5_bundle(M, T, L):
    # Tullia alone on the bed, the cloth open in her lap: coins and a shard of pottery
    t = Figure("tullia", (-1.05, 3.45, F1 + 0.5 - 0.95 + 0.02), M, "tunic_olive")
    sit(t, None, bow=30, spine=24, hands_out=6)
    breathe(t, 0, T, spine=24, bow=30, period=3.4)
    z = F1 + 0.66
    box("open cloth", -1.32, 2.9, z, -0.78, 3.25, z + 0.008, M["curtain"])
    rnd = random.Random(3)
    for i in range(14):
        c = B.lathe(f"coin {i}", [(0, 0), (0.016, 0), (0.016, 0.004), (0, 0.004)], M["coin"],
                    (-1.05 + rnd.uniform(-0.2, 0.2), 3.07 + rnd.uniform(-0.1, 0.1), z + 0.01 + i * 0.001), 16)
        c.rotation_euler = (rnd.uniform(-0.2, 0.2), rnd.uniform(-0.2, 0.2), 0)
    shard = box("shard", -0.06, -0.04, 0, 0.06, 0.04, 0.006, M["terracotta"])
    shard.location, shard.rotation_euler.z = (-0.92, 3.0, z + 0.012), 0.5
    cam([(0, (-0.45, 0.9, F1 + 1.05)), (T, (-0.8, 1.75, F1 + 1.0))],
        [(0, (-1.05, 3.1, F1 + 0.85)), (T, (-1.05, 3.05, F1 + 0.75))], 40, 2.4)


def w7_stairs_end(M, T, L):
    # the empty stair in the morning light... then, far below, Tullia starts up again
    t = tullia(M, rot=math.pi)
    carry_amphora(t, M)
    climber(t, T * 0.45, T + 3.0, 0, 9, arms="amphora")
    show(t.root, fr(T * 0.45))
    cam([(0, (3.0, 4.3, B.TOP - 0.6)), (T, (3.0, 4.3, B.TOP + 0.2))],
        [(0, (3.15, 2.0, 1.8)), (T, (3.15, 0.8, 0.6))], 17, 8)
