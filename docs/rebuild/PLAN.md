# Haki Tools rebuild: plan (Step 1 of the Rebuild Brief)

Status: **approved by Everett 2026-11-15**; slice S1 in progress. No AWS resources created yet.
Related docs: [CURRENT-STATE.md](CURRENT-STATE.md) (which copy is current, decisions, DNS baseline), [HOSTING-AND-COSTS.md](HOSTING-AND-COSTS.md) (every AWS resource with its monthly cost, for item-by-item approval), [AWS-ACCOUNT-SETUP.md](AWS-ACCOUNT-SETUP.md) (click-by-click setup of the new member account).

---

## 1. Reference analysis: the techniques observed on offground.solutions

Observed on 2026-11-15 in a browser, from the page's behaviour and the names of the libraries and modules it loads. No code, text or images are copied.

| # | Technique | How it shows up | Why it feels "cinematic" |
|---|---|---|---|
| R1 | **Inertial smooth scroll** (Lenis; the `<html>` element carries the `lenis` class) | Wheel and trackpad input is eased into a damped scroll position | Every scroll-linked effect moves at the same easing, so nothing jitters |
| R2 | **One scroll clock** (GSAP ScrollTrigger fed by Lenis) | Section reveals, pins and WebGL state are all keyed to scroll progress, not timers | Scrolling backwards plays everything in reverse, so the page feels directed rather than animated |
| R3 | **Full-viewport WebGL particle hero** (Three.js `Points` + custom `ShaderMaterial`, additive blending, simplex-noise drift) | A dark field of soft glowing points that drifts at rest | Gives depth and "life" before any interaction |
| R4 | **Scroll-scrubbed morphing** (the hero module tracks `morphProgress` / `morphPhase` and lerps toward targets) | Particles flow from one formation into another as you scroll, then settle | The defining effect: the scroll bar becomes a timeline for the visuals |
| R5 | **Word-by-word text reveal over the particles** | A short statement builds up one word at a time with scroll; a key word is set in the accent colour | Copy and visuals advance together |
| R6 | **Pinned horizontal section with its own WebGL scene** (a services side-scroll over a node-and-line network) | Vertical scroll turns into sideways travel through service panels while the section stays pinned | Changes the rhythm halfway down the page |
| R7 | **Oversized display type with scale and opacity entrances**, plus a large cropped wordmark at the viewport edge | Headlines arrive big and slow | Editorial scale, high contrast |
| R8 | **Restrained palette**: near-black with a green/grey vignette, one accent colour | Dark base and light type | The glow of the particles carries the colour |
| R9 | Small UI chrome: fixed minimal header with one pill-shaped CTA | Header stays out of the way | Keeps the focus on the stage |

What we take: R1–R8 as **techniques**, at the same level of polish. What we do not take: their branding, copy, imagery, shaders or code, or distinctive brand devices such as their header clock.

## 2. Stack recommendation: the chosen stack, two alternatives considered, and the tradeoffs

**Chosen (approved 2026-11-15): Astro 5 + TypeScript, Three.js with custom GLSL shaders, GSAP 3 + ScrollTrigger, Lenis.** Exact versions are pinned in `package-lock.json` and the bundle is self-hosted (no CDN `@3` ranges as today).

| Choice | Serves | Why |
|---|---|---|
| **Astro (static output)** | Content layer, hosting, resilience | Every page is real HTML at build time, so content and forms work with no JavaScript, no WebGL and reduced motion (resilience). Content collections with a schema keep copy separate from motion code (content layer). Output is plain files for S3 + CloudFront (hosting). Multiple real pages: `/`, `/services`, `/privacy`, `/rvrmmo/privacy`, `404`. JS is shipped only to the "island" that needs it. |
| **Three.js + custom shaders** | Decision 2 | GPU `Points` whose vertex shader blends between morph-target position buffers. The CPU only updates a few uniforms per frame, so 20k+ particles run smoothly. |
| **GSAP ScrollTrigger** | Decision 1, scroll orchestration | Robust pinning, scrubbing and timeline nesting. It is the single source of scroll progress for both the DOM and WebGL. All GSAP plugins are free for commercial use. |
| **Lenis** | Decision 1 | The inertial scroll feel (R1). It drives `ScrollTrigger.update` and runs on GSAP's ticker, so there is exactly one frame loop. |

Alternatives considered:

| Alternative | Pros | Cons, and why not chosen |
|---|---|---|
| Vite + vanilla TS (single page) | Fewest dependencies; total control | Multi-page output, sitemap and a schema-checked content layer all have to be hand-built. Easier to slip back into the "copy hard-coded in index.html" problem we have today. |
| Next.js static export + React Three Fiber | Large ecosystem; declarative 3D | React runtime on every page for a mostly-static site; the R3F render loop and React state are a second scheduler competing with ScrollTrigger (against the brief's "no competing scroll handlers"); heavier pages hurt low-power devices. |

## 3. Architecture: a diagram plus a description of each required layer

```mermaid
flowchart TB
  subgraph Browser
    L[Lenis inertial scroll] -->|scroll event| ST[GSAP ScrollTrigger<br/>master timeline]
    GT[gsap.ticker - the only RAF loop] --> L
    GT --> R
    ST -->|scrubs| S[(scrollState<br/>morph, phase, section)]
    ST -->|reveals, pins| DOM[Section animations]
    S --> R[Particle renderer<br/>Three.js Points + GLSL]
    CAP[Capability probe<br/>WebGL / reduced-motion / power] --> R
    CAP --> L
    C[Content: Astro content collections<br/>src/content/*] -->|build time| HTML[Static HTML pages]
    HTML --> DOM
    F[Contact form<br/>progressive enhancement] -->|POST /api/contact| CF
  end
  subgraph AWS [AWS member account haki-tools, us-east-1]
    CF[CloudFront haki.tools<br/>ACM cert, security headers] -->|/*| S3[(S3 private bucket<br/>via OAC)]
    CF -->|/api/*| APIGW[API Gateway HTTP API<br/>throttled] --> LBD[Lambda contact handler] --> SES[SES haki.tools DKIM] --> IN[robbie.robinson@akoben.ai]
  end
  NC[Namecheap DNS<br/>apex ALIAS to CloudFront] -.-> CF
  TF[Terraform] -.defines.-> AWS
```

**Rendering layer (GPU particles).**
- `src/scripts/particles/`: a single `THREE.Points` mesh whose `BufferGeometry` carries one attribute per morph target (`aTargetA`, `aTargetB`, plus `aSeed` for per-particle randomness).
- The vertex shader mixes between targets with `uMorph` (0..1) and a per-particle stagger, then adds simplex-noise drift whose strength `uDisperse` rises between formations and falls as a formation "settles". Additive blending and soft round points in the fragment shader.
- **Morph targets are sampled from the logo SVG** (`assets/logos/haki_tools_green.svg`, the real gem mark). The path string is drawn into an offscreen canvas with `Path2D` at load time; filled pixels are sampled with a seeded RNG (density weighted toward edges so the outline reads crisply), then centred and scaled to the viewport.
- Target sequence (order is part of Decision 2; the logo comes first): `field` (ambient cloud) → **`logo`** (hero settles into the Haki gem as the first scroll beat) → `web` (browser-window frame, for websites) → `network` (nodes and links, for automation and AI workflows) → `audit` (concentric gauge rings, for readiness audits) → **`logo`** again at the contact section to close the loop. The non-logo targets are generated procedurally, so there are no external images.
- Only two target buffers are live at a time; when a phase completes, the next pair is swapped in, which keeps GPU memory flat.

**Scroll orchestration layer (one source of truth).**
- `src/scripts/scroll/orchestrator.ts` owns the only Lenis instance. `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add(t => lenis.raf(t * 1000))`; the particle renderer also renders from that same ticker. There is no `window.addEventListener('scroll')` anywhere (a lint rule enforces this).
- One master timeline per page. Each section registers its child timeline and its `particlePhase` with the orchestrator, which writes `scrollState.{phase, morph}`; the renderer reads `scrollState` every tick. DOM reveals (word-by-word text, display-type entrances, the pinned horizontal services track) are children of the same timeline.

**Content layer.**
- `src/content/home.md`, `services/*.md`, `faq.yaml`, `process.yaml` hold the copy, and `src/content/config.ts` declares their zod schemas. `src/config/site.ts` holds non-secret settings (name, URL, contact destination label), and `.env` holds build-time configuration (`PUBLIC_FORM_ENDPOINT`), documented in `.env.example`.
- Editing copy means editing Markdown or YAML; motion code reads only section IDs and phase names, never strings.

**Forms and workflows.** See section 5.

**Hosting.** See section 4.

**Resilience.**
- The capability probe runs before any motion code: `prefers-reduced-motion`, WebGL2/WebGL1 availability, and a power tier from `hardwareConcurrency`, `deviceMemory`, `navigator.connection.saveData` and a two-second frame-time sample.

| Situation | Behaviour |
|---|---|
| Full | Lenis + scrubbed morphs, about 24k particles, DPR capped at 2 |
| Low power | About 8k particles, DPR 1, no pinned horizontal section (stacks vertically), Lenis kept. Drops a tier automatically if frames stay over 28 ms. |
| Reduced motion | No Lenis (native scroll), no scrubbing, no pin. A static particle render of the logo (or the SVG itself), with fades only. |
| No WebGL / no JS | The static SVG logo in the hero; all content is plain HTML; the form posts natively and gets a `303` redirect to `/contact/thanks`. |

- The canvas is `aria-hidden`. All text is real DOM. Focus order and keyboard navigation are unaffected by pinning.

## 4. AWS deployment design: services, infrastructure-as-code tool, DNS and certificate approach

- **Account:** new AWS Organizations member account `haki-tools`, separate from RVRMMO. Region `us-east-1` (CloudFront certificates must live there anyway). CLI profile `haki-tools`. Setup steps: [AWS-ACCOUNT-SETUP.md](AWS-ACCOUNT-SETUP.md).
- **IaC:** Terraform 1.17 (installed), AWS provider pinned `~> 6.x`, in `infra/terraform/`. State lives in a versioned, encrypted S3 bucket with S3-native locking (`use_lockfile`), so no DynamoDB table is needed. The state bucket is created once by a tiny `bootstrap/` stack.
- **Static hosting:** private S3 bucket (Block Public Access on, SSE-S3) → CloudFront with Origin Access Control. No public bucket, no S3 website endpoint.
- **CloudFront:**
  - Alternate names `haki.tools` and `www.haki.tools`, HTTP/2 + HTTP/3, `PriceClass_100`.
  - A CloudFront Function (viewer-request) redirects `www` → apex with a 301 and maps `/rvrmmo/privacy` → `/rvrmmo/privacy/index.html`.
  - Custom error response: 404 → `/404.html` with status **404**, so there is no SPA fallback that hides missing pages.
  - Response headers policy: HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
  - Cache policy: hashed `/_astro/*` assets are immutable for one year; HTML is revalidated.
  - `/api/*` behaviour → API Gateway origin with caching disabled.
- **Certificate:** ACM public certificate for `haki.tools` + `www.haki.tools`, DNS validation. Terraform outputs the validation CNAME; Everett (or Claude, with Everett watching) adds it at Namecheap. ACM renews automatically as long as that CNAME stays.
- **DNS (stays at Namecheap):**
  - Before cutover, only additions: the ACM CNAME and three SES DKIM CNAMEs.
  - At cutover, the apex `A 66.94.116.143` becomes `ALIAS → dXXXX.cloudfront.net` (Namecheap supports ALIAS at the apex). The `www` CNAME (`haki.tools.`) can stay as it is, since it follows the apex.
  - MX, SPF, both `google-site-verification` TXT records and the Epic TXT record are never edited.
  - Rollback is to set the apex record back to `A 66.94.116.143`, because the VPS stays running.
- **Cutover runbook (slice S4):**
  1. Lower the apex TTL to 5 minutes a day ahead.
  2. Verify the CloudFront copy on its `*.cloudfront.net` name and with `curl --resolve haki.tools:443:<cloudfront-ip>`.
  3. Switch the apex record and re-check every DNS record against the baseline.
  4. Watch it for 48 hours.
  5. Keep the VPS live for at least 7 days. Shutting it down is a separate decision for Everett.
- **Deploys:** GitHub Actions (decided 2026-11-15). Each pull request runs a build check, and a merge to `main` that touches `site/` runs `npm run build`, then `aws s3 sync --delete`, then one CloudFront invalidation of `/*`. The workflow signs in through **GitHub OIDC**: a short-lived role limited to this repo's `main` branch, with no AWS keys stored in GitHub. The same commands can also run from the Mac with the `haki-tools` profile as a fallback.
- **Cost guardrail:** an AWS Budget at $5/month with email alerts (budgets are free).

Every resource and its monthly cost is listed in [HOSTING-AND-COSTS.md](HOSTING-AND-COSTS.md). **Nothing is created until Everett approves that exact line.**

## 5. Form delivery design

- **Path:** the browser posts to `https://haki.tools/api/contact` (same origin, so no CORS) → CloudFront `/api/*` → **API Gateway HTTP API** (route `POST /api/contact`, stage throttling of 1 request per second with a burst of 5) → **Lambda** (Node.js 22, arm64, 128 MB, 10 s timeout) → **SES** `SendEmail` from `website@haki.tools` (domain identity with Easy DKIM) to `robbie.robinson@akoben.ai`, with `Reply-To` set to the visitor so pressing Reply answers them directly.
- **Why HTTP API rather than a Lambda Function URL:**
  - It has built-in throttling, which new accounts cannot get from Lambda reserved concurrency.
  - A plain HTML `<form method="POST">` works with no JavaScript. A Function URL behind CloudFront OAC needs a SHA-256 body header that only JavaScript can add, which would break the no-JS fallback the brief requires.
  - Cost is $1 per million requests, which is effectively $0 here.
- **Why not Formspree:** the free tier is limited to 50 submissions a month, delivery is a black box (the reason for today's doubts), and Everett chose an AWS backend.
- **Validation and spam (in the Lambda; nothing trusted from the client):** required fields and length limits; email syntax; a hidden honeypot field; a minimum fill time (the form carries an HMAC-signed render timestamp, with the key in SSM Parameter Store `SecureString`, which is free); and a URL-count limit in the message. Bots get a silent `200` and no email.
- **Responses:**
  - JSON request (enhanced form): `200 {ok:true}`, or `400` with field errors shown inline.
  - Form-encoded request (no JS): `303` to `/contact/thanks` or `/contact/error`.
- **SES sandbox:** it is not a blocker. In the sandbox SES can send only to verified addresses, and our only recipient is `robbie.robinson@akoben.ai`, so Everett verifies it once by clicking the SES email link. No production-access request is needed. The sandbox's 200-a-day cap also limits worst-case abuse.
- **Observability:**
  - Lambda logs are kept for 30 days and contain metadata only (no message bodies).
  - One CloudWatch alarm on Lambda errors or SES send failures emails Everett through SNS (within free tiers).
- **Done when:** a real test submission from the deployed site arrives in the akoben.ai inbox (with JS and with JS disabled), and the result is recorded in the build summary.

## 6. Assumptions and open questions

**Assumptions** (Claude's choices where the brief is silent; change any of them):
- A1. Brand: the green (`#9ee2bf`, confirmed) stays exactly as it is, and so does the dark background. **The logo itself is open to a redesign** (Everett, 2026-11-15). Slice 1 builds with today's mark (`haki_tools_green.svg`). A logo exploration (slice S1b) proposes 3 directions in the same green; whichever is approved becomes the SVG the particles sample, with no code change, since the morph target is just a path. Today the site's `#86D4A3` and the logo file's `#9ee2bf` differ slightly; Q4 settles which one is "the" green.
- A2. Type: one self-hosted variable display face plus a system/UI sans for body text. No Google Fonts request, which also means no third-party call to mention in the privacy policy. The exact face is proposed in slice 1.
- A3. Pages: `/`, `/services`, `/privacy` (Haki Tools' own policy, needed because the form collects personal data), `/rvrmmo/privacy` (copied as-is from the RVRMMO repo with site chrome only), `/contact/thanks`, `/contact/error`, `404`, plus `robots.txt` and `sitemap.xml`. Canonical is `https://haki.tools`. No work or case-study page until there are real ones (the brief bans invented ones).
- A4. No analytics and no cookies, so no cookie banner. This can be revisited.
- A5. Repo layout during the transition: the new site lives in `site/` and Terraform in `infra/`. **The current root files (`index.html`, `css/`, `js/`, `config/`, `assets/`) stay untouched until cutover**, in case the VPS deploys from `main`, so merging rebuild PRs cannot change the live site. After cutover a cleanup PR removes them.
- A6. The content pass (aligning copy with HCPM: AI production-readiness audits, remediation, automation, websites) is its own slice after the build. Slice 1 ports today's business content as-is.

**Open questions for Everett:**
- Q1. ~~How does the VPS get new files today?~~ Answered 2026-11-15: Everett isn't sure, and wants to test locally and then serve from AWS, managed with Claude. So A5 stays: root files untouched until cutover.
- Q2. Haki Tools' own privacy policy needs facts only you know: how long you keep form emails, whether you use any CRM, and the business's legal name and mailing address (if you want one shown).
- Q3. ~~GitHub Actions or Mac deploys?~~ Answered 2026-11-15: **GitHub Actions with OIDC, built in S2** (cost lines B9–B10). Local testing stays `npm run dev` / `npm run preview`.
- Q4. ~~Which green?~~ Answered 2026-11-15: **`#9ee2bf`** (the logo file's mint) is the brand green for the logo, particles and UI accents.

## Slices

| Slice | What | Needs approval of |
|---|---|---|
| **S1** | Astro site in `site/`: content layer, every page with real HTML, particle engine with logo morph, scroll orchestrator, fallbacks, `/rvrmmo/privacy`, draft `/privacy`, 404, robots, sitemap. Verified locally on desktop and mobile viewports and on every fallback path. The form UI is built but not wired to a live endpoint. | This plan |
| S1b | Logo exploration: 3 redrawn marks in the same green, as SVG, shown as particles and flat. The approved one replaces the morph target and favicon. | The chosen mark |
| S2 | AWS account + Terraform: state, S3, CloudFront, ACM, function, headers, budget. Site served on the `cloudfront.net` name. | Cost lines A1–A3, B1–B10 |
| S3 | Contact backend: HTTP API + Lambda + SES + alarm. Real test submissions. | Cost lines C1–C6 |
| S4 | DNS cutover at Namecheap (apex ALIAS); VPS stays as fallback | The cutover moment |
| S5 | Content pass aligned with HCPM | The copy |
| S6 | Remove old root files; VPS retirement | Each separately |
