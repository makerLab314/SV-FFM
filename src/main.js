import './style.css';
import { initLogo3D } from './logo3d.js';
import { initScene } from './scene.js';
import { initCursor } from './cursor.js';
import { initScrollAnimations } from './scroll.js';

/* ========================================
   Main entry – SV Website
   ======================================== */

/* ── Typewriter effect ────────────────────── */
function initTypewriter() {
  const el = document.querySelector('.typewriter-text');
  if (!el) return;

  const phrases = [
    'Demokratie leben.',
    'Schule gestalten.',
    'Zukunft formen.',
    'Seit 1947.',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const TYPING_SPEED = 70;
  const DELETING_SPEED = 40;
  const PAUSE_AFTER_TYPE = 2200;
  const PAUSE_AFTER_DELETE = 500;

  function tick() {
    const current = phrases[phraseIdx];
    if (!isDeleting) {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        isDeleting = true;
        setTimeout(tick, PAUSE_AFTER_TYPE);
        return;
      }
      setTimeout(tick, TYPING_SPEED);
    } else {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, PAUSE_AFTER_DELETE);
        return;
      }
      setTimeout(tick, DELETING_SPEED);
    }
  }

  /* Start after hero entrance finishes (~2s) */
  setTimeout(tick, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initLogo3D();
  initScene();
  initScrollAnimations();
  initTypewriter();
});
