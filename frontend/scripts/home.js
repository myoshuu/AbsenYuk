'use strict';

/* ─── Hamburger / Mobile Drawer ────────────────────────── */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('navDrawer');
  const overlay   = document.getElementById('navOverlay');
  if (!hamburger || !drawer || !overlay) return;

  let isOpen = false;

  function open() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => isOpen ? close() : open());
  overlay.addEventListener('click', close);
  document.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });
})();

/* ─── Hero Image Fallback ───────────────────────────────── */
(function initImageFallback() {
  const img = document.getElementById('heroImg');
  if (!img) return;

  img.addEventListener('error', () => {
    const wrap = img.parentNode;
    const ph = document.createElement('div');
    ph.className = 'hero-img-placeholder';
    ph.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none"
           viewBox="0 0 24 24" stroke="rgba(255,255,255,0.6)" stroke-width="1.3">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0
             002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
      <span>Letakkan gambar laptop di<br><strong>images/hero.jpg</strong></span>`;
    wrap.replaceChild(ph, img);
  });
})();