/* ========================================
   Main entry – SV Website
   Helles Papier-/Archiv-Design
   ======================================== */

import './style.css';

/* Self-hosted fonts (DSGVO-konform – kein Google-CDN) */
import '@fontsource-variable/inter';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';

import { initInteractions } from './scroll.js';

/* Progressive Enhancement: .no-js → .js-ready (synchron in index.html gesetzt) */
document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js-ready');

const start = () => {
  initInteractions();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
