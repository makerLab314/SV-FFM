import './style.css';
import { initCursor } from './cursor.js';
import { initScrollAnimations } from './scroll.js';

/* ========================================
   Main entry – SV Website
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollAnimations();

  const loadThreeExperience = async () => {
    const [{ initLogo3D }, { initScene }] = await Promise.all([
      import('./logo3d.js'),
      import('./scene.js'),
    ]);
    initLogo3D();
    initScene();
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadThreeExperience, { timeout: 1200 });
  } else {
    window.setTimeout(loadThreeExperience, 1200);
  }
});
