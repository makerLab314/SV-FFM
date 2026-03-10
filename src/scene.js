/* ========================================
   Background 3D Scene – scroll-driven
   OLED-black deep space with silver geometry
   ======================================== */

import * as THREE from 'three';

export function initScene() {
  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return;

  // Renderer – no alpha so we own the black bg (OLED)
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 0, 30);

  // ── Lights ──────────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.1));

  const keyLight = new THREE.PointLight(0xffffff, 3, 120);
  keyLight.position.set(12, 18, 25);
  scene.add(keyLight);

  const rimLight = new THREE.PointLight(0xaaaaaa, 2, 80);
  rimLight.position.set(-14, -8, 18);
  scene.add(rimLight);

  // Subtle warm accent – gives depth without colour
  const accentLight = new THREE.PointLight(0xffeedd, 1.5, 60);
  accentLight.position.set(0, -20, 10);
  scene.add(accentLight);

  // ── Star-field particles ─────────────────────────────────────────────
  const STAR_COUNT = 700;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPositions[i * 3]     = (Math.random() - 0.5) * 300;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    starPositions[i * 3 + 2] = -10 - Math.random() * 180;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75,
  });
  scene.add(new THREE.Points(starGeo, starMat));

  // ── Floating geometric shapes (silver / metallic white) ──────────────
  const shapes = [];
  const shapeGeometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.TorusGeometry(0.7, 0.22, 14, 32),
    new THREE.DodecahedronGeometry(0.8, 0),
    new THREE.TorusKnotGeometry(0.6, 0.2, 64, 8),
  ];

  // Solid metallic white material
  const solidMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.85,
    roughness: 0.12,
    envMapIntensity: 1.2,
  });

  // Wireframe material – clearly visible bright white
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });

  const DRIFT_BOUNDARY = 3; // units – how far a shape drifts from its base X before reversing

  for (let i = 0; i < 22; i++) {
    const geo = shapeGeometries[i % shapeGeometries.length];
    const isWire = i % 4 === 0;
    const mat = isWire ? wireMat.clone() : solidMat.clone();

    if (!isWire) {
      // Slight variation: mostly silver, some near-white
      const l = 0.75 + Math.random() * 0.2;
      mat.color = new THREE.Color().setHSL(0, 0, l);
      mat.metalness = 0.7 + Math.random() * 0.25;
      mat.roughness = 0.08 + Math.random() * 0.2;
    }

    const mesh = new THREE.Mesh(geo, mat);

    const spreadX = 55;
    const spreadY = 45;
    mesh.position.set(
      (Math.random() - 0.5) * spreadX,
      (Math.random() - 0.5) * spreadY,
      -2 - Math.random() * 28
    );

    const s = 0.5 + Math.random() * 1.6;
    mesh.scale.set(s, s, s);

    mesh.userData = {
      baseY:       mesh.position.y,
      baseX:       mesh.position.x,
      rotSpeed:    0.003 + Math.random() * 0.009,
      floatSpeed:  0.2  + Math.random() * 0.5,
      floatAmp:    0.25 + Math.random() * 0.55,
      driftSpeed:  (Math.random() - 0.5) * 0.002,
    };

    scene.add(mesh);
    shapes.push(mesh);
  }

  // ── Scroll tracking ───────────────────────────────────────────────────
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  });

  // ── Mouse parallax ────────────────────────────────────────────────────
  let mouseX = 0;
  let mouseY = 0;
  let targetCamX = 0;
  let targetCamY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    targetCamX = mouseX * 3.5;
    targetCamY = -mouseY * 2.5;
  });

  // ── Resize ────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animation loop ────────────────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    shapes.forEach((mesh) => {
      const { rotSpeed, floatSpeed, floatAmp, baseY, driftSpeed } = mesh.userData;
      mesh.rotation.x += rotSpeed * 0.9 + scrollProgress * 0.012;
      mesh.rotation.y += rotSpeed * 1.4;
      mesh.rotation.z += rotSpeed * 0.3;
      mesh.position.y = baseY + Math.sin(elapsed * floatSpeed) * floatAmp;
      // subtle horizontal drift
      mesh.position.x += driftSpeed;
      if (Math.abs(mesh.position.x - mesh.userData.baseX) > DRIFT_BOUNDARY) {
        mesh.userData.driftSpeed *= -1;
      }
    });

    // Smooth camera scroll: fly deeper into the scene
    const targetZ = 30 - scrollProgress * 22;
    camera.position.z += (targetZ - camera.position.z) * 0.04;
    camera.rotation.x = scrollProgress * 0.18;

    // Smooth mouse parallax
    camera.position.x += (targetCamX - camera.position.x) * 0.025;
    camera.position.y += (targetCamY - camera.position.y) * 0.025;

    // Rotate the light slowly for shifting specular reflections
    const angle = elapsed * 0.3;
    keyLight.position.x = Math.cos(angle) * 18;
    keyLight.position.z = 25 + Math.sin(angle) * 8;

    renderer.render(scene, camera);
  }

  animate();
}
