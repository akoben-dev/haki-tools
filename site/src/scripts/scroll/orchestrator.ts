// Scroll orchestrator: the ONLY place that touches scrolling.
//   Lenis (inertial scroll) → ScrollTrigger.update  (one scroll source)
//   gsap.ticker → lenis.raf + every per-frame callback (one frame loop)
// Sections never listen to scroll themselves. They register ScrollTriggers
// through this module, and particle "stage" writers update scrollState.stage.
// A lint step (scripts/check-no-scroll-listeners.mjs) fails the build if any
// other file adds a scroll listener.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const scrollState = {
  /** Target particle stage; the renderer damps toward it. */
  stage: 0,
};

type FrameFn = (dt: number, time: number) => void;
const frameFns: FrameFn[] = [];
let lenis: Lenis | null = null;

export function startScroll(smooth: boolean) {
  if (smooth) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    // In-page anchor links scroll through Lenis so the timeline plays smoothly.
    document.addEventListener('click', (e) => {
      const a = (e.target as Element).closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a || a.pathname !== location.pathname || !a.hash) return;
      const el = document.querySelector(a.hash);
      if (!el) return;
      e.preventDefault();
      lenis!.scrollTo(el as HTMLElement, { offset: 0, duration: 1.6 });
      history.replaceState(null, '', a.hash);
    });
  }
  let last = performance.now() / 1000;
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
    const dt = Math.min(time - last, 0.1);
    last = time;
    for (const fn of frameFns) fn(dt, time);
  });
  gsap.ticker.lagSmoothing(0);
}

export function onFrame(fn: FrameFn) {
  frameFns.push(fn);
}

export interface StageWriter {
  trigger: Element;
  from: number;
  to: number;
  start?: string;
  end?: string;
}

const writers: ScrollTrigger[] = [];

/** Map a section's scroll range onto a particle stage range. */
export function stageWriter({ trigger, from, to, start = 'top bottom', end = 'bottom top' }: StageWriter) {
  const st = ScrollTrigger.create({
    trigger,
    start,
    end,
    onUpdate: (self) => (scrollState.stage = from + (to - from) * self.progress),
    onLeave: () => (scrollState.stage = to),
    onLeaveBack: () => (scrollState.stage = from),
  });
  writers.push(st);
  return st;
}

/** Writers inside a pinned/scrubbed animation call this from their onUpdate. */
export function writeStage(value: number) {
  scrollState.stage = value;
}

/** After layout settles, derive the correct stage for wherever the page was loaded. */
export function syncStage(initial: number) {
  // Re-order every trigger by its position on the page, so pin spacing is
  // accounted for and callbacks fire top-to-bottom on fast jumps.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  scrollState.stage = initial;
  const sorted = [...writers].sort((a, b) => a.start - b.start);
  for (const st of sorted) {
    if (st.progress > 0) st.vars.onUpdate?.(st);
    if (st.progress >= 1) st.vars.onLeave?.(st);
  }
}

export { gsap, ScrollTrigger };
