// Capability probe: runs before any motion code and picks one of four tiers.
//   full    – Lenis + scrubbed morphs, ~24k particles, pinned horizontal services
//   low     – ~9k particles, DPR 1, services stack vertically (no pin)
//   reduced – prefers-reduced-motion: native scroll, no WebGL, fades only
//   static  – no WebGL (or WebGL failed): SVG logo, native scroll, fades only
// Override for testing: ?motion=full|low|reduced|static
export type MotionTier = 'full' | 'low' | 'reduced' | 'static';

export interface Capabilities {
  tier: MotionTier;
  particles: number;
  dpr: number;
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function probe(): Capabilities {
  const override = new URLSearchParams(location.search).get('motion') as MotionTier | null;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

  let tier: MotionTier;
  if (override && ['full', 'low', 'reduced', 'static'].includes(override)) {
    tier = override;
  } else if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tier = 'reduced';
  } else if (!hasWebGL()) {
    tier = 'static';
  } else {
    const weakCpu = (nav.hardwareConcurrency ?? 8) <= 4;
    const weakMem = (nav.deviceMemory ?? 8) <= 4;
    const saveData = !!nav.connection?.saveData;
    const smallTouch = matchMedia('(pointer: coarse)').matches && innerWidth < 900;
    tier = weakCpu || weakMem || saveData || smallTouch ? 'low' : 'full';
  }
  if ((tier === 'full' || tier === 'low') && !hasWebGL()) tier = 'static';

  return {
    tier,
    particles: tier === 'full' ? 24000 : 9000,
    dpr: tier === 'full' ? Math.min(devicePixelRatio || 1, 2) : 1,
  };
}
