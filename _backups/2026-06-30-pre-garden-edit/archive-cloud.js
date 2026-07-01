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
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';
import { loadCustomSkel } from './custom-skel-draw.js?v=16';

const GOLDEN   = Math.PI * (3 - Math.sqrt(5)); // ~137.5Â°, sunflower angle
const MAX_R    = 2.8;
const MAX_TRAC = 200;
// Motion-capture figure presentation: enlarge the constellation sprites and lift
// them off the dome so they read clearly above the (lowered) planet.
const FIGURE_SCALE = 2.0;   // global multiplier on sprite size
const FIGURE_LIFT  = 1.35;  // extra height (world units) added to every figure's seat

/* ── Sanctuary mini-planet (large ground-dome) ───────────────────────────────
 * A reconstructed 3D planet sits at the gardenGroup origin; the constellation
 * figures are seated onto its UPPER hemisphere so they arc over the green north
 * cap and orbit with the garden — this is the arrangement Wincy signed off on.
 * Knobs below are art-direction values, safe to tune live.
 *   radius   : dome radius; figures fill MIN_R…radius then seat at y=√(radius²−ρ²).
 *   rotX/Y/Z : orient the model so its green cap points to +Y (set via preview).
 *   footLift : fraction of sprite height to raise feet onto the surface.
 *   swayAmp  : vertical bob amplitude over the dome.
 * NOTE: a freshly PLANTED figure still blooms at the user's tap point and only
 * then eases up into its seat — its bloom origin is the tap, never the dome.
 */
const PLANET = {
  enabled:  true,
  radius:   3.4,
  visualScale: 1.45,
  rotX:     0,
  rotY:     0,
  rotZ:     0,
  footLift: 0.42,
  swayAmp:  0.16,
  desktopUrl: 'assets/models/sanctuary-planet.glb',        // 4K texture (PC)
  ipadUrl:    'assets/models/sanctuary-planet-ipad.glb',   // 2K texture (tablet/iPad)
  mobileUrl:  'assets/models/sanctuary-planet-mobile.glb', // 1K texture (low-power Android)
};

/* ── Aurora skysphere (360 panorama backdrop) ────────────────────────────────
 * The Hunyuan World equirectangular panorama on a big inverted sphere, centred
 * on the scene. Its Y-rotation is synced to gardenGroup.rotation.y each frame,
 * so the same left-drag / two-finger orbit that turns the constellations also
 * pans the sky. Only created when a caller opts in via `options.sky` (so the
 * AR camera page is never covered). Unlit + toneMapped:false so the painterly
 * colours read exactly as generated.
 *   parallax : 1 = sky turns 1:1 with the orbit; <1 lags it for a sense of depth.
 */
const SKY = {
  enabled:  true,
  url:      'assets/garden-bg/aurora-pano.jpg',
  radius:   60,
  fov:      84,
  parallax: 0.72,
  tiltX:    -0.10,
  yaw:      0.35,
  drift:    0.006,
};

const WORLD_THEMES = {
  aurora: {
    sky: SKY.url,
    planet: null,
  },
};

/* ── Starry lake — the north-pole cap (3D Gaussian splat) ─────────────────────
 * A reconstruction of the swim-page lake (its star-shaped island) seated on the
 * planet's +Y pole: lake surface + crystals point OUT, the hollow underside
 * tucks INTO the planet. Rendered as a splat via @mkkellogg/gaussian-splats-3d's
 * DropInViewer (added under planetMesh so it inherits the dome's tilt/orbit).
 * Placement values were tuned in web/_planet-lake.html against the live planet.
 *   scale    : XZ size as a fraction of planet DIAMETER.
 *   insetFrac: sink the seat into the pole (fraction of planet radius).
 *   riseFrac : lift the lake within its seat (fraction of planet radius).
 *   flip     : 180° about X so the hollow faces the planet.
 * lowPowerSkip keeps the heavy splat off weak devices until a lighter fallback
 * (baked mesh / point cloud) ships — see device priorities.
 */
const LAKE = {
  enabled:      true,
  url:          'assets/models/starry-lake.ply',
  scale:        0.12,    // small + subtle: the splat is single-sided, so a tiny cap hides the bare back
  atlasExtent:  0.95,
  insetFrac:    0.06,
  riseFrac:     0.0875,   // raised so the small cap crowns the pole instead of sinking in
  yaw:          0.0,
  flip:         true,
  lowPowerSkip: true,
};

const GRASS = {
  enabled: false,  // north-pole dynamic grass retired — replaced by the starry-lake cap
  count:   1800,
  capR:    1.18,
  height:  0.13,
  heightVariation: 0.10,
  width:   0.032,
  tipOffset: 0.030,
  lift:    -0.008,
  grassTexture: 'assets/garden-bg/three-grass-demo-grass.jpg',
  cloudTexture: 'assets/garden-bg/three-grass-demo-cloud.jpg',
};

const AURORA = {
  enabled: false,
  radius:  58,
  speed:   0.035,
  opacity: 0.55,
  stepsDesktop: 28,
  stepsMobile: 16,
  noiseOctavesDesktop: 4,
  noiseOctavesMobile: 3,
};

/* â”€â”€ MoveNet 17-keypoint connections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SKEL_CONN = [
  [0,1],[0,2],[1,3],[2,4],
  [5,7],[7,9],[6,8],[8,10],
  [5,6],[5,11],[6,12],[11,12],
  [11,13],[13,15],[12,14],[14,16],
];
const MP = {
  nose: 0,
  leftShoulder: 11, rightShoulder: 12,
  leftHip: 23, rightHip: 24,
};
const LEGACY = {
  nose: 0,
  leftShoulder: 5, rightShoulder: 6,
  leftHip: 11, rightHip: 12,
};
const SKEL_SCORE    = 0.20;  // minimum keypoint confidence
const RENDER_FRAMES = 12;    // ghost poses shown per trace (sampled from up to 50 stored)
const BLOOM_DURATION  = 7.5; // seconds the tissue-gold bloom persists on the user's own figure

/* ── Per-contributor identity system ──────────────────────────────────────
 * Each trace is permanently assigned a palette colour and a body scale
 * derived from a hash of its UUID. This makes every figure in the garden
 * visually distinct without any user choice.
 */
const SPINAL_PALETTE = [
  { bone: '#C8D8E0', petal: 'rgba(195,55,55,1)'  },  // Bone white
  { bone: '#4A8FAA', petal: 'rgba(30,85,135,1)'   },  // Scan blue
  { bone: '#C4A060', petal: 'rgba(185,140,50,1)'  },  // Tissue gold
  { bone: '#9BAAB8', petal: 'rgba(82,98,122,1)'   },  // Film grey
  { bone: '#B07878', petal: 'rgba(105,28,28,1)'   },  // Deep dark
  { bone: '#A8C0C0', petal: 'rgba(60,110,115,1)'  },  // Brace silver
];

const _SCALE_STEPS = [1.0, 0.82, 1.15, 0.90, 1.08, 0.76, 1.12, 0.95, 1.18, 0.84, 1.05, 0.88];

function _hashId(id, salt) {
  const s = (id || '') + (salt || '');
  let h = 0;
  for (let i = 0; i < Math.min(s.length, 12); i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function _pseudo(k) {
  const s = Math.sin(k * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

function _tracePalette(trace) {
  return SPINAL_PALETTE[_hashId(trace.id) % SPINAL_PALETTE.length];
}

function _traceScale(trace) {
  return _SCALE_STEPS[_hashId(trace.id, 'scale') % _SCALE_STEPS.length];
}

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
  const D = window.COS_DEVICE || {};
  const graphicsQuality = /^(low|high)$/.test(options.graphicsQuality || '') ? options.graphicsQuality : 'auto';
  const mobileGarden = !!(D.isTouch && !D.isDesktop);
  const lowPowerGarden = graphicsQuality === 'low' || (graphicsQuality === 'auto' && !!(D.lowPower || (mobileGarden && D.isAndroid)));
  const highGraphics = graphicsQuality === 'high';
  const maxTraces = lowPowerGarden ? 42 : mobileGarden && !highGraphics ? 64 : MAX_TRAC;

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
  const dprCap = lowPowerGarden ? 0.7 : mobileGarden && !highGraphics ? 0.85 : 1.2;
  const dpr = Math.min(window.devicePixelRatio || 1, dprCap);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha:     !options.opaque,
    antialias: false,
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
  const camera = new THREE.PerspectiveCamera(options.sky ? SKY.fov : 72, W / H, 0.01, 100);
  camera.position.set(0, 2.0, 5.5);
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
  // Lowered ~half a planet radius (planet + figures + lake drop together, rooting
  // preserved) so the assembly sits lower and the scene has headroom to breathe.
  gardenGroup.position.y = -2.5 - 0.5 * (PLANET.radius * PLANET.visualScale);
  scene.add(gardenGroup);
  const _debug = { skelCount: 0, legacyCount: 0, lastSkelFrames: 0, planetSurfaceY: null, grassBaseY: null, grassBladeCount: 0, grassAttempts: 0 };

  function buildNorthPoleGrass(surfaceSource) {
    // Ported from James Smyth's MIT-licensed three-grass-demo, with the field
    // sampled onto the loaded planet GLB surface instead of a flat plane.
    const bladeBudget = lowPowerGarden ? Math.floor(GRASS.count * 0.08) : mobileGarden && !highGraphics ? Math.floor(GRASS.count * 0.42) : Math.floor(GRASS.count * 0.72);
    const positions = [];
    const uvs = [];
    const colors = [];
    const indices = [];
    const raycaster = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);
    const up = new THREE.Vector3(0, 1, 0);
    const tmpNormal = new THREE.Vector3();
    const normalMatrix = new THREE.Matrix3();
    const hitTargets = [];
    const bounds = surfaceSource && surfaceSource.bounds ? surfaceSource.bounds : null;
    const root = surfaceSource && surfaceSource.root ? surfaceSource.root : null;

    if (root) {
      root.updateMatrixWorld(true);
      root.traverse(obj => { if (obj.isMesh && obj.geometry) hitTargets.push(obj); });
    }
    if (!bounds || hitTargets.length === 0) return buildFallbackFlatGrass(surfaceSource && surfaceSource.surfaceY ? surfaceSource.surfaceY : PLANET.radius);

    const topY = bounds.max.y;
    const rayStartY = bounds.max.y + 1.25;
    const minY = bounds.min.y;
    const spanX = Math.max(0.001, bounds.max.x - bounds.min.x);
    const spanZ = Math.max(0.001, bounds.max.z - bounds.min.z);
    const patchCenters = [
      { x: 0.00, z: 0.00, r: GRASS.capR * 1.05, n: 0.62, topOnly: true, seed: 11 },
      { x: -0.72, z: 0.48, r: 0.38, n: 0.10, seed: 31 },
      { x: 0.88, z: -0.34, r: 0.34, n: 0.08, seed: 47 },
      { x: -1.18, z: -0.92, r: 0.28, n: 0.06, seed: 59 },
      { x: 1.22, z: 0.84, r: 0.25, n: 0.05, seed: 71 },
      { x: 0.22, z: -1.34, r: 0.24, n: 0.04, seed: 83 },
      { x: -1.52, z: 0.10, r: 0.20, n: 0.025, seed: 97 },
    ];
    const totalWeight = patchCenters.reduce((sum, p) => sum + p.n, 0);
    patchCenters.forEach(p => { p.count = Math.max(12, Math.floor(bladeBudget * p.n / totalWeight)); });

    function convertRange(val, oldMin, oldMax, newMin, newMax) {
      return (((val - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
    }

    function pickPatch(i) {
      let acc = 0;
      const target = _pseudo(i + 501) * totalWeight;
      for (let p = 0; p < patchCenters.length; p++) {
        acc += patchCenters[p].n;
        if (target <= acc) return patchCenters[p];
      }
      return patchCenters[0];
    }

    function patchPoint(patch, i) {
      const radialNoise = 0.76 + 0.30 * _pseudo(i + patch.seed * 13);
      const edgeNoise = 0.84 + 0.22 * Math.sin(i * 1.71 + patch.seed);
      const r = patch.r * Math.sqrt(_pseudo(i + patch.seed)) * radialNoise * edgeNoise;
      const theta = i * GOLDEN + patch.seed;
      return {
        x: patch.x + Math.cos(theta) * r,
        z: patch.z + Math.sin(theta) * r,
      };
    }

    function surfaceHit(sample, patch) {
      raycaster.set(new THREE.Vector3(sample.x, rayStartY, sample.z), down);
      const hits = raycaster.intersectObjects(hitTargets, false);
      if (!hits.length) return null;
      const hit = hits[0];
      if (patch.topOnly && hit.point.y < topY - 0.72) return null;
      if (!patch.topOnly && hit.point.y < minY + (bounds.max.y - bounds.min.y) * 0.28) return null;
      if (hit.face) {
        normalMatrix.getNormalMatrix(hit.object.matrixWorld);
        tmpNormal.copy(hit.face.normal).applyMatrix3(normalMatrix).normalize();
      } else {
        tmpNormal.copy(hit.point).normalize();
      }
      if (tmpNormal.y < (patch.topOnly ? 0.28 : -0.10)) return null;
      return { point: hit.point.clone(), normal: tmpNormal.clone() };
    }

    function addBlade(hit, vArrOffset, uv, i) {
      const normal = hit.normal.clone().normalize();
      const yawSeed = _pseudo(i + 211) * Math.PI * 2;
      let tangent = new THREE.Vector3(Math.cos(yawSeed), 0, Math.sin(yawSeed));
      tangent.addScaledVector(normal, -tangent.dot(normal)).normalize();
      if (tangent.lengthSq() < 0.0001) tangent = new THREE.Vector3(1, 0, 0);
      const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();

      const midWidth = GRASS.width * 0.5;
      const height = GRASS.height + _pseudo(i + 107) * GRASS.heightVariation;
      const tipLean = tangent.clone().multiplyScalar((GRASS.tipOffset * 0.45) + _pseudo(i + 313) * GRASS.tipOffset);
      const base = hit.point.clone().addScaledVector(normal, GRASS.lift);
      const half = GRASS.width / 2;
      const midHalf = midWidth / 2;

      const bl = base.clone().addScaledVector(tangent, half);
      const br = base.clone().addScaledVector(tangent, -half);
      const tl = base.clone().addScaledVector(tangent, midHalf).addScaledVector(normal, height * 0.52).addScaledVector(bitangent, Math.sin(i) * 0.018);
      const tr = base.clone().addScaledVector(tangent, -midHalf).addScaledVector(normal, height * 0.52).addScaledVector(bitangent, Math.sin(i) * 0.018);
      const tc = base.clone().addScaledVector(normal, height).add(tipLean);

      const black = [0, 0, 0];
      const gray = [0.5, 0.5, 0.5];
      const white = [1, 1, 1];
      [
        { pos: bl, color: black },
        { pos: br, color: black },
        { pos: tr, color: gray },
        { pos: tl, color: gray },
        { pos: tc, color: white },
      ].forEach(vert => {
        positions.push(vert.pos.x, vert.pos.y, vert.pos.z);
        uvs.push(uv[0], uv[1]);
        colors.push(vert.color[0], vert.color[1], vert.color[2]);
      });
      indices.push(
        vArrOffset,
        vArrOffset + 1,
        vArrOffset + 2,
        vArrOffset + 2,
        vArrOffset + 4,
        vArrOffset + 3,
        vArrOffset + 3,
        vArrOffset,
        vArrOffset + 2,
      );
    }

    let accepted = 0;
    let attempts = 0;
    const maxAttempts = bladeBudget * 9;
    while (accepted < bladeBudget && attempts < maxAttempts) {
      const patch = pickPatch(attempts);
      const sample = patchPoint(patch, attempts);
      const hit = surfaceHit(sample, patch);
      attempts++;
      if (!hit) continue;
      const uv = [
        convertRange(hit.point.x, bounds.min.x, bounds.max.x, 0, 1),
        convertRange(hit.point.z, bounds.min.z, bounds.max.z, 0, 1),
      ];
      addBlade(hit, accepted * 5, uv, attempts);
      accepted++;
    }

    if (accepted < 20) return buildFallbackFlatGrass(topY);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const mesh = makeGrassMesh(geom, accepted, lowPowerGarden);
    _debug.grassBladeCount = accepted;
    _debug.grassAttempts = attempts;
    gardenGroup.add(mesh);
    return mesh;
  }

  function buildFallbackFlatGrass(surfaceY) {
    const bladeCount = lowPowerGarden ? 48 : mobileGarden && !highGraphics ? 240 : 360;
    const positions = [];
    const uvs = [];
    const colors = [];
    const indices = [];
    for (let i = 0; i < bladeCount; i++) {
      const r = GRASS.capR * Math.sqrt(_pseudo(i + 3));
      const theta = i * GOLDEN;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const base = new THREE.Vector3(x, surfaceY + GRASS.lift, z);
      const half = GRASS.width * 0.5;
      const h = GRASS.height + _pseudo(i + 107) * GRASS.heightVariation;
      const off = i * 5;
      [
        [base.x - half, base.y, base.z, 0, 0, 0],
        [base.x + half, base.y, base.z, 0, 0, 0],
        [base.x + half * 0.4, base.y + h * 0.5, base.z, 0.5, 0.5, 0.5],
        [base.x - half * 0.4, base.y + h * 0.5, base.z, 0.5, 0.5, 0.5],
        [base.x, base.y + h, base.z + GRASS.tipOffset, 1, 1, 1],
      ].forEach(v => { positions.push(v[0], v[1], v[2]); uvs.push((x / GRASS.capR + 1) * 0.5, (z / GRASS.capR + 1) * 0.5); colors.push(v[3], v[4], v[5]); });
      indices.push(off, off + 1, off + 2, off + 2, off + 4, off + 3, off + 3, off, off + 2);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geom.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
    geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    const mesh = makeGrassMesh(geom, bladeCount, lowPowerGarden);
    gardenGroup.add(mesh);
    return mesh;
  }

  function makeGrassMesh(geom, bladeCount, simple) {
    const loader = new THREE.TextureLoader();
    const grassTexture = loader.load(GRASS.grassTexture);

    // Low-power / slow Android tablets: skip the expensive custom shader and
    // use a dirt-cheap basic material. The blade count is also reduced.
    if (simple) {
      const mat = new THREE.MeshBasicMaterial({
        map: grassTexture,
        vertexColors: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.name = 'surface-three-grass-demo-low';
      mesh.renderOrder = 8;
      mesh.userData.grassTextures = [grassTexture];
      mesh.userData.bladeCount = bladeCount;
      return mesh;
    }

    const cloudTexture = loader.load(GRASS.cloudTexture);
    cloudTexture.wrapS = cloudTexture.wrapT = THREE.RepeatWrapping;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        textures: { value: [grassTexture, cloudTexture] },
        iTime: { value: 0 },
      },
      vertexColors: true,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        varying vec2 cloudUV;
        varying vec3 vColor;
        uniform float iTime;

        void main() {
          vUv = uv;
          cloudUV = uv;
          vColor = color;
          vec3 cpos = position;
          float waveSize = 10.0;
          // Reduced sway to match much shorter blades.
          float tipDistance = 0.055;
          float centerDistance = 0.022;
          if (color.x > 0.6) {
            cpos.x += sin((iTime / 500.0) + (uv.x * waveSize)) * tipDistance;
          } else if (color.x > 0.0) {
            cpos.x += sin((iTime / 500.0) + (uv.x * waveSize)) * centerDistance;
          }
          cloudUV.x += iTime / 20000.0;
          cloudUV.y += iTime / 10000.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(cpos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D textures[4];
        varying vec2 vUv;
        varying vec2 cloudUV;
        varying vec3 vColor;

        void main() {
          // Darker, surreal field gradient: pastel gold -> subtle purple.
          // The gradient runs across the field (vUv) and up each blade (vColor.x).
          vec3 pastelGold   = vec3(0.82, 0.72, 0.44); // muted, darker pastel gold
          vec3 subtlePurple = vec3(0.34, 0.24, 0.48); // deep, subdued purple

          float fieldT = clamp((vUv.x + vUv.y) * 0.5 + 0.05 * sin(vUv.x * 6.28), 0.0, 1.0);
          vec3 fieldGradient = mix(pastelGold, subtlePurple, fieldT);

          vec3 bladeGradient = mix(pastelGold, subtlePurple, vColor.x);

          vec3 base = texture2D(textures[0], vUv).rgb;
          base = base * 0.35 + 0.08;                  // crush and darken the noisy grass tex
          vec3 color = mix(fieldGradient, bladeGradient, 0.45);
          color = color * base * 2.2;                 // texture shapes the gradient
          color = mix(color, texture2D(textures[1], cloudUV).rgb * 0.35, 0.22);
          color *= 0.72;                              // overall darkening

          gl_FragColor.rgb = color;
          gl_FragColor.a = 1.0;
        }
      `,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = 'surface-three-grass-demo';
    mesh.renderOrder = 8;
    mesh.userData.grassTextures = [grassTexture, cloudTexture];
    mesh.userData.bladeCount = bladeCount;
    return mesh;
  }
  function buildAuroraCurtains() {
    if (!options.sky || !AURORA.enabled) return null;
    const auroraSteps = lowPowerGarden ? AURORA.stepsMobile : AURORA.stepsDesktop;
    const auroraOctaves = lowPowerGarden ? AURORA.noiseOctavesMobile : AURORA.noiseOctavesDesktop;
    const auroraSegX = lowPowerGarden ? 48 : mobileGarden && !highGraphics ? 56 : 72;
    const auroraSegY = lowPowerGarden ? 24 : mobileGarden && !highGraphics ? 28 : 36;
    const geo = new THREE.SphereGeometry(AURORA.radius, auroraSegX, auroraSegY);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(W, H) },
        uAuroraColor: { value: new THREE.Color(0xd6d6e6) },
        uBackground1: { value: new THREE.Color(0x0d1a33) },
        uBackground2: { value: new THREE.Color(0x1a0d33) },
        uIntensity: { value: AURORA.opacity * 2.3 },
        uStarBrightness: { value: 0.35 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vDir;

        void main() {
          vUv = uv;
          vec4 w = modelMatrix * vec4(position, 1.0);
          vDir = normalize(w.xyz);
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `,
      fragmentShader: `
        #define PI 3.14159265358979323846264

        varying vec2 vUv;
        varying vec3 vDir;
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec3 uAuroraColor;
        uniform vec3 uBackground1;
        uniform vec3 uBackground2;
        uniform float uIntensity;
        uniform float uStarBrightness;

        mat2 mm2(float a) {
          float c = cos(a), s = sin(a);
          return mat2(c, s, -s, c);
        }

        const mat2 m2 = mat2(0.95534, 0.29552, -0.29552, 0.95534);

        float tri(float x) {
          return clamp(abs(fract(x) - 0.5), 0.01, 0.49);
        }

        vec2 tri2(vec2 p) {
          return vec2(tri(p.x) + tri(p.y), tri(p.y + tri(p.x)));
        }

        float triNoise2d(vec2 p, float spd) {
          float z = 1.8;
          float z2 = 2.5;
          float rz = 0.0;
          p *= mm2(p.x * 0.06);
          vec2 bp = p;
          for (int octave = 0; octave < ${auroraOctaves}; octave++) {
            vec2 dg = tri2(bp * 1.85) * 0.75;
            dg *= mm2(uTime * spd);
            p -= dg / z2;
            bp *= 1.3;
            z2 *= 0.45;
            z *= 0.42;
            p *= 1.21 + (rz - 1.0) * 0.02;
            rz += tri(p.x + tri(p.y)) * z;
            p *= (m2 * -1.0);
          }
          return clamp(1.0 / pow(rz * 29.0, 1.3), 0.0, 0.55);
        }

        float hash21(vec2 n) {
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        vec3 hash33(vec3 p) {
          return fract(sin(vec3(
            dot(p, vec3(127.1, 311.7, 74.7)),
            dot(p, vec3(269.5, 183.3, 246.1)),
            dot(p, vec3(113.5, 271.9, 124.6))
          )) * 43758.5453123);
        }

        vec4 aurora(vec3 ro, vec3 rd, vec2 fragCoord) {
          vec4 col = vec4(0.0);
          vec4 avgCol = vec4(0.0);
          for (int stepIndex = 0; stepIndex < ${auroraSteps}; stepIndex++) {
            float i = float(stepIndex);
            float of = 0.006 * hash21(fragCoord) * smoothstep(0.0, 15.0, i);
            float pt = ((0.8 + pow(i, 1.4) * 0.002) - ro.y) / (rd.y * 2.0 + 0.4);
            pt -= of;
            vec3 bpos = ro + pt * rd;
            vec2 p = bpos.zx;
            float rzt = triNoise2d(p, 0.06);
            vec4 col2 = vec4(0.0, 0.0, 0.0, rzt);
            vec3 colorVariation = (sin(1.0 - vec3(2.15, -0.5, 1.2) + i * 0.043) * 0.5 + 0.5);
            col2.rgb = uAuroraColor * colorVariation * rzt;
            avgCol = mix(avgCol, col2, 0.5);
            col += avgCol * exp2(-i * 0.065 - 2.5) * smoothstep(0.0, 5.0, i);
          }
          col *= clamp(rd.y * 15.0 + 0.4, 0.0, 1.0);
          return col * uIntensity;
        }

        vec3 stars(vec3 p, vec2 res) {
          vec3 c = vec3(0.0);
          float resVal = max(360.0, min(res.x, 1200.0));
          for (float i = 0.0; i < 2.0; i++) {
            vec3 q = fract(p * (0.15 * resVal)) - 0.5;
            vec3 id = floor(p * (0.15 * resVal));
            vec2 rn = hash33(id).xy;
            float c2 = 1.0 - smoothstep(0.0, 0.6, length(q));
            c2 *= step(rn.x, 0.0005 + i * i * 0.001);
            c += c2 * (mix(vec3(1.0, 0.49, 0.1), vec3(0.75, 0.9, 1.0), rn.y) * 0.1 + 0.9);
            p *= 1.3;
          }
          return c * c * uStarBrightness;
        }

        vec3 bg(vec3 rd) {
          float sd = dot(normalize(vec3(-0.5, -0.6, 0.9)), rd) * 0.5 + 0.5;
          sd = pow(sd, 5.0);
          return mix(uBackground1, uBackground2, sd) * 0.20;
        }

        void main() {
          vec2 fragCoord = vUv * uResolution;
          vec3 ro = vec3(0.0, 0.0, -6.7);
          vec3 rd = normalize(vDir);

          float timeRot = uTime * 0.05;
          rd.yz = mm2(0.4) * rd.yz;
          rd.xz = mm2(sin(timeRot) * 0.2) * rd.xz;
          rd = normalize(rd);

          float fade = smoothstep(0.0, 0.01, abs(rd.y)) * 0.1 + 0.9;
          vec3 col = bg(rd) * fade;
          float alpha = 0.0;

          if (rd.y > 0.0) {
            vec4 aur = smoothstep(vec4(0.0), vec4(1.5), aurora(ro, rd, fragCoord)) * fade;
            vec3 starCol = stars(rd, uResolution);
            col += starCol;
            col = col * (1.0 - aur.a) + aur.rgb;
            alpha = clamp(max(max(aur.r, aur.g), aur.b) * 1.35 + length(starCol) * 0.12, 0.0, 0.82);
          } else {
            vec3 rrd = rd;
            rrd.y = abs(rrd.y);
            vec4 aur = smoothstep(vec4(0.0), vec4(2.5), aurora(ro, rrd, fragCoord));
            col += stars(rrd, uResolution) * 0.05;
            col = col * (1.0 - aur.a) + aur.rgb * 0.52;
            alpha = clamp(max(max(aur.r, aur.g), aur.b) * 0.35, 0.0, 0.28);
          }

          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 0;
    mesh.rotation.x = SKY.tiltX;
    mesh.rotation.y = SKY.yaw;
    mesh.visible = _skyVisible;
    scene.add(mesh);
    return mesh;
  }
  /* â”€â”€ Sanctuary mini-planet â€” the dome the constellation figures seat upon â”€â”€â”€â”€
   * Loaded async into gardenGroup at the origin; _layout() seats the figures on
   * its upper hemisphere (see PLANET above). The load is independent of the
   * figure code, so a slow/failed GLB never breaks the garden (gallery Wiâ€‘Fi
   * robustness) â€” figures just arc on the implied dome. The mesh writes depth,
   * so sprites whose orbit carries them behind it are occluded and rotate back
   * into view. Inherits gardenGroup's tilt/orbit/zoom for free.
  */
  let planetMesh = null;
  let planetRoot = null;
  let grassMesh = null;
  let lakeViewer = null;

  // Seat the starry-lake splat on the planet's north pole (see LAKE above).
  function buildNorthPoleLake(rootBounds) {
    if (!LAKE.enabled) return;
    if (LAKE.lowPowerSkip && lowPowerGarden) return;   // skip the heavy splat on weak devices
    const Rn = PLANET.radius * PLANET.visualScale;       // normalised planet radius
    const kScale = (LAKE.scale * 2 * Rn) / LAKE.atlasExtent;
    const seat = new THREE.Group();
    seat.position.y = rootBounds.max.y - LAKE.insetFrac * Rn;
    seat.rotation.y = LAKE.yaw;
    planetMesh.add(seat);
    const viewer = new GaussianSplats3D.DropInViewer({
      sharedMemoryForWorkers: false,   // no COOP/COEP isolation required → broad device support
      gpuAcceleratedSort: false,
    });
    if (LAKE.flip) viewer.rotation.x = Math.PI;          // hollow underside faces the planet
    viewer.position.y = LAKE.riseFrac * Rn;
    viewer.scale.setScalar(kScale);
    seat.add(viewer);
    lakeViewer = viewer;
    viewer.addSplatScene(LAKE.url, {
      showLoadingUI: false,
      progressiveLoad: false,
      splatAlphaRemovalThreshold: 5,
    }).catch((e) => console.warn('[archive] starry-lake splat failed:', e && e.message));
  }
  let currentWorldTheme = 'aurora';
  const worldTextureLoader = new THREE.TextureLoader();
  const worldTextureCache = new Map();
  function loadWorldTexture(url, onLoad) {
    if (!url) { onLoad(null); return; }
    if (worldTextureCache.has(url)) { onLoad(worldTextureCache.get(url)); return; }
    worldTextureLoader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1);
      worldTextureCache.set(url, tex);
      onLoad(tex);
    }, undefined, (e) => console.warn('[archive] world texture failed:', url, e && e.message));
  }
  function applyPlanetTexture(tex) {
    if (!planetRoot) return;
    planetRoot.traverse((c) => {
      if (!c.isMesh || !c.material) return;
      (Array.isArray(c.material) ? c.material : [c.material]).forEach((m) => {
        if (!m.userData.baseMap) m.userData.baseMap = m.map || null;
        m.map = tex || m.userData.baseMap || null;
        m.needsUpdate = true;
      });
    });
  }
  function applySkyTexture(tex) {
    if (!skySphere || !tex) return;
    if (skySphere.material.map && skySphere.material.map !== tex && !worldTextureCacheHasValue(skySphere.material.map)) {
      skySphere.material.map.dispose();
    }
    skySphere.material.map = tex;
    skySphere.material.needsUpdate = true;
  }
  function worldTextureCacheHasValue(tex) {
    for (const cached of worldTextureCache.values()) if (cached === tex) return true;
    return false;
  }
  function setWorldTheme(id) {
    currentWorldTheme = WORLD_THEMES[id] ? id : 'aurora';
    const theme = WORLD_THEMES[currentWorldTheme];
    loadWorldTexture(theme.sky, applySkyTexture);
    loadWorldTexture(theme.planet, applyPlanetTexture);
  }
  if (PLANET.enabled) {
    // Warm top fill so the green cap reads against the cool X-ray rig.
    const planetWarm = new THREE.DirectionalLight(0xFFE6C0, 0.9);
    planetWarm.position.set(0.4, 4, 1.2);
    scene.add(planetWarm);

    // Texture tier by device: 4K desktop · 2K tablet/iPad · 1K low-power Android.
    const planetUrl = lowPowerGarden ? PLANET.mobileUrl
                    : ((D.isTablet || (D.isIOS && !D.isDesktop)) && !highGraphics) ? PLANET.ipadUrl
                    : PLANET.desktopUrl;
    new GLTFLoader().load(
      planetUrl,
      (gltf) => {
        const root = gltf.scene;
        planetRoot = root;
        // Normalise to PLANET.radius via bounding sphere, recentre at origin.
        const sph = new THREE.Box3().setFromObject(root).getBoundingSphere(new THREE.Sphere());
        root.position.sub(sph.center);
        const s = (PLANET.radius / (sph.radius || 1)) * PLANET.visualScale;
        root.scale.setScalar(s);
        root.position.multiplyScalar(s);
        root.updateMatrixWorld(true);
        const rootBounds = new THREE.Box3().setFromObject(root);

        planetMesh = new THREE.Group();
        planetMesh.add(root);
        planetMesh.rotation.set(PLANET.rotX, PLANET.rotY, PLANET.rotZ);
        gardenGroup.add(planetMesh);
        if (GRASS.enabled) {
          if (grassMesh) {
            gardenGroup.remove(grassMesh);
            grassMesh.geometry.dispose();
            if (grassMesh.userData.grassTextures) grassMesh.userData.grassTextures.forEach(t => t.dispose());
            grassMesh.material.dispose();
          }
          _debug.planetSurfaceY = rootBounds.max.y;
          _debug.grassBaseY = rootBounds.max.y + GRASS.lift;
          grassMesh = buildNorthPoleGrass({ root, bounds: rootBounds, surfaceY: rootBounds.max.y });
        }
        buildNorthPoleLake(rootBounds);
        setWorldTheme(currentWorldTheme);
      },
      undefined,
      (e) => {
        console.warn('[archive] planet GLB failed to load:', planetUrl, e && e.message);
        if (GRASS.enabled && !grassMesh) {
          _debug.planetSurfaceY = PLANET.radius;
          _debug.grassBaseY = PLANET.radius + GRASS.lift;
          grassMesh = buildNorthPoleGrass({ surfaceY: PLANET.radius });
        }
      }
    );
  }
  if (!PLANET.enabled && GRASS.enabled) {
    _debug.planetSurfaceY = PLANET.radius;
    _debug.grassBaseY = PLANET.radius + GRASS.lift;
    grassMesh = buildNorthPoleGrass({ surfaceY: PLANET.radius });
  }

  /* ── Aurora skysphere — keyed to the orbit input (see SKY above) ──────────── */
  let skySphere  = null;
  let auroraMesh = null;
  let _skyVisible = true;   // the bg picker flips this via setSky() (Aurora vs Void/Camera)
  if (options.sky && SKY.enabled) {
    new THREE.TextureLoader().load(
      SKY.url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter  = THREE.LinearFilter;   // backdrop — skip mipmaps
        const geo = new THREE.SphereGeometry(SKY.radius, 64, 40);
        const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false });
        mat.toneMapped = false;                // preserve the painterly palette exactly
        skySphere = new THREE.Mesh(geo, mat);
        skySphere.renderOrder = -1;            // draw behind everything
        skySphere.rotation.x = SKY.tiltX;
        skySphere.rotation.y = SKY.yaw;
        skySphere.visible = _skyVisible;
        scene.add(skySphere);
        setWorldTheme(currentWorldTheme);
      },
      undefined,
      (e) => { console.warn('[archive] sky panorama failed to load:', SKY.url, e && e.message); }
    );
  }
  auroraMesh = buildAuroraCurtains();
  // Show/hide the panorama sky — the backdrop picker calls this so 'Void'/'Camera'
  // reveal the HTML backdrop behind the transparent canvas instead of the sphere.
  function setSky(on) {
    _skyVisible = !!on;
    if (skySphere) skySphere.visible = _skyVisible;
    if (auroraMesh) auroraMesh.visible = _skyVisible;
  }

  /* â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let gardenPanX = 0, gardenPanY = 0, gardenPanZ = 0;
  let _autoRotate = false;   // stationary by default (auto-spin reveals the splat lake's bare back side)
  let _targetCamZ = 5.5;
  const _CAM_Z_MIN = 2.5, _CAM_Z_MAX = 12.0;

  const ribbons    = [];
  let   traceCount = 0;
  const highlightId = options.highlightTraceId || null;

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
  const ANIM_SLOTS   = lowPowerGarden ? 2 : mobileGarden && !highGraphics ? 4 : 12;  // most-recent N traces: full pose cycling + live petals
  const BREATHE_SLOTS = lowPowerGarden ? 6 : mobileGarden && !highGraphics ? 12 : 50; // next traces: petal breathing only (fixed mid-frame, live clock)
  const BREATHE_MOD   = lowPowerGarden ? 12 : mobileGarden && !highGraphics ? 8 : 4;
  const ANIM_MOD      = mobileGarden && !highGraphics ? 2 : 1;
  let breatheFrame = 0;     // incremented each update(); breathe redraws throttled to ~15 fps
  let animFrame = 0;

  /* â”€â”€ Soft radial vignette â€” fades petal/edge clipping gracefully â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  /* Identity label painted just below the figure's feet */
  function _drawLabel(ctx, CW, CH, text, boneColor) {
    if (!text) return;
    const fs = Math.round(CH * 0.022);
    ctx.save();
    ctx.globalAlpha  = 0.52;
    ctx.font         = 'italic ' + fs + 'px Georgia, serif';
    ctx.fillStyle    = boneColor || '#C8D8E0';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, CW / 2, CH * 0.93);
    ctx.restore();
  }

  function _drawBloom(ctx, CW, CH, age) {
    if (age < 0 || age >= BLOOM_DURATION) return;
    const rise  = Math.min(age / 1.4, 1);
    const fall  = age > 1.6 ? Math.max(0, 1 - (age - 1.6) / (BLOOM_DURATION - 1.6)) : 1;
    const alpha = rise * fall * 0.52;
    if (alpha < 0.005) return;
    const cx = CW / 2, cy = CH / 2;
    const r  = CW * 0.08 + rise * CW * 0.18 + (age > 1.6 ? (age - 1.6) * CW * 0.055 : 0);
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grd.addColorStop(0,    'rgba(196,160,96,' + alpha.toFixed(3) + ')');
    grd.addColorStop(0.55, 'rgba(196,160,96,' + (alpha * 0.38).toFixed(3) + ')');
    grd.addColorStop(1,    'rgba(196,160,96,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function _poseBoundsPx(frame, CW, CH) {
    const pts = (frame && (frame.pose || frame.landmarks || frame.kp)) || [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(p => {
      if (!p || _score(p) <= 0.10) return;
      const x = (p.x || 0) * CW;
      const y = (p.y || 0) * CH;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
    if (minX === Infinity) {
      return { minX: CW * 0.38, maxX: CW * 0.62, minY: CH * 0.25, maxY: CH * 0.90 };
    }
    const pad = Math.max(10, CW * 0.035);
    return {
      minX: Math.max(0, minX - pad),
      maxX: Math.min(CW, maxX + pad),
      minY: Math.max(0, minY - pad * 1.6),
      maxY: Math.min(CH, maxY + pad),
    };
  }

  function _drawSeedFlame(ctx, CW, CH, x, y, age, grow, seed) {
    const alive = Math.max(0, 1 - grow * 0.82);
    if (alive <= 0.01) return;
    const flicker = 0.74 + 0.26 * Math.sin(age * 11.0 + seed * 0.013);
    const baseR = CW * (0.030 + 0.045 * flicker);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 11; i++) {
      const a = i / 11 * Math.PI * 2 + seed * 0.021;
      const lift = (0.25 + (i % 5) * 0.13) * (1 - grow);
      const px = x + Math.cos(a) * baseR * (0.55 + (i % 3) * 0.28);
      const py = y - lift * CH * 0.10 + Math.sin(a * 1.7 + age * 8) * baseR * 0.55;
      const r = baseR * (0.35 + ((i + 2) % 4) * 0.18);
      const al = alive * (0.12 + (i % 4) * 0.035);
      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, `rgba(248,220,165,${(al * 2.4).toFixed(3)})`);
      g.addColorStop(0.38, `rgba(215,56,76,${al.toFixed(3)})`);
      g.addColorStop(1, 'rgba(215,56,76,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.16 + Math.sin(age * 5 + i) * 0.05;
      const len = CH * (0.035 + (i % 3) * 0.017) * alive;
      ctx.strokeStyle = `rgba(248,220,165,${(alive * 0.22).toFixed(3)})`;
      ctx.lineWidth = Math.max(1, CW * 0.006);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  function _applyVignette(ctx, CW, CH) {
    const grad = ctx.createRadialGradient(CW / 2, CH * 0.38, 0, CW / 2, CH * 0.38, CW * 0.64);
    grad.addColorStop(0.30, 'rgba(0,0,0,1)');   // fully opaque center
    grad.addColorStop(1.00, 'rgba(0,0,0,0)');   // transparent at edge
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CW, CH);
    ctx.globalCompositeOperation = 'source-over';
  }

  function _drawStarOutline(ctx, cx, cy, sc, rot, progress, lw, col, glowW) {
    const OR = [7.0,5.5,7.6,5.1,6.7], IR = [2.8,2.3,3.0,2.2,2.6];
    const v = [];
    for (let k = 0; k < 10; k++) {
      const o = k%2===0, pi=Math.floor(k/2), r=(o?OR[pi]:IR[pi])*sc;
      const a = k*Math.PI/5 + rot - Math.PI/2;
      v.push({x: cx + r*Math.cos(a), y: cy + r*Math.sin(a)});
    }
    v.push({x: v[0].x, y: v[0].y});
    const fs = Math.floor(progress * 10);
    const fr = (progress * 10) - fs;
    function buildPath() {
      ctx.beginPath(); ctx.moveTo(v[0].x, v[0].y);
      for (let s = 0; s < fs; s++) ctx.lineTo(v[s+1].x, v[s+1].y);
      if (fs < 10 && fr > 0) {
        const va = v[fs], vb = v[Math.min(fs+1,10)];
        ctx.lineTo(va.x + fr*(vb.x-va.x), va.y + fr*(vb.y-va.y));
      }
    }
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (glowW) { buildPath(); ctx.strokeStyle = 'rgba(196,148,72,0.18)'; ctx.lineWidth = glowW; ctx.stroke(); }
    buildPath(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.stroke();
    if (progress > 0 && progress < 1) {
      const va = v[Math.min(fs,9)], vb = v[Math.min(fs+1,10)];
      const tx = va.x + fr*(vb.x-va.x), ty = va.y + fr*(vb.y-va.y);
      const g = ctx.createRadialGradient(tx,ty,0,tx,ty,lw*3.5);
      g.addColorStop(0,'rgba(248,220,165,0.95)'); g.addColorStop(1,'rgba(196,162,96,0)');
      ctx.beginPath(); ctx.arc(tx,ty,lw*3.5,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    }
    ctx.restore();
  }

  function _posAtArc(pts, arc, tl, s) {
    s = Math.max(0, Math.min(tl, s));
    for (let i = 1; i < arc.length; i++) {
      if (arc[i] >= s) {
        const f = (s - arc[i-1]) / (arc[i] - arc[i-1]);
        return { x: pts[i-1].x + f*(pts[i].x-pts[i-1].x), y: pts[i-1].y + f*(pts[i].y-pts[i-1].y) };
      }
    }
    return { x: pts[pts.length-1].x, y: pts[pts.length-1].y };
  }

  const STAR_CHAIN_END = 1.55, LARGE_START = 1.40, LARGE_DRAW_END = 3.60;
  const HOLD_END = 4.60, ANIM_TOTAL = 5.40;

  function _drawStarAnim(ctx, CW, CH, entry, age) {
    if (age >= ANIM_TOTAL) { entry.starAnimDone = true; return; }
    const fade = age > HOLD_END ? Math.max(0, 1 - (age - HOLD_END) / (ANIM_TOTAL - HOLD_END)) : 1;
    ctx.save();
    ctx.globalAlpha = fade;
    if (entry.strokeArc && age < STAR_CHAIN_END + 0.5) {
      const pts = entry.strokeArc.pts, arc = entry.strokeArc.arc, tl = entry.strokeArc.tl;
      const SC=7, EACH=0.30, STAG=0.18;
      for (let i = 0; i < SC; i++) {
        const t2 = age - STAG*i;
        const prog = Math.max(0, Math.min(1, t2/EACH));
        if (prog <= 0) continue;
        const pos = _posAtArc(pts, arc, tl, tl * i/(SC-1));
        _drawStarOutline(ctx, pos.x, pos.y, 3.2, 0.14 + i*0.38, prog, 4, 'rgba(220,185,120,0.90)', 0);
      }
    }
    if (age >= LARGE_START) {
      const lp = Math.max(0, Math.min(1, (age - LARGE_START) / (LARGE_DRAW_END - LARGE_START)));
      if (lp > 0) _drawStarOutline(ctx, CW*0.5, CH*0.68, 26, 0.14, lp, 6, 'rgba(220,185,120,0.82)', 24);
    }
    ctx.restore();
  }

  function _score(p) {
    return p ? (p.s ?? p.score ?? p.visibility ?? 0) : 0;
  }

  function _hasLandmarks(frame) {
    return !!(frame && Array.isArray(frame.landmarks) && frame.landmarks.length >= 33);
  }

  function _posePoints(frame) {
    if (_hasLandmarks(frame)) return frame.landmarks;
    return (frame && frame.kp) || [];
  }

  function _posePoint(frame, mpIndex, legacyIndex) {
    const pts = _posePoints(frame);
    return _hasLandmarks(frame) ? pts[mpIndex] : pts[legacyIndex];
  }

  function _transformPosePoints(points, anchorDX, anchorDY, pivotNX, pivotNY, fitScale) {
    return (points || []).map(point => {
      const nx = (point.x ?? 0) + anchorDX;
      const ny = (point.y ?? 0) + anchorDY;
      return {
        ...point,
        x: pivotNX + (nx - pivotNX) * fitScale,
        y: pivotNY + (ny - pivotNY) * fitScale,
        s: _score(point),
      };
    });
  }

  function _tapToGardenPosition(tap) {
    const nx = tap && Number.isFinite(tap.x) ? tap.x : 0.5;
    const ny = tap && Number.isFinite(tap.y) ? tap.y : 0.62;
    // Unproject the screen tap onto the garden's local bloom plane (gardenGroup-local
    // y = BLOOM_Y) so the figure blooms exactly under the finger/cursor — where the
    // falling star lands. The old fixed formula ignored the gardenGroup tilt, the
    // lowering, the manual orbit, zoom and pan, so the figure landed off the tap.
    const BLOOM_Y = 0.5;
    gardenGroup.updateMatrixWorld();
    const ndc = new THREE.Vector2(nx * 2 - 1, -(ny * 2 - 1));
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, camera);
    const up = new THREE.Vector3(0, 1, 0).transformDirection(gardenGroup.matrixWorld).normalize();
    const coplanar = new THREE.Vector3(0, BLOOM_Y, 0).applyMatrix4(gardenGroup.matrixWorld);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(up, coplanar);
    const world = new THREE.Vector3();
    if (!ray.ray.intersectPlane(plane, world)) {
      // Tap above the field's horizon (rare): use the ray's closest approach to the
      // garden origin so the bloom still lands in-field, toward the tap.
      const O = ray.ray.origin, D = ray.ray.direction;
      const P = new THREE.Vector3().setFromMatrixPosition(gardenGroup.matrixWorld);
      const t = Math.max(0, P.clone().sub(O).dot(D));
      world.copy(O).addScaledVector(D, t);
    }
    gardenGroup.worldToLocal(world);
    const R = MAX_R * 1.4;
    return {
      x: Math.max(-R, Math.min(R, world.x)),
      z: Math.max(-R, Math.min(R, world.z)),
    };
  }

  function _easeOutCubic(t) {
    t = Math.max(0, Math.min(1, t));
    return 1 - Math.pow(1 - t, 3);
  }

  function _fieldScale(traceScale) {
    return Math.max(0.56, Math.min(1.12, Math.sqrt(10 / Math.max(1, ribbons.length)))) * (traceScale || 1.0) * FIGURE_SCALE;
  }

  function _drawPlantedFrame(entry, age) {
    if (!entry.skelCanvas || !entry.skelFrames || !entry.skelFrames.length) return;
    const CW = entry.skelCanvas.width, CH = entry.skelCanvas.height;
    const ctx = entry.skelCtx;
    const grow = _easeOutCubic(Math.max(0, Math.min(1, (age - 0.45) / 3.2)));
    const frameCount = entry.skelFrames.length;
    const frameIndex = Math.min(frameCount - 1, Math.floor(grow * frameCount));
    const frame = entry.skelFrames[frameIndex];
    const bounds = _poseBoundsPx(frame, CW, CH);
    const revealTop = bounds.maxY - grow * (bounds.maxY - bounds.minY);

    ctx.clearRect(0, 0, CW, CH);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, revealTop, CW, bounds.maxY - revealTop + CW * 0.04);
    ctx.clip();
    for (let t = 3; t >= 1; t--) {
      const idx = Math.max(0, frameIndex - t);
      const a = 0.05 * Math.pow(0.55, t - 1);
      customSkel.draw(ctx, entry.skelFrames[idx].pose || entry.skelFrames[idx].kp, CW, CH, a, entry.skelSeed, 0, entry.palette);
    }
    customSkel.draw(ctx, frame.pose || frame.kp, CW, CH, 0.88, entry.skelSeed, clock, entry.palette);
    ctx.restore();

    _drawSeedFlame(ctx, CW, CH, (bounds.minX + bounds.maxX) * 0.5, bounds.maxY, age, grow, entry.skelSeed || 0);

    _drawLabel(ctx, CW, CH, entry.labelText, entry.palette && entry.palette.bone);
    entry.boneTex.needsUpdate = true;
  }

  function _buildSkeletonTrace(trace, frames, palette, traceScale) {
    const N = frames.length;

    // Evenly sample RENDER_FRAMES from the recorded snapshots
    const renderFrames = [];
    for (let i = 0; i < RENDER_FRAMES; i++) {
      const idx = Math.round(i * (N - 1) / (RENDER_FRAMES - 1));
      renderFrames.push(frames[Math.min(idx, N - 1)]);
    }

    // â”€â”€ Root-anchor: average body position across ALL animation frames so the
    // figure stays centred on canvas throughout playback.
    // Previously only frame 0 was used â€” any frame where the body had shifted
    // from its frame-0 position would push limbs outside the canvas boundaries.
    let anchorDX = 0, anchorDY = 0;
    if (renderFrames.length > 0) {
      let sumX = 0, sumY = 0, count = 0;
      renderFrames.forEach(frame => {
        const lSh = _posePoint(frame, MP.leftShoulder, LEGACY.leftShoulder);
        const rSh = _posePoint(frame, MP.rightShoulder, LEGACY.rightShoulder);
        const lHip = _posePoint(frame, MP.leftHip, LEGACY.leftHip);
        const rHip = _posePoint(frame, MP.rightHip, LEGACY.rightHip);
        const shOk  = lSh  && rSh  && _score(lSh) > 0.15 && _score(rSh) > 0.15;
        const hipOk = lHip && rHip && _score(lHip) > 0.15 && _score(rHip) > 0.15;
        if (hipOk) {
          sumX += (lHip.x + rHip.x) / 2;
          sumY += (lHip.y + rHip.y) / 2;
          count++;
        } else if (shOk) {
          sumX += (lSh.x + rSh.x) / 2;
          sumY += (lSh.y + rSh.y) / 2 + 0.14;
          count++;
        }
      });
      const refX = count > 0 ? sumX / count : 0.50;
      const refY = count > 0 ? sumY / count : 0.60;
      anchorDX = 0.50 - refX;   // centre average body position horizontally
      anchorDY = 0.86 - refY;   // place average hip at 86% canvas height
    }
    // ── Scale-to-fit: compute the full animation bounding box across ALL
    // frames — skeleton joints AND the petal/flower-head envelope — then
    // scale the figure down if anything would be clipped. This guarantees
    // zero clipping regardless of gesture size, movement range, or entry count.
    const _CW = mobileGarden ? 256 : 384;
    const _CH = mobileGarden ? 640 : 960;
    const _PAD = mobileGarden ? 14 : 20;
    let fitScale = 1.0, pivotNX = 0.50, pivotNY = 0.60;
    {
      let bMinX = Infinity, bMaxX = -Infinity;
      let bMinY = Infinity, bMaxY = -Infinity;

      renderFrames.forEach(frame => {
        // Anchor-shifted keypoints mapped to estimated canvas pixels
        const pts = _posePoints(frame).map(k => ({
          x: ((k.x ?? 0) + anchorDX) * _CW,
          y: ((k.y ?? 0) + anchorDY) * _CH,
          s: _score(k),
        }));

        // Include every visible skeleton joint
        pts.forEach(p => {
          if (p.s > 0.10) {
            if (p.x < bMinX) bMinX = p.x;
            if (p.x > bMaxX) bMaxX = p.x;
            if (p.y < bMinY) bMinY = p.y;
            if (p.y > bMaxY) bMaxY = p.y;
          }
        });

        // Include petal + flower-head envelope (full circle around head centre)
        // Mirrors _headCenter() and hy-clamp logic from custom-skel-draw.js
        const lSh = _hasLandmarks(frame) ? pts[MP.leftShoulder] : pts[LEGACY.leftShoulder];
        const rSh = _hasLandmarks(frame) ? pts[MP.rightShoulder] : pts[LEGACY.rightShoulder];
        if (lSh && rSh && lSh.s > 0.10 && rSh.s > 0.10) {
          const sPx  = Math.hypot(rSh.x - lSh.x, rSh.y - lSh.y);
          const midX = (lSh.x + rSh.x) / 2;
          const midY = (lSh.y + rSh.y) / 2;
          const nose = _hasLandmarks(frame) ? pts[MP.nose] : pts[LEGACY.nose];
          const hx   = (nose && nose.s > 0.12) ? nose.x * 0.60 + midX * 0.40 : midX;
          const hyR  = (nose && nose.s > 0.12) ? nose.y - sPx * 0.35 : midY - sPx * 0.55;
          const hy   = Math.max(sPx * 2.8 + 4, hyR);  // mirror hy-clamp in draw()
          // Max petal reach = R(1.6) × l_max(1.42) × s_max(1.18) ≈ 2.68×shoulderPx
          // Use 2.8× as a safe envelope covering all 6 petal directions
          const pr   = sPx * 2.8;
          if (hx - pr < bMinX) bMinX = hx - pr;
          if (hx + pr > bMaxX) bMaxX = hx + pr;
          if (hy - pr < bMinY) bMinY = hy - pr;
          if (hy + pr > bMaxY) bMaxY = hy + pr;
        }
      });

      if (bMinX < Infinity) {
        const bboxW = bMaxX - bMinX;
        const bboxH = bMaxY - bMinY;
        const avW   = _CW - 2 * _PAD;
        const avH   = _CH - 2 * _PAD;
        if (bboxW > avW || bboxH > avH) {
          fitScale = Math.min(avW / bboxW, avH / bboxH);
        }
        // Scale pivot: bounding-box centre in normalised coords
        pivotNX = ((bMinX + bMaxX) / 2) / _CW;
        pivotNY = ((bMinY + bMaxY) / 2) / _CH;
      }
    }

    const skelFrames = renderFrames.map(frame => {
      const kp = _transformPosePoints(frame.kp || [], anchorDX, anchorDY, pivotNX, pivotNY, fitScale);
      const landmarks = _hasLandmarks(frame)
        ? _transformPosePoints(frame.landmarks, anchorDX, anchorDY, pivotNX, pivotNY, fitScale)
        : null;
      return {
        kp,
        landmarks,
        pose: landmarks || kp,
      };
    });

    let strokeArc = null;
    {
      const allPts = trace.strokes ? [].concat(...trace.strokes) : [];
      const step   = Math.max(1, Math.floor(allPts.length / 40));
      const sPts   = allPts
        .filter(function(_, i) { return i % step === 0; })
        .map(function(p) { return { x: ((p.x || 0) + anchorDX) * _CW, y: ((p.y || 0) + anchorDY) * _CH }; })
        .filter(function(p) { return Number.isFinite(p.x) && Number.isFinite(p.y); });
      if (sPts.length >= 2) {
        const sArc = [0];
        for (let i = 1; i < sPts.length; i++) {
          const dx = sPts[i].x - sPts[i-1].x, dy = sPts[i].y - sPts[i-1].y;
          sArc.push(sArc[i-1] + Math.sqrt(dx*dx + dy*dy));
        }
        strokeArc = { pts: sPts, arc: sArc, tl: sArc[sArc.length-1] || 1 };
      }
    }

    // Per-contributor seed â€” offsets petal drift so each entry looks distinct
    let seed = 0;
    if (trace.id) {
      for (let i = 0; i < Math.min(trace.id.length, 8); i++) {
        seed = seed * 31 + trace.id.charCodeAt(i);
      }
    }

    if (customSkel) {
      /* â”€â”€ Sprite + CanvasTexture path â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
      const CW = mobileGarden ? 256 : 384;
      const CH = mobileGarden ? 640 : 960;   // wider for wide gestures, taller for petal headroom (0.4 ratio matches sprite)
      const oc  = document.createElement('canvas');
      oc.width  = CW; oc.height = CH;
      const octx = oc.getContext('2d');

      // Initial draw: middle frame as a settled pose (updated later in update())
      const midFrame = skelFrames[Math.floor(skelFrames.length / 2)];
      customSkel.draw(octx, midFrame.pose || midFrame.kp, CW, CH, 0.68, seed, 0, palette);
      const labelText = (trace.id || '???').slice(0, 3).toUpperCase();
      _drawLabel(octx, CW, CH, labelText, palette && palette.bone);

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
      const sc = traceScale || 1.0;
      sprite.scale.set(1.10 * sc, 2.75 * sc, 1.0);

      const group = new THREE.Group();
      group.add(sprite);

      return {
        group,
        materials:   [{ mat: spriteMat, targetAlpha: 1.0 }],
        boneTex:     tex,
        isLegacy:    false,
        sprite,
        skelFrames,
        skelCanvas:  oc,
        skelCtx:     octx,
        skelSeed:    seed,
        palette,
        traceScale:  sc,
        strokeArc,
        labelText,
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
  function _buildTrace(trace, palette, traceScale) {
    const skel = trace.skeletons;
    if (skel && Array.isArray(skel) && skel.length >= 3) {
      _debug.skelCount++;
      _debug.lastSkelFrames = skel.length;
      return _buildSkeletonTrace(trace, skel, palette, traceScale);
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

    // ── Adaptive garden scale ────────────────────────────────────────────
    // Sprite scale: √(10/N) keeps baseline at N=10 and grows for fewer entries.
    // Clamped: 0.65× (large archives) to 1.20× (1–3 entries).
    const spriteScaleMult = Math.max(0.65, Math.min(1.20, Math.sqrt(10 / Math.max(1, N))));
    // Radius range: wide spread for few entries, settles for large archives.
    // With the planet dome, the outer radius is pinned to the dome's equator so
    // every figure seats on the upper hemisphere (no figure floats past it).
    const adaptMaxR = PLANET.enabled
      ? PLANET.radius
      : Math.max(3.0, Math.min(5.5, 5.5 - N * 0.06));

    ribbons.forEach((r, i) => {
      // Full radius range always used: 2 entries = min vs max, N entries fill evenly.
      // This spreads few entries wide; many entries pack naturally via the golden angle.
      const frac   = N <= 1 ? 0.5 : i / (N - 1);
      const radius = MIN_R + frac * (adaptMaxR - MIN_R);
      const angle  = i * GOLDEN;
      r.targetX = Math.cos(angle) * radius;   // no X clamp — let figures spread naturally
      r.targetZ = Math.sin(angle) * radius;
      // Scale the sprite — global density mult × per-contributor body scale × figure boost
      const sc = spriteScaleMult * (r.traceScale || 1.0) * FIGURE_SCALE;
      if (r.skelSprite) {
        r.skelSprite.scale.set(1.10 * sc, 2.75 * sc, 1.0);
      }
      if (PLANET.enabled) {
        // Spherical seating: sit the figure on the dome at ρ = horizontal radius.
        // Inner figures crest the pole (y→radius); outer approach the equator (y→0).
        // Lift by a slice of sprite height so feet — not mid-body — meet the surface,
        // plus FIGURE_LIFT so they ride higher above the lowered planet.
        const rho     = Math.min(radius, PLANET.radius);
        const sphereY = Math.sqrt(Math.max(0, PLANET.radius * PLANET.radius - rho * rho));
        r.baseY = sphereY + (2.75 * sc) * PLANET.footLift + FIGURE_LIFT;
      } else {
        r.baseY = (1 - frac) * 0.8 + FIGURE_LIFT;
      }
      if (instant) {
        r.group.position.x = r.targetX;
        r.group.position.z = r.targetZ;
      }
    });
  }
  function _addToGarden(trace, isHighlighted, isNew = false, plantOptions = null) {
    const palette    = _tracePalette(trace);
    const traceScale = _traceScale(trace);
    const result     = _buildTrace(trace, palette, traceScale);
    if (!result) return;

    const { group, materials, boneTex, isLegacy, sprite,
            skelFrames, skelCanvas, skelCtx, skelSeed,
            labelText, strokeArc } = result;
    gardenGroup.add(group);
    const plantedAt = plantOptions ? _tapToGardenPosition(plantOptions.tap) : null;
    group.position.set(plantedAt ? plantedAt.x : 0, plantOptions ? 0.72 : 0, plantedAt ? plantedAt.z : 0);

    const entry = {
      group,
      materials,
      boneTex,
      isLegacy,
      baseY:          0,
      targetX:        0,
      targetZ:        0,
      phaseOffset:    ribbons.length * 0.53,
      swayFreq:       0.28 + (_hashId(trace.id, 'swayf') % 16) * 0.018,
      swaySeed:       (_hashId(trace.id, 'swayp') % 628) * 0.01,
      opacity:        0,
      isHighlighted,
      playhead:       0,
      playRate:       3.5,
      skelFrames:     skelFrames  != null ? skelFrames  : null,
      skelCanvas:     skelCanvas  != null ? skelCanvas  : null,
      skelCtx:        skelCtx     != null ? skelCtx     : null,
      skelSeed:       skelSeed    != null ? skelSeed    : 0,
      skelSprite:     sprite      != null ? sprite      : null,
      lastDrawnFrame: -1,
      skelSettled:    false,
      palette:        palette     != null ? palette     : SPINAL_PALETTE[0],
      traceScale:     traceScale  != null ? traceScale  : 1.0,
      labelText:      labelText   != null ? labelText   : '',
      strokeArc:      result.strokeArc != null ? result.strokeArc : null,
      traceId:        trace.id,
      starAnimStart:  isNew ? clock : -1,   // only on realtime inserts, not on highlight (camera zoom handles that)
      starAnimDone:   !isNew,
      bloomStart:     (isHighlighted || isNew) ? clock : 0,
      planting:       plantOptions ? {
        start: clock,
        duration: 4.4,
        hold: 0.8,
        releaseDuration: 2.8,
        x: plantedAt.x,
        z: plantedAt.z,
      } : null,
    };

    if (entry.planting) {
      entry.opacity = 1;
      entry.playRate = 2.3;
      entry.starAnimDone = true;
      entry.bloomStart = clock;
      if (entry.skelSprite) {
        const sc = _fieldScale(entry.traceScale);
        entry.skelSprite.scale.set(1.10 * sc, 2.75 * sc, 1);
      }
      materials.forEach(({ mat, targetAlpha }) => { mat.opacity = targetAlpha; });
    }

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

    // Auto-zoom: fewer entries = closer camera; more = pull back so garden fills screen
    const N = ribbons.length;
    const autoZ = Math.max(4.5, Math.min(9.5, 4.0 + Math.sqrt(N) * 0.9));
    _targetCamZ = autoZ;
    camera.position.z = autoZ;  // instant on load — no visible drift

    // Zoom-in on newly submitted trace, then pull back to reveal the full garden
    if (highlightId) {
      const highlighted = ribbons.find(r => r.traceId === highlightId);
      if (highlighted) {
        const closeZ = Math.max(3.5, autoZ - 1.2);
        camera.position.set(highlighted.targetX * 0.35, camera.position.y, closeZ);
        _targetCamZ = closeZ;
        setTimeout(() => {
          _targetCamZ = autoZ;
          targetCamX  = 0;
        }, 2800);
      }
    }
  }

  /* â”€â”€ Public: add single trace (realtime insert) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function addTrace(trace) {
    _addToGarden(trace, !!(highlightId && trace.id === highlightId), true);
    traceCount++;

    if (ribbons.length > maxTraces) {
      const oldest = ribbons.pop();
      _fadeRemove(oldest);
    }

    _layout();
    if (options.onTraceAdded) options.onTraceAdded(traceCount);
  }

  function plantTrace(trace, tap) {
    _addToGarden(trace, true, false, { tap });
    traceCount++;

    if (ribbons.length > maxTraces) {
      const oldest = ribbons.pop();
      _fadeRemove(oldest);
    }

    _layout();
    const planted = ribbons.find(r => r.traceId === trace.id);
    if (planted) {
      const wideZ = Math.max(4.5, Math.min(9.5, 4.0 + Math.sqrt(ribbons.length) * 0.9));
      targetCamX = planted.group.position.x * 0.20;
      targetCamY = 1.72;
      _targetCamZ = Math.max(2.65, Math.min(3.45, wideZ - 3.2));
      setTimeout(() => {
        targetCamX = 0;
        targetCamY = 2.0;
        _targetCamZ = wideZ;
      }, 7200);
    }
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
    breatheFrame = (breatheFrame + 1) % BREATHE_MOD;
    animFrame = (animFrame + 1) % ANIM_MOD;

    // rotation off â€” garden is static

    camera.position.x += (targetCamX    - camera.position.x) * 0.006;
    camera.position.y += (targetCamY    - camera.position.y) * 0.006;
    camera.position.z += (_targetCamZ   - camera.position.z) * 0.06;
    camera.lookAt(0, -0.5, 0);

    const n = ribbons.length;
    for (let i = 0; i < n; i++) {
      const r = ribbons[i];

      // Fade in
      if (r.opacity < 1.0) {
        r.opacity = Math.min(1.0, r.opacity + 0.011);
      }

      if (r.planting && r.skelCanvas) {
        const age = clock - r.planting.start;
        const growEnd = r.planting.duration;
        const releaseStart = growEnd + r.planting.hold;
        const releaseEnd = releaseStart + r.planting.releaseDuration;
        const grow = _easeOutCubic(Math.min(1, age / growEnd));

        r.materials[0].mat.opacity = r.materials[0].targetAlpha;
        _drawPlantedFrame(r, age);

        if (r.skelSprite) {
          const fieldScale = _fieldScale(r.traceScale);
          const sc = fieldScale;
          r.skelSprite.scale.set(1.10 * sc, 2.75 * sc, 1.0);
        }

        if (age < releaseStart) {
          r.group.position.x = r.planting.x;
          r.group.position.y = 0.72 - grow * 0.38;
          r.group.position.z = r.planting.z;
          continue;
        }

        if (age < releaseEnd) {
          const release = _easeOutCubic((age - releaseStart) / r.planting.releaseDuration);
          r.group.position.x = r.planting.x * (1 - release) + (r.targetX + gardenPanX) * release;
          r.group.position.y = (0.34 * (1 - release)) + (r.baseY + Math.sin(clock * r.swayFreq + r.swaySeed) * 0.32) * release;
          r.group.position.z = r.planting.z * (1 - release) + (r.targetZ + gardenPanZ) * release;
          continue;
        }

        r.planting = null;
        r.lastDrawnFrame = -1;
      }

      // Apply opacity and animation per material type
      if (r.isLegacy) {
        // Legacy TubeGeometry: straight opacity scale
        r.materials.forEach(({ mat, targetAlpha }) => {
          mat.opacity = r.opacity * targetAlpha;
        });
      } else if (r.skelCanvas) {
        r.materials[0].mat.opacity = r.opacity * r.materials[0].targetAlpha;

        const shouldAnimate  = i < ANIM_SLOTS || r.isHighlighted;
        const shouldBreathe  = !shouldAnimate && i < BREATHE_SLOTS;
        const shouldStarAnim = !r.starAnimDone && r.starAnimStart >= 0;

        if (shouldAnimate && r.skelFrames) {
          const N = r.skelFrames.length;
          r.playhead = (r.playhead + dt * r.playRate) % N;
          const ph = Math.floor(r.playhead);

          if ((animFrame === 0 && ph !== r.lastDrawnFrame) || shouldStarAnim) {
            if (ph !== r.lastDrawnFrame) r.lastDrawnFrame = ph;
            const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
            r.skelCtx.clearRect(0, 0, CW, CH);
            if (r.bloomStart > 0) _drawBloom(r.skelCtx, CW, CH, clock - r.bloomStart);
            for (let t = 3; t >= 1; t--) {
              const idx = ((ph - t) + N * 3) % N;
              const a = 0.06 * Math.pow(0.52, t - 1);
              customSkel.draw(r.skelCtx, r.skelFrames[idx].pose || r.skelFrames[idx].kp, CW, CH, a, r.skelSeed, 0, r.palette);
            }
            customSkel.draw(r.skelCtx, r.skelFrames[ph].pose || r.skelFrames[ph].kp, CW, CH, 0.86, r.skelSeed, clock, r.palette);
            _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);
            if (shouldStarAnim) _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);
            r.boneTex.needsUpdate = true;
          }
        } else if (shouldBreathe && r.skelFrames && (breatheFrame === 0 || shouldStarAnim)) {
          const midIdx = Math.floor(r.skelFrames.length / 2);
          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
          r.skelCtx.clearRect(0, 0, CW, CH);
          if (r.bloomStart > 0) _drawBloom(r.skelCtx, CW, CH, clock - r.bloomStart);
          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].pose || r.skelFrames[midIdx].kp, CW, CH, 0.80, r.skelSeed, clock, r.palette);
          _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);
          if (shouldStarAnim) _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);
          r.boneTex.needsUpdate = true;
        } else if (!r.skelSettled && !shouldBreathe && r.skelFrames) {
          r.skelSettled = true;
          const midIdx = Math.floor(r.skelFrames.length / 2);
          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
          r.skelCtx.clearRect(0, 0, CW, CH);
          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].pose || r.skelFrames[midIdx].kp, CW, CH, 0.80, r.skelSeed, 0, r.palette);
          _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);
          if (shouldStarAnim) _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);
          r.boneTex.needsUpdate = true;
        } else if (r.skelSettled && shouldStarAnim && r.skelFrames) {
          const midIdx = Math.floor(r.skelFrames.length / 2);
          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
          r.skelCtx.clearRect(0, 0, CW, CH);
          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].pose || r.skelFrames[midIdx].kp, CW, CH, 0.80, r.skelSeed, 0, r.palette);
          _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);
          _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);
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

      // Gentle bob over the dome (smaller than the old flat-field 0.32)
      const _swayAmp = PLANET.enabled ? PLANET.swayAmp : 0.32;
      r.group.position.y = r.baseY + Math.sin(clock * r.swayFreq + r.swaySeed) * _swayAmp;

      r.group.position.x += (r.targetX + gardenPanX - r.group.position.x) * 0.14;
      r.group.position.z += (r.targetZ + gardenPanZ - r.group.position.z) * 0.14;
    }

    // Auto-spin removed — the garden is manual-orbit only and holds its position on release.

    // Key the sky to the orbit: same drag/two-finger input pans both (× parallax).
    if (grassMesh && grassMesh.material && grassMesh.material.uniforms && grassMesh.material.uniforms.iTime) {
      grassMesh.material.uniforms.iTime.value = clock * 1000;
    }

    if (skySphere) {
      skySphere.rotation.x = SKY.tiltX + Math.sin(clock * 0.035) * 0.015;
      skySphere.rotation.y = SKY.yaw + gardenGroup.rotation.y * SKY.parallax + clock * SKY.drift;
    }
    if (auroraMesh) {
      auroraMesh.material.uniforms.uTime.value = clock;
      auroraMesh.rotation.x = SKY.tiltX + Math.sin(clock * 0.025) * 0.02;
      auroraMesh.rotation.y = SKY.yaw + gardenGroup.rotation.y * (SKY.parallax * 0.92) + clock * AURORA.speed;
    }

    renderer.render(scene, camera);
  }

  /* â”€â”€ Resize â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function resize() {
    // getBoundingClientRect forces a layout reflow, giving reliable dimensions
    // even immediately after an orientationchange event on Android Chrome.
    const rect = canvas.getBoundingClientRect();
    const nW = Math.round(rect.width)  || window.innerWidth;
    const nH = Math.round(rect.height) || window.innerHeight;
    renderer.setSize(nW, nH, false);
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
    if (auroraMesh) auroraMesh.material.uniforms.uResolution.value.set(nW, nH);
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
    if (planetMesh) {
      gardenGroup.remove(planetMesh);
      planetMesh.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
          (Array.isArray(c.material) ? c.material : [c.material]).forEach(m => {
            ['map', 'normalMap', 'metalnessMap', 'roughnessMap'].forEach(k => { if (m[k]) m[k].dispose(); });
            m.dispose();
          });
        }
      });
    }
    if (grassMesh) {
      gardenGroup.remove(grassMesh);
      grassMesh.geometry.dispose();
      if (grassMesh.userData.grassTextures) grassMesh.userData.grassTextures.forEach(t => t.dispose());
      grassMesh.material.dispose();
    }
    if (lakeViewer) {
      if (lakeViewer.parent) lakeViewer.parent.remove(lakeViewer);
      if (typeof lakeViewer.dispose === 'function') { try { lakeViewer.dispose(); } catch (e) {} }
      lakeViewer = null;
    }
    if (skySphere) {
      scene.remove(skySphere);
      skySphere.geometry.dispose();
      if (skySphere.material.map) skySphere.material.map.dispose();
      skySphere.material.dispose();
    }
    if (auroraMesh) {
      scene.remove(auroraMesh);
      auroraMesh.geometry.dispose();
      auroraMesh.material.dispose();
    }
    renderer.dispose();
  }

  function setPan(x, z) {
    gardenPanX = x;
    gardenPanZ = z;
  }

  function setZoom(camZ) {
    _targetCamZ = Math.max(_CAM_Z_MIN, Math.min(_CAM_Z_MAX, camZ));
  }

  function getZoom() { return _targetCamZ; }

  // Manual orbit (desktop LMB-drag). Pause the idle auto-spin via setAutoRotate(false).
  function rotateBy(deltaRad) { gardenGroup.rotation.y += deltaRad; }
  function setAutoRotate(on) { _autoRotate = !!on; }

  function renderNow() { renderer.render(scene, camera); }

  function getDebugInfo() { return { ..._debug, graphicsQuality, lowPowerGarden, highGraphics }; }

  function getViewState() {
    return {
      zoom: _targetCamZ,
      rotationY: gardenGroup.rotation.y,
      targetCamX,
      targetCamY,
      panX: gardenPanX,
      panZ: gardenPanZ,
    };
  }

  function setViewState(state) {
    if (!state || typeof state !== 'object') return;
    if (Number.isFinite(state.zoom)) {
      _targetCamZ = Math.max(_CAM_Z_MIN, Math.min(_CAM_Z_MAX, state.zoom));
      camera.position.z = _targetCamZ;
    }
    if (Number.isFinite(state.rotationY)) gardenGroup.rotation.y = state.rotationY;
    if (Number.isFinite(state.targetCamX)) {
      targetCamX = Math.max(-2.4, Math.min(2.4, state.targetCamX));
      camera.position.x = targetCamX;
    }
    if (Number.isFinite(state.targetCamY)) {
      targetCamY = Math.max(1.3, Math.min(2.7, state.targetCamY));
      camera.position.y = targetCamY;
    }
    if (Number.isFinite(state.panX)) gardenPanX = Math.max(-3, Math.min(3, state.panX));
    if (Number.isFinite(state.panZ)) gardenPanZ = Math.max(-3, Math.min(3, state.panZ));
  }

  return { loadBatch, addTrace, plantTrace, update, setOrientation, setPan, setZoom, getZoom, rotateBy, setAutoRotate, setSky, setWorldTheme, resize, destroy, renderNow, getDebugInfo, getViewState, setViewState };
}
