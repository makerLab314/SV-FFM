/* ========================================
   Background 3D Scene – Full-Page Particle
   Helix with floating geometry & bloom
   ======================================== */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScene() {
  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const useLiteScene = prefersReducedMotion || isMobile;

  /* ── Renderer ─────────────────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, useLiteScene ? 1.25 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping        = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  /* ── Scene & Camera ───────────────────────────────────────────────── */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.010);

  const camera = new THREE.PerspectiveCamera(
    58, window.innerWidth / window.innerHeight, 0.1, 500
  );
  camera.position.set(0, 0, 22);

  /* ── Post-Processing (Bloom) ──────────────────────────────────────── */
  let composer = null;
  let bloomPass = null;
  if (!useLiteScene) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.55,
      0.40,
      0.88
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
  }

  /* ── Lights ───────────────────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(8, 14, 14);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xd4a853, 1.8, 80);
  fillLight.position.set(10, 6, 10);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xaaccff, 1.4, 80);
  rimLight.position.set(-10, -4, -8);
  scene.add(rimLight);

  /* ══════════════════════════════════════════════════════════════════
     PARTICLE HELIX – dense double-strand spiral spanning full page
     ══════════════════════════════════════════════════════════════════ */
  const helixGroup = new THREE.Group();
  scene.add(helixGroup);

  const HELIX_RADIUS     = 4.0;
  const HELIX_HEIGHT     = 110;       // taller to cover full scroll
  const HELIX_TURNS      = 11;        // more turns → denser packing
  const HELIX_PARTICLES  = useLiteScene ? 10000 : 22000;
  const HELIX_STRANDS    = 2;

  /* physics constants for particle drift interaction */
  const SPRING_K       = 0.028;   // gentle spring back to helix
  const DAMPING        = 0.95;    // high damping → slow drift / linger
  const REPULSE_K      = 0.13;    // repulsion impulse strength
  const REPULSE_R_NDC  = 0.16;    // influence radius in NDC screen space
  const REPULSE_Y_FACTOR = 0.35;  // attenuate vertical scatter to preserve helix silhouette
  const INTERACTION_LINGER_S = 3.6; // seconds to keep spring loop running after last interaction

  const helixPositions     = new Float32Array(HELIX_PARTICLES * 3);
  const helixBasePositions = new Float32Array(HELIX_PARTICLES * 3); // rigid helix targets
  const helixVelocities    = new Float32Array(HELIX_PARTICLES * 3); // per-particle drift
  const helixRandY         = new Float32Array(HELIX_PARTICLES);      // pre-baked Y-drift bias
  const helixColors        = new Float32Array(HELIX_PARTICLES * 3);
  const helixSizes         = new Float32Array(HELIX_PARTICLES);

  const warmColor  = new THREE.Color(0xd4a853);
  const coolColor  = new THREE.Color(0xaaccff);
  const whiteColor = new THREE.Color(0xffffff);

  for (let i = 0; i < HELIX_PARTICLES; i++) {
    const strand = i % HELIX_STRANDS;
    const t = i / HELIX_PARTICLES;
    const angle = t * Math.PI * 2 * HELIX_TURNS + (strand * Math.PI);
    const y = (t - 0.5) * HELIX_HEIGHT;

    /* tighter radius noise → rigid, solid-looking helix structure */
    const rNoise = (Math.sin(t * 47.3) * 0.10 + Math.cos(t * 23.7) * 0.07);
    const r = HELIX_RADIUS + rNoise;

    const bx = Math.cos(angle) * r;
    const bz = Math.sin(angle) * r;

    helixBasePositions[i * 3]     = bx;
    helixBasePositions[i * 3 + 1] = y;
    helixBasePositions[i * 3 + 2] = bz;
    helixPositions[i * 3]         = bx;
    helixPositions[i * 3 + 1]     = y;
    helixPositions[i * 3 + 2]     = bz;

    /* color: warm→cool gradient along height */
    const c = new THREE.Color().lerpColors(warmColor, coolColor, t);
    if (Math.random() < 0.14) c.lerp(whiteColor, 0.7);
    helixColors[i * 3]     = c.r;
    helixColors[i * 3 + 1] = c.g;
    helixColors[i * 3 + 2] = c.b;

    helixSizes[i] = 0.06 + Math.random() * 0.06;

    /* pre-baked random Y-drift direction used during mouse repulsion */
    helixRandY[i] = (Math.random() - 0.5) * 2.0;
  }

  const helixGeo = new THREE.BufferGeometry();
  helixGeo.setAttribute('position', new THREE.BufferAttribute(helixPositions, 3).setUsage(THREE.DynamicDrawUsage));
  helixGeo.setAttribute('color',    new THREE.BufferAttribute(helixColors, 3));
  helixGeo.setAttribute('size',     new THREE.BufferAttribute(helixSizes, 1));

  const helixMat = new THREE.PointsMaterial({
    size: 0.20,             // larger → near-solid coverage
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const helixPoints = new THREE.Points(helixGeo, helixMat);
  helixGroup.add(helixPoints);

  /* ── Helix connecting filaments (thin line strands) ───────────────── */
  for (let s = 0; s < HELIX_STRANDS; s++) {
    const lineCount = useLiteScene ? 280 : 700;
    const linePos = new Float32Array(lineCount * 3);
    for (let j = 0; j < lineCount; j++) {
      const t = j / lineCount;
      const angle = t * Math.PI * 2 * HELIX_TURNS + (s * Math.PI);
      const y = (t - 0.5) * HELIX_HEIGHT;
      const rNoise = (Math.sin(t * 47.3) * 0.10 + Math.cos(t * 23.7) * 0.07);
      const r = HELIX_RADIUS + rNoise;
      linePos[j * 3]     = Math.cos(angle) * r;
      linePos[j * 3 + 1] = y;
      linePos[j * 3 + 2] = Math.sin(angle) * r;
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: s === 0 ? 0xd4a853 : 0xaaccff,
      transparent: true,
      opacity: 0.10,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    helixGroup.add(new THREE.Line(lineGeo, lineMat));
  }

  /* ── Cross-rungs between helix strands ────────────────────────────── */
  const RUNG_COUNT = useLiteScene ? 28 : 55;
  for (let r = 0; r < RUNG_COUNT; r++) {
    const t = r / RUNG_COUNT;
    const angle0 = t * Math.PI * 2 * HELIX_TURNS;
    const angle1 = angle0 + Math.PI;
    const y = (t - 0.5) * HELIX_HEIGHT;
    const rNoise = (Math.sin(t * 47.3) * 0.10 + Math.cos(t * 23.7) * 0.07);
    const rad = HELIX_RADIUS + rNoise;

    const rungPos = new Float32Array(6);
    rungPos[0] = Math.cos(angle0) * rad;
    rungPos[1] = y;
    rungPos[2] = Math.sin(angle0) * rad;
    rungPos[3] = Math.cos(angle1) * rad;
    rungPos[4] = y;
    rungPos[5] = Math.sin(angle1) * rad;

    const rungGeo = new THREE.BufferGeometry();
    rungGeo.setAttribute('position', new THREE.BufferAttribute(rungPos, 3));
    const rungMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    helixGroup.add(new THREE.Line(rungGeo, rungMat));
  }

  /* ══════════════════════════════════════════════════════════════════
     AMBIENT PARTICLE CLOUD – depth atmosphere
     ══════════════════════════════════════════════════════════════════ */
  const DUST_COUNT = useLiteScene ? 600 : 1800;
  const dustPos = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 6 + Math.random() * 50;
    dustPos[i * 3]     = Math.cos(a) * r;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 130;
    dustPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.06, sizeAttenuation: true,
    transparent: true, opacity: 0.25,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const dustCloud = new THREE.Points(dustGeo, dustMat);
  scene.add(dustCloud);

  /* ══════════════════════════════════════════════════════════════════
     FLOATING GEOMETRY – wireframe shapes orbiting around content
     ══════════════════════════════════════════════════════════════════ */
  const floatingShapes = [];
  const shapeGeos = [
    new THREE.IcosahedronGeometry(1.2, 0),
    new THREE.OctahedronGeometry(1.0, 0),
    new THREE.TetrahedronGeometry(0.9, 0),
    new THREE.TorusGeometry(0.8, 0.25, 8, 16),
    new THREE.TorusKnotGeometry(0.7, 0.22, 48, 8, 2, 3),
    new THREE.DodecahedronGeometry(0.9, 0),
  ];

  const shapeCount = useLiteScene ? 6 : 12;
  for (let i = 0; i < shapeCount; i++) {
    const geo = shapeGeos[i % shapeGeos.length];
    const isWarm = i % 3 === 0;
    const mat = new THREE.MeshBasicMaterial({
      color: isWarm ? 0xd4a853 : 0xaaccff,
      wireframe: true,
      transparent: true,
      opacity: 0.12 + Math.random() * 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);

    const angle = (i / shapeCount) * Math.PI * 2;
    const orbitRadius = 10 + Math.random() * 8;
    const yPos = (Math.random() - 0.5) * 70;

    mesh.position.set(
      Math.cos(angle) * orbitRadius,
      yPos,
      Math.sin(angle) * orbitRadius
    );

    const s = 0.6 + Math.random() * 1.0;
    mesh.scale.set(s, s, s);

    mesh.userData = {
      orbitRadius,
      orbitSpeed: 0.02 + Math.random() * 0.04,
      orbitOffset: angle,
      bobSpeed: 0.3 + Math.random() * 0.4,
      bobAmp: 0.4 + Math.random() * 0.6,
      spinSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.2
      ),
      baseY: yPos,
    };

    scene.add(mesh);
    floatingShapes.push(mesh);
  }

  /* ══════════════════════════════════════════════════════════════════
     ORBITAL PARTICLE RINGS – layered depth
     ══════════════════════════════════════════════════════════════════ */
  const orbRings = [];
  const ringCount = useLiteScene ? 2 : 4;
  for (let ri = 0; ri < ringCount; ri++) {
    const rad = 14 + ri * 6;
    const cnt = 140 + ri * 40;
    const pos = new Float32Array(cnt * 3);
    for (let j = 0; j < cnt; j++) {
      const a = (j / cnt) * Math.PI * 2;
      pos[j * 3]     = Math.cos(a) * rad + (Math.random() - 0.5) * 0.8;
      pos[j * 3 + 1] = (Math.random() - 0.5) * 2.0;
      pos[j * 3 + 2] = Math.sin(a) * rad + (Math.random() - 0.5) * 0.8;
    }
    const orGeo = new THREE.BufferGeometry();
    orGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const orMat = new THREE.PointsMaterial({
      color: ri % 2 === 0 ? 0xd4a853 : 0xaaccff,
      size: 0.05,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.18 - ri * 0.03,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Points(orGeo, orMat);
    ring.userData.speed = 0.05 + Math.random() * 0.1;
    ring.rotation.x = (Math.random() - 0.5) * 0.4;
    scene.add(ring);
    orbRings.push(ring);
  }

  /* ══════════════════════════════════════════════════════════════════
     SCROLL-DRIVEN ANIMATION – helix rotates & camera moves with scroll
     ══════════════════════════════════════════════════════════════════ */
  const scrollAnim = { rotation: 0, camY: 0 };

  gsap.to(scrollAnim, {
    rotation: Math.PI * 6,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.8,
    },
  });

  gsap.to(scrollAnim, {
    camY: -HELIX_HEIGHT * 0.44,    // camera travels 44 % of helix height; combined with lookAt offset this keeps the helix visible throughout the full scroll
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.8,
    },
  });

  /* ── Mouse / touch tracking (NDC) for particle repulsion ─────────── */
  const mouseNDC   = { x: 0, y: 0 };
  let   mouseActive = false;

  /* countdown that keeps the spring loop running after interaction ends */
  let lastInteractionTime = -999; // seconds since clock start

  document.addEventListener('mousemove', (e) => {
    mouseNDC.x  =  (e.clientX / window.innerWidth)  * 2 - 1;
    mouseNDC.y  = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseActive         = true;
    lastInteractionTime = clock.getElapsedTime();
  });

  document.addEventListener('mouseleave', () => { mouseActive = false; });

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouseNDC.x  =  (e.touches[0].clientX / window.innerWidth)  * 2 - 1;
      mouseNDC.y  = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      mouseActive         = true;
      lastInteractionTime = clock.getElapsedTime();
    }
  }, { passive: true });

  document.addEventListener('touchend', () => { mouseActive = false; });

  /* ── Mouse parallax (camera tilt on desktop) ─────────────────────── */
  let targetCamX = 0;
  let targetCamY = 0;

  if (!useLiteScene) {
    document.addEventListener('mousemove', (e) => {
      const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      targetCamX =  mx * 3.0;
      targetCamY = -my * 2.0;
    });
  }

  /* ── Resize ───────────────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (composer && bloomPass) {
      composer.setSize(window.innerWidth, window.innerHeight);
      bloomPass.resolution.set(window.innerWidth, window.innerHeight);
    }
  });

  /* ── Reusable scratch matrix for per-frame MVP projection ────────── */
  const _mvp = new THREE.Matrix4();

  /* ── Animation loop ───────────────────────────────────────────────── */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    /* scroll-driven helix rotation + subtle idle drift */
    helixGroup.rotation.y = scrollAnim.rotation + elapsed * 0.06;

    /* camera follows scroll position vertically */
    const targetY = scrollAnim.camY + targetCamY;
    camera.position.x += (targetCamX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.lookAt(0, camera.position.y * 0.8, 0);

    /* ── Particle drift: spring-damper + mouse repulsion ──────────── */
    /* Only run the expensive loop while there is active interaction or
       the particles are still returning to their base positions.       */
    const springActive = mouseActive ||
      (elapsed - lastInteractionTime < INTERACTION_LINGER_S);

    if (springActive) {
      camera.updateMatrixWorld();
      helixGroup.updateMatrixWorld(true);

      /* MVP = projectionMatrix * viewMatrix * helixGroup worldMatrix */
      _mvp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
          .multiply(helixGroup.matrixWorld);
      const m   = _mvp.elements;          // column-major Float32 elements
      const pos = helixGeo.attributes.position.array;
      const rr  = REPULSE_R_NDC * REPULSE_R_NDC;
      const mx  = mouseNDC.x;
      const my  = mouseNDC.y;

      for (let i = 0; i < HELIX_PARTICLES; i++) {
        const ix = i * 3;
        const px = pos[ix];
        const py = pos[ix + 1];
        const pz = pos[ix + 2];

        /* spring force toward rigid helix base position */
        helixVelocities[ix]     += (helixBasePositions[ix]     - px) * SPRING_K;
        helixVelocities[ix + 1] += (helixBasePositions[ix + 1] - py) * SPRING_K;
        helixVelocities[ix + 2] += (helixBasePositions[ix + 2] - pz) * SPRING_K;

        /* damping */
        helixVelocities[ix]     *= DAMPING;
        helixVelocities[ix + 1] *= DAMPING;
        helixVelocities[ix + 2] *= DAMPING;

        if (mouseActive) {
          /* project particle local position → NDC (column-major MVP) */
          const cx = m[0] * px + m[4] * py + m[8]  * pz + m[12];
          const cy = m[1] * px + m[5] * py + m[9]  * pz + m[13];
          const cw = m[3] * px + m[7] * py + m[11] * pz + m[15];

          if (cw > 0.01) {
            const ndcX = cx / cw;
            const ndcY = cy / cw;
            const dx   = ndcX - mx;
            const dy   = ndcY - my;
            const d2   = dx * dx + dy * dy;

            if (d2 < rr) {
              const strength = REPULSE_K * (1.0 - Math.sqrt(d2) / REPULSE_R_NDC);
              /* push radially outward from helix axis (XZ) + random Y drift */
              const axLen = Math.sqrt(px * px + pz * pz) || 1.0;
              helixVelocities[ix]     += (px / axLen) * strength;
              helixVelocities[ix + 1] += helixRandY[i] * strength * REPULSE_Y_FACTOR;
              helixVelocities[ix + 2] += (pz / axLen) * strength;
            }
          }
        }

        /* integrate position */
        pos[ix]     += helixVelocities[ix];
        pos[ix + 1] += helixVelocities[ix + 1];
        pos[ix + 2] += helixVelocities[ix + 2];
      }

      helixGeo.attributes.position.needsUpdate = true;
    } /* end springActive */

    if (!useLiteScene) {
      /* dust cloud slow drift */
      dustCloud.rotation.y = elapsed * 0.008;

      /* orbital rings */
      orbRings.forEach((ring) => {
        ring.rotation.y += ring.userData.speed * 0.003;
      });

      /* floating shapes – orbit, bob, spin */
      floatingShapes.forEach((mesh) => {
        const d = mesh.userData;
        const a = d.orbitOffset + elapsed * d.orbitSpeed;
        mesh.position.x = Math.cos(a) * d.orbitRadius;
        mesh.position.z = Math.sin(a) * d.orbitRadius;
        mesh.position.y = d.baseY + Math.sin(elapsed * d.bobSpeed) * d.bobAmp;
        mesh.rotation.x += d.spinSpeed.x * 0.01;
        mesh.rotation.y += d.spinSpeed.y * 0.01;
        mesh.rotation.z += d.spinSpeed.z * 0.01;
      });

      /* dynamic lights orbit */
      const la = elapsed * 0.15;
      fillLight.position.x  =  Math.cos(la) * 14;
      fillLight.position.z  =  10 + Math.sin(la) * 8;
      rimLight.position.x   =  Math.cos(la + Math.PI) * 14;
      rimLight.position.z   = -8 + Math.sin(la * 0.7) * 6;
    }

    if (composer) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  animate();
}
