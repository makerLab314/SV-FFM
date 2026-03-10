/* ========================================
   Background 3D Scene – scroll-driven
   Rotating geometry with depth
   ======================================== */

import * as THREE from 'three';

export function initScene() {
  const canvas = document.getElementById('scene-canvas');
  if (!canvas) return;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 30);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
  pointLight.position.set(10, 10, 20);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0x888888, 1.0, 100);
  pointLight2.position.set(-10, -5, 15);
  scene.add(pointLight2);

  // Create floating geometric shapes
  const shapes = [];
  const geometries = [
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.TorusGeometry(0.7, 0.25, 12, 24),
    new THREE.DodecahedronGeometry(0.8, 0),
  ];

  const material = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.7,
    roughness: 0.2,
    wireframe: false,
  });

  const wireframeMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555,
    wireframe: true,
    transparent: true,
    opacity: 0.25,
  });

  for (let i = 0; i < 18; i++) {
    const geo = geometries[i % geometries.length];
    const mat = i % 3 === 0 ? wireframeMaterial.clone() : material.clone();

    if (i % 3 !== 0) {
      const HUE_RANGE = 0.02;
      const LIGHTNESS_BASE = 0.18;
      const LIGHTNESS_RANGE = 0.15;
      mat.color = new THREE.Color().setHSL(Math.random() * HUE_RANGE, 0.0, LIGHTNESS_BASE + Math.random() * LIGHTNESS_RANGE);
    }

    const mesh = new THREE.Mesh(geo, mat);

    const spread = 40;
    mesh.position.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * 20 - 5
    );

    const s = 0.4 + Math.random() * 1.2;
    mesh.scale.set(s, s, s);

    mesh.userData = {
      baseY: mesh.position.y,
      rotSpeed: 0.002 + Math.random() * 0.008,
      floatSpeed: 0.3 + Math.random() * 0.7,
      floatAmp: 0.3 + Math.random() * 0.6,
    };

    scene.add(mesh);
    shapes.push(mesh);
  }

  // Scroll tracking
  let scrollProgress = 0;
  window.addEventListener('scroll', () => {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  });

  // Mouse parallax
  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animate
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Rotate shapes based on scroll + time
    shapes.forEach((mesh) => {
      const { rotSpeed, floatSpeed, floatAmp, baseY } = mesh.userData;
      mesh.rotation.x += rotSpeed + scrollProgress * 0.01;
      mesh.rotation.y += rotSpeed * 1.3;
      mesh.position.y = baseY + Math.sin(elapsed * floatSpeed) * floatAmp;
    });

    // Camera follows scroll depth
    camera.position.z = 30 - scrollProgress * 15;
    camera.rotation.x = scrollProgress * 0.15;

    // Mouse parallax
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.02;

    renderer.render(scene, camera);
  }

  animate();
}
