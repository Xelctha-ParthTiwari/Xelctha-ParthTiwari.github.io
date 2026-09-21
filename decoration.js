(function () {
  'use strict';

  if (sessionStorage.getItem('xelctha-decor-played')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  sessionStorage.setItem('xelctha-decor-played', '1');

  const overlay = document.createElement('div');
  overlay.className = 'decoration-overlay';
  const canvas = document.createElement('canvas');
  canvas.className = 'decoration-canvas';
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);

  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#8b5cf6', '#4f7fff', '#a78bfa', '#60a5fa'];
  const anims = [halo, bloom, constellation, ripple, aurora, stardust, sigil, nebula];
  const state = {};
  const chosen = anims[Math.floor(Math.random() * anims.length)];

  const start = performance.now();
  const DURATION = 3400;

  function frame(t) {
    const p = Math.min((t - start) / DURATION, 1);
    ctx.clearRect(0, 0, w, h);
    chosen(ctx, w, h, p, colors, state);
    if (p < 1) requestAnimationFrame(frame);
    else {
      overlay.classList.add('done');
      setTimeout(() => overlay.remove(), 900);
    }
  }
  requestAnimationFrame(frame);

  function halo(ctx, w, h, p, colors) {
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.55;
    const ease = 1 - Math.pow(1 - p, 3);
    const r = R * ease;
    const fade = p < 0.1 ? p / 0.1 : (1 - Math.max(0, (p - 0.55) / 0.45));
    const g = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r * 1.05);
    g.addColorStop(0, 'rgba(139,92,246,0)');
    g.addColorStop(0.85, 'rgba(139,92,246,' + (fade * 0.5) + ')');
    g.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(167,139,250,' + (fade * 0.65) + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.92, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(96,165,250,' + (fade * 0.35) + ')';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2); ctx.stroke();
  }

  function bloom(ctx, w, h, p, colors, s) {
    if (!s.pts) {
      s.pts = [];
      for (let i = 0; i < 140; i++) {
        s.pts.push({
          a: Math.random() * Math.PI * 2,
          sp: 40 + Math.random() * 260,
          r: 0.8 + Math.random() * 2.2,
          c: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    const cx = w / 2, cy = h / 2;
    const ease = 1 - Math.pow(1 - p, 2.5);
    const fade = 1 - p;
    const flash = Math.max(0, 1 - p * 4);
    if (flash > 0) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180 * (1 - p));
      g.addColorStop(0, 'rgba(200,190,255,' + flash + ')');
      g.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    ctx.globalAlpha = fade;
    s.pts.forEach(function (pt) {
      const x = cx + Math.cos(pt.a) * pt.sp * ease;
      const y = cy + Math.sin(pt.a) * pt.sp * ease;
      ctx.fillStyle = pt.c;
      ctx.beginPath(); ctx.arc(x, y, pt.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function constellation(ctx, w, h, p, colors, s) {
    if (!s.pts) {
      s.pts = [];
      for (let i = 0; i < 34; i++) {
        s.pts.push({
          x: 0.1 + Math.random() * 0.8,
          y: 0.1 + Math.random() * 0.8,
          c: colors[i % colors.length]
        });
      }
    }
    const drawP = Math.min(p * 1.5, 1);
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.55) / 0.45));
    const n = s.pts.length;
    s.pts.forEach(function (pt, i) {
      if (i / n > drawP) return;
      ctx.fillStyle = pt.c;
      ctx.globalAlpha = fade * 0.9;
      ctx.beginPath(); ctx.arc(pt.x * w, pt.y * h, 2.4, 0, Math.PI * 2); ctx.fill();
    });
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (j / n > drawP) continue;
        const a = s.pts[i], b = s.pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 0.24) {
          ctx.globalAlpha = fade * (1 - d / 0.24) * 0.35;
          ctx.strokeStyle = a.c;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x * w, a.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function ripple(ctx, w, h, p, colors) {
    const cx = w / 2, cy = h / 2;
    const R = Math.max(w, h) * 0.75;
    const fade = p < 0.1 ? p / 0.1 : (1 - Math.max(0, (p - 0.6) / 0.4));
    for (let i = 0; i < 5; i++) {
      const localP = Math.max(0, Math.min(1, p * 1.3 - i * 0.13));
      if (localP <= 0) continue;
      const r = R * localP;
      ctx.strokeStyle = 'rgba(139,92,246,' + (fade * (1 - localP) * 0.65) + ')';
      ctx.lineWidth = 1.4 - localP;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function aurora(ctx, w, h, p, colors, s) {
    if (!s.rb) {
      s.rb = [];
      for (let i = 0; i < 4; i++) {
        s.rb.push({
          y: 0.25 + i * 0.15,
          amp: 0.06 + Math.random() * 0.08,
          freq: 1.5 + Math.random() * 2,
          speed: 0.8 + Math.random() * 0.6,
          color: colors[i % colors.length]
        });
      }
    }
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.5) / 0.5));
    s.rb.forEach(function (rb, idx) {
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(139,92,246,0)');
      grad.addColorStop(0.5, rb.color);
      grad.addColorStop(1, 'rgba(79,127,255,0)');
      ctx.strokeStyle = grad;
      ctx.globalAlpha = fade * (0.55 - idx * 0.08);
      ctx.lineWidth = 3 - idx * 0.5;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const t = x / w;
        const y = h * rb.y + Math.sin(t * Math.PI * rb.freq + p * 8 * rb.speed) * h * rb.amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function stardust(ctx, w, h, p, colors, s) {
    if (!s.st) {
      s.st = [];
      for (let i = 0; i < 130; i++) {
        s.st.push({
          x: Math.random() * 1.2 - 0.1,
          y: -Math.random() * 0.3,
          vy: 0.15 + Math.random() * 0.35,
          r: 0.8 + Math.random() * 2,
          c: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.6) / 0.4));
    const ease = 1 - Math.pow(1 - p, 2);
    ctx.globalAlpha = fade;
    s.st.forEach(function (st) {
      const y = (st.y + st.vy * ease * 2.2) * h;
      if (y < 0 || y > h) return;
      ctx.fillStyle = st.c;
      ctx.beginPath(); ctx.arc(st.x * w, y, st.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function sigil(ctx, w, h, p, colors) {
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.3;
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.65) / 0.35));
    const drawP = Math.min(p * 1.6, 1);
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      pts.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R });
    }
    ctx.strokeStyle = 'rgba(139,92,246,' + (fade * 0.8) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2 * drawP); ctx.stroke();
    const seg = Math.min(pts.length, Math.floor(drawP * pts.length));
    ctx.beginPath();
    for (let i = 0; i <= seg; i++) {
      const pt = pts[i % pts.length];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    if (drawP > 0.5) {
      ctx.strokeStyle = 'rgba(79,127,255,' + (fade * 0.5) + ')';
      for (let i = 0; i < pts.length; i++) {
        const n = (i + 2) % pts.length;
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(pts[n].x, pts[n].y);
        ctx.stroke();
      }
    }
  }

  function nebula(ctx, w, h, p, colors, s) {
    if (!s.bl) {
      s.bl = [];
      for (let i = 0; i < 5; i++) {
        s.bl.push({
          x: 0.25 + Math.random() * 0.5,
          y: 0.25 + Math.random() * 0.5,
          r: 0.15 + Math.random() * 0.2,
          c: colors[i % colors.length],
          ph: Math.random() * Math.PI * 2
        });
      }
    }
    const fade = p < 0.2 ? p / 0.2 : (1 - Math.max(0, (p - 0.55) / 0.45));
    ctx.globalCompositeOperation = 'lighter';
    s.bl.forEach(function (b) {
      const pulse = 1 + Math.sin(p * 6 + b.ph) * 0.15;
      const r = b.r * Math.min(w, h) * pulse * (1 + p * 0.4);
      const x = b.x * w + Math.sin(p * 4 + b.ph) * 20;
      const y = b.y * h + Math.cos(p * 4 + b.ph) * 20;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, b.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = fade * 0.4;
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    });
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

})();