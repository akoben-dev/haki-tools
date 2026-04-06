/**
 * ============================================================
 * HAKI TOOLS — Scroll-Driven Particle Hero (v3.1)
 * ============================================================
 *
 * WHAT THIS FILE DOES
 * ─────────────────────────────────────────────────────────────
 * Phase 0  (scroll 0%–5%)    : Brief ambient particle field —
 *           particles drift freely across the canvas. No
 *           canvas-drawn logo. No background shape.
 *
 * Phase 1  (scroll 5%–55%)   : Particles converge toward the
 *           real logo geometry (sampled from the official
 *           haki_tools_green.svg path data).
 *
 * Phase 2  (scroll 55%–100%) : Particles have converged.
 *           The REAL haki_tools_green.svg (as an <img>) fades
 *           in over the particle field. The hero stays pinned
 *           so the user can see the finished reveal before the
 *           next section appears.
 *
 * BRAND RULE
 * ─────────────────────────────────────────────────────────────
 * The canvas NEVER draws any logo shape, outline, or
 * approximation. The only visible logo mark is the official
 * uploaded SVG rendered as a browser <img> element.
 * ============================================================
 */

(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  const logoReveal = document.getElementById('hero-logo-reveal');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BRAND_GREEN      = '#9ee2bf';
  const BRAND_GREEN_RGBA = 'rgba(158,226,191,';

  // ── Reduced-motion fallback ─────────────────────────────────
  if (prefersReducedMotion) {
    // Just show the real SVG logo, no animation
    if (logoReveal) {
      logoReveal.style.opacity = '1';
      logoReveal.style.transform = 'none';
    }
    return;
  }

  // ── Canvas sizing ───────────────────────────────────────────
  let W, H, CX, CY, LOGO_SCALE;
  let RAF_ID = null;

  function logoScaleFor(w, h) {
    // Scale the logo so it's visible but not too large
    const base = Math.min(w, h) * 0.28;
    return Math.min(Math.max(base, 80), 240);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    CX = W / 2;
    CY = H * 0.50;   // particle convergence point — true vertical center
    LOGO_SCALE = logoScaleFor(W, H);

    // Keep the SVG logo overlay sized and centered
    if (logoReveal) {
      const size = LOGO_SCALE * 2;
      logoReveal.style.width  = size + 'px';
      logoReveal.style.height = size + 'px';
      logoReveal.style.left   = (CX - size / 2) + 'px';
      logoReveal.style.top    = (CY - size / 2) + 'px';
    }
  }

  // ── Official SVG path data → target positions ───────────────
  // Source: haki_tools_green.svg, viewBox 0 0 439.03 313.55
  // All coords are absolute, traced from the single <path> element.
  //
  // The path describes a diamond (rhombus-like) outer shape with
  // an H-monogram cutout in the interior.
  //
  // We normalize all coordinates to a –1…+1 unit space
  // centered on the SVG bounding box, then scale by LOGO_SCALE.

  const SVG_W    = 439.03;
  const SVG_H    = 313.55;
  const SVG_CX   = SVG_W / 2;   // 219.515
  const SVG_CY   = SVG_H / 2;   // 156.775
  const SVG_NORM = SVG_W  / 2;  // 219.515 — normalise to half-width

  function normPt(ax, ay) {
    return [(ax - SVG_CX) / SVG_NORM, (ay - SVG_CY) / SVG_NORM];
  }

  // Key vertices traced from the official SVG path
  const OUTER_VERTS = [
    [0,       94.03],
    [38.25,   55.78],
    [78.85,   55.78],
    [94.03,   0    ],
    [345.0,   0    ],
    [373.69,  28.69],
    [400.79,  55.78],
    [439.03,  94.03],
    [219.515, 313.55],
  ];

  // Interior H-form panels
  const RIGHT_PANEL = [
    [233.86, 148.22],
    [284.86, 148.22],
    [284.86, 207.61],
    [233.86, 258.61],
  ];

  const LEFT_PANEL = [
    [154.18, 148.22],
    [205.18, 148.22],
    [205.18, 258.61],
    [154.18, 207.61],
  ];

  const TOP_LEFT_PANEL = [
    [154.18, 55.78],
    [205.18, 55.78],
    [205.18, 119.53],
    [154.18, 119.53],
  ];

  const TOP_RIGHT_PANEL = [
    [233.86, 28.69],
    [284.86, 28.69],
    [284.86, 119.53],
    [233.86, 119.53],
  ];

  // Sample evenly-spaced points along a closed polygon
  function samplePoly(verts, density) {
    const pts = [];
    const closed = [...verts, verts[0]];
    for (let i = 0; i < closed.length - 1; i++) {
      const [x0, y0] = closed[i];
      const [x1, y1] = closed[i + 1];
      const dx = x1 - x0, dy = y1 - y0;
      const len   = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(2, Math.round(len * density));
      for (let s = 0; s < steps; s++) {
        const t = s / steps;
        pts.push(normPt(x0 + dx * t, y0 + dy * t));
      }
    }
    return pts;
  }

  // Sample points filling a rectangle (for solid fill mass)
  function sampleRect(x, y, w, h, density) {
    const pts = [];
    const nx = Math.max(2, Math.round(w * density));
    const ny = Math.max(2, Math.round(h * density));
    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < ny; iy++) {
        pts.push(normPt(x + w * ix / nx, y + h * iy / ny));
      }
    }
    return pts;
  }

  function buildTargetPoints() {
    const pts = [];
    // Outer silhouette perimeter
    pts.push(...samplePoly(OUTER_VERTS,    0.55));
    // Interior panels — perimeter + fill
    pts.push(...samplePoly(RIGHT_PANEL,    0.50));
    pts.push(...samplePoly(LEFT_PANEL,     0.50));
    pts.push(...samplePoly(TOP_LEFT_PANEL, 0.50));
    pts.push(...samplePoly(TOP_RIGHT_PANEL,0.50));
    // Solid fill mass inside the H panels
    pts.push(...sampleRect(233.86, 148.22, 51, 110.39, 0.065));
    pts.push(...sampleRect(154.18, 148.22, 51, 110.39, 0.065));
    pts.push(...sampleRect(154.18, 55.78,  51, 63.75,  0.065));
    pts.push(...sampleRect(233.86, 28.69,  51, 90.84,  0.065));
    return pts;
  }

  // ── Scroll progress ─────────────────────────────────────────
  // scrollProgress 0 → 1 driven by GSAP ScrollTrigger on #hero-pin
  let scrollProgress = 0;

  // Phase boundaries (0–1):
  // 0.00–0.05  : brief ambient only, no convergence
  // 0.05–0.55  : particles converge
  // 0.55–1.00  : fully converged — show real SVG overlay (dwell ~144vh)
  const CONV_START = 0.05;
  const CONV_END   = 0.55;
  const DWELL_START = 0.55;   // SVG img begins fading in here

  // ── Particle class ──────────────────────────────────────────
  const PARTICLE_COUNT = window.innerWidth < 768 ? 700 : 1200;

  let particles   = [];
  let logoTargets = [];

  class Particle {
    constructor(tx, ty) {
      this.tx = tx;
      this.ty = ty;

      // Scatter position — bimodal: tight ring + wide scatter
      const angle = Math.random() * Math.PI * 2;
      const r     = Math.random() < 0.5
        ? 0.35 + Math.random() * 0.65
        : 0.85 + Math.random() * 1.3;
      this.sx = Math.cos(angle) * r + (Math.random() - 0.5) * 0.15;
      this.sy = Math.sin(angle) * r * 0.72 + (Math.random() - 0.5) * 0.15;

      this.x = this.sx;
      this.y = this.sy;

      // Ambient drift params — alive and fast
      this.phase       = Math.random() * Math.PI * 2;
      this.phaseY      = Math.random() * Math.PI * 2;
      this.speed       = 0.5 + Math.random() * 1.5;
      this.speedY      = 0.4 + Math.random() * 1.1;
      this.orbitR      = 0.022 + Math.random() * 0.075;
      this.orbitRY     = 0.016 + Math.random() * 0.055;
      // Secondary wobble (40% of particles)
      this.wobble      = Math.random() < 0.4;
      this.wobbleA     = this.wobble ? 0.012 + Math.random() * 0.022 : 0;
      this.wobbleSpeed = 1.5 + Math.random() * 3.0;
      this.wobblePhase = Math.random() * Math.PI * 2;

      // Convergence stagger: each particle starts converging at
      // a slightly different scroll progress so it looks organic
      this.convDelay = Math.random() * 0.18;

      // Visual
      this.baseSize    = 0.55 + Math.random() * 1.7;
      this.isGreen     = Math.random() > 0.42;
      this.baseOpacity = 0.12 + Math.random() * 0.52;
    }

    update(t, sp) {
      // Map scroll to convergence progress [0…1], with per-particle delay
      const convRange = CONV_END - CONV_START;
      const rawConv   = (sp - CONV_START - this.convDelay * convRange) / convRange;
      const convProg  = Math.max(0, Math.min(1, rawConv));
      const eased     = easeInOutQuart(convProg);
      const ambient   = 1 - eased;

      // Drift
      const driftX = Math.sin(t * this.speed  + this.phase)  * this.orbitR
                   + Math.sin(t * this.wobbleSpeed + this.wobblePhase) * this.wobbleA;
      const driftY = Math.cos(t * this.speedY + this.phaseY) * this.orbitRY
                   + Math.cos(t * this.wobbleSpeed * 0.65 + this.wobblePhase) * this.wobbleA * 0.55;

      this.x = this.sx + driftX * ambient;
      this.y = this.sy + driftY * ambient;

      // Snap toward target as convergence progresses
      this.x += (this.tx - this.x) * eased;
      this.y += (this.ty - this.y) * eased;

      // Opacity: ambient twinkle → solid at convergence
      const twinkle   = Math.sin(t * this.speed * 2.2 + this.phase) * 0.10 * ambient;
      // Particles fade out once the SVG logo overlay takes over
      const dwellFade = sp > DWELL_START
        ? Math.max(0, 1 - (sp - DWELL_START) / 0.20)
        : 1;
      this.opacity    = (this.baseOpacity * ambient + 0.82 * eased + twinkle) * dwellFade;
    }

    draw(cx, cy, scale) {
      const px = cx + this.x * scale;
      const py = cy + this.y * scale;
      const sz = this.baseSize * 0.5;
      if (sz <= 0) return;

      ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
      ctx.fillStyle   = this.isGreen ? BRAND_GREEN : 'rgba(234,242,238,0.9)';
      ctx.beginPath();
      ctx.arc(px, py, sz, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function easeInOutQuart(t) {
    return t < 0.5
      ? 8 * t * t * t * t
      : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  function rebuildParticles() {
    logoTargets = buildTargetPoints();
    particles   = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const [tx, ty] = logoTargets[i % logoTargets.length];
      particles.push(new Particle(tx, ty));
    }
  }

  // ── Ambient background glow ─────────────────────────────────
  // A gentle breathing radial glow that fades as convergence starts
  function drawAmbientGlow(t, sp) {
    const alpha = Math.max(0, 1 - (sp / CONV_END) * 1.4);
    if (alpha <= 0) return;

    const pulse = 0.5 + 0.5 * Math.sin(t * 0.55);
    const glowR = LOGO_SCALE * (1.5 + pulse * 0.3);

    const grd = ctx.createRadialGradient(CX, CY, 0, CX, CY, glowR);
    grd.addColorStop(0, BRAND_GREEN_RGBA + (0.06 * alpha * (0.85 + pulse * 0.15)) + ')');
    grd.addColorStop(0.55, BRAND_GREEN_RGBA + (0.02 * alpha) + ')');
    grd.addColorStop(1, BRAND_GREEN_RGBA + '0)');

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle   = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ── SVG logo overlay ────────────────────────────────────────
  // Fades in after convergence using a CSS opacity transition
  // on #hero-logo-reveal (the real SVG <img> tag in the DOM).
  function updateLogoOverlay(sp) {
    if (!logoReveal) return;
    // Start fading in at DWELL_START, fully visible at DWELL_START+0.15
    const t = Math.max(0, Math.min(1, (sp - DWELL_START) / 0.15));
    logoReveal.style.opacity = t.toFixed(3);

    // Subtle scale-up as it appears
    const scale = 0.88 + t * 0.12;
    logoReveal.style.transform = `scale(${scale.toFixed(3)})`;
  }

  // ── Main render loop ────────────────────────────────────────
  function render(ts) {
    RAF_ID = requestAnimationFrame(render);
    const t  = ts / 1000;
    const sp = scrollProgress;

    ctx.clearRect(0, 0, W, H);

    drawAmbientGlow(t, sp);

    // Draw particles
    ctx.save();
    for (const p of particles) {
      p.update(t, sp);
      p.draw(CX, CY, LOGO_SCALE);
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    // Drive the real SVG overlay
    updateLogoOverlay(sp);
  }

  // ── Scroll binding ──────────────────────────────────────────
  function bindScroll() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: '#hero-pin',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => { scrollProgress = self.progress; },
      });
    } else {
      const pin = document.getElementById('hero-pin');
      if (!pin) return;
      window.addEventListener('scroll', () => {
        const rect  = pin.getBoundingClientRect();
        const total = pin.offsetHeight - window.innerHeight;
        scrollProgress = Math.max(0, Math.min(1, -rect.top / total));
      }, { passive: true });
    }
  }

  // ── Visibility pause ────────────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && RAF_ID) {
      cancelAnimationFrame(RAF_ID);
      RAF_ID = null;
    } else if (!document.hidden && !RAF_ID) {
      RAF_ID = requestAnimationFrame(render);
    }
  });

  // ── Init ────────────────────────────────────────────────────
  function init() {
    resize();
    rebuildParticles();
    bindScroll();
    RAF_ID = requestAnimationFrame(render);
  }

  window.addEventListener('resize', () => { resize(); rebuildParticles(); });

  // Boot after GSAP is available
  let attempts = 0;
  function tryInit() {
    if (typeof gsap !== 'undefined') {
      init();
    } else if (attempts < 25) {
      attempts++;
      setTimeout(tryInit, 100);
    } else {
      init();
    }
  }
  tryInit();

})();
