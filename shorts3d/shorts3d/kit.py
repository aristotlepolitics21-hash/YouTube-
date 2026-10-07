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

PROPS = {name: fn for name, fn in globals().items()
         if callable(fn) and not name.startswith("_") and fn.__module__ == __name__
         and name not in ("mat", "empty", "child", "box", "cyl", "sph", "curve_obj", "lathe", "key_frac", "draw_on",
                          "glow_keys", "visible_from", "_fuzzy", "_nucleus", "_tree", "hide_keys", "_wing", "propeller")}
