# S4: DNS cutover record (2026-11-19)

haki.tools is now served by CloudFront (`E1COPI53XVZT12`, `d1tthwo2n8li9y.cloudfront.net`) instead of the Contabo VPS (66.94.116.143).

## Preconditions (both met before the switch)
- Contact form end-to-end test passed through CloudFront, recorded on [PR #6](https://github.com/akoben-dev/haki-tools/pull/6#issuecomment-7026381319). SES identity `haki.tools`: verified, DKIM `SUCCESS`.
- Rehearsal with `curl --resolve haki.tools:443:<CloudFront IP>`: certificate (haki.tools + www, valid to 2027-06-03), www → apex 301, all pages, security headers. All passed.

## What changed at Namecheap (Advanced DNS), with Everett's OK
| Host | Before | After |
|---|---|---|
| `@` | A `66.94.116.143` (TTL 30 min) | ALIAS `d1tthwo2n8li9y.cloudfront.net` |
| `www` | CNAME `haki.tools.` | CNAME `d1tthwo2n8li9y.cloudfront.net.` |

Nothing else changed. Checked after the switch on `dns1.registrar-servers.com`: MX `1 smtp.google.com.`, SPF TXT, both `google-site-verification` TXTs, the Epic TXT (`f6a69ba0…`), both `_…acm-validations` CNAMEs and all three `…_domainkey` CNAMEs are as before.

## Verification after the switch (2026-11-20 00:30–00:41 UTC)
- **DNS:** apex resolves to CloudFront IPs (`3.168.86.x`, `server-…cloudfront.net`) on Namecheap's nameservers, 1.1.1.1 and 8.8.8.8; `www` → `d1tthwo2n8li9y.cloudfront.net.`
- **HTTPS and redirects:**
  - `http://haki.tools/` → 301 `https://haki.tools/`
  - `http://www.haki.tools/` → 301 https, then → 301 `https://haki.tools/`
  - `https://www.haki.tools/services/` → 301 `https://haki.tools/services/` (path kept)
- **Pages:** `/`, `/services/`, `/privacy/`, `/rvrmmo/privacy/`, `/contact/thanks/`, `/sitemap-index.xml`, `/robots.txt` → 200; unknown page → 404.
- **Security headers on `https://haki.tools/`:** `strict-transport-security: max-age=63072000`, `content-security-policy` (self only, `frame-ancestors 'none'`), `x-frame-options: DENY`, `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy`.
- **Contact form at https://haki.tools** (Lambda `haki-contact` log outcomes):
  - No-JS (form-encoded POST): 303 → `/contact/thanks/`, `sent`.
  - JS, typed in a real browser: token fetched on focus, success panel shown, `sent` / `token: ok`.
  - (A third, scripted fill sent with `token: missing`, as expected: the token is requested on `focusin`, which a scripted fill does not fire. The token is a spam filter, not a gate.)
- **Known follow-up:** no-JS messages have landed in Spam in testing. Fix: DMARC TXT and/or a custom MAIL FROM domain on the SES identity (S6 / optional step).

## Rollback
The VPS stays running for about a week after cutover (until about 2026-11-26), so rollback is one DNS edit:

1. Namecheap → Domain List → haki.tools **Manage** → **Advanced DNS**.
2. Delete the **ALIAS** record `@` → `d1tthwo2n8li9y.cloudfront.net`.
3. **Add New Record** → **A Record**, Host `@`, Value `66.94.116.143`, TTL 5 min → ✓.
4. Optional: set `www` CNAME back to `haki.tools.`. Not required: CloudFront serves www either way.

Visitors return to the old site within the TTL (minutes, up to ~30 for caches that saw the old 30-minute TTL). The contact form on the old site is the old one. After the VPS is shut down (S6), rollback is no longer possible, so only shut it down once Everett confirms the launch is good.
