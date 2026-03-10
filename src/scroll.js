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
  // Each section folds backward & up as it leaves (like a flip-clock or rolodex card)
  // The next section arrives by unrolling from below
  const FOLD_EXIT_ROT   = 18;   // degrees rotateX when exiting (fold backward)
  const FOLD_DEPTH_PX   = -180; // translateZ when folding away
  const FOLD_FADE       = 0.55;

  gsap.utils.toArray('.section').forEach((section) => {
    // Exit animation: section folds away upward
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        // Ease the fold curve: slow start, fast at end
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

    // Entry animation: section unrolls in from below
    ScrollTrigger.create({
      trigger: section,
      start: 'top 110%',
      end: 'top top',
      scrub: 1,
      onUpdate: (self) => {
        // Only apply while entering (not exiting)
        if (self.direction === 1) {
          const entryProgress = 1 - self.progress; // 1 → 0 as we scroll in
          const eased = entryProgress * entryProgress;
          const rotX  = -eased * 12;       // arrive from "below" (negative rotX)
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
    // Set initial state: rotated backward (as if on a barrel, facing away)
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

  // --- Team members — scale up from a coin-flip ─────────────────────
  gsap.utils.toArray('.team-member').forEach((member, i) => {
    gsap.set(member, {
      rotateY: -90,
      transformPerspective: 700,
      opacity: 0,
      scale: 0.8,
    });

    gsap.to(member, {
      scrollTrigger: {
        trigger: member,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      rotateY: 0,
      opacity: 1,
      scale: 1,
      duration: 0.75,
      delay: i * 0.12,
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
