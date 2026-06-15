/* archive-cloud.js — Pain Archive Garden
 *
 * Renders gesture traces as vertebral chain forms arranged in a
 * golden-angle phyllotaxis garden. Three material layers per trace:
 *   1. Vertebral tube  — procedural bone texture, X-ray tonal palette
 *   2. Titanium rod    — thin metallic thread through centre
 *   3. Brace contour   — wide ghost-plastic outer shell (when movement was smooth)
 *
 * visual_params stored in each Supabase row controls how each trace renders:
 *   vertebraCount   → texture repeat (density of vertebra-disc pattern)
 *   tubeRadius      → tube radius (movement amplitude)
 *   titaniumOpacity → rod opacity (repetition / load-bearing use)
 *   braceOpacity    → contour opacity (smoothness of the gesture)
 *   orientation     → chain axis (vertical for standing, horizontal for floor)
 */
import * as THREE from 'three';

const GOLDEN   = Math.PI * (3 - Math.sqrt(5)); // ~137.5°, sunflower angle
const MAX_R    = 2.2;
const MAX_TRAC = 200;

/* ── One procedural vertebra texture per trace (CanvasTexture) ─────────────
 * U axis: dark disc gap → bright vertebral body → dark disc gap
 * V axis: bright at centre V (front face), dark at V edges (side)
 * Setting texture.repeat.set(vertebraCount, 1) produces N vertebrae along tube.
 */
function buildVertebraTexture(vertebraCount) {
  const W = 512, H = 64;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Black base
  ctx.fillStyle = 'rgb(4,9,16)';
  ctx.fillRect(0, 0, W, H);

  // Horizontal gradient: disc gap (dark) → vertebral body (bright) → disc gap (dark)
  const hg = ctx.createLinearGradient(0, 0, W, 0);
  hg.addColorStop(0,    'rgba(4,9,16,1)');
  hg.addColorStop(0.13, 'rgba(55,92,122,0.68)');
  hg.addColorStop(0.27, 'rgba(148,195,218,0.88)');
  hg.addColorStop(0.50, 'rgba(185,220,238,1)');
  hg.addColorStop(0.73, 'rgba(148,195,218,0.88)');
  hg.addColorStop(0.87, 'rgba(55,92,122,0.68)');
  hg.addColorStop(1,    'rgba(4,9,16,1)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, W, H);

  // Vertical darkening: brighter at centre V (front of tube), darker at edges
  const vg = ctx.createLinearGradient(0, 0, 0, H);
  vg.addColorStop(0,    'rgba(0,0,0,0.78)');
  vg.addColorStop(0.26, 'rgba(0,0,0,0.16)');
  vg.addColorStop(0.50, 'rgba(0,0,0,0)');
  vg.addColorStop(0.74, 'rgba(0,0,0,0.16)');
  vg.addColorStop(1,    'rgba(0,0,0,0.78)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(vertebraCount, 1);
  return tex;
}

export function initGarden(canvas, options = {}) {

  /* ── X-ray texture (async load; procedural fallback while loading) ──────── */
  let   baseXray    = null;          // set when TextureLoader finishes
  const allBoneMats = [];            // { mat, vertebraCount } — for retroactive swap

  new THREE.TextureLoader().load(
    'assets/textures/xray-01.png',
    tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      baseXray = tex;
      // Swap procedural placeholder for real X-ray in every existing bone material
      allBoneMats.forEach(({ mat, vertebraCount }) => {
        const t = baseXray.clone();
        t.wrapS = THREE.RepeatWrapping;
        t.repeat.set(vertebraCount, 1);
        t.needsUpdate = true;
        mat.map     = t;
        mat.alphaMap = t;
        mat.needsUpdate = true;
      });
    },
    undefined,
    () => { /* texture load failed — procedural fallback remains */ }
  );

  /* ── Renderer ──────────────────────────────────────────────────────────── */
  const W   = canvas.offsetWidth  || window.innerWidth;
  const H   = canvas.offsetHeight || window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha:     !options.opaque,
    antialias: true,
  });
  renderer.setPixelRatio(dpr);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace    = THREE.SRGBColorSpace;
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  if (options.opaque) {
    renderer.setClearColor(0x060A0E, 1);
  } else {
    renderer.setClearColor(0x000000, 0);
  }

  /* ── Scene & camera ────────────────────────────────────────────────────── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.01, 100);
  camera.position.set(0, 0.30, 5.6);
  camera.lookAt(0, 0, 0);

  /* ── Lighting — cool X-ray palette ─────────────────────────────────────── */
  // Very low ambient so the emissive material glow is the primary light source
  scene.add(new THREE.AmbientLight(0x0A1520, 0.4));

  // Cool blue-grey key — like clinical fluorescent
  const key = new THREE.DirectionalLight(0xB8CDD8, 1.0);
  key.position.set(1.5, 3, 2.5);
  scene.add(key);

  // Cold fill from left-low — film shadow fill
  const fill = new THREE.DirectionalLight(0x6080A0, 0.28);
  fill.position.set(-2.5, -1, 1.5);
  scene.add(fill);

  // Faint warm rim — aged archive warmth from behind
  const rim = new THREE.DirectionalLight(0xD4C8AA, 0.14);
  rim.position.set(0, -2, -2.5);
  scene.add(rim);

  /* ── Garden group — slight forward lean, like a standing spine ──────────── */
  const gardenGroup = new THREE.Group();
  gardenGroup.rotation.x = -0.18;
  scene.add(gardenGroup);

  /* ── State ─────────────────────────────────────────────────────────────── */
  const ribbons    = [];  // see _addToGarden for structure
  let   traceCount = 0;

  // Optionally highlight a specific trace (from gesture → ar.html?trace=id)
  const highlightId = options.highlightTraceId || null;

  /* ── Build one trace group from a Supabase row ─────────────────────────── */
  function _buildTrace(trace) {
    const allPts = (trace.strokes || []).flat();
    if (allPts.length < 4) return null;

    // Downsample to ≤ 120 pts for GPU efficiency
    const step    = Math.max(1, Math.floor(allPts.length / 120));
    const sampled = allPts.filter((_, i) => i % step === 0);
    if (sampled.length < 4) return null;

    // Read per-trace visual params (or defaults for legacy traces)
    const vp = trace.visual_params || {};
    const vertebraCount  = vp.vertebraCount  || 12;
    const tubeRadius     = vp.tubeRadius     || 0.034;
    const titaniumOp     = vp.titaniumOpacity || 0.40;
    const braceOp        = vp.braceOpacity   || 0.055;
    const orientation    = vp.orientation    || 'vertical';

    // Map normalised [0–1] coords to 3D space.
    // Horizontal traces (lying-down exercises) rotate the primary axis.
    const pts3D = sampled.map((p, i) => {
      const u = (p.x - 0.5) * 2.6;
      const v = -(p.y - 0.5) * 2.6;
      // Subtle Z sine wave gives depth, not just a flat silhouette
      const z = Math.sin((i / sampled.length) * Math.PI * 3.5) * 0.10;
      return orientation === 'horizontal'
        ? new THREE.Vector3(u, z, v)    // horizontal chain: Y stays shallow
        : new THREE.Vector3(u, v, z);
    });

    const curve = new THREE.CatmullRomCurve3(pts3D, false, 'catmullrom', 0.5);
    const segs  = Math.min(sampled.length * 3, 280);

    /* ── Layer 1: Vertebral tube — X-ray texture if loaded, else procedural ── */
    let boneTex;
    if (baseXray) {
      boneTex = baseXray.clone();
      boneTex.wrapS = THREE.RepeatWrapping;
      boneTex.repeat.set(vertebraCount, 1);
      boneTex.needsUpdate = true;
    } else {
      boneTex = buildVertebraTexture(vertebraCount);
    }
    const boneGeo = new THREE.TubeGeometry(curve, segs, tubeRadius, 10, false);
    const boneMat = new THREE.MeshStandardMaterial({
      map:              boneTex,
      alphaMap:         boneTex,
      alphaTest:        0.04,
      transparent:      true,
      opacity:          0,              // fades in via update()
      roughness:        0.55,
      metalness:        0.06,
      emissive:         new THREE.Color(0x4A7A9A),
      emissiveIntensity: 0.22,
      side:             THREE.DoubleSide,
      depthWrite:       false,
    });
    const boneMesh = new THREE.Mesh(boneGeo, boneMat);

    /* ── Layer 2: Titanium rod (thin metallic thread through centre) ────── */
    const rodRadius = Math.max(tubeRadius * 0.18, 0.006);
    const rodGeo    = new THREE.TubeGeometry(curve, segs, rodRadius, 4, false);
    const rodMat    = new THREE.MeshStandardMaterial({
      color:    new THREE.Color(0xB2BED0),
      metalness: 0.92,
      roughness: 0.08,
      emissive:  new THREE.Color(0x7090AA),
      emissiveIntensity: 0.35,
      transparent: true,
      opacity:   titaniumOp,
      depthWrite: false,
    });
    const rodMesh = new THREE.Mesh(rodGeo, rodMat);

    /* ── Layer 3: Brace contour (wide ghost-plastic outer shell) ────────── */
    // Only rendered at meaningful opacity if movement was smooth
    const braceGeo = new THREE.TubeGeometry(curve, segs, tubeRadius * 2.1, 8, false);
    const braceMat = new THREE.MeshStandardMaterial({
      color:     new THREE.Color(0xEEEAE6),
      roughness: 0.88,
      metalness: 0.02,
      transparent: true,
      opacity:   braceOp,
      side:      THREE.DoubleSide,
      depthWrite: false,
    });
    const braceMesh = new THREE.Mesh(braceGeo, braceMat);

    // Register for retroactive X-ray texture swap (if texture hasn't loaded yet)
    if (!baseXray) allBoneMats.push({ mat: boneMat, vertebraCount });

    // Group all three layers
    const group = new THREE.Group();
    group.add(braceMesh);   // widest first (back)
    group.add(boneMesh);    // bone middle
    group.add(rodMesh);     // rod on top (front)

    return { group, boneMat, rodMat, braceMat, boneTex };
  }

  /* ── Golden-angle phyllotaxis layout ────────────────────────────────────── */
  function _layout() {
    const N = ribbons.length;
    if (N === 0) return;
    ribbons.forEach((r, i) => {
      // i=0 is newest (center), i=N-1 is oldest (outer edge)
      const frac   = N > 1 ? i / (N - 1) : 0;
      const radius = frac * MAX_R;
      const angle  = i * GOLDEN;
      r.targetX = Math.cos(angle) * radius;
      r.targetZ = Math.sin(angle) * radius;
      r.baseY   = -frac * 0.38;   // older traces sink slightly
    });
  }

  function _addToGarden(trace, isHighlighted) {
    const result = _buildTrace(trace);
    if (!result) return;

    const { group, boneMat, rodMat, braceMat, boneTex } = result;
    gardenGroup.add(group);
    group.position.set(0, 0, 0);

    const entry = {
      group,
      boneMat, rodMat, braceMat, boneTex,
      baseY:       0,
      targetX:     0,
      targetZ:     0,
      phaseOffset: ribbons.length * 0.53,
      opacity:     0,
      isHighlighted,
    };

    // Highlighted trace (visitor's own just-saved gesture) starts fully visible
    if (isHighlighted) {
      entry.opacity  = 1;
      boneMat.opacity  = 1;
      // Give it a brief emissive pulse — tiny extra glow
      boneMat.emissiveIntensity = 0.45;
      setTimeout(() => { boneMat.emissiveIntensity = 0.22; }, 3000);
    }

    ribbons.unshift(entry);
  }

  /* ── Public: load initial batch ─────────────────────────────────────────── */
  function loadBatch(traces) {
    traces.forEach(trace => {
      const isHighlighted = highlightId && trace.id === highlightId;
      _addToGarden(trace, isHighlighted);
    });
    _layout();
    traceCount = ribbons.length;
    if (options.onTraceAdded) options.onTraceAdded(traceCount);
  }

  /* ── Public: add single trace (realtime insert) ──────────────────────────── */
  function addTrace(trace) {
    const isHighlighted = highlightId && trace.id === highlightId;
    _addToGarden(trace, isHighlighted);
    traceCount++;

    if (ribbons.length > MAX_TRAC) {
      const oldest = ribbons.pop();
      _fadeRemove(oldest);
    }

    _layout();
    if (options.onTraceAdded) options.onTraceAdded(traceCount);
  }

  function _fadeRemove(r) {
    let op = r.opacity;
    function step() {
      op -= 0.016;
      if (op > 0) {
        r.boneMat.opacity = Math.max(0, op);
        requestAnimationFrame(step);
      } else {
        gardenGroup.remove(r.group);
        [r.boneMat, r.rodMat, r.braceMat, r.boneTex].forEach(x => { if (x) x.dispose(); });
        r.group.traverse(c => { if (c.geometry) c.geometry.dispose(); });
      }
    }
    requestAnimationFrame(step);
  }

  /* ── Device orientation parallax ────────────────────────────────────────── */
  let targetCamX = 0;
  let targetCamY = 0.30;

  function setOrientation(gammaRad, betaRad) {
    targetCamX = Math.max(-0.75, Math.min(0.75, gammaRad * 0.65));
    targetCamY = Math.max(-0.12, Math.min(0.85, 0.30 - (betaRad - 0.9) * 0.20));
  }

  /* ── Per-frame update ───────────────────────────────────────────────────── */
  let clock = 0;

  function update(dt) {
    clock += dt;

    // Slow auto-rotation of whole garden
    gardenGroup.rotation.y += 0.00042;

    // Smooth camera parallax toward device orientation target
    camera.position.x += (targetCamX - camera.position.x) * 0.038;
    camera.position.y += (targetCamY - camera.position.y) * 0.038;
    camera.lookAt(0, 0, 0);

    const n = ribbons.length;
    for (let i = 0; i < n; i++) {
      const r = ribbons[i];

      // Fade in bone layer (rod + brace have fixed opacity from visual_params)
      if (r.opacity < 0.90) {
        r.opacity = Math.min(0.90, r.opacity + 0.011);
        r.boneMat.opacity = r.opacity;
      }

      // Shared breathing — 0.32 Hz sine, staggered phase per ribbon
      const breathY = Math.sin(clock * 0.32 * Math.PI * 2 + r.phaseOffset) * 0.036;
      r.group.position.y = r.baseY + breathY;

      // Smooth drift toward phyllotaxis target position
      r.group.position.x += (r.targetX - r.group.position.x) * 0.030;
      r.group.position.z += (r.targetZ - r.group.position.z) * 0.030;
    }

    renderer.render(scene, camera);
  }

  /* ── Resize ────────────────────────────────────────────────────────────── */
  function resize() {
    const nW = canvas.offsetWidth  || window.innerWidth;
    const nH = canvas.offsetHeight || window.innerHeight;
    renderer.setSize(nW, nH, false);
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
  }

  /* ── Destroy ─────────────────────────────────────────────────────────────── */
  function destroy() {
    cancelAnimationFrame(0);
    ribbons.forEach(r => {
      gardenGroup.remove(r.group);
      [r.boneMat, r.rodMat, r.braceMat, r.boneTex].forEach(x => { if (x) x.dispose(); });
      r.group.traverse(c => { if (c.geometry) c.geometry.dispose(); });
    });
    renderer.dispose();
  }

  return { loadBatch, addTrace, update, setOrientation, resize, destroy };
}
