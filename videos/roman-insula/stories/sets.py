"""Set themes. Every story is shot in the same two-storey cutaway house (build_insula.build_house and
build_stairs), re-dressed for its place and time: a theme overrides the house's materials before it is
built, then furnishes the ground floor and the upper room. Themes keep the names acting.py relies on:
a lamp made of "oil lamp" / "lamp flame" (material "flame") / "lamp light".

  edo    Kyoto, around 1820: a potter's townhouse (machiya). Clay walls, dark timber, tatami, shoji,
         a noren curtain and paper lantern at the door; a kick wheel and shelves of bowls downstairs,
         a tokonoma alcove with a hanging scroll, a low table and an andon lantern upstairs.
  egypt  Deir el-Medina, around 1200 BC, the village of the royal tomb builders: whitewashed mud
         brick, palm-log beams, beaten earth; a painter's workshop with a practice wall, pigment
         bowls and water jars; a sleeping mat, chest and stool upstairs; hard desert sun.
"""
import math
import os

import bpy
import build_insula as B
from build_insula import F1, G, W0, D, box, ellipsoid, lathe

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
BOWL = [(0.0, 0.0), (0.045, 0.0), (0.05, 0.012), (0.085, 0.05), (0.1, 0.085), (0.093, 0.087), (0.078, 0.052),
        (0.04, 0.02), (0.0, 0.018)]


# ---------------------------------------------------------------------------- materials
def image_mat(name, file, rough=0.85):
    m, nt, bsdf = B.new_mat(name)
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(os.path.join(ASSETS, file), check_existing=True)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nt.links.new(tc.outputs["UV"], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = rough
    return m


def picture(name, file, x0, x1, z0, z1, y, M):
    """A flat painted panel in the XZ plane at depth y, facing -Y, its image mapped edge to edge."""
    import bmesh
    bm = bmesh.new()
    vs = [bm.verts.new(p) for p in ((x0, 0, z0), (x1, 0, z0), (x1, 0, z1), (x0, 0, z1))]
    f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new()
    for loop, c in zip(f.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        loop[uv].uv = c
    return B.mesh_obj(name, bm, image_mat(f"{name} paint", file), (0, y, 0))


def noise_mat(name, dark, light, scale=6.0, rough=0.9, bump=0.3):
    m, nt, bsdf = B.new_mat(name)
    vec = B.coords(nt, "xy")
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = scale
    n.inputs["Detail"].default_value = 8
    nt.links.new(vec, n.inputs["Vector"])
    nt.links.new(B.ramp(nt, n.outputs["Fac"], [(0.35, dark), (0.7, light)]).outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = rough
    B.bump(nt, bsdf, n.outputs["Fac"], bump, 0.01)
    return m


def tatami_mat(name):
    """Woven rush mats, about 1.8 x 0.9 m, with dark cloth borders."""
    m, nt, bsdf = B.new_mat(name)
    vec = B.coords(nt, "xy")
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.inputs["Color1"].default_value = (0.55, 0.5, 0.28, 1)
    br.inputs["Color2"].default_value = (0.5, 0.47, 0.26, 1)
    br.inputs["Mortar"].default_value = (0.08, 0.07, 0.05, 1)
    br.inputs["Brick Width"].default_value = 1.8
    br.inputs["Row Height"].default_value = 0.9
    br.inputs["Mortar Size"].default_value = 0.035
    br.offset = 0.5
    nt.links.new(vec, br.inputs["Vector"])
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.inputs["Scale"].default_value = 60
    nt.links.new(vec, wave.inputs["Vector"])
    weave = B.ramp(nt, wave.outputs["Fac"], [(0.2, (0.85, 0.85, 0.85)), (0.8, (1, 1, 1))])
    mul = nt.nodes.new("ShaderNodeMix")
    mul.data_type, mul.blend_type = "RGBA", "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    nt.links.new(br.outputs["Color"], mul.inputs[6])
    nt.links.new(weave.outputs["Color"], mul.inputs[7])
    nt.links.new(mul.outputs[2], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.8
    B.bump(nt, bsdf, wave.outputs["Fac"], 0.15, 0.003)
    return m


def paper_mat(name, color=(0.92, 0.88, 0.78)):
    """Thin paper: lets light through, so a lamp behind it glows."""
    m, nt, bsdf = B.new_mat(name)
    out = nt.nodes["Material Output"]
    diff = nt.nodes.new("ShaderNodeBsdfDiffuse")
    trans = nt.nodes.new("ShaderNodeBsdfTranslucent")
    diff.inputs["Color"].default_value = trans.inputs["Color"].default_value = (*color, 1)
    mix = nt.nodes.new("ShaderNodeMixShader")
    mix.inputs["Fac"].default_value = 0.55
    nt.links.new(diff.outputs[0], mix.inputs[1])
    nt.links.new(trans.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    return m


def glaze_mat(name, color, rough=0.25, gold_seams=False):
    """Glazed stoneware; with gold_seams, the kintsugi repair lines run through it in gold."""
    m, nt, bsdf = B.new_mat(name)
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = rough
    if gold_seams:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        vor = nt.nodes.new("ShaderNodeTexVoronoi")
        vor.feature = "DISTANCE_TO_EDGE"
        vor.inputs["Scale"].default_value = 7
        nt.links.new(tc.outputs["Object"], vor.inputs["Vector"])
        seam = B.ramp(nt, vor.outputs["Distance"], [(0.0, (1, 1, 1)), (0.035, (0, 0, 0))]).outputs["Color"]
        gold = (1.0, 0.72, 0.25)
        nt.links.new(B.mix(nt, seam, _rgb(nt, color), _rgb(nt, gold)), bsdf.inputs["Base Color"])
        nt.links.new(seam, bsdf.inputs["Metallic"])
    return m


def _rgb(nt, c):
    n = nt.nodes.new("ShaderNodeRGB")
    n.outputs[0].default_value = (*c, 1)
    return n.outputs[0]


def mud_plaster_mat(name, plane, base=(0.8, 0.72, 0.56)):
    """Whitewashed mud plaster, worn through in places to the mud bricks behind."""
    m, nt, bsdf = B.new_mat(name)
    vec = B.coords(nt, plane)
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value = 2.2
    n.inputs["Detail"].default_value = 7
    nt.links.new(vec, n.inputs["Vector"])
    col = B.ramp(nt, n.outputs["Fac"], [(0.35, tuple(c * 0.86 for c in base)), (0.7, base)]).outputs["Color"]
    pn = nt.nodes.new("ShaderNodeTexNoise")
    pn.inputs["Scale"].default_value = 0.8
    pn.inputs["Detail"].default_value = 8
    pn.inputs["Roughness"].default_value = 0.7
    nt.links.new(vec, pn.inputs["Vector"])
    mask = B.ramp(nt, pn.outputs["Fac"], [(0.63, (0, 0, 0)), (0.635, (1, 1, 1))])
    br = B.brick_nodes(nt, vec, brick=(0.45, 0.34, 0.22), mortar=(0.55, 0.45, 0.32), w=0.36, h=0.12, mw=0.012)
    nt.links.new(B.mix(nt, mask.outputs["Color"], col, br.outputs["Color"]), bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.95
    B.bump(nt, bsdf, mask.outputs["Color"], 0.3)
    return m


def mudbrick_mat(name, plane):
    m, nt, bsdf = B.new_mat(name)
    br = B.brick_nodes(nt, B.coords(nt, plane), brick=(0.5, 0.39, 0.26), mortar=(0.6, 0.5, 0.36), w=0.36, h=0.12,
                       mw=0.014)
    nt.links.new(br.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.95
    B.bump(nt, bsdf, br.outputs["Fac"], 0.4)
    return m


# ------------------------------------------------------------------------------ lamps
def lamp(M, loc, kind="bowl", energy=60):
    """The scene's main lamp, under the names acting.lamp_out() and the lighting moods expect."""
    base = lathe("oil lamp", [(0, 0), (0.05, 0), (0.07, 0.02), (0.06, 0.035), (0, 0.035)], M["clay_pale"], loc)
    flame = ellipsoid("lamp flame", (0.012, 0.012, 0.035), M["flame"], (0.05, 0, 0.065), base, 12)
    light = bpy.data.lights.new("lamp light", "POINT")
    light.energy, light.color, light.shadow_soft_size = energy, (1.0, 0.6, 0.3), 0.03
    B.link(bpy.data.objects.new("lamp light", light), base).location = (0.05, 0, 0.12)
    if kind == "andon":  # a paper box on legs around the flame
        paper = paper_mat("andon paper")
        for k in range(4):
            a = k * math.pi / 2
            p = box(f"andon side {k}", -0.14, -0.004, 0.0, 0.14, 0.004, 0.42, paper)
            p.parent = base
            p.location = (0.05 + 0.14 * math.sin(a), -0.14 * math.cos(a), -0.08)
            p.rotation_euler.z = a
        for x in (-0.09, 0.19):
            for y in (-0.14, 0.14):
                box(f"andon leg {x}{y}", x - 0.012, y - 0.012, -0.28, x + 0.012, y + 0.012, 0.36, M["beam"]).parent = base
        flame.scale = (1.2,) * 3
    return base


# ------------------------------------------------------------------------------- Edo
def edo_materials(M):
    dark = B.wood_mat("dark timber", (0.12, 0.075, 0.045))
    for k in ("plaster_xz", "plaster_up_xz"):
        M[k] = B.plaster_mat(f"clay wall {k}", "xz", base=(0.6, 0.5, 0.36), patches=False)
    for k in ("plaster_yz", "plaster_up_yz"):
        M[k] = B.plaster_mat(f"clay wall {k}", "yz", base=(0.6, 0.5, 0.36), patches=False)
    for k in ("pier_xz", "pier_yz", "brick_xz", "whitewash"):
        M[k] = dark
    M["beam"] = M["beam_y"] = B.wood_mat("edo beams", (0.16, 0.1, 0.06))
    M["floor"] = tatami_mat("tatami")
    M["paving"] = noise_mat("earth street", (0.3, 0.26, 0.2), (0.45, 0.4, 0.32), 4)
    M["shop_floor"] = noise_mat("earth floor", (0.26, 0.2, 0.15), (0.38, 0.3, 0.22), 5)
    M["marble"] = noise_mat("step stone", (0.35, 0.34, 0.32), (0.5, 0.49, 0.46), 9)
    M["indigo"] = B.cloth_mat("noren indigo", (0.03, 0.05, 0.14))
    M["clay_raw"] = noise_mat("wet clay", (0.42, 0.3, 0.22), (0.55, 0.4, 0.3), 20, 0.6)
    M["paper"] = paper_mat("shoji paper")
    M["glazes"] = [glaze_mat(f"glaze {i}", c) for i, c in enumerate(
        [(0.42, 0.55, 0.45), (0.25, 0.12, 0.06), (0.85, 0.82, 0.74), (0.18, 0.28, 0.45), (0.5, 0.35, 0.2)])]


def edo_props(M, light):
    z = F1
    bpy.data.objects["roof boards"].data.materials[0] = M["beam"]  # not tatami on the roof
    # the shop front: noren curtain panels under the lintel, a paper lantern by the door post
    for i in range(4):
        x0 = -3.55 + i * 1.17
        box(f"noren {i}", x0, -0.12, G - 0.78, x0 + 1.1, -0.1, G - 0.36, M["indigo"])
    chochin = lathe("chochin", [(0, 0), (0.1, 0.01), (0.16, 0.12), (0.17, 0.22), (0.16, 0.32), (0.1, 0.43), (0, 0.44)],
                    paper_mat("lantern paper", (0.85, 0.2, 0.12)), (1.25, -0.45, 2.0), 24)
    for zz in (0.0, 0.42):
        lathe(f"chochin cap {zz}", [(0, 0), (0.1, 0), (0.1, 0.03), (0, 0.03)], M["beam"], (0, 0, zz), 16, chochin)
    li = bpy.data.lights.new("chochin light", "POINT")
    li.energy, li.color, li.shadow_soft_size = (40 if light.startswith("night") else 8), (1, 0.55, 0.3), 0.1
    B.link(bpy.data.objects.new("chochin light", li), chochin).location = (0, 0, 0.22)
    # workshop: shelves of glazed bowls on the back wall, the kick wheel, a low bench, clay and pots
    for row, sz in enumerate((0.9, 1.35, 1.8)):
        box(f"shelf {row}", -3.7, D - 0.34, sz - 0.03, 0.8, D, sz, M["beam"])
        for j in range(13):
            g = M["glazes"][(row * 3 + j) % len(M["glazes"])]
            lathe(f"ware {row}-{j}", [(r * (1.0 + 0.2 * (j % 3)), h * (1.0 + 0.3 * (j % 2))) for r, h in BOWL], g,
                  (-3.5 + j * 0.33, D - 0.17, sz), 20)
    wheel = lathe("kick wheel", [(0, 0), (0.36, 0), (0.36, 0.08), (0.05, 0.08), (0.05, 0.42), (0.2, 0.42), (0.2, 0.46),
                                 (0, 0.46)], M["beam"], (-1.6, 2.3, 0.02), 32)
    lathe("clay on wheel", [(0, 0), (0.11, 0), (0.1, 0.08), (0.06, 0.16), (0.03, 0.18), (0, 0.18)], M["clay_raw"],
          (0, 0, 0.46), 24, wheel)
    box("potter stool", -1.82, 2.8, 0.02, -1.38, 3.15, 0.32, M["beam"])
    box("work bench", -3.6, 3.15, 0.02, -2.2, 3.75, 0.45, M["beam"])
    for i, (x, y, s) in enumerate(((0.55, 3.9, 1.5), (1.05, 4.25, 1.3), (0.9, 3.5, 1.1))):
        lathe(f"storage pot {i}", [(r * s, h * s) for r, h in
                                   [(0, 0), (0.12, 0), (0.2, 0.15), (0.22, 0.3), (0.15, 0.45), (0.13, 0.5), (0, 0.5)]],
              M["glazes"][1 + i % 2], (x, y, 0.02))
    lathe("water tub", [(0, 0), (0.2, 0), (0.22, 0.25), (0.2, 0.25), (0, 0.03)], M["furniture"], (-0.6, 2.0, 0.02))
    # upstairs: shoji in the window, tokonoma alcove with the scroll, low table, cushions, andon
    box("shoji paper", W0 - 0.04, 1.6, z + 1.0, W0 - 0.03, 2.7, z + 2.1, M["paper"])
    for k in range(1, 6):
        y = 1.6 + k * 1.1 / 6
        box(f"shoji bar v{k}", W0 - 0.06, y - 0.012, z + 1.0, W0 - 0.02, y + 0.012, z + 2.1, M["furniture"])
    for k in range(1, 4):
        zz = z + 1.0 + k * 1.1 / 4
        box(f"shoji bar h{k}", W0 - 0.06, 1.6, zz - 0.012, W0 - 0.02, 2.7, zz + 0.012, M["furniture"])
    box("tokonoma", -1.4, 4.4, z, 0.4, D, z + 0.14, M["beam"])
    box("tokonoma post", 0.35, 4.4, z, 0.47, 4.52, z + 2.6, M["beam"])
    picture("hanging scroll", "scroll.png", -0.82, -0.38, z + 0.55, z + 1.9, D - 0.03, M)
    box("tana shelf", -0.05, 4.62, z + 1.0, 0.38, D, z + 1.04, M["beam"])  # where the wife's bowl is kept
    vase = lathe("vase", [(0, 0), (0.05, 0), (0.07, 0.1), (0.04, 0.22), (0.035, 0.3), (0, 0.3)], M["glazes"][3],
                 (-1.1, 4.75, z + 0.14))
    twig = box("plum twig", -0.006, -0.006, 0.25, 0.006, 0.006, 0.75, M["beam"])
    twig.parent, twig.rotation_euler.y = vase, 0.35
    lathe("chabudai", [(0, 0), (0.06, 0), (0.06, 0.28), (0.45, 0.28), (0.45, 0.33), (0, 0.33)], M["furniture"],
          (-2.1, 2.2, z), 40)
    for i, (x, y) in enumerate(((-2.1, 1.45), (-2.1, 2.95), (-1.35, 2.2))):
        box(f"zabuton {i}", x - 0.27, y - 0.27, z, x + 0.27, y + 0.27, z + 0.07, M["mattress"], bevel=0.025)
    lamp(M, (-3.3, 3.9, z + 0.28), kind="andon", energy=45)


# ----------------------------------------------------------------------------- Egypt
def egypt_materials(M):
    for k, plane in (("plaster_xz", "xz"), ("plaster_yz", "yz"), ("plaster_up_xz", "xz"), ("plaster_up_yz", "yz")):
        M[k] = mud_plaster_mat(f"mud plaster {k}", plane)
    M["whitewash"] = mud_plaster_mat("parapet plaster", "yz")
    M["pier_xz"], M["pier_yz"], M["brick_xz"] = (mudbrick_mat("mud brick xz", "xz"), mudbrick_mat("mud brick yz", "yz"),
                                                 mudbrick_mat("mud brick lintel", "xz"))
    M["beam"] = M["beam_y"] = B.wood_mat("palm logs", (0.36, 0.27, 0.17))
    M["floor"] = noise_mat("beaten earth upper", (0.5, 0.42, 0.3), (0.62, 0.53, 0.4), 5)
    M["shop_floor"] = noise_mat("beaten earth", (0.48, 0.4, 0.28), (0.6, 0.5, 0.36), 5)
    M["paving"] = noise_mat("desert sand", (0.66, 0.55, 0.38), (0.8, 0.7, 0.5), 3)
    M["marble"] = noise_mat("limestone", (0.72, 0.68, 0.58), (0.85, 0.82, 0.72), 8)
    M["reed"] = noise_mat("reed mat", (0.5, 0.42, 0.22), (0.68, 0.58, 0.32), 40)
    M["linen"] = B.cloth_mat("linen", (0.86, 0.84, 0.78))
    M["pigments"] = [B.flat(f"pigment {i}", c, 0.95) for i, c in enumerate(
        [(0.6, 0.15, 0.08), (0.1, 0.25, 0.6), (0.8, 0.6, 0.12), (0.12, 0.45, 0.3), (0.05, 0.05, 0.05)])]


def egypt_props(M, light):
    z = F1
    bpy.data.objects["roof boards"].data.materials[0] = M["reed"]  # palm-rib and reed roofing
    # workshop: the practice wall, a low table of pigment bowls and brushes, water jars, mats
    picture("practice wall", "frieze.png", -3.75, 0.45, 0.65, 2.15, D - 0.02, M)
    box("pigment table", -1.55, 2.55, 0.02, -0.45, 3.1, 0.36, M["beam"])
    for i, g in enumerate(M["pigments"]):
        bw = lathe(f"pigment bowl {i}", BOWL, M["clay_pale"], (-1.45 + i * 0.22, 2.75, 0.36), 20)
        lathe(f"pigment {i}", [(0, 0.03), (0.07, 0.03), (0.06, 0.06), (0, 0.065)], g, (0, 0, 0), 16, bw)
    for i in range(3):
        b = box(f"brush {i}", -0.004, -0.11, -0.004, 0.004, 0.11, 0.004, M["beam"])
        b.location, b.rotation_euler.z = (-0.75 + i * 0.06, 2.95, 0.37), 0.2 * i
    for i, (x, y, s) in enumerate(((0.65, 3.95, 1.7), (1.1, 3.5, 1.5), (1.15, 4.35, 1.4))):
        B.amphora(f"water jar {i}", (x, y, 0.02), M, s, B.JUG)
    box("floor mat", -3.4, 1.0, 0.02, -1.9, 2.2, 0.035, M["reed"])
    box("low stool", -2.95, 2.75, 0.02, -2.55, 3.1, 0.3, M["beam"])
    lathe("basket", [(0, 0), (0.18, 0), (0.22, 0.22), (0.2, 0.22), (0, 0.03)], M["reed"], (-3.5, 3.6, 0.02))
    # upstairs: sleeping mat with a headrest, a painted chest, low table with the lamp, a jar
    box("sleeping mat", -1.95, 3.15, z, -0.25, 4.65, z + 0.035, M["reed"])
    box("headrest", -1.2, 4.4, z + 0.035, -1.0, 4.52, z + 0.2, M["beam"])
    box("chest", -3.75, 3.9, z, -2.95, 4.55, z + 0.5, M["furniture"])
    box("chest band", -3.76, 3.89, z + 0.38, -2.94, 4.56, z + 0.44, M["pigments"][1])
    box("lamp table", -2.75, 2.3, z, -2.15, 2.85, z + 0.42, M["beam"])
    lamp(M, (-2.45, 2.55, z + 0.42), energy=55)
    box("stool up", -1.4, 2.95, z, -1.0, 3.3, z + 0.3, M["beam"])
    B.amphora("room jar", (-0.4, 2.1, z), M, 1.2, B.JUG)


def egypt_light(light):
    if light != "day":
        return
    O = bpy.data.objects
    O["sun"].data.energy, O["sun"].data.color = 6.0, (1.0, 0.94, 0.82)
    O["sun"].rotation_euler = (math.radians(40), 0, math.radians(-125))
    bg = bpy.context.scene.world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.55, 0.6, 0.72, 1)
    bg.inputs["Strength"].default_value = 0.55
    bpy.context.scene.view_settings.exposure = -0.2


THEMES = {
    "edo": dict(materials=edo_materials, props=edo_props, light=None),
    "egypt": dict(materials=egypt_materials, props=egypt_props, light=egypt_light),
}


def work_lamp(M, loc, energy=40, name="work lamp"):
    """A second, small oil lamp (the scene's main one is lamp())."""
    base = lathe(name, [(0, 0), (0.045, 0), (0.06, 0.02), (0.05, 0.03), (0, 0.03)], M["clay_pale"], loc)
    ellipsoid(f"{name} flame", (0.011, 0.011, 0.03), M["flame"], (0.045, 0, 0.055), base, 12)
    li = bpy.data.lights.new(f"{name} light", "POINT")
    li.energy, li.color, li.shadow_soft_size = energy, (1.0, 0.6, 0.3), 0.03
    B.link(bpy.data.objects.new(f"{name} light", li), base).location = (0.045, 0, 0.11)
    return base


def kintsugi_bowl(name, loc, M, gold=True, parent=None):
    """Her bowl: dark tenmoku glaze, mended or not with seams of gold."""
    mat = glaze_mat(f"{name} glaze", (0.1, 0.06, 0.04), 0.3, gold_seams=gold)
    return lathe(name, [(r * 1.25, h * 1.25) for r, h in BOWL], mat, loc, 32, parent)
