// Copy the RVRMMO privacy policy from the RVRMMO repo into public/ unchanged.
// Usage: npm run sync:rvrmmo  (or RVRMMO_DIR=/path/to/rvrmmo npm run sync:rvrmmo)
import { copyFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const repo = process.env.RVRMMO_DIR || join(homedir(), 'development', 'rvrmmo');
const src = join(repo, 'docs', 'release', 'rvrmmo-privacy.html');
const dest = join('public', 'rvrmmo', 'privacy', 'index.html');
if (!existsSync(src)) {
  console.error(`Not found: ${src}. Set RVRMMO_DIR to the RVRMMO checkout.`);
  process.exit(1);
}
copyFileSync(src, dest);
console.log(`Copied ${src} -> ${dest}`);
