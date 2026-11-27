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

/** Quiet section marks: parked beside the text (never behind it), softer than
 *  the lane formations, and hidden on phones where there's no free side. */
const mark = (target: TargetName, x: number, y: number, scale: number): Keyframe => ({
  target, x, y, scale, opacity: 0.55, disperse: 0.02,
  mobile: { x: 0, y: 0, scale: 0.5, opacity: 0 },
});

/** Home: field → logo (hero) → check (statement) → hidden (services intro) → lanes
 *  → hidden (why it matters) → steps (process) → hidden (FAQ) → logo (contact). */
export function homeKeyframes(lanes: TargetName[]) {
  const keyframes: Keyframe[] = [
    field(0.5, 0.5),
    { target: 'logo', x: 0.47, y: 0.02, scale: 0.6, opacity: 1, disperse: 0, mobile: { x: 0, y: 0.42, scale: 0.5, opacity: 0.9 } },
    mark('check', 0.55, 0, 0.42),
    field(0, 0.9), // hidden: services intro
    ...lanes.map(lane),
    field(0, 0.95), // hidden: why it matters (cards fill the width)
    mark('steps', 0.7, -0.05, 0.45),
    field(0, 0.95), // hidden: FAQ (text on both sides, no free spot)
    { target: 'logo', x: -0.42, y: 0.05, scale: 0.95, opacity: 0.16, disperse: 0.03, mobile: { x: 0, y: 0.1, scale: 0.7, opacity: 0.12 } },
  ];
  const statement = 2;
  const servicesBase = 4;
  const afterLanes = servicesBase + lanes.length - 1; // last lane stage
  return { keyframes, statement, servicesBase, afterLanes, process: afterLanes + 2, faq: afterLanes + 3, contact: keyframes.length - 1 };
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
