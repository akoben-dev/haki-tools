# infra: AWS hosting for haki.tools (slice S2)

Terraform for the static site in the `haki-tools` AWS member account (us-east-1).
Every resource here maps to an approved line in `docs/rebuild/HOSTING-AND-COSTS.md`.

| File | Lines | What |
|---|---|---|
| `versions.tf` | B1 | Provider and S3 backend with native locking (`use_lockfile`) |
| `site.tf` | B2, B6 | Private site bucket and the bucket policy that only CloudFront can use |
| `cdn.tf` | B3–B7 | Certificate, OAC, viewer-request function, security headers, distribution |
| `functions/viewer-request.js` | B5 | www → apex, `/path` → `/path/`, `/path/` → `/path/index.html` |
| `github.tf` | B9, B10 | GitHub OIDC provider and the `haki-github-deploy` role |

## One-time bootstrap (already done 2026-11-16)

The state bucket can't be created by the Terraform that stores state in it, so it was
made with the CLI: `haki-tools-tfstate-655385895055`, versioned, SSE-S3, Block Public
Access on.

## Using it

```bash
export AWS_PROFILE=haki-tools
cd infra
terraform init
terraform plan
terraform apply
```

New AWS accounts can't create CloudFront distributions until AWS Support verifies
the account (error "Your account must be verified before you can add new CloudFront
resources"). Open a free **Account and billing** support case, then re-run `apply`.

## Custom domain (before DNS cutover, S4)

1. `terraform output certificate_validation_records`, then add both CNAMEs at Namecheap
   (Host = the name without `.haki.tools.`). These are new records; nothing existing changes.
2. Wait for `aws acm describe-certificate … --query Certificate.Status` to say `ISSUED`.
3. `terraform apply -var custom_domain_enabled=true` attaches `haki.tools` and `www.haki.tools`.
4. S4 points the Namecheap apex and `www` at `terraform output cloudfront_domain`.

## Deploys

`.github/workflows/deploy.yml` runs on pushes to `main` that touch `site/`. It assumes
`haki-github-deploy` through OIDC and runs `site/scripts/deploy.sh`. It needs three
repository **variables** (not secrets; none of them are sensitive):

```bash
gh variable set AWS_DEPLOY_ROLE_ARN --body "$(terraform output -raw deploy_role_arn)"
gh variable set SITE_BUCKET --body "$(terraform output -raw site_bucket)"
gh variable set DISTRIBUTION_ID --body "$(terraform output -raw distribution_id)"
```

Until `AWS_DEPLOY_ROLE_ARN` is set, the workflow skips itself. A manual deploy from this Mac:

```bash
cd site && npm run build
SITE_BUCKET=… DISTRIBUTION_ID=… AWS_PROFILE=haki-tools ./scripts/deploy.sh
```

## Known limits

- `POST /api/contact` isn't routed yet (S3 adds API Gateway + Lambda). Until then the
  form shows its error state with the fallback email.
- CSP allows `'unsafe-inline'` scripts and styles because Astro inlines a few small ones.
