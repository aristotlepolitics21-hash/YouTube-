"""Procedural props built from Blender primitives (no external assets needed)."""

from __future__ import annotations

import math

import bpy
import mathutils


def _link(obj, collection=None):
    (collection or bpy.context.scene.collection).objects.link(obj)
    return obj


def uv_sphere(name, loc, radius, material, segments=48, rings=24, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    bpy.ops.object.shade_smooth()
    o.data.materials.append(material)
    return o


def torus(name, loc, major, minor, material, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, location=loc, rotation=rotation,
                                     major_segments=96, minor_segments=32)
    o = bpy.context.active_object
    o.name = name
    bpy.ops.object.shade_smooth()
    o.data.materials.append(material)
    return o


def cylinder(name, loc, radius, depth, material, rotation=(0, 0, 0), vertices=64):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=loc, rotation=rotation, vertices=vertices)
    o = bpy.context.active_object
    o.name = name
    bpy.ops.object.shade_smooth()
    o.data.materials.append(material)
    return o


def floor(material, size=40, z=0.0):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z))
    o = bpy.context.active_object
    o.name = "floor"
    o.data.materials.append(material)
    return o


def trophy(material, base_material, loc=(0, 0, 0), height=0.6):
    """A cup trophy from a lathed profile (screw modifier) on a two-step base."""
    h = height
    profile = [(0.0, 0.0), (0.16, 0.0), (0.16, 0.03), (0.06, 0.06), (0.035, 0.12), (0.03, 0.3),
               (0.05, 0.34), (0.2, 0.42), (0.26, 0.62), (0.27, 0.78), (0.25, 0.8), (0.0, 0.8)]
    mesh = bpy.data.meshes.new("trophy_profile")
    verts = [(x * h / 0.8, 0, z * h / 0.8) for x, z in profile]
    edges = [(i, i + 1) for i in range(len(verts) - 1)]
    mesh.from_pydata(verts, edges, [])
    cup = _link(bpy.data.objects.new("trophy", mesh))
    cup.location = loc
    screw = cup.modifiers.new("lathe", "SCREW")
    screw.steps = screw.render_steps = 96
    screw.use_smooth_shade = True
    sub = cup.modifiers.new("smooth", "SUBSURF")
    sub.levels = sub.render_levels = 2
    cup.data.materials.append(material)
    # Handles
    for side in (-1, 1):
        t = torus(f"handle{side}", (loc[0] + side * 0.27 * h / 0.8, loc[1], loc[2] + 0.6 * h / 0.8),
                  0.09 * h / 0.8, 0.018 * h / 0.8, material, rotation=(math.radians(90), 0, 0))
        t.parent = cup
        t.matrix_parent_inverse = cup.matrix_world.inverted()
    bpy.ops.mesh.primitive_cube_add(size=1, location=(loc[0], loc[1], loc[2] - 0.08 * h))
    base = bpy.context.active_object
    base.name = "trophy_base"
    base.scale = (0.5 * h, 0.5 * h, 0.16 * h)
    bev = base.modifiers.new("bevel", "BEVEL")
    bev.width, bev.segments = 0.01, 3
    base.data.materials.append(base_material)
    return cup, base


def mri_scanner(shell_material, ring_material, loc=(0, 0, 0), radius=0.45, depth=0.9, axis="y"):
    """A simple MRI bore sized by `radius`: a thick rounded tube with a glowing inner ring."""
    rot = (math.radians(90), 0, 0) if axis == "y" else (0, math.radians(90), 0)
    wall = radius * 0.45
    shell = torus("mri_shell", loc, radius + wall, wall, shell_material, rotation=rot)
    stretch = depth / (2 * wall)
    shell.scale = (1, 1, stretch)
    glow = torus("mri_glow", loc, radius * 1.02, radius * 0.03, ring_material, rotation=rot)
    return shell, glow


def scan_plane(material, loc, size, axis="y"):
    bpy.ops.mesh.primitive_plane_add(size=size, location=loc)
    o = bpy.context.active_object
    o.name = "scan_plane"
    if axis == "y":
        o.rotation_euler = (math.radians(90), 0, 0)
    o.data.materials.append(material)
    return o


def progress_ring(material, loc, radius, rotation=(0, 0, 0)):
    """A ring whose visible arc is animated via the screw-angle trick (returns object; animate 'screw.angle')."""
    mesh = bpy.data.meshes.new("ring_profile")
    mesh.from_pydata([(radius, 0, 0), (radius + 0.004, 0, 0)], [(0, 1)], [])
    o = _link(bpy.data.objects.new("progress_ring", mesh))
    o.location = loc
    o.rotation_euler = rotation
    s = o.modifiers.new("arc", "SCREW")
    s.angle = math.radians(359)
    s.steps = s.render_steps = 128
    s.screw_offset = 0
    so = o.modifiers.new("thick", "SOLIDIFY")
    so.thickness = 0.004
    o.data.materials.append(material)
    return o


def key(obj, frame, **props):
    """key(obj, 10, location=(..), scale=(..)) sets and keyframes properties."""
    for name, value in props.items():
        setattr(obj, name, value)
        obj.keyframe_insert(name, frame=frame)


def vec(v):
    return mathutils.Vector(v)
