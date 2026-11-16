# Hosting plan and costs: approval sheet

**Rule:** Claude creates no AWS resource and makes no purchase until Everett approves that exact line in chat ("approve A1, A2, B1…"). The status column records each approval with its date.

Region: `us-east-1`. Prices are AWS list prices in USD, before tax, as of November 2026. Claude re-checks each one against the AWS pricing page at the moment of approval, and if a price has changed, it asks again.

**Free tier warning.** AWS pools free-tier allowances across all accounts in one Organization. The new `haki-tools` account shares them with the RVRMMO account. So every line shows two figures: the cost while the pooled free tier still covers it, and the worst case where RVRMMO has already used it up. The worst case assumes about 5,000 visits a month (about 15 GB transferred, about 200k requests) and 100 form messages a month.

## A. Account level (before slice S2)

| ID | Item | What it is / why | Monthly cost (free tier → worst case) | Status |
|---|---|---|---|---|
| A1 | AWS Organizations member account `haki-tools` | Keeps the consulting business's bills, permissions and blast radius apart from RVRMMO | $0 → $0 | Pending |
| A2 | IAM user `claude-haki-deployer` + access key in profile `haki-tools` (same pattern as `rvrmmo-s5`) | Lets Claude run Terraform and deploys from this Mac | $0 → $0 | Pending |
| A3 | AWS Budget "haki-tools-monthly" at $5 with email alerts at 50% / 100% / forecast 100% | Early warning on surprise spend | $0 (the first two budgets are free) → $0 | Pending |

## B. Static hosting (slice S2)

| ID | Item | What it is / why | Monthly cost (free tier → worst case) | Status |
|---|---|---|---|---|
| B1 | S3 bucket `haki-tools-tfstate-<account-id>` (versioned, encrypted, S3-native locking) | Terraform remembers what it built | <$0.01 → <$0.01 | Pending |
| B2 | S3 bucket `haki-tools-site-<account-id>` (private, Block Public Access on) | Holds the built site files (about 10 MB) | <$0.01 → $0.01 | Pending |
| B3 | CloudFront distribution (`haki.tools`, `www.haki.tools`, PriceClass_100, HTTP/3) | Global HTTPS delivery of the site | $0 (1 TB + 10M requests free) → about $1.50 (15 GB × $0.085 + 200k requests × $0.01/10k) | Pending |
| B4 | CloudFront Origin Access Control | Only CloudFront can read the bucket | $0 → $0 | Pending |
| B5 | CloudFront Function `haki-viewer-request` (www→apex redirect, `/path` → `/path/index.html`) | Clean URLs such as `/rvrmmo/privacy` | $0 (2M free) → about $0.02 | Pending |
| B6 | CloudFront cache policy + response-headers policy (HSTS, CSP, etc.) | Speed and security headers | $0 → $0 | Pending |
| B7 | ACM public certificate for `haki.tools` + `www.haki.tools` | The HTTPS certificate; renews automatically | $0 → $0 | Pending |
| B8 | CloudFront invalidations on deploy (`/*`) | Visitors see a new deploy at once | $0 (1,000 paths/month free) → $0 | Pending |

**Subtotal B:** $0 inside the free tier, about $1.55/month worst case.

## C. Contact form backend (slice S3)

| ID | Item | What it is / why | Monthly cost (free tier → worst case) | Status |
|---|---|---|---|---|
| C1 | SES domain identity `haki.tools` (Easy DKIM, 3 CNAMEs at Namecheap) + verified recipient `robbie.robinson@akoben.ai` | Sends form messages as `website@haki.tools`, signed so they don't land in spam | $0 → about $0.01 (100 emails × $0.10/1000) | Pending |
| C2 | API Gateway HTTP API `haki-contact` (route `POST /api/contact`, throttled 1 rps / burst 5) | Public entry point for the form, with rate limiting | $0 → <$0.01 ($1 per million) | Pending |
| C3 | Lambda `haki-contact` (Node.js 22, arm64, 128 MB) + its IAM role (SES send only) | Validates, filters spam, sends the email | $0 (1M requests free) → <$0.01 | Pending |
| C4 | CloudWatch Logs group for the Lambda, 30-day retention | Troubleshooting; metadata only, no message bodies | $0 (5 GB free) → <$0.01 | Pending |
| C5 | SSM Parameter Store `SecureString` `/haki/contact/hmac-key` (standard tier, AWS-managed key) | Secret that signs the anti-bot timestamp | $0 → $0 | Pending |
| C6 | CloudWatch alarm on Lambda errors + SNS topic emailing Everett | Tells you if the form breaks | $0 (10 alarms free) → $0.10 | Pending |

**Subtotal C:** $0 inside the free tier, about $0.12/month worst case.

## Totals

| Scenario | Monthly |
|---|---|
| Pooled free tier still available | **about $0.01** |
| Worst case (free tier used up by RVRMMO), about 5k visits / 100 messages | **about $1.70** |
| Today's Contabo VPS (for comparison) | whatever the Contabo invoice says; it keeps running until after cutover |

## Purchases

None needed. The domain is already registered at Namecheap; the planned font is open-source (SIL OFL); Route 53 is **not** used (DNS stays at Namecheap, which saves $0.50/month per hosted zone). If a purchase ever comes up (a paid font, a WAF), it gets its own line here and its own approval.

## Deliberately not included (and why)

| Item | Cost | Why not now |
|---|---|---|
| AWS WAF | about $6+/month | HTTP API throttling, the honeypot and the SES sandbox cap already limit abuse. Revisit if spam appears. |
| Route 53 hosted zone | $0.50/month | DNS stays at Namecheap, per the brief and the Epic/Google verification records |
| CloudFront flat-rate plan | varies | Check at S2 whether it beats pay-as-you-go; pay-as-you-go is assumed above |
