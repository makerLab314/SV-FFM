/* ========================================
   3D Logo – top-left corner (STL)
   Only rotates on hover over the canvas
   ======================================== */

import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export function initLogo3D() {
  const canvas = document.getElementById('logo-canvas');
  if (!canvas) return;

  const width = 100;
  const height = 100;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 4);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(2, 3, 4);
  scene.add(dirLight);

  const backLight = new THREE.DirectionalLight(0x888888, 0.5);
  backLight.position.set(-2, -1, -2);
  scene.add(backLight);

  // Warm accent light
  const warmLight = new THREE.PointLight(0xd4a853, 0.4, 20);
  warmLight.position.set(1, -1, 3);
  scene.add(warmLight);

  // Load STL
  const loader = new STLLoader();
  let logoMesh = null;

  loader.load(import.meta.env.BASE_URL + 'assets/sv-logo.stl', (geometry) => {
    geometry.center();
    geometry.computeVertexNormals();

    // Scale so it fits in view
    const bbox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.4 / maxDim;

    const material = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.55,
      roughness: 0.25,
    });

    logoMesh = new THREE.Mesh(geometry, material);
    logoMesh.scale.set(scale, scale, scale);
    scene.add(logoMesh);
  });

  // Track hover state and mouse position over the canvas
  let isHovered = false;
  let targetRotX = 0;
  let targetRotY = 0;

  canvas.addEventListener('mouseenter', () => {
    isHovered = true;
  });

  canvas.addEventListener('mouseleave', () => {
    isHovered = false;
    // Reset rotation target when leaving
    targetRotX = 0;
    targetRotY = 0;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isHovered) return;
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetRotY = nx * 0.8;
    targetRotX = -ny * 0.5;
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    if (logoMesh) {
      logoMesh.rotation.x += (targetRotX - logoMesh.rotation.x) * 0.06;
      logoMesh.rotation.y += (targetRotY - logoMesh.rotation.y) * 0.06;
    }

    renderer.render(scene, camera);
  }

  animate();
}
