/* gesture.js — Body movement capture with TF.js MoveNet
 * Tracks shoulder midpoint as anatomical spine proxy.
 * Flow: loading → preview → recording (20 s) → review → saving → ar.html
 */
(function () {
  'use strict';

  const SUPA_URL = 'https://kgohdbyctcjgwnfedpkx.supabase.co';
  const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2hkYnljdGNqZ3duZmVkcGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Nzg0MzAsImV4cCI6MjA5NjI1NDQzMH0.Gvz6iZ0hW5VyvSGGBGnakpiyRh8dfeHyX1lmgXfn36c';
  const db = supabase.createClient(SUPA_URL, SUPA_KEY);

  /* ── Single exhibition prompt ────────────────────────────────────────────── */
  const PROMPT = 'What movement helps you negotiate with pain?';

  /* ── Recording constants ─────────────────────────────────────────────────── */
  const RECORD_DURATION = 20;   // seconds
  const SAMPLE_INTERVAL = 80;   // ms between pose samples
  const MAX_SAVED_PTS   = 60;   // points stored per trace (enough for smooth curve)
  const SMOOTH_RADIUS   = 4;    // moving-average half-window for path smoothing

  /* ── Skeleton connections for overlay drawing ────────────────────────────── */
  const CONNECTIONS = [
    [0,1],[0,2],[1,3],[2,4],
    [5,7],[7,9],[6,8],[8,10],
    [5,6],[5,11],[6,12],[11,12],
    [11,13],[13,15],[12,14],[14,16],
  ];

  /* ── DOM refs ────────────────────────────────────────────────────────────── */
  const video        = document.getElementById('g-video');
  const overlay      = document.getElementById('g-overlay');
  const ctx          = overlay.getContext('2d');
  const noBodyEl     = document.getElementById('g-no-body');
  const promptEl     = document.getElementById('g-prompt-text');
  const countdownEl  = document.getElementById('g-countdown');
  const progressBarEl= document.getElementById('g-progress-bar');
  const reviewCv     = document.getElementById('g-review-canvas');
  const debugEl      = document.getElementById('g-debug');

  /* ── Debug log (visible on screen + console) ─────────────────────────────── */
  function log(msg, type) {
    console.log('[archive]', msg);
    if (!debugEl) return;
    const line = document.createElement('div');
    line.className = 'g-debug-line' + (type ? ' ' + type : '');
    const t = new Date().toLocaleTimeString('en-GB', { hour12: false });
    line.textContent = t + '  ' + msg;
    debugEl.appendChild(line);
    debugEl.scrollTop = debugEl.scrollHeight;
  }

  /* ── State ───────────────────────────────────────────────────────────────── */
  let currentState  = 'loading';
  let detector      = null;
  let stream        = null;
  let rafId         = null;
  let sampleIv      = null;
  let elapsedIv     = null;
  let currentFacing = 'user';

  let currentKeypoints = null;
  let noBodyFrames     = 0;
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
      log('ERROR: getUserMedia not supported', 'err');
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
      log('Camera started (' + currentFacing + ')', 'ok');
      return true;
    } catch (e) {
      log('Camera error: ' + e.message, 'err');
      setState('error');
      return false;
    }
  }

  /* ── MoveNet init ────────────────────────────────────────────────────────── */
  async function loadDetector() {
    log('Loading TF.js + MoveNet...');
    await tf.ready();
    log('TF.js ready, backend: ' + tf.getBackend());
    const det = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );
    log('MoveNet loaded', 'ok');
    return det;
  }

  /* ── Main init ───────────────────────────────────────────────────────────── */
  async function init() {
    setState('loading');
    log('Initialising...');

    currentPrompt = PROMPT;
    promptEl.textContent = PROMPT;

    const camOk = await startCamera('user');
    if (!camOk) return;

    try {
      detector = await loadDetector();
    } catch (e) {
      log('MoveNet failed: ' + e.message, 'err');
      setState('error');
      return;
    }

    resizeOverlay();
    setState('preview');
    log('Ready — pose detection active', 'ok');
    startDetectionLoop();
  }

  /* ── Detection loop ───────────────────────────────────────────────────────── */
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
    const W = overlay.width, H = overlay.height;
    ctx.clearRect(0, 0, W, H);

    if (currentState === 'recording') {
      ctx.fillStyle = 'rgba(6,10,14,0.28)';
      ctx.fillRect(0, 0, W, H);
    }

    if (currentKeypoints?.length) drawSkeleton(currentKeypoints, W, H);
    if (currentState === 'recording' && samples.length > 1) drawTrail(samples, W, H);
  }

  function drawSkeleton(kps, W, H) {
    const vW = video.videoWidth  || W;
    const vH = video.videoHeight || H;
    const sx = W / vW, sy = H / vH;

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

    kps.forEach((kp, i) => {
      if (!kp || kp.score < 0.20) return;
      const isUpper = i >= 5 && i <= 12;
      ctx.beginPath();
      ctx.arc(kp.x * sx, kp.y * sy, isUpper ? 3 : 1.8, 0, Math.PI * 2);
      ctx.fillStyle = isUpper ? 'rgba(195,222,238,0.55)' : 'rgba(138,188,218,0.28)';
      ctx.fill();
    });

    // Highlight the shoulder midpoint (the point being tracked)
    const ls = kps[5], rs = kps[6];
    if (ls && rs && ls.score > 0.25 && rs.score > 0.25) {
      const mx = ((ls.x + rs.x) / 2) * sx;
      const my = ((ls.y + rs.y) / 2) * sy;
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(238,246,248,0.70)';
      ctx.fill();
    }

    ctx.restore();
  }

  function drawTrail(pts, W, H) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(188,218,235,0.35)';
    ctx.shadowBlur  = 5;
    const n = pts.length;
    for (let i = 1; i < n; i++) {
      const alpha = 0.22 + 0.78 * (i / n);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(188,218,235,${alpha.toFixed(2)})`;
      ctx.lineWidth   = 2.2;
      ctx.moveTo(pts[i-1].x * W, pts[i-1].y * H);
      ctx.lineTo(pts[i].x   * W, pts[i].y   * H);
      ctx.stroke();
    }
    const last = pts[n - 1];
    ctx.beginPath();
    ctx.arc(last.x * W, last.y * H, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220,240,248,0.85)';
    ctx.shadowBlur = 9;
    ctx.fill();
    ctx.restore();
  }

  /* ── Recording ───────────────────────────────────────────────────────────── */
  function startRecording() {
    samples       = [];
    lastKeypoints = null;
    recordingStart = Date.now();
    setState('recording');
    log('Recording started');

    sampleIv = setInterval(() => {
      if (currentKeypoints) sampleFrame(currentKeypoints);
    }, SAMPLE_INTERVAL);

    // Countdown + auto-stop
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
    log('Recording stopped — ' + samples.length + ' samples captured');

    if (samples.length < 5) {
      log('Too few samples, returning to preview', 'err');
      setState('preview');
      return;
    }
    setState('review');
    renderReviewTrace();
  }

  /* ── Spine-proxy sample: shoulder midpoint (T1 vertebra equivalent) ─────── *
   *                                                                            *
   * WHY: The composite centroid of all 17 joints barely moves during           *
   * scoliosis exercises — bilateral symmetry cancels out. The shoulder         *
   * midpoint (left[5] + right[6]) tracks the top of the functional spine       *
   * and produces clear, intentional arcs during lateral bends, rotations,      *
   * and Schroth exercises. Visually it becomes the path of the spine apex.     *
   * ─────────────────────────────────────────────────────────────────────────── */
  function sampleFrame(keypoints) {
    const now = Date.now();
    const vW  = video.videoWidth  || 1280;
    const vH  = video.videoHeight || 720;

    const ls = keypoints[5],  rs = keypoints[6];   // left/right shoulder
    const lh = keypoints[11], rh = keypoints[12];  // left/right hip

    let px, py;

    if (ls && rs && ls.score > 0.25 && rs.score > 0.25) {
      px = (ls.x + rs.x) / 2;
      py = (ls.y + rs.y) / 2;
    } else if (lh && rh && lh.score > 0.25 && rh.score > 0.25) {
      // Floor exercise fallback — hip midpoint (L4/L5 equivalent)
      px = (lh.x + rh.x) / 2;
      py = (lh.y + rh.y) / 2;
    } else {
      lastKeypoints = keypoints.slice();
      return; // not enough landmarks this frame
    }

    // Velocity from previous shoulder midpoint
    let velocity = 0;
    if (lastKeypoints) {
      const pls = lastKeypoints[5], prs = lastKeypoints[6];
      if (pls && prs && pls.score > 0.20 && prs.score > 0.20) {
        const plx = (pls.x + prs.x) / 2;
        const ply = (pls.y + prs.y) / 2;
        const dx  = (px - plx) / vW;
        const dy  = (py - ply) / vH;
        velocity  = Math.sqrt(dx * dx + dy * dy);
      }
    }

    samples.push({
      x:        px / vW,
      y:        py / vH,
      t:        now - recordingStart,
      velocity,
    });

    lastKeypoints = keypoints.slice();
  }

  /* ── Path smoothing — moving average removes pose-detection jitter ───────── */
  function smoothSamples(pts) {
    return pts.map((p, i) => {
      const lo = Math.max(0, i - SMOOTH_RADIUS);
      const hi = Math.min(pts.length - 1, i + SMOOTH_RADIUS);
      const w  = pts.slice(lo, hi + 1);
      return {
        ...p,
        x: w.reduce((s, q) => s + q.x, 0) / w.length,
        y: w.reduce((s, q) => s + q.y, 0) / w.length,
      };
    });
  }

  /* ── Visual params — 5 movement qualities → unique rendering fingerprint ─── */
  function computeVisualParams(pts) {
    const fallback = {
      vertebraCount: 12, tubeRadius: 0.034,
      titaniumOpacity: 0.40, braceOpacity: 0.055,
      orientation: 'vertical',
    };
    const n = pts.length;
    if (n < 5) return fallback;

    // 1. Mean velocity
    const meanVel = pts.reduce((s, p) => s + (p.velocity || 0), 0) / n;
    const speedN  = clamp(meanVel / 0.015, 0, 1); // shoulder moves slower than hands

    // 2. Movement range (bounding box diagonal)
    const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
    const xR = Math.max(...xs) - Math.min(...xs);
    const yR = Math.max(...ys) - Math.min(...ys);
    const rangeN = clamp(Math.sqrt(xR * xR + yR * yR) / 0.60, 0, 1);

    // 3. Repetitions (direction reversals / second)
    let reversals = 0, ldx = 0, ldy = 0;
    for (let i = 1; i < n; i++) {
      const dx = pts[i].x - pts[i-1].x;
      const dy = pts[i].y - pts[i-1].y;
      if (Math.abs(dx) > 0.002) { if (ldx && Math.sign(dx) !== Math.sign(ldx)) reversals++; ldx = dx; }
      if (Math.abs(dy) > 0.002) { if (ldy && Math.sign(dy) !== Math.sign(ldy)) reversals++; ldy = dy; }
    }
    const dur   = Math.max((pts[n-1].t - pts[0].t) / 1000, 1);
    const freqN = clamp(reversals / dur / 4, 0, 1); // 4 rev/sec = high freq

    // 4. Smoothness (1 - CV of velocity)
    const varV    = pts.reduce((s, p) => s + ((p.velocity || 0) - meanVel) ** 2, 0) / n;
    const cv      = meanVel > 0 ? Math.sqrt(varV) / meanVel : 1;
    const smoothN = clamp(1 - cv * 0.5, 0, 1);

    // 5. Orientation (horizontal = floor exercise / lateral, vertical = standing)
    const orientation = xR > yR * 1.4 ? 'horizontal' : 'vertical';

    return {
      vertebraCount:   Math.round(lerp(7, 20, freqN)),
      tubeRadius:      parseFloat(lerp(0.022, 0.065, rangeN).toFixed(4)),
      titaniumOpacity: parseFloat(lerp(0.15, 0.85, (freqN + speedN) * 0.5).toFixed(3)),
      braceOpacity:    parseFloat(lerp(0.018, 0.12, smoothN).toFixed(4)),
      orientation,
    };
  }

  /* ── Review: render smoothed 2D trace preview ────────────────────────────── *
   * Draws segments with time-fading opacity so repeated oscillations read as   *
   * intentional density (motion history) rather than random scribble.          *
   * Earlier segments = faint; later segments = bright.                         *
   * ─────────────────────────────────────────────────────────────────────────── */
  function renderReviewTrace() {
    if (!reviewCv || samples.length < 2) return;

    const W  = reviewCv.width  = reviewCv.offsetWidth;
    const H  = reviewCv.height = reviewCv.offsetHeight;
    const rc = reviewCv.getContext('2d');

    rc.fillStyle = '#060A0E';
    rc.fillRect(0, 0, W, H);
    if (W < 1 || H < 1) return;

    // Smoothed version (what will be saved)
    const smoothed = smoothSamples(samples);
    const n   = smoothed.length;

    // Fit bounding box to canvas with padding
    const xs  = smoothed.map(p => p.x), ys = smoothed.map(p => p.y);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const pad  = 42;
    const xR   = xMax - xMin || 0.01;
    const yR   = yMax - yMin || 0.01;
    // Preserve aspect ratio
    const drawW = W - pad * 2, drawH = H - pad * 2;
    const scale = Math.min(drawW / xR, drawH / yR);
    const offX  = pad + (drawW - xR * scale) / 2;
    const offY  = pad + (drawH - yR * scale) / 2;

    function toC(p) {
      return {
        x: offX + (p.x - xMin) * scale,
        y: offY + (p.y - yMin) * scale,
      };
    }

    // ── Pass 1: wide soft glow (depth) ───────────────────────────────────
    rc.save();
    rc.lineCap = rc.lineJoin = 'round';
    rc.shadowColor = 'rgba(138,188,218,0.20)';
    rc.shadowBlur  = 22;
    rc.lineWidth   = 9;
    rc.strokeStyle = 'rgba(60,100,140,0.18)';
    rc.beginPath();
    const c0 = toC(smoothed[0]);
    rc.moveTo(c0.x, c0.y);
    smoothed.slice(1).forEach(p => { const c = toC(p); rc.lineTo(c.x, c.y); });
    rc.stroke();
    rc.restore();

    // ── Pass 2: time-fading segments (early = ghost, late = bright) ───────
    // Each segment drawn independently so opacity encodes time position.
    rc.save();
    rc.lineCap = rc.lineJoin = 'round';
    rc.shadowBlur = 0;
    for (let i = 1; i < n; i++) {
      const t    = i / (n - 1);              // 0 = start, 1 = end
      const alpha = 0.08 + t * 0.72;         // ghost at start → bright at end
      const width = 1.2 + t * 1.8;          // thin at start → thicker at end
      const prev  = toC(smoothed[i - 1]);
      const curr  = toC(smoothed[i]);

      rc.beginPath();
      rc.strokeStyle = `rgba(188,218,235,${alpha.toFixed(2)})`;
      rc.lineWidth   = width;
      rc.moveTo(prev.x, prev.y);
      rc.lineTo(curr.x, curr.y);
      rc.stroke();
    }
    rc.restore();

    // ── End-point marker: bright dot showing final position ────────────────
    const cLast = toC(smoothed[n - 1]);
    rc.save();
    rc.shadowColor = 'rgba(220,240,248,0.55)';
    rc.shadowBlur  = 12;
    rc.beginPath();
    rc.arc(cLast.x, cLast.y, 4.5, 0, Math.PI * 2);
    rc.fillStyle = 'rgba(220,240,248,0.90)';
    rc.fill();
    rc.restore();

    // ── Start-point marker: dim dot showing start position ────────────────
    rc.beginPath();
    rc.arc(c0.x, c0.y, 3, 0, Math.PI * 2);
    rc.fillStyle = 'rgba(138,188,218,0.38)';
    rc.fill();
  }

  /* ── Save to Supabase → redirect to ar.html?trace=<id> ──────────────────── */
  async function saveTrace() {
    log('Preparing to save — ' + samples.length + ' raw samples');
    setState('saving');

    // 1. Smooth the captured path
    const smoothed = smoothSamples(samples);

    // 2. Downsample to MAX_SAVED_PTS (sufficient for a beautiful CatmullRom curve)
    const step        = Math.max(1, Math.floor(smoothed.length / MAX_SAVED_PTS));
    const downsampled = smoothed.filter((_, i) => i % step === 0);
    const strokeData  = downsampled.map(p => ({ x: p.x, y: p.y, t: p.t }));

    log('After smooth + downsample: ' + strokeData.length + ' points');

    const visual_params = computeVisualParams(downsampled);
    log('visual_params: vertebrae=' + visual_params.vertebraCount
      + ' radius=' + visual_params.tubeRadius
      + ' orient=' + visual_params.orientation);

    try {
      log('Inserting to Supabase...');
      const { data, error } = await db
        .from('pain_traces')
        .insert({
          strokes:      [strokeData],
          prompt:       currentPrompt,
          visual_params,
        })
        .select()
        .single();

      if (error) {
        log('Supabase error: ' + JSON.stringify(error), 'err');
        throw error;
      }

      log('Saved! trace ID: ' + data.id, 'ok');
      log('Redirecting to ar.html...', 'ok');
      window.location.href = 'ar.html?trace=' + data.id;

    } catch (e) {
      log('Save failed: ' + (e.message || JSON.stringify(e)), 'err');
      setState('review');
    }
  }

  /* ── Button handlers ─────────────────────────────────────────────────────── */
  document.getElementById('g-start-btn') .addEventListener('click', startRecording);
  document.getElementById('g-stop-btn')  .addEventListener('click', stopRecording);
  document.getElementById('g-save-btn')  .addEventListener('click', saveTrace);
  document.getElementById('g-retake-btn').addEventListener('click', () => { samples = []; setState('preview'); });
  document.getElementById('g-delete-btn').addEventListener('click', () => { samples = []; setState('preview'); });

  document.getElementById('g-switch-btn').addEventListener('click', () => {
    startCamera(currentFacing === 'user' ? 'environment' : 'user');
  });

  window.addEventListener('resize', resizeOverlay);

  /* ── Boot ────────────────────────────────────────────────────────────────── */
  init();
})();
