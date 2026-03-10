/* ========================================
   3D Logo – top-left corner (STL)
   Follows cursor rotation
   ======================================== */

import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export function initLogo3D() {
  const canvas = document.getElementById('logo-canvas');
  if (!canvas) return;

  const width = 64;
  const height = 64;

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

  // Load STL
  const loader = new STLLoader();
  let logoMesh = null;

  loader.load('/assets/sv-logo.stl', (geometry) => {
    geometry.center();
    geometry.computeVertexNormals();

    // Scale so it fits in view
    const bbox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.2 / maxDim;

    const material = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.5,
      roughness: 0.3,
    });

    logoMesh = new THREE.Mesh(geometry, material);
    logoMesh.scale.set(scale, scale, scale);
    scene.add(logoMesh);
  });

  // Track mouse for rotation
  let targetRotX = 0;
  let targetRotY = 0;

  document.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetRotY = nx * 0.6;
    targetRotX = -ny * 0.4;
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
