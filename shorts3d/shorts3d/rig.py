"""Builds a posable character from Blender's CC0 Human Base Meshes bundle.

The bundle's realistic skeleton is a set of bone meshes whose origins sit at the
joints, chained parent to child. We scale it into the realistic male body, build
an armature whose bones run from each joint to the next, bind the body skin to it
with automatic (heat) weights, and constrain every skeleton mesh to its bone. One
pose then drives the skin and the x-ray skeleton together.
"""

from __future__ import annotations

import re

import bpy
import mathutils

BODY_COLL = "Body Male - Realistic"
SKEL_COLL = "Skeleton - Realistic"
P = "GEO-skeletion."

# bone name -> (skeleton mesh at the joint, mesh at the next joint or None, parent bone)
CHAIN = {
    "hips": ("hip", "spine_lumbar_l5", None),
    "spine1": ("spine_lumbar_l5", "spine_lumbar_l1", "hips"),
    "spine2": ("spine_lumbar_l1", "spine_thoracic_t1", "spine1"),
    "neck": ("spine_thoracic_t1", "spine_cervical_c1", "spine2"),
    "head": ("skull", None, "neck"),
}
for s in ("L", "R"):
    CHAIN.update({
        f"shoulder.{s}": (f"clavicle.{s}", f"arm_humerus.{s}", "spine2"),
        f"upper_arm.{s}": (f"arm_humerus.{s}", f"arm_radius.{s}", f"shoulder.{s}"),
        f"forearm.{s}": (f"arm_radius.{s}", f"hand_center.{s}", f"upper_arm.{s}"),
        f"hand.{s}": (f"hand_center.{s}", f"proximal.middle.{s}", f"forearm.{s}"),
        f"thigh.{s}": (f"leg_femur.{s}", f"leg_tibula.{s}", "hips"),
        f"shin.{s}": (f"leg_tibula.{s}", f"foot_talus.{s}", f"thigh.{s}"),
        f"foot.{s}": (f"foot_talus.{s}", f"metatarsal.3.{s}", f"shin.{s}"),
    })
    for f in ("index", "middle", "ring", "little"):
        CHAIN[f"{f}1.{s}"] = (f"proximal.{f}.{s}", f"middle.{f}.{s}", f"hand.{s}")
        CHAIN[f"{f}2.{s}"] = (f"middle.{f}.{s}", f"distal.{f}.{s}", f"{f}1.{s}")
        CHAIN[f"{f}3.{s}"] = (f"distal.{f}.{s}", None, f"{f}2.{s}")
    CHAIN[f"thumb1.{s}"] = (f"proximal.thumb.{s}", f"distal.thumb.{s}", f"hand.{s}")
    CHAIN[f"thumb2.{s}"] = (f"distal.thumb.{s}", None, f"thumb1.{s}")


def _bbox(objs):
    pts = [o.matrix_world @ mathutils.Vector(c) for o in objs for c in o.bound_box]
    return (mathutils.Vector([min(p[i] for p in pts) for i in range(3)]),
            mathutils.Vector([max(p[i] for p in pts) for i in range(3)]))


def load_character(bundle: str, name: str = "hero") -> dict:
    """Append body + skeleton, align, rig. Returns handles to the parts."""
    with bpy.data.libraries.load(bundle, link=False) as (_, dst):
        dst.collections = [BODY_COLL, SKEL_COLL]
    scene = bpy.context.scene
    root = bpy.data.collections.new(name)
    scene.collection.children.link(root)
    for c in dst.collections:
        root.children.link(c)
    bpy.context.view_layer.update()
    body_objs = [o for o in dst.collections[0].all_objects if o.type == "MESH"]
    skel_objs = [o for o in dst.collections[1].all_objects if o.type == "MESH"]
    body = next(o for o in body_objs if o.name.startswith("GEO-body_male_realistic") and "eye" not in o.name)
    bmin, bmax = _bbox(body_objs)
    smin, smax = _bbox(skel_objs)
    for o in body_objs:
        if o.parent is None:
            o.location.x -= (bmin.x + bmax.x) / 2
    k = (bmax.z - bmin.z) / (smax.z - smin.z)
    shift = mathutils.Vector(((smin.x + smax.x) / 2, (smin.y + smax.y) / 2 - (bmin.y + bmax.y) / 2, smin.z))
    for o in skel_objs:
        if o.parent is None:
            o.location = (o.location - shift) * k
            o.scale = o.scale * k
    # Multires is for sculpting; bake the visible level and drop it so binding is fast.
    for o in body_objs:
        for m in list(o.modifiers):
            if m.type == "MULTIRES":
                o.modifiers.remove(m)
    bpy.context.view_layer.update()

    # look joints up among THIS character's skeleton (a second character's objects get .001 suffixes)
    by_name = {re.sub(r"\.\d{3}$", "", o.name): o for o in skel_objs}
    joint = {n: by_name[P + n].matrix_world.translation.copy() for n in
             {v for t in CHAIN.values() for v in t[:2] if v}}
    arm_data = bpy.data.armatures.new(name + "_rig")
    rig = bpy.data.objects.new(name + "_rig", arm_data)
    root.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm_data.edit_bones
    for bname, (start, end, parent) in CHAIN.items():
        b = eb.new(bname)
        b.head = joint[start]
        if end:
            b.tail = joint[end]
        else:  # last bone in a chain: extend along the parent's direction
            pb = eb[parent]
            direction = (pb.tail - pb.head).normalized()
            length = 0.22 if bname == "head" else 0.018
            b.tail = b.head + (mathutils.Vector((0, 0, 1)) if bname == "head" else direction) * length
        if (b.tail - b.head).length < 1e-4:
            b.tail = b.head + mathutils.Vector((0, 0, 0.01))
    for bname, (_, _, parent) in CHAIN.items():
        if parent:
            eb[bname].parent = eb[parent]
    bpy.ops.object.mode_set(mode="OBJECT")

    # Skin the body with automatic weights; eyes ride rigidly on the head bone.
    eyes = [o for o in body_objs if ".eye" in o.name]
    skin = [o for o in body_objs if o not in eyes]
    for o in eyes:  # unparent but keep the world placement (the body was moved when centring)
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
    bpy.ops.object.select_all(action="DESELECT")
    for o in skin:
        o.select_set(True)
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type="ARMATURE_AUTO")
    bpy.context.view_layer.update()
    _rigid_head(rig, skin)
    for o in eyes:
        mw = o.matrix_world.copy()
        c = o.constraints.new("CHILD_OF")
        c.target, c.subtarget = rig, "head"
        c.set_inverse_pending = True
        o.matrix_world = mw

    # Each skeleton mesh follows the bone that starts at it.
    owner = {start: bname for bname, (start, _, _) in CHAIN.items()}
    for o in skel_objs:
        key = re.sub(r"\.\d{3}$", "", o.name).replace(P, "")
        bone = owner.get(key)
        if bone is None:  # vertebrae, ribs, carpals: follow the nearest chain bone above them
            p = o.parent
            while p is not None and owner.get(re.sub(r"\.\d{3}$", "", p.name).replace(P, "")) is None:
                p = p.parent
            bone = owner.get(re.sub(r"\.\d{3}$", "", p.name).replace(P, "")) if p else "spine2"
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
        c = o.constraints.new("CHILD_OF")
        c.target = rig
        c.subtarget = bone
        c.set_inverse_pending = True
    bpy.context.view_layer.update()
    return {"rig": rig, "body": body, "body_objs": body_objs, "skel_objs": skel_objs, "root": root,
            "eyes": eyes}


def pose(rig, frame: int, rotations: dict) -> None:
    """rotations: {bone: (x, y, z) degrees in the bone's local space}; keys every listed bone."""
    import math
    for bname, (x, y, z) in rotations.items():
        pb = rig.pose.bones[bname]
        pb.rotation_mode = "XYZ"
        pb.rotation_euler = (math.radians(x), math.radians(y), math.radians(z))
        pb.keyframe_insert("rotation_euler", frame=frame)


AXES = {"x": (1, 0, 0), "y": (0, 1, 0), "z": (0, 0, 1)}


def _rigid_head(rig, skin, blend=0.05):
    """Auto weights let the neck pull on the face (eyelids gape when the head turns).
    Ramp every vertex above the skull base to the head bone, fully rigid `blend` m above it."""
    z0 = (rig.matrix_world @ rig.data.bones["head"].head_local).z
    for o in skin:
        if "head" not in o.vertex_groups:
            continue
        head = o.vertex_groups["head"]
        for v in o.data.vertices:
            t = ((o.matrix_world @ v.co).z - z0) / blend
            if t <= 0:
                continue
            t = min(1.0, t)
            w = 0.0
            for e in v.groups:
                if e.group == head.index:
                    w = e.weight
                else:
                    e.weight *= 1 - t
            head.add([v.index], w * (1 - t) + t, "REPLACE")


def world_rotation(rig, bone: str, turns: list) -> "mathutils.Quaternion":
    """Local pose rotation equal to rotating the bone about world axes (rest orientation).
    turns: [("x"|"y"|"z", degrees), ...] applied in order. The character faces -Y, up is +Z,
    its right side is -X."""
    import math
    q_world = mathutils.Quaternion()
    for axis, deg in turns:
        q_world = mathutils.Quaternion(AXES[axis], math.radians(deg)) @ q_world
    m = rig.data.bones[bone].matrix_local.to_quaternion()
    return m.inverted() @ q_world @ m


def pose_world(rig, frame: int, poses: dict, key: bool = True) -> None:
    """poses: {bone: [(axis, degrees), ...]}; unspecified bones keep their pose."""
    for bone, turns in poses.items():
        pb = rig.pose.bones[bone]
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = world_rotation(rig, bone, turns)
        if key:
            pb.keyframe_insert("rotation_quaternion", frame=frame)


def rest(rig, frame: int, bones=None) -> None:
    for pb in rig.pose.bones:
        if bones is None or pb.name in bones:
            pb.rotation_mode = "QUATERNION"
            pb.rotation_quaternion = mathutils.Quaternion()
            pb.keyframe_insert("rotation_quaternion", frame=frame)


FINGERS = ("index", "middle", "ring", "little")


def _side_sign(side: str) -> int:
    """The character faces -Y, so its right side is -X and its left side is +X."""
    return -1 if side == "R" else 1


def _curl_axis(rig, side: str) -> mathutils.Vector:
    """Axis that curls fingers toward the palm: across the knuckles, oriented by the palm."""
    b = rig.data.bones
    across = (b[f"index1.{side}"].head_local - b[f"little1.{side}"].head_local).normalized()
    return across * (-1 if side == "R" else 1)


def body_pose(rig, frame: int, *, raise_arm=None, arm_forward=None, arm_inward=None, elbow=None, wrist=None,
              curl=None, thumb=None, leg_forward=None, knee=None, head_turn=0.0, head_nod=0.0,
              spine_bend=0.0, spine_twist=0.0, twist=None, key=True) -> None:
    """Plain-language posing. Per-side values are dicts like {"L": 40, "R": 0} (degrees).
    raise_arm: sideways up; arm_forward: swing forward; elbow/knee: bend; curl: fingers toward palm."""
    import math
    poses: dict = {}
    for side in ("L", "R"):
        s = _side_sign(side)
        if any(d and side in d for d in (raise_arm, arm_forward, arm_inward)):
            turns = []
            if raise_arm and side in raise_arm:
                turns.append(("y", -s * raise_arm[side]))
            if arm_forward and side in arm_forward:
                turns.append(("x", -arm_forward[side]))
            if arm_inward and side in arm_inward:  # internal rotation: forearms swing toward the midline
                turns.append(("z", -s * arm_inward[side]))
            poses[f"upper_arm.{side}"] = turns
        if elbow and side in elbow:
            poses[f"forearm.{side}"] = [("x", -elbow[side])]
        if wrist and side in wrist:
            poses[f"hand.{side}"] = [("x", -wrist[side])]
        if leg_forward and side in leg_forward:
            poses[f"thigh.{side}"] = [("x", -leg_forward[side])]
        if knee and side in knee:
            poses[f"shin.{side}"] = [("x", knee[side])]
    for bone, turns in poses.items():
        pb = rig.pose.bones[bone]
        pb.rotation_mode = "QUATERNION"
        pb.rotation_quaternion = world_rotation(rig, bone, turns)
        if key:
            pb.keyframe_insert("rotation_quaternion", frame=frame)
    for side in ("L", "R"):
        if twist and side in twist:  # rotate the hand about the forearm (positive turns palms down)
            b = rig.data.bones[f"forearm.{side}"]
            axis = (b.tail_local - b.head_local).normalized()
            _axis_turn(rig, f"hand.{side}", axis, twist[side] * _side_sign(side), frame, key)
        if curl and side in curl:
            axis = _curl_axis(rig, side)
            for f in FINGERS:
                for i, share in ((1, 0.9), (2, 1.0), (3, 0.7)):
                    _axis_turn(rig, f"{f}{i}.{side}", axis, curl[side] * share, frame, key)
        if thumb and side in thumb:
            axis = _curl_axis(rig, side)
            for i in (1, 2):
                _axis_turn(rig, f"thumb{i}.{side}", axis, thumb[side] * 0.6, frame, key)
    head = []
    if head_turn:
        head.append(("z", head_turn))
    if head_nod:
        head.append(("x", head_nod))
    if head:
        pose_world(rig, frame, {"head": head}, key)
    if spine_bend or spine_twist:
        pose_world(rig, frame, {"spine2": [("x", spine_bend), ("z", spine_twist)]}, key)


def _axis_turn(rig, bone: str, axis: mathutils.Vector, degrees: float, frame: int, key: bool) -> None:
    import math
    m = rig.data.bones[bone].matrix_local.to_quaternion()
    q = m.inverted() @ mathutils.Quaternion(axis, math.radians(degrees)) @ m
    pb = rig.pose.bones[bone]
    pb.rotation_mode = "QUATERNION"
    pb.rotation_quaternion = q
    if key:
        pb.keyframe_insert("rotation_quaternion", frame=frame)
