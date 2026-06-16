/* archive-cloud.js â€” Pain Archive Garden
 *
 * Two rendering paths:
 *   A. Skeleton stills (Approach E) â€” traces with `skeletons` field:
 *      Stacked ghost body poses, oldest faintest â†’ newest brightest.
 *      Additive blending so dense/repeated positions glow brighter.
 *   B. Legacy vertebral tube â€” traces without `skeletons` field:
 *      TubeGeometry with procedural bone texture, titanium rod, brace contour.
 *
 * Garden layout: golden-angle phyllotaxis, slow rotation, shared breathing.
 */
import * as THREE from 'three';
import { loadCustomSkel } from './custom-skel-draw.js?v=12';

const GOLDEN   = Math.PI * (3 - Math.sqrt(5)); // ~137.5Â°, sunflower angle
const MAX_R    = 2.0;
const MAX_TRAC = 200;

/* â”€â”€ MoveNet 17-keypoint connections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SKEL_CONN = [
  [0,1],[0,2],[1,3],[2,4],
  [5,7],[7,9],[6,8],[8,10],
  [5,6],[5,11],[6,12],[11,12],
  [11,13],[13,15],[12,14],[14,16],
];
const SKEL_SCORE    = 0.20;  // minimum keypoint confidence
const RENDER_FRAMES = 12;    // ghost poses shown per trace (sampled from up to 50 stored)

/* â”€â”€ Procedural vertebra texture (legacy traces only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function buildVertebraTexture(vertebraCount) {
  const W = 512, H = 64;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  ctx.fillStyle = 'rgb(4,9,16)';
  ctx.fillRect(0, 0, W, H);

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

export async function initGarden(canvas, options = {}) {

  /* â”€â”€ Load custom skeleton assets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   * Loaded once here â€” all _buildSkeletonTrace calls share this instance.
   * Falls back gracefully to line renderer if load fails.
   * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let customSkel = null;
  try {
    customSkel = await loadCustomSkel('assets/skel/');
  } catch (e) {
    console.warn('[archive] Custom skeleton assets failed to load, using line fallback:', e.message);
  }

  /* â”€â”€ X-ray texture (async; swapped into legacy tube materials when ready) â”€â”€ */
  let   baseXray    = null;
  const allBoneMats = [];

  new THREE.TextureLoader().load(
    'assets/textures/xray-01.png',
    tex => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      baseXray = tex;
      allBoneMats.forEach(({ mat, vertebraCount }) => {
        const t = baseXray.clone();
        t.wrapS = THREE.RepeatWrapping;
        t.repeat.set(vertebraCount, 1);
        t.needsUpdate = true;
        mat.map      = t;
        mat.alphaMap = t;
        mat.needsUpdate = true;
      });
    },
    undefined,
    () => {}
  );

  /* â”€â”€ Renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const W   = canvas.offsetWidth  || window.innerWidth;
  const H   = canvas.offsetHeight || window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha:                 !options.opaque,
    antialias:             true,
    preserveDrawingBuffer: true,   // required for screenshot capture
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

  /* â”€â”€ Scene & camera â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, W / H, 0.01, 100);
  camera.position.set(0, 2.0, 6.0);
  camera.lookAt(0, -0.5, 0);

  /* â”€â”€ Lighting â€” cool X-ray palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  scene.add(new THREE.AmbientLight(0x0A1520, 0.4));

  const key = new THREE.DirectionalLight(0xB8CDD8, 1.0);
  key.position.set(1.5, 3, 2.5);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x6080A0, 0.28);
  fill.position.set(-2.5, -1, 1.5);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xD4C8AA, 0.14);
  rim.position.set(0, -2, -2.5);
  scene.add(rim);

  /* â”€â”€ Garden group â€” lean forward so bodies appear to stand on floor â”€â”€â”€â”€â”€â”€â”€â”€ */
  const gardenGroup = new THREE.Group();
  gardenGroup.rotation.x = -0.50;
  gardenGroup.position.y = -2.5;
  scene.add(gardenGroup);

  /* â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const ribbons    = [];
  let   traceCount = 0;
  const highlightId = options.highlightTraceId || null;
  const _debug = { skelCount: 0, legacyCount: 0, lastSkelFrames: 0 };

  /* â”€â”€ Path A: skeleton â€” custom-drawn PNG assets, camera-facing Sprite â”€â”€â”€
   * Uses THREE.Sprite so the skeleton always faces the camera as the garden
   * rotates â€” no perspective distortion, no foreshortening.
   *
   * For the ANIM_SLOTS most-recent entries the canvas is redrawn each time
   * the playhead advances: current frame bright + short ghost trail.
   * Older entries settle into a single static pose, canvas updated once.
   *
   * Falls back to dark-red LineSegments if customSkel failed to load.
   * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const ANIM_SLOTS = 10;  // how many recent entries animate; rest settle

  /* â”€â”€ Soft radial vignette â€” fades petal/edge clipping gracefully â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function _applyVignette(ctx, CW, CH) {
    const grad = ctx.createRadialGradient(CW / 2, CH * 0.38, 0, CW / 2, CH * 0.38, CW * 0.64);
    grad.addColorStop(0.30, 'rgba(0,0,0,1)');   // fully opaque center
    grad.addColorStop(1.00, 'rgba(0,0,0,0)');   // transparent at edge
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);
    ctx.globalCompositeOperation = 'source-over';
  }

  function _buildSkeletonTrace(trace, frames) {
    const N = frames.length;

    // Evenly sample RENDER_FRAMES from the recorded snapshots
    const renderFrames = [];
    for (let i = 0; i < RENDER_FRAMES; i++) {
      const idx = Math.round(i * (N - 1) / (RENDER_FRAMES - 1));
      renderFrames.push(frames[Math.min(idx, N - 1)]);
    }

    // â”€â”€ Root-anchor: compute translation from first frame so body stays
    // spatially fixed during replay â€” only limb movement is visible.
    let anchorDX = 0, anchorDY = 0;
    if (renderFrames.length > 0) {
      const fk = renderFrames[0].kp;
      const lSh = fk[5], rSh = fk[6], lHip = fk[11], rHip = fk[12];
      const shOk  = lSh  && rSh  && (lSh.s  ?? 0) > 0.15 && (rSh.s  ?? 0) > 0.15;
      const hipOk = lHip && rHip && (lHip.s ?? 0) > 0.15 && (rHip.s ?? 0) > 0.15;
      const refX = shOk  ? (lSh.x + rSh.x) / 2 : 0.50;
      const refY = hipOk ? (lHip.y + rHip.y) / 2
                         : (shOk ? (lSh.y + rSh.y) / 2 + 0.14 : 0.60);
      anchorDX = 0.50 - refX;         // centre body horizontally
      anchorDY = 0.60 - refY;         // place hip/waist at 60% canvas height
    }
    const skelFrames = renderFrames.map(frame => ({
      kp: frame.kp.map(kp => ({
        ...kp,
        x: kp.x + anchorDX,
        y: kp.y + anchorDY,
      })),
    }));

    // Per-contributor seed â€” offsets petal drift so each entry looks distinct
    let seed = 0;
    if (trace.id) {
      for (let i = 0; i < Math.min(trace.id.length, 8); i++) {
        seed = seed * 31 + trace.id.charCodeAt(i);
      }
    }

    if (customSkel) {
      /* â”€â”€ Sprite + CanvasTexture path â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
      const CW = 256, CH = 320;   // portrait canvas â€” 4:5 ratio
      const oc  = document.createElement('canvas');
      oc.width  = CW; oc.height = CH;
      const octx = oc.getContext('2d');

      // Initial draw: middle frame as a settled pose (updated later in update())
      const midFrame = skelFrames[Math.floor(skelFrames.length / 2)];
      customSkel.draw(octx, midFrame.kp, CW, CH, 0.68, seed, 0);

      const tex = new THREE.CanvasTexture(oc);

      // Sprite always faces the camera â€” no perspective distortion as garden rotates
      const spriteMat = new THREE.SpriteMaterial({
        map:        tex,
        transparent: true,
        opacity:     0,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(1.10, 1.38, 1.0);   // portrait proportions — sized to stay within frustum

      const group = new THREE.Group();
      group.add(sprite);

      return {
        group,
        materials:   [{ mat: spriteMat, targetAlpha: 0.80 }],
        boneTex:     tex,
        isLegacy:    false,
        skelFrames,
        skelCanvas:  oc,
        skelCtx:     octx,
        skelSeed:    seed,
      };
    }

    /* â”€â”€ Fallback: dark-red LineSegments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
    const group     = new THREE.Group();
    const materials = [];
    const zSpread   = 0.055;

    renderFrames.forEach((frame, i) => {
      const t           = i / (RENDER_FRAMES - 1);
      const targetAlpha = 0.04 + t * 0.70;
      const zOffset     = (i - RENDER_FRAMES / 2) * zSpread;
      const positions   = [];

      SKEL_CONN.forEach(([a, b]) => {
        const ka = frame.kp[a], kb = frame.kp[b];
        if (!ka || !kb || ka.s < SKEL_SCORE || kb.s < SKEL_SCORE) return;
        positions.push(
          (ka.x - 0.5) * 2.6, -(ka.y - 0.5) * 2.6, zOffset,
          (kb.x - 0.5) * 2.6, -(kb.y - 0.5) * 2.6, zOffset,
        );
      });
      if (positions.length < 6) return;

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({
        color:       new THREE.Color(0x8B1212),
        transparent: true,
        opacity:     0,
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
      });
      group.add(new THREE.LineSegments(geo, mat));
      materials.push({ mat, targetAlpha, frameIdx: i });
    });

    if (materials.length === 0) return null;
    return { group, materials, boneTex: null, isLegacy: false };
  }

  /* â”€â”€ Path B: legacy TubeGeometry trace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   * Used for any row that does not have a `skeletons` field.
   * Kept intact so the existing archive remains visible.
   * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function _buildTubeTrace(trace) {
    const allPts = (trace.strokes || []).flat();
    if (allPts.length < 4) return null;

    const step    = Math.max(1, Math.floor(allPts.length / 120));
    const sampled = allPts.filter((_, i) => i % step === 0);
    if (sampled.length < 4) return null;

    const vp            = trace.visual_params || {};
    const vertebraCount  = vp.vertebraCount  || 12;
    const tubeRadius     = vp.tubeRadius     || 0.034;
    const titaniumOp     = vp.titaniumOpacity || 0.40;
    const braceOp        = vp.braceOpacity   || 0.055;
    const orientation    = vp.orientation    || 'vertical';

    const pts3D = sampled.map((p, i) => {
      const u = (p.x - 0.5) * 2.6;
      const v = -(p.y - 0.5) * 2.6;
      const z = Math.sin((i / sampled.length) * Math.PI * 3.5) * 0.10;
      return orientation === 'horizontal'
        ? new THREE.Vector3(u, z, v)
        : new THREE.Vector3(u, v, z);
    });

    const curve = new THREE.CatmullRomCurve3(pts3D, false, 'catmullrom', 0.5);
    const segs  = Math.min(sampled.length * 3, 280);

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
      map:               boneTex,
      alphaMap:          boneTex,
      alphaTest:         0.04,
      transparent:       true,
      opacity:           0,
      roughness:         0.55,
      metalness:         0.06,
      emissive:          new THREE.Color(0x4A7A9A),
      emissiveIntensity: 0.22,
      side:              THREE.DoubleSide,
      depthWrite:        false,
    });
    const boneMesh = new THREE.Mesh(boneGeo, boneMat);

    const rodRadius = Math.max(tubeRadius * 0.18, 0.006);
    const rodGeo    = new THREE.TubeGeometry(curve, segs, rodRadius, 4, false);
    const rodMat    = new THREE.MeshStandardMaterial({
      color:             new THREE.Color(0xB2BED0),
      metalness:         0.92,
      roughness:         0.08,
      emissive:          new THREE.Color(0x7090AA),
      emissiveIntensity: 0.35,
      transparent:       true,
      opacity:           titaniumOp,
      depthWrite:        false,
    });
    const rodMesh = new THREE.Mesh(rodGeo, rodMat);

    const braceGeo = new THREE.TubeGeometry(curve, segs, tubeRadius * 2.1, 8, false);
    const braceMat = new THREE.MeshStandardMaterial({
      color:       new THREE.Color(0xEEEAE6),
      roughness:   0.88,
      metalness:   0.02,
      transparent: true,
      opacity:     braceOp,
      side:        THREE.DoubleSide,
      depthWrite:  false,
    });
    const braceMesh = new THREE.Mesh(braceGeo, braceMat);

    if (!baseXray) allBoneMats.push({ mat: boneMat, vertebraCount });

    const group = new THREE.Group();
    group.add(braceMesh);
    group.add(boneMesh);
    group.add(rodMesh);

    const materials = [
      { mat: boneMat,  targetAlpha: 0.90 },
      { mat: rodMat,   targetAlpha: titaniumOp },
      { mat: braceMat, targetAlpha: braceOp },
    ];

    return { group, materials, boneTex, isLegacy: true };
  }

  /* â”€â”€ Route to skeleton or legacy renderer based on data available â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function _buildTrace(trace) {
    const skel = trace.skeletons;
    if (skel && Array.isArray(skel) && skel.length >= 3) {
      _debug.skelCount++;
      _debug.lastSkelFrames = skel.length;
      return _buildSkeletonTrace(trace, skel);
    }
    _debug.legacyCount++;
    if (!skel) {
      console.warn('[archive] LEGACY FALLBACK â€” trace', trace.id,
        'has no skeletons field. SQL fix: ALTER TABLE pain_traces ADD COLUMN IF NOT EXISTS skeletons jsonb;');
    } else {
      console.warn('[archive] LEGACY FALLBACK â€” trace', trace.id,
        'skeleton frames too few:', skel.length, '(need â‰¥ 3)');
    }
    return _buildTubeTrace(trace);
  }

  /* â”€â”€ Golden-angle phyllotaxis layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const MIN_R = 0.90;   // minimum radius — no figure ever stacks at the centre

  function _layout(instant = false) {
    const N = ribbons.length;
    if (N === 0) return;
    ribbons.forEach((r, i) => {
      // (i + 0.5) / N spreads N entries evenly with no entry at radius 0
      const frac   = (i + 0.5) / N;
      const radius = MIN_R + frac * (MAX_R - MIN_R);
      const angle  = i * GOLDEN;
      r.targetX = Math.max(-1.0, Math.min(1.0, Math.cos(angle) * radius));
      r.targetZ = Math.sin(angle) * radius;
      r.baseY   = (1 - (i + 0.5) / N) * 0.8;
      if (instant) {
        r.group.position.x = r.targetX;
        r.group.position.z = r.targetZ;
      }
    });
  }

  function _addToGarden(trace, isHighlighted) {
    const result = _buildTrace(trace);
    if (!result) return;

    const { group, materials, boneTex, isLegacy,
            skelFrames, skelCanvas, skelCtx, skelSeed } = result;
    gardenGroup.add(group);
    group.position.set(0, 0, 0);

    const entry = {
      group,
      materials,
      boneTex,
      isLegacy,
      baseY:          0,
      targetX:        0,
      targetZ:        0,
      phaseOffset:    ribbons.length * 0.53,
      opacity:        0,
      isHighlighted,
      playhead:       0,
      playRate:       3.5,
      skelFrames:     skelFrames  ?? null,
      skelCanvas:     skelCanvas  ?? null,
      skelCtx:        skelCtx     ?? null,
      skelSeed:       skelSeed    ?? 0,
      lastDrawnFrame: -1,
      skelSettled:    false,
    };

    if (isHighlighted) {
      entry.opacity = 1.0;
      materials.forEach(({ mat, targetAlpha }) => { mat.opacity = targetAlpha; });
      // Legacy-only: brief emissive pulse on the bone tube
      if (isLegacy && materials[0]) {
        const boneMat = materials[0].mat;
        boneMat.emissiveIntensity = 0.45;
        setTimeout(() => { boneMat.emissiveIntensity = 0.22; }, 3000);
      }
    }

    ribbons.unshift(entry);
  }

  /* â”€â”€ Public: load initial batch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function loadBatch(traces) {
    traces.forEach(trace => {
      _addToGarden(trace, !!(highlightId && trace.id === highlightId));
    });
    _layout(true);   // instant positioning â€” no drift on initial load
    traceCount = ribbons.length;
    if (options.onTraceAdded) options.onTraceAdded(traceCount);
  }

  /* â”€â”€ Public: add single trace (realtime insert) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function addTrace(trace) {
    _addToGarden(trace, !!(highlightId && trace.id === highlightId));
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
        r.materials.forEach(({ mat, targetAlpha }) => {
          mat.opacity = Math.max(0, op) * targetAlpha;
        });
        requestAnimationFrame(step);
      } else {
        gardenGroup.remove(r.group);
        r.materials.forEach(({ mat }) => mat.dispose());
        if (r.boneTex) r.boneTex.dispose();
        r.group.traverse(c => { if (c.geometry) c.geometry.dispose(); });
      }
    }
    requestAnimationFrame(step);
  }

  /* â”€â”€ Device orientation parallax â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let targetCamX = 0;
  let targetCamY = 2.0;

  function setOrientation(gammaRad, betaRad) {
    targetCamX = Math.max(-0.25, Math.min(0.25, gammaRad * 0.20));
    targetCamY = Math.max(1.7, Math.min(2.3, 2.0 - (betaRad - 0.9) * 0.20));
  }

  /* â”€â”€ Per-frame update â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let clock = 0;

  function update(dt) {
    clock += dt;

    // rotation off â€” garden is static

    camera.position.x += (targetCamX - camera.position.x) * 0.006;
    camera.position.y += (targetCamY - camera.position.y) * 0.006;
    camera.lookAt(0, -0.5, 0);

    const n = ribbons.length;
    for (let i = 0; i < n; i++) {
      const r = ribbons[i];

      // Fade in
      if (r.opacity < 1.0) {
        r.opacity = Math.min(1.0, r.opacity + 0.011);
      }

      // Apply opacity and animation per material type
      if (r.isLegacy) {
        // Legacy TubeGeometry: straight opacity scale
        r.materials.forEach(({ mat, targetAlpha }) => {
          mat.opacity = r.opacity * targetAlpha;
        });
      } else if (r.skelCanvas) {
        // Sprite + CanvasTexture path: animate canvas for recent entries
        r.materials[0].mat.opacity = r.opacity * r.materials[0].targetAlpha;

        const shouldAnimate = i < ANIM_SLOTS || r.isHighlighted;

        if (shouldAnimate && r.skelFrames) {
          const N = r.skelFrames.length;
          r.playhead = (r.playhead + dt * r.playRate) % N;
          const ph = Math.floor(r.playhead);

          // Redraw canvas only when the frame index changes (~3.5Ã— per second)
          if (ph !== r.lastDrawnFrame) {
            r.lastDrawnFrame = ph;
            const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
            r.skelCtx.clearRect(0, 0, CW, CH);

            // Short ghost trail: 3 frames fading behind the current one
            for (let t = 3; t >= 1; t--) {
              const idx = ((ph - t) + N * 3) % N;
              const a = 0.06 * Math.pow(0.52, t - 1);
              customSkel.draw(r.skelCtx, r.skelFrames[idx].kp, CW, CH, a, r.skelSeed, 0);
            }
            // Current frame: full presence, live petal drift using scene clock
            customSkel.draw(r.skelCtx, r.skelFrames[ph].kp, CW, CH, 0.86, r.skelSeed, clock);

            r.boneTex.needsUpdate = true;
          }
        } else if (!r.skelSettled && r.skelFrames) {
          // Settle: draw the middle frame once, then never touch the canvas again
          r.skelSettled = true;
          const midIdx = Math.floor(r.skelFrames.length / 2);
          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
          r.skelCtx.clearRect(0, 0, CW, CH);
          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].kp, CW, CH, 0.65, r.skelSeed, 0);
          r.boneTex.needsUpdate = true;
        }
      } else {
        // Line-segment fallback (when customSkel failed to load): animated playhead
        r.playhead = (r.playhead + dt * r.playRate) % RENDER_FRAMES;
        const ph = r.playhead;
        r.materials.forEach(({ mat, targetAlpha, frameIdx }) => {
          if (frameIdx === undefined) return;
          const dist = ((ph - frameIdx + RENDER_FRAMES) % RENDER_FRAMES);
          const factor =
            dist < 1 ? 1.00 :
            dist < 2 ? 0.52 :
            dist < 3 ? 0.22 :
            dist < 4 ? 0.07 : 0.03;
          mat.opacity = r.opacity * targetAlpha * factor;
        });
      }

      // No autonomous breathing â€” figures stand still
      r.group.position.y = r.baseY;

      // Settle quickly toward phyllotaxis target (fast lerp â€” no visible drift)
      r.group.position.x += (r.targetX - r.group.position.x) * 0.14;
      r.group.position.z += (r.targetZ - r.group.position.z) * 0.14;
    }

    renderer.render(scene, camera);
  }

  /* â”€â”€ Resize â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function resize() {
    const nW = canvas.offsetWidth  || window.innerWidth;
    const nH = canvas.offsetHeight || window.innerHeight;
    renderer.setSize(nW, nH, false);
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
  }

  /* â”€â”€ Destroy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function destroy() {
    cancelAnimationFrame(0);
    ribbons.forEach(r => {
      gardenGroup.remove(r.group);
      r.materials.forEach(({ mat }) => mat.dispose());
      if (r.boneTex) r.boneTex.dispose();
      r.group.traverse(c => { if (c.geometry) c.geometry.dispose(); });
    });
    renderer.dispose();
  }

  function renderNow() { renderer.render(scene, camera); }

  function getDebugInfo() { return { ..._debug }; }

  return { loadBatch, addTrace, update, setOrientation, resize, destroy, renderNow, getDebugInfo };
}



