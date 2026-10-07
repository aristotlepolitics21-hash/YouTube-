"""Shot builders. Each takes (spec, frames, ctx) and builds a complete animated scene.

Shot types:
  character  posed rigged character, eased camera move between anchors, optional clay->x-ray
             dissolve, finger "crack" loops, bone glow
  joint      x-ray macro of one finger joint: capsule, synovial fluid, joint separation,
             gas cavity pop and slow dissolve, optional MRI ring and progress ring
  trophy     spinning trophy on a base with a light sweep
"""

from __future__ import annotations

import math

import bpy
import mathutils

from . import looks, props
from .rig import body_pose, load_character, rest

HANDS_FRONT = {"arm_forward": {"L": 10, "R": 10}, "raise_arm": {"L": -34, "R": -34}, "arm_inward": {"L": 35, "R": 35},
               "elbow": {"L": 100, "R": 100}, "twist": {"L": 90, "R": 90}, "curl": {"L": 15, "R": 15}}

ANCHORS = {"head": "head", "chest": "spine2", "hips": "hips", "hand.L": "hand.L", "hand.R": "hand.R"}


def _anchor(rig, name: str) -> mathutils.Vector:
    if name == "hands":
        return (_anchor(rig, "hand.L") + _anchor(rig, "hand.R")) / 2
    if name.startswith("joint."):  # joint.index.L -> knuckle (head of the first phalanx)
        _, finger, side = name.split(".")
        return rig.matrix_world @ rig.pose.bones[f"{finger}1.{side}"].head
    pb = rig.pose.bones[ANCHORS.get(name, name)]
    if name == "head":
        return rig.matrix_world @ (pb.head + (pb.tail - pb.head) * 0.45)
    return rig.matrix_world @ pb.head


def _camera_move(scene, rig, cam_spec: dict, frames: int):
    """camera: {"from": {"anchor", "offset", "lens"}, "to": {...}}; offsets in metres from the anchor."""
    target = bpy.data.objects.new("cam_target", None)
    scene.collection.objects.link(target)
    cam = looks.camera(scene, (0, -3, 1), (0, 0, 1))
    tc = cam.constraints.new("TRACK_TO")
    tc.target, tc.track_axis, tc.up_axis = target, "TRACK_NEGATIVE_Z", "UP_Y"
    keys = [(1, cam_spec["from"]), (frames, cam_spec.get("to", cam_spec["from"]))]
    for frame, k in keys:
        scene.frame_set(frame)
        bpy.context.view_layer.update()
        a = _anchor(rig, k.get("anchor", "chest")) if rig else mathutils.Vector(k.get("point", (0, 0, 0.5)))
        a = a + mathutils.Vector(k.get("aim_offset", (0, 0, 0)))
        props.key(target, frame, location=a)
        props.key(cam, frame, location=a + mathutils.Vector(k.get("offset", (0, -2.5, 0.2))))
        cam.data.lens = k.get("lens", 45)
        cam.data.keyframe_insert("lens", frame=frame)
    return cam


def _base_scene(ctx, frames):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, frames
    looks.setup_world(scene, tuple(ctx.get("world", (0.02, 0.025, 0.035))))
    looks.render_settings(scene, ctx["width"], ctx["height"], ctx["samples"], ctx["fps"])
    return scene, looks.library()


def _apply_pose(rig, frame, spec):
    rest(rig, frame)
    if spec:
        body_pose(rig, frame, **spec)


def build_character(spec, frames, ctx):
    scene, mats = _base_scene(ctx, frames)
    ch = load_character(ctx["bundle"])
    rig = ch["rig"]
    skin, amount = looks.skin_to_xray()
    looks.assign([o for o in ch["body_objs"] if o not in ch["eyes"]], skin)
    looks.assign(ch["eyes"], mats["eye"])
    bone_mat, bone_glow = looks.glow_bone()
    looks.assign(ch["skel_objs"], bone_mat)
    floor = props.floor(mats["floor"])
    floor.location.z = -0.002
    look = spec.get("look", "clay")
    if look == "clay":
        amount.default_value = 0
        for o in ch["skel_objs"]:
            o.hide_render = True
    elif look == "xray":
        amount.default_value = 1
    else:  # {"from": "clay", "to": "xray", "at": [start, end]} as fractions of the shot
        a0, a1 = look["at"]
        amount.default_value = 0
        amount.keyframe_insert("default_value", frame=max(1, int(frames * a0)))
        amount.default_value = 1
        amount.keyframe_insert("default_value", frame=max(2, int(frames * a1)))
    _apply_pose(rig, 1, spec.get("pose"))
    if spec.get("pose_to"):
        _apply_pose(rig, frames, {**(spec.get("pose") or {}), **spec["pose_to"]})
    crack = spec.get("crack")
    if crack:  # fingers curl and release `times` times on one side
        side, times = crack.get("side", "L"), crack.get("times", 2)
        base = dict(spec.get("pose") or {})
        for i in range(times):
            f0 = 1 + int(frames * (i + 0.15) / times)
            f1 = 1 + int(frames * (i + 0.55) / times)
            for f, amount_deg in ((f0, 10), (f1, crack.get("curl", 85))):
                body_pose(rig, f, **{**base, "curl": {side: amount_deg}})
    glow = spec.get("bone_glow")
    if glow:
        bone_mat.node_tree.nodes["Principled BSDF"].inputs["Emission Color"].default_value = (*glow.get("color", (0.2, 1, 0.45)), 1)
        bone_glow.default_value = 0
        bone_glow.keyframe_insert("default_value", frame=max(1, int(frames * glow.get("at", 0.4))))
        bone_glow.default_value = glow.get("strength", 1.2)
        bone_glow.keyframe_insert("default_value", frame=max(2, int(frames * glow.get("at", 0.4)) + 10))
    scene.frame_set(1)
    bpy.context.view_layer.update()
    focus = _anchor(rig, spec.get("camera", {}).get("from", {}).get("anchor", "chest"))
    looks.studio(scene, tuple(focus), 1.0)
    _camera_move(scene, rig, spec["camera"], frames)
    return scene


def build_joint(spec, frames, ctx):
    """X-ray macro of a finger joint (metacarpophalangeal) with fluid, separation and a gas cavity."""
    scene, mats = _base_scene(ctx, frames)
    ch = load_character(ctx["bundle"])
    rig = ch["rig"]
    side, finger = spec.get("side", "L"), spec.get("finger", "index")
    for o in ch["body_objs"]:
        o.hide_render = True
    bone_mat, _ = looks.glow_bone()
    looks.assign(ch["skel_objs"], bone_mat)
    # Isolate the finger: its metacarpal and phalanges, plus the palm bones for context.
    keep = {f"metacarpal.{finger}.{side}", f"proximal.{finger}.{side}", f"middle.{finger}.{side}",
            f"distal.{finger}.{side}", f"hand_center.{side}"}
    for o in ch["skel_objs"]:
        if o.name.replace("GEO-skeletion.", "") not in keep:
            o.hide_render = True
    # Hands held out in front, palms down, so the knuckle is clear of the body.
    _apply_pose(rig, 1, spec.get("pose", HANDS_FRONT))
    scene.frame_set(1)
    bpy.context.view_layer.update()
    j = _anchor(rig, f"joint.{finger}.{side}")
    pb = rig.pose.bones[f"{finger}1.{side}"]
    bone_dir = ((rig.matrix_world @ pb.tail) - (rig.matrix_world @ pb.head)).normalized()
    centre = j - bone_dir * 0.004
    rot = bone_dir.to_track_quat("Z", "Y").to_euler()
    capsule = props.uv_sphere("capsule", centre, 0.0075, mats["capsule"], scale=(1, 1, 1.55))
    capsule.rotation_euler = rot
    fluid = props.uv_sphere("fluid", centre, 0.0064, mats["fluid"], scale=(1, 1, 1.4))
    fluid.rotation_euler = rot
    sep = spec.get("separate")  # [start, end, metres] as fractions of the shot
    if sep:
        f0, f1 = max(1, int(frames * sep[0])), max(2, int(frames * sep[1]))
        pb.location = (0, 0, 0)
        pb.keyframe_insert("location", frame=f0)
        pb.location = (0, sep[2], 0)  # +Y is along the bone, away from the palm
        pb.keyframe_insert("location", frame=f1)
        props.key(capsule, f0, scale=(1, 1, 1.5))
        props.key(capsule, f1, scale=(0.92, 0.92, 1.5 + sep[2] * 40))
    bub = spec.get("bubble")  # {"at": frac, "size": metres, "shrink": [start, end]}
    if bub:
        b = props.uv_sphere("gas", centre + bone_dir * 0.002, 1.0, mats["gas"])
        fa = max(1, int(frames * bub["at"]))
        props.key(b, 1, scale=(0, 0, 0))
        props.key(b, fa, scale=(0, 0, 0))
        r = bub.get("size", 0.0035)
        props.key(b, fa + 2, scale=(r * 1.3, r * 1.3, r * 1.3))
        props.key(b, fa + 5, scale=(r, r, r))
        flash = bpy.data.lights.new("flash", "POINT")
        flash.energy = 0
        fo = bpy.data.objects.new("flash", flash)
        fo.location = centre + mathutils.Vector((0, -0.03, 0.01))
        scene.collection.objects.link(fo)
        for f, e in ((fa - 1, 0), (fa + 1, 40), (fa + 6, 0)):
            flash.energy = e
            flash.keyframe_insert("energy", frame=max(1, f))
        if bub.get("shrink"):
            s0, s1 = (max(fa + 6, int(frames * bub["shrink"][0])), int(frames * bub["shrink"][1]))
            props.key(b, s0, scale=(r, r, r))
            props.key(b, s1, scale=(0, 0, 0))
    if spec.get("progress"):
        p0, p1 = spec["progress"]
        ring = props.progress_ring(mats["red"], centre, 0.02, rotation=(math.radians(90), 0, 0))
        screw = ring.modifiers["arc"]
        screw.angle = math.radians(1)
        screw.keyframe_insert("angle", frame=max(1, int(frames * p0)))
        screw.angle = math.radians(359)
        screw.keyframe_insert("angle", frame=int(frames * p1))
    if spec.get("mri"):
        shell, glow = props.mri_scanner(looks.xray("mri_shell", (0.9, 0.95, 1.0), 1.2, 0.3), mats["gas"],
                                        loc=centre, radius=0.03, depth=0.02)
        for o in (shell, glow):
            o.rotation_euler = bone_dir.to_track_quat("Z", "Y").to_euler()
        plane = props.scan_plane(mats["fluid"], centre, 0.06)
        plane.rotation_euler = bone_dir.to_track_quat("Z", "Y").to_euler()
        for f, d in ((1, -0.02), (frames, 0.02)):
            props.key(plane, f, location=centre + bone_dir * d)
    looks.studio(scene, tuple(centre), 0.15)
    side = bone_dir.cross(mathutils.Vector((0, 0, 1))).normalized()
    if side.length < 0.5:
        side = mathutils.Vector((1, 0, 0))
    toward_viewer = mathutils.Vector((0, -1, 0))
    if side.dot(toward_viewer) < 0:
        side = -side
    up = side.cross(bone_dir).normalized()
    orbit = math.radians(spec.get("orbit", 30))
    dist = spec.get("distance", 0.09)
    cam = looks.camera(scene, (0, 0, 0), tuple(centre), lens=spec.get("lens", 50))
    target = bpy.data.objects.new("cam_target", None)
    scene.collection.objects.link(target)
    target.location = centre
    tc = cam.constraints.new("TRACK_TO")
    tc.target, tc.track_axis, tc.up_axis = target, "TRACK_NEGATIVE_Z", "UP_Y"
    for f, a in ((1, -orbit / 2), (frames, orbit / 2)):
        offset = (side * math.cos(a) + up * math.sin(a)) * dist + up * dist * 0.15
        props.key(cam, f, location=centre + offset)
    return scene


def build_trophy(spec, frames, ctx):
    scene, mats = _base_scene(ctx, frames)
    cup, base = props.trophy(mats["gold"], mats["plastic_white"], loc=(0, 0, 0.1), height=0.6)
    props.floor(mats["floor"])
    for f, a in ((1, 0), (frames, math.radians(spec.get("spin", 120)))):
        props.key(cup, f, rotation_euler=(0, 0, a))
        props.key(base, f, rotation_euler=(0, 0, a))
    looks.studio(scene, (0, 0, 0.4), 0.6)
    sweep = looks.area_light(scene, "sweep", (-1.2, -1.0, 1.2), (0, 0, 0.4), 120, 0.5, (1, 0.9, 0.7))
    props.key(sweep, 1, location=(-1.2, -1.0, 1.2))
    props.key(sweep, frames, location=(1.2, -1.0, 1.2))
    cam = looks.camera(scene, (0, -1.6, 0.7), (0, 0, 0.42), lens=50)
    target = bpy.data.objects.new("cam_target", None)
    scene.collection.objects.link(target)
    target.location = (0, 0, 0.42)
    tc = cam.constraints.new("TRACK_TO")
    tc.target, tc.track_axis, tc.up_axis = target, "TRACK_NEGATIVE_Z", "UP_Y"
    props.key(cam, 1, location=(0, -1.8, 0.75))
    props.key(cam, frames, location=(0, -1.35, 0.6))
    return scene


BUILDERS = {"character": build_character, "joint": build_joint, "trophy": build_trophy}
