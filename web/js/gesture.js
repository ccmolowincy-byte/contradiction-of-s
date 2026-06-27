/* gesture.js â€” Body movement capture with TF.js MoveNet
 * Tracks shoulder midpoint as anatomical spine proxy.
 * Flow: loading â†’ preview â†’ recording (20 s) â†’ review â†’ saving â†’ ar.html
 */
(function () {
  'use strict';

  const SUPA_URL = 'https://oexbsffepplhhhzhyxpy.supabase.co';
  const SUPA_KEY = 'sb_publishable_GgYdLTverVrWPYq93O6pmA_NJ4olWQ5';
  let db; // assigned inside init() after CDN guard — avoids top-level throw if supabase CDN fails

  /* â”€â”€ Single exhibition prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const PROMPTS = [
    'Move the way you move when no one is watching.',
    'Do the exercise you\'re most familiar with.',
    'Show me a stretch you find helpful.',
    'Do the movement you\'ve been doing most today.',
    'Do a movement your body knows without thinking.',
    'Move the way you think your spine will age.',
    'Do the stretch you repeat most.',
    'Do the first movement you make each morning.',
  ];
  const PROMPT = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  /* â”€â”€ Recording constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const RECORD_DURATION = 20;   // seconds
  const SAMPLE_INTERVAL = 80;   // ms between pose samples
  const MAX_SAVED_PTS   = 60;   // points stored per trace (enough for smooth curve)
  const SMOOTH_RADIUS     = 4;    // moving-average half-window for path smoothing
  const SKELETON_INTERVAL = 400;  // ms between full-body keypoint snapshots
  const SKELETON_MAX      = 50;   // max skeleton frames stored per recording

  /* â”€â”€ Skeleton connections for overlay drawing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const CONNECTIONS = [
    [0,1],[0,2],[1,3],[2,4],
    [5,7],[7,9],[6,8],[8,10],
    [5,6],[5,11],[6,12],[11,12],
    [11,13],[13,15],[12,14],[14,16],
  ];

  /* â”€â”€ DOM refs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  const video        = document.getElementById('g-video');
  const overlay      = document.getElementById('g-overlay');
  const ctx          = overlay.getContext('2d');
  const noBodyEl     = document.getElementById('g-no-body');
  const promptEl     = document.getElementById('g-prompt-text');
  const countdownEl  = document.getElementById('g-countdown');
  const progressBarEl= document.getElementById('g-progress-bar');
  const reviewCv     = document.getElementById('g-review-canvas');
  const debugEl      = document.getElementById('g-debug');

  /* â”€â”€ Debug log (visible on screen + console) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function log(msg, type) {
    if (!debugEl) return;
    const line = document.createElement('div');
    line.className = 'g-debug-line' + (type ? ' ' + type : '');
    const t = new Date().toLocaleTimeString('en-GB', { hour12: false });
    line.textContent = t + '  ' + msg;
    debugEl.appendChild(line);
    debugEl.scrollTop = debugEl.scrollHeight;
  }

  /* â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  let currentState  = 'loading';
  let detector      = null;
  let stream        = null;
  let rafId         = null;
  let sampleIv      = null;
  let elapsedIv     = null;
  let reviewAnimId  = null;
  let currentFacing = 'user';

  let currentKeypoints = null;
  let noBodyFrames     = 0;
  let samples          = [];
  let lastKeypoints    = null;
  let recordingStart   = null;
  let currentPrompt    = '';

  let skeletonSnapshots  = [];
  let skeletonIv         = null;
  let customSkel         = null;   // loaded async after MoveNet; used by drawSkeleton
  let lastFrameTime      = 0;      // for dt calculation in the animation loop
  let smoothedKeypoints  = null;   // EMA-smoothed MoveNet output (reduces jitter)
  let savedTraceId       = null;   // assigned after successful Supabase save

  /* â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t)    { return a + (b - a) * clamp(t, 0, 1); }

  function setLoadingStatus(msg, sub) {
    // Poetic phases manage the main status text — suppress technical messages
    if (window._setLoadPhase) return;
    const el = document.getElementById('g-loading-status')
            || document.querySelector('.g-loading-text');
    const subEl = document.getElementById('g-loading-sub')
               || document.querySelector('#g-loading-sub');
    if (el) el.textContent = msg;
    if (subEl && sub !== undefined) subEl.textContent = sub;
  }

  function withTimeout(promise, ms, label) {
    const sec = Math.round(ms / 1000);
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(
          (label || 'Loading') + ' timed out after ' + sec + 's — reload to retry'
        )), ms)
      ),
    ]);
  }

  function setState(s) {
    stopReviewAnimation();
    currentState = s;
    ['loading','preview','recording','review','saving','saved','error'].forEach(id => {
      const el = document.getElementById('s-' + id);
      if (el) el.classList.toggle('hidden', id !== s);
    });
    // Compact debug panel when the UI needs that space; restore for error/loading
    if (debugEl) {
      const needsSpace = s === 'recording' || s === 'review' || s === 'saving';
      debugEl.classList.toggle('compact', needsSpace);
      if (needsSpace) debugEl.classList.remove('expanded');
    }
  }

  function stopReviewAnimation() {
    if (reviewAnimId !== null) { cancelAnimationFrame(reviewAnimId); reviewAnimId = null; }
  }

  // Tap debug panel to expand/collapse
  if (debugEl) {
    debugEl.addEventListener('click', () => {
      if (debugEl.classList.contains('compact')) {
        // In compact mode: one tap expands fully, second collapses back to compact
        debugEl.classList.toggle('expanded');
      } else {
        debugEl.classList.toggle('expanded');
      }
    });
  }

  /* â”€â”€ Camera â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });
      video.srcObject = stream;
      await video.play();
      // Unlock continuous auto-exposure/focus — fixes dark/blurry feed on Android WebRTC
      try {
        const _track = stream.getVideoTracks()[0];
        const _caps  = _track.getCapabilities ? _track.getCapabilities() : {};
        const _adv   = [];
        if (_caps.exposureMode)     _adv.push({ exposureMode:     'continuous' });
        if (_caps.whiteBalanceMode) _adv.push({ whiteBalanceMode: 'continuous' });
        if (_caps.focusMode)        _adv.push({ focusMode:        'continuous' });
        if (_adv.length) await _track.applyConstraints({ advanced: _adv });
      } catch (_) {}
      log('Camera started (' + currentFacing + ')', 'ok');
      return true;
    } catch (e) {
      log('Camera error: ' + e.message, 'err');
      setState('error');
      return false;
    }
  }

  /* â”€â”€ MoveNet init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  async function loadDetector() {
    log('Step 3/5 — initialising TensorFlow backend…');
    setLoadingStatus('Initialising TensorFlow…', 'setting up GPU / WebGL backend');
    await withTimeout(tf.ready(), 20000, 'TensorFlow backend');
    const backend = tf.getBackend();
    log('TensorFlow ready — backend: ' + backend, 'ok');
    setLoadingStatus('TensorFlow ready (' + backend + ')', '');

    log('Step 4/5 — creating MoveNet detector…');
    setLoadingStatus('Downloading MoveNet model…', 'cached after first visit — please wait');
    const det = await withTimeout(
      poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      ),
      90000,
      'MoveNet model download'
    );
    log('MoveNet detector created', 'ok');
    setLoadingStatus('MoveNet detector ready', '');
    return det;
  }

  /* â”€â”€ Main init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  async function init() {
    setState('loading');
    log('Init started');
    setLoadingStatus('Starting up…', '');

    // Step 1: verify CDN scripts loaded (tf, poseDetection, supabase)
    log('Step 1/5 — checking dependencies…');
    setLoadingStatus('Checking dependencies…', '');
    const missingLib = typeof tf === 'undefined' ? 'TensorFlow.js'
                     : typeof poseDetection === 'undefined' ? 'pose-detection'
                     : typeof supabase === 'undefined' ? 'Supabase'
                     : null;
    if (missingLib) {
      log('ERROR: ' + missingLib + ' script not loaded (CDN failure?)', 'err');
      setLoadingStatus('Could not load ' + missingLib, 'check your connection and reload');
      document.getElementById('g-error-text').textContent =
        missingLib + ' failed to load. Check your connection and reload.';
      setState('error');
      return;
    }
    db = supabase.createClient(SUPA_URL, SUPA_KEY);
    log('TF.js v' + (tf.version_core || tf.version?.tfjs || '?') + ', poseDetection, supabase confirmed', 'ok');
    setLoadingStatus('Dependencies loaded', '');

    currentPrompt = PROMPT;
    promptEl.textContent = PROMPT;

    // Step 2: camera
    log('Step 2/5 — requesting camera…');
    setLoadingStatus('Requesting camera access…', 'tap Allow if prompted');
    const camOk = await startCamera('user');
    if (!camOk) return;
    log('Camera ready', 'ok');
    setLoadingStatus('Camera ready', '');

    // Steps 3 + 4: TF backend + MoveNet model (inside loadDetector)
    try {
      detector = await loadDetector();
    } catch (e) {
      log('Detector failed: ' + e.message, 'err');
      const errText = e.message.includes('timed out')
        ? e.message + '. Reload to retry — the model caches after first successful download.'
        : 'Body tracking failed: ' + e.message + '. Please reload.';
      document.getElementById('g-error-text').textContent = errText;
      setState('error');
      return;
    }

    // Step 5: custom skeleton assets (background, non-blocking)
    log('Step 5/5 — loading skeleton assets (background)…');
    setLoadingStatus('Loading skeleton assets…', '');

    resizeOverlay();
    setState('preview');
    log('Ready — pose detection active', 'ok');

    // Load custom skeleton assets in background â€” overlay degrades gracefully until ready
    import('./custom-skel-draw.js?v=15')
      .then(m => m.loadCustomSkel('assets/skel/'))
      .then(skel => {
        customSkel = skel;
        log('Custom skeleton loaded', 'ok');
      })
      .catch(err => log('Custom skeleton load failed: ' + err.message, 'err'));

    startDetectionLoop();
  }

  /* â”€â”€ Detection loop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function startDetectionLoop() {
    lastFrameTime = performance.now();
    async function loop() {
      const now = performance.now();
      const dt  = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;

      if (currentState === 'saving' || currentState === 'error' || currentState === 'loading') {
        rafId = requestAnimationFrame(loop);
        return;
      }
      if (detector && video.readyState >= 2 && !video.paused) {
        try {
          const poses = await detector.estimatePoses(video);
          if (poses.length > 0 && poses[0].keypoints) {
            const raw = poses[0].keypoints;
            // Exponential moving average â€” smooths jitter without adding visible lag
            const alpha = 0.60;
            if (!smoothedKeypoints || smoothedKeypoints.length !== raw.length) {
              smoothedKeypoints = raw.map(k => ({ x: k.x, y: k.y, score: k.score, name: k.name }));
            } else {
              smoothedKeypoints = smoothedKeypoints.map((sk, i) => {
                const rk = raw[i];
                if (!rk || rk.score < 0.12) {
                  // Joint briefly lost â€” decay score slowly so it fades out rather than snapping off.
                  // Position is held from last known good frame (sk.x, sk.y).
                  return { ...sk, score: sk.score * 0.92 };
                }
                return {
                  x:     sk.x     * (1 - alpha) + rk.x     * alpha,
                  y:     sk.y     * (1 - alpha) + rk.y     * alpha,
                  score: sk.score * 0.35    + rk.score * 0.65,
                  name:  rk.name,
                };
              });
            }
            currentKeypoints = smoothedKeypoints;
            noBodyFrames = 0;
          } else {
            currentKeypoints = null;
            noBodyFrames++;
            if (noBodyFrames > 90) smoothedKeypoints = null;  // reset only after sustained absence
          }
        } catch (_) {
          currentKeypoints = null;
        }
      }
      if (customSkel) customSkel.update(dt);
      noBodyEl.style.opacity = (currentState === 'preview' && noBodyFrames > 60) ? '1' : '0';
      drawOverlay();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
  }

  /* â”€â”€ Overlay drawing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

    const showGuide = currentState === 'preview' && noBodyFrames > 20;
    if (showGuide && !currentKeypoints?.length) drawFramingGuide(W, H);
    if (currentKeypoints?.length) drawSkeleton(currentKeypoints, W, H);
    if (currentState === 'recording' && samples.length > 1) drawTrail(samples, W, H);
  }

  function drawSkeleton(kps, W, H) {
    const vW = video.videoWidth  || W;
    const vH = video.videoHeight || H;

    if (customSkel) {
      // Normalise raw video-pixel keypoints to [0â€“1] for custom-skel-draw.js
      const normKps = kps.map(kp => ({
        x: kp.x / vW,
        y: kp.y / vH,
        s: kp.score,
      }));
      customSkel.drawBody(ctx, normKps, W, H, 1.0);
      return;
    }

    // Fallback: faint blue-line skeleton while custom assets are loading
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
    const ls = kps[5], rs = kps[6];
    if (ls && rs && ls.score > 0.25 && rs.score > 0.25) {
      ctx.beginPath();
      ctx.arc(((ls.x + rs.x) / 2) * sx, ((ls.y + rs.y) / 2) * sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(238,246,248,0.70)';
      ctx.fill();
    }
    ctx.restore();
  }

  function drawTrail(pts, W, H) {
    if (pts.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(180,40,40,0.30)';
    ctx.shadowBlur  = 5;
    const n = pts.length;
    for (let i = 1; i < n; i++) {
      const alpha = 0.18 + 0.72 * (i / n);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(180,30,30,${alpha.toFixed(2)})`;
      ctx.lineWidth   = 2.2;
      ctx.moveTo(pts[i-1].x * W, pts[i-1].y * H);
      ctx.lineTo(pts[i].x   * W, pts[i].y   * H);
      ctx.stroke();
    }
    const last = pts[n - 1];
    ctx.beginPath();
    ctx.arc(last.x * W, last.y * H, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220,60,60,0.82)';
    ctx.shadowBlur = 9;
    ctx.fill();
    ctx.restore();
  }

  /* Faint full-body outline â€” shows when body isn't detected so user knows where to stand. */
  function drawFramingGuide(W, H) {
    const cx  = W / 2;
    const sc  = H * 0.26;    // scale relative to canvas height
    const mid = H * 0.44;    // vertical centre of guide figure

    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.strokeStyle = 'rgba(200,216,224,1)';
    ctx.lineWidth   = 1.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.setLineDash([3, 6]);

    // Head circle
    ctx.beginPath();
    ctx.arc(cx, mid - sc * 0.74, sc * 0.13, 0, Math.PI * 2);
    ctx.stroke();

    // Spine
    ctx.beginPath();
    ctx.moveTo(cx, mid - sc * 0.60);
    ctx.lineTo(cx, mid);
    ctx.stroke();

    // Shoulders
    ctx.beginPath();
    ctx.moveTo(cx - sc * 0.33, mid - sc * 0.49);
    ctx.lineTo(cx + sc * 0.33, mid - sc * 0.49);
    // L arm â†’ elbow â†’ wrist
    ctx.moveTo(cx - sc * 0.33, mid - sc * 0.49);
    ctx.lineTo(cx - sc * 0.27, mid - sc * 0.14);
    ctx.lineTo(cx - sc * 0.22, mid + sc * 0.12);
    // R arm â†’ elbow â†’ wrist
    ctx.moveTo(cx + sc * 0.33, mid - sc * 0.49);
    ctx.lineTo(cx + sc * 0.27, mid - sc * 0.14);
    ctx.lineTo(cx + sc * 0.22, mid + sc * 0.12);
    // Hip bar
    ctx.moveTo(cx - sc * 0.18, mid);
    ctx.lineTo(cx + sc * 0.18, mid);
    // L leg â†’ knee â†’ ankle
    ctx.moveTo(cx - sc * 0.12, mid);
    ctx.lineTo(cx - sc * 0.13, mid + sc * 0.26);
    ctx.lineTo(cx - sc * 0.14, mid + sc * 0.53);
    // R leg â†’ knee â†’ ankle
    ctx.moveTo(cx + sc * 0.12, mid);
    ctx.lineTo(cx + sc * 0.13, mid + sc * 0.26);
    ctx.lineTo(cx + sc * 0.14, mid + sc * 0.53);
    ctx.stroke();

    ctx.restore();
  }

  /* â”€â”€ Recording â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function startRecording() {
    samples           = [];
    skeletonSnapshots = [];
    lastKeypoints     = null;
    recordingStart    = Date.now();
    setState('recording');
    log('Recording started');

    sampleIv = setInterval(() => {
      if (currentKeypoints) sampleFrame(currentKeypoints);
    }, SAMPLE_INTERVAL);

    // Full skeleton snapshot every 400 ms (50 snapshots over 20 s)
    skeletonIv = setInterval(() => {
      if (currentKeypoints && skeletonSnapshots.length < SKELETON_MAX) {
        captureSkeletonSnapshot(currentKeypoints);
      }
    }, SKELETON_INTERVAL);

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
    clearInterval(skeletonIv);
    sampleIv = elapsedIv = skeletonIv = null;
    log('Recording stopped â€” ' + samples.length + ' samples, ' + skeletonSnapshots.length + ' skeleton frames');

    if (samples.length < 2) {
      log('Too few samples, returning to preview', 'err');
      setState('preview');
      return;
    }
    setState('review');
    renderReviewTrace();
  }

  /* â”€â”€ Spine-proxy sample: shoulder midpoint (T1 vertebra equivalent) â”€â”€â”€â”€â”€â”€â”€ *
   *                                                                            *
   * WHY: The composite centroid of all 17 joints barely moves during           *
   * scoliosis exercises â€” bilateral symmetry cancels out. The shoulder         *
   * midpoint (left[5] + right[6]) tracks the top of the functional spine       *
   * and produces clear, intentional arcs during lateral bends, rotations,      *
   * and Schroth exercises. Visually it becomes the path of the spine apex.     *
   * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function sampleFrame(keypoints) {
    const now = Date.now();
    const vW  = video.videoWidth  || 1280;
    const vH  = video.videoHeight || 720;

    const ls = keypoints[5],  rs = keypoints[6];   // left/right shoulder
    const lh = keypoints[11], rh = keypoints[12];  // left/right hip

    let px, py;

    if (ls && rs && ls.score > 0.15 && rs.score > 0.15) {
      px = (ls.x + rs.x) / 2;
      py = (ls.y + rs.y) / 2;
    } else if (lh && rh && lh.score > 0.15 && rh.score > 0.15) {
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

  /* â”€â”€ Full-body skeleton snapshot (saved every 400 ms during recording) â”€â”€â”€â”€â”€â”€ */
  function captureSkeletonSnapshot(keypoints) {
    const vW = video.videoWidth  || 1280;
    const vH = video.videoHeight || 720;
    skeletonSnapshots.push({
      t:  Date.now() - recordingStart,
      kp: keypoints.map(kpt => ({
        x: kpt.x / vW,
        y: kpt.y / vH,
        s: kpt.score,
      })),
    });
  }

  /* â”€â”€ Path smoothing â€” moving average removes pose-detection jitter â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

  /* â”€â”€ Visual params â€” 5 movement qualities â†’ unique rendering fingerprint â”€â”€â”€ */
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

  /* â”€â”€ Review: render smoothed 2D trace preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ *
   * Draws segments with time-fading opacity so repeated oscillations read as   *
   * intentional density (motion history) rather than random scribble.          *
   * Earlier segments = faint; later segments = bright.                         *
   * â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function renderReviewTrace() {
    if (!reviewCv || samples.length < 2) return;
    stopReviewAnimation();

    const W  = reviewCv.width  = reviewCv.offsetWidth;
    const H  = reviewCv.height = reviewCv.offsetHeight;
    const rc = reviewCv.getContext('2d');
    if (W < 1 || H < 1) return;

    const smoothed = smoothSamples(samples);
    const n        = smoothed.length;
    if (n < 2) return;

    // Fit bounding box with padding, preserve aspect ratio
    const xs   = smoothed.map(p => p.x), ys = smoothed.map(p => p.y);
    const xMin = Math.min(...xs), xMax = Math.max(...xs);
    const yMin = Math.min(...ys), yMax = Math.max(...ys);
    const pad  = 42;
    const xR   = xMax - xMin || 0.01;
    const yR   = yMax - yMin || 0.01;
    const drawW = W - pad * 2, drawH = H - pad * 2;
    const scl  = Math.min(drawW / xR, drawH / yR);
    const offX = pad + (drawW - xR * scl) / 2;
    const offY = pad + (drawH - yR * scl) / 2;

    const pts = smoothed.map(p => ({
      x: offX + (p.x - xMin) * scl,
      y: offY + (p.y - yMin) * scl,
    }));

    // Velocity per segment in canvas space
    const vel = [0];
    let maxV  = 0;
    for (let i = 1; i < n; i++) {
      const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
      const v  = Math.sqrt(dx * dx + dy * dy);
      vel.push(v);
      if (v > maxV) maxV = v;
    }
    maxV = maxV || 1;

    // Warm glow velocity ink
    rc.fillStyle  = '#0A0806';
    rc.fillRect(0, 0, W, H);
    rc.lineCap = rc.lineJoin = 'round';

    // Pass 1: outer diffuse gold halo
    for (let i = 1; i < n; i++) {
      const nV = vel[i] / maxV;
      rc.beginPath();
      rc.moveTo(pts[i - 1].x, pts[i - 1].y);
      rc.lineTo(pts[i].x,     pts[i].y);
      rc.strokeStyle = `rgba(196,140,80,${(0.008 + (1 - nV) * 0.055).toFixed(3)})`;
      rc.lineWidth   = (0.4 + (1 - nV) * 12) * 6;
      rc.stroke();
    }

    // Pass 2: mid warm glow
    for (let i = 1; i < n; i++) {
      const nV = vel[i] / maxV;
      const rv = Math.round(196 + nV * (215 - 196));
      const gv = Math.round(140 + nV * (56  - 140));
      const bv = Math.round(80  + nV * (60  - 80));
      rc.beginPath();
      rc.moveTo(pts[i - 1].x, pts[i - 1].y);
      rc.lineTo(pts[i].x,     pts[i].y);
      rc.strokeStyle = `rgba(${rv},${gv},${bv},${(0.025 + (1 - nV) * 0.12).toFixed(3)})`;
      rc.lineWidth   = (0.4 + (1 - nV) * 12) * 2.4;
      rc.stroke();
    }

    // Pass 3: core — tissue-gold (slow) to deep red (fast)
    for (let i = 1; i < n; i++) {
      const nV = vel[i] / maxV;
      const rv = Math.round(196 + nV * (215 - 196));
      const gv = Math.round(160 + nV * (56  - 160));
      const bv = Math.round(96  + nV * (76  - 96));
      rc.beginPath();
      rc.moveTo(pts[i - 1].x, pts[i - 1].y);
      rc.lineTo(pts[i].x,     pts[i].y);
      rc.strokeStyle = `rgba(${rv},${gv},${bv},${(0.32 + nV * 0.30).toFixed(3)})`;
      rc.lineWidth   = 0.5 + (1 - nV) * 12;
      rc.stroke();
    }

    // Snapshot static ink for fast per-frame restore during star animation
    const inkSnap = rc.getImageData(0, 0, W, H);

    // Arc-length parameterisation for constant-speed star travel
    const arcS = [0];
    for (let i = 1; i < n; i++) {
      const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
      arcS.push(arcS[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    const totalLen = arcS[arcS.length - 1];

    function posAtS(s) {
      s = Math.max(0, Math.min(totalLen, s));
      for (let i = 1; i < arcS.length; i++) {
        if (arcS[i] >= s) {
          const f = (s - arcS[i - 1]) / (arcS[i] - arcS[i - 1]);
          return {
            x: pts[i - 1].x + f * (pts[i].x - pts[i - 1].x),
            y: pts[i - 1].y + f * (pts[i].y - pts[i - 1].y),
          };
        }
      }
      return { ...pts[n - 1] };
    }

    // Halo points: local velocity minima — where body hesitated or turned
    const rawMin = [];
    for (let i = 3; i < n - 3; i++) {
      if (vel[i] <= vel[i - 1] && vel[i] <= vel[i + 1] && vel[i] / maxV < 0.55) {
        rawMin.push(i);
      }
    }
    const haloS = [];
    let ki = 0;
    while (ki < rawMin.length) {
      const grp = [rawMin[ki]];
      while (ki + 1 < rawMin.length && rawMin[ki + 1] - rawMin[ki] <= 5) { ki++; grp.push(rawMin[ki]); }
      const best = grp.reduce((a, b) => vel[a] < vel[b] ? a : b);
      haloS.push(arcS[best]);
      ki++;
    }
    if (haloS.length < 2) {
      haloS.push(totalLen * 0.25, totalLen * 0.60, totalLen * 0.85);
    }

    // Asymmetrical star — 5 arms with uneven lengths
    function drawStar(x, y, sc, al, rot) {
      const OR = [7.0, 5.5, 7.6, 5.1, 6.7];
      const IR = [2.8, 2.3, 3.0, 2.2, 2.6];
      const grd = rc.createRadialGradient(x, y, 0, x, y, 15 * sc);
      grd.addColorStop(0,    `rgba(196,162,96,${(al * 0.42).toFixed(3)})`);
      grd.addColorStop(0.45, `rgba(196,148,76,${(al * 0.16).toFixed(3)})`);
      grd.addColorStop(1,    'rgba(190,130,60,0)');
      rc.beginPath();
      rc.arc(x, y, 15 * sc, 0, Math.PI * 2);
      rc.fillStyle = grd;
      rc.fill();
      rc.beginPath();
      for (let k = 0; k < 10; k++) {
        const isO = k % 2 === 0, pi = Math.floor(k / 2);
        const r   = (isO ? OR[pi] : IR[pi]) * sc;
        const ang = k * Math.PI / 5 + rot - Math.PI / 2;
        const px  = x + r * Math.cos(ang), py = y + r * Math.sin(ang);
        if (k === 0) rc.moveTo(px, py); else rc.lineTo(px, py);
      }
      rc.closePath();
      rc.fillStyle = `rgba(220,185,120,${al.toFixed(3)})`;
      rc.fill();
      rc.beginPath();
      rc.arc(x, y, 1.6 * sc, 0, Math.PI * 2);
      rc.fillStyle = `rgba(248,220,165,${(al * 0.68).toFixed(3)})`;
      rc.fill();
    }

    // Star animation state machine
    const APPEAR_DELAY = 1500;
    const DWELL_MS     = 800;
    const FADE_MS      = 380;
    const SPEED        = 52;

    let phase      = 'wait';
    let phaseStart = 0;
    let visitIdx   = 0;
    let currentS   = haloS[0];
    let starRot    = 0.14;
    let animStart  = null;

    function frame(ts) {
      if (!animStart) { animStart = ts; phaseStart = ts; }
      rc.putImageData(inkSnap, 0, 0);

      if (phase === 'wait') {
        if (ts - animStart >= APPEAR_DELAY) { phase = 'appear'; phaseStart = ts; visitIdx = 0; currentS = haloS[0]; }

      } else if (phase === 'appear') {
        const a = Math.min(1, (ts - phaseStart) / FADE_MS);
        if (a >= 1) { phase = 'dwell'; phaseStart = ts; }
        const p = posAtS(currentS);
        drawStar(p.x, p.y, 1, a, starRot);

      } else if (phase === 'dwell') {
        const t  = (ts - phaseStart) / DWELL_MS;
        const sc = 1 + 0.09 * Math.sin(t * Math.PI);
        if (t >= 1) { phase = (visitIdx === haloS.length - 1) ? 'loopfade' : 'travel'; phaseStart = ts; }
        const p = posAtS(haloS[visitIdx]);
        drawStar(p.x, p.y, sc, 1, starRot);

      } else if (phase === 'travel') {
        currentS = haloS[visitIdx] + (ts - phaseStart) / 1000 * SPEED;
        if (currentS >= haloS[visitIdx + 1]) { currentS = haloS[visitIdx + 1]; visitIdx++; phase = 'dwell'; phaseStart = ts; }
        const p = posAtS(currentS);
        drawStar(p.x, p.y, 1, 1, starRot);

      } else if (phase === 'loopfade') {
        const t = (ts - phaseStart) / FADE_MS;
        if (t >= 1) { visitIdx = 0; currentS = haloS[0]; phase = 'fadein'; phaseStart = ts; }
        else { const p = posAtS(haloS[haloS.length - 1]); drawStar(p.x, p.y, 1, 1 - t, starRot); }

      } else if (phase === 'fadein') {
        const t = Math.min(1, (ts - phaseStart) / FADE_MS);
        if (t >= 1) { phase = 'dwell'; phaseStart = ts; }
        const p = posAtS(haloS[0]);
        drawStar(p.x, p.y, 1, t, starRot);
      }

      starRot += 0.003;
      reviewAnimId = requestAnimationFrame(frame);
    }

    reviewAnimId = requestAnimationFrame(frame);
  }

  /* â”€â”€ Save to Supabase â†’ redirect to ar.html?trace=<id> â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  async function saveTrace() {
    log('Preparing to save â€” ' + samples.length + ' raw samples');
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

    let _saveTimer;
    const _timeout = new Promise((_, reject) => {
      _saveTimer = setTimeout(() => reject(new Error('save timed out — check connection')), 15000);
    });

    try {
      log('Inserting to Supabase...');
      const { data, error } = await Promise.race([
        db.from('pain_traces')
          .insert({
            strokes:      [strokeData],
            prompt:       currentPrompt,
            visual_params,
            skeletons:    skeletonSnapshots.length >= 3 ? skeletonSnapshots : null,
          })
          .select()
          .single(),
        _timeout,
      ]);

      clearTimeout(_saveTimer);
      if (error) {
        log('Supabase error: ' + JSON.stringify(error), 'err');
        throw error;
      }

      log('Saved! trace ID: ' + data.id, 'ok');
      transitionToSaved(data.id);

    } catch (e) {
      clearTimeout(_saveTimer);
      log('Save failed: ' + (e.message || JSON.stringify(e)), 'err');
      setState('review');
      renderReviewTrace();
    }
  }

  /* ── Post-save: snapshot canvas + share / download ────────────────────────── */
  function transitionToSaved(traceId) {
    savedTraceId = traceId;
    const savedCv = document.getElementById('g-saved-canvas');
    savedCv.width  = reviewCv.width;
    savedCv.height = reviewCv.height;
    savedCv.getContext('2d').drawImage(reviewCv, 0, 0);
    stopReviewAnimation();
    setState('saved');
  }

  async function shareTrace() {
    if (!savedTraceId) return;
    const traceUrl = new URL('ar.html?trace=' + savedTraceId, location.href).href;
    const shareData = {
      title: 'The Contradiction of S',
      text: 'My movement trace in the garden.',
      url: traceUrl,
    };
    try {
      const blob = await new Promise(res =>
        document.getElementById('g-saved-canvas').toBlob(res, 'image/png', 0.92)
      );
      const file = new File([blob], 'trace-of-s.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) shareData.files = [file];
    } catch (_) {}
    if (navigator.share) {
      try { await navigator.share(shareData); }
      catch (e) { if (e.name !== 'AbortError') log('Share: ' + e.message, 'err'); }
    } else {
      try { await navigator.clipboard.writeText(traceUrl); }
      catch (_) {}
    }
  }

  function downloadTrace() {
    document.getElementById('g-saved-canvas').toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'trace-of-s.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }, 'image/png', 0.92);
  }

  /* â”€â”€ Button handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  document.getElementById('g-start-btn') .addEventListener('click', startRecording);
  document.getElementById('g-stop-btn')  .addEventListener('click', stopRecording);
  document.getElementById('g-save-btn')  .addEventListener('click', saveTrace);
  document.getElementById('g-retake-btn').addEventListener('click', () => { samples = []; setState('preview'); });
  document.getElementById('g-delete-btn').addEventListener('click', () => { samples = []; setState('preview'); });

  document.getElementById('g-switch-btn').addEventListener('click', () => {
    startCamera(currentFacing === 'user' ? 'environment' : 'user');
  });

  const _shareBtn = document.getElementById('g-share-btn');
  const _dlBtn    = document.getElementById('g-download-btn');
  const _enterBtn = document.getElementById('g-enter-btn');
  if (_shareBtn)  _shareBtn.addEventListener('click', shareTrace);
  if (_dlBtn)     _dlBtn.addEventListener('click', downloadTrace);
  if (_enterBtn)  _enterBtn.addEventListener('click', () => {
    window.location.href = 'ar.html' + (savedTraceId ? '?trace=' + savedTraceId : '');
  });

  window.addEventListener('resize', resizeOverlay);

  /* â”€â”€ Boot â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  init().catch(e => {
    console.error('[gesture] Unhandled init error:', e);
    const el = document.getElementById('g-loading-status') || document.querySelector('.g-loading-text');
    if (el) el.textContent = 'Startup error: ' + e.message;
    const errEl = document.getElementById('g-error-text');
    if (errEl) errEl.textContent = 'Startup error: ' + e.message + '. Please reload.';
    setState('error');
  });
})();



