// Morph targets. Every formation is drawn onto an offscreen 2D canvas and then
// sampled, so all shapes share the same density rules. The logo target comes
// straight from the brand SVG's <path d="…"> data: swap the SVG file and the
// particles follow, with no code change.
//
// Output: Float32Array of N*3 positions in "shape units" (fits a 2×2 box
// centred on 0, y up). The renderer places and scales them per viewport.

export type TargetName = 'field' | 'logo' | 'web' | 'growth' | 'network' | 'rings' | 'check' | 'steps';

const RES = 512; // raster resolution for sampling

/** Small seeded PRNG (mulberry32) so formations are identical on every load. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pull every path `d` and the viewBox out of an SVG string. */
export function parseSvg(svg: string) {
  const vb = /viewBox="([\d.\s-]+)"/.exec(svg)?.[1].trim().split(/\s+/).map(Number) ?? [0, 0, 100, 100];
  const paths = [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  return { viewBox: vb as [number, number, number, number], paths };
}

type Draw = (ctx: CanvasRenderingContext2D, s: number) => void;

/**
 * Rasterise a drawing and pick `count` points from its filled pixels.
 * Edge pixels are over-weighted so outlines read crisply.
 * `aspect` is width/height of the drawing area.
 */
function sample(draw: Draw, count: number, seed: number, aspect = 1, edgeShare = 0.4): Float32Array {
  const w = aspect >= 1 ? RES : Math.round(RES * aspect);
  const h = aspect >= 1 ? Math.round(RES / aspect) : RES;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#fff';
  draw(ctx, Math.min(w, h));
  const data = ctx.getImageData(0, 0, w, h).data;

  const filled = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] > 127;
  const edges: number[] = [];
  const inner: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!filled(x, y)) continue;
      const edge = !filled(x - 1, y) || !filled(x + 1, y) || !filled(x, y - 1) || !filled(x, y + 1);
      (edge ? edges : inner).push(x, y);
    }
  }
  if (!inner.length && !edges.length) return new Float32Array(count * 3);
  const r = rng(seed);
  const out = new Float32Array(count * 3);
  const scale = 2 / Math.max(w, h);
  for (let i = 0; i < count; i++) {
    const pool = (r() < edgeShare && edges.length) || !inner.length ? edges : inner;
    const k = Math.floor(r() * (pool.length / 2)) * 2;
    const px = pool[k] + r();
    const py = pool[k + 1] + r();
    out[i * 3] = (px - w / 2) * scale;
    out[i * 3 + 1] = -(py - h / 2) * scale;
    out[i * 3 + 2] = (r() - 0.5) * 0.08;
  }
  return out;
}

function field(count: number, seed: number): Float32Array {
  // A loose cloud filling the box, denser toward the middle.
  const r = rng(seed);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.pow(r(), 0.7);
    out[i * 3] = Math.cos(a) * d * 1.1 + (r() - 0.5) * 0.6;
    out[i * 3 + 1] = Math.sin(a) * d * 1.1 + (r() - 0.5) * 0.6;
    out[i * 3 + 2] = (r() - 0.5) * 0.6;
  }
  return out;
}

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rad: number) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, rad);
};

const drawings: Record<Exclude<TargetName, 'field' | 'logo'>, { aspect: number; draw: Draw }> = {
  // Websites: a browser window with a header bar, hero block and content rows.
  web: {
    aspect: 1.35,
    draw(ctx, s) {
      const W = s * 1.35, H = s;
      ctx.lineWidth = s * 0.022;
      roundRect(ctx, W * 0.04, H * 0.06, W * 0.92, H * 0.88, s * 0.04);
      ctx.stroke();
      ctx.fillRect(W * 0.04, H * 0.17, W * 0.92, s * 0.012);
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(W * (0.09 + i * 0.045), H * 0.115, s * 0.017, 0, Math.PI * 2);
        ctx.fill();
      }
      roundRect(ctx, W * 0.1, H * 0.26, W * 0.5, H * 0.07, s * 0.02); ctx.fill();
      roundRect(ctx, W * 0.1, H * 0.37, W * 0.36, H * 0.035, s * 0.015); ctx.fill();
      roundRect(ctx, W * 0.1, H * 0.44, W * 0.18, H * 0.06, s * 0.03); ctx.stroke();
      for (let i = 0; i < 3; i++) {
        roundRect(ctx, W * (0.1 + i * 0.28), H * 0.6, W * 0.24, H * 0.26, s * 0.02);
        ctx.stroke();
      }
    },
  },
  // Upgrade: rising bars with a trend line.
  growth: {
    aspect: 1.2,
    draw(ctx, s) {
      const W = s * 1.2, H = s;
      ctx.fillRect(W * 0.06, H * 0.9, W * 0.88, s * 0.015);
      const bars = [0.22, 0.34, 0.3, 0.48, 0.62, 0.78];
      bars.forEach((b, i) => {
        roundRect(ctx, W * (0.1 + i * 0.14), H * (0.9 - b), W * 0.08, H * b, s * 0.012);
        ctx.fill();
      });
      ctx.lineWidth = s * 0.02;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(W * 0.1, H * 0.55);
      ctx.bezierCurveTo(W * 0.4, H * 0.5, W * 0.6, H * 0.35, W * 0.9, H * 0.06);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W * 0.9, H * 0.06);
      ctx.lineTo(W * 0.82, H * 0.08);
      ctx.moveTo(W * 0.9, H * 0.06);
      ctx.lineTo(W * 0.885, H * 0.15);
      ctx.stroke();
    },
  },
  // Automate: a node graph — tools connected by workflows.
  network: {
    aspect: 1.2,
    draw(ctx, s) {
      const W = s * 1.2, H = s;
      const r = rng(7);
      const nodes: [number, number, number][] = [[0.5, 0.5, 0.075]];
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.3;
        nodes.push([0.5 + Math.cos(a) * 0.3, 0.5 + Math.sin(a) * 0.34, 0.04]);
      }
      for (let i = 0; i < 8; i++) {
        const a = r() * Math.PI * 2;
        const d = 0.4 + r() * 0.06;
        nodes.push([0.5 + Math.cos(a) * d, 0.5 + Math.sin(a) * d * 1.05, 0.02]);
      }
      ctx.lineWidth = s * 0.009;
      const link = (a: number, b: number) => {
        ctx.beginPath();
        ctx.moveTo(nodes[a][0] * W, nodes[a][1] * H);
        ctx.lineTo(nodes[b][0] * W, nodes[b][1] * H);
        ctx.stroke();
      };
      for (let i = 1; i <= 6; i++) { link(0, i); link(i, (i % 6) + 1); }
      for (let i = 7; i < nodes.length; i++) {
        let best = 1, bd = 9;
        for (let j = 1; j <= 6; j++) {
          const d = Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]);
          if (d < bd) { bd = d; best = j; }
        }
        link(i, best);
      }
      for (const [x, y, rad] of nodes) {
        ctx.beginPath();
        ctx.arc(x * W, y * H, rad * s, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  // Customization: concentric rings and a gauge arc — measured, tailored.
  rings: {
    aspect: 1,
    draw(ctx, s) {
      const c = s / 2;
      ctx.lineCap = 'round';
      [0.44, 0.33, 0.22].forEach((rad, i) => {
        ctx.lineWidth = s * (0.012 + i * 0.004);
        ctx.beginPath();
        ctx.arc(c, c, rad * s, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.lineWidth = s * 0.05;
      ctx.beginPath();
      ctx.arc(c, c, 0.385 * s, -Math.PI * 0.5, Math.PI * 0.95);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c, c, 0.075 * s, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        ctx.save();
        ctx.translate(c + Math.cos(a) * 0.47 * s, c + Math.sin(a) * 0.47 * s);
        ctx.rotate(a);
        ctx.fillRect(0, -s * 0.004, s * (i % 6 === 0 ? 0.03 : 0.015), s * 0.008);
        ctx.restore();
      }
    },
  },
  // Statement ("they do real work"): a check mark inside a ring — job done.
  check: {
    aspect: 1,
    draw(ctx, s) {
      const c = s / 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = s * 0.03;
      ctx.beginPath();
      ctx.arc(c, c, 0.42 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = s * 0.07;
      ctx.beginPath();
      ctx.moveTo(s * 0.3, s * 0.52);
      ctx.lineTo(s * 0.44, s * 0.66);
      ctx.lineTo(s * 0.71, s * 0.36);
      ctx.stroke();
    },
  },
  // Process: four steps joined by one path, the last one finished (filled).
  steps: {
    aspect: 0.75,
    draw(ctx, s) {
      const W = s * 0.75, H = s;
      const pts: [number, number][] = [[0.25, 0.1], [0.75, 0.37], [0.25, 0.63], [0.75, 0.9]];
      ctx.lineWidth = s * 0.022;
      ctx.lineCap = 'round';
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H)));
      ctx.stroke();
      pts.forEach(([x, y], i) => {
        ctx.beginPath();
        ctx.arc(x * W, y * H, s * 0.065, 0, Math.PI * 2);
        if (i === pts.length - 1) ctx.fill();
        else {
          ctx.lineWidth = s * 0.02;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x * W, y * H, s * 0.02, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    },
  },
};

export function buildTarget(name: TargetName, count: number, logoSvg: string): Float32Array {
  if (name === 'field') return field(count, 11);
  if (name === 'logo') {
    const { viewBox, paths } = parseSvg(logoSvg);
    const [, , vw, vh] = viewBox;
    const aspect = vw / vh;
    return sample(
      (ctx, s) => {
        const k = (s / Math.min(vw, vh)) * 0.94;
        const w = aspect >= 1 ? RES : RES * aspect;
        const h = aspect >= 1 ? RES / aspect : RES;
        ctx.translate((w - vw * k) / 2, (h - vh * k) / 2);
        ctx.scale(k, k);
        for (const d of paths) ctx.fill(new Path2D(d), 'evenodd');
      },
      count,
      23,
      aspect,
      0.45,
    );
  }
  const { aspect, draw } = drawings[name];
  return sample(draw, count, name.length * 101, aspect, 0.35);
}
