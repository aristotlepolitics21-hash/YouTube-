"""Stage and render "The Loaf on the Stairs" in the Roman insula set.

Each shot is built from scratch on the shared set (../blender/build_insula.py), with its own cast,
lighting and camera move, and lasts exactly as long as its narration (build/timeline.json from
narrate.py). Frames go to STORY_DIR/build/frames/<shot id>/.

  python story_render.py -- STORY_DIR [--res 720] [--samples 12] [--fps 15] [--only s1_room_night]
                                       [--stills 0.1,0.5,0.95]  # check frames
Works with `blender -b -P story_render.py -- ...` or the bpy wheel.
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "blender"))
import bpy  # noqa: E402
import build_insula as B  # noqa: E402
from build_insula import F1, Figure, box, ellipsoid, loaf  # noqa: E402

FPS = 15


def fr(sec):
    return 1 + round(sec * FPS)


# ------------------------------------------------------------------------ set and light
def base_set(light, res, samples):
    B.reset()
    M = B.build_materials()
    B.build_house(M)
    B.build_stairs(M)
    B.build_bakery(M)
    B.build_room(M)
    B.build_world()
    B.setup_render(res, samples)
    sc = bpy.context.scene
    sc.render.fps = FPS
    sc.cycles.max_bounces = 4
    build_oven(M, light)
    O = bpy.data.objects
    sun, world = O["sun"].data, sc.world.node_tree.nodes["Background"]
    beam, lamp, fill = O["stair sunbeam"].data, O["lamp light"].data, O["bounce fill"].data
    if light == "night":  # moonlight, the oil lamp carries the room
        sun.energy, sun.color = 0.35, (0.55, 0.65, 1.0)
        world.inputs["Color"].default_value = (0.08, 0.1, 0.18, 1)
        world.inputs["Strength"].default_value = 0.25
        beam.energy, beam.color = 600, (0.55, 0.65, 1.0)
        fill.energy, fill.color = 25, (0.6, 0.7, 1.0)
        lamp.energy = 70
        sc.view_settings.exposure = 0.9
    elif light == "dawn":  # first light: low, orange, and the oven glowing
        sun.energy, sun.color = 1.4, (1.0, 0.62, 0.38)
        O["sun"].rotation_euler = (math.radians(76), 0, math.radians(-115))
        world.inputs["Color"].default_value = (0.35, 0.3, 0.32, 1)
        world.inputs["Strength"].default_value = 0.3
        beam.energy, beam.color = 3500, (1.0, 0.6, 0.35)
        fill.energy = 60
        lamp.energy = 35
        sc.view_settings.exposure = 0.6
    return M


def build_oven(M, light):
    """A domed bread oven in the back corner of the bakery, its mouth lit at dawn."""
    if "grain jar" in bpy.data.objects:
        bpy.data.objects.remove(bpy.data.objects["grain jar"])
    box("oven base", -3.95, 3.05, 0, -2.75, 4.35, 0.8, M["brick_xz"])
    ellipsoid("oven dome", (0.62, 0.66, 0.55), M["brick_xz"], (-3.35, 3.7, 0.8))
    glow = 6 if light == "dawn" else 1.5
    hot = B.flat("oven fire", (1, 0.45, 0.15), 0.5, emit=(1, 0.42, 0.12), strength=glow)
    mouth = ellipsoid("oven mouth", (0.24, 0.05, 0.17), hot, (-3.35, 3.06, 0.95))
    mouth.scale.z = 1.0
    li = bpy.data.lights.new("oven glow", "POINT")
    li.energy, li.color, li.shadow_soft_size = (220 if light == "dawn" else 30), (1, 0.5, 0.2), 0.2
    B.link(bpy.data.objects.new("oven glow", li)).location = (-3.35, 2.7, 1.0)


# --------------------------------------------------------------------------- acting
def old_man(M, name="lucius", loc=(-1.05, 3.45), seated=True):
    fig = Figure(name, (loc[0], loc[1], 0.02), M, "tunic_brown")
    if seated:
        fig.root.location.z = F1 + 0.5 - 0.95 + 0.02
        sit(fig, None)
    return fig


def sit(fig, frame, bow=16, spine=22, hands_out=0):
    fig.pose(frame, spine=(-spine, 0, 0), neck=(-bow, 0, 0),
             hipL=(-88, 0, -6), kneeL=(95, 0, 0), ankleL=(-5, 0, 0),
             hipR=(-88, 0, 6), kneeR=(95, 0, 0), ankleR=(-5, 0, 0),
             shoulderL=(-34 - hands_out, 0, 8), elbowL=(-52, 0, 30),
             shoulderR=(-34 - hands_out, 0, -8), elbowR=(-52, 0, -30))


def breathe(fig, t0, t1, spine=22, bow=16, period=3.0):
    t = t0
    while t <= t1:
        k = (t - t0) / period % 1 < 0.5
        fig.pose(fr(t), spine=(-spine - (2 if k else 0), 0, 0), neck=(-bow - (2 if k else 0), 0, 0))
        t += period / 2


def knead(fig, t0, t1):
    t, k = t0, 0
    while t <= t1:
        fig.pose(fr(t), spine=(-14 - 6 * k, 0, 0), neck=(-18, 0, 0),
                 shoulderL=(-48 - 10 * k, 0, 10), elbowL=(-38 + 8 * k, 0, 0),
                 shoulderR=(-52 + 8 * k, 0, -10), elbowR=(-34 - 6 * k, 0, 0),
                 wristL=(-10, 0, 0), wristR=(-10, 0, 0))
        t, k = t + 0.67, 1 - k


def stand(fig, frame, **extra):
    base = dict(spine=(0, 0, 0), neck=(0, 0, 0), hipL=(0, 0, 0), kneeL=(0, 0, 0), hipR=(0, 0, 0), kneeR=(0, 0, 0),
                shoulderL=(-5, 0, 6), elbowL=(-12, 0, 0), shoulderR=(-5, 0, -6), elbowR=(-12, 0, 0))
    base.update(extra)
    fig.pose(frame, **base)


def walk(fig, p0, p1, t0, t1, stride=0.6, hunch=0, keep_arms=False):
    """Walk the root from p0 to p1 (x, y, z), facing the way it goes."""
    dist = math.dist(p0[:2], p1[:2])
    n = max(2, round(dist / (stride / 2)))
    fig.root.rotation_euler.z = math.atan2(p1[0] - p0[0], -(p1[1] - p0[1]))  # figures face -Y at 0
    for t in (t0, t1):
        fig.root.keyframe_insert("rotation_euler", frame=fr(t))
    for k in range(n + 1):
        u = k / n
        t = t0 + (t1 - t0) * u
        fig.root.location = [a + (b - a) * u for a, b in zip(p0, p1)]
        fig.root.keyframe_insert("location", frame=fr(t))
        a = 0 if k in (0, n) else (1 if k % 2 else -1)
        rot = dict(spine=(-hunch, 0, 0), hipL=(-22 * a, 0, 0), kneeL=(18 if a > 0 else 6, 0, 0),
                   hipR=(22 * a, 0, 0), kneeR=(6 if a > 0 else 18, 0, 0))
        if not keep_arms:
            rot.update(shoulderL=(16 * a, 0, 6), elbowL=(-12, 0, 0), shoulderR=(-16 * a, 0, -6), elbowR=(-12, 0, 0))
        fig.pose(fr(t), **rot)


def climb(fig, t0, t1):
    S, X = B.STEPS, (B.STAIR_X0 + B.STAIR_X1) / 2
    total = S + 3
    for k in range(total + 1):
        t = t0 + (t1 - t0) * k / total
        i = k - 2
        y = -0.4 + k * B.TREAD if i < 0 else B.STAIR_Y0 + i * B.TREAD + 0.1
        z = 0.02 + max(0, i + 1) * B.RISE
        fig.root.location = (X, y, z)
        fig.root.keyframe_insert("location", frame=fr(t))
        a = 1 if k % 2 else -1
        fig.pose(fr(t), spine=(-12, 0, 0), neck=(-10, 0, 0),
                 hipL=(-30 * a - 5, 0, 0), kneeL=(30 if a > 0 else 10, 0, 0),
                 hipR=(30 * a - 5, 0, 0), kneeR=(10 if a > 0 else 30, 0, 0),
                 shoulderL=(-15 * a, 0, 8), elbowL=(-20, 0, 0),
                 shoulderR=(-55, 0, -8), elbowR=(-60, 0, 0))  # cradling the loaf


def in_hand(ob, fig, joint="wristR", offset=(0, -0.03, -0.13)):
    ob.parent = fig.j[joint]
    ob.location = offset
    return ob


def keyed(ob, frames_locs, path="location"):
    for f, v in frames_locs:
        setattr(ob, path, v)
        ob.keyframe_insert(path, frame=f)


def cam(path, target, lens, fstop=4.0):
    """path/target: [(seconds, (x, y, z)), ...]"""
    c = B.camera("cam", [(fr(t), p) for t, p in path],
                 target if isinstance(target, bpy.types.Object) else [(fr(t), p) for t, p in target], lens, fstop)
    bpy.context.scene.camera = c
    return c


# ---------------------------------------------------------------------------- shots
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


def render_shot(shot, a, out_root, stills):
    T = shot["dur"]
    M = base_set(LIGHT.get(shot["id"], "day"), a.res, a.samples)
    globals()[shot["id"]](M, T)
    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = 1, fr(T)
    out = os.path.join(out_root, shot["id"])
    os.makedirs(out, exist_ok=True)
    frames = sorted({fr(T * u) for u in stills}) if stills else range(1, fr(T) + 1)
    for f in frames:
        path = os.path.join(out, f"{f:04d}.png")
        if os.path.exists(path) and not stills:
            continue  # resumable
        sc.frame_set(f)
        sc.render.filepath = path
        bpy.ops.render.render(write_still=True)
    print(f"done {shot['id']} frames {len(frames)}", flush=True)


def main(argv):
    p = argparse.ArgumentParser()
    p.add_argument("story")
    p.add_argument("--res", type=int, default=720)
    p.add_argument("--samples", type=int, default=12)
    p.add_argument("--only")
    p.add_argument("--stills", nargs="?", const="0.1,0.5,0.95", help="check frames, as fractions of each shot")
    a = p.parse_args(argv)
    tl = json.load(open(os.path.join(a.story, "build", "timeline.json")))
    root = os.path.join(os.path.abspath(a.story), "build", "stills" if a.stills else "frames")
    for shot in tl["shots"]:
        if not a.only or shot["id"] in a.only.split(","):
            render_shot(shot, a, root, [float(u) for u in a.stills.split(",")] if a.stills else None)


if __name__ == "__main__":
    main(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
