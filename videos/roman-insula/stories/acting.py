"""Shared staging library for the insula stories: the set with its lighting moods, and the acting
moves (sit, walk, climb, knead...) that each story's shots.py strings together.
Times are in seconds; fr() turns them into frames at FPS."""
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
    sc.render.use_persistent_data = True  # keep the BVH between frames
    sc.cycles.adaptive_threshold = 0.05
    build_oven(M, light)
    add_costumes(M)
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
    elif light == "night_dark":  # moonlight only: the lamp is out
        sun.energy, sun.color = 0.5, (0.55, 0.65, 1.0)
        world.inputs["Color"].default_value = (0.07, 0.09, 0.17, 1)
        world.inputs["Strength"].default_value = 0.3
        beam.energy, beam.color = 2600, (0.55, 0.65, 1.0)
        fill.energy, fill.color = 90, (0.6, 0.7, 1.0)
        lamp_out(0)
        sc.view_settings.exposure = 1.8
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




# ------------------------------------------------------------------- costumes and props
def add_costumes(M):
    M["tunic_olive"] = B.cloth_mat("tunic olive", (0.22, 0.24, 0.12))
    M["tunic_slate"] = B.cloth_mat("tunic slate", (0.2, 0.22, 0.26))
    M["tunic_plum"] = B.cloth_mat("tunic plum", (0.25, 0.1, 0.14))
    M["cloak_red"] = B.cloth_mat("cloak red", (0.45, 0.04, 0.03))
    M["bronze"] = B.flat("bronze", (0.55, 0.38, 0.15), 0.35)
    M["bronze"].node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.9
    M["coin"] = B.flat("silver coin", (0.75, 0.74, 0.7), 0.3)
    M["coin"].node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 1.0


def soldier_kit(fig, M):
    """Bronze helmet with a crest, and a red cloak hanging from the shoulders."""
    h = ellipsoid(f"{fig.name} helmet", (0.105, 0.12, 0.09), M["bronze"], (0, -0.005, 0.2), fig.neck)
    box(f"{fig.name} crest", -0.015, -0.1, 0.27, 0.015, 0.12, 0.33, M["cloak_red"]).parent = fig.neck
    box(f"{fig.name} brim", -0.11, -0.13, 0.13, 0.11, 0.1, 0.15, M["bronze"]).parent = fig.neck
    cloak = box(f"{fig.name} cloak", -0.21, 0.12, -0.55, 0.21, 0.15, 0.48, M["cloak_red"])
    cloak.parent = fig.spine
    cloak.rotation_euler.x = math.radians(-6)
    return h


def lamp_out(frame_from, frame_to=None):
    """Turn the oil lamp off at frame_from, or fade it out between the two frames."""
    lamp = bpy.data.objects["lamp light"].data
    flame = bpy.data.objects["lamp flame"]
    emit = bpy.data.materials["flame"].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
    if frame_to is None:
        lamp.energy, emit.default_value, flame.scale = 0, 0, (0.01,) * 3
        return
    for f, e, k in ((frame_from, lamp.energy, 1.0), ((frame_from + frame_to) // 2, lamp.energy * 0.35, 0.6),
                    (frame_to - 4, lamp.energy * 0.6, 0.7), (frame_to, 0, 0.01)):
        lamp.energy, emit.default_value, flame.scale = e, 40 * k if e else 0, (k,) * 3
        lamp.keyframe_insert("energy", frame=f)
        emit.keyframe_insert("default_value", frame=f)
        flame.keyframe_insert("scale", frame=f)


def exposure(keys):
    """Key the scene exposure: [(frame, stops), ...]."""
    vs = bpy.context.scene.view_settings
    for f, e in keys:
        vs.exposure = e
        vs.keyframe_insert("exposure", frame=f)


def lamp_to_window():
    """Move the oil lamp from the table onto the upstairs window sill."""
    bpy.data.objects["oil lamp"].location = (B.W0 + 0.05, 2.15, F1 + 1.0)


def climber(fig, t0, t1, k0=0, k1=None, arms="swing"):
    """Climb the stair from pace k0 to k1 (0 = two paces before the first tread)."""
    S, X = B.STEPS, (B.STAIR_X0 + B.STAIR_X1) / 2
    k1 = S + 3 if k1 is None else k1
    for k in range(k0, k1 + 1):
        t = t0 + (t1 - t0) * (k - k0) / max(1, k1 - k0)
        i = k - 2
        y = -0.4 + k * B.TREAD if i < 0 else B.STAIR_Y0 + i * B.TREAD + 0.1
        z = 0.02 + max(0, i + 1) * B.RISE
        fig.root.location = (X, y, z)
        fig.root.keyframe_insert("location", frame=fr(t))
        a = 1 if k % 2 else -1
        rot = dict(spine=(-12, 0, 0), neck=(-8, 0, 0),
                   hipL=(-30 * a - 5, 0, 0), kneeL=(30 if a > 0 else 10, 0, 0),
                   hipR=(30 * a - 5, 0, 0), kneeR=(10 if a > 0 else 30, 0, 0))
        if arms == "amphora":  # left hand up, steadying the jar on the shoulder
            rot.update(shoulderL=(-150, 0, 35), elbowL=(-95, 0, 0), shoulderR=(-20 * a, 0, -8), elbowR=(-20, 0, 0))
        else:
            rot.update(shoulderL=(20 * a, 0, 8), elbowL=(-25, 0, 0), shoulderR=(-20 * a, 0, -8), elbowR=(-25, 0, 0))
        fig.pose(fr(t), **rot)


def carry_amphora(fig, M, name="water jar"):
    a = B.amphora(name, (0, 0, 0), M, 1.0, parent=fig.j["shoulderL"])
    a.location = (0.02, 0.0, 0.15)
    a.rotation_euler = (math.radians(100), math.radians(15), 0)
    return a


def show(ob, frame_on=None, frame_off=None):
    """Key an object (and its children) visible only from frame_on until frame_off."""
    for o in [ob] + list(ob.children_recursive):
        for f, hidden in ((1, frame_on is not None), (frame_on, False), (frame_off, True)):
            if f is None:
                continue
            o.hide_render = hidden
            o.keyframe_insert("hide_render", frame=f)


def face(fig, x, y):
    """Turn a figure's root to face the point (x, y)."""
    p = fig.root.location
    fig.root.rotation_euler.z = math.atan2(x - p.x, -(y - p.y))
