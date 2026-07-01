# Performance notes — exhibition tablet (handoff for body-tracking / garden / AR work)

**Status:** Recommendations only. The author of these notes worked the UI/UX + responsive layer and did **not** edit `gesture.js`, `archive-cloud.js`, `ar.html`, or the garden render loop (owned by the body-tracking/AR/garden work). These are the perf items that belong in those files.

## The target device and why it's tricky
The gallery's public device is a **cheap Android tablet (Unisoc T7200 SoC, 6GB RAM)** running the body-tracking → garden pipeline in Chrome, with a **non-native (lower-quality) camera feed**. Its bottleneck is **GPU fill-rate and RAM bandwidth**, not CPU core count.

**Static detection does NOT reliably flag it.** `navigator.deviceMemory` rounds up (6GB often reports `8`) and `hardwareConcurrency` is `8`, so a `mem<=4 || cores<=4` heuristic misses it. `window.COS_DEVICE.lowPower` (in `web/js/device.js`) will likely be **false** on this tablet. **Do not gate the heavy perf paths on `lowPower` alone** — use a runtime probe (below).

## A detection layer already exists: `window.COS_DEVICE`
Loaded via `web/js/device.js`. Useful fields:
- `renderScale` — pre-capped DPR for canvas/WebGL (`1.5` on low-power, else `min(dpr,2)`). Use this instead of raw `window.devicePixelRatio` when sizing canvas backing stores.
- `isTablet`, `isAndroid`, `isPhone`, `isIOS`, `reducedMotion`, `shouldAutoCamera()`.
- `<html>` gets `is-tablet`, `is-android`, `is-low-power`, etc. for CSS gating.

## Punch-list (in priority order)

### 1. Runtime FPS probe → live downgrade  ⟵ the important one
Measure actual frame rate in the garden/render loop over the first ~2s. If sustained FPS < ~24, drop to a "lite" tier:
- fewer garden particles / community traces rendered at once (cull oldest or off-screen),
- simpler shaders / no post-processing,
- lower internal render resolution.
This is the only signal that actually reflects this SoC. A static device check will not.

### 2. Cap canvas/WebGL backing resolution
Garden + pose overlay canvases should size their backing store with `COS_DEVICE.renderScale`, not raw `devicePixelRatio`. On a 2–3x-DPR tablet this alone cuts fill-rate ~40–55%.

### 3. Lower camera capture resolution on tablet/low-power
`web/js/gesture.js` requests `width:{ideal:1280}, height:{ideal:720}, frameRate:{ideal:30,max:30}` (around line 157). On `isTablet`/`isAndroid`/`lowPower`, request **640×480** (or 854×480). Pose detection cost scales with input pixels, and the non-native feed won't benefit from 720p anyway.

### 4. MoveNet model tier
If using MoveNet **Thunder**, switch to **Lightning** on tablet/low-power — markedly cheaper for a small accuracy cost that body-stretch gestures tolerate. Consider `tfjs-webgl` backend confirmed active (not CPU fallback) and log which backend initialized.

### 5. Pose-loop throttle
Don't run detection every rAF frame. Target ~15–20 detections/sec on tablet (`setTimeout`/frame-skip) and interpolate the garden between detections. Halves TF.js load with no visible difference.

### 6. Honest loading state during model init
TF.js + MoveNet warm-up is multi-second on this tablet. Show an explicit "Preparing…" state (the camera page owns this) so the slow feed never reads as frozen/broken to a gallery visitor. Tie success UI to actual model-ready, not a timer.

### 7. Avoid layout thrash from orientation changes
`ar.html` already debounces resize/orientationchange — mirror that pattern anywhere the garden re-inits on rotation, so a visitor rotating the tablet doesn't trigger repeated full re-inits.

## Already handled in the UI/UX layer (no action needed from you)
- First-screen decoration weight cut **2.8MB → 0.9MB** (`assets/stars/*`, `assets/home/enter.png`).
- Desktop/laptop now **skips auto-camera** and lands on the forum (`index.html` via `COS_DEVICE.isDesktop`).
- iOS `100dvh`, safe-area insets, landscape-nav, and tablet adaptive scale-up done in `style.css`.

## Flagged (not perf, but exhibition-blocking)
- `web/assets/home/figureN.png` (~9.5MB) are **unreferenced dead weight** — home uses the `.jpg` versions. Safe to remove from the deploy.
- `gesture.html` contains a debug panel marked *"remove before exhibition"*.
- `Avatar assets/` folder is **missing from the repo** (avatar creator 404s) — restore if avatar ships.
