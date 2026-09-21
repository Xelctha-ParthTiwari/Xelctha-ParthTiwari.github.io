(function () {
  'use strict';

  localStorage.removeItem('xelctha-theme');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealTargets = document.querySelectorAll('.reveal, .card, .future-item, .section-title, .about-grid');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('visible'));
  }

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const canvas = document.getElementById('bg-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');

    const palettes = [
      [139, 92, 246],
      [79, 127, 255],
      [167, 139, 250],
      [96, 165, 250]
    ];

    const ribbons = [
      { y: 0.20, amp: 0.055, freq: 1.4, speed: 0.22, thick: 1.6, color: palettes[0] },
      { y: 0.40, amp: 0.075, freq: 1.0, speed: 0.18, thick: 2.2, color: palettes[1] },
      { y: 0.60, amp: 0.065, freq: 1.6, speed: 0.26, thick: 1.8, color: palettes[2] },
      { y: 0.76, amp: 0.048, freq: 1.2, speed: 0.30, thick: 1.4, color: palettes[3] },
      { y: 0.90, amp: 0.055, freq: 0.9, speed: 0.16, thick: 2.0, color: palettes[0] }
    ];

    const mouse = { x: -9999, y: -9999, active: false };

    let w = 0;
    let h = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    window.addEventListener('pointerdown', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    window.addEventListener('pointerup', () => {
      if (window.matchMedia('(pointer: coarse)').matches) {
        mouse.active = false;
        mouse.x = -9999;
        mouse.y = -9999;
      }
    });

    document.addEventListener('pointerleave', () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    });

    window.addEventListener('scroll', () => {
      if (!mouse.active) return;
    }, { passive: true });

    const segs = 70;
    let t = 0;

    const layers = [
      { mult: 26, alpha: 0.028 },
      { mult: 12, alpha: 0.055 },
      { mult: 4,  alpha: 0.11 },
      { mult: 1,  alpha: 0.20 }
    ];

    function frame() {
      ctx.clearRect(0, 0, w, h);

      const influence = Math.min(w, h) * 0.38;

      for (let r = 0; r < ribbons.length; r++) {
        const rb = ribbons[r];
        const baseY = h * rb.y;

        const pts = [];
        for (let i = 0; i <= segs; i++) {
          const u = i / segs;
          const x = u * w;

          let y = baseY
            + Math.sin(u * Math.PI * 2 * rb.freq + t * rb.speed) * h * rb.amp
            + Math.sin(u * Math.PI * 2 * rb.freq * 2.3 + t * rb.speed * 1.4) * h * rb.amp * 0.32;

          if (mouse.active) {
            const dx = x - mouse.x;
            if (dx > -influence && dx < influence) {
              const fall = 1 - (dx * dx) / (influence * influence);
              y += (mouse.y - baseY) * fall * 0.28;
            }
          }

          pts.push(x, y);
        }

        const base = 'rgba(' + rb.color[0] + ',' + rb.color[1] + ',' + rb.color[2] + ',';

        for (let l = 0; l < layers.length; l++) {
          const ly = layers[l];
          ctx.strokeStyle = base + ly.alpha + ')';
          ctx.lineWidth = rb.thick * ly.mult;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(pts[0], pts[1]);
          for (let i = 2; i < pts.length; i += 2) {
            ctx.lineTo(pts[i], pts[i + 1]);
          }
          ctx.stroke();
        }
      }

      t += 0.006;
      requestAnimationFrame(frame);
    }

    frame();
  }

})();