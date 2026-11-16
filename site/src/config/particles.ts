// Particle keyframes per page. Each section in the markup maps its scroll range
// onto a stage range (data-stage-from / data-stage-to); stage N means "fully in
// keyframe N". x/y are fractions of the half-viewport (0 = centre, 1 = edge);
// scale is a fraction of half the shorter viewport side.
// Lane formations come from each service's `particle` field in src/content.
import type { Keyframe } from '../scripts/particles/renderer';
import type { TargetName } from '../scripts/particles/targets';

const field = (opacity: number, disperse: number): Keyframe => ({
  target: 'field', x: 0, y: 0, scale: 1.05, opacity, disperse,
});
const lane = (target: TargetName): Keyframe => ({
  target, x: 0.47, y: 0, scale: 0.6, opacity: 0.95, disperse: 0.02,
  mobile: { x: 0, y: 0.05, scale: 0.78, opacity: 0.28 },
});

/** Home: field → logo (hero) → cloud (statement) → lanes → cloud → logo (contact). */
export function homeKeyframes(lanes: TargetName[]) {
  const keyframes: Keyframe[] = [
    field(0.5, 0.5),
    { target: 'logo', x: 0.47, y: 0.02, scale: 0.6, opacity: 1, disperse: 0, mobile: { x: 0, y: 0.42, scale: 0.5, opacity: 0.9 } },
    field(0.24, 0.9),
    ...lanes.map(lane),
    field(0.2, 0.95),
    { target: 'logo', x: -0.42, y: 0.05, scale: 0.95, opacity: 0.16, disperse: 0.03, mobile: { x: 0, y: 0.1, scale: 0.7, opacity: 0.12 } },
  ];
  const servicesBase = 3;
  const afterLanes = servicesBase + lanes.length - 1; // last lane stage
  return { keyframes, servicesBase, afterLanes, contact: keyframes.length - 1 };
}

/** Services page: field → logo (hero) → one formation per lane → logo (call to action). */
export function servicesKeyframes(lanes: TargetName[]) {
  const keyframes: Keyframe[] = [
    field(0.5, 0.5),
    { target: 'logo', x: 0.5, y: 0, scale: 0.5, opacity: 1, disperse: 0, mobile: { x: 0, y: 0.45, scale: 0.42, opacity: 0.85 } },
    ...lanes.map(lane),
    { target: 'logo', x: 0.5, y: 0, scale: 0.45, opacity: 0.9, disperse: 0, mobile: { x: 0, y: 0.5, scale: 0.4, opacity: 0.35 } },
  ];
  return { keyframes, cta: keyframes.length - 1 };
}
