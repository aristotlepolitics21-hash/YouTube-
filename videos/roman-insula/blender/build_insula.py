"""Roman insula cutaway: a procedural Blender scene in the "3D history reel" style.

Builds a two-storey Roman apartment block with the front wall cut away: a bakery
(taberna) on the ground floor, a rented room (cenaculum) upstairs, a wooden stair,
and faceless mannequin figures that bake, sit, buy bread and climb the stairs with
an amphora. Everything is generated from code: no downloaded assets.

Three shots, 9:16 vertical, 30 fps, bound to timeline markers:
  shop   frames   1-120  ground-floor bakery
  room   frames 121-240  upstairs room, oil lamp, window light
  stairs frames 241-360  top-down on the stair, figure climbing with an amphora

Run (Blender 4.2+ / 5.x):
  blender -b -P build_insula.py -- --save insula.blend
  blender -b -P build_insula.py -- --stills out/            # one still per shot
  blender -b -P build_insula.py -- --anim out/frames/ --res 540 --samples 16
Or with the bpy wheel:  python build_insula.py -- --stills out/
"""
import argparse
import math
import os
import sys

import bpy  # first: the bpy wheel only exposes bmesh/mathutils after it loads
import bmesh
from mathutils import Matrix, Vector

FPS = 30
SHOTS = [("shop", 1, 120), ("room", 121, 240), ("stairs", 241, 360)]

# Building layout (metres). X runs left-right, Y runs into the building (front at
# y=0, back wall at y=D), Z is up. The front wall is omitted: that is the cutaway.
W0, W1, D = -4.0, 4.0, 5.0
G = 3.2  # ground-floor height
SLAB = 0.3
F1 = G + SLAB  # upper floor level
H1 = 2.8  # upper-floor height
TOP = F1 + H1
WALL = 0.25
SHOP_X1 = 1.6  # partition between the shop and the stairwell
STAIR_X0, STAIR_X1 = 2.55, 3.75
STAIR_Y0, STEPS = 0.45, 16
RISE, TREAD = F1 / STEPS, 0.25


# --------------------------------------------------------------------------- utils
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def link(obj, parent=None):
    bpy.context.scene.collection.objects.link(obj)
    if parent is not None:
        obj.parent = parent
    return obj


def mesh_obj(name, bm, mat=None, loc=(0, 0, 0), parent=None, smooth=False):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    if mat is not None:
        me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    return link(ob, parent)


def box(name, x0, y0, z0, x1, y1, z1, mat, bevel=0.0):
    """Axis-aligned box from two corners, built in real-size local coordinates so
    object-space textures keep a true metre scale."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    sx, sy, sz = x1 - x0, y1 - y0, z1 - z0
    bmesh.ops.scale(bm, vec=(sx, sy, sz), verts=bm.verts)
    ob = mesh_obj(name, bm, mat, loc=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
    if bevel:
        m = ob.modifiers.new("bevel", "BEVEL")
        m.width, m.segments = bevel, 2
    return ob


def ellipsoid(name, r, mat, loc=(0, 0, 0), parent=None, segs=24):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=segs // 2, radius=1.0)
    bmesh.ops.scale(bm, vec=r, verts=bm.verts)
    return mesh_obj(name, bm, mat, loc, parent, smooth=True)


def lathe(name, profile, mat, loc=(0, 0, 0), segs=32, parent=None):
    """Spin an (r, z) profile around Z: amphorae, bowls, lamps."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((a, b)) for a, b in zip(verts, verts[1:])]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1),
                   angle=math.tau, steps=segs, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    ob = mesh_obj(name, bm, mat, loc, parent, smooth=True)
    return ob


def torus(name, R, r, mat, parent=None, arc=math.tau, segs=16, ring=8):
    """Torus, or an arc of one starting at -90 degrees, in the XY plane."""
    bm = bmesh.new()
    n = segs + (0 if arc >= math.tau else 1)
    rows = []
    for i in range(n):
        a = -math.pi / 2 + arc * i / segs if arc < math.tau else arc * i / segs
        c, d = Vector((math.cos(a), math.sin(a), 0)), Vector((0, 0, 1))
        rows.append([bm.verts.new(c * (R + r * math.cos(b)) + d * r * math.sin(b))
                     for b in (math.tau * j / ring for j in range(ring))])
    pairs = list(zip(rows, rows[1:])) + ([(rows[-1], rows[0])] if arc >= math.tau else [])
    for ra, rb in pairs:
        for j in range(ring):
            bm.faces.new((ra[j], ra[(j + 1) % ring], rb[(j + 1) % ring], rb[j]))
    return mesh_obj(name, bm, mat, (0, 0, 0), parent, smooth=True)


def empty(name, loc=(0, 0, 0), parent=None):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_size = 0.1
    ob.location = loc
    return link(ob, parent)


# ----------------------------------------------------------------------- materials
def new_mat(name):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True  # always on (and deprecated) in Blender 5
    except AttributeError:
        pass
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    return m, nt, bsdf


def flat(name, color, rough=0.6, emit=None, strength=0.0):
    m, nt, bsdf = new_mat(name)
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    if emit:
        bsdf.inputs["Emission Color"].default_value = (*emit, 1)
        bsdf.inputs["Emission Strength"].default_value = strength
    return m


def coords(nt, plane="xy", scale=1.0):
    """Object coordinates rotated so a 2-D texture lies on the given plane."""
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    rot = {"xy": (0, 0, 0), "xz": (math.pi / 2, 0, 0), "yz": (math.pi / 2, 0, math.pi / 2)}[plane]
    mp.inputs["Rotation"].default_value = rot
    mp.inputs["Scale"].default_value = (scale,) * 3
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    return mp.outputs["Vector"]


def ramp(nt, fac, stops):
    r = nt.nodes.new("ShaderNodeValToRGB")
    els = r.color_ramp.elements
    els[0].position, els[0].color = stops[0][0], (*stops[0][1], 1)
    els[1].position, els[1].color = stops[-1][0], (*stops[-1][1], 1)
    for pos, col in stops[1:-1]:
        e = els.new(pos)
        e.color = (*col, 1)
    nt.links.new(fac, r.inputs["Fac"])
    return r


def mix(nt, fac, a, b):
    m = nt.nodes.new("ShaderNodeMix")
    m.data_type = "RGBA"
    nt.links.new(fac, m.inputs["Factor"])
    nt.links.new(a, m.inputs[6])
    nt.links.new(b, m.inputs[7])
    return m.outputs[2]


def bump(nt, bsdf, height, strength=0.3, dist=0.02):
    b = nt.nodes.new("ShaderNodeBump")
    b.inputs["Strength"].default_value = strength
    b.inputs["Distance"].default_value = dist
    nt.links.new(height, b.inputs["Height"])
    nt.links.new(b.outputs["Normal"], bsdf.inputs["Normal"])


def brick_nodes(nt, vec, brick=(0.58, 0.27, 0.19), mortar=(0.62, 0.55, 0.47),
                w=0.30, h=0.07, mw=0.008):
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.inputs["Color1"].default_value = (*brick, 1)
    br.inputs["Color2"].default_value = (brick[0] * 0.8, brick[1] * 0.75, brick[2] * 0.7, 1)
    br.inputs["Mortar"].default_value = (*mortar, 1)
    br.inputs["Brick Width"].default_value = w
    br.inputs["Row Height"].default_value = h
    br.inputs["Mortar Size"].default_value = mw
    br.inputs["Scale"].default_value = 1.0
    nt.links.new(vec, br.inputs["Vector"])
    return br


def brick_mat(name, plane):
    m, nt, bsdf = new_mat(name)
    br = brick_nodes(nt, coords(nt, plane))
    nt.links.new(br.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.85
    bump(nt, bsdf, br.outputs["Fac"], 0.4)
    return m


def plaster_mat(name, plane, base=(0.62, 0.47, 0.34), patches=True):
    """Warm plaster with soft mottling, hairline cracks and patches where it has
    fallen away to show the brick behind: the look of the reference reels."""
    m, nt, bsdf = new_mat(name)
    vec = coords(nt, plane)
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 1.8
    noise.inputs["Detail"].default_value = 6
    nt.links.new(vec, noise.inputs["Vector"])
    dark = tuple(c * 0.8 for c in base)
    col = ramp(nt, noise.outputs["Fac"], [(0.35, dark), (0.7, base)]).outputs["Color"]
    # cracks: thin voronoi distance-to-edge lines, kept sparse
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = "DISTANCE_TO_EDGE"
    vor.inputs["Scale"].default_value = 0.7
    nt.links.new(vec, vor.inputs["Vector"])
    crack = ramp(nt, vor.outputs["Distance"], [(0.0, (0.3, 0.22, 0.16)), (0.006, (1, 1, 1))])
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type, mul.blend_type = "RGBA", "MULTIPLY"
    cn = nt.nodes.new("ShaderNodeTexNoise")
    cn.inputs["Scale"].default_value = 0.6
    nt.links.new(vec, cn.inputs["Vector"])
    cmask = ramp(nt, cn.outputs["Fac"], [(0.56, (0, 0, 0)), (0.62, (0.6, 0.6, 0.6))])
    nt.links.new(cmask.outputs["Color"], mul.inputs["Factor"])
    nt.links.new(col, mul.inputs[6])
    nt.links.new(crack.outputs["Color"], mul.inputs[7])
    col = mul.outputs[2]
    if patches:
        pn = nt.nodes.new("ShaderNodeTexNoise")
        pn.inputs["Scale"].default_value = 0.9
        pn.inputs["Detail"].default_value = 8
        pn.inputs["Roughness"].default_value = 0.7
        nt.links.new(vec, pn.inputs["Vector"])
        mask = ramp(nt, pn.outputs["Fac"], [(0.61, (0, 0, 0)), (0.615, (1, 1, 1))])
        br = brick_nodes(nt, vec)
        col = mix(nt, mask.outputs["Color"], col, br.outputs["Color"])
        bump(nt, bsdf, mask.outputs["Color"], 0.25)
    nt.links.new(col, bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.9
    return m


def wood_mat(name, color=(0.33, 0.2, 0.11), plane="xy", planks=False, along="x"):
    m, nt, bsdf = new_mat(name)
    vec = coords(nt, plane)
    if along == "y":  # rotate the grain 90 degrees in its plane
        rot = nt.nodes.new("ShaderNodeVectorRotate")
        rot.rotation_type = "Z_AXIS"
        rot.inputs["Angle"].default_value = math.pi / 2
        nt.links.new(vec, rot.inputs["Vector"])
        vec = rot.outputs["Vector"]
    sc = nt.nodes.new("ShaderNodeMapping")
    sc.inputs["Scale"].default_value = (0.25, 6.0, 6.0)  # stretch grain along X
    nt.links.new(vec, sc.inputs["Vector"])
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.inputs["Scale"].default_value = 1.2
    wave.inputs["Distortion"].default_value = 6
    wave.inputs["Detail"].default_value = 4
    nt.links.new(sc.outputs["Vector"], wave.inputs["Vector"])
    dark = tuple(c * 0.65 for c in color)
    col = ramp(nt, wave.outputs["Fac"], [(0.2, dark), (0.8, color)]).outputs["Color"]
    if planks:
        br = nt.nodes.new("ShaderNodeTexBrick")
        br.inputs["Color1"].default_value = (1, 1, 1, 1)
        br.inputs["Color2"].default_value = (0.82, 0.8, 0.78, 1)
        br.inputs["Mortar"].default_value = (0.12, 0.1, 0.08, 1)
        br.inputs["Brick Width"].default_value = 1.6
        br.inputs["Row Height"].default_value = 0.16
        br.inputs["Mortar Size"].default_value = 0.005
        br.offset = 0.37
        nt.links.new(vec, br.inputs["Vector"])
        mul = nt.nodes.new("ShaderNodeMix")
        mul.data_type, mul.blend_type = "RGBA", "MULTIPLY"
        mul.inputs["Factor"].default_value = 1.0
        nt.links.new(col, mul.inputs[6])
        nt.links.new(br.outputs["Color"], mul.inputs[7])
        col = mul.outputs[2]
        bump(nt, bsdf, br.outputs["Fac"], 0.3, 0.01)
    nt.links.new(col, bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.7
    return m


def paving_mat(name):
    m, nt, bsdf = new_mat(name)
    vec = coords(nt, "xy")
    br = brick_nodes(nt, vec, brick=(0.42, 0.4, 0.38), mortar=(0.85, 0.83, 0.8),
                     w=1.4, h=0.9, mw=0.012)
    br.offset = 0.5
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 3
    nt.links.new(vec, noise.inputs["Vector"])
    shade = ramp(nt, noise.outputs["Fac"], [(0.3, (0.85, 0.85, 0.85)), (0.7, (1, 1, 1))])
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type, mul.blend_type = "RGBA", "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    nt.links.new(br.outputs["Color"], mul.inputs[6])
    nt.links.new(shade.outputs["Color"], mul.inputs[7])
    nt.links.new(mul.outputs[2], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.8
    bump(nt, bsdf, br.outputs["Fac"], 0.4)
    return m


def opus_mixtum_mat(name, plane):
    """Pier facing: bands of brick alternating with irregular tuff stones."""
    m, nt, bsdf = new_mat(name)
    vec = coords(nt, plane)
    br = brick_nodes(nt, vec, brick=(0.66, 0.32, 0.24), mortar=(0.9, 0.86, 0.8), mw=0.01)
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.feature = "DISTANCE_TO_EDGE"
    vor.inputs["Scale"].default_value = 7
    nt.links.new(vec, vor.inputs["Vector"])
    stone = ramp(nt, vor.outputs["Distance"],
                 [(0.0, (0.92, 0.88, 0.8)), (0.03, (0.92, 0.88, 0.8)), (0.06, (0.72, 0.64, 0.5))])
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(vec, sep.inputs["Vector"])
    band = nt.nodes.new("ShaderNodeMath")
    band.operation = "PINGPONG"
    band.inputs[1].default_value = 0.6
    nt.links.new(sep.outputs["Y"], band.inputs[0])
    sel = ramp(nt, band.outputs["Value"], [(0.28, (0, 0, 0)), (0.29, (1, 1, 1))])
    col = mix(nt, sel.outputs["Color"], br.outputs["Color"], stone.outputs["Color"])
    nt.links.new(col, bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.85
    bump(nt, bsdf, br.outputs["Fac"], 0.3)
    return m


def cloth_mat(name, color):
    m, nt, bsdf = new_mat(name)
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.wave_type = "RINGS"
    wave.inputs["Scale"].default_value = 400
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nt.links.new(tc.outputs["Object"], wave.inputs["Vector"])
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = 0.95
    bsdf.inputs["Sheen Weight"].default_value = 0.4
    bump(nt, bsdf, wave.outputs["Fac"], 0.08, 0.005)
    return m


def build_materials():
    M = {}
    M["plaster_xz"] = plaster_mat("plaster back", "xz")
    M["plaster_yz"] = plaster_mat("plaster side", "yz")
    M["plaster_up_xz"] = plaster_mat("plaster upper back", "xz", base=(0.55, 0.42, 0.32))
    M["plaster_up_yz"] = plaster_mat("plaster upper side", "yz", base=(0.55, 0.42, 0.32))
    M["whitewash"] = flat("whitewash", (0.82, 0.78, 0.7), 0.9)
    M["pier_xz"] = opus_mixtum_mat("opus mixtum front", "xz")
    M["pier_yz"] = opus_mixtum_mat("opus mixtum side", "yz")
    M["brick_xz"] = brick_mat("brick front", "xz")
    M["floor"] = wood_mat("floorboards", (0.42, 0.27, 0.16), planks=True)
    M["floor_y"] = wood_mat("floorboards y", (0.42, 0.27, 0.16), planks=True, along="y")
    M["beam"] = wood_mat("beams", (0.3, 0.18, 0.1))
    M["beam_y"] = wood_mat("beams y", (0.3, 0.18, 0.1), along="y")
    M["furniture"] = wood_mat("furniture", (0.45, 0.32, 0.2))
    M["stair"] = wood_mat("stair wood", (0.36, 0.22, 0.12))
    M["paving"] = paving_mat("street paving")
    M["shop_floor"] = brick_mat("shop floor", "xy")
    M["marble"] = flat("marble counter top", (0.85, 0.83, 0.78), 0.35)
    M["terracotta"] = flat("terracotta", (0.55, 0.22, 0.12), 0.55)
    M["clay_pale"] = flat("pale clay", (0.75, 0.65, 0.5), 0.7)
    M["bread"] = flat("bread crust", (0.62, 0.37, 0.16), 0.75)
    M["skin"] = flat("mannequin", (0.82, 0.8, 0.77), 0.55)
    M["mattress"] = cloth_mat("mattress", (0.5, 0.2, 0.16))
    M["straw"] = flat("straw", (0.6, 0.5, 0.3), 0.95)
    M["curtain"] = cloth_mat("curtain", (0.55, 0.45, 0.35))
    M["tunic_brown"] = cloth_mat("tunic brown", (0.28, 0.15, 0.09))
    M["tunic_red"] = cloth_mat("tunic red", (0.55, 0.08, 0.06))
    M["tunic_navy"] = cloth_mat("tunic navy", (0.08, 0.1, 0.16))
    M["tunic_umber"] = cloth_mat("tunic umber", (0.12, 0.07, 0.05))
    M["sandal"] = flat("sandal leather", (0.3, 0.18, 0.1), 0.6)
    M["flame"] = flat("flame", (1, 0.6, 0.2), 0.5, emit=(1, 0.55, 0.15), strength=40)
    return M


# ------------------------------------------------------------------------ building
def build_house(M):
    # street + pavement in front of the cutaway
    box("street", -12, -14, -0.1, 12, 0, 0.0, M["paving"])
    box("shop floor", W0, 0, -0.1, SHOP_X1, D, 0.02, M["shop_floor"])
    box("stair hall floor", SHOP_X1, 0, -0.1, W1, D, 0.02, M["paving"])
    # back and side walls, ground floor
    box("back wall G", W0 - WALL, D, 0, W1 + WALL, D + WALL, G, M["plaster_xz"])
    box("left wall G", W0 - WALL, 0, 0, W0, D, G, M["plaster_yz"])
    box("right wall G", W1, 0, 0, W1 + WALL, D, G, M["plaster_yz"])
    # partition between bakery and stairwell, with a doorway at the back
    box("partition A", SHOP_X1, 0.4, 0, SHOP_X1 + 0.2, 3.6, G, M["plaster_yz"])
    box("partition B", SHOP_X1, 4.5, 0, SHOP_X1 + 0.2, D, G, M["plaster_yz"])
    box("partition lintel", SHOP_X1, 3.6, 2.2, SHOP_X1 + 0.2, 4.5, G, M["plaster_yz"])
    # brick-and-stone piers framing the shop front, and a plastered doorway jamb
    for x0, x1 in ((W0 - WALL, W0 + 0.35), (SHOP_X1 - 0.25, SHOP_X1 + 0.35)):
        box(f"pier {x0:.1f}", x0, -0.15, 0, x1, 0.4, G, M["pier_xz"])
    box("shop lintel", W0 - WALL, -0.15, G - 0.35, SHOP_X1 + 0.35, 0.4, G, M["brick_xz"])
    box("stair pier", W1 - 0.1, -0.15, 0, W1 + WALL, 0.4, G, M["pier_xz"])
    box("shop threshold", W0 + 0.35, -0.05, 0, SHOP_X1 - 0.25, 0.4, 0.08, M["marble"])

    # floor slab between storeys, open above the stairwell
    box("floor slab A", W0 - WALL, -0.15, G, STAIR_X0 - 0.15, D + WALL, F1, M["beam"])
    box("floor slab B", STAIR_X0 - 0.15, 3.0 + 1.6, G, W1 + WALL, D + WALL, F1, M["beam"])
    box("floor slab C", STAIR_X1, -0.15, G, W1 + WALL, D + WALL, F1, M["beam"])
    box("upper boards", W0, 0, F1 - 0.02, STAIR_X0 - 0.15, D, F1 + 0.01, M["floor"])
    # exposed joist ends along the cut face, like the reference cutaways
    for i in range(9):
        x = W0 + 0.25 + i * 0.75
        if x < STAIR_X0 - 0.3:
            box(f"joist {i}", x - 0.09, -0.2, G - 0.22, x + 0.09, D, G, M["beam_y"])

    # upper storey walls
    box("back wall 1", W0 - WALL, D, F1, W1 + WALL, D + WALL, TOP, M["plaster_up_xz"])
    # left wall has a window to let the sun in
    wy0, wy1, wz0, wz1 = 1.6, 2.7, F1 + 1.0, F1 + 2.1
    box("left wall 1a", W0 - WALL, 0, F1, W0, wy0, TOP, M["plaster_up_yz"])
    box("left wall 1b", W0 - WALL, wy1, F1, W0, D, TOP, M["plaster_up_yz"])
    box("left wall 1c", W0 - WALL, wy0, F1, W0, wy1, wz0, M["plaster_up_yz"])
    box("left wall 1d", W0 - WALL, wy0, wz1, W0, wy1, TOP, M["plaster_up_yz"])
    box("window sill", W0 - 0.3, wy0 - 0.05, wz0 - 0.06, W0 + 0.12, wy1 + 0.05, wz0, M["beam"])
    for k in range(2):  # window lattice bars cast the striped shadows
        y = wy0 + (k + 1) * (wy1 - wy0) / 3
        box(f"window bar {k}", W0 - WALL, y - 0.025, wz0, W0, y + 0.025, wz1, M["beam"])
    box("window bar h", W0 - WALL, wy0, (wz0 + wz1) / 2 - 0.025, W0, wy1, (wz0 + wz1) / 2 + 0.025, M["beam"])
    sy0, sy1, sz0, sz1 = 1.4, 3.2, F1 + 0.7, F1 + 2.2
    box("right wall 1a", W1, 0, F1, W1 + WALL, sy0, TOP, M["plaster_up_yz"])
    box("right wall 1b", W1, sy1, F1, W1 + WALL, D, TOP, M["plaster_up_yz"])
    box("right wall 1c", W1, sy0, F1, W1 + WALL, sy1, sz0, M["plaster_up_yz"])
    box("right wall 1d", W1, sy0, sz1, W1 + WALL, sy1, TOP, M["plaster_up_yz"])
    for k in range(3):  # stair window frame: the bars throw the striped light
        y = sy0 + (k + 1) * (sy1 - sy0) / 4
        box(f"stair window bar {k}", W1, y - 0.04, sz0, W1 + WALL, y + 0.04, sz1, M["beam"])
    box("stair window rail", W1, sy0, (sz0 + sz1) / 2 - 0.04, W1 + WALL, sy1, (sz0 + sz1) / 2 + 0.04, M["beam"])
    beam = bpy.data.lights.new("stair sunbeam", "SPOT")
    beam.energy, beam.color, beam.shadow_soft_size = 9000, (1.0, 0.85, 0.65), 0.05
    beam.spot_size, beam.spot_blend = math.radians(35), 0.3
    sb = link(bpy.data.objects.new("stair sunbeam", beam))
    sb.location = (W1 + 5.5, (sy0 + sy1) / 2 - 1.0, F1 + 5.0)
    sb.rotation_euler = Vector((STAIR_X0 - sb.location.x + 0.6, 2.4 - sb.location.y, 1.4 - sb.location.z)).to_track_quat("-Z", "Y").to_euler()
    # low whitewashed parapet between the room and the stairwell
    box("parapet", STAIR_X0 - 0.3, 0.0, F1, STAIR_X0 - 0.15, 4.6, F1 + 0.95, M["whitewash"])

    # roof: ceiling joists plus a boarded pitch, open at the front for the camera
    for i in range(11):
        x = W0 + 0.1 + i * 0.79
        box(f"ceiling joist {i}", x - 0.08, 0.6, TOP, x + 0.08, D + WALL, TOP + 0.2, M["beam_y"])
    box("tie beam", W0 - WALL, 0.6, TOP + 0.2, W1 + WALL, 0.85, TOP + 0.45, M["beam"])
    roof = box("roof boards", W0 - WALL, 1.6, TOP + 0.9, W1 + WALL, D + 0.6, TOP + 0.96, M["floor"])
    roof.rotation_euler.x = math.radians(-12)


def build_stairs(M):
    for i in range(STEPS):
        y = STAIR_Y0 + i * TREAD
        z = (i + 1) * RISE
        box(f"tread {i:02d}", STAIR_X0, y, z - 0.05, STAIR_X1, y + TREAD + 0.03, z, M["stair"])
        box(f"riser {i:02d}", STAIR_X0, y, z - RISE, STAIR_X1, y + 0.03, z - 0.05, M["stair"])
    run = STEPS * TREAD
    ang = math.atan2(F1, run)
    for x in (STAIR_X0 - 0.06, STAIR_X1):  # stringers
        ln = math.hypot(run, F1) + 0.3
        s = box(f"stringer {x:.2f}", x, -ln / 2, -0.15, x + 0.06, ln / 2, 0.15, M["stair"])
        s.location = (x + 0.03, STAIR_Y0 + run / 2, F1 / 2)
        s.rotation_euler.x = ang
    # handrail on the open side, with balusters
    hx = STAIR_X0 - 0.12
    ln = math.hypot(run, F1) + 0.4
    rail = box("handrail", hx - 0.04, -ln / 2, -0.04, hx + 0.04, ln / 2, 0.04, M["beam"])
    rail.location = (hx, STAIR_Y0 + run / 2, F1 / 2 + 0.95)
    rail.rotation_euler.x = ang
    for i in range(0, STEPS, 3):
        y = STAIR_Y0 + i * TREAD + 0.12
        z0 = (i + 1) * RISE
        box(f"baluster {i}", hx - 0.03, y - 0.03, z0, hx + 0.03, y + 0.03, z0 + 0.95, M["beam"])
    # post-and-beam frame at the top landing, as in the stair shot of the reference
    for x in (STAIR_X0 - 0.15, STAIR_X1 + 0.1):
        box(f"landing post {x:.1f}", x - 0.07, 4.45, F1, x + 0.07, 4.59, TOP, M["beam"])
    box("landing head", STAIR_X0 - 0.22, 4.45, TOP - 0.25, STAIR_X1 + 0.17, 4.59, TOP - 0.1, M["beam"])
    box("landing", STAIR_X0 - 0.15, STAIR_Y0 + run, F1 - 0.05, W1, D, F1, M["floor_y"])


# --------------------------------------------------------------------------- props
AMPHORA = [(0.0, 0.0), (0.03, 0.02), (0.06, 0.1), (0.15, 0.3), (0.19, 0.45), (0.18, 0.55),
           (0.12, 0.65), (0.07, 0.7), (0.06, 0.8), (0.075, 0.83), (0.065, 0.85)]
JUG = [(0.0, 0.0), (0.09, 0.0), (0.15, 0.1), (0.17, 0.22), (0.13, 0.36), (0.07, 0.43),
       (0.065, 0.5), (0.08, 0.52)]
BOWL = [(0.0, 0.0), (0.05, 0.0), (0.09, 0.03), (0.11, 0.06), (0.1, 0.06), (0.08, 0.03), (0.0, 0.02)]
LAMP = [(0.0, 0.0), (0.04, 0.0), (0.06, 0.015), (0.055, 0.03), (0.02, 0.035), (0.0, 0.03)]


def amphora(name, loc, M, scale=1.0, profile=AMPHORA, rot=0.0, parent=None):
    ob = lathe(name, [(r * scale, z * scale) for r, z in profile], M["terracotta"], loc, parent=parent)
    ob.rotation_euler.z = rot
    top = profile[-1][1] * scale
    for side in (-1, 1):  # handles: half rings from shoulder to neck
        h = torus(f"{name} handle", 0.07 * scale, 0.012 * scale, M["terracotta"], ob, arc=math.pi)
        h.location = (side * 0.075 * scale, 0, top * 0.72)
        h.rotation_euler = (math.pi / 2, 0, 0 if side > 0 else math.pi)
    return ob


def loaf(name, loc, M, r=0.09):
    ob = ellipsoid(name, (r, r, r * 0.45), M["bread"], loc, segs=16)
    for k in range(3):  # scored top
        g = box(f"{name} score {k}", -r * 0.8, -0.004, 0, r * 0.8, 0.004, 0.012, M["sandal"])
        g.parent = ob
        g.location = (0, (k - 1) * r * 0.45, r * 0.4)
        g.rotation_euler.z = math.pi / 2
    return ob


def build_bakery(M):
    # counter: brick body, marble top, across the shop
    box("counter body", -3.1, 1.9, 0, 0.2, 2.35, 0.95, M["brick_xz"])
    box("counter top", -3.2, 1.85, 0.95, 0.3, 2.42, 1.0, M["marble"])
    for i, x in enumerate((-2.6, -2.2, -1.75, -1.3, -0.6)):
        loaf(f"counter loaf {i}", (x, 2.12, 1.04), M, 0.1)
    # shelves of bread on the back wall
    for row, z in enumerate((1.25, 1.65, 2.05)):
        box(f"shelf {row}", -3.6, D - 0.35, z - 0.03, 0.6, D, z, M["beam"])
        for j in range(10):
            loaf(f"shelf loaf {row}-{j}", (-3.35 + j * 0.42 + (row % 2) * 0.12, D - 0.17, z + 0.04), M, 0.08)
    # storage: amphorae leaning against the wall, a basket of loaves
    for i, (x, y) in enumerate(((0.75, 3.9), (1.15, 3.75), (1.0, 4.3))):
        a = amphora(f"shop amphora {i}", (x, y, 0.02), M, 1.25)
        a.rotation_euler.x = math.radians(-6)
    lathe("grain jar", [(r * 1.4, z * 1.4) for r, z in JUG], M["clay_pale"], (-3.4, 3.4, 0.02))
    box("bread crate", 0.4, 2.7, 0.02, 1.0, 3.2, 0.28, M["furniture"])
    for i in range(3):
        loaf(f"crate loaf {i}", (0.55 + i * 0.17, 2.95, 0.33), M, 0.08)


def build_room(M):
    z = F1
    # bed platform: wooden frame with a straw mattress
    box("bed frame", -1.9, 2.9, z, -0.2, 4.7, z + 0.32, M["furniture"])
    box("bed straw", -1.85, 2.95, z + 0.32, -0.25, 4.65, z + 0.38, M["straw"])
    box("bed mattress", -1.8, 3.0, z + 0.38, -0.3, 4.6, z + 0.5, M["mattress"], bevel=0.04)
    # table with an oil lamp, stool, jug, shelf with a bowl
    box("table top", -3.9, 1.9, z + 0.78, -2.7, 3.0, z + 0.84, M["furniture"])
    for x in (-3.8, -2.85):
        for y in (2.0, 2.85):
            box(f"table leg {x}{y}", x - 0.04, y - 0.04, z, x + 0.04, y + 0.04, z + 0.78, M["furniture"])
    lamp = lathe("oil lamp", LAMP, M["clay_pale"], (-3.25, 2.3, z + 0.84))
    flame = ellipsoid("lamp flame", (0.012, 0.012, 0.035), M["flame"], (0.05, 0, 0.065), lamp, 12)
    light = bpy.data.lights.new("lamp light", "POINT")
    light.energy, light.color, light.shadow_soft_size = 25, (1.0, 0.6, 0.3), 0.03
    link(bpy.data.objects.new("lamp light", light), lamp).location = (0.05, 0, 0.12)
    box("stool top", -2.4, 1.2, z + 0.45, -1.95, 1.6, z + 0.5, M["furniture"])
    for x in (-2.35, -2.0):
        for y in (1.25, 1.55):
            box(f"stool leg {x}{y}", x - 0.03, y - 0.03, z, x + 0.03, y + 0.03, z + 0.45, M["furniture"])
    amphora("room jug", (-2.3, 4.35, z), M, 1.1, JUG)
    box("wall shelf", -1.1, D - 0.25, z + 1.75, 0.1, D, z + 1.8, M["beam"])
    lathe("bowl", BOWL, M["terracotta"], (-0.5, D - 0.12, z + 1.8))
    # curtain on the back wall: a grid with sine folds
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=60, y_segments=12, size=0.5)
    for v in bm.verts:
        x, y = v.co.x, v.co.y
        v.co = Vector((x * 0.7, 0.04 * math.sin(x * 70) * (0.6 + 0.4 * (0.5 - y)), y * 1.5))
    cur = mesh_obj("curtain", bm, M["curtain"], (-2.9, D - 0.08, z + 1.45), smooth=True)
    box("curtain rod", -3.35, D - 0.12, z + 2.18, -2.45, D - 0.06, z + 2.22, M["beam"])
    return cur


# ------------------------------------------------------------------------ figures
class Figure:
    """Artist's-mannequin figure: ellipsoid segments on a hierarchy of pivot
    empties, so poses and animation are plain rotations. Faces -Y by default."""

    def __init__(self, name, loc, M, tunic, rot_z=0.0, sleeve_stripe=None):
        s, self.name = M["skin"], name
        self.root = empty(f"{name} root", loc)
        self.root.rotation_euler.z = rot_z
        self.pelvis = empty(f"{name} pelvis", (0, 0, 0.95), self.root)
        ellipsoid(f"{name} hips", (0.16, 0.11, 0.1), s, (0, 0, 0.02), self.pelvis)
        self.spine = empty(f"{name} spine", (0, 0, 0.05), self.pelvis)
        ellipsoid(f"{name} chest", (0.18, 0.115, 0.26), s, (0, 0, 0.27), self.spine)
        self.neck = empty(f"{name} neck", (0, 0, 0.53), self.spine)
        ellipsoid(f"{name} neckm", (0.05, 0.05, 0.07), s, (0, 0, 0.03), self.neck)
        ellipsoid(f"{name} head", (0.092, 0.108, 0.125), s, (0, -0.005, 0.17), self.neck)
        ellipsoid(f"{name} nose", (0.016, 0.03, 0.025), s, (0, -0.1, 0.16), self.neck)
        for sx in (-1, 1):  # brow ridge and ears give the head direction
            ellipsoid(f"{name} ear{sx}", (0.012, 0.025, 0.035), s, (sx * 0.09, 0, 0.17), self.neck)
        ellipsoid(f"{name} brow", (0.07, 0.03, 0.02), s, (0, -0.085, 0.2), self.neck)
        self.j = {}
        for side, sx in (("L", -1), ("R", 1)):
            sh = self.seg(f"shoulder{side}", self.spine, (sx * 0.2, 0, 0.42), 0.29, 0.05, s)
            el = self.seg(f"elbow{side}", sh, (0, 0, -0.29), 0.26, 0.042, s)
            self.seg(f"wrist{side}", el, (0, 0, -0.26), 0.08, 0.035, s, hand=True)
            sleeve = lathe(f"{name} sleeve{side}", [(0.0, 0.0), (0.075, 0.0), (0.072, -0.16), (0.0, -0.16)],
                           M[tunic], (0, 0, 0.02), 16, sh)
            if sleeve_stripe:
                lathe(f"{name} stripe{side}", [(0.0, -0.12), (0.077, -0.12), (0.077, -0.15), (0.0, -0.15)],
                      M[sleeve_stripe], (0, 0, 0.02), 16, sh)
            hp = self.seg(f"hip{side}", self.pelvis, (sx * 0.09, 0, -0.03), 0.44, 0.075, s)
            kn = self.seg(f"knee{side}", hp, (0, 0, -0.44), 0.42, 0.055, s)
            an = empty(f"{name} ankle{side}", (0, 0, -0.42), kn)
            self.j[f"ankle{side}"] = an
            box(f"{name} foot{side}", -0.045, -0.17, -0.06, 0.045, 0.04, 0.0, M["sandal"]).parent = an
        # tunic: a flared, folded cone hung from the chest, belted at the waist
        prof = [(0.0, 0.5), (0.19, 0.48), (0.2, 0.3), (0.175, 0.08), (0.2, -0.1), (0.26, -0.42), (0.0, -0.42)]
        t = lathe(f"{name} tunic", prof, M[tunic], (0, 0, 0), 48, self.spine)
        for v in t.data.vertices:  # vertical folds below the belt
            if v.co.z < 0.05:
                a = math.atan2(v.co.y, v.co.x)
                f = 1 + 0.06 * math.sin(a * 9) * min(1, (0.05 - v.co.z) * 3)
                v.co.x *= f
                v.co.y *= f * 0.82
            else:
                v.co.y *= 0.72
        lathe(f"{name} belt", [(0.0, 0.07), (0.185, 0.07), (0.185, 0.1), (0.0, 0.1)], M["sandal"], (0, 0, 0), 32,
              self.spine).scale.y = 0.72

    def seg(self, key, parent, offset, length, radius, mat, hand=False):
        p = empty(f"{self.name} {key}", offset, parent)
        self.j[key] = p
        ellipsoid(f"{self.name} {key} ball", (radius,) * 3, mat, (0, 0, 0), p, 16)
        if hand:
            ellipsoid(f"{self.name} {key} hand", (0.03, 0.045, 0.075), mat, (0, 0, -0.08), p, 16)
        else:
            ellipsoid(f"{self.name} {key} limb", (radius * 1.05, radius * 1.05, length / 2 + radius * 0.2),
                      mat, (0, 0, -length / 2), p, 16)
        return p

    def pose(self, frame=None, **rot):
        """rot: joint=(x, y, z) in degrees. Negative X swings a limb forward."""
        for k, v in rot.items():
            ob = {"spine": self.spine, "neck": self.neck, "pelvis": self.pelvis}.get(k) or self.j[k]
            if k in ("spine", "neck"):  # these point up, not down: flip so negative X still leans forward
                v = (-v[0], v[1], v[2])
            ob.rotation_euler = [math.radians(a) for a in v]
            if frame is not None:
                ob.keyframe_insert("rotation_euler", frame=frame)


def build_figures(M):
    # the baker behind the counter, kneading
    baker = Figure("baker", (-1.9, 2.75, 0.02), M, "tunic_red")
    for f in range(1, 361, 20):
        k = 1 if (f // 20) % 2 else 0
        baker.pose(f, spine=(-14 - 6 * k, 0, 0), neck=(-18, 0, 0),
                   shoulderL=(-48 - 10 * k, 0, 10), elbowL=(-38 + 8 * k, 0, 0),
                   shoulderR=(-52 + 8 * k, 0, -10), elbowR=(-34 - 6 * k, 0, 0),
                   wristL=(-10, 0, 0), wristR=(-10, 0, 0))
    # customer seen from behind, reaching for a loaf
    cust = Figure("customer", (-1.6, 1.15, 0.02), M, "tunic_navy", rot_z=math.pi)
    cust.pose(1, spine=(-6, 0, 0), shoulderR=(-62, 0, 6), elbowR=(-20, 0, 0),
              shoulderL=(-8, 0, -6), elbowL=(-10, 0, 0), hipL=(4, 0, 0), hipR=(-4, 0, 0))
    cust.pose(60, shoulderR=(-70, 0, 4), elbowR=(-10, 0, 0))
    cust.pose(120, shoulderR=(-50, 0, 6), elbowR=(-45, 0, 0))
    # the tenant sitting on the bed upstairs, hands clasped between the knees
    tenant = Figure("tenant", (-1.05, 3.45, F1 + 0.08), M, "tunic_brown")
    tenant.pose(None, pelvis=(0, 0, 0), spine=(-14, 0, 0), neck=(-12, 0, 0),
                hipL=(-88, 0, -6), kneeL=(95, 0, 0), ankleL=(-5, 0, 0),
                hipR=(-88, 0, 6), kneeR=(95, 0, 0), ankleR=(-5, 0, 0),
                shoulderL=(-34, 0, 8), elbowL=(-52, 0, 30), shoulderR=(-34, 0, -8), elbowR=(-52, 0, -30))
    tenant.root.location.z = F1 + 0.5 - 0.95 + 0.02  # seat the hips on the mattress
    for f, nod in ((121, -12), (170, -20), (215, -10), (240, -14)):
        tenant.pose(f, neck=(nod, 0, 0))
    # a neighbour upstairs, seen in the stair shot, sitting on the floor by the parapet
    neighbour = Figure("neighbour", (1.55, 1.9, F1 + 0.1), M, "tunic_navy", rot_z=math.radians(80),
                       sleeve_stripe="tunic_red")
    neighbour.root.location.z = F1 - 0.95 + 0.12
    neighbour.pose(None, spine=(-30, 0, 0), neck=(-25, 0, 0),
                   hipL=(-100, 0, -10), kneeL=(140, 0, 0), hipR=(-95, 0, 15), kneeR=(120, 0, 0),
                   shoulderL=(-40, 0, 10), elbowL=(-50, 0, 0), shoulderR=(-55, 0, -10), elbowR=(-30, 0, 0))
    box("neighbour cushion", 1.25, 1.55, F1, 1.9, 2.25, F1 + 0.08, M["mattress"], bevel=0.02)
    # the climber: carries an amphora on the shoulder up the stair
    climb = Figure("climber", ((STAIR_X0 + STAIR_X1) / 2, -0.4, 0.02), M, "tunic_umber", rot_z=math.pi)
    amph = amphora("carried amphora", (0, 0, 0), M, 1.0, parent=climb.j["shoulderL"])
    amph.location = (0.02, 0.0, 0.15)
    amph.rotation_euler = (math.radians(100), math.radians(15), 0)
    f0, f1 = 200, 372  # walk the stair across the stairs shot
    steps_total = STEPS + 3
    for k in range(steps_total + 1):
        f = f0 + (f1 - f0) * k / steps_total
        i = k - 2  # two flat paces before the first tread
        y = -0.4 + k * TREAD if i < 0 else STAIR_Y0 + i * TREAD + 0.1
        z = 0.02 + max(0, i + 1) * RISE
        climb.root.location = ((STAIR_X0 + STAIR_X1) / 2, y, z)
        climb.root.keyframe_insert("location", frame=round(f))
        a = 1 if k % 2 else -1
        climb.pose(round(f), spine=(-10, 0, 0), neck=(-5, 0, 0),
                   hipL=(-30 * a - 5, 0, 0), kneeL=(30 if a > 0 else 10, 0, 0),
                   hipR=(30 * a - 5, 0, 0), kneeR=(10 if a > 0 else 30, 0, 0),
                   shoulderL=(-150, 0, 35), elbowL=(-95, 0, 0),  # arm up, steadying the jar
                   shoulderR=(-20 * a, 0, -8), elbowR=(-20, 0, 0))
    return baker, tenant, climb


# ------------------------------------------------------------------ light, camera
def build_world():
    sc = bpy.context.scene
    world = bpy.data.worlds.new("world")
    sc.world = world
    try:
        world.use_nodes = True
    except AttributeError:
        pass
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.55, 0.42, 0.3, 1)
    bg.inputs["Strength"].default_value = 0.35
    sun = bpy.data.lights.new("sun", "SUN")
    sun.energy, sun.angle, sun.color = 4.2, math.radians(1.2), (1.0, 0.86, 0.68)
    s = link(bpy.data.objects.new("sun", sun))
    # low afternoon sun from the left, through the upstairs window and the shop front
    s.rotation_euler = (math.radians(58), 0, math.radians(-115))
    fill = bpy.data.lights.new("bounce fill", "AREA")
    fill.energy, fill.size, fill.color = 180, 6, (1.0, 0.8, 0.6)
    f = link(bpy.data.objects.new("bounce fill", fill))
    f.location, f.rotation_euler = (-1, -5, 4), (math.radians(80), 0, 0)


def camera(name, path, target_path, lens, fstop=4.0):
    """target_path: [(frame, loc), ...] keyframes, or an object to track."""
    cam = bpy.data.cameras.new(name)
    cam.lens = lens
    cam.dof.use_dof = True
    cam.dof.aperture_fstop = fstop
    ob = link(bpy.data.objects.new(name, cam))
    tgt = target_path if isinstance(target_path, bpy.types.Object) else empty(f"{name} target")
    tr = ob.constraints.new("TRACK_TO")
    tr.target, tr.track_axis, tr.up_axis = tgt, "TRACK_NEGATIVE_Z", "UP_Y"
    cam.dof.focus_object = tgt
    for f, loc in path:
        ob.location = loc
        ob.keyframe_insert("location", frame=f)
    if tgt is not target_path:
        for f, loc in target_path:
            tgt.location = loc
            tgt.keyframe_insert("location", frame=f)
    return ob


def build_cameras(climber):
    sc = bpy.context.scene
    shop = camera("cam shop", [(1, (-3.3, -4.6, 1.55)), (120, (-2.2, -3.7, 1.7))],
                  [(1, (-1.7, 2.3, 1.25)), (120, (-1.6, 2.5, 1.3))], 28, fstop=5.6)
    room = camera("cam room", [(121, (-0.2, -3.6, F1 + 1.5)), (240, (-0.9, -2.7, F1 + 1.45))],
                  [(121, (-1.4, 3.3, F1 + 0.8)), (240, (-1.3, 3.4, F1 + 0.85))], 26, fstop=4.0)
    follow = empty("climber head", (0, 0, 1.2), climber.root)
    stairs = camera("cam stairs", [(241, (3.0, 4.25, TOP - 0.2)), (360, (2.95, 4.2, TOP - 0.1))], follow, 17, fstop=8)
    for name, cam, f in (("shop", shop, 1), ("room", room, 121), ("stairs", stairs, 241)):
        m = sc.timeline_markers.new(name, frame=f)
        m.camera = cam
    sc.camera = shop


def setup_render(res=1080, samples=48):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 6
    sc.cycles.caustics_reflective = sc.cycles.caustics_refractive = False
    sc.render.resolution_x, sc.render.resolution_y = res, round(res * 16 / 9)
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = 1, 360
    sc.render.image_settings.file_format = "PNG"
    sc.view_settings.view_transform = "AgX"
    try:
        sc.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    sc.view_settings.exposure = 0.3


def build(res=1080, samples=48):
    reset()
    M = build_materials()
    build_house(M)
    build_stairs(M)
    build_bakery(M)
    build_room(M)
    _, _, climber = build_figures(M)
    build_world()
    build_cameras(climber)
    setup_render(res, samples)


def camera_for(frame):
    for name, a, b in SHOTS:
        if a <= frame <= b:
            return bpy.data.objects[f"cam {name}"]


def main(argv):
    p = argparse.ArgumentParser()
    p.add_argument("--save", help="write a .blend file")
    p.add_argument("--stills", help="render one still per shot into this folder")
    p.add_argument("--frames", default="60,180,300", help="frames for --stills")
    p.add_argument("--anim", help="render the animation as PNG frames into this folder")
    p.add_argument("--step", type=int, default=1, help="render every Nth frame with --anim")
    p.add_argument("--res", type=int, default=1080, help="output width; height is 16:9 portrait")
    p.add_argument("--samples", type=int, default=48)
    a = p.parse_args(argv)
    build(a.res, a.samples)
    sc = bpy.context.scene
    if a.save:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.save))
    if a.stills:
        os.makedirs(a.stills, exist_ok=True)
        for f in map(int, a.frames.split(",")):
            sc.frame_set(f)
            sc.camera = camera_for(f)
            sc.render.filepath = os.path.join(os.path.abspath(a.stills), f"still_{f:04d}.png")
            bpy.ops.render.render(write_still=True)
    if a.anim:
        os.makedirs(a.anim, exist_ok=True)
        for f in range(sc.frame_start, sc.frame_end + 1, a.step):
            sc.frame_set(f)
            sc.camera = camera_for(f)
            sc.render.filepath = os.path.join(os.path.abspath(a.anim), f"frame_{f:04d}.png")
            bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
