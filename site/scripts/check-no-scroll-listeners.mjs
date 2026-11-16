// Guard for the brief's "single source of scroll progress": only the
// orchestrator may deal with scrolling. Fails if any other source file adds a
// scroll listener or onscroll handler.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const allowed = new Set(['src/scripts/scroll/orchestrator.ts']);
const bad = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|js|mjs|astro)$/.test(name) && !allowed.has(p)) {
      const src = readFileSync(p, 'utf8');
      if (/addEventListener\(\s*['"](scroll|wheel)['"]|\bonscroll\b|\bonwheel\b/.test(src)) bad.push(p);
    }
  }
};
walk('src');
if (bad.length) {
  console.error('Scroll listeners outside the orchestrator:\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log('OK: no scroll listeners outside src/scripts/scroll/orchestrator.ts');
