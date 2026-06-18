(function () {
  'use strict';

  /* Page sequence — left swipe advances, right swipe retreats */
  var PAGES = ['index.html', 'gesture.html', 'ar.html'];

  function currentPage() {
    var p = location.pathname.split('/').pop();
    return (!p || p === '/') ? 'index.html' : p;
  }

  function navigate(href) {
    /* Reuse transitions.js by clicking the matching nav dot,
       so the page-veil animation runs exactly as it does on tap. */
    var dot = document.querySelector('.nav-dot[href="' + href + '"]');
    if (dot) {
      dot.click();
    } else {
      window.location.href = href;
    }
  }

  var startX = 0, startY = 0;
  var THRESHOLD = 55;   /* min horizontal px to count as a swipe */
  var RATIO     = 1.5;  /* horizontal must be this many times the vertical */

  document.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    /* Allow drawing pages (draw.html) to lock out navigation */
    if (window._swipeNavLocked) return;

    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;

    if (Math.abs(dx) < THRESHOLD) return;
    if (Math.abs(dx) < Math.abs(dy) * RATIO) return;

    var idx = PAGES.indexOf(currentPage());
    if (idx === -1) return;

    if (dx < 0 && idx < PAGES.length - 1) {
      navigate(PAGES[idx + 1]);   /* left swipe → next */
    } else if (dx > 0 && idx > 0) {
      navigate(PAGES[idx - 1]);   /* right swipe → prev */
    }
  }, { passive: true });

}());
