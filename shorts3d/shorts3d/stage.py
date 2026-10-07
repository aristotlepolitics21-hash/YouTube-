"""The general-purpose 'stage' shot: an environment, any number of characters, props from
kit.PROPS, 3D text and an eased camera move.

visual = {
  "type": "stage",
  "env": "lab" | "studio" | "night" | "street" | "sky" | "storm" | "space" | "hall",
  "cast": [{"at": [x, y, z], "turn": deg, "outfit": {...}, "sleeves": "long", "hair": [r, g, b],
            "hat": [r, g, b], "pose": {...}, "pose_to": {...}, "look": "clay"|"xray"}],
  "props": [{"prop": "coil", "at": [x, y, z], "rot": [deg, deg, deg], "scale": s, "args": {...},
             "anim": [[t, {"at": [...], "rot": [...], "scale": s}], ...], "spin": ["z", deg], "pop": t}],
  "texts": [{"text": "1831", "at": [x, y, z], "size": 0.3, "color": [r, g, b], "pop": t, "rot": [deg...]}],
  "camera": {"from": [x, y, z], "to": [x, y, z], "target": [x, y, z] | "cast0.head",
             "target_to": ..., "lens": 35, "lens_to": 40}
}
Times t are fractions of the shot.
"""

from __future__ import annotations

import math

import bpy
import mathutils

from . import fx, kit, looks, props, space
from .rig import body_pose, load_character, rest

V = mathutils.Vector
R = math.radians


# ------------------------------------------------------------ environments
def _env(scene, name, opts):
    if name == "lab" or name == "hall":
        w = bpy.data.worlds.new("lab")
        scene.world = w
        w.use_nodes = True
        w.node_tree.nodes["Background"].inputs[0].default_value = (*opts.get("world", (0.05, 0.035, 0.025)), 1)
        floor = props.floor(_wood(), size=30)
        wall_c = tuple(opts.get("wall", (0.12, 0.16, 0.13)))
        bpy.ops.mesh.primitive_plane_add(size=30, location=(0, opts.get("wall_y", 3.0), 7.5), rotation=(R(90), 0, 0))
        wall = bpy.context.active_object
        wall.data.materials.append(looks.principled("wall", wall_c, 0.8))
        bpy.ops.mesh.primitive_plane_add(size=1, location=(opts.get("window_x", -1.6), opts.get("wall_y", 3.0) - 0.01, 2.2),
                                         rotation=(R(90), 0, 0))
        win = bpy.context.active_object
        win.scale = (1.2, 1.8, 1)
        win.data.materials.append(fx.emissive("window", (1.0, 0.92, 0.75), 1.2)[0])
        looks.area_light(scene, "window_light", (opts.get("window_x", -1.6), 2.5, 2.4), (0, 0, 1.0), 250, 2.5, (1, 0.9, 0.75))
        looks.area_light(scene, "key", (-2.0, -3.0, 2.5), (0, 0, 1.0), 260, 2.0, (1.0, 0.85, 0.7))
        looks.area_light(scene, "rim", (2.5, 2.0, 2.0), (0, 0, 1.0), 250, 1.0, (0.6, 0.75, 1.0))
        looks.area_light(scene, "fill", (2.5, -2.5, 1.0), (0, 0, 1.0), 60, 3.0, (1.0, 0.9, 0.85))
        return floor
    if name == "studio":
        fx.gradient_world(scene, horizon=tuple(opts.get("horizon", (0.02, 0.12, 0.2))),
                          zenith=tuple(opts.get("zenith", (0.005, 0.01, 0.03))), strength=opts.get("strength", 0.9))
        floor = props.floor(looks.principled("studio_floor", tuple(opts.get("floor", (0.02, 0.03, 0.05))), 0.25), size=40)
        fx.colour_studio(scene, tuple(opts.get("focus", (0, 0, 0.6))), opts.get("light_scale", 1.0),
                         key=tuple(opts.get("key", (1.0, 0.92, 0.85))), rim=tuple(opts.get("rim", (0.3, 0.8, 1.0))),
                         fill=tuple(opts.get("fill", (0.8, 0.5, 1.0))))
        return floor
    if name in ("night", "street"):
        space.star_world(scene, strength=opts.get("strength", 0.6))
        floor = props.floor(looks.principled("ground", (0.04, 0.04, 0.05) if name == "street" else (0.02, 0.03, 0.03), 0.3), 60)
        looks.area_light(scene, "moon", (-4, -3, 6), (0, 0, 0.8), 300, 4, (0.6, 0.7, 1.0))
        looks.area_light(scene, "fill", (3, -3, 2), (0, 0, 0.8), 120, 3, (1.0, 0.7, 0.5))
        return floor
    if name in ("sky", "storm"):
        sky = {"horizon": (1.0, 0.45, 0.2), "zenith": (0.05, 0.2, 0.75), "strength": 1.0} if name == "sky" else {}
        fx.gradient_world(scene, **{**sky, **opts.get("sky", {})})
        floor = props.floor(looks.principled("ground", tuple(opts.get("floor", (0.12, 0.4, 0.08))), 0.8), 60) \
            if name == "sky" else fx.wet_floor()
        fx.colour_studio(scene, tuple(opts.get("focus", (0, 0, 1.0))), 1.0,
                         key=(1.0, 0.9, 0.8) if name == "sky" else (0.65, 0.78, 1.0))
        return floor
    if name == "space":
        space.star_world(scene)
        space.sun_light(scene, (-1, -0.8, 0.5), 4.0)
        return None
    raise ValueError(f"unknown env {name}")


def _wood():
    m = bpy.data.materials.new("wood_floor")
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.inputs["Scale"].default_value = 1.2
    wave.inputs["Distortion"].default_value = 6
    nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.09, 0.04, 0.015, 1)
    ramp.color_ramp.elements[1].color = (0.17, 0.08, 0.03, 1)
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.45
    return m


# --------------------------------------------------------------- characters
def hair(rig, body, color, curly=True):
    """A hair cap shaped from the skull, riding on the head bone."""
    head_z = (rig.matrix_world @ rig.data.bones["head"].head_local).z
    pts = [body.matrix_world @ v.co for v in body.data.vertices if (body.matrix_world @ v.co).z > head_z + 0.06]
    lo = V((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = V((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    c = (lo + hi) / 2
    r = (hi - lo) / 2
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1, location=c + V((0, 0.012, 0.02)))
    cap = bpy.context.active_object
    cap.name = "hair"
    cap.scale = (r.x * 1.12, r.y * 1.1, r.z * 1.08)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(cap.data)
    kill = []
    for v in bm.verts:
        yrel = v.co.y / (r.y * 1.1)        # -1 face side, +1 back
        zrel = v.co.z / (r.z * 1.08)
        limit = 0.25 + (-0.75 - 0.25) * (yrel + 1) / 2   # hairline high at the front, low at the back
        if zrel < limit or (abs(v.co.x) > r.x * 0.95 and zrel < 0.1 and yrel < 0.3):
            kill.append(v)
    bmesh.ops.delete(bm, geom=kill, context="VERTS")
    bm.to_mesh(cap.data)
    bm.free()
    sol = cap.modifiers.new("thick", "SOLIDIFY")
    sol.thickness = 0.012
    if curly:
        tex = bpy.data.textures.new("curls", "VORONOI")
        tex.noise_scale = 0.012
        d = cap.modifiers.new("curls", "DISPLACE")
        d.texture, d.strength = tex, 0.012
    sub = cap.modifiers.new("smooth", "SUBSURF")
    sub.levels = sub.render_levels = 1
    bpy.ops.object.shade_smooth()
    cap.data.materials.append(looks.principled("hair", tuple(color), 0.65))
    mw = cap.matrix_world.copy()
    cap.parent = rig
    cap.parent_type = "BONE"
    cap.parent_bone = "head"
    bpy.context.view_layer.update()
    cap.matrix_world = mw
    return cap


def add_character(cdef, frames, ctx, idx):
    ch = load_character(ctx["bundle"], name=f"cast{idx}")
    rig, body = ch["rig"], ch["body"]
    rest(rig, 1)
    bpy.context.view_layer.update()
    if cdef.get("hair"):
        hair(rig, body, cdef["hair"], cdef.get("curly", True))
    if cdef.get("hat"):
        top = max((body.matrix_world @ v.co).z for v in body.data.vertices)
        fx.hat(rig, looks.principled("hat", tuple(cdef["hat"]), 0.6), top + 0.02)
    if cdef.get("astronaut"):  # bulky white suit, gloves, boots, helmet and life-support backpack
        cdef = {**cdef, "helmet": True, "sleeves": "long",
                "outfit": {"skin": [0.7, 0.7, 0.72], "shirt": [0.93, 0.93, 0.92], "pants": [0.93, 0.93, 0.92], "boots": [0.75, 0.75, 0.75]}}
        d = body.modifiers.new("bulk", "DISPLACE")
        d.strength, d.mid_level = 0.03, 0.0
        sb = rig.data.bones["spine2"]
        pack = kit.box("plss", rig.matrix_world @ (sb.head_local + V((0, 0.2, 0.05))), (0.42, 0.2, 0.55),
                       kit.mat("plss", (0.9, 0.9, 0.88), 0.4), 0.03)
        bpy.context.view_layer.update()
        mw = pack.matrix_world.copy()
        pack.parent, pack.parent_type, pack.parent_bone = rig, "BONE", "spine2"
        bpy.context.view_layer.update()
        pack.matrix_world = mw
    if cdef.get("helmet"):
        hb = rig.data.bones["head"]
        c = rig.matrix_world @ (hb.head_local + (hb.tail_local - hb.head_local) * 0.42)
        hm = kit.helmet(frames)
        hm.location = c + V((0, -0.005, 0.0))
        bpy.context.view_layer.update()
        mw = hm.matrix_world.copy()
        hm.parent = rig
        hm.parent_type = "BONE"
        hm.parent_bone = "head"
        bpy.context.view_layer.update()
        hm.matrix_world = mw
    outfit = cdef.get("outfit")
    if outfit:
        if cdef.get("sleeves") == "long":
            fx.OUTFIT_REGIONS["shirt"] = ("shoulder", "upper_arm", "spine1", "spine2", "forearm")
            fx.OUTFIT_REGIONS["skin"] = ("head", "neck", "hand", "thumb", "index", "middle", "ring", "little")
        fx.apply_outfit(body, {k: tuple(v) if v else None for k, v in outfit.items()})
        fx.OUTFIT_REGIONS["shirt"] = ("shoulder", "upper_arm", "spine1", "spine2")
        fx.OUTFIT_REGIONS["skin"] = ("head", "neck", "forearm", "hand", "thumb", "index", "middle", "ring", "little")
    skin, h = fx.skin_material(outfit=bool(outfit))
    h["xray"].default_value = 1.0 if cdef.get("look") == "xray" else 0.0
    looks.assign([o for o in ch["body_objs"] if o not in ch["eyes"]], skin)
    looks.assign(ch["eyes"], looks.principled("eye", (0.08, 0.07, 0.07), 0.15))
    if cdef.get("look") != "xray":
        for o in ch["skel_objs"]:
            o.hide_render = True
    else:
        looks.assign(ch["skel_objs"], looks.principled("bone", (0.93, 0.9, 0.82), 0.4))
    if cdef.get("pose"):
        body_pose(rig, 1, **cdef["pose"])
    if cdef.get("pose_to"):
        rest(rig, frames)
        body_pose(rig, frames, **{**(cdef.get("pose") or {}), **cdef["pose_to"]})
    for t, pose in cdef.get("poses", []):  # extra keyed poses [[t, {...}], ...]
        f = kit.key_frac(frames, t)
        rest(rig, f)
        body_pose(rig, f, **{**(cdef.get("pose") or {}), **pose})
    sc = cdef.get("scale", 1.0)
    rig.scale = (sc, sc, sc)
    rig.location = tuple(cdef.get("at", (0, 0, 0)))
    rig.rotation_euler = tuple(R(v) for v in cdef["rot"]) if cdef.get("rot") else (0, 0, R(cdef.get("turn", 0)))
    if cdef.get("walk"):  # [[t, [x, y, z]], ...] slide the whole character
        for t, loc in cdef["walk"]:
            props.key(rig, kit.key_frac(frames, t), location=tuple(loc))
    return rig


def _anchor(rigs, name):
    who, part = name.split(".", 1)
    rig = rigs[int(who.replace("cast", ""))]
    bone = {"head": "head", "chest": "spine2", "hips": "hips", "hands": None, "hand.L": "hand.L", "hand.R": "hand.R"}[part]
    if bone is None:
        return (rig.matrix_world @ rig.pose.bones["hand.L"].head + rig.matrix_world @ rig.pose.bones["hand.R"].head) / 2
    pb = rig.pose.bones[bone]
    if bone == "head":
        return rig.matrix_world @ (pb.head + (pb.tail - pb.head) * 0.45)
    return rig.matrix_world @ pb.head


# ------------------------------------------------------------------ build
def _apply_transform_keys(obj, frames, p):
    base_at = V(p.get("at", (0, 0, 0)))
    base_rot = [R(a) for a in p.get("rot", (0, 0, 0))]
    s = p.get("scale", 1.0)
    obj.location, obj.rotation_euler, obj.scale = base_at, base_rot, (s, s, s)
    if p.get("anim"):
        props.key(obj, 1, location=base_at, rotation_euler=base_rot, scale=(s, s, s))
        for t, st in p["anim"]:
            f = kit.key_frac(frames, t)
            kw = {}
            if "at" in st:
                kw["location"] = tuple(st["at"])
            if "rot" in st:
                kw["rotation_euler"] = tuple(R(a) for a in st["rot"])
            if "scale" in st:
                kw["scale"] = (st["scale"],) * 3
            props.key(obj, f, **kw)
    if p.get("spin"):
        axis, deg = p["spin"]
        i = "xyz".index(axis)
        r0 = list(base_rot)
        r1 = list(base_rot)
        r1[i] += R(deg)
        props.key(obj, 1, rotation_euler=r0)
        props.key(obj, frames, rotation_euler=r1)
        fx._linear(obj)
    if p.get("pop") is not None:
        fx.pop_in(obj, kit.key_frac(frames, p["pop"]), scale=s)


def build_stage(spec, frames, ctx):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, frames
    looks.render_settings(scene, ctx["width"], ctx["height"], ctx["samples"], ctx["fps"])
    _env(scene, spec.get("env", "studio"), spec.get("env_opts", {}))
    rigs = [add_character(c, frames, ctx, i) for i, c in enumerate(spec.get("cast", []))]
    for i, p in enumerate(spec.get("props", [])):
        fn = kit.PROPS[p["prop"]]
        root = fn(frames, **p.get("args", {}))
        _apply_transform_keys(root, frames, p)
    for t in spec.get("texts", []):
        col = tuple(t.get("color", (1.0, 0.85, 0.3)))
        o = fx.text(t["text"], looks.principled("txt", col, 0.3, emit=col, emit_strength=t.get("glow", 1.0)),
                    tuple(t.get("at", (0, 0, 1))), size=t.get("size", 0.3), depth=t.get("depth", 0.05))
        _apply_transform_keys(o, frames, {**t, "rot": t.get("rot", (90, 0, 0))})
    if spec.get("rain"):
        fx.rain(frames, ctx["fps"], centre=(0, 0, 0))
    for b in spec.get("bolts", []):
        fx.bolt(V(b["from"]), V(b["to"]), kit.key_frac(frames, b.get("at", 0.3)), seed=b.get("seed", 1),
                width=b.get("width", 0.03))
    for l in spec.get("lights", []):
        looks.area_light(scene, "extra", tuple(l["at"]), tuple(l.get("target", (0, 0, 1))), l.get("energy", 300),
                         l.get("size", 1.0), tuple(l.get("color", (1, 1, 1))))
    scene.frame_set(1)
    bpy.context.view_layer.update()
    cam = spec.get("camera", {})

    def resolve(v):
        if isinstance(v, str):
            return _anchor(rigs, v)
        return V(v)
    tgt = bpy.data.objects.new("cam_target", None)
    scene.collection.objects.link(tgt)
    c = looks.camera(scene, tuple(cam.get("from", (0, -4, 1.4))), tuple(resolve(cam.get("target", (0, 0, 1)))),
                     lens=cam.get("lens", 35))
    tc = c.constraints.new("TRACK_TO")
    tc.target, tc.track_axis, tc.up_axis = tgt, "TRACK_NEGATIVE_Z", "UP_Y"
    props.key(tgt, 1, location=resolve(cam.get("target", (0, 0, 1))))
    props.key(tgt, frames, location=resolve(cam.get("target_to", cam.get("target", (0, 0, 1)))))
    props.key(c, 1, location=tuple(cam.get("from", (0, -4, 1.4))))
    props.key(c, frames, location=tuple(cam.get("to", cam.get("from", (0, -4, 1.4)))))
    for f, lens in ((1, cam.get("lens", 35)), (frames, cam.get("lens_to", cam.get("lens", 35)))):
        c.data.lens = lens
        c.data.keyframe_insert("lens", frame=f)
    if cam.get("dof"):
        c.data.dof.use_dof = True
        c.data.dof.focus_object = tgt
        c.data.dof.aperture_fstop = cam["dof"]
    return scene
