# haki.tools website (rebuild)

The new Haki Tools site: Astro (static pages), Three.js particles that morph as you scroll, and GSAP ScrollTrigger + Lenis for the scroll feel. The plan and decisions behind it are in [`../docs/rebuild/`](../docs/rebuild/PLAN.md).

> Live at https://haki.tools since the DNS cutover on 2026-11-19 ([record](../docs/rebuild/CUTOVER.md)). Merges to `main` that touch `site/` deploy automatically.

## Local development

Needs Node 22.12 or newer (`.nvmrc` says 22).

```bash
cd site
npm install
npm run dev        # http://localhost:4321, hot reload
```

To see exactly what will be deployed:

```bash
npm run build      # writes dist/
npm run preview    # serves dist/ at http://localhost:4321 (real 404s, like CloudFront)
```

### Trying each motion tier

Add `?motion=` to any URL:

| URL | What you see |
|---|---|
| `/?motion=full` | Desktop experience: ~24k particles, pinned sideways services section |
| `/?motion=low` | Phones and low-power devices: ~9k particles, services stacked |
| `/?motion=reduced` | What visitors with "reduce motion" turned on get: no particles, native scroll |
| `/?motion=static` | No WebGL: the SVG logo instead of particles |

Without `?motion=`, the site picks the tier itself (see `src/scripts/capability.ts`).

## Editing content

All words on the site live in `src/content/`. Edit, save, and the dev server reloads. You don't need to touch any animation code.

| File | What it holds |
|---|---|
| `copy.json` | Section headings, intro text, buttons, contact-form messages. In the `statement`, wrap a word in `*asterisks*` to colour it mint. |
| `services/*.md` | One file per service lane: title, who it's for, bullets, the particle shape (`web`, `growth`, `network`, `rings`), and a longer paragraph for `/services` |
| `outcomes.json`, `process.json`, `faq.json` | The "why it matters" cards, process steps, and FAQ |

If a field is missing or misspelled, `npm run build` fails with a message naming the file and field.

Other settings:
- `src/config/site.ts`: site name, URL, navigation, fallback email.
- `src/config/particles.ts`: where each particle formation sits and how bright it is.
- `src/assets/brand/haki-mark.svg`: the logo. **The particles sample this file**, so replacing it with a new logo (same green) changes the particle logo too.
- `src/pages/privacy.astro`: the Haki Tools privacy policy.
- `public/rvrmmo/privacy/index.html`: the RVRMMO privacy policy, copied unchanged from the RVRMMO repo. Refresh it with `npm run sync:rvrmmo`.
- `npm run og` re-renders `public/og-image.png` (the social-share image) from the logo.

## Configuration

Copy `.env.example` to `.env` (never commit `.env`). There is one setting:

| Variable | Meaning |
|---|---|
| `PUBLIC_FORM_ENDPOINT` | Where the contact form posts. Default `/api/contact`, the AWS Lambda backend (slice S3). Until S3 is live, sending shows the error message with the email fallback. |

## Tests

```bash
npm test
```

This runs the scroll-listener guard, a production build, and the Playwright suite on a desktop and a phone viewport. The suite checks:
- every page and its canonical URL;
- a real 404;
- the sitemap and robots file;
- no sideways overflow;
- each motion tier, `prefers-reduced-motion`, no-WebGL and no-JavaScript fallbacks;
- the stage-by-stage particle morph;
- form validation, JSON and native (no-JS) submission, and the failure fallback;
- the mobile menu.

## How the motion is built

```
src/scripts/
  capability.ts          picks the tier (full / low / reduced / static)
  motion.ts              wires sections to the scroll timeline
  scroll/orchestrator.ts the ONLY scroll owner: Lenis → ScrollTrigger, one gsap.ticker loop
  particles/targets.ts   draws each formation on a canvas and samples points (logo from the SVG)
  particles/renderer.ts  Three.js Points + GLSL; blends between two formations by "stage"
```

Sections declare which particle stages they move between with `data-stage-from` / `data-stage-to` in the markup. `npm run check:scroll` fails if any file other than the orchestrator adds a scroll listener.

## Deploying

Not wired yet. Slice S2 adds Terraform in `infra/` (S3 + CloudFront + ACM in the `haki-tools` AWS account) and a GitHub Actions workflow: merging to `main` builds this folder and syncs `dist/` to S3. See [`../docs/rebuild/HOSTING-AND-COSTS.md`](../docs/rebuild/HOSTING-AND-COSTS.md).
