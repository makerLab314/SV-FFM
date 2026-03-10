/* ========================================
   Scroll Animations (GSAP + ScrollTrigger)
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

  // --- Generic scroll-reveal for cards / sections ---
  gsap.utils.toArray('.about-card').forEach((card, i) => {
    gsap.to(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: i * 0.12,
      ease: 'power2.out',
    });
  });

  gsap.utils.toArray('.team-member').forEach((member, i) => {
    gsap.to(member, {
      scrollTrigger: {
        trigger: member,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power2.out',
    });
  });

  gsap.utils.toArray('.project-item').forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      opacity: 1,
      x: 0,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power2.out',
    });
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
      duration: 0.8,
      ease: 'power2.out',
    });
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
