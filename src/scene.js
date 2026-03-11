/* ========================================
   Background 3D Scene – Award-Worthy
   Scroll-driven rotating helix column with
   bloom, STL logo, particle galaxy & orbital rings
   ======================================== */

import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function initScene() {
  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return;

  /* ── Renderer ─────────────────────────────────────────────────────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  /* ── Scene & Camera ───────────────────────────────────────────────── */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.008);

  const camera = new THREE.PerspectiveCamera(
    55, window.innerWidth / window.innerHeight, 0.1, 500
  );
  camera.position.set(0, 8, 28);

  /* ── Post-Processing (Bloom) ──────────────────────────────────────── */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.7,   // strength
    0.35,  // radius
    0.82   // threshold
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  /* ── Lights ───────────────────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.12));

  const keyLight = new THREE.PointLight(0xffffff, 4, 160);
  keyLight.position.set(12, 22, 22);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xccccff, 2.5, 100);
  rimLight.position.set(-15, -10, 15);
  scene.add(rimLight);

  const bottomLight = new THREE.PointLight(0xffeedd, 2, 90);
  bottomLight.position.set(0, -30, 10);
  scene.add(bottomLight);

  /* ── Central Column (helix of geometric shapes) ───────────────────── */
  const columnGroup = new THREE.Group();
  scene.add(columnGroup);

  const COLUMN_HEIGHT    = 80;
  const COLUMN_RADIUS    = 4.5;
  const TURNS            = 6;
  const SHAPES_PER_TURN  = 10;
  const TOTAL_SHAPES     = TURNS * SHAPES_PER_TURN;

  const geos = [
    new THREE.IcosahedronGeometry(0.45, 0),
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TetrahedronGeometry(0.55, 0),
    new THREE.DodecahedronGeometry(0.4, 0),
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.TorusGeometry(0.32, 0.12, 8, 24),
  ];

  const columnMeshes = [];

  for (let i = 0; i < TOTAL_SHAPES; i++) {
    const t     = i / TOTAL_SHAPES;
    const angle = t * TURNS * Math.PI * 2;
    const y     = (t - 0.5) * COLUMN_HEIGHT;
    const r     = COLUMN_RADIUS + (Math.random() - 0.5) * 1.2;
    const x     = Math.cos(angle) * r;
    const z     = Math.sin(angle) * r;

    const geo    = geos[i % geos.length];
    const isGlow = i % 6 === 0;

    const mat = isGlow
      ? new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.55,
        })
      : new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0, 0, 0.7 + Math.random() * 0.3),
          metalness: 0.78 + Math.random() * 0.2,
          roughness: 0.06 + Math.random() * 0.14,
        });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);

    const s = 0.5 + Math.random() * 0.9;
    mesh.scale.set(s, s, s);

    mesh.userData = {
      baseAngle: angle,
      baseY: y,
      radius: r,
      rotSpeed: 0.004 + Math.random() * 0.008,
      floatPhase: Math.random() * Math.PI * 2,
    };

    columnGroup.add(mesh);
    columnMeshes.push(mesh);
  }

  /* ── Wireframe spine (central glowing cylinder) ───────────────────── */
  const spineGeo = new THREE.CylinderGeometry(0.25, 0.25, COLUMN_HEIGHT, 6, 50);
  const spineMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, wireframe: true, transparent: true, opacity: 0.05,
  });
  columnGroup.add(new THREE.Mesh(spineGeo, spineMat));

  /* ── Horizontal ring markers ──────────────────────────────────────── */
  for (let i = 0; i < 10; i++) {
    const ry   = ((i / 9) - 0.5) * COLUMN_HEIGHT;
    const rGeo = new THREE.TorusGeometry(COLUMN_RADIUS + 1.2, 0.018, 8, 80);
    const rMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.07,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.position.y = ry;
    ring.rotation.x = Math.PI / 2;
    columnGroup.add(ring);
  }

  /* ── Connecting lines between nearby helix shapes ─────────────────── */
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.04,
  });
  for (let i = 0; i < columnMeshes.length - 1; i++) {
    const a = columnMeshes[i].position;
    const b = columnMeshes[i + 1].position;
    const lineGeo = new THREE.BufferGeometry().setFromPoints([a, b]);
    columnGroup.add(new THREE.Line(lineGeo, lineMat));
  }

  /* ── STL Logo – centred in the helix ──────────────────────────────── */
  const stlLoader = new STLLoader();
  let logoMesh = null;
  let logoGlow = null;

  stlLoader.load(
    /* Vite resolves publicDir paths from root */
    import.meta.env.BASE_URL + 'assets/sv-logo.stl',
    (geometry) => {
      geometry.center();
      geometry.computeVertexNormals();

      const bbox = new THREE.Box3().setFromBufferAttribute(
        geometry.attributes.position
      );
      const size   = new THREE.Vector3();
      bbox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const sc     = 7 / maxDim;

      /* Solid metallic logo */
      const logoMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, metalness: 0.92, roughness: 0.08,
      });
      logoMesh = new THREE.Mesh(geometry, logoMat);
      logoMesh.scale.set(sc, sc, sc);
      columnGroup.add(logoMesh);

      /* Glow duplicate (bloom picks this up) */
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.12,
      });
      logoGlow = new THREE.Mesh(geometry, glowMat);
      logoGlow.scale.set(sc * 1.06, sc * 1.06, sc * 1.06);
      columnGroup.add(logoGlow);
    }
  );

  /* ── Particle galaxy (cylindrical cloud) ──────────────────────────── */
  const PARTICLE_COUNT = 2500;
  const pPos    = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 6 + Math.random() * 50;
    const y = (Math.random() - 0.5) * 140;
    pPos[i * 3]     = Math.cos(a) * r;
    pPos[i * 3 + 1] = y;
    pPos[i * 3 + 2] = Math.sin(a) * r;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

  const pMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.14, sizeAttenuation: true,
    transparent: true, opacity: 0.45,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* ── Orbital particle rings ───────────────────────────────────────── */
  const orbRings = [];
  for (let ri = 0; ri < 5; ri++) {
    const rad  = 9 + ri * 6;
    const cnt  = 180 + ri * 40;
    const rPos = new Float32Array(cnt * 3);

    for (let j = 0; j < cnt; j++) {
      const a = (j / cnt) * Math.PI * 2;
      rPos[j * 3]     = Math.cos(a) * rad + (Math.random() - 0.5) * 0.6;
      rPos[j * 3 + 1] = (Math.random() - 0.5) * 1.5;
      rPos[j * 3 + 2] = Math.sin(a) * rad + (Math.random() - 0.5) * 0.6;
    }

    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.BufferAttribute(rPos, 3));
    const rMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.07, sizeAttenuation: true,
      transparent: true, opacity: 0.28 - ri * 0.04,
    });
    const ring = new THREE.Points(rGeo, rMat);
    ring.userData = { speed: 0.08 + Math.random() * 0.15 };
    ring.rotation.x = (Math.random() - 0.5) * 0.35;
    scene.add(ring);
    orbRings.push(ring);
  }

  /* ── Floating accent meshes (far field) ───────────────────────────── */
  const farShapes = [];
  for (let i = 0; i < 14; i++) {
    const geo   = geos[i % geos.length];
    const isW   = i % 3 === 0;
    const mat   = isW
      ? new THREE.MeshBasicMaterial({
          color: 0xffffff, wireframe: true, transparent: true, opacity: 0.12,
        })
      : new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0, 0, 0.75 + Math.random() * 0.2),
          metalness: 0.8, roughness: 0.1,
        });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 50,
      -8 - Math.random() * 30
    );
    const fs = 0.4 + Math.random() * 1.2;
    mesh.scale.set(fs, fs, fs);
    mesh.userData = {
      rotSpeed:   0.002 + Math.random() * 0.006,
      floatSpeed: 0.15 + Math.random() * 0.4,
      floatAmp:   0.2 + Math.random() * 0.5,
      baseY:      mesh.position.y,
    };
    scene.add(mesh);
    farShapes.push(mesh);
  }

  /* ── Scroll tracking ──────────────────────────────────────────────── */
  let scrollProgress       = 0;
  let targetScrollProgress = 0;

  window.addEventListener('scroll', () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    targetScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  });

  /* ── Mouse parallax ──────────────────────────────────────────────── */
  let targetCamX = 0;
  let targetCamY = 0;

  document.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    targetCamX =  mx * 4;
    targetCamY = -my * 3;
  });

  /* ── Resize ───────────────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Animation loop ───────────────────────────────────────────────── */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    /* Smooth scroll easing */
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.045;

    /* ── Column rotation & vertical travel ── */
    columnGroup.rotation.y = scrollProgress * Math.PI * 4 + elapsed * 0.08;
    columnGroup.position.y = -scrollProgress * 18 + 4;

    /* ── Per-shape micro-animations ── */
    columnMeshes.forEach((m) => {
      const { rotSpeed, floatPhase, baseY } = m.userData;
      m.rotation.x += rotSpeed;
      m.rotation.z += rotSpeed * 0.6;
      m.position.y = baseY + Math.sin(elapsed * 0.7 + floatPhase) * 0.18;
    });

    /* ── Logo rotation ── */
    if (logoMesh) {
      logoMesh.rotation.y = elapsed * 0.25;
      logoMesh.rotation.x = Math.sin(elapsed * 0.18) * 0.12;
      if (logoGlow) {
        logoGlow.rotation.copy(logoMesh.rotation);
        logoGlow.position.copy(logoMesh.position);
      }
    }

    /* ── Particle cloud ── */
    particles.rotation.y = elapsed * 0.015 + scrollProgress * 1.2;

    /* ── Orbital rings ── */
    orbRings.forEach((ring) => {
      ring.rotation.y += ring.userData.speed * 0.004;
      ring.rotation.z  = Math.sin(elapsed * 0.08 + ring.userData.speed) * 0.06;
    });

    /* ── Far-field accent shapes ── */
    farShapes.forEach((m) => {
      const { rotSpeed, floatSpeed, floatAmp, baseY } = m.userData;
      m.rotation.x += rotSpeed * 0.8 + scrollProgress * 0.008;
      m.rotation.y += rotSpeed * 1.2;
      m.position.y  = baseY + Math.sin(elapsed * floatSpeed) * floatAmp;
    });

    /* ── Camera journey ── */
    const camZ = 28 - scrollProgress * 12;
    const camY = 8  - scrollProgress * 10;
    camera.position.z += (camZ - camera.position.z) * 0.035;
    camera.position.y += (camY - camera.position.y) * 0.035;
    camera.position.x += (targetCamX - camera.position.x) * 0.018;
    camera.position.y += (targetCamY * 0.4 - camera.position.y * 0.4) * 0.018;

    camera.lookAt(0, columnGroup.position.y + 2, 0);

    /* ── Dynamic lights ── */
    const la = elapsed * 0.2;
    keyLight.position.x = Math.cos(la) * 16;
    keyLight.position.z = 22 + Math.sin(la) * 9;
    rimLight.position.x = Math.cos(la + Math.PI) * 13;
    rimLight.position.y = Math.sin(la * 0.5) * 12;

    /* ── Bloom ramps with scroll ── */
    bloomPass.strength = 0.55 + scrollProgress * 0.65;

    composer.render();
  }

  animate();
}
