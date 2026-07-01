/* ── device.js — capability detection for device-aware behaviour ──────────────
   Loaded early (before page scripts) so any page can branch on window.COS_DEVICE.

   Exhibition targets this drives:
     • Cheap Android tablet (Unisoc T7200, 6GB slow RAM) → lowPower path
     • Visitors' phones (iOS + Android) → seamless in-browser camera
     • iPad Pro → full experience
     • Desktop/laptop → skip auto-camera; lead with forum + garden

   Pure, dependency-free, no side effects beyond setting the global + <html> flags.
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var ua = navigator.userAgent || '';
  var nav = navigator;

  // iPadOS 13+ reports as desktop Safari ("MacIntel" + touch points), so detect it explicitly.
  var isIPadOS = /Macintosh/.test(ua) && (nav.maxTouchPoints || 0) > 1;
  var isIOS     = /iP(hone|od|ad)/.test(ua) || isIPadOS;
  var isAndroid = /Android/.test(ua);

  // Pointer/touch capability (a touch-screen laptop reports touch too — see below).
  var coarsePointer = matchMediaSafe('(pointer: coarse)');
  var finePointer   = matchMediaSafe('(pointer: fine)');
  var canHover      = matchMediaSafe('(hover: hover)');
  var anyCoarse     = matchMediaSafe('(any-pointer: coarse)');
  var hasTouch      = (nav.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  var isTouch       = coarsePointer || (hasTouch && anyCoarse);

  // Desktop vs the camera experience:
  // The body-tracking camera flow is meant ONLY for mobile-OS devices — visitors'
  // phones (iOS/Android), the gallery Android tablet (Android), Wincy's iPad (iOS).
  // EVERY desktop/laptop OS (Windows/Mac/Linux) must be treated as desktop so it is
  // never force-routed into the camera and trapped — INCLUDING touch-screen laptops,
  // which report touch but are not the exhibition camera devices. So we key desktop
  // detection on the OS, not on touch capability (the previous bug: a touch-capable
  // PC was misread as a tablet and sent to the camera page with no way back).
  var isMobileOS = isIOS || isAndroid || /Mobile|Windows Phone/.test(ua);
  var isDesktop  = !isMobileOS;

  // Tablet/phone only apply to actual mobile-OS devices (never to a desktop).
  var minSide = Math.min(window.screen.width, window.screen.height);
  var isTablet = !isDesktop && (isIPadOS || minSide >= 600);
  var isPhone  = !isDesktop && !isTablet;

  // Low-power heuristic for the cheap tablet / weak phones. deviceMemory is only
  // exposed on Chromium (covers the Android tablet); fall back to core count.
  var mem   = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null;
  var cores = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null;
  var lowPower = (mem !== null && mem <= 4) || (cores !== null && cores <= 4);

  var reducedMotion = matchMediaSafe('(prefers-reduced-motion: reduce)');

  // Cap devicePixelRatio for canvas/WebGL on weak GPUs to cut fill-rate cost.
  var rawDpr   = window.devicePixelRatio || 1;
  var renderScale = lowPower ? Math.min(rawDpr, 1.5) : Math.min(rawDpr, 2);

  function matchMediaSafe(q) {
    try { return window.matchMedia && window.matchMedia(q).matches; } catch (e) { return false; }
  }

  var D = {
    ua: ua,
    isIOS: isIOS,
    isAndroid: isAndroid,
    isIPadOS: isIPadOS,
    isTouch: isTouch,
    isDesktop: isDesktop,
    isTablet: isTablet,
    isPhone: isPhone,
    lowPower: lowPower,
    deviceMemory: mem,
    cores: cores,
    reducedMotion: reducedMotion,
    rawDpr: rawDpr,
    renderScale: renderScale,

    // Should this device auto-start the camera experience?
    // Phones + tablets: yes (seamless). Desktop/laptop: no (won't work as intended).
    shouldAutoCamera: function () { return isTouch && !isDesktop; },

    // Async camera availability probe (does not request permission).
    hasCamera: function () {
      if (!nav.mediaDevices || !nav.mediaDevices.enumerateDevices) {
        return Promise.resolve(false);
      }
      return nav.mediaDevices.enumerateDevices()
        .then(function (list) { return list.some(function (d) { return d.kind === 'videoinput'; }); })
        .catch(function () { return false; });
    }
  };

  // Reflect onto <html> so CSS can target devices without JS in the page.
  try {
    var root = document.documentElement;
    if (D.isDesktop)      root.classList.add('is-desktop');
    if (D.isTouch)        root.classList.add('is-touch');
    if (D.isTablet)       root.classList.add('is-tablet');
    if (D.isPhone)        root.classList.add('is-phone');
    if (D.isIOS)          root.classList.add('is-ios');
    if (D.isAndroid)      root.classList.add('is-android');
    if (D.lowPower)       root.classList.add('is-low-power');
    if (D.reducedMotion)  root.classList.add('reduced-motion');
  } catch (e) { /* document not ready — harmless */ }

  window.COS_DEVICE = D;
})();
