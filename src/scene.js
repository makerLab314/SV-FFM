/* ========================================
   Background 3D Scene – Award-Worthy
   Scroll-driven rotating glass pillar with
   MeshPhysicalMaterial (transmission/IOR),
   canvas text, bloom & particle galaxy
   ======================================== */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ── Canvas texture with SV text for the pillar surface ───────────── */
function createPillarTexture() {
  const cvs = document.createElement('canvas');
  cvs.width  = 1024;
  cvs.height = 2048;
  const ctx  = cvs.getContext('2d');

  /* background – very faint gradient so glass stays mostly clear */
  const grad = ctx.createLinearGradient(0, 0, 0, 2048);
  grad.addColorStop(0,   'rgba(255,255,255,0.02)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.05)');
  grad.addColorStop(1,   'rgba(255,255,255,0.02)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 2048);

  /* subtle horizontal rule lines */
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 9; i++) {
    const ly = i * (2048 / 9);
    ctx.beginPath();
    ctx.moveTo(80, ly);
    ctx.lineTo(944, ly);
    ctx.stroke();
  }

  /* text layers */
  const items = [
    { text: 'SV FFM',            y:  220, size: 130, weight: '800', alpha: 0.88 },
    { text: 'Waldorfschule',     y:  400, size:  68, weight: '600', alpha: 0.72 },
    { text: 'Frankfurt',         y:  510, size:  68, weight: '600', alpha: 0.72 },
    { text: '— — —',             y:  630, size:  42, weight: '400', alpha: 0.28 },
    { text: 'Gemeinsam',         y:  800, size:  82, weight: '700', alpha: 0.82 },
    { text: 'gestalten wir',     y:  930, size:  82, weight: '700', alpha: 0.82 },
    { text: 'Schule.',           y: 1060, size:  82, weight: '700', alpha: 0.82 },
    { text: '— — —',             y: 1170, size:  42, weight: '400', alpha: 0.28 },
    { text: '2025 · 2026',       y: 1330, size:  60, weight: '500', alpha: 0.60 },
    { text: 'Deine Stimme',      y: 1520, size:  80, weight: '700', alpha: 0.85 },
    { text: 'zählt!',            y: 1650, size:  80, weight: '700', alpha: 0.85 },
    { text: '→ Mitmachen',       y: 1840, size:  60, weight: '500', alpha: 0.60 },
  ];

  items.forEach(({ text, y, size, weight, alpha }) => {
    ctx.font        = `${weight} ${size}px 'Arial', 'Helvetica Neue', sans-serif`;
    ctx.fillStyle   = `rgba(255,255,255,${alpha})`;
    ctx.textAlign   = 'center';
    ctx.shadowColor = 'rgba(255,255,255,0.25)';
    ctx.shadowBlur  = 14;
    ctx.fillText(text, 512, y);
  });

  ctx.shadowBlur = 0;
  return new THREE.CanvasTexture(cvs);
}

export function initScene() {
  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return;

  /* ── Renderer ─────────────────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping        = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  /* ── Scene & Camera ───────────────────────────────────────────────── */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    58, window.innerWidth / window.innerHeight, 0.1, 500
  );
  camera.position.set(0, 0, 20);

  /* ── Environment map (PMREM from RoomEnvironment) ─────────────────── */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment(renderer);
  scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
  pmrem.dispose();
  roomEnv.dispose();

  /* ── Post-Processing (Bloom) ──────────────────────────────────────── */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.45, // strength
    0.30, // radius
    0.88  // threshold
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  /* ── Lights ───────────────────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
  keyLight.position.set(8, 14, 14);
  scene.add(keyLight);

  /* warm fill from the right */
  const fillLight = new THREE.PointLight(0xfff0e0, 2.5, 80);
  fillLight.position.set(10, 6, 10);
  scene.add(fillLight);

  /* cool rim from the left-back */
  const rimLight = new THREE.PointLight(0xaaccff, 2.0, 80);
  rimLight.position.set(-10, -4, -8);
  scene.add(rimLight);

  /* bottom accent */
  const bottomLight = new THREE.PointLight(0xffffff, 1.2, 60);
  bottomLight.position.set(0, -24, 6);
  scene.add(bottomLight);

  /* ── Glass Pillar group ───────────────────────────────────────────── */
  const pillarGroup = new THREE.Group();
  scene.add(pillarGroup);

  const PILLAR_RADIUS = 3.2;
  const PILLAR_HEIGHT = 32;

  /* outer transparent glass shell (open-ended so inside is visible) */
  const outerGeo = new THREE.CylinderGeometry(
    PILLAR_RADIUS, PILLAR_RADIUS, PILLAR_HEIGHT, 80, 1, true
  );
  const pillarTexture = createPillarTexture();
  const glassMat = new THREE.MeshPhysicalMaterial({
    color:                0xffffff,
    metalness:            0.0,
    roughness:            0.06,
    transmission:         0.92,   /* near-complete glass transparency */
    thickness:            2.5,    /* simulated glass thickness */
    ior:                  1.52,   /* standard heavy glass IOR  */
    clearcoat:            1.0,
    clearcoatRoughness:   0.04,
    envMapIntensity:      1.6,
    transparent:          true,
    side:                 THREE.DoubleSide,
    map:                  pillarTexture,
  });
  const outerCylinder = new THREE.Mesh(outerGeo, glassMat);
  pillarGroup.add(outerCylinder);

  /* top & bottom glass caps */
  const capMat = new THREE.MeshPhysicalMaterial({
    color:              0xffffff,
    metalness:          0.0,
    roughness:          0.03,
    transmission:       0.96,
    thickness:          0.2,
    ior:                1.52,
    clearcoat:          1.0,
    envMapIntensity:    1.6,
    transparent:        true,
  });
  const capGeo = new THREE.CircleGeometry(PILLAR_RADIUS, 80);

  const topCap = new THREE.Mesh(capGeo, capMat);
  topCap.position.y  =  PILLAR_HEIGHT / 2;
  topCap.rotation.x  = -Math.PI / 2;
  pillarGroup.add(topCap);

  const bottomCap = new THREE.Mesh(capGeo, capMat);
  bottomCap.position.y =  -PILLAR_HEIGHT / 2;
  bottomCap.rotation.x  =  Math.PI / 2;
  pillarGroup.add(bottomCap);

  /* inner frosted acrylic core – gives the cloudy glass-depth look */
  const innerGeo = new THREE.CylinderGeometry(
    PILLAR_RADIUS - 0.55, PILLAR_RADIUS - 0.55, PILLAR_HEIGHT - 0.1, 64, 1, false
  );
  const acrylicMat = new THREE.MeshPhysicalMaterial({
    color:            0xfbfbff,
    metalness:        0.0,
    roughness:        0.30,
    transmission:     0.70,
    thickness:        1.8,
    ior:              1.45,
    clearcoat:        0.4,
    clearcoatRoughness: 0.18,
    envMapIntensity:  0.9,
    transparent:      true,
    opacity:          0.55,
  });
  pillarGroup.add(new THREE.Mesh(innerGeo, acrylicMat));

  /* horizontal edge glow rings */
  const ringYs = [-14, -8, -2, 4, 10];
  ringYs.forEach((ry) => {
    const rGeo = new THREE.TorusGeometry(PILLAR_RADIUS + 0.04, 0.022, 14, 80);
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.30,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.y = ry;
    ring.rotation.x = Math.PI / 2;
    pillarGroup.add(ring);
  });

  /* top & bottom edge bright rings (highlight) */
  [-PILLAR_HEIGHT / 2, PILLAR_HEIGHT / 2].forEach((ry) => {
    const rGeo = new THREE.TorusGeometry(PILLAR_RADIUS + 0.05, 0.04, 14, 80);
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.55,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.y = ry;
    ring.rotation.x = Math.PI / 2;
    pillarGroup.add(ring);
  });

  /* ── Particle galaxy (cylindrical cloud behind pillar) ────────────── */
  const PARTICLE_COUNT = 2200;
  const pPos = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 8 + Math.random() * 48;
    const y = (Math.random() - 0.5) * 130;
    pPos[i * 3]     = Math.cos(a) * r;
    pPos[i * 3 + 1] = y;
    pPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.11, sizeAttenuation: true,
    transparent: true, opacity: 0.38,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ── Orbital particle rings (depth layers) ────────────────────────── */
  const orbRings = [];
  for (let ri = 0; ri < 4; ri++) {
    const rad = 12 + ri * 7;
    const cnt = 160 + ri * 40;
    const pos = new Float32Array(cnt * 3);
    for (let j = 0; j < cnt; j++) {
      const a = (j / cnt) * Math.PI * 2;
      pos[j * 3]     = Math.cos(a) * rad + (Math.random() - 0.5) * 0.5;
      pos[j * 3 + 1] = (Math.random() - 0.5) * 1.8;
      pos[j * 3 + 2] = Math.sin(a) * rad + (Math.random() - 0.5) * 0.5;
    }
    const orGeo = new THREE.BufferGeometry();
    orGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const orMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.06, sizeAttenuation: true,
      transparent: true, opacity: 0.22 - ri * 0.04,
    });
    const ring = new THREE.Points(orGeo, orMat);
    ring.userData.speed = 0.06 + Math.random() * 0.12;
    ring.rotation.x     = (Math.random() - 0.5) * 0.3;
    scene.add(ring);
    orbRings.push(ring);
  }

  /* ── GSAP ScrollTrigger – silky scroll-driven pillar rotation ─────── */
  const pillarAnim = { y: 0 };

  gsap.to(pillarAnim, {
    y: Math.PI * 6, /* 3 full rotations across the whole page */
    ease: 'none',
    scrollTrigger: {
      trigger:  document.documentElement,
      start:    'top top',
      end:      'bottom bottom',
      scrub:    2.0, /* seconds of lag = silky easing */
    },
  });

  /* ── Mouse parallax ──────────────────────────────────────────────── */
  let targetCamX = 0;
  let targetCamY = 0;

  document.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    targetCamX =  mx * 2.8;
    targetCamY = -my * 1.8;
  });

  /* ── Resize ───────────────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.resolution.set(window.innerWidth, window.innerHeight);
  });

  /* ── Animation loop ───────────────────────────────────────────────── */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    /* scroll-driven rotation from GSAP + subtle idle drift */
    pillarGroup.rotation.y = pillarAnim.y + elapsed * 0.04;

    /* gentle vertical bob */
    pillarGroup.position.y = Math.sin(elapsed * 0.22) * 0.35;

    /* camera mouse parallax */
    camera.position.x += (targetCamX - camera.position.x) * 0.016;
    camera.position.y += (targetCamY - camera.position.y) * 0.016;
    camera.lookAt(0, 0, 0);

    /* particle cloud slow drift */
    particles.rotation.y = elapsed * 0.010;

    /* orbital rings */
    orbRings.forEach((ring) => {
      ring.rotation.y += ring.userData.speed * 0.003;
    });

    /* dynamic lights orbit around pillar */
    const la = elapsed * 0.18;
    fillLight.position.x  =  Math.cos(la) * 12;
    fillLight.position.z  =  10 + Math.sin(la) * 7;
    rimLight.position.x   =  Math.cos(la + Math.PI) * 12;
    rimLight.position.z   = -8 + Math.sin(la * 0.7) * 5;

    composer.render();
  }

  animate();
}
