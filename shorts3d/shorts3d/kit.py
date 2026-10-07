"""Prop kit for long-form explainers. Every prop is built from primitives and returns a root
object (an empty or a mesh) so the stage builder can place, scale and animate it.

Prop functions take (frames, **params) and may animate themselves; time parameters are
fractions of the shot (0..1)."""

from __future__ import annotations

import math
import random

import bpy
import mathutils

from . import fx, looks, props, space

V = mathutils.Vector
R = math.radians


# ------------------------------------------------------------- helpers
def mat(name, color, rough=0.5, metal=0.0, emit=0.0, alpha=1.0, emit_color=None):
    return looks.principled(name, tuple(color), rough, metallic=metal,
                            emit=tuple(emit_color or color) if emit else None, emit_strength=emit, alpha=alpha)


def empty(name):
    e = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(e)
    return e


def child(obj, parent):
    obj.parent = parent
    return obj


def box(name, loc, size, material, bevel=0.0, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = size
    o.data.materials.append(material)
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL")
        b.width, b.segments = bevel, 3
    if parent:
        o.parent = parent
    return o


def cyl(name, loc, r, depth, material, rot=(0, 0, 0), parent=None, verts=48):
    o = props.cylinder(name, loc, r, depth, material, rotation=rot, vertices=verts)
    if parent:
        o.parent = parent
    return o


def sph(name, loc, r, material, scale=(1, 1, 1), parent=None):
    o = props.uv_sphere(name, loc, r, material, scale=scale, segments=32, rings=16)
    if parent:
        o.parent = parent
    return o


def curve_obj(name, pts, width, material, parent=None, cyclic=False):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = width
    cu.bevel_resolution = 3
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (*c, 1)
    sp.use_cyclic_u = cyclic
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    cu.materials.append(material)
    if parent:
        o.parent = parent
    return o


def lathe(name, profile, material, steps=64, parent=None, loc=(0, 0, 0)):
    """Revolve [(r, z), ...] around Z."""
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([(r, 0, z) for r, z in profile], [(i, i + 1) for i in range(len(profile) - 1)], [])
    o = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    s = o.modifiers.new("lathe", "SCREW")
    s.steps = s.render_steps = steps
    s.use_smooth_shade = True
    o.modifiers.new("smooth", "SUBSURF").levels = 1
    o.data.materials.append(material)
    if parent:
        o.parent = parent
    return o


def key_frac(frames, t):
    return max(1, int(round(1 + (frames - 1) * t)))


def draw_on(obj, frames, t0, t1):
    cu = obj.data
    for f, v in ((1, 0.0), (key_frac(frames, t0), 0.0), (key_frac(frames, t1), 1.0)):
        cu.bevel_factor_end = v
        cu.keyframe_insert("bevel_factor_end", frame=f)


def glow_keys(socket, frames, pairs):
    for t, v in pairs:
        socket.default_value = v
        socket.keyframe_insert("default_value", frame=key_frac(frames, t))


def visible_from(obj, frames, t):
    f = key_frac(frames, t)
    for fr, hidden in ((1, True), (max(1, f - 1), True), (f, False)):
        obj.hide_render = hidden
        obj.keyframe_insert("hide_render", frame=fr)


COPPER = (0.95, 0.45, 0.2)


# ---------------------------------------------------------------- props
def bulb(frames, on=0.0, color=(1.0, 0.75, 0.35), strength=25):
    root = empty("bulb")
    glass = sph("bulb_glass", (0, 0, 0.12), 0.1, mat("glass", (1, 1, 1), 0.05, alpha=0.25), (1, 1, 1.15), root)
    lathe("bulb_base", [(0.045, -0.02), (0.05, 0.0), (0.045, 0.02), (0.05, 0.04), (0.04, 0.06), (0.0, 0.06)],
          mat("brass", (0.8, 0.65, 0.3), 0.3, 0.9), parent=root, loc=(0, 0, -0.02))
    fmat, fstr = fx.emissive("filament", color, 0)
    pts = [V((0.03 * math.sin(i * 0.8), 0, 0.09 + 0.004 * i)) for i in range(14)]
    curve_obj("filament", pts, 0.0035, fmat, root)
    light = bpy.data.lights.new("bulb_light", "POINT")
    light.color, light.shadow_soft_size = color, 0.05
    lo = child(bpy.data.objects.new("bulb_light", light), root)
    lo.location = (0, 0, 0.13)
    bpy.context.scene.collection.objects.link(lo)
    glow_keys(fstr, frames, [(0, 0), (max(0, on - 0.01), 0), (on, strength)])
    for t, e in ((0, 0), (max(0, on - 0.01), 0), (on, 60)):
        light.energy = e
        light.keyframe_insert("energy", frame=key_frac(frames, t))
    return root


def city(frames, seed=2, size=8.0, count=140, on=0.0):
    """Night skyline of boxes with lit windows that switch on in a sweep from `on`."""
    rng = random.Random(seed)
    root = empty("city")
    wall = mat("bldg", (0.03, 0.035, 0.06), 0.7)
    for i in range(count):
        x, y = rng.uniform(-size / 2, size / 2), rng.uniform(0, size)
        w, d, h = rng.uniform(0.25, 0.6), rng.uniform(0.25, 0.6), rng.uniform(0.4, 2.8) * (1 + y / size)
        b = box(f"b{i}", (x, y, h / 2), (w, d, h), wall, parent=root)
        col = rng.choice([(1, 0.75, 0.35), (1, 0.85, 0.55), (0.5, 0.8, 1.0), (1, 0.5, 0.25)])
        wm = bpy.data.materials.new(f"win{i}")
        wm.use_nodes = True
        nt = wm.node_tree
        p = nt.nodes["Principled BSDF"]
        p.inputs["Base Color"].default_value = (0.03, 0.035, 0.06, 1)
        tc = nt.nodes.new("ShaderNodeTexCoord")
        brick = nt.nodes.new("ShaderNodeTexBrick")
        brick.inputs["Scale"].default_value = 18
        brick.inputs["Mortar Size"].default_value = 0.04
        brick.inputs["Color1"].default_value = (*col, 1)
        brick.inputs["Color2"].default_value = (0, 0, 0, 1)
        brick.inputs["Mortar"].default_value = (0, 0, 0, 1)
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        nt.links.new(tc.outputs["Generated"], sep.inputs[0])
        add = nt.nodes.new("ShaderNodeMath")
        nt.links.new(sep.outputs["X"], add.inputs[0])
        nt.links.new(sep.outputs["Y"], add.inputs[1])
        comb = nt.nodes.new("ShaderNodeCombineXYZ")
        nt.links.new(add.outputs[0], comb.inputs["X"])
        nt.links.new(sep.outputs["Z"], comb.inputs["Y"])
        nt.links.new(comb.outputs[0], brick.inputs["Vector"])
        brick.inputs["Scale"].default_value = 6
        nt.links.new(brick.outputs["Color"], p.inputs["Emission Color"])
        st = p.inputs["Emission Strength"]
        t_on = on + (x + size / 2) / size * 0.3 if on else 0
        for t, v in ((0, 0 if on else 3), (t_on, 0 if on else 3), (min(1, t_on + 0.03), 3)):
            st.default_value = v
            st.keyframe_insert("default_value", frame=key_frac(frames, t))
        b.data.materials.clear()
        b.data.materials.append(wm)
    return root


def coil(frames, turns=12, radius=0.09, length=0.35, glow=None, color=COPPER, wire=0.008, axis="x"):
    root = empty("coil")
    pts = []
    n = turns * 24
    for i in range(n + 1):
        a = 2 * math.pi * i / 24
        u = -length / 2 + length * i / n
        pts.append(V((u, radius * math.cos(a), radius * math.sin(a))) if axis == "x" else
                   V((radius * math.cos(a), radius * math.sin(a), u)))
    m = mat("copper", color, 0.25, 1.0, emit=0.0, emit_color=(1.0, 0.5, 0.1))
    curve_obj("coil_wire", pts, wire, m, root)
    if glow:  # [[t, strength], ...] makes the wire glow with current
        es = m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
        m.node_tree.nodes["Principled BSDF"].inputs["Emission Color"].default_value = (1.0, 0.55, 0.1, 1)
        glow_keys(es, frames, glow)
    return root


def bar_magnet(frames, length=0.3, width=0.06):
    root = empty("magnet")
    box("mag_n", (length / 4, 0, 0), (length / 2, width, width), mat("mag_red", (0.85, 0.05, 0.05), 0.35), 0.006, root)
    box("mag_s", (-length / 4, 0, 0), (length / 2, width, width), mat("mag_blue", (0.05, 0.2, 0.85), 0.35), 0.006, root)
    for txt, x in (("N", length / 4), ("S", -length / 4)):
        t = fx.text(txt, mat("white", (1, 1, 1), 0.4, emit=1), (x, -width / 2 - 0.002, 0), size=width * 0.7, depth=0.002)
        t.parent = root
    return root


def horseshoe(frames, size=0.3):
    root = empty("horseshoe")
    pts = []
    for i in range(41):
        a = math.pi * i / 40
        pts.append(V((size * 0.5 * math.cos(a), 0, size * 0.25 + size * 0.5 * math.sin(a))))
    pts = [V((size * 0.5, 0, -size * 0.35))] + pts + [V((-size * 0.5, 0, -size * 0.35))]
    curve_obj("horseshoe", pts, size * 0.11, mat("hs_red", (0.85, 0.05, 0.05), 0.35), root)
    for x in (size * 0.5, -size * 0.5):
        cyl("tip", (x, 0, -size * 0.38), size * 0.112, size * 0.12, mat("tip", (0.75, 0.76, 0.8), 0.3, 1.0), parent=root)
    return root


def meter(frames, needle=((0, 0),), label="", size=0.25):
    """Galvanometer: wooden box with a dial; needle angles in degrees keyed at fractions."""
    root = empty("meter")
    box("meter_box", (0, 0, 0), (size, size * 0.45, size * 0.8), mat("wood", (0.35, 0.16, 0.06), 0.5), 0.01, root)
    face = cyl("dial", (0, -size * 0.23, size * 0.05), size * 0.36, 0.01, mat("dial", (0.95, 0.92, 0.82), 0.4),
               rot=(R(90), 0, 0), parent=root)
    for k in range(-4, 5):
        a = R(k * 12)
        box("tick", (math.sin(a) * size * 0.3, -size * 0.24, size * 0.05 + math.cos(a) * size * 0.3 - size * 0.12),
            (0.004, 0.003, size * 0.06), mat("ink", (0.05, 0.05, 0.05)), parent=root).rotation_euler = (0, a, 0)
    piv = child(empty("needle_pivot"), root)
    piv.location = (0, -size * 0.25, -size * 0.12)
    box("needle", (0, 0, size * 0.17), (0.006, 0.004, size * 0.34), mat("needle", (0.9, 0.05, 0.1), 0.3, emit=1), parent=piv)
    for t, deg in needle:
        props.key(piv, key_frac(frames, t), rotation_euler=(0, R(deg), 0))
    for k in range(2):
        cyl("terminal", ((k - 0.5) * size * 0.5, 0, size * 0.42), 0.012, 0.03, mat("brass", (0.8, 0.65, 0.3), 0.3, 0.9), parent=root)
    if label:
        t = fx.text(label, mat("lbl", (1, 1, 1), 0.4, emit=2), (0, -size * 0.24, -size * 0.3), size=size * 0.12, depth=0.003)
        t.parent = root
    return root


def books(frames, n=6, seed=1):
    rng = random.Random(seed)
    root = empty("books")
    z = 0
    cols = [(0.5, 0.08, 0.08), (0.1, 0.25, 0.5), (0.15, 0.4, 0.15), (0.45, 0.3, 0.1), (0.3, 0.1, 0.35)]
    for i in range(n):
        h = rng.uniform(0.03, 0.06)
        b = box(f"book{i}", (rng.uniform(-0.02, 0.02), rng.uniform(-0.02, 0.02), z + h / 2),
                (rng.uniform(0.2, 0.26), rng.uniform(0.28, 0.33), h), mat(f"cover{i}", rng.choice(cols), 0.6), 0.004, root)
        b.rotation_euler = (0, 0, R(rng.uniform(-12, 12)))
        box(f"pages{i}", (b.location.x + 0.006, b.location.y, b.location.z), (b.scale.x * 0.97, b.scale.y * 0.97, h * 0.8),
            mat("paper", (0.92, 0.88, 0.75), 0.8), parent=root).rotation_euler = b.rotation_euler
        z += h
    return root


def candle(frames, height=0.18):
    root = empty("candle")
    cyl("wax", (0, 0, height / 2), 0.03, height, mat("wax", (0.95, 0.92, 0.8), 0.5, emit=0.2, emit_color=(1, 0.8, 0.5)), parent=root)
    fm, fs = fx.emissive("flame", (1.0, 0.6, 0.15), 18)
    flame = sph("flame", (0, 0, height + 0.03), 0.014, fm, (1, 1, 2.2), root)
    for f in range(1, frames + 1, 3):
        props.key(flame, f, scale=(1 + 0.08 * math.sin(f * 1.7), 1, 2.2 + 0.3 * math.sin(f * 2.3)))
    light = bpy.data.lights.new("candle_light", "POINT")
    light.energy, light.color, light.shadow_soft_size = 25, (1, 0.6, 0.25), 0.02
    lo = bpy.data.objects.new("candle_light", light)
    bpy.context.scene.collection.objects.link(lo)
    lo.parent = root
    lo.location = (0, 0, height + 0.05)
    return root


def amber(frames, lift=(0.3, 0.8)):
    root = empty("amber")
    rod = cyl("amber_rod", (0, 0, 0.2), 0.03, 0.35, mat("amber", (1.0, 0.5, 0.05), 0.15, emit=0.6), rot=(0, R(70), 0), parent=root)
    fm = mat("feather", (0.95, 0.95, 0.98), 0.7)
    rng = random.Random(5)
    for i in range(7):
        x0, y0 = rng.uniform(-0.15, 0.15), rng.uniform(-0.08, 0.08)
        f = sph(f"feather{i}", (x0, y0, 0.005), 0.03, fm, (1, 0.25, 0.04), root)
        f.rotation_euler = (0, 0, R(rng.uniform(0, 180)))
        t0, t1 = lift[0] + rng.uniform(0, 0.15), lift[1]
        props.key(f, key_frac(frames, t0), location=(x0, y0, 0.005))
        props.key(f, key_frac(frames, t1), location=(x0 * 0.5, y0 * 0.5, 0.13 + rng.uniform(0, 0.05)))
    return root


def kite(frames, spark=0.6):
    root = empty("kite")
    m = mat("kite", (0.9, 0.15, 0.2), 0.6)
    mesh = bpy.data.meshes.new("kite")
    mesh.from_pydata([(0, 0, 0.5), (0.3, 0, 0.1), (0, 0, -0.5), (-0.3, 0, 0.1)], [], [(0, 1, 2, 3)])
    k = bpy.data.objects.new("kite", mesh)
    bpy.context.scene.collection.objects.link(k)
    k.data.materials.append(m)
    k.parent = root
    k.location = (0, 0, 3.0)
    string = curve_obj("string", [V((0, 0, 2.5)), V((0.3, 0, 1.4)), V((0.5, 0, 0.0))], 0.004,
                       mat("string", (0.9, 0.85, 0.7)), root)
    key_o = box("key", (0.5, 0, -0.05), (0.02, 0.005, 0.07), mat("brass", (0.8, 0.65, 0.3), 0.3, 0.9), parent=root)
    sm, ss = fx.emissive("spark", (0.6, 0.85, 1.0), 0)
    sp = sph("spark", (0.5, -0.01, -0.1), 0.02, sm, parent=root)
    glow_keys(ss, frames, [(0, 0), (spark, 0), (spark + 0.02, 40), (spark + 0.06, 0), (spark + 0.1, 30), (spark + 0.14, 0)])
    for f in range(1, frames + 1, 4):
        props.key(k, f, rotation_euler=(R(5 * math.sin(f * 0.2)), R(8 * math.sin(f * 0.13)), 0))
    return root


def voltaic_pile(frames, n=14, build=(0.05, 0.6), glow=(0.7, 1.0)):
    root = empty("pile")
    zinc, cop, cloth = mat("zinc", (0.75, 0.78, 0.8), 0.35, 1.0), mat("cu", COPPER, 0.3, 1.0), mat("cloth", (0.55, 0.4, 0.25), 0.9)
    h = 0.018
    for i in range(n):
        m = (zinc, cloth, cop)[i % 3]
        d = cyl(f"disc{i}", (0, 0, h / 2 + i * h), 0.07, h * 0.9, m, parent=root)
        t = build[0] + (build[1] - build[0]) * i / n
        props.key(d, 1, location=(0, 0, h / 2 + i * h + 0.6))
        props.key(d, key_frac(frames, t), location=(0, 0, h / 2 + i * h + 0.6))
        props.key(d, key_frac(frames, t + 0.04), location=(0, 0, h / 2 + i * h))
        visible_from(d, frames, t)
    for x in (-0.09, 0.09):
        cyl("rod", (x, 0, n * h / 2), 0.006, n * h + 0.05, mat("glassrod", (0.9, 0.9, 1), 0.1, alpha=0.4), parent=root)
    wm, ws = fx.emissive("pile_current", (0.3, 0.8, 1.0), 0)
    top = n * h
    curve_obj("pile_wire", [V((0, 0, top)), V((0, 0, top + 0.12)), V((0.25, 0, top + 0.12)), V((0.25, 0, 0.0)),
                            V((0.08, 0, 0.0))], 0.006, wm, root)
    glow_keys(ws, frames, [(0, 0), (glow[0], 0), (glow[0] + 0.05, 8)])
    return root


def audience(frames, rows=4, per_row=9, radius=2.2, react=None, seed=3):
    """Tiered benches in an arc with simple seated figures; `react` fraction makes them jump."""
    rng = random.Random(seed)
    root = empty("hall")
    wood = mat("bench", (0.4, 0.2, 0.08), 0.6)
    pal = [(0.15, 0.2, 0.45), (0.35, 0.1, 0.1), (0.2, 0.3, 0.15), (0.3, 0.25, 0.2), (0.12, 0.12, 0.14)]
    skin = mat("aud_skin", (0.75, 0.55, 0.45), 0.6)
    for r in range(rows):
        rad = radius + r * 0.55
        z = r * 0.3
        for k in range(per_row):
            a = R(-55 + 110 * k / (per_row - 1))
            x, y = rad * math.sin(a), rad * math.cos(a)
            b = box("bench", (x, y, z + 0.2), (0.5, 0.25, 0.4), wood, parent=root)
            b.rotation_euler = (0, 0, -a)
            body = sph("aud", (x, y, z + 0.62), 0.11, mat(f"coat{r}{k}", rng.choice(pal), 0.7), (1, 0.8, 1.5), root)
            head = sph("aud_head", (x, y, z + 0.92), 0.085, skin, parent=root)
            if react:
                for o, base in ((body, z + 0.62), (head, z + 0.92)):
                    t = react + rng.uniform(0, 0.04)
                    props.key(o, key_frac(frames, t), location=(x, y, base))
                    props.key(o, key_frac(frames, t + 0.04), location=(x, y, base + 0.08))
                    props.key(o, key_frac(frames, t + 0.09), location=(x, y, base))
    return root


def table(frames, w=1.6, d=0.7, h=0.85, color=(0.4, 0.2, 0.08)):
    root = empty("table")
    m = mat("table", color, 0.5)
    box("top", (0, 0, h), (w, d, 0.05), m, 0.01, root)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box("leg", (sx * (w / 2 - 0.05), sy * (d / 2 - 0.05), h / 2), (0.05, 0.05, h), m, parent=root)
    return root


def glassware(frames, n=4, seed=2, colors=((0.2, 0.8, 0.4), (0.9, 0.3, 0.6), (0.3, 0.6, 1.0), (1.0, 0.7, 0.1))):
    rng = random.Random(seed)
    root = empty("glassware")
    glass = mat("glass", (0.95, 0.97, 1.0), 0.05, alpha=0.3)
    for i in range(n):
        x = (i - (n - 1) / 2) * 0.16
        s = rng.uniform(0.8, 1.2)
        if i % 2 == 0:
            prof = [(0.0, 0), (0.06 * s, 0), (0.065 * s, 0.05), (0.02, 0.16 * s), (0.02, 0.22 * s)]
        else:
            prof = [(0.0, 0), (0.035 * s, 0), (0.035 * s, 0.2 * s), (0.02, 0.24 * s)]
        lathe(f"glass{i}", prof, glass, parent=root, loc=(x, 0, 0))
        liq = mat(f"liq{i}", colors[i % len(colors)], 0.1, emit=0.8)
        cyl(f"liquid{i}", (x, 0, 0.025), 0.05 * s if i % 2 == 0 else 0.03 * s, 0.05, liq, parent=root)
    return root


def compass(frames, needle=((0, 0),)):
    root = empty("compass")
    cyl("comp_body", (0, 0, 0.01), 0.1, 0.02, mat("brass", (0.8, 0.65, 0.3), 0.3, 0.9), parent=root)
    cyl("comp_face", (0, 0, 0.021), 0.09, 0.002, mat("dial", (0.95, 0.92, 0.82), 0.4), parent=root)
    piv = child(empty("comp_pivot"), root)
    piv.location = (0, 0, 0.026)
    box("needle_n", (0.035, 0, 0), (0.07, 0.012, 0.004), mat("n_red", (0.9, 0.05, 0.05), 0.3, emit=0.5), parent=piv)
    box("needle_s", (-0.035, 0, 0), (0.07, 0.012, 0.004), mat("s_white", (0.9, 0.9, 0.9), 0.3), parent=piv)
    for t, deg in needle:
        props.key(piv, key_frac(frames, t), rotation_euler=(0, 0, R(deg)))
    return root


def wire(frames, length=0.8, glow=None, color=COPPER):
    root = empty("wire")
    m = mat("wire", color, 0.3, 1.0)
    cyl("wire", (0, 0, 0), 0.008, length, m, rot=(0, R(90), 0), parent=root)
    if glow:
        p = m.node_tree.nodes["Principled BSDF"]
        p.inputs["Emission Color"].default_value = (0.3, 0.8, 1.0, 1)
        glow_keys(p.inputs["Emission Strength"], frames, glow)
    return root


def mercury_motor(frames, start=0.2, turns=3):
    root = empty("motor")
    lathe("cup", [(0, 0), (0.11, 0), (0.12, 0.07), (0.115, 0.075)], mat("glass", (0.9, 0.95, 1), 0.05, alpha=0.35), parent=root)
    cyl("mercury", (0, 0, 0.03), 0.105, 0.04, mat("mercury", (0.85, 0.86, 0.9), 0.08, 1.0), parent=root)
    mag = bar_magnet(frames, 0.16, 0.035)
    mag.parent = root
    mag.location, mag.rotation_euler = (0, 0, 0.08), (0, R(90), 0)
    piv = child(empty("motor_pivot"), root)
    piv.location = (0, 0, 0.32)
    wm = mat("motor_wire", COPPER, 0.3, 1.0, emit=3, emit_color=(1, 0.55, 0.1))
    curve_obj("hanging", [V((0, 0, 0)), V((0.04, 0, -0.12)), V((0.07, 0, -0.27))], 0.004, wm, piv)
    box("stand", (0, 0.13, 0.17), (0.02, 0.02, 0.34), mat("wood", (0.35, 0.16, 0.06), 0.5), parent=root)
    box("arm", (0, 0.065, 0.335), (0.02, 0.13, 0.02), mat("wood", (0.35, 0.16, 0.06), 0.5), parent=root)
    f0 = key_frac(frames, start)
    props.key(piv, 1, rotation_euler=(0, 0, 0))
    props.key(piv, f0, rotation_euler=(0, 0, 0))
    props.key(piv, frames, rotation_euler=(0, 0, R(360 * turns)))
    fx._linear(piv)
    return root


def iron_ring(frames, pulse=None):
    """Faraday's induction ring: an iron torus with two copper windings; pulse=[t...] flashes field lines."""
    root = empty("ring")
    props.torus("iron", (0, 0, 0), 0.22, 0.04, mat("iron", (0.3, 0.3, 0.32), 0.45, 0.8)).parent = root
    for side, col in ((-1, (1.0, 0.45, 0.15)), (1, (0.95, 0.6, 0.2))):
        pts = []
        n = 300
        for i in range(n + 1):
            u = R(side * 90 - 40 + 80 * i / n)
            a = i * 0.9
            c = V((0.22 * math.cos(u), 0.22 * math.sin(u), 0))
            radial = V((math.cos(u), math.sin(u), 0))
            pts.append(c + radial * 0.052 * math.cos(a) + V((0, 0, 0.052 * math.sin(a))))
        curve_obj(f"winding{side}", pts, 0.006, mat(f"wind{side}", col, 0.3, 1.0), root)
    if pulse:
        fm, fs = fx.emissive("ring_field", (0.4, 0.8, 1.0), 0)
        ring = props.torus("field", (0, 0, 0), 0.22, 0.046, fm)
        ring.parent = root
        pairs = [(0, 0)]
        for t in pulse:
            pairs += [(t, 0), (t + 0.02, 6), (t + 0.08, 0)]
        glow_keys(fs, frames, sorted(pairs))
    return root


def battery(frames):
    root = empty("battery")
    box("bat", (0, 0, 0.1), (0.18, 0.12, 0.2), mat("bat", (0.15, 0.15, 0.18), 0.5), 0.01, root)
    cyl("bat_plus", (0.05, 0, 0.21), 0.015, 0.03, mat("red", (0.9, 0.1, 0.1), 0.4), parent=root)
    cyl("bat_minus", (-0.05, 0, 0.21), 0.015, 0.03, mat("black", (0.05, 0.05, 0.05), 0.4), parent=root)
    return root


def faraday_disk(frames, spin=(0.1, 1.0), turns=4, glow=(0.3, 1.0)):
    root = empty("fdisk")
    piv = child(empty("disk_pivot"), root)
    piv.location = (0, 0, 0.45)
    cyl("disk", (0, 0, 0), 0.22, 0.01, mat("cu", COPPER, 0.25, 1.0), rot=(R(90), 0, 0), parent=piv, verts=96)
    for k in range(8):  # spokes so the spin reads
        a = R(k * 45)
        box("mark", (0.15 * math.cos(a), -0.006, 0.15 * math.sin(a)), (0.03, 0.002, 0.008),
            mat("dark", (0.3, 0.12, 0.05), 0.4), parent=piv).rotation_euler = (0, -a, 0)
    cyl("axle", (0, 0.1, 0.45), 0.012, 0.25, mat("steel", (0.7, 0.7, 0.75), 0.3, 1.0), rot=(R(90), 0, 0), parent=root)
    hs = horseshoe(frames, 0.22)
    hs.parent = root
    hs.location, hs.rotation_euler = (0, 0, 0.17), (R(180), 0, R(90))  # poles straddle the rim, arch below
    f0, f1 = key_frac(frames, spin[0]), key_frac(frames, spin[1])
    props.key(piv, 1, rotation_euler=(0, 0, 0))
    props.key(piv, f0, rotation_euler=(0, 0, 0))
    props.key(piv, f1, rotation_euler=(0, R(360 * turns), 0))
    cm, cs = fx.emissive("disk_current", (0.3, 0.8, 1.0), 0)
    curve_obj("out_wire", [V((0, -0.02, 0.45)), V((0, -0.15, 0.45)), V((0.4, -0.15, 0.45)), V((0.4, -0.15, 0.2)),
                           V((0.24, -0.02, 0.2))], 0.006, cm, root)
    glow_keys(cs, frames, [(0, 0), (glow[0], 0), (glow[0] + 0.05, 7)])
    return root


def generator_hall(frames, n=4, spin=True):
    root = empty("hall")
    green = mat("gen", (0.1, 0.45, 0.35), 0.35, 0.3)
    for i in range(n):
        x = (i - (n - 1) / 2) * 2.2
        cyl("gen_body", (x, 0, 0.7), 0.7, 1.6, green, rot=(R(90), 0, 0), parent=root, verts=64)
        cyl("gen_ring", (x, -0.8, 0.7), 0.75, 0.1, mat("ring", (0.85, 0.75, 0.2), 0.3, 0.8), rot=(R(90), 0, 0), parent=root)
        hub = cyl("hub", (x, -0.86, 0.7), 0.25, 0.08, mat("steel", (0.7, 0.7, 0.75), 0.3, 1.0), rot=(R(90), 0, 0), parent=root)
        if spin:
            props.key(hub, 1, rotation_euler=(R(90), 0, 0))
            props.key(hub, frames, rotation_euler=(R(90), R(720), 0))
            fx._linear(hub)
        box("light", (x, -0.81, 1.25), (0.3, 0.02, 0.05), mat("ind", (0.2, 1.0, 0.4), 0.3, emit=4), parent=root)
    box("floor_stripe", (0, -1.5, 0.005), (n * 2.2, 0.08, 0.01), mat("stripe", (1, 0.8, 0.1), 0.5, emit=0.5), parent=root)
    return root


def dipole_lines(frames, n=8, scale=1.0, draw=(0.1, 0.7), color=(0.3, 0.85, 1.0)):
    """Field lines of a bar magnet in the XZ plane... (magnet along X)."""
    root = empty("field")
    m, _ = fx.emissive("fieldline", color, 3)
    for k in range(1, n + 1):
        c = 0.12 + 0.1 * k
        for sgn in (1, -1):
            pts = []
            for i in range(61):
                th = R(8 + 164 * i / 60)
                r = c * math.sin(th) ** 2 * 1.6
                pts.append(V((r * math.cos(th), 0, sgn * r * math.sin(th))) * scale)
            o = curve_obj(f"fl{k}{sgn}", pts, 0.003 * scale, m, root)
            draw_on(o, frames, draw[0], draw[1])
    return root


def filings(frames, count=900, area=(1.1, 0.7), align=(0.15, 0.6), seed=4):
    """Iron filings scattered on paper that snap into the dipole field of a bar magnet at the origin (along X)."""
    rng = random.Random(seed)
    root = empty("filings")
    box("paper", (0, 0, 0.002), (area[0] * 1.1, area[1] * 1.1, 0.004), mat("paper", (0.93, 0.9, 0.82), 0.9), parent=root)
    verts, faces = [], []
    starts, ends = [], []
    for i in range(count):
        x, y = rng.uniform(-area[0] / 2, area[0] / 2), rng.uniform(-area[1] / 2, area[1] / 2)
        if abs(x) < 0.17 and abs(y) < 0.05:
            continue
        # dipole field direction at (x, y) for charges at +-0.12 along X
        f = V((0, 0, 0))
        for qx, q in ((0.12, 1), (-0.12, -1)):
            d = V((x - qx, y, 0))
            f += d * (q / max(1e-4, d.length ** 3))
        ang_end = math.atan2(f.y, f.x)
        starts.append((x, y, rng.uniform(0, math.pi)))
        ends.append(ang_end)
    # one object per filing would be slow; use a mesh per state and a shape key between them
    L, Wd = 0.016, 0.0028

    def quad(x, y, a):
        c, s = math.cos(a), math.sin(a)
        z = 0.0045
        return [(x + c * L - s * Wd, y + s * L + c * Wd, z), (x - c * L - s * Wd, y - s * L + c * Wd, z),
                (x - c * L + s * Wd, y - s * L - c * Wd, z), (x + c * L + s * Wd, y + s * L - c * Wd, z)]
    for (x, y, a0) in starts:
        b = len(verts)
        verts += quad(x, y, a0)
        faces.append((b, b + 1, b + 2, b + 3))
    mesh = bpy.data.meshes.new("filings")
    mesh.from_pydata(verts, [], faces)
    o = bpy.data.objects.new("filings", mesh)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat("iron_dust", (0.12, 0.12, 0.13), 0.5, 0.8))
    o.parent = root
    o.shape_key_add(name="Basis")
    k = o.shape_key_add(name="aligned")
    for i, ((x, y, _), a1) in enumerate(zip(starts, ends)):
        for j, co in enumerate(quad(x, y, a1)):
            k.data[i * 4 + j].co = co
    for t, v in ((0, 0), (align[0], 0), (align[1], 1)):
        k.value = v
        k.keyframe_insert("value", frame=key_frac(frames, t))
    mag = bar_magnet(frames, 0.3, 0.07)
    mag.parent = root
    mag.location = (0, 0, 0.036)
    return root


def em_wave(frames, length=2.4, cycles=3.0, speed=1.0, draw=(0.0, 0.3)):
    root = empty("wave")
    for name, col, axis in (("E", (1.0, 0.2, 0.4), "z"), ("B", (0.2, 0.6, 1.0), "y")):
        m, _ = fx.emissive("wave" + name, col, 4)
        pts = []
        for i in range(241):
            u = i / 240
            v = 0.2 * math.sin(2 * math.pi * cycles * u)
            pts.append(V((u * length - length / 2, v if axis == "y" else 0, v if axis == "z" else 0)))
        o = curve_obj("wave" + name, pts, 0.008, m, root)
        draw_on(o, frames, draw[0], draw[1])
        props.key(o, 1, location=(0, 0, 0))
        props.key(o, frames, location=(speed * 0.3, 0, 0))
    axis_m = mat("axis", (0.8, 0.8, 0.9), 0.4, emit=0.5)
    cyl("axis", (0, 0, 0), 0.003, length, axis_m, rot=(0, R(90), 0), parent=root)
    return root


def radio_tower(frames, pulse_every=0.25):
    root = empty("tower")
    m = mat("tower", (0.85, 0.15, 0.15), 0.4, 0.5)
    for i in range(4):
        a = R(45 + 90 * i)
        curve_obj("leg", [V((0.35 * math.cos(a), 0.35 * math.sin(a), 0)), V((0.03 * math.cos(a), 0.03 * math.sin(a), 2.4))],
                  0.015, m, root)
    for z in (0.5, 1.0, 1.5, 2.0):
        r = 0.35 * (1 - z / 2.5)
        props.torus("brace", (0, 0, z), r, 0.008, m).parent = root
    tip_m, _ = fx.emissive("tip", (1, 0.2, 0.2), 10)
    sph("tip", (0, 0, 2.45), 0.04, tip_m, parent=root)
    every = max(4, int(frames * pulse_every))
    for r in space.ring_pulse("radio", (0, 0, 2.45), (0.3, 0.9, 1.0), frames, every, max_scale=1.6):
        r.parent = root
    return root


def phone(frames, glow=0.5):
    root = empty("phone")
    box("phone_body", (0, 0, 0), (0.08, 0.01, 0.16), mat("phone", (0.05, 0.05, 0.07), 0.3), 0.008, root)
    sm, ss = fx.emissive("screen", (0.3, 0.6, 1.0), 0.2)
    box("screen", (0, -0.0055, 0), (0.07, 0.001, 0.145), sm, parent=root)
    glow_keys(ss, frames, [(0, 0.2), (glow, 0.2), (glow + 0.05, 3)])
    return root


def cage(frames, size=1.2, strikes=(0.3, 0.55, 0.8)):
    root = empty("cage")
    bpy.ops.mesh.primitive_cube_add(size=size, location=(0, 0, size / 2))
    c = bpy.context.active_object
    c.name = "cage"
    sub = c.modifiers.new("sub", "SUBSURF")
    sub.subdivision_type = "SIMPLE"
    sub.levels = sub.render_levels = 3
    w = c.modifiers.new("wire", "WIREFRAME")
    w.thickness = 0.012
    c.data.materials.append(mat("cage_metal", (0.8, 0.82, 0.86), 0.3, 1.0))
    c.parent = root
    for i, t in enumerate(strikes):
        fx.bolt(V((random.Random(i).uniform(-1.5, 1.5), 1.0, 5.0)), V((0, 0, size)), key_frac(frames, t), seed=20 + i,
                width=0.02, hold=4)
    return root


def street_lamps(frames, n=6, spacing=1.4, on=(0.15, 0.8)):
    root = empty("lamps")
    post = mat("post", (0.08, 0.1, 0.1), 0.4, 0.6)
    for i in range(n):
        y = i * spacing
        cyl("post", (0, y, 1.2), 0.04, 2.4, post, parent=root)
        box("arm", (0.15, y, 2.4), (0.35, 0.04, 0.04), post, parent=root)
        gm = mat(f"lampglass{i}", (1.0, 0.85, 0.5), 0.2, emit=0.0, emit_color=(1.0, 0.75, 0.35))
        g = sph("lamp", (0.3, y, 2.3), 0.09, gm, (1, 1, 1.3), root)
        t = on[0] + (on[1] - on[0]) * i / max(1, n - 1)
        glow_keys(gm.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"], frames, [(0, 0), (t, 0), (t + 0.02, 12)])
        light = bpy.data.lights.new("lamp", "POINT")
        light.color = (1, 0.75, 0.4)
        lo = bpy.data.objects.new("lamp_light", light)
        bpy.context.scene.collection.objects.link(lo)
        lo.parent = root
        lo.location = (0.3, y, 2.15)
        for tt, e in ((0, 0), (t, 0), (t + 0.02, 120)):
            light.energy = e
            light.keyframe_insert("energy", frame=key_frac(frames, tt))
    return root


def portraits(frames, labels=("NEWTON", "FARADAY", "MAXWELL"), highlight=1):
    root = empty("portraits")
    frame_m = mat("gilt", (0.85, 0.65, 0.25), 0.3, 1.0)
    for i, name in enumerate(labels):
        x = (i - (len(labels) - 1) / 2) * 0.75
        box("frame", (x, 0, 0), (0.55, 0.04, 0.7), frame_m, 0.01, root)
        canvas = mat(f"canvas{i}", (0.25, 0.2, 0.15) if i != highlight else (0.35, 0.25, 0.15), 0.8)
        box("canvas", (x, -0.022, 0), (0.45, 0.01, 0.6), canvas, parent=root)
        sph("sil_head", (x, -0.03, 0.08), 0.09, mat("sil", (0.08, 0.06, 0.05), 0.8), (1, 0.2, 1.2), root)
        sph("sil_body", (x, -0.03, -0.18), 0.17, mat("sil", (0.08, 0.06, 0.05), 0.8), (1, 0.2, 0.7), root)
        t = fx.text(name, mat("plaque", (1, 0.85, 0.4), 0.3, emit=1.5 if i == highlight else 0.4), (x, -0.05, -0.45),
                    size=0.07, depth=0.005)
        t.parent = root
    return root


def wall_switch(frames, flip=0.4):
    root = empty("switch")
    box("plate", (0, 0, 0), (0.12, 0.015, 0.18), mat("plate", (0.95, 0.95, 0.92), 0.3), 0.005, root)
    piv = child(empty("toggle_pivot"), root)
    piv.location = (0, -0.012, 0)
    box("toggle", (0, -0.015, 0.02), (0.03, 0.03, 0.05), mat("toggle", (0.9, 0.9, 0.88), 0.3), 0.004, piv)
    f = key_frac(frames, flip)
    props.key(piv, max(1, f - 2), rotation_euler=(R(25), 0, 0))
    props.key(piv, f, rotation_euler=(R(-25), 0, 0))
    props.key(piv, 1, rotation_euler=(R(25), 0, 0))
    return root


def newspapers(frames, headline="ELECTRICITY MAKES MAGNETISM!", n=4):
    root = empty("papers")
    paper = mat("newsprint", (0.92, 0.9, 0.84), 0.85)
    rng = random.Random(9)
    for i in range(n):
        b = box(f"paper{i}", (rng.uniform(-0.1, 0.1), rng.uniform(-0.05, 0.05), 0.005 + i * 0.006), (0.45, 0.6, 0.005),
                paper, parent=root)
        b.rotation_euler = (0, 0, R(rng.uniform(-15, 15)))
    t = fx.text(headline, mat("ink", (0.05, 0.05, 0.05), 0.6), (0, 0.15, 0.03), size=0.035, depth=0.001,
                rotation=(0, 0, 0))
    t.parent = root
    return root


def bread(frames):
    root = empty("bread")
    sph("loaf", (0, 0, 0.06), 0.1, mat("crust", (0.6, 0.35, 0.12), 0.7), (1.6, 1, 0.7), root)
    return root


def crown(frames):
    root = empty("crown")
    gold = mat("gold", (1.0, 0.75, 0.2), 0.25, 1.0)
    cyl("band", (0, 0, 0.05), 0.12, 0.1, gold, parent=root)
    for k in range(8):
        a = R(k * 45)
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.025, depth=0.08,
                                        location=(0.12 * math.cos(a), 0.12 * math.sin(a), 0.13))
        c = bpy.context.active_object
        c.data.materials.append(gold)
        c.parent = root
        sph("jewel", (0.12 * math.cos(a), 0.12 * math.sin(a), 0.175), 0.012, mat("ruby", (0.9, 0.05, 0.1), 0.1, emit=1), parent=root)
    return root


def medal(frames):
    root = empty("medal")
    cyl("medal", (0, 0, 0), 0.08, 0.012, mat("gold", (1.0, 0.75, 0.2), 0.25, 1.0), rot=(R(90), 0, 0), parent=root)
    box("ribbon", (0, 0, 0.16), (0.06, 0.005, 0.22), mat("ribbon", (0.1, 0.2, 0.7), 0.6), parent=root)
    return root


def route(frames, stops=("LONDON", "PARIS", "GENEVA", "ROME"), draw=(0.05, 0.85)):
    """A dotted travel path across a stylised map plane with labels popping at each stop."""
    root = empty("route")
    box("map", (0, 0, -0.01), (3.2, 2.0, 0.02), mat("map", (0.12, 0.3, 0.45), 0.8), parent=root)
    rng = random.Random(4)
    land = mat("land", (0.35, 0.55, 0.25), 0.8)
    for i in range(14):
        sph("land", (rng.uniform(-1.4, 1.4), rng.uniform(-0.8, 0.8), 0), rng.uniform(0.2, 0.45), land, (1.4, 1, 0.05), root)
    pts = [V((-1.2, 0.6, 0.05)), V((-0.6, 0.25, 0.05)), V((0.1, -0.05, 0.05)), V((0.9, -0.55, 0.05))][:len(stops)]
    m, _ = fx.emissive("route", (1.0, 0.85, 0.2), 5)
    smooth = []
    for a, b in zip(pts, pts[1:]):
        for k in range(20):
            u = k / 20
            smooth.append(a.lerp(b, u) + V((0, 0, 0.12 * math.sin(math.pi * u))))
    smooth.append(pts[-1])
    o = curve_obj("route_line", smooth, 0.012, m, root)
    draw_on(o, frames, draw[0], draw[1])
    pin_m = mat("pin", (1, 0.2, 0.3), 0.3, emit=2)
    for i, (p, name) in enumerate(zip(pts, stops)):
        t = draw[0] + (draw[1] - draw[0]) * i / max(1, len(pts) - 1)
        s = sph("stop", p, 0.04, pin_m, parent=root)
        fx.pop_in(s, key_frac(frames, t))
        lbl = fx.text(name, mat("lbl", (1, 1, 1), 0.4, emit=2), p + V((0, 0, 0.12)), size=0.1, depth=0.01)
        lbl.parent = root
        fx.pop_in(lbl, key_frac(frames, t))
    return root


def equations(frames, lines=("∇·E = ρ/ε₀", "∇·B = 0", "∇×E = −∂B/∂t",
                             "∇×B = μ₀J + μ₀ε₀∂E/∂t"), at=0.15):
    root = empty("eqs")
    m = mat("eq", (0.6, 0.9, 1.0), 0.3, emit=3)
    for i, line in enumerate(lines):
        t = fx.text(line, m, (0, 0, -i * 0.22), size=0.15, depth=0.01)
        t.parent = root
        fx.pop_in(t, key_frac(frames, at + i * 0.08))
    return root


def notebook(frames):
    root = empty("notebook")
    box("nb", (0, 0, 0.02), (0.22, 0.3, 0.04), mat("leather", (0.35, 0.12, 0.06), 0.6), 0.006, root)
    box("ribbon", (0.05, 0.0, 0.041), (0.012, 0.32, 0.002), mat("ribbon", (0.8, 0.1, 0.15), 0.5), parent=root)
    t = fx.text("NOTES", mat("goldleaf", (1, 0.8, 0.3), 0.3, 0.9), (0, 0, 0.042), size=0.04, depth=0.002, rotation=(0, 0, 0))
    t.parent = root
    return root


def turbine(frames, spin=2.0):
    """A wind turbine (tower + three blades)."""
    root = empty("turbine")
    white = mat("turb", (0.92, 0.93, 0.95), 0.4)
    cyl("tower", (0, 0, 1.5), 0.08, 3.0, white, parent=root)
    box("nacelle", (0, 0, 3.05), (0.15, 0.4, 0.15), white, 0.03, root)
    hub = child(empty("hub"), root)
    hub.location = (0, -0.22, 3.05)
    for k in range(3):
        b = box("blade", (0, 0, 0.75), (0.08, 0.02, 1.5), white, 0.01, None)
        p = child(empty("bp"), hub)
        p.rotation_euler = (0, R(k * 120), 0)
        b.parent = p
    props.key(hub, 1, rotation_euler=(0, 0, 0))
    props.key(hub, frames, rotation_euler=(0, R(360 * spin), 0))
    fx._linear(hub)
    return root


def figures(frames, n=5, spacing=0.35, seed=1, colors=None):
    """Simple stylised people (rounded body + head), e.g. children at a lecture."""
    rng = random.Random(seed)
    root = empty("figures")
    pal = colors or [(0.9, 0.3, 0.3), (0.3, 0.6, 0.95), (0.95, 0.75, 0.2), (0.4, 0.8, 0.45), (0.7, 0.45, 0.9)]
    for i in range(n):
        x = (i - (n - 1) / 2) * spacing
        h = rng.uniform(0.75, 0.95)
        c = mat(f"fig{i}", pal[i % len(pal)], 0.5)
        sph("fig_body", (x, 0, 0.25 * h), 0.12 * h, c, (1, 0.8, 1.9), root)
        sph("fig_head", (x, 0, 0.6 * h), 0.09 * h, mat("figskin", (0.85, 0.65, 0.5), 0.6), parent=root)
    return root


PROPS = {name: fn for name, fn in globals().items()
         if callable(fn) and not name.startswith("_") and fn.__module__ == __name__
         and name not in ("mat", "empty", "child", "box", "cyl", "sph", "curve_obj", "lathe", "key_frac", "draw_on",
                          "glow_keys", "visible_from")}
