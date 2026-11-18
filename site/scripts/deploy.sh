#!/usr/bin/env bash
# Upload site/dist to the site bucket and refresh CloudFront.
# Used by .github/workflows/deploy.yml and for manual deploys:
#   SITE_BUCKET=… DISTRIBUTION_ID=… AWS_PROFILE=haki-tools ./scripts/deploy.sh
# Run `npm run build` first.
set -euo pipefail
: "${SITE_BUCKET:?set SITE_BUCKET}"
: "${DISTRIBUTION_ID:?set DISTRIBUTION_ID}"
cd "$(dirname "$0")/.."
[ -f dist/index.html ] || { echo "dist/ missing: run npm run build" >&2; exit 1; }

# Hashed build assets never change under the same name: cache for a year.
aws s3 sync dist/_astro "s3://$SITE_BUCKET/_astro" \
  --cache-control "public, max-age=31536000, immutable" --delete

# Everything else (HTML, favicon, robots, og-image…): always revalidate.
aws s3 sync dist "s3://$SITE_BUCKET" --exclude "_astro/*" \
  --cache-control "public, max-age=0, must-revalidate" --delete

id=$(aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths '/*' \
  --query Invalidation.Id --output text)
echo "Invalidation $id started for $DISTRIBUTION_ID"
