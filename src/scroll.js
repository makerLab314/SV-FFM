/* ========================================
   Scroll Animations (GSAP + ScrollTrigger)
   Skeuomorphic 3D fold/roll + parallax
   ======================================== */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  // --- Hero entrance ---
  const heroLines = document.querySelectorAll('.hero-title .line');
  const heroSub = document.querySelector('.hero-subtitle');
  const scrollInd = document.querySelector('.scroll-indicator');

  const heroTl = gsap.timeline({ delay: 0.3 });

  heroLines.forEach((line, i) => {
    heroTl.to(
      line,
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
      },
      i * 0.2
    );
  });

  if (heroSub) {
    heroTl.to(
      heroSub,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
      },
      0.6
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
      1.2
    );
  }

  // --- 3D Fold/Roll effect: sections fold upward as they scroll out ---
  const FOLD_MAX_ROTATION_DEG = 8;
  const FOLD_MAX_DEPTH_PX = -120;
  const FOLD_FADE_INTENSITY = 0.6;

  gsap.utils.toArray('.section').forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const rotateX = progress * FOLD_MAX_ROTATION_DEG;
        const translateZ = progress * FOLD_MAX_DEPTH_PX;
        const opacity = 1 - progress * FOLD_FADE_INTENSITY;
        section.style.transform =
          `rotateX(${rotateX}deg) translateZ(${translateZ}px)`;
        section.style.opacity = opacity;
      },
      onLeaveBack: () => {
        section.style.transform = 'rotateX(0deg) translateZ(0px)';
        section.style.opacity = 1;
      },
    });
  });

  // --- Parallax depth on section inner content ---
  gsap.utils.toArray('.section-inner').forEach((inner) => {
    gsap.to(inner, {
      scrollTrigger: {
        trigger: inner,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
      y: -40,
      ease: 'none',
    });
  });

  // --- About cards scroll-reveal with 3D ---
  const CARD_TILT_DEG = 12;
  const CARD_PERSPECTIVE_PX = 800;

  gsap.utils.toArray('.about-card').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.8,
      delay: i * 0.15,
      ease: 'power3.out',
    });
    gsap.set(card, { rotateX: CARD_TILT_DEG, transformPerspective: CARD_PERSPECTIVE_PX });
  });

  // --- Team members scroll-reveal ---
  gsap.utils.toArray('.team-member').forEach((member, i) => {
    gsap.to(member, {
      scrollTrigger: {
        trigger: member,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'back.out(1.4)',
    });
    gsap.set(member, { scale: 0.9 });
  });

  // --- Project items scroll-reveal with slide ---
  const PROJECT_TILT_DEG = -5;
  const PROJECT_PERSPECTIVE_PX = 600;

  gsap.utils.toArray('.project-item').forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      x: 0,
      rotateY: 0,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power2.out',
    });
    gsap.set(item, { rotateY: PROJECT_TILT_DEG, transformPerspective: PROJECT_PERSPECTIVE_PX });
  });

  // --- Contact section ---
  const contactContent = document.querySelector('.contact-content');
  if (contactContent) {
    gsap.to(contactContent, {
      scrollTrigger: {
        trigger: contactContent,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      ease: 'power2.out',
    });
    gsap.set(contactContent, { scale: 0.95 });
  }

  // --- Section titles ---
  gsap.utils.toArray('.section-title').forEach((title) => {
    gsap.from(title, {
      scrollTrigger: {
        trigger: title,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
      opacity: 0,
      y: 40,
      duration: 0.7,
      ease: 'power2.out',
    });
  });

  // --- Navbar hide/show on scroll ---
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
