// Motion entry point. Picks a tier, then wires every scroll-driven effect
// through the orchestrator. Content never depends on this file: with no JS,
// reduced motion or no WebGL, every page is fully readable and usable.
import { probe } from './capability';
import {
  gsap,
  ScrollTrigger,
  onFrame,
  scrollState,
  stageWriter,
  startScroll,
  syncStage,
  writeStage,
} from './scroll/orchestrator';
import logoSvg from '../assets/brand/haki-mark.svg?raw';
import type { Keyframe } from './particles/renderer';

const root = document.documentElement;
const caps = probe();
root.dataset.motion = caps.tier;
const animated = caps.tier === 'full' || caps.tier === 'low';

startScroll(animated);
if (animated) void setup();

async function setup() {
  const canvas = document.querySelector<HTMLCanvasElement>('#particles');
  const keyframes: Keyframe[] = canvas ? JSON.parse(canvas.dataset.keyframes || '[]') : [];
  const initialStage = Number(canvas?.dataset.initial ?? 1);

  // The pinned services track goes first: pins add scroll space, and triggers
  // further down the page must be measured after it (see also syncStage → sort).
  servicesTrack();
  heroIntro();
  headerState();
  reveals();
  wordReveals();
  progressLines();

  // Particle stage writers declared in markup: data-stage-from / data-stage-to.
  document.querySelectorAll<HTMLElement>('[data-stage-from]').forEach((el) =>
    stageWriter({
      trigger: el,
      from: Number(el.dataset.stageFrom),
      to: Number(el.dataset.stageTo),
      start: el.dataset.stageStart,
      end: el.dataset.stageEnd,
    }),
  );

  if (canvas && keyframes.length > 1) await particles(canvas, keyframes);
  syncStage(initialStage);
}

async function particles(canvas: HTMLCanvasElement, keyframes: Keyframe[]) {
  const { ParticleRenderer } = await import('./particles/renderer');
  let renderer: InstanceType<typeof ParticleRenderer>;
  try {
    renderer = new ParticleRenderer(canvas, keyframes, caps.particles, caps.dpr, logoSvg, '#9ee2bf', 0);
    // Read particle colours from the active theme's CSS tokens, and again whenever data-theme changes.
    const applyTheme = () => {
      const css = getComputedStyle(root);
      const tok = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
      renderer.setTheme(tok('--particle', '#9ee2bf'), tok('--particle-hi', '#ffffff'), tok('--particle-blend', 'additive'), Number(tok('--particle-hi-share', '0.25')), Number(tok('--particle-hi-mix', '0.55')));
    };
    applyTheme();
    new MutationObserver(applyTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  } catch {
    root.dataset.motion = 'static';
    return;
  }
  let alive = true;
  canvas.addEventListener('webglcontextlost', () => {
    alive = false;
    root.dataset.motion = 'static';
  });
  root.classList.add('particles-ready');
  // Read-only snapshot for automated tests and debugging.
  Object.defineProperty(window, '__hakiMotion', {
    get: () => ({ tier: root.dataset.motion, stage: scrollState.stage, display: renderer.displayStage }),
  });

  const t0 = performance.now() / 1000;
  let sampleTime = 0;
  let sampleFrames = 0;
  let degraded = caps.tier === 'low';
  onFrame((dt, time) => {
    if (!alive) return;
    const age = performance.now() / 1000 - t0;
    // Slow, cinematic settle for the opening morph; snappier afterwards.
    renderer.frame(scrollState.stage, dt, time, age < 2.8 ? 1.7 : 4.5);
    // Frame-time watchdog: if frames stay over ~28 ms, halve the particles once.
    if (!degraded && age > 3 && age < 8) {
      sampleTime += dt;
      sampleFrames++;
      if (sampleTime > 2) {
        if (sampleTime / sampleFrames > 0.028) {
          renderer.degrade();
          degraded = true;
        }
        sampleTime = sampleFrames = 0;
      }
    }
  });

  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => renderer.resize(), 150);
  });
  addEventListener('pointermove', (e) => renderer.setPointer(e.clientX, e.clientY, e.pointerType === 'mouse'));
  document.addEventListener('pointerleave', () => renderer.setPointer(0, 0, false));
}

/** Hero copy arrives on load, then drifts up and fades as you scroll away. */
function heroIntro() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const items = hero.querySelectorAll('[data-hero-item]');
  gsap.from(items, { y: 40, autoAlpha: 0, duration: 1.4, ease: 'expo.out', stagger: 0.12, delay: 0.25 });
  gsap.to(hero.querySelectorAll('[data-hero-copy], .scroll-cue'), {
    yPercent: -18,
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 20%', scrub: true },
  });
}

/** Header gains a backdrop once the page has scrolled past the top. */
function headerState() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  root.classList.add('header-float');
  ScrollTrigger.create({
    start: 'top -40',
    end: 'max',
    onToggle: (self) => header.classList.toggle('is-scrolled', self.isActive),
  });
}

/** Scrubbed entrances: scrolling back plays them in reverse. */
function reveals() {
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    const display = el.dataset.reveal === 'display';
    gsap.fromTo(
      el,
      display ? { autoAlpha: 0, y: 70, scale: 0.94 } : { autoAlpha: 0, y: 44 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 94%', end: display ? 'top 55%' : 'top 70%', scrub: 0.6 },
      },
    );
  });
}

/** Statement text lights up one word at a time while its section is sticky. */
function wordReveals() {
  document.querySelectorAll<HTMLElement>('[data-words]').forEach((section) => {
    const words = section.querySelectorAll('.word');
    gsap.fromTo(
      words,
      { opacity: 0.12 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.5,
        // Finish while the text is still pinned: 'bottom 150%' leaves the last
        // half-screen of the sticky hold with every word lit, so smoothing
        // (Lenis + scrub lag) catches up before the section scrolls away.
        scrollTrigger: { trigger: section, start: 'top 60%', end: 'bottom 150%', scrub: 0.5 },
      },
    );
  });
}

function progressLines() {
  document.querySelectorAll<HTMLElement>('[data-progress-line]').forEach((line) => {
    gsap.fromTo(
      line,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: line.parentElement, start: 'top 70%', end: 'bottom 60%', scrub: true },
      },
    );
  });
}

/**
 * Services: on wide screens in the full tier, vertical scroll becomes sideways
 * travel through the lanes while the section is pinned, and each lane morphs
 * the particles into its own formation. Otherwise the lanes stack and each one
 * morphs as it reaches the middle of the screen.
 */
function servicesTrack() {
  const section = document.querySelector<HTMLElement>('[data-services]');
  const track = section?.querySelector<HTMLElement>('[data-track]');
  const intro = section?.querySelector<HTMLElement>('[data-services-intro]');
  if (!section || !track || !intro) return;
  const base = Number(section.dataset.stageBase); // stage of the first lane's formation
  const lanes = track.querySelectorAll<HTMLElement>('[data-lane]');
  const mm = gsap.matchMedia();

  mm.add(caps.tier === 'full' ? '(min-width: 900px)' : '(min-width: 99999px)', () => {
    root.classList.add('services-pinned');
    // The first formation assembles only as the first lane arrives, so the
    // intro text never has a half-formed cloud behind it.
    stageWriter({ trigger: intro, from: base - 1, to: base, start: 'bottom 70%', end: 'bottom top' });
    const n = lanes.length;
    const distance = () => track.scrollWidth - innerWidth;
    // Move, then hold, for each lane: the hold is scroll you spend with the
    // lane's text in place and its formation finished, so it's hard to skim past.
    const MOVE = 1;
    const HOLD = 1.2;
    let st: ScrollTrigger | undefined;
    const tl = gsap.timeline({
      defaults: { ease: 'power1.inOut' },
      onUpdate: () => {
        // Only while pinned: after a jump past the section the scrub keeps
        // catching up and must not overwrite later sections' stages.
        if (!st?.isActive) return;
        const d = distance();
        if (d > 0) writeStage(base + (-Number(gsap.getProperty(track, 'x')) / d) * (n - 1));
      },
    });
    tl.addLabel('lane0').to({}, { duration: HOLD });
    for (let i = 1; i < n; i++) {
      tl.to(track, { x: () => (-distance() * i) / (n - 1), duration: MOVE });
      tl.addLabel(`lane${i}`).to({}, { duration: HOLD });
    }
    st = ScrollTrigger.create({
      animation: tl,
      trigger: track,
      start: 'top top',
      // About 1.3 screens of scrolling per lane.
      end: () => '+=' + innerHeight * 1.3 * n,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      // Settle on a lane rather than resting between two.
      snap: { snapTo: 'labelsDirectional', duration: { min: 0.3, max: 0.9 }, delay: 0.12, ease: 'power2.inOut', inertia: false },
      onLeave: () => writeStage(base + n - 1),
      onLeaveBack: () => writeStage(base),
    });
    // Scroll position where each lane is settled (for tests).
    (window as any).__hakiLaneStops = () => Array.from(lanes, (_, i) => st!.labelToScroll(`lane${i}`) + innerHeight * 0.3);
    return () => root.classList.remove('services-pinned');
  });

  mm.add(caps.tier === 'full' ? '(max-width: 899px)' : 'all', () => {
    lanes.forEach((lane, i) =>
      stageWriter({ trigger: lane, from: base - 1 + i, to: base + i, start: 'top 85%', end: 'center 55%' }),
    );
  });
}
