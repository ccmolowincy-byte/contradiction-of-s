/* nav.js - one tap-only glass navigation system.
   Desktop/laptop: translucent top bar.
   Touch devices: collapsed liquid-glass menu button with a translucent menu. */
(function () {
  'use strict';

  var DESTINATIONS = [
    { href: 'index.html',     label: 'Home',          short: 'Home' },
    { href: 'gesture.html',   label: 'Leave a Trace', short: 'Trace' },
    { href: 'garden.html',    label: 'Cosmic Garden', short: 'Garden' },
    { href: 'swim/',          label: 'Go for a Swim', short: 'Swim' },
    { href: 'community.html', label: 'Community',     short: 'Forum' },
    { href: 'character.html', label: 'Character',     short: 'Avatar' }
  ];

  var D = window.COS_DEVICE || {};
  var isDesktop = !!D.isDesktop;

  function currentHref() {
    var path = location.pathname.replace(/\\/g, '/');
    if (/\/swim\/?$/.test(path) || /\/swim\/index\.html$/.test(path)) return 'swim/';
    return path.split('/').pop() || 'index.html';
  }

  function build() {
    document.querySelectorAll('.bottom-nav, #cos-nav').forEach(function (n) { n.remove(); });
    document.documentElement.classList.remove('has-cos-nav-top', 'has-cos-nav-bottom');
    injectStyles();
    if (isDesktop) buildTopBar();
    else buildMobileMenu();
  }

  function buildItems(mode) {
    var here = currentHref();
    var list = document.createElement('div');
    list.className = 'cos-nav-list';

    DESTINATIONS.forEach(function (d) {
      var item = document.createElement('a');
      item.className = 'cos-nav-item';
      item.href = d.href;
      item.setAttribute('aria-label', d.label);

      var label = document.createElement('span');
      label.className = 'cos-nav-label';
      label.textContent = mode === 'mobile' ? d.short : d.label;
      item.appendChild(label);

      if (d.href === here) {
        item.classList.add('is-active');
        item.setAttribute('aria-current', 'page');
      }
      list.appendChild(item);
    });

    return list;
  }

  function buildTopBar() {
    var nav = document.createElement('nav');
    nav.id = 'cos-nav';
    nav.className = 'cos-nav cos-nav--top';
    nav.setAttribute('aria-label', 'Primary');
    nav.appendChild(buildItems('desktop'));
    document.body.appendChild(nav);
    document.documentElement.classList.add('has-cos-nav-top');
  }

  function buildMobileMenu() {
    var nav = document.createElement('nav');
    var menuId = 'cos-nav-menu';
    nav.id = 'cos-nav';
    nav.className = 'cos-nav cos-nav--mobile';
    nav.setAttribute('aria-label', 'Primary');

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'cos-nav-menu-button';
    button.setAttribute('aria-label', 'Open navigation menu');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', menuId);
    button.innerHTML = '<span></span><span></span><span></span>';

    var list = buildItems('mobile');
    list.id = menuId;
    list.setAttribute('aria-hidden', 'true');

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      list.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    button.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    document.addEventListener('pointerdown', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target)) return;
      setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });

    list.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    nav.appendChild(list);
    nav.appendChild(button);
    document.body.appendChild(nav);
    document.documentElement.classList.add('has-cos-nav-bottom');
  }

  function injectStyles() {
    if (document.getElementById('cos-nav-style')) return;
    var css = [
      ':root{--cosnav-top-h:52px;--cosnav-bottom-reserve:76px;--cosnav-ink:#5C1A1A;--cosnav-active:#891818;--cosnav-line:rgba(92,26,26,.14);}',
      'html.has-cos-nav-bottom{--nav-h:var(--cosnav-bottom-reserve);}',
      '.cos-nav{position:fixed;z-index:1000;font-family:"Space Grotesk",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;}',
      '.cos-nav,.cos-nav *{box-sizing:border-box;}',
      '.cos-nav a{-webkit-tap-highlight-color:transparent;text-decoration:none;}',

      '.cos-nav--top{top:0;left:0;right:0;height:var(--cosnav-top-h);display:flex;align-items:center;justify-content:center;',
      '  padding:7px max(14px,env(safe-area-inset-left)) 7px max(14px,env(safe-area-inset-right));',
      '  background:linear-gradient(180deg,rgba(250,246,238,.70),rgba(240,234,224,.40));',
      '  border-bottom:.5px solid rgba(92,26,26,.09);box-shadow:0 10px 26px rgba(38,22,16,.05);',
      '  backdrop-filter:blur(18px) saturate(1.35);-webkit-backdrop-filter:blur(18px) saturate(1.35);}',
      '.cos-nav--top .cos-nav-list{height:38px;display:flex;align-items:center;justify-content:center;gap:3px;max-width:920px;',
      '  padding:3px;border:1px solid rgba(255,255,255,.36);border-radius:999px;',
      '  background:linear-gradient(135deg,rgba(255,255,255,.36),rgba(255,250,242,.16));',
      '  box-shadow:inset 0 1px 0 rgba(255,255,255,.56),inset 0 -1px 0 rgba(92,26,26,.05);}',
      '.cos-nav--top .cos-nav-item{height:30px;display:flex;align-items:center;justify-content:center;border-radius:999px;',
      '  padding:0 15px;color:rgba(92,26,26,.52);font-size:10px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;',
      '  white-space:nowrap;transition:background .18s ease,color .18s ease,box-shadow .18s ease;}',
      '.cos-nav--top .cos-nav-item:hover{color:var(--cosnav-ink);background:rgba(255,255,255,.28);}',
      '.cos-nav--top .cos-nav-item.is-active{color:var(--cosnav-active);background:linear-gradient(135deg,rgba(255,255,255,.50),rgba(255,238,232,.30));',
      '  box-shadow:inset 0 1px 0 rgba(255,255,255,.66),0 5px 14px rgba(92,26,26,.08);}',
      'html.has-cos-nav-top body{padding-top:var(--cosnav-top-h);}',

      '.cos-nav--mobile{right:max(14px,env(safe-area-inset-right));bottom:calc(12px + env(safe-area-inset-bottom,0px));',
      '  width:58px;height:58px;pointer-events:none;}',
      '.cos-nav-menu-button{position:absolute;right:0;bottom:0;width:58px;height:58px;border:1px solid rgba(255,255,255,.46);',
      '  border-radius:999px;background:linear-gradient(135deg,rgba(255,255,255,.42),rgba(240,234,224,.22));',
      '  box-shadow:0 16px 34px rgba(38,18,14,.20),inset 0 1px 0 rgba(255,255,255,.68),inset 0 -1px 0 rgba(92,26,26,.07);',
      '  backdrop-filter:blur(22px) saturate(1.5);-webkit-backdrop-filter:blur(22px) saturate(1.5);',
      '  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;pointer-events:auto;',
      '  transition:background .18s ease,box-shadow .18s ease,transform .18s ease;}',
      '.cos-nav-menu-button span{display:block;width:20px;height:1.5px;border-radius:999px;background:rgba(92,26,26,.68);',
      '  transition:transform .2s ease,opacity .16s ease,background .18s ease;}',
      '.cos-nav-menu-button:active{transform:scale(.97);}',
      '.cos-nav--mobile.is-open .cos-nav-menu-button{background:linear-gradient(135deg,rgba(255,255,255,.34),rgba(240,234,224,.16));}',
      '.cos-nav--mobile.is-open .cos-nav-menu-button span:nth-child(1){transform:translateY(6.5px) rotate(45deg);}',
      '.cos-nav--mobile.is-open .cos-nav-menu-button span:nth-child(2){opacity:0;}',
      '.cos-nav--mobile.is-open .cos-nav-menu-button span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}',

      '.cos-nav--mobile .cos-nav-list{position:absolute;right:66px;bottom:0;width:min(520px,calc(100vw - 96px));',
      '  display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:4px;padding:8px;border-radius:999px;',
      '  background:linear-gradient(145deg,rgba(255,255,255,.28),rgba(240,234,224,.13) 48%,rgba(255,255,255,.09));',
      '  border:1px solid rgba(255,255,255,.34);box-shadow:0 22px 46px rgba(38,18,14,.18),inset 0 1px 0 rgba(255,255,255,.46),inset 0 -1px 0 rgba(92,26,26,.05);',
      '  backdrop-filter:blur(26px) saturate(1.65);-webkit-backdrop-filter:blur(26px) saturate(1.65);',
      '  opacity:0;transform:translateX(10px) scale(.98);transform-origin:100% 50%;pointer-events:none;',
      '  transition:opacity .18s ease,transform .18s ease;}',
      '.cos-nav--mobile.is-open .cos-nav-list{opacity:1;transform:translateX(0) scale(1);pointer-events:auto;}',
      '.cos-nav--mobile .cos-nav-list::before{content:"";position:absolute;inset:1px 1px auto 1px;height:42%;border-radius:999px 999px 18px 18px;',
      '  background:linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,0));pointer-events:none;}',
      '.cos-nav--mobile .cos-nav-item{position:relative;min-width:0;height:40px;display:flex;align-items:center;justify-content:center;',
      '  padding:0 3px;border-radius:999px;color:rgba(92,26,26,.64);text-align:center;overflow:hidden;touch-action:manipulation;',
      '  background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.16);',
      '  transition:background .18s ease,color .18s ease,transform .18s ease,box-shadow .18s ease;}',
      '.cos-nav--mobile .cos-nav-label{position:relative;z-index:1;display:block;max-width:100%;font-size:clamp(7px,2vw,9.5px);',
      '  font-weight:700;letter-spacing:.035em;line-height:1;text-transform:uppercase;white-space:nowrap;}',
      '.cos-nav--mobile .cos-nav-item.is-active{color:var(--cosnav-active);background:rgba(255,255,255,.22);',
      '  border-color:rgba(255,255,255,.34);box-shadow:inset 0 1px 0 rgba(255,255,255,.48),0 7px 16px rgba(92,26,26,.08);}',
      'html.has-cos-nav-bottom body{padding-bottom:calc(var(--cosnav-bottom-reserve) + env(safe-area-inset-bottom,0px));}',
      'html.has-cos-nav-bottom .page{padding-bottom:0;}',

      '@media (max-width:340px){.cos-nav--mobile{right:8px}.cos-nav--mobile .cos-nav-list{right:64px;width:calc(100vw - 80px);grid-template-columns:repeat(6,minmax(0,1fr));gap:2px;padding:6px}.cos-nav--mobile .cos-nav-item{height:36px}.cos-nav--mobile .cos-nav-label{font-size:7px;letter-spacing:0;}}',
      '@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.cos-nav--top{background:rgba(240,234,224,.88)}.cos-nav-menu-button{background:rgba(250,246,238,.76)}.cos-nav--mobile .cos-nav-list{background:rgba(250,246,238,.72)}}'
    ].join('');
    var style = document.createElement('style');
    style.id = 'cos-nav-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();

  window.COS_NAV = {
    hide: function () {
      var n = document.getElementById('cos-nav');
      if (n) n.style.display = 'none';
    },
    show: function () {
      var n = document.getElementById('cos-nav');
      if (n) n.style.display = '';
    }
  };
})();
