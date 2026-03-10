import './style.css';
import { initLogo3D } from './logo3d.js';
import { initScene } from './scene.js';
import { initCursor } from './cursor.js';
import { initScrollAnimations } from './scroll.js';

/* ========================================
   Main entry – SV Website
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initLogo3D();
  initScene();
  initScrollAnimations();
});
