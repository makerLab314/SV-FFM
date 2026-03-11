/* ========================================
   Typewriter Effect
   UIverse-inspired character-by-character reveal
   with blinking cursor
   ======================================== */

export function initTypewriter() {
  const elements = document.querySelectorAll('[data-typewriter]');

  elements.forEach((el) => {
    const text = el.getAttribute('data-typewriter');
    const speed = parseInt(el.getAttribute('data-typewriter-speed') || '60', 10);
    const delay = parseInt(el.getAttribute('data-typewriter-delay') || '0', 10);

    el.textContent = '';
    el.classList.add('typewriter-active');

    setTimeout(() => {
      let i = 0;
      const cursor = document.createElement('span');
      cursor.classList.add('typewriter-cursor');
      cursor.textContent = '|';
      el.appendChild(cursor);

      function type() {
        if (i < text.length) {
          el.insertBefore(document.createTextNode(text.charAt(i)), cursor);
          i++;
          setTimeout(type, speed + Math.random() * 40);
        } else {
          /* keep cursor blinking for a while, then fade out */
          setTimeout(() => {
            cursor.classList.add('typewriter-cursor-fade');
          }, 2000);
        }
      }

      type();
    }, delay);
  });
}

/* Typewriter for hero — sequential lines */
export function initHeroTypewriter() {
  const lines = document.querySelectorAll('.hero-typewriter-line');
  let totalDelay = 600; /* initial delay after page load */

  lines.forEach((line) => {
    const text = line.getAttribute('data-text');
    const speed = 55;

    line.textContent = '';
    line.style.opacity = '0';

    setTimeout(() => {
      line.style.opacity = '1';
      let i = 0;
      const cursor = document.createElement('span');
      cursor.classList.add('typewriter-cursor');
      cursor.textContent = '│';
      line.appendChild(cursor);

      function type() {
        if (i < text.length) {
          line.insertBefore(document.createTextNode(text.charAt(i)), cursor);
          i++;
          setTimeout(type, speed + Math.random() * 30);
        } else {
          cursor.classList.add('typewriter-cursor-done');
        }
      }

      type();
    }, totalDelay);

    totalDelay += text.length * (speed + 15) + 400;
  });

  /* Fade in subtitle and tagline after typewriter completes */
  const subtitle = document.querySelector('.hero-subtitle');
  const tagline = document.querySelector('.hero-tagline');
  const scrollInd = document.querySelector('.scroll-indicator');

  if (subtitle) {
    setTimeout(() => {
      subtitle.classList.add('revealed');
    }, totalDelay + 200);
  }

  if (tagline) {
    setTimeout(() => {
      tagline.classList.add('revealed');
    }, totalDelay + 600);
  }

  if (scrollInd) {
    setTimeout(() => {
      scrollInd.classList.add('revealed');
    }, totalDelay + 1000);
  }
}
