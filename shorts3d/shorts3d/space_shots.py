"""Shot builders for space scenes (see space.py for the parts)."""

from __future__ import annotations

import math

import bpy
import mathutils

from . import fx, looks, props, space

V = mathutils.Vector


def _scene(ctx, frames, spec):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, frames
    looks.render_settings(scene, ctx["width"], ctx["height"], ctx["samples"], ctx["fps"])
    space.star_world(scene, **spec.get("nebula", {}))
    return scene


def build_spacetime(spec, frames, ctx):
    """Neon grid. mode: flat | sun | orbits | blackhole. bend: [a, b] fractions for the well to form."""
    scene = _scene(ctx, frames, spec)
    mode = spec.get("mode", "sun")
    hole = mode == "blackhole"
    depth, soft = (3.2, 0.28) if hole else (1.3, 0.9)
    grid, key = space.grid_sheet(depth=depth, soft=soft,
                                 colors=((0.0, 0.85, 1.0), (1.0, 0.1, 0.75)) if not hole else ((0.6, 0.2, 1.0), (1.0, 0.45, 0.05)))
    a, b = spec.get("bend", (0.1, 0.6)) if mode != "flat" else (2, 3)
    bend = space.ease_keys(frames, a, b) if mode != "flat" else [(1, 0.0)]
    if spec.get("bent_from_start"):
        bend = [(1, 1.0)]
    for f, v in bend:
        key.value = v
        key.keyframe_insert("value", frame=f)
    centre_obj = []
    if mode in ("sun", "orbits"):
        r = 0.42
        centre_obj = space.glowing_sun((0, 0, r), r)
        for f, v in bend:
            for o in centre_obj:
                props.key(o, f, location=(0, 0, space.well(0, depth, soft) * v + r * 0.9))
        if mode == "flat":
            pass
    if hole:
        bh = props.uv_sphere("hole", (0, 0, 0), 0.22, looks.principled("void", (0, 0, 0), 1.0))
        disk = space.accretion_disk((0, 0, 0), 0.24, 0.85)
        for f, v in bend:
            z = space.well(0, depth, soft) * v * 0.55
            props.key(bh, f, location=(0, 0, z), scale=(v + 0.01,) * 3)
            props.key(disk, f, location=(0, 0, z), scale=(v + 0.01,) * 3)
        for f, rot in ((1, 0), (frames, math.radians(spec.get("disk_spin", 160)))):
            props.key(disk, f, rotation_euler=(math.radians(8), 0, rot))
        fx._linear(disk)
        if spec.get("light_beam"):  # a ray of light that spirals in and never comes out
            pts = []
            for i in range(160):
                t = i / 159
                ang = -1.2 + 5.5 * t ** 1.6
                rad = 3.4 * (1 - t) ** 1.2 + 0.05
                z = space.well(rad, depth, soft) + 0.12
                pts.append(V((rad * math.cos(ang), rad * math.sin(ang), z)))
            mat, _ = fx.emissive("beam", (1.0, 0.95, 0.6), 12)
            beam = fx._curve("beam", pts, 0.018, mat)
            cu = beam.data
            for fr, val in ((1, 0.0), (int(frames * 0.2), 0.0), (int(frames * 0.85), 1.0)):
                cu.bevel_factor_end = val
                cu.keyframe_insert("bevel_factor_end", frame=fr)
    if mode == "orbits":
        planets = spec.get("planets", [
            {"r": 1.5, "size": 0.18, "speed": 1.0, "colors": [[0.05, 0.25, 0.9], [0.1, 0.7, 0.3], [0.05, 0.25, 0.9]]},
            {"r": 2.3, "size": 0.24, "speed": 0.62, "colors": [[0.9, 0.35, 0.08], [1.0, 0.75, 0.35]]},
            {"r": 3.1, "size": 0.3, "speed": 0.42, "colors": [[0.15, 0.85, 0.85], [0.55, 0.3, 1.0]]},
        ])
        for i, pl in enumerate(planets):
            m = space.planet_material(f"planet{i}", [tuple(c) for c in pl["colors"]], 4.0, emit=0.4)
            o = props.uv_sphere(f"planet{i}", (pl["r"], 0, 0), pl["size"], m)
            phase = i * 2.1
            for f in range(1, frames + 1, 2):
                ang = phase + pl["speed"] * 2 * math.pi * f / (ctx["fps"] * 3.5)
                x, y = pl["r"] * math.cos(ang), pl["r"] * math.sin(ang)
                props.key(o, f, location=(x, y, space.well(pl["r"], depth, soft) + pl["size"] * 0.9))
            space.dashed_circle(f"path{i}", (0, 0, space.well(pl["r"], depth, soft) + 0.01), pl["r"],
                                (1, 1, 1), strength=0.8, dashes=70)
    cam = spec.get("camera", {})
    a_pos = tuple(cam.get("from", (0, -6.5, 3.2)))
    b_pos = tuple(cam.get("to", (0, -5.2, 2.4)))
    target = tuple(cam.get("target", (0, 0, -0.5)))
    space.camera_path(scene, frames, a_pos, b_pos, target, cam.get("lens", 32))
    return scene


def build_orbit(spec, frames, ctx):
    """Earth with an orbiting Moon (with velocity/fall arrows and a trail) or a space station."""
    scene = _scene(ctx, frames, spec)
    space.sun_light(scene, (-1, -0.8, 0.5), 4.5)
    body = spec.get("body", "moon")
    space.earth((0, 0, 0), 1.0, spin_frames=40, frames=frames)
    fps = ctx["fps"]
    if body == "moon":
        R, size, period = 2.6, 0.27, spec.get("period_s", 9.0)
        moon_mat = space.planet_material("moon", [(0.25, 0.25, 0.27), (0.65, 0.64, 0.62)], 6.0)
        obj = props.uv_sphere("moon", (R, 0, 0), size, moon_mat)
    else:
        R, period = 1.22, spec.get("period_s", 6.0)
        obj = space.station((R, 0, 0), spec.get("scale", 0.09))
    tilt = math.radians(spec.get("tilt", 18))
    phase0 = math.radians(spec.get("phase", -40))
    vel = space.arrow("velocity", (1.0, 0.8, 0.1), 1.1, 0.035) if spec.get("arrows") else None
    fall = space.arrow("fall", (1.0, 0.15, 0.6), 0.9, 0.035) if spec.get("arrows") else None
    def pos(ang):
        p = V((R * math.cos(ang), R * math.sin(ang), 0))
        p.rotate(mathutils.Euler((tilt, 0, 0)))
        return p
    for f in range(1, frames + 1):
        ang = phase0 + 2 * math.pi * f / (fps * period)
        p = pos(ang)
        props.key(obj, f, location=p)
        if body != "moon":
            obj.rotation_euler = (tilt, 0, ang + math.pi / 2)
            obj.keyframe_insert("rotation_euler", frame=f)
        if vel:
            tangent = (pos(ang + 0.01) - p).normalized()
            vel.location = p
            vel.rotation_euler = tangent.to_track_quat("X", "Z").to_euler()
            vel.keyframe_insert("location", frame=f)
            vel.keyframe_insert("rotation_euler", frame=f)
            fall.location = p
            fall.rotation_euler = (-p).normalized().to_track_quat("X", "Z").to_euler()
            fall.keyframe_insert("location", frame=f)
            fall.keyframe_insert("rotation_euler", frame=f)
    if spec.get("trail", True):
        c = space.dashed_circle("trail", (0, 0, 0), R, (0.6, 0.85, 1.0), strength=1.5, dashes=90, width=0.008)
        c.rotation_euler = (tilt, 0, 0)
    cam = spec.get("camera", {})
    if spec.get("follow"):  # ride alongside the station, Earth curving away below
        c = looks.camera(scene, (0, -3, 0), (0, 0, 0), lens=cam.get("lens", 35))
        tc = c.constraints.new("TRACK_TO")
        tc.target, tc.track_axis, tc.up_axis = obj, "TRACK_NEGATIVE_Z", "UP_Y"
        for f in range(1, frames + 1):
            ang = phase0 + 2 * math.pi * f / (fps * period)
            p = pos(ang)
            behind = (pos(ang - 0.35) - p).normalized()
            props.key(c, f, location=p + p.normalized() * 0.55 + behind * 0.5 + V((0, 0, 0.12)))
        return scene
    space.camera_path(scene, frames, tuple(cam.get("from", (0.6, -7.5, 2.2))), tuple(cam.get("to", (0.2, -6.4, 1.6))),
                      tuple(cam.get("target", (0, 0, 0))), cam.get("lens", 40))
    return scene


def build_clocks(spec, frames, ctx):
    """A clock on Earth's surface and one high above it, ticking at different rates."""
    scene = _scene(ctx, frames, spec)
    space.sun_light(scene, (-1, -0.9, 0.6), 4.0)
    space.earth((0, 0, -3.0), 3.0, spin_frames=8, frames=frames, clouds=True, tilt=80)
    fps = ctx["fps"]
    low, ml, sl = space.clock("ground", (0, -0.2, 0.42), 0.36, (1.0, 0.15, 0.55))
    high, mh, sh = space.clock("space", (0, -0.2, 2.25), 0.36, (0.1, 0.8, 1.0))
    sat = space.satellite((0.62, -0.1, 2.55), 0.14)
    rates = spec.get("rates", (1.0, 1.35))
    space.tick_hand(sl, frames, fps, rates[0], 30)
    space.tick_hand(sh, frames, fps, rates[1], 30)
    for hand, rate in ((ml, rates[0]), (mh, rates[1])):
        props.key(hand, 1, rotation_euler=(0, 0, 0))
        props.key(hand, frames, rotation_euler=(0, math.radians(30 * rate * frames / fps / 6), 0))
        fx._linear(hand)
    for txt, loc, col in (("SLOWER", (0, -0.25, 1.0), (1.0, 0.15, 0.55)), ("FASTER", (0, -0.25, 2.85), (0.1, 0.8, 1.0))):
        t = fx.text(txt, looks.principled("lbl_" + txt, col, 0.3, emit=col, emit_strength=3), loc, size=0.2, depth=0.04)
        fx.pop_in(t, int(frames * 0.3))
    looks.area_light(scene, "front", (0.5, -4, 1.5), (0, 0, 1.2), 300, 3)
    space.camera_path(scene, frames, (0.15, -5.4, 1.35), (0.05, -4.8, 1.3), (0, 0, 1.3), 40)
    return scene


def build_gps(spec, frames, ctx):
    """Satellites around Earth pinging a pin on the surface; mode 'drift' slides a red pin away."""
    scene = _scene(ctx, frames, spec)
    space.sun_light(scene, (-1, -0.9, 0.6), 4.0)
    space.earth((0, 0, 0), 1.0, spin_frames=0, frames=frames)
    fps = ctx["fps"]
    surf = V((0.18, -0.75, 0.62)).normalized()
    good = space.pin("pin_ok", surf * 1.0, (0.1, 1.0, 0.4), normal=surf, size=0.14)
    sats = []
    for i, (r, ph, tilt) in enumerate(((1.9, -0.9, 25), (2.0, 0.2, -30), (1.85, 2.0, 60))):
        s_ = space.satellite((0, 0, 0), 0.13)
        for f in range(1, frames + 1, 2):
            ang = ph + 2 * math.pi * f / (fps * 14)
            p = V((r * math.cos(ang), r * math.sin(ang), 0))
            p.rotate(mathutils.Euler((math.radians(tilt), 0, 0)))
            props.key(s_, f, location=p)
        sats.append(s_)
    if spec.get("mode", "signals") == "signals":
        for i, s_ in enumerate(sats):  # beams from each satellite to the pin
            mat, st = fx.emissive(f"beam{i}", (0.2, 0.9, 1.0), 5)
            cu_pts = [V((0, 0, 0)), V((0, 0, 0))]
            beam = fx._curve(f"beam{i}", cu_pts, 0.01, mat)
            # re-key the two endpoints each frame via shape of the spline
            sp = beam.data.splines[0]
            for f in range(1, frames + 1, 2):
                bpy.context.scene.frame_set(f)
                p = s_.matrix_world.translation.copy()
                sp.points[0].co = (*p, 1)
                sp.points[1].co = (*(surf * 1.07), 1)
                sp.points[0].keyframe_insert("co", frame=f)
                sp.points[1].keyframe_insert("co", frame=f)
            fx.flash(None, st, [(1, 1.5)] + sum(([(k, 1.5), (k + 2, 10), (k + 8, 1.5)] for k in
                                                range(int(frames * 0.1) + i * 5, frames, int(fps * 0.9))), []))
        label = fx.text(spec.get("label", "+38 µs / day"),
                        looks.principled("lbl", (1, 0.85, 0.2), 0.3, emit=(1, 0.8, 0.15), emit_strength=3),
                        (0, -1.5, 1.45), size=0.24, depth=0.05)
        fx.pop_in(label, int(frames * 0.45))
    else:
        bad = space.pin("pin_bad", surf * 1.0, (1.0, 0.1, 0.2), normal=surf, size=0.14)
        axis = surf.cross(V((0, 0, 1))).normalized()
        trail_pts = []
        for f in range(1, frames + 1):
            t = looks.ease((f / frames - 0.15) / 0.7)
            q = mathutils.Quaternion(axis, -0.75 * t)
            p = q @ surf
            props.key(bad, f, location=p * 1.0, rotation_euler=p.to_track_quat("Z", "Y").to_euler())
            trail_pts.append(p * 1.012)
        mat, _ = fx.emissive("trail", (1.0, 0.15, 0.25), 4)
        trail = fx._curve("drift_trail", trail_pts, 0.008, mat)
        cu = trail.data
        cu.bevel_factor_end = 0.0
        cu.keyframe_insert("bevel_factor_end", frame=1)
        cu.bevel_factor_end = 1.0
        cu.keyframe_insert("bevel_factor_end", frame=frames)
        fx._linear_data(cu)
        label = fx.text(spec.get("label", "10 km / day"),
                        looks.principled("lbl", (1, 0.2, 0.3), 0.3, emit=(1, 0.15, 0.25), emit_strength=3),
                        (0, -1.5, 1.45), size=0.24, depth=0.05)
        fx.pop_in(label, int(frames * 0.55))
    looks.area_light(scene, "front", (0.5, -4, 1.5), (0, 0, 0), 150, 3)
    cam = spec.get("camera", {})
    space.camera_path(scene, frames, tuple(cam.get("from", (0.4, -5.6, 1.2))), tuple(cam.get("to", (0.2, -4.8, 1.0))),
                      tuple(cam.get("target", (0, 0, 0.35))), 40)
    return scene


BUILDERS = {"spacetime": build_spacetime, "orbit": build_orbit, "clocks": build_clocks, "gps": build_gps}
