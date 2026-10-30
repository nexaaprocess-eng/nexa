"""Shared Blender render setup for Hidden Ledger shots: Cycles CPU, AgX look, sunset sky, denoising."""
from __future__ import annotations

import math

import bpy
from mathutils import Vector


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def cycles(samples=48, w=1920, h=1080, pct=100, transparent=False, threads=0):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.03
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.cycles.denoising_input_passes = "RGB_ALBEDO_NORMAL"
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 3
    sc.cycles.glossy_bounces = 3
    sc.cycles.transmission_bounces = 4
    sc.cycles.transparent_max_bounces = 6
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.0
    sc.render.use_persistent_data = True
    sc.render.resolution_x = w
    sc.render.resolution_y = h
    sc.render.resolution_percentage = pct
    sc.render.film_transparent = transparent
    sc.render.fps = 30
    if threads:
        sc.render.threads_mode = "FIXED"
        sc.render.threads = threads
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.view_settings.exposure = -0.3
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    sc.render.image_settings.compression = 30
    return sc


def sky(sun_elev=4.0, sun_rot=200.0, strength=0.45, air=1.8, dust=4.0, ozone=2.0):
    """Nishita physical sky: warm low sun like the reference sheet's golden hour."""
    w = bpy.data.worlds.new("Sky")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    st = nt.nodes.new("ShaderNodeTexSky")
    st.sky_type = "NISHITA"
    st.sun_elevation = math.radians(sun_elev)
    st.sun_rotation = math.radians(sun_rot)
    st.air_density = air
    st.dust_density = dust
    st.ozone_density = ozone
    st.sun_size = math.radians(2.5)
    st.sun_intensity = 0.6
    nt.links.new(st.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    return st


def flat_world(color=(0.02, 0.02, 0.025), strength=1.0):
    w = bpy.data.worlds.new("Flat")
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*color, 1)
    bg.inputs["Strength"].default_value = strength


def area_light(name, loc, target, power=300, size=2.0, color=(1.0, 0.75, 0.5)):
    d = bpy.data.lights.new(name, "AREA")
    d.energy = power
    d.size = size
    d.color = color
    o = bpy.data.objects.new(name, d)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    look_at(o, target)
    return o


def sun_light(name, rot_deg=(60, 0, 200), power=3.0, color=(1.0, 0.62, 0.36), angle=4.0):
    d = bpy.data.lights.new(name, "SUN")
    d.energy = power
    d.color = color
    d.angle = math.radians(angle)
    o = bpy.data.objects.new(name, d)
    bpy.context.scene.collection.objects.link(o)
    o.rotation_euler = tuple(math.radians(a) for a in rot_deg)
    return o


def look_at(obj, target):
    d = Vector(target) - obj.location
    obj.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def camera(loc, target, lens=50, dof=None, fstop=2.8, sensor=36):
    c = bpy.data.cameras.new("Cam")
    c.lens = lens
    c.sensor_width = sensor
    o = bpy.data.objects.new("Cam", c)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    look_at(o, target)
    bpy.context.scene.camera = o
    if dof:
        c.dof.use_dof = True
        c.dof.focus_distance = dof
        c.dof.aperture_fstop = fstop
    return o


def ground(size=60, color=(0.12, 0.11, 0.1), rough=0.6, name="Ground", shadow_catcher=False):
    bpy.ops.mesh.primitive_plane_add(size=size)
    g = bpy.context.active_object
    g.name = name
    m = bpy.data.materials.new(name + "Mat")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    g.data.materials.append(m)
    g.is_shadow_catcher = shadow_catcher
    return g


# ------------------------------------------------------------------ lighting presets (all shots of an episode share these)
def sun_dir(sun_obj):
    """World direction the sun light travels (for shadow-aware crops)."""
    from mathutils import Vector as _V
    bpy.context.view_layer.update()
    return (sun_obj.matrix_world.to_3x3() @ _V((0, 0, -1))).normalized()


def golden(az=210.0, elev=4.0, sun_power=3.2, sky_strength=0.42, fill=True, lamp_elev=None):
    """Golden hour: low warm sun at azimuth `az` (degrees from +Y towards +X, i.e. the Nishita sun_rotation),
    physical sky + a matching sun lamp (calibrated: sky sun and lamp shadows agree). lamp_elev can lift the lamp a
    little above the visible sun so shadows are not endlessly long."""
    sky(sun_elev=elev, sun_rot=az, strength=sky_strength)
    le = elev if lamp_elev is None else lamp_elev
    s = sun_light("Sun", rot_deg=(90 - le, 0, 180 - az), power=sun_power, color=(1.0, 0.62, 0.34), angle=2.5)
    if fill:
        area_light("Fill", (-6, -8, 6), (0, 0, 1), power=600, size=8, color=(0.62, 0.72, 1.0))
    return s


def stage_lights(key_power=900, rim_power=700, world=0.08):
    flat_world((0.10, 0.075, 0.06), world)
    area_light("Key", (-3.5, -5, 5), (0, 0, 1.2), power=key_power, size=4, color=(1.0, 0.78, 0.55))
    area_light("Rim", (4, 3.5, 4), (0, 0, 1.4), power=rim_power, size=3, color=(1.0, 0.55, 0.3))
    area_light("Bounce", (2, -6, 1), (0, 0, 1), power=200, size=6, color=(0.7, 0.8, 1.0))
    s = sun_light("SunStage", rot_deg=(50, 0, 30), power=0.0)  # zero-power: only gives the crop its shadow direction
    return s


def dusk_night(sky_strength=0.12):
    sky(sun_elev=-3.5, sun_rot=120, strength=sky_strength, dust=1.0)
    s = sun_light("Moon", rot_deg=(40, 0, 60), power=0.15, color=(0.6, 0.7, 1.0), angle=4)
    return s
