"""Colourful effects: storm sky, rain, lightning, electric skin, outfits, a beating heart
with an ECG trace, Lichtenberg figures, 3D text and icons. All procedural."""

from __future__ import annotations

import math
import random

import bpy
import mathutils
import numpy as np

from . import looks, props

V = mathutils.Vector
FONT = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
FONT_FALLBACK = "/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf"


# ------------------------------------------------------------------ world
def gradient_world(scene, horizon=(0.2, 0.025, 0.32), zenith=(0.008, 0.01, 0.045), strength=0.8):
    """Sky gradient by view elevation. Returns the Background strength socket (key it for flashes)."""
    w = bpy.data.worlds.new("sky")
    scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value, mr.inputs["From Max"].default_value = -0.05, 0.7
    nt.links.new(tc.outputs["Generated"], sep.inputs[0])
    nt.links.new(sep.outputs["Z"], mr.inputs["Value"])
    nt.links.new(mr.outputs[0], ramp.inputs["Fac"])
    ramp.color_ramp.elements[0].color = (*horizon, 1)
    ramp.color_ramp.elements[1].color = (*zenith, 1)
    nt.links.new(ramp.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    scene.view_settings.look = "AgX - Punchy"
    return bg.inputs["Strength"]


def flash(socket_owner, socket, frames_values):
    """Key a socket's default_value at (frame, value) pairs."""
    for f, v in frames_values:
        socket.default_value = v
        socket.keyframe_insert("default_value", frame=max(1, int(f)))


def wet_floor():
    m = looks.principled("wet_floor", (0.03, 0.035, 0.07), 0.12)
    return props.floor(m, size=60)


def colour_studio(scene, target, scale=1.0, key=(0.65, 0.78, 1.0), rim=(1.0, 0.35, 0.8), fill=(0.5, 0.4, 1.0)):
    t = V(target)
    looks.area_light(scene, "key", t + V((-2, -3, 1.5)) * scale, t, 700 * scale ** 2, 2 * scale, key)
    looks.area_light(scene, "rim", t + V((2.5, 2, 1.2)) * scale, t, 900 * scale ** 2, 1 * scale, rim)
    looks.area_light(scene, "fill", t + V((2.5, -2.5, 0)) * scale, t, 200 * scale ** 2, 3 * scale, fill)


# ------------------------------------------------------------------- rain
def rain(frames, fps, centre=(0, 0, 0), count=1400, speed=6.0, spread=(5.0, 5.0)):
    """Thin glowing streaks in one mesh, falling as a block for the whole shot."""
    seconds = frames / fps
    height = speed * seconds + 5
    rng = random.Random(4)
    verts, faces = [], []
    for i in range(count):
        x = centre[0] + rng.uniform(-spread[0] / 2, spread[0] / 2)
        y = centre[1] + rng.uniform(-spread[1] / 2, spread[1] / 2)
        z = rng.uniform(0, height)
        length, r = rng.uniform(0.18, 0.32), 0.0025
        b = len(verts)
        for dz in (0, length):
            for k in range(3):
                a = k * 2 * math.pi / 3
                verts.append((x + r * math.cos(a), y + r * math.sin(a), z + dz))
        faces += [(b + k, b + (k + 1) % 3, b + 3 + (k + 1) % 3, b + 3 + k) for k in range(3)]
    mesh = bpy.data.meshes.new("rain")
    mesh.from_pydata(verts, [], faces)
    o = bpy.data.objects.new("rain", mesh)
    bpy.context.scene.collection.objects.link(o)
    m = _glow_transparent("rain", (0.6, 0.75, 1.0), 1.2, 0.55)
    o.data.materials.append(m)
    o.visible_shadow = False
    for f, z in ((1, 0.0), (frames, -speed * seconds)):
        props.key(o, f, location=(0, 0, z))
    _linear(o)
    return o


def _linear(obj):
    ad = obj.animation_data
    if ad and ad.action:
        for fc in _fcurves(ad.action):
            for k in fc.keyframe_points:
                k.interpolation = "LINEAR"


def _fcurves(action):
    if hasattr(action, "fcurves") and len(getattr(action, "fcurves", [])):
        return list(action.fcurves)
    out = []  # Blender 5 layered actions
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for bag in strip.channelbags:
                out += list(bag.fcurves)
    return out


def _glow_transparent(name, color, strength, opacity):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    em.inputs["Strength"].default_value = strength
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mx = nt.nodes.new("ShaderNodeMixShader")
    mx.inputs[0].default_value = opacity
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(tr.outputs[0], mx.inputs[1])
    nt.links.new(em.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    return m


def emissive(name, color, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    em.inputs["Strength"].default_value = strength
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(em.outputs[0], out.inputs[0])
    return m, em.inputs["Strength"]


# --------------------------------------------------------------- lightning
def _jagged(start, end, rng, segments, jitter):
    s, e = V(start), V(end)
    d = e - s
    side = d.cross(V((0, 0, 1)))
    if side.length < 1e-6:
        side = V((1, 0, 0))
    side.normalize()
    other = d.normalized().cross(side)
    pts = [s]
    for i in range(1, segments):
        t = i / segments
        amp = jitter * d.length * math.sin(math.pi * t) ** 0.6
        pts.append(s + d * t + side * rng.uniform(-amp, amp) + other * rng.uniform(-amp, amp) * 0.6)
    pts.append(e)
    return pts


def _curve(name, pts, width, material):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = width
    cu.bevel_resolution = 2
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (*c, 1)
    o = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(o)
    cu.materials.append(material)
    return o


def bolt(start, end, at_frame, seed=1, width=0.03, branches=5, color=(0.75, 0.85, 1.0), hold=5):
    """A branching lightning bolt that draws itself in 2 frames, flickers and vanishes.
    Returns the list of curve objects."""
    rng = random.Random(seed)
    mat, strength = emissive(f"bolt{seed}", color, 60)
    main = _jagged(start, end, rng, 18, 0.06)
    objs = [_curve(f"bolt{seed}", main, width, mat)]
    for b in range(branches):
        i = rng.randint(3, len(main) - 5)
        p = main[i]
        down = (V(end) - V(start)).normalized()
        dirn = (down + V((rng.uniform(-1, 1), rng.uniform(-0.6, 0.6), rng.uniform(-0.2, 0.3)))).normalized()
        length = (V(end) - V(start)).length * rng.uniform(0.12, 0.3)
        objs.append(_curve(f"bolt{seed}_b{b}", _jagged(p, p + dirn * length, rng, 7, 0.12), width * 0.45, mat))
    f = int(at_frame)
    for o in objs:
        o.hide_render = True
        o.keyframe_insert("hide_render", frame=1)
        o.keyframe_insert("hide_render", frame=max(1, f - 1))
        o.hide_render = False
        o.keyframe_insert("hide_render", frame=f)
        o.hide_render = True
        o.keyframe_insert("hide_render", frame=f + hold)
        cu = o.data
        cu.bevel_factor_end = 0.05
        cu.keyframe_insert("bevel_factor_end", frame=f)
        cu.bevel_factor_end = 1.0
        cu.keyframe_insert("bevel_factor_end", frame=f + 2)
    flash(None, strength, [(f, 80), (f + 2, 25), (f + 3, 70), (f + hold, 10)])
    return objs


def strike_light(scene, loc, at_frame, energy=4000, color=(0.75, 0.85, 1.0)):
    light = bpy.data.lights.new("strike", "POINT")
    light.color = color
    light.shadow_soft_size = 0.5
    o = bpy.data.objects.new("strike", light)
    o.location = loc
    scene.collection.objects.link(o)
    f = int(at_frame)
    for fr, e in ((f - 1, 0), (f, energy), (f + 2, energy * 0.3), (f + 3, energy * 0.9), (f + 6, 0)):
        light.energy = e
        light.keyframe_insert("energy", frame=max(1, fr))
    return o


ICON = [(0.15, 1.0), (-0.35, -0.05), (0.02, -0.05), (-0.18, -1.0), (0.38, 0.18), (0.02, 0.18), (0.32, 1.0)]


def bolt_icon(name, material, loc, size=0.3, depth=0.05, rotation=(math.radians(90), 0, 0)):
    """The classic zig-zag lightning icon, extruded."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "2D"
    cu.fill_mode = "BOTH"
    cu.extrude = depth / 2
    cu.bevel_depth = depth * 0.15
    sp = cu.splines.new("POLY")
    sp.points.add(len(ICON) - 1)
    for p, (x, y) in zip(sp.points, ICON):
        p.co = (x * size, y * size, 0, 1)
    sp.use_cyclic_u = True
    o = bpy.data.objects.new(name, cu)
    o.location = loc
    o.rotation_euler = rotation
    bpy.context.scene.collection.objects.link(o)
    cu.materials.append(material)
    return o


def text(body, material, loc, size=0.5, depth=0.08, rotation=(math.radians(90), 0, 0)):
    cu = bpy.data.curves.new("txt", "FONT")
    cu.body = body
    fonts = (FONT, FONT_FALLBACK)
    if any(ord(ch) > 0x2000 or 0x370 <= ord(ch) < 0x400 or ord(ch) > 0x1F00 for ch in body if ch not in "\u2013\u2192\u2212"):
        fonts = ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",) + fonts  # maths and Greek glyphs
    for path in fonts:
        try:
            cu.font = bpy.data.fonts.load(path, check_existing=True)
            break
        except RuntimeError:
            continue
    cu.size = size
    cu.extrude = depth / 2
    cu.bevel_depth = depth * 0.12
    cu.align_x, cu.align_y = "CENTER", "CENTER"
    o = bpy.data.objects.new("txt_" + body, cu)
    o.location = loc
    o.rotation_euler = rotation
    bpy.context.scene.collection.objects.link(o)
    cu.materials.append(material)
    return o


def pop_in(obj, frame, scale=1.0, over=6):
    s = scale
    props.key(obj, 1, scale=(0, 0, 0))
    props.key(obj, max(1, frame), scale=(0, 0, 0))
    props.key(obj, frame + over * 0.6, scale=(s * 1.18, s * 1.18, s * 1.18))
    props.key(obj, frame + over, scale=(s, s, s))


# --------------------------------------------------------------- the body
OUTFIT_REGIONS = {
    "skin": ("head", "neck", "forearm", "hand", "thumb", "index", "middle", "ring", "little"),
    "shirt": ("shoulder", "upper_arm", "spine1", "spine2"),
    "pants": ("hips", "thigh", "shin"),
    "boots": ("foot",),
}


def apply_outfit(body, colors: dict):
    """Paint a per-vertex colour attribute 'outfit' from each vertex's dominant bone."""
    groups = {g.index: g.name for g in body.vertex_groups}
    region_of = {}
    for gi, gname in groups.items():
        raw = gname.split(".")[0]
        for region, bones in OUTFIT_REGIONS.items():
            if raw in bones or raw.rstrip("0123456789") in bones:
                region_of[gi] = region
    skin = colors.get("skin", (0.62, 0.52, 0.47))
    attr = body.data.color_attributes.new("outfit", "FLOAT_COLOR", "POINT")
    for v in body.data.vertices:
        best = max(v.groups, key=lambda e: e.weight, default=None)
        region = region_of.get(best.group, "skin") if best else "skin"
        c = colors.get(region) or skin
        attr.data[v.index].color = (*c, 1)
    return attr


def hat(rig, material, top_z, centre_xy=(0.0, -0.01)):
    """Ranger campaign hat: wide brim and a pinched crown, riding on the head bone."""
    x, y = centre_xy
    brim = props.cylinder("hat_brim", (x, y, top_z - 0.055), 0.2, 0.012, material)
    bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=0.105, radius2=0.06, depth=0.13,
                                    location=(x, y, top_z + 0.0))
    crown = bpy.context.active_object
    crown.name = "hat_crown"
    bpy.ops.object.shade_smooth()
    crown.data.materials.append(material)
    band = props.cylinder("hat_band", (x, y, top_z - 0.035), 0.104, 0.025,
                          looks.principled("hat_band", (0.25, 0.12, 0.05), 0.5))
    bpy.context.view_layer.update()
    for o in (brim, crown, band):
        mw = o.matrix_world.copy()
        o.parent = rig
        o.parent_type = "BONE"
        o.parent_bone = "head"
        bpy.context.view_layer.update()
        o.matrix_world = mw
    return [brim, crown, band]


def skin_material(outfit=False, flashover=False, lichtenberg=None):
    """Skin that can (a) take outfit colours, (b) dissolve to x-ray, (c) crackle with electricity,
    (d) show a Lichtenberg figure. Returns (material, handles) where handles holds the sockets to animate:
    'xray', 'flash', 'lich_reveal', 'lich_fade'."""
    m, xray_amount = looks.skin_to_xray("skin_fx")
    nt = m.node_tree
    skin = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    handles = {"xray": xray_amount}
    base = None
    if outfit:
        ca = nt.nodes.new("ShaderNodeVertexColor")
        ca.layer_name = "outfit"
        base = ca.outputs["Color"]
        nt.links.new(base, skin.inputs["Base Color"])
    if lichtenberg is not None:
        img, empty, size = lichtenberg
        tc = nt.nodes.new("ShaderNodeTexCoord")
        tc.object = empty
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (1 / size, 1 / size, 1)
        mp.inputs["Location"].default_value = (0.5, 0.5, 0)
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = img
        tex.extension = "CLIP"
        nt.links.new(mp.outputs[0], tex.inputs["Vector"])
        sep = nt.nodes.new("ShaderNodeSeparateColor")
        nt.links.new(tex.outputs["Color"], sep.inputs[0])
        reveal = nt.nodes.new("ShaderNodeValue")
        reveal.outputs[0].default_value = 0
        fade = nt.nodes.new("ShaderNodeValue")
        fade.outputs[0].default_value = 1
        # grown = clamp((reveal - arrival) * 12)
        sub = nt.nodes.new("ShaderNodeMath")
        sub.operation = "SUBTRACT"
        nt.links.new(reveal.outputs[0], sub.inputs[0])
        nt.links.new(sep.outputs[1], sub.inputs[1])
        grow = nt.nodes.new("ShaderNodeMath")
        grow.operation = "MULTIPLY"
        grow.use_clamp = True
        grow.inputs[1].default_value = 12
        nt.links.new(sub.outputs[0], grow.inputs[0])
        mask = nt.nodes.new("ShaderNodeMath")
        mask.operation = "MULTIPLY"
        nt.links.new(grow.outputs[0], mask.inputs[0])
        nt.links.new(sep.outputs[0], mask.inputs[1])
        # only on surfaces facing the projector's +Y side (the back)
        geo = nt.nodes.new("ShaderNodeNewGeometry")
        nsep = nt.nodes.new("ShaderNodeSeparateXYZ")
        nt.links.new(geo.outputs["Normal"], nsep.inputs[0])
        facing = nt.nodes.new("ShaderNodeMapRange")
        facing.inputs["From Min"].default_value, facing.inputs["From Max"].default_value = 0.1, 0.5
        nt.links.new(nsep.outputs["Y"], facing.inputs["Value"])
        m2 = nt.nodes.new("ShaderNodeMath")
        m2.operation = "MULTIPLY"
        nt.links.new(mask.outputs[0], m2.inputs[0])
        nt.links.new(facing.outputs[0], m2.inputs[1])
        m3 = nt.nodes.new("ShaderNodeMath")
        m3.operation = "MULTIPLY"
        nt.links.new(m2.outputs[0], m3.inputs[0])
        nt.links.new(fade.outputs[0], m3.inputs[1])
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        nt.links.new(m3.outputs[0], mix.inputs["Factor"])
        if base is not None:
            nt.links.new(base, mix.inputs["A"])
        else:
            mix.inputs["A"].default_value = skin.inputs["Base Color"].default_value
        mix.inputs["B"].default_value = (0.7, 0.01, 0.05, 1)
        nt.links.new(mix.outputs["Result"], skin.inputs["Base Color"])
        handles["lich_reveal"], handles["lich_fade"] = reveal.outputs[0], fade.outputs[0]
    if flashover:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        vor = nt.nodes.new("ShaderNodeTexVoronoi")
        vor.voronoi_dimensions = "4D"
        vor.feature = "DISTANCE_TO_EDGE"
        vor.inputs["Scale"].default_value = 22
        nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
        edge = nt.nodes.new("ShaderNodeMapRange")
        edge.inputs["From Min"].default_value, edge.inputs["From Max"].default_value = 0.035, 0.0
        nt.links.new(vor.outputs["Distance"], edge.inputs["Value"])
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.noise_dimensions = "4D"
        noise.inputs["Scale"].default_value = 4
        nt.links.new(tc.outputs["Object"], noise.inputs["Vector"])
        patch = nt.nodes.new("ShaderNodeMapRange")
        patch.inputs["From Min"].default_value, patch.inputs["From Max"].default_value = 0.45, 0.6
        nt.links.new(noise.outputs["Fac"], patch.inputs["Value"])
        amt = nt.nodes.new("ShaderNodeValue")
        amt.outputs[0].default_value = 0
        a = nt.nodes.new("ShaderNodeMath")
        a.operation = "MULTIPLY"
        nt.links.new(edge.outputs[0], a.inputs[0])
        nt.links.new(patch.outputs[0], a.inputs[1])
        b = nt.nodes.new("ShaderNodeMath")
        b.operation = "MULTIPLY"
        b.inputs[1].default_value = 7
        nt.links.new(a.outputs[0], b.inputs[0])
        c = nt.nodes.new("ShaderNodeMath")
        c.operation = "MULTIPLY"
        nt.links.new(b.outputs[0], c.inputs[0])
        nt.links.new(amt.outputs[0], c.inputs[1])
        em = nt.nodes.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = (0.08, 0.55, 1.0, 1)
        nt.links.new(c.outputs[0], em.inputs["Strength"])
        out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
        last = out.inputs[0].links[0].from_socket
        add = nt.nodes.new("ShaderNodeAddShader")
        nt.links.new(last, add.inputs[0])
        nt.links.new(em.outputs[0], add.inputs[1])
        nt.links.new(add.outputs[0], out.inputs[0])
        handles["flash"] = amt.outputs[0]
        handles["flash_w"] = (vor.inputs["W"], noise.inputs["W"])
    return m, handles


# ----------------------------------------------------- Lichtenberg figure
def lichtenberg_image(size=768, seed=3):
    """Fern-like branching figure. R = intensity, G = arrival time (0 at the root, 1 at the tips)."""
    rng = random.Random(seed)
    inten = np.zeros((size, size), np.float32)
    arrive = np.full((size, size), 2.0, np.float32)
    yy, xx = np.mgrid[0:size, 0:size]
    stamps = []

    def grow(x, y, ang, width, length, t0, depth):
        step = 1.5
        n = int(length / step)
        t = t0
        for i in range(n):
            ang += rng.uniform(-0.12, 0.12)
            x += math.cos(ang) * step
            y += math.sin(ang) * step
            t += step
            w = width * (1 - 0.55 * i / max(1, n))
            stamps.append((x, y, max(0.7, w), t))
            if depth < 3 and i > 6 and rng.random() < 0.035 * (1 if depth else 1.6):
                side = rng.choice((-1, 1))
                grow(x, y, ang + side * rng.uniform(0.5, 1.0), w * 0.6, length * rng.uniform(0.22, 0.4), t, depth + 1)
            if not (0 < x < size and 0 < y < size):
                break

    for k in range(4):  # a few main trunks fanning up from a point low on the back
        grow(size * 0.5, size * 0.28, math.radians(90 + (k - 1.5) * 28 + rng.uniform(-6, 6)),
             9.0, size * rng.uniform(0.5, 0.7), 0, 0)
    tmax = max(s[3] for s in stamps)
    for x, y, w, t in stamps:
        r = int(w + 2)
        x0, x1, y0, y1 = max(0, int(x) - r), min(size, int(x) + r + 1), max(0, int(y) - r), min(size, int(y) + r + 1)
        if x0 >= x1 or y0 >= y1:
            continue
        d = np.sqrt((xx[y0:y1, x0:x1] - x) ** 2 + (yy[y0:y1, x0:x1] - y) ** 2)
        v = np.clip(1.0 - (d - w * 0.5) / 1.5, 0, 1)
        inten[y0:y1, x0:x1] = np.maximum(inten[y0:y1, x0:x1], v)
        sel = v > 0.2
        arrive[y0:y1, x0:x1][sel] = np.minimum(arrive[y0:y1, x0:x1][sel], t / tmax)
    # soft blush around the branches
    blur = inten.copy()
    for _ in range(3):
        blur = (blur + np.roll(blur, 2, 0) + np.roll(blur, -2, 0) + np.roll(blur, 2, 1) + np.roll(blur, -2, 1)) / 5
    inten = np.clip(inten * 0.9 + blur * 0.6, 0, 1)
    arrive = np.where(arrive > 1.5, 1.0, arrive)
    img = bpy.data.images.new("lichtenberg", size, size, alpha=True, float_buffer=True)
    img.colorspace_settings.name = "Non-Color"  # set before the pixels: changing it reloads the buffer
    px = np.stack([inten, arrive, np.zeros_like(inten), np.ones_like(inten)], -1)
    img.pixels.foreach_set(px.ravel())
    img.pack()
    return img


def projector(loc, name="lich_proj"):
    """Empty whose local X/Y plane is the world X/Z plane (projects along world Y)."""
    e = bpy.data.objects.new(name, None)
    e.location = loc
    e.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.scene.collection.objects.link(e)
    return e


# ---------------------------------------------------------------- heart
def heart(loc, size=0.06, material=None):
    mb = bpy.data.metaballs.new("heart")
    mb.resolution = mb.render_resolution = size * 0.06
    mb.threshold = 0.6
    for dx in (-0.45, 0.45):
        e = mb.elements.new()
        e.co = (dx * size, 0, 0.25 * size)
        e.radius = size * 0.75
    e = mb.elements.new()
    e.type = "ELLIPSOID"
    e.co = (0, 0, -0.45 * size)
    e.radius = size * 0.8
    e.size_x, e.size_y, e.size_z = 0.75, 0.6, 1.0
    o = bpy.data.objects.new("heart", mb)
    o.location = loc
    o.rotation_euler = (0, math.radians(-20), 0)
    bpy.context.scene.collection.objects.link(o)
    mb.materials.append(material or looks.principled("heart", (0.9, 0.02, 0.06), 0.3, 0.2,
                                                      emit=(1, 0.02, 0.08), emit_strength=2.5))
    return o


def beat_frames(frames, fps, active, bpm=80):
    """Frames of each heartbeat inside the active [start, end] fractions."""
    out = []
    period = fps * 60 / bpm
    for a, b in active:
        f = frames * a + 3
        while f < frames * b:
            out.append(int(f))
            f += period
    return out


def animate_beats(obj, beats, base=1.0, amp=0.16):
    props.key(obj, 1, scale=(base,) * 3)
    for f in beats:
        props.key(obj, max(1, f - 1), scale=(base,) * 3)
        props.key(obj, f + 2, scale=(base * (1 + amp),) * 3)
        props.key(obj, f + 5, scale=(base * (1 - amp * 0.2),) * 3)
        props.key(obj, f + 9, scale=(base,) * 3)


def ecg(beats, frames, origin, width=0.5, height=0.09, color=(0.2, 1.0, 0.45), tilt=None):
    """An ECG trace in the X/Z plane that draws itself across the shot."""
    pts = []
    n = 400
    spikes = [f / frames for f in beats]
    for i in range(n + 1):
        t = i / n
        y = 0.0
        for s in spikes:
            d = (t - s) * frames  # frames from the beat
            y += (0.15 * math.exp(-((d + 5) / 1.6) ** 2) + 1.0 * math.exp(-(d / 0.55) ** 2)
                  - 0.35 * math.exp(-((d - 1.2) / 0.6) ** 2) + 0.25 * math.exp(-((d - 6) / 2.2) ** 2))
        pts.append(V(origin) + V((t * width - width / 2, 0, y * height)))
    mat, _ = emissive("ecg", color, 6)
    o = _curve("ecg", pts, 0.0035, mat)
    cu = o.data
    cu.bevel_factor_end = 0.0
    cu.keyframe_insert("bevel_factor_end", frame=1)
    cu.bevel_factor_end = 1.0
    cu.keyframe_insert("bevel_factor_end", frame=frames)
    _linear_data(cu)
    if tilt:
        o.rotation_euler = tilt
    return o


def _linear_data(idblock):
    ad = idblock.animation_data
    if ad and ad.action:
        for fc in _fcurves(ad.action):
            for k in fc.keyframe_points:
                k.interpolation = "LINEAR"


def apple(loc, radius=0.045):
    """A shiny red apple with a stem and a leaf; returns the root mesh (children follow it)."""
    red = looks.principled("apple", (0.75, 0.02, 0.03), 0.25, 0.1)
    a = props.uv_sphere("apple", loc, radius, red, scale=(1, 1, 0.9))
    stem = props.cylinder("stem", (0, 0, radius * 1.0), radius * 0.07, radius * 0.5,
                          looks.principled("stem", (0.2, 0.1, 0.03), 0.6))
    leaf = props.uv_sphere("leaf", (radius * 0.35, 0, radius * 1.1), radius * 0.4,
                           looks.principled("leaf", (0.1, 0.55, 0.08), 0.4), scale=(1, 0.45, 0.12))
    leaf.rotation_euler = (0, math.radians(-25), 0)
    for o in (stem, leaf):
        o.parent = a
    return a
