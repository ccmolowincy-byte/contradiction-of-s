/* ── Avatar creator: layers, distortion mesh warp, drawing, identity ── */
(function () {

  /* ════════════════════════════════════════════ Constants */
  const STAGE_W    = 300, STAGE_H = 440;
  const BG_SIZE    = 1024;    // square bg artboard pixel resolution (1024×1024)
  const BG_COLOR   = '#F0EAE0';
  const ITEM_H     = 35;
  const DRUM_REPS  = 5;
  const MESH_COLS  = 8, MESH_ROWS = 12;
  const MAX_HISTORY = 15;

  /* Per-body-type default geometry */
  const DEFAULTS_BY_TYPE = {
    flat: {
      body:          { x: 20,  y: 10,  w: 260, h: 420, z: 1 },
      'hair-bottom': { x: 40,  y: 0,   w: 220, h: 200, z: 2 },
      bottoms:       { x: 40,  y: 230, w: 220, h: 195, z: 3 },
      tops:          { x: 30,  y: 115, w: 240, h: 170, z: 4 },
      face:          { x: 55,  y: 20,  w: 190, h: 190, z: 5 },
      'hair-top':    { x: 40,  y: 0,   w: 220, h: 180, z: 6 },
    },
    circular: {
      body:          { x: 50,  y: 5,   w: 200, h: 430, z: 1 },
      'hair-bottom': { x: 20,  y: 0,   w: 260, h: 190, z: 2 },
      bottoms:       { x: 20,  y: 245, w: 260, h: 195, z: 3 },
      tops:          { x: 20,  y: 120, w: 260, h: 175, z: 4 },
      face:          { x: 20,  y: 18,  w: 260, h: 142, z: 5 },
      'hair-top':    { x: 20,  y: 0,   w: 260, h: 155, z: 6 },
    },
    oval: {
      body:          { x: 50,  y: 5,   w: 200, h: 430, z: 1 },
      'hair-bottom': { x: 20,  y: 0,   w: 260, h: 190, z: 2 },
      bottoms:       { x: 20,  y: 245, w: 260, h: 195, z: 3 },
      tops:          { x: 20,  y: 120, w: 260, h: 175, z: 4 },
      face:          { x: 20,  y: 18,  w: 260, h: 142, z: 5 },
      'hair-top':    { x: 20,  y: 0,   w: 260, h: 155, z: 6 },
    },
  };

  const CAT_NAMES = {
    body: 'Body', face: 'Face',
    'hair-top': 'Hair (top)', 'hair-bottom': 'Hair (low)',
    tops: 'Top', bottoms: 'Bottom',
  };

  /* ════════════════════════════════════════════ State */
  let bodyType       = 'flat';
  let layers         = {};
  let selCat         = null;
  let activeTool     = 'select';
  let activeCat      = 'body';
  let brushSize      = 4;
  let distortRadius  = 0.15;
  let isDrawing      = false;
  let layerPanelOpen = false;
  let selectedColour = App.COLOURS[0];
  let selectedShape  = App.SHAPES[0];
  let penColor       = '#B31A1A';

  /* Crop state */
  let cropSourceCanvas = null;
  let cropScale = 1, cropX = 0, cropY = 0, cropDragStart = null;

  /* History state */
  let historyStack = [];
  let historyPos   = -1;

  function getAssets()   { return App.ASSETS_BY_TYPE[bodyType] || App.ASSETS_BY_TYPE.flat; }
  function getDEFAULTS() { return DEFAULTS_BY_TYPE[bodyType]   || DEFAULTS_BY_TYPE.flat;   }

  /* ════════════════════════════════════════════ DOM refs */
  const stage      = document.getElementById('avatar-stage');
  const drawCanvas = document.getElementById('drawing-canvas');
  const dCtx       = drawCanvas.getContext('2d');
  drawCanvas.width  = STAGE_W;
  drawCanvas.height = STAGE_H;

  /* bgCanvas lives in stage-wrap as a sibling — 440×440 square artboard */
  const bgCanvas = document.getElementById('bg-canvas');
  bgCanvas.width  = BG_SIZE;
  bgCanvas.height = BG_SIZE;
  bgCanvas.style.width  = '0';   // fitBgCanvas() sets CSS size after layout settles
  bgCanvas.style.height = '0';
  const bgCtx = bgCanvas.getContext('2d');

  const distortCursorEl = document.getElementById('distort-cursor');
  distortCursorEl.width  = STAGE_W;
  distortCursorEl.height = STAGE_H;
  const dcCtx = distortCursorEl.getContext('2d');

  /* ════════════════════════════════════════════ Restore saved state */
  const saved = App.getAvatarState();
  if (saved) {
    if (saved.bodyType)  bodyType = saved.bodyType;
    if (saved.identity) {
      if (saved.identity.colour) selectedColour = saved.identity.colour;
      if (saved.identity.shape)  selectedShape  = saved.identity.shape;
    }
    if (saved.layers) {
      saved.layers.forEach(l => {
        if (l.cat === 'clothes') return;
        if (!l.mesh)             l.mesh    = makeMesh();
        if (l.raw === undefined) l.raw     = l.src.endsWith('.JPG') || l.src.endsWith('.jpg');
        if (l.visible === undefined) l.visible = true;
        layers[l.cat] = l;
      });
      if (saved.drawing)    restoreDrawing(saved.drawing);
      if (saved.background) restoreBackground(saved.background);
    }
  }

  if (!saved?.identity) {
    const id = App.getAvatarIdentity();
    if (id) {
      if (id.colour) selectedColour = id.colour;
      if (id.shape)  selectedShape  = id.shape;
    }
  }

  if (!layers['body']) {
    const a = getAssets().body[0];
    layers['body'] = makeLayer('body', a.id, a.src);
  }

  /* ════════════════════════════════════ History ─────────────────────────
   *
   * captureSnapshot()  — copies the full app state into a plain object
   * recordState()      — push snapshot to stack, persist to localStorage
   * applySnapshot()    — restore state from a snapshot (used by undo/redo)
   *
   * recordState() is called at the END of every meaningful user action
   * (drag end, stroke end, layer selection change, etc.).
   * applySnapshot() does NOT push a new history entry.
   * ──────────────────────────────────────────────────────────────────── */

  function captureSnapshot() {
    return {
      bodyType,
      identity: { colour: selectedColour, shape: selectedShape },
      layers: Object.values(layers).map(l => ({
        ...l,
        mesh: l.mesh ? l.mesh.map(p => ({ ...p })) : makeMesh(),
      })),
      drawing:    drawCanvas.toDataURL(),
      background: bgCanvas.toDataURL(),
    };
  }

  function recordState() {
    historyStack = historyStack.slice(0, historyPos + 1);
    historyStack.push(captureSnapshot());
    if (historyStack.length > MAX_HISTORY) historyStack.shift();
    historyPos = historyStack.length - 1;
    saveState();
    updateHistoryButtons();
  }

  function applySnapshot(snap) {
    bodyType = snap.bodyType;
    document.querySelectorAll('.avatar-layer').forEach(el => el.remove());
    layers = {};
    snap.layers.forEach(ld => {
      const l = { ...ld, mesh: ld.mesh ? ld.mesh.map(p => ({ ...p })) : makeMesh() };
      layers[l.cat] = l;
      renderLayer(l);
    });
    dCtx.clearRect(0, 0, STAGE_W, STAGE_H);
    bgCtx.clearRect(0, 0, BG_SIZE, BG_SIZE);
    if (snap.drawing)    restoreDrawing(snap.drawing);
    if (snap.background) restoreBackground(snap.background);
    selectedColour = snap.identity.colour;
    selectedShape  = snap.identity.shape;
    applyColourTheme(selectedColour);
    updateIdentityDisplay();
    scrollDrumTo(document.getElementById('colour-drum'), App.COLOURS, selectedColour);
    scrollDrumTo(document.getElementById('shape-drum'),  App.SHAPES,  selectedShape);
    document.querySelectorAll('.btr-btn').forEach(btn =>
      btn.classList.toggle('active', btn.dataset.type === bodyType));
    selCat = null;
    renderAssetTray(activeCat);
    if (layerPanelOpen) renderLayerPanel();
    App.saveAvatarState(snap);
    updateHistoryButtons();
  }

  function undo() { if (historyPos > 0) { historyPos--; applySnapshot(historyStack[historyPos]); } }
  function redo() { if (historyPos < historyStack.length - 1) { historyPos++; applySnapshot(historyStack[historyPos]); } }

  function updateHistoryButtons() {
    const u = document.getElementById('tool-undo');
    const r = document.getElementById('tool-redo');
    if (u) u.disabled = historyPos <= 0;
    if (r) r.disabled = historyPos >= historyStack.length - 1;
  }

  document.getElementById('tool-undo')?.addEventListener('click', undo);
  document.getElementById('tool-redo')?.addEventListener('click', redo);

  /* Keyboard: Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z or Ctrl+Y = redo */
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
  });

  /* ════════════════════════════════════ Stage: scale to fit wrap */

  function fitStageToWrap() {
    if (activeCat === 'background') return; // bg mode manages its own stage scale
    const wrap = stage.parentElement;
    if (!wrap) return;
    const wH = wrap.clientHeight, wW = wrap.clientWidth;
    if (!wH || !wW) return;
    const scale = Math.min(wW / STAGE_W, wH / STAGE_H, 1);
    stage.style.transform = scale < 0.995 ? `scale(${scale.toFixed(3)})` : '';
  }
  /* fitBgCanvas: sizes bgCanvas CSS to a square filling the stage-wrap */
  function fitBgCanvas() {
    const wrap = stage.parentElement;
    if (!wrap) return;
    const wW = wrap.clientWidth, wH = wrap.clientHeight;
    if (!wW) return;
    const size = Math.min(wW, wH);
    bgCanvas.style.width  = size + 'px';
    bgCanvas.style.height = size + 'px';
  }
  window.addEventListener('resize', () => { fitBgCanvas(); fitStageToWrap(); });

  /* ════════════════════════════════════ Mesh helpers */

  function makeMesh() {
    const pts = [];
    for (let r = 0; r <= MESH_ROWS; r++)
      for (let c = 0; c <= MESH_COLS; c++)
        pts.push({ ox: c / MESH_COLS, oy: r / MESH_ROWS, dx: 0, dy: 0 });
    return pts;
  }
  function isMeshFlat(mesh) { return mesh.every(p => p.dx === 0 && p.dy === 0); }
  function pushMesh(mesh, px, py, vx, vy, r) {
    mesh.forEach(pt => {
      const cx = pt.ox + pt.dx, cy = pt.oy + pt.dy;
      const dist = Math.hypot(cx - px, cy - py);
      if (dist < r) { const f = Math.pow(1 - dist / r, 2); pt.dx += vx * f; pt.dy += vy * f; }
    });
  }
  function resetMesh(mesh) { mesh.forEach(p => { p.dx = 0; p.dy = 0; }); }

  /* ════════════════════════════════════ Layer factory */

  function makeLayer(cat, id, src, overrides) {
    const def   = getDEFAULTS()[cat] || { x: 60, y: 60, w: 180, h: 220, z: 3 };
    const asset = (getAssets()[cat] || []).find(a => a.id === id);
    const isRaw = asset ? !!asset.raw : (src.endsWith('.JPG') || src.endsWith('.jpg'));
    return {
      cat, id, src,
      x:       overrides ? overrides.x             : def.x,
      y:       overrides ? overrides.y             : def.y,
      w:       overrides ? overrides.w             : def.w,
      h:       overrides ? overrides.h             : def.h,
      z:       overrides ? overrides.z             : def.z,
      rot:     overrides ? (overrides.rot || 0)    : 0,
      mesh:    (overrides && overrides.mesh) ? overrides.mesh : makeMesh(),
      visible: overrides ? (overrides.visible !== false) : true,
      raw:     isRaw,
    };
  }

  /* ════════════════════════════════════ Render a layer element */

  function renderLayer(layer) {
    document.querySelector(`.avatar-layer[data-cat="${layer.cat}"]`)?.remove();
    const el = document.createElement('div');
    el.className = 'avatar-layer';
    el.dataset.cat = layer.cat;
    el.classList.toggle('raw', !!layer.raw);
    applyLayerCSS(el, layer);
    if (!layer.visible) el.style.opacity = '0.08';

    const lCanvas = document.createElement('canvas');
    lCanvas.className = 'layer-canvas';
    lCanvas.width  = layer.w; lCanvas.height = layer.h;
    lCanvas.style.display = 'none';

    const img = document.createElement('img');
    img.src = layer.src; img.draggable = false; img.className = 'layer-img';
    img.onload = () => { if (!isMeshFlat(layer.mesh)) renderDistorted(layer, img, lCanvas); };

    el.appendChild(lCanvas); el.appendChild(img);

    const hResize = mkHandle('handle-resize', `<svg viewBox="0 0 24 24"><path d="M22 22H16v-2h2.6l-3.8-3.8 1.4-1.4L20 18.6V16h2v6zm-16 0H0v-6h2v2.6l3.8-3.8 1.4 1.4L3.4 20H6v2zM22 0v6h-2V3.4l-3.8 3.8-1.4-1.4L18.6 2H16V0h6zM6 0h2v2H3.4l3.8 3.8-1.4 1.4L2 3.4V6H0V0h6z"/></svg>`);
    const hRotate = mkHandle('handle-rotate', `<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/></svg>`);
    el.appendChild(hResize); el.appendChild(hRotate);
    stage.appendChild(el);
    attachLayerEvents(el, layer, img, lCanvas, hResize, hRotate);
    if (selCat === layer.cat) selectLayer(layer.cat);
  }

  function mkHandle(cls, svgStr) {
    const h = document.createElement('div');
    h.className = `layer-handle ${cls}`;
    h.innerHTML = svgStr;
    return h;
  }

  function applyLayerCSS(el, layer) {
    el.style.left      = layer.x + 'px';
    el.style.top       = layer.y + 'px';
    el.style.width     = layer.w + 'px';
    el.style.height    = layer.h + 'px';
    el.style.transform = `rotate(${layer.rot}deg)`;
    el.style.zIndex    = layer.z;
  }

  function syncCSS(cat) {
    const el = document.querySelector(`.avatar-layer[data-cat="${cat}"]`);
    if (el && layers[cat]) applyLayerCSS(el, layers[cat]);
  }

  /* ════════════════════════════════════ Distortion rendering */

  function renderDistorted(layer, img, lCanvas) {
    const w = layer.w, h = layer.h;
    if (lCanvas.width !== w || lCanvas.height !== h) { lCanvas.width = w; lCanvas.height = h; }
    const ctx = lCanvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    const src = document.createElement('canvas');
    src.width = w; src.height = h;
    src.getContext('2d').drawImage(img, 0, 0, w, h);
    const mesh = layer.mesh;
    for (let row = 0; row < MESH_ROWS; row++) {
      for (let col = 0; col < MESH_COLS; col++) {
        const tl = mesh[row       * (MESH_COLS+1) + col];
        const tr = mesh[row       * (MESH_COLS+1) + col + 1];
        const bl = mesh[(row + 1) * (MESH_COLS+1) + col];
        const br = mesh[(row + 1) * (MESH_COLS+1) + col + 1];
        const xtl=(tl.ox+tl.dx)*w, ytl=(tl.oy+tl.dy)*h;
        const xtr=(tr.ox+tr.dx)*w, ytr=(tr.oy+tr.dy)*h;
        const xbl=(bl.ox+bl.dx)*w, ybl=(bl.oy+bl.dy)*h;
        const xbr=(br.ox+br.dx)*w, ybr=(br.oy+br.dy)*h;
        drawAffineTriangle(ctx,src,xtl,ytl,xtr,ytr,xbl,ybl, tl.ox*w,tl.oy*h,tr.ox*w,tr.oy*h,bl.ox*w,bl.oy*h);
        drawAffineTriangle(ctx,src,xtr,ytr,xbr,ybr,xbl,ybl, tr.ox*w,tr.oy*h,br.ox*w,br.oy*h,bl.ox*w,bl.oy*h);
      }
    }
    const imgEl = lCanvas.parentElement?.querySelector('.layer-img');
    if (imgEl) imgEl.style.display = 'none';
    lCanvas.style.display = 'block';
  }

  function drawAffineTriangle(ctx,src,x0,y0,x1,y1,x2,y2,u0,v0,u1,v1,u2,v2) {
    ctx.save();
    ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.lineTo(x2,y2); ctx.closePath(); ctx.clip();
    const du1=u1-u0,dv1=v1-v0,du2=u2-u0,dv2=v2-v0;
    const dx1=x1-x0,dy1=y1-y0,dx2=x2-x0,dy2=y2-y0;
    const det=du1*dv2-du2*dv1;
    if (Math.abs(det)<1e-8){ctx.restore();return;}
    const a=(dx1*dv2-dx2*dv1)/det, b=(dy1*dv2-dy2*dv1)/det;
    const c=(du1*dx2-du2*dx1)/det, d=(du1*dy2-du2*dy1)/det;
    const e=x0-a*u0-c*v0, f=y0-b*u0-d*v0;
    ctx.transform(a,b,c,d,e,f); ctx.drawImage(src,0,0); ctx.restore();
  }

  /* ════════════════════════════════════ Selection */

  function selectLayer(cat) {
    selCat = cat;
    document.querySelectorAll('.avatar-layer').forEach(el =>
      el.classList.toggle('selected', el.dataset.cat === cat));
    if (layerPanelOpen) renderLayerPanel();
  }

  /* ════════════════════════════════════ Stage coords
   * getBoundingClientRect() always returns the CSS-rendered (possibly scaled)
   * dimensions, so these functions handle CSS transform: scale() correctly.
   */

  function stageXY(e) {
    const r = stage.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (STAGE_W / r.width),
      y: (e.clientY - r.top)  * (STAGE_H / r.height),
    };
  }

  /* ════════════════════════════════════ Layer interactions */

  function attachLayerEvents(el, layer, img, lCanvas, hResize, hRotate) {
    el.addEventListener('pointerdown', e => {
      if (activeTool === 'distort') { startDistort(e, layer, img, lCanvas); return; }
      if (activeTool !== 'select') return;
      if (e.target.closest('.layer-handle')) return;
      selectLayer(layer.cat); startDrag(e, layer);
    }, { passive: false });
    hResize.addEventListener('pointerdown', e => { e.stopPropagation(); startResize(e, layer, img, lCanvas); }, { passive: false });
    hRotate.addEventListener('pointerdown', e => { e.stopPropagation(); startRotate(e, layer); }, { passive: false });
  }

  function startDrag(e, layer) {
    e.preventDefault();
    const s=stageXY(e), ox=layer.x, oy=layer.y;
    const onMove = ev => { ev.preventDefault(); const c=stageXY(ev); layer.x=ox+c.x-s.x; layer.y=oy+c.y-s.y; syncCSS(layer.cat); };
    const onUp   = () => { document.removeEventListener('pointermove',onMove); document.removeEventListener('pointerup',onUp); recordState(); };
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
  }

  function startResize(e, layer, img, lCanvas) {
    e.preventDefault();
    const s=stageXY(e), ow=layer.w, oh=layer.h;
    const onMove = ev => {
      ev.preventDefault(); const c=stageXY(ev);
      const delta=((c.x-s.x)+(c.y-s.y))/2;
      layer.w=Math.max(40,ow+delta); layer.h=Math.max(40,oh+delta);
      syncCSS(layer.cat);
      if (lCanvas && img && !isMeshFlat(layer.mesh)) renderDistorted(layer, img, lCanvas);
    };
    const onUp = () => { document.removeEventListener('pointermove',onMove); document.removeEventListener('pointerup',onUp); recordState(); };
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
  }

  function startRotate(e, layer) {
    e.preventDefault();
    const r=stage.getBoundingClientRect();
    const cx=(layer.x+layer.w/2)/(STAGE_W/r.width)+r.left;
    const cy=(layer.y+layer.h/2)/(STAGE_H/r.height)+r.top;
    const startA=Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI, startR=layer.rot;
    const onMove = ev => { ev.preventDefault(); const a=Math.atan2(ev.clientY-cy,ev.clientX-cx)*180/Math.PI; layer.rot=startR+(a-startA); syncCSS(layer.cat); };
    const onUp   = () => { document.removeEventListener('pointermove',onMove); document.removeEventListener('pointerup',onUp); recordState(); };
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
  }

  /* ════════════════════════════════════ Distortion */

  function startDistort(e, layer, img, lCanvas) {
    if (!layer.visible) return;
    e.preventDefault(); selectLayer(layer.cat);
    const el = document.querySelector(`.avatar-layer[data-cat="${layer.cat}"]`);
    el.setPointerCapture(e.pointerId);
    let lastP = layerNorm(e, layer);
    const onMove = ev => {
      ev.preventDefault();
      const p=layerNorm(ev,layer), sp=stageXY(ev);
      drawDistortCursor(sp.x, sp.y);
      const vx=(p.x-lastP.x)*0.55, vy=(p.y-lastP.y)*0.55;
      if (Math.abs(vx)>0.0005 || Math.abs(vy)>0.0005) {
        pushMesh(layer.mesh, p.x, p.y, vx, vy, distortRadius);
        renderDistorted(layer, img, lCanvas);
      }
      lastP=p;
    };
    const onUp = () => { clearDistortCursor(); document.removeEventListener('pointermove',onMove); document.removeEventListener('pointerup',onUp); recordState(); };
    document.addEventListener('pointermove', onMove, { passive: false });
    document.addEventListener('pointerup', onUp);
  }

  function layerNorm(e, layer) {
    const p=stageXY(e);
    const cx=layer.x+layer.w/2, cy=layer.y+layer.h/2;
    const rad=-layer.rot*Math.PI/180;
    const dx=p.x-cx, dy=p.y-cy;
    const lx=dx*Math.cos(rad)-dy*Math.sin(rad)+layer.w/2;
    const ly=dx*Math.sin(rad)+dy*Math.cos(rad)+layer.h/2;
    return { x: lx/layer.w, y: ly/layer.h };
  }

  function drawDistortCursor(px, py) {
    const l=selCat&&layers[selCat]?layers[selCat]:null;
    const r=l?distortRadius*Math.max(l.w,l.h)*0.45:distortRadius*130;
    dcCtx.clearRect(0,0,STAGE_W,STAGE_H); dcCtx.save();
    dcCtx.beginPath(); dcCtx.arc(px,py,Math.max(4,r),0,Math.PI*2);
    dcCtx.setLineDash([4,3]); dcCtx.strokeStyle='rgba(179,26,26,0.55)'; dcCtx.lineWidth=1.5; dcCtx.stroke();
    dcCtx.setLineDash([]); dcCtx.fillStyle='rgba(179,26,26,0.06)'; dcCtx.fill();
    dcCtx.beginPath(); dcCtx.arc(px,py,2.5,0,Math.PI*2); dcCtx.fillStyle='rgba(179,26,26,0.65)'; dcCtx.fill();
    dcCtx.restore();
  }
  function clearDistortCursor() { dcCtx.clearRect(0,0,STAGE_W,STAGE_H); }

  stage.addEventListener('pointermove', e => { if (activeTool==='distort') drawDistortCursor(stageXY(e).x,stageXY(e).y); });
  stage.addEventListener('pointerleave', () => clearDistortCursor());

  /* ════════════════════════════════════ Foreground drawing (drawCanvas)
   * Captures strokes on the portrait stage (300×440).
   * Background drawing is handled separately via bgCanvas listeners below.
   */

  drawCanvas.addEventListener('pointerdown', e => {
    if (activeTool !== 'draw') return;
    e.preventDefault();
    isDrawing = true;
    const c = canvasXY(e);
    dCtx.beginPath(); dCtx.moveTo(c.x, c.y);
    drawCanvas.setPointerCapture(e.pointerId);
  }, { passive: false });

  drawCanvas.addEventListener('pointermove', e => {
    if (!isDrawing) return;
    e.preventDefault();
    const c = canvasXY(e);
    dCtx.lineTo(c.x, c.y);
    dCtx.strokeStyle = penColor;
    dCtx.lineWidth   = brushSize;
    dCtx.lineCap     = 'round';
    dCtx.lineJoin    = 'round';
    dCtx.stroke();
  }, { passive: false });

  drawCanvas.addEventListener('pointerup', () => {
    if (!isDrawing) return;
    isDrawing = false;
    recordState();
  });

  function canvasXY(e) {
    const r = drawCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (STAGE_W / r.width),
      y: (e.clientY - r.top)  * (STAGE_H / r.height),
    };
  }

  /* ════════════════════════════════════ Background drawing (bgCanvas)
   * bgCanvas is a 440×440 square sibling of #avatar-stage in #avatar-stage-wrap.
   * When the Background tab is active, bgCanvas receives pointer-events (all)
   * and stage / drawCanvas receive pointer-events: none so events fall through.
   */

  function bgCoordXY(e) {
    const r = bgCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (BG_SIZE / r.width),
      y: (e.clientY - r.top)  * (BG_SIZE / r.height),
    };
  }

  bgCanvas.addEventListener('pointerdown', e => {
    if (activeCat !== 'background' || activeTool !== 'draw') return;
    e.preventDefault();
    isDrawing = true;
    const c = bgCoordXY(e);
    bgCtx.beginPath(); bgCtx.moveTo(c.x, c.y);
    bgCanvas.setPointerCapture(e.pointerId);
  }, { passive: false });

  bgCanvas.addEventListener('pointermove', e => {
    if (!isDrawing || activeCat !== 'background') return;
    e.preventDefault();
    const c = bgCoordXY(e);
    bgCtx.lineTo(c.x, c.y);
    bgCtx.strokeStyle = penColor;
    bgCtx.lineWidth   = brushSize;
    bgCtx.lineCap     = 'round';
    bgCtx.lineJoin    = 'round';
    bgCtx.stroke();
  }, { passive: false });

  bgCanvas.addEventListener('pointerup', () => {
    if (!isDrawing || activeCat !== 'background') return;
    isDrawing = false;
    recordState();
  });

  bgCanvas.addEventListener('pointercancel', () => {
    if (activeCat === 'background') isDrawing = false;
  });

  /* ════════════════════════════════════ Asset tray */

  function renderAssetTray(cat) {
    activeCat = cat;

    /* ── Artboard + pointer routing ──────────────────────────────────────────
     * Background tab: 1024-pixel square bgCanvas receives all pointer events.
     *   Stage is zoomed to 50% (composition view) and has pointer-events:none.
     * Other tabs: stage returns to normal scale and pointer handling.
     * ─────────────────────────────────────────────────────────────────────── */
    const isBg = cat === 'background';
    bgCanvas.classList.toggle('bg-active-mode', isBg);
    bgCanvas.style.pointerEvents   = isBg ? 'all'  : 'none';
    stage.style.pointerEvents      = isBg ? 'none' : '';
    drawCanvas.style.pointerEvents = isBg ? 'none' : '';
    /* Composition view: zoom stage out to 50% so there's space to draw around it */
    if (isBg) {
      stage.style.transform = 'scale(0.5)';
    } else {
      fitStageToWrap();
    }

    const tray = document.getElementById('asset-tray');
    tray.innerHTML = '';

    if (cat === 'background') {
      const note = document.createElement('div');
      note.className = 'bg-tray';
      note.innerHTML = `
        <p class="bg-tray-note">Draw anywhere in this composition space. Avatar is shown small here — it will be centred and scaled up in your saved portrait.</p>
        <button class="btn btn-ghost btn-sm" id="bg-clear-btn">Clear background</button>
      `;
      note.querySelector('#bg-clear-btn').addEventListener('click', () => {
        bgCtx.clearRect(0, 0, BG_SIZE, BG_SIZE);
        recordState();
      });
      tray.appendChild(note);
      setTool('draw');
      return;
    }

    if (cat !== 'body') {
      const none = document.createElement('div');
      none.className = 'asset-thumb none-thumb' + (!layers[cat] ? ' selected' : '');
      none.textContent = '∅'; none.title = 'Remove';
      none.addEventListener('click', () => {
        document.querySelector(`.avatar-layer[data-cat="${cat}"]`)?.remove();
        delete layers[cat];
        renderAssetTray(cat);
        if (layerPanelOpen) renderLayerPanel();
        recordState();
      });
      tray.appendChild(none);
    }

    const current = layers[cat];
    (getAssets()[cat] || []).forEach(asset => {
      const thumb = document.createElement('div');
      thumb.className = 'asset-thumb' + (current && current.id === asset.id ? ' selected' : '');
      if (asset.raw) thumb.classList.add('raw');
      const img = document.createElement('img');
      img.src = asset.src; img.alt = asset.label;
      thumb.appendChild(img); thumb.title = asset.label;
      thumb.addEventListener('click', () => {
        if (layers[cat] && layers[cat].id === asset.id) return;
        const ex = layers[cat];
        const overrides = ex ? { x:ex.x,y:ex.y,w:ex.w,h:ex.h,z:ex.z,rot:ex.rot } : null;
        layers[cat] = makeLayer(cat, asset.id, asset.src, overrides);
        renderLayer(layers[cat]); selectLayer(cat); renderAssetTray(cat);
        if (layerPanelOpen) renderLayerPanel();
        recordState();
      });
      tray.appendChild(thumb);
    });
  }

  function updateCatTabs() {
    document.querySelectorAll('.cat-tab').forEach(tab => {
      const cat = tab.dataset.cat;
      if (cat === '__layers') {
        tab.classList.toggle('active', layerPanelOpen);
      } else {
        tab.classList.toggle('active', cat === activeCat && !layerPanelOpen);
      }
    });
  }

  document.querySelectorAll('.cat-tab').forEach(tab =>
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;
      if (cat === '__layers') {
        layerPanelOpen = !layerPanelOpen;
        if (layerPanelOpen) {
          document.getElementById('asset-tray').style.display = 'none';
          document.getElementById('layer-panel').classList.add('visible');
          renderLayerPanel();
        } else {
          document.getElementById('asset-tray').style.display = '';
          document.getElementById('layer-panel').classList.remove('visible');
        }
        updateCatTabs(); return;
      }
      if (layerPanelOpen) {
        layerPanelOpen = false;
        document.getElementById('layer-panel').classList.remove('visible');
        document.getElementById('asset-tray').style.display = '';
      }
      activeCat = cat;
      updateCatTabs(); renderAssetTray(activeCat);
      if (layers[activeCat]) selectLayer(activeCat);
    })
  );

  /* ════════════════════════════════════ Layer panel */

  function renderLayerPanel() {
    const panel = document.getElementById('layer-panel');
    if (!panel) return;
    panel.innerHTML = '';
    const sorted = Object.values(layers).sort((a, b) => b.z - a.z);
    if (sorted.length === 0) {
      const empty = document.createElement('div'); empty.className = 'lp-empty'; empty.textContent = 'No layers yet'; panel.appendChild(empty); return;
    }
    sorted.forEach(layer => {
      const item = document.createElement('div');
      item.className = 'lp-item' + (layer.cat === selCat ? ' lp-selected' : '');
      const visBtn = document.createElement('button');
      visBtn.className = 'lp-vis' + (!layer.visible ? ' hidden' : '');
      visBtn.textContent = layer.visible ? '●' : '○';
      visBtn.addEventListener('click', e => {
        e.stopPropagation(); layer.visible = !layer.visible;
        const el = document.querySelector(`.avatar-layer[data-cat="${layer.cat}"]`);
        if (el) el.style.opacity = layer.visible ? '' : '0.08';
        renderLayerPanel(); recordState();
      });
      const name = document.createElement('span'); name.className = 'lp-name'; name.textContent = CAT_NAMES[layer.cat] || layer.cat;
      const orderDiv = document.createElement('div'); orderDiv.className = 'lp-order';
      const upBtn = document.createElement('button'); upBtn.className='lp-up'; upBtn.textContent='▲';
      upBtn.addEventListener('click', e => { e.stopPropagation(); moveLayerUp(layer.cat); });
      const dnBtn = document.createElement('button'); dnBtn.className='lp-dn'; dnBtn.textContent='▼';
      dnBtn.addEventListener('click', e => { e.stopPropagation(); moveLayerDown(layer.cat); });
      orderDiv.appendChild(upBtn); orderDiv.appendChild(dnBtn);
      item.appendChild(visBtn); item.appendChild(name); item.appendChild(orderDiv);
      item.addEventListener('click', () => { selectLayer(layer.cat); renderLayerPanel(); });
      panel.appendChild(item);
    });
  }

  function moveLayerUp(cat) {
    const layer=layers[cat]; if (!layer) return;
    const sorted=Object.values(layers).sort((a,b)=>a.z-b.z);
    const idx=sorted.findIndex(l=>l.cat===cat);
    if (idx<sorted.length-1) { const o=sorted[idx+1]; const tmp=layer.z; layer.z=o.z; o.z=tmp; syncCSS(cat); syncCSS(o.cat); renderLayerPanel(); recordState(); }
  }
  function moveLayerDown(cat) {
    const layer=layers[cat]; if (!layer) return;
    const sorted=Object.values(layers).sort((a,b)=>a.z-b.z);
    const idx=sorted.findIndex(l=>l.cat===cat);
    if (idx>0) { const o=sorted[idx-1]; const tmp=layer.z; layer.z=o.z; o.z=tmp; syncCSS(cat); syncCSS(o.cat); renderLayerPanel(); recordState(); }
  }

  /* ════════════════════════════════════ Body type selector */

  function buildBodyTypeSelector() {
    const assetPanel = document.querySelector('.asset-panel');
    if (!assetPanel) return;
    const row = document.createElement('div');
    row.id = 'body-type-row';
    const label = document.createElement('span'); label.className = 'btr-label'; label.textContent = 'Body';
    row.appendChild(label);
    App.BODY_TYPES.forEach(bt => {
      const btn = document.createElement('button');
      btn.className = 'btr-btn' + (bt.id===bodyType?' active':'') + (!bt.available?' unavailable':'');
      btn.dataset.type = bt.id; btn.textContent = bt.label;
      btn.title = bt.available ? bt.subtitle : `${bt.subtitle} — coming soon`;
      if (!bt.available) { btn.disabled = true; }
      else { btn.addEventListener('click', () => { if (bt.id!==bodyType) switchBodyType(bt.id); }); }
      row.appendChild(btn);
    });
    assetPanel.insertBefore(row, assetPanel.firstChild);
  }

  function switchBodyType(newType) {
    if (newType === bodyType) return;
    bodyType = newType;
    document.querySelectorAll('.avatar-layer').forEach(el => el.remove());
    layers = {};
    dCtx.clearRect(0,0,STAGE_W,STAGE_H);
    bgCtx.clearRect(0,0,BG_SIZE,BG_SIZE);
    selCat = null;
    const a = getAssets().body[0];
    layers['body'] = makeLayer('body', a.id, a.src);
    renderLayer(layers['body']);
    document.querySelectorAll('.btr-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.type===bodyType));
    activeCat = 'body'; updateCatTabs(); renderAssetTray('body'); recordState();
  }

  /* ════════════════════════════════════ Identity pickers — infinite scroll */

  function buildIdentityPanel() {
    const colourDrum = document.getElementById('colour-drum');
    const shapeDrum  = document.getElementById('shape-drum');
    if (!colourDrum || !shapeDrum) return;

    setupDrum(colourDrum, App.COLOURS, val => {
      selectedColour = val;
      applyColourTheme(val);
      updateIdentityDisplay();
    });

    setupDrum(shapeDrum, App.SHAPES, val => {
      selectedShape = val;
      updateIdentityDisplay();
    });

    setTimeout(() => {
      const cMid = Math.floor(DRUM_REPS / 2) * App.COLOURS.length;
      const sMid = Math.floor(DRUM_REPS / 2) * App.SHAPES.length;
      const cIdx = App.COLOURS.indexOf(selectedColour);
      const sIdx = App.SHAPES.indexOf(selectedShape);
      if (cIdx >= 0) { colourDrum.scrollTop = (cMid + cIdx) * ITEM_H; updateDrumClasses(colourDrum, cMid + cIdx); }
      if (sIdx >= 0) { shapeDrum.scrollTop  = (sMid + sIdx) * ITEM_H; updateDrumClasses(shapeDrum,  sMid + sIdx); }
      updateIdentityDisplay();
    }, 60);

    document.getElementById('identity-toggle')?.addEventListener('click', () => {
      const panel  = document.getElementById('identity-panel');
      const toggle = document.getElementById('identity-toggle');
      const open   = panel.classList.toggle('open');
      toggle.classList.toggle('open', open);
      /* Re-fit stage after the CSS transition (280ms) */
      setTimeout(fitStageToWrap, 320);
    });
  }

  function setupDrum(drum, items, onChange) {
    const N      = items.length;
    const midIdx = Math.floor(DRUM_REPS / 2) * N;

    const padTop = document.createElement('div'); padTop.className = 'picker-pad';
    drum.appendChild(padTop);

    for (let rep = 0; rep < DRUM_REPS; rep++) {
      items.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'picker-item';
        div.textContent = item;
        div.addEventListener('click', () => {
          const currentRaw = Math.round(drum.scrollTop / ITEM_H);
          const repBase    = Math.floor(currentRaw / N) * N;
          let target       = repBase + i;
          if (target - currentRaw >  N / 2) target -= N;
          if (currentRaw - target >  N / 2) target += N;
          drum.scrollTo({ top: target * ITEM_H, behavior: 'smooth' });
        });
        drum.appendChild(div);
      });
    }

    const padBot = document.createElement('div'); padBot.className = 'picker-pad';
    drum.appendChild(padBot);

    drum.scrollTop = midIdx * ITEM_H;

    let scrollTimer, jumping = false;

    drum.addEventListener('scroll', () => {
      if (jumping) return;

      if (drum.scrollTop < (midIdx - N) * ITEM_H) {
        jumping = true;
        drum.style.scrollSnapType = 'none';
        drum.scrollTop += N * ITEM_H;
        setTimeout(() => { drum.style.scrollSnapType = 'y mandatory'; jumping = false; }, 0);
      } else if (drum.scrollTop > (midIdx + N) * ITEM_H) {
        jumping = true;
        drum.style.scrollSnapType = 'none';
        drum.scrollTop -= N * ITEM_H;
        setTimeout(() => { drum.style.scrollSnapType = 'y mandatory'; jumping = false; }, 0);
      }

      updateDrumClasses(drum, Math.round(drum.scrollTop / ITEM_H));

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const finalRaw  = Math.round(drum.scrollTop / ITEM_H);
        const finalReal = ((finalRaw % N) + N) % N;
        onChange(items[finalReal], finalReal);
        recordState();
      }, 120);
    }, { passive: true });
  }

  function updateDrumClasses(drum, selectedRawIdx) {
    drum.querySelectorAll('.picker-item').forEach((el, i) => {
      const dist = Math.abs(i - selectedRawIdx);
      el.classList.toggle('is-selected', dist === 0);
      el.classList.toggle('is-near',     dist === 1);
    });
  }

  /* Scroll a drum to the correct position for a named item */
  function scrollDrumTo(drumEl, items, itemName) {
    if (!drumEl) return;
    const idx = items.indexOf(itemName);
    if (idx < 0) return;
    const midIdx = Math.floor(DRUM_REPS / 2) * items.length;
    drumEl.scrollTop = (midIdx + idx) * ITEM_H;
    updateDrumClasses(drumEl, midIdx + idx);
  }

  function updateIdentityDisplay() {
    const name    = `${selectedColour} ${selectedShape}`;
    const result  = document.getElementById('identity-result');
    const preview = document.getElementById('identity-preview');
    if (result)  result.textContent  = name;
    if (preview) preview.textContent = name;
  }

  /* ════════════════════════════════════ Colour theme
   * Updates --burgundy / --red CSS variables and the drawing pen colour.
   */

  function applyColourTheme(colourName) {
    const theme = App.COLOUR_THEMES[colourName];
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--burgundy', theme[0]);
    root.style.setProperty('--red',      theme[1]);
    penColor = theme[0];
    const r = parseInt(theme[0].slice(1,3),16)/255;
    const g = parseInt(theme[0].slice(3,5),16)/255;
    const b = parseInt(theme[0].slice(5,7),16)/255;
    document.body.classList.toggle('theme-light', 0.299*r + 0.587*g + 0.114*b > 0.45);
  }

  /* ════════════════════════════════════ Toolbar */

  document.getElementById('tool-select').addEventListener('click',  () => setTool('select'));
  document.getElementById('tool-draw').addEventListener('click',    () => setTool('draw'));
  document.getElementById('tool-distort').addEventListener('click', () => setTool('distort'));

  /* Clear All — resets everything, restores blank body */
  document.getElementById('tool-clear-draw').addEventListener('click', () => {
    /* Capture current state for undo BEFORE clearing */
    historyStack = historyStack.slice(0, historyPos + 1);
    historyStack.push(captureSnapshot());
    if (historyStack.length > MAX_HISTORY) historyStack.shift();
    historyPos = historyStack.length - 1;

    /* Remove all layers */
    [...Object.keys(layers)].forEach(cat => {
      document.querySelector(`.avatar-layer[data-cat="${cat}"]`)?.remove();
      delete layers[cat];
    });

    /* Restore default blank body */
    const blank = getAssets().body[0];
    layers['body'] = makeLayer('body', blank.id, blank.src);
    renderLayer(layers['body']);

    /* Clear drawings */
    dCtx.clearRect(0, 0, STAGE_W, STAGE_H);
    bgCtx.clearRect(0, 0, BG_SIZE, BG_SIZE);

    selCat = null;
    renderAssetTray(activeCat);
    if (layerPanelOpen) renderLayerPanel();
    saveState();
    updateHistoryButtons();

    const btn = document.getElementById('tool-clear-draw');
    if (btn) {
      const orig = btn.innerHTML;
      btn.textContent = '✓';
      setTimeout(() => { btn.innerHTML = orig; }, 1000);
    }
  });

  /* Reset warp (also accessible from distort-controls panel in HTML) */
  function doResetDistort() {
    if (selCat && layers[selCat]) {
      resetMesh(layers[selCat].mesh);
      const el      = document.querySelector(`.avatar-layer[data-cat="${selCat}"]`);
      const imgEl   = el?.querySelector('.layer-img');
      const lCanvas = el?.querySelector('.layer-canvas');
      if (imgEl)   imgEl.style.display   = 'block';
      if (lCanvas) lCanvas.style.display = 'none';
      recordState();
    }
  }
  document.getElementById('tool-reset-distort')?.addEventListener('click', doResetDistort);
  document.getElementById('distort-reset-btn')?.addEventListener('click', doResetDistort);

  document.getElementById('tool-remove').addEventListener('click', () => {
    if (selCat && layers[selCat] && selCat !== 'body') {
      document.querySelector(`.avatar-layer[data-cat="${selCat}"]`)?.remove();
      delete layers[selCat]; selCat = null;
      document.querySelectorAll('.avatar-layer').forEach(el => el.classList.remove('selected'));
      renderAssetTray(activeCat);
      if (layerPanelOpen) renderLayerPanel();
      recordState();
    }
  });

  function setTool(t) {
    activeTool = t;
    ['select','draw','distort'].forEach(name =>
      document.getElementById(`tool-${name}`)?.classList.toggle('active', t === name));
    drawCanvas.classList.toggle('active', t === 'draw');
    document.getElementById('draw-controls')?.classList.toggle('visible', t === 'draw');
    document.getElementById('distort-controls')?.classList.toggle('visible', t === 'distort');
    if (t !== 'select') {
      selCat = null;
      document.querySelectorAll('.avatar-layer').forEach(el => el.classList.remove('selected'));
    }
    document.querySelectorAll('.avatar-layer').forEach(el => {
      el.style.pointerEvents = (t === 'draw') ? 'none' : 'all';
    });
    if (t !== 'distort') clearDistortCursor();
  }

  document.querySelectorAll('.brush-size-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      brushSize = parseInt(btn.dataset.size);
      document.querySelectorAll('.brush-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    })
  );

  document.getElementById('distort-radius')?.addEventListener('input', e => {
    distortRadius = parseFloat(e.target.value);
  });

  /* ════════════════════════════════════ Portrait capture */

  /* ─────────────────────────────────────────────────────────────────────────
   * buildAvatarCanvas(fillBackground)  →  { avCanvas, avLeft, avTop, avW_px, avH_px }
   *
   * Shared geometry + layer-draw helper used by both capture functions.
   * fillBackground=true  : fills avCanvas with BG_COLOR so multiply compositing
   *                        works correctly (raw JPG layers multiply against cream).
   * fillBackground=false : starts transparent; raw JPG layers have their white
   *                        background converted to alpha before compositing.
   * ───────────────────────────────────────────────────────────────────────── */
  function buildAvatarCanvas(fillBackground) {
    fitBgCanvas();

    const prevTransform = stage.style.transform;
    stage.style.transform = 'scale(0.5)';
    const bgRect    = bgCanvas.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    stage.style.transform = prevTransform;

    const bW = bgRect.width, bH = bgRect.height;
    if (!bW || !bH) return null;

    const scaleX = BG_SIZE / bW;
    const scaleY = BG_SIZE / bH;
    const avLeft = (stageRect.left - bgRect.left) * scaleX;
    const avTop  = (stageRect.top  - bgRect.top)  * scaleY;
    const avW    = stageRect.width  * scaleX;
    const avH    = stageRect.height * scaleY;

    const avW_px = Math.max(1, Math.round(avW));
    const avH_px = Math.max(1, Math.round(avH));
    const avCanvas = document.createElement('canvas');
    avCanvas.width  = avW_px;
    avCanvas.height = avH_px;
    const avCtx   = avCanvas.getContext('2d');
    const lScaleX = avW / STAGE_W;
    const lScaleY = avH / STAGE_H;

    // Fill background so raw-layer multiply has a correct base (flat export)
    if (fillBackground) {
      avCtx.fillStyle = BG_COLOR;
      avCtx.fillRect(0, 0, avW_px, avH_px);
    }

    const sorted = Object.values(layers).sort((a, b) => a.z - b.z);
    for (const layer of sorted) {
      if (!layer.visible) continue;
      const el = document.querySelector(`.avatar-layer[data-cat="${layer.cat}"]`);
      if (!el) continue;
      const lCanvas = el.querySelector('.layer-canvas');
      const imgEl   = el.querySelector('.layer-img');
      const src = (lCanvas && lCanvas.style.display !== 'none') ? lCanvas : imgEl;
      if (!src) continue;

      const cx = (layer.x + layer.w / 2) * lScaleX;
      const cy = (layer.y + layer.h / 2) * lScaleY;
      const dW = layer.w * lScaleX;
      const dH = layer.h * lScaleY;

      try {
        avCtx.save();
        if (!fillBackground && layer.raw) {
          // Transparent mode: JPG has white background — convert only this layer's
          // white pixels to alpha before compositing (raw format artifact, not content)
          const tmp = document.createElement('canvas');
          tmp.width  = Math.max(1, Math.round(dW));
          tmp.height = Math.max(1, Math.round(dH));
          const tCtx = tmp.getContext('2d');
          tCtx.fillStyle = '#ffffff';
          tCtx.fillRect(0, 0, tmp.width, tmp.height);
          tCtx.drawImage(src, 0, 0, tmp.width, tmp.height);
          const id = tCtx.getImageData(0, 0, tmp.width, tmp.height);
          const px = id.data;
          for (let i = 0; i < px.length; i += 4) {
            if (px[i] > 220 && px[i+1] > 220 && px[i+2] > 220) px[i+3] = 0;
          }
          tCtx.putImageData(id, 0, 0);
          avCtx.globalCompositeOperation = 'source-over';
          avCtx.translate(cx, cy);
          avCtx.rotate(layer.rot * Math.PI / 180);
          avCtx.drawImage(tmp, -dW / 2, -dH / 2, dW, dH);
        } else {
          avCtx.globalCompositeOperation = layer.raw ? 'multiply' : 'source-over';
          avCtx.translate(cx, cy);
          avCtx.rotate(layer.rot * Math.PI / 180);
          avCtx.drawImage(src, -dW / 2, -dH / 2, dW, dH);
        }
        avCtx.restore();
      } catch (_) { avCtx.restore(); }
    }

    // Foreground pen drawing
    avCtx.globalCompositeOperation = 'source-over';
    avCtx.drawImage(drawCanvas, 0, 0, avW_px, avH_px);

    return { avCanvas, avLeft, avTop, avW_px, avH_px };
  }

  /* captureAvatarPortrait → 1024×1024 canvas with BG_COLOR + background drawing */
  function captureAvatarPortrait() {
    const result = buildAvatarCanvas(true);
    if (!result) {
      const fb = document.createElement('canvas');
      fb.width = BG_SIZE; fb.height = BG_SIZE;
      return fb;
    }
    const { avCanvas, avLeft, avTop, avW_px, avH_px } = result;
    const canvas = document.createElement('canvas');
    canvas.width = BG_SIZE; canvas.height = BG_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, BG_SIZE, BG_SIZE);
    ctx.drawImage(bgCanvas, 0, 0, BG_SIZE, BG_SIZE);
    ctx.drawImage(avCanvas, Math.round(avLeft), Math.round(avTop), avW_px, avH_px);
    return canvas;
  }

  /* captureAvatarTransparentPNG → avCanvas-sized transparent PNG for AR overlay */
  function captureAvatarTransparentPNG() {
    const result = buildAvatarCanvas(false);
    return result ? result.avCanvas : document.createElement('canvas');
  }

  /* ════════════════════════════════════ Crop modal
   *
   * Canvas is sized to the actual viewport on open (double-RAF for layout).
   * Pan: direct CSS pixel offset (canvas = viewport, no scaling needed).
   * Confirm: scales the viewport view down to STAGE_W × STAGE_H output.
   */

  function openCropModal(sourceCanvas) {
    cropSourceCanvas = sourceCanvas;
    cropX = 0; cropY = 0;
    const modal = document.getElementById('crop-modal');
    modal.removeAttribute('aria-hidden');
    modal.classList.add('open');

    /* Double-RAF: ensures flex layout has resolved before measuring viewport */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const vp     = document.getElementById('crop-viewport');
      const canvas = document.getElementById('crop-canvas');
      const vw = vp.clientWidth  || 400;
      const vh = vp.clientHeight || 500;
      canvas.width  = vw;
      canvas.height = vh;
      /* Frame is 3:4 (matches 72×96 profile thumb).
       * Constrain to fit inside viewport with 10px padding on each side. */
      const CROP_AR = 3 / 4;
      const maxFW = vw - 20;
      const fH = Math.min(Math.round(vh * 0.82), Math.round(maxFW / CROP_AR));
      const fW = Math.round(fH * CROP_AR);
      /* "Fill" the frame so portrait bleeds slightly — user pans to adjust crop */
      cropScale = Math.max(fW / sourceCanvas.width, fH / sourceCanvas.height);
      updateCropPreview();
    }));
  }

  function closeCropModal() {
    const modal = document.getElementById('crop-modal');
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    cropSourceCanvas = null;
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * updateCropPreview — social-media-style fixed-frame crop UI
   *
   * Layout:  dark background  →  portrait (pans/zooms)  →  dark overlay on
   * four sides outside the 3:4 frame  →  frame border  →  corner brackets
   * → rule-of-thirds guide lines.  The frame never moves; the image moves.
   * ───────────────────────────────────────────────────────────────────────── */
  function updateCropPreview() {
    const canvas = document.getElementById('crop-canvas');
    if (!canvas || !cropSourceCanvas) return;
    const ctx = canvas.getContext('2d');
    const VW = canvas.width, VH = canvas.height;

    /* Fixed 3:4 frame centred in viewport — constrained to fit width */
    const CROP_AR = 3 / 4;
    const maxFW = VW - 20; // 10px padding each side
    const fH = Math.min(Math.round(VH * 0.82), Math.round(maxFW / CROP_AR));
    const fW = Math.round(fH * CROP_AR);
    const fX = Math.round((VW - fW) / 2);
    const fY = Math.round((VH - fH) / 2);

    /* Portrait display rect (image pans/zooms behind the fixed frame) */
    const displayW = cropSourceCanvas.width  * cropScale;
    const displayH = cropSourceCanvas.height * cropScale;
    const imgX = (VW - displayW) / 2 + cropX;
    const imgY = (VH - displayH) / 2 + cropY;

    /* 1 — Dark background */
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, VW, VH);

    /* 2 — Portrait (BG_COLOR fill for transparent edges, then image) */
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(imgX, imgY, displayW, displayH);
    ctx.drawImage(cropSourceCanvas, imgX, imgY, displayW, displayH);

    /* 3 — Dark scrim: four rectangles outside the crop frame */
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.fillRect(0,       0,        VW,           fY);              // top band
    ctx.fillRect(0,       fY + fH,  VW,           VH - fY - fH);   // bottom band
    ctx.fillRect(0,       fY,       fX,            fH);              // left band
    ctx.fillRect(fX + fW, fY,       VW - fX - fW,  fH);             // right band

    /* 4 — Frame border (thin white outline) */
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(fX + 0.75, fY + 0.75, fW - 1.5, fH - 1.5);

    /* 5 — Corner L-brackets */
    const C = 18; // bracket arm length (px)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'square';
    [
      [[fX,       fY + C],   [fX,      fY],      [fX + C,  fY]      ],  // top-left
      [[fX+fW-C,  fY],       [fX + fW, fY],      [fX + fW, fY + C]  ],  // top-right
      [[fX,       fY+fH-C],  [fX,      fY + fH], [fX + C,  fY + fH] ],  // bottom-left
      [[fX+fW-C,  fY + fH],  [fX + fW, fY + fH], [fX + fW, fY+fH-C]],  // bottom-right
    ].forEach(pts => {
      ctx.beginPath();
      ctx.moveTo(...pts[0]);
      ctx.lineTo(...pts[1]);
      ctx.lineTo(...pts[2]);
      ctx.stroke();
    });

    /* 6 — Rule-of-thirds guide (very subtle) */
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth   = 0.5;
    ctx.beginPath();
    ctx.moveTo(fX + fW / 3,      fY); ctx.lineTo(fX + fW / 3,      fY + fH);
    ctx.moveTo(fX + 2 * fW / 3,  fY); ctx.lineTo(fX + 2 * fW / 3,  fY + fH);
    ctx.moveTo(fX, fY + fH / 3);      ctx.lineTo(fX + fW, fY + fH / 3);
    ctx.moveTo(fX, fY + 2 * fH / 3);  ctx.lineTo(fX + fW, fY + 2 * fH / 3);
    ctx.stroke();
  }

  function confirmCrop() {
    const viewCanvas = document.getElementById('crop-canvas');
    if (!viewCanvas || !cropSourceCanvas) return;

    const VW = viewCanvas.width, VH = viewCanvas.height;

    /* Recompute the same frame geometry as updateCropPreview */
    const CROP_AR = 3 / 4;
    const maxFW = VW - 20;
    const fH = Math.min(Math.round(VH * 0.82), Math.round(maxFW / CROP_AR));
    const fW = Math.round(fH * CROP_AR);
    const fX = Math.round((VW - fW) / 2);
    const fY = Math.round((VH - fH) / 2);

    /* Current portrait display position */
    const displayW = cropSourceCanvas.width  * cropScale;
    const displayH = cropSourceCanvas.height * cropScale;
    const imgX = (VW - displayW) / 2 + cropX;
    const imgY = (VH - displayH) / 2 + cropY;

    /* Map the frame window back to source canvas coordinates */
    const srcX = (fX - imgX) / cropScale;
    const srcY = (fY - imgY) / cropScale;
    const srcW = fW / cropScale;
    const srcH = fH / cropScale;

    /* Output at 2× frame size for sharpness (keeps 3:4 ratio) */
    const outW = fW * 2;
    const outH = fH * 2;
    const output = document.createElement('canvas');
    output.width = outW; output.height = outH;
    const ctx = output.getContext('2d');
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, outW, outH);
    if (srcW > 0 && srcH > 0) {
      ctx.drawImage(cropSourceCanvas, srcX, srcY, srcW, srcH, 0, 0, outW, outH);
    }

    /* Identity watermark */
    if (selectedColour && selectedShape) {
      const theme  = App.COLOUR_THEMES[selectedColour];
      const hexCol = theme ? theme[0] : penColor;
      ctx.save();
      ctx.font         = 'italic 11px "IM Fell English", serif';
      ctx.fillStyle    = hexCol + '99';
      ctx.textAlign    = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${selectedColour} ${selectedShape}`, outW - 8, outH - 7);
      ctx.restore();
    }

    App.saveAvatarPortrait(output.toDataURL('image/png'));

    // Also save a transparent-background version for AR overlay
    try {
      const transparentCanvas = captureAvatarTransparentPNG();
      if (transparentCanvas && transparentCanvas.width > 0) {
        App.saveAvatarPortraitTransparent(transparentCanvas.toDataURL('image/png'));
      }
    } catch (e) { console.warn('Transparent PNG export failed:', e); }

    App.saveAvatarIdentity(selectedColour, selectedShape);
    saveState();
    closeCropModal();

    const btn = document.getElementById('save-portrait-btn');
    if (btn) {
      btn.textContent = '✓ Portrait saved';
      btn.classList.add('saved');
      btn.disabled = false;
      setTimeout(() => { btn.textContent = 'Save portrait'; btn.classList.remove('saved'); }, 2200);
    }
  }

  const cropViewport = document.getElementById('crop-viewport');
  cropViewport?.addEventListener('pointerdown', e => {
    cropDragStart = { x: e.clientX, y: e.clientY, ox: cropX, oy: cropY };
    cropViewport.setPointerCapture(e.pointerId);
  });
  cropViewport?.addEventListener('pointermove', e => {
    if (!cropDragStart) return;
    cropX = cropDragStart.ox + (e.clientX - cropDragStart.x);
    cropY = cropDragStart.oy + (e.clientY - cropDragStart.y);
    updateCropPreview();
  });
  cropViewport?.addEventListener('pointerup',     () => { cropDragStart = null; });
  cropViewport?.addEventListener('pointercancel', () => { cropDragStart = null; });

  document.getElementById('crop-zoom-in')?.addEventListener('click',  () => { cropScale = Math.min(cropScale * 1.3, 10);  updateCropPreview(); });
  document.getElementById('crop-zoom-out')?.addEventListener('click', () => { cropScale = Math.max(cropScale / 1.3, 0.15); updateCropPreview(); });
  document.getElementById('crop-confirm')?.addEventListener('click', confirmCrop);
  document.getElementById('crop-cancel')?.addEventListener('click',  closeCropModal);

  /* ════════════════════════════════════ Save portrait button */

  const savePortraitBtn = document.getElementById('save-portrait-btn');
  savePortraitBtn?.addEventListener('click', () => {
    savePortraitBtn.textContent = 'Capturing…';
    savePortraitBtn.disabled = true;
    setTimeout(() => {
      try {
        const portraitCanvas = captureAvatarPortrait();
        savePortraitBtn.disabled = false;
        savePortraitBtn.textContent = 'Save portrait';
        openCropModal(portraitCanvas);
      } catch (err) {
        savePortraitBtn.textContent = 'Save portrait';
        savePortraitBtn.disabled = false;
        console.error('Portrait capture failed:', err);
      }
    }, 80);
  });

  /* ════════════════════════════════════ Persistence */

  function saveState() {
    App.saveAvatarState({
      bodyType,
      identity:   { colour: selectedColour, shape: selectedShape },
      layers:     Object.values(layers).map(l => ({ ...l })),
      drawing:    drawCanvas.toDataURL(),
      background: bgCanvas.toDataURL(),
    });
  }

  function restoreDrawing(dataURL) {
    const img = new Image();
    img.onload = () => dCtx.drawImage(img, 0, 0);
    img.src = dataURL;
  }

  function restoreBackground(dataURL) {
    const img = new Image();
    img.onload = () => {
      /* Centre old portrait-size saves (300×440) inside the new square canvas.
       * New 440×440 saves draw at offX=0, offY=0 — no change. */
      const offX = Math.max(0, Math.round((BG_SIZE - img.width)  / 2));
      const offY = Math.max(0, Math.round((BG_SIZE - img.height) / 2));
      bgCtx.drawImage(img, offX, offY);
    };
    img.src = dataURL;
  }

  /* ════════════════════════════════════ Init */
  buildBodyTypeSelector();
  buildIdentityPanel();
  applyColourTheme(selectedColour);
  Object.values(layers).forEach(l => renderLayer(l));
  renderAssetTray('body');
  updateCatTabs();
  setTool('select');
  const firstCat = Object.keys(layers)[0];
  if (firstCat) selectLayer(firstCat);

  /* Size bgCanvas + fit stage after layout settles, then seed history */
  setTimeout(() => {
    fitBgCanvas();
    fitStageToWrap();
    recordState();
    updateHistoryButtons();
  }, 100);

})();
