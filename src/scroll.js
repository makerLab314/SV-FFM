/* ========================================
   Scroll Animations (GSAP + ScrollTrigger)
   Clean reveals + parallax
   ======================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  // --- Rolodex / page-fold effect ─────────────────────────────────────
  const FOLD_EXIT_ROT   = 14;
  const FOLD_DEPTH_PX   = -140;
  const FOLD_FADE       = 0.50;

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
          const rotX  = -eased * 10;
          section.style.transformOrigin = 'center bottom';
          section.style.transform = `rotateX(${rotX}deg) translateZ(${-eased * 50}px)`;
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
      y: -50,
      ease: 'none',
    });
  });

  // --- About cards — smooth reveal ─────────────────────────────────
  gsap.utils.toArray('.about-card').forEach((card, i) => {
    gsap.set(card, {
      opacity: 0,
      y: 50,
      scale: 0.97,
    });

    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power3.out',
    });
  });

  // --- Struktur cards — scale up ─────────────────────────────────
  gsap.utils.toArray('.struktur-card').forEach((card, i) => {
    gsap.set(card, {
      opacity: 0,
      y: 40,
      scale: 0.95,
    });

    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      delay: i * 0.08,
      ease: 'power3.out',
    });
  });

  // --- Project items — slide from the left ─────────────────────
  gsap.utils.toArray('.project-item').forEach((item, i) => {
    gsap.set(item, {
      opacity: 0,
      x: -40,
    });

    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      x: 0,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power2.out',
    });
  });

  // --- Vernetzung cards — fade in ─────────────────────────────────
  gsap.utils.toArray('.vernetzung-card').forEach((card, i) => {
    gsap.set(card, {
      opacity: 0,
      y: 40,
    });

    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.18,
      ease: 'power3.out',
    });
  });

  // --- Archiv section — zoom entrance ─────────────────────────────
  const archivContent = document.querySelector('.archiv-content');
  if (archivContent) {
    gsap.set(archivContent, {
      scale: 0.92,
      opacity: 0,
      y: 30,
    });

    gsap.to(archivContent, {
      scrollTrigger: {
        trigger: archivContent,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
    });
  }

  // --- Contact section — entrance ─────────────────────────────────
  const contactContent = document.querySelector('.contact-content');
  if (contactContent) {
    gsap.set(contactContent, {
      scale: 0.92,
      opacity: 0,
      y: 30,
    });

    gsap.to(contactContent, {
      scrollTrigger: {
        trigger: contactContent,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
    });
  }

  // --- Section titles – slide in ─────────────────────────────────
  gsap.utils.toArray('.section-title').forEach((title) => {
    gsap.set(title, { opacity: 0, y: 24 });

    gsap.to(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.75,
      ease: 'power3.out',
    });
  });

  // --- Section labels – fade in ─────────────────────────────────
  gsap.utils.toArray('.section-label').forEach((label) => {
    gsap.set(label, { opacity: 0, y: 12 });

    gsap.to(label, {
      scrollTrigger: {
        trigger: label,
        start: 'top 92%',
        toggleActions: 'play none none none',
      },
      opacity: 0.7,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
  });

  // --- Section leads – fade in ─────────────────────────────────────
  gsap.utils.toArray('.section-lead').forEach((lead) => {
    gsap.set(lead, { opacity: 0, y: 16 });

    gsap.to(lead, {
      scrollTrigger: {
        trigger: lead,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.65,
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
