(function () {
  'use strict';

  /* -- Page veil (dark overlay that fades in/out between pages) ------------ */
  var veil = document.createElement('div');
  veil.id = 'page-veil';
  veil.style.cssText = [
    'position:fixed', 'inset:0', 'background:#060A0E',
    'opacity:1', 'pointer-events:none', 'z-index:9999',
  ].join(';');
  document.body.appendChild(veil);

  // Page entrance: veil fades away after first paint
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      veil.style.transition = 'opacity 0.42s ease';
      veil.style.opacity = '0';
    });
  });

  /* -- Intercept internal link clicks -------------------------------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || /^(https?:\/\/|#|mailto:|tel:)/.test(href)) return;

    e.preventDefault();

    // Notify the page so it can run its own exit animation first
    document.dispatchEvent(new CustomEvent('page-exit', {
      detail: { href: href, trigger: a },
    }));

    // Nav delay: default 360ms; override with data-exit-delay attribute
    var navDelay = parseInt(a.dataset.exitDelay || '360', 10);
    // Veil starts 340ms before navigation (window for page-specific exit animation)
    var veilStart = Math.max(0, navDelay - 340);

    setTimeout(function () {
      veil.style.transition = 'opacity 0.36s ease';
      veil.style.opacity    = '1';
      veil.style.pointerEvents = 'auto';
    }, veilStart);

    setTimeout(function () {
      window.location.href = href;
    }, navDelay);
  });
}());
