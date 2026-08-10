// Shared front-end behaviors for andrewgillfillan.com
// Restrained: entrance reveals, one-time chart draw, gallery lightbox, back-to-top.

const REDUCED = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal() {
  const items = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!items.length) return;
  if (REDUCED() || !('IntersectionObserver' in window)) return;
  items.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.style.transition = 'opacity .7s cubic-bezier(.22,.61,.36,1), transform .7s cubic-bezier(.22,.61,.36,1)';
    el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms';
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.style.opacity = '1';
      e.target.style.transform = 'none';
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((el) => io.observe(el));
}

export function initChartDraw() {
  const paths = Array.from(document.querySelectorAll('[data-draw]'));
  if (!paths.length) return;
  const run = (el) => {
    const len = el.getTotalLength ? el.getTotalLength() : 0;
    if (!len) return;
    el.style.strokeDasharray = len;
    el.style.strokeDashoffset = len;
    requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.33,.9,.32,1)';
      el.style.strokeDashoffset = '0';
    });
  };
  if (REDUCED() || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      run(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  paths.forEach((p) => io.observe(p));
}

export function initLightbox() {
  const figures = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!figures.length) return;
  let overlay = null;
  const close = () => {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  const open = (src, caption) => {
    close();
    overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', caption || 'Enlarged image');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(12,11,9,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:clamp(20px,5vw,64px);cursor:zoom-out;opacity:0;transition:opacity .25s ease';
    const img = document.createElement('img');
    img.src = src;
    img.alt = caption || '';
    img.style.cssText = 'max-width:100%;max-height:78vh;object-fit:contain;box-shadow:0 30px 90px rgba(0,0,0,.5)';
    overlay.appendChild(img);
    if (caption) {
      const cap = document.createElement('p');
      cap.textContent = caption;
      cap.style.cssText = 'margin:0;max-width:70ch;text-align:center;font-family:Archivo,Helvetica,Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:#C9C2B7;line-height:1.7';
      overlay.appendChild(cap);
    }
    const hint = document.createElement('p');
    hint.textContent = 'Click anywhere or press Esc to close';
    hint.style.cssText = 'margin:0;font-family:Archivo,Helvetica,Arial,sans-serif;font-size:10.5px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;color:#7A7266';
    overlay.appendChild(hint);
    overlay.addEventListener('click', close);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    document.addEventListener('keydown', onKey);
  };
  figures.forEach((fig) => {
    const img = fig.tagName === 'IMG' ? fig : fig.querySelector('img');
    if (!img) return;
    fig.style.cursor = 'zoom-in';
    if (!fig.hasAttribute('tabindex')) fig.setAttribute('tabindex', '0');
    if (!fig.hasAttribute('role')) fig.setAttribute('role', 'button');
    const cap = fig.getAttribute('data-lightbox') || (fig.querySelector('figcaption') && fig.querySelector('figcaption').textContent) || img.alt;
    const go = () => open(img.currentSrc || img.src, cap);
    fig.addEventListener('click', go);
    fig.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });
}

export function initBackToTop() {
  if (document.getElementById('ag-to-top')) return;
  const btn = document.createElement('button');
  btn.id = 'ag-to-top';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<span aria-hidden="true">&#8593;</span>';
  btn.style.cssText = 'position:fixed;right:clamp(16px,2.4vw,32px);bottom:clamp(16px,2.4vw,32px);z-index:900;width:46px;height:46px;border:1px solid rgba(20,18,15,.2);background:#fff;color:#14120F;font-size:17px;line-height:1;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .3s ease,background .2s ease,color .2s ease;box-shadow:0 6px 22px rgba(20,18,15,.1)';
  btn.addEventListener('mouseenter', () => { btn.style.background = '#14120F'; btn.style.color = '#fff'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = '#fff'; btn.style.color = '#14120F'; });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: REDUCED() ? 'auto' : 'smooth' });
  });
  document.body.appendChild(btn);
  const onScroll = () => {
    const show = window.scrollY > 900;
    btn.style.opacity = show ? '1' : '0';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

export function initSectionNav() {
  const nav = document.querySelector('[data-section-nav]');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const targets = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  if (!targets.length || !('IntersectionObserver' in window)) return;
  const mark = (id) => {
    links.forEach((a) => {
      const on = a.getAttribute('href') === '#' + id;
      a.style.color = on ? '#A32A19' : '#5D564D';
      a.style.borderLeftColor = on ? '#A32A19' : 'rgba(20,18,15,.16)';
      a.style.fontWeight = on ? '600' : '500';
    });
  };
  const io = new IntersectionObserver((entries) => {
    const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (vis[0]) mark(vis[0].target.id);
  }, { rootMargin: '-18% 0px -68% 0px' });
  targets.forEach((t) => io.observe(t));
}

export function initAll() {
  initReveal();
  initChartDraw();
  initLightbox();
  initBackToTop();
  initSectionNav();
}
