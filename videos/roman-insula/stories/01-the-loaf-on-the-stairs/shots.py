"""Shots for episode 1, The Loaf on the Stairs. One function per shot id in story.json:
f(M, T) stages the shot on the set built with LIGHT[shot id] (default "day") and lasts T seconds."""
import math

from acting import B, F1, Figure, box, cam, climb, fr, in_hand, keyed, knead, loaf, old_man, sit, stand, walk, breathe

def s1_room_night(M, T):
    lucius = old_man(M)
    breathe(lucius, 0, T, spine=26, bow=24)
    cam([(0, (-0.1, -3.8, F1 + 1.6)), (T, (-0.75, -1.9, F1 + 1.25))],
        [(0, (-1.2, 3.3, F1 + 0.85)), (T, (-1.15, 3.4, F1 + 0.95))], 26, 3.5)


def s2_bakery_dawn(M, T):
    baker = Figure("baker", (-1.9, 2.75, 0.02), M, "tunic_red")
    knead(baker, 0, 5.2)
    # he turns, takes one loaf and sets it aside on a cloth at the end of the counter
    aside = loaf("the loaf", (-1.9, 2.12, 1.04), M, 0.1)
    box("cloth", -0.75, 1.95, 1.0, -0.2, 2.35, 1.012, M["curtain"])
    keyed(baker.root, [(fr(5.6), (0, 0, 0)), (fr(6.6), (0, 0, math.radians(38))),
                       (fr(8.6), (0, 0, math.radians(38))), (fr(9.6), (0, 0, 0))], "rotation_euler")
    baker.pose(fr(5.8), spine=(-18, 0, 0), shoulderR=(-55, 0, -10), elbowR=(-30, 0, 0))
    baker.pose(fr(6.8), spine=(-10, 0, 0), shoulderR=(-62, 0, 0), elbowR=(-10, 0, 0))
    baker.pose(fr(8.4), spine=(-12, 0, 0), shoulderR=(-58, 0, 0), elbowR=(-15, 0, 0))
    baker.pose(fr(9.4), spine=(-14, 0, 0), shoulderR=(-30, 0, -8), elbowR=(-20, 0, 0))
    keyed(aside, [(fr(5.8), (-1.9, 2.12, 1.04)), (fr(6.3), (-1.75, 2.12, 1.16)),
                  (fr(7.6), (-0.5, 2.12, 1.16)), (fr(8.2), (-0.48, 2.14, 1.06))])
    cam([(0, (-3.1, -4.3, 1.45)), (T, (-1.9, -2.9, 1.55))],
        [(0, (-1.7, 2.4, 1.2)), (6, (-1.4, 2.3, 1.15)), (T, (-1.0, 2.2, 1.15))], 30, 4.0)


def s3_stairs(M, T):
    baker = Figure("baker", (0, 0, 0), M, "tunic_red", rot_z=math.pi)
    in_hand(loaf("the loaf", (0, 0, 0), M, 0.1), baker)
    climb(baker, 0.0, T - 0.6)
    head = B.empty("baker head", (0, 0, 1.2), baker.root)
    cam([(0, (3.0, 4.25, B.TOP - 0.2)), (T, (2.95, 4.15, B.TOP - 0.1))], head, 17, 8)


def s4_room_morning(M, T):
    lucius = old_man(M)
    loaf("the loaf", (-2.17, 1.4, F1 + 0.58), M, 0.1)
    breathe(lucius, 0, 2.5, spine=22, bow=16)
    # he lifts his head and looks across at the bread on the stool
    lucius.pose(fr(3.2), spine=(-18, 0, 0), neck=(-6, 0, -28))
    lucius.pose(fr(6.5), spine=(-20, 0, 0), neck=(-10, 0, -34))
    lucius.pose(fr(T), spine=(-24, 0, 0), neck=(-14, 0, -30))
    cam([(0, (-0.5, -3.0, F1 + 1.45)), (T, (-1.5, -1.6, F1 + 1.2))],
        [(0, (-1.2, 3.2, F1 + 0.85)), (T, (-1.7, 2.3, F1 + 0.7))], 28, 3.2)


def s5_flashback(M, T):
    keeper = Figure("keeper", (-1.5, 2.75, 0.02), M, "tunic_brown")
    boy = Figure("boy", (-1.45, 1.6, 0.02), M, "tunic_umber", rot_z=math.pi)
    boy.root.scale = (0.62,) * 3
    young = Figure("young lucius", (-4.6, -1.0, 0.02), M, "tunic_navy", sleeve_stripe="tunic_red")
    grabbed = loaf("grabbed loaf", (-1.45, 2.12, 1.04), M, 0.1)
    # the boy reaches up over the counter for a loaf
    stand(boy, fr(0))
    stand(boy, fr(2.5), shoulderR=(-150, 0, 0), elbowR=(-10, 0, 0), spine=(-8, 0, 0))
    stand(boy, fr(4.0), shoulderR=(-120, 0, 0), elbowR=(-60, 0, 0), spine=(4, 0, 0))
    keyed(grabbed, [(fr(3.0), (-1.45, 2.12, 1.04)), (fr(4.0), (-1.43, 1.95, 1.0))])
    # the shopkeeper catches his arm
    knead(keeper, 0, 3.0)
    stand(keeper, fr(4.2), spine=(-25, 0, 0), shoulderR=(-85, 0, 10), elbowR=(-5, 0, 0), neck=(-20, 0, 0))
    stand(keeper, fr(10.0), spine=(-25, 0, 0), shoulderR=(-85, 0, 10), elbowR=(-5, 0, 0), neck=(-20, 0, 0))
    stand(boy, fr(5.5), shoulderR=(-100, 0, 0), elbowR=(-40, 0, 0), spine=(8, 0, 0), neck=(18, 0, 0))
    stand(boy, fr(10.0), shoulderR=(-95, 0, 0), elbowR=(-40, 0, 0), spine=(10, 0, 0), neck=(-25, 0, 0))
    # a stranger walks in, lays a hand on the boy's shoulder and pays
    stand(young, fr(0))
    walk(young, (-4.6, -1.0, 0.02), (-3.0, -0.6, 0.02), 7.0, 9.0)  # in from the street, off-frame left
    walk(young, (-3.0, -0.6, 0.02), (-2.3, 1.4, 0.02), 9.0, 11.6)
    keyed(young.root, [(fr(12.3), (0, 0, math.pi))], "rotation_euler")
    stand(young, fr(12.3), shoulderL=(-50, 55, 0), elbowL=(-15, 0, 0), shoulderR=(-75, 0, 0), elbowR=(-10, 0, 0))
    stand(young, fr(15.5), shoulderL=(-50, 55, 0), elbowL=(-15, 0, 0), shoulderR=(-20, 0, -6), elbowR=(-15, 0, 0))
    stand(young, fr(T), shoulderL=(-48, 55, 0), elbowL=(-18, 0, 0), shoulderR=(-15, 0, -6), elbowR=(-15, 0, 0))
    stand(keeper, fr(13.5), spine=(-10, 0, 0), shoulderR=(-60, 0, 0), elbowR=(-20, 0, 0), neck=(-8, 0, 0))
    stand(keeper, fr(T), spine=(-8, 0, 0), shoulderR=(-20, 0, -6), elbowR=(-20, 0, 0), neck=(-6, 0, 0))
    stand(boy, fr(13.0), shoulderR=(-40, 0, 0), elbowR=(-80, 0, 0), spine=(0, 0, 0), neck=(15, 0, 0))
    stand(boy, fr(T), shoulderR=(-40, 0, 0), elbowR=(-85, 0, 0), spine=(0, 0, 0), neck=(20, 0, 0))
    keyed(grabbed, [(fr(12.5), (-1.43, 1.95, 1.0)), (fr(13.5), (-1.47, 1.5, 0.66))])
    cam([(0, (-3.3, -4.6, 1.3)), (T, (-2.2, -2.9, 1.25))],
        [(0, (-1.6, 2.1, 1.05)), (T, (-1.6, 1.8, 0.95))], 30, 4.0)


def s6_bakery_meet(M, T):
    baker = Figure("baker", (-1.9, 2.75, 0.02), M, "tunic_red")
    lucius = Figure("lucius", (-3.0, -1.6, 0.02), M, "tunic_brown")
    gift = loaf("the loaf", (-1.6, 2.12, 1.04), M, 0.1)
    knead(baker, 0, 4.0)
    walk(lucius, (-3.0, -1.6, 0.02), (-1.75, 1.2, 0.02), 0.0, 5.0, stride=0.45, hunch=14)
    keyed(lucius.root, [(fr(5.8), (0, 0, math.pi))], "rotation_euler")
    stand(lucius, fr(5.8), spine=(-14, 0, 0), neck=(-6, 0, 0))
    # the baker straightens, looks up, and holds the loaf out across the counter
    stand(baker, fr(5.0), spine=(-6, 0, 0), neck=(4, 0, 0))
    stand(baker, fr(7.5), spine=(-12, 0, 0), neck=(-2, 0, 0),
          shoulderL=(-70, 0, -12), elbowL=(-15, 0, 0), shoulderR=(-70, 0, 12), elbowR=(-15, 0, 0))
    keyed(gift, [(fr(5.5), (-1.6, 2.12, 1.04)), (fr(7.5), (-1.9, 2.25, 1.3))])
    # Lucius reaches out, then rests his hand on the baker's arm
    stand(lucius, fr(8.5), spine=(-14, 0, 0), neck=(-6, 0, 0))
    stand(lucius, fr(10.0), spine=(-18, 0, 0), neck=(-2, 0, 0), shoulderR=(-70, 0, 0), elbowR=(-10, 0, 0))
    stand(lucius, fr(T), spine=(-20, 0, 0), neck=(-2, 0, 0), shoulderR=(-72, 0, 4), elbowR=(-8, 0, 0))
    cam([(0, (1.0, -2.8, 1.55)), (T, (0.3, -1.4, 1.5))],
        [(0, (-2.2, 1.8, 1.2)), (T, (-1.85, 1.9, 1.3))], 35, 3.5)


def s7_room_end(M, T):
    lucius = old_man(M)
    sit(lucius, None, bow=10, spine=14, hands_out=12)
    in_hand(loaf("the loaf", (0, 0, 0), M, 0.1), lucius, "wristL", (0.1, -0.05, -0.12))
    breathe(lucius, 0, T, spine=14, bow=10, period=3.5)
    baker = Figure("baker", (-1.9, 2.75, 0.02), M, "tunic_red")
    knead(baker, 0, T)
    cam([(0, (-0.9, -1.9, F1 + 1.15)), (T * 0.35, (-0.6, -4.0, F1 + 0.9)), (T, (0.0, -10.5, 3.6))],
        [(0, (-1.1, 3.3, F1 + 0.75)), (T * 0.35, (-1.0, 3.0, F1 + 0.4)), (T, (-0.6, 2.5, 3.2))], 26, 6)


LIGHT = {"s1_room_night": "night", "s2_bakery_dawn": "dawn", "s3_stairs": "dawn"}
