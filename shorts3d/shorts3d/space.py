"""Space shots: starfield, a neon spacetime grid that bends under mass (with planets rolling
around the well, or a black hole funnel), Earth with orbiting Moon / station / satellites,
clocks that tick at different rates, and GPS signals. All procedural."""

from __future__ import annotations

import math
import random

import bpy
import mathutils

from . import fx, looks, props

V = mathutils.Vector


# ----------------------------------------------------------------- world
def star_world(scene, nebula=(0.08, 0.02, 0.16), nebula2=(0.0, 0.06, 0.14), strength=1.0):
    w = bpy.data.worlds.new("space")
    scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 260
    vor.inputs["Randomness"].default_value = 1.0
    nt.links.new(tc.outputs["Generated"], vor.inputs["Vector"])
    star = nt.nodes.new("ShaderNodeMapRange")
    star.inputs["From Min"].default_value, star.inputs["From Max"].default_value = 0.035, 0.0
    star.inputs["To Max"].default_value = 6.0
    nt.links.new(vor.outputs["Distance"], star.inputs["Value"])
    # only some cells hold a star
    keep = nt.nodes.new("ShaderNodeMath")
    keep.operation = "GREATER_THAN"
    keep.inputs[1].default_value = 0.82
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(vor.outputs["Color"], sep.inputs[0])
    nt.links.new(sep.outputs[0], keep.inputs[0])
    stars = nt.nodes.new("ShaderNodeMath")
    stars.operation = "MULTIPLY"
    nt.links.new(star.outputs[0], stars.inputs[0])
    nt.links.new(keep.outputs[0], stars.inputs[1])
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 1.6
    noise.inputs["Detail"].default_value = 6
    nt.links.new(tc.outputs["Generated"], noise.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[0].color = (0.002, 0.002, 0.01, 1)
    mid = ramp.color_ramp.elements.new(0.55)
    mid.color = (*nebula, 1)
    ramp.color_ramp.elements[-1].position = 0.75
    ramp.color_ramp.elements[-1].color = (*nebula2, 1)
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    add = nt.nodes.new("ShaderNodeMix")
    add.data_type = "RGBA"
    add.blend_type = "ADD"
    add.inputs["Factor"].default_value = 1.0
    nt.links.new(ramp.outputs["Color"], add.inputs["A"])
    nt.links.new(stars.outputs[0], add.inputs["B"])
    nt.links.new(add.outputs["Result"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    scene.view_settings.look = "AgX - Punchy"
    return bg.inputs["Strength"]


def sun_light(scene, direction=(-1, -0.6, 0.4), energy=4.0, color=(1, 0.96, 0.9)):
    light = bpy.data.lights.new("sun", "SUN")
    light.energy, light.color = energy, color
    light.angle = math.radians(2)
    o = bpy.data.objects.new("sun", light)
    o.rotation_euler = V(direction).normalized().to_track_quat("Z", "Y").to_euler()
    scene.collection.objects.link(o)
    return o


# --------------------------------------------------------------- bodies
def planet_material(name, colors, scale=3.0, emit=0.0):
    """Banded / patchy planet surface from noise. colors: list of 2-4 RGB stops."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 8
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    els[0].color = (*colors[0], 1)
    els[1].color = (*colors[-1], 1)
    for i, c in enumerate(colors[1:-1], 1):
        e = els.new(i / (len(colors) - 1))
        e.color = (*c, 1)
    if len(colors) == 3 and name.startswith("earth"):
        ramp.color_ramp.interpolation = "CONSTANT"
        els[0].position, els[1].position = 0.0, 0.62
        els[2].position = 0.5 if len(els) > 2 else 0.62
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.6
    if emit:
        nt.links.new(ramp.outputs["Color"], p.inputs["Emission Color"])
        p.inputs["Emission Strength"].default_value = emit
    return m


def earth(loc=(0, 0, 0), radius=1.0, spin_frames=None, frames=1, clouds=True, tilt=0.0):
    ocean, land, ice = (0.01, 0.1, 0.5), (0.08, 0.42, 0.08), (0.9, 0.92, 0.95)
    m = bpy.data.materials.new("earth")
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 2.2
    noise.inputs["Detail"].default_value = 10
    nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "LINEAR"
    e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.52, (*ocean, 1)
    e[1].position, e[1].color = 0.56, (*land, 1)
    e3 = e.new(0.7)
    e3.color = (0.35, 0.3, 0.1, 1)
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    # ice caps by |z|
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    absz = nt.nodes.new("ShaderNodeMath")
    absz.operation = "ABSOLUTE"
    nt.links.new(sep.outputs["Z"], absz.inputs[0])
    cap = nt.nodes.new("ShaderNodeMapRange")
    cap.inputs["From Min"].default_value, cap.inputs["From Max"].default_value = 0.82 * radius, 0.88 * radius
    nt.links.new(absz.outputs[0], cap.inputs["Value"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    nt.links.new(cap.outputs[0], mix.inputs["Factor"])
    nt.links.new(ramp.outputs["Color"], mix.inputs["A"])
    mix.inputs["B"].default_value = (*ice, 1)
    nt.links.new(mix.outputs["Result"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.55
    body = props.uv_sphere("earth", loc, radius, m, segments=96, rings=48)
    atmo = props.uv_sphere("atmosphere", loc, radius * 1.035, looks.xray("atmo", (0.25, 0.6, 1.0), 2.5, 0.25),
                           segments=96, rings=48)
    objs = [body, atmo]
    if clouds:
        cm = bpy.data.materials.new("clouds")
        cm.use_nodes = True
        cnt = cm.node_tree
        cp = cnt.nodes["Principled BSDF"]
        ctc = cnt.nodes.new("ShaderNodeTexCoord")
        cn = cnt.nodes.new("ShaderNodeTexNoise")
        cn.inputs["Scale"].default_value = 4.5
        cn.inputs["Detail"].default_value = 8
        cnt.links.new(ctc.outputs["Object"], cn.inputs["Vector"])
        cr = cnt.nodes.new("ShaderNodeMapRange")
        cr.inputs["From Min"].default_value, cr.inputs["From Max"].default_value = 0.55, 0.7
        cnt.links.new(cn.outputs["Fac"], cr.inputs["Value"])
        cnt.links.new(cr.outputs[0], cp.inputs["Alpha"])
        cp.inputs["Base Color"].default_value = (1, 1, 1, 1)
        cl = props.uv_sphere("clouds", loc, radius * 1.012, cm, segments=96, rings=48)
        objs.append(cl)
    for o in objs:
        o.rotation_euler = (math.radians(tilt), 0, 0)
    if spin_frames:
        for o, k in zip(objs, (1.0, 1.0, 1.3)):
            props.key(o, 1, rotation_euler=(math.radians(tilt), 0, 0))
            props.key(o, frames, rotation_euler=(math.radians(tilt), 0, math.radians(spin_frames * k)))
            fx._linear(o)
    return objs


def station(loc, scale=0.06):
    """A small space station: a truss, modules and four solar wings."""
    metal = looks.principled("st_metal", (0.85, 0.85, 0.88), 0.35, metallic=0.8)
    panel = looks.principled("st_panel", (0.05, 0.15, 0.55), 0.25, metallic=0.5, emit=(0.1, 0.3, 1.0), emit_strength=0.4)
    root = bpy.data.objects.new("station", None)
    root.location = loc
    bpy.context.scene.collection.objects.link(root)
    parts = []
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    truss = bpy.context.active_object
    truss.scale = (2.2 * scale, 0.08 * scale, 0.08 * scale)
    truss.data.materials.append(metal)
    parts.append(truss)
    m = props.cylinder("module", (0, 0, 0), 0.18 * scale, 1.1 * scale, metal, rotation=(math.radians(90), 0, 0))
    parts.append(m)
    for sx in (-1, 1):
        for sz in (-1, 1):
            bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * 0.85 * scale, 0, sz * 0.42 * scale))
            w = bpy.context.active_object
            w.scale = (0.5 * scale, 0.02 * scale, 0.7 * scale)
            w.data.materials.append(panel)
            parts.append(w)
    for o in parts:
        o.location = V(o.location)
        o.parent = root
    return root


def satellite(loc, scale=0.08):
    gold = looks.principled("sat_gold", (1.0, 0.7, 0.2), 0.3, metallic=1.0)
    panel = looks.principled("sat_panel", (0.05, 0.12, 0.5), 0.25, metallic=0.5, emit=(0.1, 0.3, 1.0), emit_strength=0.5)
    root = bpy.data.objects.new("satellite", None)
    root.location = loc
    bpy.context.scene.collection.objects.link(root)
    bpy.ops.mesh.primitive_cube_add(size=scale, location=(0, 0, 0))
    body = bpy.context.active_object
    body.data.materials.append(gold)
    body.parent = root
    for sx in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * scale * 1.3, 0, 0))
        w = bpy.context.active_object
        w.scale = (scale * 1.6, scale * 0.05, scale * 0.6)
        w.data.materials.append(panel)
        w.parent = root
    return root


def arrow(name, color, length=0.5, radius=0.02, strength=4):
    """An arrow along +X from the origin; returns the root empty."""
    mat, _ = fx.emissive(name, color, strength)
    root = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(root)
    shaft = props.cylinder(name + "_shaft", (length * 0.4, 0, 0), radius, length * 0.8, mat,
                           rotation=(0, math.radians(90), 0))
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=radius * 2.6, radius2=0, depth=length * 0.25,
                                    location=(length * 0.86, 0, 0), rotation=(0, math.radians(90), 0))
    head = bpy.context.active_object
    head.data.materials.append(mat)
    for o in (shaft, head):
        o.parent = root
    return root


def dashed_circle(name, centre, radius, color, axis="z", dashes=60, strength=2.0, width=0.006):
    mat, _ = fx.emissive(name, color, strength)
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = width
    for i in range(dashes):
        a0 = 2 * math.pi * i / dashes
        a1 = a0 + math.pi / dashes
        sp = cu.splines.new("POLY")
        sp.points.add(3)
        for k, p in enumerate(sp.points):
            a = a0 + (a1 - a0) * k / 3
            x, y = radius * math.cos(a), radius * math.sin(a)
            p.co = ((x, y, 0, 1) if axis == "z" else (x, 0, y, 1))
    o = bpy.data.objects.new(name, cu)
    o.location = centre
    cu.materials.append(mat)
    bpy.context.scene.collection.objects.link(o)
    return o


# ------------------------------------------------------ spacetime grid
def well(r, depth, soft):
    return -depth * soft / math.sqrt(r * r + soft * soft)


def grid_sheet(size=10.0, cuts=110, depth=1.2, soft=0.9, colors=((0.0, 0.85, 1.0), (1.0, 0.1, 0.75))):
    """A neon wireframe sheet with a shape key 'well' (0 = flat, 1 = fully bent)."""
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=cuts, y_subdivisions=cuts, size=size, location=(0, 0, 0))
    g = bpy.context.active_object
    g.name = "spacetime"
    g.shape_key_add(name="Basis")
    k = g.shape_key_add(name="well")
    flat_edge = well(size / 2, depth, soft)
    for v, kv in zip(g.data.vertices, k.data):
        r = math.hypot(v.co.x, v.co.y)
        kv.co.z = well(r, depth, soft) - flat_edge * 0  # edges stay slightly bent (feels infinite)
    wf = g.modifiers.new("wire", "WIREFRAME")
    wf.thickness = size / cuts * 0.09
    wf.use_replace = True
    m = bpy.data.materials.new("grid")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sep.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = -0.15, -depth * 0.9
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (*colors[0], 1)
    ramp.color_ramp.elements[1].color = (*colors[1], 1)
    nt.links.new(mr.outputs[0], ramp.inputs["Fac"])
    # fade the far edges into space
    dist = nt.nodes.new("ShaderNodeVectorMath")
    dist.operation = "LENGTH"
    nt.links.new(tc.outputs["Object"], dist.inputs[0])
    fade = nt.nodes.new("ShaderNodeMapRange")
    fade.inputs["From Min"].default_value, fade.inputs["From Max"].default_value = size * 0.48, size * 0.25
    fade.inputs["To Max"].default_value = 3.0
    nt.links.new(dist.outputs["Value"], fade.inputs["Value"])
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    nt.links.new(fade.outputs[0], em.inputs["Strength"])
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(em.outputs[0], out.inputs[0])
    g.data.materials.append(m)
    g.visible_shadow = False
    return g, k


def glowing_sun(loc, radius, color=(1.0, 0.3, 0.02), strength=3.0):
    m = bpy.data.materials.new("sunsurf")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    tc = nt.nodes.new("ShaderNodeTexCoord")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 6
    n.inputs["Detail"].default_value = 8
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (1.0, 0.08, 0.0, 1)
    ramp.color_ramp.elements[1].color = (1.0, 0.55, 0.02, 1)
    nt.links.new(n.outputs["Fac"], ramp.inputs["Fac"])
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Strength"].default_value = strength
    nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(em.outputs[0], out.inputs[0])
    s = props.uv_sphere("sun", loc, radius, m, segments=64, rings=32)
    glow = props.uv_sphere("corona", loc, radius * 1.18, looks.xray("corona", color, 1.2, 0.15), segments=64, rings=32)
    light = bpy.data.lights.new("sunlamp", "POINT")
    light.energy, light.color, light.shadow_soft_size = 600, (1, 0.8, 0.6), radius
    lo = bpy.data.objects.new("sunlamp", light)
    lo.location = loc
    bpy.context.scene.collection.objects.link(lo)
    return [s, glow, lo]


def accretion_disk(loc, inner, outer):
    m = bpy.data.materials.new("disk")
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    tc = nt.nodes.new("ShaderNodeTexCoord")
    grad = nt.nodes.new("ShaderNodeVectorMath")
    grad.operation = "LENGTH"
    nt.links.new(tc.outputs["Object"], grad.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = inner, outer
    nt.links.new(grad.outputs["Value"], mr.inputs["Value"])
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 3.5
    n.inputs["Detail"].default_value = 6
    n.inputs["Distortion"].default_value = 2.5
    nt.links.new(tc.outputs["Object"], n.inputs["Vector"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    e = ramp.color_ramp.elements
    e[0].color = (1.0, 0.95, 0.75, 1)
    e[1].color = (0.6, 0.02, 0.25, 1)
    mid = e.new(0.35)
    mid.color = (1.0, 0.45, 0.05, 1)
    nt.links.new(mr.outputs[0], ramp.inputs["Fac"])
    strength = nt.nodes.new("ShaderNodeMath")
    strength.operation = "MULTIPLY"
    strength.inputs[1].default_value = 9
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    nt.links.new(mr.outputs[0], inv.inputs[1])
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    nt.links.new(inv.outputs[0], mul.inputs[0])
    nt.links.new(n.outputs["Fac"], mul.inputs[1])
    nt.links.new(mul.outputs[0], strength.inputs[0])
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    nt.links.new(strength.outputs[0], em.inputs["Strength"])
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(inv.outputs[0], mix.inputs[0])
    nt.links.new(tr.outputs[0], mix.inputs[1])
    nt.links.new(em.outputs[0], mix.inputs[2])
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(mix.outputs[0], out.inputs[0])
    bpy.ops.mesh.primitive_circle_add(vertices=128, radius=outer, fill_type="NGON", location=loc)
    d = bpy.context.active_object
    d.name = "disk"
    d.data.materials.append(m)
    return d


# ------------------------------------------------------------- clocks
def clock(name, loc, radius, rim_color, hand_color=(0.05, 0.05, 0.08)):
    """Clock facing -Y. Returns (root, minute_hand, second_hand)."""
    root = bpy.data.objects.new(name, None)
    root.location = loc
    bpy.context.scene.collection.objects.link(root)
    face = props.cylinder(name + "_face", (0, 0, 0), radius, radius * 0.12,
                          looks.principled(name + "_facem", (0.95, 0.95, 0.97), 0.3),
                          rotation=(math.radians(90), 0, 0))
    rim = props.torus(name + "_rim", (0, 0, 0), radius, radius * 0.1,
                      looks.principled(name + "_rimm", rim_color, 0.3, emit=rim_color, emit_strength=1.5),
                      rotation=(math.radians(90), 0, 0))
    hm = looks.principled(name + "_hand", hand_color, 0.4)
    parts = [face, rim]
    for i in range(12):
        a = 2 * math.pi * i / 12
        bpy.ops.mesh.primitive_cube_add(size=1, location=(math.sin(a) * radius * 0.82, -radius * 0.07,
                                                          math.cos(a) * radius * 0.82))
        t = bpy.context.active_object
        t.scale = (radius * 0.04, radius * 0.02, radius * 0.14)
        t.rotation_euler = (0, a, 0)
        t.data.materials.append(hm)
        parts.append(t)
    hands = []
    for hn, length, width, mat in (("min", 0.62, 0.06, hm),
                                   ("sec", 0.78, 0.025, looks.principled(name + "_sec", (0.95, 0.1, 0.2), 0.4))):
        pivot = bpy.data.objects.new(f"{name}_{hn}", None)
        bpy.context.scene.collection.objects.link(pivot)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -radius * 0.1, radius * length / 2))
        h = bpy.context.active_object
        h.scale = (radius * width, radius * 0.02, radius * length)
        h.data.materials.append(mat)
        h.parent = pivot
        pivot.parent = root
        hands.append(pivot)
    for o in parts:
        o.parent = root
    return root, hands[0], hands[1]


def tick_hand(pivot, frames, fps, ticks_per_sec, step_deg):
    """Second hand that jumps `step_deg` every 1/ticks_per_sec seconds (rotation about -Y)."""
    n = int(frames / fps * ticks_per_sec) + 1
    for i in range(n + 1):
        f = 1 + i * fps / ticks_per_sec
        a = math.radians(step_deg * i)
        props.key(pivot, max(1, f - 1.5), rotation_euler=(0, a - math.radians(step_deg), 0) if i else (0, 0, 0))
        props.key(pivot, f, rotation_euler=(0, a, 0))


# ------------------------------------------------------------- helpers
def camera_path(scene, frames, a, b, target, lens=40):
    cam = looks.camera(scene, a, target, lens=lens)
    t = bpy.data.objects.new("cam_target", None)
    scene.collection.objects.link(t)
    t.location = target
    tc = cam.constraints.new("TRACK_TO")
    tc.target, tc.track_axis, tc.up_axis = t, "TRACK_NEGATIVE_Z", "UP_Y"
    props.key(cam, 1, location=a)
    props.key(cam, frames, location=b)
    return cam, t


def ease_keys(frames, a, b):
    """Per-frame eased 0..1 between fractions a and b."""
    out = []
    for f in range(1, frames + 1):
        t = (f / frames - a) / max(1e-6, b - a)
        out.append((f, looks.ease(t)))
    return out


def ring_pulse(name, loc, color, frames, every, start=0, max_scale=1.0, rotation=(0, 0, 0)):
    """Expanding glowing rings emitted every `every` frames, each visible for 1.6 periods."""
    mat, _ = fx.emissive(name, color, 4)
    objs = []
    f, k = start + 2, 0
    while f < frames:
        r = props.torus(f"{name}{k}", loc, 1.0, 0.03, mat, rotation=rotation)
        life = int(every * 1.6)
        props.key(r, 1, scale=(0.001,) * 3)
        props.key(r, f, scale=(0.001,) * 3)
        props.key(r, f + life, scale=(max_scale,) * 3)
        for fr, hidden in ((1, True), (f - 1, True), (f, False), (f + life, True)):
            r.hide_render = hidden
            r.keyframe_insert("hide_render", frame=max(1, fr))
        objs.append(r)
        f += every
        k += 1
    return objs


def pin(name, loc, color, normal=(0, 0, 1), size=0.12):
    mat = looks.principled(name, color, 0.3, emit=color, emit_strength=1.5)
    root = bpy.data.objects.new(name, None)
    root.location = loc
    root.rotation_euler = V(normal).to_track_quat("Z", "Y").to_euler()
    bpy.context.scene.collection.objects.link(root)
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=size * 0.35, radius2=0, depth=size,
                                    location=(0, 0, size * 0.5), rotation=(math.radians(180), 0, 0))
    c = bpy.context.active_object
    c.data.materials.append(mat)
    c.parent = root
    s = props.uv_sphere(name + "_ball", (0, 0, size * 1.05), size * 0.42, mat)
    s.parent = root
    return root
