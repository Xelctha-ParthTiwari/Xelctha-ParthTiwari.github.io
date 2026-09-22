import * as THREE from 'three';

const canvas = document.getElementById('three-canvas');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 6;

  const verts = [];
  for (let i = 0; i < 16; i++) {
    verts.push([
      (i & 1) ? 1 : -1,
      (i & 2) ? 1 : -1,
      (i & 4) ? 1 : -1,
      (i & 8) ? 1 : -1
    ]);
  }

  const edges = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      const diff = i ^ j;
      if ((diff & (diff - 1)) === 0) edges.push([i, j]);
    }
  }

  function makeTesseract(color, opacity, scale) {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3));
    const mat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity });
    const mesh = new THREE.LineSegments(geom, mat);
    mesh.scale.set(scale, scale, scale);
    scene.add(mesh);
    return mesh;
  }

  const inner = makeTesseract(0x8b5cf6, 0.22, 1.8);
  const outer = makeTesseract(0x4f7fff, 0.08, 2.0);

  const innerPos = inner.geometry.attributes.position;
  const outerPos = outer.geometry.attributes.position;

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

  function project(v, ax, ay) {
    let x = v[0], y = v[1], z = v[2], w = v[3];

    const cx = Math.cos(ax), sx = Math.sin(ax);
    const x1 = x * cx - w * sx;
    const w1 = x * sx + w * cx;
    x = x1; w = w1;

    const cy = Math.cos(ay), sy = Math.sin(ay);
    const y1 = y * cy - w * sy;
    const w2 = y * sy + w * cy;
    y = y1; w = w2;

    const dist = 2.5;
    const k = dist / (dist - w * 0.6);
    return [x * k, y * k, z * k];
  }

  let t = 0;

  (function animate() {
    t += 0.004;
    px += (tx - px) * 0.04;
    py += (ty - py) * 0.04;

    const ax = t * 0.35 + px * 0.5;
    const ay = t * 0.28 + py * 0.5;

    for (let i = 0; i < 16; i++) {
      projected[i] = project(verts[i], ax, ay);
    }

    const aIn = innerPos.array;
    const aOut = outerPos.array;

    for (let e = 0; e < edges.length; e++) {
      const va = projected[edges[e][0]];
      const vb = projected[edges[e][1]];
      const i = e * 6;
      aIn[i] = va[0]; aIn[i + 1] = va[1]; aIn[i + 2] = va[2];
      aIn[i + 3] = vb[0]; aIn[i + 4] = vb[1]; aIn[i + 5] = vb[2];
      aOut[i] = va[0]; aOut[i + 1] = va[1]; aOut[i + 2] = va[2];
      aOut[i + 3] = vb[0]; aOut[i + 4] = vb[1]; aOut[i + 5] = vb[2];
    }

    innerPos.needsUpdate = true;
    outerPos.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();

}