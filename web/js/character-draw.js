/* ── Draw-your-own asset tab (Character Builder) ── */
(async function () {

  const PEN_COLOR = '#B31A1A';
  const MAX_UNDO = 5;
  const MAX_PER_CAT = 10;

  /* Wait for the remote store before saving becomes possible. */
  await App.storeReady;

  const canvas   = document.getElementById('draw-asset-canvas');
  if (!canvas) return;
  const ctx      = canvas.getContext('2d');

  const catBtns  = document.querySelectorAll('.draw-cat-btn');
  const sizeBtns = document.querySelectorAll('.draw-size-btn');
  const modeBtns = document.querySelectorAll('.draw-mode-btn');
  const undoBtn  = document.getElementById('draw-undo-btn');
  const clearBtn = document.getElementById('draw-clear-btn');
  const saveBtn    = document.getElementById('draw-save-btn');
  const savedMsg   = document.getElementById('draw-saved-msg');
  const publicBox  = document.getElementById('draw-public-checkbox');

  let activeCat = 'face';
  let activeMode = 'draw';
  let brushR    = 5;
  let drawing   = false;
  let lastX = 0, lastY = 0;
  let undoStack = [];
  let penSeen   = false; // for palm rejection
  let ink = null;

  function canvasCSSSize() {
    return Math.min(window.innerWidth - 40, 360);
  }

  function resizeCanvas() {
    const cssSize = canvasCSSSize();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newW = Math.floor(cssSize * dpr);
    const newH = Math.floor(cssSize * dpr);

    // Skip no-op resizes. Our size is derived from window width only, so the
    // mobile URL bar showing/hiding (a height-only resize) leaves it unchanged —
    // and reassigning canvas.width/height would wipe the in-progress drawing.
    if (ink && newW === canvas.width && newH === canvas.height) return;

    // Preserve the current drawing across a real resize (e.g. rotation).
    let prev = null;
    if (canvas.width && canvas.height) {
      prev = document.createElement('canvas');
      prev.width = canvas.width; prev.height = canvas.height;
      prev.getContext('2d').drawImage(canvas, 0, 0);
    }

    canvas.width  = newW;
    canvas.height = newH;
    canvas.style.width  = cssSize + 'px';
    canvas.style.height = cssSize + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (prev) ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, cssSize, cssSize);
    ink = new window.COS_INK.InkBrush(ctx, { color: PEN_COLOR, size: brushR, mode: activeMode, getPoint: getXY });
    // Canvas itself stays transparent; the cream paper is CSS background.
  }

  function clearCanvas(pushUndoFirst) {
    if (pushUndoFirst) pushUndo();
    ctx.clearRect(0, 0, canvasCSSSize(), canvasCSSSize());
  }

  /* ── Pointer helpers ───────────────────────────────────────────────────── */
  function getXY(e) {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * (canvas.width / r.width / (window.devicePixelRatio || 1)),
      y: (src.clientY - r.top)  * (canvas.height / r.height / (window.devicePixelRatio || 1)),
    };
  }

  function shouldAcceptPointer(e) {
    // Apple Pencil / stylus: accept immediately.
    if (e.pointerType === 'pen') { penSeen = true; return true; }
    // Mouse is fine on desktop.
    if (e.pointerType === 'mouse') return true;
    // Touch: ignore if we have already seen a pen in this session (palm rejection).
    if (e.pointerType === 'touch' && penSeen) return false;
    return true;
  }

  /* ── Undo ──────────────────────────────────────────────────────────────── */
  function pushUndo() {
    const cssSize = canvasCSSSize();
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (undoStack.length > MAX_UNDO) undoStack.shift();
  }

  function doUndo() {
    if (!undoStack.length) return;
    ctx.putImageData(undoStack.pop(), 0, 0);
  }

  /* ── Events ────────────────────────────────────────────────────────────── */
  canvas.addEventListener('pointerdown', function (e) {
    if (!shouldAcceptPointer(e)) return;
    e.preventDefault();
    pushUndo();
    drawing = true;
    ink.setSize(brushR);
    ink.setMode(activeMode);
    ink.begin(e);
    canvas.setPointerCapture(e.pointerId);
  }, { passive: false });

  canvas.addEventListener('pointermove', function (e) {
    e.preventDefault();
    if (!drawing) return;
    if (e.pointerType === 'touch' && penSeen) return;
    ink.move(e);
  }, { passive: false });

  function endStroke(e) {
    if (e) e.preventDefault();
    drawing = false;
    if (ink) ink.end();
  }
  canvas.addEventListener('pointerup', endStroke, { passive: false });
  canvas.addEventListener('pointerleave', endStroke, { passive: false });
  canvas.addEventListener('pointercancel', endStroke, { passive: false });

  /* ── Category selector ─────────────────────────────────────────────────── */
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeCat = btn.dataset.drawCat;
      catBtns.forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  /* ── Brush size selector ───────────────────────────────────────────────── */
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      brushR = parseInt(btn.dataset.size, 10);
      if (ink) ink.setSize(brushR);
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeMode = btn.dataset.mode === 'erase' ? 'erase' : 'draw';
      if (ink) ink.setMode(activeMode);
      canvas.classList.toggle('erasing', activeMode === 'erase');
      modeBtns.forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  undoBtn.addEventListener('click', doUndo);
  clearBtn.addEventListener('click', () => clearCanvas(true));

  /* ── Save ──────────────────────────────────────────────────────────────── */
  saveBtn.addEventListener('click', () => {
    // Crop transparent image to the actual drawn pixels to keep files small.
    const dataURL = trimCanvas(canvas);
    if (!dataURL) {
      savedMsg.textContent = 'Draw something first.';
      savedMsg.classList.add('visible');
      setTimeout(() => savedMsg.classList.remove('visible'), 1500);
      return;
    }

    const customs = App.getCustomAssetsByCat(activeCat);
    if (customs.length >= MAX_PER_CAT) {
      // Drop oldest custom asset for this category.
      const oldest = customs[0];
      App.deleteCustomAsset(activeCat, oldest.id);
    }

    const id = 'custom-' + activeCat + '-' + Date.now();
    const label = 'Drawn ' + catLabel(activeCat);
    const isPublic = publicBox && publicBox.checked;
    App.saveCustomAsset(activeCat, {
      id,
      label,
      src: dataURL,
      thumb: dataURL,
      created: new Date().toISOString(),
      isCustom: true,
      raw: false,
      isPublic,
    });

    savedMsg.textContent = isPublic
      ? 'Saved publicly — everyone can see it in Build.'
      : 'Saved — switch to Build to wear it.';
    savedMsg.classList.add('visible');
    setTimeout(() => savedMsg.classList.remove('visible'), 2200);

    // Clear the canvas for the next drawing and reset the public toggle.
    clearCanvas(false);
    if (publicBox) publicBox.checked = false;

    // If the global tab switcher is available, hop back to Build after a beat.
    if (window.CHARACTER_UI && window.CHARACTER_UI.switchTab) {
      setTimeout(() => window.CHARACTER_UI.switchTab('panel-build'), 600);
    }
  });

  function catLabel(cat) {
    return { face: 'face', tops: 'top', bottoms: 'bottom', body: 'body' }[cat] || cat;
  }

  /* ── Trim transparent canvas to content ──────────────────────────────────
   * Returns a data URL of the cropped region, or null if the canvas is empty. */
  function trimCanvas(c) {
    const w = c.width, h = c.height;
    const idata = ctx.getImageData(0, 0, w, h);
    const data = idata.data;
    let minX = w, minY = h, maxX = 0, maxY = 0;
    let has = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4 + 3;
        if (data[idx] > 0) {
          has = true;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (!has) return null;
    const pad = Math.max(4, Math.floor(Math.max(maxX - minX, maxY - minY) * 0.04));
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w, maxX + pad);
    maxY = Math.min(h, maxY + pad);
    const cw = maxX - minX;
    const ch = maxY - minY;
    const out = document.createElement('canvas');
    out.width = cw; out.height = ch;
    out.getContext('2d').putImageData(ctx.getImageData(minX, minY, cw, ch), 0, 0);
    return out.toDataURL('image/png');
  }

  /* ── Init ──────────────────────────────────────────────────────────────── */
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

})();
