import * as THREE from 'three';

const canvas = document.getElementById('three-canvas');
if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

  const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  const CAM_BASE_Z = 7;
  camera.position.z = CAM_BASE_Z;

  const VIOLET = 0x8b5cf6;
  const BLUE = 0x4f7fff;
  const LAVENDER = 0xa78bfa;
  const SKY = 0x60a5fa;

  const trackables = [];

  function lineMat(opacity) {
    return new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false
    });
  }

  function gradientEdges(geom, colorA, colorB, opacity) {
    const edges = new THREE.EdgesGeometry(geom);
    const pos = edges.getAttribute('position');
    const count = pos.count;
    const colors = new Float32Array(count * 3);
    const ca = new THREE.Color(colorA);
    const cb = new THREE.Color(colorB);
    for (let i = 0; i < count; i += 2) {
      colors[i * 3]     = ca.r; colors[i * 3 + 1] = ca.g; colors[i * 3 + 2] = ca.b;
      colors[i * 3 + 3] = cb.r; colors[i * 3 + 4] = cb.g; colors[i * 3 + 5] = cb.b;
    }
    edges.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mesh = new THREE.LineSegments(edges, lineMat(opacity));
    trackables.push(mesh);
    return mesh;
  }

  function gradientSegments(segments, colorA, colorB, opacity) {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segments), 3));
    const count = segments.length / 3;
    const colors = new Float32Array(count * 3);
    const ca = new THREE.Color(colorA);
    const cb = new THREE.Color(colorB);
    for (let i = 0; i < count; i += 2) {
      colors[i * 3]     = ca.r; colors[i * 3 + 1] = ca.g; colors[i * 3 + 2] = ca.b;
      colors[i * 3 + 3] = cb.r; colors[i * 3 + 4] = cb.g; colors[i * 3 + 5] = cb.b;
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mesh = new THREE.LineSegments(geom, lineMat(opacity));
    trackables.push(mesh);
    return mesh;
  }

  function drift(t, seed, amp) {
    return (Math.sin(t * 0.7 + seed) * 0.6 + Math.sin(t * 1.3 + seed * 1.7) * 0.4) * amp;
  }

  // ---- Backdrop: Flower of Life (feature 5) ----
  {
    const segs = [];
    const rings = [[0, 0]];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      rings.push([Math.cos(a) * 1, Math.sin(a) * 1]);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      rings.push([Math.cos(a) * 2, Math.sin(a) * 2]);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      rings.push([Math.cos(a) * Math.sqrt(3), Math.sin(a) * Math.sqrt(3)]);
    }
    const r = 1;
    const steps = 26;
    rings.forEach(([cx, cy]) => {
      for (let j = 0; j < steps; j++) {
        const a1 = (j / steps) * Math.PI * 2;
        const a2 = ((j + 1) / steps) * Math.PI * 2;
        segs.push(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r, 0);
        segs.push(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r, 0);
      }
    });
    const mesh = gradientSegments(segs, VIOLET, BLUE, 0.045);
    mesh.position.set(0, 0, -15);
    mesh.scale.set(1.6, 1.6, 1.6);
    scene.add(mesh);
  }

  // ---- Backdrop: Metatron's Cube (feature 4) ----
  {
    const segs = [];
    const pts = [[0, 0]];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      pts.push([Math.cos(a), Math.sin(a)]);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      pts.push([Math.cos(a) * 2, Math.sin(a) * 2]);
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        segs.push(pts[i][0], pts[i][1], 0, pts[j][0], pts[j][1], 0);
      }
    }
    const mesh = gradientSegments(segs, LAVENDER, VIOLET, 0.055);
    mesh.position.set(0, 0, -11);
    mesh.scale.set(0.9, 0.9, 0.9);
    scene.add(mesh);
  }

  // ---- God rays (feature 2) ----
  {
    const c = document.createElement('canvas');
    c.width = 4; c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, 'rgba(139,92,246,0)');
    grad.addColorStop(0.5, 'rgba(167,139,250,0.55)');
    grad.addColorStop(1, 'rgba(139,92,246,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 256);
    const tex = new THREE.CanvasTexture(c);

    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const geo = new THREE.PlaneGeometry(0.35, 22);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(-3 + i * 2.2, 1, -9);
      mesh.rotation.z = -0.35;
      scene.add(mesh);
    }
  }

  // ---- Golden spiral (feature 7) ----
  {
    const pts = [];
    for (let i = 0; i < 260; i++) {
      const theta = (i / 260) * Math.PI * 6;
      const r = 0.1 * Math.exp(0.18 * theta);
      if (r > 4.5) break;
      pts.push(Math.cos(theta) * r, Math.sin(theta) * r, 0);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const mat = new THREE.PointsMaterial({
      color: SKY,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    const mesh = new THREE.Points(geom, mat);
    mesh.position.set(2.8, 0.4, -7);
    mesh.rotation.z = 0.6;
    scene.add(mesh);
  }

  // ---- Star field (feature 3: twinkling) ----
  let starPhases;
  {
    const count = isMobile ? 120 : 220;
    const pos = new Float32Array(count * 3);
    starPhases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;
      starPhases[i] = Math.random() * Math.PI * 2;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: LAVENDER,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(geom, mat);
    scene.add(stars);
    stars.userData.phases = starPhases;
    trackables.push(stars);
  }

  // ---- Kepler's nested solids (feature 6) ----
  const keplerGroup = new THREE.Group();
  {
    const solids = [
      { geo: new THREE.OctahedronGeometry(0.95, 0), s: 1.0 },
      { geo: new THREE.IcosahedronGeometry(0.78, 0), s: 0.8 },
      { geo: new THREE.DodecahedronGeometry(0.62, 0), s: 0.6 },
      { geo: new THREE.TetrahedronGeometry(0.48, 0), s: 0.45 },
      { geo: new THREE.BoxGeometry(0.68, 0.68, 0.68), s: 0.33 }
    ];
    solids.forEach((s, i) => {
      const mesh = gradientEdges(s.geo, i % 2 === 0 ? VIOLET : BLUE, i % 2 === 0 ? BLUE : VIOLET, 0.32);
      mesh.userData.spin = 0.1 + i * 0.05;
      mesh.userData.spinDir = i % 2 === 0 ? 1 : -1;
      keplerGroup.add(mesh);
    });
    keplerGroup.position.set(-3.4, -1.4, -3);
    scene.add(keplerGroup);
  }

  // ---- Tesseract (feature 15: gradient edges) + chromatic halo (feature 18) ----
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
  const tColors = new Float32Array(tEdges.length * 6);
  {
    const ca = new THREE.Color(VIOLET);
    const cb = new THREE.Color(SKY);
    for (let e = 0; e < tEdges.length; e++) {
      const i = e * 6;
      tColors[i]     = ca.r; tColors[i + 1] = ca.g; tColors[i + 2] = ca.b;
      tColors[i + 3] = cb.r; tColors[i + 4] = cb.g; tColors[i + 5] = cb.b;
    }
  }
  tGeom.setAttribute('color', new THREE.BufferAttribute(tColors, 3));
  const tPos = tGeom.attributes.position;

  const tesseract = new THREE.LineSegments(tGeom, lineMat(0.42));
  scene.add(tesseract);

  const haloR = new THREE.LineSegments(
    tGeom.clone(),
    new THREE.LineBasicMaterial({
      color: 0xff4a6b, transparent: true, opacity: 0.10,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false
    })
  );
  haloR.scale.set(1.02, 1.02, 1.02);
  scene.add(haloR);

  const haloB = new THREE.LineSegments(
    tGeom.clone(),
    new THREE.LineBasicMaterial({
      color: 0x4fc8ff, transparent: true, opacity: 0.10,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false
    })
  );
  haloB.scale.set(0.98, 0.98, 0.98);
  scene.add(haloB);

  const haloSoft = new THREE.LineSegments(
    tGeom.clone(),
    new THREE.LineBasicMaterial({
      color: BLUE, transparent: true, opacity: 0.06,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false
    })
  );
  haloSoft.scale.set(1.4, 1.4, 1.4);
  scene.add(haloSoft);

  // ---- Orbital objects (feature 12 + 14: orbit + noise drift) ----
  const orbital = [];

  function addOrbital(geom, colorA, colorB, opacity, opts) {
    const mesh = gradientEdges(geom, colorA, colorB, opacity);
    scene.add(mesh);
    orbital.push({
      mesh: mesh,
      r: opts.r,
      speed: opts.speed,
      phase: opts.phase,
      incl: opts.incl || 0,
      amp: opts.amp || 0.5,
      noise: opts.noise,
      spin: opts.spin || 1,
      baseScale: 1
    });
    return mesh;
  }

  addOrbital(new THREE.TorusKnotGeometry(0.62, 0.18, 80, 8, 2, 3), VIOLET, BLUE, 0.28,
    { r: 3.6, speed: 0.22, phase: 0.0, incl: 0.35, amp: 0.9, noise: 1.3, spin: 1.4 });
  addOrbital(new THREE.DodecahedronGeometry(0.62, 0), LAVENDER, VIOLET, 0.28,
    { r: 4.0, speed: -0.18, phase: 1.6, incl: -0.5, amp: 1.1, noise: 2.7, spin: 0.9 });
  addOrbital(new THREE.OctahedronGeometry(0.48, 0), SKY, LAVENDER, 0.34,
    { r: 3.2, speed: 0.32, phase: 3.1, incl: 0.6, amp: 0.7, noise: 4.1, spin: 1.8 });
  addOrbital(new THREE.IcosahedronGeometry(0.42, 0), VIOLET, SKY, 0.34,
    { r: 2.8, speed: -0.28, phase: 4.4, incl: -0.25, amp: 0.6, noise: 5.5, spin: 1.2 });
  addOrbital(new THREE.TetrahedronGeometry(0.5, 0), BLUE, LAVENDER, 0.30,
    { r: 3.4, speed: 0.26, phase: 5.7, incl: 0.2, amp: 0.8, noise: 6.9, spin: 1.6 });
  addOrbital(new THREE.BoxGeometry(0.55, 0.55, 0.55), SKY, VIOLET, 0.28,
    { r: 3.8, speed: -0.24, phase: 0.8, incl: -0.4, amp: 1.0, noise: 8.3, spin: 1.0 });

  // ---- Rings ----
  const ring1 = gradientEdges(new THREE.TorusGeometry(2.6, 0.008, 6, 120), VIOLET, BLUE, 0.18);
  ring1.rotation.x = Math.PI * 0.55;
  ring1.rotation.y = Math.PI * 0.15;
  scene.add(ring1);

  const ring2 = gradientEdges(new THREE.TorusGeometry(3.4, 0.006, 6, 140), BLUE, LAVENDER, 0.13);
  ring2.rotation.x = -Math.PI * 0.35;
  ring2.rotation.z = Math.PI * 0.2;
  scene.add(ring2);

  // ---- Click echoes (feature 10) ----
  const echoes = [];
  {
    const echoPool = 8;
    for (let i = 0; i < echoPool; i++) {
      const mesh = gradientEdges(new THREE.OctahedronGeometry(0.3, 0), VIOLET, SKY, 0.9);
      mesh.visible = false;
      scene.add(mesh);
      echoes.push({ mesh: mesh, life: 0, active: false });
    }
  }

  // ---- Constellation links (feature 9) ----
  const linkGeom = new THREE.BufferGeometry();
  const maxLinks = 20;
  linkGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(maxLinks * 6), 3));
  const linkMesh = new THREE.LineSegments(
    linkGeom,
    new THREE.LineBasicMaterial({
      color: LAVENDER, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false
    })
  );
  linkMesh.frustumCulled = false;
  scene.add(linkMesh);

  // ---- Pointer ----
  const pointer = { x: -9999, y: -9999, nx: 0, ny: 0, active: false };
  const ndc = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const zPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hitPoint = new THREE.Vector3();
  let targetX = 0, targetY = 0, lerpX = 0, lerpY = 0;

  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = -(e.clientY / window.innerHeight) * 2 + 1;
    pointer.active = true;
    targetX = pointer.nx;
    targetY = pointer.ny;
  });

  window.addEventListener('pointerdown', (e) => {
    ndc.set(pointer.nx, pointer.ny);
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(zPlane, hitPoint)) {
      const free = echoes.find(echo => !echo.active);
      if (free) {
        free.mesh.position.copy(hitPoint);
        free.mesh.visible = true;
        free.life = 1;
        free.active = true;
      }
    }
  });

  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null || e.beta == null) return;
    targetX = Math.max(-1, Math.min(1, e.gamma / 45));
    targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
  });

  // ---- Scroll-reactive camera (feature 11) ----
  let scrollZ = 0;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    scrollZ = p * 4.5;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const projected = new Array(16);
  const screenPos = new THREE.Vector3();

  function project4D(v, ax, ay, scale) {
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
    lerpX += (targetX - lerpX) * 0.05;
    lerpY += (targetY - lerpY) * 0.05;

    camera.position.z = CAM_BASE_Z + scrollZ;
    camera.position.x = lerpX * 0.4;
    camera.position.y = lerpY * 0.3;
    camera.lookAt(0, 0, 0);

    // Tesseract 4D projection
    const ax = t * 0.36 + lerpX * 0.55;
    const ay = t * 0.29 + lerpY * 0.55;
    for (let i = 0; i < 16; i++) projected[i] = project4D(verts[i], ax, ay, 1.55);

    const tArr = tPos.array;
    for (let e = 0; e < tEdges.length; e++) {
      const va = projected[tEdges[e][0]];
      const vb = projected[tEdges[e][1]];
      const i = e * 6;
      tArr[i]     = va[0]; tArr[i + 1] = va[1]; tArr[i + 2] = va[2];
      tArr[i + 3] = vb[0]; tArr[i + 4] = vb[1]; tArr[i + 5] = vb[2];
    }
    tPos.needsUpdate = true;

    // Breathing (feature 13)
    const breath = 1 + Math.sin(t * 1.6) * 0.03;
    tesseract.scale.setScalar(breath);
    haloR.scale.setScalar(breath * 1.02);
    haloB.scale.setScalar(breath * 0.98);
    haloSoft.scale.setScalar(breath * 1.4);

    const dropDrift = Math.sin(t * 1.2) * 0.12;
    tesseract.position.y = dropDrift;
    haloR.position.y = dropDrift;
    haloB.position.y = dropDrift;
    haloSoft.position.y = dropDrift;

    // Orbital objects with orbit + noise drift (features 12 + 14)
    orbital.forEach((o, idx) => {
      const a = t * o.speed + o.phase;
      const nx = drift(t, o.noise, 0.35);
      const ny = drift(t, o.noise + 100, 0.28);
      const nz = drift(t, o.noise + 200, 0.35);
      const ox = Math.cos(a) * o.r + nx;
      const oy = Math.sin(a) * o.r * Math.sin(o.incl) + ny + dropDrift * 0.3;
      const oz = Math.sin(a) * o.r * Math.cos(o.incl) * 0.35 + nz;
      o.mesh.position.set(ox, oy, oz);
      o.mesh.rotation.x = t * 0.5 * o.spin + ny;
      o.mesh.rotation.y = t * 0.7 * o.spin + nx;
      o.mesh.rotation.z = t * 0.3 * o.spin;
      const breathe = 1 + Math.sin(t * 1.4 + idx) * 0.06;
      o.mesh.scale.setScalar(breathe);
    });

    // Rings
    ring1.rotation.z = t * 0.15 + lerpX * 0.2;
    ring2.rotation.y = -t * 0.12 + lerpY * 0.25;

    // Kepler rotation
    keplerGroup.rotation.y = t * 0.3 + lerpX * 0.4;
    keplerGroup.rotation.x = t * 0.2 + lerpY * 0.3;
    keplerGroup.children.forEach((m) => {
      m.rotation.x += 0.0015 * m.userData.spinDir;
      m.rotation.y += 0.0018 * m.userData.spinDir;
    });

    // Cursor light source (feature 8)
    if (!isMobile) {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      trackables.forEach((m) => {
        if (!m.material || m.material.opacity === undefined) return;
        m.getWorldPosition(screenPos);
        screenPos.project(camera);
        const sx = screenPos.x * halfW + halfW;
        const sy = -screenPos.y * halfH + halfH;
        const dx = sx - pointer.x;
        const dy = sy - pointer.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const baseOpacity = m.userData.baseOpacity || m.material.opacity;
        if (!m.userData.baseOpacity) m.userData.baseOpacity = m.material.opacity;
        const boost = Math.max(0, 1 - d / 260);
        m.material.opacity = m.userData.baseOpacity * (1 + boost * 1.6);
      });
    }

    // Star twinkle (feature 3)
    const stars = trackables.find((m) => m.isPoints);
    if (stars && stars.userData.phases) {
      const phases = stars.userData.phases;
      stars.material.size = 0.05 + Math.sin(t * 2.4) * 0.008;
      stars.material.opacity = 0.6 + Math.sin(t * 1.7) * 0.12;
      stars.rotation.y = t * 0.06 + lerpX * 0.12;
      stars.rotation.x = -t * 0.04 + lerpY * 0.08;
    }

    // Constellation links between orbital meshes (feature 9)
    const arr = linkGeom.attributes.position.array;
    let used = 0;
    for (let i = 0; i < orbital.length && used < maxLinks; i++) {
      for (let j = i + 1; j < orbital.length && used < maxLinks; j++) {
        const a = orbital[i].mesh.position;
        const b = orbital[j].mesh.position;
        const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < 3.0) {
          const k = used * 6;
          arr[k]     = a.x; arr[k + 1] = a.y; arr[k + 2] = a.z;
          arr[k + 3] = b.x; arr[k + 4] = b.y; arr[k + 5] = b.z;
          used++;
        }
      }
    }
    for (let k = used * 6; k < arr.length; k++) arr[k] = 0;
    linkGeom.attributes.position.needsUpdate = true;
    linkMesh.material.opacity = used > 0 ? 0.2 : 0;

    // Click echoes (feature 10)
    echoes.forEach((echo) => {
      if (!echo.active) return;
      echo.life -= 0.018;
      if (echo.life <= 0) {
        echo.active = false;
        echo.mesh.visible = false;
        return;
      }
      const grow = 1 + (1 - echo.life) * 4;
      echo.mesh.scale.setScalar(grow);
      echo.mesh.rotation.x += 0.03;
      echo.mesh.rotation.y += 0.04;
      echo.mesh.material.opacity = echo.life * 0.85;
    });

    // Depth-based opacity (feature 17)
    trackables.forEach((m) => {
      if (m.userData.baseOpacity === undefined) return;
      m.getWorldPosition(screenPos);
      const depth = screenPos.z;
      const depthFade = Math.max(0.35, Math.min(1, 1 - (depth + 6) * 0.08));
      if (m.material && m.material.opacity !== undefined) {
        // already modified by cursor light; only apply depth if not over-boosted
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  })();

}