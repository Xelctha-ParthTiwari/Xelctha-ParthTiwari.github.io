import * as THREE from 'three';

const canvas = document.getElementById('three-canvas');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 7;

  const VIOLET = 0x8b5cf6;
  const BLUE = 0x4f7fff;
  const LAVENDER = 0xa78bfa;
  const SKY = 0x60a5fa;

  function wireMat(color, opacity) {
    return new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  }

  function makeLineMesh(geom, color, opacity) {
    const edges = new THREE.EdgesGeometry(geom);
    const mesh = new THREE.LineSegments(edges, wireMat(color, opacity));
    scene.add(mesh);
    return mesh;
  }

  const verts = [];
  for (let i = 0; i < 16; i++) {
    verts.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1
    ]);
  }
  const tEdges = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const d = i ^ j;
      if ((d & (d - 1)) === 0) tEdges.push([i, j]);
    }
  }

  const tGeom = new THREE.BufferGeometry();
  tGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tEdges.length * 6), 3));
  const tesseract = new THREE.LineSegments(tGeom, wireMat(VIOLET, 0.32));
  scene.add(tesseract);
  const tPos = tGeom.attributes.position;

  const halo = new THREE.LineSegments(
    tGeom.clone(),
    wireMat(BLUE, 0.08)
  );
  halo.scale.set(1.35, 1.35, 1.35);
  scene.add(halo);

  const torusKnot = makeLineMesh(
    new THREE.TorusKnotGeometry(0.9, 0.24, 90, 10, 2, 3),
    BLUE, 0.20
  );
  torusKnot.position.set(3.1, -1.2, -1.2);

  const dodeca = makeLineMesh(
    new THREE.DodecahedronGeometry(0.85, 0),
    LAVENDER, 0.22
  );
  dodeca.position.set(-3.2, 1.6, -1);

  const octa = makeLineMesh(
    new THREE.OctahedronGeometry(0.6, 0),
    SKY, 0.28
  );
  octa.position.set(-2.4, -1.8, 0.4);

  const icosa = makeLineMesh(
    new THREE.IcosahedronGeometry(0.5, 0),
    VIOLET, 0.26
  );
  icosa.position.set(2.2, 1.9, 0.3);

  const ring = makeLineMesh(
    new THREE.TorusGeometry(2.6, 0.008, 6, 120),
    VIOLET, 0.14
  );
  ring.rotation.x = Math.PI * 0.55;
  ring.rotation.y = Math.PI * 0.15;

  const ring2 = makeLineMesh(
    new THREE.TorusGeometry(3.4, 0.006, 6, 140),
    BLUE, 0.10
  );
  ring2.rotation.x = -Math.PI * 0.35;
  ring2.rotation.z = Math.PI * 0.2;

  const starCount = 180;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3]     = (Math.random() - 0.5) * 16;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 3;
  }
  const starGeom = new THREE.BufferGeometry();
  starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: LAVENDER, size: 0.035, transparent: true, opacity: 0.55, sizeAttenuation: true
  });
  const stars = new THREE.Points(starGeom, starMat);
  scene.add(stars);

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

  const projected = new Array(16);

  function project(v, ax, ay, scale) {
    let x = v[0] * scale, y = v[1] * scale, z = v[2] * scale, w = v[3] * scale;

    const cx = Math.cos(ax), sx = Math.sin(ax);
    const x1 = x * cx - w * sx;
    const w1 = x * sx + w * cx;
    x = x1; w = w1;

    const cy = Math.cos(ay), sy = Math.sin(ay);
    const y1 = y * cy - w * sy;
    const w2 = y * sy + w * cy;
    y = y1; w = w2;

    const dist = 3.2;
    const k = dist / (dist - w * 0.55);
    return [x * k, y * k, z * k];
  }

  let t = 0;

  (function animate() {
    t += 0.004;
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;

    const ax = t * 0.36 + px * 0.55;
    const ay = t * 0.29 + py * 0.55;

    for (let i = 0; i < 16; i++) projected[i] = project(verts[i], ax, ay, 1.55);

    const arr = tPos.array;
    for (let e = 0; e < tEdges.length; e++) {
      const va = projected[tEdges[e][0]];
      const vb = projected[tEdges[e][1]];
      const i = e * 6;
      arr[i]     = va[0]; arr[i + 1] = va[1]; arr[i + 2] = va[2];
      arr[i + 3] = vb[0]; arr[i + 4] = vb[1]; arr[i + 5] = vb[2];
    }
    tPos.needsUpdate = true;

    torusKnot.rotation.x = t * 0.5 + py * 0.4;
    torusKnot.rotation.y = t * 0.7 + px * 0.5;
    torusKnot.rotation.z = t * 0.3;

    dodeca.rotation.x = -t * 0.3 + py * 0.3;
    dodeca.rotation.y = t * 0.45 + px * 0.35;

    octa.rotation.x = t * 0.8;
    octa.rotation.y = -t * 0.5 + px * 0.4;

    icosa.rotation.x = -t * 0.6 + py * 0.35;
    icosa.rotation.y = t * 0.4;

    ring.rotation.z = t * 0.25 + px * 0.2;
    ring2.rotation.y = -t * 0.2 + py * 0.25;

    stars.rotation.y = t * 0.08 + px * 0.15;
    stars.rotation.x = -t * 0.05 + py * 0.1;

    const drift = Math.sin(t * 1.2) * 0.15;
    tesseract.position.y = drift;
    halo.position.y = drift;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();

}