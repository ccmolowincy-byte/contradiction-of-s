(function () {
  'use strict';

  var KEY = 'cosGuidedFlow';
  var FLOW_TTL_MS = 45 * 60 * 1000;
  var INACTIVITY_MS = 90 * 1000;

  function readRaw() {
    try {
      return sessionStorage.getItem(KEY);
    } catch (_) {
      return null;
    }
  }

  function writeRaw(value) {
    try {
      sessionStorage.setItem(KEY, value);
    } catch (_) {}
  }

  function removeRaw() {
    try {
      sessionStorage.removeItem(KEY);
    } catch (_) {}
  }

  function set(flow) {
    if (!/^(garden|swim)$/.test(flow || '')) return;
    writeRaw(JSON.stringify({ flow: flow, startedAt: Date.now() }));
  }

  function clear() {
    removeRaw();
  }

  function get(expectedFlow) {
    var state = null;
    try {
      state = JSON.parse(readRaw() || 'null');
    } catch (_) {
      clear();
      return null;
    }

    if (!state || !/^(garden|swim)$/.test(state.flow || '')) {
      clear();
      return null;
    }

    if (Date.now() - (state.startedAt || 0) > FLOW_TTL_MS) {
      clear();
      return null;
    }

    if (expectedFlow && state.flow !== expectedFlow) return null;
    return state;
  }

  function start(flow, href) {
    set(flow);
    window.location.href = href;
  }

  function welcomeHref() {
    var path = window.location.pathname.replace(/\\/g, '/');
    if (/\/swim(?:\/index\.html|\/)?$/.test(path)) return '../index.html';
    return 'index.html';
  }

  function startInactivityReturn(expectedFlow, options) {
    options = options || {};
    if (!get(expectedFlow)) return null;

    var timeout = Number(options.inactivityMs) || INACTIVITY_MS;
    var href = options.welcomeHref || welcomeHref();
    var timer = null;
    var active = true;
    var events = [
      'pointerdown',
      'pointermove',
      'touchstart',
      'touchmove',
      'keydown',
      'wheel',
      'mousedown'
    ];

    function redirect() {
      if (!active || !get(expectedFlow)) return;
      clear();
      window.location.href = href;
    }

    function reset() {
      if (!active) return;
      clearTimeout(timer);
      timer = setTimeout(redirect, timeout);
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') clearTimeout(timer);
      else reset();
    }

    events.forEach(function (eventName) {
      window.addEventListener(eventName, reset, { passive: true });
    });
    document.addEventListener('visibilitychange', onVisibilityChange);
    reset();

    return {
      stop: function () {
        active = false;
        clearTimeout(timer);
        events.forEach(function (eventName) {
          window.removeEventListener(eventName, reset);
        });
        document.removeEventListener('visibilitychange', onVisibilityChange);
      },
      reset: reset
    };
  }

  window.COS_GUIDED_FLOW = {
    key: KEY,
    inactivityMs: INACTIVITY_MS,
    set: set,
    get: get,
    clear: clear,
    start: start,
    startInactivityReturn: startInactivityReturn,
    welcomeHref: welcomeHref
  };
})();
