/* custom-skel-draw.js — Pain Archive
 *
 * Procedural anatomical skeleton drawn from hand-made PNG assets.
 * Everything stays in the red/crimson family — bone lines first, then stars,
 * then face/void, then petal aura (faintest, bottom layer).
 *
 * Accepts NORMALISED keypoints: { x: 0–1, y: 0–1, s: 0–1 }
 * (s may also be keyed as .score — both are supported)
 *
 * Usage (ES module):
 *   import { loadCustomSkel } from './custom-skel-draw.js';
 *   const skel = await loadCustomSkel();          // once at app startup
 *   skel.update(dt);                              // call each animation frame
 *   skel.draw(ctx, normKps, W, H, alpha, seed);   // draw one skeleton frame
 */

/* ── MoveNet body connections (upper body + hips only — torso & arms) ───── */
const BONES = [
  [5, 6],   // shoulder bar
  [5, 7],   // L upper arm
  [7, 9],   // L forearm
  [6, 8],   // R upper arm
  [8, 10],  // R forearm
  [11, 12], // hip bar
  [11, 13], // L thigh
  [13, 15], // L shin
  [12, 14], // R thigh
  [14, 16], // R shin
];

/*
 * Star → joint mapping (approved by user).
 * Key 'mid' = computed shoulder-midpoint (spine proxy, between kp 5 and 6).
 * Values are star file indices 0–12 (loaded from stars/s00.png … s12.png).
 */
const STAR_MAP = {
  mid: 2,   // Artwork 2: tall/axial             → spine axis point
  5:   3,   // Artwork 3: wide horizontal         → L-shoulder
  6:   7,   // Artwork 7: dynamic/spread          → R-shoulder
  7:   11,  // Artwork 11: rounded pivot          → L-elbow
  8:   4,   // Artwork 4: off-balance             → R-elbow
  9:   1,   // Artwork 1: open/floating           → L-wrist
  10:  5,   // Artwork 5: reaching arm            → R-wrist
  11:  8,   // Artwork 8: wide flat base          → L-hip
  12:  0,   // Artwork 0: compressed              → R-hip
  13:  12,  // Artwork 12: flowing swing          → L-knee
  14:  6,   // Artwork 6: gravity droop           → R-knee
  15:  10,  // Artwork 10: deep root              → L-ankle
  16:  9,   // Artwork 9: small/upward push       → R-ankle
};

/* Star size as fraction of shoulder width — larger stars on prominent joints */
const STAR_SIZE = {
  mid: 0.28, 5: 0.30, 6: 0.30,
  7: 0.22, 8: 0.22,
  9: 0.18, 10: 0.18,
  11: 0.34, 12: 0.34,
  13: 0.24, 14: 0.24,
  15: 0.20, 16: 0.20,
};

/* Fixed per-joint rotation (radians) — makes each star rest naturally */
const STAR_ROT = {
  mid: 0.0, 5: -0.22, 6: 0.18,
  7: 0.30, 8: -0.25,
  9: 0.45, 10: -0.40,
  11: 0.10, 12: -0.08,
  13: 0.18, 14: -0.15,
  15: 0.05, 16: -0.05,
};

/* Minimum keypoint confidence score to draw that joint / bone */
const MIN_SCORE = 0.22;

/* ── Red color family: saturated → deep ────────────────────────────────────
 * Priority hierarchy (highest opacity = most prominent visual):
 *   bone lines > star joints > face/void > flower petal aura
 */
const RED_BONE  = '#8B1212';  // saturated blood red  — bone connections
const RED_STAR  = '#7A1010';  // dark crimson          — joint stars
const RED_FACE  = '#8B1414';  // anatomical red        — face/void
const RED_PETAL = '#A01818';  // bright crimson         — petal aura (dominant flower head)

/* ── Asset loading ──────────────────────────────────────────────────────── */

function _loadImg(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => { console.warn('[CustomSkel] missing asset:', src); resolve(null); };
    img.src = src;
  });
}

/*
 * Recolour a loaded Image to a flat colour, preserving its alpha silhouette.
 * Returns a pre-rendered Canvas element — draw with ctx.drawImage(result, ...).
 * The canvas is created once and reused for every subsequent draw call.
 */
function _recolor(img, color) {
  if (!img) return null;
  const oc  = document.createElement('canvas');
  oc.width  = img.naturalWidth  || img.width  || 256;
  oc.height = img.naturalHeight || img.height || 256;
  const ox  = oc.getContext('2d');
  ox.fillStyle = color;
  ox.fillRect(0, 0, oc.width, oc.height);
  ox.globalCompositeOperation = 'destination-in';
  ox.drawImage(img, 0, 0);
  return oc;
}

/* ── Main export ────────────────────────────────────────────────────────── */

export async function loadCustomSkel(basePath = 'assets/skel/') {

  const assetUrls = [
    basePath + 'petals.png',
    basePath + 'face.png',
    basePath + 'bone.png',
    ...Array.from({ length: 13 }, (_, i) =>
      basePath + 'stars/s' + String(i).padStart(2, '0') + '.png'
    ),
  ];

  const [petalsImg, faceImg, boneImg, ...starImgs] = await Promise.all(
    assetUrls.map(_loadImg)
  );

  const petalsCv = _recolor(petalsImg, RED_PETAL);
  const faceCv   = _recolor(faceImg,   RED_FACE);
  const boneCv   = _recolor(boneImg,   RED_BONE);
  const starCvs  = starImgs.map(img => _recolor(img, RED_STAR));

  let _clock = 0;

  /* ── Internal helpers ─────────────────────────────────────────────────── */

  /* Compute head anchor point from normalized keypoints + shoulder width. */
  function _headCenter(pts, shoulderPx) {
    const lSh = pts[5], rSh = pts[6];
    const midX = (lSh.x + rSh.x) / 2;
    const midY = (lSh.y + rSh.y) / 2;
    const nose = pts[0];
    if (nose.s > 0.12) {
      // Blend nose position with shoulder-midpoint projection
      return {
        x: nose.x * 0.60 + midX * 0.40,
        y: nose.y - shoulderPx * 0.35,
      };
    }
    return { x: midX, y: midY - shoulderPx * 0.55 };
  }

  /* Shape F — 6 ruffled petals, big and asymmetric, irregular angles */
  const PETAL_F = [
    { a: 0.10, l: 1.30, w: 0.52, lean:  3 },
    { a: 1.18, l: 1.18, w: 0.56, lean: -5 },
    { a: 2.28, l: 1.42, w: 0.48, lean:  2 },
    { a: 3.42, l: 1.22, w: 0.54, lean: -4 },
    { a: 4.62, l: 1.38, w: 0.50, lean:  6 },
    { a: 5.52, l: 1.28, w: 0.52, lean: -3 },
  ];

  /* Per-petal breathing frequencies (rad/s) — prime-ish ratios keep phases from syncing. */
  const PETAL_FREQ = [0.13, 0.17, 0.11, 0.19, 0.15, 0.21];

  /* Ruffled petal bezier path only — no save/rotate/fill/stroke. */
  function _ruffPath(o, length, width, lean) {
    const hw = width / 2;
    o.beginPath(); o.moveTo(0, 0);
    o.bezierCurveTo( hw*1.35, -length*.10,  hw*1.55, -length*.32,  hw*1.05, -length*.46);
    o.bezierCurveTo( hw*0.58, -length*.60,  hw*0.52+lean, -length*.84, lean, -length);
    o.bezierCurveTo(-hw*0.52+lean, -length*.84, -hw*0.58, -length*.60, -hw*1.05, -length*.46);
    o.bezierCurveTo(-hw*1.55, -length*.32, -hw*1.35, -length*.10, 0, 0);
    o.closePath();
  }

  /* Draw shape F flower — option C: fill + stroke directly on ctx, per-petal breathing.
   * No offscreen canvas — eliminates the rectangle artifact under AdditiveBlending. */
  function _drawPetals(ctx, hx, hy, shoulderPx, alpha, seed, time) {
    if (alpha < 0.005) return;

    const R   = shoulderPx * 1.6;
    const rot = Math.sin(time * 0.35 + seed * 1.8) * 0.12;

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(rot);

    // ── Fill pass: semi-transparent body ────────────────────────────────────
    ctx.globalAlpha = alpha * 0.38;
    PETAL_F.forEach((p, i) => {
      const s = 1 + 0.18 * Math.sin(time * PETAL_FREQ[i] + p.a + seed * 0.65);
      ctx.save(); ctx.rotate(p.a);
      _ruffPath(ctx, R * p.l * s, R * p.w * s, p.lean);
      ctx.fillStyle = 'rgba(172, 18, 18, 1)';
      ctx.fill();
      ctx.restore();
    });

    // ── Stroke pass: bright petal silhouette ─────────────────────────────────
    ctx.globalAlpha = alpha * 0.88;
    const sw = Math.max(1, R * 0.028);
    PETAL_F.forEach((p, i) => {
      const s = 1 + 0.18 * Math.sin(time * PETAL_FREQ[i] + p.a + seed * 0.65);
      ctx.save(); ctx.rotate(p.a);
      _ruffPath(ctx, R * p.l * s, R * p.w * s, p.lean);
      ctx.strokeStyle = 'rgba(218, 36, 36, 0.88)';
      ctx.lineWidth   = sw;
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }

  /* Dark crimson face oval — sits inside petals, sways with them. */
  function _drawFace(ctx, hx, hy, shoulderPx, alpha, time, seed) {
    if (alpha < 0.005) return;
    const R       = shoulderPx * 1.6;
    const rot     = Math.sin(time * 0.35 + seed * 1.8) * 0.12;
    const breathe = 1.0 + Math.sin(time * 0.22) * 0.006;
    ctx.save();
    ctx.translate(hx, hy + R * 0.04);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha * 0.88;
    ctx.fillStyle = 'rgba(48, 7, 7, 1)';
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 0.76 * breathe, R * 0.31 * breathe, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* Stretch the bone PNG between two points. */
  function _drawBone(ctx, x1, y1, x2, y2, shoulderPx, alpha) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 3) return;
    // Keep bone line quality: cap height to avoid blob look on short segments
    const boneH = Math.min(shoulderPx * 0.068, len / 4.5);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.save();
    ctx.globalAlpha = alpha * 0.88;
    ctx.translate(x1, y1);
    ctx.rotate(angle);
    if (boneCv) {
      ctx.drawImage(boneCv, 0, -boneH / 2, len, boneH);
    } else {
      // Fallback: thin line in bone colour
      ctx.strokeStyle = RED_BONE;
      ctx.lineWidth   = Math.max(1, boneH * 0.4);
      ctx.lineCap     = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.stroke();
    }
    ctx.restore();
  }

  /* Draw one star at a joint position. */
  function _drawStar(ctx, x, y, shoulderPx, jointKey, alpha) {
    const idx = STAR_MAP[jointKey];
    if (idx === undefined || !starCvs[idx] || alpha < 0.004) return;
    const sz  = (STAR_SIZE[jointKey] || 0.24) * shoulderPx;
    const rot = STAR_ROT[jointKey] || 0;
    ctx.save();
    ctx.globalAlpha = alpha * 0.94;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(starCvs[idx], -sz, -sz, sz * 2, sz * 2);
    ctx.restore();
  }

  /* ── Public API ─────────────────────────────────────────────────────────── */

  return {

    /* Advance the internal animation clock. Call once per animation frame. */
    update(dt) {
      _clock += dt;
    },

    /*
     * Draw one skeleton frame onto ctx.
     *
     * kp   — array of 17 normalised keypoints { x:0–1, y:0–1, s:0–1 }
     *         (the .score key is also accepted as a fallback for .s)
     * W, H — canvas pixel dimensions
     * alpha — overall opacity (0–1)
     * seed  — any number; offsets petal drift so each contributor looks distinct
     * time  — explicit clock in seconds (pass null to use internal clock)
     */
    draw(ctx, kp, W, H, alpha = 1.0, seed = 0, time = null) {
      if (!kp || kp.length < 17 || alpha < 0.005) return;

      const t = time !== null ? time : _clock;

      // Map normalised [0-1] keypoints to canvas pixel space
      const pts = kp.map(k => ({
        x: (k.x ?? 0) * W,
        y: (k.y ?? 0) * H,
        s: k.s ?? k.score ?? 0,
      }));

      const lSh = pts[5], rSh = pts[6];
      const shoulderPx = (lSh.s > MIN_SCORE && rSh.s > MIN_SCORE)
        ? Math.hypot(rSh.x - lSh.x, rSh.y - lSh.y)
        : W * 0.28;   // sensible fallback if shoulders not visible

      const { x: hx, y: hy } = _headCenter(pts, shoulderPx);

      // ── Layer 1 (back): petal aura ────────────────────────────────────────
      // Petal cloud is intentionally oversized — clipping at canvas edges is fine
      _drawPetals(ctx, hx, hy, shoulderPx, alpha, seed, t);

      // ── Layer 2: face/void oval — dark crimson, sways with petals
      _drawFace(ctx, hx, hy, shoulderPx, alpha, t, seed);

      // ── Layer 3: bone connection lines ────────────────────────────────────
      BONES.forEach(([a, b]) => {
        if (pts[a].s < MIN_SCORE || pts[b].s < MIN_SCORE) return;
        _drawBone(ctx, pts[a].x, pts[a].y, pts[b].x, pts[b].y, shoulderPx, alpha);
      });

      // ── Layer 4 (front): star joints ─────────────────────────────────────
      // Shoulder midpoint — spine proxy star
      if (lSh.s > MIN_SCORE && rSh.s > MIN_SCORE) {
        _drawStar(ctx, (lSh.x + rSh.x) / 2, (lSh.y + rSh.y) / 2,
          shoulderPx, 'mid', alpha);
      }
      // All other mapped landmark joints
      [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].forEach(i => {
        if (pts[i].s >= MIN_SCORE) {
          _drawStar(ctx, pts[i].x, pts[i].y, shoulderPx, i, alpha);
        }
      });
    },

    /*
     * Draw all frames as a layered accumulated ghost — oldest faintest, newest brightest.
     * Used by the archive to show a snapshot of motion history without per-frame updates.
     *
     * frames  — array of { kp } objects (same format as stored skeletons field)
     * alphaFn — function(frameIndex, totalFrames) → alpha for that frame
     * seed    — per-contributor drift seed
     */
    drawAccumulated(ctx, frames, W, H, alphaFn, seed = 0) {
      if (!frames || frames.length === 0) return;
      frames.forEach((frame, i) => {
        const a = alphaFn(i, frames.length);
        if (a > 0.004) this.draw(ctx, frame.kp, W, H, a, seed, 0);
      });
    },

    /* Body-only draw — bones + star joints, no flower head or face.
     * Used by the recording page so the live tracking overlay shows
     * only the skeletal body without the archive head treatment. */
    drawBody(ctx, kp, W, H, alpha = 1.0) {
      if (!kp || kp.length < 17 || alpha < 0.005) return;

      const pts = kp.map(k => ({
        x: (k.x ?? 0) * W,
        y: (k.y ?? 0) * H,
        s: k.s ?? k.score ?? 0,
      }));

      const lSh = pts[5], rSh = pts[6];
      const shoulderPx = (lSh.s > MIN_SCORE && rSh.s > MIN_SCORE)
        ? Math.hypot(rSh.x - lSh.x, rSh.y - lSh.y)
        : W * 0.28;

      BONES.forEach(([a, b]) => {
        if (pts[a].s < MIN_SCORE || pts[b].s < MIN_SCORE) return;
        _drawBone(ctx, pts[a].x, pts[a].y, pts[b].x, pts[b].y, shoulderPx, alpha);
      });

      if (lSh.s > MIN_SCORE && rSh.s > MIN_SCORE) {
        _drawStar(ctx, (lSh.x + rSh.x) / 2, (lSh.y + rSh.y) / 2, shoulderPx, 'mid', alpha);
      }
      [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].forEach(i => {
        if (pts[i].s >= MIN_SCORE) {
          _drawStar(ctx, pts[i].x, pts[i].y, shoulderPx, i, alpha);
        }
      });
    },
  };
}
