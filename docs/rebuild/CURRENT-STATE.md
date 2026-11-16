# Haki Tools site: current state (2026-11-15)

This is the record from the takeover from Perplexity Computer. It covers which copy is the real one, what the site does today, and the DNS records that must not change.

## 1. Which copy is current

| Copy | Contents | Verdict |
|---|---|---|
| Live site https://haki.tools (Contabo VPS, nginx 1.24, `Last-Modified: 2026-04-07 20:30 UTC`) | Every file served is byte-for-byte identical to GitHub `main` | **Current** |
| GitHub `akoben-dev/haki-tools` `main` @ `5ba93d8` (2026-04-07, "revertting back to a simpler site without the horizontal scroll") | The simpler single page | **Current** (same as live) |
| `~/development/haki-tools` (this checkout) | Same as `main`, clean working tree | **Current** |
| `~/development/haki-tools 2` (files dated 2026-04-04/05) | The horizontal-scroll build. Same as commit `c1c12d2` except `config/site.js` still has the placeholder Formspree endpoint | Older |
| `~/development/haki-tools-latest.zip` (2026-04-06) | Byte-identical to `haki-tools 2` | Older |

How it was checked: `diff -rq` between the folders and the unzipped archive; `git show <commit>:<file>` compared with each copy; every asset on the live site downloaded and compared with `cmp`.

Timeline: Jan 2026 Next.js start (commits `823c7ff`..`7af95d5`) → 2026-04-06 `c1c12d2` replaces it with the Perplexity static build (horizontal scroll) → 2026-04-07 `065c6cb` tweaks → 2026-04-07 `5ba93d8` removes the horizontal scroll (`js/horizontal.js` deleted). The live site has `/js/horizontal.js` → 404, which confirms it runs the reverted version.

None of the copies were deleted or changed.

## 2. What the current site is

- One page (`index.html`, about 38 KB) with these sections: hero, services, why it matters, process, FAQ, contact. Copy is **hard-coded in `index.html`**. `config/site.js` only feeds the form, despite what the README says.
- Hero: Three.js particle effect (`js/hero-particles.js`). Scroll animations: GSAP `@3` (unpinned major version from jsDelivr).
- Contact form: Formspree `https://formspree.io/f/maqlazjq`, notifications to `robbie.robinson@akoben.ai`.
- Problems found:
  - Canonical URL, `og:url` and JSON-LD all say `https://hakitools.com`, not `haki.tools`, so search engines are pointed at the wrong domain.
  - nginx serves `index.html` for every unknown path (SPA fallback). `/privacy`, `/robots.txt` and `/sitemap.xml` all return the homepage with status 200, so there is no real privacy page, robots file or sitemap.
  - `assets/logos/haki-tools-symbol.svg` and `haki-tools-wordmark.svg` are stand-ins Perplexity drew (teal `#4ECDC4`), not the brand. The real logo is `haki_tools_green.svg` / `favicon.svg` / `haki_tools_horizontal.svg` (`#9ee2bf`).

## 3. What Everett says did not work under Perplexity

All four: the contact form (no confidence that messages arrive), the horizontal scroll, the animations and particle hero, and extra pages / SEO.

## 4. Everett's decisions (2026-11-15)

| Question | Answer |
|---|---|
| Revamp direction | A new build to the **Rebuild Brief** (three decisions: offground-level scroll feel, scroll-driven particle morphing with the logo as the first target, stack chosen to serve both). Keep the logo, brand green and dark background. Pages: home, services, privacy, `/rvrmmo/privacy`, 404. |
| Content | After the build, a content pass so the copy matches what Everett and Claude can actually deliver with HCPM (AI production-readiness audits, remediation, automation, websites). |
| RVRMMO privacy URL | `https://haki.tools/rvrmmo/privacy` (source: `~/development/rvrmmo/docs/release/rvrmmo-privacy.html`) |
| Stack | Astro + Three.js + GSAP ScrollTrigger + Lenis |
| Form | AWS Lambda + SES, delivered to `robbie.robinson@akoben.ai` |
| IaC | Terraform |
| AWS account | New `haki-tools` member account in Everett's AWS Organization, set up from Claude's walkthrough (`AWS-ACCOUNT-SETUP.md`). Not the RVRMMO account. |
| Process | Plan first, stop for approval, then build. Every AWS resource and purchase is approved item by item (`HOSTING-AND-COSTS.md`). |

## 5. DNS baseline at Namecheap (dig, 2026-11-16 01:50 UTC)

Nameservers: `dns1/dns2.registrar-servers.com` (Namecheap BasicDNS).

| Name | Type | Value | Rule |
|---|---|---|---|
| `haki.tools` | A | `66.94.116.143` (Contabo VPS) | Changes only at cutover (becomes ALIAS → CloudFront) |
| `www.haki.tools` | CNAME | `haki.tools.` | Changes only at cutover |
| `haki.tools` | MX | `1 smtp.google.com.` | **Never touch** (Google Workspace mail) |
| `haki.tools` | TXT | `v=spf1 include:_spf.google.com ~all` | **Never touch** |
| `haki.tools` | TXT | `google-site-verification=o6aB7B1R…` | **Never touch** |
| `haki.tools` | TXT | `google-site-verification=TnB-ITQ6…` | **Never touch** |
| `haki.tools` | TXT | `f6a69ba0…69f17be` (Epic Games domain verification for RVRMMO) | **Never touch** |

The migration only **adds** records (an ACM validation CNAME and three SES DKIM CNAMEs) and, at cutover, changes the two web records above. Re-run `dig +short haki.tools TXT` and `dig +short haki.tools MX` after every DNS edit and compare with this table.
