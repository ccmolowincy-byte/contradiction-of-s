# Garden Mini-Planet — Build Plan

Status: locked direction · Date: 2026-06-27
Owner decisions: **large ground-dome** planet · fal.ai header fixed (restart pending)

This is the project-fit rewrite of the original AI task prompt, which was written
without knowledge of the real garden architecture. Read alongside
`GARDEN_ART_VISION_CONTRACT.md`.

## Architecture facts that reshape the original prompt

- Garden = transparent Three.js canvas (`web/garden.html` → `web/js/archive-cloud.js`)
  layered over a pluggable HTML backdrop (`web/js/garden-background.js`).
- Figures ("constellation skeletons") are **2D camera-facing `THREE.Sprite`s**, additive
  blending, depth-write off — NOT 3D meshes.
- Layout is **golden-angle phyllotaxis on a tilted near-flat disc** (`_layout()`),
  horizontal radius `MIN_R 0.90` → `adaptMaxR ~3.0–5.5`. The whole `gardenGroup` is
  tilted `rotation.x = -0.5`, dropped `position.y = -2.5`.
- Orbit = `gardenGroup.rotation.y`; zoom = camera Z (2.5–12). Anything parented to
  `gardenGroup` orbits + zooms WITH the figures (what we want for the planet).
- Lighting is cool/dim "X-ray" (ambient `0x0A1520`, key `0xB8CDD8`). A lush PBR planet
  needs an added warm top fill to read green.
- View API exists: `getViewState`/`setViewState`/`getZoom`/`setZoom`/`rotateBy`.
- No GLTFLoader in repo yet → must vendor `three/addons` GLTFLoader (vision contract:
  vendor deps for gallery Wi-Fi).
- Paths: there is **no `public/`**. Images → `web/assets/temp/`, model →
  `web/assets/models/sanctuary-planet.glb`.
- Exhibition perf target includes low-power Android (Dooge U11 pro). Ship a mobile GLB.

## STAGE 1 — 2D concept (Flux Pro: fal-ai/flux-pro/v1.1), 5 variations

BASE CONCEPT (lushness in the TOP THIRD, not half-and-half):

> A small spherical floating mini-planet, perfectly centered and isolated on a solid
> white background, even soft studio lighting, no cast shadow, single object only.
> The top third — the north cap — is a lush, serene botanical garden sanctuary: soft
> moss, fine grass, and a few smooth rounded garden stones cresting the pole and
> spilling just over its shoulder. Below a soft, irregular mossy treeline the lower
> two-thirds is barren, rugged grey moon-rock with deep craters. Gentle, reverent,
> dreamlike, tasteful. The green is confined to the top and must NOT reach the equator.

Append per variation, save to `web/assets/temp/` named by style:
1. **soft-matte** *(recommended fit)* — "Smooth matte finish, clean vector-like gradients, soft studio light, muted painterly palette."
2. **painterly** *(recommended fit)* — "Digital painting, gentle brushstrokes, storybook concept art, Ghibli-esque, reverent."
3. **low-poly** — "Minimalist low-poly faceted mesh, clean digital asset, soft flat shading."
4. **claymation** — "Tactile clay render, tilt-shift miniature diorama, handmade."
5. **photoreal** — "Hyper-realistic macro render, physical materials, subtle subsurface moss." (clashes most with the cool scene; most lighting work)

Note for image-to-3D: even-lit matte/painterly reconstruct cleaner than harsh photoreal
speculars. STOP after generating; Wincy picks one.

## STAGE 2 — Image → 3D (fal-ai/hunyuan-3d/v3.1/pro/image-to-3d)

- `enable_pbr: true`, `texture_resolution: 1024`.
- Save `web/assets/models/sanctuary-planet.glb`.
- ALSO produce a mobile variant: decimated mesh + 512 texture →
  `web/assets/models/sanctuary-planet-mobile.glb` (load on touch/low-power).

## STAGE 3 — Scene integration (LARGE GROUND-DOME)

- Vendor GLTFLoader → `web/vendor/`, add to importmap in `garden.html`.
- Load GLB in `archive-cloud.js`, add mesh to `gardenGroup` at origin.
- Planet radius **R ≈ adaptMaxR** so figures map onto the UPPER hemisphere.
- Replace flat `baseY = (1-frac)*0.8` with **spherical seating**: for a figure at
  horizontal radius ρ, sit it on the dome at `y = sqrt(max(0, R² − ρ²))` so inner
  figures crest the pole and outer figures approach the equator ("blooming out").
  Keep sway as a small bob along the surface normal.
- Orient green north pole up. Lower grey hemisphere hangs below the disc plane,
  mostly off-camera (camera `lookAt(0,-0.5,0)`).
- Add a warm top fill light so the green cap reads lush against the cool palette.
- Keep planet writing depth (occludes back figures); additive figures still glow over it.
- Planet inherits `gardenGroup` transform → orbits/zooms with figures for free.

## LATER ITERATION — dynamic .mov sky backdrop

- The video slot is already coded (`applyVideo`/`applyImage` + detection) but the
  entries were never added to the `BACKGROUNDS` array in `garden-background.js`.
  Finish it: add `{id:'video', needs:'video', src, apply:applyVideo}` etc., create
  `web/assets/garden-bg/`, appears in the picker beside Aurora/Void/Camera.
- ⚠️ Use **mp4 (H.264) + webm**, NOT .mov — .mov often fails on Android Chrome
  (exhibition is cross-device). Convert the existing `.mov` screen recording.
- Keyframe/pinch-zoom of the sky = add transform handling to the video element.

## Resume after restart

fal-ai MCP header was corrected in `~/.claude.json` (Authorization: Key id:secret).
After restarting Claude Code: confirm fal tools load, then run Stage 1.
