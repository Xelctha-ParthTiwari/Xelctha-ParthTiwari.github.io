(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const fine = window.matchMedia('(pointer: fine)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  // Cursor glow — desktop only
  if (fine) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let tx = gx, ty = gy, visible = false;
    (function tick() {
      gx += (tx - gx) * 0.14;
      gy += (ty - gy) * 0.14;
      glow.style.transform = 'translate3d(' + gx + 'px,' + gy + 'px,0)';
      requestAnimationFrame(tick);
    })();
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!visible) { gx = tx; gy = ty; visible = true; glow.classList.add('active'); }
    });
    document.addEventListener('pointerleave', function () {
      glow.classList.remove('active'); visible = false;
    });
  }

  // Hero spotlight — works for mouse and touch
  document.querySelectorAll('.hero').forEach(function (hero) {
    const spot = document.createElement('div');
    spot.className = 'hero-spotlight';
    const content = hero.querySelector('.hero-content');
    if (content) hero.insertBefore(spot, content);
    else hero.appendChild(spot);

    function setSpot(x, y) {
      const rect = hero.getBoundingClientRect();
      spot.style.setProperty('--hx', (x - rect.left) + 'px');
      spot.style.setProperty('--hy', (y - rect.top) + 'px');
      spot.classList.add('active');
    }
    hero.addEventListener('pointermove', function (e) { setSpot(e.clientX, e.clientY); });
    hero.addEventListener('pointerdown', function (e) { setSpot(e.clientX, e.clientY); });
    hero.addEventListener('pointerleave', function () { spot.classList.remove('active'); });
  });

  // Cards — tilt on mouse move (fine) or press (coarse)
  document.querySelectorAll('.tilt').forEach(function (card) {
    function apply(x, y) {
      const rect = card.getBoundingClientRect();
      const px = x - rect.left;
      const py = y - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const ry = ((px - cx) / cx) * 5;
      const rx = -((py - cy) / cy) * 5;
      card.style.transform = 'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
      card.style.setProperty('--mx', px + 'px');
      card.style.setProperty('--my', py + 'px');
    }
    function reset() { card.style.transform = ''; }

    if (fine) {
      card.addEventListener('pointermove', function (e) { apply(e.clientX, e.clientY); });
      card.addEventListener('pointerleave', reset);
    }
    if (coarse) {
      card.addEventListener('pointerdown', function (e) {
        card.classList.add('pressed');
        apply(e.clientX, e.clientY);
      });
      card.addEventListener('pointerup', function () {
        card.classList.remove('pressed');
        reset();
      });
      card.addEventListener('pointercancel', function () {
        card.classList.remove('pressed');
        reset();
      });
    }
  });

  // Scroll progress bar
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  let scheduled = false;
  function update() {
    scheduled = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
  }
  window.addEventListener('scroll', function () {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  // Device orientation parallax (mobile) — subtle particle drift
  if (coarse && window.DeviceOrientationEvent) {
    let ox = 0, oy = 0;
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null || e.beta == null) return;
      ox = Math.max(-20, Math.min(20, e.gamma / 2));
      oy = Math.max(-20, Math.min(20, (e.beta - 45) / 2));
      document.documentElement.style.setProperty('--tilt-x', ox + 'px');
      document.documentElement.style.setProperty('--tilt-y', oy + 'px');
    });
  }

})();