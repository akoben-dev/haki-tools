# haki.tools

Website for Haki Tools LLC (Maryland), served at https://haki.tools from AWS (S3 + CloudFront).

| Folder | What it is |
|---|---|
| [`site/`](site/README.md) | The website: Astro, Three.js particles, contact form UI. Start here to change copy or pages. |
| [`infra/`](infra/README.md) | Terraform for AWS: S3, CloudFront, ACM certificate, contact-form backend (HTTP API + Lambda + SES), GitHub deploy role. |
| [`docs/rebuild/`](docs/rebuild/PLAN.md) | The rebuild plan, cost approvals, DNS baseline and the [cutover record](docs/rebuild/CUTOVER.md). |

## How changes go live

1. Edit files under `site/` on a branch and open a pull request into `main`.
2. When it is merged, the **Deploy site** GitHub Action builds the site and uploads it to S3, then refreshes CloudFront. No server to log into.

Infrastructure changes (`infra/`) are applied by hand with `terraform plan` / `terraform apply` using the `haki-tools` AWS profile; see `infra/README.md`.

## Old site

The previous static site (root `index.html`, `css/`, `js/`, `config/`, `assets/`), served from a Contabo VPS, was removed after the cutover. It is still in git history before this change if anything needs to be looked up.
