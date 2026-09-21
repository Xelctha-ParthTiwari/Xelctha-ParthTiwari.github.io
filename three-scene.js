import * as THREE from 'three';

const canvas = document.getElementById('three-canvas');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 6;

  const geoA = new THREE.IcosahedronGeometry(2.2, 1);
  const matA = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.16
  });
  const meshA = new THREE.Mesh(geoA, matA);
  scene.add(meshA);

  const torus = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.05, 0.02, 160, 16),
    new THREE.MeshBasicMaterial({ color: 0x4f7fff, transparent: true, opacity: 0.22, wireframe: true })
  );
  torus.position.set(2.6, -1.2, -1);
  scene.add(torus);

  const meshC = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.95, 0),
    new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: 0.24 })
  );
  meshC.position.set(-2.8, 1.4, -1);
  scene.add(meshC);

  let tx = 0, ty = 0, px = 0, py = 0;

  window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / window.innerWidth) * 2 - 1;
    ty = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma == null || e.beta == null) return;
    tx = Math.max(-1, Math.min(1, e.gamma / 45));
    ty = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
  });

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t = 0;
  (function animate() {
    t += 0.005;
    px += (tx - px) * 0.04;
    py += (ty - py) * 0.04;
    meshA.rotation.x = t * 0.4 + py * 0.5;
    meshA.rotation.y = t * 0.6 + px * 0.6;
    torus.rotation.x = -t * 0.3 + py * 0.4;
    torus.rotation.y = t * 0.5 + px * 0.4;
    meshC.rotation.x = t * 0.5 - py * 0.3;
    meshC.rotation.y = t * 0.35 - px * 0.4;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();

}