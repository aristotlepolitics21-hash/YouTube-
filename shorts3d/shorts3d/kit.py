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


def _tree(obj):
    yield obj
    for c in obj.children:
        yield from _tree(c)


def hide_keys(obj, pairs):
    """Key hide_render on an object and all of its children: pairs = [(frame, hidden), ...]."""
    for o in _tree(obj):
        for fr, hidden in pairs:
            o.hide_render = hidden
            o.keyframe_insert("hide_render", frame=max(1, fr))


def visible_from(obj, frames, t):
    f = key_frac(frames, t)
    hide_keys(obj, ((1, True), (max(1, f - 1), True), (f, False)))


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



# ------------------------------------------------------------------ biology / medicine
def _fuzzy(name, loc, r, color, parent, seed=1, scale=(1, 1, 0.45)):
    o = sph(name, loc, r, mat(name, color, 0.9), scale, parent)
    tex = bpy.data.textures.new(name + "_tex", "CLOUDS")
    tex.noise_scale = r * 0.35
    d = o.modifiers.new("fuzz", "DISPLACE")
    d.texture, d.strength = tex, r * 0.35
    o.modifiers.new("smooth", "SUBSURF").levels = 1
    return o


def petri_dish(frames, mould=True, colonies=160, clear=(0.3, 0.8), seed=3, mould_grow=None):
    """Glass dish with agar, cream bacterial colonies, and a blue-green mould whose clear zone spreads."""
    rng = random.Random(seed)
    root = empty("petri")
    glass = mat("dish_glass", (0.95, 0.97, 1.0), 0.05, alpha=0.22)
    cyl("dish", (0, 0, 0.012), 0.2, 0.024, glass, parent=root, verts=96)
    cyl("lid_rim", (0, 0, 0.026), 0.205, 0.004, glass, parent=root, verts=96)
    cyl("agar", (0, 0, 0.008), 0.193, 0.014, mat("agar", (0.75, 0.42, 0.08), 0.3, emit=0.05), parent=root, verts=96)
    mx, my = 0.07, 0.04
    cmat = mat("colony", (0.95, 0.85, 0.55), 0.4)
    for i in range(colonies):
        a, rr = rng.uniform(0, 2 * math.pi), 0.185 * math.sqrt(rng.random())
        x, y = rr * math.cos(a), rr * math.sin(a)
        size = rng.uniform(0.004, 0.009)
        c = sph(f"col{i}", (x, y, 0.016), size, cmat, (1, 1, 0.4), root)
        d = math.hypot(x - mx, y - my)
        if mould and d < 0.115:
            t = clear[0] + (clear[1] - clear[0]) * max(0.0, (d - 0.035) / 0.08)
            props.key(c, 1, scale=(1, 1, 0.4))
            props.key(c, key_frac(frames, t), scale=(1, 1, 0.4))
            props.key(c, key_frac(frames, min(1, t + 0.08)), scale=(0, 0, 0))
    if mould:
        m = _fuzzy("mould", (mx, my, 0.02), 0.035, (0.05, 0.38, 0.3), root)
        _fuzzy("mould_rim", (mx, my, 0.017), 0.045, (0.9, 0.95, 0.85), root).scale = (1, 1, 0.2)
        if mould_grow:
            for o in (m,):
                props.key(o, key_frac(frames, mould_grow[0]), scale=(0.01, 0.01, 0.005))
                props.key(o, key_frac(frames, mould_grow[1]), scale=(1, 1, 0.45))
    return root


def microscope(frames):
    root = empty("microscope")
    black, steel = mat("scope_black", (0.05, 0.05, 0.06), 0.35, 0.5), mat("steel", (0.75, 0.76, 0.8), 0.25, 1.0)
    box("base", (0, 0.03, 0.02), (0.22, 0.28, 0.04), black, 0.01, root)
    box("arm", (0, 0.12, 0.2), (0.05, 0.05, 0.34), black, 0.01, root).rotation_euler = (R(-12), 0, 0)
    box("stage", (0, 0.0, 0.16), (0.16, 0.16, 0.012), black, 0.004, root)
    cyl("tube", (0, 0.02, 0.33), 0.03, 0.22, black, rot=(R(-12), 0, 0), parent=root)
    cyl("eyepiece", (0, 0.045, 0.45), 0.018, 0.06, steel, rot=(R(-12), 0, 0), parent=root)
    cyl("objective", (0, 0.0, 0.215), 0.012, 0.05, steel, parent=root)
    cyl("slide", (0, 0.0, 0.168), 0.03, 0.002, mat("slide", (0.9, 0.95, 1), 0.05, alpha=0.4), parent=root)
    return root


def bacteria(frames, n=24, burst=None, color=(0.55, 0.85, 0.3), resistant=0, area=0.5, seed=5, drift=0.05):
    """Rod-shaped bacteria drifting; at `burst` their walls fail and they pop (resistant ones survive, glowing red)."""
    rng = random.Random(seed)
    root = empty("bacteria")
    m = mat("bact", color, 0.35, emit=0.15)
    rm = mat("bact_res", (0.9, 0.15, 0.15), 0.35, emit=1.2)
    for i in range(n):
        x, y, z = rng.uniform(-area, area), rng.uniform(-area * 0.6, area * 0.6), rng.uniform(0.0, area * 0.6)
        res = i < resistant
        b = sph(f"bac{i}", (x, y, z), 0.03, rm if res else m, (2.4, 1, 1), root)
        b.rotation_euler = (rng.uniform(0, 3), rng.uniform(0, 3), rng.uniform(0, 3))
        dx, dy = rng.uniform(-drift, drift), rng.uniform(-drift, drift)
        props.key(b, 1, location=(x, y, z))
        props.key(b, frames, location=(x + dx, y + dy, z + rng.uniform(-drift, drift)))
        if burst is not None and not res:
            t = burst + rng.uniform(0, 0.25)
            f = key_frac(frames, t)
            props.key(b, max(1, f - 3), scale=(2.4, 1, 1))
            props.key(b, f, scale=(3.0, 1.35, 1.35))
            props.key(b, f + 2, scale=(0, 0, 0))
    return root


def molecule(frames, spin=180):
    """Ball-and-stick penicillin core: the four-membered beta-lactam ring fused to a five-membered ring."""
    root = empty("molecule")
    C, N, O, S = mat("C", (0.2, 0.2, 0.22), 0.3), mat("N", (0.2, 0.4, 1.0), 0.3), mat("O", (1.0, 0.15, 0.15), 0.3), mat("S", (1.0, 0.85, 0.1), 0.3)
    atoms = {"c1": ((0, 0, 0), C), "c2": ((0.3, 0, 0), C), "n": ((0.3, 0.3, 0), N), "c3": ((0, 0.3, 0), C),
             "o1": ((-0.25, -0.15, 0), O), "s": ((0.15, 0.6, 0.1), S), "c4": ((0.65, 0.5, 0.05), C), "c5": ((0.6, 0.2, 0.05), C),
             "o2": ((0.95, 0.15, 0.1), O), "c6": ((-0.2, 0.55, -0.1), C)}
    for name, (p, m) in atoms.items():
        sph(name, p, 0.07 if m is not C else 0.08, m, parent=root)
    bonds = [("c1", "c2"), ("c2", "n"), ("n", "c3"), ("c3", "c1"), ("c1", "o1"), ("c3", "s"), ("s", "c4"), ("c4", "c5"),
             ("c5", "n"), ("c5", "o2"), ("c3", "c6")]
    stick = mat("stick", (0.85, 0.85, 0.88), 0.4)
    for a, b in bonds:
        pa, pb = V(atoms[a][0]), V(atoms[b][0])
        mid, d = (pa + pb) / 2, pb - pa
        o = cyl("bond", mid, 0.02, d.length, stick, parent=root)
        o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    ring_m, _ = fx.emissive("lactam", (0.3, 1.0, 0.6), 3)
    curve_obj("lactam_ring", [V((0, 0, 0)), V((0.3, 0, 0)), V((0.3, 0.3, 0)), V((0, 0.3, 0)), V((0, 0, 0))], 0.008, ring_m, root)
    props.key(root, 1, rotation_euler=(0, 0, 0))
    props.key(root, frames, rotation_euler=(R(20), 0, R(spin)))
    return root


def mouse_cage(frames, n=4, alive=True, seed=2):
    rng = random.Random(seed)
    root = empty("cage_mice")
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.12))
    c = bpy.context.active_object
    c.scale = (0.5, 0.32, 0.24)
    sub = c.modifiers.new("sub", "SUBSURF")
    sub.subdivision_type, sub.levels, sub.render_levels = "SIMPLE", 3, 3
    c.modifiers.new("wire", "WIREFRAME").thickness = 0.004
    c.data.materials.append(mat("cage", (0.8, 0.8, 0.85), 0.3, 1.0))
    c.parent = root
    fur = mat("fur", (0.92, 0.9, 0.88), 0.8)
    pink = mat("pink", (1.0, 0.6, 0.65), 0.5)
    for i in range(n):
        x, y = -0.18 + 0.12 * i, rng.uniform(-0.06, 0.06)
        body = sph(f"mouse{i}", (x, y, 0.03), 0.035, fur, (1.5, 1, 0.85), root)
        sph("ear", (x + 0.04, y + 0.02, 0.06), 0.012, pink, (1, 0.4, 1), root)
        sph("ear", (x + 0.04, y - 0.02, 0.06), 0.012, pink, (1, 0.4, 1), root)
        curve_obj("tail", [V((x - 0.05, y, 0.02)), V((x - 0.09, y + 0.02, 0.01)), V((x - 0.13, y - 0.01, 0.005))], 0.003, pink, root)
        if alive:
            for f in range(1, frames + 1, 6):
                props.key(body, f, location=(x + 0.01 * math.sin(f * 0.3 + i), y, 0.03 + 0.005 * abs(math.sin(f * 0.5 + i))))
        else:
            body.rotation_euler = (R(90), 0, 0)
    return root


def vessels(frames, kinds=("bedpan", "churn", "bath", "churn", "bedpan"), spacing=0.55, seed=1):
    """Heatley's improvised culture vessels: bedpans, milk churns and a bath, each with a mould mat."""
    root = empty("vessels")
    steel = mat("enamel", (0.9, 0.9, 0.88), 0.35)
    tin = mat("tin", (0.75, 0.76, 0.78), 0.3, 1.0)
    for i, k in enumerate(kinds):
        x = (i - (len(kinds) - 1) / 2) * spacing
        if k == "bedpan":
            lathe("bedpan", [(0, 0), (0.17, 0), (0.2, 0.05), (0.19, 0.06), (0.0, 0.06)], steel, parent=root, loc=(x, 0, 0))
            _fuzzy("mat", (x, 0, 0.06), 0.17, (0.3, 0.6, 0.45), root, scale=(1, 1, 0.08))
        elif k == "churn":
            lathe("churn", [(0, 0), (0.13, 0), (0.14, 0.3), (0.08, 0.42), (0.08, 0.5), (0.1, 0.52), (0, 0.52)], tin, parent=root, loc=(x, 0, 0))
        else:
            box("bath", (x, 0, 0.12), (0.5, 0.3, 0.24), steel, 0.04, root)
            _fuzzy("mat", (x, 0, 0.245), 0.2, (0.3, 0.6, 0.45), root, scale=(1.1, 0.65, 0.08))
    return root


def cantaloupe(frames, mould=True):
    root = empty("cantaloupe")
    m = bpy.data.materials.new("melon")
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = "DISTANCE_TO_EDGE"
    vor.inputs["Scale"].default_value = 25
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = 0.0, 0.06
    nt.links.new(vor.outputs["Distance"], mr.inputs["Value"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["A"].default_value = (0.85, 0.8, 0.6, 1)
    mix.inputs["B"].default_value = (0.55, 0.45, 0.2, 1)
    nt.links.new(mr.outputs[0], mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], p.inputs["Base Color"])
    sph("melon", (0, 0, 0.12), 0.12, m, (1, 1, 0.92), root)
    if mould:
        _fuzzy("melon_mould", (0.06, -0.08, 0.17), 0.045, (0.85, 0.75, 0.25), root, scale=(1, 1, 0.5))
    return root


def fermenter(frames, n=3, bubbles=True):
    root = empty("fermenters")
    steel = mat("tank", (0.78, 0.8, 0.84), 0.22, 1.0)
    for i in range(n):
        x = (i - (n - 1) / 2) * 1.0
        cyl("tank", (x, 0, 0.9), 0.38, 1.6, steel, parent=root, verts=64)
        sph("dome", (x, 0, 1.7), 0.38, steel, (1, 1, 0.45), root)
        cyl("pipe", (x + 0.3, -0.2, 1.95), 0.03, 0.6, mat("pipe", (0.9, 0.5, 0.15), 0.3, 0.6), parent=root)
        box("window", (x, -0.37, 0.9), (0.22, 0.02, 0.5), mat("brew", (0.85, 0.6, 0.15), 0.2, emit=1.5), parent=root)
        if bubbles:
            bm = mat("bubble", (1, 0.95, 0.8), 0.1, emit=1.0)
            rng = random.Random(i)
            for k in range(6):
                b = sph("bub", (x + rng.uniform(-0.08, 0.08), -0.39, 0.7), 0.012, bm, parent=root)
                off = rng.uniform(0, 1)
                for f in range(1, frames + 1, 3):
                    u = ((f / frames) * 3 + off) % 1
                    props.key(b, f, location=(b.location.x, -0.39, 0.66 + 0.48 * u))
    return root


def syringe(frames, push=None):
    root = empty("syringe")
    glass = mat("barrel", (0.95, 0.97, 1.0), 0.05, alpha=0.3)
    cyl("barrel", (0, 0, 0), 0.02, 0.16, glass, rot=(0, R(90), 0), parent=root)
    liquid = cyl("dose", (0.0, 0, 0), 0.017, 0.14, mat("dose", (1.0, 0.85, 0.2), 0.2, emit=0.8), rot=(0, R(90), 0), parent=root)
    cyl("needle", (0.12, 0, 0), 0.002, 0.08, mat("steel", (0.8, 0.8, 0.85), 0.2, 1.0), rot=(0, R(90), 0), parent=root)
    plunger = cyl("plunger", (-0.1, 0, 0), 0.006, 0.12, mat("white", (0.95, 0.95, 0.95), 0.4), rot=(0, R(90), 0), parent=root)
    if push:
        props.key(plunger, key_frac(frames, push[0]), location=(-0.1, 0, 0))
        props.key(plunger, key_frac(frames, push[1]), location=(-0.0, 0, 0))
        props.key(liquid, key_frac(frames, push[0]), scale=(1, 1, 1), location=(0, 0, 0))
        props.key(liquid, key_frac(frames, push[1]), scale=(1, 1, 0.05), location=(0.065, 0, 0))
    return root


def vials(frames, n=6, label="PENICILLIN"):
    root = empty("vials")
    glass = mat("vial", (0.95, 0.97, 1.0), 0.05, alpha=0.3)
    for i in range(n):
        x = (i - (n - 1) / 2) * 0.07
        cyl("vial", (x, 0, 0.045), 0.025, 0.09, glass, parent=root)
        cyl("powder", (x, 0, 0.025), 0.022, 0.045, mat("powder", (1.0, 0.92, 0.6), 0.6), parent=root)
        cyl("cap", (x, 0, 0.095), 0.026, 0.015, mat("capred", (0.85, 0.1, 0.1), 0.4), parent=root)
    if label:
        t = fx.text(label, mat("lbl", (1, 1, 1), 0.4, emit=1), (0, -0.03, 0.13), size=0.03, depth=0.003)
        t.parent = root
    return root


def crates(frames, n=6, label="PENICILLIN", seed=3):
    rng = random.Random(seed)
    root = empty("crates")
    wood = mat("crate", (0.5, 0.35, 0.18), 0.7)
    for i in range(n):
        r, c = divmod(i, 3)
        x, z = (c - 1) * 0.62, r * 0.42
        b = box("crate", (x + rng.uniform(-0.03, 0.03), 0, 0.2 + z), (0.58, 0.45, 0.4), wood, 0.01, root)
        t = fx.text(label, mat("stencil", (0.08, 0.08, 0.08), 0.6), (b.location.x, -0.23, b.location.z), size=0.07, depth=0.002)
        t.parent = root
    return root


def hospital_bed(frames):
    root = empty("bed")
    white = mat("sheet", (0.92, 0.93, 0.95), 0.6)
    frame_m = mat("bedframe", (0.65, 0.68, 0.7), 0.3, 0.8)
    box("mattress", (0, 0, 0.55), (0.95, 2.0, 0.18), white, 0.05, root)
    box("pillow", (0, 0.8, 0.7), (0.6, 0.3, 0.12), white, 0.05, root)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl("leg", (sx * 0.42, sy * 0.95, 0.25), 0.02, 0.5, frame_m, parent=root)
    box("headboard", (0, 1.0, 0.75), (0.95, 0.04, 0.6), frame_m, 0.01, root)
    return root


def pills(frames, n=14, seed=4):
    rng = random.Random(seed)
    root = empty("pills")
    for i in range(n):
        col = rng.choice([(0.9, 0.2, 0.2), (0.95, 0.85, 0.2), (0.3, 0.5, 0.95), (0.95, 0.95, 0.95)])
        p = sph("pill", (rng.uniform(-0.25, 0.25), rng.uniform(-0.15, 0.15), 0.02), 0.02, mat(f"pill{i}", col, 0.3), (2.0, 1, 1), root)
        p.rotation_euler = (0, 0, rng.uniform(0, 3.14))
    return root


# ------------------------------------------------------------------ nuclear
def _nucleus(name, loc, r, parent, seed=1, n=40):
    rng = random.Random(seed)
    root = child(empty(name), parent) if parent else empty(name)
    root.location = loc
    pm, nm = mat("proton", (0.95, 0.2, 0.2), 0.35), mat("neutron_n", (0.3, 0.45, 0.95), 0.35)
    for i in range(n):
        v = V((rng.gauss(0, 1), rng.gauss(0, 1), rng.gauss(0, 1))).normalized() * r * rng.random() ** 0.33
        sph("nucleon", v, r * 0.28, pm if i % 2 else nm, parent=root)
    return root


def fission(frames, hit=0.35, split=0.5, products=True, neutrons=3, seed=1):
    """A neutron strikes a uranium nucleus, which wobbles, splits into two fragments, releases a flash and new neutrons."""
    root = empty("fission")
    nuc = _nucleus("uranium", (0, 0, 0), 0.25, root, seed, 60)
    nm = mat("free_neutron", (0.75, 0.8, 0.9), 0.3, emit=1.5)
    inc = sph("incoming", (-1.4, 0, 0), 0.055, nm, parent=root)
    fh, fs = key_frac(frames, hit), key_frac(frames, split)
    props.key(inc, 1, location=(-1.4, 0, 0))
    props.key(inc, fh, location=(-0.25, 0, 0))
    hide_keys(inc, ((1, False), (fh, False), (fh + 1, True)))
    props.key(nuc, fh, scale=(1, 1, 1))
    props.key(nuc, (fh + fs) // 2, scale=(1.35, 0.85, 0.85))
    props.key(nuc, fs, scale=(1.6, 0.75, 0.75))
    hide_keys(nuc, ((1, False), (fs, False), (fs + 1, True)))
    if products:
        for k, sign in enumerate((-1, 1)):
            frag = _nucleus(f"fragment{k}", (sign * 0.2, 0, 0), 0.18, root, seed + 5 + k, 30)
            visible_from(frag, frames, split)
            props.key(frag, fs, location=(sign * 0.2, 0, 0))
            props.key(frag, frames, location=(sign * 1.1, 0, sign * 0.15))
        fm, fstr = fx.emissive("flash", (1.0, 0.85, 0.5), 0)
        fl = sph("flash", (0, 0, 0), 0.3, fm, parent=root)
        glow_keys(fstr, frames, [(0, 0), (split - 0.005, 0), (split, 30), (min(1, split + 0.12), 0)])
        props.key(fl, fs, scale=(0.5, 0.5, 0.5))
        props.key(fl, min(frames, fs + 8), scale=(3, 3, 3))
        rng = random.Random(seed)
        for k in range(neutrons):
            n = sph(f"out{k}", (0, 0, 0), 0.05, nm, parent=root)
            visible_from(n, frames, split)
            d = V((rng.uniform(-0.3, 0.3), rng.uniform(-1, 1), rng.uniform(-1, 1))).normalized() * 1.4
            props.key(n, fs, location=(0, 0, 0))
            props.key(n, frames, location=tuple(d))
    return root


def chain_reaction(frames, generations=4, seed=2, start=0.1, span=0.75):
    """Branching tree of fissions: each split frees neutrons that split more nuclei."""
    rng = random.Random(seed)
    root = empty("chain")
    nm = mat("free_neutron", (0.75, 0.8, 0.9), 0.3, emit=1.5)
    fm = mat("chain_flash", (1.0, 0.75, 0.3), 0.3, emit=6)
    level = [V((0, 0, 0))]
    dt = span / generations
    for g in range(generations):
        nxt = []
        t0 = start + g * dt
        for p in level:
            nu = _nucleus("cn", tuple(p), 0.09, root, rng.randint(0, 99), 14)
            f = key_frac(frames, t0 + dt * 0.5)
            hide_keys(nu, ((1, False), (f, False), (f + 1, True)))
            if g:
                visible_from(nu, frames, t0)
            fl = sph("cf", tuple(p), 0.09, fm, parent=root)
            visible_from(fl, frames, t0 + dt * 0.5)
            props.key(fl, f, scale=(0.3, 0.3, 0.3))
            props.key(fl, f + 2, scale=(1.2, 1.2, 1.2))
            props.key(fl, f + 4, scale=(0, 0, 0))
            for k in range(2 if g < generations - 1 else 0):
                a = rng.uniform(-0.9, 0.9)
                q = p + V((0.55 + 0.1 * g, (k - 0.5) * (1.3 / (g + 1)) + rng.uniform(-0.08, 0.08), a * 0.15))
                n = sph("cnn", tuple(p), 0.03, nm, parent=root)
                visible_from(n, frames, t0 + dt * 0.5)
                props.key(n, f, location=tuple(p))
                props.key(n, key_frac(frames, t0 + dt * 1.5), location=tuple(q))
                nxt.append(q)
        level = nxt
    return root


def graphite_pile(frames, layers=14, rods=None, glow=None):
    """Chicago Pile-1: a flattened sphere of black graphite bricks in a wooden frame, with control rods."""
    root = empty("pile")
    g = mat("graphite", (0.015, 0.015, 0.018), 0.6, 0.2)
    gu = mat("graphite_u", (0.03, 0.03, 0.035), 0.55, 0.2)
    wood = mat("timber", (0.45, 0.3, 0.15), 0.7)
    h = 0.11
    for i in range(layers):
        z = i * h + h / 2
        u = (z - layers * h / 2) / (layers * h / 2)
        w = 1.2 * math.sqrt(max(0.15, 1 - u * u))
        b = box(f"layer{i}", (0, 0, z), (w * 2, w * 2, h * 0.96), gu if i % 2 else g, 0.004, root)
        b.modifiers.new("bricks", "BEVEL").width = 0.003
    for sx in (-1, 1):
        for sy in (-1, 1):
            box("post", (sx * 1.35, sy * 1.35, layers * h / 2), (0.08, 0.08, layers * h + 0.2), wood, parent=root)
    rod_m = mat("cadmium", (0.75, 0.76, 0.8), 0.3, 1.0)
    rod = box("control_rod", (0, -1.0, layers * h * 0.55), (0.06, 1.6, 0.06), rod_m, parent=root)
    if rods:
        for t, out in rods:  # out = how far withdrawn (m)
            props.key(rod, key_frac(frames, t), location=(0, -1.0 - out, layers * h * 0.55))
    if glow:
        gm, gs = fx.emissive("core_glow", (0.3, 0.6, 1.0), 0)
        sph("core", (0, 0, layers * h / 2), 0.6, gm, (1, 1, 0.8), root)
        glow_keys(gs, frames, glow)
    return root


def cooling_towers(frames, n=2, steam=True):
    root = empty("towers")
    conc = mat("concrete", (0.72, 0.72, 0.7), 0.8)
    for i in range(n):
        x = (i - (n - 1) / 2) * 2.6
        prof = [(1.1, 0), (0.75, 1.6), (0.68, 2.1), (0.8, 2.8)]
        lathe("tower", prof + [(0.78, 2.8)], conc, parent=root, loc=(x, 0, 0)).modifiers["lathe"].use_normal_flip = False
        if steam:
            sm = mat("steam", (1, 1, 1), 0.9, alpha=0.55)
            rng = random.Random(i)
            for k in range(7):
                p = sph("puff", (x + rng.uniform(-0.3, 0.3), 0, 3.0 + k * 0.35), 0.45 + k * 0.08, sm, parent=root)
                off = rng.uniform(0, 1)
                for f in range(1, frames + 1, 4):
                    u = (f / frames * 0.6 + off) % 1
                    props.key(p, f, location=(x + rng.uniform(-0.05, 0.05) + u * 0.6, 0, 3.0 + k * 0.3 + u * 0.8))
    return root


def reactor_core(frames, rods_out=(0.1, 0.6)):
    """Fuel assemblies in a pool, glowing Cherenkov blue as control rods lift."""
    root = empty("core")
    water, ws = fx.emissive("cherenkov", (0.15, 0.45, 1.0), 0.3)
    box("pool", (0, 0, -0.02), (2.0, 2.0, 0.04), water, parent=root)
    fuel = mat("fuel", (0.55, 0.57, 0.6), 0.3, 1.0)
    for i in range(5):
        for j in range(5):
            cyl("assembly", ((i - 2) * 0.3, (j - 2) * 0.3, 0.3), 0.1, 0.6, fuel, parent=root, verts=6)
    rodm = mat("rods", (0.2, 0.2, 0.22), 0.3, 0.8)
    rods = child(empty("rods"), root)
    for i in range(4):
        for j in range(4):
            cyl("rod", ((i - 1.5) * 0.3, (j - 1.5) * 0.3, 0.45), 0.03, 0.9, rodm, parent=rods)
    props.key(rods, key_frac(frames, rods_out[0]), location=(0, 0, 0))
    props.key(rods, key_frac(frames, rods_out[1]), location=(0, 0, 0.7))
    glow_keys(ws, frames, [(0, 0.3), (rods_out[0], 0.3), (rods_out[1], 5)])
    light = bpy.data.lights.new("cherenkov_light", "POINT")
    light.color = (0.2, 0.5, 1.0)
    lo = child(bpy.data.objects.new("cherenkov_light", light), root)
    bpy.context.scene.collection.objects.link(lo)
    lo.location = (0, 0, 0.8)
    for t, e in ((0, 20), (rods_out[0], 20), (rods_out[1], 400)):
        light.energy = e
        light.keyframe_insert("energy", frame=key_frac(frames, t))
    return root


def geiger(frames, clicks=None):
    root = empty("geiger")
    box("geiger_box", (0, 0, 0.08), (0.25, 0.14, 0.16), mat("geiger", (0.85, 0.7, 0.15), 0.4), 0.01, root)
    cyl("dial", (0, -0.071, 0.1), 0.045, 0.004, mat("dial", (0.95, 0.92, 0.82), 0.4), rot=(R(90), 0, 0), parent=root)
    piv = child(empty("g_needle"), root)
    piv.location = (0, -0.075, 0.08)
    box("needle", (0, 0, 0.025), (0.003, 0.002, 0.05), mat("needle", (0.9, 0.05, 0.1), 0.3, emit=1), parent=piv)
    cyl("probe", (0.2, 0, 0.05), 0.02, 0.18, mat("probe", (0.3, 0.3, 0.32), 0.3, 0.8), rot=(0, R(90), 0), parent=root)
    if clicks:
        for t, deg in clicks:
            props.key(piv, key_frac(frames, t), rotation_euler=(0, R(deg), 0))
    return root


def stadium(frames):
    """Stagg Field's west stands: stepped seating over a brick wall with arched windows."""
    root = empty("stadium")
    brick = mat("brick", (0.45, 0.2, 0.12), 0.8)
    stone = mat("stone", (0.7, 0.65, 0.55), 0.7)
    box("wall", (0, 0, 2.0), (8, 0.6, 4.0), brick, parent=root)
    for i in range(6):
        box("tower", ((i - 2.5) * 1.5, -0.32, 2.2), (0.35, 0.1, 4.4), stone, parent=root)
        box("window", ((i - 2.5) * 1.5 + 0.75, -0.31, 2.2), (0.6, 0.02, 1.4), mat("win", (0.15, 0.2, 0.3), 0.2, emit=0.4), parent=root)
    for k in range(8):
        box("step", (0, 0.5 + k * 0.4, 4.0 + k * 0.3), (8, 0.4, 0.3), stone, parent=root)
    return root


def bottle(frames, label="CHIANTI"):
    root = empty("bottle")
    lathe("wine", [(0, 0), (0.07, 0), (0.09, 0.08), (0.08, 0.16), (0.02, 0.26), (0.018, 0.34), (0, 0.34)],
          mat("wine_glass", (0.15, 0.35, 0.15), 0.1, alpha=0.6), parent=root)
    lathe("straw", [(0, 0.0), (0.075, 0.0), (0.092, 0.08), (0.08, 0.15), (0, 0.15)], mat("straw", (0.75, 0.6, 0.3), 0.8), parent=root,
          loc=(0, 0, -0.002)).scale = (1.02, 1.02, 1)
    for k in range(3):
        cyl("cup", (0.2 + k * 0.1, -0.05, 0.04), 0.03, 0.08, mat("paper_cup", (0.95, 0.95, 0.93), 0.6), parent=root)
    return root


def slide_rule(frames, slide=None):
    root = empty("slide_rule")
    box("rule", (0, 0, 0), (0.5, 0.06, 0.012), mat("ivory", (0.95, 0.92, 0.82), 0.4), parent=root)
    s = box("slider", (0, 0, 0.007), (0.5, 0.02, 0.004), mat("ivory2", (0.9, 0.88, 0.78), 0.4), parent=root)
    for k in range(25):
        box("tick", (-0.24 + k * 0.02, 0.025, 0.007), (0.002, 0.01, 0.001), mat("ink", (0.05, 0.05, 0.05)), parent=root)
    if slide:
        for t, x in slide:
            props.key(s, key_frac(frames, t), location=(x, 0, 0.007))
    return root


# ------------------------------------------------------------------ flight
def _wing(name, span, chord, thick, material, loc, parent, camber=0.02):
    """A gently cambered wing panel (spanning X) from a curved, thin box."""
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    w = bpy.context.active_object
    w.name = name
    w.scale = (span, chord, thick)
    sub = w.modifiers.new("cut", "SUBSURF")
    sub.subdivision_type, sub.levels, sub.render_levels = "SIMPLE", 3, 3
    bend = w.modifiers.new("camber", "SIMPLE_DEFORM")
    bend.deform_method, bend.deform_axis, bend.angle = "BEND", "X", R(camber * 400)
    w.data.materials.append(material)
    w.parent = parent
    return w


def propeller(name, loc, radius, material, parent, frames, rpm_turns=12, axis="y"):
    piv = child(empty(name), parent)
    piv.location = loc
    for k in range(2):
        b = box("blade", (0, 0, radius / 2 if k == 0 else -radius / 2), (radius * 0.18, 0.01, radius), material, 0.003, piv)
        b.rotation_euler = (0, R(12 if k == 0 else -12), 0)
    i = "xyz".index(axis)
    r0, r1 = [0, 0, 0], [0, 0, 0]
    r1[i] = R(360 * rpm_turns)
    props.key(piv, 1, rotation_euler=tuple(r0))
    props.key(piv, frames, rotation_euler=tuple(r1))
    fx._linear(piv)
    return piv


def wright_flyer(frames, props_spin=True, pilot=True):
    """1903 Flyer: two stacked wings, forward elevator, twin rear rudders, two pusher propellers. Flies toward -Y."""
    root = empty("flyer")
    cloth = mat("muslin", (0.92, 0.88, 0.75), 0.8)
    spruce = mat("spruce", (0.6, 0.45, 0.25), 0.6)
    for z in (0.0, 0.55):
        _wing("wing", 4.0, 0.65, 0.025, cloth, (0, 0, 1.0 + z), root)
    for x in (-1.9, -1.3, -0.65, 0.0, 0.65, 1.3, 1.9):
        cyl("strut", (x, -0.25, 1.27), 0.012, 0.55, spruce, parent=root)
        cyl("strut", (x, 0.25, 1.27), 0.012, 0.55, spruce, parent=root)
    for z in (0.9, 1.08):
        _wing("elevator", 1.5, 0.3, 0.02, cloth, (0, -1.5, z), root, camber=0.01)
    for x in (-0.6, 0.6):
        box("boom", (x, -0.85, 0.95), (0.02, 1.4, 0.02), spruce, parent=root)
        box("rboom", (x, 1.2, 1.2), (0.02, 1.4, 0.02), spruce, parent=root)
    for x in (-0.15, 0.15):
        box("rudder", (x, 1.9, 1.2), (0.01, 0.35, 0.6), cloth, 0.004, root)
    box("skid", (-0.3, -0.5, 0.82), (0.04, 2.6, 0.04), spruce, parent=root)
    box("skid", (0.3, -0.5, 0.82), (0.04, 2.6, 0.04), spruce, parent=root)
    box("engine", (0.25, 0.05, 1.06), (0.25, 0.3, 0.15), mat("engine", (0.2, 0.2, 0.22), 0.4, 0.8), 0.01, root)
    pm = mat("prop", (0.65, 0.5, 0.3), 0.5)
    for x in (-1.0, 1.0):
        propeller("prop", (x, 0.45, 1.27), 0.6, pm, root, frames, 30 if props_spin else 0)
    if pilot:  # prone pilot: a simple rounded figure lying on the lower wing
        suit = mat("pilot", (0.15, 0.15, 0.18), 0.6)
        sph("pilot_body", (-0.2, 0.0, 1.1), 0.12, suit, (1, 2.8, 0.8), root)
        sph("pilot_head", (-0.2, -0.38, 1.12), 0.08, mat("face", (0.75, 0.55, 0.45), 0.6), parent=root)
    return root


def glider(frames, flap=False):
    """Lilienthal-style hang glider: ribbed bat wings with a pilot hanging below."""
    root = empty("glider")
    cloth = mat("glider_cloth", (0.93, 0.9, 0.82), 0.8)
    rib = mat("willow", (0.45, 0.32, 0.18), 0.6)
    verts, faces = [(0, -0.6, 0), (0, 0.6, 0)], []
    n = 9
    for side in (-1, 1):
        prev = None
        for k in range(n + 1):
            a = R(-80 + 160 * k / n)
            tip = (side * 3.3 * math.cos(a * 0.6) * (1 - 0.3 * abs(math.sin(a))), 1.0 * math.sin(a) * 0.9, 0.25)
            verts.append(tip)
            cur = len(verts) - 1
            curve_obj("rib", [V((0, 0, 0)), V(tip)], 0.01, rib, root)
            if prev is not None:
                faces.append((0 if k <= n // 2 else 1, prev, cur) if side < 0 else (prev, 0 if k <= n // 2 else 1, cur))
            prev = cur
    mesh = bpy.data.meshes.new("glider_wing")
    mesh.from_pydata([V(v) for v in verts], [], faces)
    w = bpy.data.objects.new("glider_wing", mesh)
    bpy.context.scene.collection.objects.link(w)
    w.data.materials.append(cloth)
    w.parent = root
    w.modifiers.new("smooth", "SUBSURF").levels = 1
    box("tail", (0, 1.6, 0.25), (0.02, 0.6, 0.4), cloth, parent=root)
    box("tailplane", (0, 1.6, 0.25), (0.8, 0.5, 0.02), cloth, parent=root)
    curve_obj("tailboom", [V((0, 0.4, 0.2)), V((0, 1.5, 0.25))], 0.01, rib, root)
    suit = mat("glider_pilot", (0.25, 0.22, 0.2), 0.6)
    sph("pilot", (0, 0, -0.45), 0.14, suit, (1, 0.8, 2.6), root)
    sph("pilot_head", (0, 0, -0.02), 0.09, mat("face", (0.75, 0.55, 0.45), 0.6), parent=root)
    return root


def balloon(frames, rise=None):
    root = empty("balloon")
    m = bpy.data.materials.new("balloon_silk")
    m.use_nodes = True
    nt = m.node_tree
    p = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    grad = nt.nodes.new("ShaderNodeTexGradient")
    grad.gradient_type = "RADIAL"
    nt.links.new(tc.outputs["Object"], grad.inputs["Vector"])
    mathn = nt.nodes.new("ShaderNodeMath")
    mathn.operation = "MULTIPLY"
    mathn.inputs[1].default_value = 12
    nt.links.new(grad.outputs["Fac"], mathn.inputs[0])
    fr = nt.nodes.new("ShaderNodeMath")
    fr.operation = "FRACT"
    nt.links.new(mathn.outputs[0], fr.inputs[0])
    st = nt.nodes.new("ShaderNodeMath")
    st.operation = "GREATER_THAN"
    st.inputs[1].default_value = 0.5
    nt.links.new(fr.outputs[0], st.inputs[0])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs["A"].default_value = (0.1, 0.2, 0.7, 1)
    mix.inputs["B"].default_value = (0.95, 0.75, 0.15, 1)
    nt.links.new(st.outputs[0], mix.inputs["Factor"])
    nt.links.new(mix.outputs["Result"], p.inputs["Base Color"])
    lathe("envelope", [(0, 0), (0.25, 0.05), (0.9, 0.9), (1.05, 1.6), (0.85, 2.3), (0.3, 2.6), (0, 2.62)], m, parent=root, loc=(0, 0, 1.0))
    box("basket", (0, 0, 0.6), (0.6, 0.6, 0.45), mat("wicker", (0.55, 0.38, 0.18), 0.8), 0.03, root)
    for sx in (-1, 1):
        for sy in (-1, 1):
            curve_obj("rope", [V((sx * 0.28, sy * 0.28, 0.82)), V((sx * 0.2, sy * 0.2, 1.05))], 0.005, mat("rope", (0.8, 0.7, 0.5)), root)
    if rise:
        props.key(root, key_frac(frames, rise[0]), location=(0, 0, 0))
        props.key(root, key_frac(frames, rise[1]), location=(0.3, 0, rise[2] if len(rise) > 2 else 2.0))
    return root


def airliner(frames, roll=0):
    """A modern twin-engine jet, flying toward -Y."""
    root = empty("airliner")
    white = mat("livery", (0.92, 0.93, 0.95), 0.3)
    blue = mat("livery_blue", (0.1, 0.25, 0.65), 0.3)
    sph("fuselage", (0, 0, 0), 0.3, white, (1, 6.5, 1), root)
    box("stripe", (0, 0, -0.05), (0.605, 3.8, 0.06), blue, parent=root)
    for side in (-1, 1):
        w = box("wing", (side * 1.6, 0.3, -0.1), (3.0, 0.75, 0.05), white, 0.02, root)
        w.rotation_euler = (0, R(side * -4), R(side * 18))
        cyl("engine", (side * 1.1, -0.15, -0.35), 0.17, 0.6, mat("nacelle", (0.8, 0.82, 0.85), 0.3, 0.5), rot=(R(90), 0, 0), parent=root)
        t = box("tailplane", (side * 0.6, 1.75, 0.1), (1.0, 0.35, 0.03), white, 0.01, root)
        t.rotation_euler = (0, 0, R(side * 22))
    box("fin", (0, 1.8, 0.55), (0.04, 0.6, 0.9), blue, 0.01, root).rotation_euler = (R(-20), 0, 0)
    for k in range(14):
        box("window", (0.3, -1.2 + k * 0.16, 0.08), (0.02, 0.06, 0.06), mat("glass_dark", (0.05, 0.08, 0.12), 0.2), parent=root)
        box("window", (-0.3, -1.2 + k * 0.16, 0.08), (0.02, 0.06, 0.06), mat("glass_dark", (0.05, 0.08, 0.12), 0.2), parent=root)
    root.rotation_euler = (0, R(roll), 0)
    return root


def airfoil_flow(frames, angle=6, lines=9, draw=(0.05, 0.6)):
    """A wing cross-section in a stream of air: the lines bend over the top and are deflected down behind it."""
    root = empty("airfoil")
    # NACA-ish airfoil in the YZ plane (chord along +Y)
    pts = []
    for i in range(41):
        x = 1 - math.cos(math.pi * i / 40) * 0.5 - 0.5
        t = 0.12 * (0.2969 * math.sqrt(max(x, 0)) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4) * 5
        pts.append((x, t + 0.06 * math.sin(math.pi * x)))
    lower = [(x, -t * 0.4 + 0.06 * math.sin(math.pi * x)) for x, t in pts]
    outline = pts + lower[::-1]
    mesh = bpy.data.meshes.new("airfoil")
    verts = [(-0.3, (x - 0.5) * 1.2, z * 1.2) for x, z in outline] + [(0.3, (x - 0.5) * 1.2, z * 1.2) for x, z in outline]
    n = len(outline)
    faces = [tuple(range(n)), tuple(range(2 * n - 1, n - 1, -1))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    mesh.from_pydata(verts, [], faces)
    o = bpy.data.objects.new("airfoil", mesh)
    bpy.context.scene.collection.objects.link(o)
    o.data.materials.append(mat("wing_metal", (0.8, 0.82, 0.86), 0.3, 0.6))
    o.parent = root
    o.rotation_euler = (R(angle), 0, 0)
    lm, _ = fx.emissive("airflow", (0.3, 0.85, 1.0), 4)
    for k in range(lines):
        z0 = -0.5 + k * 1.0 / (lines - 1)
        lp = []
        for i in range(81):
            y = -1.6 + 3.2 * i / 80
            bump = 0.18 * math.exp(-((y - 0.0) / 0.5) ** 2) * math.exp(-abs(z0) * 2.5) * (1 if z0 >= 0 else 0.4)
            down = -0.35 * max(0, y) / 1.6 * math.exp(-abs(z0) * 1.5)
            lp.append(V((0, y, z0 + bump * (1 if z0 >= -0.05 else -1) + down)))
        c = curve_obj("flow", lp, 0.006, lm, root)
        draw_on(c, frames, draw[0] + 0.02 * k, draw[1])
    return root


def wind_tunnel(frames):
    """The Wrights' 1901 tunnel: a wooden box with a fan at one end and a balance holding a tiny wing."""
    root = empty("wind_tunnel")
    wood = mat("pine", (0.62, 0.45, 0.25), 0.6)
    box("floor", (0, 0, 0.0), (0.45, 1.8, 0.03), wood, parent=root)
    box("roof", (0, 0, 0.42), (0.45, 1.8, 0.03), mat("glass_top", (0.9, 0.95, 1), 0.05, alpha=0.3), parent=root)
    for sx in (-1, 1):
        box("side", (sx * 0.22, 0, 0.21), (0.03, 1.8, 0.42), wood, parent=root)
    propeller("fan", (0, 0.92, 0.21), 0.18, mat("fanblade", (0.4, 0.4, 0.42), 0.4, 0.8), root, frames, 60)
    box("balance", (0, -0.1, 0.12), (0.02, 0.02, 0.18), mat("brass", (0.8, 0.65, 0.3), 0.3, 0.9), parent=root)
    w = box("test_wing", (0, -0.1, 0.22), (0.12, 0.05, 0.004), mat("steel", (0.75, 0.75, 0.8), 0.3, 1.0), parent=root)
    w.rotation_euler = (R(-8), 0, 0)
    lm, _ = fx.emissive("tunnel_air", (0.4, 0.85, 1.0), 2)
    for k in range(5):
        c = curve_obj("air", [V((-0.12 + k * 0.06, 0.8, 0.15 + 0.03 * (k % 2))), V((-0.12 + k * 0.06, -0.8, 0.15 + 0.03 * (k % 2)))], 0.003, lm, root)
        draw_on(c, frames, 0.05, 0.4)
    return root


def bicycle(frames, spin=0):
    root = empty("bicycle")
    steel = mat("frame", (0.12, 0.12, 0.14), 0.3, 0.8)
    tyre = mat("tyre", (0.03, 0.03, 0.03), 0.6)
    for y in (-0.5, 0.5):
        whl = child(empty("wheel"), root)
        whl.location = (0, y, 0.35)
        props.torus("tyre", (0, 0, 0), 0.33, 0.02, tyre, rotation=(0, R(90), 0)).parent = whl
        for k in range(12):
            box("spoke", (0, 0, 0), (0.003, 0.003, 0.64), steel, parent=whl).rotation_euler = (R(k * 15), 0, 0)
        if spin:
            props.key(whl, 1, rotation_euler=(0, 0, 0))
            props.key(whl, frames, rotation_euler=(R(360 * spin), 0, 0))
    curve_obj("frame", [V((0, -0.5, 0.35)), V((0, -0.05, 0.4)), V((0, 0.35, 0.8)), V((0, -0.35, 0.8)), V((0, -0.05, 0.4)),
                        V((0, 0.5, 0.35)), V((0, 0.35, 0.8))], 0.015, steel, root)
    box("saddle", (0, -0.3, 0.88), (0.08, 0.2, 0.04), mat("leather", (0.3, 0.15, 0.08), 0.6), 0.02, root)
    curve_obj("bars", [V((-0.25, 0.35, 0.95)), V((0, 0.4, 0.92)), V((0.25, 0.35, 0.95))], 0.012, steel, root)
    return root


def dunes(frames, seed=6, n=10):
    root = empty("dunes")
    sand = mat("sand", (0.85, 0.72, 0.5), 0.9)
    rng = random.Random(seed)
    for i in range(n):
        sph("dune", (rng.uniform(-12, 12), rng.uniform(3, 18), -0.2), rng.uniform(2, 5), sand, (1.6, 1, rng.uniform(0.15, 0.35)), root)
    return root


def birds(frames, n=6, seed=3, area=3.0):
    rng = random.Random(seed)
    root = empty("birds")
    m = mat("bird", (0.1, 0.1, 0.12), 0.6)
    for i in range(n):
        b = child(empty("bird"), root)
        b.location = (rng.uniform(-area, area), rng.uniform(-area, area) * 0.5, rng.uniform(0, area * 0.4))
        sph("bird_body", (0, 0, 0), 0.05, m, (0.6, 1.6, 0.6), b)
        for side in (-1, 1):
            wp = child(empty("wing_pivot"), b)
            box("feather_wing", (side * 0.12, 0, 0), (0.24, 0.07, 0.008), m, parent=wp)
            for f in range(1, frames + 1, 3):
                props.key(wp, f, rotation_euler=(0, R(side * 30 * math.sin(f * 0.9 + i)), 0))
        props.key(b, 1, location=tuple(b.location))
        props.key(b, frames, location=(b.location.x + rng.uniform(1, 2), b.location.y, b.location.z + 0.2))
    return root


# ------------------------------------------------------------------ power grid
def pylons(frames, n=4, spacing=4.0, current=None, height=3.6):
    """Lattice transmission towers along +Y with sagging lines; `current` = [t0, t1] sends glowing pulses along them."""
    root = empty("pylons")
    steel = mat("pylon", (0.6, 0.62, 0.66), 0.35, 0.9)
    tops = []
    for i in range(n):
        y = i * spacing
        for sx in (-1, 1):
            for sy in (-1, 1):
                curve_obj("leg", [V((sx * 0.55, y + sy * 0.55, 0)), V((sx * 0.12, y + sy * 0.12, height))], 0.02, steel, root)
        for z in (height * 0.3, height * 0.55, height * 0.8):
            r = 0.55 - 0.43 * z / height
            for sx in (-1, 1):
                curve_obj("brace", [V((sx * r, y - r, z)), V((-sx * r, y + r, z + height * 0.12))], 0.01, steel, root)
        for zc, w in ((height, 1.6), (height * 0.82, 1.2)):
            box("arm", (0, y, zc), (w * 2, 0.08, 0.08), steel, parent=root)
            tops.append([(sx * w * 0.95, y, zc - 0.25) for sx in (-1, 1)])
    wire_m = mat("cable", (0.15, 0.15, 0.17), 0.4, 0.8, emit=0.0, emit_color=(0.4, 0.85, 1.0))
    for k in range(4):
        pts = []
        for i in range(n - 1):
            a, b = V(tops[2 * i + k // 2][k % 2]), V(tops[2 * (i + 1) + k // 2][k % 2])
            for u in range(21):
                t = u / 20
                p = a.lerp(b, t)
                p.z -= 0.45 * math.sin(math.pi * t)
                pts.append(p)
        curve_obj(f"line{k}", pts, 0.012, wire_m, root)
    if current:
        p = wire_m.node_tree.nodes["Principled BSDF"]
        glow_keys(p.inputs["Emission Strength"], frames, [(0, 0), (current[0], 0), (current[1], 6)])
        pm, _ = fx.emissive("pulse", (0.5, 0.9, 1.0), 12)
        for k in range(6):
            pulse = sph("pulse", (0, 0, 0), 0.06, pm, parent=root)
            off = k / 6
            for f in range(1, frames + 1, 2):
                u = ((f / frames - current[0]) / max(0.05, 1 - current[0]) * 2 + off) % 1
                y = u * (n - 1) * spacing
                pulse.location = (-1.52, y, height - 0.25 - 0.45 * math.sin(math.pi * ((y / spacing) % 1)))
                pulse.keyframe_insert("location", frame=f)
            visible_from(pulse, frames, current[0])
    return root


def transformer(frames, step="up", glow=(0.2, 1.0)):
    """Iron core with a few-turn primary and many-turn secondary (or the reverse for step-down)."""
    root = empty("transformer")
    iron = mat("core", (0.3, 0.3, 0.33), 0.4, 0.8)
    box("core_top", (0, 0, 0.55), (0.8, 0.12, 0.12), iron, parent=root)
    box("core_bottom", (0, 0, 0.05), (0.8, 0.12, 0.12), iron, parent=root)
    for x in (-0.34, 0.34):
        box("core_leg", (x, 0, 0.3), (0.12, 0.12, 0.62), iron, parent=root)
    few, many = (6, 18) if step == "up" else (18, 6)
    for x, turns, col in ((-0.34, few, (1.0, 0.45, 0.15)), (0.34, many, (0.95, 0.6, 0.2))):
        c = coil(frames, turns=turns, radius=0.1, length=0.42, axis="z", glow=[[0, 0], [glow[0], 0], [glow[1], 3]], color=col, wire=0.009)
        c.parent = root
        c.location = (x, 0, 0.3)
    for txt, x, colr in (("LOW V", -0.34, (0.4, 0.85, 1.0)), ("HIGH V", 0.34, (1.0, 0.45, 0.3))) if step == "up" else \
            (("HIGH V", -0.34, (1.0, 0.45, 0.3)), ("LOW V", 0.34, (0.4, 0.85, 1.0))):
        t = fx.text(txt, mat("tl", colr, 0.4, emit=1.5), (x, -0.15, 0.8), size=0.07, depth=0.005)
        t.parent = root
    return root


def waterfall(frames, width=6.0, height=3.0):
    """A curtain of falling water over a rock ledge, with rising mist."""
    root = empty("falls")
    rock = mat("rock", (0.25, 0.22, 0.2), 0.9)
    box("ledge", (0, 1.5, height / 2), (width + 2, 3, height), rock, 0.2, root)
    box("river", (0, 4, height + 0.02), (width + 2, 3, 0.04), mat("river", (0.1, 0.35, 0.45), 0.1), parent=root)
    box("pool", (0, -2.0, 0.02), (width + 6, 4, 0.04), mat("pool", (0.08, 0.3, 0.4), 0.08), parent=root)
    wm = bpy.data.materials.new("falling_water")
    wm.use_nodes = True
    nt = wm.node_tree
    pr = nt.nodes["Principled BSDF"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 6
    noise.inputs["Detail"].default_value = 6
    nt.links.new(mp.outputs[0], noise.inputs["Vector"])
    mp.inputs["Scale"].default_value = (4, 0.35, 4)
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.05, 0.3, 0.45, 1)
    ramp.color_ramp.elements[1].color = (0.85, 0.95, 1.0, 1)
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], pr.inputs["Base Color"])
    pr.inputs["Roughness"].default_value = 0.2
    for f, z in ((1, 0.0), (frames, 3.0)):
        mp.inputs["Location"].default_value = (0, z, 0)
        mp.inputs["Location"].keyframe_insert("default_value", frame=f)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -0.05, height / 2))
    sheet = bpy.context.active_object
    sheet.scale = (width, height, 1)
    sheet.rotation_euler = (R(85), 0, 0)
    sheet.data.materials.append(wm)
    sheet.parent = root
    mist = mat("mist", (1, 1, 1), 0.9, alpha=0.35)
    rng = random.Random(3)
    for k in range(10):
        p = sph("mist", (rng.uniform(-width / 2, width / 2), -0.6, 0.3), rng.uniform(0.4, 0.8), mist, parent=root)
        off = rng.uniform(0, 1)
        for f in range(1, frames + 1, 4):
            u = (f / frames + off) % 1
            props.key(p, f, location=(p.location.x, -0.6 - u * 0.5, 0.2 + u * 1.2))
    return root


def waveform(frames, kind="ac", length=2.0, draw=(0.05, 0.7), color=None):
    root = empty("waveform")
    col = color or ((1.0, 0.5, 0.2) if kind == "ac" else (0.4, 0.85, 1.0))
    m, _ = fx.emissive("wave_" + kind, col, 4)
    pts = []
    for i in range(201):
        u = i / 200
        z = 0.25 * math.sin(2 * math.pi * 4 * u) if kind == "ac" else 0.2
        pts.append(V((u * length - length / 2, 0, z)))
    c = curve_obj("wave_" + kind, pts, 0.012, m, root)
    draw_on(c, frames, draw[0], draw[1])
    am = mat("axis", (0.8, 0.8, 0.9), 0.4, emit=0.5)
    cyl("axis", (0, 0, 0), 0.004, length, am, rot=(0, R(90), 0), parent=root)
    t = fx.text("AC" if kind == "ac" else "DC", mat("wl", col, 0.4, emit=2), (-length / 2 - 0.25, 0, 0.0), size=0.18, depth=0.02)
    t.parent = root
    return root


def tesla_coil(frames, sparks=(0.2, 0.4, 0.6, 0.8)):
    root = empty("tesla_coil")
    base = mat("tc_base", (0.35, 0.2, 0.1), 0.5)
    box("tc_base", (0, 0, 0.1), (0.6, 0.6, 0.2), base, 0.01, root)
    c = coil(frames, turns=40, radius=0.12, length=1.0, axis="z", color=(0.95, 0.55, 0.2), wire=0.004)
    c.parent = root
    c.location = (0, 0, 0.75)
    cyl("tc_tube", (0, 0, 0.75), 0.115, 1.0, mat("tube", (0.2, 0.25, 0.2), 0.5), parent=root)
    props.torus("toroid", (0, 0, 1.35), 0.3, 0.1, mat("toroid", (0.8, 0.82, 0.86), 0.2, 1.0)).parent = root
    rng = random.Random(5)
    for i, t in enumerate(sparks):
        a = rng.uniform(0, 2 * math.pi)
        fx.bolt(V((0.35 * math.cos(a), 0.35 * math.sin(a), 1.35)), V((1.2 * math.cos(a), 1.2 * math.sin(a), rng.uniform(0.6, 1.6))),
                key_frac(frames, t), seed=30 + i, width=0.008, branches=3, color=(0.7, 0.6, 1.0), hold=3)
    return root


def houses(frames, n=6, on=(0.2, 0.8), seed=2):
    """A street of little houses whose windows light up one after another."""
    rng = random.Random(seed)
    root = empty("houses")
    pal = [(0.75, 0.55, 0.4), (0.6, 0.65, 0.75), (0.8, 0.75, 0.6), (0.55, 0.7, 0.55), (0.75, 0.5, 0.5)]
    roof = mat("roof", (0.35, 0.12, 0.1), 0.6)
    for i in range(n):
        x = (i - (n - 1) / 2) * 1.4
        box("house", (x, 0, 0.5), (1.1, 1.0, 1.0), mat(f"wall{i}", rng.choice(pal), 0.7), 0.01, root)
        bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.85, depth=0.6, location=(x, 0, 1.3), rotation=(0, 0, R(45)))
        r = bpy.context.active_object
        r.scale = (1.0, 0.85, 1)
        r.data.materials.append(roof)
        r.parent = root
        wmat = mat(f"window{i}", (0.15, 0.15, 0.2), 0.3, emit=0.0, emit_color=(1.0, 0.75, 0.35))
        for wx in (-0.25, 0.25):
            box("window", (x + wx, -0.51, 0.6), (0.25, 0.02, 0.3), wmat, parent=root)
        t = on[0] + (on[1] - on[0]) * i / max(1, n - 1)
        glow_keys(wmat.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"], frames, [(0, 0), (t, 0), (t + 0.02, 6)])
    return root


def induction_motor(frames, spin=(0.2, 1.0), turns=4):
    """Stator coils around a rotor; a rotating glow shows the rotating magnetic field dragging the rotor round."""
    root = empty("motor")
    steel = mat("stator", (0.45, 0.47, 0.5), 0.35, 0.9)
    props.torus("stator", (0, 0, 0.5), 0.5, 0.08, steel, rotation=(R(90), 0, 0)).parent = root
    glows = []
    for k in range(6):
        a = R(k * 60)
        c = coil(frames, turns=8, radius=0.07, length=0.16, axis="x", color=(0.95, 0.5, 0.2), wire=0.008)
        c.parent = root
        c.location = (0.36 * math.cos(a), 0, 0.5 + 0.36 * math.sin(a))
        c.rotation_euler = (0, -a, 0)
        gm, gs = fx.emissive(f"phase{k}", (0.4, 0.85, 1.0), 0)
        g = sph("pole_glow", (0.36 * math.cos(a), -0.02, 0.5 + 0.36 * math.sin(a)), 0.06, gm, parent=root)
        for f in range(1, frames + 1, 2):
            phase = f / frames * turns * 2 * math.pi - a
            gs.default_value = max(0.0, math.cos(phase)) ** 3 * 8 * (f / frames > spin[0])
            gs.keyframe_insert("default_value", frame=f)
    rot = child(empty("rotor"), root)
    rot.location = (0, 0, 0.5)
    cyl("rotor", (0, 0, 0), 0.22, 0.3, mat("rotor", (0.75, 0.6, 0.35), 0.3, 1.0), rot=(R(90), 0, 0), parent=rot)
    for k in range(10):
        a = R(k * 36)
        box("bar", (0.2 * math.cos(a), 0, 0.2 * math.sin(a)), (0.03, 0.32, 0.03), mat("cu_bar", COPPER, 0.3, 1.0), parent=rot)
    props.key(rot, key_frac(frames, spin[0]), rotation_euler=(0, 0, 0))
    props.key(rot, frames, rotation_euler=(0, R(-360 * turns * 0.95 * (1 - spin[0])), 0))
    return root


# ------------------------------------------------------------------ computing
def vacuum_tube(frames, on=0.1, flicker=False):
    root = empty("tube")
    lathe("tube_glass", [(0, 0.02), (0.035, 0.02), (0.04, 0.12), (0.03, 0.17), (0.0, 0.18)], mat("tube_glass", (0.9, 0.95, 1.0), 0.05, alpha=0.25), parent=root)
    cyl("tube_base", (0, 0, 0.012), 0.04, 0.025, mat("bakelite", (0.08, 0.06, 0.05), 0.5), parent=root)
    pm, ps = fx.emissive("plate_glow", (1.0, 0.45, 0.1), 0)
    cyl("plate", (0, 0, 0.08), 0.015, 0.08, mat("plate", (0.3, 0.3, 0.32), 0.4, 0.8), parent=root)
    cyl("filament", (0, 0, 0.08), 0.004, 0.07, pm, parent=root)
    pairs = [(0, 0), (on, 0), (on + 0.05, 10)]
    if flicker:
        pairs += [(0.6, 4), (0.62, 10), (0.8, 3), (0.82, 10)]
    glow_keys(ps, frames, sorted(pairs))
    return root


def eniac(frames, panels=8, blink=True, seed=3):
    """A U of tall black panels with rows of glowing tubes, switches and patch cables."""
    rng = random.Random(seed)
    root = empty("eniac")
    black = mat("panel", (0.05, 0.05, 0.06), 0.4, 0.3)
    lamp_on = mat("neon", (1.0, 0.45, 0.12), 0.3, emit=6)
    lamp_off = mat("neon_off", (0.25, 0.1, 0.05), 0.3)
    cable_cols = [(0.1, 0.1, 0.1), (0.7, 0.1, 0.1), (0.1, 0.3, 0.7), (0.8, 0.7, 0.1)]
    for i in range(panels):
        if i < panels // 2:
            loc, rot = (-1.6, i * 0.65, 1.2), (0, 0, R(90))
        else:
            loc, rot = ((i - panels // 2) * 0.65 - 0.65, panels // 2 * 0.65 + 0.3, 1.2), (0, 0, 0)
        p = child(empty("panel"), root)
        p.location, p.rotation_euler = loc, rot
        box("cabinet", (0, 0, 0), (0.6, 0.4, 2.4), black, 0.01, p)
        for r in range(10):
            for c in range(6):
                lm = lamp_on if rng.random() < 0.4 else lamp_off
                l = sph("lamp", (-0.22 + c * 0.088, -0.205, 0.9 - r * 0.08), 0.012, lm, parent=p)
                if blink and lm is lamp_on:
                    for f in range(1, frames + 1, 3):
                        l.hide_render = rng.random() < 0.35
                        l.keyframe_insert("hide_render", frame=f)
        for r in range(4):
            for c in range(5):
                box("switch", (-0.2 + c * 0.1, -0.21, -0.1 - r * 0.12), (0.02, 0.03, 0.05), mat("switch", (0.85, 0.85, 0.82), 0.3), parent=p)
        for k in range(3):
            y0 = rng.uniform(-0.2, -0.6)
            curve_obj("cable", [V((rng.uniform(-0.25, 0.25), -0.22, y0)), V((0, -0.35, y0 - 0.35)), V((rng.uniform(-0.25, 0.25), -0.22, y0 - 0.5))],
                      0.012, mat(f"cable{k}", rng.choice(cable_cols), 0.5), p)
    return root


def punch_cards(frames, n=6, seed=4, fly=None):
    rng = random.Random(seed)
    root = empty("cards")
    card = mat("card", (0.9, 0.82, 0.6), 0.7)
    hole = mat("hole", (0.05, 0.05, 0.05), 0.7)
    for i in range(n):
        c = child(empty("card"), root)
        c.location = (rng.uniform(-0.15, 0.15), rng.uniform(-0.1, 0.1), i * 0.004)
        c.rotation_euler = (0, 0, R(rng.uniform(-20, 20)))
        box("card_body", (0, 0, 0), (0.19, 0.083, 0.002), card, parent=c)
        if i == n - 1:
            for k in range(60):
                box("hole", (-0.085 + rng.randint(0, 79) * 0.00215, -0.035 + rng.randint(0, 11) * 0.0064, 0.0012), (0.0016, 0.004, 0.0005), hole, parent=c)
        if fly:
            t = fly[0] + (fly[1] - fly[0]) * i / n
            props.key(c, key_frac(frames, t), location=(0.6, 0, 0.3 + i * 0.004))
            props.key(c, key_frac(frames, min(1, t + 0.1)), location=tuple(c.location))
    return root


def difference_engine(frames, columns=7, turn=True):
    """Babbage-style columns of brass figure wheels."""
    root = empty("engine")
    brass = mat("brass_wheel", (0.85, 0.65, 0.3), 0.3, 1.0)
    steel = mat("steel", (0.75, 0.76, 0.8), 0.25, 1.0)
    box("base", (0, 0, 0.03), (columns * 0.16 + 0.1, 0.3, 0.06), mat("mahogany", (0.3, 0.12, 0.06), 0.5), 0.01, root)
    for c in range(columns):
        x = (c - (columns - 1) / 2) * 0.16
        cyl("axis", (x, 0, 0.45), 0.01, 0.85, steel, parent=root)
        for k in range(8):
            w = cyl("wheel", (x, 0, 0.12 + k * 0.1), 0.06, 0.03, brass, parent=root, verts=24)
            if turn:
                props.key(w, 1, rotation_euler=(0, 0, 0))
                props.key(w, frames, rotation_euler=(0, 0, R((c + 1) * 36 * (k % 3 + 1))))
    for z in (0.08, 0.9):
        box("plate", (0, 0, z), (columns * 0.16 + 0.05, 0.22, 0.02), brass, parent=root)
    return root


def transistor(frames):
    root = empty("transistor")
    cyl("can", (0, 0, 0.06), 0.04, 0.05, mat("can", (0.15, 0.15, 0.17), 0.3, 0.6), parent=root)
    cyl("cap", (0, 0, 0.09), 0.042, 0.01, mat("can2", (0.2, 0.2, 0.22), 0.3, 0.6), parent=root)
    for x in (-0.015, 0, 0.015):
        cyl("leg", (x, 0, 0.0), 0.0025, 0.08, mat("leg", (0.8, 0.8, 0.82), 0.2, 1.0), parent=root)
    return root


def microchip(frames, glow=(0.2, 0.6)):
    root = empty("chip")
    box("chip", (0, 0, 0.02), (0.4, 0.4, 0.03), mat("chip", (0.05, 0.05, 0.06), 0.35), 0.004, root)
    for side in range(4):
        for k in range(12):
            u = -0.17 + k * 0.031
            x, y = [(u, -0.215), (u, 0.215), (-0.215, u), (0.215, u)][side]
            box("pin", (x, y, 0.012), (0.012 if side < 2 else 0.03, 0.03 if side < 2 else 0.012, 0.006), mat("pin", (0.85, 0.8, 0.6), 0.2, 1.0), parent=root)
    dm, ds = fx.emissive("die", (0.3, 0.9, 1.0), 0)
    rng = random.Random(2)
    for k in range(40):
        x, y = rng.uniform(-0.12, 0.12), rng.uniform(-0.12, 0.12)
        box("trace", (x, y, 0.0365), (rng.choice([0.08, 0.004]), rng.choice([0.004, 0.08]), 0.001), dm, parent=root)
    glow_keys(ds, frames, [(0, 0), (glow[0], 0), (glow[1], 6)])
    return root


def binary_rain(frames, cols=10, rows=8, area=(3.0, 2.0), seed=6, color=(0.3, 1.0, 0.5)):
    rng = random.Random(seed)
    root = empty("binary")
    m = mat("digits", color, 0.4, emit=3)
    for c in range(cols):
        for r in range(rows):
            d = fx.text(rng.choice("01"), m, ((c - cols / 2) * area[0] / cols, 0, r * area[1] / rows), size=0.14, depth=0.005)
            d.parent = root
            off = rng.uniform(0, 1)
            z0 = r * area[1] / rows
            props.key(d, 1, location=(d.location.x, 0, z0 + area[1] * off))
            props.key(d, frames, location=(d.location.x, 0, z0 + area[1] * off - area[1] * 0.6))
            fx._linear(d)
    return root


def trajectory(frames, draw=(0.1, 0.8), range_m=4.0, apex=1.5):
    root = empty("trajectory")
    m, _ = fx.emissive("traj", (1.0, 0.6, 0.15), 5)
    pts = [V((range_m * u - range_m / 2, 0, 4 * apex * u * (1 - u))) for u in [i / 80 for i in range(81)]]
    c = curve_obj("arc", pts, 0.012, m, root)
    draw_on(c, frames, draw[0], draw[1])
    sh = sph("shell", tuple(pts[0]), 0.05, mat("shellm", (0.4, 0.4, 0.38), 0.3, 0.8), (1.6, 1, 1), root)
    for i, f in enumerate(range(key_frac(frames, draw[0]), key_frac(frames, draw[1]) + 1, 2)):
        u = min(1.0, (f - key_frac(frames, draw[0])) / max(1, key_frac(frames, draw[1]) - key_frac(frames, draw[0])))
        props.key(sh, f, location=(range_m * u - range_m / 2, 0, 4 * apex * u * (1 - u)))
    box("gun", (-range_m / 2, 0, 0.1), (0.5, 0.2, 0.2), mat("gun", (0.2, 0.25, 0.15), 0.5, 0.5), parent=root).rotation_euler = (0, R(-35), 0)
    return root


def laptop(frames, glow=0.2):
    root = empty("laptop")
    box("base", (0, 0, 0.01), (0.34, 0.24, 0.02), mat("alu", (0.75, 0.76, 0.8), 0.3, 0.8), 0.004, root)
    lid = child(empty("lid"), root)
    lid.location = (0, 0.12, 0.02)
    lid.rotation_euler = (R(-15), 0, 0)
    box("lid", (0, 0, 0.11), (0.34, 0.012, 0.22), mat("alu", (0.75, 0.76, 0.8), 0.3, 0.8), 0.004, lid)
    sm, ss = fx.emissive("lcd", (0.3, 0.6, 1.0), 0.2)
    box("screen", (0, -0.007, 0.11), (0.31, 0.002, 0.19), sm, parent=lid)
    glow_keys(ss, frames, [(0, 0.2), (glow, 0.2), (glow + 0.05, 2.5)])
    return root


# ------------------------------------------------------------------ space race
def sputnik(frames, beep=True):
    root = empty("sputnik")
    sph("sputnik_body", (0, 0, 0), 0.29, mat("polished", (0.85, 0.86, 0.9), 0.15, 0.6), parent=root)
    for k in range(4):
        a = R(45 + 90 * k)
        curve_obj("antenna", [V((0.2 * math.cos(a), 0.2 * math.sin(a), -0.1)), V((1.4 * math.cos(a) * 0.5, 1.4 * math.sin(a) * 0.5, -1.2))],
                  0.006, mat("antenna", (0.8, 0.8, 0.82), 0.2, 1.0), root)
    props.key(root, 1, rotation_euler=(0, 0, 0))
    props.key(root, frames, rotation_euler=(R(20), R(10), R(90)))
    if beep:
        for r in space.ring_pulse("beep", (0, 0, 0), (0.4, 1.0, 0.6), frames, max(4, frames // 5), max_scale=1.1, rotation=(R(90), 0, 0)):
            r.parent = root
    return root


def saturn_v(frames, launch=None, scale_h=1.0):
    """Saturn V: white stages with black roll pattern, fins, the Apollo spacecraft and escape tower. Launch = [t_ignite, t_end]."""
    root = empty("saturn")
    white = mat("rocket_white", (0.93, 0.93, 0.92), 0.4)
    black = mat("rocket_black", (0.05, 0.05, 0.06), 0.4)
    h = scale_h
    cyl("s1", (0, 0, 2.1 * h), 0.5, 4.2 * h, white, parent=root)
    for k in range(4):
        a = R(k * 90)
        box("roll_mark", (0.5 * math.cos(a), 0.5 * math.sin(a), 3.6 * h), (0.02, 0.4, 0.9), black, parent=root).rotation_euler = (0, 0, a)
        f = box("fin", (0.62 * math.cos(a + R(45)), 0.62 * math.sin(a + R(45)), 0.35), (0.35, 0.03, 0.6), white, 0.01, root)
        f.rotation_euler = (0, 0, a + R(45))
    cyl("interstage", (0, 0, 4.3 * h), 0.5, 0.2, black, parent=root)
    cyl("s2", (0, 0, 5.6 * h), 0.5, 2.4 * h, white, parent=root)
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.5, radius2=0.33, depth=0.5, location=(0, 0, 7.05 * h))
    c = bpy.context.active_object
    c.data.materials.append(white)
    c.parent = root
    cyl("s3", (0, 0, 7.9 * h), 0.33, 1.2 * h, white, parent=root)
    cyl("sla", (0, 0, 8.8 * h), 0.33, 0.6, white, parent=root)
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.33, radius2=0.05, depth=0.5, location=(0, 0, 9.35 * h))
    cm = bpy.context.active_object
    cm.data.materials.append(mat("cm_silver", (0.85, 0.85, 0.88), 0.2, 1.0))
    cm.parent = root
    cyl("tower", (0, 0, 9.9 * h), 0.03, 0.7, mat("tower_red", (0.8, 0.1, 0.1), 0.4), parent=root)
    for k in range(5):
        a = R(k * 72)
        bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.12, radius2=0.18, depth=0.3, location=(0.25 * math.cos(a) * (k > 0), 0.25 * math.sin(a) * (k > 0), -0.12))
        n = bpy.context.active_object
        n.data.materials.append(black)
        n.parent = root
    if launch:
        fm, fs = fx.emissive("flame", (1.0, 0.55, 0.15), 0)
        flame = sph("flame", (0, 0, -1.2), 0.45, fm, (1, 1, 3.0), root)
        glow_keys(fs, frames, [(0, 0), (launch[0], 0), (launch[0] + 0.03, 25)])
        smoke = mat("smoke", (0.85, 0.83, 0.8), 0.9, alpha=0.8)
        rng = random.Random(1)
        for k in range(12):
            a = rng.uniform(0, 2 * math.pi)
            p = sph("smoke", (0, 0, 0.1), 0.6, smoke, parent=None)
            visible_from(p, frames, launch[0])
            f0 = key_frac(frames, launch[0])
            props.key(p, f0, location=(0, 0, 0.1), scale=(0.2, 0.2, 0.2))
            props.key(p, frames, location=(3.0 * math.cos(a), 3.0 * math.sin(a), rng.uniform(0.2, 1.0)), scale=(2.4, 2.4, 1.6))
        f0, f1 = key_frac(frames, launch[0] + 0.1), key_frac(frames, launch[1])
        props.key(root, 1, location=(0, 0, 0))
        props.key(root, f0, location=(0, 0, 0))
        for f in range(f0, f1 + 1, 2):
            u = (f - f0) / max(1, f1 - f0)
            root.location = (0, 0, 12 * u * u)
            root.keyframe_insert("location", frame=f)
    return root


def launch_tower(frames, height=11.0):
    root = empty("launch_tower")
    red = mat("tower_red", (0.75, 0.12, 0.08), 0.5, 0.3)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl("leg", (1.4 + sx * 0.35, sy * 0.35, height / 2), 0.04, height, red, parent=root)
    for z in range(1, int(height), 1):
        box("deck", (1.4, 0, z), (0.8, 0.8, 0.05), red, parent=root)
        box("arm", (0.95, 0, z + 0.5), (0.9, 0.12, 0.08), red, parent=root) if z % 3 == 0 else None
    box("pad", (0, 0, -0.05), (6, 6, 0.1), mat("concrete", (0.6, 0.6, 0.58), 0.8), parent=root)
    return root


def lunar_module(frames, land=None):
    root = empty("lm")
    gold = mat("foil", (0.95, 0.7, 0.2), 0.25, 1.0)
    grey = mat("ascent", (0.65, 0.65, 0.68), 0.4, 0.5)
    box("descent", (0, 0, 0.9), (1.4, 1.4, 0.7), gold, 0.08, root)
    box("ascent", (0, 0, 1.55), (1.0, 0.9, 0.7), grey, 0.12, root)
    box("window", (0.2, -0.45, 1.7), (0.25, 0.02, 0.2), mat("lm_window", (0.05, 0.05, 0.07), 0.1), parent=root)
    cyl("hatch_dish", (0.45, 0.2, 2.05), 0.15, 0.03, mat("dish", (0.9, 0.9, 0.9), 0.3), parent=root)
    for k in range(4):
        a = R(45 + 90 * k)
        curve_obj("leg", [V((0.6 * math.cos(a), 0.6 * math.sin(a), 0.8)), V((1.3 * math.cos(a), 1.3 * math.sin(a), 0.08))], 0.03, gold, root)
        cyl("pad", (1.3 * math.cos(a), 1.3 * math.sin(a), 0.03), 0.15, 0.04, gold, parent=root)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.25, radius2=0.12, depth=0.35, location=(0, 0, 0.45))
    n = bpy.context.active_object
    n.data.materials.append(mat("nozzle", (0.2, 0.2, 0.22), 0.4, 0.8))
    n.parent = root
    if land:
        fm, fs = fx.emissive("lm_flame", (0.6, 0.75, 1.0), 0)
        sph("lm_flame", (0, 0, 0.1), 0.15, fm, (1, 1, 2), root)
        glow_keys(fs, frames, [(0, 6), (land[1] - 0.02, 6), (land[1], 0)])
        props.key(root, key_frac(frames, land[0]), location=(0, 0, 4.0))
        props.key(root, key_frac(frames, land[1]), location=(0, 0, 0))
    return root


def command_module(frames):
    root = empty("csm")
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.6, radius2=0.1, depth=0.75, location=(0, 0, 0.37))
    c = bpy.context.active_object
    c.data.materials.append(mat("cm_silver", (0.85, 0.85, 0.88), 0.2, 1.0))
    c.parent = root
    cyl("sm", (0, 0, -0.6), 0.6, 1.2, mat("sm", (0.8, 0.8, 0.82), 0.3, 0.8), parent=root)
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.12, radius2=0.35, depth=0.5, location=(0, 0, -1.4))
    n = bpy.context.active_object
    n.data.materials.append(mat("nozzle", (0.2, 0.2, 0.22), 0.4, 0.8))
    n.parent = root
    return root


def moon_surface(frames, size=40, craters=40, seed=3, footprints=False, flag=False):
    root = empty("moon")
    regolith = mat("regolith", (0.42, 0.41, 0.4), 0.95)
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, 0))
    g = bpy.context.active_object
    g.data.materials.append(regolith)
    g.parent = root
    rng = random.Random(seed)
    for k in range(craters):
        r = rng.uniform(0.3, 2.5)
        x, y = rng.uniform(-size / 2.5, size / 2.5), rng.uniform(-2, size / 2)
        props.torus("crater_rim", (x, y, 0.0), r, r * 0.12, regolith).parent = root
        sph("crater_floor", (x, y, -0.02), r * 0.95, mat("crater_dark", (0.3, 0.3, 0.3), 0.95), (1, 1, 0.05), root)
    if footprints:
        fp = mat("footprint", (0.25, 0.25, 0.25), 0.95)
        for k in range(10):
            box("print", (0.3 * (k % 2) - 0.15, -1.0 + k * 0.35, 0.002), (0.12, 0.3, 0.004), fp, parent=root)
    if flag:
        cyl("pole", (1.2, 0.5, 0.8), 0.015, 1.6, mat("pole", (0.85, 0.85, 0.85), 0.3, 0.8), parent=root)
        fl = bpy.data.materials.new("flag")
        fl.use_nodes = True
        nt = fl.node_tree
        pr = nt.nodes["Principled BSDF"]
        tc = nt.nodes.new("ShaderNodeTexCoord")
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        nt.links.new(tc.outputs["Generated"], sep.inputs[0])
        stripes = nt.nodes.new("ShaderNodeMath")
        stripes.operation = "MULTIPLY"
        stripes.inputs[1].default_value = 6.5
        nt.links.new(sep.outputs["Z"], stripes.inputs[0])
        frc = nt.nodes.new("ShaderNodeMath")
        frc.operation = "FRACT"
        nt.links.new(stripes.outputs[0], frc.inputs[0])
        gt = nt.nodes.new("ShaderNodeMath")
        gt.operation = "GREATER_THAN"
        gt.inputs[1].default_value = 0.5
        nt.links.new(frc.outputs[0], gt.inputs[0])
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.inputs["A"].default_value = (0.75, 0.05, 0.08, 1)
        mix.inputs["B"].default_value = (0.95, 0.95, 0.95, 1)
        nt.links.new(gt.outputs[0], mix.inputs["Factor"])
        canton = nt.nodes.new("ShaderNodeMath")
        canton.operation = "LESS_THAN"
        canton.inputs[1].default_value = 0.4
        nt.links.new(sep.outputs["X"], canton.inputs[0])
        top = nt.nodes.new("ShaderNodeMath")
        top.operation = "GREATER_THAN"
        top.inputs[1].default_value = 0.46
        nt.links.new(sep.outputs["Z"], top.inputs[0])
        both = nt.nodes.new("ShaderNodeMath")
        both.operation = "MULTIPLY"
        nt.links.new(canton.outputs[0], both.inputs[0])
        nt.links.new(top.outputs[0], both.inputs[1])
        mix2 = nt.nodes.new("ShaderNodeMix")
        mix2.data_type = "RGBA"
        nt.links.new(both.outputs[0], mix2.inputs["Factor"])
        nt.links.new(mix.outputs["Result"], mix2.inputs["A"])
        mix2.inputs["B"].default_value = (0.05, 0.1, 0.4, 1)
        nt.links.new(mix2.outputs["Result"], pr.inputs["Base Color"])
        box("flag", (1.6, 0.5, 1.4), (0.8, 0.01, 0.5), fl, parent=root)
    return root


def mission_control(frames, rows=3, cols=5, seed=2):
    root = empty("mission_control")
    desk = mat("console", (0.55, 0.55, 0.52), 0.5)
    rng = random.Random(seed)
    for r in range(rows):
        for c in range(cols):
            x, y, z = (c - (cols - 1) / 2) * 0.9, r * 1.1, r * 0.25
            box("console", (x, y, z + 0.45), (0.85, 0.6, 0.9), desk, 0.02, root)
            sm, ss = fx.emissive(f"crt{r}{c}", rng.choice([(0.3, 1.0, 0.5), (0.4, 0.8, 1.0), (1.0, 0.7, 0.3)]), 2)
            box("screen", (x, y - 0.31, z + 0.75), (0.35, 0.02, 0.25), sm, parent=root)
            sph("head", (x, y - 0.65, z + 1.25), 0.1, mat("op_skin", (0.75, 0.55, 0.45), 0.6), parent=root)
            sph("torso", (x, y - 0.65, z + 0.9), 0.17, mat("shirt_white", (0.9, 0.9, 0.92), 0.6), (1, 0.8, 1.4), root)
    box("big_screen", (0, rows * 1.1 + 0.5, 2.5), (6, 0.05, 2.2), fx.emissive("wall_screen", (0.15, 0.35, 0.6), 1.2)[0], parent=root)
    return root


def helmet(frames):
    """Astronaut helmet with gold visor (place on a character's head)."""
    root = empty("helmet")
    sph("shell", (0, 0, 0), 0.17, mat("helmet_white", (0.95, 0.95, 0.95), 0.3), parent=root)
    sph("visor", (0, -0.035, 0.01), 0.15, mat("visor", (1.0, 0.75, 0.25), 0.05, 1.0), (1, 1, 0.9), root)
    return root


# ------------------------------------------------------------------ quantum
def bohr_atom(frames, orbits=3, jump=None, spin=True):
    """Nucleus with circular electron orbits; jump=[t, from, to] moves an electron down an orbit and emits a photon."""
    root = empty("bohr_atom")
    _nucleus("nucleus", (0, 0, 0), 0.08, root, 2, 12)
    om, _ = fx.emissive("orbit", (0.4, 0.75, 1.0), 1.5)
    em = mat("electron", (0.3, 0.7, 1.0), 0.3, emit=4)
    radii = [0.3 + 0.25 * k for k in range(orbits)]
    for r in radii:
        props.torus("orbit", (0, 0, 0), r, 0.004, om, rotation=(R(90), 0, 0)).parent = root
    for k, r in enumerate(radii):
        piv = child(empty("e_piv"), root)
        e = sph("electron", (r, 0, 0), 0.03, em, parent=piv)
        if spin:
            props.key(piv, 1, rotation_euler=(0, 0, 0))
            props.key(piv, frames, rotation_euler=(0, R(720 / (k + 1)), 0))
            fx._linear(piv)
        if jump and k == jump[1]:
            f = key_frac(frames, jump[0])
            props.key(e, f, location=(r, 0, 0))
            props.key(e, f + 3, location=(radii[jump[2]], 0, 0))
            pm, ps = fx.emissive("photon", (1.0, 0.4, 0.8), 0)
            pts = [V((r + 0.03 * i, 0, 0.04 * math.sin(i * 0.9))) for i in range(40)]
            ph = curve_obj("photon", pts, 0.008, pm, root)
            glow_keys(ps, frames, [(0, 0), (jump[0], 0), (jump[0] + 0.02, 8)])
            props.key(ph, f, location=(0, 0, 0))
            props.key(ph, min(frames, f + 30), location=(1.5, 0, 0.3))
    return root


def double_slit(frames, build=(0.1, 0.9), particles=True, seed=4):
    """A source, a barrier with two slits and a screen where hits pile up into interference bands."""
    rng = random.Random(seed)
    root = empty("double_slit")
    wall = mat("barrier", (0.25, 0.25, 0.28), 0.5, 0.5)
    for zc, h in ((0.1, 0.2), (0.4, 0.14), (0.7, 0.2)):
        box("barrier", (0, 0, zc), (0.03, 0.8, h), wall, parent=root)
    box("screen", (1.2, 0, 0.4), (0.02, 1.2, 0.8), mat("screen", (0.08, 0.09, 0.12), 0.5), parent=root)
    box("source", (-1.2, 0, 0.4), (0.2, 0.2, 0.2), mat("source", (0.3, 0.3, 0.35), 0.4, 0.6), 0.02, root)
    hm = mat("hit", (0.4, 1.0, 0.7), 0.3, emit=5)
    n = 320
    for k in range(n):
        while True:  # sample a sharpened two-slit pattern so the bands read on screen
            y = rng.uniform(-0.55, 0.55)
            if rng.random() < (math.cos(y * 13) ** 6) * math.exp(-(y / 0.4) ** 2):
                break
        z = rng.uniform(0.15, 0.65)
        d = sph("hit", (1.185, y, z), 0.008, hm, parent=root)
        t = build[0] + (build[1] - build[0]) * k / n
        visible_from(d, frames, t)
    if particles:
        pm = mat("particle", (0.6, 0.9, 1.0), 0.3, emit=4)
        for k in range(6):
            p = sph("particle", (-1.1, 0, 0.4), 0.02, pm, parent=root)
            t0 = build[0] + k * (build[1] - build[0]) / 6
            props.key(p, key_frac(frames, t0), location=(-1.1, 0, 0.4))
            props.key(p, key_frac(frames, t0 + 0.08), location=(1.17, rng.uniform(-0.3, 0.3), rng.uniform(0.3, 0.5)))
            visible_from(p, frames, t0)
    return root


def photon_box(frames, open_at=0.4):
    """Einstein's 1930 box: hanging from a spring scale, a clock inside opens a shutter to release one photon."""
    root = empty("photon_box")
    box("box", (0, 0, 0.9), (0.5, 0.5, 0.5), mat("pbox", (0.5, 0.4, 0.3), 0.5), 0.01, root)
    spring = coil(frames, turns=10, radius=0.04, length=0.5, axis="z", color=(0.75, 0.75, 0.8), wire=0.006)
    spring.parent = root
    spring.location = (0, 0, 1.45)
    box("frame", (0, 0.4, 1.0), (0.05, 0.05, 2.0), mat("frame", (0.3, 0.3, 0.32), 0.4, 0.8), parent=root)
    box("beam", (0, 0.2, 1.95), (0.05, 0.45, 0.05), mat("frame", (0.3, 0.3, 0.32), 0.4, 0.8), parent=root)
    clk, mn, sc = space.clock("pb_clock", (0, -0.26, 0.95), 0.12, (1.0, 0.8, 0.2))
    clk.parent = root
    space.tick_hand(sc, frames, 12, 1.0, 30)
    sh = box("shutter", (0.26, 0, 0.9), (0.02, 0.1, 0.1), mat("shutter", (0.1, 0.1, 0.1), 0.4), parent=root)
    props.key(sh, key_frac(frames, open_at), location=(0.26, 0, 0.9))
    props.key(sh, key_frac(frames, open_at) + 3, location=(0.26, 0, 1.02))
    pm, _ = fx.emissive("box_photon", (1.0, 0.95, 0.5), 10)
    ph = sph("box_photon", (0.26, 0, 0.9), 0.02, pm, parent=root)
    visible_from(ph, frames, open_at)
    props.key(ph, key_frac(frames, open_at), location=(0.26, 0, 0.9))
    props.key(ph, frames, location=(1.8, 0, 0.9))
    return root


def dice(frames, n=2, roll=(0.1, 0.6), seed=3):
    rng = random.Random(seed)
    root = empty("dice")
    white = mat("die", (0.95, 0.95, 0.93), 0.3)
    pip = mat("pip", (0.05, 0.05, 0.08), 0.3)
    for i in range(n):
        d = child(empty("die"), root)
        box("cube", (0, 0, 0), (0.12, 0.12, 0.12), white, 0.02, d)
        for (x, y, z) in [(0, -0.061, 0), (0.061, 0.03, 0.03), (0.061, -0.03, -0.03), (0, 0, 0.061)]:
            sph("pip", (x, y, z), 0.012, pip, (1, 0.3, 1) if abs(y) > 0.06 else (0.3, 1, 1) if abs(x) > 0.06 else (1, 1, 0.3), d)
        x0 = (i - (n - 1) / 2) * 0.25
        props.key(d, key_frac(frames, roll[0]), location=(x0 - 0.6, 0.2, 0.5), rotation_euler=(0, 0, 0))
        props.key(d, key_frac(frames, roll[1]), location=(x0, 0, 0.06),
                  rotation_euler=(R(90 * rng.randint(3, 8)), R(90 * rng.randint(3, 8)), R(rng.uniform(-30, 30))))
    return root


def entangled(frames, apart=(0.1, 0.6), measure=0.75):
    """Two particles fly apart joined by a glowing thread; measuring one flips both spin arrows at once."""
    root = empty("entangled")
    for k, sign in enumerate((-1, 1)):
        p = child(empty(f"particle{k}"), root)
        sph("ball", (0, 0, 0), 0.08, mat(f"ent{k}", (0.4, 0.8, 1.0) if k else (1.0, 0.5, 0.8), 0.3, emit=2), parent=p)
        ar = space.arrow(f"spin{k}", (1, 1, 1), 0.25, 0.012, 3)
        ar.parent = p
        ar.location = (0, 0, 0)
        ar.rotation_euler = (0, R(-90), 0)
        props.key(ar, key_frac(frames, measure), rotation_euler=(0, R(-90), R(0)))
        props.key(ar, key_frac(frames, measure) + 3, rotation_euler=(0, R(-90 if k else 90), 0))
        props.key(p, key_frac(frames, apart[0]), location=(0, 0, 0))
        props.key(p, key_frac(frames, apart[1]), location=(sign * 1.4, 0, 0))
    lm, ls = fx.emissive("link", (0.8, 0.6, 1.0), 2)
    line = cyl("link", (0, 0, 0), 0.006, 2.8, lm, rot=(0, R(90), 0), parent=root)
    props.key(line, key_frac(frames, apart[0]), scale=(1, 1, 0.01))
    props.key(line, key_frac(frames, apart[1]), scale=(1, 1, 1))
    glow_keys(ls, frames, [(0, 2), (measure, 2), (measure + 0.03, 12), (measure + 0.1, 2)])
    return root


def blackboard(frames, lines=("E = mc²",), at=0.1):
    root = empty("blackboard")
    box("board", (0, 0, 1.5), (2.4, 0.05, 1.3), mat("slate", (0.06, 0.12, 0.08), 0.8), parent=root)
    box("board_frame", (0, 0.01, 1.5), (2.5, 0.04, 1.4), mat("frame_wood", (0.35, 0.2, 0.1), 0.6), parent=root)
    chalk = mat("chalk", (0.95, 0.95, 0.9), 0.9, emit=0.4)
    for i, line in enumerate(lines):
        t = fx.text(line, chalk, (0, -0.035, 1.9 - i * 0.28), size=0.16, depth=0.003)
        t.parent = root
        fx.pop_in(t, key_frac(frames, at + 0.1 * i))
    return root


# ------------------------------------------------------------------ genetics
BASE_COLORS = [(0.95, 0.3, 0.3), (0.3, 0.75, 1.0), (1.0, 0.8, 0.2), (0.4, 0.95, 0.45)]


def dna_helix(frames, length=2.4, turns=3.0, spin=60, cut=None, edit=None, seed=1):
    """Double helix along X: two backbone ribbons and coloured base-pair rungs.
    cut=[t, x] opens a gap at x; edit=[t, x, colour_index] swaps in new rungs there."""
    rng = random.Random(seed)
    root = empty("dna")
    backbone = mat("backbone", (0.85, 0.85, 0.9), 0.3, emit=0.4)
    n = int(turns * 10)
    r = 0.18
    mats = [mat(f"base{k}", c, 0.35, emit=0.6) for k, c in enumerate(BASE_COLORS)]
    for strand in (0, 1):
        pts = []
        for i in range(n * 4 + 1):
            u = i / (n * 4)
            a = 2 * math.pi * turns * u + strand * math.pi
            pts.append(V((u * length - length / 2, r * math.cos(a), r * math.sin(a))))
        curve_obj(f"strand{strand}", pts, 0.03, backbone, root)
    rungs = []
    for i in range(n):
        u = (i + 0.5) / n
        x = u * length - length / 2
        a = 2 * math.pi * turns * u
        p1 = V((x, r * math.cos(a), r * math.sin(a)))
        p2 = V((x, -r * math.cos(a), -r * math.sin(a)))
        k = rng.randint(0, 3)
        for half, (pa, pb), kk in ((0, (p1, (p1 + p2) / 2), k), (1, ((p1 + p2) / 2, p2), 3 - k)):
            mid, d = (pa + pb) / 2, pb - pa
            o = cyl("rung", mid, 0.022, d.length, mats[kk], parent=root)
            o.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
            rungs.append((x, o))
    if cut:
        t, xc = cut
        for x, o in rungs:
            if abs(x - xc) < length / n * 1.2:
                props.key(o, 1, scale=(1, 1, 1))
                props.key(o, key_frac(frames, t), scale=(1, 1, 1))
                props.key(o, key_frac(frames, t) + 4, scale=(0, 0, 0))
        fm, fs = fx.emissive("cut_flash", (1.0, 0.9, 0.4), 0)
        sph("cut_flash", (xc, 0, 0), 0.12, fm, parent=root)
        glow_keys(fs, frames, [(0, 0), (t - 0.01, 0), (t, 25), (t + 0.08, 0)])
    if edit:
        t, xe, kk = edit
        for j in range(3):
            o = cyl("new_rung", (xe + (j - 1) * length / n, 0, 0), 0.024, 2 * r, mat("new_base", BASE_COLORS[kk], 0.3, emit=3), parent=root)
            o.rotation_euler = (R(90 + 36 * j), 0, 0)
            fx.pop_in(o, key_frac(frames, t + 0.04 * j))
    if spin:
        props.key(root, 1, rotation_euler=(0, 0, 0))
        props.key(root, frames, rotation_euler=(R(spin), 0, 0))
        fx._linear(root)
    return root


def cas9(frames, slide=None, guide=True):
    """The Cas9 protein (a lumpy two-lobed blob) carrying a glowing guide RNA strand."""
    root = empty("cas9")
    pm = mat("cas9", (0.55, 0.35, 0.85), 0.5, emit=0.3)
    for (x, y, z, r) in ((0, 0, 0.18, 0.2), (0.12, 0.05, -0.05, 0.17), (-0.13, -0.04, -0.02, 0.16), (0.02, 0.12, 0.05, 0.14)):
        _fuzzy("lobe", (x, y, z), r, (0.55, 0.35, 0.85), root, scale=(1, 1, 1)).data.materials[0] = pm
    if guide:
        gm, _ = fx.emissive("guide_rna", (1.0, 0.85, 0.2), 4)
        pts = [V((0.25 - 0.012 * i, -0.18 + 0.01 * math.sin(i * 0.6), 0.05 * math.cos(i * 0.4))) for i in range(40)]
        curve_obj("guide", pts, 0.012, gm, root)
    if slide:
        for t, x in slide:
            props.key(root, key_frac(frames, t), location=(x, 0, 0))
    return root


def cell(frames, nucleus=True, pulse=False):
    root = empty("cell")
    sph("membrane", (0, 0, 0), 1.0, looks.xray("membrane", (0.4, 0.8, 1.0), 1.5, 0.25), parent=root)
    if nucleus:
        sph("nucleus", (0.1, 0, 0.05), 0.38, mat("nucleus", (0.6, 0.25, 0.7), 0.4, emit=0.4, alpha=0.8), parent=root)
    rng = random.Random(3)
    for k in range(8):
        o = sph("organelle", (rng.uniform(-0.6, 0.6), rng.uniform(-0.6, 0.6), rng.uniform(-0.5, 0.5)), rng.uniform(0.05, 0.1),
                mat("mito", (1.0, 0.55, 0.3), 0.4, emit=0.3), (2, 1, 1), root)
        o.rotation_euler = (rng.uniform(0, 3), rng.uniform(0, 3), 0)
    return root


def phage(frames, attack=None):
    """Bacteriophage: icosahedral head, tail and spidery legs. attack=[t0, t1] moves it down onto a host."""
    root = empty("phage")
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.15, location=(0, 0, 0.55))
    h = bpy.context.active_object
    h.data.materials.append(mat("capsid", (0.75, 0.8, 0.9), 0.3, 0.4))
    h.parent = root
    cyl("tail", (0, 0, 0.27), 0.03, 0.4, mat("tail", (0.6, 0.65, 0.7), 0.3, 0.5), parent=root)
    for k in range(6):
        a = R(k * 60)
        curve_obj("leg", [V((0, 0, 0.08)), V((0.15 * math.cos(a), 0.15 * math.sin(a), 0.1)), V((0.2 * math.cos(a), 0.2 * math.sin(a), -0.05))],
                  0.008, mat("leg", (0.6, 0.65, 0.7), 0.3, 0.5), root)
    if attack:
        props.key(root, key_frac(frames, attack[0]), location=(0, 0, 1.0))
        props.key(root, key_frac(frames, attack[1]), location=(0, 0, 0.0))
    return root


def chromosome(frames, color=(0.6, 0.3, 0.9)):
    root = empty("chromosome")
    m = mat("chrom", color, 0.45, emit=0.4)
    for sign in (-1, 1):
        o = sph("arm", (sign * 0.07, 0, 0), 0.09, m, (1, 1, 4), root)
        o.rotation_euler = (0, R(sign * 12), 0)
    sph("centromere", (0, 0, 0), 0.08, mat("centro", (0.9, 0.85, 0.3), 0.4, emit=0.6), parent=root)
    band = mat("chrom_band", (0.35, 0.15, 0.55), 0.5)
    for sign in (-1, 1):
        for k in range(4):
            z = -0.28 + k * 0.16 + (0.04 if k > 1 else 0)
            props.torus("band", (sign * 0.07 + z * math.tan(R(sign * 12)) * 0, 0, z), 0.085, 0.012, band).parent = root
    return root


def blood_cells(frames, n=10, sickle=0, seed=5, fix=None):
    """Red blood cells: doughnut-like discs; `sickle` of them are crescents; fix=t morphs the crescents back to discs."""
    rng = random.Random(seed)
    root = empty("blood")
    red = mat("rbc", (0.75, 0.05, 0.08), 0.35, emit=0.2)
    for i in range(n):
        c = child(empty("rbc"), root)
        c.location = (rng.uniform(-1.2, 1.2), rng.uniform(-0.4, 0.6), rng.uniform(0.2, 1.0))
        c.rotation_euler = (rng.uniform(0, 3), rng.uniform(0, 3), 0)
        if i < sickle:
            arc = [V((0.16 * math.cos(a), 0.16 * math.sin(a), 0)) for a in [R(-70 + 140 * k / 20) for k in range(21)]]
            o = curve_obj("sickle", arc, 0.04, red, c)
            o.data.bevel_factor_mapping_start = o.data.bevel_factor_mapping_end = "SPLINE"
            if fix is not None:
                ring = props.torus("fixed", (0, 0, 0), 0.1, 0.05, red)
                ring.parent = c
                visible_from(ring, frames, fix + 0.1)
                hide_keys(o, ((1, False), (key_frac(frames, fix + 0.1), True)))
        else:
            props.torus("rbc", (0, 0, 0), 0.1, 0.05, red).parent = c
        props.key(c, 1, location=tuple(c.location))
        props.key(c, frames, location=(c.location.x + 0.4, c.location.y, c.location.z + rng.uniform(-0.1, 0.1)))
    return root


# ------------------------------------------------------------------ fusion
def tokamak(frames, plasma=(0.2, 0.5), cutaway=True, coils=16):
    """Doughnut vacuum vessel with D-shaped field coils and a glowing magenta plasma ring that brightens and swirls."""
    root = empty("tokamak")
    steel = mat("vessel", (0.7, 0.72, 0.76), 0.3, 0.9)
    coil_m = mat("tf_coil", (0.85, 0.55, 0.15), 0.35, 0.8)
    R0, r0 = 1.2, 0.5
    vessel = props.torus("vessel", (0, 0, 0.9), R0, r0, steel)
    vessel.parent = root
    if cutaway:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.9, -0.9, 0.9))
        cutter = bpy.context.active_object
        cutter.scale = (1.8, 1.8, 2.0)
        cutter.hide_render = True
        cutter.parent = root
        b = vessel.modifiers.new("cut", "BOOLEAN")
        b.operation, b.object = "DIFFERENCE", cutter
    for k in range(coils):
        a = 2 * math.pi * k / coils
        if cutaway and math.cos(a) > 0.2 and math.sin(a) < -0.2:
            continue
        pts = []
        for i in range(41):
            t = 2 * math.pi * i / 40
            rr = R0 + (r0 + 0.12) * math.cos(t) * (1.0 if math.cos(t) > 0 else 0.8)
            pts.append(V((rr * math.cos(a), rr * math.sin(a), 0.9 + (r0 + 0.2) * math.sin(t))))
        curve_obj("tf", pts, 0.06, coil_m, root)
    pm, ps = fx.emissive("plasma", (1.0, 0.3, 0.85), 0)
    pl = props.torus("plasma", (0, 0, 0.9), R0, r0 * 0.55, pm)
    pl.parent = root
    pl.scale = (1, 1, 1.4)
    glow_keys(ps, frames, [(0, 0), (plasma[0], 0), (plasma[1], 6)])
    props.key(pl, 1, rotation_euler=(0, 0, 0))
    props.key(pl, frames, rotation_euler=(0, 0, R(240)))
    fx._linear(pl)
    light = bpy.data.lights.new("plasma_light", "POINT")
    light.color = (1.0, 0.35, 0.85)
    lo = child(bpy.data.objects.new("plasma_light", light), root)
    bpy.context.scene.collection.objects.link(lo)
    lo.location = (0, 0, 0.9)
    for t, e in ((0, 0), (plasma[0], 0), (plasma[1], 900)):
        light.energy = e
        light.keyframe_insert("energy", frame=key_frac(frames, t))
    return root


def fusion_reaction(frames, hit=0.45):
    """Deuterium (1p1n) and tritium (1p2n) collide, fuse into helium-4, and fling out a fast neutron and a flash."""
    root = empty("fusion")
    pm, nm = mat("proton", (0.95, 0.2, 0.2), 0.35), mat("neutron_n", (0.3, 0.45, 0.95), 0.35)
    def nucleus(name, parts, loc):
        g = child(empty(name), root)
        g.location = loc
        offs = [(0, 0, 0), (0.09, 0, 0), (0.045, 0.08, 0), (0.045, 0.03, 0.08)]
        for (x, y, z), m in zip(offs, parts):
            sph("nucleon", (x, y, z), 0.06, m, parent=g)
        return g
    d = nucleus("deuterium", [pm, nm], (-1.2, 0, 0))
    tr = nucleus("tritium", [pm, nm, nm], (1.2, 0, 0))
    fh = key_frac(frames, hit)
    props.key(d, 1, location=(-1.2, 0, 0))
    props.key(d, fh, location=(-0.05, 0, 0))
    props.key(tr, 1, location=(1.2, 0, 0))
    props.key(tr, fh, location=(0.05, 0, 0))
    hide_keys(d, ((1, False), (fh, False), (fh + 1, True)))
    hide_keys(tr, ((1, False), (fh, False), (fh + 1, True)))
    he = nucleus("helium", [pm, pm, nm, nm], (0, 0, 0))
    visible_from(he, frames, hit + 0.01)
    props.key(he, fh, location=(0, 0, 0))
    props.key(he, frames, location=(-0.6, 0, 0.3))
    n = sph("fast_neutron", (0, 0, 0), 0.06, mat("fast_n", (0.5, 0.65, 1.0), 0.3, emit=3), parent=root)
    visible_from(n, frames, hit + 0.01)
    props.key(n, fh, location=(0, 0, 0))
    props.key(n, frames, location=(2.5, 0, -0.4))
    fm, fs = fx.emissive("fusion_flash", (1.0, 0.85, 0.5), 0)
    fl = sph("fusion_flash", (0, 0, 0), 0.25, fm, parent=root)
    glow_keys(fs, frames, [(0, 0), (hit - 0.005, 0), (hit, 40), (min(1, hit + 0.15), 0)])
    props.key(fl, fh, scale=(0.4, 0.4, 0.4))
    props.key(fl, min(frames, fh + 8), scale=(3, 3, 3))
    return root


def laser_target(frames, beams=48, fire=0.4):
    """Many laser beams converging on a tiny fuel capsule inside a gold cylinder, which flashes."""
    root = empty("laser_target")
    lm, ls = fx.emissive("laser", (0.25, 0.3, 1.0), 0)
    rng = random.Random(4)
    for k in range(beams):
        u, v = rng.uniform(-1, 1), rng.uniform(0, 2 * math.pi)
        dirn = V((math.sqrt(1 - u * u) * math.cos(v), math.sqrt(1 - u * u) * math.sin(v), u))
        o = curve_obj("beam", [dirn * 3.0, dirn * 0.08], 0.008, lm, root)
        draw_on(o, frames, fire - 0.1, fire)
    glow_keys(ls, frames, [(0, 0), (fire - 0.1, 3), (fire + 0.05, 3), (fire + 0.15, 0)])
    cyl("hohlraum", (0, 0, 0), 0.05, 0.12, mat("gold", (1.0, 0.75, 0.25), 0.2, 1.0), parent=root)
    fm, fs = fx.emissive("implosion", (1.0, 0.9, 0.6), 0)
    sph("capsule_flash", (0, 0, 0), 0.08, fm, parent=root)
    glow_keys(fs, frames, [(0, 0), (fire, 0), (fire + 0.02, 60), (fire + 0.12, 0)])
    return root


def thermometer(frames, rise=(0.1, 0.7), top_label="100,000,000 °C"):
    root = empty("thermometer")
    glass = mat("therm_glass", (0.95, 0.97, 1.0), 0.05, alpha=0.3)
    cyl("tube", (0, 0, 1.0), 0.06, 1.8, glass, parent=root)
    sph("bulb", (0, 0, 0.08), 0.12, mat("therm_red", (1.0, 0.15, 0.1), 0.3, emit=2), parent=root)
    col = cyl("column", (0, 0, 0.1), 0.035, 1.0, mat("therm_red", (1.0, 0.15, 0.1), 0.3, emit=2), parent=root)
    props.key(col, key_frac(frames, rise[0]), scale=(1, 1, 0.05), location=(0, 0, 0.12))
    props.key(col, key_frac(frames, rise[1]), scale=(1, 1, 1.7), location=(0, 0, 0.95))
    t = fx.text(top_label, mat("tlbl", (1.0, 0.7, 0.3), 0.4, emit=2), (0, -0.1, 2.15), size=0.26, depth=0.01)
    t.parent = root
    fx.pop_in(t, key_frac(frames, rise[1]))
    return root


def sun_ball(frames, radius=1.0):
    root = empty("sun_ball")
    for o in space.glowing_sun((0, 0, 0), radius):
        o.parent = root
    return root


# ------------------------------------------------------------------ AI / vision / brain
def neural_net(frames, layers=(6, 8, 8, 5, 3), spacing=0.6, fire=(0.1, 0.8), seed=2):
    """Layers of glowing nodes joined by thin links; a wave of activation sweeps left to right."""
    rng = random.Random(seed)
    root = empty("neural_net")
    link_m = mat("link", (0.4, 0.6, 0.9), 0.4, emit=0.4, alpha=0.6)
    pos = []
    for li, n in enumerate(layers):
        x = (li - (len(layers) - 1) / 2) * spacing
        pos.append([V((x, 0, (k - (n - 1) / 2) * 0.16)) for k in range(n)])
    for li in range(len(layers) - 1):
        for a in pos[li]:
            for b in pos[li + 1]:
                if rng.random() < 0.7:
                    curve_obj("link", [a, b], 0.0025, link_m, root)
    span = fire[1] - fire[0]
    for li, layer in enumerate(pos):
        t = fire[0] + span * li / max(1, len(pos) - 1)
        for k, p in enumerate(layer):
            m, st = fx.emissive(f"node{li}_{k}", (0.3, 0.9, 1.0) if li < len(pos) - 1 else (1.0, 0.8, 0.2), 0.5)
            sph("node", tuple(p), 0.045, m, parent=root)
            on = rng.random() < 0.6 or li == len(pos) - 1 and k == 0
            glow_keys(st, frames, [(0, 0.5), (t, 0.5), (t + 0.04, 8 if on else 1.0), (min(1, t + 0.2), 3 if on else 0.5)])
    return root


CAT = ["..........",
       ".X......X.",
       ".XX....XX.",
       ".XXXXXXXX.",
       ".XX.XX.XX.",
       ".XXXXXXXX.",
       ".XXX..XXX.",
       "..XXXXXX..",
       "...XXXX...",
       ".........."]


def pixel_image(frames, pattern="cat", size=1.0, reveal=None, numbers=False):
    """A grid of coloured squares forming a simple picture (a cat face by default)."""
    root = empty("pixels")
    grid = CAT
    n = len(grid)
    cell = size / n
    fur, bg = mat("px_fur", (0.95, 0.45, 0.08), 0.5, emit=0.12), mat("px_bg", (0.08, 0.2, 0.45), 0.5, emit=0.08)
    eye = mat("px_eye", (0.2, 0.9, 0.4), 0.5, emit=1.0)
    for r, row in enumerate(grid):
        for c, ch in enumerate(row):
            m = fur if ch == "X" else bg
            if (r, c) in ((4, 3), (4, 6)):
                m = eye
            b = box("px", ((c - (n - 1) / 2) * cell, 0, (n - 1 - r) * cell), (cell * 0.92, 0.02, cell * 0.92), m, parent=root)
            if reveal:
                visible_from(b, frames, reveal[0] + (reveal[1] - reveal[0]) * (r * n + c) / (n * n))
            if numbers and r % 3 == 1 and c % 3 == 1:
                t = fx.text(str(200 if ch == "X" else 40), mat("pxnum", (1, 1, 1), 0.4, emit=2), b.location + V((0, -0.02, 0)), size=cell * 0.35, depth=0.001)
                t.parent = root
    return root


def conv_filter(frames, size=1.0, sweep=(0.1, 0.9)):
    """A glowing 3x3 window that sweeps across a 10x10 image, row by row."""
    root = empty("conv")
    cell = size / 10
    fm = mat("filter", (1.0, 0.85, 0.2), 0.3, emit=2, alpha=0.5)
    w = box("window", (0, -0.03, 0), (cell * 3, 0.01, cell * 3), fm, parent=root)
    steps = [(c, r) for r in range(0, 8, 2) for c in range(0, 8)]
    for i, (c, r) in enumerate(steps):
        t = sweep[0] + (sweep[1] - sweep[0]) * i / len(steps)
        props.key(w, key_frac(frames, t), location=((c + 1 - 4.5) * cell, -0.03, (9 - r - 1) * cell))
    return root


def car(frames, drive=None, color=(0.85, 0.15, 0.15), boxes=False):
    root = empty("car")
    body = mat("car_paint", color, 0.25, 0.4)
    box("body", (0, 0, 0.35), (0.9, 2.0, 0.4), body, 0.08, root)
    box("cabin", (0, 0.1, 0.7), (0.8, 1.1, 0.35), mat("car_glass", (0.1, 0.12, 0.15), 0.1, 0.3), 0.1, root)
    for sx in (-1, 1):
        for sy in (-1, 1):
            cyl("wheel", (sx * 0.45, sy * 0.65, 0.18), 0.18, 0.15, mat("tyre", (0.03, 0.03, 0.03), 0.6), rot=(0, R(90), 0), parent=root)
    box("lidar", (0, 0.1, 0.92), (0.2, 0.2, 0.08), mat("lidar", (0.1, 0.1, 0.12), 0.3), parent=root)
    if boxes:
        bm = mat("bbox", (0.2, 1.0, 0.4), 0.3, emit=4)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.5))
        b = bpy.context.active_object
        b.scale = (1.0, 2.2, 1.0)
        b.modifiers.new("wire", "WIREFRAME").thickness = 0.02
        b.data.materials.append(bm)
        b.parent = root
    if drive:
        for t, y in drive:
            props.key(root, key_frac(frames, t), location=(root.location.x, y, 0))
    return root


def bbox_label(frames, label="CAT 97%", size=(1.0, 1.0), color=(0.2, 1.0, 0.4), at=0.3):
    root = empty("bbox")
    m = mat("bbox_" + label, color, 0.3, emit=4)
    w, h = size
    for (x, z, sx, sz) in ((0, h / 2, w, 0.02), (0, -h / 2, w, 0.02), (-w / 2, 0, 0.02, h), (w / 2, 0, 0.02, h)):
        box("edge", (x, 0, z), (sx, 0.01, sz), m, parent=root)
    t = fx.text(label, m, (-w / 2 + 0.25, 0, h / 2 + 0.08), size=0.1, depth=0.005)
    t.parent = root
    visible_from(root, frames, at)
    return root


def eye(frames, look=None):
    root = empty("eye")
    sph("eyeball", (0, 0, 0), 0.5, mat("sclera", (0.95, 0.95, 0.93), 0.2), parent=root)
    iris = sph("iris", (0, -0.42, 0), 0.25, mat("iris", (0.2, 0.55, 0.85), 0.3), (1, 0.35, 1), root)
    sph("pupil", (0, -0.48, 0), 0.11, mat("pupil", (0.01, 0.01, 0.01), 0.1), (1, 0.3, 1), root)
    sph("cornea", (0, -0.15, 0), 0.47, mat("cornea", (1, 1, 1), 0.02, alpha=0.15), parent=root)
    if look:
        for t, (rx, rz) in look:
            props.key(root, key_frac(frames, t), rotation_euler=(R(rx), 0, R(rz)))
    return root


def neuron(frames, fire=None, seed=1, color=(0.95, 0.55, 0.3)):
    """A nerve cell: body, branching dendrites and a long axon; fire=[t0, t1] sends a glowing pulse down the axon."""
    rng = random.Random(seed)
    root = empty("neuron")
    m = mat("neuron", color, 0.4, emit=0.5)
    sph("soma", (0, 0, 0), 0.15, m, parent=root)
    for k in range(7):
        a = rng.uniform(0, 2 * math.pi)
        pts = [V((0, 0, 0))]
        d = V((math.cos(a), rng.uniform(-0.4, 0.4), math.sin(a))).normalized()
        p = V((0, 0, 0))
        for s in range(4):
            p = p + d * 0.12
            d = (d + V((rng.uniform(-0.5, 0.5), rng.uniform(-0.5, 0.5), rng.uniform(-0.5, 0.5)))).normalized()
            pts.append(p.copy())
        curve_obj("dendrite", pts, 0.015, m, root)
    axon = [V((0, 0, 0))] + [V((0.15 + 0.12 * i, 0.03 * math.sin(i), 0.02 * math.cos(i * 1.3))) for i in range(18)]
    curve_obj("axon", axon, 0.02, m, root)
    if fire:
        pm, ps = fx.emissive("spike", (0.5, 0.9, 1.0), 10)
        sp = sph("spike", (0, 0, 0), 0.04, pm, parent=root)
        visible_from(sp, frames, fire[0])
        for i, f in enumerate(range(key_frac(frames, fire[0]), key_frac(frames, fire[1]) + 1, 2)):
            u = min(1.0, (f - key_frac(frames, fire[0])) / max(1, key_frac(frames, fire[1]) - key_frac(frames, fire[0])))
            idx = min(len(axon) - 1, int(u * (len(axon) - 1)))
            props.key(sp, f, location=tuple(axon[idx]))
    return root


def gpu(frames):
    root = empty("gpu")
    box("board", (0, 0, 0.02), (0.9, 0.35, 0.03), mat("pcb", (0.05, 0.25, 0.12), 0.4), parent=root)
    box("shroud", (0, 0, 0.09), (0.85, 0.32, 0.1), mat("shroud", (0.12, 0.12, 0.14), 0.3, 0.6), 0.01, root)
    for x in (-0.22, 0.22):
        fan = cyl("fan", (x, 0, 0.145), 0.12, 0.01, mat("fan_hub", (0.08, 0.08, 0.09), 0.4), parent=root)
        for k in range(7):
            box("fan_blade", (x + 0.06 * math.cos(R(k * 51)), 0.06 * math.sin(R(k * 51)), 0.152), (0.1, 0.025, 0.004), mat("fanblade", (0.25, 0.25, 0.27), 0.4), parent=root).rotation_euler = (R(15), 0, R(k * 51))
        props.torus("fan_ring", (x, 0, 0.145), 0.13, 0.008, mat("ring", (0.5, 1.0, 0.4), 0.3, emit=3)).parent = root
    return root


# ------------------------------------------------------------------ brain-computer interfaces
def brain(frames, glow=None, region="motor", xray=False):
    """Two folded hemispheres (noise-displaced spheres) with an optional glowing region (motor/visual/speech)."""
    root = empty("brain")
    m = mat("cortex", (0.9, 0.5, 0.55), 0.5, 0.15) if not xray else looks.xray("cortex_x", (1.0, 0.5, 0.6), 1.5, 0.3)
    tex = bpy.data.textures.new("gyri", "MARBLE")
    tex.noise_scale = 0.05
    tex.turbulence = 12
    tex.marble_type = "SHARPER"
    for side in (-1, 1):
        h = sph("hemisphere", (side * 0.16, 0, 0), 0.3, m, (0.55, 1.0, 0.8), root)
        d = h.modifiers.new("folds", "DISPLACE")
        d.texture, d.strength = tex, 0.05
        h.modifiers.new("detail", "SUBSURF").levels = 2
        h.modifiers.move(len(h.modifiers) - 1, 0)
    sph("cerebellum", (0, 0.24, -0.18), 0.14, mat("cerebellum", (0.8, 0.5, 0.5), 0.6), (1.6, 1, 0.7), root)
    cyl("stem", (0, 0.12, -0.32), 0.05, 0.25, mat("stem", (0.8, 0.55, 0.5), 0.6), rot=(R(-20), 0, 0), parent=root)
    if glow:
        loc = {"motor": (0.2, -0.02, 0.2), "visual": (0.1, 0.27, 0.0), "speech": (-0.3, -0.12, 0.0)}[region]
        gm, gs = fx.emissive("region", (0.3, 0.9, 1.0), 0)
        sph("region", loc, 0.1, gm, (1, 1, 0.6), root)
        glow_keys(gs, frames, glow)
    return root


def eeg_cap(frames, signals=True):
    """A head-sized cap covered in electrodes with trailing wires."""
    root = empty("eeg")
    sph("cap", (0, 0, 0.05), 0.2, mat("cap_fabric", (0.15, 0.3, 0.6), 0.7), (0.95, 1.1, 0.9), root)
    rng = random.Random(3)
    em = mat("electrode", (0.85, 0.85, 0.88), 0.3, 0.8)
    for k in range(24):
        a, b = rng.uniform(0, 2 * math.pi), rng.uniform(0.1, 1.3)
        p = V((math.sin(b) * math.cos(a) * 0.19, math.sin(b) * math.sin(a) * 0.21, 0.05 + math.cos(b) * 0.18))
        sph("electrode", tuple(p), 0.014, em, parent=root)
    return root


def electrode_array(frames, n=10, glow=None):
    """A Utah-style array: a tiny square chip with a bed of needles."""
    root = empty("array")
    box("base", (0, 0, 0.0), (0.4, 0.4, 0.04), mat("array_base", (0.3, 0.32, 0.35), 0.3, 0.8), parent=root)
    nm = mat("needle", (0.75, 0.76, 0.8), 0.2, 1.0, emit=0.0, emit_color=(0.3, 0.9, 1.0))
    for i in range(n):
        for j in range(n):
            bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.008, radius2=0.002, depth=0.15,
                                            location=(-0.18 + i * 0.04, -0.18 + j * 0.04, -0.095), rotation=(R(180), 0, 0))
            c = bpy.context.active_object
            c.data.materials.append(nm)
            c.parent = root
    curve_obj("ribbon", [V((0.2, 0, 0)), V((0.45, 0.1, 0.1)), V((0.8, 0.0, 0.25))], 0.02, mat("ribbon", (0.9, 0.7, 0.2), 0.4), root)
    if glow:
        glow_keys(nm.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"], frames, glow)
    return root


def robot_arm(frames, reach=(0.2, 0.7), grip=0.75):
    """A three-segment robotic arm on a base with a two-finger gripper; reaches forward then closes its grip."""
    root = empty("robot_arm")
    metal = mat("arm_metal", (0.85, 0.86, 0.9), 0.3, 0.7)
    dark = mat("arm_joint", (0.15, 0.15, 0.17), 0.4, 0.5)
    cyl("base", (0, 0, 0.05), 0.15, 0.1, dark, parent=root)
    shoulder = child(empty("shoulder"), root)
    shoulder.location = (0, 0, 0.1)
    box("upper", (0, 0, 0.25), (0.08, 0.08, 0.5), metal, 0.02, shoulder)
    sph("j1", (0, 0, 0.5), 0.07, dark, parent=shoulder)
    elbow = child(empty("elbow"), shoulder)
    elbow.location = (0, 0, 0.5)
    box("fore", (0, 0, 0.2), (0.07, 0.07, 0.4), metal, 0.02, elbow)
    sph("j2", (0, 0, 0.4), 0.055, dark, parent=elbow)
    wrist = child(empty("wrist"), elbow)
    wrist.location = (0, 0, 0.4)
    fingers = []
    for sx in (-1, 1):
        fp = child(empty("finger"), wrist)
        fp.location = (sx * 0.03, 0, 0.02)
        box("finger", (0, 0, 0.06), (0.015, 0.04, 0.12), dark, parent=fp)
        fingers.append((fp, sx))
    for t, (sh, el) in ((0, (0, 0)), (reach[0], (0, 0)), (reach[1], (-45, -60))):
        props.key(shoulder, key_frac(frames, t), rotation_euler=(R(sh), 0, 0))
        props.key(elbow, key_frac(frames, t), rotation_euler=(R(el), 0, 0))
    for fp, sx in fingers:
        props.key(fp, key_frac(frames, grip), rotation_euler=(0, R(sx * 25), 0))
        props.key(fp, key_frac(frames, grip) + 4, rotation_euler=(0, R(-sx * 5), 0))
    return root


def mri_machine(frames, slide=None):
    root = empty("mri")
    white = mat("mri_white", (0.93, 0.93, 0.95), 0.35)
    bore = props.torus("bore", (0, 0, 1.0), 0.95, 0.45, white, rotation=(R(90), 0, 0))
    bore.parent = root
    bore.scale = (1, 1, 1.6)
    props.torus("bore_glow", (0, -0.75, 1.0), 0.55, 0.02, fx.emissive("bore_glow", (0.4, 0.8, 1.0), 4)[0], rotation=(R(90), 0, 0)).parent = root
    table = box("table", (0, -1.4, 0.75), (0.6, 2.2, 0.12), white, 0.04, root)
    box("table_stand", (0, -1.9, 0.35), (0.4, 0.4, 0.7), white, 0.04, root)
    if slide:
        props.key(table, key_frac(frames, slide[0]), location=(0, -1.4, 0.75))
        props.key(table, key_frac(frames, slide[1]), location=(0, -0.3, 0.75))
    return root


def stent(frames):
    """A tiny mesh tube electrode, like those threaded through a blood vessel."""
    root = empty("stent")
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.1, depth=0.6, location=(0, 0, 0), rotation=(0, R(90), 0))
    c = bpy.context.active_object
    sub = c.modifiers.new("sub", "SUBSURF")
    sub.subdivision_type, sub.levels, sub.render_levels = "SIMPLE", 2, 2
    c.modifiers.new("wire", "WIREFRAME").thickness = 0.006
    c.data.materials.append(mat("nitinol", (0.8, 0.8, 0.85), 0.25, 1.0))
    c.parent = root
    vm = mat("vessel_wall", (0.8, 0.2, 0.25), 0.4, alpha=0.35)
    cyl("vessel", (0, 0, 0), 0.13, 1.6, vm, rot=(0, R(90), 0), parent=root)
    return root


def spikes(frames, channels=6, length=2.0, draw=(0.05, 0.9), seed=4):
    """Several channels of neural spike trains drawing across like a lab recording."""
    rng = random.Random(seed)
    root = empty("spikes")
    cols = [(0.3, 0.9, 1.0), (1.0, 0.5, 0.8), (0.5, 1.0, 0.5), (1.0, 0.8, 0.3)]
    for c in range(channels):
        m, _ = fx.emissive(f"chan{c}", cols[c % len(cols)], 4)
        pts = []
        for i in range(301):
            u = i / 300
            y = 0.01 * math.sin(i * 0.7 + c)
            if rng.random() < 0.04:
                y += 0.12
            pts.append(V((u * length - length / 2, 0, c * 0.2 + y)))
        o = curve_obj(f"chan{c}", pts, 0.005, m, root)
        draw_on(o, frames, draw[0], draw[1])
    return root

PROPS = {name: fn for name, fn in globals().items()
         if callable(fn) and not name.startswith("_") and fn.__module__ == __name__
         and name not in ("mat", "empty", "child", "box", "cyl", "sph", "curve_obj", "lathe", "key_frac", "draw_on",
                          "glow_keys", "visible_from", "_fuzzy", "_nucleus", "_tree", "hide_keys", "_wing", "propeller", "BASE_COLORS")}
