# Contradiction of S — Bug & UX Audit Report

**Date:** 2026-06-27  
**Scope:** `web/` multi-page experience, `contradiction-of-s-ar/` standalone AR app, preprocessing pipeline, Node dev server, and shared assets.  
**Method:** Static code review with targeted verification of the highest-impact claims.

---

## 1. Project Vision (as understood from the code)

The Contradiction of S is a participatory archive about living with scoliosis. The experience has two overlapping builds:

1. **`web/`** — the primary, richer web app: home screen → gesture/drawing capture → shared 3D garden/archive → avatar/profile/community accessories.
2. **`contradiction-of-s-ar/`** — a standalone MindAR image-tracking app meant to be deployed to GitHub Pages, where visitors point a phone at printed cards beside physical sculptures.

Both builds share the same Supabase project (`oexbsffepplhhhzhyxpy.supabase.co`) and the same `pain_traces` table. The root `index.html` redirects to `web/index.html`.

The core user journey is: enter → contribute a movement/pain trace → see it join a collective "garden" of traces → optionally build an avatar/name/sticker identity and visit a community wall. Anything that breaks capture, saving, garden rendering, or navigation directly undermines the archive.

---

## 2. Critical Bugs (must fix before exhibition)

### C1. Smart-quote corruption breaks gesture saving, AR debug, and projection counter
**Symptom:** After recording a gesture, the saving/saved panels never appear and the Share/Download/Enter buttons do nothing. The AR debug overlay stays empty even with `?debug=1`. The projection screen counter stays `—`.

**Diagnosis:** Several `id` and `class` attributes use Unicode left/right double quotes (`"` / `"`) instead of ASCII `"`. Browsers do not terminate the attribute value correctly, so `document.getElementById('s-saving')`, `getElementById('adb-trace')`, `getElementById('proj-count')`, etc. return `null`.

Verified locations:
- `web/gesture.html:627` `<div id="g-eyebrow">`
- `web/gesture.html:650` `<div id="g-recording-note">`
- `web/gesture.html:670–689` `s-saving`, `s-saved`, `g-saving-text`, `g-saved-canvas`, `g-share-btn`, `g-download-btn`, `g-enter-btn`, etc.
- `web/ar.html:596–600` `adb-trace`, `adb-loaded`, `adb-skel`, `adb-legacy`, `adb-mode`
- `web/projection.html:248` `proj-count`

**Proposed solution:** Replace every curly quote in HTML attribute values with straight ASCII quotes across the three files. Add an HTML-lint step or `.editorconfig` rule to prevent smart-quote insertion.

---

### C2. Navigation is completely unavailable in landscape orientation
**Symptom:** Rotating a phone to landscape hides the bottom navigation bar on every page; users have no way to move between pages or exit immersive screens.

**Diagnosis:** `web/style.css:789–792`:
```css
@media (orientation: landscape) {
  .bottom-nav { display: none; }
}
```
No alternative navigation is provided.

**Proposed solution:** Remove the blanket `display: none`. If immersive pages need more canvas, shrink the nav, auto-hide it with a show-on-swipe/up affordance, or add a landscape-safe menu — but never leave zero navigation.

---

### C3. Missing `targets.mind` — standalone AR cannot track anything
**Symptom:** In `contradiction-of-s-ar/index.html`, the camera opens but pointing at a sculpture card does nothing; MindAR logs a 404 for `targets.mind`.

**Diagnosis:** `contradiction-of-s-ar/index.html:155` references `imageTargetSrc: targets.mind`, but the file does not exist in the folder. `SETUP.md` documents the compile step but it was never produced.

**Proposed solution:** Photograph the 4 physical sculptures, compile targets with the MindAR compiler, commit `contradiction-of-s-ar/targets.mind`, and add a pre-start message if the file is missing.

---

### C4. Avatar creator references a non-existent `Avatar assets/` directory
**Symptom:** `web/avatar.html` loads, but every body/face/hair/clothes thumbnail is a broken image; the creator is unusable.

**Diagnosis:** `web/js/app.js:174–175` defines:
```js
const FLAT_ROOT = '../Avatar assets/Flat face asymmetrical short body/';
const CIRC_ROOT = '../Avatar assets/Circular face symmetrical long body/';
```
No `Avatar assets/` directory exists in the repo. The project does contain `web/assets/skel/` and `Skeleton assets/`, but not at the paths the code expects.

**Proposed solution:** Either create the expected `Avatar assets/` folder structure and PNGs, or repoint `FLAT_ROOT`/`CIRC_ROOT` to the assets that actually exist. Add broken-image fallbacks so a missing asset does not leave the UI blank.

---

### C5. `web/js/name.js` calls missing `App` methods
**Symptom:** `name.html` loads a blank history list; Generate/Save buttons do nothing; console shows `TypeError: App.getNameHistory is not a function`.

**Diagnosis:** `web/js/name.js:90, 110, 122, 129, 137, 142` calls `App.getNameHistory`, `App.addNameToHistory`, and `App.toggleNameSaved`. None of these methods exist in `web/js/app.js`.

**Proposed solution:** Implement the three helpers in `app.js` using a `localStorage` key such as `cos_names`, or remove the history feature from `name.js` if it was intentionally cut.

---

### C6. `draw.js` reports success even when Supabase save fails
**Symptom:** On `draw.html`, the user sees "Contributed to the archive" and a ribbon preview, but the trace may never have been persisted.

**Diagnosis:** `web/js/draw.js:257–269` calls `done()` regardless of whether the Supabase insert succeeded or errored.

**Proposed solution:** Only call `done()` / dispatch `pain-trace-saved` when `!res.error`. In the error/exception branch, show a retryable error state instead of a success screen.

---

### C7. `web/server.js` allows directory traversal outside the project root
**Symptom:** When the dev server is running, crafted requests can read files above `web/` (e.g. `.env`, raw images/videos, `.claude/`, patch scripts).

**Diagnosis:** `web/server.js:27` builds `path.join(ROOT, '..', urlPath)` without sanitising `..` segments or verifying the resolved path stays inside the intended root.

**Proposed solution:** Remove the parent-directory shortcut and serve only `ROOT`. If cross-folder assets are genuinely needed, whitelist them explicitly and resolve + `startsWith(root)` before serving.

---

### C8. Supabase writes are unvalidated and client-side
**Symptom:** If Row-Level Security is not enabled or misconfigured on `pain_traces`, any visitor can read, insert, update, or delete every trace. Even with RLS, malformed traces (oversized payloads, NaN coordinates, arbitrary JSON) can enter the archive.

**Diagnosis:** The same anon/publishable key is embedded in `web/ar.html`, `web/js/gesture.js`, `web/js/draw.js`, `web/trace-export.html`, and `contradiction-of-s-ar/forum.html`. There is no server-side validation of stroke count, skeleton size, or schema.

**Proposed solution:**
- Enable strict RLS policies on `pain_traces`.
- Move inserts to a Supabase Edge Function or small proxy that validates payload shape, caps array lengths, rejects non-numeric coordinates, and rate-limits per client.
- Centralise the URL/key in a single `config.js` so rotation does not require touching five files.

---

### C9. PWA is non-functional: service worker is a kill-switch and never registered
**Symptom:** No offline support, no install prompt, and any previously cached version is wiped on load.

**Diagnosis:** `web/sw.js` only clears caches and unregisters itself. No page calls `navigator.serviceWorker.register('sw.js')`. `manifest.json` exists but is only linked from `install.html`, not from the entry page.

**Proposed solution:** Decide whether the exhibition needs offline caching. If yes, replace `sw.js` with a real cache-first/network-fallback strategy, register it from `index.html`/`ar.html`/`gesture.html`, and link `manifest.json` on every core page. If no, remove the PWA files so users are not misled.

---

### C10. Standalone AR GLB animations will not play
**Symptom:** Sculptures appear static in the MindAR scene even if the GLBs contain animations.

**Diagnosis:** `contradiction-of-s-ar/index.html:193` uses `animation-mixer="clip: *; loop: repeat; ..."`, but `animation-mixer` comes from `aframe-extras`, which is never loaded. Only `mindar-image-aframe.prod.js` is included.

**Proposed solution:** Load `aframe-extras` after A-Frame, or remove `animation-mixer` if the GLBs are meant to be static.

---

## 3. Major Bugs

### M1. Swipe navigation can accidentally exit recording/drawing and lose work
**Symptom:** A horizontal swipe during the 20-second gesture recording, while drawing a sticker, or during AR interaction navigates to another page and loses the current trace.

**Diagnosis:** `web/js/swipe-nav.js:34` checks `if (window._swipeNavLocked) return;`, but no page ever sets `_swipeNavLocked = true` during active use.

**Proposed solution:** Set `window._swipeNavLocked = true` while recording/reviewing/saving a gesture, while drawing a sticker, and during AR camera capture/drag. Clear it when the user returns to a safe state.

---

### M2. `transitions.js` is missing from most pages
**Symptom:** Pages such as Profile, Name, Avatar, Sticker, Draw, and Community navigate instantly with no shared fade/veil, creating a jarring, inconsistent feel.

**Diagnosis:** Only `web/index.html`, `web/gesture.html`, and `web/ar.html` include `<script src="js/transitions.js"></script>`.

**Proposed solution:** Include `transitions.js` in every page with internal links, or load it from `app.js` if it is safe to run everywhere.

---

### M3. `archive-cloud.js` `destroy()` cancels the wrong animation frame and leaks resources
**Symptom:** Navigating away from `ar.html` or `projection.html` leaves the render loop, WebGL context, and Supabase realtime channel running.

**Diagnosis:** `web/js/archive-cloud.js:953` calls `cancelAnimationFrame(0)` instead of the actual rAF id owned by the caller. There is no `channel.unsubscribe()` or `renderer.dispose()` on unload.

**Proposed solution:** Track the real `requestAnimationFrame` id, expose a `destroy()` that unsubscribes the realtime channel and disposes renderer/geometry/materials, and call it on `pagehide`/`beforeunload`.

---

### M4. Pinch-to-zoom direction is inverted in the garden
**Symptom:** Pinching out (spreading fingers) zooms away from the garden instead of toward it.

**Diagnosis:** `web/ar.html:1032` uses `_pinchCamZ0 * (_pinchDist0 / dist)`. As `dist` grows, the multiplier shrinks.

**Proposed solution:** Use `dist / _pinchDist0` so pinching out moves the camera closer.

---

### M5. Camera selection fails on laptops / defaults to unavailable rear camera
**Symptom:** On a laptop, the AR/gesture page shows "Camera access is required" even after permission is granted, because there is no rear camera.

**Diagnosis:** `web/ar.html:706` defaults to `currentFacing = 'environment'` and does not fall back to `'user'` on `OverconstrainedError`.

**Proposed solution:** Request `'user'` first (or `ideal: 'environment'`), and catch `OverconstrainedError` to fall back to the user camera. Apply the same fix to `web/js/gesture.js`/`web/ar.html` switch-camera logic.

---

### M6. `web/archive.html` redirects to `sticker.html`, orphaning the archive feature
**Symptom:** The route documented as the archive instead shows the sticker page. `web/js/archive.js` expects `#archive-feed`, `#compose-input`, etc. which exist nowhere it can run.

**Diagnosis:** `web/archive.html:5` is a meta-refresh redirect to `sticker.html`.

**Proposed solution:** Either restore a real `archive.html` that loads `archive.js` with the expected markup, or remove `archive.js` and rename the nav item to "sticker" if that is the intended destination.

---

### M7. Skeleton/trail overlay is misaligned with the camera feed
**Symptom:** In selfie mode the skeleton appears on the wrong side of the body; on many aspect ratios the skeleton/trail is offset because `object-fit: cover` crops the video.

**Diagnosis:** `web/js/gesture.js` maps keypoints 1:1 from video intrinsic resolution to canvas CSS size without mirroring or accounting for crop/letterbox.

**Proposed solution:** When `currentFacing === 'user'`, flip the overlay context. Compute the visible video rectangle for the current `object-fit: cover` layout and map MoveNet keypoints through that rectangle.

---

### M8. `web/ar.html` sculpture overlay uses placeholder metadata
**Symptom:** Launching `ar.html?s=1` shows generic titles/keywords ("Movement I", `adaptation`, `compression`, …) instead of the real sculpture titles.

**Diagnosis:** `web/ar.html:711–752` defines a hard-coded `SCULPTURES` object with placeholder data.

**Proposed solution:** Replace with the real sculpture names from `contradiction-of-s-ar/index.html:256–261` and align keywords with interview themes.

---

### M9. Memory leaks during garden updates and teardown
**Symptom:** Repeated visits or many realtime inserts cause GPU/CPU memory growth; old canvas textures and fading ribbons may not be released.

**Diagnosis:** `_fadeRemove` schedules its own uncancellable `requestAnimationFrame` chain; `destroy()` does not clear `allBoneMats` or stop active fade-outs.

**Proposed solution:** Store fade rAF ids on entries and cancel them in `destroy()`. Clear `allBoneMats`. In `loadBatch`, dispose existing ribbons before replacing them.

---

### M10. Heavy per-frame canvas redraw cost on mobile
**Symptom:** Low-end phones heat up or drop frames when many traces are visible.

**Diagnosis:** `web/js/archive-cloud.js` redraws up to `ANIM_SLOTS=12` full `384×960` skeleton canvases every frame and up to `BREATHE_SLOTS=50` sprites every ~4 frames.

**Proposed solution:** Cache the settled pose in an offscreen canvas and only animate the petal/star layer. Throttle animated slots on low-DPR devices and cap visible traces more aggressively than `MAX_TRAC=200`.

---

### M11. Avatar body-type switch destroys drawings and background
**Symptom:** A user who draws on the body/background, then taps Flat/Circular, loses all their marks.

**Diagnosis:** `web/js/avatar.js` `switchBodyType()` clears `dCtx` and `bgCtx` unconditionally.

**Proposed solution:** Preserve the drawing and background canvases across body-type changes, or show a confirmation before clearing.

---

### M12. Sticker eraser paints opaque off-white instead of transparency
**Symptom:** Saved stickers have a solid square background, which looks wrong when placed on the avatar.

**Diagnosis:** `web/js/sticker.js:184` fills with `#faf6ef`.

**Proposed solution:** Use `globalCompositeOperation = 'destination-out'` for the eraser.

---

## 4. Minor Bugs

### m1. Home intro replays on every visit
**File:** `web/index.html:506–528`  
**Fix:** Set a `localStorage` flag after the first play and skip/shorten the intro on subsequent visits. Add an explicit "Skip" tap target.

### m2. `App.highlightNav()` targets the wrong class
**File:** `web/js/app.js:53–59`  
**Fix:** Change `.nav-item` to `.nav-dot` and use an exact href match instead of `href.includes(page)`.

### m3. Bottom-nav labels and active states are inconsistent
**Files:** all pages with `.bottom-nav`  
**Fix:** Generate the nav from a shared template, deriving label and active dot from the current page path. Accessory pages currently all show "Home" with no active dot.

### m4. Three-dot nav cannot represent the full site
**Fix:** Add a "More / Menu" overflow or persistent back/home affordance for the 12+ pages.

### m5. `transitions.js` blocks Ctrl+click / middle-click
**File:** `web/js/transitions.js:22–28`  
**Fix:** Bail out if `e.ctrlKey`, `e.metaKey`, `e.shiftKey`, `e.button !== 0`, or the link has `target="_blank"`.

### m6. Home page loads all five figure images
**File:** `web/index.html:275–367`  
**Fix:** Use `loading="lazy"` on inactive variations or inject only the active one via JS.

### m7. Bottom-nav dots are tiny touch targets
**File:** `web/style.css:122–126`  
**Fix:** Increase the tap target to at least 44×44 px while keeping the visual dot small.

### m8. Camera switch uses `ideal` and may return the same feed
**Files:** `web/js/gesture.js:156–163`, `web/ar.html:826–829`  
**Fix:** Enumerate devices and select by `deviceId`, or use `exact: currentFacing` with a fallback.

### m9. Gesture camera stays active when the tab is hidden
**File:** `web/js/gesture.js`  
**Fix:** Add a `visibilitychange` handler that stops tracks when `document.hidden`.

### m10. `_posAtArc` can produce `NaN` coordinates
**File:** `web/js/archive-cloud.js:285–294`  
**Fix:** Guard against zero-length arc segments.

### m11. `draw.js` colour map ignores many avatar identity colours
**File:** `web/js/draw.js:63–82`  
**Fix:** Map every colour in `App.COLOURS` to the spinal palette, or persist and consume `palette_colour` in `archive-cloud.js`.

### m12. Inconsistent trace schema between capture paths
**Files:** `web/js/draw.js:244–249` vs `web/js/gesture.js:899–906`  
**Fix:** Unify the schema or make `archive-cloud.js` consume both `palette_colour` and `visual_params`.

### m13. `server.js` MIME map missing 3D/video/font/wasm types
**File:** `web/server.js:8–20`  
**Fix:** Add `.glb`, `.gltf`, `.mind`, `.mp4`, `.webm`, `.woff2`, `.wasm`, etc.

### m14. `manifest.json` has only an SVG icon
**Fix:** Generate 192×192 and 512×512 PNGs, add `purpose: "maskable"`, and add `<link rel="apple-touch-icon">` to core pages.

### m15. Review/saved canvas is low-resolution on Retina displays
**Files:** `web/js/gesture.js:659–660`, `:933–935`  
**Fix:** Scale canvas bitmaps by `devicePixelRatio`.

### m16. Loading screen suppresses real progress
**Files:** `web/gesture.html:795–800`, `web/js/gesture.js:91–100`  
**Fix:** Tie phase text to actual init milestones or show a real step counter.

### m17. `community.html` marks every card as `own-entry`
**File:** `web/community.html:326`  
**Fix:** Only apply `own-entry` when the entry matches the saved profile or carries an explicit `isOwn` flag.

### m18. Saved-state migration drops legacy `clothes` category
**File:** `web/js/avatar.js:103`  
**Fix:** Map `clothes` to `tops`/`bottoms` or warn the user.

### m19. Profile does not surface the saved location
**File:** `web/profile.html`  
**Fix:** Display the saved location or remove the field.

### m20. `preprocessing/package.json` has stale scripts and unused dependencies
**File:** `preprocessing/package.json`  
**Fix:** Remove `@imgly/background-removal-node` if unused, fix `allowScripts` sharp version mismatch, and add a real `process` script.

---

## 5. Infrastructure / Build / Deployment Issues

### I1. Two overlapping web builds with no clear public boundary
**Symptom:** Root `index.html` redirects to `web/`, but `SETUP.md` only documents deploying `contradiction-of-s-ar/` to GitHub Pages. Bookmarks/QR codes may point to the wrong build.

**Fix:** Choose a single public root for each deployment target. Rename `contradiction-of-s-ar/` to something like `ar/` if `web/` is primary, or merge the two. Update `SETUP.md` accordingly.

### I2. Hard-coded absolute Windows paths in scripts
**Files:** `contradiction-of-s-ar/scripts/optimize_fbx.py`, `install_blender_mcp_addon.py`, `serve.bat`, `preprocessing/preprocess.js`, `convert_title.py`  
**Fix:** Read paths from environment variables / CLI arguments / a config file. Detect `python` dynamically.

### I3. `SETUP.md` references non-existent Blender version
**File:** `contradiction-of-s-ar/SETUP.md`  
**Fix:** Update "Blender 5.1" to the actual tested version (current stable is 4.x).

### I4. `blender_mcp_addon.py` bundles third-party code and a hard-coded key
**File:** `contradiction-of-s-ar/scripts/blender_mcp_addon.py`  
**Fix:** Move third-party addons to `vendor/`, load them as dependencies, and make API keys configurable.

### I5. Patch scripts are brittle and modify source by line number
**Files:** `patch-archive.ps1`, `patch-archive-fix2.ps1`  
**Fix:** Delete them now that the fixes are in `archive-cloud.js`. Any future changes should be normal version-controlled edits with `node --check` verification.

### I6. No security headers / CSP
**File:** `web/server.js`  
**Fix:** Add a restrictive Content-Security-Policy, `X-Frame-Options: DENY`, `Referrer-Policy`, and a `Permissions-Policy` for camera/microphone.

### I7. No automated tests or linting
**Fix:** Add ESLint, an HTML validator, and smoke tests that instantiate `App` and check expected exports.

### I8. Cache-busting is inconsistent
**Fix:** Use content-hash filenames or a uniform build-time query string for all static assets.

---

## 6. Accessibility / UX Polish

- **A1.** Add `aria-live` status announcements for "target found/lost" in the standalone AR app and for recording state changes in `gesture.html`.
- **A2.** The garden `<canvas>` needs `role="img"`, an `aria-label`, and a visually-hidden live region for new traces.
- **A3.** Add reduced-motion support for the garden auto-rotation and figure sway.
- **A4.** `draw.html` input is pointer-only; add a keyboard drawing mode and visible focus styles.
- **A5.** Avatar layer handles are not keyboard or screen-reader accessible.
- **A6.** Profile save banner and intro tap hint should be announced via `aria-live`.

---

## 7. Verified Corrections to Agent Findings

- **Supabase projects are the same.** `web/`, `trace-export.html`, and `contradiction-of-s-ar/forum.html` all use `https://oexbsffepplhhhzhyxpy.supabase.co`. One agent reported two projects; this was incorrect.
- **GLB files are valid.** All four `sculpture-*.glb` files are valid glTF 2.0 binaries.
- **Smart quotes are real and present** in `web/gesture.html`, `web/ar.html`, and `web/projection.html`.

---

## 8. Recommended Fix Order for the Coding Team

1. **Fix smart-quote HTML corruption** in `gesture.html`, `ar.html`, `projection.html`.
2. **Restore or replace landscape navigation** in `style.css`.
3. **Provide or repoint avatar assets** so `avatar.html` is usable.
4. **Implement missing `App` name-history helpers** or cut the feature.
5. **Fix `draw.js` save success reporting** so failures do not show success.
6. **Sanitise `server.js`** to prevent directory traversal and add missing MIME types.
7. **Decide on PWA/offline strategy** and either implement real `sw.js` + manifest linkage or remove PWA files.
8. **Fix `archive-cloud.js` teardown** (real rAF id, channel unsubscribe, renderer dispose).
9. **Fix swipe-lock wiring** across gesture, sticker, and draw pages.
10. **Generate/commit `targets.mind`** and load `aframe-extras` in the standalone AR app.
11. **Unify navigation and transitions** across all 12+ pages.
12. **Address security (CSP, RLS, input validation)** before public deployment.

---

## 9. Quick Reference: Files Requiring Attention

| File | Why |
|------|-----|
| `web/gesture.html` | Smart-quote IDs break saving/saved UI |
| `web/ar.html` | Smart-quote debug IDs; placeholder sculpture data; camera fallback |
| `web/projection.html` | Smart-quote count ID |
| `web/style.css` | Landscape hides bottom nav |
| `web/js/app.js` | Missing name-history helpers; wrong nav selector; avatar asset roots |
| `web/js/avatar.js` | Body-type switch clears drawings; layer handles not keyboard accessible |
| `web/js/draw.js` | Reports success on Supabase failure; incomplete colour map |
| `web/js/gesture.js` | Camera stays active on tab hide; overlay misalignment; no swipe lock |
| `web/js/archive-cloud.js` | `destroy()` cancels wrong rAF; memory leaks; heavy per-frame redraw |
| `web/js/sticker.js` | Eraser is opaque; no orientation resize |
| `web/js/name.js` | Calls missing `App` methods |
| `web/js/transitions.js` | Blocks Ctrl+click; missing from most pages |
| `web/js/swipe-nav.js` | Never locked during active use |
| `web/server.js` | Directory traversal; missing MIME types; no security headers |
| `web/sw.js` | Kill-switch; never registered |
| `web/manifest.json` | Not linked from entry page; only SVG icon |
| `web/archive.html` | Redirects to sticker page |
| `contradiction-of-s-ar/index.html` | Missing `targets.mind`; `animation-mixer` without `aframe-extras` |
| `contradiction-of-s-ar/SETUP.md` | Wrong Blender version; missing FBX→GLB completion status |
| `patch-archive.ps1`, `patch-archive-fix2.ps1` | Brittle line-number patches; should be removed |
