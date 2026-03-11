/* ========================================
   Scroll Animations (GSAP + ScrollTrigger)
   Skeuomorphic 3D rolodex fold/unroll + parallax
   ======================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  // --- Hero entrance ---
  const heroLines = document.querySelectorAll('.hero-title .line');
  const heroSub = document.querySelector('.hero-subtitle');
  const heroTag = document.querySelector('.hero-tagline');
  const scrollInd = document.querySelector('.scroll-indicator');

  // Set initial state BEFORE creating the timeline
  heroLines.forEach((line) => {
    gsap.set(line, { rotateX: -45, transformPerspective: 800 });
  });

  const heroTl = gsap.timeline({ delay: 0.3 });

  heroLines.forEach((line, i) => {
    heroTl.to(
      line,
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1.1,
        ease: 'power4.out',
      },
      i * 0.25
    );
  });

  if (heroSub) {
    heroTl.to(
      heroSub,
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power2.out',
      },
      0.7
    );
  }

  if (heroTag) {
    heroTl.to(
      heroTag,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      },
      1.0
    );
  }

  if (scrollInd) {
    heroTl.to(
      scrollInd,
      {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      },
      1.4
    );
  }

  // --- Rolodex / page-fold effect ─────────────────────────────────────
  const FOLD_EXIT_ROT   = 18;
  const FOLD_DEPTH_PX   = -180;
  const FOLD_FADE       = 0.55;

  gsap.utils.toArray('.section').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        const eased = p * p;
        const rotX    = eased * FOLD_EXIT_ROT;
        const transZ  = eased * FOLD_DEPTH_PX;
        const opacity = 1 - p * FOLD_FADE;
        section.style.transform = `rotateX(${rotX}deg) translateZ(${transZ}px)`;
        section.style.opacity   = opacity;
      },
      onLeaveBack: () => {
        section.style.transform = 'rotateX(0deg) translateZ(0px)';
        section.style.opacity   = 1;
      },
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 110%',
      end: 'top top',
      scrub: 1,
      onUpdate: (self) => {
        if (self.direction === 1) {
          const entryProgress = 1 - self.progress;
          const eased = entryProgress * entryProgress;
          const rotX  = -eased * 12;
          section.style.transformOrigin = 'center bottom';
          section.style.transform = `rotateX(${rotX}deg) translateZ(${-eased * 60}px)`;
        }
      },
      onEnterBack: () => {
        section.style.transformOrigin = 'center top';
      },
    });
  });

  // --- Deep parallax on section content ─────────────────────────────
  gsap.utils.toArray('.section-inner').forEach((inner) => {
    gsap.to(inner, {
      scrollTrigger: {
        trigger: inner,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
      y: -60,
      ease: 'none',
    });
  });

  // ── Hero-logo parallax (slower than content) ─────────────────────────
  const heroLogoBg = document.querySelector('.hero-logo-bg');
  if (heroLogoBg) {
    gsap.to(heroLogoBg, {
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
      },
      y: -120,
      scale: 1.15,
      ease: 'none',
    });
  }

  // --- About cards — rolodex flip-in from behind ─────────────────────
  gsap.utils.toArray('.about-card').forEach((card, i) => {
    gsap.set(card, {
      rotateX: 55,
      transformPerspective: 900,
      transformOrigin: 'center bottom',
      opacity: 0,
      y: 60,
    });

    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      rotateX: 0,
      opacity: 1,
      y: 0,
      duration: 0.9,
      delay: i * 0.18,
      ease: 'back.out(1.2)',
    });
  });

  // --- Struktur cards — scale up with rotation ─────────────────────
  gsap.utils.toArray('.struktur-card').forEach((card, i) => {
    gsap.set(card, {
      rotateY: -45,
      transformPerspective: 700,
      opacity: 0,
      scale: 0.85,
    });

    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      rotateY: 0,
      opacity: 1,
      scale: 1,
      duration: 0.75,
      delay: i * 0.1,
      ease: 'power3.out',
    });
  });

  // --- Project items — slide from the left with a 3-D lean ─────────
  gsap.utils.toArray('.project-item').forEach((item, i) => {
    gsap.set(item, {
      rotateY: -12,
      transformPerspective: 700,
      opacity: 0,
      x: -60,
    });

    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      rotateY: 0,
      opacity: 1,
      x: 0,
      duration: 0.75,
      delay: i * 0.12,
      ease: 'power2.out',
    });
  });

  // --- Vernetzung cards — flip in ─────────────────────────────────
  gsap.utils.toArray('.vernetzung-card').forEach((card, i) => {
    gsap.set(card, {
      rotateX: 35,
      transformPerspective: 900,
      transformOrigin: 'center bottom',
      opacity: 0,
      y: 50,
    });

    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      rotateX: 0,
      opacity: 1,
      y: 0,
      duration: 0.85,
      delay: i * 0.2,
      ease: 'back.out(1.3)',
    });
  });

  // --- Archiv section — zoom entrance ─────────────────────────────
  const archivContent = document.querySelector('.archiv-content');
  if (archivContent) {
    gsap.set(archivContent, {
      scale: 0.88,
      rotateX: 15,
      transformPerspective: 800,
      opacity: 0,
      y: 40,
    });

    gsap.to(archivContent, {
      scrollTrigger: {
        trigger: archivContent,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
      scale: 1,
      rotateX: 0,
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'back.out(1.4)',
    });
  }

  // --- Contact section — zoom-punch entrance ─────────────────────────
  const contactContent = document.querySelector('.contact-content');
  if (contactContent) {
    gsap.set(contactContent, {
      scale: 0.85,
      rotateX: 20,
      transformPerspective: 800,
      opacity: 0,
      y: 40,
    });

    gsap.to(contactContent, {
      scrollTrigger: {
        trigger: contactContent,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
      scale: 1,
      rotateX: 0,
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'back.out(1.5)',
    });
  }

  // --- Section titles – slide in with slight rotateX ─────────────────
  gsap.utils.toArray('.section-title').forEach((title) => {
    gsap.set(title, { rotateX: -25, transformPerspective: 600, opacity: 0, y: 30 });

    gsap.to(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      rotateX: 0,
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
    });
  });

  // --- Section leads – fade in ─────────────────────────────────────
  gsap.utils.toArray('.section-lead').forEach((lead) => {
    gsap.set(lead, { opacity: 0, y: 20 });

    gsap.to(lead, {
      scrollTrigger: {
        trigger: lead,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
    });
  });

  // --- Navbar hide/show on scroll ─────────────────────────────────────
  let lastScroll = 0;
  const navbar = document.getElementById('navbar');

  ScrollTrigger.create({
    onUpdate: (self) => {
      if (!navbar) return;
      const currentScroll = self.scroll();
      if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
      lastScroll = currentScroll;
    },
  });
}
