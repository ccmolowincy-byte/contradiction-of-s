/* ── garden-background.js — pluggable backdrops behind the community garden ────
   The garden (archive-cloud.js) renders on a transparent canvas. This module owns
   whatever sits BEHIND it:
     • camera   — live device camera (the AR experience), where a camera exists
     - aurora: transparent HTML layer; Three.js shows the panorama skysphere
     - void: deep animated darkness (max contrast for the traces)
     • image/video — DROP-IN SLOTS: Wincy can place her own files at
         assets/garden-bg/custom.jpg  and  assets/garden-bg/custom.mp4
       and those options appear automatically.

   Visitors can switch backgrounds via the picker; the choice persists.
   Exposes window.COS_GARDEN_BG.
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var STORE_KEY = 'gardenBg';
  var D = window.COS_DEVICE || {};
  var reduceMotion = !!D.reducedMotion;

  var hostEl = null;        // the #garden-bg container
  var teardown = null;      // cleanup for the active background
  var available = [];       // backgrounds detected as usable on this device
  var currentId = null;

  // ── Background definitions ─────────────────────────────────────────────────
  // Each: { id, label, needs?: 'camera'|'image'|'video', apply(host) -> teardownFn }
  var BACKGROUNDS = [
    { id: 'aurora',    label: 'Aurora',    apply: applySkyAurora },
    { id: 'void',      label: 'Void',      apply: applyVoid },
    { id: 'camera',    label: 'Camera',    needs: 'camera', apply: applyCamera }
  ];

  // ── Public API ─────────────────────────────────────────────────────────────
  function init(host, opts) {
    hostEl = host;
    opts = opts || {};
    return detectAvailable().then(function (list) {
      available = list;
      // Choose: saved → opts.preferred → first available.
      var saved = safeGet(STORE_KEY);
      var pick = byId(saved) || byId(opts.preferred) || available[0];
      setBackground(pick ? pick.id : 'void', /*persist*/ false);
      if (opts.picker) buildPicker(opts.picker);
      return available;
    });
  }

  function setBackground(id, persist) {
    var bg = byId(id) || available[0];
    if (!bg) return;
    if (teardown) { try { teardown(); } catch (e) {} teardown = null; }
    currentId = bg.id;
    hostEl.innerHTML = '';
    resetHost(hostEl);
    teardown = bg.apply(hostEl) || null;
    syncGardenSky(bg.id === 'aurora');
    syncGardenTheme('aurora');
    if (persist !== false) safeSet(STORE_KEY, bg.id);
    // reflect active state in any picker
    var picker = document.getElementById('garden-bg-picker');
    if (picker) Array.prototype.forEach.call(picker.children, function (b) {
      b.classList.toggle('is-active', b.dataset.bg === bg.id);
    });
  }

  // ── Availability detection (camera + drop-in slots) ────────────────────────
  function detectAvailable() {
    var checks = BACKGROUNDS.map(function (bg) {
      if (!bg.needs) return Promise.resolve(bg);
      if (bg.needs === 'camera') {
        var has = (window.COS_DEVICE && COS_DEVICE.hasCamera)
          ? COS_DEVICE.hasCamera() : Promise.resolve(false);
        return has.then(function (ok) { return ok ? bg : null; });
      }
      if (bg.needs === 'image') return probeUrl(bg.src, 'image').then(function (ok) { return ok ? bg : null; });
      if (bg.needs === 'video') return probeUrl(bg.src, 'video').then(function (ok) { return ok ? bg : null; });
      return Promise.resolve(null);
    });
    return Promise.all(checks).then(function (r) { return r.filter(Boolean); });
  }

  function probeUrl(url, kind) {
    return new Promise(function (resolve) {
      if (kind === 'image') {
        var img = new Image();
        img.onload = function () { resolve(true); };
        img.onerror = function () { resolve(false); };
        img.src = url + '?probe=' + Date.now();
      } else {
        // HEAD-style probe via fetch; fall back to false on any error.
        try {
          fetch(url, { method: 'HEAD' }).then(function (r) { resolve(r.ok); }).catch(function () { resolve(false); });
        } catch (e) { resolve(false); }
      }
    });
  }

  // ── Picker UI (visitor-switchable) ─────────────────────────────────────────
  function buildPicker(container) {
    injectPickerStyles();
    var wrap = document.createElement('div');
    wrap.id = 'garden-bg-picker';
    wrap.className = 'garden-bg-picker';
    wrap.setAttribute('aria-label', 'Choose a backdrop');
    available.forEach(function (bg) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'garden-bg-swatch';
      b.dataset.bg = bg.id;
      b.textContent = bg.label;
      b.addEventListener('click', function () { setBackground(bg.id, true); });
      wrap.appendChild(b);
    });
    container.appendChild(wrap);
    // mark current active
    var cur = currentId || safeGet(STORE_KEY);
    Array.prototype.forEach.call(wrap.children, function (b) {
      b.classList.toggle('is-active', b.dataset.bg === cur);
    });
  }

  // ── Background implementations ─────────────────────────────────────────────
  function applySkyAurora(host) {
    host.style.background = 'transparent';
    return null;
  }

  function applyVoid(host) {
    return applyDarkAurora(host);
  }

  function applyImage(host) {
    var bg = byId('image');
    host.style.background = '#0c0807';
    host.style.backgroundImage = "url('" + bg.src + "')";
    host.style.backgroundSize = 'cover';
    host.style.backgroundPosition = 'center';
    return function () { host.style.backgroundImage = ''; };
  }

  function applyVideo(host) {
    var bg = byId('video');
    var v = document.createElement('video');
    v.src = bg.src; v.autoplay = true; v.loop = true; v.muted = true;
    v.playsInline = true; v.setAttribute('playsinline', '');
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    host.style.background = '#0c0807';
    host.appendChild(v);
    v.play().catch(function () {});
    return function () { try { v.pause(); } catch (e) {} v.remove(); };
  }

  function applyCamera(host) {
    var v = document.createElement('video');
    v.autoplay = true; v.muted = true; v.playsInline = true; v.setAttribute('playsinline', '');
    v.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    host.style.background = '#060403';
    host.appendChild(v);
    var stream = null;
    var facing = (D.isDesktop ? 'user' : 'environment');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Lower capture on low-power/tablet to save the pose/render budget.
      var w = D.lowPower || D.isTablet ? 640 : 1280;
      var h = D.lowPower || D.isTablet ? 480 : 720;
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: w }, height: { ideal: h } },
        audio: false
      }).then(function (s) { stream = s; v.srcObject = s; v.play().catch(function () {}); })
        .catch(function () { /* fall back: leave dark backdrop */ });
    }
    return function () {
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
      v.remove();
    };
  }

  // Animated procedural backdrop: soft drifting light through deep ground.
  function applyDarkAurora(host) {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    host.style.background = '#030202';
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, (D.renderScale || 1.5));
    var blobs = [];
    var PALETTE = ['rgba(58,9,12,', 'rgba(38,8,11,', 'rgba(76,46,22,', 'rgba(20,18,34,'];

    function size() {
      canvas.width = Math.max(1, Math.round(host.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(host.clientHeight * dpr));
    }
    function seed() {
      blobs = [];
      var n = 5;
      for (var i = 0; i < n; i++) {
        blobs.push({
          x: (0.15 + 0.7 * (i / n)) , y: 0.3 + 0.4 * pseudo(i),
          r: 0.35 + 0.25 * pseudo(i + 9),
          c: PALETTE[i % PALETTE.length],
          // motion phase varies by index (no Math.random — deterministic)
          px: i * 1.7, py: i * 2.3, sx: 0.00018 + i * 0.00004, sy: 0.00013 + i * 0.00003
        });
      }
    }
    function pseudo(k) { var s = Math.sin(k * 12.9898) * 43758.5453; return s - Math.floor(s); }

    var raf = null, t0 = null;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var t = ts - t0;
      var W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      // deep ground gradient
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#070303'); g.addColorStop(0.58, '#030202'); g.addColorStop(1, '#010101');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'screen';
      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];
        var cx = (b.x + 0.12 * Math.sin(t * b.sx + b.px)) * W;
        var cy = (b.y + 0.10 * Math.cos(t * b.sy + b.py)) * H;
        var rad = b.r * Math.min(W, H);
        var rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        rg.addColorStop(0, b.c + '0.24)');
        rg.addColorStop(0.5, b.c + '0.07)');
        rg.addColorStop(1, b.c + '0)');
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.globalCompositeOperation = 'source-over';
      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }

    function onResize() { size(); if (reduceMotion) { t0 = null; frame(0); } }
    size(); seed();
    if (reduceMotion) { frame(0); }                 // single static composition
    else { raf = requestAnimationFrame(frame); }
    window.addEventListener('resize', onResize);
    return function () {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      canvas.remove();
    };
  }

  // ── helpers ────────────────────────────────────────────────────────────────
  function resetHost(host) {
    host.style.background = '';
    host.style.backgroundImage = '';
    host.style.backgroundSize = '';
    host.style.backgroundPosition = '';
  }

  function syncGardenSky(on) {
    var garden = window.COS_GARDEN;
    if (garden && typeof garden.setSky === 'function') garden.setSky(!!on);
  }
  function syncGardenTheme(id) {
    var garden = window.COS_GARDEN;
    if (garden && typeof garden.setWorldTheme === 'function') garden.setWorldTheme(id);
  }

  function syncCurrentSky() {
    syncGardenSky(currentId === 'aurora');
    syncGardenTheme('aurora');
  }
  function byId(id) { for (var i = 0; i < available.length; i++) if (available[i].id === id) return available[i]; return null; }
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function injectPickerStyles() {
    if (document.getElementById('garden-bg-picker-style')) return;
    var css = [
      '.garden-bg-picker{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;}',
      '.garden-bg-swatch{font-family:"Space Grotesk",system-ui,sans-serif;font-size:10px;',
      '  letter-spacing:.12em;text-transform:uppercase;color:rgba(240,234,224,.7);',
      '  background:rgba(20,14,12,.45);border:1px solid rgba(240,234,224,.22);border-radius:20px;',
      '  padding:7px 14px;cursor:pointer;-webkit-tap-highlight-color:transparent;',
      '  -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:all .15s;}',
      '.garden-bg-swatch:hover{color:#fff;border-color:rgba(240,234,224,.5);}',
      '.garden-bg-swatch.is-active{color:#1a0e0a;background:rgba(240,234,224,.92);border-color:transparent;}'
    ].join('');
    var s = document.createElement('style');
    s.id = 'garden-bg-picker-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  window.COS_GARDEN_BG = {
    init: init,
    setBackground: setBackground,
    syncSky: syncCurrentSky,
    current: function () { return currentId; },
    list: function () { return available.slice(); }
  };
})();
