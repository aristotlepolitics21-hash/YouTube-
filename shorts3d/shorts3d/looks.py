"""Materials, lighting, world and render settings for the clean 3D-explainer look:
smooth matte skin, ivory bone, glowing x-ray shells, soft studio light, dark backdrop."""

from __future__ import annotations

import math

import bpy
import mathutils


def principled(name, color, rough=0.5, sss=0.0, metallic=0.0, emit=None, emit_strength=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Subsurface Weight"].default_value = sss
    if emit:
        p.inputs["Emission Color"].default_value = (*emit, 1)
        p.inputs["Emission Strength"].default_value = emit_strength
    if alpha < 1:
        p.inputs["Alpha"].default_value = alpha
    return m


def xray(name="xray", color=(0.35, 0.75, 1.0), strength=2.0, edge=0.35):
    """Fresnel-edged glowing shell; transparent where the surface faces the camera."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = edge
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    em.inputs["Strength"].default_value = strength
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mx = nt.nodes.new("ShaderNodeMixShader")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(lw.outputs["Facing"], mx.inputs[0])
    nt.links.new(tr.outputs[0], mx.inputs[1])
    nt.links.new(em.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    return m


def library():
    return {
        "skin": principled("skin", (0.62, 0.52, 0.47), 0.5, 0.15),
        "eye": principled("eye", (0.08, 0.07, 0.07), 0.15),
        "bone": principled("bone", (0.93, 0.9, 0.82), 0.4),
        "xray": xray(),
        "fluid": principled("fluid", (0.3, 0.65, 1.0), 0.05, emit=(0.2, 0.5, 1.0), emit_strength=0.8, alpha=0.45),
        "gas": principled("gas", (1, 1, 1), 0.0, emit=(0.85, 0.95, 1.0), emit_strength=3.0, alpha=0.7),
        "capsule": xray("capsule", (1.0, 0.75, 0.4), 1.5, 0.25),
        "gold": principled("gold", (1.0, 0.76, 0.3), 0.25, metallic=1.0),
        "metal": principled("metal", (0.8, 0.82, 0.85), 0.3, metallic=1.0),
        "plastic_white": principled("plastic_white", (0.9, 0.9, 0.92), 0.35),
        "floor": principled("floor", (0.05, 0.06, 0.08), 0.6),
        "red": principled("red", (0.9, 0.12, 0.1), 0.4, emit=(1, 0.1, 0.05), emit_strength=1.5),
    }


def assign(objs, material):
    for o in objs:
        if o.type == "MESH":
            o.data.materials.clear()
            o.data.materials.append(material)


def setup_world(scene, color=(0.02, 0.025, 0.035)):
    w = bpy.data.worlds.new("world")
    scene.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (*color, 1)


def area_light(scene, name, loc, target, energy, size=2.0, color=(1, 1, 1)):
    light = bpy.data.lights.new(name, "AREA")
    light.energy, light.size, light.color = energy, size, color
    o = bpy.data.objects.new(name, light)
    o.location = loc
    o.rotation_euler = (mathutils.Vector(target) - mathutils.Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    scene.collection.objects.link(o)
    return o


def studio(scene, target=(0, 0, 1.0), scale=1.0):
    """Key from front-left, cool rim from behind-right, soft fill."""
    t = mathutils.Vector(target)
    area_light(scene, "key", t + mathutils.Vector((-2, -3, 1.5)) * scale, t, 600 * scale ** 2, 2 * scale)
    area_light(scene, "rim", t + mathutils.Vector((2.5, 2, 1.2)) * scale, t, 500 * scale ** 2, 1 * scale, (0.8, 0.9, 1))
    area_light(scene, "fill", t + mathutils.Vector((2.5, -2.5, 0)) * scale, t, 150 * scale ** 2, 3 * scale)


def render_settings(scene, width=540, height=960, samples=12, fps=24):
    scene.render.engine = "CYCLES"
    c = scene.cycles
    c.device = "CPU"
    c.samples = samples
    c.use_adaptive_sampling = True
    c.use_denoising = True
    c.max_bounces, c.diffuse_bounces, c.glossy_bounces = 4, 2, 2
    c.transmission_bounces, c.transparent_max_bounces = 2, 12
    scene.render.use_persistent_data = True
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.render.fps = fps
    scene.view_settings.view_transform = "AgX"
    scene.render.image_settings.file_format = "PNG"


def camera(scene, loc, target, lens=50):
    cam = bpy.data.cameras.new("cam")
    cam.lens = lens
    cam.clip_start = 0.002
    o = bpy.data.objects.new("cam", cam)
    scene.collection.objects.link(o)
    scene.camera = o
    aim(o, loc, target)
    return o


def aim(cam_obj, loc, target):
    cam_obj.location = loc
    cam_obj.rotation_euler = (mathutils.Vector(target) - mathutils.Vector(loc)).to_track_quat("-Z", "Y").to_euler()


def ease(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)


radians = math.radians


def skin_to_xray(name="skin_xray"):
    """Skin that can dissolve into the x-ray shell. Animate the returned value socket 0 -> 1."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    skin = nt.nodes.new("ShaderNodeBsdfPrincipled")
    skin.inputs["Base Color"].default_value = (0.62, 0.52, 0.47, 1)
    skin.inputs["Roughness"].default_value = 0.5
    skin.inputs["Subsurface Weight"].default_value = 0.15
    lw = nt.nodes.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (0.35, 0.75, 1.0, 1)
    em.inputs["Strength"].default_value = 2.0
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    xr = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lw.outputs["Facing"], xr.inputs[0])
    nt.links.new(tr.outputs[0], xr.inputs[1])
    nt.links.new(em.outputs[0], xr.inputs[2])
    val = nt.nodes.new("ShaderNodeValue")
    val.name = "xray_amount"
    val.outputs[0].default_value = 0.0
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(val.outputs[0], mix.inputs[0])
    nt.links.new(skin.outputs[0], mix.inputs[1])
    nt.links.new(xr.outputs[0], mix.inputs[2])
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(mix.outputs[0], out.inputs[0])
    return m, val.outputs[0]


def glow_bone(name="bone_glow", color=(0.2, 1.0, 0.45)):
    """Bone material with an emission tint that can be animated (returns material, strength socket)."""
    m = principled(name, (0.93, 0.9, 0.82), 0.4, emit=color, emit_strength=0.0)
    return m, m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
