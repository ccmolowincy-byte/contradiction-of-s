"""
Contradiction of S — FBX to GLB Optimization Script
=====================================================
Run this in Blender's Script Editor (Scripting workspace tab).

HOW TO USE:
1. Open Blender 5.1
2. Go to the Scripting workspace (top tab bar)
3. Click "Open" and select this file, OR paste it into the editor
4. Edit the CONFIG section below (set INPUT_FBX and OUTPUT_GLB paths)
5. Click the Run Script (▶) button

Run once per sculpture. The output GLB goes into the models/ folder.

WHAT IT DOES:
  - Imports FBX with armature and animations preserved
  - Merge by Distance  → removes Nomad's duplicate vertices
  - Limited Dissolve   → merges flat coplanar faces, leaves detail intact
  - Decimate Collapse  → reduces overall poly count conservatively
  - Smart UV Project   → auto-unwraps for the normal map bake later
  - Exports GLB        → with Draco compression (60-90% size reduction)
"""

import bpy, os

# ──────────────────────────────────────────────────
# CONFIG — edit these two paths for each sculpture
# ──────────────────────────────────────────────────

INPUT_FBX  = r"C:\Users\user\OneDrive\Desktop\Contradiction of S AR project\Stylised doll-like OC with Scoliosis 0 standing on star pedestal with crown.fbx"
OUTPUT_GLB = r"C:\Users\user\OneDrive\Desktop\Contradiction of S AR project\contradiction-of-s-ar\models\sculpture-01.glb"

# Decimate ratio: 0.1 = 10% of original poly count, 0.3 = 30%.
# Start with 0.25 — check result visually, lower if file is still too big.
DECIMATE_RATIO = 0.25

# Limited Dissolve angle (degrees). Higher = more faces merged in flat areas.
# 5° is safe for organic sculpts; increase to 10° if you want more reduction.
DISSOLVE_ANGLE_DEG = 5.0

# Max texture size (px). Nomad textures can be huge; 1024 is safe for mobile AR.
MAX_TEX_SIZE = 1024

# ──────────────────────────────────────────────────


import math


def log(msg):
    print(f"[optimize_fbx] {msg}")


def resize_images(max_px):
    """Downscale any packed images that exceed max_px in either dimension."""
    for img in bpy.data.images:
        if img.size[0] > max_px or img.size[1] > max_px:
            scale = min(max_px / img.size[0], max_px / img.size[1])
            new_w = max(1, int(img.size[0] * scale))
            new_h = max(1, int(img.size[1] * scale))
            img.scale(new_w, new_h)
            log(f"  Resized '{img.name}' → {new_w}×{new_h}")


def optimize_mesh(obj):
    """Apply the full cleanup + reduction pipeline to a single mesh object."""
    log(f"Optimising mesh: {obj.name}")
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    bpy.ops.object.mode_set(mode='EDIT')

    # 1. Merge by Distance — removes Nomad's overlapping/duplicate verts
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.001)
    log("  Merge by Distance done")

    # 2. Limited Dissolve — merges coplanar faces (flat areas), leaves curves
    bpy.ops.mesh.dissolve_limited(angle_limit=math.radians(DISSOLVE_ANGLE_DEG))
    log(f"  Limited Dissolve done ({DISSOLVE_ANGLE_DEG}°)")

    bpy.ops.object.mode_set(mode='OBJECT')

    # 3. Decimate Collapse — overall poly count reduction
    dec = obj.modifiers.new(name="Decimate_Collapse", type='DECIMATE')
    dec.decimate_type = 'COLLAPSE'
    dec.ratio = DECIMATE_RATIO
    dec.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier=dec.name)
    log(f"  Decimate Collapse applied (ratio={DECIMATE_RATIO})")

    # 4. Smart UV Project — auto-unwrap for optional normal bake later
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
    bpy.ops.object.mode_set(mode='OBJECT')
    log("  Smart UV Project done")

    obj.select_set(False)


def main():
    if not os.path.isfile(INPUT_FBX):
        raise FileNotFoundError(f"FBX not found: {INPUT_FBX}")

    os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)

    # ── Clear scene ──────────────────────────────
    bpy.ops.wm.read_factory_settings(use_empty=True)
    log("Scene cleared")

    # ── Import FBX ───────────────────────────────
    log(f"Importing: {os.path.basename(INPUT_FBX)}")
    bpy.ops.import_scene.fbx(
        filepath=INPUT_FBX,
        use_anim=True,          # keep animations
        ignore_leaf_bones=False,
        automatic_bone_orientation=True,
    )
    log(f"Import complete — {len(bpy.data.objects)} objects in scene")

    # ── Resize textures ───────────────────────────
    log("Resizing textures ...")
    resize_images(MAX_TEX_SIZE)

    # ── Optimise every mesh object ────────────────
    mesh_objects = [o for o in bpy.data.objects if o.type == 'MESH']
    log(f"Found {len(mesh_objects)} mesh object(s) to optimise")

    for obj in mesh_objects:
        bpy.ops.object.select_all(action='DESELECT')
        optimize_mesh(obj)

    # ── Export GLB with Draco compression ─────────
    log(f"Exporting → {OUTPUT_GLB}")
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB,
        export_format='GLB',
        # Geometry
        export_apply=True,
        # Draco compression (key for file size)
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,    # 0=fast, 10=smallest
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
        # Animations — keep everything Meshy gave us
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_anim_single_armature=True,
        # Materials / textures
        export_materials='EXPORT',
        export_image_format='AUTO',
        export_jpeg_quality=85,
        # Lighting
        export_lights=False,
        # Cameras
        export_cameras=False,
    )

    size_mb = os.path.getsize(OUTPUT_GLB) / 1_048_576
    log(f"Done! Output: {OUTPUT_GLB} ({size_mb:.1f} MB)")
    log("")
    log("NEXT: Open the GLB in https://gltf.report/ or Blender to review quality.")
    log("      If detail loss is visible, increase DECIMATE_RATIO (e.g. 0.4).")
    log("      If file is still too large, decrease DECIMATE_RATIO (e.g. 0.15).")


main()
