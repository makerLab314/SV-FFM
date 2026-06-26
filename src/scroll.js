/* ========================================
   Interaktionen – Scroll-Reveal, Scroll-Spy,
   Header, Mobile-Nav, Pointer-Glow, Kontakt
   (Vanilla JS – keine externen Animationslibs)
   ======================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Scroll-Reveal: blendet .reveal beim Eintreten ein ───── */
function setupReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ── Scroll-Spy: aktiven Navigationspunkt markieren ─────── */
function setupScrollSpy() {
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const links = Array.from(document.querySelectorAll('.nav-links a'));
  if (!sections.length || !links.length) return;

  const setCurrent = (id) => {
    links.forEach((link) =>
      link.classList.toggle('is-current', link.getAttribute('href') === `#${id}`)
    );
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) setCurrent(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ── Header: beim Runterscrollen ausblenden ─────────────── */
function setupHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    if (y > lastY && y > 160) header.classList.add('hide');
    else header.classList.remove('hide');
    lastY = y;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
}

/* ── Mobile-Navigation ──────────────────────────────────── */
function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  const close = () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menü öffnen');
  };

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });

  links.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });
}

/* ── Kontakt-Adresse per JS zusammensetzen (Spam-Schutz) ── */
function setupContactEmail() {
  const btn = document.querySelector('.contact-mail[data-user][data-domain]');
  if (!btn) return;
  const address = `${btn.dataset.user}@${btn.dataset.domain}`;
  btn.href = `mailto:${address}`;
  const label = btn.querySelector('.contact-email');
  if (label) label.textContent = address;
}

/* ── Pointer-Glow folgt der Maus (nur feine Zeiger) ─────── */
function setupPointerGlow() {
  const glow = document.getElementById('pointer-glow');
  if (!glow || prefersReducedMotion) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let ticking = false;

  const render = () => {
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ticking = false;
  };

  window.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    glow.classList.add('active');
    if (!ticking) {
      window.requestAnimationFrame(render);
      ticking = true;
    }
  });

  document.addEventListener('mouseleave', () => glow.classList.remove('active'));
}

export function initInteractions() {
  setupReveal();
  setupScrollSpy();
  setupHeader();
  setupMobileNav();
  setupContactEmail();
  setupPointerGlow();
}
