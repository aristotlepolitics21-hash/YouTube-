"""Shot builders. Each takes (spec, frames, ctx) and builds a complete animated scene.

Shot types:
  character  posed rigged character, eased camera move between anchors, optional clay->x-ray
             dissolve, finger "crack" loops, bone glow
  joint      x-ray macro of one finger joint: capsule, synovial fluid, joint separation,
             gas cavity pop and slow dissolve, optional MRI ring and progress ring
  trophy     spinning trophy on a base with a light sweep
  compare    two glowing objects (lightning icon vs sun) with growing bars and a multiplier label
  crowd      rows of simple figures popping in; some survive a flash, the rest grey out and fall
  count      a big 3D number with icons popping in one by one

Character extras (see fx.py): env "storm" (gradient sky, wet floor, coloured lights), rain,
outfit colours, ranger hat, lightning bolt strike, electric flashover on the skin, a beating
heart with ECG trace, and a Lichtenberg figure growing on the back.
"""

from __future__ import annotations

import math

import bpy
import mathutils

from . import fx, looks, props
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


def _keys(socket, pairs):
    for f, v in pairs:
        socket.default_value = v
        socket.keyframe_insert("default_value", frame=max(1, int(f)))


def build_character(spec, frames, ctx):
    scene, mats = _base_scene(ctx, frames)
    storm = spec.get("env") == "storm"
    sky = fx.gradient_world(scene, **spec.get("sky", {})) if storm else None
    ch = load_character(ctx["bundle"])
    rig = ch["rig"]
    _apply_pose(rig, 1, spec.get("pose"))
    if spec.get("pose_to"):
        _apply_pose(rig, frames, {**(spec.get("pose") or {}), **spec["pose_to"]})
    scene.frame_set(1)
    bpy.context.view_layer.update()
    outfit = spec.get("outfit")
    if outfit:
        fx.apply_outfit(ch["body"], {k: tuple(v) if v else None for k, v in outfit.items()})
    lich = spec.get("lichtenberg")
    lich_args = None
    if lich:
        loc = _anchor(rig, "chest") + mathutils.Vector(lich.get("offset", (0.0, 0.2, 0.08)))
        lich_args = (fx.lichtenberg_image(seed=lich.get("seed", 3)), fx.projector(loc), lich.get("size", 0.42))
    skin, h = fx.skin_material(outfit=bool(outfit), flashover=bool(spec.get("flashover") or spec.get("bolt")),
                               lichtenberg=lich_args)
    amount = h["xray"]
    looks.assign([o for o in ch["body_objs"] if o not in ch["eyes"]], skin)
    looks.assign(ch["eyes"], mats["eye"])
    bone_mat, bone_glow = looks.glow_bone()
    looks.assign(ch["skel_objs"], bone_mat)
    floor = fx.wet_floor() if storm else props.floor(mats["floor"])
    floor.location.z = -0.002
    if spec.get("hat"):
        top = max((ch["body"].matrix_world @ v.co).z for v in ch["body"].data.vertices)
        fx.hat(rig, looks.principled("hat", tuple(spec["hat"]), 0.6), top + 0.02)
    look = spec.get("look", "clay")
    if look == "clay":
        amount.default_value = 0
        for o in ch["skel_objs"]:
            o.hide_render = True
    elif look == "xray":
        amount.default_value = 1
    else:  # {"from": "clay", "to": "xray", "at": [start, end]} as fractions of the shot
        a0, a1 = look["at"]
        _keys(amount, ((frames * a0, 0), (max(2, frames * a1), 1)))
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
        fa = frames * glow.get("at", 0.4)
        _keys(bone_glow, ((fa, 0), (max(2, fa + 10), glow.get("strength", 1.2))))
    head = _anchor(rig, "head")
    if spec.get("rain"):
        fx.rain(frames, ctx["fps"], centre=(head.x, head.y, 0))
    b = spec.get("bolt")
    flash_pairs = []
    if b:
        fb = max(2, int(frames * b.get("at", 0.3)))
        top = head + mathutils.Vector((0, 0, 0.25))
        sky_pt = top + mathutils.Vector(b.get("from", (0.6, 1.5, 9.0)))
        fx.bolt(sky_pt, top, fb, seed=b.get("seed", 1), width=b.get("width", 0.03), hold=b.get("hold", 6))
        fx.strike_light(scene, top + mathutils.Vector((0.3, -0.6, 0.6)), fb, b.get("energy", 2500))
        if sky:
            _keys(sky, ((fb - 1, 1), (fb, 9), (fb + 2, 2), (fb + 3, 7), (fb + 8, 1)))
        flash_pairs = [(fb - 1, 0), (fb, 1.4), (fb + 8, 0.6), (fb + 16, 0)]
    fo = spec.get("flashover")
    if fo:
        a, z = fo.get("at", (0.1, 0.9))
        st = fo.get("strength", 1.0)
        flash_pairs = [(frames * a - 1, 0), (frames * a + 3, st), (frames * z - 3, st), (frames * z, 0)]
    if flash_pairs:
        _keys(h["flash"], sorted(flash_pairs))
        for w in h["flash_w"]:
            _keys(w, ((1, 0), (frames, frames * 0.06)))
    hs = spec.get("heart")
    if hs:
        loc = _anchor(rig, "chest") + mathutils.Vector(hs.get("offset", (0.035, -0.04, 0.14)))
        ht = fx.heart(loc, hs.get("size", 0.07))
        beats = fx.beat_frames(frames, ctx["fps"], hs.get("beats", [[0, 1]]), hs.get("bpm", 80))
        fx.animate_beats(ht, beats)
        if hs.get("ecg", True):
            o = _anchor(rig, "chest") + mathutils.Vector(hs.get("ecg_offset", (0.0, -0.3, 0.0)))
            fx.ecg(beats, frames, o, hs.get("ecg_width", 0.42))
    if lich:
        r0, r1 = lich.get("reveal", (0.1, 0.6))
        _keys(h["lich_reveal"], ((frames * r0, 0), (frames * r1, 1.05)))
        if lich.get("fade"):
            f0, f1 = lich["fade"]
            _keys(h["lich_fade"], ((frames * f0, 1), (frames * f1, 0)))
    scene.frame_set(1)
    bpy.context.view_layer.update()
    focus = _anchor(rig, spec.get("camera", {}).get("from", {}).get("anchor", "chest"))
    if storm:
        fx.colour_studio(scene, tuple(focus), 1.0)
    else:
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


def _fixed_camera(scene, frames, cam_from, cam_to, target, lens=45):
    cam = looks.camera(scene, cam_from, target, lens=lens)
    t = bpy.data.objects.new("cam_target", None)
    scene.collection.objects.link(t)
    t.location = target
    tc = cam.constraints.new("TRACK_TO")
    tc.target, tc.track_axis, tc.up_axis = t, "TRACK_NEGATIVE_Z", "UP_Y"
    props.key(cam, 1, location=cam_from)
    props.key(cam, frames, location=cam_to)
    return cam


def _stage(scene, ctx, spec):
    fx.gradient_world(scene, **spec.get("sky", {}))
    floor = fx.wet_floor()
    floor.location.z = 0


def build_compare(spec, frames, ctx):
    """Lightning icon vs the sun, with bars that grow to the ratio and a label like '5x'."""
    scene, mats = _base_scene(ctx, frames)
    _stage(scene, ctx, spec)
    ratio = spec.get("ratio", 5)
    bolt_mat, bolt_s = fx.emissive("icon_bolt", (0.3, 0.75, 1.0), 6)
    sun_mat = looks.principled("sun", (1, 0.3, 0.02), 0.5, emit=(1.0, 0.28, 0.01), emit_strength=3)
    sun = props.uv_sphere("sun", (0.32, 0, 0.62), 0.16, sun_mat)
    icon = fx.bolt_icon("bolt_icon", bolt_mat, (-0.32, 0, 1.28), size=0.2, depth=0.06)
    bar_sun_mat = looks.principled("bar_sun", (1, 0.3, 0.02), 0.4, emit=(1, 0.28, 0.01), emit_strength=0.6)
    bar_bolt_mat = looks.principled("bar_bolt", (0.1, 0.55, 1.0), 0.4, emit=(0.05, 0.5, 1.0), emit_strength=0.8)
    unit = 0.17
    for name, x, h, mat, top_obj in (("bar_sun", 0.32, unit, bar_sun_mat, sun),
                                     ("bar_bolt", -0.32, unit * ratio, bar_bolt_mat, icon)):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, 0))
        bar = bpy.context.active_object
        bar.name = name
        bar.data.materials.append(mat)
        bev = bar.modifiers.new("bevel", "BEVEL")
        bev.width, bev.segments = 0.015, 3
        f0, f1 = int(frames * 0.15), int(frames * (0.35 if h == unit else 0.7))
        props.key(bar, 1, scale=(0.2, 0.2, 0.001), location=(x, 0, 0))
        props.key(bar, f0, scale=(0.2, 0.2, 0.001), location=(x, 0, 0))
        props.key(bar, f1, scale=(0.2, 0.2, h), location=(x, 0, h / 2))
        top_z = h + 0.24
        props.key(top_obj, 1, location=(x, 0, 0.24))
        props.key(top_obj, f0, location=(x, 0, 0.24))
        props.key(top_obj, f1, location=(x, 0, top_z))
    for f, a in ((1, 0), (frames, math.radians(25))):
        props.key(sun, f, rotation_euler=(0, 0, a))
    label = fx.text(f"{ratio}\u00d7", looks.principled("label", (1, 0.85, 0.2), 0.3, emit=(1, 0.8, 0.15), emit_strength=3),
                    (-0.32, -0.05, unit * ratio + 0.45), size=0.2)
    fx.pop_in(label, int(frames * 0.72))
    fx.colour_studio(scene, (0, 0, 0.6), 0.8)
    _fixed_camera(scene, frames, (0.15, -2.9, 0.85), (0.05, -2.5, 0.9), (0, 0, 0.9), lens=40)
    return scene


def _figure(name, mat, loc):
    body = props.uv_sphere(name, (loc[0], loc[1], loc[2] + 0.17), 0.1, mat, scale=(1, 0.9, 1.7))
    head = props.uv_sphere(name + "_head", (loc[0], loc[1], loc[2] + 0.42), 0.075, mat)
    head.parent = body
    head.matrix_parent_inverse = body.matrix_world.inverted()
    return body, head


def build_crowd(spec, frames, ctx):
    """N figures in rows; `survive` of them light up after the flash, the rest grey out and topple."""
    scene, mats = _base_scene(ctx, frames)
    _stage(scene, ctx, spec)
    n, survive = spec.get("count", 10), spec.get("survive", 9)
    cols = spec.get("cols", 5)
    palette = [(0.1, 0.9, 0.55), (0.2, 0.75, 1.0), (1.0, 0.75, 0.15), (1.0, 0.35, 0.65), (0.6, 0.45, 1.0)]
    grey = looks.principled("grey", (0.12, 0.12, 0.14), 0.7)
    fall = int(frames * spec.get("flash_at", 0.45))
    figs = []
    for i in range(n):
        r, c = divmod(i, cols)
        x = (c - (cols - 1) / 2) * 0.34
        y = r * 0.42
        col = palette[i % len(palette)]
        mat = looks.principled(f"fig{i}", col, 0.35, emit=col, emit_strength=0.0)
        body, head = _figure(f"fig{i}", mat, (x, y, 0))
        props.key(body, 1, scale=(0, 0, 0))
        f_in = 2 + int(frames * 0.25 * i / n)
        props.key(body, f_in, scale=(0, 0, 0))
        props.key(body, f_in + 4, scale=(1.15, 1.0, 1.9))
        props.key(body, f_in + 7, scale=(1, 0.9, 1.7))
        figs.append((body, mat))
    victim = spec.get("victim", n - 1)
    for i, (body, mat) in enumerate(figs):
        es = mat.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
        if i == victim:
            bc = mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"]
            _keys(es, ((fall, 0),))
            for f, v in ((fall + 2, bc.default_value[:]), (fall + 8, (0.1, 0.1, 0.12, 1))):
                bc.default_value = v
                bc.keyframe_insert("default_value", frame=f)
            props.key(body, fall + 8, rotation_euler=(0, 0, 0))
            props.key(body, fall + 22, rotation_euler=(math.radians(-80), 0, 0))
        else:
            _keys(es, ((fall, 0), (fall + 3, 4.0), (fall + 14, 1.5)))
    sky_pt = mathutils.Vector((0.8, 3, 10))
    fx.bolt(sky_pt, mathutils.Vector(figs[victim][0].location) + mathutils.Vector((0, 0, 0.5)), fall, seed=7)
    fx.strike_light(scene, (0, -1, 2), fall, 3000)
    fx.colour_studio(scene, (0, 0.4, 0.3), 1.0)
    rows = (n + cols - 1) // cols
    _fixed_camera(scene, frames, (0, -3.0, 2.3), (0, -2.6, 2.0), (0, 0.42 * (rows - 1) / 2, 0.3), lens=38)
    return scene


def build_count(spec, frames, ctx):
    """A big glowing number with `count` icons popping in around it, one by one."""
    scene, mats = _base_scene(ctx, frames)
    _stage(scene, ctx, spec)
    n = spec.get("count", 7)
    gold = looks.principled("num", (1.0, 0.72, 0.12), 0.25, metallic=0.6, emit=(1, 0.6, 0.05), emit_strength=1.5)
    num = fx.text(str(spec.get("text", n)), gold, (0, 0, 0.85), size=0.9, depth=0.25)
    fx.pop_in(num, 2, over=8)
    for f, a in ((1, math.radians(-25)), (frames, math.radians(15))):
        props.key(num, f, rotation_euler=(math.radians(90), 0, a))
    icon_mat, _ = fx.emissive("icon", (0.55, 0.85, 1.0), 9)
    span = spec.get("span", (0.12, 0.8))
    for i in range(n):
        a = math.radians(195 - 210 * i / max(1, n - 1))
        loc = (0.46 * math.cos(a), -0.15, 0.95 + 0.62 * math.sin(a))
        ic = fx.bolt_icon(f"icon{i}", icon_mat, loc, size=0.1, depth=0.04)
        fx.pop_in(ic, int(frames * (span[0] + (span[1] - span[0]) * i / max(1, n - 1))))
    fx.colour_studio(scene, (0, 0, 0.9), 1.0)
    _fixed_camera(scene, frames, (0, -3.0, 1.0), (0, -2.6, 0.95), (0, 0, 1.0), lens=40)
    return scene


BUILDERS = {"character": build_character, "joint": build_joint, "trophy": build_trophy,
            "compare": build_compare, "crowd": build_crowd, "count": build_count}
