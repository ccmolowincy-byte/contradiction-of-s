/* custom-skel-draw.js
 * Landmark-aware red-star body rig for live camera pose tracking.
 *
 * Input can be either:
 * - MediaPipe Pose Landmarker landmarks: 33 normalized points with name/visibility.
 * - Legacy MoveNet/COCO keypoints: 17 normalized points.
 */

const MIN_SCORE = 0.34;

const MP = {
  nose: 0,
  leftEyeInner: 1, leftEye: 2, leftEyeOuter: 3,
  rightEyeInner: 4, rightEye: 5, rightEyeOuter: 6,
  leftEar: 7, rightEar: 8,
  mouthLeft: 9, mouthRight: 10,
  leftShoulder: 11, rightShoulder: 12,
  leftElbow: 13, rightElbow: 14,
  leftWrist: 15, rightWrist: 16,
  leftPinky: 17, rightPinky: 18,
  leftIndex: 19, rightIndex: 20,
  leftThumb: 21, rightThumb: 22,
  leftHip: 23, rightHip: 24,
  leftKnee: 25, rightKnee: 26,
  leftAnkle: 27, rightAnkle: 28,
  leftHeel: 29, rightHeel: 30,
  leftFootIndex: 31, rightFootIndex: 32,
};

const COCO_TO_MP = {
  0: MP.nose,
  1: MP.leftEye, 2: MP.rightEye,
  3: MP.leftEar, 4: MP.rightEar,
  5: MP.leftShoulder, 6: MP.rightShoulder,
  7: MP.leftElbow, 8: MP.rightElbow,
  9: MP.leftWrist, 10: MP.rightWrist,
  11: MP.leftHip, 12: MP.rightHip,
  13: MP.leftKnee, 14: MP.rightKnee,
  15: MP.leftAnkle, 16: MP.rightAnkle,
};

const BONES = [
  [MP.leftShoulder, MP.rightShoulder],
  [MP.leftShoulder, MP.leftElbow], [MP.leftElbow, MP.leftWrist],
  [MP.rightShoulder, MP.rightElbow], [MP.rightElbow, MP.rightWrist],
  [MP.leftWrist, MP.leftIndex], [MP.leftWrist, MP.leftThumb], [MP.leftWrist, MP.leftPinky],
  [MP.rightWrist, MP.rightIndex], [MP.rightWrist, MP.rightThumb], [MP.rightWrist, MP.rightPinky],
  [MP.leftShoulder, MP.leftHip], [MP.rightShoulder, MP.rightHip],
  [MP.leftHip, MP.rightHip],
  [MP.leftHip, MP.leftKnee], [MP.leftKnee, MP.leftAnkle],
  [MP.rightHip, MP.rightKnee], [MP.rightKnee, MP.rightAnkle],
  [MP.leftAnkle, MP.leftHeel], [MP.leftHeel, MP.leftFootIndex],
  [MP.rightAnkle, MP.rightHeel], [MP.rightHeel, MP.rightFootIndex],
];

const JOINTS = [
  MP.leftShoulder, MP.rightShoulder,
  MP.leftElbow, MP.rightElbow,
  MP.leftWrist, MP.rightWrist,
  MP.leftIndex, MP.rightIndex,
  MP.leftThumb, MP.rightThumb,
  MP.leftHip, MP.rightHip,
  MP.leftKnee, MP.rightKnee,
  MP.leftAnkle, MP.rightAnkle,
  MP.leftFootIndex, MP.rightFootIndex,
];

const STAR_BY_JOINT = {
  [MP.nose]: 0,
  [MP.leftEar]: 4, [MP.rightEar]: 4,
  [MP.leftShoulder]: 1, [MP.rightShoulder]: 1,
  [MP.leftElbow]: 2, [MP.rightElbow]: 2,
  [MP.leftWrist]: 3, [MP.rightWrist]: 3,
  [MP.leftIndex]: 4, [MP.rightIndex]: 4,
  [MP.leftThumb]: 4, [MP.rightThumb]: 4,
  [MP.leftHip]: 0, [MP.rightHip]: 0,
  [MP.leftKnee]: 2, [MP.rightKnee]: 2,
  [MP.leftAnkle]: 3, [MP.rightAnkle]: 3,
  [MP.leftFootIndex]: 4, [MP.rightFootIndex]: 4,
  neck: 0,
  pelvis: 0,
};

const JOINT_SIZE = {
  [MP.nose]: 0.18,
  [MP.leftShoulder]: 0.24, [MP.rightShoulder]: 0.24,
  [MP.leftElbow]: 0.19, [MP.rightElbow]: 0.19,
  [MP.leftWrist]: 0.17, [MP.rightWrist]: 0.17,
  [MP.leftHip]: 0.23, [MP.rightHip]: 0.23,
  [MP.leftKnee]: 0.19, [MP.rightKnee]: 0.19,
  [MP.leftAnkle]: 0.17, [MP.rightAnkle]: 0.17,
  neck: 0.20,
  pelvis: 0.20,
};

function loadImg(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function scoreOf(p) {
  if (!p) return 0;
  return p.s ?? p.score ?? p.visibility ?? p.presence ?? 0;
}

function visible(p, min = MIN_SCORE) {
  return !!p && Number.isFinite(p.x) && Number.isFinite(p.y) && scoreOf(p) >= min;
}

function asMediaPipePoints(kp, W, H) {
  const out = Array.from({ length: 33 }, () => null);
  if (!kp || !kp.length) return out;

  if (kp.length >= 33 || kp.model === 'mediapipe_pose_landmarker') {
    kp.forEach((p, i) => {
      out[i] = {
        x: (p.x ?? 0) * W,
        y: (p.y ?? 0) * H,
        s: scoreOf(p),
      };
    });
    return out;
  }

  kp.forEach((p, i) => {
    const mpIndex = COCO_TO_MP[i];
    if (mpIndex == null) return;
    out[mpIndex] = {
      x: (p.x ?? 0) * W,
      y: (p.y ?? 0) * H,
      s: scoreOf(p),
    };
  });
  return out;
}

function midpoint(a, b) {
  if (!visible(a) || !visible(b)) return null;
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    s: Math.min(scoreOf(a), scoreOf(b)),
  };
}

function bodyScale(pts, W, H) {
  const shoulders = midpoint(pts[MP.leftShoulder], pts[MP.rightShoulder]);
  if (shoulders) {
    return Math.max(36, Math.hypot(
      pts[MP.rightShoulder].x - pts[MP.leftShoulder].x,
      pts[MP.rightShoulder].y - pts[MP.leftShoulder].y
    ));
  }

  const hips = midpoint(pts[MP.leftHip], pts[MP.rightHip]);
  if (hips) {
    return Math.max(34, Math.hypot(
      pts[MP.rightHip].x - pts[MP.leftHip].x,
      pts[MP.rightHip].y - pts[MP.leftHip].y
    ) * 1.35);
  }

  const seen = pts.filter(p => visible(p, 0.38));
  if (seen.length >= 2) {
    const xs = seen.map(p => p.x);
    const ys = seen.map(p => p.y);
    return Math.max(30, Math.min(
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
      Math.min(W, H) * 0.32
    ));
  }
  return Math.min(W, H) * 0.16;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function estimateHead(pts, scale) {
  const lSh = pts[MP.leftShoulder];
  const rSh = pts[MP.rightShoulder];
  const shoulders = midpoint(lSh, rSh);
  const nose = pts[MP.nose];

  if (shoulders && visible(lSh, 0.18) && visible(rSh, 0.18)) {
    const shoulderWidth = Math.max(34, Math.hypot(rSh.x - lSh.x, rSh.y - lSh.y));
    const rx = Math.max(24, shoulderWidth * 0.52);
    const ry = Math.max(30, shoulderWidth * 0.62);
    const baseX = shoulders.x;
    const baseY = shoulders.y - shoulderWidth * 0.82;
    let x = baseX;
    let y = baseY;

    if (visible(nose, 0.18)) {
      const nx = clamp(nose.x, baseX - shoulderWidth * 0.34, baseX + shoulderWidth * 0.34);
      const ny = clamp(
        nose.y - shoulderWidth * 0.18,
        shoulders.y - shoulderWidth * 1.14,
        shoulders.y - shoulderWidth * 0.38
      );
      x = lerp(baseX, nx, 0.22);
      y = lerp(baseY, ny, 0.18);
    }

    return {
      x,
      y,
      rx,
      ry,
      angle: clamp(((rSh.y - lSh.y) / shoulderWidth) * 0.18, -0.16, 0.16),
      s: shoulders.s,
    };
  }

  if (visible(nose, 0.22)) {
    return {
      x: nose.x,
      y: nose.y - scale * 0.20,
      rx: Math.max(22, scale * 0.44),
      ry: Math.max(28, scale * 0.54),
      angle: 0,
      s: scoreOf(nose) * 0.75,
    };
  }

  return null;
}

function drawHeadPlaceholder(ctx, head, scale, alpha) {
  if (!head) return;
  const a = alpha * Math.min(1, (head.s || 0.5) * 1.35);
  if (a < 0.01) return;

  ctx.save();
  ctx.translate(head.x, head.y);
  ctx.rotate(head.angle || 0);
  ctx.globalAlpha = a;
  ctx.shadowColor = 'rgba(42,22,18,0.18)';
  ctx.shadowBlur = Math.max(4, scale * 0.045);
  ctx.shadowOffsetY = Math.max(1, scale * 0.018);

  const fill = ctx.createRadialGradient(
    -head.rx * 0.25,
    -head.ry * 0.35,
    head.rx * 0.12,
    0,
    0,
    Math.max(head.rx, head.ry)
  );
  fill.addColorStop(0, 'rgba(255,250,241,0.96)');
  fill.addColorStop(0.65, 'rgba(247,240,226,0.90)');
  fill.addColorStop(1, 'rgba(235,225,206,0.82)');

  ctx.beginPath();
  ctx.ellipse(0, 0, head.rx, head.ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(215,56,76,0.74)';
  ctx.lineWidth = Math.max(1.5, scale * 0.018);
  ctx.stroke();

  ctx.globalAlpha = a * 0.42;
  ctx.strokeStyle = 'rgba(215,56,76,0.20)';
  ctx.lineWidth = Math.max(0.8, scale * 0.008);
  ctx.beginPath();
  ctx.ellipse(-head.rx * 0.08, -head.ry * 0.02, head.rx * 0.72, head.ry * 0.82, 0.04, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBone(ctx, a, b, scale, alpha) {
  if (!visible(a) || !visible(b)) return;
  ctx.save();
  ctx.globalAlpha = alpha * Math.min(scoreOf(a), scoreOf(b));
  ctx.strokeStyle = 'rgba(215,56,76,0.92)';
  ctx.lineWidth = Math.max(2, scale * 0.035);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(215,56,76,0.26)';
  ctx.shadowBlur = Math.max(3, scale * 0.035);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawStar(ctx, img, x, y, size, alpha, rot) {
  if (!img || alpha < 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(215,56,76,0.35)';
  ctx.shadowBlur = size * 0.22;
  ctx.drawImage(img, -size / 2, -size / 2, size, size);
  ctx.restore();
}

export async function loadCustomSkel(basePath = 'assets/skel/') {
  const starBase = basePath.replace(/skel\/?$/, 'stars/');
  const stars = await Promise.all([1, 2, 3, 4, 5].map(i => loadImg(starBase + 'star' + i + '.png')));
  let clock = 0;

  function drawRig(ctx, kp, W, H, alpha = 1) {
    const pts = asMediaPipePoints(kp, W, H);
    const scale = bodyScale(pts, W, H);
    const neck = midpoint(pts[MP.leftShoulder], pts[MP.rightShoulder]);
    const pelvis = midpoint(pts[MP.leftHip], pts[MP.rightHip]);
    const head = estimateHead(pts, scale);

    drawHeadPlaceholder(ctx, head, scale, alpha);
    BONES.forEach(([a, b]) => drawBone(ctx, pts[a], pts[b], scale, alpha));
    if (neck && pelvis) drawBone(ctx, neck, pelvis, scale, alpha * 0.92);

    JOINTS.forEach(i => {
      const p = pts[i];
      if (!visible(p)) return;
      const img = stars[STAR_BY_JOINT[i] || 0];
      const size = Math.max(16, scale * (JOINT_SIZE[i] || 0.15));
      drawStar(ctx, img, p.x, p.y, size, alpha * Math.min(1, scoreOf(p) * 1.25), (i % 5) * 0.19 + clock * 0.08);
    });

    if (neck) {
      drawStar(ctx, stars[STAR_BY_JOINT.neck], neck.x, neck.y, Math.max(18, scale * JOINT_SIZE.neck), alpha * neck.s, -0.1);
    }
    if (pelvis) {
      drawStar(ctx, stars[STAR_BY_JOINT.pelvis], pelvis.x, pelvis.y, Math.max(18, scale * JOINT_SIZE.pelvis), alpha * pelvis.s, 0.16);
    }
  }

  return {
    update(dt) {
      clock += Math.min(Math.max(dt || 0, 0), 0.05);
    },
    draw(ctx, kp, W, H, alpha = 1) {
      drawRig(ctx, kp, W, H, alpha);
    },
    drawBody(ctx, kp, W, H, alpha = 1) {
      drawRig(ctx, kp, W, H, alpha);
    },
    drawAccumulated(ctx, frames, W, H, alphaFn) {
      if (!frames || !frames.length) return;
      frames.forEach((frame, i) => {
        const alpha = alphaFn ? alphaFn(i, frames.length) : (0.08 + 0.22 * (i / frames.length));
        drawRig(ctx, frame.kp || frame.landmarks || frame, W, H, alpha);
      });
    },
  };
}
