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
  const anims = [
    halo, bloom, constellation, ripple, aurora, stardust, sigil, nebula,
    spiral, vortex, veil, petals, crown, prism, orbit, cascade,
    pulseRing, comet, stitch, ember, caduceus, shatter, gyre, scanline,
    beam, throb
  ];
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

  function spiral(ctx, w, h, p, colors, s) {
    const cx = w / 2, cy = h / 2;
    const t = Math.min(p * 1.3, 1);
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.6) / 0.4));
    if (!s.pts) {
      s.pts = [];
      for (let i = 0; i < 130; i++) {
        s.pts.push({
          a: Math.random() * Math.PI * 2,
          r: 0.4 + Math.random() * 0.6,
          sp: 0.7 + Math.random() * 1.3,
          c: colors[i % colors.length]
        });
      }
    }
    ctx.globalAlpha = fade;
    s.pts.forEach(function (pt) {
      const rr = (1 - t * (1 - pt.r)) * Math.min(w, h) * 0.55;
      const a = pt.a + t * Math.PI * 4 * pt.sp;
      ctx.fillStyle = pt.c;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1.7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function vortex(ctx, w, h, p, colors) {
    const cx = w / 2, cy = h / 2;
    const fade = p < 0.1 ? p / 0.1 : (1 - Math.max(0, (p - 0.6) / 0.4));
    const t = Math.min(p * 1.5, 1);
    ctx.globalAlpha = fade * 0.55;
    ctx.lineWidth = 1.1;
    for (let i = 0; i < 5; i++) {
      const phase = t * Math.PI * 2 + i * (Math.PI * 2 / 5);
      ctx.strokeStyle = colors[i % colors.length];
      ctx.beginPath();
      for (let j = 0; j <= 70; j++) {
        const tt = j / 70;
        const a = phase + tt * Math.PI * 3;
        const r = tt * Math.min(w, h) * 0.45 * (1 - t * 0.4);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function veil(ctx, w, h, p, colors, s) {
    if (!s.strands) {
      s.strands = [];
      for (let i = 0; i < 55; i++) {
        s.strands.push({
          x: Math.random(),
          len: 0.18 + Math.random() * 0.3,
          delay: Math.random() * 0.45,
          c: colors[i % colors.length]
        });
      }
    }
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.68) / 0.32));
    ctx.globalAlpha = fade * 0.75;
    ctx.lineWidth = 1.2;
    s.strands.forEach(function (st) {
      const lp = Math.max(0, Math.min(1, (p - st.delay) / 0.45));
      if (lp <= 0) return;
      const y1 = lp * (h + st.len * h);
      const y0 = y1 - st.len * h;
      const grad = ctx.createLinearGradient(0, y0, 0, y1);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, st.c);
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(st.x * w, y0);
      ctx.lineTo(st.x * w, y1);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function petals(ctx, w, h, p, colors, s) {
    if (!s.pts) {
      s.pts = [];
      for (let i = 0; i < 70; i++) {
        s.pts.push({
          x: Math.random(),
          y: -Math.random() * 0.4,
          vy: 0.2 + Math.random() * 0.3,
          sway: 0.02 + Math.random() * 0.05,
          ph: Math.random() * Math.PI * 2,
          r: 2 + Math.random() * 3,
          c: colors[i % colors.length]
        });
      }
    }
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.65) / 0.35));
    ctx.globalAlpha = fade * 0.85;
    s.pts.forEach(function (pt) {
      const y = (pt.y + pt.vy * p * 1.4) * h;
      if (y < 0 || y > h + 20) return;
      const x = (pt.x + Math.sin(p * 6 + pt.ph) * pt.sway) * w;
      ctx.fillStyle = pt.c;
      ctx.beginPath();
      ctx.ellipse(x, y, pt.r * 1.6, pt.r * 0.7, p * 2 + pt.ph, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function crown(ctx, w, h, p, colors, s) {
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.3;
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.7) / 0.3));
    const t = Math.min(p * 1.4, 1);
    const n = 24;
    ctx.globalAlpha = fade;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rise = Math.max(0, Math.min(1, (t - i / n * 0.5) * 2));
      const x = cx + Math.cos(a) * R;
      const y = cy + Math.sin(a) * R + (1 - rise) * h * 0.4;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(x, y, 2.6 * rise, 0, Math.PI * 2);
      ctx.fill();
    }
    if (t > 0.6) {
      ctx.strokeStyle = 'rgba(139,92,246,' + (fade * 0.5) + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2 * Math.min(1, (t - 0.6) / 0.4));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function prism(ctx, w, h, p, colors) {
    const cx = w / 2, cy = h / 2;
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.6) / 0.4));
    const t = Math.min(p * 1.4, 1);
    ctx.globalAlpha = fade * 0.65;
    ctx.lineWidth = 1.4;
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + t * 0.4;
      const len = Math.min(w, h) * 0.7 * t;
      const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      grad.addColorStop(0, colors[i % colors.length]);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * Math.min(w, h) * 0.05, cy + Math.sin(a) * Math.min(w, h) * 0.05);
      ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function orbit(ctx, w, h, p, colors, s) {
    if (!s.orbs) {
      s.orbs = [];
      for (let i = 0; i < 9; i++) {
        s.orbs.push({
          r: 0.18 + (i / 9) * 0.28,
          sp: 1 + i * 0.18,
          ph: Math.random() * Math.PI * 2,
          c: colors[i % colors.length]
        });
      }
    }
    const cx = w / 2, cy = h / 2;
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.65) / 0.35));
    ctx.globalAlpha = fade * 0.9;
    s.orbs.forEach(function (o) {
      const a = o.ph + p * Math.PI * 2 * o.sp * 0.6;
      const rr = o.r * Math.min(w, h);
      ctx.fillStyle = o.c;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = fade * 0.2;
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 0.6;
    s.orbs.forEach(function (o) {
      ctx.beginPath();
      ctx.arc(cx, cy, o.r * Math.min(w, h), 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function cascade(ctx, w, h, p, colors, s) {
    if (!s.streaks) {
      s.streaks = [];
      for (let i = 0; i < 75; i++) {
        s.streaks.push({
          x: Math.random(),
          delay: Math.random() * 0.4,
          speed: 1.3 + Math.random() * 0.7,
          c: colors[i % colors.length]
        });
      }
    }
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.68) / 0.32));
    ctx.globalAlpha = fade * 0.8;
    ctx.lineWidth = 1.3;
    s.streaks.forEach(function (st) {
      const lp = Math.max(0, Math.min(1, (p - st.delay) / 0.5 * st.speed));
      if (lp <= 0 || lp >= 1) return;
      const y = lp * h;
      const trail = 60 + Math.random() * 40;
      const grad = ctx.createLinearGradient(0, y - trail, 0, y);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, st.c);
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(st.x * w, y - trail);
      ctx.lineTo(st.x * w, y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function pulseRing(ctx, w, h, p, colors) {
    const cx = w / 2, cy = h / 2;
    const fade = p < 0.1 ? p / 0.1 : (1 - Math.max(0, (p - 0.65) / 0.35));
    for (let i = 0; i < 6; i++) {
      const lp = Math.max(0, Math.min(1, p * 1.4 - i * 0.12));
      if (lp <= 0) continue;
      const r = Math.min(w, h) * 0.7 * lp;
      ctx.strokeStyle = colors[i % colors.length];
      ctx.globalAlpha = fade * (1 - lp) * 0.6;
      ctx.lineWidth = 2 * (1 - lp);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function comet(ctx, w, h, p, colors) {
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.7) / 0.3));
    const t = Math.min(p * 1.3, 1);
    const x = -w * 0.15 + t * w * 1.3;
    const y = h * 0.35 + Math.sin(t * Math.PI) * h * 0.2;
    const tail = 200 + t * 200;
    const grad = ctx.createLinearGradient(x - tail, y - tail * 0.4, x, y);
    grad.addColorStop(0, 'rgba(139,92,246,0)');
    grad.addColorStop(0.7, colors[2]);
    grad.addColorStop(1, '#fff');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3 * fade;
    ctx.beginPath();
    ctx.moveTo(x - tail, y - tail * 0.4);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalAlpha = fade * 0.9;
    const g = ctx.createRadialGradient(x, y, 0, x, y, 30);
    g.addColorStop(0, '#fff');
    g.addColorStop(0.4, colors[1]);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 30, y - 30, 60, 60);
    ctx.globalAlpha = 1;
  }

  function stitch(ctx, w, h, p, colors) {
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.7) / 0.3));
    const t = Math.min(p * 1.4, 1);
    ctx.globalAlpha = fade * 0.6;
    ctx.lineWidth = 1;
    const n = 12;
    for (let i = 0; i < n; i++) {
      const off = i / n;
      ctx.strokeStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(0, h * off);
      ctx.lineTo(w * Math.min(1, t * 2 - off), h * (1 - off));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * off, 0);
      ctx.lineTo(w * (1 - Math.min(1, t * 2 - off)), h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function ember(ctx, w, h, p, colors, s) {
    if (!s.pts) {
      s.pts = [];
      for (let i = 0; i < 90; i++) {
        s.pts.push({
          x: Math.random(),
          y: 1 + Math.random() * 0.3,
          vy: 0.25 + Math.random() * 0.45,
          sway: 0.015 + Math.random() * 0.03,
          ph: Math.random() * Math.PI * 2,
          c: colors[i % colors.length]
        });
      }
    }
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.65) / 0.35));
    ctx.globalAlpha = fade;
    s.pts.forEach(function (pt) {
      const y = (pt.y - pt.vy * p * 1.3) * h;
      if (y < -20 || y > h + 20) return;
      const x = (pt.x + Math.sin(p * 5 + pt.ph) * pt.sway) * w;
      ctx.fillStyle = pt.c;
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = fade * 0.4;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = fade;
    });
    ctx.globalAlpha = 1;
  }

  function caduceus(ctx, w, h, p, colors) {
    const cx = w / 2;
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.7) / 0.3));
    const t = Math.min(p * 1.3, 1);
    ctx.globalAlpha = fade * 0.7;
    ctx.lineWidth = 1.4;
    const amps = Math.min(w, h) * 0.08;
    for (let side = 0; side < 2; side++) {
      ctx.strokeStyle = colors[side];
      ctx.beginPath();
      for (let j = 0; j <= 60; j++) {
        const tt = j / 60;
        const y = (1 - tt * t) * h;
        const phase = tt * Math.PI * 6 + (side === 0 ? 0 : Math.PI);
        const x = cx + Math.sin(phase) * amps;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function shatter(ctx, w, h, p, colors, s) {
    if (!s.shards) {
      s.shards = [];
      for (let i = 0; i < 60; i++) {
        s.shards.push({
          a: Math.random() * Math.PI * 2,
          d: 0.4 + Math.random() * 0.6,
          sz: 2 + Math.random() * 5,
          rot: Math.random() * Math.PI * 2,
          c: colors[i % colors.length]
        });
      }
    }
    const cx = w / 2, cy = h / 2;
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.65) / 0.35));
    const t = 1 - Math.pow(1 - p, 3);
    ctx.globalAlpha = fade * 0.85;
    s.shards.forEach(function (sh) {
      const dist = sh.d * Math.min(w, h) * (1 - t);
      const x = cx + Math.cos(sh.a) * dist;
      const y = cy + Math.sin(sh.a) * dist;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(sh.rot + p * 3);
      ctx.fillStyle = sh.c;
      ctx.fillRect(-sh.sz / 2, -sh.sz / 2, sh.sz, sh.sz * 0.6);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  function gyre(ctx, w, h, p, colors) {
    const cx = w / 2, cy = h / 2;
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.65) / 0.35));
    const t = Math.min(p * 1.3, 1);
    ctx.globalAlpha = fade * 0.65;
    ctx.lineWidth = 1.1;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const r = Math.min(w, h) * (0.1 + i * 0.09) * t;
      const a0 = p * Math.PI * 2 * (0.6 + i * 0.15);
      ctx.strokeStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a0 + Math.PI * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0 + Math.PI, a0 + Math.PI * 1.9);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function scanline(ctx, w, h, p, colors) {
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.7) / 0.3));
    const t = Math.min(p * 1.2, 1);
    const y = t * h;
    const grad = ctx.createLinearGradient(0, y - 80, 0, y + 80);
    grad.addColorStop(0, 'rgba(139,92,246,0)');
    grad.addColorStop(0.5, colors[1]);
    grad.addColorStop(1, 'rgba(79,127,255,0)');
    ctx.globalAlpha = fade * 0.85;
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 80, w, 160);
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = fade;
    ctx.fillRect(0, y - 0.5, w, 1);
    ctx.globalAlpha = 1;
  }

  function beam(ctx, w, h, p, colors) {
    const cx = w / 2, cy = h / 2;
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.65) / 0.35));
    const R = Math.max(w, h);
    const a = p * Math.PI * 3;
    ctx.globalAlpha = fade * 0.5;
    for (let i = 0; i < 3; i++) {
      const aa = a + (i / 3) * Math.PI * 2;
      const spread = 0.18;
      const grad = ctx.createLinearGradient(cx, cy, cx + Math.cos(aa) * R, cy + Math.sin(aa) * R);
      grad.addColorStop(0, colors[i % colors.length]);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(aa - spread) * R, cy + Math.sin(aa - spread) * R);
      ctx.lineTo(cx + Math.cos(aa + spread) * R, cy + Math.sin(aa + spread) * R);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function throb(ctx, w, h, p, colors) {
    const cx = w / 2, cy = h / 2;
    const fade = p < 0.15 ? p / 0.15 : (1 - Math.max(0, (p - 0.6) / 0.4));
    const pulse = Math.sin(p * Math.PI * 4) * 0.15 + 1;
    const r = Math.min(w, h) * 0.22 * pulse;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
    g.addColorStop(0, 'rgba(200,190,255,' + (fade * 0.9) + ')');
    g.addColorStop(0.4, 'rgba(139,92,246,' + (fade * 0.5) + ')');
    g.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - r * 2.5, cy - r * 2.5, r * 5, r * 5);
    ctx.globalAlpha = fade * 0.9;
    ctx.strokeStyle = colors[2];
    ctx.lineWidth = 1.5;
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = fade * (0.5 - i * 0.12);
      ctx.beginPath();
      ctx.arc(cx, cy, r * (1 + i * 0.5), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

})();