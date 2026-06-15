/* gesture.js — Body movement capture with TF.js MoveNet
 * 4-state flow: loading → preview → recording → review → saving → ar.html
 * All 17 keypoints captured; movement-weighted composite biases toward most-active joint.
 * 5 movement qualities extracted → unique visual_params per trace.
 */
(function () {
  'use strict';

  const SUPA_URL = 'https://kgohdbyctcjgwnfedpkx.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2hkYnljdGNqZ3duZmVkcGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Nzg0MzAsImV4cCI6MjA5NjI1NDQzMH0.Gvz6iZ0hW5VyvSGGBGnakpiyRh8dfeHyX1lmgXfn36c';
  const db = supabase.createClient(SUPA_URL, SUPA_KEY);

  /* ── Single prompt ───────────────────────────────────────────────────────── */
  const PROMPT = 'What movement helps you negotiate with pain?';

  /* ── Recording constants ─────────────────────────────────────────────────── */
  const RECORD_DURATION = 20; // seconds — fixed, auto-stops at zero

  /* ── Upper body joints: permanently 1.5× base weight ────────────────────── */
  const UPPER_BODY = new Set([5, 6, 7, 8, 9, 10, 11, 12]); // L/R shoulder, elbow, wrist, hip

  /* ── MoveNet skeleton connections (pairs of keypoint indices) ────────────── */
  const CONNECTIONS = [
    [0, 1],[0, 2],[1, 3],[2, 4],        // face
    [5, 7],[7, 9],[6, 8],[8, 10],       // arms
    [5, 6],                              // shoulders
    [5, 11],[6, 12],[11, 12],           // torso
    [11, 13],[13, 15],[12, 14],[14, 16] // legs
  ];

  /* ── DOM refs ────────────────────────────────────────────────────────────── */
  const video       = document.getElementById('g-video');
  const overlay     = document.getElementById('g-overlay');
  const ctx         = overlay.getContext('2d');
  const noBodyEl    = document.getElementById('g-no-body');
  const promptEl    = document.getElementById('g-prompt-text');
  const countdownEl  = document.getElementById('g-countdown');
  const progressBarEl = document.getElementById('g-progress-bar');
  const reviewCv    = document.getElementById('g-review-canvas');

  /* ── State ───────────────────────────────────────────────────────────────── */
  let currentState  = 'loading';
  let detector      = null;
  let stream        = null;
  let rafId         = null;
  let sampleIv      = null;
  let elapsedIv     = null;
  let currentFacing = 'user';

  let currentKeypoints = null;
  let noBodyFrames     = 0;      // consecutive frames with no detected pose
  let samples          = [];
  let lastKeypoints    = null;
  let recordingStart   = null;
  let currentPrompt    = '';

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t)    { return a + (b - a) * clamp(t, 0, 1); }

  function setState(s) {
    currentState = s;
    ['loading','preview','recording','review','saving','error'].forEach(id => {
      const el = document.getElementById('s-' + id);
      if (el) el.classList.toggle('hidden', id !== s);
    });
  }

  /* ── Camera ──────────────────────────────────────────────────────────────── */
  async function startCamera(facing) {
    currentFacing = facing || 'user';
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('error'); return false;
    }
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }

    video.classList.toggle('mirrored', currentFacing === 'user');

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: currentFacing },
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
      return true;
    } catch (e) {
      console.warn('Camera:', e);
      setState('error');
      return false;
    }
  }

  /* ── MoveNet init ────────────────────────────────────────────────────────── */
  async function loadDetector() {
    await tf.ready();
    return poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
  }

  /* ── Main init ───────────────────────────────────────────────────────────── */
  async function init() {
    setState('loading');

    currentPrompt = PROMPT;
    promptEl.textContent = PROMPT;

    const camOk = await startCamera('user');
    if (!camOk) return;

    try {
      detector = await loadDetector();
    } catch (e) {
      console.error('MoveNet load failed:', e);
      setState('error');
      return;
    }

    // Resize overlay once video dimensions are known
    resizeOverlay();
    setState('preview');
    startDetectionLoop();
  }

  /* ── Detection loop (runs in all states except saving/error) ─────────────── */
  function startDetectionLoop() {
    async function loop() {
      if (currentState === 'saving' || currentState === 'error' || currentState === 'loading') {
        rafId = requestAnimationFrame(loop);
        return;
      }

      if (detector && video.readyState >= 2 && !video.paused) {
        try {
          const poses = await detector.estimatePoses(video);
          if (poses.length > 0 && poses[0].keypoints) {
            currentKeypoints = poses[0].keypoints;
            noBodyFrames = 0;
          } else {
            currentKeypoints = null;
            noBodyFrames++;
          }
        } catch (_) {
          currentKeypoints = null;
        }
      }

      // "No body in frame" hint — appears after 60 consecutive miss frames
      noBodyEl.style.opacity = noBodyFrames > 60 ? '1' : '0';

      drawOverlay();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
  }

  /* ── Overlay drawing ─────────────────────────────────────────────────────── */
  function resizeOverlay() {
    overlay.width  = overlay.offsetWidth  || window.innerWidth;
    overlay.height = overlay.offsetHeight || (window.innerHeight - 56);
  }

  function drawOverlay() {
    const W = overlay.width;
    const H = overlay.height;
    ctx.clearRect(0, 0, W, H);

    if (currentState === 'recording') {
      // Subtle dark tint to lift skeleton visibility
      ctx.fillStyle = 'rgba(6,10,14,0.28)';
      ctx.fillRect(0, 0, W, H);
    }

    if (currentKeypoints && currentKeypoints.length > 0) {
      drawSkeleton(currentKeypoints, W, H);
    }

    if (currentState === 'recording' && samples.length > 1) {
      drawTrail(samples, W, H);
    }
  }

  function drawSkeleton(kps, W, H) {
    const vW = video.videoWidth  || W;
    const vH = video.videoHeight || H;
    const sx = W / vW;
    const sy = H / vH;

    // Connections — very faint, ghostly X-ray
    ctx.save();
    ctx.strokeStyle = 'rgba(138,188,218,0.20)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    CONNECTIONS.forEach(([a, b]) => {
      const ka = kps[a], kb = kps[b];
      if (!ka || !kb || ka.score < 0.20 || kb.score < 0.20) return;
      ctx.moveTo(ka.x * sx, ka.y * sy);
      ctx.lineTo(kb.x * sx, kb.y * sy);
    });
    ctx.stroke();

    // Keypoints — slightly brighter for upper body
    kps.forEach((kp, i) => {
      if (!kp || kp.score < 0.20) return;
      const x = kp.x * sx;
      const y = kp.y * sy;
      const isUpper = i >= 5 && i <= 12;
      ctx.beginPath();
      ctx.arc(x, y, isUpper ? 3 : 1.8, 0, Math.PI * 2);
      ctx.fillStyle = isUpper
        ? 'rgba(195,222,238,0.52)'
        : 'rgba(138,188,218,0.28)';
      ctx.fill();
    });

    ctx.restore();
  }

  function drawTrail(pts, W, H) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.lineCap    = 'round';
    ctx.lineJoin   = 'round';
    ctx.lineWidth  = 2.2;
    ctx.shadowColor = 'rgba(188,218,235,0.35)';
    ctx.shadowBlur  = 5;

    const n = pts.length;
    for (let i = 1; i < n; i++) {
      const alpha = 0.22 + 0.78 * (i / n);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(188,218,235,${alpha.toFixed(2)})`;
      ctx.moveTo(pts[i-1].x * W, pts[i-1].y * H);
      ctx.lineTo(pts[i].x   * W, pts[i].y   * H);
      ctx.stroke();
    }

    // Bright tip at current position
    const last = pts[n - 1];
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(last.x * W, last.y * H, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220,240,248,0.85)';
    ctx.fill();

    ctx.restore();
  }

  /* ── Recording ───────────────────────────────────────────────────────────── */
  function startRecording() {
    samples        = [];
    lastKeypoints  = null;
    recordingStart = Date.now();
    setState('recording');

    // Sample pose every 80 ms
    sampleIv = setInterval(() => {
      if (currentKeypoints) sampleFrame(currentKeypoints);
    }, 80);

    // Countdown: update every 100ms, auto-stop when reaches zero
    countdownEl.textContent = RECORD_DURATION;
    progressBarEl.style.width = '100%';
    elapsedIv = setInterval(() => {
      const elapsed   = (Date.now() - recordingStart) / 1000;
      const remaining = Math.max(0, RECORD_DURATION - elapsed);
      countdownEl.textContent = Math.ceil(remaining);
      progressBarEl.style.width = ((remaining / RECORD_DURATION) * 100) + '%';
      if (remaining <= 0) stopRecording();
    }, 100);
  }

  function stopRecording() {
    clearInterval(sampleIv);
    clearInterval(elapsedIv);
    sampleIv = elapsedIv = null;

    if (samples.length < 5) {
      // Too brief — back to preview
      setState('preview');
      return;
    }
    setState('review');
    renderReviewTrace();
  }

  /* ── Per-frame sample: movement-weighted composite of all 17 keypoints ───── */
  function sampleFrame(keypoints) {
    const now = Date.now();
    const vW  = video.videoWidth  || 1280;
    const vH  = video.videoHeight || 720;

    // Per-joint velocities (normalised to viewport)
    const velocities = new Array(17).fill(0);
    if (lastKeypoints) {
      keypoints.forEach((kp, i) => {
        const lk = lastKeypoints[i];
        if (kp && lk && kp.score > 0.20 && lk.score > 0.20) {
          const dx = (kp.x - lk.x) / vW;
          const dy = (kp.y - lk.y) / vH;
          velocities[i] = Math.sqrt(dx * dx + dy * dy);
        }
      });
    }

    // Most-active joint this frame
    let maxVel = 0, maxIdx = 0;
    velocities.forEach((v, i) => { if (v > maxVel) { maxVel = v; maxIdx = i; } });

    // Weighted composite:
    // Upper body (shoulders/elbows/wrists/hips) → 1.5× permanent base weight
    // Most-active joint → additional 3× dynamic boost (upper body max = 4.5×)
    let totalW = 0, wx = 0, wy = 0;
    keypoints.forEach((kp, i) => {
      if (!kp || kp.score < 0.20) return;
      const baseW = UPPER_BODY.has(i) ? 1.5 : 1;
      const w     = (i === maxIdx) ? baseW * 3 : baseW;
      wx += kp.x * w;
      wy += kp.y * w;
      totalW += w;
    });

    if (totalW > 0) {
      samples.push({
        x:            wx / totalW / vW,    // normalised 0–1
        y:            wy / totalW / vH,
        t:            now - recordingStart,
        dominantJoint: maxIdx,
        velocity:     maxVel,
      });
    }

    lastKeypoints = keypoints.map(kp => kp ? { ...kp } : null);
  }

  /* ── Visual params: 5 movement qualities → unique rendering fingerprint ──── */
  function computeVisualParams(pts) {
    const n = pts.length;
    const fallback = {
      vertebraCount: 12, tubeRadius: 0.034,
      titaniumOpacity: 0.40, braceOpacity: 0.055,
      orientation: 'vertical', dominantJoint: 5,
    };
    if (n < 5) return fallback;

    // 1. Speed: mean velocity (already normalised to viewport)
    const meanVel  = pts.reduce((s, p) => s + p.velocity, 0) / n;
    const speedN   = clamp(meanVel / 0.04, 0, 1); // 0.04 = fast threshold

    // 2. Range: diagonal of bounding box
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const xR = Math.max(...xs) - Math.min(...xs);
    const yR = Math.max(...ys) - Math.min(...ys);
    const rangeN = clamp(Math.sqrt(xR * xR + yR * yR) / 0.85, 0, 1);

    // 3. Repetitions: direction reversals per second in X + Y
    let reversals = 0;
    let ldx = 0, ldy = 0;
    for (let i = 1; i < n; i++) {
      const dx = pts[i].x - pts[i-1].x;
      const dy = pts[i].y - pts[i-1].y;
      if (Math.abs(dx) > 0.003) {
        if (ldx !== 0 && Math.sign(dx) !== Math.sign(ldx)) reversals++;
        ldx = dx;
      }
      if (Math.abs(dy) > 0.003) {
        if (ldy !== 0 && Math.sign(dy) !== Math.sign(ldy)) reversals++;
        ldy = dy;
      }
    }
    const dur  = Math.max((pts[n-1].t - pts[0].t) / 1000, 1);
    const freqN = clamp(reversals / dur / 5, 0, 1); // 5 rev/sec = high frequency

    // 4. Smoothness: 1 - CV(velocity)
    const varV = pts.reduce((s, p) => s + (p.velocity - meanVel) ** 2, 0) / n;
    const cv   = meanVel > 0 ? Math.sqrt(varV) / meanVel : 1;
    const smoothN = clamp(1 - cv * 0.5, 0, 1);

    // 5. Dominant joint
    const jCounts = new Array(17).fill(0);
    pts.forEach(p => jCounts[p.dominantJoint]++);
    const domJoint = jCounts.indexOf(Math.max(...jCounts));

    // 6. Orientation: horizontal or vertical dominant axis
    const orientation = xR > yR ? 'horizontal' : 'vertical';

    return {
      // Frequency → vertebra count (fast oscillation = dense, slow reach = sparse)
      vertebraCount:   Math.round(lerp(8, 22, freqN)),
      // Range → tube radius (large movement = wider tube)
      tubeRadius:      parseFloat(lerp(0.022, 0.058, rangeN).toFixed(4)),
      // Frequency + speed → titanium rod visibility (repetition = load-bearing hardware)
      titaniumOpacity: parseFloat(lerp(0.12, 0.82, (freqN + speedN) * 0.5).toFixed(3)),
      // Smoothness → brace contour visibility (fluid motion = brace holding shape)
      braceOpacity:    parseFloat(lerp(0.018, 0.11, smoothN).toFixed(4)),
      orientation,
      dominantJoint: domJoint,
    };
  }

  /* ── Review: render 2D trace preview ────────────────────────────────────── */
  function renderReviewTrace() {
    if (!reviewCv || samples.length < 2) return;

    const W = reviewCv.width  = reviewCv.offsetWidth;
    const H = reviewCv.height = reviewCv.offsetHeight;
    const rc = reviewCv.getContext('2d');

    rc.fillStyle = '#060A0E';
    rc.fillRect(0, 0, W, H);

    if (W < 1 || H < 1 || samples.length < 2) return;

    const xs = samples.map(p => p.x), ys = samples.map(p => p.y);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const xRange = xMax - xMin || 0.01;
    const yRange = yMax - yMin || 0.01;
    const pad = 48;

    function toC(p) {
      return {
        x: pad + ((p.x - xMin) / xRange) * (W - pad * 2),
        y: pad + ((p.y - yMin) / yRange) * (H - pad * 2),
      };
    }

    // Faint depth glow
    rc.shadowColor = 'rgba(138,188,218,0.18)';
    rc.shadowBlur  = 18;
    rc.strokeStyle = 'rgba(80,120,155,0.35)';
    rc.lineWidth   = 8;
    rc.lineCap = 'round'; rc.lineJoin = 'round';
    rc.beginPath();
    const f0 = toC(samples[0]);
    rc.moveTo(f0.x, f0.y);
    samples.slice(1).forEach(p => { const c = toC(p); rc.lineTo(c.x, c.y); });
    rc.stroke();

    // Main path — bone white
    rc.shadowColor = 'rgba(188,218,235,0.30)';
    rc.shadowBlur  = 6;
    rc.strokeStyle = 'rgba(188,218,235,0.78)';
    rc.lineWidth   = 1.8;
    rc.beginPath();
    rc.moveTo(f0.x, f0.y);
    samples.slice(1).forEach(p => { const c = toC(p); rc.lineTo(c.x, c.y); });
    rc.stroke();

    // Start marker
    rc.shadowBlur = 10;
    rc.beginPath();
    rc.arc(f0.x, f0.y, 4, 0, Math.PI * 2);
    rc.fillStyle = 'rgba(195,222,238,0.60)';
    rc.fill();

    rc.shadowBlur = 0;
  }

  /* ── Save to Supabase → navigate to ar.html?trace=<id> ──────────────────── */
  async function saveTrace() {
    setState('saving');

    // Downsample to max 200 points
    const step        = Math.max(1, Math.floor(samples.length / 200));
    const downsampled = samples.filter((_, i) => i % step === 0);
    const strokeData  = downsampled.map(p => ({ x: p.x, y: p.y, t: p.t }));

    const visual_params = computeVisualParams(downsampled);

    try {
      const { data, error } = await db
        .from('pain_traces')
        .insert({
          strokes:      [strokeData],
          prompt:       currentPrompt,
          visual_params,
        })
        .select()
        .single();

      if (error) throw error;

      // Automatic transition: visitor immediately sees their gesture in the archive
      window.location.href = 'ar.html?trace=' + data.id;
    } catch (e) {
      console.error('Save failed:', e);
      // Fall back to review so they can try again
      setState('review');
    }
  }

  /* ── Button handlers ─────────────────────────────────────────────────────── */
  document.getElementById('g-start-btn') .addEventListener('click', startRecording);
  document.getElementById('g-stop-btn')  .addEventListener('click', stopRecording);
  document.getElementById('g-save-btn')  .addEventListener('click', saveTrace);
  document.getElementById('g-retake-btn').addEventListener('click', () => setState('preview'));
  document.getElementById('g-delete-btn').addEventListener('click', () => setState('preview'));

  document.getElementById('g-switch-btn').addEventListener('click', () => {
    startCamera(currentFacing === 'user' ? 'environment' : 'user');
  });

  /* ── Resize ──────────────────────────────────────────────────────────────── */
  window.addEventListener('resize', resizeOverlay);

  /* ── Boot ────────────────────────────────────────────────────────────────── */
  init();
})();
