(function () {
  'use strict';

  localStorage.removeItem('xelctha-theme');

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

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

  if (!prefersReduced) {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    let scheduled = false;
    const updateBar = () => {
      scheduled = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      bar.style.transform = `scaleX(${p})`;
    };

    window.addEventListener('scroll', () => {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(updateBar);
      }
    }, { passive: true });

    updateBar();
  }

  if (!isTouch && !prefersReduced) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let tx = gx;
    let ty = gy;
    let visible = false;

    const tick = () => {
      gx += (tx - gx) * 0.14;
      gy += (ty - gy) * 0.14;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        gx = tx;
        gy = ty;
        visible = true;
        glow.classList.add('active');
      }
    });

    document.addEventListener('mouseleave', () => {
      glow.classList.remove('active');
      visible = false;
    });

    tick();
  }

  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.hero').forEach((hero) => {
      const spot = document.createElement('div');
      spot.className = 'hero-spotlight';
      const content = hero.querySelector('.hero-content');
      if (content) hero.insertBefore(spot, content);
      else hero.appendChild(spot);

      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        spot.style.setProperty('--hx', (e.clientX - rect.left) + 'px');
        spot.style.setProperty('--hy', (e.clientY - rect.top) + 'px');
        spot.classList.add('active');
      });

      hero.addEventListener('mouseleave', () => {
        spot.classList.remove('active');
      });
    });
  }

  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.tilt').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotateY = ((x - cx) / cx) * 5;
        const rotateX = -((y - cy) / cy) * 5;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  const canvas = document.getElementById('bg-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    const colors = ['#8b5cf6', '#4f7fff', '#a78bfa', '#60a5fa'];
    const sprites = {};
    const mouse = { x: -9999, y: -9999, active: false };

    let width = 0;
    let height = 0;
    let particles = [];

    function rgba(hex, a) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${a})`;
    }

    function makeSprite(color) {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const g = c.getContext('2d');
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, rgba(color, 0.9));
      grad.addColorStop(0.2, rgba(color, 0.55));
      grad.addColorStop(0.5, rgba(color, 0.18));
      grad.addColorStop(1, rgba(color, 0));
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return c;
    }

    colors.forEach((c) => { sprites[c] = makeSprite(c); });

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      const target = Math.min(90, Math.max(40, Math.floor((width * height) / 19000)));
      particles = [];
      for (let i = 0; i < target; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.5 + 0.7,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function init() {
      resize();
      spawn();
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);

      const linkDist = 140;
      const mouseDist = 220;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.014;

        if (p.x < -30) p.x = width + 30;
        else if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        else if (p.y > height + 30) p.y = -30;

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150 && d > 0.1) {
            const f = (150 - d) / 150;
            p.x += (dx / d) * f * 0.7;
            p.y += (dy / d) * f * 0.7;
          }
        }
      }

      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.globalAlpha = (1 - d / linkDist) * 0.14;
            ctx.strokeStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      if (mouse.active) {
        ctx.lineWidth = 0.75;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < mouseDist) {
            ctx.globalAlpha = (1 - d / mouseDist) * 0.35;
            ctx.strokeStyle = p.color;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulse = 1 + Math.sin(p.phase) * 0.22;
        const size = p.r * 12 * pulse;
        ctx.globalAlpha = 0.4;
        ctx.drawImage(sprites[p.color], p.x - size / 2, p.y - size / 2, size, size);
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 150);
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    document.addEventListener('mouseleave', () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    });

    init();
    frame();
  }

})();