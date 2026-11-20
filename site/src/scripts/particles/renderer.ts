// GPU particle renderer. One THREE.Points mesh; the vertex shader blends between
// two morph-target buffers (aFrom → aTo) by uMorph with a per-particle stagger,
// and adds noise drift whose strength rises mid-morph and settles at rest.
// The renderer never reads scroll: it is handed a float "stage" each frame by
// the scroll orchestrator (stage 2.4 = 40% of the way from keyframe 2 to 3).
import {
  AdditiveBlending,
  NormalBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';
import { buildTarget, rng, type TargetName } from './targets';

export interface Placement { x: number; y: number; scale: number; opacity: number }
export interface Keyframe extends Placement {
  target: TargetName;
  /** Extra noise at rest (0 = crisp formation, 1 = loose cloud). */
  disperse: number;
  /** Override used below the 900px breakpoint (stacked layout). */
  mobile?: Partial<Placement>;
}

const vertexShader = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec4 aSeed;
  uniform float uTime;
  uniform float uMorph;
  uniform float uDisperse;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  uniform float uPointerForce;
  varying float vAlpha;
  varying float vTint;

  void main() {
    // Staggered, eased progress: each particle leaves at a slightly different time.
    float stagger = 0.45;
    float t = clamp(uMorph * (1.0 + stagger) - aSeed.x * stagger, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vec3 p = mix(aFrom, aTo, t);

    // Mid-flight swirl: strongest halfway through a morph, zero when settled.
    float flight = sin(t * 3.14159265);
    float ang = aSeed.y * 6.2831853 + uTime * 0.35;
    p.xy += vec2(cos(ang), sin(ang)) * flight * (30.0 + aSeed.w * 110.0);

    // Ambient drift: layered sines with per-particle phase and speed.
    float ph = aSeed.z * 6.2831853;
    vec3 drift = vec3(
      sin(uTime * (0.35 + aSeed.y * 0.5) + ph),
      cos(uTime * (0.3 + aSeed.w * 0.45) + ph * 1.7),
      sin(uTime * 0.25 + ph * 0.6)
    );
    p += drift * (1.6 + uDisperse * 46.0 * (0.4 + aSeed.x));

    // Gentle push away from the pointer.
    vec2 d = p.xy - uPointer;
    float dist2 = dot(d, d);
    p.xy += normalize(d + 0.0001) * uPointerForce * 34.0 * exp(-dist2 / 9000.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed.z * 0.9);
    vAlpha = (0.35 + 0.65 * aSeed.w) * (1.0 - 0.35 * flight);
    vTint = aSeed.y;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHi;
  uniform float uHiFrom;
  uniform float uHiMix;
  uniform float uPremul;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vTint;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    vec3 col = mix(uColor, uHi, smoothstep(uHiFrom, 1.0, vTint) * uHiMix);
    float alpha = a * vAlpha * uOpacity;
    // Light themes: output premultiplied colour so soft edges don't wash out to white over the page.
    // Dots also need more opacity to read as colour (not grey) on a light page.
    if (uPremul > 0.5) {
      col = pow(col, vec3(1.0 / 2.2)); // uniforms arrive in linear space; show the true token colour
      alpha = min(1.0, alpha * 1.9); gl_FragColor = vec4(col * alpha, alpha); }
    else gl_FragColor = vec4(col, alpha);
  }
`;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

export class ParticleRenderer {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new OrthographicCamera(-1, 1, 1, -1, -1000, 1000);
  private geometry = new BufferGeometry();
  private material: ShaderMaterial;
  private shapes = new Map<TargetName, Float32Array>();
  private placed: Float32Array[] = [];
  private pair: [number, number] = [-1, -1];
  private w = 1;
  private h = 1;
  private pointer = new Vector2(1e5, 1e5);
  private pointerForce = 0;
  /** Stage currently drawn (damped toward the target stage). */
  displayStage: number;

  constructor(
    private canvas: HTMLCanvasElement,
    private keyframes: Keyframe[],
    private count: number,
    dpr: number,
    logoSvg: string,
    color: string,
    initialStage = 0,
  ) {
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setClearColor(0x000000, 0);

    for (const kf of keyframes) {
      if (!this.shapes.has(kf.target)) this.shapes.set(kf.target, buildTarget(kf.target, count, logoSvg));
    }

    const seeds = new Float32Array(count * 4);
    const r = rng(99);
    for (let i = 0; i < seeds.length; i++) seeds[i] = r();
    this.geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
    this.geometry.setAttribute('aFrom', new BufferAttribute(new Float32Array(count * 3), 3));
    this.geometry.setAttribute('aTo', new BufferAttribute(new Float32Array(count * 3), 3));
    this.geometry.setAttribute('aSeed', new BufferAttribute(seeds, 4));

    this.material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uDisperse: { value: 0 },
        uSize: { value: count > 12000 ? 2.4 : 3.0 },
        uPixelRatio: { value: dpr },
        uColor: { value: new Color(color) },
        uHi: { value: new Color('#ffffff') },
        uHiFrom: { value: 0.75 },
        uHiMix: { value: 0.55 },
        uPremul: { value: 0 },
        uOpacity: { value: 1 },
        uPointer: { value: this.pointer },
        uPointerForce: { value: 0 },
      },
    });
    const points = new Points(this.geometry, this.material);
    points.frustumCulled = false;
    this.scene.add(points);

    this.displayStage = initialStage;
    this.resize();
  }

  /** Apply theme colours. Additive blending glows on dark pages; light pages need normal blending. */
  setTheme(color: string, hi: string, blend: string, hiShare = 0.25, hiMix = 0.55) {
    // hiShare: rough fraction of particles tinted toward `hi`; hiMix: how strongly.
    this.material.uniforms.uHiFrom.value = 1 - hiShare;
    this.material.uniforms.uHiMix.value = hiMix;
    this.material.uniforms.uColor.value.set(color);
    this.material.uniforms.uHi.value.set(hi);
    const normal = blend === 'normal';
    this.material.blending = normal ? NormalBlending : AdditiveBlending;
    this.material.premultipliedAlpha = normal;
    this.material.uniforms.uPremul.value = normal ? 1 : 0;
    this.material.needsUpdate = true;
  }

  /** Recompute pixel-space positions for every keyframe (on load and resize). */
  resize() {
    this.w = this.canvas.clientWidth || innerWidth;
    this.h = this.canvas.clientHeight || innerHeight;
    this.renderer.setSize(this.w, this.h, false);
    Object.assign(this.camera, { left: -this.w / 2, right: this.w / 2, top: this.h / 2, bottom: -this.h / 2 });
    this.camera.updateProjectionMatrix();

    const mobile = this.w < 900;
    const halfMin = Math.min(this.w, this.h) / 2;
    this.placed = this.keyframes.map((kf) => {
      const p = { ...kf, ...(mobile ? kf.mobile : {}) };
      const src = this.shapes.get(kf.target)!;
      const out = new Float32Array(src.length);
      const sx = kf.target === 'field' ? (this.w / 2) * p.scale : halfMin * p.scale;
      const sy = kf.target === 'field' ? (this.h / 2) * p.scale : halfMin * p.scale;
      const ox = p.x * (this.w / 2);
      const oy = p.y * (this.h / 2);
      for (let i = 0; i < src.length; i += 3) {
        out[i] = src[i] * sx + ox;
        out[i + 1] = src[i + 1] * sy + oy;
        out[i + 2] = src[i + 2] * halfMin;
      }
      return out;
    });
    this.pair = [-1, -1];
  }

  private usePair(a: number, b: number) {
    if (this.pair[0] === a && this.pair[1] === b) return;
    const from = this.geometry.getAttribute('aFrom') as BufferAttribute;
    const to = this.geometry.getAttribute('aTo') as BufferAttribute;
    (from.array as Float32Array).set(this.placed[a]);
    (to.array as Float32Array).set(this.placed[b]);
    from.needsUpdate = true;
    to.needsUpdate = true;
    this.pair = [a, b];
  }

  setPointer(x: number, y: number, active: boolean) {
    this.pointer.set(x - this.w / 2, this.h / 2 - y);
    this.pointerForce = active ? 1 : 0;
  }

  /** Halve the particle count (used when frames stay slow). */
  degrade() {
    this.geometry.setDrawRange(0, Math.floor(this.count / 2));
    this.renderer.setPixelRatio(1);
    this.material.uniforms.uPixelRatio.value = 1;
    this.material.uniforms.uSize.value *= 1.25;
    this.resize();
  }

  /** Advance one frame. `target` is the stage written by the scroll orchestrator. */
  frame(target: number, dt: number, time: number, rate: number) {
    const last = this.keyframes.length - 1;
    const goal = Math.min(Math.max(target, 0), last);
    this.displayStage += (goal - this.displayStage) * (1 - Math.exp(-rate * dt));
    if (Math.abs(goal - this.displayStage) < 1e-4) this.displayStage = goal;

    const s = this.displayStage;
    const i = Math.min(Math.floor(s), last - 1);
    const f = s - i;
    this.usePair(i, i + 1);

    const mobile = this.w < 900;
    const a = { ...this.keyframes[i], ...(mobile ? this.keyframes[i].mobile : {}) };
    const b = { ...this.keyframes[i + 1], ...(mobile ? this.keyframes[i + 1].mobile : {}) };
    const e = ease(f);
    const u = this.material.uniforms;
    u.uMorph.value = f;
    u.uTime.value = time;
    u.uOpacity.value = lerp(a.opacity, b.opacity, e);
    u.uDisperse.value = lerp(a.disperse, b.disperse, e);
    u.uPointerForce.value += (this.pointerForce - u.uPointerForce.value) * Math.min(1, dt * 4);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}
