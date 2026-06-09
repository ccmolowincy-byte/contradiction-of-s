# Contradiction of S — Setup Guide

## Where things stand right now

| Step | Status |
|------|--------|
| Project folder + AR web app (`index.html`) | Done |
| Blender optimization script | Done |
| Blender MCP connection | **To do (below)** |
| FBX → GLB conversion (4 models) | **To do** |
| Image targets (needs sculpture photos) | **To do** |
| GitHub account + repository | **To do** |
| GitHub Pages hosting | **To do** |

---

## Step 1 — Install Git

Needed for pushing to GitHub Pages.

1. Download from: https://git-scm.com/download/win
2. Run the installer (all defaults are fine)
3. Verify: open a new terminal and type `git --version`

---

## Step 2 — Set up Blender MCP

This lets Claude control Blender directly to process your 3D files.

### 2a. Install the Blender MCP addon

1. Go to: https://github.com/ahujasid/blender-mcp
2. Click **Code → Download ZIP**
3. Open Blender 5.1
4. Go to **Edit → Preferences → Add-ons → Install**
5. Select the downloaded ZIP → click **Install Add-on**
6. Enable the addon (tick the checkbox next to "Blender MCP")
7. The MCP panel appears in the **3D Viewport sidebar** (press N key)
8. Click **Start MCP Server** in that panel

### 2b. Connect Claude Code to Blender MCP

Add this to your Claude Code settings (open it via the Claude Code app settings or edit the file directly):

**File:** `C:\Users\user\.claude\settings.json`

Add under `"mcpServers"`:
```json
"blender": {
  "command": "blender-mcp",
  "args": []
}
```

*(The exact connection method depends on the version of the addon — check the README on the GitHub page for the current instructions.)*

---

## Step 3 — Optimise your FBX files (one at a time)

**Before MCP is set up**, you can run the script manually in Blender:

1. Open Blender 5.1
2. Go to the **Scripting** workspace (tab at the top)
3. Click **Open** → navigate to:
   `scripts/optimize_fbx.py`
4. Edit the **CONFIG** section at the top of the script:
   - Set `INPUT_FBX` to the FBX file you want to process
   - Set `OUTPUT_GLB` to the correct output path in `models/`
5. Click **▶ Run Script**
6. The GLB will appear in `models/` — check its size and visual quality

**Run 4 times total, changing the paths each time:**

| Run | INPUT_FBX filename | OUTPUT_GLB |
|-----|-------------------|------------|
| 1 | `...0 standing on star pedestal with crown.fbx` | `models/sculpture-01.glb` |
| 2 | `...1 with large hair bows and ribbons.fbx` | `models/sculpture-02.glb` |
| 3 | `...2 sitting in a bathtub.fbx` | `models/sculpture-03.glb` |
| 4 | `...4 standing behind surreal mirror frame.fbx` | `models/sculpture-04.glb` |

**Check quality** after each export at: https://gltf.report/ (drag and drop the GLB)

---

## Step 4 — Create image targets

1. Take a clear, well-lit photo of each physical sculpture (straight-on angle, good contrast)
2. Go to: https://hiukim.github.io/mind-ar-js-doc/tools/compile/
3. Upload all 4 photos — the page shows a quality score for each (aim for > 60%)
4. Download the compiled `targets.mind` file
5. Place it in the `contradiction-of-s-ar/` folder (same level as `index.html`)

**Tips for good target images:**
- Shoot in good lighting (even, no harsh shadows)
- Include background/context — the full scene, not just the sculpture cropped tight
- High contrast patterns work best (the MindAR tool shows you exactly which features it tracks)
- If a sculpture is a single pale colour, add a distinctive card/label near its base to supplement tracking

---

## Step 5 — GitHub Pages hosting

1. Create a free account at https://github.com
2. Create a new repository: **New → Repository name: `contradiction-of-s-ar`** → Public
3. In a terminal, navigate to the `contradiction-of-s-ar/` folder:
   ```
   cd "C:\Users\user\OneDrive\Desktop\Contradiction of S AR project\contradiction-of-s-ar"
   git init
   git add .
   git commit -m "Initial AR experience"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/contradiction-of-s-ar.git
   git push -u origin main
   ```
4. On GitHub: **Settings → Pages → Source: Deploy from branch → main → / (root) → Save**
5. Your site goes live at: `https://YOUR_USERNAME.github.io/contradiction-of-s-ar/`

---

## Step 6 — Generate QR codes

Once the GitHub Pages URL is live:

1. Go to https://qr.io or https://www.qr-code-generator.com (both free)
2. Paste your GitHub Pages URL
3. Download the QR code as PNG or SVG
4. Print one per sculpture (or one shared QR for all)

---

## Adjusting model scale in the AR experience

The models appear at `scale="0.15 0.15 0.15"` in `index.html` — this is a starting point. Once you have real GLBs and test on a phone, Claude can adjust the scale, position, and rotation for each sculpture individually.

---

## Questions / next steps

Tell Claude:
- The emotional quality you want for each sculpture's animation ("floating", "tense", "uncanny")
- Whether you have the physical sculptures already and can photograph them
- Any visual feedback after testing the GLBs
