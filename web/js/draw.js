/* ── Pain Trace Drawing ──────────────────────────────────────────────────────
 * Users make repetitive gesture-traces as a pain-soothing exercise.
 * Strokes are captured as normalised [x, y, t] path data and saved to
 * Supabase. A Three.js ribbon preview plays after release (see draw.html).
 * ─────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* ── Prompts ─────────────────────────────────────────────────────────────── */
  const PROMPTS = [
    'Draw the same mark, again and again.',
    'Trace the curve your body makes.',
    'Draw the movement that helps.',
    'Make the gesture slowly. Then slower.',
    'Draw what your hand does without thinking.',
    'Trace where it holds right now.',
    'Draw the path of a breath.',
  ];

  /* ── Spinal palette — 6 tones from X-ray / scoliosis imagery ───────────── */
  const PALETTE = {
    bone:   '#E8DDD0',  // vertebra white
    blue:   '#4A6B7A',  // scan blue / MRI cyan
    grey:   '#8B9BAA',  // film grey
    gold:   '#C4A882',  // tissue gold
    silver: '#7A8B8C',  // brace silver
    faded:  '#D4C8BC',  // faded bone (for dark identity colours on dark bg)
  };

  /* ── Supabase ────────────────────────────────────────────────────────────── */
  const SUPA_URL = 'https://oexbsffepplhhhzhyxpy.supabase.co';
  const SUPA_KEY = 'sb_publishable_GgYdLTverVrWPYq93O6pmA_NJ4olWQ5';

  var db = null;
  if (typeof supabase !== 'undefined') {
    try { db = supabase.createClient(SUPA_URL, SUPA_KEY); } catch (_) {}
  }

  /* ── DOM refs ────────────────────────────────────────────────────────────── */
  var stage      = document.getElementById('draw-stage');
  var canvas     = document.getElementById('draw-canvas');
  var ctx        = canvas.getContext('2d');
  var promptEl   = document.getElementById('draw-prompt-text');
  var nextBtn    = document.getElementById('draw-prompt-next');
  var releaseBtn = document.getElementById('draw-release-btn');
  var countEl    = document.getElementById('draw-stroke-count');
  var successEl  = document.getElementById('draw-success');
  var againBtn   = document.getElementById('draw-again-btn');

  /* ── State ───────────────────────────────────────────────────────────────── */
  var promptIdx     = Math.floor(Math.random() * PROMPTS.length);
  var drawing       = false;
  var lastX         = 0;
  var lastY         = 0;
  var prevMidX      = null;   // Bezier midpoint state
  var prevMidY      = null;
  var currentStroke = [];
  var strokes       = [];
  var strokeCount   = 0;
  var traceColour   = resolveTraceColour();

  /* ── Map avatar identity colour to spinal palette ───────────────────────── */
  function resolveTraceColour() {
    try {
      var identity = App.getAvatarIdentity();
      if (!identity || !identity.colour) return PALETTE.bone;
      var n = identity.colour;
      var boneNames   = ['Ivory','Pearl','Bone','Chalk','Linen','Marble','Porcelain','Cloud','Frost'];
      var blueNames   = ['Indigo','Cobalt','Azure','Navy','Slate','Steel','Mist','Fog','Jade','Forest','Willow','Moss','Sage'];
      var greyNames   = ['Ash','Smoke','Dust','Stone','Silver'];
      var goldNames   = ['Amber','Ochre','Copper','Bronze','Rust','Brick','Clay','Sand'];
      var darkNames   = ['Coal','Charcoal','Ink','Shadow','Obsidian','Night','Void','Soot','Raven'];
      if (boneNames.indexOf(n) > -1) return PALETTE.bone;
      if (blueNames.indexOf(n) > -1) return PALETTE.blue;
      if (greyNames.indexOf(n) > -1) return PALETTE.grey;
      if (goldNames.indexOf(n) > -1) return PALETTE.gold;
      if (darkNames.indexOf(n) > -1) return PALETTE.faded;
      return PALETTE.silver;
    } catch (_) {
      return PALETTE.bone;
    }
  }

  /* ── Canvas sizing (DPR-aware) ──────────────────────────────────────────── */
  function resizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w   = stage.offsetWidth  || window.innerWidth;
    var h   = stage.offsetHeight || Math.max(window.innerHeight - 68, 400);
    canvas.width         = Math.floor(w * dpr);
    canvas.height        = Math.floor(h * dpr);
    canvas.style.width   = w + 'px';
    canvas.style.height  = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fillBg();
    redrawStrokes();
  }

  function fillBg() {
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
    ctx.fillStyle = '#080404';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  }

  function redrawStrokes() {
    var w = canvas.offsetWidth;
    var h = canvas.offsetHeight;
    for (var s = 0; s < strokes.length; s++) {
      var stroke = strokes[s];
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle  = traceColour;
      ctx.lineWidth    = 3.5;
      ctx.lineCap      = 'round';
      ctx.lineJoin     = 'round';
      ctx.shadowBlur   = 9;
      ctx.shadowColor  = traceColour;
      ctx.moveTo(stroke[0].x * w, stroke[0].y * h);
      for (var i = 1; i < stroke.length - 1; i++) {
        var midX = ((stroke[i].x + stroke[i + 1].x) / 2) * w;
        var midY = ((stroke[i].y + stroke[i + 1].y) / 2) * h;
        ctx.quadraticCurveTo(stroke[i].x * w, stroke[i].y * h, midX, midY);
      }
      var last = stroke[stroke.length - 1];
      ctx.lineTo(last.x * w, last.y * h);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  /* ── Prompts ─────────────────────────────────────────────────────────────── */
  function showPrompt() {
    promptEl.textContent = PROMPTS[promptIdx];
  }

  nextBtn.addEventListener('click', function () {
    promptIdx = (promptIdx + 1) % PROMPTS.length;
    showPrompt();
  });

  /* ── Drawing helpers ─────────────────────────────────────────────────────── */
  function getNormXY(e) {
    var r   = canvas.getBoundingClientRect();
    var src = e.touches ? e.touches[0] : e;
    return {
      x: Math.max(0, Math.min(1, (src.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (src.clientY - r.top)  / r.height)),
      t: Date.now(),
    };
  }

  function paintBezierTo(nx, ny) {
    var w    = canvas.offsetWidth;
    var h    = canvas.offsetHeight;
    var lx   = lastX * w;
    var ly   = lastY * h;
    var cx2  = nx * w;
    var cy2  = ny * h;
    var midX = (lx + cx2) / 2;
    var midY = (ly + cy2) / 2;

    ctx.beginPath();
    ctx.strokeStyle = traceColour;
    ctx.lineWidth   = 3.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.shadowBlur  = 9;
    ctx.shadowColor = traceColour;

    if (prevMidX === null) {
      ctx.moveTo(lx, ly);
      ctx.lineTo(midX, midY);
    } else {
      ctx.moveTo(prevMidX, prevMidY);
      ctx.quadraticCurveTo(lx, ly, midX, midY);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    prevMidX = midX;
    prevMidY = midY;
  }

  /* ── Pointer events ──────────────────────────────────────────────────────── */
  canvas.addEventListener('pointerdown', function (e) {
    if (successEl.classList.contains('visible')) return;
    e.preventDefault();
    drawing = true;
    var pt  = getNormXY(e);
    lastX   = pt.x;
    lastY   = pt.y;
    prevMidX = null;
    prevMidY = null;
    currentStroke = [pt];
    canvas.setPointerCapture(e.pointerId);
    // Paint a touch dot for immediate feedback
    var w = canvas.offsetWidth;
    var h = canvas.offsetHeight;
    ctx.beginPath();
    ctx.fillStyle = traceColour;
    ctx.arc(pt.x * w, pt.y * h, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }, { passive: false });

  canvas.addEventListener('pointermove', function (e) {
    e.preventDefault();
    if (!drawing) return;
    var pt   = getNormXY(e);
    var dist = Math.sqrt((pt.x - lastX) * (pt.x - lastX) + (pt.y - lastY) * (pt.y - lastY));
    if (dist < 0.0018) return;  // skip micro-movements
    currentStroke.push(pt);
    paintBezierTo(pt.x, pt.y);
    lastX = pt.x;
    lastY = pt.y;
  }, { passive: false });

  canvas.addEventListener('pointerup',    endStroke, { passive: false });
  canvas.addEventListener('pointerleave', endStroke, { passive: false });

  function endStroke(e) {
    e.preventDefault();
    if (!drawing) return;
    drawing = false;
    if (currentStroke.length >= 3) {
      strokes.push(currentStroke.slice());
      strokeCount++;
      updateCount();
    }
    currentStroke = [];
  }

  /* ── Stroke counter ──────────────────────────────────────────────────────── */
  function updateCount() {
    countEl.textContent = strokeCount === 1 ? '1 mark' : strokeCount + ' marks';
    countEl.classList.add('visible');
    releaseBtn.disabled = false;
  }

  /* ── Save to Supabase then trigger ribbon preview ────────────────────────── */
  function saveTrace() {
    if (strokes.length === 0) return;
    releaseBtn.disabled    = true;
    releaseBtn.textContent = 'Releasing…';

    var payload = {
      strokes:        strokes,
      prompt:         PROMPTS[promptIdx],
      palette_colour: traceColour,
      stroke_count:   strokeCount,
    };

    var done = function () {
      document.dispatchEvent(new CustomEvent('pain-trace-saved', {
        detail: { strokes: strokes, colour: traceColour },
      }));
    };

    if (db) {
      db.from('pain_traces').insert(payload)
        .then(function (res) {
          if (res.error) console.warn('Supabase insert:', res.error.message);
          done();
        })
        .catch(function (err) {
          console.warn('Supabase save failed:', err);
          done();
        });
    } else {
      done();
    }
  }

  releaseBtn.addEventListener('click', saveTrace);

  /* ── Called by the Three.js preview module when animation ends ───────────── */
  window.__drawShowSuccess = function () {
    releaseBtn.textContent = 'Release';
    successEl.classList.add('visible');
  };

  /* ── Draw again — reset everything ──────────────────────────────────────── */
  function resetDraw() {
    strokes       = [];
    strokeCount   = 0;
    currentStroke = [];
    releaseBtn.disabled    = true;
    releaseBtn.textContent = 'Release';
    successEl.classList.remove('visible');
    countEl.textContent = '';
    countEl.classList.remove('visible');
    fillBg();
  }

  if (againBtn) againBtn.addEventListener('click', resetDraw);

  /* ── Init ────────────────────────────────────────────────────────────────── */
  resizeCanvas();
  showPrompt();
  window.addEventListener('resize', resizeCanvas);

}());
