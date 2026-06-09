"""Run with: blender --background --python install_blender_mcp_addon.py"""
import bpy, os, sys

ADDON_PATH = r"C:\Users\user\OneDrive\Desktop\Contradiction of S AR project\contradiction-of-s-ar\scripts\blender_mcp_addon.py"

print("[installer] Installing BlenderMCP addon ...")
bpy.ops.preferences.addon_install(filepath=ADDON_PATH, overwrite=True)

# The addon module name (derived from filename without .py)
module = "blender_mcp_addon"

bpy.ops.preferences.addon_enable(module=module)
bpy.ops.wm.save_userpref()

enabled = module in bpy.context.preferences.addons
print(f"[installer] Addon enabled: {enabled}")
if not enabled:
    print("[installer] WARNING: addon may use a different internal name. Check Blender GUI.")
    sys.exit(1)
print("[installer] Done. Preferences saved.")
