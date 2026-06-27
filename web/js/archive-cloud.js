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
import { loadCustomSkel } from './custom-skel-draw.js?v=16';

const GOLDEN   = Math.PI * (3 - Math.sqrt(5)); // ~137.5Â°, sunflower angle
const MAX_R    = 2.8;
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
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

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
  const camera = new THREE.PerspectiveCamera(72, W / H, 0.01, 100);
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
  gardenGroup.position.y = -2.5;
  scene.add(gardenGroup);

  /* â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let gardenPanX = 0, gardenPanY = 0, gardenPanZ = 0;
  let _targetCamZ = 5.5;
  const _CAM_Z_MIN = 2.5, _CAM_Z_MAX = 12.0;

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
  const ANIM_SLOTS   = 12;  // most-recent N traces: full pose cycling + live petals
  const BREATHE_SLOTS = 50; // next traces: petal breathing only (fixed mid-frame, live clock)
  let breatheFrame = 0;     // incremented each update(); breathe redraws throttled to ~15 fps

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
        const kp = frame.kp;
        const lSh = kp[5], rSh = kp[6], lHip = kp[11], rHip = kp[12];
        const shOk  = lSh  && rSh  && (lSh.s  ?? 0) > 0.15 && (rSh.s  ?? 0) > 0.15;
        const hipOk = lHip && rHip && (lHip.s ?? 0) > 0.15 && (rHip.s ?? 0) > 0.15;
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
    const _CW = 384, _CH = 960, _PAD = 20;
    let fitScale = 1.0, pivotNX = 0.50, pivotNY = 0.60;
    {
      let bMinX = Infinity, bMaxX = -Infinity;
      let bMinY = Infinity, bMaxY = -Infinity;

      renderFrames.forEach(frame => {
        // Anchor-shifted keypoints mapped to estimated canvas pixels
        const pts = frame.kp.map(k => ({
          x: ((k.x ?? 0) + anchorDX) * _CW,
          y: ((k.y ?? 0) + anchorDY) * _CH,
          s: k.s ?? k.score ?? 0,
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
        const lSh = pts[5], rSh = pts[6];
        if (lSh && rSh && lSh.s > 0.10 && rSh.s > 0.10) {
          const sPx  = Math.hypot(rSh.x - lSh.x, rSh.y - lSh.y);
          const midX = (lSh.x + rSh.x) / 2;
          const midY = (lSh.y + rSh.y) / 2;
          const nose = pts[0];
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

    const skelFrames = renderFrames.map(frame => ({
      kp: frame.kp.map(kp => {
        const nx = (kp.x ?? 0) + anchorDX;
        const ny = (kp.y ?? 0) + anchorDY;
        return {
          ...kp,
          x: pivotNX + (nx - pivotNX) * fitScale,
          y: pivotNY + (ny - pivotNY) * fitScale,
        };
      }),
    }));

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
      const CW = 384, CH = 960;   // wider for wide gestures, taller for petal headroom (0.4 ratio matches sprite)
      const oc  = document.createElement('canvas');
      oc.width  = CW; oc.height = CH;
      const octx = oc.getContext('2d');

      // Initial draw: middle frame as a settled pose (updated later in update())
      const midFrame = skelFrames[Math.floor(skelFrames.length / 2)];
      customSkel.draw(octx, midFrame.kp, CW, CH, 0.68, seed, 0, palette);
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
        materials:   [{ mat: spriteMat, targetAlpha: 0.95 }],
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
    const adaptMaxR = Math.max(3.0, Math.min(5.5, 5.5 - N * 0.06));

    ribbons.forEach((r, i) => {
      // Full radius range always used: 2 entries = min vs max, N entries fill evenly.
      // This spreads few entries wide; many entries pack naturally via the golden angle.
      const frac   = N <= 1 ? 0.5 : i / (N - 1);
      const radius = MIN_R + frac * (adaptMaxR - MIN_R);
      const angle  = i * GOLDEN;
      r.targetX = Math.cos(angle) * radius;   // no X clamp — let figures spread naturally
      r.targetZ = Math.sin(angle) * radius;
      r.baseY   = (1 - frac) * 0.8;
      // Scale the sprite — global density mult × per-contributor body scale
      if (r.skelSprite) {
        const sc = spriteScaleMult * (r.traceScale || 1.0);
        r.skelSprite.scale.set(1.10 * sc, 2.75 * sc, 1.0);
      }
      if (instant) {
        r.group.position.x = r.targetX;
        r.group.position.z = r.targetZ;
      }
    });
  }
  function _addToGarden(trace, isHighlighted, isNew = false) {
    const palette    = _tracePalette(trace);
    const traceScale = _traceScale(trace);
    const result     = _buildTrace(trace, palette, traceScale);
    if (!result) return;

    const { group, materials, boneTex, isLegacy, sprite,
            skelFrames, skelCanvas, skelCtx, skelSeed,
            labelText, strokeArc } = result;
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
    breatheFrame = (breatheFrame + 1) % 4;  // throttle breathe-slot redraws to ~15 fps

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

          if (ph !== r.lastDrawnFrame || shouldStarAnim) {
            if (ph !== r.lastDrawnFrame) r.lastDrawnFrame = ph;
            const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
            r.skelCtx.clearRect(0, 0, CW, CH);
            if (r.bloomStart > 0) _drawBloom(r.skelCtx, CW, CH, clock - r.bloomStart);
            for (let t = 3; t >= 1; t--) {
              const idx = ((ph - t) + N * 3) % N;
              const a = 0.06 * Math.pow(0.52, t - 1);
              customSkel.draw(r.skelCtx, r.skelFrames[idx].kp, CW, CH, a, r.skelSeed, 0, r.palette);
            }
            customSkel.draw(r.skelCtx, r.skelFrames[ph].kp, CW, CH, 0.86, r.skelSeed, clock, r.palette);
            _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);
            if (shouldStarAnim) _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);
            r.boneTex.needsUpdate = true;
          }
        } else if (shouldBreathe && r.skelFrames && (breatheFrame === 0 || shouldStarAnim)) {
          const midIdx = Math.floor(r.skelFrames.length / 2);
          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
          r.skelCtx.clearRect(0, 0, CW, CH);
          if (r.bloomStart > 0) _drawBloom(r.skelCtx, CW, CH, clock - r.bloomStart);
          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].kp, CW, CH, 0.80, r.skelSeed, clock, r.palette);
          _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);
          if (shouldStarAnim) _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);
          r.boneTex.needsUpdate = true;
        } else if (!r.skelSettled && !shouldBreathe && r.skelFrames) {
          r.skelSettled = true;
          const midIdx = Math.floor(r.skelFrames.length / 2);
          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
          r.skelCtx.clearRect(0, 0, CW, CH);
          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].kp, CW, CH, 0.80, r.skelSeed, 0, r.palette);
          _drawLabel(r.skelCtx, CW, CH, r.labelText, r.palette && r.palette.bone);
          if (shouldStarAnim) _drawStarAnim(r.skelCtx, CW, CH, r, clock - r.starAnimStart);
          r.boneTex.needsUpdate = true;
        } else if (r.skelSettled && shouldStarAnim && r.skelFrames) {
          const midIdx = Math.floor(r.skelFrames.length / 2);
          const CW = r.skelCanvas.width, CH = r.skelCanvas.height;
          r.skelCtx.clearRect(0, 0, CW, CH);
          customSkel.draw(r.skelCtx, r.skelFrames[midIdx].kp, CW, CH, 0.80, r.skelSeed, 0, r.palette);
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

      // No autonomous breathing â€” figures stand still
      r.group.position.y = r.baseY + Math.sin(clock * r.swayFreq + r.swaySeed) * 0.32;

      r.group.position.x += (r.targetX + gardenPanX - r.group.position.x) * 0.14;
      r.group.position.z += (r.targetZ + gardenPanZ - r.group.position.z) * 0.14;
    }

    gardenGroup.rotation.y += 0.0007;

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

  function setPan(x, z) {
    gardenPanX = x;
    gardenPanZ = z;
  }

  function setZoom(camZ) {
    _targetCamZ = Math.max(_CAM_Z_MIN, Math.min(_CAM_Z_MAX, camZ));
  }

  function getZoom() { return _targetCamZ; }

  function renderNow() { renderer.render(scene, camera); }

  function getDebugInfo() { return { ..._debug }; }

  return { loadBatch, addTrace, update, setOrientation, setPan, setZoom, getZoom, resize, destroy, renderNow, getDebugInfo };
}



